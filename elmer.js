;(function(){
  
  var registrations  =  [],
      cookieLabel    =  'Elmer';
  
  
  /**
   * @constructor
   */
  function Elmer(funcName) {
  
    fixTraces();     // Try to add back lines if possible
    arrayRemove();   // add remove to Array
    
    this.name = funcName || 'global'; // should be override by each function that uses it
    
    this.register( this.name );
    this.registerCookieObjects();
    
    if( _.indexOf( registrations, 'ElmerOff' ) == -1 && !this.inCookie( 'ElmerOff' ) ) {
      this.overrideConsole();
    }
    
  }
  
  
  /**
   * Check cookies to see if new registrations have been made
   * @public 
   */
  Elmer.prototype.registerCookieObjects = function() {
    var i, str, length;
    
    str     =  this.getCookie(cookieLabel);
    length  =  str.length;
    
    str.split(',');
        
    for( var i=0; i<=length; i++ ) {
      if( _.indexOf( str, str[i] ) == -1 ) {
        this.register( this.name );
      }
    }
  }
  
  
  /**
   * Add method to Array to remove by item value
   * @private
   * @credit http://stackoverflow.com/questions/3954438/remove-item-from-array-by-value
   */
  function arrayRemove() {
    if( !Array.prototype.remove ) {
    
      Array.prototype.remove = function() {
        var what, a = arguments, L = a.length, ax, arr = this;
        
        while (L && arr.length) {
          what = a[--L];
          while ( ( ax = _.indexOf( arr, what ) ) !== -1 ) {
            arr.splice(ax, 1);
          }
        }
        
        return this;
      };
      
    }
  }
  
  
  /**
   * Unfortunately, with abstraction of console, we lose line/number traces. We try to correct them with this by 
   * passing __line and __file as params to console[function]. If you really need to see the numbers, turn off 
   * Elmer by adding ElmerOff to setCookie() 
   *
   * @private
   */
  function fixTraces() {
  
    if( !window.__stack ) {
    
      Object.defineProperty(window, '__stack', {
        get: function(){
          var orig, err, stack;
          
          orig = Error.prepareStackTrace;
          Error.prepareStackTrace = function(_, stack){ return stack; };
          
          err = new Error;
          Error.captureStackTrace(err, arguments.callee);
          
          stack = err.stack;
          Error.prepareStackTrace = orig;
          
          return stack;
        }
      });
      
    }
    
    if( !window.__file ) {
    
      Object.defineProperty(window, '__file', {
        get: function(){
          return '[[ on: ' +__stack[1].getFileName(); 
        }
      });  
      
    }
    
    if( !window.__line ) {
    
      Object.defineProperty(window, '__line', {
        get: function(){
          return 'line: ' + __stack[1].getLineNumber() + ' ]]'; 
        }
      });  
      
    }
    
  }
  
  
  /**
   * @public
   */
  Elmer.prototype.register = function(funcName) {
    if( _.indexOf( registrations, funcName ) == -1 ) {
      registrations.push(funcName);
      this.name = funcName;
    } else {
      console.info('already registered');
    }
  }
  
  
  /**
   * @public
   */
  Elmer.prototype.log = function() {
    var args, name = this.name;
    if( _.indexOf( registrations, name ) > -1 && !this.inCookie(name) ) {
      args = Array.prototype.splice.call(arguments,0);
      args.unshift('[' + name + ']');
      window.console.on = true;
      window.console.log.apply(console, args);
    }
  };
  
  
  /**
   * @public
   */
  Elmer.prototype.overrideConsole = function() {
    var _log  = window.console.log;
    
    if( !window.console.overriden ) {   
      window.console.log = function(str) {
        if( window.console.on ) {
          window.console.on = false;
          return _log.apply(this, arguments);
        }
      };
      window.console.overriden = true;
    }    
    
  }
  
  
  /**
   * See if funcName is in cookie or not
   * @public
   */
  Elmer.prototype.inCookie = function(funcName) {
    var str = this.getCookie(cookieLabel);
        str.split(',');
  
    return ( _.indexOf( str, funcName ) > -1) ? true : false;
  }
  
  
  /**
   * Enable Elmer. Requires refresh to see it enabled.
   * @public
   */
  Elmer.prototype.enable = function(funcName) {
    var value, cookie = this.getCookie(cookieLabel);
    
    if( typeof funcName == 'undefined' ) {
      value = cookie.replace(' ElmerOff,','');
      this.setCookie(cookieLabel, value);
      registrations.remove('ElmerOff');
    } else {
      this.appendToCookie(funcName);
    }
    
  }
  
  
  /**
   * Disable Elmer. Good for when you need accurate line numbers. 
   * Requires refresh.
   * @private
   */
  Elmer.prototype.disable = function() {
    this.appendToCookie('ElmerOff');
    console.info("Don't forget to refresh the page");
  }


  Elmer.prototype.appendToCookie = function(str) {
    var value   =  'ElmerOff',
        cookie  =  this.getCookie(cookieLabel);
    
    if( !this.inCookie(str) ) {
      cookie += str+',';
      this.setCookie(cookieLabel, value);
      registrations.push(value);
    } else {
      console.warn('value already in cookie');
    }
  }  
  
  
  /**
   * @public 
   * @param {String} name Name of the cookie
   * @param {String} value Value of the cookie
   * @param {String} expire Expiration in days
   */
  Elmer.prototype.setCookie = function (name, value, expire) {
    var exdate, cookiesValue;
    
    exdate = new Date();
    exdate.setDate( exdate.getDate() + expire );
    
    cookiesValue = escape(value) + ((expire==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie = name + "=" + cookiesValue;
  }
  
  
  /**
   * Get the value of the Elmer cookie
   * @public
   */
  Elmer.prototype.getCookie = function () {
    var i,x,y,v, cookies, name = cookieLabel;
    
    cookies = document.cookie.split(";");
    
    for (i=0; i<cookies.length; i++) {
      v = _.indexOf( cookies[i], '=' );
      x = cookies[i].substr( 0, v );
      y = cookies[i].substr( v + 1 );
      x = x.replace(/^\s+|\s+$/g,"");
      
      if(x == name) {
        return unescape(y);
      }
    }
  }
  
  
  /**
   * Get the name given to this instance
   * @public
   */
  Elmer.prototype.getName = function() {
    return this.name;
  }

  
  window.Elmer = Elmer;

})();

/*

TODO:
+ if cookie Elmer.off = true, use default console (elmer.log=console.log) to keep line numbers
+ create override console via a loop for less code
+ enable/disable via hashes

*/