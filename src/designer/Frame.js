import ContextMenu from './frame/ContextMenu'

/**
 * 电子表格设计器中，除了 Workbook 外的组件管理器，
 * 包含菜单栏、工具栏、侧边栏、右键菜单等等。
 */
class Frame {

    constructor(instance, config) {
        this.spreadSheet = instance;
        /**
         *
         * @type {ContextMenu}
         */
        this.contextMenu = new ContextMenu(instance);
    }

    _getExchange() {

    }

}

export default Frame;