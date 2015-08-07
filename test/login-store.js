import should from "should";
import sinon from "sinon";

import loginStore from "../src/login-store";
import dispatcher from "../src/dispatcher";

global.window = {};
global.history = {};
global.localStorage = {};

describe("loginStore", function() {
	it("Should always export with required properties initialized", function() {
		(loginStore.errorMessage === null).should.equal(true);
		(loginStore.userData === null).should.equal(true);
		(loginStore.vreId === null).should.equal(true);
		(loginStore.tokenPropertyName === null).should.equal(true);
	});


	it("Should set the vreId, tokenPropertyName correctly and call checkTokenInUrl() with initializeVre()", function() {
		sinon.stub(loginStore, 'checkTokenInUrl');

		loginStore.initializeVre("DummyVre");
		sinon.assert.calledOnce(loginStore.checkTokenInUrl);
		loginStore.vreId.should.equal("DummyVre");
		loginStore.tokenPropertyName.should.equal("hi-dummyvre-auth-token");

		loginStore.checkTokenInUrl.restore();

	});

	it("Should expose state properties with getState()", function() {
		sinon.stub(loginStore, 'getToken', function() { return "dummy-token"; });

		loginStore.tokenPropertyName = "dummy-tpn";
		loginStore.errorMessage = "dummy-error";
		loginStore.userData = {};

		let returned = loginStore.getState();
		returned.token.should.equal("dummy-token");
		returned.tokenPropertyName.should.equal("dummy-tpn");
		returned.errorMessage.should.equal("dummy-error");
		returned.authenticated.should.equal(true);
		returned.userData.should.be.ok();

		sinon.assert.calledTwice(loginStore.getToken);

		loginStore.userData = null;
		returned = loginStore.getState();
		returned.authenticated.should.equal(false);

		loginStore.getToken.restore();
	});

	it("Should fire a warning to the console with onMissingTokenPropertyName()", function() {
		sinon.stub(console, 'warn', function(msg) { 
			msg.should.equal("WARNING: missing tokenPropertyName, call initializeVre before attempting authentication");
		});

		loginStore.onMissingTokenPropertyName();
		sinon.assert.calledOnce(console.warn);

		console.warn.restore();
	});

	it("Should call setToken() correctly with receiveBasicAuth() and assign null to errorMessage", function() {
		sinon.stub(loginStore, 'setToken', function(token) { 
			token.should.equal('dummy-token');
		});

		loginStore.errorMessage = "remove me";
		loginStore.receiveBasicAuth({headers: {x_auth_token: "dummy-token"}});
		(loginStore.errorMessage === null).should.equal(true);
		sinon.assert.calledOnce(loginStore.setToken);

		loginStore.setToken.restore();

	});

	it("Should call removeToken() from receiveBasicAuthFailure() and set an error message from response data", function() {
		sinon.stub(loginStore, 'removeToken');

		loginStore.errorMessage = null;
		loginStore.receiveBasicAuthFailure({
			body: '{"message" : "dummy-msg"}'
		});
		sinon.assert.calledOnce(loginStore.removeToken);
		loginStore.errorMessage.should.equal("dummy-msg");

		loginStore.removeToken.restore();
	});

	it("Should set userData correctly with receiveUserData()", function() {
		loginStore.userData = null;
		loginStore.receiveUserData({
			body: '{"dummy-key": "dummy-data"}'
		});
		loginStore.userData['dummy-key'].should.equal("dummy-data");
	});

	it("Should remove the token and set an error message with receiveUserDataFailure()", function() {
		sinon.stub(loginStore, 'removeToken');

		loginStore.errorMessage = null;
		loginStore.receiveUserDataFailure();
		sinon.assert.calledOnce(loginStore.removeToken);
		loginStore.errorMessage.should.equal("Unauthorized");

		loginStore.removeToken.restore();
	});

	it("Should remove a change listener with stopListening()", function() {
		let cb = function() {};
		sinon.stub(loginStore, 'removeListener', function(type, callback) {
			type.should.equal("change");
			callback.should.equal(cb);
		});

		loginStore.stopListening(cb);
		sinon.assert.calledOnce(loginStore.removeListener);
		loginStore.removeListener.restore();
	});

	it("Should add a change listener with addListener()", function() {
		let cb = function() {};
		sinon.stub(loginStore, 'addListener', function(type, callback) {
			type.should.equal("change");
			callback.should.equal(cb);
		});

		loginStore.listen(cb);
		sinon.assert.calledOnce(loginStore.addListener);

		loginStore.addListener.restore();
	});

	it("Should check for a Federated token in the url with checkTokenInUrl()", function() {
		window.location = {
			search: "?foo=bar&hsid=dummy-token",
			href: "http://domain.name/path?foo=bar&hsid=dummy-token"
		};

		history.state = {originalState: "dummy-state"};
		history.replaceState = function(state, name, loc) {
			state.should.equal(history.state);
			loc.should.equal("http://domain.name/path?foo=bar");
		};

		sinon.stub(loginStore, "setToken", function(token) {
			token.should.equal("dummy-token");
		});

		loginStore.checkTokenInUrl();
		sinon.assert.calledOnce(loginStore.setToken);
		loginStore.setToken.restore();


	});

	it("Should not set a Federated token without hsid param in the url with checkTokenInUrl()", function() {
		window.location = {
			search: "?foo=bar",
			href: "http://domain.name/path?foo=bar"
		};

		sinon.stub(loginStore, "setToken")

		loginStore.checkTokenInUrl();
		sinon.assert.notCalled(loginStore.setToken);

		loginStore.setToken.restore();
	});

	it("Should save the token to the localStorage with setToken() or fire a warning when tokenPropertyName is null", function() {
		localStorage.setItem = function(key, val) {
			key.should.equal(loginStore.tokenPropertyName);
			val.should.equal("dummy-token");
		};

		loginStore.tokenPropertyName = "dummy-name";
		loginStore.setToken("dummy-token");

		sinon.stub(loginStore, "onMissingTokenPropertyName");

		loginStore.tokenPropertyName = null;
		loginStore.setToken("");
		sinon.assert.calledOnce(loginStore.onMissingTokenPropertyName);

		loginStore.onMissingTokenPropertyName.restore();
	});

	it("Should return the token from the localStorage with getToken() or fire a warning when tokenPropertyName is null", function() {
		localStorage.getItem = function(key) {
			key.should.equal(loginStore.tokenPropertyName);
			return "dummy-token";
		};

		loginStore.tokenPropertyName = "dummy-name";
		let retVal = loginStore.getToken();
		retVal.should.equal("dummy-token");

		sinon.stub(loginStore, "onMissingTokenPropertyName");

		loginStore.tokenPropertyName = null;
		loginStore.getToken();
		sinon.assert.calledOnce(loginStore.onMissingTokenPropertyName);

		loginStore.onMissingTokenPropertyName.restore();
	});

	it("Should remove the token from the localStorage with removeToken() or fire a warning when tokenPropertyName is null", function() {
		localStorage.removeItem = function(key) {
			key.should.equal(loginStore.tokenPropertyName);
		};

		loginStore.tokenPropertyName = "dummy-name";
		loginStore.removeToken();

		sinon.stub(loginStore, "onMissingTokenPropertyName");

		loginStore.tokenPropertyName = null;
		loginStore.removeToken();
		sinon.assert.calledOnce(loginStore.onMissingTokenPropertyName);

		loginStore.onMissingTokenPropertyName.restore();
	});

	it("Should register a callback to the dispatcher to handle server actions", function() {
		let dispatcherCallback = dispatcher.$Dispatcher_callbacks[loginStore.dispatcherIndex];

		dispatcherCallback.should.be.an.instanceOf(Function);
	});

	function testDispatcherCallbackFor(opts) {
		let dispatcherCallback = dispatcher.$Dispatcher_callbacks[loginStore.dispatcherIndex];

		sinon.stub(loginStore, opts.stubFunc, function(data) {
			data.should.equal("dummy-data");
		});

		sinon.stub(loginStore, "emit", function(evType) {
			evType.should.equal("change");
		});

		dispatcherCallback({
			action: {
				data: "dummy-data",
				actionType: opts.actionType
			}
		});
		sinon.assert.calledOnce(loginStore[opts.stubFunc]);
		sinon.assert.calledOnce(loginStore.emit);

		loginStore[opts.stubFunc].restore();
		loginStore.emit.restore();
	}

	it("Should use the dispatcherCallback to call receiveBasicAuth() and emit a change event", function() {
		testDispatcherCallbackFor({actionType: "BASIC_LOGIN_SUCCESS", stubFunc: "receiveBasicAuth"});
	});

	it("Should use the dispatcherCallback to call receiveBasicAuthFailure() and emit a change event", function() {
		testDispatcherCallbackFor({actionType: "BASIC_LOGIN_FAILURE", stubFunc: "receiveBasicAuthFailure"});
	});

	it("Should use the dispatcherCallback to call receiveUserData() and emit a change event", function() {
		testDispatcherCallbackFor({actionType: "USER_DATA_SUCCESS", stubFunc: "receiveUserData"});
	});

	it("Should use the dispatcherCallback to call receiveUserDataFailure() and emit a change event", function() {
		testDispatcherCallbackFor({actionType: "USER_DATA_FAILURE", stubFunc: "receiveUserDataFailure"});
	});

	it("Should not emit a change event with the dispatcherCallback when the actionType is unsupported", function() {
		let dispatcherCallback = dispatcher.$Dispatcher_callbacks[loginStore.dispatcherIndex];
		sinon.stub(loginStore, "emit");
		dispatcherCallback({
			action: {actionType: "UNSUPPORTED"}
		});
		sinon.assert.notCalled(loginStore.emit);
		loginStore.emit.restore();
	});
});
