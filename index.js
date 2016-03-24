'use strict';

var USE_REQUIRE = feather.config.get('require.use');
var PROCESSES = {
	'widget-analyse': require('./process/widget-analyse.js'),
	'resource-analyse': require('./process/resource-analyse.js'),
	'resource-position': require('./process/resource-position.js'),
	'script2bottom': require('./process/script2bottom.js'),
	'extend-uri': require('./process/extend-uri.js'),
	'pagelet': require('./process/pagelet.js'),
	'pagelet-analyse': require('./process/pagelet-analyse.js'),
	'require-analyse': require('./process/require-analyse.js'),
	'define-wraper': require('./process/define-wraper.js')
};

module.exports = function(content, file, conf){
	var CHINAS = ['extend-uri', 'define-wraper'];

	if(file.isHtmlLike){
		CHINAS.push('widget-analyse', 'resource-analyse', 'script2bottom');

		if(!file.isPagelet && !file.isWidget && USE_REQUIRE){
			CHINAS.push('pagelet-analyse');
		}
	}

	CHINAS.push('require-analyse');

	if(file.isHtmlLike && file.isPagelet && USE_REQUIRE){
		CHINAS.push('pagelet');
	}

	if(file.isHtmlLike){
		CHINAS.push('resource-position');
	}

	CHINAS.forEach(function(item){
		content = PROCESSES[item](content, file, conf);
	});

	return content;
};