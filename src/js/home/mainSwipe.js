function MainSwiper( ID ){
    this.$el = $('#' + ID);
    this.$tabs = this.$el.find('.nav-item');
    this.currentIdx = 0;
    this.contentHTMLArray = [];
    this.canScroll = false;
    this.ablePushState = false;
    this.swiper = null;
    this.currentHash = window.location.hash;
    this.loadQUE = [];
    this.isLoading = false;
    this.isFirstLoad = true;
    this.firstPathName = location.pathname;
    this.firstSearch = location.search;
    this.isSwiped = true;   // BTOCSITE-2947 add :: 직접 터치하여 스와이프가 되었는지 여부
    

    this.hashToUrl = {
        '#home' : 'home',
        '#store' : 'store',
        '#support' : 'support',
        '#care-solutions' : 'care-solutions',
        '#benefits' : 'benefits', 
        '#story' : 'story' // BTOCSITE-10664 
    };

    this.urlToHash = {
        'home' : '#home',
        'store' : '#store',
        'support' : '#support',
        'care-solutions' : '#care-solutions',
        'benefits' : '#benefits', 
        'story' : '#story' // BTOCSITE-10664 
    };

    this.hashArray = [
        'home', 'store', 'support', 'care-solutions','benefits', 'story'  // BTOCSITE-10664 
    ];

    if(vcui.detect.isMobileDevice){
        this.init();
    }
    
}

MainSwiper.prototype = {
    init : function(){
        this.setMobileNav();
        this.setSwipe();
        this.setUrlEvent();
        this.setArBtn(); // BTOCSITE-12128 메인성능개선


        
    },
    setSwipe : function(){
        var self = this;
        var mainSwiper =  this;        
        var hash = mainSwiper.getLastSegmentByUrl();
        var idx = mainSwiper.getIndexByHash( hash !== '' ? hash : 'home' );        

        this.swiper = new Swiper('#sw_con', {
            autoHeight : true,
            observer : true,
            slidesPerView : 1,
            slidesPerColumn : 1,
            on : {
                'beforeInit' : function(){
                    $('#sw_con .swiper-slide').data('isLoaded', false);
                },
                'init' : function(swiper){   
                    self.isSwiped = false;    // BTOCSITE-2947 add

                    if ( idx == 0){
                        var currentSlide = swiper.slides[swiper.activeIndex];
                        document.addEventListener('readystatechange', function(e) {
                            document.readyState == 'complete' && mainSwiper.loadContent( swiper.slides[swiper.activeIndex +1], false );
                        })
                        mainSwiper.loadContent( currentSlide,true );
                    } else {
                        swiper.animating = false;
                        self.isSwiped = false;    // BTOCSITE-2947 add
                        swiper.slideTo( idx );
                        swiper.animating = true;
                    }
                    

                    swiper.allowSlidePrev = swiper.activeIndex == 0 ? false: true;
                    self.removeStatusBar();//BTOCSITE-1967

                },
                'slideChange' : function(swiper){                    
                    var currentSlide = swiper.slides[swiper.activeIndex];
                    // GA 이벤트 액션값 
                    mainSwiper.customEventActionString = '';

                    if (mainSwiper.currentIdx > swiper.activeIndex){
                        mainSwiper.customEventActionString = '스와이프 - 좌측';
                    }

                    if (mainSwiper.currentIdx < swiper.activeIndex){
                        mainSwiper.customEventActionString = '스와이프 - 우측';
                    }

                    self.removeStatusBar();//BTOCSITE-1967

                    mainSwiper.loadContent( currentSlide,true );

                    if(swiper.activeIndex > 0){
                        mainSwiper.loadContent( swiper.slides[swiper.activeIndex -1 ], false );
                    }

                    if(swiper.activeIndex >= 0 && swiper.activeIndex !== swiper.slides.length -1){
                        mainSwiper.loadContent( swiper.slides[swiper.activeIndex +1], false  );
                    }

                    swiper.allowSlideNext = swiper.activeIndex === swiper.slides.length -1 ? false: true;
                    swiper.allowSlidePrev = swiper.activeIndex === 0 ? false: true;
                    

                    mainSwiper.currentIdx = swiper.activeIndex;
                    // 20100811 BTOCSITE-1814 
                    mainSwiper.$tabs.parent().removeClass('on').eq(swiper.activeIndex).addClass('on');
                    mainSwiper.$tabs.removeClass('on').eq(swiper.activeIndex).addClass('on');
                    $('#mobileNav').vcSmoothScroll("scrollToActive");
                    mainSwiper.$tabs.removeClass('on').eq(swiper.activeIndex).addClass('on');
                    setTimeout(function(){
                        $(window).scrollTop(0);
                    }, 500);
                },
                // BTOCSITE-11602 고객지원 팝업 오류 대응
                'transitionEnd' : function(swiper){
                    $(window).trigger("swConChange", swiper);
                }
                
                
            }
        });

        $('#sw_con .swiper-slide').on('touchstart touchmove', function( e ){
            var isCategoryTab = !!$(e.target).closest('.ui_category_tab').length;
            
            var isCarouselList = !!$(e.target).closest('.ui_carousel_list').length;
            var isTagScrollTab = !!$(e.target).closest('.ui_tag_smooth_scrolltab').length;
            var isSlick = !!$(e.target).closest('.slick-track').length;

            var isCareSmoothTab = !!$(e.target).closest('.care-home-section .ui_smooth_tab').length; //BTOCSITE-2196 

            var isSmoothTab = !!$(e.target).closest('.module-buy-product .ui_product_tab').length; //BTOCSITE-6882

            if (isCategoryTab || isCarouselList || isTagScrollTab || isSlick || isCareSmoothTab || isSmoothTab){ //BTOCSITE-2196  //BTOCSITE-6882
                e.stopPropagation();
            }
        });        

    },
    loadContent : function( currentSlide, pushFlag ){
        this.loadQUE.push({
            'slide' : currentSlide,
            'pushFlag' : pushFlag
        });
        this.getContent();
    },
    getContent: function(){        
        var self = this;
        
        // 로딩중일때
        if (self.isLoading == true){
            return;
        }
        // 로딩할 슬라이드가 없을때        
        if (!!self.loadQUE[0] == false){
            return;
        }
        var targetSlide = self.loadQUE.shift();
        var currentSlide = targetSlide.slide;
        var pushFlag = targetSlide.pushFlag;

        self.isLoading = true;

        var href = $(currentSlide).data().href;
        var isLoaded = $(currentSlide).data().isLoaded;
        var hash = '/' + $(currentSlide).data().hash;
        var currentPageData = _PAGE_DATA[$(currentSlide).data().hash];

        if (pushFlag){
            self.setDigitalData(currentPageData);
        }

        if (hash == '/home'){
            hash = '/';
        }

        if (!href) return;

        if (isLoaded) {
            if (pushFlag){
                self.ablePushState = true;      
            }

            if(self.ablePushState) {
                history.pushState({}, '', hash);      
                self.switchQuickMenu( hash );  
                self.ablePushState = false;
            }

            self.isLoading = false;
            self.getContent();
            self.storyHomeToastChk(currentSlide) //BTOCSITE-188

            
            return;
        }

        $.ajaxSetup({
            cache:true
        });

        $.ajax({
            method: 'GET',
            url : href,
            dataType : 'html',
            success : function( res ){
                self._rafRun(self.contentLoad(res,{
                    'currentSlide':currentSlide,
                    'pushFlag':pushFlag,
                    'hash':hash
                }));
            },
            error : function(error){
                console.log('mainSwiper cant get HTML', error);
            }
        });

        self.storyHomeToastChk(currentSlide) //BTOCSITE-188
    },
    setDigitalData : function( pageData ){
        var self = this;
        // GA 관련 데이터 셋팅
        if (typeof(digitalData) !== 'undefined'){
            if (!!pageData){
                digitalData.pageInfo = pageData.digitalData.pageInfo;
            }
        } else {
            if (!!pageData){
                window.digitalData = {};
                window.digitalData.pageInfo = pageData.digitalData.pageInfo;
            }
        }
        // 타이틀, 메타값 변경
        $('link[rel="canonical"]').attr('href' , pageData.meta['canonical']);
        $('meta[name="description"]').attr('content' , pageData.meta['description']);
        $('meta[property="og:description"]').attr('content' , pageData.meta['og:description']);
        $('meta[property="og:image"]').attr('content' , pageData.meta['og:image']);
        $('meta[property="og:locale"]').attr('content' , pageData.meta['og:locale']);
        $('meta[property="og:site_name"]').attr('content' , pageData.meta['og:site_name']);
        $('meta[property="og:title"]').attr('content' , pageData.meta['og:title']);
        $('meta[property="og:type"]').attr('content' , pageData.meta['og:type']);
        $('meta[property="og:url"]').attr('content' , pageData.meta['og:url']);
        $('title').text(pageData.meta['title']);
        $('meta[name="twitter:card"]').attr('content' , pageData.meta['twitter:card']);

        // GA 커스텀 이벤트 실행
        if (!!self.customEventActionString && typeof(dataLayer) !== 'undefined' && self.isSwiped == true){
            dataLayer.push({
                'event': 'customEvent',				
                'customEventCategory': '스와이프',				
                'customEventAction': self.customEventActionString
            });
        } else {
            self.isSwiped = true;    // BTOCSITE-2947 add
        }
    },
    setMobileNav : function(){
        var self = this;
        var $tabs = this.$tabs;
        $tabs.on('click', function( e ){ 
            e.preventDefault();           
            var idx = $tabs.index(this);            
            self.isSwiped = false;    // BTOCSITE-2947 add
            self.swiper.slideTo(idx);
        });
    },
    setUrlEvent : function(){
        var self = this;
        $(window).on('popstate', function(){
            var hash = self.getLastSegmentByUrl();
            var idx = self.getIndexByHash( hash !== '' ? hash : 'home' );
            mainSwiper.isSwiped = false;    // BTOCSITE-2947 add
            self.swiper.slideTo(idx);            
        });
    },
    // fixed 처리된 모달 수정값
    getLeft: function(){
        return Math.abs($('#sw_con .swiper-wrapper').offset().left);
    },
    // url 마지막 경로 
    getLastSegmentByUrl: function(){
        return window.location.href.split('/').pop().split('?')[0];
    },

    getHash: function(){
        var hash = '';
        var lastSeq = this.getLastSegmentByUrl();
        if (!!this.urlToHash[ lastSeq ] == false ){
            // BTOCSITE-2947 :: 파라미터가 붙어있을때
            if ( lastSeq.split('?').length > 1 ){
                hash = this.urlToHash[ lastSeq.split('?')[0] ]
            } else {
                hash = this.urlToHash['home'];
            }
        } else {
            hash = this.urlToHash[ lastSeq ];
        }

        return hash;
    },

    getIndexByHash: function( hash ){
        var index = false;
        this.hashArray.forEach(function( value, idx ){
            if (value == hash) index = idx;
        });

        return index == false ? 0 : index;
    },

    setActiveTabByHash: function( hash ){
        var idx = this.getIndexByHash( hash );
        this.$tabs.removeClass('on').eq(idx).addClass('on');        
    },

    switchQuickMenu : function( hash ){
        // 퀵메뉴 처리
        if ( hash == '/support' ){
            $('#floatBox > .btn-floating-wrap').hide();
            $('#floatBox > .floating-wrap').hide();
            $('#floatBox > #quickMenu').show();
        } else {
            $('#floatBox > #quickMenu').hide();
            $('#floatBox > .btn-floating-wrap').show();
            $('#floatBox > .floating-wrap').show();
        }
        // 앱 AR 버튼 처리
        if ( hash == '/' ){
            $('.floating-menu.cs-cst.btn-app-ar').show();
        } else {
            $('.floating-menu.cs-cst.btn-app-ar').hide();
        }
    },    
    removeStatusBar: function(){
        //BTOCSITE_1967
        if( !$('.swiper-slide').find('.mobile-status-bar').length ) {
            return;
        } else {
            $('.swiper-slide').find('.mobile-status-bar').remove();    
        }
    },
    storyHomeToastChk: function(target){
        //BTOCSITE-188
        setTimeout(function(){
            if( $('.swiper-slide-active').find('.story-main').length > 0 && lgkorUI.getCookie('storyHomeFirstTag') != "Y" && $('.swiper-slide-active').find('.story-main .user_story').is(':visible') == true) {
                $(window).trigger("toastshow", "구독하고 있는 스토리를 확인해보세요");
                lgkorUI.setCookie('storyHomeFirstTag', "Y", false, 30)
            }    
        }, 100);
        
    },

    // S BTOCSITE-12128 메인성능개선
    setArBtn : function(){
        // 플로팅 버튼 AR 관련
        if (vcui.detect.isMobileDevice){
            var isApplication = isApp();

            setTimeout(function(){
                if (isApplication){
                    $('.floating-menu.btn-app-ar').css('display', 'block');                    
                    $('.floating-menu.top').hide();
                    $('.floating-menu.top').addClass('call-yet');
                    $(window).trigger('floatingTopHide');
                    $(window).scrollTop(0);
                }
            }, 100);

            $(window).on('scroll.floating', function(){                
                var scrollTop = $(window).scrollTop();
                var hasTop = $('.floating-menu.top').hasClass('call-yet');

                if(scrollTop == 0){
                    if(hasTop){
                        if ($('[data-hash=home]').hasClass('swiper-slide-active')){
                            $('.floating-menu.btn-app-ar').css('display', 'block');
                        }
                        
                        $(window).trigger('floatingTopHide');
                        if(!(isApplication && location.pathname == "/")) {
                            $(window).trigger('floatingTopHide');
                        }
                    } else {
                        //앱인데 메인이 아닐경우에만 실행
                        if ($('[data-hash=home]').hasClass('swiper-slide-active')){
                            $('.floating-menu.btn-app-ar').css('display', 'block');
                        }
                        $(window).trigger('floatingTopHide');
                        if(!(isApplication && location.pathname == "/")) {
                            $(window).trigger('floatingTopHide');
                        }
                        //임시 추가 끝
                    }
                }else{
                    if(hasTop){
                        if ($('[data-hash=home]').hasClass('swiper-slide-active')){
                            $('.floating-menu.btn-app-ar').css('display', 'block');
                        }
                        
                        $(window).trigger('floatingTopShow');

                    } else {
                        if ($('[data-hash=home]').hasClass('swiper-slide-active')){
                            $('.floating-menu.btn-app-ar').css('display', 'block');
                        }
                        $(window).trigger('floatingTopShow');
                    }                       
                }
            });
        }
    },
    // E BTOCSITE-12128 메인성능개선
    contentLoad : function(html,opt) {
        var self = this;

            self.setInnerHTML($(opt.currentSlide)[0], html); // JQUERY APPEND 비동기 로딩시 너무 렌더링이 느려서 innerHtml 을 이용한 스크립트 로딩
            
            lgkorUI.init( $(opt.currentSlide) ).done(function( msg ){
                // console.log('컨텐츠 로드 성공', msg);
                $(opt.currentSlide).data().isLoaded = true;                
                $(opt.currentSlide).attr('data-isLoaded', true);
                isLoaded = true;

                if (isLoaded && opt.pushFlag){
                    self.ablePushState = true;                        
                }

                if(self.ablePushState) {
                    if (!self.isFirstLoad){
                        history.pushState({}, '', opt.hash);
                    }
                    
                    self.switchQuickMenu( opt.hash );  
                    self.ablePushState = false;
                }

                self.isLoading = false;

                if (self.isFirstLoad) self.isFirstLoad = false;

                self.getContent();

                vcui.require(['ui/lazyLoaderSwitch'], function (){
                    setTimeout(function(){
                        mainSwiper.swiper.updateAutoHeight();
                        $('body').vcLazyLoaderSwitch('reload', $(opt.currentSlide));
                    }, 500);
                });
            });
    },
    setInnerHTML : function(elm, html) {
        elm.innerHTML = html;
        Array.from(elm.querySelectorAll("script")).forEach( oldScript => {
          const newScript = document.createElement("script");
          Array.from(oldScript.attributes)
            .forEach( attr => newScript.setAttribute(attr.name, attr.value) );
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
          oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    },
    _rafRun : function (cb) {
        var tick = false
      
        return function trigger() {
          if (tick) {
            return
          }
      
          tick = true
          return requestAnimationFrame(function task() {
            tick = false
            return cb()
          })
        }
    }
}

$(function(){
    var mainSwiperID = 'mobileNav';
    window.mainSwiper = new MainSwiper( mainSwiperID );

});
