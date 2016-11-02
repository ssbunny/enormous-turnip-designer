import {toLabel} from './parser/utils';

var isObject = Handsontable.helper.isObject;

class BaseCell {
    constructor(row, column) {
        const rowObject = isObject(row);
        const columnObject = isObject(column);

        this._row = rowObject ? row.index : row;
        this.rowAbsolute = rowObject ? row.isAbsolute : false;
        this._column = columnObject ? column.index : column;
        this.columnAbsolute = columnObject ? column.isAbsolute : false;
        this.rowOffset = 0;
        this.columnOffset = 0;

        Object.defineProperty(this, 'row', {
            get: function () {
                return this.rowOffset + this._row;
            },
            set: function (row) {
                this._row = row;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(this, 'column', {
            get: function () {
                return this.columnOffset + this._column;
            },
            set: function (column) {
                this._column = column;
            },
            enumerable: true,
            configurable: true
        });
    }

    translateTo(rowOffset, columnOffset) {
        this.row = this.row + rowOffset;
        this.column = this.column + columnOffset;
    }

    isEqual(cell) {
        return cell.row === this.row && cell.column === this.column;
    }

    toString() {
        return toLabel(
            {index: this.row, isAbsolute: this.rowAbsolute},
            {index: this.column, isAbsolute: this.columnAbsolute}
        );
    }
}

export default BaseCell;
