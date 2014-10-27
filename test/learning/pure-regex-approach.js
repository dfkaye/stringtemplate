var data = {
  label: 'this is label',
  name: { 
    name: 'this is name.name'
  },
  collection: {
    array: [ 'a', 'b', 'c' ]
  },
  value: {
    empty: '',
    blank: ' ',
    'false': false,
    '0': 0,
    'undefined': undefined,
    'null': null
  }
    
};

var string = [
  '<p>$label$</p>',
  '<p>$name.name$</p>',
  '$should not modify this$',
  
  '$#.$',
  '<p>$label$</p>',
    '$#.$',
      '<p>$label$</p>',
      '+ $.$',
    '$/.$',
  '$/.$',
  
  '</ul>',  
  '<ul>',
  

  '$#collection$',
  '<p>$label$</p>',
    '$#array$',
      '<p>$label$</p>',
      '+ $.$',
    '$/array$',
  '$/collection$',
  
  '</ul>',
  '<p>$value.empty$</p>',
  '<p>$value.blank$</p>',
  '<p>$value.false$</p>',
  '<p>$value.0$</p>',
  '<p>$value.undefined$</p>',
  '<p>$value.null$</p>',
  '<ul>',

  '$#collection$',
  '<p>$label$</p>',
    '$#array$',
      '<p>$label$</p>',
      '+ $.$',
    '$/array$',
  '$/collection$',
  
  '</ul>'
  ].join('\n');



  
  
  
function template(string, data) {
 
  var reTags = /\$\#([\w\.?]+)\$/g;
  var reValues = /\$([\w\.?]+)\$/g;
  
  function resolveToken(token, data) {
    
    var node = data;
    var path = token.split('.');
    var p = 0;
    
    while (node && p < path.length) {
      node = node[path[p++]];
    }
  
    return node;
  }
  
  function replaceValues(string, data) {
  
    return string.replace(reValues, function(tag, token, offset, s) {
    
      var value = resolveToken(token, data);
      var primitive = !!~(typeof value).search(/string|boolean|number/);
      
      return (primitive && '' + value) || tag;
    });
  }
  
  function replaceCollections(string, data) {
  
    var tags = reTags.exec(string);
    
    console.log(tags.length);
    
    var tag = tags[0];
    var token = tags[1];
    var offset = tags.index;
    var endToken = tag.replace('#', '/');
    
    // tokens must be names not dots
    // else use start-end depth counting
    var body = string.substring(offset, string.indexOf(endToken) + tag.length);
    
    console.warn(tag, token, offset, body);

    //console.log(reTags.lastIndex);
    
    return string;
  }
  
  string = replaceValues(string, data);
  string = replaceCollections(string, data);
  
  return string;
}

template(string, data);
