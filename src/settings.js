/**
 * 全局配置。
 */
var globalSettings = {
    idPrefix: 'brick-ssd-',
    idSuffix4Workbook: '-workbook',

    sheet: {

        /**
         * 自动生成工作表名称时的前缀(工作表1, 工作表2...)
         */
        autoPrefix: '工作表'
    },

    styles: { // 定制主题时需要修改相应配置
        /**
         * Sheet 页标签栏的高度
         */
        // 为了提升渲染性能，无法根据实际高度计算获得此值，固预设。
        navHeight: 30
    }

};

// TODO
var lang = {};


/**
 * 默认配置
 */
var defaultSettings = {

    workbook: {
        activeSheet: '工作表1',
        sheets: [{
            name: '工作表1'
        }]
    }

};

export {globalSettings, defaultSettings, lang};