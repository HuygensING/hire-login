import xhr from "xhr";
import dispatcher from "./dispatcher";

let serverActions = {
	receiveBasicLogin(err, resp, body) {

		if(resp.statusCode === 401) {
			dispatcher.handleServerAction({
				actionType: "BASIC_LOGIN_FAILURE",
				data: resp
			});
		} else if(resp.statusCode === 204) {
			dispatcher.handleServerAction({
				actionType: "BASIC_LOGIN_SUCCESS",
				data: resp
			});
		}

	},

	receiveUserData(err, resp, body) {
		if(resp.statusCode === 401) {
			dispatcher.handleServerAction({
				actionType: "USER_DATA_FAILURE",
				data: resp
			});
		} else if(resp.statusCode === 200) {
			dispatcher.handleServerAction({
				actionType: "USER_DATA_SUCCESS",
				data: resp
			});
		}
	}
};

export default {
	basicLogin(url, username, password) {
		xhr({
			method: 'POST',
			uri: url,
			headers: {
				Authorization: 'Basic ' + btoa(username + ':' + password)
			}
		},	serverActions.receiveBasicLogin);
	},

	fetchUserData(url, token, VRE_ID) {
		xhr({
			method: 'GET',
			uri: url,
			headers: {
				Authorization: token,
				VRE_ID: VRE_ID
			}
		},  serverActions.receiveUserData);
	}
};