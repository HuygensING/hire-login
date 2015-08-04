import React from "react";
import qs from "qs";
import LoginFields from "./login-fields";

class LoginComponent extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			opened: false
		}
	}

	componentWillMount() {
		let params = qs.parse(window.location.search.substr(1));

		
		if(params.hsid) {
			let hsid = params.hsid;
			delete params.hsid;
			let newQs = qs.stringify(params);
			console.log(newQs);
			let newLocation = window.location.pathname + (newQs.length === 0 ? '' :  '?' + newQs);
			
			console.log("TODO: save token " + hsid);

			history.replaceState({}, 'tokened', newLocation);
		}
	}

	toggleLogin(ev) {
		this.setState({opened: !this.state.opened});
	}

	render() {
		let loginFields = this.state.opened ?
			<LoginFields {...this.props} /> :
			null;

		return (
			<div className="hire-forms-login">
				<div>
					<button className="login-toggle" 
						onClick={this.toggleLogin.bind(this)}>
						{this.props.buttonLabel}
					</button>
				</div>
				{loginFields}
			</div>
		);
	}
}

LoginComponent.propTypes = {
	VRE_ID: React.PropTypes.string,
	userInfoUrl: React.PropTypes.string,
	basicUrl: React.PropTypes.string,
	federatedUrl: React.PropTypes.string,
	buttonLabel: React.PropTypes.string,
	federatedLabel: React.PropTypes.string,
	basicLabel: React.PropTypes.string,
	userPlaceholder: React.PropTypes.string,
	passwordPlaceholder: React.PropTypes.string,
	onChange: React.PropTypes.func,
}

LoginComponent.defaultProps = {
	buttonLabel: "Login",
	federatedLabel: "Federated Login",
	basicLabel: "Basic Login",
	userPlaceholder: "Username or email address",
	passwordPlaceholder: "Password",
	onChange: function(payload) { console.log(payload); }
};


export default LoginComponent;