import {CellValue} from './CellValue';
import {ERROR_REF} from "./parser/error";

var arrayEach = Handsontable.helper.arrayEach;
var arrayFilter = Handsontable.helper.arrayFilter;
var arrayReduce = Handsontable.helper.arrayReduce;

class Matrix {
    constructor() {
        this.data = [];
        this.cellReferences = [];
    }

    getCellAt(row, column) {
        let result = null;

        arrayEach(this.data, (cell) => {
            if (cell.row === row && cell.column === column) {
                result = cell;

                return false;
            }
        });

        return result;
    }

    getOutOfDateCells() {
        return arrayFilter(this.data, (cell) => cell.isState(CellValue.STATE_OUT_OFF_DATE));
    }

    add(cellValue) {
        if (!arrayFilter(this.data, (cell) => cell.isEqual(cellValue)).length) {
            this.data.push(cellValue);
        }
    }

    remove(cellValue) {
        const isArray = Array.isArray(cellValue);
        const isEqual = (cell, cellValue) => {
            let result = false;

            if (isArray) {
                arrayEach(cellValue, (value) => {
                    if (cell.isEqual(value)) {
                        result = true;

                        return false;
                    }
                });
            } else {
                result = cell.isEqual(cellValue);
            }

            return result;
        };
        this.data = arrayFilter(this.data, (cell) => !isEqual(cell, cellValue));
    }

    getDependencies(cellValue) {
        const getDependencies = (cell) => {
            return arrayReduce(this.data, (acc, cellValue) => {
                if (cellValue.hasPrecedent(cell) && acc.indexOf(cellValue) === -1) {
                    acc.push(cellValue);
                }
                return acc;
            }, []);
        };

        const getTotalDependencies = (cell) => {
            let deps = getDependencies(cell);

            if (deps.length) {
                arrayEach(deps, (cellValue) => {
                    if (cellValue.hasPrecedents()) {
                        deps = deps.concat(getTotalDependencies(cellValue));
                    }
                });
            }
            return deps;
        };

        try {
            return getTotalDependencies(cellValue);
        } catch (e) {
            // TODO 增加该代码是解决以下问题的权宜之策：
            // https://github.com/handsontable/handsontable/issues/4357
            let errorValue = new CellValue(cellValue.row, cellValue.column);
            errorValue.setError(ERROR_REF);
            errorValue.setState(CellValue.STATE_UP_TO_DATE);
            return [errorValue];
        }
    }


    registerCellRef(cellReference) {
        if (!arrayFilter(this.cellReferences, (cell) => cell.isEqual(cellReference)).length) {
            this.cellReferences.push(cellReference);
        }
    }

    removeCellRefsAtRange({row: startRow, column: startColumn}, {row: endRow, column: endColumn}) {
        const removed = [];

        const rowMatch = (cell) => {
            return startRow === void 0 ? true : cell.row >= startRow && cell.row <= endRow;
        };
        const colMatch = (cell) => {
            return startColumn === void 0 ? true : cell.column >= startColumn && cell.column <= endColumn;
        };

        this.cellReferences = arrayFilter(this.cellReferences, (cell) => {
            if (rowMatch(cell) && colMatch(cell)) {
                removed.push(cell);

                return false;
            }

            return true;
        });

        return removed;
    }

    reset() {
        this.data.length = 0;
        this.cellReferences.length = 0;
    }
}

export {Matrix};
