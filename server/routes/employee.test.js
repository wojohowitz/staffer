import chai from 'chai';
let expect = chai.expect;
process.env.NODE_ENV = 'testing';
import * as EmployeeRouter from './employee';
import path from 'path';
import db from '../../db/sequelize/models';
import chaiThings from 'chai-things';

chai.use(chaiThings);

import supertest from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';

let app = express();
app.use(bodyParser.json());
app.use('/employees', EmployeeRouter.EmployeeRoute);


describe('Employees Route',function() {
  let employees = [
    {
      firstName: 'Bob',
      lastName: 'Dobbs',
      hireDate: '8/1/12',
    },
    {
      firstName: 'Johnny',
      lastName: 'Test',
      hireDate: '9/3/14'
    }
  ]
  afterEach(function() {
    return db.Employee.destroy({truncate: true});
  });
  describe('GET /employees', function(done) {
    before(function() {
      return Promise.all([employees.map(createUsers)])
      function createUsers(user) {
        return db.Employee.create(user)
      }
    });
    it('gets employees', function(done) {
      supertest(app)
        .get('/employees')
        .end((err, response) => {
          if(err || response.error) done(err || response.error);
          expect(response.body).to.have.length(2);
          expect(response.body).all.have.property('firstName');
          expect(response.body).all.have.property('lastName');
          expect(response.body).all.have.property('hireDate');
          expect(response.body).all.have.property('terminationDate');
          expect(response.body).all.have.property('supervisorId');
          done();
        });
    });
  });
  describe('POST /', function() {
    it('creates an employee', function(done) {
      supertest(app)
        .post('/employees')
        .send(employees[0])
        .end((err, response) => {
          if(err || response.error) done(err || response.error);
          db.Employee.findAndCount({})
            .then(result => {
              expect(result.count).to.equal(1);
              done();
            })
            .catch(done);
        });
    });
  });
});

