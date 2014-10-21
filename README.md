stringtemplate
==============

[![Build Status](https://travis-ci.org/dfkaye/stringtemplate.png?branch=master)]
(https://travis-ci.org/dfkaye/stringtemplate)

[ v0.0.11 ~ NOT STABLE ~ TOKEN SET and DOCS under revision ~ 21 OCT 2014 ]

You may view a slightly dated presentation about this project on rawgit at 
<a href='https://rawgit.com/dfkaye/stringtemplate/master/shower/index.html'
  target='_blank'>https://rawgit.com/dfkaye/stringtemplate/master/shower/index.html</a>.

You may read an ongoing update of the goals, pros, cons, and other details at 
<a href='https://gist.github.com/dfkaye/9bf102b56063fd9628fb'
  target='_blank'>https://gist.github.com/dfkaye/9bf102b56063fd9628fb</a>.
  
## Minimalist Logic-less Templates in JavaScript

`stringtemplate` is a strict separation or "logic-less" template module, that 
performs one function: the merge() operation between a document string with 
"holes" and data for filling this out. 

`stringtemplate` takes an "eval-less" approach, unlike most other template 
libraries, due to the arrival of 
[Content Security Policy]
(http://matthewrobertson.org/blog/2012/07/10/javascript-templates-and-chromes-content-security-policy/), 
a very serious restriction coming to our "modern" browsers that financial, 
medical, retailing and other security-sensitive entities will embrace 
increasingly over time. 

## API 

[ under review 21 OCT 2014 ]

`stringtemplate` adds a `template()` method to `String.prototype` and 
`Function.prototype` that act as a batch string#replace, using `$token$` 
placeholders for values/objects and `$#objectOrArray$` and `$/objectOrArray$` 
tokens to demarcate iterable data with `$.$` for array indexes or `$.key$` 
for key-value data. 

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

# Logic-less Templates

Terence Parr, [The ANTLR Guy](https://twitter.com/the_antlr_guy) argues that 
templates are documents with "holes" and should contain no business logic. 
Instead, it is up to us who use template engines to provide data that is already 
modeled properly.

> A template should merely represent a view of a data set and be totally 
> divorced from the underlying data computations whose results it will display.

Read Parr's full argument in his paper on 
[Enforcing Strict Model-View Separation in Template Engines]
(http://www.cs.usfca.edu/~parrt/papers/mvc.templates.pdf)

Parr has implemented this strict separation in his own 
[StringTemplate](http://www.stringtemplate.org/) project for java (with ports 
for C#, Python).


# stringtemplate ~ the JavaScript version

In *this* project, `stringtemplate` is a JavaScript shim that adds the following 
methods to native/built-in types:

[ NOT STABLE ~ TOKEN SET RE-DONE BUT STILL IN REVIEW ~ 18 OCT 2014 ]

+ `String.prototype.template(data)`

  - originally inspired by @krasimir's 
      [js template engine in <del>20</del> 15 lines]
      (http://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line)
    and riot.js's 
      [render() method]
      (https://github.com/muut/riotjs/blob/master/lib/render.js)
    
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
  
+ `Function.prototype.template(data)`

  - originally inspired by @rjrodger's 
      [mstring](https://github.com/rjrodger/mstring)
  - returns `docstring` found by parsing contents between /*** and ***/ 
    delimiters in function body and concatenates rows of text with newline 
    character to preserve the docstring's vertical structure
  - returns empty string if no delimiters found
  - returns docstring.template(data) if `data` argument specified, 
  - otherwise returns the docstring unmodified.   
  - removes line comments found within delimiters `// so you can annotate lines`
  - to deal with minifiers that remove block comments from source files, you can 
    use this [workaround for UglifyJS2]
    (http://dfkaye.github.io/2014/03/24/preserve-multiline-strings-with-uglify/) 
    to preserve the three-asterisk 
    delimiters

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
