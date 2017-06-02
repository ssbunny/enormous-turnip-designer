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
        var displayMode = sheet.workbook.spreadSheet.getDisplayMode();
        var menuItems = frame.contextMenu.menuItems;
        var contextMenu = {};
        contextMenu.items = frame.contextMenu.getMenuItems4HotTable();
        contextMenu.callback = (function (sheet) {
            return function (key, options) {
                if (menuItems.has(key)) {
                    let item = menuItems.get(key);
                    if (item.handler) {
                        item.handler.call(this, sheet, options.start, options.end, options);
                    }
                }
            };
        }(sheet));
        HotTableAdaptor._preference.contextMenu = contextMenu;

        extend(hotSettings, HotTableAdaptor._preference);
        extend(hotSettings, settings);
        extend(hotSettings, extConfig);

        if (displayMode) {
            hotSettings.colHeaders = false;
            hotSettings.rowHeaders = false;
        }

        super(rootElement, hotSettings);

        this._translator = translator;

        // handontable 每次 render 的时候，不保留 td 的状态，因此通过该事件重建一些样式。
        Handsontable.hooks.add('beforeRenderer', function (TD, row, col, prop, value, cellProperties) {
            TD.style.color = cellProperties._style_color || '';
            TD.style.fontFamily = cellProperties._style_fontFamily || '';
            TD.style.fontSize = cellProperties._style_fontSize || '';
            TD.style.backgroundColor = cellProperties._style_backgroundColor || '';
        }, this);

        /*
         * 将 Handsontable 的所有事件都委托给 SpreadSheet 后会有些卡。
         * 只好将 Handsontable.hooks.getRegistered() 换成 ECP 项目需要的。
         */
        ['afterSelectionEnd'].forEach(hook => {
            Handsontable.hooks.add(hook, function () {
                var args = [];
                args.push(hook);
                args.push(sheet);
                args.push.apply(args, [].slice.call(arguments));
                var cxt = sheet.workbook.spreadSheet;
                cxt.emit.apply(cxt, args);
            }, this);
        });
    }

    destroy() {
        super.destroy();
        delete this._translator;
    }

}


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

    xFormulas: true
};

export default HotTableAdaptor;