describe("responsify", function() {

  describe("urls", function() {
    it("should process querystring", function() {
      var url = "http://www.test.com";
      url = Responsify.addUpdateQueryStringParameter(url, "foo", "baz");
      url = Responsify.addUpdateQueryStringParameter(url, "bar", "foo");
      expect(url).to.equal("http://www.test.com?foo=baz&bar=foo");
    });

    it("extractQueryStringParams()", function() {
      var params = "?wid=100&foo=bar&baz=foo";
      var paramObj = Responsify.parseQueryStringToObj(params);
      expect(paramObj).to.deep.equal({
        "wid": "100",
        "foo": "bar",
        "baz": "foo"
      });

      paramObj = Responsify.parseQueryStringToObj("foo=baz&baz=foo");
      expect(paramObj).to.deep.equal({
        "foo": "baz",
        "baz": "foo"
      });

      paramObj = Responsify.parseQueryStringToObj("foo=baz");
      expect(paramObj).to.deep.equal({
        "foo": "baz"
      });
    });
  });


  describe("helpers", function() {
    it("getClosestBreakpoint()", function() {
      var A = Responsify.getClosestBreakpoint(0);
      expect(A.label).to.equal('break-a');

      var B = Responsify.getClosestBreakpoint(751);
      expect(B.label).to.equal('break-b');
    });
  });

  describe("images", function() {
    before(function(done) {
      $('body').load('base/test/fixtures/images.html', function() {
        done();
      });

      Responsify.activeBreakpoint = {
        label: 'break-a',
        enter: 0,
        exit: 751
      };
    });

    it("processImage()", function() {
      var imgA = $('#a')[0];
      Responsify.processImage(imgA);
      expect(imgA.src).to.equal('http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1?resMode=sharp2&qlt=85&wid=384');

      var imgB = $('#b')[0];
      Responsify.processImage(imgB);
      expect(imgB.src).to.equal('http://s7d9.scene7.com/is/image/DEMOAKQA/1440.2?resMode=sharp2&qlt=85&wid=384');
    });

    // it("isImageOnScreen()", function() {
    //   var imgA = $('#a')[0];
    //   var onScreen = Responsify.isImageOnScreen(imgA);
    //   expect(onScreen).to.equal(false);
    //
    //   var imgB = $('#b')[0];
    //   onScreen = Responsify.isImageOnScreen(imgB);
    //   expect(onScreen).to.equal(false);
    //
    //   var imgC = $('#c')[0];
    //   onScreen = Responsify.isImageOnScreen(imgC);
    //   expect(onScreen).to.equal(false);
    // });
  });

});
