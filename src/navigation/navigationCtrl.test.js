import 'mocha';
import {expect} from 'chai';
import NavigationCtrl from './navigationCtrl';

beforeEach(setCtrl);

var ctrl;

function setCtrl() {
  ctrl = new NavigationCtrl();
}

describe('NavigationCtrl', function NavigationCtrlTest() {

  it('should have an array of links', function hasLinks() {
    expect(ctrl.links).to.exist;
  });

  it('the links array should contain links', function linksArrayHasLinks() {
    expect(ctrl.links).to.not.be.empty;
    ctrl.links.forEach(itemIsLink);
    function itemIsLink(link) {
      expect(link).to.have.property('state');
      expect(link).to.have.property('label');
    }
  });
});




