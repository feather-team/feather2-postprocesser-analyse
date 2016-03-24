'use strict';

/*
<pagelet id="自定义id" pid="可省略" wraper="默认textarea">
<div></div>
</pagelet>
*/

var REG = /<pagelet((?:\?>|[^>])*)>\s*([\s\S]*?)<\/pagelet>/;
var ATTR_REG = /\s+(id|pid|wraper)=(['"])((?:<\?[\s\S]+\?>|[^\2])+?)\2/g;
var pageletModuleId, ROOT = feather.project.getProjectPath();
var COMPRESS = /pd|production/.test(feather.project.currentMedia());

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
    
    var async = ['static/pagelet.js'];
    var sameJs = feather.file(ROOT, file.id.replace(/\.[^\.]+$/, '.js'));

    if(sameJs.exists()){
        file.addAsyncRequire(sameJs.id);
    }

    var globalIdVar = 'self.__refPageletId__';

    content = '<?php $__refPageletId__ = $this->get(\'__refPageletId__\');?>\r\n'
            + '<' + wraper + ' id="<?php echo $__refPageletId__ ? $__refPageletId__ : \'' + id + '\';?>" ' + attr + '>\r\n' 
            + content + '\r\n'
            + '<?php\r\n'
            + 'if($this->get(\'__refPagelet__\')){\r\n'
            + '$__refPageletId__ = null;\r\n'
            + '$this->set(\'__refPagelet__\', null);\r\n'
            + '$this->set(\'__refPageletId__\', null);\r\n'
            + '?>\r\n'
            + (sameJs.exists() ? '<script>require.async(\'' + sameJs.id + '\')<' + (wraper == 'script' ? '\\/script' : '') + '>\r\n' : '')
            + '</' + wraper + '>\r\n'
            + '<?php\r\n'
            + '}else{\r\n'
            + '?>\r\n'
            + '</' + wraper + '>'
            + '<script>\r\n'
            + '(function(){\r\n'    
            + 'var async = <?php echo isset($FEATHER_PAGELET_CSS_JSON) ? $FEATHER_PAGELET_CSS_JSON : \'[]\';?>;\r\n'
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