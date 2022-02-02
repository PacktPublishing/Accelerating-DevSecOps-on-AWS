const express = require('express');
const bodyparser = require('body-parser');
const app = express();
//importing the student route
const studentsRoute = require('./routes/students')
app.use(bodyparser.json());
// using StudentsRoute incase there is incoming traffic in /students
app.use("/students", studentsRoute);


module.exports = app
