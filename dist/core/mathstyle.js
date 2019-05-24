"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fontMetrics = require("./fontMetrics.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var metrics = [{}, {}, {}];
/* textstyle, scriptstyle, scriptscriptstyle */

var i;

for (var key in _fontMetrics.SIGMAS) {
  if (_fontMetrics.SIGMAS.hasOwnProperty(key)) {
    for (i = 0; i < 3; i++) {
      metrics[i][key] = _fontMetrics.SIGMAS[key][i];
    }
  }
}

for (i = 0; i < 3; i++) {
  metrics[i].emPerEx = _fontMetrics.SIGMAS.xHeight[i] / _fontMetrics.SIGMAS.quad[i];
}
/**
 * @property {number} id unique id for the style
 * @property {number} size (which is the same for cramped and uncramped version
 * of a style)
 * @property {number}  size multiplier, which gives the size difference between
 * a style and textstyle.
 * @property {boolean}  cramped flag
 * @memberof module:core/mathstyle
 * @class module:core/mathstyle#Mathstyle
 * @private
 */


var Mathstyle =
/*#__PURE__*/
function () {
  function Mathstyle(id, size, multiplier, cramped) {
    _classCallCheck(this, Mathstyle);

    this.id = id;
    this.size = size;
    this.cramped = cramped;
    this.sizeMultiplier = multiplier;
    this.metrics = metrics[size > 0 ? size - 1 : 0];
  }
  /**
   * Get the style of a superscript given a base in the current style.
   * @method module:mathstyle.MathStyle#sup
   * @private
   */


  _createClass(Mathstyle, [{
    key: "sup",
    value: function sup() {
      return styles[_sup[this.id]];
    }
    /**
     * Get the style of a subscript given a base in the current style.
     * @method module:mathstyle.MathStyle#sub
     * @private
     */

  }, {
    key: "sub",
    value: function sub() {
      return styles[_sub[this.id]];
    }
    /**
     * Get the style of a fraction numerator given the fraction in the current
     * style.
     * @method module:mathstyle.MathStyle#fracNum
     * @private
     */

  }, {
    key: "fracNum",
    value: function fracNum() {
      return styles[_fracNum[this.id]];
    }
    /**
     * Get the style of a fraction denominator given the fraction in the current
     * style.
     * @method module:mathstyle.MathStyle#fracDen
     * @private
     */

  }, {
    key: "fracDen",
    value: function fracDen() {
      return styles[_fracDen[this.id]];
    }
    /**
     * Get the cramped version of a style (in particular, cramping a cramped style
     * doesn't change the style).
     * @method module:mathstyle.MathStyle#cramp
     * @private
     */

  }, {
    key: "cramp",
    value: function cramp() {
      return styles[_cramp[this.id]];
    }
    /**
     * HTML class name, like `displaystyle cramped`
     * @method module:mathstyle.MathStyle#cls
     * @private
     */

  }, {
    key: "cls",
    value: function cls() {
      return sizeNames[this.size];
    }
    /**
     * HTML Reset class name, like 'reset-textstyle'
     * @method module:mathstyle.MathStyle#adjustTo
     * @private
     */

  }, {
    key: "adjustTo",
    value: function adjustTo(newStyle) {
      var result = ADJUST_NAMES[this.size][newStyle.size];
      if (result.length > 0) result = ' ' + result;
      return result;
    }
    /**
     * Return if this style is tightly spaced (scriptstyle/scriptscriptstyle)
     * @method module:mathstyle.MathStyle#isTight
     * @private
     */

  }, {
    key: "isTight",
    value: function isTight() {
      return this.size >= 2;
    }
  }]);

  return Mathstyle;
}(); // IDs of the different styles


var D = 0;
var Dc = 1;
var T = 2;
var Tc = 3;
var S = 4;
var Sc = 5;
var SS = 6;
var SSc = 7; // Instances of the different styles

var styles = [new Mathstyle(D, 0, 1.0, false), new Mathstyle(Dc, 0, 1.0, true), new Mathstyle(T, 1, 1.0, false), new Mathstyle(Tc, 1, 1.0, true), new Mathstyle(S, 2, 0.7, false), new Mathstyle(Sc, 2, 0.7, true), new Mathstyle(SS, 3, 0.5, false), new Mathstyle(SSc, 3, 0.5, true)];
/**
 * Maps a string (or a Mathstyle) to an actual Mathstyle object.
 * @param {(Mathstyle|string)} s
 * @return {Mathstyle}
 * @memberof module:mathstyle
 * @private
 */

function toMathstyle(s) {
  if (!s) return s;
  if (_typeof(s) === 'object') return s;
  var STYLE_NAMES = {
    'displaystyle': styles[D],
    'textstyle': styles[T],
    'scriptstyle': styles[S],
    'scriptscriptstyle': styles[SS]
  };
  console.assert(STYLE_NAMES[s], 'unknown style: "', s, '"');
  return STYLE_NAMES[s];
} // String names for the different sizes


var sizeNames = ['displaystyle textstyle', 'textstyle', 'scriptstyle', 'scriptscriptstyle'];
var ADJUST_NAMES = [['', // 'reset-textstyle displaystyle textstyle',
'', // 'reset-textstyle textstyle',
'reset-textstyle scriptstyle', 'reset-textstyle scriptscriptstyle'], ['reset-textstyle displaystyle textstyle', '', // 'reset-textstyle textstyle',
'reset-textstyle scriptstyle', 'reset-textstyle scriptscriptstyle'], ['reset-scriptstyle textstyle displaystyle', 'reset-scriptstyle textstyle', '', // 'reset-scriptstyle scriptstyle',
'reset-scriptstyle scriptscriptstyle'], ['reset-scriptscriptstyle textstyle displaystyle', 'reset-scriptscriptstyle textstyle', 'reset-scriptscriptstyle scriptstyle', '' // 'reset-scriptscriptstyle scriptscriptstyle'
]]; // Lookup tables for switching from one style to another

var _sup = [S, Sc, S, Sc, SS, SSc, SS, SSc];
var _sub = [Sc, Sc, Sc, Sc, SSc, SSc, SSc, SSc];
var _fracNum = [T, Tc, S, Sc, SS, SSc, SS, SSc];
var _fracDen = [Tc, Tc, Sc, Sc, SSc, SSc, SSc, SSc];
var _cramp = [Dc, Dc, Tc, Tc, Sc, Sc, SSc, SSc]; // We only export some of the styles. Also, we don't export the `Mathstyle`
// class so no more styles can be generated.

var _default = {
  DISPLAY: styles[D],
  TEXT: styles[T],
  SCRIPT: styles[S],
  SCRIPTSCRIPT: styles[SS],
  toMathstyle: toMathstyle
};
exports.default = _default;