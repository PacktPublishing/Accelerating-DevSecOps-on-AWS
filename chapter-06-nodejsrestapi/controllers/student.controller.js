// function index(req,res){
//     const student = "Students List";
//     res.send(student);
// }

const models = require('../models')

// function to do the POST request and upload the student record

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

// function to get the student record by it's id
function showbyId(req, res){
    const id = req.params.id;

    models.Student.findByPk(id).then(result => {
        res.status(200).json(result);
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong"
        });
    });
}

//function to fetch all the student record
function showAll(req,res){
    models.Student.findAll().then(result => {
        res.status(200).json(result);
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong"
        });
    });
}
// function to update the student record by id

function update(req,res){
    const id = req.params.id;
    const updatedStudent = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        class: req.body.class,
        nationality: req.body.nationality
    }

    models.Student.update(updatedStudent, {where: {id:id}}).then(result => {
        res.status(200).json({
            message: "Post updated successfully",
            student: updatedStudent, id
            
        });
    }).catch(error => {
        res.status(400).json({
            message: "Something went Wrong",
            error: error
        });
    })
}
// function to delete the student record based on it's id
function destroy(req, res){
    const id = req.params.id;
    models.Student.destroy({where: {id:id}}).then(result => {
        res.status(200).json({
            message: "Post deleted successfully",
        });
    }).catch(error => {
        res.status(400).json({
            message: "something went wrong",
            error: error   
        });
    });
}

// exporting all the function so that, it can be used in routes

module.exports = {
    save: save,
    showbyId: showbyId,
    showAll: showAll,
    update: update,
    destroy: destroy
}
