FROM node:20-slim AS builder

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy shared dependencies first
COPY shared/package*.json ./shared/
RUN cd shared && npm install

# Copy service dependencies
COPY auth-service/package*.json ./auth-service/
RUN cd auth-service && npm install

# Copy source code
COPY shared/ ./shared/
COPY auth-service/ ./auth-service/

# Generate Prisma client (dummy URL - only needed for client generation, not connection)
RUN cd auth-service && DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# --- Production stage ---
FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/shared ./shared
COPY --from=builder /app/auth-service ./auth-service

WORKDIR /app/auth-service

EXPOSE 3001

CMD ["npx", "tsx", "src/index.ts"]
