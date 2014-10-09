// Sept  4-5, 2014 ~ aim at zero-recursion
// Sept  6 ~ still in progress but most array drilldown is done
// Sept  9 ~ cleaned up array v placeholder detection and drilldown
// Sept 16 ~ finally ~ looks like complex data mapping is solved...
// Sept 18 ~ get out of iterating by rows of strings
// Sept 20 ~ ugh ~ new version started
// Sept 23 ~ nested array case solved 23 SEPT 2014 12:04 - 12:20 PM PDT
// Sept 24 ~ some renaming and comments
// Sept 25 ~ intro some functional programming
// Sept 26 ~ remove functional; use reverse-while on end tags w/content aliasing
// Sept 27 ~ nested object-array tests working
// Sept 29 ~ arrays and nested arrays working
// Sept 30 ~ fixed array of objects with nested arrays

/*
 * stringtemplate
 *
 * David F. Kaye (@dfkaye)
 *
 * JSON License (Modified MIT)
 *
 * String.prototype.template(data)
 * + inspired by Terence Parr (StringTemplate) and Krasimir Tsonev (AbsurdJS)
 * + replaces doc-string tokens with corresponding data values, using simplest 
 *    token set and syntax as possible (that I could get away with).
 *
 * Function.prototype.template(data)
 * + inspired by @rjrodger's [mstring](https://github.com/rjrodger/mstring)
 * + an additional method for docstrings, returns a `docstring` found by parsing 
 *    contents between /*** and ***\/ delimiters in afunction body
 *
 * The data argument to each method may be either an Object or an Array.  
 * Empty arguments and primitives are ignored.
 *
 * Goals of this project
 * + standalone functions
 * + no dependencies 
 * + no modules or class-like utility bags
 * + no ES5 functional programming
 * + no internal use of Function() constructor (due to content security policy)
 * + no formatting
 * + no default substitution or suppression of empty values
 * + no if/else logic or branching directives in template strings
 * + no error throwing
 * + no recursion ~ until nested arrays of arrays
 * + no parse trees ~ objected oriented programming was made for this 
 *
 * Rolling it by hand with a limited token set and one method means
 * + looping hell
 * + regex hell ~ test them online with http://www.cuneytyilmaz.com/prog/jrx/ 
 * + substring hell ~ http://davidwalsh.name/string-replace-javascript
 */

typeof String.prototype.template == 'function' || 
(String.prototype.template = function template(data) {

  var source = this.toString();
  
  // add fail fast early return here ~ maybe
  
  var endTokens = source.match(/\$\/[^\$^\s]+\$/g) || [];
  var tags = [];

  var startTokens = source.match(/\$[^\#^\$^\s]+\$/g) || [];
  var visited = {};
  
  var endToken, endIndex, startToken, startIndex, nextIndex, tag, body;
  var i, innerTags, node, j;
  var path, p, reValueToken;
  
  /*
   * utility method returns string derived from replacing node data in tag body.
   * return the original tag's tag if no transformation performed on tag body.
   */
  function transform(tag) {
  
  // console.log('transform');
  // console.log(tag);
  // console.warn(tag.data);
  
    var body = tag.body;
    var node = tag.data;
    var hash = /\$\[\#\]\$/g.exec(body);
    var hashKey = body.match(/\$\[\#\]\.[^\$^\s]+\$/g);
    var contents = [];
    var content, values, key; // i, k, n

    for (var k in node) {
    
      content = body.toString();
      
      if (hash) {
        if (typeof node[k] == 'object') {
          values = [];
          for (var n in node[k]) {
            values.push(body.replace(hash[0], node[k][n]));
          }
          content = values.join('');
        } else {
          content = content.replace(hash[0], node[k]);
        }
      }
      
      if (hashKey && typeof node[k] == 'object') {
        /*
         * LOTTA TROUBLE WITH THIS ONE
         */
        console.warn('hashKey: ' + hashKey.join(''));
console.log(k);
console.log(node);
        if ({}.toString.call(node) == '[object Array]') {
//console.log('array: ' + node);
console.log( node[k]);

        }

        for (var i = 0; i < hashKey.length; ++i) {
        
          key = hashKey[i].split('.')[1].replace('$', '');
          
         console.log('key: ' + key);

          if ({}.toString.call(node[k][key]) == '[object Array]') {

            values = [];
            for (var j in node[k][key]) { // 30 Sept 2014
              values.push(body.replace(hashKey[i], node[k][key][j]));
            }
            content = values.join('');
          } else {
          
          
            content = content.replace(hashKey[i], node[k][key]);
          }
        }
      }

      if (content !== body.toString()) {
        contents.push(content);
      }
    }
    
    return contents.join('');
  } // end transform()
  
  /*
   * main process ~ makes two passes through end tokens, if any, to map and 
   * replace block tags ~ make a final pass through tokens without matching end
   * tokens to replace values directly.
   */

  
  var tokens = source.match(/\$[^\/^\$^\s]+\$/g) || []; 
  var blockTokens = [];
  var token;

  for (i = 0; i < tokens.length; ++i) {
  
    // map start of each blockToken by index
    token = tokens[i];

    if (~source.indexOf(token.replace('$', '$/'))) {
    
      // deals with nested array [#] [#] /[#] pattern
      if (~token.indexOf('[#]')) {

        var arr = source.substring(source.indexOf(token));
        var sub = arr.substring(token.length);
        var closing = sub.match(/\$\/\[\d+\]\$/);
        
        if (closing) {
        
          var c =  sub.indexOf(closing[0]);
          var t = sub.indexOf(token);
          
          if (c < t) {
            arr = sub.substring(t);
          }
        }
        
        var arrTok = arr.match(/\$[\/]?\[\#\]/g);

        var st = token, 
            et = token.replace('$', '$/'), 
            s = 0, 
            e = 0, 
            start = 0, 
            next = 0, 
            depth = -1;

        for (var j = 0; j < arrTok.length; ++j) {
        
          //console.log(token, ' , ' , arrTok[j]);

          if (/\/\[\#\]/.test(arrTok[j])) {
            e += 1;
            next = arr.indexOf(et, next + 1);
            depth -= 1;            
          } else {
            s += 1;           
            start || (start = st.length);
            depth += 1;
          }
          
          if (depth < 1 && start > 0 && next > 0 ) {

            // console.log(arr.substring(0, next)
                           // .replace(st, '$[' + (blockTokens.length) + ']$')
                           // .concat('$/[' + (blockTokens.length) + ']$')
                           // );

            var text = arr.substring(0, next)
                          .replace(st, '$[' + (blockTokens.length) + ']$')
                          .concat('$/[' + (blockTokens.length) + ']$');
                          
            var starts = arr.substring(0, next).match(/\$\[\#\]/g);
            
            if ( starts && starts.length > e ) {
              source = source.replace(arr.substring(0, next + et.length), text);
              blockTokens.push(token);
            }

            break;
          }
        }

      } else {
      
        source = source.replace(token, '$[' + (blockTokens.length) + ']$');
        blockTokens.push(token);
      }
    }
  }

 // console.log(source);

  var tags = {};
  var endToken, startToken, endIndex, nodeName, substring, nested, lastNested,
      lastEnd;
      
  for (i = 0, j = 0; i < endTokens.length; ++i) {

    // match end to each start token by index
    
    endToken = endTokens[i];
    startToken = '$[' + (i) + ']$';
    
    if ( !~endToken.indexOf('/[#')) {
      // deals with nested array [#] [#] /[#] pattern
      source = source.replace(endToken.replace('$/', '$'), startToken);
    }
    
    endIndex = source.indexOf(endToken) + endToken.length;
    substring = source.substring(0, endIndex);
    nested = substring.match(/\$\[\d+\]\$/g);

    if (nested) {    
      while (nested.length && (lastNested = nested.pop())) {
        lastNested = lastNested.replace('$', '$/');
        if (!~source.indexOf(lastNested)) {
          break;
        }
      }      
      //
      j = lastNested.replace(/[^\d]/g, '');
    }
    
    lastEnd = '$/[' + (j) + ']$';
    source = source.replace(endToken, lastEnd);
  }
  

  
  for (var t = 0; t < blockTokens.length; ++t) {

    // resolve mapped blocks to data
    visit(t);
  }
  
  function visit(i) {
    //console.log('visit on ' + i);

    var startToken, endToken, endTag, startTag, nodeName, tag, body, nested, target,
        pathName, dataNode;

    visit.visited || (visit.visited = {});
    visit.pathName || (visit.pathName = []);

    if (visit.visited[i]) {
    
      //console.log('visited ' + i);
      
    } else {
    
      visit.visited[i] = startToken = blockTokens[i];
      pathName = visit.pathName;
      
      ////////////////////////////////////////////
      // TODO deal with hash and hash.key
      ////////////////////////////////////////////
      nodeName = startToken.replace('$', '$').replace(/\$/g, '');
      
      // array problems
      console.log(nodeName);
      
      dataNode = data;
      
      if (~nodeName.indexOf('[#]')) {
        console.warn('visiting array ' + i + ' at ' + nodeName);
      } else {
        pathName.push(nodeName);
        //console.log(pathName.join('.'));
      }
      
      for (var p = 0; p < pathName.length; ++p) {
        dataNode = dataNode[pathName[p]];
      } 
    
      ////////////////////////////////////////////
      //console.log(dataNode);
      endToken = startToken.replace('$', '$/')
      startTag = '$[' + (i) + ']$';
      endTag = startTag.replace('$', '$/');
    
      tag = source.substring(source.indexOf(startTag), 
                             source.indexOf(endTag) + endTag.length);
      body = tag.replace(startTag, '').replace(endTag, '');
      nested = body.match(/\$\[\d+\]\$/g);
      
      if (nested) {
        for (var n = 0; n < nested.length; ++n) {
          visit(nested[n].replace(/[^\d]/g, ''));
        }
      } 
      
      //console.log('transform ' + i + ': ' + startToken);
      
      // not very DRY
      source = source.replace(startTag, startToken).replace(endTag, endToken);
      tag = source.substring(source.indexOf(startToken), 
                             source.indexOf(endToken) + endToken.length);
      body = tag.replace(startToken, '').replace(endToken, '');
      
      var unmarkedArray = {}.toString.call(dataNode) == '[object Array]' 
                            && !~body.indexOf('$[#]')
           && body.match(/\$[^\s^\$]+\$/);
      
      if (!unmarkedArray) {
        target = transform({
          tag: tag, 
          body: body, 
          data: dataNode
        });
        
        if (target) {
          source = source.replace(tag, target);
        } else {
          source = source.replace(tag, body);
        }
      }
      
      pathName.pop();

      console.warn(source);
    }
  }
  
  // pass #3 resolve values (not hashes, no matching end token)
  
  var startTokens = source.match(/\$[^\#^\$^\s]+\$/g) || [];

  i = startTokens.length;
  startTokens.visited = {};
  
  while (i--) {
    startToken = startTokens[i];

    if (!startTokens.visited[startToken]) {
    
      startTokens.visited[startToken] = startToken;
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
  }
  
  return source;
});

////////////////////////////////////////////////////////////////////////////////

/*
 * function#template
 * heredoc/multiline string polyfill 
 * originally inspired by @rjrodger's mstring project
 * requires string#template
 */
typeof Function.prototype.template == 'function' ||
(Function.prototype.template = function template(data) {

  var fs = String(this);
  
  // splitting logic taken from where.js
  var fnBody = fs.replace(/\s*function[^\(]*[\(][^\)]*[\)][^\{]*{/,'')
                 .replace(/[\}]$/, '');
  var table = fnBody.match(/\/(\*){3,3}[^\*]+(\*){3,3}\//);
  var rows = (table && table[0] || fnBody)
              .replace(/\/\/[^\n]*/g, '') // remove line comments...
              .replace(/(\/\*+)*[\r]*(\*+\/)*/g, '') // ...block comments
              .split('\n'); // and split by newline
              
  var r = [];
  
  for (var i = 0; i < rows.length; i++) {
    r.push( rows[i] );
  }

  // windows vs. linux issue ~ travis borks if \\r not removed
  r = r.join('\n').replace(/\\r/g, '');

  return (data && typeof data == 'object') ? r.template(data) : r;
});
