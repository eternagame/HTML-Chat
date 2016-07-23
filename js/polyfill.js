// String.startsWith
if (!String.prototype.startsWith) {String.prototype.startsWith = function(s, p){p = p || 0;return this.substr(p, s.length) === s;};}
// Array.includes
if (!Array.prototype.includes) {Array.prototype.includes=function(s){'use strict';var O=Object(this);var len=parseInt(O.length,10)||0;if(len===0){return false;}var n=parseInt(arguments[1],10)||0;var k;if(n>=0){k=n;}else{k=len+n;if(k<0){k=0;}}var c;while(k<len){c=O[k];if(s===c||(s!==s&&c!==c)){return true;}k++;}return false;};}