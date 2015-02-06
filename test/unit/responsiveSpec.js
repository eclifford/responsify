/*jshint -W030 */
describe("responsify", function() {
  before(function() {
    $(document.body).append("<div id='fixture'></div>");
  });

  beforeEach(function(done) {
    $('#fixture').load('base/test/fixtures/images.html', function() {
      Responsify.resetImages();
      done();
    });
    Responsify.currentBreakpoint = Responsify.options.breakpoints[0];
  });

  afterEach(function() {
    $('#fixture').empty();
  });

  describe("init()", function() {
    var mock;
    before(function() {
      mock = sinon.mock(Responsify);
    });
    after(function() {
      mock.restore();
    });
    it("should process options propertly", function() {
      mock.expects("extend").once();
      mock.expects("findClosestBreakpoint").once();
      mock.expects("setupEvents").once();

      Responsify.init({
        selector: 'img.res'
      });

      mock.verify();
    });
  });

  describe("setupDefaultInterpolations()", function() {
    it("should calculate {width} properly", function() {
      var img = document.getElementById('a');
      var width = Responsify.interpolations.width(img);
      expect(width).to.equal(500);
    });
    it("should calculate {landscape} properly", function() {
      var img = document.getElementById('a');
      var width = Responsify.interpolations.landscape(img);
      expect(width).to.equal(282);
    });
  });

  describe("setupEvents()", function() {
    var clock, stub;

    before(function() {
      Responsify.setupEvents();
      clock = sinon.useFakeTimers();
    });
    after(function() {
      clock.restore();
    });
    it("should listen for resize event and trigger onResizeEvent", function() {
      var stub = sinon.stub(Responsify, "onResizeEvent");
      // HACK: polyfill for phantomJS https://github.com/ariya/phantomjs/issues/11289
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent('resize', false, false, null);
      window.dispatchEvent(evt);
      clock.tick(100);
      expect(stub).to.have.been.called;
      stub.restore();
    });
  });

  describe("onResizeEvent()", function() {
    beforeEach(function() {
      // set breakpoint to A
      Responsify.currentBreakpoint = Responsify.options.breakpoints[0];
    });

    it("should throw on invalid parameters", function() {
      expect(function() {
        Responsify.onResizeEvent('a');
      }).to.throw();
    });

    it("should emit a breakpoint:change event upon breakpoint change", function() {
      var spy = sinon.spy();
      Responsify.on('responsify:breakpoint:change', spy);
      Responsify.onResizeEvent(1200);
      expect(spy).to.have.been.called;
    });

    it("should not emit an event if breakpoint does not change", function() {
      var spy = sinon.spy();
      Responsify.on('responsify:breakpoint:change', spy);
      Responsify.onResizeEvent(0);
      expect(spy).not.to.have.been.called;
    });

  });

  describe("setBreakpoint()", function() {
    it("should throw on invalid parameters", function() {
      expect(function() {
        Responsify.setBreakpoint();
      }).to.throw();
    });
  });

  describe("findClosestBreakpoint()", function() {
    it("should throw on invalid parameters", function() {
      expect(function() {
        Responsify.findClosestBreakpoint('a');
      }).to.throw();
    });

    it("should be able to determine appropriate breakpoint based on provided width", function() {
      var breakpoint = Responsify.findClosestBreakpoint(0);
      expect(breakpoint.label).to.equal('break-a');

      breakpoint = Responsify.findClosestBreakpoint(771);
      expect(breakpoint.label).to.equal('break-b');

      breakpoint = Responsify.findClosestBreakpoint(1170);
      expect(breakpoint.label).to.equal('break-c');
    });
  });

  describe("isBreakpointEqualTo()", function() {
    it("should throw on invalid parameters", function() {
      expect(function() {
        Responsify.isBreakpointEqualTo(1);
      }).to.throw();
    });
    it("should return true if testing current breakpoint", function() {
      expect(Responsify.isBreakpointEqualTo('break-a')).to.equal.true;
    });
  });

  describe("isElementVisible()", function() {
    it("should throw on invalid parameters", function() {
      expect(function() {
        Responsify.isElementVisible();
      }).to.throw();
    });
  });

  describe("renderImages()", function() {
    it("should throw on invalid parameters", function() {
      expect(function() {
        Responsify.renderImages();
      }).to.throw();
    });
    it("should call renderImage on all images", function() {
      var stub = sinon.stub(Responsify, "renderImage");
      var imgs = document.getElementsByClassName('responsive');
      Responsify.renderImages(imgs);
      expect(stub).to.have.been.callCount(4);
      stub.restore();
    });
  });

  describe("renderImage()", function() {
    it("should throw on invalid parameters", function() {
      expect(function() {
        Responsify.renderImage({});
      }).to.throw();
    });

    it("should render an image that is visible", function() {
      var img = document.getElementById('a');
      Responsify.renderImage(img);
    });

    it("should not render an invisible image", function() {
      var img = document.getElementById('c');
      var rendered = Responsify.renderImage(img);
      expect(rendered).to.equal(false);
    });

    it("should not render downscaled image", function() {
      // render at 500px
      var img = document.getElementById('e');
      var rendered = Responsify.renderImage(img);
      expect(rendered).to.equal(true);

      // attempt render again at 300px
      var container = document.getElementById('container');
      container.style.width = "300px";
      rendered = Responsify.renderImage(img);
      expect(rendered).to.equal(false);
    });
  });

  describe("isElementToBeDownscaled()", function() {
    it("should downscale a smaller requested image", function() {
      var img = document.getElementById('e');
      var container = document.getElementById('container');
      Responsify.renderImage(img); // rendered at 500px
      container.style.width = "300px";

      var downscale = Responsify.isElementToBeDownscaled(img);
      expect(downscale).to.equal(true);
    });
  });

  describe("getURLInterpolationsForElement()", function() {
    it("should interpolate {width} correctly on given url", function() {
      var img = document.getElementById('a');
      var result = Responsify.getURLInterpolationsForElement('http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1?resMode=sharp2&qlt=85&wid={width}', img);
      expect(result).to.equal('http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1?resMode=sharp2&qlt=85&wid=500');
    });
  });

  describe("buildImageURI()", function() {
    it("should throw on invalid parameters", function() {
      expect(function() {
        Responsify.buildImageURI();
      }).to.throw();
      expect(function() {
        Responsify.buildImageURI('http://www.test.com');
      }).to.throw();
    });
    it("should properly combine two paths", function() {
      var url = Responsify.buildImageURI("http://www.test.com/", "foo.jpg");
      expect(url).to.equal("http://www.test.com/foo.jpg");
    });
    it("should properly combine a path with a queryString", function() {
      var url = Responsify.buildImageURI("http://www.test.com/foo", "?wid=700&hei=400");
      expect(url).to.equal("http://www.test.com/foo?wid=700&hei=400");
    });
    it("should properly combine a path + queryStrig with another queryString", function() {
      var url = Responsify.buildImageURI("http://www.test.com/foo?wid=700", "hei=400");
      expect(url).to.equal("http://www.test.com/foo?wid=700&hei=400");

      url = Responsify.buildImageURI("http://www.test.com/foo?wid=700", "&hei=400");
      expect(url).to.equal("http://www.test.com/foo?wid=700&hei=400");

      url = Responsify.buildImageURI("http://www.test.com/foo?wid=700", "?hei=400");
      expect(url).to.equal("http://www.test.com/foo?wid=700&hei=400");
    });
    it("should work without a base URL", function() {
      var url = Responsify.buildImageURI("", "http://www.test.com/foo.jpg");
      expect(url).to.equal("http://www.test.com/foo.jpg");
    });
    it("should work without a breakpoint URL", function() {
      var url = Responsify.buildImageURI("http://www.test.com/foo.jpg", "");
      expect(url).to.equal("http://www.test.com/foo.jpg");
    });
    it("should return just the breakpoint URL if breakpoint URL is full path", function(){
      var url = Responsify.buildImageURI("http://www.test.com/foo.jpg", "http://www.test.com/baz.jpg");
      expect(url).to.equal("http://www.test.com/baz.jpg");
    });
  });

  describe("appendQueryString()", function() {
    it("should throw on invalid parameters", function() {
      expect(function() {
        Responsify.appendQueryString();
      }).to.throw();
    });
    it("should return just the URI if no queryString present", function() {
      var uri = Responsify.appendQueryString('http://www.test.com');
      expect(uri).to.equal('http://www.test.com');
    });
  });

  describe("addImage()", function() {
    it("should throw on invalid paramters", function() {
      expect(function() {
        Responsify.addImage();
      }).to.throw();
    });
    it("should process image and store", function() {
      var stub = sinon.stub(Responsify, "renderImage");
      var img = new Image(1,1);
      Responsify.addImage(img);
      expect(stub).to.have.been.called;
      expect(Responsify.images.length).to.equal(5);
      stub.restore();
      Responsify.removeImage(img);
    });
  });

  describe("addImages()", function() {
    it("should throw on invalid parameters", function() {
      expect(function() {
        Responsify.addImages();
      }).to.throw();
    });
    it("should call addImage for each image passed to it", function() {
      var imgs = document.getElementsByClassName('responsive');
      var stub = sinon.stub(Responsify, "addImage");
      Responsify.addImages(imgs);
      expect(stub).to.have.been.callCount(4);
      stub.restore();
    });
  });

  describe("removeImage()", function() {
    it("should throw on invalid parameters", function() {
      expect(function() {
        Responsify.removeImage();
      }).to.throw();
    });
    it("should remove an image properly", function() {
      var img = document.getElementById('a');
      expect(Responsify.images.length).to.equal(4);
      Responsify.removeImage(img);
      expect(Responsify.images.length).to.equal(3);
    });
  });

  describe("removeImages()", function() {
    it("should throw on invalid parameters", function() {
      expect(function() {
        Responsify.removeImages();
      }).to.throw();
    });
    it("should call removeImage on all items in the images array", function() {
      var stub = sinon.stub(Responsify, "removeImage");
      var imgs = document.getElementsByClassName('responsive');
      Responsify.removeImages(imgs);
      expect(stub).to.have.been.callCount(4);
      stub.restore();
    });
  });

  describe("publish()", function() {
    it("should throw on invalid parameters", function() {
      expect(function() {
        Responsify.publish();
      }).to.throw();
    });
  });

  describe("on()", function() {
    it("should throw on invalid parameters", function() {
      expect(function() {
        Responsify.on();
      }).to.throw();
      expect(function() {
        Responsify.on('topic');
      }).to.throw();
    });
    it("should call appropriate callback", function() {
      var spy = sinon.spy();
      Responsify.on('foo', spy);
      Responsify.publish('foo');
      expect(spy).to.have.been.called;
    });
  });

  describe("off()", function() {
    it("should throw on invalid parameters", function() {
      expect(function() {
        Responsify.off();
      }).to.throw();
      expect(function() {
        Responsify.off('topic');
      }).to.throw();
    });
    it("should no longer listen for events on unsubscribed topics", function() {
      var bar = function() {};
      Responsify.on('bar', bar);
      expect(Responsify.events.bar.length).to.equal(1);
      Responsify.off('bar', bar);
      expect(Responsify.events.bar.length).to.equal(0);
    });
  });

  describe("extend()", function() {
    it("should throw on invalid parameters", function() {
      expect(function() {
        Responsify.extend();
      }).to.throw();
      expect(function() {
        Responsify.extend({});
      }).to.throw();
    });
    it("should be able to extend target object with source object", function() {
      var obj = Responsify.extend({ foo: 'baz'}, { bar: 'quz'});
      expect(obj).to.deep.equal({
        foo: 'baz',
        bar: 'quz'
      });
    });
    it("it should deep extend", function() {
      var obj = Responsify.extend({ foo: { baz: 'bar' }}, { foo: { baz: 'far', quz: 'foo'}});
      expect(obj).to.deep.equal({
        foo: {
          baz: 'far',
          quz: 'foo'
        }
      });
    });
  });
});
