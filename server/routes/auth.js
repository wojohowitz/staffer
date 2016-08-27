import express from 'express';
import Cfg from '../../config/siteConfig';
import request from 'request';
import { User, Auth } from '../../db/camo/models/user';
import jwt from 'jsonwebtoken';

const AuthRouter = express.Router();

AuthRouter
  .route('/google')
  .post(googleAuth);

AuthRouter
  .route('/facebook')
  .post(facebookAuth);

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
    getUser('google', profile)
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
    if(response.statusCode !== 200 || err) return next(err || accessToken.error);
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

function getJwt(user) {
  return jwt.sign(
    { userId: user._id }, 
    Cfg.siteSecret,
    {expiresIn: '2h'}
  );
}

function createUser(profile, authOrigin) {
  let user = User.create();
  user.email = profile.email ? profile.email : null;
  user.firstName = profile.first_name || profile.given_name;
  user.lastName = profile.last_name || profile.family_name;
  user.auth.push(Auth.create({type: authOrigin, profile: profile}));
  return user.save();
}

function getUser(authOrigin, profile) {
  return User.findOne({
    auth: {
      $elemMatch: {
        type: authOrigin,
        profile: profile
      }
    }
  })
  .then(user => {
    if(!user) return createUser(profile, authOrigin);
    return user;
  })
}

export default AuthRouter;
