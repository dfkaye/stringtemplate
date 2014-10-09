stringtemplate
==============

[ NOT STABLE ~ PROJECT UNDER DEVELOPMENT ~ DOCS ARE INACCURATE ~ 9 OCT 2014 ]

You may view a presentation about this project on rawgit at 
<a href="https://rawgit.com/dfkaye/stringtemplate/master/shower/index.html"
  target="_blank">
    https://rawgit.com/dfkaye/stringtemplate/master/shower/index.html</a>

## Logic-less Templates in JavaScript

`stringtemplate` adds a `template()` method to `String.prototype` and 
`Function.prototype` that act as a batch string#replace, using `$token$` 
placeholders for values/objects and `$objectOrArray$` and `$/objectOrArray$` 
tokens to demarcate iterable data with `$.$` for array indexes or `$.key$` 
for key-value data. 

[![Build Status](https://travis-ci.org/dfkaye/stringtemplate.png?branch=master)]
(https://travis-ci.org/dfkaye/stringtemplate)

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

[ IN PROGRESS - detail, examples, messages instead of errors ]

+ `String.prototype.template(data)`

  - originally inspired by @krasimir's 
      [js template engine in <del>20</del> 15 lines]
      (http://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line)
    and riot.js's 
      [render() method]
      (https://github.com/muut/riotjs/blob/master/lib/render.js)
    
  - $placeholder$ ~ use value found at data.placeholder
  - $path.name$ ~ use value found at data.path.name
  - $/path.name$ ~ marks the end of an iterable data ~ must have a matching 
      $path.name$ token
  - $[#]$ ~ inside an iteration, use object value at each index [0, 1, 2...]
  - $[#].key$ ~ inside an iteration, use value found at [index].name
  
+ `Function.prototype.template(data)`

  - originally inspired by @rjrodger's 
      [mstring](https://github.com/rjrodger/mstring)
  - returns `docstring` found by parsing contents between /*** and ***/ 
    delimiters in function body and concatenates rows of text with newline 
    character to preserve the docstring's vertical structure
  - returns empty string if no delimiters found
  - returns docstring.template(data) if `data` argument specified, 
  - otherwise returns the docstring unmodified.   
  - (add note on how to configure uglify to allow comment delimiters while 
      removing others)
  - removes line comments found within delimiters `// so you can annotate lines`

# Examples

[ still in progress 30 Sept 2014 ]

## values

    var s1 = [
      '<p>title: $title$</p>',
      '<p>long name: $person.fullname$</p>'
    ].join('');

    var d1 = {
      title: 'value test',
      person: {
        fullname: 'my very long name'
      }
    };

    var t1 = s1.template(d1);

    var expected = '<p>title: value test</p><p>long name: my very long name</p>';

    console.log(t1 === expected); // => true
    
## simple array

    var s2 = [
      '<ul>',
        '$[#]$',
        '<li>$[#]$</li>',
        '$/[#]$',
      '</ul>'
    ].join('');

    var d2 = ['foo', 'bar', 'baz', 'quux'];

    var t2 = s2.template(d2);

    var expected = '<ul><li>foo</li><li>bar</li><li>baz</li><li>quux</li></ul>';

    console.log(t2 === expected); // => true
    
## complex data 

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

    console.log(t === expected);  // => true
  
## combining template results

  [ todo ]
  
## more interesting examples

[ todo function#template ]

[ todo css generator ]

[ todo javascript generator ]

# License

[JSON License (Modified MIT)](./JSON.license)

# Tests

Tests are currently run with `mocha` using the `assert`, the `qunit` ui and the 
`spec` reporter.

## node

`npm test`
  
## testem

`npm run testem`

Browser tests run fine with `testem`, but mocha (on node) and testem do not play 
as well together on a Windows laptop (like mine).  YMMV.

## rawgit

<a href='https://rawgit.com/dfkaye/stringtemplate/master/test/mocha/browser-suite.html' 
   target='_blank'>run browser-suite</a> on rawgit (opens new tab|window)
