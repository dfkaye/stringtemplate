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
 * inspired by Terence Parr (StringTemplate) and Krasimir Tsonev (AbsurdJS)
 *
 * replaces doc-string tokens with corresponding data 
 * values, using simplest token set and syntax as possible.
 *
 * Function.prototype.template(data)
 * inspired by @rjrodger's [mstring](https://github.com/rjrodger/mstring)
 *
 * an additional helper method for doctrings, returns a `docstring` found by parsing 
 * contents between /*** and ***\/ delimiters in afunction body
 *
 * data argument to each method may be either an Object or an Array.  
 * empty arguments and primitives are ignored.
 *
 * goals of this project
 * + single methods only
 * + no ES5 functional programming
 * + no internal use of Function() constructor
 * + no formatting
 * + no default substitution or suppression of empty values
 * + no if/else logic or branching directives
 * + no error throwing
 * + no recursion
 *
 * standalone JavaScript methods by hand means
 * + potential for looping hell
 * + regex hell ~ test them online with http://www.cuneytyilmaz.com/prog/jrx/ 
 * + substring crunching ~ http://davidwalsh.name/string-replace-javascript
 * + small token set places big constraints on looping logic
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
  function transform(tag, node) {
  
  console.log('transform');
  console.log(tag);
  console.log(node);
  
  
    var body = tag.body;
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
        
        console.warn('handle');
        // console.warn(tag);
        // console.warn(node);
        
        for (var i = 0; i < hashKey.length; ++i) {
        
          key = hashKey[i].split('.')[1].replace('$', '');

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
    
    return contents.join('') || tag.tag;
  } // end transform()
  
  /*
   * main process ~ makes two passes through end tokens, if any, to map and 
   * replace block tags ~ make a final pass through tokens without matching end
   * tokens to replace values directly.
   */

  var endToken;
  for (i = 0; i < endTokens.length; ++i) {
  
    // map startTokens by index
    
    endToken = endTokens[i];
    source = source.replace(endToken.replace('$/', '$'), '$[' + (i) + ']$');
  }
  
  var endToken, startToken, endIndex, nodeName, substring, inner, lastInner;
  for (i = 0, j = 0; i < endTokens.length; ++i) {
  
    // match end to start tokens by index
    
    endToken = endTokens[i];
    startToken = '$[' + (i) + ']$';
    source = source.replace(endToken.replace('$/', '$'), startToken);
 
    endIndex = source.indexOf(endToken)  + endToken.length;
    substring = source.substring(0, endIndex);
    inner = substring.match(/\$\[\d+\]\$/g);
    
    if (inner) {
    
      while (lastInner = inner.pop()) {
        lastInner = lastInner.replace('$', '$/');
        if (!~source.indexOf(lastInner)) {
          break;
        }
      }
      
      j = lastInner.replace(/[^\d]/g, '');


    } else {
      j -= 1;

    }
            console.log(i, j);

          source = source.replace(endToken, '$/[' + (j) + ']$');
        //console.log(j);

  }
    console.warn(source);
return source;

  var endToken, endTag, startTag, nodeName, tag, body, dataNode, newTagBody,
      parent, stack = [], pathName;
  for (i = 0; i < endTokens.length; ++i) {

    // resolve mapped blocks (matching end and start tokens) to data

    endToken = endTokens[i];
    endTag = '$/[' + (i) + ']$';
    startTag = endTag.replace('$/', '$')
    tag = source.substring(source.indexOf(startTag), 
                           source.indexOf(endTag) + endTag.length);
    body = source.substring(source.indexOf(startTag) + startTag.length, 
                           source.indexOf(endTag));
    pathName || (pathName = 'data');
    
    nodeName = endToken.replace('$/', '$').replace(/\$/g, '');
    
    dataNode || (dataNode = data);

    if (body.match(/\$\[\d+\]\$/g)) {
    pathName = pathName + '.' + nodeName;

      console.log('push data for [' + pathName + ']');

      dataNode = dataNode[nodeName];
      stack.push({ index: i, tag: tag, body: body, data: dataNode });

    } else {
    
      newTagBody = transform({tag: tag, body: body}, dataNode[nodeName]);
      
      console.warn(newTagBody);
      //source = source.replace(tag, newTagBody);
      console.dir(stack);
      
      // check stack
      parent = stack.pop();

      //console.log(parent.index);
      
      //source = source.replace(parent.tag, parent.body.replace(tag, newTagBody));
      
    }
    console.log('pathName: ' + pathName);

  }
  
  
  return source;
  



  // pass #3 resolve values (not hashes, no matching end token)
  
  i = startTokens.length;
  
  while (i--) {
  
    startToken = startTokens[i];
    
    if (!visited[startToken]) {
    
      visited[startToken] = startToken;
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
