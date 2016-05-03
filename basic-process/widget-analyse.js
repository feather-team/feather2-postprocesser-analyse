'use strict';

//widget analyse
/*
<?php $this->widget();?>
<widget name="" />
<widget name="">
*/

var REG = /<!--(?:(?!\[if [^\]]+\]>)[\s\S])*?-->|<widget(?:\s+[\s\S]*?name=['"]([^'"]+)['"])?[^>]*>/ig;
var RULES = feather.config.get('widget.rules'), SUFFIX = feather.config.get('template.suffix'), ROOT = feather.project.getProjectPath();

function getWidgetFile(path, file){
    RULES.forEach(function(rule){
        path = path.replace(rule[0], rule[1]);
    });

    path = path.replace(/\/+/, '/').replace(new RegExp('\\.' + SUFFIX + '$'), '') + '.' + SUFFIX;

    var prefix = path[0], widgetFile;

    if(prefix == '.'){
        widgetFile = feather.project.lookup(path, file);
    }else{
        path = '/widget' + (prefix == '/' ? '' : '/') + path;
        widgetFile = new feather.file(ROOT + path);
    }

    return widgetFile;
}

module.exports = function(content, file){
    return content.replace(REG, function(all, widget){
        if(widget){
            var widgetFile = getWidgetFile(widget, file);

            if(widgetFile.exists()){
                widgets[widgetFile.id] = 1;

                feather.compile(widgetFile);
                file.addLink(widgetFile.subpath);
                
                if(widgetFile.cache){
                    file.cache.mergeDeps(widgetFile.cache);
                }

                file.cache.addDeps(widgetFile.realpath || widgetFile);
                return widgetFile.getContent();
            }
        }

        return all;
    });
};