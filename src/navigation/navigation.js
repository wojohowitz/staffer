import template from './navigation.jade';
import style from './navigation.scss';
export default {
  controller: NavigationCtrl,
  controllerAs: 'nav',
  template: template(),
}

NavigationCtrl.$inject = [];

function NavigationCtrl() {
  let vm = this;
}
