FROM node:22-alpine AS base
RUN corepack enable

# ---- deps ----
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/database/package.json ./packages/database/
RUN pnpm install --frozen-lockfile --ignore-scripts --filter backend...

# ---- builder ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY . .
RUN pnpm --filter @workspace/database build && pnpm --filter backend build

# ---- prod deps ----
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/database/package.json ./packages/database/
RUN pnpm install --frozen-lockfile --ignore-scripts --prod --filter backend... \
    && pnpm store prune \
    && rm -rf /app/node_modules/.pnpm/prisma@* \
    && rm -rf /app/node_modules/.pnpm/@prisma+studio-core@* \
    && rm -rf /app/node_modules/.pnpm/typescript@* \
    && rm -rf /app/node_modules/.pnpm/prettier@* \
    && rm -rf /app/node_modules/.pnpm/@types+node@* \
    && rm -rf /root/.local/share/pnpm/store /root/.cache /tmp/*

# ---- backend runner ----
FROM node:22-alpine AS backend-runner
WORKDIR /app
COPY --from=prod-deps /app/package.json ./package.json
COPY --from=prod-deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=prod-deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=prod-deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=prod-deps /app/packages/database/package.json ./packages/database/package.json
COPY --from=prod-deps /app/packages/database/node_modules ./packages/database/node_modules

COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/public ./apps/backend/public

RUN mkdir -p /app/node_modules/@workspace \
    && ln -sfn /app/packages/database /app/node_modules/@workspace/database \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 backend

USER backend
WORKDIR /app/apps/backend
EXPOSE 8000
CMD ["node", "dist/main"]
