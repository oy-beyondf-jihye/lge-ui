$(window).ready(function(){
	if(!document.querySelector('.KRC0001')) return false;

	$('.KRC0001').buildCommonUI();

	var KRC0001 = {
		init: function(){
			var self = this;
            vcui.require(['ui/carousel'], function () {
				self.setting();
				self.bindEvents();
			});
		},

		setting: function() {
			var self = this;
			
			$('.KRC0001').find(".ui_carousel_slider").each(function(cdx, slide){
				$(slide).vcCarousel({
					infinite: false,
					prevArrow:'.btn-arrow.prev',
					nextArrow:'.btn-arrow.next',
					slidesToShow: 4,
					slidesToScroll: 4,
					responsive: [{
						breakpoint: 100000,
						settings: {
							slidesToShow: 4,
							slidesToScroll: 4,
						}
					},{
						breakpoint: 1320,
						settings: {
							slidesToShow: 3,
							slidesToScroll: 3,
						}
					},{
						breakpoint: 1100,
						settings: {
							slidesToShow: 2,
							slidesToScroll: 2,
						}
					},{
						breakpoint: 768,
						settings: {
							slidesToShow: 1,
							slidesToScroll: 1
						}
					}]
				});
			});

			//$('.ui_smooth_scrolltab').vcSmoothScrollTab();

			self.$section = $('section .KRC0001');

		},

		bindEvents: function() {
			var self = this;
		}
	};
	KRC0001.init();
})