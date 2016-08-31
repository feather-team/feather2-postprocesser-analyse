/*
压缩前分析require-async
*/
'use strict';

var SCRIPT_REG = /<!--(?:(?!\[if [^\]]+\]>)[\s\S])*?-->|(<script[^>]*>)([\s\S]*?)<\/script>/ig;
var REQUIRE_REG = /"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|(?:\/\/[^\r\n\f]+|\/\*[\s\S]*?(?:\*\/|$))|require\.async\(([\s\S]+?)(?=,\s*function\(|\))|require\(([^\)]+)\)/g, URL_REG = /['"]([^'"]+)['"]/g;

function getModuleId(id, file, sync){
    var info = feather.project.lookup(id, file);

    if(!info.file || !info.file.isFile()){
        id = feather.util.stringQuote(id).rest;

        if(!/\.[^\.\/]+$/.test(id)){
            id += '.js';
        }
    }

    info = feather.project.lookup(id, file);

    if(info.file && info.file.isFile() || /^\/?static\/pagelet.js$/.test(info.id)){
        id = info.file ? info.file.id : 'static/pagelet.js';

        if(sync){
            file.addRequire(id);
        }else{
            file.addAsyncRequire(id);
        }
    }else{
        id = info.rest;
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

        var sameJs = feather.file(feather.project.getProjectPath() + file.subpath.replace(/\.[^\.]+$/, '.js'));
        var sameJsId = sameJs.id;

        if(file.asyncs.indexOf(sameJsId) == -1 && sameJs.exists()){
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
    }else if(file.isJsLike){
        content = analyseRequire(content, file);
    }

    return content;
};
