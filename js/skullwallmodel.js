var SkullWallModel = function () {
	var _endpoint = 'https://giants.calacademy.org/rest/';
	var _callbackData = { callback: '_jqjsp' };
	var _timeout = 12000;

	var _data = {
		'slides': 'skull-wall-slides',
		'specimens': 'skull-wall-specimens',
		'misc': 'skull-wall-misc'
	};

	var _onSuccess = function () {
		$(document).trigger('skullwallmodel.success', [_data]);
	}

	var _onError = function () {
		$(document).trigger('skullwallmodel.error');
	}

	var _onData = function (key, data) {
		_data[key] = data;

		var success = true;

		$.each(_data, function (i, val) {
			if (!$.isArray(val)) {
				success = false;
				return false;
			}
		});

		if (success) {
			_onSuccess();	
		}
	}

	var _requestJsonp = function (path, success, error) {
		$.jsonp({
			timeout: _timeout,
			data: _callbackData,
			url: _endpoint + path + '.jsonp',
			success: function (data, textStatus) {
				success(data);
			},
			error: _onError
		});
	}

	this.initialize = function () {
		$.each(_data, function (key, val) {
			_requestJsonp(val, function (data) {
				_onData(key, data);
			});
		});
	}

	this.initialize();
}
