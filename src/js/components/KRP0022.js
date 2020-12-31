(function() {
    var eventItemList = '<li class="lists"><div class="list-inner">' +
        '<a href="{{url}}">' +
            '<span class="thumb">' +
                '<img src="{{imageUrl}}" alt="{{imageAlt}}" aria-hidden="true">' +
                '{{#if endEvent}}<span class="event-end"><em>종료된 이벤트</em></span>{{/if}}' +
                '<span class="flag-wrap bg-type">{{#each item in categoryFlag}}<span class="flag"><span class="blind">제품 카테고리</span>{{item}}</span>{{/each}}</span>' +
            '</span>' +
            '<div class="info">' +
                '<div class="flag-wrap bar-type">{{#each item in eventFlag}}<span class="flag"><span class="blind">이벤트 구분</span>{{item}}</span>{{/each}}</div>' +
                '<p class="tit"><span class="blind">이벤트 제목</span>{{title}}</p>' +
                '<p class="date"><span class="blind">이벤트 기간</span>{{startDate}}~{{endDate}}</p>' +
            '</div>' +
        '</a>' +
        '{{#if endEventUrl}}<a href="{{endEventUrl}}" class="btn-link"><span>당첨자 발표</span></a>{{/if}}' +
    '</div></li>'

    $(window).ready(function() {
        var KRP0022 = {
            init: function() {
                self.$KRP0022 = $('.KRP0022').first();
                self.$tab = self.$KRP0022.find('div.ui_tab');
                self.$list = self.$KRP0022.find('ul.box-list-inner');
                self.$noData = self.$KRP0022.find('div.no-data');

                var _self = this;
                _self.bindEvents();
                _self.checkNoData();
            },

            bindEvents: function() {
                var _self = this;
                self.$KRP0022.find('.ui_selectbox').on('change', function(e){
                    _self.requestData();
                });

                self.$tab.on("tabchange", function(e) {
                    _self.requestData();
                });


                self.$list.on('click', 'div.list-inner a.btn-link', function(e) {
                    e.preventDefault();
                    _self.requestModal(this);
                });
            },

            noData: function(visible) {
                if(visible) {
                    self.$noData.show();
                } else {
                    self.$noData.hide();
                }
            },

            checkNoData: function() {
                var _self = this;
                _self.noData(self.$list.find('li').length > 0 ? false : true);
            },

            requestData: function() {
                var _self = this;
                var ajaxUrl = self.$KRP0022.attr('data-list-url');
                var selectIdx = self.$tab.vcTab('getSelectIdx');
                var selectedCategory = self.$tab.find('ul.tabs li:eq(' + selectIdx +') a').attr('href').replace("#", "");                
                var postData = {"categoryId":selectedCategory};
                self.$KRP0022.find('.ui_selectbox').each(function (index, item) {
                    var $item = $(item);
                    postData[$item.attr('id')] = $item.vcSelectbox('value');
                });

                lgkorUI.requestAjaxDataPost(ajaxUrl, postData, function(result){
                    _self.updateList(result.data);
                });
            },

            updateList: function(data) {
                var _self = this;
                self.$list.empty();
                var arr =  data ? (data instanceof Array ? data : []) : [];
                arr.forEach(function(item, index) {
                    item.startDate = vcui.date.format(item.startDate,'yyyy.MM.dd');
                    item.endDate = vcui.date.format(item.endDate,'yyyy.MM.dd');
                    self.$list.append(vcui.template(eventItemList, item));
                });
                _self.checkNoData();
            },

            requestModal: function(dm) {
                var _self = this;
                var ajaxUrl = $(dm).attr('href');
                window.open(ajaxUrl,'','width=912,height=760,scrollbars=no');
                /*
                lgkorUI.requestAjaxData(ajaxUrl, null, function(result){
                    _self.openModalFromHtml(result);
                }, null, "html");
                */
            },

            /*
            openModalFromHtml: function(html) {
                console.log(html);
                $('#event-modal').html(html).vcModal();
            },
            */
        };

        KRP0022.init();
    });
})();