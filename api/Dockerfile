FROM node:current-alpine AS pre-builder

WORKDIR /app

ENV VAULT_ADDR=""
ENV VAULT_TOKEN=""
ENV VAULT_PATH=""

RUN apk add python make gcc g++

ENV PORT=8080

COPY package.json package-lock.json nest-cli.json ./

RUN npm i
RUN npm i -g rimraf @nestjs/cli
RUN npm i -D tsconfig-paths

COPY src src
COPY scripts scripts
COPY tsconfig.build.json tsconfig.json ./

RUN npm run build

# Build for executable
RUN npm i -g nexe@latest
RUN nexe /app/dist/src/main.js -o /app/api

FROM scratch

COPY --from=builder /app/api /bin/api

CMD [ "/bin/api" ]
