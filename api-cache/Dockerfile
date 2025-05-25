FROM node:20 


COPY package.json package-lock.json ./
COPY tsconfig.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]