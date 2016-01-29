'use strict';

var REG = /<script(\s+[^>]*?feather-script2bottom\b[^>]*)>([\s\S]*?<\/script>)/g;
var TPL = feather.util.read(__dirname + '/../vendor/tpl/script2bottom.php');

module.exports = function(content, file, conf){
	return content.replace(REG, function(all, _1, _2){
		return TPL.replace('#content#', '<script' + _1.replace(/\s*feather-script2bottom\s*/, ' ').replace(/\s+$/, '') + '>' + _2);
	});
};