// Sept 4-5, 2014 ~ start the zero-recursion version 
// Sept 6 - still in progress but most array drilldown is done
// Sept 9 ~ cleaned up array v placeholder detection and drilldown

// TODO ~ BUILD REPO WITH TESTS, DOCUMENTATION, EXAMPLES

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

  if (!this.match(/\$[^\$]+\$/g) || !data) {
    return this;
  }

  var rows = this.split('\n'),
      parts = [],     // output collector
      i, j, k, p, t,  // loop indexes
      row,            // current row under process
      placeholder,    // match for $name$ or $data.name$:
      arrayStart,     // match for @array@ or @data.array@
      pathname, tokens, block, array, item;
      
  for (i = 0; i < rows.length; i += 1) {
  
    row = rows[i];
    
    placeholder = row.match(/\$[^\$]+\$/g);
    arrayStart = row.match(/\@[^\@^\/]+\@/g);
    
    // @array@ || @data.array@:
    if (arrayStart) {
    
      array = data;
      pathname = arrayStart[0].replace(/\@/g, ''); // console.log('pathname: ' + pathname);
      
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
        block.push(rows[i].trim());
      } // console.log(block);
      
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
    
      // $name$ || $data.name$:
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
// requires string#trim and string#template
typeof Function.prototype.template == 'function' ||
(Function.prototype.template = function template(data) {

  var fs = String(this);
  
  // splitting logic taken from where.js
  var fnBody = fs.replace(/\s*function[^\(]*[\(][^\)]*[\)][^\{]*{/,'')
                 .replace(/[\}]$/, '');
  var table = fnBody.match(/\/(\*){3,3}[^\*]+(\*){3,3}\//);
  var rows = (table && table[0] || fs)
              .replace(/\/\/[^\r]*/g, '') // remove line comments...
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


///////////////////////////////////////////////
//
//  some tests
//
///////////////////////////////////////////////

function comboList() {
 /***
 
  <p>$title$</p>
  <p>$object.main.property$, name: $object.main.name$</p>
  <ul>
    @items@ // list value of name, age and address at each index
    <li>$name$, $age$</li>
    <li>$address$</li>
    @/@
  </ul>
  <p>
    some

    more
  </p>
  <ul>
    @list@ // list value at each index
    <li>$.$</li>

    @/@
  </ul>
 ***/
}

var docstring = comboList.template();

console.log(docstring);


var data = {
  title: 'this is my title',
  object: { 
    main: {
      property: 'this is my property value', 
      name: 'sarah winchester' 
    }
  },
  items: [ 
    { 
      name: 'david', 
      age: 28, 
      address: 'home' 
    }, 
    { 
      name: 'divad', 
      age: 82, 
      address: 'away' 
    }
  ],
  list: [ 'a', 'b', 'c' ]
};

console.log(
  docstring.template(data)
);


function arrayIndex() {
/***
@.@ // data is an array, list value at each index
+ $.$
@/@
***/
}

console.log(
  arrayIndex.template([
    'green', 
    'orange', 
    'banana', 
    true, 
    false, 
    42, 
    { 
      // should print [object Object] 
    },
    function (){ 
      // should print undefined
    },
    new RegExp('\\@', 'g'), // should print "/\@/g"
    new String('should print this message')
  ])
);


function arrayItem() {
/***
@.@ // data is an array, list value of name at each index
+ $name$
@/@
***/
}

console.log(
  arrayItem.template([{ name: 'cHarlIze' }, { name: 'ZorA' }])
);


function arrayNested() {
/***
@package.data.array@ // drill-down to an array, list value of name at each index
+ $name$
@/@
***/
}

console.log(
  arrayNested.template({
    package: {
      data: {
        array: [{ name: 'JonAh' }, { name: 'CalEb' }]
      }
    }
  })
);
