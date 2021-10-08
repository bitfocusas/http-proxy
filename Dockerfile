FROM node:14.16-alpine
WORKDIR /src

#ENV PROXY_URL
#ENV HEALTH_URI
ENV CORS_DOMAIN=*

COPY package.json yarn.lock /src/

RUN yarn && yarn cache clean

COPY . /src/

CMD [ "node", "index.js" ]
