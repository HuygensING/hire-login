import React from "react";
import LoginFields from "./login-fields";



class LoginComponent extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			opened: false
		}
	}

	toggleLogin(ev) {
		console.log("tog")
		this.setState({opened: !this.state.opened});
		console.log(this.state.opened);
	}

	render() {
		console.log(this.state);

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
	basicUrl: React.PropTypes.string,
	federatedUrl: React.PropTypes.string,
	buttonLabel: React.PropTypes.string,
	federatedLabel: React.PropTypes.string,
	basicLabel: React.PropTypes.string,
	userPlaceholder: React.PropTypes.string,
	passwordPlaceholder: React.PropTypes.string
}

LoginComponent.defaultProps = {
	buttonLabel: "Login",
	federatedLabel: "Federated Login",
	basicLabel: "Basic Login",
	userPlaceholder: "Username or email address",
	passwordPlaceholder: "Password"
};


export default LoginComponent;