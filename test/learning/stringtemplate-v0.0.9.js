// Sept  4-5, 2014 ~ aim at zero-recursion
// Sept  6 ~ still in progress but most array drilldown is done
// Sept  9 ~ cleaned up array v placeholder detection and drilldown
// Sept 16 ~ finally ~ looks like complex data mapping is solved...
// Sept 18 ~ get out of iterating by rows of strings
// Sept 20 ~ ugh ~ new version started
// Sept 23 ~ nested array case solved 23 SEPT 2014 12:04 - 12:20 PM PDT
// Sept 24 ~ some renaming and comments
// Sept 25 ~ intro some functional programming
// Sept 26 ~ remove functional; use reverse-while on end tags w/content aliasing
// Sept 27 ~ nested object-array tests working
// Sept 29 ~ arrays and nested arrays working
// Sept 30 ~ fixed array of objects with nested arrays
// Oct 6-7 ~ changed token syntax & started over
// Oct 9   ~ SUCCESS ~ ALL TESTS REFACTORED AND PASSING (call it version 8)

/*
 * stringtemplate
 *
 * David F. Kaye (@dfkaye)
 *
 * JSON License (Modified MIT)
 *
 * String.prototype.template(data)
 * + inspired by Terence Parr (StringTemplate) and Krasimir Tsonev (AbsurdJS)
 * + replaces doc-string tokens with corresponding data values, using simplest 
 *    token set and syntax as possible (that I could get away with).
 *
 * Function.prototype.template(data)
 * + inspired by @rjrodger's [mstring](https://github.com/rjrodger/mstring)
 * + an additional method for docstrings, returns a `docstring` found by parsing 
 *    contents between /*** and ***\/ delimiters in afunction body
 *
 * The data argument to each method may be either an Object or an Array.  
 * Empty arguments and primitives are ignored.
 *
 * Goals of this project
 * + standalone functions
 * + no dependencies 
 * + no modules or class-like utility bags
 * + no ES5 functional programming
 * + no internal use of Function() constructor (due to content security policy)
 * + no formatting
 * + no default substitution or suppression of empty values
 * + no if/else logic or branching directives in template strings
 * + no error throwing
 * + no recursion ~ until nested arrays of arrays
 * + no parse trees ~ objected oriented programming was made for this 
 *
 * Rolling it by hand with a limited token set and one method means
 * + looping hell
 * + regex hell ~ test them online with http://www.cuneytyilmaz.com/prog/jrx/ 
 * + substring hell ~ http://davidwalsh.name/string-replace-javascript
 */

typeof String.prototype.template == 'function' || 
(String.prototype.template = function template(data, fn) {

  var source = this.toString();
  var tokens = source.match(/\$\.?[^\/^\$^\s]+\$/g);
  
  var handleError = typeof fn == 'function' && fn || 
  (handleError = function (msg) {
    !console || (console.log(msg));
  });
  
  var msg = '';
  
  // fail fast, return early
  
  data && typeof data =='object' || (msg += ': data must be an object');
  tokens || (msg += ': no tokens in source string');
  fn || typeof fn == 'function' && (msg += ': fn must be a function');
  
  if (msg.length > 0) {
    handleError('template not transformed' + msg);
    return source;
  }
  
  msg = 'transformation halted';
  
  //
  
  function replaceValue(source, data, token) {
  
    console.log('replaceValue for ' + token);
   
    var name = token.replace(/\$\./, '').replace(/\$/g, '');
    var path = name.split('.');
    var p = 0;
    var context = data;
    var reValueToken;
    
    while (context && p < path.length) {
      context = context[path[p++]];
    }
    
    !context || (
      reValueToken = RegExp(token.replace(/\$/g, '\\$'), 'gm'),
      source = source.replace(reValueToken, context)
    );
    
    return source;
  }
  
  //
  
  function replaceCollection(source, context, token) {
    
    console.log('replaceCollection');

    var contents = [];

    for (var k in context) {
      contents.push(source.toString().replace(token, context[k]));
    }
    
    return contents.join('') || source;
  }
  
  //
  
  function replaceCollectionKeys(source, context, tokens) {
  
    console.log('replaceCollectionKeys');

    var contents = [];
    var keys = {};
    var content, item, key;
    
    for (var k in context) {
    
      item = context[k];
      content = source.toString();
      
      for (var i = 0; i < tokens.length; ++i) {
        key = tokens[i].replace(/[\$\.]/g, '');
        content = content.replace(tokens[i], context[k][key])
      }
      
      contents.push(content);
    }
    
    return contents.join('');
  }
  
  // LARGE METHOD
  
  function handleBlock(source, data, token) {
    
    console.log('handleBlock for ' + token);

    var context = data;
    var name = token.replace(/[\$\.\#]/g, '');

    // set default context here, resolve it down below if we're in an array    
    !name || (context = context[name]);
    
    var endToken = token.replace('$', '$/');
    var text = source.substring(source.indexOf(token));
    var tokens = text.match(/\$\.?[^\$^\s]+\#\$/g);
    
    // handle empty token set - due to bad markup most likely
    
    if (!tokens) {
      handleError(msg + ': no content tokens found in ' + token);
      return source;
    }
    
    var depth = 0;
    var start = 0;
    var end = 0;
    var st, tag, body, content, bodyTokens;

    for (var i = 0; i < tokens.length; ++i) {
      
      if (/\$\/[^\$^\/^\s]+\#\$/.test(tokens[i])) {
        
        depth -= 1;
        
        if (endToken == '$/.#$' || !end) {
          end = text.indexOf(endToken, end + 1);
        }
        
      } else if (/\$[^\$^\/^\s]+\#\$/.test(tokens[i])) {
      
        depth += 1;
        start || (start = token.length);
      }

      if (depth === 0 && start > 0 && end > 0) {
      
        // resolve tag
        // start, end, text
        
        tag = text.substring(0, end + endToken.length);
        body = tag.substring(start, end);
        content = body.toString();
        bodyTokens = body.match(/\$\.([^\$^\s]+)?\$/g);
        
        // tag, body, content, bodyTokens, context, source
        
        if (/\#\$/.test(body)) {
        
          console.log(name + ' is nested');

          st = /\$\.?[^\$^\s]+\$/.exec(body)[0];

          if (bodyTokens[0] === '$.#$') {
          
            console.log('handle nested array block');
            console.warn(st === bodyTokens[0]);
            
            var contents = [];
            
            for (var k in context) {
              contents.push(handleBlock(body, context[k], bodyTokens[0]));
            }
            
            content = contents.join('');
            
          } else {    

            console.log('handle nested object block');

            var contents = [];
            
            if ({}.toString.call(context) == '[object Array]') {
            
              for (var k in context) {
                contents.push(handleBlock(body, context[k], st));
              }
              
              content = contents.join('');

            } else {
            
              content = handleBlock(body, context, st);
            }
          }
          
          if (content !== body) {
            source = source.replace(tag, content);
          }
          
        } else {

          console.log('replace values');

          if ({}.toString.call(context) == '[object Array]') {
          
            console.log('replace array values');
           
            if (bodyTokens[0] == '$.$') {

              content = replaceCollection(content, context, bodyTokens[0]);

            } else {
              
              content = replaceCollectionKeys(content, context, bodyTokens);
            }
          
            if (content !== body) {
              source = source.replace(tag, content);
            }

          } else {

            console.log('*** handle object as map ***');

            if (bodyTokens[0] == '$.$') {
            
              content = replaceCollection(content, context, bodyTokens[0]);
              
            } else {
            
              // replace each value in the content string
              
              for (var j = 0; j < bodyTokens.length; ++j) {
              
                content = replaceValue(content, context, bodyTokens[j]);
              }
            }
            
            if (content !== body) {
              source = content;
            }
          }
        }

        break;
      }
    }

    return source;
  }
  
  // handle all tokens

  return (function processTokens(source, data, tokens) {

    var token, name;
    
    // replace inline tokens first
    
    if (tokens) {
      for (var i = 0; i < tokens.length; ++i) {
        
        token = tokens[i];

        if (token != '$.$' && ~source.indexOf(token)) { // alternation fix/found
          if (!~source.indexOf(token.replace('$', '$/'))) { // not found
            source = replaceValue(source, data, token);
          }
        }
      }
    }
    
    // handle content tokens
    
    tokens = source.match(/\$[^\/^\$^\s]+\$/g); 
    
    if (tokens) {      
      for (var i = 0; i < tokens.length; ++i) {
      
        token = tokens[i];
        name = token.replace(/[\$\#]/g, '');

        if (data[name] || token == '$.#$') { // alternation fix
          /*
           * check index again because source is the state and is potentially 
           * modified on each token iteration
           */
          if (~source.indexOf(token)) { // found
              source = handleBlock(source, data, token);
          }          
        }
      }
    }
    
    return source;
    
  }(source, data, tokens));
});

////////////////////////////////////////////////////////////////////////////////

/*
 * function#template
 * heredoc/multiline string polyfill 
 * originally inspired by @rjrodger's mstring project
 * requires string#template
 */
typeof Function.prototype.template == 'function' ||
(Function.prototype.template = function template(data) {

  var fs = String(this);
  
  // splitting logic taken from where.js
  var fnBody = fs.replace(/\s*function[^\(]*[\(][^\)]*[\)][^\{]*{/,'')
                 .replace(/[\}]$/, '');
  var table = fnBody.match(/\/(\*){3,3}[^\*]+(\*){3,3}\//);
  var rows = (table && table[0] || fnBody)
              .replace(/\/\/[^\n]*/g, '') // remove line comments...
              .replace(/(\/\*+)*[\r]*(\*+\/)*/g, '') // ...block comments
              .split('\n'); // and split by newline
              
  var r = [];
  
  for (var i = 0; i < rows.length; i++) {
    r.push( rows[i] );
  }

  // windows vs. linux issue ~ travis borks if \\r not removed
  r = r.join('\n').replace(/\\r/g, '');

  return (data && typeof data == 'object') ? r.template(data) : r;
});
