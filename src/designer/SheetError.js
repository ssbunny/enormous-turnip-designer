import {SpreadSheetError} from '../SpreadSheetError'

export function SheetError(value) {
    this.name = 'SheetError';
    this.message = value;
}
SheetError.prototype = new SpreadSheetError();
SheetError.prototype.constructor = SheetError;