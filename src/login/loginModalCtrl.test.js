import { expect } from 'chai';
import sinon from 'sinon';
import LoginModalCtrl from './loginModalCtrl';


describe('LoginModalCtrl', function() {
  let ctrl;
  beforeEach(function(){
    ctrl = new LoginModalCtrl(mocks.auth, mocks.state);
  });
  it('has a collection of providers', function() {
    expect(ctrl.providers).to.be.a('array');
    expect(ctrl.providers).to.have.length.above(0);
    ctrl.providers.forEach(allHaveProperties)
    function allHaveProperties(provider) {
      expect(provider).to.have.property('class');
      expect(provider).to.have.property('label');
    }
  });
  describe('#authenticate', function() {
    it('calls the authenticate funciton of the $auth service', function() {
      ctrl.authenticate();
      expect(mocks.auth.authenticate.called).to.be.true;
    });
    it('passes the provider to the auths authenticate function', function() {
      ctrl.authenticate('test');
      expect(mocks.auth.authenticate.calledWith('test')).to.be.true;
    });
    it('calls the $state service to go to main state', function(done) {
      ctrl.authenticate('test').then(testCall).catch(done);
      function testCall(){
        expect(mocks.state.go.calledWith('main')).to.be.true;
        done();
      }
    });
  });
});

let mocks = {
  auth: {
    authenticate: sinon.stub().returns(Promise.resolve())
  },
  state: {
    go: sinon.stub()
  }
}
