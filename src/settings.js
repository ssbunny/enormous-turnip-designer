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
        autoPrefix: '工作表',

        /**
         * sheet 名称中的非法字符。微软没有相关文档，以下是 Apache POI 的说明：
         *
         * Note that sheet name in Excel must not exceed 31 characters
         * and must not contain any of the any of the following characters:
         *    - 0x0000
         *    - 0x0003
         *    - colon (:)
         *    - backslash (\)
         *    - asterisk (*)
         *    - question mark (?)
         *    - forward slash (/)
         *    - opening square bracket ([)
         *    - closing square bracket (])
         *
         */
        sheetName: /[\\/\?\*:\[\]'"]/,

        animated: false
    }

};


/**
 * 默认配置
 */
var defaultSettings = {

    workbook: {
        activeSheet: '工作表1',
        sheets: [{
            name: '工作表1'
        }]
    },

    persistent: true

};

export {globalSettings, defaultSettings};