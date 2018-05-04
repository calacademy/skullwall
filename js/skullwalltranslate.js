var SkullWallTranslate = function (data) {
	var _languages = ['en', 'cn', 'tl', 'es'];
	var _event = Modernizr.touch ? 'touchend' : 'click';

	var _populateSpecimens = function () {
		$.each(data.specimens, function (i, obj) {
			var slide = $('.slides > li[data-slide-id="' + obj.slug + '"]');
			if (slide.length != 1) return true;

			// subhead / body
			$.each(['subhead', 'body'], function (i, field) {
				var container = slide.find('.' + field);
				if (container.length != 1) return true;

				$.each(_languages, function (i, lg) {
					var lgField = $('<div />');
					lgField.addClass(lg);
					lgField.html(obj[field + '_' + lg]);

					container.append(lgField);
				});

				// remove empty
				if ($.trim(container.text()) == '') {
					container.remove();
				}
			});

			// details
			$.each(obj.details, function (i, detail) {
				var li = $('<li />');

				$.each(_languages, function (i, lg) {
					var lgField = $('<div />');
					lgField.addClass(lg);
					
					var header = $('<h3 />');
					header.html(detail['header_' + lg].safe_value);

					lgField.append(header);
					lgField.append(detail['desc_' + lg].safe_value);

					li.append(lgField);
				});

				slide.find('.data').append(li);
			});
		});
	}

	var _populateSlides = function () {
		$.each(data.slides, function (i, slide) {
			var els = $('.slides > li[data-slide-id="' + slide.slug + '"], .thumbnails > li[data-slide-id="' + slide.slug + '"]');
			if (els.length != 2) return true;

			els.each(function () {
				var el = $(this);

				$.each(['title', 'subtitle', 'body', 'caption', 'photocredit'], function (i, field) {
					var container = el.find('.' + field);
					if (container.length != 1) return true;

					$.each(_languages, function (i, lg) {
						var lgField = $('<div />');
						lgField.addClass(lg);
						lgField.html(slide[field + '_' + lg]);

						container.append(lgField);
					});

					// remove empty
					if ($.trim(container.text()) == '') {
						container.remove();
					}
				});
			});
		});
	}

	var _populateMisc = function () {
		var dataObj = data.misc[0];

		// sketchfab
		$('.model-button-container').data('sketchfab-id', dataObj.sketchfab_id);

		// buttons
		$.each(dataObj.buttons, function (i, btn) {
			$('.buttons .' + btn.slug).each(function () {
				var el = $(this);

				$.each(_languages, function (i, lg) {
					var lgField = $('<div />');
					lgField.addClass(lg);
					lgField.html(btn[lg].safe_value);

					el.append(lgField);
				});
			});
		});

		// section titles
		_populateSectionTitles(['title', 'subtitle'], $('#wall header .misc'));
		_populateSectionTitles(['bts_title', 'bts_subtitle'], $('#behind .misc'));
		_populateSectionTitles(['sti_title', 'sti_body', 'sti_cta'], $('.imposter.misc'));

		// caption files
		$('video track').each(function () {
			var lg = $(this).attr('srclang');
			$(this).attr('src', dataObj['vtt_' + lg] + '?nocache=' + Math.random());
		});
	}

	var _populateSectionTitles = function (fields, el) {
		$.each(fields, function (i, field) {
			var container = el.find('.' + field);
			
			$.each(_languages, function (i, lg) {
				var lgField = $('<div />');
				lgField.addClass(lg);
				lgField.html(data.misc[0][field + '_' + lg]);

				container.append(lgField);
			});
		});
	}

	var _onLgSelect = function (e) {
		$('#languages li').removeClass('active');
		$(e.target).addClass('active');

		$('html').attr('lang', $(e.target).attr('id'));
		$(document).trigger('languagechange');

		return false;
	}

	var _initInteraction = function () {
		$('#languages li').on(_event, _onLgSelect);
	}

	this.reset = function () {
		$('#languages #en').trigger(_event);
	}

	this.initialize = function () {
		console.log(data);
		
		_populateMisc();
		_populateSpecimens();
		_populateSlides();

		// unwrap any links
		$.each(_languages, function (i, lg) {
			$('.' + lg + ' a').contents().unwrap();
		});

		_initInteraction();
	}

	this.initialize();
}
