function SpreadSheetError() {
    this.name = 'SpreadSheetError';
    this.message = '发生了错误';
}

SpreadSheetError.prototype = new Error();
SpreadSheetError.prototype.constructor = SpreadSheetError;
SpreadSheetError.prototype.toString = function () {
    return this.name + ' => ' + this.message;
};

export {SpreadSheetError}

