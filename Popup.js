const CLASS_POPUP = 'ssd-popup';
const CLASS_TITLE = 'ssd-popup-title';
const CLASS_IFRAME = 'ssd-popup-iframe';
const CLASS_CONTENT = 'ssd-popup-content';
const CLASS_BTN = 'ssd-popup-btn';
const CLASS_CLOSE = 'ssd-popup-close';
const CLASS_MSG = 'ssd-popup-msg';

const CLASS_ANIMATES = [
    'popup-anim',
    'popup-anim-01',
    'popup-anim-02',
    'popup-anim-03',
    'popup-anim-04',
    'popup-anim-05',
    'popup-anim-06'
];

var htmlElement = $('html');
var win = $(window);

var ready = {
    config: {}, end: {}, minIndex: 0, minLeft: [],
    btn: ['&#x786E;&#x5B9A;', '&#x53D6;&#x6D88;'], // 确认、取消
    //五种原始层模式
    type: ['dialog', 'page', 'iframe', 'loading', 'tips']
};

//默认内置方法。
var popup = {
    ie: function () { //ie版本
        var agent = navigator.userAgent.toLowerCase();
        return (!!window.ActiveXObject || "ActiveXObject" in window) ? (
            (agent.match(/msie\s(\d+)/) || [])[1] || '11' //由于ie11并没有msie的标识
        ) : false;
    }(),
    index: (window.popup && window.popup.v) ? 100000 : 0,


    //各种快捷引用
    alert: function (content, options, yes) {
        var type = typeof options === 'function';
        if (type) yes = options;
        return popup.open($.extend({
            content: content,
            yes: yes
        }, type ? {} : options));
    },

    confirm: function (content, options, yes, cancel) {
        var type = typeof options === 'function';
        if (type) {
            cancel = yes;
            yes = options;
        }
        return popup.open($.extend({
            content: content,
            btn: ready.btn,
            yes: yes,
            btn2: cancel
        }, type ? {} : options));
    },

    msg: function (content, options, end) {
        var type = typeof options === 'function',
            rskin = ready.config.skin;
        var skin = (rskin ? rskin + ' ' + rskin + '-msg' : '') || CLASS_MSG;
        var anim = CLASS_ANIMATES.length - 1;
        if (type) end = options;
        return popup.open($.extend({
            content: content,
            time: 3000,
            shade: false,
            skin: skin,
            title: false,
            closeBtn: false,
            btn: false,
            resize: false,
            end: end
        }, (type && !ready.config.skin) ? {
            skin: skin + ' ssd-popup-hui',
            anim: anim
        } : function () {
            options = options || {};
            if (options.icon === -1 || options.icon === undefined && !ready.config.skin) {
                options.skin = skin + ' ' + (options.skin || 'ssd-popup-hui');
            }
            return options;
        }()));
    },

    load: function (icon, options) {
        return popup.open($.extend({
            type: 3,
            icon: icon || 0,
            resize: false,
            shade: 0.01
        }, options));
    },

    tips: function (content, follow, options) {
        return popup.open($.extend({
            type: 4,
            content: [content, follow],
            closeBtn: false,
            time: 3000,
            shade: false,
            resize: false,
            fixed: false,
            maxWidth: 210
        }, options));
    }
};

var Class = function (setings) {
    var that = this;
    that.index = ++popup.index;
    that.config = $.extend({}, that.config, ready.config, setings);
    document.body ? that.creat() : setTimeout(function () {
        that.creat();
    }, 50);
};

Class.pt = Class.prototype;


//默认配置
Class.pt.config = {
    type: 0,
    shade: 0.3,
    fixed: true,
    move: `.${CLASS_TITLE}`,
    title: '&#x4FE1;&#x606F;', // 信息
    offset: 'auto',
    area: 'auto',
    closeBtn: 1,
    time: 0, //0表示不自动关闭
    zIndex: 19891014,
    maxWidth: 360,
    anim: 0,
    icon: -1,
    moveType: 1,
    resize: true,
    scrollbar: true, //是否允许浏览器滚动条
    tips: 2
};

//容器
Class.pt.vessel = function (conType, callback) {
    var that = this,
        times = that.index,
        config = that.config;
    var zIndex = config.zIndex + times,
        titype = typeof config.title === 'object';
    var ismax = config.maxmin && (config.type === 1 || config.type === 2);
    var titleHTML = (config.title ? '<div class="ssd-popup-title" style="' + (titype ? config.title[1] : '') + '">'
    + (titype ? config.title[0] : config.title)
    + '</div>' : '');

    config.zIndex = zIndex;
    callback([
        //遮罩
        config.shade ? ('<div class="ssd-popup-shade" id="ssd-popup-shade' + times + '" times="' + times + '" style="' + ('z-index:' + (zIndex - 1) + '; background-color:' + (config.shade[1] || '#000') + '; opacity:' + (config.shade[0] || config.shade) + '; filter:alpha(opacity=' + (config.shade[0] * 100 || config.shade * 100) + ');') + '"></div>') : '',

        //主体
        '<div class="' + CLASS_POPUP + (' ssd-popup-' + ready.type[config.type]) + (((config.type == 0 || config.type == 2) && !config.shade) ? ' ssd-popup-border' : '') + ' ' + (config.skin || '') + '" id="' + CLASS_POPUP + times + '" type="' + ready.type[config.type] + '" times="' + times + '" showtime="' + config.time + '" conType="' + (conType ? 'object' : 'string') + '" style="z-index: ' + zIndex + '; width:' + config.area[0] + ';height:' + config.area[1] + (config.fixed ? '' : ';position:absolute;') + '">'
        + (conType && config.type != 2 ? '' : titleHTML)
        + '<div id="' + (config.id || '') + '" class="ssd-popup-content' + ((config.type == 0 && config.icon !== -1) ? ' ssd-popup-padding' : '') + (config.type == 3 ? ' ssd-popup-loading' + config.icon : '') + '">'
        + (config.type == 0 && config.icon !== -1 ? '<i class="ssd-popup-ico ssd-popup-ico' + config.icon + '"></i>' : '')
        + (config.type == 1 && conType ? '' : (config.content || ''))
        + '</div>'
        + '<span class="ssd-popup-setwin">' + function () {
            var closebtn = ismax ? '<a class="ssd-popup-min" href="javascript:;"><cite></cite></a><a class="ssd-popup-ico ssd-popup-max" href="javascript:;"></a>' : '';
            config.closeBtn && (closebtn += '<a class="ssd-popup-ico ' + CLASS_CLOSE + ' ' + CLASS_CLOSE + (config.title ? config.closeBtn : (config.type == 4 ? '1' : '2')) + '" href="javascript:;"></a>');
            return closebtn;
        }() + '</span>'
        + (config.btn ? function () {
            var button = '';
            typeof config.btn === 'string' && (config.btn = [config.btn]);
            for (var i = 0, len = config.btn.length; i < len; i++) {
                button += '<a class="' + CLASS_BTN + '' + i + '">' + config.btn[i] + '</a>'
            }
            return '<div class="' + CLASS_BTN + ' ssd-popup-btn-' + (config.btnAlign || '') + '">' + button + '</div>'
        }() : '')
        + (config.resize ? '<span class="ssd-popup-resize"></span>' : '')
        + '</div>'
    ], titleHTML, $('<div class="ssd-popup-move"></div>'));
    return that;
};

//创建骨架
Class.pt.creat = function () {
    var that = this
        , config = that.config
        , times = that.index, nodeIndex
        , content = config.content
        , conType = typeof content === 'object'
        , body = $('body');

    if ($('#' + config.id)[0])  return;

    if (typeof config.area === 'string') {
        config.area = config.area === 'auto' ? ['', ''] : [config.area, ''];
    }

    //anim兼容旧版shift
    if (config.shift) {
        config.anim = config.shift;
    }

    if (popup.ie == 6) {
        config.fixed = false;
    }

    switch (config.type) {
        case 0:
            config.btn = ('btn' in config) ? config.btn : ready.btn[0];
            popup.closeAll('dialog');
            break;
        case 2:
            var content = config.content = conType ? config.content : [config.content, 'auto'];
            config.content = '<iframe scrolling="' + (config.content[1] || 'auto') + '" allowtransparency="true" id="' + CLASS_IFRAME + '' + times + '" name="' + CLASS_IFRAME + '' + times + '" onload="this.className=\'\';" class="ssd-popup-load" frameborder="0" src="' + config.content[0] + '"></iframe>';
            break;
        case 3:
            delete config.title;
            delete config.closeBtn;
            config.icon === -1 && (config.icon === 0);
            popup.closeAll('loading');
            break;
        case 4:
            conType || (config.content = [config.content, 'body']);
            config.follow = config.content[1];
            config.content = config.content[0] + '<i class="ssd-popup-TipsG"></i>';
            delete config.title;
            config.tips = typeof config.tips === 'object' ? config.tips : [config.tips, true];
            config.tipsMore || popup.closeAll('tips');
            break;
    }

    //建立容器
    that.vessel(conType, function (html, titleHTML, moveElem) {
        body.append(html[0]);
        conType ? function () {
            (config.type == 2 || config.type == 4) ? function () {
                $('body').append(html[1]);
            }() : function () {
                if (!content.parents('.' + CLASS_POPUP)[0]) {
                    content.data('display', content.css('display')).show().addClass('ssd-popup-wrap').wrap(html[1]);
                    $('#' + CLASS_POPUP + times).find('.' + CLASS_CONTENT).before(titleHTML);
                }
            }();
        }() : body.append(html[1]);
        $('.ssd-popup-move')[0] || body.append(ready.moveElem = moveElem);
        that.layero = $('#' + CLASS_POPUP + times);
        config.scrollbar || htmlElement.css('overflow', 'hidden').attr('popup-full', times);
    }).auto(times);

    config.type == 2 && popup.ie == 6 && that.layero.find('iframe').attr('src', content[0]);

    //坐标自适应浏览器窗口尺寸
    config.type == 4 ? that.tips() : that.offset();
    if (config.fixed) {
        win.on('resize', function () {
            that.offset();
            (/^\d+%$/.test(config.area[0]) || /^\d+%$/.test(config.area[1])) && that.auto(times);
            config.type == 4 && that.tips();
        });
    }

    config.time <= 0 || setTimeout(function () {
        popup.close(that.index)
    }, config.time);
    that.move().callback();

    //为兼容jQuery3.0的css动画影响元素尺寸计算
    if (CLASS_ANIMATES[config.anim]) {
        that.layero.addClass(CLASS_ANIMATES[config.anim]).data('anim', true);
    }
    ;
};

//自适应
Class.pt.auto = function (index) {
    var that = this, config = that.config, layero = $('#' + CLASS_POPUP + index);
    if (config.area[0] === '' && config.maxWidth > 0) {
        //为了修复IE7下一个让人难以理解的bug
        if (popup.ie && popup.ie < 8 && config.btn) {
            layero.width(layero.innerWidth());
        }
        layero.outerWidth() > config.maxWidth && layero.width(config.maxWidth);
    }
    var area = [layero.innerWidth(), layero.innerHeight()];
    var titHeight = layero.find(`.${CLASS_TITLE}`).outerHeight() || 0;
    var btnHeight = layero.find('.' + CLASS_BTN).outerHeight() || 0;

    function setHeight(elem) {
        elem = layero.find(elem);
        elem.height(area[1] - titHeight - btnHeight - 2 * (parseFloat(elem.css('padding')) | 0));
    }

    switch (config.type) {
        case 2:
            setHeight('iframe');
            break;
        default:
            if (config.area[1] === '') {
                if (config.fixed && area[1] >= win.height()) {
                    area[1] = win.height();
                    setHeight('.' + CLASS_CONTENT);
                }
            } else {
                setHeight('.' + CLASS_CONTENT);
            }
            break;
    }
    return that;
};

//计算坐标
Class.pt.offset = function () {
    var that = this, config = that.config, layero = that.layero;
    var area = [layero.outerWidth(), layero.outerHeight()];
    var type = typeof config.offset === 'object';
    that.offsetTop = (win.height() - area[1]) / 2;
    that.offsetLeft = (win.width() - area[0]) / 2;

    if (type) {
        that.offsetTop = config.offset[0];
        that.offsetLeft = config.offset[1] || that.offsetLeft;
    } else if (config.offset !== 'auto') {

        if (config.offset === 't') { //上
            that.offsetTop = 0;
        } else if (config.offset === 'r') { //右
            that.offsetLeft = win.width() - area[0];
        } else if (config.offset === 'b') { //下
            that.offsetTop = win.height() - area[1];
        } else if (config.offset === 'l') { //左
            that.offsetLeft = 0;
        } else if (config.offset === 'lt') { //左上角
            that.offsetTop = 0;
            that.offsetLeft = 0;
        } else if (config.offset === 'lb') { //左下角
            that.offsetTop = win.height() - area[1];
            that.offsetLeft = 0;
        } else if (config.offset === 'rt') { //右上角
            that.offsetTop = 0;
            that.offsetLeft = win.width() - area[0];
        } else if (config.offset === 'rb') { //右下角
            that.offsetTop = win.height() - area[1];
            that.offsetLeft = win.width() - area[0];
        } else {
            that.offsetTop = config.offset;
        }

    }

    if (!config.fixed) {
        that.offsetTop = /%$/.test(that.offsetTop) ?
        win.height() * parseFloat(that.offsetTop) / 100
            : parseFloat(that.offsetTop);
        that.offsetLeft = /%$/.test(that.offsetLeft) ?
        win.width() * parseFloat(that.offsetLeft) / 100
            : parseFloat(that.offsetLeft);
        that.offsetTop += win.scrollTop();
        that.offsetLeft += win.scrollLeft();
    }

    if (layero.attr('minLeft')) {
        that.offsetTop = win.height() - (layero.find(`.${CLASS_TITLE}`).outerHeight() || 0);
        that.offsetLeft = layero.css('left');
    }

    layero.css({top: that.offsetTop, left: that.offsetLeft});
};

//Tips
Class.pt.tips = function () {
    var that = this, config = that.config, layero = that.layero;
    var layArea = [layero.outerWidth(), layero.outerHeight()], follow = $(config.follow);
    if (!follow[0]) follow = $('body');
    var goal = {
        width: follow.outerWidth(),
        height: follow.outerHeight(),
        top: follow.offset().top,
        left: follow.offset().left
    }, tipsG = layero.find('.ssd-popup-TipsG');

    var guide = config.tips[0];
    config.tips[1] || tipsG.remove();

    goal.autoLeft = function () {
        if (goal.left + layArea[0] - win.width() > 0) {
            goal.tipLeft = goal.left + goal.width - layArea[0];
            tipsG.css({right: 12, left: 'auto'});
        } else {
            goal.tipLeft = goal.left;
        }
        ;
    };

    //辨别tips的方位
    goal.where = [function () { //上
        goal.autoLeft();
        goal.tipTop = goal.top - layArea[1] - 10;
        tipsG.removeClass('ssd-popup-TipsB').addClass('ssd-popup-TipsT').css('border-right-color', config.tips[1]);
    }, function () { //右
        goal.tipLeft = goal.left + goal.width + 10;
        goal.tipTop = goal.top;
        tipsG.removeClass('ssd-popup-TipsL').addClass('ssd-popup-TipsR').css('border-bottom-color', config.tips[1]);
    }, function () { //下
        goal.autoLeft();
        goal.tipTop = goal.top + goal.height + 10;
        tipsG.removeClass('ssd-popup-TipsT').addClass('ssd-popup-TipsB').css('border-right-color', config.tips[1]);
    }, function () { //左
        goal.tipLeft = goal.left - layArea[0] - 10;
        goal.tipTop = goal.top;
        tipsG.removeClass('ssd-popup-TipsR').addClass('ssd-popup-TipsL').css('border-bottom-color', config.tips[1]);
    }];
    goal.where[guide - 1]();

    /* 8*2为小三角形占据的空间 */
    if (guide === 1) {
        goal.top - (win.scrollTop() + layArea[1] + 8 * 2) < 0 && goal.where[2]();
    } else if (guide === 2) {
        win.width() - (goal.left + goal.width + layArea[0] + 8 * 2) > 0 || goal.where[3]()
    } else if (guide === 3) {
        (goal.top - win.scrollTop() + goal.height + layArea[1] + 8 * 2) - win.height() > 0 && goal.where[0]();
    } else if (guide === 4) {
        layArea[0] + 8 * 2 - goal.left > 0 && goal.where[1]()
    }

    layero.find('.' + CLASS_CONTENT).css({
        'background-color': config.tips[1],
        'padding-right': (config.closeBtn ? '30px' : '')
    });
    layero.css({
        left: goal.tipLeft - (config.fixed ? win.scrollLeft() : 0),
        top: goal.tipTop - (config.fixed ? win.scrollTop() : 0)
    });
}

//拖拽层
Class.pt.move = function () {
    var that = this
        , config = that.config
        , _DOC = $(document)
        , layero = that.layero
        , moveElem = layero.find(config.move)
        , resizeElem = layero.find('.ssd-popup-resize')
        , dict = {};

    if (config.move) {
        moveElem.css('cursor', 'move');
    }

    moveElem.on('mousedown', function (e) {
        e.preventDefault();
        if (config.move) {
            dict.moveStart = true;
            dict.offset = [
                e.clientX - parseFloat(layero.css('left'))
                , e.clientY - parseFloat(layero.css('top'))
            ];
            ready.moveElem.css('cursor', 'move').show();
        }
    });

    resizeElem.on('mousedown', function (e) {
        e.preventDefault();
        dict.resizeStart = true;
        dict.offset = [e.clientX, e.clientY];
        dict.area = [
            layero.outerWidth()
            , layero.outerHeight()
        ];
        ready.moveElem.css('cursor', 'se-resize').show();
    });

    _DOC.on('mousemove', function (e) {

        //拖拽移动
        if (dict.moveStart) {
            var X = e.clientX - dict.offset[0]
                , Y = e.clientY - dict.offset[1]
                , fixed = layero.css('position') === 'fixed';

            e.preventDefault();

            dict.stX = fixed ? 0 : win.scrollLeft();
            dict.stY = fixed ? 0 : win.scrollTop();

            //控制元素不被拖出窗口外
            if (!config.moveOut) {
                var setRig = win.width() - layero.outerWidth() + dict.stX
                    , setBot = win.height() - layero.outerHeight() + dict.stY;
                X < dict.stX && (X = dict.stX);
                X > setRig && (X = setRig);
                Y < dict.stY && (Y = dict.stY);
                Y > setBot && (Y = setBot);
            }

            layero.css({
                left: X
                , top: Y
            });
        }

        //Resize
        if (config.resize && dict.resizeStart) {
            var X = e.clientX - dict.offset[0]
                , Y = e.clientY - dict.offset[1];

            e.preventDefault();

            popup.style(that.index, {
                width: dict.area[0] + X
                , height: dict.area[1] + Y
            })
            dict.isResize = true;
        }
    }).on('mouseup', function (e) {
        if (dict.moveStart) {
            delete dict.moveStart;
            ready.moveElem.hide();
            config.moveEnd && config.moveEnd();
        }
        if (dict.resizeStart) {
            delete dict.resizeStart;
            ready.moveElem.hide();
        }
    });

    return that;
};

Class.pt.callback = function () {
    var that = this, layero = that.layero, config = that.config;
    that.openLayer();
    if (config.success) {
        if (config.type == 2) {
            layero.find('iframe').on('load', function () {
                config.success(layero, that.index);
            });
        } else {
            config.success(layero, that.index);
        }
    }

    //按钮
    layero.find('.' + CLASS_BTN).children('a').on('click', function () {
        var index = $(this).index();
        if (index === 0) {
            if (config.yes) {
                config.yes(that.index, layero)
            } else if (config['btn1']) {
                config['btn1'](that.index, layero)
            } else {
                popup.close(that.index);
            }
        } else {
            var close = config['btn' + (index + 1)] && config['btn' + (index + 1)](that.index, layero);
            close === false || popup.close(that.index);
        }
    });

    //取消
    function cancel() {
        var close = config.cancel && config.cancel(that.index, layero);
        close === false || popup.close(that.index);
    }

    //右上角关闭回调
    layero.find('.' + CLASS_CLOSE).on('click', cancel);

    //点遮罩关闭
    if (config.shadeClose) {
        $('#ssd-popup-shade' + that.index).on('click', function () {
            popup.close(that.index);
        });
    }

    //最小化
    layero.find('.ssd-popup-min').on('click', function () {
        var min = config.min && config.min(layero);
        min === false || popup.min(that.index, config);
    });

    //全屏/还原
    layero.find('.ssd-popup-max').on('click', function () {
        if ($(this).hasClass('ssd-popup-maxmin')) {
            popup.restore(that.index);
            config.restore && config.restore(layero);
        } else {
            popup.full(that.index, config);
            setTimeout(function () {
                config.full && config.full(layero);
            }, 100);
        }
    });

    config.end && (ready.end[that.index] = config.end);
};

//需依赖原型的对外方法
Class.pt.openLayer = function () {
    var that = this;

    //置顶当前窗口
    popup.zIndex = that.config.zIndex;
    popup.setTop = function (layero) {
        var setZindex = function () {
            popup.zIndex++;
            layero.css('z-index', popup.zIndex + 1);
        };
        popup.zIndex = parseInt(layero[0].style.zIndex);
        layero.on('mousedown', setZindex);
        return popup.zIndex;
    };
};

ready.record = function (layero) {
    var area = [
        layero.width(),
        layero.height(),
        layero.position().top,
        layero.position().left + parseFloat(layero.css('margin-left'))
    ];
    layero.find('.ssd-popup-max').addClass('ssd-popup-maxmin');
    layero.attr({area: area});
};

ready.rescollbar = function (index) {
    if (htmlElement.attr('popup-full') == index) {
        if (htmlElement[0].style.removeProperty) {
            htmlElement[0].style.removeProperty('overflow');
        } else {
            htmlElement[0].style.removeAttribute('overflow');
        }
        htmlElement.removeAttr('popup-full');
    }
};

/** 内置成员 */

window.popup = popup;

//获取子iframe的DOM
popup.getChildFrame = function (selector, index) {
    index = index || $('.' + CLASS_IFRAME).attr('times');
    return $('#' + CLASS_POPUP + index).find('iframe').contents().find(selector);
};

//得到当前iframe层的索引，子iframe时使用
popup.getFrameIndex = function (name) {
    return $('#' + name).parents('.' + CLASS_IFRAME).attr('times');
};

//iframe层自适应宽高
popup.iframeAuto = function (index) {
    if (!index) return;
    var heg = popup.getChildFrame('html', index).outerHeight();
    var layero = $('#' + CLASS_POPUP + index);
    var titHeight = layero.find(`.${CLASS_TITLE}`).outerHeight() || 0;
    var btnHeight = layero.find('.' + CLASS_BTN).outerHeight() || 0;
    layero.css({height: heg + titHeight + btnHeight});
    layero.find('iframe').css({height: heg});
};

//重置iframe url
popup.iframeSrc = function (index, url) {
    $('#' + CLASS_POPUP + index).find('iframe').attr('src', url);
};

//设定层的样式
popup.style = function (index, options, limit) {
    var layero = $('#' + CLASS_POPUP + index)
        , contElem = layero.find('.ssd-popup-content')
        , type = layero.attr('type')
        , titHeight = layero.find(`.${CLASS_TITLE}`).outerHeight() || 0
        , btnHeight = layero.find('.' + CLASS_BTN).outerHeight() || 0
        , minLeft = layero.attr('minLeft');

    if (type === ready.type[3] || type === ready.type[4]) {
        return;
    }

    if (!limit) {
        if (parseFloat(options.width) <= 260) {
            options.width = 260;
        }
        ;

        if (parseFloat(options.height) - titHeight - btnHeight <= 64) {
            options.height = 64 + titHeight + btnHeight;
        }
        ;
    }

    layero.css(options);
    btnHeight = layero.find('.' + CLASS_BTN).outerHeight();

    if (type === ready.type[2]) {
        layero.find('iframe').css({
            height: parseFloat(options.height) - titHeight - btnHeight
        });
    } else {
        contElem.css({
            height: parseFloat(options.height) - titHeight - btnHeight
            - parseFloat(contElem.css('padding-top'))
            - parseFloat(contElem.css('padding-bottom'))
        })
    }
};

//最小化
popup.min = function (index, options) {
    var layero = $('#' + CLASS_POPUP + index)
        , titHeight = layero.find(`.${CLASS_TITLE}`).outerHeight() || 0
        , left = layero.attr('minLeft') || (181 * ready.minIndex) + 'px'
        , position = layero.css('position');

    ready.record(layero);

    if (ready.minLeft[0]) {
        left = ready.minLeft[0];
        ready.minLeft.shift();
    }

    layero.attr('position', position);

    popup.style(index, {
        width: 180
        , height: titHeight
        , left: left
        , top: win.height() - titHeight
        , position: 'fixed'
        , overflow: 'hidden'
    }, true);

    layero.find('.ssd-popup-min').hide();
    layero.attr('type') === 'page' && layero.find(CLASS_IFRAME).hide();
    ready.rescollbar(index);

    if (!layero.attr('minLeft')) {
        ready.minIndex++;
    }
    layero.attr('minLeft', left);
};

//还原
popup.restore = function (index) {
    var layero = $('#' + CLASS_POPUP + index), area = layero.attr('area').split(',');
    var type = layero.attr('type');
    popup.style(index, {
        width: parseFloat(area[0]),
        height: parseFloat(area[1]),
        top: parseFloat(area[2]),
        left: parseFloat(area[3]),
        position: layero.attr('position'),
        overflow: 'visible'
    }, true);
    layero.find('.ssd-popup-max').removeClass('ssd-popup-maxmin');
    layero.find('.ssd-popup-min').show();
    layero.attr('type') === 'page' && layero.find(CLASS_IFRAME).show();
    ready.rescollbar(index);
};

//全屏
popup.full = function (index) {
    var layero = $('#' + CLASS_POPUP + index), timer;
    ready.record(layero);
    if (!htmlElement.attr('popup-full')) {
        htmlElement.css('overflow', 'hidden').attr('popup-full', index);
    }
    clearTimeout(timer);
    timer = setTimeout(function () {
        var isfix = layero.css('position') === 'fixed';
        popup.style(index, {
            top: isfix ? 0 : win.scrollTop(),
            left: isfix ? 0 : win.scrollLeft(),
            width: win.width(),
            height: win.height()
        }, true);
        layero.find('.ssd-popup-min').hide();
    }, 100);
};

//改变title
popup.title = function (name, index) {
    var title = $('#' + CLASS_POPUP + (index || popup.index)).find(`.${CLASS_TITLE}`);
    title.html(name);
};

//关闭layer总方法
popup.close = function (index) {
    var layero = $('#' + CLASS_POPUP + index), type = layero.attr('type'), closeAnim = 'popup-anim-close';
    if (!layero[0]) return;
    var WRAP = 'ssd-popup-wrap', remove = function () {
        if (type === ready.type[1] && layero.attr('conType') === 'object') {
            layero.children(':not(.' + CLASS_CONTENT + ')').remove();
            var wrap = layero.find('.' + WRAP);
            for (var i = 0; i < 2; i++) {
                wrap.unwrap();
            }
            wrap.css('display', wrap.data('display')).removeClass(WRAP);
        } else {
            //低版本IE 回收 iframe
            if (type === ready.type[2]) {
                try {
                    var iframe = $('#' + CLASS_IFRAME + index)[0];
                    iframe.contentWindow.document.write('');
                    iframe.contentWindow.close();
                    layero.find('.' + CLASS_CONTENT)[0].removeChild(iframe);
                } catch (e) {
                }
            }
            layero[0].innerHTML = '';
            layero.remove();
        }
    };

    if (layero.data('anim')) {
        layero.addClass(closeAnim);
    }

    $('#ssd-popup-moves, #ssd-popup-shade' + index).remove();
    ready.rescollbar(index);
    typeof ready.end[index] === 'function' && ready.end[index]();
    delete ready.end[index];
    if (layero.attr('minLeft')) {
        ready.minIndex--;
        ready.minLeft.push(layero.attr('minLeft'));
    }
    setTimeout(function () {
        remove();
    }, ((popup.ie && popup.ie < 10) || !layero.data('anim')) ? 0 : 200);
};

//关闭所有层
popup.closeAll = function (type) {
    $.each($('.' + CLASS_POPUP), function () {
        var othis = $(this);
        var is = type ? (othis.attr('type') === type) : 1;
        is && popup.close(othis.attr('times'));
        is = null;
    });
};

/**
 拓展模块，layui开始合并在一起
 */

var cache = popup.cache || {}, skin = function (type) {
    return (cache.skin ? (' ' + cache.skin + ' ' + cache.skin + '-' + type) : '');
};

//仿系统prompt
popup.prompt = function (options, yes) {
    var style = '';
    options = options || {};

    if (typeof options === 'function') yes = options;

    if (options.area) {
        var area = options.area;
        style = 'style="width: ' + area[0] + '; height: ' + area[1] + ';"';
        delete options.area;
    }
    var prompt, content = options.formType == 2 ? '<textarea class="ssd-popup-input"' + style + '>' + (options.value || '') + '</textarea>' : function () {
        return '<input type="' + (options.formType == 1 ? 'password' : 'text') + '" class="ssd-popup-input" value="' + (options.value || '') + '">';
    }();

    return popup.open($.extend({
        type: 1
        , btn: ['&#x786E;&#x5B9A;', '&#x53D6;&#x6D88;']
        , content: content
        , skin: 'ssd-popup-prompt' + skin('prompt')
        , maxWidth: win.width()
        , success: function (layero) {
            prompt = layero.find('.ssd-popup-input');
            prompt.focus();
        }
        , resize: false
        , yes: function (index) {
            var value = prompt.val();
            if (value === '') {
                prompt.focus();
            } else if (value.length > (options.maxlength || 500)) {
                popup.tips('&#x6700;&#x591A;&#x8F93;&#x5165;' + (options.maxlength || 500) + '&#x4E2A;&#x5B57;&#x6570;', prompt, {tips: 1});
            } else {
                yes && yes(value, index, prompt);
            }
        }
    }, options));
};

//tab层
popup.tab = function (options) {
    options = options || {};
    var tab = options.tab || {};
    return popup.open($.extend({
        type: 1,
        skin: 'ssd-popup-tab' + skin('tab'),
        resize: false,
        title: function () {
            var len = tab.length, ii = 1, str = '';
            if (len > 0) {
                str = '<span class="ssd-popup-tabnow">' + tab[0].title + '</span>';
                for (; ii < len; ii++) {
                    str += '<span>' + tab[ii].title + '</span>';
                }
            }
            return str;
        }(),
        content: '<ul class="ssd-popup-tabmain">' + function () {
            var len = tab.length, ii = 1, str = '';
            if (len > 0) {
                str = '<li class="ssd-popup-tabli xubox_tab_layer">' + (tab[0].content || 'no content') + '</li>';
                for (; ii < len; ii++) {
                    str += '<li class="ssd-popup-tabli">' + (tab[ii].content || 'no  content') + '</li>';
                }
            }
            return str;
        }() + '</ul>',
        success: function (layero) {
            var btn = layero.find('.ssd-popup-title').children();
            var main = layero.find('.ssd-popup-tabmain').children();
            btn.on('mousedown', function (e) {
                e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
                var othis = $(this), index = othis.index();
                othis.addClass('ssd-popup-tabnow').siblings().removeClass('ssd-popup-tabnow');
                main.eq(index).show().siblings().hide();
                typeof options.change === 'function' && options.change(index);
            });
        }
    }, options));
};

popup.open = function (deliver) {
    var o = new Class(deliver);
    return o.index;
};

