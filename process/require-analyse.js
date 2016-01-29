/*
压缩前分析require-async
*/
'use strict';

var SCRIPT_REG = /<!--(?:(?!\[if [^\]]+\]>)[\s\S])*?-->|(<script[^>]*>)([\s\S]*?)<\/script>/ig;
var REQUIRE_REG = /"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|(?:\/\/[^\r\n\f]+|\/\*[\s\S]*?(?:\*\/|$))|require\.async\(([\s\S]+?)(?=,\s*function\(|\))|require\(([^\)]+)\)/g, URL_REG = /['"]([^'"]+)['"]/g;
var USE_REQUIRE = feather.config.get('require.use');

var path = require('path');

function getModuleId(id, file, sync){
    var info = feather.project.lookup(id, file);
                    
    if(info.file && info.file.isFile()){
        id = info.file.id;
    }else{
        if(id == 'abc'){
            id = 'static/abc.js';
        }
    }

    if(sync){
        file.addRequire(id);
    }else{
        file.addAsyncRequire(id);
    }

    return id;
}

function analyseRequire(content, file){
    return content.replace(REQUIRE_REG, function(all, asyncIds, id){
        if(asyncIds){
            return 'require.async(' + asyncIds.replace(URL_REG, function(all, id){
                if(id){
                    return "'" + getModuleId(id, file) + "'";
                }

                return all;
            });
        }else if(id){
            return "require('" + getModuleId(id, file, true) + "')";
        }

        return all;
    });
}

module.exports = function(content, file, conf){
    if(!USE_REQUIRE) return content;

    if(file.isHtmlLike){
        content = content.replace(SCRIPT_REG, function(all, tag, script){
            if(script){
                return tag + analyseRequire(script, file) + '</script>';
            }

            return all;
        });
    }else if(file.isJsLike){
        content = analyseRequire(content, file);
    }

    return content;
};
