'use strict';

//pagelet analyse
/*
<pagelet name="ui" id="test"/>
<?php $this->pagelet('ui', 'test', array());?>
*/

var REG = /<!--(?:(?!\[if [^\]]+\]>)[\s\S])*?-->|(<\?php\s+(?:(?!\?>)[\s\S])*?(?:\?>|$))|<pagelet((?:\?>|[^>])*)>/ig;
var PHP_REG = /\$this->pagelet\(\s*['"]([^'"]+)['"](?:\s*,\s*['"]((?:<\?[\s\S]+\?>|[^'"])+?)['"])?/ig;
var ATTR_REG = /\s+(name|id)=(['"])((?:<\?[\s\S]+\?>|[^\2])+?)\2/g;
var SUFFIX = feather.config.get('template.suffix'), ROOT = feather.project.getProjectPath();
var SUFFIX_REG = new RegExp('\\.' + SUFFIX + '$');

function getId(path, file){
    path = path.replace(/\/+/, '/').replace(SUFFIX_REG, '') + '.' + SUFFIX;

    var prefix = path[0], pageletFile;

    if(prefix == '.'){
        pageletFile = feather.project.lookup(path, file);
    }else{
        path = '/pagelet' + (prefix == '/' ? '' : '/') + path;
        pageletFile = new feather.file(ROOT + path);
    }

    return pageletFile.id;
}

function getScriptContent(id){
    return "<?php $this->set('__refPagelet__', true);" + (id ? "$this->set('__refPageletId__', '" + id + "')": "") + "?>";
}

module.exports = function(content, file){
    var pagelets = {};

    content = content.replace(REG, function(all, php, pagelet){
        if(php){
            return php.replace(PHP_REG, function(all, name, cid){
                var id = getId(name, file);
                pagelets[id] = 1;
                return ";?>" + getScriptContent(cid) + "<?php $this->load('" + id + "'";
            });
        }else if(pagelet){
            var attrs = {};

            pagelet.replace(ATTR_REG, function(all, name, quote, value){
                attrs[name] = value;
            });

            var id = getId(attrs.name, file);
            pagelets[id] = 1;
            return getScriptContent() + "<?php $this->load('" + id + "');?>";
        }else{
            return all;
        }
    });

    file.extras.pagelet = Object.keys(pagelets);

    return content;
};