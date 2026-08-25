# syntax=docker/dockerfile:1
#
# GreenTrustLens backend — production image for Northflank.
#
#   Build context: this directory (backend/)
#   Exposed port:  3000 (override with the PORT env var)
#   Health check:  GET /ok
#
# Debian slim rather than Alpine: pdf-parse pulls in @napi-rs/canvas, whose
# prebuilt binaries target glibc.

ARG NODE_VERSION=22

# ─── base ─────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app
# openssl + ca-certificates: TLS to Postgres and outbound HTTPS page scraping
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production

# ─── build: devDependencies, Prisma client generation, TypeScript compile ─────
FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY tsconfig.json prisma.config.mjs ./
COPY prisma ./prisma
COPY index.ts ./
# Generates ./generated/prisma (TypeScript sources), which tsc then compiles
# into dist/generated/prisma alongside dist/index.js.
RUN npx prisma generate && npx tsc

# ─── prod-deps: runtime dependencies only ─────────────────────────────────────
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ─── runtime ──────────────────────────────────────────────────────────────────
FROM base AS runtime

ENV PORT=3000 \
    HOST=0.0.0.0 \
    UPLOAD_DIR=/app/uploads

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# Schema, migrations and Prisma config ship with the image so that
# `npm run migrate:deploy` can run as a Northflank pre-deploy command.
COPY package.json prisma.config.mjs ./
COPY prisma ./prisma

# Only the upload directory needs to be writable by the unprivileged user.
# Mount a Northflank volume here — otherwise uploads vanish on redeploy.
RUN mkdir -p /app/uploads && chown node:node /app/uploads
VOLUME ["/app/uploads"]

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/ok').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
