import {Coordinate} from '../../utils/common'
import {MENU} from '../../i18n';

export var mergeCells = {
    name: MENU.S3,
    disabled: function () {
        let [r1, c1, r2, c2] = this.getSelected();
        if (r1 === r2 && c1 === c2) {
            return true;
        }
        return !mergeCompare.call(this, 'isEqual');
    }
};

export function mergeCellsHandler(sheet, start, end) {
    sheet.mergeCells(
        start.row,
        start.col,
        end.row - start.row + 1,
        end.col - start.col + 1
    );
}


export var cancelMergeCells = {
    name: MENU.S4,
    disabled: function () {
        return mergeCompare.call(this, 'isSubset');
    }
};


export function cancelMergeCellsHandler(sheet, start, end) {
    sheet.unMergeCells(
        start.row,
        start.col,
        end.row - start.row + 1,
        end.col - start.col + 1
    );
}

function mergeCompare(type) {
    let merged = this.getSettings().mergeCells;
    if (merged && merged.length) {
        for (let i = 0; i < merged.length; ++i) {
            let {row, col, rowspan, colspan} = merged[i];
            if (Coordinate[type](
                    [row, col, row + rowspan - 1, col + colspan - 1],
                    convertSelection(this.getSelected()))) {
                return false;
            }
        }
    }
    return true;
}

function convertSelection(s) {
    s[0] > s[2] && (s[0] = [s[2], s[2] = s[0]][0]);
    s[1] > s[3] && (s[1] = [s[3], s[3] = s[1]][0]);
    return s;
}
