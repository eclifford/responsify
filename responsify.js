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
    version: '0.0.8',

    // default options
    options: {
      namespace: 'responsify',
      selector: 'img.responsive,div.responsive',
      breakpoints: [
        {
          label: 'break-a',
          enter: 0,
          exit: 765
        },
        {
          label: 'break-b',
          enter: 768,
          exit: 991
        },
        {
          label: 'break-c',
          enter: 992,
          exit: 1199
        },
        {
          label: 'break-d',
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

      // process all images currently in DOM
      this.renderImages(this.images);
    },
    // find all and store all responsive images on the document
    //
    refreshImages: function() {
      // get all responsive images by selector converting
      this.images = [].slice.call(document.querySelectorAll(this.options.selector));
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
    // return whether or not the supplied breakpoint label
    // is the currentBreakpoint
    //
    // @param [string] breakpiont - the label of the breakpoint to test
    //
    isBreakpointEqualTo: function(breakpoint) {
      return breakpoint === this.currentBreakpoint.label;
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
    renderImage: function(el) {
      var baseURI = el.getAttribute('data-' + this.options.namespace) || "",
          breakpointURI = el.getAttribute("data-" + this.options.namespace + "-" + this.currentBreakpoint.label) || "",
          imageURI = "",
          baseWidth = 0,
          baseHeight = 0,
          ratio = 1,
          width = 0,
          height = 0;

      // combine baseURI and breakpoint data
      imageURI = this.buildImageURI(baseURI, breakpointURI);

      // dynamically calculate width
      if(imageURI.match(/{width}/g)) {
        baseWidth = this.getClosestSupportedWidth(el.parentElement.clientWidth);
        ratio = this.getClosestsSupportedPixelRatio(this.getPixelRatio());
        width = baseWidth * ratio;
        imageURI = imageURI.replace(/{width}/g, width);
      }

      if(el.nodeName.toLowerCase() === 'img') {
        if(el.src !== imageURI) {
          el.src = imageURI;
          this.publish('responsify:image:rendered', el);
        }
      } else {
        el.style.backgroundImage = "url('" + imageURI + "')";
        el.style.backgroundSize = "cover";
        this.publish('responsify:image:rendered', el);
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
    }
  };

  // polyfills
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function (callback) { window.setTimeout(callback, 1000 / 60); };

  return Responsify;
}));
