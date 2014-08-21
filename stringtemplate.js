// stringtemplate.js

typeof String.prototype.template == 'function' ||
(String.prototype.template = function template() {

});

typeof Function.prototype.template == 'function' ||
(Function.prototype.template = function template() {

});