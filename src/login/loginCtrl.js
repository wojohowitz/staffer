export default LoginCtrl;
import LoginModalCtrl from './loginModalCtrl';
import ModalTemplate from './loginModal.jade';

LoginCtrl.$inject = ['$mdPanel', '$document'];

function LoginCtrl($mdPanel, $document) {
  let vm = this;

  $mdPanel.open({
    attachTo: angular.element($document.find('staffer-login')),
    controller: LoginModalCtrl,
    controllerAs: 'loginModal',
    disableParentScroll: true,
    template: ModalTemplate(),
    position: vm._mdPanel.newPanelPosition()
      .absolute()
      .center(),
    clickOutsideToClose: false,
    escapeToClose: false,
    focusOnOpen: true,
    hasBackdrop: true,
  });
}

