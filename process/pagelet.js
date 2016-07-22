'use strict';

/*
<pagelet id="自定义id" pid="可省略" wraper="默认textarea">
<div></div>
</pagelet>
*/

var ROOT = feather.project.getProjectPath();

module.exports = function(content, file, conf){
    var found = false, id = file.subpathNoExt.replace(/\//g, '_').replace('_', '');

    content = '<code style="display: none;" id="' + id + '">' + content + '</code>';
    
    content += '<script>(function(){'
            + 'var elem = document.getElementById("' + id + '");'
            + 'elem.removeAttribute("id");'
            + 'var nls = "##PLACEHOLDER_PAGELET_ASYNCS:' + file.id + '##";'
            + 'require.async(["static/pagelet.js"].concat(nls), function(Pagelet){'
            + 'Pagelet.init(elem)'
            + '});'
            + '})()</script>';

    file.addAsyncRequire('static/pagelet.js');    

    return content;
};
