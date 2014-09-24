// August 27, 2014

function kv(data, par) {
  
  if (!data || typeof data != 'object') {
    return data;
  }
  
  var map = {};
  var s;
  var n;
  var m;
  for (var k in data) {
    n = isNaN(Number(k));
    s = (par ? par + (n ?  k : '#') : n ? k : '#');// + k;
    //s = (par ? par + (n && par.charAt(par.length - 1) != '#' ? '.' + k : '#') : n ? k : '');// + k;
    s = par ? par + '.' + k : k;
    
    if (data[k] && typeof data[k] == 'object') {
      // recursive part
      m = kv(data[k], s);
      for (var i in m) {
        map[i] = (m[i] || 0) + 1;
      }
    } else {
      map[s] = (map[s] || 0) + 1;
    }
  }
  return map;
}

String.prototype.template = function template(data) {
  var map = kv(data);
  console.log(map);
  
  var rows = this.split('\n');
  //console.log(rows.toString());
  //console.log('length: ' + rows.length)

  for (var i = 0, row; i < rows.length; ++i) {
    row = rows[i];
    //console.log(row);
    
    var tokens = row.match(/\$[^\$]+\$/mg);
    //console.log(tokens);
    
    if (tokens) {
      for (var t = 0, token; t < tokens.length; t++) {
        token = tokens[t].replace(/\$/g, '');
        count = map[token];
        //console.log(token + ': ' + count);
        
        var keys = token.split('.');
        //console.log(keys);
        
        if (count > 0) {
        //   map[token]--;
        //  rows.splice(i, 0, ''.concat(row));
           
        }
      }
    }
  }
  console.log('length: ' + rows.length)
};

var rows = [
  '<p>$title$</p>',
  '<ul>',
  '<li>$list.#.name$, $list.#.age$</li>',
  '<li>$list.#.address$</li>',
  '',
  '</ul>'  
  ].join('\n');

var data = {
  title: 'test title',
  object: { property: '' },
  list: [
    { name: 'david', age: 23, address: 'first' },
    { name: 'turkey', age: 46, address: 'second' },
    { name: 'lemon', age: 68, address: 'third' }    
    ]
};

rows.template(data);