import './assets/mdi.svg';
export default mdIconCfg;

mdIconCfg.$inject = ['$mdIconProvider'];

function mdIconCfg($mdIconProvider) {
  $mdIconProvider
    .defaultIconSet('/assets/mdi.svg')
}
