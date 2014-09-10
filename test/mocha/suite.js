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

test('replaces matched $placeholder$ data', function () {
  var s = '<p>$value$</p>';
  
  assert(s.template({ value: 'placeholder' }).toString() === '<p>placeholder</p>');
});

test('replaces un-matched $placeholder$ data with undefined', function () {
  var s = '<p>$value$</p>';
  
  assert(s.template({ wrongName: 'placeholder' }).toString() === '<p>undefined</p>');
});

test('replaces $nested.placeholder$ data', function () {
  var s = '<p>$nested.value$</p>';
  
  assert(s.template({ 
    nested: {
      value: 'placeholder' 
    }
  }).toString() === '<p>placeholder</p>');
});

test('returns item values in multiple rows when data argument is array using @.@ $name$ @/@', function () {
  var s = ['@.@', '<li>$name$</li>', '@/@'].join('\n');
  
  assert(s.template([
    { name: 'charlize' },
    { name: 'zora neale' }
  ]).toString() === ['<li>charlize</li>', '<li>zora neale</li>'].join('\n'));
});

test('returns index values in multiple rows when data argument is array using @.@ $.$ @/@', function () {
  var s = ['@.@', '<li>$.$</li>', '@/@'].join('\n');
  
  assert(s.template([
    33, false
  ]).toString() === ['<li>33</li>', '<li>false</li>'].join('\n'));
});

test('replaces nested array index values using @array@ $.$ @/@', function () {
  var s = ['@array@', '<li>$.$</li>', '@/@'].join('\n');
  
  assert(s.template({ 
    array: [ 'three', 'four', 'five' ]
  }).toString() === ['<li>three</li>', '<li>four</li>', '<li>five</li>'].join('\n'));
});

test('replaces nested array item keynames using @array@ $item$ @/@', function () {
  var s = ['@array@', '<li>$item$</li>', '@/@'].join('\n');
  
  assert(s.template({ 
    array: [
      { item: 'one' },
      { item: 'two' }
    ]
  }).toString() === ['<li>one</li>', '<li>two</li>'].join('\n'));
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



suite('function#template');

test('function#template is method', function () {
  assert(typeof (function(){}).template == 'function');
});

// test('function#template is method', function () {
  // assert(typeof (function(){}).template == 'function');
// });

// test('function#template is method', function () {
  // assert(typeof (function(){}).template == 'function');
// });

/*
  // simple
  var label = '<p>$label$</p>';
  label.template({ label: 'my addresses' }); // => <p>my addresses</p>

  // list
  var list = '<ul>$addresses$</ul>';
  var address = '<li>$street$</li><li>$city$, $state$</li>';

  var t = list.template({ 
    addresses: address.template([
      { street: '123 fourth street', city: 'cityburgh', state: 'aa' },
      { street: '567 eighth street', city: 'burgville', state: 'bb' },
      { street: '910 twelfth street', city: 'villetown', state: 'cc' }
    ])
  });
  console.log(t == '<ul><li>123 fourth street</li><li>cityburgh, aa</li>' + '\n' +
                    '<li>567 eighth street</li><li>burgville, bb</li>' + '\n' +
                    '<li>910 twelfth street</li><li>villetown, cc</li></ul>')

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


  template() accepts 
  
  + string 
  + object
  + array of strings or objects
  
  template() returns
  + ?monad? with a .toString() method that returns the finished string
  + string
*/