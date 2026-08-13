FROM node:24-alpine3.21


# Install g++ and python3
RUN apk add --no-cache g++ python3

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=3002

# Expose the port app runs on
EXPOSE 3002

# Start the application
CMD ["node", "index.js"]
