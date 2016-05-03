'use strict';

//pagelet analyse
/*
<pagelet name="ui" id="test"/>
*/

var REG = /<!--(?:(?!\[if [^\]]+\]>)[\s\S])*?-->|<pagelet((?:\?>|[^>])*)>/ig;
var ATTR_REG = /\s+(name|id)=(['"])((?:<\?[\s\S]+\?>|[^\2])+?)\2/g;
var SUFFIX = feather.config.get('template.suffix'), ROOT = feather.project.getProjectPath();
var SUFFIX_REG = new RegExp('\\.' + SUFFIX + '$');

function getPageletFile(path, file){
    path = path.replace(/\/+/, '/').replace(SUFFIX_REG, '') + '.' + SUFFIX;

    var prefix = path[0], pageletFile;

    if(prefix == '.'){
        pageletFile = feather.project.lookup(path, file);
    }else{
        path = '/pagelet' + (prefix == '/' ? '' : '/') + path;
        pageletFile = new feather.file(ROOT + path);
    }

    return pageletFile;
}

function getScriptContent(id){
    if(id){
        return '<script>window.__refPageletId__=\'' + id + '\'</script>'
    }
   
    return '';
}

module.exports = function(content, file){
    var pagelets = {};

    content = content.replace(REG, function(all, pagelet){
        if(pagelet){
            var attrs = {};

            pagelet.replace(ATTR_REG, function(all, name, quote, value){
                attrs[name] = value;
            });

            var pageletFile = getPageletFile(attrs.name, file);
            
            if(pageletFile.exists()){
                pagelets[pageletFile.id] = 1;

                feather.compile(pageletFile);
                file.addLink(pageletFile.subpath);
                
                if(pageletFile.cache){
                    file.cache.mergeDeps(pageletFile.cache);
                }

                file.cache.addDeps(pageletFile.realpath || pageletFile);

                return getScriptContent(attrs.id) + pageletFile.getContent();
            }
        }

        return all;
    });

    file.extras.pagelet = Object.keys(pagelets);

    return content;
};