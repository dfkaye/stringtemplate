
// krasimir's 20-line template function ~ expanded for some readability and 
// some customizing

var TemplateEngine = function(html, options) {
  
  var re = /<%([^%>]+)?%>/g, 
      reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, 
      code = 'var r=[];\n', 
      cursor = 0;
  
  function add(line, js) {
    console.log(js);
    js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
    (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
    return add;
  }
  
  while(match = re.exec(html)) {
    console.log(match.index , match[1]);
    add(html.slice(cursor, match.index))(match[1], true);
    cursor = match.index + match[0].length;
  }
  
  add(html.substr(cursor, html.length - cursor));
  code += 'return r.join("");';
  
  var F = new Function(code.replace(/[\r\t\n]/g, ''));
  console.log(F.toString());
  return F;
  //return F.apply(options);
};

var template =
    ('My skills:' +
    '<%if(this.showSkills) {%>' +
    '<%for(var index in this.skills) {%>' +
    '<a href="#"><%this.skills[index]%></a>' +
    '<%}%>' +
    '<%} else {%>' +
    '<p>none</p>' +
    '<%}%>');

var list = TemplateEngine(template);

var options = {
  skills: ["js", "</html>", "css"],
  showSkills: 1
};

console.log(list.apply(options));// My skills:<p>none</p>
            
/*console.log(TemplateEngine(template, {
  skills: ["js", "</html>", "css"],
  showSkills: 1
})); // My skills:<a href="#">js</a><a href="#">html</a><a href="#">css</a>
*/


/////////////////////

riot.js 20-line render.js for logic-less templates
when render called with third argument === true, an xss scrubbing is run on input
when render called with third argument type === function, function is run on each 
input key-value -- function(v, k) { console.log('key is ' + k + '; value is ' + v); }

var FN = {}, // Precompiled templates (JavaScript functions)
    template_escape = {"\\": "\\\\", "\n": "\\n", "\r": "\\r", "'": "\\'"},
    render_escape = {'&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;'};
    function default_escape_fn(str, key) {
      return str == null ? '' : (str+'').replace(/[&\"<>]/g, function(char) {
        return render_escape[char];
      });
    }
    riot.render = function(tmpl, data, escape_fn) {
    if (escape_fn === true) escape_fn = default_escape_fn;
    tmpl = tmpl || '';
    return (FN[tmpl] = FN[tmpl] || new Function("_", "e", "return '" +
      tmpl.replace(/[\\\n\r']/g, function(char) {
        return template_escape[char];
      }).replace(/{\s*([\w\.]+)\s*}/g, "' + (e?e(_.$1,'$1'):_.$1||(_.$1==null?'':_.$1)) + '") + "'")
    )(data, escape_fn);
};

////////////////////////////////

https://theantlrguy.atlassian.net/wiki/display/ST4/Motivation+and+philosophy

Terence Parr on StringTemplate 

After examining hundreds of template files that I created over years of 
jGuru.com (and now in ANTLR v3) development, I found that I needed only the 
following four basic canonical operations (with some variations):

+ attribute reference; e.g., `<phoneNumber>`
+ template reference (like #include or macro expansion); e.g., `<searchbox()>`
+ conditional include of subtemplate (an IF statement); e.g., 
  `<if(title)><title><title></title><endif>`
+ template application to list of attributes; e.g.,  `<names:bold()>`

Examples from StringTemplate Introduction
https://theantlrguy.atlassian.net/wiki/display/ST4/Introduction

import org.stringtemplate.v4.*;
...
ST hello = new ST("Hello, <name>");
hello.add("name", "World");
System.out.println(hello.render());

STGroup group = new STGroupDir("/tmp");
ST st = group.getInstanceOf("decl");
st.add("type", "int");
st.add("name", "x");
st.add("value", 0);
String result = st.render(); // yields "int x = 0;"

STGroup group = new STGroupFile("/tmp/test.stg");
ST st = group.getInstanceOf("decl");
st.add("type", "int");
st.add("name", "x");
st.add("value", 0);
String result = st.render(); // yields "int x = 0;"

ST st = new ST("<b>$u.id$</b>: $u.name$", '$', '$');
st.add("u", new User(999, "parrt"));
String result = st.render(); // "<b>999</b>: parrt"

ST st = new ST("<items:{it|<it.id>: <it.lastName>, <it.firstName>\n}>");
st.addAggr("items.{ firstName ,lastName, id }", "Ter", "Parr", 99); // add() uses varargs
st.addAggr("items.{firstName, lastName ,id}", "Tom", "Burns", 34);
String expecting =
        "99: Parr, Ter"+newline +
        "34: Burns, Tom"+newline;
        
        
        