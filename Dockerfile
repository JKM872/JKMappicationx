# Use official Node.js LTS image
FROM node:20-alpine AS builder

# Install Python for twikit bridge
RUN apk add --no-cache python3 py3-pip

# Set working directory
WORKDIR /app

# Copy backend files
COPY backend/package*.json ./backend/
COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src
COPY backend/python ./backend/python

# Install Node.js dependencies
WORKDIR /app/backend
RUN npm ci --only=production

# Install Python dependencies
WORKDIR /app/backend/python
RUN pip3 install --no-cache-dir -r requirements.txt

# Build TypeScript
WORKDIR /app/backend
RUN npm run build

# Production image
FROM node:20-alpine

# Install Python runtime
RUN apk add --no-cache python3

# Set working directory
WORKDIR /app/backend

# Copy built artifacts
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/python ./python
COPY --from=builder /app/backend/package.json ./

# Copy Python packages
COPY --from=builder /usr/lib/python3.11 /usr/lib/python3.11

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start server
CMD ["node", "dist/server.js"]
