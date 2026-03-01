# Build from repo root: docker build -f apps/web/Dockerfile .
# Multi-stage: deps + build from monorepo, then minimal runtime image
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/ apps/
COPY packages/ packages/
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app .
COPY . .
RUN npm run build -w @shortack/monitor-core && npm run build -w @shortack/queue && npm run build -w @shortack/web

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]