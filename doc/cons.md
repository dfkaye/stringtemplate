## string templating cons

String templating is a batch string-replace operation.  Strict separation means 
doing that with no "logic" support whatsoever.  Some argue that that is really 
bad because it requires “data massaging” beforehand, claiming this a tedious 
step - see, for example, [The Case Against Logic-less Templates]
(http://www.ebaytechblog.com/2012/10/01/the-case-against-logic-less-templates/) 
and 
[The Cult of Logic-less templates]
(http://www.boronine.com/2012/09/07/Cult-Of-Logic-less-Templates/).

[@Rich_Harris](https://twitter.com/Rich_Harris), author of [Ractive.js]
(https://github.com/RactiveJS/Ractive),
on the other hand, warns more generally in [String Templating Considered 
Harmful](http://modernweb.com/2014/03/24/string-templating-considered-harmful/) 
that relying on "string" templates for re-rendering in the DOM is terribly 
inefficient.

Both objections are true.  Strict separation means more pre-conditioning of data 
before feeding it to a template.  Using a template to re-render the same HTML is 
twice-over inefficient *if you use it to redraw the same elements repeatedly*.

`stringtemplate` does not address the data massaging problem nor does it write 
to a DOM. Those are very different problems, both to each other, and to the 
batch-replace template operation. `stringtemplate` is concerned with only one 
step in a longer process, a *transformation pipeline*, so to speak. The other 
problems belong to something else to manage, such as a JSON transform method 
which would use parse() and stringify() internally, or a DocumentFragment 
handler that accepts the output of `stringtemplate` that produces a fragment 
then clones that and inserts it into the DOM.  Of course, things could get 
complicated, but those 2 ideas can be handled separately, and likely require far 
less than 100+kB of JavaScript in the browser (which is what big bang solutions 
tend to become).

