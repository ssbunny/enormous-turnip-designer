export const SheetHelper = Sup => {
    return class extends Sup {

        // 这个方法用来完成一些填坑操作
        _hack() {
            var hot = this.handsontable;

            // BUG FIXED -> https://github.com/handsontable/handsontable/issues/4375
            hot.addHook('beforeRemoveCol', (index, amount) => {
                const mcr = hot.getPlugin('manualColumnResize');
                let colWidths = [];
                let i = index + amount, j;
                let len = hot.countCols();
                for (; i < len; ++i) {
                    colWidths.push(hot.getColWidth(i));
                }
                for (i = 0, j = index, len = colWidths.length; i < len; ++i, ++j) {
                    mcr.setManualSize(j, colWidths[i]);
                }
            });
        }

        // 选区默认值
        //   1. 选区可能从右下往左上选，此时 row > endRow
        //   2. endRow 及 endCol 可能不存在
        //（不需要关注选区方向时调用此方法进行预处理）
        _defaultSelection(s) {
            s.row > s.endRow && (s.row = [s.endRow, s.endRow = s.row][0]);
            s.col > s.endCol && (s.col = [s.endCol, s.endCol = s.col][0]);

            return {
                startRow: s.row,
                endRow: s.endRow || s.row,
                startCol: s.col,
                endCol: s.endCol || s.col
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


        //noinspection JSUnusedGlobalSymbols
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