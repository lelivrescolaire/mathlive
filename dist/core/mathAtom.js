"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.GREEK_REGEX = void 0;

var _mathstyle = _interopRequireDefault(require("./mathstyle.js"));

var _context = _interopRequireDefault(require("./context.js"));

var _fontMetrics = require("./fontMetrics.js");

var _span3 = _interopRequireDefault(require("./span.js"));

var _delimiters = _interopRequireDefault(require("./delimiters.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var makeSpan = _span3.default.makeSpan;
var makeOrd = _span3.default.makeOrd;
var makeInner = _span3.default.makeInner;
var makeHlist = _span3.default.makeHlist;
var makeVlist = _span3.default.makeVlist;
var GREEK_REGEX = /\u0393|\u0394|\u0398|\u039b|\u039E|\u03A0|\u03A3|\u03a5|\u03a6|\u03a8|\u03a9|[\u03b1-\u03c9]|\u03d1|\u03d5|\u03d6|\u03f1|\u03f5/; // TeX by default auto-italicize latin letters and lowercase greek letters

exports.GREEK_REGEX = GREEK_REGEX;
var AUTO_ITALIC_REGEX = /^([A-Za-z]|[\u03b1-\u03c9]|\u03d1|\u03d5|\u03d6|\u03f1|\u03f5)$/; // A table of size -> font size for the different sizing functions

var SIZING_MULTIPLIER = {
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
};
/**
 * An atom is an object encapsulating an elementary mathematical unit,
 * independent of its graphical representation.
 *
 * It keeps track of the content, while the dimensions, position and style
 * are tracked by Span objects which are created by the `decompose()` functions.
 *
 * @param {string} mode
 * @param {string} type
 * @param {string|MathAtom[]} body
 * @param {Object.<string, any>} [style={}] A set of additional properties to append to
 * the atom
 * @return {MathAtom}
 * @property {string} mode `'display'`, `'command'`, etc...
 * @property {string} type - Type can be one of:
 * - `mord`: ordinary symbol, e.g. `x`, `\alpha`
 * - `textord`: ordinary characters
 * - `mop`: operators, including special functions, `\sin`, `\sum`, `\cap`.
 * - `mbin`: binary operator: `+`, `*`, etc...
 * - `mrel`: relational operator: `=`, `\ne`, etc...
 * - `mpunct`: punctuation: `,`, `:`, etc...
 * - `mopen`: opening fence: `(`, `\langle`, etc...
 * - `mclose`: closing fence: `)`, `\rangle`, etc...
 * - `minner`: special layout cases, overlap, `\left...\right`
 *
 * In addition to these basic types, which correspond to the TeX atom types,
 * some atoms represent more complex compounds, including:
 * - `space` and `spacing`: blank space between atoms
 * - `mathstyle`: to change the math style used: `display` or `text`.
 * The layout rules are different for each, the latter being more compact and
 * intended to be incorporated with surrounding non-math text.
 * - `root`: a group, which has no parent (only one per formula)
 * - `group`: a simple group of atoms, for example from a `{...}`
 * - `sizing`: set the size of the font used
 * - `rule`: draw a line, for the `\rule` command
 * - `line`: used by `\overline` and `\underline` commands
 * - `box`: a border drawn around an expression and change its background color
 * - `overlap`: display a symbol _over_ another
 * - `overunder`: displays an annotation above or below a symbol
 * - `array`: a group, which has children arranged in rows. Used
 * by environments such as `matrix`, `cases`, etc...
 * - `genfrac`: a generalized fraction: a numerator and denominator, separated
 * by an optional line, and surrounded by optional fences
 * - `surd`: a surd, aka root
 * - `leftright`: used by the `\left` and `\right` commands
 * - `delim`: some delimiter
 * - `sizeddelim`: a delimiter that can grow
 *
 * The following types are used by the editor:
 * - `command` indicate a command being entered. The text is displayed in
 * blue in the editor.
 * - `error`: indicate a command that is unknown, for example `\xyzy`. The text
 * is displayed with a wavy red underline in the editor.
 * - `placeholder`: indicate a temporary item. Placeholders are displayed
 * as a dashed square in the editor.
 * - `first`: a special, empty, atom put as the first atom in math lists in
 * order to be able to position the caret before the first element. Aside from
 * the caret, they display nothing.
 *
 * @property {string|MathAtom[]} body
 * @property {MathAtom[]} superscript
 * @property {MathAtom[]} subscript
 * @property {MathAtom[]} numer
 * @property {MathAtom[]} denom
 * 
 * @property {boolean} captureSelection if true, this atom does not let its
 * children be selected. Used by the `\enclose` annotations, for example.
 * 
 * @property {boolean} skipBoundary if true, when the caret reaches the
 * first position in this element's body, it automatically moves to the
 * outside of the element. Conversely, when the caret reaches the position
 * right after this element, it automatically moves to the last position
 * inside this element.
 * 
 * @class module:core/mathatom#MathAtom
 * @global
 * @private
 */

var MathAtom =
/*#__PURE__*/
function () {
  /**
   * 
   * @param {string} mode 
   * @param {string} type 
   * @param {string|Array} body 
   * @param {object} style 
   */
  function MathAtom(mode, type, body, style) {
    _classCallCheck(this, MathAtom);

    this.mode = mode;
    this.type = type;
    this.body = body; // Append all the properties in extras to this
    // This can override the mode, type and body

    this.applyStyle(style);
  }

  _createClass(MathAtom, [{
    key: "getStyle",
    value: function getStyle() {
      return {
        color: this.phantom ? 'transparent' : this.color,
        backgroundColor: this.phantom ? 'transparent' : this.backgroundColor,
        fontFamily: this.baseFontFamily || this.fontFamily || this.autoFontFamily,
        fontShape: this.fontShape,
        fontSeries: this.fontSeries,
        fontSize: this.fontSize,
        cssId: this.cssId,
        cssClass: this.cssClass
      };
    }
  }, {
    key: "applyStyle",
    value: function applyStyle(style) {
      // Always apply the style, even if null. This will also set the 
      // autoFontFamily, which account for auto-italic. This code path
      // is used by \char.
      Object.assign(this, style);

      if (this.fontFamily === 'none') {
        this.fontFamily = '';
      }

      if (this.fontShape === 'auto') {
        this.fontShape = '';
      }

      if (this.fontSeries === 'auto') {
        this.fontSeries = '';
      }

      if (this.color === 'none') {
        this.color = '';
      }

      if (this.backgroundColor === 'none') {
        this.backgroundColor = '';
      }

      if (this.fontSize === 'auto') {
        this.fontSize = '';
      }

      if (this.fontSize) {
        this.maxFontSize = SIZING_MULTIPLIER[this.fontSize];
      }

      if (this.mode === 'math') {
        var symbol = typeof this.body === 'string' ? this.body : '';
        this.autoFontFamily = 'cmr';

        if (AUTO_ITALIC_REGEX.test(symbol)) {
          // Auto italicize alphabetic and lowercase greek symbols
          // in math mode (European style: American style would not
          // italicize greek letters, but it's TeX's default behavior)
          this.autoFontFamily = 'math';
        } else if (/\\imath|\\jmath|\\pounds/.test(symbol)) {
          // Some characters do not exist in the Math font,
          // use Main italic instead
          this.autoFontFamily = 'mainit';
        } else if (!GREEK_REGEX.test(symbol) && this.baseFontFamily === 'math') {
          this.autoFontFamily = 'cmr';
        }
      } else if (this.mode === 'text') {
        // A root can be in text mode (root created when creating a representation
        // of the selection, for copy/paste for example)
        if (this.type !== 'root') this.type = '';
        delete this.baseFontFamily;
        delete this.autoFontFamily;
      }
    }
  }, {
    key: "getInitialBaseElement",
    value: function getInitialBaseElement() {
      var result = this;

      if (Array.isArray(this.body) && this.body.length > 0) {
        if (this.body[0].type !== 'first') {
          result = this.body[0].getInitialBaseElement();
        } else if (this.body[1]) {
          result = this.body[1].getInitialBaseElement();
        }
      }

      return result;
    }
  }, {
    key: "getFinalBaseElement",
    value: function getFinalBaseElement() {
      if (Array.isArray(this.body) && this.body.length > 0) {
        return this.body[this.body.length - 1].getFinalBaseElement();
      }

      return this;
    }
  }, {
    key: "isCharacterBox",
    value: function isCharacterBox() {
      var base = this.getInitialBaseElement();
      return /minner|mbin|mrel|mpunct|mopen|mclose|textord/.test(base.type);
    }
  }, {
    key: "forEach",
    value: function forEach(cb) {
      cb(this);

      if (Array.isArray(this.body)) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.body[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var atom = _step.value;
            if (atom) atom.forEach(cb);
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
      } else if (this.body && _typeof(this.body) === 'object') {
        // Note: body can be null, for example 'first' or 'rule'
        // (and null is an object)
        cb(this.body);
      }

      if (this.superscript) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.superscript[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _atom = _step2.value;
            if (_atom) _atom.forEach(cb);
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
      }

      if (this.subscript) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this.subscript[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _atom2 = _step3.value;
            if (_atom2) _atom2.forEach(cb);
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
      }

      if (this.overscript) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this.overscript[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _atom3 = _step4.value;
            if (_atom3) _atom3.forEach(cb);
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
      }

      if (this.underscript) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = this.underscript[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var _atom4 = _step5.value;
            if (_atom4) _atom4.forEach(cb);
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
      }

      if (this.numer) {
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = this.numer[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var _atom5 = _step6.value;
            if (_atom5) _atom5.forEach(cb);
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
      }

      if (this.denom) {
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = this.denom[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var _atom6 = _step7.value;
            if (_atom6) _atom6.forEach(cb);
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
      }

      if (this.index) {
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = this.index[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var _atom7 = _step8.value;
            if (_atom7) _atom7.forEach(cb);
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
              _iterator8.return();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }
      }

      if (this.array) {
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = this.array[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var row = _step9.value;
            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
              for (var _iterator10 = row[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                var cell = _step10.value;
                var _iteratorNormalCompletion11 = true;
                var _didIteratorError11 = false;
                var _iteratorError11 = undefined;

                try {
                  for (var _iterator11 = cell[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                    var _atom8 = _step11.value;

                    _atom8.forEach(cb);
                  }
                } catch (err) {
                  _didIteratorError11 = true;
                  _iteratorError11 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion11 && _iterator11.return != null) {
                      _iterator11.return();
                    }
                  } finally {
                    if (_didIteratorError11) {
                      throw _iteratorError11;
                    }
                  }
                }
              }
            } catch (err) {
              _didIteratorError10 = true;
              _iteratorError10 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion10 && _iterator10.return != null) {
                  _iterator10.return();
                }
              } finally {
                if (_didIteratorError10) {
                  throw _iteratorError10;
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9.return != null) {
              _iterator9.return();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }
      }
    }
    /**
     * Iterate over all the child atoms of this atom, this included,
     * and return an array of all the atoms for which the predicate callback
     * is true.
     *
     * @return {MathAtom[]}
     * @method MathAtom#filter
     */

  }, {
    key: "filter",
    value: function filter(cb) {
      var result = [];
      if (cb(this)) result.push(this);

      for (var _i = 0, _arr = ['body', 'superscript', 'subscript', 'overscript', 'underscript', 'numer', 'denom', 'index']; _i < _arr.length; _i++) {
        var relation = _arr[_i];

        if (Array.isArray(this[relation])) {
          var _iteratorNormalCompletion14 = true;
          var _didIteratorError14 = false;
          var _iteratorError14 = undefined;

          try {
            for (var _iterator14 = this[relation][Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
              var atom = _step14.value;
              if (atom) result = result.concat(atom.filter(cb));
            }
          } catch (err) {
            _didIteratorError14 = true;
            _iteratorError14 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion14 && _iterator14.return != null) {
                _iterator14.return();
              }
            } finally {
              if (_didIteratorError14) {
                throw _iteratorError14;
              }
            }
          }
        }
      }

      if (Array.isArray(this.array)) {
        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
          for (var _iterator12 = this.array[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
            var row = _step12.value;
            var _iteratorNormalCompletion13 = true;
            var _didIteratorError13 = false;
            var _iteratorError13 = undefined;

            try {
              for (var _iterator13 = row[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                var cell = _step13.value;
                if (cell) result = result.concat(cell.filter(cb));
              }
            } catch (err) {
              _didIteratorError13 = true;
              _iteratorError13 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion13 && _iterator13.return != null) {
                  _iterator13.return();
                }
              } finally {
                if (_didIteratorError13) {
                  throw _iteratorError13;
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError12 = true;
          _iteratorError12 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion12 && _iterator12.return != null) {
              _iterator12.return();
            }
          } finally {
            if (_didIteratorError12) {
              throw _iteratorError12;
            }
          }
        }
      }

      return result;
    }
  }, {
    key: "decomposeGroup",
    value: function decomposeGroup(context) {
      // The scope of the context is this group, so clone it
      // so that any changes to it will be discarded when finished
      // with this group.
      // Note that the mathstyle property is optional and could be undefined
      // If that's the case, clone() returns a clone of the
      // context with the same mathstyle.
      var localContext = context.clone({
        mathstyle: this.mathstyle
      });
      var span = makeOrd(_decompose(localContext, this.body));
      if (this.cssId) span.cssId = this.cssId;
      span.applyStyle({
        backgroundColor: this.backgroundColor,
        cssClass: this.cssClass
      });
      return span;
    }
  }, {
    key: "decomposeArray",
    value: function decomposeArray(context) {
      // See http://tug.ctan.org/macros/latex/base/ltfsstrc.dtx
      // and http://tug.ctan.org/macros/latex/base/lttab.dtx
      var colFormat = this.colFormat;

      if (colFormat && colFormat.length === 0) {
        colFormat = [{
          align: 'l'
        }];
      }

      if (!colFormat) {
        colFormat = [{
          align: 'l'
        }, {
          align: 'l'
        }, {
          align: 'l'
        }, {
          align: 'l'
        }, {
          align: 'l'
        }, {
          align: 'l'
        }, {
          align: 'l'
        }, {
          align: 'l'
        }, {
          align: 'l'
        }, {
          align: 'l'
        }];
      } // Fold the array so that there are no more columns of content than
      // there are columns prescribed by the column format.


      var array = [];
      var colMax = 0; // Maximum number of columns of content

      var _iteratorNormalCompletion15 = true;
      var _didIteratorError15 = false;
      var _iteratorError15 = undefined;

      try {
        for (var _iterator15 = colFormat[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
          var colSpec = _step15.value;
          if (colSpec.align) colMax++;
        }
      } catch (err) {
        _didIteratorError15 = true;
        _iteratorError15 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion15 && _iterator15.return != null) {
            _iterator15.return();
          }
        } finally {
          if (_didIteratorError15) {
            throw _iteratorError15;
          }
        }
      }

      var _iteratorNormalCompletion16 = true;
      var _didIteratorError16 = false;
      var _iteratorError16 = undefined;

      try {
        for (var _iterator16 = this.array[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
          var _row = _step16.value;
          var _colIndex = 0;

          while (_colIndex < _row.length) {
            var newRow = [];
            var lastCol = Math.min(_row.length, _colIndex + colMax);

            while (_colIndex < lastCol) {
              newRow.push(_row[_colIndex++]);
            }

            array.push(newRow);
          }
        } // If the last row is empty, ignore it.

      } catch (err) {
        _didIteratorError16 = true;
        _iteratorError16 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion16 && _iterator16.return != null) {
            _iterator16.return();
          }
        } finally {
          if (_didIteratorError16) {
            throw _iteratorError16;
          }
        }
      }

      if (array[array.length - 1].length === 1 && array[array.length - 1][0].length === 0) {
        array.pop();
      }

      var mathstyle = _mathstyle.default.toMathstyle(this.mathstyle) || context.mathstyle; // Row spacing
      // Default \arraystretch from lttab.dtx

      var arraystretch = this.arraystretch || 1;
      var arrayskip = arraystretch * _fontMetrics.METRICS.baselineskip;
      var arstrutHeight = 0.7 * arrayskip;
      var arstrutDepth = 0.3 * arrayskip; // \@arstrutbox in lttab.dtx

      var totalHeight = 0;
      var nc = 0;
      var body = [];
      var nr = array.length;

      for (var r = 0; r < nr; ++r) {
        var inrow = array[r];
        nc = Math.max(nc, inrow.length);
        var height = arstrutHeight; // \@array adds an \@arstrut

        var depth = arstrutDepth; // to each row (via the template)

        var outrow = [];

        for (var c = 0; c < inrow.length; ++c) {
          var localContext = context.clone({
            mathstyle: this.mathstyle
          });
          var cell = _decompose(localContext, inrow[c]) || [];
          var elt = [makeOrd(null)].concat(cell);
          depth = Math.max(depth, _span3.default.depth(elt));
          height = Math.max(height, _span3.default.height(elt));
          outrow.push(elt);
        }

        var jot = r === nr - 1 ? 0 : this.jot || 0;

        if (this.rowGaps && this.rowGaps[r]) {
          jot = this.rowGaps[r];

          if (jot > 0) {
            // \@argarraycr
            jot += arstrutDepth;

            if (depth < jot) {
              depth = jot; // \@xargarraycr
            }

            jot = 0;
          }
        }

        outrow.height = height;
        outrow.depth = depth;
        totalHeight += height;
        outrow.pos = totalHeight;
        totalHeight += depth + jot; // \@yargarraycr

        body.push(outrow);
      }

      var offset = totalHeight / 2 + mathstyle.metrics.axisHeight;
      var contentCols = [];

      for (var colIndex = 0; colIndex < nc; colIndex++) {
        var col = [];

        for (var _i2 = 0, _body = body; _i2 < _body.length; _i2++) {
          var row = _body[_i2];
          var elem = row[colIndex];

          if (!elem) {
            continue;
          }

          elem.depth = row.depth;
          elem.height = row.height;
          col.push(elem);
          col.push(row.pos - offset);
        }

        if (col.length > 0) {
          contentCols.push(makeVlist(context, col, 'individualShift'));
        }
      } // Iterate over each column description.
      // Each `colDesc` will indicate whether to insert a gap, a rule or
      // a column from 'contentCols'


      var cols = [];
      var prevColContent = false;
      var prevColRule = false;
      var currentContentCol = 0;
      var firstColumn = !this.lFence;
      var _iteratorNormalCompletion17 = true;
      var _didIteratorError17 = false;
      var _iteratorError17 = undefined;

      try {
        for (var _iterator17 = colFormat[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
          var colDesc = _step17.value;

          if (colDesc.align && currentContentCol >= contentCols.length) {
            break;
          } else if (colDesc.align && currentContentCol < contentCols.length) {
            // If an alignment is specified, insert a column of content
            if (prevColContent) {
              // If no gap was provided, insert a default gap between
              // consecutive columns of content
              cols.push(makeColGap(2 * _fontMetrics.METRICS.arraycolsep));
            } else if (prevColRule || firstColumn) {
              // If the previous column was a rule or this is the first column
              // add a smaller gap
              cols.push(makeColGap(_fontMetrics.METRICS.arraycolsep));
            }

            cols.push(makeSpan(contentCols[currentContentCol], 'col-align-' + colDesc.align));
            currentContentCol++;
            prevColContent = true;
            prevColRule = false;
            firstColumn = false;
          } else if (typeof colDesc.gap !== 'undefined') {
            // Something to insert in between columns of content
            if (typeof colDesc.gap === 'number') {
              // It's a number, indicating how much space, in em,
              // to leave in between columns
              cols.push(makeColGap(colDesc.gap));
            } else {
              // It's a mathlist
              // Create a column made up of the mathlist
              // as many times as there are rows.
              cols.push(makeColOfRepeatingElements(context, body, offset, colDesc.gap));
            }

            prevColContent = false;
            prevColRule = false;
            firstColumn = false;
          } else if (colDesc.rule) {
            // It's a rule.
            var separator = makeSpan(null, 'vertical-separator');
            separator.setStyle('height', totalHeight, 'em'); // result.setTop((1 - context.mathstyle.sizeMultiplier) *
            //     context.mathstyle.metrics.axisHeight);

            separator.setStyle('margin-top', 3 * context.mathstyle.metrics.axisHeight - offset, 'em');
            separator.setStyle('vertical-align', 'top'); // separator.setStyle('display', 'inline-block');

            var gap = 0;

            if (prevColRule) {
              gap = _fontMetrics.METRICS.doubleRuleSep - _fontMetrics.METRICS.arrayrulewidth;
            } else if (prevColContent) {
              gap = _fontMetrics.METRICS.arraycolsep - _fontMetrics.METRICS.arrayrulewidth;
            }

            separator.setLeft(gap, 'em');
            cols.push(separator);
            prevColContent = false;
            prevColRule = true;
            firstColumn = false;
          }
        }
      } catch (err) {
        _didIteratorError17 = true;
        _iteratorError17 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion17 && _iterator17.return != null) {
            _iterator17.return();
          }
        } finally {
          if (_didIteratorError17) {
            throw _iteratorError17;
          }
        }
      }

      if (prevColContent && !this.rFence) {
        // If the last column was content, add a small gap
        cols.push(makeColGap(_fontMetrics.METRICS.arraycolsep));
      }

      if ((!this.lFence || this.lFence === '.') && (!this.rFence || this.rFence === '.')) {
        // There are no delimiters around the array, just return what
        // we've built so far.
        return makeOrd(cols, 'mtable');
      } // There is at least one delimiter. Wrap the core of the array with
      // appropriate left and right delimiters
      // const inner = makeSpan(makeSpan(cols, 'mtable'), 'mord');


      var inner = makeSpan(cols, 'mtable');

      var innerHeight = _span3.default.height(inner);

      var innerDepth = _span3.default.depth(inner);

      return makeOrd([this.bind(context, _delimiters.default.makeLeftRightDelim('mopen', this.lFence, innerHeight, innerDepth, context)), inner, this.bind(context, _delimiters.default.makeLeftRightDelim('mclose', this.rFence, innerHeight, innerDepth, context))]);
    }
    /**
     * Gengrac -- Generalized fraction
     *
     * Decompose fractions, binomials, and in general anything made
     * of two expressions on top of each other, optionally separated by a bar,
     * and optionally surrounded by fences (parentheses, brackets, etc...)
     *
     * Depending on the type of fraction the mathstyle is either
     * display math or inline math (which is indicated by 'textstyle'). This value can
     * also be set to 'auto', which indicates it should use the current mathstyle
     *
     * @method MathAtom#decomposeGenfrac
     */

  }, {
    key: "decomposeGenfrac",
    value: function decomposeGenfrac(context) {
      var mathstyle = this.mathstyle === 'auto' ? context.mathstyle : _mathstyle.default.toMathstyle(this.mathstyle);
      var newContext = context.clone({
        mathstyle: mathstyle
      });
      var numer = [];

      if (this.numerPrefix) {
        numer.push(makeOrd(this.numerPrefix));
      }

      var numeratorStyle = this.continuousFraction ? mathstyle : mathstyle.fracNum();
      numer = numer.concat(_decompose(newContext.clone({
        mathstyle: numeratorStyle
      }), this.numer));
      var numerReset = makeHlist(numer, context.mathstyle.adjustTo(numeratorStyle));
      var denom = [];

      if (this.denomPrefix) {
        denom.push(makeOrd(this.denomPrefix));
      }

      var denominatorStyle = this.continuousFraction ? mathstyle : mathstyle.fracDen();
      denom = denom.concat(_decompose(newContext.clone({
        mathstyle: denominatorStyle
      }), this.denom));
      var denomReset = makeHlist(denom, context.mathstyle.adjustTo(denominatorStyle));
      var ruleWidth = !this.hasBarLine ? 0 : _fontMetrics.METRICS.defaultRuleThickness / mathstyle.sizeMultiplier; // Rule 15b from Appendix G

      var numShift;
      var clearance;
      var denomShift;

      if (mathstyle.size === _mathstyle.default.DISPLAY.size) {
        numShift = mathstyle.metrics.num1;

        if (ruleWidth > 0) {
          clearance = 3 * ruleWidth;
        } else {
          clearance = 7 * _fontMetrics.METRICS.defaultRuleThickness;
        }

        denomShift = mathstyle.metrics.denom1;
      } else {
        if (ruleWidth > 0) {
          numShift = mathstyle.metrics.num2;
          clearance = ruleWidth;
        } else {
          numShift = mathstyle.metrics.num3;
          clearance = 3 * _fontMetrics.METRICS.defaultRuleThickness;
        }

        denomShift = mathstyle.metrics.denom2;
      }

      var numerDepth = numerReset ? numerReset.depth : 0;
      var denomHeight = denomReset ? denomReset.height : 0;
      var frac;

      if (ruleWidth === 0) {
        // Rule 15c from Appendix G
        // No bar line between numerator and denominator
        var candidateClearance = numShift - numerDepth - (denomHeight - denomShift);

        if (candidateClearance < clearance) {
          numShift += 0.5 * (clearance - candidateClearance);
          denomShift += 0.5 * (clearance - candidateClearance);
        }

        frac = makeVlist(newContext, [numerReset, -numShift, denomReset, denomShift], 'individualShift');
      } else {
        // Rule 15d from Appendix G
        // There is a bar line between the numerator and the denominator
        var axisHeight = mathstyle.metrics.axisHeight;

        if (numShift - numerDepth - (axisHeight + 0.5 * ruleWidth) < clearance) {
          numShift += clearance - (numShift - numerDepth - (axisHeight + 0.5 * ruleWidth));
        }

        if (axisHeight - 0.5 * ruleWidth - (denomHeight - denomShift) < clearance) {
          denomShift += clearance - (axisHeight - 0.5 * ruleWidth - (denomHeight - denomShift));
        }

        var mid = makeSpan(null,
        /* newContext.mathstyle.adjustTo(Mathstyle.TEXT) + */
        ' frac-line');
        mid.applyStyle(this.getStyle()); // @todo: do we really need to reset the size?
        // Manually set the height of the line because its height is
        // created in CSS

        mid.height = ruleWidth;
        var elements = [];

        if (numerReset) {
          elements.push(numerReset);
          elements.push(-numShift);
        }

        elements.push(mid);
        elements.push(ruleWidth / 2 - axisHeight);

        if (denomReset) {
          elements.push(denomReset);
          elements.push(denomShift);
        }

        frac = makeVlist(newContext, elements, 'individualShift');
      } // Add a 'mfrac' class to provide proper context for
      // other css selectors (such as 'frac-line')


      frac.classes += ' mfrac'; // Since we manually change the style sometimes (with \dfrac or \tfrac),
      // account for the possible size change here.

      frac.height *= mathstyle.sizeMultiplier / context.mathstyle.sizeMultiplier;
      frac.depth *= mathstyle.sizeMultiplier / context.mathstyle.sizeMultiplier; // if (!this.leftDelim && !this.rightDelim) {
      //     return makeOrd(frac,
      //         context.parentMathstyle.adjustTo(mathstyle) +
      //         ((context.parentSize !== context.size) ?
      //             (' sizing reset-' + context.parentSize + ' ' + context.size) : ''));
      // }
      // Rule 15e of Appendix G

      var delimSize = mathstyle.size === _mathstyle.default.DISPLAY.size ? mathstyle.metrics.delim1 : mathstyle.metrics.delim2; // Optional delimiters

      var leftDelim = _delimiters.default.makeCustomSizedDelim('mopen', this.leftDelim, delimSize, true, context.clone({
        mathstyle: mathstyle
      }));

      var rightDelim = _delimiters.default.makeCustomSizedDelim('mclose', this.rightDelim, delimSize, true, context.clone({
        mathstyle: mathstyle
      }));

      leftDelim.applyStyle(this.getStyle());
      rightDelim.applyStyle(this.getStyle());
      var result = makeOrd([leftDelim, frac, rightDelim], context.parentSize !== context.size ? 'sizing reset-' + context.parentSize + ' ' + context.size : '');
      return result;
    }
    /**
      *  \left....\right
      *
      * Note that we can encounter malformed \left...\right, for example
      * a \left without a matching \right or vice versa. In that case, the
      * leftDelim (resp. rightDelim) will be undefined. We still need to handle
      * those cases.
      *
     * @method MathAtom#decomposeLeftright
      */

  }, {
    key: "decomposeLeftright",
    value: function decomposeLeftright(context) {
      if (!this.body) {
        // No body, only a delimiter
        if (this.leftDelim) {
          return new MathAtom('math', 'mopen', this.leftDelim).decompose(context);
        }

        if (this.rightDelim) {
          return new MathAtom('math', 'mclose', this.rightDelim).decompose(context);
        }

        return null;
      } // The scope of the context is this group, so make a copy of it
      // so that any changes to it will be discarded when finished
      // with this group.


      var localContext = context.clone();

      var inner = _decompose(localContext, this.body);

      var mathstyle = localContext.mathstyle;
      var innerHeight = 0;
      var innerDepth = 0;
      var result = []; // Calculate its height and depth
      // The size of delimiters is the same, regardless of what mathstyle we are
      // in. Thus, to correctly calculate the size of delimiter we need around
      // a group, we scale down the inner size based on the size.

      innerHeight = _span3.default.height(inner) * mathstyle.sizeMultiplier;
      innerDepth = _span3.default.depth(inner) * mathstyle.sizeMultiplier; // Add the left delimiter to the beginning of the expression

      if (this.leftDelim) {
        result.push(_delimiters.default.makeLeftRightDelim('mopen', this.leftDelim, innerHeight, innerDepth, localContext));
        result[result.length - 1].applyStyle(this.getStyle());
      }

      if (inner) {
        // Replace the delim (\middle) spans with proper ones now that we know
        // the height/depth
        for (var i = 0; i < inner.length; i++) {
          if (inner[i].delim) {
            var savedCaret = inner[i].caret;
            var savedSelected = /ML__selected/.test(inner[i].classes);
            inner[i] = _delimiters.default.makeLeftRightDelim('minner', inner[i].delim, innerHeight, innerDepth, localContext);
            inner[i].caret = savedCaret;
            inner[i].selected(savedSelected);
          }
        }

        result = result.concat(inner);
      } // Add the right delimiter to the end of the expression.


      if (this.rightDelim) {
        var delim = this.rightDelim;
        var classes;

        if (delim === '?') {
          // Use a placeholder delimiter matching the open delimiter
          delim = {
            '(': ')',
            '\\{': '\\}',
            '\\[': '\\]',
            '\\lbrace': '\\rbrace',
            '\\langle': '\\rangle',
            '\\lfloor': '\\rfloor',
            '\\lceil': '\\rceil',
            '\\vert': '\\vert',
            '\\lvert': '\\rvert',
            '\\Vert': '\\Vert',
            '\\lVert': '\\rVert',
            '\\lbrack': '\\rbrack',
            "\\ulcorner": "\\urcorner",
            '\\llcorner': '\\lrcorner',
            '\\lgroup': '\\rgroup',
            '\\lmoustache': '\\rmoustache'
          }[this.leftDelim];
          delim = delim || this.leftDelim;
          classes = 'ML__smart-fence__close';
        }

        result.push(_delimiters.default.makeLeftRightDelim('mclose', delim, innerHeight, innerDepth, localContext, classes));
        result[result.length - 1].applyStyle(this.getStyle());
      } // If the `inner` flag is set, return the `inner` element (that's the
      // behavior for the regular `\left...\right`


      if (this.inner) return makeInner(result, mathstyle.cls()); // Otherwise, include a `\mathopen{}...\mathclose{}`. That's the
      // behavior for `\mleft...\mright`, which allows for tighter spacing
      // for example in `\sin\mleft(x\mright)`

      return result;
    }
  }, {
    key: "decomposeSurd",
    value: function decomposeSurd(context) {
      // See the TeXbook pg. 443, Rule 11.
      // http://www.ctex.org/documents/shredder/src/texbook.pdf
      var mathstyle = context.mathstyle; // First, we do the same steps as in overline to build the inner group
      // and line

      var inner = _decompose(context.cramp(), this.body);

      var ruleWidth = _fontMetrics.METRICS.defaultRuleThickness / mathstyle.sizeMultiplier;
      var phi = ruleWidth;

      if (mathstyle.id < _mathstyle.default.TEXT.id) {
        phi = mathstyle.metrics.xHeight;
      } // Calculate the clearance between the body and line


      var lineClearance = ruleWidth + phi / 4;
      var innerTotalHeight = Math.max(2 * phi, (_span3.default.height(inner) + _span3.default.depth(inner)) * mathstyle.sizeMultiplier);
      var minDelimiterHeight = innerTotalHeight + (lineClearance + ruleWidth); // Create a \surd delimiter of the required minimum size

      var delim = makeSpan(_delimiters.default.makeCustomSizedDelim('', '\\surd', minDelimiterHeight, false, context), 'sqrt-sign');
      delim.applyStyle(this.getStyle());
      var delimDepth = delim.height + delim.depth - ruleWidth; // Adjust the clearance based on the delimiter size

      if (delimDepth > _span3.default.height(inner) + _span3.default.depth(inner) + lineClearance) {
        lineClearance = (lineClearance + delimDepth - (_span3.default.height(inner) + _span3.default.depth(inner))) / 2;
      } // Shift the delimiter so that its top lines up with the top of the line


      delim.setTop(delim.height - _span3.default.height(inner) - (lineClearance + ruleWidth));
      var line = makeSpan(null, context.mathstyle.adjustTo(_mathstyle.default.TEXT) + ' sqrt-line');
      line.applyStyle(this.getStyle());
      line.height = ruleWidth;
      var body = makeVlist(context, [inner, lineClearance, line, ruleWidth]);

      if (!this.index) {
        return makeOrd([delim, body], 'sqrt');
      } // Handle the optional root index
      // The index is always in scriptscript style


      var newcontext = context.clone({
        mathstyle: _mathstyle.default.SCRIPTSCRIPT
      });
      var root = makeSpan(_decompose(newcontext, this.index), mathstyle.adjustTo(_mathstyle.default.SCRIPTSCRIPT)); // Figure out the height and depth of the inner part

      var innerRootHeight = Math.max(delim.height, body.height);
      var innerRootDepth = Math.max(delim.depth, body.depth); // The amount the index is shifted by. This is taken from the TeX
      // source, in the definition of `\r@@t`.

      var toShift = 0.6 * (innerRootHeight - innerRootDepth); // Build a VList with the superscript shifted up correctly

      var rootVlist = makeVlist(context, [root], 'shift', -toShift); // Add a class surrounding it so we can add on the appropriate
      // kerning

      return makeOrd([makeSpan(rootVlist, 'root'), delim, body], 'sqrt');
    }
  }, {
    key: "decomposeAccent",
    value: function decomposeAccent(context) {
      // Accents are handled in the TeXbook pg. 443, rule 12.
      var mathstyle = context.mathstyle; // Build the base atom

      var base = _decompose(context.cramp(), this.body);

      if (this.superscript || this.subscript) {
        // If there is a supsub attached to the accent
        // apply it to the base.
        // Note this does not give the same result as TeX when there
        // are stacked accents, e.g. \vec{\breve{\hat{\acute{...}}}}^2
        base = this.attachSupsub(context, makeOrd(base), 'mord');
      } // Calculate the skew of the accent. This is based on the line "If the
      // nucleus is not a single character, let s = 0; otherwise set s to the
      // kern amount for the nucleus followed by the \skewchar of its font."
      // Note that our skew metrics are just the kern between each character
      // and the skewchar.


      var skew = 0;

      if (Array.isArray(this.body) && this.body.length === 1 && this.body[0].isCharacterBox()) {
        skew = _span3.default.skew(base);
      } // calculate the amount of space between the body and the accent


      var clearance = Math.min(_span3.default.height(base), mathstyle.metrics.xHeight); // Build the accent

      var accent = _span3.default.makeSymbol('Main-Regular', this.accent, 'math'); // Remove the italic correction of the accent, because it only serves to
      // shift the accent over to a place we don't want.


      accent.italic = 0; // The \vec character that the fonts use is a combining character, and
      // thus shows up much too far to the left. To account for this, we add a
      // specific class which shifts the accent over to where we want it.

      var vecClass = this.accent === "\u20D7" ? ' accent-vec' : '';
      var accentBody = makeSpan(makeSpan(accent), 'accent-body' + vecClass);
      accentBody = makeVlist(context, [base, -clearance, accentBody]); // Shift the accent over by the skew. Note we shift by twice the skew
      // because we are centering the accent, so by adding 2*skew to the left,
      // we shift it to the right by 1*skew.

      accentBody.children[1].setLeft(2 * skew);
      return makeOrd(accentBody, 'accent');
    }
    /**
     * \overline and \underline
     *
     * @method MathAtom#decomposeLine
     */

  }, {
    key: "decomposeLine",
    value: function decomposeLine(context) {
      var mathstyle = context.mathstyle; // TeXBook:443. Rule 9 and 10

      var inner = _decompose(context.cramp(), this.body);

      var ruleWidth = _fontMetrics.METRICS.defaultRuleThickness / mathstyle.sizeMultiplier;
      var line = makeSpan(null, context.mathstyle.adjustTo(_mathstyle.default.TEXT) + ' ' + this.position + '-line');
      line.height = ruleWidth;
      line.maxFontSize = 1.0;
      var vlist;

      if (this.position === 'overline') {
        vlist = makeVlist(context, [inner, 3 * ruleWidth, line, ruleWidth]);
      } else {
        var innerSpan = makeSpan(inner);
        vlist = makeVlist(context, [ruleWidth, line, 3 * ruleWidth, innerSpan], 'top', _span3.default.height(innerSpan));
      }

      return makeOrd(vlist, this.position);
    }
  }, {
    key: "decomposeOverunder",
    value: function decomposeOverunder(context) {
      var base = _decompose(context, this.body);

      var annotationStyle = context.clone({
        mathstyle: 'scriptstyle'
      });
      var above = this.overscript ? makeSpan(_decompose(annotationStyle, this.overscript), context.mathstyle.adjustTo(annotationStyle.mathstyle)) : null;
      var below = this.underscript ? makeSpan(_decompose(annotationStyle, this.underscript), context.mathstyle.adjustTo(annotationStyle.mathstyle)) : null;
      return makeStack(context, base, 0, 0, above, below, this.mathtype || 'mrel');
    }
  }, {
    key: "decomposeOverlap",
    value: function decomposeOverlap(context) {
      var inner = makeSpan(_decompose(context, this.body), 'inner');
      return makeOrd([inner, makeSpan(null, 'fix')], this.align === 'left' ? 'llap' : 'rlap');
    }
    /**
     * \rule
     * @memberof MathAtom
     * @instance
     */

  }, {
    key: "decomposeRule",
    value: function decomposeRule(context) {
      var mathstyle = context.mathstyle;
      var result = makeOrd('', 'rule');
      var shift = this.shift && !isNaN(this.shift) ? this.shift : 0;
      shift = shift / mathstyle.sizeMultiplier;
      var width = this.width / mathstyle.sizeMultiplier;
      var height = this.height / mathstyle.sizeMultiplier;
      result.setStyle('border-right-width', width, 'em');
      result.setStyle('border-top-width', height, 'em');
      result.setStyle('margin-top', -(height - shift), 'em');
      result.setStyle('border-color', context.color);
      result.width = width;
      result.height = height + shift;
      result.depth = -shift;
      return result;
    }
  }, {
    key: "decomposeOp",
    value: function decomposeOp(context) {
      // Operators are handled in the TeXbook pg. 443-444, rule 13(a).
      var mathstyle = context.mathstyle;
      var large = false;

      if (mathstyle.size === _mathstyle.default.DISPLAY.size && typeof this.body === 'string' && this.body !== '\\smallint') {
        // Most symbol operators get larger in displaystyle (rule 13)
        large = true;
      }

      var base;
      var baseShift = 0;
      var slant = 0;

      if (this.symbol) {
        // If this is a symbol, create the symbol.
        var fontName = large ? 'Size2-Regular' : 'Size1-Regular';
        base = _span3.default.makeSymbol(fontName, this.body, 'op-symbol ' + (large ? 'large-op' : 'small-op'));
        base.type = 'mop'; // Shift the symbol so its center lies on the axis (rule 13). It
        // appears that our fonts have the centers of the symbols already
        // almost on the axis, so these numbers are very small. Note we
        // don't actually apply this here, but instead it is used either in
        // the vlist creation or separately when there are no limits.

        baseShift = (base.height - base.depth) / 2 - mathstyle.metrics.axisHeight * mathstyle.sizeMultiplier; // The slant of the symbol is just its italic correction.

        slant = base.italic; // Bind the generated span and this atom so the atom can be retrieved
        // from the span later.

        this.bind(context, base);
      } else if (Array.isArray(this.body)) {
        // If this is a list, decompose that list.
        base = _span3.default.makeOp(_decompose(context, this.body)); // Bind the generated span and this atom so the atom can be retrieved
        // from the span later.

        this.bind(context, base);
      } else {
        // Otherwise, this is a text operator. Build the text from the
        // operator's name.
        console.assert(this.type === 'mop');
        base = this.makeSpan(context, this.body);
      }

      if (this.superscript || this.subscript) {
        var limits = this.limits || 'auto';

        if (this.alwaysHandleSupSub || limits === 'limits' || limits === 'auto' && mathstyle.size === _mathstyle.default.DISPLAY.size) {
          return this.attachLimits(context, base, baseShift, slant);
        }

        return this.attachSupsub(context, base, 'mop');
      }

      if (this.symbol) base.setTop(baseShift);
      return base;
    }
  }, {
    key: "decomposeBox",
    value: function decomposeBox(context) {
      // Base is the main content "inside" the box
      var base = makeOrd(_decompose(context, this.body)); // This span will represent the box (background and border)
      // It's positioned to overlap the base

      var box = makeSpan();
      box.setStyle('position', 'absolute'); // The padding extends outside of the base

      var padding = typeof this.padding === 'number' ? this.padding : _fontMetrics.METRICS.fboxsep;
      box.setStyle('height', base.height + base.depth + 2 * padding, 'em');

      if (padding !== 0) {
        box.setStyle('width', 'calc(100% + ' + 2 * padding + 'em)');
      } else {
        box.setStyle('width', '100%');
      }

      box.setStyle('top', -padding, 'em');
      box.setStyle('left', -padding, 'em');
      box.setStyle('z-index', '-1'); // Ensure the box is *behind* the base

      if (this.backgroundcolor) box.setStyle('background-color', this.backgroundcolor);
      if (this.framecolor) box.setStyle('border', _fontMetrics.METRICS.fboxrule + 'em solid ' + this.framecolor);
      if (this.border) box.setStyle('border', this.border);
      base.setStyle('display', 'inline-block');
      base.setStyle('height', base.height + base.depth, 'em');
      base.setStyle('vertical-align', -base.depth + padding, 'em'); // The result is a span that encloses the box and the base

      var result = makeSpan([box, base]); // Set its position as relative so that the box can be absolute positioned
      // over the base

      result.setStyle('position', 'relative');
      result.setStyle('vertical-align', -padding + base.depth, 'em'); // The padding adds to the width and height of the pod

      result.height = base.height + padding;
      result.depth = base.depth + padding;
      result.setLeft(padding);
      result.setRight(padding);
      return result;
    }
  }, {
    key: "decomposeEnclose",
    value: function decomposeEnclose(context) {
      var base = makeOrd(_decompose(context, this.body));
      var result = base; // Account for the padding

      var padding = this.padding === 'auto' ? .2 : this.padding; // em

      result.setStyle('padding', padding, 'em');
      result.setStyle('display', 'inline-block');
      result.setStyle('height', result.height + result.depth, 'em');
      result.setStyle('left', -padding, 'em');

      if (this.backgroundcolor && this.backgroundcolor !== 'transparent') {
        result.setStyle('background-color', this.backgroundcolor);
      }

      var svg = '';
      if (this.notation.box) result.setStyle('border', this.borderStyle);

      if (this.notation.actuarial) {
        result.setStyle('border-top', this.borderStyle);
        result.setStyle('border-right', this.borderStyle);
      }

      if (this.notation.madruwb) {
        result.setStyle('border-bottom', this.borderStyle);
        result.setStyle('border-right', this.borderStyle);
      }

      if (this.notation.roundedbox) {
        result.setStyle('border-radius', (_span3.default.height(result) + _span3.default.depth(result)) / 2, 'em');
        result.setStyle('border', this.borderStyle);
      }

      if (this.notation.circle) {
        result.setStyle('border-radius', '50%');
        result.setStyle('border', this.borderStyle);
      }

      if (this.notation.top) result.setStyle('border-top', this.borderStyle);
      if (this.notation.left) result.setStyle('border-left', this.borderStyle);
      if (this.notation.right) result.setStyle('border-right', this.borderStyle);
      if (this.notation.bottom) result.setStyle('border-bottom', this.borderStyle);

      if (this.notation.horizontalstrike) {
        svg += '<line x1="3%"  y1="50%" x2="97%" y2="50%"';
        svg += " stroke-width=\"".concat(this.strokeWidth, "\" stroke=\"").concat(this.strokeColor, "\"");
        svg += ' stroke-linecap="round"';

        if (this.svgStrokeStyle) {
          svg += " stroke-dasharray=\"".concat(this.svgStrokeStyle, "\"");
        }

        svg += '/>';
      }

      if (this.notation.verticalstrike) {
        svg += '<line x1="50%"  y1="3%" x2="50%" y2="97%"';
        svg += " stroke-width=\"".concat(this.strokeWidth, "\" stroke=\"").concat(this.strokeColor, "\"");
        svg += ' stroke-linecap="round"';

        if (this.svgStrokeStyle) {
          svg += " stroke-dasharray=\"".concat(this.svgStrokeStyle, "\"");
        }

        svg += '/>';
      }

      if (this.notation.updiagonalstrike) {
        svg += '<line x1="3%"  y1="97%" x2="97%" y2="3%"';
        svg += " stroke-width=\"".concat(this.strokeWidth, "\" stroke=\"").concat(this.strokeColor, "\"");
        svg += ' stroke-linecap="round"';

        if (this.svgStrokeStyle) {
          svg += " stroke-dasharray=\"".concat(this.svgStrokeStyle, "\"");
        }

        svg += '/>';
      }

      if (this.notation.downdiagonalstrike) {
        svg += '<line x1="3%"  y1="3%" x2="97%" y2="97%"';
        svg += " stroke-width=\"".concat(this.strokeWidth, "\" stroke=\"").concat(this.strokeColor, "\"");
        svg += ' stroke-linecap="round"';

        if (this.svgStrokeStyle) {
          svg += " stroke-dasharray=\"".concat(this.svgStrokeStyle, "\"");
        }

        svg += '/>';
      } // if (this.notation.updiagonalarrow) {
      //     const t = 1;
      //     const length = Math.sqrt(w * w + h * h);
      //     const f = 1 / length / 0.075 * t;
      //     const wf = w * f;
      //     const hf = h * f;
      //     const x = w - t / 2;
      //     let y = t / 2;
      //     if (y + hf - .4 * wf < 0 ) y = 0.4 * wf - hf;
      //     svg += '<line ';
      //     svg += `x1="1" y1="${h - 1}px" x2="${x - .7 * wf}px" y2="${y + .7 * hf}px"`;
      //     svg += ` stroke-width="${this.strokeWidth}" stroke="${this.strokeColor}"`;
      //     svg += ' stroke-linecap="round"';
      //     if (this.svgStrokeStyle) {
      //         svg += ` stroke-dasharray="${this.svgStrokeStyle}"`;
      //     }
      //     svg += '/>';
      //     svg += '<polygon points="';
      //     svg += `${x},${y} ${x - wf - .4 * hf},${y + hf - .4 * wf} `;
      //     svg += `${x - .7 * wf},${y + .7 * hf} ${x - wf + .4 * hf},${y + hf + .4 * wf} `;
      //     svg += `${x},${y}`;
      //     svg += `" stroke='none' fill="${this.strokeColor}"`;
      //     svg += '/>';
      // }
      // if (this.notation.phasorangle) {
      //     svg += '<path d="';
      //     svg += `M ${h / 2},1 L1,${h} L${w},${h} "`;
      //     svg += ` stroke-width="${this.strokeWidth}" stroke="${this.strokeColor}" fill="none"`;
      //     if (this.svgStrokeStyle) {
      //         svg += ' stroke-linecap="round"';
      //         svg += ` stroke-dasharray="${this.svgStrokeStyle}"`;
      //     }
      //     svg += '/>';
      // }
      // if (this.notation.radical) {
      //     svg += '<path d="';
      //     svg += `M 0,${.6 * h} L1,${h} L${emToPx(padding) * 2},1 "`;
      //     svg += ` stroke-width="${this.strokeWidth}" stroke="${this.strokeColor}" fill="none"`;
      //     if (this.svgStrokeStyle) {
      //         svg += ' stroke-linecap="round"';
      //         svg += ` stroke-dasharray="${this.svgStrokeStyle}"`;
      //     }
      //     svg += '/>';
      // }
      // if (this.notation.longdiv) {
      //     svg += '<path d="';
      //     svg += `M ${w} 1 L1 1 a${emToPx(padding)} ${h / 2}, 0, 0, 1, 1 ${h} "`;
      //     svg += ` stroke-width="${this.strokeWidth}" stroke="${this.strokeColor}" fill="none"`;
      //     if (this.svgStrokeStyle) {
      //         svg += ' stroke-linecap="round"';
      //         svg += ` stroke-dasharray="${this.svgStrokeStyle}"`;
      //     }
      //     svg += '/>';
      // }


      if (svg) {
        var svgStyle;

        if (this.shadow !== 'none') {
          if (this.shadow === 'auto') {
            svgStyle = 'filter: drop-shadow(0 0 .5px rgba(255, 255, 255, .7)) drop-shadow(1px 1px 2px #333)';
          } else {
            svgStyle = 'filter: drop-shadow(' + this.shadow + ')';
          }
        }

        return _span3.default.makeSVG(result, svg, svgStyle);
      }

      return result;
    }
    /**
     * Return a representation of this, but decomposed in an array of Spans
     *
     * @param {Context} context Font variant, size, color, etc...
     * @param {Span[]} [phantomBase=null] If not null, the spans to use to
     * calculate the placement of the supsub
     * @return {Span[]}
     * @method MathAtom#decompose
     */

  }, {
    key: "decompose",
    value: function decompose(context, phantomBase) {
      console.assert(context instanceof _context.default.Context);
      var result = null;

      if (!this.type || /mord|minner|mbin|mrel|mpunct|mopen|mclose|textord/.test(this.type)) {
        // The body of these atom types is *often* a string, but it can
        // be a atom list (for example a command inside a \text{})
        if (typeof this.body === 'string') {
          result = this.makeSpan(context, this.body);
        } else {
          result = this.makeSpan(context, _decompose(context, this.body));
        }

        result.type = this.type;
      } else if (this.type === 'group' || this.type === 'root') {
        result = this.decomposeGroup(context);
      } else if (this.type === 'array') {
        result = this.decomposeArray(context);
      } else if (this.type === 'genfrac') {
        result = this.decomposeGenfrac(context);
      } else if (this.type === 'surd') {
        result = this.decomposeSurd(context);
      } else if (this.type === 'accent') {
        result = this.decomposeAccent(context);
      } else if (this.type === 'leftright') {
        result = this.decomposeLeftright(context);
      } else if (this.type === 'delim') {
        result = makeSpan(null, '');
        result.delim = this.delim;
      } else if (this.type === 'sizeddelim') {
        result = this.bind(context, _delimiters.default.makeSizedDelim(this.cls, this.delim, this.size, context));
      } else if (this.type === 'line') {
        result = this.decomposeLine(context);
      } else if (this.type === 'overunder') {
        result = this.decomposeOverunder(context);
      } else if (this.type === 'overlap') {
        // For llap (18), rlap (270), clap (0)
        // smash (common), mathllap (0), mathrlap (0), mathclap (0)
        // See https://www.tug.org/TUGboat/tb22-4/tb72perlS.pdf
        // and https://tex.stackexchange.com/questions/98785/what-are-the-different-kinds-of-vertical-spacing-and-horizontal-spacing-commands
        result = this.decomposeOverlap(context);
      } else if (this.type === 'rule') {
        result = this.decomposeRule(context);
      } else if (this.type === 'styling') {//
        // STYLING
        //
      } else if (this.type === 'msubsup') {
        // The caret for this atom type is handled by its elements
        result = makeOrd("\u200B");

        if (phantomBase) {
          result.height = phantomBase[0].height;
          result.depth = phantomBase[0].depth;
        }
      } else if (this.type === 'mop') {
        result = this.decomposeOp(context);
      } else if (this.type === 'space') {
        // A space literal
        result = this.makeSpan(context, ' ');
      } else if (this.type === 'spacing') {
        // A spacing command (\quad, etc...)
        if (this.body === "\u200B") {
          // ZERO-WIDTH SPACE
          result = this.makeSpan(context, "\u200B");
        } else if (this.body === "\xA0") {
          if (this.mode === 'math') {
            result = this.makeSpan(context, ' ');
          } else {
            result = this.makeSpan(context, "\xA0");
          }
        } else if (this.width) {
          result = makeSpan("\u200B", 'mspace ');

          if (this.width > 0) {
            result.setWidth(this.width);
          } else {
            result.setStyle('margin-left', this.width, 'em');
          }
        } else {
          var spacingCls = {
            'qquad': 'qquad',
            'quad': 'quad',
            'enspace': 'enspace',
            ';': 'thickspace',
            ':': 'mediumspace',
            ',': 'thinspace',
            '!': 'negativethinspace'
          }[this.body] || 'quad';
          result = makeSpan("\u200B", 'mspace ' + spacingCls);
        }
      } else if (this.type === 'mathstyle') {
        context.setMathstyle(this.mathstyle);
      } else if (this.type === 'box') {
        result = this.decomposeBox(context);
      } else if (this.type === 'enclose') {
        result = this.decomposeEnclose(context);
      } else if (this.type === 'command' || this.type === 'error') {
        result = this.makeSpan(context, this.body);
        result.classes = ''; // Override fonts and other attributes.

        if (this.error) {
          result.classes += ' ML__error';
        }

        if (this.suggestion) {
          result.classes += ' ML__suggestion';
        }
      } else if (this.type === 'placeholder') {
        result = this.makeSpan(context, '⬚');
      } else if (this.type === 'first') {
        // the `first` pseudo-type is used as a placeholder as
        // the first element in a children list. This makes
        // managing the list, and the caret selection, easier.
        // ZERO-WIDTH SPACE
        result = this.makeSpan(context, "\u200B");
      } else {
        //
        // DEFAULT
        //
        console.assert(false, 'Unknown MathAtom type: "' + this.type + '"');
      }

      if (!result) return result;

      if (this.caret && this.type !== 'styling' && this.type !== 'msubsup' && this.type !== 'command' && this.type !== 'placeholder' && this.type !== 'first') {
        if (Array.isArray(result)) {
          result[result.length - 1].caret = this.caret;
        } else {
          result.caret = this.caret;
        }
      } // Finally, attach any necessary superscript, subscripts


      if (!this.limits && (this.superscript || this.subscript)) {
        // If limits is set, the attachment of sup/sub was handled
        // in the atom decomposition (e.g. decomposeOp, decomposeAccent)
        if (Array.isArray(result)) {
          var lastSpan = result[result.length - 1];
          result[result.length - 1] = this.attachSupsub(context, lastSpan, lastSpan.type);
        } else {
          result = [this.attachSupsub(context, result, result.type)];
        }
      }

      return Array.isArray(result) ? result : [result];
    }
  }, {
    key: "attachSupsub",
    value: function attachSupsub(context, nucleus, type) {
      // If no superscript or subscript, nothing to do.
      if (!this.superscript && !this.subscript) return nucleus; // Superscript and subscripts are discussed in the TeXbook
      // on page 445-446, rules 18(a-f).
      // TeX:14859-14945

      var mathstyle = context.mathstyle;
      var supmid = null;
      var submid = null;

      if (this.superscript) {
        var sup = _decompose(context.sup(), this.superscript);

        supmid = makeSpan(sup, mathstyle.adjustTo(mathstyle.sup()));
      }

      if (this.subscript) {
        var sub = _decompose(context.sub(), this.subscript);

        submid = makeSpan(sub, mathstyle.adjustTo(mathstyle.sub()));
      } // Rule 18a


      var supShift = 0;
      var subShift = 0;

      if (!this.isCharacterBox()) {
        supShift = _span3.default.height(nucleus) - mathstyle.metrics.supDrop;
        subShift = _span3.default.depth(nucleus) + mathstyle.metrics.subDrop;
      } // Rule 18c


      var minSupShift;

      if (mathstyle === _mathstyle.default.DISPLAY) {
        minSupShift = mathstyle.metrics.sup1;
      } else if (mathstyle.cramped) {
        minSupShift = mathstyle.metrics.sup3;
      } else {
        minSupShift = mathstyle.metrics.sup2;
      } // scriptspace is a font-size-independent size, so scale it
      // appropriately


      var multiplier = _mathstyle.default.TEXT.sizeMultiplier * mathstyle.sizeMultiplier;
      var scriptspace = 0.5 / _fontMetrics.METRICS.ptPerEm / multiplier;
      var supsub = null;

      if (submid && supmid) {
        // Rule 18e
        supShift = Math.max(supShift, minSupShift, supmid.depth + 0.25 * mathstyle.metrics.xHeight);
        subShift = Math.max(subShift, mathstyle.metrics.sub2);
        var ruleWidth = _fontMetrics.METRICS.defaultRuleThickness;

        if (supShift - _span3.default.depth(supmid) - (_span3.default.height(submid) - subShift) < 4 * ruleWidth) {
          subShift = 4 * ruleWidth - (supShift - supmid.depth) + _span3.default.height(submid);

          var psi = 0.8 * mathstyle.metrics.xHeight - (supShift - _span3.default.depth(supmid));

          if (psi > 0) {
            supShift += psi;
            subShift -= psi;
          }
        }

        supsub = makeVlist(context, [submid, subShift, supmid, -supShift], 'individualShift'); // Subscripts shouldn't be shifted by the nucleus' italic correction.
        // Account for that by shifting the subscript back the appropriate
        // amount. Note we only do this when the nucleus is a single symbol.

        if (this.symbol) {
          supsub.children[0].setLeft(-_span3.default.italic(nucleus));
        }
      } else if (submid && !supmid) {
        // Rule 18b
        subShift = Math.max(subShift, mathstyle.metrics.sub1, _span3.default.height(submid) - 0.8 * mathstyle.metrics.xHeight);
        supsub = makeVlist(context, [submid], 'shift', subShift);
        supsub.children[0].setRight(scriptspace);

        if (this.isCharacterBox()) {
          supsub.children[0].setLeft(-_span3.default.italic(nucleus));
        }
      } else if (!submid && supmid) {
        // Rule 18c, d
        supShift = Math.max(supShift, minSupShift, supmid.depth + 0.25 * mathstyle.metrics.xHeight);
        supsub = makeVlist(context, [supmid], 'shift', -supShift);
        supsub.children[0].setRight(scriptspace);
      } // Display the caret *following* the superscript and subscript,
      // so attach the caret to the 'msubsup' element.


      var supsubContainer = makeSpan(supsub, 'msubsup');

      if (this.caret) {
        supsubContainer.caret = this.caret;
      }

      return _span3.default.makeSpanOfType(type, [nucleus, supsubContainer]);
    }
  }, {
    key: "attachLimits",
    value: function attachLimits(context, nucleus, nucleusShift, slant) {
      var limitAbove = this.superscript ? makeSpan(_decompose(context.sup(), this.superscript), context.mathstyle.adjustTo(context.mathstyle.sup())) : null;
      var limitBelow = this.subscript ? makeSpan(_decompose(context.sub(), this.subscript), context.mathstyle.adjustTo(context.mathstyle.sub())) : null;
      return makeStack(context, nucleus, nucleusShift, slant, limitAbove, limitBelow, 'mop');
    }
    /**
     * Add an ID attribute to both the span and this atom so that the atom
     * can be retrieved from the span later on (e.g. when the span is clicked on)
     * @param {Context} context
     * @param {Span} span
     * @method MathAtom#bind
     */

  }, {
    key: "bind",
    value: function bind(context, span) {
      if (this.type !== 'first' && this.body !== "\u200B") {
        this.id = makeID(context);

        if (this.id) {
          if (!span.attributes) span.attributes = {};
          span.attributes['data-atom-id'] = this.id;
        }
      }

      return span;
    }
    /**
     * Create a span with the specified body and with a class attribute
     * equal to the type ('mbin', 'inner', 'spacing', etc...)
     *
     * @param {Context} context
     * @param {(string|Span[])} body
     * @return {Span}
     * @method MathAtom#makeSpan
     */

  }, {
    key: "makeSpan",
    value: function makeSpan(context, body) {
      var type = this.type === 'textord' ? 'mord' : this.type;

      var result = _span3.default.makeSpanOfType(type, body); // The font family is determined by:
      // - the base font family associated with this atom (optional). For example,
      // some atoms such as some functions ('\sin', '\cos', etc...) or some
      // symbols ('\Z') have an explicit font family. This overrides any 
      // other font family
      // - the user-specified font family that has been explicitly applied to 
      // this atom
      // - the font family automatically determined in math mode, for example
      // which italicizes some characters, but which can be overridden


      var style = this.getStyle();
      result.applyStyle(style); // Apply size correction

      var size = style && style.fontSize ? style.fontSize : 'size5';

      if (size !== context.parentSize) {
        result.classes += ' sizing reset-' + context.parentSize;
        result.classes += ' ' + size;
      } else if (context.parentSize !== context.size) {
        result.classes += ' sizing reset-' + context.parentSize;
        result.classes += ' ' + context.size;
      }

      result.maxFontSize = Math.max(result.maxFontSize, context.sizeMultiplier || 1.0); // Set other attributes

      if (this.mode === 'text') result.classes += ' ML__text';
      if (context.mathstyle.isTight()) result.isTight = true; // The italic correction applies only in math mode

      if (this.mode !== 'math') result.italic = 0;
      result.setRight(result.italic); // Italic correction

      if (typeof context.opacity === 'number') result.setStyle('opacity', context.opacity); // To retrieve the atom from a span, for example when the span is clicked
      // on, attach a randomly generated ID to the span and associate it
      // with the atom.

      this.bind(context, result);

      if (this.caret) {
        // If this has a super/subscript, the caret will be attached
        // to the 'msubsup' atom, so no need to have it here.
        if (!this.superscript && !this.subscript) {
          result.caret = this.caret;
          if (context.mathstyle.isTight()) result.isTight = true;
        }
      }

      return result;
    }
  }]);

  return MathAtom;
}();
/**
 * Used in `decomposeArray` to create a column separator span.
 *
 * @param {number} width
 * @memberof module:mathAtom
 * @private
 */


function makeColGap(width) {
  var separator = makeSpan("\u200B", 'arraycolsep');
  separator.setWidth(width, 'em');
  return separator;
}
/**
 * Used in decomposeArray to create a column of repeating elements.
 * @memberof module:mathAtom
 * @private
 */


function makeColOfRepeatingElements(context, body, offset, elem) {
  var col = [];
  var _iteratorNormalCompletion18 = true;
  var _didIteratorError18 = false;
  var _iteratorError18 = undefined;

  try {
    for (var _iterator18 = body[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
      var row = _step18.value;
      var cell = makeSpan(_decompose(context, elem));
      cell.depth = row.depth;
      cell.height = row.height;
      col.push(cell);
      col.push(row.pos - offset);
    }
  } catch (err) {
    _didIteratorError18 = true;
    _iteratorError18 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion18 && _iterator18.return != null) {
        _iterator18.return();
      }
    } finally {
      if (_didIteratorError18) {
        throw _iteratorError18;
      }
    }
  }

  return makeVlist(context, col, 'individualShift');
}

function makeID(context) {
  var result;

  if (typeof context.generateID === 'boolean' && context.generateID) {
    result = Date.now().toString(36).slice(-2) + Math.floor(Math.random() * 0x186a0).toString(36);
  } else if (typeof context.generateID !== 'boolean') {
    if (context.generateID.overrideID) {
      result = context.generateID.overrideID;
    } else {
      result = context.generateID.seed.toString(36);
      context.generateID.seed += 1;
    }
  }

  return result;
} ////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Combine a nucleus with an atom above and an atom below. Used to form
 * limits and used by \stackrel.
 *
 * @param {Context} context
 * @param {Span} nucleus The base over and under which the atoms will
 * be placed.
 * @param {number} nucleusShift The vertical shift of the nucleus from 
 * the baseline.
 * @param {number} slant For operators that have a slant, such as \int, 
 * indicate by how much to horizontally offset the above and below atoms
 * @param {Span} above
 * @param {Span} below
 * @param {string} type The type ('mop', 'mrel', etc...) of the result
 * @return {Span}
 * @memberof module:mathAtom
 * @private
 */


function makeStack(context, nucleus, nucleusShift, slant, above, below, type) {
  // If nothing above and nothing below, nothing to do.
  if (!above && !below) return nucleus; // IE 8 clips \int if it is in a display: inline-block. We wrap it
  // in a new span so it is an inline, and works.
  // @todo: revisit

  nucleus = makeSpan(nucleus);
  var aboveShift = 0;
  var belowShift = 0;

  if (above) {
    aboveShift = Math.max(_fontMetrics.METRICS.bigOpSpacing1, _fontMetrics.METRICS.bigOpSpacing3 - above.depth);
  }

  if (below) {
    belowShift = Math.max(_fontMetrics.METRICS.bigOpSpacing2, _fontMetrics.METRICS.bigOpSpacing4 - below.height);
  }

  var result = null;

  if (below && above) {
    var bottom = _fontMetrics.METRICS.bigOpSpacing5 + _span3.default.height(below) + _span3.default.depth(below) + belowShift + _span3.default.depth(nucleus) + nucleusShift;
    result = makeVlist(context, [_fontMetrics.METRICS.bigOpSpacing5, below, belowShift, nucleus, aboveShift, above, _fontMetrics.METRICS.bigOpSpacing5], 'bottom', bottom); // Here, we shift the limits by the slant of the symbol. Note
    // that we are supposed to shift the limits by 1/2 of the slant,
    // but since we are centering the limits adding a full slant of
    // margin will shift by 1/2 that.

    result.children[0].setLeft(-slant);
    result.children[2].setLeft(slant);
  } else if (below && !above) {
    var top = _span3.default.height(nucleus) - nucleusShift;
    result = makeVlist(context, [_fontMetrics.METRICS.bigOpSpacing5, below, belowShift, nucleus], 'top', top); // See comment above about slants

    result.children[0].setLeft(-slant);
  } else if (!below && above) {
    var _bottom = _span3.default.depth(nucleus) + nucleusShift;

    result = makeVlist(context, [nucleus, aboveShift, above, _fontMetrics.METRICS.bigOpSpacing5], 'bottom', _bottom); // See comment above about slants

    result.children[1].setLeft(slant);
  }

  return _span3.default.makeSpanOfType(type, result, 'op-limits');
}
/**
 * Return a list of spans equivalent to atoms.
 * A span is the most elementary type possible, for example 'text'
 * or 'vlist', while the input atoms may be more abstract and complex,
 * such as 'genfrac'
 *
 * @param {Context} context Font family, variant, size, color, etc...
 * @param {(MathAtom|MathAtom[])} atoms
 * @return {Span[]}
 * @memberof module:core/mathatom
 * @private
 */


function _decompose(context, atoms) {
  if (!(context instanceof _context.default.Context)) {
    // We can be passed either a Context object, or 
    // a simple object with some properties set.
    context = new _context.default.Context(context);
  } // In most cases we want to display selection,
  // except if the generateID.groupNumbers flag is set which is used for
  // read aloud.


  var displaySelection = !context.generateID || !context.generateID.groupNumbers;
  var result = [];

  if (Array.isArray(atoms)) {
    if (atoms.length === 0) {
      return result;
    } else if (atoms.length === 1) {
      result = atoms[0].decompose(context);

      if (result && displaySelection && atoms[0].isSelected) {
        result.forEach(function (x) {
          return x.selected(true);
        });
      }

      console.assert(!result || Array.isArray(result));
    } else {
      var previousType = 'none';
      var nextType = atoms[1].type;
      var selection = [];
      var digitStringID = null;
      var phantomBase = null;

      for (var i = 0; i < atoms.length; i++) {
        // Is this a binary operator ('+', '-', etc...) that potentially
        // needs to be adjusted to a unary operator?
        // 
        // When preceded by a mbin, mopen, mrel, mpunct, mop or
        // when followed by a mrel, mclose or mpunct
        // or if preceded or followed by no sibling, a 'mbin' becomes a
        // 'mord'
        if (atoms[i].type === 'mbin') {
          if (/first|none|mrel|mpunct|mopen|mbin|mop/.test(previousType) || /none|mrel|mpunct|mclose/.test(nextType)) {
            atoms[i].type = 'mord';
          }
        } // If this is a scaffolding supsub, we'll use the
        // phantomBase from the previous atom to position the supsub.
        // Otherwise, no need for the phantomBase


        if (atoms[i].body !== "\u200B" || !atoms[i].superscript && !atoms[i].subscript) {
          phantomBase = null;
        }

        if (context.generateID.groupNumbers && digitStringID && atoms[i].type === 'mord' && /[0-9,.]/.test(atoms[i].latex)) {
          context.generateID.overrideID = digitStringID;
        }

        var span = atoms[i].decompose(context, phantomBase);

        if (context.generateID) {
          context.generateID.overrideID = null;
        }

        if (span) {
          // The result from decompose is always an array
          // Flatten it (i.e. [[a1, a2], b1, b2] -> [a1, a2, b1, b2]
          var flat = [].concat.apply([], span);
          phantomBase = flat; // If this is a digit, keep track of it

          if (context.generateID && context.generateID.groupNumbers) {
            if (atoms[i].type === 'mord' && /[0-9,.]/.test(atoms[i].latex)) {
              if (!digitStringID) {
                digitStringID = atoms[i].id;
              }
            }

            if ((atoms[i].type !== 'mord' || /[0-9,.]/.test(atoms[i].latex) || atoms[i].superscript || atoms[i].subscript) && digitStringID) {
              // Done with digits
              digitStringID = null;
            }
          }

          if (displaySelection && atoms[i].isSelected) {
            selection = selection.concat(flat);
            selection.forEach(function (x) {
              return x.selected(true);
            });
          } else {
            if (selection.length > 0) {
              // There was a selection, but we're out of it now
              // Append the selection
              result = [].concat(_toConsumableArray(result), _toConsumableArray(selection));
              selection = [];
            }

            result = result.concat(flat);
          }
        } // Since the next atom (and this atom!) could have children
        // use getFinal...() and getInitial...() to get the closest
        // atom linearly.


        previousType = atoms[i].getFinalBaseElement().type;
        nextType = atoms[i + 1] ? atoms[i + 1].getInitialBaseElement().type : 'none';
      } // Is there a leftover selection?


      if (selection.length > 0) {
        result = [].concat(_toConsumableArray(result), _toConsumableArray(selection));
        selection = [];
      }
    }
  } else if (atoms) {
    // This is a single atom, decompose it
    result = atoms.decompose(context);

    if (result && displaySelection && atoms.isSelected) {
      result.forEach(function (x) {
        return x.selected(true);
      });
    }
  }

  if (!result || result.length === 0) return null;
  console.assert(Array.isArray(result) && result.length > 0); // If the mathstyle changed between the parent and the current atom,
  // account for the size difference

  if (context.mathstyle !== context.parentMathstyle) {
    var factor = context.mathstyle.sizeMultiplier / context.parentMathstyle.sizeMultiplier;
    var _iteratorNormalCompletion19 = true;
    var _didIteratorError19 = false;
    var _iteratorError19 = undefined;

    try {
      for (var _iterator19 = result[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
        var _span = _step19.value;
        console.assert(!Array.isArray(_span));
        console.assert(typeof _span.height === 'number' && isFinite(_span.height));
        _span.height *= factor;
        _span.depth *= factor;
      }
    } catch (err) {
      _didIteratorError19 = true;
      _iteratorError19 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion19 && _iterator19.return != null) {
          _iterator19.return();
        }
      } finally {
        if (_didIteratorError19) {
          throw _iteratorError19;
        }
      }
    }
  } // If the size changed between the parent and the current group,
  // account for the size difference


  if (context.size !== context.parentSize) {
    var _factor = SIZING_MULTIPLIER[context.size] / SIZING_MULTIPLIER[context.parentSize];

    var _iteratorNormalCompletion20 = true;
    var _didIteratorError20 = false;
    var _iteratorError20 = undefined;

    try {
      for (var _iterator20 = result[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
        var _span2 = _step20.value;
        console.assert(!Array.isArray(_span2));
        console.assert(typeof _span2.height === 'number' && isFinite(_span2.height));
        _span2.height *= _factor;
        _span2.depth *= _factor;
      }
    } catch (err) {
      _didIteratorError20 = true;
      _iteratorError20 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion20 && _iterator20.return != null) {
          _iterator20.return();
        }
      } finally {
        if (_didIteratorError20) {
          throw _iteratorError20;
        }
      }
    }
  }

  return result;
}
/**
 * Return an atom suitable for use as the root of a formula.
 *
 * @param {string} parseMode
 * @param {MathAtom[]} body
 * @return {MathAtom[]}
 * @memberof module:core/mathatom
 * @private
 */


function makeRoot(parseMode, body) {
  parseMode = parseMode || 'math';
  var result = new MathAtom(parseMode, 'root', body || []);

  if (result.body.length === 0 || result.body[0].type !== 'first') {
    result.body.unshift(new MathAtom('', 'first'));
  }

  return result;
} // Export the public interface for this module


var _default = {
  MathAtom: MathAtom,
  decompose: _decompose,
  makeRoot: makeRoot,
  GREEK_REGEX: GREEK_REGEX
};
exports.default = _default;