stringtemplate
==============

[![Build Status](https://travis-ci.org/dfkaye/stringtemplate.png?branch=master)]
(https://travis-ci.org/dfkaye/stringtemplate)

[ v0.0.11 ~ NOT STABLE ~ TOKENS &amp; DOCS UNDER REVIEW ~ 21 OCT 2014 ]

You may view a slightly dated presentation about this project on rawgit at 
<a href='https://rawgit.com/dfkaye/stringtemplate/master/shower/index.html'
  target='_blank'>https://rawgit.com/dfkaye/stringtemplate/master/shower/index.html</a>.

## Minimalist Logic-less Templates in JavaScript

`stringtemplate` is a strict separation or "logic-less" template module, that 
performs the "merge" operation between a document string with "holes" and data 
for filling this out. 

`stringtemplate` takes an "eval-less" approach, due to the arrival of 
[Content Security Policy]
(http://matthewrobertson.org/blog/2012/07/10/javascript-templates-and-chromes-content-security-policy/), 
a very serious restriction coming to our "modern" browsers that financial, 
medical, retailing and other security-sensitive entities will embrace 
increasingly over time.

`stringtemplate` supports no formatting or escaping characters, case logic, 
quiet references, fallbacks for unexpected values, helpers, includes or 
inheritance. The focus is on "simple" transformations

For more on strict separation, see

+ [background](./doc/parr.md)
+ [objections](./doc/cons.md)

## API 

`stringtemplate` adds a `template()` method to `String.prototype` and 
`Function.prototype` that act as a batch string#replace, using `$token$` 
placeholders for values/objects and `$#objectOrArray$` and `$/objectOrArray$` 
tokens to demarcate iterable data with `$.$` for array indexes or `$.key$` 
for key-value data. 

+ `String.prototype.template(data)` accepts a (required) data object or array. 
The string body on which this method is invoked should contain at least one 
token. If no tokens are found, or the data param specified is not an object or 
an array, the original string is returned without modification. Here's the token 
set that this method looks for:

  - $placeholder$ ~ use value found at data.placeholder
  - $path.name$ ~ use value found at data.path.name
  - $#path.name$ ~ marks the start of an iteration ~ must have a matching end 
      token, $/path.name$
  - $/path.name$ ~ marks the end of an iteration ~ must have a matching start
      $#path.name$ token
  - $.$ ~ inside an iteration, use object value at each index [0, 1, 2...]
  - $.key$ ~ inside an iteration, use value found at [index].name
  - $#.$ ~ start of a collection inside an iteration
  - $/.$ ~ end of a collection inside an iteration
  - $#.key$ ~ key-value collection inside an iteration  
  - $/.key$ ~ end key-value collection inside an iteration

+ `Function.prototype.template(data)` - originally inspired by @rjrodger's 
[mstring](https://github.com/rjrodger/mstring), this method deals with the lack 
of multi-line docstring (aka heredoc or quasi-literal) support in JavaScript.

  - returns `docstring` found by parsing contents between /*** and ***/ 
    delimiters in function body and concatenates rows of text with newline 
    character to preserve the docstring's vertical structure
  - returns an empty string if no delimiters found
  - accepts an optional data argument: 
    + if `data` is an object or an array, this method returns the result of 
      `docstring.template(data)`;
    + otherwise, returns the docstring unmodified.   
  - removes line comments found within delimiters `// so you can annotate lines`

NB: to get past minifiers that remove block comments from source files, you can 
use this [workaround for UglifyJS2]
(http://dfkaye.github.io/2014/03/24/preserve-multiline-strings-with-uglify/) 
to preserve the three-asterisk delimiters.

# Examples

[ STILL IN PROGRESS ~ 18 OCT 2014 ]

## values

    var s = [
      '<p>title: $title$</p>',
      '<p>long name: $person.fullname$</p>'
    ].join('');

    var d = {
      title: 'value test',
      person: {
        fullname: 'my longer name'
      }
    };

    var t = s.template(d);

    var expected = '<p>title: value test</p><p>long name: my longer name</p>';

    console.log(t === expected); // => true
    
## simple array

    var s2 = [
      '<ul>',
        '$#.$',
        '<li>$.$</li>',
        '$/.$',
      '</ul>'
    ].join('');

    var d2 = ['foo', 'bar', 'baz', 'quux'];

    var t2 = s2.template(d2);

    var expected = '<ul><li>foo</li><li>bar</li><li>baz</li><li>quux</li></ul>';

    console.log(t2 === expected); // => true
    
## complex data 

    var list = [
      '<ul>', 
      '$#addresses$', 
      '<li>$.street$</li>', 
      '<li>$.city$, $.state$</li>', 
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

    console.log(t === expected);  // => true
  
## combining template results

  [ TODO ]
  
## more interesting examples

  [ TODO function#template ]

  [ TODO css generator ]

  [ TODO html generator ]

# License

[JSON License (Modified MIT)](./JSON.license)

# Tests

Tests are currently run with `mocha` using the `assert` module, the `qunit` ui 
and the `spec` reporter.

## node

`npm test`
  
## testem

`npm run testem`

Browser tests run fine with `testem`, but mocha (on node) and testem do not play 
as well together on a Windows laptop (like mine).  YMMV.

## rawgit

<a href='https://rawgit.com/dfkaye/stringtemplate/master/test/mocha/browser-suite.html' 
   target='_blank'>run browser-suite</a> on rawgit (opens new tab|window)
