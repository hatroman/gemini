(function(window) {
    /*jshint browser:true, node:false*/
    'use strict';

    var bodyRect = document.body.getBoundingClientRect();
    return {
        //bodyRect.height is undefined in IE8
        bodyHeight: bodyRect.bottom - bodyRect.top
    };
}(window));
