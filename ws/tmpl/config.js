define('Core/tmpl/config', function () {
   var config = {
      calculators: [
         {
            type: 'record',
            is: function isRecordSet(ent) {
               return $ws.helpers.instanceOfModule(ent, 'SBIS3.CONTROLS.Record');
            },
            calculator: function recordCalculator(prop, root) {
               return root.get(prop);
            }
         }
      ],
      iterators: [
         {
            type: 'dataset',
            is: function isDataset(ent) {
               return $ws.helpers.instanceOfModule(ent, 'SBIS3.CONTROLS.DataSet');
            },
            iterator: function datasetIterator(dataset, callback) {
               dataset.each(callback);
            }
         },
         {
            type: 'array',
            is: function isArray(ent) {
               return $ws.helpers.isPlainArray(ent);
            },
            iterator: function arrayIterator(array, callback) {
               for (var i = 0; i < array.length; i++) {
                  callback(array[i], i);
               }
            }
         },
         {
            type: 'object',
            is: function isObject(ent) {
               return $ws.helpers.isPlainObject(ent);
            },
            iterator: function objectIterator(object, callback) {
               for (var key in object) {
                  callback(object[key], key);
               }
            }
         }
      ]
   };
   return config;
})