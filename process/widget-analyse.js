'use strict';

//widget analyse
/*
<?php $this->widget();?>
<widget name="" />
<widget name="">
*/

var REG = /<!--(?:(?!\[if [^\]]+\]>)[\s\S])*?-->|(<\?php\s+(?:(?!\?>)[\s\S])*?(?:\?>|$))|<widget(?:\s+[\s\S]*?name=['"]([^'"]+)['"])?[^>]*>/ig;
var PHP_REG = /\$this->widget\(\s*['"]([^'"]+)['"]/ig;
var RULES = feather.config.get('widget.rules'), SUFFIX = feather.config.get('template.suffix'), ROOT = feather.project.getProjectPath();

function getId(path, file){
    RULES.forEach(function(rule){
        path = path.replace(rule[0], rule[1]);
    });

    path = path.replace(/\/+/, '/').replace(new RegExp('\\.' + SUFFIX + '$'), '') + '.' + SUFFIX;

    var prefix = path[0], widgetFile;

    if(prefix == '.'){
        widgetFile = new feather.file(require('path').resolve(file.dirname, path));
    }else{
        path = '/widget' + (prefix == '/' ? '' : '/') + path;
        widgetFile = new feather.file(ROOT + path);
    }

    return widgetFile.id;
}

module.exports = function(content, file){
    var widgets = {};

    content = content.replace(REG, function(all, php, widget){
        if(php){
            return php.replace(PHP_REG, function(all, widget){
                var id = getId(widget, file);
                widgets[id] = 1;
                return "$this->load('" + id + "'";
            });
        }else if(widget){
            var id = getId(widget, file);
            widgets[id] = 1;
            return "<?php $this->load('" + id + "');?>";
        }

        return all;
    });

    file.extras.widget = Object.keys(widgets);

    return content;
};