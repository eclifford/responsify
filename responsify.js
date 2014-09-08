/*!
 * Responsify
 * http://github.com/eclifford/responsify
 *
 * Author: Eric Clifford
 * Email: ericgclifford@gmail.com
 * Date: 09.04.2014
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
    version: '0.0.3',

    // default options
    options: {
      debug: false,                // enable console output
      selector: 'img.responsive', // query selector to find images
      root: document,             // node for mutation observer to listen on
      debounceDelay: 300,         // how often to query events
      breakpoints: [
        {
          label: 'break-a',
          device: 'mobile',
          enter: 0,
          exit: 479
        },
        {
          label: 'break-b',
          device: 'tablet',
          enter: 480,
          exit: 767
        },
        {
          label: 'break-c',
          device: 'desktop',
          enter: 768,
          exit: 1023
        },
        {
          label: 'break-d',
          device: 'desktop',
          enter: 1024,
          exit: 1279
        },
        {
          label: 'break-e',
          device: 'desktop',
          enter: 1280,
          exit: 1439
        },
        {
          label: 'break-f',
          device: 'desktop',
          enter: 1440,
          exit: 100000
        }
      ],
    },

    activeBreakpoint: null,

    images: [],

    events: {},

    // responsify initialize
    // call this once your DOM has been created
    //
    // @param [object] config - override default settings object
    //
    init: function(config) {
      // override default options
      if (config) this.extend(this.options, config);

      // get the current breakpoint
      this.activeBreakpoint = this.getClosestBreakpoint(window.innerWidth);

      // get all responsive images by selector converting
      this.images = [].slice.call(document.querySelectorAll(this.options.selector));

      // register all events
      this.setupEvents();

      // handle auto debugging
      if(this.options.debug) this.setupDebug(this);

      // process all images currently in DOM
      this.processImages(this.images);
    },
    // setup DOM and custom events
    //
    setupEvents: function() {
      var self = this;

      window.addEventListener("resize", this.debounce(function() {
        self.onResizeEvent(window.innerWidth);
      }, this.options.debounceDelay));

      // window.addEventListener("scroll", this.debounce(function() {
      //   self.onScrollEvent();
      // }, this.options.debounceDelay));

      // setup watcher to listen for future images inserted into DOM
      this.setupMutationObserver(this.options.root, function(img) {
        self.onImageDetected(img);
      });
    },
    // once image is detected by mutation observor we process it
    //
    // @param [node] img - the image that was added to dom
    //
    onImageDetected: function(img) {
      this.images.push(img);
      this.processImage(img);
    },
    // listen for scroll event and process images
    //
    onScrollEvent: function() {
      this.processImages();
    },
    // on a resize event determine if we have entered a new breakpoint and if so
    // notify subscribers and process images
    //
    // FIXME: should probably only process images if breakpoint is greater than
    // previous
    //
    onResizeEvent: function(width) {
      var currentBreakpoint = this.getClosestBreakpoint(width);
      if (currentBreakpoint != this.activeBreakpoint) {
        this.publish('breakpoint:change', currentBreakpoint);
        this.activeBreakpoint = currentBreakpoint;
        this.processImages(this.images);
      }
    },
    // provided the current width of window return the closest matching
    // breakpoint
    //
    // @param [int] width - the width to calculate breakpoint based upon
    //
    getClosestBreakpoint: function(width) {
      // enumerate breakpoints searching for closest breakpoint that is larger
      for (var i = 0; i < this.options.breakpoints.length; i++) {
        if (width >= this.options.breakpoints[i].enter && width <= this.options.breakpoints[i].exit) {
          return this.options.breakpoints[i];
        }
      }
    },
    // process all currently stored images
    //
    // @param [Array] images - the images to process
    //
    processImages: function(images) {
      for(var i = 0; i < images.length; i++) {
        this.processImage(images[i]);
      }
    },
    // update an images src attribute with base parameters and computed width
    //
    // @param [node] img - the image to process
    //
    processImage: function(img) {
      if (!this.isImageOnScreen(img)) return;

      var src = img.dataset.src;
      var params = this.parseQueryStringToObj(img.getAttribute("data-url-params-" + this.activeBreakpoint.label));

      // append params
      for(var param in params) {
        src = this.addUpdateQueryStringParameter(src, param, params[param]);
      }

      // add computed width
      src = this.addUpdateQueryStringParameter(src, "wid", img.parentElement.clientWidth);

      // finally assign the updated src if it has changed
      if (img.src !== src) {
        this.setImageSource(img, src);
      }
    },
    // set the src attribute of the provided image
    //
    // @param [node] img - the image to set
    // @param [string] src - the src to set the image to
    //
    setImageSource: function(img, src) {
      img.src = src;
    },
    // given a uri add or update an existing querystring with the
    // provided key and value
    //
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
    // detect whether or not a dom element is within the viewport
    //
    // @param [node] element - element to test
    //
    isImageOnScreen: function(element) {
      var elementRect = element.getBoundingClientRect();
      var viewportHeight = document.body.clientHeight;

      if ((elementRect.top >= 0 && elementRect.top <= viewportHeight) || (elementRect.bottom >= 0 && elementRect.bottom <= viewportHeight))
        return true;
      else
        return false;
    },
    // mutation observer that listens for new nodes of type IMG
    // once detected trigger callback
    //
    // @param [function] callback - the listener
    //
    setupMutationObserver: function(element, callback) {
      var self = this;
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.addedNodes) {
            for (var i = 0; i < mutation.addedNodes.length; i++) {
              var node = mutation.addedNodes[i];
              if (node.nodeType == 1 && node.tagName == "IMG") {
                callback(node);
              }
              if (node.nodeType == 1 && node.tagName == "DIV") {
                var imgs = node.querySelectorAll(self.options.selector);
                for (var x = 0; x < imgs.length; x++) {
                  callback(imgs[x]);
                }
              }
            }
          }
        });
      });

      observer.observe(element, {
        childList: true,
        subtree: true
      });
    },
    // simple publish method used internally to notify subscribers
    //
    // @param topic - the topic to publish on
    //
    publish: function(topic) {
      var subs = this.events[topic],
      len = subs ? subs.length : 0,
      args = [].slice.call(arguments, 1);

      //can change loop or reverse array if the order matters
      while (len--) {
        subs[len].callback.apply(subs[len].context, args);
      }
    },
    // simple subscribe method for responsify subscribers
    // to be notified of internal changes
    //
    // @param topic - the topic to subscribe to
    // @param callback - the callback to execute
    // @param context - the context in which to execute the callback
    //
    on: function(topic, callback, context) {
      if (!this.events[topic]) {
        this.events[topic] = [];
      }
      this.events[topic].push({
        callback: callback,
        context: context || this
      });
    },
    // Simple deep extend with array overwrite
    //
    // @param [Object] target - the target object to extend
    // @param [Array] source - an array of object to extend the target with
    //
    extend: function(target, source) {
      target = target || {};
      for (var prop in source) {
        if (typeof source[prop] === 'object' && Object.prototype.toString.call(source[prop]) !== '[object Array]') {
          target[prop] = this.extend(target[prop], source[prop]);
        } else {
          target[prop] = source[prop];
        }
      }
      return target;
    },
    // find every method on in the library and append some automatic console
    // output before and after execution
    //
    // @param [Object] obj - the object to setup logging on
    setupDebug: function(obj) {
      var self = this,
      funcs = Object.getOwnPropertyNames(obj);

      for (var i = 0; i < funcs.length; i++) {
        // we only want functions
        if (typeof obj[funcs[i]] != 'function') continue;

        /*jshint -W083 */
        (function (key) {
          // store original function
          var func = obj[funcs[key]];
          // proxy original request through custom console messaging
          obj[funcs[key]] = function () {
            console.groupCollapsed("Responsify: %s", funcs[key], [].slice.call(arguments));
            console.time('time');
            var value = func.apply(self, arguments);
            console.timeEnd('time');
            console.groupEnd();
            return value;
          };
        }(i));
      }
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
