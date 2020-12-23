$(window).ready(function(){
    if(!document.querySelector('.KRP0027')) return false;

    $('.KRP0027').buildCommonUI();

    ;(function(){
        var REQUEST_MODE_SUPERCATEGORY = "superCategory";
        var REQUEST_MODE_CATEGORY = "category";
        var REQUEST_MODE_YEAR = "year";
        var REQUEST_MODE_SCROLL = "scroll"

        var VIDEO_LIST_URL;
        var VIEWER_DATA_URL;

        var superCategoryTab, categoryTab, yearTab, contList;

        var scrollAbled = true;

        var contLoadMode;

        var viewerTemplate = 
            '<div class="video-inner">'+
				'{{#if videoType == "youtube"}}'+
				'<div class="visual-area">'+
					'<div class="visual-box">'+
						'<div class="box-inner">'+
							'<img src="{{storyMainThumbnailPat}}{{storyMainThumbnailServerName}}" alt="{{storyMainThumbnailAltText}}">'+
							'<p class="hidden pc">{{storyTitle}}</p>'+
							'<p class="hidden mobile">{{storyTitle}}</p>'+
							'<iframe src="{{storyMovieUrl}}" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="{{storyTitle}}"></iframe>'+
						'</div>'+
					'</div>'+
				'</div>'+
				'{{#else}}'+
				'<div class="visual-area animation-box">'+
					'<img src="{{storyMainThumbnailPath}}{{storyMainThumbnailServerName}}" alt="{{storyMainThumbnailAltText}}">'+
					'<p class="hidden pc">{{storyTitle}}</p>'+
					'<p class="hidden mobile">{{storyTitle}}</p>'+
					'<div class="animation-area">'+
						'<video autoplay muted loop>'+
							'<source src="{{storyMovieUrl}}" type="video/mp4">'+
						'</video>'+
						'<div class="controller-wrap wa-btn">'+
							'<button class="active pause" aria-label="Pause Video" name="pause" data-play-text="Play Video" data-pause-text="Pause Video" data-link-area="side_image_text-animation_play" data-link-name="" aria-describedby="title01">Pause Video</button>'+
						'</div>'+
					'</div>'+
					'<div class="caption">{{storyTitle}}</div>'+
				'</div>'+
				'{{/if}}'+
			'</div>'+
			'<div class="video-info">'+
				'{{#if modelList && modelList.length > 0}}'+
				'<div class="btn-area">'+
					'<div class="btn-wrap">'+
						'<a href="#n" class="btn-text btn-modelName">{{modelList[0].models[0].modelDisplayName}}</a>'+
						'{{#if isMoreModel}}'+
						'<button type="button" class="btn-more btn-moreModel"><span class="hidden">수상내역 더보기</span></button>'+
						'{{/if}}'+
					'</div>'+
				'</div>'+
				'{{/if}}'+
				'<div class="tit-area">'+
					'<p class="tit">{{storyTitle}}</p>'+
					'<p class="date">{{baseDate}}</p>'+
					'<div class="share-area">'+
						'<div class="tooltip-wrap share">'+
							'<a href="#n" class="tooltip-icon ui_tooltip-target" data-fixed="fixed-right" ui-modules="TooltipTarget"><span class="blind">제품 공유하기</span></a>'+
							'<div class="tooltip-box fixed-right" aria-hidden="true" style="display: none;">'+
								'<span class="title">공유</span>'+
								'<div class="sns-wrap">'+
									'<ul class="sns-list">'+
										'<li><a href="#none" data-url="" class="ico-btn fb" title="페이스북에 공유하기, 새창열림" data-link-name="facebook"><span class="blind">페이스북으로 페이지 공유하기</span></a></li>'+
										'<li><a href="#none" data-url="" class="ico-btn tw" title="트위터에 공유하기, 새창열림" data-link-name="twitter"><span class="blind">트위터로 페이지 공유하기</span></a></li>'+
										'<li><a href="#none" data-url="" class="ico-btn kk" title="카카오톡에 공유하기, 새창열림" data-link-name="kakaotalk"><span class="blind">카카오톡으로 페이지 공유하기</span></a></li>'+
										'<li><a href="#none" data-url="" class="ico-btn url" data-link-name="copy_url"><span class="blind">URL 복사하기</span></a></li>'+
									'</ul>'+
								'</div>'+
								'<button type="button" class="btn-close"><span class="blind">닫기</span></button>'+
							'</div>'+
						'</div>'+
					'</div>'+
				'</div>'+
				'<div class="desc">'+
					'<div class="inner">'+
						'{{#raw stroyDesc}}'+
					'</div>'+
					'<button class="more-btn"><span class="hidden">열기</span></button>'+
				'</div>'+
				'{{#if tagList && tagList.length > 0}}'+
				'<div class="hashtag-area">'+
					'<div class="tag-list">'+
						'{{#each hash in tagList}}'+
						'<a href="{{tagUrlPath}}{{hash.tagId}}" class="hashtag"><span>#</span>{{hash.tagName}}</a>'+
						'{{/each}}'+
					'</div>'+
				'</div>'+
				'{{/if}}'+
            '</div>';
            
        var matchModelPopTemplate = 
            '<p class="com-pop-tit">{{categoryName}}</p>'+
            '<ul class="com-pop-list">'+
                '{{#each model in models}}'+         
                '<li>'+
                    '<a href="{{model.modelUrlPath}}">{{model.modelDisplayName}}</a>'+
                '</li>'+
                '{{/each}}'+             
            '</ul>';

        var contListTemplate =
            '<li>'+
				'<a href="#n" data-story-id="{{storyId}}">'+
					'<span class="thumb">'+
						'<img src="{{storyMainThumbnailPath}}{{storyMainThumbnailServerName}}" alt="{{storyMainThumbnailAltText}}">'+
					'</span>'+
					'<span class="tit"><span>{{storyTitle}}</span></span>'+
				'</a>'+
            '</li>';
            
        var categoryTabTemplate = 
            '<li class="on" data-cate-id=""><a href="#n">전체<em class="blind">선택됨</em></a></li>'+
            '{{#each list in categoryList}}'+
            '<li data-cate-id="{{list.categoryId}}"><a href="#n">{{list.categoryName}}</a></li>'+
            '{{/each}}';

        var yearTabTemplate =
            '<li class="on" data-cate-id=""><a href="#n">전체({{totalCnt}})<em class="blind">선택됨</em></a></li>'+
            '{{#each year in yearList}}'+
            '<li data-cate-id="{{year.yearBaseDate}}"><a href="#">{{year.yearBaseDate}}({{year.yearCnt}})</a></li>'+
            '{{/each}}';

        function init(){
            vcui.require(['ui/tab'], function () {
                setting();
                bindEvents();
            });
        }

        function setting(){
            VIDEO_LIST_URL = $('.KRP0027').data("videoListUrl");
            VIEWER_DATA_URL = $('.KRP0027').data("viewerDataUrl");

            superCategoryTab = $('.ui_supercategory_tab');
            categoryTab = $('.ui_category_tab').hide();
            yearTab = $('.ui_year_tab');
            contList = $('.cont_list');
        }

        function bindEvents(){
            superCategoryTab.on('tabchange', function(e, data){
                setContentsList(REQUEST_MODE_SUPERCATEGORY, 1);
            });

            categoryTab.find('.ui_tab').on('tabchange', function(e, data){
                setContentsList(REQUEST_MODE_CATEGORY, 1);
            });

            yearTab.on('tabchange', function(e, data){
                setContentsList(REQUEST_MODE_YEAR, 1);
            });

            contList.scroll(function(e){
                setContListScrolled();
            })

            $('.video-wrap').on('click', '.btn-modelName, .btn-moreModel', function(e){
                e.preventDefault();

                $('#match-models').vcModal();
            });
            $('.video-list-wrap').on('click', '.video-list li a', function(e){
                e.preventDefault();
                
                var storyID = $(this).data('storyId');
                setViewContents(storyID);
            });
        }

        function setViewContents(sid){
            lgkorUI.showLoading();
            
            var sendata = {
                storyId: sid
            }
            lgkorUI.requestAjaxData(VIEWER_DATA_URL, sendata, function(result){    
                $('.video-wrap').empty();

                var isMoreModel = false;
                var modelist = result.data.modelList;
                if(modelist.length > 1 || modelist[0].models.length > 1){
                    isMoreModel = true;
                }
                result.data.isMoreModel = isMoreModel;

                var templateList = vcui.template(viewerTemplate, result.data);
                $('.video-wrap').append(templateList);

                $('#match-models .pop-conts').empty();
                for(var key in result.data.modelList){
                    var poptemplate = vcui.template(matchModelPopTemplate, result.data.modelList[key]);
                    $('#match-models .pop-conts').append(poptemplate);
                }

                lgkorUI.hideLoading();
            });
        }

        function setContListScrolled(){
            if(scrollAbled){
                var page = contList.data('page');
                var totalpage = contList.data('totalpage');
                if(page < totalpage){
                    var scrolltop = contList.scrollTop();
                    var wrapheight = contList.height();
                    var listheight = contList.find('.video-list').outerHeight(true);
                    var scrolldist = listheight - wrapheight - 10;
                    if(scrolltop >= scrolldist){
                        setContentsList(REQUEST_MODE_SCROLL, page+1);
                    }
                }
            }
        }

        function setContentsList(mode, page){
            lgkorUI.showLoading();

            contLoadMode = mode;

            scrollAbled = false;

            var idxs = getTabCateIDs();
            var sendata = {
                page: page,
                superCategoryId: idxs.superCategoryId,
                categoryId: idxs.categoryId,
                year: idxs.year
            }
            
            lgkorUI.requestAjaxData(VIDEO_LIST_URL, sendata, function(result){
                var page = result.data.pagination.page;
                var totalpage = result.data.pagination.totalCount;
                contList.data('page', page);
                contList.data('totalpage', totalpage);

                if(page == 1) contList.find('.video-list').empty();
                for(var key in result.data.storyList){
                    var contlistemplate = vcui.template(contListTemplate, result.data.storyList[key]);
                    contList.find('.video-list').append(contlistemplate);
                }

                var tabTemplate, yeardata, totalcnt;
                var tabIdxs = getTabCateIDs();
                switch(contLoadMode){
                    case REQUEST_MODE_SUPERCATEGORY:
                        categoryTab.find('.tabs').empty();

                        if(tabIdxs.superCategoryId != ""){
                            tabTemplate = vcui.template(categoryTabTemplate, {categoryList: result.data.categoryList});
                            categoryTab.find('.tabs').append(tabTemplate);
                            categoryTab.show().find('.ui_tab').vcTab('update').vcSmoothScroll('refresh');
                        } else{
                            categoryTab.hide();
                        }
                    break;

                    case REQUEST_MODE_CATEGORY:
                        yeardata = vcui.array.filter(result.data.storyListByYear, function(item, index){
                            return item.yearBaseDate != "TOTAL";
                        });
                        totalcnt = vcui.array.filter(result.data.storyListByYear, function(item, index){
                            return item.yearBaseDate == "TOTAL";
                        });
                        tabTemplate = vcui.template(yearTabTemplate, {totalCnt: totalcnt[0].yearCnt, yearList: yeardata})
                        yearTab.find('.tabs').empty().append(tabTemplate);
                        yearTab.vcTab('update').vcSmoothScroll('refresh');
                    break;
                }


                scrollAbled = true;

                lgkorUI.hideLoading();
            });
        }

        function getTabCateIDs(){
            var superCategoryTabIndex = superCategoryTab.vcTab('getSelectIdx');
            var categoryTabIndex = categoryTab.find('.ui_tab').vcTab("getSelectIdx");
            var yearTabIndex = yearTab.vcTab("getSelectIdx");

            var superCategoryID = superCategoryTab.find('li[data-cate-id]').eq(superCategoryTabIndex).data('cateId');
            var categoryID = categoryTab.find('li[data-cate-id]').eq(categoryTabIndex).data('cateId');
            var yearID = yearTab.find('li[data-cate-id]').eq(yearTabIndex).data('cateId');

            return{
                superCategoryId: superCategoryID,
                categoryId: categoryID,
                year: yearID
            }
        }

        init();
    })();
})