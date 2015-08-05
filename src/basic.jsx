import React from "react";
import auth from "./auth";
import loginStore from "./login-store";
import api from "./api";

class Basic extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			username: "",
			password: ""
		}
	}

	onUserChange(ev) {
		this.setState({username: ev.target.value});
	}

	onPasswordChange(ev) {
		this.setState({password: ev.target.value});
	}

	onBasicLoginClick(ev) {
		api.basicLogin(this.props.url, this.state.username, this.state.password);
	}

	onKeyDown(ev) {
		if(ev.keyCode === 13) {
			this.onBasicLoginClick();
		}
	}
	render() {
		return  (
			<div>
				<h3>{this.props.label}</h3>
				<input
					onKeyDown={this.onKeyDown.bind(this)}
					onChange={this.onUserChange.bind(this)}
					type="text" 
					placeholder={this.props.userPlaceholder}  
					value={this.state.username} />
				<input onChange={this.onPasswordChange.bind(this)}
					onKeyDown={this.onKeyDown.bind(this)}
					type="password" 
					placeholder={this.props.passwordPlaceholder} 
					value={this.state.password} />
				<button onClick={this.onBasicLoginClick.bind(this)}>{this.props.buttonLabel}</button>
			</div>
		);
	}
}

Basic.propTypes = {
	url: React.PropTypes.string.isRequired,
	buttonLabel: React.PropTypes.string,
	label: React.PropTypes.string,
	userPlaceholder: React.PropTypes.string,
	passwordPlaceholder: React.PropTypes.string,
	label: React.PropTypes.string
}

Basic.defaultProps = {
	buttonLabel: "Login",
	label: "Basic Login",
	userPlaceholder: "Username or email address",
	passwordPlaceholder: "Password"	
};


export default Basic;