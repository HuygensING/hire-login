var jsdom = require("jsdom");
global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');

import React from "react/addons";
import should from "should";
import sinon from "sinon";
import api from "../src/api";
import serverActions from "../src/actions";


import Login from "../src/login";
import loginStore from "../src/login-store"


let TestUtils = React.addons.TestUtils;



describe("Login", function() {

	it("should be a ReactElement", function() {
		TestUtils.isElement(<Login onChange={function() {}} userUrl="dummy-url" />);
	});



	function renderInitialComponent(options) {
		let opts = options || {};

		if(opts.stubAPI) { sinon.stub(api, 'fetchUserData'); }

		sinon.stub(loginStore, 'getToken', function() { return opts.myToken || null; });
		sinon.stub(loginStore, 'getState', function() {
			return opts.myState || {authenticated: false, token: null}
		});
		let rendered = TestUtils.renderIntoDocument(
			<Login appId="dummy-id" headers={{'dummy': 'hdr'}} onChange={opts.onChangeFunc || function() {}} userUrl="dummy-url">
				{opts.myChildren || null}
			</Login>
		);

		if(opts.stubAPI) { api.fetchUserData.restore(); }
		loginStore.getState.restore();
		loginStore.getToken.restore();
		return rendered;
	}

	it("Should add correct state and store change listener when rendered into the document and try and call fetchUserData() with a token", function() {
		sinon.stub(loginStore, 'setTokenPropertyName', function(appId) {
			appId.should.equal('dummy-id');
			loginStore.tokenPropertyName = "tpn";
		});
		sinon.stub(loginStore, 'listen', function(f) {
			f.should.be.an.instanceOf(Function);
		});
		sinon.stub(api, 'fetchUserData', function(url, token, headers) {
			url.should.equal('dummy-url');
			token.should.equal('test-token');
			headers.dummy.should.equal('hdr');
		});


		let rendered = renderInitialComponent({
			myToken: 'test-token',
			myState: {'token': 'test-token'}
		});

		sinon.assert.calledOnce(loginStore.setTokenPropertyName);
		sinon.assert.calledOnce(loginStore.listen);
		sinon.assert.calledOnce(api.fetchUserData);

		loginStore.setTokenPropertyName.restore();
		loginStore.listen.restore();
		api.fetchUserData.restore();
	});

	it("should render its children on initialization", function() {
		let rendered = renderInitialComponent({
			myChildren: (<div><div className="login-child" /><div className="login-child" /></div>)
		});
		let childDivs = TestUtils.scryRenderedDOMComponentsWithClass(
			rendered,
			'login-child'
		);
		childDivs.length.should.equal(2);
	});

	it("should render the user display name property when logged in", function() {
		let rendered = renderInitialComponent({
			myToken: 'test-token',
			myState: {token: 'test-token', authenticated: true, initialized: true, userData: {displayName: 'dummy-display-name'}},
			stubAPI: true
		});

		let div = TestUtils.findRenderedDOMComponentWithClass(
			rendered,
			'login-status'
		);
		div.props.children[0].should.equal('Logged in as ');
		div.props.children[1].should.equal('dummy-display-name');
	});

});