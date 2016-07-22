'use strict';

var PROCESSES = {
	'resource-analyse': require('./process/resource-analyse.js'),
	'pagelet': require('./process/pagelet.js'),
	'require-analyse': require('./process/require-analyse.js'),
	'define-wraper': require('./process/define-wraper.js')
};

module.exports = function(content, file, conf){
	var CHINAS = [];

	if(file.isHtmlLike){
		CHINAS.push('resource-analyse');
	}

	CHINAS.push('require-analyse');

	if(file.isJsLike){
		CHINAS.push('define-wraper');
	}

	if(file.isHtmlLike && file.isPagelet){
		CHINAS.push('pagelet');
	}

	CHINAS.forEach(function(item){
		content = PROCESSES[item](content, file, conf);
	});

	return content;
};