FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

CMD ["node", "black_magic.js"]
