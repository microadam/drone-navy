FROM node:6.12.3-alpine

WORKDIR /app
COPY . .

RUN yarn

CMD /usr/local/bin/node /app/drone-navy.js