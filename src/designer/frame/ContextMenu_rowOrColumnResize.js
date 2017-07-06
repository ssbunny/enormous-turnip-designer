import {MENU} from '../../i18n';

// FIXME hot 处理 rowHeights/colWidths 与 manualRowResize/manualColumnResize 时存在缺陷
// https://github.com/handsontable/handsontable/issues/3301
// https://github.com/handsontable/handsontable/issues/4371
export var rowResize = {
    name: MENU.S1,
    hidden: function () {
        return !this.getSelectedRange() || !this.selection.selectedHeader.rows
    }
};

export function rowResizeHandler(sheet, start, end) {
    var height = []._;

    start.row > end.row && (start.row = [end.row, end.row = start.row][0]);

    for (let i = start.row; i <= end.row; ++i) {
        if (!height) {
            height = sheet.handsontable.getRowHeight(i);
        } else if (height !== sheet.handsontable.getRowHeight(i)) {
            height = false;
            break;
        }
    }

    var val = height === false ? '' : (height || 24);

    if (_UIProvider.prompt) {
        _UIProvider.prompt(MENU.S13, val, function (result) {
            if (result) {
                setRowHeights(sheet, start.row, end.row, result);
            }
        });
    } else {
        let contextMenu = sheet.handsontable.getPlugin('contextMenu');
        contextMenu.close();
        let result = prompt(MENU.S13, val);
        if (result !== null) {
            setRowHeights(sheet, start.row, end.row, result);
        }
    }
}


export var colResize = {
    name: MENU.S2,
    hidden: function () {
        return !this.getSelectedRange() || !this.selection.selectedHeader.cols
    }
};

export function colResizeHandler(sheet, start, end) {
    var width = []._;

    start.col > end.col && (start.col = [end.col, end.col = start.col][0]);

    for (let i = start.col; i <= end.col; ++i) {
        if (!width) {
            width = sheet.handsontable.getColWidth(i);
        } else if (width !== sheet.handsontable.getColWidth(i)) {
            width = false;
            break;
        }
    }

    var val = width === false ? '' : (width || 50);

    if (_UIProvider.prompt) {
        _UIProvider.prompt(MENU.S14, val, function (result) {
            if (result) {
                setColWidths(sheet, start.col, end.col, result);
            }
        });
    } else {
        let contextMenu = sheet.handsontable.getPlugin('contextMenu');
        contextMenu.close();
        let result = prompt(MENU.S14, val);
        if (result !== null) {
            setColWidths(sheet, start.col, end.col, result);
        }
    }
}

function setRowHeights(sheet, start, end, value) {
    value = numbro().unformat(value) || 24;
    let rowHeights = sheet.handsontable.getSettings().rowHeights || [];
    for (let i = start; i <= end; ++i) {
        rowHeights[i] = value;
    }
    sheet.handsontable.updateSettings({rowHeights: rowHeights});
}

function setColWidths(sheet, start, end, value) {
    value = numbro().unformat(value) || 50;
    let colWidths = sheet.handsontable.getSettings().colWidths || [];
    for (let i = start; i <= end; ++i) {
        colWidths[i] = value;
    }
    sheet.handsontable.updateSettings({colWidths: colWidths});
}


