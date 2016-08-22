export default Router;


function Router($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('main', {
      url: '/',
      template: '<staffer></staffer>'
    });
}
