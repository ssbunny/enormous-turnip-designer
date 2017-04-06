import Frame from './designer/Frame';
import Workbook from './designer/Workbook';
import {extend, emptyFunction, randomString} from './utils/common';
import {getAllPlugins, validatePlugin} from './plugins/Plugin';
import Emitter from './utils/Emitter';

var AUTO_ID = 1;

class SpreadSheet extends Emitter {

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
    constructor(rootElement, userSettings, displayMode = false) {
        super();

        this.rootElement = rootElement;
        this.getUserSettings(userSettings);

        this.settings = {};
        extend(this.settings, SpreadSheet.defaultSettings);
        extend(this.settings, this.userSettings);

        this.id = this.settings.id || this.getId();
        this.displayMode = displayMode;

        this._initPlugin();
        this.frame = new Frame(this, this.settings.frame);
        this.workbook = new Workbook(this, this.settings.workbook);
        this._enablePlugin();
    }

    getId() {
        // 不指定 id 时，尽量生成不可重复的 id（使用当前 iframe 自增变量配合随机字符串的方式）
        return this.id || SpreadSheet.globalSettings.idPrefix + (AUTO_ID++) + '-' + randomString();
    }

    getRootElement() {
        return this.rootElement;
    }

    getDisplayMode() {
        return this.displayMode;
    }

    /**
     * 获取用户传入的初始配置。
     * @param {string=} s - 表示用户配置的 JSON 字符串
     * @returns {Object}
     */
    getUserSettings(s) {
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
    getSettings() {
        return this.settings;
    }

    /**
     * 获取可交换的中间数据，用于数据提交、解析转换等。
     * @param {boolean} [oragin=false] - 为 `true` 时获取原始 JavaScript 对象
     * @returns
     */
    getExchangeData(oragin = false) {
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
    getWorkbookInstance() {
        return this.workbook;
    }

    /**
     * 获取当前 SpreadSheet 对应的 Frame 实例。
     * @returns {Frame}
     */
    getFrameInstance() {
        return this.frame;
    }


    _initPlugin() {
        this.plugins = new Map();
        getAllPlugins().forEach(P => {
            var p = new P(this);
            validatePlugin(p);
            this.plugins.set(p.__name__, p);
        });
    }

    _enablePlugin() {
        this.plugins.forEach(p => {
            if (p.isEnable()) {
                p.enable();
            }
        });
    }
}

export default SpreadSheet;