(function() {
    var validation;
    loginFlag = digitalData.hasOwnProperty("userInfo") && digitalData.userInfo.unifyId ? "Y" : "N";
    birthDt = digitalData.hasOwnProperty("userInfo") && digitalData.userInfo.birthDt;
    // var loginFlag = 'Y';
    // var birthDt = 19920102;

    var emailCertified = {
        init: function() {
            var self = this;
            // 이메일인증멤버 확인
            var memberStatus = memberCheck();
            if (memberStatus == 'Y'){
                location.href = "/benefits/exhibitions/detail-PE00030001"
            }
            function memberCheck(){
                var memberStatus = '';
                $.ajax({
                    type: "POST",
                    async : false,
                    url:  "/evt/api/exhibitions/retrieveAuthEmail.lgajax?planEventId=PE00030001",
                    dataType:"json",
                    success: function(json) {
                        memberStatus = json.data;
                    },
                    error: function(request, status, error) {
                        alert("오류가 발생하였습니다.");
                        return;
                    }
                });
                return memberStatus;
            }

            if(lgkorUI.stringToBool(loginFlag)) {
                if( birthDt > 19920101 && birthDt < 20040102){
                    $('.login-ok').show();
                    $('.login-no').hide();
                } else {
                    $('#academyPopup01').vcModal('show');
                }
            } else {
                $('.login-no').show();
                $('.login-ok').hide();
            }

            self.$cont = $('#academyPopup02');
            self.$submitForm = $('#emailCertifiedForm');
            self.$completeBtn = $('#btnCertified');
            self.$loginBtn = $('#btnLogin');
            var checkEmail = $('#checkEmail').val();
            var checklength = checkEmail.split(',').length;

            vcui.require(['ui/validation'], function () {
                var register = {
                    //이메일
                    userEmail: {
                        required: true,
                        pattern : /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                        minLength: 1,
                        maxLength: 50,
                        msgTarget: '.err-block',
                        errorMsg: '이메일 주소를 입력해주세요.',
                        patternMsg: '@ac.kr 계정의 이메일을 입력해 주세요.',
                        validate : function(value){
                            var _pattern = new RegExp(this.pattern);
                            if( _pattern.test(value) == true) {
                                if( value.split('@')[0].length <= 30 && value.split('@')[1].length <= 20) {
                                    for(var i = 0 ; i < checklength ; i++) {
                                        console.log(checkEmail.split(',')[i], i);
                                        if(value.split('@')[1] === checkEmail.split(',')[i]){
                                            return true;
                                            break;
                                        } 
                                    }
                                    return false;
                                } else {
                                    return false;
                                }
                            } else {
                                return false;
                            }
                        }
                    },
                    //약관동의
                    agreeUserCheck: {
                        required: true,
                        msgTarget: '.err-block',
                        errorMsg: '약관에 동의해 주시기 바랍니다.'
                    }
                }
                validation = new vcui.ui.CsValidation('#emailCertifiedForm', {register:register});
                self.bindEvent();
            });

        },
        bindEvent: function() {
            var self = this;
            //이메일 인증 버튼 클릭시
            self.$completeBtn.on('click', function(e) {
                e.preventDefault();

                var result = validation.validate();

                if (result.success === true) {
                    var url = self.$submitForm.data('ajax');
                    var param = validation.getAllValues();

                    param['agreeUserCheck'] =  param['agreeUserCheck'] ? 1 : 0;



                    var formData = new FormData();

                    for (var key in param) {
                        formData.append(key, param[key]);
                    }
                    console.log(url, formData)
                    lgkorUI.showLoading();

                    lgkorUI.requestAjaxFileData(url, formData, function(result) {
                        if (result.status == 'success') {
                            lgkorUI.hideLoading();
                            self.$submitForm.submit();
                            $('.email-certified-info').show();
                            $('#academyPopup02 .pop-footer').show();
                            $('#academyPopup02 .pop-conts').animate({
                                scrollTop: 200
                            }, 500);
                        } else {
                            lgkorUI.hideLoading();
                            // 이미 등록된 이메일경우 
                            if (result.dupAuthEmail == '1') {
                                lgkorUI.alert("", {
                                    title: '이미 인증을 받은 이메일 계정입니다. 다시 확인해 주시기 바랍니다.',
                                    okBtnName: '확인',
                                    ok: function() {
                                    }
                                });
                            }
                        }
                    }, 'POST','json',true);
                } else{
                    $('.email-certified-info').hide();
                    $('#academyPopup02 .pop-footer').hide();
                }
            });
            $('#btnLogin').on('click', function(e) {
                location.href='/sso/api/emp/Login';
            });
            $('#academyPopup01 .btn-list').on('click', function(e) {
                $('#academyPopup01').vcModal('hide'); 
                location.href='/benefits/exhibitions';
            });
    
            $('#academyPopup02 .btn-confirm').on('click', function(e) {
                $('#academyPopup02').vcModal('hide'); 
                location.reload();
            });
        }
    }

    $(window).ready(function() {
        emailCertified.init();
    });
})();