(function() {
    var inquiryTmpl = 
    '{{#each (item, index) in inquiryList}}' +
    '<li>' +
        '<span class="rdo-wrap btn-type3">' +
            '{{# if (index == 0) { #}}' +
            '<input type="radio" name="subsection" id="inquiry{{index}}" value="{{item.value}}" data-inquiry-name="{{item.name}}" data-error-msg="정확한 제품증상을 선택해주세요." data-required="true" required>' +
            '{{# } else { #}}' +
            '<input type="radio" name="subsection" id="inquiry{{index}}" value="{{item.value}}" data-inquiry-name="{{item.name}}">' +
            '{{# } #}}' +
            '<label for="inquiry{{index}}"><span>{{item.name}}</span></label>' +
        '</span>' +
    '</li>' + 
    '{{/each}}';

    var validation;

    var reservation = {
        init: function() {
            var self = this;
            var param = {};

            self.options = {
                category: '',
                categoryNm: '',
                subCategory: '',
                subCategoryNm: '',
                modelCode: '',
                productCode: ''
            };

            param = {
                category: $('#category').val(),
                categoryNm: $('#categoryNm').val(),
                subCategory: $('#subCategory').val(),
                subCategoryNm: $('#subCategoryNm').val(),
                modelCode: $('#modelCode').val(),
                productCode: $('#productCode').val()
            };

            self.$cont = $('.contents');
            self.$searchModelWrap = self.$cont.find('.prod-search-wrap');
            self.$selectedModelBar = self.$cont.find('.prod-selected-wrap');
            self.$myModelWrap = self.$cont.find('.my-product-wrap');
            self.$submitForm = self.$cont.find('#submitForm');
            self.$completeBtns = self.$cont.find('.btn-group');

            self.$stepTerms = self.$cont.find('#stepTerms');
            self.$stepInquiry = self.$cont.find('#stepInquiryType');
            self.$stepInput = self.$cont.find('#stepInput');
            
            self.$inquiryBox = self.$cont.find('#inquiryBox');
            self.$inquiryListWrap = self.$cont.find('#inquiryList');
            self.$inquiryList = self.$inquiryListWrap.find('.rdo-list');
            self.$recordBox = self.$stepInput.find('#recordBox');
            self.$rcptNoBox = self.$stepInput.find('#rcptNoBox');

            self.param = param;
            self.isLogin = lgkorUI.isLogin;
            self.resultUrl = self.$searchModelWrap.data('resultUrl');

            var register = {
                privcyCheck: {
                    required: true,
                    msgTarget: '.err-block',
                    errorMsg: '개인정보 수집 및 이용에 동의 하셔야 이용 가능합니다.'
                },
                subsection: {
                    required: true,
                    msgTarget: '.type-msg',
                    errorMsg: '정확한 제품증상을 선택해주세요.'
                },
                cRcptNo: {
                    required: true,
                    msgTarget: '.err-block',
                    errorMsg: '접수 번호를 입력해주세요.'
                },
                inquiryTitle: {
                    required: true,
                    maxLength: 40,
                    msgTarget: '.err-block',
                    errorMsg: '제목을 입력해주세요.'
                },
                inquiryContent: {
                    required: true,
                    maxLength: 1000,
                    msgTarget: '.err-block',
                    errorMsg: '내용을 입력해주세요.'
                },
                userName: {
                    required: true,
                    maxLength: 30,
                    pattern: /^[가-힣\s]|[a-zA-Z\s]+$/,
                    msgTarget: '.err-block',
                    errorMsg: '이름을 입력해주세요.',
                    patternMsg: '이름은 한글 또는 영문으로만 입력해주세요.'
                },
                userEmail: {
                    required: true,
                    pattern : /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    minLength: 1,
                    maxLength: 50,
                    msgTarget: '.err-block',
                    errorMsg: '이메일 주소를 입력해주세요.',
                    patternMsg: '올바른 이메일 형식이 아닙니다.',
                    validate : function(value){
                        var _pattern = new RegExp(this.pattern);

                        if( _pattern.test(value) == true) {
                            if( value.split('@')[0].length <= 30 && value.split('@')[1].length <= 20) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                }
            }

            vcui.require(['ui/validation', 'ui/imageFileInput'], function () {
                self.bindEvent();

                validation = new vcui.ui.CsValidation('.step-area', {register:register});
                self.$cont.find('.ui_imageinput').vcImageFileInput();
                self.$cont.commonModel({
                    register: register,
                    selected: self.param
                });

                var url = location.search;

                if (url.indexOf("?") > -1) {
                    var flag = $('#stepTerms').length && $('#stepTerms').hasClass('active') ? true : false;
                    var search = url.substring(1);
                    var searchObj = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');

                    if (!flag) {
                        if (searchObj.parts) {
                            $('#stepInquiryType').find('[data-sub-category-name="케어용품/소모품"]').trigger('click');
                        } else if (searchObj.simple) {
                            $('#stepInquiryType').find('[data-sub-category-name="LG전자 회원"]').trigger('click');
                        }
                    }
                }
            });
        },
        loadInquiry: function(data, url) {
            var self = this;
            var param = {
                category: data.category,
                subCategory: data.subCategory,
                modelCode: data.modelCode,
                serviceType: $('#serviceType').val()
            };

            lgkorUI.showLoading();
            lgkorUI.requestAjaxDataPost(url, param, function(result) {
                var resultData = result.data;
                var result = resultData.inquiryList instanceof Array ? resultData.inquiryList.length : false;
                var html = '';

                self.$inquiryList.empty();

                if (result) {
                    html = vcui.template(inquiryTmpl, resultData);
                    self.$inquiryList.html(html);
                    self.$inquiryBox.show();

                    self.nextStepInput(data);
                } else {
                    self.$inquiryBox.hide();
                }
                lgkorUI.hideLoading();
            });
        },
        nextStepInput: function(data) {
            var self = this;
            var summaryOpt = {
                product: [data.categoryNm, data.subCategoryNm, data.modelCode],
                reset: 'type'
            };

            self.$myModelWrap.hide();
            self.$selectedModelBar.show();
            self.$completeBtns.show();

            self.$cont.commonModel('updateSummary', summaryOpt);
            self.$cont.commonModel('next', self.$stepInput);
            self.$cont.commonModel('focus', self.$selectedModelBar, function() {
                self.$selectedModelBar.vcSticky();
            });
        },
        requestComplete: function() {
            var self = this;
            var url = self.$submitForm.data('ajax'),
                param = validation.getAllValues(),
                formData = new FormData;

            for (var key in param) {
                formData.append(key, param[key]);
            }

            lgkorUI.showLoading();
            lgkorUI.requestAjaxFileData(url, formData, function(result) {
                var data = result.data,
                    param = result.param;

                if (data.resultFlag == 'Y') {
                    for (var key in param) {
                        var $hidden = document.createElement("input");
                        $hidden.type = "hidden";
                        $hidden.name = key;
                        $hidden.value = param[key];
                        self.$submitForm.append($hidden);
                    }
                    self.$submitForm.submit();
                } else {
                    if (data.resultMessage) {
                        lgkorUI.alert("", { title: data.resultMessage });
                    }
                    lgkorUI.hideLoading();
                }
            }, 'POST');
        },
        reset: function() {
            var self = this;

            self.$recordBox.hide();
            self.$rcptNoBox.hide();
            self.$inquiryBox.hide();
            self.$inquiryList.empty();
            self.$completeBtns.hide();
            self.$selectedModelBar.hide();
            self.$myModelWrap.hide();

            self.$stepInput.find('[name=subsection]').prop('checked', false);
            self.$stepInput.find('[name=record]').eq(0).prop('checked', true);
            self.$stepInput.find('#cRcptNo').val('');
            self.$stepInput.find('#inquiryTitle').val('');
            self.$stepInput.find('#inquiryContent').val('');

            if (!self.isLogin) {
                self.$stepInput.find('#userName').val('');
                self.$stepInput.find('#userEmail').val('');
            }

            validation.reset();

            self.$cont.find('.ui_textcontrol').trigger('textcounter:change', { textLength: 0 });
            self.$cont.find('.ui_imageinput').vcImageFileInput('removeAll');
            self.$cont.commonModel('next', self.$stepInquiry);
            self.$cont.commonModel('focus', self.$cont);
        },
        bindEvent: function() {
            var self = this;

            // 모델 선택 & 문의 재선택
            self.$cont.on('complete', function(e, data, url) {
                if (!data.categoryNm) {
                    data.categoryNm = data.categoryName;
                    data.subCategoryNm = data.subCategoryName;
                }
                if (url) {
                    self.loadInquiry(data, url);
                } else {
                    self.$inquiryBox.hide();
                    self.nextStepInput(data);
                }
            }).on('reset', function() {
                self.reset();
            });

            // 문의 유형 선택 시
            self.$inquiryBox.on('change', '[name=subsection]', function() {
                self.$recordBox.find('input[type=radio]').eq(0).prop('checked', true);
                self.$recordBox[$(this).data('inquiryName') == 'A/S' ? 'show':'hide']();
            });

            // 상담/서비스 이력 선택 시
            self.$recordBox.on('change', '[name=record]', function() {
                if ($(this).val() == '0') {
                    self.$rcptNoBox.hide();
                    self.$rcptNoBox.find('input').val('');
                } else {
                    self.$rcptNoBox.show();
                }
            });

            // 신청 완료
            self.$completeBtns.find('.btn-confirm').on('click', function() {
                var result = validation.validate();

                if (result.success == true) {    
                    lgkorUI.confirm('', {
                        title:'예약 하시겠습니까?',
                        okBtnName: '확인',
                        cancelBtnName: '취소',
                        ok: function() {
                            self.requestComplete();
                        }
                    });       
                }
            });
        }
    }

    $(window).ready(function() {
        reservation.init();
    });
})();