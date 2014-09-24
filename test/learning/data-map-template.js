// August 27-28, 2014

String.prototype.template = function (data) {

  if (!this.match(/\$[^\$]+\$/mg) || !data) {
    return this; 
  }

  var rows = this.split('\n');
  var parts = [];

  // map placeholder tokens as pathnames

  var map = (function parse(map, obj, parent) {
    
    var path = parent ? parent.concat('.') : '';
    var key;
    
    if (Object.prototype.toString.call(obj) == '[object Array]') {
      
      for (var i = 0; i < obj.length; ++i) {
        
        key = path.concat(i);
        
        if (typeof obj[i] != 'object') {
          map['$' + key + '$'] = obj[i];        
        } else {
          map = parse(map, obj[i], key);
        }
      }
      
    } else {
      
      for (var k in obj) {
        
        key = path.concat(k);
        
        if (typeof obj[k] != 'object') {
          map['$' + key + '$'] = obj[k];
          
          // map count of items in an array
          var text = key.match(/\d+[.]/g) && key.replace(/\d+[.]/g, '#.');
          //console.warn(text && text.split('#.').splice(text.lastIndexOf('#.')));
console.warn(text);
          
        } else {
          map = parse(map, obj[k], key);
        }
      }
    }
    
    return map;
    
  }({}, data));
  
  console.log(map);
   
  for (var i = 0; i < rows.length; i++) {
    
    var row = rows[i];
    var arr = [];
    
    for (var key in map) {
      
      var digits = key.match(/\d+[.]/g);
      var text = key.replace(/\d+[.]/g, '#.');

      if (~row.indexOf(text)) {
        if (!digits) {
          row = row.replace(key, map[key]);
        } else {
          
          index = parseInt(digits[digits.length - 1], 10);
          arr[index] = (arr[index] || row).replace(text, map[key]);
          
          
          console.log('index: ' + index + '; key: ' + key);
        }        
      }
    }
    
    if (arr.length || !row.trim().match(/^\s*$/)) {
      parts.push(arr.length ? arr.join('\n').trim() : row);
    }
  }

  return parts.join('\n').trim();
};


var rowdata = {
  title: 'row-data test',
  object: { property: ' a property value ' },
  array: [
    { name: 'david', age: 23, address: 'first' },
    { name: 'turkey', age: 46, address: 'second' },
    { name: 'lemon', age: 68, address: 'third' }    
    ]
};


var rows = [
  '<p>$title$</p>',
  '<p>$object.property$</p>',
  '<ul>',
  '<li>$array.#.name$, $array.#.age$</li>',
  '<li>$array.#.address$</li>',
  '',
  '</ul>'  
  ].join('\n');

rows.template(rowdata);



var arraydata = [
  { title: 'array-data test' },
  { object: { 
    property: 'shows how to handle array data' }
  },
  { array: [
    { name: 'david', age: 23, address: 'first' },
    { name: 'turkey', age: 46, address: 'second' },
    { name: 'lemon', age: 68, address: 'third' }    
    ]
  }
];

var array = [
  '<p>$#.title$</p>',
  '<p>$#.object.property$</p>',
  '<ul>',
  '<li>$#.array.#.name$, $#.array.#.age$</li>',
  '<li>$#.array.#.address$</li>',
  '',
  '</ul>'  
  ].join('\n');

array.template(arraydata);



(function () {
 /***
  <p>$title$</p>
  <p>$object.property$</p>
  <ul>
    $array$
  </ul>
  ***/
})
.template(rowdata)
.template({  
  array: (function(){
    /***
      <li>$array.#.name$, $array.#.age$</li>
      <li>$array.#.address$</li>
      ***/
  }).template(rowdata)
});


function addressTmpl() {
 /***
 <p>$label$</p>
 <ul>
   <li>$each.#.street$</li>
   <li>$each.#.city$, $each.#.state$</li>
 </ul>
 ***/
}

var addressData = ({ 
  each: [
    { street: '18-A FIRST Street', city: 'FIRSTVILLE', state: 'ST'},
    { street: '19-B SECOND Street', city: 'SECONDVILLE', state: 'TT'}
  ]
  
})


function address(data) {
  
  var len = data.each.length;
  
  //data.label = len > 0 ? len === 1 ? 'my address' : 'my addresses' : 'no addresses';
    
  return addressTmpl.template(data);
}

address(addressData);
    
    
    