# Shortack

Bus seat availability monitor – Phase 1 monorepo (Nx).

## Structure

```
shortack/
├── apps/web          # NextJS app (trip display + Marshrutochka API in lib/bus-provider)
├── packages/
│   └── monitor-core  # Types, slot diff, date utils
├── nx.json           # Nx config with @nx/js and @nx/next plugins
└── package.json
```

Configuration is inferred by Nx plugins from `package.json` scripts and tool configs—no `project.json` files.

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
- Marshrutochka API client in `apps/web/lib/bus-provider` (destinations, time slots)
- NextJS app with vertical slices (trips), container/presentational pattern
- Trip display: route selector (from/to), date picker, available time slots
- CSS modules + Radix UI
