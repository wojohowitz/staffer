import express from 'express';
import Cfg from '../../config/siteConfig';
import request from 'request';

const Auth = express.Router();

Auth
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
    res.send(profile);
  }
}

export default Auth;
