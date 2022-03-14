var SkullWallMedia = function () {
	var _container;
	var _prog;

	var _onVideoEnded = function (e) {
		_removeCueChangeListeners();
		
		$(this).get(0).load();
		$('html').removeClass('video-playing');
		$(document).trigger('videoended');
	}

	var _onCueChange = function (e) {
		var cue = this.activeCues[0];
		
		if (cue) {
			var container = $('.caption-container .' + this.language);
			container.html('<p>' + cue.text + '</p>');

			// console.log(this.language + ': ' + cue.text);		
		}
	}

	var _removeCueChangeListeners = function () {
		var video = $('video').get(0);

		if (video.textTracks) {
			$.each(video.textTracks, function (i, track) {
				$(track).off();
			});
		}
	}

	var _initCustomCaptions = function () {
		_removeCueChangeListeners();
		$('.caption-container').empty();

		var video = $('video').get(0);

		if (video.textTracks) {
			$.each(video.textTracks, function (i, track) {
				track.mode = 'hidden';

				var div = $('<div />');
				div.addClass(track.language);
				$('.caption-container').append(div);

				$(track).on('cuechange', _onCueChange);
			});
		}
	}

	var _onVideoProgress = function (e) {
		var per = this.currentTime / this.duration;
		if (_prog) _prog.update(per);
	}

	var _initProgressIndicator = function (video) {
		_prog = new ProgressIndicator(video.siblings('.progress-indicator'), true);

		video.off('timeupdate');
		video.on('timeupdate', _onVideoProgress);
	}

	var _downloadPoster = function (model) {
		model.toBlob().then(function (blob) {
			// download file via base64
			var reader = new FileReader();
			reader.readAsDataURL(blob); 
			
			reader.onloadend = function() {
				var download = document.createElement('a');
				download.href = reader.result;
				download.download = 'poster.png';
				download.click();
			}
		});	
	}

	var _onModelVisible = function (e) {
		if (!e.detail) return;
		if (!e.detail.visible) return;

		this.removeEventListener('model-visibility', _onModelVisible);
		$('html').removeClass('loading');

		// _downloadPoster(this);
	}

	this.viewModel = function (id) {
		// @see
		// https://modelviewer.dev/docs/

		$('html').addClass('media');
		$('html').addClass('3d');
		$('html').addClass('viewing-model');
		$('html').addClass('loading');

		var modelHtml = '<model-viewer touch-action="none" seamless-poster camera-controls';
		
		modelHtml += ' min-field-of-view="0deg"';
		modelHtml += ' shadow-intensity="1"';
		modelHtml += ' exposure="0.65"';
		modelHtml += ' interpolation-decay="50"';
		modelHtml += ' src="model/model.glb"';
		modelHtml += ' poster="model/poster.png"';

		modelHtml += '>';

		// remove some default UI
		modelHtml += '<div slot="progress-bar"></div>';
		modelHtml += '<div slot="interaction-prompt"></div>';
		
		modelHtml += '</model-viewer>';
		
		_container.append(modelHtml);

		var model = $('model-viewer').get(0);
		model.addEventListener('model-visibility', _onModelVisible);
	}

	this.viewImage = function (src) {
		var img = $('<img />');
		img.attr('src', src);

		_container.append(img);
		
		$('html').addClass('media');
	}

	this.playInlineVideo = function (video, lg) {
		video.off('ended');
		video.on('ended', _onVideoEnded);

		_initProgressIndicator(video);
		_initCustomCaptions();

		video.get(0).play();

		$('html').addClass('video-playing');
	}

	this.playVideo = function (src, lg) {
		var video = $('<video />');
		video.attr('src', src);

		_container.append(video);
		
		$('html').addClass('media');
		
		_initProgressIndicator(video);
		video.get(0).play();
	}

	this.destroy = function () {
		_removeCueChangeListeners();

		$('video').off('timeupdate');
		$('video').off('ended');
		
		$('video').each(function () {
			this.load();
		});

		$('html').removeClass('video-playing');
		$('html').removeClass('3d');
		$('html').removeClass('viewing-model');
		$('html').removeClass('media');
		$('html').removeClass('loading');
		
		_container.empty();
	}

	this.initialize = function () {
		_container = $('#media-overlay');
	}

	this.initialize();
}
