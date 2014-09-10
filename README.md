stringtemplate
==============

adds template() method to String.prototype and Function.prototype

[![Build Status](https://travis-ci.org/dfkaye/stringtemplate.png?branch=master)](https://travis-ci.org/dfkaye/stringtemplate)

# Logic-less Templates in JavaScript

Terence Parr, [The ANTLR Guy](https://twitter.com/the_antlr_guy) argues that 
templates are documents with holes and should contain no business logic.  Rather 
it is up to us who use template engines to provide data that is already modeled 
properly.

Read Parr's full argument in his paper on 
[Enforcing Strict Model-View Separation in Template Engines]
(http://www.cs.usfca.edu/~parrt/papers/mvc.templates.pdf)

# stringtemplate JavaScript

Parr implements this strict separation in his own 
[StringTemplate](http://www.stringtemplate.org/) project.

In *this* project, stringtemplate is a JavaScript shim that adds the following 
methods to native/built-in types:

+ `String.prototype.template(data)`

[ todo - detail, examples ]

+ `Function.prototype.template(data)`

[ todo - detail, examples ]


# tests

## node

`npm test`
  
## testem

`npm run testem`

## rawgithub

<a href='https://rawgit.com/dfkaye/stringtemplate/master/test/mocha/browser-suite.html' 
   target='_blank'>run browser-suite</a> on rawgithub (opens new tab|window)
   
 