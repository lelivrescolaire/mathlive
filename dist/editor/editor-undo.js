"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 *
 * @class UndoManager
 * @property {MathAtom[]} mathlist
 * @property {object[]} stack Stack of undo/redo states
 * @property {number} index Index pointing to the undo/redo stack
 * @property {number} maximumDepth Maximum number of undo/redo states
 * @global
 * @private
 */
var UndoManager =
/*#__PURE__*/
function () {
  function UndoManager(mathlist) {
    _classCallCheck(this, UndoManager);

    this.mathlist = mathlist;
    this.maximumDepth = 1000;
    this.record = false;
    this.canCoalesce = false;
    this.reset();
  }

  _createClass(UndoManager, [{
    key: "reset",
    value: function reset() {
      this.stack = [];
      this.index = -1;
    }
  }, {
    key: "startRecording",
    value: function startRecording() {
      this.record = true;
    }
    /**
     *
     * @return {boolean}
     * @memberof UndoManager
     * @instance
     * @private
     */

  }, {
    key: "canUndo",
    value: function canUndo() {
      return this.index > 0;
    }
    /**
     *
     * @return {boolean}
     * @memberof UndoManager
     * @instance
     * @private
     */

  }, {
    key: "canRedo",
    value: function canRedo() {
      return this.index !== this.stack.length - 1;
    }
    /**
     *
     * @memberof UndoManager
     * @instance
     * @private
     */

  }, {
    key: "undo",
    value: function undo(options) {
      if (this.canUndo()) {
        if (options && typeof options.onUndoStateWillChange === 'function') {
          options.onUndoStateWillChange(this.mathlist.target, 'undo');
        }

        this.restore(this.stack[this.index - 1], options);
        this.index -= 1;

        if (options && typeof options.onUndoStateDidChange === 'function') {
          options.onUndoStateDidChange(this.mathlist.target, 'undo');
        }

        this.canCoalesce = false;
      }
    }
    /**
     *
     * @memberof UndoManager
     * @instance
     * @private
     */

  }, {
    key: "redo",
    value: function redo(options) {
      if (this.canRedo()) {
        if (options && options.onUndoStateWillChange === 'function') {
          options.onUndoStateWillChange(this.mathlist.target, 'redo');
        }

        this.index += 1;
        this.restore(this.stack[this.index], options);

        if (options && typeof options.onUndoStateDidChange === 'function') {
          options.onUndoStateDidChange(this.mathlist.target, 'redo');
        }

        this.canCoalesce = false;
      }
    }
    /**
     * 
     * @memberof UndoManager
     * @instance
     * @private
     */

  }, {
    key: "pop",
    value: function pop() {
      if (this.canUndo()) {
        this.index -= 1;
        this.stack.pop();
      }
    }
    /**
     * Push a snapshot of the content and selection of the math field onto the
     * undo stack so that it can potentially be reverted to later.
     * @memberof UndoManager
     * @instance
     * @private
     */

  }, {
    key: "snapshot",
    value: function snapshot(options) {
      if (!this.record) return;

      if (options && options.onUndoStateWillChange === 'function') {
        options.onUndoStateWillChange(this.mathlist.target, 'snapshot');
      } // Drop any entries that are part of the redo stack


      this.stack.splice(this.index + 1, this.stack.length - this.index - 1); // Add a new entry

      this.stack.push({
        latex: this.mathlist.root.toLatex(),
        selection: this.mathlist.toString()
      });
      this.index++; // If we've reached the maximum number of undo operations, forget the 
      // oldest one.

      if (this.stack.length > this.maximumDepth) {
        this.stack.shift();
      }

      if (options && typeof options.onUndoStateDidChange === 'function') {
        options.onUndoStateDidChange(this.mathlist.target, 'snapshot');
      }

      this.canCoalesce = false;
    }
    /**
     * 
     * @param {Object.<any>} options 
     */

  }, {
    key: "snapshotAndCoalesce",
    value: function snapshotAndCoalesce(options) {
      if (this.canCoalesce) {
        this.pop();
      }

      this.snapshot(options);
      this.canCoalesce = true;
    }
    /**
     * Return an object capturing the state of the content and selection of the
     * math field. Pass this object to restore() to reset the value of the math
     * field to this saved value. This does not affect the undo stack.
    */

  }, {
    key: "save",
    value: function save() {
      return {
        latex: this.mathlist.root.toLatex(),
        selection: this.mathlist.toString()
      };
    }
    /**
     * Set the content and selection of the math field to a value previously
     * captured with save() or stored in the undo stack.
     * This does not affect the undo stack.
    */

  }, {
    key: "restore",
    value: function restore(state, options) {
      var wasSuppressing = this.mathlist.suppressChangeNotifications;

      if (options.suppressChangeNotifications !== undefined) {
        this.mathlist.suppressChangeNotifications = options.suppressChangeNotifications;
      } // Restore the content


      this.mathlist.insert(state ? state.latex : '', _objectSpread({
        mode: 'math',
        insertionMode: 'replaceAll',
        selectionMode: 'after',
        format: 'latex'
      }, options)); // Restore the selection

      this.mathlist.setPath(state ? state.selection : [{
        relation: 'body',
        offset: 0
      }]);
      this.mathlist.suppressChangeNotifications = wasSuppressing;
    }
  }]);

  return UndoManager;
}();

var _default = {
  UndoManager: UndoManager
};
exports.default = _default;