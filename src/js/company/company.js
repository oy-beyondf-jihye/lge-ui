$(document).ready(function() {
    // 아코디언 닫기 버튼
	$(".accordion-wrap .menu-close").on('click', function(e){
		var heada = $(this).parent().parent().parent().find(".head a");
		heada.trigger("click");
		var scrollPosition = heada.offset().top;
		scrollPosition = scrollPosition - 100;
		$('html, body').stop().animate({scrollTop: scrollPosition}, 500);
    });

	//팝업 오픈
	$("button[data-href]").on('click', function(e){
		e.preventDefault();
		var _id = $(this).data("href");
		$(_id).vcModal({opener: this});
    });

	// 셀렉트 탭
	$(".tabs-selectbox select").on('change', function(e){
		var _value = $(this).val();
		if(_value){
			$(".company .tabs-contents").removeClass("on");
			$("#" + _value).show().siblings(".tabs-contents").hide();
		}
		else{
			$(".company .tabs-contents").addClass("on").show();
		}
    });
  
	// 탭 슬라이드
	setTimeout(function(){
		fcTabScrollLeft($('.border-type .tabs'));
		fcTabScrollLeft($('.btn-type .tabs'));
	}, 500);
});

function fcTabScrollLeft(tab){
	var totalWidth = -20;
	var liWidth = 0;
	var scrollLeft = 0;
	var scrollLeftEnd = 0;
	tab.find("li").each(function(index){
		liWidth = $(this).width();
		if($(this).hasClass("on")){
			scrollLeft = totalWidth;
			scrollLeftEnd = totalWidth + liWidth + 20;
		}
		totalWidth += liWidth + 20;
	});
	var tabWidth = tab.width();
	if(scrollLeftEnd > tabWidth){
		tab.scrollLeft(scrollLeft);
	}
}