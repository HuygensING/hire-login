import React from "react";
import auth from "./auth";
import loginStore from "./login-store";
import dispatcher from "./dispatcher";

class LoginComponent extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			opened: false,
			authenticated: false,
			errorMessage: null
		}

		auth.init({
			userInfoUrl: this.props.userInfoUrl,
			VRE_ID: this.props.VRE_ID,
			onAuthSuccess: this.onAuthSuccess.bind(this),
			onAuthError: this.onAuthError.bind(this)
		});
	}


	onStoreChange() {
		this.setState({errorMessage: loginStore.getState().errorMessage});
		console.log("Store change", loginStore.getState());

	}

	toggleLogin(ev) {
		this.setState({opened: !this.state.opened});
	}

	onAuthSuccess() {
		this.setState({authenticated: true, errorMessage: ""});
		this.props.onChange({
			authenticated: true,
			userData: auth.userData
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
		loginStore.listen(this.onStoreChange.bind(this));

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
		loginStore.stopListening(this.onStoreChange.bind(this));

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
					{auth.userData.displayName}
				</div>
			)
		} else {
			let loginFields = this.state.opened ?
				(<ul>
					{React.Children.map(this.props.children, function(child) { console.log(child); return (<li>{child}</li>); }) }
					<li className="hire-login-error">{this.state.errorMessage}</li>
				</ul>) 
				:
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
				</div>
			);
		}
	}
}

LoginComponent.propTypes = {
	VRE_ID: React.PropTypes.string,
	userInfoUrl: React.PropTypes.string,
	loggedInLabel: React.PropTypes.string,
	onChange: React.PropTypes.func.isRequired
}

LoginComponent.defaultProps = {
	buttonLabel: "Login",
	loggedInLabel: "Logged in as",
	VRE_ID: null
};

export default LoginComponent;