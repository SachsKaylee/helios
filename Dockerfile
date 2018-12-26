# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:10
WORKDIR /usr/src/helios

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 80
EXPOSE 443
CMD [ "npm", "start" ]
