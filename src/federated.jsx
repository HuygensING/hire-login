import React from "react";
import loginStore from "./login-store";


class Federated extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let hsURL = window.location.href;

		return (
			<form 
			 	action={this.props.url}
			 	method="POST">
			 	<input name="hsurl" value={hsURL} type="hidden" />
			 	<button type="submit">
			 		{this.props.label}
			 	</button>
			</form>
		);
	}
}

Federated.propTypes = {
	url: React.PropTypes.string.isRequired,
	label: React.PropTypes.string
}

Federated.defaultProps = {
	label: "Federated Login"
};


export default Federated;

