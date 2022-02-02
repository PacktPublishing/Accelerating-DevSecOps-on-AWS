process.env.NODE_ENV = "test"

const Student = require('../models').Student;
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp)

// testing /GET function
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

// testing /POST function
describe('/POST students', () => {
    it('it sould post the student info', (done) => {
        const student = {
            id: 1,
            firstname: "Tony",
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

// Testing /PUT/{id} function
describe('/PUT/:id student', () => {
    it("should update the student info", (done) => {
        const student = {
            firstname: "ironman",
            lastname: "marvels",
        }
        const Id = 1;
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
// Testing /DELETE/{id} function
describe('/DELETE/:id student', () => {
    it('it should DELETE the student recored given the id', (done) => {
        const student = {
            "id": 1
        }
         chai.request(app)
         .delete('/students/' + student.id)
         .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Post deleted successfully');
                done();
         });
    });
});
