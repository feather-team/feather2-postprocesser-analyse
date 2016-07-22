/*
压缩前分析require-async
*/
'use strict';

var SCRIPT_REG = /<!--(?:(?!\[if [^\]]+\]>)[\s\S])*?-->|(<script[^>]*>)([\s\S]*?)<\/script>/ig;
var REQUIRE_REG = /"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|(?:\/\/[^\r\n\f]+|\/\*[\s\S]*?(?:\*\/|$))|require\.async\(([\s\S]+?)(?=,\s*function\(|\))|require\(([^\)]+)\)/g, URL_REG = /['"]([^'"]+)['"]/g;
var REQUIRE_CONFIG = feather.config.get('require.config') || {};
var SUFFIX_REG = new RegExp('\\.' + feather.config.get('template.suffix') + '$');
var ROOT = feather.project.getProjectPath();

function getModuleId(id, file, sync){
    var info = feather.project.lookup(id, file);

    if(info.file && info.file.isFile()){
        id = info.file.id;
    }else{
        var isRemoteUrl = feather.util.isRemoteUrl(id);

        if(!isRemoteUrl){
            id = id.replace(/^['"]+|['"]+$/g, '');

            (REQUIRE_CONFIG.rules || []).forEach(function(item){
                id = id.replace(item[0], item[1]);  
            });

            id = id.replace(/^\/+/, '');
        }
    }

    if(!isRemoteUrl){
        if(sync){
            file.addRequire(id);
        }else if(!isRemoteUrl){
            file.addAsyncRequire(id);
        }
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

        var sameJsId = file.id.replace(SUFFIX_REG, '.js');

        if(file.asyncs.indexOf(sameJsId) == -1){
            var sameJs = feather.file(ROOT, sameJsId);

            if(sameJs.exists()){
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
