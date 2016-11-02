export default function polyfill(_window) {

    // --------------------------------------------- Number

    if (!_window.Number.isNaN) {
        //noinspection JSPrimitiveTypeWrapperUsage
        _window.Number.isNaN = function (x) {
            return x !== x;
        }
    }


}





