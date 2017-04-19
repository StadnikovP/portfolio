<!DOCTYPE html>
<!--[if lt IE 7]>
<html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>
<html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>
<html class="no-js lt-ie9"> <![endif]-->
<!--[if IE 9]>
<html class="no-js ie9"> <![endif]-->
<!--[if gt IE 9]><!-->
<html class="no-js"> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Главная</title>
        <meta name="description" content="">
        <meta name="viewport" id="viewport" content="width=device-width">
        <script>
            var appConfig = {
                'mobileVersion':false,
                'desktopVersion':true,
                'startupMessage':{
                    'title':false,
                    'message':false
                }
            };

            (function () {var a, b, c, d, e, f, g, h, i, j;a = window.device, window.device = {}, c = window.document.documentElement, j = window.navigator.userAgent.toLowerCase(), device.ios = function () {return device.iphone() || device.ipod() || device.ipad()}, device.iphone = function () {return d("iphone")}, device.ipod = function () {return d("ipod")}, device.ipad = function () {return d("ipad")}, device.android = function () {return d("android")}, device.androidPhone = function () {return device.android() && d("mobile")}, device.androidTablet = function () {return device.android() && !d("mobile")}, device.blackberry = function () {return d("blackberry") || d("bb10") || d("rim")}, device.blackberryPhone = function () {return device.blackberry() && !d("tablet")}, device.blackberryTablet = function () {return device.blackberry() && d("tablet")}, device.windows = function () {return d("windows")}, device.windowsPhone = function () {return device.windows() && d("phone")}, device.windowsTablet = function () {return device.windows() && d("touch") && !device.windowsPhone()}, device.fxos = function () {return (d("(mobile;") || d("(tablet;")) && d("; rv:")}, device.fxosPhone = function () {return device.fxos() && d("mobile")}, device.fxosTablet = function () {return device.fxos() && d("tablet")}, device.meego = function () {return d("meego")}, device.cordova = function () {return window.cordova && "file:" === location.protocol}, device.nodeWebkit = function () {return "object" == typeof window.process}, device.mobile = function () {return device.androidPhone() || device.iphone() || device.ipod() || device.windowsPhone() || device.blackberryPhone() || device.fxosPhone() || device.meego()}, device.tablet = function () {return device.ipad() || device.androidTablet() || device.blackberryTablet() || device.windowsTablet() || device.fxosTablet()}, device.desktop = function () {return !device.tablet() && !device.mobile()}, device.portrait = function () {return window.innerHeight / window.innerWidth > 1}, device.landscape = function () {return window.innerHeight / window.innerWidth < 1}, device.noConflict = function () {return window.device = a, this}, d = function (a) {return -1 !== j.indexOf(a)}, f = function (a) {var b;return b = new RegExp(a, "i"), c.className.match(b)}, b = function (a) {return f(a) ? void 0 : c.className += " " + a}, h = function (a) {return f(a) ? c.className = c.className.replace(a, "") : void 0}, device.ios() ? device.ipad() ? b("ios ipad tablet") : device.iphone() ? b("ios iphone mobile") : device.ipod() && b("ios ipod mobile") : b(device.android() ? device.androidTablet() ? "android tablet" : "android mobile" : device.blackberry() ? device.blackberryTablet() ? "blackberry tablet" : "blackberry mobile" : device.windows() ? device.windowsTablet() ? "windows tablet" : device.windowsPhone() ? "windows mobile" : "desktop" : device.fxos() ? device.fxosTablet() ? "fxos tablet" : "fxos mobile" : device.meego() ? "meego mobile" : device.nodeWebkit() ? "node-webkit" : "desktop"), device.cordova() && b("cordova"), e = function () {return device.landscape() ? (h("portrait"), b("landscape")) : (h("landscape"), b("portrait"))}, i = "onorientationchange" in window, g = i ? "orientationchange" : "resize", window.addEventListener ? window.addEventListener(g, e, !1) : window.attachEvent ? window.attachEvent(g, e) : window[g] = e, e()}).call(this);

            (function(a,d,vp){
                var w=screen.width,h=screen.height;
                if (w<a || h<a || device.mobile()) {
                    appConfig.mobileVersion = true;
                } else {
                    document.getElementById(vp).setAttribute('content','width='+d);
                }
                appConfig.desktopVersion = !appConfig.mobileVersion;
            })(737,940,'viewport');
        </script>
<!--        <script src="http://api-maps.yandex.ru/2.1/?lang=ru-RU&load=package.full" type="text/javascript"></script>-->
        <link rel="stylesheet" href="/dist/main.css" type="text/css">
        <link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet">
<!--        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">-->
    </head>

    <body class="page-<?=$page?>" data-page="<?=$page?>">
        <div class="site-body">
            <div class="wrapper-header">

                <div class="address-line-top">
                    <div class="main-wrapper">
                        <div class="address">New Scotland Yard, 8-10 Broadway, Westminster, London SW1H 0BG</div>
                        <div class="social-list">
                            <a class="social-link-header icon-f" href="#"></a>
                            <a class="social-link-header icon-i" href="#"></a>
                            <a class="social-link-header icon-t" href="#"></a>
                        </div>
                    </div>
                </div>

                <header class="site-header">
                    <div class="main-wrapper">
                        <div class="logo"><img src="/dist/img/logo.png" alt=""></div>

                        <nav class="main-menu">
                            <a class="main-menu-link" href="#">HOME</a>
                            <a class="main-menu-link" href="#">RESERVATIONS</a>
                            <a class="main-menu-link" href="#">MENU</a>
                            <a class="main-menu-link" href="#">BLOG</a>
                            <a class="main-menu-link" href="#">FEATURES</a>
                            <a class="main-menu-link" href="#">CONTACT</a>
                            <div class="last-element-menu"></div>
                        </nav>
                    </div>
                </header>
            </div>

            <div class="first-window">
                <div class="center-content">
                    <div class="title">Welcome to</div>
                    <div class="name">Steakville Restaurant</div>
                    <div class="address">New Scotland Yard, 8-10 Broadway, Westminster, London SW1H 0BG</div>
                    <div class="arrow"><img src="/dist/img/row.png" alt=""></div>
                    <a href="#" class="btn-default">menu</a>
                </div>
                <div class="element-down"><img src="/dist/img/down.png" alt=""></div>
            </div>





