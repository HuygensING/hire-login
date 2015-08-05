import React from "react";

class Federated extends React.Component {

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
	tokenPrefix: React.PropTypes.string,
	label: React.PropTypes.string
}

Federated.defaultProps = {
	label: "Federated Login",
	tokenPrefix: ""
};


export default Federated;

