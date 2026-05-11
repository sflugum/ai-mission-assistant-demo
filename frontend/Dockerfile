# Monorepo: build with context = repository root (`docker compose` / `docker build -f frontend/Dockerfile .`).

FROM node:22-alpine AS base
WORKDIR /repo
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci

FROM base AS dev
COPY frontend ./frontend
EXPOSE 5173
CMD ["npm", "run", "dev", "--workspace", "frontend", "--", "--host", "0.0.0.0"]

FROM base AS builder
COPY frontend ./frontend
RUN npm run build --workspace=frontend

FROM nginx:1.27-alpine AS production
COPY --from=builder /repo/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
