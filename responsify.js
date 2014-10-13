/*!
 * Responsify
 * http://github.com/eclifford/responsify
 *
 * Author: Eric Clifford
 * Email: ericgclifford@gmail.com
 * Date: 10.10.2014
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

    /**
     * Initialize Responsify
     *
     * @example
     *     Responsify.init()
     *
     * @param {Object} config the configuration object to override defaults
     * @api public
     */
    init: function(config) {
      // extend responsify options with passed in configuration
      if (config) this.extend(this.options, config);

      // get the current breakpoint
      this.currentBreakpoint = this.findClosestBreakpoint(window.innerWidth);

      // find and store all responsive images
      this.refreshImages();

      // register all events
      this.setupEvents();

      // process all images currently in DOM
      this.renderImages(this.images);
    },
    /**
     * Setup event handlers for Responsify lifecycle
     *
     * @example
     *     Responsify.setupEvents()
     *
     * @api public
     */
    setupEvents: function() {
      var self = this;
      window.addEventListener("resize", function() {
        window.requestAnimationFrame(function() {
          self.onResizeEvent(window.innerWidth);
        });
      });
    },
    /**
     * Find all images on the DOM that match selector and store them
     *
     * @example
     *     Responsify.refreshImages()
     *
     * @api public
     */
    refreshImages: function() {
      this.images = [].slice.call(document.querySelectorAll(this.options.selector));
    },
    /**
     * Upon resize test for breakpoint change and re-render images
     *
     * @example
     *     Responsify.onResizeEvent(100)
     *
     * @param {Number} width the width of the current window
     * @api public
     */
    onResizeEvent: function(width) {
      var breakpoint = null;

      if (isNaN(width))
        throw Error("Responsify.onResizeEvent(): expects parameter width of type Number");

      breakpoint = this.findClosestBreakpoint(width);
      if (breakpoint != this.currentBreakpoint) {
        this.setBreakpoint(breakpoint);
        this.renderImages(this.images);
      }
    },
    /**
     * Set the current active breakpoint to the one supplied
     *
     * @example
     *     Responsify.setBreakpoint({Object})
     *
     * @param {Object} breakpoint the breakpoint to set
     * @api public
     */
    setBreakpoint: function(breakpoint) {
      if (typeof breakpoint !== 'object')
        throw new Error("Responsify.setBreakpoint(): expects parameter breakpoint of type Object");

      this.currentBreakpoint = breakpoint;
      this.publish('responsify:breakpoint:change', this.currentBreakpoint);
    },
    /**
     * Return the closest breakpoint for the supplied width
     *
     * @example
     *     Responsify.findClosestBreakpoint(100)
     *
     * @param {Number} width the width to test for a breakpoint
     * @return {Object} the breakpoint that matches supplied width
     * @api public
     */
    findClosestBreakpoint: function(width) {
      if (isNaN(width))
        throw new Error("Responsify.findClosestBreakpoint(): expects parameter width of type Number");

      for (var i = 0; i < this.options.breakpoints.length; i++) {
        if (width >= this.options.breakpoints[i].enter && width <= this.options.breakpoints[i].exit) {
          return this.options.breakpoints[i];
        }
      }
    },
    /**
     * Return whether or not the supplied breakpoint is current
     *
     * @example
     *     Responsify.isBreakpointEqualTo('break-a')
     *
     * @param {String} breakpoint the breakpoint label to test
     * @return {Boolean} whether or not the breakpoint is active
     * @api public
     */
    isBreakpointEqualTo: function(breakpoint) {
      if (typeof breakpoint !== 'string')
        throw new Error("Responsify.isBreakpointEqualTo(): expects parameter breakpoint of type String");

      return breakpoint === this.currentBreakpoint.label;
    },
    /**
     * Return whether or not the supplied HTMLElement is visible or not
     *
     * @example
     *     Responsify.isElementVisible(<HTMLElement>)
     *
     * @param {HTMLElement} images the images to render
     * @return {Boolean} whether or not the element is visible
     * @api public
     */
    isElementVisible: function(el) {
      if (!(el && el instanceof HTMLElement))
        throw new Error("Responsify.isElementVisible(): expects parameter el of type HTMLElement");

      return el.parentElement.offsetWidth > 0 && el.parentElement.offsetHeight > 0;
    },
    /**
     * Render an Array or NodeList of images that are visible
     *
     * @example
     *     Responsify.renderImages([<HTMLElement>])
     *
     * @param {Array|NodeList} images the images to render
     * @api public
     */
    renderImages: function(images) {
      if (!images)
        throw new Error("Responsify.renderImages(): expects parameter images of type Array or NodeList");

      for (var i = 0; i < images.length; i++) {
        if (this.isElementVisible(images[i]))
          this.renderImage(images[i]);
      }
    },
    /**
     * Render an image or background div
     *
     * @example
     *     Responsify.renderImage(<HTMLElement>)
     *
     * @param {HTMLElement} el the element to render
     * @api public
     */
    renderImage: function(el) {
      var baseURI = "",
          breakpointURI = "",
          imageURI = "",
          baseWidth = 0,
          baseHeight = 0,
          ratio = 1,
          width = 0,
          height = 0;

      if (!(el && el instanceof HTMLElement))
        throw new Error("Responsify.renderImage(): expects parameter el of type HTMLElement");

      // read in base URI and current breakpoint URI from data attributes
      baseURI = el.getAttribute('data-' + this.options.namespace) || "";
      breakpointURI = el.getAttribute("data-" + this.options.namespace + "-" + this.currentBreakpoint.label) || "";

      // combine baseURI and breakpoint data
      imageURI = this.buildImageURI(baseURI, breakpointURI);

      // dynamically calculate width
      if (imageURI.match(/{width}/g)) {
        baseWidth = this.getClosestSupportedWidth(el.parentElement.clientWidth);
        ratio = this.getClosestSupportedPixelRatio(this.getPixelRatio());
        width = baseWidth * ratio;
        imageURI = imageURI.replace(/{width}/g, width);
      }

      // render image or background image div
      if(el.nodeName.toLowerCase() === 'img') {
        if(el.src !== imageURI)
          el.src = imageURI;
      } else {
        el.style.backgroundImage = "url('" + imageURI + "')";
        el.style.backgroundSize = "cover";
      }

      // notify subscribers
      this.publish('responsify:image:rendered', el);
    },
    /**
     * Find closest supported matching width
     *
     * @example
     *     Responsify.getClosestSupportedWidth(120)
     *
     * @param {Number} width the width to test
     * @return {Number} the closest supported width
     * @api public
     */
    getClosestSupportedWidth: function(width) {
      var i = this.options.supportedWidths.length,
          closestWidth = 0;

      if (isNaN(width))
        throw new Error("Responsify.getClosestSupportedWidth(): expects parameter width of type Number");

      if (i === 0)
        return width;

      while (i--) {
        if(width <= this.options.supportedWidths[i]) {
          closestWidth = this.options.supportedWidths[i];
        }
      }
      return closestWidth;
    },
    /**
     * Query the window object for the current devices pixel ratio
     *
     * @example
     *     Responsify.getPixelRatio()
     *
     * @return {Number} the closest supported device pixel ratio
     * @api public
     */
    getPixelRatio: function() {
      return window.devicePixelRatio || 1;
    },
    /**
     * Determine closest supported pixel ratio
     *
     * @example
     *     Responsify.getClosestSupportedPixelRatio(1)
     *
     * @param {Number} ratio the ratio to test
     * @return {Number} the closest supported ratio
     * @api public
     */
    getClosestSupportedPixelRatio: function(ratio) {
      var i = this.options.supportedPixelDensity.length,
          closestRatio = 1;

      if (isNaN(ratio))
        throw new Error("Responsify.getClosestSupportedPixelRatio(): expects parameter ratio of type Number");

      while (i--) {
        if (ratio <= this.options.supportedPixelDensity[i])
          closestRatio = this.options.supportedPixelDensity[i];
      }
      return closestRatio;
    },
    /**
     * Combine baseURI with current breakpoint parameters
     *
     * @example
     *     Responsify.buildImageURI("http://www.test.com", "?foo=test")
     *
     * @param {String} baseURI the base uri
     * @param {String} breakpointURI the breakpoint uri to append
     * @return {String} the built uri
     * @api public
     */
    buildImageURI: function(baseURI, breakpointURI) {
      var uri = "",
          obj = {};

      if (typeof baseURI !== 'string')
        throw new Error("Responsify.buildImageURI(): expects parameter baseURI of type String");

      if (typeof breakpointURI !== 'string')
        throw new Error("Responsify.buildImageURI(): expects parameter breakpointURI of type String");

      // querystring or path + querystring
      if (breakpointURI.indexOf('?') !== -1) {
        obj = breakpointURI.split('?');
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
    /**
     * Append query string to passed base URI
     *
     * @example
     *     Responsify.appendQueryString("http://www.test.com", "?foo=test")
     *
     * @param {String} uri the base uri
     * @param {String} query the querystring to add
     * @return {String} the built uri
     * @api public
     */
    appendQueryString: function(uri, query) {
      var seperator;

      if (typeof uri !== 'string')
        throw new Error("Responsify.appendQueryString(): expects parameter uri of type String");

      if (!query)
        return uri;

      query = query.replace(/^(&|\?)/, '');
      seperator = uri.indexOf('?') !== -1 ? '&' : '?';
      return uri + seperator + query;
    },
    /**
     * Add an image to internal managed array
     *
     * @example
     *     Responsify.addImage(<img>)
     *
     * @param {HTMLElement} img the image to add
     * @api public
     */
    addImage: function(img) {
      if (!(img && img instanceof HTMLElement))
        throw new Error("Responsify.addImage(): expects parameter img of type HTMLElement");

      this.images.push(img);
      this.renderImage(img);
    },
    /**
     * Add an array of images to internal managed array
     *
     * @example
     *     Responsify.addImages([<img>, <img>])
     *
     * @param {Array} imgs the images to add
     * @api public
     */
    addImages: function(imgs) {
      if (toString.call(imgs) !== "[object NodeList]")
        throw new Error("Responsify.addImages(): expects parameter imgs of type NodeList");

      for(var i = 0; i < imgs.length; i++) {
        this.addImage(imgs[i]);
      }
    },
    /**
     * Remove supplied image from internal managed array
     *
     * @example
     *     Responsify.removeImage(<img>)
     *
     * @param {HTMLElement} img the image to remove
     * @api public
     */
    removeImage: function(img) {
      if (!(img && img instanceof HTMLElement))
        throw new Error("Responsify.removeImages(): expects parameter img of type HTMLElement");

      var i = this.images.length;
      while (i--) {
        if (img === this.images[i]) {
          this.images.splice(i, 1);
        }
      }
    },
    /**
     * Remove images from internal managed array
     *
     * @example
     *     Responsify.removeImages([<img>,<img>])
     *
     * @param {Array} imgs the images to remove
     * @api public
     */
    removeImages: function(imgs) {
      if (toString.call(imgs) !== "[object NodeList]")
        throw new Error("Responsify.removeImages(): expects parameter imgs of type NodeList");

      for (var i = 0; i < imgs.length; i++) {
        this.removeImage(imgs[i]);
      }
    },
    /**
     * Simple publish method for notifing subscribers of an event
     *
     * @example
     *     Responsify.publish('event:name');
     *
     * @param {String} topic the topic to publish
     * @api public
     */
    publish: function(topic) {
      var subs, len;

      if (typeof topic !== 'string')
        throw new Error("Responsify.publish(): expects parameter topic of type String");

      subs = this.events[topic];
      len = subs ? subs.length : 0;

      //can change loop or reverse array if the order matters
      while (len--) {
        subs[len].handler.apply(subs[len].context, [].slice.call(arguments, 1));
      }
    },
    /**
     * Simple subscribe method for adding handlers to event topics.
     *
     * @example
     *     var handler = function() {};
     *     Responsify.on('event:name', handler);
     *
     * @param {String} topic the topic to remove handler from
     * @param {Function} handler the function to remove
     * @param {Object} context the context of `this` in which the handler should execute
     * @api public
     */
    on: function(topic, handler, context) {
      if (typeof topic !== 'string')
        throw new Error("Responsify.on(): expects parameter topic of type String");

      if (typeof handler !== 'function')
        throw new Error("Responsify.on(): expects parameter handler to of type Function");

      if (!this.events[topic]) {
        this.events[topic] = [];
      }
      this.events[topic].push({
        handler: handler,
        context: context || this
      });
    },
    /**
     * Simple unsubscribe method for removing subscribers by stored handler from
     * internal events hash.
     *
     * @example
     *     var handler = function() {};
     *     Responsify.off('event:name', handler);
     *
     * @param {String} topic the topic to remove handler from
     * @param {Function} handler the function to remove
     * @api public
     */
    off: function(topic, handler) {
      var i = 0;

      if (typeof topic !== 'string')
        throw new Error("Responsify.off(): expects parameter topic of type String");

      if (typeof handler !== 'function')
        throw new TypeError("Responsify.off(): expects parameter handler of type Function");

      if (this.events[topic]) {
        i = this.events[topic].length;

        while (i--) {
          if (!handler || this.events[topic][i].handler === handler) {
            this.events[topic].splice(i, 1);
          }
        }
      }
    },
    /**
     * Extend the destination object by coping over all properties recursively from
     * source object.
     *
     * @example
     *     Responsify.extend({ foo: 'bar'}, { baz: 'woz'});
     *     // => { foo: 'bar', baz: 'woz' }
     *
     * @param {Object} destination object to extend to
     * @param {Object} source object to extend from
     * @return {Object} the extended destination object
     * @api public
     */
    extend: function(destination, source) {
      if (typeof destination !== 'object')
        throw new Error("Responsify.extend(): expects parameter destination of type Object");

      if (typeof source !== 'object')
        throw new Error("Responsify.extend(): expects parameter source of type Object");

      // copy over all properties from source object to destination object
      for (var prop in source) {
        // if property is an object but not an array recursively copy
        if (typeof source[prop] === 'object' && Object.prototype.toString.call(source[prop]) !== '[object Array]') {
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
