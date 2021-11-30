// ★ 공지사항 관련 게시글은 별도의 어드민 api개발이 완료된 이 후 , 따로 api로 그린다고함. cms에서 붙임
(function (){
    var qnaListTmpl = 
    '<li class="lists" data-que-no="{{ questionNo }}" {{#if (secret == "Y") }}data-secret-flag="{{secret}}"{{/if}}>' +
        '<div class="head">' +
            '<a href="#n" class="accord-btn ui_accord_toggle" data-open-text="내용 더 보기" data-close-text="내용 닫기">' +
                '<span class="badge{{#if (answered == "Y") }} active{{/if}}">{{#if (answered == "Y") }}답변완료{{/if}}{{#if (answered == "N") }}답변대기{{/if}}</span>' + 
                '<span class="title line1">{{ questionTitle }}</span>' +
                '<span class="writer"> {{ creationUserName }} </span>' +
                '<span class="date"> {{ creationDate }} </span>' +
                '<span class="blind ui_accord_text">내용 더 보기</span>' +
            '</a>' +
        '</div>' +
        '<div class="accord-cont ui_accord_content" style="display:none;">' +
            '<div class="que-box">' +
                '<div>' +
                    '<span class="que tit">Q</span>' +
                    '<p class="desc">' +
                        '{{ questionContent }}' +
                    '</p>' +
                    '<div class="img-wrap">' +
                        '{{#each item in files }}' +
                        '<img src="{{ item.filePath }}" alt="{{ item.fileName }}">' +
                        '{{/each}}'+
                    '</div>' +
                '</div>' +
            '</div>' +
            '{{#if (answered == "Y") }} ' +
            '<div class="ans-box">' +
                '<div>' +
                    '<span class="ans tit">A</span>' +
                    '<p class="desc">' +
                        '{{ answerContent }}' + 
                    '</p>' +
                '</div>' +
                '<div class="ans-date-wrap">' +
                    '답변일 <span class="ans-date">{{ answerDate }}</span>' +
                '</div>' +
            '</div>' +
            '{{/if}}' +
            '<div class="btn-wrap">' +
                '{{#if (answered == "N") }} ' + 
                '<button class="modi-btn" type="button" data-href="" data-control="modal" data-name="modify">수정</button>' + 
                '{{/if}}' +
                '<button class="del-btn" type="button" data-name="delete">삭제</button>' +
            '</div>' +
        '</div>' +
    '</li>';




    var qnaPdp = {
        init : function (){
            loginFlag = digitalData.hasOwnProperty("userInfo") && digitalData.userInfo.unifyId ? "Y" : "N";
            var self = this;

            vcui.require(['ui/pagination', 'ui/validation'], function (){
                self.settings();
                self.bindEvents();
                self.validation = new vcui.ui.CsValidation('#submitForm', { 
                
                });
            });
        },
        settings : function (){
            var self = this;            
            
            self.$pdpQna = $('#pdp_qna');
            
            // QnA 리스트 상단 영역
            self.$totalCount = self.$pdpQna.find('.count');
            self.$sortingWrap = self.$pdpQna.find('.sorting-wrap');
            self.$sortSelect = self.$sortingWrap.find('.ui_selectbox'); //문의유형 select 정렬
            self.$sortSecChk = self.$sortingWrap.find('.chk-wrap'); //비밀글 제외 체크 
            self.$reqBtn = self.$sortingWrap.find('.ico-req'); //문의하기 버튼

            //Qna LIst
            self.$qnaType = self.$pdpQna.find('.KRP0043');
            self.$dataModelId = self.$qnaType.attr('data-model-id');
            self.$qnaList = self.$qnaType.find('ul.qna-result-lists');
            
            
            // self.$queBox = self.$qnaType.find('.que-box');
            // self.$queTit = self.$queBox.find('.tit');
            // self.$queDesc = self.$queBox.find('.desc');
            // self.$queImgWrap = self.$queBox.find('.img-wrap');
            // self.$ansBox = self.$qnaType.find('.ans-box');
            // self.$ansTit = self.$ansBox.find('.tit');
            // self.$ansDesc = self.$ansBox.find('.desc');
            // self.$ansDateWrap = self.$ansBox.find('.ans-date-wrap');
            // self.$ansDate = self.$ansDateWrap.find('.ans-date');

            self.$modifyBtn = self.$qnaType.find('.modi-btn');
            self.$deleteBtn = self.$qnaType.find('.del-btn');
            
            self.$nodata = self.$pdpQna.find('.no-data-message');
            self.$pagination = self.$pdpQna.find('.pagination').vcPagination({scrollTop : 'noUse'});

            //등록하기 팝업
            self.$writePopup = $('#popupWrite');
            self.$writeForm = self.$writePopup.find("#submitForm");

            self.$writeQnaType = self.$writePopup.find('#qnaType');
            self.$writeTitle = self.$writePopup.find('#title');
            self.$writeDesc = self.$writePopup.find('#content');

            //self.$myPageLink = self.$writePopup.find('.underline');

            //self.$completeBtn = self.$writePopup.find('.btn-group');
            //self.$fileDelBtn = self.$writePopup.find('.btn-file-del'); //출처 확인
            
            self.$secretChkBtn = self.$writePopup.find('#privateFlag');
            //self.$confirmBtn = self.$writePopup.find('.btn-confirm');
        },
        bindEvents : function() {
            var self = this;

            // QnA 리스트 : 페이징 선택
            self.$pagination.off('page_click.page').on('page_click.page',  function(e, data) {
                var questionTypeCode = self.$sortSelect.vcSelectbox('value');
                var excludePrivate  = self.$sortSecChk.find('input[type=checkbox]:checked').val(); // on , undefined(not-checked)
                if(excludePrivate === "on" ) {
                    excludePrivate = "Y";
                } else {
                    excludePrivate = "N";
                }
                self.requestQnaListData({"questionTypeCode":questionTypeCode,"excludePrivate":excludePrivate ,"page": data});
            });
            
            // QnA 리스트 : selectbox 선택
            self.$sortSelect.off('change').on('change', function(e){
                var questionTypeCode = self.$sortSelect.vcSelectbox('value');
                var questionTypeName = self.$sortSelect.vcSelectbox('text');
                var excludePrivate = self.$sortSecChk.find('input[type=checkbox]:checked').val(); // on , undefined
                if(excludePrivate === "on" ) {
                    excludePrivate = "Y";
                } else {
                    excludePrivate = "N";
                }
                self.requestQnaListData({"questionTypeCode":questionTypeCode,"queTypeName":questionTypeName,"excludePrivate":excludePrivate ,"page": 1});
            });            

            //파일삭제하기 - 문의글 수정시
            self.$writePopup.find('.btn-file-del').off('click').on('click',function(){
                var self = this;
                lgkorUI.confirm('', {
                    title:'삭제하시겠습니까?', 
                    cancelBtnName: '아니오', okBtnName: '예',
                    ok : function (e,data){ 
                        self.uploadFileDelete();
                    }
                });
            });

            self.$writePopup.find('.btn-confirm').off('click').on('click', function() {
                
                var param = $(this).closest("#popupWrite").data('param');
                var valChk = self.formValidationChk(param);
                
                // console.log("test : "+param.mode);
                if(valChk){
                    lgkorUI.confirm('', {
                        title:param.mode === 'write' ? '저장 하시겠습니까?' : '게시물을 수정하시겠습니까?',
                        okBtnName:param.mode === 'write' ? '확인' : '예',
                        cancelBtnName:param.mode === 'write' ? '취소' :'아니오',
                        ok: function() {
                            if(param.mode === 'write'){
                                self.requestQnaWrite(param);
                            }else{
                                self.requestQnaModify();
                            }
                        }
                    }); 
                }
            });

            //삭제하기
            self.$qnaType.find('.del-btn').off('click').on('click', function(){
                var modelId = $('.KRP0043').attr('data-model-id');
                var queNo = $(this).closest('li.lists').attr("data-que-no");
                lgkorUI.confirm('', {
                    title:'게시물을 삭제하시겠습니까? <br> 답변이 작성된 경우 답변도 같이 삭제됩니다.', 
                    cancelBtnName: '아니오', okBtnName: '예', 
                    ok : function (){ 
                        self.requestQnaDelete({"modelId":modelId, "queNo":queNo});
                    }
                }); 
            });

            //문의하기 
            self.$reqBtn.on('click', function(){
                var mode = self.$reqBtn.attr('data-name');
                console.log(mode);
                self.requestQnaReadPop({"mode":mode});
                
            });

            //수정하기
            self.$qnaType.find('.modi-btn').off('click').on('click', function(){
                var mode = self.$modifyBtn.attr('data-name');
                var modelId = self.$dataModelId;
                var queNo = $(this).closest('li.lists').attr("data-que-no");
                self.requestQnaReadPop({"mode":mode,"selector":this, "modelId":modelId, "queNo":queNo}); //qna read popup
            });

            self.$writePopup.find('.underline').off('click').on('click', function(){
                window.open('/my-page/email-inquiry');
            });

            self.$qnaType.find('#secretSort').off('click').on('click', function(){
                var chkVal = self.$sortSecChk.find('input[type=checkbox]:checked').val();
                if (chkVal == "on") {
                    $('ul.qna-result-lists > li').each(function(idx,item){
                        if($(this).data('secretFlag') == "Y"){
                            $(this).hide();
                        }
                    });
                } else {
                    $('ul.qna-result-lists > li').show();
                }
            });
        },           
        // qna-list - get
        requestQnaListData : function(param){
            console.log("QnA List - API request !!");
            console.log(param);
            
            var typeSelText = $('#cusomtSelectbox_7_button > a > span.ui-select-text');
            var self = this;
            var ajaxUrl = self.$qnaType.data('ajax') + "?modelId=" + self.$dataModelId + "&page=" + param.page ;
            var selectedQTypeName = param.queTypeName;
            
            typeSelText.html(selectedQTypeName);
            
            lgkorUI.showLoading();
            lgkorUI.requestAjaxData(ajaxUrl, param, function(result){
                if(result.status == "success") {
                    var data = result.data.qnaList;
                    var pagination = result.data.pagination;
                    var totalCount = result.data.qnaTotalCount;
                    var selectedQTypeVal = param.questionTypeCode;
                    
                    var html = "";

                    if(data.length > 0) {
      
                        // qna 리스트 문의 건수, 999건 초과시 999+
                        if(totalCount > 999 ){
                            self.$totalCount.text("999+");
                        } else {
                            self.$totalCount.text(totalCount);
                        }

                        //리스트 페이지 노출
                        // select-box 문의유형 선택값 필터처리
                        if(selectedQTypeVal == 'ALL'){
                            data.forEach(function(item){
                                html += vcui.template(qnaListTmpl, item);
                            });
                        } else {
                            //let selArr = data.filter(key => key.questionTypeCode == selectedQTypeVal);
                            var selArr = data.filter(function(key){
                                return key.questionTypeCode == selectedQTypeVal;
                            });

                            selArr.forEach(function(item){
                                html += vcui.template(qnaListTmpl, item);
                            });
                         
                        }

                        self.$qnaList.empty().append(html);
                        self.bindEvents();
                        self.$pagination.vcPagination('setPageInfo', pagination);
            
                    } else {
                        self.$qnaType.find('.qna-result-lists').hide();
                        self.$nodata.show();
                    }
                    lgkorUI.hideLoading();
                } else {
                    self.$qnaType.find('.qna-result-lists').hide();
                    self.$nodata.show();
                    lgkorUI.hideLoading();
                }
            }, 'POST');
        },
        // qna-read-popup - get
        requestQnaReadPop : function(param) {
            console.log("QnA 조회 팝업 - API request !!");
            var self = this;
            
            //수정하기용, 문의하기일땐 READ API거칠 필요 없음
            var ajaxUrl = self.$qnaType.data('readAjax') + "?modelId=" + param.modelId +"&questionNo="+ param.queNo;
            console.log(ajaxUrl);

            //일반 case
            if(lgkorUI.stringToBool(loginFlag)) {
                if(param.mode == 'write') {
                    // write
                    self.$writeTitle.val('');
                    self.$writeDesc.val('');
                    self.$secretChkBtn.attr("checked",false);
                    $('#popupWrite').find('.pop-header > .tit > span').html("문의하기");
                    $('#cusomtSelectbox_58_button > a > span.ui-select-text').html("문의 유형을 선택해주세요");
                    $('#cusomtSelectbox_58_menu > div > ul > li').eq(0).addClass("on");

                    if($('#popupWrite').hasClass='modify') {
                        $('#popupWrite').removeClass('modify');
                    }
                    $('#popupWrite').addClass(param.mode);
                    
                    $('.ico-req').attr('data-href','#popupWrite');

                } else {
                    // modify
                    console.log("modify");
                    
                    if($('#popupWrite').hasClass='write') {
                        $('#popupWrite').removeClass('write');
                    }
                    $('#popupWrite').addClass(param.mode);
                    $('#popupWrite').find('.pop-header > .tit > span').html("수정하기");

                    $(param.selector).attr('data-href','#popupWrite');

                    lgkorUI.requestAjaxData(ajaxUrl,{},function(result){
                        var data = result.data;
                        if(result.status === "success") {
                            var qTitle = data.questionTitle;
                            var qContent = data.questionContent;
                            var secretFlag = data.secret;
                            var qTypeCode = data.questionTypeCode;

                            self.$writeTitle.val(qTitle);
                            self.$writeDesc.val(qContent);
                            var qTypeList = $('#cusomtSelectbox_58_menu > div > ul > li');
                            var qTypeListItem = $('#cusomtSelectbox_58_menu > div > ul > li > a');
                            var qTypeBtnSelectedText = $('#cusomtSelectbox_58_button > a > span.ui-select-text');

                            if(secretFlag === "Y") {
                                self.$secretChkBtn.attr("checked", true);
                            }

                            for(var i=0 ; i < qTypeListItem.length; i++){
                                if(qTypeListItem[i].dataset.value === qTypeCode) {
                                    //console.log(qTypeListItem[i].textContent);
                                    qTypeList.removeClass("on");
                                    qTypeListItem[i].closest('li').classList.add("on");
                                    qTypeBtnSelectedText.html(qTypeListItem[i].textContent);
                                }
                            }
                        } else {
                            console.log("fail");
                        }
                    },"POST");
                }
                $('#popupWrite').data("param",param);
                self.uploadFileChk(); //파일업로드 이벤트실행
            } else {
                lgkorUI.confirm('', {
                    title:'로그인 후 등록이 가능합니다.<br>로그인 하시겠습니까?', 
                    cancelBtnName: '아니오', okBtnName: '예', 
                    ok : function (){ 
                        window.location.href = "/sso/api/Login";
                    }
                });
            }
            

        },
        // qna-write - post
        requestQnaWrite : function(el) {
            self = this;
            ajaxUrl = self.$writeForm.data('createAjax');

            console.log("QnA 등록하기 - API request !!" + ajaxUrl);

            if(ajaxUrl) {
                var param = self.validation.getAllValues();
                var formData = new FormData();

                // data modelId 값 추가
                formData.append('modelId', self.$dataModelId);
        
                for (var key in param) {
                    if(key == 'privateFlag'){
                        param[key]  = param[key] == true ? "Y" : "N";
                    }
                    formData.append(key, param[key]);

                    if(key.indexOf('imageFile') > -1) {

                        //var changeFile = key.replace('image','change');

                        //신규 업로드시 삭제된 파일 체크
                        var $file = $("#"+key);
                        if(!param[key] &&  $file.data('fileFlag') === 'insert') {
                            $file.removeData('fileFlag')
                        } 

                        //글작성 ,수정시 fileFlag 보내줌
                        //formData.append(changeFile, $file.data('fileFlag') );
                    }
                }

                lgkorUI.showLoading();

                lgkorUI.requestAjaxFileData(ajaxUrl, formData, function(result) {
                    if (result.status == 'success') {
                        lgkorUI.hideLoading();
                        $('#popupWrite').vcModal('hide');
                        lgkorUI.alert("", {
                            title: "게시물이 등록되었습니다."
                            
                        });
                        location.reload();
                    } else {
                        lgkorUI.hideLoading();
                        $('#popupWrite').vcModal('hide');
                        if (result.message) {
                            lgkorUI.alert("", {
                                title: result.message,
                            });
                        }
                        
                    }
                }, 'POST', 'json',true);
            }
        },
        // qna-modify-popup - post
        requestQnaModify :function(param) {
            var self = this;
            ajaxUrl = self.$writeForm.data('updateAjax');
            console.log("QnA 수정하기 - API request !!" + ajaxUrl);

            if(ajaxUrl) {
                var param = self.validation.getAllValues(); 
                var formData = new FormData();

                // data modelId 값 추가
                formData.append('modelId', self.$dataModelId);
        
                for (var key in param) {
                    formData.append(key, param[key]);

                    if(key.indexOf('imageFile') > -1) {

                        var changeFile = key.replace('image','change');

                        //신규 업로드시 삭제된 파일 체크
                        var $file = $("#"+key);
                        if(!param[key] &&  $file.data('fileFlag') === 'insert') {
                            $file.removeData('fileFlag')
                        } 

                        //글작성 ,수정시 fileFlag 보내줌
                        formData.append(changeFile, $file.data('fileFlag') );
                    } 
                }

                //lgkorUI.showLoading();
                lgkorUI.requestAjaxFileData(ajaxUrl, formData, function(result) {
                    if (result.status == 'success') {
                        lgkorUI.hideLoading();
                        $('#popupWrite').vcModal('hide');
                        lgkorUI.alert("", {
                            title: "게시물이 수정되었습니다."
                            
                        });
                        location.reload();
                    } else {
                        lgkorUI.hideLoading();
                        $('#popupWrite').vcModal('hide');
                        if (result.message) {
                            lgkorUI.alert("", {
                                title: result.message,
                            });
                        }
                    }
                }, 'POST', 'json',true);
            }
        },
        // qna-delete-popup - post
        requestQnaDelete :function(param) {
            console.log("QnA 삭제하기 - API request !!");
            var self = this;
            var ajaxUrl = self.$qnaType.data('deleteAjax') + "?modelId=" + param.modelId +"&questionNo="+ param.queNo;
            console.log(ajaxUrl);
            if(lgkorUI.stringToBool(loginFlag)) {
                lgkorUI.requestAjaxData(ajaxUrl,param, function(result) {
                    if(result.status === 'success') {
                        //if(result.returnUrl) location.href = result.returnUrl;
                        lgkorUI.alert("", {
                            title: "게시물이 삭제되었습니다."
                            
                        });
                        location.reload();
                    } else {
                        lgkorUI.alert("", {
                            title: result.message
                        });
                    }
                },"POST");
            } else {
                //비로그인
                lgkorUI.confirm('', {
                    title:'로그인 후 등록이 가능합니다.<br>로그인 하시겠습니까?', 
                    cancelBtnName: '아니오', okBtnName: '예', 
                    ok : function (){ 
                        window.location.href = "/sso/api/Login";
                    }
                });
            }
            
        },
        //파일업로드 체크
        uploadFileChk : function(param){
            var self = this;

            self.$writeForm.find('.ui_imageinput').vcImageFileInput({
                individualFlag:true,
                totalSize: 40 * 1024 * 1024,
                message: {
                    name: '파일 명에 특수기호(? ! , . & ^ ~ )를 제거해 주시기 바랍니다.',
                    format: 'jpg, jpeg, png, gif 파일만 첨부 가능합니다.',
                    size: '첨부파일 용량은 10mb 이내로 등록 가능합니다.'
                }
            });

            self.$writeForm.find('.ui_imageinput input[type="file"]').on('change',function(e) {
                // 업로드 파일변경시 delete FLAG 가 없고 , 파일이 있는경우 신규 업로드로 간주
                if($(this).val() !== '' && $(this).data('fileFlag') !== 'delete') {
                    $(this).data('fileFlag','insert');
                }
            })
        },
        // 글 수정시 파일 삭제 함수
        uploadFileDelete: function(el) {
            var self = this;
            var $fileItem = $(el).closest('.file-item');
            $fileItem.find("input[type='file']").data('fileFlag','delete');
            $fileItem.find('.file-preview').empty();
            $fileItem.find('.file-name input').prop('placeholder','');
            $fileItem.removeClass('modify');
        },
        formValidationChk : function(param) {
            var self = this;
            var qnaTypeVal =  self.$writeQnaType.find('option:selected').val();
            var titleVal = self.$writeTitle.val();
            var descVal = self.$writeDesc.val();
            
            if(!qnaTypeVal){
                lgkorUI.alert("", {
                    title: "문의 유형을 선택해주세요."
                });
    
                return false;
            }

            if(!titleVal){
                lgkorUI.alert("", {
                    title: "문의 제목을 작성해주세요."
                });
    
                return false;
            }
                
            if(!descVal){
                lgkorUI.alert("", {
                    title: "문의 내용을 작성해주세요."
                });
    
                return false;
            }

            return true;
        }
    };

$(document).ready(function(){
        qnaPdp.init();
})

})();