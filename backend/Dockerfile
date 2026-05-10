FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS dev
RUN apk add --no-cache curl
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

FROM base AS prod-deps
RUN npm ci --omit=dev

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
