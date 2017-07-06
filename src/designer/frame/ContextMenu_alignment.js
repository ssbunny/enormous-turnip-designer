import {MENU} from '../../i18n';

// https://github.com/handsontable/handsontable/issues/3807
export function alignmentItem() {
    return {
        name: MENU.S5,
        disabled: function () {
            return !(this.getSelectedRange() && !this.selection.selectedHeader.corner);
        },
        submenu: {
            items: [{
                key: 'alignment:left',
                name: function () {
                    let hasClass = checkSelectionConsistency(this.getSelectedRange(), (row, col) => {
                        let className = this.getCellMeta(row, col).className;
                        if (className && className.indexOf('htLeft') !== -1) {
                            return true;
                        }
                    });
                    return hasClass ? markLabelAsSelected(MENU.S6) : MENU.S6;
                },
                callback: function () {
                    let range = this.getSelectedRange();
                    let stateBefore = getAlignmentClasses(range, (row, col) => this.getCellMeta(row, col).className);
                    let type = 'horizontal';
                    let alignment = 'htLeft';
                    this.runHooks('beforeCellAlignment', stateBefore, range, type, alignment);
                    align(range, type, alignment, (row, col) => this.getCellMeta(row, col));
                    this.render();
                },
                disabled: false
            }, {
                key: 'alignment:center',
                name: function () {
                    let hasClass = checkSelectionConsistency(this.getSelectedRange(), (row, col) => {
                        let className = this.getCellMeta(row, col).className;
                        if (className && className.indexOf('htCenter') !== -1) {
                            return true;
                        }
                    });
                    return hasClass ? markLabelAsSelected(MENU.S7) : MENU.S7;
                },
                callback: function () {
                    let range = this.getSelectedRange();
                    let stateBefore = getAlignmentClasses(range, (row, col) => this.getCellMeta(row, col).className);
                    let type = 'horizontal';
                    let alignment = 'htCenter';

                    this.runHooks('beforeCellAlignment', stateBefore, range, type, alignment);
                    align(range, type, alignment, (row, col) => this.getCellMeta(row, col));
                    this.render();
                },
                disabled: false
            }, {
                key: `alignment:right`,
                name: function () {
                    let label = MENU.S8;
                    let hasClass = checkSelectionConsistency(this.getSelectedRange(), (row, col) => {
                        let className = this.getCellMeta(row, col).className;

                        if (className && className.indexOf('htRight') !== -1) {
                            return true;
                        }
                    });

                    if (hasClass) {
                        label = markLabelAsSelected(label);
                    }

                    return label;
                },
                callback: function () {
                    let range = this.getSelectedRange();
                    let stateBefore = getAlignmentClasses(range, (row, col) => this.getCellMeta(row, col).className);
                    let type = 'horizontal';
                    let alignment = 'htRight';

                    this.runHooks('beforeCellAlignment', stateBefore, range, type, alignment);
                    align(range, type, alignment, (row, col) => this.getCellMeta(row, col));
                    this.render();
                },
                disabled: false
            }, {
                key: `alignment:justify`,
                name: function () {
                    let label = MENU.S9;
                    let hasClass = checkSelectionConsistency(this.getSelectedRange(), (row, col) => {
                        let className = this.getCellMeta(row, col).className;

                        if (className && className.indexOf('htJustify') !== -1) {
                            return true;
                        }
                    });

                    if (hasClass) {
                        label = markLabelAsSelected(label);
                    }

                    return label;
                },
                callback: function () {
                    let range = this.getSelectedRange();
                    let stateBefore = getAlignmentClasses(range, (row, col) => this.getCellMeta(row, col).className);
                    let type = 'horizontal';
                    let alignment = 'htJustify';

                    this.runHooks('beforeCellAlignment', stateBefore, range, type, alignment);
                    align(range, type, alignment, (row, col) => this.getCellMeta(row, col));
                    this.render();
                },
                disabled: false
            }, {
                name: '---------'
            }, {
                key: `alignment:top`,
                name: function () {
                    let label = MENU.S10;
                    let hasClass = checkSelectionConsistency(this.getSelectedRange(), (row, col) => {
                        let className = this.getCellMeta(row, col).className;
                        if (className && className.indexOf('htTop') !== -1) {
                            return true;
                        }
                    });

                    if (hasClass) {
                        label = markLabelAsSelected(label);
                    }
                    return label;
                },
                callback: function () {
                    let range = this.getSelectedRange();
                    let stateBefore = getAlignmentClasses(range, (row, col) => this.getCellMeta(row, col).className);
                    let type = 'vertical';
                    let alignment = 'htTop';

                    this.runHooks('beforeCellAlignment', stateBefore, range, type, alignment);
                    align(range, type, alignment, (row, col) => this.getCellMeta(row, col));
                    this.render();
                },
                disabled: false
            }, {
                key: `alignment:middle`,
                name: function () {
                    let label = MENU.S11;
                    let hasClass = checkSelectionConsistency(this.getSelectedRange(), (row, col) => {
                        let className = this.getCellMeta(row, col).className;

                        if (className && className.indexOf('htMiddle') !== -1) {
                            return true;
                        }
                    });

                    if (hasClass) {
                        label = markLabelAsSelected(label);
                    }

                    return label;
                },
                callback: function () {
                    let range = this.getSelectedRange();
                    let stateBefore = getAlignmentClasses(range, (row, col) => this.getCellMeta(row, col).className);
                    let type = 'vertical';
                    let alignment = 'htMiddle';

                    this.runHooks('beforeCellAlignment', stateBefore, range, type, alignment);
                    align(range, type, alignment, (row, col) => this.getCellMeta(row, col));
                    this.render();
                },
                disabled: false
            }, {
                key: `alignment:bottom`,
                name: function () {
                    let label = MENU.S12;
                    let hasClass = checkSelectionConsistency(this.getSelectedRange(), (row, col) => {
                        let className = this.getCellMeta(row, col).className;

                        if (className && className.indexOf('htBottom') !== -1) {
                            return true;
                        }
                    });

                    if (hasClass) {
                        label = markLabelAsSelected(label);
                    }

                    return label;
                },
                callback: function () {
                    let range = this.getSelectedRange();
                    let stateBefore = getAlignmentClasses(range, (row, col) => this.getCellMeta(row, col).className);
                    let type = 'vertical';
                    let alignment = 'htBottom';

                    this.runHooks('beforeCellAlignment', stateBefore, range, type, alignment);
                    align(range, type, alignment, (row, col) => this.getCellMeta(row, col));
                    this.render();
                },
                disabled: false
            }]
        }
    };
}


function checkSelectionConsistency(range, comparator) {
    let result = false;
    if (range) {
        range.forAll(function (row, col) {
            if (comparator(row, col)) {
                result = true;
                return false;
            }
        });
    }
    return result;
}

function markLabelAsSelected(label) {
    return '<span class="selected">' + String.fromCharCode(10003) + '</span>' + label;
}

function getAlignmentClasses(range, callback) {
    const classes = {};
    for (let row = range.from.row; row <= range.to.row; row++) {
        for (let col = range.from.col; col <= range.to.col; col++) {
            if (!classes[row]) {
                classes[row] = [];
            }
            classes[row][col] = callback(row, col);
        }
    }
    return classes;
}

function align(range, type, alignment, cellDescriptor) {
    if (range.from.row === range.to.row && range.from.col === range.to.col) {
        applyAlignClassName(range.from.row, range.from.col, type, alignment, cellDescriptor);
    } else {
        for (let row = range.from.row; row <= range.to.row; row++) {
            for (let col = range.from.col; col <= range.to.col; col++) {
                applyAlignClassName(row, col, type, alignment, cellDescriptor);
            }
        }
    }
}

function applyAlignClassName(row, col, type, alignment, cellDescriptor) {
    let cellMeta = cellDescriptor(row, col);
    let className = alignment;

    if (cellMeta.className) {
        if (type === 'vertical') {
            className = prepareVerticalAlignClass(cellMeta.className, alignment);
        } else {
            className = prepareHorizontalAlignClass(cellMeta.className, alignment);
        }
    }
    cellMeta.className = className;
}


function prepareVerticalAlignClass(className, alignment) {
    if (className.indexOf(alignment) !== -1) {
        return className;
    }
    className = className
        .replace('htTop', '')
        .replace('htMiddle', '')
        .replace('htBottom', '')
        .replace('  ', '');

    className += ' ' + alignment;
    return className;
}

function prepareHorizontalAlignClass(className, alignment) {
    if (className.indexOf(alignment) !== -1) {
        return className;
    }
    className = className
        .replace('htLeft', '')
        .replace('htCenter', '')
        .replace('htRight', '')
        .replace('htJustify', '')
        .replace('  ', '');

    className += ' ' + alignment;

    return className;
}