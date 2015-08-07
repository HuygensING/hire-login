import jsdom from "jsdom";
import React from "react/addons";
import should from "should";
import Federated from "../src/federated";


let TestUtils = React.addons.TestUtils;

global.document = jsdom.jsdom("<html><head><script></script></head><body></body></html>");
global.window = document.defaultView;



describe("Federated", function() {
	it("should be a ReactElement", function() {
		TestUtils.isElement(<Federated url="dummy-url" />);
	});

	it("Should render a form into the document with the action set to the url property", function() {
		window.location = {href: "http://test.me" };
		let rendered = TestUtils.renderIntoDocument(
			<Federated url="dummy-url" label="dummy-label" />
		);

		let form = TestUtils.findRenderedDOMComponentWithTag(
			rendered,
			'form'
		);
		let submit = TestUtils.findRenderedDOMComponentWithTag(
			rendered,
			'button'
		);
		let input = TestUtils.findRenderedDOMComponentWithTag(
			rendered,
			'input'
		);
		form.props.action.should.equal("dummy-url");
		input.props.name.should.equal("hsurl");
		input.props.value.should.equal(window.location.href);
		submit.props.children.should.equal("dummy-label");

	});

	it("Should declare the proper proptypes and set default label", function() {
		Federated.propTypes.label.should.equal(React.PropTypes.string);
		Federated.propTypes.url.should.equal(React.PropTypes.string.isRequired);
		Federated.defaultProps.label.should.equal("Federated Login");
	});
});