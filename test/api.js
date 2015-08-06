import sinon from "sinon";
import should from "should";
import api from "../src/api";


global.btoa = function(str) { return "btoa-mock-encoded " + str; };
global.tools = {};

describe("api", function() {

	it("Should call xhr with the proper headers for basic login", function() {
		sinon.stub(api, "performXhr", function(opts, callback) {
			opts.method.should.equal("POST");
			opts.uri.should.equal("dummy-url");
			opts.headers.Authorization.should.equal("Basic btoa-mock-encoded dummy-user:dummy-pass");
		});

		api.basicLogin("dummy-url", "dummy-user", "dummy-pass");

/*	basicLogin(url, username, password) {
		xhr({
			method: 'POST',
			uri: url,
			headers: {
				Authorization: 'Basic ' + btoa(username + ':' + password)
			}
		},	serverActions.receiveBasicLogin);
	},*/
	});
});