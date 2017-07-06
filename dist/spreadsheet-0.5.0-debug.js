(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function SpreadSheetError() {
    this.name = 'SpreadSheetError';
    this.message = '发生了错误';
}

SpreadSheetError.prototype = new Error();
SpreadSheetError.prototype.constructor = SpreadSheetError;
SpreadSheetError.prototype.toString = function () {
    return this.name + ' => ' + this.message;
};

exports.SpreadSheetError = SpreadSheetError;

},{}],2:[function(require,module,exports){
"use strict";

var _settings = require("./settings");

var _core = require("./core");

var _core2 = _interopRequireDefault(_core);

var _polyfill = require("./polyfill");

var _polyfill2 = _interopRequireDefault(_polyfill);

var _Plugin = require("./plugins/Plugin");

var _Persistent = require("./plugins/persistent/Persistent");

var _Persistent2 = _interopRequireDefault(_Persistent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.globalSettings = _settings.globalSettings;
_core2.default.defaultSettings = _settings.defaultSettings;
_core2.default.version = '@@_version_@@';

_core2.default.plugins = {
    Plugin: _Plugin.Plugin,
    registerPlugin: _Plugin.registerPlugin
};

// 内置插件
(0, _Plugin.registerPlugin)('persistent', _Persistent2.default);

// 浏览器环境下的全局变量名。
window.BrickSpreadSheet = _core2.default;
window._UIProvider = {};
(0, _polyfill2.default)(window);

// TODO 提供更改全局变量名的方法，以防止全局变量冲突。

},{"./core":3,"./plugins/Plugin":18,"./plugins/persistent/Persistent":20,"./polyfill":22,"./settings":23}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Frame = require('./designer/Frame');

var _Frame2 = _interopRequireDefault(_Frame);

var _Workbook = require('./designer/Workbook');

var _Workbook2 = _interopRequireDefault(_Workbook);

var _common = require('./utils/common');

var _Plugin = require('./plugins/Plugin');

var _Emitter2 = require('./utils/Emitter');

var _Emitter3 = _interopRequireDefault(_Emitter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AUTO_ID = 1;

var SpreadSheet = function (_Emitter) {
    _inherits(SpreadSheet, _Emitter);

    /**
     * 类似 Excel 的电子表格。
     *
     * @constructor
     * @param rootElement
     * @param {object} userSettings - 电子表格的用户配置信息
     * @param {object} userSettings.workbook - Workbook 的配置
     * @param {object[]} userSettings.sheets - 配置所有初始 Sheet 页的数组
     * @param {boolean=} [displayMode=false] - 展示模式，不可编辑。
     */
    function SpreadSheet(rootElement, userSettings) {
        var displayMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        _classCallCheck(this, SpreadSheet);

        var _this = _possibleConstructorReturn(this, (SpreadSheet.__proto__ || Object.getPrototypeOf(SpreadSheet)).call(this));

        _this.rootElement = rootElement;
        _this.getUserSettings(userSettings);

        _this.settings = {};
        (0, _common.extend)(_this.settings, SpreadSheet.defaultSettings);
        (0, _common.extend)(_this.settings, _this.userSettings);

        _this.id = _this.settings.id || _this.getId();
        _this.displayMode = displayMode;

        _this._initPlugin();
        _this.frame = new _Frame2.default(_this, _this.settings.frame);
        _this.workbook = new _Workbook2.default(_this, _this.settings.workbook);
        _this._enablePlugin();
        return _this;
    }

    _createClass(SpreadSheet, [{
        key: 'getId',
        value: function getId() {
            // 不指定 id 时，尽量生成不可重复的 id（使用当前 iframe 自增变量配合随机字符串的方式）
            return this.id || SpreadSheet.globalSettings.idPrefix + AUTO_ID++ + '-' + (0, _common.randomString)();
        }
    }, {
        key: 'getRootElement',
        value: function getRootElement() {
            return this.rootElement;
        }
    }, {
        key: 'getDisplayMode',
        value: function getDisplayMode() {
            return this.displayMode;
        }

        /**
         * 获取用户传入的初始配置。
         * @param {string=} s - 表示用户配置的 JSON 字符串
         * @returns {Object}
         */

    }, {
        key: 'getUserSettings',
        value: function getUserSettings(s) {
            if (this.userSettings) {
                return this.userSettings;
            }
            if (s && typeof s === 'string') {
                this.userSettings = JSON.parse(s);
            } else {
                this.userSettings = s;
            }
            return this.userSettings;
        }

        /**
         * 获取 SpreadSheet 实际生效的配置信息。
         * @returns {Object}
         */

    }, {
        key: 'getSettings',
        value: function getSettings() {
            return this.settings;
        }

        /**
         * 获取可交换的中间数据，用于数据提交、解析转换等。
         * @param {boolean} [oragin=false] - 为 `true` 时获取原始 JavaScript 对象
         * @returns
         */

    }, {
        key: 'getExchangeData',
        value: function getExchangeData() {
            var oragin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            var w = this.workbook._getExchange();
            var f = this.frame._getExchange(); // TODO frame
            var o = {
                workbook: w,
                frame: f,
                id: this.getId()
            };
            return oragin ? o : JSON.stringify(o);
        }

        /**
         * 获取当前 SpreadSheet 对应的 Workbook 实例。
         * @returns {Workbook}
         */

    }, {
        key: 'getWorkbookInstance',
        value: function getWorkbookInstance() {
            return this.workbook;
        }

        /**
         * 获取当前 SpreadSheet 对应的 Frame 实例。
         * @returns {Frame}
         */

    }, {
        key: 'getFrameInstance',
        value: function getFrameInstance() {
            return this.frame;
        }
    }, {
        key: '_initPlugin',
        value: function _initPlugin() {
            var _this2 = this;

            this.plugins = new Map();
            (0, _Plugin.getAllPlugins)().forEach(function (P) {
                var p = new P(_this2);
                (0, _Plugin.validatePlugin)(p);
                _this2.plugins.set(p.__name__, p);
            });
        }
    }, {
        key: '_enablePlugin',
        value: function _enablePlugin() {
            this.plugins.forEach(function (p) {
                if (p.isEnable()) {
                    p.enable();
                }
            });
        }
    }]);

    return SpreadSheet;
}(_Emitter3.default);

exports.default = SpreadSheet;

},{"./designer/Frame":5,"./designer/Workbook":9,"./plugins/Plugin":18,"./utils/Emitter":24,"./utils/common":25}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 配置翻译类。
 * 框架内部使用，用户代码不应该调用它。
 *
 * @private
 */
var ConfigTranslator = function () {

    /**
     * 构造器
     *
     * @param {object} config
     * @param {Sheet} sheet
     */
    function ConfigTranslator(config, sheet) {
        _classCallCheck(this, ConfigTranslator);

        this.initialConfig = config;
        this.sheet = sheet;
    }

    /**
     * 翻译配置。
     * 中间数据格式的设计会尽量同时保证在 Excel 及 Web 页面中均便于处理，
     * 但不免存在一些 Web 中难以直接使用的数据格式，该方法即是完成此类数据格式
     * 的适配转换工作。
     *
     * @returns {object}
     */


    _createClass(ConfigTranslator, [{
        key: 'translate',
        value: function translate() {
            var settings = {};
            var proto = Object.getPrototypeOf(this);
            var property = Object.getOwnPropertyNames(proto);

            for (var i = 0; i < property.length; ++i) {
                if (property[i].startsWith('_trans')) {
                    this[property[i]].call(this, settings);
                }
            }
            return settings;
        }

        /**
         * handsontable 中的一些状态无法通过初始配置参数控制，
         * 只能在实例化之后调用相应的方法来恢复相应的状态，此方法
         * 即是完成该功能。
         */

    }, {
        key: 'initSheetState',
        value: function initSheetState() {
            var proto = Object.getPrototypeOf(this);
            var property = Object.getOwnPropertyNames(proto);

            for (var i = 0; i < property.length; ++i) {
                if (property[i].startsWith('_init')) {
                    this[property[i]].call(this);
                }
            }
        }

        // ------------------------ translate ------------------------------

    }, {
        key: '_transCell',
        value: function _transCell(settings) {
            var m = this.initialConfig.cellMetas;
            if (m) {
                settings.cell = [];
                for (var i = 0; i < m.length; ++i) {
                    var row = m[i];
                    for (var j = 0; j < row.length; ++j) {
                        var cellMeta = row[j];
                        if (cellMeta) {
                            var cell = {};
                            cell.row = cellMeta.row;
                            cell.col = cellMeta.col;

                            // dataType
                            if (cellMeta.dataType) {
                                for (var dt in cellMeta.dataType) {
                                    if (cellMeta.dataType.hasOwnProperty(dt)) {
                                        cell[dt] = cellMeta.dataType[dt];
                                    }
                                }
                                cell.type = cellMeta.dataType.typeName;
                                delete cell.typeName;
                            }

                            // styles
                            if (cellMeta.styles) {
                                if (cellMeta.styles.alignments) {
                                    var c = cellMeta.styles.alignments.join(' ht');
                                    cell.className = cell.className ? cell.className += ' ht' + c : 'ht' + c;
                                }
                                if (cellMeta.styles.fontFamily) {
                                    cell._style_fontFamily = cellMeta.styles.fontFamily;
                                }
                                if (cellMeta.styles.fontSize) {
                                    cell._style_fontSize = cellMeta.styles.fontSize;
                                }
                                if (cellMeta.styles.color) {
                                    cell._style_color = cellMeta.styles.color;
                                }
                                if (cellMeta.styles.backgroundColor) {
                                    cell._style_backgroundColor = cellMeta.styles.backgroundColor;
                                }
                                if (cellMeta.styles.fontStyle) {
                                    cell.className = cell.className ? cell.className += ' ssd-font-' + cellMeta.styles.fontStyle : 'ssd-font-' + cellMeta.styles.fontStyle;
                                }
                                if (cellMeta.styles.fontWeight) {
                                    cell.className = cell.className ? cell.className += ' ssd-font-bold' : 'ssd-font-bold';
                                }
                                if (cellMeta.styles.textDecoration) {
                                    cell.className = cell.className ? cell.className += ' ssd-font-underline' : 'ssd-font-underline';
                                }
                            }
                            settings.cell.push(cell);
                        }
                    }
                }
            }
        }
    }, {
        key: '_transData',
        value: function _transData(settings) {
            var s = this.initialConfig.data;
            if (s) {
                // hotTable 在有 data 的情况下只能显示有数据的行列，这对于设计器来说并不方便使用，
                // 故填充空数据以撑起表格至 initRows * initCols 的大小。
                //    if (s.length < this.sheet.initRows) {
                //        let formerCol = s.length;
                //        s.length = this.sheet.initRows;
                //        s.fill([], formerCol);
                //    }
                //    for (let i = 0; i < s.length; ++i) {
                //        let row = s[i];
                //        if (row.length < this.sheet.initCols) {
                //            let formerRow = row.length;
                //            row.length = this.sheet.initCols;
                //            row.fill('', formerRow);
                //        }
                //    }

                // 使用 hot API 完成上述功能
                settings.minRows = this.sheet.initRows;
                settings.minCols = this.sheet.initCols;

                settings.data = s;
            }
        }

        // 列宽

    }, {
        key: '_transColWidths',
        value: function _transColWidths(settings) {
            var w = this.initialConfig.colWidths;
            if (w) {
                settings.colWidths = w;
            }
        }

        // 行高

    }, {
        key: '_transRowHeights',
        value: function _transRowHeights(settings) {
            var h = this.initialConfig.rowHeights;
            if (h) {
                settings.rowHeights = h;
            }
        }

        // 边框

    }, {
        key: '_transBorders',
        value: function _transBorders(settings) {
            var s = this.initialConfig.borders;
            if (s) {
                settings.customBorders = s;
            }
        }

        // 合并单元格

    }, {
        key: '_transMergeCells',
        value: function _transMergeCells(settings) {
            var s = this.initialConfig.mergeCells;
            if (s) {
                settings.mergeCells = s;
            }
        }

        // ------------------------ initState ------------------------------

        // 选区

    }, {
        key: '_initSelection',
        value: function _initSelection() {
            var s = this.initialConfig.selection;
            if (s) {
                this.sheet.select(s.row, s.col, s.endRow, s.endCol);
            } else {
                this.sheet.select(0, 0);
            }
        }
    }]);

    return ConfigTranslator;
}();

exports.default = ConfigTranslator;

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ContextMenu = require('./frame/ContextMenu');

var _ContextMenu2 = _interopRequireDefault(_ContextMenu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 电子表格设计器中，除了 Workbook 外的组件管理器，
 * 包含菜单栏、工具栏、侧边栏、右键菜单等等。
 */
var Frame = function () {
  function Frame(instance, config) {
    _classCallCheck(this, Frame);

    this.spreadSheet = instance;
    /**
     *
     * @type {ContextMenu}
     */
    this.contextMenu = new _ContextMenu2.default(instance);
  }

  _createClass(Frame, [{
    key: '_getExchange',
    value: function _getExchange() {}
  }]);

  return Frame;
}();

exports.default = Frame;

},{"./frame/ContextMenu":12}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _common = require('../utils/common.js');

var _ConfigTranslator = require('./ConfigTranslator.js');

var _ConfigTranslator2 = _interopRequireDefault(_ConfigTranslator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Handsontable 组件的适配类
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var HotTableAdaptor = function (_Handsontable) {
    _inherits(HotTableAdaptor, _Handsontable);

    /**
     *
     * @param {HTMLElement} rootElement
     * @param {object} config - 原始配置信息
     * @param {object} extConfig - 附加的配置信息
     * @param {Sheet} sheet - 对应的 sheet 实例
     */
    function HotTableAdaptor(rootElement, config, extConfig, sheet) {
        _classCallCheck(this, HotTableAdaptor);

        var hotSettings = {};
        var translator = new _ConfigTranslator2.default(config, sheet);
        var settings = translator.translate();

        var frame = sheet.workbook.spreadSheet.getFrameInstance();
        var displayMode = sheet.workbook.spreadSheet.getDisplayMode();
        var menuItems = frame.contextMenu.menuItems;
        var contextMenu = {};
        contextMenu.items = frame.contextMenu.getMenuItems4HotTable();
        contextMenu.callback = function (sheet) {
            return function (key, options) {
                if (menuItems.has(key)) {
                    var item = menuItems.get(key);
                    if (item.handler) {
                        item.handler.call(this, sheet, options.start, options.end, options);
                    }
                }
            };
        }(sheet);
        HotTableAdaptor._preference.contextMenu = contextMenu;

        (0, _common.extend)(hotSettings, HotTableAdaptor._preference);
        (0, _common.extend)(hotSettings, settings);
        (0, _common.extend)(hotSettings, extConfig);

        if (displayMode) {
            hotSettings.colHeaders = false;
            hotSettings.rowHeaders = false;
        }

        var _this = _possibleConstructorReturn(this, (HotTableAdaptor.__proto__ || Object.getPrototypeOf(HotTableAdaptor)).call(this, rootElement, hotSettings));

        _this._translator = translator;

        // handontable 每次 render 的时候，不保留 td 的状态，因此通过该事件重建一些样式。
        //noinspection ES6ModulesDependencies
        Handsontable.hooks.add('beforeRenderer', function (TD, row, col, prop, value, cellProperties) {
            TD.style.color = cellProperties._style_color || '';
            TD.style.fontFamily = cellProperties._style_fontFamily || '';
            TD.style.fontSize = cellProperties._style_fontSize || '';
            TD.style.backgroundColor = cellProperties._style_backgroundColor || '';
        }, _this);

        /*
         * 将 Handsontable 的所有事件都委托给 SpreadSheet 后会有些卡。
         * 只好将 Handsontable.hooks.getRegistered() 换成 ECP 项目需要的。
         */
        ['afterSelectionEnd'].forEach(function (hook) {
            //noinspection ES6ModulesDependencies
            Handsontable.hooks.add(hook, function () {
                var args = [];
                args.push(hook);
                args.push(sheet);
                args.push.apply(args, [].slice.call(arguments));
                var cxt = sheet.workbook.spreadSheet;
                cxt.emit.apply(cxt, args);
            }, _this);
        });
        return _this;
    }

    _createClass(HotTableAdaptor, [{
        key: 'destroy',
        value: function destroy() {
            _get(HotTableAdaptor.prototype.__proto__ || Object.getPrototypeOf(HotTableAdaptor.prototype), 'destroy', this).call(this);
            delete this._translator;
        }
    }]);

    return HotTableAdaptor;
}(Handsontable);

/**
 * 预设配置。
 * @private
 */


HotTableAdaptor._preference = {
    outsideClickDeselects: false,
    contextMenu: true,

    rowHeaders: true,
    colHeaders: true,

    manualColumnResize: true,
    manualRowResize: true,

    tableClassName: 'ssd-handsontable',

    customBorders: true,

    xFormulas: true
};

exports.default = HotTableAdaptor;

},{"../utils/common.js":25,"./ConfigTranslator.js":4}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _HotTableAdaptor = require('./HotTableAdaptor');

var _HotTableAdaptor2 = _interopRequireDefault(_HotTableAdaptor);

var _SheetError = require('./SheetError');

var _Sheet_exchange = require('./ext/Sheet_exchange');

var _Sheet_helper = require('./ext/Sheet_helper');

var _common = require('../utils/common');

var _Emitter = require('../utils/Emitter');

var _Emitter2 = _interopRequireDefault(_Emitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var INIT_ROWS = 150; // Sheet 初始可显示的行数
var INIT_COLS = 50; // Sheet 初始可显示的列数

// Webstorm IDE 的语法检查或 souremap 解析时不支持直接写到类的 extends 后。
var Mixin = (0, _Sheet_helper.SheetHelper)((0, _Sheet_exchange.Exchange)(_Emitter2.default));

/**
 * 工作表
 *
 * @fires Sheet#afterRename
 * @fires Sheet#afterRenameCancel
 */

var Sheet = function (_Mixin) {
    _inherits(Sheet, _Mixin);

    /**
     * 构造 Sheet 实例，用户代码不应该直接调用它，
     * 而是使用 Workbook.createSheet() 方法构造。
     *
     * @param {Workbook} workbook
     * @param {object} config
     * @private
     */
    function Sheet(workbook, config) {
        _classCallCheck(this, Sheet);

        /**
         * sheet 所在的工作表
         * @type {Workbook}
         */
        var _this = _possibleConstructorReturn(this, (Sheet.__proto__ || Object.getPrototypeOf(Sheet)).call(this));

        _this.workbook = workbook;
        _this.$$view = workbook.$$view;
        _this.settings = config;
        _this.sheetName = config.name;

        _this.initRows = INIT_ROWS;
        _this.initCols = INIT_COLS;

        _this.fx = {}; // TODO

        _this._render();
        return _this;
    }

    /**
     * @private
     */


    _createClass(Sheet, [{
        key: '_render',
        value: function _render() {
            this.$$view.appendTab(this.sheetName);

            var _$$view$_hotTables$ge = this.$$view._hotTables.get(this.sheetName),
                container = _$$view$_hotTables$ge.container,
                width = _$$view$_hotTables$ge.width,
                height = _$$view$_hotTables$ge.height;

            /**
             * @type {Handsontable}
             */

            this.handsontable = new _HotTableAdaptor2.default(container, this.settings, {
                width: width,
                height: height,
                readOnly: this.workbook.spreadSheet.getDisplayMode(),
                startRows: this.initRows,
                startCols: this.initCols,
                _isHotTableAdaptor: true,
                _sheet: this
            }, this);
            this.handsontable._translator.initSheetState();
            this.$$view.hideContent(this.getName());
        }

        /**
         * 获取当前 sheet 的名字
         * @returns {string}
         */

    }, {
        key: 'getName',
        value: function getName() {
            return this.sheetName;
        }

        /**
         * 激活当前 sheet 页
         */

    }, {
        key: 'active',
        value: function active() {
            this.workbook.activeSheet = this.getName();
            this.$$view.activeTab(this.getName());
            this.handsontable.render();
        }

        /**
         * 检测当前 sheet 是否被激活
         * @returns {boolean}
         */

    }, {
        key: 'isActive',
        value: function isActive() {
            return this.workbook.activeSheet === this.getName();
        }

        /**
         * 关闭 sheet 页
         */

    }, {
        key: 'close',
        value: function close() {
            this.workbook.closeSheet(this.getName());
        }

        /**
         * 销毁当前 sheet
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            this.handsontable.destroy();
            this.workbook.sheets.delete(this.getName());
            delete this.workbook;
            delete this.$$view;
        }

        /**
         * 给 sheet 页重命名
         * @param name - 新名字
         */

    }, {
        key: 'rename',
        value: function rename(name) {
            this.workbook.renameSheet(this.getName(), name);
        }

        /**
         * 选中 sheet 中的某区域。
         * 不指定 toRow 、toCol 时则选中对应的单元格。
         * @param {int} fromRow - 起始行
         * @param {int} fromCol - 起始列
         * @param {int} [toRow] - 终止行
         * @param {int} [toCol] - 终止列
         */

    }, {
        key: 'select',
        value: function select(fromRow, fromCol, toRow, toCol) {
            toRow = toRow || fromRow;
            toCol = toCol || fromCol;
            this.handsontable.selectCell(fromRow, fromCol, toRow, toCol, false);
        }

        /**
         * 获得当前 sheet 的选区
         * @returns {{row, col, endRow, endCol}}
         */

    }, {
        key: 'getSelection',
        value: function getSelection() {
            var selection = this.handsontable.getSelected();
            return {
                row: selection[0],
                col: selection[1],
                endRow: selection[2],
                endCol: selection[3]
            };
        }

        /**
         * 合并单元格
         * TIP: handsontable 官方合并功能不能正确处理已有的合并区域，故做重新计算。
         * @param {int} row - 起始行
         * @param {int} col - 起始列
         * @param {int} rowspan - 待合并的行数
         * @param {int} colspan - 待合并的列数
         */
        // TODO 最大行列数限制

    }, {
        key: 'mergeCells',
        value: function mergeCells(row, col, rowspan, colspan) {
            var r = 0;
            var cover = [];
            var mergeCells = this.handsontable.getSettings().mergeCells;

            var r1 = [row, col, row + rowspan - 1, col + colspan - 1];

            for (var i = mergeCells.length; i; --i) {
                var f = mergeCells[i - 1];
                var r2 = [f.row, f.col, f.row + f.rowspan - 1, f.col + f.colspan - 1];

                // 与原区域存在完全重叠
                if (_common.Coordinate.isEqual(r1, r2)) {
                    r = 1;
                    break;
                }
                // 是原区域的子集
                if (_common.Coordinate.isSubset(r1, r2)) {
                    r = 2;
                    break;
                }
                // 覆盖原区域（此时可能与另一个原区域交集或完全覆盖）
                if (_common.Coordinate.isSuperset(r1, r2)) {
                    cover.push(i - 1);
                    r = 3;
                    continue;
                }
                // 与原区域存在交集(不含子集、超集情况)
                if (_common.Coordinate.intersection(r1, r2)) {
                    r = 4;
                }
            }

            if (r === 0 || r === 3) {
                if (r === 3) {
                    // 这种情况下一定存在已经合并过的单元格
                    for (var _i = 0; _i < cover.length; ++_i) {
                        mergeCells.splice(cover[_i], 1);
                    }
                }
                mergeCells = mergeCells || [];
                mergeCells.push({
                    row: row,
                    col: col,
                    rowspan: rowspan,
                    colspan: colspan
                });
                this.handsontable.updateSettings({
                    mergeCells: mergeCells
                });
            } else if (r === 2 || r === 4) {
                throw new _SheetError.SheetError('\u7ED9\u5B9A\u7684\u5408\u5E76\u533A\u57DF\u4E0D\u5408\u6CD5: [' + row + ', ' + col + ', ' + rowspan + ', ' + colspan + ']');
            }
        }

        /**
         * 取消单元格合并
         * @param {int} row - 起始行
         * @param {int} col - 起始列
         * @param {int} rowspan - 待合并的行数
         * @param {int} colspan - 待合并的列数
         */

    }, {
        key: 'unMergeCells',
        value: function unMergeCells(row, col, rowspan, colspan) {
            var merged = this.handsontable.getSettings().mergeCells;
            var mergeCells = [];
            if (merged && merged.length) {
                for (var i = 0; i < merged.length; ++i) {
                    if (_common.Coordinate.isSubset([merged[i].row, merged[i].col, merged[i].row + merged[i].rowspan - 1, merged[i].col + merged[i].colspan - 1], [row, col, row + rowspan - 1, col + colspan - 1])) {
                        continue;
                    }
                    mergeCells.push(merged[i]);
                }
            }
            this.handsontable.updateSettings({
                mergeCells: mergeCells.length === 0 ? false : mergeCells
            });
        }
    }, {
        key: 'spliceClass',
        value: function spliceClass(selection, newClassName) {
            for (var _len = arguments.length, classNames = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                classNames[_key - 2] = arguments[_key];
            }

            var _this2 = this;

            this._walkonCellMetas(selection, function (row, col, cellMeta) {
                return {
                    className: (_this2._removeFormerClass(cellMeta.className, classNames) + ' ' + newClassName).trim()
                };
            }, { className: newClassName });
        }

        /**
         * 设置字体加粗
         * @param {boolean} [value=true] `true` 为加粗，`false` 取消加粗
         * @param {object} selection - 待设置的选区
         * @param {int} selection.row
         * @param {int} selection.col
         * @param {int} [selection.endRow]
         * @param {int} [selection.endCol]
         */

    }, {
        key: 'setFontBold',
        value: function setFontBold() {
            var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
            var selection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getSelection();

            if (value) {
                this.spliceClass(selection, 'ssd-font-bold', 'ssd-font-bold');
            } else {
                this.spliceClass(selection, '', 'ssd-font-bold');
            }
            this.handsontable.render();
        }

        /**
         * 设置斜体字
         * @param {boolean} [value=true]
         * @param {object} selection - 待设置的选区
         * @param {int} selection.row
         * @param {int} selection.col
         * @param {int} [selection.endRow]
         * @param {int} [selection.endCol]
         */

    }, {
        key: 'setFontItalic',
        value: function setFontItalic() {
            var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
            var selection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getSelection();

            if (value) {
                this.spliceClass(selection, 'ssd-font-italic', 'ssd-font-italic');
            } else {
                this.spliceClass(selection, '', 'ssd-font-italic');
            }
            this.handsontable.render();
        }

        /**
         * 设置字体下划线
         * @param {boolean} [value=true]
         * @param selection - 待设置的选区
         * @param {int} selection.row
         * @param {int} selection.col
         * @param {int} [selection.endRow]
         * @param {int} [selection.endCol]
         */

    }, {
        key: 'setFontUnderline',
        value: function setFontUnderline() {
            var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
            var selection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getSelection();

            if (value) {
                this.spliceClass(selection, 'ssd-font-underline', 'ssd-font-underline');
            } else {
                this.spliceClass(selection, '', 'ssd-font-underline');
            }
            this.handsontable.render();
        }

        /**
         * 设置字体颜色
         * TIP 如果 “handontable 直接通过 getCell 获得 TD 后设置样式”，当再次 render 时会失效。
         * @param value
         * @param selection
         */

    }, {
        key: 'setFontColor',
        value: function setFontColor() {
            var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var selection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getSelection();

            this._walkonCellMetas(selection, function () {
                return {
                    _style_color: value
                };
            }, { _style_color: value });
            this.handsontable.render();
        }

        /**
         * 字体类型
         * @param value
         * @param selection
         */

    }, {
        key: 'setFontFamily',
        value: function setFontFamily() {
            var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var selection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getSelection();

            this._walkonCellMetas(selection, function () {
                return {
                    _style_fontFamily: value
                };
            }, { _style_fontFamily: value });
            this.handsontable.render();
        }

        /**
         * 字体大小
         * @param value - 需要指定单位，如 12px
         * @param selection
         */

    }, {
        key: 'setFontSize',
        value: function setFontSize(value) {
            var selection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getSelection();

            this._walkonCellMetas(selection, function () {
                return {
                    _style_fontSize: value
                };
            }, { _style_fontSize: value });
            this.handsontable.render();
        }

        /**
         * 设置背景色
         * @param value
         * @param selection
         */

    }, {
        key: 'setBackgroundColor',
        value: function setBackgroundColor() {
            var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var selection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getSelection();

            this._walkonCellMetas(selection, function () {
                return {
                    _style_backgroundColor: value
                };
            }, { _style_backgroundColor: value });
            this.handsontable.render();
        }

        /**
         * FIXME handsontable 的 BUG 尚未处理，源码复杂，一时也不好扩展。
         * 设置边框
         * @param range - 边框范围，形如 `{form: {row: 1, col: 1}, to: {row: 3, col: 4}}` 的对象
         * @param top - 上边框，形如 `{width: 2, color: '#5292F7'}` 的对象
         * @param [right]
         * @param [bottom]
         * @param [left]
         */

    }, {
        key: 'setBorder',
        value: function setBorder(range, top, right, bottom, left) {
            var config = {
                range: range,
                top: top
            };
            config.right = right || top;
            config.bottom = bottom || top;
            config.left = left || config.right;

            var formerBorders = this.handsontable.getSettings().customBorders;
            if (formerBorders === true) {
                formerBorders = [];
            }
            formerBorders.push(config);

            // TODO customBorders cannot be updated via updateSettings
            // @see {@link https://github.com/handsontable/handsontable/issues/2002}
            this.handsontable.updateSettings({
                customBorders: formerBorders
            });
            //this.handsontable.runHooks('afterInit');
        }

        /**
         * 设置数据格式
         *
         * @param type - `text` | `date` | `numeric`
         * @param settings
         * @param selection
         */

    }, {
        key: 'setDataFormat',
        value: function setDataFormat() {
            var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'text';
            var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var selection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.getSelection();

            this._walkonCellMetas(selection, function (row, col, cellMeta) {
                var fType = cellMeta.type;

                if (fType === 'date') {
                    delete cellMeta.dateFormat;
                    delete cellMeta.defaultDate;
                    delete cellMeta.correctFormat;
                } else if (fType === 'numeric') {
                    delete cellMeta.format;
                    delete cellMeta.language;
                }
                cellMeta.type = type;

                // https://github.com/handsontable/handsontable/issues/4360
                delete cellMeta.renderer;
                delete cellMeta.editor;
                delete cellMeta.validator;
                return (0, _common.extend)(cellMeta, settings);
            }, { type: type });
            this.handsontable.render();
        }
    }]);

    return Sheet;
}(Mixin);

exports.default = Sheet;

/**
 * afterRename 事件。
 *
 * @event Sheet#afterRename
 * @type {Sheet}
 * @type {string}
 * @type {string}
 */

/**
 * afterRenameCancel 事件。
 *
 * @event Sheet#afterRenameCancel
 * @type {Sheet}
 * @type {string}
 * @type {string}
 */

},{"../utils/Emitter":24,"../utils/common":25,"./HotTableAdaptor":6,"./SheetError":8,"./ext/Sheet_exchange":10,"./ext/Sheet_helper":11}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SheetError = SheetError;

var _SpreadSheetError = require('../SpreadSheetError');

function SheetError(value) {
    this.name = 'SheetError';
    this.message = value;
}
SheetError.prototype = new _SpreadSheetError.SpreadSheetError();
SheetError.prototype.constructor = SheetError;

},{"../SpreadSheetError":1}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Tabs = require('./views/Tabs');

var _Tabs2 = _interopRequireDefault(_Tabs);

var _Sheet = require('./Sheet');

var _Sheet2 = _interopRequireDefault(_Sheet);

var _SheetError = require('./SheetError');

var _dataStructure = require('../utils/dataStructure');

var _common = require('../utils/common');

var _settings = require('../settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var regExp = _settings.globalSettings.sheet.sheetName;

/**
 * 工作簿。一个 Workbook 包含一个或多个 Sheet .
 */

var Workbook = function () {

    /**
     * Workbook 构造器
     * @param {SpreadSheet} instance
     * @param {object} config
     */
    function Workbook(instance, config) {
        var _this = this;

        _classCallCheck(this, Workbook);

        /**
         * @type {SpreadSheet}
         */
        this.spreadSheet = instance;
        /**
         * @type {CaseInsensitiveMap}
         */
        this.sheets = new _dataStructure.CaseInsensitiveMap();
        this.settings = config;

        this._initSettings(config);
        this.$$view = new _Tabs2.default(this);

        config.sheets.forEach(function (v) {
            return _this.createSheet(v);
        });

        // 根据初始化数据激活 sheet 页
        var toActive = this.getSheet(this.activeSheet);
        if (!toActive) {
            throw new _SheetError.SheetError('\u6307\u5B9A\u7684 activeSheet \u4E0D\u5B58\u5728: ' + this.activeSheet);
        }
        toActive.active();
    }

    /**
     *
     * @param settings
     * @private
     */


    _createClass(Workbook, [{
        key: '_initSettings',
        value: function _initSettings(settings) {
            var keys = Object.keys(settings);
            for (var i = 0, len = keys.length; i < len; ++i) {
                if (keys[i] === 'sheets') {
                    continue;
                }
                this[keys[i]] = settings[keys[i]];
            }
        }

        /**
         * 获取 Workbook 所属的电子表格的用户初始配置。
         * @returns {Object}
         */

    }, {
        key: 'getSettings',
        value: function getSettings() {
            return this.spreadSheet.getSettings();
        }

        /**
         * 获取当前 Workbook 的 id
         * @returns {string}
         */

    }, {
        key: 'getId',
        value: function getId() {
            return this.id || (this.id = this.spreadSheet.getId() + _settings.globalSettings.idSuffix4Workbook);
        }

        /**
         * 根据指定 sheet 名获取 sheet 实例
         * @param name
         * @returns {Sheet}
         */

    }, {
        key: 'getSheet',
        value: function getSheet(name) {
            return this.sheets.get(name);
        }

        /**
         * 获取当前 Workbook 下的所有 sheet 实例
         * @returns {CaseInsensitiveMap}
         */

    }, {
        key: 'getSheets',
        value: function getSheets() {
            return this.sheets;
        }

        /**
         * 获取所有 sheet 的名字
         * @returns {Iterator.<string>}
         */

    }, {
        key: 'getSheetNames',
        value: function getSheetNames() {
            return this.sheets.keys();
        }

        /**
         * 检验 sheet 是否已存在
         * @param name
         * @param {boolean} [exactly=false] - 是否使用精确大小写的 name
         * @returns {boolean}
         */

    }, {
        key: 'isSheetExist',
        value: function isSheetExist(name, exactly) {
            if (exactly) {
                return this.sheets.hasExact(name);
            }
            // return !!this.getSheet(name);
            return this.sheets.has(name);
        }

        /**
         * 生成 sheet 索引
         * @private
         * @returns {number}
         */

    }, {
        key: '_getAutoSheetIndex',
        value: function _getAutoSheetIndex() {
            if (!this.$$autoSheetIndex) {
                this.$$autoSheetIndex = 0;
            }
            return ++this.$$autoSheetIndex; // 从 1 开始
        }

        /**
         * 自动生成 sheet 名
         * @returns {string}
         * @private
         */

    }, {
        key: '_getAutoSheetName',
        value: function _getAutoSheetName() {
            var prefix = _settings.globalSettings.sheet.autoPrefix + ''; // 防止出现数字相加
            var name = prefix + this._getAutoSheetIndex();
            if (this.isSheetExist(name)) {
                return this._getAutoSheetName();
            }
            return name;
        }

        /**
         * 获取当前激活的 sheet 页
         * @returns {Sheet}
         */

    }, {
        key: 'getActiveSheet',
        value: function getActiveSheet() {
            return this.sheets.get(this.activeSheet);
        }

        /**
         * 创建新的 sheet 页
         * @param {object} [config] - sheet 页的配置信息
         * @returns {Sheet} 新创建的工作表
         */

    }, {
        key: 'createSheet',
        value: function createSheet(config) {
            if (config) {
                // 根据初始配置创建，name 不能为空
                this._validateSheetName(config.name);
            } else {
                // 用户操作创建，动态生成 name
                config = {};
                config.name = this._getAutoSheetName();
            }
            var newOne = new _Sheet2.default(this, config);
            this.sheets.set(config.name, newOne);
            return newOne;
        }

        /**
         * 销毁指定 sheet 页
         * @param {string | Sheet} sheet - sheet 名称或实例
         */

    }, {
        key: 'destroySheet',
        value: function destroySheet(sheet) {
            if (typeof sheet === 'string') {
                sheet = this.getSheet(sheet);
            }
            sheet.destroy();
        }

        /**
         * 给指定的 sheet 页重命名
         * @param {string} name1 - 待重命名的 sheet 页名字
         * @param {string} name2 - 新名字
         */
        // FIXME 编辑错位：
        // handsontable 在选中某单元格但没进入编辑时，会监听 document 上的 keydown 事件，
        // 造成修改 sheet 名时的文本框无法正确处理（会输入到表格中）
        // 暂时使用 input 的 select 代替 focus，迫使用户再次点击sheet名时才能修改。

    }, {
        key: 'renameSheet',
        value: function renameSheet(name1, name2) {
            var sheet = this.getSheet(name1);
            if (!sheet) {
                throw new _SheetError.SheetError('\u5DE5\u4F5C\u8868 "' + name1 + '" \u4E0D\u5B58\u5728');
            }
            if (name1 !== name2) {
                this._validateSheetName(name2, (0, _common.upperCase)(name1) === (0, _common.upperCase)(name2));
                sheet.sheetName = name2;
                if (this.activeSheet === name1) {
                    this.activeSheet = name2;
                }
                this.getSheets().delete(name1);
                this.getSheets().set(name2, sheet);
                this.$$view.tabRename(name1, name2);
            } else {
                this.$$view.tabRenameCancel(name1, name2);
            }
        }

        /**
         * 关闭指定 sheet 页
         */

    }, {
        key: 'closeSheet',
        value: function closeSheet(name) {
            var sheet = this.getSheet(name);
            if (!sheet) {
                throw new _SheetError.SheetError('\u65E0\u6CD5\u5173\u95ED\u4E0D\u5B58\u5728\u7684\u5DE5\u4F5C\u8868 "' + name + '" \u3002');
            }
            if (this.sheets.size() === 1) {
                throw new _SheetError.SheetError('\u65E0\u6CD5\u5173\u95ED\u4EC5\u6709\u7684\u4E00\u4E2A\u5DE5\u4F5C\u8868 "' + name + '" \u3002');
            }
            if (sheet.isActive()) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.sheets.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var k = _step.value;

                        if (k && k !== name) {
                            this.activeSheet = k;
                            this.getSheet(k).active();
                            break;
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
            this.sheets.delete(name);
            this.$$view.removeTab(name);
            this.destroySheet(sheet);
        }

        /**
         * 激活当前 workbook
         */

    }, {
        key: 'active',
        value: function active() {
            this.getActiveSheet().active();
        }

        /**
         * 激活指定 sheet
         * @param {string} sheetName
         */

    }, {
        key: 'activeSheet',
        value: function activeSheet(sheetName) {
            var sheet = this.getSheet(sheetName);
            if (sheet) {
                sheet.active();
            }
        }

        /**
         * 验证 sheet 名是否合法
         * @param {string} name
         * @param {boolean} exactly
         * @private
         */

    }, {
        key: '_validateSheetName',
        value: function _validateSheetName(name, exactly) {
            if (!name) {
                throw new _SheetError.SheetError('工作表的名称不能为空');
            }
            //  禁止一些特殊字符
            if (regExp.test(name)) {
                throw new _SheetError.SheetError('\u5DE5\u4F5C\u8868 "' + name + '" \u5305\u542B\u975E\u6CD5\u5B57\u7B26');
            }
            if (this.isSheetExist(name, exactly)) {
                throw new _SheetError.SheetError('\u5DE5\u4F5C\u8868 "' + name + '" \u5DF2\u5B58\u5728');
            }
        }
    }, {
        key: '_getExchange',
        value: function _getExchange() {
            var sheets = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.getSheets().toMap()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _step2$value = _slicedToArray(_step2.value, 2),
                        sheet = _step2$value[1];

                    sheet && sheets.push(sheet._getExchange());
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return {
                activeSheet: this.activeSheet,
                sheets: sheets
            };
        }
    }]);

    return Workbook;
}();

exports.default = Workbook;

},{"../settings":23,"../utils/common":25,"../utils/dataStructure":26,"./Sheet":7,"./SheetError":8,"./views/Tabs":16}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Exchange = exports.Exchange = function Exchange(Sup) {
    return function (_Sup) {
        _inherits(_class, _Sup);

        function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
        }

        _createClass(_class, [{
            key: '_getExchange',
            value: function _getExchange() {
                var _getDataMeta2 = this._getDataMeta(),
                    data = _getDataMeta2.data,
                    cells = _getDataMeta2.cells;

                var _getSizeEx2 = this._getSizeEx(),
                    heights = _getSizeEx2.heights,
                    widths = _getSizeEx2.widths;

                var mergeCells = this.handsontable.getSettings().mergeCells;

                if (mergeCells === false) {
                    mergeCells = null; // 避免强类型语言解析时无法处理动态类型
                }

                return {
                    name: this.getName(),
                    selection: this.getSelection(),
                    data: data.length ? data : []._,
                    rowHeights: heights,
                    colWidths: widths,
                    mergeCells: mergeCells,
                    cellMetas: cells
                };
            }
        }, {
            key: '_getStylesEx',
            value: function _getStylesEx(meta) {
                var ret = {};
                var alignments = this._getAlignmentEx(meta.className);
                if (alignments) {
                    ret.alignments = alignments;
                }
                this._getFontEx(meta, ret);
                this._getBgColorEx(meta, ret);
                return ret;
            }
        }, {
            key: '_getBgColorEx',
            value: function _getBgColorEx(meta, ret) {
                if (meta._style_backgroundColor) {
                    ret.backgroundColor = meta._style_backgroundColor;
                }
            }
        }, {
            key: '_getFontEx',
            value: function _getFontEx(meta, ret) {
                if (meta._style_fontFamily) {
                    ret.fontFamily = meta._style_fontFamily;
                }
                if (meta._style_fontSize) {
                    ret.fontSize = meta._style_fontSize;
                }
                if (meta.className && meta.className.contains('ssd-font-italic')) {
                    ret.fontStyle = 'italic';
                }
                if (meta.className && meta.className.contains('ssd-font-bold')) {
                    ret.fontWeight = 'bold';
                }
                if (meta.className && meta.className.contains('ssd-font-underline')) {
                    ret.textDecoration = 'underline';
                }
                if (meta._style_color) {
                    ret.color = meta._style_color;
                }
            }
        }, {
            key: '_getAlignmentEx',
            value: function _getAlignmentEx(className) {
                var alignment = [];
                if (className) {
                    className.contains('htLeft') && alignment.push('Left');
                    className.contains('htCenter') && alignment.push('Center');
                    className.contains('htRight') && alignment.push('Right');
                    className.contains('htJustify') && alignment.push('Justify');
                    className.contains('htTop') && alignment.push('Top');
                    className.contains('htMiddle') && alignment.push('Middle');
                    className.contains('htBottom') && alignment.push('Bottom');
                }
                return alignment.length ? alignment : false;
            }
        }, {
            key: '_getSizeEx',
            value: function _getSizeEx() {
                var hot = this.handsontable;
                var cols = Math.max(hot.countCols() - hot.countEmptyCols(true), 20);
                var rows = Math.max(hot.countRows() - hot.countEmptyRows(true), 50);
                var heights = [];
                var widths = [];

                for (var i = 0; i < rows; ++i) {
                    var h = hot.getRowHeight(i);
                    if (i === 0 && !h) {
                        // handsontable bug
                        h = 24;
                    }
                    heights.push(h);
                }
                for (var _i = 0; _i < cols; ++_i) {
                    widths.push(hot.getColWidth(_i));
                }
                return { heights: heights, widths: widths };
            }
        }, {
            key: '_getDataMeta',
            value: function _getDataMeta() {
                var hot = this.handsontable;
                var cols = hot.countCols() - hot.countEmptyCols(true);
                var rows = hot.countRows() - hot.countEmptyRows(true);
                var data = [];
                var cells = [];

                for (var i = 0; i < rows; ++i) {
                    var rowResult = [];
                    var rowCellMeta = [];

                    for (var j = 0; j < cols; ++j) {
                        var _sourceData = hot.getSourceDataAtCell(i, j);
                        var _meta = hot.getCellMeta(i, j);
                        var _data = hot.getDataAtCell(i, j);
                        var _cellMata = {};

                        _cellMata.row = i;
                        _cellMata.col = j;
                        _cellMata.isFormula = !!(_sourceData && (_sourceData + '').charAt(0) === '=');
                        _cellMata.sourceValue = _sourceData;
                        _cellMata.value = _data;

                        (function (o, m) {
                            //noinspection JSUnusedLocalSymbols,LoopStatementThatDoesntLoopJS
                            for (var x in o) {
                                m.styles = o;
                                return;
                            }
                        })(this._getStylesEx(_meta), _cellMata);

                        this._getDataType(_meta, _cellMata);

                        rowResult.push(_sourceData);
                        rowCellMeta.push(_cellMata);
                    }
                    data.push(rowResult);
                    cells.push(rowCellMeta);
                }
                return { data: data, cells: cells };
            }

            // TODO

        }, {
            key: '_getBordersEx',
            value: function _getBordersEx() {}

            // 数据格式 numeric、date 等

        }, {
            key: '_getDataType',
            value: function _getDataType(_meta, _cellMata) {
                var t = _meta.type;
                _cellMata.dataType = {};
                _cellMata.dataType.typeName = t;

                if (t === 'date') {
                    _cellMata.dataType.dateFormat = _meta.dateFormat;
                    _meta.defaultDate && (_cellMata.dataType.defaultDate = _meta.defaultDate);
                    _meta.correctFormat && (_cellMata.dataType.correctFormat = _meta.correctFormat);
                } else if (t === 'numeric') {
                    _cellMata.dataType.format = _meta.format;
                    _meta.language && (_cellMata.dataType.language = _meta.language);
                }
            }
        }]);

        return _class;
    }(Sup);
};

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SheetHelper = exports.SheetHelper = function SheetHelper(Sup) {
    return function (_Sup) {
        _inherits(_class, _Sup);

        function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
        }

        _createClass(_class, [{
            key: '_defaultSelection',


            // 选区默认值
            //   1. 选区可能从右下往左上选，此时 row > endRow
            //   2. endRow 及 endCol 可能不存在
            //（不需要关注选区方向时调用此方法进行预处理）
            value: function _defaultSelection(s) {
                s.row > s.endRow && (s.row = [s.endRow, s.endRow = s.row][0]);
                s.col > s.endCol && (s.col = [s.endCol, s.endCol = s.col][0]);

                return {
                    startRow: s.row,
                    endRow: s.endRow || s.row,
                    startCol: s.col,
                    endCol: s.endCol || s.col
                };
            }

            //noinspection JSUnusedGlobalSymbols

        }, {
            key: '_removeFormerClass',
            value: function _removeFormerClass(current) {
                if (!current) {
                    return '';
                }

                for (var _len = arguments.length, supported = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    supported[_key - 1] = arguments[_key];
                }

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = supported[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var clazz = _step.value;

                        current = current.split(clazz).join('');
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                return current.trim();
            }

            //noinspection JSUnusedGlobalSymbols

        }, {
            key: '_walkonCellMetas',
            value: function _walkonCellMetas(selection, callback, unhold) {
                var _defaultSelection2 = this._defaultSelection(selection),
                    startRow = _defaultSelection2.startRow,
                    endRow = _defaultSelection2.endRow,
                    startCol = _defaultSelection2.startCol,
                    endCol = _defaultSelection2.endCol;

                for (var i = startRow; i <= endRow; ++i) {
                    for (var j = startCol; j <= endCol; ++j) {
                        var cellMeta = this.handsontable.getCellMeta(i, j);
                        if (cellMeta) {
                            var newMeta = callback.call(this, i, j, cellMeta);
                            newMeta && this.handsontable.setCellMetaObject(i, j, newMeta);
                        } else {
                            unhold && this.handsontable.setCellMetaObject(i, j, unhold);
                        }
                    }
                }
            }

            //noinspection JSUnusedGlobalSymbols

        }, {
            key: '_walkonCells',
            value: function _walkonCells(selection, callback) {
                var _defaultSelection3 = this._defaultSelection(selection),
                    startRow = _defaultSelection3.startRow,
                    endRow = _defaultSelection3.endRow,
                    startCol = _defaultSelection3.startCol,
                    endCol = _defaultSelection3.endCol;

                for (var i = startRow; i <= endRow; ++i) {
                    for (var j = startCol; j <= endCol; ++j) {
                        var cellTD = this.handsontable.getCell(i, j, true);
                        if (cellTD) {
                            callback.call(this, i, j, cellTD);
                        }
                    }
                }
            }
        }, {
            key: '_walkonSelection',
            value: function _walkonSelection(selection, callback) {
                var _defaultSelection4 = this._defaultSelection(selection),
                    startRow = _defaultSelection4.startRow,
                    endRow = _defaultSelection4.endRow,
                    startCol = _defaultSelection4.startCol,
                    endCol = _defaultSelection4.endCol;

                for (var i = startRow; i <= endRow; ++i) {
                    for (var j = startCol; j <= endCol; ++j) {
                        callback.call(this, i, j);
                    }
                }
            }
        }]);

        return _class;
    }(Sup);
};

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ContextMenu_alignment = require('./ContextMenu_alignment');

var _ContextMenu_mergeCells = require('./ContextMenu_mergeCells');

var _ContextMenu_rowOrColumnResize = require('./ContextMenu_rowOrColumnResize');

/**
 * 电子表格右键菜单。
 */
function ContextMenu(spreadSheet) {
    this.spreadSheet = spreadSheet;
    /**
     *
     * @type {Map}
     */
    this.menuItems = new Map();
    this._init();
}

exports.default = ContextMenu;


ContextMenu.prototype.register = function (key, config, handler) {
    this.menuItems.set(key, {
        config: config,
        handler: handler
    });
};

/**
 * 获取 handsontable 需要的菜单配置项
 */
ContextMenu.prototype.getMenuItems4HotTable = function () {
    var _this = this;

    if (!this._hotTableItems) {
        this._hotTableItems = {};
        this.menuItems.forEach(function (_ref, key) {
            var config = _ref.config;
            return _this._hotTableItems[key] = config;
        });
    }
    return this._hotTableItems;
};

/*
 ### handsontable 自带右键功能：###
 row_above
 row_below
 hsep1
 col_left
 col_right
 hsep2
 remove_row
 remove_col
 hsep3
 undo
 redo
 make_read_only
 alignment
 borders
 */
ContextMenu.prototype._init = function () {
    var SEP = '---------';

    this.register('row_above', {
        name: '上方插入一行',
        disabled: function disabled() {
            // 调用者要确保此处 this  为当前 hotTable 实例
            // TODO 限制最大行数
            return false;
        }
    });

    this.register('row_below', {
        name: '下方插入一行'
    });

    this.register('col_left', {
        name: '左侧插入一列'
    });

    this.register('col_right', {
        name: '右侧插入一列'
    });

    this.register('hsep_bt_insert', SEP);

    // FIXME handsontable 自带的删除功能，在存在单元格合并时有BUG，改成自定义逻辑。
    this.register('remove_row', {
        name: '删除选中行',
        disabled: function disabled() {
            // TODO 限制最小行数
            return false;
        }
    });
    this.register('remove_col', {
        name: '删除选中列'
    });

    this.register('hsep_bt_remove', SEP);

    this.register('alignment', (0, _ContextMenu_alignment.alignmentItem)());
    this.register('row_resize', _ContextMenu_rowOrColumnResize.rowResize, _ContextMenu_rowOrColumnResize.rowResizeHandler);
    this.register('col_resize', _ContextMenu_rowOrColumnResize.colResize, _ContextMenu_rowOrColumnResize.colResizeHandler);

    this.register('hsep_bt_format', SEP);

    this.register('q_merge_cells', _ContextMenu_mergeCells.mergeCells, _ContextMenu_mergeCells.mergeCellsHandler);
    this.register('q_cancel_merge_cells', _ContextMenu_mergeCells.cancelMergeCells, _ContextMenu_mergeCells.cancelMergeCellsHandler);
};

},{"./ContextMenu_alignment":13,"./ContextMenu_mergeCells":14,"./ContextMenu_rowOrColumnResize":15}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.alignmentItem = alignmentItem;

var _i18n = require('../../i18n');

// https://github.com/handsontable/handsontable/issues/3807
function alignmentItem() {
    return {
        name: _i18n.MENU.S5,
        disabled: function disabled() {
            return !(this.getSelectedRange() && !this.selection.selectedHeader.corner);
        },
        submenu: {
            items: [{
                key: 'alignment:left',
                name: function name() {
                    var _this = this;

                    var hasClass = checkSelectionConsistency(this.getSelectedRange(), function (row, col) {
                        var className = _this.getCellMeta(row, col).className;
                        if (className && className.indexOf('htLeft') !== -1) {
                            return true;
                        }
                    });
                    return hasClass ? markLabelAsSelected(_i18n.MENU.S6) : _i18n.MENU.S6;
                },
                callback: function callback() {
                    var _this2 = this;

                    var range = this.getSelectedRange();
                    var stateBefore = getAlignmentClasses(range, function (row, col) {
                        return _this2.getCellMeta(row, col).className;
                    });
                    var type = 'horizontal';
                    var alignment = 'htLeft';
                    this.runHooks('beforeCellAlignment', stateBefore, range, type, alignment);
                    align(range, type, alignment, function (row, col) {
                        return _this2.getCellMeta(row, col);
                    });
                    this.render();
                },
                disabled: false
            }, {
                key: 'alignment:center',
                name: function name() {
                    var _this3 = this;

                    var hasClass = checkSelectionConsistency(this.getSelectedRange(), function (row, col) {
                        var className = _this3.getCellMeta(row, col).className;
                        if (className && className.indexOf('htCenter') !== -1) {
                            return true;
                        }
                    });
                    return hasClass ? markLabelAsSelected(_i18n.MENU.S7) : _i18n.MENU.S7;
                },
                callback: function callback() {
                    var _this4 = this;

                    var range = this.getSelectedRange();
                    var stateBefore = getAlignmentClasses(range, function (row, col) {
                        return _this4.getCellMeta(row, col).className;
                    });
                    var type = 'horizontal';
                    var alignment = 'htCenter';

                    this.runHooks('beforeCellAlignment', stateBefore, range, type, alignment);
                    align(range, type, alignment, function (row, col) {
                        return _this4.getCellMeta(row, col);
                    });
                    this.render();
                },
                disabled: false
            }, {
                key: 'alignment:right',
                name: function name() {
                    var _this5 = this;

                    var label = _i18n.MENU.S8;
                    var hasClass = checkSelectionConsistency(this.getSelectedRange(), function (row, col) {
                        var className = _this5.getCellMeta(row, col).className;

                        if (className && className.indexOf('htRight') !== -1) {
                            return true;
                        }
                    });

                    if (hasClass) {
                        label = markLabelAsSelected(label);
                    }

                    return label;
                },
                callback: function callback() {
                    var _this6 = this;

                    var range = this.getSelectedRange();
                    var stateBefore = getAlignmentClasses(range, function (row, col) {
                        return _this6.getCellMeta(row, col).className;
                    });
                    var type = 'horizontal';
                    var alignment = 'htRight';

                    this.runHooks('beforeCellAlignment', stateBefore, range, type, alignment);
                    align(range, type, alignment, function (row, col) {
                        return _this6.getCellMeta(row, col);
                    });
                    this.render();
                },
                disabled: false
            }, {
                key: 'alignment:justify',
                name: function name() {
                    var _this7 = this;

                    var label = _i18n.MENU.S9;
                    var hasClass = checkSelectionConsistency(this.getSelectedRange(), function (row, col) {
                        var className = _this7.getCellMeta(row, col).className;

                        if (className && className.indexOf('htJustify') !== -1) {
                            return true;
                        }
                    });

                    if (hasClass) {
                        label = markLabelAsSelected(label);
                    }

                    return label;
                },
                callback: function callback() {
                    var _this8 = this;

                    var range = this.getSelectedRange();
                    var stateBefore = getAlignmentClasses(range, function (row, col) {
                        return _this8.getCellMeta(row, col).className;
                    });
                    var type = 'horizontal';
                    var alignment = 'htJustify';

                    this.runHooks('beforeCellAlignment', stateBefore, range, type, alignment);
                    align(range, type, alignment, function (row, col) {
                        return _this8.getCellMeta(row, col);
                    });
                    this.render();
                },
                disabled: false
            }, {
                name: '---------'
            }, {
                key: 'alignment:top',
                name: function name() {
                    var _this9 = this;

                    var label = _i18n.MENU.S10;
                    var hasClass = checkSelectionConsistency(this.getSelectedRange(), function (row, col) {
                        var className = _this9.getCellMeta(row, col).className;
                        if (className && className.indexOf('htTop') !== -1) {
                            return true;
                        }
                    });

                    if (hasClass) {
                        label = markLabelAsSelected(label);
                    }
                    return label;
                },
                callback: function callback() {
                    var _this10 = this;

                    var range = this.getSelectedRange();
                    var stateBefore = getAlignmentClasses(range, function (row, col) {
                        return _this10.getCellMeta(row, col).className;
                    });
                    var type = 'vertical';
                    var alignment = 'htTop';

                    this.runHooks('beforeCellAlignment', stateBefore, range, type, alignment);
                    align(range, type, alignment, function (row, col) {
                        return _this10.getCellMeta(row, col);
                    });
                    this.render();
                },
                disabled: false
            }, {
                key: 'alignment:middle',
                name: function name() {
                    var _this11 = this;

                    var label = _i18n.MENU.S11;
                    var hasClass = checkSelectionConsistency(this.getSelectedRange(), function (row, col) {
                        var className = _this11.getCellMeta(row, col).className;

                        if (className && className.indexOf('htMiddle') !== -1) {
                            return true;
                        }
                    });

                    if (hasClass) {
                        label = markLabelAsSelected(label);
                    }

                    return label;
                },
                callback: function callback() {
                    var _this12 = this;

                    var range = this.getSelectedRange();
                    var stateBefore = getAlignmentClasses(range, function (row, col) {
                        return _this12.getCellMeta(row, col).className;
                    });
                    var type = 'vertical';
                    var alignment = 'htMiddle';

                    this.runHooks('beforeCellAlignment', stateBefore, range, type, alignment);
                    align(range, type, alignment, function (row, col) {
                        return _this12.getCellMeta(row, col);
                    });
                    this.render();
                },
                disabled: false
            }, {
                key: 'alignment:bottom',
                name: function name() {
                    var _this13 = this;

                    var label = _i18n.MENU.S12;
                    var hasClass = checkSelectionConsistency(this.getSelectedRange(), function (row, col) {
                        var className = _this13.getCellMeta(row, col).className;

                        if (className && className.indexOf('htBottom') !== -1) {
                            return true;
                        }
                    });

                    if (hasClass) {
                        label = markLabelAsSelected(label);
                    }

                    return label;
                },
                callback: function callback() {
                    var _this14 = this;

                    var range = this.getSelectedRange();
                    var stateBefore = getAlignmentClasses(range, function (row, col) {
                        return _this14.getCellMeta(row, col).className;
                    });
                    var type = 'vertical';
                    var alignment = 'htBottom';

                    this.runHooks('beforeCellAlignment', stateBefore, range, type, alignment);
                    align(range, type, alignment, function (row, col) {
                        return _this14.getCellMeta(row, col);
                    });
                    this.render();
                },
                disabled: false
            }]
        }
    };
}

function checkSelectionConsistency(range, comparator) {
    var result = false;
    if (range) {
        range.forAll(function (row, col) {
            if (comparator(row, col)) {
                result = true;
                return false;
            }
        });
    }
    return result;
}

function markLabelAsSelected(label) {
    return '<span class="selected">' + String.fromCharCode(10003) + '</span>' + label;
}

function getAlignmentClasses(range, callback) {
    var classes = {};
    for (var row = range.from.row; row <= range.to.row; row++) {
        for (var col = range.from.col; col <= range.to.col; col++) {
            if (!classes[row]) {
                classes[row] = [];
            }
            classes[row][col] = callback(row, col);
        }
    }
    return classes;
}

function align(range, type, alignment, cellDescriptor) {
    if (range.from.row === range.to.row && range.from.col === range.to.col) {
        applyAlignClassName(range.from.row, range.from.col, type, alignment, cellDescriptor);
    } else {
        for (var row = range.from.row; row <= range.to.row; row++) {
            for (var col = range.from.col; col <= range.to.col; col++) {
                applyAlignClassName(row, col, type, alignment, cellDescriptor);
            }
        }
    }
}

function applyAlignClassName(row, col, type, alignment, cellDescriptor) {
    var cellMeta = cellDescriptor(row, col);
    var className = alignment;

    if (cellMeta.className) {
        if (type === 'vertical') {
            className = prepareVerticalAlignClass(cellMeta.className, alignment);
        } else {
            className = prepareHorizontalAlignClass(cellMeta.className, alignment);
        }
    }
    cellMeta.className = className;
}

function prepareVerticalAlignClass(className, alignment) {
    if (className.indexOf(alignment) !== -1) {
        return className;
    }
    className = className.replace('htTop', '').replace('htMiddle', '').replace('htBottom', '').replace('  ', '');

    className += ' ' + alignment;
    return className;
}

function prepareHorizontalAlignClass(className, alignment) {
    if (className.indexOf(alignment) !== -1) {
        return className;
    }
    className = className.replace('htLeft', '').replace('htCenter', '').replace('htRight', '').replace('htJustify', '').replace('  ', '');

    className += ' ' + alignment;

    return className;
}

},{"../../i18n":17}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.cancelMergeCells = exports.mergeCells = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.mergeCellsHandler = mergeCellsHandler;
exports.cancelMergeCellsHandler = cancelMergeCellsHandler;

var _common = require('../../utils/common');

var _i18n = require('../../i18n');

var mergeCells = exports.mergeCells = {
    name: _i18n.MENU.S3,
    disabled: function disabled() {
        var _getSelected = this.getSelected(),
            _getSelected2 = _slicedToArray(_getSelected, 4),
            r1 = _getSelected2[0],
            c1 = _getSelected2[1],
            r2 = _getSelected2[2],
            c2 = _getSelected2[3];

        if (r1 === r2 && c1 === c2) {
            return true;
        }
        return !mergeCompare.call(this, 'isEqual');
    }
};

function mergeCellsHandler(sheet, start, end) {
    sheet.mergeCells(start.row, start.col, end.row - start.row + 1, end.col - start.col + 1);
}

var cancelMergeCells = exports.cancelMergeCells = {
    name: _i18n.MENU.S4,
    disabled: function disabled() {
        return mergeCompare.call(this, 'isSubset');
    }
};

function cancelMergeCellsHandler(sheet, start, end) {
    sheet.unMergeCells(start.row, start.col, end.row - start.row + 1, end.col - start.col + 1);
}

function mergeCompare(type) {
    var merged = this.getSettings().mergeCells;
    if (merged && merged.length) {
        for (var i = 0; i < merged.length; ++i) {
            var _merged$i = merged[i],
                row = _merged$i.row,
                col = _merged$i.col,
                rowspan = _merged$i.rowspan,
                colspan = _merged$i.colspan;

            if (_common.Coordinate[type]([row, col, row + rowspan - 1, col + colspan - 1], convertSelection(this.getSelected()))) {
                return false;
            }
        }
    }
    return true;
}

function convertSelection(s) {
    s[0] > s[2] && (s[0] = [s[2], s[2] = s[0]][0]);
    s[1] > s[3] && (s[1] = [s[3], s[3] = s[1]][0]);
    return s;
}

},{"../../i18n":17,"../../utils/common":25}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.colResize = exports.rowResize = undefined;
exports.rowResizeHandler = rowResizeHandler;
exports.colResizeHandler = colResizeHandler;

var _i18n = require('../../i18n');

// FIXME hot 处理 rowHeights/colWidths 与 manualRowResize/manualColumnResize 时存在缺陷
// https://github.com/handsontable/handsontable/issues/3301
// https://github.com/handsontable/handsontable/issues/4371
var rowResize = exports.rowResize = {
    name: _i18n.MENU.S1,
    hidden: function hidden() {
        return !this.getSelectedRange() || !this.selection.selectedHeader.rows;
    }
};

function rowResizeHandler(sheet, start, end) {
    var height = []._;

    start.row > end.row && (start.row = [end.row, end.row = start.row][0]);

    for (var i = start.row; i <= end.row; ++i) {
        if (!height) {
            height = sheet.handsontable.getRowHeight(i);
        } else if (height !== sheet.handsontable.getRowHeight(i)) {
            height = false;
            break;
        }
    }

    var val = height === false ? '' : height || 24;

    if (_UIProvider.prompt) {
        _UIProvider.prompt(_i18n.MENU.S13, val, function (result) {
            if (result) {
                setRowHeights(sheet, start.row, end.row, result);
            }
        });
    } else {
        var contextMenu = sheet.handsontable.getPlugin('contextMenu');
        contextMenu.close();
        var result = prompt(_i18n.MENU.S13, val);
        if (result !== null) {
            setRowHeights(sheet, start.row, end.row, result);
        }
    }
}

var colResize = exports.colResize = {
    name: _i18n.MENU.S2,
    hidden: function hidden() {
        return !this.getSelectedRange() || !this.selection.selectedHeader.cols;
    }
};

function colResizeHandler(sheet, start, end) {
    var width = []._;

    start.col > end.col && (start.col = [end.col, end.col = start.col][0]);

    for (var i = start.col; i <= end.col; ++i) {
        if (!width) {
            width = sheet.handsontable.getColWidth(i);
        } else if (width !== sheet.handsontable.getColWidth(i)) {
            width = false;
            break;
        }
    }

    var val = width === false ? '' : width || 50;

    if (_UIProvider.prompt) {
        _UIProvider.prompt(_i18n.MENU.S14, val, function (result) {
            if (result) {
                setColWidths(sheet, start.col, end.col, result);
            }
        });
    } else {
        var contextMenu = sheet.handsontable.getPlugin('contextMenu');
        contextMenu.close();
        var result = prompt(_i18n.MENU.S14, val);
        if (result !== null) {
            setColWidths(sheet, start.col, end.col, result);
        }
    }
}

function setRowHeights(sheet, start, end, value) {
    value = numbro().unformat(value) || 24;
    var rowHeights = sheet.handsontable.getSettings().rowHeights;
    for (var i = start; i <= end; ++i) {
        rowHeights[i] = value;
    }
    sheet.handsontable.updateSettings({ rowHeights: rowHeights });
}

function setColWidths(sheet, start, end, value) {
    value = numbro().unformat(value) || 50;
    var colWidths = sheet.handsontable.getSettings().colWidths;
    for (var i = start; i <= end; ++i) {
        colWidths[i] = value;
    }
    sheet.handsontable.updateSettings({ colWidths: colWidths });
}

},{"../../i18n":17}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _domHelper = require('../../utils/domHelper.js');

var _common = require('../../utils/common.js');

var _dataStructure = require('../../utils/dataStructure.js');

var _eventHelper = require('../../utils/eventHelper.js');

var _settings = require('../../settings.js');

var _i18n = require('../../i18n');

var _SheetError = require('.././SheetError');

var CLASS_CURRENT = 'current';
var CLASS_TABS = 'ssd-tabs';
var CLASS_CONTENT = 'ssd-tabs-content';
var CLASS_SECTION = 'ssd-tabs-section';
var CLASS_NAV = 'ssd-tabs-nav';
var CLASS_UL = 'ssd-tabs-ul';
var CLASS_LI = 'ssd-tabs-li';
var CLASS_FX = 'ssd-tabs-fx';

var animated = _settings.globalSettings.sheet.animated;
var regExp = _settings.globalSettings.sheet.sheetName;

/**
 * workbook 对应的视图，实际的 DOM 构成。
 * @private
 * @param {Workbook} workbook
 * @constructor
 */
function Tabs(workbook) {
    this.workbook = workbook;
    /**
     * @type {CaseInsensitiveMap}
     */
    this.liItems = new _dataStructure.CaseInsensitiveMap();
    this.sectionItems = new _dataStructure.CaseInsensitiveMap();
    this._hotTables = new Map();
    this.rootElement = workbook.spreadSheet.getRootElement();
    this.displayMode = workbook.spreadSheet.getDisplayMode();

    this.initDOM();
    this.initBox();
    this.render();
}

Tabs.prototype.render = function () {
    this.rootElement.appendChild(this.TABS);
};

/**
 * @private
 */
Tabs.prototype.initDOM = function () {
    this.TABS = document.createElement('div');
    this.CONTENT = document.createElement('div');
    this.NAV = document.createElement('nav');
    this.UL = document.createElement('ul');

    this.TABS.classList.add(CLASS_TABS);
    this.TABS.id = this.workbook.getId();
    this.CONTENT.classList.add(CLASS_CONTENT);
    this.NAV.classList.add(CLASS_NAV);
    this.UL.classList.add(CLASS_UL);

    this.TABS.appendChild(this.CONTENT);
    this.TABS.appendChild(this.NAV);
    this.NAV.appendChild(this.UL);

    // 增加 sheet 页的 button
    this.appendAddButton();
};

/**
 * @private
 */
Tabs.prototype.initBox = function () {
    var rootEl = this.workbook.spreadSheet.getRootElement();
    this.width = this.workbook.width || (0, _domHelper.outerWidth)(rootEl, false);
    this.height = this.workbook.height || (0, _domHelper.outerHeight)(rootEl, false);

    this.TABS.style.width = this.width + 'px';
    this.TABS.style.height = this.height + 'px';
};

/**
 * 增加一个 tab 页
 * @param {string} sheetName - sheet 名， 即 tab 页的标题
 */
Tabs.prototype.appendTab = function (sheetName) {
    var that = this;
    var li = document.createElement('li');
    var clazz = this.displayMode ? '' : 'close hairline';

    li.innerHTML = '\n        <a href="javascript:;">\n            <span>' + sheetName + '</span>\n            <span class="' + clazz + '"></span>\n        </a>\n    ';
    li.classList.add(CLASS_LI);
    li.setAttribute('data-sheet', sheetName);

    var activeTab = this.TABS.querySelector('.' + CLASS_CURRENT + '.' + CLASS_LI);
    if (activeTab) {
        (0, _domHelper.insertAfter)(activeTab, li);
    } else {
        this.UL.appendChild(li);
    }
    this.liItems.set(sheetName, li);

    li.addEventListener('click', function (e) {
        var sheetName = this.dataset.sheet;
        var sheet = that.workbook.getSheet(sheetName);
        sheet.active();
        (0, _eventHelper.stopImmediatePropagation)(e);
    });

    if (!this.displayMode) {
        li.addEventListener('dblclick', function (e) {
            that._onTabDblclick.call(that, this);
            (0, _eventHelper.stopImmediatePropagation)(e);
        });

        li.querySelector('.close').addEventListener('click', function (e) {
            var sheetName = li.dataset.sheet;
            try {
                that.workbook.closeSheet(sheetName);
            } catch (e) {
                if (e instanceof _SheetError.SheetError) {
                    alert(e.message);
                } else {
                    throw e;
                }
            }
            (0, _eventHelper.stopImmediatePropagation)(e);
        });
    }

    this.appendContent(sheetName);
};

/**
 * 增加一个 tab 页
 * @param {string} sheetName - sheet 名， 即 tab 页的标题
 */
Tabs.prototype.removeTab = function (sheetName) {
    var li = this.liItems.get(sheetName);
    this.UL.removeChild(li);
    this.liItems.delete(sheetName);

    this.removeContent(sheetName);
};

Tabs.prototype.appendAddButton = function () {
    var that = this;
    var li = document.createElement('li');
    var innerHtml = this.displayMode ? '&nbsp;' : '+';

    li.innerHTML = '<a href="javascript:;"><span>' + innerHtml + '</span></a>';
    li.classList.add(CLASS_LI);
    if (!this.displayMode) {
        li.classList.add('add-tab');
    }
    this.UL.appendChild(li);

    if (!this.displayMode) {
        li.addEventListener('click', function () {
            try {
                var newSheet = that.workbook.createSheet();
                newSheet.active();
            } catch (e) {
                if (e instanceof _SheetError.SheetError) {
                    alert(e.message);
                } else {
                    throw e;
                }
            }
        });
    }
};

/**
 * @param {HTMLElement} li
 * @private
 */
Tabs.prototype._onTabDblclick = function (li) {
    var that = this;
    var sheetName = li.dataset.sheet;
    var span = li.getElementsByTagName('span')[0];
    var input = document.createElement('input');

    input.setAttribute('type', 'text');
    input.value = sheetName;
    input.classList.add('editorial');
    input.style.width = (0, _domHelper.outerWidth)(span) + 20 + 'px'; // 名字太短时不好输入，增补20px

    input.addEventListener('blur', function () {
        var check = that._checkTabName(sheetName, this.value);
        if (check === true) {
            that.workbook.renameSheet(sheetName, this.value);
        } else {
            alert(check); // TODO alert 太丑
            that.tabRenameCancel(sheetName, this.value);
        }
    });
    input.addEventListener('keypress', function (event) {
        if (event.keyCode === 13) {
            this.blur();
        }
    });

    (0, _domHelper.empty)(span);
    span.appendChild(input);
    input.select();
};

Tabs.prototype._checkTabName = function (name1, name2) {
    if ((0, _common.isEmptyValue)(name2)) {
        return _i18n.WARNS.S1;
    }
    if (regExp.test(name2)) {
        return _i18n.WARNS.S2;
    }
    // 改成其它已有的sheet名
    if ((0, _common.upperCase)(name1) !== (0, _common.upperCase)(name2) && this.workbook.isSheetExist(name2)) {
        return _i18n.WARNS.S3;
    }
    return true;
};

// 改名时，DOM上的一些操作，进入此方法时代表已经做了合法验证。
Tabs.prototype.tabRename = function (name1, name2) {
    var li = this.liItems.get(name1);
    var span = li.getElementsByTagName('span')[0];
    (0, _domHelper.innerHTML)(span, name2);
    li.dataset.sheet = name2;
    this.liItems.set(name2, li);
    var section = this.sectionItems.get(name1);
    section.dataset.sheet = name2;
    this.sectionItems.delete(name1);
    this.sectionItems.set(name2, section);

    var sheetNow = this.workbook.getSheet(name2);
    sheetNow.emit('afterRename', sheetNow, name1, name2);
};

// 更名失败，将名字设为 name1, name2为失败的名字
Tabs.prototype.tabRenameCancel = function (name1, name2) {
    var li = this.liItems.get(name1);
    var span = li.getElementsByTagName('span')[0];
    (0, _domHelper.innerHTML)(span, name1);

    var sheetNow = this.workbook.getSheet(name1);
    sheetNow.emit('afterRenameCancel', sheetNow, name1, name2);
};

/**
 * 增加标签页对应的内容
 * @param {string} sheetName
 */
Tabs.prototype.appendContent = function (sheetName) {
    var section = document.createElement('section');
    var fx = document.createElement('div');
    var hot = document.createElement('div');

    section.setAttribute('data-sheet', sheetName);
    section.appendChild(fx);
    section.appendChild(hot);
    section.classList.add(CLASS_SECTION);
    animated && section.classList.add('ssd-animated-fast');

    this.CONTENT.appendChild(section);
    this.sectionItems.set(sheetName, section);

    this.appendFx(fx, sheetName);
    this.appendTable(hot, sheetName);
};

Tabs.prototype.removeContent = function (sheetName) {
    var section = this.sectionItems.get(sheetName);
    this.CONTENT.removeChild(section);
    this.sectionItems.delete(sheetName);
};

/**
 *
 * @param {string} sheetName
 */
Tabs.prototype.hideContent = function (sheetName) {
    var section = this.sectionItems.get(sheetName);
    section.style.display = 'none';
};

/**
 * TODO 公式输入框
 * @private
 * @param {HTMLElement} fx
 * @param {string} sheetName
 */
Tabs.prototype.appendFx = function (fx, sheetName) {
    fx.classList.add(CLASS_FX);
    fx.classList.add(CLASS_FX + '-' + sheetName);
};

/**
 * 假渲染 Hansontable 组件。
 * handsontable 的设计无法在DOM中计算视图，必须渲染rootElement之后才能生效。
 * 导致延迟渲染难以实现，有渲染性能问题时再解决。
 * 另外，渲染到先隐藏后显示的元素中时，也无法正常显示。
 * @private
 * @param hot
 * @param sheetName
 */
Tabs.prototype.appendTable = function (hot, sheetName) {
    var _this = this;

    this._hotTables.set(sheetName, {
        container: hot,
        width: this.width,
        height: function height() {
            return _this.height - (0, _domHelper.outerHeight)(_this.NAV);
        }
    });
};

/**
 * 激活指定的标签页
 * @param {string} sheetName - sheet 名
 */
Tabs.prototype.activeTab = function (sheetName) {
    var former = this.TABS.querySelector('.' + CLASS_CURRENT + '.' + CLASS_LI);
    former && former.classList.remove(CLASS_CURRENT);
    var li = this.liItems.get(sheetName);
    li.classList.add(CLASS_CURRENT);
    this.activeContent(sheetName);
};

/**
 * @private
 * @param {string} sheetName - sheet 名
 */
Tabs.prototype.activeContent = function (sheetName) {
    var section = this.sectionItems.get(sheetName);
    var former = this._formerActiveContent;
    if (former) {
        animated && former.classList.remove('fadeIn');
        former.style.display = 'none';
    }
    section.style.display = 'block';
    animated && section.classList.add('fadeIn');

    this._formerActiveContent = section;
};

exports.default = Tabs;

},{"../../i18n":17,"../../settings.js":23,"../../utils/common.js":25,"../../utils/dataStructure.js":26,"../../utils/domHelper.js":27,"../../utils/eventHelper.js":28,".././SheetError":8}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var WARNS = exports.WARNS = {
    S1: '工作表名不能为空白。',
    S2: '\u5DE5\u4F5C\u8868\u540D\u79F0\u5305\u542B\u65E0\u6548\u5B57\u7B26: :  / ? * [ ]\u3002',
    S3: '该名称已被使用，请尝试其他名称。'
};

var MENU = exports.MENU = {
    S1: '行高...',
    S2: '列宽...',
    S3: '单元格合并',
    S4: '取消单元格合并',
    S5: '对齐',
    S6: '左对齐',
    S7: '水平居中',
    S8: '右对齐',
    S9: '两端对齐',
    S10: '顶部对齐',
    S11: '垂直居中',
    S12: '底部对齐',
    S13: '请输入行高',
    S14: '请输入列宽'
};

},{}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Plugin = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.validatePlugin = validatePlugin;
exports.registerPlugin = registerPlugin;
exports.getPlugin = getPlugin;
exports.getAllPlugins = getAllPlugins;

var _PluginError = require('./PluginError');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _plugins = new Map();

/**
 * 插件基类
 */

var Plugin = function () {

    /**
     *
     * @param {SpreadSheet} spreadSheet
     */
    function Plugin(spreadSheet) {
        _classCallCheck(this, Plugin);

        /**
         * @type {SpreadSheet}
         */
        this.spreadsheet = spreadSheet;
        this.enabled = false;
    }

    // 暂时不考虑开放这个方法，用户定义的插件不能扩展 SpreadSheet 的 API


    _createClass(Plugin, [{
        key: '_registerMethod',
        value: function _registerMethod(name) {
            var _this = this;

            var proto = this.spreadsheet.constructor.prototype;
            proto[name] = function () {
                return _this[name]();
            };
        }
    }, {
        key: 'isEnable',
        value: function isEnable() {
            return false;
        }
    }, {
        key: 'enable',
        value: function enable() {}
    }, {
        key: 'destroy',
        value: function destroy() {}
    }]);

    return Plugin;
}();

exports.Plugin = Plugin;
function validatePlugin(p) {
    if (!p.enable) {
        throw new _PluginError.PluginError('插件必须包含启用方法：enable');
    }
    if (!p.destroy) {
        throw new _PluginError.PluginError('插件必须包含销毁方法：destroy');
    }
}

function registerPlugin(name, plugin) {
    _plugins.set(name, plugin);
    plugin.prototype.__name__ = name;
}

function getPlugin(name) {
    var p = _plugins.get(name);
    if (!p) {
        throw new _PluginError.PluginError('插件不存在：' + name);
    }
    return p;
}

/**
 * 获取所有插件
 * @returns {Map}
 */
function getAllPlugins() {
    return _plugins;
}

},{"./PluginError":19}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PluginError = PluginError;

var _SpreadSheetError = require('../SpreadSheetError');

function PluginError(value) {
    this.name = 'PluginError';
    this.message = value;
}
PluginError.prototype = new _SpreadSheetError.SpreadSheetError();
PluginError.prototype.constructor = PluginError;

},{"../SpreadSheetError":1}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Plugin2 = require('../Plugin');

var _Storage = require('./Storage');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Persistent = function (_Plugin) {
    _inherits(Persistent, _Plugin);

    function Persistent(ssd) {
        _classCallCheck(this, Persistent);

        var _this = _possibleConstructorReturn(this, (Persistent.__proto__ || Object.getPrototypeOf(Persistent)).call(this, ssd));

        var settings = _this.spreadsheet.settings;

        if (settings.persistent === true) {
            // persistent 为 `true` 时，使用默认方案
            /**
             * 电子表格本地持久化时使用的 key
             */
            _this.persistentKey = ssd.getId();
        } else {
            // TODO persistent 为对象时，提供 localStorage、session 等方案及超时时间等相关配置
            _this.persistentKey = settings.persistent.key;
        }

        _this.spreadsheet.settings = _Storage.Storage.load(_this.persistentKey) || settings;

        _this._registerMethod('saveState');
        return _this;
    }

    _createClass(Persistent, [{
        key: 'isEnable',
        value: function isEnable() {
            return !!this.spreadsheet.getSettings().persistent;
        }
    }, {
        key: 'enable',
        value: function enable() {
            _get(Persistent.prototype.__proto__ || Object.getPrototypeOf(Persistent.prototype), 'enable', this).call(this);
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            _get(Persistent.prototype.__proto__ || Object.getPrototypeOf(Persistent.prototype), 'destroy', this).call(this);
        }
    }, {
        key: 'saveState',
        value: function saveState() {
            var data = this.spreadsheet.getExchangeData();
            _Storage.Storage.save(this.persistentKey, data);
        }
    }]);

    return Persistent;
}(_Plugin2.Plugin);

exports.default = Persistent;

},{"../Plugin":18,"./Storage":21}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 存储方案
 */
var Storage = function () {
    function Storage() {
        _classCallCheck(this, Storage);
    }

    _createClass(Storage, null, [{
        key: 'save',
        value: function save(key, value) {
            if (typeof value !== 'string') {
                value = JSON.stringify(value);
            }
            window.localStorage.setItem(Storage.PREFIX + key, value);
        }
    }, {
        key: 'load',
        value: function load(key) {
            var val = window.localStorage.getItem(Storage.PREFIX + key);
            try {
                return JSON.parse(val);
            } catch (e) {
                return val;
            }
        }
    }, {
        key: 'remove',
        value: function remove(key) {
            if (window.localStorage[Storage.PREFIX + key]) {
                window.localStorage.removeItem(Storage.PREFIX + key);
            }
        }
    }, {
        key: 'clear',
        value: function clear() {
            window.localStorage.clear();
        }
    }]);

    return Storage;
}();

Storage.PREFIX = '$$brick!storage-';

exports.Storage = Storage;

},{}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = polyfill;
/**
 *
 * @param _g 全局变量（即浏览器环境下的 window 对象）
 */
function polyfill(_g) {

    // --------------------------------------------- es6 polyfill

    // Number.isNaN()
    if (!_g.Number.isNaN) {
        _g.Number.isNaN = function (x) {
            return x !== x;
        };
    }

    // String.contains()
    if (typeof _g.String.prototype.contains === 'undefined') {
        _g.String.prototype.contains = function (str) {
            return !!~this.indexOf(str);
        };
    }

    // String.startsWith()
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }

    // --------------------------------------------- IE polyfill

    // HTMLElement.classList
    if (!('classList' in document.documentElement)) {
        Object.defineProperty(HTMLElement.prototype, 'classList', {
            get: function get() {
                var self = this;

                function update(fn) {
                    return function (value) {
                        var classes = self.className.split(/\s+/g);
                        var index = classes.indexOf(value);

                        fn(classes, index, value);
                        self.className = classes.join(' ');
                    };
                }

                return {
                    add: update(function (classes, index, value) {
                        if (!~index) {
                            classes.push(value);
                        }
                    }),

                    remove: update(function (classes, index) {
                        if (~index) {
                            classes.splice(index, 1);
                        }
                    }),

                    toggle: update(function (classes, index, value) {
                        if (~index) {
                            classes.splice(index, 1);
                        } else {
                            classes.push(value);
                        }
                    }),

                    contains: function contains(value) {
                        return !!~self.className.split(/\s+/g).indexOf(value);
                    },

                    item: function item(i) {
                        return self.className.split(/\s+/g)[i] || null;
                    }
                };
            }
        });
    }
}

},{}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * 全局配置。
 */
var globalSettings = {
    idPrefix: 'brick-ssd-',
    idSuffix4Workbook: '-workbook',

    sheet: {

        /**
         * 自动生成工作表名称时的前缀(工作表1, 工作表2...)
         */
        autoPrefix: '工作表',

        /**
         * sheet 名称中的非法字符。微软没有相关文档，以下是 Apache POI 的说明：
         *
         * Note that sheet name in Excel must not exceed 31 characters
         * and must not contain any of the any of the following characters:
         *    - 0x0000
         *    - 0x0003
         *    - colon (:)
         *    - backslash (\)
         *    - asterisk (*)
         *    - question mark (?)
         *    - forward slash (/)
         *    - opening square bracket ([)
         *    - closing square bracket (])
         *
         */
        sheetName: /[\\/\?\*:\[\]'"]/,

        animated: false
    }

};

/**
 * 默认配置
 */
var defaultSettings = {

    workbook: {
        activeSheet: '工作表1',
        sheets: [{
            name: '工作表1'
        }]
    },

    persistent: true

};

exports.globalSettings = globalSettings;
exports.defaultSettings = defaultSettings;

},{}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * 事件发射器
 *
 * PS: nodejs 的系统类库 Emitter 过大，不适合在浏览器环境使用。故引入一个简易实现。
 * @constructor
 */
function Emitter() {
    // 保持此函数为空，以便于继承
}

Emitter.prototype = {

    /**
     * 订阅事件
     * @param {string} name - 事件名
     * @param {function} callback - 事件回调函数
     * @param [ctx] - 设置调用 callback 时的上下文
     * @returns {Emitter}
     */
    on: function on(name, callback, ctx) {
        var e = this.e || (this.e = {});

        (e[name] || (e[name] = [])).push({
            fn: callback,
            ctx: ctx
        });

        return this;
    },

    /**
     * 订阅一次性事件
     * @param {string} name - 事件名
     * @param {function} callback - 事件回调函数
     * @param ctx - 设置调用 callback 时的上下文
     * @returns {*|Emitter}
     */
    once: function once(name, callback, ctx) {
        var self = this;

        function listener() {
            self.off(name, listener);
            callback.apply(ctx, arguments);
        }

        listener._ = callback;
        return this.on(name, listener, ctx);
    },

    /**
     * 发射指定事件
     * @param {string} name - 事件名
     * @returns {Emitter}
     */
    emit: function emit(name) {
        var data = [].slice.call(arguments, 1);
        var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
        var i = 0;
        var len = evtArr.length;

        for (i; i < len; i++) {
            evtArr[i].fn.apply(evtArr[i].ctx, data);
        }

        return this;
    },

    /**
     * 注销事件
     * @param {string} name - 事件名
     * @param {function} [callback] - 绑定事件时的回调函数，如果不指定则注销所有 `name` 事件
     * @returns {Emitter}
     */
    off: function off(name, callback) {
        var e = this.e || (this.e = {});
        var evts = e[name];
        var liveEvents = [];

        if (evts && callback) {
            for (var i = 0, len = evts.length; i < len; i++) {
                if (evts[i].fn !== callback && evts[i].fn._ !== callback) {
                    liveEvents.push(evts[i]);
                }
            }
        }

        // 防止内存溢出
        liveEvents.length ? e[name] = liveEvents : delete e[name];

        return this;
    },

    /**
     * 获取全局唯一事件发射器
     */
    getGlobalEmitter: function () {
        var instance = new Emitter();
        return function () {
            return instance;
        };
    }()
};

exports.default = Emitter;

/**
 * 全局唯一事件发射器
 */

var GlobalEmitter = exports.GlobalEmitter = Emitter.prototype.getGlobalEmitter();

},{}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.extend = extend;
exports.objectEach = objectEach;
exports.emptyFunction = emptyFunction;
exports.upperCase = upperCase;
exports.upperCaseFirst = upperCaseFirst;
exports.randomString = randomString;
exports.isEmptyValue = isEmptyValue;


// ------------------------------------- object

function extend(target, extension) {
    objectEach(extension, function (value, key) {
        target[key] = value;
    });
    return target;
}

function objectEach(object, iteratee) {
    for (var key in object) {
        if (!object.hasOwnProperty || object.hasOwnProperty && object.hasOwnProperty(key)) {
            if (iteratee(object[key], key, object) === false) {
                break;
            }
        }
    }
    return object;
}

// ------------------------------------- function

var _emptyFn = function _emptyFn() {};

/**
 * 获取空函数。
 * @param newOne 默认 `false`，当为 `true` 时将返回一个新的空函数。
 * @returns {Function}
 */
function emptyFunction() {
    var newOne = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    if (newOne) {
        return function () {};
    }
    return _emptyFn;
}

// ------------------------------------- string


function upperCase(str) {
    return str.toUpperCase();
}

function upperCaseFirst(str) {
    return str.replace(/^\S/g, function (f) {
        return upperCase(f);
    });
}

/**
 * 生成一个长度为 16 的随机字符串
 * @returns {*}
 */
function randomString() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + s4() + s4();
}

// ------------------------------------- mixed

/**
 * 判断是否为`空`值。
 * PS：此方法的判断逻辑作为单元格是否为空的依据。
 * @param value
 * @returns {boolean}
 */
function isEmptyValue(value) {
    return value === '' || value === null || typeof value === 'undefined';
}

// ------------------------------------- coordinate


var c_isEqual = function c_isEqual(r1, r2) {
    return r1[0] === r2[0] && r1[1] === r2[1] && r1[2] === r2[2] && r1[3] === r2[3];
};

var c_intersection = function c_intersection(r1, r2) {
    var x1 = Math.max(r1[0], r2[0]);
    var y1 = Math.max(r1[1], r2[1]);
    var x2 = Math.min(r1[2], r2[2]);
    var y2 = Math.min(r1[3], r2[3]);

    if (x1 <= x2 && y1 <= y2) {
        return [x1, y1, x2, y2];
    }
    return false;
};

var c_set = function c_set(t) {
    return function (r1, r2) {
        var ins = c_intersection(r1, r2);
        if (ins) {
            return c_isEqual(ins, t === 'sub' ? r1 : r2);
        }
        return false;
    };
};

var Coordinate = exports.Coordinate = {

    /**
     * 判断坐标范围 r1 是否与 r2 相等。
     * @param {Array} r1
     * @param {int} r1[0] - 坐标范围 r1 的起始行坐标
     * @param {int} r1[1] - 坐标范围 r1 的起始列坐标
     * @param {int} r1[2] - 坐标范围 r1 的终止行坐标
     * @param {int} r1[3] - 坐标范围 r1 的终止列坐标
     * @param {Array} r2
     * @param {int} r2[0] - 坐标范围 r2 的起始行坐标
     * @param {int} r2[1] - 坐标范围 r2 的起始列坐标
     * @param {int} r2[2] - 坐标范围 r2 的终止行坐标
     * @param {int} r2[3] - 坐标范围 r2 的终止列坐标
     * @returns {boolean}
     */
    isEqual: c_isEqual,

    /**
     * 判断坐标范围 r1 是否与 r2 存在交集。
     * @returns {boolean}
     */
    intersection: c_intersection,

    /**
     * 判断坐标范围 r1 是否是 r2 的子集。
     * @returns {boolean}
     */
    isSubset: c_set('sub'),

    /**
     * 判断坐标范围 r1 是否是 r2 的超集。
     * @returns {boolean}
     */
    isSuperset: c_set('sup')
};

// -------------------------------------

},{}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Stack = exports.CaseInsensitiveMap = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _common = require('./common.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 大小写不敏感的 Map
 */
var CaseInsensitiveMap = function () {
    function CaseInsensitiveMap(iterable) {
        _classCallCheck(this, CaseInsensitiveMap);

        this._map = new Map(iterable);
        this._keys = {};
    }

    _createClass(CaseInsensitiveMap, [{
        key: 'get',
        value: function get(key) {
            var acKey = this._keys[(0, _common.upperCase)(key)];
            return this._map.get(acKey);
        }
    }, {
        key: 'set',
        value: function set(key, value) {
            this._keys[(0, _common.upperCase)(key)] = key;
            return this._map.set(key, value);
        }
    }, {
        key: 'has',
        value: function has(key) {
            return this._keys[(0, _common.upperCase)(key)];
        }
    }, {
        key: 'hasExact',
        value: function hasExact(key) {
            return this._map.has(key);
        }
    }, {
        key: 'clear',
        value: function clear() {
            this._keys = {};
            return this._map.clear();
        }
    }, {
        key: 'delete',
        value: function _delete(key) {
            var acKey = this._keys[(0, _common.upperCase)(key)];
            delete this._keys[(0, _common.upperCase)(key)];
            return this._map.delete(acKey);
        }
    }, {
        key: 'entries',
        value: function entries() {
            return this._map.entries();
        }
    }, {
        key: 'forEach',
        value: function forEach(callbackfn, thisArg) {
            return this._map.forEach(callbackfn, thisArg);
        }

        /**
         *
         * @returns {Iterator.<string>}
         */

    }, {
        key: 'keys',
        value: function keys() {
            return this._map.keys();
        }
    }, {
        key: 'values',
        value: function values() {
            return this._map.values();
        }
    }, {
        key: 'toMap',
        value: function toMap() {
            return this._map;
        }
    }, {
        key: 'size',
        value: function size() {
            return this._map.size;
        }
    }]);

    return CaseInsensitiveMap;
}();

/**
 * Stack
 */


var Stack = function () {
    function Stack() {
        var initial = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        _classCallCheck(this, Stack);

        this.items = initial;
    }

    _createClass(Stack, [{
        key: 'push',
        value: function push() {
            var _items;

            (_items = this.items).push.apply(_items, arguments);
        }
    }, {
        key: 'pop',
        value: function pop() {
            return this.items.pop();
        }
    }, {
        key: 'peek',
        value: function peek() {
            return this.isEmpty() ? void 0 : this.items[this.items.length - 1];
        }
    }, {
        key: 'isEmpty',
        value: function isEmpty() {
            return !this.size();
        }
    }, {
        key: 'size',
        value: function size() {
            return this.items.length;
        }
    }]);

    return Stack;
}();

exports.CaseInsensitiveMap = CaseInsensitiveMap;
exports.Stack = Stack;

},{"./common.js":25}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.innerHTML = innerHTML;
exports.insertAfter = insertAfter;
exports.closest = closest;
exports.empty = empty;
exports.outerHeight = outerHeight;
exports.outerWidth = outerWidth;
var textContextSupport = document.createTextNode('test').textContent ? true : false;

var REG_HTML_CHARACTERS = /(<(.*)>|&(.*);)/;

/**
 * 能同时兼容文本节点的 innerHTML 方法。
 *
 * @returns {void}
 */
function innerHTML(element, content) {
    if (REG_HTML_CHARACTERS.test(content)) {
        element.innerHTML = content;
    } else {
        var child = element.firstChild;
        if (child && child.nodeType === 3 && child.nextSibling === null) {
            if (textContextSupport) {
                child.textContent = content;
            } else {
                child.data = content;
            }
        } else {
            empty(element);
            element.appendChild(document.createTextNode(content));
        }
    }
}

/**
 * 在指定节点后插入节点
 * @param element
 * @param content
 */
function insertAfter(element, content) {
    if (REG_HTML_CHARACTERS.test(content)) {
        element.insertAdjacentHTML('afterend', content);
    } else {
        if (content.nodeType === 1) {
            if (element.nextSibling) {
                element.parentNode.insertBefore(content, element.nextSibling);
            } else {
                element.parentNode.appendChild(content);
            }
        } else {
            // TODO
        }
    }
}

function closest(element, selector) {
    var ret;
    do {
        element = element.parentNode;
        if (!element || !element.ownerDocument || (ret = element.querySelector(selector))) {
            break;
        }
    } while (element);

    return ret;
}

/**
 * 清空指定元素的所有子节点。
 *
 * @param element
 * @returns {void}
 */
function empty(element) {
    var child;
    while (child = element.lastChild) {
        // jshint ignore:line
        try {
            element.removeChild(child);
        } catch (e) {
            // TODO 暂时这样处理 https://bugzilla.mozilla.org/show_bug.cgi?id=559561
        }
    }
}

/**
 * 返回指定元素的外高度（包括 padding、border 及可选的 margin 值）。
 *
 * @param el
 * @param {Boolean} withMargin - 高度中是否包括 margin 值
 * @returns {number}
 */
function outerHeight(el) {
    var withMargin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    var height = el.offsetHeight;
    var style;

    if (withMargin === false) {
        return height;
    }
    style = getComputedStyle(el);
    height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    return height;
}

/**
 * 返回指定元素的外宽度（包括 padding、border 及可选的 margin 值）。
 *
 * @param el
 * @param {Boolean} withMargin - 宽度中是否包括 margin 值
 * @returns {number}
 */
function outerWidth(el) {
    var withMargin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    var width = el.offsetWidth;
    var style;

    if (withMargin === false) {
        return width;
    }
    style = getComputedStyle(el);
    width += parseInt(style.marginLeft) + parseInt(style.marginRight);
    return width;
}

},{}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.stopImmediatePropagation = stopImmediatePropagation;
exports.stopPropagation = stopPropagation;
/**
 * 阻止其它监听被调用。
 * @param {Event} event
 */
function stopImmediatePropagation(event) {
    event.isImmediatePropagationEnabled = false;
    event.cancelBubble = true;
}

/**
 * 阻止事件冒泡。
 * @param {Event} event
 */
function stopPropagation(event) {
    if (typeof event.stopPropagation === 'function') {
        event.stopPropagation();
    } else {
        event.cancelBubble = true;
    }
}

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvU3ByZWFkU2hlZXRFcnJvci5qcyIsInNyYy9icm93c2VyLmpzIiwic3JjL2NvcmUuanMiLCJzcmMvZGVzaWduZXIvQ29uZmlnVHJhbnNsYXRvci5qcyIsInNyYy9kZXNpZ25lci9GcmFtZS5qcyIsInNyYy9kZXNpZ25lci9Ib3RUYWJsZUFkYXB0b3IuanMiLCJzcmMvZGVzaWduZXIvU2hlZXQuanMiLCJzcmMvZGVzaWduZXIvU2hlZXRFcnJvci5qcyIsInNyYy9kZXNpZ25lci9Xb3JrYm9vay5qcyIsInNyYy9kZXNpZ25lci9leHQvU2hlZXRfZXhjaGFuZ2UuanMiLCJzcmMvZGVzaWduZXIvZXh0L1NoZWV0X2hlbHBlci5qcyIsInNyYy9kZXNpZ25lci9mcmFtZS9Db250ZXh0TWVudS5qcyIsInNyYy9kZXNpZ25lci9mcmFtZS9Db250ZXh0TWVudV9hbGlnbm1lbnQuanMiLCJzcmMvZGVzaWduZXIvZnJhbWUvQ29udGV4dE1lbnVfbWVyZ2VDZWxscy5qcyIsInNyYy9kZXNpZ25lci9mcmFtZS9Db250ZXh0TWVudV9yb3dPckNvbHVtblJlc2l6ZS5qcyIsInNyYy9kZXNpZ25lci92aWV3cy9UYWJzLmpzIiwic3JjL2kxOG4uanMiLCJzcmMvcGx1Z2lucy9QbHVnaW4uanMiLCJzcmMvcGx1Z2lucy9QbHVnaW5FcnJvci5qcyIsInNyYy9wbHVnaW5zL3BlcnNpc3RlbnQvUGVyc2lzdGVudC5qcyIsInNyYy9wbHVnaW5zL3BlcnNpc3RlbnQvU3RvcmFnZS5qcyIsInNyYy9wb2x5ZmlsbC5qcyIsInNyYy9zZXR0aW5ncy5qcyIsInNyYy91dGlscy9FbWl0dGVyLmpzIiwic3JjL3V0aWxzL2NvbW1vbi5qcyIsInNyYy91dGlscy9kYXRhU3RydWN0dXJlLmpzIiwic3JjL3V0aWxzL2RvbUhlbHBlci5qcyIsInNyYy91dGlscy9ldmVudEhlbHBl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R0Q7Ozs7Ozs7QUFPTyxTQUFTLFVBQVQsQ0FBb0IsRUFBcEIsRUFBMkM7QUFBQSxRQUFuQixVQUFtQix1RUFBTixJQUFNOztBQUM5QyxRQUFJLFFBQVEsR0FBRyxXQUFmO0FBQ0EsUUFBSSxLQUFKOztBQUVBLFFBQUksZUFBZSxLQUFuQixFQUEwQjtBQUN0QixlQUFPLEtBQVA7QUFDSDtBQUNELFlBQVEsaUJBQWlCLEVBQWpCLENBQVI7QUFDQSxhQUFTLFNBQVMsTUFBTSxVQUFmLElBQTZCLFNBQVMsTUFBTSxXQUFmLENBQXRDO0FBQ0EsV0FBTyxLQUFQO0FBQ0g7Ozs7Ozs7O1FDL0dlLHdCLEdBQUEsd0I7UUFTQSxlLEdBQUEsZTtBQWJoQjs7OztBQUlPLFNBQVMsd0JBQVQsQ0FBa0MsS0FBbEMsRUFBeUM7QUFDNUMsVUFBTSw2QkFBTixHQUFzQyxLQUF0QztBQUNBLFVBQU0sWUFBTixHQUFxQixJQUFyQjtBQUNIOztBQUVEOzs7O0FBSU8sU0FBUyxlQUFULENBQXlCLEtBQXpCLEVBQWdDO0FBQ25DLFFBQUksT0FBTyxNQUFNLGVBQWIsS0FBaUMsVUFBckMsRUFBaUQ7QUFDN0MsY0FBTSxlQUFOO0FBQ0gsS0FGRCxNQUVPO0FBQ0gsY0FBTSxZQUFOLEdBQXFCLElBQXJCO0FBQ0g7QUFDSiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJmdW5jdGlvbiBTcHJlYWRTaGVldEVycm9yKCkge1xuICAgIHRoaXMubmFtZSA9ICdTcHJlYWRTaGVldEVycm9yJztcbiAgICB0aGlzLm1lc3NhZ2UgPSAn5Y+R55Sf5LqG6ZSZ6K+vJztcbn1cblxuU3ByZWFkU2hlZXRFcnJvci5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblNwcmVhZFNoZWV0RXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3ByZWFkU2hlZXRFcnJvcjtcblNwcmVhZFNoZWV0RXJyb3IucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLm5hbWUgKyAnID0+ICcgKyB0aGlzLm1lc3NhZ2U7XG59O1xuXG5leHBvcnQge1NwcmVhZFNoZWV0RXJyb3J9XG5cbiIsImltcG9ydCB7ZGVmYXVsdFNldHRpbmdzLCBnbG9iYWxTZXR0aW5nc30gZnJvbSBcIi4vc2V0dGluZ3NcIjtcbmltcG9ydCBTcHJlYWRTaGVldCBmcm9tIFwiLi9jb3JlXCI7XG5pbXBvcnQgcG9seWZpbGwgZnJvbSBcIi4vcG9seWZpbGxcIjtcbmltcG9ydCB7UGx1Z2luLCByZWdpc3RlclBsdWdpbn0gZnJvbSBcIi4vcGx1Z2lucy9QbHVnaW5cIjtcbmltcG9ydCBQZXJzaXN0ZW50IGZyb20gXCIuL3BsdWdpbnMvcGVyc2lzdGVudC9QZXJzaXN0ZW50XCI7XG5cblNwcmVhZFNoZWV0Lmdsb2JhbFNldHRpbmdzID0gZ2xvYmFsU2V0dGluZ3M7XG5TcHJlYWRTaGVldC5kZWZhdWx0U2V0dGluZ3MgPSBkZWZhdWx0U2V0dGluZ3M7XG5TcHJlYWRTaGVldC52ZXJzaW9uID0gJ0BAX3ZlcnNpb25fQEAnO1xuXG5TcHJlYWRTaGVldC5wbHVnaW5zID0ge1xuICAgIFBsdWdpbjogUGx1Z2luLFxuICAgIHJlZ2lzdGVyUGx1Z2luOiByZWdpc3RlclBsdWdpblxufTtcblxuLy8g5YaF572u5o+S5Lu2XG5yZWdpc3RlclBsdWdpbigncGVyc2lzdGVudCcsIFBlcnNpc3RlbnQpO1xuXG4vLyDmtY/op4jlmajnjq/looPkuIvnmoTlhajlsYDlj5jph4/lkI3jgIJcbndpbmRvdy5Ccmlja1NwcmVhZFNoZWV0ID0gU3ByZWFkU2hlZXQ7XG53aW5kb3cuX1VJUHJvdmlkZXIgPSB7fTtcbnBvbHlmaWxsKHdpbmRvdyk7XG5cbi8vIFRPRE8g5o+Q5L6b5pu05pS55YWo5bGA5Y+Y6YeP5ZCN55qE5pa55rOV77yM5Lul6Ziy5q2i5YWo5bGA5Y+Y6YeP5Yay56qB44CCXG5cbiIsImltcG9ydCBGcmFtZSBmcm9tICcuL2Rlc2lnbmVyL0ZyYW1lJztcbmltcG9ydCBXb3JrYm9vayBmcm9tICcuL2Rlc2lnbmVyL1dvcmtib29rJztcbmltcG9ydCB7ZXh0ZW5kLCBlbXB0eUZ1bmN0aW9uLCByYW5kb21TdHJpbmd9IGZyb20gJy4vdXRpbHMvY29tbW9uJztcbmltcG9ydCB7Z2V0QWxsUGx1Z2lucywgdmFsaWRhdGVQbHVnaW59IGZyb20gJy4vcGx1Z2lucy9QbHVnaW4nO1xuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi91dGlscy9FbWl0dGVyJztcblxudmFyIEFVVE9fSUQgPSAxO1xuXG5jbGFzcyBTcHJlYWRTaGVldCBleHRlbmRzIEVtaXR0ZXIge1xuXG4gICAgLyoqXG4gICAgICog57G75Ly8IEV4Y2VsIOeahOeUteWtkOihqOagvOOAglxuICAgICAqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHJvb3RFbGVtZW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHVzZXJTZXR0aW5ncyAtIOeUteWtkOihqOagvOeahOeUqOaIt+mFjee9ruS/oeaBr1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB1c2VyU2V0dGluZ3Mud29ya2Jvb2sgLSBXb3JrYm9vayDnmoTphY3nva5cbiAgICAgKiBAcGFyYW0ge29iamVjdFtdfSB1c2VyU2V0dGluZ3Muc2hlZXRzIC0g6YWN572u5omA5pyJ5Yid5aeLIFNoZWV0IOmhteeahOaVsOe7hFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbj19IFtkaXNwbGF5TW9kZT1mYWxzZV0gLSDlsZXnpLrmqKHlvI/vvIzkuI3lj6/nvJbovpHjgIJcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihyb290RWxlbWVudCwgdXNlclNldHRpbmdzLCBkaXNwbGF5TW9kZSA9IGZhbHNlKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5yb290RWxlbWVudCA9IHJvb3RFbGVtZW50O1xuICAgICAgICB0aGlzLmdldFVzZXJTZXR0aW5ncyh1c2VyU2V0dGluZ3MpO1xuXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7fTtcbiAgICAgICAgZXh0ZW5kKHRoaXMuc2V0dGluZ3MsIFNwcmVhZFNoZWV0LmRlZmF1bHRTZXR0aW5ncyk7XG4gICAgICAgIGV4dGVuZCh0aGlzLnNldHRpbmdzLCB0aGlzLnVzZXJTZXR0aW5ncyk7XG5cbiAgICAgICAgdGhpcy5pZCA9IHRoaXMuc2V0dGluZ3MuaWQgfHwgdGhpcy5nZXRJZCgpO1xuICAgICAgICB0aGlzLmRpc3BsYXlNb2RlID0gZGlzcGxheU1vZGU7XG5cbiAgICAgICAgdGhpcy5faW5pdFBsdWdpbigpO1xuICAgICAgICB0aGlzLmZyYW1lID0gbmV3IEZyYW1lKHRoaXMsIHRoaXMuc2V0dGluZ3MuZnJhbWUpO1xuICAgICAgICB0aGlzLndvcmtib29rID0gbmV3IFdvcmtib29rKHRoaXMsIHRoaXMuc2V0dGluZ3Mud29ya2Jvb2spO1xuICAgICAgICB0aGlzLl9lbmFibGVQbHVnaW4oKTtcbiAgICB9XG5cbiAgICBnZXRJZCgpIHtcbiAgICAgICAgLy8g5LiN5oyH5a6aIGlkIOaXtu+8jOWwvemHj+eUn+aIkOS4jeWPr+mHjeWkjeeahCBpZO+8iOS9v+eUqOW9k+WJjSBpZnJhbWUg6Ieq5aKe5Y+Y6YeP6YWN5ZCI6ZqP5py65a2X56ym5Liy55qE5pa55byP77yJXG4gICAgICAgIHJldHVybiB0aGlzLmlkIHx8IFNwcmVhZFNoZWV0Lmdsb2JhbFNldHRpbmdzLmlkUHJlZml4ICsgKEFVVE9fSUQrKykgKyAnLScgKyByYW5kb21TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBnZXRSb290RWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vdEVsZW1lbnQ7XG4gICAgfVxuXG4gICAgZ2V0RGlzcGxheU1vZGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpc3BsYXlNb2RlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiOt+WPlueUqOaIt+S8oOWFpeeahOWIneWni+mFjee9ruOAglxuICAgICAqIEBwYXJhbSB7c3RyaW5nPX0gcyAtIOihqOekuueUqOaIt+mFjee9rueahCBKU09OIOWtl+espuS4slxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0VXNlclNldHRpbmdzKHMpIHtcbiAgICAgICAgaWYgKHRoaXMudXNlclNldHRpbmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy51c2VyU2V0dGluZ3M7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHMgJiYgdHlwZW9mIHMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aGlzLnVzZXJTZXR0aW5ncyA9IEpTT04ucGFyc2Uocyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnVzZXJTZXR0aW5ncyA9IHM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudXNlclNldHRpbmdzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiOt+WPliBTcHJlYWRTaGVldCDlrp7pmYXnlJ/mlYjnmoTphY3nva7kv6Hmga/jgIJcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldFNldHRpbmdzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXR0aW5ncztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDojrflj5blj6/kuqTmjaLnmoTkuK3pl7TmlbDmja7vvIznlKjkuo7mlbDmja7mj5DkuqTjgIHop6PmnpDovazmjaLnrYnjgIJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcmFnaW49ZmFsc2VdIC0g5Li6IGB0cnVlYCDml7bojrflj5bljp/lp4sgSmF2YVNjcmlwdCDlr7nosaFcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGdldEV4Y2hhbmdlRGF0YShvcmFnaW4gPSBmYWxzZSkge1xuICAgICAgICB2YXIgdyA9IHRoaXMud29ya2Jvb2suX2dldEV4Y2hhbmdlKCk7XG4gICAgICAgIHZhciBmID0gdGhpcy5mcmFtZS5fZ2V0RXhjaGFuZ2UoKTsgLy8gVE9ETyBmcmFtZVxuICAgICAgICB2YXIgbyA9IHtcbiAgICAgICAgICAgIHdvcmtib29rOiB3LFxuICAgICAgICAgICAgZnJhbWU6IGYsXG4gICAgICAgICAgICBpZDogdGhpcy5nZXRJZCgpXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBvcmFnaW4gPyBvIDogSlNPTi5zdHJpbmdpZnkobyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6I635Y+W5b2T5YmNIFNwcmVhZFNoZWV0IOWvueW6lOeahCBXb3JrYm9vayDlrp7kvovjgIJcbiAgICAgKiBAcmV0dXJucyB7V29ya2Jvb2t9XG4gICAgICovXG4gICAgZ2V0V29ya2Jvb2tJbnN0YW5jZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud29ya2Jvb2s7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6I635Y+W5b2T5YmNIFNwcmVhZFNoZWV0IOWvueW6lOeahCBGcmFtZSDlrp7kvovjgIJcbiAgICAgKiBAcmV0dXJucyB7RnJhbWV9XG4gICAgICovXG4gICAgZ2V0RnJhbWVJbnN0YW5jZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZnJhbWU7XG4gICAgfVxuXG5cbiAgICBfaW5pdFBsdWdpbigpIHtcbiAgICAgICAgdGhpcy5wbHVnaW5zID0gbmV3IE1hcCgpO1xuICAgICAgICBnZXRBbGxQbHVnaW5zKCkuZm9yRWFjaChQID0+IHtcbiAgICAgICAgICAgIHZhciBwID0gbmV3IFAodGhpcyk7XG4gICAgICAgICAgICB2YWxpZGF0ZVBsdWdpbihwKTtcbiAgICAgICAgICAgIHRoaXMucGx1Z2lucy5zZXQocC5fX25hbWVfXywgcCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9lbmFibGVQbHVnaW4oKSB7XG4gICAgICAgIHRoaXMucGx1Z2lucy5mb3JFYWNoKHAgPT4ge1xuICAgICAgICAgICAgaWYgKHAuaXNFbmFibGUoKSkge1xuICAgICAgICAgICAgICAgIHAuZW5hYmxlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU3ByZWFkU2hlZXQ7IiwiLyoqXG4gKiDphY3nva7nv7vor5HnsbvjgIJcbiAqIOahhuaetuWGhemDqOS9v+eUqO+8jOeUqOaIt+S7o+eggeS4jeW6lOivpeiwg+eUqOWug+OAglxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmNsYXNzIENvbmZpZ1RyYW5zbGF0b3Ige1xuXG4gICAgLyoqXG4gICAgICog5p6E6YCg5ZmoXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29uZmlnXG4gICAgICogQHBhcmFtIHtTaGVldH0gc2hlZXRcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIHNoZWV0KSB7XG4gICAgICAgIHRoaXMuaW5pdGlhbENvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5zaGVldCA9IHNoZWV0O1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICog57+76K+R6YWN572u44CCXG4gICAgICog5Lit6Ze05pWw5o2u5qC85byP55qE6K6+6K6h5Lya5bC96YeP5ZCM5pe25L+d6K+B5ZyoIEV4Y2VsIOWPiiBXZWIg6aG16Z2i5Lit5Z2H5L6/5LqO5aSE55CG77yMXG4gICAgICog5L2G5LiN5YWN5a2Y5Zyo5LiA5LqbIFdlYiDkuK3pmr7ku6Xnm7TmjqXkvb/nlKjnmoTmlbDmja7moLzlvI/vvIzor6Xmlrnms5XljbPmmK/lrozmiJDmraTnsbvmlbDmja7moLzlvI9cbiAgICAgKiDnmoTpgILphY3ovazmjaLlt6XkvZzjgIJcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9XG4gICAgICovXG4gICAgdHJhbnNsYXRlKCkge1xuICAgICAgICB2YXIgc2V0dGluZ3MgPSB7fTtcbiAgICAgICAgdmFyIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpO1xuICAgICAgICB2YXIgcHJvcGVydHkgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhwcm90byk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9wZXJ0eS5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKHByb3BlcnR5W2ldLnN0YXJ0c1dpdGgoJ190cmFucycpKSB7XG4gICAgICAgICAgICAgICAgdGhpc1twcm9wZXJ0eVtpXV0uY2FsbCh0aGlzLCBzZXR0aW5ncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNldHRpbmdzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGhhbmRzb250YWJsZSDkuK3nmoTkuIDkupvnirbmgIHml6Dms5XpgJrov4fliJ3lp4vphY3nva7lj4LmlbDmjqfliLbvvIxcbiAgICAgKiDlj6rog73lnKjlrp7kvovljJbkuYvlkI7osIPnlKjnm7jlupTnmoTmlrnms5XmnaXmgaLlpI3nm7jlupTnmoTnirbmgIHvvIzmraTmlrnms5VcbiAgICAgKiDljbPmmK/lrozmiJDor6Xlip/og73jgIJcbiAgICAgKi9cbiAgICBpbml0U2hlZXRTdGF0ZSgpIHtcbiAgICAgICAgdmFyIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpO1xuICAgICAgICB2YXIgcHJvcGVydHkgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhwcm90byk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9wZXJ0eS5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKHByb3BlcnR5W2ldLnN0YXJ0c1dpdGgoJ19pbml0JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzW3Byb3BlcnR5W2ldXS5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHRyYW5zbGF0ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIF90cmFuc0NlbGwoc2V0dGluZ3MpIHtcbiAgICAgICAgdmFyIG0gPSB0aGlzLmluaXRpYWxDb25maWcuY2VsbE1ldGFzO1xuICAgICAgICBpZiAobSkge1xuICAgICAgICAgICAgc2V0dGluZ3MuY2VsbCA9IFtdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHJvdyA9IG1baV07XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByb3cubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNlbGxNZXRhID0gcm93W2pdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2VsbE1ldGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjZWxsID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICBjZWxsLnJvdyA9IGNlbGxNZXRhLnJvdztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbGwuY29sID0gY2VsbE1ldGEuY29sO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBkYXRhVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGxNZXRhLmRhdGFUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgZHQgaW4gY2VsbE1ldGEuZGF0YVR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGxNZXRhLmRhdGFUeXBlLmhhc093blByb3BlcnR5KGR0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VsbFtkdF0gPSBjZWxsTWV0YS5kYXRhVHlwZVtkdF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VsbC50eXBlID0gY2VsbE1ldGEuZGF0YVR5cGUudHlwZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNlbGwudHlwZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN0eWxlc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGxNZXRhLnN0eWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjZWxsTWV0YS5zdHlsZXMuYWxpZ25tZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYyA9IGNlbGxNZXRhLnN0eWxlcy5hbGlnbm1lbnRzLmpvaW4oJyBodCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZWxsLmNsYXNzTmFtZSA9IGNlbGwuY2xhc3NOYW1lID8gKGNlbGwuY2xhc3NOYW1lICs9ICcgaHQnICsgYykgOiAnaHQnICsgYztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGxNZXRhLnN0eWxlcy5mb250RmFtaWx5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlbGwuX3N0eWxlX2ZvbnRGYW1pbHkgPSBjZWxsTWV0YS5zdHlsZXMuZm9udEZhbWlseTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGxNZXRhLnN0eWxlcy5mb250U2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZWxsLl9zdHlsZV9mb250U2l6ZSA9IGNlbGxNZXRhLnN0eWxlcy5mb250U2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGxNZXRhLnN0eWxlcy5jb2xvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZWxsLl9zdHlsZV9jb2xvciA9IGNlbGxNZXRhLnN0eWxlcy5jb2xvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGxNZXRhLnN0eWxlcy5iYWNrZ3JvdW5kQ29sb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VsbC5fc3R5bGVfYmFja2dyb3VuZENvbG9yID0gY2VsbE1ldGEuc3R5bGVzLmJhY2tncm91bmRDb2xvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGxNZXRhLnN0eWxlcy5mb250U3R5bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VsbC5jbGFzc05hbWUgPSBjZWxsLmNsYXNzTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAoY2VsbC5jbGFzc05hbWUgKz0gJyBzc2QtZm9udC0nICsgY2VsbE1ldGEuc3R5bGVzLmZvbnRTdHlsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3NzZC1mb250LScgKyBjZWxsTWV0YS5zdHlsZXMuZm9udFN0eWxlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2VsbE1ldGEuc3R5bGVzLmZvbnRXZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VsbC5jbGFzc05hbWUgPSBjZWxsLmNsYXNzTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAoY2VsbC5jbGFzc05hbWUgKz0gJyBzc2QtZm9udC1ib2xkJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3NzZC1mb250LWJvbGQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2VsbE1ldGEuc3R5bGVzLnRleHREZWNvcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlbGwuY2xhc3NOYW1lID0gY2VsbC5jbGFzc05hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gKGNlbGwuY2xhc3NOYW1lICs9ICcgc3NkLWZvbnQtdW5kZXJsaW5lJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3NzZC1mb250LXVuZGVybGluZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MuY2VsbC5wdXNoKGNlbGwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX3RyYW5zRGF0YShzZXR0aW5ncykge1xuICAgICAgICB2YXIgcyA9IHRoaXMuaW5pdGlhbENvbmZpZy5kYXRhO1xuICAgICAgICBpZiAocykge1xuICAgICAgICAgICAgLy8gaG90VGFibGUg5Zyo5pyJIGRhdGEg55qE5oOF5Ya15LiL5Y+q6IO95pi+56S65pyJ5pWw5o2u55qE6KGM5YiX77yM6L+Z5a+55LqO6K6+6K6h5Zmo5p2l6K+05bm25LiN5pa55L6/5L2/55So77yMXG4gICAgICAgICAgICAvLyDmlYXloavlhYXnqbrmlbDmja7ku6XmkpHotbfooajmoLzoh7MgaW5pdFJvd3MgKiBpbml0Q29scyDnmoTlpKflsI/jgIJcbiAgICAgICAgICAgIC8vICAgIGlmIChzLmxlbmd0aCA8IHRoaXMuc2hlZXQuaW5pdFJvd3MpIHtcbiAgICAgICAgICAgIC8vICAgICAgICBsZXQgZm9ybWVyQ29sID0gcy5sZW5ndGg7XG4gICAgICAgICAgICAvLyAgICAgICAgcy5sZW5ndGggPSB0aGlzLnNoZWV0LmluaXRSb3dzO1xuICAgICAgICAgICAgLy8gICAgICAgIHMuZmlsbChbXSwgZm9ybWVyQ29sKTtcbiAgICAgICAgICAgIC8vICAgIH1cbiAgICAgICAgICAgIC8vICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgLy8gICAgICAgIGxldCByb3cgPSBzW2ldO1xuICAgICAgICAgICAgLy8gICAgICAgIGlmIChyb3cubGVuZ3RoIDwgdGhpcy5zaGVldC5pbml0Q29scykge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICBsZXQgZm9ybWVyUm93ID0gcm93Lmxlbmd0aDtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgcm93Lmxlbmd0aCA9IHRoaXMuc2hlZXQuaW5pdENvbHM7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgIHJvdy5maWxsKCcnLCBmb3JtZXJSb3cpO1xuICAgICAgICAgICAgLy8gICAgICAgIH1cbiAgICAgICAgICAgIC8vICAgIH1cblxuICAgICAgICAgICAgLy8g5L2/55SoIGhvdCBBUEkg5a6M5oiQ5LiK6L+w5Yqf6IO9XG4gICAgICAgICAgICBzZXR0aW5ncy5taW5Sb3dzID0gdGhpcy5zaGVldC5pbml0Um93cztcbiAgICAgICAgICAgIHNldHRpbmdzLm1pbkNvbHMgPSB0aGlzLnNoZWV0LmluaXRDb2xzO1xuXG4gICAgICAgICAgICBzZXR0aW5ncy5kYXRhID0gcztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWIl+WuvVxuICAgIF90cmFuc0NvbFdpZHRocyhzZXR0aW5ncykge1xuICAgICAgICB2YXIgdyA9IHRoaXMuaW5pdGlhbENvbmZpZy5jb2xXaWR0aHM7XG4gICAgICAgIGlmICh3KSB7XG4gICAgICAgICAgICBzZXR0aW5ncy5jb2xXaWR0aHMgPSB3O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g6KGM6auYXG4gICAgX3RyYW5zUm93SGVpZ2h0cyhzZXR0aW5ncykge1xuICAgICAgICB2YXIgaCA9IHRoaXMuaW5pdGlhbENvbmZpZy5yb3dIZWlnaHRzO1xuICAgICAgICBpZiAoaCkge1xuICAgICAgICAgICAgc2V0dGluZ3Mucm93SGVpZ2h0cyA9IGg7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDovrnmoYZcbiAgICBfdHJhbnNCb3JkZXJzKHNldHRpbmdzKSB7XG4gICAgICAgIHZhciBzID0gdGhpcy5pbml0aWFsQ29uZmlnLmJvcmRlcnM7XG4gICAgICAgIGlmIChzKSB7XG4gICAgICAgICAgICBzZXR0aW5ncy5jdXN0b21Cb3JkZXJzID0gcztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWQiOW5tuWNleWFg+agvFxuICAgIF90cmFuc01lcmdlQ2VsbHMoc2V0dGluZ3MpIHtcbiAgICAgICAgdmFyIHMgPSB0aGlzLmluaXRpYWxDb25maWcubWVyZ2VDZWxscztcbiAgICAgICAgaWYgKHMpIHtcbiAgICAgICAgICAgIHNldHRpbmdzLm1lcmdlQ2VsbHMgPSBzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGluaXRTdGF0ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIOmAieWMulxuICAgIF9pbml0U2VsZWN0aW9uKCkge1xuICAgICAgICB2YXIgcyA9IHRoaXMuaW5pdGlhbENvbmZpZy5zZWxlY3Rpb247XG4gICAgICAgIGlmIChzKSB7XG4gICAgICAgICAgICB0aGlzLnNoZWV0LnNlbGVjdChzLnJvdywgcy5jb2wsIHMuZW5kUm93LCBzLmVuZENvbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNoZWV0LnNlbGVjdCgwLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBDb25maWdUcmFuc2xhdG9yOyIsImltcG9ydCBDb250ZXh0TWVudSBmcm9tICcuL2ZyYW1lL0NvbnRleHRNZW51J1xuXG4vKipcbiAqIOeUteWtkOihqOagvOiuvuiuoeWZqOS4re+8jOmZpOS6hiBXb3JrYm9vayDlpJbnmoTnu4Tku7bnrqHnkIblmajvvIxcbiAqIOWMheWQq+iPnOWNleagj+OAgeW3peWFt+agj+OAgeS+p+i+ueagj+OAgeWPs+mUruiPnOWNleetieetieOAglxuICovXG5jbGFzcyBGcmFtZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihpbnN0YW5jZSwgY29uZmlnKSB7XG4gICAgICAgIHRoaXMuc3ByZWFkU2hlZXQgPSBpbnN0YW5jZTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEB0eXBlIHtDb250ZXh0TWVudX1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY29udGV4dE1lbnUgPSBuZXcgQ29udGV4dE1lbnUoaW5zdGFuY2UpO1xuICAgIH1cblxuICAgIF9nZXRFeGNoYW5nZSgpIHtcblxuICAgIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBGcmFtZTsiLCIvKipcbiAqIEhhbmRzb250YWJsZSDnu4Tku7bnmoTpgILphY3nsbtcbiAqL1xuaW1wb3J0IHtleHRlbmR9IGZyb20gJy4uL3V0aWxzL2NvbW1vbi5qcydcbmltcG9ydCBDb25maWdUcmFuc2xhdG9yIGZyb20gJy4vQ29uZmlnVHJhbnNsYXRvci5qcydcblxuY2xhc3MgSG90VGFibGVBZGFwdG9yIGV4dGVuZHMgSGFuZHNvbnRhYmxlIHtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcm9vdEVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0g5Y6f5aeL6YWN572u5L+h5oGvXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGV4dENvbmZpZyAtIOmZhOWKoOeahOmFjee9ruS/oeaBr1xuICAgICAqIEBwYXJhbSB7U2hlZXR9IHNoZWV0IC0g5a+55bqU55qEIHNoZWV0IOWunuS+i1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3RFbGVtZW50LCBjb25maWcsIGV4dENvbmZpZywgc2hlZXQpIHtcbiAgICAgICAgbGV0IGhvdFNldHRpbmdzID0ge307XG4gICAgICAgIGxldCB0cmFuc2xhdG9yID0gbmV3IENvbmZpZ1RyYW5zbGF0b3IoY29uZmlnLCBzaGVldCk7XG4gICAgICAgIGxldCBzZXR0aW5ncyA9IHRyYW5zbGF0b3IudHJhbnNsYXRlKCk7XG5cbiAgICAgICAgbGV0IGZyYW1lID0gc2hlZXQud29ya2Jvb2suc3ByZWFkU2hlZXQuZ2V0RnJhbWVJbnN0YW5jZSgpO1xuICAgICAgICBsZXQgZGlzcGxheU1vZGUgPSBzaGVldC53b3JrYm9vay5zcHJlYWRTaGVldC5nZXREaXNwbGF5TW9kZSgpO1xuICAgICAgICBsZXQgbWVudUl0ZW1zID0gZnJhbWUuY29udGV4dE1lbnUubWVudUl0ZW1zO1xuICAgICAgICBsZXQgY29udGV4dE1lbnUgPSB7fTtcbiAgICAgICAgY29udGV4dE1lbnUuaXRlbXMgPSBmcmFtZS5jb250ZXh0TWVudS5nZXRNZW51SXRlbXM0SG90VGFibGUoKTtcbiAgICAgICAgY29udGV4dE1lbnUuY2FsbGJhY2sgPSAoZnVuY3Rpb24gKHNoZWV0KSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGtleSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGlmIChtZW51SXRlbXMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSBtZW51SXRlbXMuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmhhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uaGFuZGxlci5jYWxsKHRoaXMsIHNoZWV0LCBvcHRpb25zLnN0YXJ0LCBvcHRpb25zLmVuZCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KHNoZWV0KSk7XG4gICAgICAgIEhvdFRhYmxlQWRhcHRvci5fcHJlZmVyZW5jZS5jb250ZXh0TWVudSA9IGNvbnRleHRNZW51O1xuXG4gICAgICAgIGV4dGVuZChob3RTZXR0aW5ncywgSG90VGFibGVBZGFwdG9yLl9wcmVmZXJlbmNlKTtcbiAgICAgICAgZXh0ZW5kKGhvdFNldHRpbmdzLCBzZXR0aW5ncyk7XG4gICAgICAgIGV4dGVuZChob3RTZXR0aW5ncywgZXh0Q29uZmlnKTtcblxuICAgICAgICBpZiAoZGlzcGxheU1vZGUpIHtcbiAgICAgICAgICAgIGhvdFNldHRpbmdzLmNvbEhlYWRlcnMgPSBmYWxzZTtcbiAgICAgICAgICAgIGhvdFNldHRpbmdzLnJvd0hlYWRlcnMgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN1cGVyKHJvb3RFbGVtZW50LCBob3RTZXR0aW5ncyk7XG5cbiAgICAgICAgdGhpcy5fdHJhbnNsYXRvciA9IHRyYW5zbGF0b3I7XG5cbiAgICAgICAgLy8gaGFuZG9udGFibGUg5q+P5qyhIHJlbmRlciDnmoTml7blgJnvvIzkuI3kv53nlZkgdGQg55qE54q25oCB77yM5Zug5q2k6YCa6L+H6K+l5LqL5Lu26YeN5bu65LiA5Lqb5qC35byP44CCXG4gICAgICAgIC8vbm9pbnNwZWN0aW9uIEVTNk1vZHVsZXNEZXBlbmRlbmNpZXNcbiAgICAgICAgSGFuZHNvbnRhYmxlLmhvb2tzLmFkZCgnYmVmb3JlUmVuZGVyZXInLCBmdW5jdGlvbiAoVEQsIHJvdywgY29sLCBwcm9wLCB2YWx1ZSwgY2VsbFByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIFRELnN0eWxlLmNvbG9yID0gY2VsbFByb3BlcnRpZXMuX3N0eWxlX2NvbG9yIHx8ICcnO1xuICAgICAgICAgICAgVEQuc3R5bGUuZm9udEZhbWlseSA9IGNlbGxQcm9wZXJ0aWVzLl9zdHlsZV9mb250RmFtaWx5IHx8ICcnO1xuICAgICAgICAgICAgVEQuc3R5bGUuZm9udFNpemUgPSBjZWxsUHJvcGVydGllcy5fc3R5bGVfZm9udFNpemUgfHwgJyc7XG4gICAgICAgICAgICBURC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBjZWxsUHJvcGVydGllcy5fc3R5bGVfYmFja2dyb3VuZENvbG9yIHx8ICcnO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAvKlxuICAgICAgICAgKiDlsIYgSGFuZHNvbnRhYmxlIOeahOaJgOacieS6i+S7tumDveWnlOaJmOe7mSBTcHJlYWRTaGVldCDlkI7kvJrmnInkupvljaHjgIJcbiAgICAgICAgICog5Y+q5aW95bCGIEhhbmRzb250YWJsZS5ob29rcy5nZXRSZWdpc3RlcmVkKCkg5o2i5oiQIEVDUCDpobnnm67pnIDopoHnmoTjgIJcbiAgICAgICAgICovXG4gICAgICAgIFsnYWZ0ZXJTZWxlY3Rpb25FbmQnXS5mb3JFYWNoKGhvb2sgPT4ge1xuICAgICAgICAgICAgLy9ub2luc3BlY3Rpb24gRVM2TW9kdWxlc0RlcGVuZGVuY2llc1xuICAgICAgICAgICAgSGFuZHNvbnRhYmxlLmhvb2tzLmFkZChob29rLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGFyZ3MgPSBbXTtcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2goaG9vayk7XG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKHNoZWV0KTtcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2guYXBwbHkoYXJncywgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICAgICAgICAgICAgICBsZXQgY3h0ID0gc2hlZXQud29ya2Jvb2suc3ByZWFkU2hlZXQ7XG4gICAgICAgICAgICAgICAgY3h0LmVtaXQuYXBwbHkoY3h0LCBhcmdzKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICBzdXBlci5kZXN0cm95KCk7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl90cmFuc2xhdG9yO1xuICAgIH1cblxufVxuXG5cbi8qKlxuICog6aKE6K6+6YWN572u44CCXG4gKiBAcHJpdmF0ZVxuICovXG5Ib3RUYWJsZUFkYXB0b3IuX3ByZWZlcmVuY2UgPSB7XG4gICAgb3V0c2lkZUNsaWNrRGVzZWxlY3RzOiBmYWxzZSxcbiAgICBjb250ZXh0TWVudTogdHJ1ZSxcblxuICAgIHJvd0hlYWRlcnM6IHRydWUsXG4gICAgY29sSGVhZGVyczogdHJ1ZSxcblxuICAgIG1hbnVhbENvbHVtblJlc2l6ZTogdHJ1ZSxcbiAgICBtYW51YWxSb3dSZXNpemU6IHRydWUsXG5cbiAgICB0YWJsZUNsYXNzTmFtZTogJ3NzZC1oYW5kc29udGFibGUnLFxuXG4gICAgY3VzdG9tQm9yZGVyczogdHJ1ZSxcblxuICAgIHhGb3JtdWxhczogdHJ1ZVxufTtcblxuZXhwb3J0IGRlZmF1bHQgSG90VGFibGVBZGFwdG9yOyIsImltcG9ydCBIYW5kc29udGFibGUgZnJvbSAnLi9Ib3RUYWJsZUFkYXB0b3InO1xuaW1wb3J0IHtTaGVldEVycm9yfSBmcm9tICcuL1NoZWV0RXJyb3InO1xuaW1wb3J0IHtFeGNoYW5nZX0gZnJvbSAnLi9leHQvU2hlZXRfZXhjaGFuZ2UnO1xuaW1wb3J0IHtTaGVldEhlbHBlcn0gZnJvbSAnLi9leHQvU2hlZXRfaGVscGVyJztcbmltcG9ydCB7Q29vcmRpbmF0ZSwgZXh0ZW5kfSBmcm9tICcuLi91dGlscy9jb21tb24nO1xuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vdXRpbHMvRW1pdHRlcic7XG5cblxuY29uc3QgSU5JVF9ST1dTID0gMTUwOyAvLyBTaGVldCDliJ3lp4vlj6/mmL7npLrnmoTooYzmlbBcbmNvbnN0IElOSVRfQ09MUyA9IDUwOyAgLy8gU2hlZXQg5Yid5aeL5Y+v5pi+56S655qE5YiX5pWwXG5cbi8vIFdlYnN0b3JtIElERSDnmoTor63ms5Xmo4Dmn6XmiJYgc291cmVtYXAg6Kej5p6Q5pe25LiN5pSv5oyB55u05o6l5YaZ5Yiw57G755qEIGV4dGVuZHMg5ZCO44CCXG52YXIgTWl4aW4gPSBTaGVldEhlbHBlcihFeGNoYW5nZShFbWl0dGVyKSk7XG5cbi8qKlxuICog5bel5L2c6KGoXG4gKlxuICogQGZpcmVzIFNoZWV0I2FmdGVyUmVuYW1lXG4gKiBAZmlyZXMgU2hlZXQjYWZ0ZXJSZW5hbWVDYW5jZWxcbiAqL1xuY2xhc3MgU2hlZXQgZXh0ZW5kcyBNaXhpbiB7XG5cbiAgICAvKipcbiAgICAgKiDmnoTpgKAgU2hlZXQg5a6e5L6L77yM55So5oi35Luj56CB5LiN5bqU6K+l55u05o6l6LCD55So5a6D77yMXG4gICAgICog6ICM5piv5L2/55SoIFdvcmtib29rLmNyZWF0ZVNoZWV0KCkg5pa55rOV5p6E6YCg44CCXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1dvcmtib29rfSB3b3JrYm9va1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHdvcmtib29rLCBjb25maWcpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIHNoZWV0IOaJgOWcqOeahOW3peS9nOihqFxuICAgICAgICAgKiBAdHlwZSB7V29ya2Jvb2t9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLndvcmtib29rID0gd29ya2Jvb2s7XG4gICAgICAgIHRoaXMuJCR2aWV3ID0gd29ya2Jvb2suJCR2aWV3O1xuICAgICAgICB0aGlzLnNldHRpbmdzID0gY29uZmlnO1xuICAgICAgICB0aGlzLnNoZWV0TmFtZSA9IGNvbmZpZy5uYW1lO1xuXG4gICAgICAgIHRoaXMuaW5pdFJvd3MgPSBJTklUX1JPV1M7XG4gICAgICAgIHRoaXMuaW5pdENvbHMgPSBJTklUX0NPTFM7XG5cbiAgICAgICAgdGhpcy5meCA9IHt9OyAvLyBUT0RPXG5cbiAgICAgICAgdGhpcy5fcmVuZGVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVuZGVyKCkge1xuICAgICAgICB0aGlzLiQkdmlldy5hcHBlbmRUYWIodGhpcy5zaGVldE5hbWUpO1xuICAgICAgICB2YXIge2NvbnRhaW5lciwgd2lkdGgsIGhlaWdodH0gPSB0aGlzLiQkdmlldy5faG90VGFibGVzLmdldCh0aGlzLnNoZWV0TmFtZSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtIYW5kc29udGFibGV9XG4gICAgICAgICAqL1xuXG4gICAgICAgIHRoaXMuaGFuZHNvbnRhYmxlID0gbmV3IEhhbmRzb250YWJsZShjb250YWluZXIsIHRoaXMuc2V0dGluZ3MsIHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgcmVhZE9ubHk6IHRoaXMud29ya2Jvb2suc3ByZWFkU2hlZXQuZ2V0RGlzcGxheU1vZGUoKSxcbiAgICAgICAgICAgIHN0YXJ0Um93czogdGhpcy5pbml0Um93cyxcbiAgICAgICAgICAgIHN0YXJ0Q29sczogdGhpcy5pbml0Q29scyxcbiAgICAgICAgICAgIF9pc0hvdFRhYmxlQWRhcHRvcjogdHJ1ZSxcbiAgICAgICAgICAgIF9zaGVldDogdGhpc1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgdGhpcy5oYW5kc29udGFibGUuX3RyYW5zbGF0b3IuaW5pdFNoZWV0U3RhdGUoKTtcbiAgICAgICAgdGhpcy4kJHZpZXcuaGlkZUNvbnRlbnQodGhpcy5nZXROYW1lKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiOt+WPluW9k+WJjSBzaGVldCDnmoTlkI3lrZdcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoZWV0TmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmv4DmtLvlvZPliY0gc2hlZXQg6aG1XG4gICAgICovXG4gICAgYWN0aXZlKCkge1xuICAgICAgICB0aGlzLndvcmtib29rLmFjdGl2ZVNoZWV0ID0gdGhpcy5nZXROYW1lKCk7XG4gICAgICAgIHRoaXMuJCR2aWV3LmFjdGl2ZVRhYih0aGlzLmdldE5hbWUoKSk7XG4gICAgICAgIHRoaXMuaGFuZHNvbnRhYmxlLnJlbmRlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOajgOa1i+W9k+WJjSBzaGVldCDmmK/lkKbooqvmv4DmtLtcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc0FjdGl2ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud29ya2Jvb2suYWN0aXZlU2hlZXQgPT09IHRoaXMuZ2V0TmFtZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWFs+mXrSBzaGVldCDpobVcbiAgICAgKi9cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgdGhpcy53b3JrYm9vay5jbG9zZVNoZWV0KHRoaXMuZ2V0TmFtZSgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDplIDmr4HlvZPliY0gc2hlZXRcbiAgICAgKi9cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLmhhbmRzb250YWJsZS5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMud29ya2Jvb2suc2hlZXRzLmRlbGV0ZSh0aGlzLmdldE5hbWUoKSk7XG4gICAgICAgIGRlbGV0ZSB0aGlzLndvcmtib29rO1xuICAgICAgICBkZWxldGUgdGhpcy4kJHZpZXc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog57uZIHNoZWV0IOmhtemHjeWRveWQjVxuICAgICAqIEBwYXJhbSBuYW1lIC0g5paw5ZCN5a2XXG4gICAgICovXG4gICAgcmVuYW1lKG5hbWUpIHtcbiAgICAgICAgdGhpcy53b3JrYm9vay5yZW5hbWVTaGVldCh0aGlzLmdldE5hbWUoKSwgbmFtZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6YCJ5LitIHNoZWV0IOS4reeahOafkOWMuuWfn+OAglxuICAgICAqIOS4jeaMh+WumiB0b1JvdyDjgIF0b0NvbCDml7bliJnpgInkuK3lr7nlupTnmoTljZXlhYPmoLzjgIJcbiAgICAgKiBAcGFyYW0ge2ludH0gZnJvbVJvdyAtIOi1t+Wni+ihjFxuICAgICAqIEBwYXJhbSB7aW50fSBmcm9tQ29sIC0g6LW35aeL5YiXXG4gICAgICogQHBhcmFtIHtpbnR9IFt0b1Jvd10gLSDnu4jmraLooYxcbiAgICAgKiBAcGFyYW0ge2ludH0gW3RvQ29sXSAtIOe7iOatouWIl1xuICAgICAqL1xuICAgIHNlbGVjdChmcm9tUm93LCBmcm9tQ29sLCB0b1JvdywgdG9Db2wpIHtcbiAgICAgICAgdG9Sb3cgPSB0b1JvdyB8fCBmcm9tUm93O1xuICAgICAgICB0b0NvbCA9IHRvQ29sIHx8IGZyb21Db2w7XG4gICAgICAgIHRoaXMuaGFuZHNvbnRhYmxlLnNlbGVjdENlbGwoZnJvbVJvdywgZnJvbUNvbCwgdG9Sb3csIHRvQ29sLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6I635b6X5b2T5YmNIHNoZWV0IOeahOmAieWMulxuICAgICAqIEByZXR1cm5zIHt7cm93LCBjb2wsIGVuZFJvdywgZW5kQ29sfX1cbiAgICAgKi9cbiAgICBnZXRTZWxlY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxlY3Rpb24gPSB0aGlzLmhhbmRzb250YWJsZS5nZXRTZWxlY3RlZCgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcm93OiBzZWxlY3Rpb25bMF0sXG4gICAgICAgICAgICBjb2w6IHNlbGVjdGlvblsxXSxcbiAgICAgICAgICAgIGVuZFJvdzogc2VsZWN0aW9uWzJdLFxuICAgICAgICAgICAgZW5kQ29sOiBzZWxlY3Rpb25bM11cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWQiOW5tuWNleWFg+agvFxuICAgICAqIFRJUDogaGFuZHNvbnRhYmxlIOWumOaWueWQiOW5tuWKn+iDveS4jeiDveato+ehruWkhOeQhuW3suacieeahOWQiOW5tuWMuuWfn++8jOaVheWBmumHjeaWsOiuoeeul+OAglxuICAgICAqIEBwYXJhbSB7aW50fSByb3cgLSDotbflp4vooYxcbiAgICAgKiBAcGFyYW0ge2ludH0gY29sIC0g6LW35aeL5YiXXG4gICAgICogQHBhcmFtIHtpbnR9IHJvd3NwYW4gLSDlvoXlkIjlubbnmoTooYzmlbBcbiAgICAgKiBAcGFyYW0ge2ludH0gY29sc3BhbiAtIOW+heWQiOW5tueahOWIl+aVsFxuICAgICAqL1xuICAgIC8vIFRPRE8g5pyA5aSn6KGM5YiX5pWw6ZmQ5Yi2XG4gICAgbWVyZ2VDZWxscyhyb3csIGNvbCwgcm93c3BhbiwgY29sc3Bhbikge1xuICAgICAgICB2YXIgciA9IDA7XG4gICAgICAgIHZhciBjb3ZlciA9IFtdO1xuICAgICAgICB2YXIgbWVyZ2VDZWxscyA9IHRoaXMuaGFuZHNvbnRhYmxlLmdldFNldHRpbmdzKCkubWVyZ2VDZWxscztcblxuICAgICAgICB2YXIgcjEgPSBbcm93LCBjb2wsIHJvdyArIHJvd3NwYW4gLSAxLCBjb2wgKyBjb2xzcGFuIC0gMV07XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IG1lcmdlQ2VsbHMubGVuZ3RoOyBpOyAtLWkpIHtcbiAgICAgICAgICAgIGxldCBmID0gbWVyZ2VDZWxsc1tpIC0gMV07XG4gICAgICAgICAgICBsZXQgcjIgPSBbZi5yb3csIGYuY29sLCBmLnJvdyArIGYucm93c3BhbiAtIDEsIGYuY29sICsgZi5jb2xzcGFuIC0gMV07XG5cbiAgICAgICAgICAgIC8vIOS4juWOn+WMuuWfn+WtmOWcqOWujOWFqOmHjeWPoFxuICAgICAgICAgICAgaWYgKENvb3JkaW5hdGUuaXNFcXVhbChyMSwgcjIpKSB7XG4gICAgICAgICAgICAgICAgciA9IDE7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDmmK/ljp/ljLrln5/nmoTlrZDpm4ZcbiAgICAgICAgICAgIGlmIChDb29yZGluYXRlLmlzU3Vic2V0KHIxLCByMikpIHtcbiAgICAgICAgICAgICAgICByID0gMjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOimhuebluWOn+WMuuWfn++8iOatpOaXtuWPr+iDveS4juWPpuS4gOS4quWOn+WMuuWfn+S6pOmbhuaIluWujOWFqOimhueblu+8iVxuICAgICAgICAgICAgaWYgKENvb3JkaW5hdGUuaXNTdXBlcnNldChyMSwgcjIpKSB7XG4gICAgICAgICAgICAgICAgY292ZXIucHVzaChpIC0gMSk7XG4gICAgICAgICAgICAgICAgciA9IDM7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDkuI7ljp/ljLrln5/lrZjlnKjkuqTpm4Yo5LiN5ZCr5a2Q6ZuG44CB6LaF6ZuG5oOF5Ya1KVxuICAgICAgICAgICAgaWYgKENvb3JkaW5hdGUuaW50ZXJzZWN0aW9uKHIxLCByMikpIHtcbiAgICAgICAgICAgICAgICByID0gNDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyID09PSAwIHx8IHIgPT09IDMpIHtcbiAgICAgICAgICAgIGlmIChyID09PSAzKSB7IC8vIOi/meenjeaDheWGteS4i+S4gOWumuWtmOWcqOW3sue7j+WQiOW5tui/h+eahOWNleWFg+agvFxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY292ZXIubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VDZWxscy5zcGxpY2UoY292ZXJbaV0sIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1lcmdlQ2VsbHMgPSBtZXJnZUNlbGxzIHx8IFtdO1xuICAgICAgICAgICAgbWVyZ2VDZWxscy5wdXNoKHtcbiAgICAgICAgICAgICAgICByb3c6IHJvdyxcbiAgICAgICAgICAgICAgICBjb2w6IGNvbCxcbiAgICAgICAgICAgICAgICByb3dzcGFuOiByb3dzcGFuLFxuICAgICAgICAgICAgICAgIGNvbHNwYW46IGNvbHNwYW5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5oYW5kc29udGFibGUudXBkYXRlU2V0dGluZ3Moe1xuICAgICAgICAgICAgICAgIG1lcmdlQ2VsbHM6IG1lcmdlQ2VsbHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHIgPT09IDIgfHwgciA9PT0gNCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFNoZWV0RXJyb3IoYOe7meWumueahOWQiOW5tuWMuuWfn+S4jeWQiOazlTogWyR7cm93fSwgJHtjb2x9LCAke3Jvd3NwYW59LCAke2NvbHNwYW59XWApXG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIOWPlua2iOWNleWFg+agvOWQiOW5tlxuICAgICAqIEBwYXJhbSB7aW50fSByb3cgLSDotbflp4vooYxcbiAgICAgKiBAcGFyYW0ge2ludH0gY29sIC0g6LW35aeL5YiXXG4gICAgICogQHBhcmFtIHtpbnR9IHJvd3NwYW4gLSDlvoXlkIjlubbnmoTooYzmlbBcbiAgICAgKiBAcGFyYW0ge2ludH0gY29sc3BhbiAtIOW+heWQiOW5tueahOWIl+aVsFxuICAgICAqL1xuICAgIHVuTWVyZ2VDZWxscyhyb3csIGNvbCwgcm93c3BhbiwgY29sc3Bhbikge1xuICAgICAgICB2YXIgbWVyZ2VkID0gdGhpcy5oYW5kc29udGFibGUuZ2V0U2V0dGluZ3MoKS5tZXJnZUNlbGxzO1xuICAgICAgICB2YXIgbWVyZ2VDZWxscyA9IFtdO1xuICAgICAgICBpZiAobWVyZ2VkICYmIG1lcmdlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWVyZ2VkLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKENvb3JkaW5hdGUuaXNTdWJzZXQoW1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVyZ2VkW2ldLnJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lcmdlZFtpXS5jb2wsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXJnZWRbaV0ucm93ICsgbWVyZ2VkW2ldLnJvd3NwYW4gLSAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVyZ2VkW2ldLmNvbCArIG1lcmdlZFtpXS5jb2xzcGFuIC0gMVxuICAgICAgICAgICAgICAgICAgICBdLCBbcm93LCBjb2wsIHJvdyArIHJvd3NwYW4gLSAxLCBjb2wgKyBjb2xzcGFuIC0gMV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtZXJnZUNlbGxzLnB1c2gobWVyZ2VkW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhhbmRzb250YWJsZS51cGRhdGVTZXR0aW5ncyh7XG4gICAgICAgICAgICBtZXJnZUNlbGxzOiBtZXJnZUNlbGxzLmxlbmd0aCA9PT0gMCA/IGZhbHNlIDogbWVyZ2VDZWxsc1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzcGxpY2VDbGFzcyhzZWxlY3Rpb24sIG5ld0NsYXNzTmFtZSwgLi4uY2xhc3NOYW1lcykge1xuICAgICAgICB0aGlzLl93YWxrb25DZWxsTWV0YXMoc2VsZWN0aW9uLCAocm93LCBjb2wsIGNlbGxNZXRhKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogKHRoaXMuX3JlbW92ZUZvcm1lckNsYXNzKFxuICAgICAgICAgICAgICAgICAgICBjZWxsTWV0YS5jbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZXNcbiAgICAgICAgICAgICAgICApICsgJyAnICsgbmV3Q2xhc3NOYW1lKS50cmltKClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sIHtjbGFzc05hbWU6IG5ld0NsYXNzTmFtZX0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiuvue9ruWtl+S9k+WKoOeyl1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3ZhbHVlPXRydWVdIGB0cnVlYCDkuLrliqDnspfvvIxgZmFsc2VgIOWPlua2iOWKoOeyl1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZWxlY3Rpb24gLSDlvoXorr7nva7nmoTpgInljLpcbiAgICAgKiBAcGFyYW0ge2ludH0gc2VsZWN0aW9uLnJvd1xuICAgICAqIEBwYXJhbSB7aW50fSBzZWxlY3Rpb24uY29sXG4gICAgICogQHBhcmFtIHtpbnR9IFtzZWxlY3Rpb24uZW5kUm93XVxuICAgICAqIEBwYXJhbSB7aW50fSBbc2VsZWN0aW9uLmVuZENvbF1cbiAgICAgKi9cbiAgICBzZXRGb250Qm9sZCh2YWx1ZSA9IHRydWUsIHNlbGVjdGlvbiA9IHRoaXMuZ2V0U2VsZWN0aW9uKCkpIHtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNwbGljZUNsYXNzKHNlbGVjdGlvbiwgJ3NzZC1mb250LWJvbGQnLCAnc3NkLWZvbnQtYm9sZCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zcGxpY2VDbGFzcyhzZWxlY3Rpb24sICcnLCAnc3NkLWZvbnQtYm9sZCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGFuZHNvbnRhYmxlLnJlbmRlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiuvue9ruaWnOS9k+Wtl1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3ZhbHVlPXRydWVdXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHNlbGVjdGlvbiAtIOW+heiuvue9rueahOmAieWMulxuICAgICAqIEBwYXJhbSB7aW50fSBzZWxlY3Rpb24ucm93XG4gICAgICogQHBhcmFtIHtpbnR9IHNlbGVjdGlvbi5jb2xcbiAgICAgKiBAcGFyYW0ge2ludH0gW3NlbGVjdGlvbi5lbmRSb3ddXG4gICAgICogQHBhcmFtIHtpbnR9IFtzZWxlY3Rpb24uZW5kQ29sXVxuICAgICAqL1xuICAgIHNldEZvbnRJdGFsaWModmFsdWUgPSB0cnVlLCBzZWxlY3Rpb24gPSB0aGlzLmdldFNlbGVjdGlvbigpKSB7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zcGxpY2VDbGFzcyhzZWxlY3Rpb24sICdzc2QtZm9udC1pdGFsaWMnLCAnc3NkLWZvbnQtaXRhbGljJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNwbGljZUNsYXNzKHNlbGVjdGlvbiwgJycsICdzc2QtZm9udC1pdGFsaWMnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhhbmRzb250YWJsZS5yZW5kZXIoKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIOiuvue9ruWtl+S9k+S4i+WIkue6v1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3ZhbHVlPXRydWVdXG4gICAgICogQHBhcmFtIHNlbGVjdGlvbiAtIOW+heiuvue9rueahOmAieWMulxuICAgICAqIEBwYXJhbSB7aW50fSBzZWxlY3Rpb24ucm93XG4gICAgICogQHBhcmFtIHtpbnR9IHNlbGVjdGlvbi5jb2xcbiAgICAgKiBAcGFyYW0ge2ludH0gW3NlbGVjdGlvbi5lbmRSb3ddXG4gICAgICogQHBhcmFtIHtpbnR9IFtzZWxlY3Rpb24uZW5kQ29sXVxuICAgICAqL1xuICAgIHNldEZvbnRVbmRlcmxpbmUodmFsdWUgPSB0cnVlLCBzZWxlY3Rpb24gPSB0aGlzLmdldFNlbGVjdGlvbigpKSB7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zcGxpY2VDbGFzcyhzZWxlY3Rpb24sICdzc2QtZm9udC11bmRlcmxpbmUnLCAnc3NkLWZvbnQtdW5kZXJsaW5lJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNwbGljZUNsYXNzKHNlbGVjdGlvbiwgJycsICdzc2QtZm9udC11bmRlcmxpbmUnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhhbmRzb250YWJsZS5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDorr7nva7lrZfkvZPpopzoibJcbiAgICAgKiBUSVAg5aaC5p6cIOKAnGhhbmRvbnRhYmxlIOebtOaOpemAmui/hyBnZXRDZWxsIOiOt+W+lyBURCDlkI7orr7nva7moLflvI/igJ3vvIzlvZPlho3mrKEgcmVuZGVyIOaXtuS8muWkseaViOOAglxuICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAqIEBwYXJhbSBzZWxlY3Rpb25cbiAgICAgKi9cbiAgICBzZXRGb250Q29sb3IodmFsdWUgPSAnJywgc2VsZWN0aW9uID0gdGhpcy5nZXRTZWxlY3Rpb24oKSkge1xuICAgICAgICB0aGlzLl93YWxrb25DZWxsTWV0YXMoc2VsZWN0aW9uLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIF9zdHlsZV9jb2xvcjogdmFsdWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sIHtfc3R5bGVfY29sb3I6IHZhbHVlfSk7XG4gICAgICAgIHRoaXMuaGFuZHNvbnRhYmxlLnJlbmRlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWtl+S9k+exu+Wei1xuICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAqIEBwYXJhbSBzZWxlY3Rpb25cbiAgICAgKi9cbiAgICBzZXRGb250RmFtaWx5KHZhbHVlID0gJycsIHNlbGVjdGlvbiA9IHRoaXMuZ2V0U2VsZWN0aW9uKCkpIHtcbiAgICAgICAgdGhpcy5fd2Fsa29uQ2VsbE1ldGFzKHNlbGVjdGlvbiwgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBfc3R5bGVfZm9udEZhbWlseTogdmFsdWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sIHtfc3R5bGVfZm9udEZhbWlseTogdmFsdWV9KTtcbiAgICAgICAgdGhpcy5oYW5kc29udGFibGUucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5a2X5L2T5aSn5bCPXG4gICAgICogQHBhcmFtIHZhbHVlIC0g6ZyA6KaB5oyH5a6a5Y2V5L2N77yM5aaCIDEycHhcbiAgICAgKiBAcGFyYW0gc2VsZWN0aW9uXG4gICAgICovXG4gICAgc2V0Rm9udFNpemUodmFsdWUsIHNlbGVjdGlvbiA9IHRoaXMuZ2V0U2VsZWN0aW9uKCkpIHtcbiAgICAgICAgdGhpcy5fd2Fsa29uQ2VsbE1ldGFzKHNlbGVjdGlvbiwgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBfc3R5bGVfZm9udFNpemU6IHZhbHVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LCB7X3N0eWxlX2ZvbnRTaXplOiB2YWx1ZX0pO1xuICAgICAgICB0aGlzLmhhbmRzb250YWJsZS5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDorr7nva7og4zmma/oibJcbiAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgKiBAcGFyYW0gc2VsZWN0aW9uXG4gICAgICovXG4gICAgc2V0QmFja2dyb3VuZENvbG9yKHZhbHVlID0gJycsIHNlbGVjdGlvbiA9IHRoaXMuZ2V0U2VsZWN0aW9uKCkpIHtcbiAgICAgICAgdGhpcy5fd2Fsa29uQ2VsbE1ldGFzKHNlbGVjdGlvbiwgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBfc3R5bGVfYmFja2dyb3VuZENvbG9yOiB2YWx1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSwge19zdHlsZV9iYWNrZ3JvdW5kQ29sb3I6IHZhbHVlfSk7XG4gICAgICAgIHRoaXMuaGFuZHNvbnRhYmxlLnJlbmRlcigpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRklYTUUgaGFuZHNvbnRhYmxlIOeahCBCVUcg5bCa5pyq5aSE55CG77yM5rqQ56CB5aSN5p2C77yM5LiA5pe25Lmf5LiN5aW95omp5bGV44CCXG4gICAgICog6K6+572u6L655qGGXG4gICAgICogQHBhcmFtIHJhbmdlIC0g6L655qGG6IyD5Zu077yM5b2i5aaCIGB7Zm9ybToge3JvdzogMSwgY29sOiAxfSwgdG86IHtyb3c6IDMsIGNvbDogNH19YCDnmoTlr7nosaFcbiAgICAgKiBAcGFyYW0gdG9wIC0g5LiK6L655qGG77yM5b2i5aaCIGB7d2lkdGg6IDIsIGNvbG9yOiAnIzUyOTJGNyd9YCDnmoTlr7nosaFcbiAgICAgKiBAcGFyYW0gW3JpZ2h0XVxuICAgICAqIEBwYXJhbSBbYm90dG9tXVxuICAgICAqIEBwYXJhbSBbbGVmdF1cbiAgICAgKi9cbiAgICBzZXRCb3JkZXIocmFuZ2UsIHRvcCwgcmlnaHQsIGJvdHRvbSwgbGVmdCkge1xuICAgICAgICBsZXQgY29uZmlnID0ge1xuICAgICAgICAgICAgcmFuZ2U6IHJhbmdlLFxuICAgICAgICAgICAgdG9wOiB0b3BcbiAgICAgICAgfTtcbiAgICAgICAgY29uZmlnLnJpZ2h0ID0gcmlnaHQgfHwgdG9wO1xuICAgICAgICBjb25maWcuYm90dG9tID0gYm90dG9tIHx8IHRvcDtcbiAgICAgICAgY29uZmlnLmxlZnQgPSBsZWZ0IHx8IGNvbmZpZy5yaWdodDtcblxuICAgICAgICBsZXQgZm9ybWVyQm9yZGVycyA9IHRoaXMuaGFuZHNvbnRhYmxlLmdldFNldHRpbmdzKCkuY3VzdG9tQm9yZGVycztcbiAgICAgICAgaWYgKGZvcm1lckJvcmRlcnMgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGZvcm1lckJvcmRlcnMgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBmb3JtZXJCb3JkZXJzLnB1c2goY29uZmlnKTtcblxuICAgICAgICAvLyBUT0RPIGN1c3RvbUJvcmRlcnMgY2Fubm90IGJlIHVwZGF0ZWQgdmlhIHVwZGF0ZVNldHRpbmdzXG4gICAgICAgIC8vIEBzZWUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9oYW5kc29udGFibGUvaGFuZHNvbnRhYmxlL2lzc3Vlcy8yMDAyfVxuICAgICAgICB0aGlzLmhhbmRzb250YWJsZS51cGRhdGVTZXR0aW5ncyh7XG4gICAgICAgICAgICBjdXN0b21Cb3JkZXJzOiBmb3JtZXJCb3JkZXJzXG4gICAgICAgIH0pO1xuICAgICAgICAvL3RoaXMuaGFuZHNvbnRhYmxlLnJ1bkhvb2tzKCdhZnRlckluaXQnKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIOiuvue9ruaVsOaNruagvOW8j1xuICAgICAqXG4gICAgICogQHBhcmFtIHR5cGUgLSBgdGV4dGAgfCBgZGF0ZWAgfCBgbnVtZXJpY2BcbiAgICAgKiBAcGFyYW0gc2V0dGluZ3NcbiAgICAgKiBAcGFyYW0gc2VsZWN0aW9uXG4gICAgICovXG4gICAgc2V0RGF0YUZvcm1hdCh0eXBlPSd0ZXh0Jywgc2V0dGluZ3MgPSB7fSwgc2VsZWN0aW9uID0gdGhpcy5nZXRTZWxlY3Rpb24oKSkge1xuICAgICAgICB0aGlzLl93YWxrb25DZWxsTWV0YXMoc2VsZWN0aW9uLCAocm93LCBjb2wsIGNlbGxNZXRhKSA9PiB7XG4gICAgICAgICAgICBsZXQgZlR5cGUgPSBjZWxsTWV0YS50eXBlO1xuXG4gICAgICAgICAgICBpZiAoZlR5cGUgPT09ICdkYXRlJykge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBjZWxsTWV0YS5kYXRlRm9ybWF0O1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBjZWxsTWV0YS5kZWZhdWx0RGF0ZTtcbiAgICAgICAgICAgICAgICBkZWxldGUgY2VsbE1ldGEuY29ycmVjdEZvcm1hdDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZlR5cGUgPT09ICdudW1lcmljJykge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBjZWxsTWV0YS5mb3JtYXQ7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGNlbGxNZXRhLmxhbmd1YWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2VsbE1ldGEudHlwZSA9IHR5cGU7XG5cbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9oYW5kc29udGFibGUvaGFuZHNvbnRhYmxlL2lzc3Vlcy80MzYwXG4gICAgICAgICAgICBkZWxldGUgY2VsbE1ldGEucmVuZGVyZXI7XG4gICAgICAgICAgICBkZWxldGUgY2VsbE1ldGEuZWRpdG9yO1xuICAgICAgICAgICAgZGVsZXRlIGNlbGxNZXRhLnZhbGlkYXRvcjtcbiAgICAgICAgICAgIHJldHVybiBleHRlbmQoY2VsbE1ldGEsIHNldHRpbmdzKTtcbiAgICAgICAgfSwge3R5cGU6IHR5cGV9KTtcbiAgICAgICAgdGhpcy5oYW5kc29udGFibGUucmVuZGVyKCk7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFNoZWV0O1xuXG5cbi8qKlxuICogYWZ0ZXJSZW5hbWUg5LqL5Lu244CCXG4gKlxuICogQGV2ZW50IFNoZWV0I2FmdGVyUmVuYW1lXG4gKiBAdHlwZSB7U2hlZXR9XG4gKiBAdHlwZSB7c3RyaW5nfVxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuXG4vKipcbiAqIGFmdGVyUmVuYW1lQ2FuY2VsIOS6i+S7tuOAglxuICpcbiAqIEBldmVudCBTaGVldCNhZnRlclJlbmFtZUNhbmNlbFxuICogQHR5cGUge1NoZWV0fVxuICogQHR5cGUge3N0cmluZ31cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cblxuIiwiaW1wb3J0IHtTcHJlYWRTaGVldEVycm9yfSBmcm9tICcuLi9TcHJlYWRTaGVldEVycm9yJ1xuXG5leHBvcnQgZnVuY3Rpb24gU2hlZXRFcnJvcih2YWx1ZSkge1xuICAgIHRoaXMubmFtZSA9ICdTaGVldEVycm9yJztcbiAgICB0aGlzLm1lc3NhZ2UgPSB2YWx1ZTtcbn1cblNoZWV0RXJyb3IucHJvdG90eXBlID0gbmV3IFNwcmVhZFNoZWV0RXJyb3IoKTtcblNoZWV0RXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2hlZXRFcnJvcjsiLCJpbXBvcnQgVGFicyBmcm9tICAnLi92aWV3cy9UYWJzJ1xuaW1wb3J0IFNoZWV0IGZyb20gJy4vU2hlZXQnXG5pbXBvcnQge1NoZWV0RXJyb3J9IGZyb20gJy4vU2hlZXRFcnJvcidcbmltcG9ydCB7Q2FzZUluc2Vuc2l0aXZlTWFwfSBmcm9tICcuLi91dGlscy9kYXRhU3RydWN0dXJlJ1xuaW1wb3J0IHt1cHBlckNhc2V9IGZyb20gJy4uL3V0aWxzL2NvbW1vbidcbmltcG9ydCB7Z2xvYmFsU2V0dGluZ3N9IGZyb20gJy4uL3NldHRpbmdzJ1xuXG5cbmNvbnN0IHJlZ0V4cCA9IGdsb2JhbFNldHRpbmdzLnNoZWV0LnNoZWV0TmFtZTtcblxuLyoqXG4gKiDlt6XkvZznsL/jgILkuIDkuKogV29ya2Jvb2sg5YyF5ZCr5LiA5Liq5oiW5aSa5LiqIFNoZWV0IC5cbiAqL1xuY2xhc3MgV29ya2Jvb2sge1xuXG4gICAgLyoqXG4gICAgICogV29ya2Jvb2sg5p6E6YCg5ZmoXG4gICAgICogQHBhcmFtIHtTcHJlYWRTaGVldH0gaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29uZmlnXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoaW5zdGFuY2UsIGNvbmZpZykge1xuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge1NwcmVhZFNoZWV0fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zcHJlYWRTaGVldCA9IGluc3RhbmNlO1xuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge0Nhc2VJbnNlbnNpdGl2ZU1hcH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2hlZXRzID0gbmV3IENhc2VJbnNlbnNpdGl2ZU1hcCgpO1xuICAgICAgICB0aGlzLnNldHRpbmdzID0gY29uZmlnO1xuXG4gICAgICAgIHRoaXMuX2luaXRTZXR0aW5ncyhjb25maWcpO1xuICAgICAgICB0aGlzLiQkdmlldyA9IG5ldyBUYWJzKHRoaXMpO1xuXG4gICAgICAgIGNvbmZpZy5zaGVldHMuZm9yRWFjaCh2ID0+IHRoaXMuY3JlYXRlU2hlZXQodikpO1xuXG4gICAgICAgIC8vIOagueaNruWIneWni+WMluaVsOaNrua/gOa0uyBzaGVldCDpobVcbiAgICAgICAgbGV0IHRvQWN0aXZlID0gdGhpcy5nZXRTaGVldCh0aGlzLmFjdGl2ZVNoZWV0KTtcbiAgICAgICAgaWYgKCF0b0FjdGl2ZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFNoZWV0RXJyb3IoYOaMh+WumueahCBhY3RpdmVTaGVldCDkuI3lrZjlnKg6ICR7dGhpcy5hY3RpdmVTaGVldH1gKTtcbiAgICAgICAgfVxuICAgICAgICB0b0FjdGl2ZS5hY3RpdmUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzZXR0aW5nc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRTZXR0aW5ncyhzZXR0aW5ncykge1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKHNldHRpbmdzKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGtleXMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChrZXlzW2ldID09PSAnc2hlZXRzJykge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpc1trZXlzW2ldXSA9IHNldHRpbmdzW2tleXNbaV1dO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6I635Y+WIFdvcmtib29rIOaJgOWxnueahOeUteWtkOihqOagvOeahOeUqOaIt+WIneWni+mFjee9ruOAglxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0U2V0dGluZ3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNwcmVhZFNoZWV0LmdldFNldHRpbmdzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6I635Y+W5b2T5YmNIFdvcmtib29rIOeahCBpZFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0SWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlkIHx8ICh0aGlzLmlkID0gdGhpcy5zcHJlYWRTaGVldC5nZXRJZCgpICsgZ2xvYmFsU2V0dGluZ3MuaWRTdWZmaXg0V29ya2Jvb2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOagueaNruaMh+WumiBzaGVldCDlkI3ojrflj5Ygc2hlZXQg5a6e5L6LXG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7U2hlZXR9XG4gICAgICovXG4gICAgZ2V0U2hlZXQobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGVldHMuZ2V0KG5hbWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiOt+WPluW9k+WJjSBXb3JrYm9vayDkuIvnmoTmiYDmnIkgc2hlZXQg5a6e5L6LXG4gICAgICogQHJldHVybnMge0Nhc2VJbnNlbnNpdGl2ZU1hcH1cbiAgICAgKi9cbiAgICBnZXRTaGVldHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoZWV0cztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDojrflj5bmiYDmnIkgc2hlZXQg55qE5ZCN5a2XXG4gICAgICogQHJldHVybnMge0l0ZXJhdG9yLjxzdHJpbmc+fVxuICAgICAqL1xuICAgIGdldFNoZWV0TmFtZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoZWV0cy5rZXlzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5qOA6aqMIHNoZWV0IOaYr+WQpuW3suWtmOWcqFxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbZXhhY3RseT1mYWxzZV0gLSDmmK/lkKbkvb/nlKjnsr7noa7lpKflsI/lhpnnmoQgbmFtZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzU2hlZXRFeGlzdChuYW1lLCBleGFjdGx5KSB7XG4gICAgICAgIGlmIChleGFjdGx5KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaGVldHMuaGFzRXhhY3QobmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmV0dXJuICEhdGhpcy5nZXRTaGVldChuYW1lKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hlZXRzLmhhcyhuYW1lKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDnlJ/miJAgc2hlZXQg57Si5byVXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIF9nZXRBdXRvU2hlZXRJbmRleCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLiQkYXV0b1NoZWV0SW5kZXgpIHtcbiAgICAgICAgICAgIHRoaXMuJCRhdXRvU2hlZXRJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICsrdGhpcy4kJGF1dG9TaGVldEluZGV4OyAvLyDku44gMSDlvIDlp4tcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDoh6rliqjnlJ/miJAgc2hlZXQg5ZCNXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRBdXRvU2hlZXROYW1lKCkge1xuICAgICAgICBjb25zdCBwcmVmaXggPSBnbG9iYWxTZXR0aW5ncy5zaGVldC5hdXRvUHJlZml4ICsgJyc7IC8vIOmYsuatouWHuueOsOaVsOWtl+ebuOWKoFxuICAgICAgICBsZXQgbmFtZSA9IHByZWZpeCArIHRoaXMuX2dldEF1dG9TaGVldEluZGV4KCk7XG4gICAgICAgIGlmICh0aGlzLmlzU2hlZXRFeGlzdChuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldEF1dG9TaGVldE5hbWUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDojrflj5blvZPliY3mv4DmtLvnmoQgc2hlZXQg6aG1XG4gICAgICogQHJldHVybnMge1NoZWV0fVxuICAgICAqL1xuICAgIGdldEFjdGl2ZVNoZWV0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGVldHMuZ2V0KHRoaXMuYWN0aXZlU2hlZXQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWIm+W7uuaWsOeahCBzaGVldCDpobVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW2NvbmZpZ10gLSBzaGVldCDpobXnmoTphY3nva7kv6Hmga9cbiAgICAgKiBAcmV0dXJucyB7U2hlZXR9IOaWsOWIm+W7uueahOW3peS9nOihqFxuICAgICAqL1xuICAgIGNyZWF0ZVNoZWV0KGNvbmZpZykge1xuICAgICAgICBpZiAoY29uZmlnKSB7ICAvLyDmoLnmja7liJ3lp4vphY3nva7liJvlu7rvvIxuYW1lIOS4jeiDveS4uuepulxuICAgICAgICAgICAgdGhpcy5fdmFsaWRhdGVTaGVldE5hbWUoY29uZmlnLm5hbWUpO1xuICAgICAgICB9IGVsc2UgeyAvLyDnlKjmiLfmk43kvZzliJvlu7rvvIzliqjmgIHnlJ/miJAgbmFtZVxuICAgICAgICAgICAgY29uZmlnID0ge307XG4gICAgICAgICAgICBjb25maWcubmFtZSA9IHRoaXMuX2dldEF1dG9TaGVldE5hbWUoKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgbmV3T25lID0gbmV3IFNoZWV0KHRoaXMsIGNvbmZpZyk7XG4gICAgICAgIHRoaXMuc2hlZXRzLnNldChjb25maWcubmFtZSwgbmV3T25lKTtcbiAgICAgICAgcmV0dXJuIG5ld09uZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDplIDmr4HmjIflrpogc2hlZXQg6aG1XG4gICAgICogQHBhcmFtIHtzdHJpbmcgfCBTaGVldH0gc2hlZXQgLSBzaGVldCDlkI3np7DmiJblrp7kvotcbiAgICAgKi9cbiAgICBkZXN0cm95U2hlZXQoc2hlZXQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzaGVldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHNoZWV0ID0gdGhpcy5nZXRTaGVldChzaGVldCk7XG4gICAgICAgIH1cbiAgICAgICAgc2hlZXQuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOe7meaMh+WumueahCBzaGVldCDpobXph43lkb3lkI1cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZTEgLSDlvoXph43lkb3lkI3nmoQgc2hlZXQg6aG15ZCN5a2XXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUyIC0g5paw5ZCN5a2XXG4gICAgICovXG4gICAgLy8gRklYTUUg57yW6L6R6ZSZ5L2N77yaXG4gICAgLy8gaGFuZHNvbnRhYmxlIOWcqOmAieS4reafkOWNleWFg+agvOS9huayoei/m+WFpee8lui+keaXtu+8jOS8muebkeWQrCBkb2N1bWVudCDkuIrnmoQga2V5ZG93biDkuovku7bvvIxcbiAgICAvLyDpgKDmiJDkv67mlLkgc2hlZXQg5ZCN5pe255qE5paH5pys5qGG5peg5rOV5q2j56Gu5aSE55CG77yI5Lya6L6T5YWl5Yiw6KGo5qC85Lit77yJXG4gICAgLy8g5pqC5pe25L2/55SoIGlucHV0IOeahCBzZWxlY3Qg5Luj5pu/IGZvY3Vz77yM6L+r5L2/55So5oi35YaN5qyh54K55Ye7c2hlZXTlkI3ml7bmiY3og73kv67mlLnjgIJcbiAgICByZW5hbWVTaGVldChuYW1lMSwgbmFtZTIpIHtcbiAgICAgICAgbGV0IHNoZWV0ID0gdGhpcy5nZXRTaGVldChuYW1lMSk7XG4gICAgICAgIGlmICghc2hlZXQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBTaGVldEVycm9yKGDlt6XkvZzooaggXCIke25hbWUxfVwiIOS4jeWtmOWcqGApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lMSAhPT0gbmFtZTIpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZhbGlkYXRlU2hlZXROYW1lKG5hbWUyLCB1cHBlckNhc2UobmFtZTEpID09PSB1cHBlckNhc2UobmFtZTIpKTtcbiAgICAgICAgICAgIHNoZWV0LnNoZWV0TmFtZSA9IG5hbWUyO1xuICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlU2hlZXQgPT09IG5hbWUxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVTaGVldCA9IG5hbWUyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5nZXRTaGVldHMoKS5kZWxldGUobmFtZTEpO1xuICAgICAgICAgICAgdGhpcy5nZXRTaGVldHMoKS5zZXQobmFtZTIsIHNoZWV0KTtcbiAgICAgICAgICAgIHRoaXMuJCR2aWV3LnRhYlJlbmFtZShuYW1lMSwgbmFtZTIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kJHZpZXcudGFiUmVuYW1lQ2FuY2VsKG5hbWUxLCBuYW1lMik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlhbPpl63mjIflrpogc2hlZXQg6aG1XG4gICAgICovXG4gICAgY2xvc2VTaGVldChuYW1lKSB7XG4gICAgICAgIGxldCBzaGVldCA9IHRoaXMuZ2V0U2hlZXQobmFtZSk7XG4gICAgICAgIGlmICghc2hlZXQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBTaGVldEVycm9yKGDml6Dms5XlhbPpl63kuI3lrZjlnKjnmoTlt6XkvZzooaggXCIke25hbWV9XCIg44CCYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2hlZXRzLnNpemUoKSA9PT0gMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFNoZWV0RXJyb3IoYOaXoOazleWFs+mXreS7heacieeahOS4gOS4quW3peS9nOihqCBcIiR7bmFtZX1cIiDjgIJgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2hlZXQuaXNBY3RpdmUoKSkge1xuICAgICAgICAgICAgZm9yIChsZXQgayBvZiB0aGlzLnNoZWV0cy5rZXlzKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoayAmJiBrICE9PSBuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlU2hlZXQgPSBrO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldFNoZWV0KGspLmFjdGl2ZSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zaGVldHMuZGVsZXRlKG5hbWUpO1xuICAgICAgICB0aGlzLiQkdmlldy5yZW1vdmVUYWIobmFtZSk7XG4gICAgICAgIHRoaXMuZGVzdHJveVNoZWV0KHNoZWV0KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIOa/gOa0u+W9k+WJjSB3b3JrYm9va1xuICAgICAqL1xuICAgIGFjdGl2ZSgpIHtcbiAgICAgICAgdGhpcy5nZXRBY3RpdmVTaGVldCgpLmFjdGl2ZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOa/gOa0u+aMh+WumiBzaGVldFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzaGVldE5hbWVcbiAgICAgKi9cbiAgICBhY3RpdmVTaGVldChzaGVldE5hbWUpIHtcbiAgICAgICAgbGV0IHNoZWV0ID0gdGhpcy5nZXRTaGVldChzaGVldE5hbWUpO1xuICAgICAgICBpZiAoc2hlZXQpIHtcbiAgICAgICAgICAgIHNoZWV0LmFjdGl2ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6aqM6K+BIHNoZWV0IOWQjeaYr+WQpuWQiOazlVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtib29sZWFufSBleGFjdGx5XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdmFsaWRhdGVTaGVldE5hbWUobmFtZSwgZXhhY3RseSkge1xuICAgICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBTaGVldEVycm9yKCflt6XkvZzooajnmoTlkI3np7DkuI3og73kuLrnqbonKTtcbiAgICAgICAgfVxuICAgICAgICAvLyAg56aB5q2i5LiA5Lqb54m55q6K5a2X56ymXG4gICAgICAgIGlmIChyZWdFeHAudGVzdChuYW1lKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFNoZWV0RXJyb3IoYOW3peS9nOihqCBcIiR7bmFtZX1cIiDljIXlkKvpnZ7ms5XlrZfnrKZgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc1NoZWV0RXhpc3QobmFtZSwgZXhhY3RseSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBTaGVldEVycm9yKGDlt6XkvZzooaggXCIke25hbWV9XCIg5bey5a2Y5ZyoYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0RXhjaGFuZ2UoKSB7XG4gICAgICAgIGxldCBzaGVldHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgWyxzaGVldF0gb2YgdGhpcy5nZXRTaGVldHMoKS50b01hcCgpKSB7XG4gICAgICAgICAgICBzaGVldCAmJiBzaGVldHMucHVzaChzaGVldC5fZ2V0RXhjaGFuZ2UoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFjdGl2ZVNoZWV0OiB0aGlzLmFjdGl2ZVNoZWV0LFxuICAgICAgICAgICAgc2hlZXRzOiBzaGVldHNcbiAgICAgICAgfVxuICAgIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBXb3JrYm9vazsiLCJleHBvcnQgY29uc3QgRXhjaGFuZ2UgPSBTdXAgPT4gY2xhc3MgZXh0ZW5kcyBTdXAge1xuXG4gICAgX2dldEV4Y2hhbmdlKCkge1xuICAgICAgICB2YXIge2RhdGEsIGNlbGxzfSA9IHRoaXMuX2dldERhdGFNZXRhKCk7XG4gICAgICAgIHZhciB7aGVpZ2h0cywgd2lkdGhzfSA9IHRoaXMuX2dldFNpemVFeCgpO1xuICAgICAgICB2YXIgbWVyZ2VDZWxscyA9IHRoaXMuaGFuZHNvbnRhYmxlLmdldFNldHRpbmdzKCkubWVyZ2VDZWxscztcblxuICAgICAgICBpZiAobWVyZ2VDZWxscyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIG1lcmdlQ2VsbHMgPSBudWxsOyAvLyDpgb/lhY3lvLrnsbvlnovor63oqIDop6PmnpDml7bml6Dms5XlpITnkIbliqjmgIHnsbvlnotcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiB0aGlzLmdldE5hbWUoKSxcbiAgICAgICAgICAgIHNlbGVjdGlvbjogdGhpcy5nZXRTZWxlY3Rpb24oKSxcbiAgICAgICAgICAgIGRhdGE6IGRhdGEubGVuZ3RoID8gZGF0YSA6IFtdLl8sXG4gICAgICAgICAgICByb3dIZWlnaHRzOiBoZWlnaHRzLFxuICAgICAgICAgICAgY29sV2lkdGhzOiB3aWR0aHMsXG4gICAgICAgICAgICBtZXJnZUNlbGxzOiBtZXJnZUNlbGxzLFxuICAgICAgICAgICAgY2VsbE1ldGFzOiBjZWxsc1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBfZ2V0U3R5bGVzRXgobWV0YSkge1xuICAgICAgICB2YXIgcmV0ID0ge307XG4gICAgICAgIHZhciBhbGlnbm1lbnRzID0gdGhpcy5fZ2V0QWxpZ25tZW50RXgobWV0YS5jbGFzc05hbWUpO1xuICAgICAgICBpZiAoYWxpZ25tZW50cykge1xuICAgICAgICAgICAgcmV0LmFsaWdubWVudHMgPSBhbGlnbm1lbnRzXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZ2V0Rm9udEV4KG1ldGEsIHJldCk7XG4gICAgICAgIHRoaXMuX2dldEJnQ29sb3JFeChtZXRhLCByZXQpO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuXG4gICAgX2dldEJnQ29sb3JFeChtZXRhLCByZXQpIHtcbiAgICAgICAgaWYgKG1ldGEuX3N0eWxlX2JhY2tncm91bmRDb2xvcikge1xuICAgICAgICAgICAgcmV0LmJhY2tncm91bmRDb2xvciA9IG1ldGEuX3N0eWxlX2JhY2tncm91bmRDb2xvcjtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgX2dldEZvbnRFeChtZXRhLCByZXQpIHtcbiAgICAgICAgaWYgKG1ldGEuX3N0eWxlX2ZvbnRGYW1pbHkpIHtcbiAgICAgICAgICAgIHJldC5mb250RmFtaWx5ID0gbWV0YS5fc3R5bGVfZm9udEZhbWlseTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWV0YS5fc3R5bGVfZm9udFNpemUpIHtcbiAgICAgICAgICAgIHJldC5mb250U2l6ZSA9IG1ldGEuX3N0eWxlX2ZvbnRTaXplO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtZXRhLmNsYXNzTmFtZSAmJiBtZXRhLmNsYXNzTmFtZS5jb250YWlucygnc3NkLWZvbnQtaXRhbGljJykpIHtcbiAgICAgICAgICAgIHJldC5mb250U3R5bGUgPSAnaXRhbGljJztcbiAgICAgICAgfVxuICAgICAgICBpZiAobWV0YS5jbGFzc05hbWUgJiYgbWV0YS5jbGFzc05hbWUuY29udGFpbnMoJ3NzZC1mb250LWJvbGQnKSkge1xuICAgICAgICAgICAgcmV0LmZvbnRXZWlnaHQgPSAnYm9sZCc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1ldGEuY2xhc3NOYW1lICYmIG1ldGEuY2xhc3NOYW1lLmNvbnRhaW5zKCdzc2QtZm9udC11bmRlcmxpbmUnKSkge1xuICAgICAgICAgICAgcmV0LnRleHREZWNvcmF0aW9uID0gJ3VuZGVybGluZSc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1ldGEuX3N0eWxlX2NvbG9yKSB7XG4gICAgICAgICAgICByZXQuY29sb3IgPSBtZXRhLl9zdHlsZV9jb2xvcjtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgX2dldEFsaWdubWVudEV4KGNsYXNzTmFtZSkge1xuICAgICAgICB2YXIgYWxpZ25tZW50ID0gW107XG4gICAgICAgIGlmIChjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZS5jb250YWlucygnaHRMZWZ0JykgJiYgYWxpZ25tZW50LnB1c2goJ0xlZnQnKTtcbiAgICAgICAgICAgIGNsYXNzTmFtZS5jb250YWlucygnaHRDZW50ZXInKSAmJiBhbGlnbm1lbnQucHVzaCgnQ2VudGVyJyk7XG4gICAgICAgICAgICBjbGFzc05hbWUuY29udGFpbnMoJ2h0UmlnaHQnKSAmJiBhbGlnbm1lbnQucHVzaCgnUmlnaHQnKTtcbiAgICAgICAgICAgIGNsYXNzTmFtZS5jb250YWlucygnaHRKdXN0aWZ5JykgJiYgYWxpZ25tZW50LnB1c2goJ0p1c3RpZnknKTtcbiAgICAgICAgICAgIGNsYXNzTmFtZS5jb250YWlucygnaHRUb3AnKSAmJiBhbGlnbm1lbnQucHVzaCgnVG9wJyk7XG4gICAgICAgICAgICBjbGFzc05hbWUuY29udGFpbnMoJ2h0TWlkZGxlJykgJiYgYWxpZ25tZW50LnB1c2goJ01pZGRsZScpO1xuICAgICAgICAgICAgY2xhc3NOYW1lLmNvbnRhaW5zKCdodEJvdHRvbScpICYmIGFsaWdubWVudC5wdXNoKCdCb3R0b20nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWxpZ25tZW50Lmxlbmd0aCA/IGFsaWdubWVudCA6IGZhbHNlO1xuICAgIH1cblxuXG4gICAgX2dldFNpemVFeCgpIHtcbiAgICAgICAgdmFyIGhvdCA9IHRoaXMuaGFuZHNvbnRhYmxlO1xuICAgICAgICB2YXIgY29scyA9IE1hdGgubWF4KGhvdC5jb3VudENvbHMoKSAtIGhvdC5jb3VudEVtcHR5Q29scyh0cnVlKSwgMjApO1xuICAgICAgICB2YXIgcm93cyA9IE1hdGgubWF4KGhvdC5jb3VudFJvd3MoKSAtIGhvdC5jb3VudEVtcHR5Um93cyh0cnVlKSwgNTApO1xuICAgICAgICB2YXIgaGVpZ2h0cyA9IFtdO1xuICAgICAgICB2YXIgd2lkdGhzID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3dzOyArK2kpIHtcbiAgICAgICAgICAgIGxldCBoID0gaG90LmdldFJvd0hlaWdodChpKTtcbiAgICAgICAgICAgIGlmIChpID09PSAwICYmICFoKSB7IC8vIGhhbmRzb250YWJsZSBidWdcbiAgICAgICAgICAgICAgICBoID0gMjQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBoZWlnaHRzLnB1c2goaCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xzOyArK2kpIHtcbiAgICAgICAgICAgIHdpZHRocy5wdXNoKGhvdC5nZXRDb2xXaWR0aChpKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtoZWlnaHRzLCB3aWR0aHN9O1xuICAgIH1cblxuXG4gICAgX2dldERhdGFNZXRhKCkge1xuICAgICAgICB2YXIgaG90ID0gdGhpcy5oYW5kc29udGFibGU7XG4gICAgICAgIHZhciBjb2xzID0gaG90LmNvdW50Q29scygpIC0gaG90LmNvdW50RW1wdHlDb2xzKHRydWUpO1xuICAgICAgICB2YXIgcm93cyA9IGhvdC5jb3VudFJvd3MoKSAtIGhvdC5jb3VudEVtcHR5Um93cyh0cnVlKTtcbiAgICAgICAgdmFyIGRhdGEgPSBbXTtcbiAgICAgICAgdmFyIGNlbGxzID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3dzOyArK2kpIHtcbiAgICAgICAgICAgIGxldCByb3dSZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIGxldCByb3dDZWxsTWV0YSA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGNvbHM7ICsraikge1xuICAgICAgICAgICAgICAgIGxldCBfc291cmNlRGF0YSA9IGhvdC5nZXRTb3VyY2VEYXRhQXRDZWxsKGksIGopO1xuICAgICAgICAgICAgICAgIGxldCBfbWV0YSA9IGhvdC5nZXRDZWxsTWV0YShpLCBqKTtcbiAgICAgICAgICAgICAgICBsZXQgX2RhdGEgPSBob3QuZ2V0RGF0YUF0Q2VsbChpLCBqKTtcbiAgICAgICAgICAgICAgICBsZXQgX2NlbGxNYXRhID0ge307XG5cbiAgICAgICAgICAgICAgICBfY2VsbE1hdGEucm93ID0gaTtcbiAgICAgICAgICAgICAgICBfY2VsbE1hdGEuY29sID0gajtcbiAgICAgICAgICAgICAgICBfY2VsbE1hdGEuaXNGb3JtdWxhID0gISEoX3NvdXJjZURhdGEgJiYgKF9zb3VyY2VEYXRhICsgJycpLmNoYXJBdCgwKSA9PT0gJz0nKTtcbiAgICAgICAgICAgICAgICBfY2VsbE1hdGEuc291cmNlVmFsdWUgPSBfc291cmNlRGF0YTtcbiAgICAgICAgICAgICAgICBfY2VsbE1hdGEudmFsdWUgPSBfZGF0YTtcblxuICAgICAgICAgICAgICAgIChmdW5jdGlvbiAobywgbSkge1xuICAgICAgICAgICAgICAgICAgICAvL25vaW5zcGVjdGlvbiBKU1VudXNlZExvY2FsU3ltYm9scyxMb29wU3RhdGVtZW50VGhhdERvZXNudExvb3BKU1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciB4IGluIG8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uc3R5bGVzID0gbztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0odGhpcy5fZ2V0U3R5bGVzRXgoX21ldGEpLCBfY2VsbE1hdGEpKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2dldERhdGFUeXBlKF9tZXRhLCBfY2VsbE1hdGEpO1xuXG4gICAgICAgICAgICAgICAgcm93UmVzdWx0LnB1c2goX3NvdXJjZURhdGEpO1xuICAgICAgICAgICAgICAgIHJvd0NlbGxNZXRhLnB1c2goX2NlbGxNYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRhdGEucHVzaChyb3dSZXN1bHQpO1xuICAgICAgICAgICAgY2VsbHMucHVzaChyb3dDZWxsTWV0YSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtkYXRhLCBjZWxsc307XG4gICAgfVxuXG4gICAgLy8gVE9ET1xuICAgIF9nZXRCb3JkZXJzRXgoKSB7XG5cbiAgICB9XG5cbiAgICAvLyDmlbDmja7moLzlvI8gbnVtZXJpY+OAgWRhdGUg562JXG4gICAgX2dldERhdGFUeXBlKF9tZXRhLCBfY2VsbE1hdGEpIHtcbiAgICAgICAgbGV0IHQgPSBfbWV0YS50eXBlO1xuICAgICAgICBfY2VsbE1hdGEuZGF0YVR5cGUgPSB7fTtcbiAgICAgICAgX2NlbGxNYXRhLmRhdGFUeXBlLnR5cGVOYW1lID0gdDtcblxuICAgICAgICBpZiAodCA9PT0gJ2RhdGUnKSB7XG4gICAgICAgICAgICBfY2VsbE1hdGEuZGF0YVR5cGUuZGF0ZUZvcm1hdCA9IF9tZXRhLmRhdGVGb3JtYXQ7XG4gICAgICAgICAgICBfbWV0YS5kZWZhdWx0RGF0ZSAmJiAoX2NlbGxNYXRhLmRhdGFUeXBlLmRlZmF1bHREYXRlID0gX21ldGEuZGVmYXVsdERhdGUpO1xuICAgICAgICAgICAgX21ldGEuY29ycmVjdEZvcm1hdCAmJiAoX2NlbGxNYXRhLmRhdGFUeXBlLmNvcnJlY3RGb3JtYXQgPSBfbWV0YS5jb3JyZWN0Rm9ybWF0KTtcbiAgICAgICAgfSBlbHNlIGlmICh0ID09PSAnbnVtZXJpYycpIHtcbiAgICAgICAgICAgIF9jZWxsTWF0YS5kYXRhVHlwZS5mb3JtYXQgPSBfbWV0YS5mb3JtYXQ7XG4gICAgICAgICAgICBfbWV0YS5sYW5ndWFnZSAmJiAoX2NlbGxNYXRhLmRhdGFUeXBlLmxhbmd1YWdlID0gX21ldGEubGFuZ3VhZ2UpO1xuICAgICAgICB9XG4gICAgfVxufTsiLCJleHBvcnQgY29uc3QgU2hlZXRIZWxwZXIgPSBTdXAgPT4ge1xuICAgIHJldHVybiBjbGFzcyBleHRlbmRzIFN1cCB7XG5cbiAgICAgICAgLy8g6YCJ5Yy66buY6K6k5YC8XG4gICAgICAgIC8vICAgMS4g6YCJ5Yy65Y+v6IO95LuO5Y+z5LiL5b6A5bem5LiK6YCJ77yM5q2k5pe2IHJvdyA+IGVuZFJvd1xuICAgICAgICAvLyAgIDIuIGVuZFJvdyDlj4ogZW5kQ29sIOWPr+iDveS4jeWtmOWcqFxuICAgICAgICAvL++8iOS4jemcgOimgeWFs+azqOmAieWMuuaWueWQkeaXtuiwg+eUqOatpOaWueazlei/m+ihjOmihOWkhOeQhu+8iVxuICAgICAgICBfZGVmYXVsdFNlbGVjdGlvbihzKSB7XG4gICAgICAgICAgICBzLnJvdyA+IHMuZW5kUm93ICYmIChzLnJvdz1bcy5lbmRSb3csIHMuZW5kUm93PXMucm93XVswXSk7XG4gICAgICAgICAgICBzLmNvbCA+IHMuZW5kQ29sICYmIChzLmNvbD1bcy5lbmRDb2wsIHMuZW5kQ29sPXMuY29sXVswXSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhcnRSb3c6IHMucm93LFxuICAgICAgICAgICAgICAgIGVuZFJvdzogcy5lbmRSb3cgfHwgcy5yb3csXG4gICAgICAgICAgICAgICAgc3RhcnRDb2w6IHMuY29sLFxuICAgICAgICAgICAgICAgIGVuZENvbDogcy5lbmRDb2wgfHwgcy5jb2xcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvL25vaW5zcGVjdGlvbiBKU1VudXNlZEdsb2JhbFN5bWJvbHNcbiAgICAgICAgX3JlbW92ZUZvcm1lckNsYXNzKGN1cnJlbnQsIC4uLnN1cHBvcnRlZCkge1xuICAgICAgICAgICAgaWYgKCFjdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgY2xhenogb2Ygc3VwcG9ydGVkKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQuc3BsaXQoY2xhenopLmpvaW4oJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQudHJpbSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9ub2luc3BlY3Rpb24gSlNVbnVzZWRHbG9iYWxTeW1ib2xzXG4gICAgICAgIF93YWxrb25DZWxsTWV0YXMoc2VsZWN0aW9uLCBjYWxsYmFjaywgdW5ob2xkKSB7XG4gICAgICAgICAgICBsZXQge3N0YXJ0Um93LCBlbmRSb3csIHN0YXJ0Q29sLCBlbmRDb2x9ID0gdGhpcy5fZGVmYXVsdFNlbGVjdGlvbihzZWxlY3Rpb24pO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHN0YXJ0Um93OyBpIDw9IGVuZFJvdzsgKytpKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IHN0YXJ0Q29sOyBqIDw9IGVuZENvbDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjZWxsTWV0YSA9IHRoaXMuaGFuZHNvbnRhYmxlLmdldENlbGxNZXRhKGksIGopO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2VsbE1ldGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdNZXRhID0gY2FsbGJhY2suY2FsbCh0aGlzLCBpLCBqLCBjZWxsTWV0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdNZXRhICYmIHRoaXMuaGFuZHNvbnRhYmxlLnNldENlbGxNZXRhT2JqZWN0KGksIGosIG5ld01ldGEpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdW5ob2xkICYmIHRoaXMuaGFuZHNvbnRhYmxlLnNldENlbGxNZXRhT2JqZWN0KGksIGosIHVuaG9sZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL25vaW5zcGVjdGlvbiBKU1VudXNlZEdsb2JhbFN5bWJvbHNcbiAgICAgICAgX3dhbGtvbkNlbGxzKHNlbGVjdGlvbiwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGxldCB7c3RhcnRSb3csIGVuZFJvdywgc3RhcnRDb2wsIGVuZENvbH0gPSB0aGlzLl9kZWZhdWx0U2VsZWN0aW9uKHNlbGVjdGlvbik7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gc3RhcnRSb3c7IGkgPD0gZW5kUm93OyArK2kpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gc3RhcnRDb2w7IGogPD0gZW5kQ29sOyArK2opIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNlbGxURCA9IHRoaXMuaGFuZHNvbnRhYmxlLmdldENlbGwoaSwgaiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjZWxsVEQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgaSwgaiwgY2VsbFREKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgX3dhbGtvblNlbGVjdGlvbihzZWxlY3Rpb24sIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBsZXQge3N0YXJ0Um93LCBlbmRSb3csIHN0YXJ0Q29sLCBlbmRDb2x9ID0gdGhpcy5fZGVmYXVsdFNlbGVjdGlvbihzZWxlY3Rpb24pO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHN0YXJ0Um93OyBpIDw9IGVuZFJvdzsgKytpKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IHN0YXJ0Q29sOyBqIDw9IGVuZENvbDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgaSwgaik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9O1xufTsiLCJpbXBvcnQge2FsaWdubWVudEl0ZW19IGZyb20gJy4vQ29udGV4dE1lbnVfYWxpZ25tZW50J1xuaW1wb3J0IHttZXJnZUNlbGxzLCBtZXJnZUNlbGxzSGFuZGxlciwgY2FuY2VsTWVyZ2VDZWxscywgY2FuY2VsTWVyZ2VDZWxsc0hhbmRsZXJ9IGZyb20gJy4vQ29udGV4dE1lbnVfbWVyZ2VDZWxscydcbmltcG9ydCB7cm93UmVzaXplLCByb3dSZXNpemVIYW5kbGVyLCBjb2xSZXNpemUsIGNvbFJlc2l6ZUhhbmRsZXJ9IGZyb20gJy4vQ29udGV4dE1lbnVfcm93T3JDb2x1bW5SZXNpemUnXG5cbi8qKlxuICog55S15a2Q6KGo5qC85Y+z6ZSu6I+c5Y2V44CCXG4gKi9cbmZ1bmN0aW9uIENvbnRleHRNZW51KHNwcmVhZFNoZWV0KSB7XG4gICAgdGhpcy5zcHJlYWRTaGVldCA9IHNwcmVhZFNoZWV0O1xuICAgIC8qKlxuICAgICAqXG4gICAgICogQHR5cGUge01hcH1cbiAgICAgKi9cbiAgICB0aGlzLm1lbnVJdGVtcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9pbml0KCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbnRleHRNZW51O1xuXG5Db250ZXh0TWVudS5wcm90b3R5cGUucmVnaXN0ZXIgPSBmdW5jdGlvbiAoa2V5LCBjb25maWcsIGhhbmRsZXIpIHtcbiAgICB0aGlzLm1lbnVJdGVtcy5zZXQoa2V5LCB7XG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICBoYW5kbGVyOiBoYW5kbGVyXG4gICAgfSk7XG59O1xuXG4vKipcbiAqIOiOt+WPliBoYW5kc29udGFibGUg6ZyA6KaB55qE6I+c5Y2V6YWN572u6aG5XG4gKi9cbkNvbnRleHRNZW51LnByb3RvdHlwZS5nZXRNZW51SXRlbXM0SG90VGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLl9ob3RUYWJsZUl0ZW1zKSB7XG4gICAgICAgIHRoaXMuX2hvdFRhYmxlSXRlbXMgPSB7fTtcbiAgICAgICAgdGhpcy5tZW51SXRlbXMuZm9yRWFjaCgoe2NvbmZpZ30sIGtleSkgPT4gdGhpcy5faG90VGFibGVJdGVtc1trZXldID0gY29uZmlnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2hvdFRhYmxlSXRlbXM7XG59O1xuXG5cbi8qXG4gIyMjIGhhbmRzb250YWJsZSDoh6rluKblj7PplK7lip/og73vvJojIyNcbiByb3dfYWJvdmVcbiByb3dfYmVsb3dcbiBoc2VwMVxuIGNvbF9sZWZ0XG4gY29sX3JpZ2h0XG4gaHNlcDJcbiByZW1vdmVfcm93XG4gcmVtb3ZlX2NvbFxuIGhzZXAzXG4gdW5kb1xuIHJlZG9cbiBtYWtlX3JlYWRfb25seVxuIGFsaWdubWVudFxuIGJvcmRlcnNcbiAqL1xuQ29udGV4dE1lbnUucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IFNFUCA9ICctLS0tLS0tLS0nO1xuXG5cbiAgICB0aGlzLnJlZ2lzdGVyKCdyb3dfYWJvdmUnLCB7XG4gICAgICAgIG5hbWU6ICfkuIrmlrnmj5LlhaXkuIDooYwnLFxuICAgICAgICBkaXNhYmxlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8g6LCD55So6ICF6KaB56Gu5L+d5q2k5aSEIHRoaXMgIOS4uuW9k+WJjSBob3RUYWJsZSDlrp7kvotcbiAgICAgICAgICAgIC8vIFRPRE8g6ZmQ5Yi25pyA5aSn6KGM5pWwXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucmVnaXN0ZXIoJ3Jvd19iZWxvdycsIHtcbiAgICAgICAgbmFtZTogJ+S4i+aWueaPkuWFpeS4gOihjCdcbiAgICB9KTtcblxuICAgIHRoaXMucmVnaXN0ZXIoJ2NvbF9sZWZ0Jywge1xuICAgICAgICBuYW1lOiAn5bem5L6n5o+S5YWl5LiA5YiXJ1xuICAgIH0pO1xuXG4gICAgdGhpcy5yZWdpc3RlcignY29sX3JpZ2h0Jywge1xuICAgICAgICBuYW1lOiAn5Y+z5L6n5o+S5YWl5LiA5YiXJ1xuICAgIH0pO1xuXG4gICAgdGhpcy5yZWdpc3RlcignaHNlcF9idF9pbnNlcnQnLCBTRVApO1xuXG4gICAgLy8gRklYTUUgaGFuZHNvbnRhYmxlIOiHquW4pueahOWIoOmZpOWKn+iDve+8jOWcqOWtmOWcqOWNleWFg+agvOWQiOW5tuaXtuaciUJVR++8jOaUueaIkOiHquWumuS5iemAu+i+keOAglxuICAgIHRoaXMucmVnaXN0ZXIoJ3JlbW92ZV9yb3cnLCB7XG4gICAgICAgIG5hbWU6ICfliKDpmaTpgInkuK3ooYwnLFxuICAgICAgICBkaXNhYmxlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gVE9ETyDpmZDliLbmnIDlsI/ooYzmlbBcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMucmVnaXN0ZXIoJ3JlbW92ZV9jb2wnLCB7XG4gICAgICAgIG5hbWU6ICfliKDpmaTpgInkuK3liJcnXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyKCdoc2VwX2J0X3JlbW92ZScsIFNFUCk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyKCdhbGlnbm1lbnQnLCBhbGlnbm1lbnRJdGVtKCkpO1xuICAgIHRoaXMucmVnaXN0ZXIoJ3Jvd19yZXNpemUnLCByb3dSZXNpemUsIHJvd1Jlc2l6ZUhhbmRsZXIpO1xuICAgIHRoaXMucmVnaXN0ZXIoJ2NvbF9yZXNpemUnLCBjb2xSZXNpemUsIGNvbFJlc2l6ZUhhbmRsZXIpO1xuXG5cbiAgICB0aGlzLnJlZ2lzdGVyKCdoc2VwX2J0X2Zvcm1hdCcsIFNFUCk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyKCdxX21lcmdlX2NlbGxzJywgbWVyZ2VDZWxscywgbWVyZ2VDZWxsc0hhbmRsZXIpO1xuICAgIHRoaXMucmVnaXN0ZXIoJ3FfY2FuY2VsX21lcmdlX2NlbGxzJywgY2FuY2VsTWVyZ2VDZWxscywgY2FuY2VsTWVyZ2VDZWxsc0hhbmRsZXIpO1xufTtcbiIsImltcG9ydCB7TUVOVX0gZnJvbSAnLi4vLi4vaTE4bic7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9oYW5kc29udGFibGUvaGFuZHNvbnRhYmxlL2lzc3Vlcy8zODA3XG5leHBvcnQgZnVuY3Rpb24gYWxpZ25tZW50SXRlbSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiBNRU5VLlM1LFxuICAgICAgICBkaXNhYmxlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICEodGhpcy5nZXRTZWxlY3RlZFJhbmdlKCkgJiYgIXRoaXMuc2VsZWN0aW9uLnNlbGVjdGVkSGVhZGVyLmNvcm5lcik7XG4gICAgICAgIH0sXG4gICAgICAgIHN1Ym1lbnU6IHtcbiAgICAgICAgICAgIGl0ZW1zOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ2FsaWdubWVudDpsZWZ0JyxcbiAgICAgICAgICAgICAgICBuYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBoYXNDbGFzcyA9IGNoZWNrU2VsZWN0aW9uQ29uc2lzdGVuY3kodGhpcy5nZXRTZWxlY3RlZFJhbmdlKCksIChyb3csIGNvbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNsYXNzTmFtZSA9IHRoaXMuZ2V0Q2VsbE1ldGEocm93LCBjb2wpLmNsYXNzTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbGFzc05hbWUgJiYgY2xhc3NOYW1lLmluZGV4T2YoJ2h0TGVmdCcpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhhc0NsYXNzID8gbWFya0xhYmVsQXNTZWxlY3RlZChNRU5VLlM2KSA6IE1FTlUuUzY7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmFuZ2UgPSB0aGlzLmdldFNlbGVjdGVkUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXRlQmVmb3JlID0gZ2V0QWxpZ25tZW50Q2xhc3NlcyhyYW5nZSwgKHJvdywgY29sKSA9PiB0aGlzLmdldENlbGxNZXRhKHJvdywgY29sKS5jbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgdHlwZSA9ICdob3Jpem9udGFsJztcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFsaWdubWVudCA9ICdodExlZnQnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJ1bkhvb2tzKCdiZWZvcmVDZWxsQWxpZ25tZW50Jywgc3RhdGVCZWZvcmUsIHJhbmdlLCB0eXBlLCBhbGlnbm1lbnQpO1xuICAgICAgICAgICAgICAgICAgICBhbGlnbihyYW5nZSwgdHlwZSwgYWxpZ25tZW50LCAocm93LCBjb2wpID0+IHRoaXMuZ2V0Q2VsbE1ldGEocm93LCBjb2wpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2FsaWdubWVudDpjZW50ZXInLFxuICAgICAgICAgICAgICAgIG5hbWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGhhc0NsYXNzID0gY2hlY2tTZWxlY3Rpb25Db25zaXN0ZW5jeSh0aGlzLmdldFNlbGVjdGVkUmFuZ2UoKSwgKHJvdywgY29sKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2xhc3NOYW1lID0gdGhpcy5nZXRDZWxsTWV0YShyb3csIGNvbCkuY2xhc3NOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNsYXNzTmFtZSAmJiBjbGFzc05hbWUuaW5kZXhPZignaHRDZW50ZXInKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoYXNDbGFzcyA/IG1hcmtMYWJlbEFzU2VsZWN0ZWQoTUVOVS5TNykgOiBNRU5VLlM3O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJhbmdlID0gdGhpcy5nZXRTZWxlY3RlZFJhbmdlKCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdGF0ZUJlZm9yZSA9IGdldEFsaWdubWVudENsYXNzZXMocmFuZ2UsIChyb3csIGNvbCkgPT4gdGhpcy5nZXRDZWxsTWV0YShyb3csIGNvbCkuY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHR5cGUgPSAnaG9yaXpvbnRhbCc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBhbGlnbm1lbnQgPSAnaHRDZW50ZXInO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucnVuSG9va3MoJ2JlZm9yZUNlbGxBbGlnbm1lbnQnLCBzdGF0ZUJlZm9yZSwgcmFuZ2UsIHR5cGUsIGFsaWdubWVudCk7XG4gICAgICAgICAgICAgICAgICAgIGFsaWduKHJhbmdlLCB0eXBlLCBhbGlnbm1lbnQsIChyb3csIGNvbCkgPT4gdGhpcy5nZXRDZWxsTWV0YShyb3csIGNvbCkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiBgYWxpZ25tZW50OnJpZ2h0YCxcbiAgICAgICAgICAgICAgICBuYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsYWJlbCA9IE1FTlUuUzg7XG4gICAgICAgICAgICAgICAgICAgIGxldCBoYXNDbGFzcyA9IGNoZWNrU2VsZWN0aW9uQ29uc2lzdGVuY3kodGhpcy5nZXRTZWxlY3RlZFJhbmdlKCksIChyb3csIGNvbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNsYXNzTmFtZSA9IHRoaXMuZ2V0Q2VsbE1ldGEocm93LCBjb2wpLmNsYXNzTmFtZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNsYXNzTmFtZSAmJiBjbGFzc05hbWUuaW5kZXhPZignaHRSaWdodCcpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFzQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gbWFya0xhYmVsQXNTZWxlY3RlZChsYWJlbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFiZWw7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmFuZ2UgPSB0aGlzLmdldFNlbGVjdGVkUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXRlQmVmb3JlID0gZ2V0QWxpZ25tZW50Q2xhc3NlcyhyYW5nZSwgKHJvdywgY29sKSA9PiB0aGlzLmdldENlbGxNZXRhKHJvdywgY29sKS5jbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgdHlwZSA9ICdob3Jpem9udGFsJztcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFsaWdubWVudCA9ICdodFJpZ2h0JztcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJ1bkhvb2tzKCdiZWZvcmVDZWxsQWxpZ25tZW50Jywgc3RhdGVCZWZvcmUsIHJhbmdlLCB0eXBlLCBhbGlnbm1lbnQpO1xuICAgICAgICAgICAgICAgICAgICBhbGlnbihyYW5nZSwgdHlwZSwgYWxpZ25tZW50LCAocm93LCBjb2wpID0+IHRoaXMuZ2V0Q2VsbE1ldGEocm93LCBjb2wpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogYGFsaWdubWVudDpqdXN0aWZ5YCxcbiAgICAgICAgICAgICAgICBuYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsYWJlbCA9IE1FTlUuUzk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBoYXNDbGFzcyA9IGNoZWNrU2VsZWN0aW9uQ29uc2lzdGVuY3kodGhpcy5nZXRTZWxlY3RlZFJhbmdlKCksIChyb3csIGNvbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNsYXNzTmFtZSA9IHRoaXMuZ2V0Q2VsbE1ldGEocm93LCBjb2wpLmNsYXNzTmFtZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNsYXNzTmFtZSAmJiBjbGFzc05hbWUuaW5kZXhPZignaHRKdXN0aWZ5JykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYXNDbGFzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBtYXJrTGFiZWxBc1NlbGVjdGVkKGxhYmVsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYWJlbDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByYW5nZSA9IHRoaXMuZ2V0U2VsZWN0ZWRSYW5nZSgpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3RhdGVCZWZvcmUgPSBnZXRBbGlnbm1lbnRDbGFzc2VzKHJhbmdlLCAocm93LCBjb2wpID0+IHRoaXMuZ2V0Q2VsbE1ldGEocm93LCBjb2wpLmNsYXNzTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0eXBlID0gJ2hvcml6b250YWwnO1xuICAgICAgICAgICAgICAgICAgICBsZXQgYWxpZ25tZW50ID0gJ2h0SnVzdGlmeSc7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ydW5Ib29rcygnYmVmb3JlQ2VsbEFsaWdubWVudCcsIHN0YXRlQmVmb3JlLCByYW5nZSwgdHlwZSwgYWxpZ25tZW50KTtcbiAgICAgICAgICAgICAgICAgICAgYWxpZ24ocmFuZ2UsIHR5cGUsIGFsaWdubWVudCwgKHJvdywgY29sKSA9PiB0aGlzLmdldENlbGxNZXRhKHJvdywgY29sKSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnLS0tLS0tLS0tJ1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogYGFsaWdubWVudDp0b3BgLFxuICAgICAgICAgICAgICAgIG5hbWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxhYmVsID0gTUVOVS5TMTA7XG4gICAgICAgICAgICAgICAgICAgIGxldCBoYXNDbGFzcyA9IGNoZWNrU2VsZWN0aW9uQ29uc2lzdGVuY3kodGhpcy5nZXRTZWxlY3RlZFJhbmdlKCksIChyb3csIGNvbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNsYXNzTmFtZSA9IHRoaXMuZ2V0Q2VsbE1ldGEocm93LCBjb2wpLmNsYXNzTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbGFzc05hbWUgJiYgY2xhc3NOYW1lLmluZGV4T2YoJ2h0VG9wJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYXNDbGFzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBtYXJrTGFiZWxBc1NlbGVjdGVkKGxhYmVsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFiZWw7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmFuZ2UgPSB0aGlzLmdldFNlbGVjdGVkUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXRlQmVmb3JlID0gZ2V0QWxpZ25tZW50Q2xhc3NlcyhyYW5nZSwgKHJvdywgY29sKSA9PiB0aGlzLmdldENlbGxNZXRhKHJvdywgY29sKS5jbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgdHlwZSA9ICd2ZXJ0aWNhbCc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBhbGlnbm1lbnQgPSAnaHRUb3AnO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucnVuSG9va3MoJ2JlZm9yZUNlbGxBbGlnbm1lbnQnLCBzdGF0ZUJlZm9yZSwgcmFuZ2UsIHR5cGUsIGFsaWdubWVudCk7XG4gICAgICAgICAgICAgICAgICAgIGFsaWduKHJhbmdlLCB0eXBlLCBhbGlnbm1lbnQsIChyb3csIGNvbCkgPT4gdGhpcy5nZXRDZWxsTWV0YShyb3csIGNvbCkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiBgYWxpZ25tZW50Om1pZGRsZWAsXG4gICAgICAgICAgICAgICAgbmFtZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGFiZWwgPSBNRU5VLlMxMTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGhhc0NsYXNzID0gY2hlY2tTZWxlY3Rpb25Db25zaXN0ZW5jeSh0aGlzLmdldFNlbGVjdGVkUmFuZ2UoKSwgKHJvdywgY29sKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2xhc3NOYW1lID0gdGhpcy5nZXRDZWxsTWV0YShyb3csIGNvbCkuY2xhc3NOYW1lO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2xhc3NOYW1lICYmIGNsYXNzTmFtZS5pbmRleE9mKCdodE1pZGRsZScpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFzQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gbWFya0xhYmVsQXNTZWxlY3RlZChsYWJlbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFiZWw7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmFuZ2UgPSB0aGlzLmdldFNlbGVjdGVkUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXRlQmVmb3JlID0gZ2V0QWxpZ25tZW50Q2xhc3NlcyhyYW5nZSwgKHJvdywgY29sKSA9PiB0aGlzLmdldENlbGxNZXRhKHJvdywgY29sKS5jbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgdHlwZSA9ICd2ZXJ0aWNhbCc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBhbGlnbm1lbnQgPSAnaHRNaWRkbGUnO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucnVuSG9va3MoJ2JlZm9yZUNlbGxBbGlnbm1lbnQnLCBzdGF0ZUJlZm9yZSwgcmFuZ2UsIHR5cGUsIGFsaWdubWVudCk7XG4gICAgICAgICAgICAgICAgICAgIGFsaWduKHJhbmdlLCB0eXBlLCBhbGlnbm1lbnQsIChyb3csIGNvbCkgPT4gdGhpcy5nZXRDZWxsTWV0YShyb3csIGNvbCkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiBgYWxpZ25tZW50OmJvdHRvbWAsXG4gICAgICAgICAgICAgICAgbmFtZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGFiZWwgPSBNRU5VLlMxMjtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGhhc0NsYXNzID0gY2hlY2tTZWxlY3Rpb25Db25zaXN0ZW5jeSh0aGlzLmdldFNlbGVjdGVkUmFuZ2UoKSwgKHJvdywgY29sKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2xhc3NOYW1lID0gdGhpcy5nZXRDZWxsTWV0YShyb3csIGNvbCkuY2xhc3NOYW1lO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2xhc3NOYW1lICYmIGNsYXNzTmFtZS5pbmRleE9mKCdodEJvdHRvbScpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFzQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gbWFya0xhYmVsQXNTZWxlY3RlZChsYWJlbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFiZWw7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmFuZ2UgPSB0aGlzLmdldFNlbGVjdGVkUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXRlQmVmb3JlID0gZ2V0QWxpZ25tZW50Q2xhc3NlcyhyYW5nZSwgKHJvdywgY29sKSA9PiB0aGlzLmdldENlbGxNZXRhKHJvdywgY29sKS5jbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgdHlwZSA9ICd2ZXJ0aWNhbCc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBhbGlnbm1lbnQgPSAnaHRCb3R0b20nO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucnVuSG9va3MoJ2JlZm9yZUNlbGxBbGlnbm1lbnQnLCBzdGF0ZUJlZm9yZSwgcmFuZ2UsIHR5cGUsIGFsaWdubWVudCk7XG4gICAgICAgICAgICAgICAgICAgIGFsaWduKHJhbmdlLCB0eXBlLCBhbGlnbm1lbnQsIChyb3csIGNvbCkgPT4gdGhpcy5nZXRDZWxsTWV0YShyb3csIGNvbCkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgfTtcbn1cblxuXG5mdW5jdGlvbiBjaGVja1NlbGVjdGlvbkNvbnNpc3RlbmN5KHJhbmdlLCBjb21wYXJhdG9yKSB7XG4gICAgbGV0IHJlc3VsdCA9IGZhbHNlO1xuICAgIGlmIChyYW5nZSkge1xuICAgICAgICByYW5nZS5mb3JBbGwoZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gICAgICAgICAgICBpZiAoY29tcGFyYXRvcihyb3csIGNvbCkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1hcmtMYWJlbEFzU2VsZWN0ZWQobGFiZWwpIHtcbiAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVwic2VsZWN0ZWRcIj4nICsgU3RyaW5nLmZyb21DaGFyQ29kZSgxMDAwMykgKyAnPC9zcGFuPicgKyBsYWJlbDtcbn1cblxuZnVuY3Rpb24gZ2V0QWxpZ25tZW50Q2xhc3NlcyhyYW5nZSwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBjbGFzc2VzID0ge307XG4gICAgZm9yIChsZXQgcm93ID0gcmFuZ2UuZnJvbS5yb3c7IHJvdyA8PSByYW5nZS50by5yb3c7IHJvdysrKSB7XG4gICAgICAgIGZvciAobGV0IGNvbCA9IHJhbmdlLmZyb20uY29sOyBjb2wgPD0gcmFuZ2UudG8uY29sOyBjb2wrKykge1xuICAgICAgICAgICAgaWYgKCFjbGFzc2VzW3Jvd10pIHtcbiAgICAgICAgICAgICAgICBjbGFzc2VzW3Jvd10gPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsYXNzZXNbcm93XVtjb2xdID0gY2FsbGJhY2socm93LCBjb2wpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjbGFzc2VzO1xufVxuXG5mdW5jdGlvbiBhbGlnbihyYW5nZSwgdHlwZSwgYWxpZ25tZW50LCBjZWxsRGVzY3JpcHRvcikge1xuICAgIGlmIChyYW5nZS5mcm9tLnJvdyA9PT0gcmFuZ2UudG8ucm93ICYmIHJhbmdlLmZyb20uY29sID09PSByYW5nZS50by5jb2wpIHtcbiAgICAgICAgYXBwbHlBbGlnbkNsYXNzTmFtZShyYW5nZS5mcm9tLnJvdywgcmFuZ2UuZnJvbS5jb2wsIHR5cGUsIGFsaWdubWVudCwgY2VsbERlc2NyaXB0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGV0IHJvdyA9IHJhbmdlLmZyb20ucm93OyByb3cgPD0gcmFuZ2UudG8ucm93OyByb3crKykge1xuICAgICAgICAgICAgZm9yIChsZXQgY29sID0gcmFuZ2UuZnJvbS5jb2w7IGNvbCA8PSByYW5nZS50by5jb2w7IGNvbCsrKSB7XG4gICAgICAgICAgICAgICAgYXBwbHlBbGlnbkNsYXNzTmFtZShyb3csIGNvbCwgdHlwZSwgYWxpZ25tZW50LCBjZWxsRGVzY3JpcHRvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5QWxpZ25DbGFzc05hbWUocm93LCBjb2wsIHR5cGUsIGFsaWdubWVudCwgY2VsbERlc2NyaXB0b3IpIHtcbiAgICBsZXQgY2VsbE1ldGEgPSBjZWxsRGVzY3JpcHRvcihyb3csIGNvbCk7XG4gICAgbGV0IGNsYXNzTmFtZSA9IGFsaWdubWVudDtcblxuICAgIGlmIChjZWxsTWV0YS5jbGFzc05hbWUpIHtcbiAgICAgICAgaWYgKHR5cGUgPT09ICd2ZXJ0aWNhbCcpIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZSA9IHByZXBhcmVWZXJ0aWNhbEFsaWduQ2xhc3MoY2VsbE1ldGEuY2xhc3NOYW1lLCBhbGlnbm1lbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xhc3NOYW1lID0gcHJlcGFyZUhvcml6b250YWxBbGlnbkNsYXNzKGNlbGxNZXRhLmNsYXNzTmFtZSwgYWxpZ25tZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjZWxsTWV0YS5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG59XG5cblxuZnVuY3Rpb24gcHJlcGFyZVZlcnRpY2FsQWxpZ25DbGFzcyhjbGFzc05hbWUsIGFsaWdubWVudCkge1xuICAgIGlmIChjbGFzc05hbWUuaW5kZXhPZihhbGlnbm1lbnQpICE9PSAtMSkge1xuICAgICAgICByZXR1cm4gY2xhc3NOYW1lO1xuICAgIH1cbiAgICBjbGFzc05hbWUgPSBjbGFzc05hbWVcbiAgICAgICAgLnJlcGxhY2UoJ2h0VG9wJywgJycpXG4gICAgICAgIC5yZXBsYWNlKCdodE1pZGRsZScsICcnKVxuICAgICAgICAucmVwbGFjZSgnaHRCb3R0b20nLCAnJylcbiAgICAgICAgLnJlcGxhY2UoJyAgJywgJycpO1xuXG4gICAgY2xhc3NOYW1lICs9ICcgJyArIGFsaWdubWVudDtcbiAgICByZXR1cm4gY2xhc3NOYW1lO1xufVxuXG5mdW5jdGlvbiBwcmVwYXJlSG9yaXpvbnRhbEFsaWduQ2xhc3MoY2xhc3NOYW1lLCBhbGlnbm1lbnQpIHtcbiAgICBpZiAoY2xhc3NOYW1lLmluZGV4T2YoYWxpZ25tZW50KSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIGNsYXNzTmFtZTtcbiAgICB9XG4gICAgY2xhc3NOYW1lID0gY2xhc3NOYW1lXG4gICAgICAgIC5yZXBsYWNlKCdodExlZnQnLCAnJylcbiAgICAgICAgLnJlcGxhY2UoJ2h0Q2VudGVyJywgJycpXG4gICAgICAgIC5yZXBsYWNlKCdodFJpZ2h0JywgJycpXG4gICAgICAgIC5yZXBsYWNlKCdodEp1c3RpZnknLCAnJylcbiAgICAgICAgLnJlcGxhY2UoJyAgJywgJycpO1xuXG4gICAgY2xhc3NOYW1lICs9ICcgJyArIGFsaWdubWVudDtcblxuICAgIHJldHVybiBjbGFzc05hbWU7XG59IiwiaW1wb3J0IHtDb29yZGluYXRlfSBmcm9tICcuLi8uLi91dGlscy9jb21tb24nXG5pbXBvcnQge01FTlV9IGZyb20gJy4uLy4uL2kxOG4nO1xuXG5leHBvcnQgdmFyIG1lcmdlQ2VsbHMgPSB7XG4gICAgbmFtZTogTUVOVS5TMyxcbiAgICBkaXNhYmxlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICBsZXQgW3IxLCBjMSwgcjIsIGMyXSA9IHRoaXMuZ2V0U2VsZWN0ZWQoKTtcbiAgICAgICAgaWYgKHIxID09PSByMiAmJiBjMSA9PT0gYzIpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAhbWVyZ2VDb21wYXJlLmNhbGwodGhpcywgJ2lzRXF1YWwnKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VDZWxsc0hhbmRsZXIoc2hlZXQsIHN0YXJ0LCBlbmQpIHtcbiAgICBzaGVldC5tZXJnZUNlbGxzKFxuICAgICAgICBzdGFydC5yb3csXG4gICAgICAgIHN0YXJ0LmNvbCxcbiAgICAgICAgZW5kLnJvdyAtIHN0YXJ0LnJvdyArIDEsXG4gICAgICAgIGVuZC5jb2wgLSBzdGFydC5jb2wgKyAxXG4gICAgKTtcbn1cblxuXG5leHBvcnQgdmFyIGNhbmNlbE1lcmdlQ2VsbHMgPSB7XG4gICAgbmFtZTogTUVOVS5TNCxcbiAgICBkaXNhYmxlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbWVyZ2VDb21wYXJlLmNhbGwodGhpcywgJ2lzU3Vic2V0Jyk7XG4gICAgfVxufTtcblxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsTWVyZ2VDZWxsc0hhbmRsZXIoc2hlZXQsIHN0YXJ0LCBlbmQpIHtcbiAgICBzaGVldC51bk1lcmdlQ2VsbHMoXG4gICAgICAgIHN0YXJ0LnJvdyxcbiAgICAgICAgc3RhcnQuY29sLFxuICAgICAgICBlbmQucm93IC0gc3RhcnQucm93ICsgMSxcbiAgICAgICAgZW5kLmNvbCAtIHN0YXJ0LmNvbCArIDFcbiAgICApO1xufVxuXG5mdW5jdGlvbiBtZXJnZUNvbXBhcmUodHlwZSkge1xuICAgIGxldCBtZXJnZWQgPSB0aGlzLmdldFNldHRpbmdzKCkubWVyZ2VDZWxscztcbiAgICBpZiAobWVyZ2VkICYmIG1lcmdlZC5sZW5ndGgpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZXJnZWQubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGxldCB7cm93LCBjb2wsIHJvd3NwYW4sIGNvbHNwYW59ID0gbWVyZ2VkW2ldO1xuICAgICAgICAgICAgaWYgKENvb3JkaW5hdGVbdHlwZV0oXG4gICAgICAgICAgICAgICAgICAgIFtyb3csIGNvbCwgcm93ICsgcm93c3BhbiAtIDEsIGNvbCArIGNvbHNwYW4gLSAxXSxcbiAgICAgICAgICAgICAgICAgICAgY29udmVydFNlbGVjdGlvbih0aGlzLmdldFNlbGVjdGVkKCkpKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gY29udmVydFNlbGVjdGlvbihzKSB7XG4gICAgc1swXSA+IHNbMl0gJiYgKHNbMF0gPSBbc1syXSwgc1syXSA9IHNbMF1dWzBdKTtcbiAgICBzWzFdID4gc1szXSAmJiAoc1sxXSA9IFtzWzNdLCBzWzNdID0gc1sxXV1bMF0pO1xuICAgIHJldHVybiBzO1xufVxuIiwiaW1wb3J0IHtNRU5VfSBmcm9tICcuLi8uLi9pMThuJztcblxuLy8gRklYTUUgaG90IOWkhOeQhiByb3dIZWlnaHRzL2NvbFdpZHRocyDkuI4gbWFudWFsUm93UmVzaXplL21hbnVhbENvbHVtblJlc2l6ZSDml7blrZjlnKjnvLrpmbdcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9oYW5kc29udGFibGUvaGFuZHNvbnRhYmxlL2lzc3Vlcy8zMzAxXG4vLyBodHRwczovL2dpdGh1Yi5jb20vaGFuZHNvbnRhYmxlL2hhbmRzb250YWJsZS9pc3N1ZXMvNDM3MVxuZXhwb3J0IHZhciByb3dSZXNpemUgPSB7XG4gICAgbmFtZTogTUVOVS5TMSxcbiAgICBoaWRkZW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmdldFNlbGVjdGVkUmFuZ2UoKSB8fCAhdGhpcy5zZWxlY3Rpb24uc2VsZWN0ZWRIZWFkZXIucm93c1xuICAgIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiByb3dSZXNpemVIYW5kbGVyKHNoZWV0LCBzdGFydCwgZW5kKSB7XG4gICAgdmFyIGhlaWdodCA9IFtdLl87XG5cbiAgICBzdGFydC5yb3cgPiBlbmQucm93ICYmIChzdGFydC5yb3cgPSBbZW5kLnJvdywgZW5kLnJvdyA9IHN0YXJ0LnJvd11bMF0pO1xuXG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0LnJvdzsgaSA8PSBlbmQucm93OyArK2kpIHtcbiAgICAgICAgaWYgKCFoZWlnaHQpIHtcbiAgICAgICAgICAgIGhlaWdodCA9IHNoZWV0LmhhbmRzb250YWJsZS5nZXRSb3dIZWlnaHQoaSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGVpZ2h0ICE9PSBzaGVldC5oYW5kc29udGFibGUuZ2V0Um93SGVpZ2h0KGkpKSB7XG4gICAgICAgICAgICBoZWlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHZhbCA9IGhlaWdodCA9PT0gZmFsc2UgPyAnJyA6IChoZWlnaHQgfHwgMjQpO1xuXG4gICAgaWYgKF9VSVByb3ZpZGVyLnByb21wdCkge1xuICAgICAgICBfVUlQcm92aWRlci5wcm9tcHQoTUVOVS5TMTMsIHZhbCwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHNldFJvd0hlaWdodHMoc2hlZXQsIHN0YXJ0LnJvdywgZW5kLnJvdywgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGNvbnRleHRNZW51ID0gc2hlZXQuaGFuZHNvbnRhYmxlLmdldFBsdWdpbignY29udGV4dE1lbnUnKTtcbiAgICAgICAgY29udGV4dE1lbnUuY2xvc2UoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHByb21wdChNRU5VLlMxMywgdmFsKTtcbiAgICAgICAgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgc2V0Um93SGVpZ2h0cyhzaGVldCwgc3RhcnQucm93LCBlbmQucm93LCByZXN1bHQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmV4cG9ydCB2YXIgY29sUmVzaXplID0ge1xuICAgIG5hbWU6IE1FTlUuUzIsXG4gICAgaGlkZGVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5nZXRTZWxlY3RlZFJhbmdlKCkgfHwgIXRoaXMuc2VsZWN0aW9uLnNlbGVjdGVkSGVhZGVyLmNvbHNcbiAgICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gY29sUmVzaXplSGFuZGxlcihzaGVldCwgc3RhcnQsIGVuZCkge1xuICAgIHZhciB3aWR0aCA9IFtdLl87XG5cbiAgICBzdGFydC5jb2wgPiBlbmQuY29sICYmIChzdGFydC5jb2wgPSBbZW5kLmNvbCwgZW5kLmNvbCA9IHN0YXJ0LmNvbF1bMF0pO1xuXG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0LmNvbDsgaSA8PSBlbmQuY29sOyArK2kpIHtcbiAgICAgICAgaWYgKCF3aWR0aCkge1xuICAgICAgICAgICAgd2lkdGggPSBzaGVldC5oYW5kc29udGFibGUuZ2V0Q29sV2lkdGgoaSk7XG4gICAgICAgIH0gZWxzZSBpZiAod2lkdGggIT09IHNoZWV0LmhhbmRzb250YWJsZS5nZXRDb2xXaWR0aChpKSkge1xuICAgICAgICAgICAgd2lkdGggPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHZhbCA9IHdpZHRoID09PSBmYWxzZSA/ICcnIDogKHdpZHRoIHx8IDUwKTtcblxuICAgIGlmIChfVUlQcm92aWRlci5wcm9tcHQpIHtcbiAgICAgICAgX1VJUHJvdmlkZXIucHJvbXB0KE1FTlUuUzE0LCB2YWwsIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBzZXRDb2xXaWR0aHMoc2hlZXQsIHN0YXJ0LmNvbCwgZW5kLmNvbCwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGNvbnRleHRNZW51ID0gc2hlZXQuaGFuZHNvbnRhYmxlLmdldFBsdWdpbignY29udGV4dE1lbnUnKTtcbiAgICAgICAgY29udGV4dE1lbnUuY2xvc2UoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHByb21wdChNRU5VLlMxNCwgdmFsKTtcbiAgICAgICAgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgc2V0Q29sV2lkdGhzKHNoZWV0LCBzdGFydC5jb2wsIGVuZC5jb2wsIHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNldFJvd0hlaWdodHMoc2hlZXQsIHN0YXJ0LCBlbmQsIHZhbHVlKSB7XG4gICAgdmFsdWUgPSBudW1icm8oKS51bmZvcm1hdCh2YWx1ZSkgfHwgMjQ7XG4gICAgbGV0IHJvd0hlaWdodHMgPSBzaGVldC5oYW5kc29udGFibGUuZ2V0U2V0dGluZ3MoKS5yb3dIZWlnaHRzO1xuICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8PSBlbmQ7ICsraSkge1xuICAgICAgICByb3dIZWlnaHRzW2ldID0gdmFsdWU7XG4gICAgfVxuICAgIHNoZWV0LmhhbmRzb250YWJsZS51cGRhdGVTZXR0aW5ncyh7cm93SGVpZ2h0czogcm93SGVpZ2h0c30pO1xufVxuXG5mdW5jdGlvbiBzZXRDb2xXaWR0aHMoc2hlZXQsIHN0YXJ0LCBlbmQsIHZhbHVlKSB7XG4gICAgdmFsdWUgPSBudW1icm8oKS51bmZvcm1hdCh2YWx1ZSkgfHwgNTA7XG4gICAgbGV0IGNvbFdpZHRocyA9IHNoZWV0LmhhbmRzb250YWJsZS5nZXRTZXR0aW5ncygpLmNvbFdpZHRocztcbiAgICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPD0gZW5kOyArK2kpIHtcbiAgICAgICAgY29sV2lkdGhzW2ldID0gdmFsdWU7XG4gICAgfVxuICAgIHNoZWV0LmhhbmRzb250YWJsZS51cGRhdGVTZXR0aW5ncyh7Y29sV2lkdGhzOiBjb2xXaWR0aHN9KTtcbn1cblxuXG4iLCJpbXBvcnQge1xuICAgIGlubmVySFRNTCwgaW5zZXJ0QWZ0ZXIsXG4gICAgY2xvc2VzdCwgZW1wdHksXG4gICAgb3V0ZXJIZWlnaHQsIG91dGVyV2lkdGhcbn0gZnJvbSAnLi4vLi4vdXRpbHMvZG9tSGVscGVyLmpzJztcbmltcG9ydCB7aXNFbXB0eVZhbHVlLCB1cHBlckNhc2V9IGZyb20gJy4uLy4uL3V0aWxzL2NvbW1vbi5qcyc7XG5pbXBvcnQge0Nhc2VJbnNlbnNpdGl2ZU1hcH0gZnJvbSAnLi4vLi4vdXRpbHMvZGF0YVN0cnVjdHVyZS5qcyc7XG5pbXBvcnQge3N0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbn0gZnJvbSAnLi4vLi4vdXRpbHMvZXZlbnRIZWxwZXIuanMnO1xuaW1wb3J0IHtnbG9iYWxTZXR0aW5nc30gZnJvbSAnLi4vLi4vc2V0dGluZ3MuanMnO1xuaW1wb3J0IHtXQVJOU30gZnJvbSAnLi4vLi4vaTE4bic7XG5pbXBvcnQge1NoZWV0RXJyb3J9IGZyb20gJy4uLy4vU2hlZXRFcnJvcidcblxuY29uc3QgQ0xBU1NfQ1VSUkVOVCA9ICdjdXJyZW50JztcbmNvbnN0IENMQVNTX1RBQlMgPSAnc3NkLXRhYnMnO1xuY29uc3QgQ0xBU1NfQ09OVEVOVCA9ICdzc2QtdGFicy1jb250ZW50JztcbmNvbnN0IENMQVNTX1NFQ1RJT04gPSAnc3NkLXRhYnMtc2VjdGlvbic7XG5jb25zdCBDTEFTU19OQVYgPSAnc3NkLXRhYnMtbmF2JztcbmNvbnN0IENMQVNTX1VMID0gJ3NzZC10YWJzLXVsJztcbmNvbnN0IENMQVNTX0xJID0gJ3NzZC10YWJzLWxpJztcbmNvbnN0IENMQVNTX0ZYID0gJ3NzZC10YWJzLWZ4JztcblxuY29uc3QgYW5pbWF0ZWQgPSBnbG9iYWxTZXR0aW5ncy5zaGVldC5hbmltYXRlZDtcbmNvbnN0IHJlZ0V4cCA9IGdsb2JhbFNldHRpbmdzLnNoZWV0LnNoZWV0TmFtZTtcblxuLyoqXG4gKiB3b3JrYm9vayDlr7nlupTnmoTop4blm77vvIzlrp7pmYXnmoQgRE9NIOaehOaIkOOAglxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7V29ya2Jvb2t9IHdvcmtib29rXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gVGFicyh3b3JrYm9vaykge1xuICAgIHRoaXMud29ya2Jvb2sgPSB3b3JrYm9vaztcbiAgICAvKipcbiAgICAgKiBAdHlwZSB7Q2FzZUluc2Vuc2l0aXZlTWFwfVxuICAgICAqL1xuICAgIHRoaXMubGlJdGVtcyA9IG5ldyBDYXNlSW5zZW5zaXRpdmVNYXAoKTtcbiAgICB0aGlzLnNlY3Rpb25JdGVtcyA9IG5ldyBDYXNlSW5zZW5zaXRpdmVNYXAoKTtcbiAgICB0aGlzLl9ob3RUYWJsZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5yb290RWxlbWVudCA9IHdvcmtib29rLnNwcmVhZFNoZWV0LmdldFJvb3RFbGVtZW50KCk7XG4gICAgdGhpcy5kaXNwbGF5TW9kZSA9IHdvcmtib29rLnNwcmVhZFNoZWV0LmdldERpc3BsYXlNb2RlKCk7XG5cbiAgICB0aGlzLmluaXRET00oKTtcbiAgICB0aGlzLmluaXRCb3goKTtcbiAgICB0aGlzLnJlbmRlcigpO1xufVxuXG5UYWJzLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5yb290RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLlRBQlMpO1xufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovXG5UYWJzLnByb3RvdHlwZS5pbml0RE9NID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuVEFCUyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuQ09OVEVOVCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuTkFWID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbmF2Jyk7XG4gICAgdGhpcy5VTCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG5cbiAgICB0aGlzLlRBQlMuY2xhc3NMaXN0LmFkZChDTEFTU19UQUJTKTtcbiAgICB0aGlzLlRBQlMuaWQgPSB0aGlzLndvcmtib29rLmdldElkKCk7XG4gICAgdGhpcy5DT05URU5ULmNsYXNzTGlzdC5hZGQoQ0xBU1NfQ09OVEVOVCk7XG4gICAgdGhpcy5OQVYuY2xhc3NMaXN0LmFkZChDTEFTU19OQVYpO1xuICAgIHRoaXMuVUwuY2xhc3NMaXN0LmFkZChDTEFTU19VTCk7XG5cbiAgICB0aGlzLlRBQlMuYXBwZW5kQ2hpbGQodGhpcy5DT05URU5UKTtcbiAgICB0aGlzLlRBQlMuYXBwZW5kQ2hpbGQodGhpcy5OQVYpO1xuICAgIHRoaXMuTkFWLmFwcGVuZENoaWxkKHRoaXMuVUwpO1xuXG4gICAgLy8g5aKe5YqgIHNoZWV0IOmhteeahCBidXR0b25cbiAgICB0aGlzLmFwcGVuZEFkZEJ1dHRvbigpO1xufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovXG5UYWJzLnByb3RvdHlwZS5pbml0Qm94ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByb290RWwgPSB0aGlzLndvcmtib29rLnNwcmVhZFNoZWV0LmdldFJvb3RFbGVtZW50KCk7XG4gICAgdGhpcy53aWR0aCA9IHRoaXMud29ya2Jvb2sud2lkdGggfHwgb3V0ZXJXaWR0aChyb290RWwsIGZhbHNlKTtcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMud29ya2Jvb2suaGVpZ2h0IHx8IG91dGVySGVpZ2h0KHJvb3RFbCwgZmFsc2UpO1xuXG4gICAgdGhpcy5UQUJTLnN0eWxlLndpZHRoID0gdGhpcy53aWR0aCArICdweCc7XG4gICAgdGhpcy5UQUJTLnN0eWxlLmhlaWdodCA9IHRoaXMuaGVpZ2h0ICsgJ3B4Jztcbn07XG5cblxuLyoqXG4gKiDlop7liqDkuIDkuKogdGFiIOmhtVxuICogQHBhcmFtIHtzdHJpbmd9IHNoZWV0TmFtZSAtIHNoZWV0IOWQje+8jCDljbMgdGFiIOmhteeahOagh+mimFxuICovXG5UYWJzLnByb3RvdHlwZS5hcHBlbmRUYWIgPSBmdW5jdGlvbiAoc2hlZXROYW1lKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgdmFyIGNsYXp6ID0gdGhpcy5kaXNwbGF5TW9kZSA/ICcnIDogJ2Nsb3NlIGhhaXJsaW5lJztcblxuICAgIGxpLmlubmVySFRNTCA9IGBcbiAgICAgICAgPGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiPlxuICAgICAgICAgICAgPHNwYW4+JHtzaGVldE5hbWV9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCIke2NsYXp6fVwiPjwvc3Bhbj5cbiAgICAgICAgPC9hPlxuICAgIGA7XG4gICAgbGkuY2xhc3NMaXN0LmFkZChDTEFTU19MSSk7XG4gICAgbGkuc2V0QXR0cmlidXRlKCdkYXRhLXNoZWV0Jywgc2hlZXROYW1lKTtcblxuXG4gICAgdmFyIGFjdGl2ZVRhYiA9IHRoaXMuVEFCUy5xdWVyeVNlbGVjdG9yKGAuJHtDTEFTU19DVVJSRU5UfS4ke0NMQVNTX0xJfWApO1xuICAgIGlmIChhY3RpdmVUYWIpIHtcbiAgICAgICAgaW5zZXJ0QWZ0ZXIoYWN0aXZlVGFiLCBsaSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5VTC5hcHBlbmRDaGlsZChsaSk7XG4gICAgfVxuICAgIHRoaXMubGlJdGVtcy5zZXQoc2hlZXROYW1lLCBsaSk7XG5cbiAgICBsaS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciBzaGVldE5hbWUgPSB0aGlzLmRhdGFzZXQuc2hlZXQ7XG4gICAgICAgIHZhciBzaGVldCA9IHRoYXQud29ya2Jvb2suZ2V0U2hlZXQoc2hlZXROYW1lKTtcbiAgICAgICAgc2hlZXQuYWN0aXZlKCk7XG4gICAgICAgIHN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbihlKTtcbiAgICB9KTtcblxuICAgIGlmICghdGhpcy5kaXNwbGF5TW9kZSkge1xuICAgICAgICBsaS5hZGRFdmVudExpc3RlbmVyKCdkYmxjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB0aGF0Ll9vblRhYkRibGNsaWNrLmNhbGwodGhhdCwgdGhpcyk7XG4gICAgICAgICAgICBzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxpLnF1ZXJ5U2VsZWN0b3IoJy5jbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBzaGVldE5hbWUgPSBsaS5kYXRhc2V0LnNoZWV0O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGF0Lndvcmtib29rLmNsb3NlU2hlZXQoc2hlZXROYW1lKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIFNoZWV0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoZS5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbihlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5hcHBlbmRDb250ZW50KHNoZWV0TmFtZSk7XG59O1xuXG5cbi8qKlxuICog5aKe5Yqg5LiA5LiqIHRhYiDpobVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzaGVldE5hbWUgLSBzaGVldCDlkI3vvIwg5Y2zIHRhYiDpobXnmoTmoIfpophcbiAqL1xuVGFicy5wcm90b3R5cGUucmVtb3ZlVGFiID0gZnVuY3Rpb24gKHNoZWV0TmFtZSkge1xuICAgIHZhciBsaSA9IHRoaXMubGlJdGVtcy5nZXQoc2hlZXROYW1lKTtcbiAgICB0aGlzLlVMLnJlbW92ZUNoaWxkKGxpKTtcbiAgICB0aGlzLmxpSXRlbXMuZGVsZXRlKHNoZWV0TmFtZSk7XG5cbiAgICB0aGlzLnJlbW92ZUNvbnRlbnQoc2hlZXROYW1lKTtcbn07XG5cblRhYnMucHJvdG90eXBlLmFwcGVuZEFkZEJ1dHRvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICB2YXIgaW5uZXJIdG1sID0gdGhpcy5kaXNwbGF5TW9kZSA/ICcmbmJzcDsnIDogJysnO1xuXG4gICAgbGkuaW5uZXJIVE1MID0gYDxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIj48c3Bhbj4ke2lubmVySHRtbH08L3NwYW4+PC9hPmA7XG4gICAgbGkuY2xhc3NMaXN0LmFkZChDTEFTU19MSSk7XG4gICAgaWYgKCF0aGlzLmRpc3BsYXlNb2RlKSB7XG4gICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoJ2FkZC10YWInKTtcbiAgICB9XG4gICAgdGhpcy5VTC5hcHBlbmRDaGlsZChsaSk7XG5cbiAgICBpZiAoIXRoaXMuZGlzcGxheU1vZGUpIHtcbiAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciBuZXdTaGVldCA9IHRoYXQud29ya2Jvb2suY3JlYXRlU2hlZXQoKTtcbiAgICAgICAgICAgICAgICBuZXdTaGVldC5hY3RpdmUoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIFNoZWV0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoZS5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBsaVxuICogQHByaXZhdGVcbiAqL1xuVGFicy5wcm90b3R5cGUuX29uVGFiRGJsY2xpY2sgPSBmdW5jdGlvbiAobGkpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIHNoZWV0TmFtZSA9IGxpLmRhdGFzZXQuc2hlZXQ7XG4gICAgdmFyIHNwYW4gPSBsaS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3BhbicpWzBdO1xuICAgIHZhciBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG5cbiAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dCcpO1xuICAgIGlucHV0LnZhbHVlID0gc2hlZXROYW1lO1xuICAgIGlucHV0LmNsYXNzTGlzdC5hZGQoJ2VkaXRvcmlhbCcpO1xuICAgIGlucHV0LnN0eWxlLndpZHRoID0gb3V0ZXJXaWR0aChzcGFuKSArIDIwICsgJ3B4JzsgLy8g5ZCN5a2X5aSq55+t5pe25LiN5aW96L6T5YWl77yM5aKe6KGlMjBweFxuXG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNoZWNrID0gdGhhdC5fY2hlY2tUYWJOYW1lKHNoZWV0TmFtZSwgdGhpcy52YWx1ZSk7XG4gICAgICAgIGlmIChjaGVjayA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhhdC53b3JrYm9vay5yZW5hbWVTaGVldChzaGVldE5hbWUsIHRoaXMudmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWxlcnQoY2hlY2spOyAvLyBUT0RPIGFsZXJ0IOWkquS4kVxuICAgICAgICAgICAgdGhhdC50YWJSZW5hbWVDYW5jZWwoc2hlZXROYW1lLCB0aGlzLnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgICAgICAgICAgdGhpcy5ibHVyKCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGVtcHR5KHNwYW4pO1xuICAgIHNwYW4uYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgIGlucHV0LnNlbGVjdCgpO1xufTtcblxuVGFicy5wcm90b3R5cGUuX2NoZWNrVGFiTmFtZSA9IGZ1bmN0aW9uIChuYW1lMSwgbmFtZTIpIHtcbiAgICBpZiAoaXNFbXB0eVZhbHVlKG5hbWUyKSkge1xuICAgICAgICByZXR1cm4gV0FSTlMuUzE7XG4gICAgfVxuICAgIGlmIChyZWdFeHAudGVzdChuYW1lMikpIHtcbiAgICAgICAgcmV0dXJuIFdBUk5TLlMyO1xuICAgIH1cbiAgICAvLyDmlLnmiJDlhbblroPlt7LmnInnmoRzaGVldOWQjVxuICAgIGlmICh1cHBlckNhc2UobmFtZTEpICE9PSB1cHBlckNhc2UobmFtZTIpICYmIHRoaXMud29ya2Jvb2suaXNTaGVldEV4aXN0KG5hbWUyKSkge1xuICAgICAgICByZXR1cm4gV0FSTlMuUzM7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcblxuLy8g5pS55ZCN5pe277yMRE9N5LiK55qE5LiA5Lqb5pON5L2c77yM6L+b5YWl5q2k5pa55rOV5pe25Luj6KGo5bey57uP5YGa5LqG5ZCI5rOV6aqM6K+B44CCXG5UYWJzLnByb3RvdHlwZS50YWJSZW5hbWUgPSBmdW5jdGlvbiAobmFtZTEsIG5hbWUyKSB7XG4gICAgdmFyIGxpID0gdGhpcy5saUl0ZW1zLmdldChuYW1lMSk7XG4gICAgdmFyIHNwYW4gPSBsaS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3BhbicpWzBdO1xuICAgIGlubmVySFRNTChzcGFuLCBuYW1lMik7XG4gICAgbGkuZGF0YXNldC5zaGVldCA9IG5hbWUyO1xuICAgIHRoaXMubGlJdGVtcy5zZXQobmFtZTIsIGxpKTtcbiAgICB2YXIgc2VjdGlvbiA9IHRoaXMuc2VjdGlvbkl0ZW1zLmdldChuYW1lMSk7XG4gICAgc2VjdGlvbi5kYXRhc2V0LnNoZWV0ID0gbmFtZTI7XG4gICAgdGhpcy5zZWN0aW9uSXRlbXMuZGVsZXRlKG5hbWUxKTtcbiAgICB0aGlzLnNlY3Rpb25JdGVtcy5zZXQobmFtZTIsIHNlY3Rpb24pO1xuXG4gICAgdmFyIHNoZWV0Tm93ID0gdGhpcy53b3JrYm9vay5nZXRTaGVldChuYW1lMik7XG4gICAgc2hlZXROb3cuZW1pdCgnYWZ0ZXJSZW5hbWUnLCBzaGVldE5vdywgbmFtZTEsIG5hbWUyKTtcbn07XG5cbi8vIOabtOWQjeWksei0pe+8jOWwhuWQjeWtl+iuvuS4uiBuYW1lMSwgbmFtZTLkuLrlpLHotKXnmoTlkI3lrZdcblRhYnMucHJvdG90eXBlLnRhYlJlbmFtZUNhbmNlbCA9IGZ1bmN0aW9uIChuYW1lMSwgbmFtZTIpIHtcbiAgICB2YXIgbGkgPSB0aGlzLmxpSXRlbXMuZ2V0KG5hbWUxKTtcbiAgICB2YXIgc3BhbiA9IGxpLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzcGFuJylbMF07XG4gICAgaW5uZXJIVE1MKHNwYW4sIG5hbWUxKTtcblxuICAgIHZhciBzaGVldE5vdyA9IHRoaXMud29ya2Jvb2suZ2V0U2hlZXQobmFtZTEpO1xuICAgIHNoZWV0Tm93LmVtaXQoJ2FmdGVyUmVuYW1lQ2FuY2VsJywgc2hlZXROb3csIG5hbWUxLCBuYW1lMik7XG59O1xuXG5cbi8qKlxuICog5aKe5Yqg5qCH562+6aG15a+55bqU55qE5YaF5a65XG4gKiBAcGFyYW0ge3N0cmluZ30gc2hlZXROYW1lXG4gKi9cblRhYnMucHJvdG90eXBlLmFwcGVuZENvbnRlbnQgPSBmdW5jdGlvbiAoc2hlZXROYW1lKSB7XG4gICAgdmFyIHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XG4gICAgdmFyIGZ4ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdmFyIGhvdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgc2VjdGlvbi5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2hlZXQnLCBzaGVldE5hbWUpO1xuICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQoZngpO1xuICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQoaG90KTtcbiAgICBzZWN0aW9uLmNsYXNzTGlzdC5hZGQoQ0xBU1NfU0VDVElPTik7XG4gICAgYW5pbWF0ZWQgJiYgc2VjdGlvbi5jbGFzc0xpc3QuYWRkKCdzc2QtYW5pbWF0ZWQtZmFzdCcpO1xuXG4gICAgdGhpcy5DT05URU5ULmFwcGVuZENoaWxkKHNlY3Rpb24pO1xuICAgIHRoaXMuc2VjdGlvbkl0ZW1zLnNldChzaGVldE5hbWUsIHNlY3Rpb24pO1xuXG4gICAgdGhpcy5hcHBlbmRGeChmeCwgc2hlZXROYW1lKTtcbiAgICB0aGlzLmFwcGVuZFRhYmxlKGhvdCwgc2hlZXROYW1lKTtcbn07XG5cblxuVGFicy5wcm90b3R5cGUucmVtb3ZlQ29udGVudCA9IGZ1bmN0aW9uIChzaGVldE5hbWUpIHtcbiAgICB2YXIgc2VjdGlvbiA9IHRoaXMuc2VjdGlvbkl0ZW1zLmdldChzaGVldE5hbWUpO1xuICAgIHRoaXMuQ09OVEVOVC5yZW1vdmVDaGlsZChzZWN0aW9uKTtcbiAgICB0aGlzLnNlY3Rpb25JdGVtcy5kZWxldGUoc2hlZXROYW1lKTtcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzaGVldE5hbWVcbiAqL1xuVGFicy5wcm90b3R5cGUuaGlkZUNvbnRlbnQgPSBmdW5jdGlvbiAoc2hlZXROYW1lKSB7XG4gICAgdmFyIHNlY3Rpb24gPSB0aGlzLnNlY3Rpb25JdGVtcy5nZXQoc2hlZXROYW1lKTtcbiAgICBzZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG59O1xuXG5cbi8qKlxuICogVE9ETyDlhazlvI/ovpPlhaXmoYZcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBmeFxuICogQHBhcmFtIHtzdHJpbmd9IHNoZWV0TmFtZVxuICovXG5UYWJzLnByb3RvdHlwZS5hcHBlbmRGeCA9IGZ1bmN0aW9uIChmeCwgc2hlZXROYW1lKSB7XG4gICAgZnguY2xhc3NMaXN0LmFkZChDTEFTU19GWCk7XG4gICAgZnguY2xhc3NMaXN0LmFkZChgJHtDTEFTU19GWH0tJHtzaGVldE5hbWV9YCk7XG59O1xuXG4vKipcbiAqIOWBh+a4suafkyBIYW5zb250YWJsZSDnu4Tku7bjgIJcbiAqIGhhbmRzb250YWJsZSDnmoTorr7orqHml6Dms5XlnKhET03kuK3orqHnrpfop4blm77vvIzlv4XpobvmuLLmn5Nyb290RWxlbWVudOS5i+WQjuaJjeiDveeUn+aViOOAglxuICog5a+86Ie05bu26L+f5riy5p+T6Zq+5Lul5a6e546w77yM5pyJ5riy5p+T5oCn6IO96Zeu6aKY5pe25YaN6Kej5Yaz44CCXG4gKiDlj6blpJbvvIzmuLLmn5PliLDlhYjpmpDol4/lkI7mmL7npLrnmoTlhYPntKDkuK3ml7bvvIzkuZ/ml6Dms5XmraPluLjmmL7npLrjgIJcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gaG90XG4gKiBAcGFyYW0gc2hlZXROYW1lXG4gKi9cblRhYnMucHJvdG90eXBlLmFwcGVuZFRhYmxlID0gZnVuY3Rpb24gKGhvdCwgc2hlZXROYW1lKSB7XG4gICAgdGhpcy5faG90VGFibGVzLnNldChzaGVldE5hbWUsIHtcbiAgICAgICAgY29udGFpbmVyOiBob3QsXG4gICAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgICBoZWlnaHQ6ICgpID0+IHRoaXMuaGVpZ2h0IC0gb3V0ZXJIZWlnaHQodGhpcy5OQVYpXG4gICAgfSk7XG59O1xuXG4vKipcbiAqIOa/gOa0u+aMh+WumueahOagh+etvumhtVxuICogQHBhcmFtIHtzdHJpbmd9IHNoZWV0TmFtZSAtIHNoZWV0IOWQjVxuICovXG5UYWJzLnByb3RvdHlwZS5hY3RpdmVUYWIgPSBmdW5jdGlvbiAoc2hlZXROYW1lKSB7XG4gICAgdmFyIGZvcm1lciA9IHRoaXMuVEFCUy5xdWVyeVNlbGVjdG9yKGAuJHtDTEFTU19DVVJSRU5UfS4ke0NMQVNTX0xJfWApO1xuICAgIGZvcm1lciAmJiBmb3JtZXIuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19DVVJSRU5UKTtcbiAgICB2YXIgbGkgPSB0aGlzLmxpSXRlbXMuZ2V0KHNoZWV0TmFtZSk7XG4gICAgbGkuY2xhc3NMaXN0LmFkZChDTEFTU19DVVJSRU5UKTtcbiAgICB0aGlzLmFjdGl2ZUNvbnRlbnQoc2hlZXROYW1lKTtcbn07XG5cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHNoZWV0TmFtZSAtIHNoZWV0IOWQjVxuICovXG5UYWJzLnByb3RvdHlwZS5hY3RpdmVDb250ZW50ID0gZnVuY3Rpb24gKHNoZWV0TmFtZSkge1xuICAgIHZhciBzZWN0aW9uID0gdGhpcy5zZWN0aW9uSXRlbXMuZ2V0KHNoZWV0TmFtZSk7XG4gICAgdmFyIGZvcm1lciA9IHRoaXMuX2Zvcm1lckFjdGl2ZUNvbnRlbnQ7XG4gICAgaWYgKGZvcm1lcikge1xuICAgICAgICBhbmltYXRlZCAmJiBmb3JtZXIuY2xhc3NMaXN0LnJlbW92ZSgnZmFkZUluJyk7XG4gICAgICAgIGZvcm1lci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cbiAgICBzZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIGFuaW1hdGVkICYmIHNlY3Rpb24uY2xhc3NMaXN0LmFkZCgnZmFkZUluJyk7XG5cbiAgICB0aGlzLl9mb3JtZXJBY3RpdmVDb250ZW50ID0gc2VjdGlvbjtcbn07XG5cblxuZXhwb3J0IGRlZmF1bHQgVGFiczsiLCJleHBvcnQgY29uc3QgV0FSTlMgPSB7XG4gICAgUzE6ICflt6XkvZzooajlkI3kuI3og73kuLrnqbrnmb3jgIInLFxuICAgIFMyOiBg5bel5L2c6KGo5ZCN56ew5YyF5ZCr5peg5pWI5a2X56ymOiA6IFxcIC8gPyAqIFsgXeOAgmAsXG4gICAgUzM6ICfor6XlkI3np7Dlt7Looqvkvb/nlKjvvIzor7flsJ3or5Xlhbbku5blkI3np7DjgIInXG59O1xuXG5cbmV4cG9ydCBjb25zdCBNRU5VID0ge1xuICAgIFMxOiAn6KGM6auYLi4uJyxcbiAgICBTMjogJ+WIl+WuvS4uLicsXG4gICAgUzM6ICfljZXlhYPmoLzlkIjlubYnLFxuICAgIFM0OiAn5Y+W5raI5Y2V5YWD5qC85ZCI5bm2JyxcbiAgICBTNTogJ+Wvuem9kCcsXG4gICAgUzY6ICflt6blr7npvZAnLFxuICAgIFM3OiAn5rC05bmz5bGF5LitJyxcbiAgICBTODogJ+WPs+Wvuem9kCcsXG4gICAgUzk6ICfkuKTnq6/lr7npvZAnLFxuICAgIFMxMDogJ+mhtumDqOWvuem9kCcsXG4gICAgUzExOiAn5Z6C55u05bGF5LitJyxcbiAgICBTMTI6ICflupXpg6jlr7npvZAnLFxuICAgIFMxMzogJ+ivt+i+k+WFpeihjOmrmCcsXG4gICAgUzE0OiAn6K+36L6T5YWl5YiX5a69J1xufTsiLCJpbXBvcnQge1BsdWdpbkVycm9yfSBmcm9tICcuL1BsdWdpbkVycm9yJ1xuXG52YXIgX3BsdWdpbnMgPSBuZXcgTWFwKCk7XG5cbi8qKlxuICog5o+S5Lu25Z+657G7XG4gKi9cbmNsYXNzIFBsdWdpbiB7XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3ByZWFkU2hlZXR9IHNwcmVhZFNoZWV0XG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc3ByZWFkU2hlZXQpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtTcHJlYWRTaGVldH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc3ByZWFkc2hlZXQgPSBzcHJlYWRTaGVldDtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8g5pqC5pe25LiN6ICD6JmR5byA5pS+6L+Z5Liq5pa55rOV77yM55So5oi35a6a5LmJ55qE5o+S5Lu25LiN6IO95omp5bGVIFNwcmVhZFNoZWV0IOeahCBBUElcbiAgICBfcmVnaXN0ZXJNZXRob2QobmFtZSkge1xuICAgICAgICB2YXIgcHJvdG8gPSB0aGlzLnNwcmVhZHNoZWV0LmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcbiAgICAgICAgcHJvdG9bbmFtZV0gPSAoKSA9PiB0aGlzW25hbWVdKCk7XG4gICAgfVxuXG4gICAgaXNFbmFibGUoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBlbmFibGUoKSB7XG5cbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuXG4gICAgfVxuXG59XG5cbmV4cG9ydCB7UGx1Z2lufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVQbHVnaW4ocCkge1xuICAgIGlmICghcC5lbmFibGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFBsdWdpbkVycm9yKCfmj5Lku7blv4XpobvljIXlkKvlkK/nlKjmlrnms5XvvJplbmFibGUnKTtcbiAgICB9XG4gICAgaWYgKCFwLmRlc3Ryb3kpIHtcbiAgICAgICAgdGhyb3cgbmV3IFBsdWdpbkVycm9yKCfmj5Lku7blv4XpobvljIXlkKvplIDmr4Hmlrnms5XvvJpkZXN0cm95Jyk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJQbHVnaW4obmFtZSwgcGx1Z2luKSB7XG4gICAgX3BsdWdpbnMuc2V0KG5hbWUsIHBsdWdpbik7XG4gICAgcGx1Z2luLnByb3RvdHlwZS5fX25hbWVfXyA9IG5hbWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQbHVnaW4obmFtZSkge1xuICAgIHZhciBwID0gX3BsdWdpbnMuZ2V0KG5hbWUpO1xuICAgIGlmICghcCkge1xuICAgICAgICB0aHJvdyBuZXcgUGx1Z2luRXJyb3IoJ+aPkuS7tuS4jeWtmOWcqO+8micgKyBuYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG59XG5cbi8qKlxuICog6I635Y+W5omA5pyJ5o+S5Lu2XG4gKiBAcmV0dXJucyB7TWFwfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsUGx1Z2lucygpIHtcbiAgICByZXR1cm4gX3BsdWdpbnM7XG59XG5cblxuIiwiaW1wb3J0IHtTcHJlYWRTaGVldEVycm9yfSBmcm9tICcuLi9TcHJlYWRTaGVldEVycm9yJ1xuXG5leHBvcnQgZnVuY3Rpb24gUGx1Z2luRXJyb3IodmFsdWUpIHtcbiAgICB0aGlzLm5hbWUgPSAnUGx1Z2luRXJyb3InO1xuICAgIHRoaXMubWVzc2FnZSA9IHZhbHVlO1xufVxuUGx1Z2luRXJyb3IucHJvdG90eXBlID0gbmV3IFNwcmVhZFNoZWV0RXJyb3IoKTtcblBsdWdpbkVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBsdWdpbkVycm9yOyIsImltcG9ydCB7UGx1Z2lufSBmcm9tICcuLi9QbHVnaW4nO1xuaW1wb3J0IHtTdG9yYWdlfSBmcm9tICcuL1N0b3JhZ2UnO1xuXG5jbGFzcyBQZXJzaXN0ZW50IGV4dGVuZHMgUGx1Z2luIHtcblxuICAgIGNvbnN0cnVjdG9yKHNzZCkge1xuICAgICAgICBzdXBlcihzc2QpO1xuXG4gICAgICAgIHZhciBzZXR0aW5ncyA9IHRoaXMuc3ByZWFkc2hlZXQuc2V0dGluZ3M7XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLnBlcnNpc3RlbnQgPT09IHRydWUpIHtcbiAgICAgICAgICAgIC8vIHBlcnNpc3RlbnQg5Li6IGB0cnVlYCDml7bvvIzkvb/nlKjpu5jorqTmlrnmoYhcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICog55S15a2Q6KGo5qC85pys5Zyw5oyB5LmF5YyW5pe25L2/55So55qEIGtleVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLnBlcnNpc3RlbnRLZXkgPSBzc2QuZ2V0SWQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRPRE8gcGVyc2lzdGVudCDkuLrlr7nosaHml7bvvIzmj5DkvpsgbG9jYWxTdG9yYWdl44CBc2Vzc2lvbiDnrYnmlrnmoYjlj4rotoXml7bml7bpl7TnrYnnm7jlhbPphY3nva5cbiAgICAgICAgICAgIHRoaXMucGVyc2lzdGVudEtleSA9IHNldHRpbmdzLnBlcnNpc3RlbnQua2V5O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zcHJlYWRzaGVldC5zZXR0aW5ncyA9IFN0b3JhZ2UubG9hZCh0aGlzLnBlcnNpc3RlbnRLZXkpIHx8IHNldHRpbmdzO1xuXG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyTWV0aG9kKCdzYXZlU3RhdGUnKTtcbiAgICB9XG5cbiAgICBpc0VuYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5zcHJlYWRzaGVldC5nZXRTZXR0aW5ncygpLnBlcnNpc3RlbnQ7XG4gICAgfVxuXG4gICAgZW5hYmxlKCkge1xuICAgICAgICBzdXBlci5lbmFibGUoKTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICBzdXBlci5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgc2F2ZVN0YXRlKCkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuc3ByZWFkc2hlZXQuZ2V0RXhjaGFuZ2VEYXRhKCk7XG4gICAgICAgIFN0b3JhZ2Uuc2F2ZSh0aGlzLnBlcnNpc3RlbnRLZXksIGRhdGEpO1xuICAgIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBQZXJzaXN0ZW50OyIsIi8qKlxuICog5a2Y5YKo5pa55qGIXG4gKi9cbmNsYXNzIFN0b3JhZ2Uge1xuXG4gICAgc3RhdGljIHNhdmUoa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdmFsdWUgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFN0b3JhZ2UuUFJFRklYICsga2V5LCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGxvYWQoa2V5KSB7XG4gICAgICAgIHZhciB2YWwgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oU3RvcmFnZS5QUkVGSVggKyBrZXkpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UodmFsKTtcbiAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIHJlbW92ZShrZXkpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhbFN0b3JhZ2VbU3RvcmFnZS5QUkVGSVggKyBrZXldKSB7XG4gICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oU3RvcmFnZS5QUkVGSVggKyBrZXkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGNsZWFyKCkge1xuICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLmNsZWFyKCk7XG4gICAgfVxuXG59XG5cblN0b3JhZ2UuUFJFRklYID0gJyQkYnJpY2shc3RvcmFnZS0nO1xuXG5leHBvcnQge1N0b3JhZ2V9OyIsIi8qKlxuICpcbiAqIEBwYXJhbSBfZyDlhajlsYDlj5jph4/vvIjljbPmtY/op4jlmajnjq/looPkuIvnmoQgd2luZG93IOWvueixoe+8iVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwb2x5ZmlsbChfZykge1xuXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGVzNiBwb2x5ZmlsbFxuXG4gICAgLy8gTnVtYmVyLmlzTmFOKClcbiAgICBpZiAoIV9nLk51bWJlci5pc05hTikge1xuICAgICAgICBfZy5OdW1iZXIuaXNOYU4gPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgcmV0dXJuIHggIT09IHg7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTdHJpbmcuY29udGFpbnMoKVxuICAgIGlmICh0eXBlb2YgX2cuU3RyaW5nLnByb3RvdHlwZS5jb250YWlucyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgX2cuU3RyaW5nLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgICAgIHJldHVybiAhIX50aGlzLmluZGV4T2Yoc3RyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFN0cmluZy5zdGFydHNXaXRoKClcbiAgICBpZiAoIVN0cmluZy5wcm90b3R5cGUuc3RhcnRzV2l0aCkge1xuICAgICAgICBTdHJpbmcucHJvdG90eXBlLnN0YXJ0c1dpdGggPSBmdW5jdGlvbiAoc2VhcmNoU3RyaW5nLCBwb3NpdGlvbikge1xuICAgICAgICAgICAgcG9zaXRpb24gPSBwb3NpdGlvbiB8fCAwO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3Vic3RyKHBvc2l0aW9uLCBzZWFyY2hTdHJpbmcubGVuZ3RoKSA9PT0gc2VhcmNoU3RyaW5nO1xuICAgICAgICB9O1xuICAgIH1cblxuXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIElFIHBvbHlmaWxsXG5cbiAgICAvLyBIVE1MRWxlbWVudC5jbGFzc0xpc3RcbiAgICBpZiAoISgnY2xhc3NMaXN0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShIVE1MRWxlbWVudC5wcm90b3R5cGUsICdjbGFzc0xpc3QnLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiB1cGRhdGUoZm4pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNsYXNzZXMgPSBzZWxmLmNsYXNzTmFtZS5zcGxpdCgvXFxzKy9nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGNsYXNzZXMuaW5kZXhPZih2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZuKGNsYXNzZXMsIGluZGV4LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNsYXNzTmFtZSA9IGNsYXNzZXMuam9pbignICcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkOiB1cGRhdGUoZnVuY3Rpb24gKGNsYXNzZXMsIGluZGV4LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF+aW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcblxuICAgICAgICAgICAgICAgICAgICByZW1vdmU6IHVwZGF0ZShmdW5jdGlvbiAoY2xhc3NlcywgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh+aW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuXG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZTogdXBkYXRlKGZ1bmN0aW9uIChjbGFzc2VzLCBpbmRleCwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh+aW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5zOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhIX5zZWxmLmNsYXNzTmFtZS5zcGxpdCgvXFxzKy9nKS5pbmRleE9mKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICBpdGVtOiBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuY2xhc3NOYW1lLnNwbGl0KC9cXHMrL2cpW2ldIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbn1cblxuXG5cblxuXG4iLCIvKipcbiAqIOWFqOWxgOmFjee9ruOAglxuICovXG52YXIgZ2xvYmFsU2V0dGluZ3MgPSB7XG4gICAgaWRQcmVmaXg6ICdicmljay1zc2QtJyxcbiAgICBpZFN1ZmZpeDRXb3JrYm9vazogJy13b3JrYm9vaycsXG5cbiAgICBzaGVldDoge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDoh6rliqjnlJ/miJDlt6XkvZzooajlkI3np7Dml7bnmoTliY3nvIAo5bel5L2c6KGoMSwg5bel5L2c6KGoMi4uLilcbiAgICAgICAgICovXG4gICAgICAgIGF1dG9QcmVmaXg6ICflt6XkvZzooagnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBzaGVldCDlkI3np7DkuK3nmoTpnZ7ms5XlrZfnrKbjgILlvq7ova/msqHmnInnm7jlhbPmlofmoaPvvIzku6XkuIvmmK8gQXBhY2hlIFBPSSDnmoTor7TmmI7vvJpcbiAgICAgICAgICpcbiAgICAgICAgICogTm90ZSB0aGF0IHNoZWV0IG5hbWUgaW4gRXhjZWwgbXVzdCBub3QgZXhjZWVkIDMxIGNoYXJhY3RlcnNcbiAgICAgICAgICogYW5kIG11c3Qgbm90IGNvbnRhaW4gYW55IG9mIHRoZSBhbnkgb2YgdGhlIGZvbGxvd2luZyBjaGFyYWN0ZXJzOlxuICAgICAgICAgKiAgICAtIDB4MDAwMFxuICAgICAgICAgKiAgICAtIDB4MDAwM1xuICAgICAgICAgKiAgICAtIGNvbG9uICg6KVxuICAgICAgICAgKiAgICAtIGJhY2tzbGFzaCAoXFwpXG4gICAgICAgICAqICAgIC0gYXN0ZXJpc2sgKCopXG4gICAgICAgICAqICAgIC0gcXVlc3Rpb24gbWFyayAoPylcbiAgICAgICAgICogICAgLSBmb3J3YXJkIHNsYXNoICgvKVxuICAgICAgICAgKiAgICAtIG9wZW5pbmcgc3F1YXJlIGJyYWNrZXQgKFspXG4gICAgICAgICAqICAgIC0gY2xvc2luZyBzcXVhcmUgYnJhY2tldCAoXSlcbiAgICAgICAgICpcbiAgICAgICAgICovXG4gICAgICAgIHNoZWV0TmFtZTogL1tcXFxcL1xcP1xcKjpcXFtcXF0nXCJdLyxcblxuICAgICAgICBhbmltYXRlZDogZmFsc2VcbiAgICB9XG5cbn07XG5cblxuLyoqXG4gKiDpu5jorqTphY3nva5cbiAqL1xudmFyIGRlZmF1bHRTZXR0aW5ncyA9IHtcblxuICAgIHdvcmtib29rOiB7XG4gICAgICAgIGFjdGl2ZVNoZWV0OiAn5bel5L2c6KGoMScsXG4gICAgICAgIHNoZWV0czogW3tcbiAgICAgICAgICAgIG5hbWU6ICflt6XkvZzooagxJ1xuICAgICAgICB9XVxuICAgIH0sXG5cbiAgICBwZXJzaXN0ZW50OiB0cnVlXG5cbn07XG5cbmV4cG9ydCB7Z2xvYmFsU2V0dGluZ3MsIGRlZmF1bHRTZXR0aW5nc307IiwiLyoqXG4gKiDkuovku7blj5HlsITlmahcbiAqXG4gKiBQUzogbm9kZWpzIOeahOezu+e7n+exu+W6kyBFbWl0dGVyIOi/h+Wkp++8jOS4jemAguWQiOWcqOa1j+iniOWZqOeOr+Wig+S9v+eUqOOAguaVheW8leWFpeS4gOS4queugOaYk+WunueOsOOAglxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEVtaXR0ZXIoKSB7XG4gICAgLy8g5L+d5oyB5q2k5Ye95pWw5Li656m677yM5Lul5L6/5LqO57un5om/XG59XG5cbkVtaXR0ZXIucHJvdG90eXBlID0ge1xuXG4gICAgLyoqXG4gICAgICog6K6i6ZiF5LqL5Lu2XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSDkuovku7blkI1cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIOS6i+S7tuWbnuiwg+WHveaVsFxuICAgICAqIEBwYXJhbSBbY3R4XSAtIOiuvue9ruiwg+eUqCBjYWxsYmFjayDml7bnmoTkuIrkuIvmlodcbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn1cbiAgICAgKi9cbiAgICBvbjogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrLCBjdHgpIHtcbiAgICAgICAgdmFyIGUgPSB0aGlzLmUgfHwgKHRoaXMuZSA9IHt9KTtcblxuICAgICAgICAoZVtuYW1lXSB8fCAoZVtuYW1lXSA9IFtdKSkucHVzaCh7XG4gICAgICAgICAgICBmbjogY2FsbGJhY2ssXG4gICAgICAgICAgICBjdHg6IGN0eFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog6K6i6ZiF5LiA5qyh5oCn5LqL5Lu2XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSDkuovku7blkI1cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIOS6i+S7tuWbnuiwg+WHveaVsFxuICAgICAqIEBwYXJhbSBjdHggLSDorr7nva7osIPnlKggY2FsbGJhY2sg5pe255qE5LiK5LiL5paHXG4gICAgICogQHJldHVybnMgeyp8RW1pdHRlcn1cbiAgICAgKi9cbiAgICBvbmNlOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2ssIGN0eCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgZnVuY3Rpb24gbGlzdGVuZXIoKSB7XG4gICAgICAgICAgICBzZWxmLm9mZihuYW1lLCBsaXN0ZW5lcik7XG4gICAgICAgICAgICBjYWxsYmFjay5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cblxuICAgICAgICBsaXN0ZW5lci5fID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzLm9uKG5hbWUsIGxpc3RlbmVyLCBjdHgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDlj5HlsITmjIflrprkuovku7ZcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIOS6i+S7tuWQjVxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfVxuICAgICAqL1xuICAgIGVtaXQ6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHZhciBkYXRhID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICB2YXIgZXZ0QXJyID0gKCh0aGlzLmUgfHwgKHRoaXMuZSA9IHt9KSlbbmFtZV0gfHwgW10pLnNsaWNlKCk7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgdmFyIGxlbiA9IGV2dEFyci5sZW5ndGg7XG5cbiAgICAgICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGV2dEFycltpXS5mbi5hcHBseShldnRBcnJbaV0uY3R4LCBkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDms6jplIDkuovku7ZcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIOS6i+S7tuWQjVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IFtjYWxsYmFja10gLSDnu5Hlrprkuovku7bml7bnmoTlm57osIPlh73mlbDvvIzlpoLmnpzkuI3mjIflrprliJnms6jplIDmiYDmnIkgYG5hbWVgIOS6i+S7tlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfVxuICAgICAqL1xuICAgIG9mZjogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBlID0gdGhpcy5lIHx8ICh0aGlzLmUgPSB7fSk7XG4gICAgICAgIHZhciBldnRzID0gZVtuYW1lXTtcbiAgICAgICAgdmFyIGxpdmVFdmVudHMgPSBbXTtcblxuICAgICAgICBpZiAoZXZ0cyAmJiBjYWxsYmFjaykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGV2dHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZ0c1tpXS5mbiAhPT0gY2FsbGJhY2sgJiYgZXZ0c1tpXS5mbi5fICE9PSBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBsaXZlRXZlbnRzLnB1c2goZXZ0c1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g6Ziy5q2i5YaF5a2Y5rqi5Ye6XG4gICAgICAgIChsaXZlRXZlbnRzLmxlbmd0aClcbiAgICAgICAgICAgID8gZVtuYW1lXSA9IGxpdmVFdmVudHNcbiAgICAgICAgICAgIDogZGVsZXRlIGVbbmFtZV07XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOiOt+WPluWFqOWxgOWUr+S4gOS6i+S7tuWPkeWwhOWZqFxuICAgICAqL1xuICAgIGdldEdsb2JhbEVtaXR0ZXI6ICAoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgRW1pdHRlcigpO1xuICAgICAgICByZXR1cm4gKCkgPT4gaW5zdGFuY2U7XG4gICAgfSgpKVxufTtcblxuZXhwb3J0IGRlZmF1bHQgRW1pdHRlcjtcblxuLyoqXG4gKiDlhajlsYDllK/kuIDkuovku7blj5HlsITlmahcbiAqL1xuZXhwb3J0IGNvbnN0IEdsb2JhbEVtaXR0ZXIgPSBFbWl0dGVyLnByb3RvdHlwZS5nZXRHbG9iYWxFbWl0dGVyKCk7IiwiXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gb2JqZWN0XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQodGFyZ2V0LCBleHRlbnNpb24pIHtcbiAgICBvYmplY3RFYWNoKGV4dGVuc2lvbiwgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGFyZ2V0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb2JqZWN0RWFjaChvYmplY3QsIGl0ZXJhdGVlKSB7XG4gICAgZm9yIChsZXQga2V5IGluIG9iamVjdCkge1xuICAgICAgICBpZiAoIW9iamVjdC5oYXNPd25Qcm9wZXJ0eSB8fCAob2JqZWN0Lmhhc093blByb3BlcnR5ICYmIG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSkge1xuICAgICAgICAgICAgaWYgKGl0ZXJhdGVlKG9iamVjdFtrZXldLCBrZXksIG9iamVjdCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBmdW5jdGlvblxuXG52YXIgX2VtcHR5Rm4gPSBmdW5jdGlvbiAoKSB7XG59O1xuXG4vKipcbiAqIOiOt+WPluepuuWHveaVsOOAglxuICogQHBhcmFtIG5ld09uZSDpu5jorqQgYGZhbHNlYO+8jOW9k+S4uiBgdHJ1ZWAg5pe25bCG6L+U5Zue5LiA5Liq5paw55qE56m65Ye95pWw44CCXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbXB0eUZ1bmN0aW9uKG5ld09uZSA9IGZhbHNlKSB7XG4gICAgaWYgKG5ld09uZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gX2VtcHR5Rm47XG59XG5cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBzdHJpbmdcblxuXG5leHBvcnQgZnVuY3Rpb24gdXBwZXJDYXNlKHN0cikge1xuICAgIHJldHVybiBzdHIudG9VcHBlckNhc2UoKTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdXBwZXJDYXNlRmlyc3Qoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxTL2csIGYgPT4gdXBwZXJDYXNlKGYpKTtcbn1cblxuXG5cblxuLyoqXG4gKiDnlJ/miJDkuIDkuKrplb/luqbkuLogMTYg55qE6ZqP5py65a2X56ym5LiyXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbVN0cmluZygpIHtcbiAgICBmdW5jdGlvbiBzNCgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDApXG4gICAgICAgICAgICAudG9TdHJpbmcoMTYpXG4gICAgICAgICAgICAuc3Vic3RyaW5nKDEpO1xuICAgIH1cbiAgICByZXR1cm4gczQoKSArIHM0KCkgKyBzNCgpICsgczQoKTtcbn1cblxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIG1peGVkXG5cbi8qKlxuICog5Yik5pat5piv5ZCm5Li6YOepumDlgLzjgIJcbiAqIFBT77ya5q2k5pa55rOV55qE5Yik5pat6YC76L6R5L2c5Li65Y2V5YWD5qC85piv5ZCm5Li656m655qE5L6d5o2u44CCXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eVZhbHVlKHZhbHVlKSB7XG4gICAgcmV0dXJuICh2YWx1ZSA9PT0gJycgfHwgdmFsdWUgPT09IG51bGwgfHwgdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJyk7XG59XG5cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBjb29yZGluYXRlXG5cblxudmFyIGNfaXNFcXVhbCA9IGZ1bmN0aW9uIChyMSwgcjIpIHtcbiAgICByZXR1cm4gcjFbMF0gPT09IHIyWzBdICYmIHIxWzFdID09PSByMlsxXSAmJiByMVsyXSA9PT0gcjJbMl0gJiYgcjFbM10gPT09IHIyWzNdO1xufTtcblxudmFyIGNfaW50ZXJzZWN0aW9uID0gZnVuY3Rpb24gKHIxLCByMikge1xuICAgIHZhciB4MSA9IE1hdGgubWF4KHIxWzBdLCByMlswXSk7XG4gICAgdmFyIHkxID0gTWF0aC5tYXgocjFbMV0sIHIyWzFdKTtcbiAgICB2YXIgeDIgPSBNYXRoLm1pbihyMVsyXSwgcjJbMl0pO1xuICAgIHZhciB5MiA9IE1hdGgubWluKHIxWzNdLCByMlszXSk7XG5cbiAgICBpZiAoeDEgPD0geDIgJiYgeTEgPD0geTIpIHtcbiAgICAgICAgcmV0dXJuIFt4MSwgeTEsIHgyLCB5Ml07XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbnZhciBjX3NldCA9IGZ1bmN0aW9uICh0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChyMSwgcjIpIHtcbiAgICAgICAgdmFyIGlucyA9IGNfaW50ZXJzZWN0aW9uKHIxLCByMik7XG4gICAgICAgIGlmIChpbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBjX2lzRXF1YWwoaW5zLCB0ID09PSAnc3ViJyA/IHIxIDogcjIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xufTtcblxuZXhwb3J0IHZhciBDb29yZGluYXRlID0ge1xuXG4gICAgLyoqXG4gICAgICog5Yik5pat5Z2Q5qCH6IyD5Zu0IHIxIOaYr+WQpuS4jiByMiDnm7jnrYnjgIJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSByMVxuICAgICAqIEBwYXJhbSB7aW50fSByMVswXSAtIOWdkOagh+iMg+WbtCByMSDnmoTotbflp4vooYzlnZDmoIdcbiAgICAgKiBAcGFyYW0ge2ludH0gcjFbMV0gLSDlnZDmoIfojIPlm7QgcjEg55qE6LW35aeL5YiX5Z2Q5qCHXG4gICAgICogQHBhcmFtIHtpbnR9IHIxWzJdIC0g5Z2Q5qCH6IyD5Zu0IHIxIOeahOe7iOatouihjOWdkOagh1xuICAgICAqIEBwYXJhbSB7aW50fSByMVszXSAtIOWdkOagh+iMg+WbtCByMSDnmoTnu4jmraLliJflnZDmoIdcbiAgICAgKiBAcGFyYW0ge0FycmF5fSByMlxuICAgICAqIEBwYXJhbSB7aW50fSByMlswXSAtIOWdkOagh+iMg+WbtCByMiDnmoTotbflp4vooYzlnZDmoIdcbiAgICAgKiBAcGFyYW0ge2ludH0gcjJbMV0gLSDlnZDmoIfojIPlm7QgcjIg55qE6LW35aeL5YiX5Z2Q5qCHXG4gICAgICogQHBhcmFtIHtpbnR9IHIyWzJdIC0g5Z2Q5qCH6IyD5Zu0IHIyIOeahOe7iOatouihjOWdkOagh1xuICAgICAqIEBwYXJhbSB7aW50fSByMlszXSAtIOWdkOagh+iMg+WbtCByMiDnmoTnu4jmraLliJflnZDmoIdcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc0VxdWFsOiBjX2lzRXF1YWwsXG5cbiAgICAvKipcbiAgICAgKiDliKTmlq3lnZDmoIfojIPlm7QgcjEg5piv5ZCm5LiOIHIyIOWtmOWcqOS6pOmbhuOAglxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGludGVyc2VjdGlvbjogY19pbnRlcnNlY3Rpb24sXG5cbiAgICAvKipcbiAgICAgKiDliKTmlq3lnZDmoIfojIPlm7QgcjEg5piv5ZCm5pivIHIyIOeahOWtkOmbhuOAglxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzU3Vic2V0OiBjX3NldCgnc3ViJyksXG5cbiAgICAvKipcbiAgICAgKiDliKTmlq3lnZDmoIfojIPlm7QgcjEg5piv5ZCm5pivIHIyIOeahOi2hembhuOAglxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzU3VwZXJzZXQ6IGNfc2V0KCdzdXAnKVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSIsImltcG9ydCB7dXBwZXJDYXNlfSBmcm9tICcuL2NvbW1vbi5qcydcblxuLyoqXG4gKiDlpKflsI/lhpnkuI3mlY/mhJ/nmoQgTWFwXG4gKi9cbmNsYXNzIENhc2VJbnNlbnNpdGl2ZU1hcCB7XG5cbiAgICBjb25zdHJ1Y3RvcihpdGVyYWJsZSkge1xuICAgICAgICB0aGlzLl9tYXAgPSBuZXcgTWFwKGl0ZXJhYmxlKTtcbiAgICAgICAgdGhpcy5fa2V5cyA9IHt9O1xuICAgIH1cblxuICAgIGdldChrZXkpIHtcbiAgICAgICAgdmFyIGFjS2V5ID0gdGhpcy5fa2V5c1t1cHBlckNhc2Uoa2V5KV07XG4gICAgICAgIHJldHVybiB0aGlzLl9tYXAuZ2V0KGFjS2V5KTtcbiAgICB9XG5cbiAgICBzZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLl9rZXlzW3VwcGVyQ2FzZShrZXkpXSA9IGtleTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgaGFzKGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fa2V5c1t1cHBlckNhc2Uoa2V5KV07XG4gICAgfVxuXG4gICAgaGFzRXhhY3Qoa2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tYXAuaGFzKGtleSk7XG4gICAgfVxuXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuX2tleXMgPSB7fTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hcC5jbGVhcigpO1xuICAgIH1cblxuICAgIGRlbGV0ZShrZXkpIHtcbiAgICAgICAgdmFyIGFjS2V5ID0gdGhpcy5fa2V5c1t1cHBlckNhc2Uoa2V5KV07XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9rZXlzW3VwcGVyQ2FzZShrZXkpXTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hcC5kZWxldGUoYWNLZXkpO1xuICAgIH1cblxuICAgIGVudHJpZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tYXAuZW50cmllcygpO1xuICAgIH1cblxuICAgIGZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFwLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7SXRlcmF0b3IuPHN0cmluZz59XG4gICAgICovXG4gICAga2V5cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hcC5rZXlzKCk7XG4gICAgfVxuXG4gICAgdmFsdWVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFwLnZhbHVlcygpO1xuICAgIH1cblxuICAgIHRvTWFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFwO1xuICAgIH1cblxuICAgIHNpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tYXAuc2l6ZTtcbiAgICB9XG5cbn1cblxuLyoqXG4gKiBTdGFja1xuICovXG5jbGFzcyBTdGFjayB7XG4gICAgY29uc3RydWN0b3IoaW5pdGlhbCA9IFtdKSB7XG4gICAgICAgIHRoaXMuaXRlbXMgPSBpbml0aWFsO1xuICAgIH1cblxuICAgIHB1c2goLi4uaXRlbXMpIHtcbiAgICAgICAgdGhpcy5pdGVtcy5wdXNoKC4uLml0ZW1zKTtcbiAgICB9XG5cbiAgICBwb3AoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zLnBvcCgpO1xuICAgIH1cblxuICAgIHBlZWsoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzRW1wdHkoKSA/IHZvaWQgMCA6IHRoaXMuaXRlbXNbdGhpcy5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICB9XG5cbiAgICBpc0VtcHR5KCkge1xuICAgICAgICByZXR1cm4gIXRoaXMuc2l6ZSgpO1xuICAgIH1cblxuICAgIHNpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zLmxlbmd0aDtcbiAgICB9XG5cbn1cblxuZXhwb3J0IHtDYXNlSW5zZW5zaXRpdmVNYXAsIFN0YWNrfTtcblxuIiwidmFyIHRleHRDb250ZXh0U3VwcG9ydCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCd0ZXN0JykudGV4dENvbnRlbnQgPyB0cnVlIDogZmFsc2U7XG5cbnZhciBSRUdfSFRNTF9DSEFSQUNURVJTID0gLyg8KC4qKT58JiguKik7KS87XG5cbi8qKlxuICog6IO95ZCM5pe25YW85a655paH5pys6IqC54K555qEIGlubmVySFRNTCDmlrnms5XjgIJcbiAqXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlubmVySFRNTChlbGVtZW50LCBjb250ZW50KSB7XG4gICAgaWYgKFJFR19IVE1MX0NIQVJBQ1RFUlMudGVzdChjb250ZW50KSkge1xuICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IGNvbnRlbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGNoaWxkID0gZWxlbWVudC5maXJzdENoaWxkO1xuICAgICAgICBpZiAoY2hpbGQgJiYgY2hpbGQubm9kZVR5cGUgPT09IDMgJiYgY2hpbGQubmV4dFNpYmxpbmcgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmICh0ZXh0Q29udGV4dFN1cHBvcnQpIHtcbiAgICAgICAgICAgICAgICBjaGlsZC50ZXh0Q29udGVudCA9IGNvbnRlbnQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNoaWxkLmRhdGEgPSBjb250ZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZW1wdHkoZWxlbWVudCk7XG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNvbnRlbnQpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiDlnKjmjIflrproioLngrnlkI7mj5LlhaXoioLngrlcbiAqIEBwYXJhbSBlbGVtZW50XG4gKiBAcGFyYW0gY29udGVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zZXJ0QWZ0ZXIoZWxlbWVudCwgY29udGVudCkge1xuICAgIGlmIChSRUdfSFRNTF9DSEFSQUNURVJTLnRlc3QoY29udGVudCkpIHtcbiAgICAgICAgZWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyZW5kJywgY29udGVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGNvbnRlbnQubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50Lm5leHRTaWJsaW5nKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShjb250ZW50LCBlbGVtZW50Lm5leHRTaWJsaW5nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVE9ET1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9zZXN0KGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgdmFyIHJldDtcbiAgICBkbyB7XG4gICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgICAgIGlmICghZWxlbWVudCB8fCAhZWxlbWVudC5vd25lckRvY3VtZW50IHx8IChyZXQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpKSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9IHdoaWxlIChlbGVtZW50KTtcblxuICAgIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICog5riF56m65oyH5a6a5YWD57Sg55qE5omA5pyJ5a2Q6IqC54K544CCXG4gKlxuICogQHBhcmFtIGVsZW1lbnRcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZW1wdHkoZWxlbWVudCkge1xuICAgIHZhciBjaGlsZDtcbiAgICB3aGlsZSAoY2hpbGQgPSBlbGVtZW50Lmxhc3RDaGlsZCkgeyAvLyBqc2hpbnQgaWdub3JlOmxpbmVcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQoY2hpbGQpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBUT0RPIOaaguaXtui/meagt+WkhOeQhiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD01NTk1NjFcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiDov5Tlm57mjIflrprlhYPntKDnmoTlpJbpq5jluqbvvIjljIXmi6wgcGFkZGluZ+OAgWJvcmRlciDlj4rlj6/pgInnmoQgbWFyZ2luIOWAvO+8ieOAglxuICpcbiAqIEBwYXJhbSBlbFxuICogQHBhcmFtIHtCb29sZWFufSB3aXRoTWFyZ2luIC0g6auY5bqm5Lit5piv5ZCm5YyF5ousIG1hcmdpbiDlgLxcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvdXRlckhlaWdodChlbCwgd2l0aE1hcmdpbiA9IHRydWUpIHtcbiAgICB2YXIgaGVpZ2h0ID0gZWwub2Zmc2V0SGVpZ2h0O1xuICAgIHZhciBzdHlsZTtcblxuICAgIGlmICh3aXRoTWFyZ2luID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gaGVpZ2h0O1xuICAgIH1cbiAgICBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWwpO1xuICAgIGhlaWdodCArPSBwYXJzZUludChzdHlsZS5tYXJnaW5Ub3ApICsgcGFyc2VJbnQoc3R5bGUubWFyZ2luQm90dG9tKTtcbiAgICByZXR1cm4gaGVpZ2h0O1xufVxuXG5cbi8qKlxuICog6L+U5Zue5oyH5a6a5YWD57Sg55qE5aSW5a695bqm77yI5YyF5ousIHBhZGRpbmfjgIFib3JkZXIg5Y+K5Y+v6YCJ55qEIG1hcmdpbiDlgLzvvInjgIJcbiAqXG4gKiBAcGFyYW0gZWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gd2l0aE1hcmdpbiAtIOWuveW6puS4reaYr+WQpuWMheaLrCBtYXJnaW4g5YC8XG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5leHBvcnQgZnVuY3Rpb24gb3V0ZXJXaWR0aChlbCwgd2l0aE1hcmdpbiA9IHRydWUpIHtcbiAgICB2YXIgd2lkdGggPSBlbC5vZmZzZXRXaWR0aDtcbiAgICB2YXIgc3R5bGU7XG5cbiAgICBpZiAod2l0aE1hcmdpbiA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIHdpZHRoO1xuICAgIH1cbiAgICBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWwpO1xuICAgIHdpZHRoICs9IHBhcnNlSW50KHN0eWxlLm1hcmdpbkxlZnQpICsgcGFyc2VJbnQoc3R5bGUubWFyZ2luUmlnaHQpO1xuICAgIHJldHVybiB3aWR0aDtcbn1cblxuIiwiLyoqXG4gKiDpmLvmraLlhbblroPnm5HlkKzooqvosIPnlKjjgIJcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oZXZlbnQpIHtcbiAgICBldmVudC5pc0ltbWVkaWF0ZVByb3BhZ2F0aW9uRW5hYmxlZCA9IGZhbHNlO1xuICAgIGV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XG59XG5cbi8qKlxuICog6Zi75q2i5LqL5Lu25YaS5rOh44CCXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RvcFByb3BhZ2F0aW9uKGV2ZW50KSB7XG4gICAgaWYgKHR5cGVvZiBldmVudC5zdG9wUHJvcGFnYXRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcbiAgICB9XG59Il19
