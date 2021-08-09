FROM node:current-alpine

WORKDIR /app

COPY package.json .

RUN npm i

COPY . .

ENV PORT=8080
ENV NODE_ENV=production

RUN npm run build

COPY . .

CMD [ "npm","run","start:prod" ]
