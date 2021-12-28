$(window).ready(function(){
	if(!document.querySelector('.KRC0032')) return false;

	$('.KRC0032').buildCommonUI();

	vcui.require(['ui/carousel', 'libs/intersection-observer.min'], function () {
		//해당 슬라이드 자동재생(autoplay) 시작 -BTOCSITE-8039
		function carouselPlay(target){
			$(target).vcCarousel('play');
		}
		
		//해당 슬라이드 자동재생(autoplay) 멈춤 -BTOCSITE-8039
		function carouselStop(target){
			$(target).vcCarousel('pause');
		}

		//슬라이드 이동 시 - 이전 슬라이드의 재생중인 비디오 정지 & 재생시간 초기화 -BTOCSITE-8039
		function prevVideoPause(slide, prev){
			if($(slide.$slides.get(prev)).attr("ui-modules") == "VideoBox"){
				$(slide.$slides.get(prev)).find("video").get(0).currentTime = 0;
				$(slide.$slides.get(prev)).find("video").get(0).pause();
			}
		}
		//슬라이드 이동 시 - 이전 슬라이드의 활성화된 유튜브레이어 닫기 -BTOCSITE-8039
		function prevYoutubeBoxClose(slide, prev){
			if($(slide.$slides.get(prev)).find('.youtube-box .video-box-closeset').length){
				$(slide.$slides.get(prev)).find(".close-video").trigger('click');
			}
		}

		//슬라이드가 화면 중앙에 올 때 이벤트 -BTOCSITE-8039
		function sectionEnterEvent(target){
			carouselPlay(target)
		}

		//슬라이드가 화면 중앙에서 벗어날 때 이벤트 -BTOCSITE-8039
		function sectionLeaveEvent(target){
			carouselStop(target)
		}

		//자동재생 반복 횟수 체크 후 정지  -BTOCSITE-8039
		function autoStateChange(slide, prev, next){
			if( prev == slide.$slides.length-1 && prev > next ) {
				var $slide = $(slide.$slider);
				var currentCount = $slide.data('currentCount');
				var autoCount = $slide.data('autoCount');

				if( autoCount != 'loop' && autoCount > 0) {
					if( currentCount < autoCount -1) {
						$slide.data('currentCount', currentCount + 1);
					} else {
						carouselStop(slide.$slider);
					}
				}
			}
		}

		//커스텀 인디케이터 -BTOCSITE-8039
		function customDots(slide, index){
			var $slider = $(slide.$slider);
			var currentSpeed = $slider.data('autoSpeed') != undefined && $slider.data('autoSpeed') > 0 ?  $slider.data('autoSpeed') : 5000;
			var buttonClass = $slider.hasClass('indi-type-bar') ? 'btn-indi-bar' : $slider.hasClass('indi-type-bar-text') ? 'btn-indi-bar-text' : 'btn-indi';
			var buttonInnerEl = '';
			
			if( $slider.hasClass('indi-type-bar')) {
				buttonInnerEl = '<span class="blind">' + index + 1 + '번 내용 보기</span><span class="bar" style="animation-duration:' + currentSpeed/1000 + 's"></span>';
			} else if($slider.hasClass('indi-type-bar-text')){
				buttonInnerEl = '<span class="text">' + $(slide.$slides[index]).data('slideTitle') + '</span><span class="bar" style="animation-duration:' + currentSpeed/1000 + 's"></span>';
			} else {
				buttonInnerEl = '<span class="blind">' + index + 1 + '번 내용 보기</span>';
			}
			return $('<button type="button" class="' + buttonClass + '" />').html(buttonInnerEl);
		} 
		
		//슬라이드가 화면 중앙인지 아닌지를 체크하여 해당 이벤트 실행 -BTOCSITE-8039
		var io = new IntersectionObserver(function(entries, observer) {
			entries.forEach((entry) => {
				entry.isIntersecting ? sectionEnterEvent(entry.target) : sectionLeaveEvent(entry.target);
			});                            
		}, {root: null, threshold: 0.5});
		
		$('.KRC0032').find(".ui_carousel_slider").each(function(cdx, slide){
			var $slide 			= $(this),
				autoPlaySpeed 	= $slide.data('autoSpeed') != undefined && $slide.data('autoSpeed') != "" ? $slide.data('autoSpeed') : 5000,
				autoCount 		= $slide.data('autoCount') != undefined && $slide.data('autoCount') != "" ? $slide.data('autoCount') : false;

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
			})
			.vcCarousel({
				infinite: true,
				autoplay: false,
				autoplaySpeed: autoPlaySpeed,
				prevArrow:'.btn-arrow.prev',
				nextArrow:'.btn-arrow.next',
				slidesToShow: 1,
				slidesToScroll: 1,
				playSelector: '.btn-play.play',
				adaptiveHeight:true,
				cssEase: 'cubic-bezier(0.33, 1, 0.68, 1)',
				speed: 150,
				touchThreshold: 100,
				customPaging: function(slide, i) {
					return customDots(slide, i)
				},
			})
			.on('carouselbeforechange', function(e, slide, prev, next){

				prevVideoPause(slide, prev);
				prevYoutubeBoxClose(slide, prev);
				autoStateChange(slide, prev, next)
			
			})
			.on('carouselafterchange', function(e, slide, currentSlide){
				var $slider = $(slide.$slider);
				var $currentSlide = $(slide.$slides.get(currentSlide));
				var autoSpeed = $slider.data('autoSpeed') ? $slider.data('autoSpeed') : 5000;
				if($currentSlide.attr("ui-modules") == "VideoBox"){
					autoSpeed =	$currentSlide.find("video").get(0).duration * 1000;
					$currentSlide.find("video").get(0).play();
				} 
				$slider.find('.indi-wrap li').eq(currentSlide).find('.btn-indi-bar .bar, .btn-indi-bar-text .bar').css({
					'animation-duration' : autoSpeed/1000 + 's'
				})
				$slider.vcCarousel('setOption', 'autoplaySpeed', autoSpeed)
			});	

			io.observe(slide);
		});
	});
})