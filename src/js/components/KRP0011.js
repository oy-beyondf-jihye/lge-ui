(function() {
    var productItem =
        '<li>' +
            '<div class="item rec-items">'+
                '<div class="product-image" aria-hidden="true">'+
                    '<a href="{{modelUrlPath}}">'+
                        '<img src="{{mediumImageAddr}}" alt="{{modelDisplayName}}">'+
                    '</a>'+
                '</div>'+
                '<div class="product-contents">'+
                    '<div class="product-info">'+
                        '<div class="product-name">'+
                            '<a href="#">{{modelDisplayName}}</a>'+
                        '</div>'+
                        '<div class="sku">{{modelName}}</div>'+
                        '{{#if (reviewsCount != "0")}}' +
                        '<div class="review-info">'+
                            '<div class="star is-review"><span class="blind">리뷰있음</span></div>'+
                            '<div class="average-rating"><span class="blind">평점</span>{{reviewsScore}}</div>'+
                            '<div class="review-count"><span class="blind">리뷰 수</span>({{reviewsCount}})</div>'+
                        '</div>'+
                        '{{/if}}' +
                    '</div>'+
                '</div>'+

                '{{#if (tabName == "purchaseTab")}}'+
                '<div class="price-area">'+
                    '{{#if (obsSellingPrice != "0")}}'+
                    '<div class="original">'+
                        '<em class="blind">할인 전 정가</em>'+
                        '<span class="price">{{vcui.number.addComma(obsOriginalPrice)}}<em>원</em></span>'+
                    '</div>'+
                    '{{/if}}'+
                    '{{#if (obsSellingPrice != "0")}}'+
                    '<div class="total">'+
                        '<em class="blind">할인 후 판매가</em>'+
                        '<span class="price">{{vcui.number.addComma(obsSellingPrice)}}<em>원</em></span>'+
                    '</div>'+
                    '{{/if}}'+
                '</div>'+
                '{{/if}}'+

                '{{#if (tabName == "rentalTab") && (years1TotAmt !=0)}}'+
                '<div class="product-bottom rental-type">'+
                    '<div class="price-area care">'+
                        '<div class="total-price"><em class="text">기본 월 요금</em>'+
                            '<span class="price"><em>월</em> {{vcui.number.addComma(years1TotAmt)}}<em>원</em></span>'+
                        '</div>'+
                        '{{#if (visitPer != "null")}}'+
                            '<span class="small-text">({{visitPer}}개월/1회 방문)</span>'+
                        '{{/if}}'+
                    '</div>'+
                '</div>'+
                '{{/if}}'+
            '</div>'+
        '</li>';

    $(window).ready(function(){

        if(!document.querySelector('.KRP0011')) return false;

        var KRP0011 = {
            init: function(){
                var self = this;

                self.setting();
                self.bindEvents();

            },
            setting: function() {
                var self = this;
                self.$section = $('.KRP0011');
                self.$recommend = self.$section.find('.recommend-wrap');
                self.$prodViewNow = self.$recommend.find('.prod-box.now .product-items');
                self.$prodRecommend = self.$recommend.find('.prod-box.recommend .product-items');

                self.$tabs = $('.option-tabs .tabs');
                self.$tabList = self.$tabs.find('li a');

                //스펙 비교하기 버튼
                self.$compareModelIds = self.$section.find("bottom-area").data('modelIds');
                self.$compareModelIdsRental = "";

            },
            bindEvents: function() {
                var self = this;

                //구매/렌탈 탭 클릭시 유사제품 상품, 각각의 금액으로 변경
                self.$tabList.on('click',function(){
                    var $idx = $(this).parent().index();
                    self.$prodViewNow.empty();
                    self.$prodRecommend.empty();
                    if($idx === 0){
                        // 구매 탭
                        self.makeProdList("purchaseTab", dataList.compareList);
                    }else if($idx === 1) {
                        //렌탈 탭
                        self.makeProdList("rentalTab", dataList.rentalCompareList);
                    }
                });

                //유사제품 추천
                $('.KRP0011').on('click', 'button[data-model-ids]', function(e){
                    e.preventDefault();

                    var url = $(this).data('compareUrl');
                    lgkorUI.addEqualCompare($(this).data('modelIds'), url);
                });
            },
            makeProdList: function(tabType, loopData){
                var self = this;
                var $dataProdInfo = dataList.productInfo;

                $dataProdInfo.tabName = tabType;
                $.each(data,function(idx,item){
                    item.tabName = tabType;
                });

                self.$prodViewNow.append(vcui.template(productItem,$dataProdInfo));
                $.each(data,function(idx,item){
                    self.$prodRecommend.append(vcui.template(productItem,item))
                });
            }
        }
        KRP0011.init();
    });
})();