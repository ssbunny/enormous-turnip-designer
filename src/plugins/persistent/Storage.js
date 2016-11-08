/**
 * 存储方案
 */
class Storage {

    static save(key, value) {
        if (typeof value !== 'string') {
            value = JSON.stringify(value);
        }
        window.localStorage.setItem(Storage.PREFIX + key, value);
    }

    static load(key) {
        var val = window.localStorage.getItem(Storage.PREFIX + key);
        try {
            return JSON.parse(val);
        } catch(e) {
            return val;
        }
    }

    static remove(key) {
        if (window.localStorage[Storage.PREFIX + key]) {
            window.localStorage.removeItem(Storage.PREFIX + key);
        }
    }

    static clear() {
        window.localStorage.clear();
    }

}

Storage.PREFIX = '$$storage-';

export {Storage};