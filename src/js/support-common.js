var CS = CS || {};
CS.MD = CS.MD || {};
CS.UI = CS.UI || {};
CS.VARS = CS.VARS || {}; 

CS.VARS.IS_HAND_DEVICE = false;                                    //핸드 드바이스 체크 변수
CS.VARS.IS_MOBILE = false;                                         //디바이스 모바일 변수
CS.VARS.IS_TABLET = false; 
CS.VARS.IS_SIZE = CS.VARS.IS_SIZE || {};                          //반응형시 SIZE OBJECT
CS.VARS.IS_SIZE.MAXMOBILE = 767;                                   //반응형시 MOBILE 최대값
CS.VARS.IS_SIZE.MAXTABLET = 1024;  

CS.UI.elem = {};
CS.UI.elem.$doc = $(document);
CS.UI.elem.$win = $(window);
CS.UI.elem.$html = $('html');
CS.UI.elem.$body = $('body');

/*
* validation cehck
*/
CS.MD.validation = function() {
    function Plugin(el, opt) {
        var self = this;
        self.$el = $(el),
        self.el = el,
        self.errorList = [];
        self.elements;

        var defaults = {
            valid: function() {},
            inValid: function() {}
        };

        self.options = $.extend({}, defaults, opt);
    
        self.elements = self.$el.find('[name]');
    }

    $.extend(Plugin, {
        rules: {
            required: function() {

            },
            email: function() {

            },
            date: function() {

            },
            tel: function() {

            },
            file: function() {

            },
            number: function() {

            },
            alphabet: function() {

            },
            minLength: function() {

            },
            maxLength: function() {

            },
        }
    })

    Plugin.prototype = {
        start: function() {
            var self = this,
                options = self.options;

            self.errorList = [];

            self.elements.each(function(index, item) {
                var $element = $(item);

                self._validationCheck(item);
            });

            if (self.errorList.length) {
                $.each(self.errorList, function(index, item) {
                    self._accessibility(item);
                    self._invalid(item);
                });

                self._focus(self.errorList[0]);

                return false;
            }

            return true;
        },
        _getRules: function(el) {
            var self = this;


        },
        _invalid: function(el) {
            var self = this;

            
        },
        _accessibility: function(el) {
            var self = this;


        },
        _focus: function(el) {
            var self = this,
                $el = $(el);

            if (el.type.indexOf('select') && $el.data('ui_selectbox')) {
                $el.vcSelectbox('open');
            } else {
                $el.focus();
            }
        },
        _validationCheck: function(el) {
            var self = this,
                rules = self._getRules(el),
                rule;

            for (var item in rules) {
                if (rule = Plugin.rules[item]) {
                    if (!rule(el)) {
                        self.errorList.push({
                            rule: item,
                            el: el
                        });
                    } 
                }
            }
        }
    }

    $.fn.validation = function(options){
        return this.each(function() {
            new Plugin(this, options);
        });
    };
}

/*
* 셀렉트박스 타겟
* @option data-url
* @option data-target
* @option callback()
* */
CS.MD.drawOption = function() {

    var pluginName = 'drawOption';

    function Plugin(elem, opt) {
        var _this = this;
            element = this.element = elem;

        var defaults = {};
            
        defaults = $.extend({}, $(element).data(), opt);
    

        function ajaxEventListener() {
            var formData = $(element).serialize();

            $.ajax({
                url: defaults.url,
                method: 'POST',
                dataType: 'json',
                data: formData,
                beforeSend: function(xhr) {
                    // loading bar start
                },
                success: function(data) {
                    if (data) {
                        drawEventListener(data);
                        defaults.callback && defaults.callback(); 
                    }
                },
                error: function(err){
                    console.log(err);
                },
                complete: function() {
                    // loading bar end
                }
            });
        }   
        function drawEventListener(data) {
            var html = '';

            for (var key in data) {
                html += '<option value="'+ key +'">'+ data[key] +'</option>'
            }

            $(defaults.target).html(html);
            $(defaults.target).vcSelectbox('update');
        }
        function setEventListener() {
            $(element).on('change', ajaxEventListener);
        }

        setEventListener();
    }

    Plugin.prototype = {

    };

    $.fn[pluginName] = function(options) {
        var arg = arguments; 

        return this.each(function() {
            var _this = this,
                $this = $(_this),
                plugin = $this.data('plugin_' + pluginName);

            if (!plugin) {
                $this.data('plugin_' + pluginName, new Plugin(this, options));
            } else {
                if (typeof options === 'string' && typeof plugin[options] === 'function') {
                    plugin[options].apply(plugin, [].slice.call(arg, 1));
                }
            }
        });
    }
}();

/*
* 페이징네이션
* */
CS.MD.pagination = function() {
    var pluginName = 'pagination';

    function Plugin(el, opt) {
        var self = this,
            el = self.el = el,
            $el = self.$el = $(el);

        var defaults = {
            page: 1,
            totalCount: 1,
            pageView: 5,
            prevClass: 'prev',
            nextClass: 'next',
            disabledClass: 'disabled',
            lastView: false
        };

        opt = $.extend({}, opt, $el.data());
        self.options = $.extend({}, defaults, opt);

        function _initialize() {
            self.$pageList = $el.find('.page_num');
            self.$prev = $el.find('.' + self.options.prevClass);
            self.$next = $el.find('.' + self.options.nextClass);

            self.pageTotal = Math.ceil(self.options.totalCount / self.options.pageView);

            self._setEvent();
            self._update();
        }

        _initialize();
    }

    Plugin.prototype = {
        _update: function(page) {
            var self = this,
                page = page || self.options.page,
                pageView = self.options.pageView,
                pageTotal = self.pageTotal,
                html = '';

            var startPage = parseInt((page - 1) / pageView) * pageView + 1; 
            var endPage = startPage + pageView - 1;
            if (endPage > pageTotal) {
                endPage = pageTotal;
            }

            for (var i = startPage; i <= endPage; i++) {
                if (page === i) {
                    html += '<strong><span class="blind">현재 페이지</span>' + i + '</strong>';
                } else {
                    html += '<a href="#" data-page="' + i + '" title="' + i + '페이지 보기">' + i + '</a>';
                }
            }

            if (self.options.lastView && (startPage + pageView <= pageTotal)) {
                html += '<span class="dot">...</span>';
                html += '<a href="#" data-page="' + pageTotal + '" title="' + pageTotal + '페이지 보기">' + pageTotal + '</a>';
            }

            if (page > pageView) {
                self.$prev
                    .attr('aria-disabled', false)
                    .removeClass(self.options.disabledClass)
                    .data('page', startPage - 1);
            } else {
                self.$prev
                    .attr('aria-disabled', true)
                    .addClass(self.options.disabledClass)
                    .data('page', '');
            }

            if (startPage + pageView <= pageTotal) {
                self.$next
                    .attr('aria-disabled', false)
                    .removeClass(self.options.disabledClass)
                    .data('page', endPage + 1);
            } else {
                self.$next
                    .attr('aria-disabled', true)
                    .addClass(self.options.disabledClass)
                    .data('page', '');
            }
            
            self.$el.data('pageTotal', pageTotal);

            self.$pageList.html(html);
        },
        update: function(data) {
            var self = this;

            self.options.page = data.page;
            self.options.totalCount = data.totalCount;
            self.pageTotal = Math.ceil(self.options.totalCount / self.options.pageView);

            self._update();
        },
        _setEvent: function() {
            var self = this;
            
            self.$el.on('click', 'a', function(e) {
                e.preventDefault();
                
                var $this = $(this),
                    page = $this.data('page');

                if ($this.hasClass(self.options.disabledClass) || $this.attr('aria-disabled') == true) return;

                if (!(self.options.lastView && ($this.hasClass(self.options.prevClass) || $this.hasClass(self.options.nextClass)))) {
                    self.$el.trigger({
                        type: 'pageClick',
                        page: page
                    });
                } else {    
                    self._update(page);
                }
            });
        }
    }

    $.fn[pluginName] = function(options) {
        var arg = arguments; 

        return this.each(function() {
            var _this = this,
                $this = $(_this),
                plugin = $this.data('plugin_' + pluginName);

            if (!plugin) {
                $this.data('plugin_' + pluginName, new Plugin(this, options));
            } else {
                if (typeof options === 'string' && typeof plugin[options] === 'function') {
                    plugin[options].apply(plugin, [].slice.call(arg, 1));
                }
            }
        });
    }
}();

/* */
CS.MD.filter  = function() {
    var pluginName = 'filter';

    function Plugin(el, opt) {
        var self = this,
            el = self.el = el,
            $el = self.$el = $(el);

        var defaults = {
            
        };

        self.options = $.extend({}, defaults, opt);

        function _initialize() {
            
        }
        function _setEventHandler() {
            
        }

        _initialize();
        _setEventHandler();
    }

    Plugin.prototype = {

    }

    $.fn[pluginName] = function(options) {
        var arg = arguments; 

        return this.each(function() {
            var _this = this,
                $this = $(_this),
                plugin = $this.data('plugin_' + pluginName);

            if (!plugin) {
                $this.data('plugin_' + pluginName, new Plugin(this, options));
            } else {
                if (typeof options === 'string' && typeof plugin[options] === 'function') {
                    plugin[options].apply(plugin, [].slice.call(arg, 1));
                }
            }
        });
    }
}();

/* PSP floating anchor tab */
CS.MD.anchorTab  = function() {
    var pluginName = 'anchorTab';

    function Plugin(el, opt) {
        var self = this,
            el = self.el = el,
            $el = self.$el = $(el);

        var defaults = {
            selectedIndex: 0,
            selectedClass: 'on',
            selectedText: '<span class="blind">선택됨</span>',
            floatingClass: 'floating',
            listSelector: 'ul',
            tabsSelector: 'ul>li>a'
        };

        self.options = $.extend({}, defaults, opt);

        function _initialize() {
            var index;

            self.$contents = $();
            self.$anchors = $el.find(self.options.tabsSelector);
            self.$anchors.each(function(index, anchor) {
                var $anchor = $(anchor),
                    href = $anchor.attr('href');
                
                if (href && $(href).length) {
                    self.$contents = self.$contents.add($(href));
                }
            });

            index = self.$anchors.parent().filter('.' + self.options.selectedClass);
            if (index >= 0) {
                self.options.selectedIndex = index;
            }
            
            self._updateProperty();
            self._select(self.options.selectedIndex);
        }
        function _setEventHandler() {
            self.$anchors.on('click', function(e) { 
                e.preventDefault();
                self.select($(e.currentTarget).parent().index());
            });

            CS.UI.elem.$win.on('scroll resize', function() {
                var $win = CS.UI.elem.$win,
                    scrollTop = $win.scrollTop(),
                    offsetTop = $el.offset().top,
                    floatingClass = self.options.floatingClass,
                    selectedIndex = 0;

                if (scrollTop >= offsetTop) {
                    !$el.hasClass(floatingClass) && $el.addClass(floatingClass);
                
                    self.$contents.each(function(index, content) {
                        var $content = $(content),
                            contOffsetTop = $content.offset().top - self.$el.outerHeight();
    
                        if (scrollTop >= contOffsetTop) {
                            selectedIndex = index;        
                        }
                    });
                    self._active(selectedIndex);
    
                    clearTimeout(self.timeout);
                    self.timeout = setTimeout(function () {
                        self._select(selectedIndex);
                        self.timeout = undefined;
                    }, 400);
                } else if (scrollTop < offsetTop && $el.hasClass(floatingClass)) {
                    $el.removeClass(floatingClass);
                }
            });
        }

        _initialize();
        _setEventHandler();
    }

    Plugin.prototype = {
        _updateProperty: function() {
            var self = this,
                listSelector = self.options.listSelector;
            
            self.$el.find(listSelector).attr('role', 'tablist');
            self.$anchors.each(function(index, anchor) {
                var $anchor = $(anchor),
                    href = $anchor.attr('href'),
                    id = $anchor.attr('id'),
                    $content = $(href);

                $anchor.attr({
                    'aria-controls': href.replace(/\#|\./g,''),
                    'aria-selected': false,
                    'role': 'tab'
                });
                $content.attr({
                    'aria-labelledby': id,
                    'role': 'tabpanel'
                });
            });
        },
        _focus: function() {
            var self = this,
                offsetTop = self.$contents.eq(self.options.selectedIndex).offset().top,
                tabHeight = self.$el.outerHeight();

            $('html, body').stop().animate({
                scrollTop: offsetTop - tabHeight
            }, 500);
        },
        _select: function(selectedIndex) {
            var self = this;
                selectedText = self.options.selectedText;
        
            self.options.selectedIndex = selectedIndex;

            self.$anchors.attr('aria-selected', false).parent().find('.blind').remove();
            self.$anchors.eq(selectedIndex).attr('aria-selected', true).append(selectedText).parent();
        },
        _active: function(index) {
            var self = this,
                selectedClass = self.options.selectedClass;

            self.$anchors.eq(index).parent().addClass(selectedClass).siblings().removeClass(selectedClass);
        },
        select: function(selectedIndex) {
            var self = this;
                
            self._select(selectedIndex);
            self._focus();
        }
    }

    $.fn[pluginName] = function(options) {
        var arg = arguments; 

        return this.each(function() {
            var _this = this,
                $this = $(_this),
                plugin = $this.data('plugin_' + pluginName);

            if (!plugin) {
                $this.data('plugin_' + pluginName, new Plugin(this, options));
            } else {
                if (typeof options === 'string' && typeof plugin[options] === 'function') {
                    plugin[options].apply(plugin, [].slice.call(arg, 1));
                }
            }
        });
    }
}();

/* floating */
CS.MD.floting  = function() {
    var pluginName = 'floating';

    function Plugin(el, opt) {
        var self = this,
            el = self.el = el,
            $el = self.$el = $(el);

        var defaults = {
            floatingClass: 'floating'
        };

        self.options = $.extend({}, defaults, opt);

        function _initialize() {
            
        }
        function _setEventHandler() {
            CS.UI.elem.$win.on('scroll resize', function() {
                var $win = CS.UI.elem.$win,
                    scrollTop = $win.scrollTop(),
                    offsetTop = $el.offset().top,
                    floatingClass = self.options.floatingClass;

                if (scrollTop >= offsetTop) {
                    !$el.hasClass(floatingClass) && $el.addClass(floatingClass);
                } else if (scrollTop < offsetTop && $el.hasClass(floatingClass)) {
                    $el.removeClass(floatingClass);
                }
            });
        }

        _initialize();
        _setEventHandler();
    }

    Plugin.prototype = {

    }

    $.fn[pluginName] = function(options) {
        var arg = arguments; 

        return this.each(function() {
            var _this = this,
                $this = $(_this),
                plugin = $this.data('plugin_' + pluginName);

            if (!plugin) {
                $this.data('plugin_' + pluginName, new Plugin(this, options));
            } else {
                if (typeof options === 'string' && typeof plugin[options] === 'function') {
                    plugin[options].apply(plugin, [].slice.call(arg, 1));
                }
            }
        });
    }
}();


/* VIEWPORT_WIDTH&HEIGHT */
CS.MD.VIEWPORT = function(){
    if(CS.UI.elem.$html.hasClass('safari')) {
        CS.VARS.VIEWPORT_WIDTH = Math.max( CS.UI.elem.$win.width() || 0);
    } else {
        CS.VARS.VIEWPORT_WIDTH = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }
}();

/*
*
* CS.VARS.IS_HAND_DEVICE : 단말기 기준 desktop인 경우 true
* CS.VARS.IS_MOBILE : 단말기 기준 mobile인 경우 true;
* CS.VARS.IS_TABLET : 단말기 기준 tablet인 경우 true;
* CS.VARS.IS_VIEWTYPE : 해상도 기준으로 web, tablet, mobile 구분
*
* */
CS.MD.CHK_DEVICE = function() {
    var mobileInfo = ['Android', 'iPhone', 'iPod', 'iPad', 'BlackBerry', 'Windows CE', 'SAMSUNG', 'LG', 'MOT', 'SonyEricsson'];
    $.each(mobileInfo, function(index){
        if (navigator.userAgent.match(mobileInfo[index]) !== null){
            CS.VARS.IS_HAND_DEVICE = true;
            CS.VARS.IS_MOBILE = true;
        }
    });

    if(CS.VARS.VIEWPORT_WIDTH < CS.VARS.IS_SIZE.MAXMOBILE && CS.VARS.IS_HAND_DEVICE){
        CS.VARS.IS_VIEWTYPE = 'mobile';
    } else if(CS.VARS.VIEWPORT_WIDTH < CS.VARS.IS_SIZE.MAXTABLET && CS.VARS.IS_HAND_DEVICE){
        CS.VARS.IS_VIEWTYPE = 'tablet';
    } else {
        if(CS.VARS.VIEWPORT_WIDTH < CS.VARS.IS_SIZE.MAXMOBILE ) {
            CS.VARS.IS_VIEWTYPE = 'mobile';
        } else if (CS.VARS.VIEWPORT_WIDTH < CS.VARS.IS_SIZE.MAXTABLET ) {
            CS.VARS.IS_VIEWTYPE = 'tablet';
        } else {
            CS.VARS.IS_VIEWTYPE = 'web';
        }
    }

    if(CS.VARS.VIEWPORT_WIDTH >= CS.VARS.IS_SIZE.MAXMOBILE && CS.VARS.IS_MOBILE) {
        CS.VARS.IS_MOBILE = false;
        CS.VARS.IS_TABLET = true;
    }

    CS.VARS.IS_HAND_DEVICE ? $('html').addClass('handy') : $('html').addClass('no-handy');
}();

(function($){
    
    function commonInit(){
        $('.scroll-x').mCustomScrollbar({
            axis:"x",
            advanced:{
                autoExpandHorizontalScroll:true
            }
        });
        $('.scroll-y').mCustomScrollbar({
            axis:"y"
        });

        $('[data-js="floating]').floating();
    }

    document.addEventListener('DOMContentLoaded', commonInit);
})(jQuery);
