# TMPL
## Javascript API
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
###Parse 
Function gets you to the html AST
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
###Traverse 
Function gets prepared AST-html like objects data with resolved variables and directives.
```javascript
tmpl.traverse(source, data).handle(function handle() {});
```
AST-html like data sample
```javascript
[ {
  attribs: {
    class: {
      data: [
        {
          type: "text",
          value: "button "
        },
        {
          name: "root.name",
          type: "var",
          value: "mikkey"
        }
      ]
    }
  },
  children: [
    {
      data: {
        type: "text",
        value: "Click on me, man!"
      },
      raw: "Click on me, man!",
      type: "text"
    }
  ],
  data: "button",
  name: "button",
  raw: "button",
  type: "tag",
}
]
```
With this data you can create your own representative of html in any kind.
getHTML function is a simple function, that generates html string.
```javascript
tmpl.getHTML(traversed);
```
## HTML Directives
### If
If directive is using simple if logic.

Wherever expressions are allowed, they are treated as JavaScript expressions and copied out to the compiled template verbatim. However, you can choose to use alternate versions of the following JavaScript operators:

JavaScript Operator | TMPL Equivalent
------------------- | -----------------
`&&`                 | `&&`
<code>&#124;&#124;</code>                | <code>&#124;&#124;</code>
`===`               | `===`
`!==`               | `!==`
`<`                 | `lt`
`>`                 | `gt`
`<=`                | `le`
`>=`                | `ge`

```html
<if data="number === 123">
  <div class="sample">Sample</div>
</if>
```
###For
For directive can be used for arrays and objects.
```html
<for data="rabbit in rabbits.names">
  <div class="rabbit {{ rabbit.type }}">{{ rabbit.name }}</div>
    <div class="runs">
      <for data="run in rabbit.runs">
        {{ run.num }} ll{{pumb}}
      </for>
  </if>
</for>
```
###Include && Parials
Include directive can be used at this time only with requirejs. In order to use it you need to at first include template:
```html
<include template="tmpl/button" name="button" />
```
and then use partial:
```html
<partial template="button" data="rabbit" />
```
or in loop:
```html
<for data="rabbit in rabbits.names">
  <partial template="button" data="rabbit" />
</for>
```
In the partial template you can grab main data object with var name of "root".




