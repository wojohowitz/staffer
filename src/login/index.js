import Controller from './loginCtrl';
import Template from './login.jade';
import './login.scss';

export default {
  controller: Controller,
  controllerAs: 'login',
  template: Template(),
}
