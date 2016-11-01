var loadJSONP = (function() {
  var unique = 0;
  return function(url, callback, context) {
    // INIT
    var name = `_jsonp_${unique++}`;
    if (url.match(/\?/)) url += `&callback="${name}`;
    else url += `?callback="${name}`;
    
    // Create script
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    
    // Setup handler
    window[name] = function(data) {
      callback.call((context || window), data);
      document.getElementsByTagName('head')[0].removeChild(script);
      script = null;
      delete window[name];
    };
    
    // Load JSON
    document.getElementsByTagName('head')[0].appendChild(script);
  };
}());

module.exports = {
	daedalusUrl: 'localhost',
	daedalusPort: 80,
	log(message) {
		console.error(`CRIT: ${message}`);
	},

	clone(obj) {
		return JSON.parse(JSON.stringify(obj));
	},

	// concatenates all the urlSegments into one http url
	// could probably be done a bit more cleanly, but this will work for now
	generateEndpointRequestUrl(urlSegments) {
		// 0 = schemaUrl
		// 1 = endpointUrl
		const requestUrl =
			`${urlSegments[0]}/${urlSegments[1]}`;

		return requestUrl;
	},

	// concatenates all the urlSegments into one http url with query parameters
	generateRequestUrl(urlSegments, parameters) {
		var requestUrl = this.generateEndpointRequestUrl(urlSegments);

		var parameterNames = Object.keys(parameters);

		// append parameters as such: &<param_name>=<param_value>
		for (let i = 0; i < parameterNames.length; i++) {
			requestUrl += `&${parameterNames[i]}=${parameters[parameterNames[i]]}`;
		}

		return requestUrl;
	},

	// sends a vanilla js xhr request, but wrapped in an ES6 promise
	// in order to allow for contacting a separate api server, CORS has to be enabled
	// return the promise object for the user to resolve when needed
	sendXHRRequest(url, params) {
		const promise = new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			console.log(`daedalus.flascher.net/${url}`);

			xhr.open('POST', `http://daedalus.flascher.net/${url}`, true);

			xhr.onload = function onload() {
				if (this.status >= 200 && this.status <= 300) {
					resolve(this.response);
				} else {
					reject(this.statusText);
				}
			};

			xhr.onerror = function onerror() {
				reject(this.statusText);
			};

			xhr.send(params);
		});

		return promise;
	}
};