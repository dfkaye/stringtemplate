// stringtemplate.js

// Sept 4-5, 2014 ~ start the zero-recursion version 
// Sept 6 - still in progress but most array drilldown is done
// Sept 9 ~ cleaned up array v placeholder detection and drilldown

// TODO ~ BUILD REPO WITH TESTS, DOCUMENTATION, EXAMPLES


// 21 August 2014 1:04 AM PDT
/*
// test

'<p>notes & quotes</p>\n\r<q>$who$ said, "I\'ll be back"</q>'.escapeHtml();
// => "&lt;p&gt;notes &amp; quotes&lt;/p&gt;\n\r&lt;q&gt;$who$ said, &quot;I\'ll be back&quot;&lt;/q&gt;"
*/
var escapes = {"\\": "\\\\", "\n": "\\n", "\r": "\\r", "'": "\\'"},
    entities = {'&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;'};

typeof String.prototype.escapeHtml == 'function' || 
(String.prototype.escapeHtml = function escapeHtml() {
  return this
  .replace(/[\\\n\r']/g, function(char) {
    return escapes[char];
  })
  .replace(/[&\"<>]/g, function(char) {
    return entities[char];
  });
});

/////////////////////////////////////////////

// string#trim polyfill
typeof String.prototype.trim == 'function' ||
(String.prototype.trim = function trim() {
  return this.replace(/^\s+|\s+$/gm, '');
});

// string#template
// a batch string#replace, using $token$ placeholders for values/objects
// and @arrayName@ + @/@ tokens for indexed data (arrays)
// requires string#trim
typeof String.prototype.template == 'function' ||
(String.prototype.template = function template(data) {

  if (!this.match(/\$[^\$]+\$/g) || !data || typeof data != 'object') {
    return this.toString();
  }

  var rows = this.split('\n'),
      parts = [],     // output collector
      i, j, k, p, t,  // loop indexes
      row,            // current row under process
      placeholder,    // match for $name$ or $data.name$:
      arrayStart,     // match for @array@ or @data.array@
      arrayEnd,       // match for @/@
      pathname, tokens, block, array, item;
      
  for (i = 0; i < rows.length; i += 1) {
  
    row = rows[i];
    
    placeholder = row.match(/\$[^\$]+\$/g);
    arrayStart = row.match(/\@[^\@^\/]+\@/g);
    //arrayEnd = row.match(/\@\/\@/g);

    // @array@ || @data.array@:
    if (arrayStart) {

      array = data;
      pathname = arrayStart[0].replace(/\@/g, '');
      
      if (pathname != '.') {
      
        // drill-down name tokens
        tokens = pathname.split('.');
        p = 0;
        
        while (p < tokens.length) {
          array = array[tokens[p]];
          p += 1;
        }
      }

      block = [];
      
      // add rows to block until next array-end token, @/@ 
      while (rows[i += 1] && !rows[i].match(/\@\/\@/)) {
        
        if (i ===  rows.length - 1) {
        
          // return an error but do not throw it here          
          return new Error('Error: closing @/@ tag for ' + arrayStart[0] + 
                           ' array not found');
        }
        
        block.push(rows[i].trim());
      }
      
      // process copies of each row in block
      for (j = 0; j < array.length; j += 1) {
      
        row = block.join('\n');
        item = array[j];
        
        if (~row.indexOf('$.$')) {
          // solve array index value $.$
          row = row.replace('$.$', item);
        } else if (typeof item == 'object') {
          // solve item as key:value object
          for (var k in item) {
            row = row.replace('$'+k+'$', item[k]);
          }
        }
        
        parts.push(row.trim());
      }
      
    } else {
    
      // $placeholder$ || $namespace.placeholder$:
      if (placeholder) {
      
        // iterate placeholder in current row // console.log('placeholder: ' + placeholder)
        for (t = 0; t < placeholder.length; t += 1) {

          item = data;
                    
          // drill-down name tokens
          tokens = placeholder[t].replace(/\$/g, '').split('.');
          p = 0;

          while (p < tokens.length) {
            item = item[tokens[p]];
            p += 1;
          }

          row = row.replace(placeholder[t], item);
        }
      }
      
      // avoid array start/end, and whitespace-only
      //if (!row.match(/\@/g) && !row.match(/^\s*$/)) {
        parts.push(row.trim());
      //}      
    }   
  }

  return parts.join('\n').trim();
});

// function#template
// heredoc/multiline string polyfill 
// originally inspired by @rjrodger's mstring project
// requires string#trim and string#template
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
    if (!rows[i].match(/^\s*$/)) {
      r.push( rows[i].trim() );
    }
  }

  r = r.join('\n').trim();
  
  return (data && typeof data == 'object') ? r.template(data) : r;
});