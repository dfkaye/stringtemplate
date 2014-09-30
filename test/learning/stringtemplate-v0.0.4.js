// Sept 4-5, 2014 ~ start the zero-recursion version
// Sept 6 - still in progress but most array drilldown is done
// Sept 9 ~ cleaned up array v placeholder detection and drilldown
// Sept 16 ~ finally ~ looks like complex data mapping is solved...
// Sept 18 ~ get off of rows
// version started 20 sept 2014
// Sept 23 ~ nested array case solved
// Sept 24 ~ some renaming and comments 

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

  /* Utility functions */

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

      if (hash && typeof node[k] != 'object') {
      
        // replace primitives directly
        
        sub = sub.replace(hash[0], node[k]);
      }
      
      if (hash && node[k] && typeof node[k] == 'object') {

        for (var n in node[k]) {

          if ({}.toString.call(node[k][n]) == '[object Array]') {
          
            // handle nested arrays directly with recursion on processBlock()

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
  
  /*
   * processes the content of a tag block containing other tag blocks, not just hashes
   * uses recursion on template() to transform tag content
   * returns transformed string
   */
  function handleNestedBlock(src, node) {
  
    //console.warn('**** handleNestedBlock ****: \n' + src);
    //console.log( node);

    var tokens = src.match(RegExp(reToken.source, 'gm'));
    var depth = -1;
    var startIndex = 0;
    var endIndex = 0;
    var token;
    var tag;
    var content;
    
    for (var i = 0; i < tokens.length; ++i) {
    
      token = tokens[i];

      if (reEndTag.test(token)) {
      
        depth -= 1;
        endIndex = src.indexOf(token, endIndex + 1);
        
      } else {
      
        startIndex || (startIndex = token.length);
        depth += 1;
      }

      if (depth === 0 && startIndex > 0 && endIndex > 0) {

        // content vs tag 12:45 PM PDT 18 SEPT 2104

        tag = src.substring(0, endIndex + token.length);
        content = src.substring(startIndex, endIndex);      

        // handle nested tag blocks with recursion on template()
        
        src = src.replace(tag, content.template(node));
        
        break;
      }
    }
    
    return src;
  }
  
  /* main process */
  
  var reToken = /\$[^\$^\s]+\$/; // any tokens
  var reStartTag = /\$[^\$^\#^\s^\/]+\$/; // start tag that is not a hash
  var reHash = /\$\[\#\]\$/g; // index or keyname
  var reHashKey = /\$\[\#\]\.[^\$^\s]+\$/g; // indexed keyname, array[0].name
  var reEndTag = /\$\/[^\$^\s]+\$/; // closing tag
  var reEndHash = /\$\/\[\#\]?[^\$^\s]+\$/;
  
  var src = this.toString(); // will return modified source 
  var tokens = src.match(RegExp(reToken.source, 'gm'));
  var hashes = src.match(RegExp(reEndHash.source, 'gm'));
  
  /*
   * return src early if no data or tokens, or data is array but no hashes found in src
   */  
  if (!data || !tokens || ({}.toString.call(data) == '[object Array]' && !hashes)) {

    return src;
  }
    
  var visited = {};
  
  var i, token, tag, node;
  var endToken, match, j, content;
  var nested, nestedEndTags, allNestedTags;
  
  // pass #1 simple case: replace $an.object.token$ with no matching end token
  
  tokens = src.match(RegExp(reStartTag.source, 'gm')) || [];
  
  for (i = 0; i < tokens.length; ++i) {

    token = tokens[i];

    if (visited[token]) {
      continue;
    }
    
    visited[token] = token;
    
    if (!src.match( RegExp(token.replace('$', '$/').replace(/\$/g, '\\$'), 'gm') )) {
      
      node = resolvePath(token, data);
      !node || (src = src.replace(RegExp(token.replace(/\$/g, '\\$'), 'gm'), node));
    }
  }
  
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
  tokens = src.match(RegExp(reToken.source, 'gm')) || [];

  for (i = 0; i < tokens.length; ++i) {
     
    token = tokens[i];
    endToken = token.replace(/\$/g, '\\$').replace('$', '$\\/').replace('[#]', '\\[\\#\\]');
    match = src.match(RegExp(endToken, 'gm'));
    
    if (match) {

      j = i;
      
      while (j += 1 < tokens.length) {

        endToken = tokens[j];

        if (endToken === match[0] ) {
          
          tag = src.substring(src.indexOf(token), src.lastIndexOf(endToken) + endToken.length);
          content = tag.substring(token.length, tag.lastIndexOf(endToken));
          node = data;
         
          if (!reHash.test(token) && !reHashKey.test(token)) {
          
            // current tag is not $[#]$ or $[#.key]$
            
            node = resolvePath(token, node);
          }
          
          if (node) {
            
            nested = false;
            nestedEndTags = tag.match(RegExp(reEndTag.source, 'gm'));
            
            if (nestedEndTags && nestedEndTags.length >= 2) {
            
              /*
               * single nested end tokens are handled by the process case
               * multiple nested end tokens are handled by the nested case
               */
               
              allNestedTags = tag.match(RegExp(reToken.source, 'gm'));
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
  
  return src;
});
