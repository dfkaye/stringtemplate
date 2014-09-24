// mocha/suite.js

var assert = assert;

if (typeof require == 'function') {
  require('../../stringtemplate');
  assert = require('assert');
}

/* TESTS START HERE */

suite('string#template');

test('is method', function () {
  assert(typeof ''.template == 'function');
});

test('returns self.toString() when argument is not an object', function () {

  var s = '';
  
  assert(s.template() === s);
  assert(s.template(1) === s);
  assert(s.template(true) === s);
});

test('returns self.toString() when argument is an empty object or array', function () {

  var s = '';
  
  assert(s.template(null) === s);
  assert(s.template({}) === s);
  assert(s.template([]) === s);  
});

test('replaces matched $placeholder$ data', function () {

  var s = '<p>$value$</p>';
  
  assert(s.template({ value: 'placeholder' }) === '<p>placeholder</p>');
});

test('replaces tokens without re-formatting or trimming', function () {

  var s = ' $space$ ';

  assert(s.template({ space: 'trimmed'}) === ' trimmed ');
});

test('does not escape/unescape html/xml tags', function () {

  var s = '<p>$value$</p>';
  
  assert(s.template({ value: 'placeholder' }) === '<p>placeholder</p>');
});

test('ignores un-matched $placeholder$ data', function () {

  var s = '<p>$value$</p>';
  
  assert(s.template({ wrongName: 'placeholder' }) === s);
});

test('$ chars inside $placeholder$ data are preserved', function () {

  var s = '<p>$dollar$</p>';
  
  assert(s.template({ dollar: '$<b>1.00</b>' }) === '<p>$<b>1.00</b></p>');
});

test('replaces $nested.value$ data', function () {

  var s = '<p>$nested.value$</p>';
  
  assert(s.template({ 
    nested: {
      value: 'placeholder' 
    }
  }) === '<p>placeholder</p>');
});

suite('blocks');

test('replaces $object$ $[#]$ $/object$ data', function () {

  var s = [
    '$object$',
    '<p>$[#]$</p>',
    '$/object$'
  ].join('');
  
  var data = { 
    object: {
      value: 'value',
      name: 'name'
    }
  };
  
  assert(s.template(data) === '<p>value</p><p>name</p>');
});


suite('arrays');

test('replaces indexed array data', function () {
  
  var s = [
    '$[#]$', 
    '<li>$[#]$</li>', 
    '$/[#]$'
  ].join('\n');
  
  var data = [ 33, false ];

  var expected = [
    '', 
    '<li>33</li>',
    '',
    '<li>false</li>',
    ''
  ].join('\n');
  
  assert(s.template(data) === expected);
});

test('replaces indexed object key-value data', function () {
  
  var s = [
    '$[#]$',
    '<li>$[#].name$</li>',
    '$/[#]$'
  ].join('\n');

  var data = [
    { name: 'charlize' },
    { name: 'zora neale' }
  ];
  
  var expected = [
    '',
    '<li>charlize</li>',
    '',
    '<li>zora neale</li>',
    ''
  ].join('\n');
  
  assert(s.template(data) === expected);
});

test('replaces array index values using $array$ $[#]$ and $/array$', function () {

  var s = [
    '<ul>', 
    '$array$', 
    '<li>$[#]$</li>', 
    '$/array$', 
    '</ul>'
  ].join('\n');
  
  var data = { 
    array: [ 'three', 'four', 'five' ]
  };
  
  assert(s.template(data).replace(/\n\n/g, '\n') === [
    '<ul>',
    '<li>three</li>', 
    '<li>four</li>', 
    '<li>five</li>',
    '</ul>'
  ].join('\n'));
});

test('replaces array item values using $array$ $[#].item$ and $/array$', function () {

  var s = [
    '<ul>', 
    '$array$', 
    '<li>$[#].item$</li>', 
    '$/array$', 
    '</ul>'
  ].join('\n');
  
  var data = { 
    array: [
      { item: 'one' },
      { item: 'two' }
    ]
  };

  var expected = [
    '<ul>', 
    '<li>one</li>', 
    '<li>two</li>', 
    '</ul>'
  ].join('\n');
  
  // replace blank 'rows' in result
  assert(s.template(data).replace(/\n\n/g, '\n') === expected);
});

test('groups multi-row key-value data by array index', function () {

  var list = [
    '<ul>', 
    '$addresses$', 
    '<li>$[#].street$</li>', 
    '<li>$[#].city$, $[#].state$</li>', 
    '$/addresses$', 
    '</ul>'
  ].join('\n');

  var t = list.template({ 
    addresses: [
      { street: '123 fourth street', city: 'cityburgh', state: 'aa' },
      { street: '567 eighth street', city: 'burgville', state: 'bb' },
      { street: '910 twelfth street', city: 'villetown', state: 'cc' }
    ]
  });
  
  var expected = [
    '<ul>',
    '<li>123 fourth street</li>',
    '<li>cityburgh, aa</li>',
    '<li>567 eighth street</li>',
    '<li>burgville, bb</li>',
    '<li>910 twelfth street</li>',
    '<li>villetown, cc</li>',
    '</ul>'
  ].join('\n');

  // replace blank 'rows' in result
  assert(t.replace(/\n\n/g, '\n') === expected);
});


suite('bad arrays');

test('$array$...$/array$ not processed when missing $[#]$ tokens', function () {
  
  var s = ['$array$', '<li>$item$</li>', '$/array$'].join('');
  
  var data = { 
    array: [
      { item: 'one' },
      { item: 'two' }
    ]
  };
  
  var expected = ['$array$', '<li>$item$</li>', '$/array$'].join('');
  
  assert(s.template(data) === expected);
});

test('$array$ $[#]$ not processed when missing $/array$ token', function () {
     
  var s = [
    '<ul>', 
    '$missingEndTag$', 
    '<li>$[#].item$</li>', 
    '</ul>'
  ].join('\n');
  
  var data = { 
    missingEndTag: [
      { item: 'one' },
      { item: 'two' }
    ]
  };
  
  var expected = [
    '<ul>', 
    data.missingEndTag.toString(), 
    '<li>$[#].item$</li>',
    '</ul>'
  ].join('\n');
    
  assert(s.template(data) === expected);
});

test('nested $array$ directives are supported', function () {

  var s = [
    '$array$', 
    '$[#].nested$', 
    ' + $[#]$', 
    '$/[#].nested$', 
    '$/array$'
  ].join('\n');
  
  var data = { 
    array: [
      { nested: [1,2,3] }
    ]
  };
  
  var expected = [
    '', 
    '', 
    ' + 1', 
    '', 
    ' + 2',
    '', 
    ' + 3',
    '', 
    '', 
  ].join('\n');

  //console.warn(  s.template(data) );

  assert(s.template(data) === expected);
});

/////////////////////////////////////////////////////////////////////////////////////////

suite('function#template');

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
    if (data) {
      if (!rows[i].match(/^\s*$/)) {
        r.push( rows[i].trim() );
      }
    }
    else {
      r.push( rows[i] );
    }
  }

  r = r.join('\n').replace(/\\r/g, '');
  data && (r = r.trim());
  
  return (data && typeof data == 'object') ? r.template(data) : r;
});

test('is method', function () {
  assert(typeof (function(){}).template == 'function');
});

test('returns empty string when function has no /*** and ***/ delimiters', function () {
  
  function temp() {}
  
  assert(temp.template() === '');
});

test('returns docstring between /*** and ***/ delimiters', function () {

  function temp() {
  /***
  Hello.
    I am a docstring,
    inside a function.
  ***/
  }
  var expected = [
  '',
    '  Hello.', 
    '    I am a docstring,', 
    '    inside a function.',
    '  ',
  ].join('\n');
  
  assert(temp.template() === expected );
});

test('does not remove blank lines from  /*** docstring ***/', function () {

  function temp() {
  /***
  first
  
  second
  
  third
  ***/
  }
  
  var expected = ['', '  first', '  ', '  second', '  ', '  third', '  '].join('\n');

  assert(temp.template() === expected);
});

test('removes blank lines from  /*** docstring ***/ when data argument specified', function () {

  function temp() {
  /***
  first

  second
  
  third
  ***/
  }

  assert(temp.template({}) === ['first', 'second', 'third'].join('\n') );
});

test('removes line comments found within /*** docstring ***/', function () {

  function temp() {
  /***
  Hello.  // I am a comment
    I am a docstring,
    inside a function.  
  ***/
  }
  // 
  assert(-1 === temp.template().indexOf('I am a comment'));
});

test('calls string#template on docstring when data argument is specified', function () {

  function temp() {
  /***
  <p>$title$</p>
  ***/
  }
  
  var data = { title: 'data test' };

  assert(temp.template(data) === '<p>data test</p>');
});

test('trims whitespace in multiline strings when data argument is specified', function () {

  var s = [' $space$ ', 'nospace', ' space '].join('\n');
  
  var data = { 
    space: 'trimmed'
  };
  
  function temp() {
  /***
   $space$ 
  nospace
   space 
  ***/
  }
  
  assert(temp.template(data) === ['trimmed', 'nospace', 'space'].join('\n'));
});

test('returns unprocessed docstring when data argument is not an object', function () {
  
  function temp() {
  /***
  <p>$title$</p>
  ***/
  }

  assert(temp.template('data test') === '<p>$title$</p>');
});


suite('mixed data examples');

test('processes mixed data map', function () {

  function temp() {
   /***
   
    <p>$title$</p> // string
    <p>$object.main.property$, name: $object.main.name$</p> // nested object
    <ul>
      $items$ // array, lists value of name, age and address at each index
      <li>$[#].name$, $[#].age$</li>
      <li>$[#].address$</li>
      $/items$
    </ul>
    <p>
      some

      more
    </p>
    <ul>
      $list$ // array, lists value at each index
      <li>$[#]$</li>

      $/list$
    </ul>
   ***/
  }
  
  var data = {
    title: 'mixed data test',
    object: { 
      main: {
        property: 'this is a property value at $object.main.property$', 
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
  
  var expected = [
    '<p>mixed data test</p>',
    '<p>this is a property value at $object.main.property$, name: sarah winchester</p>',
    '<ul>',
    '',

    '<li>david, 28</li>',
    '<li>home</li>',
    '',

    '<li>divad, 82</li>',
    '<li>away</li>',
    '',
    
    '</ul>',
    '<p>',
    'some',
    'more',
    '</p>',
    '<ul>',
    '',

    '<li>a</li>',
    '',

    '<li>b</li>',
    '',

    '<li>c</li>',
    '',

    '</ul>'
  ].join('\n');

  assert(temp.template(data) === expected);
});

test(' template results can be combined via data argument', function () {

  var list = [
    '<ul>', 
    '$addresses$', 
    '</ul>'
  ].join('\n');
              
  var address = [
    '$[#]$', 
    '<li>$[#].street$</li>', 
    '<li>$[#].city$, $[#].state$</li>', 
    '$/[#]$'
  ].join('\n');
  
 

  var t = list.template({
    addresses: address.template([
      { street: '123 fourth street', city: 'cityburgh', state: 'aa' },
      { street: '567 eighth street', city: 'burgville', state: 'bb' },
      { street: '910 twelfth street', city: 'villetown', state: 'cc' }
    ])
  });
  
  var expected = [
    '<ul>',
    '',

    '<li>123 fourth street</li>',
    '<li>cityburgh, aa</li>',
    '',

    '<li>567 eighth street</li>',
    '<li>burgville, bb</li>',
    '',

    '<li>910 twelfth street</li>',
    '<li>villetown, cc</li>',
    '',

    '</ul>'
  ].join('\n');
  
  assert(t === expected);
});

/*

  // css
  
  var selector = '$selector$';
  var ruleset = '{ $ruleset$ }';
  var rule = '$prop$: $value$;';

  var r = rule.template([ {prop: 'color', value: '#345'} ])
  var rs = ruleset.template({ ruleset: r });
  var s = selector.template({selector: 'a > b > c'}).template(rs);
  console.log(s == 'a > b > c{ color: #345; }');

  // heredoc css

  function cssruleset() {
    /\***
    $selector$ { 
      $declarations$
    }
    ***\/
  }

  function declarations() {
    /\***
     basic: 10px;
     color: $color$;
     background-color: $bgcolor$;
    ***\/
  }

  cssruleset.template({
    selector: ".class ~ whatever::after",
    declarations: declarations.template({
      color: '#345',
      bgcolor: 'rgb(34, 0, 53)'
    })
  });

*/