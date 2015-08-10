import React from "react/addons";
import should from "should";
import sinon from "sinon";
import Basic from "../src/basic";
import api from "../src/api";

let TestUtils = React.addons.TestUtils;

describe("Basic", function() {
	it("should be a ReactElement", function() {
		TestUtils.isElement(<Basic url="dummy-url" />);
	});

	function renderToDoc() {
		let rendered = TestUtils.renderIntoDocument(
			<Basic  label="button-label" passwordPlaceholder="pph" url="dummy-url" userPlaceholder="uph" />
		);

		let inputs = TestUtils.scryRenderedDOMComponentsWithTag(
			rendered,
			'input'
		);

		let button = TestUtils.findRenderedDOMComponentWithTag(
			rendered,
			'button'
		);
		return [rendered, inputs, button];		
	}
	
	it("Should two inputs and a button into the document with the proper props", function() {
		let [rendered, inputs, button] = renderToDoc();
		inputs[0].props.placeholder.should.equal("uph");
		inputs[0].props.type.should.equal("text");
		inputs[1].props.placeholder.should.equal("pph");
		inputs[1].props.type.should.equal("password");
		button.props.children.should.equal("button-label");
	});

	it("Should submit the user and password to api.basicLogin() on button click or when Enter is pressed", function() {
		let [rendered, inputs, button] = renderToDoc();
		TestUtils.Simulate.change(inputs[0], {target: {value: 'dummy-user'}});
		TestUtils.Simulate.change(inputs[1], {target: {value: 'dummy-password'}});
		sinon.stub(api, 'basicLogin', function(url, username, password) {
			url.should.equal('dummy-url');
			username.should.equal('dummy-user');
			password.should.equal('dummy-password');
		});

		TestUtils.Simulate.click(button);
		TestUtils.Simulate.keyDown(inputs[0], {keyCode: 13});
		TestUtils.Simulate.keyDown(inputs[1], {keyCode: 13});

		sinon.assert.calledThrice(api.basicLogin);
		api.basicLogin.restore();
	});

});