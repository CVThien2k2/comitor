FROM node:22-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
RUN pnpm install --frozen-lockfile --ignore-scripts --filter web...

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY . .
RUN pnpm --filter @workspace/database build \
  && pnpm --filter @workspace/shared build \
  && pnpm --filter @workspace/ui build \
  && pnpm --filter web build

FROM gcr.io/distroless/nodejs22-debian12:nonroot AS web-runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=nonroot:nonroot /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nonroot:nonroot /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/apps/web/.next/static ./apps/web/.next/static
EXPOSE 3000
CMD ["apps/web/server.js"]
