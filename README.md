# Responsify  [![Build Status](https://travis-ci.org/eclifford/bronson.svg?branch=master)](https://travis-ci.org/eclifford/bronson) [![Coverage Status](https://coveralls.io/repos/eclifford/bronson/badge.png?branch=master)](https://coveralls.io/r/eclifford/bronson?branch=master)

> Responsify.js is a src-N based responsive image solution intended to be used
with URI based responsive image services such as Adobe Scene7

## Features
- Support for Scene7
- Automatic detection of new images added to DOM w/ MutationObservers
- Loads in low resolution images for non javascript support and to avoid FOUC
- Only render images that are visible in viewport
- Customisable beakpoints
- Responsive images set to container width
- Support for IE8/9 (w/Polyfill), FireFox, Chrome

## Getting Started

### Installation

```bash
bower install responsify
```

### Scene7 Basics
Explain adobe scene7

### Simple Example

Example using a Bootstrap container

```html
<script src='bower_components/resonsify/responsify.js'></script>

<div class='container-fluid'>
  <div class="row">
    <div class="col-md-12">
      <img class='responsive'
        src='http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1'
        data-src="http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1?resMode=sharp2&qlt=85"
      />
    </div>
  </div>
</div>

<script>
  window.onload = function() {
    Responsify.init();
  }
</script>
```

It's recommended you set your responsive images `src` attribute to the default
low res **Scene7** image in this case `http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1`. When this
image is visible **Responsify** will compute the correct of this images containing element
and append it as the `wid` parameter.

```html
<img class='responsive'
  src='http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1'
  data-src="http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1?resMode=sharp2&qlt=85"
/>
```
Asumming a container of `600px` your final image will look as follows.

```html
<img class='responsive'
  src='http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1?wid=600'
  data-src="http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1?resMode=sharp2&qlt=85"
/>
```

## Options

`breakpoints`: []

### Contributing

Fork the repo and issue a pull request

### License

The MIT License

Copyright (c) 2014 Eric Clifford

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
