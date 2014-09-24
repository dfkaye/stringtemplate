// August 15, 2014
// a batch string#replace 
// using $token$ placeholders ~ inspired by Terence Parr's StringTemplate
//  see https://theantlrguy.atlassian.net/wiki/display/ST4/Introduction
//    in particular, #Introduction-Accessingpropertiesofmodelobjects

// possible amendments
//  + support $dot.notation$ for ({ dot : { notation : 'value' } })
//  + enforce param to be well-formed JSON
//  + transformations (pluralize, escape)
//      see https://github.com/davidchambers/string-format#stringprototypeformattransformers

typeof String.prototype.template == 'function' ||
(String.prototype.template = function template(map) {
  var s = String(this);
  for (var k in map) {
    if (map.hasOwnProperty(k)) {
      s = s.replace('$'+k+'$', map[k]);
    }
  }
  return s;
});


// re-using concept of heredoc from function#heredoc
//  see https://gist.github.com/dfkaye/d6782dc46acddd984d3f

// because heredocs mean you don't need to pollute HTML with 
// script tags containing bogus type attributes
// (or custom elements or html imports or web components or other bad DOM-based ideas)

// string#trim polyfill
typeof String.prototype.trim == 'function' ||
(String.prototype.trim = function trim() {
  return this.replace(/^\s+|\s+$/gm, '');
});
 
// function#heredoc
//  see https://gist.github.com/dfkaye/d6782dc46acddd984d3f
typeof Function.prototype.heredoc == 'function' ||
(Function.prototype.heredoc = function heredoc(fn) {
  
  // if fn not a function, use this function
  var fs = (typeof fn == 'function' && fn.toString()) || this.toString();
  
  // splitting logic taken from where.js
  
  var fnBody = fs.replace(/\s*function[^\(]*[\(][^\)]*[\)][^\{]*{/,'')
                 .replace(/[\}]$/, '');
  var table = fnBody.match(/\/(\*){3,3}[^\*]+(\*){3,3}\//);
  var data = (table && table[0] || fs)
                //.replace(/\/\/[^\r]*/g, '') // remove line comments...
                .replace(/(\/\*+)*[\r]*(\*+\/)*/g, '') // ...block comments
                .split('\n'); // and split by newline
  // scrub
  for (var i = 0; i < data.length; i++) {
    data[i] = data[i].trim();
  }
 
  return data.join(' ').trim();
});


///////////////////////////
// test it out 
///////////////////////////


var stringTest = "var $name$ = $value$;".template({
  'name' : 'x', 'value' : 99
});

console.log(stringTest === "var x = 99;");


function heredoc(data) {
  /***
  <div>
    name: $name$;  age: $age$
  </div>
  ***/
  return heredoc.heredoc().template(data);
};

var heredocTest = heredoc({
  name : 'david',
  age: 28
});

console.log(heredocTest === "<div> name: david;  age: 28 </div>");


///////////////////////////
// binding/wrapping/reusing 
///////////////////////////

var greeting = "Hello, $name$";

function greet(data) {
  return greeting.template(data);
}

var greetTest = greet({
  'name' : 'Milo Minderbinder'
});

console.log(greetTest === "Hello, Milo Minderbinder");

