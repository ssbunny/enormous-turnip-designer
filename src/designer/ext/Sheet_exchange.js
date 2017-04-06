export const Exchange = Sup => class extends Sup {

    _getExchange() {
        var {data, cells} = this._getDataMeta();
        var {heights, widths} = this._getSizeEx();
        var mergeCells = this.handsontable.getSettings().mergeCells;

        if (mergeCells === false) {
            mergeCells = null; // 避免强类型语言解析时无法处理动态类型
        }

        return {
            name: this.getName(),
            selection: this.getSelection(),
            data: data.length ? data : []._,
            rowHeights: heights,
            colWidths: widths,
            mergeCells: mergeCells,
            cellMetas: cells
        }
    }


    _getStylesEx(meta) {
        var ret = {};
        var alignments = this._getAlignmentEx(meta.className);
        if (alignments) {
            ret.alignments = alignments
        }
        this._getFontEx(meta, ret);
        this._getBgColorEx(meta, ret);
        return ret;
    }


    _getBgColorEx(meta, ret) {
        if (meta._style_backgroundColor) {
            ret.backgroundColor = meta._style_backgroundColor;
        }
    }


    _getFontEx(meta, ret) {
        if (meta._style_fontFamily) {
            ret.fontFamily = meta._style_fontFamily;
        }
        if (meta._style_fontSize) {
            ret.fontSize = meta._style_fontSize;
        }
        if (meta.className && meta.className.contains('ssd-font-italic')) {
            ret.fontStyle = 'italic';
        }
        if (meta.className && meta.className.contains('ssd-font-bold')) {
            ret.fontWeight = 'bold';
        }
        if (meta.className && meta.className.contains('ssd-font-underline')) {
            ret.textDecoration = 'underline';
        }
        if (meta._style_color) {
            ret.color = meta._style_color;
        }
    }


    _getAlignmentEx(className) {
        var alignment = [];
        if (className) {
            className.contains('htLeft') && alignment.push('Left');
            className.contains('htCenter') && alignment.push('Center');
            className.contains('htRight') && alignment.push('Right');
            className.contains('htJustify') && alignment.push('Justify');
            className.contains('htTop') && alignment.push('Top');
            className.contains('htMiddle') && alignment.push('Middle');
            className.contains('htBottom') && alignment.push('Bottom');
        }
        return alignment.length ? alignment : false;
    }


    _getSizeEx() {
        var hot = this.handsontable;
        var cols = Math.max(hot.countCols() - hot.countEmptyCols(true), 20);
        var rows = Math.max(hot.countRows() - hot.countEmptyRows(true), 50);
        var heights = [];
        var widths = [];

        for (let i = 0; i < rows; ++i) {
            let h = hot.getRowHeight(i);
            if (i === 0 && !h) { // handsontable bug
                h = 24;
            }
            heights.push(h);
        }
        for (let i = 0; i < cols; ++i) {
            widths.push(hot.getColWidth(i));
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
                let _meta = hot.getCellMeta(i, j);
                let _data = hot.getDataAtCell(i, j);
                let _cellMata = {};

                _cellMata.row = i;
                _cellMata.col = j;
                _cellMata.isFormula = !!(_sourceData && (_sourceData + '').charAt(0) === '=');
                _cellMata.sourceValue = _sourceData;
                _cellMata.value = _data;

                (function (o, m) {
                    //noinspection JSUnusedLocalSymbols,LoopStatementThatDoesntLoopJS
                    for (var x in o) {
                        m.styles = o;
                        return;
                    }
                }(this._getStylesEx(_meta), _cellMata));

                // TODO dataType
                rowResult.push(_sourceData);
                rowCellMeta.push(_cellMata);
            }
            data.push(rowResult);
            cells.push(rowCellMeta);
        }
        return {data, cells};
    }

    // TODO
    _getBordersEx() {

    }
};