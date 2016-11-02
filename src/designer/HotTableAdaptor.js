import {extend} from '../utils/common.js'
import ConfigTranslator from './ConfigTranslator.js'


/**
 * Handsontable 组件的适配类
 */
class HotTableAdaptor extends Handsontable {

    /**
     *
     * @param {HTMLElement} rootElement
     * @param {object} config - 原始配置信息
     * @param {object} extConfig - 附加的配置信息
     * @param {Sheet} sheet - 对应的 sheet 实例
     */
    constructor(rootElement, config, extConfig, sheet) {
        var hotSettings = {};
        var translator = new ConfigTranslator(config, sheet);
        var settings = translator.translate();

        var frame = sheet.workbook.spreadSheet.getFrameInstance();
        var menuItems = frame.contextMenu.menuItems;
        var contextMenu = {};
        contextMenu.items = frame.contextMenu.getMenuItems4HotTable();
        contextMenu.callback = (function (sheet) {
            return function (key, options) {
                if (menuItems.has(key)) {
                    let item = menuItems.get(key);
                    if (item.handler) {
                        item.handler.call(this, sheet, options.start, options.end);
                    }
                }
            };
        }(sheet));
        HotTableAdaptor._preference.contextMenu = contextMenu;

        extend(hotSettings, HotTableAdaptor._preference);
        extend(hotSettings, settings);
        extend(hotSettings, extConfig);
        super(rootElement, hotSettings);

        this._translator = translator;
    }

}


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

export default HotTableAdaptor;