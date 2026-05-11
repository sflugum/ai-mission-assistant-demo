FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

# Dev: explicit install inside the Linux image — never relies on host `node_modules`.
FROM base AS dev
RUN apk add --no-cache curl
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Production dependencies only (needs lockfile; add `backend/package-lock.json` if `npm ci` fails).
FROM base AS prod-deps
RUN npm ci --omit=dev

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
