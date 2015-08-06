import should from "should";
import serverActions from "../src/actions";
import dispatcher from "../src/dispatcher";
import sinon from "sinon";

describe("serverActions", function() {

	it("Should use receiveBasicLogin to dispatch server errors to dispatcher.handleServerAction", function() {
		sinon.stub(dispatcher, 'handleServerAction', function(resp) {
			resp.actionType.should.equal("BASIC_LOGIN_FAILURE");
			resp.data.statusCode.should.equal(401);
		});
		serverActions.receiveBasicLogin(null, {statusCode: 401}, null);
		sinon.assert.calledOnce(dispatcher.handleServerAction);
		dispatcher.handleServerAction.restore();
	});

	it("Should use receiveBasicLogin to dispatch successful authorization to dispatcher.handleServerAction", function() {
		sinon.stub(dispatcher, 'handleServerAction', function(resp) {
			resp.actionType.should.equal("BASIC_LOGIN_SUCCESS");
			resp.data.statusCode.should.equal(204);
		});
		serverActions.receiveBasicLogin(null, {statusCode: 204}, null);
		sinon.assert.calledOnce(dispatcher.handleServerAction);
		dispatcher.handleServerAction.restore();
	});


	it("Should use receiveUserData to dispatch server errors to dispatcher.handleServerAction", function() {
		sinon.stub(dispatcher, 'handleServerAction', function(resp) {
			resp.actionType.should.equal("USER_DATA_FAILURE");
			resp.data.statusCode.should.equal(401);
		});
		serverActions.receiveUserData(null, {statusCode: 401}, null);
		sinon.assert.calledOnce(dispatcher.handleServerAction);
		dispatcher.handleServerAction.restore();
	});

	it("Should use receiveUserData to dispatch successful fetch to dispatcher.handleServerAction", function() {
		sinon.stub(dispatcher, 'handleServerAction', function(resp) {
			resp.actionType.should.equal("USER_DATA_SUCCESS");
			resp.data.statusCode.should.equal(200);
		});
		serverActions.receiveUserData(null, {statusCode: 200}, null);
		sinon.assert.calledOnce(dispatcher.handleServerAction);
		dispatcher.handleServerAction.restore();
	});

});