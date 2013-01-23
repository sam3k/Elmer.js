;(function(){
  
  var enabled      =  true,
      registrar    =  [],
      cookieLabel  =  'Elmer',
      offLabel     =  'ElmerOff';
  
  
  /**
   * @constructor
   */
  function Elmer(funcName) {
    
    if( !this.enabled ) {
      return console;  // if disable, act as the regular console. 
    }
      
    fixTraces();     // Try to add back lines if possible
    
    this.name = funcName || 'global'; // should be override by each function that uses it
    
    this.register( this.name );
    this.registerByCookie();
    
    if( !this.isRegister( offLabel ) ) {
      this.overrideConsole();
    }
    
  }
  
  
  Elmer.prototype.enabled = enabled;
  
  
  /**
   * Find out if the label has been registered in the registrar or the cookie
   *
   * @param {String} Label to look for in the cookie or registrar
   */
  Elmer.prototype.isRegister = function( label ) {
    return ( _.indexOf( registrar, label ) > -1 || this.inCookie( label ) ) ? true : false;
  }
  
  
  /**
   * Check cookies to see if new registrar have been made
   * @public 
   */
  Elmer.prototype.registerByCookie = function() {
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
   * Sync up the registrar and cookies
   *
   * @public
   */
  Elmer.prototype.sync = function() {
    var str   =  this.getCookie(),
        sync  =  _.union( str.split(','), registrar );
    
    registrar = sync;
    this.setCookie( sync.join() );
  }
  
  
  /**
   * @public
   */
  Elmer.prototype.register = function(funcName) {
    if( _.indexOf( registrar, funcName ) == -1 ) {
      registrar.push(funcName);
      this.sync();
      this.name = funcName;
    }
  }
  
  
  /**
   * @public
   */
  Elmer.prototype.log = function() {
    var args, name = this.name;

    if( this.isRegister(name) ) {
      args = Array.prototype.splice.call(arguments,0);
      args.unshift('[' + name + ']');
      
      window.console.on = true;
      window.console.log.apply(console, args);
    }
    
  };
  
  
  /**
   * Override default console. This method should dynamically override all console methods instead
   *
   * @public
   * @todo : dynamically override each console method as oppose to one by one 
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
   *
   * @public
   */
  Elmer.prototype.inCookie = function(funcName) {
    var str = this.getCookie(cookieLabel);
        str.split(',');
  
    return ( _.indexOf( str, funcName ) > -1) ? true : false;
  }
  
  
  /**
   * Enable Elmer. Requires refresh to see it enabled.
   *
   * @public
   */
  Elmer.prototype.enable = function(funcName) {
    var value, cookie = this.getCookie(cookieLabel);
    
    if( typeof funcName == 'undefined' ) {
      value = cookie.replace( offLabel+',', '' );  // remove with comma
      value = value.replace( offLabel, '' );       // remove without comma, just in case

      this.setCookie(value);
      registrar = _.without(registrar, offLabel);
    } else {
      this.appendToCookie(funcName);
    }
    
  }
  
  
  /**
   * Disable Elmer. Good for when you need accurate line numbers. 
   *
   * Requires refresh.
   * @private
   */
  Elmer.prototype.disable = function() {
    this.appendToCookie(offLabel);
  }


  Elmer.prototype.appendToCookie = function(str) {
    var cookie  =  this.getCookie(cookieLabel);

    if( !this.inCookie(str) ) {
      cookie += str+',';
      
      this.setCookie(cookie);
      this.register(offLabel);
    }
  }  
  
  
  /**
   * Utility to create/store the Elmer cookie with a value. 
   *
   * @public 
   * @param {String} name Name of the cookie
   * @param {String} value Value of the cookie
   * @param {String} expire Expiration in days
   * @credit W3C Standards 
   */
  Elmer.prototype.setCookie = function (value, expire) {
    var exdate, cookiesValue, name = cookieLabel;
    
    exdate = new Date();
    exdate.setDate( exdate.getDate() + expire );
    
    cookiesValue = escape(value) + ((expire==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie = name + "=" + cookiesValue;
  }
  
  
  /**
   * Utility to get the value of the Elmer cookie
   *
   * @public
   * @credit W3C Standards
   */
  Elmer.prototype.getCookie = function () {
    var i,x,y,v, cookies, name = cookieLabel;
    
    cookies = document.cookie.split(";");
    
    for( i=0; i<cookies.length; i++ ) {
      v = _.indexOf( cookies[i], '=' );
      x = cookies[i].substr( 0, v );
      y = cookies[i].substr( v + 1 );
      x = x.replace(/^\s+|\s+$/g,"");
      
      if( x == name ) {
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
  
  
  Elmer.prototype.getRegistrar = function() {
    return registrar;
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

  
  window.Elmer = Elmer;

})();