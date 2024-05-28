FROM node:18.16

RUN mkdir /hyla_frontend

WORKDIR /Hyla_Frontend

COPY ./package.json /hyla_frontend

RUN npm install --force

COPY . /hyla_frontend

RUN npm run build

CMD ["npm", "start"] -- node js 