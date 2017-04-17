/*!
 * fancyBox - jQuery Plugin
 * version: 3.0.0 Beta 1 (Tue, 29 Jan 2013)
 * @requires jQuery v1.7 or later
 *
 * Examples at http://fancyapps.com/fancybox/
 * License: www.fancyapps.com/fancybox/#license
 *
 * Copyright 2013 Janis Skarnelis - janis@fancyapps.com
 *
 */

(function (window, document, $, undefined) {
	"use strict";

	var W  = $(window),
		D  = $(document),
		H  = $('html');

	var F = $.fancybox = function () {
		F.open.apply( this, arguments );
	};

	var isTouch = F.isTouch = (document.createTouch !== undefined || window.ontouchstart !== undefined);

	var isQuery = function(object) {
		return object && object.hasOwnProperty && object instanceof $;
	};

	var isString = function(str) {
		return str && $.type(str) === "string";
	};

	var isPercentage = function(str) {
		return isString(str) && str.indexOf('%') > 0;
	};

	var getScalar = function(orig, dim) {
		var value = parseFloat(orig, 10) || 0;

		if (dim && isPercentage(orig)) {
			value = F.getViewport()[ dim ] / 100 * value;
		}

		return Math.ceil(value);
	};

	var getValue = function(value, dim) {
		return getScalar(value, dim) + 'px';
	};

	var getTime = Date.now || function() {
		return +new Date;
	};

	var removeWrap = function(what) {
		var el = isString(what) ? $(what) : what;

		if (el && el.length) {
			el.removeClass('fancybox-wrap').stop(true).trigger('onReset').hide().unbind();

			try {
				el.find('iframe').unbind().attr('src', isTouch ? '' : '//about:blank');

				// Give the document in the iframe to get a chance to unload properly before remove
				setTimeout(function () {
					el.empty().remove();

					// Remove the lock if there are no elements
					if (F.lock && !F.coming && !F.current) {
						var scrollV, scrollH;

						$('.fancybox-margin').removeClass('fancybox-margin');

						scrollV = W.scrollTop();
						scrollH = W.scrollLeft();

						H.removeClass('fancybox-lock');

						F.lock.remove();

						F.lock = null;

						W.scrollTop( scrollV ).scrollLeft( scrollH );
					}
				}, 150);

			} catch(e) {}
		}
	};

	$.extend(F, {
		// The current version of fancyBox
		version: '3.0.0',

		defaults: {
			theme     : 'default',          // 'default', dark', 'light'
			padding   : 15,					// space inside box, around content
			margin    : [30, 55, 30, 55],	// space between viewport and the box
			loop      : true,               // Continuous gallery item loop

			arrows    : true,
			closeBtn  : true,
			expander  : !isTouch,

			caption : {
				type     : 'outside'	// 'float', 'inside', 'outside' or 'over',
			},

			overlay : {
				closeClick : true,      // if true, fancyBox will be closed when user clicks on the overlay
				speedIn    : 0,         // duration of fadeIn animation
				speedOut   : 250,       // duration of fadeOut animation
				showEarly  : true,      // indicates if should be opened immediately or wait until the content is ready
				css        : {}			// custom CSS properties
			},

			helpers : {},				// list of enabled helpers

			// Dimensions
			width       : 800,
			height      : 450,
			minWidth    : 100,
			minHeight   : 100,
			maxWidth    : 99999,
			maxHeight   : 99999,
			aspectRatio : false,
			fitToView   : true,

			autoHeight  : true,
			autoWidth   : true,
			autoResize  : true,

			// Location
			autoCenter  : !isTouch,
			topRatio    : 0.5,
			leftRatio   : 0.5,

			// Opening animation
			openEffect  : 'elastic',		// 'elastic', 'fade', 'drop' or 'none'
			openSpeed   : 350,
			openEasing  : 'easeOutQuad',

			// Closing animation
			closeEffect : 'elastic',		// 'elastic', 'fade', 'drop' or 'none'
			closeSpeed  : 350,
			closeEasing : 'easeOutQuad',

			// Animation for next gallery item
			nextEffect : 'elastic',		// 'elastic', 'fade', 'drop' or 'none'
			nextSpeed  : 350,
			nextEasing : 'easeOutQuad',

			// Animation for previous gallery item
			prevEffect : 'elastic',		// 'elastic', 'fade', 'drop' or 'none'
			prevSpeed  : 350,
			prevEasing : 'easeOutQuad',

			// Slideshow
			autoPlay   : false,
			playSpeed  : 3000,

			/*
				Advanced
			*/

			// Callbacks
			onCancel     : $.noop, // If canceling
			beforeLoad   : $.noop, // Before loading
			afterLoad    : $.noop, // After loading
			beforeShow   : $.noop, // Before changing in current item
			afterShow    : $.noop, // After opening
			beforeClose  : $.noop, // Before closing
			afterClose   : $.noop,  // After closing

			// Properties specific to content type
			ajax  : {
				dataType : 'html',
				headers  : { 'X-fancyBox': true }
			},

			iframe : {
				scrolling : 'auto',
				preload   : true
			},

			swf : {
				wmode             : 'transparent',
				allowfullscreen   : 'true',
				allowscriptaccess : 'always'
			},

			// Default keyboard
			keys  : {
				next : {
					13 : 'left', // enter
					34 : 'up',   // page down
					39 : 'left', // right arrow
					40 : 'up'    // down arrow
				},
				prev : {
					8  : 'right',  // backspace
					33 : 'down',   // page up
					37 : 'right',  // left arrow
					38 : 'down'    // up arrow
				},
				close  : [27], // escape key
				play   : [32], // space - start/stop slideshow
				toggle : [70]  // letter "f" - toggle fullscreen
			},

			// Default direction
			direction : {
				next : 'left',
				prev : 'right'
			},

			// HTML templates
			tpl: {
				wrap     : '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-inner"></div></div>',
				iframe   : '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen allowtransparency="true"></iframe>',
				error    : '<p class="fancybox-error">{{ERROR}}</p>',
				closeBtn : '<a title="{{CLOSE}}" class="fancybox-close" href="javascript:;"></a>',
				next     : '<a title="{{NEXT}}" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
				prev     : '<a title="{{PREV}}" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'
			},

			// Localization
			locale  : 'en',
			locales : {
				'en' : {
					CLOSE      : 'Close',
					NEXT       : 'Next',
					PREV       : 'Previous',
					ERROR      : 'The requested content cannot be loaded. <br/> Please try again later.',
					EXPAND     : 'Display actual size',
					SHRINK     : 'Fit to the viewport',
					PLAY_START : 'Start slideshow',
					PLAY_STOP  : 'Pause slideshow'
				},
				'de' : {
					CLOSE      : 'Schliessen',
					NEXT       : 'Vorwärts',
					PREV       : 'Zurück',
					ERROR      : 'Die angeforderten Daten konnten nicht geladen werden. <br/> Bitte versuchen Sie es später nochmal.',
					EXPAND     : '',
					SHRINK     : '',
					PLAY_START : '',
					PLAY_STOP  : ''
				}
			},

			// Override some properties
			index     : 0,
			content   : null,
			href      : null,

			// Various
			wrapCSS       : '',         // CSS class name for the box
			modal         : false,
			locked        : true,
			preload       : 3,			// Number of gallery images to preload
			mouseWheel    : true,		// Enable or disable mousewheel support
			scrolling     : 'auto',     // 'yes', 'no', any valid value for CSS "overflow" property
			scrollOutside : true		// If trye, fancyBox will try to set scrollbars outside the content
		},

		// Current state
		current  : null,
		coming   : null,
		group    : [],
		index    : 0,
		isActive : false,	// Is activated
		isOpen   : false,	// Is currently open
		isOpened : false,	// Have been fully opened at least once
		isMaximized : false,

		player : {
			timer    : null,
			isActive : false
		},

		// Loaders
		ajaxLoad   : null,
		imgPreload : null,

		// Object containing all helpers
		helpers    : {},

		// Open fancyBox
		open: function( items, options ) {
			if (!items) {
				return;
			}

			// Close if already active
			if (false === F.close(true)) {
				return;
			}

			if (!$.isPlainObject( options )) {
				options = {};
			}

			F.opts = $.extend(true, {}, F.defaults, options);

			F.populate( items );

			if (F.group.length) {
				F._start( F.opts.index );
			}
		},

		// Add new items to the group
		populate : function( items ) {
			var group = [];

			if ( !$.isArray( items )) {
				items = [ items ];
			}

			// Build group array, each item is object containing element
			// and most important attributes - href, title and type
			$.each(items, function(i, element) {
				var defaults = $.extend(true, {}, F.opts),
					item,
					obj,
					type,
					margin,
					padding;

				if ($.isPlainObject(element)) {
					item = element;

				} else if (isString(element)) {
					item = { href : element };

				} else if (isQuery(element) || $.type(element) === 'object' && element.nodeType) {
					obj  = $(element);
					item = $(obj).get(0);

					if (!item.href) {
						item = { href : element };
					}

					item = $.extend({
						href    : obj.data('fancybox-href')  || obj.attr('href')  || item.href,
						title   : obj.data('fancybox-title') || obj.attr('title') || item.title,
						type    : obj.data('fancybox-type'),
						element : obj
					}, obj.data('fancybox-options') );

				} else {
					return;
				}

				// If the type has not specified, then try to guess
				if (!item.type && (item.content || item.href)) {
					item.type = item.content ? "html" : F.guessType( obj, item.href );
				}

				// Adjust some defaults depending on content type
				type = item.type || F.opts.type;

				if (type === 'image' || type === 'swf') {
					defaults.autoWidth = defaults.autoHeight = false;
					defaults.scrolling = 'visible';
				}

				if (type === 'image') {
					defaults.aspectRatio = true;
				}

				if (type === 'iframe') {
					defaults.autoWidth = false;
					defaults.scrolling = isTouch ? 'scroll' : 'visible';
				}

				if (items.length < 2) {
					defaults.margin = 30;
				}

				item = $.extend(true, {}, defaults, item);

				// Recheck some parameters
				margin  = item.margin;
				padding = item.padding;

				// Convert margin and padding properties to array - top, right, bottom, left
				if ($.type(margin) === 'number') {
					item.margin = [margin, margin, margin, margin];
				}

				if ($.type(padding) === 'number') {
					item.padding = [padding, padding, padding, padding];
				}

				// 'modal' propery is just a shortcut
				if (item.modal) {
					$.extend(true, item, {
						closeBtn   : false,
						closeClick : false,
						nextClick  : false,
						arrows     : false,
						mouseWheel : false,
						keys       : null,
						overlay : {
							closeClick : false
						}
					});
				}

				if (item.autoSize !== undefined) {
					item.autoWidth = item.autoHeight = !!item.autoSize;
				}

				if (item.width === 'auto') {
					item.autoWidth = true;
				}

				if (item.height === 'auto') {
					item.autoHeight = true;
				}

				group.push( item );
			});

			F.group = F.group.concat( group );
		},

		// Cancel image loading and abort ajax request
		cancel: function () {
			var coming = F.coming;

			if (!coming || false === F.trigger('onCancel')) {
				return;
			}

			F.hideLoading();

			if (F.ajaxLoad) {
				F.ajaxLoad.abort();
			}

			if (F.imgPreload) {
				F.imgPreload.onload = F.imgPreload.onerror = null;
			}

			if (coming.wrap) {
				removeWrap( coming.wrap );
			}

			F.ajaxLoad = F.imgPreload = F.coming = null;

			// If the first item has been canceled, then clear everything
			if (!F.current) {
				F._afterZoomOut( coming );
			}
		},

		// Start closing or remove immediately if is opening/closing
		close: function (e) {
			if (e && $.type(e) === 'object') {
				e.preventDefault();
			}

			F.cancel();

			// Do not close if:
			//   - the script has not been activated
			//   - cancel event has triggered opening a new item
			//   - "beforeClose" trigger has returned false
			if (!F.isActive || F.coming || false === F.trigger('beforeClose')) {
				return;
			}

			F.unbind();

			F.isClosing = true;

			if (F.lock) {
				F.lock.css('overflow', 'hidden');
			}

			if (!F.isOpen || e === true) {
				F._afterZoomOut();

			} else {
				F.isOpen = F.isOpened = false;

				F.transitions.close();
			}
		},

		prev : function( direction ) {
			var current = F.current;

			if (current) {
				F.jumpto( current.index - 1, (isString(direction) ? direction : current.direction.prev) );
			}
		},

		next : function( direction ) {
			var current = F.current;

			if (current) {
				F.jumpto( current.index + 1, (isString(direction) ? direction : current.direction.next) );
			}
		},

		jumpto : function( index, direction ) {
			var current = F.current;

			if (!(F.coming && F.coming.index === index)) {
				F.cancel();

				if (current.index == index) {
					direction = null;

				} else if (!direction) {
					direction = current.direction[ index > current.index ? 'next' : 'prev' ];
				}

				F.direction = direction;

				F._start( index );
			}
		}
	});

	$.extend(F, {
		guessType : function(item, href) {
			var rez  = item && item.prop('class') ? item.prop('class').match(/fancybox\.(\w+)/) : 0,
				type = false;

			if (rez) {
				return rez[1];
			}

			if (isString(href)) {
				if (href.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp)((\?|#).*)?$)/i)) {
					type = 'image';

				} else if (href.match(/\.(swf)((\?|#).*)?$/i)) {
					type = 'swf';

				} else if (href.charAt(0) === '#') {
					type = 'inline';
				}

			} else if (isString(item)) {
				type = 'html';
			}

			return type;
		},

		trigger: function (event, o) {
			var ret, obj = o || F.coming || F.current;

			if (!obj) {
				return;
			}

			if ($.isFunction( obj[event] )) {
				ret = obj[event].apply(obj, Array.prototype.slice.call(arguments, 1));
			}

			// Cancel further execution if afterClose callback has opened new instance
			if (ret === false || (event === 'afterClose' && F.isActive) ) {
				return false;
			}

			if (obj.helpers) {
				$.each(obj.helpers, function (helper, opts) {
					var helperObject = F.helpers[helper],
						helperOpts;

					if (opts && helperObject && $.isFunction(helperObject[event])) {
						helperOpts = $.extend(true, {}, helperObject.defaults, opts);

						helperObject.opts = helperOpts;

						helperObject[event](helperOpts, obj );
					}
				});
			}

			$.event.trigger(event);
		},

		// Center inside viewport
		reposition: function (e, object) {
			var obj  = object || F.current,
				wrap = obj && obj.wrap,
				pos;

			if (F.isOpen && wrap) {
				pos = F._getPosition( obj );

				if (e === false || (e && e.type === 'scroll')) {
					wrap.stop(true).animate(pos, 200).css('overflow', 'visible');

				} else {
					wrap.css(pos);
				}
			}
		},

		update: function (e) {
			var type    = (e && e.type),
				timeNow = getTime(),
				current = F.current,
				width;

			if (!current || !F.isOpen ) {
				return;
			}

			if (type === 'scroll') {
				if (F.wrap.outerHeight(true) > F.getViewport().h) {
					return;
				}

				if (F.didUpdate) {
					clearTimeout( F.didUpdate );
				}

				F.didUpdate = setTimeout(function() {
					F.reposition(e);

					F.didUpdate = null;
				}, 50);

				return;
			}

			if (F.lock) {
				F.lock.css('overflow', 'hidden');
			}

			F._setDimension();

			F.reposition(e);

			if (F.lock) {
				F.lock.css('overflow', 'auto');
			}

			// Re-center float type caption
			if (current.caption.type === 'float') {
				width = F.getViewport().w - (F.wrap.outerWidth(true)  - F.inner.width() );

				current.caption.wrap.css('width', width).css('marginLeft', (width * 0.5 - F.inner.width() * 0.5) * -1 );
			}

			if (current.expander) {
				if ( current.canShrink) {
					$(".fancybox-expand").show().attr('title', current.locales[ current.locale ].SHRINK  );

				} else if (current.canExpand) {
					$(".fancybox-expand").show().attr('title', current.locales[ current.locale ].EXPAND   );

				} else {
					$(".fancybox-expand").hide();
				}
			}

			F.trigger('onUpdate');
		},

		// Shrink content to fit inside viewport or restore if resized
		toggle: function ( action ) {
			var current = F.current;

			if (current && F.isOpen) {
				F.current.fitToView = $.type(action) === "boolean" ? action : !F.current.fitToView;

				F.update( true );
			}
		},

		hideLoading: function () {
			$('#fancybox-loading').remove();
		},

		showLoading: function () {
			var el, view;

			F.hideLoading();

			el = $('<div id="fancybox-loading"></div>').click(F.cancel).appendTo('body');

			if (!F.defaults.fixed) {
				view = F.getViewport();

				el.css({
					position : 'absolute',
					top  : (view.h * 0.5) + view.y,
					left : (view.w * 0.5) + view.x
				});
			}
		},

		getViewport: function () {
			var rez;

			if (F.lock) {
				rez = {
					x: F.lock.scrollLeft(),
					y: F.lock.scrollTop(),
					w: F.lock[0].clientWidth,
					h: F.lock[0].clientHeight
				};

			} else {
				rez = {
					x: W.scrollLeft(),
					y: W.scrollTop(),

					// See http://bugs.jquery.com/ticket/6724
					w : isTouch && window.innerWidth  ? window.innerWidth  : W.width(),
					h : isTouch && window.innerHeight ? window.innerHeight : W.height()
				};
			}

			return rez;
		},

		unbind : function() {
			if (isQuery(F.wrap)) {
				F.wrap.unbind('.fb');
			}

			if (isQuery(F.inner)) {
				F.inner.unbind('.fb');
			}

			D.unbind('.fb');
			W.unbind('.fb');
		},

		rebind: function () {
			var current = F.current,
				keys;

			F.unbind();

			if (!current || !F.isOpen) {
				return;
			}

			// Changing document height on iOS devices triggers a 'resize' event,
			// that can change document height... repeating infinitely
			W.bind('orientationchange.fb' + (isTouch ? '' : ' resize.fb') + (current.autoCenter && !current.locked ? ' scroll.fb' : ''), F.update);

			keys = current.keys;

			if (keys) {
				D.bind('keydown.fb', function (e) {
					var code   = e.which || e.keyCode,
						target = e.target || e.srcElement;

					// Skip esc key if loading, because showLoading will cancel preloading
					if (code === 27 && F.coming) {
						return false;
					}

					// Ignore key combinations and key events within form elements
					if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && !(target && (target.type || $(target).is('[contenteditable]')))) {
						$.each(keys, function(i, val) {
							//if (current.group.length > 1 && val[ code ] !== undefined) {
							if (val[ code ] !== undefined) {
								e.preventDefault();

								if (current.group.length > 1) {
									F[ i ]( val[ code ] );
								}

								return false;
							}

							if ($.inArray(code, val) > -1) {
								e.preventDefault();

								if (i === 'play') {
									F.slideshow.toggle();
								} else {
									F[ i ] ();
								}

								return false;
							}
						});
					}
				});
			}

			F.lastScroll = getTime();

			if (current.mouseWheel && F.group.length > 1) {
				F.wrap.bind('DOMMouseScroll.fb mousewheel.fb MozMousePixelScroll.fb', function (event) {
					var e       = event.originalEvent,
						el      = e.target || 0,
						delta   = (e.wheelDelta || e.detail || 0),
						deltaX  = e.wheelDeltaX || 0,
						deltaY  = e.wheelDeltaY || 0,
						now     = getTime();

					if (((el && el.style && !(el.style.overflow && el.style.overflow === 'hidden') && ((el.clientWidth && el.scrollWidth > el.clientWidth) || (el.clientHeight && el.scrollHeight > el.clientHeight)))) ) {
						return;
					}

					if (delta === 0 || (F.current && F.current.canShrink)) {
						return;
					}

					e.stopPropagation();

					if (F.lastScroll && (now - F.lastScroll) < 80) {
						F.lastScroll = now;
						return;
					}

					F.lastScroll = now;

					if (e.axis) {
						if (e.axis === e.HORIZONTAL_AXIS) {
							deltaX = delta * -1;

						} else if (e.axis === e.VERTICAL_AXIS) {
							deltaY = delta * -1;
						}
					}

					if ( deltaX === 0 ) {
						if (deltaY > 0) {
							F.prev( 'down' );

						} else {
							F.next( 'up' );
						}

					} else {
						if (deltaX > 0) {
							F.prev( 'right' );

						} else {
							F.next( 'left' );
						}
					}
				});
			}

			F.touch.init();
		},

		rebuild : function() {
			var current = F.current;

			current.wrap.find('.fancybox-nav, .fancybox-close, .fancybox-expand').remove();

			// Create navigation arrows
			if (current.arrows && F.group.length > 1) {
				if (current.loop || current.index > 0) {
					$( F._translate( current.tpl.prev) ).appendTo(F.inner).bind('click.fb', F.prev);
				}

				if (current.loop || current.index < F.group.length - 1) {
					$( F._translate( current.tpl.next) ).appendTo(F.inner).bind('click.fb', F.next);
				}
			}

			// Create a close button
			if (current.closeBtn) {
				$( F._translate( current.tpl.closeBtn) ).appendTo(F.wrap).bind('click.fb', F.close);
			}

			// Add expand button to image
			if (current.expander && current.type === 'image') {
				$('<a title="Expand image" class="fancybox-expand" href="javascript:;"></a>')
					.appendTo( F.inner )
					.bind('click.fb', F.toggle);

				if ( !current.canShrink && !current.canExpand) {

				}
			}
		},

		// Create upcoming object and prepare for loading the content
		_start: function( index ) {
			var coming,
				type;

			// Check index and get object from the groups
			if (F.opts.loop) {
				if (index < 0) {
					index = F.group.length + (index % F.group.length);
				}

				index = index % F.group.length;
			}

			coming = F.group[ index ];

			if (!coming) {
				return false;
			}

			// Add all properties
			coming = $.extend(true, {}, F.opts, coming);

			/*
			 * Add reference to the group, so it`s possible to access from callbacks, example:
			 * afterLoad : function() {
			 *     this.title = 'Image ' + (this.index + 1) + ' of ' + this.group.length + (this.title ? ' - ' + this.title : '');
			 * }
			 */

			coming.group  = F.group;
			coming.index  = index;

			// Give a chance for callback or helpers to update coming item (type, title, etc)
			F.coming = coming;

			if (false === F.trigger('beforeLoad')) {
				F.coming = null;

				return;
			}

			F.isActive = true;

			// Build the neccessary markup
			F._build();

			// If user will press the escape-button, the request will be canceled
			D.bind('keydown.loading', function(e) {
				if ((e.which || e.keyCode) === 27) {
					D.unbind('.loading');

					e.preventDefault();

					F.cancel();
				}
			});

			// Show overlay
			if (coming.overlay && coming.overlay.showEarly) {
				F.overlay.open( coming.overlay );
			}

			// Load content
			type = coming.type;

			if (type === 'image') {
				F._loadImage();

			} else if (type === 'ajax') {
				F._loadAjax();

			} else if (type === 'iframe') {
				F._loadIframe();

			} else if (type === 'inline') {
				F._loadInline();

			} else if (type === 'html' || type === 'swf') {
				F._afterLoad();

			} else {
				F._error();
			}
		},

		_build : function() {
			var coming  = F.coming,
				captionType = coming.caption.type,
				wrap,
				inner,
				scrollV,
				scrollH;

			coming.wrap  = wrap  = $('<div class="fancybox-wrap"></div>').appendTo( coming.parent || 'body' ).addClass('fancybox-' + coming.theme);
			coming.inner = inner = $('<div class="fancybox-inner"></div>').appendTo( wrap );

			coming[ captionType === 'outside' || captionType === 'float' ? 'inner' : 'wrap' ].addClass('fancybox-skin fancybox-' + coming.theme + '-skin');

			if (coming.locked && coming.overlay && F.defaults.fixed) {
				if (!F.lock) {
					F.lock = $('<div id="fancybox-lock"></div>').appendTo( wrap.parent() );
				}

				F.lock.unbind().append( wrap );

				if (coming.overlay.closeClick) {
					F.lock.click(function(e) {
						if ($(e.target).is(F.lock)) {
							F.close();
						}
					});
				}

				// Compensate missing page scrolling by increasing margin
				if (D.height() > W.height() || H.css('overflow-y') === 'scroll') {
					$('*:visible').filter(function(){
						return ($(this).css('position') === 'fixed' && !$(this).hasClass("fancybox-overlay") && $(this).attr('id') !== "fancybox-lock");
					}).addClass('fancybox-margin');

					H.addClass('fancybox-margin');
				}

				// Workaround for FF jumping bug
				scrollV = W.scrollTop();
				scrollH = W.scrollLeft();

				H.addClass('fancybox-lock');

				W.scrollTop( scrollV ).scrollLeft( scrollH );
			}

			F.trigger('onReady');
		},

		_error: function ( type ) {
			if (!F.coming) {
				return;
			}

			$.extend(F.coming, {
				type       : 'html',
				autoWidth  : true,
				autoHeight : true,
				closeBtn   : true,
				minWidth   : 0,
				minHeight  : 0,
				padding    : [15, 15, 15, 15],
				scrolling  : 'visible',
				hasError   : type,
				content    : F._translate( F.coming.tpl.error )
			});

			F._afterLoad();
		},

		_loadImage: function () {
			// Reset preload image so it is later possible to check "complete" property
			var img = F.imgPreload = new Image();

			img.onload = function () {
				this.onload = this.onerror = null;

				$.extend(F.coming, {
					width   : this.width,
					height  : this.height,
					content : $(this).addClass('fancybox-image')
				});

				F._afterLoad();
			};

			img.onerror = function () {
				this.onload = this.onerror = null;

				F._error( 'image' );
			};

			img.src = F.coming.href;

			if (img.complete !== true || img.width < 1) {
				F.showLoading();
			}
		},

		_loadAjax: function () {
			var coming = F.coming,
				href   = coming.href,
				hrefParts,
				selector;

			hrefParts = href.split(/\s+/, 2);
			href      = hrefParts.shift();
			selector  = hrefParts.shift();

			F.showLoading();

			F.ajaxLoad = $.ajax($.extend({}, coming.ajax, {
				url: coming.href,
				error: function (jqXHR, textStatus) {
					if (F.coming && textStatus !== 'abort') {
						F._error( 'ajax', jqXHR );

					} else {
						F.hideLoading();
					}
				},
				success: function (data, textStatus) {
					if (textStatus === 'success') {
						if (selector) {
							data = $('<div>').html(data).find(selector);
						}

						coming.content = data;

						F._afterLoad();
					}
				}
			}));
		},

		_loadIframe: function() {
			var coming = F.coming,
				iframe;

			coming.content = iframe = $(coming.tpl.iframe.replace(/\{rnd\}/g, new Date().getTime()))
				.attr('scrolling', isTouch ? 'auto' : coming.iframe.scrolling);

			if (coming.iframe.preload) {
				F.showLoading();

				F._setDimension( coming );

				coming.wrap.addClass('fancybox-tmp');

				iframe.one('load.fb', function() {
					if (coming.iframe.preload) {
						$(this).data('ready', 1);

						$(this).bind('load.fb', F.update);

						F._afterLoad();
					}
				});
			}

			iframe.attr('src', coming.href).appendTo(coming.inner);

			if (!coming.iframe.preload) {
				F._afterLoad();

			} else if (iframe.data('ready') !== 1) {
				F.showLoading();
			}
		},

		_loadInline : function() {
			var coming = F.coming,
				href   = coming.href;

			coming.content = $( isString(href) ? href.replace(/.*(?=#[^\s]+$)/, '') : href ); //strip for ie7

			if (coming.content.length) {
				F._afterLoad();

			} else {
				F._error();
			}
		},

		_preloadImages: function() {
			var group   = F.group,
				current = F.current,
				len     = group.length,
				cnt     = current.preload ? Math.min(current.preload, len - 1) : 0,
				item,
				i;

			for (i = 1; i <= cnt; i += 1) {
				item = group[ (current.index + i ) % len ];

				if (item && item.type === 'image' && item.href) {
					new Image().src = item.href;
				}
			}
		},

		_afterLoad : function() {
			var current  = F.coming,
				previous = F.current;

			D.unbind('.loading');

			if (!current || F.isActive === false || false === F.trigger('afterLoad', current, previous)) {
				F.hideLoading();

				if (current && current.wrap) {
					removeWrap( current.wrap );
				}

				if (!previous) {
					F._afterZoomOut( current );
				}

				F.coming = null;

				return;
			}

			$.extend(F, {
				wrap     : current.wrap.addClass('fancybox-type-' + current.type + ' fancybox-' + (isTouch ? 'mobile' : 'desktop') + ' fancybox-' + current.theme + '-' +  (isTouch ? 'mobile' : 'desktop')  + ' ' + current.wrapCSS),
				inner    : current.inner,
				current  : current,
				previous : previous
			});

			// Set content, margin/padding, caption, etc
			F._prepare();

			// Give a chance for helpers or callbacks to update elements
			F.trigger('beforeShow', current, previous);

			F.isOpen = false;
			F.coming = null;

			// Set initial dimension
			F._setDimension();

			F.hideLoading();

			// Open overlay if is not yet open
			if (current.overlay && !F.overlay.el) {
				F.overlay.open( current.overlay );
			}

			F.transitions.open();
		},

		_prepare : function() {
			var current     = F.current,
				content     = current.content || '',
				wrap        = current.wrap,
				inner       = current.inner,
				margin      = current.margin,
				padding     = current.padding,
				href        = current.href,
				type        = current.type,
				scrolling   = current.scrolling,
				caption     = current.caption,
				captionText = current.title,
				captionType = caption.type,
				placeholder = 'fancybox-placeholder',
				display     = 'fancybox-display',
				embed;

			if (type !== 'iframe' && isQuery(content) && content.length) {
				if (!content.data(placeholder)) {
					content.data(display, content.css('display'))
						.data(placeholder, $('<div class="' + placeholder + '"></div>').insertAfter( content ).hide() );
				}

				content = content.show().detach();

				current.wrap.bind('onReset', function () {
					if ($(this).find(content).length) {
						content.css('display', content.data(display))
							.replaceAll( content.data(placeholder) )
							.data(placeholder, false)
							.data(display, false);
					}
				});
			}

			if (type === 'swf') {
				content = '<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="' + href + '"></param>';
				embed   = '';

				$.each(current.swf, function(name, val) {
					content += '<param name="' + name + '" value="' + val + '"></param>';
					embed   += ' ' + name + '="' + val + '"';
				});

				content += '<embed src="' + href + '" type="application/x-shockwave-flash" width="100%" height="100%"' + embed + '></embed></object>';
			}

			if (!(isQuery(content) && content.parent().is(current.inner))) {
				current.inner.append( content );

				current.content = current.inner.children(':last');
			}

			// Add margin / padding
			$.each(["Top", "Right", "Bottom", "Left"], function(i, v) {
				if (margin[ i ]) {
					wrap.css('margin' + v, getValue(margin[ i ]));
				}

				if (padding[ i ]) {
					if (!(v === 'Bottom' && captionType === 'outside')) {
						wrap.css('padding' + v, getValue(padding[ i ])  );
					}

					if (captionType === 'outside' || captionType === 'float') {

						inner.css('border' + v + 'Width', getValue(padding[ i ]));

						if (v === 'Top' || v === 'Left') {
							inner.css('margin' + v, getValue(padding[ i ] * -1));
						}
					}
				}
			});

			// Add caption
			if ($.isFunction(captionText)) {
				captionText = captionText.call(current.element, current);
			}

			if (isString(captionText) && $.trim(captionText) !== '') {
				current.caption.wrap = $('<div class="fancybox-title fancybox-title-' + captionType + '-wrap">' + captionText + '</div>').appendTo( current[ captionType === 'over' ? 'inner' : 'wrap' ] );

				if (captionType === 'float') {
					current.caption.wrap.width( F.getViewport().w - (F.wrap.outerWidth(true)  - F.inner.width() ) ).wrapInner('<div></div>');
				}
			}
		},

		_setDimension: function( object ) {
			var view      = F.getViewport(),
				current   = object || F.current,
				wrap      = current.wrap,
				inner     = current.inner,
				width     = current.width,
				height    = current.height,
				minWidth  = current.minWidth,
				minHeight = current.minHeight,
				maxWidth  = current.maxWidth,
				maxHeight = current.maxHeight,
				margin    = current.margin,
				scrollOut = current.scrollOutside ? current.scrollbarWidth : 0,
				margin    = current.margin,
				padding   = current.padding,
				scrolling = current.scrolling,
				steps     = 1,
				scrollingX,
				scrollingY,
				hSpace,
				wSpace,
				origWidth,
				origHeight,
				ratio,
				iframe,
				body,
				maxWidth_,
				maxHeight_,
				width_,
				height_,
				canShrink,
				canExpand;

			// Set scrolling
			scrolling  = scrolling.split(',');
			scrollingX = scrolling[0];
			scrollingY = scrolling[1] || scrollingX;

			current.inner
				.css('overflow-x', scrollingX === 'yes' ? 'scroll' : (scrollingX === 'no' ? 'hidden' : scrollingX))
				.css('overflow-y', scrollingY === 'yes' ? 'scroll' : (scrollingY === 'no' ? 'hidden' : scrollingY));

			wSpace = margin[1] + margin[3] + padding[1] + padding[3];
			hSpace = margin[0] + margin[2] + padding[0] + padding[2];

			// Calculations for the content
			minWidth  = getScalar( isPercentage(minWidth) ? getScalar(minWidth, 'w') - wSpace : minWidth );
			maxWidth  = getScalar( isPercentage(maxWidth) ? getScalar(maxWidth, 'w') - wSpace : maxWidth );

			minHeight = getScalar( isPercentage(minHeight) ? getScalar(minHeight, 'h') - hSpace : minHeight );
			maxHeight = getScalar( isPercentage(maxHeight) ? getScalar(maxHeight, 'h') - hSpace : maxHeight );

			origWidth  = getScalar( isPercentage(width)  ? getScalar(width,  'w') - wSpace : width  );
			origHeight = getScalar( isPercentage(height) ? getScalar(height, 'h') - hSpace : height );

			if (current.fitToView) {
				maxWidth  = Math.min(maxWidth,  getScalar('100%', 'w') - wSpace );
				maxHeight = Math.min(maxHeight, getScalar('100%', 'h') - hSpace );
			}

			maxWidth_  = view.w;
			maxHeight_ = view.h;

			if (current.type === 'iframe') {
				iframe = current.content;

				wrap.removeClass('fancybox-tmp');

				if ((current.autoWidth || current.autoHeight) && iframe && iframe.data('ready') === 1) {

					try {
						if (iframe[0].contentWindow && iframe[0].contentWindow.document.location) {
							body = iframe.contents().find('body');

							inner.addClass( 'fancybox-tmp' );

							inner.width( screen.width - wSpace ).height( 99999 );

							if (scrollOut) {
								body.css('overflow-x', 'hidden');
							}

							if (current.autoWidth) {
								origWidth = body.outerWidth(true);
							}

							if (current.autoHeight) {
								origHeight = body.outerHeight(true);
							}

							inner.removeClass( 'fancybox-tmp' );
						}

					} catch (e) {}
				}

			} else if ( (current.autoWidth || current.autoHeight) && !(current.type === 'image' || current.type === 'swf') ) {
				inner.addClass( 'fancybox-tmp' );

				// Set width or height in case we need to calculate only one dimension
				if (current.autoWidth) {
					inner.width( 'auto' );

				} else {
					inner.width( maxWidth );
				}

				if (current.autoHeight) {
					inner.height( 'auto' );

				} else {
					inner.height( maxHeight );
				}

				if (current.autoWidth) {
					origWidth = inner[0].scrollWidth || inner.width();
				}

				if (current.autoHeight) {
					origHeight = inner[0].scrollHeight || inner.height();
				}

				inner.removeClass( 'fancybox-tmp' );
			}

			width  = origWidth;
			height = origHeight;
			ratio  = origWidth / origHeight;

			if (!current.autoResize) {
				wrap.css({
					width  : getValue( width ),
					height : 'auto'
				});

				inner.css({
					width  : getValue( width ),
					height : getValue( height )
				});
				return;
			}

			if (current.aspectRatio) {
				if (width > maxWidth) {
					width  = maxWidth;
					height = width / ratio;
				}

				if (height > maxHeight) {
					height = maxHeight;
					width  = height * ratio;
				}

				if (width < minWidth) {
					width  = minWidth;
					height = width / ratio;
				}

				if (height < minHeight) {
					height = minHeight;
					width  = height * ratio;
				}

			} else {
				width = Math.max(minWidth, Math.min(width, maxWidth));

				if (current.autoHeight && current.type !== 'iframe') {
					inner.width( width );

					origHeight = height = inner[0].scrollHeight;
				}

				height = Math.max(minHeight, Math.min(height, maxHeight));
			}

			// Wrap element has to have fixed width, because long title can expand it
			wrap.css({
				width  : getValue( width ),
				height : 'auto'
			});

			inner.css({
				width  : getValue( width ),
				height : getValue( height )
			});

			width_  = getScalar( wrap.outerWidth(true) );
			height_ = getScalar( wrap.outerHeight(true) );

			if (current.fitToView) {
				// Since we do not know how many lines will be at the final, we need to
				// resize box till it fits inside max dimensions
				if (current.aspectRatio) {
					while ((width_ > maxWidth_ || height_ > maxHeight_) && width > minWidth && height > minHeight) {
						if (steps++ > 30) {
							break;
						}

						height = Math.max(minHeight, Math.min(maxHeight, height - 10));
						width  = getScalar(height * ratio);

						if (width < minWidth) {
							width  = minWidth;
							height = getScalar(width / ratio);
						}

						if (width > maxWidth) {
							width  = maxWidth;
							height = getScalar(width / ratio);
						}

						wrap.css({
							width  : getValue( width )
						});

						inner.css({
							width  : getValue( width ),
							height : getValue( height )
						});

						width_  = getScalar( wrap.outerWidth(true) );
						height_ = getScalar( wrap.outerHeight(true) );
					}

				} else {
					width  = Math.max(minWidth,  Math.min(width,  width  - (width_  - maxWidth_  )));
					height = Math.max(minHeight, Math.min(height, height - (height_ - maxHeight_ )));
				}
			}


			if (scrollOut && scrollingX === 'auto' && (height < inner[0].scrollHeight || (isQuery(current.content) && current.content[0] && height < current.content[0].offsetHeight)) && (width + wSpace + scrollOut) < maxWidth) {
				width += scrollOut;
			}

			wrap.css({
				width  : width
			});

			inner.css({
				width  : getValue( width ),
				height : getValue( height )
			});

			width_  = getScalar( wrap.outerWidth(true) );
			height_ = getScalar( wrap.outerHeight(true) );

			canShrink = (width_ > maxWidth_ || height_ > maxHeight_) && width > minWidth && height > minHeight;
			canExpand = (width_ < maxWidth_ || height_ < maxHeight_) && ( current.aspectRatio ? (width < maxWidth && height < maxHeight && width < origWidth && height < origHeight) : ((width < maxWidth || height < maxHeight) && (width < origWidth || height < origHeight)) );

			current.canShrink = canShrink;
			current.canExpand = canExpand;

			if (!iframe && current.autoHeight && height > minHeight && height < maxHeight && !canExpand) {
				inner.height('auto');
			}
		},

		_getPosition: function( object ) {
			var obj   = object || F.current,
				wrap  = obj.wrap,
				view  = F.getViewport(),
				pos   = {},
				top   = view.y,
				left  = view.x;

			pos = {
				top    : getValue( Math.max(top,  top  + ((view.h - wrap.outerHeight(true)) * obj.topRatio)) ),
				left   : getValue( Math.max(left, left + ((view.w - wrap.outerWidth(true))  * obj.leftRatio)) ),
				width  : getValue( wrap.width() ),
				height : getValue( wrap.height() )
			};

			return pos;
		},

		_afterZoomIn : function() {
			var current   = F.current;

			if (!current) {
				return;
			}

			if (F.lock) {
				F.lock.css('overflow', 'auto');
			}

			F.isOpen = F.isOpened = true;

			F.rebuild();

			F.rebind();

			if (current.caption && current.caption.wrap) {
				current.caption.wrap.show().css({
					'visibility' : 'visible',
					'opacity'    : 0,
					'left'       : 0
				})
				.animate({opacity:1}, "fast");
			}

			F.update();

			F.wrap.css('overflow', 'visible').addClass('fancybox-open').focus();

			F[ F.wrap.hasClass('fancybox-skin') ? 'wrap' : 'inner' ].addClass('fancybox-' + current.theme + '-skin-open');

			if (current.caption && current.caption.wrap) {
				current.caption.wrap.show().css('left', 0).animate({opacity:1}, "fast");
			}

			// Add empty element to simulate bottom margin, this trick helps to avoid extra element
			if (current.margin[2] > 0) {
				$('<div class="fancybox-spacer"></div>').css('height', getValue( current.margin[2] - 2) ).appendTo( F.wrap );
			}

			F.trigger('afterShow');

			F._preloadImages();

			if (current.autoPlay && !F.slideshow.isActive) {
				F.slideshow.start();
			}
		},

		_afterZoomOut : function(obj) {
			var cleanup = function() {
				removeWrap('.fancybox-wrap');
			};

			F.hideLoading();

			obj = obj || F.current;

			if (obj && obj.wrap) {
				obj.wrap.hide();
			}

			$.extend(F, {
				group     : [],
				opts      : {},
				coming    : null,
				current   : null,
				isActive  : false,
				isOpened  : false,
				isOpen    : false,
				isClosing : false,
				wrap      : null,
				skin      : null,
				inner     : null
			});

			F.trigger('afterClose', obj);

			if (!F.coming && !F.current) {
				if (obj.overlay) {
					F.overlay.close( obj.overlay, cleanup );
				} else {
					cleanup();
				}
			}
		},

		_translate : function( str ) {
			var obj = F.coming || F.current,
				arr = obj.locales[ obj.locale ];

			return str.replace(/\{\{(\w+)\}\}/g, function(match, n) {
				var value = arr[n];

				if (value === undefined) {
					return match;
				}

				return value;
			});
		}
	});

	/*
	 *	Transition object
	 */

	F.transitions = {
		_getOrig: function( object ) {
			var obj     = object || F.current,
				wrap    = obj.wrap,
				element = obj.element,
				orig    = obj.orig,
				view    = F.getViewport(),
				pos     = {},
				width   = 50,
				height  = 50;

			if (!orig && element && element.is(':visible')) {
				orig = element.find('img:first:visible');

				if (!orig.length) {
					orig = element;
				}
			}

			// If there is no orig element, maybe only the first thumbnail is visible
			if (!orig && obj.group[0].element) {
				orig = obj.group[0].element.find('img:visible:first');
			}

			if (isQuery(orig) && orig.is(':visible')) {
				pos = orig.offset();

				if (orig.is('img')) {
					width  = orig.outerWidth();
					height = orig.outerHeight();
				}

				if (F.lock) {
					pos.top  -= W.scrollTop();
					pos.left -= W.scrollLeft();
				}

			} else {
				pos.top  = view.y + (view.h - height) * obj.topRatio;
				pos.left = view.x + (view.w - width)  * obj.leftRatio;
			}

			pos = {
				top      : getValue( pos.top  - (wrap.outerHeight(true) - wrap.height() ) * 0.5 ),
				left     : getValue( pos.left - (wrap.outerWidth(true)  - wrap.width() )  * 0.5 ),
				width    : getValue( width ),
				height   : getValue( height )
			};

			return pos;
		},

		_getCenter: function( object ) {
			var obj   = object || F.current,
				wrap  = obj.wrap,
				view  = F.getViewport(),
				pos   = {},
				top   = view.y,
				left  = view.x;

			pos = {
				top    : getValue( Math.max(top,  top  + ((view.h - wrap.outerHeight(true)) * obj.topRatio)) ),
				left   : getValue( Math.max(left, left + ((view.w - wrap.outerWidth(true))  * obj.leftRatio)) ),
				width  : getValue( wrap.width() ),
				height : getValue( wrap.height() )
			};

			return pos;
		},

		_prepare : function( object, forClosing ) {
			var obj   = object || F.current,
				wrap  = obj.wrap,
				inner = obj.inner;

			// Little trick to avoid animating both elements and to improve performance
			wrap.height( wrap.height() );

			inner.css({
				'width'  : (inner.width() *  100 / wrap.width() )  + '%',
				'height' : (Math.floor( (inner.height() * 100 / wrap.height() ) * 100 ) / 100 ) + '%'
			});

			if (forClosing === true) {
				wrap.find('.fancybox-title, .fancybox-spacer, .fancybox-close, .fancybox-nav').remove();
			}

			inner.css('overflow', 'hidden');
		},

		fade : function( object, stage ) {
			var pos = this._getCenter( object ),
				opa = {opacity: 0};

			return ((stage === 'open' || stage === 'changeIn') ? [ $.extend(pos, opa), {opacity: 1} ] : [ {}, opa ]);
		},

		drop : function( object, stage ) {
			var a = $.extend(this._getCenter( object ), {opacity: 1}),
				b = $.extend({}, a, {opacity: 0, top: getValue( Math.max( F.getViewport().y - object.margin[0], getScalar( a.top ) - 200 ) )});

			return ((stage === 'open' || stage === 'changeIn') ? [ b, a ] : [ {}, b ]);
		},

		elastic : function( object, stage ) {
			var wrap      = object.wrap,
				margin    = object.margin,
				view      = F.getViewport(),
				direction = F.direction,
				pos       = this._getCenter( object ),
				from      = $.extend({}, pos),
				to        = $.extend({}, pos),
				prop,
				amount,
				value;

			if (stage === 'open') {
				from = this._getOrig( object );

			} else if (stage === 'close') {
				from = {};
				to   = this._getOrig( object );

			} else if (direction) {
				// Calculate max distance and try to avoid scrollbars
				prop    = (direction === 'up' || direction === 'down') ? 'top' : 'left';
				amount  = (direction === 'up' || direction === 'left') ? 200 : -200;

				if (stage === 'changeIn') {
					value = getScalar(from[ prop ]) + amount;

					if (direction === 'left') {
						// from viewport right to center
						value = Math.min( value, view.x + view.w - margin[3] - wrap.outerWidth() - 1 );

					} else if (direction === 'right') {
						// from viewport left to center
						value = Math.max( value, view.x - margin[1] );

					} else if (direction === 'up') {
						// from viewport bottom to center
						value = Math.min( value, view.y + view.h - margin[0] - wrap.outerHeight() - 1);

					} else {
						// down - from viewport top to center
						value = Math.max( value, view.y - margin[2] );
					}

					from[ prop ] = value;

				} else {
					value = getScalar(wrap.css(prop)) - amount;
					from  = {};

					if (direction === 'left') {
						// from viewport center to left
						value = Math.max( value, view.x - margin[3] );

					} else if (direction === 'right') {
						// from viewport center to right
						value = Math.min( value, view.x + view.w - margin[1]  - wrap.outerWidth() - 1 );

					} else if (direction === 'up') {
						// from viewport center to top
						value = Math.max( value, view.y - margin[0]  );

					} else {
						// down - from center to bottom
						value = Math.min( value, view.y + view.h - margin[2] - wrap.outerHeight() - 1 );
					}

					to[ prop ] = value;
				}
			}

			if (stage === 'open' || stage === 'changeIn') {
				from.opacity = 0;
				to.opacity   = 1;

			} else {
				to.opacity   = 0;
			}

			return [ from, to ];
		},

		open : function() {
			var current   = F.current,
				previous  = F.previous,
				direction = F.direction,
				effect,
				pos,
				speed,
				easing,
				stage;

			if (previous) {
				previous.wrap.stop(true).removeClass('fancybox-opened');
			}

    		if ( F.isOpened ) {
    			effect = current.nextEffect,
				speed  = current.nextSpeed;
				easing = current.nextEasing;
				stage  = 'changeIn';

			} else {
				effect = current.openEffect;
				speed  = current.openSpeed;
				easing = current.openEasing;
				stage  = 'open';
			}

			/*
			 *	Open current item
			 */

			if (effect === 'none') {
				F._afterZoomIn();

			} else {
				pos = this[ effect ]( current, stage );

				if (effect === 'elastic') {
					this._prepare( current );
				}

				current.wrap.css( pos[ 0 ] );

				current.wrap.animate(
					pos[ 1 ],
					speed,
					easing,
					F._afterZoomIn
				);
			}

			/*
			 *	Close previous item
			 */
			if (previous) {
				if (!F.isOpened || previous.prevEffect === 'none') {
					// Remove previous item if it has not fully opened
					removeWrap( $('.fancybox-wrap').not( current.wrap ) );

				} else {
					previous.wrap.stop(true).removeClass('fancybox-opened');

					pos = this[ previous.prevEffect ]( previous, 'changeOut' );

					this._prepare( previous, true );

					previous.wrap.animate(
						pos[ 1 ],
						previous.prevSpeed,
						previous.prevEasing,
						function() {
							removeWrap( previous.wrap );
						}
					);
				}
			}
		},

		close : function() {
			var current  = F.current,
				wrap     = current.wrap.stop(true).removeClass('fancybox-opened'),
				effect   = current.closeEffect,
				pos;

			if (effect === 'none') {
				return F._afterZoomOut();
			}

			this._prepare( current, true );

			pos = this[ effect ]( current, 'close' );

			wrap.addClass('fancybox-animating')
				.animate(
					pos[ 1 ],
					current.closeSpeed,
					current.closeEasing,
					F._afterZoomOut
				);
		}
	};

	/*
	 *	Slideshow object
	 */

	F.slideshow = {
		_clear : function () {
			if (this._timer) {
				clearTimeout(this._timer);
			}
		},
		_set : function () {
			this._clear();

			if (F.current && this.isActive) {
				this._timer = setTimeout(F.next, this._speed);
			}
		},

		_timer   : null,
		_speed   : null,

		isActive : false,

		start : function ( speed ) {
			var current = F.current;

			if (current && (current.loop || current.index < current.group.length - 1)) {
				this.stop();

				this.isActive = true;
				this._speed   = speed || current.playSpeed;

				D.bind({
					'beforeLoad.player' : $.proxy(this._clear, this),
					'onUpdate.player'   : $.proxy(this._set, this),
					'onCancel.player beforeClose.player' : $.proxy(this.stop, this)
				});

				this._set();

				F.trigger('onPlayStart');
			}
		},

		stop : function () {
			this._clear();

			D.unbind('.player');

			this.isActive = false;
			this._timer   = this._speed = null;

			F.trigger('onPlayEnd');
		},

		toggle : function() {
			if (this.isActive) {
				this.stop();

			} else {
				this.start.apply(this, arguments );
			}
		}
	};

	/*
	 *	Overlay object
	 */

	F.overlay = {
		el    : null,  // current handle
		theme : '',    // current theme

		// Public methods
		open : function(opts) {
			var that  = this,
				el    = this.el,
				fixed = F.defaults.fixed,
				opacity,
				theme;

			opts = $.extend({}, F.defaults.overlay, opts);

			if (el) {
				el.stop(true).removeAttr('style').unbind('.overlay');

			} else {
				el = $('<div class="fancybox-overlay' + (fixed ? ' fancybox-overlay-fixed' : '' ) + '"></div>').appendTo( opts.parent || 'body' );
			}

			if (opts.closeClick) {
				el.bind('click.overlay', function(e) {
					// fix Android touch event bubbling issue
					if (F.lastTouch && (getTime() - F.lastTouch) < 300) {
						return false;
					}

					if (F.isActive) {
						F.close();
					} else {
						that.close();
					}

					return false;
				});
			}

			theme = opts.theme || (F.coming ? F.coming.theme : 'default');

			if (theme !== this.theme) {
				el.removeClass('fancybox-' + this.theme + '-overlay')
			}

			this.theme = theme;

			el.addClass('fancybox-' + theme + '-overlay').css( opts.css );

			opacity = el.css('opacity');

			if (!this.el && opacity < 1 && opts.speedIn) {
				el.css({
					opacity : 0,
					filter  : 'alpha(opacity=0)'  // This fixes IE flickering
				})
				.fadeTo( opts.speedIn, opacity );
			}

			this.el = el;

			if (!fixed) {
				W.bind('resize.overlay', $.proxy( this.update, this) );

				this.update();
			}
		},

		close : function(opts, callback) {
			opts = $.extend({}, F.defaults.overlay, opts);

			if (this.el) {
				this.el.stop(true).fadeOut(opts.speedOut, function() {
					W.unbind('resize.overlay');

					$('.fancybox-overlay').remove();

					F.overlay.el = null;

					if ($.isFunction(callback)) {
						callback();
					}
				});
			}
		},

		update : function () {
			// Reset width/height so it will not mess
			this.el.css({width: '100%', height: '100%'});

			this.el.width(D.width()).height(D.height());
		}
	};

	/*
	 *	Touch object - adds swipe left/right events
	 */

	F.touch = {
		startX   : 0,
		wrapX    : 0,
		dx       : 0,
		isMoving : false,

		_start : function(e) {
			var current = F.current,
				data    = e.originalEvent.touches ? e.originalEvent.touches[0] : e,
				now     = getTime();

			if (!F.isOpen || F.wrap.is(':animated')  || !( $(e.target).is(F.inner) || $(e.target).parent().is(F.inner) )) {
				return;
			}

			if (F.lastTouch && (now - F.lastTouch) < 300) {
				e.preventDefault();

				F.lastTouch = now;

				this._cancel(true);

				F.toggle();

				return false;
			}

			F.lastTouch = now;

			if (F.wrap &&  F.wrap.outerWidth() > F.getViewport().w) {
				return;
			}

			e.preventDefault();

			if (data && F.wrap &&  F.wrap.outerWidth() < F.getViewport().w) {
				this.startX   = data.pageX;
				this.wrapX    = F.wrap.position().left;
				this.isMoving = true;

				F.inner
					.bind('touchmove.fb', $.proxy(this._move, this) )
					.one("touchend.fb touchcancel.fb", $.proxy(this._cancel, this) );
			}
		},

		_move : function(e) {
			var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e,
				dx   = this.startX - data.pageX;

			if (!this.isMoving || !F.isOpen) {
				return;
			}

			this.dx = dx;

			if (F.current.wrap.outerWidth(true) <= W.width()) {

				if (Math.abs(dx) >= 50) {
					e.preventDefault();

					this.last = 0;

					this._cancel(true);

					if (dx > 0) {
						F.next('left');

					} else {
						F.prev('right');
					}

				} else if (Math.abs(dx) > 3) {
					e.preventDefault();

					this.last = 0;

					F.wrap.css('left', this.wrapX - dx);
				}
			}
		},

		_clear : function() {
			this.startX   = this.wrapX = this.dx = 0;
			this.isMoving = false;
		},

		_cancel : function( stop ) {
			if (F.inner) {
				F.inner.unbind('touchmove.fb');
			}

			if (F.isOpen && Math.abs(this.dx) > 3) {
				F.reposition(false);
			}

			this._clear();
		},

		init : function() {
			var that = this;

			if (F.inner && F.touch) {
				this._cancel(true);

				F.inner.bind('touchstart.fb', $.proxy(this._start, this));
			}
		}
	};

	/*
	 *	Add default easing
	 */

	if (!$.easing.easeOutQuad) {
		$.easing.easeOutQuad = function (x, t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		};
	}

	/*
	 *
	 */

	D.ready(function() {
		var w1, w2, scrollV, scrollH;

		// Tests that need a body at doc ready
		if ( $.scrollbarWidth === undefined ) {
			$.scrollbarWidth = function() {
				var parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body'),
					child  = parent.children(),
					width  = child.innerWidth() - child.height( 99 ).innerWidth();

				parent.remove();

				return width;
			};
		}

		if ( $.support.fixedPosition === undefined ) {
			$.support.fixedPosition = (function() {
				var elem  = $('<div style="position:fixed;top:20px;padding:0;margin:0;border:0;"></div>').appendTo('body'),
					fixed = elem.css( 'position' ) === 'fixed' && ((elem[0].offsetTop > 18 && elem[0].offsetTop < 22) || elem[0].offsetTop === 15 );

				elem.remove();

				return fixed;
			}());
		}

		$.extend(F.defaults, {
			scrollbarWidth : $.scrollbarWidth(),
			fixed  : $.support.fixedPosition,
			parent : $('body')
		});

		// Quick and dirty code to get page scroll-bar width and create CSS style
		// Workaround for FF jumping bug
		scrollV = W.scrollTop();
		scrollH = W.scrollLeft();

		w1 = $(window).width();

		H.addClass('fancybox-lock-test');

		w2 = $(window).width();

		H.removeClass('fancybox-lock-test');

		W.scrollTop( scrollV ).scrollLeft( scrollH );

		F.lockMargin = (w2 - w1);

		$("<style type='text/css'>.fancybox-margin{margin-right:" + F.lockMargin + "px;}</style>").appendTo("head");

	});

	// jQuery plugin initialization
	$.fn.fancybox = function (options) {
		var that     = this,
			selector = this.length ? this.selector : false,
			live     = (selector && selector.indexOf('()') < 0 && !(options && options.live === false));

		var handler  = function(e) {
			var collection = live ? $(selector) : that,
				group  = $(this).blur(),
				param  = options.groupAttr || 'data-fancybox-group',
				value  = group.attr( param ),
				tmp    = this.rel;

			if (!value && tmp && tmp !== 'nofollow') {
				param = 'rel';
				value = tmp;
			}

			if (value) {
				group = collection.filter('[' + param + '="' + value + '"]');

				options.index = group.index( this );
			}

			if (group.length) {
				e.preventDefault();

				F.open(group.get(), options);
			}
		};

		options = options || {};

		if (live) {
			D.undelegate(selector, 'click.fb-start').delegate(selector + ":not('.fancybox-close,.fancybox-nav,.fancybox-wrap')", 'click.fb-start', handler);

		} else {
			that.unbind('click.fb-start').bind('click.fb-start', handler);
		}

		return this;
	};

}(window, document, jQuery));
/**
 * Swiper 3.4.1
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 *
 * http://www.idangero.us/swiper/
 *
 * Copyright 2016, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us/
 *
 * Licensed under MIT
 *
 * Released on: December 13, 2016
 */
!function(){"use strict";function e(e){e.fn.swiper=function(a){var s;return e(this).each(function(){var e=new t(this,a);s||(s=e)}),s}}var a,t=function(e,i){function r(e){return Math.floor(e)}function n(){var e=b.params.autoplay,a=b.slides.eq(b.activeIndex);a.attr("data-swiper-autoplay")&&(e=a.attr("data-swiper-autoplay")||b.params.autoplay),b.autoplayTimeoutId=setTimeout(function(){b.params.loop?(b.fixLoop(),b._slideNext(),b.emit("onAutoplay",b)):b.isEnd?i.autoplayStopOnLast?b.stopAutoplay():(b._slideTo(0),b.emit("onAutoplay",b)):(b._slideNext(),b.emit("onAutoplay",b))},e)}function o(e,t){var s=a(e.target);if(!s.is(t))if("string"==typeof t)s=s.parents(t);else if(t.nodeType){var i;return s.parents().each(function(e,a){a===t&&(i=t)}),i?t:void 0}if(0!==s.length)return s[0]}function l(e,a){a=a||{};var t=window.MutationObserver||window.WebkitMutationObserver,s=new t(function(e){e.forEach(function(e){b.onResize(!0),b.emit("onObserverUpdate",b,e)})});s.observe(e,{attributes:"undefined"==typeof a.attributes||a.attributes,childList:"undefined"==typeof a.childList||a.childList,characterData:"undefined"==typeof a.characterData||a.characterData}),b.observers.push(s)}function p(e){e.originalEvent&&(e=e.originalEvent);var a=e.keyCode||e.charCode;if(!b.params.allowSwipeToNext&&(b.isHorizontal()&&39===a||!b.isHorizontal()&&40===a))return!1;if(!b.params.allowSwipeToPrev&&(b.isHorizontal()&&37===a||!b.isHorizontal()&&38===a))return!1;if(!(e.shiftKey||e.altKey||e.ctrlKey||e.metaKey||document.activeElement&&document.activeElement.nodeName&&("input"===document.activeElement.nodeName.toLowerCase()||"textarea"===document.activeElement.nodeName.toLowerCase()))){if(37===a||39===a||38===a||40===a){var t=!1;if(b.container.parents("."+b.params.slideClass).length>0&&0===b.container.parents("."+b.params.slideActiveClass).length)return;var s={left:window.pageXOffset,top:window.pageYOffset},i=window.innerWidth,r=window.innerHeight,n=b.container.offset();b.rtl&&(n.left=n.left-b.container[0].scrollLeft);for(var o=[[n.left,n.top],[n.left+b.width,n.top],[n.left,n.top+b.height],[n.left+b.width,n.top+b.height]],l=0;l<o.length;l++){var p=o[l];p[0]>=s.left&&p[0]<=s.left+i&&p[1]>=s.top&&p[1]<=s.top+r&&(t=!0)}if(!t)return}b.isHorizontal()?(37!==a&&39!==a||(e.preventDefault?e.preventDefault():e.returnValue=!1),(39===a&&!b.rtl||37===a&&b.rtl)&&b.slideNext(),(37===a&&!b.rtl||39===a&&b.rtl)&&b.slidePrev()):(38!==a&&40!==a||(e.preventDefault?e.preventDefault():e.returnValue=!1),40===a&&b.slideNext(),38===a&&b.slidePrev())}}function d(){var e="onwheel",a=e in document;if(!a){var t=document.createElement("div");t.setAttribute(e,"return;"),a="function"==typeof t[e]}return!a&&document.implementation&&document.implementation.hasFeature&&document.implementation.hasFeature("","")!==!0&&(a=document.implementation.hasFeature("Events.wheel","3.0")),a}function u(e){e.originalEvent&&(e=e.originalEvent);var a=0,t=b.rtl?-1:1,s=c(e);if(b.params.mousewheelForceToAxis)if(b.isHorizontal()){if(!(Math.abs(s.pixelX)>Math.abs(s.pixelY)))return;a=s.pixelX*t}else{if(!(Math.abs(s.pixelY)>Math.abs(s.pixelX)))return;a=s.pixelY}else a=Math.abs(s.pixelX)>Math.abs(s.pixelY)?-s.pixelX*t:-s.pixelY;if(0!==a){if(b.params.mousewheelInvert&&(a=-a),b.params.freeMode){var i=b.getWrapperTranslate()+a*b.params.mousewheelSensitivity,r=b.isBeginning,n=b.isEnd;if(i>=b.minTranslate()&&(i=b.minTranslate()),i<=b.maxTranslate()&&(i=b.maxTranslate()),b.setWrapperTransition(0),b.setWrapperTranslate(i),b.updateProgress(),b.updateActiveIndex(),(!r&&b.isBeginning||!n&&b.isEnd)&&b.updateClasses(),b.params.freeModeSticky?(clearTimeout(b.mousewheel.timeout),b.mousewheel.timeout=setTimeout(function(){b.slideReset()},300)):b.params.lazyLoading&&b.lazy&&b.lazy.load(),b.emit("onScroll",b,e),b.params.autoplay&&b.params.autoplayDisableOnInteraction&&b.stopAutoplay(),0===i||i===b.maxTranslate())return}else{if((new window.Date).getTime()-b.mousewheel.lastScrollTime>60)if(a<0)if(b.isEnd&&!b.params.loop||b.animating){if(b.params.mousewheelReleaseOnEdges)return!0}else b.slideNext(),b.emit("onScroll",b,e);else if(b.isBeginning&&!b.params.loop||b.animating){if(b.params.mousewheelReleaseOnEdges)return!0}else b.slidePrev(),b.emit("onScroll",b,e);b.mousewheel.lastScrollTime=(new window.Date).getTime()}return e.preventDefault?e.preventDefault():e.returnValue=!1,!1}}function c(e){var a=10,t=40,s=800,i=0,r=0,n=0,o=0;return"detail"in e&&(r=e.detail),"wheelDelta"in e&&(r=-e.wheelDelta/120),"wheelDeltaY"in e&&(r=-e.wheelDeltaY/120),"wheelDeltaX"in e&&(i=-e.wheelDeltaX/120),"axis"in e&&e.axis===e.HORIZONTAL_AXIS&&(i=r,r=0),n=i*a,o=r*a,"deltaY"in e&&(o=e.deltaY),"deltaX"in e&&(n=e.deltaX),(n||o)&&e.deltaMode&&(1===e.deltaMode?(n*=t,o*=t):(n*=s,o*=s)),n&&!i&&(i=n<1?-1:1),o&&!r&&(r=o<1?-1:1),{spinX:i,spinY:r,pixelX:n,pixelY:o}}function m(e,t){e=a(e);var s,i,r,n=b.rtl?-1:1;s=e.attr("data-swiper-parallax")||"0",i=e.attr("data-swiper-parallax-x"),r=e.attr("data-swiper-parallax-y"),i||r?(i=i||"0",r=r||"0"):b.isHorizontal()?(i=s,r="0"):(r=s,i="0"),i=i.indexOf("%")>=0?parseInt(i,10)*t*n+"%":i*t*n+"px",r=r.indexOf("%")>=0?parseInt(r,10)*t+"%":r*t+"px",e.transform("translate3d("+i+", "+r+",0px)")}function h(e){return 0!==e.indexOf("on")&&(e=e[0]!==e[0].toUpperCase()?"on"+e[0].toUpperCase()+e.substring(1):"on"+e),e}if(!(this instanceof t))return new t(e,i);var g={direction:"horizontal",touchEventsTarget:"container",initialSlide:0,speed:300,autoplay:!1,autoplayDisableOnInteraction:!0,autoplayStopOnLast:!1,iOSEdgeSwipeDetection:!1,iOSEdgeSwipeThreshold:20,freeMode:!1,freeModeMomentum:!0,freeModeMomentumRatio:1,freeModeMomentumBounce:!0,freeModeMomentumBounceRatio:1,freeModeMomentumVelocityRatio:1,freeModeSticky:!1,freeModeMinimumVelocity:.02,autoHeight:!1,setWrapperSize:!1,virtualTranslate:!1,effect:"slide",coverflow:{rotate:50,stretch:0,depth:100,modifier:1,slideShadows:!0},flip:{slideShadows:!0,limitRotation:!0},cube:{slideShadows:!0,shadow:!0,shadowOffset:20,shadowScale:.94},fade:{crossFade:!1},parallax:!1,zoom:!1,zoomMax:3,zoomMin:1,zoomToggle:!0,scrollbar:null,scrollbarHide:!0,scrollbarDraggable:!1,scrollbarSnapOnRelease:!1,keyboardControl:!1,mousewheelControl:!1,mousewheelReleaseOnEdges:!1,mousewheelInvert:!1,mousewheelForceToAxis:!1,mousewheelSensitivity:1,mousewheelEventsTarged:"container",hashnav:!1,hashnavWatchState:!1,history:!1,replaceState:!1,breakpoints:void 0,spaceBetween:0,slidesPerView:1,slidesPerColumn:1,slidesPerColumnFill:"column",slidesPerGroup:1,centeredSlides:!1,slidesOffsetBefore:0,slidesOffsetAfter:0,roundLengths:!1,touchRatio:1,touchAngle:45,simulateTouch:!0,shortSwipes:!0,longSwipes:!0,longSwipesRatio:.5,longSwipesMs:300,followFinger:!0,onlyExternal:!1,threshold:0,touchMoveStopPropagation:!0,touchReleaseOnEdges:!1,uniqueNavElements:!0,pagination:null,paginationElement:"span",paginationClickable:!1,paginationHide:!1,paginationBulletRender:null,paginationProgressRender:null,paginationFractionRender:null,paginationCustomRender:null,paginationType:"bullets",resistance:!0,resistanceRatio:.85,nextButton:null,prevButton:null,watchSlidesProgress:!1,watchSlidesVisibility:!1,grabCursor:!1,preventClicks:!0,preventClicksPropagation:!0,slideToClickedSlide:!1,lazyLoading:!1,lazyLoadingInPrevNext:!1,lazyLoadingInPrevNextAmount:1,lazyLoadingOnTransitionStart:!1,preloadImages:!0,updateOnImagesReady:!0,loop:!1,loopAdditionalSlides:0,loopedSlides:null,control:void 0,controlInverse:!1,controlBy:"slide",normalizeSlideIndex:!0,allowSwipeToPrev:!0,allowSwipeToNext:!0,swipeHandler:null,noSwiping:!0,noSwipingClass:"swiper-no-swiping",passiveListeners:!0,containerModifierClass:"swiper-container-",slideClass:"swiper-slide",slideActiveClass:"swiper-slide-active",slideDuplicateActiveClass:"swiper-slide-duplicate-active",slideVisibleClass:"swiper-slide-visible",slideDuplicateClass:"swiper-slide-duplicate",slideNextClass:"swiper-slide-next",slideDuplicateNextClass:"swiper-slide-duplicate-next",slidePrevClass:"swiper-slide-prev",slideDuplicatePrevClass:"swiper-slide-duplicate-prev",wrapperClass:"swiper-wrapper",bulletClass:"swiper-pagination-bullet",bulletActiveClass:"swiper-pagination-bullet-active",buttonDisabledClass:"swiper-button-disabled",paginationCurrentClass:"swiper-pagination-current",paginationTotalClass:"swiper-pagination-total",paginationHiddenClass:"swiper-pagination-hidden",paginationProgressbarClass:"swiper-pagination-progressbar",paginationClickableClass:"swiper-pagination-clickable",paginationModifierClass:"swiper-pagination-",lazyLoadingClass:"swiper-lazy",lazyStatusLoadingClass:"swiper-lazy-loading",lazyStatusLoadedClass:"swiper-lazy-loaded",lazyPreloaderClass:"swiper-lazy-preloader",notificationClass:"swiper-notification",preloaderClass:"preloader",zoomContainerClass:"swiper-zoom-container",observer:!1,observeParents:!1,a11y:!1,prevSlideMessage:"Previous slide",nextSlideMessage:"Next slide",firstSlideMessage:"This is the first slide",lastSlideMessage:"This is the last slide",paginationBulletMessage:"Go to slide {{index}}",runCallbacksOnInit:!0},f=i&&i.virtualTranslate;i=i||{};var v={};for(var w in i)if("object"!=typeof i[w]||null===i[w]||(i[w].nodeType||i[w]===window||i[w]===document||"undefined"!=typeof s&&i[w]instanceof s||"undefined"!=typeof jQuery&&i[w]instanceof jQuery))v[w]=i[w];else{v[w]={};for(var y in i[w])v[w][y]=i[w][y]}for(var x in g)if("undefined"==typeof i[x])i[x]=g[x];else if("object"==typeof i[x])for(var T in g[x])"undefined"==typeof i[x][T]&&(i[x][T]=g[x][T]);var b=this;if(b.params=i,b.originalParams=v,b.classNames=[],"undefined"!=typeof a&&"undefined"!=typeof s&&(a=s),("undefined"!=typeof a||(a="undefined"==typeof s?window.Dom7||window.Zepto||window.jQuery:s))&&(b.$=a,b.currentBreakpoint=void 0,b.getActiveBreakpoint=function(){if(!b.params.breakpoints)return!1;var e,a=!1,t=[];for(e in b.params.breakpoints)b.params.breakpoints.hasOwnProperty(e)&&t.push(e);t.sort(function(e,a){return parseInt(e,10)>parseInt(a,10)});for(var s=0;s<t.length;s++)e=t[s],e>=window.innerWidth&&!a&&(a=e);return a||"max"},b.setBreakpoint=function(){var e=b.getActiveBreakpoint();if(e&&b.currentBreakpoint!==e){var a=e in b.params.breakpoints?b.params.breakpoints[e]:b.originalParams,t=b.params.loop&&a.slidesPerView!==b.params.slidesPerView;for(var s in a)b.params[s]=a[s];b.currentBreakpoint=e,t&&b.destroyLoop&&b.reLoop(!0)}},b.params.breakpoints&&b.setBreakpoint(),b.container=a(e),0!==b.container.length)){if(b.container.length>1){var S=[];return b.container.each(function(){S.push(new t(this,i))}),S}b.container[0].swiper=b,b.container.data("swiper",b),b.classNames.push(b.params.containerModifierClass+b.params.direction),b.params.freeMode&&b.classNames.push(b.params.containerModifierClass+"free-mode"),b.support.flexbox||(b.classNames.push(b.params.containerModifierClass+"no-flexbox"),b.params.slidesPerColumn=1),b.params.autoHeight&&b.classNames.push(b.params.containerModifierClass+"autoheight"),(b.params.parallax||b.params.watchSlidesVisibility)&&(b.params.watchSlidesProgress=!0),b.params.touchReleaseOnEdges&&(b.params.resistanceRatio=0),["cube","coverflow","flip"].indexOf(b.params.effect)>=0&&(b.support.transforms3d?(b.params.watchSlidesProgress=!0,b.classNames.push(b.params.containerModifierClass+"3d")):b.params.effect="slide"),"slide"!==b.params.effect&&b.classNames.push(b.params.containerModifierClass+b.params.effect),"cube"===b.params.effect&&(b.params.resistanceRatio=0,b.params.slidesPerView=1,b.params.slidesPerColumn=1,b.params.slidesPerGroup=1,b.params.centeredSlides=!1,b.params.spaceBetween=0,b.params.virtualTranslate=!0,b.params.setWrapperSize=!1),"fade"!==b.params.effect&&"flip"!==b.params.effect||(b.params.slidesPerView=1,b.params.slidesPerColumn=1,b.params.slidesPerGroup=1,b.params.watchSlidesProgress=!0,b.params.spaceBetween=0,b.params.setWrapperSize=!1,"undefined"==typeof f&&(b.params.virtualTranslate=!0)),b.params.grabCursor&&b.support.touch&&(b.params.grabCursor=!1),b.wrapper=b.container.children("."+b.params.wrapperClass),b.params.pagination&&(b.paginationContainer=a(b.params.pagination),b.params.uniqueNavElements&&"string"==typeof b.params.pagination&&b.paginationContainer.length>1&&1===b.container.find(b.params.pagination).length&&(b.paginationContainer=b.container.find(b.params.pagination)),"bullets"===b.params.paginationType&&b.params.paginationClickable?b.paginationContainer.addClass(b.params.paginationModifierClass+"clickable"):b.params.paginationClickable=!1,b.paginationContainer.addClass(b.params.paginationModifierClass+b.params.paginationType)),(b.params.nextButton||b.params.prevButton)&&(b.params.nextButton&&(b.nextButton=a(b.params.nextButton),b.params.uniqueNavElements&&"string"==typeof b.params.nextButton&&b.nextButton.length>1&&1===b.container.find(b.params.nextButton).length&&(b.nextButton=b.container.find(b.params.nextButton))),b.params.prevButton&&(b.prevButton=a(b.params.prevButton),b.params.uniqueNavElements&&"string"==typeof b.params.prevButton&&b.prevButton.length>1&&1===b.container.find(b.params.prevButton).length&&(b.prevButton=b.container.find(b.params.prevButton)))),b.isHorizontal=function(){return"horizontal"===b.params.direction},b.rtl=b.isHorizontal()&&("rtl"===b.container[0].dir.toLowerCase()||"rtl"===b.container.css("direction")),b.rtl&&b.classNames.push(b.params.containerModifierClass+"rtl"),b.rtl&&(b.wrongRTL="-webkit-box"===b.wrapper.css("display")),b.params.slidesPerColumn>1&&b.classNames.push(b.params.containerModifierClass+"multirow"),b.device.android&&b.classNames.push(b.params.containerModifierClass+"android"),b.container.addClass(b.classNames.join(" ")),b.translate=0,b.progress=0,b.velocity=0,b.lockSwipeToNext=function(){b.params.allowSwipeToNext=!1,b.params.allowSwipeToPrev===!1&&b.params.grabCursor&&b.unsetGrabCursor()},b.lockSwipeToPrev=function(){b.params.allowSwipeToPrev=!1,b.params.allowSwipeToNext===!1&&b.params.grabCursor&&b.unsetGrabCursor()},b.lockSwipes=function(){b.params.allowSwipeToNext=b.params.allowSwipeToPrev=!1,b.params.grabCursor&&b.unsetGrabCursor()},b.unlockSwipeToNext=function(){b.params.allowSwipeToNext=!0,b.params.allowSwipeToPrev===!0&&b.params.grabCursor&&b.setGrabCursor()},b.unlockSwipeToPrev=function(){b.params.allowSwipeToPrev=!0,b.params.allowSwipeToNext===!0&&b.params.grabCursor&&b.setGrabCursor()},b.unlockSwipes=function(){b.params.allowSwipeToNext=b.params.allowSwipeToPrev=!0,b.params.grabCursor&&b.setGrabCursor()},b.setGrabCursor=function(e){b.container[0].style.cursor="move",b.container[0].style.cursor=e?"-webkit-grabbing":"-webkit-grab",b.container[0].style.cursor=e?"-moz-grabbin":"-moz-grab",b.container[0].style.cursor=e?"grabbing":"grab"},b.unsetGrabCursor=function(){b.container[0].style.cursor=""},b.params.grabCursor&&b.setGrabCursor(),b.imagesToLoad=[],b.imagesLoaded=0,b.loadImage=function(e,a,t,s,i,r){function n(){r&&r()}var o;e.complete&&i?n():a?(o=new window.Image,o.onload=n,o.onerror=n,s&&(o.sizes=s),t&&(o.srcset=t),a&&(o.src=a)):n()},b.preloadImages=function(){function e(){"undefined"!=typeof b&&null!==b&&b&&(void 0!==b.imagesLoaded&&b.imagesLoaded++,b.imagesLoaded===b.imagesToLoad.length&&(b.params.updateOnImagesReady&&b.update(),b.emit("onImagesReady",b)))}b.imagesToLoad=b.container.find("img");for(var a=0;a<b.imagesToLoad.length;a++)b.loadImage(b.imagesToLoad[a],b.imagesToLoad[a].currentSrc||b.imagesToLoad[a].getAttribute("src"),b.imagesToLoad[a].srcset||b.imagesToLoad[a].getAttribute("srcset"),b.imagesToLoad[a].sizes||b.imagesToLoad[a].getAttribute("sizes"),!0,e)},b.autoplayTimeoutId=void 0,b.autoplaying=!1,b.autoplayPaused=!1,b.startAutoplay=function(){return"undefined"==typeof b.autoplayTimeoutId&&(!!b.params.autoplay&&(!b.autoplaying&&(b.autoplaying=!0,b.emit("onAutoplayStart",b),void n())))},b.stopAutoplay=function(e){b.autoplayTimeoutId&&(b.autoplayTimeoutId&&clearTimeout(b.autoplayTimeoutId),b.autoplaying=!1,b.autoplayTimeoutId=void 0,b.emit("onAutoplayStop",b))},b.pauseAutoplay=function(e){b.autoplayPaused||(b.autoplayTimeoutId&&clearTimeout(b.autoplayTimeoutId),b.autoplayPaused=!0,0===e?(b.autoplayPaused=!1,n()):b.wrapper.transitionEnd(function(){b&&(b.autoplayPaused=!1,b.autoplaying?n():b.stopAutoplay())}))},b.minTranslate=function(){return-b.snapGrid[0]},b.maxTranslate=function(){return-b.snapGrid[b.snapGrid.length-1]},b.updateAutoHeight=function(){var e,a=[],t=0;if("auto"!==b.params.slidesPerView&&b.params.slidesPerView>1)for(e=0;e<Math.ceil(b.params.slidesPerView);e++){var s=b.activeIndex+e;if(s>b.slides.length)break;a.push(b.slides.eq(s)[0])}else a.push(b.slides.eq(b.activeIndex)[0]);for(e=0;e<a.length;e++)if("undefined"!=typeof a[e]){var i=a[e].offsetHeight;t=i>t?i:t}t&&b.wrapper.css("height",t+"px")},b.updateContainerSize=function(){var e,a;e="undefined"!=typeof b.params.width?b.params.width:b.container[0].clientWidth,a="undefined"!=typeof b.params.height?b.params.height:b.container[0].clientHeight,0===e&&b.isHorizontal()||0===a&&!b.isHorizontal()||(e=e-parseInt(b.container.css("padding-left"),10)-parseInt(b.container.css("padding-right"),10),a=a-parseInt(b.container.css("padding-top"),10)-parseInt(b.container.css("padding-bottom"),10),b.width=e,b.height=a,b.size=b.isHorizontal()?b.width:b.height)},b.updateSlidesSize=function(){b.slides=b.wrapper.children("."+b.params.slideClass),b.snapGrid=[],b.slidesGrid=[],b.slidesSizesGrid=[];var e,a=b.params.spaceBetween,t=-b.params.slidesOffsetBefore,s=0,i=0;if("undefined"!=typeof b.size){"string"==typeof a&&a.indexOf("%")>=0&&(a=parseFloat(a.replace("%",""))/100*b.size),b.virtualSize=-a,b.rtl?b.slides.css({marginLeft:"",marginTop:""}):b.slides.css({marginRight:"",marginBottom:""});var n;b.params.slidesPerColumn>1&&(n=Math.floor(b.slides.length/b.params.slidesPerColumn)===b.slides.length/b.params.slidesPerColumn?b.slides.length:Math.ceil(b.slides.length/b.params.slidesPerColumn)*b.params.slidesPerColumn,"auto"!==b.params.slidesPerView&&"row"===b.params.slidesPerColumnFill&&(n=Math.max(n,b.params.slidesPerView*b.params.slidesPerColumn)));var o,l=b.params.slidesPerColumn,p=n/l,d=p-(b.params.slidesPerColumn*p-b.slides.length);for(e=0;e<b.slides.length;e++){o=0;var u=b.slides.eq(e);if(b.params.slidesPerColumn>1){var c,m,h;"column"===b.params.slidesPerColumnFill?(m=Math.floor(e/l),h=e-m*l,(m>d||m===d&&h===l-1)&&++h>=l&&(h=0,m++),c=m+h*n/l,u.css({"-webkit-box-ordinal-group":c,"-moz-box-ordinal-group":c,"-ms-flex-order":c,"-webkit-order":c,order:c})):(h=Math.floor(e/p),m=e-h*p),u.css("margin-"+(b.isHorizontal()?"top":"left"),0!==h&&b.params.spaceBetween&&b.params.spaceBetween+"px").attr("data-swiper-column",m).attr("data-swiper-row",h)}"none"!==u.css("display")&&("auto"===b.params.slidesPerView?(o=b.isHorizontal()?u.outerWidth(!0):u.outerHeight(!0),b.params.roundLengths&&(o=r(o))):(o=(b.size-(b.params.slidesPerView-1)*a)/b.params.slidesPerView,b.params.roundLengths&&(o=r(o)),b.isHorizontal()?b.slides[e].style.width=o+"px":b.slides[e].style.height=o+"px"),b.slides[e].swiperSlideSize=o,b.slidesSizesGrid.push(o),b.params.centeredSlides?(t=t+o/2+s/2+a,0===e&&(t=t-b.size/2-a),Math.abs(t)<.001&&(t=0),i%b.params.slidesPerGroup===0&&b.snapGrid.push(t),b.slidesGrid.push(t)):(i%b.params.slidesPerGroup===0&&b.snapGrid.push(t),b.slidesGrid.push(t),t=t+o+a),b.virtualSize+=o+a,s=o,i++)}b.virtualSize=Math.max(b.virtualSize,b.size)+b.params.slidesOffsetAfter;var g;if(b.rtl&&b.wrongRTL&&("slide"===b.params.effect||"coverflow"===b.params.effect)&&b.wrapper.css({width:b.virtualSize+b.params.spaceBetween+"px"}),b.support.flexbox&&!b.params.setWrapperSize||(b.isHorizontal()?b.wrapper.css({width:b.virtualSize+b.params.spaceBetween+"px"}):b.wrapper.css({height:b.virtualSize+b.params.spaceBetween+"px"})),b.params.slidesPerColumn>1&&(b.virtualSize=(o+b.params.spaceBetween)*n,b.virtualSize=Math.ceil(b.virtualSize/b.params.slidesPerColumn)-b.params.spaceBetween,b.isHorizontal()?b.wrapper.css({width:b.virtualSize+b.params.spaceBetween+"px"}):b.wrapper.css({height:b.virtualSize+b.params.spaceBetween+"px"}),b.params.centeredSlides)){for(g=[],e=0;e<b.snapGrid.length;e++)b.snapGrid[e]<b.virtualSize+b.snapGrid[0]&&g.push(b.snapGrid[e]);b.snapGrid=g}if(!b.params.centeredSlides){for(g=[],e=0;e<b.snapGrid.length;e++)b.snapGrid[e]<=b.virtualSize-b.size&&g.push(b.snapGrid[e]);b.snapGrid=g,Math.floor(b.virtualSize-b.size)-Math.floor(b.snapGrid[b.snapGrid.length-1])>1&&b.snapGrid.push(b.virtualSize-b.size)}0===b.snapGrid.length&&(b.snapGrid=[0]),0!==b.params.spaceBetween&&(b.isHorizontal()?b.rtl?b.slides.css({marginLeft:a+"px"}):b.slides.css({marginRight:a+"px"}):b.slides.css({marginBottom:a+"px"})),b.params.watchSlidesProgress&&b.updateSlidesOffset()}},b.updateSlidesOffset=function(){for(var e=0;e<b.slides.length;e++)b.slides[e].swiperSlideOffset=b.isHorizontal()?b.slides[e].offsetLeft:b.slides[e].offsetTop},b.currentSlidesPerView=function(){var e,a,t=1;if(b.params.centeredSlides){var s,i=b.slides[b.activeIndex].swiperSlideSize;for(e=b.activeIndex+1;e<b.slides.length;e++)b.slides[e]&&!s&&(i+=b.slides[e].swiperSlideSize,t++,i>b.size&&(s=!0));for(a=b.activeIndex-1;a>=0;a--)b.slides[a]&&!s&&(i+=b.slides[a].swiperSlideSize,t++,i>b.size&&(s=!0))}else for(e=b.activeIndex+1;e<b.slides.length;e++)b.slidesGrid[e]-b.slidesGrid[b.activeIndex]<b.size&&t++;return t},b.updateSlidesProgress=function(e){if("undefined"==typeof e&&(e=b.translate||0),0!==b.slides.length){"undefined"==typeof b.slides[0].swiperSlideOffset&&b.updateSlidesOffset();var a=-e;b.rtl&&(a=e),b.slides.removeClass(b.params.slideVisibleClass);for(var t=0;t<b.slides.length;t++){var s=b.slides[t],i=(a+(b.params.centeredSlides?b.minTranslate():0)-s.swiperSlideOffset)/(s.swiperSlideSize+b.params.spaceBetween);if(b.params.watchSlidesVisibility){var r=-(a-s.swiperSlideOffset),n=r+b.slidesSizesGrid[t],o=r>=0&&r<b.size||n>0&&n<=b.size||r<=0&&n>=b.size;o&&b.slides.eq(t).addClass(b.params.slideVisibleClass)}s.progress=b.rtl?-i:i}}},b.updateProgress=function(e){"undefined"==typeof e&&(e=b.translate||0);var a=b.maxTranslate()-b.minTranslate(),t=b.isBeginning,s=b.isEnd;0===a?(b.progress=0,b.isBeginning=b.isEnd=!0):(b.progress=(e-b.minTranslate())/a,b.isBeginning=b.progress<=0,b.isEnd=b.progress>=1),b.isBeginning&&!t&&b.emit("onReachBeginning",b),b.isEnd&&!s&&b.emit("onReachEnd",b),b.params.watchSlidesProgress&&b.updateSlidesProgress(e),b.emit("onProgress",b,b.progress)},b.updateActiveIndex=function(){var e,a,t,s=b.rtl?b.translate:-b.translate;for(a=0;a<b.slidesGrid.length;a++)"undefined"!=typeof b.slidesGrid[a+1]?s>=b.slidesGrid[a]&&s<b.slidesGrid[a+1]-(b.slidesGrid[a+1]-b.slidesGrid[a])/2?e=a:s>=b.slidesGrid[a]&&s<b.slidesGrid[a+1]&&(e=a+1):s>=b.slidesGrid[a]&&(e=a);b.params.normalizeSlideIndex&&(e<0||"undefined"==typeof e)&&(e=0),t=Math.floor(e/b.params.slidesPerGroup),t>=b.snapGrid.length&&(t=b.snapGrid.length-1),e!==b.activeIndex&&(b.snapIndex=t,b.previousIndex=b.activeIndex,b.activeIndex=e,b.updateClasses(),b.updateRealIndex())},b.updateRealIndex=function(){b.realIndex=parseInt(b.slides.eq(b.activeIndex).attr("data-swiper-slide-index")||b.activeIndex,10)},b.updateClasses=function(){b.slides.removeClass(b.params.slideActiveClass+" "+b.params.slideNextClass+" "+b.params.slidePrevClass+" "+b.params.slideDuplicateActiveClass+" "+b.params.slideDuplicateNextClass+" "+b.params.slideDuplicatePrevClass);var e=b.slides.eq(b.activeIndex);e.addClass(b.params.slideActiveClass),i.loop&&(e.hasClass(b.params.slideDuplicateClass)?b.wrapper.children("."+b.params.slideClass+":not(."+b.params.slideDuplicateClass+')[data-swiper-slide-index="'+b.realIndex+'"]').addClass(b.params.slideDuplicateActiveClass):b.wrapper.children("."+b.params.slideClass+"."+b.params.slideDuplicateClass+'[data-swiper-slide-index="'+b.realIndex+'"]').addClass(b.params.slideDuplicateActiveClass));var t=e.next("."+b.params.slideClass).addClass(b.params.slideNextClass);b.params.loop&&0===t.length&&(t=b.slides.eq(0),t.addClass(b.params.slideNextClass));var s=e.prev("."+b.params.slideClass).addClass(b.params.slidePrevClass);if(b.params.loop&&0===s.length&&(s=b.slides.eq(-1),s.addClass(b.params.slidePrevClass)),i.loop&&(t.hasClass(b.params.slideDuplicateClass)?b.wrapper.children("."+b.params.slideClass+":not(."+b.params.slideDuplicateClass+')[data-swiper-slide-index="'+t.attr("data-swiper-slide-index")+'"]').addClass(b.params.slideDuplicateNextClass):b.wrapper.children("."+b.params.slideClass+"."+b.params.slideDuplicateClass+'[data-swiper-slide-index="'+t.attr("data-swiper-slide-index")+'"]').addClass(b.params.slideDuplicateNextClass),s.hasClass(b.params.slideDuplicateClass)?b.wrapper.children("."+b.params.slideClass+":not(."+b.params.slideDuplicateClass+')[data-swiper-slide-index="'+s.attr("data-swiper-slide-index")+'"]').addClass(b.params.slideDuplicatePrevClass):b.wrapper.children("."+b.params.slideClass+"."+b.params.slideDuplicateClass+'[data-swiper-slide-index="'+s.attr("data-swiper-slide-index")+'"]').addClass(b.params.slideDuplicatePrevClass)),b.paginationContainer&&b.paginationContainer.length>0){var r,n=b.params.loop?Math.ceil((b.slides.length-2*b.loopedSlides)/b.params.slidesPerGroup):b.snapGrid.length;if(b.params.loop?(r=Math.ceil((b.activeIndex-b.loopedSlides)/b.params.slidesPerGroup),r>b.slides.length-1-2*b.loopedSlides&&(r-=b.slides.length-2*b.loopedSlides),r>n-1&&(r-=n),r<0&&"bullets"!==b.params.paginationType&&(r=n+r)):r="undefined"!=typeof b.snapIndex?b.snapIndex:b.activeIndex||0,"bullets"===b.params.paginationType&&b.bullets&&b.bullets.length>0&&(b.bullets.removeClass(b.params.bulletActiveClass),b.paginationContainer.length>1?b.bullets.each(function(){a(this).index()===r&&a(this).addClass(b.params.bulletActiveClass)}):b.bullets.eq(r).addClass(b.params.bulletActiveClass)),"fraction"===b.params.paginationType&&(b.paginationContainer.find("."+b.params.paginationCurrentClass).text(r+1),b.paginationContainer.find("."+b.params.paginationTotalClass).text(n)),"progress"===b.params.paginationType){var o=(r+1)/n,l=o,p=1;b.isHorizontal()||(p=o,l=1),b.paginationContainer.find("."+b.params.paginationProgressbarClass).transform("translate3d(0,0,0) scaleX("+l+") scaleY("+p+")").transition(b.params.speed)}"custom"===b.params.paginationType&&b.params.paginationCustomRender&&(b.paginationContainer.html(b.params.paginationCustomRender(b,r+1,n)),b.emit("onPaginationRendered",b,b.paginationContainer[0]))}b.params.loop||(b.params.prevButton&&b.prevButton&&b.prevButton.length>0&&(b.isBeginning?(b.prevButton.addClass(b.params.buttonDisabledClass),b.params.a11y&&b.a11y&&b.a11y.disable(b.prevButton)):(b.prevButton.removeClass(b.params.buttonDisabledClass),b.params.a11y&&b.a11y&&b.a11y.enable(b.prevButton))),b.params.nextButton&&b.nextButton&&b.nextButton.length>0&&(b.isEnd?(b.nextButton.addClass(b.params.buttonDisabledClass),b.params.a11y&&b.a11y&&b.a11y.disable(b.nextButton)):(b.nextButton.removeClass(b.params.buttonDisabledClass),b.params.a11y&&b.a11y&&b.a11y.enable(b.nextButton))))},b.updatePagination=function(){if(b.params.pagination&&b.paginationContainer&&b.paginationContainer.length>0){var e="";if("bullets"===b.params.paginationType){for(var a=b.params.loop?Math.ceil((b.slides.length-2*b.loopedSlides)/b.params.slidesPerGroup):b.snapGrid.length,t=0;t<a;t++)e+=b.params.paginationBulletRender?b.params.paginationBulletRender(b,t,b.params.bulletClass):"<"+b.params.paginationElement+' class="'+b.params.bulletClass+'"></'+b.params.paginationElement+">";b.paginationContainer.html(e),b.bullets=b.paginationContainer.find("."+b.params.bulletClass),b.params.paginationClickable&&b.params.a11y&&b.a11y&&b.a11y.initPagination()}"fraction"===b.params.paginationType&&(e=b.params.paginationFractionRender?b.params.paginationFractionRender(b,b.params.paginationCurrentClass,b.params.paginationTotalClass):'<span class="'+b.params.paginationCurrentClass+'"></span> / <span class="'+b.params.paginationTotalClass+'"></span>',b.paginationContainer.html(e)),"progress"===b.params.paginationType&&(e=b.params.paginationProgressRender?b.params.paginationProgressRender(b,b.params.paginationProgressbarClass):'<span class="'+b.params.paginationProgressbarClass+'"></span>',b.paginationContainer.html(e)),"custom"!==b.params.paginationType&&b.emit("onPaginationRendered",b,b.paginationContainer[0])}},b.update=function(e){function a(){b.rtl?-b.translate:b.translate;s=Math.min(Math.max(b.translate,b.maxTranslate()),b.minTranslate()),b.setWrapperTranslate(s),b.updateActiveIndex(),b.updateClasses()}if(b)if(b.updateContainerSize(),b.updateSlidesSize(),b.updateProgress(),b.updatePagination(),b.updateClasses(),b.params.scrollbar&&b.scrollbar&&b.scrollbar.set(),e){var t,s;b.controller&&b.controller.spline&&(b.controller.spline=void 0),b.params.freeMode?(a(),b.params.autoHeight&&b.updateAutoHeight()):(t=("auto"===b.params.slidesPerView||b.params.slidesPerView>1)&&b.isEnd&&!b.params.centeredSlides?b.slideTo(b.slides.length-1,0,!1,!0):b.slideTo(b.activeIndex,0,!1,!0),t||a())}else b.params.autoHeight&&b.updateAutoHeight()},b.onResize=function(e){b.params.breakpoints&&b.setBreakpoint();var a=b.params.allowSwipeToPrev,t=b.params.allowSwipeToNext;b.params.allowSwipeToPrev=b.params.allowSwipeToNext=!0,b.updateContainerSize(),b.updateSlidesSize(),("auto"===b.params.slidesPerView||b.params.freeMode||e)&&b.updatePagination(),b.params.scrollbar&&b.scrollbar&&b.scrollbar.set(),b.controller&&b.controller.spline&&(b.controller.spline=void 0);var s=!1;if(b.params.freeMode){var i=Math.min(Math.max(b.translate,b.maxTranslate()),b.minTranslate());b.setWrapperTranslate(i),b.updateActiveIndex(),b.updateClasses(),b.params.autoHeight&&b.updateAutoHeight()}else b.updateClasses(),s=("auto"===b.params.slidesPerView||b.params.slidesPerView>1)&&b.isEnd&&!b.params.centeredSlides?b.slideTo(b.slides.length-1,0,!1,!0):b.slideTo(b.activeIndex,0,!1,!0);b.params.lazyLoading&&!s&&b.lazy&&b.lazy.load(),b.params.allowSwipeToPrev=a,b.params.allowSwipeToNext=t},b.touchEventsDesktop={start:"mousedown",move:"mousemove",end:"mouseup"},window.navigator.pointerEnabled?b.touchEventsDesktop={start:"pointerdown",move:"pointermove",end:"pointerup"}:window.navigator.msPointerEnabled&&(b.touchEventsDesktop={start:"MSPointerDown",move:"MSPointerMove",end:"MSPointerUp"}),b.touchEvents={start:b.support.touch||!b.params.simulateTouch?"touchstart":b.touchEventsDesktop.start,move:b.support.touch||!b.params.simulateTouch?"touchmove":b.touchEventsDesktop.move,end:b.support.touch||!b.params.simulateTouch?"touchend":b.touchEventsDesktop.end},(window.navigator.pointerEnabled||window.navigator.msPointerEnabled)&&("container"===b.params.touchEventsTarget?b.container:b.wrapper).addClass("swiper-wp8-"+b.params.direction),b.initEvents=function(e){var a=e?"off":"on",t=e?"removeEventListener":"addEventListener",s="container"===b.params.touchEventsTarget?b.container[0]:b.wrapper[0],r=b.support.touch?s:document,n=!!b.params.nested;if(b.browser.ie)s[t](b.touchEvents.start,b.onTouchStart,!1),r[t](b.touchEvents.move,b.onTouchMove,n),r[t](b.touchEvents.end,b.onTouchEnd,!1);else{if(b.support.touch){var o=!("touchstart"!==b.touchEvents.start||!b.support.passiveListener||!b.params.passiveListeners)&&{passive:!0,capture:!1};s[t](b.touchEvents.start,b.onTouchStart,o),s[t](b.touchEvents.move,b.onTouchMove,n),s[t](b.touchEvents.end,b.onTouchEnd,o)}(i.simulateTouch&&!b.device.ios&&!b.device.android||i.simulateTouch&&!b.support.touch&&b.device.ios)&&(s[t]("mousedown",b.onTouchStart,!1),document[t]("mousemove",b.onTouchMove,n),document[t]("mouseup",b.onTouchEnd,!1))}window[t]("resize",b.onResize),b.params.nextButton&&b.nextButton&&b.nextButton.length>0&&(b.nextButton[a]("click",b.onClickNext),b.params.a11y&&b.a11y&&b.nextButton[a]("keydown",b.a11y.onEnterKey)),b.params.prevButton&&b.prevButton&&b.prevButton.length>0&&(b.prevButton[a]("click",b.onClickPrev),b.params.a11y&&b.a11y&&b.prevButton[a]("keydown",b.a11y.onEnterKey)),b.params.pagination&&b.params.paginationClickable&&(b.paginationContainer[a]("click","."+b.params.bulletClass,b.onClickIndex),b.params.a11y&&b.a11y&&b.paginationContainer[a]("keydown","."+b.params.bulletClass,b.a11y.onEnterKey)),(b.params.preventClicks||b.params.preventClicksPropagation)&&s[t]("click",b.preventClicks,!0);
},b.attachEvents=function(){b.initEvents()},b.detachEvents=function(){b.initEvents(!0)},b.allowClick=!0,b.preventClicks=function(e){b.allowClick||(b.params.preventClicks&&e.preventDefault(),b.params.preventClicksPropagation&&b.animating&&(e.stopPropagation(),e.stopImmediatePropagation()))},b.onClickNext=function(e){e.preventDefault(),b.isEnd&&!b.params.loop||b.slideNext()},b.onClickPrev=function(e){e.preventDefault(),b.isBeginning&&!b.params.loop||b.slidePrev()},b.onClickIndex=function(e){e.preventDefault();var t=a(this).index()*b.params.slidesPerGroup;b.params.loop&&(t+=b.loopedSlides),b.slideTo(t)},b.updateClickedSlide=function(e){var t=o(e,"."+b.params.slideClass),s=!1;if(t)for(var i=0;i<b.slides.length;i++)b.slides[i]===t&&(s=!0);if(!t||!s)return b.clickedSlide=void 0,void(b.clickedIndex=void 0);if(b.clickedSlide=t,b.clickedIndex=a(t).index(),b.params.slideToClickedSlide&&void 0!==b.clickedIndex&&b.clickedIndex!==b.activeIndex){var r,n=b.clickedIndex,l="auto"===b.params.slidesPerView?b.currentSlidesPerView():b.params.slidesPerView;if(b.params.loop){if(b.animating)return;r=parseInt(a(b.clickedSlide).attr("data-swiper-slide-index"),10),b.params.centeredSlides?n<b.loopedSlides-l/2||n>b.slides.length-b.loopedSlides+l/2?(b.fixLoop(),n=b.wrapper.children("."+b.params.slideClass+'[data-swiper-slide-index="'+r+'"]:not(.'+b.params.slideDuplicateClass+")").eq(0).index(),setTimeout(function(){b.slideTo(n)},0)):b.slideTo(n):n>b.slides.length-l?(b.fixLoop(),n=b.wrapper.children("."+b.params.slideClass+'[data-swiper-slide-index="'+r+'"]:not(.'+b.params.slideDuplicateClass+")").eq(0).index(),setTimeout(function(){b.slideTo(n)},0)):b.slideTo(n)}else b.slideTo(n)}};var C,z,M,E,P,I,k,L,D,B,H="input, select, textarea, button, video",G=Date.now(),X=[];b.animating=!1,b.touches={startX:0,startY:0,currentX:0,currentY:0,diff:0};var Y,A;b.onTouchStart=function(e){if(e.originalEvent&&(e=e.originalEvent),Y="touchstart"===e.type,Y||!("which"in e)||3!==e.which){if(b.params.noSwiping&&o(e,"."+b.params.noSwipingClass))return void(b.allowClick=!0);if(!b.params.swipeHandler||o(e,b.params.swipeHandler)){var t=b.touches.currentX="touchstart"===e.type?e.targetTouches[0].pageX:e.pageX,s=b.touches.currentY="touchstart"===e.type?e.targetTouches[0].pageY:e.pageY;if(!(b.device.ios&&b.params.iOSEdgeSwipeDetection&&t<=b.params.iOSEdgeSwipeThreshold)){if(C=!0,z=!1,M=!0,P=void 0,A=void 0,b.touches.startX=t,b.touches.startY=s,E=Date.now(),b.allowClick=!0,b.updateContainerSize(),b.swipeDirection=void 0,b.params.threshold>0&&(L=!1),"touchstart"!==e.type){var i=!0;a(e.target).is(H)&&(i=!1),document.activeElement&&a(document.activeElement).is(H)&&document.activeElement.blur(),i&&e.preventDefault()}b.emit("onTouchStart",b,e)}}}},b.onTouchMove=function(e){if(e.originalEvent&&(e=e.originalEvent),!Y||"mousemove"!==e.type){if(e.preventedByNestedSwiper)return b.touches.startX="touchmove"===e.type?e.targetTouches[0].pageX:e.pageX,void(b.touches.startY="touchmove"===e.type?e.targetTouches[0].pageY:e.pageY);if(b.params.onlyExternal)return b.allowClick=!1,void(C&&(b.touches.startX=b.touches.currentX="touchmove"===e.type?e.targetTouches[0].pageX:e.pageX,b.touches.startY=b.touches.currentY="touchmove"===e.type?e.targetTouches[0].pageY:e.pageY,E=Date.now()));if(Y&&b.params.touchReleaseOnEdges&&!b.params.loop)if(b.isHorizontal()){if(b.touches.currentX<b.touches.startX&&b.translate<=b.maxTranslate()||b.touches.currentX>b.touches.startX&&b.translate>=b.minTranslate())return}else if(b.touches.currentY<b.touches.startY&&b.translate<=b.maxTranslate()||b.touches.currentY>b.touches.startY&&b.translate>=b.minTranslate())return;if(Y&&document.activeElement&&e.target===document.activeElement&&a(e.target).is(H))return z=!0,void(b.allowClick=!1);if(M&&b.emit("onTouchMove",b,e),!(e.targetTouches&&e.targetTouches.length>1)){if(b.touches.currentX="touchmove"===e.type?e.targetTouches[0].pageX:e.pageX,b.touches.currentY="touchmove"===e.type?e.targetTouches[0].pageY:e.pageY,"undefined"==typeof P){var t;b.isHorizontal()&&b.touches.currentY===b.touches.startY||!b.isHorizontal()&&b.touches.currentX===b.touches.startX?P=!1:(t=180*Math.atan2(Math.abs(b.touches.currentY-b.touches.startY),Math.abs(b.touches.currentX-b.touches.startX))/Math.PI,P=b.isHorizontal()?t>b.params.touchAngle:90-t>b.params.touchAngle)}if(P&&b.emit("onTouchMoveOpposite",b,e),"undefined"==typeof A&&b.browser.ieTouch&&(b.touches.currentX===b.touches.startX&&b.touches.currentY===b.touches.startY||(A=!0)),C){if(P)return void(C=!1);if(A||!b.browser.ieTouch){b.allowClick=!1,b.emit("onSliderMove",b,e),e.preventDefault(),b.params.touchMoveStopPropagation&&!b.params.nested&&e.stopPropagation(),z||(i.loop&&b.fixLoop(),k=b.getWrapperTranslate(),b.setWrapperTransition(0),b.animating&&b.wrapper.trigger("webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd"),b.params.autoplay&&b.autoplaying&&(b.params.autoplayDisableOnInteraction?b.stopAutoplay():b.pauseAutoplay()),B=!1,!b.params.grabCursor||b.params.allowSwipeToNext!==!0&&b.params.allowSwipeToPrev!==!0||b.setGrabCursor(!0)),z=!0;var s=b.touches.diff=b.isHorizontal()?b.touches.currentX-b.touches.startX:b.touches.currentY-b.touches.startY;s*=b.params.touchRatio,b.rtl&&(s=-s),b.swipeDirection=s>0?"prev":"next",I=s+k;var r=!0;if(s>0&&I>b.minTranslate()?(r=!1,b.params.resistance&&(I=b.minTranslate()-1+Math.pow(-b.minTranslate()+k+s,b.params.resistanceRatio))):s<0&&I<b.maxTranslate()&&(r=!1,b.params.resistance&&(I=b.maxTranslate()+1-Math.pow(b.maxTranslate()-k-s,b.params.resistanceRatio))),r&&(e.preventedByNestedSwiper=!0),!b.params.allowSwipeToNext&&"next"===b.swipeDirection&&I<k&&(I=k),!b.params.allowSwipeToPrev&&"prev"===b.swipeDirection&&I>k&&(I=k),b.params.threshold>0){if(!(Math.abs(s)>b.params.threshold||L))return void(I=k);if(!L)return L=!0,b.touches.startX=b.touches.currentX,b.touches.startY=b.touches.currentY,I=k,void(b.touches.diff=b.isHorizontal()?b.touches.currentX-b.touches.startX:b.touches.currentY-b.touches.startY)}b.params.followFinger&&((b.params.freeMode||b.params.watchSlidesProgress)&&b.updateActiveIndex(),b.params.freeMode&&(0===X.length&&X.push({position:b.touches[b.isHorizontal()?"startX":"startY"],time:E}),X.push({position:b.touches[b.isHorizontal()?"currentX":"currentY"],time:(new window.Date).getTime()})),b.updateProgress(I),b.setWrapperTranslate(I))}}}}},b.onTouchEnd=function(e){if(e.originalEvent&&(e=e.originalEvent),M&&b.emit("onTouchEnd",b,e),M=!1,C){b.params.grabCursor&&z&&C&&(b.params.allowSwipeToNext===!0||b.params.allowSwipeToPrev===!0)&&b.setGrabCursor(!1);var t=Date.now(),s=t-E;if(b.allowClick&&(b.updateClickedSlide(e),b.emit("onTap",b,e),s<300&&t-G>300&&(D&&clearTimeout(D),D=setTimeout(function(){b&&(b.params.paginationHide&&b.paginationContainer.length>0&&!a(e.target).hasClass(b.params.bulletClass)&&b.paginationContainer.toggleClass(b.params.paginationHiddenClass),b.emit("onClick",b,e))},300)),s<300&&t-G<300&&(D&&clearTimeout(D),b.emit("onDoubleTap",b,e))),G=Date.now(),setTimeout(function(){b&&(b.allowClick=!0)},0),!C||!z||!b.swipeDirection||0===b.touches.diff||I===k)return void(C=z=!1);C=z=!1;var i;if(i=b.params.followFinger?b.rtl?b.translate:-b.translate:-I,b.params.freeMode){if(i<-b.minTranslate())return void b.slideTo(b.activeIndex);if(i>-b.maxTranslate())return void(b.slides.length<b.snapGrid.length?b.slideTo(b.snapGrid.length-1):b.slideTo(b.slides.length-1));if(b.params.freeModeMomentum){if(X.length>1){var r=X.pop(),n=X.pop(),o=r.position-n.position,l=r.time-n.time;b.velocity=o/l,b.velocity=b.velocity/2,Math.abs(b.velocity)<b.params.freeModeMinimumVelocity&&(b.velocity=0),(l>150||(new window.Date).getTime()-r.time>300)&&(b.velocity=0)}else b.velocity=0;b.velocity=b.velocity*b.params.freeModeMomentumVelocityRatio,X.length=0;var p=1e3*b.params.freeModeMomentumRatio,d=b.velocity*p,u=b.translate+d;b.rtl&&(u=-u);var c,m=!1,h=20*Math.abs(b.velocity)*b.params.freeModeMomentumBounceRatio;if(u<b.maxTranslate())b.params.freeModeMomentumBounce?(u+b.maxTranslate()<-h&&(u=b.maxTranslate()-h),c=b.maxTranslate(),m=!0,B=!0):u=b.maxTranslate();else if(u>b.minTranslate())b.params.freeModeMomentumBounce?(u-b.minTranslate()>h&&(u=b.minTranslate()+h),c=b.minTranslate(),m=!0,B=!0):u=b.minTranslate();else if(b.params.freeModeSticky){var g,f=0;for(f=0;f<b.snapGrid.length;f+=1)if(b.snapGrid[f]>-u){g=f;break}u=Math.abs(b.snapGrid[g]-u)<Math.abs(b.snapGrid[g-1]-u)||"next"===b.swipeDirection?b.snapGrid[g]:b.snapGrid[g-1],b.rtl||(u=-u)}if(0!==b.velocity)p=b.rtl?Math.abs((-u-b.translate)/b.velocity):Math.abs((u-b.translate)/b.velocity);else if(b.params.freeModeSticky)return void b.slideReset();b.params.freeModeMomentumBounce&&m?(b.updateProgress(c),b.setWrapperTransition(p),b.setWrapperTranslate(u),b.onTransitionStart(),b.animating=!0,b.wrapper.transitionEnd(function(){b&&B&&(b.emit("onMomentumBounce",b),b.setWrapperTransition(b.params.speed),b.setWrapperTranslate(c),b.wrapper.transitionEnd(function(){b&&b.onTransitionEnd()}))})):b.velocity?(b.updateProgress(u),b.setWrapperTransition(p),b.setWrapperTranslate(u),b.onTransitionStart(),b.animating||(b.animating=!0,b.wrapper.transitionEnd(function(){b&&b.onTransitionEnd()}))):b.updateProgress(u),b.updateActiveIndex()}return void((!b.params.freeModeMomentum||s>=b.params.longSwipesMs)&&(b.updateProgress(),b.updateActiveIndex()))}var v,w=0,y=b.slidesSizesGrid[0];for(v=0;v<b.slidesGrid.length;v+=b.params.slidesPerGroup)"undefined"!=typeof b.slidesGrid[v+b.params.slidesPerGroup]?i>=b.slidesGrid[v]&&i<b.slidesGrid[v+b.params.slidesPerGroup]&&(w=v,y=b.slidesGrid[v+b.params.slidesPerGroup]-b.slidesGrid[v]):i>=b.slidesGrid[v]&&(w=v,y=b.slidesGrid[b.slidesGrid.length-1]-b.slidesGrid[b.slidesGrid.length-2]);var x=(i-b.slidesGrid[w])/y;if(s>b.params.longSwipesMs){if(!b.params.longSwipes)return void b.slideTo(b.activeIndex);"next"===b.swipeDirection&&(x>=b.params.longSwipesRatio?b.slideTo(w+b.params.slidesPerGroup):b.slideTo(w)),"prev"===b.swipeDirection&&(x>1-b.params.longSwipesRatio?b.slideTo(w+b.params.slidesPerGroup):b.slideTo(w))}else{if(!b.params.shortSwipes)return void b.slideTo(b.activeIndex);"next"===b.swipeDirection&&b.slideTo(w+b.params.slidesPerGroup),"prev"===b.swipeDirection&&b.slideTo(w)}}},b._slideTo=function(e,a){return b.slideTo(e,a,!0,!0)},b.slideTo=function(e,a,t,s){"undefined"==typeof t&&(t=!0),"undefined"==typeof e&&(e=0),e<0&&(e=0),b.snapIndex=Math.floor(e/b.params.slidesPerGroup),b.snapIndex>=b.snapGrid.length&&(b.snapIndex=b.snapGrid.length-1);var i=-b.snapGrid[b.snapIndex];if(b.params.autoplay&&b.autoplaying&&(s||!b.params.autoplayDisableOnInteraction?b.pauseAutoplay(a):b.stopAutoplay()),b.updateProgress(i),b.params.normalizeSlideIndex)for(var r=0;r<b.slidesGrid.length;r++)-Math.floor(100*i)>=Math.floor(100*b.slidesGrid[r])&&(e=r);return!(!b.params.allowSwipeToNext&&i<b.translate&&i<b.minTranslate())&&(!(!b.params.allowSwipeToPrev&&i>b.translate&&i>b.maxTranslate()&&(b.activeIndex||0)!==e)&&("undefined"==typeof a&&(a=b.params.speed),b.previousIndex=b.activeIndex||0,b.activeIndex=e,b.updateRealIndex(),b.rtl&&-i===b.translate||!b.rtl&&i===b.translate?(b.params.autoHeight&&b.updateAutoHeight(),b.updateClasses(),"slide"!==b.params.effect&&b.setWrapperTranslate(i),!1):(b.updateClasses(),b.onTransitionStart(t),0===a||b.browser.lteIE9?(b.setWrapperTranslate(i),b.setWrapperTransition(0),b.onTransitionEnd(t)):(b.setWrapperTranslate(i),b.setWrapperTransition(a),b.animating||(b.animating=!0,b.wrapper.transitionEnd(function(){b&&b.onTransitionEnd(t)}))),!0)))},b.onTransitionStart=function(e){"undefined"==typeof e&&(e=!0),b.params.autoHeight&&b.updateAutoHeight(),b.lazy&&b.lazy.onTransitionStart(),e&&(b.emit("onTransitionStart",b),b.activeIndex!==b.previousIndex&&(b.emit("onSlideChangeStart",b),b.activeIndex>b.previousIndex?b.emit("onSlideNextStart",b):b.emit("onSlidePrevStart",b)))},b.onTransitionEnd=function(e){b.animating=!1,b.setWrapperTransition(0),"undefined"==typeof e&&(e=!0),b.lazy&&b.lazy.onTransitionEnd(),e&&(b.emit("onTransitionEnd",b),b.activeIndex!==b.previousIndex&&(b.emit("onSlideChangeEnd",b),b.activeIndex>b.previousIndex?b.emit("onSlideNextEnd",b):b.emit("onSlidePrevEnd",b))),b.params.history&&b.history&&b.history.setHistory(b.params.history,b.activeIndex),b.params.hashnav&&b.hashnav&&b.hashnav.setHash()},b.slideNext=function(e,a,t){if(b.params.loop){if(b.animating)return!1;b.fixLoop();b.container[0].clientLeft;return b.slideTo(b.activeIndex+b.params.slidesPerGroup,a,e,t)}return b.slideTo(b.activeIndex+b.params.slidesPerGroup,a,e,t)},b._slideNext=function(e){return b.slideNext(!0,e,!0)},b.slidePrev=function(e,a,t){if(b.params.loop){if(b.animating)return!1;b.fixLoop();b.container[0].clientLeft;return b.slideTo(b.activeIndex-1,a,e,t)}return b.slideTo(b.activeIndex-1,a,e,t)},b._slidePrev=function(e){return b.slidePrev(!0,e,!0)},b.slideReset=function(e,a,t){return b.slideTo(b.activeIndex,a,e)},b.disableTouchControl=function(){return b.params.onlyExternal=!0,!0},b.enableTouchControl=function(){return b.params.onlyExternal=!1,!0},b.setWrapperTransition=function(e,a){b.wrapper.transition(e),"slide"!==b.params.effect&&b.effects[b.params.effect]&&b.effects[b.params.effect].setTransition(e),b.params.parallax&&b.parallax&&b.parallax.setTransition(e),b.params.scrollbar&&b.scrollbar&&b.scrollbar.setTransition(e),b.params.control&&b.controller&&b.controller.setTransition(e,a),b.emit("onSetTransition",b,e)},b.setWrapperTranslate=function(e,a,t){var s=0,i=0,n=0;b.isHorizontal()?s=b.rtl?-e:e:i=e,b.params.roundLengths&&(s=r(s),i=r(i)),b.params.virtualTranslate||(b.support.transforms3d?b.wrapper.transform("translate3d("+s+"px, "+i+"px, "+n+"px)"):b.wrapper.transform("translate("+s+"px, "+i+"px)")),b.translate=b.isHorizontal()?s:i;var o,l=b.maxTranslate()-b.minTranslate();o=0===l?0:(e-b.minTranslate())/l,o!==b.progress&&b.updateProgress(e),a&&b.updateActiveIndex(),"slide"!==b.params.effect&&b.effects[b.params.effect]&&b.effects[b.params.effect].setTranslate(b.translate),b.params.parallax&&b.parallax&&b.parallax.setTranslate(b.translate),b.params.scrollbar&&b.scrollbar&&b.scrollbar.setTranslate(b.translate),b.params.control&&b.controller&&b.controller.setTranslate(b.translate,t),b.emit("onSetTranslate",b,b.translate)},b.getTranslate=function(e,a){var t,s,i,r;return"undefined"==typeof a&&(a="x"),b.params.virtualTranslate?b.rtl?-b.translate:b.translate:(i=window.getComputedStyle(e,null),window.WebKitCSSMatrix?(s=i.transform||i.webkitTransform,s.split(",").length>6&&(s=s.split(", ").map(function(e){return e.replace(",",".")}).join(", ")),r=new window.WebKitCSSMatrix("none"===s?"":s)):(r=i.MozTransform||i.OTransform||i.MsTransform||i.msTransform||i.transform||i.getPropertyValue("transform").replace("translate(","matrix(1, 0, 0, 1,"),t=r.toString().split(",")),"x"===a&&(s=window.WebKitCSSMatrix?r.m41:16===t.length?parseFloat(t[12]):parseFloat(t[4])),"y"===a&&(s=window.WebKitCSSMatrix?r.m42:16===t.length?parseFloat(t[13]):parseFloat(t[5])),b.rtl&&s&&(s=-s),s||0)},b.getWrapperTranslate=function(e){return"undefined"==typeof e&&(e=b.isHorizontal()?"x":"y"),b.getTranslate(b.wrapper[0],e)},b.observers=[],b.initObservers=function(){if(b.params.observeParents)for(var e=b.container.parents(),a=0;a<e.length;a++)l(e[a]);l(b.container[0],{childList:!1}),l(b.wrapper[0],{attributes:!1})},b.disconnectObservers=function(){for(var e=0;e<b.observers.length;e++)b.observers[e].disconnect();b.observers=[]},b.createLoop=function(){b.wrapper.children("."+b.params.slideClass+"."+b.params.slideDuplicateClass).remove();var e=b.wrapper.children("."+b.params.slideClass);"auto"!==b.params.slidesPerView||b.params.loopedSlides||(b.params.loopedSlides=e.length),b.loopedSlides=parseInt(b.params.loopedSlides||b.params.slidesPerView,10),b.loopedSlides=b.loopedSlides+b.params.loopAdditionalSlides,b.loopedSlides>e.length&&(b.loopedSlides=e.length);var t,s=[],i=[];for(e.each(function(t,r){var n=a(this);t<b.loopedSlides&&i.push(r),t<e.length&&t>=e.length-b.loopedSlides&&s.push(r),n.attr("data-swiper-slide-index",t)}),t=0;t<i.length;t++)b.wrapper.append(a(i[t].cloneNode(!0)).addClass(b.params.slideDuplicateClass));for(t=s.length-1;t>=0;t--)b.wrapper.prepend(a(s[t].cloneNode(!0)).addClass(b.params.slideDuplicateClass))},b.destroyLoop=function(){b.wrapper.children("."+b.params.slideClass+"."+b.params.slideDuplicateClass).remove(),b.slides.removeAttr("data-swiper-slide-index")},b.reLoop=function(e){var a=b.activeIndex-b.loopedSlides;b.destroyLoop(),b.createLoop(),b.updateSlidesSize(),e&&b.slideTo(a+b.loopedSlides,0,!1)},b.fixLoop=function(){var e;b.activeIndex<b.loopedSlides?(e=b.slides.length-3*b.loopedSlides+b.activeIndex,e+=b.loopedSlides,b.slideTo(e,0,!1,!0)):("auto"===b.params.slidesPerView&&b.activeIndex>=2*b.loopedSlides||b.activeIndex>b.slides.length-2*b.params.slidesPerView)&&(e=-b.slides.length+b.activeIndex+b.loopedSlides,e+=b.loopedSlides,b.slideTo(e,0,!1,!0))},b.appendSlide=function(e){if(b.params.loop&&b.destroyLoop(),"object"==typeof e&&e.length)for(var a=0;a<e.length;a++)e[a]&&b.wrapper.append(e[a]);else b.wrapper.append(e);b.params.loop&&b.createLoop(),b.params.observer&&b.support.observer||b.update(!0)},b.prependSlide=function(e){b.params.loop&&b.destroyLoop();var a=b.activeIndex+1;if("object"==typeof e&&e.length){for(var t=0;t<e.length;t++)e[t]&&b.wrapper.prepend(e[t]);a=b.activeIndex+e.length}else b.wrapper.prepend(e);b.params.loop&&b.createLoop(),b.params.observer&&b.support.observer||b.update(!0),b.slideTo(a,0,!1)},b.removeSlide=function(e){b.params.loop&&(b.destroyLoop(),b.slides=b.wrapper.children("."+b.params.slideClass));var a,t=b.activeIndex;if("object"==typeof e&&e.length){for(var s=0;s<e.length;s++)a=e[s],b.slides[a]&&b.slides.eq(a).remove(),a<t&&t--;t=Math.max(t,0)}else a=e,b.slides[a]&&b.slides.eq(a).remove(),a<t&&t--,t=Math.max(t,0);b.params.loop&&b.createLoop(),b.params.observer&&b.support.observer||b.update(!0),b.params.loop?b.slideTo(t+b.loopedSlides,0,!1):b.slideTo(t,0,!1)},b.removeAllSlides=function(){for(var e=[],a=0;a<b.slides.length;a++)e.push(a);b.removeSlide(e)},b.effects={fade:{setTranslate:function(){for(var e=0;e<b.slides.length;e++){var a=b.slides.eq(e),t=a[0].swiperSlideOffset,s=-t;b.params.virtualTranslate||(s-=b.translate);var i=0;b.isHorizontal()||(i=s,s=0);var r=b.params.fade.crossFade?Math.max(1-Math.abs(a[0].progress),0):1+Math.min(Math.max(a[0].progress,-1),0);a.css({opacity:r}).transform("translate3d("+s+"px, "+i+"px, 0px)")}},setTransition:function(e){if(b.slides.transition(e),b.params.virtualTranslate&&0!==e){var a=!1;b.slides.transitionEnd(function(){if(!a&&b){a=!0,b.animating=!1;for(var e=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],t=0;t<e.length;t++)b.wrapper.trigger(e[t])}})}}},flip:{setTranslate:function(){for(var e=0;e<b.slides.length;e++){var t=b.slides.eq(e),s=t[0].progress;b.params.flip.limitRotation&&(s=Math.max(Math.min(t[0].progress,1),-1));var i=t[0].swiperSlideOffset,r=-180*s,n=r,o=0,l=-i,p=0;if(b.isHorizontal()?b.rtl&&(n=-n):(p=l,l=0,o=-n,n=0),t[0].style.zIndex=-Math.abs(Math.round(s))+b.slides.length,b.params.flip.slideShadows){var d=b.isHorizontal()?t.find(".swiper-slide-shadow-left"):t.find(".swiper-slide-shadow-top"),u=b.isHorizontal()?t.find(".swiper-slide-shadow-right"):t.find(".swiper-slide-shadow-bottom");0===d.length&&(d=a('<div class="swiper-slide-shadow-'+(b.isHorizontal()?"left":"top")+'"></div>'),t.append(d)),0===u.length&&(u=a('<div class="swiper-slide-shadow-'+(b.isHorizontal()?"right":"bottom")+'"></div>'),t.append(u)),d.length&&(d[0].style.opacity=Math.max(-s,0)),u.length&&(u[0].style.opacity=Math.max(s,0))}t.transform("translate3d("+l+"px, "+p+"px, 0px) rotateX("+o+"deg) rotateY("+n+"deg)")}},setTransition:function(e){if(b.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e),b.params.virtualTranslate&&0!==e){var t=!1;b.slides.eq(b.activeIndex).transitionEnd(function(){if(!t&&b&&a(this).hasClass(b.params.slideActiveClass)){t=!0,b.animating=!1;for(var e=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],s=0;s<e.length;s++)b.wrapper.trigger(e[s])}})}}},cube:{setTranslate:function(){var e,t=0;b.params.cube.shadow&&(b.isHorizontal()?(e=b.wrapper.find(".swiper-cube-shadow"),0===e.length&&(e=a('<div class="swiper-cube-shadow"></div>'),b.wrapper.append(e)),e.css({height:b.width+"px"})):(e=b.container.find(".swiper-cube-shadow"),0===e.length&&(e=a('<div class="swiper-cube-shadow"></div>'),b.container.append(e))));for(var s=0;s<b.slides.length;s++){var i=b.slides.eq(s),r=90*s,n=Math.floor(r/360);b.rtl&&(r=-r,n=Math.floor(-r/360));var o=Math.max(Math.min(i[0].progress,1),-1),l=0,p=0,d=0;s%4===0?(l=4*-n*b.size,d=0):(s-1)%4===0?(l=0,d=4*-n*b.size):(s-2)%4===0?(l=b.size+4*n*b.size,d=b.size):(s-3)%4===0&&(l=-b.size,d=3*b.size+4*b.size*n),b.rtl&&(l=-l),b.isHorizontal()||(p=l,l=0);var u="rotateX("+(b.isHorizontal()?0:-r)+"deg) rotateY("+(b.isHorizontal()?r:0)+"deg) translate3d("+l+"px, "+p+"px, "+d+"px)";if(o<=1&&o>-1&&(t=90*s+90*o,b.rtl&&(t=90*-s-90*o)),i.transform(u),b.params.cube.slideShadows){var c=b.isHorizontal()?i.find(".swiper-slide-shadow-left"):i.find(".swiper-slide-shadow-top"),m=b.isHorizontal()?i.find(".swiper-slide-shadow-right"):i.find(".swiper-slide-shadow-bottom");0===c.length&&(c=a('<div class="swiper-slide-shadow-'+(b.isHorizontal()?"left":"top")+'"></div>'),i.append(c)),0===m.length&&(m=a('<div class="swiper-slide-shadow-'+(b.isHorizontal()?"right":"bottom")+'"></div>'),i.append(m)),c.length&&(c[0].style.opacity=Math.max(-o,0)),m.length&&(m[0].style.opacity=Math.max(o,0))}}if(b.wrapper.css({"-webkit-transform-origin":"50% 50% -"+b.size/2+"px","-moz-transform-origin":"50% 50% -"+b.size/2+"px","-ms-transform-origin":"50% 50% -"+b.size/2+"px","transform-origin":"50% 50% -"+b.size/2+"px"}),b.params.cube.shadow)if(b.isHorizontal())e.transform("translate3d(0px, "+(b.width/2+b.params.cube.shadowOffset)+"px, "+-b.width/2+"px) rotateX(90deg) rotateZ(0deg) scale("+b.params.cube.shadowScale+")");else{var h=Math.abs(t)-90*Math.floor(Math.abs(t)/90),g=1.5-(Math.sin(2*h*Math.PI/360)/2+Math.cos(2*h*Math.PI/360)/2),f=b.params.cube.shadowScale,v=b.params.cube.shadowScale/g,w=b.params.cube.shadowOffset;e.transform("scale3d("+f+", 1, "+v+") translate3d(0px, "+(b.height/2+w)+"px, "+-b.height/2/v+"px) rotateX(-90deg)")}var y=b.isSafari||b.isUiWebView?-b.size/2:0;b.wrapper.transform("translate3d(0px,0,"+y+"px) rotateX("+(b.isHorizontal()?0:t)+"deg) rotateY("+(b.isHorizontal()?-t:0)+"deg)")},setTransition:function(e){b.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e),b.params.cube.shadow&&!b.isHorizontal()&&b.container.find(".swiper-cube-shadow").transition(e)}},coverflow:{setTranslate:function(){for(var e=b.translate,t=b.isHorizontal()?-e+b.width/2:-e+b.height/2,s=b.isHorizontal()?b.params.coverflow.rotate:-b.params.coverflow.rotate,i=b.params.coverflow.depth,r=0,n=b.slides.length;r<n;r++){var o=b.slides.eq(r),l=b.slidesSizesGrid[r],p=o[0].swiperSlideOffset,d=(t-p-l/2)/l*b.params.coverflow.modifier,u=b.isHorizontal()?s*d:0,c=b.isHorizontal()?0:s*d,m=-i*Math.abs(d),h=b.isHorizontal()?0:b.params.coverflow.stretch*d,g=b.isHorizontal()?b.params.coverflow.stretch*d:0;Math.abs(g)<.001&&(g=0),Math.abs(h)<.001&&(h=0),Math.abs(m)<.001&&(m=0),Math.abs(u)<.001&&(u=0),Math.abs(c)<.001&&(c=0);var f="translate3d("+g+"px,"+h+"px,"+m+"px)  rotateX("+c+"deg) rotateY("+u+"deg)";if(o.transform(f),o[0].style.zIndex=-Math.abs(Math.round(d))+1,b.params.coverflow.slideShadows){var v=b.isHorizontal()?o.find(".swiper-slide-shadow-left"):o.find(".swiper-slide-shadow-top"),w=b.isHorizontal()?o.find(".swiper-slide-shadow-right"):o.find(".swiper-slide-shadow-bottom");0===v.length&&(v=a('<div class="swiper-slide-shadow-'+(b.isHorizontal()?"left":"top")+'"></div>'),o.append(v)),0===w.length&&(w=a('<div class="swiper-slide-shadow-'+(b.isHorizontal()?"right":"bottom")+'"></div>'),o.append(w)),v.length&&(v[0].style.opacity=d>0?d:0),w.length&&(w[0].style.opacity=-d>0?-d:0)}}if(b.browser.ie){var y=b.wrapper[0].style;y.perspectiveOrigin=t+"px 50%"}},setTransition:function(e){b.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e)}}},b.lazy={initialImageLoaded:!1,loadImageInSlide:function(e,t){if("undefined"!=typeof e&&("undefined"==typeof t&&(t=!0),0!==b.slides.length)){var s=b.slides.eq(e),i=s.find("."+b.params.lazyLoadingClass+":not(."+b.params.lazyStatusLoadedClass+"):not(."+b.params.lazyStatusLoadingClass+")");!s.hasClass(b.params.lazyLoadingClass)||s.hasClass(b.params.lazyStatusLoadedClass)||s.hasClass(b.params.lazyStatusLoadingClass)||(i=i.add(s[0])),0!==i.length&&i.each(function(){var e=a(this);e.addClass(b.params.lazyStatusLoadingClass);var i=e.attr("data-background"),r=e.attr("data-src"),n=e.attr("data-srcset"),o=e.attr("data-sizes");b.loadImage(e[0],r||i,n,o,!1,function(){if(i?(e.css("background-image",'url("'+i+'")'),e.removeAttr("data-background")):(n&&(e.attr("srcset",n),e.removeAttr("data-srcset")),o&&(e.attr("sizes",o),e.removeAttr("data-sizes")),r&&(e.attr("src",r),e.removeAttr("data-src"))),e.addClass(b.params.lazyStatusLoadedClass).removeClass(b.params.lazyStatusLoadingClass),s.find("."+b.params.lazyPreloaderClass+", ."+b.params.preloaderClass).remove(),b.params.loop&&t){var a=s.attr("data-swiper-slide-index");if(s.hasClass(b.params.slideDuplicateClass)){var l=b.wrapper.children('[data-swiper-slide-index="'+a+'"]:not(.'+b.params.slideDuplicateClass+")");b.lazy.loadImageInSlide(l.index(),!1)}else{var p=b.wrapper.children("."+b.params.slideDuplicateClass+'[data-swiper-slide-index="'+a+'"]');b.lazy.loadImageInSlide(p.index(),!1)}}b.emit("onLazyImageReady",b,s[0],e[0])}),b.emit("onLazyImageLoad",b,s[0],e[0])})}},load:function(){var e,t=b.params.slidesPerView;if("auto"===t&&(t=0),b.lazy.initialImageLoaded||(b.lazy.initialImageLoaded=!0),b.params.watchSlidesVisibility)b.wrapper.children("."+b.params.slideVisibleClass).each(function(){b.lazy.loadImageInSlide(a(this).index())});else if(t>1)for(e=b.activeIndex;e<b.activeIndex+t;e++)b.slides[e]&&b.lazy.loadImageInSlide(e);else b.lazy.loadImageInSlide(b.activeIndex);if(b.params.lazyLoadingInPrevNext)if(t>1||b.params.lazyLoadingInPrevNextAmount&&b.params.lazyLoadingInPrevNextAmount>1){var s=b.params.lazyLoadingInPrevNextAmount,i=t,r=Math.min(b.activeIndex+i+Math.max(s,i),b.slides.length),n=Math.max(b.activeIndex-Math.max(i,s),0);for(e=b.activeIndex+t;e<r;e++)b.slides[e]&&b.lazy.loadImageInSlide(e);for(e=n;e<b.activeIndex;e++)b.slides[e]&&b.lazy.loadImageInSlide(e)}else{var o=b.wrapper.children("."+b.params.slideNextClass);o.length>0&&b.lazy.loadImageInSlide(o.index());var l=b.wrapper.children("."+b.params.slidePrevClass);l.length>0&&b.lazy.loadImageInSlide(l.index())}},onTransitionStart:function(){b.params.lazyLoading&&(b.params.lazyLoadingOnTransitionStart||!b.params.lazyLoadingOnTransitionStart&&!b.lazy.initialImageLoaded)&&b.lazy.load()},onTransitionEnd:function(){b.params.lazyLoading&&!b.params.lazyLoadingOnTransitionStart&&b.lazy.load()}},b.scrollbar={isTouched:!1,setDragPosition:function(e){var a=b.scrollbar,t=b.isHorizontal()?"touchstart"===e.type||"touchmove"===e.type?e.targetTouches[0].pageX:e.pageX||e.clientX:"touchstart"===e.type||"touchmove"===e.type?e.targetTouches[0].pageY:e.pageY||e.clientY,s=t-a.track.offset()[b.isHorizontal()?"left":"top"]-a.dragSize/2,i=-b.minTranslate()*a.moveDivider,r=-b.maxTranslate()*a.moveDivider;s<i?s=i:s>r&&(s=r),s=-s/a.moveDivider,b.updateProgress(s),b.setWrapperTranslate(s,!0)},dragStart:function(e){var a=b.scrollbar;a.isTouched=!0,e.preventDefault(),e.stopPropagation(),a.setDragPosition(e),clearTimeout(a.dragTimeout),a.track.transition(0),b.params.scrollbarHide&&a.track.css("opacity",1),b.wrapper.transition(100),a.drag.transition(100),b.emit("onScrollbarDragStart",b)},dragMove:function(e){var a=b.scrollbar;a.isTouched&&(e.preventDefault?e.preventDefault():e.returnValue=!1,a.setDragPosition(e),b.wrapper.transition(0),a.track.transition(0),a.drag.transition(0),b.emit("onScrollbarDragMove",b))},dragEnd:function(e){var a=b.scrollbar;a.isTouched&&(a.isTouched=!1,b.params.scrollbarHide&&(clearTimeout(a.dragTimeout),a.dragTimeout=setTimeout(function(){a.track.css("opacity",0),a.track.transition(400)},1e3)),b.emit("onScrollbarDragEnd",b),b.params.scrollbarSnapOnRelease&&b.slideReset())},draggableEvents:function(){return b.params.simulateTouch!==!1||b.support.touch?b.touchEvents:b.touchEventsDesktop}(),enableDraggable:function(){var e=b.scrollbar,t=b.support.touch?e.track:document;a(e.track).on(e.draggableEvents.start,e.dragStart),a(t).on(e.draggableEvents.move,e.dragMove),a(t).on(e.draggableEvents.end,e.dragEnd)},disableDraggable:function(){var e=b.scrollbar,t=b.support.touch?e.track:document;a(e.track).off(b.draggableEvents.start,e.dragStart),a(t).off(b.draggableEvents.move,e.dragMove),a(t).off(b.draggableEvents.end,e.dragEnd)},set:function(){if(b.params.scrollbar){var e=b.scrollbar;e.track=a(b.params.scrollbar),b.params.uniqueNavElements&&"string"==typeof b.params.scrollbar&&e.track.length>1&&1===b.container.find(b.params.scrollbar).length&&(e.track=b.container.find(b.params.scrollbar)),e.drag=e.track.find(".swiper-scrollbar-drag"),0===e.drag.length&&(e.drag=a('<div class="swiper-scrollbar-drag"></div>'),e.track.append(e.drag)),e.drag[0].style.width="",e.drag[0].style.height="",e.trackSize=b.isHorizontal()?e.track[0].offsetWidth:e.track[0].offsetHeight,e.divider=b.size/b.virtualSize,e.moveDivider=e.divider*(e.trackSize/b.size),e.dragSize=e.trackSize*e.divider,b.isHorizontal()?e.drag[0].style.width=e.dragSize+"px":e.drag[0].style.height=e.dragSize+"px",e.divider>=1?e.track[0].style.display="none":e.track[0].style.display="",b.params.scrollbarHide&&(e.track[0].style.opacity=0)}},setTranslate:function(){if(b.params.scrollbar){var e,a=b.scrollbar,t=(b.translate||0,a.dragSize);e=(a.trackSize-a.dragSize)*b.progress,b.rtl&&b.isHorizontal()?(e=-e,e>0?(t=a.dragSize-e,e=0):-e+a.dragSize>a.trackSize&&(t=a.trackSize+e)):e<0?(t=a.dragSize+e,e=0):e+a.dragSize>a.trackSize&&(t=a.trackSize-e),b.isHorizontal()?(b.support.transforms3d?a.drag.transform("translate3d("+e+"px, 0, 0)"):a.drag.transform("translateX("+e+"px)"),a.drag[0].style.width=t+"px"):(b.support.transforms3d?a.drag.transform("translate3d(0px, "+e+"px, 0)"):a.drag.transform("translateY("+e+"px)"),a.drag[0].style.height=t+"px"),b.params.scrollbarHide&&(clearTimeout(a.timeout),a.track[0].style.opacity=1,a.timeout=setTimeout(function(){a.track[0].style.opacity=0,a.track.transition(400)},1e3))}},setTransition:function(e){b.params.scrollbar&&b.scrollbar.drag.transition(e)}},b.controller={LinearSpline:function(e,a){this.x=e,this.y=a,this.lastIndex=e.length-1;var t,s;this.x.length;this.interpolate=function(e){return e?(s=i(this.x,e),t=s-1,(e-this.x[t])*(this.y[s]-this.y[t])/(this.x[s]-this.x[t])+this.y[t]):0};var i=function(){var e,a,t;return function(s,i){for(a=-1,e=s.length;e-a>1;)s[t=e+a>>1]<=i?a=t:e=t;return e}}()},getInterpolateFunction:function(e){b.controller.spline||(b.controller.spline=b.params.loop?new b.controller.LinearSpline(b.slidesGrid,e.slidesGrid):new b.controller.LinearSpline(b.snapGrid,e.snapGrid))},setTranslate:function(e,a){function s(a){e=a.rtl&&"horizontal"===a.params.direction?-b.translate:b.translate,"slide"===b.params.controlBy&&(b.controller.getInterpolateFunction(a),r=-b.controller.spline.interpolate(-e)),r&&"container"!==b.params.controlBy||(i=(a.maxTranslate()-a.minTranslate())/(b.maxTranslate()-b.minTranslate()),r=(e-b.minTranslate())*i+a.minTranslate()),b.params.controlInverse&&(r=a.maxTranslate()-r),a.updateProgress(r),a.setWrapperTranslate(r,!1,b),a.updateActiveIndex()}var i,r,n=b.params.control;if(b.isArray(n))for(var o=0;o<n.length;o++)n[o]!==a&&n[o]instanceof t&&s(n[o]);else n instanceof t&&a!==n&&s(n)},setTransition:function(e,a){function s(a){
        a.setWrapperTransition(e,b),0!==e&&(a.onTransitionStart(),a.wrapper.transitionEnd(function(){r&&(a.params.loop&&"slide"===b.params.controlBy&&a.fixLoop(),a.onTransitionEnd())}))}var i,r=b.params.control;if(b.isArray(r))for(i=0;i<r.length;i++)r[i]!==a&&r[i]instanceof t&&s(r[i]);else r instanceof t&&a!==r&&s(r)}},b.hashnav={onHashCange:function(e,a){var t=document.location.hash.replace("#",""),s=b.slides.eq(b.activeIndex).attr("data-hash");t!==s&&b.slideTo(b.wrapper.children("."+b.params.slideClass+'[data-hash="'+t+'"]').index())},attachEvents:function(e){var t=e?"off":"on";a(window)[t]("hashchange",b.hashnav.onHashCange)},setHash:function(){if(b.hashnav.initialized&&b.params.hashnav)if(b.params.replaceState&&window.history&&window.history.replaceState)window.history.replaceState(null,null,"#"+b.slides.eq(b.activeIndex).attr("data-hash")||"");else{var e=b.slides.eq(b.activeIndex),a=e.attr("data-hash")||e.attr("data-history");document.location.hash=a||""}},init:function(){if(b.params.hashnav&&!b.params.history){b.hashnav.initialized=!0;var e=document.location.hash.replace("#","");if(e){for(var a=0,t=0,s=b.slides.length;t<s;t++){var i=b.slides.eq(t),r=i.attr("data-hash")||i.attr("data-history");if(r===e&&!i.hasClass(b.params.slideDuplicateClass)){var n=i.index();b.slideTo(n,a,b.params.runCallbacksOnInit,!0)}}b.params.hashnavWatchState&&b.hashnav.attachEvents()}}},destroy:function(){b.params.hashnavWatchState&&b.hashnav.attachEvents(!0)}},b.history={init:function(){if(b.params.history){if(!window.history||!window.history.pushState)return b.params.history=!1,void(b.params.hashnav=!0);b.history.initialized=!0,this.paths=this.getPathValues(),(this.paths.key||this.paths.value)&&(this.scrollToSlide(0,this.paths.value,b.params.runCallbacksOnInit),b.params.replaceState||window.addEventListener("popstate",this.setHistoryPopState))}},setHistoryPopState:function(){b.history.paths=b.history.getPathValues(),b.history.scrollToSlide(b.params.speed,b.history.paths.value,!1)},getPathValues:function(){var e=window.location.pathname.slice(1).split("/"),a=e.length,t=e[a-2],s=e[a-1];return{key:t,value:s}},setHistory:function(e,a){if(b.history.initialized&&b.params.history){var t=b.slides.eq(a),s=this.slugify(t.attr("data-history"));window.location.pathname.includes(e)||(s=e+"/"+s),b.params.replaceState?window.history.replaceState(null,null,s):window.history.pushState(null,null,s)}},slugify:function(e){return e.toString().toLowerCase().replace(/\s+/g,"-").replace(/[^\w\-]+/g,"").replace(/\-\-+/g,"-").replace(/^-+/,"").replace(/-+$/,"")},scrollToSlide:function(e,a,t){if(a)for(var s=0,i=b.slides.length;s<i;s++){var r=b.slides.eq(s),n=this.slugify(r.attr("data-history"));if(n===a&&!r.hasClass(b.params.slideDuplicateClass)){var o=r.index();b.slideTo(o,e,t)}}else b.slideTo(0,e,t)}},b.disableKeyboardControl=function(){b.params.keyboardControl=!1,a(document).off("keydown",p)},b.enableKeyboardControl=function(){b.params.keyboardControl=!0,a(document).on("keydown",p)},b.mousewheel={event:!1,lastScrollTime:(new window.Date).getTime()},b.params.mousewheelControl&&(b.mousewheel.event=navigator.userAgent.indexOf("firefox")>-1?"DOMMouseScroll":d()?"wheel":"mousewheel"),b.disableMousewheelControl=function(){if(!b.mousewheel.event)return!1;var e=b.container;return"container"!==b.params.mousewheelEventsTarged&&(e=a(b.params.mousewheelEventsTarged)),e.off(b.mousewheel.event,u),!0},b.enableMousewheelControl=function(){if(!b.mousewheel.event)return!1;var e=b.container;return"container"!==b.params.mousewheelEventsTarged&&(e=a(b.params.mousewheelEventsTarged)),e.on(b.mousewheel.event,u),!0},b.parallax={setTranslate:function(){b.container.children("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){m(this,b.progress)}),b.slides.each(function(){var e=a(this);e.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){var a=Math.min(Math.max(e[0].progress,-1),1);m(this,a)})})},setTransition:function(e){"undefined"==typeof e&&(e=b.params.speed),b.container.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){var t=a(this),s=parseInt(t.attr("data-swiper-parallax-duration"),10)||e;0===e&&(s=0),t.transition(s)})}},b.zoom={scale:1,currentScale:1,isScaling:!1,gesture:{slide:void 0,slideWidth:void 0,slideHeight:void 0,image:void 0,imageWrap:void 0,zoomMax:b.params.zoomMax},image:{isTouched:void 0,isMoved:void 0,currentX:void 0,currentY:void 0,minX:void 0,minY:void 0,maxX:void 0,maxY:void 0,width:void 0,height:void 0,startX:void 0,startY:void 0,touchesStart:{},touchesCurrent:{}},velocity:{x:void 0,y:void 0,prevPositionX:void 0,prevPositionY:void 0,prevTime:void 0},getDistanceBetweenTouches:function(e){if(e.targetTouches.length<2)return 1;var a=e.targetTouches[0].pageX,t=e.targetTouches[0].pageY,s=e.targetTouches[1].pageX,i=e.targetTouches[1].pageY,r=Math.sqrt(Math.pow(s-a,2)+Math.pow(i-t,2));return r},onGestureStart:function(e){var t=b.zoom;if(!b.support.gestures){if("touchstart"!==e.type||"touchstart"===e.type&&e.targetTouches.length<2)return;t.gesture.scaleStart=t.getDistanceBetweenTouches(e)}return t.gesture.slide&&t.gesture.slide.length||(t.gesture.slide=a(this),0===t.gesture.slide.length&&(t.gesture.slide=b.slides.eq(b.activeIndex)),t.gesture.image=t.gesture.slide.find("img, svg, canvas"),t.gesture.imageWrap=t.gesture.image.parent("."+b.params.zoomContainerClass),t.gesture.zoomMax=t.gesture.imageWrap.attr("data-swiper-zoom")||b.params.zoomMax,0!==t.gesture.imageWrap.length)?(t.gesture.image.transition(0),void(t.isScaling=!0)):void(t.gesture.image=void 0)},onGestureChange:function(e){var a=b.zoom;if(!b.support.gestures){if("touchmove"!==e.type||"touchmove"===e.type&&e.targetTouches.length<2)return;a.gesture.scaleMove=a.getDistanceBetweenTouches(e)}a.gesture.image&&0!==a.gesture.image.length&&(b.support.gestures?a.scale=e.scale*a.currentScale:a.scale=a.gesture.scaleMove/a.gesture.scaleStart*a.currentScale,a.scale>a.gesture.zoomMax&&(a.scale=a.gesture.zoomMax-1+Math.pow(a.scale-a.gesture.zoomMax+1,.5)),a.scale<b.params.zoomMin&&(a.scale=b.params.zoomMin+1-Math.pow(b.params.zoomMin-a.scale+1,.5)),a.gesture.image.transform("translate3d(0,0,0) scale("+a.scale+")"))},onGestureEnd:function(e){var a=b.zoom;!b.support.gestures&&("touchend"!==e.type||"touchend"===e.type&&e.changedTouches.length<2)||a.gesture.image&&0!==a.gesture.image.length&&(a.scale=Math.max(Math.min(a.scale,a.gesture.zoomMax),b.params.zoomMin),a.gesture.image.transition(b.params.speed).transform("translate3d(0,0,0) scale("+a.scale+")"),a.currentScale=a.scale,a.isScaling=!1,1===a.scale&&(a.gesture.slide=void 0))},onTouchStart:function(e,a){var t=e.zoom;t.gesture.image&&0!==t.gesture.image.length&&(t.image.isTouched||("android"===e.device.os&&a.preventDefault(),t.image.isTouched=!0,t.image.touchesStart.x="touchstart"===a.type?a.targetTouches[0].pageX:a.pageX,t.image.touchesStart.y="touchstart"===a.type?a.targetTouches[0].pageY:a.pageY))},onTouchMove:function(e){var a=b.zoom;if(a.gesture.image&&0!==a.gesture.image.length&&(b.allowClick=!1,a.image.isTouched&&a.gesture.slide)){a.image.isMoved||(a.image.width=a.gesture.image[0].offsetWidth,a.image.height=a.gesture.image[0].offsetHeight,a.image.startX=b.getTranslate(a.gesture.imageWrap[0],"x")||0,a.image.startY=b.getTranslate(a.gesture.imageWrap[0],"y")||0,a.gesture.slideWidth=a.gesture.slide[0].offsetWidth,a.gesture.slideHeight=a.gesture.slide[0].offsetHeight,a.gesture.imageWrap.transition(0),b.rtl&&(a.image.startX=-a.image.startX),b.rtl&&(a.image.startY=-a.image.startY));var t=a.image.width*a.scale,s=a.image.height*a.scale;if(!(t<a.gesture.slideWidth&&s<a.gesture.slideHeight)){if(a.image.minX=Math.min(a.gesture.slideWidth/2-t/2,0),a.image.maxX=-a.image.minX,a.image.minY=Math.min(a.gesture.slideHeight/2-s/2,0),a.image.maxY=-a.image.minY,a.image.touchesCurrent.x="touchmove"===e.type?e.targetTouches[0].pageX:e.pageX,a.image.touchesCurrent.y="touchmove"===e.type?e.targetTouches[0].pageY:e.pageY,!a.image.isMoved&&!a.isScaling){if(b.isHorizontal()&&Math.floor(a.image.minX)===Math.floor(a.image.startX)&&a.image.touchesCurrent.x<a.image.touchesStart.x||Math.floor(a.image.maxX)===Math.floor(a.image.startX)&&a.image.touchesCurrent.x>a.image.touchesStart.x)return void(a.image.isTouched=!1);if(!b.isHorizontal()&&Math.floor(a.image.minY)===Math.floor(a.image.startY)&&a.image.touchesCurrent.y<a.image.touchesStart.y||Math.floor(a.image.maxY)===Math.floor(a.image.startY)&&a.image.touchesCurrent.y>a.image.touchesStart.y)return void(a.image.isTouched=!1)}e.preventDefault(),e.stopPropagation(),a.image.isMoved=!0,a.image.currentX=a.image.touchesCurrent.x-a.image.touchesStart.x+a.image.startX,a.image.currentY=a.image.touchesCurrent.y-a.image.touchesStart.y+a.image.startY,a.image.currentX<a.image.minX&&(a.image.currentX=a.image.minX+1-Math.pow(a.image.minX-a.image.currentX+1,.8)),a.image.currentX>a.image.maxX&&(a.image.currentX=a.image.maxX-1+Math.pow(a.image.currentX-a.image.maxX+1,.8)),a.image.currentY<a.image.minY&&(a.image.currentY=a.image.minY+1-Math.pow(a.image.minY-a.image.currentY+1,.8)),a.image.currentY>a.image.maxY&&(a.image.currentY=a.image.maxY-1+Math.pow(a.image.currentY-a.image.maxY+1,.8)),a.velocity.prevPositionX||(a.velocity.prevPositionX=a.image.touchesCurrent.x),a.velocity.prevPositionY||(a.velocity.prevPositionY=a.image.touchesCurrent.y),a.velocity.prevTime||(a.velocity.prevTime=Date.now()),a.velocity.x=(a.image.touchesCurrent.x-a.velocity.prevPositionX)/(Date.now()-a.velocity.prevTime)/2,a.velocity.y=(a.image.touchesCurrent.y-a.velocity.prevPositionY)/(Date.now()-a.velocity.prevTime)/2,Math.abs(a.image.touchesCurrent.x-a.velocity.prevPositionX)<2&&(a.velocity.x=0),Math.abs(a.image.touchesCurrent.y-a.velocity.prevPositionY)<2&&(a.velocity.y=0),a.velocity.prevPositionX=a.image.touchesCurrent.x,a.velocity.prevPositionY=a.image.touchesCurrent.y,a.velocity.prevTime=Date.now(),a.gesture.imageWrap.transform("translate3d("+a.image.currentX+"px, "+a.image.currentY+"px,0)")}}},onTouchEnd:function(e,a){var t=e.zoom;if(t.gesture.image&&0!==t.gesture.image.length){if(!t.image.isTouched||!t.image.isMoved)return t.image.isTouched=!1,void(t.image.isMoved=!1);t.image.isTouched=!1,t.image.isMoved=!1;var s=300,i=300,r=t.velocity.x*s,n=t.image.currentX+r,o=t.velocity.y*i,l=t.image.currentY+o;0!==t.velocity.x&&(s=Math.abs((n-t.image.currentX)/t.velocity.x)),0!==t.velocity.y&&(i=Math.abs((l-t.image.currentY)/t.velocity.y));var p=Math.max(s,i);t.image.currentX=n,t.image.currentY=l;var d=t.image.width*t.scale,u=t.image.height*t.scale;t.image.minX=Math.min(t.gesture.slideWidth/2-d/2,0),t.image.maxX=-t.image.minX,t.image.minY=Math.min(t.gesture.slideHeight/2-u/2,0),t.image.maxY=-t.image.minY,t.image.currentX=Math.max(Math.min(t.image.currentX,t.image.maxX),t.image.minX),t.image.currentY=Math.max(Math.min(t.image.currentY,t.image.maxY),t.image.minY),t.gesture.imageWrap.transition(p).transform("translate3d("+t.image.currentX+"px, "+t.image.currentY+"px,0)")}},onTransitionEnd:function(e){var a=e.zoom;a.gesture.slide&&e.previousIndex!==e.activeIndex&&(a.gesture.image.transform("translate3d(0,0,0) scale(1)"),a.gesture.imageWrap.transform("translate3d(0,0,0)"),a.gesture.slide=a.gesture.image=a.gesture.imageWrap=void 0,a.scale=a.currentScale=1)},toggleZoom:function(e,t){var s=e.zoom;if(s.gesture.slide||(s.gesture.slide=e.clickedSlide?a(e.clickedSlide):e.slides.eq(e.activeIndex),s.gesture.image=s.gesture.slide.find("img, svg, canvas"),s.gesture.imageWrap=s.gesture.image.parent("."+e.params.zoomContainerClass)),s.gesture.image&&0!==s.gesture.image.length){var i,r,n,o,l,p,d,u,c,m,h,g,f,v,w,y,x,T;"undefined"==typeof s.image.touchesStart.x&&t?(i="touchend"===t.type?t.changedTouches[0].pageX:t.pageX,r="touchend"===t.type?t.changedTouches[0].pageY:t.pageY):(i=s.image.touchesStart.x,r=s.image.touchesStart.y),s.scale&&1!==s.scale?(s.scale=s.currentScale=1,s.gesture.imageWrap.transition(300).transform("translate3d(0,0,0)"),s.gesture.image.transition(300).transform("translate3d(0,0,0) scale(1)"),s.gesture.slide=void 0):(s.scale=s.currentScale=s.gesture.imageWrap.attr("data-swiper-zoom")||e.params.zoomMax,t?(x=s.gesture.slide[0].offsetWidth,T=s.gesture.slide[0].offsetHeight,n=s.gesture.slide.offset().left,o=s.gesture.slide.offset().top,l=n+x/2-i,p=o+T/2-r,c=s.gesture.image[0].offsetWidth,m=s.gesture.image[0].offsetHeight,h=c*s.scale,g=m*s.scale,f=Math.min(x/2-h/2,0),v=Math.min(T/2-g/2,0),w=-f,y=-v,d=l*s.scale,u=p*s.scale,d<f&&(d=f),d>w&&(d=w),u<v&&(u=v),u>y&&(u=y)):(d=0,u=0),s.gesture.imageWrap.transition(300).transform("translate3d("+d+"px, "+u+"px,0)"),s.gesture.image.transition(300).transform("translate3d(0,0,0) scale("+s.scale+")"))}},attachEvents:function(e){var t=e?"off":"on";if(b.params.zoom){var s=(b.slides,!("touchstart"!==b.touchEvents.start||!b.support.passiveListener||!b.params.passiveListeners)&&{passive:!0,capture:!1});b.support.gestures?(b.slides[t]("gesturestart",b.zoom.onGestureStart,s),b.slides[t]("gesturechange",b.zoom.onGestureChange,s),b.slides[t]("gestureend",b.zoom.onGestureEnd,s)):"touchstart"===b.touchEvents.start&&(b.slides[t](b.touchEvents.start,b.zoom.onGestureStart,s),b.slides[t](b.touchEvents.move,b.zoom.onGestureChange,s),b.slides[t](b.touchEvents.end,b.zoom.onGestureEnd,s)),b[t]("touchStart",b.zoom.onTouchStart),b.slides.each(function(e,s){a(s).find("."+b.params.zoomContainerClass).length>0&&a(s)[t](b.touchEvents.move,b.zoom.onTouchMove)}),b[t]("touchEnd",b.zoom.onTouchEnd),b[t]("transitionEnd",b.zoom.onTransitionEnd),b.params.zoomToggle&&b.on("doubleTap",b.zoom.toggleZoom)}},init:function(){b.zoom.attachEvents()},destroy:function(){b.zoom.attachEvents(!0)}},b._plugins=[];for(var O in b.plugins){var N=b.plugins[O](b,b.params[O]);N&&b._plugins.push(N)}return b.callPlugins=function(e){for(var a=0;a<b._plugins.length;a++)e in b._plugins[a]&&b._plugins[a][e](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5])},b.emitterEventListeners={},b.emit=function(e){b.params[e]&&b.params[e](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);var a;if(b.emitterEventListeners[e])for(a=0;a<b.emitterEventListeners[e].length;a++)b.emitterEventListeners[e][a](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);b.callPlugins&&b.callPlugins(e,arguments[1],arguments[2],arguments[3],arguments[4],arguments[5])},b.on=function(e,a){return e=h(e),b.emitterEventListeners[e]||(b.emitterEventListeners[e]=[]),b.emitterEventListeners[e].push(a),b},b.off=function(e,a){var t;if(e=h(e),"undefined"==typeof a)return b.emitterEventListeners[e]=[],b;if(b.emitterEventListeners[e]&&0!==b.emitterEventListeners[e].length){for(t=0;t<b.emitterEventListeners[e].length;t++)b.emitterEventListeners[e][t]===a&&b.emitterEventListeners[e].splice(t,1);return b}},b.once=function(e,a){e=h(e);var t=function(){a(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]),b.off(e,t)};return b.on(e,t),b},b.a11y={makeFocusable:function(e){return e.attr("tabIndex","0"),e},addRole:function(e,a){return e.attr("role",a),e},addLabel:function(e,a){return e.attr("aria-label",a),e},disable:function(e){return e.attr("aria-disabled",!0),e},enable:function(e){return e.attr("aria-disabled",!1),e},onEnterKey:function(e){13===e.keyCode&&(a(e.target).is(b.params.nextButton)?(b.onClickNext(e),b.isEnd?b.a11y.notify(b.params.lastSlideMessage):b.a11y.notify(b.params.nextSlideMessage)):a(e.target).is(b.params.prevButton)&&(b.onClickPrev(e),b.isBeginning?b.a11y.notify(b.params.firstSlideMessage):b.a11y.notify(b.params.prevSlideMessage)),a(e.target).is("."+b.params.bulletClass)&&a(e.target)[0].click())},liveRegion:a('<span class="'+b.params.notificationClass+'" aria-live="assertive" aria-atomic="true"></span>'),notify:function(e){var a=b.a11y.liveRegion;0!==a.length&&(a.html(""),a.html(e))},init:function(){b.params.nextButton&&b.nextButton&&b.nextButton.length>0&&(b.a11y.makeFocusable(b.nextButton),b.a11y.addRole(b.nextButton,"button"),b.a11y.addLabel(b.nextButton,b.params.nextSlideMessage)),b.params.prevButton&&b.prevButton&&b.prevButton.length>0&&(b.a11y.makeFocusable(b.prevButton),b.a11y.addRole(b.prevButton,"button"),b.a11y.addLabel(b.prevButton,b.params.prevSlideMessage)),a(b.container).append(b.a11y.liveRegion)},initPagination:function(){b.params.pagination&&b.params.paginationClickable&&b.bullets&&b.bullets.length&&b.bullets.each(function(){var e=a(this);b.a11y.makeFocusable(e),b.a11y.addRole(e,"button"),b.a11y.addLabel(e,b.params.paginationBulletMessage.replace(/{{index}}/,e.index()+1))})},destroy:function(){b.a11y.liveRegion&&b.a11y.liveRegion.length>0&&b.a11y.liveRegion.remove()}},b.init=function(){b.params.loop&&b.createLoop(),b.updateContainerSize(),b.updateSlidesSize(),b.updatePagination(),b.params.scrollbar&&b.scrollbar&&(b.scrollbar.set(),b.params.scrollbarDraggable&&b.scrollbar.enableDraggable()),"slide"!==b.params.effect&&b.effects[b.params.effect]&&(b.params.loop||b.updateProgress(),b.effects[b.params.effect].setTranslate()),b.params.loop?b.slideTo(b.params.initialSlide+b.loopedSlides,0,b.params.runCallbacksOnInit):(b.slideTo(b.params.initialSlide,0,b.params.runCallbacksOnInit),0===b.params.initialSlide&&(b.parallax&&b.params.parallax&&b.parallax.setTranslate(),b.lazy&&b.params.lazyLoading&&(b.lazy.load(),b.lazy.initialImageLoaded=!0))),b.attachEvents(),b.params.observer&&b.support.observer&&b.initObservers(),b.params.preloadImages&&!b.params.lazyLoading&&b.preloadImages(),b.params.zoom&&b.zoom&&b.zoom.init(),b.params.autoplay&&b.startAutoplay(),b.params.keyboardControl&&b.enableKeyboardControl&&b.enableKeyboardControl(),b.params.mousewheelControl&&b.enableMousewheelControl&&b.enableMousewheelControl(),b.params.hashnavReplaceState&&(b.params.replaceState=b.params.hashnavReplaceState),b.params.history&&b.history&&b.history.init(),b.params.hashnav&&b.hashnav&&b.hashnav.init(),b.params.a11y&&b.a11y&&b.a11y.init(),b.emit("onInit",b)},b.cleanupStyles=function(){b.container.removeClass(b.classNames.join(" ")).removeAttr("style"),b.wrapper.removeAttr("style"),b.slides&&b.slides.length&&b.slides.removeClass([b.params.slideVisibleClass,b.params.slideActiveClass,b.params.slideNextClass,b.params.slidePrevClass].join(" ")).removeAttr("style").removeAttr("data-swiper-column").removeAttr("data-swiper-row"),b.paginationContainer&&b.paginationContainer.length&&b.paginationContainer.removeClass(b.params.paginationHiddenClass),b.bullets&&b.bullets.length&&b.bullets.removeClass(b.params.bulletActiveClass),b.params.prevButton&&a(b.params.prevButton).removeClass(b.params.buttonDisabledClass),b.params.nextButton&&a(b.params.nextButton).removeClass(b.params.buttonDisabledClass),b.params.scrollbar&&b.scrollbar&&(b.scrollbar.track&&b.scrollbar.track.length&&b.scrollbar.track.removeAttr("style"),b.scrollbar.drag&&b.scrollbar.drag.length&&b.scrollbar.drag.removeAttr("style"))},b.destroy=function(e,a){b.detachEvents(),b.stopAutoplay(),b.params.scrollbar&&b.scrollbar&&b.params.scrollbarDraggable&&b.scrollbar.disableDraggable(),b.params.loop&&b.destroyLoop(),a&&b.cleanupStyles(),b.disconnectObservers(),b.params.zoom&&b.zoom&&b.zoom.destroy(),b.params.keyboardControl&&b.disableKeyboardControl&&b.disableKeyboardControl(),b.params.mousewheelControl&&b.disableMousewheelControl&&b.disableMousewheelControl(),b.params.a11y&&b.a11y&&b.a11y.destroy(),b.params.history&&!b.params.replaceState&&window.removeEventListener("popstate",b.history.setHistoryPopState),b.params.hashnav&&b.hashnav&&b.hashnav.destroy(),b.emit("onDestroy"),e!==!1&&(b=null)},b.init(),b}};t.prototype={isSafari:function(){var e=window.navigator.userAgent.toLowerCase();return e.indexOf("safari")>=0&&e.indexOf("chrome")<0&&e.indexOf("android")<0}(),isUiWebView:/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent),isArray:function(e){return"[object Array]"===Object.prototype.toString.apply(e)},browser:{ie:window.navigator.pointerEnabled||window.navigator.msPointerEnabled,ieTouch:window.navigator.msPointerEnabled&&window.navigator.msMaxTouchPoints>1||window.navigator.pointerEnabled&&window.navigator.maxTouchPoints>1,lteIE9:function(){var e=document.createElement("div");return e.innerHTML="<!--[if lte IE 9]><i></i><![endif]-->",1===e.getElementsByTagName("i").length}()},device:function(){var e=window.navigator.userAgent,a=e.match(/(Android);?[\s\/]+([\d.]+)?/),t=e.match(/(iPad).*OS\s([\d_]+)/),s=e.match(/(iPod)(.*OS\s([\d_]+))?/),i=!t&&e.match(/(iPhone\sOS|iOS)\s([\d_]+)/);return{ios:t||i||s,android:a}}(),support:{touch:window.Modernizr&&Modernizr.touch===!0||function(){return!!("ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch)}(),transforms3d:window.Modernizr&&Modernizr.csstransforms3d===!0||function(){var e=document.createElement("div").style;return"webkitPerspective"in e||"MozPerspective"in e||"OPerspective"in e||"MsPerspective"in e||"perspective"in e}(),flexbox:function(){for(var e=document.createElement("div").style,a="alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient".split(" "),t=0;t<a.length;t++)if(a[t]in e)return!0}(),observer:function(){return"MutationObserver"in window||"WebkitMutationObserver"in window}(),passiveListener:function(){var e=!1;try{var a=Object.defineProperty({},"passive",{get:function(){e=!0}});window.addEventListener("testPassiveListener",null,a)}catch(e){}return e}(),gestures:function(){return"ongesturestart"in window}()},plugins:{}};for(var s=(function(){var e=function(e){var a=this,t=0;for(t=0;t<e.length;t++)a[t]=e[t];return a.length=e.length,this},a=function(a,t){var s=[],i=0;if(a&&!t&&a instanceof e)return a;if(a)if("string"==typeof a){var r,n,o=a.trim();if(o.indexOf("<")>=0&&o.indexOf(">")>=0){var l="div";for(0===o.indexOf("<li")&&(l="ul"),0===o.indexOf("<tr")&&(l="tbody"),0!==o.indexOf("<td")&&0!==o.indexOf("<th")||(l="tr"),0===o.indexOf("<tbody")&&(l="table"),0===o.indexOf("<option")&&(l="select"),n=document.createElement(l),n.innerHTML=a,i=0;i<n.childNodes.length;i++)s.push(n.childNodes[i])}else for(r=t||"#"!==a[0]||a.match(/[ .<>:~]/)?(t||document).querySelectorAll(a):[document.getElementById(a.split("#")[1])],i=0;i<r.length;i++)r[i]&&s.push(r[i])}else if(a.nodeType||a===window||a===document)s.push(a);else if(a.length>0&&a[0].nodeType)for(i=0;i<a.length;i++)s.push(a[i]);return new e(s)};return e.prototype={addClass:function(e){if("undefined"==typeof e)return this;for(var a=e.split(" "),t=0;t<a.length;t++)for(var s=0;s<this.length;s++)this[s].classList.add(a[t]);return this},removeClass:function(e){for(var a=e.split(" "),t=0;t<a.length;t++)for(var s=0;s<this.length;s++)this[s].classList.remove(a[t]);return this},hasClass:function(e){return!!this[0]&&this[0].classList.contains(e)},toggleClass:function(e){for(var a=e.split(" "),t=0;t<a.length;t++)for(var s=0;s<this.length;s++)this[s].classList.toggle(a[t]);return this},attr:function(e,a){if(1===arguments.length&&"string"==typeof e)return this[0]?this[0].getAttribute(e):void 0;for(var t=0;t<this.length;t++)if(2===arguments.length)this[t].setAttribute(e,a);else for(var s in e)this[t][s]=e[s],this[t].setAttribute(s,e[s]);return this},removeAttr:function(e){for(var a=0;a<this.length;a++)this[a].removeAttribute(e);return this},data:function(e,a){if("undefined"!=typeof a){for(var t=0;t<this.length;t++){var s=this[t];s.dom7ElementDataStorage||(s.dom7ElementDataStorage={}),s.dom7ElementDataStorage[e]=a}return this}if(this[0]){var i=this[0].getAttribute("data-"+e);return i?i:this[0].dom7ElementDataStorage&&e in this[0].dom7ElementDataStorage?this[0].dom7ElementDataStorage[e]:void 0}},transform:function(e){for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransform=t.MsTransform=t.msTransform=t.MozTransform=t.OTransform=t.transform=e}return this},transition:function(e){"string"!=typeof e&&(e+="ms");for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransitionDuration=t.MsTransitionDuration=t.msTransitionDuration=t.MozTransitionDuration=t.OTransitionDuration=t.transitionDuration=e}return this},on:function(e,t,s,i){function r(e){var i=e.target;if(a(i).is(t))s.call(i,e);else for(var r=a(i).parents(),n=0;n<r.length;n++)a(r[n]).is(t)&&s.call(r[n],e)}var n,o,l=e.split(" ");for(n=0;n<this.length;n++)if("function"==typeof t||t===!1)for("function"==typeof t&&(s=arguments[1],i=arguments[2]||!1),o=0;o<l.length;o++)this[n].addEventListener(l[o],s,i);else for(o=0;o<l.length;o++)this[n].dom7LiveListeners||(this[n].dom7LiveListeners=[]),this[n].dom7LiveListeners.push({listener:s,liveListener:r}),this[n].addEventListener(l[o],r,i);return this},off:function(e,a,t,s){for(var i=e.split(" "),r=0;r<i.length;r++)for(var n=0;n<this.length;n++)if("function"==typeof a||a===!1)"function"==typeof a&&(t=arguments[1],s=arguments[2]||!1),this[n].removeEventListener(i[r],t,s);else if(this[n].dom7LiveListeners)for(var o=0;o<this[n].dom7LiveListeners.length;o++)this[n].dom7LiveListeners[o].listener===t&&this[n].removeEventListener(i[r],this[n].dom7LiveListeners[o].liveListener,s);return this},once:function(e,a,t,s){function i(n){t(n),r.off(e,a,i,s)}var r=this;"function"==typeof a&&(a=!1,t=arguments[1],s=arguments[2]),r.on(e,a,i,s)},trigger:function(e,a){for(var t=0;t<this.length;t++){var s;try{s=new window.CustomEvent(e,{detail:a,bubbles:!0,cancelable:!0})}catch(t){s=document.createEvent("Event"),s.initEvent(e,!0,!0),s.detail=a}this[t].dispatchEvent(s)}return this},transitionEnd:function(e){function a(r){if(r.target===this)for(e.call(this,r),t=0;t<s.length;t++)i.off(s[t],a)}var t,s=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],i=this;if(e)for(t=0;t<s.length;t++)i.on(s[t],a);return this},width:function(){return this[0]===window?window.innerWidth:this.length>0?parseFloat(this.css("width")):null},outerWidth:function(e){return this.length>0?e?this[0].offsetWidth+parseFloat(this.css("margin-right"))+parseFloat(this.css("margin-left")):this[0].offsetWidth:null},height:function(){return this[0]===window?window.innerHeight:this.length>0?parseFloat(this.css("height")):null},outerHeight:function(e){return this.length>0?e?this[0].offsetHeight+parseFloat(this.css("margin-top"))+parseFloat(this.css("margin-bottom")):this[0].offsetHeight:null},offset:function(){if(this.length>0){var e=this[0],a=e.getBoundingClientRect(),t=document.body,s=e.clientTop||t.clientTop||0,i=e.clientLeft||t.clientLeft||0,r=window.pageYOffset||e.scrollTop,n=window.pageXOffset||e.scrollLeft;return{top:a.top+r-s,left:a.left+n-i}}return null},css:function(e,a){var t;if(1===arguments.length){if("string"!=typeof e){for(t=0;t<this.length;t++)for(var s in e)this[t].style[s]=e[s];return this}if(this[0])return window.getComputedStyle(this[0],null).getPropertyValue(e)}if(2===arguments.length&&"string"==typeof e){for(t=0;t<this.length;t++)this[t].style[e]=a;return this}return this},each:function(e){for(var a=0;a<this.length;a++)e.call(this[a],a,this[a]);return this},html:function(e){if("undefined"==typeof e)return this[0]?this[0].innerHTML:void 0;for(var a=0;a<this.length;a++)this[a].innerHTML=e;return this},text:function(e){if("undefined"==typeof e)return this[0]?this[0].textContent.trim():null;for(var a=0;a<this.length;a++)this[a].textContent=e;return this},is:function(t){if(!this[0])return!1;var s,i;if("string"==typeof t){var r=this[0];if(r===document)return t===document;if(r===window)return t===window;if(r.matches)return r.matches(t);if(r.webkitMatchesSelector)return r.webkitMatchesSelector(t);if(r.mozMatchesSelector)return r.mozMatchesSelector(t);if(r.msMatchesSelector)return r.msMatchesSelector(t);for(s=a(t),i=0;i<s.length;i++)if(s[i]===this[0])return!0;return!1}if(t===document)return this[0]===document;if(t===window)return this[0]===window;if(t.nodeType||t instanceof e){for(s=t.nodeType?[t]:t,i=0;i<s.length;i++)if(s[i]===this[0])return!0;return!1}return!1},index:function(){if(this[0]){for(var e=this[0],a=0;null!==(e=e.previousSibling);)1===e.nodeType&&a++;return a}},eq:function(a){if("undefined"==typeof a)return this;var t,s=this.length;return a>s-1?new e([]):a<0?(t=s+a,new e(t<0?[]:[this[t]])):new e([this[a]])},append:function(a){var t,s;for(t=0;t<this.length;t++)if("string"==typeof a){var i=document.createElement("div");for(i.innerHTML=a;i.firstChild;)this[t].appendChild(i.firstChild)}else if(a instanceof e)for(s=0;s<a.length;s++)this[t].appendChild(a[s]);else this[t].appendChild(a);return this},prepend:function(a){var t,s;for(t=0;t<this.length;t++)if("string"==typeof a){var i=document.createElement("div");for(i.innerHTML=a,s=i.childNodes.length-1;s>=0;s--)this[t].insertBefore(i.childNodes[s],this[t].childNodes[0])}else if(a instanceof e)for(s=0;s<a.length;s++)this[t].insertBefore(a[s],this[t].childNodes[0]);else this[t].insertBefore(a,this[t].childNodes[0]);return this},insertBefore:function(e){for(var t=a(e),s=0;s<this.length;s++)if(1===t.length)t[0].parentNode.insertBefore(this[s],t[0]);else if(t.length>1)for(var i=0;i<t.length;i++)t[i].parentNode.insertBefore(this[s].cloneNode(!0),t[i])},insertAfter:function(e){for(var t=a(e),s=0;s<this.length;s++)if(1===t.length)t[0].parentNode.insertBefore(this[s],t[0].nextSibling);else if(t.length>1)for(var i=0;i<t.length;i++)t[i].parentNode.insertBefore(this[s].cloneNode(!0),t[i].nextSibling)},next:function(t){return new e(this.length>0?t?this[0].nextElementSibling&&a(this[0].nextElementSibling).is(t)?[this[0].nextElementSibling]:[]:this[0].nextElementSibling?[this[0].nextElementSibling]:[]:[])},nextAll:function(t){var s=[],i=this[0];if(!i)return new e([]);for(;i.nextElementSibling;){var r=i.nextElementSibling;t?a(r).is(t)&&s.push(r):s.push(r),i=r}return new e(s)},prev:function(t){return new e(this.length>0?t?this[0].previousElementSibling&&a(this[0].previousElementSibling).is(t)?[this[0].previousElementSibling]:[]:this[0].previousElementSibling?[this[0].previousElementSibling]:[]:[])},prevAll:function(t){var s=[],i=this[0];if(!i)return new e([]);for(;i.previousElementSibling;){var r=i.previousElementSibling;t?a(r).is(t)&&s.push(r):s.push(r),i=r}return new e(s)},parent:function(e){for(var t=[],s=0;s<this.length;s++)e?a(this[s].parentNode).is(e)&&t.push(this[s].parentNode):t.push(this[s].parentNode);return a(a.unique(t))},parents:function(e){for(var t=[],s=0;s<this.length;s++)for(var i=this[s].parentNode;i;)e?a(i).is(e)&&t.push(i):t.push(i),i=i.parentNode;return a(a.unique(t))},find:function(a){for(var t=[],s=0;s<this.length;s++)for(var i=this[s].querySelectorAll(a),r=0;r<i.length;r++)t.push(i[r]);return new e(t)},children:function(t){for(var s=[],i=0;i<this.length;i++)for(var r=this[i].childNodes,n=0;n<r.length;n++)t?1===r[n].nodeType&&a(r[n]).is(t)&&s.push(r[n]):1===r[n].nodeType&&s.push(r[n]);return new e(a.unique(s))},remove:function(){for(var e=0;e<this.length;e++)this[e].parentNode&&this[e].parentNode.removeChild(this[e]);return this},add:function(){var e,t,s=this;for(e=0;e<arguments.length;e++){var i=a(arguments[e]);for(t=0;t<i.length;t++)s[s.length]=i[t],s.length++}return s}},a.fn=e.prototype,a.unique=function(e){for(var a=[],t=0;t<e.length;t++)a.indexOf(e[t])===-1&&a.push(e[t]);return a},a}()),i=["jQuery","Zepto","Dom7"],r=0;r<i.length;r++)window[i[r]]&&e(window[i[r]]);var n;n="undefined"==typeof s?window.Dom7||window.Zepto||window.jQuery:s,n&&("transitionEnd"in n.fn||(n.fn.transitionEnd=function(e){function a(r){if(r.target===this)for(e.call(this,r),t=0;t<s.length;t++)i.off(s[t],a)}var t,s=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],i=this;if(e)for(t=0;t<s.length;t++)i.on(s[t],a);return this}),"transform"in n.fn||(n.fn.transform=function(e){for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransform=t.MsTransform=t.msTransform=t.MozTransform=t.OTransform=t.transform=e}return this}),"transition"in n.fn||(n.fn.transition=function(e){"string"!=typeof e&&(e+="ms");for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransitionDuration=t.MsTransitionDuration=t.msTransitionDuration=t.MozTransitionDuration=t.OTransitionDuration=t.transitionDuration=e;
}return this}),"outerWidth"in n.fn||(n.fn.outerWidth=function(e){return this.length>0?e?this[0].offsetWidth+parseFloat(this.css("margin-right"))+parseFloat(this.css("margin-left")):this[0].offsetWidth:null})),window.Swiper=t}(),"undefined"!=typeof module?module.exports=window.Swiper:"function"==typeof define&&define.amd&&define([],function(){"use strict";return window.Swiper});
//# sourceMappingURL=maps/swiper.min.js.map
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a(require("jquery")):a(jQuery)}(function(a){function i(){var b,c,d={height:f.innerHeight,width:f.innerWidth};return d.height||(b=e.compatMode,(b||!a.support.boxModel)&&(c="CSS1Compat"===b?g:e.body,d={height:c.clientHeight,width:c.clientWidth})),d}function j(){return{top:f.pageYOffset||g.scrollTop||e.body.scrollTop,left:f.pageXOffset||g.scrollLeft||e.body.scrollLeft}}function k(){if(b.length){var e=0,f=a.map(b,function(a){var b=a.data.selector,c=a.$element;return b?c.find(b):c});for(c=c||i(),d=d||j();e<b.length;e++)if(a.contains(g,f[e][0])){var h=a(f[e]),k={height:h[0].offsetHeight,width:h[0].offsetWidth},l=h.offset(),m=h.data("inview");if(!d||!c)return;l.top+k.height>d.top&&l.top<d.top+c.height&&l.left+k.width>d.left&&l.left<d.left+c.width?m||h.data("inview",!0).trigger("inview",[!0]):m&&h.data("inview",!1).trigger("inview",[!1])}}}var c,d,h,b=[],e=document,f=window,g=e.documentElement;a.event.special.inview={add:function(c){b.push({data:c,$element:a(this),element:this}),!h&&b.length&&(h=setInterval(k,250))},remove:function(a){for(var c=0;c<b.length;c++){var d=b[c];if(d.element===this&&d.data.guid===a.guid){b.splice(c,1);break}}b.length||(clearInterval(h),h=null)}},a(f).bind("scroll resize scrollstop",function(){c=d=null}),!g.addEventListener&&g.attachEvent&&g.attachEvent("onfocusin",function(){d=null})});
/*
 Sticky-kit v1.1.1 | WTFPL | Leaf Corcoran 2014 | http://leafo.net
 */
(function(){var k,e;k=this.jQuery||window.jQuery;e=k(window);k.fn.stick_in_parent=function(d){var v,y,n,p,h,C,s,G,q,H;null==d&&(d={});s=d.sticky_class;y=d.inner_scrolling;C=d.recalc_every;h=d.parent;p=d.offset_top;n=d.spacer;v=d.bottoming;null==p&&(p=0);null==h&&(h=void 0);null==y&&(y=!0);null==s&&(s="is_stuck");null==v&&(v=!0);G=function(a,d,q,z,D,t,r,E){var u,F,m,A,c,f,B,w,x,g,b;if(!a.data("sticky_kit")){a.data("sticky_kit",!0);f=a.parent();null!=h&&(f=f.closest(h));if(!f.length)throw"failed to find stick parent";
    u=m=!1;(g=null!=n?n&&a.closest(n):k("<div />"))&&g.css("position",a.css("position"));B=function(){var c,e,l;if(!E&&(c=parseInt(f.css("border-top-width"),10),e=parseInt(f.css("padding-top"),10),d=parseInt(f.css("padding-bottom"),10),q=f.offset().top+c+e,z=f.height(),m&&(u=m=!1,null==n&&(a.insertAfter(g),g.detach()),a.css({position:"",top:"",width:"",bottom:""}).removeClass(s),l=!0),D=a.offset().top-parseInt(a.css("margin-top"),10)-p,t=a.outerHeight(!0),r=a.css("float"),g&&g.css({width:a.outerWidth(!0),
            height:t,display:a.css("display"),"vertical-align":a.css("vertical-align"),"float":r}),l))return b()};B();if(t!==z)return A=void 0,c=p,x=C,b=function(){var b,k,l,h;if(!E&&(null!=x&&(--x,0>=x&&(x=C,B())),l=e.scrollTop(),null!=A&&(k=l-A),A=l,m?(v&&(h=l+t+c>z+q,u&&!h&&(u=!1,a.css({position:"fixed",bottom:"",top:c}).trigger("sticky_kit:unbottom"))),l<D&&(m=!1,c=p,null==n&&("left"!==r&&"right"!==r||a.insertAfter(g),g.detach()),b={position:"",width:"",top:""},a.css(b).removeClass(s).trigger("sticky_kit:unstick")),
        y&&(b=e.height(),t+p>b&&!u&&(c-=k,c=Math.max(b-t,c),c=Math.min(p,c),m&&a.css({top:c+"px"})))):l>D&&(m=!0,b={position:"fixed",top:c},b.width="border-box"===a.css("box-sizing")?a.outerWidth()+"px":a.width()+"px",a.css(b).addClass(s),null==n&&(a.after(g),"left"!==r&&"right"!==r||g.append(a)),a.trigger("sticky_kit:stick")),m&&v&&(null==h&&(h=l+t+c>z+q),!u&&h)))return u=!0,"static"===f.css("position")&&f.css({position:"relative"}),a.css({position:"absolute",bottom:d,top:"auto"}).trigger("sticky_kit:bottom")},
        w=function(){B();return b()},F=function(){E=!0;e.off("touchmove",b);e.off("scroll",b);e.off("resize",w);k(document.body).off("sticky_kit:recalc",w);a.off("sticky_kit:detach",F);a.removeData("sticky_kit");a.css({position:"",bottom:"",top:"",width:""});f.position("position","");if(m)return null==n&&("left"!==r&&"right"!==r||a.insertAfter(g),g.remove()),a.removeClass(s)},e.on("touchmove",b),e.on("scroll",b),e.on("resize",w),k(document.body).on("sticky_kit:recalc",w),a.on("sticky_kit:detach",F),setTimeout(b,
        0)}};q=0;for(H=this.length;q<H;q++)d=this[q],G(k(d));return this}}).call(this);
/*
	Masked Input plugin for jQuery
	Copyright (c) 2007-2013 Josh Bush (digitalbush.com)
	Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
	Version: 1.3.1
*/
(function(e){function t(){var e=document.createElement("input"),t="onpaste";return e.setAttribute(t,""),"function"==typeof e[t]?"paste":"input"}var n,a=t()+".mask",r=navigator.userAgent,i=/iphone/i.test(r),o=/android/i.test(r);e.mask={definitions:{9:"[0-9]",a:"[A-Za-z]","*":"[A-Za-z0-9]"},dataName:"rawMaskFn",placeholder:"_"},e.fn.extend({caret:function(e,t){var n;if(0!==this.length&&!this.is(":hidden"))return"number"==typeof e?(t="number"==typeof t?t:e,this.each(function(){this.setSelectionRange?this.setSelectionRange(e,t):this.createTextRange&&(n=this.createTextRange(),n.collapse(!0),n.moveEnd("character",t),n.moveStart("character",e),n.select())})):(this[0].setSelectionRange?(e=this[0].selectionStart,t=this[0].selectionEnd):document.selection&&document.selection.createRange&&(n=document.selection.createRange(),e=0-n.duplicate().moveStart("character",-1e5),t=e+n.text.length),{begin:e,end:t})},unmask:function(){return this.trigger("unmask")},mask:function(t,r){var c,l,s,u,f,h;return!t&&this.length>0?(c=e(this[0]),c.data(e.mask.dataName)()):(r=e.extend({placeholder:e.mask.placeholder,completed:null},r),l=e.mask.definitions,s=[],u=h=t.length,f=null,e.each(t.split(""),function(e,t){"?"==t?(h--,u=e):l[t]?(s.push(RegExp(l[t])),null===f&&(f=s.length-1)):s.push(null)}),this.trigger("unmask").each(function(){function c(e){for(;h>++e&&!s[e];);return e}function d(e){for(;--e>=0&&!s[e];);return e}function m(e,t){var n,a;if(!(0>e)){for(n=e,a=c(t);h>n;n++)if(s[n]){if(!(h>a&&s[n].test(R[a])))break;R[n]=R[a],R[a]=r.placeholder,a=c(a)}b(),x.caret(Math.max(f,e))}}function p(e){var t,n,a,i;for(t=e,n=r.placeholder;h>t;t++)if(s[t]){if(a=c(t),i=R[t],R[t]=n,!(h>a&&s[a].test(i)))break;n=i}}function g(e){var t,n,a,r=e.which;8===r||46===r||i&&127===r?(t=x.caret(),n=t.begin,a=t.end,0===a-n&&(n=46!==r?d(n):a=c(n-1),a=46===r?c(a):a),k(n,a),m(n,a-1),e.preventDefault()):27==r&&(x.val(S),x.caret(0,y()),e.preventDefault())}function v(t){var n,a,i,l=t.which,u=x.caret();t.ctrlKey||t.altKey||t.metaKey||32>l||l&&(0!==u.end-u.begin&&(k(u.begin,u.end),m(u.begin,u.end-1)),n=c(u.begin-1),h>n&&(a=String.fromCharCode(l),s[n].test(a)&&(p(n),R[n]=a,b(),i=c(n),o?setTimeout(e.proxy(e.fn.caret,x,i),0):x.caret(i),r.completed&&i>=h&&r.completed.call(x))),t.preventDefault())}function k(e,t){var n;for(n=e;t>n&&h>n;n++)s[n]&&(R[n]=r.placeholder)}function b(){x.val(R.join(""))}function y(e){var t,n,a=x.val(),i=-1;for(t=0,pos=0;h>t;t++)if(s[t]){for(R[t]=r.placeholder;pos++<a.length;)if(n=a.charAt(pos-1),s[t].test(n)){R[t]=n,i=t;break}if(pos>a.length)break}else R[t]===a.charAt(pos)&&t!==u&&(pos++,i=t);return e?b():u>i+1?(x.val(""),k(0,h)):(b(),x.val(x.val().substring(0,i+1))),u?t:f}var x=e(this),R=e.map(t.split(""),function(e){return"?"!=e?l[e]?r.placeholder:e:void 0}),S=x.val();x.data(e.mask.dataName,function(){return e.map(R,function(e,t){return s[t]&&e!=r.placeholder?e:null}).join("")}),x.attr("readonly")||x.one("unmask",function(){x.unbind(".mask").removeData(e.mask.dataName)}).bind("focus.mask",function(){clearTimeout(n);var e;S=x.val(),e=y(),n=setTimeout(function(){b(),e==t.length?x.caret(0,e):x.caret(e)},10)}).bind("blur.mask",function(){y(),x.val()!=S&&x.change()}).bind("keydown.mask",g).bind("keypress.mask",v).bind(a,function(){setTimeout(function(){var e=y(!0);x.caret(e),r.completed&&e==x.val().length&&r.completed.call(x)},0)}),y()}))}})})(jQuery);
// SmoothScroll for websites v1.2.1
// Licensed under the terms of the MIT license.

// People involved
//  - Balazs Galambosi (maintainer)
//  - Michael Herf     (Pulse Algorithm)

(function(){

    if (window.noSmoothScroll === 1) { return false; }

    // Scroll Variables (tweakable)
    var options = {

        // Scrolling Core
        frameRate        : 60, // [Hz]
        animationTime    : 800, // [px]
        stepSize         : 150, // [px]

        // Pulse (less tweakable)
        // ratio of "tail" to "acceleration"
        pulseAlgorithm   : true,
        pulseScale       : 8,
        pulseNormalize   : 1,

        // Acceleration
        accelerationDelta : 20,  // 20
        accelerationMax   : 1,   // 1

        // Keyboard Settings
        keyboardSupport   : true,  // option
        arrowScroll       : 50,     // [px]

        // Other
        touchpadSupport   : true,
        fixedBackground   : true,
        excluded          : ""
    };

    // Other Variables
    var isExcluded = false;
    var isFrame = false;
    var direction = { x: 0, y: 0 };
    var initDone  = false;
    var root = document.documentElement;
    var activeElement;
    var observer;
    var deltaBuffer = [ 120, 120, 120 ];
    var key = { left: 37, up: 38, right: 39, down: 40, spacebar: 32,
        pageup: 33, pagedown: 34, end: 35, home: 36 };

    /***********************************************
     * SETTINGS
     ***********************************************/


    /***********************************************
     * INITIALIZE
     ***********************************************/

    /**
     * Tests if smooth scrolling is allowed. Shuts down everything if not.
     */
    function initTest() {

        var disableKeyboard = false;

        // disable keyboard support if anything above requested it
        if (disableKeyboard) {
            removeEvent("keydown", keydown);
        }

        if (options.keyboardSupport && !disableKeyboard) {
            addEvent("keydown", keydown);
        }
    }

    /**
     * Sets up scrolls array, determines if frames are involved.
     */
    function init() {

        if (!document.body) return;

        var body = document.body;
        var html = document.documentElement;
        var windowHeight = window.innerHeight;
        var scrollHeight = body.scrollHeight;

        // check compat mode for root element
        root = (document.compatMode.indexOf('CSS') >= 0) ? html : body;
        activeElement = body;

        initTest();
        initDone = true;

        // Checks if this script is running in a frame
        if (top != self) {
            isFrame = true;
        }

    }

    /************************************************
     * SCROLLING
     ************************************************/

    var que = [];
    var pending = false;
    var lastScroll = +new Date;

    /**
     * Pushes scroll actions to the scrolling queue.
     */
    function scrollArray(elem, left, top, delay) {

        delay || (delay = 1000);
        directionCheck(left, top);

        if (options.accelerationMax != 1) {
            var now = +new Date;
            var elapsed = now - lastScroll;
            if (elapsed < options.accelerationDelta) {
                var factor = (1 + (30 / elapsed)) / 2;
                if (factor > 1) {
                    factor = Math.min(factor, options.accelerationMax);
                    left *= factor;
                    top  *= factor;
                }
            }
            lastScroll = +new Date;
        }

        // push a scroll command
        que.push({
            x: left,
            y: top,
            lastX: (left < 0) ? 0.99 : -0.99,
            lastY: (top  < 0) ? 0.99 : -0.99,
            start: +new Date
        });

        // don't act if there's a pending queue
        if (pending) {
            return;
        }

        var scrollWindow = (elem === document.body);

        var step = function (time) {

            var now = +new Date;
            var scrollX = 0;
            var scrollY = 0;

            for (var i = 0; i < que.length; i++) {

                var item = que[i];
                var elapsed  = now - item.start;
                var finished = (elapsed >= options.animationTime);

                // scroll position: [0, 1]
                var position = (finished) ? 1 : elapsed / options.animationTime;

                // easing [optional]
                if (options.pulseAlgorithm) {
                    position = pulse(position);
                }

                // only need the difference
                var x = (item.x * position - item.lastX) >> 0;
                var y = (item.y * position - item.lastY) >> 0;

                // add this to the total scrolling
                scrollX += x;
                scrollY += y;

                // update last values
                item.lastX += x;
                item.lastY += y;

                // delete and step back if it's over
                if (finished) {
                    que.splice(i, 1); i--;
                }
            }

            // scroll left and top
            if (scrollWindow) {
                window.scrollBy(scrollX, scrollY);
            }
            else {
                if (scrollX) elem.scrollLeft += scrollX;
                if (scrollY) elem.scrollTop  += scrollY;
            }

            // clean up if there's nothing left to do
            if (!left && !top) {
                que = [];
            }

            if (que.length) {
                requestFrame(step, elem, (delay / options.frameRate + 1));
            } else {
                pending = false;
            }
        };

        // start a new queue of actions
        requestFrame(step, elem, 0);
        pending = true;
    }

    /***********************************************
     * EVENTS
     ***********************************************/

    /**
     * Mouse wheel handler.
     * @param {Object} event
     */
    function wheel(event) {

        if (!initDone) {
            init();
        }

        var target = event.target;
        var overflowing = overflowingAncestor(target);

        // use default if there's no overflowing
        // element or default action is prevented
        if (!overflowing || event.defaultPrevented ||
            isNodeName(activeElement, "embed") ||
            (isNodeName(target, "embed") && /\.pdf/i.test(target.src))) {
            return true;
        }

        var deltaX = event.wheelDeltaX || 0;
        var deltaY = event.wheelDeltaY || 0;

        // use wheelDelta if deltaX/Y is not available
        if (!deltaX && !deltaY) {
            deltaY = event.wheelDelta || 0;
        }

        // check if it's a touchpad scroll that should be ignored
        if (!options.touchpadSupport && isTouchpad(deltaY)) {
            return true;
        }

        // scale by step size
        // delta is 120 most of the time
        // synaptics seems to send 1 sometimes
        if (Math.abs(deltaX) > 1.2) {
            deltaX *= options.stepSize / 120;
        }
        if (Math.abs(deltaY) > 1.2) {
            deltaY *= options.stepSize / 120;
        }

        scrollArray(overflowing, -deltaX, -deltaY);
        event.preventDefault();
    }

    /**
     * Keydown event handler.
     * @param {Object} event
     */
    function keydown(event) {

        var target   = event.target;
        var modifier = event.ctrlKey || event.altKey || event.metaKey ||
            (event.shiftKey && event.keyCode !== key.spacebar);

        // do nothing if user is editing text
        // or using a modifier key (except shift)
        // or in a dropdown
        if ( /input|textarea|select|embed/i.test(target.nodeName) ||
            target.isContentEditable ||
            event.defaultPrevented   ||
            modifier ) {
            return true;
        }
        // spacebar should trigger button press
        if (isNodeName(target, "button") &&
            event.keyCode === key.spacebar) {
            return true;
        }

        var shift, x = 0, y = 0;
        var elem = overflowingAncestor(activeElement);
        var clientHeight = elem.clientHeight;

        if (elem == document.body) {
            clientHeight = window.innerHeight;
        }

        switch (event.keyCode) {
            case key.up:
                y = -options.arrowScroll;
                break;
            case key.down:
                y = options.arrowScroll;
                break;
            case key.spacebar: // (+ shift)
                shift = event.shiftKey ? 1 : -1;
                y = -shift * clientHeight * .5;
                break;
            case key.pageup:
                y = -clientHeight * .5;
                break;
            case key.pagedown:
                y = clientHeight * .5;
                break;
            case key.home:
                y = -elem.scrollTop;
                break;
            case key.end:
                var damt = elem.scrollHeight - elem.scrollTop - clientHeight;
                y = (damt > 0) ? damt+10 : 0;
                break;
            case key.left:
                x = -options.arrowScroll;
                break;
            case key.right:
                x = options.arrowScroll;
                break;
            default:
                return true; // a key we don't care about
        }

        scrollArray(elem, x, y);
        event.preventDefault();
    }

    /**
     * Mousedown event only for updating activeElement
     */
    function mousedown(event) {
        activeElement = event.target;
    }

    /***********************************************
     * OVERFLOW
     ***********************************************/

    var cache = {}; // cleared out every once in while
    setInterval(function () { cache = {}; }, 10 * 1000);

    var uniqueID = (function () {
        var i = 0;
        return function (el) {
            return el.uniqueID || (el.uniqueID = i++);
        };
    })();

    function setCache(elems, overflowing) {
        for (var i = elems.length; i--;)
            cache[uniqueID(elems[i])] = overflowing;
        return overflowing;
    }

    function overflowingAncestor(el) {
        var elems = [];
        var rootScrollHeight = root.scrollHeight;
        do {
            var cached = cache[uniqueID(el)];
            if (cached) {
                return setCache(elems, cached);
            }
            elems.push(el);
            if (rootScrollHeight === el.scrollHeight) {
                if (!isFrame || root.clientHeight + 10 < rootScrollHeight) {
                    return setCache(elems, document.body); // scrolling root in WebKit
                }
            } else if (el.clientHeight + 10 < el.scrollHeight) {
                overflow = getComputedStyle(el, "").getPropertyValue("overflow-y");
                if (overflow === "scroll" || overflow === "auto") {
                    return setCache(elems, el);
                }
            }
        } while (el = el.parentNode);
    }

    /***********************************************
     * HELPERS
     ***********************************************/

    function addEvent(type, fn, bubble) {
        window.addEventListener(type, fn, (bubble||false));
    }

    function removeEvent(type, fn, bubble) {
        window.removeEventListener(type, fn, (bubble||false));
    }

    function isNodeName(el, tag) {
        return (el.nodeName||"").toLowerCase() === tag.toLowerCase();
    }

    function directionCheck(x, y) {
        x = (x > 0) ? 1 : -1;
        y = (y > 0) ? 1 : -1;
        if (direction.x !== x || direction.y !== y) {
            direction.x = x;
            direction.y = y;
            que = [];
            lastScroll = 0;
        }
    }

    var deltaBufferTimer;

    function isTouchpad(deltaY) {
        if (!deltaY) return;
        deltaY = Math.abs(deltaY)
        deltaBuffer.push(deltaY);
        deltaBuffer.shift();
        clearTimeout(deltaBufferTimer);
        var allDivisable = (isDivisible(deltaBuffer[0], 120) &&
        isDivisible(deltaBuffer[1], 120) &&
        isDivisible(deltaBuffer[2], 120));
        return !allDivisable;
    }

    function isDivisible(n, divisor) {
        return (Math.floor(n / divisor) == n / divisor);
    }

    var requestFrame = (function () {
        return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            function (callback, element, delay) {
                window.setTimeout(callback, delay || (1000/60));
            };
    })();

    /***********************************************
     * PULSE
     ***********************************************/

    /**
     * Viscous fluid with a pulse for part and decay for the rest.
     * - Applies a fixed force over an interval (a damped acceleration), and
     * - Lets the exponential bleed away the velocity over a longer interval
     * - Michael Herf, http://stereopsis.com/stopping/
     */
    function pulse_(x) {
        var val, start, expx;
        // test
        x = x * options.pulseScale;
        if (x < 1) { // acceleartion
            val = x - (1 - Math.exp(-x));
        } else {     // tail
            // the previous animation ended here:
            start = Math.exp(-1);
            // simple viscous drag
            x -= 1;
            expx = 1 - Math.exp(-x);
            val = start + (expx * (1 - start));
        }
        return val * options.pulseNormalize;
    }

    function pulse(x) {
        if (x >= 1) return 1;
        if (x <= 0) return 0;

        if (options.pulseNormalize == 1) {
            options.pulseNormalize /= pulse_(1);
        }
        return pulse_(x);
    }

    var isChrome = /chrome/i.test(window.navigator.userAgent);
    var isMacLike = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)?true:false;
    var wheelEvent = null;
    if ("onwheel" in document.createElement("div"))
        wheelEvent = "wheel";
    else if ("onmousewheel" in document.createElement("div"))
        wheelEvent = "mousewheel";

    if (wheelEvent && isChrome && !isMacLike) {
        addEvent(wheelEvent, wheel);
        addEvent("mousedown", mousedown);
        addEvent("load", init);
    }

})();
var _pageShare;
var moduleApp = {
    'init': function () {
        moduleApp.pollifil();
        moduleApp.sliderSwiper();gi
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

        if($('.js-about-slider').length > 0){
            var slideActive = 0;
            var slidePosition = 0;
            var scroll = 0;

            var configAbout = {
                    slidesPerView: 4,
                    centeredSlides: false,
                    paginationClickable: true,
                    spaceBetween: 0,
                    nextButton: '.swiper-button-next',
                    prevButton: '.swiper-button-prev',
                    simulateTouch: false,
                    onSlideNextStart: function(swiper){
                        var activeIndex = swiper.activeIndex;
                        if(activeIndex > slideActive){
                            $(swiper.slides[activeIndex]).find('.js-about-date').trigger('click')
                        }
                        slidePosition++;
                    },
                    onSlidePrevStart: function(swiper){
                        var activeIndex = swiper.activeIndex,
                            currentLimit = activeIndex + 3;

                        if(slideActive > currentLimit ){
                            $(swiper.slides[currentLimit]).find('.js-about-date').trigger('click')
                        }
                        slidePosition--;
                    },
                },
                $aboutSlider = $('.js-about-slider');

            var $aboutSwiper = $aboutSlider.swiper(configAbout);

            $('.js-about-date').on('click', function(){
                if(!$(this).hasClass('active')){
                    var $dates = $('.js-about-date'),
                        $this = $(this),
                        $slide = $this.closest('.swiper-slide');
                    var $content = $this.find('.content').clone();

                    $dates.removeClass('active');
                    $this.addClass('active');
                    slideActive = $slide.index();
                    $('.js-about-content .content').removeClass('active').addClass('deleted');
                    $content.appendTo('.js-about-content');
                    setTimeout(function(){
                        $('.js-about-content .deleted').remove();
                        $('.js-about-content .content').addClass('active');
                    },400);
                    //$this.find('.content').clone().appendTo('.js-about-content');
                }
            });
        }

        if($('.js-is-slider').length > 0){
            var configIsSlider = {
                    slidesPerView: 1,
                    centeredSlides: false,
                    paginationClickable: true,
                    spaceBetween: 0,
                    autoHeight: true,
                    pagination: '.swiper-pagination',
                    nextButton: '.swiper-button-next',
                    prevButton: '.swiper-button-prev',
                },
                $isSlider = $('.js-is-slider');

            var $isSwiper = $isSlider.swiper(configIsSlider);            
        }

        if($('.js-detail-slider').length > 0){
            var configDetail = {
                    slidesPerView: 2,
                    centeredSlides: false,
                    paginationClickable: true,
                    spaceBetween: 20,
                    nextButton: '.detail-slider-button-next',
                    prevButton: '.detail-slider-button-prev',
                },
                $detailSlider = $('.js-detail-slider');

            var $detailSwiper = $detailSlider.swiper(configDetail);
        }

        if($('.js-prodaction-slider').length > 0){
            var configProdaction = {
                slidesPerView: 'auto',
                spaceBetween: 20,
                nextButton: '.product-swiper-next',
                prevButton: '.product-swiper-prev',
                },
                $prodactionSlider = $('.js-prodaction-slider');

            var productSwiper = $prodactionSlider.swiper(configProdaction);
        }

        if($('.js-office-slider').length > 0){
            var configOffice = {
                slidesPerView: 'auto',
                spaceBetween: 20,
                nextButton: '.office-swiper-next',
                prevButton: '.office-swiper-prev',
                },
                $officeSlider = $('.js-office-slider');

            var officeSwiper = $officeSlider.swiper(configOffice);
        }
    },
};

$(document).ready(function () {
    moduleApp.init();
});
//# sourceMappingURL=main.js.map
