"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * @module editor/mathpath
 * @private
 */

/**
 * 
 * @memberof module:editor/mathpath
 * @param {object} path 
 * @param {number} extent
 * @return {string}
 * @private
 */
function pathToString(path, extent) {
  var result = '';
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = path[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var segment = _step.value;
      result += segment.relation + ':' + segment.offset + '/';
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

  if (extent) {
    result += '#' + extent;
  }

  return result;
}
/**
 * 
 * @memberof module:editor/mathpath
 * @param {string} string 
 * @return {object}
 * @private
 */


function pathFromString(string) {
  // Reset the path
  var result = {
    path: [],
    extent: 0
  }; // Parse the selection extent, if present

  var components = string.split('#');

  if (components.length > 1) {
    result.extent = parseInt(components[1]);
  } // Parse the segments


  var segments = components[0].split('/');
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = segments[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var segment = _step2.value;
      var m2 = segment.match(/([^:]*):(.*)/);

      if (m2) {
        result.path.push({
          relation: m2[1],
          offset: parseInt(m2[2])
        });
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
 * Given two paths, return a path representing their common ancestor.
 * 
 * @param {Array.<string>} p 
 * @param {Array.<string>} q 
 * @return {Array.<string>}
 * @memberof module:editor/mathpath
 * @private
 */


function pathCommonAncestor(p, q) {
  var result = [];
  var maxIndex = Math.min(p.length - 1, q.length - 1);
  var i = 0;

  while (i <= maxIndex && p[i].relation === q[i].relation && p[i].offset === q[i].offset) {
    result.push(p[i]);
    i += 1;
  }

  return result;
}
/**
 * 
 * @param {Array.<string>} p 
 * @param {Array.<string>} q 
 * @return {number} 0 if the paths are identical
 *  - 1 if they are siblings
 *  - >1 if they are not siblings
 * @memberof module:editor/mathpath
 * @private
 */


function pathDistance(p, q) {
  var result = 0;
  var i = -1;
  var done = false;

  while (!done) {
    i += 1;
    done = i >= p.length || i >= q.length;
    done = done || !(p[i].relation === q[i].relation && p[i].offset === q[i].offset);
  }

  if (i === p.length && i === q.length) {
    // They're identical
    result = 0;
  } else if (i + 1 === p.length && i + 1 === q.length && p[i].relation === q[i].relation) {
    // They're siblings
    result = 1;
  } else {
    result = 2;
  }

  return result;
}

function clone(path) {
  return pathFromString(pathToString(path)).path;
}

var _default = {
  pathFromString: pathFromString,
  pathToString: pathToString,
  pathDistance: pathDistance,
  pathCommonAncestor: pathCommonAncestor,
  clone: clone
};
exports.default = _default;