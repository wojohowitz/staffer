import angular from 'angular';
import Animate from 'angular-animate';
import Aria from 'angular-aria';
import Messages from 'angular-messages';
import Material from 'angular-material';
import router  from 'angular-ui-router';
import satellizer from 'satellizer';

import mdIconCfg from './mdIconCfg';
import SatellizerCfg from './satellizerCfg';
import appRouter from './stafferRouter';
import Components from './components';


(function() {
  angular.module('staffer', [
    Animate,
    Aria,
    Messages,
    Material,
    router,
    satellizer,
    Components.name
  ])
  .config(mdIconCfg)
  .config(SatellizerCfg)
  .config(appRouter);

  angular.element(document).ready(bootstraApp);
  function bootstraApp() {
    angular.bootstrap(document, ['staffer']);
  }

})();
