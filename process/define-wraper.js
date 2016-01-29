'use strict';

//添加define头部

var DEFINE_REG = /\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|\b(define)\s*\(\s*((?:(?!function\()[\s\S])+,)?\s*function\(/g;
var USE_REQUIRE = feather.config.get('require.use');

module.exports = function(content, file){
    if(!USE_REQUIRE) return content;

    if(file.isJsLike){
        var found = false;

        content = content.replace(DEFINE_REG, function(all, define, depth){
            if(define){
                found = true;

                if(depth == null || depth[0] == '['){
                    return 'define("' + file.id + '",' + (depth || '') + 'function(';
                }
            }
            
            return all;
        });

        if(!found){
            content = "define('" + file.id + "', function(require, exports, module){\r\n" + content + "\r\n});";
        }
    }

    return content;
};