FROM node:22-alpine3.19

WORKDIR /usr/src/app

COPY src/package*.json ./

RUN npm install --omit=optional && npm install -g nodemon && npm cache clean --force

COPY src ./

EXPOSE 3000

CMD sh -c "if [ \"$NODE_ENV\" = \"development\" ]; then nodemon app.js; else npm start; fi"