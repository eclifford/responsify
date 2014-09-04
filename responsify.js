/*!
 * Responsify
 * http://github.com/eclifford/responsify
 *
 * Author: Eric Clifford
 * Email: ericgclifford@gmail.com
 * Date: 06.17.2014
 *
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
    version: '0.0.2',

    breakpoints: [
      {
        label: 'break-a',
        device: 'mobile',
        enter: 0,
        exit: 750
      },
      {
        label: 'break-b',
        device: 'tablet',
        enter: 751,
        exit: 970
      },
      {
        label: 'break-c',
        device: 'desktop',
        enter: 971,
        exit: 1170
      },
      {
        label: 'break-d',
        device: 'desktop',
        enter: 1171,
        exit: 1600
      },
      {
        label: 'break-e',
        device: 'desktop',
        enter: 1601,
        exit: 10000
      },
    ],

    activeBreakpoint: null,

    images: [],

    debounceDelay: 300,

    selector: 'img.responsive',

    init: function(config) {
      var self = this;

      // override defaults
      if(config) {
        this.extend(this, config);
      }

      // get the current breakpoint
      this.activeBreakpoint = this.getClosestBreakpoint(window.innerWidth);

      // get all responsive images by selector converting
      this.images = [].slice.call(document.querySelectorAll(this.selector));

      this.processImages(this.images);

      // listen for images added to the DOM
      this.onImageLoaded(function(img) {
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

    // get the closest breakpoint based on the current window width
    getClosestBreakpoint: function(width) {
      // enumerate breakpoints searching for closest breakpoint that is larger
      for(var i = 0; i < this.breakpoints.length; i++) {
        if(width >= this.breakpoints[i].enter && width <= this.breakpoints[i].exit) {
          return this.breakpoints[i];
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

    onBreakpointChange: function(callback) {
      // callbreakpoint
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
              if (typeof node.getElementsByTagName !== 'function') {
                return;
              }
              var imgs = node.getElementsByTagName('img');
              for (var x = 0; x < imgs.length; x++) {
                callback(imgs[x]);
              }
              // if (node.nodeType == 1 && node.tagName == "IMG") {
              //   callback(node);
              // }
            }
          }
        });
      });

      observer.observe(document, {
        childList: true,
        subtree: true
      });
    },

    isDeviceEqualTo: function(device) {
      return false;
      // return this.activeBreakpoint.device === device;
    },

    // Listen for resize events debounced and trigger resize callback
    onResizeEvent: function(callback) {
      window.addEventListener("resize", this.debounce(function() {
        callback();
      }, this.debounceDelay));
    },

    // Simple deep extend with array overwrite
    extend: function(target, source) {
      target = target || {};
      for (var prop in source) {
        if (typeof source[prop] === 'object' && Object.prototype.toString.call(source[prop]) !== '[object Array]') {
          console.log(source[prop]);
          target[prop] = this.extend(target[prop], source[prop]);
        } else {
          target[prop] = source[prop];
        }
      }
      return target;
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
  window.Responsive = {};
  window.Responsive.Breakpoint = {};
  window.Responsive.Breakpoint.isDeviceEqualTo = Responsify.isDeviceEqualTo;
  return Responsify;
}));
