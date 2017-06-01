/**
 * 公式解析器。
 * 底层的语法解析器使用 jison 生成，参见 http://zaa.ch/jison/
 *
 * 注意: jison 生成的代码使用 AMD 方式导出变量，重新生成后记得改成 ES6 的方式:
 *      `export var Parser = grammar.Parser;`
 *
 * @class Parser
 * @fires Parser#callVariable
 * @fires Parser#callCellValue
 * @fires Parser#callRangeValue
 */

import Emitter from '../../../utils/Emitter';
import evaluateByOperator from './operators';
import {Parser as GrammarParser} from './grammar';
import {trimEdges, toNumber, invertNumber, extractLabel, toLabel} from './utils';
import {default as errorParser, ERROR, ERROR_NAME} from './error';
export {default as SUPPORTED_FORMULAS} from './supported-formulas';

class Parser extends Emitter {
    constructor() {
        super();
        this.parser = new GrammarParser();
        this.parser.yy = {
            toNumber,
            trimEdges,
            invertNumber,
            throwError: (errorName) => Parser._throwError(errorName),
            callVariable: (variable) => this._callVariable(variable),
            evaluateByOperator,
            callFunction: evaluateByOperator,
            cellValue: (value) => this._callCellValue(value),
            rangeValue: (start, end) => this._callRangeValue(start, end),
            cellValueInSheet: (sheetName, value) => this._callCellValueInSheet(sheetName, value),
            rangeValueInSheet: (sheetName, start, end) => this._callRangeValueInSheet(sheetName, start, end),
            parseError: (...args) => Parser._parseError(...args)
        };
        this.variables = Object.create(null);

        this.setVariable('TRUE', true)
            .setVariable('FALSE', false)
            .setVariable('NULL', null);
    }

    /**
     * 解析表达式
     * @param expression
     * @returns {{error: *, result: *}}
     */
    parse(expression) {
        let result = null;
        let error = null;

        try {
            result = this.parser.parse(expression);
        } catch (ex) {
            const message = errorParser(ex.message);
            if (message) {
                error = message;
            } else {
                error = errorParser(ERROR);
            }
        }

        if (result instanceof Error) {
            error = errorParser(result.message) || errorParser(ERROR);
            result = null;
        }

        return {
            error: error,
            result: result
        };
    }

    /**
     * 设置变量
     * @param name
     * @param value
     * @returns {Parser}
     */
    setVariable(name, value) {
        this.variables[name] = value;
        return this;
    }

    getVariable(name) {
        return this.variables[name];
    }

    /**
     * 调用变量值
     * @param name
     * @returns {*}
     * @private
     */
    _callVariable(name) {
        let value = this.getVariable(name);

        this.emit('callVariable', name, (newValue) => {
            if (newValue !== void 0) {
                value = newValue;
            }
        });

        if (value === void 0) {
            throw Error(ERROR_NAME);
        }

        return value;
    }

    /**
     * 调用单元格的值
     * @param {string} label - 例如 `B3`, `B$3`, `B$3`, `$B$3`
     * @returns {*}
     * @private
     */
    _callCellValue(label) {
        const [row, column] = extractLabel(label);
        let value = void 0;

        this.emit('callCellValue', {label, row, column}, (_value) => {
            value = _value;
        });

        return value;
    }

    /**
     * 调用指定 sheet 中单元格的值
     * @param sheetName
     * @param label
     * @returns {*}
     * @private
     */
    _callCellValueInSheet(sheetName, label) {
        const [row, column] = extractLabel(label);
        let value = void 0;

        this.emit('callCellValueInSheet', {sheetName, label, row, column}, (_value) => {
            value = _value;
        });
        return value;
    }

    static _explainCell(startLabel, endLabel) {
        const [startRow, startColumn] = extractLabel(startLabel);
        const [endRow, endColumn] = extractLabel(endLabel);
        let startCell = {};
        let endCell = {};

        if (startRow.index <= endRow.index) {
            startCell.row = startRow;
            endCell.row = endRow;
        } else {
            startCell.row = endRow;
            endCell.row = startRow;
        }

        if (startColumn.index <= endColumn.index) {
            startCell.column = startColumn;
            endCell.column = endColumn;
        } else {
            startCell.column = endColumn;
            endCell.column = startColumn;
        }

        startCell.label = toLabel(startCell.row, startCell.column);
        endCell.label = toLabel(endCell.row, endCell.column);
        return {startCell, endCell};
    }

    /**
     * 调用某范围的单元格值，如 `B3:A1`
     * @param {string} startLabel - 起始标签，如 `B3`
     * @param {string} endLabel - 结束标签，如 `A1`
     * @returns {Array}
     * @private
     */
    _callRangeValue(startLabel, endLabel) {
        var {startCell, endCell} = Parser._explainCell(startLabel, endLabel);
        let value = [];
        this.emit('callRangeValue', startCell, endCell, (_value = []) => {
            value = _value;
        });
        return value;
    }

    /**
     * 调用指定 sheet 中某范围的单元格值，如 `工作表1!B3:A1`
     * @param sheetName
     * @param startLabel
     * @param endLabel
     * @returns {Array}
     * @private
     */
    _callRangeValueInSheet(sheetName, startLabel, endLabel) {
        var {startCell, endCell} = Parser._explainCell(startLabel, endLabel);
        let value = [];
        this.emit('callRangeValueInSheet', sheetName, startCell, endCell, (_value = []) => {
            value = _value;
        });
        return value;
    }

    /**
     *
     * @param errorName
     * @returns {*}
     * @private
     */
    static _throwError(errorName) {
        const parsedError = errorParser(errorName);
        if (parsedError) {
            throw Error(parsedError);
        }
        return errorName;
    }


    // TODO 解析失败时，给用户提供合适的错误信息。
    static _parseError(...args) {
        console.log(args);
    }
}

export {Parser};
