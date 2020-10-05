(function() {
    var modelListTemplate = 
        '<tr>' +
            '<td>{{modelName}}</td>' +
            '<td>{{categoryName}}</td>' +
            '<td>' +
                '<button type="button" class="btn bd-pink btn-small" data-model="{{modelName}}"><span>선택하기</span></button>' +
            '</td>' +
        '</tr>';
    var manualListTemplate = 
        '<tr>' +
            '<td>{{manualType}}</td>' +
            '<td>{{manualInfo}}</td>' +
            '<td>{{date}}</td>' +
            '<td>' +
                '<button type="button" class="btn bd-pink btn-small"><span>{{fileType}}</span></button>' +
            '</td>' +
        '</tr>';
    var driverListTemplate = 
        '<li class="ui_accord_item">' +
            '<div class="accordion-head head">' +
                '<button type="button" class="accordion-head-anchor ui_accord_toggle">{{driverType}} (<em class="count">{{count}}</em>건)</button>   ' +
                '<span class="blind ui_accord_text">열기</span>' +
            '</div>' +
            '<div class="accordion-panel ui_accord_content">' +
                '<ul class="driver-list">' +
                '</ul>' +
            '</div>' +
        '</li>';
    var driverListTemplate02 = 
        '<li>' +
            '<div class="file-info">' +
                '<strong class="tit"><a href="#">{{dirverName}}</a></strong>' +
                '<p class="sub">{{productName}}</p>' +
                '<ul class="sub-list">' +
                    '<li>{{driverVersion}}</li>' +
                    '<li>{{date}}</li>' +
                    '<li>{{size}}</li>' +
                '</ul>' +
                '<a href="#" class="btn bd-pink btn-small"><span>다운로드</span></a>' +
            '</div>' +
        '</li>';
    var optionTemplate =  '<option value="{{value}}">{{option}}</option>'; 

    $(window).ready(function() {
        var downloadResources = {
            initialize: function() {
                var self = this;

                CS.MD.setPagination();

                self.$stepCategory = $('#stepCategory');
                self.$stepModel = $('#stepModel');
                self.$stepResult = $('#stepResult');

                self._setEventListener();
            },
            searchModelList: function(formData) {
                var self = this;

                $.ajax({
                    url: '/lg5-common/data-ajax/support/modelList.json',
                    method: 'POST',
                    dataType: 'json',
                    data: formData,
                    beforeSend: function(xhr) {
                        // loading bar start
                    },
                    success: function(d) {
                        if (d.status) {
                            var data = d.data,
                                html = "";
                            
                            data.modelList.forEach(function(item) {
                                html += vcui.template(modelListTemplate, item);
                            });

                            $('#modelContent').html(html);
                            $('.pagination').data('plugin_pagination').update(data.pageInfo);
                        }
                    },
                    error: function(err){
                        console.log(err);
                    },
                    complete: function() {
                        // loading bar end
                    }
                });
            },
            searchFileList: function(formData) {
                $.ajax({
                    url: '/lg5-common/data-ajax/support/downloadList.json',
                    method: 'POST',
                    dataType: 'json',
                    data: formData,
                    beforeSend: function(xhr) {
                        // loading bar start
                    },
                    success: function(d) {
                        var data = d.data;
    
                        var manualArr = data.manualList instanceof Array ? data.manualList : [];
                        var manualList = "";
                        manualArr.forEach(function(item) {
                            manualList += vcui.template(manualListTemplate, item);
                        });
                        $('#fileContent').html(manualList);
    
    
                        var driverArr = data.driverList instanceof Array ? data.driverList : [];
                        var driverList = "";
                        driverArr.forEach(function(item) {
                            driverList += vcui.template(driverListTemplate, item);
                        });
                        $('.accordion-list').html(driverList);
    
    
                        $('.accordion-list li').each(function(index) {
                            var driverArr = data.driverList[index].list instanceof Array ? data.driverList[index].list : [];
                            var driverList = "";
                            driverArr.forEach(function(item) {
                                driverList += vcui.template(driverListTemplate02, item);
                            });
                            $(this).find('ul').html(driverList);
                        });
                                
                        var osArr = data.osOption instanceof Array ? data.osOption : [];
                        var osOption = "";
                        osArr.forEach(function(item) {
                            osOption += vcui.template(optionTemplate, item);
                        });
                        $('#osSelect').html(osOption);
                        $('#osSelect').vcSelectbox('update');
    
                        var driverArr = data.driverOption instanceof Array ? data.driverOption : [];
                        var driverOption = "";
                        driverArr.forEach(function(item) {
                            driverOption += vcui.template(optionTemplate, item);
                        });
                        $('#driverSelect').html(driverOption);
                        $('#driverSelect').vcSelectbox('update');
    
                        $('#stepResult').show();
    
                        $('.accordion').vcAccordion();
                    },
                    error: function(err){
                        console.log(err);
                    },
                    complete: function() {
                        // loading bar end
                        var test = $('#stepResult').get(0).offsetTop - 48  - $('.product-nav-wrap').outerHeight();
                        $('html, body').animate({scrollTop: test}, 500);
                    }
                });
            },
            _reset: function() {

            },
            _setEventListener: function() {
                var self = this;

                $('.category-carousel').find('button').on('click', function() {
                    var data = $(this).data();

                    $('#superCategory').text(data.superCategory);
                    $('#category').text(data.category);

                    $('#stepModel').show();
                    $('#stepCategory').hide();

                    $('.pagination').pagination();
                    self.searchModelList(data);
                   
                    var offsetTop = $('.contents').get(0).offsetTop;
                        
                    $(window).scrollTop(offsetTop);
                    $('.product-nav-wrap').addClass('show');
                });

                $('#modelContent').on('click', 'button', function() {
                    var $el = $(this),
                        $item = $el.closest('tr'),
                        data = $el.data('model');

                    $item.addClass('is-active').siblings().removeClass('is-active');
                    $('#btnSearch').data('model', data);
                    $('#modelName').text(data);
                    $('#modelName').css('display','inline-block');
                    $('.guide').hide();

                    var offsetTop = $('.btn-group').offset().top + $('.btn-group').outerHeight(true) - $(window).height();
                        
                    $('html, body').animate({
                        scrollTop: offsetTop
                    }, 500);
                });

                self.$stepModel.find('.pagination').on('click', 'a', function(e) {
                    e.preventDefault();
                    self.searchModelList();
                });

                $('#btnSearch').on('click', function() {
                    var data = $(this).data();
                    
                    self.searchFileList(data);
                });

                $('#btnReset').on('click', function() {
                    $('#modelContent').html('');
                    $('#superCategory').text('');
                    $('#category').text('');
                    $('#modelName').css('display', 'none').text('');
                    $('.guide').show();

                    $('#stepResult').hide();
                    $('#stepModel').hide();
                    $('#stepCategory').show();

                    $('.category-carousel').vcCarousel('setPosition');
                    
                    $('.product-nav-wrap').removeClass('show');

                    var offsetTop = $('.contents').get(0).offsetTop;
                    $(window).scrollTop(offsetTop);
                });

                $(window).on('scroll resize', function () {
                    _scrollTop = $(window).scrollTop();
            
                    if (_scrollTop >= $('.product-nav-wrap').get(0).offsetTop) {
                        $('.product-nav-wrap').addClass('sticky')
                    } else {
                        $('.product-nav-wrap').removeClass('sticky')
                    }
                });
            }
        }

        downloadResources.initialize();
    });
})();