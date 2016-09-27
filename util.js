exports.same = function(file, exts){
    var prefix = feather.project.getProjectPath() + file.subpath.replace('__bak__', '').slice(0, -feather.config.get('template.suffix').length);

    for(var i = 0; i < exts.length; i++){
        var same = feather.file(prefix + exts[i]);

        if(same.exists()){
            return same;
        }
    }
};