# TMPL
Templating engine with valid html directives. TMPL uses three step to generate form you need to get html.
```javascript
var AST = tmpl.parse(source);
tmpl.traverse(source, data).handle(
  function handle(traversed) {
    tmpl.getHTML(traversed);
  },
  function errorHandle(error) {
    throw new Error(error);
  }
);
```
Parse function gets you to the html AST
```javascript 
tmpl.parse(source) 
``` 
AST looks like this 
```javascript
[ { raw: 'a href="test.html"'
  , data: 'a href="test.html"'
  , type: 'tag'
  , name: 'a'
  , attribs: { href: 'test.html' }
  , children: [ { raw: 'xxx', data: 'xxx', type: 'text' } ]
  }
]
```
Traverse function gets prepared AST-html like objects data with resolved variables and directives.
```javascript
tmpl.traverse(source, data).handle(function handle() {});
```


