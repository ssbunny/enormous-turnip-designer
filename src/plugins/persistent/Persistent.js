import {Plugin} from '../Plugin';
import {Storage} from './Storage';

class Persistent extends Plugin {

    constructor(ssd) {
        super(ssd);

        var settings = this.spreadsheet.settings;

        if (settings.persistent === true) {
            // persistent 为 `true` 时，使用默认方案
            /**
             * 电子表格本地持久化时使用的 key
             */
            this.persistentKey = ssd.getId();
        } else {
            // TODO persistent 为对象时，提供 localStorage、session 等方案及超时时间等相关配置
            this.persistentKey = settings.persistent.key;
        }

        this.spreadsheet.settings = Storage.load(this.persistentKey) || settings;

        this._registerMethod('saveState');
    }

    isEnable() {
        return !!this.spreadsheet.getSettings().persistent;
    }

    enable() {
        super.enable();
    }

    destroy() {
        super.destroy();
    }

    saveState() {
        var data = this.spreadsheet.getExchangeData();
        Storage.save(this.persistentKey, data);
    }

}

export default Persistent;