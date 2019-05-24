"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeSpan = makeSpan;
exports.makeOrd = makeOrd;
exports.makeInner = makeInner;
exports.makeHlist = makeHlist;
exports.makeVlist = makeVlist;
exports.default = exports.Span = void 0;

var _fontMetrics = _interopRequireDefault(require("./fontMetrics.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Return a string made up of the concatenated arguments.
 * Each arguments can be either a string, which is unchanged,
 * or a number, which is converted to a string with at most 5 fractional digits.
 *
 * @param {(Array.<any>|string|number)} arg
 * @return {string}
 * @memberof module:core/span
 * @private
 */
function toString(arg) {
  var result = '';

  if (typeof arg === 'number') {
    result += Math.floor(1e2 * arg) / 1e2;
  } else if (typeof arg === 'string') {
    result += arg;
  } else if (Array.isArray(arg)) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = arg[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var elem = _step.value;
        result += toString(elem);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  } else if (arg) {
    result += arg.toString();
  }

  return result;
} //----------------------------------------------------------------------------
// SPAN
//----------------------------------------------------------------------------

/**
 * A span is the most elementary element that can be rendered.
 * It is composed of an optional body of text and an optional list
 * of children (other spans). Each span can be decorated with
 * CSS classes and style attributes.
 *
 * @param {string|Span|Span[]} content the items 'contained' by this node
 * @param {string} classes list of classes attributes associated with this node
 * @return {void}
 * @class
 * @memberof module:core/span
 * @property {string} type - For example, `'command'`, `'mrel'`, etc...
 * @property {string} classes - A string of space separated CSS classes
 * associated with this element
 * @property {string} cssID - A CSS ID assigned to this span (optional)
 * @property {Span[]} children - An array, potentially empty, of spans which
 * this span encloses
 * @property {string} body - Content of this span. Can be empty.
 * @property {Object.<string, any>} style - A set of key/value pairs specifying CSS properties
 * associated with this element.
 * @property {number} height - The measurement from baseline to top, in em.
 * @property {number} depth - The measurement from baseline to bottom, in em.
 * @private
 */


var Span =
/*#__PURE__*/
function () {
  function Span(content, classes) {
    _classCallCheck(this, Span);

    // CLASSES
    this.classes = classes || ''; // CONTENT

    if (Array.isArray(content)) {
      // Check if isArray first, since an array is also an object
      // Flatten it (i.e. [[a1, a2], b1, b2] -> [a1, a2, b1, b2]
      this.children = [].concat.apply([], content);
    } else if (typeof content === 'string') {
      this.body = content;
    } else if (content && _typeof(content) === 'object') {
      this.children = [content];
    } // STYLE
    // CSS style, as an array of key value pairs.
    // Use this.setStyle() to modify it.


    this.style = null; // Calculate the dimensions of this span based on its children

    this.updateDimensions();
  }
  /**
   * Update the dimensions of this node based on its children:
   * - height: distance from bottom to top
   * - depth: distance from bottom to baseline
   * - maxFontSize: a size multiplier (typically set with commands such as \huge)
   * @method module:core/span.Span#updateDimensions
   * @private
   */


  _createClass(Span, [{
    key: "updateDimensions",
    value: function updateDimensions() {
      var height = 0.0;
      var depth = 0.0;
      var maxFontSize = 1.0;

      if (this.children) {
        this.children.forEach(function (x) {
          if (x.height > height) height = x.height;
          if (x.depth > depth) depth = x.depth;
          if (x.maxFontSize > maxFontSize) maxFontSize = x.maxFontSize;
        });
      }

      this.height = height;
      this.depth = depth;
      this.maxFontSize = maxFontSize;
    }
  }, {
    key: "selected",
    value: function selected(isSelected) {
      if (isSelected && !/ML__selected/.test(this.classes)) {
        if (this.classes.length > 0) this.classes += ' ';
        this.classes += 'ML__selected';
      }

      if (!isSelected && /ML__selected/.test(this.classes)) {
        this.classes = this.classes.replace('ML__selected', '');
      }

      if (this.children) {
        this.children.forEach(function (x) {
          return x.selected(isSelected);
        });
      }
    }
    /**
     * @param {object} style A style specification with the following
     * (all optionals) properties, which use the TeX terminology:
     *
     * - fontFamily: cmr, cmss, cmtt, cmsy (symbols), cmex (large symbols),
     *  ptm (times), phv (helvetica), pcr (courier)
     * - fontSeries: m (medium), b (bold), bx (bold extended), sb (semi-bold), c (condensed)
     * - fontShape:          italic, oblique, "roman": n (normal, upright), it, sl, sc
     * - fontSize: 'size1', 'size2'...
     * - color:
     * - background:
     */

  }, {
    key: "applyStyle",
    value: function applyStyle(style) {
      if (!style) return;

      if (style.color) {
        if (style.color !== 'none') {
          this.setStyle('color', style.color);
        } else {
          this.setStyle('color', '');
        }
      }

      if (style.backgroundColor) {
        if (style.backgroundColor !== 'none') {
          this.setStyle('background-color', style.backgroundColor);
        } else {
          this.setStyle('background-color', '');
        }
      } //
      // 1. Add any custom style classes
      //


      if (style.cssClass) {
        this.classes += ' ' + style.cssClass;
      } // If the body is null (for example for a line), we're done.


      if (!this.body) return; // Determine the appropriate font (and font-related classes)
      //
      // 2. Determine the font family (i.e. 'amsrm', 'mathit', 'mathcal', etc...)
      //

      var fontFamily = style.fontFamily;

      if (fontFamily === 'math' && style.fontShape === 'n') {
        // 'math' is italic by default. If we need upright, switch to main.
        fontFamily = 'cmr';
      }

      var fontName = 'Main-Regular'; // Default font

      if (fontFamily) {
        fontName = getFontName(this.body, fontFamily);
      } //
      // 3. Determine the classes necessary to represent the series and shape
      //


      if (style.fontShape) {
        this.classes += ' ' + ({
          'it': 'ML__it',
          'sl': 'ML__shape_sl',
          // slanted
          'sc': 'ML__shape_sc',
          // small caps
          'ol': 'ML__shape_ol' // outline

        }[style.fontShape] || '');
      }

      if (style.fontSeries) {
        var m = style.fontSeries.match(/(.?[lbm])?(.?[cx])?/);

        if (m) {
          this.classes += ' ' + ({
            'ul': 'ML__series_ul',
            'el': 'ML__series_el',
            'l': 'ML__series_l',
            'sl': 'ML__series_sl',
            'm': '',
            // medium (default)
            'sb': 'ML__series_sb',
            'b': 'ML__bold',
            'eb': 'ML__series_eb',
            'ub': 'ML__series_ub'
          }[m[1] || ''] || '');
          this.classes += ' ' + ({
            'uc': 'ML__series_uc',
            'ec': 'ML__series_ec',
            'c': 'ML__series_c',
            'sc': 'ML__series_sc',
            'n': '',
            // normal (default)
            'sx': 'ML__series_sx',
            'x': 'ML__series_x',
            'ex': 'ML__series_ex',
            'ux': 'ML__series_ux'
          }[m[2] || ''] || '');
        }
      }

      if (FONT_CLASS[fontFamily]) {
        this.classes += ' ' + FONT_CLASS[fontFamily];
      } else if (fontFamily) {
        // Not a well-known family. Use a style.
        this.setStyle('font-family', fontFamily);
      } //
      // 3. Get the metrics information
      //


      if (this.body && this.body.length > 0 && fontName) {
        this.height = 0.0;
        this.depth = 0.0;
        this.maxFontSize = {
          size1: 0.5,
          size2: 0.7,
          size3: 0.8,
          size4: 0.9,
          size5: 1.0,
          size6: 1.2,
          size7: 1.44,
          size8: 1.73,
          size9: 2.07,
          size10: 2.49
        }[style.fontSize] || 1.0;
        this.skew = 0.0;
        this.italic = 0.0;

        for (var i = 0; i < this.body.length; i++) {
          var metrics = _fontMetrics.default.getCharacterMetrics(this.body.charAt(i), fontName); // If we were able to get metrics info for this character, store it.


          if (metrics) {
            this.height = Math.max(this.height, metrics.height);
            this.depth = Math.max(this.depth, metrics.depth);
            this.skew = metrics.skew;
            this.italic = metrics.italic;
          }
        }
      }
    }
    /**
     * Set the value of a CSS property associated with this span.
     * For example, setStyle('border-right', 5.6, 'em');
     *
     * @param {string} prop the CSS property to set
     * @param {...(string|number)} value a series of strings and numbers that will be concatenated.
     * @return {string}
     * @method module:core/span.Span#setStyle
     * @private
     */

  }, {
    key: "setStyle",
    value: function setStyle(prop) {
      for (var _len = arguments.length, value = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        value[_key - 1] = arguments[_key];
      }

      var v = toString(value);

      if (v.length > 0) {
        if (!this.style) this.style = {};
        this.style[prop] = v;
      }
    }
  }, {
    key: "setTop",
    value: function setTop(top) {
      if (top && top !== 0) {
        if (!this.style) this.style = {};
        this.style['top'] = toString(top) + 'em';
        this.height -= top;
        this.depth += top;
      }
    }
    /**
     * 
     * @param {number} left 
     */

  }, {
    key: "setLeft",
    value: function setLeft(left) {
      if (left && left !== 0) {
        if (!this.style) this.style = {};
        this.style['margin-left'] = toString(left) + 'em';
      }
    }
    /**
     * 
     * @param {number} right 
     */

  }, {
    key: "setRight",
    value: function setRight(right) {
      if (right && right !== 0) {
        if (!this.style) this.style = {};
        this.style['margin-right'] = toString(right) + 'em';
      }
    }
  }, {
    key: "setWidth",
    value: function setWidth(width) {
      if (width && width !== 0) {
        if (!this.style) this.style = {};
        this.style['width'] = toString(width) + 'em';
      }
    }
  }, {
    key: "addMarginRight",
    value: function addMarginRight(margin) {
      if (margin && margin !== 0) {
        if (!this.style && !/qquad|quad|enspace|thickspace|mediumspace|thinspace|negativethinspace/.test(this.classes)) {
          // Attempt to use a class instead of an explicit margin
          var cls = {
            '2': 'qquad',
            '1': 'quad',
            '.5': 'enspace',
            '0.277778': 'thickspace',
            '0.222222': 'mediumspace',
            '0.166667': 'thinspace',
            '-0.166667': 'negativethinspace'
          }[margin.toString()];

          if (cls) {
            this.classes += ' rspace ' + cls;
            return;
          }
        }

        if (!this.style) this.style = {};
        var currentMargin = parseFloat(this.style['margin-right'] || '0');
        this.style['margin-right'] = toString(currentMargin + margin) + 'em';
      }
    }
    /**
     * Generate the HTML markup to represent this span.
     *
     * @param {number} [hskip=0] - Space (in mu, 1/18em) to leave on the left side
     * of the span. Implemented as a Unicode character if possible, a margin-left otherwise.
     * @param {number} [hscale=1.0] - If a value is provided, the margins are scaled by
     * this factor.
     * @return {string} HTML markup
     * @method module:core/span.Span#toMarkup
     * @private
     */

  }, {
    key: "toMarkup",
    value: function toMarkup(hskip, hscale) {
      hskip = hskip || 0;
      hscale = hscale || 1.0;
      var result = '';
      var body = this.body || '';

      if (this.children) {
        var previousType = 'none';
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var child = _step2.value;
            var spacing = 0;

            if (previousType) {
              var type = child.type;

              if (type) {
                if (type === 'textord') type = 'mord';
                if (type === 'first') type = 'none';

                if (child.isTight) {
                  spacing = INTER_ATOM_TIGHT_SPACING[previousType + '+' + type] || 0;
                } else {
                  spacing = INTER_ATOM_SPACING[previousType + '+' + type] || 0;
                }

                spacing = Math.floor(hscale * spacing);
              }
            }

            body += child.toMarkup(spacing, hscale);
            previousType = lastSpanType(child);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      } // Collapse 'empty' spans


      if ((body === "\u200B" || !body) && (!this.classes || this.classes === 'ML__selected')) {
        result = '';
      } else {
        // Note: We can't omit the tag, even if it has no class and no style,
        // as some layouts (vlist) depends on the presence of the tag to function
        result = '<span';

        if (this.cssId) {
          result += ' id="' + this.cssId + '" ';
        }

        if (this.svgOverlay) {
          this.setStyle('position', 'relative');
          this.setStyle('height', this.height + this.depth, 'em');
          this.setStyle('vertical-align', -this.depth, 'em');
        }

        if (this.attributes) {
          for (var attribute in this.attributes) {
            if (this.attributes.hasOwnProperty(attribute)) {
              result += ' ' + attribute + '="' + this.attributes[attribute] + '"';
            }
          }
        }

        var classes = this.classes.split(' '); // Add the type (mbin, mrel, etc...) if specified

        if (this.type) {
          if (/command|placeholder|error/.test(this.type)) {
            classes.push({
              'command': 'ML__command',
              'placeholder': 'ML__placeholder',
              'error': 'ML__error'
            }[this.type]);
          }

          if (this.caret && this.type === 'command') {
            classes.push('ML__command-caret');
          }
        } // Remove duplicate and empty classes


        var classList = '';

        if (classes.length > 1) {
          classList = classes.filter(function (x, e, a) {
            return x.length > 0 && a.indexOf(x) === e;
          }).join(' ');
        } else {
          classList = classes[0];
        }

        if (classList.length > 0) {
          result += ' class="' + classList + '"';
        } // If a `hskip` value was provided, add it to the margin-left


        if (hskip) {
          if (this.style && this.style['margin-left']) {
            // There was already a margin, add to it
            this.style['margin-left'] = toString(parseFloat(this.style['margin-left']) + hskip / 18) + 'em';
          } else {
            // No margin yet. Can we encode it as a Unicode space?
            if (hskip < 0 && NEGATIVE_SPACING_CHARACTER[-hskip]) {
              body = NEGATIVE_SPACING_CHARACTER[-hskip] + body;
            } else if (SPACING_CHARACTER[hskip]) {
              body = SPACING_CHARACTER[hskip] + body;
            } else {
              if (!this.style) this.style = {};
              this.style['margin-left'] = toString(hskip / 18) + 'em';
            }
          }
        }

        if (this.style) {
          var styleString = '';
          var isSelected = /ML__selected/.test(this.classes);

          for (var style in this.style) {
            if (this.style.hasOwnProperty(style)) {
              // Render the style property, except the background
              // of selected spans
              if (style !== 'background-color' || !isSelected) {
                styleString += style + ':' + this.style[style] + ';';
              }
            }
          }

          if (styleString.length > 0) {
            result += ' style="' + styleString + '"';
          }
        }

        result += '>'; // If there is some SVG markup associated with this span,
        // include it now

        if (this.svgOverlay) {
          result += '<span style="';
          result += 'display: inline-block;';
          result += 'height:' + (this.height + this.depth) + 'em;';
          result += 'vertical-align:' + this.depth + 'em;';
          result += '">';
          result += body;
          result += '</span>';
          result += '<svg '; // result += 'style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:2;';

          result += 'style="position:absolute;';
          result += 'overflow:overlay;';
          result += 'height:' + (this.height + this.depth) + 'em;';
          result += 'transform:translateY(-' + Math.round(_fontMetrics.default.toPx(this.depth, 'em') + _fontMetrics.default.toPx(this.style.padding)) + 'px);';

          if (this.style && this.style.padding) {
            result += 'top:' + this.style.padding + ';';
            result += 'left:' + this.style.padding + ';';
            result += 'width:calc(100% - 2 * ' + this.style.padding + ' );';
          } else {
            result += 'top:0;';
            result += 'left:0;';
            result += 'width:100%;';
          }

          result += 'z-index:2;';
          result += '"';

          if (this.svgStyle) {
            result += ' style="' + this.svgStyle + '"';
          }

          result += '>';
          result += this.svgOverlay;
          result += '</svg>';
        } else {
          result += body;
        }

        result = result + '</span>';
      }

      if (this.caret && this.type !== 'command') {
        if (this.caret === 'text') {
          result = result + '<span class="ML__text-caret"></span>';
        } else {
          result = result + '<span class="ML__caret"></span>';
        }
      }

      return result;
    }
    /**
     * Can this span be coalesced with 'span'?
     * This is used to 'coalesce' (i.e. group together) a series of spans that are
     * identical except for their value, and to avoid generating redundant spans.
     * That is: '12' ->
     *      "<span class='mord mathrm'>12</span>"
     * rather than:
     *      "<span class='mord mathrm'>1</span><span class='mord mathrm'>2</span>"
     * @param {Span} span
     * @return {boolean}
     * @method module:core/span.Span#tryCoalesceWith
     * @private
     */

  }, {
    key: "tryCoalesceWith",
    value: function tryCoalesceWith(span) {
      if (this.tag !== span.tag) return false;
      if (this.type !== span.type) return false; // Don't coalesce consecutive errors or placeholders

      if (this.type === 'error' || this.type === 'placeholder' || this.type === 'command') return false; // If this span or the candidate span have children, we can't
      // coalesce them, but we'll try to coalesce their children

      var hasChildren = this.children && this.children.length > 0;
      var spanHasChildren = span.children && span.children.length > 0;
      if (hasChildren || spanHasChildren) return false; // If they have a different number of styles, can't coalesce

      var thisStyleCount = this.style ? this.style.length : 0;
      var spanStyleCount = span.style ? span.style.length : 0;
      if (thisStyleCount !== spanStyleCount) return false; // For the purpose of our comparison,
      // any 'empty' classes (whitespace)

      var classes = this.classes.trim().replace(/\s+/g, ' ').split(' ');
      var spanClasses = span.classes.trim().replace(/\s+/g, ' ').split(' '); // If they have a different number of classes, can't coalesce

      if (classes.length !== spanClasses.length) return false; // OK, let's do the more expensive comparison now.
      // If they have different classes, can't coalesce

      classes.sort();
      spanClasses.sort();

      for (var i = 0; i < classes.length; i++) {
        // Don't coalesce vertical separators
        // (used in column formating with {l||r} for example
        if (classes[i] === 'vertical-separator') return false;
        if (classes[i] !== spanClasses[i]) return false;
      } // If the styles are different, can't coalesce


      if (this.style && span.style) {
        for (var style in this.style) {
          if (this.style.hasOwnProperty(style) && span.style.hasOwnProperty(style)) {
            if (this.style[style] !== span.style[style]) return false;
          }
        }
      } // OK, the attributes of those spans are compatible.
      // Merge span into this


      this.body += span.body;
      this.height = Math.max(this.height, span.height);
      this.depth = Math.max(this.depth, span.depth);
      this.maxFontSize = Math.max(this.maxFontSize, span.maxFontSize); // The italic correction for the coalesced spans is the
      // italic correction of the last span.

      this.italic = span.italic;
      return true;
    }
  }]);

  return Span;
}();
/**
 * Return HTML markup representing this span, its style, classes and
 * children.
 *
 * @param {number} [hskip] amount of whitespace to insert before this element
 * This is used to adjust the inter-spacing between spans of different types,
 * e.g. 'bin' and 'rel', according to the TeX rules.
 * @alias module:core/span.INTER_ATOM_SPACING
 * @private
 */


exports.Span = Span;
var INTER_ATOM_SPACING = {
  'mord+mop': 3,
  'mord+mbin': 4,
  'mord+mrel': 5,
  'mord+minner': 3,
  'mop+mord': 3,
  'mop+mop': 3,
  'mop+mbin': 5,
  'mop+minner': 3,
  'mbin+mord': 4,
  'mbin+mop': 4,
  'mbin+mopen': 4,
  'mbin+minner': 4,
  'mrel+mord': 5,
  'mrel+mop': 5,
  'mrel+mopen': 5,
  'mrel+minner': 5,
  'mclose+mop': 3,
  'mclose+mbin': 4,
  'mclose+mrel': 5,
  'mclose+minner': 3,
  'mpunct+mord': 3,
  'mpunct+mop': 3,
  'mpunct+mbin': 4,
  'mpunct+mrel': 5,
  'mpunct+mopen': 3,
  'mpunct+mpunct': 3,
  'mpunct+minner': 3 // See https://www.w3.org/TR/2000/WD-MathML2-20000328/chapter6.html 
  // 6.1.4 Non-Marking Characters

};
var SPACING_CHARACTER = ["\u200B", // 0/18 ZERO-WIDTH SPACE
"\u200A", // 1/18 HAIR SPACE
"\u200A\u200A", // 2/18
"\u2009", // 3/18 THIN SPACE
"\u205F", // 4/18 MEDIUM MATHEMATICAL SPACE
"\u205F\u200A", // 5/18 MEDIUM MATHEMATICAL SPACE + HAIR SPACE
"\u2004", // 6/18 THREE-PER-EM SPACE   1/3em
'', '', "\u2002" // 9/18 EN SPACE 1/2em = 9/18
];
var NEGATIVE_SPACING_CHARACTER = ['', "\u200A\u2063", // -1/18
'', "\u2009\u2063", // -3/18
"\u205F\u2063", // -4/18
"\u2005\u2063" // -5/18
];
/**
 *
 * @alias module:core/span.INTER_ATOM_TIGHT_SPACING
 * @private
 */

var INTER_ATOM_TIGHT_SPACING = {
  'mord+mop': 3,
  'mop+mord': 3,
  'mop+mop': 3,
  'mclose+mop': 3,
  'minner+mop': 3
};

function lastSpanType(span) {
  var result = span.type;
  if (result === 'first') return 'none';
  if (result === 'textord') return 'mord';
  return result;
}
/**
 * Attempts to coalesce (merge) spans, for example consecutive text spans.
 * Return a new tree with coalesced spans.
 *
 * @param {Span[]} spans
 * @return {Span[]} coalesced tree
 * @memberof module:core/span
 * @private
 */


function coalesce(spans) {
  if (!spans || spans.length === 0) return [];
  spans[0].children = coalesce(spans[0].children);
  var result = [spans[0]];

  for (var i = 1; i < spans.length; i++) {
    if (!result[result.length - 1].tryCoalesceWith(spans[i])) {
      spans[i].children = coalesce(spans[i].children);
      result.push(spans[i]);
    }
  }

  return result;
} //----------------------------------------------------------------------------
// UTILITY FUNCTIONS
//----------------------------------------------------------------------------


function height(spans) {
  if (!spans) return 0;

  if (Array.isArray(spans)) {
    return spans.reduce(function (acc, x) {
      return Math.max(acc, x.height);
    }, 0);
  }

  return spans.height;
}

function depth(spans) {
  if (!spans) return 0;

  if (Array.isArray(spans)) {
    return spans.reduce(function (acc, x) {
      return Math.max(acc, x.depth);
    }, 0);
  }

  return spans.depth;
}

function skew(spans) {
  if (!spans) return 0;

  if (Array.isArray(spans)) {
    var result = 0;
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = spans[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var span = _step3.value;
        result += span.skew || 0;
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    return result;
  }

  return spans.skew;
}

function italic(spans) {
  if (!spans) return 0;

  if (Array.isArray(spans)) {
    return spans[spans.length - 1].italic;
  }

  return spans.italic;
}
/**
 * Make an element made of a sequence of children with classes
 * @param {(string|Span|Span[])} content the items 'contained' by this node
 * @param {string} classes list of classes attributes associated with this node
 * @memberof module:core/span
 * @private
 */


function makeSpan(content, classes) {
  if (Array.isArray(content)) {
    var c = [];
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = content[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var s = _step4.value;
        if (s) c.push(s);
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    if (c.length === 1) {
      return makeSpan(c[0], classes);
    }
  }

  return new Span(content, classes);
}
/**
 *
 * @param {string} fontFamily
 * @param {string} symbol
 * @param {string} classes
 * @memberof module:core/span
 * @private
 */


function makeSymbol(fontFamily, symbol, classes) {
  var result = new Span(symbol, classes);

  var metrics = _fontMetrics.default.getCharacterMetrics(symbol, fontFamily);

  result.height = metrics.height;
  result.depth = metrics.depth;
  result.skew = metrics.skew;
  result.italic = metrics.italic;
  result.setRight(result.italic);
  return result;
}
/**
 * Makes an element placed in each of the vlist elements to ensure that each
 * element has the same max font size. To do this, we create a zero-width space
 * with the correct font size.
//  * Note: without this, even when fontSize = 0, the fraction bar is no
//  * longer positioned correctly
 * @return {Span}
 * @memberof module:core/span
 * @private
 */


function makeFontSizer(context, fontSize) {
  var fontSizeAdjustment = fontSize ? fontSize / context.mathstyle.sizeMultiplier : 0;
  var fontSizeInner = new Span("\u200B"); // ZERO WIDTH SPACE

  if (fontSizeAdjustment !== 1) {
    fontSizeInner.setStyle('font-size', fontSizeAdjustment, fontSizeAdjustment > 0 ? 'em' : '');
    fontSizeInner.attributes = {
      "aria-hidden": true
    };
  }

  if (context.size !== 'size5') {
    return new Span(fontSizeInner, 'fontsize-ensurer reset-' + context.size + ' size5');
  }

  return fontSizeAdjustment !== 0 ? fontSizeInner : null;
}
/**
 *
 * @param {string} type One of 'mbin', 'mop', 'mord', 'mrel' 'mclose',
 * 'mpunct', 'minner'
 * @param {string|Span[]} content A string or an array of other Spans
 * @param {string} classes CSS classes decorating this span
 * See https://tex.stackexchange.com/questions/81752/
 * for a thorough description of the TeXt atom type and their relevance to
 * proper kerning.
 * @memberof module:core/span
 * @private
 */


function makeSpanOfType(type, content, classes) {
  var result = makeSpan(content, classes);
  result.type = type;
  return result;
}

function makeOp(content, classes) {
  return makeSpanOfType('mop', content, classes);
}

function makeOrd(content, classes) {
  return makeSpanOfType('mord', content, classes);
}

function makeRel(content, classes) {
  return makeSpanOfType('mrel', content, classes);
}

function makeClose(content, classes) {
  return makeSpanOfType('mclose', content, classes);
}

function makeOpen(content, classes) {
  return makeSpanOfType('mopen', content, classes);
}

function makeInner(content, classes) {
  return makeSpanOfType('minner', content, classes);
}

function makePunct(content, classes) {
  return makeSpanOfType('mpunct', content, classes);
}

function makeStyleWrap(type, children, fromStyle, toStyle, classes) {
  classes = classes || '';
  classes += ' style-wrap ';
  var result = makeHlist(children, classes + fromStyle.adjustTo(toStyle));
  result.type = type;
  var multiplier = toStyle.sizeMultiplier / fromStyle.sizeMultiplier;
  result.height *= multiplier;
  result.depth *= multiplier;
  result.maxFontSize = toStyle.sizeMultiplier;
  return result;
}
/**
 * Add some SVG markup to be overlaid on top of the span
 *
 * @param {Span} body
 * @param {string} svgMarkup
 */


function makeSVG(body, svgMarkup, svgStyle) {
  body.svgOverlay = svgMarkup;
  body.svgStyle = svgStyle;
  return body;
}
/**
 *
 * @param {Span|Span[]} spans
 * @param {string} classes
 * @memberof module:core/span
 * @private
 */


function makeHlist(spans, classes) {
  if (!classes || classes.length === 0) {
    // No decorations...
    if (spans instanceof Span) {
      // A single span, use it as the output
      return spans;
    } else if (Array.isArray(spans) && spans.length === 1) {
      // An array, with a single span, use the single span as the output
      return spans[0];
    }
  }

  var result = new Span(spans, classes);
  var multiplier = 1.0;

  if (spans instanceof Span) {
    multiplier = spans.maxFontSize;
  } else {
    multiplier = spans.reduce(function (acc, x) {
      return Math.max(acc, x.maxFontSize);
    }, 0);
  }

  result.height *= multiplier;
  result.depth *= multiplier;
  return result;
}
/**
 * Create a new span of type `vlist`, a set of vertically stacked items
 * @param {Context} context
 * @param {Array.<(number|Span)>} elements
 * An array of Span and integer. The integer can be either some kerning information
 * or the value of an individual shift of the preceding child if in 'individualShift' mode
 * @param {string} pos The method that will be used to position the elements in the vlist.
 *
 * One of:
 * - `"individualShift"`: each child must be followed by a number indicating how much to shift it (i.e. moved downwards)
 * - `"top"`: posData specifies the topmost point of the vlist (>0 move up)
 * - `"bottom"`: posData specifies the bottommost point of the vlist (>0 move down)
 * - `"shift"`: the baseline of the vlist will be positioned posData away from the baseline
 * of the first child. (>0 moves down)
 * @param {number} posData
 * @memberof module:core/span
 * @private
 */


function makeVlist(context, elements, pos, posData) {
  var listDepth = 0;
  var currPos = 0;
  pos = pos || 'shift';
  posData = posData || 0; // Normalize the elements so that they're all either a number or
  // a single span. If a child is an array of spans,
  // wrap it in a span

  for (var i = 0; i < elements.length; i++) {
    if (Array.isArray(elements[i])) {
      if (elements[i].length === 1) {
        // If that's an array made up of a single span, use that span
        elements[i] = elements[i][0];
      } else {
        // Otherwise, wrap it in a span
        elements[i] = makeSpan(elements[i]);
      }
    }
  }

  if (pos === 'shift') {
    listDepth = -elements[0].depth - posData;
  } else if (pos === 'bottom') {
    listDepth = -posData;
  } else if (pos === 'top') {
    var bottom = posData;
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = elements[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var element = _step5.value;

        if (element instanceof Span) {
          // It's a Span, use the dimension data
          bottom -= element.height + element.depth;
        } else {
          // It's a kern adjustment
          bottom -= element;
        }
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
          _iterator5.return();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }

    listDepth = bottom;
  } else if (pos === 'individualShift') {
    // Individual adjustment to each elements.
    // The elements list is made up of a Span followed
    // by a shift adjustment as an integer
    var originalElements = elements;
    elements = [originalElements[0]]; // Add in kerns to the list of elements to get each element to be
    // shifted to the correct specified shift

    listDepth = -originalElements[1] - originalElements[0].depth;
    currPos = listDepth;

    for (var _i = 2; _i < originalElements.length; _i += 2) {
      var diff = -originalElements[_i + 1] - currPos - originalElements[_i].depth;
      currPos = currPos + diff;
      var kern = diff - (originalElements[_i - 2].height + originalElements[_i - 2].depth);
      elements.push(kern);
      elements.push(originalElements[_i]);
    }
  } else {
    console.assert(false, 'makeVList with unknown method: "' + pos + '"');
  } // Make the fontSizer


  var maxFontSize = 1.0;
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = elements[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var _element = _step6.value;

      if (_element instanceof Span) {
        maxFontSize = Math.max(maxFontSize, _element.maxFontSize);
      }
    }
  } catch (err) {
    _didIteratorError6 = true;
    _iteratorError6 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
        _iterator6.return();
      }
    } finally {
      if (_didIteratorError6) {
        throw _iteratorError6;
      }
    }
  }

  var fontSizer = makeFontSizer(context, maxFontSize);
  var newElements = [];
  currPos = listDepth;
  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = elements[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var _element2 = _step7.value;

      if (typeof _element2 === 'number') {
        // It's a kern adjustment
        currPos += _element2;
      } else {
        var wrap = makeSpan([fontSizer, _element2]);
        wrap.setTop(-_element2.depth - currPos);
        newElements.push(wrap);
        currPos += _element2.height + _element2.depth;
      }
    }
  } catch (err) {
    _didIteratorError7 = true;
    _iteratorError7 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
        _iterator7.return();
      }
    } finally {
      if (_didIteratorError7) {
        throw _iteratorError7;
      }
    }
  }

  var result = makeSpan(newElements, 'vlist'); // Fix the final height and depth, in case there were kerns at the ends
  // since makeSpan won't take that into account.

  result.depth = Math.max(listDepth, depth(result) || 0);
  result.height = Math.max(-currPos, height(result) || 0);
  return result;
} // /**
//  * 
//  * @param {Span|Span[]} base 
//  * @param {number} strutHeight 
//  * @param {number} strutDepth 
//  */
// function makeStrut(base, strutHeight, strutDepth) {
//     return [base];
//     const topStrut = makeSpan(null, 'ML__strut');
//     topStrut.height = strutHeight || 0;
//     topStrut.depth = 0;
//     topStrut.setStyle('height', strutHeight, 'em');
//     const bottomStrut = makeSpan(null, 'ML__strut--bottom');
//     bottomStrut.height = strutHeight || 0;
//     bottomStrut.depth = strutDepth || 0;
//     bottomStrut.setStyle('height', strutHeight + strutDepth, 'em');
//     if (strutDepth) {
//         bottomStrut.setStyle('vertical-align', -strutDepth, 'em');
//     }
//     if (Array.isArray(base)) {
//         base.unshift(topStrut);
//         base.unshift(bottomStrut);
//         return base;
//     }
//     return makeOrd([topStrut, bottomStrut, base]);
// }
//----------------------------------------------------------------------------
// FONTS
//----------------------------------------------------------------------------
// Map an abstract 'fontFamily' to an actual font name


var FONT_NAME = {
  'ams': 'AMS-Regular',
  'bb': 'AMS-Regular',
  'cal': 'Caligraphic-Regular',
  'frak': 'Fraktur-Regular',
  'scr': 'Script-Regular',
  'cmr': 'Main-Regular',
  'cmss': 'SansSerif-Regular',
  'cmtt': 'Typewriter-Regular',
  'math': 'Math-Regular',
  'mainit': 'Main-Italic'
};
var FONT_CLASS = {
  'ams': 'ML__ams',
  'bb': 'ML__bb',
  'cal': 'ML__cal',
  'frak': 'ML__frak',
  'scr': 'ML__script',
  'cmr': 'ML__mathrm',
  'cmss': 'ML__sans',
  'cmtt': 'ML__tt',
  'math': 'ML__mathit',
  'mainit': 'ML__mainit'
  /**
   * Given a font family ('frak', 'math'...) return a corresponding
   * font name. If the font does not support the specified symbol
   * return an alternate font or null if none could be determined.
   * @param {(string|Span[])} symbol the character for which we're seeking the font
   * @param {string} fontFamily such as 'mathbf', 'mathfrak', etc...
   * @return {string} a font name
   * @memberof module:mathAtom
   * @private
   */

};

function getFontName(symbol, fontFamily) {
  // If this is not a single char, just do a simple fontFamily -> fontName mapping
  if (typeof symbol !== 'string' || symbol.length > 1 || symbol === "\u200B") {
    return FONT_NAME[fontFamily];
  } // This is a single character. Do some remapping as necessary.
  // If symbol is not in the repertoire of the font,
  // return null.


  if (fontFamily === 'bb' || fontFamily === 'scr') {
    // These fonts only support [A-Z ]
    if (!/^[A-Z ]$/.test(symbol)) return null;
  } else if (fontFamily === 'cal') {
    // Only supports uppercase latin and digits
    if (!/^[0-9A-Z ]$/.test(symbol)) return null;
  } else if (fontFamily === 'frak') {
    if (!/^[0-9A-Za-z ]$|^[!"#$%&'()*+,\-./:;=?[]^’‘]$/.test(symbol)) {
      return null;
    }
  } else if (fontFamily === 'cmtt' || fontFamily === 'cmss') {
    if (!/^[0-9A-Za-z ]$|^[!"&'()*+,\-./:;=?@[]^_~\u0131\u0237\u0393\u0394\u0398\u039b\u039e\u03A0\u03A3\u03A5\u03A8\u03a9’‘]$/.test(symbol)) {
      return null;
    }
  }

  return FONT_NAME[fontFamily];
} // Export the public interface for this module


var _default = {
  coalesce: coalesce,
  makeSpan: makeSpan,
  makeOp: makeOp,
  makeOrd: makeOrd,
  makeRel: makeRel,
  makeClose: makeClose,
  makeOpen: makeOpen,
  makeInner: makeInner,
  makePunct: makePunct,
  makeSpanOfType: makeSpanOfType,
  makeSymbol: makeSymbol,
  makeVlist: makeVlist,
  makeHlist: makeHlist,
  makeStyleWrap: makeStyleWrap,
  // makeStrut,
  makeSVG: makeSVG,
  height: height,
  depth: depth,
  skew: skew,
  italic: italic
};
exports.default = _default;