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

      Responsify.init({
        selector: 'img.res',
        debounchDelay: 200
      });

      mock.verify();
    });
  });

  describe("setupEvents()", function() {
    var mock;
    before(function() {
      mock = sinon.mock(Responsify);
    });
    after(function() {
      mock.restore();
    });
    it("should setup the appropriate events", function() {
      mock.expects("addMutationObserver").once();
      Responsify.setupEvents();
    });
  });

  describe("onScrollEvent()", function() {
    it("should call process images", function() {
      var spy = sinon.spy();
      var stub = sinon.stub(Responsify, "processImages", spy);
      Responsify.onScrollEvent();
      expect(spy).to.have.been.called;
      stub.restore();
    });
  });

  describe("processImages", function() {
    it("should call processImage on all images", function() {
      var spy = sinon.spy();
      var stub = sinon.stub(Responsify, "processImage", spy);
      Responsify.processImages([{}, {}, {}]);
      expect(spy).to.have.been.calledThrice;

      stub.restore();
    });
  });

  describe("processImage", function() {
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

  // describe("setupMutationObserver()", function() {
  //   var spy;
  //   before(function() {
  //     spy = sinon.spy();
  //     Responsify.setupMutationObserver(document.body, spy);
  //   });
  //
  //   it("should detect a change to the dom", function() {
  //     var img = document.createElement("img");
  //     img.className = 'responsive';
  //     document.body.appendChild(img);
  //     expect(spy).to.have.been.called;
  //   });
  // });

  describe("publish()", function() {
  });

  describe("isImageOnScreen()", function() {
  });

  describe("isDeviceEqualTo()", function() {

  });

});
