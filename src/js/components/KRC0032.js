$(window).ready(function(){
	if(!document.querySelector('.KRC0032')) return false;

	$('.KRC0032').buildCommonUI();

	vcui.require(['ui/carousel', 'libs/intersection-observer.min'], function () {

		var option = {
			root: null,
			threshold: 0.5
		};

		function carouselPlay(target){
			$(target).find('.ui_carousel_play.play button').trigger('click');
		}

		function carouselStop(target){
			$(target).find('.ui_carousel_play.stop button').trigger('click');
		}
		  
		var io = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				entry.isIntersecting ? carouselPlay(entry.target) : carouselStop(entry.target);
			});                            
		}, option);
		
		// function viewPortVideoPlay(target){
		// 	$(target).each(function(idx, slide){
		// 		var $slide = $(slide);
		// 		var winTop = $(window).scrollTop();
		// 		var _offTop = $slide.offset().top;
		// 		var _height = $slide.outerHeight(true);
		// 		var _offBottom = _offTop + _height;
		// 		var viewTop = winTop + (window.innerHeight*0.25);
		// 		var viewBottom = winTop + (window.innerHeight*0.75);

		// 		if(viewBottom > _offTop && viewTop < _offBottom){
		// 			console.log('enter22222')
		// 			$slide.find('.ui_carousel_play.play .btn-play').trigger('click');
		// 		} else {
		// 			if( $slide.data('autoCount') != 'loop' && $slide.data('autoCount') > 0) {
		// 				$slide.data('currentCount', 0);
		// 			}
		// 			$slide.find('.ui_carousel_play.stop .btn-play').trigger('click');
		// 		}
		// 	})
		// }

		$('.KRC0032').find(".ui_carousel_slider").each(function(cdx, slide){
			var $slide = $(this);
			var autoPlaySpeed = $slide.data('autoSpeed') != undefined && $slide.data('autoSpeed') != "" ? $slide.data('autoSpeed') : 5000;
			var dotType = $slide.data('dotType') != undefined && $slide.data('dotType') != "" ? $slide.data('dotType') : '1';
			var autoCount = $slide.data('autoCount') != undefined && $slide.data('autoCount') != "" ? $slide.data('autoCount') : false;

			if( autoCount != 'loop' && autoCount != undefined) {
				$slide.data('currentCount', 0);
			}

			if( $slide.find('.ui_carousel_slide').eq(0).find('video').length ) {
				autoPlaySpeed = $slide.find('.ui_carousel_slide').eq(0).find('video')[0].duration * 1000;
			}

			$slide.on('carouselinit', function(e,data){
				vcui.require(['ui/videoBox','ui/youtubeBox'], function(){
					$('.KRC0032').find(".ui_carousel_slider .youtube-box").vcYoutubeBox();
					$('.KRC0032').find(".ui_carousel_slider .animation-box").vcVideoBox();
					var $currentSlide = $(data.$slides[data.currentSlide]);
					if($currentSlide.attr("ui-modules") == "VideoBox"){
						//$currentSlide.find("video").get(0).play()
 					}
				});

			}).vcCarousel({
				infinite: true,
				autoplay: false,
				autoplaySpeed: autoPlaySpeed,
				prevArrow:'.btn-arrow.prev',
				nextArrow:'.btn-arrow.next',
				// dotsSelector: '.ui_wideslider_dots',
				slidesToShow: 1,
				slidesToScroll: 1,
				playSelector: '.btn-play.play',
				adaptiveHeight:true,
				cssEase: 'cubic-bezier(0.33, 1, 0.68, 1)',
				speed: 150,
				touchThreshold: 100,
				customPaging: function(slide, i) {      // 인디케이터 버튼 마크업
					var $slide = $(slide.$slider);

					if( $slide.hasClass('indi-type-bar')) {
						console.log('indi-type-bar')
					}

					if( $slide.hasClass('indi-type-bar-text')) {
						console.log('indi-type-bar-text')
					}

					return $('<button type="button" class="btn-indi" />').html('<span class="blind">' + i + 1 + '번 내용 보깃</span>');
				},
			}).on('carouselbeforechange', function(e, slide, prev, next){

				if($(slide.$slides.get(prev)).attr("ui-modules") == "VideoBox"){
					$(slide.$slides.get(prev)).find("video").get(0).currentTime = 0;
					$(slide.$slides.get(prev)).find("video").get(0).pause();
				}

				if($(slide.$slides.get(prev)).find('.youtube-box .video-box-closeset').length){
					console.log('youtube')
					$(slide.$slides.get(prev)).find(".close-video").trigger('click');
				}


				if( prev > next ) {
					var currentCount = $slide.data('currentCount');
					var autoCount = $slide.data('autoCount');

					if( autoCount != 'loop' && autoCount > 0) {
						if( currentCount < autoCount -1) {
							$slide.data('currentCount', currentCount + 1);
						} else {
							$slide.find('.ui_carousel_play.stop button').trigger('click');
						}
					}
				}
			}).on('carouselafterchange', function(e, slide, currentSlide){
				var $currentSlide = $(slide.$slides.get(currentSlide));
				var autoSpeed = $slide.data('autoSpeed') ? $slide.data('autoSpeed') : 5000;
				if($currentSlide.attr("ui-modules") == "VideoBox"){
					autoSpeed =	$currentSlide.find("video").get(0).duration * 1000;
					$currentSlide.find("video").get(0).play();
				} 
				$slide.vcCarousel('setOption', 'autoplaySpeed', autoSpeed)
			});	

			io.observe(slide);
		});
	});
})