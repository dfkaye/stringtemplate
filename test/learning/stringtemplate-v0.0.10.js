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
// Oct 9   ~ SUCCESS ~ all tests refactored and passing (call it version 8)
// Oct 14-17 ~ changed collection tokens (.# => #.) & support #name.spaced.path

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
 * + no recursion ~ until we got to supporting nested arrays of arrays
 * + no parse trees ~ objected oriented programming was made for this 
 *
 * Rolling it by hand with a limited token set and one method means
 * + looping hell, regex hell (brittle), and substring hell
 * + test regex online with http://www.cuneytyilmaz.com/prog/jrx/ 
 * + substring() mainly, plus http://davidwalsh.name/string-replace-javascript
 */

typeof String.prototype.template == 'function' || 
(String.prototype.template = function template(data) {

  var source = this.toString();
  var tokens = source.match(/\$\.?[^\/^\$^\s]+\$/g);
  
  // 

  function handleMessage(messages) {
    !console || ((console['warn'] || console['log'])('** stringtemplate: ' + 
                                                     messages.join(': ')));
  };
  
  // TODO ~ CLEAN UP
  // fail fast, return early
  
  var messages = ['error'];
  data && typeof data == 'object' || (messages.push('data must be an object'));
  tokens || (messages.push('no tokens in source string'));
  
  if (messages.length > 1) {  
    handleMessage(messages);
    return source;
  }
     
  //
  
  function replaceValue(source, context, token) {
  
    // console.log('replaceValue for ' + token);
    
    var name = token.replace(/\$\#?\.?/, '').replace(/\$/g, '');
    var path = name.split('.');
    var length = path.length;
    var p = 0;
    
    while (context && p < length) {   
      context = context[path[p++]];      
    }
    
    var reValueToken;

    // TODO ~ handleMessage() for no context
    
    // !! ignores empty string, null, undefined, 0, false
    
    !context || (
      reValueToken = RegExp(token.replace(/\$/g, '\\$'), 'gm'),
      source = source.replace(reValueToken, context)
    );
    
    return source;
  }
  
  //
  
  function replaceCollection(source, context, token) {
    
    // console.log('replaceCollection');

    var contents = [];

    for (var k in context) {
    
      contents.push(source.toString().replace(token, context[k]));
    }
    
    // TODO ~ handleMessage() for no transform on token

    return contents.join('') || source;
  }
  
  //
  
  function replaceCollectionKeys(source, context, tokens) {
  
    // console.log('replaceCollectionKeys');

    var contents = [];
    var keys = {};
    var content, key;
    
    for (var k in context) {
    
      content = source.toString();
      
      for (var i = 0; i < tokens.length; ++i) {
      
        key = tokens[i].replace(/[\$\.]/g, '');
        content = content.replace(tokens[i], context[k][key])
      }
      
      contents.push(content);
    }

    // TODO ~ handleMessage() for no transform on token
    
    return contents.join('');
  }
  
  // 

  function resolveTagBody(source, context, tag, body) {

    // console.log('resolveTagBody');

    var content = body.toString();
    var bodyTokens = body.match(/\$\.[^\$^\s]*\$/g);    
    var contents = [];
    var firstToken;    
    
    if (/\$\#/.test(body)) {

      firstToken = /\$\#?\.?[^\$^\s]+\$/.exec(body)[0];

      // console.warn('firstToken: ' + firstToken);
      
      if (firstToken === '$#.$') {
      
        // console.log('handle nested array block');       
        
        for (var k in context) {
        
          contents.push(handleBlock(body, context[k], firstToken));
        }
        
        content = contents.join('');
        
      } else {    

        // console.log('handle nested object block');
        
        if ({}.toString.call(context) == '[object Array]') {

          for (var k in context) {
          
            contents.push(handleBlock(body, context[k], firstToken));
          }
          
          content = contents.join('');

        } else {

          content = handleBlock(body, context, firstToken);
        }
      }
      
      // TODO ~ handleMessage() for no transform on firstToken

      if (content !== body) {
      
        source = source.replace(tag, content);
      }
      
    } else {

      // console.log('replace values');

      firstToken = bodyTokens[0];
      
      if (firstToken == '$.$') {
      
        content = replaceCollection(content, context, firstToken);

      } else {
      
        if ({}.toString.call(context) == '[object Array]') {

          content = replaceCollectionKeys(content, context, bodyTokens);

        } else {
        
          for (var i = 0; i < bodyTokens.length; ++i) {
          
            content = replaceValue(content, context, bodyTokens[i]);
          }
        }
      }

      // TODO ~ handleMessage() for no transform on firstToken
      
      if (content !== body) {
      
        if ({}.toString.call(context) == '[object Array]') {
        
          source = source.replace(tag, content);
          
        } else {
        
          source = content;
        }
      }
    }
    
    return source;
  }
  
  //
  
  function handleBlock(source, data, token) {
    
    // console.log('handleBlock for ' + token);

    var block = source.substring(source.indexOf(token));
    var tokens = block.match(/\$\#?\.?[^\$^\s]+\$/g);    
    var bodyTokens = block.match(/\$\.[^\$^\s]*\$/g);

    // handle empty token set - due to bad markup most likely
    
    if (!tokens || !bodyTokens) {
      handleMessage(['halted', 'no content tokens found in ' + block]);
      return source;
    }
    
    var endToken = token.replace('#', '/');    
    var depth = 0;
    var start = 0;
    var end = 0;
    var tag, body, name, context;
    
    for (var i = 0; i < tokens.length; ++i) {
      
      if (/\$\/[^\$^\/^\s]+\$/.test(tokens[i])) {
        
        depth -= 1;
        
        if (endToken == '$/.$' || !end) {
        
          end = block.indexOf(endToken, end + 1);
        }
        
      } else if (/\$\#[^\$^\/^\s]+\$/.test(tokens[i])) {
      
        depth += 1;
        start || (start = token.length);
      }

      if (depth === 0 && start > 0 && end > 0) {
      
        tag = block.substring(0, end + endToken.length);
        body = tag.substring(start, end);

        if (token.match(/\$\#[^\.]+\.[^\.]+/)) {

          name = token.replace(/\$|\#/g, '').split('.').pop();
          
        } else {

          name = token.replace(/[\$\.\#]/g, '');
        }
        
        context = (name && data[name]) || data;
        source = resolveTagBody(source, context, tag, body);
        
        break;
      }
    }

    return source;
  }
  
  // handle all tokens

  return (function processTokens(source, data, tokens) {
  
    /*
     * check index for each token because source is the state and (potentially) 
     * modified on each iteration
     */
     
    var token, context, name, path, length, p;

    // replace inline tokens first
    
    for (var i = 0; i < tokens.length; ++i) {
      
      token = tokens[i];

      if (!token.match(/\$(\.|\#)/) && ~source.indexOf(token)) {
          
        source = replaceValue(source, data, token);
      }
    }
    
    if (tokens = source.match(/\$\#[^\$^\s]+\$/g)) {// assignment!
    
      // handle collection tokens

      for (var i = 0; i < tokens.length; ++i) {
      
        token = tokens[i];
        name = token.replace(/\$|\#/g, '');
        context = data;

        if (token.match(/\$\#[^\.]+\.[^\.]+/)) {
          
          // resolve to 'spaced' node in name.spaced.path
          
          name = token.replace(/\$|\#/g, '').split('.').pop();
          path = token.replace(/\$\#?\.?/, '').replace(/\$/g, '').split('.');
          length = path.length - 1;
          p = 0;
          
          while (context && p < length) {
            context = context[path[p++]];        
          }
        }

        if (!!context[name] || ~source.indexOf(token.replace('#', '/')) && 
            ~source.indexOf(token) && token.match(/\$\#\.?[^\$^\s]?\$/)) {

          source = handleBlock(source, context, token);
        }
      }
    }
    
    return source;
    
  }(source, data, tokens));
});

////////////////////////////////////////////////////////////////////////////////

// TODO ~ REVISIT THE REGEX BELOW 

/*
 * function#template
 * heredoc/multiline string polyfill 
 * originally inspired by @rjrodger's mstring project
 * requires string#template
 */
typeof Function.prototype.template == 'function' ||
(Function.prototype.template = function template(data) {

  // splitting logic taken from where.js

  var fs = this.toString();
  var fnBody = fs.replace(/\s*function[^\(]*[\(][^\)]*[\)][^\{]*{/,'')
                 .replace(/[\}]$/, '');
  var table = fnBody.match(/\/(\*){3,3}[^\*]+(\*){3,3}\//);
  var rows = (table && table[0] || fnBody)
              .replace(/\/\/[^\n]*/g, '') // remove line comments...
              .replace(/(\/\*+)*[\r]*(\*+\/)*/g, '') // ...block comments
              .split('\n'); // and split by newline
  var length = rows.length;
  var r = [];
  var s;
  
  for (var i = 0; i < length; i++) {
  
    r.push( rows[i] );
  }

  // windows vs. linux issue ~ travis borks if \\r not removed
  s = r.join('\n').replace(/\\r/g, '');

  return (data && typeof data == 'object') ? s.template(data) : s;
});
