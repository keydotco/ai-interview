ARG NODE_VERSION=20.13

FROM node:${NODE_VERSION}-alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk --update upgrade && apk add ca-certificates jq bash

# Install app dependencies
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/

RUN npm clean-install

# Bundle app source
COPY src/ /usr/src/app/src

CMD [ "npm", "start" ]