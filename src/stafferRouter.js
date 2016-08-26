export default Router;


function Router($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/login');

  $stateProvider
    .state('main', {
      url: '/main',
      template: '<staffer></staffer>'
    })
    .state('login', {
      url: '/login',
      template: '<staffer-login></staffer-login>'
    });
}
