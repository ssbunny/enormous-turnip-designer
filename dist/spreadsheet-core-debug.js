/*!
 * spreadsheet
 * A JavaScript spreedsheet designer based on Handsontable.
 * 
 * @version v0.1.0
 * @author zhangqiang
 * @license MIT
 * 
 * Build on: "2016-11-08T08:51:47.416Z"
 * - handsontable version: 0.28.3
 * - formulajs version: 1.0.8
 * - moment version: 2.13.0
 * - numbro version: 1.8.0
 * - pikaday version: 1.4.0
 * - zeroclipboard version: 2.2.0
 */
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
'use strict';

var _settings = require('./settings');

var _core = require('./core');

var _core2 = _interopRequireDefault(_core);

var _polyfill = require('./polyfill');

var _polyfill2 = _interopRequireDefault(_polyfill);

var _Plugin = require('./plugins/Plugin');

var _Persistent = require('./plugins/persistent/Persistent');

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
(0, _polyfill2.default)(window);

// TODO 提供更改全局变量名的方法，以防止全局变量冲突。

},{"./core":4,"./plugins/Plugin":13,"./plugins/persistent/Persistent":15,"./polyfill":17,"./settings":18}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var REGEXPS = exports.REGEXPS = {

    /*
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
     */
    sheetName: /[\\/\?\*\[\]'"]/ // sheet name 不包含
};

var WARNS = exports.WARNS = {

    S1: "\u5DE5\u4F5C\u8868\u540D\u4E0D\u80FD\u4E3A\u7A7A\u767D\u3002",
    S2: "\u5DE5\u4F5C\u8868\u540D\u79F0\u5305\u542B\u65E0\u6548\u5B57\u7B26: :  / ? * [ ]\u3002",
    S3: "\u8BE5\u540D\u79F0\u5DF2\u88AB\u4F7F\u7528\uFF0C\u8BF7\u5C1D\u8BD5\u5176\u4ED6\u540D\u79F0\u3002"

};

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Frame = require('./designer/Frame');

var _Frame2 = _interopRequireDefault(_Frame);

var _Workbook = require('./designer/Workbook');

var _Workbook2 = _interopRequireDefault(_Workbook);

var _common = require('./utils/common');

var _Plugin = require('./plugins/Plugin');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AUTO_ID = 1;

/**
 * 类似 Excel 的电子表格。
 *
 * @param rootElement
 * @param {object} userSettings - 电子表格的用户配置信息
 * @param {object} userSettings.workbook - Workbook 的配置
 * @param {object[]} userSettings.sheets - 配置所有初始 Sheet 页的数组
 * @constructor
 */
function SpreadSheet(rootElement, userSettings) {
    this.rootElement = rootElement;
    this.getUserSettings(userSettings);

    this.settings = {};
    (0, _common.extend)(this.settings, SpreadSheet.defaultSettings);
    (0, _common.extend)(this.settings, this.userSettings);

    this.id = this.settings.id || this.getId();

    this._initPlugin();
    this.frame = new _Frame2.default(this, this.settings.frame);
    this.workbook = new _Workbook2.default(this, this.settings.workbook);
    this._enablePlugin();
}

exports.default = SpreadSheet;


SpreadSheet.prototype.getRootElement = function () {
    return this.rootElement;
};

/**
 * 获取用户传入的初始配置。
 * @param {string=} s - 表示用户配置的 JSON 字符串
 * @returns {Object}
 */
SpreadSheet.prototype.getUserSettings = function (s) {
    if (this.userSettings) {
        return this.userSettings;
    }
    if (s && typeof s === 'string') {
        this.userSettings = JSON.parse(s);
    } else {
        this.userSettings = s;
    }
    return this.userSettings;
};

/**
 * 获取 SpreadSheet 实际生效的配置信息。
 * @returns {Object}
 */
SpreadSheet.prototype.getSettings = function () {
    return this.settings;
};

SpreadSheet.prototype.getId = function () {
    // 不指定 id 时，尽量生成不可重复的 id（使用当前 iframe 自增变量配合随机字符串的方式）
    return this.id || SpreadSheet.globalSettings.idPrefix + AUTO_ID++ + '-' + (0, _common.randomString)();
};

/**
 * 获取可交换的中间数据，用于数据提交、解析转换等。
 * @param {boolean} [oragin=false] - 为 `true` 时获取原始 JavaScript 对象
 * @returns
 */
SpreadSheet.prototype.getExchangeData = function () {
    var oragin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var w = this.workbook._getExchange();
    var f = this.frame._getExchange(); // TODO frame
    var o = {
        workbook: w,
        frame: f,
        id: this.getId()
    };

    return oragin ? o : JSON.stringify(o);
};

/**
 * 获取当前 SpreadSheet 对应的 Workbook 实例。
 * @returns {Workbook}
 */
SpreadSheet.prototype.getWorkbookInstance = function () {
    return this.workbook;
};

/**
 * 获取当前 SpreadSheet 对应的 Frame 实例。
 * @returns {Frame}
 */
SpreadSheet.prototype.getFrameInstance = function () {
    return this.frame;
};

SpreadSheet.prototype._initPlugin = function () {
    var _this = this;

    this.plugins = new Map();
    (0, _Plugin.getAllPlugins)().forEach(function (P) {
        var p = new P(_this);
        (0, _Plugin.validatePlugin)(p);
        _this.plugins.set(p.__name__, p);
    });
};

SpreadSheet.prototype._enablePlugin = function () {
    this.plugins.forEach(function (p) {
        if (p.isEnable()) {
            p.enable();
        }
    });
};

},{"./designer/Frame":6,"./designer/Workbook":10,"./plugins/Plugin":13,"./utils/common":20}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _common = require('../utils/common');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 配置翻译类。
 * 框架内部使用，用户代码不应该调用它。
 *
 * @private
 */
var ConfigTranslator = function () {

    /**
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
     * 中间数据格式的设计会尽量同时保证在 Excel 及 Web 页面中均便于处理，
     * 但不免存在一些 Web 中难以直接使用的数据格式，该方法即是完成此类数据格式
     * 的适配转换工作。
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
            // console.info(this.sheet.getName() + '[ConfigTranslator.translate] settings ->', settings);
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

                            if (cellMeta.dataType) {
                                for (var dt in cellMeta.dataType) {
                                    if (cellMeta.dataType.hasOwnProperty(dt)) {
                                        cell[dt] = cellMeta.dataType[dt];
                                    }
                                }
                                cell.type = cellMeta.dataType.typeName;
                                delete cell.typeName;
                            }

                            if (cellMeta.styles) {
                                if (cellMeta.styles.alignments) {
                                    var c = cellMeta.styles.alignments.join(' ht');
                                    cell.className = cell.className ? cell.className += ' ht' + c : 'ht' + c;
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

},{"../utils/common":20}],6:[function(require,module,exports){
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

},{"./frame/ContextMenu":11}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _common = require('../utils/common.js');

var _ConfigTranslator = require('./ConfigTranslator.js');

var _ConfigTranslator2 = _interopRequireDefault(_ConfigTranslator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
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
        var menuItems = frame.contextMenu.menuItems;
        var contextMenu = {};
        contextMenu.items = frame.contextMenu.getMenuItems4HotTable();
        contextMenu.callback = function (sheet) {
            return function (key, options) {
                if (menuItems.has(key)) {
                    var item = menuItems.get(key);
                    if (item.handler) {
                        item.handler.call(this, sheet, options.start, options.end);
                    }
                }
            };
        }(sheet);
        HotTableAdaptor._preference.contextMenu = contextMenu;

        (0, _common.extend)(hotSettings, HotTableAdaptor._preference);
        (0, _common.extend)(hotSettings, settings);
        (0, _common.extend)(hotSettings, extConfig);

        var _this = _possibleConstructorReturn(this, (HotTableAdaptor.__proto__ || Object.getPrototypeOf(HotTableAdaptor)).call(this, rootElement, hotSettings));

        _this._translator = translator;
        return _this;
    }

    return HotTableAdaptor;
}(Handsontable);

/**
 * 预设配置。
 * @private
 */


HotTableAdaptor._preference = {
    outsideClickDeselects: false,

    rowHeaders: true,
    colHeaders: true,

    manualColumnResize: true,
    manualRowResize: true,
    className: 'ssd-handsontable',

    xFormulas: true,
    XPersistent: true,

    contextMenu: {}
};

exports.default = HotTableAdaptor;

},{"../utils/common.js":20,"./ConfigTranslator.js":5}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Tabs = require('./views/Tabs');

var _Tabs2 = _interopRequireDefault(_Tabs);

var _HotTableAdaptor = require('./HotTableAdaptor');

var _HotTableAdaptor2 = _interopRequireDefault(_HotTableAdaptor);

var _SheetError = require('./SheetError');

var _common = require('../utils/common');

var _Emitter2 = require('../utils/Emitter');

var _Emitter3 = _interopRequireDefault(_Emitter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var INIT_ROWS = 150; // Sheet 初始可显示的行数
var INIT_COLS = 50; // Sheet 初始可显示的列数


/**
 * 工作表
 *
 * @fires Sheet#afterRename
 * @fires Sheet#afterRenameCancel
 */

var Sheet = function (_Emitter) {
    _inherits(Sheet, _Emitter);

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
         * TODO 销毁 sheet 页
         */

    }, {
        key: 'destroy',
        value: function destroy() {}
        // 检查是不是最后一个


        /**
         * 给 sheet 页重命名
         * @param name - 新名字
         * @returns {boolean} - 是否成功
         */

    }, {
        key: 'rename',
        value: function rename(name) {
            return this.workbook.renameSheet(this.getName(), name);
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
    }, {
        key: '_getExchange',
        value: function _getExchange() {
            var _getDataMeta2 = this._getDataMeta(),
                data = _getDataMeta2.data,
                cells = _getDataMeta2.cells;

            var _getSize2 = this._getSize(),
                heights = _getSize2.heights,
                widths = _getSize2.widths;

            var mergeCells = this.handsontable.getSettings().mergeCells;

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
        key: '_getSize',
        value: function _getSize() {
            var hot = this.handsontable;
            var cols = hot.countCols() - hot.countEmptyCols(true);
            var rows = hot.countRows() - hot.countEmptyRows(true);
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
            for (var _i2 = 0; _i2 < cols; ++_i2) {
                widths.push(hot.getColWidth(_i2));
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
                    var _meta = hot.getCellMeta(i, j); // TODO meta
                    var _data = hot.getDataAtCell(i, j);
                    var _cellMata = {};

                    _cellMata.row = i;
                    _cellMata.col = j;
                    _cellMata.isFormula = !!(_sourceData && (_sourceData + '').charAt(0) === '=');
                    _cellMata.sourceValue = _sourceData;
                    _cellMata.value = _data;

                    // TODO dataType, styles
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
        key: '_getBorders',
        value: function _getBorders() {}
    }]);

    return Sheet;
}(_Emitter3.default);

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

},{"../utils/Emitter":19,"../utils/common":20,"./HotTableAdaptor":7,"./SheetError":9,"./views/Tabs":12}],9:[function(require,module,exports){
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

},{"../SpreadSheetError":1}],10:[function(require,module,exports){
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

var _const = require('../const');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
         *
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
        this.$$view.appendAddButton();

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
         * @returns {Iterator.<K>}
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
            if (_const.REGEXPS.sheetName.test(name)) {
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
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.getSheets().toMap()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _step$value = _slicedToArray(_step.value, 2),
                        sheet = _step$value[1];

                    sheet && sheets.push(sheet._getExchange());
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

            return {
                activeSheet: this.activeSheet,
                sheets: sheets
            };
        }
    }]);

    return Workbook;
}();

exports.default = Workbook;

},{"../const":3,"../settings":18,"../utils/common":20,"../utils/dataStructure":21,"./Sheet":8,"./SheetError":9,"./views/Tabs":12}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
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

    this.register('hsep1', '---------');

    this.register('col_left', {
        name: '左侧插入一列'
    });

    this.register('col_right', {
        name: '右侧插入一列'
    });

    this.register('hsep2', '---------');

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

    this.register('hsep3', '---------');

    this.register('q_merge_cells', {
        name: '合并单元格'
    }, function (sheet, start, end) {
        sheet.mergeCells(start.row, start.col, end.row - start.row + 1, end.col - start.col + 1);
    });
};

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _domHelper = require('../../utils/domHelper.js');

var _common = require('../../utils/common.js');

var _dataStructure = require('../../utils/dataStructure.js');

var _eventHelper = require('../../utils/eventHelper.js');

var _settings = require('../../settings.js');

var _const = require('../../const');

var CLASS_CURRENT = 'current';
var CLASS_TABS = 'ssd-tabs';
var CLASS_CONTENT = 'ssd-tabs-content';
var CLASS_SECTION = 'ssd-tabs-section';
var CLASS_NAV = 'ssd-tabs-nav';
var CLASS_UL = 'ssd-tabs-ul';
var CLASS_LI = 'ssd-tabs-li';
var CLASS_FX = 'ssd-tabs-fx';
var NAV_HEIGHT = _settings.globalSettings.styles.navHeight;

var animated = false; // TODO 做成配置项

/**
 * workbook 对应的视图，实际的 DOM 构成。
 * @private
 * @param {Workbook} workbook
 * @constructor
 */
function Tabs(workbook) {
    this.workbook = workbook;
    this.liItems = new _dataStructure.CaseInsensitiveMap();
    this.sectionItems = new _dataStructure.CaseInsensitiveMap();
    this._hotTables = new Map();
    this.rootElement = workbook.spreadSheet.getRootElement();

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

    // TODO 增加 sheet 页的 button
    //innerHTML(this.UL, `<li><span></span></li>`);
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

    li.innerHTML = '<a href="javascript:;"><span>' + sheetName + '</span></a>';
    li.classList.add(CLASS_LI);
    li.setAttribute('data-sheet', sheetName);

    var activeTab = this.TABS.querySelector('.' + CLASS_CURRENT + '.' + CLASS_LI);
    if (activeTab) {
        (0, _domHelper.insertAfter)(activeTab, li);
    } else {
        this.UL.appendChild(li);
    }
    this.liItems.set(sheetName, li);

    li.addEventListener('click', function (event) {
        var sheetName = this.dataset.sheet;
        var sheet = that.workbook.getSheet(sheetName);
        sheet.active();
        (0, _eventHelper.stopImmediatePropagation)(event);
    });

    li.addEventListener('dblclick', function (event) {
        that._onTabDblclick.call(that, this);
        (0, _eventHelper.stopImmediatePropagation)(event);
    });

    this.appendContent(sheetName);
};

Tabs.prototype.appendAddButton = function () {
    var that = this;
    var li = document.createElement('li');

    li.innerHTML = '<a href="javascript:;"><span>+</span></a>';
    li.classList.add(CLASS_LI);
    li.classList.add('add-tab');

    this.UL.appendChild(li);

    li.addEventListener('click', function (event) {
        that.workbook.createSheet();
    });
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
        return _const.WARNS.S1;
    }
    if (_const.REGEXPS.sheetName.test(name2)) {
        return _const.WARNS.S2;
    }
    // 改成其它已有的sheet名
    if ((0, _common.upperCase)(name1) !== (0, _common.upperCase)(name2) && this.workbook.isSheetExist(name2)) {
        return _const.WARNS.S3;
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
            return _this.height - NAV_HEIGHT;
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

},{"../../const":3,"../../settings.js":18,"../../utils/common.js":20,"../../utils/dataStructure.js":21,"../../utils/domHelper.js":22,"../../utils/eventHelper.js":23}],13:[function(require,module,exports){
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

},{"./PluginError":14}],14:[function(require,module,exports){
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

},{"../SpreadSheetError":1}],15:[function(require,module,exports){
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

},{"../Plugin":13,"./Storage":16}],16:[function(require,module,exports){
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

Storage.PREFIX = '$$storage-';

exports.Storage = Storage;

},{}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = polyfill;
function polyfill(_window) {

    // --------------------------------------------- Number

    if (!_window.Number.isNaN) {
        //noinspection JSPrimitiveTypeWrapperUsage
        _window.Number.isNaN = function (x) {
            return x !== x;
        };
    }
}

},{}],18:[function(require,module,exports){
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
        autoPrefix: '工作表'
    },

    styles: { // 定制主题时需要修改相应配置
        /**
         * Sheet 页标签栏的高度
         */
        // 为了提升渲染性能，无法根据实际高度计算获得此值，固预设。
        navHeight: 30
    }

};

// TODO
var lang = {};

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
exports.lang = lang;

},{}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.extend = extend;
exports.objectEach = objectEach;
exports.emptyFunction = emptyFunction;
exports.upperCase = upperCase;
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
    return str.toLocaleUpperCase();
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
    return !!(value === '' || value === null || typeof value === 'undefined');
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
    intersection: c_intersection,
    isSubset: c_set('sub'),
    isSuperset: c_set('sup')
};

// -------------------------------------

},{}],21:[function(require,module,exports){
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

},{"./common.js":20}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.innerHTML = innerHTML;
exports.insertAfter = insertAfter;
exports.empty = empty;
exports.outerHeight = outerHeight;
exports.outerWidth = outerWidth;
var textContextSupport = document.createTextNode('test').textContent ? true : false;
var classListSupport = document.documentElement.classList ? true : false;

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
        element.removeChild(child);
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

},{}],23:[function(require,module,exports){
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

},{}]},{},[2]);
