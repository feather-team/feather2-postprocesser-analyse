'use strict';

/*
<pagelet id="自定义id" pid="可省略" wraper="默认textarea">
<div></div>
</pagelet>
*/

var REG = /<pagelet((?:\?>|[^>])*)>\s*([\s\S]*?)<\/pagelet>/;
var ATTR_REG = /\s+(id|pid|wraper)=(['"])((?:<\?[\s\S]+\?>|[^\2])+?)\2/g;
var pageletModuleId, ROOT = feather.project.getProjectPath();

module.exports = function(content, file, conf){
    var o = {};

    content = content.replace(REG, function(all, attrs, content){
        attrs.replace(ATTR_REG, function(all, name, quote, value){
            o[name] = value;
        });

        return content;
    });

    var wraper = (o.wraper || 'textarea').toLowerCase();
    var _id = file.subpathNoExt.replace(/\//g, '_').replace(/^_/, ''), id = o.id || _id;

    if(['script', 'style', 'textarea', 'code'].indexOf(wraper) > -1){
        content = content.replace(new RegExp('</' + wraper + '>', 'ig'), '<\\/' + wraper + '>');
    }

    var attr;

    if(/script|style/.test(wraper)){
        attr = 'type="text/html"';
    }else{
        attr = 'style="display:none !important;"';
    }

    if(o.pid){
        attr += ' data-pid="' + o.pid + '"';
    }

    file.addAsyncRequire('static/pagelet.js');
    
    var sameJs = feather.file(ROOT, file.id.replace(/\.[^\.]+$/, '.js'));

    if(sameJs.exists()){
        file.addAsyncRequire(sameJs.id);
    }

    content = '<' + wraper + ' id="' + id + '" ' + attr + '>\r\n' 
            + content + '\r\n'
            + '</' + wraper + '>'
            + '<script>\r\n'
            + '(function(){\r\n'
            + 'var self = window;\r\n'
            + 'self.__refPageletId__ && (document.getElementById(\'' + id + '\')).id = self.__refPageletId__;\r\n'
            + 'delete self.__refPageletId__;'    
            + 'var async = self.__pageletAsyncs__ || [];\r\n'
            + 'async.unshift(\'static/pagelet.js\');\r\n'
            + 'require.async(async, function(Pagelet){\r\n'
            + '\tPagelet.init(\'' + id + '\');\r\n'
            + (sameJs.exists() ? '\trequire.async("' + sameJs.id + '");\r\n' : '') + '});\r\n'
            + '})();\r\n'
            + '</script>\r\n'
            + '<?php\r\n'
            + '}\r\n'
            + '?>\r\n';

    return content;
};