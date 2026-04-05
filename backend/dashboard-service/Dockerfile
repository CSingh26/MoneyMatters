FROM node:20-slim AS builder

WORKDIR /app

COPY shared/package*.json ./shared/
RUN cd shared && npm install

COPY dashboard-service/package*.json ./dashboard-service/
RUN cd dashboard-service && npm install

COPY shared/ ./shared/
COPY dashboard-service/ ./dashboard-service/

FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/shared ./shared
COPY --from=builder /app/dashboard-service ./dashboard-service

WORKDIR /app/dashboard-service

EXPOSE 3005

CMD ["npx", "tsx", "src/index.ts"]
