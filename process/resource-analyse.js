'use strict';

var RESOURCE_REG = /[\r\n]*(?:<!--[\s\S]*?-->|<script(\s+[^>]*?src=(['"])((?:<\?[\s\S]+?\?>)?.+?)\2[^>]*)>\s*<\/script>|<link(\s+[^>]*?href=(['"])((?:<\?[\s\S]+?\?>)?.+?)\5[^>]*)>)[\r\n]*/ig;
var FIXED = /\bfeather-position-fixed\b/i, HEAD = /\bfeather-position-head\b/i, BOTTOM = /\bfeather-position-bottom\b/i, DESTIGNORE = /\bfeather-position-ignore\b/i;
var ISCSS = /rel=["']?stylesheet['"]?/i;

var PREVIEW_MODE = (feather.settings || {}).dest == 'preview', STATIC_MODE = feather.config.get('staticMode');
var USE_REQUIRE = feather.config.get('require.use');

module.exports = function(content, file, conf){
    var headJs = [], bottomJs = [], css = [], content;

    content = content.replace(RESOURCE_REG, function(_0, _1, _2, _3, _4, _5, _6){
        //如果是fixed 跳过
        if(_1){
            if(!FIXED.test(_1)){
                if(!PREVIEW_MODE){
                    if(DESTIGNORE.test(_1)) return '';
                }

                //头部js
                if(HEAD.test(_1)){
                    headJs.push(_3);
                }else{
                    //尾部js
                    bottomJs.push(_3);
                }

                return '';
            }else{
                return '<script' + _1.replace(/\s*feather-position-fixed\s*/, ' ').replace(/\s+$/, '') + '></script>';
            }
        }else if(_4 && ISCSS.test(_4)){
            if(!PREVIEW_MODE){
                if(DESTIGNORE.test(_4)) return '';
            }

            //css
            css.push(_6);
            return '';
        }

        return _0;
    });

    if(!file.isPagelet){
        var sameJs = feather.file.wrap(file.id.replace(/\.[^\.]+$/, '.js'));
    
        if(sameJs.exists()){
            feather.compile(sameJs);
            
            var url = sameJs.getUrl();

            if(file.asyncs.indexOf(sameJs.id) == -1
                && headJs.indexOf(url) == -1
                && bottomJs.indexOf(url) == -1
            ){
                if(USE_REQUIRE){
                    if(/<\/body>/.test(content)){
                        content = content.replace(/<\/body>/, function(){
                            return '<script>require.async(\'' + sameJs.id + '\');</script></body>';
                        });
                    }else{
                        content += '<script>require.async(\'' + sameJs.id + '\');</script>';
                    }

                    file.setContent(content);
                    file.addAsyncRequire(sameJs.id);
                }else{
                    bottomJs.push(sameJs.id);
                }
            }
        }

        var sameCss = feather.file.wrap(file.id.replace(/\.[^\.]+$/, '.css'));

        if(sameCss.exists()){
            css.push(sameCss.id);
        }
    }

    file.extras.headJs = feather.util.unique((file.extras.headJs || []).concat(headJs));
    file.extras.bottomJs = feather.util.unique((file.extras.bottomJs || []).concat(bottomJs));
    file.extras.css = feather.util.unique((file.extras.css || []).concat(css));

    return content;
};
