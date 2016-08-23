export default NavigationCtrl;
NavigationCtrl.$inject = [];

function NavigationCtrl() {
  let vm = this;
  vm.links = [
    {
      label: 'Home',
      state: 'main'
    }
  ];
}
