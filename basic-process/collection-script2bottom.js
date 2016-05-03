'use strict';

var REG = /<script(\s+[^>]*?feather-script2bottom\b[^>]*)>([\s\S]*?<\/script>)/g;

module.exports = function(content, file, conf){
	var scripts = [];

	return content.replace(REG, function(all, _1, _2){
		scripts.push('<script' + _1.replace(/\s*feather-script2bottom\s*/, ' ').replace(/\s+$/, '') + '>' + _2);
		return '';
	});

	if(scripts.length){
		file.extras.scripts = scripts;
	}

	return content;
};