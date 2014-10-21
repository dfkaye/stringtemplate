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