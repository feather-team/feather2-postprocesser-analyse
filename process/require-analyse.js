/*
压缩前分析require-async
*/
'use strict';

var SCRIPT_REG = /<!--(?:(?!\[if [^\]]+\]>)[\s\S])*?-->|(<script[^>]*>)([\s\S]*?)<\/script>/ig;
var REQUIRE_REG = /"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|(?:\/\/[^\r\n\f]+|\/\*[\s\S]*?(?:\*\/|$))|require\.async\(([\s\S]+?)(?=,\s*function\(|\))|require\(([^\)]+)\)/g, URL_REG = /['"]([^'"]+)['"]/g;
var _ = require('../util.js');

function requireReplaceRules(id){
    feather.config.get('require.config.rules', []).forEach(function(item){
        id = id.replace(item[0], item[1]);
    }); 

    return id;
}

function getModuleId(id, file, sync){
    if(/^\/?static\/pagelet(?:.js)?$/.test(id)){
        id = 'static/pagelet.js';
    }else{
        id = feather.util.stringQuote(id).rest;
        id = requireReplaceRules(id);

        var info = feather.project.lookup(id, file);

        if(!info.file || !info.file.isFile()){
            if(!/\.js$/.test(id)){
                id += '.js';

                var sInfo = feather.project.lookup(id, file);

                if(!sInfo.file || !sInfo.file.isFile()){
                    return info.rest;
                }else{
                    id = sInfo.file.id;
                }
            }else{
                return info.rest;
            }
        }else{
            id = info.file.id;
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
    if(file.isHtmlLike){
        content = content.replace(SCRIPT_REG, function(all, tag, script){
            if(script){
                return tag + analyseRequire(script, file) + '</script>';
            }

            return all;
        });

        var sameJs = _.same(file, feather.config.get('project.fileType.js', []));

        if(sameJs){
            var sameJsId = sameJs.id;

            if(file.asyncs.indexOf(sameJsId) == -1){
                if(/<\/body>/.test(content)){
                    content = content.replace(/<\/body>/, function(all){
                        return '<script>require.async(\'' + sameJsId + '\');</script>' + all;
                    });
                }else{
                    content += '<script>require.async(\'' + sameJsId + '\');</script>';
                }

                file.setContent(content);
                file.addAsyncRequire(sameJsId);
            }       
        }
    }else if(file.isJsLike){
        content = analyseRequire(content, file);
    }

    return content;
};
