FROM resin/raspberrypi3-node:latest
MAINTAINER Mohamed ElSabagh
WORKDIR /usr/src/app

COPY package*.json ./
COPY index.js index.js

RUN npm install

COPY . .

CMD node index.js

# Enable OpenRC
ENV INITSYSTEM=on

# replace this with your application's default port
EXPOSE 3030
