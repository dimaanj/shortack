# BullMQ monitor worker. Build from repo root: docker build -f workers/Dockerfile .
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/
COPY packages/monitor-core/package.json packages/monitor-core/
COPY packages/queue/package.json packages/queue/
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build -w @shortack/monitor-core
RUN npm run build -w @shortack/queue

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web ./apps/web
COPY --from=builder /app/packages ./packages
COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/
COPY packages/monitor-core/package.json packages/monitor-core/
COPY packages/queue/package.json packages/queue/
# Worker entrypoint (uses tsx in dev; in prod run compiled or node with ts-node)
RUN npm install -g tsx
CMD ["tsx", "apps/web/workers/monitor-worker.ts"]