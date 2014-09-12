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
      mock.expects("calculateBreakpoint").once();
      mock.expects("setupEvents").once();
      mock.expects("processImages").once();
      mock.expects("setupDebug").never();

      Responsify.init({
        selector: 'img.res',
        debounchDelay: 200,
        debug: false
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

  describe("onScrollEvent()", function() {
    it("should call process images", function() {
      var stub = sinon.stub(Responsify, "processImages");
      Responsify.onScrollEvent();
      expect(stub).to.have.been.called;
      stub.restore();
    });
  });

  describe("processImages", function() {
    it("should call processImage on all images", function() {
      var stub = sinon.stub(Responsify, "processImage");
      Responsify.processImages([{}, {}, {}]);
      expect(stub).to.have.been.calledThrice;
      stub.restore();
    });
  });

  describe("processImage()", function() {
    before(function(done) {
      $('#fixture').load('base/test/fixtures/images.html', function() {
        done();
      });
      Responsify.activeBreakpoint = Responsify.options.breakpoints[0];
    });
    it("should process the image and assume it is on screen", function() {
      var img = document.getElementById('a');
      Responsify.processImage(img);
    });
    after(function() {
      $('#fixture').empty();
    });
  });

  describe("addMutationObserver()", function() {
    var clock;
    before(function() {
      clock = sinon.useFakeTimers();
    });
    after(function() {
      clock.restore();
    });
    it("should listen for changed image elements on specified DOM node", function() {
      var spy = sinon.spy();
      Responsify.addMutationObserver($('#fixture')[0], spy);
      var $img = $("<img class='responsive'>");
      $('#fixture').append($img);
      clock.tick(30);
      expect(spy).to.have.been.calledWith($img[0]);
    });
    it("should listen for changed image elements deeply nested on a specified DOM node", function() {
      var spy = sinon.spy();
      Responsify.addMutationObserver($('#fixture')[0], spy);
      var $div = $("<div>");
      var $img = $("<img class='responsive'>");
      $div.append($img);
      $('#fixture').append($div);
      clock.tick(30);
      expect(spy).to.have.been.calledWith($img[0]);
    });
    after(function() {
      $('#fixture').empty();
    });
  });

  describe("buildImageUrl()", function() {
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

  describe("getClosestBreakpoint()", function() {
    it("should be able to determine appropriate breakpoint based on provided width", function() {
      var breakpoint = Responsify.calculateBreakpoint(0);
      expect(breakpoint.label).to.equal('break-a');

      breakpoint = Responsify.calculateBreakpoint(771);
      expect(breakpoint.label).to.equal('break-b');

      breakpoint = Responsify.calculateBreakpoint(1170);
      expect(breakpoint.label).to.equal('break-c');
    });
  });

  describe("onResizeEvent()", function() {
    beforeEach(function() {
      // set breakpoint to A
      Responsify.activeBreakpoint = Responsify.options.breakpoints[0];
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

  describe("onImageDetected()", function() {
    before(function() {
      Responsify.images = [];
    });

    it("should process image and store", function() {
      var spy = sinon.spy();
      var stub = sinon.stub(Responsify, "processImage", spy);
      var img = new Image(1,1);
      Responsify.onImageDetected(img);
      expect(spy).to.have.been.called;
      expect(Responsify.images.length).to.equal(1);
    });
  });

  describe("setupDebug()", function() {
    var foo = {
      baz: function() {},
      bar: function() {}
    };

    it("should wrap function object", function() {
      var spy = sinon.spy(foo, "baz");
      Responsify.setupDebug(foo);
      foo.baz();
      expect(spy).to.have.been.called;
    });
  });

});
