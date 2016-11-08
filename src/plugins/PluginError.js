import {SpreadSheetError} from '../SpreadSheetError'

export function PluginError(value) {
    this.name = 'PluginError';
    this.message = value;
}
PluginError.prototype = new SpreadSheetError();
PluginError.prototype.constructor = PluginError;