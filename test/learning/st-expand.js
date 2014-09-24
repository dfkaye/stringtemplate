
//typeof String.prototype.template == 'function' ||
(String.prototype.template = function template(data) {

  /*
   * David F. Kaye (@dfkaye)
   * 18 SEPT 2014
   * still largely out of his mind
   *
   * string.template() merges data into doc-string tokens using simplest syntax possible.
   *
   * no formatting
   * no default substitution or suppression of empty values
   * no if/else logic
   *
   * standalone JavaScript method by hand means
   * + for-loop hell
   * + while-loop hell
   * + regular expressions ~ test them online with http://www.cuneytyilmaz.com/prog/jrx/ 
   * + sub-string manipulation ~ http://davidwalsh.name/string-replace-javascript
   */

  var reAllTags = /\$[^\$]+\$/g;
  var reTag = /\$[^\$^\#^\s^\/]+\$/; // 18 SEPT 2014 2:19 PM PDT
  var reHash = /\$\[\#\]\$/g;
  var reHashKey = /\$\[\#\][^\$]+\$/g; 
  var reEndTag = /\$\/[^\$]+\$/;
  
  var src = this.toString(); // will return modified source 
  var tags = src.match(RegExp(reTag.source, 'gm'));
  
  if (!data || !tags) {
    return src;
  }
    
  var tags, i, token, node, path, p; // inline case replacement
  var next, result, endResult, endToken, tag, content; // block case initial test
  var hash, hashKey, temp, sub, k, key; // simple block case hash replacement
  var depth, startIndex, endIndex; // recursive case nested replacement

  // inline case ~ tag has no matching end tag ~ replace all references
  
  for (i = 0; i < tags.length; ++i) {
    
    token = tags[i];

    if (!src.match( RegExp(token.replace('$', '$/').replace(/\$/g, '\\$'), 'gm') )) {

      // match data element at token path

      node = data;     
      path = token.replace(/\$/g, '').split('.');    
      p = 0;

      while (p < path.length) {
        node = node[path[p]];
        p += 1;
      } 

      // if no data, skip to next token; else replace all matched tokens
      
      !node || (src = src.replace(RegExp(token.replace(/\$/g, '\\$'), 'gm'), node));
    }
  }
  
  // block cases
  
  /*
   * We can't use reTag.lastIndex because we modify the source string potentially at each 
   * pass (yes, we're mutating state). Use the `next` index variable to extract the next 
   * source substring to work on; increment `next` when a token has no matching data.
   */
   
  next = 0;
  
  while (result = reTag.exec(src.substring(next, src.length))) {  

    token = result[0];
    
    // match data element at token path
    
    node = data;     
    path = token.replace(/\$/g, '').split('.');    
    p = 0;

    while (p < path.length) {
      node = node[path[p]];
      p += 1;
    }
    
    if (!node) {
    
      // skip to next token
      
      next = result.index + result.length;
      continue;
    }
    
    // set up for block processing 
    
    endResult = reEndTag.exec(src);
    endToken = endResult[0];      
    tag = src.substring(result.index, src.indexOf(endToken) + endToken.length);
    content = tag.substring(token.length, tag.length - endToken.length);
   
    if (!reTag.exec(content)) {
    
      // simple block case ~ hash and hash.key replacement
  
      hash = reHash.exec(content);
      hashKey = content.match(reHashKey);
      temp = [];

      for (k in node) {

        sub = content.toString();

        if (hash && typeof node[k] != 'object') {
          sub = sub.replace(hash[0], node[k]);
        }

        if (hashKey && typeof node[k] == 'object') {

          // object or array can have multiple hash.key references

          for (i = 0; i < hashKey.length; ++i) {
            key = hashKey[i].split('.')[1].replace('$', '');
            sub = sub.replace(hashKey[i], node[k][key]);
          }
        }

        if (sub !== content) {
          temp.push(sub);
        }
      }

      src = src.replace(tag, temp.join(''));

    } else {

      // nested tags case ~ recursive template call on tag body with data node

      sub = src.substring(src.indexOf(tag), src.length);
      tags = sub.match(reAllTags);
      depth = 0;
      startIndex = 0;
      endIndex = 0;

      for (i = 0; i < tags.length; ++i) {

        if (reTag.test(tags[i])) {
          startIndex || (startIndex = tags[i].length);
          depth += 1;
        }

        if (reEndTag.test(tags[i])) {
          depth -= 1;
          endIndex = sub.indexOf(tags[i], endIndex + 1);
        }

        if (depth === 0) {

          // VOILA ~ final touch - content vs tag 12:45 PM PDT 18 SEPT 2104

          tag = sub.substring(0, endIndex + tags[i].length);
          content = sub.substring(startIndex, endIndex);
          
          // recursive call
          src = src.replace(tag, content.template(node));
          break;
        }
        
      } // for matching end tag 
      
    } // block cases

  } // while in block
  
  return src//.trim();
});



var test = [
   
  "<ul>",
  "$object.array$",
    "<li>",
    "$[#]$: $[#].prop$",
    "$[#].prop2$",
    "</li>",
  "$/object.array$",
  "</ul>",
  
  "<ul>",
  "$inner$",
    "<li>",
      
      "<p>$object.property$</p>", // is this a valid case???

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
  ].join('\n');
  
test.template({
  object : {
    property: 'simple properties should be replaced everywhere',
    array: [ '1', { prop: 'vote for prop 1', prop2: 'vote for prop 2' }, '3' ]
  },
  inner: {
    inner: [
      { inner: 'innermost 1' },
      { inner: 'innermost 2' },
      { inner: 'innermost 3' },
      { inner: 'innermost 4' }
    ]
  }
});

/*
'should return string when no placeholders'.template({});

'should return string when $placeholders$ but no data argument'.template();

'should not go into an infinite loop when $placeholder$ does not match data'.template({});
*/
