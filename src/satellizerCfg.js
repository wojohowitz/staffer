export default SatellizerCfg;

SatellizerCfg.$inject = ['$authProvider'];
function SatellizerCfg($authProvider) {
  $authProvider.tokenPrefix = 'staffer',
  $authProvider.google({
    clientId: '805146422749-v611hl1qvgep2qaid86st74pku0tqp3h.apps.googleusercontent.com'
  });
  $authProvider.facebook({
    clientId: '1088196464546349',
    scope: ['email']
  });
  $authProvider.linkedin({
    clientId: '75d4mx7scqca3k'
  });
  $authProvider.github({
    clientId: '5a8981e0c79f44cf3e0d',
  })
}
