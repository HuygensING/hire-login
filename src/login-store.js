import {EventEmitter} from "events";
import dispatcher from "./dispatcher";

const CHANGE_EVENT = "change";

class LoginStore extends EventEmitter {
	listen(callback) {
		this.addListener(CHANGE_EVENT, callback);
	}

	getState() {
		return {
			token: this.getToken(),
			status: this.status,
			errorMessage: this.errorMessage
		};
	}

	setToken(token) {
		localStorage.setItem(this.tokenPropertyName, token);
	}

	getToken() {
		return localStorage.getItem(this.tokenPropertyName);
	}

	removeToken() {
		localStorage.removeItem(this.tokenPropertyName);
	}

	stopListening(callback) {
		this.removeListener(CHANGE_EVENT, callback);
	}

	receiveBasicAuth(data) {
		console.log("receiveBasicAuth", data);

		// TODO: find out correct tokenPrefix from apidoc...
		this.setToken(/*"basic " + */ data.headers.x_auth_token);
		this.status = "token-received";
		this.errorMessage = null;

	}

	receiveBasicAuthFailure(data) {
		console.log("receiveBasicAuthFailure", data);
		let body = JSON.parse(data.body);
		this.status = "basic-auth-failure";
		this.errorMessage = body.message;
		this.removeToken();
	}

	receiveUserData(data) {
		console.log("receiveUserData", data);
	}

	receiveUserDataFailure(data) {
		console.log("receiveUserDataFailure", data);
	}
}

let loginStore = new LoginStore();

let dispatcherCallback = function(payload) {
	switch(payload.action.actionType) {
		case "BASIC_LOGIN_SUCCESS":
			loginStore.receiveBasicAuth(payload.action.data);
			break;
		case "BASIC_LOGIN_FAILURE":
			loginStore.receiveBasicAuthFailure(payload.action.data);
			break;
		case "USER_DATA_SUCCESS":
			loginStore.receiveUserData(payload.action.data);
			break;
		case "USER_DATA_FAILURE":
			loginStore.receiveUserDataFailure(payload.action.data);
			break;

		default:
			return;
	}

	loginStore.emit(CHANGE_EVENT);
};

loginStore.dispatcherIndex = dispatcher.register(dispatcherCallback);

export default loginStore;