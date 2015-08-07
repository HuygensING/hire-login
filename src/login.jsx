import React from "react";
import loginStore from "./login-store";
import dispatcher from "./dispatcher";
import Federated from "./federated";
import api from "./api";

class LoginComponent extends React.Component {

	constructor(props) {
		super(props);

		loginStore.setTokenPropertyName(this.props.appId);
		this.state = loginStore.getState();
		this.state.opened = false;
		this.state.initialized = loginStore.getToken() === null;
	}


	onStoreChange() {
		this.setState(loginStore.getState());

		if(this.state.token != null && !this.state.authenticated) {
			api.fetchUserData(this.props.userUrl, this.state.token, this.props.headers);
		} else {
			this.props.onChange(loginStore.getState());
		}
		this.setState({initialized: true});
	}

	toggleLogin(ev) {
		this.setState({opened: !this.state.opened});
	}

	componentDidMount() {
		loginStore.listen(this.onStoreChange.bind(this));

		if(this.state.token != null) {
			api.fetchUserData(this.props.userUrl, this.state.token, this.props.headers);			
		}

		document.addEventListener("click", this.handleDocumentClick.bind(this), false);
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
		if(!this.state.initialized) {
			return (<div />)
		} 

		if(this.state.authenticated) {
			return (
				<div className="hire-login">
					{this.props.loggedInLabel ? this.props.loggedInLabel + " " : ""}
					{this.state.userData.displayName}
				</div>
			)
		}
		return (
			<div className="hire-login">
				<button className={this.state.opened ? 'toggle-opened' : 'toggle-closed'}
					onClick={this.toggleLogin.bind(this)}>
					{this.props.buttonLabel}
				</button>
				<div style={this.state.opened ? {display: "block"} : {display: "none"}}>
					{React.Children.map(this.props.children, function(child) { return (<div>{child}</div>); }) }
					<div className="hire-login-error">{this.state.errorMessage}</div>
				</div>
			</div>
		);

	}
}

LoginComponent.propTypes = {
	appId: React.PropTypes.string,
	buttonLabel: React.PropTypes.string,
	children: React.PropTypes.node,
	headers: React.PropTypes.object,
	loggedInLabel: React.PropTypes.string,
	onChange: React.PropTypes.func.isRequired,
	userUrl: React.PropTypes.string.isRequired

}

LoginComponent.defaultProps = {
	buttonLabel: "Login",
	loggedInLabel: "Logged in as",
	appId: "default-login",
	headers: {}
};

export default LoginComponent;