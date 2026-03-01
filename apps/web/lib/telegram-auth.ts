import { createHmac, createHash } from "crypto";

const AUTH_DATE_MAX_AGE_SEC = 24 * 3600; // 24 hours

export type InitDataUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
};

export type LoginWidgetUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
};

/**
 * Validates Telegram Mini App initData (from Telegram.WebApp.initData).
 * See: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * secret_key = HMAC-SHA256(key="WebAppData", message=bot_token)
 * hash = hex(HMAC-SHA256(secret_key, data_check_string))
 */
export function validateInitData(initData: string): { user: InitDataUser } | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !initData.trim()) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  const dataCheckParts: string[] = [];
  for (const key of [...params.keys()].sort()) {
    if (key === "hash") continue;
    dataCheckParts.push(`${key}=${params.get(key)}`);
  }
  const dataCheckString = dataCheckParts.join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(token).digest();
  const computedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) return null;

  const authDate = params.get("auth_date");
  if (!authDate) return null;
  const authDateNum = parseInt(authDate, 10);
  if (Number.isNaN(authDateNum) || Date.now() / 1000 - authDateNum > AUTH_DATE_MAX_AGE_SEC) {
    return null;
  }

  const userStr = params.get("user");
  if (!userStr) return null;
  let user: InitDataUser;
  try {
    user = JSON.parse(userStr) as InitDataUser;
  } catch {
    return null;
  }
  if (typeof user?.id !== "number" || typeof user?.first_name !== "string") {
    return null;
  }

  return { user };
}

/**
 * Validates Telegram Login Widget callback query params (redirect URL).
 * See: https://core.telegram.org/widgets/login#checking-authorization
 * secret_key = SHA256(bot_token); hash = hex(HMAC-SHA256(data_check_string, secret_key))
 */
export function validateLoginWidgetPayload(
  query: Record<string, string>
): LoginWidgetUser | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;

  const hash = query.hash;
  if (!hash) return null;

  const dataCheckParts: string[] = [];
  for (const key of Object.keys(query).sort()) {
    if (key === "hash") continue;
    dataCheckParts.push(`${key}=${query[key]}`);
  }
  const dataCheckString = dataCheckParts.join("\n");

  const secretKey = createHash("sha256").update(token).digest();
  const computedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) return null;

  const authDate = query.auth_date;
  const id = query.id;
  if (!authDate || !id) return null;
  const authDateNum = parseInt(authDate, 10);
  if (Number.isNaN(authDateNum) || Date.now() / 1000 - authDateNum > AUTH_DATE_MAX_AGE_SEC) {
    return null;
  }

  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum)) return null;
  const first_name = query.first_name ?? "";

  return {
    id: idNum,
    first_name,
    last_name: query.last_name || undefined,
    username: query.username || undefined,
    photo_url: query.photo_url || undefined,
    auth_date: authDateNum,
  };
}

/** Session userId format for Telegram users */
export function telegramUserId(telegramId: number): string {
  return `tg_${telegramId}`;
}
