# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:10
WORKDIR $HOME/helios
# Copy deps first
COPY package.json ./
RUN npm install

COPY . .

EXPOSE 80
EXPOSE 443
CMD [ "npm", "start" ]
