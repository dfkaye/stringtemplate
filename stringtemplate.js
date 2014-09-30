
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
    
      /*
       * 29 sept 2014
       * tag j is named if it contains token
       * else j is the index of the object on data node
       */

      j = innerTags[0].replace(/[\$\[\]]/g, '');
      node = node[tags[j].token] || node[j];
      tag.target = tag.body.replace('$[' + j + ']$', transform(tags[j], node));
      
    } else {
      tag.target = transform(tag, node);
    }
    
    // replace tags only if properly matched and transformed
    !tag.target || (source = source.replace('$[' + i + ']$', tag.target));
  }

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
