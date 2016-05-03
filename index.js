'use strict';

var USE_REQUIRE = feather.config.get('require.use');
var PHP_MODE = feather.config.get('project.mode') == 'php';
var PROCESSES = {
	'widget-analyse': PHP_MODE ? require('./process/widget-analyse.js') : require('./basic-process/widget-analyse.js'),
	'resource-analyse': require('./process/resource-analyse.js'),
	'resource-position': require('./process/resource-position.js'),
	'script2bottom': require('./process/script2bottom.js'),
	'extend-uri': require('./process/extend-uri.js'),
	'pagelet': PHP_MODE ? require('./process/pagelet.js') : require('./basic-process/pagelet.js'),
	'pagelet-analyse': PHP_MODE ? require('./process/pagelet-analyse.js') : require('./basic-process/pagelet-analyse.js'),
	'require-analyse': require('./process/require-analyse.js'),
	'define-wraper': require('./process/define-wraper.js'),
	'collection-script2bottom': require('./basic-process/collection-script2bottom.js')
};

module.exports = function(content, file, conf){
	var CHINAS = ['extend-uri', 'define-wraper'];

	if(file.isHtmlLike){
		CHINAS.push('widget-analyse', 'resource-analyse');
	}

	CHINAS.push('require-analyse');

	if(file.isHtmlLike){
		if(USE_REQUIRE){
			if(!file.isPagelet && !file.isWidget){
				CHINAS.push('pagelet-analyse');
			}else if(file.isPagelet){
				CHINAS.push('pagelet');
			}
		}
	}

	if(file.isHtmlLike && PHP_MODE){
		CHINAS.push('resource-position', 'script2bottom');
	}else{
		CHINAS.push('collection-script2bottom');
	}

	CHINAS.forEach(function(item){
		content = PROCESSES[item](content, file, conf);
	});

	return content;
};