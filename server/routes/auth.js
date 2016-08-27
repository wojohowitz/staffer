import express from 'express';
import Cfg from '../../config/siteConfig';
import request from 'request';
import { User, Auth } from '../../db/camo/models/user';
import jwt from 'jsonwebtoken';

const AuthRouter = express.Router();

AuthRouter
  .route('/google')
  .post(runAuth);

function runAuth(req, res, next) {
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
    User.findOne({email: profile.email})
      .then(user => {
        if(!user) return createUser(profile, 'google');
        if(!user.auth && !user.auth.find(a => a.type === 'google')) return addAuth(user, profile, 'google');
        return user;
      })
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
  user.email = profile.email;
  user.auth.push(Auth.create({type: authOrigin, profile: profile}));
  return user.save();
}

function addAuth(user, profile, authOrigin) {
  user.auth.push(Auth.create({type: authOrigin, profile: profile}));
  return user.save();
}

export default AuthRouter;
