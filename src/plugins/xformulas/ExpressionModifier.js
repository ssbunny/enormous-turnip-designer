import {toUpperCaseFormula} from './utils';
import {toLabel, extractLabel} from './parser/utils';
import {default as error, ERROR_REF} from './parser/error';
import localHooks from '../../utils/localHooks';

var arrayEach = Handsontable.helper.arrayEach;
var arrayFilter = Handsontable.helper.arrayFilter;
var mixin = Handsontable.helper.mixin;

const BARE_CELL_STRICT_REGEX = /^\$?[A-Z]+\$?\d+$/;
const BARE_CELL_REGEX = /\$?[A-Z]+\$?\d+/;
const CELL_REGEX = /(?:[^0-9A-Z$: ]|^)\s*(\$?[A-Z]+\$?\d+)\s*(?![0-9A-Z_: ])/g;
const RANGE_REGEX = /\$?[A-Z]+\$?\d+\s*:\s*\$?[A-Z]+\$?\d+/g;
const CELL_AND_RANGE_REGEX = /((?:[^0-9A-Z$: ]|^)\s*(\$?[A-Z]+\$?\d+)\s*(?![0-9A-Z_: ]))|(\$?[A-Z]+\$?\d+\s*:\s*\$?[A-Z]+\$?\d+)/g;


class ExpressionModifier {
    constructor(expression) {

        /**
         * 待修改的表达式
         * @type {String}
         */
        this.expression = '';

        this.cells = [];

        if (typeof expression === 'string') {
            this.setExpression(expression);
        }
    }

    setExpression(expression) {
        this.cells.length = 0;
        this.expression = toUpperCaseFormula(expression);

        this._extractCells();
        this._extractCellsRange();

        return this;
    }

    translate({row: baseRow, column: baseColumn}, {row: deltaRow, column: deltaColumn}) {
        arrayEach(this.cells, (cell) => {
            if (deltaRow != null) {
                ExpressionModifier._translateCell(cell, 'row', baseRow, deltaRow);
            }
            if (deltaColumn != null) {
                ExpressionModifier._translateCell(cell, 'column', baseColumn, deltaColumn);
            }
        });

        return this;
    }

    toString() {
        let expression = this.expression.replace(CELL_AND_RANGE_REGEX, (match, p1, p2) => {
            const isSingleCell = match.indexOf(':') === -1;
            let result = match;
            let cellLabel = match;
            let translatedCellLabel = null;

            if (isSingleCell) {
                cellLabel = BARE_CELL_STRICT_REGEX.test(p1) ? p1 : p2;
            }
            const cell = this._searchCell(cellLabel);

            if (cell) {
                translatedCellLabel = cell.refError ? error(ERROR_REF) : cell.toLabel();

                if (isSingleCell) {
                    result = match.replace(cellLabel, translatedCellLabel);
                } else {
                    result = translatedCellLabel;
                }
            }

            return result;
        });

        if (!expression.startsWith('=')) {
            expression = '=' + expression;
        }

        return expression;
    }

    static _translateCell(cell, property, baseIndex = 0, delta = 0) {
        const {type, start, end} = cell;
        let startIndex = start[property].index;
        let endIndex = end[property].index;
        let deltaStart = delta;
        let deltaEnd = delta;
        let refError = false;
        const indexOffset = Math.abs(delta) - 1;

        // 增加
        if (delta > 0) {
            if (baseIndex > startIndex) {
                deltaStart = 0;
            }
            if (baseIndex > endIndex) {
                deltaEnd = 0;
            }
        } else { // 删除
            if (startIndex >= baseIndex && endIndex <= baseIndex + indexOffset) {
                refError = true;
            }
            if (!refError && type === 'cell') {
                if (baseIndex >= startIndex) {
                    deltaStart = 0;
                    deltaEnd = 0;
                }
            }
            if (!refError && type === 'range') {
                if (baseIndex >= startIndex) {
                    deltaStart = 0;
                }
                if (baseIndex > endIndex) {
                    deltaEnd = 0;

                } else if (endIndex <= baseIndex + indexOffset) {
                    deltaEnd -= Math.min(endIndex - (baseIndex + indexOffset), 0);
                }
            }
        }

        if (deltaStart && !refError) {
            start[property].index = Math.max(startIndex + deltaStart, 0);
        }
        if (deltaEnd && !refError) {
            end[property].index = Math.max(endIndex + deltaEnd, 0);
        }
        if (refError) {
            cell.refError = true;
        }
    }

    _extractCells() {
        const matches = this.expression.match(CELL_REGEX);

        if (!matches) {
            return;
        }
        arrayEach(matches, (coord) => {
            coord = coord.match(BARE_CELL_REGEX);

            if (!coord) {
                return;
            }
            const [row, column] = extractLabel(coord[0]);

            this.cells.push(this._createCell({row, column}, {row, column}, coord[0]));
        });
    }

    _extractCellsRange() {
        const matches = this.expression.match(RANGE_REGEX);

        if (!matches) {
            return;
        }
        arrayEach(matches, (match) => {
            const [start, end] = match.split(':');
            const [startRow, startColumn] = extractLabel(start);
            const [endRow, endColumn] = extractLabel(end);
            const startCell = {
                row: startRow,
                column: startColumn
            };
            const endCell = {
                row: endRow,
                column: endColumn
            };

            this.cells.push(this._createCell(startCell, endCell, match));
        });
    }


    _searchCell(label) {
        const [cell] = arrayFilter(this.cells, (cell) => cell.origLabel === label);

        return cell || null;
    }

    _createCell(start, end, label) {
        return {
            start,
            end,
            origLabel: label,
            type: label.indexOf(':') === -1 ? 'cell' : 'range',
            refError: false,
            toLabel: function () {
                let label = toLabel(this.start.row, this.start.column);

                if (this.type === 'range') {
                    label += ':' + toLabel(this.end.row, this.end.column);
                }

                return label;
            }
        };
    }
}

mixin(ExpressionModifier, localHooks);

export {ExpressionModifier};