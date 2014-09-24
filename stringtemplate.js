// version started 20 sept 2014
// stringtemplate.js

//typeof String.prototype.template == 'function' ||
(String.prototype.template = function template(data) {

  /*
   * David F. Kaye (@dfkaye)
   * 18 SEPT 2014 -  (final nested case solved 23 SEPT 2014 12:04 - 12:20 PM PDT)
   * still in progress ~ still largely out of his mind
   *
   * JSON License (Modified MIT)
   *
   * string.template() replaces doc-string tokens with corresponding data values, using 
   * simplest token set and syntax as possible.
   *
   * inspired by Terence Parr (StringTemplate) and Krasimir Tsonev (AbsurdJS)
   *
   * data argument may be either an Object or an Array.  
   * empty arguments and primitives are ignored
   *
   * goals of this project
   * + no internal use of Function() constructor (handlebars, absurdjs, riot.js)
   * + no formatting (parr)
   * + no default substitution or suppression of empty values (no 'undefined')
   * + no if/else logic tags 
   * + no error throwing
   *
   * standalone JavaScript method by hand means
   * + for-loop + if-else hell
   * + while-loop hell
   * + regular expressions ~ test them online with http://www.cuneytyilmaz.com/prog/jrx/ 
   * + sub-string manipulation ~ http://davidwalsh.name/string-replace-javascript
   * + figuring out token delimiters and reasonable placeholder syntax
   */

  var reTag = /\$[^\$^\s]+\$/; // any tokens
  var reStartTag = /\$[^\$^\#^\s^\/]+\$/; // start tag that is not a hash
  var reHash = /\$\[\#\]\$/g; // index or keyname
  var reHashKey = /\$\[\#\]\.[^\$^\s]+\$/g; // indexed keyname, array[0].name
  var reEndTag = /\$\/[^\$^\s]+\$/; // closing tag
  var reEndHash = /\$\/\[\#\]?[^\$^\s]+\$/;
  
  var src = this.toString(); // will return modified source 
  var tags = src.match(RegExp(reTag.source, 'gm'));
  var hashes = src.match(RegExp(reEndHash.source, 'gm'));
  
  if (!data || !tags || ({}.toString.call(data) == '[object Array]' && !hashes)) {
    return src;
  }
  
  var i;
  var j;
  var p;
  var path;
  var node;
  var endTag;
  var match;
  var nested;
  var tag;
  var content;
  var nested;
  var nestedEndTags;
  var allNestedTags;
  
  function processBlock(content, node) {

    var temp = [];
    var sub;
    var hash = /\$\[\#\]\$/g.exec(content);
    var hashKey = content.match(/\$\[\#\]\.[^\$^\s]+\$/g);
    var key;
    
    for (var k in node) {

      sub = content.toString();

      if (hash && typeof node[k] != 'object') {
      
        // replace primitives directly
        
        sub = sub.replace(hash[0], node[k]);
      }
      
      if (hash && node[k] && typeof node[k] == 'object') {

        for (var n in node[k]) {
        
          // handle nested arrays directly with recursion

          if ({}.toString.call(node[k][n]) == '[object Array]') {
            temp.push(processBlock(content, node[k][n]));
          }
        }
      }
      
      if (hashKey && typeof node[k] == 'object') {

        // object or array can have multiple hash.key references
        
        for (var i = 0; i < hashKey.length; ++i) {
        
          key = hashKey[i].split('.')[1].replace('$', '');
          sub = sub.replace(hashKey[i], node[k][key]);
        }
      }

      if (sub !== content.toString()) {
        temp.push(sub);
      }
    }
    
    return temp.join('');
  }
  
  function handleNestedBlock(src, node) {

    var tags = src.match(RegExp(reTag.source, 'gm'));
    var depth = -1;
    var startIndex = 0;
    var endIndex = 0;
    var tag;
    var content;
    
    for (var i = 0; i < tags.length; ++i) {
      
      if (!reEndTag.test(tags[i])) {
        startIndex || (startIndex = tags[i].length);
        depth += 1;
      }

      if (reEndTag.test(tags[i])) {
        depth -= 1;
        endIndex = src.indexOf(tags[i], endIndex + 1);
      }

      if (depth === 0 && startIndex > 0 && endIndex > 0) {

        // content vs tag 12:45 PM PDT 18 SEPT 2104

        tag = src.substring(0, endIndex + tags[i].length);
        content = src.substring(startIndex, endIndex);      

        // handle nested block fragments with recursion
        
        src = src.replace(tag, content.template(node));
        break;
      }
    }
    
    return src;
  }
  
  // simple case: any.object.tag with no matching end tag
  
  tags = src.match(RegExp(reStartTag.source, 'gm')) || [];
  
  for (i = 0; i < tags.length; ++i) {

    if (!src.match( RegExp(tags[i].replace('$', '$/').replace(/\$/g, '\\$'), 'gm') )) {

      tag = tags[i];
      node = data;      
      path = tag.replace(/\$/g, '').split('.');
      p = 0;
    
      while (node && p < path.length) {
        node = node[path[p++]];
      }

      !node || (src = src.replace(RegExp(tag.replace(/\$/g, '\\$'), 'gm'), node));
    }
  }
  
  // block case: $tag$ $[#]$ $/tag$, $tag$ $[#.key]$ $/tag$, $[#.key]$ $[#]$ $[/#.key]$
  
  tags = src.match(RegExp(reTag.source, 'gm')) || [];
  
  for (i = 0; i < tags.length; ++i) {
     
    // find matching end tag

    endTag = tags[i].replace(/\$/g, '\\$').replace('$', '$\\/').replace('[#]', '\\[\\#\\]');
    match = src.match(RegExp(endTag, 'gm'));
    
    if (match) {

      j = i;
      
      while (j += 1 < tags.length) {
        
        if ( tags[j] === match[0] ) {
          
          tag = src.substring(src.indexOf(tags[i]), src.lastIndexOf(tags[j]) + tags[j].length);
          content = tag.substring(tags[i].length, tag.lastIndexOf(tags[j]));
          node = data;
         
          if (!reHash.test(tags[i]) && !reHashKey.test(tags[i])) {
          
            // current tag is not a hash, $[#]$ or $[/#.key]$
            path = tags[i].replace(/\$/g, '').split('.');
            p = 0;

            while (node && p < path.length) {
              node = node[path[p++]];
            }
          }
          
          if (node) {
            
            nestedEndTags = tag.match(RegExp(reEndTag.source, 'gm'));
            
            if (nestedEndTags && nestedEndTags.length >= 2) {
            
              allNestedTags = tag.match(RegExp(reTag.source, 'gm'));
              nested = allNestedTags.length - 2 * nestedEndTags.length === 1;
            }

            if (nested) {
              src = src.replace(tag, handleNestedBlock(tag, node));
            } else if (content.match(/\[\#\]/)) {

              src = src.replace(tag, processBlock(content, node));
            }
          }
          
          break;
        }
      }
    }
  }

  //console.log(src);
  
  return src;
});

/**
var d1 = {
  title: 'global title',
  array: ['foo', 'bar', 'baz', { key: 'quux' } ],
  objects: [
    { name: 'first' },
    { name: 'second' }, 
    { name: 'third' }
  ]
};

var s1 = [
  '<p>$title$</p>', 
  '$title$', 
  '<ul>', 
  '$array$', 
  '<li>$[#]$: <p>$title$</p></li>', 
  '<li>should not replace this =&gt; $[#].key$</li>', 
  '$/array$', 
  '</ul>', 
  '<p>$title$</p>', 
  '$objects$',
  '<ul>',
  '<li>$[#].name$</li>',
  '$/objects$'
  ].join('');

s1.template(d1);




var s2 = [
  '$[#]$',
  '\n+ $[#]$',
  '$/[#]$'
].join('');

var d2 = ['foo', 'bar', 'baz', 'quux'];

s2.template(d2);



var s3 = [
  '<ul>', 
  '$addresses$', 
  '<li>$[#].street$</li>', 
  '<li>$[#].city$, $[#].state$</li>', 
  '$/addresses$', 
  '</ul>'
].join('\n');

var d3 = { 
  addresses: [
    { street: '123 fourth street', city: 'cityburgh', state: 'aa' },
    { street: '567 eighth street', city: 'burgville', state: 'bb' },
    { street: '910 twelfth street', city: 'villetown', state: 'cc' }
  ]
};

s3.template(d3);



var s4 = [
  
  "<p>$title$</p>",
  "<ul>",
  "$inner$",
    "<li>",
      
      "<p>$inner.title$</p>", // is this a valid case???

      "<ul>",
      "$inner$",
        "<li>",
          "$[#].inner$",
        "</li>",
      "$/inner$",
      "</ul>",
    "<li>",
  "$/inner$",
  "</ul>"

].join('');

var d4 = {
  title: 'nested example',
  inner: {
    title: 'nested title',
    inner: [
      { inner: 'innermost 1' },
      { inner: 'innermost 2' },
      { inner: 'innermost 3' },
      { inner: 'innermost 4' }
    ]
  }
};

s4.template(d4);
**/