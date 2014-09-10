// mocha/suite.js

var assert = assert;

if (typeof require == 'function') {
  require('../../../stringtemplate');
  assert = require('assert');
}

/* TESTS START HERE */

suite('string#template');

test('is method', function () {
  assert(typeof ''.template == 'function');
});

test('returns same when argument is not an object', function () {
  var s = '';
  
  assert(s.template().toString() === s.toString());
  assert(s.template(1).toString() === s.toString());
  assert(s.template(true).toString() === s.toString());
});

test('returns same when argument is an empty object or array', function () {
  var s = '';
  
  assert(s.template(null).toString() === s.toString());
  assert(s.template({}).toString() === s.toString());
  assert(s.template([]).toString() === s.toString());  
});

test('trims whitespace only when both $placeholder$ and data specified', function () {
  var s = ' $space$ ';

  assert(s.template({ space: 'trimmed'}).toString() === 'trimmed');
});

test('trims whitespace in multiline strings', function () {
  var s = [' $space$ ', 'nospace', ' space '].join('\n');

  assert(s.template({ 
    space: 'trimmed'
  }).toString() === ['trimmed', 'nospace', 'space'].join('\n'));
});
  
  
suite('$placeholders$');

test('replaces matched $placeholder$ data', function () {
  var s = '<p>$value$</p>';
  
  assert(s.template({ value: 'placeholder' }).toString() === '<p>placeholder</p>');
});

test('replaces un-matched $placeholder$ data with undefined', function () {
  var s = '<p>$value$</p>';
  
  assert(s.template({ wrongName: 'placeholder' }).toString() === '<p>undefined</p>');
});

test('$ chars inside $placeholder$ data are preserved', function () {
  var s = '<p>$dollar$</p>';
  
  assert(s.template({ dollar: '$1.00' }).toString() === '<p>$1.00</p>');
});

test('replaces $nested.placeholder$ data', function () {
  var s = '<p>$nested.value$</p>';
  
  assert(s.template({ 
    nested: {
      value: 'placeholder' 
    }
  }).toString() === '<p>placeholder</p>');
});


suite('@array@, @.@, $arrayItem$, $.$, and @/@');

test('returns index values in multiple rows when data argument is array using @.@ $.$ @/@', function () {
  var s = ['@.@', '<li>$.$</li>', '@/@'].join('\n');
  
  assert(s.template([
    33, false
  ]).toString() === ['<li>33</li>', '<li>false</li>'].join('\n'));
});

test('returns item values in multiple rows when data argument is array using @.@ $name$ @/@', function () {
  var s = ['@.@', '<li>$name$</li>', '@/@'].join('\n');
  
  assert(s.template([
    { name: 'charlize' },
    { name: 'zora neale' }
  ]).toString() === ['<li>charlize</li>', '<li>zora neale</li>'].join('\n'));
});

test('replaces nested array index values using @array@ $.$ @/@', function () {
  var s = ['@array@', '<li>$.$</li>', '@/@'].join('\n');
  
  assert(s.template({ 
    array: [ 'three', 'four', 'five' ]
  }).toString() === ['<li>three</li>', '<li>four</li>', '<li>five</li>'].join('\n'));
});

test('replaces nested array item values using @array@ $item$ @/@', function () {
  var s = ['@array@', '<li>$item$</li>', '@/@'].join('\n');
  
  assert(s.template({ 
    array: [
      { item: 'one' },
      { item: 'two' }
    ]
  }).toString() === ['<li>one</li>', '<li>two</li>'].join('\n'));
});

test('groups multi-row data by array index', function () {

  // list
  var list = ['<ul>', '@addresses@', '<li>$street$</li>', '<li>$city$, $state$</li>', '@/@', '</ul>'].join('\n');

  var t = list.template({ 
    addresses: [
      { street: '123 fourth street', city: 'cityburgh', state: 'aa' },
      { street: '567 eighth street', city: 'burgville', state: 'bb' },
      { street: '910 twelfth street', city: 'villetown', state: 'cc' }
    ]
  });

  assert(t === [
    '<ul>',
    '<li>123 fourth street</li>',
    '<li>cityburgh, aa</li>',
    '<li>567 eighth street</li>',
    '<li>burgville, bb</li>',
    '<li>910 twelfth street</li>',
    '<li>villetown, cc</li>',
    '</ul>'
  ].join('\n'));
});

test('template results can be combined via data argument', function () {

  // list
  var list = ['<ul>', '$addresses$', '</ul>'].join('\n');
  var address = ['@.@', '<li>$street$</li>', '<li>$city$, $state$</li>', '@/@'].join('\n');

  var t = list.template({
    addresses: address.template([
      { street: '123 fourth street', city: 'cityburgh', state: 'aa' },
      { street: '567 eighth street', city: 'burgville', state: 'bb' },
      { street: '910 twelfth street', city: 'villetown', state: 'cc' }
    ])
  });

  assert(t === [
    '<ul>',
    '<li>123 fourth street</li>',
    '<li>cityburgh, aa</li>',
    '<li>567 eighth street</li>',
    '<li>burgville, bb</li>',
    '<li>910 twelfth street</li>',
    '<li>villetown, cc</li>',
    '</ul>'
  ].join('\n'));
});

test('@array@ returns empty string when template does not contain newline \\n chars', function () {
  var s = ['@array@', '<li>$item$</li>', '@/@'].join();
  
  assert(s.template({ 
    array: [
      { item: 'one' },
      { item: 'two' }
    ]
  }).toString() === '');
});

test('@array@ returns error Message (does not throw) when template does not contain closing @/@ tag', function () {
  var s = ['@missingEndTag@', '<li>$item$</li>'].join('\n');
  
  assert(s.template({ 
    missingEndTag: [
      { item: 'one' },
      { item: 'two' }
    ]
  }).toString() == 'Error: closing @/@ tag for @missingEndTag@ array not found');
});

test('nested @array@ directives are not supported', function () {
  var s = ['@array@', '@nested@', ' + $.$', '@/@', '@/@'].join('\n');
  
  assert(s.template({ 
    array: [
      { nested: [1,2,3] }
    ]
  }).toString() == ['@nested@', '+ [object Object]', '@/@'].join('\n'));
});


suite('function#template');

test('is method', function () {
  assert(typeof (function(){}).template == 'function');
});

test('returns an empty string when function contains no /*** and ***/ delimiters', function () {
  function temp() {}
  
  assert(temp.template() === '');
});

test('returns trimmed docstring between /*** and ***/ delimiters', function () {
  function temp() {
  /***
  Hello.
    I am a docstring,
    inside a function.  
  ***/
  }
  
  assert(temp.template() === ['Hello.', 'I am a docstring,', 'inside a function.'].join('\n'));
});

test('removes blank lines from  /*** docstring ***/', function () {
  function temp() {
  /***
  first

  second
  
  third
  ***/
  }

  assert(temp.template() === ['first', 'second', 'third'].join('\n') );
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

test('processes complex data', function () {
  function temp() {
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
  
  var data = {
    title: 'complex data test',
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
  
  var expected = ['<p>complex data test</p>',
    '<p>this is a property value at $object.main.property$, name: sarah winchester</p>',
    '<ul>',
    '<li>david, 28</li>',
    '<li>home</li>',
    '<li>divad, 82</li>',
    '<li>away</li>',
    '</ul>',
    '<p>',
    'some',
    'more',
    '</p>',
    '<ul>',
    '<li>a</li>',
    '<li>b</li>',
    '<li>c</li>',
    '</ul>'].join('\n');
  
  assert(temp.template(data) === expected);
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