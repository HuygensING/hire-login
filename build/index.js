(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.HireFormsLogin = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = _dereq_("react");

var _react2 = _interopRequireDefault(_react);

var _loginFields = _dereq_("./login-fields");

var _loginFields2 = _interopRequireDefault(_loginFields);

var LoginComponent = (function (_React$Component) {
	_inherits(LoginComponent, _React$Component);

	function LoginComponent(props) {
		_classCallCheck(this, LoginComponent);

		_get(Object.getPrototypeOf(LoginComponent.prototype), "constructor", this).call(this, props);
		this.state = {
			opened: false
		};
	}

	_createClass(LoginComponent, [{
		key: "toggleLogin",
		value: function toggleLogin(ev) {
			console.log("tog");
			this.setState({ opened: !this.state.opened });
			console.log(this.state.opened);
		}
	}, {
		key: "render",
		value: function render() {
			console.log(this.state);

			var loginFields = this.state.opened ? _react2["default"].createElement(_loginFields2["default"], this.props) : null;

			return _react2["default"].createElement(
				"div",
				{ className: "hire-forms-login" },
				_react2["default"].createElement(
					"div",
					null,
					_react2["default"].createElement(
						"button",
						{ className: "login-toggle",
							onClick: this.toggleLogin.bind(this) },
						this.props.buttonLabel
					)
				),
				loginFields
			);
		}
	}]);

	return LoginComponent;
})(_react2["default"].Component);

LoginComponent.propTypes = {
	VRE_ID: _react2["default"].PropTypes.string,
	basicUrl: _react2["default"].PropTypes.string,
	federatedUrl: _react2["default"].PropTypes.string,
	buttonLabel: _react2["default"].PropTypes.string,
	federatedLabel: _react2["default"].PropTypes.string,
	basicLabel: _react2["default"].PropTypes.string,
	userPlaceholder: _react2["default"].PropTypes.string,
	passwordPlaceholder: _react2["default"].PropTypes.string
};

LoginComponent.defaultProps = {
	buttonLabel: "Login",
	federatedLabel: "Federated Login",
	basicLabel: "Basic Login",
	userPlaceholder: "Username or email address",
	passwordPlaceholder: "Password"
};

exports["default"] = LoginComponent;
module.exports = exports["default"];

},{"./login-fields":2,"react":"react"}],2:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = _dereq_("react");

var _react2 = _interopRequireDefault(_react);

var LoginFields = (function (_React$Component) {
	_inherits(LoginFields, _React$Component);

	function LoginFields(props) {
		_classCallCheck(this, LoginFields);

		_get(Object.getPrototypeOf(LoginFields.prototype), "constructor", this).call(this, props);
		this.state = {
			username: "",
			password: ""
		};
	}

	_createClass(LoginFields, [{
		key: "onUserChange",
		value: function onUserChange(ev) {
			this.setState({ username: ev.target.value });
			console.log(this.state.username);
		}
	}, {
		key: "onPasswordChange",
		value: function onPasswordChange(ev) {
			this.setState({ password: ev.target.value });
			console.log(this.state.password);
		}
	}, {
		key: "clickit",
		value: function clickit() {
			console.log('ci');
		}
	}, {
		key: "render",
		value: function render() {
			var wl = window.location;
			var hsURL = wl.origin + wl.pathname;
			console.log("R", this);

			return _react2["default"].createElement(
				"div",
				null,
				_react2["default"].createElement(
					"h3",
					null,
					this.props.basicLabel
				),
				_react2["default"].createElement("input", {
					onChange: this.onUserChange.bind(this),
					type: "text",
					placeholder: this.props.userPlaceholder,
					value: this.state.username }),
				_react2["default"].createElement("input", { onChange: this.onPasswordChange.bind(this),
					type: "password",
					placeholder: this.props.passwordPlaceholder,
					value: this.state.password }),
				_react2["default"].createElement(
					"button",
					null,
					this.props.buttonLabel
				)
			);
		}
	}]);

	return LoginFields;
})(_react2["default"].Component);

exports["default"] = LoginFields;

// <form
// 	action={this.props.federatedUrl}
// 	method="POST">
// 	<input name="hsurl" value={hsURL} type="hidden" />
// 	<button type="submit">
// 		{this.props.federatedLabel}
// 	</button>
// </form>
module.exports = exports["default"];

},{"react":"react"}]},{},[1])(1)
});
