// var _pageShare;
// var moduleApp = {
//     'init': function () {
//         moduleApp.pollifil();
//         moduleApp.sliderSwiper();
//         moduleApp.formValidation();
//     },
//     'pollifil': function(){
//         if (!("classList" in window.document.body)) {
//             Object.defineProperty(Element.prototype, 'classList', {
//                 get: function() {
//                     var self = this, bValue = self.className.split(" ")
//                     bValue.add = function (){
//                         var b;
//                         for(var i in arguments){
//                             b = true;
//                             for (var j = 0; j<bValue.length;j++)
//                                 if (bValue[j] == arguments[i]){
//                                     b = false;
//                                     break
//                                 }
//                             if(b)
//                                 self.className += (self.className?" ":"")+arguments[i]
//                         }
//                     };
//                     bValue.remove = function(){
//                         self.className = "";
//                         for(var i in arguments)
//                             for (var j = 0; j<bValue.length;j++)
//                                 if(bValue[j] != arguments[i])
//                                     self.className += (self.className?" " :"")+bValue[j]
//                     };
//                     bValue.toggle = function(x){
//                         var b;
//                         if(x){
//                             self.className = "";
//                             b = false;
//                             for (var j = 0; j<bValue.length;j++)
//                                 if(bValue[j] != x){
//                                     self.className += (self.className?" " :"")+bValue[j];
//                                     b = false;
//                                 } else b = true;
//                             if(!b)
//                                 self.className += (self.className?" ":"")+x
//                         } else throw new TypeError("Failed to execute 'toggle': 1 argument required");
//                         return !b;
//                     };
//
//                     return bValue;
//                 },
//                 enumerable: false
//             });
//         };
//
//         (function() {
//             var lastTime = 0;
//             var vendors = ['ms', 'moz', 'webkit', 'o'];
//             for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
//                 window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
//                 window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
//                     || window[vendors[x]+'CancelRequestAnimationFrame'];
//             }
//
//             if (!window.requestAnimationFrame)
//                 window.requestAnimationFrame = function(callback, element) {
//                     var currTime = new Date().getTime();
//                     var timeToCall = Math.max(0, 16 - (currTime - lastTime));
//                     var id = window.setTimeout(function() { callback(currTime + timeToCall); },
//                         timeToCall);
//                     lastTime = currTime + timeToCall;
//                     return id;
//                 };
//
//             if (!window.cancelAnimationFrame)
//                 window.cancelAnimationFrame = function(id) {
//                     clearTimeout(id);
//                 };
//         }());
//     },
//     'popupOpen': function (content, style, beforeFunction, afterFunction, beforeClose, $subject) {
//         $subject = $subject || $;
//         content = content || '';
//         style = style || 'fb-default-style';
//         beforeFunction = beforeFunction || '';
//         afterFunction = afterFunction || false;
//         beforeClose = beforeClose || false;
//         $subject.fancybox({
//             content: content,
//             wrapCSS: style,
//             padding: 0,
//             margin: 10,
//             fitToView: false,
//             openEffect: 'drop',
//             closeEffect: 'drop',
//             scrolling: 'auto',
//             maxWidth: 1100,
//             //maxWidth:'100%',
//             maxHeight: 800,
//             autoHeight: true,
//             'beforeShow': function () {
//                 if (beforeFunction) {
//                     beforeFunction();
//                 }
//                 hasPlaceholderSupport = function () {
//                     var input = document.createElement('input');
//                     return ('placeholder' in input);
//                 }
//             },
//             'afterShow': function () {
//                 $('.fancybox-wrap').addClass('fancybox-wrap-open');
//                 if (afterFunction) {
//                     afterFunction();
//                 }
//             },
//             'beforeClose': function () {
//                 var $thisWrapper = $('.fancybox-wrap');
//                 if ($thisWrapper.hasClass('fancybox-wrap-close')) {
//                     return true;
//                 } else {
//                     if (beforeClose) {
//                         beforeClose();
//                     }
//                     $thisWrapper.addClass('fancybox-wrap-close');
//                     setTimeout(function () {
//                         $.fancybox.close();
//                     }, 300);
//                     return false;
//                 }
//             }
//         });
//     },
//     'formValidation': function ($submitBtn, submitFunction) {
//         submitFunction = submitFunction || false;
//         $submitBtn = $submitBtn || $('.js-form-submit');
//         var $submitForm = $submitBtn.closest('form');
//         $submitForm.addClass('is-form-validation');
//         var errorValidate = 'Поле обязательно для заполнения';
//         var errorValidate2 = 'Поле заполнено не корректно';
//
//         if(!device.mobile()){
//             if(!device.tablet() || !device.android()){
//                 $submitForm.find('[data-mask="phone"]').mask("+7 (999) 999 99 99", {placeholder: "-"});
//             }
//             else{
//                 $submitForm.find('[data-mask="phone"]').attr('type','number');
//             }
//         }
//         else{
//             $submitForm.find('[data-mask="phone"]').attr('type','number');
//         }
//
//         $submitBtn.click(function (e) {
//             e.preventDefault();
//
//             var $this = $(this);
//             var $thisForm = $this.closest('form');
//             if ($this.hasClass('disabled')) {
//                 return false;
//             }
//             var $forms = $thisForm.find('[data-validate]');
//             var result = formChecking($forms, true);
//             if (result) {
//                 if (submitFunction) {
//                     $this.addClass('disabled');
//                     submitFunction($thisForm);
//                 }
//                 else{
//                     setTimeout(function() {
//                         $thisForm.submit();
//                     }, 50);
//                 }
//             }
//             else {
//                 $forms.on('keyup keypress change', function () {
//                     var $current = $(this);
//                     setTimeout(function () {
//                         formChecking($current, true);
//                     }, 100);
//                 });
//             }
//
//             return false;
//         });
//
//         $(document).on('keydown', function (e) {
//             return true;
//             if (e.keyCode == 13) {
//                 var $thisFocus = $(document.activeElement);
//                 if ($thisFocus.is('textarea')) {
//                     return true;
//                 }
//                 if ($thisFocus.closest('.form-select').length) {
//                     return true;
//                 }
//                 if ($thisFocus.closest('.is-form-validation').length) {
//                     $submitBtn.trigger('click');
//                 }
//                 return false;
//             }
//         });
//
//
//         function formChecking($inp, onFocus) {
//
//             onFocus = onFocus || false;
//             var noError = true;
//
//             $inp.each(function (ind, elm) {
//
//                 var $this = $(elm);
//                 var mask = $this.data('validate');
//                 var value = $this.val();
//                 var placeHolder = $this.attr('placeholder');
//
//                 if($this.is(':visible')){
//                     if (mask == 'text') {
//                         if ((value.length < 1) || (value == placeHolder)) {
//                             noError = false;
//                             $this.closest('.form-input').addClass('show-error');
//                             $this.closest('.form-input').find('.form-item-error').slideDown(200);
//                             if (onFocus) {
//                                 if(!device.ios()){
//                                     $this.focus();
//                                     onFocus = false;
//                                 }
//                             }
//                         } else {
//                             $this.closest('.form-input').removeClass('show-error');
//                             $this.closest('.form-input').find('.form-item-error').slideUp(200);
//                         }
//                     }
//
//                     if (mask == 'phone') {
//                         if ((value.length < 1) || (value.indexOf('-') > -1)) {
//                             noError = false;
//                             $this.closest('.form-input').addClass('show-error');
//                             $this.closest('.form-input').find('.form-item-error').slideDown(200);
//                         } else {
//                             $this.closest('.form-input').removeClass('show-error');
//                             $this.closest('.form-input').find('.form-item-error').slideUp(200);
//                         }
//                     }
//
//                     if (mask == 'file') {
//                         if (value.length < 2) {
//                             noError = false;
//                             $this.closest('.form-file').addClass('show-error');
//                             if (onFocus) {
//                                 $this.focus();
//                                 onFocus = false;
//                             }
//                         } else {
//                             $this.closest('.form-file').removeClass('show-error');
//                         }
//                     }
//
//                     if (mask == 'textarea') {
//                         if ((value.length < 3) || (value == placeHolder)) {
//                             noError = false;
//                             $this.closest('.form-textarea').addClass('show-error');
//                             $this.closest('.form-textarea').find('.form-item-error').slideDown(200);
//                             if (onFocus) {
//                                 if(!device.ios()){
//                                     $this.focus();
//                                     onFocus = false;
//                                 }
//                             }
//                         } else {
//                             $this.closest('.form-textarea').removeClass('show-error');
//                             $this.closest('.form-textarea').find('.form-item-error').slideUp(200);
//                         }
//                     }
//
//                     if (mask == 'email') {
//                         if(value != ''){
//                             var regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,5})$/;
//                             if (!regex.test(value) || (value == placeHolder)) {
//                                 noError = false;
//                                 $this.closest('.form-input').addClass('show-error');
//                                 $this.closest('.form-input').find('.form-item-error').slideDown(200);
//                                 if (onFocus) {
//                                     if(!device.ios()){
//                                         $this.focus();
//                                         onFocus = false;
//                                     }
//                                 }
//                             } else {
//                                 $this.closest('.form-input').removeClass('show-error');
//                                 $this.closest('.form-input').find('.form-item-error').slideUp(200);
//                             }
//                         }
//                     }
//
//                     if(mask == "email-required"){
//                         var regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,5})$/;
//                         if (!regex.test(value) || (value == placeHolder)) {
//                             noError = false;
//                             $this.closest('.form-input').addClass('show-error');
//                             $this.closest('.form-input').find('.form-item-error').slideDown(200);
//                             if (onFocus) {
//                                 if(!device.ios()){
//                                     $this.focus();
//                                     onFocus = false;
//                                 }
//                             }
//                         } else {
//                             $this.closest('.form-input').removeClass('show-error');
//                             $this.closest('.form-input').find('.form-item-error').slideUp(200);
//                         }
//                     }
//
//                     if (mask == 'filter-email') {
//                         var regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
//                         if (regex.test(value) || (value == '')) {
//                             $this.closest('.form-input').removeClass('show-error');
//                             $this.closest('.form-input').find('.form-item-error').slideUp(200);
//                         } else {
//                             noError = false;
//                             $this.closest('.form-input').addClass('show-error');
//                             $this.closest('.form-input').find('.form-item-error').slideDown(200);
//                             if (onFocus) {
//                                 if(!device.ios()){
//                                     $this.focus();
//                                     onFocus = false;
//                                 }
//                             }
//                         }
//                     }
//
//                     if (mask == 'select') {
//                         if (!value) {
//                             noError = false;
//                             if (onFocus) {
//                                 onFocus = false;
//                             }
//                             $this.closest('.form-select').addClass('show-error');
//                             $this.closest('.form-select').find('.form-item-error').slideDown(200);
//                         } else {
//                             $this.closest('.form-select').removeClass('show-error');
//                             $this.closest('.form-select').find('.form-item-error').slideUp(200);
//                         }
//                     }
//
//                     if (mask == 'checkbox') {
//                         if (!$this.is(':checked')) {
//                             noError = false;
//                             if (onFocus) {
//                                 onFocus = false;
//                             }
//                             $this.closest('.form-checkbox').addClass('show-error');
//                             $this.closest('.form-checkbox').find('.form-item-error').slideUp(200);
//                         } else {
//                             $this.closest('.form-checkbox').removeClass('show-error');
//                             $this.closest('.form-checkbox').find('.form-item-error').slideUp(200);
//                         }
//                     }
//
//                     if (mask == 'captcha') {
//                         var response = grecaptcha.getResponse();
//                         if (response.length == 0){
//                             noError = false;
//                             if (onFocus) {
//                                 onFocus = false;
//                             }
//                             $this.addClass('show-error');
//                         } else {
//                             $this.removeClass('show-error');
//                         }
//                     }
//
//                     if (mask == 'serial-number'){
//                         var regex = /[0-9]{9,}/;
//                         if (!regex.test(value) || (value == placeHolder)) {
//                             noError = false;
//                             $this.closest('.form-input').addClass('show-error');
//                             $this.closest('.form-input').find('.form-item-error').slideDown(200);
//                             if (onFocus) {
//                                 if(!device.ios()){
//                                     $this.focus();
//                                     onFocus = false;
//                                 }
//                             }
//                         } else {
//                             $this.closest('.form-input').removeClass('show-error');
//                             $this.closest('.form-input').find('.form-item-error').slideUp(200);
//                         }
//                     }
//
//                     if (mask == 'pass') {
//                         if (value.length < 6) {
//                             noError = false;
//                             $this.closest('.form-input').addClass('show-error');
//                             $this.closest('.form-input').find('.form-item-error').slideDown(200);
//                             if (onFocus) {
//                                 if(!device.ios()){
//                                     $this.focus();
//                                     onFocus = false;
//                                 }
//                             }
//                         } else {
//                             $this.closest('.form-input').removeClass('show-error');
//                             $this.closest('.form-input').find('.form-item-error').slideUp(200);
//                         }
//                     }
//
//                     if(mask == 'two-pass'){
//                         var pass = $('.fancybox-inner .password').val();
//                         if(value == '' || value != pass){
//                             noError = false;
//                             $this.closest('.form-input').addClass('show-error');
//                             $this.closest('.form-input').find('.form-item-error').slideDown(200);
//                             if (onFocus) {
//                                 if(!device.ios()){
//                                     $this.focus();
//                                     onFocus = false;
//                                 }
//                             }
//                         }
//                         else{
//                             $this.closest('.form-input').removeClass('show-error');
//                             $this.closest('.form-input').find('.form-item-error').slideUp(200);
//                         }
//                     }
//
//                     if(mask == 'date'){
//                         if (value.length < 1) {
//                             noError = false;
//                             $this.closest('.form-input').addClass('show-error');
//                             $this.closest('.form-input').find('.form-item-error').slideDown(200);
//                             if (onFocus) {
//                                 if(!device.ios()){
//                                     $this.focus();
//                                     onFocus = false;
//                                 }
//                             }
//                         } else {
//                             $this.closest('.form-input').removeClass('show-error');
//                             $this.closest('.form-input').find('.form-item-error').slideUp(200);
//                         }
//                     }
//                 }
//             });
//
//             setTimeout(function(){
//                 $.fancybox.update();
//             },300);
//
//             return noError;
//         }
//     },
//     'sliderSwiper': function () {
//         if($('.js-main-slider').length> 0){
//             console.log('swiper');
//
//             var configMain = {
//                     slidesPerView: 1,
//                     centeredSlides: false,
//                     paginationClickable: true,
//                     spaceBetween: 0,
//                     pagination: '.swiper-pagination',
//                     onSlideChangeStart: function(){
//                     }
//                 },
//                 $mainSlider = $('.js-main-slider');
//
//             if($('.js-main-slider .swiper-slide').length > 1){
//                 var $mainSwiper = $mainSlider.swiper(configMain);
//             }
//         }
//
//         if($('.js-quote-slider').length > 0){
//             var configQuote = {
//                     slidesPerView: 1,
//                     centeredSlides: false,
//                     paginationClickable: true,
//                     spaceBetween: 0,
//                     pagination: '.swiper-pagination',
//                     onSlideChangeStart: function(){
//                     }
//                 },
//                 $quoteSlider = $('.js-quote-slider');
//
//             if($('.js-main-slider .swiper-slide').length > 1){
//                 var $quoteSwiper = $quoteSlider.swiper(configQuote);
//             }
//         }
//
//     },
// };
//
// $(document).ready(function () {
//     moduleApp.init();
// });



var $window, $document, $html;

var pageApp = {
    'init': function(){
        var $thisApp = $('#app');
        var curApp = $thisApp.attr('data-app');
        this.globalPollifil();
        if (pageApp[curApp]) { pageApp[curApp]($thisApp); }
    },
    'page-address':function($thisApp){
        var $mapPlace = $thisApp.find('[data-target="ymap"]');
        ymaps.ready(function() {

            var mapLat = 55.751244;
            var mapLng = 37.618423;
            var mapZoom = 16;

            var map = new ymaps.Map($mapPlace[0], {
                center: [mapLat, mapLng],
                zoom: mapZoom,
                type: 'yandex#publicMap',
                controls: [],
                behaviors: ['drag', 'dblClickZoom']
            });

            map.controls.add(
                new ymaps.control.ZoomControl(),
                {
                    float: "none",
                    position: {
                        top: 30,
                        right: 30
                    }
                }
            );

            var marker = new ymaps.Placemark(map.getCenter(), {

            }, {
                iconLayout: 'default#image',
                iconImageHref: '/assets/img/map-pin.png',
                iconImageSize: [50,64],
                hideIconOnBalloonOpen: false
            });



            map.geoObjects.add(marker);


        });
    },
    'globalPollifil': function(){
        if (!('classList' in document.documentElement) && Object.defineProperty && typeof HTMLElement !== 'undefined') {
            Object.defineProperty(HTMLElement.prototype, 'classList', {
                get: function() {
                    var self = this;

                    function update(fn) {
                        return function(value) {
                            var classes = self.className.split(/\s+/);
                            var index = classes.indexOf(value);

                            fn(classes, index, value);
                            self.className = classes.join(' ');
                        };
                    }

                    var ret = {
                        add: update(function(classes, index, value) {
                            ~index || classes.push(value);
                        }),

                        remove: update(function(classes, index) {
                            ~index && classes.splice(index, 1);
                        }),

                        toggle: update(function(classes, index, value) {
                            ~index ? classes.splice(index, 1) : classes.push(value);
                        }),

                        contains: function(value) {
                            return !!~self.className.split(/\s+/).indexOf(value);
                        },

                        item: function(i) {
                            return self.className.split(/\s+/)[i] || null;
                        }
                    };

                    Object.defineProperty(ret, 'length', {
                        get: function() {
                            return self.className.split(/\s+/).length;
                        }
                    });

                    return ret;
                }
            });
        }

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
};

var moduleApp = {
    'init': function () {
        this.executeModules();
        this.executeSFX();
        this.globalActions();
        this.toolsGlobalSubscribe();
        this.pageLoader();
        this.startupMessage();
        this.scrollHeader();

    },
    'executeModules':function(){
        $('[data-is]').each(function(i,thisModule){
            var $thisModule = $(thisModule);
            var thisModuleName = $thisModule.attr('data-is');
            if(moduleApp[thisModuleName]) { moduleApp[thisModuleName]($thisModule); }
        });
    },
    'executeSFX':function(){
        if (appConfig.mobileVersion || device.tablet()) { return false; }
        $('[data-sfx]').each(function(i,thisModule){
            var $thisModule = $(thisModule);
            var thisModuleName = $thisModule.attr('data-sfx');
            if(moduleApp.SFXModules[thisModuleName]) { moduleApp.SFXModules[thisModuleName]($thisModule); }
        });
    },
    'globalActions':function(){

        // fancybox close
        $document.on('click','.js-fancy-close',function(e){
            e.preventDefault();
            $.fancybox.close();
        });


        // feedback form
        $('[data-gclick="feedbackForm"]').on('click',function(e){
            e.preventDefault();
            var template = $('#fb-feedback-form').html();
            $.fancybox.open({
                wrapCSS : 'fb-fancy-default',
                content: template,
                padding: 0,
                autoScale: false,
                fitToView: false,
                openEffect  : 'drop',
                closeEffect: 'drop',
                nextEffect: 'fade',
                prevEffect : 'fade',
                openSpeed: 300,
                closeSpeed: 300,
                nextSpeed: 300,
                prevSpeed: 300,
                beforeShow:function(){
                    var $thisFancy = $('.fancybox-inner');

                    var $thisChosen = $thisFancy.find('[data-is="chosen"]');
                    moduleApp.chosen($thisChosen);

                    var $cityTarget = $thisFancy.find('.js-fb-city-target');

                    $thisFancy.find('.js-fb-city-action').on('change',function(){
                        var action = !!($(this).find('option:selected').attr('data-city'));
                        if (action) {
                            $cityTarget.slideDown(200, function(){
                                if (!$cityTarget.hasClass('state-inited')) {
                                    $cityTarget.addClass('state-inited');
                                    $cityTarget.find('select').chosen({
                                        no_results_text: "Нет результатов"
                                    });
                                }
                            });
                        }
                        else {
                            $cityTarget.slideUp(200);
                        }
                    });


                    var $thisSubmit = $thisFancy.find('.js-fb-submit');
                    moduleApp.formValidation($thisSubmit);



                }
            });
        });


        // find filial form
        $('[data-gclick="findFilialForm"]').on('click',function(e){
            e.preventDefault();
            var template = $('#fb-filial-form').html();

            $.fancybox.open({
                wrapCSS : 'fb-fancy-default',
                content: template,
                padding: 0,
                autoScale: false,
                fitToView: false,
                openEffect  : 'drop',
                closeEffect: 'drop',
                nextEffect: 'fade',
                prevEffect : 'fade',
                openSpeed: 300,
                closeSpeed: 300,
                nextSpeed: 300,
                prevSpeed: 300,
                beforeShow:function(){
                    var $thisFancy = $('.fancybox-inner');

                    var $thisChosen = $thisFancy.find('[data-is="chosen"]');
                    moduleApp.chosen($thisChosen);

                    var $thisSubmit = $thisFancy.find('.js-fb-submit');
                    moduleApp.formValidation($thisSubmit, function($form){
                        var template = '';

                        $form.find('.js-fb-prod-type').each(function(i,thisSelect){
                            var $thisSelect = $(thisSelect);

                            var thisSelectedArray = $thisSelect.val() || [];
                            if (thisSelectedArray.length === 0) { return true; }

                            template += $.trim($thisSelect.closest('.is-form-select').find('.form-item-label').html()) + ':';

                            $.each(thisSelectedArray, function(i,thisType){

                                if (i===0) {
                                    template += ' ' + thisType;
                                } else {
                                    template += ', ' + thisType;
                                }

                            });

                            template += '\n\r';
                        });

                        $('.js-fb-prod-area').html(template);
                        $form.submit();
                    });
                }
            });
        });
    },
    'toolsGlobalSubscribe':function($thisModule){
        $document.on('click','.ts-submit',function(e){
            e.preventDefault();
            var $this = $(this);
            var $parent =  $this.closest('.is-tools-subscribe');
            var $thisInput = $parent.find('.ts-input');
            var regexEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;


            if (regexEmail.test($thisInput.val()) && $thisInput.val().length > 0) {
                $parent.find('.ts-form').submit();
            } else {
                $thisInput.addClass('state-bounce');
                setTimeout(function(){
                    $thisInput.removeClass('state-bounce').focus();
                }, 400);
            }

        });
    },
    'pageLoader': function(){
        $document.on('click','a',function(){
            var $this = $(this);
            var noProgress = false;

            var href = $this.attr('href');
            var targetBlank = $this.attr('target') || false;
            var inSwiper = $this.closest('.swiper-container').length;
            var downloadAttr = $this.attr('download');
            if (typeof downloadAttr !== typeof undefined && downloadAttr !== false) {
                noProgress = true;
            }

            if (
                !href ||
                href.indexOf('mailto') > -1 ||
                href.indexOf('#') > -1 ||
                href.indexOf('javascript') > -1 ||
                href.indexOf('tel') > -1 ||
                $this.hasClass('no-preloader') ||
                $this.hasClass('js-fancy-image') ||
                href.length === 0 ||
                href === 'undefined' ||
                targetBlank ||
                inSwiper
            ) { noProgress = true; }

            if (noProgress) {
                return true;
            } else {
                $("#body").removeClass('jsfx-loaded');
                return true;
            }
        });

        $("#body").addClass('jsfx-loaded');
    },
    'startupMessage':function(){
        if (appConfig.startupMessage.title && appConfig.startupMessage.message) {
            var template = '<div class="fb-modal-default">';
            template += '<div class="fbp-title">'+appConfig.startupMessage.title+'</div>';
            template += '<div class="fbp-message">'+appConfig.startupMessage.message+'</div>';
            template += '<div class="cntr"><a href="#" class="is-button-a js-fancy-close"><span>Ок</span></a></div>';
            template += '</div>';

            $.fancybox.open({
                wrapCSS : 'fb-fancy-default fb-fancy-no-close',
                content: template,
                padding: 0,
                autoScale: false,
                fitToView: false,
                openEffect  : 'drop',
                closeEffect: 'drop',
                nextEffect: 'fade',
                prevEffect : 'fade',
                openSpeed: 300,
                closeSpeed: 300,
                nextSpeed: 300,
                prevSpeed: 300
            });
        }
    },
    'scrollHeader': function(){
        $window.bind('scroll',function(){
            if($window.scrollTop() > 30){
                $('.wrapper-header').addClass('up-header');
            }
            else{
                $('.wrapper-header').removeClass('up-header');
            }

            if($window.scrollTop() > 200){
                $('.wrapper-header').addClass('small-header');
            }
            else{
                $('.wrapper-header').removeClass('small-header');
            }
        });
    },
    'SFXModules':{
        'sfx-a':function($thisModule){
            var gfxFromLeft = {
                'data-when':'enter',
                'data-from':'.8',
                'data-to':'0',
                'data-translatex':'-40'
            };

            var gfxFromRight = {
                'data-when':'enter',
                'data-from':'.8',
                'data-to':'0',
                'data-translatex':'40'
            };

            $thisModule.find('.lt-column-left .lt-tile').addClass('scrollme animateme').attr(gfxFromLeft);
            $thisModule.find('.lt-column-right .lt-tile').addClass('scrollme animateme').attr(gfxFromRight);
        },
        'sfx-b':function($thisModule){
            var gfxFromLeft = {
                'data-when':'enter',
                'data-from':'.8',
                'data-to':'0',
                'data-translatex':'-40'
            };

            var gfxFormRight = {
                'data-when':'enter',
                'data-from':'.8',
                'data-to':'0',
                'data-translatex':'40'
            };

            $thisModule.find('.lt-row:even').find('.lt-row-content-inner').addClass('scrollme animateme').attr(gfxFromLeft);
            $thisModule.find('.lt-row:even').find('.lt-row-image').addClass('scrollme animateme').attr(gfxFormRight);
            $thisModule.find('.lt-row:odd').find('.lt-row-content-inner').addClass('scrollme animateme').attr(gfxFormRight);
            $thisModule.find('.lt-row:odd').find('.lt-row-image').addClass('scrollme animateme').attr(gfxFromLeft);
        },
        'sfx-c':function($thisModule){
            var gfxFromRight = {
                'data-when':'enter',
                'data-from':'.8',
                'data-to':'0',
                'data-translatex':'40'
            };

            $thisModule.addClass('scrollme animateme').attr(gfxFromRight);
        },
        'sfx-d':function($thisModule){
            return false;
            var gfxFromLeft = {
                'data-when':'enter',
                'data-from':'.8',
                'data-to':'0',
                'data-translatex':'-40'
            };

            var gfxFormRight = {
                'data-when':'enter',
                'data-from':'.8',
                'data-to':'0',
                'data-translatex':'40'
            };

            $thisModule.find('.lt-row:even').find('.lt-row-content-inner').addClass('scrollme animateme').attr(gfxFromLeft);
            $thisModule.find('.lt-row:even').find('.lt-row-image').addClass('scrollme animateme').attr(gfxFormRight);
            $thisModule.find('.lt-row:odd').find('.lt-row-content-inner').addClass('scrollme animateme').attr(gfxFormRight);
            $thisModule.find('.lt-row:odd').find('.lt-row-image').addClass('scrollme animateme').attr(gfxFromLeft);
        },
        'sfx-e':function($thisModule){

            var gfxFromLeft = {
                'data-when':'enter',
                'data-from':'.8',
                'data-to':'0',
                'data-opacity':'0'
            };
            $thisModule.find('.hc-year-box').addClass('scrollme animateme').attr(gfxFromLeft);
        }
    },
    'formValidation': function ($submitBtn, submitFunction) {

        var params = {
            'formValidationAttr':'data-validation',
            'formInputClass':'is-form-text',
            'formCheckboxClass':'is-form-checkbox',
            'formShowErrorClass':'form-show-error',
            'submitDisabledClass':'state-disabled',
            'submitProgressClass':'state-progress'
        };

        $submitBtn = $submitBtn || $('.js-form-submit');
        submitFunction = submitFunction || false;
        $submitBtn.closest('form').addClass('is-form-validation');
        $submitBtn.click(function(e){
            e.preventDefault();
            var $this = $(this);
            if ($this.hasClass(params.submitDisabledClass) || $this.hasClass(params.submitProgressClass)) {
                return false;
            }
            var $form = $this.closest('form');
            var $forms = $form.find('['+params.formValidationAttr+']');
            var result = formChecking($forms, true);
            if (result) {
                if (submitFunction) {
                    submitFunction($form);
                } else {
                    $this.addClass(params.submitProgressClass);
                    $form.submit();
                }
            } else {
                $forms.on('keyup keypress change', function(){
                    var $current = $(this);
                    setTimeout(function(){ formChecking($current); }, 50);
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

                var mask = $this.attr(params.formValidationAttr);
                var value = $this.val();
                var placeHolder = $this.attr('placeholder');
                var regex;
                var subError = true;

                if (mask == 'text') {
                    if ((value.length < 1) || (value == placeHolder)) {
                        noError = false;
                        $this.closest('.'+params.formInputClass).addClass(params.formShowErrorClass);
                        if (onFocus) {
                            $this.focus();
                            onFocus = false;
                        }
                    } else {
                        $this.closest('.'+params.formInputClass).removeClass(params.formShowErrorClass);
                    }
                }

                if (mask == 'text-visible') {
                    if ($this.is(':visible') && ((value.length < 1) || (value == placeHolder))) {
                        noError = false;
                        $this.closest('.'+params.formInputClass).addClass(params.formShowErrorClass);
                        if (onFocus) {
                            $this.focus();
                            onFocus = false;
                        }
                    } else {
                        $this.closest('.'+params.formInputClass).removeClass(params.formShowErrorClass);
                    }
                }

                if (mask == 'email') {
                    regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                    if (!regex.test(value) || (value == placeHolder)) {
                        noError = false;
                        $this.closest('.'+params.formInputClass).addClass(params.formShowErrorClass);
                        if (onFocus) {
                            $this.focus();
                            onFocus = false;
                        }
                    } else {
                        $this.closest('.'+params.formInputClass).removeClass(params.formShowErrorClass);
                    }
                }

                if (mask == 'email-visible') {
                    regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                    if ($this.is(':visible') && (!regex.test(value) || (value == placeHolder))) {
                        noError = false;
                        $this.closest('.'+params.formInputClass).addClass(params.formShowErrorClass);
                        if (onFocus) {
                            $this.focus();
                            onFocus = false;
                        }
                    } else {
                        $this.closest('.'+params.formInputClass).removeClass(params.formShowErrorClass);
                    }
                }

                if (mask == 'opt-email') {
                    regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                    if(value != ''){
                        if (!regex.test(value) || (value == placeHolder)) {
                            noError = false;
                            $this.closest('.'+params.formInputClass).addClass(params.formShowErrorClass);
                            if (onFocus) {
                                $this.focus();
                                onFocus = false;
                            }
                        } else {
                            $this.closest('.'+params.formInputClass).removeClass(params.formShowErrorClass);
                        }
                    } else {
                        $this.closest('.'+params.formInputClass).removeClass(params.formShowErrorClass);
                    }
                }

                if (mask == 'file') {
                    var parts = $(this).val().split('.');
                    if (parts==""){
                        noError = false;
                        $this.closest('.'+params.formInputClass).addClass(params.formShowErrorClass);
                        if (onFocus) {
                            $this.focus();
                            onFocus = false;
                        }
                    }
                    else {
                        $this.closest('.'+params.formInputClass).removeClass(params.formShowErrorClass);
                    }
                }

                if (mask == 'checkbox') {
                    if ($this.is(':visible') && (!$this.is(':checked'))) {
                        noError = false;
                        $this.closest('.'+params.formCheckboxClass).addClass(params.formShowErrorClass);
                    } else {
                        $this.closest('.'+params.formCheckboxClass).removeClass(params.formShowErrorClass);
                    }
                }

                if (mask == 'vacancy-file-link') {

                    var $thisGroup = $('['+params.formValidationAttr+'="vacancy-file-link"]:visible');

                    if ($thisGroup.length === 0) { return true; }

                    $thisGroup.each(function(i,e){
                        if ($(e).val().length > 0) { subError = false; }
                    });

                    if (subError) {
                        noError = false;
                        $thisGroup.closest('.'+params.formInputClass).addClass(params.formShowErrorClass);
                    } else {
                        $thisGroup.closest('.'+params.formInputClass).removeClass(params.formShowErrorClass);
                    }

                }

            });

            return noError;
        }


        // add mask

        $submitBtn.closest('form').find('[data-mask]').each(function(i,thisForm){
            var $thisForm = $(thisForm);
            var thisMask = $thisForm.attr('data-mask');
            if (thisMask=="phone") { $thisForm.addClass('state-with-mask').mask("+7 (999) 999 99 99", {placeholder:"–"}); }
        });
    },
    'main-slider': function($thisModule){
        var configMain = {
                slidesPerView: 1,
                centeredSlides: false,
                spaceBetween: 0,
                'nextButton': $thisModule.find('.is-slider-swiper-next')[0],
                'prevButton': $thisModule.find('.is-slider-swiper-prev')[0]
        };

        $thisModule.find('.swiper-container').swiper(configMain);
    },
    'quote-slider': function($thisModule){
        var configQuote = {
                slidesPerView: 1,
                centeredSlides: false,
                paginationClickable: true,
                spaceBetween: 0,
                pagination: '.swiper-pagination',
                'nextButton': $thisModule.find('.is-slider-swiper-next')[0],
                'prevButton': $thisModule.find('.is-slider-swiper-prev')[0]
            };
        $thisModule.find('.swiper-container').swiper(configQuote);
        // if($('.js-main-slider .swiper-slide').length > 1){
        //     var $quoteSwiper = $quoteSlider.swiper(configQuote);
        // }
    },
    'down-window': function ($thisModule) {
        $thisModule.on('click',function(e){
            e.preventDefault();
            var heightScroll = $window.height();
            $('html,body').animate({'scrollTop': heightScroll}, 500);
        });
    }
};


$(document).ready(function(){
    // init globals
    $window = $(window);
    $document = $(document);
    $html = $('html');

    pageApp.init();
    moduleApp.init();

});







