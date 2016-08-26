import angular from 'angular';
import Animate from 'angular-animate';
import router  from 'angular-ui-router';
import satellizer from 'satellizer';

import SatellizerCfg from './satellizerCfg';
import appRouter from './stafferRouter';
import Components from './components';


(function() {
  angular.module('staffer', [
    Animate,
    router,
    satellizer,
    Components.name
  ])
  .config(SatellizerCfg)
  .config(appRouter);

  angular.element(document).ready(bootstraApp);
  function bootstraApp() {
    angular.bootstrap(document, ['staffer']);
  }

})();
