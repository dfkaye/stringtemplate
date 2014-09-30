// typeof String.prototype.template != 'function' || 
(String.prototype.template = function template(data) {

  var source = this.toString();
  
  // add fail fast early return here ~ maybe
  
  var endTokens = source.match(/\$\/[^\$^\s]+\$/g) || [];
  var startTokens = source.match(/\$[^\#^\$^\s]+\$/g) || [];
  var tags = [];

  var endToken, endIndex, startToken, startIndex, nextIndex, tag, body;
  var i, innerTags, node, j;
  var path, p, reValueToken;
  
  /*
   * returns string derived from replacing node data in tag data
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
      
        if (typeof node[k] != 'object') {
        
          // replace primitives directly
          content = content.replace(hash[0], node[k]);
          
        } else {
        
          values = [];
          
          for (var n in node[k]) {
          
            values.push(body.replace(hash[0], node[k][n]));
          }
          
          content = values.join('');
        }
      }
      
      if (hashKey && typeof node[k] == 'object') {

        for (var i = 0; i < hashKey.length; ++i) {
        
          key = hashKey[i].split('.')[1].replace('$', '');
          
          if ({}.toString.call(node[k][key]) == '[object Array]') {
            
            // 30 Sept 2014
            
            values = [];
            
            for (var j in node[k][key]) {
            
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