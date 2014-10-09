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



/*** function#template ***/

suite('function#template for heredoc support');

test('is method', function () {
  assert(typeof (function(){}).template == 'function');
});

test('returns empty string when function has no /*** and ***/ delimiters', function () {
  
  function temp() {}
  
  assert(temp.template() === '');
});

test('returns docstring between /*** and ***/ delimiters', function () {

  function temp() {
  /***Hello. I am a docstring, inside a function.***/
  }
  
  assert(temp.template() === 'Hello. I am a docstring, inside a function.');
});

test('preserves whitespace in /*** docstring ***/', function () {

  function temp() {
  /***
  Hello.
    
    I am a docstring,
    
    with indentation and blank lines.
  ***/
  }
  var expected = [
  '',
    '  Hello.',
    '    ',
    '    I am a docstring,',
    '    ',
    '    with indentation and blank lines.',
    '  ',
  ].join('\n');
 
  assert(temp.template() === expected);
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
  
  var expected = [
  '',
  '  <p>data test</p>',
  '  '
  ].join('\n');
  
// console.warn( temp.template(data).split('\n') );
// console.warn( expected.split('\n') );
  assert(temp.template(data) === expected);
});

test('returns unprocessed docstring when data is not an object', function () {
  
  function temp() {
  /***
  <p>$title$</p>
  ***/
  }
  
  var expected = ['', '  <p>$title$</p>', '  '].join('\n');
// console.warn( temp.template('data test').split('\n') );
// console.warn( expected.split('\n') );
  assert(temp.template('data test') === expected);
});


suite('blocks and arrays');

test('replaces $object$ $[#]$ $/object$ data', function () {

  function s(){
    /***$object$ <p>$[#]$</p> $/object$***/
  }
  
  var data = { 
    object: {
      value: 'value',
      name: 'name'
    }
  };
  
  var expected = ' <p>value</p>  <p>name</p> ';
  
  // console.warn(s.template(data));
  // console.warn(expected);

  assert(s.template(data) === expected);
});

test('FIX ME ~ arrays can be deeply nested in objects', function () {

  var s4 = [
    
    "<p>$title$</p>",
    "<ul>",
    "$one$",
      "<li>",
        "<p>$title$</p>", // is this a valid case???
        "<ul>",
        "$one$",
          "<li>",
            "$[#].inner$",
          "</li>",
        "$/one$",
        "</ul>",
      "</li>",
    "$/one$",
    "</ul>",
    "<p>$one.innerTitle$</p>", // is this a valid case???
    "<ul>",
    "$one$",
      "<li>",
        "<ul>",
        "$two$",
          "<li>",
            "<ul>",
            "$three$",
              "<li>",
                "<ul>",
                "$four$",
                  "<li>",
                    "$[#].inner$",
                  "</li>",
                "$/four$",
                "</ul>",
              "</li>",
            "$/three$",
            "</ul>",
          "</li>",
        "$/two$",
        "</ul>",
      "</li>",
    "$/one$",
    "</ul>",
    "<ul>",
    "$one$",
      "<li>",
        "<p>$one.arrayTitle$</p>", // is this a valid case???
        "<ul>",
        "$three$",
          "<li>",  
            "<ul>",
            "$[#]$",
              "<li>",
                "$[#]$",
              "</li>",
            "$/[#]$",
            "</ul>",
          "</li>",            
        "$/three$",
        "</ul>",
      "</li>",
    "$/one$",
    "</ul>",    

  ].join('');

  var d4 = {
    title: 'nested example',
    one: {
      innerTitle: 'inner title',
      one: [
        { inner: '*one*' },
        { inner: '*one*' },
        { inner: '*one*' },
        { inner: '*one*' }
      ],
      two: {
        three: {
          four: [
            { inner: '*four*' },
            { inner: '*four*' },
            { inner: '*four*' },
            { inner: '*four*' }          
          ]
        }
      },
      arrayTitle: 'three: array',
      three: [
        [ 2, 4, 6 ],
        [ 'z', 'q', 'x' ],
        [ {}, [] ]
      ]
    }
  };
 
 
  // console.log( s4.template(d4) );
  // console.log( expected );
  
  var expect = [
    "<p>nested example</p>",
    "<ul><li>",
      "<p>nested example</p>",
      "<ul><li>*one*</li><li>*one*</li><li>*one*</li><li>*one*</li></ul>",
    "</li></ul>",
    "<p>inner title</p>",
    "<ul><li>",
      "<ul><li>",
        "<ul><li>",
          "<ul>",
            "<li>*four*</li><li>*four*</li><li>*four*</li><li>*four*</li>",
          "</ul>",
        "</li></ul>",
      "</li></ul>",
    "</li></ul>",
    "<ul><li>",
      "<p>three: array</p>",
      "<ul><li>",
        "<ul>",
          "<li>2</li><li>4</li><li>6</li>",
          "<li>z</li><li>q</li><li>x</li>",
          "<li>[object Object]</li><li></li>",
        "</ul>",
      "</li></ul>",
    "</li></ul>"
  ].join('');
  
  assert(s4.template(d4) === expect);
});

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



test('FIX ME ~ replaces deeply nested arrays of arrays', function () {
  
  var s = [
  'FIRST:',
  
    '$[#]$',
      '$[#]$',    
        '$[#]$',    
          '<p>$[#]$</p>',
        '$/[#]$',
      '$/[#]$',    
    '$/[#]$',
    
  'SECOND:',

    '$[#]$',
      '$[#]$',    
        '$[#]$',    
          '<p>$[#]$</p>',
        '$/[#]$',
      '$/[#]$',    
    '$/[#]$'
  ].join('\n');
  
  var data = [ [ [ 1, 2 ], [ 3, 4, 5] ], [ [ 6, 7], [ 8, 9] ] ];

  var expected = [
    "FIRST:",
    "",
    "",
    "",
    "<p>1,2</p>",
    "",
    "<p>3,4,5</p>",
    "",
    "<p>6,7</p>",
    "",
    "<p>8,9</p>",
    "",
    "",
    "",
    "SECOND:",
    "",
    "",
    "",
    "<p>1,2</p>",
    "",
    "<p>3,4,5</p>",
    "",
    "<p>6,7</p>",
    "",
    "<p>8,9</p>",
    "",
    "",
    ""
  ].join('\n');

  // console.log( s.template(data).split('\n') );
  // console.log( expected.split('\n') );

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

test('FIX ME ~ replaces nested array item values sequentially', function () {

  var s = [
    '$array$', 
      ' + $[#].nested$', 
    '$/array$'
  ].join('\n');
  
  var data = { 
    array: [
      { nested: [ 2, 4, 6, 8] }
    ]
  };
  
  var expected = [
    '', 
    ' + 2', 
    '', 
    ' + 4',
    '', 
    ' + 6',
    '',
    ' + 8',
    ''
  ].join('\n');

  console.log(  s.template(data) );
  console.log(  expected );

  assert(s.template(data) === expected);
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

test.only('FIX ME ~ replace deeply nested arrays on object keys', function () {

function f() {
/***
<ul>
$array$
$[#].nested$
<li>$[#].name$</li>
$/[#].nested$
$/array$
</ul>
***/}
  
  var data = { 
    array: [
      { nested: [ 
          { name: 'david' }, 
          { name: 'lawrence' }, 
          { name: 'charlie' }, 
          { name: 'john' }
        ] 
      }
    ]
  };
  
  var expected = [
    '',
    '<ul>',
    '',
    '<li>david</li>',
    '',
    '<li>lawrence</li>',
    '',
    '<li>charlie</li>',
    '',
    '<li>john</li>',
    '',
    '</ul>',
    '',
  ].join('\n');
  
console.log(expected.split('\n'));
console.log(f.template(data).split('\n'));

  assert(f.template(data) === expected);
});

test('replaces named nested array item values sequentially', function () {

  var s = [
    '$array$', 
      ' + $[#].nested$', 
    '$/array$'
  ].join('\n');
  
  var data = { 
    array: [
      { nested: [ 2, 4, 6, 8] }
    ]
  };
  
  var expected = [
    '', 
    ' + 2', 
    '', 
    ' + 4',
    '', 
    ' + 6',
    '',
    ' + 8',
    ''
  ].join('\n');

  console.log(  s.template(data) );
  console.log(  expected );

  assert(s.template(data) === expected);

});


suite('bad arrays');

test('$array$...$/array$ not replaced when missing $[#]$ tokens', function () {
  
  var s = ['$array$', '<li>$item$</li>', '$/array$'].join('');
  
  var data = { 
    array: [
      { item: 'one' },
      { item: 'two' }
    ]
  };
  
  var expected = ['$array$', '<li>$item$</li>', '$/array$'].join('');
  console.log(s.template(data));
  // console.log(expected);
  assert(s.template(data) === expected);
});

test('$array$ $[#]$ not replaced when missing $/array$ token', function () {
     
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


suite('mixed data examples');

test('processes mixed data map', function () {

// left-aligned to avoid all the whitespace comparisons...
function temp() {
/***
<p>$title$</p>
<p>$object.main.property$ for $object.main.name$</p>
<ul>
$items$
<li>$[#].name$, $[#].age$</li>
<li>$[#].address$</li>
$/items$
</ul>
<p>$title2$</p>
<ul>
$list$
<li>$[#]$</li>
$/list$
</ul>
***/
}
  
  var data = {
    title: 'mixed data test',
    object: { 
      main: {
        property: 'property value at $object.main.property$', 
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
    title2: 'list',
    list: [ 'foo', 'bar', 'baz', 'quux' ]
  };
  
  var expected = [
  '',
    '<p>mixed data test</p>',
    '<p>property value at $object.main.property$ for sarah winchester</p>',
    '<ul>',
    '',
    '<li>david, 28</li>',
    '<li>home</li>',
    '',
    '<li>divad, 82</li>',
    '<li>away</li>',
    '',
    '</ul>',
    '<p>list</p>',
    '<ul>',
      '',
      '<li>foo</li>',
      '',
      '<li>bar</li>',
      '',
      '<li>baz</li>',
      '',
      '<li>quux</li>',
      '',
    '</ul>',
    ''
  ].join('\n');

// console.warn( temp.template(data).split('\n') );
// console.warn( expected.split('\n') );

  assert(temp.template(data) === expected);
});

test('FIX ME ~ template results can be combined via data argument', function () {

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
  console.log(t);
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