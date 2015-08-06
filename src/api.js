import xhr from "xhr";
import dispatcher from "./dispatcher";
import serverActions from "./actions";


export default {
	// exposed for mocking
	performXhr(opts, callback) {
		xhr(opts, callback);
	},

	basicLogin(url, username, password) {
		this.performXhr({
			method: 'POST',
			uri: url,
			headers: {
				Authorization: 'Basic ' + btoa(username + ':' + password)
			}
		},	serverActions.receiveBasicLogin);
	},

	fetchUserData(url, token, VRE_ID) {
		this.performXhr({
			method: 'GET',
			uri: url,
			headers: {
				Authorization: token,
				VRE_ID: VRE_ID
			}
		},  serverActions.receiveUserData);
	}
};