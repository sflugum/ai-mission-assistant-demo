# Monorepo: build with context = repository root (`docker compose` / `docker build -f backend/Dockerfile .`).
# Uses root package-lock.json + npm workspaces so hoisted deps resolve correctly.

FROM node:22-alpine AS base
WORKDIR /repo
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

FROM base AS dev
RUN apk add --no-cache curl
RUN npm ci
COPY backend ./backend
EXPOSE 3001
CMD ["npm", "run", "dev", "--workspace", "backend"]

FROM base AS prod-deps
RUN npm ci --omit=dev --workspace=backend
COPY backend ./backend

FROM node:22-alpine AS production
WORKDIR /repo/backend
ENV NODE_ENV=production
COPY --from=prod-deps /repo/node_modules /repo/node_modules
COPY --from=prod-deps /repo/backend /repo/backend
EXPOSE 3001
CMD ["node", "server.js"]
