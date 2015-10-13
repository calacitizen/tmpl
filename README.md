# TMPL [![Travis](https://travis-ci.org/calacitizen/tmpl.svg?branch=master)](https://travis-ci.org/calacitizen/tmpl)
## Javascript API
Templating engine with valid html directives. TMPL uses two step to generate form you need to get html. You can pass any resolver function you want for including external files.
```javascript
tmpl.template(source, resolver).handle(
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

If you using resolver you can include templates on the go. For example:
```html
<ws:Button></ws:Button>
```
Name of this tag (Button) will be used in resolver.

In the partial template you can grab main data object with var name of "__root".

###Inline Templates
You can create inline templates:
```html
<ws:template name="example">
  <div class="{{class}}">
    {{Text}}
  </div>
</ws:template>
```
And use them with partial tag:
```html
<ws:partial template="example"></ws:partial>
```

###Passing data for template modules

When you using partial tag, you can pass data to the template you evaluating. For example:

```html
<ws:template name="example">
  <div class="{{class}}">
    {{base}}
  </div>
</ws:template>
```

```html
<ws:partial template="example">
  <ws:class>
    <ws:string>SomeClass</ws:string>
  </ws:class>
  <ws:base>
    <ws:string>Some Text Here</ws:string>
  </ws:base>
</ws:partial>
```

Additionally you can pass this parameters with the help of attributes:

```html
<ws:partial template="example" class="SomeClass" base="Some Text Here"></ws:partial>
```

This is types for passing data from specific tags:

```js
"StringStringStringString"
```
```html
<ws:string>StringStringStringString</ws:string>
```
```js
7812634821634.237582735
```
```html
<ws:number>7812634821634.237582735</ws:number>
```
```js
[
  "StringStringStringString", 
  7812634821634.237582735, 
  "StringStringStringString", 
  7812634821634.237582735, 
  "StringStringStringString", 
  7812634821634.237582735
]
```
```html
<ws:array>
  <ws:string>StringStringStringString</ws:string>
  <ws:number>7812634821634.237582735</ws:number>
  <ws:string>StringStringStringString</ws:string>
  <ws:number>7812634821634.237582735</ws:number>
  <ws:string>StringStringStringString</ws:string>
  <ws:number>7812634821634.237582735</ws:number>
</ws:array>
```
```js
{
  someOption: "Option",
  someNumber: 123,
  prop0: {
    inProp0: {
      inInProp0: "String"
    }
  },
  prop1: "String",
  prop2: 23212352.2323,
  prop3: 23212352.2323,
  prop4: [
    "StringStringStringString", 
    7812634821634.237582735, 
    "StringStringStringString", 
    7812634821634.237582735, 
    "StringStringStringString", 
    7812634821634.237582735
  ]
}
```
```html
<ws:object someOption="Option" someNumber="{{123}}">
  <ws:prop0>
    <ws:inProp0>
      <ws:inInProp0>
        <ws:string>String</ws:string>
      </ws:inInProp0>
    </ws:inProp0>
  </ws:prop0>
  <ws:prop1>
    <ws:string>String</ws:string>
  </ws:prop1>
  <ws:prop2>
    <ws:number>23212352.2323</ws:number>
  </ws:prop2>
  <ws:prop3>
    <ws:number>23212352.2323</ws:number>
  </ws:prop3>
  <ws:prop4>
    <ws:array>
      <ws:string>StringStringStringString</ws:string>
      <ws:number>7812634821634.237582735</ws:number>
      <ws:string>StringStringStringString</ws:string>
      <ws:number>7812634821634.237582735</ws:number>
      <ws:string>StringStringStringString</ws:string>
      <ws:number>7812634821634.237582735</ws:number>
    </ws:array>
  </ws:prop4>
</ws:object>
```








