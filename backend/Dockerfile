# Build stage: install dependencies separately
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first so Docker caches npm install between code edits
COPY package*.json ./

# Install prod dependencies only and wipe cache in the same layer
RUN npm install --omit=dev && npm cache clean --force

# Runtime stage: clean and hardened image
FROM node:20-alpine
WORKDIR /app

# Point npm cache to /tmp so it works with a read-only root filesystem
ENV NODE_ENV=production \
    PORT=3001 \
    NPM_CONFIG_CACHE=/tmp/.npm

# Run as a dedicated non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Copy dependencies and app code with proper user ownership
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE 3001
CMD ["npm", "start"]