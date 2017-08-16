/**
 * Handsontable 组件的适配类
 */
import {extend} from "../utils/common.js";
import ConfigTranslator from "./ConfigTranslator.js";

class HotTableAdaptor extends Handsontable {

    /**
     *
     * @param {HTMLElement} rootElement
     * @param {object} config - 原始配置信息
     * @param {object} extConfig - 附加的配置信息
     * @param {Sheet} sheet - 对应的 sheet 实例
     */
    constructor(rootElement, config, extConfig, sheet) {
        let hotSettings = {};
        let translator = new ConfigTranslator(config, sheet);
        let settings = translator.translate();
        let ss = sheet.workbook.spreadSheet;

        let frame = ss.getFrameInstance();
        let displayMode = ss.getDisplayMode();
        let menuItems = frame.contextMenu.menuItems;
        let contextMenu = {};

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

        extend(hotSettings, HotTableAdaptor._preference);
        extend(hotSettings, settings);
        extend(hotSettings, extConfig);

        if (displayMode) {
            hotSettings.colHeaders = false;
            hotSettings.rowHeaders = false;
        }

        !displayMode && (hotSettings.contextMenu = contextMenu);
        displayMode && (hotSettings.tableClassName += ' displaymode');

        super(rootElement, hotSettings);

        this._translator = translator;

        // handontable 每次 render 的时候，不保留 td 的状态，因此通过该事件重建一些样式。
        //noinspection ES6ModulesDependencies
        Handsontable.hooks.add('beforeRenderer', function (TD, row, col, prop, value, cellProperties) {
            TD.style.color = cellProperties._style_color || '';
            TD.style.fontFamily = cellProperties._style_fontFamily || '';
            TD.style.fontSize = cellProperties._style_fontSize || '';
            cellProperties._style_fontSize && (TD.style.lineHeight = cellProperties._style_fontSize);
            TD.style.backgroundColor = cellProperties._style_backgroundColor || '';
        }, this);

        /*
         * 将 Handsontable 的所有事件都委托给 SpreadSheet 后会有些卡。
         * 只好将 Handsontable.hooks.getRegistered() 换成 ECP 项目需要的。
         */
        ['afterSelectionEnd'].forEach(hook => {
            //noinspection ES6ModulesDependencies
            Handsontable.hooks.add(hook, function () {
                let args = [];
                args.push(hook);
                args.push(sheet);
                args.push.apply(args, [].slice.call(arguments));
                let cxt = sheet.workbook.spreadSheet;
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
 * 预设配置，所有页面的所有 Handsontable 会共享此配置，
 * 因此不要在实例中修改此对象。
 * @private
 */
HotTableAdaptor._preference = {
    outsideClickDeselects: false,
    contextMenu: false,

    rowHeaders: true,
    colHeaders: true,

    manualColumnResize: true,
    manualRowResize: true,

    tableClassName: 'ssd-handsontable-table',

    customBorders: true,

    xFormulas: true
};

export default HotTableAdaptor;