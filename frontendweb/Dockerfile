FROM node:18-alpine

WORKDIR /app_web

COPY package*.json ./
RUN npm install

COPY . .


CMD ["npm", "run", "dev"]
