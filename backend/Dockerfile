#multi lagi, install deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

#masuk production 
FROM node:20-alpine AS runtime
WORKDIR /app

RUN addgroup -S addgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY db ./db

ENV NODE_ENV=production
ENV PORT = 5000

EXPOSE 5000

USER appuser

HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "src/index.js"]