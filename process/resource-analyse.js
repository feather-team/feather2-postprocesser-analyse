'use strict';

var RESOURCE_REG = /[\r\n]*(?:<!--[\s\S]*?-->|<script(\s+[^>]*?src=['"]([^'"]+)['"][^>]*)>\s*<\/script>|<link(\s+[^>]*?href=['"]([^'"]+)['"][^>]*)>)[\r\n]*/ig;
var FIXED = /\bfixed\b/i, HEAD = /\bhead\b/i, DESTIGNORE = /\bignore\b/i;
var ISCSS = /rel=["']?stylesheet['"]?/i;
var _ = require('../util.js');

module.exports = function(content, file, conf){
    var headJs = [], bottomJs = [], css = [], content;

    content = content.replace(RESOURCE_REG, function(all, scriptContent, src, linkContent, href){
        //如果是fixed 跳过
        if(scriptContent){
            if(!FIXED.test(scriptContent)){
                if(!feather.isPreviewMode && !DESTIGNORE.test(scriptContent) || feather.isPreviewMode){
                    HEAD.test(scriptContent) ? headJs.push(src) : bottomJs.push(src);
                }

                return '';
            }else{
                return '<script ' + scriptContent
                .replace(/\s*fixed\s*/, ' ').trim() + '></script>';
            }
        }else if(linkContent && ISCSS.test(linkContent)){
            if(!FIXED.test(linkContent)){
                if(!feather.isPreviewMode && !DESTIGNORE.test(linkContent) || feather.isPreviewMode){
                    css.push(href);
                }

                return '';
            }else{
                return '<link ' + linkContent.replace(/\s*fixed\s*/, ' ').trim() + '>';
            }
        }

        return all;
    });

    var sameCss = _.same(file, feather.config.get('project.fileType.css'));

    if(sameCss && sameCss.exists()){
        css.push(sameCss.id);
    }

    file.extras.headJs = feather.util.unique((file.extras.headJs || []).concat(headJs));
    file.extras.bottomJs = feather.util.unique((file.extras.bottomJs || []).concat(bottomJs));
    file.extras.css = feather.util.unique((file.extras.css || []).concat(css));

    return content;
};
