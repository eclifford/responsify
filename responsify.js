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
      debug: false,               // enable console output
      namespace: 'responsify',
      selector: 'img.responsive', // query selector to find images
      root: document,             // node for mutation observer to listen on
      dynamicWidth: true,
      breakpoints: [
        {
          label: 'break-a',
          device: 'mobile',
          enter: 0,
          exit: 765
        },
        {
          label: 'break-b',
          device: 'tablet',
          enter: 768,
          exit: 991
        },
        {
          label: 'break-c',
          device: 'desktop',
          enter: 992,
          exit: 1199
        },
        {
          label: 'break-d',
          device: 'desktop',
          enter: 1200,
          exit: 10000
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
      this.activeBreakpoint = this.calculateBreakpoint(window.innerWidth);

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
      window.addEventListener("resize", function() {
        window.requestAnimationFrame(function() {
          self.onResizeEvent(window.innerWidth);
        });
      });

      // setup watcher to listen for future images inserted into DOM
      this.addMutationObserver(this.options.root, this.onImageDetected);
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
      this.processImages(this.images);
    },
    // on a resize event determine if we have entered a new breakpoint and if so
    // notify subscribers and process images
    //
    // @param [int] width - the width of the viewport
    //
    onResizeEvent: function(width) {
      var breakpoint = this.calculateBreakpoint(width);
      if (breakpoint != this.activeBreakpoint) {
        this.activeBreakpoint = breakpoint;
        this.processImages(this.images);
        this.onBreakpointChange();
      }
    },
    // notify breakpoint subscribers of a change
    //
    onBreakpointChange: function() {
      this.publish('responsify:breakpoint:change', this.activeBreakpoint);
    },
    // provided the current width of window return the closest matching
    // breakpoint
    //
    // @param [int] width - the width to calculate breakpoint based upon
    //
    calculateBreakpoint: function(width) {
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
      var baseURI = img.getAttribute('data-' + this.options.namespace) || "";
      var breakpointURI = img.getAttribute("data-" + this.options.namespace + "-" + this.activeBreakpoint.label) || "";

      // build the image url
      var imageURI = this.buildImageURI(baseURI, breakpointURI);

      if (this.options.dynamicWidth) {
        // append dynamic width
        imageURI = this.appendQueryString(imageURI, "wid=" + img.parentElement.clientWidth);
      }

      // set image src
      if (img.src !== imageURI) {
        this.setImageSource(img, imageURI);
        this.publish('responsify:image:loaded');
      }
    },
    // build the image URI based on base plus
    // calculation of breakpointURI
    //
    buildImageURI: function(baseURI, breakpointURI) {
      var uri = "";
      // querystring or path + querystring
      if (breakpointURI.indexOf('?') !== -1) {
        var obj = breakpointURI.split('?');
        uri = this.appendQueryString(baseURI + obj[0], obj[1]);
      }
      // just querystring
      else if (breakpointURI.indexOf('=') !== -1) {
        uri = this.appendQueryString(baseURI, breakpointURI);
      }
      // just path
      else {
        uri = baseURI + breakpointURI;
      }
      return uri;
    },
    // set the src attribute of the provided image
    //
    // @param [node] img - the image to set
    // @param [string] src - the src to set the image to
    //
    setImageSource: function(img, src) {
      img.src = src;
    },
    // append a query string on to an existing uri cleaning
    // up seperating characters if necessary
    //
    // @param [string] uri - the base URI
    // @param [string] query - the query to append to URI
    //
    appendQueryString: function(uri, query) {
      if (!query) return uri;
      query = query.replace(/^(&|\?)/, '');
      var separator = uri.indexOf('?') !== -1 ? '&' : '?';
      return uri + separator + query;
    },
    // mutation observer that listens for new nodes of type IMG
    // once detected trigger callback
    //
    // @param [function] callback - the listener
    //
    addMutationObserver: function(element, callback) {
      var self = this;
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.addedNodes) {
            for (var i = 0; i < mutation.addedNodes.length; i++) {
              var node = mutation.addedNodes[i];
              if (node.nodeType == 1 && node.tagName == "IMG") {
                callback.call(self, node);
              }
              if (node.nodeType == 1 && node.tagName == "DIV") {
                var imgs = node.querySelectorAll(self.options.selector);
                for (var x = 0; x < imgs.length; x++) {
                  callback.call(self, imgs[x]);
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
    }
  };

  // polyfills
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function (callback) { window.setTimeout(callback, 1000 / 60); };

  return Responsify;
}));
