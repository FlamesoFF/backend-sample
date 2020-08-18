FROM node:14.7 AS API

WORKDIR ./

COPY database/ ./database
COPY src/ ./src
COPY ssl/ ./ssl
COPY .npmrc .
COPY config.docker.apollo.aws.instance.json ./config.docker.json
COPY config.template.json ./config.template.json
COPY package.json .
COPY yarn.lock .
COPY README.md .
COPY tsconfig.json .
COPY database/pgsql/init.ts .
COPY gapi.credentials.json .

ENV NPM_TOKEN=8328c8d7-4309-4ae0-ba5c-99e97a2209cf

RUN yarn
RUN rm -f .npmrc

CMD [ "npm", "run", "start-api", "--", "--config", "config.docker.json" ]


FROM node:14.7 AS Synchronizer

WORKDIR ./

COPY src/ ./src
COPY ssl/ ./ssl
COPY .npmrc .
COPY config.docker.apollo.aws.instance.json ./config.docker.json
COPY config.template.json ./config.template.json
COPY package.json .
COPY yarn.lock .
COPY README.md .
COPY tsconfig.json .

ENV NPM_TOKEN=8328c8d7-4309-4ae0-ba5c-99e97a2209cf

RUN yarn
RUN rm -f .npmrc

CMD [ "npm", "run", "start-syncr", "--", "--config", "config.docker.json" ]