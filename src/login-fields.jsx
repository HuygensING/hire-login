import React from "react";


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
		this.props.auth.basicLogin(this.state.username, this.state.password);
	}

	onAuthSuccess() {
		console.log("auth success callback");
	}

	onKeyDown(ev) {
		if(ev.keyCode === 13) {
			this.onBasicLoginClick();
		}
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

export default LoginFields;