# Responsify  [![Build Status](https://travis-ci.org/eclifford/responsify.svg?branch=master)](https://travis-ci.org/eclifford/responsify) [![Coverage Status](https://coveralls.io/repos/eclifford/responsify/badge.png?branch=master)](https://coveralls.io/r/eclifford/responsify?branch=master)

> Responsify.js is a src-N based responsive image solution optimized for parameterized
dynamic media solutions such as Adobe Scene7

## Features

- Close integration with Adobe Scene7 including custom parameterization per breakpoint
- Automatic detection of new responsive images added to DOM w/ MutationObservers perfect for
  RequireJS or AJAX rendered partial
- Support for IE8/9 (w/Polyfill), FireFox, Chrome, Opera
- Customizable breakpoints (including events of breakpoint changes)

## Why?

## How Responsify works

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

### Add Image with appropriate attributes to DOM

A valid Responsify responsive image has 3 basic attributes at minimum.

1. Semantic **IMG** tag
2. By default a class of `responsive` (configurable)
3. has `data-responsify` populated with base asset URI before calculated width
4. Optionally may include default `src` attribute for quick loading low resolution images

```html
<img class='responsive'
  src="http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1"
  data-responsify="http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1"
/>
```

###

### Initialise Responsify

Responsify needs to be told when to initialize. It is important that this is done after the DOM has been rendered. In the below
example this is done on the `DOMContentLoaded` event, but optionally this may be done in **jQuerys** `onReady` event.

```html
<script>
  document.addEventListener("DOMContentLoaded", function() {
    Responsify.init();
  });
</script>
```

## Scene7 Basics

[Scene7](http://www.adobe.com/solutions/web-experience-management/scene7-new.html) is a asset media service provided by Adobe for the Adobe Experience Manager
CMS. With [Scene7](http://www.adobe.com/solutions/web-experience-management/scene7-new.html) we are able to generate and display images for multiple sizes, formats, crops
and or effects. The list below shows a small subset of the available options that Scene7 provides for us.  

#### Example Scene7 Parameters

| Parameter     | Description    |
| ------------- |----------------|
| wid           | width          |
| hei           | height         |
| qlt           | quality        |
| pos           | layer position |
| rect          | view rectangle |

[Scene7 Reference Documentation](http://crc.scene7.com/is-docs/pages/HTTP-Protocol-Reference.htm#_res_Resolution-Based_Image)

We generate a Scene7 URL by combining the base asset URL with any number of parameters.

**Example Base URL**

**http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1**

**Example URL with defined width**

**http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1?wid=1024**

**Example URI with defined width and quality**

**http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1?wid=1024&=qlt=80**

## Configuration Options

### `breakpoints`

Set custom breakpoints by passing them to `init`

```js
window.onload = function() {
  Responsify.init({
    breakpoints: ['750', '970', '1170', '1600']
  });
}
```

### `debounceDelay`

The delay in milliseconds between trigging of internal events `onScroll` and `onResize`. Lower for hider fidelity and increase for
better performance.

```js
window.onload = function() {
  Responsify.init({
    debounceDelay: 300
  });
}
```

## Advanced Usage

### Customising Image rendering at breakpoints

There are times we want to setup certain crop parameters or quality settings per breakpoint. With Responsify and Scene7
that is easy to do. Simply add appropriate `data-src=n` attributes to your **IMG** tag. The following example sets up different crop
parameters for each of the four default breakpoints.

```html
<img class='responsive'
  src='http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1'
  data-src="http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1?resMode=sharp2&qlt=85"
  data-src-1="cropN=0.16,0.32,0.68,0.459"
  data-src-2="cropN=0.18,0.32,0.68,0.459"
  data-src-3="cropN=0.20,0.32,0.68,0.459"
  data-src-4="cropN=0.22,0.32,0.68,0.459"
/>
```

### Should I use SRC attribute or not?

In most of the examples on this page I've shown the usage of **IMG** tags with predefined `src` attributes already set. You might be wondering
why I don't just leave that off and let **Responsify** create the the `src` attribute dynamically. Responsify can and will do that for you, however doing so creates
semantically incorrect **IMG** element that in some browsers would cause a performance degradation. Alternatives in many responsive image solutions opt for things like **srcset** and **picturefill**.
I choose not to go that way as it adds a lot of semantically un standardised markup to your code.

Instead I like the approach of providing a very low resolution image up front to combat **FOUC** (flash of unstyled content) and then render in the higher quality images when the JavaScript is executed. This has
the benefit of natively supporting non JavaScript browsers without any change.

Alternatively if you choose for more of a traditional responsive image solution you could still do the following.

```html
<img class='responsive'
  data-src="http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1?resMode=sharp2&qlt=85"
/>
<noscript>
  <img class='responsive'
    src="http://s7d9.scene7.com/is/image/DEMOAKQA/1440.1?resMode=sharp2&qlt=85"
  />
</noscript>
```

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
