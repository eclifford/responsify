describe("responsify", function() {

  describe("addUpdateQueryStringParmeter()", function() {
    var url = "";
    beforeEach(function() {
      url = "http://www.test.com";
    });

    it("should add new parameters to the URI", function() {
      url = Responsify.addUpdateQueryStringParameter(url, "foo", "baz");
      expect(url).to.equal("http://www.test.com?foo=baz");
    });

    it("should update update parameters already in the URI", function() {
      url = Responsify.addUpdateQueryStringParameter(url, "foo", "bar");
      expect(url).to.equal("http://www.test.com?foo=bar");
    });

    it("should be able to append multiple params correctly", function() {
      url = Responsify.addUpdateQueryStringParameter(url, "foo", "bar");
      url = Responsify.addUpdateQueryStringParameter(url, "baz", "qux");
      expect(url).to.equal("http://www.test.com?foo=bar&baz=qux");
    });
  });

  describe("parseQueryStringToObj()", function() {
    it("should be able to extract full query string into object", function() {
      var params = "?wid=100&foo=bar&baz=foo";
      var paramObj = Responsify.parseQueryStringToObj(params);
      expect(paramObj).to.deep.equal({
        "wid": "100",
        "foo": "bar",
        "baz": "foo"
      });
    });

    it("should be able to extract partial query string into object", function() {
      var params = "wid=100&foo=bar";
      var paramObj = Responsify.parseQueryStringToObj(params);
      expect(paramObj).to.deep.equal({
        "wid": "100",
        "foo": "bar"
      });
    });
  });

  describe("getClosestBreakpoint()", function() {
    it("should be able to determine appropriate breakpoint based on provided width", function() {
      var breakpoint = Responsify.getClosestBreakpoint(0);
      expect(breakpoint.label).to.equal('break-a');

      breakpoint = Responsify.getClosestBreakpoint(751);
      expect(breakpoint.label).to.equal('break-b');

      breakpoint = Responsify.getClosestBreakpoint(1170);
      expect(breakpoint.label).to.equal('break-d');
    });
  });

  describe("onResizeEvent()", function() {
    beforeEach(function() {
      // set breakpoint to A
      Responsify.activeBreakpoint = Responsify.options.breakpoints[0];
    });

    it("should emit a breakpoint:change event upon breakpoint change", function() {
      var spy = sinon.spy();
      Responsify.on('breakpoint:change', spy);
      Responsify.onResizeEvent(751);
      expect(spy).to.have.been.called;
    });

    it("should not emit an event if breakpoint does not change", function() {
      var spy = sinon.spy();
      Responsify.on('breakpoint:change', spy);
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

  describe("setupMutationObserver()", function() {
    before(function() {
      var spy = sinon.spy();
      Responsify.setupMutationObserver(document, spy);
    });

    it("should detect a change to the dom", function() {

    });
  });

  describe("publish()", function() {
  });

  describe("isImageOnScreen()", function() {
  });

  describe("isDeviceEqualTo()", function() {

  });

});
