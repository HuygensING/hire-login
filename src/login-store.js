import {EventEmitter} from "events";
import dispatcher from "./dispatcher";

const CHANGE_EVENT = "change";


class LoginStore extends EventEmitter {
	constructor() {
		super();

		this.errorMessage = null;
		this.userData = null;
		this.tokenPropertyName = null;
	}

	setTokenPropertyName(tpn) {
		this.tokenPropertyName = tpn;
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
				history.replaceState(history.state, 'tokened', newLocation);
				break;
			}
		}
	}

	getState() {
		return {
			token: this.getToken(),
			tokenPropertyName: this.tokenPropertyName,
			errorMessage: this.errorMessage,
			authenticated: this.getToken() !== null && this.userData !== null,
			userData: this.userData
		};
	}


	onMissingTokenPropertyName() {
		console.warn("WARNING: missing tokenPropertyName, call initializeVre before attempting authentication");
	}

	setToken(token) {
		if(this.tokenPropertyName === null) { return this.onMissingTokenPropertyName() }
		localStorage.setItem(this.tokenPropertyName, token);
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

		this.setToken(data.headers.x_auth_token);
		this.errorMessage = null;

	}

	receiveBasicAuthFailure(data) {
		let body = JSON.parse(data.body);
		this.errorMessage = body.message;
		this.removeToken();
	}

	receiveUserData(data) {
		this.userData = JSON.parse(data.body);
	}

	receiveUserDataFailure(data) {
		this.removeToken();
		this.errorMessage = "Unauthorized";
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

		default:
			return;
	}

	loginStore.emit(CHANGE_EVENT);
};

loginStore.dispatcherIndex = dispatcher.register(dispatcherCallback);

export default loginStore;