/**
 * 配置翻译类。
 * 框架内部使用，用户代码不应该调用它。
 *
 * @private
 */
class ConfigTranslator {

    /**
     * 构造器
     *
     * @param {object} config
     * @param {Sheet} sheet
     */
    constructor(config, sheet) {
        this.initialConfig = config;
        this.sheet = sheet;
    }


    /**
     * 翻译配置。
     * 中间数据格式的设计会尽量同时保证在 Excel 及 Web 页面中均便于处理，
     * 但不免存在一些 Web 中难以直接使用的数据格式，该方法即是完成此类数据格式
     * 的适配转换工作。
     *
     * @returns {object}
     */
    translate() {
        var settings = {};
        var proto = Object.getPrototypeOf(this);
        var property = Object.getOwnPropertyNames(proto);

        for (let i = 0; i < property.length; ++i) {
            if (property[i].startsWith('_trans')) {
                this[property[i]].call(this, settings);
            }
        }
        return settings;
    }

    /**
     * handsontable 中的一些状态无法通过初始配置参数控制，
     * 只能在实例化之后调用相应的方法来恢复相应的状态，此方法
     * 即是完成该功能。
     */
    initSheetState() {
        var proto = Object.getPrototypeOf(this);
        var property = Object.getOwnPropertyNames(proto);

        for (let i = 0; i < property.length; ++i) {
            if (property[i].startsWith('_init')) {
                this[property[i]].call(this);
            }
        }
    }

    // ------------------------ translate ------------------------------

    _transCell(settings) {
        var m = this.initialConfig.cellMetas;
        if (m) {
            settings.cell = [];
            for (let i = 0; i < m.length; ++i) {
                let row = m[i];
                for (let j = 0; j < row.length; ++j) {
                    let cellMeta = row[j];
                    if (cellMeta) {
                        let cell = {};
                        cell.row = cellMeta.row;
                        cell.col = cellMeta.col;

                        // dataType
                        if (cellMeta.dataType) {
                            for (var dt in cellMeta.dataType) {
                                if (cellMeta.dataType.hasOwnProperty(dt)) {
                                    cell[dt] = cellMeta.dataType[dt];
                                }
                            }
                            cell.type = cellMeta.dataType.typeName;
                            delete cell.typeName;
                        }

                        // styles
                        if (cellMeta.styles) {
                            if (cellMeta.styles.alignments) {
                                let c = cellMeta.styles.alignments.join(' ht');
                                cell.className = cell.className ? (cell.className += ' ht' + c) : 'ht' + c;
                            }
                            if (cellMeta.styles.fontFamily) {
                                cell._style_fontFamily = cellMeta.styles.fontFamily;
                            }
                            if (cellMeta.styles.fontSize) {
                                cell._style_fontSize = cellMeta.styles.fontSize;
                            }
                            if (cellMeta.styles.color) {
                                cell._style_color = cellMeta.styles.color;
                            }
                            if (cellMeta.styles.backgroundColor) {
                                cell._style_backgroundColor = cellMeta.styles.backgroundColor;
                            }
                            if (cellMeta.styles.fontStyle) {
                                cell.className = cell.className
                                    ? (cell.className += ' ssd-font-' + cellMeta.styles.fontStyle)
                                    : 'ssd-font-' + cellMeta.styles.fontStyle;
                            }
                            if (cellMeta.styles.fontWeight) {
                                cell.className = cell.className
                                    ? (cell.className += ' ssd-font-bold')
                                    : 'ssd-font-bold';
                            }
                            if (cellMeta.styles.textDecoration) {
                                cell.className = cell.className
                                    ? (cell.className += ' ssd-font-underline')
                                    : 'ssd-font-underline';
                            }
                        }
                        settings.cell.push(cell);
                    }
                }
            }
        }
    }

    _transData(settings) {
        var s = this.initialConfig.data;
        if (s) {
            // hotTable 在有 data 的情况下只能显示有数据的行列，这对于设计器来说并不方便使用，
            // 故填充空数据以撑起表格至 initRows * initCols 的大小。
            //    if (s.length < this.sheet.initRows) {
            //        let formerCol = s.length;
            //        s.length = this.sheet.initRows;
            //        s.fill([], formerCol);
            //    }
            //    for (let i = 0; i < s.length; ++i) {
            //        let row = s[i];
            //        if (row.length < this.sheet.initCols) {
            //            let formerRow = row.length;
            //            row.length = this.sheet.initCols;
            //            row.fill('', formerRow);
            //        }
            //    }

            // 使用 hot API 完成上述功能
            settings.minRows = this.sheet.initRows;
            settings.minCols = this.sheet.initCols;

            settings.data = s;
        }
    }

    // 列宽
    _transColWidths(settings) {
        var w = this.initialConfig.colWidths;
        if (w) {
            settings.colWidths = w;
        }
    }

    // 行高
    _transRowHeights(settings) {
        var h = this.initialConfig.rowHeights;
        if (h) {
            settings.rowHeights = h;
        }
    }

    // 边框
    _transBorders(settings) {
        var s = this.initialConfig.borders;
        if (s) {
            settings.customBorders = s;
        }
    }

    // 合并单元格
    _transMergeCells(settings) {
        var s = this.initialConfig.mergeCells;
        if (s) {
            settings.mergeCells = s;
        }
    }

    // ------------------------ initState ------------------------------

    // 选区
    _initSelection() {
        var s = this.initialConfig.selection;
        if (s) {
            this.sheet.select(s.row, s.col, s.endRow, s.endCol);
        } else {
            this.sheet.select(0, 0);
        }
    }

}

export default ConfigTranslator;