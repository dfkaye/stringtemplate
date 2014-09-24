// August 17, 2014

// combines the function#heredoc/mstring concept with string#template,
// re-naming function#heredoc to function#template

// still a bit wonky

// TODO
// + add caching
// + figure out nesting or composing template results into another template

///////////////////////////
// --- polyfills ---
///////////////////////////

// array#map polyfill
// Reference: http://es5.github.com/#x15.4.4.19
typeof Array.prototype.map == 'function' ||
(Array.prototype.map = function (callback, thisArg) {
  var T, A, k;
  if (this == null) {
    throw new TypeError(" this is null or not defined");
  }
  var O = Object(this);
  var len = O.length >>> 0;
  if (typeof callback !== "function") {
    throw new TypeError(callback + " is not a function");
  }
  if (arguments.length > 1) {
    T = thisArg;
  }
  A = new Array(len);
  k = 0;
  while (k < len) {
    var kValue, mappedValue;
    if (k in O) {
      kValue = O[k];
      mappedValue = callback.call(T, kValue, k, O);
      A[k] = mappedValue;
    }
    k++;
  }
  return A;
});

// string#trim polyfill
typeof String.prototype.trim == 'function' ||
(String.prototype.trim = function trim() {
  return this.replace(/^\s+|\s+$/gm, '');
});

///////////////////////////
// --- show time ---
///////////////////////////

// string#template
// a batch string#replace, using $token$ placeholders
// requires string#trim and array#map
typeof String.prototype.template == 'function' ||
(String.prototype.template = function template(arg) {

  var s = String(this);
  var i, args, len;
  var t, data, arg;
  
  for (i = 0, len = arguments.length, args = Array(len); i < len; i++) {
    args[i] = arguments[i];
  }

  /* 19 August 2014 ~ support (str, data) signature */
  if (typeof args[0] == 'string') {
    s = s.concat(args.shift());
  }
  
  if (args.length > 0 && s.match(/\$/g)) {
  
    data = [];
    
    // ANTI-PATTERN from supporting (obj), (obj, obj,...) and (array[obj, obj])
    // if only arg is array, then map args[0] on to args itself
    // map won't callback on non-arrays, so won't overwrite args
    //args.length > 1 || 
    (args[0] && args[0].length && args.map.call(args[0], function(o, i){
      args[i] = o;
    }));
    
    for (var j = 0; j < args.length; j++) {
    
      arg = args[j];      
      t = this;//String(s);
      
      console.log(arg.constructor.name);
      
      for (var k in arg) {
        if (arg.hasOwnProperty(k)) {
          if (typeof arg[k] == 'object') {
            t = t.template(arg[k]);
          } else {
            t = t.replace('$'+k+'$', arg[k]);
          }
        }
      }
      
      data.push(t.trim());
    }
    
    s = data.join('\n').trim();  
  }
  
  return s;
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
    if (!rows[i].match(/^\s+$/)) {
      r.push( rows[i].trim() );
    }
  }
  
  r = r.join('\n').trim();
  
  return (data && typeof data == 'object') ? r.template(data) : r;
});

///////////////////////////
// test it out
///////////////////////////

var rows = [
  '<p>should break:   $title$</p>',
  '<ul>',
  '<li>$name$, $age$</li>',
  '<li>$address$</li>',
  
  '</ul>'  
  ];

var data = {
  title: 'test title',
  list: [
    { name: 'david', age: 23, address: 'first' },
    { name: 'turkey', age: 46, address: 'second' },
    { name: 'lemon', age: 68, address: 'third' }    
    ]
};

// call inside heredoc
var result = []
for (var i = 0; i < rows.length; ++i) {
  result.push(rows[i].template(data));
}
console.log(result.join('\n'));

console.log(
  (function () {
    /***
    just
    a
    heredoc
    test
    ***/
  }).template()
);


/*
<p>should work:  test title</p>
<ul>
<li>david, 23, first</li>
</ul>
<p>should work:  test title</p>
<ul>
<li>turkey, 46, second</li>
</ul>
<p>should work:  test title</p>
<ul>
<li>lemon, 68, third</li>
</ul>
*/
console.warn(
  (function () {
    /***
    <p>should work:  $title$</p>
    <ul>
      <li>$name$, $age$, $address$</li>
      
    </ul>
    ***/
  }).template(data)
);


console.log(
'$name$'.template({ name: 'success' })
);

console.log(''.template({ name: 'david', age: 11 }) == 
            '');

console.log('<li>name: $name$ - age: $age$</li>'.template({ name: 'david', 
                                                             age: 33 }) === 
            '<li>name: david - age: 33</li>');
            
console.log('<li>name: $name$ - age: $age$</li>'.template({ name: 'david', 
                                                             age: 55 }, 
                                                           { name: 'francis', 
                                                             age: 66 }) ===  
            '<li>name: david - age: 55</li>\n<li>name: francis - age: 66</li>');

function empty() {
 /***

 
 ***/
}
console.log( empty.template({ name: 'david', age: 22 }) == "");
 
function ul() {
 /***
 <p>my info</p>
 <ul>
   <li>name: $name$ - age: $age$</li>
 </ul>
 ***/
}
console.log( ul.template({ name: 'david', age: 44 }) === 
             "<p>my info</p>\n<ul>\n<li>name: david - age: 44</li>\n</ul>");


             
// zero-args call to function heredoc returns the heredoc w/o transformation
console.log( ul.template() ===
             "<p>my info</p>\n<ul>\n<li>name: $name$ - age: $age$</li>\n</ul>");

function batch() {
 /***
   <li>name: $name$ - age: $age$</li>
 ***/
}
console.log( batch.template({ name: 'david', age: 77 }, 
                            { name: 'francis', age: 88 }) ===
  "<li>name: david - age: 77</li>\n<li>name: francis - age: 88</li>");

// batch example with array of objects
function array() {
 /***
   <li>name: $name$ - age: $age$</li>
 ***/
}
console.log( array.template([ { name: 'david', age: 3.14 }, 
                              { name: 'francis', age: 6.28 }
                            ]) ===
  "<li>name: david - age: 3.14</li>\n<li>name: francis - age: 6.28</li>");

//  + object traversal
//    - { address: { street: 'no. & street', city: 'city', state: 'state' } }
function address() {
 /***
 <p>my address</p>
 <ul>
   <li>$street$</li>
   <li>$city$, $state$</li>
 </ul>
 ***/
}
console.log( address.template(
  { address: { 
      street: '18-B Happy Street', 
      city: 'Cityville', state: 'ST' 
    }
  }) === 
  "<p>my address</p>\n<ul>\n<li>18-B Happy Street</li>\n<li>Cityville, ST</li>\n</ul>");

//  + object/array traversal
/*
  BUG partial fix 18 Aug 2014 10:44PM PDT
  ( p my address p is still repeated )
  
  expected:
  
    <p>my address</p>
    <ul>
    <li>18-A FIRST Street</li>
    <li>FIRSTVILLE, ST</li>  
    <li>19-B SECOND Street</li>
    <li>SECONDVILLE, TT</li>
    </ul>

  actual:

    <p>my address</p>
    <ul>
    <li>18-A FIRST Street</li>
    <li>FIRSTVILLE, ST</li>
    </ul>
    <p>my address</p>
    <ul>
    <li>19-B SECOND Street</li>
    <li>SECONDVILLE, TT</li>
    </ul>
 */
console.warn( address.template(
  { addresses: [
      { street: '18-A FIRST Street', city: 'FIRSTVILLE', state: 'ST'},
      { street: '19-B SECOND Street', city: 'SECONDVILLE', state: 'TT'},
    ] 
  }) === ['<p>my address</p>', 
          '<ul>',
          '<li>18-A FIRST Street</li>',
          '<li>FIRSTVILLE, ST</li>',
          '</ul>',
          '<p>my address</p>',
          '<ul>',
          '<li>19-B SECOND Street</li>',
          '<li>SECONDVILLE, TT</li>',
          '</ul>'].join('\n'));


/////////////////////
// 19 August 2014
/////////////////////

// better pattern for this ??

var addressTitle = '<p>my address</p>';
          
function addressList() {
 /***
 <ul>
   <li>$street$</li>
   <li>$city$, $state$</li>
 </ul>
 ***/
}

var addressData = { addresses: [
  { street: '18-A FIRST Street', city: 'FIRSTVILLE', state: 'ST'},
  { street: '19-B SECOND Street', city: 'SECONDVILLE', state: 'TT'},
]};


var addressString = addressTitle.template(addressList.template(addressData));

/*
<p>my address</p><ul>
<li>18-A FIRST Street</li>
<li>FIRSTVILLE, ST</li>
</ul>
<ul>
<li>19-B SECOND Street</li>
<li>SECONDVILLE, TT</li>
</ul>
*/
console.warn(addressString);

// that's better, but now let's really fix it

function addressItem() {
 /***
   <li>$street$</li>
   <li>$city$, $state$</li>
 ***/
}

// concatenation

console.log('concatenation: ' +
  addressTitle.template('<ul>' + addressItem.template(addressData) + '<ul>')
)

// inline template

console.log('commas: \n' + 
  addressTitle.template('<ul>$list$</ul>', { 
    list: addressItem.template(addressData) 
  })
)

console.log('dots: \n' + 
  // FIXED 21 AUG 2014 
  addressTitle.template('<UL>$list$</UL>').template({ 
    list: addressItem.template(addressData) 
  } )
)


// chaining pattern

console.log('concat chaining: \n' + 
  addressTitle
  .template('<ol>')
  .template(addressItem.template(addressData))
  .template('</ol>')
)



// css preprocessor

var cssruleset = function cssruleset() {
  /***
  $selector$ { 
    $declarations$
  }
  ***/
}

var declarations = function declarations() {
/***
  border: $border$;
  color: $color$;
  background-color: $bgcolor$;
***/
}

var example = cssruleset.template({
  selector: ".class ~ whatever::after",
  declarations: declarations.template({
    border: '10px 5px',
    color: '#345',
    bgcolor: 'rgb(34, 0, 53)'
  })
});

/*
.class ~ whatever::after {
border: 10px 5px;
color: #345;
background-color: rgb(34, 0, 53);
}
 */
console.log( example)
console.log( example === '.class ~ whatever::after {\n' +
'border: 10px 5px;\n' +
'color: #345;\n' +
'background-color: rgb(34, 0, 53);\n' +
'}')
