import BaseCell from './BaseCell';
import {ERROR_REF} from './parser/error';
import {XPluginError} from '../XPluginError';

const STATE_OUT_OFF_DATE = 1;
const STATE_COMPUTING = 2;
const STATE_UP_TO_DATE = 3;
const states = [STATE_OUT_OFF_DATE, STATE_COMPUTING, STATE_UP_TO_DATE];

var arrayFilter = Handsontable.helper.arrayFilter;


class CellValue extends BaseCell {

    static get STATE_OUT_OFF_DATE() {
        return 1;
    }

    static get STATE_COMPUTING() {
        return 2;
    }

    static get STATE_UP_TO_DATE() {
        return 3;
    }

    constructor(row, column) {
        super(row, column);
        this.precedents = [];
        this.value = null;
        this.error = null;
        this.state = CellValue.STATE_UP_TO_DATE;
    }

    setValue(value) {
        this.value = value;
    }

    getValue() {
        return this.value;
    }

    setError(error) {
        this.error = error;
    }

    getError() {
        return this.error;
    }

    hasError() {
        return this.error !== null;
    }

    setState(state) {
        if (states.indexOf(state) === -1) {
            throw new XPluginError(`未知状态: ${state}`);
        }
        this.state = state;
    }

    isState(state) {
        return this.state === state;
    }

    addPrecedent(cellReference) {
        if (this.isEqual(cellReference)) {
            throw Error(ERROR_REF);
        }
        if (!this.hasPrecedent(cellReference)) {
            this.precedents.push(cellReference);
        }
    }

    removePrecedent(cellReference) {
        if (this.isEqual(cellReference)) {
            throw Error(ERROR_REF);
        }
        this.precedents = arrayFilter(this.precedents, (cell) => !cell.isEqual(cellReference));
    }

    getPrecedents() {
        return this.precedents;
    }

    hasPrecedents() {
        return this.precedents.length > 0;
    }

    hasPrecedent(cellReference) {
        return arrayFilter(this.precedents, (cell) => cell.isEqual(cellReference)).length ? true : false;
    }
}

export {CellValue};
