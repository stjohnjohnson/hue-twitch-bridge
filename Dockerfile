FROM node:18-alpine
WORKDIR /usr/src/app
RUN chown -R node:node /usr/src/app
USER node
COPY --chown=node:node package*.json ./
RUN npm install
COPY *.js .
CMD [ "npm", "start" ]