//#region < Globals >
var Globals = (function(){
  var self = {};
  self.leftNavigation = {};

  self.init = function(){
      return new Promise(function(resolve, reject) {
          UserRepo.setCurrentUser().then(function(){
             
              AppSettingRepo.set().then(function(){
                  self.isReady = true;
                 
                  resolve();
              });
          });
      });
  };

return self;
}());
//#endregion