/**
 * 事件发射器
 *
 * PS: nodejs 的系统类库 Emitter 过大，不适合在浏览器环境使用。故引入一个简易实现。
 * @constructor
 */
function Emitter() {
    // 保持此函数为空，以便于继承
}

Emitter.prototype = {

    /**
     * 订阅事件
     * @param {string} name - 事件名
     * @param {function} callback - 事件回调函数
     * @param [ctx] - 设置调用 callback 时的上下文
     * @returns {Emitter}
     */
    on: function (name, callback, ctx) {
        var e = this.e || (this.e = {});

        (e[name] || (e[name] = [])).push({
            fn: callback,
            ctx: ctx
        });

        return this;
    },

    /**
     * 订阅一次性事件
     * @param {string} name - 事件名
     * @param {function} callback - 事件回调函数
     * @param ctx - 设置调用 callback 时的上下文
     * @returns {*|Emitter}
     */
    once: function (name, callback, ctx) {
        var self = this;

        function listener() {
            self.off(name, listener);
            callback.apply(ctx, arguments);
        }

        listener._ = callback;
        return this.on(name, listener, ctx);
    },

    /**
     * 发射指定事件
     * @param {string} name - 事件名
     * @returns {Emitter}
     */
    emit: function (name) {
        var data = [].slice.call(arguments, 1);
        var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
        var i = 0;
        var len = evtArr.length;

        for (i; i < len; i++) {
            evtArr[i].fn.apply(evtArr[i].ctx, data);
        }

        return this;
    },

    /**
     * 注销事件
     * @param {string} name - 事件名
     * @param {function} [callback] - 绑定事件时的回调函数，如果不指定则注销所有 `name` 事件
     * @returns {Emitter}
     */
    off: function (name, callback) {
        var e = this.e || (this.e = {});
        var evts = e[name];
        var liveEvents = [];

        if (evts && callback) {
            for (var i = 0, len = evts.length; i < len; i++) {
                if (evts[i].fn !== callback && evts[i].fn._ !== callback) {
                    liveEvents.push(evts[i]);
                }
            }
        }

        // 防止内存溢出
        (liveEvents.length)
            ? e[name] = liveEvents
            : delete e[name];

        return this;
    },

    /**
     * 获取全局唯一事件发射器
     */
    getGlobalEmitter:  (function () {
        var instance = new Emitter();
        return () => instance;
    }())
};

export default Emitter;

/**
 * 全局唯一事件发射器
 */
export const GlobalEmitter = Emitter.prototype.getGlobalEmitter();