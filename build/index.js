(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.HireFormsLogin = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(_dereq_,module,exports){
/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports.Dispatcher = _dereq_('./lib/Dispatcher')

},{"./lib/Dispatcher":3}],3:[function(_dereq_,module,exports){
/*
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Dispatcher
 * @typechecks
 */

"use strict";

var invariant = _dereq_('./invariant');

var _lastID = 1;
var _prefix = 'ID_';

/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *    CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *
 *         case 'city-update':
 *           FlightPriceStore.price =
 *             FlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

  function Dispatcher() {
    this.$Dispatcher_callbacks = {};
    this.$Dispatcher_isPending = {};
    this.$Dispatcher_isHandled = {};
    this.$Dispatcher_isDispatching = false;
    this.$Dispatcher_pendingPayload = null;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   *
   * @param {function} callback
   * @return {string}
   */
  Dispatcher.prototype.register=function(callback) {
    var id = _prefix + _lastID++;
    this.$Dispatcher_callbacks[id] = callback;
    return id;
  };

  /**
   * Removes a callback based on its token.
   *
   * @param {string} id
   */
  Dispatcher.prototype.unregister=function(id) {
    invariant(
      this.$Dispatcher_callbacks[id],
      'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
      id
    );
    delete this.$Dispatcher_callbacks[id];
  };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   *
   * @param {array<string>} ids
   */
  Dispatcher.prototype.waitFor=function(ids) {
    invariant(
      this.$Dispatcher_isDispatching,
      'Dispatcher.waitFor(...): Must be invoked while dispatching.'
    );
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (this.$Dispatcher_isPending[id]) {
        invariant(
          this.$Dispatcher_isHandled[id],
          'Dispatcher.waitFor(...): Circular dependency detected while ' +
          'waiting for `%s`.',
          id
        );
        continue;
      }
      invariant(
        this.$Dispatcher_callbacks[id],
        'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
        id
      );
      this.$Dispatcher_invokeCallback(id);
    }
  };

  /**
   * Dispatches a payload to all registered callbacks.
   *
   * @param {object} payload
   */
  Dispatcher.prototype.dispatch=function(payload) {
    invariant(
      !this.$Dispatcher_isDispatching,
      'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.'
    );
    this.$Dispatcher_startDispatching(payload);
    try {
      for (var id in this.$Dispatcher_callbacks) {
        if (this.$Dispatcher_isPending[id]) {
          continue;
        }
        this.$Dispatcher_invokeCallback(id);
      }
    } finally {
      this.$Dispatcher_stopDispatching();
    }
  };

  /**
   * Is this Dispatcher currently dispatching.
   *
   * @return {boolean}
   */
  Dispatcher.prototype.isDispatching=function() {
    return this.$Dispatcher_isDispatching;
  };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   *
   * @param {string} id
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_invokeCallback=function(id) {
    this.$Dispatcher_isPending[id] = true;
    this.$Dispatcher_callbacks[id](this.$Dispatcher_pendingPayload);
    this.$Dispatcher_isHandled[id] = true;
  };

  /**
   * Set up bookkeeping needed when dispatching.
   *
   * @param {object} payload
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_startDispatching=function(payload) {
    for (var id in this.$Dispatcher_callbacks) {
      this.$Dispatcher_isPending[id] = false;
      this.$Dispatcher_isHandled[id] = false;
    }
    this.$Dispatcher_pendingPayload = payload;
    this.$Dispatcher_isDispatching = true;
  };

  /**
   * Clear bookkeeping used for dispatching.
   *
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_stopDispatching=function() {
    this.$Dispatcher_pendingPayload = null;
    this.$Dispatcher_isDispatching = false;
  };


module.exports = Dispatcher;

},{"./invariant":4}],4:[function(_dereq_,module,exports){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (false) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

},{}],5:[function(_dereq_,module,exports){
var inserted = {};

module.exports = function (css, options) {
    if (inserted[css]) return;
    inserted[css] = true;
    
    var elem = document.createElement('style');
    elem.setAttribute('type', 'text/css');

    if ('textContent' in elem) {
      elem.textContent = css;
    } else {
      elem.styleSheet.cssText = css;
    }
    
    var head = document.getElementsByTagName('head')[0];
    if (options && options.prepend) {
        head.insertBefore(elem, head.childNodes[0]);
    } else {
        head.appendChild(elem);
    }
};

},{}],6:[function(_dereq_,module,exports){
"use strict";
var window = _dereq_("global/window")
var once = _dereq_("once")
var parseHeaders = _dereq_("parse-headers")



module.exports = createXHR
createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest


function isEmpty(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)) return false
    }
    return true
}

function createXHR(options, callback) {
    function readystatechange() {
        if (xhr.readyState === 4) {
            loadFunc()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else if (xhr.responseType === "text" || !xhr.responseType) {
            body = xhr.responseText || xhr.responseXML
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }
    
    var failureResponse = {
                body: undefined,
                headers: {},
                statusCode: 0,
                method: method,
                url: uri,
                rawRequest: xhr
            }
    
    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "unknown") )
        }
        evt.statusCode = 0
        callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        if (aborted) return
        var status
        clearTimeout(timeoutTimer)
        if(options.useXDR && xhr.status===undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200
        } else {
            status = (xhr.status === 1223 ? 204 : xhr.status)
        }
        var response = failureResponse
        var err = null
        
        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        callback(err, response, response.body)
        
    }
    
    if (typeof options === "string") {
        options = { uri: options }
    }

    options = options || {}
    if(typeof callback === "undefined"){
        throw new Error("callback argument missing")
    }
    callback = once(callback)

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest()
        }else{
            xhr = new createXHR.XMLHttpRequest()
        }
    }

    var key
    var aborted
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer

    if ("json" in options) {
        isJson = true
        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["Content-Type"] = "application/json"
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync, options.username, options.password)
    //has to be after open
    if(!sync) {
        xhr.withCredentials = !!options.withCredentials
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            aborted=true//IE9 may still call readystatechange
            xhr.abort("timeout")
            errorFunc();
        }, options.timeout )
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }
    
    if ("beforeSend" in options && 
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr


}

function noop() {}

},{"global/window":7,"once":8,"parse-headers":12}],7:[function(_dereq_,module,exports){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

},{}],8:[function(_dereq_,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}

},{}],9:[function(_dereq_,module,exports){
var isFunction = _dereq_('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":10}],10:[function(_dereq_,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],11:[function(_dereq_,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],12:[function(_dereq_,module,exports){
var trim = _dereq_('trim')
  , forEach = _dereq_('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":9,"trim":11}],13:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _dispatcher = _dereq_("./dispatcher");

var _dispatcher2 = _interopRequireDefault(_dispatcher);

exports["default"] = {
	logout: function logout() {
		_dispatcher2["default"].handleViewAction({ actionType: "LOGOUT" });
	},

	receiveBasicLogin: function receiveBasicLogin(err, resp, body) {
		if (resp.statusCode >= 400) {
			_dispatcher2["default"].handleServerAction({
				actionType: "BASIC_LOGIN_FAILURE",
				data: resp
			});
		} else if (resp.statusCode >= 200 && resp.statusCode < 300) {
			_dispatcher2["default"].handleServerAction({
				actionType: "BASIC_LOGIN_SUCCESS",
				data: resp
			});
		}
	},

	receiveUserData: function receiveUserData(err, resp, body) {
		if (resp.statusCode >= 400) {
			_dispatcher2["default"].handleServerAction({
				actionType: "USER_DATA_FAILURE",
				data: resp
			});
		} else if (resp.statusCode >= 200 && resp.statusCode < 300) {
			_dispatcher2["default"].handleServerAction({
				actionType: "USER_DATA_SUCCESS",
				data: resp
			});
		}
	}
};
module.exports = exports["default"];

},{"./dispatcher":16}],14:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _xhr = _dereq_("xhr");

var _xhr2 = _interopRequireDefault(_xhr);

var _dispatcher = _dereq_("./dispatcher");

var _dispatcher2 = _interopRequireDefault(_dispatcher);

var _actions = _dereq_("./actions");

var _actions2 = _interopRequireDefault(_actions);

exports["default"] = {
	performXhr: function performXhr(opts, callback) {
		(0, _xhr2["default"])(opts, callback);
	},

	basicLogin: function basicLogin(url, username, password) {
		this.performXhr({
			method: 'POST',
			uri: url,
			headers: {
				Accept: "application/json",
				Authorization: 'Basic ' + btoa(username + ':' + password)
			}
		}, _actions2["default"].receiveBasicLogin);
	},

	fetchUserData: function fetchUserData(url, token, optHeaders) {
		var headers = optHeaders || {};
		_extends(headers, {
			Accept: "application/json",
			Authorization: token
		});

		this.performXhr({
			method: 'GET',
			uri: url,
			headers: headers
		}, _actions2["default"].receiveUserData);
	}
};
module.exports = exports["default"];

},{"./actions":13,"./dispatcher":16,"xhr":6}],15:[function(_dereq_,module,exports){
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

var _loginStore = _dereq_("./login-store");

var _loginStore2 = _interopRequireDefault(_loginStore);

var _api = _dereq_("./api");

var _api2 = _interopRequireDefault(_api);

var Basic = (function (_React$Component) {
	_inherits(Basic, _React$Component);

	function Basic(props) {
		_classCallCheck(this, Basic);

		_get(Object.getPrototypeOf(Basic.prototype), "constructor", this).call(this, props);
		this.state = {
			username: "",
			password: ""
		};
	}

	_createClass(Basic, [{
		key: "onUserChange",
		value: function onUserChange(ev) {
			this.setState({ username: ev.target.value });
		}
	}, {
		key: "onPasswordChange",
		value: function onPasswordChange(ev) {
			this.setState({ password: ev.target.value });
		}
	}, {
		key: "onBasicLoginClick",
		value: function onBasicLoginClick(ev) {
			_api2["default"].basicLogin(this.props.url, this.state.username, this.state.password);
		}
	}, {
		key: "onKeyDown",
		value: function onKeyDown(ev) {
			if (ev.keyCode === 13) {
				this.onBasicLoginClick();
			}
		}
	}, {
		key: "render",
		value: function render() {
			return _react2["default"].createElement(
				"div",
				{ className: "login-sub-component" },
				_react2["default"].createElement("input", {
					onChange: this.onUserChange.bind(this),
					onKeyDown: this.onKeyDown.bind(this),
					placeholder: this.props.userPlaceholder,
					type: "text",
					value: this.state.username }),
				_react2["default"].createElement("input", { onChange: this.onPasswordChange.bind(this),
					onKeyDown: this.onKeyDown.bind(this),
					placeholder: this.props.passwordPlaceholder,
					type: "password",
					value: this.state.password }),
				_react2["default"].createElement(
					"button",
					{ onClick: this.onBasicLoginClick.bind(this) },
					this.props.label
				)
			);
		}
	}]);

	return Basic;
})(_react2["default"].Component);

Basic.propTypes = {
	label: _react2["default"].PropTypes.string,
	passwordPlaceholder: _react2["default"].PropTypes.string,
	url: _react2["default"].PropTypes.string.isRequired,
	userPlaceholder: _react2["default"].PropTypes.string
};

Basic.defaultProps = {
	label: "Basic Login",
	userPlaceholder: "Username or email address",
	passwordPlaceholder: "Password"
};

exports["default"] = Basic;
module.exports = exports["default"];

},{"./api":14,"./login-store":19,"react":"react"}],16:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _flux = _dereq_("flux");

var LoginDispatcher = (function (_Dispatcher) {
	_inherits(LoginDispatcher, _Dispatcher);

	function LoginDispatcher() {
		_classCallCheck(this, LoginDispatcher);

		_get(Object.getPrototypeOf(LoginDispatcher.prototype), "constructor", this).apply(this, arguments);
	}

	_createClass(LoginDispatcher, [{
		key: "handleServerAction",
		value: function handleServerAction(action) {
			return this.dispatch({
				source: "SERVER_ACTION",
				action: action
			});
		}
	}, {
		key: "handleViewAction",
		value: function handleViewAction(action) {
			return this.dispatch({
				source: "VIEW_ACTION",
				action: action
			});
		}
	}]);

	return LoginDispatcher;
})(_flux.Dispatcher);

exports["default"] = new LoginDispatcher();
module.exports = exports["default"];

},{"flux":2}],17:[function(_dereq_,module,exports){
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

var _loginStore = _dereq_("./login-store");

var _loginStore2 = _interopRequireDefault(_loginStore);

var Federated = (function (_React$Component) {
	_inherits(Federated, _React$Component);

	function Federated(props) {
		_classCallCheck(this, Federated);

		_get(Object.getPrototypeOf(Federated.prototype), "constructor", this).call(this, props);
	}

	_createClass(Federated, [{
		key: "render",
		value: function render() {
			var hsURL = window.location.href;

			return _react2["default"].createElement(
				"form",
				{ className: "login-sub-component",
					action: this.props.url,
					method: "POST" },
				_react2["default"].createElement("input", { name: "hsurl", type: "hidden", value: hsURL }),
				_react2["default"].createElement(
					"button",
					{ type: "submit" },
					this.props.label
				)
			);
		}
	}]);

	return Federated;
})(_react2["default"].Component);

Federated.propTypes = {
	label: _react2["default"].PropTypes.string,
	url: _react2["default"].PropTypes.string.isRequired
};

Federated.defaultProps = {
	label: "Federated Login"
};

exports["default"] = Federated;
module.exports = exports["default"];

},{"./login-store":19,"react":"react"}],18:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _login = _dereq_("./login");

var _login2 = _interopRequireDefault(_login);

var _federated = _dereq_("./federated");

var _federated2 = _interopRequireDefault(_federated);

var _basic = _dereq_("./basic");

var _basic2 = _interopRequireDefault(_basic);

var _insertCss = _dereq_("insert-css");

var _insertCss2 = _interopRequireDefault(_insertCss);


var css = Buffer("LmhpcmUtbG9naW57dGV4dC1hbGlnbjpsZWZ0fS5oaXJlLWxvZ2luIC5sb2dpbi1mb3Jte3Bvc2l0aW9uOmFic29sdXRlO3otaW5kZXg6MTAwMDA7YmFja2dyb3VuZC1jb2xvcjojZmZmfS5oaXJlLWxvZ2luIGlucHV0e2Rpc3BsYXk6YmxvY2t9LmhpcmUtbG9naW4gLmxvZ2luLWZvcm0gYnV0dG9ue3dpZHRoOjc1JX0uaGlyZS1sb2dpbiAubG9naW4tc3ViLWNvbXBvbmVudHtwYWRkaW5nOjEycHh9LmhpcmUtbG9naW4gLmhpcmUtbG9naW4tZXJyb3J7Y29sb3I6I2YwMDtmb250LXdlaWdodDpib2xkfQ==","base64");

(0, _insertCss2["default"])(css, { prepend: true });

exports.Login = _login2["default"];
exports.Federated = _federated2["default"];
exports.Basic = _basic2["default"];

},{"./basic":15,"./federated":17,"./login":20,"insert-css":5}],19:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = _dereq_("events");

var _dispatcher = _dereq_("./dispatcher");

var _dispatcher2 = _interopRequireDefault(_dispatcher);

var CHANGE_EVENT = "change";

var LoginStore = (function (_EventEmitter) {
	_inherits(LoginStore, _EventEmitter);

	function LoginStore() {
		_classCallCheck(this, LoginStore);

		_get(Object.getPrototypeOf(LoginStore.prototype), "constructor", this).call(this);

		this.errorMessage = null;
		this.userData = null;
		this.tokenPropertyName = null;
	}

	_createClass(LoginStore, [{
		key: "setTokenPropertyName",
		value: function setTokenPropertyName(id) {
			this.tokenPropertyName = id + "-auth-token";
			this.checkTokenInUrl();
		}
	}, {
		key: "checkTokenInUrl",
		value: function checkTokenInUrl() {
			var path = window.location.search.substr(1);
			var params = path.split('&');

			for (var i in params) {
				var _params$i$split = params[i].split('=');

				var _params$i$split2 = _slicedToArray(_params$i$split, 2);

				var key = _params$i$split2[0];
				var value = _params$i$split2[1];

				if (key === 'hsid') {
					var newLocation = window.location.href.replace(params[i], "").replace(/[\?\&]$/, "");
					this.setToken(value);
					this.setSupportLogout(false);
					history.replaceState(history.state, 'tokened', newLocation);
					break;
				}
			}
		}
	}, {
		key: "getState",
		value: function getState() {
			return {
				token: this.getToken(),
				errorMessage: this.errorMessage,
				authenticated: this.getToken() !== null && this.userData !== null,
				userData: this.userData,
				supportLogout: this.supportsLogout()
			};
		}
	}, {
		key: "onMissingTokenPropertyName",
		value: function onMissingTokenPropertyName() {
			console.warn("WARNING: missing tokenPropertyName, call initializeVre before attempting authentication");
		}
	}, {
		key: "setToken",
		value: function setToken(token) {
			if (this.tokenPropertyName === null) {
				return this.onMissingTokenPropertyName();
			}
			localStorage.setItem(this.tokenPropertyName, token);
		}
	}, {
		key: "setSupportLogout",
		value: function setSupportLogout(supportsLogout) {
			if (supportsLogout) {
				localStorage.setItem("hi-support-auth-logout", "yes");
			} else {
				localStorage.removeItem("hi-support-auth-logout");
			}
		}
	}, {
		key: "supportsLogout",
		value: function supportsLogout() {
			return localStorage.getItem("hi-support-auth-logout") === "yes";
		}
	}, {
		key: "getToken",
		value: function getToken() {
			if (this.tokenPropertyName === null) {
				return this.onMissingTokenPropertyName();
			}
			return localStorage.getItem(this.tokenPropertyName);
		}
	}, {
		key: "removeToken",
		value: function removeToken() {
			if (this.tokenPropertyName === null) {
				return this.onMissingTokenPropertyName();
			}
			localStorage.removeItem(this.tokenPropertyName);
		}
	}, {
		key: "receiveBasicAuth",
		value: function receiveBasicAuth(data) {
			this.setSupportLogout(true);
			this.setToken(data.headers.x_auth_token);
			this.errorMessage = null;
		}
	}, {
		key: "receiveBasicAuthFailure",
		value: function receiveBasicAuthFailure(data) {
			var body = JSON.parse(data.body);
			this.errorMessage = body.message;
			this.removeToken();
		}
	}, {
		key: "receiveUserData",
		value: function receiveUserData(data) {
			this.userData = JSON.parse(data.body);
		}
	}, {
		key: "receiveUserDataFailure",
		value: function receiveUserDataFailure(data) {
			this.removeToken();
			this.errorMessage = "Unauthorized";
		}
	}, {
		key: "receiveLogout",
		value: function receiveLogout() {
			this.removeToken();
			this.setSupportLogout(false);
			this.errorMessage = null;
			this.userData = null;
		}
	}, {
		key: "stopListening",
		value: function stopListening(callback) {
			this.removeListener(CHANGE_EVENT, callback);
		}
	}, {
		key: "listen",
		value: function listen(callback) {
			this.addListener(CHANGE_EVENT, callback);
		}
	}]);

	return LoginStore;
})(_events.EventEmitter);

var loginStore = new LoginStore();

var dispatcherCallback = function dispatcherCallback(payload) {
	switch (payload.action.actionType) {
		case "BASIC_LOGIN_SUCCESS":
			loginStore.receiveBasicAuth(payload.action.data);
			break;
		case "BASIC_LOGIN_FAILURE":
			loginStore.receiveBasicAuthFailure(payload.action.data);
			break;
		case "USER_DATA_SUCCESS":
			loginStore.receiveUserData(payload.action.data);
			break;
		case "USER_DATA_FAILURE":
			loginStore.receiveUserDataFailure(payload.action.data);
			break;
		case "LOGOUT":
			loginStore.receiveLogout(payload.action.data);
			break;

		default:
			return;
	}

	loginStore.emit(CHANGE_EVENT);
};

loginStore.dispatcherIndex = _dispatcher2["default"].register(dispatcherCallback);

exports["default"] = loginStore;
module.exports = exports["default"];

},{"./dispatcher":16,"events":1}],20:[function(_dereq_,module,exports){
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

var _loginStore = _dereq_("./login-store");

var _loginStore2 = _interopRequireDefault(_loginStore);

var _federated = _dereq_("./federated");

var _federated2 = _interopRequireDefault(_federated);

var _api = _dereq_("./api");

var _api2 = _interopRequireDefault(_api);

var _actions = _dereq_("./actions");

var _actions2 = _interopRequireDefault(_actions);

var LoginComponent = (function (_React$Component) {
	_inherits(LoginComponent, _React$Component);

	function LoginComponent(props) {
		_classCallCheck(this, LoginComponent);

		_get(Object.getPrototypeOf(LoginComponent.prototype), "constructor", this).call(this, props);

		_loginStore2["default"].setTokenPropertyName(this.props.appId);
		this.state = _loginStore2["default"].getState();
		this.state.opened = false;
		if (!this.state.initialized) {
			this.state.initialized = _loginStore2["default"].getToken() === null;
		}
	}

	_createClass(LoginComponent, [{
		key: "componentDidMount",
		value: function componentDidMount() {
			_loginStore2["default"].listen(this.onStoreChange.bind(this));

			if (this.state.token != null) {
				_api2["default"].fetchUserData(this.props.userUrl, this.state.token, this.props.headers);
			}

			document.addEventListener("click", this.handleDocumentClick.bind(this), false);
		}
	}, {
		key: "componentWillUnmount",
		value: function componentWillUnmount() {
			_loginStore2["default"].stopListening(this.onStoreChange.bind(this));

			document.removeEventListener("click", this.handleDocumentClick.bind(this), false);
		}
	}, {
		key: "onStoreChange",
		value: function onStoreChange() {
			this.setState(_loginStore2["default"].getState());

			if (this.state.token != null && !this.state.authenticated) {
				_api2["default"].fetchUserData(this.props.userUrl, this.state.token, this.props.headers);
			} else {
				this.props.onChange(_loginStore2["default"].getState());
			}
			this.setState({ initialized: true });
		}
	}, {
		key: "toggleLogin",
		value: function toggleLogin(ev) {
			this.setState({ opened: !this.state.opened });
		}
	}, {
		key: "onLogoutClick",
		value: function onLogoutClick(ev) {
			_actions2["default"].logout();
		}
	}, {
		key: "handleDocumentClick",
		value: function handleDocumentClick(ev) {
			if (this.state.opened && !_react2["default"].findDOMNode(this).contains(ev.target)) {
				this.setState({
					opened: false
				});
			}
		}
	}, {
		key: "render",
		value: function render() {
			if (!this.state.initialized) {
				return _react2["default"].createElement("div", null);
			}

			if (this.state.authenticated) {
				var logoutButton = this.state.supportLogout ? _react2["default"].createElement(
					"button",
					{ onClick: this.onLogoutClick.bind(this) },
					this.props.logoutLabel
				) : null;

				return _react2["default"].createElement(
					"div",
					{ className: "hire-login" },
					_react2["default"].createElement(
						"span",
						{ className: "login-status" },
						this.props.loggedInLabel ? this.props.loggedInLabel + " " : "",
						this.state.userData.displayName
					),
					logoutButton
				);
			}
			return _react2["default"].createElement(
				"div",
				{ className: "hire-login" },
				_react2["default"].createElement(
					"button",
					{ className: this.state.opened ? 'toggle-opened' : 'toggle-closed',
						onClick: this.toggleLogin.bind(this) },
					this.props.buttonLabel
				),
				_react2["default"].createElement(
					"div",
					{ className: "login-form", id: "hire-login-form", style: this.state.opened ? { display: "block" } : { display: "none" } },
					_react2["default"].Children.map(this.props.children, function (child) {
						return _react2["default"].createElement(
							"div",
							null,
							child
						);
					}),
					_react2["default"].createElement(
						"div",
						{ className: "hire-login-error" },
						this.state.errorMessage
					)
				)
			);
		}
	}]);

	return LoginComponent;
})(_react2["default"].Component);

LoginComponent.propTypes = {
	appId: _react2["default"].PropTypes.string,
	buttonLabel: _react2["default"].PropTypes.string,
	children: _react2["default"].PropTypes.node,
	headers: _react2["default"].PropTypes.object,
	loggedInLabel: _react2["default"].PropTypes.string,
	logoutLabel: _react2["default"].PropTypes.string,
	onChange: _react2["default"].PropTypes.func.isRequired,
	userUrl: _react2["default"].PropTypes.string.isRequired

};

LoginComponent.defaultProps = {
	buttonLabel: "Login",
	loggedInLabel: "Logged in as",
	logoutLabel: "Logout",
	appId: "default-login",
	headers: {}
};

exports["default"] = LoginComponent;
module.exports = exports["default"];

},{"./actions":13,"./api":14,"./federated":17,"./login-store":19,"react":"react"}]},{},[18])(18)
});
