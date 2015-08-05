import xhr from 'xhr';
import qs from "qs";
import api from "./api";

class Auth {

	init(opts) {
		this.userInfoUrl = opts.userInfoUrl || null;
		this.VRE_ID = opts.VRE_ID || "";
		this.onAuthSuccess = opts.onAuthSuccess || false;
		this.onAuthError = opts.onAuthError || false;

		this.tokenPrefix = opts.tokenPrefix || "";
		this.tokenPropertyName = "hi-" + this.VRE_ID.toLowerCase() + "-auth-token";
		this.userData = null;

		this.checkTokenInUrl();
		if(this.getToken() !== null) {
			this.fetchUserData();
		}
	}

	fetchUserData() {
		let _self = this;
		xhr({
			method: 'GET',
			uri: this.userInfoUrl,
			headers: {
				Authorization: this.getToken(),
				VRE_ID: this.VRE_ID
			}
		},  function(err, resp, body) {
				if(resp.statusCode === 401) {
					_self.handleFetchError(resp);
				} else if(resp.statusCode === 200) {
					_self.handleFetchSuccess(resp);
				}
			}
		);
	}

	handleFetchSuccess(data) {
		this.userData = JSON.parse(data.body);
		if(this.onAuthSuccess) { this.onAuthSuccess(); }
	}

	handleFetchError(data) {
		this.userData = null;
		this.removeToken();
		if(this.onAuthError) { this.onAuthError("User is unauthorized"); }
	}

	basicLogin(url, username, password) {
		let _self = this;
		xhr({
			method: 'POST',
			uri: url,
			headers: {
				Authorization: 'Basic ' + btoa(username + ':' + password)
			}
		},	function(err, resp, body) {
				if(resp.statusCode === 401) {
					_self.handleLoginError(resp);
				} else if(resp.statusCode === 204) {
					_self.handleLoginSuccess(resp);
				}
		});
	}

	handleLoginError(data) {
		let body = JSON.parse(data.body);
		this.removeToken();
		if(this.onAuthError) { this.onAuthError(body.message); }
	}

	handleLoginSuccess(data) {
		this.setToken(data.headers.x_auth_token);
		this.fetchUserData();
	}

	checkTokenInUrl() {
		let params = qs.parse(window.location.search.substr(1));
		
		if(params.hsid) {
			let hsid = params.hsid;
			delete params.hsid;
			let newQs = qs.stringify(params);
			let newLocation = window.location.pathname + (newQs.length === 0 ? '' :  '?' + newQs);
			
			this.setToken(hsid);

			history.replaceState(history.state, 'tokened', newLocation);
		}
	}

	setToken(token) {
		localStorage.setItem(this.tokenPropertyName, this.tokenPrefix + token);
	}

	getToken() {
		return localStorage.getItem(this.tokenPropertyName);
	}

	removeToken() {
		localStorage.removeItem(this.tokenPropertyName);
	}

	isAuthenticated() {
		return this.getToken() !== null && this.userData !== null;
	}
}

export default new Auth();