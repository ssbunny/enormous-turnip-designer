/**
 * es6 polyfill
 * @param _g 全局变量（即浏览器环境下的 window 对象）
 */
export default function polyfill(_g) {

    // --------------------------------------------- Number

    if (!_g.Number.isNaN) {
        _g.Number.isNaN = function (x) {
            return x !== x;
        }
    }

    if (typeof _g.String.prototype.contains === 'undefined') {
        _g.String.prototype.contains = function (str) {
            return !!~this.indexOf(str);
        }
    }

}





