$(window).ready(function(){
    if(!document.querySelector('.KRP0009')) return false;
    
    // vcui.require(['ui/sticky'], function () {
    //     var firstmargin = $('.KRC0040').outerHeight(true);
    //     $('.KRP0009').vcSticky({usedAnchor:true, anchorClass:".tab-menu > a", isContainerAbled:false, firstMarginTop:firstmargin}).on('changeanchor', function(e, data){
    //         console.log("data.selectIdx:", data.selectIdx)
    //         if(data.selectIdx < 1){
    //             $('.KRC0040').slideDown(150);
    //         } else{
    //             $('.KRC0040').slideUp(150);
    //         }
    //     });   
    // });

    ;(function(){
        var $component;
        var $items;
        var $subSticky;

        var selectIdx;
        var prevIdx;

        function init(){
            setting();
            bindEvents();
        }

        function setting(){
            selectIdx = prevIdx = -1;

            $component = $('.KRP0009');
            $items = $component.find('.tab-menu-belt li');
            $items.removeClass('active');

            $subSticky = $('.KRC0040');
            setSubStickyStatus();
            

            $component.parent().height($component.height());
        }

        function bindEvents(){
    
            $component.on('click', '.tab-menu-belt li a', function(e){
                e.preventDefault();
        
                var id = $(this).attr('href');
                scrollMoved(id);
            });

            $(window).on('changeCategory.KRP0009', function(e,data){
                if(data){
                    var $li = $items.filter('[data-link-name="'+data.linkName+'"]' );
                    if($li.length > 0) {
                        $li.find('a').text(data.title);
                    }
                }
            });

            //jsw
            //$(window).trigger("changeButton.KRP0009",{"title":btnTitle,"disabled":false});
            $(window).on('changeButton.KRP0009', function(e,data){
                var btn = $component.find("a.extra-menu");
                //var btn = $component.find("#extraBtn");
                if(data) {
                    btn.find('span').text(data.title);
                    if(data.disabled) {
                        btn.addClass('disabled');
                    } else {
                        btn.removeClass('disabled')
                    }
                }
            });

            $component.find("a.extra-menu").on('click', function(e){
            //$component.find("#extraBtn").on('click', function(e){
                e.preventDefault();

                if(!$(this).hasClass("disabled")) $(window).trigger("sendExtraAction.KRP0009");
            })
        
            $(window).on('scroll.KRP0009', function(e){
                var scrolltop = $(window).scrollTop(); 

                var paddingtop = parseInt($component.parent().css('padding-top'));
                var comptop = $component.parent().offset().top + paddingtop;

                var dist = -scrolltop + comptop;
                if(dist <= 0){
                    $component.addClass('fixed').css({
                        position:"fixed",
                        top:0,
                        zIndex:90
                    });

                    $subSticky.show();

                    var leng = $items.children().length;
                    var lastId = $items.eq(leng-1).find('a').attr('href');
                    if($(lastId).length){
                        var bottom = $(lastId).offset().top + $(lastId).outerHeight(true);
                        if(-scrolltop + bottom < 0){
                            if(!$component.data("isShow")){
                                $component.data('isShow', true);
                                $component.transition({y:-$component.height()}, 300, "easeInOutCubic");
                            } 
                        } else{
                            if($component.data("isShow")){
                                $component.data('isShow', false);
                                $component.transition({y:0}, 300, "easeInOutCubic");
                            } 
                        }
                    }
                } else{
                    $subSticky.hide();
                    $component.removeClass('fixed').removeAttr('style');
                }

                var currentIdx = -1;
                $items.each(function(idx, item){
                    var id = $(item).find('a').attr('href');
                    if($(id).length){
                        var contop = $(id).offset().top;
                        if(-scrolltop + contop <= $component.height()){
                            currentIdx = idx;
                        }
                    }
                });

                if(currentIdx != selectIdx) selectIndex(currentIdx);
            });
        }

        function selectIndex(idx){            
            $items.removeClass('active');

            prevIdx = selectIdx;
            selectIdx = idx;

            if(selectIdx > -1) $items.eq(selectIdx).addClass('active');

            setSubStickyStatus();
        }

        function setSubStickyStatus(){
            var chk = false;
            if(selectIdx < 0){
                if(prevIdx < 1) chk = true;
            } else if(selectIdx == 0) chk = true;

            //if(selectIdx < 1) chk = true;

            console.log(prevIdx, selectIdx, chk)

            if(chk) $subSticky.show().find('.inner').slideDown(150);
            else $subSticky.find('.inner').slideUp(150, function(){$subSticky.hide()});;
        }

        function scrollMoved(id){
            if($(id).length){
                var compheight = $component.height();

                var firstId = $items.eq(0).find('a').attr('href');
                if(id == firstId) compheight = 72;

                var movtop = $(id).offset().top - compheight+2;
    
                $('html, body').stop().animate({scrollTop:movtop}, 200);
            }
        }
    
        init();
    })();
})