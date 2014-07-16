/*
  Responsify
  - don't block me bro ('don't require this script to be a blocking script in the head')
  - don't require third party libs (jQuery, ImagesLoaded, Underscore)
  - detect resize (debounced) and use crop parameters to select appropriate images for breakpoint
  - responsive images are the size of their containing elements
  - images added to dom post page load should be detected and rendered properly
  - images not currently visible in viewport should not be rendered
  - detect scroll (debounced) detect newly visible images and rendered them properly
  - image elements will use data-src-n approach for query parameter and will use src attribute
  for default low res versions of images
  - Will require polyfill (https://github.com/Polymer/MutationObservers) for IE10
*/
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], function() {
      return (root.Responsify = factory(root));
    });
  } else if (typeof exports !== 'undefined') {
    module.exports = factory(root);
  } else {
    root.Responsify = factory(root);
  }
}(this, function(root) {
  'use strict';

  var Responsify = {
    version: '0.0.1',

    breakpoints: ['750', '970', '1170', '1600'],

    activeBreakpoint: null,

    images: [],

    debounceDelay: 300,

    selector: 'img.responsive',

    init: function(config) {
      var self = this;

      // override defaults
      if(config) {
        this.setConfig(config);
      }

      // get the current breakpoint
      this.activeBreakpoint = this.getClosestBreakpoint();

      // get images
      this.images = document.getElementsByClassName('responsive');

      this.processImages(this.images);

      // listen for images added to the DOM
      this.onImageLoaded(function(img) {
        // store image
        self.images.push(img);

        // if image is visible render it
        if (self.isImageOnScreen(img)) {
          self.processImage(img);
        }
      });

      // on debounced scroll event process
      // all newly visible images
      this.onScrollEvent(function() {
        self.processImages(self.images);
      });

      // on debounced resize event process
      // all images if a breakpoint change has occurred
      this.onResizeEvent(function() {
        var currentBreakpoint = self.getClosestBreakpoint();
        if (currentBreakpoint != self.activeBreakpoint) {
          self.activeBreakpoint = currentBreakpoint;
          self.processImages(self.images);
        }
      });
    },

    setConfig: function(config) {
      if(config.breakpoints !== 'undefined' && config.breakpoints !== null) {
        this.breakpoints = config.breakpoints;
      }
    },

    // get the closest breakpoint based on the current window width
    getClosestBreakpoint: function() {
      var viewport = window.innerWidth;

      // if the window is smaller than the our smallest breakpoint
      if(viewport <= this.breakpoints[0]) {
        return 0;
      }

      // if the window is larger than our largest breakpoint
      if(viewport >= this.breakpoints[this.breakpoints.length-1]) {
        return this.breakpoints.length - 1;
      }

      // enumerate breakpoints searching for closest breakpoint that is larger
      for(var i = 0; i < this.breakpoints.length; i++) {
        if(viewport <= this.breakpoints[i] && viewport > this.breakpoints[i-1]) {
          return i + 1;
        }
      }
    },

    // enumerate all the images and process those that are visible
    processImages: function(images) {
      for(var i = 0; i < images.length; i++) {
        if(this.isImageOnScreen(images[i])) {
          this.processImage(images[i]);
        }
      }
    },

    // given a uri add or update an existing querystring with the
    // provided key and value
    addUpdateQueryStringParameter: function(uri, key, value) {
      var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
      var separator = uri.indexOf('?') !== -1 ? "&" : "?";
      if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
      }
      else {
        return uri + separator + key + "=" + value;
      }
    },

    // convert the parameterized part of a URI into an object
    parseQueryStringToObj: function(uri) {
      var obj = {};
      if(!uri) return {};
      uri.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) { obj[$1] = $3; }
      );
      return obj;
    },

    // update an images src attribute with base parameters and computed width
    processImage: function(img) {
      var src = img.dataset.src;
      var params = this.parseQueryStringToObj(img.dataset["src-" + (this.activeBreakpoint + 1)]);

      // append params
      for(var param in params) {
        src = this.addUpdateQueryStringParameter(src, param, params[param]);
      }

      // add computer width
      src = this.addUpdateQueryStringParameter(src, "wid", img.parentElement.clientWidth);

      // finally assign the updated src if it has changed
      if(img.src !== src) {
        img.src = src;
      }
    },

    // detect whether or not a dom element is within the viewport
    isImageOnScreen: function(element) {
      var elementRect = element.getBoundingClientRect();
      var viewportHeight = document.body.clientHeight;

      if ((elementRect.top >= 0 && elementRect.top <= viewportHeight) || (elementRect.bottom >= 0 && elementRect.bottom <= viewportHeight))
        return true;
      else
        return false;
    },

    // listen for scroll events debounced and trigger callback
    onScrollEvent: function(callback) {
      window.addEventListener("scroll", this.debounce(function() {
        callback();
      }, this.debounceDelay));
    },

    // mutation observer that listens for new nodes of type IMG
    // once detected trigger callback
    onImageLoaded: function(callback) {
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.addedNodes) {
            for (var i = 0; i < mutation.addedNodes.length; i++) {
              var node = mutation.addedNodes[i];
              if (node.nodeType == 1 && node.tagName == "IMG") {
                callback(node);
              }
            }
          }
        });
      });

      observer.observe(document, {
        childList: true,
        subtree: true
      });
    },

    // Listen for resize events debounced and trigger resize callback
    onResizeEvent: function(callback) {
      window.addEventListener("resize", this.debounce(function() {
        callback();
      }, this.debounceDelay));
    },

    // underscore.js debounce method
    debounce: function(func, wait, immediate) {
      var timeout, args, context, timestamp, result;

      var later = function() {
        var last = Date.now - timestamp;
        if (last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) {
            result = func.apply(context, args);
            context = args = null;
          }
        }
      };

      return function() {
        context = this;
        args = arguments;
        timestamp = Date.now;
        var callNow = immediate && !timeout;
        if (!timeout) {
          timeout = setTimeout(later, wait);
        }
        if (callNow) {
          result = func.apply(context, args);
          context = args = null;
        }

        return result;
      };
    }
  };

  return Responsify;
}));
