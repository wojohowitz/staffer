import angular from 'angular';

import Staffer from './staffer/staffer';
import Navigation from './navigation/navigation';



const componentModule = angular.module('staffer.components', []);
componentModule.component('staffer', Staffer);
componentModule.component('stafferNavigation', Navigation);

export default componentModule;

