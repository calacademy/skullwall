(function ($) {
	console.log('Skull Wall extension running…');

	var _onInteraction = function (e) {
		window.top.postMessage('userinteraction', '*');
	}

	$(document).on('mousemove keydown wheel DOMMouseScroll mousewheel mousedown touchstart touchmove MSPointerDown MSPointerMove', _onInteraction);
})(jQuery);
