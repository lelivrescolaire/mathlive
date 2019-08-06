"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fontMetrics = _interopRequireDefault(require("./fontMetrics.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * To organize the symbols when generating the documentation, we
 * keep track of a category that gets assigned to each symbol.
 * @private
 */
var category = '';
var MATH_SYMBOLS = {};
var FUNCTIONS = {};
var ENVIRONMENTS = {};
var MACROS = {
  'iff': "\\;\u27FA\\;",
  //>2,000 Note: additional spaces around the arrows
  'nicefrac': '^{#1}\\!\\!/\\!_{#2}',
  // From bracket.sty, Diract notation
  'bra': '\\mathinner{\\langle{#1}|}',
  'ket': '\\mathinner{|{#1}\\rangle}',
  'braket': '\\mathinner{\\langle{#1}\\rangle}',
  'set': '\\mathinner{\\lbrace #1 \\rbrace}',
  'Bra': '\\left\\langle #1\\right|',
  'Ket': '\\left|#1\\right\\rangle',
  'Braket': '\\left\\langle{#1}\\right\\rangle',
  'Set': '\\left\\lbrace #1 \\right\\rbrace'
};
var RIGHT_DELIM = {
  '(': ')',
  '{': '}',
  '[': ']',
  '|': '|',
  '\\lbrace': '\\rbrace',
  '\\{': '\\}',
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
  '\\lmoustache': '\\rmoustache' // Frequency of a symbol.
  // String constants corresponding to frequency values,
  // which are the number of results returned by latexsearch.com
  // When the precise number is known, it is provided. Otherwise,
  // the following constants are used to denote an estimate.

};
var CRYPTIC = 'CRYPTIC';
var ARCANE = 'ARCANE'; // const VERY_RARE = 'VERY_RARE';

var RARE = 'RARE';
var UNCOMMON = 'UNCOMMON';
var COMMON = 'COMMON';
var SUPERCOMMON = 'SUPERCOMMON';
/**
 * @type {Object.<string, number>}
 * @private
 */

var FREQUENCY_VALUE = {
  'CRYPTIC': 0,
  'ARCANE': 200,
  'VERY_RARE': 600,
  'RARE': 1200,
  'UNCOMMON': 2000,
  'COMMON': 3000,
  'SUPERCOMMON': 4000
  /**
   * Set the frequency of the specified symbol.
   * Default frequency is UNCOMMON
   * The argument list is a frequency value, followed by one or more symbol strings
   * For example:
   *  frequency(COMMON , '\\sin', '\\cos')
   * @param {string|number} value The frequency as a string constant,
   * or a numeric value [0...2000]
   * @param {...string}
   * @memberof module:definitions
   * @private
   */

};

function frequency(value) {
  var v = typeof value === 'string' ? FREQUENCY_VALUE[value] : value;

  for (var _len = arguments.length, symbols = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    symbols[_key - 1] = arguments[_key];
  }

  for (var _i = 0, _symbols = symbols; _i < _symbols.length; _i++) {
    var symbol = _symbols[_i];

    if (MATH_SYMBOLS[symbol]) {
      MATH_SYMBOLS[symbol].frequency = v;
    }

    if (FUNCTIONS[symbol]) {
      // Make a copy of the entry, since it could be shared by multiple
      // symbols
      FUNCTIONS[symbol] = Object.assign({}, FUNCTIONS[symbol]);
      FUNCTIONS[symbol].frequency = v;
    }
  }
}
/**
 *
 * @param {string} latexName    The common LaTeX command for this symbol
 * @param {(string|string[])} mode
 * @param {string} fontFamily
 * @param {string} type
 * @param {string} value
 * @param {(number|string)} [frequency]
 * @memberof module:definitions
 * @private
 */


function defineSymbol(latexName, fontFamily, type, value, frequency) {
  if (fontFamily && !/^(ams|cmr|bb|cal|frak|scr)$/.test(fontFamily)) {
    console.log(fontFamily, latexName);
  } // Convert a frequency constant to a numerical value


  if (typeof frequency === 'string') frequency = FREQUENCY_VALUE[frequency];
  MATH_SYMBOLS[latexName] = {
    type: type === ORD ? MATHORD : type,
    baseFontFamily: fontFamily,
    value: value,
    category: category,
    // To group items when generating the documentation
    frequency: frequency
  };
}
/**
 * Define a set of single-character symbols and all their attributes.
 * The value associated with the symbol is the symbol itself.
 * @param {string} string a string of single character symbols
 * @param {string} mode
 * @param {string} fontFamily
 * @param {string} type
 * @param {(string|number)} [frequency]
 * @memberof module:definitions
 * @private
 */


function defineSymbols(string) {
  for (var i = 0; i < string.length; i++) {
    var ch = string.charAt(i);
    defineSymbol(ch, '', MATHORD, ch);
  }
}
/**
 * Define a set of single-character symbols as a range of Unicode codepoints
 * @param {number} from First Unicode codepoint
 * @param {number} to Last Unicode codepoint
 * @memberof module:definitions
 * @private
 */


function defineSymbolRange(from, to) {
  for (var i = from; i <= to; i++) {
    var ch = String.fromCodePoint(i);
    defineSymbol(ch, '', 'mord', ch);
  }
}

var CODEPOINT_SHORTCUTS = {
  8739: '|',
  0x00b7: '\\cdot',
  0x00bc: '\\frac{1}{4}',
  0x00bd: '\\frac{1}{2}',
  0x00be: '\\frac{3}{4}',
  0x2070: '^{0}',
  0x2071: '^{i}',
  0x00b9: '^{1}',
  0x00b2: '^{2}',
  0x00b3: '^{3}',
  0x2074: '^{4}',
  0x2075: '^{5}',
  0x2076: '^{6}',
  0x2077: '^{7}',
  0x2078: '^{8}',
  0x2079: '^{9}',
  0x207a: '^{+}',
  0x207b: '^{-}',
  0x207c: '^{=}',
  0x207f: '^{n}',
  0x2080: '_{0}',
  0x2081: '_{1}',
  0x2082: '_{2}',
  0x2083: '_{3}',
  0x2084: '_{4}',
  0x2085: '_{5}',
  0x2086: '_{6}',
  0x2087: '_{7}',
  0x2088: '_{8}',
  0x2089: '_{9}',
  0x208A: '_{+}',
  0x208B: '_{-}',
  0x208C: '_{=}',
  0x2090: '_{a}',
  0x2091: '_{e}',
  0x2092: '_{o}',
  0x2093: '_{x}',
  0x2032: '\\prime',
  0x2033: '\\doubleprime',
  0x2220: '\\angle',
  0x2102: '\\C',
  0x2115: '\\N',
  0x2119: '\\P',
  0x211A: '\\Q',
  0x211D: '\\R',
  0x2124: '\\Z'
};
/**
 * Given a character, return a LaTeX expression matching its Unicode codepoint.
 * If there is a matching symbol (e.g. \alpha) it is returned.
 * @param {string} parseMode
 * @param {number} cp
 * @return {string}
 * @memberof module:definitions
 * @private
 */

function matchCodepoint(parseMode, cp) {
  var s = String.fromCodePoint(cp); // Some symbols map to multiple codepoints.
  // Some symbols are 'pseudosuperscript'. Convert them to a super(or sub)script.
  // Map their alternative codepoints here.

  if (parseMode === 'math' && CODEPOINT_SHORTCUTS[s]) return CODEPOINT_SHORTCUTS[s]; // Don't map 'simple' code point.
  // For example "C" maps to \doubleStruckCapitalC, not the desired "C"

  if (cp > 32 && cp < 127) return s;
  var result = '';

  if (parseMode === 'math') {
    for (var p in MATH_SYMBOLS) {
      if (MATH_SYMBOLS.hasOwnProperty(p)) {
        if (MATH_SYMBOLS[p].value === s) {
          result = p;
          break;
        }
      }
    }
  } else {
    for (var _p in TEXT_SYMBOLS) {
      if (TEXT_SYMBOLS.hasOwnProperty(_p)) {
        if (TEXT_SYMBOLS[_p] === s) {
          result = _p;
          break;
        }
      }
    }
  }

  return result || s;
}
/**
 * Given a Unicode character returns {char:, variant:, style} corresponding
 * to this codepoint. `variant` is optional.
 * This maps characters such as "blackboard uppercase C" to
 * {char: 'C', variant: 'double-struck', style:''}
 * @param {string} char
 */

/* Some symbols in the MATHEMATICAL ALPHANUMERICAL SYMBOLS block had
   been previously defined in other blocks. Remap them */


var MATH_LETTER_EXCEPTIONS = {
  0x1d455: 0x0210e,
  0x1D49D: 0x0212C,
  0x1D4A0: 0x02130,
  0x1D4A1: 0x02131,
  0x1D4A3: 0x0210B,
  0x1D4A4: 0x02110,
  0x1D4A7: 0x02112,
  0x1D4A8: 0x02133,
  0x1D4AD: 0x0211B,
  0x1D4BA: 0x0212F,
  0x1D4BC: 0x0210A,
  0x1D4C4: 0x02134,
  0x1D506: 0x0212D,
  0x1D50B: 0x0210C,
  0x1D50C: 0x02111,
  0x1D515: 0x0211C,
  0x1D51D: 0x02128,
  0x1D53A: 0x02102,
  0x1D53F: 0x0210D,
  0x1D545: 0x02115,
  0x1D547: 0x02119,
  0x1D548: 0x0211A,
  0x1D549: 0x0211D,
  0x1D551: 0x02124
};
var MATH_UNICODE_BLOCKS = [{
  start: 0x1D400,
  len: 26,
  offset: 65,
  style: 'bold'
}, {
  start: 0x1D41A,
  len: 26,
  offset: 97,
  style: 'bold'
}, {
  start: 0x1D434,
  len: 26,
  offset: 65,
  style: 'italic'
}, {
  start: 0x1D44E,
  len: 26,
  offset: 97,
  style: 'italic'
}, {
  start: 0x1D468,
  len: 26,
  offset: 65,
  style: 'bolditalic'
}, {
  start: 0x1D482,
  len: 26,
  offset: 97,
  style: 'bolditalic'
}, {
  start: 0x1D49c,
  len: 26,
  offset: 65,
  variant: 'script'
}, {
  start: 0x1D4b6,
  len: 26,
  offset: 97,
  variant: 'script'
}, {
  start: 0x1D4d0,
  len: 26,
  offset: 65,
  variant: 'script',
  style: 'bold'
}, {
  start: 0x1D4ea,
  len: 26,
  offset: 97,
  variant: 'script',
  style: 'bold'
}, {
  start: 0x1D504,
  len: 26,
  offset: 65,
  variant: 'fraktur'
}, {
  start: 0x1D51e,
  len: 26,
  offset: 97,
  variant: 'fraktur'
}, {
  start: 0x1D56c,
  len: 26,
  offset: 65,
  variant: 'fraktur',
  style: 'bold'
}, {
  start: 0x1D586,
  len: 26,
  offset: 97,
  variant: 'fraktur',
  style: 'bold'
}, {
  start: 0x1D538,
  len: 26,
  offset: 65,
  variant: 'double-struck'
}, {
  start: 0x1D552,
  len: 26,
  offset: 97,
  variant: 'double-struck'
}, {
  start: 0x1D5A0,
  len: 26,
  offset: 65,
  variant: 'sans-serif'
}, {
  start: 0x1D5BA,
  len: 26,
  offset: 97,
  variant: 'sans-serif'
}, {
  start: 0x1D5D4,
  len: 26,
  offset: 65,
  variant: 'sans-serif',
  style: 'bold'
}, {
  start: 0x1D5EE,
  len: 26,
  offset: 97,
  variant: 'sans-serif',
  style: 'bold'
}, {
  start: 0x1D608,
  len: 26,
  offset: 65,
  variant: 'sans-serif',
  style: 'italic'
}, {
  start: 0x1D622,
  len: 26,
  offset: 97,
  variant: 'sans-serif',
  style: 'italic'
}, {
  start: 0x1D63c,
  len: 26,
  offset: 65,
  variant: 'sans-serif',
  style: 'bolditalic'
}, {
  start: 0x1D656,
  len: 26,
  offset: 97,
  variant: 'sans-serif',
  style: 'bolditalic'
}, {
  start: 0x1D670,
  len: 26,
  offset: 65,
  variant: 'monospace'
}, {
  start: 0x1D68A,
  len: 26,
  offset: 97,
  variant: 'monospace'
}, {
  start: 0x1D6A8,
  len: 25,
  offset: 0x391,
  style: 'bold'
}, {
  start: 0x1D6C2,
  len: 25,
  offset: 0x3B1,
  style: 'bold'
}, {
  start: 0x1D6E2,
  len: 25,
  offset: 0x391,
  style: 'italic'
}, {
  start: 0x1D6FC,
  len: 25,
  offset: 0x3B1,
  style: 'italic'
}, {
  start: 0x1D71C,
  len: 25,
  offset: 0x391,
  style: 'bolditalic'
}, {
  start: 0x1D736,
  len: 25,
  offset: 0x3B1,
  style: 'bolditalic'
}, {
  start: 0x1D756,
  len: 25,
  offset: 0x391,
  variant: 'sans-serif',
  style: 'bold'
}, {
  start: 0x1D770,
  len: 25,
  offset: 0x3B1,
  variant: 'sans-serif',
  style: 'bold'
}, {
  start: 0x1D790,
  len: 25,
  offset: 0x391,
  variant: 'sans-serif',
  style: 'bolditalic'
}, {
  start: 0x1D7AA,
  len: 25,
  offset: 0x3B1,
  variant: 'sans-serif',
  style: 'bolditalic'
}, {
  start: 0x1D7CE,
  len: 10,
  offset: 48,
  variant: '',
  style: 'bold'
}, {
  start: 0x1D7D8,
  len: 10,
  offset: 48,
  variant: 'double-struck'
}, {
  start: 0x1D7E3,
  len: 10,
  offset: 48,
  variant: 'sans-serif'
}, {
  start: 0x1D7Ec,
  len: 10,
  offset: 48,
  variant: 'sans-serif',
  style: 'bold'
}, {
  start: 0x1D7F6,
  len: 10,
  offset: 48,
  variant: 'monospace'
}];

function unicodeToMathVariant(char) {
  var codepoint = char;
  if (typeof char === 'string') codepoint = char.codePointAt(0);

  if ((codepoint < 0x1d400 || codepoint > 0x1d7ff) && (codepoint < 0x2100 || codepoint > 0x214f)) {
    return {
      char: char
    };
  } // Handle the 'gap' letters by converting them back into their logical range


  for (var c in MATH_LETTER_EXCEPTIONS) {
    if (MATH_LETTER_EXCEPTIONS.hasOwnProperty(c)) {
      if (MATH_LETTER_EXCEPTIONS[c] === codepoint) {
        codepoint = c;
        break;
      }
    }
  }

  for (var i = 0; i < MATH_UNICODE_BLOCKS.length; i++) {
    if (codepoint >= MATH_UNICODE_BLOCKS[i].start && codepoint < MATH_UNICODE_BLOCKS[i].start + MATH_UNICODE_BLOCKS[i].len) {
      return {
        char: String.fromCodePoint(codepoint - MATH_UNICODE_BLOCKS[i].start + MATH_UNICODE_BLOCKS[i].offset),
        variant: MATH_UNICODE_BLOCKS[i].variant,
        style: MATH_UNICODE_BLOCKS[i].style
      };
    }
  }

  return {
    char: char
  };
}
/**
 * Given a character and variant ('bb', 'cal', etc...)
 * return the corresponding unicode character (a string)
 * @param {string} char
 * @param {string} variant
 */


function mathVariantToUnicode(char, variant, style) {
  if (!/[A-Za-z0-9]/.test(char)) return char;
  if (!variant && !style) return char;
  var codepoint = char.codePointAt(0);

  for (var i = 0; i < MATH_UNICODE_BLOCKS.length; i++) {
    if (!variant || MATH_UNICODE_BLOCKS[i].variant === variant) {
      if (!style || MATH_UNICODE_BLOCKS[i].style === style) {
        if (codepoint >= MATH_UNICODE_BLOCKS[i].offset && codepoint < MATH_UNICODE_BLOCKS[i].offset + MATH_UNICODE_BLOCKS[i].len) {
          var result = MATH_UNICODE_BLOCKS[i].start + codepoint - MATH_UNICODE_BLOCKS[i].offset;
          return String.fromCodePoint(MATH_LETTER_EXCEPTIONS[result] || result);
        }
      }
    }
  }

  return char;
}

function codepointToLatex(parseMode, cp) {
  // Codepoint shortcuts have priority over variants
  // That is, "\N" vs "\mathbb{N}"
  if (parseMode === 'text') return String.fromCodePoint(cp);
  var result;
  if (CODEPOINT_SHORTCUTS[cp]) return CODEPOINT_SHORTCUTS[cp];
  var v = unicodeToMathVariant(cp);
  if (!v.style && !v.variant) return matchCodepoint(parseMode, cp);
  result = v.char;

  if (v.variant) {
    result = '\\' + v.variant + '{' + result + '}';
  }

  if (v.style === 'bold') {
    result = '\\mathbf{' + result + '}';
  } else if (v.style === 'italic') {
    result = '\\mathit{' + result + '}';
  } else if (v.style === 'bolditalic') {
    result = '\\mathbf{\\mathit{' + result + '}}';
  }

  return '\\mathord{' + result + '}';
}

function unicodeStringToLatex(parseMode, s) {
  var result = '';
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = s[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var cp = _step.value;
      result += codepointToLatex(parseMode, cp.codePointAt(0));
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

  return result;
}
/**
 *
 * @param {string} mode
 * @param {string} command
 * @return {boolean} True if command is allowed in the mode
 * (note that command can also be a single character, e.g. "a")
 * @memberof module:definitions
 * @private
 */


function commandAllowed(mode, command) {
  if (FUNCTIONS[command] && (mode !== 'text' || FUNCTIONS[command].allowedInText)) {
    return true;
  }

  if ({
    'text': TEXT_SYMBOLS,
    'math': MATH_SYMBOLS
  }[mode][command]) {
    return true;
  }

  return false;
}

function getValue(mode, symbol) {
  if (mode === 'math') {
    return MATH_SYMBOLS[symbol] && MATH_SYMBOLS[symbol].value ? MATH_SYMBOLS[symbol].value : symbol;
  }

  return TEXT_SYMBOLS[symbol] ? TEXT_SYMBOLS[symbol] : symbol;
}

function getEnvironmentInfo(name) {
  var result = ENVIRONMENTS[name];

  if (!result) {
    result = {
      params: '',
      parser: null,
      mathstyle: 'displaystyle',
      tabular: true,
      colFormat: [],
      lFence: '.',
      rFence: '.' // arrayStretch: 1,

    };
  }

  return result;
}
/**
 * @param {string} symbol    A command (e.g. '\alpha') or a character (e.g. 'a')
 * @param {string} parseMode One of 'math' or 'text'
 * @param {object} macros A macros dictionary
 * @return {object} An info structure about the symbol, or null
 * @memberof module:definitions
 * @private
 */


function getInfo(symbol, parseMode, macros) {
  if (symbol.length === 0) return null;
  var info = null;

  if (symbol.charAt(0) === '\\') {
    // This could be a function or a symbol
    info = FUNCTIONS[symbol];

    if (info) {
      // We've got a match
      if (parseMode === 'math' || info.allowedInText) return info; // That's a valid function, but it's not allowed in non-math mode,
      // and we're in non-math mode

      return null;
    }

    if (!info) {
      // It wasn't a function, maybe it's a symbol?
      if (parseMode === 'math') {
        info = MATH_SYMBOLS[symbol];
      } else if (TEXT_SYMBOLS[symbol]) {
        info = {
          value: TEXT_SYMBOLS[symbol]
        };
      }
    }

    if (!info) {
      // Maybe it's a macro
      var command = symbol.slice(1);

      if (macros && macros[command]) {
        var def = macros[command];

        if (_typeof(def) === 'object') {
          def = def.def;
        }

        var argCount = 0; // Let's see if there are arguments in the definition.

        if (/(^|[^\\])#1/.test(def)) argCount = 1;
        if (/(^|[^\\])#2/.test(def)) argCount = 2;
        if (/(^|[^\\])#3/.test(def)) argCount = 3;
        if (/(^|[^\\])#4/.test(def)) argCount = 4;
        if (/(^|[^\\])#5/.test(def)) argCount = 5;
        if (/(^|[^\\])#6/.test(def)) argCount = 6;
        if (/(^|[^\\])#7/.test(def)) argCount = 7;
        if (/(^|[^\\])#8/.test(def)) argCount = 8;
        if (/(^|[^\\])#9/.test(def)) argCount = 9;
        info = {
          type: 'group',
          allowedInText: false,
          params: [],
          infix: false
        };

        while (argCount >= 1) {
          info.params.push({
            optional: false,
            type: 'math',
            defaultValue: null,
            placeholder: null
          });
          argCount -= 1;
        }
      }
    }
  } else {
    if (parseMode === 'math') {
      info = MATH_SYMBOLS[symbol];
    } else if (TEXT_SYMBOLS[symbol]) {
      info = {
        value: TEXT_SYMBOLS[symbol]
      };
    }
  } // Special case `f`, `g` and `h` are recognized as functions.


  if (info && info.type === 'mord' && (info.value === 'f' || info.value === 'g' || info.value === 'h')) {
    info.isFunction = true;
  }

  return info;
}
/**
 * Return an array of suggestion for completing string 's'.
 * For example, for 'si', it could return ['sin', 'sinh', 'sim', 'simeq', 'sigma']
 * Infix operators are excluded, since they are deprecated commands.
 * @param {string} s
 * @return {string[]}
 * @memberof module:definitions
 * @private
 */


function suggest(s) {
  if (s.length <= 1) return [];
  var result = []; // Iterate over items in the dictionary

  for (var p in FUNCTIONS) {
    if (FUNCTIONS.hasOwnProperty(p)) {
      if (p.startsWith(s) && !FUNCTIONS[p].infix) {
        result.push({
          match: p,
          frequency: FUNCTIONS[p].frequency
        });
      }
    }
  }

  for (var _p2 in MATH_SYMBOLS) {
    if (MATH_SYMBOLS.hasOwnProperty(_p2)) {
      if (_p2.startsWith(s)) {
        result.push({
          match: _p2,
          frequency: MATH_SYMBOLS[_p2].frequency
        });
      }
    }
  }

  result.sort(function (a, b) {
    if (a.frequency === b.frequency) {
      return a.match.length - b.match.length;
    }

    return (b.frequency || 0) - (a.frequency || 0);
  });
  return result;
} // Fonts


var MAIN = ''; // The "main" KaTeX font (in fact one of several
// depending on the math variant, size, etc...)

var AMS = 'ams'; // Some symbols are not in the "main" KaTeX font
// or have a different glyph available in the "AMS"
// font (`\hbar` and `\hslash` for example).
// Type

var ORD = 'mord';
var MATHORD = 'mord'; // Ordinary, e.g. '/'

var BIN = 'mbin'; // e.g. '+'

var REL = 'mrel'; // e.g. '='

var OPEN = 'mopen'; // e.g. '('

var CLOSE = 'mclose'; // e.g. ')'

var PUNCT = 'mpunct'; // e.g. ','

var INNER = 'minner'; // for fractions and \left...\right.
// const ACCENT = 'accent';

var SPACING = 'spacing';
/**
 * An argument template has the following syntax:
 *
 * <placeholder>:<type>=<default>
 *
 * where
 * - <placeholder> is a string whose value is displayed when the argument
 *   is missing
 * - <type> is one of 'string', 'color', 'dimen', 'auto', 'text', 'math'
 * - <default> is the default value if none is provided for an optional
 * parameter
 *
 * @param {string} argTemplate
 * @param {boolean} isOptional
 * @memberof module:definitions
 * @private
 */

function parseParamTemplateArgument(argTemplate, isOptional) {
  var r = argTemplate.match(/=(.+)/);
  var defaultValue = '{}';
  var type = 'auto';
  var placeholder = null;

  if (r) {
    console.assert(isOptional, "Can't provide a default value for required parameters");
    defaultValue = r[1];
  } // Parse the type (:type)


  r = argTemplate.match(/:([^=]+)/);
  if (r) type = r[1].trim(); // Parse the placeholder

  r = argTemplate.match(/^([^:=]+)/);
  if (r) placeholder = r[1].trim();
  return {
    optional: isOptional,
    type: type,
    defaultValue: defaultValue,
    placeholder: placeholder
  };
}

function parseParamTemplate(paramTemplate) {
  if (!paramTemplate || paramTemplate.length === 0) return [];
  var result = [];
  var params = paramTemplate.split(']');

  if (params[0].charAt(0) === '[') {
    // We found at least one optional parameter.
    result.push(parseParamTemplateArgument(params[0].slice(1), true)); // Parse the rest

    for (var i = 1; i <= params.length; i++) {
      result = result.concat(parseParamTemplate(params[i]));
    }
  } else {
    params = paramTemplate.split('}');

    if (params[0].charAt(0) === '{') {
      // We found a required parameter
      result.push(parseParamTemplateArgument(params[0].slice(1), false)); // Parse the rest

      for (var _i2 = 1; _i2 <= params.length; _i2++) {
        result = result.concat(parseParamTemplate(params[_i2]));
      }
    }
  }

  return result;
}

function parseArgAsString(arg) {
  return arg.map(function (x) {
    return x.body;
  }).join('');
}
/**
 * Define one or more environments to be used with
 *         \begin{<env-name>}...\end{<env-name>}.
 *
 * @param {string|string[]} names
 * @param {string} params The number and type of required and optional parameters.
 * @param {object} options
 * -
 * @param {function(*)} parser
 * @memberof module:definitions
 * @private
 */


function defineEnvironment(names, params, options, parser) {
  if (typeof names === 'string') names = [names];
  if (!options) options = {};
  var parsedParams = parseParamTemplate(params); // Set default values of functions

  var data = {
    // 'category' is a global variable keeping track of the
    // the current category being defined. This value is used
    // strictly to group items in generateDocumentation().
    category: category,
    // Params: the parameters for this function, an array of
    // {optional, type, defaultValue, placeholder}
    params: parsedParams,
    // Callback to parse the arguments
    parser: parser,
    mathstyle: 'displaystyle',
    tabular: options.tabular || true,
    colFormat: options.colFormat || []
  };
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = names[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var name = _step2.value;
      ENVIRONMENTS[name] = data;
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
/**
 * Define one of more functions.
 *
 * @param {string|string[]} names
 * @param {string} params The number and type of required and optional parameters.
 * For example: '{}' defines a single mandatory parameter
 * '[index=2]{indicand:auto}' defines two params, one optional, one required

 * @param {object} options
 * - infix
 * - allowedInText
 * @param {function} parseFunction
 * @memberof module:definitions
 * @private
 */


function defineFunction(names, params, options, parseFunction) {
  if (typeof names === 'string') {
    names = [names];
  }

  if (!options) options = {}; // Set default values of functions

  var data = {
    // 'category' is a global variable keeping track of the
    // the current category being defined. This value is used
    // strictly to group items in generateDocumentation().
    category: category,
    // The base font family, if present, indicates that this font family
    // should always be used to render atom. For example, functions such
    // as "sin", etc... are always drawn in a roman font,
    // regardless of the font styling a user may specify.
    baseFontFamily: options.fontFamily,
    // The parameters for this function, an array of
    // {optional, type, defaultValue, placeholder}
    params: parseParamTemplate(params),
    allowedInText: !!options.allowedInText,
    infix: !!options.infix,
    parse: parseFunction
  };
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = names[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var name = _step3.value;
      FUNCTIONS[name] = data;
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

category = 'Environments';
/*

<columns> ::= <column>*<line>
<column> ::= <line>('l'|'c'|'r')
<line> ::= '|' | '||' | ''

'math',
                frequency 0
'displaymath',
                frequency 8

'equation'      centered, numbered
                frequency 8

'subequations'   with an 'equation' environment, appends a letter to eq no
                frequency 1

'array',        {columns:text}
                cells are textstyle math
                no fence

'eqnarray'      DEPRECATED see http://www.tug.org/pracjourn/2006-4/madsen/madsen.pdf
                {rcl}
                first and last cell in each row is displaystyle math
                each cell has a margin of \arraycolsep
                Each line has a eqno
                frequency 7


'theorem'       text mode. Prepends in bold 'Theorem <counter>', then body in italics.

'multline'      single column
                first row left aligned, last right aligned, others centered
                last line has an eqn. counter. multline* will omit the counter
                no output if inside an equation


'gather'        at most two columns
                first column centered, second column right aligned
                frequency 1

'gathered'      must be in equation environment
                single column,
                centered
                frequency: COMMON
                optional argument: [b], [t] to vertical align

'align'        multiple columns,
                alternating rl
                there is some 'space' (additional column?) between each pair
                each line is numbered (except when inside an equation environment)
                there is an implicit {} at the beginning of left columns

'aligned'      must be in equation environment
                frequency: COMMON
                @{}r@{}l@{\quad}@{}r@{}l@{}

'split'         must be in an equation environment,
                two columns, additional columns are interpreted as line breaks
                first column is right aligned, second column is left aligned
                entire construct is numbered (as opposed to 'align' where each line is numbered)
                frequency: 0


'alignedat'
From AMSMath:
---The alignedat environment was changed to take two arguments rather
than one: a mandatory argument (as formerly) specifying the number of
align structures, and a new optional one specifying the placement of the
environment (parallel to the optional argument of aligned). However,
aligned is simpler to use, allowing any number of aligned structures
automatically, and therefore the use of alignedat is deprecated.


 'alignat'      {pairs:number}
                {rl} alternating as many times as indicated by <pairs> arg
                no space between column pairs (unlike align)
                there is an implicit {} at the beginning of left columns
                frequency: 0

 'flalign'      multiple columns
                alternate rl
                third column further away than align...?
                frequency: 0


'matrix'        at most 10 columns
                cells centered
                no fence
                no colsep at beginning or end
                (mathtools package add an optional arg for the cell alignment)
                frequency: COMMON

'pmatrix'       fence: ()
                frequency: COMMON

'bmatrix'       fence: []
                frequency: COMMON

'Bmatrix'       fence: {}
                frequency: 237

'vmatrix'       fence: \vert
                frequency: 368

'Vmatrix'       fence: \Vert
                frequency: 41

'smallmatrix'   displaystyle: scriptstyle (?)
                frequency: 279

'cases'
                frequency: COMMON
                l@{2}l

'center'        text mode only?
                frequency: ?
*/
// See https://en.wikibooks.org/wiki/LaTeX/Mathematics
// and http://www.ele.uri.edu/faculty/vetter/Other-stuff/latex/Mathmode.pdf

/*
The star at the end of the name of a displayed math environment causes that
the formula lines won't be numbered. Otherwise they would automatically get a number.

\notag will also turn off the numbering.
\shoveright and \shoveleft will force alignment of a line

The only difference between align and equation is the spacing of the formulas.
You should attempt to use equation when possible, and align when you have multi-line formulas.
Equation will have space before/after < 1em if line before/after is short enough.

Also: equation throws an error when you have an & inside the environment,
so look out for that when converting between the two.



Whereas align produces a structure whose width is the full line width, aligned
gives a width that is the actual width of the contents, thus it can be used as
a component in a containing expression, e.g. for putting the entire alignment
in a parenthesis
*/

defineEnvironment('math', '', {
  frequency: 0
}, function () {
  return {
    mathstyle: 'textstyle'
  };
});
defineEnvironment('displaymath', '', {
  frequency: 8
}, function () {
  return {
    mathstyle: 'displaystyle'
  };
}); // defineEnvironment('text', '', {
//     frequency: 0,
//     }, function(name, args) {
//     return {
//         mathstyle: 'text',         // @todo: not quite right, not a style, a parsemode...
//     };
// });

defineEnvironment('array', '{columns:colspec}', {
  frequency: COMMON
}, function (name, args) {
  return {
    colFormat: args[0],
    mathstyle: 'textstyle'
  };
});
defineEnvironment('eqnarray', '', {}, function () {
  return {};
});
defineEnvironment('equation', '', {}, function () {
  return {
    colFormat: [{
      align: 'c'
    }]
  };
});
defineEnvironment('subequations', '', {}, function () {
  return {
    colFormat: [{
      align: 'c'
    }]
  };
}); // Note spelling: MULTLINE, not multiline.

defineEnvironment('multline', '', {}, function () {
  return {
    firstRowFormat: [{
      align: 'l'
    }],
    colFormat: [{
      align: 'c'
    }],
    lastRowFormat: [{
      align: 'r'
    }]
  };
}); // An AMS-Math environment
// See amsmath.dtx:3565
// Note that some versions of AMS-Math have a gap on the left.
// More recent version suppresses that gap, but have an option to turn it back on
// for backward compatibility.

defineEnvironment(['align', 'aligned'], '', {}, function (name, args, array) {
  var colCount = 0;
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = array[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var row = _step4.value;
      colCount = Math.max(colCount, row.length);
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

  var colFormat = [{
    gap: 0
  }, {
    align: 'r'
  }, {
    gap: 0
  }, {
    align: 'l'
  }];
  var i = 2;

  while (i < colCount) {
    colFormat.push({
      gap: 1
    });
    colFormat.push({
      align: 'r'
    });
    colFormat.push({
      gap: 0
    });
    colFormat.push({
      align: 'l'
    });
    i += 2;
  }

  colFormat.push({
    gap: 0
  });
  return {
    colFormat: colFormat,
    jot: 0.3 // Jot is an extra gap between lines of numbered equation.
    // It's 3pt by default in LaTeX (ltmath.dtx:181)

  };
}); // defineEnvironment('alignat', '', {}, function(name, args) {
//     return {
//     };
// });
// defineEnvironment('flalign', '', {}, function(name, args) {
//     return {
//     };
// });

defineEnvironment('split', '', {}, function () {
  return {};
});
defineEnvironment(['gather', 'gathered'], '', {}, function () {
  // An AMS-Math environment
  // %    The \env{gathered} environment is for several lines that are
  // %    centered independently.
  // From amstex.sty
  // \newenvironment{gathered}[1][c]{%
  //   \relax\ifmmode\else\nonmatherr@{\begin{gathered}}\fi
  //   \null\,%
  //   \if #1t\vtop \else \if#1b\vbox \else \vcenter \fi\fi
  //   \bgroup\Let@\restore@math@cr
  //   \ifinany@\else\openup\jot\fi\ialign
  //   \bgroup\hfil\strut@$\m@th\displaystyle##$\hfil\crcr
  return {
    colFormat: [{
      gap: .25
    }, {
      align: 'c'
    }, {
      gap: 0
    }],
    jot: .3
  };
}); // defineEnvironment('cardinality', '', {}, function() {
//     const result = {};
//     result.mathstyle = 'textstyle';
//     result.lFence = '|';
//     result.rFence = '|';
//     return result;
// });

defineEnvironment(['matrix', 'pmatrix', 'bmatrix', 'Bmatrix', 'vmatrix', 'Vmatrix', 'smallmatrix', 'matrix*', 'pmatrix*', 'bmatrix*', 'Bmatrix*', 'vmatrix*', 'Vmatrix*', 'smallmatrix*'], '[columns:colspec]', {}, function (name, args) {
  // From amstex.sty:
  // \def\matrix{\hskip -\arraycolsep\array{*\c@MaxMatrixCols c}}
  // \def\endmatrix{\endarray \hskip -\arraycolsep}
  var result = {};
  result.mathstyle = 'textstyle';

  switch (name) {
    case 'pmatrix':
    case 'pmatrix*':
      result.lFence = '(';
      result.rFence = ')';
      break;

    case 'bmatrix':
    case 'bmatrix*':
      result.lFence = '[';
      result.rFence = ']';
      break;

    case 'Bmatrix':
    case 'Bmatrix*':
      result.lFence = '\\lbrace';
      result.rFence = '\\rbrace';
      break;

    case 'vmatrix':
    case 'vmatrix*':
      result.lFence = '\\vert';
      result.rFence = '\\vert';
      break;

    case 'Vmatrix':
    case 'Vmatrix*':
      result.lFence = '\\Vert';
      result.rFence = '\\Vert';
      break;

    case 'smallmatrix':
    case 'smallmatrix*':
      result.mathstyle = 'scriptstyle';
      break;

    case 'matrix':
    case 'matrix*':
      // Specifying a fence, even a null fence,
      // will prevent the insertion of an initial and final gap
      result.lFence = '.';
      result.rFence = '.';
      break;

    default:
  }

  result.colFormat = args[0] || [{
    align: 'c'
  }, {
    align: 'c'
  }, {
    align: 'c'
  }, {
    align: 'c'
  }, {
    align: 'c'
  }, {
    align: 'c'
  }, {
    align: 'c'
  }, {
    align: 'c'
  }, {
    align: 'c'
  }, {
    align: 'c'
  }];
  return result;
});
defineEnvironment('cases', '', {}, function () {
  // From amstex.sty:
  // \def\cases{\left\{\def\arraystretch{1.2}\hskip-\arraycolsep
  //   \array{l@{\quad}l}}
  // \def\endcases{\endarray\hskip-\arraycolsep\right.}
  // From amsmath.dtx
  // \def\env@cases{%
  //   \let\@ifnextchar\new@ifnextchar
  //   \left\lbrace
  //   \def\arraystretch{1.2}%
  //   \array{@{}l@{\quad}l@{}}%
  return {
    arraystretch: 1.2,
    lFence: '\\lbrace',
    rFence: '.',
    colFormat: [{
      align: 'l'
    }, {
      gap: 1
    }, {
      align: 'l'
    }]
  };
});
defineEnvironment('theorem', '', {}, function () {
  return {};
});
defineEnvironment('center', '', {}, function () {
  return {
    colFormat: [{
      align: 'c'
    }]
  };
});
category = ''; // Simple characters allowed in math mode

defineSymbols('0123456789/@.');
defineSymbolRange(0x0041, 0x005A); // a-z

defineSymbolRange(0x0061, 0x007A); // A-Z

category = 'Trigonometry';
defineFunction(['\\arcsin', '\\arccos', '\\arctan', '\\arctg', '\\arcctg', '\\arg', '\\ch', '\\cos', '\\cosec', '\\cosh', '\\cot', '\\cotg', '\\coth', '\\csc', '\\ctg', '\\cth', '\\sec', '\\sin', '\\sinh', '\\sh', '\\tan', '\\tanh', '\\tg', '\\th'], '', null, function (name) {
  return {
    type: 'mop',
    limits: 'nolimits',
    symbol: false,
    isFunction: true,
    body: name.slice(1),
    baseFontFamily: 'cmr'
  };
});
frequency(SUPERCOMMON, '\\cos', '\\sin', '\\tan');
frequency(UNCOMMON, '\\arcsin', '\\arccos', '\\arctan', '\\arctg', '\\arcctg', '\\arcsec', '\\arccsc');
frequency(UNCOMMON, '\\arsinh', '\\arccosh', '\\arctanh', '\\arcsech', '\\arccsch');
frequency(UNCOMMON, '\\arg', '\\ch', '\\cosec', '\\cosh', '\\cot', '\\cotg', '\\coth', '\\csc', '\\ctg', '\\cth', '\\lg', '\\lb', '\\sec', '\\sinh', '\\sh', '\\tanh', '\\tg', '\\th');
category = 'Functions';
defineFunction(['\\deg', '\\dim', '\\exp', '\\hom', '\\ker', '\\lb', '\\lg', '\\ln', '\\log'], '', null, function (name) {
  return {
    type: 'mop',
    limits: 'nolimits',
    symbol: false,
    isFunction: true,
    body: name.slice(1),
    baseFontFamily: 'cmr'
  };
});
frequency(SUPERCOMMON, '\\ln', '\\log', '\\exp');
frequency(292, '\\hom');
frequency(COMMON, '\\dim');
frequency(COMMON, '\\ker', '\\deg'); // >2,000

defineFunction(['\\lim', '\\mod'], '', null, function (name) {
  return {
    type: 'mop',
    limits: 'limits',
    symbol: false,
    body: name.slice(1),
    baseFontFamily: 'cmr'
  };
});
defineFunction(['\\det', '\\max', '\\min'], '', null, function (name) {
  return {
    type: 'mop',
    limits: 'limits',
    symbol: false,
    isFunction: true,
    body: name.slice(1),
    baseFontFamily: 'cmr'
  };
});
frequency(SUPERCOMMON, '\\lim');
frequency(COMMON, '\\det');
frequency(COMMON, '\\mod');
frequency(COMMON, '\\min');
frequency(COMMON, '\\max');
category = 'Decoration'; // A box of the width and height

defineFunction('\\rule', '[raise:dimen]{width:dimen}{thickness:dimen}', null, function (name, args) {
  return {
    type: 'rule',
    shift: args[0],
    width: args[1],
    height: args[2]
  };
});
defineFunction('\\color', '{:color}', {
  allowedInText: true
}, function (_name, args) {
  return {
    color: args[0]
  };
}); // From the xcolor package.
// As per xcolor, this command does not set the mode to text
// (unlike what its name might suggest)

defineFunction('\\textcolor', '{:color}{content:auto*}', {
  allowedInText: true
}, function (_name, args) {
  return {
    color: args[0]
  };
});
frequency(3, '\\textcolor'); // An overline

defineFunction('\\overline', '{:auto}', null, function (name, args) {
  return {
    type: 'line',
    position: 'overline',
    skipBoundary: true,
    body: args[0]
  };
});
frequency(COMMON, '\\overline'); // > 2,000

defineFunction("\\underline", '{:auto}', null, function (name, args) {
  return {
    type: 'line',
    position: 'underline',
    skipBoundary: true,
    body: args[0]
  };
});
frequency(COMMON, "\\underline"); // > 2,000

defineFunction('\\overset', '{annotation:auto}{symbol:auto}', null, function (name, args) {
  return {
    type: 'overunder',
    overscript: args[0],
    skipBoundary: true,
    body: args[1]
  };
});
frequency(COMMON, '\\overset'); // > 2,000

defineFunction("\\underset", '{annotation:auto}{symbol:auto}', null, function (name, args) {
  return {
    type: 'overunder',
    underscript: args[0],
    skipBoundary: true,
    body: args[1]
  };
});
frequency(COMMON, "\\underset"); // > 2,000

defineFunction(['\\stackrel', '\\stackbin'], '{annotation:auto}{symbol:auto}', null, function (name, args) {
  return {
    type: 'overunder',
    overscript: args[0],
    skipBoundary: true,
    body: args[1],
    mathtype: name === '\\stackrel' ? 'mrel' : 'mbin'
  };
});
frequency(COMMON, '\\stackrel'); // > 2,000

frequency(0, '\\stackbin');
defineFunction('\\rlap', '{:auto}', null, function (name, args) {
  return {
    type: 'overlap',
    align: 'right',
    skipBoundary: true,
    body: args[0]
  };
});
frequency(270, '\\rlap');
defineFunction('\\llap', '{:auto}', null, function (name, args) {
  return {
    type: 'overlap',
    align: 'left',
    skipBoundary: true,
    body: args[0]
  };
});
frequency(18, '\\llap');
defineFunction('\\mathrlap', '{:auto}', null, function (name, args) {
  return {
    type: 'overlap',
    mode: 'math',
    align: 'right',
    skipBoundary: true,
    body: args[0]
  };
});
frequency(CRYPTIC, '\\mathrlap');
defineFunction('\\mathllap', '{:auto}', null, function (name, args) {
  return {
    type: 'overlap',
    mode: 'math',
    align: 'left',
    skipBoundary: true,
    body: args[0]
  };
});
frequency(CRYPTIC, '\\mathllap'); // Can be preceded by e.g. '\fboxsep=4pt' (also \fboxrule)
// Note:
// - \boxed: sets content in displaystyle mode (@todo: should change type of argument)
//      equivalent to \fbox{$$<content>$$}
// - \fbox: sets content in 'auto' mode (frequency 777)
// - \framebox[<width>][<alignment>]{<content>} (<alignment> := 'c'|'t'|'b' (center, top, bottom) (frequency 28)
// @todo

defineFunction('\\boxed', '{content:math}', null, function (name, args) {
  return {
    type: 'box',
    framecolor: 'black',
    skipBoundary: true,
    body: args[0]
  };
});
frequency(1236, '\\boxed');
defineFunction('\\colorbox', '{background-color:color}{content:auto}', {
  allowedInText: true
}, function (name, args) {
  return {
    type: 'box',
    backgroundcolor: args[0],
    skipBoundary: true,
    body: args[1]
  };
});
frequency(CRYPTIC, '\\colorbox');
defineFunction('\\fcolorbox', '{frame-color:color}{background-color:color}{content:auto}', {
  allowedInText: true
}, function (name, args) {
  return {
    type: 'box',
    framecolor: args[0],
    backgroundcolor: args[1],
    skipBoundary: true,
    body: args[2]
  };
});
frequency(CRYPTIC, '\\fcolorbox'); // \bbox, MathJax extension
// The first argument is a CSS border property shorthand, e.g.
// \bbox[red], \bbox[5px,border:2px solid red]
// The MathJax syntax is
// arglist ::= <arg>[,<arg>[,<arg>]]
// arg ::= [<background:color>|<padding:dimen>|<style>]
// style ::= 'border:' <string>

defineFunction('\\bbox', '[:bbox]{body:auto}', {
  allowedInText: true
}, function (name, args) {
  if (args[0]) {
    return {
      type: 'box',
      padding: args[0].padding,
      border: args[0].border,
      backgroundcolor: args[0].backgroundcolor,
      skipBoundary: true,
      body: args[1]
    };
  }

  return {
    type: 'box',
    skipBoundary: true,
    body: args[1]
  };
});
frequency(CRYPTIC, '\\bbox'); // \enclose, a MathJax extension mapping to the MathML `menclose` tag.
// The first argument is a comma delimited list of notations, as defined
// here: https://developer.mozilla.org/en-US/docs/Web/MathML/Element/menclose
// The second, optional, specifies the style to use for the notations.

defineFunction('\\enclose', '{notation:string}[style:string]{body:auto}', null, function (name, args) {
  var notations = args[0] || [];
  var result = {
    type: 'enclose',
    strokeColor: 'currentColor',
    strokeWidth: 1,
    strokeStyle: 'solid',
    backgroundcolor: 'transparent',
    padding: 'auto',
    shadow: 'auto',
    captureSelection: true,
    // Do not let children be selected
    body: args[2] // Extract info from style string

  };

  if (args[1]) {
    // Split the string by comma delimited sub-strings, ignoring commas
    // that may be inside (). For example"x, rgb(a, b, c)" would return
    // ['x', 'rgb(a, b, c)']
    var styles = args[1].split(/,(?![^(]*\)(?:(?:[^(]*\)){2})*[^"]*$)/);
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = styles[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var s = _step5.value;
        var shorthand = s.match(/\s*(\S+)\s+(\S+)\s+(.*)/);

        if (shorthand) {
          result.strokeWidth = _fontMetrics.default.toPx(shorthand[1], 'px');

          if (!isFinite(result.strokeWidth)) {
            result.strokeWidth = 1;
          }

          result.strokeStyle = shorthand[2];
          result.strokeColor = shorthand[3];
        } else {
          var attribute = s.match(/\s*([a-z]*)\s*=\s*"(.*)"/);

          if (attribute) {
            if (attribute[1] === 'mathbackground') {
              result.backgroundcolor = attribute[2];
            } else if (attribute[1] === 'mathcolor') {
              result.strokeColor = attribute[2];
            } else if (attribute[1] === 'padding') {
              result.padding = _fontMetrics.default.toPx(attribute[2], 'px');
            } else if (attribute[1] === 'shadow') {
              result.shadow = attribute[2];
            }
          }
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

    if (result.strokeStyle === 'dashed') {
      result.svgStrokeStyle = '5,5';
    } else if (result.strokeStyle === 'dotted') {
      result.svgStrokeStyle = '1,5';
    }
  }

  result.borderStyle = result.strokeWidth + 'px ' + result.strokeStyle + ' ' + result.strokeColor; // Normalize the list of notations.

  notations = notations.toString().split(/[, ]/).filter(function (v) {
    return v.length > 0;
  }).map(function (v) {
    return v.toLowerCase();
  });
  result.notation = {};
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = notations[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var notation = _step6.value;
      result.notation[notation] = true;
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

  if (result.notation['updiagonalarrow']) result.notation['updiagonalstrike'] = false;

  if (result.notation['box']) {
    result.notation['left'] = false;
    result.notation['right'] = false;
    result.notation['bottom'] = false;
    result.notation['top'] = false;
  }

  return result;
});
frequency(CRYPTIC, '\\enclose');
defineFunction('\\cancel', '{body:auto}', null, function (name, args) {
  return {
    type: 'enclose',
    strokeColor: 'currentColor',
    strokeWidth: 1,
    strokeStyle: 'solid',
    borderStyle: '1px solid currentColor',
    backgroundcolor: 'transparent',
    padding: 'auto',
    shadow: 'auto',
    notation: {
      "updiagonalstrike": true
    },
    body: args[0]
  };
});
defineFunction('\\bcancel', '{body:auto}', null, function (name, args) {
  return {
    type: 'enclose',
    strokeColor: 'currentColor',
    strokeWidth: 1,
    strokeStyle: 'solid',
    borderStyle: '1px solid currentColor',
    backgroundcolor: 'transparent',
    padding: 'auto',
    shadow: 'auto',
    notation: {
      "downdiagonalstrike": true
    },
    body: args[0]
  };
});
defineFunction('\\xcancel', '{body:auto}', null, function (name, args) {
  return {
    type: 'enclose',
    strokeColor: 'currentColor',
    strokeWidth: 1,
    strokeStyle: 'solid',
    borderStyle: '1px solid currentColor',
    backgroundcolor: 'transparent',
    padding: 'auto',
    shadow: 'auto',
    notation: {
      "updiagonalstrike": true,
      "downdiagonalstrike": true
    },
    body: args[0]
  };
});
frequency(CRYPTIC, '\\cancel', '\\bcancel', '\\xcancel');
category = 'Styling'; // Size

defineFunction(['\\tiny', '\\scriptsize', '\\footnotesize', '\\small', '\\normalsize', '\\large', '\\Large', '\\LARGE', '\\huge', '\\Huge'], '', {
  allowedInText: true
}, function (name, _args) {
  return {
    fontSize: {
      'tiny': 'size1',
      'scriptsize': 'size2',
      'footnotesize': 'size3',
      'small': 'size4',
      'normalsize': 'size5',
      'large': 'size6',
      'Large': 'size7',
      'LARGE': 'size8',
      'huge': 'size9',
      'Huge': 'size10'
    }[name.slice(1)]
  };
}); // SERIES: weight

defineFunction('\\fontseries', '{:text}', {
  allowedInText: true
}, function (_name, args) {
  return {
    fontSeries: parseArgAsString(args[0])
  };
});
defineFunction('\\bf', '', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontSeries: 'b'
  };
});
defineFunction('\\bm', '{:math*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontSeries: 'b'
  };
}); // Note: switches to math mode

defineFunction('\\bold', '', {
  allowedInText: true
}, function (_name, _args) {
  return {
    mode: 'math',
    fontSeries: 'b'
  };
});
defineFunction(['\\mathbf', '\\boldsymbol'], '{:math*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    mode: 'math',
    fontSeries: 'b',
    fontShape: 'n'
  };
});
defineFunction('\\bfseries', '', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontSeries: 'b'
  };
});
defineFunction('\\textbf', '{:text*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontSeries: 'b'
  };
});
defineFunction('\\mathmd', '{:math*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    mode: 'math',
    fontSeries: 'm',
    fontShape: 'n'
  };
});
defineFunction('\\mdseries', '', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontSeries: 'm'
  };
});
defineFunction('\\textmd', '{:math*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontSeries: 'm'
  };
}); // @todo \textlf
// SHAPE: italic, small caps

defineFunction('\\fontshape', '{:text}', {
  allowedInText: true
}, function (_name, args) {
  return {
    fontShape: parseArgAsString(args[0])
  };
});
defineFunction('\\it', '', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontShape: 'it'
  };
});
defineFunction('\\mathit', '{:math*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    mode: 'math',
    fontSeries: 'm',
    fontShape: 'it'
  };
});
defineFunction("\\upshape", '', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontShape: 'n'
  };
});
defineFunction('\\textup', '{:text*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontShape: 'n'
  };
});
defineFunction('\\textit', '{:text*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontShape: 'it'
  };
});
defineFunction('\\slshape', '', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontShape: 'sl'
  };
});
defineFunction('\\textsl', '{:text*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontShape: 'sl'
  };
}); // Small caps (switches to text mode)

defineFunction('\\scshape', '', {
  allowedInText: true
}, function (_name, _args) {
  return {
    mode: 'text',
    fontShape: 'sc'
  };
});
defineFunction('\\textsc', '{:text*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontShape: 'sc'
  };
}); // FONT FAMILY: Fraktur, Calligraphic, ...

defineFunction('\\fontfamily', '{:text}', {
  allowedInText: true
}, function (_name, args) {
  return {
    fontFamily: parseArgAsString(args[0])
  };
});
defineFunction('\\mathrm', '{:math*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    mode: 'math',
    fontFamily: 'cmr',
    fontSeries: 'm',
    fontShape: 'n'
  };
});
defineFunction('\\rmfamily', '', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontFamily: 'cmr'
  };
});
defineFunction('\\textrm', '{:text*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontFamily: 'cmr'
  };
});
defineFunction('\\mathsf', '{:math*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    mode: 'math',
    baseFontFamily: 'cmss',
    fontSeries: 'm',
    fontShape: 'n'
  };
});
defineFunction('\\sffamily', '', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontFamily: 'cmss'
  };
});
defineFunction('\\textsf', '{:text*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontFamily: 'cmss'
  };
});
defineFunction('\\mathtt', '{:math*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    mode: 'math',
    baseFontFamily: 'cmtt',
    fontSeries: 'm',
    fontShape: 'n'
  };
});
defineFunction('\\ttfamily', '', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontFamily: 'cmtt'
  };
});
defineFunction('\\texttt', '{:text*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontFamily: 'cmtt'
  };
});
defineFunction(['\\Bbb', '\\mathbb'], '{:math*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    mode: 'math',
    baseFontFamily: 'bb'
  };
});
defineFunction(['\\frak', '\\mathfrak'], '{:math*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    baseFontFamily: 'frak'
  };
});
defineFunction('\\mathcal', '{:math*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    mode: 'math',
    baseFontFamily: 'cal',
    fontSeries: 'm',
    fontShape: 'n'
  };
});
defineFunction('\\mathscr', '{:math*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    mode: 'math',
    baseFontFamily: 'scr',
    fontSeries: 'm',
    fontShape: 'n'
  };
});
frequency(SUPERCOMMON, '\\mathbb');
frequency(1081, '\\Bbb');
frequency(0, '\\mathcal');
frequency(COMMON, '\\mathfrak');
frequency(271, '\\frak');
frequency(COMMON, '\\mathscr');
frequency(UNCOMMON, '\\mathsf');
frequency(COMMON, '\\mathtt');
frequency(COMMON, '\\boldsymbol'); // frequency(780, '\\tt');
// @todo: family could be 'none' or 'default'
// "normal" font of the body text, not necessarily roman

defineFunction('\\textnormal', '{:text*}', {
  allowedInText: true
}, function (_name, _args) {
  return {
    fontFamily: 'cmr',
    fontShape: 'n',
    fontSeries: 'n'
  };
}); // Rough synomym for \text{}

/*
An \mbox within math mode does not use the current math font; rather it uses
the typeface of the surrounding running text.
*/

defineFunction('\\mbox', '{:text*}', null, function (_name, _args) {
  return {
    fontFamily: 'cmr'
  };
});
defineFunction('\\text', '{:text*}', {
  allowedInText: true
}, function (_name, _args) {
  return {};
});
/* A MathJax extension: assign a class to the element */

defineFunction('\\class', '{name:text}{content:auto*}', {
  allowedInText: true
}, function (_name, args) {
  return {
    cssClass: parseArgAsString(args[0])
  };
});
/* A MathJax extension: assign an ID to the element */

defineFunction('\\cssId', '{id:text}{content:auto}', {
  allowedInText: true
}, function (_name, args) {
  return {
    cssId: parseArgAsString(args[0]),
    body: args[1],
    type: 'group'
  };
});
/* Note: in TeX, \em is restricted to text mode. We extend it to math */

defineFunction('\\em', '', {
  allowedInText: true
}, function (_name, _args) {
  return {
    cssClass: 'ML__emph',
    type: 'group'
  };
});
/* Note: in TeX, \emph is restricted to text mode. We extend it to math */

defineFunction('\\emph', '{:auto}', {
  allowedInText: true
}, function (_name, args) {
  return {
    cssClass: 'ML__emph',
    body: args[0],
    type: 'group',
    skipBoundary: true
  };
});
frequency(COMMON, '\\textrm');
frequency(COMMON, '\\textit');
frequency(COMMON, '\\textsf');
frequency(COMMON, '\\texttt');
frequency(433, '\\textnormal');
frequency(COMMON, '\\textbf');
frequency(421, '\\textup');
frequency(819, '\\emph');
frequency(49, '\\em');
category = 'Operators'; // Root

defineFunction('\\sqrt', '[index:auto]{radicand:auto}', null, function (name, args) {
  return {
    type: 'surd',
    body: args[1],
    index: args[0]
  };
});
frequency(SUPERCOMMON, '\\sqrt');
category = 'Fractions'; // Fractions

defineFunction(['\\frac', '\\dfrac', '\\tfrac', '\\cfrac', '\\binom', '\\dbinom', '\\tbinom'], '{numerator}{denominator}', null, function (name, args) {
  var result = {
    type: 'genfrac',
    numer: args[0],
    denom: args[1],
    mathstyle: 'auto'
  };

  switch (name) {
    case '\\dfrac':
    case '\\frac':
    case '\\tfrac':
    case '\\cfrac':
      result.hasBarLine = true;
      break;

    case '\\\\atopfrac':
      result.hasBarLine = false;
      break;

    case '\\dbinom':
    case '\\binom':
    case '\\tbinom':
      result.hasBarLine = false;
      result.leftDelim = '(';
      result.rightDelim = ')';
      break;
  }

  switch (name) {
    case '\\dfrac':
    case '\\dbinom':
      result.mathstyle = 'displaystyle';
      break;

    case '\\tfrac':
    case '\\tbinom':
      result.mathstyle = 'textstyle';
      break;
  }

  if (name === '\\cfrac') {
    result.continuousFraction = true;
  }

  return result;
});
/* \\substack: frequency 16 */

/*
\over = \above 0.4pt
\atop = \above 0pt
\choose = \atopwithdelims()
*/
// infix commands:
// {above}\atop{below} --> \genfrac{}{}{0pt}{above}{below}
// {above}\atopwithdelims{leftdelim}{rightdelim}{below} --> \genfrac{leftdelim}{rightdelim}{0pt}{0/1/2/3}{above}{below}
//  Note: 0/1/2/3 -> displaystyle, textstyle, scriptstyle, scriptscriptstyle
// \atopwithdelimiters
// a\above 0.5pt b               -->
// \abovewithdelims
// \choose              --> \binom
// \choose = \atopwithdelims()          INFIX
// \def\brack{\atopwithdelims[]}        INFIX
// \def\brace{\atopwithdelims\{\}}      INFIX
// '\\above', /* {dim} 122 */
// '\\overwithdelims' /* {leftdelim}{rightdelim} w/ barline 15 */,
// '\\atopwithdelims' /* {leftdelim}{rightdelim} no barline 0 */,
// '\\atop' /* nodelims, no barline 0 */,
// '\\brack', '\\brace' like \choose, but
//      with braces and brackets fences. 0 usage in latexsearch */

defineFunction(['\\over'
/* 21 */
, '\\atop'
/* 12 */
, '\\choose'
/* 1968 */
], '', {
  infix: true
}, function (name, args) {
  var numer = args[0];
  var denom = args[1];
  var hasBarLine = false;
  var leftDelim = null;
  var rightDelim = null;

  switch (name) {
    case '\\atop':
      break;

    case '\\over':
      hasBarLine = true;
      break;

    case '\\choose':
      hasBarLine = false;
      leftDelim = '(';
      rightDelim = ')';
      break;

    default:
      throw new Error('Unrecognized genfrac command');
  }

  return {
    type: 'genfrac',
    numer: numer,
    denom: denom,
    hasBarLine: hasBarLine,
    leftDelim: leftDelim,
    rightDelim: rightDelim,
    mathstyle: 'auto'
  };
});
frequency(21, '\\over');
frequency(12, '\\atop');
frequency(1968, '\\choose');
defineFunction(['\\overwithdelims'
/* 21 */
, '\\atopwithdelims'
/* COMMON */
], '{left-delim:delim}{right-delim:delim}', {
  infix: true
}, function (name, args) {
  return {
    type: 'genfrac',
    numer: args[0],
    denom: args[1],
    hasBarLine: false,
    leftDelim: args[2],
    rightDelim: args[3],
    mathstyle: 'auto'
  };
});
frequency(15, '\\overwithdelims');
frequency(COMMON, '\\atopwithdelims'); // frequency(COMMON, '\\frac');
// frequency(UNCOMMON, '\\binom');
// frequency(RARE, '\\dfrac', '\\tfrac', '\\dbinom', '\\tbinom');
// Slashed package

/*
defineFunction('\\slashed'
*/

category = 'Fractions';
defineFunction('\\pdiff', '{numerator}{denominator}', null, function (_funcname, args) {
  return {
    type: 'genfrac',
    numer: args[0],
    denom: args[1],
    numerPrefix: "\u2202",
    denomPrefix: "\u2202",
    hasBarLine: true,
    leftDelim: null,
    rightDelim: null,
    mathstyle: 'auto'
  };
}); // frequency(RARE, '\\pdiff');
// Quantifiers

category = 'Quantifiers';
defineSymbol('\\forall', MAIN, MATHORD, "\u2200", SUPERCOMMON);
defineSymbol('\\exists', MAIN, MATHORD, "\u2203", SUPERCOMMON);
defineSymbol('\\nexists', AMS, MATHORD, "\u2204", SUPERCOMMON);
defineSymbol('\\mid', MAIN, REL, "\u2223", COMMON);
defineSymbol('\\top', MAIN, MATHORD, "\u22A4", RARE);
defineSymbol('\\bot', MAIN, MATHORD, "\u22A5", RARE);
category = 'Variable Sized Symbols'; // Limits, symbols

defineFunction(['\\sum', '\\prod', '\\bigcup', '\\bigcap', '\\coprod', '\\bigvee', '\\bigwedge', '\\biguplus', '\\bigotimes', '\\bigoplus', '\\bigodot', '\\bigsqcup', '\\smallint', '\\intop'], '', null, function (name) {
  return {
    type: 'mop',
    limits: 'auto',
    symbol: true,
    baseFontFamily: 'cmr',
    body: {
      'coprod': "\u2210",
      'bigvee': "\u22C1",
      'bigwedge': "\u22C0",
      'biguplus': "\u2A04",
      'bigcap': "\u22C2",
      'bigcup': "\u22C3",
      'intop': "\u222B",
      'prod': "\u220F",
      'sum': "\u2211",
      'bigotimes': "\u2A02",
      'bigoplus': "\u2A01",
      'bigodot': "\u2A00",
      'bigsqcup': "\u2A06",
      'smallint': "\u222B"
    }[name.slice(1)]
  };
}); // No limits, symbols

defineFunction(['\\int', '\\iint', '\\iiint', '\\oint', '\\oiint', '\\oiiint', '\\intclockwise', '\\varointclockwise', '\\ointctrclockwise', '\\intctrclockwise'], '', null, function (name) {
  return {
    type: 'mop',
    limits: 'nolimits',
    symbol: true,
    body: {
      'int': "\u222B",
      'iint': "\u222C",
      'iiint': "\u222D",
      'oint': "\u222E",
      'oiint': "\u222F",
      'oiiint': "\u2230",
      'intclockwise': "\u2231",
      'varointclockwise': "\u2232",
      'ointctrclockwise': "\u2233",
      'intctrclockwise': "\u2A11"
    }[name.slice(1)]
  };
});
frequency(SUPERCOMMON, '\\sum', '\\prod', '\\bigcap', '\\bigcup', '\\int');
frequency(COMMON, '\\bigoplus', '\\smallint', '\\iint', '\\oint');
frequency(RARE, '\\bigwedge', '\\bigvee');
frequency(756, '\\coprod');
frequency(723, '\\bigsqcup');
frequency(1241, '\\bigotimes');
frequency(150, '\\bigodot');
frequency(174, '\\biguplus');
frequency(878, '\\iiint');
frequency(97, '\\intop'); // Misc Symbols

category = 'Various';
defineSymbol('\\sharp', MAIN, MATHORD, "\u266F", COMMON); // >2,000

defineSymbol('\\flat', MAIN, MATHORD, "\u266D", 590);
defineSymbol('\\natural', MAIN, MATHORD, "\u266E", 278);
defineSymbol('\\#', MAIN, MATHORD, "#", RARE);
defineSymbol('\\&', MAIN, MATHORD, "&", RARE);
defineSymbol('\\clubsuit', MAIN, MATHORD, "\u2663", 172);
defineSymbol('\\heartsuit', MAIN, MATHORD, "\u2661", ARCANE);
defineSymbol('\\spadesuit', MAIN, MATHORD, "\u2660", ARCANE);
defineSymbol('\\diamondsuit', MAIN, MATHORD, "\u2662", CRYPTIC); // defineSymbol( '\\cross',  MAIN,  MATHORD, '\uF4A0'); // NOTE: not a real TeX symbol, but Mathematica
// defineSymbol( '\\transpose',  MAIN,  MATHORD, '\uF3C7'); // NOTE: not a real TeX symbol, but Mathematica
// defineSymbol( '\\conjugate', 'conj'],  MAIN,  MATHORD, '\uF3C8'); // NOTE: not a real TeX symbol, but Mathematica
// defineSymbol( '\\conjugatetranspose',  MAIN,  MATHORD, '\uF3C9'); // NOTE: not a real TeX symbol, but Mathematica
// defineSymbol( '\\hermitianconjugate',  MAIN,  MATHORD, '\uF3CE'); // NOTE: not a real TeX symbol, but Mathematica

defineSymbol('\\differencedelta', MAIN, REL, "\u2206", COMMON);
category = 'Letters and Letter Like Forms';
defineFunction("\\unicode", '{charcode:number}', null, function (name, args) {
  var codepoint = parseInt(args[0]);
  if (!isFinite(codepoint)) codepoint = 0x2753; // BLACK QUESTION MARK

  return {
    type: 'mord',
    body: String.fromCodePoint(codepoint)
  };
});
defineSymbol('\\backslash', MAIN, MATHORD, '\\');
defineSymbol('?', MAIN, MATHORD, '?');
defineSymbol('!', MAIN, MATHORD, '!');
defineSymbol('\\nabla', MAIN, MATHORD, "\u2207", SUPERCOMMON);
defineSymbol('\\partial', MAIN, MATHORD, "\u2202", SUPERCOMMON); // >2,000

defineSymbol('\\ell', MAIN, MATHORD, "\u2113", COMMON); // >2,000

defineSymbol('\\imaginaryI', MAIN, MATHORD, 'i'); // NOTE: not a real TeX symbol, but Mathematica
// NOTE: set in math as per ISO 80000-2:2009.

defineSymbol('\\imaginaryJ', MAIN, MATHORD, 'j'); // NOTE: not a real TeX symbol, but Mathematica
// NOTE: set in math as per ISO 80000-2:2009.

defineFunction(['\\Re', '\\Im'], '', null, function (name) {
  return {
    type: 'mop',
    limits: 'nolimits',
    symbol: false,
    isFunction: true,
    body: {
      '\\Re': "\u211C",
      '\\Im': "\u2111"
    }[name],
    baseFontFamily: 'frak'
  };
});
defineSymbol('\\hbar', MAIN, MATHORD, "\u210F", COMMON); // >2,000

defineSymbol('\\hslash', AMS, MATHORD, "\u210F", COMMON); // >2,000

defineSymbol('\\differentialD', 'cmr', MATHORD, 'd'); // NOTE: not a real TeX symbol, but Mathematica

defineSymbol('\\rd', 'cmr', MATHORD, 'd'); // NOTE: not a real TeX symbol, but used in ProofWiki
// NOTE: set in math as per ISO 80000-2:2009.

defineSymbol('\\capitalDifferentialD', 'cmr', MATHORD, 'D'); // NOTE: not a real TeX symbol, but Mathematica
// NOTE: set in math as per ISO 80000-2:2009.

defineSymbol('\\rD', 'cmr', MATHORD, 'D'); // NOTE: not a real TeX symbol

defineSymbol('\\exponentialE', 'cmr', MATHORD, 'e'); // NOTE: not a real TeX symbol, but Mathematica
// NOTE: set in math as per ISO 80000-2:2009.

defineSymbol('\\Finv', AMS, MATHORD, "\u2132", 3);
defineSymbol('\\Game', AMS, MATHORD, "\u2141", 1);
defineSymbol('\\wp', MAIN, MATHORD, "\u2118", 1306);
defineSymbol('\\eth', AMS, MATHORD, "\xF0", 77);
defineSymbol('\\mho', AMS, MATHORD, "\u2127", 138);
defineSymbol('\\Bbbk', AMS, MATHORD, "k");
defineSymbol('\\doubleStruckCapitalN', 'bb', MATHORD, 'N'); // NOTE: Not TeX?

defineSymbol('\\N', 'bb', MATHORD, 'N'); // NOTE: Check if standard Latex

defineSymbol('\\doubleStruckCapitalR', 'bb', MATHORD, 'R'); // NOTE: Not TeX?

defineSymbol('\\R', 'bb', MATHORD, 'R'); // NOTE: Check if standard Latex

defineSymbol('\\doubleStruckCapitalQ', 'bb', MATHORD, 'Q'); // NOTE: Not TeX?

defineSymbol('\\Q', 'bb', MATHORD, 'Q'); // NOTE: Check if standard Latex

defineSymbol('\\doubleStruckCapitalC', 'bb', MATHORD, 'C'); // NOTE: Not TeX?

defineSymbol('\\C', 'bb', MATHORD, 'C'); // NOTE: Check if standard Latex

defineSymbol('\\doubleStruckCapitalZ', 'bb', MATHORD, 'Z'); // NOTE: Not TeX?

defineSymbol('\\Z', 'bb', MATHORD, 'Z'); // NOTE: Check if standard Latex

defineSymbol('\\doubleStruckCapitalP', 'bb', MATHORD, 'P'); // NOTE: Not TeX?

defineSymbol('\\P', 'bb', MATHORD, 'P'); // NOTE: Check if standard Latex

defineSymbol('\\scriptCapitalE', 'scr', MATHORD, 'E'); // NOTE: Not TeX?

defineSymbol('\\scriptCapitalH', 'scr', MATHORD, 'H'); // NOTE: Not TeX?

defineSymbol('\\scriptCapitalL', 'scr', MATHORD, 'L'); // NOTE: Not TeX?

defineSymbol('\\gothicCapitalC', 'frak', MATHORD, 'C'); // NOTE: Not TeX?

defineSymbol('\\gothicCapitalH', 'frak', MATHORD, 'H'); // NOTE: Not TeX?

defineSymbol('\\gothicCapitalI', 'frak', MATHORD, 'I'); // NOTE: Not TeX?

defineSymbol('\\gothicCapitalR', 'frak', MATHORD, 'R'); // NOTE: Not TeX?

defineSymbol('\\pounds', MAIN, MATHORD, "\xA3", 509);
defineSymbol('\\yen', AMS, MATHORD, "\xA5", 57);
defineSymbol('\\euro', MAIN, MATHORD, "\u20AC", 4); // NOTE: not TeX built-in, but textcomp package
// TODO Koppa, Stigma, Sampi
// Math and Text

category = 'Crosses';
defineSymbol('\\textdagger', MAIN, BIN, "\u2020");
defineSymbol('\\dagger', MAIN, BIN, "\u2020", COMMON); // >2000

defineSymbol('\\dag', MAIN, BIN, "\u2020", COMMON); // >2000 results

defineSymbol('\\ddag', MAIN, BIN, "\u2021", 500); // 500 results in latexsearch

defineSymbol('\\textdaggerdbl', MAIN, BIN, "\u2021");
defineSymbol('\\ddagger', MAIN, BIN, "\u2021", 353); // 353 results in latexsearch

defineSymbol('\\maltese', AMS, MATHORD, "\u2720", 24); // Arrow Symbols

category = 'Arrows';
defineSymbol('\\longrightarrow', MAIN, REL, "\u27F6", SUPERCOMMON); // >2,000

defineSymbol('\\rightarrow', MAIN, REL, "\u2192", SUPERCOMMON); // >2,000

defineSymbol('\\Longrightarrow', MAIN, REL, "\u27F9", SUPERCOMMON); // See \\implies

defineSymbol('\\Rightarrow', MAIN, REL, "\u21D2", SUPERCOMMON); // >2,000

defineSymbol('\\longmapsto', MAIN, REL, "\u27FC", COMMON); // >2,000

defineSymbol('\\mapsto', MAIN, REL, "\u21A6", COMMON); // >2,000

defineSymbol('\\Longleftrightarrow', MAIN, REL, "\u27FA", COMMON); // >2,000

defineSymbol('\\rightleftarrows', AMS, REL, "\u21C4", COMMON); // >2,000

defineSymbol('\\leftarrow', MAIN, REL, "\u2190", COMMON); // >2,000

defineSymbol('\\curvearrowleft', AMS, REL, "\u21B6", COMMON); // >2,000

defineSymbol("\\uparrow", MAIN, REL, "\u2191", COMMON); // >2,000

defineSymbol('\\downarrow', MAIN, REL, "\u2193", COMMON); // >2,000

defineSymbol('\\hookrightarrow', MAIN, REL, "\u21AA", COMMON); // >2,000

defineSymbol('\\rightharpoonup', MAIN, REL, "\u21C0", COMMON); // >2,000

defineSymbol('\\rightleftharpoons', MAIN, REL, "\u21CC", COMMON); // >2,000

defineSymbol('\\Leftarrow', MAIN, REL, "\u21D0", 1695);
defineSymbol('\\longleftrightarrow', MAIN, REL, "\u27F7", 1599);
defineSymbol('\\longleftarrow', MAIN, REL, "\u27F5", 878);
defineSymbol('\\Longleftarrow', MAIN, REL, "\u27F8", 296);
defineSymbol('\\searrow', MAIN, REL, "\u2198", 1609);
defineSymbol('\\nearrow', MAIN, REL, "\u2197", 1301);
defineSymbol('\\swarrow', MAIN, REL, "\u2199", 167);
defineSymbol('\\nwarrow', MAIN, REL, "\u2196", 108);
defineSymbol("\\Uparrow", MAIN, REL, "\u21D1", 257);
defineSymbol('\\Downarrow', MAIN, REL, "\u21D3", 556);
defineSymbol("\\updownarrow", MAIN, REL, "\u2195", 192);
defineSymbol("\\Updownarrow", MAIN, REL, "\u21D5", 161);
defineSymbol('\\hookleftarrow', MAIN, REL, "\u21A9", 115);
defineSymbol('\\leftharpoonup', MAIN, REL, "\u21BC", 93);
defineSymbol('\\leftharpoondown', MAIN, REL, "\u21BD", 42);
defineSymbol('\\rightharpoondown', MAIN, REL, "\u21C1", 80);
defineSymbol('\\leftrightarrows', AMS, REL, "\u21C6", 765);
defineSymbol('\\dashrightarrow', AMS, REL, "\u21E2", 311);
defineSymbol('\\dashleftarrow', AMS, REL, "\u21E0", 5);
defineSymbol('\\leftleftarrows', AMS, REL, "\u21C7", 8);
defineSymbol('\\Lleftarrow', AMS, REL, "\u21DA", 7);
defineSymbol('\\twoheadleftarrow', AMS, REL, "\u219E", 32);
defineSymbol('\\leftarrowtail', AMS, REL, "\u21A2", 25);
defineSymbol('\\looparrowleft', AMS, REL, "\u21AB", 6);
defineSymbol('\\leftrightharpoons', AMS, REL, "\u21CB", 205);
defineSymbol('\\circlearrowleft', AMS, REL, "\u21BA", 105);
defineSymbol('\\Lsh', AMS, REL, "\u21B0", 11);
defineSymbol("\\upuparrows", AMS, REL, "\u21C8", 15);
defineSymbol('\\downharpoonleft', AMS, REL, "\u21C3", 21);
defineSymbol('\\multimap', AMS, REL, "\u22B8", 108);
defineSymbol('\\leftrightsquigarrow', AMS, REL, "\u21AD", 31);
defineSymbol('\\twoheadrightarrow', AMS, REL, "\u21A0", 835);
defineSymbol('\\rightarrowtail', AMS, REL, "\u21A3", 195);
defineSymbol('\\looparrowright', AMS, REL, "\u21AC", 37);
defineSymbol('\\curvearrowright', AMS, REL, "\u21B7", 209);
defineSymbol('\\circlearrowright', AMS, REL, "\u21BB", 63);
defineSymbol('\\Rsh', AMS, REL, "\u21B1", 18);
defineSymbol('\\downdownarrows', AMS, REL, "\u21CA", 6);
defineSymbol("\\upharpoonright", AMS, REL, "\u21BE", 579);
defineSymbol('\\downharpoonright', AMS, REL, "\u21C2", 39);
defineSymbol('\\rightsquigarrow', AMS, REL, "\u21DD", 674);
defineSymbol('\\leadsto', AMS, REL, "\u21DD", 709);
defineSymbol('\\Rrightarrow', AMS, REL, "\u21DB", 62);
defineSymbol('\\restriction', AMS, REL, "\u21BE", 29);
defineSymbol("\\upharpoonleft", AMS, REL, "\u21BF", CRYPTIC);
defineSymbol('\\rightrightarrows', AMS, REL, "\u21C9", CRYPTIC); // AMS Negated Arrows

category = 'Negated Arrows';
defineSymbol('\\nrightarrow', AMS, REL, "\u219B", 324);
defineSymbol('\\nRightarrow', AMS, REL, "\u21CF", 107);
defineSymbol('\\nleftrightarrow', AMS, REL, "\u21AE", 36);
defineSymbol('\\nLeftrightarrow', AMS, REL, "\u21CE", 20);
defineSymbol('\\nleftarrow', AMS, REL, "\u219A", 7);
defineSymbol('\\nLeftarrow', AMS, REL, "\u21CD", 5); // AMS Negated Binary Relations

category = 'Negated Relations';
defineSymbol('\\nless', AMS, REL, "\u226E", 146);
defineSymbol('\\nleqslant', AMS, REL, "\uE010", 58);
defineSymbol('\\lneq', AMS, REL, "\u2A87", 54);
defineSymbol('\\lneqq', AMS, REL, "\u2268", 36);
defineSymbol('\\nleqq', AMS, REL, "\uE011", 18);
defineSymbol("\\unlhd", AMS, BIN, "\u22B4", 253);
defineSymbol("\\unrhd", AMS, BIN, "\u22B5", 66);
defineSymbol('\\lvertneqq', AMS, REL, "\uE00C", 6);
defineSymbol('\\lnsim', AMS, REL, "\u22E6", 4);
defineSymbol('\\lnapprox', AMS, REL, "\u2A89", CRYPTIC);
defineSymbol('\\nprec', AMS, REL, "\u2280", 71);
defineSymbol('\\npreceq', AMS, REL, "\u22E0", 57);
defineSymbol('\\precnsim', AMS, REL, "\u22E8", 4);
defineSymbol('\\precnapprox', AMS, REL, "\u2AB9", 2);
defineSymbol('\\nsim', AMS, REL, "\u2241", 40);
defineSymbol('\\nshortmid', AMS, REL, "\uE006", 1);
defineSymbol('\\nmid', AMS, REL, "\u2224", 417);
defineSymbol('\\nvdash', AMS, REL, "\u22AC", 266);
defineSymbol('\\nvDash', AMS, REL, "\u22AD", 405);
defineSymbol('\\ngtr', AMS, REL, "\u226F", 90);
defineSymbol('\\ngeqslant', AMS, REL, "\uE00F", 23);
defineSymbol('\\ngeqq', AMS, REL, "\uE00E", 12);
defineSymbol('\\gneq', AMS, REL, "\u2A88", 29);
defineSymbol('\\gneqq', AMS, REL, "\u2269", 35);
defineSymbol('\\gvertneqq', AMS, REL, "\uE00D", 6);
defineSymbol('\\gnsim', AMS, REL, "\u22E7", 3);
defineSymbol('\\gnapprox', AMS, REL, "\u2A8A", CRYPTIC);
defineSymbol('\\nsucc', AMS, REL, "\u2281", 44);
defineSymbol('\\nsucceq', AMS, REL, "\u22E1", CRYPTIC);
defineSymbol('\\succnsim', AMS, REL, "\u22E9", 4);
defineSymbol('\\succnapprox', AMS, REL, "\u2ABA", CRYPTIC);
defineSymbol('\\ncong', AMS, REL, "\u2246", 128);
defineSymbol('\\nshortparallel', AMS, REL, "\uE007", 6);
defineSymbol('\\nparallel', AMS, REL, "\u2226", 54);
defineSymbol('\\nVDash', AMS, REL, "\u22AF", 5);
defineSymbol('\\nsupseteqq', AMS, REL, "\uE018", 1);
defineSymbol('\\supsetneq', AMS, REL, "\u228B", 286);
defineSymbol('\\varsupsetneq', AMS, REL, "\uE01B", 2);
defineSymbol('\\supsetneqq', AMS, REL, "\u2ACC", 49);
defineSymbol('\\varsupsetneqq', AMS, REL, "\uE019", 3);
defineSymbol('\\nVdash', AMS, REL, "\u22AE", 179);
defineSymbol('\\precneqq', AMS, REL, "\u2AB5", 11);
defineSymbol('\\succneqq', AMS, REL, "\u2AB6", 3);
defineSymbol('\\nsubseteqq', AMS, REL, "\uE016", 16); // AMS Misc

category = 'Various';
defineSymbol('\\checkmark', AMS, MATHORD, "\u2713", 1025);
defineSymbol('\\diagup', AMS, MATHORD, "\u2571", 440);
defineSymbol('\\diagdown', AMS, MATHORD, "\u2572", 175);
defineSymbol('\\measuredangle', AMS, MATHORD, "\u2221", 271);
defineSymbol('\\sphericalangle', AMS, MATHORD, "\u2222", 156);
defineSymbol('\\backprime', AMS, MATHORD, "\u2035", 104);
defineSymbol('\\backdoubleprime', AMS, MATHORD, "\u2036", CRYPTIC);
category = 'Shapes';
defineSymbol('\\ast', MAIN, BIN, "\u2217", SUPERCOMMON); // >2,000

defineSymbol('\\star', MAIN, BIN, "\u22C6", COMMON); // >2,000

defineSymbol('\\diamond', MAIN, BIN, "\u22C4", 1356);
defineSymbol('\\Diamond', AMS, MATHORD, "\u25CA", 695);
defineSymbol('\\lozenge', AMS, MATHORD, "\u25CA", 422);
defineSymbol('\\blacklozenge', AMS, MATHORD, "\u29EB", 344);
defineSymbol('\\bigstar', AMS, MATHORD, "\u2605", 168); // AMS Hebrew

category = 'Hebrew';
defineSymbol('\\aleph', MAIN, MATHORD, "\u2135", 1381);
defineSymbol('\\beth', AMS, MATHORD, "\u2136", 54);
defineSymbol('\\daleth', AMS, MATHORD, "\u2138", 43);
defineSymbol('\\gimel', AMS, MATHORD, "\u2137", 36); // AMS Delimiters

category = 'Fences';
defineSymbol('\\lbrace', MAIN, OPEN, '{', SUPERCOMMON); // >2,000

defineSymbol('\\rbrace', MAIN, CLOSE, '}', SUPERCOMMON); // >2,000

defineSymbol('\\langle', MAIN, OPEN, "\u27E8", COMMON); // >2,000

defineSymbol('\\rangle', MAIN, CLOSE, "\u27E9", COMMON);
defineSymbol('\\lfloor', MAIN, OPEN, "\u230A", COMMON); // >2,000

defineSymbol('\\rfloor', MAIN, CLOSE, "\u230B", COMMON); // >2,000

defineSymbol('\\lceil', MAIN, OPEN, "\u2308", COMMON); // >2,000

defineSymbol('\\rceil', MAIN, CLOSE, "\u2309", COMMON); // >2,000

defineSymbol('\\vert', MAIN, MATHORD, "\u2223", SUPERCOMMON); // >2,000

defineSymbol('\\mvert', MAIN, REL, "\u2223");
defineSymbol('\\lvert', MAIN, OPEN, "\u2223", 496);
defineSymbol('\\rvert', MAIN, CLOSE, "\u2223", 496);
defineSymbol('\\|', MAIN, MATHORD, "\u2225");
defineSymbol('\\Vert', MAIN, MATHORD, "\u2225", SUPERCOMMON); // >2,000

defineSymbol('\\mVert', MAIN, MATHORD, "\u2225");
defineSymbol('\\lVert', MAIN, OPEN, "\u2225", 287);
defineSymbol('\\rVert', MAIN, CLOSE, "\u2225", CRYPTIC);
defineSymbol('\\lbrack', MAIN, OPEN, '[', 574);
defineSymbol('\\rbrack', MAIN, CLOSE, ']', 213);
defineSymbol('\\{', MAIN, OPEN, '{');
defineSymbol('\\}', MAIN, CLOSE, '}');
defineSymbol('(', MAIN, OPEN, '(');
defineSymbol(')', MAIN, CLOSE, ')');
defineSymbol('[', MAIN, OPEN, '[');
defineSymbol(']', MAIN, CLOSE, ']');
defineSymbol("\\ulcorner", AMS, OPEN, "\u250C", 296);
defineSymbol("\\urcorner", AMS, CLOSE, "\u2510", 310);
defineSymbol('\\llcorner', AMS, OPEN, "\u2514", 137);
defineSymbol('\\lrcorner', AMS, CLOSE, "\u2518", 199); // Large Delimiters

defineSymbol('\\lgroup', MAIN, OPEN, "\u27EE", 24);
defineSymbol('\\rgroup', MAIN, CLOSE, "\u27EF", 24);
defineSymbol('\\lmoustache', MAIN, OPEN, "\u23B0", CRYPTIC);
defineSymbol('\\rmoustache', MAIN, CLOSE, "\u23B1", CRYPTIC);
defineFunction(['\\middle'], '{:delim}', null, function (name, args) {
  return {
    type: 'delim',
    delim: args[0]
  };
});
category = 'Sizing'; // Extra data needed for the delimiter parse function down below

var delimiterSizes = {
  '\\bigl': {
    mclass: 'mopen',
    size: 1
  },
  '\\Bigl': {
    mclass: 'mopen',
    size: 2
  },
  '\\biggl': {
    mclass: 'mopen',
    size: 3
  },
  '\\Biggl': {
    mclass: 'mopen',
    size: 4
  },
  '\\bigr': {
    mclass: 'mclose',
    size: 1
  },
  '\\Bigr': {
    mclass: 'mclose',
    size: 2
  },
  '\\biggr': {
    mclass: 'mclose',
    size: 3
  },
  '\\Biggr': {
    mclass: 'mclose',
    size: 4
  },
  '\\bigm': {
    mclass: 'mrel',
    size: 1
  },
  '\\Bigm': {
    mclass: 'mrel',
    size: 2
  },
  '\\biggm': {
    mclass: 'mrel',
    size: 3
  },
  '\\Biggm': {
    mclass: 'mrel',
    size: 4
  },
  '\\big': {
    mclass: 'mord',
    size: 1
  },
  '\\Big': {
    mclass: 'mord',
    size: 2
  },
  '\\bigg': {
    mclass: 'mord',
    size: 3
  },
  '\\Bigg': {
    mclass: 'mord',
    size: 4
  }
};
defineFunction(['\\bigl', '\\Bigl', '\\biggl', '\\Biggl', '\\bigr', '\\Bigr', '\\biggr', '\\Biggr', '\\bigm', '\\Bigm', '\\biggm', '\\Biggm', '\\big', '\\Big', '\\bigg', '\\Bigg'], '{:delim}', null, function (name, args) {
  return {
    type: 'sizeddelim',
    size: delimiterSizes[name].size,
    cls: delimiterSizes[name].mclass,
    delim: args[0]
  };
}); // Relations

category = 'Relations';
defineSymbol('=', MAIN, REL, '=', SUPERCOMMON);
defineSymbol('\\ne', MAIN, REL, "\u2260", SUPERCOMMON); // >2,000

defineSymbol('\\neq', MAIN, REL, "\u2260", COMMON); // >2,000
// defineSymbol( '\\longequal',  MAIN,  REL, '\uF7D9');   // NOTE: Not TeXematica

defineSymbol('<', MAIN, REL, '<', SUPERCOMMON); // >2,000

defineSymbol('\\lt', MAIN, REL, '<', COMMON); // >2,000

defineSymbol('>', MAIN, REL, '>', SUPERCOMMON); // >2,000

defineSymbol('\\gt', MAIN, REL, '>', COMMON); // >2,000

defineSymbol('\\le', MAIN, REL, "\u2264", COMMON); // >2,000

defineSymbol('\\ge', MAIN, REL, "\u2265", COMMON); // >2,000

defineSymbol('\\leqslant', AMS, REL, "\u2A7D", SUPERCOMMON); // > 2,000

defineSymbol('\\geqslant', AMS, REL, "\u2A7E", SUPERCOMMON); // > 2,000

defineSymbol('\\leq', MAIN, REL, "\u2264", COMMON); // >2,000

defineSymbol('\\geq', MAIN, REL, "\u2265", COMMON); // >2,000

defineSymbol('\\ll', MAIN, REL, "\u226A");
defineSymbol('\\gg', MAIN, REL, "\u226B", COMMON); // >2,000

defineSymbol('\\coloneq', MAIN, REL, "\u2254", 5);
defineSymbol('\\measeq', MAIN, REL, "\u225D"); // MEASSURED BY

defineSymbol('\\eqdef', MAIN, REL, "\u225E");
defineSymbol('\\questeq', MAIN, REL, "\u225F"); // QUESTIONED EQUAL TO

defineSymbol(':', MAIN, REL, ':');
defineSymbol('\\cong', MAIN, REL, "\u2245", COMMON); // >2,000

defineSymbol('\\equiv', MAIN, REL, "\u2261", COMMON); // >2,000

defineSymbol('\\prec', MAIN, REL, "\u227A", COMMON); // >2,000

defineSymbol('\\preceq', MAIN, REL, "\u2AAF", COMMON); // >2,000

defineSymbol('\\succ', MAIN, REL, "\u227B", COMMON); // >2,000

defineSymbol('\\succeq', MAIN, REL, "\u2AB0", 1916);
defineSymbol('\\perp', MAIN, REL, "\u22A5", COMMON); // > 2,000

defineSymbol('\\parallel', MAIN, REL, "\u2225", COMMON); // >2,000

defineSymbol('\\propto', MAIN, REL, "\u221D", COMMON); // > 2,000

defineSymbol('\\Colon', MAIN, REL, "\u2237");
defineSymbol('\\smile', MAIN, REL, "\u2323", COMMON); // > 2,000

defineSymbol('\\frown', MAIN, REL, "\u2322", COMMON); // > 2,000

defineSymbol('\\sim', MAIN, REL, "\u223C", COMMON); // >2,000

defineSymbol('\\gtrsim', AMS, REL, "\u2273", COMMON); // >2,000

defineSymbol('\\approx', MAIN, REL, "\u2248", SUPERCOMMON); // >2,000

defineSymbol('\\approxeq', AMS, REL, "\u224A", 147);
defineSymbol('\\thickapprox', AMS, REL, "\u2248", 377);
defineSymbol('\\lessapprox', AMS, REL, "\u2A85", 146);
defineSymbol('\\gtrapprox', AMS, REL, "\u2A86", 95);
defineSymbol('\\precapprox', AMS, REL, "\u2AB7", 50);
defineSymbol('\\succapprox', AMS, REL, "\u2AB8", CRYPTIC);
defineSymbol('\\thicksim', AMS, REL, "\u223C", 779);
defineSymbol('\\succsim', AMS, REL, "\u227F", 251);
defineSymbol('\\precsim', AMS, REL, "\u227E", 104);
defineSymbol('\\backsim', AMS, REL, "\u223D", 251);
defineSymbol('\\eqsim', AMS, REL, "\u2242", 62);
defineSymbol('\\backsimeq', AMS, REL, "\u22CD", 91);
defineSymbol('\\simeq', MAIN, REL, "\u2243", CRYPTIC);
defineSymbol('\\lesssim', AMS, REL, "\u2272", CRYPTIC);
defineSymbol('\\nleq', AMS, REL, "\u2270", 369);
defineSymbol('\\ngeq', AMS, REL, "\u2271", 164);
defineSymbol('\\smallsmile', AMS, REL, "\u2323", 31);
defineSymbol('\\smallfrown', AMS, REL, "\u2322", 71);
defineSymbol('\\bowtie', MAIN, REL, "\u22C8", 558);
defineSymbol('\\asymp', MAIN, REL, "\u224D", 755);
defineSymbol('\\sqsubseteq', MAIN, REL, "\u2291", 1255);
defineSymbol('\\sqsupseteq', MAIN, REL, "\u2292", 183);
defineSymbol('\\leqq', AMS, REL, "\u2266", 1356);
defineSymbol('\\eqslantless', AMS, REL, "\u2A95", 15);
defineSymbol('\\lll', AMS, REL, "\u22D8", 157);
defineSymbol('\\lessgtr', AMS, REL, "\u2276", 281);
defineSymbol('\\lesseqgtr', AMS, REL, "\u22DA", 134);
defineSymbol('\\lesseqqgtr', AMS, REL, "\u2A8B", CRYPTIC);
defineSymbol('\\risingdotseq', AMS, REL, "\u2253", 8);
defineSymbol('\\fallingdotseq', AMS, REL, "\u2252", 99);
defineSymbol('\\subseteqq', AMS, REL, "\u2AC5", 82);
defineSymbol('\\Subset', AMS, REL, "\u22D0");
defineSymbol('\\sqsubset', AMS, REL, "\u228F", 309);
defineSymbol('\\preccurlyeq', AMS, REL, "\u227C", 549);
defineSymbol('\\curlyeqprec', AMS, REL, "\u22DE", 14);
defineSymbol('\\vDash', AMS, REL, "\u22A8", 646);
defineSymbol('\\Vvdash', AMS, REL, "\u22AA", 20);
defineSymbol('\\bumpeq', AMS, REL, "\u224F", 13);
defineSymbol('\\Bumpeq', AMS, REL, "\u224E", 12);
defineSymbol('\\geqq', AMS, REL, "\u2267", 972);
defineSymbol('\\eqslantgtr', AMS, REL, "\u2A96", 13);
defineSymbol('\\ggg', AMS, REL, "\u22D9", 127);
defineSymbol('\\gtrless', AMS, REL, "\u2277", 417);
defineSymbol('\\gtreqless', AMS, REL, "\u22DB", 190);
defineSymbol('\\gtreqqless', AMS, REL, "\u2A8C", 91);
defineSymbol('\\supseteqq', AMS, REL, "\u2AC6", 6);
defineSymbol('\\Supset', AMS, REL, "\u22D1", 34);
defineSymbol('\\sqsupset', AMS, REL, "\u2290", 71);
defineSymbol('\\succcurlyeq', AMS, REL, "\u227D", 442);
defineSymbol('\\curlyeqsucc', AMS, REL, "\u22DF", 10);
defineSymbol('\\Vdash', AMS, REL, "\u22A9", 276);
defineSymbol('\\shortmid', AMS, REL, "\u2223", 67);
defineSymbol('\\shortparallel', AMS, REL, "\u2225", 17);
defineSymbol('\\between', AMS, REL, "\u226C", 110);
defineSymbol('\\pitchfork', AMS, REL, "\u22D4", 66);
defineSymbol('\\varpropto', AMS, REL, "\u221D", 203);
defineSymbol('\\backepsilon', AMS, REL, "\u220D", 176);
defineSymbol('\\llless', AMS, REL, "\u22D8", CRYPTIC);
defineSymbol('\\gggtr', AMS, REL, "\u22D9", CRYPTIC);
defineSymbol('\\lhd', AMS, BIN, "\u22B2", 447);
defineSymbol('\\rhd', AMS, BIN, "\u22B3", 338);
defineSymbol('\\Join', MAIN, REL, "\u22C8", 35);
defineSymbol('\\doteq', MAIN, REL, "\u2250", 1450);
defineSymbol('\\doteqdot', AMS, REL, "\u2251", 60);
defineSymbol('\\Doteq', AMS, REL, "\u2251", CRYPTIC);
defineSymbol('\\eqcirc', AMS, REL, "\u2256", 6);
defineSymbol('\\circeq', AMS, REL, "\u2257", 31);
defineSymbol('\\lessdot', AMS, BIN, "\u22D6", 88);
defineSymbol('\\gtrdot', AMS, BIN, "\u22D7", 45); // In TeX, '~' is a spacing command (non-breaking space).
// However, '~' is used as an ASCII Math shortctut character, so define a \\~
// command which maps to the '~' character

defineSymbol('\\~', MAIN, REL, '~');
category = 'Logic';
defineSymbol('\\leftrightarrow', MAIN, REL, "\u2194", SUPERCOMMON); // >2,000

defineSymbol('\\Leftrightarrow', MAIN, REL, "\u21D4", SUPERCOMMON); // >2,000
// defineSymbol( '\\iff',  MAIN,  REL, '\\;\u27fa\\;', SUPERCOMMON);        // >2,000 Note: additional spaces around the arrows

defineSymbol('\\to', MAIN, REL, "\u2192", SUPERCOMMON); // >2,000

defineSymbol('\\models', MAIN, REL, "\u22A8", COMMON); // >2,000

defineSymbol('\\vdash', MAIN, REL, "\u22A2", COMMON); // >2,000

defineSymbol('\\therefore', AMS, REL, "\u2234", 1129);
defineSymbol('\\because', AMS, REL, "\u2235", 388);
defineSymbol('\\implies', MAIN, REL, "\u27F9", 1858);
defineSymbol('\\gets', MAIN, REL, "\u2190", 150);
defineSymbol('\\dashv', MAIN, REL, "\u22A3", 299);
defineSymbol('\\impliedby', MAIN, REL, "\u27F8", CRYPTIC);
defineSymbol('\\biconditional', MAIN, REL, "\u27F7", CRYPTIC);
defineSymbol('\\roundimplies', MAIN, REL, "\u2970", CRYPTIC); // AMS Binary Operators

category = 'Operators';
defineSymbol('+', MAIN, BIN, '+', SUPERCOMMON); // > 2,000

defineSymbol('-', MAIN, BIN, "\u2212", SUPERCOMMON); // > 2,000

defineSymbol("\u2212", MAIN, BIN, "\u2212", SUPERCOMMON); // > 2,000

defineSymbol('\\pm', MAIN, BIN, "\xB1", COMMON); // > 2,000

defineSymbol('\\mp', MAIN, BIN, "\u2213", COMMON); // > 2,000

defineSymbol('*', MAIN, BIN, "\u2217", COMMON); // > 2,000

defineSymbol('\\times', MAIN, BIN, "\xD7", COMMON); // > 2,000

defineSymbol('\\div', MAIN, BIN, "\xF7", COMMON); // > 2,000

defineSymbol('\\surd', MAIN, MATHORD, "\u221A", COMMON); // > 2,000

defineSymbol('\\divides', MAIN, BIN, "\u2223", CRYPTIC); // From MnSymbol package

defineSymbol('\\ltimes', AMS, BIN, "\u22C9", 576);
defineSymbol('\\rtimes', AMS, BIN, "\u22CA", 946);
defineSymbol('\\leftthreetimes', AMS, BIN, "\u22CB", 34);
defineSymbol('\\rightthreetimes', AMS, BIN, "\u22CC", 14);
defineSymbol('\\intercal', AMS, BIN, "\u22BA", 478);
defineSymbol('\\dotplus', AMS, BIN, "\u2214", 81);
defineSymbol('\\centerdot', AMS, BIN, "\u22C5", 271);
defineSymbol('\\doublebarwedge', AMS, BIN, "\u2A5E", 5);
defineSymbol('\\divideontimes', AMS, BIN, "\u22C7", 51);
defineSymbol('\\cdot', MAIN, BIN, "\u22C5", CRYPTIC);
category = 'Others';
defineSymbol('\\infty', MAIN, MATHORD, "\u221E", SUPERCOMMON); // >2,000

defineSymbol('\\prime', MAIN, ORD, "\u2032", SUPERCOMMON); // >2,000

defineSymbol('\\doubleprime', MAIN, MATHORD, "\u2033"); // NOTE: Not in TeX, but Mathematica

defineSymbol('\\angle', MAIN, MATHORD, "\u2220", COMMON); // >2,000

defineSymbol('`', MAIN, MATHORD, "\u2018");
defineSymbol('\\$', MAIN, MATHORD, '$');
defineSymbol('\\%', MAIN, MATHORD, '%');
defineSymbol('\\_', MAIN, MATHORD, '_');
category = 'Greek'; // Note: In TeX, greek symbols are only available in Math mode

defineSymbol('\\alpha', MAIN, ORD, "\u03B1", COMMON); // >2,000

defineSymbol('\\beta', MAIN, ORD, "\u03B2", COMMON); // >2,000

defineSymbol('\\gamma', MAIN, ORD, "\u03B3", COMMON); // >2,000

defineSymbol('\\delta', MAIN, ORD, "\u03B4", COMMON); // >2,000

defineSymbol('\\epsilon', MAIN, ORD, "\u03F5", COMMON); // >2,000

defineSymbol('\\varepsilon', MAIN, ORD, "\u03B5");
defineSymbol('\\zeta', MAIN, ORD, "\u03B6", COMMON); // >2,000

defineSymbol('\\eta', MAIN, ORD, "\u03B7", COMMON); // >2,000

defineSymbol('\\theta', MAIN, ORD, "\u03B8", COMMON); // >2,000

defineSymbol('\\vartheta', MAIN, ORD, "\u03D1", COMMON); // >2,000

defineSymbol('\\iota', MAIN, ORD, "\u03B9", COMMON); // >2,000

defineSymbol('\\kappa', MAIN, ORD, "\u03BA", COMMON); // >2,000

defineSymbol('\\varkappa', AMS, ORD, "\u03F0", COMMON); // >2,000

defineSymbol('\\lambda', MAIN, ORD, "\u03BB", COMMON); // >2,000

defineSymbol('\\mu', MAIN, ORD, "\u03BC", COMMON); // >2,000

defineSymbol('\\nu', MAIN, ORD, "\u03BD", COMMON); // >2,000

defineSymbol('\\xi', MAIN, ORD, "\u03BE", COMMON); // >2,000

defineSymbol('\\omicron', MAIN, ORD, 'o');
defineSymbol('\\pi', MAIN, ORD, "\u03C0", COMMON); // >2,000

defineSymbol('\\varpi', MAIN, ORD, "\u03D6", COMMON); // >2,000

defineSymbol('\\rho', MAIN, ORD, "\u03C1", COMMON); // >2,000

defineSymbol('\\varrho', MAIN, ORD, "\u03F1", COMMON); // >2,000

defineSymbol('\\sigma', MAIN, ORD, "\u03C3", COMMON); // >2,000

defineSymbol('\\varsigma', MAIN, ORD, "\u03C2", COMMON); // >2,000

defineSymbol('\\tau', MAIN, ORD, "\u03C4", COMMON); // >2,000

defineSymbol('\\phi', MAIN, ORD, "\u03D5", COMMON); // >2,000

defineSymbol('\\varphi', MAIN, ORD, "\u03C6", COMMON); // >2,000

defineSymbol("\\upsilon", MAIN, ORD, "\u03C5", COMMON); // >2,000

defineSymbol('\\chi', MAIN, ORD, "\u03C7", COMMON); // >2,000

defineSymbol('\\psi', MAIN, ORD, "\u03C8", COMMON); // >2,000

defineSymbol('\\omega', MAIN, ORD, "\u03C9", COMMON); // >2,000

defineSymbol('\\Gamma', MAIN, ORD, "\u0393", COMMON); // >2,000

defineSymbol('\\Delta', MAIN, ORD, "\u0394", COMMON); // >2,000

defineSymbol('\\Theta', MAIN, ORD, "\u0398", COMMON); // >2,000

defineSymbol('\\Lambda', MAIN, ORD, "\u039B", COMMON); // >2,000

defineSymbol('\\Xi', MAIN, ORD, "\u039E", COMMON); // >2,000

defineSymbol('\\Pi', MAIN, ORD, "\u03A0", COMMON); // >2,000

defineSymbol('\\Sigma', MAIN, ORD, "\u03A3", COMMON); // >2,000

defineSymbol("\\Upsilon", MAIN, ORD, "\u03A5", COMMON); // >2,000

defineSymbol('\\Phi', MAIN, ORD, "\u03A6", COMMON); // >2,000

defineSymbol('\\Psi', MAIN, ORD, "\u03A8", COMMON); // >2,000

defineSymbol('\\Omega', MAIN, ORD, "\u03A9", COMMON); // >2,000
// AMS Greek

defineSymbol('\\digamma', AMS, ORD, "\u03DD", 248);
category = 'Others';
defineSymbol('\\emptyset', MAIN, MATHORD, "\u2205", SUPERCOMMON); // >2,000

defineSymbol('\\varnothing', AMS, MATHORD, "\u2205", SUPERCOMMON); // >2,000

category = 'Set Operators';
defineSymbol('\\cap', MAIN, BIN, "\u2229", SUPERCOMMON);
defineSymbol('\\cup', MAIN, BIN, "\u222A", SUPERCOMMON);
defineSymbol('\\setminus', MAIN, BIN, "\u2216", COMMON); // >2,000

defineSymbol('\\smallsetminus', AMS, BIN, "\u2216", 254);
defineSymbol('\\complement', AMS, MATHORD, "\u2201", 200);
category = 'Set Relations';
defineSymbol('\\in', MAIN, REL, "\u2208", SUPERCOMMON); // >2,000

defineSymbol('\\notin', MAIN, REL, "\u2209", SUPERCOMMON); // >2,000

defineSymbol('\\not', MAIN, REL, "\u0338", COMMON);
defineSymbol('\\ni', MAIN, REL, "\u220B", COMMON); // >2,000

defineSymbol('\\owns', MAIN, REL, "\u220B", 18);
defineSymbol('\\subset', MAIN, REL, "\u2282", SUPERCOMMON); // >2,000

defineSymbol('\\supset', MAIN, REL, "\u2283", SUPERCOMMON); // >2,000

defineSymbol('\\subseteq', MAIN, REL, "\u2286", SUPERCOMMON); // >2,000

defineSymbol('\\supseteq', MAIN, REL, "\u2287", SUPERCOMMON); // >2,000

defineSymbol('\\subsetneq', AMS, REL, "\u228A", 1945);
defineSymbol('\\varsubsetneq', AMS, REL, "\uE01A", 198);
defineSymbol('\\subsetneqq', AMS, REL, "\u2ACB", 314);
defineSymbol('\\varsubsetneqq', AMS, REL, "\uE017", 55);
defineSymbol('\\nsubset', AMS, REL, "\u2284", CRYPTIC); // NOTE: Not TeX?

defineSymbol('\\nsupset', AMS, REL, "\u2285", CRYPTIC); // NOTE: Not TeX?

defineSymbol('\\nsubseteq', AMS, REL, "\u2288", 950);
defineSymbol('\\nsupseteq', AMS, REL, "\u2289", 49);
category = 'Spacing'; // See http://tex.stackexchange.com/questions/41476/lengths-and-when-to-use-them

defineSymbol('\\ ', MAIN, SPACING, "\xA0");
defineSymbol('~', MAIN, SPACING, "\xA0");
defineSymbol('\\space', MAIN, SPACING, "\xA0");
defineSymbol('\\!', MAIN, SPACING, null);
defineSymbol('\\,', MAIN, SPACING, null);
defineSymbol('\\:', MAIN, SPACING, null);
defineSymbol('\\;', MAIN, SPACING, null);
defineSymbol('\\enskip', MAIN, SPACING, null); // \enspace is a TeX command (not LaTeX) equivalent to a \skip

defineSymbol('\\enspace', MAIN, SPACING, null, 672);
defineSymbol('\\quad', MAIN, SPACING, null, COMMON); // >2,000

defineSymbol('\\qquad', MAIN, SPACING, null, COMMON); // >2,000

defineFunction(['\\hspace', '\\hspace*' // \hspace* inserts a non-breakable space, but since we don't line break...
// it's the same as \hspace.
], '{width:skip}', {
  allowedInText: true
}, function (_name, args) {
  return {
    type: 'spacing',
    width: args[0] || 0
  };
});
/**
 * If possible, i.e. if they are all simple atoms, return a string made up of
 * their body
 * @param {object[]} atoms
 */

function getSimpleString(atoms) {
  var result = '';
  var success = true;
  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = atoms[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var atom = _step7.value;

      if (typeof atom.body === 'string') {
        result += atom.body;
      } else {
        success = false;
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

  return success ? result : '';
}

defineFunction(['\\mathop', '\\mathbin', '\\mathrel', '\\mathopen', '\\mathclose', '\\mathpunct', '\\mathord', '\\mathinner'], '{:auto}', null, function (name, args) {
  var result = {
    type: {
      '\\mathop': 'mop',
      '\\mathbin': 'mbin',
      '\\mathrel': 'mrel',
      '\\mathopen': 'mopen',
      '\\mathclose': 'mclose',
      '\\mathpunct': 'mpunct',
      '\\mathord': 'mord',
      '\\mathinner': 'minner'
    }[name],
    body: getSimpleString(args[0]) || args[0],
    captureSelection: true,
    // Do not let children be selected
    baseFontFamily: name === '\\mathop' ? 'math' : ''
  };

  if (name === '\\mathop') {
    result.limits = 'nolimits';
    result.isFunction = true;
  }

  return result;
});
defineFunction(['\\operatorname', '\\operatorname*'], '{operator:string}', null, function (name, args) {
  var result = {
    type: 'mop',
    skipBoundary: true,
    body: args[0],
    isFunction: true,
    baseFontFamily: 'cmr'
  };

  if (name === '\\operatorname') {
    result.limits = 'nolimits';
  } else if (name === '\\operatorname*') {
    result.limits = 'limits';
  }

  return result;
}); // Punctuation

category = 'Punctuation';
defineSymbol('\\colon', MAIN, PUNCT, ':', COMMON); // >2,000

defineSymbol('\\cdotp', MAIN, PUNCT, "\u22C5", COMMON); // >2,000

defineSymbol('\\ldots', MAIN, INNER, "\u2026", COMMON); // >2,000

defineSymbol('\\cdots', MAIN, INNER, "\u22EF", COMMON); // >2,000

defineSymbol('\\ddots', MAIN, INNER, "\u22F1", COMMON); // >2,000

defineSymbol('\\mathellipsis', MAIN, INNER, "\u2026", 91);
defineSymbol('\\vdots', MAIN, MATHORD, "\u22EE", COMMON); // >2,000

defineSymbol('\\ldotp', MAIN, PUNCT, ".", 18);
defineSymbol(',', MAIN, PUNCT, ',');
defineSymbol(';', MAIN, PUNCT, ';');
category = 'Logical Operators';
defineSymbol('\\wedge', MAIN, BIN, "\u2227", SUPERCOMMON); // >2,000

defineSymbol('\\vee', MAIN, BIN, "\u2228", SUPERCOMMON); // >2,000

defineSymbol('\\lnot', MAIN, MATHORD, "\xAC", COMMON); // >2,000

defineSymbol('\\neg', MAIN, MATHORD, "\xAC", SUPERCOMMON); // >2,000

defineSymbol('\\land', MAIN, BIN, "\u2227", 659);
defineSymbol('\\lor', MAIN, BIN, "\u2228", 364);
defineSymbol('\\barwedge', AMS, BIN, "\u22BC", 21);
defineSymbol('\\veebar', AMS, BIN, "\u22BB", 43);
defineSymbol('\\nor', AMS, BIN, "\u22BB", 7); // NOTE: Not TeXematica

defineSymbol('\\curlywedge', AMS, BIN, "\u22CF", 58);
defineSymbol('\\curlyvee', AMS, BIN, "\u22CE", 57);
category = 'Boxes';
defineSymbol('\\square', AMS, MATHORD, "\u25A1", COMMON); // >2,000

defineSymbol('\\Box', AMS, MATHORD, "\u25A1", COMMON); // >2,000

defineSymbol('\\blacksquare', AMS, MATHORD, "\u25A0", 1679);
defineSymbol('\\boxminus', AMS, BIN, "\u229F", 79);
defineSymbol('\\boxplus', AMS, BIN, "\u229E", 276);
defineSymbol('\\boxtimes', AMS, BIN, "\u22A0", 457);
defineSymbol('\\boxdot', AMS, BIN, "\u22A1", 120);
category = 'Circles';
defineSymbol('\\circ', MAIN, BIN, "\u2218", SUPERCOMMON); // >2,000

defineSymbol('\\bigcirc', MAIN, BIN, "\u25EF", 903);
defineSymbol('\\bullet', MAIN, BIN, "\u2219", COMMON); // >2,000

defineSymbol('\\circleddash', AMS, BIN, "\u229D", COMMON); // >2,000

defineSymbol('\\circledast', AMS, BIN, "\u229B", 339);
defineSymbol('\\oplus', MAIN, BIN, "\u2295", COMMON); // >2,000

defineSymbol('\\ominus', MAIN, BIN, "\u2296", 1568);
defineSymbol('\\otimes', MAIN, BIN, "\u2297", COMMON); // >2,000

defineSymbol('\\odot', MAIN, BIN, "\u2299", COMMON); // >2,000

defineSymbol('\\circledcirc', AMS, BIN, "\u229A", 93);
defineSymbol('\\oslash', MAIN, BIN, "\u2298", 497);
defineSymbol('\\circledS', AMS, MATHORD, "\u24C8", 31);
defineSymbol('\\circledR', AMS, MATHORD, "\xAE", 1329);
category = 'Triangles';
defineSymbol('\\triangle', MAIN, MATHORD, "\u25B3", COMMON); // > 2,000

defineSymbol('\\triangleq', AMS, REL, "\u225C", COMMON); // >2,000

defineSymbol('\\bigtriangleup', MAIN, BIN, "\u25B3", 1773);
defineSymbol('\\vartriangle', AMS, REL, "\u25B3", 762);
defineSymbol('\\triangledown', AMS, MATHORD, "\u25BD", 520);
defineSymbol('\\bigtriangledown', MAIN, BIN, "\u25BD", 661);
defineSymbol('\\triangleleft', MAIN, BIN, "\u25C3", 534);
defineSymbol('\\vartriangleleft', AMS, REL, "\u22B2", 281);
defineSymbol('\\trianglelefteq', AMS, REL, "\u22B4", 176);
defineSymbol('\\ntriangleleft', AMS, REL, "\u22EA", 13);
defineSymbol('\\ntrianglelefteq', AMS, REL, "\u22EC", 22);
defineSymbol('\\triangleright', MAIN, BIN, "\u25B9", 516);
defineSymbol('\\vartriangleright', AMS, REL, "\u22B3", 209);
defineSymbol('\\trianglerighteq', AMS, REL, "\u22B5", 45);
defineSymbol('\\ntriangleright', AMS, REL, "\u22EB", 15);
defineSymbol('\\ntrianglerighteq', AMS, REL, "\u22ED", 6);
defineSymbol('\\blacktriangle', AMS, MATHORD, "\u25B2", 360);
defineSymbol('\\blacktriangledown', AMS, MATHORD, "\u25BC", 159);
defineSymbol('\\blacktriangleleft', AMS, REL, "\u25C0", 101);
defineSymbol('\\blacktriangleright', AMS, REL, "\u25B6", 271);
category = 'Others';
defineSymbol('\\/', MAIN, ORD, '/');
defineSymbol('|', MAIN, 'textord', "\u2223");
category = 'Big Operators';
defineSymbol('\\sqcup', MAIN, BIN, "\u2294", 1717); // 63

defineSymbol('\\sqcap', MAIN, BIN, "\u2293", 735); // 38

defineSymbol("\\uplus", MAIN, BIN, "\u228E", 597);
defineSymbol('\\wr', MAIN, BIN, "\u2240", 286);
defineSymbol('\\Cap', AMS, BIN, "\u22D2", 2);
defineSymbol('\\Cup', AMS, BIN, "\u22D3", 2);
defineSymbol('\\doublecap', AMS, BIN, "\u22D2", 1);
defineSymbol('\\doublecup', AMS, BIN, "\u22D3", 1);
defineSymbol('\\amalg', MAIN, BIN, "\u2A3F", CRYPTIC);
defineSymbol('\\And', MAIN, BIN, "&");
category = 'Accents'; // defineSymbol( '\\bar',  MAIN,  ACCENT, '\u00af', COMMON);    // >2,000
// defineSymbol( '\\vec',  MAIN,  ACCENT, '\u20d7');
// defineSymbol( '\\hat',  MAIN,  ACCENT, '\u005e');
// defineSymbol( '\\dot',  MAIN,  ACCENT, '\u02d9');
// defineSymbol( '\\ddot',  MAIN,  ACCENT, '\u00a8', COMMON);    // >2,000
// defineSymbol( '\\acute',  MAIN,  ACCENT, '\u00b4', COMMON);    // >2,000
// defineSymbol( '\\tilde',  MAIN,  ACCENT, '\u007e', COMMON);    // >2,000
// defineSymbol( '\\check',  MAIN,  ACCENT, '\u02c7', COMMON);    // >2,000
// defineSymbol( '\\breve',  MAIN,  ACCENT, '\u02d8', 1548);
// defineSymbol( '\\grave',  MAIN,  ACCENT, '\u0060', 735);

defineFunction(['\\acute', '\\grave', '\\dot', '\\ddot', '\\mathring', '\\tilde', '\\bar', '\\breve', '\\check', '\\hat', '\\vec'], '{body:auto}', null, function (name, args) {
  return {
    type: 'accent',
    accent: {
      '\\acute': "\u02CA",
      '\\grave': "\u02CB",
      '\\dot': "\u02D9",
      '\\ddot': "\xA8",
      '\\mathring': "\u02DA",
      '\\tilde': "~",
      '\\bar': "\u02C9",
      '\\breve': "\u02D8",
      '\\check': "\u02C7",
      '\\hat': "^",
      '\\vec': "\u20D7"
    }[name],
    limits: 'accent',
    // This will suppress the regular
    // supsub attachment and will delegate
    // it to the decomposeAccent
    // (any non-null value would do)
    skipBoundary: true,
    body: args[0]
  };
});
frequency(COMMON, '\\bar', '\\ddot', '\\acute', '\\tilde', '\\check');
frequency(1548, '\\breve');
frequency(735, '\\grave');
frequency(SUPERCOMMON, '\\vec'); // note('\\( \\bar{x}\\): Average of the values \\( (x_1,\\ldots ,x_n) \\)');

category = 'Letters and Letter Like Forms';
defineSymbol('\\imath', MAIN, MATHORD, "\u0131");
defineSymbol('\\jmath', MAIN, MATHORD, "\u0237");
category = 'Others';
defineSymbol('\\degree', MAIN, MATHORD, "\xB0", 46);
category = 'Others';
defineSymbol("'", MAIN, MATHORD, "\u2032"); // Prime

defineSymbol('"', MAIN, MATHORD, "\u201D"); // Double Prime
// defineSymbol( "\'',  MAIN,  MATHORD, '\u2033');       // Double Prime
// From plain.tex

category = 'Others';
defineFunction('\\^', '{:string}', {
  allowedInText: true
}, function (name, args) {
  return {
    type: 'mord',
    limits: 'nolimits',
    symbol: true,
    isFunction: false,
    body: args[0] ? {
      'a': 'â',
      'e': 'ê',
      'i': 'î',
      'o': 'ô',
      'u': 'û',
      'A': 'Â',
      'E': 'Ê',
      'I': 'Î',
      'O': 'Ô',
      'U': 'Û'
    }[args[0]] || '^' : '^',
    baseFontFamily: 'cmr'
  };
});
defineFunction("\\`", '{:string}', {
  allowedInText: true
}, function (name, args) {
  return {
    type: 'mord',
    limits: 'nolimits',
    symbol: true,
    isFunction: false,
    body: args[0] ? {
      'a': 'à',
      'e': 'è',
      'i': 'ì',
      'o': 'ò',
      'u': 'ù',
      'A': 'À',
      'E': 'È',
      'I': 'Ì',
      'O': 'Ò',
      'U': 'Ù'
    }[args[0]] || '`' : '`',
    baseFontFamily: 'cmr'
  };
});
defineFunction("\\'", '{:string}', {
  allowedInText: true
}, function (name, args) {
  return {
    type: 'mord',
    limits: 'nolimits',
    symbol: true,
    isFunction: false,
    body: args[0] ? {
      'a': 'á',
      'e': 'é',
      'i': 'í',
      'o': 'ó',
      'u': 'ú',
      'A': 'Á',
      'E': 'É',
      'I': 'Í',
      'O': 'Ó',
      'U': 'Ú'
    }[args[0]] || "^" : "^",
    baseFontFamily: 'cmr'
  };
});
defineFunction('\\~', '{:string}', {
  allowedInText: true
}, function (name, args) {
  return {
    type: 'mord',
    limits: 'nolimits',
    symbol: true,
    isFunction: false,
    body: args[0] ? {
      'n': 'ñ',
      'N': 'Ñ',
      'a': 'ã',
      'o': 'õ',
      'A': 'Ã',
      'O': 'Õ'
    }[args[0]] || "\xB4" : "\xB4",
    baseFontFamily: 'cmr'
  };
});
defineFunction('\\c', '{:string}', {
  allowedInText: true
}, function (name, args) {
  return {
    type: 'mord',
    limits: 'nolimits',
    symbol: true,
    isFunction: false,
    body: args[0] ? {
      'c': 'ç',
      'C': 'Ç'
    }[args[0]] || '' : '',
    baseFontFamily: 'cmr'
  };
}); // Body-text symbols
// See http://ctan.mirrors.hoobly.com/info/symbols/comprehensive/symbols-a4.pdf, p14

var TEXT_SYMBOLS = {
  '\\#': "#",
  '\\&': "&",
  '\\$': '$',
  '\\%': '%',
  '\\_': '_',
  '\\euro': "\u20AC",
  '\\maltese': "\u2720",
  '\\{': '{',
  '\\}': '}',
  '\\nobreakspace': "\xA0",
  '\\ldots': "\u2026",
  '\\textellipsis': "\u2026",
  '\\backslash': '\\',
  '`': "\u2018",
  '\'': "\u2019",
  '``': "\u201C",
  '\'\'': "\u201D",
  '\\degree': "\xB0",
  '\\textasciicircum': '^',
  '\\textasciitilde': '~',
  '\\textasteriskcentered': '*',
  '\\textbackslash': '\\',
  '\\textbraceleft': '{',
  '\\textbraceright': '}',
  '\\textbullet': '•',
  '\\textdollar': '$',
  '\\textsterling': '£',
  '–': "\u2013",
  // EN DASH
  '—': "\u2014",
  // EM DASH
  '‘': "\u2018",
  // LEFT SINGLE QUOTATION MARK
  '’': "\u2019",
  // RIGHT SINGLE QUOTATION MARK
  '“': "\u201C",
  // LEFT DOUBLE QUOTATION MARK
  '”': "\u201D",
  // RIGHT DOUBLE QUOTATION MARK
  '"': "\u201D",
  // DOUBLE PRIME
  '\\ss': "\xDF",
  // LATIN SMALL LETTER SHARP S
  '\\ae': "\xE6",
  // LATIN SMALL LETTER AE
  '\\oe': "\u0153",
  // LATIN SMALL LIGATURE OE
  '\\AE': "\xC6",
  // LATIN CAPITAL LETTER AE
  '\\OE': "\u0152",
  // LATIN CAPITAL LIGATURE OE
  '\\O': "\xD8",
  // LATIN CAPITAL LETTER O WITH STROKE
  '\\i': "\u0131",
  // LATIN SMALL LETTER DOTLESS I
  '\\j': "\u0237",
  // LATIN SMALL LETTER DOTLESS J
  '\\aa': "\xE5",
  // LATIN SMALL LETTER A WITH RING ABOVE
  '\\AA': "\xC5" // LATIN CAPITAL LETTER A WITH RING ABOVE

};
var COMMAND_MODE_CHARACTERS = /[a-zA-Z0-9!@*()-=+{}[\]\\';:?/.,~<>`|'$%#&^_" ]/; // Word boundaries for Cyrillic, Polish, French, German, Italian
// and Spanish. We use \p{L} (Unicode property escapes: "Letter")
// but Firefox doesn't support it
// (https://bugzilla.mozilla.org/show_bug.cgi?id=1361876). Booo...
// See also https://stackoverflow.com/questions/26133593/using-regex-to-match-international-unicode-alphanumeric-characters-in-javascript
// Edit : https://github.com/arnog/mathlive/issues/195#issuecomment-493741744

var LETTER = // typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent) ?
/[a-zA-ZаАбБвВгГдДеЕёЁжЖзЗиИйЙкКлЛмМнНоОпПрРсСтТуУфФхХцЦчЧшШщЩъЪыЫьЬэЭюЮяĄąĆćĘęŁłŃńÓóŚśŹźŻżàâäôéèëêïîçùûüÿæœÀÂÄÔÉÈËÊÏÎŸÇÙÛÜÆŒäöüßÄÖÜẞàèéìíîòóùúÀÈÉÌÍÎÒÓÙÚáéíñóúüÁÉÍÑÓÚÜ]/; // :
//    new RegExp("\\p{Letter}", 'u');

var LETTER_AND_DIGITS = // typeof navigator !== 'undefined'  && /firefox/i.test(navigator.userAgent) ?
/[0-9a-zA-ZаАбБвВгГдДеЕёЁжЖзЗиИйЙкКлЛмМнНоОпПрРсСтТуУфФхХцЦчЧшШщЩъЪыЫьЬэЭюЮяĄąĆćĘęŁłŃńÓóŚśŹźŻżàâäôéèëêïîçùûüÿæœÀÂÄÔÉÈËÊÏÎŸÇÙÛÜÆŒäöüßÄÖÜẞàèéìíîòóùúÀÈÉÌÍÎÒÓÙÚáéíñóúüÁÉÍÑÓÚÜ]/; // :
//   new RegExp("[0-9\\p{Letter}]", 'u');

var _default = {
  matchCodepoint: matchCodepoint,
  commandAllowed: commandAllowed,
  unicodeToMathVariant: unicodeToMathVariant,
  mathVariantToUnicode: mathVariantToUnicode,
  unicodeStringToLatex: unicodeStringToLatex,
  getInfo: getInfo,
  getValue: getValue,
  getEnvironmentInfo: getEnvironmentInfo,
  suggest: suggest,
  FREQUENCY_VALUE: FREQUENCY_VALUE,
  TEXT_SYMBOLS: TEXT_SYMBOLS,
  MATH_SYMBOLS: MATH_SYMBOLS,
  ENVIRONMENTS: ENVIRONMENTS,
  RIGHT_DELIM: RIGHT_DELIM,
  FUNCTIONS: FUNCTIONS,
  MACROS: MACROS,
  COMMAND_MODE_CHARACTERS: COMMAND_MODE_CHARACTERS,
  LETTER: LETTER,
  LETTER_AND_DIGITS: LETTER_AND_DIGITS // TODO
  // Some missing greek letters, but see https://reference.wolfram.com/language/tutorial/LettersAndLetterLikeForms.html
  // koppa, stigma, Sampi
  // See https://tex.stackexchange.com/questions/231878/accessing-archaic-greek-koppa-in-the-birkmult-document-class
  // Capital Alpha, etc...
  // Colon (ratio) (2236)
  // Function names can have '*' in them
  // Review:
  // https://en.wikipedia.org/wiki/Help:Displaying_a_formula
  // https://reference.wolfram.com/language/tutorial/LettersAndLetterLikeForms.html
  // ftp://ftp.dante.de/tex-archive/info/symbols/comprehensive/symbols-a4.pdf
  // Media Wiki Reference
  // https://en.wikipedia.org/wiki/Help:Displaying_a_formula
  // MathJax Reference
  // http://docs.mathjax.org/en/latest/tex.html#supported-latex-commands
  // http://www.onemathematicalcat.org/MathJaxDocumentation/TeXSyntax.htm
  // LaTeX Reference
  // http://ctan.sharelatex.com/tex-archive/info/latex2e-help-texinfo/latex2e.html
  // iBooks Author/Pages
  // https://support.apple.com/en-au/HT202501
  // Mathematica Reference
  // https://reference.wolfram.com/language/tutorial/NamesOfSymbolsAndMathematicalObjects.html
  // https://reference.wolfram.com/language/guide/MathematicalTypesetting.html

  /*
      * @todo \sb (equivalent to _) $\mathfrak{sl}\sb 2$ frequency 184
      * @todo \sp (equivalent to ^) $\mathfrak{sl}\sp 2$ frequency 274
      * \intertext    frequency 0
  
  
      See http://mirrors.ibiblio.org/CTAN/macros/latex/contrib/mathtools/mathtools.pdf
  
  */

};
exports.default = _default;