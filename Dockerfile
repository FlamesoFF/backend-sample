FROM node:14.4 AS API

WORKDIR ./

COPY database/ ./database
COPY src/ ./src
COPY ssl/ ./ssl
COPY .npmrc .
COPY config-docker.json ./config.docker.json
COPY config.template.json ./config.template.json
COPY package.json .
COPY package-lock.json .
COPY README.md .
COPY tsconfig.json .
COPY init-pgsql.ts .
COPY gapi.credentials.json .

ENV NPM_TOKEN=8328c8d7-4309-4ae0-ba5c-99e97a2209cf

RUN npm install
RUN rm -f .npmrc
RUN npm run initialize-pgsql -- --config config.docker.json

CMD [ "npm", "run", "start-api-docker", "--", "--config", "config.docker.json" ]


FROM node:14.4 AS Synchronizer

WORKDIR ./

COPY src/ ./src
COPY ssl/ ./ssl
COPY .npmrc .
COPY config-docker.json ./config.docker.json
COPY config.template.json ./config.template.json
COPY package.json .
COPY package-lock.json .
COPY README.md .
COPY tsconfig.json .

ENV NPM_TOKEN=8328c8d7-4309-4ae0-ba5c-99e97a2209cf

RUN npm install
RUN rm -f .npmrc

CMD [ "npm", "run", "start-syncr-docker", "--", "--config", "config.docker.json" ]