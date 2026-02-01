FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL and other dependencies for Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Install OpenSSL and other dependencies for Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies (including Prisma CLI for migrations)
RUN npm install --include=dev

# Copy Prisma schema and migrations
COPY --from=builder /app/prisma ./prisma

# Copy Prisma generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Run migrations and start server
# If migration fails because DB is not empty, mark it as applied and continue
CMD ["sh", "-c", "npx prisma migrate deploy || (echo 'Database not empty, marking migration as applied...' && npx prisma migrate resolve --applied 20241215000000_init 2>/dev/null || true); node dist/index.js"]
