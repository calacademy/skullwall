(function ($) {
	console.log('Skull Wall extension running…');

	$('<link />', {
		rel: 'stylesheet',
		type: 'text/css',
		href: 'https://s3.us-west-2.amazonaws.com/skullwall.calacademy.org/chrome-extension/SkullWall/css/sketchfab.css'
	}).appendTo('head');

	var _onInteraction = function (e) {
		window.top.postMessage('userinteraction', '*');
	}

	$(document).on('mousemove keydown wheel DOMMouseScroll mousewheel mousedown touchstart touchmove MSPointerDown MSPointerMove', _onInteraction);
})(jQuery);
