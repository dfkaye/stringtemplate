// q&d type describe method for javascript
// returns lowercase string
//   function, object, array, string, number, null, boolean, regexp, undefined, 
//   date, error, int16array, etc.

function describe(obj) {
  var type = obj && obj.constructor.name 
             ? obj.constructor.name.toLowerCase() 
             : !obj && typeof obj == 'object' 
               ? 'null' 
               : typeof obj;
  console.log(type);
  return type;
}

// cases
/*
describe(describe); // function
describe({}); // object
describe([]); // array
describe(''); // string
describe(String()); // string
describe(2); // number
describe(Number()); // number
describe(null); // null
describe(false); // boolean
describe(Boolean()); // boolean
describe(Object()); // object
describe(/\//); // regexp

describe(); // undefined

describe(new Date); // date
describe(new function(){}); // object
describe(Function()); // function
describe(NaN); // number
describe(Infinity); // number
describe(Number.POSITIVE_INFINITY); // number
describe(Number.MAX_VALUE); // number
describe(Error('error'));
describe(Math); // object
describe(Math.PI); // number

describe(Int16Array(10)); // number

*/



// string#template
// a batch string#replace, using $token$ placeholders
// requires string#trim and array#map
String.prototype.template = function (data) {
  var s = String(this);

  var tokens = this.match(/\$[^\$]+\$/mg);
  if (!tokens || !data) {
    return this; 
  }
  
  var map = {};
  tokens.map(function(k) {
    map[k] = k;
  });
  //console.log(map);
  
  var args = [data];
  var type = Object.prototype.toString.call(data).toLowerCase();
  ~type.indexOf('array') && (args.map.call(data, function(o, i){
    args[i] = o;
  }));
  
    /////////////////////
  // 19 August 2014
  // support (str, data) signature
  /////////////////////
  //~type.indexOf('string') && (s = s.concat(args.shift()));    
  typeof args[0] == 'string' && (s = s.concat(args.shift()));    
  if (args.length === 0) {
    return s;
  }
  
  var parts = [];
  var rows;
  var arg;

//console.log(rows.toString());
  
  for (var j = 0; j < args.length; j++) {
  
    arg = args[j];      
    rows = s.split('\n');
    
    for (var k in arg) {
      if (arg.hasOwnProperty(k)) {
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].match(/\$[^\$]+\$/mg)) {
            if (typeof arg[k] == 'object') {
              // recursive part
              rows[i] = rows[i].template(arg[k]);

            } else if ('$'+k+'$' in map) {
              rows[i] = rows[i].replace('$'+k+'$', arg[k]);
            
            }
          }
        }
      }
    }

    
    //console.warn((j + 1) + ' / ' + args.length + ': ' + rows.join('\n').trim());
    parts.push(rows.join('\n').trim());
  }

  return parts.join('\n').trim();
};

// function#template
// heredoc/multiline string polyfill
// requires string#trim and string#template
Function.prototype.template = function (data) {
  var fs = String(this);
  
  // splitting logic taken from where.js
  var fnBody = fs.replace(/\s*function[^\(]*[\(][^\)]*[\)][^\{]*{/,'')
                 .replace(/[\}]$/, '');
  var table = fnBody.match(/\/(\*){3,3}[^\*]+(\*){3,3}\//);
  var rows = (table && table[0] || fs)
              .replace(/\/\/[^\r]*/g, '') // remove line comments...
              .replace(/(\/\*+)*[\r]*(\*+\/)*/g, '') // ...block comments
              .split('\n'); // and split by newline
              
  var parts = [];
  var tmpl = data && typeof data == 'object';
  var r;
  
  for (var i = 0; i < rows.length; i++) {
    if (!rows[i].match(/^\s+$/)) {
      parts.push( rows[i].trim() );
    }
    //parts[i] = process ? r.template(data) : r;
  }
  
  r = parts.join('\n').trim();
  
  return tmpl ? r.template(data) : r;
  //return rows.join('\n').template(data).trim();
};

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
            '<li>name: david - age: 55</li>');
console.log('<li>name: $name$ - age: $age$</li>'.template([{ name: 'david', 
                                                             age: 55 }, 
                                                           { name: 'francis', 
                                                             age: 66 }]) ===  
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
  "<li>name: david - age: 77</li>");

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
console.warn('addressString: ' + addressString);

// that's better, but now let's really fix it

function addressItem() {
 /***
   <li>$street$</li>
   <li>$city$, $state$</li>
 ***/
}

// concatenation

console.log(
  addressTitle.template('concatenation: ' +
    '<ul>' + addressItem.template(addressData) + '<ul>')
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
}.template();

var declarations = function declarations() {
/***
  border: $border$;
  color: $color$;
  background-color: $bgcolor$;
***/
}.template();

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
