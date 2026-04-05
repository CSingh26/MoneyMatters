FROM node:20-slim AS builder

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY shared/package*.json ./shared/
RUN cd shared && npm install

COPY policy-service/package*.json ./policy-service/
RUN cd policy-service && npm install

COPY shared/ ./shared/
COPY policy-service/ ./policy-service/

RUN cd policy-service && npx prisma generate

FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/shared ./shared
COPY --from=builder /app/policy-service ./policy-service

WORKDIR /app/policy-service

RUN mkdir -p uploads

EXPOSE 3003

CMD ["npx", "tsx", "src/index.ts"]
