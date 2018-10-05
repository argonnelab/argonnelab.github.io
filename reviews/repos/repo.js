//#region < Globals >
var Globals = (function(){
  var self = {};
  self.config = {};

  self.init = function(){
      return new Promise(function(resolve, reject) {
        $.getJSON( "configs/configs.json", function( data ) {
          self.config = data;
          resolve();
        });
       
      });
  };

return self;
}());
//#endregion