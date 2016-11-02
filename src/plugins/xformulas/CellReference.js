import BaseCell from './BaseCell';
import {toLabel} from './parser/utils';

class CellReference extends BaseCell {
    constructor(row, column) {
        super(row, column);
    }

    toString() {
        return toLabel(
            {index: this.row, isAbsolute: false},
            {index: this.column, isAbsolute: false}
        );
    }
}

export {CellReference};
