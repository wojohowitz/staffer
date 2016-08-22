import angular from 'angular';
import template from './staffer.jade';

var StafferComponent = {
  controller: StafferCtrl,
  controllerAs: 'app',
  template: template()
}

// StafferCtrl.$inject = [];
function StafferCtrl() {
  let vm = this;
}
export default StafferComponent;
