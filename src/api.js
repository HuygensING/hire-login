import xhr from "xhr";
import dispatcher from "./dispatcher";
import serverActions from "./actions";


export default {
	performXhr(opts, callback) {
		xhr(opts, callback);
	},

	basicLogin(url, username, password) {
		this.performXhr({
			method: 'POST',
			uri: url,
			headers: {
				Accept: "application/json",
				Authorization: 'Basic ' + btoa(username + ':' + password)
			}
		},	serverActions.receiveBasicLogin);
	},

	fetchUserData(url, token, optHeaders) {
		let headers = optHeaders || {};
		Object.assign(headers, {
			Accept: "application/json",
			Authorization: token
		})

		this.performXhr({
			method: 'GET',
			uri: url,
			headers: headers
		},  serverActions.receiveUserData);
	}
};