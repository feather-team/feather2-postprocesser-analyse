'use strict';

//添加define头部

var DEFINE_REG = /\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|\.define|\b(define)\s*\(\s*((?:(?!function\()[\s\S])+,)?\s*function\(/g;
var amdReg = /(\(\s*|&&\s*)define\.amd/;

module.exports = function(content, file){
    if(file.useJsWraper === false) return content;

    if(/\/\/!useJsWraper/.test(content)){
        return content;
    }

    var found = false;

    if(amdReg.test(content)){
        return "define('" + file.id + "', function(require, exports, module){\r\n" + content + "\r\n});";
    }

    content = content.replace(DEFINE_REG, function(all, define, cont){
        if(define && !found){
            found = true;
            return 'define("' + file.id + '", function(';
        }
        
        return all;
    });

    if(!found){
        content = "define('" + file.id + "', function(require, exports, module){\r\n" + content + "\r\n});";
    }

    return content;
};  