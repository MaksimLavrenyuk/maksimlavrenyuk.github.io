
(function () {


/*
Copyright (c) 2019 Lucian Vuc <https://github.com/luciVuc>

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:
The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * A minimal CommonJS-compatible (nodejs-like) module loader for the browser environment.
 */
window.require = typeof require === "function" ? function (require, document) {
  var tmp = document.querySelector("script[data-main]");

  if (tmp) {
    require(tmp.dataset.main);
  }

  return require;
}(require, document) : function (document) {
  var COMMA_DELIMITER = /,[ ]*/gim;
  var SLASH_DELIMITER = /[\/]+/gmi;
  /**
   * load prerequisites (non-CJS scripts, stylesheets, etc.)
   *
   * @returns {String} The base directory
   */

  function loadPrerequisites() {
    var head = document.head;
    var tmpScripts = document.querySelector("script[data-scripts]");
    var tmpStyles = document.querySelector("script[data-styles]");
    var styles = tmpStyles ? tmpStyles.dataset.styles : "";
    var scripts = tmpScripts ? tmpScripts.dataset.scripts : "";
    var tmpBaseDir = document.querySelector("script[data-base_dir]");
    var tag;
    var baseDir = tmpBaseDir && tmpBaseDir.dataset.base_dir;
    baseDir = baseDir && typeof baseDir === "string" ? baseDir : "./";
    baseDir = new URL(baseDir, location.href).href;

    if (baseDir) {
      tag = document.createElement("base");
      tag.setAttribute("href", baseDir);
      head.append(tag);
    }

    if (typeof styles === "string") {
      styles.trim().replace(COMMA_DELIMITER, ",").split(",").forEach(function (url) {
        tag = document.createElement("link");
        tag.setAttribute("rel", "stylesheet");
        tag.setAttribute("type", "text/css");
        tag.setAttribute("href", url.trim());
        head.append(tag);
      });
    }

    if (typeof scripts === "string") {
      scripts.trim().replace(COMMA_DELIMITER, ",").split(",").forEach(function (url) {
        tag = document.createElement("script");
        tag.setAttribute("type", "text/javascript");
        tag.setAttribute("src", url.trim());
        head.append(tag);
      });
    }

    return baseDir;
  }
  /**
   * Performs a synchronous XHR
   *
   * @param {String} url The request URL
   * @returns {XMLHttpRequest} The XHR instance
   */


  function getSynchXHR(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();
    return xhr;
  }
  /**
   * If the file path given as argument does not have an extension
   * (such as `.js`, `.es6`, `.json`, etc.), the assumption is that
   * it is a package, and it tries to determine the file name designated
   * as **main** in the `package.json` file, and attach it to the 
   * given file path.
   *
   * @param {String} filePath
   * @returns {String} The complete file path, including the main file name
   */


  function getFileName(filePath) {
    filePath = typeof filePath === "string" ? filePath : "";

    if (filePath.indexOf(".") < 0) {
      var xhr = getSynchXHR("".concat(filePath, "/package.json"));

      if (xhr.status === 200) {
        var pack = JSON.parse(xhr.responseText);
        filePath = filePath + "/" + pack.main;
      }
    }

    return filePath;
  }

  return function () {
    var modules = {};
    var baseDir = loadPrerequisites();
    var tmpMain = document.querySelector("script[data-main]");
    var mainStr = tmpMain ? tmpMain.dataset.main : null;
    /**
     * Loads CommonJS type of JS modules in the browser.
     *
     * @param {String} file The name of the file containing the Common JS module.
     * @param {String} resPath  The path, if not the default one, to the Common JS module.
     * @returns
     */

    function require(dirname, file) {
      file = typeof file === "string" ? file.trim() : "";
      var uri = new URL(file, dirname);
      uri.pathname = getFileName(uri.pathname);
      dirname = uri.href.substr(0, uri.href.lastIndexOf("/") + 1);
      var filename = uri.pathname.substr(uri.pathname.lastIndexOf("/") + 1);

      if (modules.hasOwnProperty(uri.href)) {
        return modules[uri.href];
      } else {
        var xhr = getSynchXHR(uri.href);

        if (xhr.status === 200) {
          var module = {};

          if (/(.json)$/gi.test(filename)) {
            module.exports = JSON.parse(xhr.responseText);
          } else {
            module.exports = {};
            new Function("exports", "require", "module", "__filename", "__dirname", "\n              ".concat(xhr.responseText, "\n              //# sourceURL=").concat(uri.href, "\n            ")).call(this, module.exports, require.bind(this, dirname), module, filename, dirname);
            modules[uri.href] = module.exports;
          }

          return module.exports;
        }
      }

      return;
    }

    Object.defineProperty(require, "modules", {
      set: Function.prototype,

      /**
       * The list af all currently loaded JS modules.
       */
      get: function get() {
        return modules;
      }
    });

    var req = require.bind(this, baseDir); // Load the main (entry point) file


    if (mainStr) {
      window.addEventListener("load", req.bind(this, new URL(mainStr, baseDir).href));
    }

    return req;
  }();
}(document);

        'use strict';

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

/**
 * MIT License
 *
 * Copyright (c) 2022 Maksim Lavrenyuk
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*! simple-typed-emitter 0.0.0 */
var e=function(){function e(){this.listeners=null;}return e.prototype.getListenerHandle=function(e,t){var r=this;if(this.listeners)for(var s=function(s){if(i.listeners[e][s]===t)return {value:{deregister:function(){return !!r.listeners&&(r.listeners[e].splice(s,1),!0)}}}},i=this,n=0;n<this.listeners[e].length;n++){var l=s(n);if("object"==typeof l)return l.value}},e.prototype.registerListener=function(e,t){var r,s=this;return null!==this.listeners?this.listeners[e]?this.listeners[e].push(t):this.listeners[e]=[t]:this.listeners=((r={})[e]=[t],r),{deregister:function(){if(s.listeners&&s.listeners[e])for(var r=0;r<s.listeners[e].length;r++)if(s.listeners[e][r]===t)return s.listeners[e].splice(r,1),!0;return !1}}},e.prototype.deregisterListener=function(e,t){var r=this.getListenerHandle(e,t);return !!r&&r.deregister()},e.prototype.emit=function(e,t){var r=this.listeners;r&&Object.keys(r).forEach((function(s){s===e&&r[e]&&r[e].forEach((function(e){e(t);}));}));},e}();

/**
 * Типы отладочных сообщений
 * @see DebugMsgConnect
 * @see DebugMsgDisconnect
 * @see DebugMsgAct
 * @see DebugMsgInit
 * @see DebugMsgPing
 */
var DebugMsgType;
(function (DebugMsgType) {
    DebugMsgType["connect"] = "connect";
    DebugMsgType["disconnect"] = "disconnect";
    DebugMsgType["init"] = "init";
    DebugMsgType["act"] = "act";
    DebugMsgType["ping"] = "ping";
})(DebugMsgType || (DebugMsgType = {}));
/**
 * Логгер работы таг менеджера. Передает снапшоты работы.
 * Если режим работы "debug", сообщает нужному окну в браузере требуемые данные.
 * Если режим работы "prod" - ничего не делает.
 *
 * Работает с несколькими событиями.
 * @see DebugMsgType
 *
 * Логгер не отправляет сообщения в центр отладки сам, этим занимается DebugSender.
 */
var Logger = /** @class */ (function () {
    function Logger(props) {
        this.isDebug = props.mode === 'debug';
        this.connectState = {
            loading: false,
            error: false,
        };
        this.pingState = [];
        this.actAccumulator = [];
        this.actListener = this.actListener.bind(this);
        this.actManager = props.manager;
        this.variableStorage = props.variableStorage;
        this.events = new e();
    }
    Logger.createDebugMsgInit = function () {
        return {
            type: DebugMsgType.init,
        };
    };
    Logger.createDebugMsgPing = function () {
        return {
            type: DebugMsgType.ping,
        };
    };
    Logger.createDebugMsgDisconnect = function () {
        return {
            type: DebugMsgType.disconnect,
        };
    };
    /**
     * Проверка, что сообщение - сообщение о целостности соединения.
     * @param msg
     */
    Logger.isPingMsg = function (msg) {
        return msg.type === DebugMsgType.ping;
    };
    /**
     * Проверка, что сообщение - сообщение о разрыве соединения.
     * @param msg
     */
    Logger.isDisconnectMsg = function (msg) {
        return msg.type === DebugMsgType.disconnect;
    };
    /**
     * Проверка что, сообщение - сообщение о соединении с центром отладки.
     * @param data
     */
    Logger.isConnectMsg = function (data) {
        return data.type === DebugMsgType.connect;
    };
    /**
     * начать логгировать.
     */
    Logger.prototype.start = function () {
        if (this.isDebug) {
            this.spy();
            this.connect();
        }
    };
    /**
     * Сообщить об инициализации.
     * @private
     */
    Logger.prototype.emitInit = function () {
        this.events.emit('msg', Logger.createDebugMsgInit());
    };
    /**
     * Пингануть центр отладки
     * @private
     */
    Logger.prototype.emitPing = function () {
        this.events.emit('msg', Logger.createDebugMsgPing());
    };
    /**
     * Сообщить о дисконнекте
     * @private
     */
    Logger.prototype.emitDisconnect = function () {
        this.events.emit('msg', Logger.createDebugMsgDisconnect());
    };
    /**
     * Отправить действие в центр отладки.
     * @param payload
     * @private
     */
    Logger.prototype.emitAction = function (payload) {
        this.events.emit('msg', this.createDebugMsgAct(payload));
    };
    /**
     * Сообщение о действии внутри контейнера.
     * @param payload
     * @private
     */
    Logger.prototype.createDebugMsgAct = function (payload) {
        return {
            type: DebugMsgType.act,
            data: {
                act: payload,
                variables: this.variableStorage.readVariables(),
            },
        };
    };
    /**
     * Изменить состояние соединения.
     * @param state
     * @private
     */
    Logger.prototype.setConnectState = function (state) {
        this.connectState = __assign(__assign({}, this.connectState), state);
    };
    /**
     * Изменить состояние пинга.
     * @private
     * @param ping
     */
    Logger.prototype.addPing = function (ping) {
        this.pingState.push(ping);
    };
    /**
     * Проверить состояние соединения.
     * Если последние Logger.PING_CHECK_SIZE элементов подряд содержат ошибки - значит соединение разовано.
     * @private
     */
    Logger.prototype.checkPing = function () {
        if (this.pingState.length < Logger.PING_CHECK_SIZE)
            return true;
        for (var i = this.pingState.length - 1; i > this.pingState.length - 1 - Logger.PING_CHECK_SIZE; i--) {
            var pingItem = this.pingState[i];
            if (pingItem !== null && !pingItem.error)
                return true;
        }
        return false;
    };
    /**
     * Слушатель действий.
     * @param payload
     * @private
     */
    Logger.prototype.actListener = function (payload) {
        if (this.connectState.loading) {
            this.actAccumulator.push(payload);
        }
        else {
            this.emitAction(payload);
        }
    };
    /**
     * Отчистить сохраненные действия и отправить их в центр отладки.
     * @private
     */
    Logger.prototype.cleanActAccumulator = function () {
        var _this = this;
        this.actAccumulator.forEach(function (act) {
            _this.emitAction(act);
        });
        this.actAccumulator.length = 0;
    };
    /**
     * Следить за событиями менеджера действий.
     * В случае получения события - отправлять данные в центр отладки.
     * @private
     */
    Logger.prototype.spy = function () {
        this.actManager.events.registerListener('act', this.actListener);
    };
    /**
     * Следить за пингами к центру отладки.
     * @private
     */
    Logger.prototype.spyPing = function () {
        var _this = this;
        var pingCounter = 0;
        var interval = setInterval(function () {
            _this.emitPing();
            pingCounter += 1;
            /**
             * придется немного подождать ответа.
             * К сожалению при отправке сообщение через postMessage() мы не можем получить состояние отправки,
             * поэтому проверяем сами.
             *
             * @see DebugSender
             */
            setTimeout(function () {
                // если пинг не был зарегистрирован.
                if (_this.pingState[pingCounter - 1] === undefined) {
                    _this.addPing(null);
                }
                var isGoodPing = _this.checkPing();
                if (!isGoodPing) {
                    clearInterval(interval);
                    _this.disconnect();
                }
            }, Logger.PING_CHECK_TIME);
        }, Logger.PING_INTERVAL);
    };
    /**
     * Слушатель пингов
     * @private
     */
    Logger.prototype.pingListener = function () {
        this.addPing({ error: false });
    };
    /**
     * Передать сообщение в логгер.
     * @param payload
     * @private
     */
    Logger.prototype.message = function (payload) {
        if (Logger.isConnectMsg(payload)) {
            this.setConnectState({ loading: false });
            this.cleanActAccumulator();
            this.spyPing();
        }
        else if (Logger.isPingMsg(payload)) {
            this.pingListener();
        }
        else if (Logger.isDisconnectMsg(payload)) {
            this.disconnect();
        }
    };
    /**
     * Разорвать соединение.
     * @private
     */
    Logger.prototype.disconnect = function () {
        this.setConnectState({ loading: false, error: true });
        this.emitDisconnect();
    };
    /**
     * Начать слушать сообщения из центра отладки.
     * Это могут быть сообщения инициализации, или сообщения о прекращении дебага или др.
     * @private
     */
    Logger.prototype.connect = function () {
        var _this = this;
        this.setConnectState({ loading: true });
        this.emitInit();
        /**
         * Если через таймаут не будет установлено соединение - считать ошибкой.
         */
        setTimeout(function () {
            if (_this.connectState.loading) {
                _this.disconnect();
            }
        }, Logger.CONNECT_TIMEOUT);
    };
    /**
     * Интервал периодичности проверки соединения.
     * @private
     */
    Logger.PING_INTERVAL = 5 * 1000;
    /**
     * Время, спустя которое нужно проверить отправку пинга.
     * @private
     */
    Logger.PING_CHECK_TIME = 1000;
    /**
     * Количество ошибочных проверок подряд для дисконнекта.
     * @private
     */
    Logger.PING_CHECK_SIZE = 5;
    /**
     * Время ожидания соединения с центром отладки.
     */
    Logger.CONNECT_TIMEOUT = 10 * 1000;
    return Logger;
}());

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

/**
 * Check if we're required to add a port number.
 *
 * @see https://url.spec.whatwg.org/#default-port
 * @param {Number|String} port Port number we need to check
 * @param {String} protocol Protocol we need to check against.
 * @returns {Boolean} Is it a default port for the given protocol
 * @api private
 */
var requiresPort = function required(port, protocol) {
  protocol = protocol.split(':')[0];
  port = +port;

  if (!port) return false;

  switch (protocol) {
    case 'http':
    case 'ws':
    return port !== 80;

    case 'https':
    case 'wss':
    return port !== 443;

    case 'ftp':
    return port !== 21;

    case 'gopher':
    return port !== 70;

    case 'file':
    return false;
  }

  return port !== 0;
};

var has = Object.prototype.hasOwnProperty
  , undef;

/**
 * Decode a URI encoded string.
 *
 * @param {String} input The URI encoded string.
 * @returns {String|Null} The decoded string.
 * @api private
 */
function decode$1(input) {
  try {
    return decodeURIComponent(input.replace(/\+/g, ' '));
  } catch (e) {
    return null;
  }
}

/**
 * Attempts to encode a given input.
 *
 * @param {String} input The string that needs to be encoded.
 * @returns {String|Null} The encoded string.
 * @api private
 */
function encode$1(input) {
  try {
    return encodeURIComponent(input);
  } catch (e) {
    return null;
  }
}

/**
 * Simple query string parser.
 *
 * @param {String} query The query string that needs to be parsed.
 * @returns {Object}
 * @api public
 */
function querystring(query) {
  var parser = /([^=?#&]+)=?([^&]*)/g
    , result = {}
    , part;

  while (part = parser.exec(query)) {
    var key = decode$1(part[1])
      , value = decode$1(part[2]);

    //
    // Prevent overriding of existing properties. This ensures that build-in
    // methods like `toString` or __proto__ are not overriden by malicious
    // querystrings.
    //
    // In the case if failed decoding, we want to omit the key/value pairs
    // from the result.
    //
    if (key === null || value === null || key in result) continue;
    result[key] = value;
  }

  return result;
}

/**
 * Transform a query string to an object.
 *
 * @param {Object} obj Object that should be transformed.
 * @param {String} prefix Optional prefix.
 * @returns {String}
 * @api public
 */
function querystringify(obj, prefix) {
  prefix = prefix || '';

  var pairs = []
    , value
    , key;

  //
  // Optionally prefix with a '?' if needed
  //
  if ('string' !== typeof prefix) prefix = '?';

  for (key in obj) {
    if (has.call(obj, key)) {
      value = obj[key];

      //
      // Edge cases where we actually want to encode the value to an empty
      // string instead of the stringified value.
      //
      if (!value && (value === null || value === undef || isNaN(value))) {
        value = '';
      }

      key = encode$1(key);
      value = encode$1(value);

      //
      // If we failed to encode the strings, we should bail out as we don't
      // want to add invalid strings to the query.
      //
      if (key === null || value === null) continue;
      pairs.push(key +'='+ value);
    }
  }

  return pairs.length ? prefix + pairs.join('&') : '';
}

//
// Expose the module.
//
var stringify = querystringify;
var parse$1 = querystring;

var querystringify_1 = {
	stringify: stringify,
	parse: parse$1
};

var controlOrWhitespace = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/
  , CRHTLF = /[\n\r\t]/g
  , slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//
  , port = /:\d+$/
  , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i
  , windowsDriveLetter = /^[a-zA-Z]:/;

/**
 * Remove control characters and whitespace from the beginning of a string.
 *
 * @param {Object|String} str String to trim.
 * @returns {String} A new string representing `str` stripped of control
 *     characters and whitespace from its beginning.
 * @public
 */
function trimLeft(str) {
  return (str ? str : '').toString().replace(controlOrWhitespace, '');
}

/**
 * These are the parse rules for the URL parser, it informs the parser
 * about:
 *
 * 0. The char it Needs to parse, if it's a string it should be done using
 *    indexOf, RegExp using exec and NaN means set as current value.
 * 1. The property we should set when parsing this value.
 * 2. Indication if it's backwards or forward parsing, when set as number it's
 *    the value of extra chars that should be split off.
 * 3. Inherit from location if non existing in the parser.
 * 4. `toLowerCase` the resulting value.
 */
var rules = [
  ['#', 'hash'],                        // Extract from the back.
  ['?', 'query'],                       // Extract from the back.
  function sanitize(address, url) {     // Sanitize what is left of the address
    return isSpecial(url.protocol) ? address.replace(/\\/g, '/') : address;
  },
  ['/', 'pathname'],                    // Extract from the back.
  ['@', 'auth', 1],                     // Extract from the front.
  [NaN, 'host', undefined, 1, 1],       // Set left over value.
  [/:(\d*)$/, 'port', undefined, 1],    // RegExp the back.
  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
];

/**
 * These properties should not be copied or inherited from. This is only needed
 * for all non blob URL's as a blob URL does not include a hash, only the
 * origin.
 *
 * @type {Object}
 * @private
 */
var ignore = { hash: 1, query: 1 };

/**
 * The location object differs when your code is loaded through a normal page,
 * Worker or through a worker using a blob. And with the blobble begins the
 * trouble as the location object will contain the URL of the blob, not the
 * location of the page where our code is loaded in. The actual origin is
 * encoded in the `pathname` so we can thankfully generate a good "default"
 * location from it so we can generate proper relative URL's again.
 *
 * @param {Object|String} loc Optional default location object.
 * @returns {Object} lolcation object.
 * @public
 */
function lolcation(loc) {
  var globalVar;

  if (typeof window !== 'undefined') globalVar = window;
  else if (typeof commonjsGlobal !== 'undefined') globalVar = commonjsGlobal;
  else if (typeof self !== 'undefined') globalVar = self;
  else globalVar = {};

  var location = globalVar.location || {};
  loc = loc || location;

  var finaldestination = {}
    , type = typeof loc
    , key;

  if ('blob:' === loc.protocol) {
    finaldestination = new Url(unescape(loc.pathname), {});
  } else if ('string' === type) {
    finaldestination = new Url(loc, {});
    for (key in ignore) delete finaldestination[key];
  } else if ('object' === type) {
    for (key in loc) {
      if (key in ignore) continue;
      finaldestination[key] = loc[key];
    }

    if (finaldestination.slashes === undefined) {
      finaldestination.slashes = slashes.test(loc.href);
    }
  }

  return finaldestination;
}

/**
 * Check whether a protocol scheme is special.
 *
 * @param {String} The protocol scheme of the URL
 * @return {Boolean} `true` if the protocol scheme is special, else `false`
 * @private
 */
function isSpecial(scheme) {
  return (
    scheme === 'file:' ||
    scheme === 'ftp:' ||
    scheme === 'http:' ||
    scheme === 'https:' ||
    scheme === 'ws:' ||
    scheme === 'wss:'
  );
}

/**
 * @typedef ProtocolExtract
 * @type Object
 * @property {String} protocol Protocol matched in the URL, in lowercase.
 * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
 * @property {String} rest Rest of the URL that is not part of the protocol.
 */

/**
 * Extract protocol information from a URL with/without double slash ("//").
 *
 * @param {String} address URL we want to extract from.
 * @param {Object} location
 * @return {ProtocolExtract} Extracted information.
 * @private
 */
function extractProtocol(address, location) {
  address = trimLeft(address);
  address = address.replace(CRHTLF, '');
  location = location || {};

  var match = protocolre.exec(address);
  var protocol = match[1] ? match[1].toLowerCase() : '';
  var forwardSlashes = !!match[2];
  var otherSlashes = !!match[3];
  var slashesCount = 0;
  var rest;

  if (forwardSlashes) {
    if (otherSlashes) {
      rest = match[2] + match[3] + match[4];
      slashesCount = match[2].length + match[3].length;
    } else {
      rest = match[2] + match[4];
      slashesCount = match[2].length;
    }
  } else {
    if (otherSlashes) {
      rest = match[3] + match[4];
      slashesCount = match[3].length;
    } else {
      rest = match[4];
    }
  }

  if (protocol === 'file:') {
    if (slashesCount >= 2) {
      rest = rest.slice(2);
    }
  } else if (isSpecial(protocol)) {
    rest = match[4];
  } else if (protocol) {
    if (forwardSlashes) {
      rest = rest.slice(2);
    }
  } else if (slashesCount >= 2 && isSpecial(location.protocol)) {
    rest = match[4];
  }

  return {
    protocol: protocol,
    slashes: forwardSlashes || isSpecial(protocol),
    slashesCount: slashesCount,
    rest: rest
  };
}

/**
 * Resolve a relative URL pathname against a base URL pathname.
 *
 * @param {String} relative Pathname of the relative URL.
 * @param {String} base Pathname of the base URL.
 * @return {String} Resolved pathname.
 * @private
 */
function resolve(relative, base) {
  if (relative === '') return base;

  var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
    , i = path.length
    , last = path[i - 1]
    , unshift = false
    , up = 0;

  while (i--) {
    if (path[i] === '.') {
      path.splice(i, 1);
    } else if (path[i] === '..') {
      path.splice(i, 1);
      up++;
    } else if (up) {
      if (i === 0) unshift = true;
      path.splice(i, 1);
      up--;
    }
  }

  if (unshift) path.unshift('');
  if (last === '.' || last === '..') path.push('');

  return path.join('/');
}

/**
 * The actual URL instance. Instead of returning an object we've opted-in to
 * create an actual constructor as it's much more memory efficient and
 * faster and it pleases my OCD.
 *
 * It is worth noting that we should not use `URL` as class name to prevent
 * clashes with the global URL instance that got introduced in browsers.
 *
 * @constructor
 * @param {String} address URL we want to parse.
 * @param {Object|String} [location] Location defaults for relative paths.
 * @param {Boolean|Function} [parser] Parser for the query string.
 * @private
 */
function Url(address, location, parser) {
  address = trimLeft(address);
  address = address.replace(CRHTLF, '');

  if (!(this instanceof Url)) {
    return new Url(address, location, parser);
  }

  var relative, extracted, parse, instruction, index, key
    , instructions = rules.slice()
    , type = typeof location
    , url = this
    , i = 0;

  //
  // The following if statements allows this module two have compatibility with
  // 2 different API:
  //
  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
  //    where the boolean indicates that the query string should also be parsed.
  //
  // 2. The `URL` interface of the browser which accepts a URL, object as
  //    arguments. The supplied object will be used as default values / fall-back
  //    for relative paths.
  //
  if ('object' !== type && 'string' !== type) {
    parser = location;
    location = null;
  }

  if (parser && 'function' !== typeof parser) parser = querystringify_1.parse;

  location = lolcation(location);

  //
  // Extract protocol information before running the instructions.
  //
  extracted = extractProtocol(address || '', location);
  relative = !extracted.protocol && !extracted.slashes;
  url.slashes = extracted.slashes || relative && location.slashes;
  url.protocol = extracted.protocol || location.protocol || '';
  address = extracted.rest;

  //
  // When the authority component is absent the URL starts with a path
  // component.
  //
  if (
    extracted.protocol === 'file:' && (
      extracted.slashesCount !== 2 || windowsDriveLetter.test(address)) ||
    (!extracted.slashes &&
      (extracted.protocol ||
        extracted.slashesCount < 2 ||
        !isSpecial(url.protocol)))
  ) {
    instructions[3] = [/(.*)/, 'pathname'];
  }

  for (; i < instructions.length; i++) {
    instruction = instructions[i];

    if (typeof instruction === 'function') {
      address = instruction(address, url);
      continue;
    }

    parse = instruction[0];
    key = instruction[1];

    if (parse !== parse) {
      url[key] = address;
    } else if ('string' === typeof parse) {
      index = parse === '@'
        ? address.lastIndexOf(parse)
        : address.indexOf(parse);

      if (~index) {
        if ('number' === typeof instruction[2]) {
          url[key] = address.slice(0, index);
          address = address.slice(index + instruction[2]);
        } else {
          url[key] = address.slice(index);
          address = address.slice(0, index);
        }
      }
    } else if ((index = parse.exec(address))) {
      url[key] = index[1];
      address = address.slice(0, index.index);
    }

    url[key] = url[key] || (
      relative && instruction[3] ? location[key] || '' : ''
    );

    //
    // Hostname, host and protocol should be lowercased so they can be used to
    // create a proper `origin`.
    //
    if (instruction[4]) url[key] = url[key].toLowerCase();
  }

  //
  // Also parse the supplied query string in to an object. If we're supplied
  // with a custom parser as function use that instead of the default build-in
  // parser.
  //
  if (parser) url.query = parser(url.query);

  //
  // If the URL is relative, resolve the pathname against the base URL.
  //
  if (
      relative
    && location.slashes
    && url.pathname.charAt(0) !== '/'
    && (url.pathname !== '' || location.pathname !== '')
  ) {
    url.pathname = resolve(url.pathname, location.pathname);
  }

  //
  // Default to a / for pathname if none exists. This normalizes the URL
  // to always have a /
  //
  if (url.pathname.charAt(0) !== '/' && isSpecial(url.protocol)) {
    url.pathname = '/' + url.pathname;
  }

  //
  // We should not add port numbers if they are already the default port number
  // for a given protocol. As the host also contains the port number we're going
  // override it with the hostname which contains no port number.
  //
  if (!requiresPort(url.port, url.protocol)) {
    url.host = url.hostname;
    url.port = '';
  }

  //
  // Parse down the `auth` for the username and password.
  //
  url.username = url.password = '';

  if (url.auth) {
    index = url.auth.indexOf(':');

    if (~index) {
      url.username = url.auth.slice(0, index);
      url.username = encodeURIComponent(decodeURIComponent(url.username));

      url.password = url.auth.slice(index + 1);
      url.password = encodeURIComponent(decodeURIComponent(url.password));
    } else {
      url.username = encodeURIComponent(decodeURIComponent(url.auth));
    }

    url.auth = url.password ? url.username +':'+ url.password : url.username;
  }

  url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
    ? url.protocol +'//'+ url.host
    : 'null';

  //
  // The href is just the compiled result.
  //
  url.href = url.toString();
}

/**
 * This is convenience method for changing properties in the URL instance to
 * insure that they all propagate correctly.
 *
 * @param {String} part          Property we need to adjust.
 * @param {Mixed} value          The newly assigned value.
 * @param {Boolean|Function} fn  When setting the query, it will be the function
 *                               used to parse the query.
 *                               When setting the protocol, double slash will be
 *                               removed from the final url if it is true.
 * @returns {URL} URL instance for chaining.
 * @public
 */
function set(part, value, fn) {
  var url = this;

  switch (part) {
    case 'query':
      if ('string' === typeof value && value.length) {
        value = (fn || querystringify_1.parse)(value);
      }

      url[part] = value;
      break;

    case 'port':
      url[part] = value;

      if (!requiresPort(value, url.protocol)) {
        url.host = url.hostname;
        url[part] = '';
      } else if (value) {
        url.host = url.hostname +':'+ value;
      }

      break;

    case 'hostname':
      url[part] = value;

      if (url.port) value += ':'+ url.port;
      url.host = value;
      break;

    case 'host':
      url[part] = value;

      if (port.test(value)) {
        value = value.split(':');
        url.port = value.pop();
        url.hostname = value.join(':');
      } else {
        url.hostname = value;
        url.port = '';
      }

      break;

    case 'protocol':
      url.protocol = value.toLowerCase();
      url.slashes = !fn;
      break;

    case 'pathname':
    case 'hash':
      if (value) {
        var char = part === 'pathname' ? '/' : '#';
        url[part] = value.charAt(0) !== char ? char + value : value;
      } else {
        url[part] = value;
      }
      break;

    case 'username':
    case 'password':
      url[part] = encodeURIComponent(value);
      break;

    case 'auth':
      var index = value.indexOf(':');

      if (~index) {
        url.username = value.slice(0, index);
        url.username = encodeURIComponent(decodeURIComponent(url.username));

        url.password = value.slice(index + 1);
        url.password = encodeURIComponent(decodeURIComponent(url.password));
      } else {
        url.username = encodeURIComponent(decodeURIComponent(value));
      }
  }

  for (var i = 0; i < rules.length; i++) {
    var ins = rules[i];

    if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
  }

  url.auth = url.password ? url.username +':'+ url.password : url.username;

  url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
    ? url.protocol +'//'+ url.host
    : 'null';

  url.href = url.toString();

  return url;
}

/**
 * Transform the properties back in to a valid and full URL string.
 *
 * @param {Function} stringify Optional query stringify function.
 * @returns {String} Compiled version of the URL.
 * @public
 */
function toString(stringify) {
  if (!stringify || 'function' !== typeof stringify) stringify = querystringify_1.stringify;

  var query
    , url = this
    , host = url.host
    , protocol = url.protocol;

  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

  var result =
    protocol +
    ((url.protocol && url.slashes) || isSpecial(url.protocol) ? '//' : '');

  if (url.username) {
    result += url.username;
    if (url.password) result += ':'+ url.password;
    result += '@';
  } else if (url.password) {
    result += ':'+ url.password;
    result += '@';
  } else if (
    url.protocol !== 'file:' &&
    isSpecial(url.protocol) &&
    !host &&
    url.pathname !== '/'
  ) {
    //
    // Add back the empty userinfo, otherwise the original invalid URL
    // might be transformed into a valid one with `url.pathname` as host.
    //
    result += '@';
  }

  //
  // Trailing colon is removed from `url.host` when it is parsed. If it still
  // ends with a colon, then add back the trailing colon that was removed. This
  // prevents an invalid URL from being transformed into a valid one.
  //
  if (host[host.length - 1] === ':' || (port.test(url.hostname) && !url.port)) {
    host += ':';
  }

  result += host + url.pathname;

  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

  if (url.hash) result += url.hash;

  return result;
}

Url.prototype = { set: set, toString: toString };

//
// Expose the URL parser and some additional properties that might be useful for
// others or testing.
//
Url.extractProtocol = extractProtocol;
Url.location = lolcation;
Url.trimLeft = trimLeft;
Url.qs = querystringify_1;

var urlParse = Url;

var AC_TAG_MANAGER_PREFIX = 'actm-';
var IS_DEBUG_URL_PARAM = 'actm_debug';

/**
 * Проверить, что окно открыто в режиме отладки.
 */
function checkDebugMode(href) {
    var url = new urlParse(decodeURIComponent(href), true);
    return Boolean(url.query[IS_DEBUG_URL_PARAM] && (url.query[IS_DEBUG_URL_PARAM] === 'true'));
}

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

var implementation = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

var functionBind = Function.prototype.bind || implementation;

var src = functionBind.call(Function.call, Object.prototype.hasOwnProperty);

var DEFAULT_OPTIONS = {
    priority: 0,
};
var Instruction = /** @class */ (function () {
    function Instruction(config, deps) {
        this.strId = config.strId;
        this.firingOption = config.firingOption;
        this.priority = config.priority || DEFAULT_OPTIONS.priority;
        this.period = config.period;
        this.before = config.before;
        this.after = config.after;
        this.triggers = config.triggers;
        this.tag = config.tag;
        this.deps = deps;
    }
    /**
     * Отсортировать инструкции по приоритету.
     * @param instructions
     */
    Instruction.sortInstructionsByPriority = function (instructions) {
        var resultInstructions = __spreadArray([], __read(instructions), false);
        for (var j = 1; j < resultInstructions.length; j++) {
            var instruction = resultInstructions[j];
            var i = j - 1;
            while (i > -1 && resultInstructions[i].priority < instruction.priority) {
                resultInstructions[i + 1] = resultInstructions[i];
                i -= 1;
            }
            resultInstructions[i + 1] = instruction;
        }
        return resultInstructions;
    };
    Instruction.prototype.checkPeriod = function () {
        if (this.period === undefined)
            return true;
        if (this.period) {
            var start = Number(new Date(this.period.start));
            var end = Number(new Date(this.period.end));
            var currentTime = Number(new Date());
            return start <= currentTime && currentTime <= end;
        }
        return false;
    };
    Instruction.prototype.act = function (force) {
        if (!force) {
            return this.checkPeriod();
        }
        return true;
    };
    Instruction.prototype.run = function (force) {
        return __awaiter(this, void 0, void 0, function () {
            var shouldStarted, tag;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        shouldStarted = this.act(force);
                        if (!shouldStarted) return [3 /*break*/, 2];
                        tag = this.deps.tagStorage.tag(this.tag);
                        return [4 /*yield*/, (tag === null || tag === void 0 ? void 0 : tag.run())];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, shouldStarted];
                }
            });
        });
    };
    return Instruction;
}());

/**
 * Обходчик инструкций.
 * @see Walker
 */
var InstructionWalker = /** @class */ (function () {
    function InstructionWalker(props) {
        this.instructionStorage = props.deps.instructionStorage;
    }
    /**
     * Посетить узел-инструкцию в дереве инструкций.
     * Рекурсивный алгоритм, реализующий in-order обход.
     * TODO: ПРИ ЦИКЛИЧЕСКОЙ ЗАВИСИМОСТИ before/after - падает ошибка с переполнением стека, подумать как это обходить.
     * @param instruction
     * @param rootInstruction - исходная инструкция, требуется для обозначения исходной инструкции.
     * @param listener
     * @private
     */
    InstructionWalker.prototype.visit = function (instruction, rootInstruction, listener) {
        return __awaiter(this, void 0, void 0, function () {
            var beforeInstruction, afterInstruction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (instruction === undefined)
                            return [2 /*return*/];
                        if (instruction === null || instruction === void 0 ? void 0 : instruction.before)
                            beforeInstruction = this.instructionStorage.instruction(instruction.before);
                        if (instruction === null || instruction === void 0 ? void 0 : instruction.after)
                            afterInstruction = this.instructionStorage.instruction(instruction.after);
                        return [4 /*yield*/, this.visit(beforeInstruction, rootInstruction, listener)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, listener(instruction, instruction === rootInstruction)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.visit(afterInstruction, rootInstruction, listener)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Обойти узел и его дочерние узлы.
     *
     * Обходим дерево в in-order порядке, т.к. нам надо проверять в начале детей
     * и только потом подыматься к родительским узлам.
     * @param instruction
     * @param listener
     */
    InstructionWalker.prototype.walk = function (instruction, listener) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.visit(instruction, instruction, listener)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return InstructionWalker;
}());

/**
 * Получение типизированного результата Object.keys()
 * @param obj
 */
function objectKeys(obj) {
    return Object.keys(obj);
}

var TriggerType;
(function (TriggerType) {
    TriggerType["Click"] = "click";
    TriggerType["ClickLink"] = "click_link";
    TriggerType["GroupTrigger"] = "group_trigger";
    TriggerType["Custom"] = "custom";
    TriggerType["ViewPage"] = "view_page";
    TriggerType["DomReady"] = "dom_ready";
    TriggerType["DomElementVisible"] = "dom_element_visible";
    TriggerType["Initialization"] = "initialization";
    TriggerType["WindowLoaded"] = "window_loaded";
    TriggerType["ScrollingDepth"] = "scrolling_depth";
    TriggerType["SubmitForm"] = "submit_form";
    TriggerType["ChangeHistory"] = "change_history";
    TriggerType["JSError"] = "js_error";
    TriggerType["Timer"] = "timer";
})(TriggerType || (TriggerType = {}));

/**
 * Ограничение активации инструкции.
 */
var FiringOption;
(function (FiringOption) {
    /**
     * Один раз за событие.
     *
     * Инструкция может указывать на то, какая инструкция после него вызовется.
     * Если за момент вызова события приггера такая инструкция уже была вызвана, то больше она вызвана не будет.
     *
     * Например, есть пары инструкции-триггеры:
     * - Инструкция1/ВсеКлики1
     * - Инструкция2/ВсеКлики2
     * "Инструкция2" имеет приоритет 100, а так же ограничение на активацию "один раз за событие".
     * "Инструкция1" указывает: "вызови после меня инструкцию 'Инструкция2'".
     *
     * Далее:
     * - Совершается клик. Срабатывают оба триггера.
     * - Первым вызывается "Инструкция2", т.к. у ней приоритет 100, а у "Инструкция1" не имеет приоритет.
     * - Вторым срабатывает "Инструкция1".
     * После своего вызова вытается вызвать "Инструкция2",
     * но ничего ничего не вызовется, т.к. "Инструкция2" имеет ограничение в 1 вызов за событие.
     * Если через время произойдет еще 1 клик, то указанный цикл повториться.
     */
    FiringOption["oncePerEvent"] = "once_per_event";
    FiringOption["oncePerPage"] = "once_per_page";
    FiringOption["noRestrictions"] = "no_restrictions";
})(FiringOption || (FiringOption = {}));

/**
 * Защитник типа для проверки соответствия объекта типу.
 *
 * @param obj - Объект для проверки
 * @param prop - Свойство, содержащееся в объекте.
 */
function isType(obj, prop) {
    return typeof obj === 'object' && obj !== null && src(obj, prop);
}

var TriggerSegmentOperator;
(function (TriggerSegmentOperator) {
    TriggerSegmentOperator["equals"] = "equals";
    TriggerSegmentOperator["notEquals"] = "not_equals";
    TriggerSegmentOperator["contains"] = "contains";
    TriggerSegmentOperator["notContains"] = "not_contains";
    TriggerSegmentOperator["startsWith"] = "starts_with";
    TriggerSegmentOperator["notStartsWith"] = "not_starts_with";
    TriggerSegmentOperator["endsWith"] = "ends_with";
    TriggerSegmentOperator["notEndsWith"] = "not_ends_with";
    TriggerSegmentOperator["matchCssSelector"] = "match_css_selector";
    TriggerSegmentOperator["notMatchCssSelector"] = "not_match_css_selector";
    TriggerSegmentOperator["less"] = "less";
    TriggerSegmentOperator["lessOrEquals"] = "less_or_equals";
    TriggerSegmentOperator["greater"] = "greater";
    TriggerSegmentOperator["greaterOrEquals"] = "greater_or_equals";
})(TriggerSegmentOperator || (TriggerSegmentOperator = {}));

var CustomEvent = /** @class */ (function () {
    function CustomEvent(props) {
        this.event = props.event;
    }
    return CustomEvent;
}());

function addAkPrefix(str) {
    return "".concat(AC_TAG_MANAGER_PREFIX).concat(str);
}

var UserVariables;
(function (UserVariables) {
    UserVariables["DomElement"] = "domElement";
    UserVariables["CustomVariable"] = "customVariable";
    UserVariables["URL"] = "Url";
    UserVariables["URLReferrer"] = "UrlReferrer";
    UserVariables["JSVariable"] = "JSVariable";
    UserVariables["JSCode"] = "JSCode";
    UserVariables["Cookie"] = "Cookie";
    UserVariables["ElementVisible"] = "ElementVisible";
    UserVariables["Utm"] = "Utm";
    UserVariables["Source"] = "Source";
})(UserVariables || (UserVariables = {}));
var UserVariables$1 = UserVariables;

var BuildInDataLayerKeys;
(function (BuildInDataLayerKeys) {
    BuildInDataLayerKeys["visibleRatio"] = "visibleRatio";
    BuildInDataLayerKeys["visibleTime"] = "visibleTime";
    BuildInDataLayerKeys["newUrl"] = "newUrl";
    BuildInDataLayerKeys["oldUrl"] = "oldUrl";
    BuildInDataLayerKeys["newUrlFragment"] = "newUrlFragment";
    BuildInDataLayerKeys["oldUrlFragment"] = "oldUrlFragment";
    BuildInDataLayerKeys["historyChangeSource"] = "historyChangeSource";
    BuildInDataLayerKeys["elementId"] = "elementId";
    BuildInDataLayerKeys["elementClasses"] = "elementClasses";
    BuildInDataLayerKeys["element"] = "element";
    BuildInDataLayerKeys["elementTarget"] = "elementTarget";
    BuildInDataLayerKeys["elementUrl"] = "elementUrl";
    BuildInDataLayerKeys["elementText"] = "elementText";
    BuildInDataLayerKeys["errorMessage"] = "errorMessage";
    BuildInDataLayerKeys["formId"] = "formId";
    BuildInDataLayerKeys["formClasses"] = "formClasses";
    BuildInDataLayerKeys["formElement"] = "formElement";
    BuildInDataLayerKeys["formTarget"] = "formTarget";
    BuildInDataLayerKeys["formUrl"] = "formUrl";
    BuildInDataLayerKeys["formText"] = "formText";
    BuildInDataLayerKeys["errorUrl"] = "errorUrl";
    BuildInDataLayerKeys["errorLine"] = "errorLine";
    BuildInDataLayerKeys["scrollThreshold"] = "scrollThreshold";
    BuildInDataLayerKeys["scrollUnits"] = "scrollUnits";
    BuildInDataLayerKeys["scrollDirection"] = "scrollDirection";
    BuildInDataLayerKeys["timerCurrentTime"] = "timerCurrentTime";
    BuildInDataLayerKeys["timerElapsedTime"] = "timerElapsedTime";
    BuildInDataLayerKeys["timerEventNumber"] = "timerEventNumber";
    BuildInDataLayerKeys["timerInterval"] = "timerInterval";
    BuildInDataLayerKeys["timerLimit"] = "timerLimit";
    BuildInDataLayerKeys["timerStartTime"] = "timerStartTime";
    BuildInDataLayerKeys["timerEventName"] = "timerEventName";
    BuildInDataLayerKeys["start"] = "start";
})(BuildInDataLayerKeys || (BuildInDataLayerKeys = {}));
var DataLayerController = /** @class */ (function () {
    function DataLayerController(props) {
        this.data = [];
        this.events = new e();
        this.variableStorage = props.variableStorage;
    }
    DataLayerController.isInputEvent = function (inputItem) {
        return Boolean(inputItem.event);
    };
    DataLayerController.isEvent = function (item) {
        return Boolean(item.event);
    };
    DataLayerController.isEventKey = function (key, val) {
        return key === 'event' && typeof val === 'string';
    };
    DataLayerController.prototype.formattingInputItem = function (item) {
        var _a;
        if (DataLayerController.isInputEvent(item)) {
            return __assign(__assign({}, item), (_a = {}, _a[DataLayerController.ID_FIELD] = this.getLastEventId() + 1, _a));
        }
        return item;
    };
    DataLayerController.prototype.formattingEvent = function (event) {
        var _a;
        return __assign(__assign({}, event), (_a = {}, _a[DataLayerController.ID_FIELD] = this.getLastEventId() + 1, _a));
    };
    /**
     * Через этот метод сторонние сущности добавляют элементы в DataLayer.
     * Сторонние сущности, это например функция DataLayerWrap,
     * с ее помощью пользовательский объект acDataLayer будет добавлять новые элементы.
     * В этом случае могут сработать триггеры контейнера на определенное кастомное событие.
     */
    DataLayerController.prototype.addOutsideItem = function () {
        var _this = this;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        /**
         * Аккумулируем события, они должны быть вызваны только после установки всех переменных.
         */
        var eventsAcc = [];
        items.forEach(function (item) {
            var keys = objectKeys(item);
            var customEvent = null;
            keys.forEach(function (key) {
                var val = item[key];
                if (DataLayerController.isEventKey(key, val) && customEvent === null) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    item.event; var eventData_1 = __rest(item, ["event"]);
                    customEvent = new CustomEvent({ event: val });
                    objectKeys(eventData_1).forEach(function (eventKey) {
                        if (customEvent) {
                            customEvent[eventKey] = eventData_1[eventKey];
                        }
                    });
                    eventsAcc.push(customEvent);
                }
                else {
                    _this.variableStorage.add(UserVariables$1.CustomVariable, "".concat(key), val);
                }
            });
            _this.pushInputItem(item);
        });
        eventsAcc.forEach(function (event) {
            _this.events.emit('outsideEvent', event);
        });
    };
    DataLayerController.prototype.pushInputItem = function (item) {
        this.data.push(this.formattingInputItem(item));
        this.events.emit('updateData', this.data[this.data.length - 1]);
    };
    DataLayerController.prototype.pushInsideEvent = function (event) {
        this.data.push(this.formattingEvent(event));
        this.events.emit('updateData', this.data[this.data.length - 1]);
    };
    /**
     * Через этот метод сам контейнер добавляет элементы в dataLayer.
     */
    DataLayerController.prototype.addInsideItem = function (event) {
        this.pushInsideEvent(event);
    };
    DataLayerController.prototype.getLastEventId = function () {
        for (var i = this.data.length - 1; i > -1; i--) {
            var item = this.data[i];
            if (item && DataLayerController.isEvent(item)) {
                if (DataLayerController.isEvent(item)) {
                    return item[DataLayerController.ID_FIELD];
                }
            }
        }
        return 0;
    };
    DataLayerController.ID_FIELD = addAkPrefix('eventId');
    return DataLayerController;
}());

function idSelectorEquals(id) {
    return '#' + id;
}
function idSelectorContains(id) {
    return '[id*="' + id + '"]';
}
function idSelectorStartWith(id) {
    return '[id^="' + id + '"]';
}
function idSelectorEndWith(id) {
    return '[id$="' + id + '"]';
}
function classSelectorEquals(className) {
    return '.' + className;
}
function classSelectorContains(className) {
    return '[class*="' + className + '"]';
}
function classSelectorStartWith(className) {
    return '[class^="' + className + '"]';
}
function classSelectorEndWith(className) {
    return '[class$="' + className + '"]';
}
function urlSelectorEquals(url) {
    return '[href="' + url + '"]';
}
function urlSelectorContains(url) {
    return '[href*="' + url + '"]';
}
function urlSelectorStartWith(url) {
    return '[href^="' + url + '"]';
}
function urlSelectorEndWith(url) {
    return '[href$="' + url + '"]';
}
function targetSelectorEquals(target) {
    return '[target="' + target + '"]';
}
function targetSelectorContains(target) {
    return '[target*="' + target + '"]';
}
function targetSelectorStartWith(target) {
    return '[target^="' + target + '"]';
}
function targetSelectorEndWith(target) {
    return '[target$="' + target + '"]';
}
var searchEqualsSelectors = {
    id: idSelectorEquals,
    className: classSelectorEquals,
    url: urlSelectorEquals,
    target: targetSelectorEquals,
};
var searchContainsSelectors = {
    id: idSelectorContains,
    className: classSelectorContains,
    url: urlSelectorContains,
    target: targetSelectorContains,
};
var searchStartWithSelector = {
    id: idSelectorStartWith,
    className: classSelectorStartWith,
    url: urlSelectorStartWith,
    target: targetSelectorStartWith,
};
var searchEndWithSelector = {
    id: idSelectorEndWith,
    className: classSelectorEndWith,
    url: urlSelectorEndWith,
    target: targetSelectorEndWith,
};
/**
 * Найти элемент, точно соответствующему значению.
 * @param element
 * @param selector
 * @param value
 */
function findElementEquals(element, selector, value) {
    return element.closest(searchEqualsSelectors[selector](value));
}
/**
 * Найти элемент, точно атрибут которого содержит значение.
 * @param element
 * @param selector
 * @param value
 */
function findElementContains(element, selector, value) {
    return element.closest(searchContainsSelectors[selector](value));
}
/**
 * Найти элемент, значение атрибута которого, начинается с value.
 * @param element
 * @param selector
 * @param value
 */
function findElementStartWith(element, selector, value) {
    return element.closest(searchStartWithSelector[selector](value));
}
/**
 * Найти элемент, значение атрибута которого, заканчивается на value.
 * @param element
 * @param selector
 * @param value
 */
function findElementEndWith(element, selector, value) {
    return element.closest(searchEndWithSelector[selector](value));
}
/**
 * Найти элемент, соответсвующий css селектору.
 * @param element
 * @param selector
 */
function findElementMatchCssSelector(element, selector) {
    return element.closest(selector);
}

function isBuildInEvent(event) {
    return event.event.startsWith(AC_TAG_MANAGER_PREFIX);
}

function contains(value, filter) {
    return filter !== '' && String(value).trim().includes(filter);
}
function notContains(value, filter) {
    return filter !== '' && !(String(value).trim().includes(filter));
}
function startsWith(value, filter) {
    return filter !== '' && new RegExp("^".concat(filter)).test(String(value).trim());
}
function notStartsWith(value, filter) {
    return filter !== '' && !(new RegExp("^".concat(filter)).test(String(value).trim()));
}
function endsWith(value, filter) {
    return filter !== '' && new RegExp("".concat(filter, "$")).test(String(value).trim());
}
function notEndsWith(value, filter) {
    return filter !== '' && !(new RegExp("".concat(filter, "$")).test(String(value).trim()));
}

function isIDFormEquals(form, id) {
    return form.id.trim() === id;
}
function isIDFormContains(form, id) {
    return contains(form.id, id);
}
function isIdFormStartWith(form, id) {
    return startsWith(form.id, id);
}
function isIdFormEndWith(form, id) {
    return endsWith(form.id, id);
}
function isClassFormEquals(form, className) {
    return form.className === className;
}
function isClassFormContains(form, className) {
    return contains(form.className, className);
}
function isClassFormStartWith(form, className) {
    return startsWith(form.className, className);
}
function isClassFormEndWith(form, className) {
    return endsWith(form.className, className);
}
function isUrlFormEquals(form, url) {
    return form instanceof HTMLFormElement ? form.action === url : false;
}
function isUrlFormContains(form, url) {
    return form instanceof HTMLFormElement ? contains(form.action, url) : false;
}
function isUrlFormStartWith(form, url) {
    if (form instanceof HTMLFormElement) {
        return startsWith(form.action, url);
    }
    return false;
}
function isUrlFormEndWith(form, url) {
    if (form instanceof HTMLFormElement) {
        return endsWith(form.action, url);
    }
    return false;
}
function isTargetFormEquals(form, target) {
    return form instanceof HTMLFormElement ? form.target === target : false;
}
function isTargetFormContains(form, target) {
    return form instanceof HTMLFormElement ? contains(form.target, target) : false;
}
function isTargetFormStartWith(form, target) {
    if (form instanceof HTMLFormElement) {
        return startsWith(form.target, target);
    }
    return false;
}
function isTargetFormEndWith(form, target) {
    if (form instanceof HTMLFormElement) {
        return endsWith(form.target, target);
    }
    return false;
}
var checkEquals = {
    id: isIDFormEquals,
    className: isClassFormEquals,
    url: isUrlFormEquals,
    target: isTargetFormEquals,
};
var checkContains = {
    id: isIDFormContains,
    className: isClassFormContains,
    url: isUrlFormContains,
    target: isTargetFormContains,
};
var checkStartWith = {
    id: isIdFormStartWith,
    className: isClassFormStartWith,
    url: isUrlFormStartWith,
    target: isTargetFormStartWith,
};
var checkEndWith = {
    id: isIdFormEndWith,
    className: isClassFormEndWith,
    url: isUrlFormEndWith,
    target: isTargetFormEndWith,
};
/**
 * Проверить, что атрибут формы точно соответствует значению.
 * @param element
 * @param selector
 * @param value
 */
function checkFormEquals(element, selector, value) {
    return checkEquals[selector](element, value);
}
/**
 * Проверить, что атрибут формы содержит значение.
 * @param element
 * @param selector
 * @param value
 */
function checkFormContains(element, selector, value) {
    return checkContains[selector](element, value);
}
/**
 * Проверить, что атрибут формы начинается с.
 * @param element
 * @param selector
 * @param value
 */
function checkFormStartWith(element, selector, value) {
    return checkStartWith[selector](element, value);
}
/**
 * Проверить, что атрибут формы заканчивается на value.
 * @param element
 * @param selector
 * @param value
 */
function checkFormEndWith(element, selector, value) {
    return checkEndWith[selector](element, value);
}

/**
 * Проверить что элемент соответствует селектору
 */
function elementCorrespondsSelector(element, selector) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i] === element) {
            return true;
        }
    }
    return false;
}

/**
 * Проверить что текст элемента равен определенному.
 * @param element
 * @param text
 */
function textElementEquals(element, text) {
    if (element instanceof HTMLElement && element.textContent !== null) {
        return element.textContent.trim() === text;
    }
    return false;
}
/**
 * Содержит ли элемент определенный текст?
 * @param element
 * @param text
 */
function textElementContains(element, text) {
    if (element instanceof HTMLElement && element.textContent !== null) {
        return text !== '' && element.textContent.trim().includes(text);
    }
    return false;
}
/**
 * Текст элемента начинается со значения?
 * @param element
 * @param text
 */
function textElementStartWith(element, text) {
    if (element instanceof HTMLElement && element.textContent !== null) {
        return text !== '' && new RegExp("^".concat(text)).test(element.textContent.trim());
    }
    return false;
}
/**
 * Текст элемента заканчивается на значение?
 * @param element
 * @param text
 */
function textElementEndWith(element, text) {
    if (element instanceof HTMLElement && element.textContent !== null) {
        return text !== '' && new RegExp("".concat(text, "$")).test(element.textContent.trim());
    }
    return false;
}

function isDataLayerKey(argument) {
    return Boolean(Object.values(BuildInDataLayerKeys).find(function (key) { return key === argument; }));
}
var TriggerSegment = /** @class */ (function () {
    function TriggerSegment(segment, deps) {
        var _this = this;
        this.check = function (event) {
            if (event) {
                if (Array.isArray(event)) {
                    return _this.checkEvents(event);
                }
                return _this.checkEvent(event);
            }
            return _this.checkState();
        };
        this.segment = segment;
        this.deps = deps;
    }
    TriggerSegment.checkForm = function (query, event, key) {
        var form = event[BuildInDataLayerKeys.formElement];
        /**
         * По какому критерию искать элемент?
         * Если key - BuildInDataLayerKeys.element, то искать можем только по совпадению/несовпадению css-селектора.
         */
        var usingSelector = null;
        switch (key) {
            case BuildInDataLayerKeys.formClasses:
                usingSelector = 'className';
                break;
            case BuildInDataLayerKeys.formId:
                usingSelector = 'id';
                break;
            case BuildInDataLayerKeys.formTarget:
                usingSelector = 'target';
                break;
            case BuildInDataLayerKeys.formUrl:
                usingSelector = 'url';
                break;
        }
        if (form) {
            if (usingSelector) {
                switch (query.operator) {
                    case TriggerSegmentOperator.equals:
                        return checkFormEquals(form, usingSelector, query.filter);
                    case TriggerSegmentOperator.notEquals:
                        return !(checkFormEquals(form, usingSelector, query.filter));
                    case TriggerSegmentOperator.contains:
                        return checkFormContains(form, usingSelector, query.filter);
                    case TriggerSegmentOperator.notContains:
                        return !(checkFormContains(form, usingSelector, query.filter));
                    case TriggerSegmentOperator.startsWith:
                        return Boolean(checkFormStartWith(form, usingSelector, query.filter));
                    case TriggerSegmentOperator.notStartsWith:
                        return !(checkFormStartWith(form, usingSelector, query.filter));
                    case TriggerSegmentOperator.endsWith:
                        return Boolean(checkFormEndWith(form, usingSelector, query.filter));
                    case TriggerSegmentOperator.notEndsWith:
                        return !(checkFormEndWith(form, usingSelector, query.filter));
                    default:
                        return false;
                }
            }
            else {
                switch (key) {
                    case BuildInDataLayerKeys.formText:
                        switch (query.operator) {
                            case TriggerSegmentOperator.equals:
                                return Boolean(textElementEquals(form, query.filter));
                            case TriggerSegmentOperator.notEquals:
                                return !(textElementEquals(form, query.filter));
                            case TriggerSegmentOperator.contains:
                                return Boolean(textElementContains(form, query.filter));
                            case TriggerSegmentOperator.notContains:
                                return !(textElementContains(form, query.filter));
                            case TriggerSegmentOperator.startsWith:
                                return Boolean(textElementStartWith(form, query.filter));
                            case TriggerSegmentOperator.notStartsWith:
                                return !(textElementStartWith(form, query.filter));
                            case TriggerSegmentOperator.endsWith:
                                return Boolean(textElementEndWith(form, query.filter));
                            case TriggerSegmentOperator.notEndsWith:
                                return !(textElementEndWith(form, query.filter));
                            default:
                                return false;
                        }
                    case BuildInDataLayerKeys.formElement:
                        switch (query.operator) {
                            case TriggerSegmentOperator.matchCssSelector:
                                return elementCorrespondsSelector(form, query.filter);
                            case TriggerSegmentOperator.notMatchCssSelector:
                                return !elementCorrespondsSelector(form, query.filter);
                            default:
                                return false;
                        }
                    default:
                        return false;
                }
            }
        }
        return false;
    };
    /**
     * Проверить событие, использующее element на соответствие query по ключу.
     * @param query
     * @param event
     * @param key
     * @see this.segment.queries
     * @see BuildInDataLayerKeys.element
     */
    TriggerSegment.checkElement = function (query, event, key) {
        var element = event[BuildInDataLayerKeys.element];
        /**
         * По какому критерию искать элемент?
         * Если key - BuildInDataLayerKeys.element, то искать можем только по совпадению/несовпадению css-селектора.
         */
        var usingSelector = null;
        switch (key) {
            case BuildInDataLayerKeys.elementClasses:
                usingSelector = 'className';
                break;
            case BuildInDataLayerKeys.elementId:
                usingSelector = 'id';
                break;
            case BuildInDataLayerKeys.elementTarget:
                usingSelector = 'target';
                break;
            case BuildInDataLayerKeys.elementUrl:
                usingSelector = 'url';
                break;
        }
        if (element) {
            if (usingSelector) {
                switch (query.operator) {
                    case TriggerSegmentOperator.equals:
                        return Boolean(findElementEquals(element, usingSelector, query.filter));
                    case TriggerSegmentOperator.notEquals:
                        return !(findElementEquals(element, usingSelector, query.filter));
                    case TriggerSegmentOperator.contains:
                        return Boolean(findElementContains(element, usingSelector, query.filter));
                    case TriggerSegmentOperator.notContains:
                        return !(findElementContains(element, usingSelector, query.filter));
                    case TriggerSegmentOperator.startsWith:
                        return Boolean(findElementStartWith(element, usingSelector, query.filter));
                    case TriggerSegmentOperator.notStartsWith:
                        return !(findElementStartWith(element, usingSelector, query.filter));
                    case TriggerSegmentOperator.endsWith:
                        return Boolean(findElementEndWith(element, usingSelector, query.filter));
                    case TriggerSegmentOperator.notEndsWith:
                        return !(findElementEndWith(element, usingSelector, query.filter));
                    case TriggerSegmentOperator.matchCssSelector:
                        return Boolean(findElementMatchCssSelector(element, query.filter));
                    case TriggerSegmentOperator.notMatchCssSelector:
                        return !(findElementMatchCssSelector(element, query.filter));
                    default:
                        return false;
                }
            }
            else {
                switch (key) {
                    case BuildInDataLayerKeys.elementText:
                        switch (query.operator) {
                            case TriggerSegmentOperator.equals:
                                return Boolean(textElementEquals(element, query.filter));
                            case TriggerSegmentOperator.notEquals:
                                return !(textElementEquals(element, query.filter));
                            case TriggerSegmentOperator.contains:
                                return Boolean(textElementContains(element, query.filter));
                            case TriggerSegmentOperator.notContains:
                                return !(textElementContains(element, query.filter));
                            case TriggerSegmentOperator.startsWith:
                                return Boolean(textElementStartWith(element, query.filter));
                            case TriggerSegmentOperator.notStartsWith:
                                return !(textElementStartWith(element, query.filter));
                            case TriggerSegmentOperator.endsWith:
                                return Boolean(textElementEndWith(element, query.filter));
                            case TriggerSegmentOperator.notEndsWith:
                                return !(textElementEndWith(element, query.filter));
                            default:
                                return false;
                        }
                    case BuildInDataLayerKeys.element:
                        switch (query.operator) {
                            case TriggerSegmentOperator.matchCssSelector:
                                return elementCorrespondsSelector(element, query.filter);
                            case TriggerSegmentOperator.notMatchCssSelector:
                                return !elementCorrespondsSelector(element, query.filter);
                            default:
                                return false;
                        }
                    default:
                        return false;
                }
            }
        }
        return false;
    };
    /**
     * Проверить характеристики видимости элемента.
     * @private
     */
    TriggerSegment.checkVisibleElement = function (query, event) {
        var visibleRatio = event[BuildInDataLayerKeys.visibleRatio];
        switch (query.operator) {
            case TriggerSegmentOperator.equals:
                return TriggerSegment.equals(visibleRatio, query.filter);
            case TriggerSegmentOperator.notEquals:
                return TriggerSegment.notEquals(visibleRatio, query.filter);
            case TriggerSegmentOperator.contains:
                return contains(visibleRatio, query.filter);
            case TriggerSegmentOperator.notContains:
                return notContains(visibleRatio, query.filter);
            case TriggerSegmentOperator.startsWith:
                return startsWith(visibleRatio, query.filter);
            case TriggerSegmentOperator.notStartsWith:
                return notStartsWith(visibleRatio, query.filter);
            case TriggerSegmentOperator.endsWith:
                return endsWith(visibleRatio, query.filter);
            case TriggerSegmentOperator.notEndsWith:
                return notEndsWith(visibleRatio, query.filter);
            case TriggerSegmentOperator.greater:
            case TriggerSegmentOperator.greaterOrEquals:
            case TriggerSegmentOperator.less:
            case TriggerSegmentOperator.lessOrEquals:
                return TriggerSegment.compare(query.filter, visibleRatio, query.operator);
            default:
                return false;
        }
    };
    /**
     * Приведение типов фильтра.
     * Анализирует строку и приводит к одному из примитивных типов.
     * @param filter
     * @private
     */
    TriggerSegment.typeFilter = function (filter) {
        var trimmedFilter = filter.trim();
        if (String(undefined) === trimmedFilter) {
            return undefined;
        }
        if (String(null) === trimmedFilter) {
            return null;
        }
        if (!Number.isNaN(Number(trimmedFilter))) {
            return Number(trimmedFilter);
        }
        return trimmedFilter;
    };
    TriggerSegment.compare = function (filter, calculation, compare) {
        var typeFilter = TriggerSegment.typeFilter(filter);
        if ((typeof calculation === 'string' || typeof calculation === 'number') && typeof typeFilter === 'number') {
            switch (compare) {
                case TriggerSegmentOperator.greaterOrEquals:
                    return calculation >= typeFilter;
                case TriggerSegmentOperator.greater:
                    return calculation > typeFilter;
                case TriggerSegmentOperator.less:
                    return calculation < typeFilter;
                case TriggerSegmentOperator.lessOrEquals:
                    return calculation <= typeFilter;
                default:
                    return false;
            }
        }
        return false;
    };
    TriggerSegment.equals = function (value, filter) {
        return value === TriggerSegment.typeFilter(filter);
    };
    TriggerSegment.notEquals = function (value, filter) {
        return value !== TriggerSegment.typeFilter(filter);
    };
    TriggerSegment.checkScrollDirection = function (query, event) {
        var scrollDirection = event[BuildInDataLayerKeys.scrollDirection];
        switch (query.operator) {
            case TriggerSegmentOperator.equals:
                return TriggerSegment.equals(scrollDirection, query.filter);
            case TriggerSegmentOperator.notEquals:
                return TriggerSegment.notEquals(scrollDirection, query.filter);
            default:
                return false;
        }
    };
    TriggerSegment.scrollScrollUnits = function (query, event) {
        var scrollUnits = event[BuildInDataLayerKeys.scrollUnits];
        switch (query.operator) {
            case TriggerSegmentOperator.equals:
                return TriggerSegment.equals(scrollUnits, query.filter);
            case TriggerSegmentOperator.notEquals:
                return TriggerSegment.notEquals(scrollUnits, query.filter);
            default:
                return false;
        }
    };
    TriggerSegment.checkScrollThreshold = function (query, event) {
        var scrollThreshold = event[BuildInDataLayerKeys.scrollThreshold];
        switch (query.operator) {
            case TriggerSegmentOperator.equals:
                return TriggerSegment.equals(scrollThreshold, query.filter);
            case TriggerSegmentOperator.notEquals:
                return TriggerSegment.notEquals(scrollThreshold, query.filter);
            case TriggerSegmentOperator.contains:
                return contains(scrollThreshold, query.filter);
            case TriggerSegmentOperator.notContains:
                return notContains(scrollThreshold, query.filter);
            case TriggerSegmentOperator.startsWith:
                return startsWith(scrollThreshold, query.filter);
            case TriggerSegmentOperator.notStartsWith:
                return notStartsWith(scrollThreshold, query.filter);
            case TriggerSegmentOperator.endsWith:
                return endsWith(scrollThreshold, query.filter);
            case TriggerSegmentOperator.notEndsWith:
                return notEndsWith(scrollThreshold, query.filter);
            case TriggerSegmentOperator.greater:
            case TriggerSegmentOperator.greaterOrEquals:
            case TriggerSegmentOperator.less:
            case TriggerSegmentOperator.lessOrEquals:
                return TriggerSegment.compare(query.filter, scrollThreshold, query.operator);
            default:
                return false;
        }
    };
    TriggerSegment.checkUrl = function (query, event, key) {
        var value = event[key];
        if (!(value instanceof Element)) {
            switch (query.operator) {
                case TriggerSegmentOperator.equals:
                    return TriggerSegment.equals(value, query.filter);
                case TriggerSegmentOperator.notEquals:
                    return TriggerSegment.notEquals(value, query.filter);
                case TriggerSegmentOperator.contains:
                    return contains(value, query.filter);
                case TriggerSegmentOperator.notContains:
                    return notContains(value, query.filter);
                case TriggerSegmentOperator.startsWith:
                    return startsWith(value, query.filter);
                case TriggerSegmentOperator.notStartsWith:
                    return notStartsWith(value, query.filter);
                case TriggerSegmentOperator.endsWith:
                    return endsWith(value, query.filter);
                case TriggerSegmentOperator.notEndsWith:
                    return notEndsWith(value, query.filter);
                default:
                    return false;
            }
        }
        return false;
    };
    TriggerSegment.checkError = function (query, event, key) {
        var value = event[key];
        if (!(value instanceof Element)) {
            switch (query.operator) {
                case TriggerSegmentOperator.equals:
                    return TriggerSegment.equals(value, query.filter);
                case TriggerSegmentOperator.notEquals:
                    return TriggerSegment.notEquals(value, query.filter);
                case TriggerSegmentOperator.contains:
                    return contains(value, query.filter);
                case TriggerSegmentOperator.notContains:
                    return notContains(value, query.filter);
                case TriggerSegmentOperator.startsWith:
                    return startsWith(value, query.filter);
                case TriggerSegmentOperator.notStartsWith:
                    return notStartsWith(value, query.filter);
                case TriggerSegmentOperator.endsWith:
                    return endsWith(value, query.filter);
                case TriggerSegmentOperator.notEndsWith:
                    return notEndsWith(value, query.filter);
                default:
                    return false;
            }
        }
        return false;
    };
    TriggerSegment.prototype.checkVariable = function (query) {
        var argument = query.argument;
        var variable = this.deps.variableStorage.variable(argument);
        var calculationResult;
        if (variable) {
            calculationResult = variable.read();
            switch (query.operator) {
                case TriggerSegmentOperator.equals:
                    return TriggerSegment.equals(calculationResult, query.filter);
                case TriggerSegmentOperator.notEquals:
                    return TriggerSegment.notEquals(calculationResult, query.filter);
                case TriggerSegmentOperator.contains:
                    return contains(calculationResult, query.filter);
                case TriggerSegmentOperator.notContains:
                    return notContains(calculationResult, query.filter);
                case TriggerSegmentOperator.startsWith:
                    return startsWith(calculationResult, query.filter);
                case TriggerSegmentOperator.notStartsWith:
                    return notStartsWith(calculationResult, query.filter);
                case TriggerSegmentOperator.endsWith:
                    return endsWith(calculationResult, query.filter);
                case TriggerSegmentOperator.notEndsWith:
                    return notEndsWith(calculationResult, query.filter);
                case TriggerSegmentOperator.matchCssSelector:
                    return calculationResult instanceof Element
                        && Boolean(findElementMatchCssSelector(calculationResult, query.filter));
                case TriggerSegmentOperator.notMatchCssSelector:
                    return calculationResult instanceof Element
                        && !(findElementMatchCssSelector(calculationResult, query.filter));
                case TriggerSegmentOperator.greater:
                case TriggerSegmentOperator.greaterOrEquals:
                case TriggerSegmentOperator.less:
                case TriggerSegmentOperator.lessOrEquals:
                    return TriggerSegment.compare(query.filter, calculationResult, query.operator);
                default:
                    return false;
            }
        }
        else { // TODO: Посмотреть как работает gtm если просит проверить в сегменте несуществующую переменную.
            return false;
        }
    };
    /**
     * Проверить событие на соответствие query.
     * @param query
     * @param event
     * @see this.segment.queries
     */
    TriggerSegment.prototype.checkQuery = function (query, event) {
        var argument = query.argument;
        var useDataLayerKey = isDataLayerKey(argument);
        if (useDataLayerKey) { // использовался встроенный ключ события.
            if (isBuildInEvent(event)) {
                switch (argument) {
                    case BuildInDataLayerKeys.element:
                    case BuildInDataLayerKeys.elementId:
                    case BuildInDataLayerKeys.elementClasses:
                    case BuildInDataLayerKeys.elementUrl:
                    case BuildInDataLayerKeys.elementTarget:
                    case BuildInDataLayerKeys.elementText:
                        return TriggerSegment.checkElement(query, event, argument);
                    case BuildInDataLayerKeys.visibleRatio:
                        return TriggerSegment.checkVisibleElement(query, event);
                    case BuildInDataLayerKeys.scrollDirection:
                        return TriggerSegment.checkScrollDirection(query, event);
                    case BuildInDataLayerKeys.scrollUnits:
                        return TriggerSegment.scrollScrollUnits(query, event);
                    case BuildInDataLayerKeys.scrollThreshold:
                        return TriggerSegment.checkScrollThreshold(query, event);
                    case BuildInDataLayerKeys.formElement:
                    case BuildInDataLayerKeys.formId:
                    case BuildInDataLayerKeys.formClasses:
                    case BuildInDataLayerKeys.formUrl:
                    case BuildInDataLayerKeys.formTarget:
                    case BuildInDataLayerKeys.formText:
                        return TriggerSegment.checkForm(query, event, argument);
                    case BuildInDataLayerKeys.newUrl:
                    case BuildInDataLayerKeys.oldUrl:
                    case BuildInDataLayerKeys.newUrlFragment:
                    case BuildInDataLayerKeys.oldUrlFragment:
                        return TriggerSegment.checkUrl(query, event, argument);
                    case BuildInDataLayerKeys.errorUrl:
                    case BuildInDataLayerKeys.errorLine:
                    case BuildInDataLayerKeys.errorMessage:
                        return TriggerSegment.checkError(query, event, argument);
                    default:
                        return false;
                }
            }
        }
        return this.checkVariable(query);
    };
    TriggerSegment.prototype.checkState = function () {
        var isExecuted = false;
        for (var i = 0; i < this.segment.queries.length; i++) {
            isExecuted = this.checkVariable(this.segment.queries[i]);
            if (!isExecuted)
                return isExecuted;
        }
        return isExecuted;
    };
    /**
     * Проверить событие на соотв. сегменту.
     * Проверка по "И".
     * Если все queries верны, значит сегмент верен.
     * @param event
     * @see TriggerSegmentQuery
     */
    TriggerSegment.prototype.checkEvent = function (event) {
        var isExecuted = false;
        for (var i = 0; i < this.segment.queries.length; i++) {
            isExecuted = this.checkQuery(this.segment.queries[i], event);
            if (!isExecuted)
                return isExecuted;
        }
        return isExecuted;
    };
    /**
     * Проверить события на соотв. сегменту.
     * Проверка по "ИЛИ".
     * Если все queries в 1 из событий верен, значит сегмент верен.
     * @param events
     * @see TriggerSegmentQuery
     */
    TriggerSegment.prototype.checkEvents = function (events) {
        var isExecuted = false;
        for (var i = 0; i < events.length; i++) {
            isExecuted = this.checkEvent(events[i]);
            if (isExecuted)
                return isExecuted;
        }
        return isExecuted;
    };
    return TriggerSegment;
}());

var TriggerSegmentFactory = /** @class */ (function () {
    function TriggerSegmentFactory(deps) {
        this.deps = deps;
    }
    TriggerSegmentFactory.prototype.create = function (segment) {
        return new TriggerSegment(segment, this.deps);
    };
    return TriggerSegmentFactory;
}());

/**
 * Нам требуется EventEmitter, который умеет вызывать асинхронные хендлеры по очереди:
 * следующий асинхронный хендлер не выполнится, пока не закончится выполнение предыдущего.
 */
var AsyncIteratorEventEmitter = /** @class */ (function (_super) {
    __extends(AsyncIteratorEventEmitter, _super);
    function AsyncIteratorEventEmitter() {
        var _this = _super.call(this) || this;
        _this.listeners = null;
        return _this;
    }
    AsyncIteratorEventEmitter.prototype.emit = function (event, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var listeners, events, i, ev, k, listener;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        listeners = this.listeners;
                        if (!listeners) return [3 /*break*/, 6];
                        events = Object.keys(listeners);
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < events.length)) return [3 /*break*/, 6];
                        ev = events[i];
                        if (!(ev === event && listeners[event])) return [3 /*break*/, 5];
                        k = 0;
                        _a.label = 2;
                    case 2:
                        if (!(k < listeners[event].length)) return [3 /*break*/, 5];
                        listener = listeners[event][k];
                        // eslint-disable-next-line no-await-in-loop
                        return [4 /*yield*/, listener(payload)];
                    case 3:
                        // eslint-disable-next-line no-await-in-loop
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        k++;
                        return [3 /*break*/, 2];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return AsyncIteratorEventEmitter;
}(e));

var Trigger = /** @class */ (function () {
    function Trigger(props) {
        var _this = this;
        this.registerListener = function (event, listener) { return _this.events.registerListener(event, listener); };
        this.deregisterListener = function (event, listener) { return _this.events.deregisterListener(event, listener); };
        this.segmentFactory = new TriggerSegmentFactory({ variableStorage: props.deps.variableStorage });
        this.strId = props.strId;
        this.events = new AsyncIteratorEventEmitter();
        if (props === null || props === void 0 ? void 0 : props.segment) {
            this.segment = this.segmentFactory.create(props.segment);
        }
    }
    return Trigger;
}());

var GroupTriggerEvent = /** @class */ (function () {
    function GroupTriggerEvent() {
        this.event = addAkPrefix('triggerGroup');
    }
    return GroupTriggerEvent;
}());

var GroupsTrigger = /** @class */ (function (_super) {
    __extends(GroupsTrigger, _super);
    function GroupsTrigger(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TriggerType.GroupTrigger;
        _this.triggerFinished = false;
        _this.registerEvokedChildren = {};
        _this.childListener = _this.childListener.bind(_this);
        props.children.forEach(function (child) {
            _this.registerEvokedChildren[child.strId] = {
                wasCalled: false,
            };
        });
        props.children.forEach(function (child) {
            child.registerListener('complete', _this.childListener);
        });
        return _this;
    }
    GroupsTrigger.prototype.checkAllTriggersHaveBeenCalled = function () {
        return !(Object.values(this.registerEvokedChildren).find(function (trigger) { return !trigger.wasCalled; }));
    };
    /**
     * Отчистить регистр вызванных триггеров.
     * После этой операции считаем что связанные триггеры еще не были вызваны и мы снова можем следить за их событиями.
     * @private
     */
    GroupsTrigger.prototype.reset = function () {
        Object.values(this.registerEvokedChildren).forEach(function (child) {
            // eslint-disable-next-line no-param-reassign
            child.wasCalled = false;
        });
        this.triggerFinished = false;
    };
    GroupsTrigger.prototype.childListener = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var wasCalled;
            return __generator(this, function (_a) {
                /**
                 * Если триггер еще не был зарегистрирован
                 */
                if (!this.registerEvokedChildren[payload.trigger.strId].wasCalled) {
                    this.registerEvokedChildren[payload.trigger.strId].wasCalled = true;
                    this.registerEvokedChildren[payload.trigger.strId].event = payload.event;
                }
                wasCalled = this.checkAllTriggersHaveBeenCalled();
                if (!this.triggerFinished && wasCalled) {
                    this.handler();
                }
                return [2 /*return*/];
            });
        });
    };
    GroupsTrigger.prototype.handler = function () {
        var _this = this;
        var events = [];
        var groupTriggerEvent = new GroupTriggerEvent();
        var mustBeStarted;
        this.triggerFinished = true;
        Object.values(this.registerEvokedChildren).forEach(function (child) {
            if (child.event) {
                if (Array.isArray(child.event)) {
                    events.push.apply(events, __spreadArray([], __read(child.event), false));
                }
                else {
                    events.push(child.event);
                }
            }
        });
        if (this.segment !== undefined) {
            mustBeStarted = this.segment.check(events);
        }
        else {
            mustBeStarted = true;
        }
        if (mustBeStarted) {
            var event_1 = __spreadArray([groupTriggerEvent], __read(events), false);
            this.events.emit('run', {
                trigger: this,
                event: event_1,
                complete: {
                    wasRunning: true,
                    onRelatedActivitiesCompleted: function () {
                        _this.events.emit('complete', { trigger: _this, event: __spreadArray([groupTriggerEvent], __read(events), false) });
                    },
                },
            });
        }
        return {
            wasRunning: false,
        };
    };
    return GroupsTrigger;
}(Trigger));

var ClickEvent = /** @class */ (function () {
    function ClickEvent(props) {
        this.event = addAkPrefix('click');
        this.elementId = props.elementId;
        this.elementClasses = props.elementClasses;
        this.element = props.element;
        this.elementTarget = props.elementTarget;
        this.elementUrl = props.elementUrl;
        this.elementText = props.elementText;
    }
    return ClickEvent;
}());
BuildInDataLayerKeys.elementId, BuildInDataLayerKeys.elementClasses, BuildInDataLayerKeys.element, BuildInDataLayerKeys.elementTarget, BuildInDataLayerKeys.elementUrl, BuildInDataLayerKeys.elementText;

var InitializationEvent = /** @class */ (function () {
    function InitializationEvent() {
        this.event = addAkPrefix('init');
    }
    return InitializationEvent;
}());

var ViewPageEvent = /** @class */ (function () {
    function ViewPageEvent() {
        this.event = addAkPrefix('viewPage');
    }
    return ViewPageEvent;
}());

var DomReadyEvent = /** @class */ (function () {
    function DomReadyEvent() {
        this.event = addAkPrefix('domReady');
    }
    return DomReadyEvent;
}());

var WindowLoadedEvent = /** @class */ (function () {
    function WindowLoadedEvent() {
        this.event = addAkPrefix('windowLoaded');
    }
    return WindowLoadedEvent;
}());

/**
 * Корректировка округления десятичных дробей.
 *
 * @param {String}  type  Тип корректировки.
 * @param {Number}  value Число.
 * @param {Number} exp   Показатель степени (десятичный логарифм основания корректировки).
 * @returns {Number} Скорректированное значение.
 */
function decimalAdjust(type, value, exp) {
    // Если степень не определена, либо равна нулю...
    if (typeof exp === 'undefined' || +exp === 0) {
        return Math[type](value);
    }
    // Сдвиг разрядов
    var val = value.toString().split('e');
    var result = Math[type](+(val[0] + 'e' + (val[1] ? (+val[1] - exp) : -exp)));
    // Обратный сдвиг
    val = result.toString().split('e');
    return +(val[0] + 'e' + (val[1] ? (+val[1] + exp) : exp));
}

var VisibleElementObserver = /** @class */ (function () {
    function VisibleElementObserver(props) {
        var _this = this;
        var options = {
            root: document.body,
            rootMargin: '0px',
            threshold: VisibleElementObserver.prepareThreshold(props.threshold),
        };
        var visibilityTimeRequired = props.visibilityTimeRequired || 0;
        this.visibilityTime = 0;
        this.spyIntervalId = null;
        this.visibilityTimeIntervalId = null;
        this.observer = new IntersectionObserver(function (_a) {
            var _b = __read(_a, 1), entry = _b[0];
            if (entry.isIntersecting) {
                var wasRunningCb_1 = false;
                if (visibilityTimeRequired === 0) {
                    if (!wasRunningCb_1) {
                        wasRunningCb_1 = true;
                        var elementTarget = entry.target.getAttribute('target');
                        var elementUrl = entry.target.getAttribute('href');
                        props.cb({
                            visibleTime: _this.visibilityTime,
                            visibleRatio: VisibleElementObserver.prepareIntersectionRatio(entry.intersectionRatio),
                            elementId: entry.target.id,
                            elementClasses: entry.target.className,
                            element: entry.target,
                            elementTarget: elementTarget || '',
                            elementUrl: elementUrl || '',
                        });
                    }
                }
                else {
                    var needRunCb_1 = _this.visibilityTime >= visibilityTimeRequired;
                    _this.visibilityTimeIntervalId = window.setInterval(function () {
                        _this.visibilityTime += 100;
                        needRunCb_1 = _this.visibilityTime >= visibilityTimeRequired;
                        if (needRunCb_1) {
                            if (!wasRunningCb_1) {
                                wasRunningCb_1 = true;
                                var elementTarget = entry.target.getAttribute('target');
                                var elementUrl = entry.target.getAttribute('href');
                                props.cb({
                                    visibleTime: _this.visibilityTime,
                                    visibleRatio: VisibleElementObserver.prepareIntersectionRatio(entry.intersectionRatio),
                                    elementId: entry.target.id,
                                    elementClasses: entry.target.className,
                                    element: entry.target,
                                    elementTarget: elementTarget || '',
                                    elementUrl: elementUrl || '',
                                });
                            }
                        }
                    }, 100);
                    if (needRunCb_1 && !wasRunningCb_1) {
                        wasRunningCb_1 = true;
                        var elementTarget = entry.target.getAttribute('target');
                        var elementUrl = entry.target.getAttribute('href');
                        props.cb({
                            visibleTime: _this.visibilityTime,
                            visibleRatio: VisibleElementObserver.prepareIntersectionRatio(entry.intersectionRatio),
                            elementId: entry.target.id,
                            elementClasses: entry.target.className,
                            element: entry.target,
                            elementTarget: elementTarget || '',
                            elementUrl: elementUrl || '',
                        });
                    }
                }
            }
            else {
                _this.clearVisibilityTimeIntervalId();
            }
        }, options);
        this.spy(props.selector);
    }
    /**
     * Обработка процента видимости. Процент приходит в числах от 0 / 100.
     * IntersectionObserverInit.threshold принимает числа от 0 до 1.
     * Преобразовываем одно в другое.
     *
     * @param threshold
     * @private
     *
     * @see IntersectionObserverInit.threshold
     */
    VisibleElementObserver.prepareThreshold = function (threshold) {
        if (threshold !== undefined) {
            decimalAdjust('round', threshold / 100, -2);
        }
        return 100;
    };
    /**
     * Приходит от 0 до 1, возвращаем от 0 до 100.
     * @param intersectionRatio
     * @private
     *
     * @see IntersectionObserverEntry.intersectionRatio
     */
    VisibleElementObserver.prepareIntersectionRatio = function (intersectionRatio) {
        return decimalAdjust('round', intersectionRatio * 100, 0);
    };
    VisibleElementObserver.prototype.spy = function (selector) {
        var _this = this;
        var el = document.querySelector(selector);
        if (el) {
            this.observer.observe(el);
        }
        else {
            this.spyIntervalId = window.setInterval(function () {
                var $el = document.querySelector(selector);
                if ($el) {
                    _this.clearSpyIntervalId();
                    _this.observer.observe($el);
                }
            }, 100);
        }
    };
    VisibleElementObserver.prototype.clearSpyIntervalId = function () {
        if (this.spyIntervalId) {
            clearInterval(this.spyIntervalId);
            this.spyIntervalId = null;
        }
    };
    VisibleElementObserver.prototype.clearVisibilityTimeIntervalId = function () {
        if (this.visibilityTimeIntervalId) {
            clearInterval(this.visibilityTimeIntervalId);
            this.visibilityTimeIntervalId = null;
        }
    };
    VisibleElementObserver.prototype.resetVisibilityTime = function () {
        this.visibilityTime = 0;
    };
    VisibleElementObserver.prototype.deactivate = function () {
        this.clearSpyIntervalId();
        this.clearVisibilityTimeIntervalId();
        this.resetVisibilityTime();
        this.observer.disconnect();
    };
    return VisibleElementObserver;
}());

var DomElementVisibilityEvent = /** @class */ (function () {
    function DomElementVisibilityEvent(props) {
        this.event = addAkPrefix('elementVisibility');
        this.elementId = props.elementId;
        this.elementClasses = props.elementClasses;
        this.element = props.element;
        this.elementTarget = props.elementTarget;
        this.elementUrl = props.elementUrl;
        this.visibleTime = props.visibleTime;
        this.visibleRatio = props.visibleRatio;
    }
    return DomElementVisibilityEvent;
}());
BuildInDataLayerKeys.elementId, BuildInDataLayerKeys.elementClasses, BuildInDataLayerKeys.element, BuildInDataLayerKeys.elementTarget, BuildInDataLayerKeys.elementUrl, BuildInDataLayerKeys.visibleRatio, BuildInDataLayerKeys.visibleTime;

var DomElementVisibleTrigger = /** @class */ (function (_super) {
    __extends(DomElementVisibleTrigger, _super);
    function DomElementVisibleTrigger(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TriggerType.DomElementVisible;
        _this.props = props;
        _this.handler = _this.handler.bind(_this);
        _this.visibilitySensor = new VisibleElementObserver({
            selector: DomElementVisibleTrigger.prepareSelector({
                selector: props.fields.selector,
                selectorType: props.fields.selectorType,
            }),
            threshold: props.fields.threshold,
            visibilityTimeRequired: props.fields.visibilityTimeRequired,
            cb: _this.handler,
        });
        return _this;
    }
    DomElementVisibleTrigger.prepareSelector = function (opts) {
        if (opts.selectorType === 'id') {
            return "#".concat(opts.selector);
        }
        return opts.selector;
    };
    DomElementVisibleTrigger.prototype.reset = function () {
        this.visibilitySensor.deactivate();
        this.visibilitySensor = new VisibleElementObserver({
            selector: DomElementVisibleTrigger.prepareSelector({
                selector: this.props.fields.selector,
                selectorType: this.props.fields.selectorType,
            }),
            threshold: this.props.fields.threshold,
            visibilityTimeRequired: this.props.fields.visibilityTimeRequired,
            cb: this.handler,
        });
    };
    DomElementVisibleTrigger.prototype.handler = function (event) {
        var _this = this;
        var visibilityEvent = new DomElementVisibilityEvent({
            elementId: event.elementId,
            elementClasses: event.elementClasses,
            element: event.element,
            elementTarget: event.elementTarget,
            elementUrl: event.elementUrl,
            visibleTime: event.visibleTime,
            visibleRatio: event.visibleRatio,
        });
        var mustBeStarted;
        if (this.segment !== undefined) {
            mustBeStarted = this.segment.check(visibilityEvent);
        }
        else {
            mustBeStarted = true;
        }
        if (mustBeStarted) {
            this.events.emit('run', {
                trigger: this,
                event: visibilityEvent,
            });
            return {
                wasRunning: true,
                onRelatedActivitiesCompleted: function () {
                    _this.events.emit('complete', { trigger: _this, event: visibilityEvent });
                },
            };
        }
        return {
            wasRunning: false,
        };
    };
    return DomElementVisibleTrigger;
}(Trigger));

/**
 * Возвращает функцию, которая, пока ее продолжают вызывать, не будет
 * вызываться. Функция будет вызвана после того, как ее перестанут вызывать в течение
 * N миллисекунд.
 *
 * @param func - функция для оборачивания
 * @param wait - таймаут в мс
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce(func, wait) {
    var timer = 0;
    return function () {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var context = this;
        // eslint-disable-next-line prefer-rest-params
        var args = arguments;
        clearTimeout(timer);
        timer = window.setTimeout(function () {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            func.apply(context, args);
        }, wait || 100);
    };
}

var ScrollDepthEvent = /** @class */ (function () {
    function ScrollDepthEvent(props) {
        this.event = addAkPrefix('scrollDepth');
        this.scrollDirection = props.scrollDirection;
        this.scrollThreshold = props.scrollThreshold;
        this.scrollUnits = props.scrollUnits;
    }
    return ScrollDepthEvent;
}());
BuildInDataLayerKeys.scrollDirection, BuildInDataLayerKeys.scrollThreshold, BuildInDataLayerKeys.scrollUnits;

/**
 * Удалить дубликаты из массива.
 * @param arr
 */
function removeDuplicates(arr) {
    return arr.filter(function (str, index, self) { return index === self.findIndex(function (selfStr) { return selfStr === str; }); });
}

/**
 * Размеры документа
 */
var DocumentSize = /** @class */ (function () {
    function DocumentSize() {
    }
    /**
     * Получить высоту документа
     */
    DocumentSize.height = function () {
        return Math.max(document.body.offsetHeight, document.body.clientHeight, document.body.scrollHeight);
    };
    /**
     * Получить ширину документа
     */
    DocumentSize.width = function () {
        return Math.max(document.body.offsetWidth, document.body.clientWidth, document.body.scrollWidth);
    };
    return DocumentSize;
}());

var ScrollingDepthTrigger = /** @class */ (function (_super) {
    __extends(ScrollingDepthTrigger, _super);
    function ScrollingDepthTrigger(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TriggerType.ScrollingDepth;
        _this.passedScrollingSteps = {
            vertical: {
                percents: [],
                pixels: [],
            },
            horizontal: {
                percents: [],
                pixels: [],
            },
        };
        _this.props = __assign(__assign({}, props), { fields: ScrollingDepthTrigger.prepareFields(props.fields) });
        _this.maxVerticalScrollDepth = 0;
        _this.maxHorizontalDepthWidth = 0;
        _this.handler = _this.handler.bind(_this);
        _this.registration = _this.registration.bind(_this);
        _this.run = _this.run.bind(_this);
        _this.reset = _this.reset.bind(_this);
        _this.verticalScrollHandler = _this.verticalScrollHandler.bind(_this);
        _this.horizontalScrollHandler = _this.horizontalScrollHandler.bind(_this);
        return _this;
    }
    ScrollingDepthTrigger.isScrollingDepthTrigger = function (trigger) {
        return trigger.type === TriggerType.ScrollingDepth;
    };
    /**
     * Обработать проценты.
     * Правила следующие:
     * - Процент должен быть меньше 0. Если меньше - делаем 0.
     * - Процент не должен быть больше 100. Если больше - делаем 100.
     * @param percent
     */
    ScrollingDepthTrigger.processPercent = function (percent) {
        return percent.map(function (p) {
            if (p < 0)
                return 0;
            if (p > 100)
                return 100;
            return p;
        });
    };
    /**
     * Подготавливаем поля - Данные в полях теоретически могут содержать дубли, избавляемся от них.
     * @param fields
     * @private
     */
    ScrollingDepthTrigger.prepareFields = function (fields) {
        var result = __assign({}, fields);
        if (result.verticalScrollDepth) {
            if (isType(result.verticalScrollDepth, 'percents')) {
                result.verticalScrollDepth.percents = removeDuplicates(ScrollingDepthTrigger.processPercent(result.verticalScrollDepth.percents));
            }
            else if (isType(result.verticalScrollDepth, 'pixels')) {
                result.verticalScrollDepth.pixels = removeDuplicates(result.verticalScrollDepth.pixels);
            }
        }
        else if (result.horizontalScrollDepth) {
            if (isType(result.horizontalScrollDepth, 'percents')) {
                result.horizontalScrollDepth.percents = removeDuplicates(ScrollingDepthTrigger.processPercent(result.horizontalScrollDepth.percents));
            }
            else if (isType(result.horizontalScrollDepth, 'pixels')) {
                result.horizontalScrollDepth.pixels = removeDuplicates(result.horizontalScrollDepth.pixels);
            }
        }
        return result;
    };
    ScrollingDepthTrigger.prototype.verticalScrollHandler = function () {
        var depth = window.pageYOffset + window.innerHeight;
        if (depth > this.maxVerticalScrollDepth) {
            this.maxVerticalScrollDepth = depth;
            this.run({ orientation: 'vertical', depth: this.maxVerticalScrollDepth });
        }
    };
    ScrollingDepthTrigger.prototype.horizontalScrollHandler = function () {
        var depth = window.pageXOffset + window.innerWidth;
        if (depth > this.maxHorizontalDepthWidth) {
            this.maxHorizontalDepthWidth = depth;
            this.run({ orientation: 'horizontal', depth: this.maxHorizontalDepthWidth });
        }
    };
    ScrollingDepthTrigger.prototype.registration = function () {
        this.maxVerticalScrollDepth = 0; // сохраняем максимальную вертикальную глубину прокрутки
        this.maxHorizontalDepthWidth = 0; // сохраняем максимальную горизонтальную глубину прокрутки.
        if (this.props.fields.verticalScrollDepth) {
            window.addEventListener('scroll', debounce(this.verticalScrollHandler, 500));
        }
        if (this.props.fields.horizontalScrollDepth) {
            window.addEventListener('scroll', debounce(this.horizontalScrollHandler, 500));
        }
        /**
         * Запускаем хендлеры при регистрации, т.к. возможна следующая ситуация:
         * Страница сайта может быть меньше чем экран устройства и прокручивать нечего.
         * По этой причине все события должны быть вызваны без прокрутки экрана.
         */
        this.verticalScrollHandler();
        this.horizontalScrollHandler();
    };
    /**
     * Проверить максимальную прокрутку пользователем, соответствует ли она указанной.
     * При проверке мы должны понять, в passedScrollingSteps есть пройденные чекпоинты или нет.
     * Если нет, мы должны понять - максимальная глубина прокрутки пройденная пользователем depth, больше требуемой
     * в пропсах ScrollingDepthTriggerProps или нет. Если да - создаем событие, если нет - игнорируем.
     * В итоге получаем множество событий прокрутки.
     * @private
     */
    ScrollingDepthTrigger.prototype.checkNeededDepth = function (depth) {
        var horizontalScrollDepth = this.props.fields.horizontalScrollDepth;
        var verticalScrollDepth = this.props.fields.verticalScrollDepth;
        var events = [];
        switch (depth.orientation) {
            case 'horizontal':
                if (horizontalScrollDepth) {
                    if (isType(horizontalScrollDepth, 'percents')) {
                        for (var i = 0; i < horizontalScrollDepth.percents.length; i++) {
                            // Если такой чекпоинт еще не проходили
                            if (!this.passedScrollingSteps.horizontal.percents.includes(horizontalScrollDepth.percents[i])) {
                                var depthPercent = (depth.depth / (DocumentSize.width() || 1)) * 100;
                                if (depthPercent >= horizontalScrollDepth.percents[i]) {
                                    events.push(new ScrollDepthEvent({
                                        scrollDirection: depth.orientation,
                                        scrollThreshold: horizontalScrollDepth.percents[i],
                                        scrollUnits: 'percent',
                                    }));
                                    this.passedScrollingSteps.horizontal.percents.push(horizontalScrollDepth.percents[i]);
                                }
                            }
                        }
                    }
                    else if (isType(horizontalScrollDepth, 'pixels')) {
                        for (var i = 0; i < horizontalScrollDepth.pixels.length; i++) {
                            // Если такой чекпоинт еще не проходили
                            if (!this.passedScrollingSteps.horizontal.pixels.includes(horizontalScrollDepth.pixels[i])) {
                                if (depth.depth >= horizontalScrollDepth.pixels[i]) {
                                    events.push(new ScrollDepthEvent({
                                        scrollDirection: depth.orientation,
                                        scrollThreshold: horizontalScrollDepth.pixels[i],
                                        scrollUnits: 'pixel',
                                    }));
                                    this.passedScrollingSteps.horizontal.pixels.push(horizontalScrollDepth.pixels[i]);
                                }
                            }
                        }
                    }
                }
                break;
            case 'vertical':
                if (verticalScrollDepth) {
                    if (isType(verticalScrollDepth, 'percents')) {
                        for (var i = 0; i < verticalScrollDepth.percents.length; i++) {
                            // Если такой чекпоинт еще не проходили
                            if (!this.passedScrollingSteps.vertical.percents.includes(verticalScrollDepth.percents[i])) {
                                var depthPercent = (depth.depth / (DocumentSize.height() || 1)) * 100;
                                if (depthPercent >= verticalScrollDepth.percents[i]) {
                                    events.push(new ScrollDepthEvent({
                                        scrollDirection: depth.orientation,
                                        scrollThreshold: verticalScrollDepth.percents[i],
                                        scrollUnits: 'percent',
                                    }));
                                    this.passedScrollingSteps.vertical.percents.push(verticalScrollDepth.percents[i]);
                                }
                            }
                        }
                    }
                    else if (isType(verticalScrollDepth, 'pixels')) {
                        for (var i = 0; i < verticalScrollDepth.pixels.length; i++) {
                            // Если такой чекпоинт еще не проходили
                            if (!this.passedScrollingSteps.vertical.pixels.includes(verticalScrollDepth.pixels[i])) {
                                if (depth.depth >= verticalScrollDepth.pixels[i]) {
                                    events.push(new ScrollDepthEvent({
                                        scrollDirection: depth.orientation,
                                        scrollThreshold: verticalScrollDepth.pixels[i],
                                        scrollUnits: 'pixel',
                                    }));
                                    this.passedScrollingSteps.vertical.pixels.push(verticalScrollDepth.pixels[i]);
                                }
                            }
                        }
                    }
                }
                break;
        }
        return events;
    };
    ScrollingDepthTrigger.prototype.reset = function () {
        this.maxVerticalScrollDepth = 0;
        this.maxHorizontalDepthWidth = 0;
        this.passedScrollingSteps.horizontal.pixels = [];
        this.passedScrollingSteps.horizontal.percents = [];
        this.passedScrollingSteps.vertical.pixels = [];
        this.passedScrollingSteps.vertical.percents = [];
    };
    ScrollingDepthTrigger.prototype.update = function () {
        /**
         * Запускаем хендлеры при регистрации, т.к. возможна следующая ситуация:
         * Страница сайта может быть меньше чем экран устройства и прокручивать нечего.
         * По этой причине все события должны быть вызваны без прокрутки экрана.
         */
        this.verticalScrollHandler();
        this.horizontalScrollHandler();
    };
    ScrollingDepthTrigger.prototype.run = function (depth) {
        var _this = this;
        var events = this.checkNeededDepth(depth);
        events.forEach(function (event) {
            _this.handler(event);
        });
    };
    ScrollingDepthTrigger.prototype.handler = function (event) {
        var _this = this;
        var mustBeStarted;
        if (this.segment !== undefined) {
            mustBeStarted = this.segment.check(event);
        }
        else {
            mustBeStarted = true;
        }
        if (mustBeStarted) {
            this.events.emit('run', {
                trigger: this,
                event: event,
            });
            return {
                wasRunning: true,
                onRelatedActivitiesCompleted: function () {
                    _this.events.emit('complete', { trigger: _this, event: event });
                },
            };
        }
        return {
            wasRunning: false,
        };
    };
    return ScrollingDepthTrigger;
}(Trigger));

var SubmitFormEvent = /** @class */ (function () {
    function SubmitFormEvent(props) {
        this.event = addAkPrefix('formSubmit');
        this.formClasses = props.formClasses;
        this.formElement = props.formElement;
        this.formId = props.formId;
        this.formTarget = props.formTarget;
        this.formText = props.formText;
        this.formUrl = props.formUrl;
    }
    return SubmitFormEvent;
}());
BuildInDataLayerKeys.formClasses, BuildInDataLayerKeys.formElement, BuildInDataLayerKeys.formId, BuildInDataLayerKeys.formTarget, BuildInDataLayerKeys.formText, BuildInDataLayerKeys.formUrl;

var SubmitFormTrigger = /** @class */ (function (_super) {
    __extends(SubmitFormTrigger, _super);
    function SubmitFormTrigger(props) {
        var _a, _b;
        var _this = _super.call(this, props) || this;
        _this.type = TriggerType.SubmitForm;
        _this.needActivate = true;
        _this.waitTags = (_a = props.fields) === null || _a === void 0 ? void 0 : _a.waitTags;
        if ((_b = props.fields) === null || _b === void 0 ? void 0 : _b.activateSegment) {
            _this.activateSegment = _this.segmentFactory.create(props.fields.activateSegment);
        }
        if (_this.activateSegment) {
            _this.needActivate = _this.activateSegment.check();
        }
        return _this;
    }
    SubmitFormTrigger.isSubmitFormTrigger = function (trigger) {
        return trigger.type === TriggerType.SubmitForm;
    };
    SubmitFormTrigger.prototype.handler = function (event) {
        var _this = this;
        var mustBeStarted;
        if (this.segment !== undefined) {
            mustBeStarted = this.segment.check(event);
        }
        else {
            mustBeStarted = true;
        }
        if (mustBeStarted) {
            this.events.emit('run', {
                trigger: this,
                event: event,
            });
            return {
                wasRunning: true,
                onRelatedActivitiesCompleted: function () {
                    _this.events.emit('complete', { trigger: _this, event: event });
                },
            };
        }
        return {
            wasRunning: false,
        };
    };
    return SubmitFormTrigger;
}(Trigger));

function wait(delay) {
    if (delay === void 0) { delay = 0; }
    return new Promise(function (resolve) {
        setTimeout(resolve, delay);
    });
}

/**
 * Во время инициализации submit события (по клику на соотв. инпут или по нажатию на enter).
 * Найти форму, к которой относится контрол ввода при submit.
 * Контролом может быть либо кнопка либо инпут.
 * @param target
 */
function findFormOnSubmit(target) {
    var existTarget = Boolean(target);
    var isFormTarget = target instanceof HTMLFormElement;
    var isFormControl = target instanceof HTMLInputElement || target instanceof HTMLButtonElement;
    var isSubmitControl = isFormControl ? (target.type === 'submit' || target.type === 'image') : false;
    var isInput = target instanceof HTMLInputElement ? Boolean(target.name || target.value) : false;
    var form = null;
    if (existTarget) {
        if (isFormControl) {
            if (isSubmitControl || isInput) {
                if (target.form) {
                    if (target.form.tagName) {
                        form = target.form;
                    }
                    else {
                        var element = document.getElementById(target.form.id);
                        if (element instanceof HTMLFormElement) {
                            form = element;
                        }
                    }
                }
            }
        }
        else if (isFormTarget) {
            form = target;
        }
    }
    return form;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createProxyApply(target, handler) {
    var proxy = function () {
        var _a;
        // eslint-disable-next-line prefer-rest-params,@typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line prefer-rest-params
        return (_a = handler.apply) === null || _a === void 0 ? void 0 : _a.call(handler, target, this, arguments);
    };
    proxy.prototype = Object.getPrototypeOf(target);
    return proxy;
}

var ChangeHistoryEvent = /** @class */ (function () {
    function ChangeHistoryEvent(props) {
        this.event = addAkPrefix('historyChange');
        this.historyChangeSource = props.historyChangeSource;
        this.newUrl = props.newUrl;
        this.oldUrl = props.oldUrl;
        this.newUrlFragment = props.newUrlFragment;
        this.oldUrlFragment = props.oldUrlFragment;
    }
    return ChangeHistoryEvent;
}());
BuildInDataLayerKeys.historyChangeSource, BuildInDataLayerKeys.newUrl, BuildInDataLayerKeys.oldUrl, BuildInDataLayerKeys.newUrlFragment, BuildInDataLayerKeys.oldUrlFragment;

var JSErrorEvent = /** @class */ (function () {
    function JSErrorEvent(props) {
        this.event = addAkPrefix('jsError');
        this.errorMessage = props.errorMessage;
        this.errorUrl = props.errorUrl;
        this.errorLine = props.errorLine;
    }
    return JSErrorEvent;
}());
BuildInDataLayerKeys.errorMessage, BuildInDataLayerKeys.errorUrl, BuildInDataLayerKeys.errorLine;

var TimerEvent = /** @class */ (function () {
    function TimerEvent(props) {
        this.event = addAkPrefix('timer');
        this.timerCurrentTime = props.timerCurrentTime;
        this.timerElapsedTime = props.timerElapsedTime;
        this.timerEventNumber = props.timerEventNumber;
        this.timerInterval = props.timerInterval;
        this.timerLimit = props.timerLimit;
        this.timerStartTime = props.timerStartTime;
        this.timerEventName = props.timerEventName;
    }
    return TimerEvent;
}());
BuildInDataLayerKeys.timerCurrentTime, BuildInDataLayerKeys.timerElapsedTime, BuildInDataLayerKeys.timerEventNumber, BuildInDataLayerKeys.timerInterval, BuildInDataLayerKeys.timerLimit, BuildInDataLayerKeys.timerStartTime, BuildInDataLayerKeys.timerEventName;

var TimerTrigger = /** @class */ (function (_super) {
    __extends(TimerTrigger, _super);
    function TimerTrigger(props) {
        var _a;
        var _this = _super.call(this, props) || this;
        _this.type = TriggerType.Timer;
        _this.runCounter = 0;
        _this.needActivate = true;
        _this.props = props;
        if ((_a = props.fields) === null || _a === void 0 ? void 0 : _a.activateSegment) {
            _this.activateSegment = _this.segmentFactory.create(props.fields.activateSegment);
        }
        if (_this.activateSegment) {
            _this.needActivate = _this.activateSegment.check();
        }
        _this.handler = _this.handler.bind(_this);
        return _this;
    }
    TimerTrigger.prototype.countdown = function () {
        var _this = this;
        var _a = this.props.fields, limit = _a.limit, eventName = _a.eventName, interval = _a.interval;
        var startTime = Number(new Date());
        this.intervalID = window.setInterval(function () {
            var needRun = limit
                ? _this.runCounter <= limit
                : true;
            if (needRun) {
                var currentTime = Number(new Date());
                _this.runCounter += 1;
                _this.handler(new TimerEvent({
                    timerEventName: eventName,
                    timerLimit: limit,
                    timerInterval: interval,
                    timerCurrentTime: currentTime,
                    timerEventNumber: _this.runCounter,
                    timerStartTime: startTime,
                    timerElapsedTime: currentTime - startTime,
                }));
            }
            else {
                window.clearInterval(_this.intervalID);
            }
        }, interval);
    };
    TimerTrigger.prototype.start = function () {
        if (!this.intervalID)
            this.countdown();
    };
    TimerTrigger.prototype.reset = function () {
        window.clearInterval(this.intervalID);
    };
    TimerTrigger.prototype.handler = function (event) {
        var _this = this;
        var mustBeStarted;
        if (this.segment !== undefined) {
            mustBeStarted = this.segment.check(event);
        }
        else {
            mustBeStarted = true;
        }
        if (mustBeStarted) {
            this.events.emit('run', {
                trigger: this,
                event: event,
            });
            return {
                wasRunning: true,
                onRelatedActivitiesCompleted: function () {
                    _this.events.emit('complete', { trigger: _this, event: event });
                },
            };
        }
        return {
            wasRunning: false,
        };
    };
    return TimerTrigger;
}(Trigger));

/**
 * Менеджер действий.
 * Часть событий делегируется ему (такие, как click), часть событий слушается триггерами.
 * Алгоритм работы достаточно сложный, внимательнее к изменениям.
 * Структура данных для реализации - очередь.
 * Элементы очереди - деревья зависимостей инструкций. Деревья обходятся in-order методом.
 */
var ActManager = /** @class */ (function () {
    function ActManager(props) {
        var _this = this;
        this.groupHandler = function (payload) { return __awaiter(_this, void 0, void 0, function () {
            var runningInstructions;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runningInstructions = [];
                        return [4 /*yield*/, this.activateDecorator([payload.trigger], function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.activateInstructions(payload.trigger, runningInstructions, this.createListenerVisitInstruction(runningInstructions))];
                                        case 1:
                                            _a.sent();
                                            if (isType(payload.complete, 'onRelatedActivitiesCompleted')) {
                                                payload.complete.onRelatedActivitiesCompleted();
                                            }
                                            return [2 /*return*/, {
                                                    instructions: runningInstructions,
                                                    // для групповых триггеров 1 элемент всегда будет событием группого триггера.
                                                    event: Array.isArray(payload.event)
                                                        ? payload.event[0]
                                                        : payload.event,
                                                }];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.timerHandler = function (payload) { return __awaiter(_this, void 0, void 0, function () {
            var runningInstructions;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runningInstructions = [];
                        return [4 /*yield*/, this.activateDecorator([payload.trigger], function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.activateInstructions(payload.trigger, runningInstructions, this.createListenerVisitInstruction(runningInstructions))];
                                        case 1:
                                            _a.sent();
                                            if (isType(payload.complete, 'onRelatedActivitiesCompleted')) {
                                                payload.complete.onRelatedActivitiesCompleted();
                                            }
                                            return [2 /*return*/, {
                                                    instructions: runningInstructions,
                                                    // для групповых триггеров 1 элемент всегда будет событием группого триггера.
                                                    event: Array.isArray(payload.event)
                                                        ? payload.event[0]
                                                        : payload.event,
                                                }];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.clickHandler = function (event) { return __awaiter(_this, void 0, void 0, function () {
            var clickTriggers, runningTriggers, runningInstructions, completeTriggersCallback, clickEvent, elementTarget, elementUrl, textContent;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clickTriggers = this.register.click;
                        runningTriggers = [];
                        runningInstructions = [];
                        completeTriggersCallback = [];
                        clickEvent = null;
                        if (event.target instanceof Element) {
                            elementTarget = event.target.getAttribute('target');
                            elementUrl = event.target.getAttribute('href');
                            textContent = event.target.textContent;
                            if (textContent)
                                textContent = textContent.trim();
                            clickEvent = new ClickEvent({
                                elementId: event.target.id,
                                elementClasses: event.target.className,
                                element: event.target,
                                elementTarget: elementTarget || '',
                                elementUrl: elementUrl || '',
                                elementText: textContent,
                            });
                        }
                        if (clickTriggers) {
                            clickTriggers.forEach(function (trigger) {
                                var complete = trigger.handler(clickEvent);
                                if (complete.wasRunning) {
                                    runningTriggers.push(trigger);
                                    completeTriggersCallback.push(complete.onRelatedActivitiesCompleted);
                                }
                            });
                        }
                        if (!clickEvent) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.activateDecorator(runningTriggers, function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.activateInstructions(runningTriggers, runningInstructions, this.createListenerVisitInstruction(runningInstructions))];
                                        case 1:
                                            _a.sent();
                                            completeTriggersCallback.forEach(function (callback) { return callback(); });
                                            return [2 /*return*/, {
                                                    instructions: runningInstructions,
                                                    event: clickEvent,
                                                }];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        this.clickLinkHandler = function (event) { return __awaiter(_this, void 0, void 0, function () {
            var clickLinkTriggers, runningTriggers, runningInstructions, completeTriggersCallback, clickEvent, elementTarget, elementUrl, textContent;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clickLinkTriggers = this.register.click_link;
                        runningTriggers = [];
                        runningInstructions = [];
                        completeTriggersCallback = [];
                        clickEvent = null;
                        if (event.target instanceof Element) {
                            elementTarget = event.target.getAttribute('target');
                            elementUrl = event.target.getAttribute('href');
                            textContent = event.target.textContent;
                            if (textContent)
                                textContent = textContent.trim();
                            clickEvent = new ClickEvent({
                                elementId: event.target.id,
                                elementClasses: event.target.className,
                                element: event.target,
                                elementTarget: elementTarget || '',
                                elementUrl: elementUrl || '',
                                elementText: textContent,
                            });
                        }
                        if (clickLinkTriggers) {
                            clickLinkTriggers.forEach(function (trigger) {
                                var complete = trigger.handler(clickEvent);
                                if (complete.wasRunning) {
                                    runningTriggers.push(trigger);
                                    completeTriggersCallback.push(complete.onRelatedActivitiesCompleted);
                                }
                            });
                        }
                        if (!clickEvent) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.activateDecorator(runningTriggers, function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.activateInstructions(runningTriggers, runningInstructions, this.createListenerVisitInstruction(runningInstructions))];
                                        case 1:
                                            _a.sent();
                                            completeTriggersCallback.forEach(function (callback) { return callback(); });
                                            return [2 /*return*/, {
                                                    instructions: runningInstructions,
                                                    event: clickEvent,
                                                }];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Обработчик кастомных событий.
         * @param event
         */
        this.customEventHandler = function (event) { return __awaiter(_this, void 0, void 0, function () {
            var customTriggers, runningTriggers, runningInstructions, completeTriggersCallback;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        customTriggers = this.register.custom;
                        runningTriggers = [];
                        runningInstructions = [];
                        completeTriggersCallback = [];
                        if (customTriggers) {
                            customTriggers.forEach(function (trigger) {
                                var complete = trigger.handler(event);
                                if (complete.wasRunning) {
                                    runningTriggers.push(trigger);
                                    completeTriggersCallback.push(complete.onRelatedActivitiesCompleted);
                                }
                            });
                        }
                        return [4 /*yield*/, this.activateDecorator(runningTriggers, function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.activateInstructions(runningTriggers, runningInstructions, this.createListenerVisitInstruction(runningInstructions))];
                                        case 1:
                                            _a.sent();
                                            completeTriggersCallback.forEach(function (callback) { return callback(); });
                                            return [2 /*return*/, {
                                                    instructions: runningInstructions,
                                                    event: event,
                                                }];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        /**
         * Обработчик инициализации. Не связано с DOM и страницей, это инициализация именно контейнера.
         */
        this.initializationHandler = function (event) { return __awaiter(_this, void 0, void 0, function () {
            var initializationTriggers, runningTriggers, runningInstructions, completeTriggersCallback;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        initializationTriggers = this.register.initialization;
                        runningTriggers = [];
                        runningInstructions = [];
                        completeTriggersCallback = [];
                        if (initializationTriggers) {
                            initializationTriggers.forEach(function (trigger) {
                                var complete = trigger.handler(event);
                                if (complete.wasRunning) {
                                    runningTriggers.push(trigger);
                                    completeTriggersCallback.push(complete.onRelatedActivitiesCompleted);
                                }
                            });
                        }
                        return [4 /*yield*/, this.activateDecorator(runningTriggers, function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.activateInstructions(runningTriggers, runningInstructions, this.createListenerVisitInstruction(runningInstructions))];
                                        case 1:
                                            _a.sent();
                                            completeTriggersCallback.forEach(function (callback) { return callback(); });
                                            return [2 /*return*/, {
                                                    instructions: runningInstructions,
                                                    event: event,
                                                }];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.submitFormHandler = function (event) { return __awaiter(_this, void 0, void 0, function () {
            var submitFormTriggers, runningTriggers, runningInstructions, completeTriggersCallback, submitFormEvent, elementTarget, elementUrl, textContent;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        event.preventDefault();
                        submitFormTriggers = (_a = this.register.submit_form) === null || _a === void 0 ? void 0 : _a.filter(function (trigger) {
                            if (SubmitFormTrigger.isSubmitFormTrigger(trigger)) {
                                return trigger.needActivate;
                            }
                            return false;
                        });
                        runningTriggers = [];
                        runningInstructions = [];
                        completeTriggersCallback = [];
                        submitFormEvent = null;
                        if (event.target instanceof Element) {
                            elementTarget = event.target.getAttribute('target');
                            elementUrl = event.target.getAttribute('href');
                            textContent = event.target.textContent;
                            if (textContent)
                                textContent = textContent.trim();
                            submitFormEvent = new SubmitFormEvent({
                                formId: event.target.id,
                                formClasses: event.target.className,
                                formElement: event.target,
                                formTarget: elementTarget || '',
                                formUrl: elementUrl || '',
                                formText: textContent,
                            });
                        }
                        if (submitFormTriggers) {
                            submitFormTriggers.forEach(function (trigger) {
                                var complete = trigger.handler(submitFormEvent);
                                if (complete.wasRunning) {
                                    runningTriggers.push(trigger);
                                    completeTriggersCallback.push(complete.onRelatedActivitiesCompleted);
                                }
                            });
                        }
                        if (!submitFormEvent) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.activateSubmitDecorator(runningTriggers, function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.activateInstructions(runningTriggers, runningInstructions, this.createListenerVisitInstruction(runningInstructions))];
                                        case 1:
                                            _a.sent();
                                            completeTriggersCallback.forEach(function (callback) { return callback(); });
                                            return [2 /*return*/, {
                                                    instructions: runningInstructions,
                                                    event: submitFormEvent,
                                                }];
                                    }
                                });
                            }); })];
                    case 1:
                        _b.sent();
                        if (event.target instanceof HTMLFormElement) {
                            this.removeForm(event.target);
                            event.target.submit();
                        }
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        this.changeHistoryHandler = function (event, historyChangeSource) { return __awaiter(_this, void 0, void 0, function () {
            var changeHistoryTriggers, runningTriggers, runningInstructions, completeTriggersCallback, changeHistoryEvent;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        changeHistoryTriggers = this.register.change_history;
                        runningTriggers = [];
                        runningInstructions = [];
                        completeTriggersCallback = [];
                        changeHistoryEvent = ActManager.extractHistoryEvent(event, historyChangeSource);
                        if (changeHistoryTriggers) {
                            changeHistoryTriggers.forEach(function (trigger) {
                                var complete = trigger.handler(changeHistoryEvent);
                                if (complete.wasRunning) {
                                    runningTriggers.push(trigger);
                                    completeTriggersCallback.push(complete.onRelatedActivitiesCompleted);
                                }
                            });
                        }
                        if (!changeHistoryEvent) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.activateDecorator(runningTriggers, function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.activateInstructions(runningTriggers, runningInstructions, this.createListenerVisitInstruction(runningInstructions))];
                                        case 1:
                                            _a.sent();
                                            completeTriggersCallback.forEach(function (callback) { return callback(); });
                                            return [2 /*return*/, {
                                                    instructions: runningInstructions,
                                                    event: changeHistoryEvent,
                                                }];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        this.jsErrorHandler = function (event) { return __awaiter(_this, void 0, void 0, function () {
            var errorTriggers, runningTriggers, runningInstructions, completeTriggersCallback, errorEvent;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        errorTriggers = this.register.js_error;
                        runningTriggers = [];
                        runningInstructions = [];
                        completeTriggersCallback = [];
                        errorEvent = new JSErrorEvent({
                            errorMessage: event.message,
                            errorLine: event.lineno,
                            errorUrl: event.filename,
                        });
                        if (errorTriggers) {
                            errorTriggers.forEach(function (trigger) {
                                var complete = trigger.handler(errorEvent);
                                if (complete.wasRunning) {
                                    runningTriggers.push(trigger);
                                    completeTriggersCallback.push(complete.onRelatedActivitiesCompleted);
                                }
                            });
                        }
                        return [4 /*yield*/, this.activateDecorator(runningTriggers, function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.activateInstructions(runningTriggers, runningInstructions, this.createListenerVisitInstruction(runningInstructions))];
                                        case 1:
                                            _a.sent();
                                            completeTriggersCallback.forEach(function (callback) { return callback(); });
                                            return [2 /*return*/, {
                                                    instructions: runningInstructions,
                                                    event: errorEvent,
                                                }];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.register = {};
        this.accumulatorInstruction = [];
        this.accumulatorForms = [];
        this.instructionWalker = new InstructionWalker({
            deps: {
                instructionStorage: props.instructionStorage,
            },
        });
        this.events = new e();
        this.privateEvents = new e();
        this.instructions = props.instructionStorage.content();
        this.triggerStorage = props.triggerStorage;
        this.registerTriggers(props.triggerStorage.categorize());
    }
    /**
     * @see Listener
     * @private
     * @param runningInstructionsRegister - Храним сколько раз и какая инструкция была вызвана.
     */
    ActManager.prototype.createListenerVisitInstruction = function (runningInstructionsRegister) {
        var _this = this;
        return function (instruction, isRoot) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = instruction.firingOption;
                        switch (_a) {
                            case FiringOption.oncePerEvent: return [3 /*break*/, 1];
                            case FiringOption.noRestrictions: return [3 /*break*/, 4];
                            case FiringOption.oncePerPage: return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 9];
                    case 1:
                        if (!!runningInstructionsRegister.includes(instruction.strId)) return [3 /*break*/, 3];
                        return [4 /*yield*/, instruction.run(!isRoot)];
                    case 2:
                        if (_b.sent()) {
                            runningInstructionsRegister.push(instruction.strId);
                        }
                        _b.label = 3;
                    case 3: return [3 /*break*/, 10];
                    case 4: return [4 /*yield*/, instruction.run(!isRoot)];
                    case 5:
                        if (_b.sent()) {
                            runningInstructionsRegister.push(instruction.strId);
                        }
                        return [3 /*break*/, 10];
                    case 6:
                        if (!!this.accumulatorInstruction.includes(instruction.strId)) return [3 /*break*/, 8];
                        return [4 /*yield*/, instruction.run(!isRoot)];
                    case 7:
                        if (_b.sent()) {
                            this.accumulatorInstruction.push(instruction.strId);
                        }
                        _b.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9: return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        }); };
    };
    /**
     * Собрать инструкции, которые используют указанный триггер.
     * @private
     */
    ActManager.collectUsingInstructions = function (triggerId, instructions) {
        var result = [];
        instructions.forEach(function (instruction) {
            var _a;
            if ((_a = instruction.triggers) === null || _a === void 0 ? void 0 : _a.includes(triggerId)) {
                result.push(instruction);
            }
        });
        return result;
    };
    /**
     * Собрать инструкции, которые используют указанные триггеры.
     * Инструкции будут нисходяще отсортированы по приоритету. [100, 90, 4, 3, ...];
     * @param triggers
     * @param instructions
     * @private
     */
    ActManager.collectInstructions = function (triggers, instructions) {
        var result = [];
        if (Array.isArray(triggers)) {
            triggers.forEach(function (trigger) {
                result.push.apply(result, __spreadArray([], __read(ActManager.collectUsingInstructions(trigger.strId, instructions)), false));
            });
        }
        else {
            result.push.apply(result, __spreadArray([], __read(ActManager.collectUsingInstructions(triggers.strId, instructions)), false));
        }
        return Instruction.sortInstructionsByPriority(result);
    };
    ActManager.prototype.registerTriggers = function (triggers) {
        var _this = this;
        var triggerTypes = objectKeys(triggers);
        triggerTypes.forEach(function (type) {
            var _a, _b, _c;
            _this.register[type] = triggers[type];
            switch (type) {
                case TriggerType.Click:
                    document.addEventListener('click', _this.clickHandler);
                    break;
                case TriggerType.ClickLink:
                    document.addEventListener('click', function (event) {
                        if (event.target instanceof HTMLAnchorElement) {
                            _this.clickLinkHandler(event);
                        }
                    });
                    break;
                case TriggerType.GroupTrigger:
                    (_a = _this.register[type]) === null || _a === void 0 ? void 0 : _a.forEach(function (trigger) {
                        trigger.registerListener('run', function (payload) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.groupHandler(payload)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    });
                    break;
                case TriggerType.Custom:
                    _this.privateEvents.registerListener('customEvent', _this.customEventHandler);
                    break;
                case TriggerType.Initialization:
                    _this.privateEvents.registerListener('initialization', function () {
                        _this.initializationHandler(new InitializationEvent());
                    });
                    break;
                case TriggerType.ViewPage:
                    /**
                     * Отличается от TriggerType.Initialization только порядком, это событие срабатывает позже.
                     */
                    _this.privateEvents.registerListener('initialization', function () {
                        _this.viewPageHandler(new ViewPageEvent());
                    });
                    break;
                case TriggerType.DomReady:
                    if (document.readyState === 'loading') {
                        // ещё загружается, ждём события
                        document.addEventListener('DOMContentLoaded', function () {
                            _this.domReadyHandler(new DomReadyEvent());
                        });
                    }
                    else {
                        // DOM готов!
                        _this.domReadyHandler(new DomReadyEvent());
                    }
                    break;
                case TriggerType.WindowLoaded:
                    if (document.readyState !== 'complete') {
                        document.addEventListener('load', function () {
                            _this.windowLoadedHandler(new WindowLoadedEvent());
                        });
                    }
                    else {
                        _this.windowLoadedHandler(new WindowLoadedEvent());
                    }
                    break;
                case TriggerType.DomElementVisible:
                    (_b = _this.register[type]) === null || _b === void 0 ? void 0 : _b.forEach(function (trigger) {
                        trigger.registerListener('run', function (payload) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.domElementVisibilityHandler(payload)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    });
                    break;
                case TriggerType.ScrollingDepth:
                    _this.registerScrollDepthTriggers();
                    break;
                case TriggerType.SubmitForm:
                    document.addEventListener('click', function (event) {
                        var target = event.target;
                        var $form = findFormOnSubmit(target);
                        var savedForm = false;
                        if ($form) {
                            // проверяем, находили ли мы такую форму или нет.
                            for (var i = 0; i < _this.accumulatorForms.length; i++) {
                                if (_this.accumulatorForms[i] === $form) {
                                    savedForm = true;
                                    break;
                                }
                            }
                            // если такую форму мы не находили сохраняем ее и вешаем слушатель отправки.
                            if (!savedForm) {
                                _this.accumulatorForms.push($form);
                                $form.addEventListener('submit', _this.submitFormHandler);
                            }
                        }
                    });
                    break;
                case TriggerType.ChangeHistory:
                    /**
                     * Обрабатываем нажания кнопок вперед/назад и присваивания хешей:
                     * window.location = '#example';
                     * window.location.href = '#example';
                     */
                    window.addEventListener('popstate', function (event) {
                        _this.changeHistoryHandler(event, 'popstate');
                    });
                    window.history.pushState = createProxyApply(window.history.pushState, {
                        apply: function (target, thisArg, args) {
                            _this.changeHistoryHandler({
                                newHistoryState: { data: args[0], unused: args[1], url: args[2] },
                            }, 'pushState');
                            target.apply(thisArg, args);
                        },
                    });
                    window.history.replaceState = createProxyApply(window.history.replaceState, {
                        apply: function (target, thisArg, args) {
                            _this.changeHistoryHandler({
                                newHistoryState: { data: args[0], unused: args[1], url: args[2] },
                            }, 'replaceState');
                            target.apply(thisArg, args);
                        },
                    });
                    break;
                case TriggerType.JSError:
                    window.addEventListener('error', _this.jsErrorHandler);
                    break;
                case TriggerType.Timer:
                    (_c = _this.register[type]) === null || _c === void 0 ? void 0 : _c.forEach(function (trigger) {
                        trigger.registerListener('run', function (payload) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.timerHandler(payload)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        if (trigger instanceof TimerTrigger) {
                            trigger.start();
                        }
                    });
                    break;
            }
        });
    };
    ActManager.prototype.registerScrollDepthTriggers = function () {
        var _this = this;
        var _a;
        var waitViewPageTriggers = [];
        var waitDomReadyTriggers = [];
        var waitWindowLoadedTriggers = [];
        (_a = this.register.scrolling_depth) === null || _a === void 0 ? void 0 : _a.forEach(function (trigger) {
            trigger.registerListener('run', function (payload) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.scrollDepthHandler(payload)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            if (ScrollingDepthTrigger.isScrollingDepthTrigger(trigger)) {
                switch (trigger.props.fields.waitEvent) {
                    case TriggerType.ViewPage:
                        waitViewPageTriggers.push(trigger);
                        break;
                    case TriggerType.DomReady:
                        waitDomReadyTriggers.push(trigger);
                        break;
                    case TriggerType.WindowLoaded:
                        waitWindowLoadedTriggers.push(trigger);
                        break;
                }
            }
        });
        this.privateEvents.registerListener('initialization', function () {
            waitViewPageTriggers.forEach(function (trigger) { return trigger.registration(); });
        });
        if (document.readyState === 'loading') {
            // ещё загружается, ждём события
            document.addEventListener('DOMContentLoaded', function () {
                waitDomReadyTriggers.forEach(function (trigger) { return trigger.registration(); });
            });
        }
        else {
            waitDomReadyTriggers.forEach(function (trigger) { return trigger.registration(); });
        }
        if (document.readyState !== 'complete') {
            document.addEventListener('load', function () {
                waitWindowLoadedTriggers.forEach(function (trigger) { return trigger.registration(); });
            });
        }
        else {
            waitWindowLoadedTriggers.forEach(function (trigger) { return trigger.registration(); });
        }
    };
    /**
     * Обработчик просмотра. Не связано с DOM и страницей. По сути, как и initializationHandler ждем инициализации.
     * Разница только в порядке. initializationHandler - всегда срабатывает раньше.
     * @param event
     * @private
     */
    ActManager.prototype.viewPageHandler = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var viewPageTriggers, runningTriggers, runningInstructions, completeTriggersCallback;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        viewPageTriggers = this.register.view_page;
                        runningTriggers = [];
                        runningInstructions = [];
                        completeTriggersCallback = [];
                        if (viewPageTriggers) {
                            viewPageTriggers.forEach(function (trigger) {
                                var complete = trigger.handler(event);
                                if (complete.wasRunning) {
                                    runningTriggers.push(trigger);
                                    completeTriggersCallback.push(complete.onRelatedActivitiesCompleted);
                                }
                            });
                        }
                        return [4 /*yield*/, this.activateDecorator(runningTriggers, function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.activateInstructions(runningTriggers, runningInstructions, this.createListenerVisitInstruction(runningInstructions))];
                                        case 1:
                                            _a.sent();
                                            completeTriggersCallback.forEach(function (callback) { return callback(); });
                                            return [2 /*return*/, {
                                                    instructions: runningInstructions,
                                                    event: event,
                                                }];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Обработчик загрузки DOM
     * @param event
     * @private
     */
    ActManager.prototype.domReadyHandler = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var domReadyTriggers, runningTriggers, runningInstructions, completeTriggersCallback;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        domReadyTriggers = this.register.dom_ready;
                        runningTriggers = [];
                        runningInstructions = [];
                        completeTriggersCallback = [];
                        if (domReadyTriggers) {
                            domReadyTriggers.forEach(function (trigger) {
                                var complete = trigger.handler(event);
                                if (complete.wasRunning) {
                                    runningTriggers.push(trigger);
                                    completeTriggersCallback.push(complete.onRelatedActivitiesCompleted);
                                }
                            });
                        }
                        return [4 /*yield*/, this.activateDecorator(runningTriggers, function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.activateInstructions(runningTriggers, runningInstructions, this.createListenerVisitInstruction(runningInstructions))];
                                        case 1:
                                            _a.sent();
                                            completeTriggersCallback.forEach(function (callback) { return callback(); });
                                            return [2 /*return*/, {
                                                    instructions: runningInstructions,
                                                    event: event,
                                                }];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Обработчик загрузки DOM
     * @param event
     * @private
     */
    ActManager.prototype.windowLoadedHandler = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var windowLoadedTriggers, runningTriggers, runningInstructions, completeTriggersCallback;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        windowLoadedTriggers = this.register.window_loaded;
                        runningTriggers = [];
                        runningInstructions = [];
                        completeTriggersCallback = [];
                        if (windowLoadedTriggers) {
                            windowLoadedTriggers.forEach(function (trigger) {
                                var complete = trigger.handler(event);
                                if (complete.wasRunning) {
                                    runningTriggers.push(trigger);
                                    completeTriggersCallback.push(complete.onRelatedActivitiesCompleted);
                                }
                            });
                        }
                        return [4 /*yield*/, this.activateDecorator(runningTriggers, function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.activateInstructions(runningTriggers, runningInstructions, this.createListenerVisitInstruction(runningInstructions))];
                                        case 1:
                                            _a.sent();
                                            completeTriggersCallback.forEach(function (callback) { return callback(); });
                                            return [2 /*return*/, {
                                                    instructions: runningInstructions,
                                                    event: event,
                                                }];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ActManager.prototype.domElementVisibilityHandler = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var runningInstructions;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runningInstructions = [];
                        return [4 /*yield*/, this.activateDecorator([payload.trigger], function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.activateInstructions(payload.trigger, runningInstructions, this.createListenerVisitInstruction(runningInstructions))];
                                        case 1:
                                            _a.sent();
                                            if (isType(payload.complete, 'onRelatedActivitiesCompleted')) {
                                                payload.complete.onRelatedActivitiesCompleted();
                                            }
                                            return [2 /*return*/, {
                                                    instructions: runningInstructions,
                                                    event: Array.isArray(payload.event)
                                                        ? payload.event[0]
                                                        : payload.event,
                                                }];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ActManager.prototype.scrollDepthHandler = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var runningInstructions;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runningInstructions = [];
                        return [4 /*yield*/, this.activateDecorator([payload.trigger], function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.activateInstructions(payload.trigger, runningInstructions, this.createListenerVisitInstruction(runningInstructions))];
                                        case 1:
                                            _a.sent();
                                            if (isType(payload.complete, 'onRelatedActivitiesCompleted')) {
                                                payload.complete.onRelatedActivitiesCompleted();
                                            }
                                            return [2 /*return*/, {
                                                    instructions: runningInstructions,
                                                    event: Array.isArray(payload.event)
                                                        ? payload.event[0]
                                                        : payload.event,
                                                }];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ActManager.extractHistoryEvent = function (event, historyChangeSource) {
        var oldUrl = window.location.origin + window.location.pathname;
        var newUrl = '';
        var newUrlFragment = '';
        var oldUrlFragment = window.location.hash;
        if (src(event, 'newHistoryState') && event.newHistoryState.url) {
            if (event.newHistoryState.url instanceof URL) {
                newUrl = event.newHistoryState.url.origin + event.newHistoryState.url.pathname;
                newUrlFragment = event.newHistoryState.url.hash;
            }
            else {
                var parsedUrl = new urlParse(event.newHistoryState.url);
                if (parsedUrl.origin === 'null') {
                    newUrl = window.location.origin + parsedUrl.pathname;
                }
                else {
                    newUrl = parsedUrl.origin + parsedUrl.pathname;
                }
                newUrlFragment = parsedUrl.hash;
            }
        }
        else if (event instanceof PopStateEvent && event.target instanceof Window) {
            newUrl = event.target.location.origin + event.target.location.pathname;
            newUrlFragment = event.target.location.href;
        }
        if (newUrlFragment[0] === '#')
            newUrlFragment = newUrlFragment.slice(1);
        if (oldUrlFragment[0] === '#')
            oldUrlFragment = oldUrlFragment.slice(1);
        return new ChangeHistoryEvent({
            historyChangeSource: historyChangeSource,
            newUrl: newUrl,
            oldUrl: oldUrl,
            newUrlFragment: newUrlFragment,
            oldUrlFragment: oldUrlFragment,
        });
    };
    ActManager.prototype.removeForm = function (form) {
        for (var i = 0; i < this.accumulatorForms.length; i) {
            if (form === this.accumulatorForms[i]) {
                this.accumulatorForms.splice(i, 1);
                form.removeEventListener('submit', this.submitFormHandler);
                break;
            }
        }
    };
    ActManager.prototype.activateSubmitDecorator = function (runningTriggers, act) {
        return __awaiter(this, void 0, void 0, function () {
            function completeHandler(payload) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        triggers.push(payload.trigger.strId);
                        return [2 /*return*/];
                    });
                });
            }
            var triggers, maxWaitTime;
            var _this = this;
            return __generator(this, function (_a) {
                triggers = [];
                maxWaitTime = Math.max.apply(Math, __spreadArray([], __read(runningTriggers.map(function (t) {
                    if (SubmitFormTrigger.isSubmitFormTrigger(t)) {
                        return t.waitTags || 0;
                    }
                    return 0;
                })), false));
                runningTriggers.forEach(function (trigger) {
                    trigger.registerListener('complete', completeHandler);
                });
                return [2 /*return*/, Promise.race([
                        new Promise(function (resolve) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a, instructions, event;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, act()];
                                        case 1:
                                            _a = _b.sent(), instructions = _a.instructions, event = _a.event;
                                            runningTriggers.forEach(function (trigger) {
                                                trigger.deregisterListener('complete', completeHandler);
                                            });
                                            if (event) {
                                                this.events.emit('act', {
                                                    runningTriggers: triggers,
                                                    activatedInstructions: instructions,
                                                    event: event,
                                                });
                                            }
                                            resolve();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })();
                        }),
                        wait(maxWaitTime),
                    ])];
            });
        });
    };
    /**
     * Декорируем активацию инструкций с целью анализа запущенных триггеров, инструкций, событий и т.п.
     * @param runningTriggers
     * @param act
     * @private
     */
    ActManager.prototype.activateDecorator = function (runningTriggers, act) {
        return __awaiter(this, void 0, void 0, function () {
            function completeHandler(payload) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        triggers.push(payload.trigger.strId);
                        return [2 /*return*/];
                    });
                });
            }
            var triggers, _a, instructions, event;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        triggers = [];
                        runningTriggers.forEach(function (trigger) {
                            trigger.registerListener('complete', completeHandler);
                        });
                        return [4 /*yield*/, act()];
                    case 1:
                        _a = _b.sent(), instructions = _a.instructions, event = _a.event;
                        runningTriggers.forEach(function (trigger) {
                            trigger.deregisterListener('complete', completeHandler);
                        });
                        if (event) {
                            this.events.emit('act', {
                                runningTriggers: triggers,
                                activatedInstructions: instructions,
                                event: event,
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Активировать инструкции. Если инструкция имеет связанные инструкции (до, после) они так же активируются.
     * @param triggers
     * @param runningInstruction
     * @param listener
     * @private
     */
    ActManager.prototype.activateInstructions = function (triggers, runningInstruction, listener) {
        return __awaiter(this, void 0, void 0, function () {
            var instructions, i, instruction, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        instructions = ActManager.collectInstructions(triggers, this.instructions);
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < instructions.length)) return [3 /*break*/, 11];
                        instruction = instructions[i];
                        _a = instruction.firingOption;
                        switch (_a) {
                            case FiringOption.oncePerEvent: return [3 /*break*/, 2];
                            case FiringOption.oncePerPage: return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 8];
                    case 2:
                        if (!!runningInstruction.includes(instruction.strId)) return [3 /*break*/, 4];
                        // В инструкциях имеется приоритет, мы не можем просто так распаралелить выполнение,
                        // поэтому, требуется в итерации ставить await
                        // eslint-disable-next-line no-await-in-loop
                        return [4 /*yield*/, this.instructionWalker.walk(instruction, listener)];
                    case 3:
                        // В инструкциях имеется приоритет, мы не можем просто так распаралелить выполнение,
                        // поэтому, требуется в итерации ставить await
                        // eslint-disable-next-line no-await-in-loop
                        _b.sent();
                        _b.label = 4;
                    case 4: return [3 /*break*/, 10];
                    case 5:
                        if (!!this.accumulatorInstruction.includes(instruction.strId)) return [3 /*break*/, 7];
                        // В инструкциях имеется приоритет, мы не можем просто так распаралелить выполнение,
                        // поэтому, требуется в итерации ставить await
                        // eslint-disable-next-line no-await-in-loop
                        return [4 /*yield*/, this.instructionWalker.walk(instruction, listener)];
                    case 6:
                        // В инструкциях имеется приоритет, мы не можем просто так распаралелить выполнение,
                        // поэтому, требуется в итерации ставить await
                        // eslint-disable-next-line no-await-in-loop
                        _b.sent();
                        _b.label = 7;
                    case 7: return [3 /*break*/, 10];
                    case 8: 
                    // В инструкциях имеется приоритет, мы не можем просто так распаралелить выполнение,
                    // поэтому, требуется в итерации ставить await
                    // eslint-disable-next-line no-await-in-loop
                    return [4 /*yield*/, this.instructionWalker.walk(instruction, listener)];
                    case 9:
                        // В инструкциях имеется приоритет, мы не можем просто так распаралелить выполнение,
                        // поэтому, требуется в итерации ставить await
                        // eslint-disable-next-line no-await-in-loop
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 10:
                        i++;
                        return [3 /*break*/, 1];
                    case 11: return [2 /*return*/, null];
                }
            });
        });
    };
    ActManager.prototype.emitEvent = function (event) {
        this.privateEvents.emit('customEvent', event);
    };
    ActManager.prototype.initialization = function () {
        this.privateEvents.emit('initialization');
    };
    ActManager.prototype.clean = function () {
        var _a, _b, _c, _d;
        this.accumulatorInstruction = [];
        this.accumulatorForms = [];
        (_a = this.register[TriggerType.GroupTrigger]) === null || _a === void 0 ? void 0 : _a.forEach(function (trigger) {
            if (trigger.type === TriggerType.GroupTrigger && trigger instanceof GroupsTrigger) {
                trigger.reset();
            }
        });
        (_b = this.register[TriggerType.DomElementVisible]) === null || _b === void 0 ? void 0 : _b.forEach(function (trigger) {
            if (trigger.type === TriggerType.DomElementVisible && trigger instanceof DomElementVisibleTrigger) {
                trigger.reset();
            }
        });
        (_c = this.register[TriggerType.ScrollingDepth]) === null || _c === void 0 ? void 0 : _c.forEach(function (trigger) {
            if (trigger.type === TriggerType.ScrollingDepth && trigger instanceof ScrollingDepthTrigger) {
                trigger.reset();
            }
        });
        (_d = this.register[TriggerType.Timer]) === null || _d === void 0 ? void 0 : _d.forEach(function (trigger) {
            if (trigger.type === TriggerType.Timer && trigger instanceof TimerTrigger) {
                trigger.reset();
            }
        });
    };
    ActManager.prototype.update = function () {
        var _a, _b;
        (_a = this.register[TriggerType.ScrollingDepth]) === null || _a === void 0 ? void 0 : _a.forEach(function (trigger) {
            if (trigger.type === TriggerType.ScrollingDepth && trigger instanceof ScrollingDepthTrigger) {
                trigger.update();
            }
        });
        (_b = this.register[TriggerType.Timer]) === null || _b === void 0 ? void 0 : _b.forEach(function (trigger) {
            if (trigger.type === TriggerType.Timer && trigger instanceof TimerTrigger) {
                trigger.start();
            }
        });
    };
    return ActManager;
}());

var InstructionFactory = /** @class */ (function () {
    function InstructionFactory(deps) {
        this.deps = deps;
    }
    InstructionFactory.prototype.create = function (props) {
        return new Instruction(props, this.deps);
    };
    return InstructionFactory;
}());

var InstructionStorage = /** @class */ (function () {
    function InstructionStorage(props) {
        var _this = this;
        this.instructions = {};
        this.instructionFactory = new InstructionFactory({
            tagStorage: props.deps.tagStorage,
        });
        props.instructions.forEach(function (instruction) {
            _this.instructions[instruction.strId] = _this.instructionFactory.create(instruction);
        });
    }
    InstructionStorage.prototype.instruction = function (instructionId) {
        return this.instructions[instructionId];
    };
    InstructionStorage.prototype.content = function () {
        var _this = this;
        return objectKeys(this.instructions)
            .map(function (instruction) { return _this.instructions[instruction]; });
    };
    return InstructionStorage;
}());

var ClickTrigger = /** @class */ (function (_super) {
    __extends(ClickTrigger, _super);
    function ClickTrigger(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TriggerType.Click;
        _this.handler = _this.handler.bind(_this);
        return _this;
    }
    ClickTrigger.prototype.handler = function (event) {
        var _this = this;
        var mustBeStarted;
        if (this.segment !== undefined) {
            mustBeStarted = this.segment.check(event);
        }
        else {
            mustBeStarted = true;
        }
        if (mustBeStarted) {
            this.events.emit('run', {
                trigger: this,
                event: event,
            });
            return {
                wasRunning: true,
                onRelatedActivitiesCompleted: function () {
                    _this.events.emit('complete', { trigger: _this, event: event });
                },
            };
        }
        return {
            wasRunning: false,
        };
    };
    return ClickTrigger;
}(Trigger));

var ClickTriggerFactory = /** @class */ (function () {
    function ClickTriggerFactory(deps) {
        this.type = TriggerType.Click;
        this.deps = deps;
    }
    ClickTriggerFactory.prototype.create = function (trigger) {
        return new ClickTrigger({
            strId: trigger.strId,
            segment: trigger.segment,
            deps: {
                variableStorage: this.deps.variableStorage,
                dataLayer: this.deps.dataLayer,
            },
        });
    };
    return ClickTriggerFactory;
}());

var GroupTriggerFactory = /** @class */ (function () {
    function GroupTriggerFactory(deps) {
        this.type = TriggerType.GroupTrigger;
        this.deps = deps;
    }
    GroupTriggerFactory.prototype.create = function (trigger) {
        var _this = this;
        var _a;
        var children = [];
        (_a = trigger.children) === null || _a === void 0 ? void 0 : _a.forEach(function (childId) {
            var childTrigger = _this.deps.triggersStorage.trigger(childId);
            if (childTrigger)
                children.push(childTrigger);
        });
        return new GroupsTrigger({
            strId: trigger.strId,
            segment: trigger.segment,
            deps: {
                variableStorage: this.deps.variableStorage,
                dataLayer: this.deps.dataLayer,
            },
            children: children,
        });
    };
    return GroupTriggerFactory;
}());

var CustomTrigger = /** @class */ (function (_super) {
    __extends(CustomTrigger, _super);
    function CustomTrigger(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TriggerType.Custom;
        _this.handler = _this.handler.bind(_this);
        return _this;
    }
    CustomTrigger.prototype.handler = function (event) {
        var _this = this;
        var mustBeStarted;
        if (this.segment !== undefined) {
            mustBeStarted = this.segment.check(event);
        }
        else {
            mustBeStarted = true;
        }
        if (mustBeStarted) {
            this.events.emit('run', {
                trigger: this,
                event: event,
            });
            return {
                wasRunning: true,
                onRelatedActivitiesCompleted: function () {
                    _this.events.emit('complete', { trigger: _this, event: event });
                },
            };
        }
        return {
            wasRunning: false,
        };
    };
    return CustomTrigger;
}(Trigger));

var CustomTriggerFactory = /** @class */ (function () {
    function CustomTriggerFactory(deps) {
        this.type = TriggerType.Custom;
        this.deps = deps;
    }
    CustomTriggerFactory.prototype.create = function (trigger) {
        return new CustomTrigger({
            strId: trigger.strId,
            segment: trigger.segment,
            deps: {
                variableStorage: this.deps.variableStorage,
                dataLayer: this.deps.dataLayer,
            },
        });
    };
    return CustomTriggerFactory;
}());

var InitializationTrigger = /** @class */ (function (_super) {
    __extends(InitializationTrigger, _super);
    function InitializationTrigger(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TriggerType.Initialization;
        _this.handler = _this.handler.bind(_this);
        return _this;
    }
    InitializationTrigger.prototype.handler = function (event) {
        var _this = this;
        var mustBeStarted;
        if (this.segment !== undefined) {
            mustBeStarted = this.segment.check(event);
        }
        else {
            mustBeStarted = true;
        }
        if (mustBeStarted) {
            this.events.emit('run', {
                trigger: this,
                event: event,
            });
            return {
                wasRunning: true,
                onRelatedActivitiesCompleted: function () {
                    _this.events.emit('complete', { trigger: _this, event: event });
                },
            };
        }
        return {
            wasRunning: false,
        };
    };
    return InitializationTrigger;
}(Trigger));

var InitializationTriggerFactory = /** @class */ (function () {
    function InitializationTriggerFactory(deps) {
        this.type = TriggerType.Initialization;
        this.deps = deps;
    }
    InitializationTriggerFactory.prototype.create = function (trigger) {
        return new InitializationTrigger({
            strId: trigger.strId,
            segment: trigger.segment,
            deps: {
                variableStorage: this.deps.variableStorage,
                dataLayer: this.deps.dataLayer,
            },
        });
    };
    return InitializationTriggerFactory;
}());

var ViewPageTrigger = /** @class */ (function (_super) {
    __extends(ViewPageTrigger, _super);
    function ViewPageTrigger(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TriggerType.ViewPage;
        _this.handler = _this.handler.bind(_this);
        return _this;
    }
    ViewPageTrigger.prototype.handler = function (event) {
        var _this = this;
        var mustBeStarted;
        if (this.segment !== undefined) {
            mustBeStarted = this.segment.check(event);
        }
        else {
            mustBeStarted = true;
        }
        if (mustBeStarted) {
            this.events.emit('run', {
                trigger: this,
                event: event,
            });
            return {
                wasRunning: true,
                onRelatedActivitiesCompleted: function () {
                    _this.events.emit('complete', { trigger: _this, event: event });
                },
            };
        }
        return {
            wasRunning: false,
        };
    };
    return ViewPageTrigger;
}(Trigger));

var ViewPageTriggerFactory = /** @class */ (function () {
    function ViewPageTriggerFactory(deps) {
        this.type = TriggerType.ViewPage;
        this.deps = deps;
    }
    ViewPageTriggerFactory.prototype.create = function (trigger) {
        return new ViewPageTrigger({
            strId: trigger.strId,
            segment: trigger.segment,
            deps: {
                variableStorage: this.deps.variableStorage,
                dataLayer: this.deps.dataLayer,
            },
        });
    };
    return ViewPageTriggerFactory;
}());

var DomReadyTrigger = /** @class */ (function (_super) {
    __extends(DomReadyTrigger, _super);
    function DomReadyTrigger(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TriggerType.DomReady;
        _this.handler = _this.handler.bind(_this);
        return _this;
    }
    DomReadyTrigger.prototype.handler = function (event) {
        var _this = this;
        var mustBeStarted;
        if (this.segment !== undefined) {
            mustBeStarted = this.segment.check(event);
        }
        else {
            mustBeStarted = true;
        }
        if (mustBeStarted) {
            this.events.emit('run', {
                trigger: this,
                event: event,
            });
            return {
                wasRunning: true,
                onRelatedActivitiesCompleted: function () {
                    _this.events.emit('complete', { trigger: _this, event: event });
                },
            };
        }
        return {
            wasRunning: false,
        };
    };
    return DomReadyTrigger;
}(Trigger));

var DomReadyTriggerFactory = /** @class */ (function () {
    function DomReadyTriggerFactory(deps) {
        this.type = TriggerType.DomReady;
        this.deps = deps;
    }
    DomReadyTriggerFactory.prototype.create = function (trigger) {
        return new DomReadyTrigger({
            strId: trigger.strId,
            segment: trigger.segment,
            deps: {
                variableStorage: this.deps.variableStorage,
                dataLayer: this.deps.dataLayer,
            },
        });
    };
    return DomReadyTriggerFactory;
}());

var WindowLoadedTrigger = /** @class */ (function (_super) {
    __extends(WindowLoadedTrigger, _super);
    function WindowLoadedTrigger(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TriggerType.WindowLoaded;
        _this.handler = _this.handler.bind(_this);
        return _this;
    }
    WindowLoadedTrigger.prototype.handler = function (event) {
        var _this = this;
        var mustBeStarted;
        if (this.segment !== undefined) {
            mustBeStarted = this.segment.check(event);
        }
        else {
            mustBeStarted = true;
        }
        if (mustBeStarted) {
            this.events.emit('run', {
                trigger: this,
                event: event,
            });
            return {
                wasRunning: true,
                onRelatedActivitiesCompleted: function () {
                    _this.events.emit('complete', { trigger: _this, event: event });
                },
            };
        }
        return {
            wasRunning: false,
        };
    };
    return WindowLoadedTrigger;
}(Trigger));

var WindowLoadedTriggerFactory = /** @class */ (function () {
    function WindowLoadedTriggerFactory(deps) {
        this.type = TriggerType.WindowLoaded;
        this.deps = deps;
    }
    WindowLoadedTriggerFactory.prototype.create = function (trigger) {
        return new WindowLoadedTrigger({
            strId: trigger.strId,
            segment: trigger.segment,
            deps: {
                variableStorage: this.deps.variableStorage,
                dataLayer: this.deps.dataLayer,
            },
        });
    };
    return WindowLoadedTriggerFactory;
}());

var ClickLinkTrigger = /** @class */ (function (_super) {
    __extends(ClickLinkTrigger, _super);
    function ClickLinkTrigger(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TriggerType.ClickLink;
        _this.handler = _this.handler.bind(_this);
        return _this;
    }
    ClickLinkTrigger.prototype.handler = function (event) {
        var _this = this;
        var mustBeStarted;
        if (this.segment !== undefined) {
            mustBeStarted = this.segment.check(event);
        }
        else {
            mustBeStarted = true;
        }
        if (mustBeStarted) {
            this.events.emit('run', {
                trigger: this,
                event: event,
            });
            return {
                wasRunning: true,
                onRelatedActivitiesCompleted: function () {
                    _this.events.emit('complete', { trigger: _this, event: event });
                },
            };
        }
        return {
            wasRunning: false,
        };
    };
    return ClickLinkTrigger;
}(Trigger));

var ClickLinkTriggerFactory = /** @class */ (function () {
    function ClickLinkTriggerFactory(deps) {
        this.type = TriggerType.ClickLink;
        this.deps = deps;
    }
    ClickLinkTriggerFactory.prototype.create = function (trigger) {
        return new ClickLinkTrigger({
            strId: trigger.strId,
            segment: trigger.segment,
            deps: {
                variableStorage: this.deps.variableStorage,
                dataLayer: this.deps.dataLayer,
            },
        });
    };
    return ClickLinkTriggerFactory;
}());

var DomElementVisibleTriggerFactory = /** @class */ (function () {
    function DomElementVisibleTriggerFactory(deps) {
        this.type = TriggerType.DomElementVisible;
        this.deps = deps;
    }
    DomElementVisibleTriggerFactory.prototype.create = function (trigger) {
        return new DomElementVisibleTrigger({
            strId: trigger.strId,
            segment: trigger.segment,
            fields: trigger.fields,
            deps: {
                variableStorage: this.deps.variableStorage,
                dataLayer: this.deps.dataLayer,
            },
        });
    };
    return DomElementVisibleTriggerFactory;
}());

var ScrollingDepthTriggerFactory = /** @class */ (function () {
    function ScrollingDepthTriggerFactory(deps) {
        this.type = TriggerType.ScrollingDepth;
        this.deps = deps;
    }
    ScrollingDepthTriggerFactory.prototype.create = function (trigger) {
        return new ScrollingDepthTrigger({
            strId: trigger.strId,
            segment: trigger.segment,
            fields: trigger.fields,
            deps: {
                variableStorage: this.deps.variableStorage,
                dataLayer: this.deps.dataLayer,
            },
        });
    };
    return ScrollingDepthTriggerFactory;
}());

var SubmitFormTriggerFactory = /** @class */ (function () {
    function SubmitFormTriggerFactory(deps) {
        this.type = TriggerType.SubmitForm;
        this.deps = deps;
    }
    SubmitFormTriggerFactory.prototype.create = function (trigger) {
        return new SubmitFormTrigger({
            strId: trigger.strId,
            segment: trigger.segment,
            fields: trigger.fields,
            deps: {
                variableStorage: this.deps.variableStorage,
                dataLayer: this.deps.dataLayer,
            },
        });
    };
    return SubmitFormTriggerFactory;
}());

var ChangeHistoryTrigger = /** @class */ (function (_super) {
    __extends(ChangeHistoryTrigger, _super);
    function ChangeHistoryTrigger(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TriggerType.ChangeHistory;
        _this.handler = _this.handler.bind(_this);
        return _this;
    }
    ChangeHistoryTrigger.prototype.handler = function (event) {
        var _this = this;
        var mustBeStarted;
        if (this.segment !== undefined) {
            mustBeStarted = this.segment.check(event);
        }
        else {
            mustBeStarted = true;
        }
        if (mustBeStarted) {
            this.events.emit('run', {
                trigger: this,
                event: event,
            });
            return {
                wasRunning: true,
                onRelatedActivitiesCompleted: function () {
                    _this.events.emit('complete', { trigger: _this, event: event });
                },
            };
        }
        return {
            wasRunning: false,
        };
    };
    return ChangeHistoryTrigger;
}(Trigger));

var ChangeHistoryTriggerFactory = /** @class */ (function () {
    function ChangeHistoryTriggerFactory(deps) {
        this.type = TriggerType.ChangeHistory;
        this.deps = deps;
    }
    ChangeHistoryTriggerFactory.prototype.create = function (trigger) {
        return new ChangeHistoryTrigger({
            strId: trigger.strId,
            segment: trigger.segment,
            deps: {
                variableStorage: this.deps.variableStorage,
                dataLayer: this.deps.dataLayer,
            },
        });
    };
    return ChangeHistoryTriggerFactory;
}());

var JSErrorTriggerTrigger = /** @class */ (function (_super) {
    __extends(JSErrorTriggerTrigger, _super);
    function JSErrorTriggerTrigger(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TriggerType.JSError;
        _this.handler = _this.handler.bind(_this);
        return _this;
    }
    JSErrorTriggerTrigger.prototype.handler = function (event) {
        var _this = this;
        var mustBeStarted;
        if (this.segment !== undefined) {
            mustBeStarted = this.segment.check(event);
        }
        else {
            mustBeStarted = true;
        }
        if (mustBeStarted) {
            this.events.emit('run', {
                trigger: this,
                event: event,
            });
            return {
                wasRunning: true,
                onRelatedActivitiesCompleted: function () {
                    _this.events.emit('complete', { trigger: _this, event: event });
                },
            };
        }
        return {
            wasRunning: false,
        };
    };
    return JSErrorTriggerTrigger;
}(Trigger));

var JSErrorTriggerTriggerFactory = /** @class */ (function () {
    function JSErrorTriggerTriggerFactory(deps) {
        this.type = TriggerType.JSError;
        this.deps = deps;
    }
    JSErrorTriggerTriggerFactory.prototype.create = function (trigger) {
        return new JSErrorTriggerTrigger({
            strId: trigger.strId,
            segment: trigger.segment,
            deps: {
                variableStorage: this.deps.variableStorage,
                dataLayer: this.deps.dataLayer,
            },
        });
    };
    return JSErrorTriggerTriggerFactory;
}());

var TimerTriggerFactory = /** @class */ (function () {
    function TimerTriggerFactory(deps) {
        this.type = TriggerType.Timer;
        this.deps = deps;
    }
    TimerTriggerFactory.prototype.create = function (trigger) {
        return new TimerTrigger({
            strId: trigger.strId,
            segment: trigger.segment,
            fields: trigger.fields,
            deps: {
                variableStorage: this.deps.variableStorage,
                dataLayer: this.deps.dataLayer,
            },
        });
    };
    return TimerTriggerFactory;
}());

var TriggersStorage = /** @class */ (function () {
    function TriggersStorage(props) {
        var _this = this;
        var sortedTriggers = this.sortTriggers(props.triggers);
        var _a = props.deps, variableStorage = _a.variableStorage, dataLayer = _a.dataLayer;
        this.triggers = {};
        this.factories = {};
        this.registerFactory(new ClickTriggerFactory({ dataLayer: dataLayer, variableStorage: variableStorage }), new GroupTriggerFactory({ dataLayer: dataLayer, variableStorage: variableStorage, triggersStorage: this }), new CustomTriggerFactory({ dataLayer: dataLayer, variableStorage: variableStorage }), new InitializationTriggerFactory({ dataLayer: dataLayer, variableStorage: variableStorage }), new ViewPageTriggerFactory({ dataLayer: dataLayer, variableStorage: variableStorage }), new DomReadyTriggerFactory({ dataLayer: dataLayer, variableStorage: variableStorage }), new WindowLoadedTriggerFactory({ dataLayer: dataLayer, variableStorage: variableStorage }), new ClickLinkTriggerFactory({ dataLayer: dataLayer, variableStorage: variableStorage }), new DomElementVisibleTriggerFactory({ dataLayer: dataLayer, variableStorage: variableStorage }), new ScrollingDepthTriggerFactory({ dataLayer: dataLayer, variableStorage: variableStorage }), new SubmitFormTriggerFactory({ dataLayer: dataLayer, variableStorage: variableStorage }), new ChangeHistoryTriggerFactory({ dataLayer: dataLayer, variableStorage: variableStorage }), new JSErrorTriggerTriggerFactory({ dataLayer: dataLayer, variableStorage: variableStorage }), new TimerTriggerFactory({ dataLayer: dataLayer, variableStorage: variableStorage }));
        sortedTriggers.forEach(function (trigger) {
            var type = trigger.type, data = __rest(trigger, ["type"]);
            _this.triggers[trigger.strId] = _this.factories[type].create(data);
        });
    }
    TriggersStorage.prototype.registerFactory = function () {
        var _this = this;
        var factories = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            factories[_i] = arguments[_i];
        }
        factories.forEach(function (f) {
            _this.factories[f.type] = f;
        });
    };
    /**
     * Триггеры нужно отсортировать, т.к. требуется иметь определенную последовательность при создании триггеров -
     * Групповые триггеры должны быть созданы ПОСЛЕ остальных,
     * т.к. групповые триггеры подписываются на уже созданные триггеры.
     * Так же нужно смотреть, если при
     */
    TriggersStorage.prototype.sortTriggers = function (triggers) {
        var sortedTriggers = __spreadArray([], __read(triggers), false);
        sortedTriggers.sort(function (first, second) {
            if (first.type === TriggerType.GroupTrigger) {
                if (second.children) {
                    if (second.children.includes(first.strId)) {
                        return -1;
                    }
                    return 1;
                }
                return 1;
            }
            return -1;
        });
        return sortedTriggers;
    };
    TriggersStorage.prototype.trigger = function (strId) {
        return this.triggers[strId];
    };
    /**
     * Получить списки триггеров, разделенных по категориям (типам триггеров).
     */
    TriggersStorage.prototype.categorize = function () {
        var _this = this;
        var triggersIds = Object.keys(this.triggers);
        var categories = {};
        triggersIds.forEach(function (triggerId) {
            var trigger = _this.triggers[triggerId];
            var type = trigger.type;
            if (!categories[type]) {
                categories[type] = [trigger];
            }
            else {
                var category = categories[type]; // из-за типизации сохраняем отдельно
                if (category)
                    category.push(trigger);
            }
        });
        return categories;
    };
    return TriggersStorage;
}());

var TagTypes;
(function (TagTypes) {
    TagTypes["Html"] = "html";
    TagTypes["Popup"] = "popup";
    TagTypes["Form"] = "form";
    TagTypes["Push"] = "push";
    TagTypes["Pixel"] = "pixel";
    TagTypes["TEST_ASYNC"] = "test_async";
})(TagTypes || (TagTypes = {}));

var Tag = /** @class */ (function () {
    function Tag(props) {
        this.strId = props.strId;
        this.environment = props.environment;
    }
    return Tag;
}());

var PLacement$1;
(function (PLacement) {
    /**
     * вставить до target
     */
    PLacement["Before"] = "before";
    /**
     * вставить после target
     */
    PLacement["After"] = "after";
    /**
     * Вставить первым элементом внутри target
     */
    PLacement["FirstChild"] = "first_child";
    /**
     * Вставить последним элементом внутри target
     */
    PLacement["LastChild"] = "last_child";
})(PLacement$1 || (PLacement$1 = {}));
/**
 * Вставить строку html в документ.
 * Если в строке присутствуют <script /> теги - они выполнялся.
 * @param target
 * @param html
 * @param placement
 * @description
 */
function insertHtml(target, html, placement) {
    var fragment = document.createRange().createContextualFragment(html);
    switch (placement) {
        case PLacement$1.Before:
            target.before(fragment);
            break;
        case PLacement$1.After:
            target.after(fragment);
            break;
        case PLacement$1.LastChild:
            target.appendChild(fragment);
            break;
        case PLacement$1.FirstChild:
            target.prepend(fragment);
            break;
        default:
            target.appendChild(fragment);
            break;
    }
}

/**
 * Вставить html в document.body.
 */
var HtmlTag = /** @class */ (function (_super) {
    __extends(HtmlTag, _super);
    function HtmlTag(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TagTypes.Html;
        _this.html = props.fields.html;
        return _this;
    }
    HtmlTag.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                insertHtml(document.body, this.html);
                return [2 /*return*/];
            });
        });
    };
    return HtmlTag;
}(Tag));

var HtmlTagFactory = /** @class */ (function () {
    function HtmlTagFactory(environment) {
        this.type = TagTypes.Html;
        this.environment = environment;
    }
    HtmlTagFactory.prototype.create = function (data) {
        return new HtmlTag(__assign(__assign({}, data), { environment: this.environment }));
    };
    return HtmlTagFactory;
}());

/**
 * Тестовый асихронный тег для проверки работы. Не используется в системе.
 */
var TestAsyncTag = /** @class */ (function (_super) {
    __extends(TestAsyncTag, _super);
    function TestAsyncTag(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TagTypes.TEST_ASYNC;
        _this.wait = props.fields.wait;
        return _this;
    }
    TestAsyncTag.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, wait(this.wait)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return TestAsyncTag;
}(Tag));

var TestAsyncTagFactory = /** @class */ (function () {
    function TestAsyncTagFactory(environment) {
        this.type = TagTypes.TEST_ASYNC;
        this.environment = environment;
    }
    TestAsyncTagFactory.prototype.create = function (data) {
        return new TestAsyncTag(__assign(__assign({}, data), { environment: this.environment }));
    };
    return TestAsyncTagFactory;
}());

var ERROR_NAME$1 = 'Altcraft Error Response';
var ACErrorResponse = /** @class */ (function (_super) {
    __extends(ACErrorResponse, _super);
    function ACErrorResponse(props) {
        var _this = this;
        var error = props.error;
        _this = _super.call(this, ERROR_NAME$1) || this;
        _this.name = ERROR_NAME$1;
        _this.error = error;
        _this.error_text = props.error_text;
        return _this;
    }
    return ACErrorResponse;
}(Error));

var ERROR_NAME = 'AC Network Error';
var ACNetworkError = /** @class */ (function (_super) {
    __extends(ACNetworkError, _super);
    function ACNetworkError(props) {
        var _this = _super.call(this, ERROR_NAME) || this;
        _this.name = ERROR_NAME;
        _this.error = props.error;
        return _this;
    }
    return ACNetworkError;
}(Error));

/**
 * Функция-дженерик для получения данных с бека.
 * @param props
 */
function request(props) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, url, _b, type, _c, data, options, response, json, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = props.url, url = _a === void 0 ? '' : _a, _b = props.type, type = _b === void 0 ? 'POST' : _b, _c = props.data, data = _c === void 0 ? {} : _c;
                    options = {
                        mode: 'cors',
                        method: type,
                        body: type === 'POST' ? JSON.stringify(data) : undefined,
                    };
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(url, options)];
                case 2:
                    response = _d.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    json = _d.sent();
                    if (isType(json, 'error') && json.error > 0) {
                        return [2 /*return*/, Promise.reject(new ACErrorResponse(json))];
                    }
                    return [2 /*return*/, Promise.resolve(json)];
                case 4:
                    error_1 = _d.sent();
                    // eslint-disable-next-line no-console
                    console.log(error_1);
                    return [2 /*return*/, Promise.reject(new ACNetworkError({ error: error_1 }))];
                case 5: return [2 /*return*/];
            }
        });
    });
}

var AkApiLibError = /** @class */ (function () {
    function AkApiLibError(message) {
        this.message = message;
        this.name = 'AkApiLibError';
    }
    return AkApiLibError;
}());

/**
 * Возвращает случайное целое число из заданного диапазона.
 * @param min
 * @param max
 */
function generateRandom(min, max) {
    var minValue = min;
    var maxValue = max;
    if (minValue > maxValue)
        throw new AkApiLibError('Execution error generateRandom: min > max.');
    minValue = Math.ceil(minValue);
    maxValue = Math.floor(maxValue);
    return Math.floor(Math.random() * (maxValue - minValue) + minValue);
}

/**
 * Вставить Popup.
 */
var PopupTag = /** @class */ (function (_super) {
    __extends(PopupTag, _super);
    function PopupTag(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TagTypes.Popup;
        var popupID = props.fields.id;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _this.dotJSImport = props.dotJSImport;
        _this.dataRequest = request({ url: "".concat(_this.environment.domain, "/popup"), data: { id: popupID } });
        return _this;
    }
    PopupTag.renderCss = function (css) {
        return ("<style>".concat(css, "</style>"));
    };
    PopupTag.renderJs = function (js) {
        return ("<script>\n                (function() {\n                    ".concat(js, "\n                })();\n            </script>"));
    };
    PopupTag.renderHtml = function (id, html, css) {
        return ("<div id=\"".concat(id, "\" class=\"").concat(PopupTag.AC_WIDGET_ID, "\">\n                ").concat(css, "\n                ").concat(html, "\n            </div>"));
    };
    PopupTag.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, dotJS, popupData_1, htmlFn, cssFn, jsFn_1, id_1, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                this.dotJSImport,
                                this.dataRequest,
                            ])];
                    case 1:
                        _a = __read.apply(void 0, [_b.sent(), 2]), dotJS = _a[0], popupData_1 = _a[1];
                        if (popupData_1.data) {
                            htmlFn = dotJS === null || dotJS === void 0 ? void 0 : dotJS.default.template(popupData_1.data.templates.html);
                            cssFn = dotJS === null || dotJS === void 0 ? void 0 : dotJS.default.template(popupData_1.data.templates.css);
                            jsFn_1 = dotJS === null || dotJS === void 0 ? void 0 : dotJS.default.template(popupData_1.data.templates.js);
                            id_1 = "".concat(PopupTag.AC_WIDGET_ID, "-").concat(generateRandom(1, 10000));
                            if (htmlFn) {
                                insertHtml(document.body, PopupTag.renderHtml(id_1, String(htmlFn(popupData_1.data.data)), PopupTag.renderCss(String(cssFn(popupData_1.data.data)))));
                                setTimeout(function () {
                                    var $widget = document.getElementById(id_1);
                                    if ($widget && popupData_1.data) {
                                        insertHtml($widget, PopupTag.renderJs(String(jsFn_1(popupData_1.data.data))));
                                    }
                                });
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _b.sent();
                        // eslint-disable-next-line no-console
                        console.error(e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PopupTag.AC_WIDGET_ID = 'altcraft-popup-widget';
    return PopupTag;
}(Tag));

var PopupTagFactory = /** @class */ (function () {
    function PopupTagFactory(environment, loader) {
        this.type = TagTypes.Popup;
        this.environment = environment;
        this.loader = loader;
    }
    PopupTagFactory.prototype.create = function (data) {
        return new PopupTag(__assign(__assign({}, data), { environment: this.environment, dotJSImport: this.loader.dotJSImport }));
    };
    return PopupTagFactory;
}());

/**
 * Определяет, куда, относительно точки привязки вставить форму.
 */
var PLacement;
(function (PLacement) {
    /**
     * вставить форму до точки привязки.
     */
    PLacement["Before"] = "before";
    /**
     * вставить форму после точки привязки.
     */
    PLacement["After"] = "after";
    /**
     * Вставить форму первым элементом внутри точки привязки.
     */
    PLacement["FirstChild"] = "first_child";
    /**
     * Вставить форму последним элементом внутри точки привязки.
     */
    PLacement["LastChild"] = "last_child";
})(PLacement || (PLacement = {}));
/**
 * Вставить Форму.
 */
var FormTag = /** @class */ (function (_super) {
    __extends(FormTag, _super);
    function FormTag(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TagTypes.Form;
        var formID = props.fields.id;
        _this.dataRequest = request({ url: "".concat(_this.environment.domain, "/get_form"), data: { id: formID } });
        return _this;
    }
    FormTag.renderEmbedScript = function (src) {
        return ("<script id=\"".concat(FormTag.EMBED_FORM_SCRIPT_ID, "\" src=\"").concat(src, "\"></script>"));
    };
    FormTag.renderIframe = function (src, formId) {
        return ("<iframe src=\"".concat(src, "\" frameborder=\"0\" name=\"ak-form-").concat(formId, "\" class=\"ak-form\" width=\"100%\" sandbox=\"allow-same-origin allow-forms allow-scripts allow-popups allow-popups-to-escape-sandbox\"></iframe>"));
    };
    FormTag.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, formData, formId, $anchorPoint, isExistEmbedScript, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                this.dataRequest,
                            ])];
                    case 1:
                        _a = __read.apply(void 0, [_b.sent(), 1]), formData = _a[0];
                        if (formData.data) {
                            formId = formData.data.link.split('=')[1];
                            $anchorPoint = document.querySelector(formData.data.anchor_point.selector);
                            isExistEmbedScript = Boolean(document.getElementById(FormTag.EMBED_FORM_SCRIPT_ID));
                            if ($anchorPoint) {
                                insertHtml($anchorPoint, isExistEmbedScript
                                    ? FormTag.renderIframe(formData.data.link, formId)
                                    : "".concat(FormTag.renderEmbedScript(formData.data.embed_src), "\n                               ").concat(FormTag.renderIframe(formData.data.link, formId), "\n                               "), formData.data.anchor_point.placement);
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _b.sent();
                        // eslint-disable-next-line no-console
                        console.error(e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FormTag.EMBED_FORM_SCRIPT_ID = 'altcraft-form-embed';
    return FormTag;
}(Tag));

var FormTagFactory = /** @class */ (function () {
    function FormTagFactory(environment) {
        this.type = TagTypes.Form;
        this.environment = environment;
    }
    FormTagFactory.prototype.create = function (data) {
        return new FormTag(__assign(__assign({}, data), { environment: this.environment }));
    };
    return FormTagFactory;
}());

/**
 * Вставить Popup.
 */
var PushTag = /** @class */ (function (_super) {
    __extends(PushTag, _super);
    function PushTag(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TagTypes.Push;
        _this.swPath = props.fields.swPath;
        _this.resourceToken = props.fields.resourceToken;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _this.AKPushImport = props.AKPushImport;
        _this.dataRequest = request({
            url: "".concat(_this.environment.domain, "/push"),
            data: {
                resource_token: props.fields.resourceToken,
                verbose: props.fields.verbose,
            },
        });
        return _this;
    }
    PushTag.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, AKPushJS, pushData, AKPush, akPush, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, Promise.all([
                                this.AKPushImport,
                                this.dataRequest,
                            ])];
                    case 1:
                        _a = __read.apply(void 0, [_b.sent(), 2]), AKPushJS = _a[0], pushData = _a[1];
                        if (!pushData.data) return [3 /*break*/, 3];
                        if (this.swPath) {
                            pushData.data = __assign(__assign({}, pushData.data), { swPath: this.swPath });
                        }
                        if (!(AKPushJS === null || AKPushJS === void 0 ? void 0 : AKPushJS.default)) return [3 /*break*/, 3];
                        AKPush = AKPushJS === null || AKPushJS === void 0 ? void 0 : AKPushJS.default;
                        akPush = new AKPush(__assign(__assign({}, pushData.data), { resourceToken: this.resourceToken }));
                        return [4 /*yield*/, akPush.initSubscription()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        e_1 = _b.sent();
                        // eslint-disable-next-line no-console
                        console.error(e_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return PushTag;
}(Tag));

var PushTagFactory = /** @class */ (function () {
    function PushTagFactory(environment, loader) {
        this.type = TagTypes.Push;
        this.environment = environment;
        this.loader = loader;
    }
    PushTagFactory.prototype.create = function (data) {
        return new PushTag(__assign(__assign({}, data), { environment: this.environment, AKPushImport: this.loader.AKPushImport }));
    };
    return PushTagFactory;
}());

/**
 * Загрузчик зависимостей тегов.
 */
var LoaderDependencies = /** @class */ (function () {
    function LoaderDependencies(props) {
        var _this = this;
        props.tagsTypes.forEach(function (tag) {
            switch (tag) {
                case TagTypes.Popup:
                    _this.dotJSImport = (function (t) { return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(t)); }); })("".concat(props.environment.domain, "/template.js"));
                    break;
                case TagTypes.Push:
                    _this.AKPushImport = (function (t) { return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(t)); }); })("".concat(props.environment.domain, "/AKPush.js"));
                    break;
            }
        });
    }
    return LoaderDependencies;
}());

/**
 * Возвращает DOM объект img, для отправки GET запроса с данными.
 * Запрос происходит в момент присваивания img.src
 *
 * @function
 * @param {string} src - url для GET запроса
 * @return {Object}
 */
function createImage(src) {
    var img = document.createElement('img');
    img.width = 1;
    img.height = 1;
    img.src = src;
    return img;
}
/**
 * Отправка через объект Image
 *
 * Создает GET-запрос, на указываемый url c Headers accept: image/webp,image/apng,image/
 * Данные передаются через параметры URL. Ожидаемый ответ: 200/204 без body.
 * Если ответ ошибочный, ожидается код ошибки. body все так же пустой.
 *
 * @function
 * @param URL
 * @param {object} payload - данные, которые нужно отправить
 */
function sendImage(URL, payload) {
    return __awaiter(this, void 0, void 0, function () {
        var url, keys, i, key, value;
        return __generator(this, function (_a) {
            url = new urlParse(URL, true);
            if (payload) {
                keys = Object.keys(payload);
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    value = payload[key];
                    if (typeof value === 'number') {
                        url.query[key] = String(value);
                    }
                    else if (Array.isArray(value)) {
                        url.query[key] = value.join(',');
                    }
                    else {
                        url.query[key] = value;
                    }
                }
            }
            return [2 /*return*/, new Promise(function (resolve) {
                    var img = createImage(url.toString());
                    // onerror коллбек не нужен, т.к. никакого изображения загружено не будет и браузер посчитает это за ошибку.
                    img.onload = function () {
                        img.onload = null;
                        img.onerror = null;
                        resolve();
                    };
                })];
        });
    });
}

var PixelTag = /** @class */ (function (_super) {
    __extends(PixelTag, _super);
    function PixelTag(props) {
        var _this = _super.call(this, props) || this;
        _this.type = TagTypes.Pixel;
        _this.goals = props.fields.goals;
        _this.value = props.fields.value;
        _this.dataRequest = request({
            url: "".concat(_this.environment.domain, "/get_pixel"),
            data: {
                pixel_id: props.fields.pixel_id,
            },
        });
        return _this;
    }
    PixelTag.prototype.run = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, pixelData, e_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, Promise.all([
                                this.dataRequest,
                            ])];
                    case 1:
                        _b = __read.apply(void 0, [_c.sent(), 1]), pixelData = _b[0];
                        if (!pixelData.data) return [3 /*break*/, 3];
                        return [4 /*yield*/, sendImage((_a = pixelData.data) === null || _a === void 0 ? void 0 : _a.link, { goals: this.goals, value: this.value })];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        e_1 = _c.sent();
                        // eslint-disable-next-line no-console
                        console.error(e_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return PixelTag;
}(Tag));

var PixelTagFactory = /** @class */ (function () {
    function PixelTagFactory(environment) {
        this.type = TagTypes.Pixel;
        this.environment = environment;
    }
    PixelTagFactory.prototype.create = function (data) {
        return new PixelTag(__assign(__assign({}, data), { environment: this.environment }));
    };
    return PixelTagFactory;
}());

var TagStorage = /** @class */ (function () {
    function TagStorage(tags, environment) {
        var _this = this;
        this.tags = {};
        this.factories = {};
        var tagsTypes = removeDuplicates(tags.map(function (tag) { return tag.type; }));
        var loader = new LoaderDependencies({ environment: environment, tagsTypes: tagsTypes });
        this.registerFactory(new HtmlTagFactory(environment), new TestAsyncTagFactory(environment), new PopupTagFactory(environment, loader), new FormTagFactory(environment), new PushTagFactory(environment, loader), new PixelTagFactory(environment));
        tags.forEach(function (tag) {
            var type = tag.type, data = __rest(tag, ["type"]);
            _this.tags[tag.strId] = _this.factories[type].create(data);
        });
    }
    TagStorage.prototype.registerFactory = function () {
        var _this = this;
        var factories = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            factories[_i] = arguments[_i];
        }
        factories.forEach(function (f) {
            _this.factories[f.type] = f;
        });
    };
    TagStorage.prototype.tag = function (strId) {
        return this.tags[strId];
    };
    return TagStorage;
}());

var Variable = /** @class */ (function () {
    function Variable(props) {
        this.strId = props.strId;
        this.environment = props.environment;
    }
    return Variable;
}());

/**
 * Узнать переменная возвращает значение атрибута DOM элемента.
 */
var DomElementVariable = /** @class */ (function (_super) {
    __extends(DomElementVariable, _super);
    function DomElementVariable(props) {
        var _this = _super.call(this, props) || this;
        _this.type = UserVariables$1.DomElement;
        _this.selectorType = props.fields.selectorType;
        _this.selector = props.fields.selector;
        _this.attrName = props.fields.attrName;
        return _this;
    }
    DomElementVariable.prototype.read = function () {
        var elem;
        var attr = null;
        if (this.selectorType === 'id') {
            elem = document.getElementById(this.selector);
        }
        else {
            elem = document.querySelector(this.selector);
        }
        if (elem) {
            attr = elem.getAttribute(this.attrName);
        }
        return attr;
    };
    return DomElementVariable;
}(Variable));

var VariableFactory = /** @class */ (function () {
    function VariableFactory(environment) {
        this.environment = environment;
    }
    return VariableFactory;
}());

var DomElementVariableFactory = /** @class */ (function (_super) {
    __extends(DomElementVariableFactory, _super);
    function DomElementVariableFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = UserVariables$1.DomElement;
        return _this;
    }
    DomElementVariableFactory.prototype.create = function (data) {
        return new DomElementVariable(__assign(__assign({}, data), { environment: this.environment }));
    };
    return DomElementVariableFactory;
}(VariableFactory));

function b64DecodeUnicode(str) {
    /**
     * Прокладка Buffer достаточно большая, поэтому чтобы не перегружать код полифилом используем старый вариант
     */
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); }).join(''));
}
/**
 * fromBase64API позволяет декодировать строки из их base64 представления.
 * Возвращает, undefined если предоставлен недопустимый ввод.
 */
function fromBase64(str) {
    try {
        return b64DecodeUnicode(str);
    }
    catch (e) {
        return undefined;
    }
}

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([\dA-F]{2})/g, function (match, p1) { return String.fromCharCode(Number('0x' + p1)); }));
}
/**
 * API toBase64 позволяет преобразовать строки в кодировку base64.
 * @param str
 */
function toBase64(str) {
    try {
        return b64EncodeUnicode(str);
    }
    catch (e) {
        return undefined;
    }
}

/**
 * Возвращает объект с методами для доступа к хранилищу шаблона.
 * Хранилище шаблона обеспечивает обмен данными между выполнениями одного шаблона.
 * Данные хранятся в нем в течение всего времени существования страницы.
 */
var TemplateStorage = /** @class */ (function () {
    function TemplateStorage() {
        this.storage = {};
    }
    TemplateStorage.prototype.getItem = function (key) {
        return this.storage[key];
    };
    TemplateStorage.prototype.setItem = function (key, value) {
        this.storage[key] = value;
    };
    TemplateStorage.prototype.removeItem = function (key) {
        delete this.storage[key];
    };
    TemplateStorage.prototype.clear = function () {
        this.storage = {};
    };
    return TemplateStorage;
}());
var templateStorage = new TemplateStorage();

var API_LIB = {
    generateRandom: generateRandom,
    fromBase64: fromBase64,
    toBase64: toBase64,
    templateStorage: templateStorage,
};

var FunctionalityType;
(function (FunctionalityType) {
    FunctionalityType["tag"] = "tag";
    FunctionalityType["variable"] = "variable";
})(FunctionalityType || (FunctionalityType = {}));
/**
 * Создатель функций. Используется, чтобы создать шаблонный тег и шаблонную переменную.
 * Все "переменные" и "теги" в рамках tag-manager, это на самом деле функции.
 * Различие только в том, что "переменные" должны возвращать значение, а "тег" - нет.
 */
var FunctionalityBuilder = /** @class */ (function () {
    function FunctionalityBuilder() {
    }
    /**
     * Конвертируем содержимое тела функции.
     * Для пользователя, механизм получения функциональности API - require().
     * При создании функции через new Function(), в замыкание кладется ссылка на глобальную область видимости.
     * Поэтому, чтобы использовать require - такая функция должна быть в window.require;
     * Но мы не можем напрямую положить такую функцию, т.к. она конфликтует с форматом модулей CommonJS.
     * Такой формат модулей может использоваться у клиентов на сайте.
     * По этой причине конвертируем, вызов require в удобный для нас вызов.
     * @param body
     * @private
     */
    FunctionalityBuilder.convertBody = function (body) {
        return body.replace(/require/g, 'akRequire');
    };
    FunctionalityBuilder.akRequire = function (libFunc) {
        return API_LIB[libFunc];
    };
    FunctionalityBuilder.build = function (body) {
        // eslint-disable-next-line no-new-func
        return new Function('data', FunctionalityBuilder.convertBody(body));
    };
    return FunctionalityBuilder;
}());
window.akRequire = FunctionalityBuilder.akRequire;

var TemplateVariable = /** @class */ (function (_super) {
    __extends(TemplateVariable, _super);
    function TemplateVariable(props) {
        var _this = _super.call(this, {
            strId: props.strId,
            environment: props.environment,
        }) || this;
        _this.type = TemplateVariable.TYPE;
        _this.body = props.body || '';
        _this.fields = props.fields;
        _this.variable = FunctionalityBuilder.build(_this.body);
        return _this;
    }
    TemplateVariable.prototype.read = function () {
        return this.variable(this.fields || {});
    };
    TemplateVariable.TYPE = 'templateVariable';
    return TemplateVariable;
}(Variable));

var TemplateVariableFactory = /** @class */ (function (_super) {
    __extends(TemplateVariableFactory, _super);
    function TemplateVariableFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = TemplateVariable.TYPE;
        return _this;
    }
    TemplateVariableFactory.prototype.create = function (data) {
        return new TemplateVariable(__assign({ environment: this.environment }, data));
    };
    return TemplateVariableFactory;
}(VariableFactory));

/**
 * Кастомные переменные, пришедшие из dataLayer
 *
 * @see DataLayerController
 */
var CustomVariable = /** @class */ (function (_super) {
    __extends(CustomVariable, _super);
    function CustomVariable(props) {
        var _this = _super.call(this, props) || this;
        _this.type = UserVariables$1.CustomVariable;
        _this.read = function () { return _this.value; };
        _this.value = props.value;
        return _this;
    }
    return CustomVariable;
}(Variable));

var CustomVariableFactory = /** @class */ (function (_super) {
    __extends(CustomVariableFactory, _super);
    function CustomVariableFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = UserVariables$1.CustomVariable;
        return _this;
    }
    CustomVariableFactory.prototype.create = function (data) {
        return new CustomVariable(data);
    };
    return CustomVariableFactory;
}(VariableFactory));

var BuildInVariables;
(function (BuildInVariables) {
    BuildInVariables["PagePath"] = "PagePath";
    BuildInVariables["PageHostName"] = "PageHostName";
    BuildInVariables["PageURL"] = "PageURL";
    BuildInVariables["Referrer"] = "Referrer";
    BuildInVariables["DebugMode"] = "DebugMode";
    BuildInVariables["ContainerID"] = "ContainerID";
})(BuildInVariables || (BuildInVariables = {}));

/**
 * URL перехода HTTP
 */
var ReferrerVariable = /** @class */ (function (_super) {
    __extends(ReferrerVariable, _super);
    function ReferrerVariable(props) {
        var _this = _super.call(this, __assign(__assign({}, props), { strId: addAkPrefix(BuildInVariables.Referrer) })) || this;
        _this.type = BuildInVariables.Referrer;
        return _this;
    }
    ReferrerVariable.prototype.read = function () {
        return document.referrer;
    };
    return ReferrerVariable;
}(Variable));

var ReferrerVariableFactory = /** @class */ (function (_super) {
    __extends(ReferrerVariableFactory, _super);
    function ReferrerVariableFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = BuildInVariables.Referrer;
        return _this;
    }
    ReferrerVariableFactory.prototype.create = function () {
        return new ReferrerVariable({
            environment: this.environment,
        });
    };
    return ReferrerVariableFactory;
}(VariableFactory));

function hasAkPrefix(str) {
    return str.startsWith(AC_TAG_MANAGER_PREFIX);
}

/**
 * Узнать переменная возвращает значение атрибута DOM элемента.
 */
var PageUrlVariable = /** @class */ (function (_super) {
    __extends(PageUrlVariable, _super);
    function PageUrlVariable(props) {
        var _this = _super.call(this, __assign(__assign({}, props), { strId: addAkPrefix(BuildInVariables.PageURL) })) || this;
        _this.type = BuildInVariables.PageURL;
        return _this;
    }
    PageUrlVariable.prototype.read = function () {
        return window.location.href;
    };
    return PageUrlVariable;
}(Variable));

var PageURLVariableFactory = /** @class */ (function (_super) {
    __extends(PageURLVariableFactory, _super);
    function PageURLVariableFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = BuildInVariables.PageURL;
        return _this;
    }
    PageURLVariableFactory.prototype.create = function () {
        return new PageUrlVariable({
            environment: this.environment,
        });
    };
    return PageURLVariableFactory;
}(VariableFactory));

/**
 * Узнать переменная возвращает значение атрибута DOM элемента.
 */
var PagePathVariable = /** @class */ (function (_super) {
    __extends(PagePathVariable, _super);
    function PagePathVariable(props) {
        var _this = _super.call(this, __assign(__assign({}, props), { strId: addAkPrefix(BuildInVariables.PagePath) })) || this;
        _this.type = BuildInVariables.PagePath;
        return _this;
    }
    PagePathVariable.prototype.read = function () {
        return window.location.pathname;
    };
    return PagePathVariable;
}(Variable));

var PagePathVariableFactory = /** @class */ (function (_super) {
    __extends(PagePathVariableFactory, _super);
    function PagePathVariableFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = BuildInVariables.PagePath;
        return _this;
    }
    PagePathVariableFactory.prototype.create = function () {
        return new PagePathVariable({
            environment: this.environment,
        });
    };
    return PagePathVariableFactory;
}(VariableFactory));

/**
 * Узнать переменная возвращает значение атрибута DOM элемента.
 */
var PageHostNameVariable = /** @class */ (function (_super) {
    __extends(PageHostNameVariable, _super);
    function PageHostNameVariable(props) {
        var _this = _super.call(this, __assign(__assign({}, props), { strId: addAkPrefix(BuildInVariables.PageHostName) })) || this;
        _this.type = BuildInVariables.PageHostName;
        return _this;
    }
    PageHostNameVariable.prototype.read = function () {
        return window.location.hostname;
    };
    return PageHostNameVariable;
}(Variable));

var PageHostNameVariableFactory = /** @class */ (function (_super) {
    __extends(PageHostNameVariableFactory, _super);
    function PageHostNameVariableFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = BuildInVariables.PageHostName;
        return _this;
    }
    PageHostNameVariableFactory.prototype.create = function () {
        return new PageHostNameVariable({
            environment: this.environment,
        });
    };
    return PageHostNameVariableFactory;
}(VariableFactory));

var DebugModeVariable = /** @class */ (function (_super) {
    __extends(DebugModeVariable, _super);
    function DebugModeVariable(props) {
        var _this = _super.call(this, __assign(__assign({}, props), { strId: addAkPrefix(BuildInVariables.DebugMode) })) || this;
        _this.type = BuildInVariables.DebugMode;
        return _this;
    }
    DebugModeVariable.prototype.read = function () {
        return this.environment.isDebug;
    };
    return DebugModeVariable;
}(Variable));

var DebugModeVariableFactory = /** @class */ (function (_super) {
    __extends(DebugModeVariableFactory, _super);
    function DebugModeVariableFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = BuildInVariables.DebugMode;
        return _this;
    }
    DebugModeVariableFactory.prototype.create = function () {
        return new DebugModeVariable({
            environment: this.environment,
        });
    };
    return DebugModeVariableFactory;
}(VariableFactory));

var ContainerIDVariable = /** @class */ (function (_super) {
    __extends(ContainerIDVariable, _super);
    function ContainerIDVariable(props) {
        var _this = _super.call(this, __assign(__assign({}, props), { strId: addAkPrefix(BuildInVariables.ContainerID) })) || this;
        _this.type = BuildInVariables.ContainerID;
        return _this;
    }
    ContainerIDVariable.prototype.read = function () {
        return this.environment.containerID;
    };
    return ContainerIDVariable;
}(Variable));

var ContainerIDVariableFactory = /** @class */ (function (_super) {
    __extends(ContainerIDVariableFactory, _super);
    function ContainerIDVariableFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = BuildInVariables.ContainerID;
        return _this;
    }
    ContainerIDVariableFactory.prototype.create = function () {
        return new ContainerIDVariable({
            environment: this.environment,
        });
    };
    return ContainerIDVariableFactory;
}(VariableFactory));

var URLType;
(function (URLType) {
    /**
     *  возвращает полный URL без хеш-фрагмента, например https://www.example.com/welcome?gclid=aabbcc123
     */
    URLType["Full"] = "Full";
    /**
     * возвращает протокол URL-адреса, например https .
     */
    URLType["Protocol"] = "Protocol";
    /**
     * возвращает имя хоста URL без номера порта, например, www.example.com.
     * Вы можете убрать «www.» удалить поддомен www из имени хоста.
     */
    URLType["HostName"] = "HostName";
    /**
     * возвращает номер порта, используемый в URL-адресе.
     * Например переменная вернет значение 8080. Или 80 для HTTP/443 для HTTPS, если URL-адрес не имеет номера порта.
     */
    URLType["Port"] = "Port";
    URLType["Path"] = "Path";
    URLType["FileExtension"] = "FileExtension";
    URLType["Request"] = "Request";
    URLType["Fragment"] = "Fragment";
})(URLType || (URLType = {}));
var HOST_NAME_CLEANUP_REGEX$1 = /^www\./;
function isHostName$1(fields) {
    return fields.type === URLType.HostName;
}
function isPath$1(fields) {
    return fields.type === URLType.Path;
}
function isRequest$1(fields) {
    return fields.type === URLType.Request;
}
function getHostName$1(cleanup) {
    var hostname = window.location.hostname;
    if (cleanup) {
        return hostname.replace(HOST_NAME_CLEANUP_REGEX$1, '');
    }
    return hostname;
}
function getRequest$1(key) {
    var url = new urlParse(window.location.href, true);
    var keys = Object.keys(url.query);
    for (var i = 0; i < keys.length; i++) {
        if (keys[i] === key && key.length > 0)
            return url.query[keys[i]];
    }
    return undefined;
}
function getPath$1(pages) {
    for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        var pageRegexp = new RegExp("/".concat(page, "$"));
        if (pageRegexp.test(window.location.pathname)) {
            return window.location.pathname.replace(pageRegexp, '');
        }
    }
    return window.location.pathname;
}
function getFileExtension$1() {
    var pathname = window.location.pathname;
    var result = pathname.split('.').pop();
    if (result === pathname)
        return '';
    return result;
}
function getFragment$1() {
    return window.location.hash.replace(/^#/, '');
}
function getProtocol$1() {
    return window.location.protocol.replace(/:$/, '');
}
var URLVariable = /** @class */ (function (_super) {
    __extends(URLVariable, _super);
    function URLVariable(props) {
        var _this = _super.call(this, props) || this;
        _this.type = UserVariables$1.URL;
        _this.fields = props.fields;
        return _this;
    }
    URLVariable.prototype.read = function () {
        if (isHostName$1(this.fields)) {
            return getHostName$1(this.fields.cleanUp);
        }
        if (isRequest$1(this.fields)) {
            return getRequest$1(this.fields.key);
        }
        if (isPath$1(this.fields)) {
            return getPath$1(this.fields.pages);
        }
        switch (this.fields.type) {
            case URLType.Full:
                return window.location.href;
            case URLType.Protocol:
                return getProtocol$1();
            case URLType.Port:
                return window.location.port;
            case URLType.Fragment:
                return getFragment$1();
            case URLType.FileExtension:
                return getFileExtension$1();
            default:
                return undefined;
        }
    };
    return URLVariable;
}(Variable));

var URLVariableFactory = /** @class */ (function (_super) {
    __extends(URLVariableFactory, _super);
    function URLVariableFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = UserVariables$1.URL;
        return _this;
    }
    URLVariableFactory.prototype.create = function (data) {
        return new URLVariable(__assign(__assign({}, data), { environment: this.environment }));
    };
    return URLVariableFactory;
}(VariableFactory));

var URLReferrerType;
(function (URLReferrerType) {
    /**
     *  возвращает полный URL без хеш-фрагмента, например https://www.example.com/welcome?gclid=aabbcc123
     */
    URLReferrerType["Full"] = "Full";
    /**
     * возвращает протокол URL-адреса, например https .
     */
    URLReferrerType["Protocol"] = "Protocol";
    /**
     * возвращает имя хоста URL без номера порта, например, www.example.com.
     * Вы можете убрать «www.» удалить поддомен www из имени хоста.
     */
    URLReferrerType["HostName"] = "HostName";
    /**
     * возвращает номер порта, используемый в URL-адресе.
     * Например переменная вернет значение 8080. Или 80 для HTTP/443 для HTTPS, если URL-адрес не имеет номера порта.
     */
    URLReferrerType["Port"] = "Port";
    URLReferrerType["Path"] = "Path";
    URLReferrerType["FileExtension"] = "FileExtension";
    URLReferrerType["Request"] = "Request";
    URLReferrerType["Fragment"] = "Fragment";
})(URLReferrerType || (URLReferrerType = {}));
var HOST_NAME_CLEANUP_REGEX = /^www\./;
function isHostName(fields) {
    return fields.type === URLReferrerType.HostName;
}
function isPath(fields) {
    return fields.type === URLReferrerType.Path;
}
function isRequest(fields) {
    return fields.type === URLReferrerType.Request;
}
function getHostName(cleanup) {
    var url = new urlParse(document.referrer);
    if (cleanup) {
        return url.hostname.replace(HOST_NAME_CLEANUP_REGEX, '');
    }
    return url.hostname;
}
function getRequest(key) {
    var url = new urlParse(document.referrer, true);
    var keys = Object.keys(url.query);
    for (var i = 0; i < keys.length; i++) {
        if (keys[i] === key && key.length > 0)
            return url.query[keys[i]];
    }
    return undefined;
}
function getPath(pages) {
    var url = new urlParse(document.referrer);
    for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        var pageRegexp = new RegExp("/".concat(page, "$"));
        if (pageRegexp.test(url.pathname)) {
            return url.pathname.replace(pageRegexp, '');
        }
    }
    return url.pathname;
}
function getFileExtension() {
    var url = new urlParse(document.referrer);
    var result = url.pathname.split('.').pop();
    if (result === url.pathname)
        return '';
    return result;
}
function getFragment() {
    var url = new urlParse(document.referrer);
    return url.hash.replace(/^#/, '');
}
function getProtocol() {
    var url = new urlParse(document.referrer);
    return url.protocol.replace(/:$/, '');
}
function getPort() {
    var url = new urlParse(document.referrer);
    return url.port;
}
var URLReferrerVariable = /** @class */ (function (_super) {
    __extends(URLReferrerVariable, _super);
    function URLReferrerVariable(props) {
        var _this = _super.call(this, props) || this;
        _this.type = UserVariables$1.URLReferrer;
        _this.fields = props.fields;
        return _this;
    }
    URLReferrerVariable.prototype.read = function () {
        if (isHostName(this.fields)) {
            return getHostName(this.fields.cleanUp);
        }
        if (isRequest(this.fields)) {
            return getRequest(this.fields.key);
        }
        if (isPath(this.fields)) {
            return getPath(this.fields.pages);
        }
        switch (this.fields.type) {
            case URLReferrerType.Full:
                return document.referrer;
            case URLReferrerType.Protocol:
                return getProtocol();
            case URLReferrerType.Port:
                return getPort();
            case URLReferrerType.Fragment:
                return getFragment();
            case URLReferrerType.FileExtension:
                return getFileExtension();
            default:
                return undefined;
        }
    };
    return URLReferrerVariable;
}(Variable));

var URLReferrerVariableFactory = /** @class */ (function (_super) {
    __extends(URLReferrerVariableFactory, _super);
    function URLReferrerVariableFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = UserVariables$1.URLReferrer;
        return _this;
    }
    URLReferrerVariableFactory.prototype.create = function (data) {
        return new URLReferrerVariable(__assign(__assign({}, data), { environment: this.environment }));
    };
    return URLReferrerVariableFactory;
}(VariableFactory));

var JavaScriptVariable = /** @class */ (function (_super) {
    __extends(JavaScriptVariable, _super);
    function JavaScriptVariable(props) {
        var _this = _super.call(this, props) || this;
        _this.type = UserVariables$1.JSVariable;
        _this.fields = props.fields;
        return _this;
    }
    JavaScriptVariable.prototype.read = function () {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return window[this.fields.variableName];
    };
    return JavaScriptVariable;
}(Variable));

var JavaScriptVariableFactory = /** @class */ (function (_super) {
    __extends(JavaScriptVariableFactory, _super);
    function JavaScriptVariableFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = UserVariables$1.JSVariable;
        return _this;
    }
    JavaScriptVariableFactory.prototype.create = function (data) {
        return new JavaScriptVariable(__assign(__assign({}, data), { environment: this.environment }));
    };
    return JavaScriptVariableFactory;
}(VariableFactory));

var JavaScriptCodeVariable = /** @class */ (function (_super) {
    __extends(JavaScriptCodeVariable, _super);
    function JavaScriptCodeVariable(props) {
        var _this = _super.call(this, props) || this;
        _this.type = UserVariables$1.JSCode;
        try {
            // eslint-disable-next-line no-new-func
            _this.func = new Function('params', "return (".concat(props.fields.code, ")()"));
        }
        catch (e) {
            _this.func = undefined;
        }
        return _this;
    }
    JavaScriptCodeVariable.prototype.read = function () {
        if (typeof this.func === 'function')
            return this.func();
        return undefined;
    };
    return JavaScriptCodeVariable;
}(Variable));

var JavaScriptCodeVariableFactory = /** @class */ (function (_super) {
    __extends(JavaScriptCodeVariableFactory, _super);
    function JavaScriptCodeVariableFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = UserVariables$1.JSCode;
        return _this;
    }
    JavaScriptCodeVariableFactory.prototype.create = function (data) {
        return new JavaScriptCodeVariable(__assign(__assign({}, data), { environment: this.environment }));
    };
    return JavaScriptCodeVariableFactory;
}(VariableFactory));

/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var parse_1 = parse;
var serialize_1 = serialize;

/**
 * Module variables.
 * @private
 */

var __toString = Object.prototype.toString;

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @param {object} [options]
 * @return {object}
 * @public
 */

function parse(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  var obj = {};
  var opt = options || {};
  var dec = opt.decode || decode;

  var index = 0;
  while (index < str.length) {
    var eqIdx = str.indexOf('=', index);

    // no more cookie pairs
    if (eqIdx === -1) {
      break
    }

    var endIdx = str.indexOf(';', index);

    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      // backtrack on prior semicolon
      index = str.lastIndexOf(';', eqIdx - 1) + 1;
      continue
    }

    var key = str.slice(index, eqIdx).trim();

    // only assign once
    if (undefined === obj[key]) {
      var val = str.slice(eqIdx + 1, endIdx).trim();

      // quoted values
      if (val.charCodeAt(0) === 0x22) {
        val = val.slice(1, -1);
      }

      obj[key] = tryDecode(val, dec);
    }

    index = endIdx + 1;
  }

  return obj;
}

/**
 * Serialize data into a cookie header.
 *
 * Serialize the a name value pair into a cookie string suitable for
 * http headers. An optional options object specified cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 *
 * @param {string} name
 * @param {string} val
 * @param {object} [options]
 * @return {string}
 * @public
 */

function serialize(name, val, options) {
  var opt = options || {};
  var enc = opt.encode || encode;

  if (typeof enc !== 'function') {
    throw new TypeError('option encode is invalid');
  }

  if (!fieldContentRegExp.test(name)) {
    throw new TypeError('argument name is invalid');
  }

  var value = enc(val);

  if (value && !fieldContentRegExp.test(value)) {
    throw new TypeError('argument val is invalid');
  }

  var str = name + '=' + value;

  if (null != opt.maxAge) {
    var maxAge = opt.maxAge - 0;

    if (isNaN(maxAge) || !isFinite(maxAge)) {
      throw new TypeError('option maxAge is invalid')
    }

    str += '; Max-Age=' + Math.floor(maxAge);
  }

  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError('option domain is invalid');
    }

    str += '; Domain=' + opt.domain;
  }

  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError('option path is invalid');
    }

    str += '; Path=' + opt.path;
  }

  if (opt.expires) {
    var expires = opt.expires;

    if (!isDate(expires) || isNaN(expires.valueOf())) {
      throw new TypeError('option expires is invalid');
    }

    str += '; Expires=' + expires.toUTCString();
  }

  if (opt.httpOnly) {
    str += '; HttpOnly';
  }

  if (opt.secure) {
    str += '; Secure';
  }

  if (opt.priority) {
    var priority = typeof opt.priority === 'string'
      ? opt.priority.toLowerCase()
      : opt.priority;

    switch (priority) {
      case 'low':
        str += '; Priority=Low';
        break
      case 'medium':
        str += '; Priority=Medium';
        break
      case 'high':
        str += '; Priority=High';
        break
      default:
        throw new TypeError('option priority is invalid')
    }
  }

  if (opt.sameSite) {
    var sameSite = typeof opt.sameSite === 'string'
      ? opt.sameSite.toLowerCase() : opt.sameSite;

    switch (sameSite) {
      case true:
        str += '; SameSite=Strict';
        break;
      case 'lax':
        str += '; SameSite=Lax';
        break;
      case 'strict':
        str += '; SameSite=Strict';
        break;
      case 'none':
        str += '; SameSite=None';
        break;
      default:
        throw new TypeError('option sameSite is invalid');
    }
  }

  return str;
}

/**
 * URL-decode string value. Optimized to skip native call when no %.
 *
 * @param {string} str
 * @returns {string}
 */

function decode (str) {
  return str.indexOf('%') !== -1
    ? decodeURIComponent(str)
    : str
}

/**
 * URL-encode value.
 *
 * @param {string} str
 * @returns {string}
 */

function encode (val) {
  return encodeURIComponent(val)
}

/**
 * Determine if value is a Date.
 *
 * @param {*} val
 * @private
 */

function isDate (val) {
  return __toString.call(val) === '[object Date]' ||
    val instanceof Date
}

/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */

function tryDecode(str, decode) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}

var cookie = {
	parse: parse_1,
	serialize: serialize_1
};

var CookieVariable = /** @class */ (function (_super) {
    __extends(CookieVariable, _super);
    function CookieVariable(props) {
        var _this = _super.call(this, props) || this;
        _this.type = UserVariables$1.Cookie;
        _this.cookieName = props.fields.name;
        _this.decodeURI = props.fields.decodeURI;
        return _this;
    }
    CookieVariable.prototype.read = function () {
        var cookies = cookie.parse(document.cookie, {
            decode: this.decodeURI // если нужно декодировать - оставляем декодирование пакету.
                ? undefined
                : function (value) { return value; }, // если не нужно декодировать - передаем фиктивную функцию декодирования.
        });
        return cookies[this.cookieName];
    };
    return CookieVariable;
}(Variable));

var CookieVariableFactory = /** @class */ (function (_super) {
    __extends(CookieVariableFactory, _super);
    function CookieVariableFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = UserVariables$1.Cookie;
        return _this;
    }
    CookieVariableFactory.prototype.create = function (data) {
        return new CookieVariable(__assign(__assign({}, data), { environment: this.environment }));
    };
    return CookieVariableFactory;
}(VariableFactory));

function getPercentVisible(elm) {
    if (elm === null)
        return 0;
    var vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    var elmBottomFromViewportTop = elm.getBoundingClientRect().bottom;
    var elmTopFromViewportTop = elm.getBoundingClientRect().top;
    var calculatePercentVisible = function () {
        var hiddenPixels = [];
        if (elmTopFromViewportTop < 0) {
            hiddenPixels.push(Math.min(Math.abs(elmTopFromViewportTop), elm.offsetHeight));
        }
        if (elmBottomFromViewportTop > vh) {
            var elmBottomPxFromViewportBottom = Math.abs(elmBottomFromViewportTop - vh);
            hiddenPixels.push(Math.min(elmBottomPxFromViewportBottom, elm.offsetHeight));
        }
        var totalHiddenPx = hiddenPixels.reduce(function (prev, curr) { return (prev || 0) + (curr || 0); }, 0);
        if (totalHiddenPx === 0) {
            return 1;
        }
        if (totalHiddenPx === elm.offsetHeight) {
            return 0;
        }
        return (elm.offsetHeight - totalHiddenPx) / elm.offsetHeight;
    };
    return calculatePercentVisible() * 100;
}

var ElementVisibleVariable = /** @class */ (function (_super) {
    __extends(ElementVisibleVariable, _super);
    function ElementVisibleVariable(props) {
        var _this = _super.call(this, props) || this;
        _this.type = UserVariables$1.ElementVisible;
        _this.selectorType = props.fields.selectorType;
        _this.selector = props.fields.selector;
        _this.resultType = props.fields.resultType;
        _this.threshold = props.fields.resultType === 'boolean'
            ? props.fields.threshold || 1
            : 100;
        return _this;
    }
    ElementVisibleVariable.prototype.read = function () {
        var elem;
        if (this.selectorType === 'id') {
            elem = document.getElementById(this.selector);
        }
        else {
            elem = document.querySelector(this.selector);
        }
        if (elem instanceof HTMLElement) {
            var percent = getPercentVisible(elem);
            if (this.resultType === 'boolean') {
                return percent > this.threshold;
            }
            if (this.resultType === 'percent')
                return percent;
        }
        if (this.resultType === 'boolean')
            return false;
        return 0;
    };
    return ElementVisibleVariable;
}(Variable));

var ElementVisibleVariableFactory = /** @class */ (function (_super) {
    __extends(ElementVisibleVariableFactory, _super);
    function ElementVisibleVariableFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = UserVariables$1.ElementVisible;
        return _this;
    }
    ElementVisibleVariableFactory.prototype.create = function (data) {
        return new ElementVisibleVariable(__assign(__assign({}, data), { environment: this.environment }));
    };
    return ElementVisibleVariableFactory;
}(VariableFactory));

var UtmVariable = /** @class */ (function (_super) {
    __extends(UtmVariable, _super);
    function UtmVariable(props) {
        var _this = _super.call(this, props) || this;
        _this.type = UserVariables$1.Utm;
        _this.param = props.fields.param;
        return _this;
    }
    UtmVariable.prototype.read = function () {
        var url = new urlParse(window.location.href, true);
        switch (this.param) {
            case 'content':
                return url.query.utm_content;
            case 'campaign':
                return url.query.utm_campaign;
            case 'medium':
                return url.query.utm_medium;
            case 'source':
                return url.query.utm_source;
            case 'term':
                return url.query.utm_term;
            default:
                return undefined;
        }
    };
    return UtmVariable;
}(Variable));

var UtmVariableFactory = /** @class */ (function (_super) {
    __extends(UtmVariableFactory, _super);
    function UtmVariableFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = UserVariables$1.Utm;
        return _this;
    }
    UtmVariableFactory.prototype.create = function (data) {
        return new UtmVariable(__assign(__assign({}, data), { environment: this.environment }));
    };
    return UtmVariableFactory;
}(VariableFactory));

var sourcebuster = createCommonjsModule(function (module, exports) {
!function(e){module.exports=e();}(function(){return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof commonjsRequire=="function"&&commonjsRequire;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r);}return n[o].exports}var i=typeof commonjsRequire=="function"&&commonjsRequire;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

var init = _dereq_('./init');

var sbjs = {
  init: function(prefs) {
    this.get = init(prefs);
    if (prefs && prefs.callback && typeof prefs.callback === 'function') {
      prefs.callback(this.get);
    }
  }
};

module.exports = sbjs;
},{"./init":6}],2:[function(_dereq_,module,exports){

var terms = _dereq_('./terms'),
    utils = _dereq_('./helpers/utils');

var data = {

  containers: {
    current:          'sbjs_current',
    current_extra:    'sbjs_current_add',
    first:            'sbjs_first',
    first_extra:      'sbjs_first_add',
    session:          'sbjs_session',
    udata:            'sbjs_udata',
    promocode:        'sbjs_promo'
  },

  service: {
    migrations:       'sbjs_migrations'
  },

  delimiter:          '|||',

  aliases: {

    main: {
      type:           'typ',
      source:         'src',
      medium:         'mdm',
      campaign:       'cmp',
      content:        'cnt',
      term:           'trm'
    },

    extra: {
      fire_date:      'fd',
      entrance_point: 'ep',
      referer:        'rf'
    },

    session: {
      pages_seen:     'pgs',
      current_page:   'cpg'
    },

    udata: {
      visits:         'vst',
      ip:             'uip',
      agent:          'uag'
    },

    promo:            'code'

  },

  pack: {

    main: function(sbjs) {
      return (
        data.aliases.main.type      + '=' + sbjs.type     + data.delimiter +
        data.aliases.main.source    + '=' + sbjs.source   + data.delimiter +
        data.aliases.main.medium    + '=' + sbjs.medium   + data.delimiter +
        data.aliases.main.campaign  + '=' + sbjs.campaign + data.delimiter +
        data.aliases.main.content   + '=' + sbjs.content  + data.delimiter +
        data.aliases.main.term      + '=' + sbjs.term
      );
    },

    extra: function(timezone_offset) {
      return (
        data.aliases.extra.fire_date      + '=' + utils.setDate(new Date, timezone_offset) + data.delimiter +
        data.aliases.extra.entrance_point + '=' + document.location.href                   + data.delimiter +
        data.aliases.extra.referer        + '=' + (document.referrer || terms.none)
      );
    },

    user: function(visits, user_ip) {
      return (
        data.aliases.udata.visits + '=' + visits  + data.delimiter +
        data.aliases.udata.ip     + '=' + user_ip + data.delimiter +
        data.aliases.udata.agent  + '=' + navigator.userAgent
      );
    },

    session: function(pages) {
      return (
      data.aliases.session.pages_seen   + '=' + pages + data.delimiter +
      data.aliases.session.current_page + '=' + document.location.href
      );
    },

    promo: function(promo) {
      return (
        data.aliases.promo + '=' + utils.setLeadingZeroToInt(utils.randomInt(promo.min, promo.max), promo.max.toString().length)
      );
    }

  }
};

module.exports = data;
},{"./helpers/utils":5,"./terms":9}],3:[function(_dereq_,module,exports){

var delimiter = _dereq_('../data').delimiter;

module.exports = {

  encodeData: function(s) {
    return encodeURIComponent(s).replace(/\!/g, '%21')
                                .replace(/\~/g, '%7E')
                                .replace(/\*/g, '%2A')
                                .replace(/\'/g, '%27')
                                .replace(/\(/g, '%28')
                                .replace(/\)/g, '%29');
  },

  decodeData: function(s) {
    try {
      return decodeURIComponent(s).replace(/\%21/g, '!')
                                  .replace(/\%7E/g, '~')
                                  .replace(/\%2A/g, '*')
                                  .replace(/\%27/g, "'")
                                  .replace(/\%28/g, '(')
                                  .replace(/\%29/g, ')');
    } catch(err1) {
      // try unescape for backward compatibility
      try { return unescape(s); } catch(err2) { return ''; }
    }
  },

  set: function(name, value, minutes, domain, excl_subdomains) {
    var expires, basehost;

    if (minutes) {
      var date = new Date();
      date.setTime(date.getTime() + (minutes * 60 * 1000));
      expires = '; expires=' + date.toGMTString();
    } else {
      expires = '';
    }
    if (domain && !excl_subdomains) {
      basehost = ';domain=.' + domain;
    } else {
      basehost = '';
    }
    document.cookie = this.encodeData(name) + '=' + this.encodeData(value) + expires + basehost + '; path=/';
  },

  get: function(name) {
    var nameEQ = this.encodeData(name) + '=',
        ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') { c = c.substring(1, c.length); }
      if (c.indexOf(nameEQ) === 0) {
        return this.decodeData(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  },

  destroy: function(name, domain, excl_subdomains) {
    this.set(name, '', -1, domain, excl_subdomains);
  },

  parse: function(yummy) {

    var cookies = [],
        data    = {};

    if (typeof yummy === 'string') {
      cookies.push(yummy);
    } else {
      for (var prop in yummy) {
        if (yummy.hasOwnProperty(prop)) {
          cookies.push(yummy[prop]);
        }
      }
    }

    for (var i1 = 0; i1 < cookies.length; i1++) {
      var cookie_array;
      data[this.unsbjs(cookies[i1])] = {};
      if (this.get(cookies[i1])) {
        cookie_array = this.get(cookies[i1]).split(delimiter);
      } else {
        cookie_array = [];
      }
      for (var i2 = 0; i2 < cookie_array.length; i2++) {
        var tmp_array = cookie_array[i2].split('='),
            result_array = tmp_array.splice(0, 1);
        result_array.push(tmp_array.join('='));
        data[this.unsbjs(cookies[i1])][result_array[0]] = this.decodeData(result_array[1]);
      }
    }

    return data;

  },

  unsbjs: function (string) {
    return string.replace('sbjs_', '');
  }

};

},{"../data":2}],4:[function(_dereq_,module,exports){

module.exports = {

  parse: function(str) {
    var o = this.parseOptions,
        m = o.parser[o.strictMode ? 'strict' : 'loose'].exec(str),
        uri = {},
        i = 14;

    while (i--) { uri[o.key[i]] = m[i] || ''; }

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) { uri[o.q.name][$1] = $2; }
    });

    return uri;
  },

  parseOptions: {
    strictMode: false,
    key: ['source','protocol','authority','userInfo','user','password','host','port','relative','path','directory','file','query','anchor'],
    q: {
      name:   'queryKey',
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  },

  getParam: function(custom_params) {
    var query_string = {},
        query = custom_params ? custom_params : window.location.search.substring(1),
        vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (typeof query_string[pair[0]] === 'undefined') {
        query_string[pair[0]] = pair[1];
      } else if (typeof query_string[pair[0]] === 'string') {
        var arr = [ query_string[pair[0]], pair[1] ];
        query_string[pair[0]] = arr;
      } else {
        query_string[pair[0]].push(pair[1]);
      }
    }
    return query_string;
  },

  getHost: function(request) {
    return this.parse(request).host.replace('www.', '');
  }

};
},{}],5:[function(_dereq_,module,exports){

module.exports = {

  escapeRegexp: function(string) {
    return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },

  setDate: function(date, offset) {
    var utc_offset    = date.getTimezoneOffset() / 60,
        now_hours     = date.getHours(),
        custom_offset = offset || offset === 0 ? offset : -utc_offset;

    date.setHours(now_hours + utc_offset + custom_offset);

    var year    = date.getFullYear(),
        month   = this.setLeadingZeroToInt(date.getMonth() + 1,   2),
        day     = this.setLeadingZeroToInt(date.getDate(),        2),
        hour    = this.setLeadingZeroToInt(date.getHours(),       2),
        minute  = this.setLeadingZeroToInt(date.getMinutes(),     2),
        second  = this.setLeadingZeroToInt(date.getSeconds(),     2);

    return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second);
  },

  setLeadingZeroToInt: function(num, size) {
    var s = num + '';
    while (s.length < size) { s = '0' + s; }
    return s;
  },

  randomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

};

},{}],6:[function(_dereq_,module,exports){

var data        = _dereq_('./data'),
    terms       = _dereq_('./terms'),
    cookies     = _dereq_('./helpers/cookies'),
    uri         = _dereq_('./helpers/uri'),
    utils       = _dereq_('./helpers/utils'),
    params      = _dereq_('./params'),
    migrations  = _dereq_('./migrations');

module.exports = function(prefs) {

  var p         = params.fetch(prefs);
  var get_param = uri.getParam();
  var domain    = p.domain.host,
      isolate   = p.domain.isolate,
      lifetime  = p.lifetime;

  migrations.go(lifetime, domain, isolate);

  var __sbjs_type,
      __sbjs_source,
      __sbjs_medium,
      __sbjs_campaign,
      __sbjs_content,
      __sbjs_term;

  function mainData() {
    var sbjs_data;
    if (
        typeof get_param.utm_source        !== 'undefined' ||
        typeof get_param.utm_medium        !== 'undefined' ||
        typeof get_param.utm_campaign      !== 'undefined' ||
        typeof get_param.utm_content       !== 'undefined' ||
        typeof get_param.utm_term          !== 'undefined' ||
        typeof get_param.gclid             !== 'undefined' ||
        typeof get_param.yclid             !== 'undefined' ||
        typeof get_param[p.campaign_param] !== 'undefined'
      ) {
      setFirstAndCurrentExtraData();
      sbjs_data = getData(terms.traffic.utm);
    } else if (checkReferer(terms.traffic.organic)) {
      setFirstAndCurrentExtraData();
      sbjs_data = getData(terms.traffic.organic);
    } else if (!cookies.get(data.containers.session) && checkReferer(terms.traffic.referral)) {
      setFirstAndCurrentExtraData();
      sbjs_data = getData(terms.traffic.referral);
    } else if (!cookies.get(data.containers.first) && !cookies.get(data.containers.current)) {
      setFirstAndCurrentExtraData();
      sbjs_data = getData(terms.traffic.typein);
    } else {
      return cookies.get(data.containers.current);
    }

    return sbjs_data;
  }

  function getData(type) {

    switch (type) {

      case terms.traffic.utm:

        __sbjs_type = terms.traffic.utm;

        if (typeof get_param.utm_source !== 'undefined') {
          __sbjs_source = get_param.utm_source;
        } else if (typeof get_param.gclid !== 'undefined') {
          __sbjs_source = 'google';
        } else if (typeof get_param.yclid !== 'undefined') {
          __sbjs_source = 'yandex';  
        } else {
          __sbjs_source = terms.none;
        }

        if (typeof get_param.utm_medium !== 'undefined') {
          __sbjs_medium = get_param.utm_medium;
        } else if (typeof get_param.gclid !== 'undefined') {
          __sbjs_medium = 'cpc';
        } else if (typeof get_param.yclid !== 'undefined') {
          __sbjs_medium = 'cpc';  
        } else {
          __sbjs_medium = terms.none;
        }

        if (typeof get_param.utm_campaign !== 'undefined') {
          __sbjs_campaign = get_param.utm_campaign;
        } else if (typeof get_param[p.campaign_param] !== 'undefined') {
          __sbjs_campaign = get_param[p.campaign_param];
        } else if (typeof get_param.gclid !== 'undefined') {
          __sbjs_campaign = 'google_cpc';
        } else if (typeof get_param.yclid !== 'undefined') {
          __sbjs_campaign = 'yandex_cpc';  
        } else {
          __sbjs_campaign = terms.none;
        }

        __sbjs_content  = get_param.utm_content || terms.none;
        __sbjs_term     = getUtmTerm()          || terms.none;
        break;

      case terms.traffic.organic:
        __sbjs_type     = terms.traffic.organic;
        __sbjs_source   = __sbjs_source || uri.getHost(document.referrer);
        __sbjs_medium   = terms.referer.organic;
        __sbjs_campaign = terms.none;
        __sbjs_content  = terms.none;
        __sbjs_term     = terms.none;
        break;

      case terms.traffic.referral:
        __sbjs_type     = terms.traffic.referral;
        __sbjs_source   = __sbjs_source || uri.getHost(document.referrer);
        __sbjs_medium   = __sbjs_medium || terms.referer.referral;
        __sbjs_campaign = terms.none;
        __sbjs_content  = uri.parse(document.referrer).path;
        __sbjs_term     = terms.none;
        break;

      case terms.traffic.typein:
        __sbjs_type     = terms.traffic.typein;
        __sbjs_source   = p.typein_attributes.source;
        __sbjs_medium   = p.typein_attributes.medium;
        __sbjs_campaign = terms.none;
        __sbjs_content  = terms.none;
        __sbjs_term     = terms.none;
        break;

      default:
        __sbjs_type     = terms.oops;
        __sbjs_source   = terms.oops;
        __sbjs_medium   = terms.oops;
        __sbjs_campaign = terms.oops;
        __sbjs_content  = terms.oops;
        __sbjs_term     = terms.oops;
    }
    var sbjs_data = {
      type:             __sbjs_type,
      source:           __sbjs_source,
      medium:           __sbjs_medium,
      campaign:         __sbjs_campaign,
      content:          __sbjs_content,
      term:             __sbjs_term
    };

    return data.pack.main(sbjs_data);

  }

  function getUtmTerm() {
    var referer = document.referrer;
    if (get_param.utm_term) {
      return get_param.utm_term;
    } else if (referer && uri.parse(referer).host && uri.parse(referer).host.match(/^(?:.*\.)?yandex\..{2,9}$/i)) {
      try {
        return uri.getParam(uri.parse(document.referrer).query).text;
      } catch (err) {
        return false;
      }
    } else {
      return false;
    }
  }

  function checkReferer(type) {
    var referer = document.referrer;
    switch(type) {
      case terms.traffic.organic:
        return (!!referer && checkRefererHost(referer) && isOrganic(referer));
      case terms.traffic.referral:
        return (!!referer && checkRefererHost(referer) && isReferral(referer));
      default:
        return false;
    }
  }

  function checkRefererHost(referer) {
    if (p.domain) {
      if (!isolate) {
        var host_regex = new RegExp('^(?:.*\\.)?' + utils.escapeRegexp(domain) + '$', 'i');
        return !(uri.getHost(referer).match(host_regex));
      } else {
        return (uri.getHost(referer) !== uri.getHost(domain));
      }
    } else {
      return (uri.getHost(referer) !== uri.getHost(document.location.href));
    }
  }

  function isOrganic(referer) {

    var y_host  = 'yandex',
        y_param = 'text',
        g_host  = 'google';

    var y_host_regex  = new RegExp('^(?:.*\\.)?'  + utils.escapeRegexp(y_host)  + '\\..{2,9}$'),
        y_param_regex = new RegExp('.*'           + utils.escapeRegexp(y_param) + '=.*'),
        g_host_regex  = new RegExp('^(?:www\\.)?' + utils.escapeRegexp(g_host)  + '\\..{2,9}$');

    if (
        !!uri.parse(referer).query &&
        !!uri.parse(referer).host.match(y_host_regex) &&
        !!uri.parse(referer).query.match(y_param_regex)
      ) {
      __sbjs_source = y_host;
      return true;
    } else if (!!uri.parse(referer).host.match(g_host_regex)) {
      __sbjs_source = g_host;
      return true;
    } else if (!!uri.parse(referer).query) {
      for (var i = 0; i < p.organics.length; i++) {
        if (
            uri.parse(referer).host.match(new RegExp('^(?:.*\\.)?' + utils.escapeRegexp(p.organics[i].host)  + '$', 'i')) &&
            uri.parse(referer).query.match(new RegExp('.*'         + utils.escapeRegexp(p.organics[i].param) + '=.*', 'i'))
          ) {
          __sbjs_source = p.organics[i].display || p.organics[i].host;
          return true;
        }
        if (i + 1 === p.organics.length) {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  function isReferral(referer) {
    if (p.referrals.length > 0) {
      for (var i = 0; i < p.referrals.length; i++) {
        if (uri.parse(referer).host.match(new RegExp('^(?:.*\\.)?' + utils.escapeRegexp(p.referrals[i].host) + '$', 'i'))) {
          __sbjs_source = p.referrals[i].display  || p.referrals[i].host;
          __sbjs_medium = p.referrals[i].medium   || terms.referer.referral;
          return true;
        }
        if (i + 1 === p.referrals.length) {
          __sbjs_source = uri.getHost(referer);
          return true;
        }
      }
    } else {
      __sbjs_source = uri.getHost(referer);
      return true;
    }
  }

  function setFirstAndCurrentExtraData() {
    cookies.set(data.containers.current_extra, data.pack.extra(p.timezone_offset), lifetime, domain, isolate);
    if (!cookies.get(data.containers.first_extra)) {
      cookies.set(data.containers.first_extra, data.pack.extra(p.timezone_offset), lifetime, domain, isolate);
    }
  }

  (function setData() {

    // Main data
    cookies.set(data.containers.current, mainData(), lifetime, domain, isolate);
    if (!cookies.get(data.containers.first)) {
      cookies.set(data.containers.first, cookies.get(data.containers.current), lifetime, domain, isolate);
    }

    // User data
    var visits, udata;
    if (!cookies.get(data.containers.udata)) {
      visits  = 1;
      udata   = data.pack.user(visits, p.user_ip);
    } else {
      visits  = parseInt(cookies.parse(data.containers.udata)[cookies.unsbjs(data.containers.udata)][data.aliases.udata.visits]) || 1;
      visits  = cookies.get(data.containers.session) ? visits : visits + 1;
      udata   = data.pack.user(visits, p.user_ip);
    }
    cookies.set(data.containers.udata, udata, lifetime, domain, isolate);

    // Session
    var pages_count;
    if (!cookies.get(data.containers.session)) {
      pages_count = 1;
    } else {
      pages_count = parseInt(cookies.parse(data.containers.session)[cookies.unsbjs(data.containers.session)][data.aliases.session.pages_seen]) || 1;
      pages_count += 1;
    }
    cookies.set(data.containers.session, data.pack.session(pages_count), p.session_length, domain, isolate);

    // Promocode
    if (p.promocode && !cookies.get(data.containers.promocode)) {
      cookies.set(data.containers.promocode, data.pack.promo(p.promocode), lifetime, domain, isolate);
    }

  })();

  return cookies.parse(data.containers);

};
},{"./data":2,"./helpers/cookies":3,"./helpers/uri":4,"./helpers/utils":5,"./migrations":7,"./params":8,"./terms":9}],7:[function(_dereq_,module,exports){

var data    = _dereq_('./data'),
    cookies = _dereq_('./helpers/cookies');

module.exports = {

  go: function(lifetime, domain, isolate) {

    var migrate = this.migrations,
        _with   = { l: lifetime, d: domain, i: isolate };

    var i;

    if (!cookies.get(data.containers.first) && !cookies.get(data.service.migrations)) {

      var mids = [];
      for (i = 0; i < migrate.length; i++) { mids.push(migrate[i].id); }

      var advance = '';
      for (i = 0; i < mids.length; i++) {
        advance += mids[i] + '=1';
        if (i < mids.length - 1) { advance += data.delimiter; }
      }
      cookies.set(data.service.migrations, advance, _with.l, _with.d, _with.i);

    } else if (!cookies.get(data.service.migrations)) {

      // We have only one migration for now, so just
      for (i = 0; i < migrate.length; i++) {
        migrate[i].go(migrate[i].id, _with);
      }

    }

  },

  migrations: [

    {
      id: '1418474375998',
      version: '1.0.0-beta',
      go: function(mid, _with) {

        var success = mid + '=1',
            fail    = mid + '=0';

        var safeReplace = function($0, $1, $2) {
          return ($1 || $2 ? $0 : data.delimiter);
        };

        try {

          // Switch delimiter and renew cookies
          var _in = [];
          for (var prop in data.containers) {
            if (data.containers.hasOwnProperty(prop)) {
              _in.push(data.containers[prop]);
            }
          }

          for (var i = 0; i < _in.length; i++) {
            if (cookies.get(_in[i])) {
              var buffer = cookies.get(_in[i]).replace(/(\|)?\|(\|)?/g, safeReplace);
              cookies.destroy(_in[i], _with.d, _with.i);
              cookies.destroy(_in[i], _with.d, !_with.i);
              cookies.set(_in[i], buffer, _with.l, _with.d, _with.i);
            }
          }

          // Update `session`
          if (cookies.get(data.containers.session)) {
            cookies.set(data.containers.session, data.pack.session(0), _with.l, _with.d, _with.i);
          }

          // Yay!
          cookies.set(data.service.migrations, success, _with.l, _with.d, _with.i);

        } catch (err) {
          // Oops
          cookies.set(data.service.migrations, fail, _with.l, _with.d, _with.i);
        }
      }
    }

  ]

};
},{"./data":2,"./helpers/cookies":3}],8:[function(_dereq_,module,exports){

var terms = _dereq_('./terms'),
    uri   = _dereq_('./helpers/uri');

module.exports = {

  fetch: function(prefs) {

    var user   = prefs || {},
        params = {};

    // Set `lifetime of the cookie` in months
    params.lifetime = this.validate.checkFloat(user.lifetime) || 6;
    params.lifetime = parseInt(params.lifetime * 30 * 24 * 60);

    // Set `session length` in minutes
    params.session_length = this.validate.checkInt(user.session_length) || 30;

    // Set `timezone offset` in hours
    params.timezone_offset = this.validate.checkInt(user.timezone_offset);

    // Set `campaign param` for AdWords links
    params.campaign_param = user.campaign_param || false;

    // Set `user ip`
    params.user_ip = user.user_ip || terms.none;

    // Set `promocode`
    if (user.promocode) {
      params.promocode = {};
      params.promocode.min = parseInt(user.promocode.min) || 100000;
      params.promocode.max = parseInt(user.promocode.max) || 999999;
    } else {
      params.promocode = false;
    }

    // Set `typein attributes`
    if (user.typein_attributes && user.typein_attributes.source && user.typein_attributes.medium) {
      params.typein_attributes = {};
      params.typein_attributes.source = user.typein_attributes.source;
      params.typein_attributes.medium = user.typein_attributes.medium;
    } else {
      params.typein_attributes = { source: '(direct)', medium: '(none)' };
    }

    // Set `domain`
    if (user.domain && this.validate.isString(user.domain)) {
      params.domain = { host: user.domain, isolate: false };
    } else if (user.domain && user.domain.host) {
      params.domain = user.domain;
    } else {
      params.domain = { host: uri.getHost(document.location.hostname), isolate: false };
    }

    // Set `referral sources`
    params.referrals = [];

    if (user.referrals && user.referrals.length > 0) {
      for (var ir = 0; ir < user.referrals.length; ir++) {
        if (user.referrals[ir].host) {
          params.referrals.push(user.referrals[ir]);
        }
      }
    }

    // Set `organic sources`
    params.organics = [];

    if (user.organics && user.organics.length > 0) {
      for (var io = 0; io < user.organics.length; io++) {
        if (user.organics[io].host && user.organics[io].param) {
          params.organics.push(user.organics[io]);
        }
      }
    }

    params.organics.push({ host: 'bing.com',      param: 'q',     display: 'bing'            });
    params.organics.push({ host: 'yahoo.com',     param: 'p',     display: 'yahoo'           });
    params.organics.push({ host: 'about.com',     param: 'q',     display: 'about'           });
    params.organics.push({ host: 'aol.com',       param: 'q',     display: 'aol'             });
    params.organics.push({ host: 'ask.com',       param: 'q',     display: 'ask'             });
    params.organics.push({ host: 'globososo.com', param: 'q',     display: 'globo'           });
    params.organics.push({ host: 'go.mail.ru',    param: 'q',     display: 'go.mail.ru'      });
    params.organics.push({ host: 'rambler.ru',    param: 'query', display: 'rambler'         });
    params.organics.push({ host: 'tut.by',        param: 'query', display: 'tut.by'          });

    params.referrals.push({ host: 't.co',                         display: 'twitter.com'     });
    params.referrals.push({ host: 'plus.url.google.com',          display: 'plus.google.com' });


    return params;

  },

  validate: {

    checkFloat: function(v) {
      return v && this.isNumeric(parseFloat(v)) ? parseFloat(v) : false;
    },

    checkInt: function(v) {
      return v && this.isNumeric(parseInt(v)) ? parseInt(v) : false;
    },

    isNumeric: function(v){
      return !isNaN(v);
    },

    isString: function(v) {
      return Object.prototype.toString.call(v) === '[object String]';
    }

  }

};
},{"./helpers/uri":4,"./terms":9}],9:[function(_dereq_,module,exports){

module.exports = {

  traffic: {
    utm:        'utm',
    organic:    'organic',
    referral:   'referral',
    typein:     'typein'
  },

  referer: {
    referral:   'referral',
    organic:    'organic',
    social:     'social'
  },

  none:         '(none)',
  oops:         '(Houston, we have a problem)'

};

},{}]},{},[1])(1)
});
});

var SourcePredicate;
(function (SourcePredicate) {
    /**
     * Одно из значений
     */
    SourcePredicate["One"] = "one_value";
    /**
     * Ни одно из значений
     */
    SourcePredicate["None"] = "none_value";
})(SourcePredicate || (SourcePredicate = {}));
var Source;
(function (Source) {
    Source["Organic"] = "organic";
    Source["Link"] = "link";
    Source["Ad"] = "ad";
    Source["TypeIn"] = "typein";
})(Source || (Source = {}));
/**
 * Карта сопоставлений значений typ из sourcebuster.js и наших.
 */
var MATCHING_MAP = {
    utm: Source.Ad,
    organic: Source.Organic,
    referral: Source.Link,
    typein: Source.TypeIn,
};
/**
 * URL перехода HTTP
 */
var SourceVariable = /** @class */ (function (_super) {
    __extends(SourceVariable, _super);
    function SourceVariable(props) {
        var _this = _super.call(this, __assign({}, props)) || this;
        _this.type = UserVariables$1.Source;
        _this.predicate = props.fields.predicate;
        _this.sources = props.fields.check_sources;
        sourcebuster.init();
        return _this;
    }
    SourceVariable.prototype.read = function () {
        var type = sourcebuster.get.current.typ;
        var matchedType = MATCHING_MAP[type];
        // eslint-disable-next-line no-console
        switch (this.predicate) {
            case SourcePredicate.One:
                return this.sources.includes(matchedType);
            case SourcePredicate.None:
                return !this.sources.includes(matchedType);
            default:
                return false;
        }
    };
    return SourceVariable;
}(Variable));

var SourceVariableFactory = /** @class */ (function (_super) {
    __extends(SourceVariableFactory, _super);
    function SourceVariableFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = UserVariables$1.Source;
        return _this;
    }
    SourceVariableFactory.prototype.create = function (data) {
        return new SourceVariable(__assign(__assign({}, data), { environment: this.environment }));
    };
    return SourceVariableFactory;
}(VariableFactory));

var VariablesStorage = /** @class */ (function () {
    function VariablesStorage(variables, environment) {
        var _this = this;
        this.variables = {};
        this.factories = {};
        this.registerFactory(new DomElementVariableFactory(environment), new TemplateVariableFactory(environment), new CustomVariableFactory(environment), new ReferrerVariableFactory(environment), new PageURLVariableFactory(environment), new PagePathVariableFactory(environment), new PageHostNameVariableFactory(environment), new DebugModeVariableFactory(environment), new ContainerIDVariableFactory(environment), new URLVariableFactory(environment), new URLReferrerVariableFactory(environment), new JavaScriptVariableFactory(environment), new JavaScriptCodeVariableFactory(environment), new CookieVariableFactory(environment), new ElementVisibleVariableFactory(environment), new UtmVariableFactory(environment), new SourceVariableFactory(environment));
        Object.values(BuildInVariables).forEach(function (buildInVariable) {
            _this.variables[addAkPrefix(buildInVariable)] = _this.factories[buildInVariable].create();
        });
        variables.forEach(function (variable) {
            var type = variable.type, data = __rest(variable, ["type"]);
            _this.variables[variable.strId] = _this.factories[type].create(data);
        });
    }
    VariablesStorage.prototype.registerFactory = function () {
        var _this = this;
        var factories = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            factories[_i] = arguments[_i];
        }
        factories.forEach(function (f) {
            _this.factories[f.type] = f;
        });
    };
    VariablesStorage.prototype.variable = function (strId) {
        return this.variables[strId];
    };
    VariablesStorage.prototype.add = function (type, id, value) {
        this.variables[id] = this.factories[type].create({
            strId: id,
            value: value,
        });
    };
    VariablesStorage.prototype.readVariables = function () {
        var _this = this;
        var result = {};
        Object.keys(this.variables).forEach(function (variableId) {
            var variableValue = _this.variables[variableId].read();
            if (typeof variableValue !== 'function') {
                result[variableId] = variableValue;
            }
        });
        return result;
    };
    VariablesStorage.prototype.readBuildIntVariables = function () {
        var _this = this;
        var result = {};
        Object.keys(this.variables).forEach(function (variableId) {
            if (hasAkPrefix(variableId)) {
                var variableValue = _this.variables[variableId].read();
                if (typeof variableValue !== 'function') {
                    result[variableId] = variableValue;
                }
            }
        });
        return result;
    };
    return VariablesStorage;
}());

/**
 * Получить путь до элемента относительно html.
 * @param element
 *
 * @example
 * <html>
 *     <body>
 *         <div id="container">
 *           <a id="example2" class="example2 selector" href="#example2">
 *              <span>hello</span>
 *           </a>
 *         </div>
 *     </body>
 * </html>
 *
 * getElementPath(document.querySelector('#example2 span')) // 'html body #container #example2 span'
 */
function getElementPath(element) {
    var path = '';
    var i;
    var innerText;
    var tag;
    var selector;
    var classes;
    var el = element;
    for (i = 0; el && el.nodeType === 1; el = el.parentNode, i++) {
        innerText = el.childNodes.length === 0 ? el.innerHTML : '';
        tag = el.tagName.toLowerCase();
        classes = el.className;
        if (el.id !== '') {
            selector = '#' + el.id;
        }
        else if (classes.length > 0) {
            selector = tag + '.' + classes.replace(/ /g, '.');
        }
        else {
            selector = tag + ((innerText.length > 0) ? ":contains('" + innerText + "')" : '');
        }
        path = ' ' + selector + path;
    }
    return path.trim();
}

var DebugMsgFormatter = /** @class */ (function () {
    function DebugMsgFormatter() {
    }
    DebugMsgFormatter.formatting = function (msg) {
        if (DebugMsgFormatter.isActMsg(msg)) {
            return __assign(__assign({}, msg), { data: __assign(__assign({}, msg.data), { act: __assign(__assign({}, msg.data.act), { event: __assign(__assign({}, msg.data.act.event), { element: (msg.data.act.event.element instanceof HTMLElement)
                                ? DebugMsgFormatter.formattingElement(msg.data.act.event.element)
                                : undefined }) }) }) });
        }
        return msg;
    };
    DebugMsgFormatter.isActMsg = function (msg) {
        return msg.type === DebugMsgType.act;
    };
    DebugMsgFormatter.formattingElement = function (element) {
        if (element instanceof HTMLElement) {
            return getElementPath(element);
        }
        return null;
    };
    return DebugMsgFormatter;
}());

/**
 * Отправитель данных из логгера в центр отладки.
 * Т.к. общение происходит посредством postMessage и слушателя событий message в window,
 * Отправителю следует отличать свои сообщения от чужих, например из расширений браузера.
 *
 * @see postMessage
 * @see WindowEventHandlersEventMap.message
 */
var DebugSender = /** @class */ (function () {
    function DebugSender(props) {
        this.logger = props.logger;
        this.loggerListener = this.loggerListener.bind(this);
        this.debugCenterListener = this.debugCenterListener.bind(this);
        this.logger.events.registerListener('msg', this.loggerListener);
    }
    /**
     * Проверка, что сообщение - из центра отладки.
     * @param data
     */
    DebugSender.isIncomingDebugMsg = function (data) {
        return data !== null
            && typeof data === 'object'
            && src(data, 'source')
            && data.source === DebugSender.DEBUG_MSG_SOURCE
            && src(data, 'type') && (data.type === DebugMsgType.disconnect
            || data.type === DebugMsgType.connect
            || data.type === DebugMsgType.ping);
    };
    /**
     * Проверка, соответствуют ли данные исходящему сообщению.
     * @param data
     */
    DebugSender.isOutComingDebugMsg = function (data) {
        return data !== null
            && typeof data === 'object'
            && src(data, 'source')
            && data.source === DebugSender.DEBUG_MSG_SOURCE
            && src(data, 'type') && (data.type === DebugMsgType.init
            || data.type === DebugMsgType.act
            || data.type === DebugMsgType.ping
            || data.type === DebugMsgType.disconnect);
    };
    DebugSender.prototype.loggerListener = function (payload) {
        if (window.opener) {
            var msg = __assign(__assign({}, DebugMsgFormatter.formatting(payload)), { source: DebugSender.DEBUG_MSG_SOURCE });
            window.opener.postMessage(JSON.stringify(msg), '*');
        }
        if (payload.type === DebugMsgType.disconnect) {
            window.removeEventListener('message', this.debugCenterListener, false);
        }
        else if (payload.type === DebugMsgType.init) {
            window.addEventListener('message', this.debugCenterListener, false);
        }
    };
    DebugSender.prototype.debugCenterListener = function (payload) {
        try {
            var data = JSON.parse(payload.data);
            if (DebugSender.isIncomingDebugMsg(data)) {
                // убираем поле source, логгер не должен его получать.
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                var source = data.source, msg = __rest(data, ["source"]);
                this.logger.message(msg);
            }
            // eslint-disable-next-line no-empty
        }
        catch (err) { }
    };
    /**
     * Идентификатор источника сообщений.
     */
    DebugSender.DEBUG_MSG_SOURCE = 'ak-debug-center';
    return DebugSender;
}());

/**
 * Стартер таг-менеджера.
 * Создает все необходимые части системы и передает в них конфигурацию тегов, триггеров и др. для работы.
 * Важен порядок инициализации.
 *
 * Реализует:
 * - Переход в режим отладки.
 * - зависимости инициализируются с требуемыми данными.
 * - Менеджер действий оповещается о создании события извне.
 * - Если включен режим отладки - логгер фиксирует события, а сендер их отправляет.
 * - имеет ссылку на DataLayerController для просмотра данных из консоли.
 * - Изменения в истории (клиентский и серверный роутинги) влекут за собой очищение менеджера действий.
 */
var Starter = /** @class */ (function () {
    function Starter(props) {
        var _a;
        var _this = this;
        var isDebugMode = checkDebugMode(window.location.href);
        var environment = {
            isDebug: isDebugMode,
            containerID: props.containerID,
            domain: props.domain,
        };
        this.tagStorage = new TagStorage(props.tags, environment);
        this.variableStorage = new VariablesStorage(props.variables, environment);
        this.instructionStorage = new InstructionStorage({
            instructions: props.instructions,
            deps: {
                tagStorage: this.tagStorage,
            },
        });
        this.dataLayerController = new DataLayerController({ variableStorage: this.variableStorage });
        this.triggersStorage = new TriggersStorage({
            triggers: props.triggers,
            deps: {
                dataLayer: this.dataLayerController,
                variableStorage: this.variableStorage,
            },
        });
        // должен слушать контроллер
        this.actManager = new ActManager({
            instructionStorage: this.instructionStorage,
            triggerStorage: this.triggersStorage,
        });
        this.actManager.events.registerListener('act', function (payload) {
            _this.dataLayerController.addInsideItem(payload.event);
        });
        this.dataLayerController.events.registerListener('outsideEvent', function (event) {
            _this.actManager.emitEvent(event);
        });
        this.logger = new Logger({
            mode: isDebugMode ? 'debug' : 'prod',
            manager: this.actManager,
            variableStorage: this.variableStorage,
        });
        if (isDebugMode) {
            this.sender = new DebugSender({ logger: this.logger });
            this.logger.start();
        }
        (_a = this.dataLayerController).addOutsideItem.apply(_a, __spreadArray([], __read(props.initialDataLayer), false));
        this.reset = this.reset.bind(this);
        this.spyChangePage();
        this.spyChangeHistory();
        this.actManager.initialization();
    }
    Starter.prototype.reset = function () {
        this.actManager.clean();
    };
    /**
     * Следить за переходом на другие страницы в классических приложениях (роутинг на сервере).
     * @private
     */
    Starter.prototype.spyChangePage = function () {
        window.addEventListener('beforeunload', this.reset);
    };
    /**
     * Следить за изменением истории в SPA приложениях (роутинг на клиенте).
     * @private
     *
     * @see History
     */
    Starter.prototype.spyChangeHistory = function () {
        var _this = this;
        window.addEventListener('popstate', this.reset);
        window.history.pushState = createProxyApply(window.history.pushState, {
            apply: function (target, thisArg, args) {
                _this.reset();
                target.apply(thisArg, args);
            },
        });
        window.history.replaceState = createProxyApply(window.history.replaceState, {
            apply: function (target, thisArg, args) {
                _this.reset();
                target.apply(thisArg, args);
            },
        });
    };
    return Starter;
}());

/**
 * Маркер для замены данных при шаблонизации бекэндом.
 * @see AC_DEVELOPMENT_DEFAULT_DATA
 * @see rollup.config.js
 */

const AC_REPLACE_MARKER = '{"domain":"https://maksimlavrenyuk.github.io","dataLayerName":"acDataLayer","containerVersion":1,"containerID":"ACTM-1","triggers":[{"strId":"trigger1","type":"click","segment":{"queries":[{"argument":"Variable","filter":"true","operator":"equals"}]}}],"variables":[{"fields":{"predicate":"one_value","check_sources":["organic","link","ad","typein"]},"strId":"Variable","type":"Source"},{"fields":{"predicate":"one_value","check_sources":["organic","link","ad","typein"]},"strId":"Variable2","type":"Source"}],"tags":[{"type":"html","fields":{"html":"<div>test</div>"},"strId":"tag1"}],"instructions":[{"strId":"instruction1","firingOption":"once_per_event","priority":0,"tag":"tag1","triggers":["trigger1"]}]}';

var parsedData = JSON.parse(AC_REPLACE_MARKER);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
var initialDataLayer = window[parsedData.dataLayerName || 'acDataLayer'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
new Starter({
    tags: parsedData.tags,
    variables: parsedData.variables,
    instructions: parsedData.instructions,
    triggers: parsedData.triggers,
    containerID: parsedData.containerID,
    initialDataLayer: initialDataLayer,
    domain: parsedData.domain,
});
})();
        
//# sourceMappingURL=actm.js.map
