export const SheetHelper = Sup => {
    return class extends Sup {

        _defaultSelection(selection) {
            return {
                startRow: selection.row,
                endRow: selection.endRow || selection.row,
                startCol: selection.col,
                endCol: selection.endCol || selection.col
            };
        }

        //noinspection JSUnusedGlobalSymbols
        _removeFormerClass(current, ...supported) {
            if (!current) {
                return '';
            }
            for (let clazz of supported) {
                current = current.split(clazz).join('');
            }
            return current.trim();
        }

        //noinspection JSUnusedGlobalSymbols
        _walkonCellMetas(selection, callback, unhold) {
            let {startRow, endRow, startCol, endCol} = this._defaultSelection(selection);
            for (let i = startRow; i <= endRow; ++i) {
                for (let j = startCol; j <= endCol; ++j) {
                    let cellMeta = this.handsontable.getCellMeta(i, j);
                    if (cellMeta) {
                        let newMeta = callback.call(this, i, j, cellMeta);
                        newMeta && this.handsontable.setCellMetaObject(i, j, newMeta);
                    } else {
                        unhold && this.handsontable.setCellMetaObject(i, j, unhold);
                    }
                }
            }
        }

        //noinspection JSUnusedGlobalSymbols
        _walkonCells(selection, callback) {
            let {startRow, endRow, startCol, endCol} = this._defaultSelection(selection);
            for (let i = startRow; i <= endRow; ++i) {
                for (let j = startCol; j <= endCol; ++j) {
                    let cellTD = this.handsontable.getCell(i, j, true);
                    if (cellTD) {
                        callback.call(this, i, j, cellTD);
                    }
                }
            }
        }


        _walkonSelection(selection, callback) {
            let {startRow, endRow, startCol, endCol} = this._defaultSelection(selection);
            for (let i = startRow; i <= endRow; ++i) {
                for (let j = startCol; j <= endCol; ++j) {
                    callback.call(this, i, j);
                }
            }
        }

    };
};