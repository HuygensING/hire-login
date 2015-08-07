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
			<Federated url="dummy-url" />
		);

		let form = TestUtils.findRenderedDOMComponentWithTag(
			rendered,
			'form'
		);

		form.props.action.should.equal("dummy-url");
	});
});