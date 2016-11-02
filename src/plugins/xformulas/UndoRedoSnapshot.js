import {CellValue} from './CellValue';
import {Stack} from '../../utils/dataStructure'

var arrayEach = Handsontable.helper.arrayEach;
var rangeEach = Handsontable.helper.rangeEach;

class UndoRedoSnapshot {
    constructor(sheet) {
        this.sheet = sheet;
        this.stack = new Stack();
    }

    save(axis, index, amount) {
        const {matrix, dataProvider} = this.sheet;
        const changes = [];

        arrayEach(matrix.data, (cellValue) => {
            const {row, column} = cellValue;

            if (cellValue[axis] < index || cellValue[axis] > index + (amount - 1)) {
                const value = dataProvider.getSourceDataAtCell(row, column);

                changes.push({row, column, value});
            }
        });

        this.stack.push({axis, index, amount, changes});
    }

    restore() {
        const {matrix, dataProvider} = this.sheet;
        const {axis, index, amount, changes} = this.stack.pop();

        if (changes) {
            arrayEach(changes, (change) => {
                if (change[axis] > index + (amount - 1)) {
                    change[axis] -= amount;
                }
                const {row, column, value} = change;
                const rawValue = dataProvider.getSourceDataAtCell(row, column);

                if (rawValue !== value) {
                    dataProvider.updateSourceData(row, column, value);
                    matrix.getCellAt(row, column).setState(CellValue.STATE_OUT_OFF_DATE);
                }
            });
        }
    }

    destroy() {
        this.sheet = null;
        this.stack = null;
    }
}

export {UndoRedoSnapshot};
