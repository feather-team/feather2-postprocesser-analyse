'use strict';

module.exports = function(content, file, conf){
    var found = false, id = file.subpathNoExt.replace(/\//g, '_').replace('_', '');

    content = '<code style="display: none;" id="' + id + '">' + content + '</code>'
            + '<script>(function(){'
            + 'var elem = document.getElementById("' + id + '");'
            + 'elem.removeAttribute("id");'
            + 'var nls = [/*PAGELET_ASYNCS_PLACEHOLDER:' + file.id + '*/];'
            + 'require.async([\'static/pagelet.js\'].concat(nls), function(Pagelet){'
            + 'Pagelet.init(elem)'
            + '});'
            + '})()</script>';

    file.addAsyncRequire('static/pagelet.js');    

    return content;
};