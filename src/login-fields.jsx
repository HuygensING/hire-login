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
		console.log(this.state.username);
	}

	onPasswordChange(ev) {
		this.setState({password: ev.target.value});
		console.log(this.state.password);
	}

	clickit() {
		console.log('ci')
	}

	render() {
		let wl = window.location;
		let hsURL = wl.origin + wl.pathname;
		console.log("R", this)

		return  (
			<div>
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
				<button>{this.props.buttonLabel}</button>
			</div>
		);
	}
}

export default LoginFields;

// <form 
// 	action={this.props.federatedUrl}
// 	method="POST">
// 	<input name="hsurl" value={hsURL} type="hidden" />
// 	<button type="submit">
// 		{this.props.federatedLabel}
// 	</button>
// </form>