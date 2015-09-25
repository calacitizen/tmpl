# TMPL [![Travis](https://travis-ci.org/calacitizen/tmpl.svg?branch=master)](https://travis-ci.org/calacitizen/tmpl)
## Javascript API
Templating engine with valid html directives. TMPL uses two step to generate form you need to get html.
```javascript
tmpl.template(source).handle(
  function handle(traversed) {
    tmpl.html(traversed, data);
  },
  function errorHandle(error) {
    throw new Error(error);
  }
);
```

###Template 
Function prepares AST-html like objects data with resolved variables and directives.
```javascript
tmpl.traverse(source, data).handle(function handle(traversed) {});
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
          value: ""
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
getHTML function is a simple function, that generates html with given data string.
```javascript
tmpl.html(traversed, data);
```
## HTML
### Variables
You can use variables in any place except data attributes in directives:
```html
<header class="maybe {{ activeClass }}">{{bambam}} I'm the biggest header in the world</header>
```
###Expressions
They look like a ternary operators, but the aren't. You can skip the second part with ":". So if conditional expression on the left is true first value will be returned and if not the second, or undefined.
```html
<div class="some-{{class}}{{ value !== 12 ? ' hiddenClass' }}">{{ otherValue !== false ? 'Text' : 'No text' }} Text</div>
```
###Attributes
If any attribute will be set to empty string === ''. Then it will be never shown. For example:
```javascript
{
  value: undefined,
  otherValue: null
}
```
```html
<div class="{{value}}" id="{{ otherValue !== null ? 'first' }}">Text</div>
```
Something like this will be processed to:
```html
<div>Text</div>
```
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
<ws-if data="number === 123">
  <div class="sample">Sample</div>
</ws-if>
```
###For
For directive can be used for arrays and objects.
```html
<ws-for data="rabbit in rabbits.names">
  <div class="rabbit {{ rabbit.type }}">{{ rabbit.name }}</div>
    <div class="runs">
      <ws-for data="run in rabbit.runs">
        {{ run.num }} ll{{pumb}}
      </ws-for>
    </div>
  </div>
</ws-for>
```
###Include && Partials
Include directive can be used at this time only with requirejs. In order to use it you need to at first include template:
```html
<ws-include template="tmpl/button" name="button" />
```
and then use partial:
```html
<ws-partial template="button" data="rabbit" />
```
or in loop:
```html
<ws-for data="rabbit in rabbits.names">
  <ws-partial template="button" data="rabbit" />
</ws-for>
```
In the partial template you can grab main data object with var name of "root".




