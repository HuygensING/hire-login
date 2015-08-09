import jsdom from "jsdom";
import React from "react/addons";
import should from "should";
import Basic from "../src/basic";


let TestUtils = React.addons.TestUtils;

global.document = jsdom.jsdom("<html><head><script></script></head><body></body></html>");
global.window = document.defaultView;



describe("Basic", function() {
	it("should be a ReactElement", function() {
		TestUtils.isElement(<Basic url="dummy-url" />);
	});
});