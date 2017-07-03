import {Coordinate} from '../../utils/common'
import {alignmentItem} from './ContextMenu_alignment'
import {formatItem} from './ContextMenu_format'

/**
 * 电子表格右键菜单。
 */
function ContextMenu(spreadSheet) {
    this.spreadSheet = spreadSheet;
    /**
     *
     * @type {Map}
     */
    this.menuItems = new Map();
    this._init();
}

export default ContextMenu;

ContextMenu.prototype.register = function (key, config, handler) {
    this.menuItems.set(key, {
        config: config,
        handler: handler
    });
};

/**
 * 获取 handsontable 需要的菜单配置项
 */
ContextMenu.prototype.getMenuItems4HotTable = function () {
    if (!this._hotTableItems) {
        this._hotTableItems = {};
        this.menuItems.forEach(({config}, key) => this._hotTableItems[key] = config);
    }
    return this._hotTableItems;
};


/*
 ### handsontable 自带右键功能：###
 row_above
 row_below
 hsep1
 col_left
 col_right
 hsep2
 remove_row
 remove_col
 hsep3
 undo
 redo
 make_read_only
 alignment
 borders
 */
ContextMenu.prototype._init = function () {
    const SEP = '---------';


    this.register('row_above', {
        name: '上方插入一行',
        disabled: function () {
            // 调用者要确保此处 this  为当前 hotTable 实例
            // TODO 限制最大行数
            return false;
        }
    });

    this.register('row_below', {
        name: '下方插入一行'
    });

    this.register('col_left', {
        name: '左侧插入一列'
    });

    this.register('col_right', {
        name: '右侧插入一列'
    });

    this.register('hsep_bt_insert', SEP);

    // FIXME handsontable 自带的删除功能，在存在单元格合并时有BUG，改成自定义逻辑。
    this.register('remove_row', {
        name: '删除选中行',
        disabled: function () {
            // TODO 限制最小行数
            return false;
        }
    });
    this.register('remove_col', {
        name: '删除选中列'
    });

    this.register('hsep_bt_remove', SEP);

    this.register('alignment', alignmentItem());
    //this.register('format', formatItem());

    this.register('hsep_bt_format', SEP);

    this.register('q_merge_cells', {
        name: '单元格合并',
        disabled: function () {
            let [r1, c1, r2, c2] = this.getSelected();
            if (r1 === r2 && c1 === c2) {
                return true;
            }
            return !mergeCompare.call(this, 'isEqual');
        }
    }, function (sheet, start, end) {
        sheet.mergeCells(
            start.row,
            start.col,
            end.row - start.row + 1,
            end.col - start.col + 1
        );
    });


    this.register('q_cancel_merge_cells', {
        name: '取消单元格合并',
        disabled: function () {
            return mergeCompare.call(this, 'isSubset');
        }
    }, function (sheet, start, end) {
        sheet.unMergeCells(
            start.row,
            start.col,
            end.row - start.row + 1,
            end.col - start.col + 1
        );
    });

};


// private
function mergeCompare(type) {
    let merged = this.getSettings().mergeCells;
    if (merged && merged.length) {
        for (let i = 0; i < merged.length; ++i) {
            let {row, col, rowspan, colspan} = merged[i];
            if (Coordinate[type](
                    [row, col, row + rowspan - 1, col + colspan - 1],
                    this.getSelected())) {
                return false;
            }
        }
    }
    return true;
}