"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mathAtom = _interopRequireDefault(require("../core/mathAtom.js"));

var _editorPopover = _interopRequireDefault(require("../editor/editor-popover.js"));

require("../core/definitions.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Markup
// Two common flavor of markups: SSML and 'mac'. The latter is only available
// when using the native TTS synthesizer on Mac OS.
// Use SSML in the production rules below. The markup will either be striped
// off or replaced with the 'mac' markup as necessary.
//
// SSML                                             Mac
// ----                                             ----
// <emphasis>WORD</emphasis>                        [[emph +]]WORD
// <break time="150ms"/>                            [[slc 150]]
// <say-as interpret-as="character">A</say-as>      [[char LTRL] A [[char NORM]]
// https://developer.apple.com/library/content/documentation/UserExperience/Conceptual/SpeechSynthesisProgrammingGuide/FineTuning/FineTuning.html#//apple_ref/doc/uid/TP40004365-CH5-SW3
// https://pdfs.semanticscholar.org/8887/25b82b8dbb45dd4dd69b36a65f092864adb0.pdf
// "<audio src='non_existing_file.au'>File could not be played.</audio>"
// "I am now <prosody rate='+0.06'>speaking 6% faster.</prosody>"
var PRONUNCIATION = {
  '\\alpha': 'alpha ',
  '\\mu': 'mew ',
  '\\sigma': 'sigma ',
  '\\pi': 'pie ',
  '\\imaginaryI': 'eye ',
  '\\sum': 'Summation ',
  '\\prod': 'Product ',
  '+': 'plus ',
  '-': 'minus ',
  ';': '<break time="150ms"/> semi-colon <break time="150ms"/>',
  ',': '<break time="150ms"/> comma  <break time="150ms"/>',
  '|': '<break time="150ms"/>Vertical bar<break time="150ms"/>',
  '(': '<break time="150ms"/>Open paren. <break time="150ms"/>',
  ')': '<break time="150ms"/> Close paren. <break time="150ms"/>',
  '=': 'equals ',
  '<': 'is less than ',
  '\\lt': 'is less than ',
  '<=': 'is less than or equal to ',
  '\\le': 'is less than or equal to ',
  '\\gt': 'is greater than ',
  '>': 'is greater than ',
  '\\ge': 'is greater than or equal to ',
  '\\geq': 'is greater than or equal to ',
  '\\leq': 'is less than or equal to ',
  '!': 'factorial ',
  '\\sin': 'sine ',
  '\\cos': 'cosine ',
  "\u200B": '',
  "\u2212": 'minus ',
  ':': '<break time="150ms"/> such that <break time="200ms"/> ',
  '\\colon': '<break time="150ms"/> such that <break time="200ms"/> ',
  '\\hbar': 'etch bar ',
  '\\iff': '<break time="200ms"/>if, and only if, <break time="200ms"/>',
  '\\Longleftrightarrow': '<break time="200ms"/>if, and only if, <break time="200ms"/>',
  '\\land': 'and ',
  '\\lor': 'or ',
  '\\neg': 'not ',
  '\\div': 'divided by ',
  '\\forall': 'for all ',
  '\\exists': 'there exists ',
  '\\nexists': 'there does not exists ',
  '\\in': 'element of ',
  '\\N': 'the set <break time="150ms"/><say-as interpret-as="character">n</say-as>',
  '\\C': 'the set <break time="150ms"/><say-as interpret-as="character">c</say-as>',
  '\\Z': 'the set <break time="150ms"/><say-as interpret-as="character">z</say-as>',
  '\\Q': 'the set <break time="150ms"/><say-as interpret-as="character">q</say-as>',
  '\\infty': 'infinity ',
  '\\nabla': 'nabla ',
  '\\partial': 'partial derivative of ',
  '\\cdots': 'dot dot dot ',
  '\\Rightarrow': 'implies ',
  '\\lbrace': '<break time="150ms"/>open brace<break time="150ms"/>',
  '\\{': '<break time="150ms"/>open brace<break time="150ms"/>',
  '\\rbrace': '<break time="150ms"/>close brace<break time="150ms"/>',
  '\\}': '<break time="150ms"/>close brace<break time="150ms"/>',
  '\\langle': '<break time="150ms"/>left angle bracket<break time="150ms"/>',
  '\\rangle': '<break time="150ms"/>right angle bracket<break time="150ms"/>',
  '\\lfloor': '<break time="150ms"/>open floor<break time="150ms"/>',
  '\\rfloor': '<break time="150ms"/>close floor<break time="150ms"/>',
  '\\lceil': '<break time="150ms"/>open ceiling<break time="150ms"/>',
  '\\rceil': '<break time="150ms"/>close ceiling<break time="150ms"/>',
  '\\vert': '<break time="150ms"/>vertical bar<break time="150ms"/>',
  '\\mvert': '<break time="150ms"/>divides<break time="150ms"/>',
  '\\lvert': '<break time="150ms"/>left vertical bar<break time="150ms"/>',
  '\\rvert': '<break time="150ms"/>right vertical bar<break time="150ms"/>',
  // '\\lbrack':		'left bracket',
  // '\\rbrack':		'right bracket',
  '\\lbrack': '<break time="150ms"/> open square bracket <break time="150ms"/>',
  '\\rbrack': '<break time="150ms"/> close square bracket <break time="150ms"/>',
  // need to add code to detect singluar/plural. Until then spoken as plural since that is vastly more common
  // note: need to worry about intervening &InvisibleTimes;.
  // note: need to also do this when in numerator of fraction and number preceeds fraction
  // note: need to do this for <msup>
  'mm': 'millimeters',
  'cm': 'centimeters',
  'km': 'kilometers',
  'kg': 'kilograms'
};

function getSpokenName(latex) {
  var result = _editorPopover.default.NOTES[latex];

  if (!result && latex.charAt(0) === '\\') {
    result = ' ' + latex.replace('\\', '') + ' ';
  } // If we got more than one result (from NOTES),
  // pick the first one.


  if (Array.isArray(result)) {
    result = result[0];
  }

  return result;
}

function platform(p) {
  var result = 'other';

  if (navigator && navigator.platform && navigator.userAgent) {
    if (/^(mac)/i.test(navigator.platform)) {
      result = 'mac';
    } else if (/^(win)/i.test(navigator.platform)) {
      result = 'win';
    } else if (/(android)/i.test(navigator.userAgent)) {
      result = 'android';
    } else if (/(iphone)/i.test(navigator.userAgent) || /(ipod)/i.test(navigator.userAgent) || /(ipad)/i.test(navigator.userAgent)) {
      result = 'ios';
    } else if (/\bCrOS\b/i.test(navigator.userAgent)) {
      result = 'chromeos';
    }
  }

  return result === p ? p : '!' + p;
}

function isAtomic(mathlist) {
  var count = 0;

  if (mathlist && Array.isArray(mathlist)) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = mathlist[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var atom = _step.value;

        if (atom.type !== 'first') {
          count += 1;
        }
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
  }

  return count === 1;
}

function atomicID(mathlist) {
  if (mathlist && Array.isArray(mathlist)) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = mathlist[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var atom = _step2.value;

        if (atom.type !== 'first' && atom.id) {
          return atom.id.toString();
        }
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

  return '';
}

function atomicValue(mathlist) {
  var result = '';

  if (mathlist && Array.isArray(mathlist)) {
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = mathlist[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var atom = _step3.value;

        if (atom.type !== 'first' && typeof atom.body === 'string') {
          result += atom.body;
        }
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

  return result;
}

_mathAtom.default.toSpeakableFragment = function (atom, options) {
  function letter(c) {
    var result = '';

    if (!options.textToSpeechMarkup) {
      if (/[a-z]/.test(c)) {
        result += " '" + c.toUpperCase() + "'";
      } else if (/[A-Z]/.test(c)) {
        result += " 'capital " + c.toUpperCase() + "'";
      } else {
        result += c;
      }
    } else {
      if (/[a-z]/.test(c)) {
        result += ' <say-as interpret-as="character">' + c + '</say-as>';
      } else if (/[A-Z]/.test(c)) {
        result += 'capital ' + c.toLowerCase() + '';
      } else {
        result += c;
      }
    }

    return result;
  }

  function emph(s) {
    return '<emphasis>' + s + '</emphasis>';
  }

  if (!atom) return '';
  var result = '';

  if (atom.id && options.speechMode === 'math') {
    result += '<mark name="' + atom.id.toString() + '"/>';
  }

  if (Array.isArray(atom)) {
    var isInDigitRun = false; // need to group sequence of digits

    for (var i = 0; i < atom.length; i++) {
      if (i < atom.length - 2 && atom[i].type === 'mopen' && atom[i + 2].type === 'mclose' && atom[i + 1].type === 'mord') {
        result += ' of ';
        result += emph(_mathAtom.default.toSpeakableFragment(atom[i + 1], options));
        i += 2; // '.' and ',' should only be allowed if prev/next entry is a digit
        // However, if that isn't the case, this still works because 'toSpeakableFragment' is called in either case.
      } else if (atom[i].mode === 'text') {
        result += atom[i].body ? atom[i].body : ' ';
      } else if (atom[i].type === 'mord' && /[0123456789,.]/.test(atom[i].body)) {
        if (isInDigitRun) {
          result += atom[i].body;
        } else {
          isInDigitRun = true;
          result += _mathAtom.default.toSpeakableFragment(atom[i], options);
        }
      } else {
        isInDigitRun = false;
        result += _mathAtom.default.toSpeakableFragment(atom[i], options);
      }
    }
  } else {
    var numer = '';
    var denom = '';
    var body = '';
    var supsubHandled = false;

    switch (atom.type) {
      case 'group':
      case 'root':
        result += _mathAtom.default.toSpeakableFragment(atom.body, options);
        break;

      case 'genfrac':
        numer = _mathAtom.default.toSpeakableFragment(atom.numer, options);
        denom = _mathAtom.default.toSpeakableFragment(atom.denom, options);

        if (isAtomic(atom.numer) && isAtomic(atom.denom)) {
          var COMMON_FRACTIONS = {
            '1/2': ' half ',
            '1/3': ' one third ',
            '2/3': ' two third',
            '1/4': ' one quarter ',
            '3/4': ' three quarter ',
            '1/5': ' one fifth ',
            '2/5': ' two fifths ',
            '3/5': ' three fifths ',
            '4/5': ' four fifths ',
            '1/6': ' one sixth ',
            '5/6': ' five sixths ',
            '1/8': ' one eight ',
            '3/8': ' three eights ',
            '5/8': ' five eights ',
            '7/8': ' seven eights ',
            '1/9': ' one ninth ',
            '2/9': ' two ninths ',
            '4/9': ' four ninths ',
            '5/9': ' five ninths ',
            '7/9': ' seven ninths ',
            '8/9': ' eight ninths ' // '1/10':     ' one tenth ',
            // '1/12':     ' one twelfth ',
            // 'x/2':     ' <say-as interpret-as="character">X</say-as> over 2',

          };
          var commonFraction = COMMON_FRACTIONS[atomicValue(atom.numer) + '/' + atomicValue(atom.denom)];

          if (commonFraction) {
            result = commonFraction;
          } else {
            result += numer + ' over ' + denom;
          }
        } else {
          result += ' the fraction <break time="150ms"/>' + numer + ', over <break time="150ms"/>' + denom + '.<break time="150ms"/> End fraction.<break time="150ms"/>';
        }

        break;

      case 'surd':
        body = _mathAtom.default.toSpeakableFragment(atom.body, options);

        if (!atom.index) {
          if (isAtomic(atom.body)) {
            result += ' the square root of ' + body + ' , ';
          } else {
            result += ' the square root of <break time="200ms"/>' + body + '. <break time="200ms"/> End square root';
          }
        } else {
          var index = _mathAtom.default.toSpeakableFragment(atom.index, options);

          index = index.trim();
          var index2 = index.replace(/<mark([^/]*)\/>/g, '');

          if (index2 === '3') {
            result += ' the cube root of <break time="200ms"/>' + body + '. <break time="200ms"/> End cube root';
          } else if (index2 === 'n') {
            result += ' the nth root of <break time="200ms"/>' + body + '. <break time="200ms"/> End root';
          } else {
            result += ' the root with index: <break time="200ms"/>' + index + ', of <break time="200ms"/>' + body + '. <break time="200ms"/> End root';
          }
        }

        break;

      case 'accent':
        break;

      case 'leftright':
        result += PRONUNCIATION[atom.leftDelim] || atom.leftDelim;
        result += _mathAtom.default.toSpeakableFragment(atom.body, options);
        result += PRONUNCIATION[atom.rightDelim] || atom.rightDelim;
        break;

      case 'line':
        // @todo
        break;

      case 'rule':
        // @todo
        break;

      case 'overunder':
        // @todo
        break;

      case 'overlap':
        // @todo
        break;

      case 'placeholder':
        result += 'placeholder ' + atom.body;
        break;

      case 'delim':
      case 'sizeddelim':
      case 'mord':
      case 'minner':
      case 'mbin':
      case 'mrel':
      case 'mpunct':
      case 'mopen':
      case 'mclose':
      case 'textord':
        {
          var command = atom.latex ? atom.latex.trim() : '';

          if (command === '\\mathbin' || command === '\\mathrel' || command === '\\mathopen' || command === '\\mathclose' || command === '\\mathpunct' || command === '\\mathord' || command === '\\mathinner') {
            result = _mathAtom.default.toSpeakableFragment(atom.body, options);
            break;
          }

          var atomValue = atom.body;
          var latexValue = atom.latex;

          if (atom.type === 'delim' || atom.type === 'sizeddelim') {
            atomValue = latexValue = atom.delim;
          }

          if (options.speechMode === 'text') {
            result += atomValue;
          } else {
            if (atom.type === 'mbin') {
              result += '<break time="150ms"/>';
            }

            if (atomValue) {
              var value = PRONUNCIATION[atomValue] || (latexValue ? PRONUNCIATION[latexValue.trim()] : '');

              if (value) {
                result += ' ' + value;
              } else {
                var spokenName = latexValue ? getSpokenName(latexValue.trim()) : '';
                result += spokenName ? spokenName : letter(atomValue);
              }
            } else {
              result += _mathAtom.default.toSpeakableFragment(atom.body, options);
            }

            if (atom.type === 'mbin') {
              result += '<break time="150ms"/>';
            }
          }

          break;
        }

      case 'mop':
        // @todo
        if (atom.body !== "\u200B") {
          // Not ZERO-WIDTH
          var trimLatex = atom.latex ? atom.latex.trim() : '';

          if (trimLatex === '\\sum') {
            if (atom.superscript && atom.subscript) {
              var sup = _mathAtom.default.toSpeakableFragment(atom.superscript, options);

              sup = sup.trim();

              var sub = _mathAtom.default.toSpeakableFragment(atom.subscript, options);

              sub = sub.trim();
              result += ' the summation from <break time="200ms"/>' + sub + '<break time="200ms"/> to  <break time="200ms"/>' + sup + '<break time="200ms"/> of <break time="150ms"/>';
              supsubHandled = true;
            } else if (atom.subscript) {
              var _sub = _mathAtom.default.toSpeakableFragment(atom.subscript, options);

              _sub = _sub.trim();
              result += ' the summation from <break time="200ms"/>' + _sub + '<break time="200ms"/> of <break time="150ms"/>';
              supsubHandled = true;
            } else {
              result += ' the summation of';
            }
          } else if (trimLatex === '\\prod') {
            if (atom.superscript && atom.subscript) {
              var _sup = _mathAtom.default.toSpeakableFragment(atom.superscript, options);

              _sup = _sup.trim();

              var _sub2 = _mathAtom.default.toSpeakableFragment(atom.subscript, options);

              _sub2 = _sub2.trim();
              result += ' the product from <break time="200ms"/>' + _sub2 + '<break time="200ms"/> to <break time="200ms"/>' + _sup + '<break time="200ms"/> of <break time="150ms"/>';
              supsubHandled = true;
            } else if (atom.subscript) {
              var _sub3 = _mathAtom.default.toSpeakableFragment(atom.subscript, options);

              _sub3 = _sub3.trim();
              result += ' the product from <break time="200ms"/>' + _sub3 + '<break time="200ms"/> of <break time="150ms"/>';
              supsubHandled = true;
            } else {
              result += ' the product  of ';
            }
          } else if (trimLatex === '\\int') {
            if (atom.superscript && atom.subscript) {
              var _sup2 = _mathAtom.default.toSpeakableFragment(atom.superscript, options);

              _sup2 = _sup2.trim();

              var _sub4 = _mathAtom.default.toSpeakableFragment(atom.subscript, options);

              _sub4 = _sub4.trim();
              result += ' the integral from <break time="200ms"/>' + emph(_sub4) + '<break time="200ms"/> to <break time="200ms"/>' + emph(_sup2) + ' <break time="200ms"/> of ';
              supsubHandled = true;
            } else {
              result += ' the integral of <break time="200ms"/> ';
            }
          } else if (typeof atom.body === 'string') {
            var _value = PRONUNCIATION[atom.body] || PRONUNCIATION[atom.latex.trim()];

            if (_value) {
              result += _value;
            } else {
              result += ' ' + atom.body;
            }
          } else if (atom.latex && atom.latex.length > 0) {
            if (atom.latex[0] === '\\') {
              result += ' ' + atom.latex.substr(1);
            } else {
              result += ' ' + atom.latex;
            }
          }
        }

        break;

      case 'enclose':
        body = _mathAtom.default.toSpeakableFragment(atom.body, options);

        if (isAtomic(atom.body)) {
          result += ' crossed out ' + body + ' , ';
        } else {
          result += ' crossed out ' + body + '. End cross out';
        }

        break;

      case 'space':
      case 'spacing':
      case 'mathstyle':
      case 'box':
        // @todo
        break;
    }

    if (!supsubHandled && atom.superscript) {
      var _sup3 = _mathAtom.default.toSpeakableFragment(atom.superscript, options);

      _sup3 = _sup3.trim();

      var sup2 = _sup3.replace(/<[^>]*>/g, '');

      if (isAtomic(atom.superscript)) {
        if (options.speechMode === 'math') {
          var id = atomicID(atom.superscript);

          if (id) {
            result += '<mark name="' + id + '"/>';
          }
        }

        if (sup2 === "\u2032") {
          result += ' prime ';
        } else if (sup2 === '2') {
          result += ' squared ';
        } else if (sup2 === '3') {
          result += ' cubed ';
        } else if (isNaN(parseInt(sup2))) {
          result += ' to the ' + _sup3 + '; ';
        } else {
          result += ' to the <say-as interpret-as="ordinal">' + sup2 + '</say-as> power; ';
        }
      } else {
        if (isNaN(parseInt(sup2))) {
          result += ' raised to the ' + _sup3 + '; ';
        } else {
          result += ' raised to the <say-as interpret-as="ordinal">' + sup2 + '</say-as> power; ';
        }
      }
    }

    if (!supsubHandled && atom.subscript) {
      var _sub5 = _mathAtom.default.toSpeakableFragment(atom.subscript, options);

      _sub5 = _sub5.trim();

      if (isAtomic(atom.subscript)) {
        result += ' sub ' + _sub5;
      } else {
        result += ' subscript ' + _sub5 + '. End subscript. ';
      }
    }
  }

  return result;
};
/**
 * @param {MathAtom[]}  [atoms] The atoms to represent as speakable text.
 * If omitted, `this` is used.
 * @param {Object.<string, any>} [options]
*/


_mathAtom.default.toSpeakableText = function (atoms, options) {
  if (!options) {
    options = {
      textToSpeechMarkup: '',
      // no markup
      textToSpeechRules: 'mathlive'
    };
  }

  options.speechMode = 'math';

  if (window.sre && options.textToSpeechRules === 'sre') {
    options.generateID = true;

    var mathML = _mathAtom.default.toMathML(atoms, options);

    if (mathML) {
      if (options.textToSpeechMarkup) {
        options.textToSpeechRulesOptions = options.textToSpeechRulesOptions || {};
        options.textToSpeechRulesOptions.markup = options.textToSpeechMarkup;

        if (options.textToSpeechRulesOptions.markup === 'ssml') {
          options.textToSpeechRulesOptions.markup = 'ssml_step';
        }

        options.textToSpeechRulesOptions.rate = options.speechEngineRate;
      }

      if (options.textToSpeechRulesOptions) {
        window.sre.System.getInstance().setupEngine(options.textToSpeechRulesOptions);
      }

      return window.sre.System.getInstance().toSpeech(mathML);
    }

    return ''; // return window.sre.toSpeech(MathAtom.toMathML(atoms));
  }

  var result = _mathAtom.default.toSpeakableFragment(atoms, options);

  if (options.textToSpeechMarkup === 'ssml') {
    var prosody = '';

    if (options.speechEngineRate) {
      prosody = '<prosody rate="' + options.speechEngineRate + '">';
    }

    result = "<?xml version=\"1.0\"?><speak version=\"1.1\" xmlns=\"http://www.w3.org/2001/10/synthesis\" xml:lang=\"en-US\">" + '<amazon:auto-breaths>' + prosody + '<p><s>' + result + '</s></p>' + (prosody ? '</prosody>' : '') + '</amazon:auto-breaths>' + '</speak>';
  } else if (options.textToSpeechMarkup === 'mac' && platform('mac') === 'mac') {
    // Convert SSML to Mac markup
    result = result.replace(/<mark([^/]*)\/>/g, '').replace(/<emphasis>/g, '[[emph+]]').replace(/<\/emphasis>/g, '').replace(/<break time="([0-9]*)ms"\/>/g, '[[slc $1]]').replace(/<say-as[^>]*>/g, '').replace(/<\/say-as>/g, '');
  } else {
    // If no markup was requested, or 'mac' markup, but we're not on a mac,
    // remove any that we may have
    // Strip out the SSML markup
    result = result.replace(/<[^>]*>/g, '').replace(/\s{2,}/g, ' ');
  }

  return result;
}; // Export the public interface for this module


var _default = {};
exports.default = _default;