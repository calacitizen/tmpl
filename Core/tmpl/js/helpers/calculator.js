define('Core/tmpl/js/helpers/calculator', function calculator() {
   return function calculatorCaller(name, data) {
      return data[name];
   };
});