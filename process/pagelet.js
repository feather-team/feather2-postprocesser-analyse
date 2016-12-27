'use strict';

module.exports = function(content, file, conf){
    var found = false, id = file.subpathNoExt.replace(/\//g, '_').replace('__bak__', '').replace('_', '');

    content = '<textarea id="' + id + '">' + content.replace(/<\/textarea>/g, '<\\/textarea>') + '</textarea>'
            + '<script>(function(){'
            + 'var elem = document.getElementById("' + id + '");'
            + 'elem.value = elem.value.replace(/<\\\\\\\/textarea>/g, \'</textarea>\');'
            + 'elem.removeAttribute("id");'
            + 'var nls = [/*PAGELET_ASYNCS_PLACEHOLDER:' + file.id + '*/];'
            + 'require.async([\'static/pagelet.js\'].concat(nls), function(Pagelet){'
            + 'Pagelet.init(elem)'
            + '});'
            + '})()</script>';

    file.addAsyncRequire('static/pagelet.js');    

    return content;
};