import sinon from "sinon";
import should from "should";
import serverActions from "../src/actions"
import api from "../src/api";


global.btoa = function(str) { return "btoa-mock-encoded " + str; };
global.tools = {};

describe("api", function() {

	it("Should call xhr with the proper headers for basic login and call proper serverAction", function() {
		sinon.stub(api, "performXhr", function(opts, callback) {
			opts.method.should.equal("POST");
			opts.uri.should.equal("dummy-url");
			opts.headers.Authorization.should.equal("Basic btoa-mock-encoded dummy-user:dummy-pass");
			callback.should.equal(serverActions.receiveBasicLogin);
		});

		api.basicLogin("dummy-url", "dummy-user", "dummy-pass");
		api.performXhr.restore();
	});

	it("Should call xhr with the proper headers for fetching user data and call proper serverAction", function() {
		sinon.stub(api, "performXhr", function(opts, callback) {
			opts.method.should.equal("GET");
			opts.uri.should.equal("dummy-url");
			opts.headers.Authorization.should.equal("dummy-token");
			opts.headers.VRE_ID.should.equal("dummy-vre");
			callback.should.equal(serverActions.receiveUserData);
		});

		api.fetchUserData("dummy-url", "dummy-token", "dummy-vre");
		api.performXhr.restore();
	});
});