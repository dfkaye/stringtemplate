stringtemplate
==============

A batch string#replace, using `$token$` placeholders for values/objects and 
`@arrayName@` + `@/@` tokens for indexed data (arrays). `stringtemplate` adds a 
`template()` method to `String.prototype` and `Function.prototype`.

[![Build Status](https://travis-ci.org/dfkaye/stringtemplate.png?branch=master)](https://travis-ci.org/dfkaye/stringtemplate)

# Logic-less Templates in JavaScript

Terence Parr, [The ANTLR Guy](https://twitter.com/the_antlr_guy) argues that 
templates are documents with "holes" and should contain no business logic; rather 
it is up to us who use template engines to provide data that is already modeled 
properly.

> A template should merely represent a view of a data set and be totally divorced 
> from the underlying data computations whose results it will display.

Read Parr's full argument in his paper on 
[Enforcing Strict Model-View Separation in Template Engines]
(http://www.cs.usfca.edu/~parrt/papers/mvc.templates.pdf)

Parr has implemented this strict separation in his own 
[StringTemplate](http://www.stringtemplate.org/) project.

# stringtemplate ~ the JavaScript version

In *this* project, `stringtemplate` is a JavaScript shim that adds the following 
methods to native/built-in types:

[ IN PROGRESS - detail, examples, messages instead of errors ]

+ `String.prototype.template(data)`

  - originally inspired by @krasimir's 
    [js template engine in <del>20</del> 15 lines]
    (http://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line)
    and riot.js's [render() method]
    (https://github.com/muut/riotjs/blob/master/lib/render.js)
    
  - $placeholder$ ~ use value found at data.placeholder
  - $path.name$ ~ use value found at data.path.name
  - @path.name@ ~ indicates start of array found at data.path.name
  - @/@ ~ marks end of array scope in template
  - $.$ ~ inside an array iteration, use object value at each index [0, 1, 2...]
  - $name$ ~ inside an array iteration, use value found at array[index].name
  - @.@ ~ use when the `data` param is an array, not just an object
  - one known error case (missing @/@ during array iteration: returns a message,
    rather than throwing an error)
  
+ `Function.prototype.template(data)`

  - originally inspired by @rjrodger's [mstring](https://github.com/rjrodger/mstring)
  - returns `docstring` found by parsing contents between /*** and ***/ 
    delimiters in function body and concatenates rows of text with newline 
    character to preserve the docstring's vertical structure ~ left and right 
    whitespace on each row is trimmed
  - returns empty string if no delimiters found
  - returns docstring.template(data) if `data` argument specified, 
  - otherwise returns the docstring unmodified.   
  - (add note on how to configure uglify to allow comment delimiters while 
      removing others)
  - removes line comments found within delimiters // so you can annotate lines

# Examples

[ todo simple ]
[ todo array ]
[ todo complex data ]
[ todo combining template results ]
[ todo css generator ]
[ todo javascript generator ]

# License

[JSON License (Modified MIT)](./JSON.license)

# Tests

Tests are currently run with `mocha` using the 'qunit' ui and 'spec' reporter.

## node

`npm test`
  
## testem

`npm run testem`

Browser tests run fine with `testem`, but mocha (node) and testem do not play as 
well together on a Windows laptop (like mine).  YMMV.

## rawgithub

<a href='https://rawgit.com/dfkaye/stringtemplate/master/test/mocha/browser-suite.html' 
   target='_blank'>run browser-suite</a> on rawgithub (opens new tab|window)
