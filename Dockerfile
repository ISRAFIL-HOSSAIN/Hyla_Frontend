# Use an official Node runtime as a parent image
FROM node:14

# Install Yarn
RUN npm install -g yarn

# Set the working directory
WORKDIR /usr/src/app

# Copy the package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of your application
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to run your app
CMD [ "yarn", "start" ]
