FROM node:16-alpine AS builder

WORKDIR /src/pages/index

COPY package*.json ./
RUN npm install --force

COPY . .

WORKDIR /app

RUN npm run build  # Build the Next.js application (modified)



CMD [ "npm", "run", "start" ]  # Start the Next.js server
