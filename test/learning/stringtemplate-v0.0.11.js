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
 * + no recursion ~ until we had to support nested arrays of arrays
 * + no parse trees ~ objected oriented programming was made for this 
 *
 * Rolling it by hand with a limited token set and one method means
 * + looping hell, regex hell (brittle), and substring hell
 * + test regex online with http://www.cuneytyilmaz.com/prog/jrx/ 
 * + substring() mainly, plus http://davidwalsh.name/string-replace-javascript
 */

typeof String.prototype.template == 'function' || 
(String.prototype.template = function template(data) {

  var string = this.toString();
  var tokens = string.match(/\$\.?[^\/^\$^\s]+\$/g);
  
  // 

  function handleMessage(messages) {
    !console || ((console['warn'] || console['log'])('** stringtemplate: ' + 
                                                     messages.join(': ')));
  };
  
  // TODO ~ CLEAN UP
  // fail fast, return early
  
  var messages = ['error'];
  data && typeof data == 'object' || (messages.push('data must be an object'));
  tokens || (messages.push('no tokens in template string'));
  
  if (messages.length > 1) {  
    handleMessage(messages);
    return string;
  }
     
  //
  
  function replaceValue(text, context, token) {
  
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
      text = text.replace(reValueToken, context)
    );
    
    return text;
  }
  
  //
  
  function replaceCollectionByValue(text, context, token) {
    
    // console.log('replaceCollectionByValue');

    var contents = [];

    for (var k in context) {
    
      contents.push(text.toString().replace(token, context[k]));
    }
    
    // TODO ~ handleMessage() for no transform on token

    return contents.join('');
  }
  
  //
  
  function replaceCollectionByKey(text, context, tokens) {
  
    // console.log('replaceCollectionByKey');

    var contents = [];
    var content, key;
    
    for (var k in context) {
    
      content = text.toString();
      
      for (var i = 0; i < tokens.length; ++i) {
      
        key = tokens[i].replace(/[\$\.]/g, '');
        content = content.replace(tokens[i], context[k][key]);
      }
      
      contents.push(content);
    }

    // TODO ~ handleMessage() for no transform on token
    
    return contents.join('');
  }
  
  //
  
  function replaceCollection(text, context, tag, body) {

    // console.log('replaceCollection');
  
    var content = body.toString();
    var bodyTokens = body.match(/\$\.[^\$^\s]*\$/g);    
    var firstToken = bodyTokens[0];
      
    if (firstToken == '$.$') {

      content = replaceCollectionByValue(content, context, firstToken);

    } else {
    
      if ({}.toString.call(context) == '[object Array]') {

        content = replaceCollectionByKey(content, context, bodyTokens);

      } else {
      
        for (var i = 0; i < bodyTokens.length; ++i) {
        
          content = replaceValue(content, context, bodyTokens[i]);
        }
      }
    }

    // TODO ~ handleMessage() for no transform on firstToken
    
    if (content !== body) {
    
      if ({}.toString.call(context) == '[object Array]') {
      
        text = text.replace(tag, content);
        
      } else {
      
        text = content;
      }
    }
    
    return text;
  }
  
  // 
  
  function handleNestedBlock(text, context, tag, body) {

    // console.log('handleNestedBlock');
    
    var contents = [];
    var content = body.toString();  
    var token = /\$\#?\.?[^\$^\s]+\$/.exec(body)[0];

    // console.warn('token: ' + token);
    
    if (token === '$#.$' || {}.toString.call(context) == '[object Array]') {
    
      // console.log('handle nested array block');       
      
      for (var k in context) {
      
        contents.push(handleBlock(content, context[k], token));
      }
      
      content = contents.join('');
      
    } else {    

      // console.log('handle nested object block');

      content = handleBlock(content, context, token);
    }
    
    // TODO ~ handleMessage() for no transform on token

    if (content !== body) {
    
      text = text.replace(tag, content);
    }
    
    return text;
  }
  
  //
  
  function handleBlock(text, context, token) {
    
    // console.log('handleBlock for ' + token);

    var block = text.substring(text.indexOf(token));
    var tokens = block.match(/\$\#?\.?[^\$^\s]+\$/g);    
    var bodyTokens = block.match(/\$\.[^\$^\s]*\$/g);

    // handle empty token set - due to bad markup most likely
    
    if (!tokens || !bodyTokens) {
      handleMessage(['halted', 'no content tokens found in ' + block]);
      return text;
    }
    
    var endToken = token.replace('#', '/');    
    var depth = 0;
    var startIndex = 0;
    var endIndex = 0;
    var tag, body, name;
    
    for (var i = 0; i < tokens.length; ++i) {
      
      if (/\$\/[^\$^\/^\s]+\$/.test(tokens[i])) {
        
        depth -= 1;
        
        if (endToken == '$/.$' || !endIndex) {
        
          endIndex = block.indexOf(endToken, endIndex + 1);
        }
        
      } else if (/\$\#[^\$^\/^\s]+\$/.test(tokens[i])) {
      
        depth += 1;
        startIndex || (startIndex = token.length);
      }

      if (depth === 0 && startIndex > 0 && endIndex > 0) {
      
        tag = block.substring(0, endIndex + endToken.length);
        body = tag.substring(startIndex, endIndex);

        if (token.match(/\$\#[^\.]+\.[^\.]+/)) {

          // resolve to parent of name.spaced.entry
          
          name = token.replace(/\$|\#/g, '').split('.').pop();
          
        } else {

          name = token.replace(/[\$\.\#]/g, '');
        }

        name in context && (context = context[name]);
            
        if (/\$\#/.test(body)) {

          text = handleNestedBlock(text, context, tag, body);
          
        } else {
          
          text = replaceCollection(text, context, tag, body);
        }

        break;
      }
    }

    return text;
  }
  
  // handle all tokens

  return (function processTokens(text, data, tokens) {
  
    /*
     * check index for each token because text is the state and (potentially) 
     * modified on each iteration
     */
     
    var token, context, name, path, length, p;

    // replace inline tokens first
    
    for (var i = 0; i < tokens.length; ++i) {
      
      token = tokens[i];

      if (!token.match(/\$(\.|\#)/) && ~text.indexOf(token)) {
      
        text = replaceValue(text, data, token);
      }
    }
    
    if (tokens = text.match(/\$\#[^\$^\s]+\$/g)) {// assignment!
    
      // handle collection tokens

      for (var i = 0; i < tokens.length; ++i) {
      
        token = tokens[i];
        name = token.replace(/\$|\#/g, '');
        context = data;

        if (token.match(/\$\#[^\.]+\.[^\.]+/)) {
          
          // resolve to parent of entry in name.spaced.entry
          
          name = token.replace(/\$|\#/g, '').split('.').pop();
          path = token.replace(/\$\#?\.?/, '').replace(/\$/g, '').split('.');
          length = path.length - 1;
          p = 0;
          
          while (context && p < length) {
            context = context[path[p++]];        
          }
        }

        if (!!context[name] || ~text.indexOf(token.replace('#', '/')) && 
            ~text.indexOf(token) && token.match(/\$\#\.?[^\$^\s]?\$/)) {
            
          text = handleBlock(text, context, token);
        }
      }
    }
    
    return text;
    
  }(string, data, tokens));
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

  var fs = this.toString().replace(/\s*function[^\(]*[\(][^\)]*[\)][^\{]*{/,'')
                          .replace(/[\}]$/, '');
  var body = fs.match(/\/(\*){3,3}[^\*]+(\*){3,3}\//);
  
  if (!body) {
    return '';
  }
  
  var lines = body[0].replace(/\/\/[^\n]*/g, '') // remove line comments...
                    .replace(/(\/\*+)*[\r]*(\*+\/)*/g, '') // ...block comments
                    .split('\n'); // and split by newline
  var length = lines.length;
  var rows = [];
  var string;
  
  for (var i = 0; i < length; i++) {
  
    rows.push( lines[i] );
  }

  // windows vs. linux issue ~ travis borks if \\r not removed
  string = rows.join('\n').replace(/\\r/g, '');

  return (data && typeof data == 'object') ? string.template(data) : string;
});
