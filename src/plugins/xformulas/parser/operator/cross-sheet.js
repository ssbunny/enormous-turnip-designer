/**
 * 跨工作表的公式求值
 */

export const SYMBOL = '!';

export default function func(sheetName, ...rest) {
    throw("不再使用operators来解析跨工作表的公式");
};

func.SYMBOL = SYMBOL;
