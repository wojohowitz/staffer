export default LoginModalCtrl;


LoginModalCtrl.$inject = ['$auth', '$state'];

function LoginModalCtrl($auth, $state) {
  let vm = this;
  vm.authenticate = authenticate;
  vm.providers = [
    {label: 'Google', class:'google'},
    {label: 'Facebook', class: 'facebook'},
    {label: 'LinkedIn', class: 'linkedin'},
    {label: 'GitHub', class: 'github-circle'}
  ]

  function authenticate(provider) {
    return $auth.authenticate(provider)
      .then(() => $state.go('main'));
  }
  
}
