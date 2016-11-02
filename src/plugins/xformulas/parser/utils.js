/* ****************************************** *\
 *                  单元格相关
 * ****************************************** */

const LABEL_EXTRACT_REGEXP = /^([$])?([A-Za-z]+)([$])?([0-9]+)$/;

export function extractLabel(label) {
    if (!LABEL_EXTRACT_REGEXP.test(label)) {
        return [];
    }
    const [, columnAbs, column, rowAbs, row] = label.match(LABEL_EXTRACT_REGEXP);

    return [{
        index: rowLabelToIndex(row),
        label: row,
        isAbsolute: rowAbs === '$'
    }, {
        index: columnLabelToIndex(column),
        label: column,
        isAbsolute: columnAbs === '$'
    }];
}

export function toLabel(row, column) {
    const rowLabel = (row.isAbsolute ? '$' : '') + rowIndexToLabel(row.index);
    const columnLabel = (column.isAbsolute ? '$' : '') + columnIndexToLabel(column.index);
    return columnLabel + rowLabel;
}

const COLUMN_LABEL_BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const COLUMN_LABEL_BASE_LENGTH = COLUMN_LABEL_BASE.length;

export function columnLabelToIndex(label) {
    let result = 0;

    if (label) {
        for (let i = 0, j = label.length - 1; i < label.length; i += 1, j -= 1) {
            result += Math.pow(COLUMN_LABEL_BASE_LENGTH, j) * (COLUMN_LABEL_BASE.indexOf(label[i]) + 1);
        }
    }
    --result;

    return result;
}


export function columnIndexToLabel(column) {
    let result = '';

    while (column >= 0) {
        result = String.fromCharCode(column % COLUMN_LABEL_BASE_LENGTH + 97) + result;
        column = Math.floor(column / COLUMN_LABEL_BASE_LENGTH) - 1;
    }

    return result.toUpperCase();
}


export function rowLabelToIndex(label) {
    let result = parseInt(label, 10);

    if (Number.isNaN(result)) {
        result = -1;
    } else {
        result = Math.max(result - 1, -1);
    }
    return result;
}

export function rowIndexToLabel(row) {
    return row >= 0 ? `${row + 1}` : '';
}


/* ****************************************** *\
 *                  number
 * ****************************************** */

export function toNumber(number) {
    let result;
    if (typeof number === 'number') {
        result = number;
    } else if (typeof number === 'string') {
        result = number.indexOf('.') > -1 ? parseFloat(number) : parseInt(number, 10);
    }
    return result;
}

/**
 * 取负数
 * @param {Number} number
 * @returns {Number}
 */
export function invertNumber(number) {
    return -1 * toNumber(number);
}


/* ****************************************** *\
 *                  string
 * ****************************************** */

export function trimEdges(string, margin = 1) {
    string = string.substring(margin, string.length - margin);
    return string;
}