FROM node:current-alpine AS builder

WORKDIR /app

RUN apk add python make gcc g++

COPY package.json package-lock.json nest-cli.json ./

RUN npm i
RUN npm i -g rimraf @nestjs/cli
RUN npm i -D tsconfig-paths

COPY src src
COPY tsconfig.build.json tsconfig.json ./

RUN npm run build

# Build for executable
RUN npm i -g nexe@latest
RUN nexe /app/dist/src/main.js -o /app/api

FROM scratch

ENV PORT=8080
ENV NODE_ENV="production"

COPY --from=builder /app/api /bin/api

CMD [ "/bin/api" ]
