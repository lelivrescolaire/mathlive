"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseMathString = parseMathString;
exports.default = void 0;

var _definitions = _interopRequireDefault(require("../core/definitions.js"));

var _mathAtom = _interopRequireDefault(require("../core/mathAtom.js"));

var _lexer = _interopRequireDefault(require("../core/lexer.js"));

var _parser = _interopRequireDefault(require("../core/parser.js"));

var _editorMathpath = _interopRequireDefault(require("./editor-mathpath.js"));

var _editorShortcuts = _interopRequireDefault(require("./editor-shortcuts.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 *
 * **Note**
 * - Method names that _begin with_ an underbar `_` are private and meant
 * to be used only by the implementation of the class.
 * - Method names that _end with_ an underbar `_` are selectors. They can
 * be invoked by calling [`MathField.$perform()`]{@link MathField#$perform}.
 * They will be dispatched to an instance of `MathEditableList` as necessary.
 * Note that the selector name does not include the underbar.
 *
 * For example:
 * ```
 *    mf.$perform('selectAll');
 * ```
 *
 * @param {Object.<string, any>} config
 * @param {Element} target - A target object passed as the first argument of 
 * callback functions. Typically, a MathField.
 * @property {MathAtom[]} root - The root element of the math expression.
 * @property {Object[]} path - The path to the element that is the
 * anchor for the selection.
 * @property {number} extent - Number of atoms in the selection. `0` if the
 * selection is collapsed.
 * @property {Object.<string, any>} config
 * @property {boolean} suppressChangeNotifications - If true,
 * the handlers for notification change won't be called.
 * @class
 * @global
 * @private
 * @memberof module:editor/editableMathlist
 */
function EditableMathlist(config, target) {
  this.root = _mathAtom.default.makeRoot();
  this.path = [{
    relation: 'body',
    offset: 0
  }];
  this.extent = 0;
  this.config = config ? _objectSpread({}, config) : {};
  this.target = target;
  this.suppressChangeNotifications = false;
}

function clone(mathlist) {
  var result = Object.assign(new EditableMathlist(mathlist.config, mathlist.target), mathlist);
  result.path = _editorMathpath.default.clone(mathlist.path);
  return result;
}

EditableMathlist.prototype._announce = function (command, mathlist, atoms) {
  if (typeof this.config.onAnnounce === 'function') {
    this.config.onAnnounce(this.target, command, mathlist, atoms);
  }
};
/**
 * Iterate over each atom in the expression, starting with the focus.
 *
 * Return an array of all the paths for which the callback predicate
 * returned true.
 *
 * @param {function} cb - A predicate being passed a path and the atom at this
 * path. Return true to include the designated atom in the result.
 * @param {number} dir - `+1` to iterate forward, `-1` to iterate backward.
 * @return {MathAtom[]} The atoms for which the predicate is true
 * @method EditableMathlist#filter
 * @private
 */


EditableMathlist.prototype.filter = function (cb, dir) {
  dir = dir < 0 ? -1 : +1;
  var result = [];
  var iter = new EditableMathlist();
  iter.path = _editorMathpath.default.clone(this.path);
  iter.extent = this.extent;
  iter.root = this.root;

  if (dir >= 0) {
    iter.collapseForward();
  } else {
    iter.collapseBackward();
    iter.move(1);
  }

  var initialAnchor = iter.anchor();

  do {
    if (cb.bind(iter)(iter.path, iter.anchor())) {
      result.push(iter.toString());
    }

    if (dir >= 0) {
      iter.next({
        iterateAll: true
      });
    } else {
      iter.previous({
        iterateAll: true
      });
    }
  } while (initialAnchor !== iter.anchor());

  return result;
};
/**
 * Enumerator
 * @param {function} cb - A callback called for each atom in the mathlist.
 */


EditableMathlist.prototype.forEach = function (cb) {
  this.root.forEach(cb);
};
/**
 * 
 * @param {function} cb - A callback called for each selected atom in the 
 * mathlist.
 */


EditableMathlist.prototype.forEachSelected = function (cb, options) {
  options = options || {};
  options.recursive = typeof options.recursive !== 'undefined' ? options.recursive : false;
  var siblings = this.siblings();
  var firstOffset = this.startOffset() + 1;
  var lastOffset = this.endOffset() + 1;

  if (options.recursive) {
    for (var i = firstOffset; i < lastOffset; i++) {
      if (siblings[i] && siblings[i].type !== 'first') {
        siblings[i].forEach(cb);
      }
    }
  } else {
    for (var _i = firstOffset; _i < lastOffset; _i++) {
      if (siblings[_i] && siblings[_i].type !== 'first') {
        cb(siblings[_i]);
      }
    }
  }
};
/**
 * Return a string representation of the selection.
 * @todo This is a bad name for this function, since it doesn't return
 * a representation of the content, which one might expect...
 *
 * @return {string}
 * @method EditableMathlist#toString
 * @private
 */


EditableMathlist.prototype.toString = function () {
  return _editorMathpath.default.pathToString(this.path, this.extent);
};
/**
 * When changing the selection, if the former selection is an empty list,
 * insert a placeholder if necessary. For example, if in an empty numerator.
*/


EditableMathlist.prototype.adjustPlaceholder = function () {
  // Should we insert a placeholder?
  // Check if we're an empty list that is the child of a fraction
  var siblings = this.siblings();

  if (siblings && siblings.length <= 1) {
    var placeholder;
    var relation = this.relation();

    if (relation === 'numer') {
      placeholder = 'numerator';
    } else if (relation === 'denom') {
      placeholder = 'denominator';
    } else if (this.parent().type === 'surd' && relation === 'body') {
      // Surd (roots)
      placeholder = 'radicand';
    } else if (this.parent().type === 'overunder' && relation === 'body') {
      placeholder = 'base';
    } else if (relation === 'underscript' || relation === 'overscript') {
      placeholder = 'annotation';
    }

    if (placeholder) {
      // ◌ ⬚
      var placeholderAtom = [new _mathAtom.default.MathAtom('math', 'placeholder', '⬚', this.anchorStyle())];
      Array.prototype.splice.apply(siblings, [1, 0].concat(placeholderAtom));
    }
  }
};

EditableMathlist.prototype.selectionWillChange = function () {
  if (typeof this.config.onSelectionWillChange === 'function' && !this.suppressChangeNotifications) {
    this.config.onSelectionWillChange(this.target);
  }
};

EditableMathlist.prototype.selectionDidChange = function () {
  if (typeof this.config.onSelectionDidChange === 'function' && !this.suppressChangeNotifications) {
    this.config.onSelectionDidChange(this.target);
  }
};

EditableMathlist.prototype.contentWillChange = function () {
  if (typeof this.config.onContentWillChange === 'function' && !this.suppressChangeNotifications) {
    this.config.onContentWillChange(this.target);
  }
};

EditableMathlist.prototype.contentDidChange = function () {
  if (typeof this.config.onContentDidChange === 'function' && !this.suppressChangeNotifications) {
    this.config.onContentDidChange(this.target);
  }
};
/**
 *
 * @param {string|Array} selection
 * @param {number} extent the length of the selection
 * @return {boolean} true if the path has actually changed
 */


EditableMathlist.prototype.setPath = function (selection, extent) {
  // Convert to a path array if necessary
  if (typeof selection === 'string') {
    selection = _editorMathpath.default.pathFromString(selection);
  } else if (Array.isArray(selection)) {
    // need to temporarily change the path of this to use 'sibling()'
    var newPath = _editorMathpath.default.clone(selection);

    var oldPath = this.path;
    this.path = newPath;

    if (extent === 0 && this.anchor().type === 'placeholder') {
      // select the placeholder
      newPath[newPath.length - 1].offset = 0;
      extent = 1;
    }

    selection = {
      path: newPath,
      extent: extent || 0
    };
    this.path = oldPath;
  }

  var pathChanged = _editorMathpath.default.pathDistance(this.path, selection.path) !== 0;
  var extentChanged = selection.extent !== this.extent;

  if (pathChanged || extentChanged) {
    if (pathChanged) {
      this.adjustPlaceholder();
    }

    this.selectionWillChange();
    this.path = _editorMathpath.default.clone(selection.path);

    if (this.siblings().length < this.anchorOffset()) {
      // The new path is out of bounds.
      // Reset the path to something valid
      console.warn('Invalid selection: ' + this.toString() + ' in "' + this.root.toLatex() + '"');
      this.path = [{
        relation: 'body',
        offset: 0
      }];
      this.extent = 0;
    } else {
      this.setExtent(selection.extent);
    }

    this.selectionDidChange();
  }

  return pathChanged || extentChanged;
};

EditableMathlist.prototype.wordBoundary = function (path, dir) {
  dir = dir < 0 ? -1 : +1;
  var iter = new EditableMathlist();
  iter.path = _editorMathpath.default.clone(path);
  iter.root = this.root;
  var i = 0;

  while (iter.sibling(i) && iter.sibling(i).mode === 'text' && _definitions.default.LETTER_AND_DIGITS.test(iter.sibling(i).body)) {
    i += dir;
  }

  if (!iter.sibling(i)) i -= dir;
  iter.path[iter.path.length - 1].offset += i;
  return iter.path;
};
/**
 * Calculates the offset of the "next word".
 * This is inspired by the behavior of text editors on macOS, namely:
    blue   yellow
      ^-                
         ^-------       
 * That is:

 * (1) If starts with an alphanumerical character, find the first alphanumerical
 * character which is followed by a non-alphanumerical character
 * 
 * The behavior regarding non-alphanumeric characters is less consistent.
 * Here's the behavior we use:
 * 
 *   +=-()_:”     blue
 * ^---------   
 *   +=-()_:”     blue
 *      ^---------
 *   +=-()_:”blue
 *      ^--------
 * 
 * (2) If starts in whitespace, skip whitespace, then find first non-whitespace*
 *    followed by whitespace
 * (*) Pages actually uses the character class of the first non-whitespace 
 * encountered.
 * 
 * (3) If starts in a non-whitespace, non alphanumerical character, find the first 
 *      whitespace
 * 
 */


EditableMathlist.prototype.wordBoundaryOffset = function (offset, dir) {
  dir = dir < 0 ? -1 : +1;
  var siblings = this.siblings();
  if (!siblings[offset]) return offset;
  if (siblings[offset].mode !== 'text') return offset;
  var result;

  if (_definitions.default.LETTER_AND_DIGITS.test(siblings[offset].body)) {
    // (1) We start with an alphanumerical character
    var i = offset;
    var match;

    do {
      match = siblings[i].mode === 'text' && _definitions.default.LETTER_AND_DIGITS.test(siblings[i].body);
      i += dir;
    } while (siblings[i] && match);

    result = siblings[i] ? i - 2 * dir : i - dir;
  } else if (/\s/.test(siblings[offset].body)) {
    // (2) We start with whitespace
    // Skip whitespace
    var _i2 = offset;

    while (siblings[_i2] && siblings[_i2].mode === 'text' && /\s/.test(siblings[_i2].body)) {
      _i2 += dir;
    }

    if (!siblings[_i2]) {
      // We've reached the end
      result = _i2 - dir;
    } else {
      var _match = true;

      do {
        _match = siblings[_i2].mode === 'text' && !/\s/.test(siblings[_i2].body);
        _i2 += dir;
      } while (siblings[_i2] && _match);

      result = siblings[_i2] ? _i2 - 2 * dir : _i2 - dir;
    }
  } else {
    // (3) 
    var _i3 = offset; // Skip non-whitespace

    while (siblings[_i3] && siblings[_i3].mode === 'text' && !/\s/.test(siblings[_i3].body)) {
      _i3 += dir;
    }

    result = siblings[_i3] ? _i3 : _i3 - dir;
    var _match2 = true;

    while (siblings[_i3] && _match2) {
      _match2 = siblings[_i3].mode === 'text' && /\s/.test(siblings[_i3].body);
      if (_match2) result = _i3;
      _i3 += dir;
    }

    result = siblings[_i3] ? _i3 - 2 * dir : _i3 - dir;
  }

  return result - (dir > 0 ? 0 : 1);
};
/**
 * Extend the selection between `from` and `to` nodes
 *
 * @param {string[]} from
 * @param {string[]} to
 * @param {object} options
 * - options.extendToWordBoundary
 * @method EditableMathlist#setRange
 * @return {boolean} true if the range was actually changed
 * @private
 */


EditableMathlist.prototype.setRange = function (from, to, options) {
  options = options || {}; // Measure the 'distance' between `from` and `to`

  var distance = _editorMathpath.default.pathDistance(from, to);

  if (distance === 0) {
    // `from` and `to` are equal.
    if (options.extendToWordBoundary) {
      from = this.wordBoundary(from, -1);
      to = this.wordBoundary(to, +1);
      return this.setRange(from, to);
    } // Set the path to a collapsed insertion point


    return this.setPath(_editorMathpath.default.clone(from), 0);
  }

  if (distance === 1) {
    var _extent = to[to.length - 1].offset - from[from.length - 1].offset;

    if (options.extendToWordBoundary) {
      from = this.wordBoundary(from, _extent < 0 ? +1 : -1);
      to = this.wordBoundary(to, _extent < 0 ? -1 : +1);
      return this.setRange(from, to);
    } // They're siblings, set an extent


    return this.setPath(_editorMathpath.default.clone(from), _extent);
  } // They're neither identical, not siblings.
  // Find the common ancestor between the nodes


  var commonAncestor = _editorMathpath.default.pathCommonAncestor(from, to);

  var ancestorDepth = commonAncestor.length;

  if (from.length === ancestorDepth || to.length === ancestorDepth || from[ancestorDepth].relation !== to[ancestorDepth].relation) {
    return this.setPath(commonAncestor, -1);
  }

  commonAncestor.push(from[ancestorDepth]);
  commonAncestor = _editorMathpath.default.clone(commonAncestor);
  var extent = to[ancestorDepth].offset - from[ancestorDepth].offset + 1;

  if (extent <= 0) {
    if (to.length > ancestorDepth + 1) {
      // axb/c+y -> select from y to x
      commonAncestor[ancestorDepth].relation = to[ancestorDepth].relation;
      commonAncestor[ancestorDepth].offset = to[ancestorDepth].offset;
      commonAncestor[commonAncestor.length - 1].offset -= 1;
      extent = -extent + 2;
    } else {
      // x+(ayb/c) -> select from y to x
      commonAncestor[ancestorDepth].relation = to[ancestorDepth].relation;
      commonAncestor[ancestorDepth].offset = to[ancestorDepth].offset;
      extent = -extent + 1;
    }
  } else if (to.length <= from.length) {
    // axb/c+y -> select from x to y
    commonAncestor[commonAncestor.length - 1].offset -= 1;
  } else if (to.length > from.length) {
    commonAncestor[ancestorDepth].offset -= 1;
  }

  return this.setPath(commonAncestor, extent);
};
/**
 * Convert an array row/col into an array index.
 * @param {MathAtom[][]} array
 * @param {object} rowCol
 * @return {number}
 */


function arrayIndex(array, rowCol) {
  var result = 0;

  for (var i = 0; i < rowCol.row; i++) {
    for (var j = 0; j < array[i].length; j++) {
      result += 1;
    }
  }

  result += rowCol.col;
  return result;
}
/**
 * Convert an array index (scalar) to an array row/col.
 * @param {MathAtom[][]} array
 * @param {number|string} index
 * @return {object}
 * - row: number
 * - col: number
 */


function arrayColRow(array, index) {
  if (typeof index === 'string') {
    var m = index.match(/cell([0-9]*)$/);
    if (m) index = parseInt(m[1]);
  }

  var result = {
    row: 0,
    col: 0
  };

  while (index > 0) {
    result.col += 1;

    if (!array[result.row] || result.col >= array[result.row].length) {
      result.col = 0;
      result.row += 1;
    }

    index -= 1;
  }

  return result;
}
/**
 * Return the array cell corresponding to colrow or null (for example in
 * a sparse array)
 *
 * @param {MathAtom[][]} array
 * @param {number|string|object} colrow
 */


function arrayCell(array, colrow) {
  if (_typeof(colrow) !== 'object') colrow = arrayColRow(array, colrow);
  var result;

  if (Array.isArray(array[colrow.row])) {
    result = array[colrow.row][colrow.col] || null;
  } // If the 'first' math atom is missing, insert it


  if (result && (result.length === 0 || result[0].type !== 'first')) {
    result.unshift(makeFirstAtom());
  }

  return result;
}
/**
 * Total numbers of cells (include sparse cells) in the array.
 * @param {MathAtom[][]} array
 */


function arrayCellCount(array) {
  var result = 0;
  var numRows = 0;
  var numCols = 1;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = array[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var row = _step.value;
      numRows += 1;
      if (row.length > numCols) numCols = row.length;
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

  result = numRows * numCols;
  return result;
}
/**
 * Join all the cells at the indicated row into a single mathlist
 * @param {MathAtom[]} row 
 * @param {string} separator 
 * @param {object} style 
 * @return {MathAtom[]}
 */


function arrayJoinColumns(row, separator, style) {
  if (!row) return [];
  if (!separator) separator = ',';
  var result = [];
  var sep;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = row[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var cell = _step2.value;

      if (cell && cell.length > 0 && cell[0].type === 'first') {
        // Remove the 'first' atom, if present
        cell = cell.slice(1);
      }

      if (cell && cell.length > 0) {
        if (sep) {
          result.push(sep);
        } else {
          sep = new _mathAtom.default.MathAtom('math', 'mpunct', separator, style);
        }

        result = result.concat(cell);
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

  return result;
}
/**
 * Join all the rows into a single atom list
 * @param {MathAtom} array 
 * @param {strings} separators
 * @param {object} style 
 * @return {MathAtom[]}
 */


function arrayJoinRows(array, separators, style) {
  if (!separators) separators = [';', ','];
  var result = [];
  var sep;
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = array[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var row = _step3.value;

      if (sep) {
        result.push(sep);
      } else {
        sep = new _mathAtom.default.MathAtom('math', 'mpunct', separators[0], style);
      }

      result = result.concat(arrayJoinColumns(row, separators[1]));
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
/**
 * Return the number of non-empty cells in that column
 * @param {MathAtom} array 
 * @param {number} col 
 * @return {number}
 */


function arrayColumnCellCount(array, col) {
  var result = 0;
  var colRow = {
    col: col,
    row: 0
  };

  while (colRow.row < array.length) {
    var cell = arrayCell(array, colRow);

    if (cell && cell.length > 0) {
      var cellLen = cell.length;
      if (cell[0].type === 'first') cellLen -= 1;

      if (cellLen > 0) {
        result += 1;
      }
    }

    colRow.row += 1;
  }

  return result;
}
/**
 * Remove the indicated column from the array
 * @param {MathAtom} array 
 * @param {number} col 
 */


function arrayRemoveColumn(array, col) {
  var row = 0;

  while (row < array.length) {
    if (array[row][col]) {
      array[row].splice(col, 1);
    }

    row += 1;
  }
}
/**
 * Remove the indicated row from the array
 * @param {MathAtom} atom 
 * @param {number} row 
 */


function arrayRemoveRow(array, row) {
  array.splice(row, 1);
}
/**
 * Return the first non-empty cell, row by row
 * @param {MathAtom[][]} array 
 * @return {string}
 */


function arrayFirstCellByRow(array) {
  var colRow = {
    col: 0,
    row: 0
  };

  while (colRow.row < array.length && !arrayCell(array, colRow)) {
    colRow.row += 1;
  }

  return arrayCell(array, colRow) ? 'cell' + arrayIndex(array, colRow) : '';
}
/**
 * Adjust colRow to point to the next/previous available row
 * If no more rows, go to the next/previous column
 * If no more columns, return null
 * @param {MathAtom[][]} array 
 * @param {object} colRow 
 * @param {number} dir 
 */


function arrayAdjustRow(array, colRow, dir) {
  var result = _objectSpread({}, colRow);

  result.row += dir;

  if (result.row < 0) {
    result.col += dir;
    result.row = array.length - 1;
    if (result.col < 0) return null;

    while (result.row >= 0 && !arrayCell(array, result)) {
      result.row -= 1;
    }

    if (result.row < 0) return null;
  } else if (result.row >= array.length) {
    result.col += dir;
    result.row = 0;

    while (result.row < array.length && !arrayCell(array, result)) {
      result.row += 1;
    }

    if (result.row > array.length - 1) return null;
  }

  return result;
}
/**
 * @param {number} ancestor distance from self to ancestor.
 * - `ancestor` = 0: self
 * - `ancestor` = 1: parent
 * - `ancestor` = 2: grand-parent
 * - etc...
 * @return {MathAtom}
 * @method EditableMathlist#ancestor
 * @private
 */


EditableMathlist.prototype.ancestor = function (ancestor) {
  // If the requested ancestor goes beyond what's available,
  // return null
  if (ancestor > this.path.length) return null; // Start with the root

  var result = this.root; // Iterate over the path segments, selecting the appropriate

  for (var i = 0; i < this.path.length - ancestor; i++) {
    var segment = this.path[i];

    if (result.array) {
      result = arrayCell(result.array, segment.relation)[segment.offset];
    } else if (!result[segment.relation]) {
      // There is no such relation... (the path got out of sync with the tree)
      return null;
    } else {
      // Make sure the 'first' atom has been inserted, otherwise
      // the segment.offset might be invalid
      if (result[segment.relation].length === 0 || result[segment.relation][0].type !== 'first') {
        result[segment.relation].unshift(makeFirstAtom());
      }

      var offset = Math.min(segment.offset, result[segment.relation].length - 1);
      result = result[segment.relation][offset];
    }
  }

  return result;
};
/**
 * The atom where the selection starts. When the selection is extended
 * the anchor remains fixed. The anchor could be either before or
 * after the focus.
 *
 * @method EditableMathlist#anchor
 * @private
 */


EditableMathlist.prototype.anchor = function () {
  if (this.parent().array) {
    return arrayCell(this.parent().array, this.relation())[this.anchorOffset()];
  }

  var siblings = this.siblings();
  return siblings[Math.min(siblings.length - 1, this.anchorOffset())];
};

EditableMathlist.prototype.parent = function () {
  return this.ancestor(1);
};

EditableMathlist.prototype.relation = function () {
  return this.path.length > 0 ? this.path[this.path.length - 1].relation : '';
};

EditableMathlist.prototype.anchorOffset = function () {
  return this.path.length > 0 ? this.path[this.path.length - 1].offset : 0;
};

EditableMathlist.prototype.focusOffset = function () {
  return this.path.length > 0 ? this.path[this.path.length - 1].offset + this.extent : 0;
};
/**
 * Offset of the first atom included in the selection
 * i.e. `=1` => selection starts with and includes first atom
 * With expression _x=_ and atoms :
 * - 0: _<first>_
 * - 1: _x_
 * - 2: _=_
 *
 * - if caret is before _x_:  `start` = 0, `end` = 0
 * - if caret is after _x_:   `start` = 1, `end` = 1
 * - if _x_ is selected:      `start` = 1, `end` = 2
 * - if _x=_ is selected:   `start` = 1, `end` = 3
 * @method EditableMathlist#startOffset
 * @private
 */


EditableMathlist.prototype.startOffset = function () {
  return Math.min(this.focusOffset(), this.anchorOffset());
};
/**
 * Offset of the first atom not included in the selection
 * i.e. max value of `siblings.length`
 * `endOffset - startOffset = extent`
 * @method EditableMathlist#endOffset
 * @private
 */


EditableMathlist.prototype.endOffset = function () {
  return Math.max(this.focusOffset(), this.anchorOffset());
};
/**
 * If necessary, insert a `first` atom in the sibling list.
 * If there's already a `first` atom, do nothing.
 * The `first` atom is used as a 'placeholder' to hold the blinking caret when
 * the caret is positioned at the very beginning of the mathlist.
 * @method EditableMathlist#insertFirstAtom
 * @private
 */


EditableMathlist.prototype.insertFirstAtom = function () {
  this.siblings();
};
/**
 * @return {MathAtom[]} array of children of the parent
 * @method EditableMathlist#siblings
 * @private
 */


EditableMathlist.prototype.siblings = function () {
  if (this.path.length === 0) return [];
  var siblings;

  if (this.parent().array) {
    siblings = arrayCell(this.parent().array, this.relation());
  } else {
    siblings = this.parent()[this.relation()] || [];
    if (typeof siblings === 'string') siblings = [];
  } // If the 'first' math atom is missing, insert it


  if (siblings.length === 0 || siblings[0].type !== 'first') {
    siblings.unshift(makeFirstAtom());
  }

  return siblings;
};
/**
 * Sibling, relative to `anchor`
 * `sibling(0)` = start of selection
 * `sibling(-1)` = sibling immediately left of start offset
 * @return {MathAtom}
 * @method EditableMathlist#sibling
 * @private
 */


EditableMathlist.prototype.sibling = function (offset) {
  return this.siblings()[this.startOffset() + offset];
};
/**
 * @return {boolean} True if the selection is an insertion point.
 * @method EditableMathlist#isCollapsed
 */


EditableMathlist.prototype.isCollapsed = function () {
  return this.extent === 0;
};
/**
 * @param {number} extent
 * @method EditableMathlist#setExtent
 * @private
 */


EditableMathlist.prototype.setExtent = function (extent) {
  this.extent = extent;
};

EditableMathlist.prototype.collapseForward = function () {
  if (this.extent === 0) return false;
  this.setSelection(this.endOffset());
  return true;
};

EditableMathlist.prototype.collapseBackward = function () {
  if (this.extent === 0) return false;
  this.setSelection(this.startOffset());
  return true;
};
/**
 * Return true if the atom could be a part of a number
 * i.e. "-12354.568"
 * @param {object} atom 
 */


function isNumber(atom) {
  if (!atom) return false;
  return atom.type === 'mord' && /[0-9.]/.test(atom.body) || atom.type === 'mpunct' && atom.body === ',';
}
/**
 * Select all the atoms in the current group, that is all the siblings.
 * When the selection is in a numerator, the group is the numerator. When
 * the selection is a superscript or subscript, the group is the supsub.
 * When the selection is in a text zone, the "group" is a word.
 * @method EditableMathlist#selectGroup_
 */


EditableMathlist.prototype.selectGroup_ = function () {
  var siblings = this.siblings();

  if (this.anchorMode() === 'text') {
    var start = this.startOffset();
    var end = this.endOffset(); // 

    while (siblings[start] && siblings[start].mode === 'text' && _definitions.default.LETTER_AND_DIGITS.test(siblings[start].body)) {
      start -= 1;
    }

    while (siblings[end] && siblings[end].mode === 'text' && _definitions.default.LETTER_AND_DIGITS.test(siblings[end].body)) {
      end += 1;
    }

    end -= 1;

    if (start >= end) {
      // No word found. Select a single character
      this.setSelection(this.endOffset() - 1, 1);
      return;
    }

    this.setSelection(start, end - start);
  } else {
    // In a math zone, select all the sibling nodes
    if (this.sibling(0).type === 'mord' && /[0-9,.]/.test(this.sibling(0).body)) {
      // In a number, select all the digits
      var _start = this.startOffset();

      var _end = this.endOffset(); // 


      while (isNumber(siblings[_start])) {
        _start -= 1;
      }

      while (isNumber(siblings[_end])) {
        _end += 1;
      }

      _end -= 1;
      this.setSelection(_start, _end - _start);
    } else {
      this.setSelection(0, 'end');
    }
  }
};
/**
 * Select all the atoms in the math field.
 * @method EditableMathlist#selectAll_
 */


EditableMathlist.prototype.selectAll_ = function () {
  this.path = [{
    relation: 'body',
    offset: 0
  }];
  this.setSelection(0, 'end');
};
/**
 * Delete everything in the field
 * @method EditableMathlist#deleteAll_
 */


EditableMathlist.prototype.deleteAll_ = function () {
  this.selectAll_();
  this.delete_();
};
/**
 *
 * @param {MathAtom} atom
 * @param {MathAtom} target
 * @return {boolean} True if  `atom` is the target, or if one of the
 * children of `atom` contains the target
 * @function atomContains
 * @private
 */


function atomContains(atom, target) {
  if (!atom) return false;

  if (Array.isArray(atom)) {
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = atom[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var child = _step4.value;
        if (atomContains(child, target)) return true;
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
  } else {
    if (atom === target) return true;
    if (['body', 'numer', 'denom', 'index', 'subscript', 'superscript', 'underscript', 'overscript'].some(function (value) {
      return value === target || atomContains(atom[value], target);
    })) return true;

    if (atom.array) {
      for (var i = arrayCellCount(atom.array); i >= 0; i--) {
        if (atomContains(arrayCell(atom.array, i), target)) {
          return true;
        }
      }
    }
  }

  return false;
}
/**
 * @param {MathAtom} atom
 * @return {boolean} True if `atom` is within the selection range
 * @todo: poorly named, since this is specific to the selection, not the math
 * field
 * @method EditableMathlist#contains
 * @private
 */


EditableMathlist.prototype.contains = function (atom) {
  if (this.isCollapsed()) return false;
  var siblings = this.siblings();
  var firstOffset = this.startOffset();
  var lastOffset = this.endOffset();

  for (var i = firstOffset; i < lastOffset; i++) {
    if (atomContains(siblings[i], atom)) return true;
  }

  return false;
};
/**
 * @return {MathAtom[]} The currently selected atoms, or `null` if the
 * selection is collapsed
 * @method EditableMathlist#getSelectedAtoms
 * @private
 */


EditableMathlist.prototype.getSelectedAtoms = function () {
  if (this.isCollapsed()) return null;
  var result = [];
  var siblings = this.siblings();
  var firstOffset = this.startOffset() + 1;
  var lastOffset = this.endOffset() + 1;

  for (var i = firstOffset; i < lastOffset; i++) {
    if (siblings[i] && siblings[i].type !== 'first') result.push(siblings[i]);
  }

  return result;
};
/**
 * Return a `{start:, end:}` for the offsets of the command around the insertion
 * point, or null.
 * - `start` is the first atom which is of type `command`
 * - `end` is after the last atom of type `command`
 * @return {object}
 * @method EditableMathlist#commandOffsets
 * @private
 */


EditableMathlist.prototype.commandOffsets = function () {
  var siblings = this.siblings();
  if (siblings.length <= 1) return null;
  var start = Math.min(this.endOffset(), siblings.length - 1); // let start = Math.max(0, this.endOffset());

  if (siblings[start].type !== 'command') return null;

  while (start > 0 && siblings[start].type === 'command') {
    start -= 1;
  }

  var end = this.startOffset() + 1;

  while (end <= siblings.length - 1 && siblings[end].type === 'command') {
    end += 1;
  }

  if (end > start) {
    return {
      start: start + 1,
      end: end
    };
  }

  return null;
};
/**
 * @return {string}
 * @method EditableMathlist#extractCommandStringAroundInsertionPoint
 * @private
 */


EditableMathlist.prototype.extractCommandStringAroundInsertionPoint = function (beforeInsertionPointOnly) {
  var result = '';
  var command = this.commandOffsets();

  if (command) {
    var end = beforeInsertionPointOnly ? this.anchorOffset() + 1 : command.end;
    var siblings = this.siblings();

    for (var i = command.start; i < end; i++) {
      // All these atoms are 'command' atom with a body that's
      // a single character
      result += siblings[i].body || '';
    }
  }

  return result;
};
/**
 * @param {boolean} value If true, decorate the command string around the
 * insertion point with an error indicator (red dotted underline). If false,
 * remove it.
 * @method EditableMathlist#decorateCommandStringAroundInsertionPoint
 * @private
 */


EditableMathlist.prototype.decorateCommandStringAroundInsertionPoint = function (value) {
  var command = this.commandOffsets();

  if (command) {
    var siblings = this.siblings();

    for (var i = command.start; i < command.end; i++) {
      siblings[i].error = value;
    }
  }
};
/**
 * @return {string}
 * @method EditableMathlist#commitCommandStringBeforeInsertionPoint
 * @private
 */


EditableMathlist.prototype.commitCommandStringBeforeInsertionPoint = function () {
  var command = this.commandOffsets();

  if (command) {
    var siblings = this.siblings();
    var anchorOffset = this.anchorOffset() + 1;

    for (var i = command.start; i < anchorOffset; i++) {
      if (siblings[i]) {
        siblings[i].suggestion = false;
      }
    }
  }
};

EditableMathlist.prototype.spliceCommandStringAroundInsertionPoint = function (mathlist) {
  var command = this.commandOffsets();

  if (command) {
    // Dispatch notifications
    this.contentWillChange();

    if (!mathlist) {
      this.siblings().splice(command.start, command.end - command.start);
      this.setSelection(command.start - 1, 0);
    } else {
      Array.prototype.splice.apply(this.siblings(), [command.start, command.end - command.start].concat(mathlist));
      var newPlaceholders = [];
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = mathlist[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var atom = _step5.value;
          newPlaceholders = newPlaceholders.concat(atom.filter(function (atom) {
            return atom.type === 'placeholder';
          }));
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

      this.setExtent(0); // Set the anchor offset to a reasonable value that can be used by
      // leap(). In particular, the current offset value may be invalid
      // if the length of the mathlist is shorter than the name of the command

      this.path[this.path.length - 1].offset = command.start - 1;

      if (newPlaceholders.length === 0 || !this.leap(+1, false)) {
        this.setSelection(command.start + mathlist.length - 1);
      }
    } // Dispatch notifications


    this.contentDidChange();
  }
};

function removeCommandStringFromAtom(atom) {
  if (!atom) return;

  if (Array.isArray(atom)) {
    for (var i = atom.length - 1; i >= 0; i--) {
      if (atom[i].type === 'command') {
        atom.splice(i, 1); // i += 1;
      } else {
        removeCommandStringFromAtom(atom[i]);
      }
    }

    return;
  }

  removeCommandStringFromAtom(atom.body);
  removeCommandStringFromAtom(atom.superscript);
  removeCommandStringFromAtom(atom.subscript);
  removeCommandStringFromAtom(atom.underscript);
  removeCommandStringFromAtom(atom.overscript);
  removeCommandStringFromAtom(atom.numer);
  removeCommandStringFromAtom(atom.denom);
  removeCommandStringFromAtom(atom.index);

  if (atom.array) {
    for (var j = arrayCellCount(atom.array); j >= 0; j--) {
      removeCommandStringFromAtom(arrayCell(atom.array, j));
    }
  }
}

EditableMathlist.prototype.removeCommandString = function () {
  this.contentWillChange();
  var contentWasChanging = this.suppressChangeNotifications;
  this.suppressChangeNotifications = true;
  removeCommandStringFromAtom(this.root.body);
  this.suppressChangeNotifications = contentWasChanging;
  this.contentDidChange();
};
/**
 * @return {string}
 * @method EditableMathlist#extractArgBeforeInsertionPoint
 * @private
 */


EditableMathlist.prototype.extractArgBeforeInsertionPoint = function () {
  var siblings = this.siblings();
  if (siblings.length <= 1) return [];
  var result = [];
  var i = this.startOffset();

  if (siblings[i].mode === 'text') {
    while (i >= 1 && siblings[i].mode === 'text') {
      result.unshift(siblings[i]);
      i--;
    }
  } else {
    while (i >= 1 && /^(mord|surd|msubsup|leftright|mop)$/.test(siblings[i].type)) {
      result.unshift(siblings[i]);
      i--;
    }
  }

  return result;
}; // 3 + 4(sin(x) > 3 + 4[sin(x)]/[ __ ]
// Add a frac inside a partial leftright: remove leftright
// When smartfence, add paren at end of expr
// a+3x=1 insert after + => paren before =

/**
 * @param {number} offset
 * - &gt;0: index of the child in the group where the selection will start from
 * - <0: index counting from the end of the group
 * @param {number|string} [extent=0] Number of items in the selection:
 * - 0: collapsed selection, single insertion point
 * - &gt;0: selection extending _after_ the offset
 * - <0: selection extending _before_ the offset
 * - `'end'`: selection extending to the end of the group
 * - `'start'`: selection extending to the beginning of the group
 * @param {string} relation e.g. `'body'`, `'superscript'`, etc...
 * @return {boolean} False if the relation is invalid (no such children)
 * @method EditableMathlist#setSelection
 * @private
 */


EditableMathlist.prototype.setSelection = function (offset, extent, relation) {
  offset = offset || 0;
  extent = extent || 0; // If no relation ("children", "superscript", etc...) is specified
  // keep the current relation

  var oldRelation = this.path[this.path.length - 1].relation;
  if (!relation) relation = oldRelation; // If the relation is invalid, exit and return false

  var parent = this.parent();
  if (!parent && relation !== 'body') return false;
  var arrayRelation = relation.startsWith('cell');
  if (!arrayRelation && !parent[relation] || arrayRelation && !parent.array) return false;
  var relationChanged = relation !== oldRelation; // Temporarily set the path to the potentially new relation to get the
  // right siblings

  this.path[this.path.length - 1].relation = relation; // Invoking siblings() will have the side-effect of adding the 'first'
  // atom if necessary
  // ... and we want the siblings with the potentially new relation...

  var siblings = this.siblings();
  var siblingsCount = siblings.length; // Restore the relation

  this.path[this.path.length - 1].relation = oldRelation;
  var oldExtent = this.extent;

  if (extent === 'end') {
    extent = siblingsCount - offset - 1;
  } else if (extent === 'start') {
    extent = -offset;
  }

  this.setExtent(extent);
  var extentChanged = this.extent !== oldExtent;
  this.setExtent(oldExtent); // Calculate the new offset, and make sure it is in range
  // (setSelection can be called with an offset that greater than
  // the number of children, for example when doing an up from a
  // numerator to a smaller denominator, e.g. "1/(x+1)".

  if (offset < 0) {
    offset = siblingsCount + offset;
  }

  offset = Math.max(0, Math.min(offset, siblingsCount - 1));
  var oldOffset = this.path[this.path.length - 1].offset;
  var offsetChanged = oldOffset !== offset;

  if (relationChanged || offsetChanged || extentChanged) {
    if (relationChanged) {
      this.adjustPlaceholder();
    }

    this.selectionWillChange();
    this.path[this.path.length - 1].relation = relation;
    this.path[this.path.length - 1].offset = offset;
    this.setExtent(extent);
    this.selectionDidChange();
  }

  return true;
};
/**
 * Move the anchor to the next permissible atom
 * @method EditableMathlist#next
 * @private
 */


EditableMathlist.prototype.next = function (options) {
  options = options || {};
  var NEXT_RELATION = {
    'body': 'numer',
    'numer': 'denom',
    'denom': 'index',
    'index': 'overscript',
    'overscript': 'underscript',
    'underscript': 'subscript',
    'subscript': 'superscript'
  };

  if (this.anchorOffset() === this.siblings().length - 1) {
    this.adjustPlaceholder(); // We've reached the end of this list.
    // Is there another list to consider?

    var relation = NEXT_RELATION[this.relation()];
    var parent = this.parent();

    while (relation && !parent[relation]) {
      relation = NEXT_RELATION[relation];
    } // We found a new relation/set of siblings...


    if (relation) {
      this.setSelection(0, 0, relation);
      return;
    } // No more siblings, check if we have a sibling cell in an array


    if (this.parent().array) {
      var maxCellCount = arrayCellCount(this.parent().array);
      var cellIndex = parseInt(this.relation().match(/cell([0-9]*)$/)[1]) + 1;

      while (cellIndex < maxCellCount) {
        var cell = arrayCell(this.parent().array, cellIndex); // Some cells could be null (sparse array), so skip them

        if (cell && this.setSelection(0, 0, 'cell' + cellIndex)) {
          this.selectionDidChange();
          return;
        }

        cellIndex += 1;
      }
    } // No more siblings, go up to the parent.


    if (this.path.length === 1) {
      // Invoke handler and perform default if they return true.
      if (this.suppressChangeNotifications || !this.config.onMoveOutOf || this.config.onMoveOutOf(this, 'forward')) {
        // We're at the root, so loop back
        this.path[0].offset = 0;
      }
    } else {
      // We've reached the end of the siblings. If we're a group
      // with skipBoundary, when exiting, move one past the next atom
      var skip = !options.iterateAll && this.parent().skipBoundary;
      this.path.pop();

      if (skip) {
        this.next(options);
      }
    }

    this.selectionDidChange();
    return;
  } // Still some siblings to go through. Move on to the next one.


  this.setSelection(this.anchorOffset() + 1);
  var anchor = this.anchor(); // Dive into its components, if the new anchor is a compound atom, 
  // and allows capture of the selection by its sub-elements

  if (anchor && !anchor.captureSelection) {
    var _relation;

    if (anchor.array) {
      // Find the first non-empty cell in this array
      var _cellIndex = 0;
      _relation = '';

      var _maxCellCount = arrayCellCount(anchor.array);

      while (!_relation && _cellIndex < _maxCellCount) {
        // Some cells could be null (sparse array), so skip them
        if (arrayCell(anchor.array, _cellIndex)) {
          _relation = 'cell' + _cellIndex.toString();
        }

        _cellIndex += 1;
      }

      console.assert(_relation);
      this.path.push({
        relation: _relation,
        offset: 0
      });
      this.setSelection(0, 0, _relation);
      return;
    }

    _relation = 'body';

    while (_relation) {
      if (Array.isArray(anchor[_relation])) {
        this.path.push({
          relation: _relation,
          offset: 0
        });
        this.insertFirstAtom();
        if (!options.iterateAll && anchor.skipBoundary) this.next(options);
        return;
      }

      _relation = NEXT_RELATION[_relation];
    }
  }
};

EditableMathlist.prototype.previous = function (options) {
  options = options || {};
  var PREVIOUS_RELATION = {
    'numer': 'body',
    'denom': 'numer',
    'index': 'denom',
    'overscript': 'index',
    'underscript': 'overscript',
    'subscript': 'underscript',
    'superscript': 'subscript'
  };

  if (!options.iterateAll && this.anchorOffset() === 1 && this.parent() && this.parent().skipBoundary) {
    this.setSelection(0);
  }

  if (this.anchorOffset() < 1) {
    // We've reached the first of these siblings.
    // Is there another set of siblings to consider?
    var relation = PREVIOUS_RELATION[this.relation()];

    while (relation && !this.setSelection(-1, 0, relation)) {
      relation = PREVIOUS_RELATION[relation];
    } // Ignore the body of the subsup scaffolding and of 
    // 'mop' atoms (for example, \sum): their body is not editable.


    var parentType = this.parent() ? this.parent().type : 'none';

    if (relation === 'body' && (parentType === 'msubsup' || parentType === 'mop')) {
      relation = null;
    } // We found a new relation/set of siblings...


    if (relation) return;
    this.adjustPlaceholder();
    this.selectionWillChange(); // No more siblings, check if we have a sibling cell in an array

    if (this.relation().startsWith('cell')) {
      var cellIndex = parseInt(this.relation().match(/cell([0-9]*)$/)[1]) - 1;

      while (cellIndex >= 0) {
        var cell = arrayCell(this.parent().array, cellIndex);

        if (cell && this.setSelection(-1, 0, 'cell' + cellIndex)) {
          this.selectionDidChange();
          return;
        }

        cellIndex -= 1;
      }
    } // No more siblings, go up to the parent.


    if (this.path.length === 1) {
      // Invoke handler and perform default if they return true.
      if (this.suppressChangeNotifications || !this.config.onMoveOutOf || this.config.onMoveOutOf.bind(this)(-1)) {
        // We're at the root, so loop back
        this.path[0].offset = this.root.body.length - 1;
      }
    } else {
      this.path.pop();
      this.setSelection(this.anchorOffset() - 1);
    }

    this.selectionDidChange();
    return;
  } // If the new anchor is a compound atom, dive into its components


  var anchor = this.anchor(); // Only dive in if the atom allows capture of the selection by
  // its sub-elements

  if (!anchor.captureSelection) {
    var _relation2;

    if (anchor.array) {
      _relation2 = '';
      var maxCellCount = arrayCellCount(anchor.array);

      var _cellIndex2 = maxCellCount - 1;

      while (!_relation2 && _cellIndex2 < maxCellCount) {
        // Some cells could be null (sparse array), so skip them
        if (arrayCell(anchor.array, _cellIndex2)) {
          _relation2 = 'cell' + _cellIndex2.toString();
        }

        _cellIndex2 -= 1;
      }

      _cellIndex2 += 1;
      console.assert(_relation2);
      this.path.push({
        relation: _relation2,
        offset: arrayCell(anchor.array, _cellIndex2).length - 1
      });
      this.setSelection(-1, 0, _relation2);
      return;
    }

    _relation2 = 'superscript';

    while (_relation2) {
      if (Array.isArray(anchor[_relation2])) {
        this.path.push({
          relation: _relation2,
          offset: anchor[_relation2].length - 1
        });
        this.setSelection(-1, 0, _relation2);
        return;
      }

      _relation2 = PREVIOUS_RELATION[_relation2];
    }
  } // There wasn't a component to navigate to, so...
  // Still some siblings to go through: move on to the previous one.


  this.setSelection(this.anchorOffset() - 1);

  if (!options.iterateAll && this.sibling(0) && this.sibling(0).skipBoundary) {
    this.previous(options);
  }
};

EditableMathlist.prototype.move = function (dist, options) {
  options = options || {
    extend: false
  };
  var extend = options.extend || false;
  this.removeSuggestion();

  if (extend) {
    this.extend(dist, options);
  } else {
    var oldPath = clone(this); // const previousParent = this.parent();
    // const previousRelation = this.relation();
    // const previousSiblings = this.siblings();

    if (dist > 0) {
      if (this.collapseForward()) dist--;

      while (dist > 0) {
        this.next();
        dist--;
      }
    } else if (dist < 0) {
      if (this.collapseBackward()) dist++;

      while (dist !== 0) {
        this.previous();
        dist++;
      }
    } // ** @todo: can't do that without updating the path.
    // If the siblings list we left was empty, remove the relation
    // if (previousSiblings.length <= 1) {
    //     if (['superscript', 'subscript', 'index'].includes(previousRelation)) {
    //         previousParent[previousRelation] = null;
    //     }
    // }


    this._announce('move', oldPath);
  }
};

EditableMathlist.prototype.up = function (options) {
  options = options || {
    extend: false
  };
  var extend = options.extend || false;
  this.collapseBackward();
  var relation = this.relation();

  if (relation === 'denom') {
    if (extend) {
      this.selectionWillChange();
      this.path.pop();
      this.path[this.path.length - 1].offset -= 1;
      this.setExtent(1);
      this.selectionDidChange();
    } else {
      this.setSelection(this.anchorOffset(), 0, 'numer');
    }

    this._announce('moveUp');
  } else if (this.parent().array) {
    // In an array
    var colRow = arrayColRow(this.parent().array, relation);
    colRow = arrayAdjustRow(this.parent().array, colRow, -1);

    if (colRow && arrayCell(colRow)) {
      this.path[this.path.length - 1].relation = 'cell' + arrayIndex(this.parent().array, colRow);
      this.setSelection(this.anchorOffset());

      this._announce('moveUp');
    } else {
      this.move(-1, options);
    }
  } else {
    this._announce('line');
  }
};

EditableMathlist.prototype.down = function (options) {
  options = options || {
    extend: false
  };
  var extend = options.extend || false;
  this.collapseForward();
  var relation = this.relation();

  if (relation === 'numer') {
    if (extend) {
      this.selectionWillChange();
      this.path.pop();
      this.path[this.path.length - 1].offset -= 1;
      this.setExtent(1);
      this.selectionDidChange();
    } else {
      this.setSelection(this.anchorOffset(), 0, 'denom');
    }

    this._announce('moveDown');
  } else if (this.parent().array) {
    // In an array
    var colRow = arrayColRow(this.parent().array, relation);
    colRow = arrayAdjustRow(this.parent().array, colRow, +1);

    if (colRow && arrayCell(colRow)) {
      this.path[this.path.length - 1].relation = 'cell' + arrayIndex(this.parent().array, colRow);
      this.setSelection(this.anchorOffset());

      this._announce('moveDown');
    } else {
      this.move(+1, options);
    }
  } else {
    this._announce('line');
  }
};
/**
 * Change the range of the selection
 *
 * @param {number} dist - The change (positive or negative) to the extent
 * of the selection. The anchor point does not move.
 * @method EditableMathlist#extend
 * @private
 */


EditableMathlist.prototype.extend = function (dist) {
  var offset = this.path[this.path.length - 1].offset;
  var extent = 0;
  var oldPath = clone(this);
  extent = this.extent + dist;
  var newFocusOffset = offset + extent;

  if (newFocusOffset < 0 && extent !== 0) {
    // We're trying to extend beyond the first element.
    // Go up to the parent.
    if (this.path.length > 1) {
      this.selectionWillChange();
      this.path.pop(); // this.path[this.path.length - 1].offset -= 1;

      this.setExtent(-1);
      this.selectionDidChange();

      this._announce('move', oldPath);

      return;
    } // @todo exit left extend
    // If we're at the very beginning, nothing to do.


    offset = this.path[this.path.length - 1].offset;
    extent = this.extent;
  } else if (newFocusOffset >= this.siblings().length) {
    // We're trying to extend beyond the last element.
    // Go up to the parent
    if (this.path.length > 1) {
      this.selectionWillChange();
      this.path.pop();
      this.path[this.path.length - 1].offset -= 1;
      this.setExtent(1);
      this.selectionDidChange();

      this._announce('move', oldPath);

      return;
    } // @todo exit right extend


    if (this.isCollapsed()) {
      offset -= 1;
    }

    extent -= 1;
  }

  this.setSelection(offset, extent);

  this._announce('move', oldPath);
};
/**
 * Move the selection focus to the next/previous point of interest.
 * A point of interest is an atom of a different type (mbin, mord, etc...)
 * than the current focus.
 * If `extend` is true, the selection will be extended. Otherwise, it is
 * collapsed, then moved.
 * @param {number} dir +1 to skip forward, -1 to skip back
 * @param {Object.<string, any>} options
 * @method EditableMathlist#skip
 * @private
 */


EditableMathlist.prototype.skip = function (dir, options) {
  options = options || {
    extend: false
  };
  var extend = options.extend || false;
  dir = dir < 0 ? -1 : +1;
  var oldPath = clone(this);
  var siblings = this.siblings();
  var focus = this.focusOffset();
  var offset = focus + dir;
  if (extend) offset = Math.min(Math.max(0, offset), siblings.length - 1);

  if (offset < 0 || offset >= siblings.length) {
    // If we've reached the end, just move out of the list
    this.move(dir, options);
    return;
  }

  if (siblings[offset] && siblings[offset].mode === 'text') {
    // We're in a text zone, skip word by word
    offset = this.wordBoundaryOffset(offset, dir);

    if (offset < 0 && !extend) {
      this.setSelection(0);
      return;
    }

    if (offset > siblings.length) {
      this.setSelection(siblings.length - 1);
      this.move(dir, options);
      return;
    }
  } else {
    var type = siblings[offset] ? siblings[offset].type : '';

    if (type === 'mopen' && dir > 0 || type === 'mclose' && dir < 0) {
      // We're right before (or after) an opening (or closing)
      // fence. Skip to the balanced element (in level, but not necessarily in
      // fence symbol).
      var level = type === 'mopen' ? 1 : -1;
      offset += dir > 0 ? 1 : -1;

      while (offset >= 0 && offset < siblings.length && level !== 0) {
        if (siblings[offset].type === 'mopen') {
          level += 1;
        } else if (siblings[offset].type === 'mclose') {
          level -= 1;
        }

        offset += dir;
      }

      if (level !== 0) {
        // We did not find a balanced element. Just move a little.
        offset = focus + dir;
      }

      if (dir > 0) offset = offset - 1;
    } else {
      while (siblings[offset] && siblings[offset].mode === 'math' && siblings[offset].type === type) {
        offset += dir;
      }

      offset -= dir > 0 ? 1 : 0;
    }
  }

  if (extend) {
    var anchor = this.anchorOffset();
    this.setSelection(anchor, offset - anchor);
  } else {
    this.setSelection(offset);
  }

  this._announce('move', oldPath);
};
/**
 * Move to the next/previous expression boundary
 * @method EditableMathlist#jump
 * @private
 */


EditableMathlist.prototype.jump = function (dir, options) {
  options = options || {
    extend: false
  };
  var extend = options.extend || false;
  dir = dir < 0 ? -1 : +1;
  var siblings = this.siblings();
  var focus = this.focusOffset();
  if (dir > 0) focus = Math.min(focus + 1, siblings.length - 1);
  var offset = dir < 0 ? 0 : siblings.length - 1;

  if (extend) {
    this.extend(offset - focus);
  } else {
    this.move(offset - focus);
  }
};

EditableMathlist.prototype.jumpToMathFieldBoundary = function (dir, options) {
  options = options || {
    extend: false
  };
  var extend = options.extend || false;
  dir = dir || +1;
  dir = dir < 0 ? -1 : +1;
  var oldPath = clone(this);
  var path = [{
    relation: "body",
    offset: this.path[0].offset
  }];
  var extent;

  if (!extend) {
    // Change the anchor to the end/start of the root expression
    path[0].offset = dir < 0 ? 0 : this.root.body.length - 1;
    extent = 0;
  } else {
    // Don't change the anchor, but update the extent
    if (dir < 0) {
      if (path[0].offset > 0) {
        extent = -path[0].offset;
      } else {// @todo exit left extend
      }
    } else {
      if (path[0].offset < this.siblings().length - 1) {
        extent = this.siblings().length - 1 - path[0].offset;
      } else {// @todo exit right extend
      }
    }
  }

  this.setPath(path, extent);

  this._announce('move', oldPath);
};
/**
 * Move to the next/previous placeholder or empty child list.
 * @return {boolean} False if no placeholder found and did not move
 * @method EditableMathlist#leap
 * @private
 */


EditableMathlist.prototype.leap = function (dir, callHandler) {
  var _this = this;

  dir = dir || +1;
  dir = dir < 0 ? -1 : +1;
  callHandler = callHandler || true;
  var savedSuppressChangeNotifications = this.suppressChangeNotifications;
  this.suppressChangeNotifications = true;
  var oldPath = clone(this);
  var oldExtent = this.extent;
  this.move(dir);

  if (this.anchor().type === 'placeholder') {
    // If we're already at a placeholder, move by one more (the placeholder
    // is right after the insertion point)
    this.move(dir);
  } // Candidate placeholders are atom of type 'placeholder'
  // or empty children list (except for the root: if the root is empty,
  // it is not a valid placeholder)


  var placeholders = this.filter(function (path, atom) {
    return atom.type === 'placeholder' || path.length > 1 && _this.siblings().length === 1;
  }, dir); // If no placeholders were found, call handler or move to the next focusable
  // element in the document

  if (placeholders.length === 0) {
    // Restore the selection
    this.setPath(oldPath, oldExtent);

    if (callHandler) {
      if (this.config.onTabOutOf) {
        this.config.onTabOutOf(this.target, dir > 0 ? 'forward' : 'backward');
      } else if (document.activeElement) {
        var focussableElements = "a[href]:not([disabled]),\n                    button:not([disabled]),\n                    textarea:not([disabled]),\n                    input[type=text]:not([disabled]),\n                    select:not([disabled]),\n                    [contentEditable=\"true\"],\n                    [tabindex]:not([disabled]):not([tabindex=\"-1\"])"; // Get all the potentially focusable elements
        // and exclude (1) those that are invisible (width and height = 0)
        // (2) not the active element
        // (3) the ancestor of the active element

        var focussable = Array.prototype.filter.call(document.querySelectorAll(focussableElements), function (element) {
          return (element.offsetWidth > 0 || element.offsetHeight > 0) && !element.contains(document.activeElement) || element === document.activeElement;
        });
        var index = focussable.indexOf(document.activeElement) + dir;
        if (index < 0) index = focussable.length - 1;
        if (index >= focussable.length) index = 0;
        focussable[index].focus();
      }
    }

    return false;
  } // Set the selection to the next placeholder


  this.selectionWillChange();
  this.setPath(placeholders[0]);
  if (this.anchor().type === 'placeholder') this.setExtent(-1);

  this._announce('move', oldPath);

  this.selectionDidChange();
  this.suppressChangeNotifications = savedSuppressChangeNotifications;
  return true;
};

EditableMathlist.prototype.anchorMode = function () {
  var anchor = this.isCollapsed() ? this.anchor() : this.sibling(1);
  var result;

  if (anchor) {
    if (anchor.type === 'commandliteral' || anchor.type === 'command') return 'command';
    result = anchor.mode;
  }

  var i = 1;
  var ancestor = this.ancestor(i);

  while (!result && ancestor) {
    if (ancestor) result = ancestor.mode;
    i += 1;
    ancestor = this.ancestor(i);
  }

  return result;
};

EditableMathlist.prototype.anchorStyle = function () {
  var anchor = this.isCollapsed() ? this.anchor() : this.sibling(1);
  var result;

  if (anchor && anchor.type !== 'first') {
    if (anchor.type === 'commandliteral' || anchor.type === 'command') return {};
    result = {
      color: anchor.color,
      backgroundColor: anchor.backgroundColor,
      fontFamily: anchor.fontFamily,
      fontShape: anchor.fontShape,
      fontSeries: anchor.fontSeries,
      fontSize: anchor.fontSize
    };
  }

  var i = 1;
  var ancestor = this.ancestor(i);

  while (!result && ancestor) {
    if (ancestor) {
      result = {
        color: ancestor.color,
        backgroundColor: ancestor.backgroundColor,
        fontFamily: ancestor.fontFamily,
        fontShape: ancestor.fontShape,
        fontSeries: ancestor.fontSeries,
        fontSize: ancestor.fontSize
      };
    }

    i += 1;
    ancestor = this.ancestor(i);
  }

  return result;
};

function removeParen(list) {
  if (!list) return undefined;

  if (list.length === 1 && list[0].type === 'leftright' && list[0].leftDelim === '(') {
    list = list[0].body;
  }

  return list;
}
/**
 * If it's a fraction with a parenthesized numerator or denominator
 * remove the parentheses
 * */


EditableMathlist.prototype.simplifyParen = function (atoms) {
  var _this2 = this;

  if (atoms && this.config.removeExtraneousParentheses) {
    for (var i = 0; atoms[i]; i++) {
      if (atoms[i].type === 'leftright' && atoms[i].leftDelim === '(') {
        if (Array.isArray(atoms[i].body)) {
          var genFracCount = 0;
          var genFracIndex = 0;
          var nonGenFracCount = 0;

          for (var j = 0; atoms[i].body; j++) {
            if (atoms[i].body[j].type === 'genfrac') {
              genFracCount++;
              genFracIndex = j;
            }

            if (atoms[i].body[j].type !== 'first') nonGenFracCount++;
          }

          if (nonGenFracCount === 0 && genFracCount === 1) {
            // This is a single frac inside a leftright: remove the leftright
            atoms[i] = atoms[i].body[genFracIndex];
          }
        }
      }
    }

    atoms.forEach(function (atom) {
      if (atom.type === 'genfrac') {
        _this2.simplifyParen(atom.numer);

        _this2.simplifyParen(atom.denom);

        atom.numer = removeParen(atom.numer);
        atom.denom = removeParen(atom.denom);
      }

      if (atom.superscript) {
        _this2.simplifyParen(atom.superscript);

        atom.superscript = removeParen(atom.superscript);
      }

      if (atom.subscript) {
        _this2.simplifyParen(atom.subscript);

        atom.subscript = removeParen(atom.subscript);
      }

      if (atom.underscript) {
        _this2.simplifyParen(atom.underscript);

        atom.underscript = removeParen(atom.underscript);
      }

      if (atom.overscript) {
        _this2.simplifyParen(atom.overscript);

        atom.overscript = removeParen(atom.overscript);
      }

      if (atom.index) {
        _this2.simplifyParen(atom.index);

        atom.index = removeParen(atom.index);
      }

      if (atom.type === 'surd') {
        _this2.simplifyParen(atom.body);

        atom.body = removeParen(atom.body);
      } else if (atom.body && Array.isArray(atom.body)) {
        _this2.simplifyParen(atom.body);
      }

      if (atom.array) {
        for (var _i4 = arrayCellCount(atom.array); _i4 >= 0; _i4--) {
          _this2.simplifyParen(arrayCell(atom.array, _i4));
        }
      }
    });
  }
};

function applyStyleToUnstyledAtoms(atom, style) {
  if (!atom || !style) return;

  if (Array.isArray(atom)) {
    // Apply styling options to each atom
    atom.forEach(function (x) {
      return applyStyleToUnstyledAtoms(x, style);
    });
  } else if (_typeof(atom) === 'object') {
    if (!atom.color && !atom.backgroundColor && !atom.fontFamily && !atom.fontShape && !atom.fontSeries && !atom.fontSize) {
      atom.applyStyle(style);
      applyStyleToUnstyledAtoms(atom.body, style);
      applyStyleToUnstyledAtoms(atom.numer, style);
      applyStyleToUnstyledAtoms(atom.denom, style);
      applyStyleToUnstyledAtoms(atom.index, style);
      applyStyleToUnstyledAtoms(atom.overscript, style);
      applyStyleToUnstyledAtoms(atom.underscript, style);
      applyStyleToUnstyledAtoms(atom.subscript, style);
      applyStyleToUnstyledAtoms(atom.superscript, style);
    }
  }
}
/**
 * @param {string} s
 * @param {Object.<string, any>} options
 * @param {string} options.insertionMode -
 *    * 'replaceSelection' (default)
 *    * 'replaceAll'
 *    * 'insertBefore'
 *    * 'insertAfter'
 *
 * @param {string} options.selectionMode - Describes where the selection
 * will be after the insertion:
 *    * `'placeholder'`: the selection will be the first available placeholder
 * in the item that has been inserted) (default)
 *    * `'after'`: the selection will be an insertion point after the item that
 * has been inserted),
 *    * `'before'`: the selection will be an insertion point before
 * the item that has been inserted) or 'item' (the item that was inserted will
 * be selected).
 *
 * @param {string} options.placeholder - The placeholder string, if necessary
 *
 * @param {string} options.format - The format of the string `s`:
 *    * `'auto'`: the string is interpreted as a latex fragment or command or 
 * ASCIIMath (default)
 *    * `'latex'`: the string is interpreted strictly as a latex fragment
 *
 * @param {string} options.smartFence - If true, promote plain fences, e.g. `(`,
 * as `\left...\right` or `\mleft...\mright`
 *
 * @param {boolean} options.suppressChangeNotifications - If true, the
 * handlers for the contentWillChange, contentDidChange, selectionWillChange and
 * selectionDidChange notifications will not be invoked. Default `false`.
 * 
 * @param {object} options.style
 * 
 * @method EditableMathlist#insert
 */


EditableMathlist.prototype.insert = function (s, options) {
  options = options || {}; // Try to insert a smart fence.

  if (options.smartFence && this._insertSmartFence(s, options.style)) {
    return;
  }

  var suppressChangeNotifications = this.suppressChangeNotifications;

  if (options.suppressChangeNotifications) {
    this.suppressChangeNotifications = true;
  } // Dispatch notifications


  this.contentWillChange();
  var contentWasChanging = this.suppressChangeNotifications;
  this.suppressChangeNotifications = true;
  if (!options.insertionMode) options.insertionMode = 'replaceSelection';
  if (!options.selectionMode) options.selectionMode = 'placeholder';
  if (!options.format) options.format = 'auto';
  options.macros = options.macros || this.config.macros;
  var anchorMode = options.mode || this.anchorMode();
  var mathlist; // Save the content of the selection, if any

  var args = [this.getSelectedAtoms()]; // If a placeholder was specified, use it

  if (options.placeholder !== undefined) {
    args['?'] = options.placeholder;
  } // Delete any selected items


  if (options.insertionMode === 'replaceSelection' && !this.isCollapsed()) {
    this.delete_();
  } else if (options.insertionMode === 'replaceAll') {
    // Remove all the children of root, save for the 'first' atom
    this.root.body.splice(1);
    this.path = [{
      relation: 'body',
      offset: 0
    }];
    this.extent = 0;
  } else if (options.insertionMode === 'insertBefore') {
    this.collapseBackward();
  } else if (options.insertionMode === 'insertAfter') {
    this.collapseForward();
  } // Delete any placeholders before or after the insertion point


  var siblings = this.siblings();
  var firstOffset = this.startOffset();

  if (firstOffset + 1 < siblings.length && siblings[firstOffset + 1] && siblings[firstOffset + 1].type === 'placeholder') {
    this.delete_(1);
  } else if (firstOffset > 0 && siblings[firstOffset] && siblings[firstOffset].type === 'placeholder') {
    this.delete_(-1);
  }

  if (anchorMode === 'math' && options.format === 'ASCIIMath') {
    s = parseMathString(s, _objectSpread({}, this.config, {
      format: 'ASCIIMath'
    }));
    mathlist = _parser.default.parseTokens(_lexer.default.tokenize(s), 'math', null, options.macros, false); // Simplify result.

    this.simplifyParen(mathlist);
  } else if (anchorMode !== 'text' && options.format === 'auto') {
    if (anchorMode === 'command') {
      // Short-circuit the tokenizer and parser if in command mode
      mathlist = [];
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = s[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var c = _step6.value;

          if (_definitions.default.COMMAND_MODE_CHARACTERS.test(c)) {
            mathlist.push(new _mathAtom.default.MathAtom('command', 'command', c));
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
    } else if (s === "\x1B") {
      // Insert an 'esc' character triggers the command mode
      mathlist = [new _mathAtom.default.MathAtom('command', 'command', '\\')];
    } else {
      s = parseMathString(s, this.config);

      if (args[0]) {
        // There was a selection, we'll use it for #@
        s = s.replace(/(^|[^\\])#@/g, '$1#0');
      } else if (/(^|[^\\])#@/.test(s)) {
        // If we're inserting a latex fragment that includes a #@ argument
        // substitute the preceding `mord` or text mode atoms for it.
        s = s.replace(/(^|[^\\])#@/g, '$1#0');
        args[0] = this.extractArgBeforeInsertionPoint(); // Delete the implicit argument

        this._deleteAtoms(-args[0].length); // If the implicit argument was empty, remove it from the args list.


        if (Array.isArray(args[0]) && args[0].length === 0) args[0] = undefined;
      } else {
        // No selection, no 'mord' before. Let's make '#@' a placeholder.
        s = s.replace(/(^|[^\\])#@/g, '$1#?');
      }

      mathlist = _parser.default.parseTokens(_lexer.default.tokenize(s), anchorMode, args, options.macros, options.smartFence); // Simplify result.

      this.simplifyParen(mathlist);
    }
  } else if (options.format === 'latex') {
    mathlist = _parser.default.parseTokens(_lexer.default.tokenize(s), anchorMode, args, options.macros, options.smartFence);
  } else if (anchorMode === 'text' || options.format === 'text') {
    // Map special TeX characters to alternatives
    // Must do this one first, since other replacements include backslash
    s = s.replace(/\\/g, '\\textbackslash ');
    s = s.replace(/#/g, '\\#');
    s = s.replace(/\$/g, '\\$');
    s = s.replace(/%/g, '\\%');
    s = s.replace(/&/g, '\\&'); // s = s.replace(/:/g, '\\colon');     // text colon?
    // s = s.replace(/\[/g, '\\lbrack');
    // s = s.replace(/]/g, '\\rbrack');

    s = s.replace(/_/g, '\\_');
    s = s.replace(/{/g, '\\textbraceleft ');
    s = s.replace(/}/g, '\\textbraceright ');
    s = s.replace(/\^/g, '\\textasciicircum ');
    s = s.replace(/~/g, '\\textasciitilde ');
    s = s.replace(/£/g, '\\textsterling ');
    mathlist = _parser.default.parseTokens(_lexer.default.tokenize(s), 'text', args, options.macros, false);
  } // Some atoms may already have a style (for example if there was an 
  // argument, i.e. the selection, that this was applied to).
  // So, don't apply style to atoms that are already styled, but *do* 
  // apply it to newly created atoms that have no style yet.


  applyStyleToUnstyledAtoms(mathlist, options.style); // Insert the mathlist at the position following the anchor

  var parent = this.parent();

  if (this.config.removeExtraneousParentheses && parent && parent.type === 'leftright' && parent.leftDelim === '(' && mathlist && mathlist.length === 1 && mathlist[0].type === 'genfrac') {
    // If the insert is fraction inside a lefright, remove the leftright
    this.path.pop();
    this.siblings()[this.anchorOffset()] = mathlist[0];
  } else {
    Array.prototype.splice.apply(this.siblings(), [this.anchorOffset() + 1, 0].concat(mathlist));
  } // If needed, make sure there's a first atom in the siblings list


  this.insertFirstAtom(); // Prepare to dispatch notifications
  // (for selection changes, then content change)

  this.suppressChangeNotifications = contentWasChanging; // Update the anchor's location

  if (options.selectionMode === 'placeholder') {
    // Move to the next placeholder
    var newPlaceholders = [];
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for (var _iterator7 = mathlist[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        var atom = _step7.value;
        newPlaceholders = newPlaceholders.concat(atom.filter(function (atom) {
          return atom.type === 'placeholder';
        }));
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

    if (newPlaceholders.length === 0 || !this.leap(+1, false)) {
      // No placeholder found, move to right after what we just inserted
      this.setSelection(this.anchorOffset() + mathlist.length); // this.path[this.path.length - 1].offset += mathlist.length;
    } else {
      this._announce('move'); // should have placeholder selected

    }
  } else if (options.selectionMode === 'before') {// Do nothing: don't change the anchorOffset.
  } else if (options.selectionMode === 'after') {
    this.setSelection(this.anchorOffset() + mathlist.length);
  } else if (options.selectionMode === 'item') {
    this.setSelection(this.anchorOffset(), mathlist.length);
  }

  this.contentDidChange();
  this.suppressChangeNotifications = suppressChangeNotifications;
};
/**
 * Insert a smart fence '(', '{', '[', etc...
 * If not handled (because `fence` wasn't a fence), return false.
 * @param {string} fence
 * @param {object} style
 * @return {boolean}
 */


EditableMathlist.prototype._insertSmartFence = function (fence, style) {
  var parent = this.parent(); // We're inserting a middle punctuation, for example as in {...|...}

  if (parent.type === 'leftright' && parent.leftDelim !== '|') {
    if (/\||\\vert|\\Vert|\\mvert|\\mid/.test(fence)) {
      this.insert('\\,\\middle' + fence + '\\, ', {
        mode: 'math',
        format: 'latex',
        style: style
      });
      return true;
    }
  }

  if (fence === '{' || fence === '\\{') fence = '\\lbrace';
  if (fence === '}' || fence === '\\}') fence = '\\rbrace';
  if (fence === '[' || fence === '\\[') fence = '\\lbrack';
  if (fence === ']' || fence === '\\]') fence = '\\rbrack';
  var rDelim = _definitions.default.RIGHT_DELIM[fence];

  if (rDelim && !(parent.type === 'leftright' && parent.leftDelim === '|')) {
    // We have a valid open fence as input
    var s = '';
    var collapsed = this.isCollapsed() || this.anchor().type === 'placeholder';

    if (this.sibling(0).isFunction) {
      // We're before a function (e.g. `\sin`, or 'f'):  this is an 
      // argument list. 
      // Use `\mleft...\mright'.
      s = '\\mleft' + fence + '\\mright';
    } else {
      s = '\\left' + fence + '\\right';
    }

    s += collapsed ? '?' : rDelim;
    var content = [];

    if (collapsed) {
      // content = this.siblings().slice(this.anchorOffset() + 1);
      content = this.siblings().splice(this.anchorOffset() + 1, this.siblings().length);
    }

    this.insert(s, {
      mode: 'math',
      format: 'latex',
      style: style
    });

    if (collapsed) {
      // Move everything that was after the anchor into the leftright
      this.sibling(0).body = content;
      this.move(-1);
    }

    return true;
  } // We did not have a valid open fence. Maybe it's a close fence?


  var lDelim;

  for (var delim in _definitions.default.RIGHT_DELIM) {
    if (_definitions.default.RIGHT_DELIM.hasOwnProperty(delim)) {
      if (fence === _definitions.default.RIGHT_DELIM[delim]) lDelim = delim;
    }
  }

  if (lDelim) {
    // We found the matching open fence, so it was a valid close fence.
    // Note that `lDelim` may not match `fence`. That's OK.
    // If we're the last atom inside a 'leftright',
    // update the parent
    if (parent && parent.type === 'leftright' && this.endOffset() === this.siblings().length - 1) {
      this.contentWillChange();
      parent.rightDelim = fence;
      this.move(+1);
      this.contentDidChange();
      return true;
    } // If we have a 'leftright' sibling to our left
    // with an indeterminate right fence,
    // move what's between us and the 'leftright' inside the leftright


    var siblings = this.siblings();
    var i;

    for (i = this.endOffset(); i >= 0; i--) {
      if (siblings[i].type === 'leftright' && siblings[i].rightDelim === '?') break;
    }

    if (i >= 0) {
      this.contentWillChange();
      siblings[i].rightDelim = fence;
      siblings[i].body = siblings[i].body.concat(siblings.slice(i + 1, this.endOffset() + 1));
      siblings.splice(i + 1, this.endOffset() - i);
      this.setSelection(i);
      this.contentDidChange();
      return true;
    } // If we're inside a 'leftright', but not the last atom,
    // and the 'leftright' right delim is indeterminate
    // adjust the body (put everything after the insertion point outside)


    if (parent && parent.type === 'leftright' && parent.rightDelim === '?') {
      this.contentWillChange();
      parent.rightDelim = fence;
      var tail = siblings.slice(this.endOffset() + 1);
      siblings.splice(this.endOffset() + 1);
      this.path.pop();
      Array.prototype.splice.apply(this.siblings(), [this.endOffset() + 1, 0].concat(tail));
      this.contentDidChange();
      return true;
    } // Is our grand-parent a 'leftright'?
    // If `\left(\frac{1}{x|}\right?` with the caret at `|`
    // go up to the 'leftright' and apply it there instead


    var grandparent = this.ancestor(2);

    if (grandparent && grandparent.type === 'leftright' && grandparent.rightDelim === '?' && this.endOffset() === siblings.length - 1) {
      this.move(1);
      return this._insertSmartFence(fence, style);
    } // Meh... We couldn't find a matching open fence. Just insert the
    // closing fence as a regular character


    this.insert(fence, {
      mode: 'math',
      format: 'latex',
      style: style
    });
    return true;
  }

  return false;
};

EditableMathlist.prototype.positionInsertionPointAfterCommitedCommand = function () {
  var siblings = this.siblings();
  var command = this.commandOffsets();
  var i = command.start;

  while (i < command.end && !siblings[i].suggestion) {
    i++;
  }

  this.setSelection(i - 1);
};

EditableMathlist.prototype.removeSuggestion = function () {
  var siblings = this.siblings(); // Remove all `suggestion` atoms

  for (var i = siblings.length - 1; i >= 0; i--) {
    if (siblings[i].suggestion) {
      siblings.splice(i, 1);
    }
  }
};

EditableMathlist.prototype.insertSuggestion = function (s, l) {
  this.removeSuggestion();
  var mathlist = []; // Make a mathlist from the string argument with the `suggestion` property set

  var subs = s.substr(l);
  var _iteratorNormalCompletion8 = true;
  var _didIteratorError8 = false;
  var _iteratorError8 = undefined;

  try {
    for (var _iterator8 = subs[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
      var c = _step8.value;
      var atom = new _mathAtom.default.MathAtom('command', 'command', c);
      atom.suggestion = true;
      mathlist.push(atom);
    } // Splice in the mathlist after the insertion point, but don't change the
    // insertion point

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

  Array.prototype.splice.apply(this.siblings(), [this.anchorOffset() + 1, 0].concat(mathlist));
};
/**
 * Delete sibling atoms
 * @method EditableMathlist#_deleteAtoms
 * @private
 */


EditableMathlist.prototype._deleteAtoms = function (count) {
  if (count > 0) {
    this.siblings().splice(this.anchorOffset() + 1, count);
  } else {
    this.siblings().splice(this.anchorOffset() + count + 1, -count);
    this.setSelection(this.anchorOffset() + count);
  }
};
/**
 * Delete multiple characters
 * @method EditableMathlist#delete
 */


EditableMathlist.prototype.delete = function (count) {
  count = count || 0;

  if (count === 0) {
    this.delete_(0);
  } else if (count > 0) {
    while (count > 0) {
      this.delete_(+1);
      count--;
    }
  } else {
    while (count < 0) {
      this.delete_(-1);
      count++;
    }
  }
};
/**
 * @param {number} dir If the selection is not collapsed, and dir is
 * negative, delete backwards, starting with the anchor atom.
 * That is, delete(-1) will delete only the anchor atom.
 * If dir = 0, delete only if the selection is not collapsed
 * @method EditableMathlist#delete_
 * @instance
 */


EditableMathlist.prototype.delete_ = function (dir) {
  // Dispatch notifications
  this.contentWillChange();
  this.selectionWillChange();
  var contentWasChanging = this.suppressChangeNotifications;
  this.suppressChangeNotifications = true;
  dir = dir || 0;
  dir = dir < 0 ? -1 : dir > 0 ? +1 : dir;
  this.removeSuggestion();

  if (this.parent().array) {
    if (dir < 0 && this.startOffset() === 0) {
      var array = this.parent().array;

      if (arrayFirstCellByRow(array) === this.relation()) {
        var _this$siblings;

        // (1) First cell:
        // delete array, replace it with linearized content
        var atoms = arrayJoinRows(array);
        this.path.pop();

        (_this$siblings = this.siblings()).splice.apply(_this$siblings, [this.anchorOffset(), 1].concat(_toConsumableArray(atoms)));

        this.setSelection(this.anchorOffset() - 1, atoms.length);
      } else {
        var colRow = arrayColRow(array, this.relation());

        if (colRow.col === 0) {
          // (2) First (non-empty) column (but not first row):
          // Move to the end of the last cell of the previous row
          var dest = arrayAdjustRow(array, colRow, -1);
          dest.col = array[dest.row].length - 1;
          this.path[this.path.length - 1].relation = 'cell' + arrayIndex(array, dest);
          var destLength = array[dest.row][dest.col].length; // (2.1) Linearize it and merge it with last cell of previous row
          // (note that atoms could be empty if there are no non-empty
          // cells left in the row)

          var _atoms = arrayJoinColumns(array[colRow.row]);

          array[dest.row][dest.col] = array[dest.row][dest.col].concat(_atoms);
          this.setSelection(destLength - 1, _atoms.length); // (2.2) Remove row

          arrayRemoveRow(array, colRow.row);
        } else {
          // (3) Non-first column
          // (3.1) If column is empty, remove it
          if (arrayColumnCellCount(array, colRow.col) === 0) {
            arrayRemoveColumn(array, colRow.col);
            colRow.col -= 1;
            this.path[this.path.length - 1].relation = 'cell' + arrayIndex(array, colRow);
            var destCell = array[colRow.row][colRow.col];
            this.setSelection(destCell.length - 1, 0);
          } // (3.2) merge cell with cell in previous column

        }
      } // Dispatch notifications


      this.suppressChangeNotifications = contentWasChanging;
      this.selectionDidChange();
      this.contentDidChange();
      return;
    }
  }

  var siblings = this.siblings();

  if (!this.isCollapsed()) {
    // There is a selection extent. Delete all the atoms within it.
    var first = this.startOffset() + 1;
    var last = this.endOffset() + 1;

    this._announce('deleted', null, siblings.slice(first, last));

    siblings.splice(first, last - first); // Adjust the anchor

    this.setSelection(first - 1);
  } else {
    var anchorOffset = this.anchorOffset();

    if (dir < 0) {
      if (anchorOffset !== 0) {
        // We're not at the begining of the sibling list.
        // If the previous sibling is a compound (fractions, group),
        // just move into it, otherwise delete it
        var sibling = this.sibling(0);

        if (sibling.type === 'leftright') {
          sibling.rightDelim = '?';
          this.move(-1);
        } else if (!sibling.captureSelection && /^(group|array|genfrac|surd|leftright|overlap|overunder|box|mathstyle|sizing)$/.test(sibling.type)) {
          this.move(-1);
        } else {
          this._announce('delete', null, siblings.slice(anchorOffset, anchorOffset + 1));

          siblings.splice(anchorOffset, 1);
          this.setSelection(anchorOffset - 1);
        }
      } else {
        // We're at the beginning of the sibling list.
        // Delete what comes before
        var relation = this.relation();

        if (relation === 'superscript' || relation === 'subscript') {
          var supsub = this.parent()[relation].filter(function (atom) {
            return atom.type !== 'placeholder' && atom.type !== 'first';
          });
          this.parent()[relation] = null;
          this.path.pop();
          Array.prototype.splice.apply(this.siblings(), [this.anchorOffset(), 0].concat(supsub));
          this.setSelection(this.anchorOffset() - 1);

          this._announce('deleted: ' + relation);
        } else if (relation === 'denom') {
          // Fraction denominator
          var numer = this.parent().numer.filter(function (atom) {
            return atom.type !== 'placeholder' && atom.type !== 'first';
          });
          var denom = this.parent().denom.filter(function (atom) {
            return atom.type !== 'placeholder' && atom.type !== 'first';
          });
          this.path.pop();
          Array.prototype.splice.apply(this.siblings(), [this.anchorOffset(), 1].concat(denom));
          Array.prototype.splice.apply(this.siblings(), [this.anchorOffset(), 0].concat(numer));
          this.setSelection(this.anchorOffset() + numer.length - 1);

          this._announce('deleted: denominator');
        } else if (relation === 'body') {
          var body = this.siblings().filter(function (atom) {
            return atom.type !== 'placeholder';
          });

          if (this.path.length > 1) {
            body.shift(); // Remove the 'first' atom

            this.path.pop();
            Array.prototype.splice.apply(this.siblings(), [this.anchorOffset(), 1].concat(body));
            this.setSelection(this.anchorOffset() - 1);

            this._announce('deleted: root');
          }
        } else {
          this.move(-1);
          this.delete(-1);
        }
      }
    } else if (dir > 0) {
      if (anchorOffset !== siblings.length - 1) {
        if (/^(group|array|genfrac|surd|leftright|overlap|overunder|box|mathstyle|sizing)$/.test(this.sibling(1).type)) {
          this.move(+1);
        } else {
          this._announce('delete', null, siblings.slice(anchorOffset + 1, anchorOffset + 2));

          siblings.splice(anchorOffset + 1, 1);
        }
      } else {
        // We're at the end of the sibling list, delete what comes next
        var _relation3 = this.relation();

        if (_relation3 === 'numer') {
          var _numer = this.parent().numer.filter(function (atom) {
            return atom.type !== 'placeholder' && atom.type !== 'first';
          });

          var _denom = this.parent().denom.filter(function (atom) {
            return atom.type !== 'placeholder' && atom.type !== 'first';
          });

          this.path.pop();
          Array.prototype.splice.apply(this.siblings(), [this.anchorOffset(), 1].concat(_denom));
          Array.prototype.splice.apply(this.siblings(), [this.anchorOffset(), 0].concat(_numer));
          this.setSelection(this.anchorOffset() + _numer.length - 1);

          this._announce('deleted: numerator');
        } else {
          this.move(1);
          this.delete(1);
        }
      }
    }
  } // Dispatch notifications


  this.suppressChangeNotifications = contentWasChanging;
  this.selectionDidChange();
  this.contentDidChange();
};
/**
 * @method EditableMathlist#moveToNextPlaceholder_
 */


EditableMathlist.prototype.moveToNextPlaceholder_ = function () {
  this.leap(+1);
};
/**
 * @method EditableMathlist#moveToPreviousPlaceholder_
 */


EditableMathlist.prototype.moveToPreviousPlaceholder_ = function () {
  this.leap(-1);
};
/**
 * @method EditableMathlist#moveToNextChar_
 */


EditableMathlist.prototype.moveToNextChar_ = function () {
  this.move(+1);
};
/**
 * @method EditableMathlist#moveToPreviousChar_
 */


EditableMathlist.prototype.moveToPreviousChar_ = function () {
  this.move(-1);
};
/**
 * @method EditableMathlist#moveUp_
 */


EditableMathlist.prototype.moveUp_ = function () {
  this.up();
};
/**
 * @method EditableMathlist#moveDown_
 */


EditableMathlist.prototype.moveDown_ = function () {
  this.down();
};
/**
 * @method EditableMathlist#moveToNextWord_
 */


EditableMathlist.prototype.moveToNextWord_ = function () {
  this.skip(+1);
};
/**
 * @method EditableMathlist#moveToPreviousWord_
 */


EditableMathlist.prototype.moveToPreviousWord_ = function () {
  this.skip(-1);
};
/**
 * @method EditableMathlist#moveToGroupStart_
 */


EditableMathlist.prototype.moveToGroupStart_ = function () {
  this.setSelection(0);
};
/**
 * @method EditableMathlist#moveToGroupEnd_
 */


EditableMathlist.prototype.moveToGroupEnd_ = function () {
  this.setSelection(-1);
};
/**
 * @method EditableMathlist#moveToMathFieldStart_
 */


EditableMathlist.prototype.moveToMathFieldStart_ = function () {
  this.jumpToMathFieldBoundary(-1);
};
/**
 * @method EditableMathlist#moveToMathFieldEnd_
 */


EditableMathlist.prototype.moveToMathFieldEnd_ = function () {
  this.jumpToMathFieldBoundary(+1);
};
/**
 * @method EditableMathlist#deleteNextChar_
 */


EditableMathlist.prototype.deleteNextChar_ = function () {
  this.delete_(+1);
};
/**
 * @method EditableMathlist#deletePreviousChar_
 */


EditableMathlist.prototype.deletePreviousChar_ = function () {
  this.delete_(-1);
};
/**
 * @method EditableMathlist#deleteNextWord_
 */


EditableMathlist.prototype.deleteNextWord_ = function () {
  this.extendToNextBoundary();
  this.delete_();
};
/**
 * @method EditableMathlist#deletePreviousWord_
 */


EditableMathlist.prototype.deletePreviousWord_ = function () {
  this.extendToPreviousBoundary();
  this.delete_();
};
/**
 * @method EditableMathlist#deleteToGroupStart_
 */


EditableMathlist.prototype.deleteToGroupStart_ = function () {
  this.extendToGroupStart();
  this.delete_();
};
/**
 * @method EditableMathlist#deleteToGroupEnd_
 */


EditableMathlist.prototype.deleteToGroupEnd_ = function () {
  this.extendToMathFieldStart();
  this.delete_();
};
/**
 * @method EditableMathlist#deleteToMathFieldEnd_
 */


EditableMathlist.prototype.deleteToMathFieldEnd_ = function () {
  this.extendToMathFieldEnd();
  this.delete_();
};
/**
 * Swap the characters to either side of the insertion point and advances
 * the insertion point past both of them. Does nothing to a selected range of
 * text.
 * @method EditableMathlist#transpose_
 */


EditableMathlist.prototype.transpose_ = function () {} // @todo

/**
 * @method EditableMathlist#extendToNextChar_
 */
;

EditableMathlist.prototype.extendToNextChar_ = function () {
  this.extend(+1);
};
/**
 * @method EditableMathlist#extendToPreviousChar_
 */


EditableMathlist.prototype.extendToPreviousChar_ = function () {
  this.extend(-1);
};
/**
 * @method EditableMathlist#extendToNextWord_
 */


EditableMathlist.prototype.extendToNextWord_ = function () {
  this.skip(+1, {
    extend: true
  });
};
/**
 * @method EditableMathlist#extendToPreviousWord_
 */


EditableMathlist.prototype.extendToPreviousWord_ = function () {
  this.skip(-1, {
    extend: true
  });
};
/**
 * If the selection is in a denominator, the selection will be extended to
 * include the numerator.
 * @method EditableMathlist#extendUp_
 */


EditableMathlist.prototype.extendUp_ = function () {
  this.up({
    extend: true
  });
};
/**
 * If the selection is in a numerator, the selection will be extended to
 * include the denominator.
 * @method EditableMathlist#extendDown_
 */


EditableMathlist.prototype.extendDown_ = function () {
  this.down({
    extend: true
  });
};
/**
 * Extend the selection until the next boundary is reached. A boundary
 * is defined by an atom of a different type (mbin, mord, etc...)
 * than the current focus. For example, in "1234+x=y", if the focus is between
 * "1" and "2", invoking `extendToNextBoundary_` would extend the selection
 * to "234".
 * @method EditableMathlist#extendToNextBoundary_
 */


EditableMathlist.prototype.extendToNextBoundary_ = function () {
  this.skip(+1, {
    extend: true
  });
};
/**
 * Extend the selection until the previous boundary is reached. A boundary
 * is defined by an atom of a different type (mbin, mord, etc...)
 * than the current focus. For example, in "1+23456", if the focus is between
 * "5" and "6", invoking `extendToPreviousBoundary` would extend the selection
 * to "2345".
 * @method EditableMathlist#extendToPreviousBoundary_
 */


EditableMathlist.prototype.extendToPreviousBoundary_ = function () {
  this.skip(-1, {
    extend: true
  });
};
/**
 * @method EditableMathlist#extendToGroupStart_
 */


EditableMathlist.prototype.extendToGroupStart_ = function () {
  this.setExtent(-this.anchorOffset());
};
/**
 * @method EditableMathlist#extendToGroupEnd_
 */


EditableMathlist.prototype.extendToGroupEnd_ = function () {
  this.setExtent(this.siblings().length - this.anchorOffset());
};
/**
 * @method EditableMathlist#extendToMathFieldStart_
 */


EditableMathlist.prototype.extendToMathFieldStart_ = function () {
  this.jumpToMathFieldBoundary(-1, {
    extend: true
  });
};
/**
 * Extend the selection to the end of the math field.
 * @method EditableMathlist#extendToMathFieldEnd_
 */


EditableMathlist.prototype.extendToMathFieldEnd_ = function () {
  this.jumpToMathFieldBoundary(+1, {
    extend: true
  });
};
/**
 * Switch the cursor to the superscript and select it. If there is no subscript
 * yet, create one.
 * @method EditableMathlist#moveToSuperscript_
 */


EditableMathlist.prototype.moveToSuperscript_ = function () {
  this.collapseForward();

  if (!this.anchor().superscript) {
    if (this.anchor().subscript) {
      this.anchor().superscript = [makeFirstAtom()];
    } else {
      var sibling = this.sibling(1);

      if (sibling && sibling.superscript) {
        this.path[this.path.length - 1].offset += 1; //            this.setSelection(this.anchorOffset() + 1);
      } else if (sibling && sibling.subscript) {
        this.path[this.path.length - 1].offset += 1; //            this.setSelection(this.anchorOffset() + 1);

        this.anchor().superscript = [makeFirstAtom()];
      } else {
        if (this.anchor().limits !== 'limits') {
          this.siblings().splice(this.anchorOffset() + 1, 0, new _mathAtom.default.MathAtom(this.parent().anchorMode, 'msubsup', "\u200B", this.anchorStyle()));
          this.path[this.path.length - 1].offset += 1; //            this.setSelection(this.anchorOffset() + 1);
        }

        this.anchor().superscript = [makeFirstAtom()];
      }
    }
  }

  this.path.push({
    relation: 'superscript',
    offset: 0
  });
  this.selectGroup_();
};
/**
 * Switch the cursor to the subscript and select it. If there is no subscript
 * yet, create one.
 * @method EditableMathlist#moveToSubscript_
 */


EditableMathlist.prototype.moveToSubscript_ = function () {
  this.collapseForward();

  if (!this.anchor().subscript) {
    if (this.anchor().superscript) {
      this.anchor().subscript = [makeFirstAtom()];
    } else {
      var sibling = this.sibling(1);

      if (sibling && sibling.subscript) {
        this.path[this.path.length - 1].offset += 1; // this.setSelection(this.anchorOffset() + 1);
      } else if (sibling && sibling.superscript) {
        this.path[this.path.length - 1].offset += 1; // this.setSelection(this.anchorOffset() + 1);

        this.anchor().subscript = [makeFirstAtom()];
      } else {
        if (this.anchor().limits !== 'limits') {
          this.siblings().splice(this.anchorOffset() + 1, 0, new _mathAtom.default.MathAtom(this.parent().anchorMode, 'msubsup', "\u200B", this.anchorStyle()));
          this.path[this.path.length - 1].offset += 1; // this.setSelection(this.anchorOffset() + 1);
        }

        this.anchor().subscript = [makeFirstAtom()];
      }
    }
  }

  this.path.push({
    relation: 'subscript',
    offset: 0
  });
  this.selectGroup_();
};
/**
 * If cursor is currently in:
 * - superscript: move to subscript, creating it if necessary
 * - subscript: move to superscript, creating it if necessary
 * - numerator: move to denominator
 * - denominator: move to numerator
 * - otherwise: move to superscript
 * @method EditableMathlist#moveToOpposite_
 */


EditableMathlist.prototype.moveToOpposite_ = function () {
  var OPPOSITE_RELATIONS = {
    'superscript': 'subscript',
    'subscript': 'superscript',
    'denom': 'numer',
    'numer': 'denom'
  };
  var oppositeRelation = OPPOSITE_RELATIONS[this.relation()];

  if (!oppositeRelation) {
    this.moveToSuperscript_();
  }

  if (!this.parent()[oppositeRelation]) {
    // Don't have children of the opposite relation yet
    // Add them
    this.parent()[oppositeRelation] = [makeFirstAtom()];
  }

  this.setSelection(0, 'end', oppositeRelation);
};
/**
 * @method EditableMathlist#moveBeforeParent_
 */


EditableMathlist.prototype.moveBeforeParent_ = function () {
  if (this.path.length > 1) {
    this.path.pop();
    this.setSelection(this.anchorOffset() - 1);
  } else {
    this._announce('plonk');
  }
};
/**
 * @method EditableMathlist#moveAfterParent_
 */


EditableMathlist.prototype.moveAfterParent_ = function () {
  if (this.path.length > 1) {
    var oldPath = clone(this);
    this.path.pop();
    this.setExtent(0);

    this._announce('move', oldPath);
  } else {
    this._announce('plonk');
  }
};
/**
 * Internal primitive to add a column/row in a matrix
 * @method EditableMathlist#_addCell
 * @private
 */


EditableMathlist.prototype._addCell = function (where) {
  // This command is only applicable if we're in an array
  var parent = this.parent();

  if (parent && parent.type === 'array' && Array.isArray(parent.array)) {
    var relation = this.relation();

    if (parent.array) {
      var colRow = arrayColRow(parent.array, relation);

      if (where === 'after row' || where === 'before row') {
        // Insert a row
        colRow.col = 0;
        colRow.row = colRow.row + (where === 'after row' ? 1 : 0);
        parent.array.splice(colRow.row, 0, [[]]);
      } else {
        // Insert a column
        colRow.col += where === 'after column' ? 1 : 0;
        parent.array[colRow.row].splice(colRow.col, 0, []);
      }

      var cellIndex = arrayIndex(parent.array, colRow);
      this.path.pop();
      this.path.push({
        relation: 'cell' + cellIndex.toString(),
        offset: 0
      });
      this.insertFirstAtom();
    }
  }
};

EditableMathlist.prototype.convertParentToArray = function () {
  var parent = this.parent();

  if (parent.type === 'leftright') {
    parent.type = 'array';
    var envName = {
      '(': 'pmatrix',
      '\\lbrack': 'bmatrix',
      '\\lbrace': 'cases'
    }[parent.leftDelim] || 'matrix';

    var env = _definitions.default.getEnvironmentInfo(envName);

    var array = [[parent.body]];

    if (env.parser) {
      Object.assign(parent, env.parser(envName, [], array));
    }

    parent.tabularMode = env.tabular;
    parent.parseMode = this.anchorMode();
    parent.env = _objectSpread({}, env);
    parent.env.name = envName;
    parent.array = array;
    parent.rowGaps = [0];
    delete parent.body;
    this.path[this.path.length - 1].relation = 'cell0';
  } // Note: could also be a group, or we could be a subscript or an
  // underscript (for multi-valued conditions on a \sum, for example)
  // Or if at root, this could be a 'align*' environment

};
/**
 * @method EditableMathlist#addRowAfter_
 */


EditableMathlist.prototype.addRowAfter_ = function () {
  this.contentWillChange();
  this.convertParentToArray();

  this._addCell('after row');

  this.contentDidChange();
};
/**
 * @method EditableMathlist#addRowBefore_
 */


EditableMathlist.prototype.addRowBefore_ = function () {
  this.contentWillChange();
  this.convertParentToArray();

  this._addCell('before row');

  this.contentDidChange();
};
/**
 * @method EditableMathlist#addColumnAfter_
 */


EditableMathlist.prototype.addColumnAfter_ = function () {
  this.contentWillChange();
  this.convertParentToArray();

  this._addCell('after column');

  this.contentDidChange();
};
/**
 * @method EditableMathlist#addColumnBefore_
 */


EditableMathlist.prototype.addColumnBefore_ = function () {
  this.contentWillChange();
  this.convertParentToArray();

  this._addCell('before column');

  this.contentDidChange();
};
/**
 * Apply a style (color, background) to the selection.
 * 
 * If the style is already applied to the selection, remove it. If the selection
 * has the style partially applied (i.e. only some sections), remove it from 
 * those sections, and apply it to the entire selection.
 * 
 * @method EditableMathlist#applyStyle
 */


EditableMathlist.prototype._applyStyle = function (style) {
  // No selection, nothing to do.
  if (this.isCollapsed()) return;
  var that = this;

  function everyStyle(property, value) {
    var result = true;
    that.forEachSelected(function (x) {
      result = result && x[property] === value;
    }, {
      recursive: true
    });
    return result;
  }

  if (style.color && everyStyle('color', style.color)) {
    // If the selection already has this color, turn it off
    style.color = 'none';
  }

  if (style.backgroundColor && everyStyle('backgroundColor', style.backgroundColor)) {
    // If the selection already has this color, turn it off
    style.backgroundColor = 'none';
  }

  if (style.fontFamily && everyStyle('fontFamily', style.fontFamily)) {
    // If the selection already has this font family, turn it off
    style.fontFamily = 'none';
  }

  if (style.series) style.fontSeries = style.series;

  if (style.fontSeries && everyStyle('fontSeries', style.fontSeries)) {
    // If the selection already has this series (weight), turn it off
    style.fontSeries = 'auto';
  }

  if (style.shape) style.fontShape = style.shape;

  if (style.fontShape && everyStyle('fontShape', style.fontShape)) {
    // If the selection already has this shape (italic), turn it off
    style.fontShape = 'auto';
  }

  if (style.size) style.fontSize = style.size;

  if (style.fontSize && everyStyle('fontSize', style.fontSize)) {
    // If the selection already has this size, reset it to default size
    style.fontSize = 'size5';
  }

  this.contentWillChange();
  this.forEachSelected(function (x) {
    return x.applyStyle(style);
  }, {
    recursive: true
  });
  this.contentDidChange();
};
/**
 * Attempts to parse and interpret a string in an unknown format, possibly
 * ASCIIMath and return a canonical LaTeX string.
 * 
 * The format recognized are one of these variations:
 * - ASCIIMath: Only supports a subset 
 * (1/2x)
 * 1/2sin x                     -> \frac {1}{2}\sin x
 * 1/2sinx                      -> \frac {1}{2}\sin x
 * (1/2sin x (x^(2+1))          // Unbalanced parentheses
 * (1/2sin(x^(2+1))             -> \left(\frac {1}{2}\sin \left(x^{2+1}\right)\right)
 * alpha + (pi)/(4)             -> \alpha +\frac {\pi }{4}
 * x=(-b +- sqrt(b^2 – 4ac))/(2a)
 * alpha/beta
 * sqrt2 + sqrtx + sqrt(1+a) + sqrt(1/2)
 * f(x) = x^2 "when" x >= 0
 * AA n in QQ
 * AA x in RR "," |x| > 0
 * AA x in RR "," abs(x) > 0
 * 
 * - UnicodeMath (generated by Microsoft Word): also only supports a subset
 *      - See https://www.unicode.org/notes/tn28/UTN28-PlainTextMath-v3.1.pdf
 * √(3&x+1)
 * {a+b/c}
 * [a+b/c]
 * _a^b x 
 * lim_(n->\infty) n
 * \iint_(a=0)^\infty  a
 *
 * - "JavaScript Latex": a variant that is LaTeX, but with escaped backslashes
 *  \\frac{1}{2} \\sin x
 * @param {string} s 
 */


function parseMathString(s, config) {
  if (!s) return ''; // Nothing to do if a single character

  if (s.length <= 1) return s; // Replace double-backslash (coming from JavaScript) to a single one

  if (!config || config.format !== 'ASCIIMath') {
    s = s.replace(/\\\\([^\s\n])/g, '\\$1');
  }

  if ((!config || config.format !== 'ASCIIMath') && /\\/.test(s)) {
    // If the string includes a '\' and a '{' or a '}'
    // it's probably a LaTeX string
    // (that's not completely true, it could be a UnicodeMath string, since
    // UnicodeMath supports some LaTeX commands. However, we need to pick
    // one in order to correctly interpret {} (which are argument delimiters
    // in LaTeX, and are fences in UnicodeMath)
    return s;
  }

  s = s.replace(/\u2061/g, ''); // Remove function application

  s = s.replace(/\u3016/g, '{'); // WHITE LENTICULAR BRACKET (grouping)

  s = s.replace(/\u3017/g, '}'); // WHITE LENTICULAR BRACKET (grouping)

  s = s.replace(/([^\\])sinx/g, '$1\\sin x'); // common typo

  s = s.replace(/([^\\])cosx/g, '$1\\cos x '); // common typo

  s = s.replace(/\u2013/g, '-'); // EN-DASH, sometimes used as a minus sign

  return parseMathExpression(s, config);
}

function parseMathExpression(s, config) {
  if (!s) return '';
  var done = false;
  var m;

  if (!done && (s[0] === '^' || s[0] === '_')) {
    // Superscript and subscript
    m = parseMathArgument(s.substr(1), _objectSpread({}, config, {
      noWrap: true
    }));
    s = s[0] + '{' + m.match + '}';
    s += parseMathExpression(m.rest, config);
    done = true;
  }

  if (!done) {
    m = s.match(/^(sqrt|\u221a)(.*)/);

    if (m) {
      // Square root
      m = parseMathArgument(m[2], _objectSpread({}, config, {
        noWrap: true
      }));
      s = '\\sqrt{' + m.match + '}';
      s += parseMathExpression(m.rest, config);
      done = true;
    }
  }

  if (!done) {
    m = s.match(/^(\\cbrt|\u221b)(.*)/);

    if (m) {
      // Cube root
      m = parseMathArgument(m[2], _objectSpread({}, config, {
        noWrap: true
      }));
      s = '\\sqrt[3]{' + m.match + '}';
      s += parseMathExpression(m.rest, config);
      done = true;
    }
  }

  if (!done) {
    m = s.match(/^abs(.*)/);

    if (m) {
      // Absolute value
      m = parseMathArgument(m[1], _objectSpread({}, config, {
        noWrap: true
      }));
      s = '\\left|' + m.match + '\\right|';
      s += parseMathExpression(m.rest, config);
      done = true;
    }
  }

  if (!done) {
    m = s.match(/^["”“](.*?)["”“](.*)/);

    if (m) {
      // Quoted text
      s = "\\text{" + m[1] + '}';
      s += parseMathExpression(m[2], config);
      done = true;
    }
  }

  if (!done) {
    m = s.match(/^([^a-zA-Z({[_^\\\s"]+)(.*)/); // A string of symbols...
    // Could be a binary or relational operator, etc...

    if (m) {
      s = paddedShortcut(m[1], config);
      s += parseMathExpression(m[2], config);
      done = true;
    }
  }

  if (!done && /^(f|g|h)[^a-zA-Z]/.test(s)) {
    // This could be a function...
    m = parseMathArgument(s.substring(1), config);
    s = s[0];
    s += m.match;
    s += parseMathExpression(m.rest, config);
    done = true;
  }

  if (!done) {
    m = s.match(/^([a-zA-Z]+)(.*)/);

    if (m) {
      // Some alphabetical string...
      // Could be a function name (sin) or symbol name (alpha)
      s = paddedShortcut(m[1], config);
      s += parseMathExpression(m[2], config);
      done = true;
    }
  }

  if (!done) {
    m = parseMathArgument(s, _objectSpread({}, config, {
      noWrap: true
    }));

    if (m.match && m.rest[0] === '/') {
      // Fraction
      var m2 = parseMathArgument(m.rest.substr(1), _objectSpread({}, config, {
        noWrap: true
      }));

      if (m2.match) {
        s = '\\frac{' + m.match + '}{' + m2.match + '}' + parseMathExpression(m2.rest, config);
      }

      done = true;
    } else if (m.match && /^(\(|\{|\[)$/.test(s[0])) {
      // A group
      s = '\\left' + s[0] + m.match + '\\right' + {
        '(': ')',
        '{': '}',
        '[': ']'
      }[s[0]] + parseMathExpression(m.rest, config);
      done = true;
    } else if (m.match) {
      s = m.match;
      s += parseMathExpression(m.rest, config);
      done = true;
    }
  }

  if (!done) {
    m = s.match(/^(\s+)(.*)$/); // Whitespace

    if (m) {
      s = ' ' + parseMathExpression(m[2], config);
      done = true;
    }
  }

  return s;
}
/**
 * Parse a math argument, as defined by ASCIIMath and UnicodeMath:
 * - Either an expression fenced in (), {} or []
 * - a number (- sign, digits, decimal point, digits)
 * - a single [a-zA-Z] letter (an identifier)
 * - a multi-letter shortcut (e.g., pi)
 * - a LaTeX command (\pi) (for UnicodeMath)
 * @param {string} s 
 * @return {object}
 * - match: the parsed (and converted) portion of the string that is an argument
 * - rest: the raw, unconverted, rest of the string
 */


function parseMathArgument(s, config) {
  var match = '';
  s = s.trim();
  var rest = s;
  var lFence = s.charAt(0);
  var rFence = {
    '(': ')',
    '{': '}',
    '[': ']'
  }[lFence];

  if (rFence) {
    // It's a fence
    var level = 1;
    var i = 1;

    while (i < s.length && level > 0) {
      if (s[i] === lFence) level++;
      if (s[i] === rFence) level--;
      i++;
    }

    if (level === 0) {
      // We've found the matching closing fence
      if (config.noWrap && lFence === '(' && rFence === ')') {
        match = parseMathExpression(s.substring(1, i - 1), config);
      } else {
        match = '\\mleft' + lFence + parseMathExpression(s.substring(1, i - 1), config) + '\\mright' + rFence;
      }

      rest = s.substring(i);
    } else {
      // Unbalanced fence...
      match = s.substring(1, i);
      rest = '';
    }
  } else {
    var m = s.match(/^([a-zA-Z]+)/);

    if (m) {
      // It's a string of letter, maybe a shortcut
      var shortcut = _editorShortcuts.default.forString('math', null, s, config);

      if (shortcut) {
        shortcut = shortcut.replace('_{#?}', '');
        shortcut = shortcut.replace('^{#?}', '');
        return {
          match: shortcut,
          rest: s.substring(shortcut.length)
        };
      }
    }

    m = s.match(/^([a-zA-Z])/);

    if (m) {
      // It's a single letter
      return {
        match: m[1],
        rest: s.substring(1)
      };
    }

    m = s.match(/^(-)?\d+(\.\d*)?/);

    if (m) {
      // It's a number
      return {
        match: m[0],
        rest: s.substring(m[0].length)
      };
    }

    if (!/^\\(left|right)/.test(s)) {
      // It's a LaTeX command (but not a \left\right)
      m = s.match(/^(\\[a-zA-Z]+)/);

      if (m) {
        rest = s.substring(m[1].length);
        match = m[1];
      }
    }
  }

  return {
    match: match,
    rest: rest
  };
}

function paddedShortcut(s, config) {
  var result = _editorShortcuts.default.forString('math', null, s, config);

  if (result) {
    result = result.replace('_{#?}', '');
    result = result.replace('^{#?}', '');
    result += ' ';
  } else {
    result = s;
  }

  return result;
}

function makeFirstAtom() {
  return new _mathAtom.default.MathAtom('', 'first');
}

var _default = {
  EditableMathlist: EditableMathlist,
  parseMathString: parseMathString
};
exports.default = _default;