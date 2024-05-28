# Use a multi-stage build for efficiency:
    FROM node:18-alpine AS builder

    WORKDIR /app
    COPY package*.json ./
    RUN npm install --production
    
    # Copy only necessary files for build, excluding .git:
    COPY --from=source . .[!/.git]  # Exclude .git directory
    
    RUN npm run build  # Build the production-ready Next.js app
    
    # Create a slimmer runtime image:
    FROM node:18-alpine AS runner
    
    # Copy only the built application and public directory:
    WORKDIR /app
    COPY --from=builder /app/.next /app/.next
    COPY --from=builder /app/public /app/public
    
    # Set a non-root user for security:
    RUN adduser --system --uid 1001 nextjsuser
    
    # Switch to the non-root user for process isolation:
    USER nextjsuser
    
    # Expose the port for container communication:
    EXPOSE 3000
    
    # Start the Next.js app in production mode:
    CMD ["npm", "start"]
    