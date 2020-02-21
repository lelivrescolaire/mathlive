"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mathstyle = _interopRequireDefault(require("./mathstyle.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * This class contains the rendering context of the current parse level.
 *
 * It also holds information about the parent context to handle scaling
 * adjustments.
 *
 * When a new scope is entered, a clone of the context is created with `.clone()`
 * so that any further changes remain local to the scope.
 *
 * A scope is defined for example by:
 * - an explicit group enclosed in braces `{...}`
 * - a semi-simple group enclosed in `\bgroup...\endgroup`
 * - an environment delimited by `\begin{<envname>}...\end{<envname>}`
 *
 * @property {string} mathstyle `'text'` (aka 'inline'), `'display'`,
 * `'script'` or `'scriptscript'`
 * @property {number} opacity
 * @property {number} size
 * @property {boolean|object} generateID - If true, unique IDs should be 
 * generated for each span so they can be mapped back to an atom. 
 * Can also be an object with a `seed` field to generate a specific range of 
 * IDs. Optionally, if a `groupNumbers` property is set to true, an additional 
 * span will enclose strings of digits. This is used by read aloud to properly 
 * pronounce (and highlight) numbers in expressions.
 * @property {string} parentMathstyle
 * @property {number} parentSize
 * @property {object} macros A macros dictionary
 *
 * @class Context
 * @global
 * @private
 */
var Context =
/*#__PURE__*/
function () {
  function Context(from) {
    _classCallCheck(this, Context);

    this.macros = from.macros || {};
    this.generateID = from.generateID ? from.generateID : false;
    this.mathstyle = _mathstyle.default.toMathstyle(from.mathstyle || 'displaystyle');
    this.size = from.size || 'size5'; // medium size

    this.parentMathstyle = from.parentMathstyle || this.mathstyle;
    this.parentSize = from.parentSize || this.size;
    this.opacity = from.opacity;
  }
  /**
   * Returns a new context with the same properties as 'this'.
   * @return {Context}
   * @memberof Context
   * @instance
   * @private
   */


  _createClass(Context, [{
    key: "clone",
    value: function clone(override) {
      var result = new Context(this);
      result.parentMathstyle = this.mathstyle;
      result.parentSize = this.size;
      result.macros = this.macros;

      if (override) {
        // `'auto'` (or undefined) to indicate that the mathstyle should in
        // fact not be changed. This is used when specifying the mathstyle 
        // for some environments.
        if (override.mathstyle === 'auto' || !override.mathstyle) {
          delete override.mathstyle;
        }

        Object.assign(result, override);

        if (typeof override.mathstyle === 'string') {
          result.mathstyle = _mathstyle.default.toMathstyle(override.mathstyle);
        }
      }

      return result;
    }
    /**
     * Change the mathstyle of this context
     * @param {string} value - `'auto'` to indicate that the mathstyle should in
     * fact not be changed. This is used when specifying the mathstyle for some
     * environments.
     * @memberof Context
     * @instance
     * @private
     */

  }, {
    key: "setMathstyle",
    value: function setMathstyle(value) {
      if (value && value !== 'auto') {
        this.mathstyle = _mathstyle.default.toMathstyle(value);
      }
    }
  }, {
    key: "cramp",
    value: function cramp() {
      return this.clone({
        'mathstyle': this.mathstyle.cramp()
      });
    }
  }, {
    key: "sup",
    value: function sup() {
      return this.clone({
        'mathstyle': this.mathstyle.sup()
      });
    }
  }, {
    key: "sub",
    value: function sub() {
      return this.clone({
        'mathstyle': this.mathstyle.sup()
      });
    }
  }]);

  return Context;
}();

var _default = {
  Context: Context
};
exports.default = _default;