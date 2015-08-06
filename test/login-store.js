import should from "should";
import sinon from "sinon";

import loginStore from "../src/login-store";

describe("loginStore", function() {
	it("Should always export with required properties initialized", function() {
		(loginStore.errorMessage === null).should.be.true;
		(loginStore.userData === null).should.be.true;
		(loginStore.vreId === null).should.be.true;
		(loginStore.tokenPropertyName === null).should.be.true;
		loginStore.usePrefix.should.equal(false);
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

/*

	receiveBasicAuth(data) {

		// TODO: find out correct tokenPrefix from apidoc...
		this.setToken((this.usePrefix ? "SimpleAuth " : "") + data.headers.x_auth_token);
		this.errorMessage = null;

	}

	receiveBasicAuthFailure(data) {
		let body = JSON.parse(data.body);
		this.errorMessage = body.message;
		this.removeToken();
	}

	receiveUserData(data) {
		this.userData = JSON.parse(data.body);
	}

	receiveUserDataFailure(data) {
		this.removeToken();
		this.errorMessage = "Unauthorized";
	}

	stopListening(callback) { this.removeListener(CHANGE_EVENT, callback); }
	listen(callback) { this.addListener(CHANGE_EVENT, callback); }

	checkTokenInUrl() {
		let path = window.location.search.substr(1);
		let params = path.split('&');

		for(let i in params) {
			let [key, value] = params[i].split('=');
			if(key === 'hsid') {
				let newLocation = window.location.href
					.replace(params[i], "")
					.replace(/[\?\&]$/, "");
				this.setToken((this.usePrefix ? "Federated " : "") + value);
				history.replaceState(history.state, 'tokened', newLocation);
				break;
			}
		}
	}

	setToken(token) {
		if(this.tokenPropertyName === null) { return this.onMissingTokenPropertyName() }
		localStorage.setItem(this.tokenPropertyName, token);
	}

	getToken() {
		if(this.tokenPropertyName === null) { return this.onMissingTokenPropertyName() }
		return localStorage.getItem(this.tokenPropertyName);
	}


	removeToken() {
		if(this.tokenPropertyName === null) { return this.onMissingTokenPropertyName() }
		localStorage.removeItem(this.tokenPropertyName);
	}



*/

});
