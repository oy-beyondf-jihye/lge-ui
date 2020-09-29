(function(){
    
    var cityArr = [
        {title:'시/도선택', value:''},
        {title:'서울', value:'서울'},
        {title:'인천', value:'인천'},
        {title:'부산', value:'부산'},
        {title:'대구', value:'대구'},
        {title:'대전', value:'대전'},
        {title:'광주', value:'광주'},
        {title:'울산', value:'울산'},
        {title:'제주', value:'제주'},
        {title:'경기', value:'경기'},
        {title:'세종', value:'세종'},
        {title:'경남', value:'경남'},
        {title:'경북', value:'경북'},
        {title:'충남', value:'충남'},
        {title:'충북', value:'충북'},
        {title:'전남', value:'전남'},
        {title:'전북', value:'전북'},
        {title:'강원', value:'강원'},
    ];

    var listTemplate = ''+
        '<li data-id="{{agNum}}">'+
        '   <div class="store-info-list ui_marker_selector" role="button" tabindex="0">'+
        '        <div class="point-wrap">'+
        '           <div class="point{{selected}}">'+
        '                <span class="num">{{num}}</span>'+
        '                <span class="blind">선택안됨</span>'+
        '            </div>'+
        '        </div>'+
        '        <div class="info-wrap">'+
        '            <div class="tit-wrap">'+
        '                <p class="name"><span class="blind">매장명</span>{{agName}}</p>'+
        '                <div class="flag-wrap">'+
        '                    {{#if agNewShopComment != null }}<span class="flag">NEW</span>{{/if}}'+
        '                    {{#if isEvent}}<span class="flag">이벤트</span>{{/if}}'+
        '                    {{#if agCenterWeekday != null }}<span class="flag">서비스센터</span>{{/if}}'+
        '               </div>'+
        '            </div>'+
        '            <p class="addr"><span class="blind">주소</span>{{agAddr1}}</p>'+
        '            <div class="etc-info">'+
        '                <span class="tel"><span class="blind">전화번호</span>{{agTel}}</span>'+
        '                <a href="#" class="btn-detail">상세보기</a>'+
        '            </div>'+
        '        </div>'+
        '    </div>'+
        '</li>';

        var searchResultText = {
            search:'<strong>"{{keyword}}"</strong>과 가까운 <strong>{{total}}개</strong>의 매장을 찾았습니다.'
        }

    var searchShop = {
        init: function(){
            var self = this;
            
            self._setting();
        },

        _setting: function(){
            var self = this;

            self.windowWidth;
            self.windowHeight;

            self.isTransion = false;

            self.isChangeMode = false;
            self.searchResultMode = false;

            self.bestShopUrl = $('.map-container').data("bestshop");

            self.$leftContainer = $('.store-list-wrap'); //좌측 검색&리스트 컨테이너...

            self.$defaultListContainer = self.$leftContainer.find('.list-wrap'); //리스트 컨테이너...
            self.$defaultListLayer = self.$defaultListContainer.find('.sch-list .scroll-wrap .list-item'); 

            self.$searchContainer = self.$leftContainer.find('.sch-box');

            self.$map = null; //맵 모듈...
            self.$mapContainer = $('.map-area'); //맴 모듈 컨테이너...
            
            self.$optionContainer = $('.opt-cont'); //옵션 컨테이너...
            self.$optionContainer.find('.all-chk input[type=checkbox]').attr('checked', true);

            //검색...
            self.searchKeywords = {};

            self.$searchField = $('#tab1 .input-sch input');
            self.$searchButton = $('#tab1 .btn-search');

            self.$searchResultContainer = $('.result-list-box');
            
            vcui.require(['ui/storeMap', 'ui/tab'], function () {
				
				self.$mapContainer.vcStoreMap({
                    baseUrl:'',
                    storeDataUrl: self.bestShopUrl
				}).on('mapinit', function(e,data){
                    self.$map = self.$mapContainer.vcStoreMap('instance');
                    
                    self._bindEvents();		

				}).on('mapchanged', function(e, data){	
                    
                    self.$defaultListContainer.find('.scroll-wrap').scrollTop(0);
                    self._setItemList(data);
                    self._setItemPosition();

                    if(self.searchResultMode){
                        self._setSearchResultMode();
                    }

				}).on('mapitemclick', function(e,data){

                    self._setMarkerSelected(data.id);
                    self._setItemPosition();
                    
				}).on('mapsearchnodata', function(e){
                    //검색 결과 없을 때...
                    
                }).on('maperror', function(e, error){
					console.log(error);
                });		

                $(".sch-box .tabs-wrap.ui_store_search_tab").vcTab()
                .on("tabchange", function(e, data){
                    self._setListArea();
                });
			});
        },

        _bindEvents: function(){
            var self = this;

            self.$optionContainer.on('click', '.btn-sel', function(e){
                e.preventDefault();

                self._toggleOptContainer();
            });

            self.$defaultListLayer.on('click', 'li > .ui_marker_selector', function(e){
                var $target = $(e.currentTarget);
                var id = $target.parent().data('id');
                
                self.$map.selectedMarker(id);
            })
            .on('click', 'li > .ui_marker_selector .btn-detail', function(e){
                e.preventDefault();

                console.log(e);
                //showDetailInfo(id);  
            });

            self.$searchField.on('focus', function(e){
                $(window).on('keyup.searchShop', function(e){
                    if(e.keyCode == 13) self._setSearch();
                })
            });
            self.$searchButton.on('click', function(e){
                self._setSearch();
            });

            self.$searchResultContainer.on('click', '.btn-back', function(e){
                e.preventDefault();

                self._returnSearchMode();
            });

            self.$searchContainer.on('click', '.btn-view', function(e){
                e.preventDefault();

                self._showMap();
            });

            self.$leftContainer.on('click', '.btn-fold', function(e){
                e.preventDefault();

                self._toggleLeftContainer();
            })

            self.$optionContainer.find('.all-chk dd input[type=checkbox]').on('change', function(e){
                self._optAllChecked();
            });
            self.$optionContainer.find('.all-chk dt input[type=checkbox]').on('change', function(e){
                self._optToggleAllChecked();
            });
            self.$optionContainer.on('click', '.btn-group button:first-child', function(e){
                e.preventDefault();

                self._setOptINIT();
            }).on('click', '.btn-group button:last-child', function(e){
                e.preventDefault();

                self._setOptApply();
            })

            $('#searchWrap').on('click', 'button', function(e){

                
                var city = $('#city').val();
                var secondName;
                var area = $('#area').val();
                var keyword = $('#searchKeyword').val();

                switch(city){
                    case '경남':
                        secondName = '경상남도';
                        break;
                    case '경북':
                        secondName = '경상북도';
                        break;
                    case '전남':
                        secondName = '전라남도';
                        break;
                    case '전북':
                        secondName = '전라남도';
                        break;
                    default:
                        secondName = city;
                }



                if(keyword!==''){
                    arr = vcui.array.filter(arr, function(item, idx){  							
                        return item['agName'].search(keyword) > -1;        
                    });

                    console.log(arr);
                }

                $('#map').vcStoreMap('search', arr);	

            });

            self._resize();
            $(window).trigger('addResizeCallback', self._resize.bind(self));
        },

        _setOptINIT: function(){
            var self = this;

            //self.$optionContainer.find('.opt-layer')
        },

        _setOptApply: function(){
            console.log("opt apply!!")
        },

        _optToggleAllChecked: function(){
            var self = this;

            var chked = self.$optionContainer.find('.all-chk dt input[type=checkbox]').prop('checked');
            if(chked){
                self.$optionContainer.find('.all-chk dd input[type=checkbox]').prop('checked', true);
            }
        },

        _optAllChecked: function(){
            var self = this;

            var total = self.$optionContainer.find('.all-chk dd input[type=checkbox]').length;
            var chktotal = self.$optionContainer.find('.all-chk dd input[type=checkbox]:checked').length;
            
            var chked = total == chktotal ? true : false;
            self.$optionContainer.find('.all-chk dt input[type=checkbox]').prop('checked', chked);
        },

        _toggleOptContainer: function(){
            var self = this;

            var optop = self.$optionContainer.position().top;

            self.$optionContainer.toggleClass('open');

            // if(self.$optionContainer.hasClass('is-open')){
            //     self.$optionContainer.find('.opt-layer').show();
            //     self.$optionContainer.stop().css({top:optop}).transition({top:0}, 350, "easeInOutCubic");
            // } else{
            //     optop = self.$optionContainer.position().top;
            //     console.log(optop)
            //     self.$optionContainer.stop().css({y:-optop}).transition({y:0}, 350, "easeInOutCubic");
            // }
        },

        _toggleLeftContainer: function(){
            var self = this;
            
            self.$leftContainer.toggleClass('close');
            
            self._resize();
        },

        _showMap: function(){
            var self = this;

            if(!self.isTransion){
                self.isTransion = true;
                
                var toggle = self.$searchContainer.find('.btn-view');
                if(toggle.hasClass('map')){
                    var maptop = self.$defaultListContainer.position().top;
                    $('.store-map-con').css({
                        position: 'absolute',
                        visibility: 'visible',
                        top: maptop,
                        left:0,
                        x: self.windowWidth,
                        height: self.$mapContainer.height(),
                        'z-index': 100
                    }).transition({x:0}, 350, "easeInOutCubic", function(){self.isTransion = false;});
        
                    toggle.removeClass("map").addClass('list').find('span').text('리스트보기');
        
                    self.$map.resize();
                } else{
                    toggle.removeClass("list").addClass('map').find('span').text('지도보기');
    
                    $('.store-map-con').stop().transition({x:self.windowWidth}, 350, "easeInOutCubic", function(){self.isTransion = false;})
                }
            }
        },

        _setSearch: function(){
            var self = this;

            self.searchKeywords.keyword = self.$searchField.val();
            var trim = self.searchKeywords.keyword.replace(/\s/gi, '');
            if(trim.length){
                self.searchResultMode = true;

                self.$map.search(self.searchKeywords.keyword);

                $(window).off('keyup.searchShop');
            }
        },

        _setMarkerSelected: function(id){
            var self = this;

            var selectedMarker = self.$defaultListLayer.find('li[data-id="' + id + '"]');
            if(!selectedMarker.find('.point').hasClass('on')) selectedMarker.find('.point').addClass('on');
            selectedMarker.siblings().find('.point').removeClass('on');
        },

        //매장에 등록 된 이벤트 가져오기...
        _getEventInfo: function(id){
            var self = this;
            var evt = vcui.array.filter(self.eventArr, function(item, idx){
                return item.code == id;
            });

            return evt;
        },

        //매장리스트 생성...
        _setItemList: function(data){
            var self = this;
            
            self.$defaultListLayer.empty();
            
             for(var i=0; i<data.length; i++){
                 var listData = {
                     num: i+1,
                     agName: data[i].info.agName,
                     agCenterWeekday: data[i].info.agCenterWeekday,
                     agNewShopComment: data[i].info.agNewShopComment,
                     isEvent: self._getEventInfo(data[i].id).length ? true : false,
                     agAddr1: data[i].info.agAddr1,
                     agTel: data[i].info.agTel,
                     agNum: data[i].info.agNum,
                     selected: data[i].info.selected ? " on" : ""
                 }
                 var list = vcui.template(listTemplate, listData);
                 self.$defaultListLayer.append($(list).get(0));
             }
        },

        _setItemPosition: function(){
            var self = this;

            self.$defaultListLayer.find('> li').each(function(idx, item){
                if($(item).find('.point').hasClass('on')){
                    var scrolltop = $(item).position().top;
                    self.$defaultListContainer.find('.scroll-wrap').stop().animate({scrollTop: scrolltop}, 220);
                }
            })
        },

        _returnSearchMode: function(){
            var self = this;

            if(self.isChangeMode){
                self.isChangeMode = false;
                self.searchResultMode = false;

                self.$searchContainer.css('display', 'block');

                $('.result-list-box').stop().transition({opacity:0, y:100}, 350, "easeInOutCubic");

                var titheight = self.$leftContainer.find('> .tit').outerHeight(true);
                var scheight = self.$searchContainer.outerHeight(true);
                self.$defaultListContainer.transition({top:titheight+scheight}, 420, "easeInOutCubic", function(){
                    $('.result-list-box').css('display', 'none');

                    self.$defaultListContainer.css({position:'relative', top:0});
                });
            };
        },

        _setSearchResultMode: function(){
            var self = this;

            if(!self.isChangeMode){
                self.isChangeMode = true;

                var listop = self.$defaultListContainer.position().top;

                self._setResultText();
                $('.result-list-box').stop().css({display:'block', opacity:0, y:100}).transition({opacity:1, y:0}, 410, "easeInOutCubic");
                
                var resultheight = $('.result-list-box').height();
                self.$defaultListContainer.css({position:'absolute', top:listop}).transition({top:resultheight}, 420, "easeInOutCubic", function(){
                    self.$searchContainer.css('display', 'none');
                });

                self._setListArea();
            }
        },

        _setResultText: function(){
            var self = this;

            var resultxt = vcui.template(searchResultText.search, {
                keyword: self.searchKeywords.keyword,
                total: self.$defaultListLayer.find('> li').length
            });
            self.$searchResultContainer.find('.result-txt').html(resultxt)
        },

        //리스트 컨테이너 높이 설정...스크롤영역
        _setListArea: function(){
            var self = this;

            var top = $('.container').position().top;
            var titheight = self.$leftContainer.find('> .tit').outerHeight(true);
            var scheight = self.$searchContainer.outerHeight(true);
            var optheight = self.$optionContainer.height();
            var resultheight = $('.result-list-box').height();

            var listheight;
            if(self.searchResultMode){
                listheight = self.windowHeight - top - resultheight - optheight;
            } else{
                listheight = self.windowHeight - top - titheight - scheight - optheight;
            }
            
            self.$defaultListContainer.find('.scroll-wrap').height(listheight);
        },

        _resize: function(){
            var self = this;

            self.windowWidth = $(window).width();
            self.windowHeight = $(window).height();

            self._setListArea();

            var listwidth = self.$leftContainer.width();
            var mapwidth, mapheight, mapmargin;
            if(self.windowWidth < 768){
                mapmargin = 0;
                mapwidth = self.windowWidth;

                mapheight = self.$defaultListContainer.find('.scroll-wrap').height();
            } else{
                if(self.$leftContainer.hasClass('close')){
                    mapmargin = 24;
                } else{
                    mapmargin = listwidth;
                }                
                mapwidth = self.windowWidth - mapmargin;            
                mapheight = self.windowHeight;
            }

            self.$mapContainer.css({
                width: mapwidth,
                height: mapheight,
                'margin-left': mapmargin
            });

            self.$map.resize();
        }
    }

    $(window).ready(function(){
        searchShop.init();
    });
})();