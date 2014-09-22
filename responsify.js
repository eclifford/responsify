/*!
 * Responsify
 * http://github.com/eclifford/responsify
 *
 * Author: Eric Clifford
 * Email: ericgclifford@gmail.com
 * Date: 09.17.2014
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
    version: '0.1.0',

    // default options
    options: {
      debug: false,               // enable console output
      namespace: 'responsify',
      className: 'responsive',    // className to find images
      root: document,             // node for mutation observer to listen on
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
      supportedWidths: [],        // only use if you have limited widths you can support
      supportedPixelDensity: [1, 1.3, 2]
    },

    currentBreakpoint: null,

    images: [],

    events: {},

    // responsify initialize
    // call this once your DOM has been created
    //
    // @param [object] config - override default settings object
    //
    init: function(config) {
      // extend responsify options with passed in configuration
      if(config) this.extend(this.options, config);

      // get the current breakpoint
      this.currentBreakpoint = this.findClosestBreakpoint(window.innerWidth);

      // find and store all responsive images
      this.refreshImages();

      // register all events
      this.setupEvents();

      // handle auto debugging
      if(this.options.debug) this.setupDebug(this);

      // process all images currently in DOM
      this.renderImages(this.images);
    },
    // find all and store all responsive images on the document
    //
    refreshImages: function() {
      // get all responsive images by selector converting
      this.images = [].slice.call(document.getElementsByClassName(this.options.className));
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
      this.addMutationObserver(this.options.root);
    },
    // on a resize event determine if we have entered a new breakpoint and if so
    // notify subscribers and process images
    //
    // @param [int] width - the width of the viewport
    //
    onResizeEvent: function(width) {
      var breakpoint = this.findClosestBreakpoint(width);
      if(breakpoint != this.currentBreakpoint) {
        this.setBreakpoint(breakpoint);
        this.renderImages(this.images);
      }
    },
    // notify breakpoint subscribers of a change
    //
    // @param [object] breakpoint - the breakpoint to make current
    //
    setBreakpoint: function(breakpoint) {
      this.currentBreakpoint = breakpoint;
      this.publish('responsify:breakpoint:change', this.currentBreakpoint);
    },
    // provided the current width of window return the closest matching
    // breakpoint
    //
    // @param [int] width - the width to calculate breakpoint based upon
    //
    findClosestBreakpoint: function(width) {
      for(var i = 0; i < this.options.breakpoints.length; i++) {
        if(width >= this.options.breakpoints[i].enter && width <= this.options.breakpoints[i].exit) {
          return this.options.breakpoints[i];
        }
      }
    },
    isBreakpointEqualTo: function(breakpoint) {
      return breakpoint === currentBreakpoint.label;
    },
    // process all currently stored images
    //
    // @param [Array] images - the images to process
    //
    renderImages: function(images) {
      for(var i = 0; i < images.length; i++) {
        this.renderImage(images[i]);
      }
    },
    // update an images src attribute with base parameters and computed width
    //
    // @param [node] img - the image to process
    //
    renderImage: function(img) {
      var baseURI = img.getAttribute('data-' + this.options.namespace) || "",
          breakpointURI = img.getAttribute("data-" + this.options.namespace + "-" + this.currentBreakpoint.label) || "",
          imageURI = "",
          baseWidth = 0,
          ratio = 1,
          width = 0;

      // build the image url
      imageURI = this.buildImageURI(baseURI, breakpointURI);

      // get parent width
      baseWidth = this.getClosestSupportedWidth(img.parentElement.clientWidth);

      // get supported pixel ratio
      ratio = this.getClosestsSupportedPixelRatio(this.getPixelRatio());

      // computed width based on supported pixel ratio
      width = baseWidth * ratio;

      // interpolate calculated width
      imageURI = imageURI.replace(/{width}/g, width);

      // set image src
      if(img.src !== imageURI) {
        img.src = imageURI;
        img.style.width = baseWidth + 'px';
        this.publish('responsify:image:rendered');
      }
    },
    // calculates closest width by looking at supported widths
    // and returns the closest match without downscaling
    //
    // @param [int] width - the width to calculate from
    //
    getClosestSupportedWidth: function(width) {
      var i = this.options.supportedWidths.length,
          closestWidth = 0;
      if(i === 0)
        return width;
      while(i--) {
        if(width <= this.options.supportedWidths[i]) {
          closestWidth = this.options.supportedWidths[i];
        }
      }
      return closestWidth;
    },
    // return the current supported device pixel ratio
    //
    getPixelRatio: function() {
      return window.devicePixelRatio || 1;
    },
    // based on device pixel ratio find the closest ratio we have
    // image support for
    //
    // @param [int] ratio - the ratio to find closest match for
    //
    getClosestsSupportedPixelRatio: function(ratio) {
      var i = this.options.supportedPixelDensity.length,
          closestRatio = 1;
      while(i--) {
        if(ratio <= this.options.supportedPixelDensity[i])
          closestRatio = this.options.supportedPixelDensity[i];
      }
      return closestRatio;
    },
    // build the image URI based on base plus
    // calculation of breakpointURI
    //
    buildImageURI: function(baseURI, breakpointURI) {
      var uri = "";
      // querystring or path + querystring
      if(breakpointURI.indexOf('?') !== -1) {
        var obj = breakpointURI.split('?');
        uri = this.appendQueryString(baseURI + obj[0], obj[1]);
      }
      // just querystring
      else if(breakpointURI.indexOf('=') !== -1) {
        uri = this.appendQueryString(baseURI, breakpointURI);
      }
      // just path
      else {
        uri = baseURI + breakpointURI;
      }
      return uri;
    },
    // append a query string on to an existing uri cleaning
    // up seperating characters if necessary
    //
    // @param [string] uri - the base URI
    // @param [string] query - the query to append to URI
    //
    appendQueryString: function(uri, query) {
      if(!query) return uri;
      query = query.replace(/^(&|\?)/, '');
      var separator = uri.indexOf('?') !== -1 ? '&' : '?';
      return uri + separator + query;
    },
    // once image is detected by mutation observor we process it
    //
    // @param [node] img - the image that was added to dom
    //
    addImage: function(img) {
      this.images.push(img);
      this.renderImage(img);
    },
    // add each image
    //
    // @param [array[element]] imgs - the images to add
    //
    addImages: function(imgs) {
      for(var i = 0; i < imgs.length; i++) {
        this.addImage(imgs[i]);
      }
    },
    // remove an image from the saved image list
    //
    // @param [element] img - the image the find and remove
    //
    removeImage: function(img) {
      var i = this.images.length;
      while(i--) {
        if(img === this.images[i]) {
          this.images.splice(i, 1);
        }
      }
    },
    // for each provided image call removeImage
    //
    // @param [Array[element]] imgs - the images to remove
    //
    removeImages: function(imgs) {
      for(var i = 0; i < imgs.length; i++) {
        this.removeImage(imgs[i]);
      }
    },
    // mutation observer that listens for new responsive image elements
    // added and removed from the document being watched
    //
    // @param [element] element - the DOM element to observe
    //
    addMutationObserver: function(element) {
      var self = this,
          MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

      var observer = new MutationObserver(function (mutations) {
        var imgs = [];
        for(var mutationIndex = 0; mutationIndex < mutations.length; mutationIndex++) {
          if(mutations[mutationIndex].removedNodes) {
            for(var removedNodeIndex = 0; removedNodeIndex < mutations[mutationIndex].removedNodes.length; removedNodeIndex++) {
              var nodeToRemove = mutations[mutationIndex].removedNodes[removedNodeIndex];
              if(nodeToRemove.className === self.options.className)
                self.removeImage(nodeToRemove);
              else {
                imgs = self.findChildNodesByClass(nodeToRemove, self.options.className);
                self.removeImages(imgs);
              }
            }
          }
          if(mutations[mutationIndex].addedNodes) {
            for(var addedNodeIndex = 0; addedNodeIndex < mutations[mutationIndex].addedNodes.length; addedNodeIndex++) {
              var nodeToAdd = mutations[mutationIndex].addedNodes[addedNodeIndex];
              if(nodeToAdd.className === self.options.className)
                self.addImage(nodeToAdd);
              else {
                imgs = self.findChildNodesByClass(nodeToAdd, self.options.className);
                self.addImages(imgs);
              }
            }
          }
        }
      });

      observer.observe(element, {
        childList: true,
        subtree: true
      });
    },
    // recursively find descendent nodes in non live dom element
    //
    // @param [element] parent - the element to search
    // @param [string] className - the className to searh for
    // @param [Array[element]] els - aggregated found elements
    //
    findChildNodesByClass: function(parent, className, els) {
      var elements = els || [],
          children = parent.childNodes;

      for (var i = 0; i < children.length; i++) {
        if (children[i].className === className)
          elements.push(children[i]);
        else
          this.findChildNodesByClass(children[i], className, elements);
      }

      return elements;
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
      if(!this.events[topic]) {
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
    extend: function(destination, source) {
      for(var prop in source) {
        if(typeof source[prop] === 'object' && Object.prototype.toString.call(source[prop]) !== '[object Array]') {
          destination[prop] = this.extend(destination[prop], source[prop]);
        } else {
          destination[prop] = source[prop];
        }
      }
      return destination;
    },
    // BETA webkit object stack viewer
    //
    // @param [Object] obj - the object to setup logging on
    setupDebug: function(obj) {
      var self = this,
          funcs = Object.getOwnPropertyNames(obj);

      for(var i = 0; i < funcs.length; i++) {
        // we only want functions
        if(typeof obj[funcs[i]] != 'function') continue;

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
