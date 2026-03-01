import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { validateInitData, telegramUserId } from "@/lib/telegram-auth";
import { encode, decode } from "next-auth/jwt";

const TELEGRAM_WIDGET_TOKEN_MAX_AGE_SEC = 300; // 5 min

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    id: "telegram",
    name: "Telegram",
    credentials: {
      initData: { label: "Init Data", type: "text" },
      telegramWidgetToken: { label: "Widget Token", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials) return null;
      const secret = process.env.AUTH_SECRET;
      if (!secret) return null;

      if (credentials.initData) {
        const result = validateInitData(credentials.initData);
        if (!result) return null;
        const userId = telegramUserId(result.user.id);
        return {
          id: userId,
          name: result.user.first_name,
          email: null,
          image: null,
        };
      }

      if (credentials.telegramWidgetToken) {
        try {
          const payload = await decode({
            token: credentials.telegramWidgetToken,
            secret,
          });
          if (!payload || typeof payload !== "object" || !payload.sub) return null;
          const exp = (payload as { exp?: number }).exp;
          if (exp && exp < Date.now() / 1000) return null;
          const userId = payload.sub as string;
          if (!userId.startsWith("tg_")) return null;
          return {
            id: userId,
            name: "Telegram User",
            email: null,
            image: null,
          };
        } catch {
          return null;
        }
      }
      return null;
    },
  }),
  CredentialsProvider({
    id: "email",
    name: "Email",
    credentials: {
      emailToken: { label: "Email Token", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.emailToken) return null;
      const { verifyEmailToken } = await import("@/lib/firestore/authTokens");
      const userId = await verifyEmailToken(credentials.emailToken);
      if (!userId) return null;
      return {
        id: userId,
        name: null,
        email: null,
        image: null,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: false,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user?.id) {
        token.userId = user.id;
        token.sub = user.id;
      }
      if (account?.provider === "google" && token.sub) {
        token.userId = `google_${token.sub}`;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.userId as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 24 * 3600 },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
};

export async function createTelegramWidgetToken(userId: string): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET not set");
  return encode({
    token: {
      sub: userId,
      exp: Math.floor(Date.now() / 1000) + TELEGRAM_WIDGET_TOKEN_MAX_AGE_SEC,
    },
    secret,
    maxAge: TELEGRAM_WIDGET_TOKEN_MAX_AGE_SEC,
  });
}

/** Use in API routes: session?.user?.id (after getServerSession(authOptions)) is the unified userId. */
