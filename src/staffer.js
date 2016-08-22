import angular from 'angular';
import Animate from 'angular-animate';
import router  from 'angular-ui-router';
import appRouter from './stafferRouter';

import Components from './components';


(function() {
  angular.module('staffer', [
    Animate,
    router,
    Components.name
  ])
  .config(appRouter);

  angular.element(document).ready(bootstraApp);
  function bootstraApp() {
    angular.bootstrap(document, ['staffer']);
  }

})();
