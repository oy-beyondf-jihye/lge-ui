/*!
 * @module vcui.ui.Carousel
 * @license MIT License
 * @description 
 * @copyright VinylC UID Group.
 * @version 1.1
 * 
 * Version: 1.7.1
  Author: Ken Wheeler
    Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues
 */



var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};



vcui.define('ui/carousel', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    var prefixModule = 'ui_carousel_';
    var _N = 'carousel';
    var _V = {
        INDEX: prefixModule + 'index',
        ACTIVE: 'on', //'slick-active',
        ARROW: prefixModule + 'arrow',
        INITIALIZED: prefixModule + 'initialized',
        PLAY: prefixModule + 'play',
        HIDDEN: prefixModule + 'hidden',
        DISABLED: 'disabled',
        DOTS: prefixModule + 'dots',
        SLIDE: prefixModule + 'slide',
        SLIDER: prefixModule + 'slider',
        CLONED: prefixModule + 'cloned',
        TRACK: prefixModule + 'track',
        LIST: prefixModule + 'list',
        LOADING: prefixModule + 'loading',
        CENTER: prefixModule + 'center',
        VISIBLE: prefixModule + 'visible',
        CURRENT: prefixModule + 'current',
        SRONLY: 'blind', //'hide , blind',
        PREV: prefixModule + 'prev',
        NEXT: prefixModule + 'next',
        UNBUILD: 'unbuild'
    };

    function addEventNS(str) {
        var pairs = str.split(' ');
        for (var i = -1, item; item = pairs[++i];) {
            pairs[i] = item + '.' + _N;
        }
        return pairs.join(' ');
    }

    var REGEX_HTML = /^(?:\s*(<[\w\W]+>)[^>]*)$/;
    var instanceUid = 0;
    var componentInitials = {
        animating: false,
        dragging: false,
        autoPlayTimer: null,
        currentDirection: 0,
        currentLeft: null,
        currentSlide: 0,
        direction: 1,
        $dots: null,
        listWidth: null,
        listHeight: null,
        loadIndex: 0,
        $nextArrow: null,
        $prevArrow: null,
        $playButton: null,
        scrolling: false,
        slideCount: null,
        slideWidth: null,
        $slideTrack: null,
        $slides: null,
        sliding: false,
        slideOffset: 0,
        swipeLeft: null,
        swiping: false,
        $list: null,
        touchObject: {},
        transformsEnabled: false,
        unbuilded: false
    };


    var Carousel = core.ui('Carousel', {
        bindjQuery: _N,
        defaults: {
            activeClass: _V.ACTIVE,         // 활성 css 클래스
            dotsSelector: '.' + _V.DOTS,    // 인디케이터 셀렉터
            playSelector: '.' + _V.PLAY,    // 재생 버튼 셀렉터
            carouselTitle: '',              // 제목
            indicatorNoSeparator : /{{no}}/,

            accessibility: true,            // 접근성 속성(aria-)들을 붙일것인가
            adaptiveHeight: false,          // 높이를 유동적으로 할것인가
            appendArrows: '.' + _V.ARROW,   // 좌우 버튼을 넣을 요소
            appendDots: '.' + _V.DOTS,      // 인디케이터를 넣을 요소
            arrows: true,                   // 좌우버튼을 표시할 것인가
            arrowsUpdate: 'disabled',       // or 'toggle', 좌우버튼이 비활성화될 때 처리할 방식
            asNavFor: null,                 // 두 Carousel간에 연동할 때 다른 Carousel 객체
            prevArrow: '.' + _V.PREV,       // 이전 버튼 셀렉터
            nextArrow: '.' + _V.NEXT,       // 이후 버튼 셀렉터
            autoplay: false,                // 자동 재생 여부
            autoplaySpeed: 5000,            // 자동 재생 속도
            centerMode: false,              // 활성화된 슬라이드를 가운데에 위치시킬 것인가...
            centerPadding: '50px',          // centerMode가 true일 때 슬라이드간의 간격
            cssEase: 'ease-in-out',                // css ease
            customPaging: function customPaging(carousel, i) {      // 인디케이터 버튼 마크업
                return $('<button type="button" />').text(i + 1);
            },
            dots: true,                     // 인디케이터 사용 여부
            buildDots: true,
            dotsClass: _V.DOTS,             // 인디케이터 css 클래스
            draggable: true,                // 마우스로 슬라이드가 되도록 허용할 것인가
            easing: 'linear',               // slide easing 타입 easeInOutQuad
            edgeFriction: 0.35,             // infinite:false일 때 끝에 다다랐을 때의 바운싱 효과 크기
            fade: false,                    // 슬라이딩이 아닌 fade in/out으로 할 것인가
            focusOnSelect: false,           // 선택한 요소에 포커싱 사용
            focusOnChange: false,           // 활성화후에 포커싱시킬 것인가
            infinite: true,                 // 무한루프 사용 여부
            initialSlide: 0,                // 처음 로딩시에 활성화시킬 슬라이드 인덱스
            autoScrollActive: false,        // 처음 로딘시 on클래스가 있는 슬라이드로 슬라이드 시킬 것인가
            lazyLoad: 'ondemand',           // or progressive. 지연로딩 방식을 설정
            mobileFirst: false,             // 반응형 모드일 때 모바일 사이즈를 우선으로 할 것인가
            pauseOnHover: true,             // 마우스가 들어왔을 때 잠시 자동재생을 멈출 것인가
            pauseOnFocus: true,             // 포커싱됐을 때 잠시 자동재생을 멈출 것인가
            pauseOnDotsHover: false,        // 인디케이터 영역에 마우스가 들어왔을 때 잠시 자동재생을 멈출 것인가
            respondTo: 'window',            // 반응형모드일 때 어느 요소의 사이즈에 맞출 것인가
            responsive: null,               // 브레이크포인트에 따른 설정값들
            rows: 1,                        // 1보가 크면 그리드모양으로 배치된다.
            rtl: false,                     // right to left
            slide: '.' + _V.TRACK + '>*',   // 슬라이드 셀렉터
            slidesPerRow: 1,                // rows가 1보다 클 경우 행별 슬라이드 수
            slidesToShow: 1,                // 표시할 슬라이드 수
            slidesToScroll: 1,              // 슬라이딩될 때 한번에 움직일 갯수
            speed: 500,                     // 슬라이딩 속도
            swipe: true,                    // 스와이핑 허용 여부
            swipeToSlide: false,            // 사용자가 slidesToScroll과 관계없이 슬라이드로 직접 드래그 또는 스 와이프 할 수 있도록 허용
            touchMove: true,                // 터치로 슬라이드 모션 사용
            touchThreshold: 5,              // 슬라이드를 진행하려면 사용자는 슬라이더의 너비 (1 / touchThreshold) * 너비를 스 와이프해야합니다
            useCSS: true,                   // CSS 전환 활성화 / 비활성화
            useTransform: true,             // CSS 변환 활성화 / 비활성화
            variableWidth: false,           // 가변 너비 슬라이드
            vertical: false,                // 세로 슬라이드 모드
            verticalSwiping: false,         // 수직 스 와이프 모드
            preventVertical: false,         // 슬라이딩 할 때 수직으로 움직이는 걸 막을 것인가.
            waitForAnimate: true,           // 애니메이션을 적용하는 동안 슬라이드를 앞으로 이동하라는 요청을 무시합니다.
            zIndex: 1000,                    // 슬라이드의 zIndex 값 설정, IE9 이하의 경우 유용함
            activeHover: false,
            additionWidth: 0,                // 모듈이 내부 너비를 제대로 계산 못할 때 가감할 너비를 설정
            lastFix : false
        },
        initialize: function initialize(element, options) {

            var self = this;
            var $el = $(element);
            $el.find('.' + _V.NEXT + ', .' + _V.PREV + ', .' + _V.DOTS + ', .' + _V.PLAY).hide();

            
            // if ($el.find('.' + _V.TRACK + '>*').length <= 1) {
            //     $el.find('.' + _V.NEXT + ', .' + _V.PREV + ', .' + _V.DOTS + ', .' + _V.PLAY).hide();
            //     return;
            // }

            if (self.supr(element, options) === false) {
                return;
            }

            core.extend(self, componentInitials);
            if (!self.options.activeClass) {
                self.options.activeClass = _V.ACTIVE;
            }

            

            self.touchObject = {};
            self.activeBreakpoint = null;
            self.animType = null;
            self.animProp = null;
            self.breakpoints = [];
            self.breakpointSettings = [];
            self.cssTransitions = false;
            self.focussed = false;
            self.interrupted = false;
            self.paused = true;
            self.positionProp = null;
            self.respondTo = null;
            self.rowCount = 1;
            self.shouldClick = true;
            self.$slider = $(element);
            self.$slidesCache = null;
            self.slidesToShow = self.options.slidesToShow;
            self.transformType = null;
            self.transitionType = null;
            self.hidden = 'hidden';
            self.visibilityChange = 'visibilitychange';
            self.windowWidth = 0;
            self.windowTimer = null;
            self.currentSlide = self.options.initialSlide;
            self.originalSettings = self.options;
            if (typeof document.mozHidden !== 'undefined') {
                self.hidden = 'mozHidden';
                self.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                self.hidden = 'webkitHidden';
                self.visibilityChange = 'webkitvisibilitychange';
            }

            self.autoPlay = self.autoPlay.bind(self);
            self.autoPlayClear = self.autoPlayClear.bind(self);
            self.autoPlayIterator = self.autoPlayIterator.bind(self);
            self.changeSlide = self.changeSlide.bind(self);
            self.clickHandler = self.clickHandler.bind(self);
            self.selectHandler = self.selectHandler.bind(self);
            self.setPosition = self.setPosition.bind(self);
            self.swipeHandler = self.swipeHandler.bind(self);
            self.keyHandler = self.keyHandler.bind(self);

            self.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            self.htmlExpr = REGEX_HTML;

            /* 무한 롤링 일괄적용
            self.options.infinite = true;            
            if(self.options.responsive){

                var responsiveArr = vcui.array.reduce(self.options.responsive, function (prev, cur) {

                    if(vcui.isString(cur['settings'])){
                        prev.push(cur);
                    }else{
                        var settings = $.extend({}, cur['settings']);
                        settings['infinite'] = true;
                        cur['settings'] = settings;
                        prev.push(cur);
                    }                    
                    return prev;
                }, []);
                self.options.responsive = responsiveArr;
            }
            */


            self.registerBreakpoints();
            self.init(true);

            
        },

        activateADA: function activateADA() {
            var self = this;
            var opt = self.options;

            self.$slideTrack.find('.' + opt.activeClass).attr({
                'aria-hidden': 'false'
            }).find('a, input, button, select').attr({
                'tabindex': ''
            });
        },
        addSlide: function addSlide(markup, index, addBefore) {

            var self = this;
            var opt = self.options;

            if (typeof index === 'boolean') {
                addBefore = index;
                index = null;
            } else if (index < 0 || index >= self.slideCount) {
                return false;
            }

            self.unload();

            if (typeof index === 'number') {
                if (index === 0 && self.$slides.length === 0) {
                    $(markup).appendTo(self.$slideTrack);
                } else if (addBefore) {
                    $(markup).insertBefore(self.$slides.eq(index));
                } else {
                    $(markup).insertAfter(self.$slides.eq(index));
                }
            } else {
                if (addBefore === true) {
                    $(markup).prependTo(self.$slideTrack);
                } else {
                    $(markup).appendTo(self.$slideTrack);
                }
            }

            self.$slides = self.$slideTrack.children(opt.slide);
            // comahead
            self.$slides.css('float', 'left');

            self.$slideTrack.children(opt.slide).detach();

            self.$slideTrack.append(self.$slides);

            self.$slides.each(function (index, element) {
                $(element).attr('data-' + _V.INDEX, index);
            });

            self.$slidesCache = self.$slides;

            self.reinit();
        },
        animateHeight: function animateHeight() {
            var self = this;
            var opt = self.options;

            if (opt.slidesToShow === 1 && opt.adaptiveHeight === true && opt.vertical === false) {
                var targetHeight = self.$slides.eq(self.currentSlide).outerHeight(true);
                /* s : BTOCSITE-8039 WCMS 컴포넌트 개선 요청 건 수정 */
                if(self.$el.hasClass('slide-show-right')) {
                    targetHeight = Math.max(self.$slides.eq(self.currentSlide).outerHeight(true), self.$slides.eq(self.currentSlide+1).outerHeight(true));
                }
                /* e : BTOCSITE-8039 WCMS 컴포넌트 개선 요청 건 수정 */
                self.$list.animate({
                    height: targetHeight
                }, opt.speed);
            }
        },
        animateSlide: function animateSlide(targetLeft, callback) {

            var animProps = {},
                self = this,
                opt = self.options;

            self.animateHeight();

            if (opt.rtl === true && opt.vertical === false) {
                targetLeft = -targetLeft;
            }
            if (self.transformsEnabled === false) {
                if (opt.vertical === false) {
                    self.$slideTrack.animate({
                        left: targetLeft
                    }, opt.speed, opt.easing, callback);
                } else {
                    self.$slideTrack.animate({
                        top: targetLeft
                    }, opt.speed, opt.easing, callback);
                }
            } else {

                if (self.cssTransitions === false) {
                    if (opt.rtl === true) {
                        self.currentLeft = -self.currentLeft;
                    }
                    $({
                        animStart: self.currentLeft
                    }).animate({
                        animStart: targetLeft
                    }, {
                        duration: opt.speed,
                        easing: opt.easing,
                        step: function step(now) {
                            now = Math.ceil(now);
                            if (opt.vertical === false) {
                                animProps[self.animType] = 'translate(' + now + 'px, 0px)';
                                self.$slideTrack.css(animProps);
                            } else {
                                animProps[self.animType] = 'translate(0px,' + now + 'px)';
                                self.$slideTrack.css(animProps);
                            }
                        },
                        complete: function complete() {
                            if (callback) {
                                callback.call();
                            }
                        }
                    });
                } else {

                    self.applyTransition();
                    targetLeft = Math.ceil(targetLeft);

                    if (opt.vertical === false) {
                        animProps[self.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                    } else {
                        animProps[self.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                    }
                    self.$slideTrack.css(animProps);

                    if (callback) {
                        setTimeout(function () {

                            self.disableTransition();

                            callback.call();
                        }, opt.speed);
                    }
                }
            }
        },
        getNavTarget: function getNavTarget() {

            var self = this,
                opt = self.options,
                asNavFor = opt.asNavFor;

            if (asNavFor && asNavFor !== null) {
                asNavFor = $(asNavFor).not(self.$slider);
            }

            return asNavFor;
        },
        asNavFor: function asNavFor(index) {

            var self = this,
                asNavFor = self.getNavTarget();

            if (asNavFor !== null && (typeof asNavFor === 'undefined' ? 'undefined' : _typeof(asNavFor)) === 'object') {
                asNavFor.each(function () {
                    var target = $(this).vcCarousel('instance');
                    if (!target.unbuilded) {
                        target.slideHandler(index, true);
                    }
                });
            }
        },
        applyTransition: function applyTransition(slide) {

            var self = this,
                transition = {},
                opt = self.options;

            if (opt.fade === false) {
                transition[self.transitionType] = self.transformType + ' ' + opt.speed + 'ms ' + opt.cssEase;
            } else {
                transition[self.transitionType] = 'opacity ' + opt.speed + 'ms ' + opt.cssEase;
            }

            if (opt.fade === false) {
                self.$slideTrack.css(transition);
            } else {
                self.$slides.eq(slide).css(transition);
            }
        },
        autoPlay: function autoPlay() {

            var self = this;
            var opt = self.options;

            self.autoPlayClear();

            if (self.slideCount > opt.slidesToShow) {
                self.autoPlayTimer = setInterval(self.autoPlayIterator, opt.autoplaySpeed);
            }
        },
        autoPlayClear: function autoPlayClear() {

            var self = this;

            if (self.autoPlayTimer) {
                clearInterval(self.autoPlayTimer);
            }
        },
        autoPlayIterator: function autoPlayIterator() {

            var self = this,
                opt = self.options,
                slideTo = self.currentSlide + opt.slidesToScroll;


            if (!self.paused && !self.interrupted && !self.focussed) {

                if (opt.infinite === false) {

                    if (self.direction === 1 && self.currentSlide + 1 === self.slideCount - 1) {
                        self.direction = 0;
                    } else if (self.direction === 0) {

                        slideTo = self.currentSlide - opt.slidesToScroll;

                        if (self.currentSlide - 1 === 0) {
                            self.direction = 1;
                        }
                    }
                }

                self.slideHandler(slideTo);
            }

        },
        buildArrows: function buildArrows() {

            var self = this,
                opt = self.options,
                $p,
                $n;

            if (opt.arrows === true) {
                $p = self.$prevArrow = self.$(opt.prevArrow).addClass(_V.ARROW);
                $n = self.$nextArrow = self.$(opt.nextArrow).addClass(_V.ARROW);

                if (self.slideCount > opt.slidesToShow) {

                    $p.removeClass(_V.HIDDEN).removeAttr('aria-hidden tabindex');
                    $n.removeClass(_V.HIDDEN).removeAttr('aria-hidden tabindex');

                    if (self.htmlExpr.test(opt.prevArrow)) {
                        $p.prependTo(opt.appendArrows);
                    }

                    if (self.htmlExpr.test(opt.nextArrow)) {
                        $n.appendTo(opt.appendArrows);
                    }

                    if (opt.infinite !== true) {
                        $p.addClass(_V.DISABLED).prop('disabled', true).attr('aria-disabled', 'true');
                    }
                } else {

                    $p.add(self.$nextArrow).addClass(_V.HIDDEN).attr({
                        'aria-disabled': 'true',
                        'tabindex': '-1'
                    });
                }
            }
        },
        buildDots: function buildDots() {

            var self = this,
                opt = self.options,
                i,
                dots,
                dot,
                cloned;


            if (opt.dots === true) {
                self.$slider.addClass(_V.DOTS);
                if (opt.dotsSelector) {
                    dots = self.$slider.find(opt.dotsSelector).show().addClass('ui_static');
                    if (opt.buildDots === false) {
                        self.$dots = dots;
                        dots.find('li').removeClass(opt.activeClass).first().addClass(opt.activeClass);
                        return;
                    }

                    if (dots.children().length || self.staticDot) {
                        if (self.staticDot) {
                            dot = self.staticDot;
                        } else {
                            dot = dots.children().first();
                            self.staticDot = dot;
                        }
                        dots.empty();
                        if (!opt.carouselTitle) {
                            opt.carouselTitle = dot.find('.' + _V.SRONLY).text();
                        }
                        for (i = 0; i <= self.getDotCount(); i += 1) {
                            dots.append(cloned = dot.clone().removeClass(opt.activeClass));
                           
                            cloned.find('.' + _V.SRONLY).text(opt.carouselTitle.replace(opt.indicatorNoSeparator, i + 1));                           
                            // cloned.find('.' + _V.SRONLY).text(opt.carouselTitle.replace(/{{no}}/, i + 1));
                           
                        }
                        dot = null;
                    } else {
                        for (i = 0; i <= self.getDotCount(); i += 1) {
                            dots.append($('<li />').append(opt.customPaging.call(this, self, i)));
                        }
                    }
                } else {
                    dots = $('<ul />');
                    dots.addClass(opt.dotsClass);
                    dots.appendTo(opt.appendDots);
                    for (i = 0; i <= self.getDotCount(); i += 1) {
                        dots.append($('<li />').append(opt.customPaging.call(this, self, i)));
                    }
                }
                self.$dots = dots;
                dots.find('li').first().addClass(opt.activeClass);
            } else {
                self.$dots = $();
            }
        },
        buildOut: function buildOut() {

            var self = this,
                opt = self.options;

            if (opt.rows > 1) {
                self.$slides = self.$slider.find('.' + _V.TRACK).children().addClass(_V.SLIDE);
            } else {
                self.$slides = self.$slider.find(opt.slide + ':not(' + _V.CLONED + ')').addClass(_V.SLIDE);
            }
            // comahead
            self.$slides.css('float', 'left');

            self.slideCount = self.$slides.length;

            self.$slides.each(function (index, element) {
                $(element).attr('data-' + _V.INDEX, index).data('originalStyling', $(element).attr('style') || '');
            });

            self.$slider.addClass(_V.SLIDER);

            if ((self.$slideTrack = self.$slider.find('.' + _V.TRACK)).length === 0) {
                self.$slideTrack = self.slideCount === 0 ? $('<div class="' + _V.TRACK + '"/>').appendTo(self.$slider) : self.$slides.wrapAll('<div class="' + _V.TRACK + '"/>').parent();
            } else {
                self.$slideTrack.addClass('ui_static');
            }

            if ((self.$list = self.$slider.find('.' + _V.LIST)).length === 0) {
                self.$list = self.$slideTrack.wrap('<div class="' + _V.LIST + '"/>').parent();
            } else {
                self.$list.addClass('ui_static');
            }

            self.$list.css('overflow', 'hidden');
            self.$slideTrack.css('opacity', 0);

            if (opt.centerMode === true || opt.swipeToSlide === true) {
                opt.slidesToScroll = 1;
            }

            $('img[data-lazy]', self.$slider).not('[src]').addClass(_V.LOADING);

            self.setupInfinite();

            self.buildArrows();

            self.buildDots();

            self.updateDots();

            self.setSlideClasses(typeof self.currentSlide === 'number' ? self.currentSlide : 0);

            if (opt.draggable === true) {
                self.$list.addClass('draggable');
            }
        },
        buildRows: function buildRows() {

            var self = this,
                opt = self.options,
                a,
                b,
                c,
                newSlides,
                numOfSlides,
                originalSlides,
                slidesPerSection;

            newSlides = document.createDocumentFragment();
            originalSlides = self.$slider.find('.' + _V.TRACK).children();

            if (opt.rows > 1) {

                slidesPerSection = opt.slidesPerRow * opt.rows;
                numOfSlides = Math.ceil(originalSlides.length / slidesPerSection);

                for (a = 0; a < numOfSlides; a++) {
                    var slide = document.createElement('div');
                    for (b = 0; b < opt.rows; b++) {
                        var row = document.createElement('div');
                        for (c = 0; c < opt.slidesPerRow; c++) {
                            var target = a * slidesPerSection + (b * opt.slidesPerRow + c);
                            if (originalSlides.get(target)) {
                                row.appendChild(originalSlides.get(target));
                            }
                        }
                        slide.appendChild(row);
                    }
                    newSlides.appendChild(slide);
                }

                self.$slider.find('.' + _V.TRACK).empty().append(newSlides);
                self.$slider.find('.' + _V.TRACK).children().children().children().css({
                    'width': 100 / opt.slidesPerRow + '%',
                    'display': 'inline-block'
                });
            }
        },

        _getTargetBreakpoint: function _getTargetBreakpoint() {
            var self = this,
                b = self.breakpoints,
                breakpoint,
                respondToWidth,
                targetBreakpoint = null;

            switch (self.responseTo) {
                case 'carousel':
                    respondToWidth = self.$slider.width();
                    break;
                case 'min':
                    respondToWidth = Math.min(window.innerWidth || $(window).width(), self.$slider.width());
                    break;
                default:
                    respondToWidth = window.innerWidth || $(window).width();
                    break;
            }

            for (breakpoint in b) {
                if (b.hasOwnProperty(breakpoint)) {
                    if (self.originalSettings.mobileFirst === false) {
                        if (respondToWidth < b[breakpoint]) {
                            targetBreakpoint = b[breakpoint];
                        }
                    } else {
                        if (respondToWidth > b[breakpoint]) {
                            targetBreakpoint = b[breakpoint];
                        }
                    }
                }
            }
            return targetBreakpoint;
        },

        checkResponsive: function checkResponsive(initial, forceUpdate) {

            var self = this,
                opt = self.options,
                bs = self.breakpointSettings,
                targetBreakpoint,
                triggerBreakpoint = false;

            if (opt.responsive && opt.responsive.length) {

                targetBreakpoint = self._getTargetBreakpoint();

                if (targetBreakpoint !== null) {
                    if (self.activeBreakpoint !== null) {

                        if (targetBreakpoint !== self.activeBreakpoint || forceUpdate) {
                            self.activeBreakpoint = targetBreakpoint;

                            if (bs[targetBreakpoint] === _V.UNBUILD) {
                                self.unbuild(targetBreakpoint);
                                
                            } else {
                                self.options = opt = $.extend({}, self.originalSettings, bs[targetBreakpoint]);
                                if (initial === true) {
                                    self.currentSlide = opt.initialSlide;
                                }

                                self.refresh(initial);
                            }
                            triggerBreakpoint = targetBreakpoint;
                        }
                    } else {
                        self.activeBreakpoint = targetBreakpoint;
                        if (bs[targetBreakpoint] === _V.UNBUILD) {
                            self.unbuild(targetBreakpoint);
                        } else {
                            self.options = $.extend({}, self.originalSettings, bs[targetBreakpoint]);
                            if (initial === true) {
                                self.currentSlide = opt.initialSlide;
                            }
                            self.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    if (self.activeBreakpoint !== null) {
                        self.activeBreakpoint = null;
                        self.options = opt = self.originalSettings;
                        if (initial === true) {
                            self.currentSlide = opt.initialSlide;
                        }
                        self.refresh(initial);
                        triggerBreakpoint = targetBreakpoint;
                    }
                }

                // only trigger breakpoints during an actual break. not on initialize.
                if (!initial && triggerBreakpoint !== false) {
                    self.triggerHandler(_N+'breakpoint', [self, triggerBreakpoint]);
                }
            }
        },
        changeSlide: function changeSlide(event, dontAnimate) {

            var self = this,
                opt = self.options,
                $target = $(event.currentTarget),
                indexOffset,
                slideOffset,
                unevenOffset;

            // If target is a link, prevent default action.
            if ($target.is('a')) {
                event.preventDefault();
            }

            // If target is not the <li> element (ie: a child), find the <li>.
            if (!$target.is('li')) {
                $target = $target.closest('li');
            }

            unevenOffset = self.slideCount % opt.slidesToScroll !== 0;
            indexOffset = unevenOffset ? 0 : (self.slideCount - self.currentSlide) % opt.slidesToScroll;

            switch (event.data.message) {

                case 'previous':
                    slideOffset = indexOffset === 0 ? opt.slidesToScroll : opt.slidesToShow - indexOffset;
                    if (self.slideCount > opt.slidesToShow) {
                        self.slideHandler(self.currentSlide - slideOffset, false, dontAnimate);
                    }
                    break;

                case 'next':
                    slideOffset = indexOffset === 0 ? opt.slidesToScroll : indexOffset;
                    if (self.slideCount > opt.slidesToShow) {
                        self.slideHandler(self.currentSlide + slideOffset, false, dontAnimate);
                    }
                    break;

                case 'index':
                    var index = event.data.index === 0 ? 0 : event.data.index || $target.index() * opt.slidesToScroll;

                    self.slideHandler(self.checkNavigable(index), false, dontAnimate);
                    $target.children().trigger('focus');
                    break;

                default:
                    return;
            }
            $(event.target).focusout(); // BTOCSITE-5938-222
        },
        checkNavigable: function checkNavigable(index) {

            var self = this,
                opt = self.options,
                navigables,
                prevNavigable;

            navigables = self.getNavigableIndexes();
            prevNavigable = 0;
            if (index > navigables[navigables.length - 1]) {
                index = navigables[navigables.length - 1];
            } else {
                for (var n in navigables) {
                    if (index < navigables[n]) {
                        index = prevNavigable;
                        break;
                    }
                    prevNavigable = navigables[n];
                }
            }

            return index;
        },
        cleanUpEvents: function cleanUpEvents() {
            var self = this,
                opt = self.options;

            if (opt.dots && self.$dots !== null) {

                $('li', self.$dots).off(addEventNS('click'), self.changeSlide).off(addEventNS('mouseenter')).off(addEventNS('mouseleave'));

                if (opt.accessibility === true) {
                    self.$dots.off(addEventNS('keydown'), self.keyHandler);
                }
            }

            self.$slider.off(addEventNS('focus blur'));

            if (opt.arrows === true && self.slideCount > opt.slidesToShow) {
                self.$prevArrow && self.$prevArrow.off(addEventNS('click'), self.changeSlide);
                self.$nextArrow && self.$nextArrow.off(addEventNS('click'), self.changeSlide);
            }
           

            self.$list.off(addEventNS('touchstart mousedown'), self.swipeHandler);
            self.$list.off(addEventNS('touchmove mousemove'), self.swipeHandler);
            self.$list.off(addEventNS('touchend mouseup'), self.swipeHandler);
            self.$list.off(addEventNS('touchcancel mouseleave'), self.swipeHandler);
            self.$list.off(addEventNS('click'), self.clickHandler);


            $(document).off(self.visibilityChange, self.visibility);

            self.cleanUpSlideEvents();

            if (opt.accessibility === true) {
                self.$list.off(addEventNS('keydown'), self.keyHandler);
            }

            if (opt.focusOnSelect === true) {
                $(self.$slideTrack).children().off(addEventNS('click'), self.selectHandler);
            }

            // $(window).off('orientationchange.' + _N + '-' + self.instanceUid, self.orientationChange);
            // $(window).off('resize.' + _N + '-' + self.instanceUid, self.resize);

            $(window).off(addEventNS('resize') +'-' + self.instanceUid);
            $(window).off(addEventNS('orientationchange') + '-' + self.instanceUid);

            // $(window).off('resize.' + _N + '-' + self.instanceUid, self.resize);


            $(window).off(addEventNS('load') + '-' + self.instanceUid, self.setPosition);
            $(document).on(addEventNS('ready') + '-' + self.instanceUid, self.setPosition);



            $('[draggable!=true]', self.$slideTrack).off(addEventNS('dragstart'), self.preventDefault);

            // $(window).off('load.' + _N + '-' + self.instanceUid, self.setPosition);
            // $(document).off('ready.' + _N + '-' + self.instanceUid, self.setPosition);
        },
        cleanUpSlideEvents: function cleanUpSlideEvents() {

            var self = this,
                opt = self.options;

            self.$list.off(addEventNS('mouseenter'));
            self.$list.off(addEventNS('mouseleave'));
        },
        cleanUpRows: function cleanUpRows() {

            var self = this,
                opt = self.options,
                originalSlides;

            if (opt.rows > 1) {
                originalSlides = self.$slides.children().children();
                originalSlides.removeAttr('style');
                self.$slider.find('.' + _V.TRACK).empty().append(originalSlides);
            }
        },
        clickHandler: function clickHandler(event) {

            var self = this,
                opt = self.options;

            if (self.shouldClick === false) {
                event.stopImmediatePropagation();
                event.stopPropagation();
                event.preventDefault();
            }
        },
        destroy: function destroy(refresh) {
            var self = this,
                opt = self.options;

            self.autoPlayClear();

            self.touchObject = {};

            self.cleanUpEvents();

            $(_V.CLONED, self.$slider).detach();

            if (self.$dots) {
                var dot = self.$dots.children().first().clone(true);

                if (self.$dots.hasClass('ui_static')) {

                    self.$dots.empty().removeClass('ui_static');
                    if(dot) self.$dots.append(dot);

                } else {
                    self.$dots.remove();
                    if(dot) self.$dots.append(dot);                  

                }

                self.$dots.hide();
            }

            if (self.$prevArrow && self.$prevArrow.length) {

                self.$prevArrow.removeClass(_V.DISABLED + ' ' + _V.ARROW + ' ' + _V.HIDDEN).prop('disabled', false).removeAttr('aria-hidden aria-disabled tabindex').css('display', 'none');

                if (self.htmlExpr.test(opt.prevArrow)) {
                    self.$prevArrow.remove();
                }
            }

            if (self.$nextArrow && self.$nextArrow.length) {

                self.$nextArrow.removeClass(_V.DISABLED + ' ' + _V.ARROW + ' ' + _V.HIDDEN).prop('disabled', false).removeAttr('aria-hidden aria-disabled tabindex').css('display', 'none');

                if (self.htmlExpr.test(opt.nextArrow)) {
                    self.$nextArrow.remove();
                }
            }

            if (self.$slides) {

                var isMarkuped = self.$slideTrack.hasClass('ui_static');

                self.$slides.removeClass(_V.SLIDE + ' ' + opt.activeClass + ' ' + _V.CENTER + ' ' + _V.VISIBLE + ' ' + _V.CURRENT).removeAttr('aria-hidden data-' + _V.INDEX + ' tabindex role').each(function () {
                    $(this).attr('style', $(this).data('originalStyling'));
                });

                self.$slides.css('float', '');

                if (isMarkuped) {
                    self.$list.off().removeClass('ui_static');
                    self.$slideTrack.attr('style', '').off().removeClass('ui_static');
                    self.$slideTrack.empty().append(self.$slides);
                } else {
                    self.$slideTrack.children(this.options.slide).detach();
                    self.$slideTrack.detach();
                    if (opt.rows > 1) {
                        self.$list.append(self.$slides);
                    } else {
                        self.$list.detach();
                        self.$slider.append(self.$slides);
                    }
                }

                
            } 
                        
            self.cleanUpRows();

            self.$slider.removeClass(_V.SLIDER);
            self.$slider.removeClass(_V.INITIALIZED);
            self.$slider.removeClass(_V.DOTS);

            self.unbuilded = true;

            if (!refresh) {
                self.triggerHandler('destroy', [self]);
                self.supr();
            }
            
        },
        disableTransition: function disableTransition(slide) {

            var self = this,
                opt = self.options,
                transition = {};

            transition[self.transitionType] = '';

            if (opt.fade === false) {
                if(self.$slideTrack) self.$slideTrack.css(transition);
            } else {
                if(self.$slides) self.$slides.eq(slide).css(transition);
            }
        },
        fadeSlide: function fadeSlide(slideIndex, callback) {

            var self = this,
                opt = self.options;

            if (self.cssTransitions === false) {

                self.$slides.eq(slideIndex).css({
                    //zIndex: opt.zIndex
                });

                self.$slides.eq(slideIndex).animate({
                    opacity: 1
                }, opt.speed, opt.easing, callback);
            } else {

                self.applyTransition(slideIndex);

                self.$slides.eq(slideIndex).css({
                    opacity: 1,
                    //zIndex: opt.zIndex
                });

                if (callback) {
                    setTimeout(function () {

                        self.disableTransition(slideIndex);

                        callback.call();
                    }, opt.speed);
                }
            }
        },
        fadeSlideOut: function fadeSlideOut(slideIndex) {

            var self = this,
                opt = self.options;

            if (self.cssTransitions === false) {

                self.$slides.eq(slideIndex).animate({
                    opacity: 0,
                    //zIndex: opt.zIndex - 2
                }, opt.speed, opt.easing);
            } else {

                self.applyTransition(slideIndex);

                self.$slides.eq(slideIndex).css({
                    opacity: 0,
                    //zIndex: opt.zIndex - 2
                });
            }
        },
        filterSlides: function filterSlides(filter) {

            var self = this,
                opt = self.options;

            if (filter !== null) {

                self.$slidesCache = self.$slides;

                self.unload();

                self.$slideTrack.children(this.options.slide).detach();

                self.$slidesCache.filter(filter).appendTo(self.$slideTrack);

                self.reinit();
            }
        },
        focusHandler: function focusHandler() {

            var self = this;
            var focusTimer;

            self.on(addEventNS('mouseenter mouseleave'), function (e) {
                clearTimeout(focusTimer);
                switch(e.type) {
                    case 'mouseenter': self.triggerHandler('carouselactive'); break;
                    case 'mouseleave': self.triggerHandler('carouseldeactive'); break;
                }
            });

            self.on(addEventNS('focusin focusout'), function (e) {
                switch(e.type) {
                    case 'focusin':
                        if (!self.focussed) {
                            self.focussed = true;
                            self.autoPlay();
                            self.triggerHandler('carouselactive');
                        }
                        break;
                    case 'focusout':

                        //BTOCSITE-8039 WCMS 컴포넌트 개선 요청 건 
                        //슬라이드에 포커스 아웃될때 반복재생 실행안되는 오류 수정
                        //if (self.$slider && self.$slider[0] && e.relatedTarget && !$.contains(self.$slider[0], e.relatedTarget)) {
                            
                        if (self.$slider && self.$slider[0] && !e.relatedTarget && !$.contains(self.$slider[0], e.relatedTarget)) {                            
                            self.focussed = false;
                            self.autoPlay();
                            self.triggerHandler('carouseldeactive');
                        }
                        break;
                }
            });

            /*var self = this,
                opt = self.options;

            self.$slider.off('focus.' + _N + ' blur.' + _N).on('focus.' + _N + ' blur.' + _N, '*', function (event) {

                // TODO: ?? event.stopImmediatePropagation();
                var $sf = $(this);
                console.log(event.type);
                setTimeout(function () {
                    if (opt.pauseOnFocus) {
                        self.focussed = $sf.is(':focus');
                        self.autoPlay();
                    }
                }, 0);
            });*/
        },
        getCurrent: function getCurrent() {

            var self = this,
                opt = self.options;
            return self.currentSlide;
        },
        getDotCount: function getDotCount() {

            var self = this,
                opt = self.options;

            var breakPoint = 0;
            var counter = 0;
            var pagerQty = 0;

            if (opt.infinite === true) {
                if (self.slideCount <= opt.slidesToShow) {
                    ++pagerQty;
                } else {
                    while (breakPoint < self.slideCount) {
                        ++pagerQty;
                        breakPoint = counter + opt.slidesToScroll;
                        counter += opt.slidesToScroll <= opt.slidesToShow ? opt.slidesToScroll : opt.slidesToShow;
                    }
                }
            } else if (opt.centerMode === true) {
                pagerQty = self.slideCount;
            } else if (!opt.asNavFor) {
                pagerQty = 1 + Math.ceil((self.slideCount - opt.slidesToShow) / opt.slidesToScroll);
            } else {
                while (breakPoint < self.slideCount) {
                    ++pagerQty;
                    breakPoint = counter + opt.slidesToScroll;
                    counter += opt.slidesToScroll <= opt.slidesToShow ? opt.slidesToScroll : opt.slidesToShow;
                }
            }

            return pagerQty - 1;
        },
        getLeft: function getLeft(slideIndex) {

            var self = this,
                opt = self.options,
                targetLeft,
                verticalHeight,
                verticalOffset = 0,
                targetSlide,
                coef;

            self.slideOffset = 0;
            verticalHeight = self.$slides.first().outerHeight(true);

            if (opt.infinite === true) {
                if (self.slideCount > opt.slidesToShow) {
                    self.slideOffset = self.slideWidth * opt.slidesToShow * -1;
                    coef = -1;

                    if (opt.vertical === true && opt.centerMode === true) {
                        if (opt.slidesToShow === 2) {
                            coef = -1.5;
                        } else if (opt.slidesToShow === 1) {
                            coef = -2;
                        }
                    }
                    verticalOffset = verticalHeight * opt.slidesToShow * coef;
                }
                if (self.slideCount % opt.slidesToScroll !== 0) {
                    if (slideIndex + opt.slidesToScroll > self.slideCount && self.slideCount > opt.slidesToShow) {
                        if (slideIndex > self.slideCount) {
                            self.slideOffset = (opt.slidesToShow - (slideIndex - self.slideCount)) * self.slideWidth * -1;
                            verticalOffset = (opt.slidesToShow - (slideIndex - self.slideCount)) * verticalHeight * -1;
                        } else {
                            self.slideOffset = self.slideCount % opt.slidesToScroll * self.slideWidth * -1;
                            verticalOffset = self.slideCount % opt.slidesToScroll * verticalHeight * -1;
                        }
                    }
                }
            } else {
                if (slideIndex + opt.slidesToShow > self.slideCount) {
                    self.slideOffset = (slideIndex + opt.slidesToShow - self.slideCount) * self.slideWidth;
                    verticalOffset = (slideIndex + opt.slidesToShow - self.slideCount) * verticalHeight;
                }
            }

            if (self.slideCount <= opt.slidesToShow) {
                self.slideOffset = 0;
                verticalOffset = 0;
            }

            if (opt.centerMode === true && self.slideCount <= opt.slidesToShow) {
                self.slideOffset = self.slideWidth * Math.floor(opt.slidesToShow) / 2 - self.slideWidth * self.slideCount / 2;
            } else if (opt.centerMode === true && opt.infinite === true) {
                self.slideOffset += self.slideWidth * Math.floor(opt.slidesToShow / 2) - self.slideWidth;
            } else if (opt.centerMode === true) {
                self.slideOffset = 0;
                self.slideOffset += self.slideWidth * Math.floor(opt.slidesToShow / 2);
            }

            if (opt.vertical === false) {
                targetLeft = slideIndex * self.slideWidth * -1 + self.slideOffset;
            } else {
                targetLeft = slideIndex * verticalHeight * -1 + verticalOffset;
            }

            if (opt.variableWidth === true) {

                if (self.slideCount <= opt.slidesToShow || opt.infinite === false) {
                    targetSlide = self.$slideTrack.children('.' + _V.SLIDE).eq(slideIndex);
                } else {
                    targetSlide = self.$slideTrack.children('.' + _V.SLIDE).eq(slideIndex + opt.slidesToShow);
                }

                if (opt.rtl === true) {
                    if (targetSlide[0]) {
                        targetLeft = (self.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                    } else {
                        targetLeft = 0;
                    }
                    
                } else {

                    // 추가 김두일                    
                    if(opt.infinite === true){

                        targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;                        

                    }else{
                        
                        if(opt.lastFix===true){
                            var lastTarget = self.$slideTrack.children('.' + _V.SLIDE).last();
                            if(targetSlide[0] && lastTarget[0] && (lastTarget[0].offsetLeft - targetSlide[0].offsetLeft + lastTarget.width() < self.listWidth)){  
                                var dt = self.listWidth - (lastTarget[0].offsetLeft - targetSlide[0].offsetLeft + lastTarget.width());
                                targetLeft = targetSlide[0]? (targetSlide[0].offsetLeft * -1) + dt : 0;
                            }else{
                                targetLeft = targetSlide[0]? targetSlide[0].offsetLeft * -1 : 0;
                            }
                            
                        }else{
                            targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                        }
                    }
                    // 추가 end
                    
                }

                if (opt.centerMode === true) {
                    if (self.slideCount <= opt.slidesToShow || opt.infinite === false) {
                        targetSlide = self.$slideTrack.children('.' + _V.SLIDE).eq(slideIndex);
                    } else {
                        targetSlide = self.$slideTrack.children('.' + _V.SLIDE).eq(slideIndex + opt.slidesToShow + 1);
                    }

                    if (opt.rtl === true) {
                        if (targetSlide[0]) {
                            targetLeft = (self.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                        } else {
                            targetLeft = 0;
                        }
                    } else {
                        targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                    }

                    if(self.$el.hasClass('slide-show-right')) { // BTOCSITE-12757
                        targetLeft += (targetSlide.outerWidth() - $(window).width());
                    }else {
                        targetLeft += (self.$list.width() - targetSlide.outerWidth()) / 2;
                    }
                }
            }


            return targetLeft;
        },
        getOption: function getOption(option) {

            var self = this,
                opt = self.options;

            return opt[option];
        },
        getNavigableIndexes: function getNavigableIndexes() {

            var self = this,
                opt = self.options,
                breakPoint = 0,
                counter = 0,
                indexes = [],
                max;

            if (opt.infinite === false) {
                max = self.slideCount;
            } else {
                breakPoint = opt.slidesToScroll * -1;
                counter = opt.slidesToScroll * -1;
                max = self.slideCount * 2;
            }

            while (breakPoint < max) {
                indexes.push(breakPoint);
                breakPoint = counter + opt.slidesToScroll;
                counter += opt.slidesToScroll <= opt.slidesToShow ? opt.slidesToScroll : opt.slidesToShow;
            }

            return indexes;
        },
        getCarousel: function getCarousel() {

            return this;
        },
        getSlideCount: function getSlideCount() {

            var self = this,
                opt = self.options,
                slidesTraversed,
                swipedSlide,
                centerOffset;

            centerOffset = opt.centerMode === true ? self.slideWidth * Math.floor(opt.slidesToShow / 2) : 0;

            if (opt.swipeToSlide === true) {
                self.$slideTrack.find('.' + _V.SLIDE).each(function (index, slide) {
                    if (slide.offsetLeft - centerOffset + $(slide).outerWidth() / 2 > self.swipeLeft * -1) {
                        swipedSlide = slide;
                        return false;
                    }
                });

                slidesTraversed = Math.abs($(swipedSlide).attr('data-' + _V.INDEX) - self.currentSlide) || 1;

                return slidesTraversed;
            } else {
                return opt.slidesToScroll;
            }
        },
        goTo: function goTo(slide, dontAnimate) {

            var self = this,
                opt = self.options;

            self.changeSlide({
                data: {
                    message: 'index',
                    index: parseInt(slide)
                }
            }, dontAnimate);
        },
        init: function init(creation) {
            var self = this,
                opt = self.options;

            if (!$(self.$slider).hasClass(_V.INITIALIZED)) {

                $(self.$slider).addClass(_V.INITIALIZED);

                self.buildRows();
                self.buildOut();
                self.setProps();
                self.startLoad();
                self.loadSlider();
                self.initializeEvents();
                self.updateArrows();
                self.updateDots();
                self.checkResponsive(true);
                self.focusHandler();

                self.buildPlayButton();
                self.buildAccessbility();


            }

            if (creation) {
                self.triggerHandler(_N + 'init', [self, self.currentSlide]);
            }

            /*
            if(self.$slider.find(opt.slide + ':not(' + _V.CLONED + ')').length <= opt.slidesToShow){
                self.$slider.find(opt.slide + ':not(' + _V.CLONED + ')').addClass(opt.activeClass);               
            }
            */


            if (opt.accessibility === true) {
                self.initADA();
            }

            if (opt.autoplay) {
                self.paused = false;
                self.autoPlay();
                self.triggerHandler(_N + 'play', [self]);
            }

            if (creation) {
                if (opt.autoScrollActive && !opt.infinite) {
                    var index = self.$slides.filter(opt.autoScrollActive).index();
                    if (index > -1) {
                        self.changeSlide({
                            data: {
                                message: 'index',
                                index: index
                            }
                        }, true);
                    }
                }
            }

            if(self.$el.find('.indi-wrap').find('li').length < 2 ){
                if(!self.$el.find('.indi-wrap').hasClass('dots-true')) self.$el.find('.indi-wrap').hide(); // BTOCSITE-8039 WCMS 컴포넌트 개선 요청 건 수정
                self.$el.addClass('slide-solo');
            }

            setTimeout(function(){
                self.startTransition(self.currentSlide);
            }, 100);
        },
        buildPlayButton: function buildPlayButton() {
            var self = this,
                opt = self.options;

            self.$playButon = self.$('.' + _V.PLAY).show();
            if (self.$playButon.length) {
                opt.pauseOnHover = true;

                //BTOCSITE-8039 클릭이벤트 중첩 방지 .off('click) 추가
                self.$playButon.off('click').on('click', function (e) {
                    if (self.paused === false) {
                        self.pause();
                    } else {
                        self.play();
                    }
                });
            }
        },
        buildAccessbility: function buildAccessbility() {
            var self = this;

            if (self.$playButon.length) {

                self.$slider.on(_N + 'play ' + _N + 'stop destroy', function (e) {
                    var $items = self.$playButon.find('[data-bind-text]');
                    var state = e.type === _N + 'play' ? 'stop' : 'play';

                    self.$playButon.removeClass('play stop').addClass(state);
                    $items.each(function () {
                        var $this = $(this),
                            data = $this.data('bindText');

                        $this.text(data[state]);
                    }); //
                });
            }

            if (self.$dots.length) {
                self.$slider.on(_N + 'afterchange', function (e, carousel, index) {
                    //if(self.$dots.find('[data-bind-text]')) self.$dots.find('[data-bind-text]').text('');

                    if(self.$dots){
                        self.$dots.find('[data-bind-text]').text('');
                        self.$dots.eq(index).find('[data-bind-text]').text(function () {
                            return this.getAttribute('data-bind-text') || '';
                        });
                    } 

                    
                });
            }
        },
        initADA: function initADA() {
            var self = this,
                opt = self.options,
                numDotGroups = Math.ceil(self.slideCount / opt.slidesToShow),
                tabControlIndexes = self.getNavigableIndexes().filter(function (val) {
                    return val >= 0 && val < self.slideCount;
                }),
                $cloned = self.$slideTrack.find('.' + _V.CLONED);

                //접근성 관련 수정
            self.$slides.add($cloned).attr({
                'aria-hidden': 'true'
            }).find('a, input, button, select').attr({
                //'tabindex': '-1'
                'tabindex': ''
            });

            if (self.$dots !== null) {
                self.$slides.not($cloned).each(function (i) {
                    var slideControlIndex = tabControlIndexes.indexOf(i);

                    $(this).attr({
                        'role': 'tabpanel',
                        'id': _V.SLIDE + self.instanceUid + i//,
                        //aria: 'tabindex': -1
                    });

                    if (slideControlIndex !== -1) {
                        $(this).attr({
                            'aria-describedby': _V.SLIDE + '-control' + self.instanceUid + slideControlIndex
                        });
                    }
                });

                self.$dots.attr('role', 'tablist').find('li').each(function (i) {
                    var mappedSlideIndex = tabControlIndexes[i];

                    $(this).attr({
                        'role': 'presentation'
                    });

                    $(this).find('button').first().attr({
                        'role': 'tab',
                        'id': _V.SLIDE + '-control' + self.instanceUid + i,
                        'aria-controls': _V.SLIDE + self.instanceUid + mappedSlideIndex,
                        'aria-label': i + 1 + ' of ' + numDotGroups,
                        'aria-selected': null //,
                        //'tabindex': '-1'
                    });
                }).eq(self.currentSlide).find('button').attr({
                    'aria-selected': 'true',
                    'tabindex': '0'
                }).end();
            }

            for (var i = self.currentSlide, max = i + opt.slidesToShow; i < max; i++) {
                self.$slides.eq(i);//aria: .attr('tabindex', 0);
            }

            self.activateADA();
        },
        initArrowEvents: function initArrowEvents() {

            var self = this,
                opt = self.options;

            if (opt.arrows === true && self.slideCount > opt.slidesToShow) {
                self.$prevArrow.off(addEventNS('click')).on(addEventNS('click'), {
                    message: 'previous'
                }, self.changeSlide);
                self.$nextArrow.off(addEventNS('click')).on(addEventNS('click'), {
                    message: 'next'
                }, self.changeSlide);

                if (opt.accessibility === true) {
                    self.$prevArrow.on(addEventNS('keydown'), self.keyHandler);
                    self.$nextArrow.on(addEventNS('keydown'), self.keyHandler);
                }
            }
        },
        initDotEvents: function initDotEvents() {

            var self = this,
                opt = self.options;

            if (opt.dots === true) {
                $('li', self.$dots).on(addEventNS('click'), {
                    message: 'index'
                }, function (e) {
                    e.preventDefault();
                    self.changeSlide.apply(this, [].slice.call(arguments));
                });

                if (opt.accessibility === true) {
                    self.$dots.on(addEventNS('keydown'), self.keyHandler);
                }
            }

            if (opt.dots === true && opt.pauseOnDotsHover === true) {

                $('li', self.$dots).on(addEventNS('mouseenter'), $.proxy(self.interrupt, self, true)).on(addEventNS('mouseleave'), $.proxy(self.interrupt, self, false));
            }
        },
        initSlideEvents: function initSlideEvents() {

            var self = this,
                opt = self.options;

            if (opt.pauseOnHover) {

                self.$list.on(addEventNS('mouseenter'), $.proxy(self.interrupt, self, true));
                self.$list.on(addEventNS('mouseleave'), $.proxy(self.interrupt, self, false));
            }
        },
        initializeEvents: function initializeEvents() {

            var self = this,
                opt = self.options;

            self.initArrowEvents();

            self.initDotEvents();
            self.initSlideEvents();

            
            self.$list.on(addEventNS('touchstart mousedown'), {
                action: 'start'
            }, self.swipeHandler);
            self.$list.on(addEventNS('touchmove mousemove'), {
                action: 'move'
            }, self.swipeHandler);
            self.$list.on(addEventNS('touchend mouseup'), {
                action: 'end'
            }, self.swipeHandler);
            self.$list.on(addEventNS('touchcancel mouseleave'), {
                action: 'end'
            }, self.swipeHandler);

            self.$list.on(addEventNS('click'), self.clickHandler);

            
            $(document).on(self.visibilityChange, $.proxy(self.visibility, self));

            if (opt.accessibility === true) {
                self.$list.on(addEventNS('keydown'), self.keyHandler);
            }

            if (opt.focusOnSelect === true) {
                $(self.$slideTrack).children().on(addEventNS('click'), self.selectHandler);
            }

            $(window).on(addEventNS('orientationchange') + '-' + self.instanceUid, $.proxy(self.orientationChange, self));
            $(window).on(addEventNS('resize') +'-' + self.instanceUid, $.proxy(self.resize, self));

            $('[draggable!=true]', self.$slideTrack).on('dragstart', self.preventDefault);

            $(window).on(addEventNS('load') + '-' + self.instanceUid, self.setPosition);
            $(document).on(addEventNS('ready') + '-' + self.instanceUid, self.setPosition);
        },
        initUI: function initUI() {

            var self = this,
                opt = self.options;

            if (opt.arrows === true && self.slideCount > opt.slidesToShow) {
                self.$prevArrow.show();
                self.$nextArrow.show();
            }

            if (opt.dots === true && self.slideCount > opt.slidesToShow) {
                self.$dots.show();
            }
        },
        keyHandler: function keyHandler(event) {

            var self = this,
                opt = self.options;
            //Dont slide if the cursor is inside the form fields and arrow keys are pressed
            if (!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
                if (event.keyCode === 37 && opt.accessibility === true) {
                    event.preventDefault();
                    self.changeSlide({
                        data: {
                            message: opt.rtl === true ? 'next' : 'previous'
                        }
                    });
                } else if (event.keyCode === 39 && opt.accessibility === true) {
                    event.preventDefault();
                    self.changeSlide({
                        data: {
                            message: opt.rtl === true ? 'previous' : 'next'
                        }
                    });
                }
            }
        },
        lazyLoad: function lazyLoad() {

            var self = this,
                opt = self.options,
                loadRange,
                cloneRange,
                rangeStart,
                rangeEnd;

            function loadImages(imagesScope) {

                $('img', imagesScope).each(function () {
                    var image = $(this);
                    image.on('load', function (e) {
                        if(!(image.hasClass('pc-only') || image.hasClass('mo-only') || image.hasClass('pc') || image.hasClass('mobile'))) {
                            image.css('display','inline-block');
                        }
                        self.setPosition();
                        self.triggerHandler(_N + 'lazyloaded', [self, image, image.attr('src')]);
                    });
                });

                $('img[data-lazy]', imagesScope).each(function () {

                    var image = $(this),
                        imageSource = $(this).attr('data-lazy'),
                        imageSrcSet = $(this).attr('data-srcset'),
                        imageSizes = $(this).attr('data-sizes') || self.$slider.attr('data-sizes');

                        image.css({opacity:1});

                        if (imageSrcSet) {
                            image.attr('srcset', imageSrcSet);

                            if (imageSizes) {
                                image.attr('sizes', imageSizes);
                            }
                        }

                        image.onerror = function () {
                            image.onerror = null;
                            image.removeAttr('data-lazy').removeClass(_V.LOADING).addClass(_N + '-lazyload-error').css({opacity:1});
                            self.triggerHandler(_N + 'lazyloadrrror', [self, image, imageSource]);
                        };
                        image.attr('src', imageSource).removeAttr('data-lazy data-srcset data-sizes').removeClass(_V.LOADING);
                        
                        //imageToLoad = document.createElement('img');


                        /*
                    imageToLoad.onload = function () {

                        // image.animate({opacity: 0}, 100, function () {

                        //     if (imageSrcSet) {
                        //         image.attr('srcset', imageSrcSet);

                        //         if (imageSizes) {
                        //             image.attr('sizes', imageSizes);
                        //         }
                        //     }

                        //     image.attr('src', imageSource).animate({opacity: 1}, 0, function () {
                        //         image.removeAttr('data-lazy data-srcset data-sizes').removeClass(_V.LOADING);
                        //     });
                        //     self.triggerHandler(_N + 'lazyloaded', [self, image, imageSource]);
                        // });

                        image.css({opacity:1});

                        if (imageSrcSet) {
                            image.attr('srcset', imageSrcSet);

                            if (imageSizes) {
                                image.attr('sizes', imageSizes);
                            }
                        }

                        image.attr('src', imageSource).removeAttr('data-lazy data-srcset data-sizes').removeClass(_V.LOADING);
                        
                        self.triggerHandler(_N + 'lazyloaded', [self, image, imageSource]);
                    };

                    imageToLoad.onerror = function () {

                        image.removeAttr('data-lazy').removeClass(_V.LOADING).addClass(_N + '-lazyload-error').css({opacity:1});

                        self.triggerHandler(_N + 'lazyloadrrror', [self, image, imageSource]);
                    };

                    imageToLoad.src = imageSource;
                    */
                });
            }

            if (opt.centerMode === true) {
                if (opt.infinite === true) {
                    rangeStart = self.currentSlide + (opt.slidesToShow / 2 + 1);
                    rangeEnd = rangeStart + opt.slidesToShow + 2;
                } else {
                    rangeStart = Math.max(0, self.currentSlide - (opt.slidesToShow / 2 + 1));
                    rangeEnd = 2 + (opt.slidesToShow / 2 + 1) + self.currentSlide;
                }
            } else {
                rangeStart = opt.infinite ? opt.slidesToShow + self.currentSlide : self.currentSlide;
                rangeEnd = Math.ceil(rangeStart + opt.slidesToShow);
                if (opt.fade === true) {
                    if (rangeStart > 0) rangeStart--;
                    if (rangeEnd <= self.slideCount) rangeEnd++;
                }
            }

            //임시 : 추가로 한개 더 가져오기 위함 화면사이즈가 이상한 폰
            if (rangeEnd <= self.slideCount) rangeEnd++;

            loadRange = self.$slider.find('.' + _V.SLIDE).slice(rangeStart, rangeEnd);

            if (opt.lazyLoad === 'anticipated') {
                var prevSlide = rangeStart - 1,
                    nextSlide = rangeEnd,
                    $slides = self.$slider.find('.' + _N);

                for (var i = 0; i < opt.slidesToScroll; i++) {
                    if (prevSlide < 0) prevSlide = self.slideCount - 1;
                    loadRange = loadRange.add($slides.eq(prevSlide));
                    loadRange = loadRange.add($slides.eq(nextSlide));
                    prevSlide--;
                    nextSlide++;
                }
            }

            loadImages(loadRange);

            if (self.slideCount <= opt.slidesToShow) {
                cloneRange = self.$slider.find('.' + _V.SLIDE);
                loadImages(cloneRange);
            } else if (self.currentSlide >= self.slideCount - opt.slidesToShow) {
                cloneRange = self.$slider.find('.' + _V.CLONED).slice(0, opt.slidesToShow);
                loadImages(cloneRange);
            } else if (self.currentSlide === 0) {
                cloneRange = self.$slider.find('.' + _V.CLONED).slice(opt.slidesToShow * -1);
                loadImages(cloneRange);
            }
        },
        loadSlider: function loadSlider() {

            var self = this,
                opt = self.options;


            
            // 추가
            // var slidecw = self.$slideTrack.children('.' + _V.SLIDE).children().first().css('width');
            // self.widthUnit = slidecw.indexOf('%') > 0 ? '%' : 'px';
            // self.initSlideWidth = self.$slideTrack.children('.' + _V.SLIDE).children().first().width();
            // self.slideMaxWidth = self.$slideTrack.children('.' + _V.SLIDE).children().first().css('max-width');




            self.setPosition();

            self.$slideTrack.css({
                opacity: 1
            });

            self.$slideTrack.children('.' + _V.SLIDE).show(); // 210327 추가
            self.$slider.removeClass(_V.LOADING);

            self.initUI();
            if (opt.lazyLoad === 'progressive') {
                
                // 임시 response 이미지 체크 루틴
                //2021-03-10 정승우
                var $imgsToLoad = $('img[data-pc-src][data-m-src],img[data-lazy]', self.$slider);
                $imgsToLoad.each(function () {
                    var image = $(this);
                    image.on('load', function (e) {
                        if(!(image.hasClass('pc-only') || image.hasClass('mo-only') || image.hasClass('pc') || image.hasClass('mobile'))) {
                            image.css('display','inline-block');
                        }
                        self.setPosition();
                        self.triggerHandler(_N + 'lazyloaded', [self, image, image.attr('src')]);
                    });
                });
                ////임시 response 이미지 체크 루틴
                self.progressiveLazyLoad();
            }
        },
        next: function next() {

            var self = this,
                opt = self.options;

            self.changeSlide({
                data: {
                    message: 'next'
                }
            });
        },
        orientationChange: function orientationChange() {

            var self = this,
                opt = self.options;

            self.checkResponsive();
            self.setPosition();
        },
        stop: function stop() {
            this.pause();
        },
        pause: function pause() {

            var self = this,
                opt = self.options;

            self.autoPlayClear();
            self.triggerHandler(_N + 'stop', [self]);
            self.paused = true;
        },
        play: function play() {

            var self = this,
                opt = self.options;

            self.autoPlay();
            self.triggerHandler(_N + 'play', [self]);
            opt.autoplay = true;
            self.paused = false;
            self.focussed = false;
            self.interrupted = false;
        },

        /** startTransition 기능추가*/
        startTransition: function startTransition(idx) {
            var self = this;    

            if(!self.$slides) return;
            var $target, startCss, endCss,  aniObj, obj;  
            var $currentTarget = $(self.$slides.get(idx));
            var $obj = $currentTarget.find('[data-p-ani]');            

            if(idx == self.previousSlide) return;

            self.setCssPosition(idx);
            
            $obj.each(function () {
                $target = $(this);
                startCss = $target.data('pStart');
                endCss = $target.data('pEnd');
                aniObj = $target.data('pAni');
                if (startCss && endCss && aniObj) {
                    obj = {
                        duration: aniObj.speed || 500,
                        delay: aniObj.delay || 0,
                        easing: aniObj.easing || 'easeInOutQuad'
                    };
                    $target.css(startCss).transition($.extend(endCss, obj));
                }
            });


            var $obj2 = $currentTarget.find('[data-p-ani2]');       
            
            $obj2.each(function () {
                $target = $(this);
                startCss = $target.data('pStart2');
                endCss = $target.data('pEnd2');
                aniObj = $target.data('pAni2');
                if (startCss && endCss && aniObj) {
                    obj = {
                        duration: aniObj.speed || 500,
                        delay: aniObj.delay || 0,
                        easing: aniObj.easing || 'easeInOutQuad'
                    };
                    $target.transition($.extend(endCss, obj));
                }
            });
            
        },

        setCssPosition: function setCssPosition(idx) {
            var self = this;
            var $target, startCss, aniObj,  aniObj, $obj;

            self.$slideTrack.children('.' + _V.SLIDE).each(function(i, target){

                if(!$(target).hasClass('on')){
                    
                    $obj = $(target).find('[data-p-ani]');
                    $obj.each(function () {
                        $target = $(this);
                        startCss = $target.data('pStart');
                        aniObj = $target.data('pAni');
                        if (startCss && aniObj) {                    
                            $target.css(startCss);
                        }
                    });
                }
            });

        },



        postSlide: function postSlide(index) {

            var self = this,
                opt = self.options;

            if (!self.unbuilded) 
            {
                self.triggerHandler(_N + 'afterchange', [self, index]);
                self.startTransition(index);

                self.animating = false;

                if (self.slideCount > opt.slidesToShow) {
                    self.setPosition();
                }

                self.swipeLeft = null;

                if (opt.autoplay) {
                    self.autoPlay();
                }

                if (opt.accessibility === true) {
                    self.initADA();

                    if (opt.focusOnChange) {
                        var $currentSlide = $(self.$slides.get(self.currentSlide));
                        $currentSlide.attr('tabindex', 0).focus();
                    }
                }

                ////self.$slider.find('.' + _V.SLIDE).not('.' + _V.CURRENT).css('visibility', 'hidden');
            }
        },
        prev: function prev() {

            var self = this,
                opt = self.options;

            self.changeSlide({
                data: {
                    message: 'previous'
                }
            });
        },
        preventDefault: function preventDefault(event) {

            event.preventDefault();
        },
        progressiveLazyLoad: function progressiveLazyLoad(tryCount) {

            tryCount = tryCount || 1;

            var self = this,
                opt = self.options,
                $imgsToLoad = $('img[data-lazy]', self.$slider),
                image,
                imageSource,
                imageSrcSet,
                imageSizes;
                //imageToLoad;

            if ($imgsToLoad.length) {

                image = $imgsToLoad.first();
                imageSource = image.attr('data-lazy');
                imageSrcSet = image.attr('data-srcset');
                imageSizes = image.attr('data-sizes') || self.$slider.attr('data-sizes');
                
                image.onerror = function () {
                    if (tryCount < 2) {

                        setTimeout(function () {
                            self.progressiveLazyLoad(tryCount + 1);
                        }, 500);
                    } else {

                        image.removeAttr('data-lazy').removeClass(_V.LOADING).addClass(_N + '-lazyload-error');

                        self.triggerHandler(_N + 'lazyloaderror', [self, image, imageSource]);

                        self.progressiveLazyLoad();
                    }
                };
                image.attr('src', imageSource).removeAttr('data-lazy data-srcset data-sizes').removeClass(_V.LOADING);
                /*
                imageToLoad = document.createElement('img');

                imageToLoad.onload = function () {

                    if (imageSrcSet) {
                        image.attr('srcset', imageSrcSet);

                        if (imageSizes) {
                            image.attr('sizes', imageSizes);
                        }
                    }

                    image.attr('src', imageSource).removeAttr('data-lazy data-srcset data-sizes').removeClass(_V.LOADING);

                    if (opt.adaptiveHeight === true) {
                        self.setPosition();
                    }
                    image.animate({'opacity':1});
                    self.triggerHandler(_N + 'lazyloaded', [self, image, imageSource]);
                    self.progressiveLazyLoad();
                };

                imageToLoad.onerror = function () {

                    if (tryCount < 3) {

                        setTimeout(function () {
                            self.progressiveLazyLoad(tryCount + 1);
                        }, 500);
                    } else {

                        image.removeAttr('data-lazy').removeClass(_V.LOADING).addClass(_N + '-lazyload-error');

                        self.triggerHandler(_N + 'lazyloaderror', [self, image, imageSource]);

                        self.progressiveLazyLoad();
                    }
                };

                imageToLoad.src = imageSource;
                */
            } else {
                self.triggerHandler(_N + 'allimagesloaded', [self]);
            }
        },
        refresh: function refresh(initializing) {

            var self = this,
                opt = self.options,
                currentSlide,
                lastVisibleIndex;

            lastVisibleIndex = self.slideCount - opt.slidesToShow;

            // in non-infinite sliders, we don't want to go past the
            // last visible index.
            if (!opt.infinite && self.currentSlide > lastVisibleIndex) {
                self.currentSlide = lastVisibleIndex;
            }

            // if less slides than to show, go to start.
            if (self.slideCount <= opt.slidesToShow) {
                self.currentSlide = 0;
            }

            currentSlide = self.currentSlide;

            self.destroy(true);

            $.extend(self, componentInitials, {currentSlide: currentSlide});

            self.init();

            if (!initializing) {

                self.changeSlide({
                    data: {
                        message: 'index',
                        index: currentSlide
                    }
                }, false);
            }
        },
        registerBreakpoints: function registerBreakpoints() {

            var self = this,
                opt = self.options,
                breakpoint,
                currentBreakpoint,
                l,
                responsiveSettings = opt.responsive || null;

            if ($.type(responsiveSettings) === 'array' && responsiveSettings.length) {

                self.respondTo = opt.respondTo || 'window';

                for (breakpoint in responsiveSettings) {

                    l = self.breakpoints.length - 1;

                    if (responsiveSettings.hasOwnProperty(breakpoint)) {
                        currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

                        // loop through the breakpoints and cut out any existing
                        // ones with the same breakpoint number, we don't want dupes.
                        while (l >= 0) {
                            if (self.breakpoints[l] && self.breakpoints[l] === currentBreakpoint) {
                                self.breakpoints.splice(l, 1);
                            }
                            l--;
                        }

                        self.breakpoints.push(currentBreakpoint);
                        self.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;
                    }
                }

                self.breakpoints.sort(function (a, b) {
                    return opt.mobileFirst ? a - b : b - a;
                });

                var r = self._getTargetBreakpoint();
                if (r) {
                    self.options.slidesToScroll = self.breakpointSettings[r].slidesToScroll;
                    self.options.slidesToShow = self.breakpointSettings[r].slidesToScroll;
                }
            }
        },
        reinit: function reinit() {

            var self = this,
                opt = self.options;

            if (opt.rows > 1) {
                self.buildRows();
                self.buildOut();
            } else {
                self.$slides = self.$slideTrack.children(opt.slide).addClass(_V.SLIDE);
            }

            self.currentSlide = opt.initialSlide;
            self.slideCount = self.$slides.length;

            if (self.currentSlide >= self.slideCount && self.currentSlide !== 0) {
                self.currentSlide = self.currentSlide - opt.slidesToScroll;
            }

            if (self.slideCount <= opt.slidesToShow) {
                self.currentSlide = 0;
            }

            self.registerBreakpoints();

            self.setProps();
            self.setupInfinite();
            self.buildArrows();
            self.updateArrows();
            self.initArrowEvents();
            self.buildDots();
            self.updateDots();
            self.initDotEvents();
            self.cleanUpSlideEvents();
            self.initSlideEvents();

            self.checkResponsive(false, true);

            if (opt.focusOnSelect === true) {
                $(self.$slideTrack).children().on(addEventNS('click'), self.selectHandler);
            }

            self.setSlideClasses(typeof self.currentSlide === 'number' ? self.currentSlide : 0);

            self.setPosition();
            self.focusHandler();

            self.paused = !opt.autoplay;
            self.autoPlay();
            self.resize();
            self.triggerHandler(_N + 'reinit', [self]);

        },
        resize: function resize() {

            var self = this,
                opt = self.options;
            

            //if ($(window).width() !== self.windowWidth) {
                clearTimeout(self.windowDelay);
                self.windowDelay = window.setTimeout(function () {
                    self.windowWidth = $(window).width();
                    self.checkResponsive();
                    if (!self.unbuilded) {
                        self.setPosition();
                    }

                    if(self.$el && self.$el[0]){

                        if (self.$el.find('.indi-wrap').find('li').length < 2){
                            if(!self.$el.find('.indi-wrap').hasClass('dots-true')) self.$el.find('.indi-wrap').hide(); //BTOCSITE-8039 WCMS 컴포넌트 개선 요청 건 수정
                            self.$el.addClass('slide-solo');
                        } else {
                            self.$el.find('.indi-wrap').show();
            
                            self.$el.removeClass('slide-solo');
                        }
                    }

                    self.triggerHandler(_N + 'resize', [self, self.currentSlide]);

                }, 50);
            //}
        },
        removeSlide: function removeSlide(index, removeBefore, removeAll) {

            var self = this,
                opt = self.options;

            if (typeof index === 'boolean') {
                removeBefore = index;
                index = removeBefore === true ? 0 : self.slideCount - 1;
            } else {
                index = removeBefore === true ? --index : index;
            }

            if (self.slideCount < 1 || index < 0 || index > self.slideCount - 1) {
                return false;
            }

            self.unload();

            if (removeAll === true) {
                self.$slideTrack.children().remove();
            } else {
                self.$slideTrack.children(opt.slide).eq(index).remove();
            }

            self.$slides = self.$slideTrack.children(opts.slide);

            self.$slideTrack.children(opt.slide).detach();

            self.$slideTrack.append(self.$slides);

            self.$slidesCache = self.$slides;

            self.reinit();
        },
        setCSS: function setCSS(position) {

            var self = this,
                opt = self.options,
                positionProps = {},
                x,
                y;

            if (opt.rtl === true) {
                position = -position;
            }
            x = self.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
            y = self.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

            positionProps[self.positionProp] = position;

            if (self.transformsEnabled === false) {
                self.$slideTrack.css(positionProps);
            } else {
                positionProps = {};
                if (self.cssTransitions === false || vcui.detect.isIE) { // BTOCSITE-12804
                    positionProps[self.animType] = 'translate(' + x + ', ' + y + ')';
                    self.$slideTrack.css(positionProps);
                } else {
                    positionProps[self.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                    self.$slideTrack.css(positionProps);
                }
            }
        },
        setDimensions: function setDimensions() {

            var self = this,
                opt = self.options;

            if (opt.vertical === false) {
                if (opt.centerMode === true) {
                    self.$list.css({
                        padding: '0px ' + opt.centerPadding
                    });
                }
            } else {
                self.$list.height(self.$slides.first().outerHeight(true) * opt.slidesToShow);
                if (opt.centerMode === true) {
                    self.$list.css({
                        padding: opt.centerPadding + ' 0px'
                    });
                }
            }
        
            // 추가
            // var paddingleft = parseInt(self.$list.css('padding-left'));
            // self.$list.css('padding-left', 0);

            // var slidecont = self.$slideTrack.children('.' + _V.SLIDE).children().first();
            // var maxwidth = parseInt(slidecont.css('max-width'));
            // var marginleft = parseInt(slidecont.css('margin-left'));
            // var marginright = parseInt(slidecont.css('margin-right'));

            // var slidew;
            // if(self.widthUnit == 'px'){
            //     slidew = self.initSlideWidth;
            // } else{
            //     slidew = $('#wrap').width() * (self.initSlideWidth/100);
            // }
            // if(slidew == 0) slidew = self.$el.width();
            // else if(slidew > maxwidth) slidew = maxwidth;

            // self.$slideTrack.children('.' + _V.SLIDE).children().first().width(slidew);
            // 추가 end



            //self.$slideTrack.css('width', '');
            self.listWidth = self.$list.width();
            self.listHeight = self.$list.height();

            if (opt.vertical === false && opt.variableWidth === false) {
                self.slideWidth = Math.ceil(self.listWidth / opt.slidesToShow);
                self.$slideTrack.width(Math.ceil(self.slideWidth * self.$slideTrack.children('.' + _V.SLIDE).length) + opt.additionWidth);
            } else if (opt.variableWidth === true) {
                self.$slideTrack.width((5000 * self.slideCount) + opt.additionWidth);
            } else {
                self.slideWidth = Math.ceil(self.listWidth);
                self.$slideTrack.height(Math.ceil(self.$slides.first().outerHeight(true) * self.$slideTrack.children('.' + _V.SLIDE).length));
            }

            if (opt.variableWidth === false) {
                var offset = self.$slides.first().outerWidth(true) - self.$slides.first().width();
                self.$slideTrack.children('.' + _V.SLIDE).width(self.slideWidth - offset);
            }
        },
        update: function () {
            this.setDimensions();
        },

        setFade: function setFade() {

            var self = this,
                opt = self.options,
                targetLeft;

            self.$slides.each(function (index, element) {
                targetLeft = self.slideWidth * index * -1;
                if (opt.rtl === true) {
                    $(element).css({
                        position: 'relative',
                        right: targetLeft,
                        top: 0,
                        //zIndex: opt.zIndex - 2,
                        opacity: 0
                    });
                } else {
                    $(element).css({
                        position: 'relative',
                        left: targetLeft,
                        top: 0,
                        //zIndex: opt.zIndex - 2,
                        opacity: 0
                    });
                }
            });

            self.$slides.eq(self.currentSlide).css({
                //zIndex: opt.zIndex - 1,
                opacity: 1
            });
        },
        setHeight: function setHeight() {

            var self = this,
                opt = self.options;

            if (opt.slidesToShow === 1 && opt.adaptiveHeight === true && opt.vertical === false) {
                var targetHeight = self.$slides.eq(self.currentSlide).outerHeight(true);
                /* s : BTOCSITE-8039 WCMS 컴포넌트 개선 요청 건 수정 */
                if(self.$el.hasClass('slide-show-right')) {
                    targetHeight = Math.max(self.$slides.eq(self.currentSlide).outerHeight(true), self.$slides.eq(self.currentSlide+1).outerHeight(true));
                }
                /* e : BTOCSITE-8039 WCMS 컴포넌트 개선 요청 건 수정 */
                self.$list.css('height', targetHeight);
            }
        },
        setOption: function setOption() {

            /**
             * accepts arguments in format of:
             *
             *  - for changing a single option's value:
             *     .slick("setOption", option, value, refresh )
             *
             *  - for changing a set of responsive options:
             *     .slick("setOption", 'responsive', [{}, ...], refresh )
             *
             *  - for updating multiple values at once (not responsive)
             *     .slick("setOption", { 'option': value, ... }, refresh )
             */

            var self = this,
                opt = self.options,
                l,
                item,
                option,
                value,
                refresh = false,
                type;

            if ($.type(arguments[0]) === 'object') {

                option = arguments[0];
                refresh = arguments[1];
                type = 'multiple';
            } else if ($.type(arguments[0]) === 'string') {

                option = arguments[0];
                value = arguments[1];
                refresh = arguments[2];

                if (arguments[0] === 'responsive' && $.type(arguments[1]) === 'array') {

                    type = 'responsive';
                } else if (typeof arguments[1] !== 'undefined') {

                    type = 'single';
                }
            }

            if (type === 'single') {

                opt[option] = value;
            } else if (type === 'multiple') {

                $.each(option, function (item, val) {
                    opt[item] = val;
                });
            } else if (type === 'responsive') {

                for (item in value) {

                    if ($.type(opt.responsive) !== 'array') {

                        opt.responsive = [value[item]];
                    } else {

                        l = opt.responsive.length - 1;

                        // loop through the responsive object and splice out duplicates.
                        while (l >= 0) {

                            if (opt.responsive[l].breakpoint === value[item].breakpoint) {

                                opt.responsive.splice(l, 1);
                            }

                            l--;
                        }

                        opt.responsive.push(value[item]);
                    }
                }
            }

            if (refresh) {

                self.unload();
                self.reinit();
            }
        },
        setPosition: function setPosition() {

            var self = this,
                opt = self.options;

            if (!self.el || !self.$el.is(':visible')) {
                return;
            }

            self.setDimensions();

            self.setHeight();

            if (opt.fade === false) {
                self.setCSS(self.getLeft(self.currentSlide));
            } else {
                self.setFade();
            }

            self.triggerHandler(_N + 'setposition', [self]);
        },
        setProps: function setProps() {

            var self = this,
                opt = self.options,
                bodyStyle = document.body.style;

            self.positionProp = opt.vertical === true ? 'top' : 'left';

            if (self.positionProp === 'top') {
                self.$slider.addClass(_N + '-vertical');
            } else {
                self.$slider.removeClass(_N + '-vertical');
            }

            if (bodyStyle.WebkitTransition !== undefined || bodyStyle.MozTransition !== undefined || bodyStyle.msTransition !== undefined) {
                if (opt.useCSS === true) {
                    self.cssTransitions = true;
                }
            }

            if (opt.fade) {
                if (typeof opt.zIndex === 'number') {
                    if (opt.zIndex < 3) {
                        opt.zIndex = 3;
                    }
                } else {
                    opt.zIndex = self.defaults.zIndex;
                }
            }

            if (bodyStyle.OTransform !== undefined) {
                self.animType = 'OTransform';
                self.transformType = '-o-transform';
                self.transitionType = 'OTransition';
                if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) self.animType = false;
            }
            if (bodyStyle.MozTransform !== undefined) {
                self.animType = 'MozTransform';
                self.transformType = '-moz-transform';
                self.transitionType = 'MozTransition';
                if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) self.animType = false;
            }
            if (bodyStyle.webkitTransform !== undefined) {
                self.animType = 'webkitTransform';
                self.transformType = '-webkit-transform';
                self.transitionType = 'webkitTransition';
                if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) self.animType = false;
            }
            if (bodyStyle.msTransform !== undefined) {
                self.animType = 'msTransform';
                self.transformType = '-ms-transform';
                self.transitionType = 'msTransition';
                if (bodyStyle.msTransform === undefined) self.animType = false;
            }
            if (bodyStyle.transform !== undefined && self.animType !== false) {
                self.animType = 'transform';
                self.transformType = 'transform';
                self.transitionType = 'transition';
            }
            self.transformsEnabled = opt.useTransform && self.animType !== null && self.animType !== false;
        },
        setSlideClasses: function setSlideClasses(index) {

            var self = this,
                opt = self.options,
                centerOffset,
                allSlides,
                indexOffset,
                remainder;

            allSlides = self.$slider.find('.' + _V.SLIDE).removeClass(opt.activeClass + ' ' + _V.CENTER + ' ' + _V.CURRENT).attr('aria-hidden', 'true');

            self.$slides.eq(index).addClass(_V.CURRENT);

            if (opt.centerMode === true) {

                var evenCoef = opt.slidesToShow % 2 === 0 ? 1 : 0;

                centerOffset = Math.floor(opt.slidesToShow / 2);

                if (opt.infinite === true) {

                    if (index >= centerOffset && index <= self.slideCount - 1 - centerOffset) {
                        self.$slides.slice(index - centerOffset + evenCoef, index + centerOffset + 1).addClass(opt.activeClass).attr('aria-hidden', 'false');
                    } else {

                        indexOffset = opt.slidesToShow + index;
                        allSlides.slice(indexOffset - centerOffset + 1 + evenCoef, indexOffset + centerOffset + 2).addClass(opt.activeClass).attr('aria-hidden', 'false');
                    }

                    if (index === 0) {

                        allSlides.eq(allSlides.length - 1 - opt.slidesToShow).addClass(_V.CENTER);
                    } else if (index === self.slideCount - 1) {

                        allSlides.eq(opt.slidesToShow).addClass(_V.CENTER);
                    }
                }

                self.$slides.eq(index).addClass(_V.CENTER);
            } else {

                if (index >= 0 && index <= self.slideCount - opt.slidesToShow) {

                    self.$slides.slice(index, index + opt.slidesToShow).addClass(opt.activeClass).attr('aria-hidden', 'false');
                } else if (allSlides.length <= opt.slidesToShow) {

                    allSlides.addClass(opt.activeClass).attr('aria-hidden', 'false');
                } else {

                    remainder = self.slideCount % opt.slidesToShow;
                    indexOffset = opt.infinite === true ? opt.slidesToShow + index : index;

                    if (opt.slidesToShow == opt.slidesToScroll && self.slideCount - index < opt.slidesToShow) {

                        allSlides.slice(indexOffset - (opt.slidesToShow - remainder), indexOffset + remainder).addClass(opt.activeClass).attr('aria-hidden', 'false');
                    } else {

                        allSlides.slice(indexOffset, indexOffset + opt.slidesToShow).addClass(opt.activeClass).attr('aria-hidden', 'false');
                    }
                }
            }

            if (opt.lazyLoad === 'ondemand' || opt.lazyLoad === 'anticipated') {
                self.lazyLoad();
            }
        },
        setupInfinite: function setupInfinite() {

            var self = this,
                opt = self.options,
                i,
                slideIndex,
                infiniteCount;

            if (opt.fade === true) {
                opt.centerMode = false;
            }

            if (opt.infinite === true && opt.fade === false) {

                slideIndex = null;


                if (self.slideCount > opt.slidesToShow) {

                    if (opt.centerMode === true) {
                        infiniteCount = opt.slidesToShow + 1;
                    } else {
                        infiniteCount = opt.slidesToShow;
                    }

                    for (i = self.slideCount; i > self.slideCount - infiniteCount; i -= 1) {
                        slideIndex = i - 1;
                        $(self.$slides[slideIndex]).clone(true).attr('id', '').attr('data-' + _V.INDEX, slideIndex - self.slideCount).prependTo(self.$slideTrack).addClass(_V.CLONED);
                    }
                    for (i = 0; i < infiniteCount; i += 1) {
                        slideIndex = i;
                        $(self.$slides[slideIndex]).clone(true).attr('id', '').attr('data-' + _V.INDEX, slideIndex + self.slideCount).appendTo(self.$slideTrack).addClass(_V.CLONED);
                    }
                    self.$slideTrack.find('.' + _V.CLONED).find('[id]').each(function () {
                        $(this).attr('id', '');
                    });
                }
            }
        },
        interrupt: function interrupt(toggle) {

            var self = this,
                opt = self.options;

            if (!toggle) {
                self.autoPlay();
            }
            self.interrupted = toggle;
        },
        selectHandler: function selectHandler(event) {

            var self = this,
                opt = self.options;

            var targetElement = $(event.target).is('.' + _V.SLIDE) ? $(event.target) : $(event.target).parents('.' + _V.SLIDE);

            var index = parseInt(targetElement.attr('data-' + _V.INDEX));

            if (!index) index = 0;

            if (self.slideCount <= opt.slidesToShow) {

                self.slideHandler(index, false, true);
                return;
            }

            self.slideHandler(index);
        },
        slideHandler: function slideHandler(index, sync, dontAnimate) {

            var targetSlide,
                animSlide,
                oldSlide,
                slideLeft,
                targetLeft = null,
                self = this,
                opt = self.options,
                navTarget;

            sync = sync || false;

            if (self.animating === true && opt.waitForAnimate === true) {
                return;
            }

            if (opt.fade === true && self.currentSlide === index) {
                return;
            }

            targetSlide = index;
            targetLeft = self.getLeft(targetSlide);
            slideLeft = self.getLeft(self.currentSlide);

            self.currentLeft = self.swipeLeft === null ? slideLeft : self.swipeLeft;

            if (opt.infinite === false && opt.centerMode === false && (index < 0 || index > self.getDotCount() * opt.slidesToScroll)) {
                if (opt.fade === false) {
                    targetSlide = self.currentSlide;
                    if (dontAnimate !== true) {
                        self.animateSlide(slideLeft, function () {
                            self.postSlide(targetSlide);
                        });
                    } else {
                        self.postSlide(targetSlide);
                    }
                }
                return;
            } else if (opt.infinite === false && opt.centerMode === true && (index < 0 || index > self.slideCount - opt.slidesToScroll)) {
                if (opt.fade === false) {
                    targetSlide = self.currentSlide;
                    if (dontAnimate !== true) {
                        self.animateSlide(slideLeft, function () {
                            self.postSlide(targetSlide);
                        });
                    } else {
                        self.postSlide(targetSlide);
                    }
                }
                return;
            }

            if (opt.autoplay) {
                clearInterval(self.autoPlayTimer);
            }

            if (targetSlide < 0) {
                if (self.slideCount % opt.slidesToScroll !== 0) {
                    animSlide = self.slideCount - self.slideCount % opt.slidesToScroll;
                } else {
                    animSlide = self.slideCount + targetSlide;
                }
            } else if (targetSlide >= self.slideCount) {
                if (self.slideCount % opt.slidesToScroll !== 0) {
                    animSlide = 0;
                } else {
                    animSlide = targetSlide - self.slideCount;
                }
            } else {
                animSlide = targetSlide;
            }

            self.animating = true;

            self.triggerHandler(_N + 'beforechange', [self, self.currentSlide, animSlide]);

            oldSlide = self.currentSlide;
            self.previousSlide = oldSlide;
            self.currentSlide = animSlide;

            self.setSlideClasses(self.currentSlide);

            if (opt.asNavFor) {

                navTarget = self.getNavTarget();
                navTarget = navTarget.vcCarousel('instance');

                if (navTarget.slideCount <= navTarget.options.slidesToShow) {
                    navTarget.setSlideClasses(self.currentSlide);
                }

                if (sync === false) {
                    self.asNavFor(self.currentSlide);
                }
            }

            self.updateDots();
            self.updateArrows();

            if (opt.fade === true) {
                if (dontAnimate !== true) {

                    self.fadeSlideOut(oldSlide);

                    self.fadeSlide(animSlide, function () {
                        self.postSlide(animSlide);
                    });
                } else {
                    self.postSlide(animSlide);
                }
                self.animateHeight();
                return;
            }

            if (dontAnimate !== true) {
                self.animateSlide(targetLeft, function () {
                    self.postSlide(animSlide);
                });
            } else {
                self.postSlide(animSlide);
            }
        },
        startLoad: function startLoad() {

            var self = this,
                opt = self.options;

            if (opt.arrows === true && self.slideCount > opt.slidesToShow) {
                self.$prevArrow.hide();
                self.$nextArrow.hide();
            }

            if (opt.dots === true && self.slideCount >= opt.slidesToShow) {
                self.$dots.hide();
            }

            self.$slider.addClass(_V.LOADING);
        },
        swipeDirection: function swipeDirection() {

            var xDist,
                yDist,
                r,
                swipeAngle,
                self = this,
                opt = self.options;

            xDist = self.touchObject.startX - self.touchObject.curX;
            yDist = self.touchObject.startY - self.touchObject.curY;
            r = Math.atan2(yDist, xDist);

            swipeAngle = Math.round(r * 180 / Math.PI);
            if (swipeAngle < 0) {
                swipeAngle = 360 - Math.abs(swipeAngle);
            }

            if (swipeAngle <= 45 && swipeAngle >= 0) {
                return opt.rtl === false ? 'left' : 'right';
            }
            if (swipeAngle <= 360 && swipeAngle >= 315) {
                return opt.rtl === false ? 'left' : 'right';
            }
            if (swipeAngle >= 135 && swipeAngle <= 225) {
                return opt.rtl === false ? 'right' : 'left';
            }
            if (opt.verticalSwiping === true) {
                if (swipeAngle >= 35 && swipeAngle <= 135) {
                    return 'down';
                } else {
                    return 'up';
                }
            }

            if (self.options.preventVertical) {
                return xDist < 0 ? 'right' : 'left';
            }

            return 'vertical';
        },
        swipeEnd: function swipeEnd(event) {

            var self = this,
                opt = self.options,
                slideCount,
                direction;

            self.dragging = false;
            self.swiping = false;

            if (self.scrolling) {
                self.scrolling = false;
                return false;
            }

            self.interrupted = false;
            self.shouldClick = self.touchObject.swipeLength > 10 ? false : true;

            if (self.touchObject.curX === undefined) {
                return false;
            }

            if (self.touchObject.edgeHit === true) {
                self.triggerHandler(_N + 'edge', [self, self.swipeDirection()]);
            }


            if (self.touchObject.swipeLength >= self.touchObject.minSwipe) {

                direction = self.swipeDirection();

                switch (direction) {

                    case 'left':
                    case 'down':

                        slideCount = opt.swipeToSlide ? self.checkNavigable(self.currentSlide + self.getSlideCount()) : self.currentSlide + self.getSlideCount();
                        self.currentDirection = 0;

                        break;

                    case 'right':
                    case 'up':

                        slideCount = opt.swipeToSlide ? self.checkNavigable(self.currentSlide - self.getSlideCount()) : self.currentSlide - self.getSlideCount();
                        self.currentDirection = 1;

                        break;

                    default:

                }

                if (direction != 'vertical') {
                    self.slideHandler(slideCount);
                    self.touchObject = {};
                    self.triggerHandler(_N + 'swipe', [self, direction]);

                }
            } else {

                if (self.touchObject.startX !== self.touchObject.curX) {
                    self.slideHandler(self.currentSlide);
                    self.touchObject = {};
                }
            }
        },
        swipeHandler: function swipeHandler(event) {

            var self = this,
                opt = self.options;


            if (opt.swipe === false || 'ontouchend' in document && opt.swipe === false) {
                return;
            } else if (opt.draggable === false && event.type.indexOf('mouse') !== -1) {
                return;
            }

            self.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ? event.originalEvent.touches.length : 1;

            self.touchObject.minSwipe = self.listWidth / opt.touchThreshold;

            if (opt.verticalSwiping === true) {
                self.touchObject.minSwipe = self.listHeight / opt.touchThreshold;
            }

            // console.log(event.data.action);

            switch (event.data.action) {

                case 'start':
                    self.swipeStart(event);
                    break;

                case 'move':
                    self.swipeMove(event);
                    break;

                case 'end':
                    self.swipeEnd(event);
                    break;

            }
        },
        swipeMove: function swipeMove(event) {

            var self = this,
                opt = self.options,
                edgeWasHit = false,
                curLeft,
                swipeDirection,
                swipeLength,
                positionOffset,
                touches,
                verticalSwipeLength;

            touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

            if (!self.dragging || self.scrolling || touches && touches.length !== 1) {
                return false;
            }

            curLeft = self.getLeft(self.currentSlide);

            self.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
            self.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

            self.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(self.touchObject.curX - self.touchObject.startX, 2)));

            verticalSwipeLength = Math.round(Math.sqrt(Math.pow(self.touchObject.curY - self.touchObject.startY, 2)));


            if (!opt.verticalSwiping && !self.swiping && verticalSwipeLength > 4) {
                self.scrolling = true;
                return false;
            }

            if (opt.verticalSwiping === true) {
                self.touchObject.swipeLength = verticalSwipeLength;
            }

            swipeDirection = self.swipeDirection();

            if (opt.preventVertical && self.swiping) {
                event.stopPropagation();
                event.preventDefault();
            }

            if (event.originalEvent !== undefined && self.touchObject.swipeLength > 4) {
                self.swiping = true;
                event.preventDefault();
            }

            positionOffset = (opt.rtl === false ? 1 : -1) * (self.touchObject.curX > self.touchObject.startX ? 1 : -1);
            if (opt.verticalSwiping === true) {
                positionOffset = self.touchObject.curY > self.touchObject.startY ? 1 : -1;
            }

            swipeLength = self.touchObject.swipeLength;

            self.touchObject.edgeHit = false;

            if (opt.infinite === false) {
                if (self.currentSlide === 0 && swipeDirection === 'right' || self.currentSlide >= self.getDotCount() && swipeDirection === 'left') {
                    swipeLength = self.touchObject.swipeLength * opt.edgeFriction;
                    self.touchObject.edgeHit = true;
                }
            }

            if (opt.vertical === false) {
                self.swipeLeft = curLeft + swipeLength * positionOffset;
            } else {
                self.swipeLeft = curLeft + swipeLength * (self.$list.height() / self.listWidth) * positionOffset;
            }
            if (opt.verticalSwiping === true) {
                self.swipeLeft = curLeft + swipeLength * positionOffset;
            }
            self.triggerHandler(_N + 'swipestart', [self]);

            if (opt.fade === true || opt.touchMove === false) {
                return false;
            }

            if (self.animating === true) {
                self.swipeLeft = null;
                return false;
            }

            self.setCSS(self.swipeLeft);
        },
        swipeStart: function swipeStart(event) {

            var self = this,
                opt = self.options,
                touches;

            self.interrupted = true;

            if (self.touchObject.fingerCount !== 1 || self.slideCount <= opt.slidesToShow) {
                self.touchObject = {};
                return false;
            }

            if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
                touches = event.originalEvent.touches[0];
            }

            self.touchObject.startX = self.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
            self.touchObject.startY = self.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

            self.dragging = true;

            /////self.$slider.find('.' + _V.SLIDE).css('visibility', '');
        },
        unfilterSlides: function unfilterSlides() {

            var self = this,
                opt = self.options;

            if (self.$slidesCache !== null) {

                self.unload();

                self.$slideTrack.children(opt.slide).detach();

                self.$slidesCache.appendTo(self.$slideTrack);

                self.reinit();
            }
        },
        unload: function unload() {

            var self = this,
                opt = self.options;

            $('.' + _V.CLONED, self.$slider).remove();

            if (self.$dots) {
                self.$dots.remove();
            }

            if (self.$prevArrow && self.htmlExpr.test(opt.prevArrow)) {
                self.$prevArrow.remove();
            }

            if (self.$nextArrow && self.htmlExpr.test(opt.nextArrow)) {
                self.$nextArrow.remove();
            }

            self.$slides.removeClass(_V.SLIDE + ' ' + opt.activeClass + ' ' + _V.VISIBLE + ' ' + _V.CURRENT).attr('aria-hidden', 'true').css('width', '');
        },
        unbuild: function unbuild(fromBreakpoint) {

            var self = this,
                opt = self.options;
            self.triggerHandler(_V.UNBUILD, [self, fromBreakpoint]);
            self.destroy();
        },
        updateArrows: function updateArrows() {

            var self = this,
                opt = self.options,
                centerOffset;

            //centerOffset = Math.floor(opt.slidesToShow / 2);

            if (opt.arrows === true && self.slideCount > opt.slidesToShow && !opt.infinite) {
                self._updateArrow(self.$prevArrow, true);
                self._updateArrow(self.$nextArrow, true);

                if (self.currentSlide === 0) {
                    self._updateArrow(self.$prevArrow, false);
                } else if (self.currentSlide >= self.slideCount - opt.slidesToShow && opt.centerMode === false) {
                    self._updateArrow(self.$nextArrow, false);
                } else if (self.currentSlide >= self.slideCount - 1 && opt.centerMode === true) {
                    self._updateArrow(self.$nextArrow, false);
                }
            }
        },
        _updateArrow: function ($arrow, flag) {
            var self = this;
            var opts = self.options;

            switch (opts.arrowsUpdate) {
                case 'disabled':
                    $arrow[flag ? 'removeClass' : 'addClass'](_V.DISABLED)
                        .prop('disabled', !flag)
                        .attr('aria-disabled', (!flag).toString());
                    break;
                case 'toggle':
                    $arrow.toggle(flag);
                    break;
            }
        },
        updateDots: function updateDots() {

            var self = this,
                opt = self.options;

            self.$dots.show();

            if (self.$dots.length) {
                self.$dots.find('li').removeClass(opt.activeClass).eq(Math.floor(self.currentSlide / opt.slidesToScroll)).addClass(opt.activeClass);
            }
        },
        visibility: function visibility() {

            var self = this,
                opt = self.options;

            if (opt.autoplay) {
                self.interrupted = !!document[self.hidden];
            }
        }
    });

    return Carousel;
});