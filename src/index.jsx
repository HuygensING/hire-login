import React from "react";
import LoginFields from "./login-fields";
import Auth from "./auth";

class LoginComponent extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			opened: false,
			authenticated: false,
			errorMessage: null
		}

		this.props.auth.init({
			url: this.props.basicUrl, 
			userInfoUrl: this.props.userInfoUrl,
			VRE_ID: this.props.VRE_ID,
			tokenPrefix: this.props.tokenPrefix,
			onAuthSuccess: this.onAuthSuccess.bind(this),
			onAuthError: this.onAuthError.bind(this)
		});
	}

	toggleLogin(ev) {
		this.setState({opened: !this.state.opened});
	}

	onAuthSuccess() {
		this.setState({authenticated: true});
		this.props.onChange({
			authenticated: true,
			userData: this.props.auth.userData
		});
	}

	onAuthError(msg) {
		this.setState({authenticated: false, errorMessage: msg});
		this.props.onChange({
			authenticated: false,
			userData: null
		});
	}

	componentDidMount() {
		document.addEventListener("click", this.handleDocumentClick.bind(this), false);

		if (this.props.async != null) {
			this.props.async((response) => {
				this.setState({
					options: response
				});
			});
		}
	}

	componentWillUnmount() {
		document.removeEventListener("click", this.handleDocumentClick.bind(this), false);
	}

	handleDocumentClick(ev) {
		if (this.state.opened && !React.findDOMNode(this).contains(ev.target)) {
			this.setState({
				opened: false
			});
		}
	}

	render() {
		if(this.state.authenticated) {
			return (
				<div className="hire-login">
					{this.props.loggedInLabel ? this.props.loggedInLabel + " " : ""}
					{this.props.auth.userData.displayName}
				</div>
			)
		} else {
			let loginFields = this.state.opened ?
				<LoginFields {...this.props}  /> :
				null;

			return (
				<div className="hire-login">
					<div>
						<button className="login-toggle" 
							onClick={this.toggleLogin.bind(this)}>
							{this.props.buttonLabel}
						</button>
					</div>
					{loginFields}
					<div class="hire-login-error">{this.state.errorMessage}</div>
				</div>
			);
		}
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
	loggedInLabel: React.PropTypes.string,
	passwordPlaceholder: React.PropTypes.string,
	tokenPrefix: React.PropTypes.string,
	onChange: React.PropTypes.func.isRequired,
	auth: React.PropTypes.object
}

LoginComponent.defaultProps = {
	buttonLabel: "Login",
	federatedLabel: "Federated Login",
	basicLabel: "Basic Login",
	userPlaceholder: "Username or email address",
	passwordPlaceholder: "Password",
	loggedInLabel: "Logged in as",
	tokenPrefix: "",
	VRE_ID: null,
	auth: new Auth()
};


export default LoginComponent;