"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default2 = {
  name: 'mathlive-mathfield',
  template: '<div class="mathfield" :id="id"><slot></slot></div>',
  props: {
    id: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    config: {
      type: Object,
      default: function _default() {
        return {};
      }
    },
    onKeystroke: {
      type: Function,
      default: function _default(_keystroke, _ev) {
        return true;
      }
    },
    onMoveOutOf: {
      type: Function,
      default: function _default(_direction) {
        return true;
      }
    },
    onTabOutOf: {
      type: Function,
      default: function _default(_direction) {
        return true;
      }
    }
  },

  /*
   * To register this component, call:
   * ```
   *     import MathLive from './mathlive.mjs';
   *     import Mathfield from './vue-mathlive.mjs';
   *     Vue.use(Mathfield, MathLive);
   * ```
   * 
   * The HTML tag for this component is `<mathlive-mathfield>`
   * 
   * @param {object} vue - This module, as returned from an import statement
   * @param {object} mathlive - The MathLive module, as returned from an import
   * statement
   */
  install: function install(vue, mathlive) {
    // When the component is installed (with Vue.use()), the first argument
    // should be the component (as received from import) and the second 
    // should be the MathLive module (also as received from import).
    // The MathLive module then gets stashed as a property of the Vue 
    // object to be accessed later by the component implementation.
    // This allows the user of the component to control which version of 
    // the MathLive module gets used.
    Object.defineProperty(vue.prototype, '$mathlive', {
      value: mathlive
    });
    vue.component('mathlive-mathfield', this);
  },
  watch: {
    value: function value(newValue, oldValue) {
      // When the `value` prop (from the model) is modified
      // update the mathfield to stay in sync, but don't send back content
      // change notifications, to avoid infinite loops.
      if (newValue !== oldValue) {
        this.$el.mathfield.$latex(newValue, {
          suppressChangeNotifications: true
        });
      }
    },
    config: {
      deep: true,
      handler: function handler(config) {
        this.$el.mathfield.$setConfig(config);
      }
    }
  },
  mounted: function mounted() {
    // A new instance is being created
    var vm = this; // Keep a reference to the ViewModel
    // Wait until the DOM has been constructed...

    this.$nextTick(function () {
      // ... then make the MathField
      vm.$mathlive.makeMathField(vm.$el, _objectSpread({}, vm.config, {
        // To support the 'model' directive, this handler will connect 
        // the content of the mathfield to the ViewModel
        onContentDidChange: function onContentDidChange(_) {
          // When the mathfield is updated, notify the model.
          // The initial input value is generated from the <slot>
          // content, so it may need to be updated.
          vm.$emit('input', vm.$el.mathfield.$latex());
        },
        // Those asynchronous notification handlers are translated to events
        onFocus: function onFocus(_) {
          vm.$emit('focus');
        },
        onBlur: function onBlur(_) {
          vm.$emit('blur');
        },
        onContentWillChange: function onContentWillChange(_) {
          vm.$emit('content-will-change');
        },
        onSelectionWillChange: function onSelectionWillChange(_) {
          vm.$emit('selection-will-change');
        },
        onUndoStateWillChange: function onUndoStateWillChange(_, command) {
          vm.$emit('undo-state-will-change', command);
        },
        onUndoStateDidChange: function onUndoStateDidChange(_, command) {
          vm.$emit('undo-state-did-change', command);
        },
        onVirtualKeyboardToggle: function onVirtualKeyboardToggle(_, visible, keyboardElement) {
          vm.$emit('virtual-keyboard-toggle', visible, keyboardElement);
        },
        onReadAloudStatus: function onReadAloudStatus(_, status) {
          vm.$emit('read-aloud-status', status);
        },
        // Those notification handlers expect an answer back, so translate
        // them to callbacks via props
        onKeystroke: function onKeystroke(_, keystroke, ev) {
          return vm.onKeystroke(keystroke, ev);
        },
        onMoveOutOf: function onMoveOutOf(_, direction) {
          return vm.onMoveOutOf(direction);
        },
        onTabOutOf: function onTabOutOf(_, direction) {
          return vm.onTabOutOf(direction);
        }
      }));
    });
  },
  methods: {
    /*
     * 
     * @param {string} selector 
     */
    perform: function perform(selector) {
      this.$el.mathfield.$perform(selector);
    },

    /*
     * @return {boolean}
     */
    hasFocus: function hasFocus() {
      return this.$el.mathfield.$hasFocus();
    },
    focus: function focus() {
      this.$el.mathfield.$focus();
    },
    blur: function blur() {
      this.$el.mathfield.$blur();
    },
    text: function text(format) {
      return this.$el.mathfield.$text(format);
    },
    selectedText: function selectedText(format) {
      return this.$el.mathfield.$selectedText(format);
    },
    insert: function insert(text, options) {
      this.$el.mathfield.$insert(text, options);
    },
    keystroke: function keystroke(keys, evt) {
      return this.$el.mathfield.$keystroke(keys, evt);
    },
    typedText: function typedText(text) {
      this.$el.mathfield.$keystroke(text);
    },
    selectionIsCollapsed: function selectionIsCollapsed() {
      return this.$el.mathfield.$selectionIsCollapsed();
    },
    selectionDepth: function selectionDepth() {
      return this.$el.mathfield.$selectionDepth();
    },
    selectionAtStart: function selectionAtStart() {
      return this.$el.mathfield.$selectionAtStart();
    },
    selectionAtEnd: function selectionAtEnd() {
      return this.$el.mathfield.$selectionAtEnd();
    },
    select: function select() {
      this.$el.mathfield.$select();
    },
    clearSelection: function clearSelection() {
      this.$el.mathfield.$clearSelection();
    }
  }
};
exports.default = _default2;