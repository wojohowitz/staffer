import express from 'express';
import Cfg from '../../config/siteConfig';
import request from 'request';
import qs from 'querystring';
import { User, Auth } from '../../db/camo/models/user';
import jwt from 'jsonwebtoken';

const AuthRouter = express.Router();

AuthRouter
  .route('/google')
  .post(googleAuth);

AuthRouter
  .route('/facebook')
  .post(facebookAuth);

AuthRouter
  .route('/linkedin')
  .post(linkedinAuth);

AuthRouter
  .route('/github')
  .post(githubAuth);

function googleAuth(req, res, next) {
  let params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: Cfg.auth.google.secret,
    redirect_uri: req.body.redirectUri,
    grant_type: 'authorization_code'
  }

  request.post(Cfg.auth.google.accessTokenUrl, {
    json: true,
    form: params
  },getToken);

  function getToken(err, response, token) {
    if(err) return next(err);
    let accessToken = token.access_token;
    let headers = { Authorization: 'Bearer ' + accessToken };
    request.get({
      url: Cfg.auth.google.peopleApiUrl, 
      headers: headers,
      json: true
    }, getProfile)
  }

  function getProfile(err, response, profile) {
    if(err || profile.error) return next(err || profile.error);
    return getUser('google', profile)
      .then(getJwt)
      .then(jwt => {
        res.send({token: jwt});
      })
    .catch(err => next(err));
  }


}

function facebookAuth(req, res, next) {
  let params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: Cfg.auth.facebook.secret,
    redirect_uri: req.body.redirectUri
  }
  request.get({
    url: Cfg.auth.facebook.accessTokenUrl,
    qs: params,
    json: true
  }, getToken);

  function getToken(err, response, accessToken) {
    if( err || response.statusCode !== 200 ) return next(err || accessToken.error);
    return request.get({
      url: Cfg.auth.facebook.graphApiUrl,
      qs: accessToken,
      json: true
    }, getProfile);
  }

  function getProfile(err, response, profile) {
    if(err || response.statusCode !== 200 ) return next(err || accessToken.error);
    getUser('facebook', profile)
      .then(getJwt)
      .then(jwt => {
        res.send({token: jwt});
      })
    .catch(err => next(err));
  }
}

function linkedinAuth(req, res, next) {
  let params = {
    code:          req.body.code,
    client_id:     req.body.clientId,
    client_secret: Cfg.auth.linkedin.secret,
    redirect_uri:  req.body.redirectUri,
    grant_type:    'authorization_code'
  }
  request.post(Cfg.auth.linkedin.accessTokenUrl, {
    form: params,
    json: true} , getToken);

  function getToken(err, response, body) {
    if(err || response.statusCode !== 200) return next(err || body.error_description);
    let params = {
      oauth2_access_token: body.access_token,
      format: 'json'
    }
    request.get({
      url: Cfg.auth.linkedin.peopleApiUrl,
      qs: params,
      json: true
    }, getProfile);
  }

  function getProfile(err, response, profile) {
    if(err || response.statusCode !== 200) next(err || response.error);
    getUser('linkedin', profile)
      .then(getJwt)
      .then(jwt => {
        res.send({token: jwt});
      })
    .catch(err => next(err));
  }
}

function githubAuth(req, res, next) {
  let params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: Cfg.auth.github.secret,
    redirect_uri: req.body.redirectUri
  }

  request.get({ url: Cfg.auth.github.accessTokenUrl, qs: params},
    getToken);

  function getToken(err, response, accessToken) {
    console.log(err);
    if(err || response.error) return next(err || response.error);
    accessToken = qs.parse(accessToken);
    let headers = { 'User-Agent': 'Satellizer' };

    request.get({
      url: Cfg.auth.github.userApiUrl, 
      qs: accessToken,
      headers: headers,
      json: true
    }, getProfile);
  }
  function getProfile(err, response, profile) {
    if(err || response.error) next(err || response.error);
    getUser('github', profile)
      .then(getJwt)
      .then(jwt => {
        res.send({token: jwt});
      })
    .catch(err => next(err));
  }
}

function getJwt(user) {
  return jwt.sign(
    { userId: user._id }, 
    Cfg.siteSecret,
    {expiresIn: '2h'}
  );
}

function createUser(profile, authOrigin) {
  let user = User.create();
  user.email = getUserEmailFromProfile(profile);
  user.firstName = getUserFirstNameFromProfile(profile);
  user.lastName = getUserLastNameFromProfile(profile);
  user.auth.push(Auth.create({type: authOrigin, profile: profile}));
  return user.save();
}

function getUserEmailFromProfile(profile) {
  if(profile.email) return profile.email;
  if(profile.emailAddress) return profile.emailAddress;
  return null;
}

function getUserLastNameFromProfile(profile) {
  return profile.last_name || 
    profile.family_name    ||
    profile.lastName;
}
function getUserFirstNameFromProfile(profile) {
  return profile.first_name || 
    profile.given_name      ||
    profile.firstName;
}

function addAuth(user, authOrigin, profile) {
  user.auth.push(Auth.create({type: authOrigin, profile: profile}));
  return user.save();
}

function getUser(authOrigin, profile) {
  let byAuth = {
    auth: {
      $elemMatch: {
        type: authOrigin,
        profile: profile
      }
    }
  };
  let byEmail = { email: getUserEmailFromProfile(profile) };
  return User.findOne({ $or: [byEmail,byAuth] })
    .then(user => {
      if(!user) return createUser(profile, authOrigin);
      if(!user.auth.find(a => a.type === authOrigin)) return addAuth(user, authOrigin, profile);
      return user;
    })
}

export { 
  AuthRouter, 
  getUser, 
  addAuth, 
  getUserEmailFromProfile,
  getUserFirstNameFromProfile,
  getUserLastNameFromProfile,
  createUser,
  getJwt,
  googleAuth,
  facebookAuth,
  linkedinAuth,
  githubAuth
}
