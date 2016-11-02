import Frame from './designer/Frame.js';
import Workbook from './designer/Workbook.js';
import {extend, emptyFunction} from './utils/common.js';

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

    var settings = this.settings = {};
    extend(settings, SpreadSheet.defaultSettings);
    extend(settings, this.userSettings);

    this.id = settings.id || this.getId();
    this.frame = new Frame(this);
    this.workbook = new Workbook(this, settings.workbook);
}

export default SpreadSheet;


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
    return this.id || SpreadSheet.globalSettings.idPrefix + AUTO_ID++;
};


/**
 * 获取可交换的中间数据，用于数据提交、解析转换等。
 * @param {boolean} [oragin=false] - 为 `true` 时 获取原始 JavaScript 对象
 * @returns
 */
SpreadSheet.prototype.getExchange = function (oragin = false) {
    var w = this.workbook._getExchange();
    var f = this.frame._getExchange(); // TODO frame
    return oragin ? {workbook: w} : JSON.stringify({workbook: w});
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