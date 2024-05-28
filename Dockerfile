FROM node:18-alpine AS builder  # Use alpine base for smaller image size

WORKDIR /app

COPY package*.json ./
RUN npm install  # Install without --force

# Optional: If necessary, run npm install --force in a separate stage
FROM node:18-alpine AS installer

WORKDIR /app

COPY package*.json ./
RUN npm install --force

# Rest of the Dockerfile stages (copy build output, etc.)
