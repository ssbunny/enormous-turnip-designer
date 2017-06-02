/**
 * 扩展公式：支持跨工作表的公式。
 * 示例：
 * + worksheet2中某单元格值为 `=worksheet1!A2+B2`
 * + 工作表3中某单元格值为 `=工作表1!A1+工作表2B1`
 * + sheet5中某单元格值为`=SUM(sheet3!B1:B5, sheet4!B6)`
 *
 * TODO 目前仅支持“相对引用”的坐标形式，但没有公式填充的效果；
 * 目前不支持“绝对引用”和“混合引用”方式。
 *
 * 此插件需要绕开 hansontable 一个插件对应一个实例的设计思路，而同时管理多个实例。
 * 实例的管理工作交给 Workbook 来做，因此，此插件不可作为独立的 hansontable 插件
 * 使用，只能依托于该电子表格设计器。
 *
 * @plugin External plugin XFormulas.
 * @param hotInstance
 * @constructor
 *
 */

// TODO 禁止公式循环引用 A1=B1, B1=A1

import {
    isFormulaExpression,
    toUpperCaseFormula,
    isFormulaExpressionEscaped,
    unescapeFormulaExpression} from './utils';
import {Sheet} from './Sheet';
import {DataProvider} from './DataProvider';
import {UndoRedoSnapshot} from './UndoRedoSnapshot';


var arrayEach = Handsontable.helper.arrayEach;
var isObject = Handsontable.helper.isObject;
var objectEach = Handsontable.helper.objectEach;

function XFormulas(hotInstance) {
    Handsontable.plugins.BasePlugin.call(this, hotInstance);
    this._superClass = Handsontable.plugins.BasePlugin;

    this.eventManager = new Handsontable.EventManager();
    this.dataProvider = new DataProvider(this.hot);
    this.sheet = new Sheet(this.dataProvider);
    this.undoRedoSnapshot = new UndoRedoSnapshot(this.sheet);

    this._skipRendering = false;
}

XFormulas.prototype = Object.create(Handsontable.plugins.BasePlugin.prototype, {
    constructor: {
        writable: true,
        configurable: true,
        value: XFormulas
    }
});


XFormulas.prototype.isEnabled = function () {
    return !!this.hot.getSettings().xFormulas;
};

/**
 * 插件初始化过程。
 * PS: enablePlugin 方法会在 beforeInit hook 中触发，
 *     仅当 isEnabled 方法返回 true 时执行。
 */
XFormulas.prototype.enablePlugin = function () {
    if (this.enabled) {
        return;
    }

    const settings = this.hot.getSettings();
    if (!settings._isHotTableAdaptor) {
        throw('XFormulas 插件启用失败');
    }

    const formulasSettings = settings.formulas;
    if (isObject(formulasSettings)) {
        if (isObject(formulasSettings.variables)) {
            objectEach(formulasSettings.variables, (value, name) => this.setVariable(name, value));
        }
    }

    // TODO move to DataProvider
    var worksheet = this.dataProvider.worksheet = this.hot.getSettings()._sheet;
    this.dataProvider.workbook = worksheet.workbook;

    this.addHook('afterCreateCol', (...args) => this.onAfterCreateCol(...args));
    this.addHook('afterCreateRow', (...args) => this.onAfterCreateRow(...args));
    this.addHook('afterLoadData', () => this.onAfterLoadData());
    this.addHook('afterRemoveCol', (...args) => this.onAfterRemoveCol(...args));
    this.addHook('afterRemoveRow', (...args) => this.onAfterRemoveRow(...args));
    this.addHook('afterSetDataAtCell', (...args) => this.onAfterSetDataAtCell(...args));
    this.addHook('afterSetDataAtRowProp', (...args) => this.onAfterSetDataAtCell(...args));
    this.addHook('beforeKeyDown', (...args) => this.onBeforeKeyDown(...args));
    this.addHook('beforeCreateCol', (...args) => this.onBeforeCreateCol(...args));
    this.addHook('beforeCreateRow', (...args) => this.onBeforeCreateRow(...args));
    this.addHook('beforeRemoveCol', (...args) => this.onBeforeRemoveCol(...args));
    this.addHook('beforeRemoveRow', (...args) => this.onBeforeRemoveRow(...args));
    this.addHook('beforeValidate', (...args) => this.onBeforeValidate(...args));
    this.addHook('beforeValueRender', (...args) => this.onBeforeValueRender(...args));
    this.addHook('modifyData', (...args) => this.onModifyData(...args));

    this.sheet.addLocalHook('afterRecalculate', (...args) => this.onSheetAfterRecalculate(...args));

    this._superClass.prototype.enablePlugin.call(this);
};


/**
 * 禁用插件。
 * PS: 注意将所有属性重置为默认值
 */
XFormulas.prototype.disablePlugin = function () {
    this._superClass.prototype.disablePlugin.call(this);
};

/**
 * 重置 Handsontable 的 settings 时，用来重置 XFormulas 插件的属性。
 * PS: 在 afterUpdateSettings hook 中调用。
 */
XFormulas.prototype.updatePlugin = function () {
    this.disablePlugin();
    this.enablePlugin();
    this._superClass.prototype.updatePlugin.call(this);
};

/**
 * 销毁插件
 */
XFormulas.prototype.destroy = function () {
    this.dataProvider.destroy();
    this.dataProvider = null;
    this.sheet.destroy();
    this.sheet = null;
    this._superClass.prototype.destroy.call(this);
};


// ---------------------------------------[start] Hooks

// TODO 工作表改名时，其它工作表关联到它的公式值要改
XFormulas.prototype.onSheetRename = function (sheet, name1, name2) {


};

XFormulas.prototype.onSheetAfterRecalculate = function (cells) {
    if (this._skipRendering) {
        this._skipRendering = false;
        return;
    }
    const hot = this.hot;

    arrayEach(cells, ({row, column}) => {
        hot.validateCell(
            hot.getDataAtCell(row, column),
            hot.getCellMeta(row, column),
            () => {
            }
        );
    });
    hot.render();
};


/**
 * Caution - 调用 event.stopImmediatePropagation() 可以阻止默认行为。
 * @param event
 */
XFormulas.prototype.onBeforeKeyDown = function (event) {
    var ae;
    if (event.keyCode === 187 && event.shiftKey === false) {
        ae = this.hot.getActiveEditor();
        console.log('onBeforeKeyDown-----', event)
        console.log('onBeforeKeyDown', ae)
    }

};

XFormulas.prototype.onModifyData = function (row, column, valueHolder, ioMode) {
    if (ioMode === 'get' && this.hasComputedCellValue(row, column)) {
        valueHolder.value = this.getCellValue(row, column);

    } else if (ioMode === 'set' && isFormulaExpression(valueHolder.value)) {
        valueHolder.value = toUpperCaseFormula(valueHolder.value);
    }
};

XFormulas.prototype.onBeforeValueRender = function (value) {
    if (isFormulaExpressionEscaped(value)) {
        value = unescapeFormulaExpression(value);
    }
    return value;
};

XFormulas.prototype.onBeforeValidate = function (value, row, prop) {
    const column = this.hot.propToCol(prop);

    if (this.hasComputedCellValue(row, column)) {
        value = this.getCellValue(row, column);
    }

    return value;
};

XFormulas.prototype.onAfterSetDataAtCell = function (changes, source) {
    if (source === 'loadData') {
        return;
    }

    this.dataProvider.clearChanges();
    arrayEach(changes, ([row, column, oldValue, newValue]) => {
        column = this.hot.propToCol(column);
        if (isFormulaExpression(newValue)) {
            newValue = toUpperCaseFormula(newValue);
        }
        this.dataProvider.collectChanges(row, column, newValue);
        if (oldValue !== newValue) {
            this.sheet.applyChanges(row, column, newValue);
        }
    });
    this.recalculate();
};

XFormulas.prototype.onBeforeCreateRow = function (row, amount, source) {
    if (source === 'UndoRedo.undo') {
        this.undoRedoSnapshot.restore();
    }
};

XFormulas.prototype.onAfterCreateRow = function (row, amount, source) {
    this.sheet.alterManager.insertRow(row, amount, source !== 'UndoRedo.undo');
};

XFormulas.prototype.onBeforeRemoveRow = function (row, amount) {
    // TODO Storage.save('row', row, amount);
};

XFormulas.prototype.onAfterRemoveRow = function (row, amount) {
    this.sheet.alterManager.removeRow(row, amount);
};

XFormulas.prototype.onBeforeCreateCol = function (column, amount, source) {
    if (source === 'UndoRedo.undo') {
        this.undoRedoSnapshot.restore();
    }
};

XFormulas.prototype.onAfterCreateCol = function (column, amount, source) {
    this.sheet.alterManager.insertColumn(column, amount, source !== 'UndoRedo.undo');
};

XFormulas.prototype.onBeforeRemoveCol = function (column, amount) {
    // TODO Storage.save('column', column, amount);
};

XFormulas.prototype.onAfterRemoveCol = function (column, amount) {
    this.sheet.alterManager.removeColumn(column, amount);
};

XFormulas.prototype.onAfterLoadData = function () {
    this._skipRendering = true;
    this.recalculateFull();
};

// ---------------------------------------[end] Hooks

XFormulas.prototype.getCellValue = function (row, column) {
    const cell = this.sheet.getCellAt(row, column);
    return cell ? (cell.getError() || cell.getValue()) : void 0;
};

XFormulas.prototype.hasComputedCellValue = function (row, column) {
    return this.sheet.getCellAt(row, column) ? true : false;
};

XFormulas.prototype.recalculate = function () {
    this.sheet.recalculate();
};

XFormulas.prototype.recalculateFull = function () {
    this.sheet.recalculateFull();
};

XFormulas.prototype.recalculateOptimized = function () {
    this.sheet.recalculateOptimized();
};

XFormulas.prototype.setVariable = function (name, value) {
    this.sheet.setVariable(name, value);
};

XFormulas.prototype.getVariable = function (name) {
    return this.sheet.getVariable(name);
};

Handsontable.plugins.registerPlugin('xFormulas', XFormulas);

export {XFormulas};