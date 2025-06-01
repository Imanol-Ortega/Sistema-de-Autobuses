FROM node:18-alpine

WORKDIR /app_web

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
