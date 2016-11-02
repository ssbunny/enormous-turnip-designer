import {xPlugins} from './plugins/package.js';
import {globalSettings, defaultSettings} from './settings.js';
import SpreadSheet from './core.js';

SpreadSheet.globalSettings = globalSettings;
SpreadSheet.defaultSettings = defaultSettings;
SpreadSheet.xPlugins = xPlugins;
SpreadSheet.version = '@@_version_@@';


// 浏览器环境下的全局变量名。
window.SpreadSheet = SpreadSheet;


// TODO 提供更改全局变量名的方法，以防止全局变量冲突。

