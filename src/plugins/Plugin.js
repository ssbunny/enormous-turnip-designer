import {PluginError} from './PluginError'

var _plugins = new Map();

/**
 * 插件基类
 */
class Plugin {

    /**
     *
     * @param {SpreadSheet} spreadSheet
     */
    constructor(spreadSheet) {
        /**
         * @type {SpreadSheet}
         */
        this.spreadsheet = spreadSheet;
        this.enabled = false;
    }

    // 暂时不考虑开放这个方法，用户定义的插件不能扩展 SpreadSheet 的 API
    _registerMethod(name) {
        var proto = this.spreadsheet.constructor.prototype;
        proto[name] = () => this[name]();
    }

    isEnable() {
        return false;
    }

    enable() {

    }

    destroy() {

    }

}

export {Plugin}

export function validatePlugin(p) {
    if (!p.enable) {
        throw new PluginError('插件必须包含启用方法：enable');
    }
    if (!p.destroy) {
        throw new PluginError('插件必须包含销毁方法：destroy');
    }
}

export function registerPlugin(name, plugin) {
    _plugins.set(name, plugin);
    plugin.prototype.__name__ = name;
}

export function getPlugin(name) {
    var p = _plugins.get(name);
    if (!p) {
        throw new PluginError('插件不存在：' + name);
    }
    return p;
}

/**
 * 获取所有插件
 * @returns {Map}
 */
export function getAllPlugins() {
    return _plugins;
}


