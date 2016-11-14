var textContextSupport = document.createTextNode('test').textContent ? true : false;
var classListSupport = document.documentElement.classList ? true : false;

var REG_HTML_CHARACTERS = /(<(.*)>|&(.*);)/;

/**
 * 能同时兼容文本节点的 innerHTML 方法。
 *
 * @returns {void}
 */
export function innerHTML(element, content) {
    if (REG_HTML_CHARACTERS.test(content)) {
        element.innerHTML = content;
    } else {
        var child = element.firstChild;
        if (child && child.nodeType === 3 && child.nextSibling === null) {
            if (textContextSupport) {
                child.textContent = content;
            } else {
                child.data = content;
            }
        } else {
            empty(element);
            element.appendChild(document.createTextNode(content));
        }
    }
}

/**
 * 在指定节点后插入节点
 * @param element
 * @param content
 */
export function insertAfter(element, content) {
    if (REG_HTML_CHARACTERS.test(content)) {
        element.insertAdjacentHTML('afterend', content);
    } else {
        if (content.nodeType === 1) {
            if (element.nextSibling) {
                element.parentNode.insertBefore(content, element.nextSibling);
            } else {
                element.parentNode.appendChild(content);
            }
        } else {
            // TODO
        }
    }
}


export function closest(element, selector) {
    var ret;
    do {
        element = element.parentNode;
        if (!element || !element.ownerDocument || (ret = element.querySelector(selector))) {
            break;
        }
    } while (element);

    return ret;
}

/**
 * 清空指定元素的所有子节点。
 *
 * @param element
 * @returns {void}
 */
export function empty(element) {
    var child;
    while (child = element.lastChild) { // jshint ignore:line
        element.removeChild(child);
    }
}

/**
 * 返回指定元素的外高度（包括 padding、border 及可选的 margin 值）。
 *
 * @param el
 * @param {Boolean} withMargin - 高度中是否包括 margin 值
 * @returns {number}
 */
export function outerHeight(el, withMargin = true) {
    var height = el.offsetHeight;
    var style;

    if (withMargin === false) {
        return height;
    }
    style = getComputedStyle(el);
    height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    return height;
}


/**
 * 返回指定元素的外宽度（包括 padding、border 及可选的 margin 值）。
 *
 * @param el
 * @param {Boolean} withMargin - 宽度中是否包括 margin 值
 * @returns {number}
 */
export function outerWidth(el, withMargin = true) {
    var width = el.offsetWidth;
    var style;

    if (withMargin === false) {
        return width;
    }
    style = getComputedStyle(el);
    width += parseInt(style.marginLeft) + parseInt(style.marginRight);
    return width;
}

