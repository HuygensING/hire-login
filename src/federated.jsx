import React from "react";
import loginStore from "./login-store";


class Federated extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let hsURL = window.location.href;

		return (
			<form className="login-sub-component"
			 	action={this.props.url}
			 	method="POST">
			 	<input name="hsurl"  type="hidden" value={hsURL} />
			 	<button type="submit">
			 		{this.props.label}
			 	</button>
			</form>
		);
	}
}

Federated.propTypes = {
	label: React.PropTypes.string,
	url: React.PropTypes.string.isRequired
}

Federated.defaultProps = {
	label: "Federated Login"
};


export default Federated;

