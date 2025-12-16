# Use official Node.js runtime as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npm run prisma:generate

# Copy application code
COPY . .

# Build Next.js application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
