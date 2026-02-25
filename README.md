# Shortack

Bus seat availability monitor – Phase 1 monorepo (Nx).

## Structure

```
shortack/
├── apps/web          # NextJS app with trip display
├── packages/
│   ├── monitor-core  # Types, slot diff, date utils
│   └── bus-provider  # Marshrutochka API client
└── nx.json
```

## Commands

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run dev server (NextJS)
npm run dev

# Run tests
npm run test
```

## Phase 1 Features

- Monorepo with Nx
- `@shortack/monitor-core`: types, slot diff, date utilities
- `@shortack/bus-provider`: Marshrutochka API (destinations, time slots)
- NextJS app with vertical slices (trips), container/presentational pattern
- Trip display: route selector (from/to), date picker, available time slots
- CSS modules + Radix UI
