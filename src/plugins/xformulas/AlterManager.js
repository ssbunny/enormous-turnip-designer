import {CellValue} from './CellValue';
import {isFormulaExpression} from './utils';
import {ExpressionModifier} from './expressionModifier';
import localHooks from '../../utils/localHooks';

var arrayEach = Handsontable.helper.arrayEach;
var mixin = Handsontable.helper.mixin;

class AlterManager {
    constructor(sheet) {

        this.sheet = sheet;

        this.dataProvider = sheet.dataProvider;

        this.matrix = sheet.matrix;
    }

    insertRow(row, amount, modifyFormula) {
        this._alter('insert', 'row', row, amount, modifyFormula);
    }

    removeRow(row, amount, modifyFormula) {
        this._alter('remove', 'row', row, -amount, modifyFormula);
    }

    insertColumn(column, amount, modifyFormula) {
        this._alter('insert', 'column', column, amount, modifyFormula);
    }

    removeColumn(column, amount, modifyFormula) {
        this._alter('remove', 'column', column, -amount, modifyFormula);
    }

    _alter(action, axis, start, amount, modifyFormula = true) {
        const startCoord = (cell) => {
            return {
                row: axis === 'row' ? start : cell.row,
                column: axis === 'column' ? start : cell.column,
            };
        };
        const translateCellRefs = (row, column) => {
            arrayEach(this.matrix.cellReferences, (cell) => {
                if (cell[axis] >= start) {
                    cell.translateTo(row, column);
                }
            });
        };

        const translate = [];
        const indexOffset = Math.abs(amount) - 1;

        if (axis === 'row') {
            translate.push(amount, 0);

        } else if (axis === 'column') {
            translate.push(0, amount);
        }

        if (action === 'remove') {
            let removedCellRef = this.matrix.removeCellRefsAtRange({[axis]: start}, {[axis]: start + indexOffset});
            let toRemove = [];

            arrayEach(this.matrix.data, (cell) => {
                arrayEach(removedCellRef, (cellRef) => {
                    if (!cell.hasPrecedent(cellRef)) {
                        return;
                    }

                    cell.removePrecedent(cellRef);
                    cell.setState(CellValue.STATE_OUT_OFF_DATE);

                    arrayEach(this.sheet.getCellDependencies(cell.row, cell.column), (cellValue) => {
                        cellValue.setState(CellValue.STATE_OUT_OFF_DATE);
                    });
                });

                if (cell[axis] >= start && cell[axis] <= (start + indexOffset)) {
                    toRemove.push(cell);
                }
            });

            this.matrix.remove(toRemove);
        }

        translateCellRefs(...translate);

        arrayEach(this.matrix.data, (cell) => {
            const origRow = cell.row;
            const origColumn = cell.column;

            if (cell[axis] >= start) {
                cell.translateTo(...translate);
                cell.setState(CellValue.STATE_OUT_OFF_DATE);
            }

            if (modifyFormula) {
                const row = cell.row;
                const column = cell.column;
                const value = this.dataProvider.getSourceDataAtCell(row, column);

                if (isFormulaExpression(value)) {
                    const expModifier = new ExpressionModifier(value);

                    expModifier.translate(startCoord({row: origRow, column: origColumn}), {[axis]: amount});

                    this.dataProvider.updateSourceData(row, column, expModifier.toString());
                }
            }
        });
        this.runLocalHooks('afterAlter', action, axis, start, amount);
    }

    destroy() {
        this.sheet = null;
        this.dataProvider = null;
        this.matrix = null;
    }
}

mixin(AlterManager, localHooks);

export {AlterManager};
