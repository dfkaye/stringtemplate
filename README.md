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

+ `String.prototype.template(data)`

[ todo - detail, examples, messages instead of errors ]

+ `Function.prototype.template(data)`

[ todo - detail, examples ]

# Examples

[ todo - detail, examples ]

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
