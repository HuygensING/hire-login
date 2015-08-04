import React from "react";
import Auth from "./auth";

class LoginFields extends React.Component {
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
		new Auth(this.state.username, this.state.password, this.props.basicUrl, this.props.VRE_ID).basicLogin();
	}

	render() {
		let hsURL = window.location.href;
		return  (
			<div>
				<form 
				 	action={this.props.federatedUrl}
				 	method="POST">
				 	<input name="hsurl" value={hsURL} type="hidden" />
				 	<button type="submit">
				 		{this.props.federatedLabel}
				 	</button>
				</form>
				<h3>{this.props.basicLabel}</h3>
				<input
					onChange={this.onUserChange.bind(this)}
					type="text" 
					placeholder={this.props.userPlaceholder}  
					value={this.state.username} />
				<input onChange={this.onPasswordChange.bind(this)}
					type="password" 
					placeholder={this.props.passwordPlaceholder} 
					value={this.state.password} />
				<button onClick={this.onBasicLoginClick.bind(this)}>{this.props.buttonLabel}</button>
			</div>
		);
	}
}

export default LoginFields;