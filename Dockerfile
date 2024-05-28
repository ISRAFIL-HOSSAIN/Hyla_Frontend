# Use an official Node runtime as a parent image
FROM node:14


# Set the working directory
WORKDIR /src/pages/index


# Install dependencies using Yarn
RUN yarn install

# Copy the rest of your application
COPY . .

# Build the application
RUN yarn build

# Expose the port your app runs on
EXPOSE 3000

# Start the Next.js application
CMD [ "yarn", "start" ]
