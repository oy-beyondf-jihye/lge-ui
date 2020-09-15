$(window).ready(function(){

    if(!document.querySelector('.KRC0012')) return false;

    $('.KRC0012').buildCommonUI();

	var KRP0012 = {
        scrolling: function (pos, scrolls) {
            var msec = Math.abs(scrolls) / 20;
            if(msec < 250) {
                msec = 250;
            }
            if(msec > 400) {
                msec = 400;
            }

			//$([document.documentElement, document.body]).animate({
            $('html, body').stop().animate({
				scrollTop: pos
			}, msec);
        },
        
        init: function(){
            var _t = this;

            $('.tooltip-text').on('click', function (e) {
                e.preventDefault();
                $(this).closest(".component").children(".desc").addClass("bg-gray");
                $(this).closest(".list-btn-area").next(".more-content").addClass("open").slideDown(400);

                var tg = $(this).closest(".component");
				var adjustOption = ($(".KRC0012").length>0) ? Math.round($(".KRC0012").outerHeight()) : 0;
				var contTop = tg.find(".more-content").offset().top;
                var contAdjustTop = Math.round(contTop - adjustOption);
                    
                _t.scrolling($(this).closest(".list-btn-area").next(".more-content").offset().top, contAdjustTop);
            });

            $('.in-close').on('click', function (e) {
                e.preventDefault();
                $(this).closest(".component").children(".desc").removeClass("bg-gray");
                $(this).closest(".more-content").removeClass("open").slideUp(400);
                
                $(this).closest(".more-content").prev('.list-btn-area').children('.more').focus();

                var tg = $(this).closest(".component");
				var adjustOption = ($(".KRC0012").length>0) ? Math.round($(".KRC0012").outerHeight()) : 0;
				var tgTop = tg.offset().top;
                var tgAdjustTop = Math.round(tgTop - adjustOption);

                _t.scrolling($(this).closest(".component").offset().top, tgAdjustTop);
            });
        }
    }
    KRP0012.init();
});