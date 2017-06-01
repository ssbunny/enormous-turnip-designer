var arrayEach = Handsontable.helper.arrayEach;
var defineGetter = Handsontable.helper.defineGetter;

const MIXIN_NAME = 'localHooks';

/**
 * 用来做对象掺和的 hooks.
 *
 * @type {Object}
 */
const localHooks = {

    _localHooks: Object.create(null),

    /**
     * 增加 hook
     *
     * @param {string} key - hook 名
     * @param {Function} callback - 回调
     */
    addLocalHook: function (key, callback) {
        if (!this._localHooks[key]) {
            this._localHooks[key] = [];
        }
        this._localHooks[key].push(callback);
    },

    /**
     * 执行 hooks
     *
     * @param {String} key - hook 名
     * @param {*} params
     */
    runLocalHooks: function (key, ...params) {
        if (this._localHooks[key]) {
            arrayEach(this._localHooks[key], (callback) => callback.apply(this, params));
        }
    },

    /**
     * 清空 hooks
     */
    clearLocalHooks: function () {
        this._localHooks = {};
    }
};

defineGetter(localHooks, 'MIXIN_NAME', MIXIN_NAME, {
    writable: false,
    enumerable: false
});

export default localHooks;