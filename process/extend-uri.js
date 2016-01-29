'use strict';

var REG = /:::FEATHER#URI:::([\s\S]+?):::END:::/g;

function extendUriAfter(content, file){
	return content.replace(REG, '$1');
}

module.exports = function(content, file, conf){
	if(file.isHtmlLike || file.isJsLike){
		content = extendUriAfter(content, file);
	}

	return content;
};