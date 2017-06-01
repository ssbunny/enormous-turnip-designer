/**
 *
 * @param _g 全局变量（即浏览器环境下的 window 对象）
 */
export default function polyfill(_g) {

    // --------------------------------------------- es6 polyfill

    // Number.isNaN()
    if (!_g.Number.isNaN) {
        _g.Number.isNaN = function (x) {
            return x !== x;
        }
    }

    // String.contains()
    if (typeof _g.String.prototype.contains === 'undefined') {
        _g.String.prototype.contains = function (str) {
            return !!~this.indexOf(str);
        }
    }

    // String.startsWith()
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }


    // --------------------------------------------- IE polyfill

    // HTMLElement.classList
    if (!('classList' in document.documentElement)) {
        Object.defineProperty(HTMLElement.prototype, 'classList', {
            get: function () {
                var self = this;

                function update(fn) {
                    return function (value) {
                        var classes = self.className.split(/\s+/g);
                        var index = classes.indexOf(value);

                        fn(classes, index, value);
                        self.className = classes.join(' ');
                    }
                }

                return {
                    add: update(function (classes, index, value) {
                        if (!~index) {
                            classes.push(value);
                        }
                    }),

                    remove: update(function (classes, index) {
                        if (~index) {
                            classes.splice(index, 1);
                        }
                    }),

                    toggle: update(function (classes, index, value) {
                        if (~index) {
                            classes.splice(index, 1);
                        } else {
                            classes.push(value);
                        }
                    }),

                    contains: function (value) {
                        return !!~self.className.split(/\s+/g).indexOf(value);
                    },

                    item: function (i) {
                        return self.className.split(/\s+/g)[i] || null;
                    }
                };
            }
        });
    }

}





