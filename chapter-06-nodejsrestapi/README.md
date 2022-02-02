# nodejs-express-mysql
#### A simple CRUD implementation of REST API using Nodejs, Express, seqealize and Mysql. This repo also includes the test cases which is executed using Mocha and Chai and code coverage is taken care by nyc. This readme file is divided into four different section.
##### 1. Installation : Deploying the development version of api
##### 2. Developing API : To dive into the code blocks of api development
##### 3. Writing Test cases : Writing test cases and execute it
##### 4. Deploy Rest API using API Gateway
###### Note: The development of api had been done in CentOS7 and deployed using node:10 docker image backed by AWS RDS MYSQL and called via Postman. 

### Installation
1. Clone the repository ```https://github.com/nikitsrj/nodejs-rest-student.git``` and navigate to that directory
2. Create the Database in Mysql with the name  ``student_dev``.</br>
   ```$ mysql -u <username> -p <password> ``` </br>
   ```mysql> create DATABASE student_dev```</br>
   ```mysql> exit```</br>
 Note: Pls make sure the db user should have access to the database, incase you are using root user to create db and trying to use another db user for application.</br>
3. Modify the ```config/config.json``` file (Need to install ```jq``` and ```sponge``` incase it's not present in your OS, else you can manually modify the file as well) </br>
    ```$ jq '.development.username = "<dbuser>"' config/config.json  | sponge config/config.json ``` </br>
    ```$ jq '.development.password = "<dbpassword>"' config/config.json  | sponge config/config.json```</br>
    ```$ jq '.development.host = "<databasehost.rds.amazonaws.com>"' config/config.json  | sponge config/config.json```</br>
It is recommended to use any secret management like vault or cyberark for any secrets</br>
###### Incase you want to deploy it in docker image, then jump directly to step 7.
4. Install the necessary modules</br>
    ```$ npm install -g sequelize-cli```</br>
    ```$ npm install```</br>
5. Migrate the DB schema in RDS Mysql</br>
    ```$ npm run db:migrate```</br>
6. Now to deploy it into dev.</br>
    ```$ npm start```</br>
7. (Only for docker deployment)</br>
    ``` docker build -t nodejs-express-mysql:v1 .```</br>
    ``` docker run -d -p 80:3000 -p 3306:3306 --name nodejs-api-app nodejs-express-mysql:v1```</br>
#### API Endpoints </br>
1> **[GET]  /students**  (Fetch all the students record)</br>
     Incase you have ingested some data in the database during the development of code, then you will be able to see the students details like below</br>
     ![get/students](https://github.com/nikitsrj/nodejs-rest-student/blob/main/images/Screenshot_20201031_065113.png) </br>
     else you will be able to have **200 status OK** with output **[]**. 
###### You can use hostname or IP of server inplace of locahost.

2> **[POST] /students** (Upload the student record)</br>
     You need to pass json body with students details to push the data in database.
     ![post /students](https://github.com/nikitsrj/nodejs-rest-student/blob/main/images/Screenshot_20201101_144325.png)</br>
3> **[PUT] /students/{id}** (Update a student record based on the id)</br>
     You need to pass the parameter in json body which you want to update.
     ![put /students](https://github.com/nikitsrj/nodejs-rest-student/blob/main/images/Screenshot_20201101_155203.png)</br>
4> **[GET] /students/{id}** (Get student record by it's id)
     You need to pass the students id with URL.
     ![get/students](https://github.com/nikitsrj/nodejs-rest-student/blob/main/images/Screenshot_20201101_160400.png) </br>
5> **[DELETE] /students/{id}** (Delete the student record by it's id)
     You need to pass the student id with the URL
     ![delete /students](https://github.com/nikitsrj/nodejs-rest-student/blob/main/images/Screenshot_20201101_160704.png) </br>
     
### Developing API

1> **Creating Student Model for application**</br>
     We need to create model for our application, and for that we will be using sequelize module. we need to initialize the model structure in our project folder which will create 4 folder. ``/config``, ``/model``, ``/migration``, ``/seeders``. </br>
     ``` $ sequelize init```</br>
     After that, we need to create **Student** model for application and also mentions it's schema.</br>
     ``` $ sequelize  model:generate --name Student --attributes id:integer,firstname:string,lastname:string,class:string,nationality:string``` </br>
     This command will create the model file with migration file at model and migration folder respectively. Those file name are based on model name.</br>
     **Example of Model file** </br>

```models/student.js``` </br>    
```javascript
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    
    static associate(models) {
      
    }
  };
  Student.init({
    id: {
      type: DataTypes.INTEGER,   // YOU NEED TO MODIFY THIS BLOCK FROM DEFAULT AND MAKE id AS PRIMARY KEY
      primaryKey: true
    },
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    class: DataTypes.STRING,
    nationality: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Student',
  });
  return Student;
};
```
</br>

```migration/dateandtimestamp-create-student.js``` </br>
```javascript
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Students', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true        
      },
      firstname: {
        type: Sequelize.STRING
      },
      lastname: {
        type: Sequelize.STRING
      },
      class: {
        type: Sequelize.STRING
      },
      nationality: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Students');
  }
};
```
In migration, two fields are automatically added. Those are ```createdAt``` and ```updatedAt``` field.</br> Then we need to migrate model to database by just running the command ```sequelize db:migrate``` to create table at database and ORM mapping purpose.</br>

2> **Creating Controller for the rest api** </br>
For controller we have to create the ```controller``` folder to root of the application. In our case ```student.controller.js``` file is created. That controller control all the business logic of the application. We export the different function from controller file. </br>

#### For [POST] Api example code will be
```javascript
function save(req, res) {
    const student = {
        id: req.body.id,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        class: req.body.class,
        nationality: req.body.nationality
    }
    models.Student.create(student).then(result => {
        res.status(201).json({
            message: "Post Created successfully",
            student: result
        });
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong",
            error: error
            
        });        
    });
}
```
#### For [GET] Api example code will be
```javascript
function showAll(req,res){
    models.Student.findAll().then(result => {
        res.status(200).json(result);
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong"
        });
    });
}
```

3>**Creating Routes for API** </br>
For Api routing purpose I have added the ```students.js``` file to ```routes``` folder, and to routing the api the code will look something like this.
```javascript
const express = require('express');
const studentController = require('../controllers/student.controller');

const router = express.Router();
router.post("/", studentController.save);
router.get("/", studentController.showAll);     //WE ARE USING THE EXPORTED MODULE OF showAll CONTROLLER
router.get("/:id", studentController.showbyId);
router.put("/:id", studentController.update);
router.delete("/:id", studentController.destroy);
module.exports = router;
```

### Writing Test cases 

1. Create the folder ```test``` at root directory
2. Create the file named ```student.js``` inside ```test``` folder

For testing with ```Mocha``` and ```Chai``` we have just add the ```Mocha``` globally</br>
```npm install -g mocha```</br>
In ```student.js``` file we have to write script for api testing.</br>

For testing purpose we need to change Node js environment variable in ```student.js``` file</br>
```javascript
process.env.NODE_ENV = "test"
```
Then we need to add the model which will be use for testing</br>
```javascript
const Student = require('../models').Student;
```
Then add the ```chai``` and ```chai-http``` package for testing the api server. For testing with api server we need to add main `js` file ```app.js``` as server 
```javascript
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const server = require('../server');
const should = chai.should();
chai.use(chaiHttp)
```
**[GET] /students testing**</br>
```javascript
describe('/GET students', () => {
    it('it should Get all students', (done) => {
        chai.request(app)
        .get('/students')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            done();
        });
    });
});
```
**[POST] /students testing**</br>
```javascript
describe('/POST students', () => {
    it('it sould post the student info', (done) => {
        const student = {
            firstname: "ironman",
            lastname: "Stark",
            class: "PHD",
            nationality: "USA"
        };

        chai.request(app)
        .post('/students')
        .send(student)
        .end((err, res) => {
            res.should.have.status(201);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Post Created successfully');
            done();
        });
    });
});
```

**[PUT] /students/{id} Testing**</br>
```javascript
describe('/PUT/:id student', () => {
    it("should update the student info", (done) => {
        const student = {
            firstname: "Ironman",
            lastname: "Marvels",
        }
        const Id = 22420;
         chai.request(app)
         .put('/students/' + Id)
         .send(student)
         .end((err, res) => {
             res.should.have.status(200);
             res.body.should.be.a('object');
             res.body.should.have.property('message').eql('Post updated successfully');
             done();
         });
    });
});
```
#### Running Test cases
To do the unit testing, we need to create a separate DB and mention the details in test section of config/config.json file, so that while running test case, it should use test db. Once this step is done, then we need to create the table in test db by passing the environment.</br>
   ``` $ sequelize db:migrate --env=test```</br>
Then we also need to install ```nyc``` module (```npm install --save-dev nyc```) to get the code coverage.</br>
Now we need to run ```nyc mocha --exit``` , then we will get the test result as well code coverage report. </br>

```
> nodejs-rest-student@1.0.0 test /var/lib/jenkins/workspace/nodejs-rest-express-TEST
> nyc mocha --exit



  /GET students
Executing (default): SELECT `id`, `firstname`, `lastname`, `class`, `nationality`, `createdAt`, `updatedAt` FROM `Students` AS `Student`;
    ✓ it should Get all students (80ms)

  /POST students
Executing (default): INSERT INTO `Students` (`id`,`firstname`,`lastname`,`class`,`nationality`,`createdAt`,`updatedAt`) VALUES (?,?,?,?,?,?,?);
    ✓ it sould post the student info

  /PUT/:id student
Executing (default): UPDATE `Students` SET `firstname`=?,`lastname`=?,`updatedAt`=? WHERE `id` = ?
    ✓ should update the student info

  /DELETE/:id student
Executing (default): DELETE FROM `Students` WHERE `id` = '1'
    ✓ it should DELETE the student recored given the id


  4 passing (144ms)

--------------------------------------|---------|----------|---------|---------|-------------------
File                                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------------------|---------|----------|---------|---------|-------------------
All files                             |   86.57 |    66.67 |      65 |   86.57 |                   
 nodejs-rest-express-TEST             |     100 |      100 |     100 |     100 |                   
  app.js                              |     100 |      100 |     100 |     100 |                   
  server.js                           |     100 |      100 |     100 |     100 |                   
 nodejs-rest-express-TEST/controllers |   63.64 |      100 |   53.33 |   63.64 |                   
  student.controller.js               |   63.64 |      100 |   53.33 |   63.64 | 22-36,46,69,83    
 nodejs-rest-express-TEST/models      |   95.83 |    66.67 |     100 |   95.83 |                   
  index.js                            |      95 |    66.67 |     100 |      95 | 13                
  student.js                          |     100 |      100 |     100 |     100 |                   
 nodejs-rest-express-TEST/routes      |     100 |      100 |     100 |     100 |                   
  students.js                         |     100 |      100 |     100 |     100 |                   
--------------------------------------|---------|----------|---------|---------|-------------------
```
[Deploy Rest API using API Gateway with NLB via VPC Private Link](https://github.com/nikitsrj/nodejs-rest-student/blob/main/API-Gateway-NLB%20.pdf)




