# Аутентификация (Auth.js + Telegram + OAuth2 + Email)

Единая система входа для Shortack: одна сессия (JWT в cookie), один формат идентификатора пользователя (`userId`) во всех API.

## Содержание

| Документ | Описание |
|----------|----------|
| [Архитектура](./architecture.md) | Общая схема, компоненты, диаграммы |
| [Сценарии входа](./flows.md) | Подробные потоки: Mini App, Login Widget, Google, Email |
| [API и конфигурация](./api-and-config.md) | Эндпоинты, переменные окружения, защита API |

## Кратко

- **Auth.js (NextAuth v4)** — единый слой: сессия JWT (24 ч), страница входа `/login`, провайдеры.
- **Telegram (кастомный провайдер)** — два способа:
  - **Mini App**: клиент передаёт `initData` → проверка подписи → сессия.
  - **Login Widget (PWA)**: редирект с Telegram → callback проверяет hash → одноразовый JWT → редирект на `/login?telegram_token=...` → `signIn` создаёт сессию.
- **Google (OAuth2)** — опционально; Authorization Server — Google, приложение — OAuth2 client; в сессии `userId = google_<sub>`.
- **Email (magic link)** — опционально: токен в Firestore, письмо со ссылкой, переход по ссылке → `/login?email_token=...` → Credentials provider создаёт сессию; `userId = email_<hash>`.

Во всех случаях в сессии и в API используется один и тот же формат `userId` (`session.user.id`), что позволяет единообразно работать с коллекциями monitors и push_subscriptions.

## Роли в коде

| Компонент | Путь | Назначение |
|-----------|------|------------|
| Конфиг Auth.js | `apps/web/lib/auth.ts` | Провайдеры, callbacks, `createTelegramWidgetToken` |
| Валидация Telegram | `apps/web/lib/telegram-auth.ts` | `validateInitData`, `validateLoginWidgetPayload`, `telegramUserId` |
| Токены email | `apps/web/lib/firestore/authTokens.ts` | `createEmailToken`, `verifyEmailToken` |
| NextAuth route | `apps/web/app/api/auth/[...nextauth]/route.ts` | Обработка signIn/signOut/session |
| Callback Login Widget | `apps/web/app/api/auth/telegram/callback/route.ts` | Валидация hash → JWT → редирект на `/login` |
| Страница входа | `apps/web/app/(main)/login/page.tsx` | Виджет Telegram, Google, форма email, обработка `telegram_token` и `email_token` |
| Mini App layout | `apps/web/app/(tg)/layout.tsx` + `TgAuthProvider` | Загрузка initData → `signIn("telegram", { initData })` |

Далее: [Архитектура](./architecture.md) → [Сценарии входа](./flows.md) → [API и конфигурация](./api-and-config.md).
