import express from 'express';
import db from '../../db/sequelize/models';


const EmployeeRoute = express.Router();

EmployeeRoute
  .route('/')
  .get(getAllEmployees)
  .post(createEmployee);

function getAllEmployees(req, res, next) {
  return db.Employee.findAll({})
    .then(employees => {
      res.send(employees);
    })
    .catch(e => next(e));
}

function createEmployee(req, res, next) {
  return db.Employee.create(req.body)
    .then(employee => {
      res.send(employee);
    })
    .catch(e => next(e));
}

export {
  EmployeeRoute,
  getAllEmployees,
  createEmployee
}
