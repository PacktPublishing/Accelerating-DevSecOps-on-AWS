FROM node:10
WORKDIR /application
COPY . /application
WORKDIR /application/nodejs-rest-student
RUN npm install -g sequelize-cli
RUN npm install
RUN npm run db:migrate
CMD npm start
EXPOSE 3000 3306
