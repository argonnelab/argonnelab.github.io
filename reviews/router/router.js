
var Router = (function() {
  var self = {};

  self.activeRoute = {};

  self.modules = {
     leftNavigation: {id: 'leftNavigation', domId: '#leftnavigation-app', url: 'leftnavigation/leftnavigation.html'},
     header: {id: 'header', url: 'header/header.html', domId:'#header-app'}
  };

  //#region < Routes >
  self.routes = {
    reviewlist: {id: 'reviewlist', url: 'reviewlist/reviewlist.html'}
  }
  //#endregion

  self.loadReview = function(rid){

  };

  self.init = function(){
      var self = this;
      window.addEventListener('popstate', function(event) {
          loadInitPage();
      }, false);

     
      self.initModules();
      self.initRoutes();

      loadInitPage();
      
      // self.loadModule('#pop-placeholder', self.modules.popup);
      
  };

  self.initModules = function(){
      _.forEach(self.modules, function(mod){
          if (mod.params == undefined){
              mod.params = {};
          }
      });
  };

  self.initParamsForRoute = function(route){
    if (route.params == undefined){
        route.params = {};
    }
    
    if (route.keys != null){
        _.forEach(route.keys, function(key){
            if (key.indexOf(':') !== -1) {
                route.params[key.split(':')[0]] = key.split(':')[1];
            } else {
                var keyVal = self.getUrlParameter(key);
                if (keyVal != undefined){
                    route.params[key] = keyVal;
                }
            }
        });
    }
  };

  self.initRoutes = function(){
      var self = this;

    _.forEach(self.routes, function(route){
        self.initParamsForRoute(route);
    });

      self.routes.sites = {};
      _.forEach(Globals.config.sites, function(c){
        self.routes.sites[c.id] = c;
        _.forEach(self.routes.sites[c.id].routes, function(route){
            self.initParamsForRoute(route);
        });
        
      });

  }

  var loadInitPage = function(){  
    self.loadModule('#header-placeholder', self.modules.header);

    //Check for Page
    var rId = self.getUrlParameter(Constants.RID_QS_PARAM);
    if (rId == undefined){
    self.loadMainToRoute(self.routes.reviewlist);
    } else {
        var reviewMatch = self.routes.sites[rId];
        var page = self.getUrlParameter(Constants.PAGE_QS_PARAM);
        if (reviewMatch == undefined){
            console.log('page not found');
            self.loadMainToRoute(self.routes.notfound);
        } else {
            var route = undefined;
            if (page == undefined){
                self.loadMainToRoute(reviewMatch.routes.home);
            } else {
                var matchingRoutes = _.filter(reviewMatch.routes, function(r){return r.params.page == page});
            

                if (matchingRoutes.length > 1){
                    //#region < More than one route found >
                    _.forEach(matchingRoutes, function(matchingRoute){
                        if (matchingRoute.keys != undefined){
                            //#region < Keys Exist in Route >
    
                            var keysMatched = true;
                            _.forEach(matchingRoute.keys, function(routeKey){
                                if (routeKey.indexOf(":") > -1){
                                    var splitKey = routeKey.split(':');
                                    var keyParamValue = self.getUrlParameter(splitKey[0]);
                                    
                                    if (keyParamValue != undefined){
                                        matchingRoute.params[splitKey[0]] = keyParamValue;
                                        //check if value matches
                                        if (keyParamValue != splitKey[1]){
                                            keysMatched = false;
                                            
                                        }
                                    }else {
                                        keysMatched = false;
                                    }
                                } else {
                                    var keyParamValue = self.getUrlParameter(routeKey);
                                
                                    if (keyParamValue == undefined){
                                        keysMatched = false;
                                    } else {
                                        matchingRoute.params[routeKey] = keyParamValue;
                                    }
                                }
                            });
    
                            if (keysMatched){
                                if (route == undefined){
                                    route = matchingRoute;
                                    route.matchValue = matchingRoute.keys.length;
                                } else if (matchingRoute.keys.length > route.matchValue) {
                                    route = matchingRoute;
                                    route.matchValue = matchingRoute.keys.length;
                                }
                            }
                            //#endregion
                        } else {
                            if (route == undefined){
                                route = matchingRoute;
                                route.matchValue = 0;
                            }
                        }
                    });  
                    //#endregion
                    self.loadMainToRoute(route);
    
                } else {
                    //Only one route found
                    self.loadMainToRoute(matchingRoutes[0]);
                }
                
            }
            }
            
    }
  };

  self.getUrlParameter = function(param) {  
      var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');  
      for (var i = 0; i < url.length; i++) {  
          var urlparam = url[i].split('=');  
          if (urlparam[0] == param) {  
              return urlparam[1];
          }  
      }  
  };

  self.loadModule = function(id, module){
      $(id).load(module.url);
  }

  self.loadRoute = function(id, route, loadBackground){
      var self = this;
      loadBackground = loadBackground == undefined? true : loadBackground;

      self.activeRoute = route;

      if (route.nav == true){
          if (loadBackground){
            var rId = route.params[Constants.RID_QS_PARAM];
        
            self.loadModule(Constants.LEFT_NAV_PLACEHOLDER, self.modules.leftNavigation);
            self.waitforComponentToLoad(self.modules.leftNavigation.domId).then(function(){
                var matchedReview = self.routes.sites[rId];
                LeftNavigation.load(matchedReview, route);
            });
          }
        
      } else {
         $(Constants.LEFT_NAV_PLACEHOLDER).empty();
      }

   

    $(id).load(route.url);

      var url = self.getCurrentPathUrl();
      _.forOwn(route.params, function(value, key) {
          if (value != ''){
              url = self.addToUrl(url, key, value);
          }
          
      });

      self.pushUrlChange(url);
      if (loadBackground){
        self.loadModule('#header-placeholder', self.modules.header);
        self.waitforComponentToLoad(self.modules.header.domId).then(function(){
            var matchedReview = self.routes.sites[rId];
            Header.load(matchedReview);
        });
      }
      
  };

  self.loadMainToRoute = function(route, loadBackground){
    self.loadRoute(Constants.CONTENT_PLACEHOLDER, route, loadBackground);
  }

  self.reloadMainToRoute = function(){
      self.loadRoute(Constants.INDEX_PLACEHOLDER, self.activeRoute);
  };

  self.pushUrlChange = function(url){
      window.history.pushState({url: url}, '',url);
  };


  self.loadNotFound = function(){
      self.loadMainToRoute(self.routes.notfound);
  };


  self.addToUrl = function(url, key, value){

      key = key.toLowerCase();
      value = '' + value;
      
      value = value.toLowerCase();

      var qstrings = queryString(url);
      
      if (url.indexOf('?') > -1){
          url = url.substr(0, url.indexOf('?')) + "?";
      }
      else {
          url += "?";
      }

      var match = false;
      if (qstrings != undefined){
          _.forEach(qstrings, function(qstr) {
              if (qstr.key == key){
                url += key + "=" + value + "&";
                match = true;
              }else {
                url += qstr.key + "=" + qstr.value + "&";
              }
            });
      }
    
      if (!match){
          url += key + "=" + value + "&";
      }
      url = url.slice(0, -1);
      return url;
  };

  var queryString = function(url) {
    if (url.indexOf('?') > -1){
        url = url.substr(url.indexOf('?') + 1);
        var vars = url.split("&");
        var qstrs = [];
        for (var i = 0; i < vars.length; i++) {
            var qstr = {
                key: '',
                value: ''
            };

            var pair = vars[i].split("=");
    
            // If first entry with this name
            if (typeof pair[0] === "undefined") {
                qstr.key = pair[0].toLowerCase();
                qstr.value = decodeURIComponent(pair[1]).toLowerCase();
                //query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof pair[0] === "string") {
                qstr.key = pair[0].toLowerCase();
                qstr.value = decodeURIComponent(pair[1]).toLowerCase();
                // var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                // query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                qstr.key = pair[0].toLowerCase();
                qstr.value = decodeURIComponent(pair[1]).toLowerCase();
                // query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }

            qstrs.push(qstr);
        }
        return qstrs;
    }
    else {
        return undefined;
    }
    
  };

  self.removeFromUrl = function(url, key){
    key = key.toLowerCase();
    var qstrings = queryString(url);
    if (url.indexOf('?') > -1){
        url = url.substr(0, url.indexOf('?')) + "?";
    
        _.forEach(qstrings, function(qstr) {
            if (qstr.key != key){
                url += qstr.key + "=" + qstr.value + "&";
            }
        });

        url = url.slice(0, -1);
        return url;
    }
    else {
        return url;
    }
  };

  self.getCurrentPathUrl = function(){

      if (window.location.port == "8080"){
        return window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + window.location.pathname;
      } else {
        return window.location.protocol + "//" + window.location.hostname + window.location.pathname;
      }
     
  }

  self.convertRouteToUrl = function(route){

    var url = self.getCurrentPathUrl();
      _.forOwn(route.params, function(value, key) {
        if (value != ''){
            url = self.addToUrl(url, key, value);
        }
        
    });

    return url;
  }

  self.getCurrentUrl = function() {
    return window.location.href;
  };

  var idExists = function (lookforId){
      var idVal = $(lookforId).length;
      if (idVal != 0){
          return true;
      }
      else {
          return false;
      }
  };

  self.waitforComponentToLoad = function(lookforId){
      return new Promise(function(resolve, reject) {
          var ms = 500;
          
          setTimeout(function() {
             if (idExists(lookforId)){
                 resolve();
             }
             else {
                  setTimeout(function() {
                      if (idExists(lookforId)){
                          resolve();
                      } else {
                          setTimeout(function() {
                              if (idExists(lookforId)){
                                  resolve();
                              } else {
                                  setTimeout(function() {
                                      if (idExists(lookforId)){
                                          resolve();
                                      } else {
                                          setTimeout(function() {
                                              if (idExists(lookforId)){
                                                  resolve();
                                              } else {
                                                  reject('time expired for waiting for ' + lookforId);
                                              }
                                          }, ms);
                                      }
                                  }, ms);
                              }
                          }, ms);
                      }
                  }, ms);
             }
          }, ms);
      });
  };

  self.loadComponentWithWait = function(placeholderid, src, lookforId) {
      return new Promise(function(resolve, reject) {
          $(placeholderid).load(src);
          self.waitforComponentToLoad(lookforId).then(function(){
              resolve();
          });
      });
  };

  self.addDialog = function(module, height, width){
      if (!idExists($('#shadow'))){
          $(document.body).append("<div id='shadow'></div>").find("#shadow").hide();
          $("#shadow").fadeTo(200,0.9);
          $("#O365_MainLink_Me").hide();

      }
      self.loadModule('#dialog-placeholder', module);

      var jheight = height == undefined? 500 : height;
      var jwidth = width == undefined? 600 : width;

      $('#dialog-placeholder').height(jheight);
      $('#dialog-placeholder').width(jwidth);
      $('#dialog-placeholder').show();
  };

  self.removeDialog = function(reload){
      $('#shadow').fadeTo(200,0);
      $('#shadow').remove();
      $('#dialog-placeholder').empty();
      $('#dialog-placeholder').hide();
      $("#O365_MainLink_Me").show();
      
      if (reload != undefined){
          if (reload){
              self.reloadMainToRoute();
          }
      }
  };


  return self;
}());