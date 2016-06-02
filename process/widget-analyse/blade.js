'use strict';

//widget analyse
/*
<?php $this->widget();?>
<widget name="" />
<widget name="">
*/
var REG = /<!--(?:(?!\[if [^\]]+\]>)[\s\S])*?-->|\{\{--[\s\S]*?--\}\}|@(widget|extends)\(['"]([^'"]+)/ig;
var RULES = feather.config.get('widget.rules'), SUFFIX = '.' + feather.config.get('template.suffix'), ROOT = feather.project.getProjectPath();
var SUFFIX_REG = new RegExp('\\' + SUFFIX + '$');

function getId(path, file, type){
    RULES.forEach(function(rule){
        path = path.replace(rule[0], rule[1]);
    });

    path = path.replace(/\/+/, '/').replace(SUFFIX_REG, '') + SUFFIX;

    var prefix = path[0], widgetFile;

    if(prefix == '.'){
        widgetFile = feather.project.lookup(path, file);
    }else{
        path = '/' + (type == 'widget' ? 'widget' : '') + (prefix == '/' ? '' : '/') + path;
        widgetFile = new feather.file(ROOT + path);
    }

    return widgetFile.id;
}

module.exports = function(content, file){
    var widgets = {};

    content = content.replace(REG, function(all, type, path){
        if(path){
            var id = getId(path, file, type);
            widgets[id] = 1;
            return "@" + (type == 'widget' ? 'include' : type) + "('" + id.replace(SUFFIX_REG, '');
        }

        return all;
    });

    file.extras.widget = Object.keys(widgets);

    return content;
};