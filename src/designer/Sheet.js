import Tabs from  './views/Tabs';
import Handsontable from './HotTableAdaptor';
import {SheetError} from './SheetError';
import {Exchange} from './ext/Sheet_exchange';
import {SheetHelper} from './ext/Sheet_helper';
import {Coordinate} from '../utils/common';
import Emitter from '../utils/Emitter';


const INIT_ROWS = 150; // Sheet 初始可显示的行数
const INIT_COLS = 50;  // Sheet 初始可显示的列数

// Webstorm IDE 的语法检查或 souremap 解析时不支持直接写到类的 extends 后。
var Mixin = SheetHelper(Exchange(Emitter));

/**
 * 工作表
 *
 * @fires Sheet#afterRename
 * @fires Sheet#afterRenameCancel
 */
class Sheet extends Mixin {

    /**
     * 构造 Sheet 实例，用户代码不应该直接调用它，
     * 而是使用 Workbook.createSheet() 方法构造。
     *
     * @param {Workbook} workbook
     * @param {object} config
     * @private
     */
    constructor(workbook, config) {
        super();
        /**
         * sheet 所在的工作表
         * @type {Workbook}
         */
        this.workbook = workbook;
        this.$$view = workbook.$$view;
        this.settings = config;
        this.sheetName = config.name;

        this.initRows = INIT_ROWS;
        this.initCols = INIT_COLS;

        this.fx = {}; // TODO

        this._render();
    }

    /**
     * @private
     */
    _render() {
        this.$$view.appendTab(this.sheetName);
        var {container, width, height} = this.$$view._hotTables.get(this.sheetName);

        /**
         * @type {Handsontable}
         */

        this.handsontable = new Handsontable(container, this.settings, {
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
    getName() {
        return this.sheetName;
    }

    /**
     * 激活当前 sheet 页
     */
    active() {
        this.workbook.activeSheet = this.getName();
        this.$$view.activeTab(this.getName());
        this.handsontable.render();
    }

    /**
     * 检测当前 sheet 是否被激活
     * @returns {boolean}
     */
    isActive() {
        return this.workbook.activeSheet === this.getName();
    }

    /**
     * 关闭 sheet 页
     */
    close() {
        this.workbook.closeSheet(this.getName());
    }

    /**
     * 销毁当前 sheet
     */
    destroy() {
        this.handsontable.destroy();
        this.workbook.sheets.delete(this.getName());
        delete this.workbook;
        delete this.$$view;
    }

    /**
     * 给 sheet 页重命名
     * @param name - 新名字
     */
    rename(name) {
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
    select(fromRow, fromCol, toRow, toCol) {
        toRow = toRow || fromRow;
        toCol = toCol || fromCol;
        this.handsontable.selectCell(fromRow, fromCol, toRow, toCol, false);
    }

    /**
     * 获得当前 sheet 的选区
     * @returns {{row, col, endRow, endCol}}
     */
    getSelection() {
        var selection = this.handsontable.getSelected();
        return {
            row: selection[0],
            col: selection[1],
            endRow: selection[2],
            endCol: selection[3]
        }
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
    mergeCells(row, col, rowspan, colspan) {
        var r = 0;
        var cover = [];
        var mergeCells = this.handsontable.getSettings().mergeCells;

        var r1 = [row, col, row + rowspan - 1, col + colspan - 1];

        for (let i = mergeCells.length; i; --i) {
            let f = mergeCells[i - 1];
            let r2 = [f.row, f.col, f.row + f.rowspan - 1, f.col + f.colspan - 1];

            // 与原区域存在完全重叠
            if (Coordinate.isEqual(r1, r2)) {
                r = 1;
                break;
            }
            // 是原区域的子集
            if (Coordinate.isSubset(r1, r2)) {
                r = 2;
                break;
            }
            // 覆盖原区域（此时可能与另一个原区域交集或完全覆盖）
            if (Coordinate.isSuperset(r1, r2)) {
                cover.push(i - 1);
                r = 3;
                continue;
            }
            // 与原区域存在交集(不含子集、超集情况)
            if (Coordinate.intersection(r1, r2)) {
                r = 4;
            }
        }

        if (r === 0 || r === 3) {
            if (r === 3) { // 这种情况下一定存在已经合并过的单元格
                for (let i = 0; i < cover.length; ++i) {
                    mergeCells.splice(cover[i], 1);
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
            throw new SheetError(`给定的合并区域不合法: [${row}, ${col}, ${rowspan}, ${colspan}]`)
        }
    }


    /**
     * 取消单元格合并
     * @param {int} row - 起始行
     * @param {int} col - 起始列
     * @param {int} rowspan - 待合并的行数
     * @param {int} colspan - 待合并的列数
     */
    unMergeCells(row, col, rowspan, colspan) {
        var merged = this.handsontable.getSettings().mergeCells;
        var mergeCells = [];
        if (merged && merged.length) {
            for (let i = 0; i < merged.length; ++i) {
                if (Coordinate.isSubset([
                        merged[i].row,
                        merged[i].col,
                        merged[i].row + merged[i].rowspan - 1,
                        merged[i].col + merged[i].colspan - 1
                    ], [row, col, row + rowspan - 1, col + colspan - 1])) {
                    continue;
                }
                mergeCells.push(merged[i]);
            }
        }
        this.handsontable.updateSettings({
            mergeCells: mergeCells.length === 0 ? false : mergeCells
        });
    }

    spliceClass(selection, newClassName, ...classNames) {
        this._walkonCellMetas(selection, (row, col, cellMeta) => {
            return {
                className: (this._removeFormerClass(
                    cellMeta.className,
                    classNames
                ) + ' ' + newClassName).trim()
            };
        }, {className: newClassName});
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
    setFontBold(value = true, selection = this.getSelection()) {
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
    setFontItalic(value = true, selection = this.getSelection()) {
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
    setFontUnderline(value = true, selection = this.getSelection()) {
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
    setFontColor(value = '', selection = this.getSelection()) {
        this._walkonCellMetas(selection, () => {
            return {
                _style_color: value
            };
        }, {_style_color: value});
        this.handsontable.render();
    }

    /**
     * 字体类型
     * @param value
     * @param selection
     */
    setFontFamily(value = '', selection = this.getSelection()) {
        this._walkonCellMetas(selection, () => {
            return {
                _style_fontFamily: value
            };
        }, {_style_fontFamily: value});
        this.handsontable.render();
    }

    /**
     * 字体大小
     * @param value - 需要指定单位，如 12px
     * @param selection
     */
    setFontSize(value, selection = this.getSelection()) {
        this._walkonCellMetas(selection, () => {
            return {
                _style_fontSize: value
            };
        }, {_style_fontSize: value});
        this.handsontable.render();
    }

    /**
     * 设置背景色
     * @param value
     * @param selection
     */
    setBackgroundColor(value = '', selection = this.getSelection()) {
        this._walkonCellMetas(selection, () => {
            return {
                _style_backgroundColor: value
            };
        }, {_style_backgroundColor: value});
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
    setBorder(range, top, right, bottom, left) {
        var config = {
            range: range,
            top: top
        };
        config.right = right || top;
        config.bottom = bottom || top;
        config.left = left || config.right;

        var formerBorders = this.handsontable.getSettings().customBorders || [];
        formerBorders.push(config);

        // TODO customBorders cannot be updated via updateSettings
        // @see {@link https://github.com/handsontable/handsontable/issues/2002}
        this.handsontable.updateSettings({
            customBorders: formerBorders
        });
    }

}

export default Sheet;


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

