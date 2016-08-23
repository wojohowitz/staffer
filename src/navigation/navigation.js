import template from './navigation.jade';
import style from './navigation.scss';
import NavigationCtrl from './navigationCtrl';
export default {
  controller: NavigationCtrl,
  controllerAs: 'nav',
  template: template(),
}

