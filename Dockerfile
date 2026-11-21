# Build stage
FROM node:24-slim AS build
WORKDIR /app
# better-sqlite3 compiles its C code when no prebuilt binary matches this Node version.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY web/package.json web/package-lock.json ./web/
RUN npm ci
RUN npm --prefix web ci
COPY . .
RUN npm run build
RUN npm prune --omit=dev

# Runtime stage
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules/
COPY --from=build /app/dist ./dist/
COPY --from=build /app/web/dist ./web/dist/
ENV DB_PATH=/data/media.db MEDIA_DIR=/media PORT=3000
RUN mkdir /data && chown node:node /data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + process.env.PORT + '/api/v1/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
CMD ["node", "dist/main.js"]
