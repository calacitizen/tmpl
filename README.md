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
```javascript tmpl.parse(source) ``` function gets you to the html AST
