(function() {
    $(window).ready(function(){
        if(!document.querySelector('.KRP0010')) return false;

        $('.KRP0010').buildCommonUI();
        
        var maxThumbnailCount = 6;
        
        var KRP0010 = {
            init: function() {
                var self = this;
                self.isDragging = false;
                self.setting();
                self.bindEvents();
            },

            setting: function() {
                var self = this;
                //데스크탑용 갤러리
                self.$pdpVisual = $('#desktop_summary_gallery div.pdp-visual');
                //데스크탑용 갤러리 이미지
                self.$pdpImage = self.$pdpVisual.find('div.pdp-visual-image');
                //데스크탑용 갤러리 썸네일리스트
                self.$pdpThumbnail = self.$pdpVisual.find('div.pdp-thumbnail-nav div.inner div.pdp-thumbnail-list ul.thumbnail-list');
                //PDP 더보기
                self.$pdpMoreInfo = self.$pdpVisual.find('div.pdp-more-info');
                //선택된 데스크탑 썸네일
                self.$selectItemTarget = self.$pdpThumbnail.find('li.thumbnail.active');

                //모바일용 갤러리
                self.$pdpMobileVisual = $('#mobile_summary_gallery');
                self.$pdpMobileVisual.hide();
                //모바일용 갤러리 슬라이더
                self.$pdpMobileSlider = self.$pdpMobileVisual.find('div.ui_carousel_slider');
                //모바일용 갤러리 썸네일 슬라이더
                self.$pdpMobileSliderTrack = self.$pdpMobileSlider.find('div.slide-content ul.slide-track');

                //PDP모달
                self.$popPdpVisual = $('#pop-pdp-visual');
                //PDP모달 이미지타입
                self.$popPdpVisualImage = self.$popPdpVisual.find('#modal_detail_target div.image');
                //PDP모달 비디오타입
                self.$popPdpVisualVideo = self.$popPdpVisual.find('#modal_detail_target div.video');
                //PDP모달 애니메이션타입
                self.$popPdpVisualAnimation = self.$popPdpVisual.find('#modal_detail_target div.animation');
                //PDP모달 썸네일 리스트
                self.$popPdpThumbnail = self.$popPdpVisual.find('div.pop-pdp-thumbnail-nav ul.pop-thumbnail-list');
                //선택된 PDP모달 썸네일
                self.$selectModalItemTarget = self.$popPdpThumbnail.find('li.pop-thumbnail.active');
                //PDP모달 확대축소 버튼영역
                self.$popPdpZoomArea = self.$popPdpVisual.find('div.zoom-btn-area');

                //vcui.require(['ui/carousel'], function () {
                    self.$pdpMobileSlider.vcCarousel({
                        infinite: false,
                        autoplay: false,
                        swipeToSlide: true,
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        prevArrow:'.btn-arrow.prev',
                        nextArrow:'.btn-arrow.next',
                        focusOnSelect: false,
                        focusOnChange: false
                    });
                    self.$pdpMobileVisual.show();
                //});

            },

            bindEvents: function() {
                var self = this;

                //핀치줌
                vcui.require(['ui/pinchZoom'], function (PinchZoom) {
                    self.pinchZoom = new PinchZoom('.zoom-area');
    
                    self.$popPdpVisual.find('div.zoom-btn-area a.zoom-plus').on('click', function(){
                        var zoom =self. pinchZoom.getZoomFactor();
                        if(Math.round(zoom) >= 4) zoom = 0;
                        self.pinchZoom.runZoom(zoom+1, true); 
                    });
    
                    self.$popPdpVisual.find('div.zoom-btn-area a.zoom-minus').on('click', function(){
                        var zoom =self.pinchZoom.getZoomFactor();
                        self.pinchZoom.runZoom(zoom-1, true); 
                    });
    
                    self.$popPdpVisualImage.mousedown(function() {
                        self.isDragging = false;
                    })
                    .mousemove(function() {
                        self.isDragging = true;
                     })
                    .mouseup(function() {
                        var wasDragging = self.isDragging;
                        self.isDragging = false;
                        if (!wasDragging) {
                            self.$popPdpVisual.find('div.zoom-btn-area a.zoom-plus').trigger('click');
                        }
                    });
                    
                    //pinchZoom.update(true);
                });

                //데스크탑용 갤러리 이미지 클릭
                self.$pdpImage.find('a').first().on('click',function(e){
                    e.preventDefault();
                    var index = $(this).attr("data-idx"); 
                    self.openVisualModal(index);
                });

                //데스크탑용 썸네일리스트 클릭
                self.$pdpThumbnail.on('click','li.thumbnail a',function(e) {
                    e.preventDefault();
                    var $li = $(this).parent();
                    var index = $li.find('input[name="index"]').val();
                    if($li.hasClass('more')) {
                        //더보기 버튼은 바로 pdp모달 뛰움
                        self.openVisualModal(index);
                    } else {
                        //썸네일 클릭
                        self.clickThumbnailSlide(index);
                    }
                });

                //PDP 갤러리 더보기
                self.$pdpMoreInfo.on('click','a',function(e) {
                    e.preventDefault();
                    self.requestModal(this);
                });

                //모바일용 갤러리 클릭
                self.$pdpMobileSlider.on('click', function(e){ 
                    e.preventDefault();
                    var index = $(this).find(".ui_carousel_current").attr("data-ui_carousel_index");
                    console.log(index);
                    self.openVisualModal(index); 
                });

                //pdp모달 썸네일 리스트 클릭
                self.$popPdpThumbnail.on('click','li.pop-thumbnail a',function(e) {
                    e.preventDefault();
                    var $li = $(this).parent();
                    var index = $li.find('input[name="index"]').val();
                    self.clickModalThumbnail(index);
                });
            },

            findHiddenInput: function($el) {
                var inputs = $el.find('input');
                var item = {};
                inputs.each(function (i, o) {
                    item[$(o).attr('name')] = $(o).val();
                });
                return item;
            },

            //썸네일 리스트 클릭
            clickThumbnailSlide: function(index) {
                var self = this;
    
                var thumbItem = self.$pdpThumbnail.find('li.thumbnail:nth-child('+(parseInt(index)+1)+')');
                var item = self.findHiddenInput(thumbItem);
                console.log(index,thumbItem);

                switch(item.type) {
                    case "image":
                        //이전에 선택되었던 썸네일 활성화 제거 및 새로운 썸네일 활성화
                        if(self.$selectItemTarget) {
                            self.$selectItemTarget.removeClass('active');
                        }
                        self.$selectItemTarget = thumbItem;
                        self.$selectItemTarget.addClass('active');

                        self.$pdpImage.find('a').attr({'data-link-name':item.linkName,'data-idx':(""+index)});
                        self.$pdpImage.find('a img').attr({'src':item.imageUrl,'alt':item.alt});
                        break;
                    case "video":
                    case "animation":
                        self.openVisualModal(index);
                        break;
                    default:
                        break;
                }
            },

            //PDP모달 오픈
            openVisualModal: function(index) {
                var self = this;
                self.clickModalThumbnail(index);
                $('#pop-pdp-visual').vcModal();
            },

            clickModalThumbnail: function(index) {
                var self = this;
                var thumbItem = self.$popPdpThumbnail.find('li.pop-thumbnail:nth-child('+(parseInt(index)+1)+')');
                var item = self.findHiddenInput(thumbItem);

                //이전에 선택되었던 썸네일 활성화 제거 및 새로운 썸네일 활성화
                if(self.$selectModalItemTarget) {
                    self.$selectModalItemTarget.removeClass('active');
                }
                self.$selectModalItemTarget = thumbItem;
                self.$selectModalItemTarget.addClass('active');
    
                self.pinchZoom.runZoom(1, false);
                self.$popPdpVisualVideo.html('');
                self.$popPdpVisualAnimation.find('div.animation-box').vcVideoBox('reset');
    
                switch(item.type) {
                    case "image":
                        self.$popPdpVisualImage.find('div.zoom-area img').attr({'data-pc-src':item.imagePC,'data-m-src':item.imageMobile});
                        //vcui.require(['ui/imageSwitch'], function () {
                            self.$popPdpVisualImage.vcImageSwitch('reload');
                            self.$popPdpVisualImage.show();
                            self.$popPdpVisualVideo.hide();
                            self.$popPdpVisualAnimation.hide();
                            self.$popPdpZoomArea.show();
                            self.pinchZoom.update(true);
                        //});
                        break;
                    case "video":
                        var template = '<div class="item-box visual-box"><div class="video-container video-box youtube-box">' +
                            '<div class="thumnail">' +
                                '<img data-pc-src="{{imagePC}}" data-m-src="{{imageMobile}}" alt="{{alt}}">' +
                                '<a href="#" data-src="{{adUrl}}" class="see-video acc-video-content" title="Opens in a new layer popup" role="button" data-video-content="acc-video" data-type="youtube" data-link-area="" data-link-name="{{linkName}}" aria-describedby="{{alt}}">plays audio description video</a>' +
                            '</div><div class="video-asset video-box-closeset">' +
                                '<iframe id="videoPlayerCode" frameborder="0" allowfullscreen="1" allow="accelerometer;encrypted-media; gyroscope; picture-in-picture" title="YouTube video player" width="640" height="360" src="{{videoUrl}}"></iframe>' + 
                            '</div></div></div>'
                        self.$popPdpVisualVideo.html(vcui.template(template,item));
                        //vcui.require(['ui/imageSwitch','ui/youtubeBox'], function () {
                        vcui.require(['ui/youtubeBox'], function () {
                            self.$popPdpVisualVideo.vcImageSwitch('reload');
                            self.$popPdpVisualVideo.find('.youtube-box').vcYoutubeBox();
                            self.$popPdpVisualImage.hide();
                            self.$popPdpVisualVideo.show();
                            self.$popPdpVisualAnimation.hide();
                            self.$popPdpZoomArea.hide();
                        });
                        break;
                    case "animation":
                        self.$popPdpVisualAnimation.find('div.visual-box div.visual-area a').attr({'data-src':item.adUrl,'aria-describedby':item.alt});
                        self.$popPdpVisualAnimation.find('div.visual-box div.visual-area p.hidden').text(item.alt);
                        self.$popPdpVisualAnimation.find('div.visual-box div.visual-area div.animation-area video source').attr({'src':item.videoUrl,'type':('video/'+item.videoType)});
                        self.$popPdpVisualAnimation.find('div.visual-box div.visual-area div.animation-area video').attr({'src':item.videoUrl});
                        //self.$popPdpVisualAnimation.find('div.animation-box').vcVideoBox('play');
                        self.$popPdpVisualImage.hide();
                        self.$popPdpVisualVideo.hide();
                        self.$popPdpVisualAnimation.show();
                        self.$popPdpZoomArea.hide();
                        break;
                    default:
                        break;
                }
            },

            requestModal: function(dm) {
                var self = this;
                var ajaxUrl = $(dm).attr('href');
                lgkorUI.requestAjaxData(ajaxUrl, null, function(result){
                    self.openModalFromHtml(result);
                }, null, "html");
            },

            openModalFromHtml: function(html) {
                $('#event-modal').html(html).vcModal();
            },

        };

        KRP0010.init();
    });
})();