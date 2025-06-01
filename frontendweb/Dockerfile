FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ENV CHOKIDAR_USEPOLLING=true
EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]