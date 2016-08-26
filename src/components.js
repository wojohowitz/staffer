import angular from 'angular';

import Staffer from './staffer/staffer';
import Navigation from './navigation/navigation';
import Login from './login';



const componentModule = angular.module('staffer.components', []);
componentModule.component('staffer', Staffer);
componentModule.component('stafferNavigation', Navigation);
componentModule.component('stafferLogin', Login);

export default componentModule;

