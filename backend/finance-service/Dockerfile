FROM node:20-slim AS builder

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY shared/package*.json ./shared/
RUN cd shared && npm install

COPY finance-service/package*.json ./finance-service/
RUN cd finance-service && npm install

COPY shared/ ./shared/
COPY finance-service/ ./finance-service/

RUN cd finance-service && DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/shared ./shared
COPY --from=builder /app/finance-service ./finance-service

WORKDIR /app/finance-service

EXPOSE 3002

CMD ["npx", "tsx", "src/index.ts"]
