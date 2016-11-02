import {CellValue} from './CellValue';
import {CellReference} from './CellReference';
import {isFormulaExpression, toUpperCaseFormula} from './utils';
import {Matrix} from './Matrix';
import {AlterManager} from './AlterManager';
import {Parser} from './parser/parser';
import {ERROR_REF} from './parser/error';

const STATE_UP_TO_DATE = 1;
const STATE_NEED_REBUILD = 2;
const STATE_NEED_FULL_REBUILD = 3;

var arrayEach = Handsontable.helper.arrayEach;
var arrayMap = Handsontable.helper.arrayMap;
var rangeEach = Handsontable.helper.rangeEach;
var objectEach = Handsontable.helper.objectEach;
var mixin = Handsontable.helper.mixin;
var localHooks = Handsontable.utils.localHooks; // private


class Sheet {

    constructor(dataProvider) {
        this.dataProvider = dataProvider;
        this.parser = new Parser();
        this.matrix = new Matrix();
        this.alterManager = new AlterManager(this);

        this._processingCell = null;
        this._state = STATE_NEED_FULL_REBUILD;

        this.parser.on('callCellValue', (...args) => this._onCallCellValue(...args));
        this.parser.on('callRangeValue', (...args) => this._onCallRangeValue(...args));
        this.parser.on('callCellValueInSheet', (...args) => this._onCallCellValueInSheet(...args));
        this.parser.on('callRangeValueInSheet', (...args) => this._onCallRangeValueInSheet(...args));
        this.alterManager.addLocalHook('afterAlter', (...args) => this._onAfterAlter(...args));
    }

    recalculate() {
        switch (this._state) {
            case STATE_NEED_FULL_REBUILD:
                this.recalculateFull();
                break;
            case STATE_NEED_REBUILD:
                this.recalculateOptimized();
                break;
        }
    }

    recalculateOptimized() {
        const cells = this.matrix.getOutOfDateCells();

        arrayEach(cells, (cellValue) => {
            const value = this.dataProvider.getSourceDataAtCell(cellValue.row, cellValue.column);

            if (isFormulaExpression(value)) {
                this.parseExpression(cellValue, value.substr(1));
            }
        });

        this._state = STATE_UP_TO_DATE;
        this.runLocalHooks('afterRecalculate', cells, 'optimized');
    }

    recalculateFull() {
        const cells = this.dataProvider.getSourceDataByRange();
        this.matrix.reset();

        arrayEach(cells, (rowData, row) => {
            arrayEach(rowData, (value, column) => {
                if (isFormulaExpression(value)) {
                    this.parseExpression(new CellValue(row, column), value.substr(1));
                }
            });
        });

        this._state = STATE_UP_TO_DATE;
        this.runLocalHooks('afterRecalculate', cells, 'full');
    }

    setVariable(name, value) {
        this.parser.setVariable(name, value);
    }


    getVariable(name) {
        return this.parser.getVariable(name);
    }


    applyChanges(row, column, newValue) {
        // TODO: Move this to recalculate()
        this.matrix.remove({row, column});

        // TODO: Move this to recalculate()
        if (isFormulaExpression(newValue)) {
            this.parseExpression(new CellValue(row, column), newValue.substr(1));
        }

        const deps = this.getCellDependencies(row, column);

        arrayEach(deps, (cellValue) => {
            cellValue.setState(CellValue.STATE_OUT_OFF_DATE);
        });

        this._state = STATE_NEED_REBUILD;
    }

    parseExpression(cellValue, formula) {
        cellValue.setState(CellValue.STATE_COMPUTING);
        this._processingCell = cellValue;

        // TODO  wrapper formula
        // var sheetNames = this.dataProvider.workbook.getSheetNames();

        const {error, result} = this.parser.parse(toUpperCaseFormula(formula));

        cellValue.setValue(result);
        cellValue.setError(error);
        cellValue.setState(CellValue.STATE_UP_TO_DATE);

        this.matrix.add(cellValue);
        this._processingCell = null;
    }

    getCellAt(row, column) {
        return this.matrix.getCellAt(row, column);
    }

    getCellDependencies(row, column) {
        return this.matrix.getDependencies({row, column});
    }

    _onCallCellValue({row, column}, done) {
        const cell = new CellReference(row, column);

        if (!this.dataProvider.isInDataRange(cell.row, cell.column)) {
            throw Error(ERROR_REF);
        }

        this.matrix.registerCellRef(cell);
        this._processingCell.addPrecedent(cell);

        done(this.dataProvider.getDataAtCell(cell.row, cell.column));
    }

    _onCallCellValueInSheet({sheetName, row, column}, done) {
        const cell = new CellReference(row, column);

        // TODO 更改数据时，公式引用的数据级联更新

        done(this.dataProvider.getDataAtCellInSheet(sheetName, cell.row, cell.column));
    }

    _onCallRangeValue({row: startRow, column: startColumn}, {row: endRow, column: endColumn}, done) {
        rangeEach(startRow.index, endRow.index, (row) => {
            rangeEach(startColumn.index, endColumn.index, (column) => {
                let cell = new CellReference(row, column);

                this.matrix.registerCellRef(cell);
                this._processingCell.addPrecedent(cell);
            });
        });
        done(this.dataProvider.getDataByRange(startRow.index, startColumn.index, endRow.index, endColumn.index));
    }

    // TODO 调用范围公式
    _onCallRangeValueInSheet(sheetName, {row: startRow, column: startColumn}, {row: endRow, column: endColumn}, done) {


        done('_onCallRangeValueInSheet');
    }

    _onAfterAlter() {
        this.recalculateOptimized();
    }

    destroy() {
        this.dataProvider.destroy();
        this.dataProvider = null;
        this.alterManager.destroy();
        this.alterManager = null;
        this.parser = null;
        this.matrix.reset();
        this.matrix = null;
    }
}

mixin(Sheet, localHooks);

export {Sheet};
