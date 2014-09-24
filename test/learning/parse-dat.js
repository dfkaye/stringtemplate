// Sept 4-5, 2014 ~ start the zero-recursion version 
// Sept 6 - still in progress but most array drilldown is done
// Sept 9 ~ cleaned up array v placeholder detection and drilldown
// Sept 16 ~ finally ~ looks like complex data mapping is solved except for nested array indexing

// TODO ~ BUILD REPO WITH TESTS, DOCUMENTATION, EXAMPLES

// the previous ST revision dated Sept 4-9 does not handle the complex nested array/map case
// should first iterated data map rather than by string rows as string may not have any newline chars
// and blocks of start-end tags for arrays or maps easier to replace inline (just have to figure out a 
// best approach to handling duplicated names 
/* 

// this data structure

  inner: { 
    inner: [
      { 
        inner: 'inner'
        
      } 
    ] 
  }
  
// should be matched by this template

  inner.inner[#].inner )
*/


function parse(obj, map, path) {

  path || (path = '');
  map || (map = {});

  for (var k in obj) {
    var key;

    if (isNaN(Number(k))) {
      key = path.concat((path.length > 0 ? '.' : '') + k);
    } else {
      key = path.concat('[' + k + ']');
    }
    
    if (typeof obj[k] != 'object') {
      map['$' + key + '$'] = obj[k];
    } else {
      map = parse(obj[k], map, key);
    }
  }
  
  return map;
}

var data = { 
  title: 'row-data test',
  object: { 
    property: ' a property value ',
    array : [ 1, Math.PI , 'tweetie bird', { hey: [ 'now', 'then' ] }, true ]
  },
  array: [
    { name: 'david', age: 23, address: 'first' },
    { name: 'turkey', age: 46, address: 'second' },
    { name: 'lemon', age: 68, address: 'third' }
  ],
  inner: [ { inner: [ { inner: 'first' } ] }, { inner: [ { inner: 'second' } ] } ] 
};

var map = parse(data);

console.dir(map);  // reverse order
 
/*
$title$                     "row-data test"
$object.property$           " a property value "
$object.array[0]$           1
$object.array[1]$           3.141592653589793
$object.array[2]$           "tweetie bird"
$object.array[3].hey[0]$    "now"
$object.array[3].hey[1]$    "then"
$object.array[4]$           true
$array[0].name$             "david"
$array[0].age$              23
$array[0].address$          "first"
$array[1].name$             "turkey"
$array[1].age$              46
$array[1].address$          "second"
$array[2].name$             "lemon"
$array[2].age$              68
$array[2].address$          "third"
$inner[0].inner[0].inner$   "first"
$inner[1].inner[0].inner$   "second"
*/

var s = [
  "<p>$object.property$</p>",
   
  "<ul>",
  "$object.array$",
    "<li>",
    "$[#]$: $[#].hey$",
    "</li>",
  "$/object.array$",
  "</ul>",
  
  "<ul>",
  "$inner$",
    "<li>",
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

// !!!!! finally !!!!!
// 16 Sept 2014 12:13 AM PDT
  
function replace(s, data, map) {

  var src = s.toString(),
      tokens = s.match(/\$[^\$]+\$/g),
      token, current, next, end, endAt;
      
  for (var i = 0; i < tokens.length; ++i) {
    
    token = tokens[i];
    //console.log(i, ':', token);

    if (token in map) {
      // simple case
      //s = s.replace(RegExp(token.replace(/\$/g, '\\$')), map[token]);
      
    } else {
      // expand token blocks
    
      // skip end tags & any tokens we've already replaced
      if (token.indexOf('$/') === 0 || !~s.indexOf(token)) {
        continue;
      }

      // nested case
      current = s.indexOf(token);
      next = s.indexOf(token, current + 1);
      end = token.replace(/\$/, '$/');
      endAt = s.indexOf(end);
      
      // drill-down name tokens
      var p = 0;
      var path = token.replace(/\$/g, '').split('.');
      var node = data;

      while (p < path.length) {
        node = node[path[p]] || node;
        p += 1;
      }

      while (~next) {
        current = next;
        next = s.indexOf(token, next + 1);
      }
      
      var array = {}.toString.call(node) == '[object Array]';
      if (array) {
        var tag = s.substring(current, (endAt + token.length + 1));
        //console.warn(tag);
        var content = s.substring(current + token.length, endAt);
        //console.warn(content);       
        var tags = content.match(/\$[^\$]+\$/g) || [];
        //console.warn(tags);        
        var hashes = content.match(/\$(\[\#\]):?(\.[^\$]+)?\$/g) || [];
        var temp = [];
        // console.warn('****** tag *****', tags , hashes);
        //console.warn(content);
        for (var n = 0; n < node.length; ++n) {
          // $[#]$ or $[#].key
          if (hashes.length > 0 /*&& tags.join() === hashes.join()*/) {
            temp.push(content.replace(/\$\[\#\]/g, token.substring(0, token.length - 1) + 
                                      '[' + n + ']')
                             .replace('#', n).trim()
                     ); //.trim()
          } else {
            // !!!!! finally !!!!!
            // 16 Sept 2014 12:13 AM PDT
            var sub = content.toString();
            // THIS CAN'T POSSIBLY BE RIGHT
            for (var d = 0; d < tags.length; ++d) {
              sub = sub.replace(tags[d], token.substring(0, token.length - 1) + '[' + n +
                                         ']' + '.' + tags[d].replace('$', '')
                               );
            }
            temp.push(sub.trim()); // .trim()
          }
        }
        s = s.replace(tag, temp.join('').trim()); // .trim()
        //console.log(s);        
      }
    }
  }
  
  for (var k in map) {
    s = s.replace(k, map[k]);
  }
  
  return s;
}

replace(s, data, map);
