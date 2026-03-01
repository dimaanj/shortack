import { NextRequest, NextResponse } from "next/server";
import { validateLoginWidgetPayload, telegramUserId } from "@/lib/telegram-auth";
import { createTelegramWidgetToken } from "@/lib/auth";

const REDIRECT_LOGIN = "/login";
const REDIRECT_LOGIN_ERROR = "/login";

/**
 * GET /api/auth/telegram/callback
 * Query: id, first_name, auth_date, hash, ... (Telegram Login Widget redirect)
 * On success: 302 to /login?telegram_token=JWT (client then calls signIn with token)
 * On error: 302 to /login?error=invalid_telegram_auth
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const user = validateLoginWidgetPayload(query);
  if (!user) {
    const loginUrl = new URL(REDIRECT_LOGIN_ERROR, url.origin);
    loginUrl.searchParams.set("error", "invalid_telegram_auth");
    return NextResponse.redirect(loginUrl);
  }

  const userId = telegramUserId(user.id);
  let token: string;
  try {
    token = await createTelegramWidgetToken(userId);
  } catch (e) {
    console.error("createTelegramWidgetToken error:", e);
    const loginUrl = new URL(REDIRECT_LOGIN_ERROR, url.origin);
    loginUrl.searchParams.set("error", "server_error");
    return NextResponse.redirect(loginUrl);
  }

  const loginUrl = new URL(REDIRECT_LOGIN, url.origin);
  loginUrl.searchParams.set("telegram_token", token);
  return NextResponse.redirect(loginUrl);
}
