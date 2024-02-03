# Use the official Node.js 16 image as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
# Note: You might need additional dependencies for puppeteer to run in a headless mode
RUN npm install
# If you are facing issues with puppeteer in Docker, you might need to install additional dependencies
RUN apt-get update && apt-get install -y \
       wget \
       ca-certificates \
       fonts-liberation \
       libappindicator3-1 \
       libasound2 \
       libatk-bridge2.0-0 \
       libatk1.0-0 \
       libcups2 \
       libdbus-1-3 \
       libgdk-pixbuf2.0-0 \
       libnspr4 \
       libnss3 \
       libx11-xcb1 \
       libxcomposite1 \
       libxdamage1 \
       libxrandr2 \
       xdg-utils \
       libpango-1.0-0 \
       libgbm-dev \
       libxss1 \
   && rm -rf /var/lib/apt/lists/*

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run your app using node
CMD [ "node", "index.js" ]
