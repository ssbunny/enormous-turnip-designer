export default function polyfill(_g) {

    // --------------------------------------------- Number

    if (!_g.Number.isNaN) {
        //noinspection JSPrimitiveTypeWrapperUsage
        _g.Number.isNaN = function (x) {
            return x !== x;
        }
    }


}





