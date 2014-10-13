# Responsify  [![Build Status](https://travis-ci.org/eclifford/responsify.svg?branch=master)](https://travis-ci.org/eclifford/responsify) [![Coverage Status](https://img.shields.io/coveralls/eclifford/responsify.svg)](https://coveralls.io/r/eclifford/responsify?branch=master)

> Responsify.js is a src-N based responsive image solution optimized for
dynamic image solutions such as Adobe Scene7.

## Features

- Support for parameterized media image services such as Adobe Scene7
- Support for declarative images per breakpoint if you want to serve your own responsive images
- Built in customizable breakpoint detection/notification for use in responsive grids such as
those found in Bootstrap and Foundation
- No third party libraries required
- Non blocking script

## Why Responsify?

Responsify was born out of the need for a **Scene7** based responsive solution for a large enterprise content managed web
application. We needed something that was **fast**, **non blocking**, **standalone** and relied on **convention over declaration**.

In the end we created a solution that should work not only for **Scene7** but for any **src-N** based
responsive image solution.

## Quick Start

### Installation with Bower

```bash
bower install responsify
```

### Add Responsify to DOCUMENT

Responsify can be loaded in either the head or at the end of the body. Optionally
use `defer` to have responsify executed after DOM creation.

```html
<head>
  <script src='bower_components/resonsify/responsify.js' defer></script>
</head>
```

### Initialize Responsify

Responsify needs to be told when to initialize. It is important that this is done after the DOM has been rendered. In the below
example this is done on the `DOMContentLoaded` event, but optionally this may be done in **jQuery** `onReady` event.


Vanilla Face

```html
<script>
  document.addEventListener("DOMContentLoaded", function() {
    Responsify.init();
  });
</script>
```

jQuery

```html
<script>
  $(document).ready(function() {
    Responsify.init();
  });
</script>
```

### Basic Scene7 Responsive image

Responsify looks for all images by selector `img.responsive` in container element
`document` by default.

At the very least assuming you were using Scene7 you would need to populate the `data-responsify`
attribute to your Scene7 resource location.

```html
<img class='responsive'
  data-responsify="http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1?wid={width}"
/>
```

### Basic Declarative Responsive Image

```html
<img class='responsive'
  data-responsify="http://www.test.com/images/"
  data-responsify-break-a="foo_320.jpg"
  data-responsify-break-b="foo_640.jpg"
  data-responsify-break-c="foo_1024.jpg"
/>
```

Assuming your on **break-b** the resulting markup.

```html
<img class='responsive'
  src="http://www.test.com/images/foo_640.jpg"
  data-responsify="http://www.test.com/images/"
  data-responsify-break-a="foo_320.jpg"
  data-responsify-break-b="foo_640.jpg"
  data-responsify-break-c="foo_1024.jpg"
/>
```

### Options

#### namespace

Type: `String` Default: **responsify**

The namespace to use for `data-attribute` prefix.

#### selector

Type: `String` Default: **img.responsive,div.responsive**

The query selector to use when searching for images or background divs to process.

#### breakpoints

Type: `Array[Object]` Default: **Array of breakpoint objects**

Your breakpoint grid

### Events

Responsify publishes out the following events. To subscribe to these you
simply use `Responsify.on`.

```js
  Responsify.on('responsify:breakpoint:change', function() {
    // do something
  });
```

#### responsify:breakpoint:change

#### responsify:image:loaded


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
