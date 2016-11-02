import {SpreadSheetError} from '../SpreadSheetError'

export function XPluginError(value) {
    this.name = 'XPluginError';
    this.message = value;
}
XPluginError.prototype = new SpreadSheetError();
XPluginError.prototype.constructor = XPluginError;