

// ------------------------------------- object

export function extend(target, extension) {
    objectEach(extension, (value, key) => {
        target[key] = value;
    });
    return target;
}

export function objectEach(object, iteratee) {
    for (let key in object) {
        if (!object.hasOwnProperty || (object.hasOwnProperty && object.hasOwnProperty(key))) {
            if (iteratee(object[key], key, object) === false) {
                break;
            }
        }
    }
    return object;
}

// ------------------------------------- function

var _emptyFn = function () {
};

/**
 * 获取空函数。
 * @param newOne 默认 `false`，当为 `true` 时将返回一个新的空函数。
 * @returns {Function}
 */
export function emptyFunction(newOne = false) {
    if (newOne) {
        return function () {
        };
    }
    return _emptyFn;
}


// ------------------------------------- string


export function upperCase(str) {
    return str.toLocaleUpperCase();
}


/**
 * 生成一个长度为 16 的随机字符串
 * @returns {*}
 */
export function randomString() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + s4() + s4();
}


// ------------------------------------- mixed

/**
 * 判断是否为`空`值。
 * PS：此方法的判断逻辑作为单元格是否为空的依据。
 * @param value
 * @returns {boolean}
 */
export function isEmptyValue(value) {
    return !!(value === '' || value === null || typeof value === 'undefined');
}


// ------------------------------------- coordinate


var c_isEqual = function (r1, r2) {
    return r1[0] === r2[0] && r1[1] === r2[1] && r1[2] === r2[2] && r1[3] === r2[3];
};

var c_intersection = function (r1, r2) {
    var x1 = Math.max(r1[0], r2[0]);
    var y1 = Math.max(r1[1], r2[1]);
    var x2 = Math.min(r1[2], r2[2]);
    var y2 = Math.min(r1[3], r2[3]);

    if (x1 <= x2 && y1 <= y2) {
        return [x1, y1, x2, y2];
    }
    return false;
};

var c_set = function (t) {
    return function (r1, r2) {
        var ins = c_intersection(r1, r2);
        if (ins) {
            return c_isEqual(ins, t === 'sub' ? r1 : r2);
        }
        return false;
    };
};

export var Coordinate = {

    /**
     * 判断坐标范围 r1 是否与 r2 相等。
     * @param {Array} r1
     * @param {int} r1[0] - 坐标范围 r1 的起始行坐标
     * @param {int} r1[1] - 坐标范围 r1 的起始列坐标
     * @param {int} r1[2] - 坐标范围 r1 的终止行坐标
     * @param {int} r1[3] - 坐标范围 r1 的终止列坐标
     * @param {Array} r2
     * @param {int} r2[0] - 坐标范围 r2 的起始行坐标
     * @param {int} r2[1] - 坐标范围 r2 的起始列坐标
     * @param {int} r2[2] - 坐标范围 r2 的终止行坐标
     * @param {int} r2[3] - 坐标范围 r2 的终止列坐标
     * @returns {boolean}
     */
    isEqual: c_isEqual,

    /**
     * 判断坐标范围 r1 是否与 r2 存在交集。
     * @returns {boolean}
     */
    intersection: c_intersection,

    /**
     * 判断坐标范围 r1 是否是 r2 的子集。
     * @returns {boolean}
     */
    isSubset: c_set('sub'),

    /**
     * 判断坐标范围 r1 是否是 r2 的超集。
     * @returns {boolean}
     */
    isSuperset: c_set('sup')
};

// -------------------------------------