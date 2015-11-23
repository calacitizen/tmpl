require.config({
   baseUrl: '.'
});
require(['tmpl!tmplSamples/sample.tmpl'], function (tmpl) {
   var data = {
      header: 'lsdkgjskdg',
      bool: false,
      show: function show(name, cake, bake) {
         return name + cake + bake;
      },
      activeClass: 'active',
      yy: {
         mm: {
            kk: 'A super complicated json'
         },
         get: function get(name) {
            return name + "123";
         },
         getClass: function (t) {
            return t;
         }
      },
      b: 5,
      mt: "10px",
      red: "red",
      moms: 'ta',
      nope: 1,
      dd: 's',
      cookies: 23,
      template: {
         stepClass: "SomeStepClass"
      },
      rabbits: {
         names: [{
            type: "melacholic",
            name: 'mikkey',
            runs: [{
               num: 'first'
            }, {
               num: 'second'
            }, {
               num: 'third'
            }]
         }, {
            type: "creative",
            name: 'caleb',
            runs: [{
               num: 'first'
            }, {
               num: 'second'
            }, {
               num: 'third'
            }]
         }, {
            type: "misanthrope",
            name: 'iowa',
            runs: [{
               num: 'first'
            }, {
               num: 'second'
            }, {
               num: 'third'
            }]
         }, {
            type: "oyama",
            name: 'chichi',
            runs: [{
               num: 'first'
            }, {
               num: 'second'
            }, {
               num: 'third'
            }]
         }]
      },
      cakes: {
         a: 'Applepie',
         b: 'Blueberrypie',
         c: 'Strawberrypie',
         d: 'Steak'
      },
      vasts: {
         name: 'Bob',
         chees: 'Cava',
         property: 'Takeaway',
         tip: 'Max'
      },
      mac: {
         fries: '21'
      },
      boss: {
         adore: 'jadore',
         keys: 'black',
         get: function get(prop) {
            return this[prop];
         },
         set: function set(prop) {
            return this[prop];
         }
      }
   };
   var d = document.getElementById('tmpl1');
   d.innerHTML = tmpl(data);
});
