FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

ENV API_KEY="sothebys-proxy-server"

CMD ["node", "index.js"]
