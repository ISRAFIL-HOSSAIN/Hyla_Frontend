FROM node:16-alpine AS builder

WORKDIR /src/pages/index

COPY package*.json ./
RUN npm install

COPY . .

WORKDIR /app

RUN npm run build  # Build the Next.js application (modified)

EXPOSE 3000  # Expose port 3000 (default for Next.js)

CMD [ "npm", "run", "start" ]  # Start the Next.js server
