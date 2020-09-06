FROM node:current-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm i

COPY . .

RUN npm run build

ENV NODE_ENV=production
ENV PORT=8080

CMD [ "npm","run","start:prod" ]