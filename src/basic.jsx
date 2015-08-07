import React from "react";
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
					onChange={this.onUserChange.bind(this)}
					onKeyDown={this.onKeyDown.bind(this)}
					placeholder={this.props.userPlaceholder}  
					type="text" 
					value={this.state.username} />
				<input onChange={this.onPasswordChange.bind(this)}
					onKeyDown={this.onKeyDown.bind(this)}
					placeholder={this.props.passwordPlaceholder} 
					type="password" 
					value={this.state.password} />
				<button onClick={this.onBasicLoginClick.bind(this)}>{this.props.buttonLabel}</button>
			</div>
		);
	}
}

Basic.propTypes = {
	buttonLabel: React.PropTypes.string,
	label: React.PropTypes.string,
	label: React.PropTypes.string,
	passwordPlaceholder: React.PropTypes.string,
	url: React.PropTypes.string.isRequired,
	userPlaceholder: React.PropTypes.string
}

Basic.defaultProps = {
	buttonLabel: "Login",
	label: "Basic Login",
	userPlaceholder: "Username or email address",
	passwordPlaceholder: "Password"
};


export default Basic;