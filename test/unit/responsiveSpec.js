/*jshint -W030 */
describe("responsify", function() {
  before(function() {
    $(document.body).append("<div id='fixture'></div>");
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
      mock.expects("renderImages").once();

      Responsify.init({
        selector: 'img.res',
        debounchDelay: 200
      });

      mock.verify();
    });
  });

  describe("setupEvents()", function() {
    var clock;
    var stub;
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

  describe("getClosestSupportedWidth()", function() {
    it("should calculate closest supported width if supportedWidths is set", function() {
      Responsify.options.supportedWidths = [100, 500, 1000];
      var width = Responsify.getClosestSupportedWidth(777);
      expect(width).to.equal(1000);
    });
    it("should return provided width if no explicit supportedWidths are set", function() {
      Responsify.options.supportedWidths = [];
      var width = Responsify.getClosestSupportedWidth(777);
      expect(width).to.equal(777);
    });
  });

  describe("renderImages()", function() {
    before(function(done) {
      $('#fixture').load('base/test/fixtures/images.html', function() {
        done();
      });
      Responsify.currentBreakpoint = Responsify.options.breakpoints[0];
    });
    after(function() {
      $('#fixture').empty();
    });
    it("should call renderImage on all images", function() {
      var stub = sinon.stub(Responsify, "renderImage");
      var imgs = document.getElementsByClassName('responsive');
      Responsify.renderImages(imgs);
      expect(stub).to.have.been.calledTwice;
      stub.restore();
    });
  });

  describe("renderImage()", function() {
    before(function(done) {
      $('#fixture').load('base/test/fixtures/images.html', function() {
        done();
      });
      Responsify.currentBreakpoint = Responsify.options.breakpoints[0];
    });
    it("should process the image and assume it is on screen", function() {
      var img = document.getElementById('a');
      Responsify.renderImage(img);
    });
    after(function() {
      $('#fixture').empty();
    });
  });

  describe("buildImageURI()", function() {
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
  });

  describe("findClosestBreakpoint()", function() {
    it("should be able to determine appropriate breakpoint based on provided width", function() {
      var breakpoint = Responsify.findClosestBreakpoint(0);
      expect(breakpoint.label).to.equal('break-a');

      breakpoint = Responsify.findClosestBreakpoint(771);
      expect(breakpoint.label).to.equal('break-b');

      breakpoint = Responsify.findClosestBreakpoint(1170);
      expect(breakpoint.label).to.equal('break-c');
    });
  });

  describe("onResizeEvent()", function() {
    beforeEach(function() {
      // set breakpoint to A
      Responsify.currentBreakpoint = Responsify.options.breakpoints[0];
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

  describe("extend()", function() {
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

  describe("addImage()", function() {
    before(function() {
      Responsify.images = [];
    });

    it("should process image and store", function() {
      var stub = sinon.stub(Responsify, "renderImage");
      var img = new Image(1,1);
      Responsify.addImage(img);
      expect(stub).to.have.been.called;
      expect(Responsify.images.length).to.equal(1);
      stub.restore();
    });
  });

  describe("removeImage()", function() {
    beforeEach(function(done) {
      $('#fixture').load('base/test/fixtures/images.html', function() {
        Responsify.refreshImages();
        done();
      });
    });
    afterEach(function() {
      $('#fixture').empty();
    });
    it("should remove an image properly", function() {
      $img = $('img#a')[0];
      expect(Responsify.images.length).to.equal(2);
      Responsify.removeImage($img);
      expect(Responsify.images.length).to.equal(1);
    });
  });

  describe("removeImages", function() {
    beforeEach(function(done) {
      $('#fixture').load('base/test/fixtures/images.html', function() {
        Responsify.refreshImages();
        done();
      });
    });
    afterEach(function() {
      $('#fixture').empty();
    });
    it("should call removeImage on all items in the images array", function() {
      var stub = sinon.stub(Responsify, "removeImage");
      var imgs = document.getElementsByClassName('responsive');
      Responsify.removeImages(imgs);
      expect(stub).to.have.been.calledTwice;
      stub.restore();
    });
  });

  describe("on()", function() {
    it("should call appropriate callback", function() {
      var spy = sinon.spy();
      Responsify.on('foo', spy);
      Responsify.publish('foo');
      expect(spy).to.have.been.called;
    });
  });

  describe.skip("off()", function() {
    it("should no longer listen for events on unsubscribed topics", function() {
      var spy = sinon.spy();
      Responsify.on('foo', spy);
      Responsify.off('foo', spy);
      Responsify.publish('foo');
      expect(spy).to.not.have.been.called;
    });
  });
});
