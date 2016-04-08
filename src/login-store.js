import {EventEmitter} from "events";
import dispatcher from "./dispatcher";

const CHANGE_EVENT = "change";


class LoginStore extends EventEmitter {
	constructor() {
		super();

		this.errorMessage = null;
		this.userData = null;
		this.tokenPropertyName = null;
		this.tokenPrefix = null;
	}

	setTokenPrefix(prefix) {
		this.tokenPrefix = prefix;
	}

	setTokenPropertyName(id) {
		this.tokenPropertyName = id + "-auth-token";
		this.checkTokenInUrl();
	}

	checkTokenInUrl() {
		let path = window.location.search.substr(1);
		let params = path.split('&');

		for(let i in params) {
			let [key, value] = params[i].split('=');
			if(key === 'hsid') {
				let newLocation = window.location.href
					.replace(params[i], "")
					.replace(/[\?\&]$/, "");
				this.setToken(value);
				this.setSupportLogout(false);
				history.replaceState(history.state, 'tokened', newLocation);
				break;
			}
		}
	}

	getState() {
		return {
			token: this.getToken(),
			errorMessage: this.errorMessage,
			authenticated: this.getToken() !== null && this.userData !== null,
			userData: this.userData,
			supportLogout: this.supportsLogout()
		};
	}

	// GB: Is a warning enough? What happens when tokenPropertyName is missing?
	// GB: "call initializeVre" is Timbuctoo specific whereas hire-login should be generic.
	onMissingTokenPropertyName() {
		console.warn("WARNING: missing tokenPropertyName, call initializeVre before attempting authentication");
	}

	setToken(token) {
		if (this.tokenPropertyName === null) {
			return this.onMissingTokenPropertyName();
		}

		if (this.tokenPrefix != null) {
			token = `${this.tokenPrefix}${token}`;
		}

		localStorage.setItem(this.tokenPropertyName, token);
	}

	setSupportLogout(supportsLogout) {
		if (supportsLogout) {
			localStorage.setItem("hi-support-auth-logout", "yes");
		} else {
			localStorage.removeItem("hi-support-auth-logout");
		}
	}

	supportsLogout() {
		return localStorage.getItem("hi-support-auth-logout") === "yes";
	}

	getToken() {
		if(this.tokenPropertyName === null) { return this.onMissingTokenPropertyName() }
		return localStorage.getItem(this.tokenPropertyName);
	}

	removeToken() {
		if(this.tokenPropertyName === null) { return this.onMissingTokenPropertyName() }
		localStorage.removeItem(this.tokenPropertyName);
	}


	receiveBasicAuth(data) {
		this.setSupportLogout(true);
		this.setToken(data.headers.x_auth_token);
		this.errorMessage = null;

	}

	receiveBasicAuthFailure(data) {
		let body = JSON.parse(data.body);
		this.errorMessage = body.message;
		this.removeToken();
	}

	receiveUserData(data) {
		data = JSON.parse(data.body);
		if (!data.hasOwnProperty("displayName")) {
			data.displayName = data.firstName;
		}
		this.userData = data;
	}

	receiveUserDataFailure(data) {
		this.removeToken();
		this.errorMessage = "Unauthorized";
	}

	receiveLogout() {
		this.removeToken();
		this.setSupportLogout(false);
		this.errorMessage = null;
		this.userData = null;
	}

	stopListening(callback) { this.removeListener(CHANGE_EVENT, callback); }
	listen(callback) { this.addListener(CHANGE_EVENT, callback); }
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
		case "LOGOUT":
			loginStore.receiveLogout(payload.action.data);
			break;

		default:
			return;
	}

	loginStore.emit(CHANGE_EVENT);
};

loginStore.dispatcherIndex = dispatcher.register(dispatcherCallback);

export default loginStore;
