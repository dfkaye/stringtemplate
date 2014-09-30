// Sept 4-5, 2014 ~ start the zero-recursion version
// Sept 6 - still in progress but most array drilldown is done
// Sept 9 ~ cleaned up array v placeholder detection and drilldown
// Sept 16 ~ finally ~ looks like complex data mapping is solved...
// Sept 18 ~ get off of rows
// version started 20 sept 2014
// Sept 23 ~ nested array case solved
// Sept 25 ~ intro some functional programming

// stringtemplate.js

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
 * + no formatting
 * + no default substitution or suppression of empty values (no 'undefined')
 * + no if/else logic tokens 
 * + no error throwing
 * + prefer dynamic programming to recursion until unavoidable
 *
 * standalone JavaScript method by hand means
 * + for-loop + if-else hell
 * + while-loop hell
 * + regular expressions ~ test them online with http://www.cuneytyilmaz.com/prog/jrx/ 
 * + sub-string manipulation ~ http://davidwalsh.name/string-replace-javascript
 * + figuring out token delimiters and reasonable placeholder syntax
 */
   
//typeof String.prototype.template == 'function' ||
(String.prototype.template = function template(data) {

  /* utility functions */

  /*
   * map token to data node
   * returns node if found, else returns undefined
   */
  function resolvePath(token, node) {
  
    var path = token.replace(/\$/g, '').split('.');
    var p = 0;

    while (node && p < path.length) {
      node = node[path[p++]];
    }
    
    return node;
  }

  /*
   * processes the content of a tag block containing hashes but no other nested blocks
   * uses recursion on itself if the content of an item is an array
   * returns transformed string
   */
  function processBlock(content, node) {
  
    //console.log('**** processBlock ****: \n' + content);
    //console.warn( node);
    
    var temp = [];
    var hash = /\$\[\#\]\$/g.exec(content);
    var hashKey = content.match(/\$\[\#\]\.[^\$^\s]+\$/g);
    var k, sub, n, i, key;
    
    for (var k in node) {

      sub = content.toString();

      if (hash) {

        if (typeof node[k] != 'object') {
        
          // replace primitives directly
          
          sub = sub.replace(hash[0], node[k]);
          
        } else {
      
          for (var n in node[k]) {

            if ({}.toString.call(node[k][n]) == '[object Array]') {
            
              // handle nested arrays directly with recursion on processBlock()

              temp.push(processBlock(content, node[k][n]));
            }
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
  
  /*
   * processes the content of a tag block containing other tag blocks, not just hashes
   * uses recursion on template() to transform tag content
   * returns transformed string
   */
  function handleNestedBlock(tokens, src, node) {
  
    //console.warn('**** handleNestedBlock ****: \n' + src);
    //console.log( node);

    //var tokens = src.match(RegExp(reToken.source, 'gm'));
    var depth = -1;
    var startIndex = 0;
    var endIndex = 0;
    var token;
    var tag;
    var content;
    
    for (var i = 0; i < tokens.length; ++i) {
    
      token = tokens[i];

      if (reEndToken.test(token)) {
      
        depth -= 1;
        endIndex = src.indexOf(token, endIndex + 1);
        
      } else {
      
        startIndex || (startIndex = token.length);
        depth += 1;
      }

      if (depth === 0 && startIndex > 0 && endIndex > 0) {

        // handle nested tag blocks with recursion on template()
        // content vs tag 12:45 PM PDT 18 SEPT 2104

        tag = src.substring(0, endIndex + token.length);
        content = src.substring(startIndex, endIndex);      
        src = src.replace(tag, content.template(node));
        
        break;
      }
    }
    
    return src;
  }
  
  /* main process */
  
  var src = this.toString();                // this will be returned after modifications

  var reToken = /\$[^\$^\s]+\$/;            // any token
  var reAllTokens = /\$[^\$^\s]+\$/gm;      // all tokens
  var reStartTokens = /\$[^\$^\/^\s]+\$/gm; // all start tokens
  var reNameToken = /\$[^\$^\#^\s^\/]+\$/;  // start token that is not a hash
  var reHash = /\$\[\#\]\$/g;               // index tokens
  var reHashKey = /\$\[\#\]\.[^\$^\s]+\$/g; // indexed keyname tokens
  var reEndToken = /\$\/[^\$^\s]+\$/;       // any closing token
  var reEndHash = /\$\/\[\#\]?[^\$^\s]+\$/; // any closing hash or keyname token
  
  var startTokens = src.match(reStartTokens);
  var allTokens = src.match(reAllTokens);
  var hashes = src.match(RegExp(reEndHash.source, 'gm'));
  
  /*
   * work avoidance
   * return src early if no data or tokens, or data is array but no hashes found in src
   */
   
  if (!data || typeof data != 'object' || !allTokens || 
      ({}.toString.call(data) == '[object Array]' && !hashes)) {

    return src;
  }

  /*
   * pass #1 simple case: replace $an.object.token$ with no matching end token
   */
  
  !startTokens || (startTokens.forEach(function (token, index, startTokens) {
  
    // outer scope var:  src, data
    //console.log(token, reNameToken.test(token));
    
    var visited = startTokens.visited || (startTokens.visited = {});
    var ends = src.match(RegExp(token.replace('$', '$/').replace(/\$/g, '\\$'), 'gm'));
    var node;

    if (!visited[token] && !ends) {
        
      visited[token] = token;
      node = resolvePath(token, data);
      !node || (src = src.replace(RegExp(token.replace(/\$/g, '\\$'), 'gm'), node));
    }
  }));

  /*
   * pass #2 block case: replace block tags (with matching end tokens):
   *
   *  array or object:
   *    $token$ $[#]$ $/token$
   *    $token$ $[#.key]$ $/token$
   *
   *  array
   *    $[#]$ $[#]$ $[/#]$
   *    $[#.key]$ $[#]$ $[/#.key]$
   */
  
  !allTokens || (allTokens.forEach(function (token, index, allTokens) {

    // outer scope var:  src

    var e = token.replace(/\$/g, '\\$').replace('$', '$\\/').replace('[#]', '\\[\\#\\]');
    var endMatch = src.match(RegExp(e, 'gm'));
    var endToken = endMatch && endMatch[0];
    var nextTokens = endToken && allTokens.slice(index + 1) || [];
    
    nextTokens.some(function(next, index, nextTokens) {
    
      // outer scope vars:  src, data, reHash, reHashKey
      //    resolvePath, reEndToken, reToken
      //    handleNestedBlock, processBlock
      
      //console.warn(token + ': ' + next + ': ' + endToken + ': ' + (next === endToken) );
      var tag, content, node, nestedEndTags, allNestedTags;
      
      if (next === endToken) {
      
        tag = src.substring(src.indexOf(token), 
                            src.lastIndexOf(endToken) + endToken.length);
        content = tag.substring(token.length, tag.lastIndexOf(endToken));
        node = data;
        
        if (!reHash.test(token) && !reHashKey.test(token)) {
        
          node = resolvePath(token, node);
        }
        
        if (node) {
          
          nestedEndTags = tag.match(RegExp(reEndToken.source, 'gm'));
          
          if (nestedEndTags && nestedEndTags.length >= 2) {
          
            /*
             * single nested end tokens with hash tokens are handled by the process case
             * multiple nested end tokens are handled by the nested case
             */
             
            allNestedTags = tag.match(RegExp(reToken.source, 'gm'));
            
            if (allNestedTags.length - 2 * nestedEndTags.length === 1) {

              src = src.replace(tag, handleNestedBlock(allNestedTags, tag, node));
            }
            
          } else if (content.match(/\[\#\]/)) {
          
            src = src.replace(tag, processBlock(content, node));
          }
        }
      }
      
      return next === endToken && node;
    });
  }));

  return src;
});

/*
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


var t1 = s1.template(d1);
console.log(t1);


// stop supporting this 

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
      
      "<p>$inner.title$</p>", // if value tokens are evaluated after blocks can we change
                              // this to $title$??

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
*/