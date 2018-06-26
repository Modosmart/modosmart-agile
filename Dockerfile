FROM resin/raspberrypi3-node:latest
MAINTAINER Mohamed ElSabagh
WORKDIR /usr/src/app

COPY package*.json ./
COPY index.js index.js
COPY build.sh build.sh
COPY start.sh start.sh

RUN npm install

# COPY . .

# Enable OpenRC
ENV INITSYSTEM on

# IP address of TCP server
ENV TCP_SERVER_IP 192.168.1.119
# Port of TCP server
ENV TCP_SERVER_PORT 3310
# IP address of host machine
ENV RESIN_HOST_IP 192.168.1.113

# replace this with your application's default port
EXPOSE 3030

# CMD [ "npm", "start" ]
CMD [ "bash", "/usr/src/app/start.sh" ]
