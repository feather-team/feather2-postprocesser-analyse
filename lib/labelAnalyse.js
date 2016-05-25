var ATTR_REG = /\s+([^'"\s]+)(?:=('[^']*'|"[^"]*"|\S+)?)?(?=\s+|$)/g;

module.exports = function(str){
	var attrs = {};

	str = str.replace(/\/?\s*>$/, '');

	if(str.charAt(0) == '<'){
		var matches = str.match(/<(\S+)/);
		attrs.tagName = matches[1];
		str = str.substr(attrs.tagName.length + 1);
	}

	var rs;

	while(rs = ATTR_REG.exec(str)){
		var name = rs[1], value = rs[2];

		if(name in attrs){
			continue;
		}

		try{
			value = (new Function('return ' + value + ' == undefined ? true : ' + value))();
		}catch(e){
			throw new Error('attr [' + name + '] analyse failed! ' + e.message);
		}

		attrs[name] = value;
	}

	return attrs;
};