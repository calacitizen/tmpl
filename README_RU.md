# TMPL [![Travis](https://travis-ci.org/calacitizen/tmpl.svg?branch=master)](https://travis-ci.org/calacitizen/tmpl)
## Javascript API
Шаблонизатор с валидными html-директивами управления. TMPl использует 2 этапа генерации html.
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
Функция готовит AST-дерево с объектами и разрешенными переменными и директивами.
```javascript
tmpl.template(source).handle(function handle(traversed) {});
```
AST-html вид
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
Такое дерево можно привести к любому виду представления html
###html
Простая функция, которая на основе дерева и данных приводит вид к html-строке
```javascript
tmpl.html(traversed, data);
```
## HTML
### Переменные
Можно использовать вывод пересенных в любом месте, кроме data-атрибутов в директивах
```html
<header class="maybe {{ activeClass }}">{{bambam}} I'm the biggest header in the world</header>
```
###Выражения
Они выглядят как тернарные операторы. Можно опустить второе значение, разделяемое ":". Если выражения с левой стороны === true или является не falsy (https://developer.mozilla.org/ru/docs/Glossary/Falsy) первое значение справа будет выведено в этом месте, если нет, то второе или undefined.
```html
<div class="some-{{class}}{{ value !== 12 ? ' hiddenClass'  }}">{{ otherValue !== false ? 'Text': 'No text' }} Text</div>
```
###Attributes
Если значение любого из атрибутов будет пустым или === ''. В таком случае атрибут не будет показан совсем. 
```javascript
{
  value: undefined,
  otherValue: null
}
```
```html
<div class="{{value}}" id="{{otherValue !== null ? 'first'}}">Text</div>
```
Пример:
```html
<div>Text</div>
```
### If
If директива использует простую логику обычного if в js.

Используемые типы выржаний для директивы if или любых других выражений в шаблонизаторе

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
<ws:if data="{{ number === 123 }}">
  <div class="sample">Sample</div>
</ws:if>
```
###For
For директива может использоваться как для массивов так и для объектов.
```html
<ws:for data="rabbit in rabbits.names">
  <div class="rabbit {{ rabbit.type }}">{{ rabbit.name }}</div>
    <div class="runs">
      <ws:for data="run in rabbit.runs">
        {{ run.num }} ll{{pumb}}
      </ws:for>
    </div>
  </div>
</ws:for>
```
###Include && Partials
Include директивы в настоящее время работает только с requirejs. Для того чтобы её использовать, сначала нужно подключить шаблон:
```html
<ws:include template="tmpl/button" name="button" />
```
а потом использовать partial:
```html
<ws:partial template="button" data="rabbit" />
```
Или в цикле:
```html
<ws:for data="rabbit in rabbits.names">
  <ws:partial template="button" data="rabbit" />
</ws:for>
```
При использовании резолвера для имён. Например:
```html
<ws:Button></ws:Button>
```
Name of this tag (Button) will be used in resolver.

In the partial template you can grab main data object with var name of "__root".

###Inline Templates
Можно создавать inline шаблоны
```html
<ws:template name="example">
  <div class="{{class}}">
    {{Text}}
  </div>
</ws:template>
```
Можно использовать их применяя через partial тэг:
```html
<ws:partial template="example"></ws:partial>
```

###Передача данных для модуля template

При использовании тэга partial можно передавать данные для исполняемого шаблона. Например:

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

В добавок к этому можно передавать простые типы данных через атрибуты

```html
<ws:partial template="example" class="SomeClass" base="Some Text Here"></ws:partial>
```

Это типы данных представленные в виде тегов для передачи в область видимости

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




