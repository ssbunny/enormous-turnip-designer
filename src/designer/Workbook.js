import Tabs from  './views/Tabs'
import Sheet from './Sheet'
import {SheetError} from './SheetError'
import {CaseInsensitiveMap} from '../utils/dataStructure'
import {upperCase} from '../utils/common'
import {globalSettings} from '../settings'


const regExp = globalSettings.sheet.sheetName;

/**
 * 工作簿。一个 Workbook 包含一个或多个 Sheet .
 */
class Workbook {

    /**
     * Workbook 构造器
     * @param {SpreadSheet} instance
     * @param {object} config
     */
    constructor(instance, config) {
        /**
         * @type {SpreadSheet}
         */
        this.spreadSheet = instance;
        /**
         * @type {CaseInsensitiveMap}
         */
        this.sheets = new CaseInsensitiveMap();
        this.settings = config;

        this._initSettings(config);
        this.$$view = new Tabs(this);

        config.sheets.forEach(v => this.createSheet(v));

        // 根据初始化数据激活 sheet 页
        var toActive = this.getSheet(this.activeSheet);
        if (!toActive) {
            throw new SheetError(`指定的 activeSheet 不存在: ${this.activeSheet}`);
        }
        toActive.active();
    }

    /**
     *
     * @param settings
     * @private
     */
    _initSettings(settings) {
        var keys = Object.keys(settings);
        for (let i = 0, len = keys.length; i < len; ++i) {
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
    getSettings() {
        return this.spreadSheet.getSettings();
    }

    /**
     * 获取当前 Workbook 的 id
     * @returns {string}
     */
    getId() {
        return this.id || (this.id = this.spreadSheet.getId() + globalSettings.idSuffix4Workbook);
    }

    /**
     * 根据指定 sheet 名获取 sheet 实例
     * @param name
     * @returns {Sheet}
     */
    getSheet(name) {
        return this.sheets.get(name);
    }

    /**
     * 获取当前 Workbook 下的所有 sheet 实例
     * @returns {CaseInsensitiveMap}
     */
    getSheets() {
        return this.sheets;
    }

    /**
     * 获取所有 sheet 的名字
     * @returns {Iterator.<string>}
     */
    getSheetNames() {
        return this.sheets.keys();
    }

    /**
     * 检验 sheet 是否已存在
     * @param name
     * @param {boolean} [exactly=false] - 是否使用精确大小写的 name
     * @returns {boolean}
     */
    isSheetExist(name, exactly) {
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
    _getAutoSheetIndex() {
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
    _getAutoSheetName() {
        const prefix = globalSettings.sheet.autoPrefix + ''; // 防止出现数字相加
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
    getActiveSheet() {
        return this.sheets.get(this.activeSheet);
    }

    /**
     * 创建新的 sheet 页
     * @param {object} [config] - sheet 页的配置信息
     * @returns {Sheet} 新创建的工作表
     */
    createSheet(config) {

        if (config) {  // 根据初始配置创建，name 不能为空
            this._validateSheetName(config.name);
        } else { // 用户操作创建，动态生成 name
            config = {};
            config.name = this._getAutoSheetName();
        }
        var newOne = new Sheet(this, config);
        this.sheets.set(config.name, newOne);
        return newOne;
    }

    /**
     * 销毁指定 sheet 页
     * @param {string | Sheet} sheet - sheet 名称或实例
     */
    destroySheet(sheet) {
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
    renameSheet(name1, name2) {
        var sheet = this.getSheet(name1);
        if (!sheet) {
            throw new SheetError(`工作表 "${name1}" 不存在`);
        }
        if (name1 !== name2) {
            this._validateSheetName(name2, upperCase(name1) === upperCase(name2));
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
    closeSheet(name) {
        var sheet = this.getSheet(name);
        if (!sheet) {
            throw new SheetError(`无法关闭不存在的工作表 "${name}" 。`);
        }
        if (this.sheets.size() === 1) {
            throw new SheetError(`无法关闭仅有的一个工作表 "${name}" 。`);
        }
        if (sheet.isActive()) {
            for (let k of this.sheets.keys()) {
                if (k && k !== name) {
                    this.activeSheet = k;
                    this.getSheet(k).active();
                    break;
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
    active() {
        this.getActiveSheet().active();
    }

    /**
     * 激活指定 sheet
     * @param {string} sheetName
     */
    activeSheet(sheetName) {
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
    _validateSheetName(name, exactly) {
        if (!name) {
            throw new SheetError('工作表的名称不能为空');
        }
        //  禁止一些特殊字符
        if (regExp.test(name)) {
            throw new SheetError(`工作表 "${name}" 包含非法字符`);
        }
        if (this.isSheetExist(name, exactly)) {
            throw new SheetError(`工作表 "${name}" 已存在`);
        }
    }

    _getExchange() {
        var sheets = [];
        for (let [,sheet] of this.getSheets().toMap()) {
            sheet && sheets.push(sheet._getExchange());
        }
        return {
            activeSheet: this.activeSheet,
            sheets: sheets
        }
    }

}

export default Workbook;