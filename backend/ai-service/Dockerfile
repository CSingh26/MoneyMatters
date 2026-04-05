FROM node:20-slim AS builder

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY shared/package*.json ./shared/
RUN cd shared && npm install

COPY ai-service/package*.json ./ai-service/
RUN cd ai-service && npm install

COPY shared/ ./shared/
COPY ai-service/ ./ai-service/

RUN cd ai-service && npx prisma generate

FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/shared ./shared
COPY --from=builder /app/ai-service ./ai-service

WORKDIR /app/ai-service

EXPOSE 3004

CMD ["npx", "tsx", "src/index.ts"]
