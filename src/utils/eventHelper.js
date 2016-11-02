/**
 * 阻止其它监听被调用。
 * @param {Event} event
 */
export function stopImmediatePropagation(event) {
    event.isImmediatePropagationEnabled = false;
    event.cancelBubble = true;
}

/**
 * 阻止事件冒泡。
 * @param {Event} event
 */
export function stopPropagation(event) {
    if (typeof event.stopPropagation === 'function') {
        event.stopPropagation();
    } else {
        event.cancelBubble = true;
    }
}