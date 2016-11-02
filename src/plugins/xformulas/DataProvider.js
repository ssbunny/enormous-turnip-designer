import {isFormulaExpression} from './utils';

var arrayEach = Handsontable.helper.arrayEach;
var rangeEach = Handsontable.helper.rangeEach;


class DataProvider {

    constructor(hot) {
        this.hot = hot;
        this.changes = {};
    }

    collectChanges(row, column, value) {
        if (!isFormulaExpression(value)) {
            this.changes[DataProvider._coordId(row, column)] = value;
        }
    }

    clearChanges() {
        this.changes = {};
    }

    isInDataRange(row, column) {
        return row >= 0 && row < this.hot.countRows() && column >= 0 && column < this.hot.countCols();
    }

    getDataAtCell(row, column) {
        const id = DataProvider._coordId(row, column);
        let result;

        if (this.changes.hasOwnProperty(id)) {
            result = this.changes[id];
        } else {
            result = this.hot.getDataAtCell(row, column);
        }
        return result;
    }

    getDataAtCellInSheet(sheetName, row, column) {
        var sheet = this.workbook.getSheet(sheetName);
        var formulas = sheet.handsontable.getPlugin('XFormulas');
        return formulas.sheet.dataProvider.getDataAtCell(row, column);
    }

    getDataByRange(row1, column1, row2, column2) {
        const result = this.hot.getData(row1, column1, row2, column2);

        arrayEach(result, (rowData, rowIndex) => {
            arrayEach(rowData, (value, columnIndex) => {
                const id = DataProvider._coordId(rowIndex + row1, columnIndex + column1);

                if (this.changes.hasOwnProperty(id)) {
                    result[rowIndex][columnIndex] = this.changes[id];
                }
            });
        });

        return result;
    }

    getSourceDataAtCell(row, column) {
        return this.hot.getSourceDataAtCell(row, column);
    }

    getSourceDataByRange(row1, column1, row2, column2) {
        return this.hot.getSourceDataArray(row1, column1, row2, column2);
    }

    updateSourceData(row, column, value) {
        this.hot.getSourceData()[row][this.hot.colToProp(column)] = value;
    }

    static _coordId(row, column) {
        return `${row}:${column}`;
    }

    destroy() {
        this.hot = null;
        this.changes = null;
    }
}

export {DataProvider};
