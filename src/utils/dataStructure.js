import {upperCase} from './common.js'

/**
 * 大小写不敏感的 Map
 */
class CaseInsensitiveMap {

    constructor(iterable) {
        this._map = new Map(iterable);
        this._keys = {};
    }

    get(key) {
        var acKey = this._keys[upperCase(key)];
        return this._map.get(acKey);
    }

    set(key, value) {
        this._keys[upperCase(key)] = key;
        return this._map.set(key, value);
    }

    has(key) {
        return this._keys[upperCase(key)];
    }

    hasExact(key) {
        return this._map.has(key);
    }

    clear() {
        this._keys = {};
        return this._map.clear();
    }

    delete(key) {
        var acKey = this._keys[upperCase(key)];
        delete this._keys[upperCase(key)];
        return this._map.delete(acKey);
    }

    entries() {
        return this._map.entries();
    }

    forEach(callbackfn, thisArg) {
        return this._map.forEach(callbackfn, thisArg);
    }

    /**
     *
     * @returns {Iterator.<string>}
     */
    keys() {
        return this._map.keys();
    }

    values() {
        return this._map.values();
    }

    toMap() {
        return this._map;
    }

    size() {
        return this._map.size;
    }

}

/**
 * Stack
 */
class Stack {
    constructor(initial = []) {
        this.items = initial;
    }

    push(...items) {
        this.items.push(...items);
    }

    pop() {
        return this.items.pop();
    }

    peek() {
        return this.isEmpty() ? void 0 : this.items[this.items.length - 1];
    }

    isEmpty() {
        return !this.size();
    }

    size() {
        return this.items.length;
    }

}

export {CaseInsensitiveMap, Stack};

