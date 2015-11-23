define('tmpl', ['Core/tmpl/tmpl'], function(tmpl){

   function resolver(string, ext) {
      return 'tmpl/' + string.toLocaleLowerCase() + '.' + ext;
   }

   return {
      load: function (name, require, load) {
         try {
            require(["text!" + name], function(html){
               try {
                  tmpl.template(html, resolver).handle(function (traversed) {
                     load(function loadTemplateData(data) {
                        console.log(traversed);
                        var f = tmpl.html(traversed, data);
                        console.log(f);
                        return f;
                     });
                  });
               } catch (e) {
                  e.message = 'Error while creating template ' + name + '\n' + e.message + '\n' + e.stack;
                  load.error(e);
               }
            }, function(e){
               e.message = 'Error while loading template ' + name + '\n' + e.message + '\n' + e.stack;
               load.error(e);
            });
         } catch(e) {
            e.message = 'Error while resolving template ' + name + '\n' + e.message + '\n' + e.stack;
            load.error(e);
         }
      }
   }
});
