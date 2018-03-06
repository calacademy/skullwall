Math.randomRange = function (low, high) {
	return (Math.random() * (high - low)) + low;
}

// @see
// https://github.com/stevenwanderski/bxslider-4
// http://fancyapps.com/fancybox/3/docs/

var SkullWall = function () {
	var _activeSection;
	var _activeSlideClass = '';
	var _media = new SkullWallMedia();
	var _selectEvent = Modernizr.touch ? 'touchend' : 'click';
	var _debug = (window.location.hash == '#debug');

	var _stopPropagation = function (e) {
		$(document).idleTimer('reset');
		e.preventDefault();
		e.stopPropagation();
	}

	var _isSliding = function () {
		if (_activeSection) {
			var slider = _activeSection.find('.slides').data('bxSlider');

			if (slider) {
				if (slider.isWorking()) return true;	
			}

			var controls = $('.bx-controls', _activeSection);

			if (controls.length != 1) return false;
			return controls.hasClass('disabled');
		}

		return false;	
	}

	var _onMediaButtonDown = function (e) {
		_stopPropagation(e);

		if (Modernizr.touch) {
			if (e.type != 'touchstart') return false;
		}

		$(e.target).addClass('highlight');

		return false;
	}

	var _onMediaButtonOut = function (e) {
		_stopPropagation(e);

		$(e.target).removeClass('highlight');

		return false;
	}

	var _onMediaButtonUp = function (e) {
		_stopPropagation(e);

		if (Modernizr.touch) {
			if (e.type != 'touchend') return false;
		}

		$(e.target).removeClass('highlight');
		
		if ($('html').hasClass('media') || $('html').hasClass('expanding')) return false;
		if (_isSliding()) return false;

		_media.destroy();

		if ($(this).parent().data('fancybox')) {
			$.fancybox.open($(this).parent());	
		}
		
		if ($(this).hasClass('inline-video')) {
			_media.playInlineVideo($(this).siblings('video'));
		}

		if ($(this).parent().data('sketchfab-id')) {
			_media.viewModel($(this).parent().data('sketchfab-id'));	
		}

		return false;
	}

	var _onClose = function () {
		if (_isSliding()) return false;

		var is3d = $('html').hasClass('3d');
		_media.destroy();
		
		if (is3d) {
			// jump to slide just in case
			_jumpTo3dSlide();
			return false;
		}

		if ($('body').hasClass('fancybox-active')) {
			$.fancybox.close(true);
			return false;
		}

		$('html').removeClass('content-open');
		_activeSection.removeClass('subnav-open');

		if (_activeSection.attr('id') == 'wall') {
			_closeSection(_activeSection);
			_activeSection.removeClass('collapsed');
		}

		if (_activeSection.attr('id') == 'behind') {
			// if coming from a small thumbnail, expand on carousel close
			$('#behind').removeClass('collapsed');
			$('#wall').addClass('collapsed');
			$('html').addClass('shrink-wall');
		}

		$('#map li').addClass('show');

		return false;
	}

	var _onNav = function (e) {
		if (_isSliding()) return false;

		var section = $(this).closest('section');
		var otherSection = $('section').not(section);
		var doNotExpand = (!$(this).parent().hasClass('nav-collapsed') && section.attr('id') == 'behind' && section.hasClass('collapsed'));

		if (!otherSection.hasClass('collapsed') && !doNotExpand) {
			_closeSection(otherSection);	
		}
		
		_openSection(section, $(this).data('slide'), doNotExpand);

		return false;
	}

	var _onCarouselNav = function (e) {
		$(this).removeClass('highlight');
		if (_isSliding()) return false;

		if ($(this).css('pointer-events') == 'none') {
			return false;
		}

		$('.thumbnails li').removeClass('active');
		$(this).addClass('active');
		
		$(this).closest('section').addClass('subnav-open');

		_onNav.call(this);

		return false;
	}

	var _onSlideBefore = function (slide, oldIndex, newIndex) {
		$('.inactive-slide').removeClass('inactive-slide');
		var slider = slide.parent('.slides');

		_setSliderNavText(slider);
		_setSlideClass(slider, newIndex);
		_activateWallThumbnail(slider, newIndex);
	}

	var _onSlideAfter = function (slide, oldIndex, newIndex) {
		var slider = slide.parent('.slides');
		slider.children('li').not(slide).addClass('inactive-slide');

		_media.destroy();
	}

	var _setMapThumbnailCategory = function (slide) {
		var carouselId = slide.closest('.slides').attr('id');
		if (carouselId != 'carousel-wall') return;

		$('#map li').removeClass('show');

		$('#map li').each(function () {
			if ($(this).hasClass(slide.data('category'))) {
				$(this).addClass('show');
			}
		});
	}

	var _getSlideByIndex = function (i, slider) {
		var slide = false;

		slider.children('li').each(function () {
			if ($(this).data('index') == i) {
				slide = $(this);
				return false;
			}
		});

		return slide;
	}

	var _setSliderNavText = function (slider) {
		var sliderObj = slider.data('bxSlider');
		var nav = $('.carousel-buttons', slider.closest('section'));

		var i = sliderObj.getCurrentSlide();
		var total = sliderObj.getSlideCount();

		var prev = i - 1;
		var next = i + 1;

		if (i == 0) {
			prev = total - 1;
		}

		if (i == (total - 1)) {
			next = 0;
		}
		
		var prevTitle = _getSlideByIndex(prev, slider).find('h1');
		var nextTitle = _getSlideByIndex(next, slider).find('h1');
		
		nav.find('.prev a').html('<div>' + prevTitle.html() + '</div>');
		nav.find('.next a').html('<div>' + nextTitle.html() + '</div>');
	}
	
	var _setSlideClass = function (slider, i) {
		$('html').removeClass(_activeSlideClass);
		$('#categories li').removeClass('active');

		slider.children('li').each(function () {
			if ($(this).data('index') == i) {
				_activeSlideClass = $(this).data('slide-id');
				$('html').addClass(_activeSlideClass);

				// activate subnav
				var cat = $(this).data('category');
				
				if (typeof(cat) == 'string') {
					$('#categories li.' + cat).addClass('active');
				}

				_setMapThumbnailCategory($(this));

				return false;
			}
		});
	}

	var _activateWallThumbnail = function (slider, i) {
		if (slider.attr('id') != 'carousel-wall') return;

		$('#map li').removeClass('active');

		$('#map li').each(function () {
			if ($(this).data('slide') == i) {
				$(this).addClass('active');
				return false;
			}
		});
	}

	var _jumpTo3dSlide = function () {
		var slide = $('.model-button-container').closest('li');
		var sliderObj = slide.closest('.slides').data('bxSlider');
		sliderObj.jumpToSlide(slide.data('index'));
	}

	var _hackBxSlider = function () {
		$('.bx-wrapper').css('max-width', '100%');
		$('.bx-viewport').css('overflow', 'visible');
	}

	var _initCarousel = function (section, i) {
		// options
		var id = $('.slides', section).attr('id');
		var slider = $('#' + id);
		var isPreviousInit = typeof(slider.data('bxSlider')) != 'undefined';

		var options = {
			speed: 600,
			controls: true,
			nextSelector: $('.next', section),
			prevSelector: $('.prev', section),
			nextText: '',
			prevText: '',
			keyboardEnabled: true,
			autoStart: false,
			shrinkItems: true,
			pager: false,
			touchEnabled: Modernizr.touch,
			onSlideBefore: _onSlideBefore,
			onSlideAfter: _onSlideAfter,
			easing: 'cubic-bezier(.215, .61, .355, 1)',
			slideWidth: $('#root').outerWidth()
		};

		if (id == 'carousel-wall') {
			var margin = 25;

			options.slideMargin = margin;
			options.slideWidth = $('#root').outerWidth() - (margin * 4);
		}

		slider.bxSlider(options);
		_hackBxSlider();

		// initial slide
		var targetSlide = isNaN(i) ? 0 : i;
		var sliderObj = slider.data('bxSlider');

		if ($('html').hasClass('content-open')) {
			sliderObj.goToSlide(targetSlide);	
		} else {
			sliderObj.jumpToSlide(targetSlide);

			// sometimes bxSlider doesn't propery activate the pager
			section.find('.bx-pager a[data-slide-index="' + targetSlide + '"]').addClass('active');
		}

		_setSlideClass(slider, targetSlide);
		_activateWallThumbnail(slider, targetSlide);

		if (!isPreviousInit) {
			_onSlideAfter(sliderObj.getSlideElement(targetSlide));
			_setSliderNavText(slider);	
		}

		// media buttons
		$('.media-button').off();

		if (Modernizr.touch) {
			$('.media-button').on('MSPointerLeave pointerleave MSPointerCancel pointercancel MSPointerOut pointerout', _onMediaButtonOut);
			$('.media-button').on('touchstart touchmove MSPointerMove pointermove MSPointerDown pointerdown', _onMediaButtonDown);
			$('.media-button').on('touchend MSPointerUp pointerup', _onMediaButtonUp);
		} else {
			$('.media-button').on('mouseout', _onMediaButtonOut);
			$('.media-button').on('mousedown', _onMediaButtonDown);
			$('.media-button').on('mouseup', _onMediaButtonUp);
		}
	}

	var _initCollapsedInteraction = function () {
		$('section').off();

		$('section').on(_selectEvent, function (e) {
			$(this).removeClass('highlight');
			var btn = $(this).find('.nav-collapsed li');

			if ($(this).hasClass('collapsed')) {
				_stopPropagation(e);

				btn.removeClass('highlight');
				btn.trigger(_selectEvent);

				return false;
			}
		});
		$('section').on('pointerdown mousedown mouseover touchstart', function () {
			$(this).addClass('highlight');
			var btn = $(this).find('.nav-collapsed li');

			if ($(this).hasClass('collapsed')) {
				btn.addClass('highlight');
			}
		});
		$('section').on('pointerout mouseout', function () {
			$(this).removeClass('highlight');
			var btn = $(this).find('.nav-collapsed li');
			
			if ($(this).hasClass('collapsed')) {
				btn.removeClass('highlight');	
			}
		});
	}

	var _openSection = function (section, slide, doNotExpand) {
		_activeSection = section;
			
		if (!doNotExpand) {
			section.removeClass('collapsed');

			// trigger fade anim
			if (!section.hasClass('open')) {
				section.find('.thumbnails').hide().show(0);
			}
		}

		section.addClass('open');

		var openId = section.attr('id');
		var closedId = $('section').not(section).attr('id');

		$('html').removeClass(closedId + '-active');
		$('html').addClass(openId + '-active');

		if (!doNotExpand) {
			if (openId == 'behind') {
				$('html').addClass('shrink-wall');	
			} else {
				$('html').removeClass('shrink-wall');	
			}
		}

		if (!section.hasClass('subnav-open')) {
			return;
		}

		_initCarousel(section, slide);
		$('html').addClass('content-open');
	}

	var _closeSection = function (section) {
		section.removeClass('open');
		section.removeClass('subnav-open');
		section.removeClass('highlight');
		section.addClass('collapsed');
		section.find('.active').removeClass('active');
		section.find('.highlight').removeClass('highlight');

		$('#map li').addClass('show');
		$('html').removeClass('content-open');
		$('html').removeClass('shrink-wall');
		$('html').removeClass(_activeSlideClass);
		$('html').removeClass(section.attr('id') + '-active');

		// trigger fade anim
		section.find('.thumbnails').hide().show(0);

		_initCollapsedInteraction();
	}

	var _initNav = function () {
		_initCollapsedInteraction();
		$('#close').on(_selectEvent, _onClose);
		$('.nav-collapsed li').on(_selectEvent, _onNav);
	}

	var _configThumbnailPositions = function () {
		$('#map li').addClass('active');
		$('#map li').css('pointer-events', 'all');
		$('#map li').draggable();
		
		$('h1').on('click', function () {
			var obj = {};

			$('#map li').each(function () {
				obj[$(this).data('slide-id')] = {
					'left': $(this).css('left'),
					'top': $(this).css('top')
				};
			});

			console.log(JSON.stringify(obj));

			return false;
		});

		$('#map li').addClass('show');
	}

	var _initMapThumbnails = function () {
		var positions = SKULLWALL_CONFIG.thumbnailPositions;

		$('#map li').each(function () {
			var id = $(this).data('slide-id');

			// position map thumbnails
			var pos = positions[id];

			$(this).css({
				'left': pos.left,
				'top': pos.top
			});

			// add category classes
			var thumbnail = $(this);

			$('#wall .slides > li').each(function () {
				if ($(this).data('slide-id') == id) {
					thumbnail.addClass($(this).data('category'));
					return false;
				}
			});

			$(this).addClass('show');
		});

		if (Modernizr.touch) {
			$('#map li').on('touchstart', function () {
				$(this).addClass('highlight');
			});
		}
	}

	var _initCarouselNav = function () {
		// attach slide data to nav elements
		$('.slides > li').each(function () {
			$(this).addClass($(this).data('category'));

			var slideId = $(this).data('slide-id');
			var i = $(this).index();

			$(this).data('index', i);

			if (typeof(slideId) == 'undefined') {
				return true;
			}
			
			// attach data
			$('.carousel-nav li').each(function () {
				if ($(this).data('slide-id') == slideId) {
					$(this).data('slide', i);
				}
			});
		});

		// subnav for wall
		$('#categories li').each(function () {
			var cat = $(this).data('category');

			// assign to first slide of this cat
			var slide = $('#wall .slides li.' + cat).eq(0);

			$(this).data('slide-id', slide.data('slide-id'));
			$(this).data('slide', slide.data('index'));

			$(this).addClass(cat);
		});

		$('.carousel-nav li').on(_selectEvent, _onCarouselNav);
	}

	var _onExpandBeforeShow = function (instance, current) {
		$('html').addClass('expanding');
	}

	var _onExpandBeforeClose = function (instance, current) {
		// force redraw hack for disappearing section on fancybox expand
		if (_activeSection) {
			_activeSection.hide().show(0);
			_activeSection.attr('style', '');
		}

		// make sure we're on the right slide
		var slide = current.opts.$orig.closest('li');
		var sliderObj = slide.closest('.slides').data('bxSlider');

		sliderObj.jumpToSlide(slide.data('index'));
	}

	var _onExpandAfterClose = function (instance, current) {
		$('html').removeClass('expanding');
	}

	var _initImageZoom = function () {
		$.fancybox.defaults.protect = true;
		$.fancybox.defaults.infobar = false;
		$.fancybox.defaults.toolbar = false;
		$.fancybox.defaults.arrows = false;
		$.fancybox.defaults.hash = false;
		$.fancybox.defaults.touch = false;
		$.fancybox.defaults.keyboard = false;
		$.fancybox.defaults.slideShow = false;
		$.fancybox.defaults.thumbs = false;

		$.fancybox.defaults.buttons = [];
		$.fancybox.defaults.margin = [0, 0, 0, 0];
		$.fancybox.defaults.dblclickContent = 'close';
		
		$.fancybox.defaults.beforeShow = _onExpandBeforeShow;
		$.fancybox.defaults.beforeClose = _onExpandBeforeClose;
		$.fancybox.defaults.afterClose = _onExpandAfterClose;

		$('#wall .image').each(function () {
			var id = $(this).closest('li').data('slide-id');
			var mediumSrc = 'images/wall/medium/' + id + '.png';
			var largeSrc = 'images/wall/large/' + id + '.png';
			
			$(this).parent().css('background-image', 'url(' + mediumSrc + ')');

			// for preloading
			$('#preload').append('<img src="' + largeSrc + '" />');

			// so fancybox knows where to shrink to
			$(this).append('<img src="' + mediumSrc + '" />');

			// expand button
			var btn = $('<button>Expand</button>');
			btn.addClass('media-button');
			$(this).append(btn);
		});
	}

	var _styleImages = function () {
		$('#map .thumbnails li').each(function () {
			var id = $(this).data('slide-id');
			$(this).css('background-image', 'url(images/wall/small/' + id + '.png)');
		});

		$('#behind .thumbnails img').each(function () {
			var li = $(this).parent();
			var container = $('<div />');

			li.addClass(li.data('slide-id'));
			
			container.addClass('img-container');
			container.css('background-image', 'url("' + $(this).attr('src') + '")');
			$(this).wrap(container);
		});

		$('#behind .image img').each(function () {
			var src = $(this).attr('src');
			$(this).parent().css('background-image', 'url("' + src + '")');
		});
	}

	var _initIdleTimer = function () {
		$(document).idleTimer({
			timeout: SKULLWALL_CONFIG.idleSeconds * 1000
		});

    	$(document).on('videoended', function () {
			$(document).idleTimer('reset');
    	});

		$(document).on('idle.idleTimer', function (event, elem, obj) {
			if ($('html').hasClass('video-playing')) {
				$(document).idleTimer('reset');
				return;
			}

			console.log('idle.idleTimer');

			// @todo
			// reset to English

			_media.destroy();
			$.fancybox.close(true);
			$('html').removeClass('content-open');
			
			if (_activeSection) {
				_activeSection.removeClass('subnav-open');
				_closeSection(_activeSection);
			}
			
			$('html').removeClass('expanding');
			$('html').removeClass(_activeSlideClass);
			$('section').first().removeClass('collapsed');

			$('html').addClass('attract');
    	});

    	$(document).on('active.idleTimer', function (event, elem, obj, triggerevent) {
    		console.log('active.idleTimer');
    		$('html').removeClass('attract');
    	});

    	window.addEventListener('message', _onSketchfabInteraction, false);
	}

	var _onSketchfabInteraction = function (e) {
		if (e.data == 'userinteraction') {
			$(document).idleTimer('reset');
		}
	}

	this.initialize = function () {
		_initImageZoom();
		
		// _configThumbnailPositions();
		
		_initMapThumbnails();
		_styleImages();
		_initCarouselNav();
		_initNav();

		_initIdleTimer();
	}

	this.initialize();
}
