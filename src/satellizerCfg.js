export default SatellizerCfg;

SatellizerCfg.$inject = ['$authProvider'];
function SatellizerCfg($authProvider) {
  $authProvider.google({
    clientId: "805146422749-v611hl1qvgep2qaid86st74pku0tqp3h.apps.googleusercontent.com"
  });
  $authProvider.facebook({
    clientId: "1088196464546349"
  });
}
