/*!
 * spreadsheet
 * A JavaScript spreedsheet designer based on Handsontable.
 * 
 * @version v0.1.0
 * @author zhangqiang
 * @license MIT
 * 
 * Build on: "2016-11-09T08:38:18.054Z"
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

/*
    import {XFormulas} from './plugins/xformulas/XFormulas';
*/

_core2.default.globalSettings = _settings.globalSettings;
_core2.default.defaultSettings = _settings.defaultSettings;
_core2.default.version = '0.1.0';

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

},{"./core":3,"./plugins/Plugin":13,"./plugins/persistent/Persistent":15,"./polyfill":17,"./settings":18}],3:[function(require,module,exports){
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

},{"./designer/Frame":5,"./designer/Workbook":9,"./plugins/Plugin":13,"./utils/common":20}],4:[function(require,module,exports){
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

},{"../utils/common":20}],5:[function(require,module,exports){
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

},{"./frame/ContextMenu":10}],6:[function(require,module,exports){
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
                        item.handler.call(this, sheet, options.start, options.end, options);
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

    contextMenu: {}
};

exports.default = HotTableAdaptor;

},{"../utils/common.js":20,"./ConfigTranslator.js":4}],7:[function(require,module,exports){
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

},{"../utils/Emitter":19,"../utils/common":20,"./HotTableAdaptor":6,"./SheetError":8,"./views/Tabs":11}],8:[function(require,module,exports){
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

},{"../settings":18,"../utils/common":20,"../utils/dataStructure":21,"./Sheet":7,"./SheetError":8,"./views/Tabs":11}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _common = require('../../utils/common');

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

    var mergeCompare = function mergeCompare(type) {
        var merged = this.getSettings().mergeCells;
        if (merged && merged.length) {
            for (var i = 0; i < merged.length; ++i) {
                var _merged$i = merged[i],
                    row = _merged$i.row,
                    col = _merged$i.col,
                    rowspan = _merged$i.rowspan,
                    colspan = _merged$i.colspan;

                if (_common.Coordinate[type]([row, col, row + rowspan - 1, col + colspan - 1], this.getSelected())) {
                    return false;
                }
            }
        }
        return true;
    };

    this.register('q_merge_cells', {
        name: '单元格合并',
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
    }, function (sheet, start, end) {
        sheet.mergeCells(start.row, start.col, end.row - start.row + 1, end.col - start.col + 1);
    });

    this.register('q_cancel_merge_cells', {
        name: '取消单元格合并',
        disabled: function disabled() {
            return mergeCompare.call(this, 'isSubset');
        }
    }, function (sheet, start, end) {
        sheet.unMergeCells(start.row, start.col, end.row - start.row + 1, end.col - start.col + 1);
    });
};

},{"../../utils/common":20}],11:[function(require,module,exports){
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
        // TODO 可增加的sheet数上限限制
        var newSheet = that.workbook.createSheet();
        newSheet.active();
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

},{"../../i18n":12,"../../settings.js":18,"../../utils/common.js":20,"../../utils/dataStructure.js":21,"../../utils/domHelper.js":22,"../../utils/eventHelper.js":23}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var WARNS = exports.WARNS = {

    S1: "\u5DE5\u4F5C\u8868\u540D\u4E0D\u80FD\u4E3A\u7A7A\u767D\u3002",
    S2: "\u5DE5\u4F5C\u8868\u540D\u79F0\u5305\u542B\u65E0\u6548\u5B57\u7B26: :  / ? * [ ]\u3002",
    S3: "\u8BE5\u540D\u79F0\u5DF2\u88AB\u4F7F\u7528\uFF0C\u8BF7\u5C1D\u8BD5\u5176\u4ED6\u540D\u79F0\u3002"

};

},{}],13:[function(require,module,exports){
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

Storage.PREFIX = '$$brick!storage-';

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

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvU3ByZWFkU2hlZXRFcnJvci5qcyIsInNyYy9icm93c2VyLmpzIiwic3JjL2NvcmUuanMiLCJzcmMvZGVzaWduZXIvQ29uZmlnVHJhbnNsYXRvci5qcyIsInNyYy9kZXNpZ25lci9GcmFtZS5qcyIsInNyYy9kZXNpZ25lci9Ib3RUYWJsZUFkYXB0b3IuanMiLCJzcmMvZGVzaWduZXIvU2hlZXQuanMiLCJzcmMvZGVzaWduZXIvU2hlZXRFcnJvci5qcyIsInNyYy9kZXNpZ25lci9Xb3JrYm9vay5qcyIsInNyYy9kZXNpZ25lci9mcmFtZS9Db250ZXh0TWVudS5qcyIsInNyYy9kZXNpZ25lci92aWV3cy9UYWJzLmpzIiwic3JjL2kxOG4uanMiLCJzcmMvcGx1Z2lucy9QbHVnaW4uanMiLCJzcmMvcGx1Z2lucy9QbHVnaW5FcnJvci5qcyIsInNyYy9wbHVnaW5zL3BlcnNpc3RlbnQvUGVyc2lzdGVudC5qcyIsInNyYy9wbHVnaW5zL3BlcnNpc3RlbnQvU3RvcmFnZS5qcyIsInNyYy9wb2x5ZmlsbC5qcyIsInNyYy9zZXR0aW5ncy5qcyIsInNyYy91dGlscy9FbWl0dGVyLmpzIiwic3JjL3V0aWxzL2NvbW1vbi5qcyIsInNyYy91dGlscy9kYXRhU3RydWN0dXJlLmpzIiwic3JjL3V0aWxzL2RvbUhlbHBlci5qcyIsInNyYy91dGlscy9ldmVudEhlbHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FDQUEsU0FBUyxnQkFBVCxHQUE0QjtBQUN4QixTQUFLLElBQUwsR0FBWSxrQkFBWjtBQUNBLFNBQUssT0FBTCxHQUFlLE9BQWY7QUFDSDs7QUFFRCxpQkFBaUIsU0FBakIsR0FBNkIsSUFBSSxLQUFKLEVBQTdCO0FBQ0EsaUJBQWlCLFNBQWpCLENBQTJCLFdBQTNCLEdBQXlDLGdCQUF6QztBQUNBLGlCQUFpQixTQUFq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Q0QsWUFBUSxpQkFBaUIsRUFBakIsQ0FBUjtBQUNBLGFBQVMsU0FBUyxNQUFNLFVBQWYsSUFBNkIsU0FBUyxNQUFNLFdBQWYsQ0FBdEM7QUFDQSxXQUFPLEtBQVA7QUFDSDs7Ozs7Ozs7UUMvRmUsd0IsR0FBQSx3QjtRQVNBLGUsR0FBQSxlO0FBYmhCOzs7O0FBSU8sU0FBUyx3QkFBVCxDQUFrQyxLQUFsQyxFQUF5QztBQUM1QyxVQUFNLDZCQUFOLEdBQXNDLEtBQXRDO0FBQ0EsVUFBTSxZQUFOLEdBQXFCLElBQXJCO0FBQ0g7O0FBRUQ7Ozs7QUFJTyxTQUFTLGVBQVQsQ0FBeUIsS0FBekIsRUFBZ0M7QUFDbkMsUUFBSSxPQUFPLE1BQU0sZUFBYixLQUFpQyxVQUFyQyxFQUFpRDtBQUM3QyxjQUFNLGVBQU47QUFDSCxLQUZELE1BRU87QUFDSCxjQUFNLFlBQU4sR0FBcUIsSUFBckI7QUFDSDtBQUNKIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIFNwcmVhZFNoZWV0RXJyb3IoKSB7XG4gICAgdGhpcy5uYW1lID0gJ1NwcmVhZFNoZWV0RXJyb3InO1xuICAgIHRoaXMubWVzc2FnZSA9ICflj5HnlJ/kuobplJnor68nO1xufVxuXG5TcHJlYWRTaGVldEVycm9yLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuU3ByZWFkU2hlZXRFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTcHJlYWRTaGVldEVycm9yO1xuU3ByZWFkU2hlZXRFcnJvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMubmFtZSArICcgPT4gJyArIHRoaXMubWVzc2FnZTtcbn07XG5cbmV4cG9ydCB7U3ByZWFkU2hlZXRFcnJvcn1cblxuIiwiaW1wb3J0IHtnbG9iYWxTZXR0aW5ncywgZGVmYXVsdFNldHRpbmdzfSBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCBTcHJlYWRTaGVldCBmcm9tICcuL2NvcmUnO1xuXG5pbXBvcnQgcG9seWZpbGwgZnJvbSAnLi9wb2x5ZmlsbCc7XG4vKlxuICAgIGltcG9ydCB7WEZvcm11bGFzfSBmcm9tICcuL3BsdWdpbnMveGZvcm11bGFzL1hGb3JtdWxhcyc7XG4qL1xuXG5pbXBvcnQge1BsdWdpbiwgcmVnaXN0ZXJQbHVnaW59IGZyb20gJy4vcGx1Z2lucy9QbHVnaW4nO1xuaW1wb3J0IFBlcnNpc3RlbnQgZnJvbSAnLi9wbHVnaW5zL3BlcnNpc3RlbnQvUGVyc2lzdGVudCc7XG5cblxuU3ByZWFkU2hlZXQuZ2xvYmFsU2V0dGluZ3MgPSBnbG9iYWxTZXR0aW5ncztcblNwcmVhZFNoZWV0LmRlZmF1bHRTZXR0aW5ncyA9IGRlZmF1bHRTZXR0aW5ncztcblNwcmVhZFNoZWV0LnZlcnNpb24gPSAnQEBfdmVyc2lvbl9AQCc7XG5cblxuU3ByZWFkU2hlZXQucGx1Z2lucyA9IHtcbiAgICBQbHVnaW46IFBsdWdpbixcbiAgICByZWdpc3RlclBsdWdpbjogcmVnaXN0ZXJQbHVnaW5cbn07XG5cbi8vIOWGhee9ruaPkuS7tlxucmVnaXN0ZXJQbHVnaW4oJ3BlcnNpc3RlbnQnLCBQZXJzaXN0ZW50KTtcblxuXG4vLyDmtY/op4jlmajnjq/looPkuIvnmoTlhajlsYDlj5jph4/lkI3jgIJcbndpbmRvdy5Ccmlja1NwcmVhZFNoZWV0ID0gU3ByZWFkU2hlZXQ7XG5wb2x5ZmlsbCh3aW5kb3cpO1xuXG4vLyBUT0RPIOaPkOS+m+abtOaUueWFqOWxgOWPmOmHj+WQjeeahOaWueazle+8jOS7pemYsuatouWFqOWxgOWPmOmHj+WGsueqgeOAglxuXG4iLCJpbXBvcnQgRnJhbWUgZnJvbSAnLi9kZXNpZ25lci9GcmFtZSc7XG5pbXBvcnQgV29ya2Jvb2sgZnJvbSAnLi9kZXNpZ25lci9Xb3JrYm9vayc7XG5pbXBvcnQge2V4dGVuZCwgZW1wdHlGdW5jdGlvbiwgcmFuZG9tU3RyaW5nfSBmcm9tICcuL3V0aWxzL2NvbW1vbic7XG5pbXBvcnQge2dldEFsbFBsdWdpbnMsIHZhbGlkYXRlUGx1Z2lufSBmcm9tICcuL3BsdWdpbnMvUGx1Z2luJztcblxudmFyIEFVVE9fSUQgPSAxO1xuXG4vKipcbiAqIOexu+S8vCBFeGNlbCDnmoTnlLXlrZDooajmoLzjgIJcbiAqXG4gKiBAcGFyYW0gcm9vdEVsZW1lbnRcbiAqIEBwYXJhbSB7b2JqZWN0fSB1c2VyU2V0dGluZ3MgLSDnlLXlrZDooajmoLznmoTnlKjmiLfphY3nva7kv6Hmga9cbiAqIEBwYXJhbSB7b2JqZWN0fSB1c2VyU2V0dGluZ3Mud29ya2Jvb2sgLSBXb3JrYm9vayDnmoTphY3nva5cbiAqIEBwYXJhbSB7b2JqZWN0W119IHVzZXJTZXR0aW5ncy5zaGVldHMgLSDphY3nva7miYDmnInliJ3lp4sgU2hlZXQg6aG155qE5pWw57uEXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gU3ByZWFkU2hlZXQocm9vdEVsZW1lbnQsIHVzZXJTZXR0aW5ncykge1xuICAgIHRoaXMucm9vdEVsZW1lbnQgPSByb290RWxlbWVudDtcbiAgICB0aGlzLmdldFVzZXJTZXR0aW5ncyh1c2VyU2V0dGluZ3MpO1xuXG4gICAgdGhpcy5zZXR0aW5ncyA9IHt9O1xuICAgIGV4dGVuZCh0aGlzLnNldHRpbmdzLCBTcHJlYWRTaGVldC5kZWZhdWx0U2V0dGluZ3MpO1xuICAgIGV4dGVuZCh0aGlzLnNldHRpbmdzLCB0aGlzLnVzZXJTZXR0aW5ncyk7XG5cbiAgICB0aGlzLmlkID0gdGhpcy5zZXR0aW5ncy5pZCB8fCB0aGlzLmdldElkKCk7XG5cbiAgICB0aGlzLl9pbml0UGx1Z2luKCk7XG4gICAgdGhpcy5mcmFtZSA9IG5ldyBGcmFtZSh0aGlzLCB0aGlzLnNldHRpbmdzLmZyYW1lKTtcbiAgICB0aGlzLndvcmtib29rID0gbmV3IFdvcmtib29rKHRoaXMsIHRoaXMuc2V0dGluZ3Mud29ya2Jvb2spO1xuICAgIHRoaXMuX2VuYWJsZVBsdWdpbigpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBTcHJlYWRTaGVldDtcblxuXG5TcHJlYWRTaGVldC5wcm90b3R5cGUuZ2V0Um9vdEVsZW1lbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucm9vdEVsZW1lbnQ7XG59O1xuXG4vKipcbiAqIOiOt+WPlueUqOaIt+S8oOWFpeeahOWIneWni+mFjee9ruOAglxuICogQHBhcmFtIHtzdHJpbmc9fSBzIC0g6KGo56S655So5oi36YWN572u55qEIEpTT04g5a2X56ym5LiyXG4gKiBAcmV0dXJucyB7T2JqZWN0fVxuICovXG5TcHJlYWRTaGVldC5wcm90b3R5cGUuZ2V0VXNlclNldHRpbmdzID0gZnVuY3Rpb24gKHMpIHtcbiAgICBpZiAodGhpcy51c2VyU2V0dGluZ3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXNlclNldHRpbmdzO1xuICAgIH1cbiAgICBpZiAocyAmJiB0eXBlb2YgcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy51c2VyU2V0dGluZ3MgPSBKU09OLnBhcnNlKHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudXNlclNldHRpbmdzID0gcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudXNlclNldHRpbmdzO1xufTtcblxuXG4vKipcbiAqIOiOt+WPliBTcHJlYWRTaGVldCDlrp7pmYXnlJ/mlYjnmoTphY3nva7kv6Hmga/jgIJcbiAqIEByZXR1cm5zIHtPYmplY3R9XG4gKi9cblNwcmVhZFNoZWV0LnByb3RvdHlwZS5nZXRTZXR0aW5ncyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5zZXR0aW5ncztcbn07XG5cblNwcmVhZFNoZWV0LnByb3RvdHlwZS5nZXRJZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyDkuI3mjIflrpogaWQg5pe277yM5bC96YeP55Sf5oiQ5LiN5Y+v6YeN5aSN55qEIGlk77yI5L2/55So5b2T5YmNIGlmcmFtZSDoh6rlop7lj5jph4/phY3lkIjpmo/mnLrlrZfnrKbkuLLnmoTmlrnlvI/vvIlcbiAgICByZXR1cm4gdGhpcy5pZCB8fCBTcHJlYWRTaGVldC5nbG9iYWxTZXR0aW5ncy5pZFByZWZpeCArIChBVVRPX0lEKyspICsgJy0nICsgcmFuZG9tU3RyaW5nKCk7XG59O1xuXG5cbi8qKlxuICog6I635Y+W5Y+v5Lqk5o2i55qE5Lit6Ze05pWw5o2u77yM55So5LqO5pWw5o2u5o+Q5Lqk44CB6Kej5p6Q6L2s5o2i562J44CCXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcmFnaW49ZmFsc2VdIC0g5Li6IGB0cnVlYCDml7bojrflj5bljp/lp4sgSmF2YVNjcmlwdCDlr7nosaFcbiAqIEByZXR1cm5zXG4gKi9cblNwcmVhZFNoZWV0LnByb3RvdHlwZS5nZXRFeGNoYW5nZURhdGEgPSBmdW5jdGlvbiAob3JhZ2luID0gZmFsc2UpIHtcbiAgICB2YXIgdyA9IHRoaXMud29ya2Jvb2suX2dldEV4Y2hhbmdlKCk7XG4gICAgdmFyIGYgPSB0aGlzLmZyYW1lLl9nZXRFeGNoYW5nZSgpOyAvLyBUT0RPIGZyYW1lXG4gICAgdmFyIG8gPSB7XG4gICAgICAgIHdvcmtib29rOiB3LFxuICAgICAgICBmcmFtZTogZixcbiAgICAgICAgaWQ6IHRoaXMuZ2V0SWQoKVxuICAgIH07XG4gICAgcmV0dXJuIG9yYWdpbiA/IG8gOiBKU09OLnN0cmluZ2lmeShvKTtcbn07XG5cblxuLyoqXG4gKiDojrflj5blvZPliY0gU3ByZWFkU2hlZXQg5a+55bqU55qEIFdvcmtib29rIOWunuS+i+OAglxuICogQHJldHVybnMge1dvcmtib29rfVxuICovXG5TcHJlYWRTaGVldC5wcm90b3R5cGUuZ2V0V29ya2Jvb2tJbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy53b3JrYm9vaztcbn07XG5cblxuLyoqXG4gKiDojrflj5blvZPliY0gU3ByZWFkU2hlZXQg5a+55bqU55qEIEZyYW1lIOWunuS+i+OAglxuICogQHJldHVybnMge0ZyYW1lfVxuICovXG5TcHJlYWRTaGVldC5wcm90b3R5cGUuZ2V0RnJhbWVJbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5mcmFtZTtcbn07XG5cblxuU3ByZWFkU2hlZXQucHJvdG90eXBlLl9pbml0UGx1Z2luID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucGx1Z2lucyA9IG5ldyBNYXAoKTtcbiAgICBnZXRBbGxQbHVnaW5zKCkuZm9yRWFjaChQID0+IHtcbiAgICAgICAgdmFyIHAgPSBuZXcgUCh0aGlzKTtcbiAgICAgICAgdmFsaWRhdGVQbHVnaW4ocCk7XG4gICAgICAgIHRoaXMucGx1Z2lucy5zZXQocC5fX25hbWVfXywgcCk7XG4gICAgfSk7XG59O1xuXG5TcHJlYWRTaGVldC5wcm90b3R5cGUuX2VuYWJsZVBsdWdpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnBsdWdpbnMuZm9yRWFjaChwID0+IHtcbiAgICAgICAgaWYgKHAuaXNFbmFibGUoKSkge1xuICAgICAgICAgICAgcC5lbmFibGUoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbiIsImltcG9ydCB7aXNFbXB0eVZhbHVlfSBmcm9tICcuLi91dGlscy9jb21tb24nXG5cbi8qKlxuICog6YWN572u57+76K+R57G744CCXG4gKiDmoYbmnrblhoXpg6jkvb/nlKjvvIznlKjmiLfku6PnoIHkuI3lupTor6XosIPnlKjlroPjgIJcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5jbGFzcyBDb25maWdUcmFuc2xhdG9yIHtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZ1xuICAgICAqIEBwYXJhbSB7U2hlZXR9IHNoZWV0XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBzaGVldCkge1xuICAgICAgICB0aGlzLmluaXRpYWxDb25maWcgPSBjb25maWc7XG4gICAgICAgIHRoaXMuc2hlZXQgPSBzaGVldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDkuK3pl7TmlbDmja7moLzlvI/nmoTorr7orqHkvJrlsL3ph4/lkIzml7bkv53or4HlnKggRXhjZWwg5Y+KIFdlYiDpobXpnaLkuK3lnYfkvr/kuo7lpITnkIbvvIxcbiAgICAgKiDkvYbkuI3lhY3lrZjlnKjkuIDkupsgV2ViIOS4remavuS7peebtOaOpeS9v+eUqOeahOaVsOaNruagvOW8j++8jOivpeaWueazleWNs+aYr+WujOaIkOatpOexu+aVsOaNruagvOW8j1xuICAgICAqIOeahOmAgumFjei9rOaNouW3peS9nOOAglxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9XG4gICAgICovXG4gICAgdHJhbnNsYXRlKCkge1xuICAgICAgICB2YXIgc2V0dGluZ3MgPSB7fTtcbiAgICAgICAgdmFyIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpO1xuICAgICAgICB2YXIgcHJvcGVydHkgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhwcm90byk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9wZXJ0eS5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKHByb3BlcnR5W2ldLnN0YXJ0c1dpdGgoJ190cmFucycpKSB7XG4gICAgICAgICAgICAgICAgdGhpc1twcm9wZXJ0eVtpXV0uY2FsbCh0aGlzLCBzZXR0aW5ncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gY29uc29sZS5pbmZvKHRoaXMuc2hlZXQuZ2V0TmFtZSgpICsgJ1tDb25maWdUcmFuc2xhdG9yLnRyYW5zbGF0ZV0gc2V0dGluZ3MgLT4nLCBzZXR0aW5ncyk7XG4gICAgICAgIHJldHVybiBzZXR0aW5ncztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBoYW5kc29udGFibGUg5Lit55qE5LiA5Lqb54q25oCB5peg5rOV6YCa6L+H5Yid5aeL6YWN572u5Y+C5pWw5o6n5Yi277yMXG4gICAgICog5Y+q6IO95Zyo5a6e5L6L5YyW5LmL5ZCO6LCD55So55u45bqU55qE5pa55rOV5p2l5oGi5aSN55u45bqU55qE54q25oCB77yM5q2k5pa55rOVXG4gICAgICog5Y2z5piv5a6M5oiQ6K+l5Yqf6IO944CCXG4gICAgICovXG4gICAgaW5pdFNoZWV0U3RhdGUoKSB7XG4gICAgICAgIHZhciBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKTtcbiAgICAgICAgdmFyIHByb3BlcnR5ID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocHJvdG8pO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvcGVydHkubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChwcm9wZXJ0eVtpXS5zdGFydHNXaXRoKCdfaW5pdCcpKSB7XG4gICAgICAgICAgICAgICAgdGhpc1twcm9wZXJ0eVtpXV0uY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSB0cmFuc2xhdGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBfdHJhbnNDZWxsKHNldHRpbmdzKSB7XG4gICAgICAgIHZhciBtID0gdGhpcy5pbml0aWFsQ29uZmlnLmNlbGxNZXRhcztcbiAgICAgICAgaWYgKG0pIHtcbiAgICAgICAgICAgIHNldHRpbmdzLmNlbGwgPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbS5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGxldCByb3cgPSBtW2ldO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcm93Lmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjZWxsTWV0YSA9IHJvd1tqXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGxNZXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgY2VsbC5yb3cgPSBjZWxsTWV0YS5yb3c7XG4gICAgICAgICAgICAgICAgICAgICAgICBjZWxsLmNvbCA9IGNlbGxNZXRhLmNvbDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGxNZXRhLmRhdGFUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgZHQgaW4gY2VsbE1ldGEuZGF0YVR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGxNZXRhLmRhdGFUeXBlLmhhc093blByb3BlcnR5KGR0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VsbFtkdF0gPSBjZWxsTWV0YS5kYXRhVHlwZVtkdF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VsbC50eXBlID0gY2VsbE1ldGEuZGF0YVR5cGUudHlwZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNlbGwudHlwZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjZWxsTWV0YS5zdHlsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2VsbE1ldGEuc3R5bGVzLmFsaWdubWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGMgPSBjZWxsTWV0YS5zdHlsZXMuYWxpZ25tZW50cy5qb2luKCcgaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VsbC5jbGFzc05hbWUgPSBjZWxsLmNsYXNzTmFtZSA/IChjZWxsLmNsYXNzTmFtZSArPSAnIGh0JyArIGMpIDogJ2h0JyArIGM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5jZWxsLnB1c2goY2VsbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfdHJhbnNEYXRhKHNldHRpbmdzKSB7XG4gICAgICAgIHZhciBzID0gdGhpcy5pbml0aWFsQ29uZmlnLmRhdGE7XG4gICAgICAgIGlmIChzKSB7XG4gICAgICAgICAgICAvLyBob3RUYWJsZSDlnKjmnIkgZGF0YSDnmoTmg4XlhrXkuIvlj6rog73mmL7npLrmnInmlbDmja7nmoTooYzliJfvvIzov5nlr7nkuo7orr7orqHlmajmnaXor7TlubbkuI3mlrnkvr/kvb/nlKjvvIxcbiAgICAgICAgICAgIC8vIOaVheWhq+WFheepuuaVsOaNruS7peaSkei1t+ihqOagvOiHsyBpbml0Um93cyAqIGluaXRDb2xzIOeahOWkp+Wwj+OAglxuICAgICAgICAgICAgLy8gICAgaWYgKHMubGVuZ3RoIDwgdGhpcy5zaGVldC5pbml0Um93cykge1xuICAgICAgICAgICAgLy8gICAgICAgIGxldCBmb3JtZXJDb2wgPSBzLmxlbmd0aDtcbiAgICAgICAgICAgIC8vICAgICAgICBzLmxlbmd0aCA9IHRoaXMuc2hlZXQuaW5pdFJvd3M7XG4gICAgICAgICAgICAvLyAgICAgICAgcy5maWxsKFtdLCBmb3JtZXJDb2wpO1xuICAgICAgICAgICAgLy8gICAgfVxuICAgICAgICAgICAgLy8gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgbGV0IHJvdyA9IHNbaV07XG4gICAgICAgICAgICAvLyAgICAgICAgaWYgKHJvdy5sZW5ndGggPCB0aGlzLnNoZWV0LmluaXRDb2xzKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgIGxldCBmb3JtZXJSb3cgPSByb3cubGVuZ3RoO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICByb3cubGVuZ3RoID0gdGhpcy5zaGVldC5pbml0Q29scztcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgcm93LmZpbGwoJycsIGZvcm1lclJvdyk7XG4gICAgICAgICAgICAvLyAgICAgICAgfVxuICAgICAgICAgICAgLy8gICAgfVxuICAgICAgICAgICAgc2V0dGluZ3MubWluUm93cyA9IHRoaXMuc2hlZXQuaW5pdFJvd3M7XG4gICAgICAgICAgICBzZXR0aW5ncy5taW5Db2xzID0gdGhpcy5zaGVldC5pbml0Q29scztcblxuICAgICAgICAgICAgc2V0dGluZ3MuZGF0YSA9IHM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDliJflrr1cbiAgICBfdHJhbnNDb2xXaWR0aHMoc2V0dGluZ3MpIHtcbiAgICAgICAgdmFyIHcgPSB0aGlzLmluaXRpYWxDb25maWcuY29sV2lkdGhzO1xuICAgICAgICBpZiAodykge1xuICAgICAgICAgICAgc2V0dGluZ3MuY29sV2lkdGhzID0gdztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOihjOmrmFxuICAgIF90cmFuc1Jvd0hlaWdodHMoc2V0dGluZ3MpIHtcbiAgICAgICAgdmFyIGggPSB0aGlzLmluaXRpYWxDb25maWcucm93SGVpZ2h0cztcbiAgICAgICAgaWYgKGgpIHtcbiAgICAgICAgICAgIHNldHRpbmdzLnJvd0hlaWdodHMgPSBoO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g6L655qGGXG4gICAgX3RyYW5zQm9yZGVycyhzZXR0aW5ncykge1xuICAgICAgICB2YXIgcyA9IHRoaXMuaW5pdGlhbENvbmZpZy5ib3JkZXJzO1xuICAgICAgICBpZiAocykge1xuICAgICAgICAgICAgc2V0dGluZ3MuY3VzdG9tQm9yZGVycyA9IHM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlkIjlubbljZXlhYPmoLxcbiAgICBfdHJhbnNNZXJnZUNlbGxzKHNldHRpbmdzKSB7XG4gICAgICAgIHZhciBzID0gdGhpcy5pbml0aWFsQ29uZmlnLm1lcmdlQ2VsbHM7XG4gICAgICAgIGlmIChzKSB7XG4gICAgICAgICAgICBzZXR0aW5ncy5tZXJnZUNlbGxzID0gcztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBpbml0U3RhdGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLyDpgInljLpcbiAgICBfaW5pdFNlbGVjdGlvbigpIHtcbiAgICAgICAgdmFyIHMgPSB0aGlzLmluaXRpYWxDb25maWcuc2VsZWN0aW9uO1xuICAgICAgICBpZiAocykge1xuICAgICAgICAgICAgdGhpcy5zaGVldC5zZWxlY3Qocy5yb3csIHMuY29sLCBzLmVuZFJvdywgcy5lbmRDb2wpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zaGVldC5zZWxlY3QoMCwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29uZmlnVHJhbnNsYXRvcjsiLCJpbXBvcnQgQ29udGV4dE1lbnUgZnJvbSAnLi9mcmFtZS9Db250ZXh0TWVudSdcblxuLyoqXG4gKiDnlLXlrZDooajmoLzorr7orqHlmajkuK3vvIzpmaTkuoYgV29ya2Jvb2sg5aSW55qE57uE5Lu2566h55CG5Zmo77yMXG4gKiDljIXlkKvoj5zljZXmoI/jgIHlt6XlhbfmoI/jgIHkvqfovrnmoI/jgIHlj7PplK7oj5zljZXnrYnnrYnjgIJcbiAqL1xuY2xhc3MgRnJhbWUge1xuXG4gICAgY29uc3RydWN0b3IoaW5zdGFuY2UsIGNvbmZpZykge1xuICAgICAgICB0aGlzLnNwcmVhZFNoZWV0ID0gaW5zdGFuY2U7XG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAdHlwZSB7Q29udGV4dE1lbnV9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNvbnRleHRNZW51ID0gbmV3IENvbnRleHRNZW51KGluc3RhbmNlKTtcbiAgICB9XG5cbiAgICBfZ2V0RXhjaGFuZ2UoKSB7XG5cbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgRnJhbWU7IiwiaW1wb3J0IHtleHRlbmR9IGZyb20gJy4uL3V0aWxzL2NvbW1vbi5qcydcbmltcG9ydCBDb25maWdUcmFuc2xhdG9yIGZyb20gJy4vQ29uZmlnVHJhbnNsYXRvci5qcydcblxuXG4vKipcbiAqIEhhbmRzb250YWJsZSDnu4Tku7bnmoTpgILphY3nsbtcbiAqL1xuY2xhc3MgSG90VGFibGVBZGFwdG9yIGV4dGVuZHMgSGFuZHNvbnRhYmxlIHtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcm9vdEVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0g5Y6f5aeL6YWN572u5L+h5oGvXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGV4dENvbmZpZyAtIOmZhOWKoOeahOmFjee9ruS/oeaBr1xuICAgICAqIEBwYXJhbSB7U2hlZXR9IHNoZWV0IC0g5a+55bqU55qEIHNoZWV0IOWunuS+i1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3RFbGVtZW50LCBjb25maWcsIGV4dENvbmZpZywgc2hlZXQpIHtcbiAgICAgICAgdmFyIGhvdFNldHRpbmdzID0ge307XG4gICAgICAgIHZhciB0cmFuc2xhdG9yID0gbmV3IENvbmZpZ1RyYW5zbGF0b3IoY29uZmlnLCBzaGVldCk7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9IHRyYW5zbGF0b3IudHJhbnNsYXRlKCk7XG5cbiAgICAgICAgdmFyIGZyYW1lID0gc2hlZXQud29ya2Jvb2suc3ByZWFkU2hlZXQuZ2V0RnJhbWVJbnN0YW5jZSgpO1xuICAgICAgICB2YXIgbWVudUl0ZW1zID0gZnJhbWUuY29udGV4dE1lbnUubWVudUl0ZW1zO1xuICAgICAgICB2YXIgY29udGV4dE1lbnUgPSB7fTtcbiAgICAgICAgY29udGV4dE1lbnUuaXRlbXMgPSBmcmFtZS5jb250ZXh0TWVudS5nZXRNZW51SXRlbXM0SG90VGFibGUoKTtcbiAgICAgICAgY29udGV4dE1lbnUuY2FsbGJhY2sgPSAoZnVuY3Rpb24gKHNoZWV0KSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGtleSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGlmIChtZW51SXRlbXMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSBtZW51SXRlbXMuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmhhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uaGFuZGxlci5jYWxsKHRoaXMsIHNoZWV0LCBvcHRpb25zLnN0YXJ0LCBvcHRpb25zLmVuZCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KHNoZWV0KSk7XG4gICAgICAgIEhvdFRhYmxlQWRhcHRvci5fcHJlZmVyZW5jZS5jb250ZXh0TWVudSA9IGNvbnRleHRNZW51O1xuXG4gICAgICAgIGV4dGVuZChob3RTZXR0aW5ncywgSG90VGFibGVBZGFwdG9yLl9wcmVmZXJlbmNlKTtcbiAgICAgICAgZXh0ZW5kKGhvdFNldHRpbmdzLCBzZXR0aW5ncyk7XG4gICAgICAgIGV4dGVuZChob3RTZXR0aW5ncywgZXh0Q29uZmlnKTtcbiAgICAgICAgc3VwZXIocm9vdEVsZW1lbnQsIGhvdFNldHRpbmdzKTtcblxuICAgICAgICB0aGlzLl90cmFuc2xhdG9yID0gdHJhbnNsYXRvcjtcbiAgICB9XG5cbn1cblxuXG4vKipcbiAqIOmihOiuvumFjee9ruOAglxuICogQHByaXZhdGVcbiAqL1xuSG90VGFibGVBZGFwdG9yLl9wcmVmZXJlbmNlID0ge1xuICAgIG91dHNpZGVDbGlja0Rlc2VsZWN0czogZmFsc2UsXG5cbiAgICByb3dIZWFkZXJzOiB0cnVlLFxuICAgIGNvbEhlYWRlcnM6IHRydWUsXG5cbiAgICBtYW51YWxDb2x1bW5SZXNpemU6IHRydWUsXG4gICAgbWFudWFsUm93UmVzaXplOiB0cnVlLFxuICAgIGNsYXNzTmFtZTogJ3NzZC1oYW5kc29udGFibGUnLFxuXG4gICAgeEZvcm11bGFzOiB0cnVlLFxuXG4gICAgY29udGV4dE1lbnU6IHt9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBIb3RUYWJsZUFkYXB0b3I7IiwiaW1wb3J0IFRhYnMgZnJvbSAgJy4vdmlld3MvVGFicyc7XG5pbXBvcnQgSGFuZHNvbnRhYmxlIGZyb20gJy4vSG90VGFibGVBZGFwdG9yJztcbmltcG9ydCB7U2hlZXRFcnJvcn0gZnJvbSAnLi9TaGVldEVycm9yJ1xuaW1wb3J0IHtDb29yZGluYXRlfSBmcm9tICcuLi91dGlscy9jb21tb24nO1xuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vdXRpbHMvRW1pdHRlcidcblxuY29uc3QgSU5JVF9ST1dTID0gMTUwOyAvLyBTaGVldCDliJ3lp4vlj6/mmL7npLrnmoTooYzmlbBcbmNvbnN0IElOSVRfQ09MUyA9IDUwOyAgLy8gU2hlZXQg5Yid5aeL5Y+v5pi+56S655qE5YiX5pWwXG5cblxuLyoqXG4gKiDlt6XkvZzooahcbiAqXG4gKiBAZmlyZXMgU2hlZXQjYWZ0ZXJSZW5hbWVcbiAqIEBmaXJlcyBTaGVldCNhZnRlclJlbmFtZUNhbmNlbFxuICovXG5jbGFzcyBTaGVldCBleHRlbmRzIEVtaXR0ZXIge1xuXG4gICAgLyoqXG4gICAgICog5p6E6YCgIFNoZWV0IOWunuS+i++8jOeUqOaIt+S7o+eggeS4jeW6lOivpeebtOaOpeiwg+eUqOWug++8jFxuICAgICAqIOiAjOaYr+S9v+eUqCBXb3JrYm9vay5jcmVhdGVTaGVldCgpIOaWueazleaehOmAoOOAglxuICAgICAqXG4gICAgICogQHBhcmFtIHtXb3JrYm9va30gd29ya2Jvb2tcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29uZmlnXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih3b3JrYm9vaywgY29uZmlnKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBzaGVldCDmiYDlnKjnmoTlt6XkvZzooahcbiAgICAgICAgICogQHR5cGUge1dvcmtib29rfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53b3JrYm9vayA9IHdvcmtib29rO1xuICAgICAgICB0aGlzLiQkdmlldyA9IHdvcmtib29rLiQkdmlldztcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5zaGVldE5hbWUgPSBjb25maWcubmFtZTtcblxuICAgICAgICB0aGlzLmluaXRSb3dzID0gSU5JVF9ST1dTO1xuICAgICAgICB0aGlzLmluaXRDb2xzID0gSU5JVF9DT0xTO1xuXG4gICAgICAgIHRoaXMuZnggPSB7fTsgLy8gVE9ET1xuXG4gICAgICAgIHRoaXMuX3JlbmRlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbmRlcigpIHtcbiAgICAgICAgdGhpcy4kJHZpZXcuYXBwZW5kVGFiKHRoaXMuc2hlZXROYW1lKTtcbiAgICAgICAgdmFyIHtjb250YWluZXIsIHdpZHRoLCBoZWlnaHR9ID0gdGhpcy4kJHZpZXcuX2hvdFRhYmxlcy5nZXQodGhpcy5zaGVldE5hbWUpO1xuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge0hhbmRzb250YWJsZX1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaGFuZHNvbnRhYmxlID0gbmV3IEhhbmRzb250YWJsZShjb250YWluZXIsIHRoaXMuc2V0dGluZ3MsIHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgc3RhcnRSb3dzOiB0aGlzLmluaXRSb3dzLFxuICAgICAgICAgICAgc3RhcnRDb2xzOiB0aGlzLmluaXRDb2xzLFxuICAgICAgICAgICAgX2lzSG90VGFibGVBZGFwdG9yOiB0cnVlLFxuICAgICAgICAgICAgX3NoZWV0OiB0aGlzXG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB0aGlzLmhhbmRzb250YWJsZS5fdHJhbnNsYXRvci5pbml0U2hlZXRTdGF0ZSgpO1xuICAgICAgICB0aGlzLiQkdmlldy5oaWRlQ29udGVudCh0aGlzLmdldE5hbWUoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6I635Y+W5b2T5YmNIHNoZWV0IOeahOWQjeWtl1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hlZXROYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOa/gOa0u+W9k+WJjSBzaGVldCDpobVcbiAgICAgKi9cbiAgICBhY3RpdmUoKSB7XG4gICAgICAgIHRoaXMud29ya2Jvb2suYWN0aXZlU2hlZXQgPSB0aGlzLmdldE5hbWUoKTtcbiAgICAgICAgdGhpcy4kJHZpZXcuYWN0aXZlVGFiKHRoaXMuZ2V0TmFtZSgpKTtcbiAgICAgICAgdGhpcy5oYW5kc29udGFibGUucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5qOA5rWL5b2T5YmNIHNoZWV0IOaYr+WQpuiiq+a/gOa0u1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzQWN0aXZlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy53b3JrYm9vay5hY3RpdmVTaGVldCA9PT0gdGhpcy5nZXROYW1lKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVE9ETyDplIDmr4Egc2hlZXQg6aG1XG4gICAgICovXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgLy8g5qOA5p+l5piv5LiN5piv5pyA5ZCO5LiA5LiqXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog57uZIHNoZWV0IOmhtemHjeWRveWQjVxuICAgICAqIEBwYXJhbSBuYW1lIC0g5paw5ZCN5a2XXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0g5piv5ZCm5oiQ5YqfXG4gICAgICovXG4gICAgcmVuYW1lKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud29ya2Jvb2sucmVuYW1lU2hlZXQodGhpcy5nZXROYW1lKCksIG5hbWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOmAieS4rSBzaGVldCDkuK3nmoTmn5DljLrln5/jgIJcbiAgICAgKiDkuI3mjIflrpogdG9Sb3cg44CBdG9Db2wg5pe25YiZ6YCJ5Lit5a+55bqU55qE5Y2V5YWD5qC844CCXG4gICAgICogQHBhcmFtIHtpbnR9IGZyb21Sb3cgLSDotbflp4vooYxcbiAgICAgKiBAcGFyYW0ge2ludH0gZnJvbUNvbCAtIOi1t+Wni+WIl1xuICAgICAqIEBwYXJhbSB7aW50fSBbdG9Sb3ddIC0g57uI5q2i6KGMXG4gICAgICogQHBhcmFtIHtpbnR9IFt0b0NvbF0gLSDnu4jmraLliJdcbiAgICAgKi9cbiAgICBzZWxlY3QoZnJvbVJvdywgZnJvbUNvbCwgdG9Sb3csIHRvQ29sKSB7XG4gICAgICAgIHRvUm93ID0gdG9Sb3cgfHwgZnJvbVJvdztcbiAgICAgICAgdG9Db2wgPSB0b0NvbCB8fCBmcm9tQ29sO1xuICAgICAgICB0aGlzLmhhbmRzb250YWJsZS5zZWxlY3RDZWxsKGZyb21Sb3csIGZyb21Db2wsIHRvUm93LCB0b0NvbCwgZmFsc2UpO1xuICAgIH1cblxuICAgIGdldFNlbGVjdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGVjdGlvbiA9IHRoaXMuaGFuZHNvbnRhYmxlLmdldFNlbGVjdGVkKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByb3c6IHNlbGVjdGlvblswXSxcbiAgICAgICAgICAgIGNvbDogc2VsZWN0aW9uWzFdLFxuICAgICAgICAgICAgZW5kUm93OiBzZWxlY3Rpb25bMl0sXG4gICAgICAgICAgICBlbmRDb2w6IHNlbGVjdGlvblszXVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5ZCI5bm25Y2V5YWD5qC8XG4gICAgICogVElQOiBoYW5kc29udGFibGUg5a6Y5pa55ZCI5bm25Yqf6IO95LiN6IO95q2j56Gu5aSE55CG5bey5pyJ55qE5ZCI5bm25Yy65Z+f77yM5pWF5YGa6YeN5paw6K6h566X44CCXG4gICAgICogQHBhcmFtIHtpbnR9IHJvdyAtIOi1t+Wni+ihjFxuICAgICAqIEBwYXJhbSB7aW50fSBjb2wgLSDotbflp4vliJdcbiAgICAgKiBAcGFyYW0ge2ludH0gcm93c3BhbiAtIOW+heWQiOW5tueahOihjOaVsFxuICAgICAqIEBwYXJhbSB7aW50fSBjb2xzcGFuIC0g5b6F5ZCI5bm255qE5YiX5pWwXG4gICAgICovXG4gICAgLy8gVE9ETyDmnIDlpKfooYzliJfmlbDpmZDliLZcbiAgICBtZXJnZUNlbGxzKHJvdywgY29sLCByb3dzcGFuLCBjb2xzcGFuKSB7XG4gICAgICAgIHZhciByID0gMDtcbiAgICAgICAgdmFyIGNvdmVyID0gW107XG4gICAgICAgIHZhciBtZXJnZUNlbGxzID0gdGhpcy5oYW5kc29udGFibGUuZ2V0U2V0dGluZ3MoKS5tZXJnZUNlbGxzO1xuXG4gICAgICAgIHZhciByMSA9IFtyb3csIGNvbCwgcm93ICsgcm93c3BhbiAtIDEsIGNvbCArIGNvbHNwYW4gLSAxXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gbWVyZ2VDZWxscy5sZW5ndGg7IGk7IC0taSkge1xuICAgICAgICAgICAgbGV0IGYgPSBtZXJnZUNlbGxzW2kgLSAxXTtcbiAgICAgICAgICAgIGxldCByMiA9IFtmLnJvdywgZi5jb2wsIGYucm93ICsgZi5yb3dzcGFuIC0gMSwgZi5jb2wgKyBmLmNvbHNwYW4gLSAxXTtcblxuICAgICAgICAgICAgLy8g5LiO5Y6f5Yy65Z+f5a2Y5Zyo5a6M5YWo6YeN5Y+gXG4gICAgICAgICAgICBpZiAoQ29vcmRpbmF0ZS5pc0VxdWFsKHIxLCByMikpIHtcbiAgICAgICAgICAgICAgICByID0gMTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOaYr+WOn+WMuuWfn+eahOWtkOmbhlxuICAgICAgICAgICAgaWYgKENvb3JkaW5hdGUuaXNTdWJzZXQocjEsIHIyKSkge1xuICAgICAgICAgICAgICAgIHIgPSAyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8g6KaG55uW5Y6f5Yy65Z+f77yI5q2k5pe25Y+v6IO95LiO5Y+m5LiA5Liq5Y6f5Yy65Z+f5Lqk6ZuG5oiW5a6M5YWo6KaG55uW77yJXG4gICAgICAgICAgICBpZiAoQ29vcmRpbmF0ZS5pc1N1cGVyc2V0KHIxLCByMikpIHtcbiAgICAgICAgICAgICAgICBjb3Zlci5wdXNoKGkgLSAxKTtcbiAgICAgICAgICAgICAgICByID0gMztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOS4juWOn+WMuuWfn+WtmOWcqOS6pOmbhijkuI3lkKvlrZDpm4bjgIHotoXpm4bmg4XlhrUpXG4gICAgICAgICAgICBpZiAoQ29vcmRpbmF0ZS5pbnRlcnNlY3Rpb24ocjEsIHIyKSkge1xuICAgICAgICAgICAgICAgIHIgPSA0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHIgPT09IDAgfHwgciA9PT0gMykge1xuICAgICAgICAgICAgaWYgKHIgPT09IDMpIHsgLy8g6L+Z56eN5oOF5Ya15LiL5LiA5a6a5a2Y5Zyo5bey57uP5ZCI5bm26L+H55qE5Y2V5YWD5qC8XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3Zlci5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICBtZXJnZUNlbGxzLnNwbGljZShjb3ZlcltpXSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWVyZ2VDZWxscyA9IG1lcmdlQ2VsbHMgfHwgW107XG4gICAgICAgICAgICBtZXJnZUNlbGxzLnB1c2goe1xuICAgICAgICAgICAgICAgIHJvdzogcm93LFxuICAgICAgICAgICAgICAgIGNvbDogY29sLFxuICAgICAgICAgICAgICAgIHJvd3NwYW46IHJvd3NwYW4sXG4gICAgICAgICAgICAgICAgY29sc3BhbjogY29sc3BhblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmhhbmRzb250YWJsZS51cGRhdGVTZXR0aW5ncyh7XG4gICAgICAgICAgICAgICAgbWVyZ2VDZWxsczogbWVyZ2VDZWxsc1xuICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICB9IGVsc2UgaWYgKHIgPT09IDIgfHwgciA9PT0gNCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFNoZWV0RXJyb3IoYOe7meWumueahOWQiOW5tuWMuuWfn+S4jeWQiOazlTogWyR7cm93fSwgJHtjb2x9LCAke3Jvd3NwYW59LCAke2NvbHNwYW59XWApXG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIOWPlua2iOWNleWFg+agvOWQiOW5tlxuICAgICAqIEBwYXJhbSB7aW50fSByb3cgLSDotbflp4vooYxcbiAgICAgKiBAcGFyYW0ge2ludH0gY29sIC0g6LW35aeL5YiXXG4gICAgICogQHBhcmFtIHtpbnR9IHJvd3NwYW4gLSDlvoXlkIjlubbnmoTooYzmlbBcbiAgICAgKiBAcGFyYW0ge2ludH0gY29sc3BhbiAtIOW+heWQiOW5tueahOWIl+aVsFxuICAgICAqL1xuICAgIHVuTWVyZ2VDZWxscyhyb3csIGNvbCwgcm93c3BhbiwgY29sc3Bhbikge1xuICAgICAgICB2YXIgbWVyZ2VkID0gdGhpcy5oYW5kc29udGFibGUuZ2V0U2V0dGluZ3MoKS5tZXJnZUNlbGxzO1xuICAgICAgICB2YXIgbWVyZ2VDZWxscyA9IFtdO1xuICAgICAgICBpZiAobWVyZ2VkICYmIG1lcmdlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWVyZ2VkLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKENvb3JkaW5hdGUuaXNTdWJzZXQoW1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVyZ2VkW2ldLnJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lcmdlZFtpXS5jb2wsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXJnZWRbaV0ucm93ICsgbWVyZ2VkW2ldLnJvd3NwYW4gLSAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVyZ2VkW2ldLmNvbCArIG1lcmdlZFtpXS5jb2xzcGFuIC0gMVxuICAgICAgICAgICAgICAgICAgICBdLCBbcm93LCBjb2wsIHJvdyArIHJvd3NwYW4gLSAxLCBjb2wgKyBjb2xzcGFuIC0gMV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtZXJnZUNlbGxzLnB1c2gobWVyZ2VkW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhhbmRzb250YWJsZS51cGRhdGVTZXR0aW5ncyh7XG4gICAgICAgICAgICBtZXJnZUNlbGxzOiBtZXJnZUNlbGxzLmxlbmd0aCA9PT0gMCA/IGZhbHNlIDogbWVyZ2VDZWxsc1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIF9nZXRFeGNoYW5nZSgpIHtcbiAgICAgICAgdmFyIHtkYXRhLCBjZWxsc30gPSB0aGlzLl9nZXREYXRhTWV0YSgpO1xuICAgICAgICB2YXIge2hlaWdodHMsIHdpZHRoc30gPSB0aGlzLl9nZXRTaXplKCk7XG4gICAgICAgIHZhciBtZXJnZUNlbGxzID0gdGhpcy5oYW5kc29udGFibGUuZ2V0U2V0dGluZ3MoKS5tZXJnZUNlbGxzO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiB0aGlzLmdldE5hbWUoKSxcbiAgICAgICAgICAgIHNlbGVjdGlvbjogdGhpcy5nZXRTZWxlY3Rpb24oKSxcbiAgICAgICAgICAgIGRhdGE6IGRhdGEubGVuZ3RoID8gZGF0YSA6IFtdLl8sXG4gICAgICAgICAgICByb3dIZWlnaHRzOiBoZWlnaHRzLFxuICAgICAgICAgICAgY29sV2lkdGhzOiB3aWR0aHMsXG4gICAgICAgICAgICBtZXJnZUNlbGxzOiBtZXJnZUNlbGxzLFxuICAgICAgICAgICAgY2VsbE1ldGFzOiBjZWxsc1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2dldFNpemUoKSB7XG4gICAgICAgIHZhciBob3QgPSB0aGlzLmhhbmRzb250YWJsZTtcbiAgICAgICAgdmFyIGNvbHMgPSBNYXRoLm1heChob3QuY291bnRDb2xzKCkgLSBob3QuY291bnRFbXB0eUNvbHModHJ1ZSksIDIwKTtcbiAgICAgICAgdmFyIHJvd3MgPSBNYXRoLm1heChob3QuY291bnRSb3dzKCkgLSBob3QuY291bnRFbXB0eVJvd3ModHJ1ZSksIDUwKTtcbiAgICAgICAgdmFyIGhlaWdodHMgPSBbXTtcbiAgICAgICAgdmFyIHdpZHRocyA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcm93czsgKytpKSB7XG4gICAgICAgICAgICBsZXQgaCA9IGhvdC5nZXRSb3dIZWlnaHQoaSk7XG4gICAgICAgICAgICBpZiAoaSA9PT0gMCAmJiAhaCkgeyAvLyBoYW5kc29udGFibGUgYnVnXG4gICAgICAgICAgICAgICAgaCA9IDI0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaGVpZ2h0cy5wdXNoKGgpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sczsgKytpKSB7XG4gICAgICAgICAgICB3aWR0aHMucHVzaChob3QuZ2V0Q29sV2lkdGgoaSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7aGVpZ2h0cywgd2lkdGhzfTtcbiAgICB9XG5cbiAgICBfZ2V0RGF0YU1ldGEoKSB7XG4gICAgICAgIHZhciBob3QgPSB0aGlzLmhhbmRzb250YWJsZTtcbiAgICAgICAgdmFyIGNvbHMgPSBob3QuY291bnRDb2xzKCkgLSBob3QuY291bnRFbXB0eUNvbHModHJ1ZSk7XG4gICAgICAgIHZhciByb3dzID0gaG90LmNvdW50Um93cygpIC0gaG90LmNvdW50RW1wdHlSb3dzKHRydWUpO1xuICAgICAgICB2YXIgZGF0YSA9IFtdO1xuICAgICAgICB2YXIgY2VsbHMgPSBbXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJvd3M7ICsraSkge1xuICAgICAgICAgICAgbGV0IHJvd1Jlc3VsdCA9IFtdO1xuICAgICAgICAgICAgbGV0IHJvd0NlbGxNZXRhID0gW107XG5cbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgY29sczsgKytqKSB7XG4gICAgICAgICAgICAgICAgbGV0IF9zb3VyY2VEYXRhID0gaG90LmdldFNvdXJjZURhdGFBdENlbGwoaSwgaik7XG4gICAgICAgICAgICAgICAgbGV0IF9tZXRhID0gaG90LmdldENlbGxNZXRhKGksIGopOyAvLyBUT0RPIG1ldGFcbiAgICAgICAgICAgICAgICBsZXQgX2RhdGEgPSBob3QuZ2V0RGF0YUF0Q2VsbChpLCBqKTtcbiAgICAgICAgICAgICAgICBsZXQgX2NlbGxNYXRhID0ge307XG5cbiAgICAgICAgICAgICAgICBfY2VsbE1hdGEucm93ID0gaTtcbiAgICAgICAgICAgICAgICBfY2VsbE1hdGEuY29sID0gajtcbiAgICAgICAgICAgICAgICBfY2VsbE1hdGEuaXNGb3JtdWxhID0gISEoX3NvdXJjZURhdGEgJiYgKF9zb3VyY2VEYXRhICsgJycpLmNoYXJBdCgwKSA9PT0gJz0nKTtcbiAgICAgICAgICAgICAgICBfY2VsbE1hdGEuc291cmNlVmFsdWUgPSBfc291cmNlRGF0YTtcbiAgICAgICAgICAgICAgICBfY2VsbE1hdGEudmFsdWUgPSBfZGF0YTtcblxuICAgICAgICAgICAgICAgIC8vIFRPRE8gZGF0YVR5cGUsIHN0eWxlc1xuICAgICAgICAgICAgICAgIHJvd1Jlc3VsdC5wdXNoKF9zb3VyY2VEYXRhKTtcbiAgICAgICAgICAgICAgICByb3dDZWxsTWV0YS5wdXNoKF9jZWxsTWF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkYXRhLnB1c2gocm93UmVzdWx0KTtcbiAgICAgICAgICAgIGNlbGxzLnB1c2gocm93Q2VsbE1ldGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7ZGF0YSwgY2VsbHN9O1xuICAgIH1cblxuICAgIC8vIFRPRE9cbiAgICBfZ2V0Qm9yZGVycygpIHtcblxuICAgIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBTaGVldDtcblxuXG4vKipcbiAqIGFmdGVyUmVuYW1lIOS6i+S7tuOAglxuICpcbiAqIEBldmVudCBTaGVldCNhZnRlclJlbmFtZVxuICogQHR5cGUge1NoZWV0fVxuICogQHR5cGUge3N0cmluZ31cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cblxuLyoqXG4gKiBhZnRlclJlbmFtZUNhbmNlbCDkuovku7bjgIJcbiAqXG4gKiBAZXZlbnQgU2hlZXQjYWZ0ZXJSZW5hbWVDYW5jZWxcbiAqIEB0eXBlIHtTaGVldH1cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5cbiIsImltcG9ydCB7U3ByZWFkU2hlZXRFcnJvcn0gZnJvbSAnLi4vU3ByZWFkU2hlZXRFcnJvcidcblxuZXhwb3J0IGZ1bmN0aW9uIFNoZWV0RXJyb3IodmFsdWUpIHtcbiAgICB0aGlzLm5hbWUgPSAnU2hlZXRFcnJvcic7XG4gICAgdGhpcy5tZXNzYWdlID0gdmFsdWU7XG59XG5TaGVldEVycm9yLnByb3RvdHlwZSA9IG5ldyBTcHJlYWRTaGVldEVycm9yKCk7XG5TaGVldEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNoZWV0RXJyb3I7IiwiaW1wb3J0IFRhYnMgZnJvbSAgJy4vdmlld3MvVGFicydcbmltcG9ydCBTaGVldCBmcm9tICcuL1NoZWV0J1xuaW1wb3J0IHtTaGVldEVycm9yfSBmcm9tICcuL1NoZWV0RXJyb3InXG5pbXBvcnQge0Nhc2VJbnNlbnNpdGl2ZU1hcH0gZnJvbSAnLi4vdXRpbHMvZGF0YVN0cnVjdHVyZSdcbmltcG9ydCB7dXBwZXJDYXNlfSBmcm9tICcuLi91dGlscy9jb21tb24nXG5pbXBvcnQge2dsb2JhbFNldHRpbmdzfSBmcm9tICcuLi9zZXR0aW5ncydcblxuXG5jb25zdCByZWdFeHAgPSBnbG9iYWxTZXR0aW5ncy5zaGVldC5zaGVldE5hbWU7XG5cbi8qKlxuICog5bel5L2c57C/44CC5LiA5LiqIFdvcmtib29rIOWMheWQq+S4gOS4quaIluWkmuS4qiBTaGVldCAuXG4gKi9cbmNsYXNzIFdvcmtib29rIHtcblxuICAgIC8qKlxuICAgICAqIFdvcmtib29rIOaehOmAoOWZqFxuICAgICAqIEBwYXJhbSB7U3ByZWFkU2hlZXR9IGluc3RhbmNlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZ1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGluc3RhbmNlLCBjb25maWcpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEB0eXBlIHtTcHJlYWRTaGVldH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc3ByZWFkU2hlZXQgPSBpbnN0YW5jZTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtDYXNlSW5zZW5zaXRpdmVNYXB9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNoZWV0cyA9IG5ldyBDYXNlSW5zZW5zaXRpdmVNYXAoKTtcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IGNvbmZpZztcblxuICAgICAgICB0aGlzLl9pbml0U2V0dGluZ3MoY29uZmlnKTtcbiAgICAgICAgdGhpcy4kJHZpZXcgPSBuZXcgVGFicyh0aGlzKTtcblxuICAgICAgICBjb25maWcuc2hlZXRzLmZvckVhY2godiA9PiB0aGlzLmNyZWF0ZVNoZWV0KHYpKTtcblxuICAgICAgICAvLyDmoLnmja7liJ3lp4vljJbmlbDmja7mv4DmtLsgc2hlZXQg6aG1XG4gICAgICAgIHZhciB0b0FjdGl2ZSA9IHRoaXMuZ2V0U2hlZXQodGhpcy5hY3RpdmVTaGVldCk7XG4gICAgICAgIGlmICghdG9BY3RpdmUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBTaGVldEVycm9yKGDmjIflrprnmoQgYWN0aXZlU2hlZXQg5LiN5a2Y5ZyoOiAke3RoaXMuYWN0aXZlU2hlZXR9YCk7XG4gICAgICAgIH1cbiAgICAgICAgdG9BY3RpdmUuYWN0aXZlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2V0dGluZ3NcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0U2V0dGluZ3Moc2V0dGluZ3MpIHtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhzZXR0aW5ncyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBrZXlzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgICAgICBpZiAoa2V5c1tpXSA9PT0gJ3NoZWV0cycpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXNba2V5c1tpXV0gPSBzZXR0aW5nc1trZXlzW2ldXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiOt+WPliBXb3JrYm9vayDmiYDlsZ7nmoTnlLXlrZDooajmoLznmoTnlKjmiLfliJ3lp4vphY3nva7jgIJcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldFNldHRpbmdzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zcHJlYWRTaGVldC5nZXRTZXR0aW5ncygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiOt+WPluW9k+WJjSBXb3JrYm9vayDnmoQgaWRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldElkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pZCB8fCAodGhpcy5pZCA9IHRoaXMuc3ByZWFkU2hlZXQuZ2V0SWQoKSArIGdsb2JhbFNldHRpbmdzLmlkU3VmZml4NFdvcmtib29rKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmoLnmja7mjIflrpogc2hlZXQg5ZCN6I635Y+WIHNoZWV0IOWunuS+i1xuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHJldHVybnMge1NoZWV0fVxuICAgICAqL1xuICAgIGdldFNoZWV0KG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hlZXRzLmdldChuYW1lKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDojrflj5blvZPliY0gV29ya2Jvb2sg5LiL55qE5omA5pyJIHNoZWV0IOWunuS+i1xuICAgICAqIEByZXR1cm5zIHtDYXNlSW5zZW5zaXRpdmVNYXB9XG4gICAgICovXG4gICAgZ2V0U2hlZXRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGVldHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6I635Y+W5omA5pyJIHNoZWV0IOeahOWQjeWtl1xuICAgICAqIEByZXR1cm5zIHtJdGVyYXRvci48Sz59XG4gICAgICovXG4gICAgZ2V0U2hlZXROYW1lcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hlZXRzLmtleXMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmo4Dpqowgc2hlZXQg5piv5ZCm5bey5a2Y5ZyoXG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtleGFjdGx5PWZhbHNlXSAtIOaYr+WQpuS9v+eUqOeyvuehruWkp+Wwj+WGmeeahCBuYW1lXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTaGVldEV4aXN0KG5hbWUsIGV4YWN0bHkpIHtcbiAgICAgICAgaWYgKGV4YWN0bHkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNoZWV0cy5oYXNFeGFjdChuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICAvLyByZXR1cm4gISF0aGlzLmdldFNoZWV0KG5hbWUpO1xuICAgICAgICByZXR1cm4gdGhpcy5zaGVldHMuaGFzKG5hbWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOeUn+aIkCBzaGVldCDntKLlvJVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICovXG4gICAgX2dldEF1dG9TaGVldEluZGV4KCkge1xuICAgICAgICBpZiAoIXRoaXMuJCRhdXRvU2hlZXRJbmRleCkge1xuICAgICAgICAgICAgdGhpcy4kJGF1dG9TaGVldEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKyt0aGlzLiQkYXV0b1NoZWV0SW5kZXg7IC8vIOS7jiAxIOW8gOWni1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiHquWKqOeUn+aIkCBzaGVldCDlkI1cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEF1dG9TaGVldE5hbWUoKSB7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IGdsb2JhbFNldHRpbmdzLnNoZWV0LmF1dG9QcmVmaXggKyAnJzsgLy8g6Ziy5q2i5Ye6546w5pWw5a2X55u45YqgXG4gICAgICAgIHZhciBuYW1lID0gcHJlZml4ICsgdGhpcy5fZ2V0QXV0b1NoZWV0SW5kZXgoKTtcbiAgICAgICAgaWYgKHRoaXMuaXNTaGVldEV4aXN0KG5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0QXV0b1NoZWV0TmFtZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiOt+WPluW9k+WJjea/gOa0u+eahCBzaGVldCDpobVcbiAgICAgKiBAcmV0dXJucyB7U2hlZXR9XG4gICAgICovXG4gICAgZ2V0QWN0aXZlU2hlZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoZWV0cy5nZXQodGhpcy5hY3RpdmVTaGVldCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Yib5bu65paw55qEIHNoZWV0IOmhtVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnXSAtIHNoZWV0IOmhteeahOmFjee9ruS/oeaBr1xuICAgICAqIEByZXR1cm5zIHtTaGVldH0g5paw5Yib5bu655qE5bel5L2c6KGoXG4gICAgICovXG4gICAgY3JlYXRlU2hlZXQoY29uZmlnKSB7XG4gICAgICAgIGlmIChjb25maWcpIHsgIC8vIOagueaNruWIneWni+mFjee9ruWIm+W7uu+8jG5hbWUg5LiN6IO95Li656m6XG4gICAgICAgICAgICB0aGlzLl92YWxpZGF0ZVNoZWV0TmFtZShjb25maWcubmFtZSk7XG4gICAgICAgIH0gZWxzZSB7IC8vIOeUqOaIt+aTjeS9nOWIm+W7uu+8jOWKqOaAgeeUn+aIkCBuYW1lXG4gICAgICAgICAgICBjb25maWcgPSB7fTtcbiAgICAgICAgICAgIGNvbmZpZy5uYW1lID0gdGhpcy5fZ2V0QXV0b1NoZWV0TmFtZSgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBuZXdPbmUgPSBuZXcgU2hlZXQodGhpcywgY29uZmlnKTtcbiAgICAgICAgdGhpcy5zaGVldHMuc2V0KGNvbmZpZy5uYW1lLCBuZXdPbmUpO1xuICAgICAgICByZXR1cm4gbmV3T25lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOmUgOavgeaMh+WumiBzaGVldCDpobVcbiAgICAgKiBAcGFyYW0ge3N0cmluZyB8IFNoZWV0fSBzaGVldCAtIHNoZWV0IOWQjeensOaIluWunuS+i1xuICAgICAqL1xuICAgIGRlc3Ryb3lTaGVldChzaGVldCkge1xuICAgICAgICBpZiAodHlwZW9mIHNoZWV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgc2hlZXQgPSB0aGlzLmdldFNoZWV0KHNoZWV0KTtcbiAgICAgICAgfVxuICAgICAgICBzaGVldC5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog57uZ5oyH5a6a55qEIHNoZWV0IOmhtemHjeWRveWQjVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lMSAtIOW+hemHjeWRveWQjeeahCBzaGVldCDpobXlkI3lrZdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZTIgLSDmlrDlkI3lrZdcbiAgICAgKi9cbiAgICAvLyBGSVhNRSDnvJbovpHplJnkvY3vvJpcbiAgICAvLyBoYW5kc29udGFibGUg5Zyo6YCJ5Lit5p+Q5Y2V5YWD5qC85L2G5rKh6L+b5YWl57yW6L6R5pe277yM5Lya55uR5ZCsIGRvY3VtZW50IOS4iueahCBrZXlkb3duIOS6i+S7tu+8jFxuICAgIC8vIOmAoOaIkOS/ruaUuSBzaGVldCDlkI3ml7bnmoTmlofmnKzmoYbml6Dms5XmraPnoa7lpITnkIbvvIjkvJrovpPlhaXliLDooajmoLzkuK3vvIlcbiAgICAvLyDmmoLml7bkvb/nlKggaW5wdXQg55qEIHNlbGVjdCDku6Pmm78gZm9jdXPvvIzov6vkvb/nlKjmiLflho3mrKHngrnlh7tzaGVldOWQjeaXtuaJjeiDveS/ruaUueOAglxuICAgIHJlbmFtZVNoZWV0KG5hbWUxLCBuYW1lMikge1xuICAgICAgICB2YXIgc2hlZXQgPSB0aGlzLmdldFNoZWV0KG5hbWUxKTtcbiAgICAgICAgaWYgKCFzaGVldCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFNoZWV0RXJyb3IoYOW3peS9nOihqCBcIiR7bmFtZTF9XCIg5LiN5a2Y5ZyoYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hbWUxICE9PSBuYW1lMikge1xuICAgICAgICAgICAgdGhpcy5fdmFsaWRhdGVTaGVldE5hbWUobmFtZTIsIHVwcGVyQ2FzZShuYW1lMSkgPT09IHVwcGVyQ2FzZShuYW1lMikpO1xuICAgICAgICAgICAgc2hlZXQuc2hlZXROYW1lID0gbmFtZTI7XG4gICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVTaGVldCA9PT0gbmFtZTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVNoZWV0ID0gbmFtZTI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmdldFNoZWV0cygpLmRlbGV0ZShuYW1lMSk7XG4gICAgICAgICAgICB0aGlzLmdldFNoZWV0cygpLnNldChuYW1lMiwgc2hlZXQpO1xuICAgICAgICAgICAgdGhpcy4kJHZpZXcudGFiUmVuYW1lKG5hbWUxLCBuYW1lMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiQkdmlldy50YWJSZW5hbWVDYW5jZWwobmFtZTEsIG5hbWUyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOmqjOivgSBzaGVldCDlkI3mmK/lkKblkIjms5VcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gZXhhY3RseVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3ZhbGlkYXRlU2hlZXROYW1lKG5hbWUsIGV4YWN0bHkpIHtcbiAgICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgU2hlZXRFcnJvcign5bel5L2c6KGo55qE5ZCN56ew5LiN6IO95Li656m6Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gIOemgeatouS4gOS6m+eJueauiuWtl+esplxuICAgICAgICBpZiAocmVnRXhwLnRlc3QobmFtZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBTaGVldEVycm9yKGDlt6XkvZzooaggXCIke25hbWV9XCIg5YyF5ZCr6Z2e5rOV5a2X56ymYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNTaGVldEV4aXN0KG5hbWUsIGV4YWN0bHkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgU2hlZXRFcnJvcihg5bel5L2c6KGoIFwiJHtuYW1lfVwiIOW3suWtmOWcqGApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2dldEV4Y2hhbmdlKCkge1xuICAgICAgICB2YXIgc2hlZXRzID0gW107XG4gICAgICAgIGZvciAobGV0IFssc2hlZXRdIG9mIHRoaXMuZ2V0U2hlZXRzKCkudG9NYXAoKSkge1xuICAgICAgICAgICAgc2hlZXQgJiYgc2hlZXRzLnB1c2goc2hlZXQuX2dldEV4Y2hhbmdlKCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhY3RpdmVTaGVldDogdGhpcy5hY3RpdmVTaGVldCxcbiAgICAgICAgICAgIHNoZWV0czogc2hlZXRzXG4gICAgICAgIH1cbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgV29ya2Jvb2s7IiwiaW1wb3J0IHtDb29yZGluYXRlfSBmcm9tICcuLi8uLi91dGlscy9jb21tb24nXG5cbi8qKlxuICog55S15a2Q6KGo5qC85Y+z6ZSu6I+c5Y2V44CCXG4gKi9cbmZ1bmN0aW9uIENvbnRleHRNZW51KHNwcmVhZFNoZWV0KSB7XG4gICAgdGhpcy5zcHJlYWRTaGVldCA9IHNwcmVhZFNoZWV0O1xuICAgIC8qKlxuICAgICAqXG4gICAgICogQHR5cGUge01hcH1cbiAgICAgKi9cbiAgICB0aGlzLm1lbnVJdGVtcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9pbml0KCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbnRleHRNZW51O1xuXG5Db250ZXh0TWVudS5wcm90b3R5cGUucmVnaXN0ZXIgPSBmdW5jdGlvbiAoa2V5LCBjb25maWcsIGhhbmRsZXIpIHtcbiAgICB0aGlzLm1lbnVJdGVtcy5zZXQoa2V5LCB7XG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICBoYW5kbGVyOiBoYW5kbGVyXG4gICAgfSk7XG59O1xuXG4vKipcbiAqIOiOt+WPliBoYW5kc29udGFibGUg6ZyA6KaB55qE6I+c5Y2V6YWN572u6aG5XG4gKi9cbkNvbnRleHRNZW51LnByb3RvdHlwZS5nZXRNZW51SXRlbXM0SG90VGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLl9ob3RUYWJsZUl0ZW1zKSB7XG4gICAgICAgIHRoaXMuX2hvdFRhYmxlSXRlbXMgPSB7fTtcbiAgICAgICAgdGhpcy5tZW51SXRlbXMuZm9yRWFjaCgoe2NvbmZpZ30sIGtleSkgPT4gdGhpcy5faG90VGFibGVJdGVtc1trZXldID0gY29uZmlnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2hvdFRhYmxlSXRlbXM7XG59O1xuXG5cbi8qXG4gIyMjIGhhbmRzb250YWJsZSDoh6rluKblj7PplK7lip/og73vvJojIyNcbiByb3dfYWJvdmVcbiByb3dfYmVsb3dcbiBoc2VwMVxuIGNvbF9sZWZ0XG4gY29sX3JpZ2h0XG4gaHNlcDJcbiByZW1vdmVfcm93XG4gcmVtb3ZlX2NvbFxuIGhzZXAzXG4gdW5kb1xuIHJlZG9cbiBtYWtlX3JlYWRfb25seVxuIGFsaWdubWVudFxuIGJvcmRlcnNcbiAqL1xuQ29udGV4dE1lbnUucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucmVnaXN0ZXIoJ3Jvd19hYm92ZScsIHtcbiAgICAgICAgbmFtZTogJ+S4iuaWueaPkuWFpeS4gOihjCcsXG4gICAgICAgIGRpc2FibGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyDosIPnlKjogIXopoHnoa7kv53mraTlpIQgdGhpcyAg5Li65b2T5YmNIGhvdFRhYmxlIOWunuS+i1xuICAgICAgICAgICAgLy8gVE9ETyDpmZDliLbmnIDlpKfooYzmlbBcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5yZWdpc3Rlcigncm93X2JlbG93Jywge1xuICAgICAgICBuYW1lOiAn5LiL5pa55o+S5YWl5LiA6KGMJ1xuICAgIH0pO1xuXG4gICAgdGhpcy5yZWdpc3RlcignaHNlcDEnLCAnLS0tLS0tLS0tJyk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyKCdjb2xfbGVmdCcsIHtcbiAgICAgICAgbmFtZTogJ+W3puS+p+aPkuWFpeS4gOWIlydcbiAgICB9KTtcblxuICAgIHRoaXMucmVnaXN0ZXIoJ2NvbF9yaWdodCcsIHtcbiAgICAgICAgbmFtZTogJ+WPs+S+p+aPkuWFpeS4gOWIlydcbiAgICB9KTtcblxuICAgIHRoaXMucmVnaXN0ZXIoJ2hzZXAyJywgJy0tLS0tLS0tLScpO1xuXG4gICAgLy8gRklYTUUgaGFuZHNvbnRhYmxlIOiHquW4pueahOWIoOmZpOWKn+iDve+8jOWcqOWtmOWcqOWNleWFg+agvOWQiOW5tuaXtuaciUJVR++8jOaUueaIkOiHquWumuS5iemAu+i+keOAglxuICAgIHRoaXMucmVnaXN0ZXIoJ3JlbW92ZV9yb3cnLCB7XG4gICAgICAgIG5hbWU6ICfliKDpmaTpgInkuK3ooYwnLFxuICAgICAgICBkaXNhYmxlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gVE9ETyDpmZDliLbmnIDlsI/ooYzmlbBcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMucmVnaXN0ZXIoJ3JlbW92ZV9jb2wnLCB7XG4gICAgICAgIG5hbWU6ICfliKDpmaTpgInkuK3liJcnXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyKCdoc2VwMycsICctLS0tLS0tLS0nKTtcblxuXG4gICAgbGV0IG1lcmdlQ29tcGFyZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgIHZhciBtZXJnZWQgPSB0aGlzLmdldFNldHRpbmdzKCkubWVyZ2VDZWxscztcbiAgICAgICAgaWYgKG1lcmdlZCAmJiBtZXJnZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1lcmdlZC5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGxldCB7cm93LCBjb2wsIHJvd3NwYW4sIGNvbHNwYW59ID0gbWVyZ2VkW2ldO1xuICAgICAgICAgICAgICAgIGlmIChDb29yZGluYXRlW3R5cGVdKFxuICAgICAgICAgICAgICAgICAgICAgICAgW3JvdywgY29sLCByb3cgKyByb3dzcGFuIC0gMSwgY29sICsgY29sc3BhbiAtIDFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRTZWxlY3RlZCgpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICB0aGlzLnJlZ2lzdGVyKCdxX21lcmdlX2NlbGxzJywge1xuICAgICAgICBuYW1lOiAn5Y2V5YWD5qC85ZCI5bm2JyxcbiAgICAgICAgZGlzYWJsZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBbcjEsIGMxLCByMiwgYzJdID0gdGhpcy5nZXRTZWxlY3RlZCgpO1xuICAgICAgICAgICAgaWYgKHIxID09PSByMiAmJiBjMSA9PT0gYzIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAhbWVyZ2VDb21wYXJlLmNhbGwodGhpcywgJ2lzRXF1YWwnKTtcbiAgICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChzaGVldCwgc3RhcnQsIGVuZCkge1xuICAgICAgICBzaGVldC5tZXJnZUNlbGxzKFxuICAgICAgICAgICAgc3RhcnQucm93LFxuICAgICAgICAgICAgc3RhcnQuY29sLFxuICAgICAgICAgICAgZW5kLnJvdyAtIHN0YXJ0LnJvdyArIDEsXG4gICAgICAgICAgICBlbmQuY29sIC0gc3RhcnQuY29sICsgMVxuICAgICAgICApO1xuICAgIH0pO1xuXG5cbiAgICB0aGlzLnJlZ2lzdGVyKCdxX2NhbmNlbF9tZXJnZV9jZWxscycsIHtcbiAgICAgICAgbmFtZTogJ+WPlua2iOWNleWFg+agvOWQiOW5ticsXG4gICAgICAgIGRpc2FibGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VDb21wYXJlLmNhbGwodGhpcywgJ2lzU3Vic2V0Jyk7XG4gICAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiAoc2hlZXQsIHN0YXJ0LCBlbmQpIHtcbiAgICAgICAgc2hlZXQudW5NZXJnZUNlbGxzKFxuICAgICAgICAgICAgc3RhcnQucm93LFxuICAgICAgICAgICAgc3RhcnQuY29sLFxuICAgICAgICAgICAgZW5kLnJvdyAtIHN0YXJ0LnJvdyArIDEsXG4gICAgICAgICAgICBlbmQuY29sIC0gc3RhcnQuY29sICsgMVxuICAgICAgICApO1xuICAgIH0pO1xuXG59O1xuXG4iLCJpbXBvcnQge2lubmVySFRNTCwgb3V0ZXJIZWlnaHQsIG91dGVyV2lkdGgsIGVtcHR5LCBpbnNlcnRBZnRlcn0gZnJvbSAnLi4vLi4vdXRpbHMvZG9tSGVscGVyLmpzJztcbmltcG9ydCB7aXNFbXB0eVZhbHVlLCB1cHBlckNhc2V9IGZyb20gJy4uLy4uL3V0aWxzL2NvbW1vbi5qcyc7XG5pbXBvcnQge0Nhc2VJbnNlbnNpdGl2ZU1hcH0gZnJvbSAnLi4vLi4vdXRpbHMvZGF0YVN0cnVjdHVyZS5qcyc7XG5pbXBvcnQge3N0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbn0gZnJvbSAnLi4vLi4vdXRpbHMvZXZlbnRIZWxwZXIuanMnO1xuaW1wb3J0IHtnbG9iYWxTZXR0aW5nc30gZnJvbSAnLi4vLi4vc2V0dGluZ3MuanMnO1xuaW1wb3J0IHtXQVJOU30gZnJvbSAnLi4vLi4vaTE4bic7XG5cbmNvbnN0IENMQVNTX0NVUlJFTlQgPSAnY3VycmVudCc7XG5jb25zdCBDTEFTU19UQUJTID0gJ3NzZC10YWJzJztcbmNvbnN0IENMQVNTX0NPTlRFTlQgPSAnc3NkLXRhYnMtY29udGVudCc7XG5jb25zdCBDTEFTU19TRUNUSU9OID0gJ3NzZC10YWJzLXNlY3Rpb24nO1xuY29uc3QgQ0xBU1NfTkFWID0gJ3NzZC10YWJzLW5hdic7XG5jb25zdCBDTEFTU19VTCA9ICdzc2QtdGFicy11bCc7XG5jb25zdCBDTEFTU19MSSA9ICdzc2QtdGFicy1saSc7XG5jb25zdCBDTEFTU19GWCA9ICdzc2QtdGFicy1meCc7XG5cbmNvbnN0IGFuaW1hdGVkID0gZ2xvYmFsU2V0dGluZ3Muc2hlZXQuYW5pbWF0ZWQ7XG5jb25zdCByZWdFeHAgPSBnbG9iYWxTZXR0aW5ncy5zaGVldC5zaGVldE5hbWU7XG5cbi8qKlxuICogd29ya2Jvb2sg5a+55bqU55qE6KeG5Zu+77yM5a6e6ZmF55qEIERPTSDmnoTmiJDjgIJcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge1dvcmtib29rfSB3b3JrYm9va1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFRhYnMod29ya2Jvb2spIHtcbiAgICB0aGlzLndvcmtib29rID0gd29ya2Jvb2s7XG4gICAgdGhpcy5saUl0ZW1zID0gbmV3IENhc2VJbnNlbnNpdGl2ZU1hcCgpO1xuICAgIHRoaXMuc2VjdGlvbkl0ZW1zID0gbmV3IENhc2VJbnNlbnNpdGl2ZU1hcCgpO1xuICAgIHRoaXMuX2hvdFRhYmxlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLnJvb3RFbGVtZW50ID0gd29ya2Jvb2suc3ByZWFkU2hlZXQuZ2V0Um9vdEVsZW1lbnQoKTtcblxuICAgIHRoaXMuaW5pdERPTSgpO1xuICAgIHRoaXMuaW5pdEJveCgpO1xuICAgIHRoaXMucmVuZGVyKCk7XG59XG5cblRhYnMucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnJvb3RFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuVEFCUyk7XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKi9cblRhYnMucHJvdG90eXBlLmluaXRET00gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5UQUJTID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5DT05URU5UID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5OQVYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCduYXYnKTtcbiAgICB0aGlzLlVMID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcblxuICAgIHRoaXMuVEFCUy5jbGFzc0xpc3QuYWRkKENMQVNTX1RBQlMpO1xuICAgIHRoaXMuVEFCUy5pZCA9IHRoaXMud29ya2Jvb2suZ2V0SWQoKTtcbiAgICB0aGlzLkNPTlRFTlQuY2xhc3NMaXN0LmFkZChDTEFTU19DT05URU5UKTtcbiAgICB0aGlzLk5BVi5jbGFzc0xpc3QuYWRkKENMQVNTX05BVik7XG4gICAgdGhpcy5VTC5jbGFzc0xpc3QuYWRkKENMQVNTX1VMKTtcblxuICAgIHRoaXMuVEFCUy5hcHBlbmRDaGlsZCh0aGlzLkNPTlRFTlQpO1xuICAgIHRoaXMuVEFCUy5hcHBlbmRDaGlsZCh0aGlzLk5BVik7XG4gICAgdGhpcy5OQVYuYXBwZW5kQ2hpbGQodGhpcy5VTCk7XG5cbiAgICAvLyDlop7liqAgc2hlZXQg6aG155qEIGJ1dHRvblxuICAgIHRoaXMuYXBwZW5kQWRkQnV0dG9uKCk7XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKi9cblRhYnMucHJvdG90eXBlLmluaXRCb3ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJvb3RFbCA9IHRoaXMud29ya2Jvb2suc3ByZWFkU2hlZXQuZ2V0Um9vdEVsZW1lbnQoKTtcbiAgICB0aGlzLndpZHRoID0gdGhpcy53b3JrYm9vay53aWR0aCB8fCBvdXRlcldpZHRoKHJvb3RFbCwgZmFsc2UpO1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy53b3JrYm9vay5oZWlnaHQgfHwgb3V0ZXJIZWlnaHQocm9vdEVsLCBmYWxzZSk7XG5cbiAgICB0aGlzLlRBQlMuc3R5bGUud2lkdGggPSB0aGlzLndpZHRoICsgJ3B4JztcbiAgICB0aGlzLlRBQlMuc3R5bGUuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgKyAncHgnO1xufTtcblxuXG4vKipcbiAqIOWinuWKoOS4gOS4qiB0YWIg6aG1XG4gKiBAcGFyYW0ge3N0cmluZ30gc2hlZXROYW1lIC0gc2hlZXQg5ZCN77yMIOWNsyB0YWIg6aG155qE5qCH6aKYXG4gKi9cblRhYnMucHJvdG90eXBlLmFwcGVuZFRhYiA9IGZ1bmN0aW9uIChzaGVldE5hbWUpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcblxuICAgIGxpLmlubmVySFRNTCA9IGA8YSBocmVmPVwiamF2YXNjcmlwdDo7XCI+PHNwYW4+JHtzaGVldE5hbWV9PC9zcGFuPjwvYT5gO1xuICAgIGxpLmNsYXNzTGlzdC5hZGQoQ0xBU1NfTEkpO1xuICAgIGxpLnNldEF0dHJpYnV0ZSgnZGF0YS1zaGVldCcsIHNoZWV0TmFtZSk7XG5cbiAgICB2YXIgYWN0aXZlVGFiID0gdGhpcy5UQUJTLnF1ZXJ5U2VsZWN0b3IoYC4ke0NMQVNTX0NVUlJFTlR9LiR7Q0xBU1NfTEl9YCk7XG4gICAgaWYgKGFjdGl2ZVRhYikge1xuICAgICAgICBpbnNlcnRBZnRlcihhY3RpdmVUYWIsIGxpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLlVMLmFwcGVuZENoaWxkKGxpKTtcbiAgICB9XG4gICAgdGhpcy5saUl0ZW1zLnNldChzaGVldE5hbWUsIGxpKTtcblxuICAgIGxpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBzaGVldE5hbWUgPSB0aGlzLmRhdGFzZXQuc2hlZXQ7XG4gICAgICAgIHZhciBzaGVldCA9IHRoYXQud29ya2Jvb2suZ2V0U2hlZXQoc2hlZXROYW1lKTtcbiAgICAgICAgc2hlZXQuYWN0aXZlKCk7XG4gICAgICAgIHN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbihldmVudCk7XG4gICAgfSk7XG5cbiAgICBsaS5hZGRFdmVudExpc3RlbmVyKCdkYmxjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB0aGF0Ll9vblRhYkRibGNsaWNrLmNhbGwodGhhdCwgdGhpcyk7XG4gICAgICAgIHN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbihldmVudCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmFwcGVuZENvbnRlbnQoc2hlZXROYW1lKTtcbn07XG5cblxuVGFicy5wcm90b3R5cGUuYXBwZW5kQWRkQnV0dG9uID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuXG4gICAgbGkuaW5uZXJIVE1MID0gYDxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIj48c3Bhbj4rPC9zcGFuPjwvYT5gO1xuICAgIGxpLmNsYXNzTGlzdC5hZGQoQ0xBU1NfTEkpO1xuICAgIGxpLmNsYXNzTGlzdC5hZGQoJ2FkZC10YWInKTtcblxuICAgIHRoaXMuVUwuYXBwZW5kQ2hpbGQobGkpO1xuXG4gICAgbGkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgLy8gVE9ETyDlj6/lop7liqDnmoRzaGVldOaVsOS4iumZkOmZkOWItlxuICAgICAgICB2YXIgbmV3U2hlZXQgPSB0aGF0Lndvcmtib29rLmNyZWF0ZVNoZWV0KCk7XG4gICAgICAgIG5ld1NoZWV0LmFjdGl2ZSgpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBsaVxuICogQHByaXZhdGVcbiAqL1xuVGFicy5wcm90b3R5cGUuX29uVGFiRGJsY2xpY2sgPSBmdW5jdGlvbiAobGkpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIHNoZWV0TmFtZSA9IGxpLmRhdGFzZXQuc2hlZXQ7XG4gICAgdmFyIHNwYW4gPSBsaS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3BhbicpWzBdO1xuICAgIHZhciBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG5cbiAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dCcpO1xuICAgIGlucHV0LnZhbHVlID0gc2hlZXROYW1lO1xuICAgIGlucHV0LmNsYXNzTGlzdC5hZGQoJ2VkaXRvcmlhbCcpO1xuICAgIGlucHV0LnN0eWxlLndpZHRoID0gb3V0ZXJXaWR0aChzcGFuKSArIDIwICsgJ3B4JzsgLy8g5ZCN5a2X5aSq55+t5pe25LiN5aW96L6T5YWl77yM5aKe6KGlMjBweFxuXG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNoZWNrID0gdGhhdC5fY2hlY2tUYWJOYW1lKHNoZWV0TmFtZSwgdGhpcy52YWx1ZSk7XG4gICAgICAgIGlmIChjaGVjayA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhhdC53b3JrYm9vay5yZW5hbWVTaGVldChzaGVldE5hbWUsIHRoaXMudmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWxlcnQoY2hlY2spOyAvLyBUT0RPIGFsZXJ0IOWkquS4kVxuICAgICAgICAgICAgdGhhdC50YWJSZW5hbWVDYW5jZWwoc2hlZXROYW1lLCB0aGlzLnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgICAgICAgICAgdGhpcy5ibHVyKCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGVtcHR5KHNwYW4pO1xuICAgIHNwYW4uYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgIGlucHV0LnNlbGVjdCgpO1xufTtcblxuVGFicy5wcm90b3R5cGUuX2NoZWNrVGFiTmFtZSA9IGZ1bmN0aW9uIChuYW1lMSwgbmFtZTIpIHtcbiAgICBpZiAoaXNFbXB0eVZhbHVlKG5hbWUyKSkge1xuICAgICAgICByZXR1cm4gV0FSTlMuUzE7XG4gICAgfVxuICAgIGlmIChyZWdFeHAudGVzdChuYW1lMikpIHtcbiAgICAgICAgcmV0dXJuIFdBUk5TLlMyO1xuICAgIH1cbiAgICAvLyDmlLnmiJDlhbblroPlt7LmnInnmoRzaGVldOWQjVxuICAgIGlmICh1cHBlckNhc2UobmFtZTEpICE9PSB1cHBlckNhc2UobmFtZTIpICYmIHRoaXMud29ya2Jvb2suaXNTaGVldEV4aXN0KG5hbWUyKSkge1xuICAgICAgICByZXR1cm4gV0FSTlMuUzM7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcblxuLy8g5pS55ZCN5pe277yMRE9N5LiK55qE5LiA5Lqb5pON5L2c77yM6L+b5YWl5q2k5pa55rOV5pe25Luj6KGo5bey57uP5YGa5LqG5ZCI5rOV6aqM6K+B44CCXG5UYWJzLnByb3RvdHlwZS50YWJSZW5hbWUgPSBmdW5jdGlvbiAobmFtZTEsIG5hbWUyKSB7XG4gICAgdmFyIGxpID0gdGhpcy5saUl0ZW1zLmdldChuYW1lMSk7XG4gICAgdmFyIHNwYW4gPSBsaS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3BhbicpWzBdO1xuICAgIGlubmVySFRNTChzcGFuLCBuYW1lMik7XG4gICAgbGkuZGF0YXNldC5zaGVldCA9IG5hbWUyO1xuICAgIHRoaXMubGlJdGVtcy5zZXQobmFtZTIsIGxpKTtcbiAgICB2YXIgc2VjdGlvbiA9IHRoaXMuc2VjdGlvbkl0ZW1zLmdldChuYW1lMSk7XG4gICAgc2VjdGlvbi5kYXRhc2V0LnNoZWV0ID0gbmFtZTI7XG4gICAgdGhpcy5zZWN0aW9uSXRlbXMuZGVsZXRlKG5hbWUxKTtcbiAgICB0aGlzLnNlY3Rpb25JdGVtcy5zZXQobmFtZTIsIHNlY3Rpb24pO1xuXG4gICAgdmFyIHNoZWV0Tm93ID0gdGhpcy53b3JrYm9vay5nZXRTaGVldChuYW1lMik7XG4gICAgc2hlZXROb3cuZW1pdCgnYWZ0ZXJSZW5hbWUnLCBzaGVldE5vdywgbmFtZTEsIG5hbWUyKTtcbn07XG5cbi8vIOabtOWQjeWksei0pe+8jOWwhuWQjeWtl+iuvuS4uiBuYW1lMSwgbmFtZTLkuLrlpLHotKXnmoTlkI3lrZdcblRhYnMucHJvdG90eXBlLnRhYlJlbmFtZUNhbmNlbCA9IGZ1bmN0aW9uIChuYW1lMSwgbmFtZTIpIHtcbiAgICB2YXIgbGkgPSB0aGlzLmxpSXRlbXMuZ2V0KG5hbWUxKTtcbiAgICB2YXIgc3BhbiA9IGxpLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzcGFuJylbMF07XG4gICAgaW5uZXJIVE1MKHNwYW4sIG5hbWUxKTtcblxuICAgIHZhciBzaGVldE5vdyA9IHRoaXMud29ya2Jvb2suZ2V0U2hlZXQobmFtZTEpO1xuICAgIHNoZWV0Tm93LmVtaXQoJ2FmdGVyUmVuYW1lQ2FuY2VsJywgc2hlZXROb3csIG5hbWUxLCBuYW1lMik7XG59O1xuXG5cbi8qKlxuICog5aKe5Yqg5qCH562+6aG15a+55bqU55qE5YaF5a65XG4gKiBAcGFyYW0ge3N0cmluZ30gc2hlZXROYW1lXG4gKi9cblRhYnMucHJvdG90eXBlLmFwcGVuZENvbnRlbnQgPSBmdW5jdGlvbiAoc2hlZXROYW1lKSB7XG4gICAgdmFyIHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XG4gICAgdmFyIGZ4ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdmFyIGhvdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgc2VjdGlvbi5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2hlZXQnLCBzaGVldE5hbWUpO1xuICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQoZngpO1xuICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQoaG90KTtcbiAgICBzZWN0aW9uLmNsYXNzTGlzdC5hZGQoQ0xBU1NfU0VDVElPTik7XG4gICAgYW5pbWF0ZWQgJiYgc2VjdGlvbi5jbGFzc0xpc3QuYWRkKCdzc2QtYW5pbWF0ZWQtZmFzdCcpO1xuXG4gICAgdGhpcy5DT05URU5ULmFwcGVuZENoaWxkKHNlY3Rpb24pO1xuICAgIHRoaXMuc2VjdGlvbkl0ZW1zLnNldChzaGVldE5hbWUsIHNlY3Rpb24pO1xuXG4gICAgdGhpcy5hcHBlbmRGeChmeCwgc2hlZXROYW1lKTtcbiAgICB0aGlzLmFwcGVuZFRhYmxlKGhvdCwgc2hlZXROYW1lKTtcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzaGVldE5hbWVcbiAqL1xuVGFicy5wcm90b3R5cGUuaGlkZUNvbnRlbnQgPSBmdW5jdGlvbiAoc2hlZXROYW1lKSB7XG4gICAgdmFyIHNlY3Rpb24gPSB0aGlzLnNlY3Rpb25JdGVtcy5nZXQoc2hlZXROYW1lKTtcbiAgICBzZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG59O1xuXG5cbi8qKlxuICogVE9ETyDlhazlvI/ovpPlhaXmoYZcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBmeFxuICogQHBhcmFtIHtzdHJpbmd9IHNoZWV0TmFtZVxuICovXG5UYWJzLnByb3RvdHlwZS5hcHBlbmRGeCA9IGZ1bmN0aW9uIChmeCwgc2hlZXROYW1lKSB7XG4gICAgZnguY2xhc3NMaXN0LmFkZChDTEFTU19GWCk7XG4gICAgZnguY2xhc3NMaXN0LmFkZChgJHtDTEFTU19GWH0tJHtzaGVldE5hbWV9YCk7XG59O1xuXG4vKipcbiAqIOWBh+a4suafkyBIYW5zb250YWJsZSDnu4Tku7bjgIJcbiAqIGhhbmRzb250YWJsZSDnmoTorr7orqHml6Dms5XlnKhET03kuK3orqHnrpfop4blm77vvIzlv4XpobvmuLLmn5Nyb290RWxlbWVudOS5i+WQjuaJjeiDveeUn+aViOOAglxuICog5a+86Ie05bu26L+f5riy5p+T6Zq+5Lul5a6e546w77yM5pyJ5riy5p+T5oCn6IO96Zeu6aKY5pe25YaN6Kej5Yaz44CCXG4gKiDlj6blpJbvvIzmuLLmn5PliLDlhYjpmpDol4/lkI7mmL7npLrnmoTlhYPntKDkuK3ml7bvvIzkuZ/ml6Dms5XmraPluLjmmL7npLrjgIJcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gaG90XG4gKiBAcGFyYW0gc2hlZXROYW1lXG4gKi9cblRhYnMucHJvdG90eXBlLmFwcGVuZFRhYmxlID0gZnVuY3Rpb24gKGhvdCwgc2hlZXROYW1lKSB7XG4gICAgdGhpcy5faG90VGFibGVzLnNldChzaGVldE5hbWUsIHtcbiAgICAgICAgY29udGFpbmVyOiBob3QsXG4gICAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgICBoZWlnaHQ6ICgpID0+IHRoaXMuaGVpZ2h0IC0gb3V0ZXJIZWlnaHQodGhpcy5OQVYpXG4gICAgfSk7XG59O1xuXG4vKipcbiAqIOa/gOa0u+aMh+WumueahOagh+etvumhtVxuICogQHBhcmFtIHtzdHJpbmd9IHNoZWV0TmFtZSAtIHNoZWV0IOWQjVxuICovXG5UYWJzLnByb3RvdHlwZS5hY3RpdmVUYWIgPSBmdW5jdGlvbiAoc2hlZXROYW1lKSB7XG4gICAgdmFyIGZvcm1lciA9IHRoaXMuVEFCUy5xdWVyeVNlbGVjdG9yKGAuJHtDTEFTU19DVVJSRU5UfS4ke0NMQVNTX0xJfWApO1xuICAgIGZvcm1lciAmJiBmb3JtZXIuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19DVVJSRU5UKTtcbiAgICB2YXIgbGkgPSB0aGlzLmxpSXRlbXMuZ2V0KHNoZWV0TmFtZSk7XG4gICAgbGkuY2xhc3NMaXN0LmFkZChDTEFTU19DVVJSRU5UKTtcbiAgICB0aGlzLmFjdGl2ZUNvbnRlbnQoc2hlZXROYW1lKTtcbn07XG5cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHNoZWV0TmFtZSAtIHNoZWV0IOWQjVxuICovXG5UYWJzLnByb3RvdHlwZS5hY3RpdmVDb250ZW50ID0gZnVuY3Rpb24gKHNoZWV0TmFtZSkge1xuICAgIHZhciBzZWN0aW9uID0gdGhpcy5zZWN0aW9uSXRlbXMuZ2V0KHNoZWV0TmFtZSk7XG4gICAgdmFyIGZvcm1lciA9IHRoaXMuX2Zvcm1lckFjdGl2ZUNvbnRlbnQ7XG4gICAgaWYgKGZvcm1lcikge1xuICAgICAgICBhbmltYXRlZCAmJiBmb3JtZXIuY2xhc3NMaXN0LnJlbW92ZSgnZmFkZUluJyk7XG4gICAgICAgIGZvcm1lci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cbiAgICBzZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIGFuaW1hdGVkICYmIHNlY3Rpb24uY2xhc3NMaXN0LmFkZCgnZmFkZUluJyk7XG5cbiAgICB0aGlzLl9mb3JtZXJBY3RpdmVDb250ZW50ID0gc2VjdGlvbjtcbn07XG5cblxuZXhwb3J0IGRlZmF1bHQgVGFiczsiLCJcblxuZXhwb3J0IGNvbnN0IFdBUk5TID0ge1xuXG4gICAgUzE6IGDlt6XkvZzooajlkI3kuI3og73kuLrnqbrnmb3jgIJgLFxuICAgIFMyOiBg5bel5L2c6KGo5ZCN56ew5YyF5ZCr5peg5pWI5a2X56ymOiA6IFxcIC8gPyAqIFsgXeOAgmAsXG4gICAgUzM6IGDor6XlkI3np7Dlt7Looqvkvb/nlKjvvIzor7flsJ3or5Xlhbbku5blkI3np7DjgIJgXG5cbn07IiwiaW1wb3J0IHtQbHVnaW5FcnJvcn0gZnJvbSAnLi9QbHVnaW5FcnJvcidcblxudmFyIF9wbHVnaW5zID0gbmV3IE1hcCgpO1xuXG4vKipcbiAqIOaPkuS7tuWfuuexu1xuICovXG5jbGFzcyBQbHVnaW4ge1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1NwcmVhZFNoZWV0fSBzcHJlYWRTaGVldFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHNwcmVhZFNoZWV0KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7U3ByZWFkU2hlZXR9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNwcmVhZHNoZWV0ID0gc3ByZWFkU2hlZXQ7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIOaaguaXtuS4jeiAg+iZkeW8gOaUvui/meS4quaWueazle+8jOeUqOaIt+WumuS5ieeahOaPkuS7tuS4jeiDveaJqeWxlSBTcHJlYWRTaGVldCDnmoQgQVBJXG4gICAgX3JlZ2lzdGVyTWV0aG9kKG5hbWUpIHtcbiAgICAgICAgdmFyIHByb3RvID0gdGhpcy5zcHJlYWRzaGVldC5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG4gICAgICAgIHByb3RvW25hbWVdID0gKCkgPT4gdGhpc1tuYW1lXSgpO1xuICAgIH1cblxuICAgIGlzRW5hYmxlKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZW5hYmxlKCkge1xuXG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcblxuICAgIH1cblxufVxuXG5leHBvcnQge1BsdWdpbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlUGx1Z2luKHApIHtcbiAgICBpZiAoIXAuZW5hYmxlKSB7XG4gICAgICAgIHRocm93IG5ldyBQbHVnaW5FcnJvcign5o+S5Lu25b+F6aG75YyF5ZCr5ZCv55So5pa55rOV77yaZW5hYmxlJyk7XG4gICAgfVxuICAgIGlmICghcC5kZXN0cm95KSB7XG4gICAgICAgIHRocm93IG5ldyBQbHVnaW5FcnJvcign5o+S5Lu25b+F6aG75YyF5ZCr6ZSA5q+B5pa55rOV77yaZGVzdHJveScpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyUGx1Z2luKG5hbWUsIHBsdWdpbikge1xuICAgIF9wbHVnaW5zLnNldChuYW1lLCBwbHVnaW4pO1xuICAgIHBsdWdpbi5wcm90b3R5cGUuX19uYW1lX18gPSBuYW1lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGx1Z2luKG5hbWUpIHtcbiAgICB2YXIgcCA9IF9wbHVnaW5zLmdldChuYW1lKTtcbiAgICBpZiAoIXApIHtcbiAgICAgICAgdGhyb3cgbmV3IFBsdWdpbkVycm9yKCfmj5Lku7bkuI3lrZjlnKjvvJonICsgbmFtZSk7XG4gICAgfVxuICAgIHJldHVybiBwO1xufVxuXG4vKipcbiAqIOiOt+WPluaJgOacieaPkuS7tlxuICogQHJldHVybnMge01hcH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbFBsdWdpbnMoKSB7XG4gICAgcmV0dXJuIF9wbHVnaW5zO1xufVxuXG5cbiIsImltcG9ydCB7U3ByZWFkU2hlZXRFcnJvcn0gZnJvbSAnLi4vU3ByZWFkU2hlZXRFcnJvcidcblxuZXhwb3J0IGZ1bmN0aW9uIFBsdWdpbkVycm9yKHZhbHVlKSB7XG4gICAgdGhpcy5uYW1lID0gJ1BsdWdpbkVycm9yJztcbiAgICB0aGlzLm1lc3NhZ2UgPSB2YWx1ZTtcbn1cblBsdWdpbkVycm9yLnByb3RvdHlwZSA9IG5ldyBTcHJlYWRTaGVldEVycm9yKCk7XG5QbHVnaW5FcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQbHVnaW5FcnJvcjsiLCJpbXBvcnQge1BsdWdpbn0gZnJvbSAnLi4vUGx1Z2luJztcbmltcG9ydCB7U3RvcmFnZX0gZnJvbSAnLi9TdG9yYWdlJztcblxuY2xhc3MgUGVyc2lzdGVudCBleHRlbmRzIFBsdWdpbiB7XG5cbiAgICBjb25zdHJ1Y3Rvcihzc2QpIHtcbiAgICAgICAgc3VwZXIoc3NkKTtcblxuICAgICAgICB2YXIgc2V0dGluZ3MgPSB0aGlzLnNwcmVhZHNoZWV0LnNldHRpbmdzO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5wZXJzaXN0ZW50ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAvLyBwZXJzaXN0ZW50IOS4uiBgdHJ1ZWAg5pe277yM5L2/55So6buY6K6k5pa55qGIXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOeUteWtkOihqOagvOacrOWcsOaMgeS5heWMluaXtuS9v+eUqOeahCBrZXlcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5wZXJzaXN0ZW50S2V5ID0gc3NkLmdldElkKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUT0RPIHBlcnNpc3RlbnQg5Li65a+56LGh5pe277yM5o+Q5L6bIGxvY2FsU3RvcmFnZeOAgXNlc3Npb24g562J5pa55qGI5Y+K6LaF5pe25pe26Ze0562J55u45YWz6YWN572uXG4gICAgICAgICAgICB0aGlzLnBlcnNpc3RlbnRLZXkgPSBzZXR0aW5ncy5wZXJzaXN0ZW50LmtleTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3ByZWFkc2hlZXQuc2V0dGluZ3MgPSBTdG9yYWdlLmxvYWQodGhpcy5wZXJzaXN0ZW50S2V5KSB8fCBzZXR0aW5ncztcblxuICAgICAgICB0aGlzLl9yZWdpc3Rlck1ldGhvZCgnc2F2ZVN0YXRlJyk7XG4gICAgfVxuXG4gICAgaXNFbmFibGUoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuc3ByZWFkc2hlZXQuZ2V0U2V0dGluZ3MoKS5wZXJzaXN0ZW50O1xuICAgIH1cblxuICAgIGVuYWJsZSgpIHtcbiAgICAgICAgc3VwZXIuZW5hYmxlKCk7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgc3VwZXIuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIHNhdmVTdGF0ZSgpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnNwcmVhZHNoZWV0LmdldEV4Y2hhbmdlRGF0YSgpO1xuICAgICAgICBTdG9yYWdlLnNhdmUodGhpcy5wZXJzaXN0ZW50S2V5LCBkYXRhKTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGVyc2lzdGVudDsiLCIvKipcbiAqIOWtmOWCqOaWueahiFxuICovXG5jbGFzcyBTdG9yYWdlIHtcblxuICAgIHN0YXRpYyBzYXZlKGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHZhbHVlID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShTdG9yYWdlLlBSRUZJWCArIGtleSwgdmFsdWUpO1xuICAgIH1cblxuICAgIHN0YXRpYyBsb2FkKGtleSkge1xuICAgICAgICB2YXIgdmFsID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFN0b3JhZ2UuUFJFRklYICsga2V5KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbCk7XG4gICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyByZW1vdmUoa2V5KSB7XG4gICAgICAgIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlW1N0b3JhZ2UuUFJFRklYICsga2V5XSkge1xuICAgICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFN0b3JhZ2UuUFJFRklYICsga2V5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBjbGVhcigpIHtcbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5jbGVhcigpO1xuICAgIH1cblxufVxuXG5TdG9yYWdlLlBSRUZJWCA9ICckJGJyaWNrIXN0b3JhZ2UtJztcblxuZXhwb3J0IHtTdG9yYWdlfTsiLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwb2x5ZmlsbChfd2luZG93KSB7XG5cbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gTnVtYmVyXG5cbiAgICBpZiAoIV93aW5kb3cuTnVtYmVyLmlzTmFOKSB7XG4gICAgICAgIC8vbm9pbnNwZWN0aW9uIEpTUHJpbWl0aXZlVHlwZVdyYXBwZXJVc2FnZVxuICAgICAgICBfd2luZG93Lk51bWJlci5pc05hTiA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICByZXR1cm4geCAhPT0geDtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5cblxuXG5cblxuIiwiLyoqXG4gKiDlhajlsYDphY3nva7jgIJcbiAqL1xudmFyIGdsb2JhbFNldHRpbmdzID0ge1xuICAgIGlkUHJlZml4OiAnYnJpY2stc3NkLScsXG4gICAgaWRTdWZmaXg0V29ya2Jvb2s6ICctd29ya2Jvb2snLFxuXG4gICAgc2hlZXQ6IHtcblxuICAgICAgICAvKipcbiAgICAgICAgICog6Ieq5Yqo55Sf5oiQ5bel5L2c6KGo5ZCN56ew5pe255qE5YmN57yAKOW3peS9nOihqDEsIOW3peS9nOihqDIuLi4pXG4gICAgICAgICAqL1xuICAgICAgICBhdXRvUHJlZml4OiAn5bel5L2c6KGoJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogc2hlZXQg5ZCN56ew5Lit55qE6Z2e5rOV5a2X56ym44CC5b6u6L2v5rKh5pyJ55u45YWz5paH5qGj77yM5Lul5LiL5pivIEFwYWNoZSBQT0kg55qE6K+05piO77yaXG4gICAgICAgICAqXG4gICAgICAgICAqIE5vdGUgdGhhdCBzaGVldCBuYW1lIGluIEV4Y2VsIG11c3Qgbm90IGV4Y2VlZCAzMSBjaGFyYWN0ZXJzXG4gICAgICAgICAqIGFuZCBtdXN0IG5vdCBjb250YWluIGFueSBvZiB0aGUgYW55IG9mIHRoZSBmb2xsb3dpbmcgY2hhcmFjdGVyczpcbiAgICAgICAgICogICAgLSAweDAwMDBcbiAgICAgICAgICogICAgLSAweDAwMDNcbiAgICAgICAgICogICAgLSBjb2xvbiAoOilcbiAgICAgICAgICogICAgLSBiYWNrc2xhc2ggKFxcKVxuICAgICAgICAgKiAgICAtIGFzdGVyaXNrICgqKVxuICAgICAgICAgKiAgICAtIHF1ZXN0aW9uIG1hcmsgKD8pXG4gICAgICAgICAqICAgIC0gZm9yd2FyZCBzbGFzaCAoLylcbiAgICAgICAgICogICAgLSBvcGVuaW5nIHNxdWFyZSBicmFja2V0IChbKVxuICAgICAgICAgKiAgICAtIGNsb3Npbmcgc3F1YXJlIGJyYWNrZXQgKF0pXG4gICAgICAgICAqXG4gICAgICAgICAqL1xuICAgICAgICBzaGVldE5hbWU6IC9bXFxcXC9cXD9cXCo6XFxbXFxdJ1wiXS8sXG5cbiAgICAgICAgYW5pbWF0ZWQ6IGZhbHNlXG4gICAgfVxuXG59O1xuXG5cbi8qKlxuICog6buY6K6k6YWN572uXG4gKi9cbnZhciBkZWZhdWx0U2V0dGluZ3MgPSB7XG5cbiAgICB3b3JrYm9vazoge1xuICAgICAgICBhY3RpdmVTaGVldDogJ+W3peS9nOihqDEnLFxuICAgICAgICBzaGVldHM6IFt7XG4gICAgICAgICAgICBuYW1lOiAn5bel5L2c6KGoMSdcbiAgICAgICAgfV1cbiAgICB9LFxuXG4gICAgcGVyc2lzdGVudDogdHJ1ZVxuXG59O1xuXG5leHBvcnQge2dsb2JhbFNldHRpbmdzLCBkZWZhdWx0U2V0dGluZ3N9OyIsIi8qKlxuICog5LqL5Lu25Y+R5bCE5ZmoXG4gKlxuICogUFM6IG5vZGVqcyDnmoTns7vnu5/nsbvlupMgRW1pdHRlciDov4flpKfvvIzkuI3pgILlkIjlnKjmtY/op4jlmajnjq/looPkvb/nlKjjgILmlYXlvJXlhaXkuIDkuKrnroDmmJPlrp7njrDjgIJcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBFbWl0dGVyKCkge1xuICAgIC8vIOS/neaMgeatpOWHveaVsOS4uuepuu+8jOS7peS+v+S6jue7p+aJv1xufVxuXG5FbWl0dGVyLnByb3RvdHlwZSA9IHtcblxuICAgIC8qKlxuICAgICAqIOiuoumYheS6i+S7tlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0g5LqL5Lu25ZCNXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSDkuovku7blm57osIPlh73mlbBcbiAgICAgKiBAcGFyYW0gW2N0eF0gLSDorr7nva7osIPnlKggY2FsbGJhY2sg5pe255qE5LiK5LiL5paHXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9XG4gICAgICovXG4gICAgb246IGZ1bmN0aW9uIChuYW1lLCBjYWxsYmFjaywgY3R4KSB7XG4gICAgICAgIHZhciBlID0gdGhpcy5lIHx8ICh0aGlzLmUgPSB7fSk7XG5cbiAgICAgICAgKGVbbmFtZV0gfHwgKGVbbmFtZV0gPSBbXSkpLnB1c2goe1xuICAgICAgICAgICAgZm46IGNhbGxiYWNrLFxuICAgICAgICAgICAgY3R4OiBjdHhcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOiuoumYheS4gOasoeaAp+S6i+S7tlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0g5LqL5Lu25ZCNXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSDkuovku7blm57osIPlh73mlbBcbiAgICAgKiBAcGFyYW0gY3R4IC0g6K6+572u6LCD55SoIGNhbGxiYWNrIOaXtueahOS4iuS4i+aWh1xuICAgICAqIEByZXR1cm5zIHsqfEVtaXR0ZXJ9XG4gICAgICovXG4gICAgb25jZTogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrLCBjdHgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIGZ1bmN0aW9uIGxpc3RlbmVyKCkge1xuICAgICAgICAgICAgc2VsZi5vZmYobmFtZSwgbGlzdGVuZXIpO1xuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGlzdGVuZXIuXyA9IGNhbGxiYWNrO1xuICAgICAgICByZXR1cm4gdGhpcy5vbihuYW1lLCBsaXN0ZW5lciwgY3R4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog5Y+R5bCE5oyH5a6a5LqL5Lu2XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSDkuovku7blkI1cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn1cbiAgICAgKi9cbiAgICBlbWl0OiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICB2YXIgZGF0YSA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgdmFyIGV2dEFyciA9ICgodGhpcy5lIHx8ICh0aGlzLmUgPSB7fSkpW25hbWVdIHx8IFtdKS5zbGljZSgpO1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHZhciBsZW4gPSBldnRBcnIubGVuZ3RoO1xuXG4gICAgICAgIGZvciAoaTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBldnRBcnJbaV0uZm4uYXBwbHkoZXZ0QXJyW2ldLmN0eCwgZGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog5rOo6ZSA5LqL5Lu2XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSDkuovku7blkI1cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0g57uR5a6a5LqL5Lu25pe255qE5Zue6LCD5Ye95pWw77yM5aaC5p6c5LiN5oyH5a6a5YiZ5rOo6ZSA5omA5pyJIGBuYW1lYCDkuovku7ZcbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn1cbiAgICAgKi9cbiAgICBvZmY6IGZ1bmN0aW9uIChuYW1lLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZSA9IHRoaXMuZSB8fCAodGhpcy5lID0ge30pO1xuICAgICAgICB2YXIgZXZ0cyA9IGVbbmFtZV07XG4gICAgICAgIHZhciBsaXZlRXZlbnRzID0gW107XG5cbiAgICAgICAgaWYgKGV2dHMgJiYgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBldnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2dHNbaV0uZm4gIT09IGNhbGxiYWNrICYmIGV2dHNbaV0uZm4uXyAhPT0gY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgbGl2ZUV2ZW50cy5wdXNoKGV2dHNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOmYsuatouWGheWtmOa6ouWHulxuICAgICAgICAobGl2ZUV2ZW50cy5sZW5ndGgpXG4gICAgICAgICAgICA/IGVbbmFtZV0gPSBsaXZlRXZlbnRzXG4gICAgICAgICAgICA6IGRlbGV0ZSBlW25hbWVdO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDojrflj5blhajlsYDllK/kuIDkuovku7blj5HlsITlmahcbiAgICAgKi9cbiAgICBnZXRHbG9iYWxFbWl0dGVyOiAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgICAgcmV0dXJuICgpID0+IGluc3RhbmNlO1xuICAgIH0oKSlcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEVtaXR0ZXI7XG5cbi8qKlxuICog5YWo5bGA5ZSv5LiA5LqL5Lu25Y+R5bCE5ZmoXG4gKi9cbmV4cG9ydCBjb25zdCBHbG9iYWxFbWl0dGVyID0gRW1pdHRlci5wcm90b3R5cGUuZ2V0R2xvYmFsRW1pdHRlcigpOyIsIlxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIG9iamVjdFxuXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKHRhcmdldCwgZXh0ZW5zaW9uKSB7XG4gICAgb2JqZWN0RWFjaChleHRlbnNpb24sICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgIHRhcmdldFtrZXldID0gdmFsdWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRhcmdldDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdEVhY2gob2JqZWN0LCBpdGVyYXRlZSkge1xuICAgIGZvciAobGV0IGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgaWYgKCFvYmplY3QuaGFzT3duUHJvcGVydHkgfHwgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eSAmJiBvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSkpIHtcbiAgICAgICAgICAgIGlmIChpdGVyYXRlZShvYmplY3Rba2V5XSwga2V5LCBvYmplY3QpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZnVuY3Rpb25cblxudmFyIF9lbXB0eUZuID0gZnVuY3Rpb24gKCkge1xufTtcblxuLyoqXG4gKiDojrflj5bnqbrlh73mlbDjgIJcbiAqIEBwYXJhbSBuZXdPbmUg6buY6K6kIGBmYWxzZWDvvIzlvZPkuLogYHRydWVgIOaXtuWwhui/lOWbnuS4gOS4quaWsOeahOepuuWHveaVsOOAglxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5leHBvcnQgZnVuY3Rpb24gZW1wdHlGdW5jdGlvbihuZXdPbmUgPSBmYWxzZSkge1xuICAgIGlmIChuZXdPbmUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIF9lbXB0eUZuO1xufVxuXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gc3RyaW5nXG5cblxuZXhwb3J0IGZ1bmN0aW9uIHVwcGVyQ2FzZShzdHIpIHtcbiAgICByZXR1cm4gc3RyLnRvTG9jYWxlVXBwZXJDYXNlKCk7XG59XG5cblxuLyoqXG4gKiDnlJ/miJDkuIDkuKrplb/luqbkuLogMTYg55qE6ZqP5py65a2X56ym5LiyXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbVN0cmluZygpIHtcbiAgICBmdW5jdGlvbiBzNCgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDApXG4gICAgICAgICAgICAudG9TdHJpbmcoMTYpXG4gICAgICAgICAgICAuc3Vic3RyaW5nKDEpO1xuICAgIH1cbiAgICByZXR1cm4gczQoKSArIHM0KCkgKyBzNCgpICsgczQoKTtcbn1cblxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIG1peGVkXG5cbi8qKlxuICog5Yik5pat5piv5ZCm5Li6YOepumDlgLzjgIJcbiAqIFBT77ya5q2k5pa55rOV55qE5Yik5pat6YC76L6R5L2c5Li65Y2V5YWD5qC85piv5ZCm5Li656m655qE5L6d5o2u44CCXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eVZhbHVlKHZhbHVlKSB7XG4gICAgcmV0dXJuICEhKHZhbHVlID09PSAnJyB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKTtcbn1cblxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGNvb3JkaW5hdGVcblxuXG52YXIgY19pc0VxdWFsID0gZnVuY3Rpb24gKHIxLCByMikge1xuICAgIHJldHVybiByMVswXSA9PT0gcjJbMF0gJiYgcjFbMV0gPT09IHIyWzFdICYmIHIxWzJdID09PSByMlsyXSAmJiByMVszXSA9PT0gcjJbM107XG59O1xuXG52YXIgY19pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbiAocjEsIHIyKSB7XG4gICAgdmFyIHgxID0gTWF0aC5tYXgocjFbMF0sIHIyWzBdKTtcbiAgICB2YXIgeTEgPSBNYXRoLm1heChyMVsxXSwgcjJbMV0pO1xuICAgIHZhciB4MiA9IE1hdGgubWluKHIxWzJdLCByMlsyXSk7XG4gICAgdmFyIHkyID0gTWF0aC5taW4ocjFbM10sIHIyWzNdKTtcblxuICAgIGlmICh4MSA8PSB4MiAmJiB5MSA8PSB5Mikge1xuICAgICAgICByZXR1cm4gW3gxLCB5MSwgeDIsIHkyXTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxudmFyIGNfc2V0ID0gZnVuY3Rpb24gKHQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHIxLCByMikge1xuICAgICAgICB2YXIgaW5zID0gY19pbnRlcnNlY3Rpb24ocjEsIHIyKTtcbiAgICAgICAgaWYgKGlucykge1xuICAgICAgICAgICAgcmV0dXJuIGNfaXNFcXVhbChpbnMsIHQgPT09ICdzdWInID8gcjEgOiByMik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG59O1xuXG5leHBvcnQgdmFyIENvb3JkaW5hdGUgPSB7XG5cbiAgICAvKipcbiAgICAgKiDliKTmlq3lnZDmoIfojIPlm7QgcjEg5piv5ZCm5LiOIHIyIOebuOetieOAglxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHIxXG4gICAgICogQHBhcmFtIHtpbnR9IHIxWzBdIC0g5Z2Q5qCH6IyD5Zu0IHIxIOeahOi1t+Wni+ihjOWdkOagh1xuICAgICAqIEBwYXJhbSB7aW50fSByMVsxXSAtIOWdkOagh+iMg+WbtCByMSDnmoTotbflp4vliJflnZDmoIdcbiAgICAgKiBAcGFyYW0ge2ludH0gcjFbMl0gLSDlnZDmoIfojIPlm7QgcjEg55qE57uI5q2i6KGM5Z2Q5qCHXG4gICAgICogQHBhcmFtIHtpbnR9IHIxWzNdIC0g5Z2Q5qCH6IyD5Zu0IHIxIOeahOe7iOatouWIl+WdkOagh1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IHIyXG4gICAgICogQHBhcmFtIHtpbnR9IHIyWzBdIC0g5Z2Q5qCH6IyD5Zu0IHIyIOeahOi1t+Wni+ihjOWdkOagh1xuICAgICAqIEBwYXJhbSB7aW50fSByMlsxXSAtIOWdkOagh+iMg+WbtCByMiDnmoTotbflp4vliJflnZDmoIdcbiAgICAgKiBAcGFyYW0ge2ludH0gcjJbMl0gLSDlnZDmoIfojIPlm7QgcjIg55qE57uI5q2i6KGM5Z2Q5qCHXG4gICAgICogQHBhcmFtIHtpbnR9IHIyWzNdIC0g5Z2Q5qCH6IyD5Zu0IHIyIOeahOe7iOatouWIl+WdkOagh1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzRXF1YWw6IGNfaXNFcXVhbCxcblxuICAgIC8qKlxuICAgICAqIOWIpOaWreWdkOagh+iMg+WbtCByMSDmmK/lkKbkuI4gcjIg5a2Y5Zyo5Lqk6ZuG44CCXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaW50ZXJzZWN0aW9uOiBjX2ludGVyc2VjdGlvbixcblxuICAgIC8qKlxuICAgICAqIOWIpOaWreWdkOagh+iMg+WbtCByMSDmmK/lkKbmmK8gcjIg55qE5a2Q6ZuG44CCXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTdWJzZXQ6IGNfc2V0KCdzdWInKSxcblxuICAgIC8qKlxuICAgICAqIOWIpOaWreWdkOagh+iMg+WbtCByMSDmmK/lkKbmmK8gcjIg55qE6LaF6ZuG44CCXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTdXBlcnNldDogY19zZXQoJ3N1cCcpXG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIiwiaW1wb3J0IHt1cHBlckNhc2V9IGZyb20gJy4vY29tbW9uLmpzJ1xuXG4vKipcbiAqIOWkp+Wwj+WGmeS4jeaVj+aEn+eahCBNYXBcbiAqL1xuY2xhc3MgQ2FzZUluc2Vuc2l0aXZlTWFwIHtcblxuICAgIGNvbnN0cnVjdG9yKGl0ZXJhYmxlKSB7XG4gICAgICAgIHRoaXMuX21hcCA9IG5ldyBNYXAoaXRlcmFibGUpO1xuICAgICAgICB0aGlzLl9rZXlzID0ge307XG4gICAgfVxuXG4gICAgZ2V0KGtleSkge1xuICAgICAgICB2YXIgYWNLZXkgPSB0aGlzLl9rZXlzW3VwcGVyQ2FzZShrZXkpXTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hcC5nZXQoYWNLZXkpO1xuICAgIH1cblxuICAgIHNldChrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2tleXNbdXBwZXJDYXNlKGtleSldID0ga2V5O1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFwLnNldChrZXksIHZhbHVlKTtcbiAgICB9XG5cbiAgICBoYXMoa2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9rZXlzW3VwcGVyQ2FzZShrZXkpXTtcbiAgICB9XG5cbiAgICBoYXNFeGFjdChrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hcC5oYXMoa2V5KTtcbiAgICB9XG5cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5fa2V5cyA9IHt9O1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFwLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgZGVsZXRlKGtleSkge1xuICAgICAgICB2YXIgYWNLZXkgPSB0aGlzLl9rZXlzW3VwcGVyQ2FzZShrZXkpXTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2tleXNbdXBwZXJDYXNlKGtleSldO1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFwLmRlbGV0ZShhY0tleSk7XG4gICAgfVxuXG4gICAgZW50cmllcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hcC5lbnRyaWVzKCk7XG4gICAgfVxuXG4gICAgZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tYXAuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnKTtcbiAgICB9XG5cbiAgICBrZXlzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFwLmtleXMoKTtcbiAgICB9XG5cbiAgICB2YWx1ZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tYXAudmFsdWVzKCk7XG4gICAgfVxuXG4gICAgdG9NYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tYXA7XG4gICAgfVxuXG59XG5cbi8qKlxuICogU3RhY2tcbiAqL1xuY2xhc3MgU3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKGluaXRpYWwgPSBbXSkge1xuICAgICAgICB0aGlzLml0ZW1zID0gaW5pdGlhbDtcbiAgICB9XG5cbiAgICBwdXNoKC4uLml0ZW1zKSB7XG4gICAgICAgIHRoaXMuaXRlbXMucHVzaCguLi5pdGVtcyk7XG4gICAgfVxuXG4gICAgcG9wKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pdGVtcy5wb3AoKTtcbiAgICB9XG5cbiAgICBwZWVrKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0VtcHR5KCkgPyB2b2lkIDAgOiB0aGlzLml0ZW1zW3RoaXMuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgfVxuXG4gICAgaXNFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLnNpemUoKTtcbiAgICB9XG5cbiAgICBzaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pdGVtcy5sZW5ndGg7XG4gICAgfVxuXG59XG5cbmV4cG9ydCB7Q2FzZUluc2Vuc2l0aXZlTWFwLCBTdGFja307XG5cbiIsInZhciB0ZXh0Q29udGV4dFN1cHBvcnQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgndGVzdCcpLnRleHRDb250ZW50ID8gdHJ1ZSA6IGZhbHNlO1xudmFyIGNsYXNzTGlzdFN1cHBvcnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0ID8gdHJ1ZSA6IGZhbHNlO1xuXG52YXIgUkVHX0hUTUxfQ0hBUkFDVEVSUyA9IC8oPCguKik+fCYoLiopOykvO1xuXG4vKipcbiAqIOiDveWQjOaXtuWFvOWuueaWh+acrOiKgueCueeahCBpbm5lckhUTUwg5pa55rOV44CCXG4gKlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbm5lckhUTUwoZWxlbWVudCwgY29udGVudCkge1xuICAgIGlmIChSRUdfSFRNTF9DSEFSQUNURVJTLnRlc3QoY29udGVudCkpIHtcbiAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSBjb250ZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGVsZW1lbnQuZmlyc3RDaGlsZDtcbiAgICAgICAgaWYgKGNoaWxkICYmIGNoaWxkLm5vZGVUeXBlID09PSAzICYmIGNoaWxkLm5leHRTaWJsaW5nID09PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAodGV4dENvbnRleHRTdXBwb3J0KSB7XG4gICAgICAgICAgICAgICAgY2hpbGQudGV4dENvbnRlbnQgPSBjb250ZW50O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjaGlsZC5kYXRhID0gY29udGVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVtcHR5KGVsZW1lbnQpO1xuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjb250ZW50KSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICog5Zyo5oyH5a6a6IqC54K55ZCO5o+S5YWl6IqC54K5XG4gKiBAcGFyYW0gZWxlbWVudFxuICogQHBhcmFtIGNvbnRlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc2VydEFmdGVyKGVsZW1lbnQsIGNvbnRlbnQpIHtcbiAgICBpZiAoUkVHX0hUTUxfQ0hBUkFDVEVSUy50ZXN0KGNvbnRlbnQpKSB7XG4gICAgICAgIGVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmVuZCcsIGNvbnRlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChjb250ZW50Lm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5uZXh0U2libGluZykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoY29udGVudCwgZWxlbWVudC5uZXh0U2libGluZyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChjb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRPRE9cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiDmuIXnqbrmjIflrprlhYPntKDnmoTmiYDmnInlrZDoioLngrnjgIJcbiAqXG4gKiBAcGFyYW0gZWxlbWVudFxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbXB0eShlbGVtZW50KSB7XG4gICAgdmFyIGNoaWxkO1xuICAgIHdoaWxlIChjaGlsZCA9IGVsZW1lbnQubGFzdENoaWxkKSB7IC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgICBlbGVtZW50LnJlbW92ZUNoaWxkKGNoaWxkKTtcbiAgICB9XG59XG5cbi8qKlxuICog6L+U5Zue5oyH5a6a5YWD57Sg55qE5aSW6auY5bqm77yI5YyF5ousIHBhZGRpbmfjgIFib3JkZXIg5Y+K5Y+v6YCJ55qEIG1hcmdpbiDlgLzvvInjgIJcbiAqXG4gKiBAcGFyYW0gZWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gd2l0aE1hcmdpbiAtIOmrmOW6puS4reaYr+WQpuWMheaLrCBtYXJnaW4g5YC8XG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5leHBvcnQgZnVuY3Rpb24gb3V0ZXJIZWlnaHQoZWwsIHdpdGhNYXJnaW4gPSB0cnVlKSB7XG4gICAgdmFyIGhlaWdodCA9IGVsLm9mZnNldEhlaWdodDtcbiAgICB2YXIgc3R5bGU7XG5cbiAgICBpZiAod2l0aE1hcmdpbiA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGhlaWdodDtcbiAgICB9XG4gICAgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKTtcbiAgICBoZWlnaHQgKz0gcGFyc2VJbnQoc3R5bGUubWFyZ2luVG9wKSArIHBhcnNlSW50KHN0eWxlLm1hcmdpbkJvdHRvbSk7XG4gICAgcmV0dXJuIGhlaWdodDtcbn1cblxuXG4vKipcbiAqIOi/lOWbnuaMh+WumuWFg+e0oOeahOWkluWuveW6pu+8iOWMheaLrCBwYWRkaW5n44CBYm9yZGVyIOWPiuWPr+mAieeahCBtYXJnaW4g5YC877yJ44CCXG4gKlxuICogQHBhcmFtIGVsXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHdpdGhNYXJnaW4gLSDlrr3luqbkuK3mmK/lkKbljIXmi6wgbWFyZ2luIOWAvFxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG91dGVyV2lkdGgoZWwsIHdpdGhNYXJnaW4gPSB0cnVlKSB7XG4gICAgdmFyIHdpZHRoID0gZWwub2Zmc2V0V2lkdGg7XG4gICAgdmFyIHN0eWxlO1xuXG4gICAgaWYgKHdpdGhNYXJnaW4gPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiB3aWR0aDtcbiAgICB9XG4gICAgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKTtcbiAgICB3aWR0aCArPSBwYXJzZUludChzdHlsZS5tYXJnaW5MZWZ0KSArIHBhcnNlSW50KHN0eWxlLm1hcmdpblJpZ2h0KTtcbiAgICByZXR1cm4gd2lkdGg7XG59XG5cbiIsIi8qKlxuICog6Zi75q2i5YW25a6D55uR5ZCs6KKr6LCD55So44CCXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQuaXNJbW1lZGlhdGVQcm9wYWdhdGlvbkVuYWJsZWQgPSBmYWxzZTtcbiAgICBldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xufVxuXG4vKipcbiAqIOmYu+atouS6i+S7tuWGkuazoeOAglxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0b3BQcm9wYWdhdGlvbihldmVudCkge1xuICAgIGlmICh0eXBlb2YgZXZlbnQuc3RvcFByb3BhZ2F0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XG4gICAgfVxufSJdfQ==
