# Shortack

Bus seat availability monitor – Nx monorepo (Phase 1 + Phase 2).

## Structure

```
shortack/
├── apps/web/              # NextJS app
│   ├── app/api/           # Bus proxy + monitors CRUD
│   ├── lib/               # Firestore client, bus-provider
│   └── workers/           # BullMQ monitor worker
├── packages/
│   ├── monitor-core       # Types, slot diff, date utils
│   └── queue              # BullMQ monitor:poll queue
├── nx.json
└── package.json
```

## Commands

```bash
npm install
npm run build
npm run dev          # NextJS dev server
npm run worker       # Monitor poll worker (Redis + Firestore required)
npm run test
```

## Environment

Copy `.env.example` to `.env.local` in `apps/web` (or set env in the shell):

- **REDIS_URL** – Redis for BullMQ (default `redis://localhost:6379`)
- **FIREBASE_PROJECT_ID** or **GOOGLE_APPLICATION_CREDENTIALS** – Firestore

For local Firestore: `FIRESTORE_EMULATOR_HOST=http://localhost:8080` and `FIREBASE_PROJECT_ID=shortack`.

## Phase 1

- Monorepo (Nx), `@shortack/monitor-core`, Marshrutochka in `lib/bus-provider`
- Trip display: route selector, date picker, available slots

## Phase 2

- **Firestore**: `monitors` collection (id, userId, busProvider, from, to, date, status, prevSlots, createdAt)
- **BullMQ**: `monitor:poll` queue; repeatable job every 20s per monitor
- **Monitor CRUD API**:
  - `POST /api/monitors` – body `{ userId, from, to, date }` → create monitor, enqueue poll job
  - `GET /api/monitors?userId=` – list monitors
  - `GET /api/monitors/[id]` – get one
  - `DELETE /api/monitors/[id]` – stop monitor (remove repeatable job, set status STOPPED)
- **Worker**: `npm run worker` in apps/web – processes poll jobs (fetch slots, diff, update prevSlots)
