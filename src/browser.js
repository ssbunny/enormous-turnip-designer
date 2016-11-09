import {globalSettings, defaultSettings} from './settings';
import SpreadSheet from './core';

import polyfill from './polyfill';
/*
    import {XFormulas} from './plugins/xformulas/XFormulas';
*/

import {Plugin, registerPlugin} from './plugins/Plugin';
import Persistent from './plugins/persistent/Persistent';


SpreadSheet.globalSettings = globalSettings;
SpreadSheet.defaultSettings = defaultSettings;
SpreadSheet.version = '@@_version_@@';


SpreadSheet.plugins = {
    Plugin: Plugin,
    registerPlugin: registerPlugin
};

// 内置插件
registerPlugin('persistent', Persistent);


// 浏览器环境下的全局变量名。
window.BrickSpreadSheet = SpreadSheet;
polyfill(window);

// TODO 提供更改全局变量名的方法，以防止全局变量冲突。

