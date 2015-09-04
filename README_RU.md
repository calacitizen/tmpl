# TMPL ![Travis](https://travis-ci.org/calacitizen/tmpl.svg?branch=divided)
## Javascript API
Шаблонизатор с валидными html-директивами управления. TMPl использует 2 этапа генерации html.
Templating engine with valid html directives. TMPL uses three step to generate form you need to get html.
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
Если выражения с правой стороны === true или является не falsy (https://developer.mozilla.org/ru/docs/Glossary/Falsy) значение слева будет выведено в этом месте.
```html
<div class="some-{{class}}{{ ' hiddenClass' : value !== 12 }}">{{'Text': otherValue !== false }} Text</div>
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
<div class="{{value}}" id="{{'first': otherValue !== null }}">Text</div>
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
<if data="number === 123">
  <div class="sample">Sample</div>
</if>
```
###For
For директива может использоваться как для массивов так и для объектов.
```html
<for data="rabbit in rabbits.names">
  <div class="rabbit {{ rabbit.type }}">{{ rabbit.name }}</div>
    <div class="runs">
      <for data="run in rabbit.runs">
        {{ run.num }} ll{{pumb}}
      </for>
    </div>
  </div>
</for>
```
###Include && Partials
Include директивы в настоящее время работает только с requirejs. Для того чтобы её использовать, сначала нужно подключить шаблон:
```html
<include template="tmpl/button" name="button" />
```
а потом использовать partial:
```html
<partial template="button" data="rabbit" />
```
Или в цикле:
```html
<for data="rabbit in rabbits.names">
  <partial template="button" data="rabbit" />
</for>
```
В partial-шаблонах корневой объект можно использовать через переменную "root".




