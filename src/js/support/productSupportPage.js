(function() {
    
    
    
    $(window).ready(function() {
        var psp = {
            submitForm: document.getElementById('submitForm'),
            solutionsForm: document.getElementById('solutionsForm'),
            init: function() {
                var self = this;

                self.$submitForm = $(self.submitForm);
                self.$solutionsForm = $(self.solutionsForm);

                $('[data-js="anchors-tab"]').anchorTab();
                $('.pagination').pagination();
            },
            setEventListener: function() {
                    
            }
        }
        
        psp.init();
    });
})();