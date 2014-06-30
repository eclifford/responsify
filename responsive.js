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
  - Will require polyfill (https://github.com/Polymer/MutationObservers) for IE9/10
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

    debug: true,

    imagesOffScreen: [],

    images: [{
      node: {},
      visible: true
    }],

    breakpoints: ['480', '768', '1024', '1280', '1440'],

    activeBreakpoint: null,

    init: function() {
      var self = this;
      this.processImages();
      this.onImageMutationEvent(function(node) {
        self.processImage(node);
      });

      this.activeBreakpoint = this.getClosestBreakpoint();

      this.onScrollEvent(function() {
        self.processImages();
      });

      this.onResizeEvent(function() {
        var currentBreakpoint = self.getClosestBreakpoint();
        if (currentBreakpoint != self.activeBreakpoint) {
          self.activeBreakpoint = currentBreakpoint;
          self.processImages();
        }
      });
    },

    getClosestBreakpoint: function() {
      var viewport = window.innerWidth;

      for(var i = 0; i < this.breakpoints.length; i ++) {
        if(viewport <= this.breakpoints[0]) {
          return 0;
        }
        if(viewport <= this.breakpoints[i] && viewport > this.breakpoints[i-1]) {
          return i;
        }
      }
    },

    processImages: function() {
      var images = document.getElementsByClassName('responsive');

      for(var i = 0; i < images.length; i++) {
        this.processImage(images[i]);
      }
    },

    processImage: function(img) {
      if(this.isImageOnScreen(img)) {
        this.log('image processed');
        // get data-src-1
        var src = img.dataset.src;
        var params = img.dataset["src-" + (this.activeBreakpoint + 1)];
        var width = img.parentElement.clientWidth;
        img.src = src + "&wid=" + width;
      }
      // img.src = img.dataset.src += '?resMode=sharp2&wid=' + img.parentElement.clientWidth;
    },

    processVisibleImages: function() {
      var visibleImages = this.images.filter(function(img) {
        return img.visible;
      });

      visibleImages.forEach(function(img) {
        img.element.src = img.element.src += '?resMode=sharp2&wid=' + img.element.parentElement.clientWidth;
      });
    },

    isImageOnScreen: function(element) {
      var elementRect = element.getBoundingClientRect();
      var viewportHeight = document.body.clientHeight;

      if ((elementRect.top >= 0 && elementRect.top <= viewportHeight) || (elementRect.bottom >= 0 && elementRect.bottom <= viewportHeight))
        return true;
      else
        return false;
    },

    onScrollEvent: function(callback) {
      var self = this;
      window.addEventListener("scroll", this.debounce(function() {
        callback();
      }, 500));
    },

    onImageMutationEvent: function(callback) {
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          console.log('mutation');
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

    // Listen for resize events
    onResizeEvent: function(callback) {
      var self = this;
      window.addEventListener("resize", this.debounce(function() {
        self.log('resize event fired');
        callback();
      }, 500));
    },


    log: function(message) {
      if(this.debug) {
        console.log(message);
      }
    },

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
