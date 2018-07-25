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

	this.viewModel = function (id) {
		var iframe = $('<iframe src="" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>');
		_container.append(iframe);

		var client = new Sketchfab('1.0.3', _container.find('iframe').get(0));

		client.init(id, {
			success: function onSuccess (api) {
				api.start();
			},
			error: function onError () {
				console.log('sketchfab viewer error! :(');
			},
			autospin: 0.2,
			autostart: 1,
			ui_infos: 0,
			ui_controls: 0,
			ui_stop: 0,
			ui_watermark: 0
		});

		$('html').addClass('media');
		$('html').addClass('3d');
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
		$('html').removeClass('media');
		
		_container.empty();
	}

	this.initialize = function () {
		_container = $('#media-overlay');
	}

	this.initialize();
}
