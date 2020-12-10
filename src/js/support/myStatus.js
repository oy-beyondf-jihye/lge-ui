(function() {



    $(window).ready(function() {
        vcui.require([
            'ui/validation'
        ], function() {   
            var numberValidation = new vcui.ui.CsValidation('#numberForm', {
                register: {
                    userName1: {
                        msgTarget: '.err-block',
                        pattern: /^[ㄱ-ㅎ|가-힣|a-z|A-Z\*]+$/,
                        maxLength: 30
                    },
                    number: {
                        msgTarget: '.err-block',
                        pattern: /^[0-9]+$/,
                        maxLength: 20
                    }
                }
            });
            var phoneValidation = new vcui.ui.CsValidation('#phoneForm', {
                register: {
                    userName2: {
                        msgTarget: '.err-block',
                        pattern: /^[ㄱ-ㅎ|가-힣|a-z|A-Z\*]+$/,
                        maxLength: 30
                    },
                    phoneNo: {
                        msgTarget: '.err-block',
                        pattern: /^[0-9]+$/,
                        maxLength: 11
                    },
                    authNo: {
                        msgTarget: '.err-block',
                    }
                }
            });

            $('#numberForm').find('.btn-confirm').on('click', function() {
                var result = numberValidation.validate(),
                    data = numberValidation.getAllValues();

                if (result.success) {
                    lgkorUI.showLoading();
                    lgkorUI.requestAjaxDataPost($('#numberForm').data('ajax'), data, function(result) {
                        var data = result.data;

                        if (data.resultFlag == 'Y') {
                            $('#numberForm').submit();
                        } else if (data.resultFlag == 'N') {
                            $('#laypop1').vcModal();
                        }

                        lgkorUI.hideLoading();
                    });
                }
            });

            $('#phoneForm').find('.btn-confirm').on('click', function() {
                var result = phoneValidation.validate(),
                    data = phoneValidation.getAllValues();

                if (result.success) {
                    if ($('#authNo').prop('disabled')) {
                        $('#laypop2').vcModal(); 
                        return true;
                    }

                    lgkorUI.showLoading();
                    lgkorUI.requestAjaxDataPost($('#numberForm').data('ajax'), data, function(result) {

                        if (data.resultFlag == 'Y') {
                            $('#phoneForm').submit();
                        } else if (data.resultFlag == 'N') {
                            $('#laypop1').vcModal();
                        }

                        lgkorUI.hideLoading();
                    });
                }
            });

            $('.btn-send').on('click', function() {
                var data = {
                    userName2: $('#userName2').val(),
                    phoneNo: $('#phoneNo').val()    
                }
                
                
                lgkorUI.requestAjaxDataPost($(this).data('ajax'), data, function(result) {
                    var data = result.data;

                    if (data.resultFlag == 'Y') {
                        $(this).find('span').html('인증 번호 재발송');
                        $('#authNo').prop('disabled', false).focus();
                    } else {
                        $('#laypop4').vcModal();
                    }
                });
                
            });
        });
    });
})();