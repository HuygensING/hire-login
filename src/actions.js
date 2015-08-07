import dispatcher from "./dispatcher";

export default {
	receiveBasicLogin(err, resp, body) {

		if(resp.statusCode >= 400) {
			dispatcher.handleServerAction({
				actionType: "BASIC_LOGIN_FAILURE",
				data: resp
			});
		} else if(resp.statusCode >= 200 && resp.statusCode < 300) {
			dispatcher.handleServerAction({
				actionType: "BASIC_LOGIN_SUCCESS",
				data: resp
			});
		}

	},

	receiveUserData(err, resp, body) {
		if(resp.statusCode >= 400) {
			dispatcher.handleServerAction({
				actionType: "USER_DATA_FAILURE",
				data: resp
			});
		} else if(resp.statusCode >= 200 && resp.statusCode < 300) {
			dispatcher.handleServerAction({
				actionType: "USER_DATA_SUCCESS",
				data: resp
			});
		}
	}
};