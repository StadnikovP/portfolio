var _pageShare;
var moduleApp = {
    'init': function () {
        moduleApp.pollifil();
        moduleApp.sliderSwiper();
        moduleApp.formValidation();
    },
    'pollifil': function(){
        if (!("classList" in window.document.body)) {
            Object.defineProperty(Element.prototype, 'classList', {
                get: function() {
                    var self = this, bValue = self.className.split(" ")
                    bValue.add = function (){
                        var b;
                        for(var i in arguments){
                            b = true;
                            for (var j = 0; j<bValue.length;j++)
                                if (bValue[j] == arguments[i]){
                                    b = false;
                                    break
                                }
                            if(b)
                                self.className += (self.className?" ":"")+arguments[i]
                        }
                    };
                    bValue.remove = function(){
                        self.className = "";
                        for(var i in arguments)
                            for (var j = 0; j<bValue.length;j++)
                                if(bValue[j] != arguments[i])
                                    self.className += (self.className?" " :"")+bValue[j]
                    };
                    bValue.toggle = function(x){
                        var b;
                        if(x){
                            self.className = "";
                            b = false;
                            for (var j = 0; j<bValue.length;j++)
                                if(bValue[j] != x){
                                    self.className += (self.className?" " :"")+bValue[j];
                                    b = false;
                                } else b = true;
                            if(!b)
                                self.className += (self.className?" ":"")+x
                        } else throw new TypeError("Failed to execute 'toggle': 1 argument required");
                        return !b;
                    };

                    return bValue;
                },
                enumerable: false
            });
        };

        (function() {
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                    || window[vendors[x]+'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame)
                window.requestAnimationFrame = function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                        timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };

            if (!window.cancelAnimationFrame)
                window.cancelAnimationFrame = function(id) {
                    clearTimeout(id);
                };
        }());
    },
    'popupOpen': function (content, style, beforeFunction, afterFunction, beforeClose, $subject) {
        $subject = $subject || $;
        content = content || '';
        style = style || 'fb-default-style';
        beforeFunction = beforeFunction || '';
        afterFunction = afterFunction || false;
        beforeClose = beforeClose || false;
        $subject.fancybox({
            content: content,
            wrapCSS: style,
            padding: 0,
            margin: 10,
            fitToView: false,
            openEffect: 'drop',
            closeEffect: 'drop',
            scrolling: 'auto',
            maxWidth: 1100,
            //maxWidth:'100%',
            maxHeight: 800,
            autoHeight: true,
            'beforeShow': function () {
                if (beforeFunction) {
                    beforeFunction();
                }
                hasPlaceholderSupport = function () {
                    var input = document.createElement('input');
                    return ('placeholder' in input);
                }
            },
            'afterShow': function () {
                $('.fancybox-wrap').addClass('fancybox-wrap-open');
                if (afterFunction) {
                    afterFunction();
                }
            },
            'beforeClose': function () {
                var $thisWrapper = $('.fancybox-wrap');
                if ($thisWrapper.hasClass('fancybox-wrap-close')) {
                    return true;
                } else {
                    if (beforeClose) {
                        beforeClose();
                    }
                    $thisWrapper.addClass('fancybox-wrap-close');
                    setTimeout(function () {
                        $.fancybox.close();
                    }, 300);
                    return false;
                }
            }
        });
    },
    'formValidation': function ($submitBtn, submitFunction) {
        submitFunction = submitFunction || false;
        $submitBtn = $submitBtn || $('.js-form-submit');
        var $submitForm = $submitBtn.closest('form');
        $submitForm.addClass('is-form-validation');
        var errorValidate = 'Поле обязательно для заполнения';
        var errorValidate2 = 'Поле заполнено не корректно';

        if(!device.mobile()){
            if(!device.tablet() || !device.android()){
                $submitForm.find('[data-mask="phone"]').mask("+7 (999) 999 99 99", {placeholder: "-"});
            }
            else{
                $submitForm.find('[data-mask="phone"]').attr('type','number');
            }
        }
        else{
            $submitForm.find('[data-mask="phone"]').attr('type','number');
        }

        $submitBtn.click(function (e) {
            e.preventDefault();

            var $this = $(this);
            var $thisForm = $this.closest('form');
            if ($this.hasClass('disabled')) {
                return false;
            }
            var $forms = $thisForm.find('[data-validate]');
            var result = formChecking($forms, true);
            if (result) {
                if (submitFunction) {
                    $this.addClass('disabled');
                    submitFunction($thisForm);
                }
                else{
                    setTimeout(function() {
                        $thisForm.submit();
                    }, 50);
                }
            }
            else {
                $forms.on('keyup keypress change', function () {
                    var $current = $(this);
                    setTimeout(function () {
                        formChecking($current, true);
                    }, 100);
                });
            }

            return false;
        });

        $(document).on('keydown', function (e) {
            return true;
            if (e.keyCode == 13) {
                var $thisFocus = $(document.activeElement);
                if ($thisFocus.is('textarea')) {
                    return true;
                }
                if ($thisFocus.closest('.form-select').length) {
                    return true;
                }
                if ($thisFocus.closest('.is-form-validation').length) {
                    $submitBtn.trigger('click');
                }
                return false;
            }
        });


        function formChecking($inp, onFocus) {

            onFocus = onFocus || false;
            var noError = true;

            $inp.each(function (ind, elm) {

                var $this = $(elm);
                var mask = $this.data('validate');
                var value = $this.val();
                var placeHolder = $this.attr('placeholder');

                if($this.is(':visible')){
                    if (mask == 'text') {
                        if ((value.length < 1) || (value == placeHolder)) {
                            noError = false;
                            $this.closest('.form-input').addClass('show-error');
                            $this.closest('.form-input').find('.form-item-error').slideDown(200);
                            if (onFocus) {
                                if(!device.ios()){
                                    $this.focus();
                                    onFocus = false;
                                }
                            }
                        } else {
                            $this.closest('.form-input').removeClass('show-error');
                            $this.closest('.form-input').find('.form-item-error').slideUp(200);
                        }
                    }

                    if (mask == 'phone') {
                        if ((value.length < 1) || (value.indexOf('-') > -1)) {
                            noError = false;
                            $this.closest('.form-input').addClass('show-error');
                            $this.closest('.form-input').find('.form-item-error').slideDown(200);
                        } else {
                            $this.closest('.form-input').removeClass('show-error');
                            $this.closest('.form-input').find('.form-item-error').slideUp(200);
                        }
                    }

                    if (mask == 'file') {
                        if (value.length < 2) {
                            noError = false;
                            $this.closest('.form-file').addClass('show-error');
                            if (onFocus) {
                                $this.focus();
                                onFocus = false;
                            }
                        } else {
                            $this.closest('.form-file').removeClass('show-error');
                        }
                    }

                    if (mask == 'textarea') {
                        if ((value.length < 3) || (value == placeHolder)) {
                            noError = false;
                            $this.closest('.form-textarea').addClass('show-error');
                            $this.closest('.form-textarea').find('.form-item-error').slideDown(200);
                            if (onFocus) {
                                if(!device.ios()){
                                    $this.focus();
                                    onFocus = false;
                                }
                            }
                        } else {
                            $this.closest('.form-textarea').removeClass('show-error');
                            $this.closest('.form-textarea').find('.form-item-error').slideUp(200);
                        }
                    }

                    if (mask == 'email') {
                        if(value != ''){
                            var regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,5})$/;
                            if (!regex.test(value) || (value == placeHolder)) {
                                noError = false;
                                $this.closest('.form-input').addClass('show-error');
                                $this.closest('.form-input').find('.form-item-error').slideDown(200);
                                if (onFocus) {
                                    if(!device.ios()){
                                        $this.focus();
                                        onFocus = false;
                                    }
                                }
                            } else {
                                $this.closest('.form-input').removeClass('show-error');
                                $this.closest('.form-input').find('.form-item-error').slideUp(200);
                            }
                        }
                    }

                    if(mask == "email-required"){
                        var regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,5})$/;
                        if (!regex.test(value) || (value == placeHolder)) {
                            noError = false;
                            $this.closest('.form-input').addClass('show-error');
                            $this.closest('.form-input').find('.form-item-error').slideDown(200);
                            if (onFocus) {
                                if(!device.ios()){
                                    $this.focus();
                                    onFocus = false;
                                }
                            }
                        } else {
                            $this.closest('.form-input').removeClass('show-error');
                            $this.closest('.form-input').find('.form-item-error').slideUp(200);
                        }
                    }

                    if (mask == 'filter-email') {
                        var regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                        if (regex.test(value) || (value == '')) {
                            $this.closest('.form-input').removeClass('show-error');
                            $this.closest('.form-input').find('.form-item-error').slideUp(200);
                        } else {
                            noError = false;
                            $this.closest('.form-input').addClass('show-error');
                            $this.closest('.form-input').find('.form-item-error').slideDown(200);
                            if (onFocus) {
                                if(!device.ios()){
                                    $this.focus();
                                    onFocus = false;
                                }
                            }
                        }
                    }

                    if (mask == 'select') {
                        if (!value) {
                            noError = false;
                            if (onFocus) {
                                onFocus = false;
                            }
                            $this.closest('.form-select').addClass('show-error');
                            $this.closest('.form-select').find('.form-item-error').slideDown(200);
                        } else {
                            $this.closest('.form-select').removeClass('show-error');
                            $this.closest('.form-select').find('.form-item-error').slideUp(200);
                        }
                    }

                    if (mask == 'checkbox') {
                        if (!$this.is(':checked')) {
                            noError = false;
                            if (onFocus) {
                                onFocus = false;
                            }
                            $this.closest('.form-checkbox').addClass('show-error');
                            $this.closest('.form-checkbox').find('.form-item-error').slideUp(200);
                        } else {
                            $this.closest('.form-checkbox').removeClass('show-error');
                            $this.closest('.form-checkbox').find('.form-item-error').slideUp(200);
                        }
                    }

                    if (mask == 'captcha') {
                        var response = grecaptcha.getResponse();
                        if (response.length == 0){
                            noError = false;
                            if (onFocus) {
                                onFocus = false;
                            }
                            $this.addClass('show-error');
                        } else {
                            $this.removeClass('show-error');
                        }
                    }

                    if (mask == 'serial-number'){
                        var regex = /[0-9]{9,}/;
                        if (!regex.test(value) || (value == placeHolder)) {
                            noError = false;
                            $this.closest('.form-input').addClass('show-error');
                            $this.closest('.form-input').find('.form-item-error').slideDown(200);
                            if (onFocus) {
                                if(!device.ios()){
                                    $this.focus();
                                    onFocus = false;
                                }
                            }
                        } else {
                            $this.closest('.form-input').removeClass('show-error');
                            $this.closest('.form-input').find('.form-item-error').slideUp(200);
                        }
                    }

                    if (mask == 'pass') {
                        if (value.length < 6) {
                            noError = false;
                            $this.closest('.form-input').addClass('show-error');
                            $this.closest('.form-input').find('.form-item-error').slideDown(200);
                            if (onFocus) {
                                if(!device.ios()){
                                    $this.focus();
                                    onFocus = false;
                                }
                            }
                        } else {
                            $this.closest('.form-input').removeClass('show-error');
                            $this.closest('.form-input').find('.form-item-error').slideUp(200);
                        }
                    }

                    if(mask == 'two-pass'){
                        var pass = $('.fancybox-inner .password').val();
                        if(value == '' || value != pass){
                            noError = false;
                            $this.closest('.form-input').addClass('show-error');
                            $this.closest('.form-input').find('.form-item-error').slideDown(200);
                            if (onFocus) {
                                if(!device.ios()){
                                    $this.focus();
                                    onFocus = false;
                                }
                            }
                        }
                        else{
                            $this.closest('.form-input').removeClass('show-error');
                            $this.closest('.form-input').find('.form-item-error').slideUp(200);
                        }
                    }

                    if(mask == 'date'){
                        if (value.length < 1) {
                            noError = false;
                            $this.closest('.form-input').addClass('show-error');
                            $this.closest('.form-input').find('.form-item-error').slideDown(200);
                            if (onFocus) {
                                if(!device.ios()){
                                    $this.focus();
                                    onFocus = false;
                                }
                            }
                        } else {
                            $this.closest('.form-input').removeClass('show-error');
                            $this.closest('.form-input').find('.form-item-error').slideUp(200);
                        }
                    }
                }
            });

            setTimeout(function(){
                $.fancybox.update();
            },300);

            return noError;
        }
    },
    'sliderSwiper': function () {
        if($('.js-main-slider').length> 0){
            console.log('swiper');

            var configMain = {
                    slidesPerView: 1,
                    centeredSlides: false,
                    paginationClickable: true,
                    spaceBetween: 0,
                    pagination: '.swiper-pagination',
                    onSlideChangeStart: function(){
                    }
                },
                $mainSlider = $('.js-main-slider');

            if($('.js-main-slider .swiper-slide').length > 1){
                var $mainSwiper = $mainSlider.swiper(configMain);
            }
        }

        if($('.js-quote-slider').length > 0){
            var configQuote = {
                    slidesPerView: 1,
                    centeredSlides: false,
                    paginationClickable: true,
                    spaceBetween: 0,
                    pagination: '.swiper-pagination',
                    onSlideChangeStart: function(){
                    }
                },
                $quoteSlider = $('.js-quote-slider');

            if($('.js-main-slider .swiper-slide').length > 1){
                var $quoteSwiper = $quoteSlider.swiper(configQuote);
            }
        }

    },
};

$(document).ready(function () {
    moduleApp.init();
});