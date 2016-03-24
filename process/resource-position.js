'use strict';

var HEAD_REG = /<!--FEATHER STATIC POSITION:HEAD-->|(<\/head>)/i, BOTTOM_REG = /<!--FEATHER STATIC POSITION:BOTTOM-->|(<\/body>)/i;

var TPL_DIR = __dirname + '/../vendor/tpl/debug/';
var SUFFIX = feather.config.get('template.suffix');
var HEAD_TPL = feather.util.read(TPL_DIR + 'head.php').replace('#suffix#', SUFFIX);
var BOTTOM_TPL = feather.util.read(TPL_DIR + 'bottom.php').replace('#suffix#', SUFFIX);

module.exports = function(content, file, conf){
	if(file.isPagelet){
		return HEAD_TPL + content;
	}else{
		return content.replace(HEAD_REG, function(all, tag){
	        return HEAD_TPL + (tag || '');
	    }).replace(BOTTOM_REG, function(all, tag){
	        return BOTTOM_TPL + (tag || '');
	    });
	}
};