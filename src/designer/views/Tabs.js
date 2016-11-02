import {innerHTML, outerHeight, outerWidth, empty} from '../../utils/domHelper.js';
import {isEmptyValue, upperCase} from '../../utils/common.js';
import {CaseInsensitiveMap} from '../../utils/dataStructure.js';
import {stopImmediatePropagation} from '../../utils/eventHelper.js';
import {globalSettings} from '../../settings.js';
import {REGEXPS as regExp, WARNS} from '../../const';

const CLASS_CURRENT = 'current';
const CLASS_TABS = 'ssd-tabs';
const CLASS_CONTENT = 'ssd-tabs-content';
const CLASS_SECTION = 'ssd-tabs-section';
const CLASS_NAV = 'ssd-tabs-nav';
const CLASS_UL = 'ssd-tabs-ul';
const CLASS_LI = 'ssd-tabs-li';
const CLASS_FX = 'ssd-tabs-fx';
const NAV_HEIGHT = globalSettings.styles.navHeight;

const animated = false; // TODO 做成配置项

/**
 * workbook 对应的视图，实际的 DOM 构成。
 * @private
 * @param {Workbook} workbook
 * @constructor
 */
function Tabs(workbook) {
    this.workbook = workbook;
    this.liItems = new CaseInsensitiveMap();
    this.sectionItems = new CaseInsensitiveMap();
    this._hotTables = new Map();
    this.rootElement = workbook.spreadSheet.getRootElement();

    this.initDOM();
    this.initBox();
    this.render();
}

Tabs.prototype.render = function () {
    this.rootElement.appendChild(this.TABS);
};

/**
 * @private
 */
Tabs.prototype.initDOM = function () {
    this.TABS = document.createElement('div');
    this.CONTENT = document.createElement('div');
    this.NAV = document.createElement('nav');
    this.UL = document.createElement('ul');

    this.TABS.classList.add(CLASS_TABS);
    this.TABS.id = this.workbook.getId();
    this.CONTENT.classList.add(CLASS_CONTENT);
    this.NAV.classList.add(CLASS_NAV);
    this.UL.classList.add(CLASS_UL);

    this.TABS.appendChild(this.CONTENT);
    this.TABS.appendChild(this.NAV);
    this.NAV.appendChild(this.UL);

    // TODO 增加 sheet 页的 button
    //innerHTML(this.UL, `<li><span></span></li>`);
};

/**
 * @private
 */
Tabs.prototype.initBox = function () {
    var rootEl = this.workbook.spreadSheet.getRootElement();
    this.width = this.workbook.width || outerWidth(rootEl, false);
    this.height = this.workbook.height || outerHeight(rootEl, false);

    this.TABS.style.width = this.width + 'px';
    this.TABS.style.height = this.height + 'px';
};


/**
 * 增加一个 tab 页
 * @param {string} sheetName - sheet 名， 即 tab 页的标题
 */
Tabs.prototype.appendTab = function (sheetName) {
    var that = this;
    var li = document.createElement('li');

    li.innerHTML = `<a href="javascript:;"><span>${sheetName}</span></a>`;
    li.classList.add(CLASS_LI);
    li.setAttribute('data-sheet', sheetName);

    this.UL.appendChild(li);
    this.liItems.set(sheetName, li);

    li.addEventListener('click', function (event) {
        var sheetName = this.dataset.sheet;
        var sheet = that.workbook.getSheet(sheetName);
        sheet.active();
        stopImmediatePropagation(event);
    });

    li.addEventListener('dblclick', function (event) {
        that._onTabDblclick.call(that, this);
        stopImmediatePropagation(event);
    });

    this.appendContent(sheetName);
};

/**
 * @param {HTMLElement} li
 * @private
 */
Tabs.prototype._onTabDblclick = function (li) {
    var that = this;
    var sheetName = li.dataset.sheet;
    var span = li.getElementsByTagName('span')[0];
    var input = document.createElement('input');

    input.setAttribute('type', 'text');
    input.value = sheetName;
    input.classList.add('editorial');
    input.style.width = outerWidth(span) + 20 + 'px'; // 名字太短时不好输入，增补20px

    input.addEventListener('blur', function () {
        var check = that._checkTabName(sheetName, this.value);
        if (check === true) {
            that.workbook.renameSheet(sheetName, this.value);
        } else {
            alert(check); // TODO alert 太丑
            that.tabRenameCancel(sheetName, this.value);
        }
    });
    input.addEventListener('keypress', function (event) {
        if (event.keyCode === 13) {
            this.blur();
        }
    });

    empty(span);
    span.appendChild(input);
    input.select();
};

Tabs.prototype._checkTabName = function (name1, name2) {
    if (isEmptyValue(name2)) {
        return WARNS.S1;
    }
    if (regExp.sheetName.test(name2)) {
        return WARNS.S2;
    }
    // 改成其它已有的sheet名
    if (upperCase(name1) !== upperCase(name2) && this.workbook.isSheetExist(name2)) {
        return WARNS.S3;
    }
    return true;
};

// 改名时，DOM上的一些操作，进入此方法时代表已经做了合法验证。
Tabs.prototype.tabRename = function (name1, name2) {
    var li = this.liItems.get(name1);
    var span = li.getElementsByTagName('span')[0];
    innerHTML(span, name2);
    li.dataset.sheet = name2;
    this.liItems.set(name2, li);
    var section = this.sectionItems.get(name1);
    section.dataset.sheet = name2;
    this.sectionItems.delete(name1);
    this.sectionItems.set(name2, section);

    var sheetNow = this.workbook.getSheet(name2);
    sheetNow.emit('afterRename', sheetNow, name1, name2);
};

// 更名失败，将名字设为 name1, name2为失败的名字
Tabs.prototype.tabRenameCancel = function (name1, name2) {
    var li = this.liItems.get(name1);
    var span = li.getElementsByTagName('span')[0];
    innerHTML(span, name1);

    var sheetNow = this.workbook.getSheet(name1);
    sheetNow.emit('afterRenameCancel', sheetNow, name1, name2);
};


/**
 * 增加标签页对应的内容
 * @param {string} sheetName
 */
Tabs.prototype.appendContent = function (sheetName) {
    var section = document.createElement('section');
    var fx = document.createElement('div');
    var hot = document.createElement('div');

    section.setAttribute('data-sheet', sheetName);
    section.appendChild(fx);
    section.appendChild(hot);
    section.classList.add(CLASS_SECTION);
    animated && section.classList.add('ssd-animated-fast');

    this.CONTENT.appendChild(section);
    this.sectionItems.set(sheetName, section);

    this.appendFx(fx, sheetName);
    this.appendTable(hot, sheetName);
};

/**
 *
 * @param {string} sheetName
 */
Tabs.prototype.hideContent = function (sheetName) {
    var section = this.sectionItems.get(sheetName);
    section.style.display = 'none';
};


/**
 * TODO 公式输入框
 * @private
 * @param {HTMLElement} fx
 * @param {string} sheetName
 */
Tabs.prototype.appendFx = function (fx, sheetName) {
    fx.classList.add(CLASS_FX);
    fx.classList.add(`${CLASS_FX}-${sheetName}`);
};

/**
 * 假渲染 Hansontable 组件。
 * handsontable 的设计无法在DOM中计算视图，必须渲染rootElement之后才能生效。
 * 导致延迟渲染难以实现，有渲染性能问题时再解决。
 * 另外，渲染到先隐藏后显示的元素中时，也无法正常显示。
 * @private
 * @param hot
 * @param sheetName
 */
Tabs.prototype.appendTable = function (hot, sheetName) {
    this._hotTables.set(sheetName, {
        container: hot,
        width: this.width,
        height: () => this.height - NAV_HEIGHT
    });
};

/**
 * 激活指定的标签页
 * @param {string} sheetName - sheet 名
 */
Tabs.prototype.activeTab = function (sheetName) {
    var former = this.TABS.querySelector(`.${CLASS_CURRENT}.${CLASS_LI}`);
    former && former.classList.remove(CLASS_CURRENT);
    var li = this.liItems.get(sheetName);
    li.classList.add(CLASS_CURRENT);
    this.activeContent(sheetName);
};


/**
 * @private
 * @param {string} sheetName - sheet 名
 */
Tabs.prototype.activeContent = function (sheetName) {
    var section = this.sectionItems.get(sheetName);
    var former = Tabs.prototype.activeContent.former;
    if (former) {
        animated && former.classList.remove('fadeIn');
        former.style.display = 'none';
    }
    section.style.display = 'block';
    animated && section.classList.add('fadeIn');

    Tabs.prototype.activeContent.former = section;
};


export default Tabs;