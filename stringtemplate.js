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
(String.prototype.template = function template(data) {

  var source = this.toString();
  var tokens = source.match(/\$\.?[^\/^\$^\s]+\$/g);
  var errors = ['error'];

  function handleMessage(messages) {
    !console || ((console['warn'] || console['log'])('** stringtemplate: ' + 
                                                     messages.join(': ')));
  };

  data && typeof data == 'object' || (errors.push('data must be an object'));
  tokens || (errors.push('no tokens in source string'));
  
  if (errors.length > 1) {

    // fail fast, return early
  
    handleMessage(errors);
    return source;
  }
  
  //
  
  function replaceValue(source, data, token) {
  
    // console.log('replaceValue for ' + token);
   
    var name = token.replace(/\$\./, '').replace(/\$/g, '');
    var path = name.split('.');
    var p = 0;
    var context = data;
    var reValueToken;
    
    while (context && p < path.length) {
      context = context[path[p++]];
    }
    
    // handleMessage for no context
    
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
    
    // handleMessage for no transform on token

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

    // handleMessage for no transform on token
    
    return contents.join('');
  }
  
  // LARGE METHOD

  function resolveTagBody(source, context, tag, body) {

    // console.log('resolveTagBody');
   
    var content = body.toString();
    var bodyTokens = body.match(/\$\.([^\$^\s]+)?\$/g);
    var contents = [];
    var firstToken;

    if (/\#\$/.test(body)) {

      firstToken = /\$\.?[^\$^\s]+\$/.exec(body)[0];

      if (firstToken === '$.#$') {
      
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
      
      // handleMessage for no transform on firstToken

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

      // handleMessage for no transform on firstToken
      
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
    var tokens = block.match(/\$\.?[^\$^\s]+\#\$/g);
    
    // handle empty token set - due to bad markup most likely
    
    if (!tokens) {
    
      handleMessage(['halted', 'no content tokens found in ' + block]);
      
      return source;
    }
    
    var endToken = token.replace('$', '$/');    
    var depth = 0;
    var start = 0;
    var end = 0;
    var context, name, tag, body;

    for (var i = 0; i < tokens.length; ++i) {
      
      if (/\$\/[^\$^\/^\s]+\#\$/.test(tokens[i])) {
        
        depth -= 1;
        
        if (endToken == '$/.#$' || !end) {
          end = block.indexOf(endToken, end + 1);
        }
        
      } else if (/\$[^\$^\/^\s]+\#\$/.test(tokens[i])) {
        depth += 1;
        start || (start = token.length);
      }

      if (depth === 0 && start > 0 && end > 0) {
        
        context = data;
        name = token.replace(/[\$\.\#]/g, '');
        !name || (context = context[name]);
        
        tag = block.substring(0, end + endToken.length);
        body = tag.substring(start, end);
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
     
    var token, name;
    
    // replace inline tokens first
    
    for (var i = 0; i < tokens.length; ++i) {
      
      token = tokens[i];

      if (!token.match(/\#\$/) && ~source.indexOf(token) && // alternation fix/found '$.$'
          !~source.indexOf(token.replace('$', '$/'))) { // not found
        
        source = replaceValue(source, data, token);
      }
    }
    
    // handle collection tokens
    
    //tokens = source.match(/\$[^\/^\$^\s]+\$/g); 
    // assignment!
    if (tokens = source.match(/\$[^\/^\$^\s]+\$/g)) {
    
      for (var i = 0; i < tokens.length; ++i) {
      
        token = tokens[i];
        name = token.replace(/[\$\#]/g, '');

        if (name in data || token.match(/\$\.[^\$^\s]?\#\$/) && // alternation fix '$.#$'           
            ~source.indexOf(token) && ~source.indexOf(token.replace('$', '$/'))) { // found

          source = handleBlock(source, data, token);
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

  var fs = this.toString();
  
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
