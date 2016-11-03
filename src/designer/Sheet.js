import Tabs from  './views/Tabs';
import Handsontable from './HotTableAdaptor';
import {SheetError} from './SheetError'
import {Coordinate} from '../utils/common';
import Emitter from '../utils/Emitter'

const INIT_ROWS = 150; // Sheet 初始可显示的行数
const INIT_COLS = 50;  // Sheet 初始可显示的列数


/**
 * 工作表
 *
 * @fires Sheet#afterRename
 * @fires Sheet#afterRenameCancel
 */
class Sheet extends Emitter {

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
     * TODO 销毁 sheet 页
     */
    destroy() {
        // 检查是不是最后一个
    }

    /**
     * 给 sheet 页重命名
     * @param name - 新名字
     * @returns {boolean} - 是否成功
     */
    rename(name) {
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
    select(fromRow, fromCol, toRow, toCol) {
        toRow = toRow || fromRow;
        toCol = toCol || fromCol;
        this.handsontable.selectCell(fromRow, fromCol, toRow, toCol, false);
    }

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


    _getExchange() {
        var {data, cells} = this._getDataMeta();
        var {heights, widths} = this._getSize();
        var mergeCells = this.handsontable.getSettings().mergeCells;

        return {
            name: this.getName(),
            selection: this.getSelection(),
            data: data,
            rowHeights: heights,
            colWidths: widths,
            mergeCells: mergeCells,
            cellMetas: cells
        }
    }

    _getSize() {
        var hot = this.handsontable;
        var cols = hot.countCols() - hot.countEmptyCols(true);
        var rows = hot.countRows() - hot.countEmptyRows(true);
        var heights = [];
        var widths = [];

        for (let i = 0; i < rows; ++i) {
            let h = hot.getRowHeight(i);
            if (i === 0 && !h) { // handsontable bug
                h = 24;
            }
            heights.push(h)
        }
        for (let i = 0; i < cols; ++i) {
            widths.push(hot.getColWidth(i))
        }
        return {heights, widths};
    }

    _getDataMeta() {
        var hot = this.handsontable;
        var cols = hot.countCols() - hot.countEmptyCols(true);
        var rows = hot.countRows() - hot.countEmptyRows(true);
        var data = [];
        var cells = [];

        for (let i = 0; i < rows; ++i) {
            let rowResult = [];
            let rowCellMeta = [];

            for (let j = 0; j < cols; ++j) {
                let _sourceData = hot.getSourceDataAtCell(i, j);
                let _meta = hot.getCellMeta(i, j); // TODO meta
                let _data = hot.getDataAtCell(i, j);
                let _cellMata = {};

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
        return {data, cells};
    }

    // TODO
    _getBorders() {

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

