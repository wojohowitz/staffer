export default LoginCtrl;

LoginCtrl.$inject = ['$auth'];

function LoginCtrl($auth) {
  let vm = this;
  vm.authenticate = authenticate;

  function authenticate(provider) {
    $auth.authenticate(provider);
  }
}
