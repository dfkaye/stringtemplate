// ==ClosureCompiler==
// @output_file_name default.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// ==/ClosureCompiler==

// closure compiler data (including this data):
// Original Size: 	2.45KB gzipped (6.4KB uncompressed)
// Compiled Size: 	777 bytes gzipped (1.56KB uncompressed)

// Sept 4-5, 2014 ~ start the zero-recursion version
// Sept 6 - still in progress but most array drilldown is done
// Sept 9 ~ cleaned up array v placeholder detection and drilldown
// Sept 16 ~ finally ~ looks like complex data mapping is solved...
// Sept 18 ~ get off of rows
// version started 20 sept 2014
// Sept 23 ~ nested array case solved
// Sept 24 ~ some renaming and comments
// Sept 25 ~ intro some functional programming
// Sept 26 ~ do-over using reverse-while endtag w/content aliasing
// Sept 27 ~ nested object-array tests working
// Sept 29 ~ arrays and nested arrays working
 
/*
 * stringtemplate
 *
 * David F. Kaye (@dfkaye)
 * 18 SEPT 2014 -  (final nested case solved 23 SEPT 2014 12:04 - 12:20 PM PDT)
 * still in progress ~ still largely out of his mind
 *
 * JSON License (Modified MIT)
 *
 * string.template() replaces doc-string tokens with corresponding data 
 * values, using simplest token set and syntax as possible.
 *
 * inspired by Terence Parr (StringTemplate) and Krasimir Tsonev (AbsurdJS)
 *
 * data argument may be either an Object or an Array.  
 * empty arguments and primitives are ignored.
 *
 * goals of this project
 * + one method only
 * + no ES5 functional programming
 * + no internal use of Function() constructor
 * + no formatting
 * + no default substitution or suppression of empty values
 * + no if/else logic or branching directives
 * + no error throwing or handling (yet)
 * + no recursion
 *
 * standalone JavaScript method by hand means
 * + potential for looping hell
 * + regular expressions ~ test them online with http://www.cuneytyilmaz.com/prog/jrx/ 
 * + sub-string manipulation ~ http://davidwalsh.name/string-replace-javascript
 * + figuring out token delimiters and reasonable placeholder syntax
 */

// typeof String.prototype.template != 'function' || 
(String.prototype.template = function template(data) {

  var source = this.toString();
  
  if (source.match(/\$\[\d+\]\$/g)) {
    console.log('token not allowed: ' + source.match(/\$\[\d+\]\$/g).join(','));
  }
  
  var endTokens = source.match(/\$\/[^\$^\s]+\$/g) || [];
  var startTokens = source.match(/\$[^\#^\$^\s]+\$/g) || [];
  var tags = [];

  var endToken, endIndex, startToken, startIndex, nextIndex, tag, body;
  var i, innerTags, node, j, content;
  var path, p, reValueToken;
  
  /*
   * returns string derived from replacing node data in tag data
   */
  function transform(tag, node) {

    var content = tag.body;
    var hash = /\$\[\#\]\$/g.exec(content);
    var hashKey = content.match(/\$\[\#\]\.[^\$^\s]+\$/g);
    var temp = [];
    var sub, inner; // i, k, n

    for (var k in node) {
    
      sub = content.toString();
      
      if (hash) {
      
        if (typeof node[k] != 'object') {
        
          // replace primitives directly
          sub = sub.replace(hash[0], node[k]);
          
        } else {
        
          inner = [];
          
          for (var n in node[k]) {
            inner.push(content.replace(hash[0], node[k][n]));
          }
          
          sub = inner.join('');
        }
      }
      
      if (hashKey && typeof node[k] == 'object') {
      
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
  } // end transform()
  
  
  // pass #1 map blocks (matching end and start tokens)
  
  i = endTokens.length;
  
  while (i--) {
    
    endToken = endTokens[i];
    endIndex = source.indexOf(endToken);
    startToken = endToken.replace('$/', '$');
    startIndex = source.substring(0, endIndex).lastIndexOf(startToken);
    
    if (endToken == '$/[#]$') {
    
      // substring once more in an array due to $#$ $#$ $/#$ pattern
      nextIndex = source.substring(0, startIndex - 1).lastIndexOf(startToken);
      
      if (nextIndex !== -1) {
        startIndex = nextIndex;
      }
    }

    tag = source.substring(startIndex, endIndex + endToken.length);
    body = source.substring(startIndex + startToken.length, endIndex);
    
    tags.push({
      token: startToken.replace(/\$/g, ''),
      tag: tag,
      body: body
    });

    // set placeholder reference similar to a linked list
    source = source.replace(tag, '$[' + (tags.length - 1) + ']$');    
  } 

  // pass #2 resolve mapped blocks (matching end and start tokens)
  
  i = tags.length;
  
  while (i--) {
  
    tag = tags[i];
    innerTags = tag.body.match(/\$\[\d+\]\$/);
    node = tag.token == '[#]' ? data: data[tag.token];

    if (innerTags) {
      
      j = innerTags[0].replace(/[\$\[\]]/g, '');

      /*
       * 29 sept 2014
       * tag j is named if it contains token
       * else j is the index of the object on data node
       */
      node = node[tags[j].token] || node[j];
      tag.target = transform(tags[j], node);
      tag.body = tag.body.replace('$[' + (j) + ']$', tag.target);
      source = source.replace('$[' + (i) + ']$', tag.body);
      
    } else { //if (tag.token == '[#]') {
      
      tag.target = transform(tag, node);
      source = source.replace('$[' + (i) + ']$', tag.target);
    }
  }

  // pass #3 resolve values (not hashes, no matching end token)
  
  i = startTokens.length;
  
  while (i--) {
  
    startToken = startTokens[i];
    endToken = startToken.replace('$', '$/').replace(/\$/g, '\\$');
    
    if (!RegExp(endToken, 'gm').test(source)) {
      
      node = data;      
      path = startToken.replace(/\$/g, '').split('.');
      p = 0;

      while (node && p < path.length) {
        node = node[path[p++]];
      }
      
      !node || (reValueToken = RegExp(startToken.replace(/\$/g, '\\$'), 'gm'),
        source = source.replace(reValueToken, node)
      );
    }
  }
      
  return source;
});

/******** tests ***************/

// some barebones examples that print to the console

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


var t1 = s1.template(d1);
console.log(t1);


var s2 = [
  '$[#]$',
  '\n+ $[#]$',
  '$/[#]$'
].join('');

var d2 = ['foo', 'bar', 'baz', 'quux'];

var t2 = s2.template(d2);
console.log(t2);


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

var t3 = s3.template(d3);
console.log(t3);


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

var t4 = s4.template(d4);
console.log(t4);


///*** more tests


// 27 sept 2014
var s5 = [

  "<p>$title$</p>",
  //"$[0]$ $[1]$", // injection attack needs guard clause
  // one { two { three { four }}}
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
  "</ul>",
  "<p>$inner.title$</p>", // is this a valid case???
  "<ul>",
    "$inner$",
    "<li>",
      "<ul>",
        "$inner$",
        "<li>",
          "$[#].inner$",
        "</li>",
        "$/inner$",
      "</ul>",
    "</li>",
    "$/inner$",
  "</ul>"

].join('\n');

var d5 = {
  title: 'nested object example',
  inner: {
    title: 'nested title',
    inner: [
      { inner: '*inner*' },
      { inner: '*inner*' },
      { inner: '*inner*' },
      { inner: '*inner*' }
    ]
  }
};

console.log( s5.template(d5) );


// 29 sept 2014
var s6 = [
  '<ul>',
  '  $[#]$',
  '  <li>$[#]$</li>',
  '  $/[#]$',
  '</ul>'
].join('\n');

var d6 = [
  'z' , Date(), 5, 
];

console.log( s6.template(d6) );


// 29 sept 2014
var s7 = [ // nested array
  '<ul>',
  '$[#]$',
  '  <li>',
  '    <ul>',
  '    $[#]$',  
  '      <li>$[#]$</li>',
  '    $/[#]$',
  '    </ul>',  
  '  </li>',
  '$/[#]$',
  '</ul>'
].join('\n');

var d7 = [ [
  'z' , Date(), 5, 
] ];

console.log( s7.template(d7) );


// 29 sept 2014
var s8 = [
  '$title$',
  "<p>$inner.title$</p>",
  "<ul>",
    "$inner$",
    "<li>",
      "<p>$inner.title$</p>",
      "<ul>",
        "$inner$",
        "<li>",
          "$[#]$",
        "</li>",
        "$/inner$",
      "</ul>",
    "</li>",
    "$/inner$",
  "</ul>"
].join('\n');

var d8 = { 
  title: 'nested object test',
  inner: {
    title: 'nested title',
    inner: { inner: 'innermost value' }
  }
};

console.log( s8.template(d8) );


// 29 sept 2014
var s9 = [
  '$title$',
  "<p>$inner.title$</p>",
  "<ul>",
    "$inner$",
    "<li>",
      "<p>$inner.title$</p>",
      "<ul>",
        "$inner$",
        "<li>",
          "$[#].inner$",
        "</li>",
        "$/inner$",
      "</ul>",
    "</li>",
    "$/inner$",
  "</ul>"
].join('\n');

var d9 = { 
  title: 'nested array test',
  inner: {
    title: 'nested title',
    inner: [ 
      { inner: 'first'}, 
      { inner: 'second'}
    ]
  }
};

console.log( s9.template(d9) );

