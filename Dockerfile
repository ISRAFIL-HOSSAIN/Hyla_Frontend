FROM node:18.16

RUN mkdir /hyla_frontend

WORKDIR /Hyla_Frontend

COPY ./package.json /Hyla_Frontend

RUN yarn install 

COPY ./hyla_frontend

RUN yarn run build

CMD ["npm", "start"] -- node js 