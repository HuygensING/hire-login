import xhr from 'xhr';

class Auth {
	constructor(username, password, url, VRE_ID) {
		this.username = username;
		this.password = password;
		this.url = url;
		this.VRE_ID = VRE_ID;
	}

	basicLogin() {
		xhr({
			method: 'POST',
			uri: this.url,
			headers: {
				Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
			}
		},	function(err, resp, body) {
				console.log(err, resp, body);
		});
	}
}

export default Auth;