import should from "should";
import sinon from "sinon";

import dispatcher from "../src/dispatcher";

describe("dispatcher", function() {
	it("Should use handleServerAction to dispatch its payload with dispatch", function() {

		sinon.stub(dispatcher, 'dispatch', function(opts) {
			opts.source.should.equal("SERVER_ACTION");
			opts.action.should.equal("dummy-action");
		});

		dispatcher.handleServerAction("dummy-action");
		sinon.assert.calledOnce(dispatcher.dispatch);
		dispatcher.dispatch.restore();
	});
});
