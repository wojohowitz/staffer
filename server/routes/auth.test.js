import { expect } from 'chai';
import * as AuthRouter from './auth';
process.env.NODE_ENV = 'testing';
import connectDb from '../../db/camo/db';
import { User, Auth } from '../../db/camo/models/user';
import jwt from 'jsonwebtoken';
import cfg from '../../config/siteConfig';
import url from 'url';
import nock from 'nock'
import supertest from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';

let app = express();
app.use(bodyParser.json());
app.use('/auth', AuthRouter.AuthRouter);

describe('/auth', function() {
  before(function(done) {
    connectDb();
    done();
  });
  describe('shared functions', function() {
    describe('#getUserEmailFromProfile', function() {
      it('gets the email from any profile object passed', function() {
        let testEmail = 'test@test.com';
        let tests = [{email: testEmail}, {emailAddress: testEmail}]
        tests.forEach(profile => {
          let testResponse = AuthRouter.getUserEmailFromProfile(profile);
          expect(testResponse).to.equal('test@test.com');
        });
      });
    });
    describe('#getUserLastNameFromProfile', function() {
      it('gets the lastName from any profile object passed', function() {
        let testLastName = 'test';
        let tests = [
          { last_name: testLastName },
          { lastName: testLastName },
          { family_name: testLastName }
        ]
        tests.forEach(profile => {
          let testResponse = AuthRouter.getUserLastNameFromProfile(profile);
          expect(testResponse).to.equal('test');
        });
      });
    });
    describe('#getUserFirstNameFromProfile', function() {
      it('gets the first name from any profile object passed', function() {
        let testFirstName = 'test';
        let tests = [
          { first_name: testFirstName },
          { firstName: testFirstName },
          { given_name: testFirstName }
        ]
        tests.forEach(profile => {
          let testResponse = AuthRouter.getUserFirstNameFromProfile(profile);
          expect(testResponse).to.equal('test');
        });
      });
    });
    describe('#createUser', function() {
      after(function(done) {
         User.deleteMany({}).then(function(num){
          done();
        });
      });
      it('creates a user based on the profile', function(done) {
        let testProfile = {
          first_name: 'Johnny',
          last_name: 'Test',
          email: 'test@test.com'
        };
        AuthRouter.createUser(testProfile, 'google')
          .then(user => {
            expect(user.firstName).to.equal('Johnny');
            expect(user.lastName).to.equal('Test');
            expect(user.email).to.equal('test@test.com');
            expect(user.auth).to.have.length(1);
            expect(user.auth[0].type).to.equal('google');
            expect(user.auth[0].profile).to.equal(testProfile);
            done();
          })
        .catch(err => done(err));
      });
    });
    describe('#getJwt', function() {
      it('creates a json web token with the given user objects _id as userId', function(done) {
        let testUser = { _id: 'test' };
        let generatedJwt = AuthRouter.getJwt(testUser);
        jwt.verify(generatedJwt, cfg.siteSecret, (err, payload) => {
          if(err) done(err);
          expect(payload.userId).to.equal(testUser._id);
          done();
        });
      });
    });
    describe('#addAuth', function() {
      let user;
      before(function(done) {
        let createdUser = User.create({
         firstName: 'Johnny',
         lastName: 'Test',
         email: 'jtest@test.com'
        });
        createdUser.save()
          .then(u => {
            user = u;
            done();
          })
          .catch(err => done(err));
      });
      after(function(done) {
        User.deleteMany({}).then((deleted) => {
          done();
        });
      });
      it('adds the auth profile to an existing user', function(done) {
        let profile = {
          first_name: 'Johnny',
          last_name: 'Test'
        }
        AuthRouter.addAuth(user, 'google', profile)
          .then(savedUser => {
            expect(savedUser._id).to.equal(user._id);
            expect(savedUser.auth).to.have.length(1);
            expect(savedUser.auth[0].type).to.equal('google');
            expect(savedUser.auth[0].profile).to.equal(profile);
            done();
          });
      });
    });
    describe('#getUser', function() {
      let user, userWithoutEmail;
      let authProfile = {
        first_name: 'Johnny',
        last_name: 'Test',
        email: 'jtest@test.com',
        ucid: 1
      }
      let authProfileWithoutEmail = {
        given_name: 'Johnny2',
        family_name: 'Test2',
        ucid: 2
      };
      beforeEach(function(done){
        let createdUser = User.create({
         firstName: 'Johnny',
         lastName: 'Test',
         email: 'jtest@test.com'
        });
        let createdUserWithoutEmail = User.create({
         firstName: 'Johnny2',
         lastName: 'Test2',
        });
        createdUser.auth.push(Auth.create({
          type: 'google',
          profile: authProfile
        }));
        createdUserWithoutEmail.auth.push(Auth.create({
          type: 'google',
          profile: authProfileWithoutEmail
        }));
        Promise.all([createdUser.save(), createdUserWithoutEmail.save()])
          .then(users => {
            [user, userWithoutEmail] = users;
            done();
          })
          .catch(err => done(err));
      });
      afterEach(function(done) {
        User.deleteMany({}).then((deleted) => {
          done();
        });
      });
      it('gets a user by the profile email', function(done) {
        AuthRouter.getUser('google', authProfile)
          .then(u => {
            expect(u.email).to.equal('jtest@test.com');
            done();
          })
          .catch(err => done(err));
      });
      it('gets a user by the profile', function(done) {
        AuthRouter.getUser('google', authProfileWithoutEmail)
          .then(u => {
            expect(u.firstName).to.equal('Johnny2');
            expect(u.lastName).to.equal('Test2');
            expect(u.email).to.be.null;
            done();
          })
        .catch(err => done(err));
      });
      it('adds auth profile to existing user if does not exist', function(done) {
        AuthRouter.getUser('facebook', authProfile)
          .then(u => {
            let authTypes = u.auth.map(a => a.type);
            expect(u.auth).to.have.length(2);
            expect(authTypes).to.include('google');
            expect(authTypes).to.include('facebook');
            done();
          })
          .catch(err => done(err));
      });
    });
  });
  describe('routes', function() {
    describe('POST /auth/google', function() {
      let getToken, getProfile, testUser;
      let tokenUrl = url.parse(cfg.auth.google.accessTokenUrl);
      let profileUrl = url.parse(cfg.auth.google.peopleApiUrl);
      beforeEach(function() {
        getToken = nock(`${tokenUrl.protocol}//${tokenUrl.host}`)
          .post(tokenUrl.path)
          .reply(200, 'a_token')
        User.create({
          firstName: 'Bob',
          lastName: 'Dobbs',
          email: 'bob@subgenious.org',
          auth: [
            Auth.create({
              type: 'facebook',
              profile: {
                first_name: 'Bob',
                last_name: 'Dobbs',
                email: 'bob@subgenious.org'
              }
            })
          ]
        })
        .save()
        .then(u => {
          testUser = u;
          done();
        })
        .catch(err => done(err));
      });
      afterEach(function(done) {
        User.deleteMany({}).then((deleted) => {
          done();
        });
      });
      it('creates an acount for the profile if it does not exist', function(done) {
        let googleProfile = {
          first_name: 'Johnny',
          last_name: 'Test',
          email: 'jtest@test.com'
        }
        getProfile = nock(`${profileUrl.protocol}//${profileUrl.host}`)
          .get(profileUrl.path)
          .reply(200, googleProfile)
        supertest(app)
          .post('/auth/google')
          .send({
            code: 'xyz',
            clientId: 'fakeClientId'
          })
          .set('Accept', 'application/json')
          .end((err, response) => {
            if(err) return done(err);
            User.count({})
              .then(confirmTwoUsers)
              .then(getNewUser)
            .then(newUser => {
              jwt.verify(response.body.token, cfg.siteSecret, (error, payload) => {
                expect(payload.userId).to.equal(newUser._id);
                done();
              });
            })
            .catch(e => done(e));
          });
        function getNewUser() {
          return User.findOne({email: googleProfile.email})
        }
        function confirmTwoUsers(userCount) {
          expect(userCount).to.equal(2);
        }
      });
      it('adds auth profile if user was found', function(done) {
        let googleProfile = {
          firstName: 'Bob',
          lastName: 'Dobbs',
          email: 'bob@subgenious.org',
        }
        getProfile = nock(`${profileUrl.protocol}//${profileUrl.host}`)
          .get(profileUrl.path)
          .reply(200, googleProfile)

        supertest(app)
          .post('/auth/google')
          .send({
            code: 'xyz',
            clientId: 'fakeClientId'
          })
          .set('Accept', 'application/json')
          .end((err, response) => {
            if(err) return done(err);
            User.count({})
              .then(confirmStillOneUser)
              .then(confirmTwoAuthTypes)
              .then(newUser => {
                jwt.verify(response.body.token, cfg.siteSecret, (error, payload) => {
                  expect(payload.userId).to.equal(testUser._id);
                  done();
                });
              })
            .catch(e => done(e));
          });
        function confirmStillOneUser(userCount) {
          expect(userCount).to.equal(1);
        }
        function confirmTwoAuthTypes() {
          return User.findOne({_id: testUser._id})
            .then(user => {
              let authTypes = user.auth.map(a => a.type);
              expect(user.auth).to.have.length(2);
              expect(authTypes).to.include('google');
              expect(authTypes).to.include('facebook');
            })
        }
      });
    });
    describe('POST /auth/facebook', function() {
      let getToken, getProfile, testUser;
      let tokenUrl   = url.parse(cfg.auth.facebook.accessTokenUrl);
      let profileUrl = url.parse(cfg.auth.facebook.graphApiUrl);
      let params     = {
        code: 'xyz',
        client_id: 123,
        client_secret: cfg.auth.facebook.secret,
        redirect_uri: 'http://fake.com'
      }
      let accessToken = {
        access_token: '123xyz',
        token_type: 'bearer',
        expires_in: 5183999
      };
      beforeEach(function() {
        let tokenAddress = `${tokenUrl.protocol}//${tokenUrl.host}`;
        getToken = nock(tokenAddress)
          .get(tokenUrl.path)
          .query(params)
          .reply(200, accessToken);
        User.create({
          firstName: 'Bob',
          lastName: 'Dobbs',
          email: 'bob@subgenious.org',
          auth: [
            Auth.create({
              type: 'google',
              profile: {
                first_name: 'Bob',
                last_name: 'Dobbs',
                email: 'bob@subgenious.org'
              }
            })
          ]
        })
        .save()
        .then(u => {
          testUser = u;
          done();
        })
        .catch(err => done(err));
      });
      afterEach(function(done) {
        User.deleteMany({}).then((deleted) => {
          done();
        });
      });
      it('creates an acount for the profile if it does not exist', function(done) {
        let profile = {
          first_name: 'Johnny',
          last_name: 'Test',
          email: 'jtest@test.com'
        }
        let nockUrl = `${profileUrl.protocol}//${profileUrl.host}`;
        getProfile = nock(nockUrl)
          .get(profileUrl.pathname)
          .query(true)
          .reply(200, profile)
        supertest(app)
          .post('/auth/facebook')
          .send({
            code: params.code,
            clientId: params.client_id,
            redirectUri: params.redirect_uri
          })
          .set('Accept', 'application/json')
          .end((err, response) => {
            if(err) return done(err);
            User.count({})
              .then(confirmTwoUsers)
              .then(getNewUser)
              .then(newUser => {
                jwt.verify(response.body.token, cfg.siteSecret, (error, payload) => {
                  expect(payload.userId).to.equal(newUser._id);
                  done();
                });
              })
              .catch(e => done(e));
          });
        function getNewUser() {
          return User.findOne({email: profile.email})
        }
        function confirmTwoUsers(userCount) {
          expect(userCount).to.equal(2);
        }
      });
      it('adds auth profile if user was found', function(done) {
        let profile = {
          firstName: 'Bob',
          lastName: 'Dobbs',
          email: 'bob@subgenious.org',
        }
        nock(`${profileUrl.protocol}//${profileUrl.host}`)
          .get(profileUrl.pathname)
          .query(true)
          .reply(200, profile)
        supertest(app)
          .post('/auth/facebook')
          .send({
            code: params.code,
            clientId: params.client_id,
            redirectUri: params.redirect_uri
          })
          .set('Accept', 'application/json')
          .end((err, response) => {
            if(err) return done(err);
            User.count({})
              .then(confirmStillOneUser)
              .then(confirmTwoAuthTypes)
              .then(newUser => {
                jwt.verify(response.body.token, cfg.siteSecret, (error, payload) => {
                  expect(payload.userId).to.equal(testUser._id);
                  done();
                });
              })
            .catch(e => done(e));
          });
        function confirmStillOneUser(userCount) {
          expect(userCount).to.equal(1);
        }
        function confirmTwoAuthTypes() {
          return User.findOne({_id: testUser._id})
            .then(user => {
              let authTypes = user.auth.map(a => a.type);
              expect(user.auth).to.have.length(2);
              expect(authTypes).to.include('google');
              expect(authTypes).to.include('facebook');
            })
        }
      });
    });
    describe(' POST /auth/linkedin', function() {
      let getToken, getProfile, testUser;
      let tokenUrl   = url.parse(cfg.auth.linkedin.accessTokenUrl);
      let profileUrl = url.parse(cfg.auth.linkedin.peopleApiUrl);
      let params = {
        code:          'xyz',
        client_id:     1234,
        client_secret: cfg.auth.linkedin.secret,
        redirect_uri:  'http://fake.com',
        grant_type:    'authorization_code'
      }
      let accessToken = {
        access_token: '123xyz',
        token_type: 'bearer',
        expires_in: 5183999
      };
      beforeEach(function() {
        let tokenAddress = `${tokenUrl.protocol}//${tokenUrl.host}`;
        getToken = nock(tokenAddress)
          .post(tokenUrl.path)
          .reply(200, accessToken);
        User.create({
          firstName: 'Bob',
          lastName: 'Dobbs',
          email: 'bob@subgenious.org',
          auth: [
            Auth.create({
              type: 'google',
              profile: {
                first_name: 'Bob',
                last_name: 'Dobbs',
                email: 'bob@subgenious.org'
              }
            })
          ]
        })
        .save()
        .then(u => {
          testUser = u;
          done();
        })
        .catch(err => done(err));
      });
      afterEach(function(done) {
        nock.cleanAll();
        User.deleteMany({}).then((deleted) => {
          done();
        });
      });
      it('creates an acount for the profile if it does not exist', function(done) {
        let profile = {
          first_name: 'Johnny',
          last_name: 'Test',
          email: 'jtest@test.com'
        }
        let nockUrl = `${profileUrl.protocol}//${profileUrl.host}`;
        getProfile = nock(nockUrl)
          .get(profileUrl.pathname)
          .query(true)
          .reply(200, profile)
        supertest(app)
          .post('/auth/linkedin')
          .send({
            code: params.code,
            clientId: params.client_id,
            redirectUri: params.redirect_uri
          })
          .set('Accept', 'application/json')
          .end((err, response) => {
            if(err || response.error) return done(err || new Error(response.error));
            User.count({})
              .then(confirmTwoUsers)
              .then(getNewUser)
              .then(newUser => {
                jwt.verify(response.body.token, cfg.siteSecret, (error, payload) => {
                  if(error) done(error);
                  expect(payload.userId).to.equal(newUser._id);
                  done();
                });
              })
              .catch(e => done(e));
          });
        function getNewUser() {
          return User.findOne({email: profile.email})
        }
        function confirmTwoUsers(userCount) {
          expect(userCount).to.equal(2);
        }
      });
      it('adds auth profile if user was found', function(done) {
        let profile = {
          firstName: 'Bob',
          lastName: 'Dobbs',
          email: 'bob@subgenious.org',
        }
        nock(`${profileUrl.protocol}//${profileUrl.host}`)
          .get(profileUrl.pathname)
          .query(true)
          .reply(200, profile)
        supertest(app)
          .post('/auth/linkedin')
          .send({
            code: params.code,
            clientId: params.client_id,
            redirectUri: params.redirect_uri
          })
          .set('Accept', 'application/json')
          .end((err, response) => {
            if(err || response.error) return done(err || new Error(response.error));
            User.count({})
              .then(confirmStillOneUser)
              .then(confirmTwoAuthTypes)
              .then(newUser => {
                jwt.verify(response.body.token, cfg.siteSecret, (error, payload) => {
                  expect(payload.userId).to.equal(testUser._id);
                  done();
                });
              })
            .catch(e => done(e));
          });
        function confirmStillOneUser(userCount) {
          expect(userCount).to.equal(1);
        }
        function confirmTwoAuthTypes() {
          return User.findOne({_id: testUser._id})
            .then(user => {
              let authTypes = user.auth.map(a => a.type);
              expect(user.auth).to.have.length(2);
              expect(authTypes).to.include('google');
              expect(authTypes).to.include('linkedin');
            })
        }
      });
    });
    describe('POST /auth/github', function() {
      let getToken, getProfile, testUser;
      let tokenUrl   = url.parse(cfg.auth.github.accessTokenUrl);
      let profileUrl = url.parse(cfg.auth.github.userApiUrl);
      let params = {
        code:          'xyz',
        client_id:     1234,
        client_secret: cfg.auth.github.secret,
        redirect_uri:  'http://fake.com',
        grant_type:    'authorization_code'
      }
      let accessToken = {
        access_token: '123xyz',
        token_type: 'bearer',
        expires_in: 5183999
      };
      beforeEach(function() {
        let tokenAddress = `${tokenUrl.protocol}//${tokenUrl.host}`;
        getToken = nock(tokenAddress)
          .get(tokenUrl.path)
          .query(true)
          .reply(200, accessToken);
        User.create({
          firstName: 'Bob',
          lastName: 'Dobbs',
          email: 'bob@subgenious.org',
          auth: [
            Auth.create({
              type: 'google',
              profile: {
                first_name: 'Bob',
                last_name: 'Dobbs',
                email: 'bob@subgenious.org'
              }
            })
          ]
        })
        .save()
        .then(u => {
          testUser = u;
          done();
        })
        .catch(err => done(err));
      });
      afterEach(function(done) {
        nock.cleanAll();
        User.deleteMany({}).then((deleted) => {
          done();
        });
      });
      it('creates an acount for the profile if it does not exist', function(done) {
        let profile = {
          first_name: 'Johnny',
          last_name: 'Test',
          email: 'jtest@test.com'
        }
        let nockUrl = `${profileUrl.protocol}//${profileUrl.host}`;
        getProfile = nock(nockUrl)
          .get(profileUrl.pathname)
          .query(true)
          .reply(200, profile)
        supertest(app)
          .post('/auth/github')
          .send({
            code: params.code,
            clientId: params.client_id,
            redirectUri: params.redirect_uri
          })
          .set('Accept', 'application/json')
          .end((err, response) => {
            if(err || response.error) return done(err || new Error(response.error));
            User.count({})
              .then(confirmTwoUsers)
              .then(getNewUser)
              .then(newUser => {
                jwt.verify(response.body.token, cfg.siteSecret, (error, payload) => {
                  if(error) done(error);
                  expect(payload.userId).to.equal(newUser._id);
                  done();
                });
              })
              .catch(e => done(e));
          });
        function getNewUser() {
          return User.findOne({email: profile.email})
        }
        function confirmTwoUsers(userCount) {
          expect(userCount).to.equal(2);
        }
      });
      it('adds auth profile if user was found', function(done) {
        let profile = {
          firstName: 'Bob',
          lastName: 'Dobbs',
          email: 'bob@subgenious.org',
        }
        nock(`${profileUrl.protocol}//${profileUrl.host}`)
          .get(profileUrl.pathname)
          .query(true)
          .reply(200, profile)
        supertest(app)
          .post('/auth/github')
          .send({
            code: params.code,
            clientId: params.client_id,
            redirectUri: params.redirect_uri
          })
          .set('Accept', 'application/json')
          .end((err, response) => {
            if(err || response.error) return done(err || new Error(response.error));
            User.count({})
              .then(confirmStillOneUser)
              .then(confirmTwoAuthTypes)
              .then(newUser => {
                jwt.verify(response.body.token, cfg.siteSecret, (error, payload) => {
                  expect(payload.userId).to.equal(testUser._id);
                  done();
                });
              })
            .catch(e => done(e));
          });
        function confirmStillOneUser(userCount) {
          expect(userCount).to.equal(1);
        }
        function confirmTwoAuthTypes() {
          return User.findOne({_id: testUser._id})
            .then(user => {
              let authTypes = user.auth.map(a => a.type);
              expect(user.auth).to.have.length(2);
              expect(authTypes).to.include('google');
              expect(authTypes).to.include('github');
            })
        }
      });
    });
  });

});
