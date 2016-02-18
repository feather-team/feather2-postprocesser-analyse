/*
压缩前分析require-async
*/
'use strict';

var SCRIPT_REG = /<!--(?:(?!\[if [^\]]+\]>)[\s\S])*?-->|(<script[^>]*>)([\s\S]*?)<\/script>/ig;
var REQUIRE_REG = /"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|(?:\/\/[^\r\n\f]+|\/\*[\s\S]*?(?:\*\/|$))|require\.async\(([\s\S]+?)(?=,\s*function\(|\))|require\(([^\)]+)\)/g, URL_REG = /['"]([^'"]+)['"]/g;
var USE_REQUIRE = feather.config.get('require.use'), REQUIRE_CONFIG = feather.config.get('require.config') || {};

var path = require('path');

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
    if(!USE_REQUIRE) return content;

    if(file.isHtmlLike){
        content = content.replace(SCRIPT_REG, function(all, tag, script){
            if(script){
                return tag + analyseRequire(script, file) + '</script>';
            }

            return all;
        });

        if(!file.isPagelet){
            var sameJs = feather.file.wrap(file.id.replace(/\.[^\.]+$/, '.js'));
    
            if(sameJs.exists()){
                feather.compile(sameJs);
                
                var url = sameJs.getUrl();

                if(file.asyncs.indexOf(sameJs.id) == -1
                    && file.extras.headJs.indexOf(url) == -1
                    && file.extras.bottomJs.indexOf(url) == -1
                ){
                    if(/<\/body>/.test(content)){
                        content = content.replace(/<\/body>/, function(){
                            return '<script>require.async(\'' + sameJs.id + '\');</script></body>';
                        });
                    }else{
                        content += '<script>require.async(\'' + sameJs.id + '\');</script>';
                    }

                    file.setContent(content);
                    file.addAsyncRequire(sameJs.id);
                }
            }
        }        
    }else if(file.isJsLike){
        content = analyseRequire(content, file);
    }

    return content;
};
