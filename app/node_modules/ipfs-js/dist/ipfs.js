(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ipfs = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (Buffer){
var ipfsApi;

try {
  ipfsApi  = require('ipfs-api/dist/ipfsapi.min.js');
} catch(e) {}

var base58   = require('bitcore/lib/encoding/base58.js');
var concat   = require('concat-stream');

var ipfs = {};

ipfs.currentProvider = {host: null, port: null};
ipfs.defaultProvider = {host: 'localhost', port: '5001'};
ipfs.api = null;

ipfs.setProvider = function(opts) {
  if (!opts) opts = this.defaultProvider;
  if (typeof opts === 'object' && !opts.hasOwnProperty('host')) {
    ipfs.api = opts;
    return;
  }

  ipfs.currentProvider = opts;
  ipfs.api = ipfsApi(opts.host, opts.port);
};

ipfs.utils = {};

ipfs.utils.base58ToHex = function(b58) {
  var hexBuf = base58.decode(b58);
  return hexBuf.toString('hex');
};

ipfs.utils.hexToBase58 = function(hexStr) {
  var buf = new Buffer(hexStr, 'hex');
  return base58.encode(buf);
};

ipfs.add = function(input, callback) {

  var buf;
  if (typeof input === 'string') {
    buf = new Buffer(input);
  }
  else {
    buf = input;
  }

  ipfs.api.add(buf, function (err, ret) {
    if (err) callback(err, null);
    else callback(null, ret[0] ? ret[0].Hash : ret.Hash);
  });
};

ipfs.catText = function(ipfsHash, callback) {
  ipfs.cat(ipfsHash, function(err, data) {
    if (ipfs.api.Buffer.isBuffer(data))
      data = data.toString();
    callback(err, data);
  });
}

ipfs.cat = function(ipfsHash, callback) {
  ipfs.api.cat(ipfsHash, function(err, res) {
    if (err || !res) return callback(err, null);

    var gotIpfsData = function (ipfsData) {
      callback(err, ipfsData);
    };

    var concatStream = concat(gotIpfsData);

    if(res.readable) {
      // Returned as a stream
      res.pipe(concatStream);
    } else {

      if (!ipfs.api.Buffer.isBuffer(res)) {

        if (typeof res === 'object')
          res = JSON.stringify(res);

        if (typeof res !== 'string')
          throw new Error("ipfs.cat response type not recognized; expecting string, buffer, or object");

        res = new ipfs.api.Buffer(res, 'binary');
      }

      // Returned as a string
      callback(err, res);
    }
  });
};

ipfs.addJson = function(jsonObject, callback) {
  var jsonString = JSON.stringify(jsonObject);
  ipfs.add(jsonString, callback);
};

ipfs.catJson = function(ipfsHash, callback) {
  ipfs.catText(ipfsHash, function (err, jsonString) {
    if (err) callback(err, {});

    var jsonObject = {};
    try {
      jsonObject = typeof jsonString === 'string' ?  JSON.parse(jsonString) : jsonString;
    } catch (e) {
      err = e;
    }
    callback(err, jsonObject);
  });
};

module.exports = ipfs;

}).call(this,require("buffer").Buffer)
},{"bitcore/lib/encoding/base58.js":2,"buffer":6,"concat-stream":13,"ipfs-api/dist/ipfsapi.min.js":27}],2:[function(require,module,exports){
(function (Buffer){
'use strict';

var _ = require('lodash');
var bs58 = require('bs58');
var buffer = require('buffer');

var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('');

var Base58 = function Base58(obj) {
  /* jshint maxcomplexity: 8 */
  if (!(this instanceof Base58)) {
    return new Base58(obj);
  }
  if (Buffer.isBuffer(obj)) {
    var buf = obj;
    this.fromBuffer(buf);
  } else if (typeof obj === 'string') {
    var str = obj;
    this.fromString(str);
  } else if (obj) {
    this.set(obj);
  }
};

Base58.validCharacters = function validCharacters(chars) {
  if (buffer.Buffer.isBuffer(chars)) {
    chars = chars.toString();
  }
  return _.all(_.map(chars, function(char) { return _.contains(ALPHABET, char); }));
};

Base58.prototype.set = function(obj) {
  this.buf = obj.buf || this.buf || undefined;
  return this;
};

Base58.encode = function(buf) {
  if (!buffer.Buffer.isBuffer(buf)) {
    throw new Error('Input should be a buffer');
  }
  return bs58.encode(buf);
};

Base58.decode = function(str) {
  if (typeof str !== 'string') {
    throw new Error('Input should be a string');
  }
  return new Buffer(bs58.decode(str));
};

Base58.prototype.fromBuffer = function(buf) {
  this.buf = buf;
  return this;
};

Base58.prototype.fromString = function(str) {
  var buf = Base58.decode(str);
  this.buf = buf;
  return this;
};

Base58.prototype.toBuffer = function() {
  return this.buf;
};

Base58.prototype.toString = function() {
  return Base58.encode(this.buf);
};

module.exports = Base58;

}).call(this,require("buffer").Buffer)
},{"bs58":3,"buffer":6,"lodash":4}],3:[function(require,module,exports){
// Base58 encoding/decoding
// Originally written by Mike Hearn for BitcoinJ
// Copyright (c) 2011 Google Inc
// Ported to JavaScript by Stefan Thomas
// Merged Buffer refactorings from base58-native by Stephen Pair
// Copyright (c) 2013 BitPay Inc

var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
var ALPHABET_MAP = {}
for(var i = 0; i < ALPHABET.length; i++) {
  ALPHABET_MAP[ALPHABET.charAt(i)] = i
}
var BASE = 58

function encode(buffer) {
  if (buffer.length === 0) return ''

  var i, j, digits = [0]
  for (i = 0; i < buffer.length; i++) {
    for (j = 0; j < digits.length; j++) digits[j] <<= 8

    digits[0] += buffer[i]

    var carry = 0
    for (j = 0; j < digits.length; ++j) {
      digits[j] += carry

      carry = (digits[j] / BASE) | 0
      digits[j] %= BASE
    }

    while (carry) {
      digits.push(carry % BASE)

      carry = (carry / BASE) | 0
    }
  }

  // deal with leading zeros
  for (i = 0; buffer[i] === 0 && i < buffer.length - 1; i++) digits.push(0)

  return digits.reverse().map(function(digit) { return ALPHABET[digit] }).join('')
}

function decode(string) {
  if (string.length === 0) return []

  var i, j, bytes = [0]
  for (i = 0; i < string.length; i++) {
    var c = string[i]
    if (!(c in ALPHABET_MAP)) throw new Error('Non-base58 character')

    for (j = 0; j < bytes.length; j++) bytes[j] *= BASE
    bytes[0] += ALPHABET_MAP[c]

    var carry = 0
    for (j = 0; j < bytes.length; ++j) {
      bytes[j] += carry

      carry = bytes[j] >> 8
      bytes[j] &= 0xff
    }

    while (carry) {
      bytes.push(carry & 0xff)

      carry >>= 8
    }
  }

  // deal with leading zeros
  for (i = 0; string[i] === '1' && i < string.length - 1; i++) bytes.push(0)

  return bytes.reverse()
}

module.exports = {
  encode: encode,
  decode: decode
}

},{}],4:[function(require,module,exports){
(function (global){
/**
 * @license
 * lodash 3.10.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern -d -o ./index.js`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre-ES5 environments. */
  var undefined;

  /** Used as the semantic version number. */
  var VERSION = '3.10.1';

  /** Used to compose bitmasks for wrapper metadata. */
  var BIND_FLAG = 1,
      BIND_KEY_FLAG = 2,
      CURRY_BOUND_FLAG = 4,
      CURRY_FLAG = 8,
      CURRY_RIGHT_FLAG = 16,
      PARTIAL_FLAG = 32,
      PARTIAL_RIGHT_FLAG = 64,
      ARY_FLAG = 128,
      REARG_FLAG = 256;

  /** Used as default options for `_.trunc`. */
  var DEFAULT_TRUNC_LENGTH = 30,
      DEFAULT_TRUNC_OMISSION = '...';

  /** Used to detect when a function becomes hot. */
  var HOT_COUNT = 150,
      HOT_SPAN = 16;

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE = 200;

  /** Used to indicate the type of lazy iteratees. */
  var LAZY_FILTER_FLAG = 1,
      LAZY_MAP_FLAG = 2;

  /** Used as the `TypeError` message for "Functions" methods. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /** Used as the internal argument placeholder. */
  var PLACEHOLDER = '__lodash_placeholder__';

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag = '[object Function]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /** Used to match empty string literals in compiled template source. */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /** Used to match HTML entities and HTML characters. */
  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39|#96);/g,
      reUnescapedHtml = /[&<>"'`]/g,
      reHasEscapedHtml = RegExp(reEscapedHtml.source),
      reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

  /** Used to match template delimiters. */
  var reEscape = /<%-([\s\S]+?)%>/g,
      reEvaluate = /<%([\s\S]+?)%>/g,
      reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match property names within property paths. */
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
      reIsPlainProp = /^\w*$/,
      rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;

  /**
   * Used to match `RegExp` [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns)
   * and those outlined by [`EscapeRegExpPattern`](http://ecma-international.org/ecma-262/6.0/#sec-escaperegexppattern).
   */
  var reRegExpChars = /^[:!,]|[\\^$.*+?()[\]{}|\/]|(^[0-9a-fA-Fnrtuvx])|([\n\r\u2028\u2029])/g,
      reHasRegExpChars = RegExp(reRegExpChars.source);

  /** Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks). */
  var reComboMark = /[\u0300-\u036f\ufe20-\ufe23]/g;

  /** Used to match backslashes in property paths. */
  var reEscapeChar = /\\(\\)?/g;

  /** Used to match [ES template delimiters](http://ecma-international.org/ecma-262/6.0/#sec-template-literal-lexical-components). */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match `RegExp` flags from their coerced string values. */
  var reFlags = /\w*$/;

  /** Used to detect hexadecimal string values. */
  var reHasHexPrefix = /^0[xX]/;

  /** Used to detect host constructors (Safari > 5). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^\d+$/;

  /** Used to match latin-1 supplementary letters (excluding mathematical operators). */
  var reLatin1 = /[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g;

  /** Used to ensure capturing order of template delimiters. */
  var reNoMatch = /($^)/;

  /** Used to match unescaped characters in compiled string literals. */
  var reUnescapedString = /['\n\r\u2028\u2029\\]/g;

  /** Used to match words to create compound words. */
  var reWords = (function() {
    var upper = '[A-Z\\xc0-\\xd6\\xd8-\\xde]',
        lower = '[a-z\\xdf-\\xf6\\xf8-\\xff]+';

    return RegExp(upper + '+(?=' + upper + lower + ')|' + upper + '?' + lower + '|' + upper + '+|[0-9]+', 'g');
  }());

  /** Used to assign default `context` object properties. */
  var contextProps = [
    'Array', 'ArrayBuffer', 'Date', 'Error', 'Float32Array', 'Float64Array',
    'Function', 'Int8Array', 'Int16Array', 'Int32Array', 'Math', 'Number',
    'Object', 'RegExp', 'Set', 'String', '_', 'clearTimeout', 'isFinite',
    'parseFloat', 'parseInt', 'setTimeout', 'TypeError', 'Uint8Array',
    'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'WeakMap'
  ];

  /** Used to make template sourceURLs easier to identify. */
  var templateCounter = -1;

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
  typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
  typedArrayTags[dateTag] = typedArrayTags[errorTag] =
  typedArrayTags[funcTag] = typedArrayTags[mapTag] =
  typedArrayTags[numberTag] = typedArrayTags[objectTag] =
  typedArrayTags[regexpTag] = typedArrayTags[setTag] =
  typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

  /** Used to identify `toStringTag` values supported by `_.clone`. */
  var cloneableTags = {};
  cloneableTags[argsTag] = cloneableTags[arrayTag] =
  cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
  cloneableTags[dateTag] = cloneableTags[float32Tag] =
  cloneableTags[float64Tag] = cloneableTags[int8Tag] =
  cloneableTags[int16Tag] = cloneableTags[int32Tag] =
  cloneableTags[numberTag] = cloneableTags[objectTag] =
  cloneableTags[regexpTag] = cloneableTags[stringTag] =
  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag] = cloneableTags[funcTag] =
  cloneableTags[mapTag] = cloneableTags[setTag] =
  cloneableTags[weakMapTag] = false;

  /** Used to map latin-1 supplementary letters to basic latin letters. */
  var deburredLetters = {
    '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
    '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
    '\xc7': 'C',  '\xe7': 'c',
    '\xd0': 'D',  '\xf0': 'd',
    '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
    '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
    '\xcC': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
    '\xeC': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
    '\xd1': 'N',  '\xf1': 'n',
    '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
    '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
    '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
    '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
    '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
    '\xc6': 'Ae', '\xe6': 'ae',
    '\xde': 'Th', '\xfe': 'th',
    '\xdf': 'ss'
  };

  /** Used to map characters to HTML entities. */
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
  };

  /** Used to map HTML entities to characters. */
  var htmlUnescapes = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#96;': '`'
  };

  /** Used to determine if values are of the language type `Object`. */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Used to escape characters for inclusion in compiled regexes. */
  var regexpEscapes = {
    '0': 'x30', '1': 'x31', '2': 'x32', '3': 'x33', '4': 'x34',
    '5': 'x35', '6': 'x36', '7': 'x37', '8': 'x38', '9': 'x39',
    'A': 'x41', 'B': 'x42', 'C': 'x43', 'D': 'x44', 'E': 'x45', 'F': 'x46',
    'a': 'x61', 'b': 'x62', 'c': 'x63', 'd': 'x64', 'e': 'x65', 'f': 'x66',
    'n': 'x6e', 'r': 'x72', 't': 'x74', 'u': 'x75', 'v': 'x76', 'x': 'x78'
  };

  /** Used to escape characters for inclusion in compiled string literals. */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Detect free variable `exports`. */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global && global.Object && global;

  /** Detect free variable `self`. */
  var freeSelf = objectTypes[typeof self] && self && self.Object && self;

  /** Detect free variable `window`. */
  var freeWindow = objectTypes[typeof window] && window && window.Object && window;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /**
   * Used as a reference to the global object.
   *
   * The `this` value is used if it's the global object to avoid Greasemonkey's
   * restricted `window` object, otherwise the `window` object is used.
   */
  var root = freeGlobal || ((freeWindow !== (this && this.window)) && freeWindow) || freeSelf || this;

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `compareAscending` which compares values and
   * sorts them in ascending order without guaranteeing a stable sort.
   *
   * @private
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {number} Returns the sort order indicator for `value`.
   */
  function baseCompareAscending(value, other) {
    if (value !== other) {
      var valIsNull = value === null,
          valIsUndef = value === undefined,
          valIsReflexive = value === value;

      var othIsNull = other === null,
          othIsUndef = other === undefined,
          othIsReflexive = other === other;

      if ((value > other && !othIsNull) || !valIsReflexive ||
          (valIsNull && !othIsUndef && othIsReflexive) ||
          (valIsUndef && othIsReflexive)) {
        return 1;
      }
      if ((value < other && !valIsNull) || !othIsReflexive ||
          (othIsNull && !valIsUndef && valIsReflexive) ||
          (othIsUndef && valIsReflexive)) {
        return -1;
      }
    }
    return 0;
  }

  /**
   * The base implementation of `_.findIndex` and `_.findLastIndex` without
   * support for callback shorthands and `this` binding.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {Function} predicate The function invoked per iteration.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function baseFindIndex(array, predicate, fromRight) {
    var length = array.length,
        index = fromRight ? length : -1;

    while ((fromRight ? index-- : ++index < length)) {
      if (predicate(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  }

  /**
   * The base implementation of `_.indexOf` without support for binary searches.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    if (value !== value) {
      return indexOfNaN(array, fromIndex);
    }
    var index = fromIndex - 1,
        length = array.length;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * The base implementation of `_.isFunction` without support for environments
   * with incorrect `typeof` results.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   */
  function baseIsFunction(value) {
    // Avoid a Chakra JIT bug in compatibility modes of IE 11.
    // See https://github.com/jashkenas/underscore/issues/1621 for more details.
    return typeof value == 'function' || false;
  }

  /**
   * Converts `value` to a string if it's not one. An empty string is returned
   * for `null` or `undefined` values.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   */
  function baseToString(value) {
    return value == null ? '' : (value + '');
  }

  /**
   * Used by `_.trim` and `_.trimLeft` to get the index of the first character
   * of `string` that is not found in `chars`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @param {string} chars The characters to find.
   * @returns {number} Returns the index of the first character not found in `chars`.
   */
  function charsLeftIndex(string, chars) {
    var index = -1,
        length = string.length;

    while (++index < length && chars.indexOf(string.charAt(index)) > -1) {}
    return index;
  }

  /**
   * Used by `_.trim` and `_.trimRight` to get the index of the last character
   * of `string` that is not found in `chars`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @param {string} chars The characters to find.
   * @returns {number} Returns the index of the last character not found in `chars`.
   */
  function charsRightIndex(string, chars) {
    var index = string.length;

    while (index-- && chars.indexOf(string.charAt(index)) > -1) {}
    return index;
  }

  /**
   * Used by `_.sortBy` to compare transformed elements of a collection and stable
   * sort them in ascending order.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @returns {number} Returns the sort order indicator for `object`.
   */
  function compareAscending(object, other) {
    return baseCompareAscending(object.criteria, other.criteria) || (object.index - other.index);
  }

  /**
   * Used by `_.sortByOrder` to compare multiple properties of a value to another
   * and stable sort them.
   *
   * If `orders` is unspecified, all valuess are sorted in ascending order. Otherwise,
   * a value is sorted in ascending order if its corresponding order is "asc", and
   * descending if "desc".
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {boolean[]} orders The order to sort by for each property.
   * @returns {number} Returns the sort order indicator for `object`.
   */
  function compareMultiple(object, other, orders) {
    var index = -1,
        objCriteria = object.criteria,
        othCriteria = other.criteria,
        length = objCriteria.length,
        ordersLength = orders.length;

    while (++index < length) {
      var result = baseCompareAscending(objCriteria[index], othCriteria[index]);
      if (result) {
        if (index >= ordersLength) {
          return result;
        }
        var order = orders[index];
        return result * ((order === 'asc' || order === true) ? 1 : -1);
      }
    }
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
    // that causes it, under certain circumstances, to provide the same value for
    // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
    // for more details.
    //
    // This also ensures a stable sort in V8 and other engines.
    // See https://code.google.com/p/v8/issues/detail?id=90 for more details.
    return object.index - other.index;
  }

  /**
   * Used by `_.deburr` to convert latin-1 supplementary letters to basic latin letters.
   *
   * @private
   * @param {string} letter The matched letter to deburr.
   * @returns {string} Returns the deburred letter.
   */
  function deburrLetter(letter) {
    return deburredLetters[letter];
  }

  /**
   * Used by `_.escape` to convert characters to HTML entities.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeHtmlChar(chr) {
    return htmlEscapes[chr];
  }

  /**
   * Used by `_.escapeRegExp` to escape characters for inclusion in compiled regexes.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @param {string} leadingChar The capture group for a leading character.
   * @param {string} whitespaceChar The capture group for a whitespace character.
   * @returns {string} Returns the escaped character.
   */
  function escapeRegExpChar(chr, leadingChar, whitespaceChar) {
    if (leadingChar) {
      chr = regexpEscapes[chr];
    } else if (whitespaceChar) {
      chr = stringEscapes[chr];
    }
    return '\\' + chr;
  }

  /**
   * Used by `_.template` to escape characters for inclusion in compiled string literals.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(chr) {
    return '\\' + stringEscapes[chr];
  }

  /**
   * Gets the index at which the first occurrence of `NaN` is found in `array`.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {number} fromIndex The index to search from.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {number} Returns the index of the matched `NaN`, else `-1`.
   */
  function indexOfNaN(array, fromIndex, fromRight) {
    var length = array.length,
        index = fromIndex + (fromRight ? 0 : -1);

    while ((fromRight ? index-- : ++index < length)) {
      var other = array[index];
      if (other !== other) {
        return index;
      }
    }
    return -1;
  }

  /**
   * Checks if `value` is object-like.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   */
  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }

  /**
   * Used by `trimmedLeftIndex` and `trimmedRightIndex` to determine if a
   * character code is whitespace.
   *
   * @private
   * @param {number} charCode The character code to inspect.
   * @returns {boolean} Returns `true` if `charCode` is whitespace, else `false`.
   */
  function isSpace(charCode) {
    return ((charCode <= 160 && (charCode >= 9 && charCode <= 13) || charCode == 32 || charCode == 160) || charCode == 5760 || charCode == 6158 ||
      (charCode >= 8192 && (charCode <= 8202 || charCode == 8232 || charCode == 8233 || charCode == 8239 || charCode == 8287 || charCode == 12288 || charCode == 65279)));
  }

  /**
   * Replaces all `placeholder` elements in `array` with an internal placeholder
   * and returns an array of their indexes.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {*} placeholder The placeholder to replace.
   * @returns {Array} Returns the new array of placeholder indexes.
   */
  function replaceHolders(array, placeholder) {
    var index = -1,
        length = array.length,
        resIndex = -1,
        result = [];

    while (++index < length) {
      if (array[index] === placeholder) {
        array[index] = PLACEHOLDER;
        result[++resIndex] = index;
      }
    }
    return result;
  }

  /**
   * An implementation of `_.uniq` optimized for sorted arrays without support
   * for callback shorthands and `this` binding.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {Function} [iteratee] The function invoked per iteration.
   * @returns {Array} Returns the new duplicate-value-free array.
   */
  function sortedUniq(array, iteratee) {
    var seen,
        index = -1,
        length = array.length,
        resIndex = -1,
        result = [];

    while (++index < length) {
      var value = array[index],
          computed = iteratee ? iteratee(value, index, array) : value;

      if (!index || seen !== computed) {
        seen = computed;
        result[++resIndex] = value;
      }
    }
    return result;
  }

  /**
   * Used by `_.trim` and `_.trimLeft` to get the index of the first non-whitespace
   * character of `string`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the index of the first non-whitespace character.
   */
  function trimmedLeftIndex(string) {
    var index = -1,
        length = string.length;

    while (++index < length && isSpace(string.charCodeAt(index))) {}
    return index;
  }

  /**
   * Used by `_.trim` and `_.trimRight` to get the index of the last non-whitespace
   * character of `string`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the index of the last non-whitespace character.
   */
  function trimmedRightIndex(string) {
    var index = string.length;

    while (index-- && isSpace(string.charCodeAt(index))) {}
    return index;
  }

  /**
   * Used by `_.unescape` to convert HTML entities to characters.
   *
   * @private
   * @param {string} chr The matched character to unescape.
   * @returns {string} Returns the unescaped character.
   */
  function unescapeHtmlChar(chr) {
    return htmlUnescapes[chr];
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new pristine `lodash` function using the given `context` object.
   *
   * @static
   * @memberOf _
   * @category Utility
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns a new `lodash` function.
   * @example
   *
   * _.mixin({ 'foo': _.constant('foo') });
   *
   * var lodash = _.runInContext();
   * lodash.mixin({ 'bar': lodash.constant('bar') });
   *
   * _.isFunction(_.foo);
   * // => true
   * _.isFunction(_.bar);
   * // => false
   *
   * lodash.isFunction(lodash.foo);
   * // => false
   * lodash.isFunction(lodash.bar);
   * // => true
   *
   * // using `context` to mock `Date#getTime` use in `_.now`
   * var mock = _.runInContext({
   *   'Date': function() {
   *     return { 'getTime': getTimeMock };
   *   }
   * });
   *
   * // or creating a suped-up `defer` in Node.js
   * var defer = _.runInContext({ 'setTimeout': setImmediate }).defer;
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See https://es5.github.io/#x11.1.5 for more details.
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

    /** Native constructor references. */
    var Array = context.Array,
        Date = context.Date,
        Error = context.Error,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /** Used for native method references. */
    var arrayProto = Array.prototype,
        objectProto = Object.prototype,
        stringProto = String.prototype;

    /** Used to resolve the decompiled source of functions. */
    var fnToString = Function.prototype.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /** Used to generate unique IDs. */
    var idCounter = 0;

    /**
     * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objToString = objectProto.toString;

    /** Used to restore the original `_` reference in `_.noConflict`. */
    var oldDash = root._;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /** Native method references. */
    var ArrayBuffer = context.ArrayBuffer,
        clearTimeout = context.clearTimeout,
        parseFloat = context.parseFloat,
        pow = Math.pow,
        propertyIsEnumerable = objectProto.propertyIsEnumerable,
        Set = getNative(context, 'Set'),
        setTimeout = context.setTimeout,
        splice = arrayProto.splice,
        Uint8Array = context.Uint8Array,
        WeakMap = getNative(context, 'WeakMap');

    /* Native method references for those with the same name as other `lodash` methods. */
    var nativeCeil = Math.ceil,
        nativeCreate = getNative(Object, 'create'),
        nativeFloor = Math.floor,
        nativeIsArray = getNative(Array, 'isArray'),
        nativeIsFinite = context.isFinite,
        nativeKeys = getNative(Object, 'keys'),
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeNow = getNative(Date, 'now'),
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Used as references for `-Infinity` and `Infinity`. */
    var NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY,
        POSITIVE_INFINITY = Number.POSITIVE_INFINITY;

    /** Used as references for the maximum length and index of an array. */
    var MAX_ARRAY_LENGTH = 4294967295,
        MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1,
        HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;

    /**
     * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
     * of an array-like value.
     */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /** Used to store function metadata. */
    var metaMap = WeakMap && new WeakMap;

    /** Used to lookup unminified function names. */
    var realNames = {};

    /*------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps `value` to enable implicit chaining.
     * Methods that operate on and return arrays, collections, and functions can
     * be chained together. Methods that retrieve a single value or may return a
     * primitive value will automatically end the chain returning the unwrapped
     * value. Explicit chaining may be enabled using `_.chain`. The execution of
     * chained methods is lazy, that is, execution is deferred until `_#value`
     * is implicitly or explicitly called.
     *
     * Lazy evaluation allows several methods to support shortcut fusion. Shortcut
     * fusion is an optimization strategy which merge iteratee calls; this can help
     * to avoid the creation of intermediate data structures and greatly reduce the
     * number of iteratee executions.
     *
     * Chaining is supported in custom builds as long as the `_#value` method is
     * directly or indirectly included in the build.
     *
     * In addition to lodash methods, wrappers have `Array` and `String` methods.
     *
     * The wrapper `Array` methods are:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`,
     * `splice`, and `unshift`
     *
     * The wrapper `String` methods are:
     * `replace` and `split`
     *
     * The wrapper methods that support shortcut fusion are:
     * `compact`, `drop`, `dropRight`, `dropRightWhile`, `dropWhile`, `filter`,
     * `first`, `initial`, `last`, `map`, `pluck`, `reject`, `rest`, `reverse`,
     * `slice`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, `toArray`,
     * and `where`
     *
     * The chainable wrapper methods are:
     * `after`, `ary`, `assign`, `at`, `before`, `bind`, `bindAll`, `bindKey`,
     * `callback`, `chain`, `chunk`, `commit`, `compact`, `concat`, `constant`,
     * `countBy`, `create`, `curry`, `debounce`, `defaults`, `defaultsDeep`,
     * `defer`, `delay`, `difference`, `drop`, `dropRight`, `dropRightWhile`,
     * `dropWhile`, `fill`, `filter`, `flatten`, `flattenDeep`, `flow`, `flowRight`,
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
     * `invoke`, `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`,
     * `matchesProperty`, `memoize`, `merge`, `method`, `methodOf`, `mixin`,
     * `modArgs`, `negate`, `omit`, `once`, `pairs`, `partial`, `partialRight`,
     * `partition`, `pick`, `plant`, `pluck`, `property`, `propertyOf`, `pull`,
     * `pullAt`, `push`, `range`, `rearg`, `reject`, `remove`, `rest`, `restParam`,
     * `reverse`, `set`, `shuffle`, `slice`, `sort`, `sortBy`, `sortByAll`,
     * `sortByOrder`, `splice`, `spread`, `take`, `takeRight`, `takeRightWhile`,
     * `takeWhile`, `tap`, `throttle`, `thru`, `times`, `toArray`, `toPlainObject`,
     * `transform`, `union`, `uniq`, `unshift`, `unzip`, `unzipWith`, `values`,
     * `valuesIn`, `where`, `without`, `wrap`, `xor`, `zip`, `zipObject`, `zipWith`
     *
     * The wrapper methods that are **not** chainable by default are:
     * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clone`, `cloneDeep`,
     * `deburr`, `endsWith`, `escape`, `escapeRegExp`, `every`, `find`, `findIndex`,
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `findWhere`, `first`,
     * `floor`, `get`, `gt`, `gte`, `has`, `identity`, `includes`, `indexOf`,
     * `inRange`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
     * `isEmpty`, `isEqual`, `isError`, `isFinite` `isFunction`, `isMatch`,
     * `isNative`, `isNaN`, `isNull`, `isNumber`, `isObject`, `isPlainObject`,
     * `isRegExp`, `isString`, `isUndefined`, `isTypedArray`, `join`, `kebabCase`,
     * `last`, `lastIndexOf`, `lt`, `lte`, `max`, `min`, `noConflict`, `noop`,
     * `now`, `pad`, `padLeft`, `padRight`, `parseInt`, `pop`, `random`, `reduce`,
     * `reduceRight`, `repeat`, `result`, `round`, `runInContext`, `shift`, `size`,
     * `snakeCase`, `some`, `sortedIndex`, `sortedLastIndex`, `startCase`,
     * `startsWith`, `sum`, `template`, `trim`, `trimLeft`, `trimRight`, `trunc`,
     * `unescape`, `uniqueId`, `value`, and `words`
     *
     * The wrapper method `sample` will return a wrapped value when `n` is provided,
     * otherwise an unwrapped value is returned.
     *
     * @name _
     * @constructor
     * @category Chain
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // returns an unwrapped value
     * wrapped.reduce(function(total, n) {
     *   return total + n;
     * });
     * // => 6
     *
     * // returns a wrapped value
     * var squares = wrapped.map(function(n) {
     *   return n * n;
     * });
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
        if (value instanceof LodashWrapper) {
          return value;
        }
        if (hasOwnProperty.call(value, '__chain__') && hasOwnProperty.call(value, '__wrapped__')) {
          return wrapperClone(value);
        }
      }
      return new LodashWrapper(value);
    }

    /**
     * The function whose prototype all chaining wrappers inherit from.
     *
     * @private
     */
    function baseLodash() {
      // No operation performed.
    }

    /**
     * The base constructor for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap.
     * @param {boolean} [chainAll] Enable chaining for all wrapper methods.
     * @param {Array} [actions=[]] Actions to peform to resolve the unwrapped value.
     */
    function LodashWrapper(value, chainAll, actions) {
      this.__wrapped__ = value;
      this.__actions__ = actions || [];
      this.__chain__ = !!chainAll;
    }

    /**
     * An object environment feature flags.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    /**
     * By default, the template delimiters used by lodash are like those in
     * embedded Ruby (ERB). Change the following template settings to use
     * alternative delimiters.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'escape': reEscape,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': reEvaluate,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type string
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type Object
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type Function
         */
        '_': lodash
      }
    };

    /*------------------------------------------------------------------------*/

    /**
     * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
     *
     * @private
     * @param {*} value The value to wrap.
     */
    function LazyWrapper(value) {
      this.__wrapped__ = value;
      this.__actions__ = [];
      this.__dir__ = 1;
      this.__filtered__ = false;
      this.__iteratees__ = [];
      this.__takeCount__ = POSITIVE_INFINITY;
      this.__views__ = [];
    }

    /**
     * Creates a clone of the lazy wrapper object.
     *
     * @private
     * @name clone
     * @memberOf LazyWrapper
     * @returns {Object} Returns the cloned `LazyWrapper` object.
     */
    function lazyClone() {
      var result = new LazyWrapper(this.__wrapped__);
      result.__actions__ = arrayCopy(this.__actions__);
      result.__dir__ = this.__dir__;
      result.__filtered__ = this.__filtered__;
      result.__iteratees__ = arrayCopy(this.__iteratees__);
      result.__takeCount__ = this.__takeCount__;
      result.__views__ = arrayCopy(this.__views__);
      return result;
    }

    /**
     * Reverses the direction of lazy iteration.
     *
     * @private
     * @name reverse
     * @memberOf LazyWrapper
     * @returns {Object} Returns the new reversed `LazyWrapper` object.
     */
    function lazyReverse() {
      if (this.__filtered__) {
        var result = new LazyWrapper(this);
        result.__dir__ = -1;
        result.__filtered__ = true;
      } else {
        result = this.clone();
        result.__dir__ *= -1;
      }
      return result;
    }

    /**
     * Extracts the unwrapped value from its lazy wrapper.
     *
     * @private
     * @name value
     * @memberOf LazyWrapper
     * @returns {*} Returns the unwrapped value.
     */
    function lazyValue() {
      var array = this.__wrapped__.value(),
          dir = this.__dir__,
          isArr = isArray(array),
          isRight = dir < 0,
          arrLength = isArr ? array.length : 0,
          view = getView(0, arrLength, this.__views__),
          start = view.start,
          end = view.end,
          length = end - start,
          index = isRight ? end : (start - 1),
          iteratees = this.__iteratees__,
          iterLength = iteratees.length,
          resIndex = 0,
          takeCount = nativeMin(length, this.__takeCount__);

      if (!isArr || arrLength < LARGE_ARRAY_SIZE || (arrLength == length && takeCount == length)) {
        return baseWrapperValue((isRight && isArr) ? array.reverse() : array, this.__actions__);
      }
      var result = [];

      outer:
      while (length-- && resIndex < takeCount) {
        index += dir;

        var iterIndex = -1,
            value = array[index];

        while (++iterIndex < iterLength) {
          var data = iteratees[iterIndex],
              iteratee = data.iteratee,
              type = data.type,
              computed = iteratee(value);

          if (type == LAZY_MAP_FLAG) {
            value = computed;
          } else if (!computed) {
            if (type == LAZY_FILTER_FLAG) {
              continue outer;
            } else {
              break outer;
            }
          }
        }
        result[resIndex++] = value;
      }
      return result;
    }

    /*------------------------------------------------------------------------*/

    /**
     * Creates a cache object to store key/value pairs.
     *
     * @private
     * @static
     * @name Cache
     * @memberOf _.memoize
     */
    function MapCache() {
      this.__data__ = {};
    }

    /**
     * Removes `key` and its value from the cache.
     *
     * @private
     * @name delete
     * @memberOf _.memoize.Cache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed successfully, else `false`.
     */
    function mapDelete(key) {
      return this.has(key) && delete this.__data__[key];
    }

    /**
     * Gets the cached value for `key`.
     *
     * @private
     * @name get
     * @memberOf _.memoize.Cache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the cached value.
     */
    function mapGet(key) {
      return key == '__proto__' ? undefined : this.__data__[key];
    }

    /**
     * Checks if a cached value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf _.memoize.Cache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapHas(key) {
      return key != '__proto__' && hasOwnProperty.call(this.__data__, key);
    }

    /**
     * Sets `value` to `key` of the cache.
     *
     * @private
     * @name set
     * @memberOf _.memoize.Cache
     * @param {string} key The key of the value to cache.
     * @param {*} value The value to cache.
     * @returns {Object} Returns the cache object.
     */
    function mapSet(key, value) {
      if (key != '__proto__') {
        this.__data__[key] = value;
      }
      return this;
    }

    /*------------------------------------------------------------------------*/

    /**
     *
     * Creates a cache object to store unique values.
     *
     * @private
     * @param {Array} [values] The values to cache.
     */
    function SetCache(values) {
      var length = values ? values.length : 0;

      this.data = { 'hash': nativeCreate(null), 'set': new Set };
      while (length--) {
        this.push(values[length]);
      }
    }

    /**
     * Checks if `value` is in `cache` mimicking the return signature of
     * `_.indexOf` by returning `0` if the value is found, else `-1`.
     *
     * @private
     * @param {Object} cache The cache to search.
     * @param {*} value The value to search for.
     * @returns {number} Returns `0` if `value` is found, else `-1`.
     */
    function cacheIndexOf(cache, value) {
      var data = cache.data,
          result = (typeof value == 'string' || isObject(value)) ? data.set.has(value) : data.hash[value];

      return result ? 0 : -1;
    }

    /**
     * Adds `value` to the cache.
     *
     * @private
     * @name push
     * @memberOf SetCache
     * @param {*} value The value to cache.
     */
    function cachePush(value) {
      var data = this.data;
      if (typeof value == 'string' || isObject(value)) {
        data.set.add(value);
      } else {
        data.hash[value] = true;
      }
    }

    /*------------------------------------------------------------------------*/

    /**
     * Creates a new array joining `array` with `other`.
     *
     * @private
     * @param {Array} array The array to join.
     * @param {Array} other The other array to join.
     * @returns {Array} Returns the new concatenated array.
     */
    function arrayConcat(array, other) {
      var index = -1,
          length = array.length,
          othIndex = -1,
          othLength = other.length,
          result = Array(length + othLength);

      while (++index < length) {
        result[index] = array[index];
      }
      while (++othIndex < othLength) {
        result[index++] = other[othIndex];
      }
      return result;
    }

    /**
     * Copies the values of `source` to `array`.
     *
     * @private
     * @param {Array} source The array to copy values from.
     * @param {Array} [array=[]] The array to copy values to.
     * @returns {Array} Returns `array`.
     */
    function arrayCopy(source, array) {
      var index = -1,
          length = source.length;

      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }

    /**
     * A specialized version of `_.forEach` for arrays without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEach(array, iteratee) {
      var index = -1,
          length = array.length;

      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }

    /**
     * A specialized version of `_.forEachRight` for arrays without support for
     * callback shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEachRight(array, iteratee) {
      var length = array.length;

      while (length--) {
        if (iteratee(array[length], length, array) === false) {
          break;
        }
      }
      return array;
    }

    /**
     * A specialized version of `_.every` for arrays without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if all elements pass the predicate check,
     *  else `false`.
     */
    function arrayEvery(array, predicate) {
      var index = -1,
          length = array.length;

      while (++index < length) {
        if (!predicate(array[index], index, array)) {
          return false;
        }
      }
      return true;
    }

    /**
     * A specialized version of `baseExtremum` for arrays which invokes `iteratee`
     * with one argument: (value).
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} comparator The function used to compare values.
     * @param {*} exValue The initial extremum value.
     * @returns {*} Returns the extremum value.
     */
    function arrayExtremum(array, iteratee, comparator, exValue) {
      var index = -1,
          length = array.length,
          computed = exValue,
          result = computed;

      while (++index < length) {
        var value = array[index],
            current = +iteratee(value);

        if (comparator(current, computed)) {
          computed = current;
          result = value;
        }
      }
      return result;
    }

    /**
     * A specialized version of `_.filter` for arrays without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function arrayFilter(array, predicate) {
      var index = -1,
          length = array.length,
          resIndex = -1,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[++resIndex] = value;
        }
      }
      return result;
    }

    /**
     * A specialized version of `_.map` for arrays without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function arrayMap(array, iteratee) {
      var index = -1,
          length = array.length,
          result = Array(length);

      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }

    /**
     * Appends the elements of `values` to `array`.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to append.
     * @returns {Array} Returns `array`.
     */
    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }

    /**
     * A specialized version of `_.reduce` for arrays without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @param {boolean} [initFromArray] Specify using the first element of `array`
     *  as the initial value.
     * @returns {*} Returns the accumulated value.
     */
    function arrayReduce(array, iteratee, accumulator, initFromArray) {
      var index = -1,
          length = array.length;

      if (initFromArray && length) {
        accumulator = array[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
      }
      return accumulator;
    }

    /**
     * A specialized version of `_.reduceRight` for arrays without support for
     * callback shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @param {boolean} [initFromArray] Specify using the last element of `array`
     *  as the initial value.
     * @returns {*} Returns the accumulated value.
     */
    function arrayReduceRight(array, iteratee, accumulator, initFromArray) {
      var length = array.length;
      if (initFromArray && length) {
        accumulator = array[--length];
      }
      while (length--) {
        accumulator = iteratee(accumulator, array[length], length, array);
      }
      return accumulator;
    }

    /**
     * A specialized version of `_.some` for arrays without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function arraySome(array, predicate) {
      var index = -1,
          length = array.length;

      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }

    /**
     * A specialized version of `_.sum` for arrays without support for callback
     * shorthands and `this` binding..
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {number} Returns the sum.
     */
    function arraySum(array, iteratee) {
      var length = array.length,
          result = 0;

      while (length--) {
        result += +iteratee(array[length]) || 0;
      }
      return result;
    }

    /**
     * Used by `_.defaults` to customize its `_.assign` use.
     *
     * @private
     * @param {*} objectValue The destination object property value.
     * @param {*} sourceValue The source object property value.
     * @returns {*} Returns the value to assign to the destination object.
     */
    function assignDefaults(objectValue, sourceValue) {
      return objectValue === undefined ? sourceValue : objectValue;
    }

    /**
     * Used by `_.template` to customize its `_.assign` use.
     *
     * **Note:** This function is like `assignDefaults` except that it ignores
     * inherited property values when checking if a property is `undefined`.
     *
     * @private
     * @param {*} objectValue The destination object property value.
     * @param {*} sourceValue The source object property value.
     * @param {string} key The key associated with the object and source values.
     * @param {Object} object The destination object.
     * @returns {*} Returns the value to assign to the destination object.
     */
    function assignOwnDefaults(objectValue, sourceValue, key, object) {
      return (objectValue === undefined || !hasOwnProperty.call(object, key))
        ? sourceValue
        : objectValue;
    }

    /**
     * A specialized version of `_.assign` for customizing assigned values without
     * support for argument juggling, multiple sources, and `this` binding `customizer`
     * functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} customizer The function to customize assigned values.
     * @returns {Object} Returns `object`.
     */
    function assignWith(object, source, customizer) {
      var index = -1,
          props = keys(source),
          length = props.length;

      while (++index < length) {
        var key = props[index],
            value = object[key],
            result = customizer(value, source[key], key, object, source);

        if ((result === result ? (result !== value) : (value === value)) ||
            (value === undefined && !(key in object))) {
          object[key] = result;
        }
      }
      return object;
    }

    /**
     * The base implementation of `_.assign` without support for argument juggling,
     * multiple sources, and `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    function baseAssign(object, source) {
      return source == null
        ? object
        : baseCopy(source, keys(source), object);
    }

    /**
     * The base implementation of `_.at` without support for string collections
     * and individual key arguments.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {number[]|string[]} props The property names or indexes of elements to pick.
     * @returns {Array} Returns the new array of picked elements.
     */
    function baseAt(collection, props) {
      var index = -1,
          isNil = collection == null,
          isArr = !isNil && isArrayLike(collection),
          length = isArr ? collection.length : 0,
          propsLength = props.length,
          result = Array(propsLength);

      while(++index < propsLength) {
        var key = props[index];
        if (isArr) {
          result[index] = isIndex(key, length) ? collection[key] : undefined;
        } else {
          result[index] = isNil ? undefined : collection[key];
        }
      }
      return result;
    }

    /**
     * Copies properties of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy properties from.
     * @param {Array} props The property names to copy.
     * @param {Object} [object={}] The object to copy properties to.
     * @returns {Object} Returns `object`.
     */
    function baseCopy(source, props, object) {
      object || (object = {});

      var index = -1,
          length = props.length;

      while (++index < length) {
        var key = props[index];
        object[key] = source[key];
      }
      return object;
    }

    /**
     * The base implementation of `_.callback` which supports specifying the
     * number of arguments to provide to `func`.
     *
     * @private
     * @param {*} [func=_.identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {number} [argCount] The number of arguments to provide to `func`.
     * @returns {Function} Returns the callback.
     */
    function baseCallback(func, thisArg, argCount) {
      var type = typeof func;
      if (type == 'function') {
        return thisArg === undefined
          ? func
          : bindCallback(func, thisArg, argCount);
      }
      if (func == null) {
        return identity;
      }
      if (type == 'object') {
        return baseMatches(func);
      }
      return thisArg === undefined
        ? property(func)
        : baseMatchesProperty(func, thisArg);
    }

    /**
     * The base implementation of `_.clone` without support for argument juggling
     * and `this` binding `customizer` functions.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @param {Function} [customizer] The function to customize cloning values.
     * @param {string} [key] The key of `value`.
     * @param {Object} [object] The object `value` belongs to.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
      var result;
      if (customizer) {
        result = object ? customizer(value, key, object) : customizer(value);
      }
      if (result !== undefined) {
        return result;
      }
      if (!isObject(value)) {
        return value;
      }
      var isArr = isArray(value);
      if (isArr) {
        result = initCloneArray(value);
        if (!isDeep) {
          return arrayCopy(value, result);
        }
      } else {
        var tag = objToString.call(value),
            isFunc = tag == funcTag;

        if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
          result = initCloneObject(isFunc ? {} : value);
          if (!isDeep) {
            return baseAssign(result, value);
          }
        } else {
          return cloneableTags[tag]
            ? initCloneByTag(value, tag, isDeep)
            : (object ? value : {});
        }
      }
      // Check for circular references and return its corresponding clone.
      stackA || (stackA = []);
      stackB || (stackB = []);

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == value) {
          return stackB[length];
        }
      }
      // Add the source value to the stack of traversed objects and associate it with its clone.
      stackA.push(value);
      stackB.push(result);

      // Recursively populate clone (susceptible to call stack limits).
      (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
        result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
      });
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    var baseCreate = (function() {
      function object() {}
      return function(prototype) {
        if (isObject(prototype)) {
          object.prototype = prototype;
          var result = new object;
          object.prototype = undefined;
        }
        return result || {};
      };
    }());

    /**
     * The base implementation of `_.delay` and `_.defer` which accepts an index
     * of where to slice the arguments to provide to `func`.
     *
     * @private
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay invocation.
     * @param {Object} args The arguments provide to `func`.
     * @returns {number} Returns the timer id.
     */
    function baseDelay(func, wait, args) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * The base implementation of `_.difference` which accepts a single array
     * of values to exclude.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Array} values The values to exclude.
     * @returns {Array} Returns the new array of filtered values.
     */
    function baseDifference(array, values) {
      var length = array ? array.length : 0,
          result = [];

      if (!length) {
        return result;
      }
      var index = -1,
          indexOf = getIndexOf(),
          isCommon = indexOf == baseIndexOf,
          cache = (isCommon && values.length >= LARGE_ARRAY_SIZE) ? createCache(values) : null,
          valuesLength = values.length;

      if (cache) {
        indexOf = cacheIndexOf;
        isCommon = false;
        values = cache;
      }
      outer:
      while (++index < length) {
        var value = array[index];

        if (isCommon && value === value) {
          var valuesIndex = valuesLength;
          while (valuesIndex--) {
            if (values[valuesIndex] === value) {
              continue outer;
            }
          }
          result.push(value);
        }
        else if (indexOf(values, value, 0) < 0) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.forEach` without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array|Object|string} Returns `collection`.
     */
    var baseEach = createBaseEach(baseForOwn);

    /**
     * The base implementation of `_.forEachRight` without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array|Object|string} Returns `collection`.
     */
    var baseEachRight = createBaseEach(baseForOwnRight, true);

    /**
     * The base implementation of `_.every` without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if all elements pass the predicate check,
     *  else `false`
     */
    function baseEvery(collection, predicate) {
      var result = true;
      baseEach(collection, function(value, index, collection) {
        result = !!predicate(value, index, collection);
        return result;
      });
      return result;
    }

    /**
     * Gets the extremum value of `collection` invoking `iteratee` for each value
     * in `collection` to generate the criterion by which the value is ranked.
     * The `iteratee` is invoked with three arguments: (value, index|key, collection).
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} comparator The function used to compare values.
     * @param {*} exValue The initial extremum value.
     * @returns {*} Returns the extremum value.
     */
    function baseExtremum(collection, iteratee, comparator, exValue) {
      var computed = exValue,
          result = computed;

      baseEach(collection, function(value, index, collection) {
        var current = +iteratee(value, index, collection);
        if (comparator(current, computed) || (current === exValue && current === result)) {
          computed = current;
          result = value;
        }
      });
      return result;
    }

    /**
     * The base implementation of `_.fill` without an iteratee call guard.
     *
     * @private
     * @param {Array} array The array to fill.
     * @param {*} value The value to fill `array` with.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns `array`.
     */
    function baseFill(array, value, start, end) {
      var length = array.length;

      start = start == null ? 0 : (+start || 0);
      if (start < 0) {
        start = -start > length ? 0 : (length + start);
      }
      end = (end === undefined || end > length) ? length : (+end || 0);
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : (end >>> 0);
      start >>>= 0;

      while (start < length) {
        array[start++] = value;
      }
      return array;
    }

    /**
     * The base implementation of `_.filter` without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function baseFilter(collection, predicate) {
      var result = [];
      baseEach(collection, function(value, index, collection) {
        if (predicate(value, index, collection)) {
          result.push(value);
        }
      });
      return result;
    }

    /**
     * The base implementation of `_.find`, `_.findLast`, `_.findKey`, and `_.findLastKey`,
     * without support for callback shorthands and `this` binding, which iterates
     * over `collection` using the provided `eachFunc`.
     *
     * @private
     * @param {Array|Object|string} collection The collection to search.
     * @param {Function} predicate The function invoked per iteration.
     * @param {Function} eachFunc The function to iterate over `collection`.
     * @param {boolean} [retKey] Specify returning the key of the found element
     *  instead of the element itself.
     * @returns {*} Returns the found element or its key, else `undefined`.
     */
    function baseFind(collection, predicate, eachFunc, retKey) {
      var result;
      eachFunc(collection, function(value, key, collection) {
        if (predicate(value, key, collection)) {
          result = retKey ? key : value;
          return false;
        }
      });
      return result;
    }

    /**
     * The base implementation of `_.flatten` with added support for restricting
     * flattening and specifying the start index.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {boolean} [isDeep] Specify a deep flatten.
     * @param {boolean} [isStrict] Restrict flattening to arrays-like objects.
     * @param {Array} [result=[]] The initial result value.
     * @returns {Array} Returns the new flattened array.
     */
    function baseFlatten(array, isDeep, isStrict, result) {
      result || (result = []);

      var index = -1,
          length = array.length;

      while (++index < length) {
        var value = array[index];
        if (isObjectLike(value) && isArrayLike(value) &&
            (isStrict || isArray(value) || isArguments(value))) {
          if (isDeep) {
            // Recursively flatten arrays (susceptible to call stack limits).
            baseFlatten(value, isDeep, isStrict, result);
          } else {
            arrayPush(result, value);
          }
        } else if (!isStrict) {
          result[result.length] = value;
        }
      }
      return result;
    }

    /**
     * The base implementation of `baseForIn` and `baseForOwn` which iterates
     * over `object` properties returned by `keysFunc` invoking `iteratee` for
     * each property. Iteratee functions may exit iteration early by explicitly
     * returning `false`.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseFor = createBaseFor();

    /**
     * This function is like `baseFor` except that it iterates over properties
     * in the opposite order.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseForRight = createBaseFor(true);

    /**
     * The base implementation of `_.forIn` without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */
    function baseForIn(object, iteratee) {
      return baseFor(object, iteratee, keysIn);
    }

    /**
     * The base implementation of `_.forOwn` without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */
    function baseForOwn(object, iteratee) {
      return baseFor(object, iteratee, keys);
    }

    /**
     * The base implementation of `_.forOwnRight` without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */
    function baseForOwnRight(object, iteratee) {
      return baseForRight(object, iteratee, keys);
    }

    /**
     * The base implementation of `_.functions` which creates an array of
     * `object` function property names filtered from those provided.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Array} props The property names to filter.
     * @returns {Array} Returns the new array of filtered property names.
     */
    function baseFunctions(object, props) {
      var index = -1,
          length = props.length,
          resIndex = -1,
          result = [];

      while (++index < length) {
        var key = props[index];
        if (isFunction(object[key])) {
          result[++resIndex] = key;
        }
      }
      return result;
    }

    /**
     * The base implementation of `get` without support for string paths
     * and default values.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array} path The path of the property to get.
     * @param {string} [pathKey] The key representation of path.
     * @returns {*} Returns the resolved value.
     */
    function baseGet(object, path, pathKey) {
      if (object == null) {
        return;
      }
      if (pathKey !== undefined && pathKey in toObject(object)) {
        path = [pathKey];
      }
      var index = 0,
          length = path.length;

      while (object != null && index < length) {
        object = object[path[index++]];
      }
      return (index && index == length) ? object : undefined;
    }

    /**
     * The base implementation of `_.isEqual` without support for `this` binding
     * `customizer` functions.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {Function} [customizer] The function to customize comparing values.
     * @param {boolean} [isLoose] Specify performing partial comparisons.
     * @param {Array} [stackA] Tracks traversed `value` objects.
     * @param {Array} [stackB] Tracks traversed `other` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
    }

    /**
     * A specialized version of `baseIsEqual` for arrays and objects which performs
     * deep comparisons and tracks traversed objects enabling objects with circular
     * references to be compared.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} [customizer] The function to customize comparing objects.
     * @param {boolean} [isLoose] Specify performing partial comparisons.
     * @param {Array} [stackA=[]] Tracks traversed `value` objects.
     * @param {Array} [stackB=[]] Tracks traversed `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
      var objIsArr = isArray(object),
          othIsArr = isArray(other),
          objTag = arrayTag,
          othTag = arrayTag;

      if (!objIsArr) {
        objTag = objToString.call(object);
        if (objTag == argsTag) {
          objTag = objectTag;
        } else if (objTag != objectTag) {
          objIsArr = isTypedArray(object);
        }
      }
      if (!othIsArr) {
        othTag = objToString.call(other);
        if (othTag == argsTag) {
          othTag = objectTag;
        } else if (othTag != objectTag) {
          othIsArr = isTypedArray(other);
        }
      }
      var objIsObj = objTag == objectTag,
          othIsObj = othTag == objectTag,
          isSameTag = objTag == othTag;

      if (isSameTag && !(objIsArr || objIsObj)) {
        return equalByTag(object, other, objTag);
      }
      if (!isLoose) {
        var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
            othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

        if (objIsWrapped || othIsWrapped) {
          return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
        }
      }
      if (!isSameTag) {
        return false;
      }
      // Assume cyclic values are equal.
      // For more information on detecting circular references see https://es5.github.io/#JO.
      stackA || (stackA = []);
      stackB || (stackB = []);

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == object) {
          return stackB[length] == other;
        }
      }
      // Add `object` and `other` to the stack of traversed objects.
      stackA.push(object);
      stackB.push(other);

      var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);

      stackA.pop();
      stackB.pop();

      return result;
    }

    /**
     * The base implementation of `_.isMatch` without support for callback
     * shorthands and `this` binding.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Array} matchData The propery names, values, and compare flags to match.
     * @param {Function} [customizer] The function to customize comparing objects.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     */
    function baseIsMatch(object, matchData, customizer) {
      var index = matchData.length,
          length = index,
          noCustomizer = !customizer;

      if (object == null) {
        return !length;
      }
      object = toObject(object);
      while (index--) {
        var data = matchData[index];
        if ((noCustomizer && data[2])
              ? data[1] !== object[data[0]]
              : !(data[0] in object)
            ) {
          return false;
        }
      }
      while (++index < length) {
        data = matchData[index];
        var key = data[0],
            objValue = object[key],
            srcValue = data[1];

        if (noCustomizer && data[2]) {
          if (objValue === undefined && !(key in object)) {
            return false;
          }
        } else {
          var result = customizer ? customizer(objValue, srcValue, key) : undefined;
          if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, true) : result)) {
            return false;
          }
        }
      }
      return true;
    }

    /**
     * The base implementation of `_.map` without support for callback shorthands
     * and `this` binding.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function baseMap(collection, iteratee) {
      var index = -1,
          result = isArrayLike(collection) ? Array(collection.length) : [];

      baseEach(collection, function(value, key, collection) {
        result[++index] = iteratee(value, key, collection);
      });
      return result;
    }

    /**
     * The base implementation of `_.matches` which does not clone `source`.
     *
     * @private
     * @param {Object} source The object of property values to match.
     * @returns {Function} Returns the new function.
     */
    function baseMatches(source) {
      var matchData = getMatchData(source);
      if (matchData.length == 1 && matchData[0][2]) {
        var key = matchData[0][0],
            value = matchData[0][1];

        return function(object) {
          if (object == null) {
            return false;
          }
          return object[key] === value && (value !== undefined || (key in toObject(object)));
        };
      }
      return function(object) {
        return baseIsMatch(object, matchData);
      };
    }

    /**
     * The base implementation of `_.matchesProperty` which does not clone `srcValue`.
     *
     * @private
     * @param {string} path The path of the property to get.
     * @param {*} srcValue The value to compare.
     * @returns {Function} Returns the new function.
     */
    function baseMatchesProperty(path, srcValue) {
      var isArr = isArray(path),
          isCommon = isKey(path) && isStrictComparable(srcValue),
          pathKey = (path + '');

      path = toPath(path);
      return function(object) {
        if (object == null) {
          return false;
        }
        var key = pathKey;
        object = toObject(object);
        if ((isArr || !isCommon) && !(key in object)) {
          object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
          if (object == null) {
            return false;
          }
          key = last(path);
          object = toObject(object);
        }
        return object[key] === srcValue
          ? (srcValue !== undefined || (key in object))
          : baseIsEqual(srcValue, object[key], undefined, true);
      };
    }

    /**
     * The base implementation of `_.merge` without support for argument juggling,
     * multiple sources, and `this` binding `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} [customizer] The function to customize merged values.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     * @returns {Object} Returns `object`.
     */
    function baseMerge(object, source, customizer, stackA, stackB) {
      if (!isObject(object)) {
        return object;
      }
      var isSrcArr = isArrayLike(source) && (isArray(source) || isTypedArray(source)),
          props = isSrcArr ? undefined : keys(source);

      arrayEach(props || source, function(srcValue, key) {
        if (props) {
          key = srcValue;
          srcValue = source[key];
        }
        if (isObjectLike(srcValue)) {
          stackA || (stackA = []);
          stackB || (stackB = []);
          baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);
        }
        else {
          var value = object[key],
              result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
              isCommon = result === undefined;

          if (isCommon) {
            result = srcValue;
          }
          if ((result !== undefined || (isSrcArr && !(key in object))) &&
              (isCommon || (result === result ? (result !== value) : (value === value)))) {
            object[key] = result;
          }
        }
      });
      return object;
    }

    /**
     * A specialized version of `baseMerge` for arrays and objects which performs
     * deep merges and tracks traversed objects enabling objects with circular
     * references to be merged.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {string} key The key of the value to merge.
     * @param {Function} mergeFunc The function to merge values.
     * @param {Function} [customizer] The function to customize merged values.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
      var length = stackA.length,
          srcValue = source[key];

      while (length--) {
        if (stackA[length] == srcValue) {
          object[key] = stackB[length];
          return;
        }
      }
      var value = object[key],
          result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
          isCommon = result === undefined;

      if (isCommon) {
        result = srcValue;
        if (isArrayLike(srcValue) && (isArray(srcValue) || isTypedArray(srcValue))) {
          result = isArray(value)
            ? value
            : (isArrayLike(value) ? arrayCopy(value) : []);
        }
        else if (isPlainObject(srcValue) || isArguments(srcValue)) {
          result = isArguments(value)
            ? toPlainObject(value)
            : (isPlainObject(value) ? value : {});
        }
        else {
          isCommon = false;
        }
      }
      // Add the source value to the stack of traversed objects and associate
      // it with its merged value.
      stackA.push(srcValue);
      stackB.push(result);

      if (isCommon) {
        // Recursively merge objects and arrays (susceptible to call stack limits).
        object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);
      } else if (result === result ? (result !== value) : (value === value)) {
        object[key] = result;
      }
    }

    /**
     * The base implementation of `_.property` without support for deep paths.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @returns {Function} Returns the new function.
     */
    function baseProperty(key) {
      return function(object) {
        return object == null ? undefined : object[key];
      };
    }

    /**
     * A specialized version of `baseProperty` which supports deep paths.
     *
     * @private
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new function.
     */
    function basePropertyDeep(path) {
      var pathKey = (path + '');
      path = toPath(path);
      return function(object) {
        return baseGet(object, path, pathKey);
      };
    }

    /**
     * The base implementation of `_.pullAt` without support for individual
     * index arguments and capturing the removed elements.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {number[]} indexes The indexes of elements to remove.
     * @returns {Array} Returns `array`.
     */
    function basePullAt(array, indexes) {
      var length = array ? indexes.length : 0;
      while (length--) {
        var index = indexes[length];
        if (index != previous && isIndex(index)) {
          var previous = index;
          splice.call(array, index, 1);
        }
      }
      return array;
    }

    /**
     * The base implementation of `_.random` without support for argument juggling
     * and returning floating-point numbers.
     *
     * @private
     * @param {number} min The minimum possible value.
     * @param {number} max The maximum possible value.
     * @returns {number} Returns the random number.
     */
    function baseRandom(min, max) {
      return min + nativeFloor(nativeRandom() * (max - min + 1));
    }

    /**
     * The base implementation of `_.reduce` and `_.reduceRight` without support
     * for callback shorthands and `this` binding, which iterates over `collection`
     * using the provided `eachFunc`.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {*} accumulator The initial value.
     * @param {boolean} initFromCollection Specify using the first or last element
     *  of `collection` as the initial value.
     * @param {Function} eachFunc The function to iterate over `collection`.
     * @returns {*} Returns the accumulated value.
     */
    function baseReduce(collection, iteratee, accumulator, initFromCollection, eachFunc) {
      eachFunc(collection, function(value, index, collection) {
        accumulator = initFromCollection
          ? (initFromCollection = false, value)
          : iteratee(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The base implementation of `setData` without support for hot loop detection.
     *
     * @private
     * @param {Function} func The function to associate metadata with.
     * @param {*} data The metadata.
     * @returns {Function} Returns `func`.
     */
    var baseSetData = !metaMap ? identity : function(func, data) {
      metaMap.set(func, data);
      return func;
    };

    /**
     * The base implementation of `_.slice` without an iteratee call guard.
     *
     * @private
     * @param {Array} array The array to slice.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns the slice of `array`.
     */
    function baseSlice(array, start, end) {
      var index = -1,
          length = array.length;

      start = start == null ? 0 : (+start || 0);
      if (start < 0) {
        start = -start > length ? 0 : (length + start);
      }
      end = (end === undefined || end > length) ? length : (+end || 0);
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : ((end - start) >>> 0);
      start >>>= 0;

      var result = Array(length);
      while (++index < length) {
        result[index] = array[index + start];
      }
      return result;
    }

    /**
     * The base implementation of `_.some` without support for callback shorthands
     * and `this` binding.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function baseSome(collection, predicate) {
      var result;

      baseEach(collection, function(value, index, collection) {
        result = predicate(value, index, collection);
        return !result;
      });
      return !!result;
    }

    /**
     * The base implementation of `_.sortBy` which uses `comparer` to define
     * the sort order of `array` and replaces criteria objects with their
     * corresponding values.
     *
     * @private
     * @param {Array} array The array to sort.
     * @param {Function} comparer The function to define sort order.
     * @returns {Array} Returns `array`.
     */
    function baseSortBy(array, comparer) {
      var length = array.length;

      array.sort(comparer);
      while (length--) {
        array[length] = array[length].value;
      }
      return array;
    }

    /**
     * The base implementation of `_.sortByOrder` without param guards.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
     * @param {boolean[]} orders The sort orders of `iteratees`.
     * @returns {Array} Returns the new sorted array.
     */
    function baseSortByOrder(collection, iteratees, orders) {
      var callback = getCallback(),
          index = -1;

      iteratees = arrayMap(iteratees, function(iteratee) { return callback(iteratee); });

      var result = baseMap(collection, function(value) {
        var criteria = arrayMap(iteratees, function(iteratee) { return iteratee(value); });
        return { 'criteria': criteria, 'index': ++index, 'value': value };
      });

      return baseSortBy(result, function(object, other) {
        return compareMultiple(object, other, orders);
      });
    }

    /**
     * The base implementation of `_.sum` without support for callback shorthands
     * and `this` binding.
     *
     * @private
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {number} Returns the sum.
     */
    function baseSum(collection, iteratee) {
      var result = 0;
      baseEach(collection, function(value, index, collection) {
        result += +iteratee(value, index, collection) || 0;
      });
      return result;
    }

    /**
     * The base implementation of `_.uniq` without support for callback shorthands
     * and `this` binding.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Function} [iteratee] The function invoked per iteration.
     * @returns {Array} Returns the new duplicate-value-free array.
     */
    function baseUniq(array, iteratee) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array.length,
          isCommon = indexOf == baseIndexOf,
          isLarge = isCommon && length >= LARGE_ARRAY_SIZE,
          seen = isLarge ? createCache() : null,
          result = [];

      if (seen) {
        indexOf = cacheIndexOf;
        isCommon = false;
      } else {
        isLarge = false;
        seen = iteratee ? [] : result;
      }
      outer:
      while (++index < length) {
        var value = array[index],
            computed = iteratee ? iteratee(value, index, array) : value;

        if (isCommon && value === value) {
          var seenIndex = seen.length;
          while (seenIndex--) {
            if (seen[seenIndex] === computed) {
              continue outer;
            }
          }
          if (iteratee) {
            seen.push(computed);
          }
          result.push(value);
        }
        else if (indexOf(seen, computed, 0) < 0) {
          if (iteratee || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.values` and `_.valuesIn` which creates an
     * array of `object` property values corresponding to the property names
     * of `props`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array} props The property names to get values for.
     * @returns {Object} Returns the array of property values.
     */
    function baseValues(object, props) {
      var index = -1,
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /**
     * The base implementation of `_.dropRightWhile`, `_.dropWhile`, `_.takeRightWhile`,
     * and `_.takeWhile` without support for callback shorthands and `this` binding.
     *
     * @private
     * @param {Array} array The array to query.
     * @param {Function} predicate The function invoked per iteration.
     * @param {boolean} [isDrop] Specify dropping elements instead of taking them.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Array} Returns the slice of `array`.
     */
    function baseWhile(array, predicate, isDrop, fromRight) {
      var length = array.length,
          index = fromRight ? length : -1;

      while ((fromRight ? index-- : ++index < length) && predicate(array[index], index, array)) {}
      return isDrop
        ? baseSlice(array, (fromRight ? 0 : index), (fromRight ? index + 1 : length))
        : baseSlice(array, (fromRight ? index + 1 : 0), (fromRight ? length : index));
    }

    /**
     * The base implementation of `wrapperValue` which returns the result of
     * performing a sequence of actions on the unwrapped `value`, where each
     * successive action is supplied the return value of the previous.
     *
     * @private
     * @param {*} value The unwrapped value.
     * @param {Array} actions Actions to peform to resolve the unwrapped value.
     * @returns {*} Returns the resolved value.
     */
    function baseWrapperValue(value, actions) {
      var result = value;
      if (result instanceof LazyWrapper) {
        result = result.value();
      }
      var index = -1,
          length = actions.length;

      while (++index < length) {
        var action = actions[index];
        result = action.func.apply(action.thisArg, arrayPush([result], action.args));
      }
      return result;
    }

    /**
     * Performs a binary search of `array` to determine the index at which `value`
     * should be inserted into `array` in order to maintain its sort order.
     *
     * @private
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @param {boolean} [retHighest] Specify returning the highest qualified index.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     */
    function binaryIndex(array, value, retHighest) {
      var low = 0,
          high = array ? array.length : low;

      if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
        while (low < high) {
          var mid = (low + high) >>> 1,
              computed = array[mid];

          if ((retHighest ? (computed <= value) : (computed < value)) && computed !== null) {
            low = mid + 1;
          } else {
            high = mid;
          }
        }
        return high;
      }
      return binaryIndexBy(array, value, identity, retHighest);
    }

    /**
     * This function is like `binaryIndex` except that it invokes `iteratee` for
     * `value` and each element of `array` to compute their sort ranking. The
     * iteratee is invoked with one argument; (value).
     *
     * @private
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {boolean} [retHighest] Specify returning the highest qualified index.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     */
    function binaryIndexBy(array, value, iteratee, retHighest) {
      value = iteratee(value);

      var low = 0,
          high = array ? array.length : 0,
          valIsNaN = value !== value,
          valIsNull = value === null,
          valIsUndef = value === undefined;

      while (low < high) {
        var mid = nativeFloor((low + high) / 2),
            computed = iteratee(array[mid]),
            isDef = computed !== undefined,
            isReflexive = computed === computed;

        if (valIsNaN) {
          var setLow = isReflexive || retHighest;
        } else if (valIsNull) {
          setLow = isReflexive && isDef && (retHighest || computed != null);
        } else if (valIsUndef) {
          setLow = isReflexive && (retHighest || isDef);
        } else if (computed == null) {
          setLow = false;
        } else {
          setLow = retHighest ? (computed <= value) : (computed < value);
        }
        if (setLow) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      return nativeMin(high, MAX_ARRAY_INDEX);
    }

    /**
     * A specialized version of `baseCallback` which only supports `this` binding
     * and specifying the number of arguments to provide to `func`.
     *
     * @private
     * @param {Function} func The function to bind.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {number} [argCount] The number of arguments to provide to `func`.
     * @returns {Function} Returns the callback.
     */
    function bindCallback(func, thisArg, argCount) {
      if (typeof func != 'function') {
        return identity;
      }
      if (thisArg === undefined) {
        return func;
      }
      switch (argCount) {
        case 1: return function(value) {
          return func.call(thisArg, value);
        };
        case 3: return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
        case 5: return function(value, other, key, object, source) {
          return func.call(thisArg, value, other, key, object, source);
        };
      }
      return function() {
        return func.apply(thisArg, arguments);
      };
    }

    /**
     * Creates a clone of the given array buffer.
     *
     * @private
     * @param {ArrayBuffer} buffer The array buffer to clone.
     * @returns {ArrayBuffer} Returns the cloned array buffer.
     */
    function bufferClone(buffer) {
      var result = new ArrayBuffer(buffer.byteLength),
          view = new Uint8Array(result);

      view.set(new Uint8Array(buffer));
      return result;
    }

    /**
     * Creates an array that is the composition of partially applied arguments,
     * placeholders, and provided arguments into a single array of arguments.
     *
     * @private
     * @param {Array|Object} args The provided arguments.
     * @param {Array} partials The arguments to prepend to those provided.
     * @param {Array} holders The `partials` placeholder indexes.
     * @returns {Array} Returns the new array of composed arguments.
     */
    function composeArgs(args, partials, holders) {
      var holdersLength = holders.length,
          argsIndex = -1,
          argsLength = nativeMax(args.length - holdersLength, 0),
          leftIndex = -1,
          leftLength = partials.length,
          result = Array(leftLength + argsLength);

      while (++leftIndex < leftLength) {
        result[leftIndex] = partials[leftIndex];
      }
      while (++argsIndex < holdersLength) {
        result[holders[argsIndex]] = args[argsIndex];
      }
      while (argsLength--) {
        result[leftIndex++] = args[argsIndex++];
      }
      return result;
    }

    /**
     * This function is like `composeArgs` except that the arguments composition
     * is tailored for `_.partialRight`.
     *
     * @private
     * @param {Array|Object} args The provided arguments.
     * @param {Array} partials The arguments to append to those provided.
     * @param {Array} holders The `partials` placeholder indexes.
     * @returns {Array} Returns the new array of composed arguments.
     */
    function composeArgsRight(args, partials, holders) {
      var holdersIndex = -1,
          holdersLength = holders.length,
          argsIndex = -1,
          argsLength = nativeMax(args.length - holdersLength, 0),
          rightIndex = -1,
          rightLength = partials.length,
          result = Array(argsLength + rightLength);

      while (++argsIndex < argsLength) {
        result[argsIndex] = args[argsIndex];
      }
      var offset = argsIndex;
      while (++rightIndex < rightLength) {
        result[offset + rightIndex] = partials[rightIndex];
      }
      while (++holdersIndex < holdersLength) {
        result[offset + holders[holdersIndex]] = args[argsIndex++];
      }
      return result;
    }

    /**
     * Creates a `_.countBy`, `_.groupBy`, `_.indexBy`, or `_.partition` function.
     *
     * @private
     * @param {Function} setter The function to set keys and values of the accumulator object.
     * @param {Function} [initializer] The function to initialize the accumulator object.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter, initializer) {
      return function(collection, iteratee, thisArg) {
        var result = initializer ? initializer() : {};
        iteratee = getCallback(iteratee, thisArg, 3);

        if (isArray(collection)) {
          var index = -1,
              length = collection.length;

          while (++index < length) {
            var value = collection[index];
            setter(result, value, iteratee(value, index, collection), collection);
          }
        } else {
          baseEach(collection, function(value, key, collection) {
            setter(result, value, iteratee(value, key, collection), collection);
          });
        }
        return result;
      };
    }

    /**
     * Creates a `_.assign`, `_.defaults`, or `_.merge` function.
     *
     * @private
     * @param {Function} assigner The function to assign values.
     * @returns {Function} Returns the new assigner function.
     */
    function createAssigner(assigner) {
      return restParam(function(object, sources) {
        var index = -1,
            length = object == null ? 0 : sources.length,
            customizer = length > 2 ? sources[length - 2] : undefined,
            guard = length > 2 ? sources[2] : undefined,
            thisArg = length > 1 ? sources[length - 1] : undefined;

        if (typeof customizer == 'function') {
          customizer = bindCallback(customizer, thisArg, 5);
          length -= 2;
        } else {
          customizer = typeof thisArg == 'function' ? thisArg : undefined;
          length -= (customizer ? 1 : 0);
        }
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? undefined : customizer;
          length = 1;
        }
        while (++index < length) {
          var source = sources[index];
          if (source) {
            assigner(object, source, customizer);
          }
        }
        return object;
      });
    }

    /**
     * Creates a `baseEach` or `baseEachRight` function.
     *
     * @private
     * @param {Function} eachFunc The function to iterate over a collection.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseEach(eachFunc, fromRight) {
      return function(collection, iteratee) {
        var length = collection ? getLength(collection) : 0;
        if (!isLength(length)) {
          return eachFunc(collection, iteratee);
        }
        var index = fromRight ? length : -1,
            iterable = toObject(collection);

        while ((fromRight ? index-- : ++index < length)) {
          if (iteratee(iterable[index], index, iterable) === false) {
            break;
          }
        }
        return collection;
      };
    }

    /**
     * Creates a base function for `_.forIn` or `_.forInRight`.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var iterable = toObject(object),
            props = keysFunc(object),
            length = props.length,
            index = fromRight ? length : -1;

        while ((fromRight ? index-- : ++index < length)) {
          var key = props[index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }

    /**
     * Creates a function that wraps `func` and invokes it with the `this`
     * binding of `thisArg`.
     *
     * @private
     * @param {Function} func The function to bind.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @returns {Function} Returns the new bound function.
     */
    function createBindWrapper(func, thisArg) {
      var Ctor = createCtorWrapper(func);

      function wrapper() {
        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
        return fn.apply(thisArg, arguments);
      }
      return wrapper;
    }

    /**
     * Creates a `Set` cache object to optimize linear searches of large arrays.
     *
     * @private
     * @param {Array} [values] The values to cache.
     * @returns {null|Object} Returns the new cache object if `Set` is supported, else `null`.
     */
    function createCache(values) {
      return (nativeCreate && Set) ? new SetCache(values) : null;
    }

    /**
     * Creates a function that produces compound words out of the words in a
     * given string.
     *
     * @private
     * @param {Function} callback The function to combine each word.
     * @returns {Function} Returns the new compounder function.
     */
    function createCompounder(callback) {
      return function(string) {
        var index = -1,
            array = words(deburr(string)),
            length = array.length,
            result = '';

        while (++index < length) {
          result = callback(result, array[index], index);
        }
        return result;
      };
    }

    /**
     * Creates a function that produces an instance of `Ctor` regardless of
     * whether it was invoked as part of a `new` expression or by `call` or `apply`.
     *
     * @private
     * @param {Function} Ctor The constructor to wrap.
     * @returns {Function} Returns the new wrapped function.
     */
    function createCtorWrapper(Ctor) {
      return function() {
        // Use a `switch` statement to work with class constructors.
        // See http://ecma-international.org/ecma-262/6.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
        // for more details.
        var args = arguments;
        switch (args.length) {
          case 0: return new Ctor;
          case 1: return new Ctor(args[0]);
          case 2: return new Ctor(args[0], args[1]);
          case 3: return new Ctor(args[0], args[1], args[2]);
          case 4: return new Ctor(args[0], args[1], args[2], args[3]);
          case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
          case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
          case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
        }
        var thisBinding = baseCreate(Ctor.prototype),
            result = Ctor.apply(thisBinding, args);

        // Mimic the constructor's `return` behavior.
        // See https://es5.github.io/#x13.2.2 for more details.
        return isObject(result) ? result : thisBinding;
      };
    }

    /**
     * Creates a `_.curry` or `_.curryRight` function.
     *
     * @private
     * @param {boolean} flag The curry bit flag.
     * @returns {Function} Returns the new curry function.
     */
    function createCurry(flag) {
      function curryFunc(func, arity, guard) {
        if (guard && isIterateeCall(func, arity, guard)) {
          arity = undefined;
        }
        var result = createWrapper(func, flag, undefined, undefined, undefined, undefined, undefined, arity);
        result.placeholder = curryFunc.placeholder;
        return result;
      }
      return curryFunc;
    }

    /**
     * Creates a `_.defaults` or `_.defaultsDeep` function.
     *
     * @private
     * @param {Function} assigner The function to assign values.
     * @param {Function} customizer The function to customize assigned values.
     * @returns {Function} Returns the new defaults function.
     */
    function createDefaults(assigner, customizer) {
      return restParam(function(args) {
        var object = args[0];
        if (object == null) {
          return object;
        }
        args.push(customizer);
        return assigner.apply(undefined, args);
      });
    }

    /**
     * Creates a `_.max` or `_.min` function.
     *
     * @private
     * @param {Function} comparator The function used to compare values.
     * @param {*} exValue The initial extremum value.
     * @returns {Function} Returns the new extremum function.
     */
    function createExtremum(comparator, exValue) {
      return function(collection, iteratee, thisArg) {
        if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
          iteratee = undefined;
        }
        iteratee = getCallback(iteratee, thisArg, 3);
        if (iteratee.length == 1) {
          collection = isArray(collection) ? collection : toIterable(collection);
          var result = arrayExtremum(collection, iteratee, comparator, exValue);
          if (!(collection.length && result === exValue)) {
            return result;
          }
        }
        return baseExtremum(collection, iteratee, comparator, exValue);
      };
    }

    /**
     * Creates a `_.find` or `_.findLast` function.
     *
     * @private
     * @param {Function} eachFunc The function to iterate over a collection.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new find function.
     */
    function createFind(eachFunc, fromRight) {
      return function(collection, predicate, thisArg) {
        predicate = getCallback(predicate, thisArg, 3);
        if (isArray(collection)) {
          var index = baseFindIndex(collection, predicate, fromRight);
          return index > -1 ? collection[index] : undefined;
        }
        return baseFind(collection, predicate, eachFunc);
      };
    }

    /**
     * Creates a `_.findIndex` or `_.findLastIndex` function.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new find function.
     */
    function createFindIndex(fromRight) {
      return function(array, predicate, thisArg) {
        if (!(array && array.length)) {
          return -1;
        }
        predicate = getCallback(predicate, thisArg, 3);
        return baseFindIndex(array, predicate, fromRight);
      };
    }

    /**
     * Creates a `_.findKey` or `_.findLastKey` function.
     *
     * @private
     * @param {Function} objectFunc The function to iterate over an object.
     * @returns {Function} Returns the new find function.
     */
    function createFindKey(objectFunc) {
      return function(object, predicate, thisArg) {
        predicate = getCallback(predicate, thisArg, 3);
        return baseFind(object, predicate, objectFunc, true);
      };
    }

    /**
     * Creates a `_.flow` or `_.flowRight` function.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new flow function.
     */
    function createFlow(fromRight) {
      return function() {
        var wrapper,
            length = arguments.length,
            index = fromRight ? length : -1,
            leftIndex = 0,
            funcs = Array(length);

        while ((fromRight ? index-- : ++index < length)) {
          var func = funcs[leftIndex++] = arguments[index];
          if (typeof func != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          if (!wrapper && LodashWrapper.prototype.thru && getFuncName(func) == 'wrapper') {
            wrapper = new LodashWrapper([], true);
          }
        }
        index = wrapper ? -1 : length;
        while (++index < length) {
          func = funcs[index];

          var funcName = getFuncName(func),
              data = funcName == 'wrapper' ? getData(func) : undefined;

          if (data && isLaziable(data[0]) && data[1] == (ARY_FLAG | CURRY_FLAG | PARTIAL_FLAG | REARG_FLAG) && !data[4].length && data[9] == 1) {
            wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
          } else {
            wrapper = (func.length == 1 && isLaziable(func)) ? wrapper[funcName]() : wrapper.thru(func);
          }
        }
        return function() {
          var args = arguments,
              value = args[0];

          if (wrapper && args.length == 1 && isArray(value) && value.length >= LARGE_ARRAY_SIZE) {
            return wrapper.plant(value).value();
          }
          var index = 0,
              result = length ? funcs[index].apply(this, args) : value;

          while (++index < length) {
            result = funcs[index].call(this, result);
          }
          return result;
        };
      };
    }

    /**
     * Creates a function for `_.forEach` or `_.forEachRight`.
     *
     * @private
     * @param {Function} arrayFunc The function to iterate over an array.
     * @param {Function} eachFunc The function to iterate over a collection.
     * @returns {Function} Returns the new each function.
     */
    function createForEach(arrayFunc, eachFunc) {
      return function(collection, iteratee, thisArg) {
        return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
          ? arrayFunc(collection, iteratee)
          : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
      };
    }

    /**
     * Creates a function for `_.forIn` or `_.forInRight`.
     *
     * @private
     * @param {Function} objectFunc The function to iterate over an object.
     * @returns {Function} Returns the new each function.
     */
    function createForIn(objectFunc) {
      return function(object, iteratee, thisArg) {
        if (typeof iteratee != 'function' || thisArg !== undefined) {
          iteratee = bindCallback(iteratee, thisArg, 3);
        }
        return objectFunc(object, iteratee, keysIn);
      };
    }

    /**
     * Creates a function for `_.forOwn` or `_.forOwnRight`.
     *
     * @private
     * @param {Function} objectFunc The function to iterate over an object.
     * @returns {Function} Returns the new each function.
     */
    function createForOwn(objectFunc) {
      return function(object, iteratee, thisArg) {
        if (typeof iteratee != 'function' || thisArg !== undefined) {
          iteratee = bindCallback(iteratee, thisArg, 3);
        }
        return objectFunc(object, iteratee);
      };
    }

    /**
     * Creates a function for `_.mapKeys` or `_.mapValues`.
     *
     * @private
     * @param {boolean} [isMapKeys] Specify mapping keys instead of values.
     * @returns {Function} Returns the new map function.
     */
    function createObjectMapper(isMapKeys) {
      return function(object, iteratee, thisArg) {
        var result = {};
        iteratee = getCallback(iteratee, thisArg, 3);

        baseForOwn(object, function(value, key, object) {
          var mapped = iteratee(value, key, object);
          key = isMapKeys ? mapped : key;
          value = isMapKeys ? value : mapped;
          result[key] = value;
        });
        return result;
      };
    }

    /**
     * Creates a function for `_.padLeft` or `_.padRight`.
     *
     * @private
     * @param {boolean} [fromRight] Specify padding from the right.
     * @returns {Function} Returns the new pad function.
     */
    function createPadDir(fromRight) {
      return function(string, length, chars) {
        string = baseToString(string);
        return (fromRight ? string : '') + createPadding(string, length, chars) + (fromRight ? '' : string);
      };
    }

    /**
     * Creates a `_.partial` or `_.partialRight` function.
     *
     * @private
     * @param {boolean} flag The partial bit flag.
     * @returns {Function} Returns the new partial function.
     */
    function createPartial(flag) {
      var partialFunc = restParam(function(func, partials) {
        var holders = replaceHolders(partials, partialFunc.placeholder);
        return createWrapper(func, flag, undefined, partials, holders);
      });
      return partialFunc;
    }

    /**
     * Creates a function for `_.reduce` or `_.reduceRight`.
     *
     * @private
     * @param {Function} arrayFunc The function to iterate over an array.
     * @param {Function} eachFunc The function to iterate over a collection.
     * @returns {Function} Returns the new each function.
     */
    function createReduce(arrayFunc, eachFunc) {
      return function(collection, iteratee, accumulator, thisArg) {
        var initFromArray = arguments.length < 3;
        return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
          ? arrayFunc(collection, iteratee, accumulator, initFromArray)
          : baseReduce(collection, getCallback(iteratee, thisArg, 4), accumulator, initFromArray, eachFunc);
      };
    }

    /**
     * Creates a function that wraps `func` and invokes it with optional `this`
     * binding of, partial application, and currying.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of flags. See `createWrapper` for more details.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {Array} [partials] The arguments to prepend to those provided to the new function.
     * @param {Array} [holders] The `partials` placeholder indexes.
     * @param {Array} [partialsRight] The arguments to append to those provided to the new function.
     * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
     * @param {Array} [argPos] The argument positions of the new function.
     * @param {number} [ary] The arity cap of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new wrapped function.
     */
    function createHybridWrapper(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
      var isAry = bitmask & ARY_FLAG,
          isBind = bitmask & BIND_FLAG,
          isBindKey = bitmask & BIND_KEY_FLAG,
          isCurry = bitmask & CURRY_FLAG,
          isCurryBound = bitmask & CURRY_BOUND_FLAG,
          isCurryRight = bitmask & CURRY_RIGHT_FLAG,
          Ctor = isBindKey ? undefined : createCtorWrapper(func);

      function wrapper() {
        // Avoid `arguments` object use disqualifying optimizations by
        // converting it to an array before providing it to other functions.
        var length = arguments.length,
            index = length,
            args = Array(length);

        while (index--) {
          args[index] = arguments[index];
        }
        if (partials) {
          args = composeArgs(args, partials, holders);
        }
        if (partialsRight) {
          args = composeArgsRight(args, partialsRight, holdersRight);
        }
        if (isCurry || isCurryRight) {
          var placeholder = wrapper.placeholder,
              argsHolders = replaceHolders(args, placeholder);

          length -= argsHolders.length;
          if (length < arity) {
            var newArgPos = argPos ? arrayCopy(argPos) : undefined,
                newArity = nativeMax(arity - length, 0),
                newsHolders = isCurry ? argsHolders : undefined,
                newHoldersRight = isCurry ? undefined : argsHolders,
                newPartials = isCurry ? args : undefined,
                newPartialsRight = isCurry ? undefined : args;

            bitmask |= (isCurry ? PARTIAL_FLAG : PARTIAL_RIGHT_FLAG);
            bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG : PARTIAL_FLAG);

            if (!isCurryBound) {
              bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);
            }
            var newData = [func, bitmask, thisArg, newPartials, newsHolders, newPartialsRight, newHoldersRight, newArgPos, ary, newArity],
                result = createHybridWrapper.apply(undefined, newData);

            if (isLaziable(func)) {
              setData(result, newData);
            }
            result.placeholder = placeholder;
            return result;
          }
        }
        var thisBinding = isBind ? thisArg : this,
            fn = isBindKey ? thisBinding[func] : func;

        if (argPos) {
          args = reorder(args, argPos);
        }
        if (isAry && ary < args.length) {
          args.length = ary;
        }
        if (this && this !== root && this instanceof wrapper) {
          fn = Ctor || createCtorWrapper(func);
        }
        return fn.apply(thisBinding, args);
      }
      return wrapper;
    }

    /**
     * Creates the padding required for `string` based on the given `length`.
     * The `chars` string is truncated if the number of characters exceeds `length`.
     *
     * @private
     * @param {string} string The string to create padding for.
     * @param {number} [length=0] The padding length.
     * @param {string} [chars=' '] The string used as padding.
     * @returns {string} Returns the pad for `string`.
     */
    function createPadding(string, length, chars) {
      var strLength = string.length;
      length = +length;

      if (strLength >= length || !nativeIsFinite(length)) {
        return '';
      }
      var padLength = length - strLength;
      chars = chars == null ? ' ' : (chars + '');
      return repeat(chars, nativeCeil(padLength / chars.length)).slice(0, padLength);
    }

    /**
     * Creates a function that wraps `func` and invokes it with the optional `this`
     * binding of `thisArg` and the `partials` prepended to those provided to
     * the wrapper.
     *
     * @private
     * @param {Function} func The function to partially apply arguments to.
     * @param {number} bitmask The bitmask of flags. See `createWrapper` for more details.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {Array} partials The arguments to prepend to those provided to the new function.
     * @returns {Function} Returns the new bound function.
     */
    function createPartialWrapper(func, bitmask, thisArg, partials) {
      var isBind = bitmask & BIND_FLAG,
          Ctor = createCtorWrapper(func);

      function wrapper() {
        // Avoid `arguments` object use disqualifying optimizations by
        // converting it to an array before providing it `func`.
        var argsIndex = -1,
            argsLength = arguments.length,
            leftIndex = -1,
            leftLength = partials.length,
            args = Array(leftLength + argsLength);

        while (++leftIndex < leftLength) {
          args[leftIndex] = partials[leftIndex];
        }
        while (argsLength--) {
          args[leftIndex++] = arguments[++argsIndex];
        }
        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
        return fn.apply(isBind ? thisArg : this, args);
      }
      return wrapper;
    }

    /**
     * Creates a `_.ceil`, `_.floor`, or `_.round` function.
     *
     * @private
     * @param {string} methodName The name of the `Math` method to use when rounding.
     * @returns {Function} Returns the new round function.
     */
    function createRound(methodName) {
      var func = Math[methodName];
      return function(number, precision) {
        precision = precision === undefined ? 0 : (+precision || 0);
        if (precision) {
          precision = pow(10, precision);
          return func(number * precision) / precision;
        }
        return func(number);
      };
    }

    /**
     * Creates a `_.sortedIndex` or `_.sortedLastIndex` function.
     *
     * @private
     * @param {boolean} [retHighest] Specify returning the highest qualified index.
     * @returns {Function} Returns the new index function.
     */
    function createSortedIndex(retHighest) {
      return function(array, value, iteratee, thisArg) {
        var callback = getCallback(iteratee);
        return (iteratee == null && callback === baseCallback)
          ? binaryIndex(array, value, retHighest)
          : binaryIndexBy(array, value, callback(iteratee, thisArg, 1), retHighest);
      };
    }

    /**
     * Creates a function that either curries or invokes `func` with optional
     * `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of flags.
     *  The bitmask may be composed of the following flags:
     *     1 - `_.bind`
     *     2 - `_.bindKey`
     *     4 - `_.curry` or `_.curryRight` of a bound function
     *     8 - `_.curry`
     *    16 - `_.curryRight`
     *    32 - `_.partial`
     *    64 - `_.partialRight`
     *   128 - `_.rearg`
     *   256 - `_.ary`
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {Array} [partials] The arguments to be partially applied.
     * @param {Array} [holders] The `partials` placeholder indexes.
     * @param {Array} [argPos] The argument positions of the new function.
     * @param {number} [ary] The arity cap of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new wrapped function.
     */
    function createWrapper(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
      var isBindKey = bitmask & BIND_KEY_FLAG;
      if (!isBindKey && typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var length = partials ? partials.length : 0;
      if (!length) {
        bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG);
        partials = holders = undefined;
      }
      length -= (holders ? holders.length : 0);
      if (bitmask & PARTIAL_RIGHT_FLAG) {
        var partialsRight = partials,
            holdersRight = holders;

        partials = holders = undefined;
      }
      var data = isBindKey ? undefined : getData(func),
          newData = [func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity];

      if (data) {
        mergeData(newData, data);
        bitmask = newData[1];
        arity = newData[9];
      }
      newData[9] = arity == null
        ? (isBindKey ? 0 : func.length)
        : (nativeMax(arity - length, 0) || 0);

      if (bitmask == BIND_FLAG) {
        var result = createBindWrapper(newData[0], newData[2]);
      } else if ((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !newData[4].length) {
        result = createPartialWrapper.apply(undefined, newData);
      } else {
        result = createHybridWrapper.apply(undefined, newData);
      }
      var setter = data ? baseSetData : setData;
      return setter(result, newData);
    }

    /**
     * A specialized version of `baseIsEqualDeep` for arrays with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Array} array The array to compare.
     * @param {Array} other The other array to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} [customizer] The function to customize comparing arrays.
     * @param {boolean} [isLoose] Specify performing partial comparisons.
     * @param {Array} [stackA] Tracks traversed `value` objects.
     * @param {Array} [stackB] Tracks traversed `other` objects.
     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
     */
    function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
      var index = -1,
          arrLength = array.length,
          othLength = other.length;

      if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
        return false;
      }
      // Ignore non-index properties.
      while (++index < arrLength) {
        var arrValue = array[index],
            othValue = other[index],
            result = customizer ? customizer(isLoose ? othValue : arrValue, isLoose ? arrValue : othValue, index) : undefined;

        if (result !== undefined) {
          if (result) {
            continue;
          }
          return false;
        }
        // Recursively compare arrays (susceptible to call stack limits).
        if (isLoose) {
          if (!arraySome(other, function(othValue) {
                return arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
              })) {
            return false;
          }
        } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB))) {
          return false;
        }
      }
      return true;
    }

    /**
     * A specialized version of `baseIsEqualDeep` for comparing objects of
     * the same `toStringTag`.
     *
     * **Note:** This function only supports comparing values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {string} tag The `toStringTag` of the objects to compare.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalByTag(object, other, tag) {
      switch (tag) {
        case boolTag:
        case dateTag:
          // Coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
          return +object == +other;

        case errorTag:
          return object.name == other.name && object.message == other.message;

        case numberTag:
          // Treat `NaN` vs. `NaN` as equal.
          return (object != +object)
            ? other != +other
            : object == +other;

        case regexpTag:
        case stringTag:
          // Coerce regexes to strings and treat strings primitives and string
          // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
          return object == (other + '');
      }
      return false;
    }

    /**
     * A specialized version of `baseIsEqualDeep` for objects with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} [customizer] The function to customize comparing values.
     * @param {boolean} [isLoose] Specify performing partial comparisons.
     * @param {Array} [stackA] Tracks traversed `value` objects.
     * @param {Array} [stackB] Tracks traversed `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
      var objProps = keys(object),
          objLength = objProps.length,
          othProps = keys(other),
          othLength = othProps.length;

      if (objLength != othLength && !isLoose) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) {
          return false;
        }
      }
      var skipCtor = isLoose;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key],
            othValue = other[key],
            result = customizer ? customizer(isLoose ? othValue : objValue, isLoose? objValue : othValue, key) : undefined;

        // Recursively compare objects (susceptible to call stack limits).
        if (!(result === undefined ? equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB) : result)) {
          return false;
        }
        skipCtor || (skipCtor = key == 'constructor');
      }
      if (!skipCtor) {
        var objCtor = object.constructor,
            othCtor = other.constructor;

        // Non `Object` object instances with different constructors are not equal.
        if (objCtor != othCtor &&
            ('constructor' in object && 'constructor' in other) &&
            !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
              typeof othCtor == 'function' && othCtor instanceof othCtor)) {
          return false;
        }
      }
      return true;
    }

    /**
     * Gets the appropriate "callback" function. If the `_.callback` method is
     * customized this function returns the custom method, otherwise it returns
     * the `baseCallback` function. If arguments are provided the chosen function
     * is invoked with them and its result is returned.
     *
     * @private
     * @returns {Function} Returns the chosen function or its result.
     */
    function getCallback(func, thisArg, argCount) {
      var result = lodash.callback || callback;
      result = result === callback ? baseCallback : result;
      return argCount ? result(func, thisArg, argCount) : result;
    }

    /**
     * Gets metadata for `func`.
     *
     * @private
     * @param {Function} func The function to query.
     * @returns {*} Returns the metadata for `func`.
     */
    var getData = !metaMap ? noop : function(func) {
      return metaMap.get(func);
    };

    /**
     * Gets the name of `func`.
     *
     * @private
     * @param {Function} func The function to query.
     * @returns {string} Returns the function name.
     */
    function getFuncName(func) {
      var result = func.name,
          array = realNames[result],
          length = array ? array.length : 0;

      while (length--) {
        var data = array[length],
            otherFunc = data.func;
        if (otherFunc == null || otherFunc == func) {
          return data.name;
        }
      }
      return result;
    }

    /**
     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
     * customized this function returns the custom method, otherwise it returns
     * the `baseIndexOf` function. If arguments are provided the chosen function
     * is invoked with them and its result is returned.
     *
     * @private
     * @returns {Function|number} Returns the chosen function or its result.
     */
    function getIndexOf(collection, target, fromIndex) {
      var result = lodash.indexOf || indexOf;
      result = result === indexOf ? baseIndexOf : result;
      return collection ? result(collection, target, fromIndex) : result;
    }

    /**
     * Gets the "length" property value of `object`.
     *
     * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
     * that affects Safari on at least iOS 8.1-8.3 ARM64.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {*} Returns the "length" value.
     */
    var getLength = baseProperty('length');

    /**
     * Gets the propery names, values, and compare flags of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the match data of `object`.
     */
    function getMatchData(object) {
      var result = pairs(object),
          length = result.length;

      while (length--) {
        result[length][2] = isStrictComparable(result[length][1]);
      }
      return result;
    }

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = object == null ? undefined : object[key];
      return isNative(value) ? value : undefined;
    }

    /**
     * Gets the view, applying any `transforms` to the `start` and `end` positions.
     *
     * @private
     * @param {number} start The start of the view.
     * @param {number} end The end of the view.
     * @param {Array} transforms The transformations to apply to the view.
     * @returns {Object} Returns an object containing the `start` and `end`
     *  positions of the view.
     */
    function getView(start, end, transforms) {
      var index = -1,
          length = transforms.length;

      while (++index < length) {
        var data = transforms[index],
            size = data.size;

        switch (data.type) {
          case 'drop':      start += size; break;
          case 'dropRight': end -= size; break;
          case 'take':      end = nativeMin(end, start + size); break;
          case 'takeRight': start = nativeMax(start, end - size); break;
        }
      }
      return { 'start': start, 'end': end };
    }

    /**
     * Initializes an array clone.
     *
     * @private
     * @param {Array} array The array to clone.
     * @returns {Array} Returns the initialized clone.
     */
    function initCloneArray(array) {
      var length = array.length,
          result = new array.constructor(length);

      // Add array properties assigned by `RegExp#exec`.
      if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }

    /**
     * Initializes an object clone.
     *
     * @private
     * @param {Object} object The object to clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneObject(object) {
      var Ctor = object.constructor;
      if (!(typeof Ctor == 'function' && Ctor instanceof Ctor)) {
        Ctor = Object;
      }
      return new Ctor;
    }

    /**
     * Initializes an object clone based on its `toStringTag`.
     *
     * **Note:** This function only supports cloning values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to clone.
     * @param {string} tag The `toStringTag` of the object to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneByTag(object, tag, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag:
          return bufferClone(object);

        case boolTag:
        case dateTag:
          return new Ctor(+object);

        case float32Tag: case float64Tag:
        case int8Tag: case int16Tag: case int32Tag:
        case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
          var buffer = object.buffer;
          return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);

        case numberTag:
        case stringTag:
          return new Ctor(object);

        case regexpTag:
          var result = new Ctor(object.source, reFlags.exec(object));
          result.lastIndex = object.lastIndex;
      }
      return result;
    }

    /**
     * Invokes the method at `path` on `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the method to invoke.
     * @param {Array} args The arguments to invoke the method with.
     * @returns {*} Returns the result of the invoked method.
     */
    function invokePath(object, path, args) {
      if (object != null && !isKey(path, object)) {
        path = toPath(path);
        object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
        path = last(path);
      }
      var func = object == null ? object : object[path];
      return func == null ? undefined : func.apply(object, args);
    }

    /**
     * Checks if `value` is array-like.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     */
    function isArrayLike(value) {
      return value != null && isLength(getLength(value));
    }

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
      length = length == null ? MAX_SAFE_INTEGER : length;
      return value > -1 && value % 1 == 0 && value < length;
    }

    /**
     * Checks if the provided arguments are from an iteratee call.
     *
     * @private
     * @param {*} value The potential iteratee value argument.
     * @param {*} index The potential iteratee index or key argument.
     * @param {*} object The potential iteratee object argument.
     * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
     */
    function isIterateeCall(value, index, object) {
      if (!isObject(object)) {
        return false;
      }
      var type = typeof index;
      if (type == 'number'
          ? (isArrayLike(object) && isIndex(index, object.length))
          : (type == 'string' && index in object)) {
        var other = object[index];
        return value === value ? (value === other) : (other !== other);
      }
      return false;
    }

    /**
     * Checks if `value` is a property name and not a property path.
     *
     * @private
     * @param {*} value The value to check.
     * @param {Object} [object] The object to query keys on.
     * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
     */
    function isKey(value, object) {
      var type = typeof value;
      if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
        return true;
      }
      if (isArray(value)) {
        return false;
      }
      var result = !reIsDeepProp.test(value);
      return result || (object != null && value in toObject(object));
    }

    /**
     * Checks if `func` has a lazy counterpart.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` has a lazy counterpart, else `false`.
     */
    function isLaziable(func) {
      var funcName = getFuncName(func);
      if (!(funcName in LazyWrapper.prototype)) {
        return false;
      }
      var other = lodash[funcName];
      if (func === other) {
        return true;
      }
      var data = getData(other);
      return !!data && func === data[0];
    }

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     */
    function isLength(value) {
      return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    /**
     * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` if suitable for strict
     *  equality comparisons, else `false`.
     */
    function isStrictComparable(value) {
      return value === value && !isObject(value);
    }

    /**
     * Merges the function metadata of `source` into `data`.
     *
     * Merging metadata reduces the number of wrappers required to invoke a function.
     * This is possible because methods like `_.bind`, `_.curry`, and `_.partial`
     * may be applied regardless of execution order. Methods like `_.ary` and `_.rearg`
     * augment function arguments, making the order in which they are executed important,
     * preventing the merging of metadata. However, we make an exception for a safe
     * common case where curried functions have `_.ary` and or `_.rearg` applied.
     *
     * @private
     * @param {Array} data The destination metadata.
     * @param {Array} source The source metadata.
     * @returns {Array} Returns `data`.
     */
    function mergeData(data, source) {
      var bitmask = data[1],
          srcBitmask = source[1],
          newBitmask = bitmask | srcBitmask,
          isCommon = newBitmask < ARY_FLAG;

      var isCombo =
        (srcBitmask == ARY_FLAG && bitmask == CURRY_FLAG) ||
        (srcBitmask == ARY_FLAG && bitmask == REARG_FLAG && data[7].length <= source[8]) ||
        (srcBitmask == (ARY_FLAG | REARG_FLAG) && bitmask == CURRY_FLAG);

      // Exit early if metadata can't be merged.
      if (!(isCommon || isCombo)) {
        return data;
      }
      // Use source `thisArg` if available.
      if (srcBitmask & BIND_FLAG) {
        data[2] = source[2];
        // Set when currying a bound function.
        newBitmask |= (bitmask & BIND_FLAG) ? 0 : CURRY_BOUND_FLAG;
      }
      // Compose partial arguments.
      var value = source[3];
      if (value) {
        var partials = data[3];
        data[3] = partials ? composeArgs(partials, value, source[4]) : arrayCopy(value);
        data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : arrayCopy(source[4]);
      }
      // Compose partial right arguments.
      value = source[5];
      if (value) {
        partials = data[5];
        data[5] = partials ? composeArgsRight(partials, value, source[6]) : arrayCopy(value);
        data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : arrayCopy(source[6]);
      }
      // Use source `argPos` if available.
      value = source[7];
      if (value) {
        data[7] = arrayCopy(value);
      }
      // Use source `ary` if it's smaller.
      if (srcBitmask & ARY_FLAG) {
        data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
      }
      // Use source `arity` if one is not provided.
      if (data[9] == null) {
        data[9] = source[9];
      }
      // Use source `func` and merge bitmasks.
      data[0] = source[0];
      data[1] = newBitmask;

      return data;
    }

    /**
     * Used by `_.defaultsDeep` to customize its `_.merge` use.
     *
     * @private
     * @param {*} objectValue The destination object property value.
     * @param {*} sourceValue The source object property value.
     * @returns {*} Returns the value to assign to the destination object.
     */
    function mergeDefaults(objectValue, sourceValue) {
      return objectValue === undefined ? sourceValue : merge(objectValue, sourceValue, mergeDefaults);
    }

    /**
     * A specialized version of `_.pick` which picks `object` properties specified
     * by `props`.
     *
     * @private
     * @param {Object} object The source object.
     * @param {string[]} props The property names to pick.
     * @returns {Object} Returns the new object.
     */
    function pickByArray(object, props) {
      object = toObject(object);

      var index = -1,
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        if (key in object) {
          result[key] = object[key];
        }
      }
      return result;
    }

    /**
     * A specialized version of `_.pick` which picks `object` properties `predicate`
     * returns truthy for.
     *
     * @private
     * @param {Object} object The source object.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Object} Returns the new object.
     */
    function pickByCallback(object, predicate) {
      var result = {};
      baseForIn(object, function(value, key, object) {
        if (predicate(value, key, object)) {
          result[key] = value;
        }
      });
      return result;
    }

    /**
     * Reorder `array` according to the specified indexes where the element at
     * the first index is assigned as the first element, the element at
     * the second index is assigned as the second element, and so on.
     *
     * @private
     * @param {Array} array The array to reorder.
     * @param {Array} indexes The arranged array indexes.
     * @returns {Array} Returns `array`.
     */
    function reorder(array, indexes) {
      var arrLength = array.length,
          length = nativeMin(indexes.length, arrLength),
          oldArray = arrayCopy(array);

      while (length--) {
        var index = indexes[length];
        array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
      }
      return array;
    }

    /**
     * Sets metadata for `func`.
     *
     * **Note:** If this function becomes hot, i.e. is invoked a lot in a short
     * period of time, it will trip its breaker and transition to an identity function
     * to avoid garbage collection pauses in V8. See [V8 issue 2070](https://code.google.com/p/v8/issues/detail?id=2070)
     * for more details.
     *
     * @private
     * @param {Function} func The function to associate metadata with.
     * @param {*} data The metadata.
     * @returns {Function} Returns `func`.
     */
    var setData = (function() {
      var count = 0,
          lastCalled = 0;

      return function(key, value) {
        var stamp = now(),
            remaining = HOT_SPAN - (stamp - lastCalled);

        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return key;
          }
        } else {
          count = 0;
        }
        return baseSetData(key, value);
      };
    }());

    /**
     * A fallback implementation of `Object.keys` which creates an array of the
     * own enumerable property names of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function shimKeys(object) {
      var props = keysIn(object),
          propsLength = props.length,
          length = propsLength && object.length;

      var allowIndexes = !!length && isLength(length) &&
        (isArray(object) || isArguments(object));

      var index = -1,
          result = [];

      while (++index < propsLength) {
        var key = props[index];
        if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Converts `value` to an array-like object if it's not one.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {Array|Object} Returns the array-like object.
     */
    function toIterable(value) {
      if (value == null) {
        return [];
      }
      if (!isArrayLike(value)) {
        return values(value);
      }
      return isObject(value) ? value : Object(value);
    }

    /**
     * Converts `value` to an object if it's not one.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {Object} Returns the object.
     */
    function toObject(value) {
      return isObject(value) ? value : Object(value);
    }

    /**
     * Converts `value` to property path array if it's not one.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {Array} Returns the property path array.
     */
    function toPath(value) {
      if (isArray(value)) {
        return value;
      }
      var result = [];
      baseToString(value).replace(rePropName, function(match, number, quote, string) {
        result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
      });
      return result;
    }

    /**
     * Creates a clone of `wrapper`.
     *
     * @private
     * @param {Object} wrapper The wrapper to clone.
     * @returns {Object} Returns the cloned wrapper.
     */
    function wrapperClone(wrapper) {
      return wrapper instanceof LazyWrapper
        ? wrapper.clone()
        : new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__, arrayCopy(wrapper.__actions__));
    }

    /*------------------------------------------------------------------------*/

    /**
     * Creates an array of elements split into groups the length of `size`.
     * If `collection` can't be split evenly, the final chunk will be the remaining
     * elements.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to process.
     * @param {number} [size=1] The length of each chunk.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Array} Returns the new array containing chunks.
     * @example
     *
     * _.chunk(['a', 'b', 'c', 'd'], 2);
     * // => [['a', 'b'], ['c', 'd']]
     *
     * _.chunk(['a', 'b', 'c', 'd'], 3);
     * // => [['a', 'b', 'c'], ['d']]
     */
    function chunk(array, size, guard) {
      if (guard ? isIterateeCall(array, size, guard) : size == null) {
        size = 1;
      } else {
        size = nativeMax(nativeFloor(size) || 1, 1);
      }
      var index = 0,
          length = array ? array.length : 0,
          resIndex = -1,
          result = Array(nativeCeil(length / size));

      while (index < length) {
        result[++resIndex] = baseSlice(array, index, (index += size));
      }
      return result;
    }

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are falsey.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to compact.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          resIndex = -1,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result[++resIndex] = value;
        }
      }
      return result;
    }

    /**
     * Creates an array of unique `array` values not included in the other
     * provided arrays using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {...Array} [values] The arrays of values to exclude.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * _.difference([1, 2, 3], [4, 2]);
     * // => [1, 3]
     */
    var difference = restParam(function(array, values) {
      return (isObjectLike(array) && isArrayLike(array))
        ? baseDifference(array, baseFlatten(values, false, true))
        : [];
    });

    /**
     * Creates a slice of `array` with `n` elements dropped from the beginning.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=1] The number of elements to drop.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.drop([1, 2, 3]);
     * // => [2, 3]
     *
     * _.drop([1, 2, 3], 2);
     * // => [3]
     *
     * _.drop([1, 2, 3], 5);
     * // => []
     *
     * _.drop([1, 2, 3], 0);
     * // => [1, 2, 3]
     */
    function drop(array, n, guard) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      if (guard ? isIterateeCall(array, n, guard) : n == null) {
        n = 1;
      }
      return baseSlice(array, n < 0 ? 0 : n);
    }

    /**
     * Creates a slice of `array` with `n` elements dropped from the end.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=1] The number of elements to drop.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.dropRight([1, 2, 3]);
     * // => [1, 2]
     *
     * _.dropRight([1, 2, 3], 2);
     * // => [1]
     *
     * _.dropRight([1, 2, 3], 5);
     * // => []
     *
     * _.dropRight([1, 2, 3], 0);
     * // => [1, 2, 3]
     */
    function dropRight(array, n, guard) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      if (guard ? isIterateeCall(array, n, guard) : n == null) {
        n = 1;
      }
      n = length - (+n || 0);
      return baseSlice(array, 0, n < 0 ? 0 : n);
    }

    /**
     * Creates a slice of `array` excluding elements dropped from the end.
     * Elements are dropped until `predicate` returns falsey. The predicate is
     * bound to `thisArg` and invoked with three arguments: (value, index, array).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that match the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.dropRightWhile([1, 2, 3], function(n) {
     *   return n > 1;
     * });
     * // => [1]
     *
     * var users = [
     *   { 'user': 'barney',  'active': true },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': false }
     * ];
     *
     * // using the `_.matches` callback shorthand
     * _.pluck(_.dropRightWhile(users, { 'user': 'pebbles', 'active': false }), 'user');
     * // => ['barney', 'fred']
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.pluck(_.dropRightWhile(users, 'active', false), 'user');
     * // => ['barney']
     *
     * // using the `_.property` callback shorthand
     * _.pluck(_.dropRightWhile(users, 'active'), 'user');
     * // => ['barney', 'fred', 'pebbles']
     */
    function dropRightWhile(array, predicate, thisArg) {
      return (array && array.length)
        ? baseWhile(array, getCallback(predicate, thisArg, 3), true, true)
        : [];
    }

    /**
     * Creates a slice of `array` excluding elements dropped from the beginning.
     * Elements are dropped until `predicate` returns falsey. The predicate is
     * bound to `thisArg` and invoked with three arguments: (value, index, array).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.dropWhile([1, 2, 3], function(n) {
     *   return n < 3;
     * });
     * // => [3]
     *
     * var users = [
     *   { 'user': 'barney',  'active': false },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': true }
     * ];
     *
     * // using the `_.matches` callback shorthand
     * _.pluck(_.dropWhile(users, { 'user': 'barney', 'active': false }), 'user');
     * // => ['fred', 'pebbles']
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.pluck(_.dropWhile(users, 'active', false), 'user');
     * // => ['pebbles']
     *
     * // using the `_.property` callback shorthand
     * _.pluck(_.dropWhile(users, 'active'), 'user');
     * // => ['barney', 'fred', 'pebbles']
     */
    function dropWhile(array, predicate, thisArg) {
      return (array && array.length)
        ? baseWhile(array, getCallback(predicate, thisArg, 3), true)
        : [];
    }

    /**
     * Fills elements of `array` with `value` from `start` up to, but not
     * including, `end`.
     *
     * **Note:** This method mutates `array`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to fill.
     * @param {*} value The value to fill `array` with.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3];
     *
     * _.fill(array, 'a');
     * console.log(array);
     * // => ['a', 'a', 'a']
     *
     * _.fill(Array(3), 2);
     * // => [2, 2, 2]
     *
     * _.fill([4, 6, 8], '*', 1, 2);
     * // => [4, '*', 8]
     */
    function fill(array, value, start, end) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      if (start && typeof start != 'number' && isIterateeCall(array, value, start)) {
        start = 0;
        end = length;
      }
      return baseFill(array, value, start, end);
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element `predicate` returns truthy for instead of the element itself.
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': false },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': true }
     * ];
     *
     * _.findIndex(users, function(chr) {
     *   return chr.user == 'barney';
     * });
     * // => 0
     *
     * // using the `_.matches` callback shorthand
     * _.findIndex(users, { 'user': 'fred', 'active': false });
     * // => 1
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.findIndex(users, 'active', false);
     * // => 0
     *
     * // using the `_.property` callback shorthand
     * _.findIndex(users, 'active');
     * // => 2
     */
    var findIndex = createFindIndex();

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of `collection` from right to left.
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': true },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': false }
     * ];
     *
     * _.findLastIndex(users, function(chr) {
     *   return chr.user == 'pebbles';
     * });
     * // => 2
     *
     * // using the `_.matches` callback shorthand
     * _.findLastIndex(users, { 'user': 'barney', 'active': true });
     * // => 0
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.findLastIndex(users, 'active', false);
     * // => 2
     *
     * // using the `_.property` callback shorthand
     * _.findLastIndex(users, 'active');
     * // => 0
     */
    var findLastIndex = createFindIndex(true);

    /**
     * Gets the first element of `array`.
     *
     * @static
     * @memberOf _
     * @alias head
     * @category Array
     * @param {Array} array The array to query.
     * @returns {*} Returns the first element of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([]);
     * // => undefined
     */
    function first(array) {
      return array ? array[0] : undefined;
    }

    /**
     * Flattens a nested array. If `isDeep` is `true` the array is recursively
     * flattened, otherwise it is only flattened a single level.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to flatten.
     * @param {boolean} [isDeep] Specify a deep flatten.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Array} Returns the new flattened array.
     * @example
     *
     * _.flatten([1, [2, 3, [4]]]);
     * // => [1, 2, 3, [4]]
     *
     * // using `isDeep`
     * _.flatten([1, [2, 3, [4]]], true);
     * // => [1, 2, 3, 4]
     */
    function flatten(array, isDeep, guard) {
      var length = array ? array.length : 0;
      if (guard && isIterateeCall(array, isDeep, guard)) {
        isDeep = false;
      }
      return length ? baseFlatten(array, isDeep) : [];
    }

    /**
     * Recursively flattens a nested array.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to recursively flatten.
     * @returns {Array} Returns the new flattened array.
     * @example
     *
     * _.flattenDeep([1, [2, 3, [4]]]);
     * // => [1, 2, 3, 4]
     */
    function flattenDeep(array) {
      var length = array ? array.length : 0;
      return length ? baseFlatten(array, true) : [];
    }

    /**
     * Gets the index at which the first occurrence of `value` is found in `array`
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
     * for equality comparisons. If `fromIndex` is negative, it is used as the offset
     * from the end of `array`. If `array` is sorted providing `true` for `fromIndex`
     * performs a faster binary search.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
     *  to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value, else `-1`.
     * @example
     *
     * _.indexOf([1, 2, 1, 2], 2);
     * // => 1
     *
     * // using `fromIndex`
     * _.indexOf([1, 2, 1, 2], 2, 2);
     * // => 3
     *
     * // performing a binary search
     * _.indexOf([1, 1, 2, 2], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      var length = array ? array.length : 0;
      if (!length) {
        return -1;
      }
      if (typeof fromIndex == 'number') {
        fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : fromIndex;
      } else if (fromIndex) {
        var index = binaryIndex(array, value);
        if (index < length &&
            (value === value ? (value === array[index]) : (array[index] !== array[index]))) {
          return index;
        }
        return -1;
      }
      return baseIndexOf(array, value, fromIndex || 0);
    }

    /**
     * Gets all but the last element of `array`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     */
    function initial(array) {
      return dropRight(array, 1);
    }

    /**
     * Creates an array of unique values that are included in all of the provided
     * arrays using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @returns {Array} Returns the new array of shared values.
     * @example
     * _.intersection([1, 2], [4, 2], [2, 1]);
     * // => [2]
     */
    var intersection = restParam(function(arrays) {
      var othLength = arrays.length,
          othIndex = othLength,
          caches = Array(length),
          indexOf = getIndexOf(),
          isCommon = indexOf == baseIndexOf,
          result = [];

      while (othIndex--) {
        var value = arrays[othIndex] = isArrayLike(value = arrays[othIndex]) ? value : [];
        caches[othIndex] = (isCommon && value.length >= 120) ? createCache(othIndex && value) : null;
      }
      var array = arrays[0],
          index = -1,
          length = array ? array.length : 0,
          seen = caches[0];

      outer:
      while (++index < length) {
        value = array[index];
        if ((seen ? cacheIndexOf(seen, value) : indexOf(result, value, 0)) < 0) {
          var othIndex = othLength;
          while (--othIndex) {
            var cache = caches[othIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(arrays[othIndex], value, 0)) < 0) {
              continue outer;
            }
          }
          if (seen) {
            seen.push(value);
          }
          result.push(value);
        }
      }
      return result;
    });

    /**
     * Gets the last element of `array`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @returns {*} Returns the last element of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     */
    function last(array) {
      var length = array ? array.length : 0;
      return length ? array[length - 1] : undefined;
    }

    /**
     * This method is like `_.indexOf` except that it iterates over elements of
     * `array` from right to left.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=array.length-1] The index to search from
     *  or `true` to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value, else `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 1, 2], 2);
     * // => 3
     *
     * // using `fromIndex`
     * _.lastIndexOf([1, 2, 1, 2], 2, 2);
     * // => 1
     *
     * // performing a binary search
     * _.lastIndexOf([1, 1, 2, 2], 2, true);
     * // => 3
     */
    function lastIndexOf(array, value, fromIndex) {
      var length = array ? array.length : 0;
      if (!length) {
        return -1;
      }
      var index = length;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(length + fromIndex, 0) : nativeMin(fromIndex || 0, length - 1)) + 1;
      } else if (fromIndex) {
        index = binaryIndex(array, value, true) - 1;
        var other = array[index];
        if (value === value ? (value === other) : (other !== other)) {
          return index;
        }
        return -1;
      }
      if (value !== value) {
        return indexOfNaN(array, index, true);
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all provided values from `array` using
     * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * **Note:** Unlike `_.without`, this method mutates `array`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to modify.
     * @param {...*} [values] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     *
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    function pull() {
      var args = arguments,
          array = args[0];

      if (!(array && array.length)) {
        return array;
      }
      var index = 0,
          indexOf = getIndexOf(),
          length = args.length;

      while (++index < length) {
        var fromIndex = 0,
            value = args[index];

        while ((fromIndex = indexOf(array, value, fromIndex)) > -1) {
          splice.call(array, fromIndex, 1);
        }
      }
      return array;
    }

    /**
     * Removes elements from `array` corresponding to the given indexes and returns
     * an array of the removed elements. Indexes may be specified as an array of
     * indexes or as individual arguments.
     *
     * **Note:** Unlike `_.at`, this method mutates `array`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to modify.
     * @param {...(number|number[])} [indexes] The indexes of elements to remove,
     *  specified as individual indexes or arrays of indexes.
     * @returns {Array} Returns the new array of removed elements.
     * @example
     *
     * var array = [5, 10, 15, 20];
     * var evens = _.pullAt(array, 1, 3);
     *
     * console.log(array);
     * // => [5, 15]
     *
     * console.log(evens);
     * // => [10, 20]
     */
    var pullAt = restParam(function(array, indexes) {
      indexes = baseFlatten(indexes);

      var result = baseAt(array, indexes);
      basePullAt(array, indexes.sort(baseCompareAscending));
      return result;
    });

    /**
     * Removes all elements from `array` that `predicate` returns truthy for
     * and returns an array of the removed elements. The predicate is bound to
     * `thisArg` and invoked with three arguments: (value, index, array).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * **Note:** Unlike `_.filter`, this method mutates `array`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to modify.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Array} Returns the new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4];
     * var evens = _.remove(array, function(n) {
     *   return n % 2 == 0;
     * });
     *
     * console.log(array);
     * // => [1, 3]
     *
     * console.log(evens);
     * // => [2, 4]
     */
    function remove(array, predicate, thisArg) {
      var result = [];
      if (!(array && array.length)) {
        return result;
      }
      var index = -1,
          indexes = [],
          length = array.length;

      predicate = getCallback(predicate, thisArg, 3);
      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result.push(value);
          indexes.push(index);
        }
      }
      basePullAt(array, indexes);
      return result;
    }

    /**
     * Gets all but the first element of `array`.
     *
     * @static
     * @memberOf _
     * @alias tail
     * @category Array
     * @param {Array} array The array to query.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     */
    function rest(array) {
      return drop(array, 1);
    }

    /**
     * Creates a slice of `array` from `start` up to, but not including, `end`.
     *
     * **Note:** This method is used instead of `Array#slice` to support node
     * lists in IE < 9 and to ensure dense arrays are returned.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to slice.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns the slice of `array`.
     */
    function slice(array, start, end) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      if (end && typeof end != 'number' && isIterateeCall(array, start, end)) {
        start = 0;
        end = length;
      }
      return baseSlice(array, start, end);
    }

    /**
     * Uses a binary search to determine the lowest index at which `value` should
     * be inserted into `array` in order to maintain its sort order. If an iteratee
     * function is provided it is invoked for `value` and each element of `array`
     * to compute their sort ranking. The iteratee is bound to `thisArg` and
     * invoked with one argument; (value).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([30, 50], 40);
     * // => 1
     *
     * _.sortedIndex([4, 4, 5, 5], 5);
     * // => 2
     *
     * var dict = { 'data': { 'thirty': 30, 'forty': 40, 'fifty': 50 } };
     *
     * // using an iteratee function
     * _.sortedIndex(['thirty', 'fifty'], 'forty', function(word) {
     *   return this.data[word];
     * }, dict);
     * // => 1
     *
     * // using the `_.property` callback shorthand
     * _.sortedIndex([{ 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 1
     */
    var sortedIndex = createSortedIndex();

    /**
     * This method is like `_.sortedIndex` except that it returns the highest
     * index at which `value` should be inserted into `array` in order to
     * maintain its sort order.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedLastIndex([4, 4, 5, 5], 5);
     * // => 4
     */
    var sortedLastIndex = createSortedIndex(true);

    /**
     * Creates a slice of `array` with `n` elements taken from the beginning.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=1] The number of elements to take.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.take([1, 2, 3]);
     * // => [1]
     *
     * _.take([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.take([1, 2, 3], 5);
     * // => [1, 2, 3]
     *
     * _.take([1, 2, 3], 0);
     * // => []
     */
    function take(array, n, guard) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      if (guard ? isIterateeCall(array, n, guard) : n == null) {
        n = 1;
      }
      return baseSlice(array, 0, n < 0 ? 0 : n);
    }

    /**
     * Creates a slice of `array` with `n` elements taken from the end.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=1] The number of elements to take.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.takeRight([1, 2, 3]);
     * // => [3]
     *
     * _.takeRight([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.takeRight([1, 2, 3], 5);
     * // => [1, 2, 3]
     *
     * _.takeRight([1, 2, 3], 0);
     * // => []
     */
    function takeRight(array, n, guard) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      if (guard ? isIterateeCall(array, n, guard) : n == null) {
        n = 1;
      }
      n = length - (+n || 0);
      return baseSlice(array, n < 0 ? 0 : n);
    }

    /**
     * Creates a slice of `array` with elements taken from the end. Elements are
     * taken until `predicate` returns falsey. The predicate is bound to `thisArg`
     * and invoked with three arguments: (value, index, array).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.takeRightWhile([1, 2, 3], function(n) {
     *   return n > 1;
     * });
     * // => [2, 3]
     *
     * var users = [
     *   { 'user': 'barney',  'active': true },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': false }
     * ];
     *
     * // using the `_.matches` callback shorthand
     * _.pluck(_.takeRightWhile(users, { 'user': 'pebbles', 'active': false }), 'user');
     * // => ['pebbles']
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.pluck(_.takeRightWhile(users, 'active', false), 'user');
     * // => ['fred', 'pebbles']
     *
     * // using the `_.property` callback shorthand
     * _.pluck(_.takeRightWhile(users, 'active'), 'user');
     * // => []
     */
    function takeRightWhile(array, predicate, thisArg) {
      return (array && array.length)
        ? baseWhile(array, getCallback(predicate, thisArg, 3), false, true)
        : [];
    }

    /**
     * Creates a slice of `array` with elements taken from the beginning. Elements
     * are taken until `predicate` returns falsey. The predicate is bound to
     * `thisArg` and invoked with three arguments: (value, index, array).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to query.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.takeWhile([1, 2, 3], function(n) {
     *   return n < 3;
     * });
     * // => [1, 2]
     *
     * var users = [
     *   { 'user': 'barney',  'active': false },
     *   { 'user': 'fred',    'active': false},
     *   { 'user': 'pebbles', 'active': true }
     * ];
     *
     * // using the `_.matches` callback shorthand
     * _.pluck(_.takeWhile(users, { 'user': 'barney', 'active': false }), 'user');
     * // => ['barney']
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.pluck(_.takeWhile(users, 'active', false), 'user');
     * // => ['barney', 'fred']
     *
     * // using the `_.property` callback shorthand
     * _.pluck(_.takeWhile(users, 'active'), 'user');
     * // => []
     */
    function takeWhile(array, predicate, thisArg) {
      return (array && array.length)
        ? baseWhile(array, getCallback(predicate, thisArg, 3))
        : [];
    }

    /**
     * Creates an array of unique values, in order, from all of the provided arrays
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @returns {Array} Returns the new array of combined values.
     * @example
     *
     * _.union([1, 2], [4, 2], [2, 1]);
     * // => [1, 2, 4]
     */
    var union = restParam(function(arrays) {
      return baseUniq(baseFlatten(arrays, false, true));
    });

    /**
     * Creates a duplicate-free version of an array, using
     * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
     * for equality comparisons, in which only the first occurence of each element
     * is kept. Providing `true` for `isSorted` performs a faster search algorithm
     * for sorted arrays. If an iteratee function is provided it is invoked for
     * each element in the array to generate the criterion by which uniqueness
     * is computed. The `iteratee` is bound to `thisArg` and invoked with three
     * arguments: (value, index, array).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {boolean} [isSorted] Specify the array is sorted.
     * @param {Function|Object|string} [iteratee] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Array} Returns the new duplicate-value-free array.
     * @example
     *
     * _.uniq([2, 1, 2]);
     * // => [2, 1]
     *
     * // using `isSorted`
     * _.uniq([1, 1, 2], true);
     * // => [1, 2]
     *
     * // using an iteratee function
     * _.uniq([1, 2.5, 1.5, 2], function(n) {
     *   return this.floor(n);
     * }, Math);
     * // => [1, 2.5]
     *
     * // using the `_.property` callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, iteratee, thisArg) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      if (isSorted != null && typeof isSorted != 'boolean') {
        thisArg = iteratee;
        iteratee = isIterateeCall(array, isSorted, thisArg) ? undefined : isSorted;
        isSorted = false;
      }
      var callback = getCallback();
      if (!(iteratee == null && callback === baseCallback)) {
        iteratee = callback(iteratee, thisArg, 3);
      }
      return (isSorted && getIndexOf() == baseIndexOf)
        ? sortedUniq(array, iteratee)
        : baseUniq(array, iteratee);
    }

    /**
     * This method is like `_.zip` except that it accepts an array of grouped
     * elements and creates an array regrouping the elements to their pre-zip
     * configuration.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array of grouped elements to process.
     * @returns {Array} Returns the new array of regrouped elements.
     * @example
     *
     * var zipped = _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     *
     * _.unzip(zipped);
     * // => [['fred', 'barney'], [30, 40], [true, false]]
     */
    function unzip(array) {
      if (!(array && array.length)) {
        return [];
      }
      var index = -1,
          length = 0;

      array = arrayFilter(array, function(group) {
        if (isArrayLike(group)) {
          length = nativeMax(group.length, length);
          return true;
        }
      });
      var result = Array(length);
      while (++index < length) {
        result[index] = arrayMap(array, baseProperty(index));
      }
      return result;
    }

    /**
     * This method is like `_.unzip` except that it accepts an iteratee to specify
     * how regrouped values should be combined. The `iteratee` is bound to `thisArg`
     * and invoked with four arguments: (accumulator, value, index, group).
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array of grouped elements to process.
     * @param {Function} [iteratee] The function to combine regrouped values.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Array} Returns the new array of regrouped elements.
     * @example
     *
     * var zipped = _.zip([1, 2], [10, 20], [100, 200]);
     * // => [[1, 10, 100], [2, 20, 200]]
     *
     * _.unzipWith(zipped, _.add);
     * // => [3, 30, 300]
     */
    function unzipWith(array, iteratee, thisArg) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      var result = unzip(array);
      if (iteratee == null) {
        return result;
      }
      iteratee = bindCallback(iteratee, thisArg, 4);
      return arrayMap(result, function(group) {
        return arrayReduce(group, iteratee, undefined, true);
      });
    }

    /**
     * Creates an array excluding all provided values using
     * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {Array} array The array to filter.
     * @param {...*} [values] The values to exclude.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * _.without([1, 2, 1, 3], 1, 2);
     * // => [3]
     */
    var without = restParam(function(array, values) {
      return isArrayLike(array)
        ? baseDifference(array, values)
        : [];
    });

    /**
     * Creates an array of unique values that is the [symmetric difference](https://en.wikipedia.org/wiki/Symmetric_difference)
     * of the provided arrays.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @returns {Array} Returns the new array of values.
     * @example
     *
     * _.xor([1, 2], [4, 2]);
     * // => [1, 4]
     */
    function xor() {
      var index = -1,
          length = arguments.length;

      while (++index < length) {
        var array = arguments[index];
        if (isArrayLike(array)) {
          var result = result
            ? arrayPush(baseDifference(result, array), baseDifference(array, result))
            : array;
        }
      }
      return result ? baseUniq(result) : [];
    }

    /**
     * Creates an array of grouped elements, the first of which contains the first
     * elements of the given arrays, the second of which contains the second elements
     * of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {...Array} [arrays] The arrays to process.
     * @returns {Array} Returns the new array of grouped elements.
     * @example
     *
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     */
    var zip = restParam(unzip);

    /**
     * The inverse of `_.pairs`; this method returns an object composed from arrays
     * of property names and values. Provide either a single two dimensional array,
     * e.g. `[[key1, value1], [key2, value2]]` or two arrays, one of property names
     * and one of corresponding values.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Array
     * @param {Array} props The property names.
     * @param {Array} [values=[]] The property values.
     * @returns {Object} Returns the new object.
     * @example
     *
     * _.zipObject([['fred', 30], ['barney', 40]]);
     * // => { 'fred': 30, 'barney': 40 }
     *
     * _.zipObject(['fred', 'barney'], [30, 40]);
     * // => { 'fred': 30, 'barney': 40 }
     */
    function zipObject(props, values) {
      var index = -1,
          length = props ? props.length : 0,
          result = {};

      if (length && !values && !isArray(props[0])) {
        values = [];
      }
      while (++index < length) {
        var key = props[index];
        if (values) {
          result[key] = values[index];
        } else if (key) {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /**
     * This method is like `_.zip` except that it accepts an iteratee to specify
     * how grouped values should be combined. The `iteratee` is bound to `thisArg`
     * and invoked with four arguments: (accumulator, value, index, group).
     *
     * @static
     * @memberOf _
     * @category Array
     * @param {...Array} [arrays] The arrays to process.
     * @param {Function} [iteratee] The function to combine grouped values.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Array} Returns the new array of grouped elements.
     * @example
     *
     * _.zipWith([1, 2], [10, 20], [100, 200], _.add);
     * // => [111, 222]
     */
    var zipWith = restParam(function(arrays) {
      var length = arrays.length,
          iteratee = length > 2 ? arrays[length - 2] : undefined,
          thisArg = length > 1 ? arrays[length - 1] : undefined;

      if (length > 2 && typeof iteratee == 'function') {
        length -= 2;
      } else {
        iteratee = (length > 1 && typeof thisArg == 'function') ? (--length, thisArg) : undefined;
        thisArg = undefined;
      }
      arrays.length = length;
      return unzipWith(arrays, iteratee, thisArg);
    });

    /*------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object that wraps `value` with explicit method
     * chaining enabled.
     *
     * @static
     * @memberOf _
     * @category Chain
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'age': 36 },
     *   { 'user': 'fred',    'age': 40 },
     *   { 'user': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _.chain(users)
     *   .sortBy('age')
     *   .map(function(chr) {
     *     return chr.user + ' is ' + chr.age;
     *   })
     *   .first()
     *   .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      var result = lodash(value);
      result.__chain__ = true;
      return result;
    }

    /**
     * This method invokes `interceptor` and returns `value`. The interceptor is
     * bound to `thisArg` and invoked with one argument; (value). The purpose of
     * this method is to "tap into" a method chain in order to perform operations
     * on intermediate results within the chain.
     *
     * @static
     * @memberOf _
     * @category Chain
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @param {*} [thisArg] The `this` binding of `interceptor`.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3])
     *  .tap(function(array) {
     *    array.pop();
     *  })
     *  .reverse()
     *  .value();
     * // => [2, 1]
     */
    function tap(value, interceptor, thisArg) {
      interceptor.call(thisArg, value);
      return value;
    }

    /**
     * This method is like `_.tap` except that it returns the result of `interceptor`.
     *
     * @static
     * @memberOf _
     * @category Chain
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @param {*} [thisArg] The `this` binding of `interceptor`.
     * @returns {*} Returns the result of `interceptor`.
     * @example
     *
     * _('  abc  ')
     *  .chain()
     *  .trim()
     *  .thru(function(value) {
     *    return [value];
     *  })
     *  .value();
     * // => ['abc']
     */
    function thru(value, interceptor, thisArg) {
      return interceptor.call(thisArg, value);
    }

    /**
     * Enables explicit method chaining on the wrapper object.
     *
     * @name chain
     * @memberOf _
     * @category Chain
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36 },
     *   { 'user': 'fred',   'age': 40 }
     * ];
     *
     * // without explicit chaining
     * _(users).first();
     * // => { 'user': 'barney', 'age': 36 }
     *
     * // with explicit chaining
     * _(users).chain()
     *   .first()
     *   .pick('user')
     *   .value();
     * // => { 'user': 'barney' }
     */
    function wrapperChain() {
      return chain(this);
    }

    /**
     * Executes the chained sequence and returns the wrapped result.
     *
     * @name commit
     * @memberOf _
     * @category Chain
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var array = [1, 2];
     * var wrapped = _(array).push(3);
     *
     * console.log(array);
     * // => [1, 2]
     *
     * wrapped = wrapped.commit();
     * console.log(array);
     * // => [1, 2, 3]
     *
     * wrapped.last();
     * // => 3
     *
     * console.log(array);
     * // => [1, 2, 3]
     */
    function wrapperCommit() {
      return new LodashWrapper(this.value(), this.__chain__);
    }

    /**
     * Creates a new array joining a wrapped array with any additional arrays
     * and/or values.
     *
     * @name concat
     * @memberOf _
     * @category Chain
     * @param {...*} [values] The values to concatenate.
     * @returns {Array} Returns the new concatenated array.
     * @example
     *
     * var array = [1];
     * var wrapped = _(array).concat(2, [3], [[4]]);
     *
     * console.log(wrapped.value());
     * // => [1, 2, 3, [4]]
     *
     * console.log(array);
     * // => [1]
     */
    var wrapperConcat = restParam(function(values) {
      values = baseFlatten(values);
      return this.thru(function(array) {
        return arrayConcat(isArray(array) ? array : [toObject(array)], values);
      });
    });

    /**
     * Creates a clone of the chained sequence planting `value` as the wrapped value.
     *
     * @name plant
     * @memberOf _
     * @category Chain
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var array = [1, 2];
     * var wrapped = _(array).map(function(value) {
     *   return Math.pow(value, 2);
     * });
     *
     * var other = [3, 4];
     * var otherWrapped = wrapped.plant(other);
     *
     * otherWrapped.value();
     * // => [9, 16]
     *
     * wrapped.value();
     * // => [1, 4]
     */
    function wrapperPlant(value) {
      var result,
          parent = this;

      while (parent instanceof baseLodash) {
        var clone = wrapperClone(parent);
        if (result) {
          previous.__wrapped__ = clone;
        } else {
          result = clone;
        }
        var previous = clone;
        parent = parent.__wrapped__;
      }
      previous.__wrapped__ = value;
      return result;
    }

    /**
     * Reverses the wrapped array so the first element becomes the last, the
     * second element becomes the second to last, and so on.
     *
     * **Note:** This method mutates the wrapped array.
     *
     * @name reverse
     * @memberOf _
     * @category Chain
     * @returns {Object} Returns the new reversed `lodash` wrapper instance.
     * @example
     *
     * var array = [1, 2, 3];
     *
     * _(array).reverse().value()
     * // => [3, 2, 1]
     *
     * console.log(array);
     * // => [3, 2, 1]
     */
    function wrapperReverse() {
      var value = this.__wrapped__;

      var interceptor = function(value) {
        return (wrapped && wrapped.__dir__ < 0) ? value : value.reverse();
      };
      if (value instanceof LazyWrapper) {
        var wrapped = value;
        if (this.__actions__.length) {
          wrapped = new LazyWrapper(this);
        }
        wrapped = wrapped.reverse();
        wrapped.__actions__.push({ 'func': thru, 'args': [interceptor], 'thisArg': undefined });
        return new LodashWrapper(wrapped, this.__chain__);
      }
      return this.thru(interceptor);
    }

    /**
     * Produces the result of coercing the unwrapped value to a string.
     *
     * @name toString
     * @memberOf _
     * @category Chain
     * @returns {string} Returns the coerced string value.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return (this.value() + '');
    }

    /**
     * Executes the chained sequence to extract the unwrapped value.
     *
     * @name value
     * @memberOf _
     * @alias run, toJSON, valueOf
     * @category Chain
     * @returns {*} Returns the resolved unwrapped value.
     * @example
     *
     * _([1, 2, 3]).value();
     * // => [1, 2, 3]
     */
    function wrapperValue() {
      return baseWrapperValue(this.__wrapped__, this.__actions__);
    }

    /*------------------------------------------------------------------------*/

    /**
     * Creates an array of elements corresponding to the given keys, or indexes,
     * of `collection`. Keys may be specified as individual arguments or as arrays
     * of keys.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(number|number[]|string|string[])} [props] The property names
     *  or indexes of elements to pick, specified individually or in arrays.
     * @returns {Array} Returns the new array of picked elements.
     * @example
     *
     * _.at(['a', 'b', 'c'], [0, 2]);
     * // => ['a', 'c']
     *
     * _.at(['barney', 'fred', 'pebbles'], 0, 2);
     * // => ['barney', 'pebbles']
     */
    var at = restParam(function(collection, props) {
      return baseAt(collection, baseFlatten(props));
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through `iteratee`. The corresponding value
     * of each key is the number of times the key was returned by `iteratee`.
     * The `iteratee` is bound to `thisArg` and invoked with three arguments:
     * (value, index|key, collection).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(n) {
     *   return Math.floor(n);
     * });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(n) {
     *   return this.floor(n);
     * }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      hasOwnProperty.call(result, key) ? ++result[key] : (result[key] = 1);
    });

    /**
     * Checks if `predicate` returns truthy for **all** elements of `collection`.
     * The predicate is bound to `thisArg` and invoked with three arguments:
     * (value, index|key, collection).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {boolean} Returns `true` if all elements pass the predicate check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes'], Boolean);
     * // => false
     *
     * var users = [
     *   { 'user': 'barney', 'active': false },
     *   { 'user': 'fred',   'active': false }
     * ];
     *
     * // using the `_.matches` callback shorthand
     * _.every(users, { 'user': 'barney', 'active': false });
     * // => false
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.every(users, 'active', false);
     * // => true
     *
     * // using the `_.property` callback shorthand
     * _.every(users, 'active');
     * // => false
     */
    function every(collection, predicate, thisArg) {
      var func = isArray(collection) ? arrayEvery : baseEvery;
      if (thisArg && isIterateeCall(collection, predicate, thisArg)) {
        predicate = undefined;
      }
      if (typeof predicate != 'function' || thisArg !== undefined) {
        predicate = getCallback(predicate, thisArg, 3);
      }
      return func(collection, predicate);
    }

    /**
     * Iterates over elements of `collection`, returning an array of all elements
     * `predicate` returns truthy for. The predicate is bound to `thisArg` and
     * invoked with three arguments: (value, index|key, collection).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Array} Returns the new filtered array.
     * @example
     *
     * _.filter([4, 5, 6], function(n) {
     *   return n % 2 == 0;
     * });
     * // => [4, 6]
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': true },
     *   { 'user': 'fred',   'age': 40, 'active': false }
     * ];
     *
     * // using the `_.matches` callback shorthand
     * _.pluck(_.filter(users, { 'age': 36, 'active': true }), 'user');
     * // => ['barney']
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.pluck(_.filter(users, 'active', false), 'user');
     * // => ['fred']
     *
     * // using the `_.property` callback shorthand
     * _.pluck(_.filter(users, 'active'), 'user');
     * // => ['barney']
     */
    function filter(collection, predicate, thisArg) {
      var func = isArray(collection) ? arrayFilter : baseFilter;
      predicate = getCallback(predicate, thisArg, 3);
      return func(collection, predicate);
    }

    /**
     * Iterates over elements of `collection`, returning the first element
     * `predicate` returns truthy for. The predicate is bound to `thisArg` and
     * invoked with three arguments: (value, index|key, collection).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect
     * @category Collection
     * @param {Array|Object|string} collection The collection to search.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {*} Returns the matched element, else `undefined`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'age': 36, 'active': true },
     *   { 'user': 'fred',    'age': 40, 'active': false },
     *   { 'user': 'pebbles', 'age': 1,  'active': true }
     * ];
     *
     * _.result(_.find(users, function(chr) {
     *   return chr.age < 40;
     * }), 'user');
     * // => 'barney'
     *
     * // using the `_.matches` callback shorthand
     * _.result(_.find(users, { 'age': 1, 'active': true }), 'user');
     * // => 'pebbles'
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.result(_.find(users, 'active', false), 'user');
     * // => 'fred'
     *
     * // using the `_.property` callback shorthand
     * _.result(_.find(users, 'active'), 'user');
     * // => 'barney'
     */
    var find = createFind(baseEach);

    /**
     * This method is like `_.find` except that it iterates over elements of
     * `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to search.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {*} Returns the matched element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(n) {
     *   return n % 2 == 1;
     * });
     * // => 3
     */
    var findLast = createFind(baseEachRight, true);

    /**
     * Performs a deep comparison between each element in `collection` and the
     * source object, returning the first element that has equivalent property
     * values.
     *
     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
     * numbers, `Object` objects, regexes, and strings. Objects are compared by
     * their own, not inherited, enumerable properties. For comparing a single
     * own or inherited property value see `_.matchesProperty`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to search.
     * @param {Object} source The object of property values to match.
     * @returns {*} Returns the matched element, else `undefined`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': true },
     *   { 'user': 'fred',   'age': 40, 'active': false }
     * ];
     *
     * _.result(_.findWhere(users, { 'age': 36, 'active': true }), 'user');
     * // => 'barney'
     *
     * _.result(_.findWhere(users, { 'age': 40, 'active': false }), 'user');
     * // => 'fred'
     */
    function findWhere(collection, source) {
      return find(collection, baseMatches(source));
    }

    /**
     * Iterates over elements of `collection` invoking `iteratee` for each element.
     * The `iteratee` is bound to `thisArg` and invoked with three arguments:
     * (value, index|key, collection). Iteratee functions may exit iteration early
     * by explicitly returning `false`.
     *
     * **Note:** As with other "Collections" methods, objects with a "length" property
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
     * may be used for object iteration.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2]).forEach(function(n) {
     *   console.log(n);
     * }).value();
     * // => logs each value from left to right and returns the array
     *
     * _.forEach({ 'a': 1, 'b': 2 }, function(n, key) {
     *   console.log(n, key);
     * });
     * // => logs each value-key pair and returns the object (iteration order is not guaranteed)
     */
    var forEach = createForEach(arrayEach, baseEach);

    /**
     * This method is like `_.forEach` except that it iterates over elements of
     * `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias eachRight
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2]).forEachRight(function(n) {
     *   console.log(n);
     * }).value();
     * // => logs each value from right to left and returns the array
     */
    var forEachRight = createForEach(arrayEachRight, baseEachRight);

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through `iteratee`. The corresponding value
     * of each key is an array of the elements responsible for generating the key.
     * The `iteratee` is bound to `thisArg` and invoked with three arguments:
     * (value, index|key, collection).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(n) {
     *   return Math.floor(n);
     * });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(n) {
     *   return this.floor(n);
     * }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using the `_.property` callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      if (hasOwnProperty.call(result, key)) {
        result[key].push(value);
      } else {
        result[key] = [value];
      }
    });

    /**
     * Checks if `value` is in `collection` using
     * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
     * for equality comparisons. If `fromIndex` is negative, it is used as the offset
     * from the end of `collection`.
     *
     * @static
     * @memberOf _
     * @alias contains, include
     * @category Collection
     * @param {Array|Object|string} collection The collection to search.
     * @param {*} target The value to search for.
     * @param {number} [fromIndex=0] The index to search from.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.reduce`.
     * @returns {boolean} Returns `true` if a matching element is found, else `false`.
     * @example
     *
     * _.includes([1, 2, 3], 1);
     * // => true
     *
     * _.includes([1, 2, 3], 1, 2);
     * // => false
     *
     * _.includes({ 'user': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.includes('pebbles', 'eb');
     * // => true
     */
    function includes(collection, target, fromIndex, guard) {
      var length = collection ? getLength(collection) : 0;
      if (!isLength(length)) {
        collection = values(collection);
        length = collection.length;
      }
      if (typeof fromIndex != 'number' || (guard && isIterateeCall(target, fromIndex, guard))) {
        fromIndex = 0;
      } else {
        fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : (fromIndex || 0);
      }
      return (typeof collection == 'string' || !isArray(collection) && isString(collection))
        ? (fromIndex <= length && collection.indexOf(target, fromIndex) > -1)
        : (!!length && getIndexOf(collection, target, fromIndex) > -1);
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through `iteratee`. The corresponding value
     * of each key is the last element responsible for generating the key. The
     * iteratee function is bound to `thisArg` and invoked with three arguments:
     * (value, index|key, collection).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var keyData = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.indexBy(keyData, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keyData, function(object) {
     *   return String.fromCharCode(object.code);
     * });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keyData, function(object) {
     *   return this.fromCharCode(object.code);
     * }, String);
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     */
    var indexBy = createAggregator(function(result, value, key) {
      result[key] = value;
    });

    /**
     * Invokes the method at `path` of each element in `collection`, returning
     * an array of the results of each invoked method. Any additional arguments
     * are provided to each invoked method. If `methodName` is a function it is
     * invoked for, and `this` bound to, each element in `collection`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|Function|string} path The path of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [args] The arguments to invoke the method with.
     * @returns {Array} Returns the array of results.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    var invoke = restParam(function(collection, path, args) {
      var index = -1,
          isFunc = typeof path == 'function',
          isProp = isKey(path),
          result = isArrayLike(collection) ? Array(collection.length) : [];

      baseEach(collection, function(value) {
        var func = isFunc ? path : ((isProp && value != null) ? value[path] : undefined);
        result[++index] = func ? func.apply(value, args) : invokePath(value, path, args);
      });
      return result;
    });

    /**
     * Creates an array of values by running each element in `collection` through
     * `iteratee`. The `iteratee` is bound to `thisArg` and invoked with three
     * arguments: (value, index|key, collection).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * Many lodash methods are guarded to work as iteratees for methods like
     * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
     *
     * The guarded methods are:
     * `ary`, `callback`, `chunk`, `clone`, `create`, `curry`, `curryRight`,
     * `drop`, `dropRight`, `every`, `fill`, `flatten`, `invert`, `max`, `min`,
     * `parseInt`, `slice`, `sortBy`, `take`, `takeRight`, `template`, `trim`,
     * `trimLeft`, `trimRight`, `trunc`, `random`, `range`, `sample`, `some`,
     * `sum`, `uniq`, and `words`
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Array} Returns the new mapped array.
     * @example
     *
     * function timesThree(n) {
     *   return n * 3;
     * }
     *
     * _.map([1, 2], timesThree);
     * // => [3, 6]
     *
     * _.map({ 'a': 1, 'b': 2 }, timesThree);
     * // => [3, 6] (iteration order is not guaranteed)
     *
     * var users = [
     *   { 'user': 'barney' },
     *   { 'user': 'fred' }
     * ];
     *
     * // using the `_.property` callback shorthand
     * _.map(users, 'user');
     * // => ['barney', 'fred']
     */
    function map(collection, iteratee, thisArg) {
      var func = isArray(collection) ? arrayMap : baseMap;
      iteratee = getCallback(iteratee, thisArg, 3);
      return func(collection, iteratee);
    }

    /**
     * Creates an array of elements split into two groups, the first of which
     * contains elements `predicate` returns truthy for, while the second of which
     * contains elements `predicate` returns falsey for. The predicate is bound
     * to `thisArg` and invoked with three arguments: (value, index|key, collection).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Array} Returns the array of grouped elements.
     * @example
     *
     * _.partition([1, 2, 3], function(n) {
     *   return n % 2;
     * });
     * // => [[1, 3], [2]]
     *
     * _.partition([1.2, 2.3, 3.4], function(n) {
     *   return this.floor(n) % 2;
     * }, Math);
     * // => [[1.2, 3.4], [2.3]]
     *
     * var users = [
     *   { 'user': 'barney',  'age': 36, 'active': false },
     *   { 'user': 'fred',    'age': 40, 'active': true },
     *   { 'user': 'pebbles', 'age': 1,  'active': false }
     * ];
     *
     * var mapper = function(array) {
     *   return _.pluck(array, 'user');
     * };
     *
     * // using the `_.matches` callback shorthand
     * _.map(_.partition(users, { 'age': 1, 'active': false }), mapper);
     * // => [['pebbles'], ['barney', 'fred']]
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.map(_.partition(users, 'active', false), mapper);
     * // => [['barney', 'pebbles'], ['fred']]
     *
     * // using the `_.property` callback shorthand
     * _.map(_.partition(users, 'active'), mapper);
     * // => [['fred'], ['barney', 'pebbles']]
     */
    var partition = createAggregator(function(result, value, key) {
      result[key ? 0 : 1].push(value);
    }, function() { return [[], []]; });

    /**
     * Gets the property value of `path` from all elements in `collection`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|string} path The path of the property to pluck.
     * @returns {Array} Returns the property values.
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36 },
     *   { 'user': 'fred',   'age': 40 }
     * ];
     *
     * _.pluck(users, 'user');
     * // => ['barney', 'fred']
     *
     * var userIndex = _.indexBy(users, 'user');
     * _.pluck(userIndex, 'age');
     * // => [36, 40] (iteration order is not guaranteed)
     */
    function pluck(collection, path) {
      return map(collection, property(path));
    }

    /**
     * Reduces `collection` to a value which is the accumulated result of running
     * each element in `collection` through `iteratee`, where each successive
     * invocation is supplied the return value of the previous. If `accumulator`
     * is not provided the first element of `collection` is used as the initial
     * value. The `iteratee` is bound to `thisArg` and invoked with four arguments:
     * (accumulator, value, index|key, collection).
     *
     * Many lodash methods are guarded to work as iteratees for methods like
     * `_.reduce`, `_.reduceRight`, and `_.transform`.
     *
     * The guarded methods are:
     * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `sortByAll`,
     * and `sortByOrder`
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * _.reduce([1, 2], function(total, n) {
     *   return total + n;
     * });
     * // => 3
     *
     * _.reduce({ 'a': 1, 'b': 2 }, function(result, n, key) {
     *   result[key] = n * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6 } (iteration order is not guaranteed)
     */
    var reduce = createReduce(arrayReduce, baseEach);

    /**
     * This method is like `_.reduce` except that it iterates over elements of
     * `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var array = [[0, 1], [2, 3], [4, 5]];
     *
     * _.reduceRight(array, function(flattened, other) {
     *   return flattened.concat(other);
     * }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    var reduceRight = createReduce(arrayReduceRight, baseEachRight);

    /**
     * The opposite of `_.filter`; this method returns the elements of `collection`
     * that `predicate` does **not** return truthy for.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Array} Returns the new filtered array.
     * @example
     *
     * _.reject([1, 2, 3, 4], function(n) {
     *   return n % 2 == 0;
     * });
     * // => [1, 3]
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': false },
     *   { 'user': 'fred',   'age': 40, 'active': true }
     * ];
     *
     * // using the `_.matches` callback shorthand
     * _.pluck(_.reject(users, { 'age': 40, 'active': true }), 'user');
     * // => ['barney']
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.pluck(_.reject(users, 'active', false), 'user');
     * // => ['fred']
     *
     * // using the `_.property` callback shorthand
     * _.pluck(_.reject(users, 'active'), 'user');
     * // => ['barney']
     */
    function reject(collection, predicate, thisArg) {
      var func = isArray(collection) ? arrayFilter : baseFilter;
      predicate = getCallback(predicate, thisArg, 3);
      return func(collection, function(value, index, collection) {
        return !predicate(value, index, collection);
      });
    }

    /**
     * Gets a random element or `n` random elements from a collection.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to sample.
     * @param {number} [n] The number of elements to sample.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {*} Returns the random sample(s).
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     *
     * _.sample([1, 2, 3, 4], 2);
     * // => [3, 1]
     */
    function sample(collection, n, guard) {
      if (guard ? isIterateeCall(collection, n, guard) : n == null) {
        collection = toIterable(collection);
        var length = collection.length;
        return length > 0 ? collection[baseRandom(0, length - 1)] : undefined;
      }
      var index = -1,
          result = toArray(collection),
          length = result.length,
          lastIndex = length - 1;

      n = nativeMin(n < 0 ? 0 : (+n || 0), length);
      while (++index < n) {
        var rand = baseRandom(index, lastIndex),
            value = result[rand];

        result[rand] = result[index];
        result[index] = value;
      }
      result.length = n;
      return result;
    }

    /**
     * Creates an array of shuffled values, using a version of the
     * [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to shuffle.
     * @returns {Array} Returns the new shuffled array.
     * @example
     *
     * _.shuffle([1, 2, 3, 4]);
     * // => [4, 1, 3, 2]
     */
    function shuffle(collection) {
      return sample(collection, POSITIVE_INFINITY);
    }

    /**
     * Gets the size of `collection` by returning its length for array-like
     * values or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns the size of `collection`.
     * @example
     *
     * _.size([1, 2, 3]);
     * // => 3
     *
     * _.size({ 'a': 1, 'b': 2 });
     * // => 2
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      var length = collection ? getLength(collection) : 0;
      return isLength(length) ? length : keys(collection).length;
    }

    /**
     * Checks if `predicate` returns truthy for **any** element of `collection`.
     * The function returns as soon as it finds a passing value and does not iterate
     * over the entire collection. The predicate is bound to `thisArg` and invoked
     * with three arguments: (value, index|key, collection).
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var users = [
     *   { 'user': 'barney', 'active': true },
     *   { 'user': 'fred',   'active': false }
     * ];
     *
     * // using the `_.matches` callback shorthand
     * _.some(users, { 'user': 'barney', 'active': false });
     * // => false
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.some(users, 'active', false);
     * // => true
     *
     * // using the `_.property` callback shorthand
     * _.some(users, 'active');
     * // => true
     */
    function some(collection, predicate, thisArg) {
      var func = isArray(collection) ? arraySome : baseSome;
      if (thisArg && isIterateeCall(collection, predicate, thisArg)) {
        predicate = undefined;
      }
      if (typeof predicate != 'function' || thisArg !== undefined) {
        predicate = getCallback(predicate, thisArg, 3);
      }
      return func(collection, predicate);
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection through `iteratee`. This method performs
     * a stable sort, that is, it preserves the original sort order of equal elements.
     * The `iteratee` is bound to `thisArg` and invoked with three arguments:
     * (value, index|key, collection).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Array} Returns the new sorted array.
     * @example
     *
     * _.sortBy([1, 2, 3], function(n) {
     *   return Math.sin(n);
     * });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(n) {
     *   return this.sin(n);
     * }, Math);
     * // => [3, 1, 2]
     *
     * var users = [
     *   { 'user': 'fred' },
     *   { 'user': 'pebbles' },
     *   { 'user': 'barney' }
     * ];
     *
     * // using the `_.property` callback shorthand
     * _.pluck(_.sortBy(users, 'user'), 'user');
     * // => ['barney', 'fred', 'pebbles']
     */
    function sortBy(collection, iteratee, thisArg) {
      if (collection == null) {
        return [];
      }
      if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
        iteratee = undefined;
      }
      var index = -1;
      iteratee = getCallback(iteratee, thisArg, 3);

      var result = baseMap(collection, function(value, key, collection) {
        return { 'criteria': iteratee(value, key, collection), 'index': ++index, 'value': value };
      });
      return baseSortBy(result, compareAscending);
    }

    /**
     * This method is like `_.sortBy` except that it can sort by multiple iteratees
     * or property names.
     *
     * If a property name is provided for an iteratee the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If an object is provided for an iteratee the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(Function|Function[]|Object|Object[]|string|string[])} iteratees
     *  The iteratees to sort by, specified as individual values or arrays of values.
     * @returns {Array} Returns the new sorted array.
     * @example
     *
     * var users = [
     *   { 'user': 'fred',   'age': 48 },
     *   { 'user': 'barney', 'age': 36 },
     *   { 'user': 'fred',   'age': 42 },
     *   { 'user': 'barney', 'age': 34 }
     * ];
     *
     * _.map(_.sortByAll(users, ['user', 'age']), _.values);
     * // => [['barney', 34], ['barney', 36], ['fred', 42], ['fred', 48]]
     *
     * _.map(_.sortByAll(users, 'user', function(chr) {
     *   return Math.floor(chr.age / 10);
     * }), _.values);
     * // => [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 42]]
     */
    var sortByAll = restParam(function(collection, iteratees) {
      if (collection == null) {
        return [];
      }
      var guard = iteratees[2];
      if (guard && isIterateeCall(iteratees[0], iteratees[1], guard)) {
        iteratees.length = 1;
      }
      return baseSortByOrder(collection, baseFlatten(iteratees), []);
    });

    /**
     * This method is like `_.sortByAll` except that it allows specifying the
     * sort orders of the iteratees to sort by. If `orders` is unspecified, all
     * values are sorted in ascending order. Otherwise, a value is sorted in
     * ascending order if its corresponding order is "asc", and descending if "desc".
     *
     * If a property name is provided for an iteratee the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If an object is provided for an iteratee the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
     * @param {boolean[]} [orders] The sort orders of `iteratees`.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.reduce`.
     * @returns {Array} Returns the new sorted array.
     * @example
     *
     * var users = [
     *   { 'user': 'fred',   'age': 48 },
     *   { 'user': 'barney', 'age': 34 },
     *   { 'user': 'fred',   'age': 42 },
     *   { 'user': 'barney', 'age': 36 }
     * ];
     *
     * // sort by `user` in ascending order and by `age` in descending order
     * _.map(_.sortByOrder(users, ['user', 'age'], ['asc', 'desc']), _.values);
     * // => [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 42]]
     */
    function sortByOrder(collection, iteratees, orders, guard) {
      if (collection == null) {
        return [];
      }
      if (guard && isIterateeCall(iteratees, orders, guard)) {
        orders = undefined;
      }
      if (!isArray(iteratees)) {
        iteratees = iteratees == null ? [] : [iteratees];
      }
      if (!isArray(orders)) {
        orders = orders == null ? [] : [orders];
      }
      return baseSortByOrder(collection, iteratees, orders);
    }

    /**
     * Performs a deep comparison between each element in `collection` and the
     * source object, returning an array of all elements that have equivalent
     * property values.
     *
     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
     * numbers, `Object` objects, regexes, and strings. Objects are compared by
     * their own, not inherited, enumerable properties. For comparing a single
     * own or inherited property value see `_.matchesProperty`.
     *
     * @static
     * @memberOf _
     * @category Collection
     * @param {Array|Object|string} collection The collection to search.
     * @param {Object} source The object of property values to match.
     * @returns {Array} Returns the new filtered array.
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': false, 'pets': ['hoppy'] },
     *   { 'user': 'fred',   'age': 40, 'active': true, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * _.pluck(_.where(users, { 'age': 36, 'active': false }), 'user');
     * // => ['barney']
     *
     * _.pluck(_.where(users, { 'pets': ['dino'] }), 'user');
     * // => ['fred']
     */
    function where(collection, source) {
      return filter(collection, baseMatches(source));
    }

    /*------------------------------------------------------------------------*/

    /**
     * Gets the number of milliseconds that have elapsed since the Unix epoch
     * (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @category Date
     * @example
     *
     * _.defer(function(stamp) {
     *   console.log(_.now() - stamp);
     * }, _.now());
     * // => logs the number of milliseconds it took for the deferred function to be invoked
     */
    var now = nativeNow || function() {
      return new Date().getTime();
    };

    /*------------------------------------------------------------------------*/

    /**
     * The opposite of `_.before`; this method creates a function that invokes
     * `func` once it is called `n` or more times.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {number} n The number of calls before `func` is invoked.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => logs 'done saving!' after the two async saves have completed
     */
    function after(n, func) {
      if (typeof func != 'function') {
        if (typeof n == 'function') {
          var temp = n;
          n = func;
          func = temp;
        } else {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
      }
      n = nativeIsFinite(n = +n) ? n : 0;
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that accepts up to `n` arguments ignoring any
     * additional arguments.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to cap arguments for.
     * @param {number} [n=func.length] The arity cap.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Function} Returns the new function.
     * @example
     *
     * _.map(['6', '8', '10'], _.ary(parseInt, 1));
     * // => [6, 8, 10]
     */
    function ary(func, n, guard) {
      if (guard && isIterateeCall(func, n, guard)) {
        n = undefined;
      }
      n = (func && n == null) ? func.length : nativeMax(+n || 0, 0);
      return createWrapper(func, ARY_FLAG, undefined, undefined, undefined, undefined, n);
    }

    /**
     * Creates a function that invokes `func`, with the `this` binding and arguments
     * of the created function, while it is called less than `n` times. Subsequent
     * calls to the created function return the result of the last `func` invocation.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {number} n The number of calls at which `func` is no longer invoked.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * jQuery('#add').on('click', _.before(5, addContactToList));
     * // => allows adding up to 4 contacts to the list
     */
    function before(n, func) {
      var result;
      if (typeof func != 'function') {
        if (typeof n == 'function') {
          var temp = n;
          n = func;
          func = temp;
        } else {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
      }
      return function() {
        if (--n > 0) {
          result = func.apply(this, arguments);
        }
        if (n <= 1) {
          func = undefined;
        }
        return result;
      };
    }

    /**
     * Creates a function that invokes `func` with the `this` binding of `thisArg`
     * and prepends any additional `_.bind` arguments to those provided to the
     * bound function.
     *
     * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
     * may be used as a placeholder for partially applied arguments.
     *
     * **Note:** Unlike native `Function#bind` this method does not set the "length"
     * property of bound functions.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to bind.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {...*} [partials] The arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var greet = function(greeting, punctuation) {
     *   return greeting + ' ' + this.user + punctuation;
     * };
     *
     * var object = { 'user': 'fred' };
     *
     * var bound = _.bind(greet, object, 'hi');
     * bound('!');
     * // => 'hi fred!'
     *
     * // using placeholders
     * var bound = _.bind(greet, object, _, '!');
     * bound('hi');
     * // => 'hi fred!'
     */
    var bind = restParam(function(func, thisArg, partials) {
      var bitmask = BIND_FLAG;
      if (partials.length) {
        var holders = replaceHolders(partials, bind.placeholder);
        bitmask |= PARTIAL_FLAG;
      }
      return createWrapper(func, bitmask, thisArg, partials, holders);
    });

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method. Method names may be specified as individual arguments or as arrays
     * of method names. If no method names are provided all enumerable function
     * properties, own and inherited, of `object` are bound.
     *
     * **Note:** This method does not set the "length" property of bound functions.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...(string|string[])} [methodNames] The object method names to bind,
     *  specified as individual method names or arrays of method names.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'onClick': function() {
     *     console.log('clicked ' + this.label);
     *   }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => logs 'clicked docs' when the element is clicked
     */
    var bindAll = restParam(function(object, methodNames) {
      methodNames = methodNames.length ? baseFlatten(methodNames) : functions(object);

      var index = -1,
          length = methodNames.length;

      while (++index < length) {
        var key = methodNames[index];
        object[key] = createWrapper(object[key], BIND_FLAG, object);
      }
      return object;
    });

    /**
     * Creates a function that invokes the method at `object[key]` and prepends
     * any additional `_.bindKey` arguments to those provided to the bound function.
     *
     * This method differs from `_.bind` by allowing bound functions to reference
     * methods that may be redefined or don't yet exist.
     * See [Peter Michaux's article](http://peter.michaux.ca/articles/lazy-function-definition-pattern)
     * for more details.
     *
     * The `_.bindKey.placeholder` value, which defaults to `_` in monolithic
     * builds, may be used as a placeholder for partially applied arguments.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Object} object The object the method belongs to.
     * @param {string} key The key of the method.
     * @param {...*} [partials] The arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'user': 'fred',
     *   'greet': function(greeting, punctuation) {
     *     return greeting + ' ' + this.user + punctuation;
     *   }
     * };
     *
     * var bound = _.bindKey(object, 'greet', 'hi');
     * bound('!');
     * // => 'hi fred!'
     *
     * object.greet = function(greeting, punctuation) {
     *   return greeting + 'ya ' + this.user + punctuation;
     * };
     *
     * bound('!');
     * // => 'hiya fred!'
     *
     * // using placeholders
     * var bound = _.bindKey(object, 'greet', _, '!');
     * bound('hi');
     * // => 'hiya fred!'
     */
    var bindKey = restParam(function(object, key, partials) {
      var bitmask = BIND_FLAG | BIND_KEY_FLAG;
      if (partials.length) {
        var holders = replaceHolders(partials, bindKey.placeholder);
        bitmask |= PARTIAL_FLAG;
      }
      return createWrapper(key, bitmask, object, partials, holders);
    });

    /**
     * Creates a function that accepts one or more arguments of `func` that when
     * called either invokes `func` returning its result, if all `func` arguments
     * have been provided, or returns a function that accepts one or more of the
     * remaining `func` arguments, and so on. The arity of `func` may be specified
     * if `func.length` is not sufficient.
     *
     * The `_.curry.placeholder` value, which defaults to `_` in monolithic builds,
     * may be used as a placeholder for provided arguments.
     *
     * **Note:** This method does not set the "length" property of curried functions.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var abc = function(a, b, c) {
     *   return [a, b, c];
     * };
     *
     * var curried = _.curry(abc);
     *
     * curried(1)(2)(3);
     * // => [1, 2, 3]
     *
     * curried(1, 2)(3);
     * // => [1, 2, 3]
     *
     * curried(1, 2, 3);
     * // => [1, 2, 3]
     *
     * // using placeholders
     * curried(1)(_, 3)(2);
     * // => [1, 2, 3]
     */
    var curry = createCurry(CURRY_FLAG);

    /**
     * This method is like `_.curry` except that arguments are applied to `func`
     * in the manner of `_.partialRight` instead of `_.partial`.
     *
     * The `_.curryRight.placeholder` value, which defaults to `_` in monolithic
     * builds, may be used as a placeholder for provided arguments.
     *
     * **Note:** This method does not set the "length" property of curried functions.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var abc = function(a, b, c) {
     *   return [a, b, c];
     * };
     *
     * var curried = _.curryRight(abc);
     *
     * curried(3)(2)(1);
     * // => [1, 2, 3]
     *
     * curried(2, 3)(1);
     * // => [1, 2, 3]
     *
     * curried(1, 2, 3);
     * // => [1, 2, 3]
     *
     * // using placeholders
     * curried(3)(1, _)(2);
     * // => [1, 2, 3]
     */
    var curryRight = createCurry(CURRY_RIGHT_FLAG);

    /**
     * Creates a debounced function that delays invoking `func` until after `wait`
     * milliseconds have elapsed since the last time the debounced function was
     * invoked. The debounced function comes with a `cancel` method to cancel
     * delayed invocations. Provide an options object to indicate that `func`
     * should be invoked on the leading and/or trailing edge of the `wait` timeout.
     * Subsequent calls to the debounced function return the result of the last
     * `func` invocation.
     *
     * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
     * on the trailing edge of the timeout only if the the debounced function is
     * invoked more than once during the `wait` timeout.
     *
     * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
     * for details over the differences between `_.debounce` and `_.throttle`.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to debounce.
     * @param {number} [wait=0] The number of milliseconds to delay.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=false] Specify invoking on the leading
     *  edge of the timeout.
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be
     *  delayed before it is invoked.
     * @param {boolean} [options.trailing=true] Specify invoking on the trailing
     *  edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // avoid costly calculations while the window size is in flux
     * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
     *
     * // invoke `sendMail` when the click event is fired, debouncing subsequent calls
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * }));
     *
     * // ensure `batchLog` is invoked once after 1 second of debounced calls
     * var source = new EventSource('/stream');
     * jQuery(source).on('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }));
     *
     * // cancel a debounced call
     * var todoChanges = _.debounce(batchLog, 1000);
     * Object.observe(models.todo, todoChanges);
     *
     * Object.observe(models, function(changes) {
     *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {
     *     todoChanges.cancel();
     *   }
     * }, ['delete']);
     *
     * // ...at some point `models.todo` is changed
     * models.todo.completed = true;
     *
     * // ...before 1 second has passed `models.todo` is deleted
     * // which cancels the debounced `todoChanges` call
     * delete models.todo;
     */
    function debounce(func, wait, options) {
      var args,
          maxTimeoutId,
          result,
          stamp,
          thisArg,
          timeoutId,
          trailingCall,
          lastCalled = 0,
          maxWait = false,
          trailing = true;

      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = wait < 0 ? 0 : (+wait || 0);
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = !!options.leading;
        maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
        trailing = 'trailing' in options ? !!options.trailing : trailing;
      }

      function cancel() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (maxTimeoutId) {
          clearTimeout(maxTimeoutId);
        }
        lastCalled = 0;
        maxTimeoutId = timeoutId = trailingCall = undefined;
      }

      function complete(isCalled, id) {
        if (id) {
          clearTimeout(id);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (isCalled) {
          lastCalled = now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = undefined;
          }
        }
      }

      function delayed() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0 || remaining > wait) {
          complete(trailingCall, maxTimeoutId);
        } else {
          timeoutId = setTimeout(delayed, remaining);
        }
      }

      function maxDelayed() {
        complete(trailing, timeoutId);
      }

      function debounced() {
        args = arguments;
        stamp = now();
        thisArg = this;
        trailingCall = trailing && (timeoutId || !leading);

        if (maxWait === false) {
          var leadingCall = leading && !timeoutId;
        } else {
          if (!maxTimeoutId && !leading) {
            lastCalled = stamp;
          }
          var remaining = maxWait - (stamp - lastCalled),
              isCalled = remaining <= 0 || remaining > maxWait;

          if (isCalled) {
            if (maxTimeoutId) {
              maxTimeoutId = clearTimeout(maxTimeoutId);
            }
            lastCalled = stamp;
            result = func.apply(thisArg, args);
          }
          else if (!maxTimeoutId) {
            maxTimeoutId = setTimeout(maxDelayed, remaining);
          }
        }
        if (isCalled && timeoutId) {
          timeoutId = clearTimeout(timeoutId);
        }
        else if (!timeoutId && wait !== maxWait) {
          timeoutId = setTimeout(delayed, wait);
        }
        if (leadingCall) {
          isCalled = true;
          result = func.apply(thisArg, args);
        }
        if (isCalled && !timeoutId && !maxTimeoutId) {
          args = thisArg = undefined;
        }
        return result;
      }
      debounced.cancel = cancel;
      return debounced;
    }

    /**
     * Defers invoking the `func` until the current call stack has cleared. Any
     * additional arguments are provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to defer.
     * @param {...*} [args] The arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) {
     *   console.log(text);
     * }, 'deferred');
     * // logs 'deferred' after one or more milliseconds
     */
    var defer = restParam(function(func, args) {
      return baseDelay(func, 1, args);
    });

    /**
     * Invokes `func` after `wait` milliseconds. Any additional arguments are
     * provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay invocation.
     * @param {...*} [args] The arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) {
     *   console.log(text);
     * }, 1000, 'later');
     * // => logs 'later' after one second
     */
    var delay = restParam(function(func, wait, args) {
      return baseDelay(func, wait, args);
    });

    /**
     * Creates a function that returns the result of invoking the provided
     * functions with the `this` binding of the created function, where each
     * successive invocation is supplied the return value of the previous.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {...Function} [funcs] Functions to invoke.
     * @returns {Function} Returns the new function.
     * @example
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * var addSquare = _.flow(_.add, square);
     * addSquare(1, 2);
     * // => 9
     */
    var flow = createFlow();

    /**
     * This method is like `_.flow` except that it creates a function that
     * invokes the provided functions from right to left.
     *
     * @static
     * @memberOf _
     * @alias backflow, compose
     * @category Function
     * @param {...Function} [funcs] Functions to invoke.
     * @returns {Function} Returns the new function.
     * @example
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * var addSquare = _.flowRight(square, _.add);
     * addSquare(1, 2);
     * // => 9
     */
    var flowRight = createFlow(true);

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided it determines the cache key for storing the result based on the
     * arguments provided to the memoized function. By default, the first argument
     * provided to the memoized function is coerced to a string and used as the
     * cache key. The `func` is invoked with the `this` binding of the memoized
     * function.
     *
     * **Note:** The cache is exposed as the `cache` property on the memoized
     * function. Its creation may be customized by replacing the `_.memoize.Cache`
     * constructor with one whose instances implement the [`Map`](http://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-map-prototype-object)
     * method interface of `get`, `has`, and `set`.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] The function to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var upperCase = _.memoize(function(string) {
     *   return string.toUpperCase();
     * });
     *
     * upperCase('fred');
     * // => 'FRED'
     *
     * // modifying the result cache
     * upperCase.cache.set('fred', 'BARNEY');
     * upperCase('fred');
     * // => 'BARNEY'
     *
     * // replacing `_.memoize.Cache`
     * var object = { 'user': 'fred' };
     * var other = { 'user': 'barney' };
     * var identity = _.memoize(_.identity);
     *
     * identity(object);
     * // => { 'user': 'fred' }
     * identity(other);
     * // => { 'user': 'fred' }
     *
     * _.memoize.Cache = WeakMap;
     * var identity = _.memoize(_.identity);
     *
     * identity(object);
     * // => { 'user': 'fred' }
     * identity(other);
     * // => { 'user': 'barney' }
     */
    function memoize(func, resolver) {
      if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments,
            key = resolver ? resolver.apply(this, args) : args[0],
            cache = memoized.cache;

        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result);
        return result;
      };
      memoized.cache = new memoize.Cache;
      return memoized;
    }

    /**
     * Creates a function that runs each argument through a corresponding
     * transform function.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to wrap.
     * @param {...(Function|Function[])} [transforms] The functions to transform
     * arguments, specified as individual functions or arrays of functions.
     * @returns {Function} Returns the new function.
     * @example
     *
     * function doubled(n) {
     *   return n * 2;
     * }
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * var modded = _.modArgs(function(x, y) {
     *   return [x, y];
     * }, square, doubled);
     *
     * modded(1, 2);
     * // => [1, 4]
     *
     * modded(5, 10);
     * // => [25, 20]
     */
    var modArgs = restParam(function(func, transforms) {
      transforms = baseFlatten(transforms);
      if (typeof func != 'function' || !arrayEvery(transforms, baseIsFunction)) {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var length = transforms.length;
      return restParam(function(args) {
        var index = nativeMin(args.length, length);
        while (index--) {
          args[index] = transforms[index](args[index]);
        }
        return func.apply(this, args);
      });
    });

    /**
     * Creates a function that negates the result of the predicate `func`. The
     * `func` predicate is invoked with the `this` binding and arguments of the
     * created function.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} predicate The predicate to negate.
     * @returns {Function} Returns the new function.
     * @example
     *
     * function isEven(n) {
     *   return n % 2 == 0;
     * }
     *
     * _.filter([1, 2, 3, 4, 5, 6], _.negate(isEven));
     * // => [1, 3, 5]
     */
    function negate(predicate) {
      if (typeof predicate != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      return function() {
        return !predicate.apply(this, arguments);
      };
    }

    /**
     * Creates a function that is restricted to invoking `func` once. Repeat calls
     * to the function return the value of the first call. The `func` is invoked
     * with the `this` binding and arguments of the created function.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` invokes `createApplication` once
     */
    function once(func) {
      return before(2, func);
    }

    /**
     * Creates a function that invokes `func` with `partial` arguments prepended
     * to those provided to the new function. This method is like `_.bind` except
     * it does **not** alter the `this` binding.
     *
     * The `_.partial.placeholder` value, which defaults to `_` in monolithic
     * builds, may be used as a placeholder for partially applied arguments.
     *
     * **Note:** This method does not set the "length" property of partially
     * applied functions.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [partials] The arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) {
     *   return greeting + ' ' + name;
     * };
     *
     * var sayHelloTo = _.partial(greet, 'hello');
     * sayHelloTo('fred');
     * // => 'hello fred'
     *
     * // using placeholders
     * var greetFred = _.partial(greet, _, 'fred');
     * greetFred('hi');
     * // => 'hi fred'
     */
    var partial = createPartial(PARTIAL_FLAG);

    /**
     * This method is like `_.partial` except that partially applied arguments
     * are appended to those provided to the new function.
     *
     * The `_.partialRight.placeholder` value, which defaults to `_` in monolithic
     * builds, may be used as a placeholder for partially applied arguments.
     *
     * **Note:** This method does not set the "length" property of partially
     * applied functions.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [partials] The arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) {
     *   return greeting + ' ' + name;
     * };
     *
     * var greetFred = _.partialRight(greet, 'fred');
     * greetFred('hi');
     * // => 'hi fred'
     *
     * // using placeholders
     * var sayHelloTo = _.partialRight(greet, 'hello', _);
     * sayHelloTo('fred');
     * // => 'hello fred'
     */
    var partialRight = createPartial(PARTIAL_RIGHT_FLAG);

    /**
     * Creates a function that invokes `func` with arguments arranged according
     * to the specified indexes where the argument value at the first index is
     * provided as the first argument, the argument value at the second index is
     * provided as the second argument, and so on.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to rearrange arguments for.
     * @param {...(number|number[])} indexes The arranged argument indexes,
     *  specified as individual indexes or arrays of indexes.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var rearged = _.rearg(function(a, b, c) {
     *   return [a, b, c];
     * }, 2, 0, 1);
     *
     * rearged('b', 'c', 'a')
     * // => ['a', 'b', 'c']
     *
     * var map = _.rearg(_.map, [1, 0]);
     * map(function(n) {
     *   return n * 3;
     * }, [1, 2, 3]);
     * // => [3, 6, 9]
     */
    var rearg = restParam(function(func, indexes) {
      return createWrapper(func, REARG_FLAG, undefined, undefined, undefined, baseFlatten(indexes));
    });

    /**
     * Creates a function that invokes `func` with the `this` binding of the
     * created function and arguments from `start` and beyond provided as an array.
     *
     * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters).
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var say = _.restParam(function(what, names) {
     *   return what + ' ' + _.initial(names).join(', ') +
     *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
     * });
     *
     * say('hello', 'fred', 'barney', 'pebbles');
     * // => 'hello fred, barney, & pebbles'
     */
    function restParam(func, start) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
      return function() {
        var args = arguments,
            index = -1,
            length = nativeMax(args.length - start, 0),
            rest = Array(length);

        while (++index < length) {
          rest[index] = args[start + index];
        }
        switch (start) {
          case 0: return func.call(this, rest);
          case 1: return func.call(this, args[0], rest);
          case 2: return func.call(this, args[0], args[1], rest);
        }
        var otherArgs = Array(start + 1);
        index = -1;
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = rest;
        return func.apply(this, otherArgs);
      };
    }

    /**
     * Creates a function that invokes `func` with the `this` binding of the created
     * function and an array of arguments much like [`Function#apply`](https://es5.github.io/#x15.3.4.3).
     *
     * **Note:** This method is based on the [spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator).
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to spread arguments over.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var say = _.spread(function(who, what) {
     *   return who + ' says ' + what;
     * });
     *
     * say(['fred', 'hello']);
     * // => 'fred says hello'
     *
     * // with a Promise
     * var numbers = Promise.all([
     *   Promise.resolve(40),
     *   Promise.resolve(36)
     * ]);
     *
     * numbers.then(_.spread(function(x, y) {
     *   return x + y;
     * }));
     * // => a Promise of 76
     */
    function spread(func) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      return function(array) {
        return func.apply(this, array);
      };
    }

    /**
     * Creates a throttled function that only invokes `func` at most once per
     * every `wait` milliseconds. The throttled function comes with a `cancel`
     * method to cancel delayed invocations. Provide an options object to indicate
     * that `func` should be invoked on the leading and/or trailing edge of the
     * `wait` timeout. Subsequent calls to the throttled function return the
     * result of the last `func` call.
     *
     * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
     * on the trailing edge of the timeout only if the the throttled function is
     * invoked more than once during the `wait` timeout.
     *
     * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
     * for details over the differences between `_.throttle` and `_.debounce`.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {Function} func The function to throttle.
     * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=true] Specify invoking on the leading
     *  edge of the timeout.
     * @param {boolean} [options.trailing=true] Specify invoking on the trailing
     *  edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // avoid excessively updating the position while scrolling
     * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
     *
     * // invoke `renewToken` when the click event is fired, but not more than once every 5 minutes
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
     *
     * // cancel a trailing throttled call
     * jQuery(window).on('popstate', throttled.cancel);
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? !!options.leading : leading;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
      }
      return debounce(func, wait, { 'leading': leading, 'maxWait': +wait, 'trailing': trailing });
    }

    /**
     * Creates a function that provides `value` to the wrapper function as its
     * first argument. Any additional arguments provided to the function are
     * appended to those provided to the wrapper function. The wrapper is invoked
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Function
     * @param {*} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('fred, barney, & pebbles');
     * // => '<p>fred, barney, &amp; pebbles</p>'
     */
    function wrap(value, wrapper) {
      wrapper = wrapper == null ? identity : wrapper;
      return createWrapper(wrapper, PARTIAL_FLAG, undefined, [value], []);
    }

    /*------------------------------------------------------------------------*/

    /**
     * Creates a clone of `value`. If `isDeep` is `true` nested objects are cloned,
     * otherwise they are assigned by reference. If `customizer` is provided it is
     * invoked to produce the cloned values. If `customizer` returns `undefined`
     * cloning is handled by the method instead. The `customizer` is bound to
     * `thisArg` and invoked with two argument; (value [, index|key, object]).
     *
     * **Note:** This method is loosely based on the
     * [structured clone algorithm](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm).
     * The enumerable properties of `arguments` objects and objects created by
     * constructors other than `Object` are cloned to plain `Object` objects. An
     * empty object is returned for uncloneable values such as functions, DOM nodes,
     * Maps, Sets, and WeakMaps.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @param {Function} [customizer] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `customizer`.
     * @returns {*} Returns the cloned value.
     * @example
     *
     * var users = [
     *   { 'user': 'barney' },
     *   { 'user': 'fred' }
     * ];
     *
     * var shallow = _.clone(users);
     * shallow[0] === users[0];
     * // => true
     *
     * var deep = _.clone(users, true);
     * deep[0] === users[0];
     * // => false
     *
     * // using a customizer callback
     * var el = _.clone(document.body, function(value) {
     *   if (_.isElement(value)) {
     *     return value.cloneNode(false);
     *   }
     * });
     *
     * el === document.body
     * // => false
     * el.nodeName
     * // => BODY
     * el.childNodes.length;
     * // => 0
     */
    function clone(value, isDeep, customizer, thisArg) {
      if (isDeep && typeof isDeep != 'boolean' && isIterateeCall(value, isDeep, customizer)) {
        isDeep = false;
      }
      else if (typeof isDeep == 'function') {
        thisArg = customizer;
        customizer = isDeep;
        isDeep = false;
      }
      return typeof customizer == 'function'
        ? baseClone(value, isDeep, bindCallback(customizer, thisArg, 1))
        : baseClone(value, isDeep);
    }

    /**
     * Creates a deep clone of `value`. If `customizer` is provided it is invoked
     * to produce the cloned values. If `customizer` returns `undefined` cloning
     * is handled by the method instead. The `customizer` is bound to `thisArg`
     * and invoked with two argument; (value [, index|key, object]).
     *
     * **Note:** This method is loosely based on the
     * [structured clone algorithm](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm).
     * The enumerable properties of `arguments` objects and objects created by
     * constructors other than `Object` are cloned to plain `Object` objects. An
     * empty object is returned for uncloneable values such as functions, DOM nodes,
     * Maps, Sets, and WeakMaps.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to deep clone.
     * @param {Function} [customizer] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `customizer`.
     * @returns {*} Returns the deep cloned value.
     * @example
     *
     * var users = [
     *   { 'user': 'barney' },
     *   { 'user': 'fred' }
     * ];
     *
     * var deep = _.cloneDeep(users);
     * deep[0] === users[0];
     * // => false
     *
     * // using a customizer callback
     * var el = _.cloneDeep(document.body, function(value) {
     *   if (_.isElement(value)) {
     *     return value.cloneNode(true);
     *   }
     * });
     *
     * el === document.body
     * // => false
     * el.nodeName
     * // => BODY
     * el.childNodes.length;
     * // => 20
     */
    function cloneDeep(value, customizer, thisArg) {
      return typeof customizer == 'function'
        ? baseClone(value, true, bindCallback(customizer, thisArg, 1))
        : baseClone(value, true);
    }

    /**
     * Checks if `value` is greater than `other`.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if `value` is greater than `other`, else `false`.
     * @example
     *
     * _.gt(3, 1);
     * // => true
     *
     * _.gt(3, 3);
     * // => false
     *
     * _.gt(1, 3);
     * // => false
     */
    function gt(value, other) {
      return value > other;
    }

    /**
     * Checks if `value` is greater than or equal to `other`.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if `value` is greater than or equal to `other`, else `false`.
     * @example
     *
     * _.gte(3, 1);
     * // => true
     *
     * _.gte(3, 3);
     * // => true
     *
     * _.gte(1, 3);
     * // => false
     */
    function gte(value, other) {
      return value >= other;
    }

    /**
     * Checks if `value` is classified as an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      return isObjectLike(value) && isArrayLike(value) &&
        hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
    }

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(function() { return arguments; }());
     * // => false
     */
    var isArray = nativeIsArray || function(value) {
      return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
    };

    /**
     * Checks if `value` is classified as a boolean primitive or object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isBoolean(false);
     * // => true
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false || (isObjectLike(value) && objToString.call(value) == boolTag);
    }

    /**
     * Checks if `value` is classified as a `Date` object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     *
     * _.isDate('Mon April 23 2012');
     * // => false
     */
    function isDate(value) {
      return isObjectLike(value) && objToString.call(value) == dateTag;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     *
     * _.isElement('<body>');
     * // => false
     */
    function isElement(value) {
      return !!value && value.nodeType === 1 && isObjectLike(value) && !isPlainObject(value);
    }

    /**
     * Checks if `value` is empty. A value is considered empty unless it is an
     * `arguments` object, array, string, or jQuery-like collection with a length
     * greater than `0` or an object with own enumerable properties.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {Array|Object|string} value The value to inspect.
     * @returns {boolean} Returns `true` if `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty(null);
     * // => true
     *
     * _.isEmpty(true);
     * // => true
     *
     * _.isEmpty(1);
     * // => true
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({ 'a': 1 });
     * // => false
     */
    function isEmpty(value) {
      if (value == null) {
        return true;
      }
      if (isArrayLike(value) && (isArray(value) || isString(value) || isArguments(value) ||
          (isObjectLike(value) && isFunction(value.splice)))) {
        return !value.length;
      }
      return !keys(value).length;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent. If `customizer` is provided it is invoked to compare values.
     * If `customizer` returns `undefined` comparisons are handled by the method
     * instead. The `customizer` is bound to `thisArg` and invoked with three
     * arguments: (value, other [, index|key]).
     *
     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
     * numbers, `Object` objects, regexes, and strings. Objects are compared by
     * their own, not inherited, enumerable properties. Functions and DOM nodes
     * are **not** supported. Provide a customizer function to extend support
     * for comparing other values.
     *
     * @static
     * @memberOf _
     * @alias eq
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {Function} [customizer] The function to customize value comparisons.
     * @param {*} [thisArg] The `this` binding of `customizer`.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'user': 'fred' };
     * var other = { 'user': 'fred' };
     *
     * object == other;
     * // => false
     *
     * _.isEqual(object, other);
     * // => true
     *
     * // using a customizer callback
     * var array = ['hello', 'goodbye'];
     * var other = ['hi', 'goodbye'];
     *
     * _.isEqual(array, other, function(value, other) {
     *   if (_.every([value, other], RegExp.prototype.test, /^h(?:i|ello)$/)) {
     *     return true;
     *   }
     * });
     * // => true
     */
    function isEqual(value, other, customizer, thisArg) {
      customizer = typeof customizer == 'function' ? bindCallback(customizer, thisArg, 3) : undefined;
      var result = customizer ? customizer(value, other) : undefined;
      return  result === undefined ? baseIsEqual(value, other, customizer) : !!result;
    }

    /**
     * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
     * `SyntaxError`, `TypeError`, or `URIError` object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
     * @example
     *
     * _.isError(new Error);
     * // => true
     *
     * _.isError(Error);
     * // => false
     */
    function isError(value) {
      return isObjectLike(value) && typeof value.message == 'string' && objToString.call(value) == errorTag;
    }

    /**
     * Checks if `value` is a finite primitive number.
     *
     * **Note:** This method is based on [`Number.isFinite`](http://ecma-international.org/ecma-262/6.0/#sec-number.isfinite).
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a finite number, else `false`.
     * @example
     *
     * _.isFinite(10);
     * // => true
     *
     * _.isFinite('10');
     * // => false
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite(Object(10));
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    function isFinite(value) {
      return typeof value == 'number' && nativeIsFinite(value);
    }

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in older versions of Chrome and Safari which return 'function' for regexes
      // and Safari 8 equivalents which return 'object' for typed array constructors.
      return isObject(value) && objToString.call(value) == funcTag;
    }

    /**
     * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // Avoid a V8 JIT bug in Chrome 19-20.
      // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
      var type = typeof value;
      return !!value && (type == 'object' || type == 'function');
    }

    /**
     * Performs a deep comparison between `object` and `source` to determine if
     * `object` contains equivalent property values. If `customizer` is provided
     * it is invoked to compare values. If `customizer` returns `undefined`
     * comparisons are handled by the method instead. The `customizer` is bound
     * to `thisArg` and invoked with three arguments: (value, other, index|key).
     *
     * **Note:** This method supports comparing properties of arrays, booleans,
     * `Date` objects, numbers, `Object` objects, regexes, and strings. Functions
     * and DOM nodes are **not** supported. Provide a customizer function to extend
     * support for comparing other values.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property values to match.
     * @param {Function} [customizer] The function to customize value comparisons.
     * @param {*} [thisArg] The `this` binding of `customizer`.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     * @example
     *
     * var object = { 'user': 'fred', 'age': 40 };
     *
     * _.isMatch(object, { 'age': 40 });
     * // => true
     *
     * _.isMatch(object, { 'age': 36 });
     * // => false
     *
     * // using a customizer callback
     * var object = { 'greeting': 'hello' };
     * var source = { 'greeting': 'hi' };
     *
     * _.isMatch(object, source, function(value, other) {
     *   return _.every([value, other], RegExp.prototype.test, /^h(?:i|ello)$/) || undefined;
     * });
     * // => true
     */
    function isMatch(object, source, customizer, thisArg) {
      customizer = typeof customizer == 'function' ? bindCallback(customizer, thisArg, 3) : undefined;
      return baseIsMatch(object, getMatchData(source), customizer);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * **Note:** This method is not the same as [`isNaN`](https://es5.github.io/#x15.1.2.4)
     * which returns `true` for `undefined` and other non-numeric values.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // An `NaN` primitive is the only value that is not equal to itself.
      // Perform the `toStringTag` check first to avoid errors with some host objects in IE.
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is a native function.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
     * @example
     *
     * _.isNative(Array.prototype.push);
     * // => true
     *
     * _.isNative(_);
     * // => false
     */
    function isNative(value) {
      if (value == null) {
        return false;
      }
      if (isFunction(value)) {
        return reIsNative.test(fnToString.call(value));
      }
      return isObjectLike(value) && reIsHostCtor.test(value);
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(void 0);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is classified as a `Number` primitive or object.
     *
     * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
     * as numbers, use the `_.isFinite` method.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isNumber(8.4);
     * // => true
     *
     * _.isNumber(NaN);
     * // => true
     *
     * _.isNumber('8.4');
     * // => false
     */
    function isNumber(value) {
      return typeof value == 'number' || (isObjectLike(value) && objToString.call(value) == numberTag);
    }

    /**
     * Checks if `value` is a plain object, that is, an object created by the
     * `Object` constructor or one with a `[[Prototype]]` of `null`.
     *
     * **Note:** This method assumes objects created by the `Object` constructor
     * have no inherited enumerable properties.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * _.isPlainObject(new Foo);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     *
     * _.isPlainObject(Object.create(null));
     * // => true
     */
    function isPlainObject(value) {
      var Ctor;

      // Exit early for non `Object` objects.
      if (!(isObjectLike(value) && objToString.call(value) == objectTag && !isArguments(value)) ||
          (!hasOwnProperty.call(value, 'constructor') && (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
        return false;
      }
      // IE < 9 iterates inherited properties before own properties. If the first
      // iterated property is an object's own property then there are no inherited
      // enumerable properties.
      var result;
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      baseForIn(value, function(subValue, key) {
        result = key;
      });
      return result === undefined || hasOwnProperty.call(value, result);
    }

    /**
     * Checks if `value` is classified as a `RegExp` object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isRegExp(/abc/);
     * // => true
     *
     * _.isRegExp('/abc/');
     * // => false
     */
    function isRegExp(value) {
      return isObject(value) && objToString.call(value) == regexpTag;
    }

    /**
     * Checks if `value` is classified as a `String` primitive or object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isString('abc');
     * // => true
     *
     * _.isString(1);
     * // => false
     */
    function isString(value) {
      return typeof value == 'string' || (isObjectLike(value) && objToString.call(value) == stringTag);
    }

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    function isTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     *
     * _.isUndefined(null);
     * // => false
     */
    function isUndefined(value) {
      return value === undefined;
    }

    /**
     * Checks if `value` is less than `other`.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if `value` is less than `other`, else `false`.
     * @example
     *
     * _.lt(1, 3);
     * // => true
     *
     * _.lt(3, 3);
     * // => false
     *
     * _.lt(3, 1);
     * // => false
     */
    function lt(value, other) {
      return value < other;
    }

    /**
     * Checks if `value` is less than or equal to `other`.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if `value` is less than or equal to `other`, else `false`.
     * @example
     *
     * _.lte(1, 3);
     * // => true
     *
     * _.lte(3, 3);
     * // => true
     *
     * _.lte(3, 1);
     * // => false
     */
    function lte(value, other) {
      return value <= other;
    }

    /**
     * Converts `value` to an array.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {Array} Returns the converted array.
     * @example
     *
     * (function() {
     *   return _.toArray(arguments).slice(1);
     * }(1, 2, 3));
     * // => [2, 3]
     */
    function toArray(value) {
      var length = value ? getLength(value) : 0;
      if (!isLength(length)) {
        return values(value);
      }
      if (!length) {
        return [];
      }
      return arrayCopy(value);
    }

    /**
     * Converts `value` to a plain object flattening inherited enumerable
     * properties of `value` to own properties of the plain object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {Object} Returns the converted plain object.
     * @example
     *
     * function Foo() {
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.assign({ 'a': 1 }, new Foo);
     * // => { 'a': 1, 'b': 2 }
     *
     * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
     * // => { 'a': 1, 'b': 2, 'c': 3 }
     */
    function toPlainObject(value) {
      return baseCopy(value, keysIn(value));
    }

    /*------------------------------------------------------------------------*/

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined` into the destination object. Subsequent sources
     * overwrite property assignments of previous sources. If `customizer` is
     * provided it is invoked to produce the merged values of the destination and
     * source properties. If `customizer` returns `undefined` merging is handled
     * by the method instead. The `customizer` is bound to `thisArg` and invoked
     * with five arguments: (objectValue, sourceValue, key, object, source).
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @param {Function} [customizer] The function to customize assigned values.
     * @param {*} [thisArg] The `this` binding of `customizer`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var users = {
     *   'data': [{ 'user': 'barney' }, { 'user': 'fred' }]
     * };
     *
     * var ages = {
     *   'data': [{ 'age': 36 }, { 'age': 40 }]
     * };
     *
     * _.merge(users, ages);
     * // => { 'data': [{ 'user': 'barney', 'age': 36 }, { 'user': 'fred', 'age': 40 }] }
     *
     * // using a customizer callback
     * var object = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var other = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(object, other, function(a, b) {
     *   if (_.isArray(a)) {
     *     return a.concat(b);
     *   }
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }
     */
    var merge = createAssigner(baseMerge);

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources overwrite property assignments of previous sources.
     * If `customizer` is provided it is invoked to produce the assigned values.
     * The `customizer` is bound to `thisArg` and invoked with five arguments:
     * (objectValue, sourceValue, key, object, source).
     *
     * **Note:** This method mutates `object` and is based on
     * [`Object.assign`](http://ecma-international.org/ecma-262/6.0/#sec-object.assign).
     *
     * @static
     * @memberOf _
     * @alias extend
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @param {Function} [customizer] The function to customize assigned values.
     * @param {*} [thisArg] The `this` binding of `customizer`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
     * // => { 'user': 'fred', 'age': 40 }
     *
     * // using a customizer callback
     * var defaults = _.partialRight(_.assign, function(value, other) {
     *   return _.isUndefined(value) ? other : value;
     * });
     *
     * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
     * // => { 'user': 'barney', 'age': 36 }
     */
    var assign = createAssigner(function(object, source, customizer) {
      return customizer
        ? assignWith(object, source, customizer)
        : baseAssign(object, source);
    });

    /**
     * Creates an object that inherits from the given `prototype` object. If a
     * `properties` object is provided its own enumerable properties are assigned
     * to the created object.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, {
     *   'constructor': Circle
     * });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties, guard) {
      var result = baseCreate(prototype);
      if (guard && isIterateeCall(prototype, properties, guard)) {
        properties = undefined;
      }
      return properties ? baseAssign(result, properties) : result;
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional values of the same property are ignored.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
     * // => { 'user': 'barney', 'age': 36 }
     */
    var defaults = createDefaults(assign, assignDefaults);

    /**
     * This method is like `_.defaults` except that it recursively assigns
     * default properties.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.defaultsDeep({ 'user': { 'name': 'barney' } }, { 'user': { 'name': 'fred', 'age': 36 } });
     * // => { 'user': { 'name': 'barney', 'age': 36 } }
     *
     */
    var defaultsDeep = createDefaults(merge, mergeDefaults);

    /**
     * This method is like `_.find` except that it returns the key of the first
     * element `predicate` returns truthy for instead of the element itself.
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {string|undefined} Returns the key of the matched element, else `undefined`.
     * @example
     *
     * var users = {
     *   'barney':  { 'age': 36, 'active': true },
     *   'fred':    { 'age': 40, 'active': false },
     *   'pebbles': { 'age': 1,  'active': true }
     * };
     *
     * _.findKey(users, function(chr) {
     *   return chr.age < 40;
     * });
     * // => 'barney' (iteration order is not guaranteed)
     *
     * // using the `_.matches` callback shorthand
     * _.findKey(users, { 'age': 1, 'active': true });
     * // => 'pebbles'
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.findKey(users, 'active', false);
     * // => 'fred'
     *
     * // using the `_.property` callback shorthand
     * _.findKey(users, 'active');
     * // => 'barney'
     */
    var findKey = createFindKey(baseForOwn);

    /**
     * This method is like `_.findKey` except that it iterates over elements of
     * a collection in the opposite order.
     *
     * If a property name is provided for `predicate` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `predicate` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [predicate=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {string|undefined} Returns the key of the matched element, else `undefined`.
     * @example
     *
     * var users = {
     *   'barney':  { 'age': 36, 'active': true },
     *   'fred':    { 'age': 40, 'active': false },
     *   'pebbles': { 'age': 1,  'active': true }
     * };
     *
     * _.findLastKey(users, function(chr) {
     *   return chr.age < 40;
     * });
     * // => returns `pebbles` assuming `_.findKey` returns `barney`
     *
     * // using the `_.matches` callback shorthand
     * _.findLastKey(users, { 'age': 36, 'active': true });
     * // => 'barney'
     *
     * // using the `_.matchesProperty` callback shorthand
     * _.findLastKey(users, 'active', false);
     * // => 'fred'
     *
     * // using the `_.property` callback shorthand
     * _.findLastKey(users, 'active');
     * // => 'pebbles'
     */
    var findLastKey = createFindKey(baseForOwnRight);

    /**
     * Iterates over own and inherited enumerable properties of an object invoking
     * `iteratee` for each property. The `iteratee` is bound to `thisArg` and invoked
     * with three arguments: (value, key, object). Iteratee functions may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forIn(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'a', 'b', and 'c' (iteration order is not guaranteed)
     */
    var forIn = createForIn(baseFor);

    /**
     * This method is like `_.forIn` except that it iterates over properties of
     * `object` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forInRight(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'c', 'b', and 'a' assuming `_.forIn ` logs 'a', 'b', and 'c'
     */
    var forInRight = createForIn(baseForRight);

    /**
     * Iterates over own enumerable properties of an object invoking `iteratee`
     * for each property. The `iteratee` is bound to `thisArg` and invoked with
     * three arguments: (value, key, object). Iteratee functions may exit iteration
     * early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forOwn(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'a' and 'b' (iteration order is not guaranteed)
     */
    var forOwn = createForOwn(baseForOwn);

    /**
     * This method is like `_.forOwn` except that it iterates over properties of
     * `object` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forOwnRight(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'b' and 'a' assuming `_.forOwn` logs 'a' and 'b'
     */
    var forOwnRight = createForOwn(baseForOwnRight);

    /**
     * Creates an array of function property names from all enumerable properties,
     * own and inherited, of `object`.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Object
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns the new array of property names.
     * @example
     *
     * _.functions(_);
     * // => ['after', 'ary', 'assign', ...]
     */
    function functions(object) {
      return baseFunctions(object, keysIn(object));
    }

    /**
     * Gets the property value at `path` of `object`. If the resolved value is
     * `undefined` the `defaultValue` is used in its place.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @param {*} [defaultValue] The value returned if the resolved value is `undefined`.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.get(object, 'a[0].b.c');
     * // => 3
     *
     * _.get(object, ['a', '0', 'b', 'c']);
     * // => 3
     *
     * _.get(object, 'a.b.c', 'default');
     * // => 'default'
     */
    function get(object, path, defaultValue) {
      var result = object == null ? undefined : baseGet(object, toPath(path), path + '');
      return result === undefined ? defaultValue : result;
    }

    /**
     * Checks if `path` is a direct property.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @returns {boolean} Returns `true` if `path` is a direct property, else `false`.
     * @example
     *
     * var object = { 'a': { 'b': { 'c': 3 } } };
     *
     * _.has(object, 'a');
     * // => true
     *
     * _.has(object, 'a.b.c');
     * // => true
     *
     * _.has(object, ['a', 'b', 'c']);
     * // => true
     */
    function has(object, path) {
      if (object == null) {
        return false;
      }
      var result = hasOwnProperty.call(object, path);
      if (!result && !isKey(path)) {
        path = toPath(path);
        object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
        if (object == null) {
          return false;
        }
        path = last(path);
        result = hasOwnProperty.call(object, path);
      }
      return result || (isLength(object.length) && isIndex(path, object.length) &&
        (isArray(object) || isArguments(object)));
    }

    /**
     * Creates an object composed of the inverted keys and values of `object`.
     * If `object` contains duplicate values, subsequent values overwrite property
     * assignments of previous values unless `multiValue` is `true`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to invert.
     * @param {boolean} [multiValue] Allow multiple values per key.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Object} Returns the new inverted object.
     * @example
     *
     * var object = { 'a': 1, 'b': 2, 'c': 1 };
     *
     * _.invert(object);
     * // => { '1': 'c', '2': 'b' }
     *
     * // with `multiValue`
     * _.invert(object, true);
     * // => { '1': ['a', 'c'], '2': ['b'] }
     */
    function invert(object, multiValue, guard) {
      if (guard && isIterateeCall(object, multiValue, guard)) {
        multiValue = undefined;
      }
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index],
            value = object[key];

        if (multiValue) {
          if (hasOwnProperty.call(result, value)) {
            result[value].push(key);
          } else {
            result[value] = [key];
          }
        }
        else {
          result[value] = key;
        }
      }
      return result;
    }

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      var Ctor = object == null ? undefined : object.constructor;
      if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
          (typeof object != 'function' && isArrayLike(object))) {
        return shimKeys(object);
      }
      return isObject(object) ? nativeKeys(object) : [];
    };

    /**
     * Creates an array of the own and inherited enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keysIn(new Foo);
     * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
     */
    function keysIn(object) {
      if (object == null) {
        return [];
      }
      if (!isObject(object)) {
        object = Object(object);
      }
      var length = object.length;
      length = (length && isLength(length) &&
        (isArray(object) || isArguments(object)) && length) || 0;

      var Ctor = object.constructor,
          index = -1,
          isProto = typeof Ctor == 'function' && Ctor.prototype === object,
          result = Array(length),
          skipIndexes = length > 0;

      while (++index < length) {
        result[index] = (index + '');
      }
      for (var key in object) {
        if (!(skipIndexes && isIndex(key, length)) &&
            !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * The opposite of `_.mapValues`; this method creates an object with the
     * same values as `object` and keys generated by running each own enumerable
     * property of `object` through `iteratee`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Object} Returns the new mapped object.
     * @example
     *
     * _.mapKeys({ 'a': 1, 'b': 2 }, function(value, key) {
     *   return key + value;
     * });
     * // => { 'a1': 1, 'b2': 2 }
     */
    var mapKeys = createObjectMapper(true);

    /**
     * Creates an object with the same keys as `object` and values generated by
     * running each own enumerable property of `object` through `iteratee`. The
     * iteratee function is bound to `thisArg` and invoked with three arguments:
     * (value, key, object).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
     *  per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Object} Returns the new mapped object.
     * @example
     *
     * _.mapValues({ 'a': 1, 'b': 2 }, function(n) {
     *   return n * 3;
     * });
     * // => { 'a': 3, 'b': 6 }
     *
     * var users = {
     *   'fred':    { 'user': 'fred',    'age': 40 },
     *   'pebbles': { 'user': 'pebbles', 'age': 1 }
     * };
     *
     * // using the `_.property` callback shorthand
     * _.mapValues(users, 'age');
     * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
     */
    var mapValues = createObjectMapper();

    /**
     * The opposite of `_.pick`; this method creates an object composed of the
     * own and inherited enumerable properties of `object` that are not omitted.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The source object.
     * @param {Function|...(string|string[])} [predicate] The function invoked per
     *  iteration or property names to omit, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Object} Returns the new object.
     * @example
     *
     * var object = { 'user': 'fred', 'age': 40 };
     *
     * _.omit(object, 'age');
     * // => { 'user': 'fred' }
     *
     * _.omit(object, _.isNumber);
     * // => { 'user': 'fred' }
     */
    var omit = restParam(function(object, props) {
      if (object == null) {
        return {};
      }
      if (typeof props[0] != 'function') {
        var props = arrayMap(baseFlatten(props), String);
        return pickByArray(object, baseDifference(keysIn(object), props));
      }
      var predicate = bindCallback(props[0], props[1], 3);
      return pickByCallback(object, function(value, key, object) {
        return !predicate(value, key, object);
      });
    });

    /**
     * Creates a two dimensional array of the key-value pairs for `object`,
     * e.g. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'barney': 36, 'fred': 40 });
     * // => [['barney', 36], ['fred', 40]] (iteration order is not guaranteed)
     */
    function pairs(object) {
      object = toObject(object);

      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        var key = props[index];
        result[index] = [key, object[key]];
      }
      return result;
    }

    /**
     * Creates an object composed of the picked `object` properties. Property
     * names may be specified as individual arguments or as arrays of property
     * names. If `predicate` is provided it is invoked for each property of `object`
     * picking the properties `predicate` returns truthy for. The predicate is
     * bound to `thisArg` and invoked with three arguments: (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The source object.
     * @param {Function|...(string|string[])} [predicate] The function invoked per
     *  iteration or property names to pick, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `predicate`.
     * @returns {Object} Returns the new object.
     * @example
     *
     * var object = { 'user': 'fred', 'age': 40 };
     *
     * _.pick(object, 'user');
     * // => { 'user': 'fred' }
     *
     * _.pick(object, _.isString);
     * // => { 'user': 'fred' }
     */
    var pick = restParam(function(object, props) {
      if (object == null) {
        return {};
      }
      return typeof props[0] == 'function'
        ? pickByCallback(object, bindCallback(props[0], props[1], 3))
        : pickByArray(object, baseFlatten(props));
    });

    /**
     * This method is like `_.get` except that if the resolved value is a function
     * it is invoked with the `this` binding of its parent object and its result
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to resolve.
     * @param {*} [defaultValue] The value returned if the resolved value is `undefined`.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c1': 3, 'c2': _.constant(4) } }] };
     *
     * _.result(object, 'a[0].b.c1');
     * // => 3
     *
     * _.result(object, 'a[0].b.c2');
     * // => 4
     *
     * _.result(object, 'a.b.c', 'default');
     * // => 'default'
     *
     * _.result(object, 'a.b.c', _.constant('default'));
     * // => 'default'
     */
    function result(object, path, defaultValue) {
      var result = object == null ? undefined : object[path];
      if (result === undefined) {
        if (object != null && !isKey(path, object)) {
          path = toPath(path);
          object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
          result = object == null ? undefined : object[last(path)];
        }
        result = result === undefined ? defaultValue : result;
      }
      return isFunction(result) ? result.call(object) : result;
    }

    /**
     * Sets the property value of `path` on `object`. If a portion of `path`
     * does not exist it is created.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to augment.
     * @param {Array|string} path The path of the property to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.set(object, 'a[0].b.c', 4);
     * console.log(object.a[0].b.c);
     * // => 4
     *
     * _.set(object, 'x[0].y.z', 5);
     * console.log(object.x[0].y.z);
     * // => 5
     */
    function set(object, path, value) {
      if (object == null) {
        return object;
      }
      var pathKey = (path + '');
      path = (object[pathKey] != null || isKey(path, object)) ? [pathKey] : toPath(path);

      var index = -1,
          length = path.length,
          lastIndex = length - 1,
          nested = object;

      while (nested != null && ++index < length) {
        var key = path[index];
        if (isObject(nested)) {
          if (index == lastIndex) {
            nested[key] = value;
          } else if (nested[key] == null) {
            nested[key] = isIndex(path[index + 1]) ? [] : {};
          }
        }
        nested = nested[key];
      }
      return object;
    }

    /**
     * An alternative to `_.reduce`; this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own enumerable
     * properties through `iteratee`, with each invocation potentially mutating
     * the `accumulator` object. The `iteratee` is bound to `thisArg` and invoked
     * with four arguments: (accumulator, value, key, object). Iteratee functions
     * may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * _.transform([2, 3, 4], function(result, n) {
     *   result.push(n *= n);
     *   return n % 2 == 0;
     * });
     * // => [4, 9]
     *
     * _.transform({ 'a': 1, 'b': 2 }, function(result, n, key) {
     *   result[key] = n * 3;
     * });
     * // => { 'a': 3, 'b': 6 }
     */
    function transform(object, iteratee, accumulator, thisArg) {
      var isArr = isArray(object) || isTypedArray(object);
      iteratee = getCallback(iteratee, thisArg, 4);

      if (accumulator == null) {
        if (isArr || isObject(object)) {
          var Ctor = object.constructor;
          if (isArr) {
            accumulator = isArray(object) ? new Ctor : [];
          } else {
            accumulator = baseCreate(isFunction(Ctor) ? Ctor.prototype : undefined);
          }
        } else {
          accumulator = {};
        }
      }
      (isArr ? arrayEach : baseForOwn)(object, function(value, index, object) {
        return iteratee(accumulator, value, index, object);
      });
      return accumulator;
    }

    /**
     * Creates an array of the own enumerable property values of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property values.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.values(new Foo);
     * // => [1, 2] (iteration order is not guaranteed)
     *
     * _.values('hi');
     * // => ['h', 'i']
     */
    function values(object) {
      return baseValues(object, keys(object));
    }

    /**
     * Creates an array of the own and inherited enumerable property values
     * of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property values.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.valuesIn(new Foo);
     * // => [1, 2, 3] (iteration order is not guaranteed)
     */
    function valuesIn(object) {
      return baseValues(object, keysIn(object));
    }

    /*------------------------------------------------------------------------*/

    /**
     * Checks if `n` is between `start` and up to but not including, `end`. If
     * `end` is not specified it is set to `start` with `start` then set to `0`.
     *
     * @static
     * @memberOf _
     * @category Number
     * @param {number} n The number to check.
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @returns {boolean} Returns `true` if `n` is in the range, else `false`.
     * @example
     *
     * _.inRange(3, 2, 4);
     * // => true
     *
     * _.inRange(4, 8);
     * // => true
     *
     * _.inRange(4, 2);
     * // => false
     *
     * _.inRange(2, 2);
     * // => false
     *
     * _.inRange(1.2, 2);
     * // => true
     *
     * _.inRange(5.2, 4);
     * // => false
     */
    function inRange(value, start, end) {
      start = +start || 0;
      if (end === undefined) {
        end = start;
        start = 0;
      } else {
        end = +end || 0;
      }
      return value >= nativeMin(start, end) && value < nativeMax(start, end);
    }

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is provided a number between `0` and the given number is returned.
     * If `floating` is `true`, or either `min` or `max` are floats, a floating-point
     * number is returned instead of an integer.
     *
     * @static
     * @memberOf _
     * @category Number
     * @param {number} [min=0] The minimum possible value.
     * @param {number} [max=1] The maximum possible value.
     * @param {boolean} [floating] Specify returning a floating-point number.
     * @returns {number} Returns the random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(min, max, floating) {
      if (floating && isIterateeCall(min, max, floating)) {
        max = floating = undefined;
      }
      var noMin = min == null,
          noMax = max == null;

      if (floating == null) {
        if (noMax && typeof min == 'boolean') {
          floating = min;
          min = 1;
        }
        else if (typeof max == 'boolean') {
          floating = max;
          noMax = true;
        }
      }
      if (noMin && noMax) {
        max = 1;
        noMax = false;
      }
      min = +min || 0;
      if (noMax) {
        max = min;
        min = 0;
      } else {
        max = +max || 0;
      }
      if (floating || min % 1 || max % 1) {
        var rand = nativeRandom();
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand + '').length - 1)))), max);
      }
      return baseRandom(min, max);
    }

    /*------------------------------------------------------------------------*/

    /**
     * Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the camel cased string.
     * @example
     *
     * _.camelCase('Foo Bar');
     * // => 'fooBar'
     *
     * _.camelCase('--foo-bar');
     * // => 'fooBar'
     *
     * _.camelCase('__foo_bar__');
     * // => 'fooBar'
     */
    var camelCase = createCompounder(function(result, word, index) {
      word = word.toLowerCase();
      return result + (index ? (word.charAt(0).toUpperCase() + word.slice(1)) : word);
    });

    /**
     * Capitalizes the first character of `string`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to capitalize.
     * @returns {string} Returns the capitalized string.
     * @example
     *
     * _.capitalize('fred');
     * // => 'Fred'
     */
    function capitalize(string) {
      string = baseToString(string);
      return string && (string.charAt(0).toUpperCase() + string.slice(1));
    }

    /**
     * Deburrs `string` by converting [latin-1 supplementary letters](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
     * to basic latin letters and removing [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to deburr.
     * @returns {string} Returns the deburred string.
     * @example
     *
     * _.deburr('déjà vu');
     * // => 'deja vu'
     */
    function deburr(string) {
      string = baseToString(string);
      return string && string.replace(reLatin1, deburrLetter).replace(reComboMark, '');
    }

    /**
     * Checks if `string` ends with the given target string.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to search.
     * @param {string} [target] The string to search for.
     * @param {number} [position=string.length] The position to search from.
     * @returns {boolean} Returns `true` if `string` ends with `target`, else `false`.
     * @example
     *
     * _.endsWith('abc', 'c');
     * // => true
     *
     * _.endsWith('abc', 'b');
     * // => false
     *
     * _.endsWith('abc', 'b', 2);
     * // => true
     */
    function endsWith(string, target, position) {
      string = baseToString(string);
      target = (target + '');

      var length = string.length;
      position = position === undefined
        ? length
        : nativeMin(position < 0 ? 0 : (+position || 0), length);

      position -= target.length;
      return position >= 0 && string.indexOf(target, position) == position;
    }

    /**
     * Converts the characters "&", "<", ">", '"', "'", and "\`", in `string` to
     * their corresponding HTML entities.
     *
     * **Note:** No other characters are escaped. To escape additional characters
     * use a third-party library like [_he_](https://mths.be/he).
     *
     * Though the ">" character is escaped for symmetry, characters like
     * ">" and "/" don't need escaping in HTML and have no special meaning
     * unless they're part of a tag or unquoted attribute value.
     * See [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
     * (under "semi-related fun fact") for more details.
     *
     * Backticks are escaped because in Internet Explorer < 9, they can break out
     * of attribute values or HTML comments. See [#59](https://html5sec.org/#59),
     * [#102](https://html5sec.org/#102), [#108](https://html5sec.org/#108), and
     * [#133](https://html5sec.org/#133) of the [HTML5 Security Cheatsheet](https://html5sec.org/)
     * for more details.
     *
     * When working with HTML you should always [quote attribute values](http://wonko.com/post/html-escaping)
     * to reduce XSS vectors.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('fred, barney, & pebbles');
     * // => 'fred, barney, &amp; pebbles'
     */
    function escape(string) {
      // Reset `lastIndex` because in IE < 9 `String#replace` does not.
      string = baseToString(string);
      return (string && reHasUnescapedHtml.test(string))
        ? string.replace(reUnescapedHtml, escapeHtmlChar)
        : string;
    }

    /**
     * Escapes the `RegExp` special characters "\", "/", "^", "$", ".", "|", "?",
     * "*", "+", "(", ")", "[", "]", "{" and "}" in `string`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escapeRegExp('[lodash](https://lodash.com/)');
     * // => '\[lodash\]\(https:\/\/lodash\.com\/\)'
     */
    function escapeRegExp(string) {
      string = baseToString(string);
      return (string && reHasRegExpChars.test(string))
        ? string.replace(reRegExpChars, escapeRegExpChar)
        : (string || '(?:)');
    }

    /**
     * Converts `string` to [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the kebab cased string.
     * @example
     *
     * _.kebabCase('Foo Bar');
     * // => 'foo-bar'
     *
     * _.kebabCase('fooBar');
     * // => 'foo-bar'
     *
     * _.kebabCase('__foo_bar__');
     * // => 'foo-bar'
     */
    var kebabCase = createCompounder(function(result, word, index) {
      return result + (index ? '-' : '') + word.toLowerCase();
    });

    /**
     * Pads `string` on the left and right sides if it's shorter than `length`.
     * Padding characters are truncated if they can't be evenly divided by `length`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to pad.
     * @param {number} [length=0] The padding length.
     * @param {string} [chars=' '] The string used as padding.
     * @returns {string} Returns the padded string.
     * @example
     *
     * _.pad('abc', 8);
     * // => '  abc   '
     *
     * _.pad('abc', 8, '_-');
     * // => '_-abc_-_'
     *
     * _.pad('abc', 3);
     * // => 'abc'
     */
    function pad(string, length, chars) {
      string = baseToString(string);
      length = +length;

      var strLength = string.length;
      if (strLength >= length || !nativeIsFinite(length)) {
        return string;
      }
      var mid = (length - strLength) / 2,
          leftLength = nativeFloor(mid),
          rightLength = nativeCeil(mid);

      chars = createPadding('', rightLength, chars);
      return chars.slice(0, leftLength) + string + chars;
    }

    /**
     * Pads `string` on the left side if it's shorter than `length`. Padding
     * characters are truncated if they exceed `length`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to pad.
     * @param {number} [length=0] The padding length.
     * @param {string} [chars=' '] The string used as padding.
     * @returns {string} Returns the padded string.
     * @example
     *
     * _.padLeft('abc', 6);
     * // => '   abc'
     *
     * _.padLeft('abc', 6, '_-');
     * // => '_-_abc'
     *
     * _.padLeft('abc', 3);
     * // => 'abc'
     */
    var padLeft = createPadDir();

    /**
     * Pads `string` on the right side if it's shorter than `length`. Padding
     * characters are truncated if they exceed `length`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to pad.
     * @param {number} [length=0] The padding length.
     * @param {string} [chars=' '] The string used as padding.
     * @returns {string} Returns the padded string.
     * @example
     *
     * _.padRight('abc', 6);
     * // => 'abc   '
     *
     * _.padRight('abc', 6, '_-');
     * // => 'abc_-_'
     *
     * _.padRight('abc', 3);
     * // => 'abc'
     */
    var padRight = createPadDir(true);

    /**
     * Converts `string` to an integer of the specified radix. If `radix` is
     * `undefined` or `0`, a `radix` of `10` is used unless `value` is a hexadecimal,
     * in which case a `radix` of `16` is used.
     *
     * **Note:** This method aligns with the [ES5 implementation](https://es5.github.io/#E)
     * of `parseInt`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} string The string to convert.
     * @param {number} [radix] The radix to interpret `value` by.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     *
     * _.map(['6', '08', '10'], _.parseInt);
     * // => [6, 8, 10]
     */
    function parseInt(string, radix, guard) {
      // Firefox < 21 and Opera < 15 follow ES3 for `parseInt`.
      // Chrome fails to trim leading <BOM> whitespace characters.
      // See https://code.google.com/p/v8/issues/detail?id=3109 for more details.
      if (guard ? isIterateeCall(string, radix, guard) : radix == null) {
        radix = 0;
      } else if (radix) {
        radix = +radix;
      }
      string = trim(string);
      return nativeParseInt(string, radix || (reHasHexPrefix.test(string) ? 16 : 10));
    }

    /**
     * Repeats the given string `n` times.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to repeat.
     * @param {number} [n=0] The number of times to repeat the string.
     * @returns {string} Returns the repeated string.
     * @example
     *
     * _.repeat('*', 3);
     * // => '***'
     *
     * _.repeat('abc', 2);
     * // => 'abcabc'
     *
     * _.repeat('abc', 0);
     * // => ''
     */
    function repeat(string, n) {
      var result = '';
      string = baseToString(string);
      n = +n;
      if (n < 1 || !string || !nativeIsFinite(n)) {
        return result;
      }
      // Leverage the exponentiation by squaring algorithm for a faster repeat.
      // See https://en.wikipedia.org/wiki/Exponentiation_by_squaring for more details.
      do {
        if (n % 2) {
          result += string;
        }
        n = nativeFloor(n / 2);
        string += string;
      } while (n);

      return result;
    }

    /**
     * Converts `string` to [snake case](https://en.wikipedia.org/wiki/Snake_case).
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the snake cased string.
     * @example
     *
     * _.snakeCase('Foo Bar');
     * // => 'foo_bar'
     *
     * _.snakeCase('fooBar');
     * // => 'foo_bar'
     *
     * _.snakeCase('--foo-bar');
     * // => 'foo_bar'
     */
    var snakeCase = createCompounder(function(result, word, index) {
      return result + (index ? '_' : '') + word.toLowerCase();
    });

    /**
     * Converts `string` to [start case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the start cased string.
     * @example
     *
     * _.startCase('--foo-bar');
     * // => 'Foo Bar'
     *
     * _.startCase('fooBar');
     * // => 'Foo Bar'
     *
     * _.startCase('__foo_bar__');
     * // => 'Foo Bar'
     */
    var startCase = createCompounder(function(result, word, index) {
      return result + (index ? ' ' : '') + (word.charAt(0).toUpperCase() + word.slice(1));
    });

    /**
     * Checks if `string` starts with the given target string.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to search.
     * @param {string} [target] The string to search for.
     * @param {number} [position=0] The position to search from.
     * @returns {boolean} Returns `true` if `string` starts with `target`, else `false`.
     * @example
     *
     * _.startsWith('abc', 'a');
     * // => true
     *
     * _.startsWith('abc', 'b');
     * // => false
     *
     * _.startsWith('abc', 'b', 1);
     * // => true
     */
    function startsWith(string, target, position) {
      string = baseToString(string);
      position = position == null
        ? 0
        : nativeMin(position < 0 ? 0 : (+position || 0), string.length);

      return string.lastIndexOf(target, position) == position;
    }

    /**
     * Creates a compiled template function that can interpolate data properties
     * in "interpolate" delimiters, HTML-escape interpolated data properties in
     * "escape" delimiters, and execute JavaScript in "evaluate" delimiters. Data
     * properties may be accessed as free variables in the template. If a setting
     * object is provided it takes precedence over `_.templateSettings` values.
     *
     * **Note:** In the development build `_.template` utilizes
     * [sourceURLs](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl)
     * for easier debugging.
     *
     * For more information on precompiling templates see
     * [lodash's custom builds documentation](https://lodash.com/custom-builds).
     *
     * For more information on Chrome extension sandboxes see
     * [Chrome's extensions documentation](https://developer.chrome.com/extensions/sandboxingEval).
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The template string.
     * @param {Object} [options] The options object.
     * @param {RegExp} [options.escape] The HTML "escape" delimiter.
     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
     * @param {Object} [options.imports] An object to import into the template as free variables.
     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
     * @param {string} [options.sourceURL] The sourceURL of the template's compiled source.
     * @param {string} [options.variable] The data object variable name.
     * @param- {Object} [otherOptions] Enables the legacy `options` param signature.
     * @returns {Function} Returns the compiled template function.
     * @example
     *
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = _.template('hello <%= user %>!');
     * compiled({ 'user': 'fred' });
     * // => 'hello fred!'
     *
     * // using the HTML "escape" delimiter to escape data property values
     * var compiled = _.template('<b><%- value %></b>');
     * compiled({ 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to execute JavaScript and generate HTML
     * var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
     * compiled({ 'users': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * var compiled = _.template('<% print("hello " + user); %>!');
     * compiled({ 'user': 'barney' });
     * // => 'hello barney!'
     *
     * // using the ES delimiter as an alternative to the default "interpolate" delimiter
     * var compiled = _.template('hello ${ user }!');
     * compiled({ 'user': 'pebbles' });
     * // => 'hello pebbles!'
     *
     * // using custom template delimiters
     * _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
     * var compiled = _.template('hello {{ user }}!');
     * compiled({ 'user': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using backslashes to treat delimiters as plain text
     * var compiled = _.template('<%= "\\<%- value %\\>" %>');
     * compiled({ 'value': 'ignored' });
     * // => '<%- value %>'
     *
     * // using the `imports` option to import `jQuery` as `jq`
     * var text = '<% jq.each(users, function(user) { %><li><%- user %></li><% }); %>';
     * var compiled = _.template(text, { 'imports': { 'jq': jQuery } });
     * compiled({ 'users': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= user %>!', { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.user %>!', { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     * //   var __t, __p = '';
     * //   __p += 'hi ' + ((__t = ( data.user )) == null ? '' : __t) + '!';
     * //   return __p;
     * // }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(string, options, otherOptions) {
      // Based on John Resig's `tmpl` implementation (http://ejohn.org/blog/javascript-micro-templating/)
      // and Laura Doktorova's doT.js (https://github.com/olado/doT).
      var settings = lodash.templateSettings;

      if (otherOptions && isIterateeCall(string, options, otherOptions)) {
        options = otherOptions = undefined;
      }
      string = baseToString(string);
      options = assignWith(baseAssign({}, otherOptions || options), settings, assignOwnDefaults);

      var imports = assignWith(baseAssign({}, options.imports), settings.imports, assignOwnDefaults),
          importsKeys = keys(imports),
          importsValues = baseValues(imports, importsKeys);

      var isEscaping,
          isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // Compile the regexp to match each delimiter.
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      // Use a sourceURL for easier debugging.
      var sourceURL = '//# sourceURL=' +
        ('sourceURL' in options
          ? options.sourceURL
          : ('lodash.templateSources[' + (++templateCounter) + ']')
        ) + '\n';

      string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // Escape characters that can't be included in string literals.
        source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // Replace delimiters with snippets.
        if (escapeValue) {
          isEscaping = true;
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // The JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value.
        return match;
      });

      source += "';\n";

      // If `variable` is not specified wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain.
      var variable = options.variable;
      if (!variable) {
        source = 'with (obj) {\n' + source + '\n}\n';
      }
      // Cleanup code by stripping empty strings.
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // Frame code as the function body.
      source = 'function(' + (variable || 'obj') + ') {\n' +
        (variable
          ? ''
          : 'obj || (obj = {});\n'
        ) +
        "var __t, __p = ''" +
        (isEscaping
           ? ', __e = _.escape'
           : ''
        ) +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      var result = attempt(function() {
        return Function(importsKeys, sourceURL + 'return ' + source).apply(undefined, importsValues);
      });

      // Provide the compiled function's source by its `toString` method or
      // the `source` property as a convenience for inlining compiled templates.
      result.source = source;
      if (isError(result)) {
        throw result;
      }
      return result;
    }

    /**
     * Removes leading and trailing whitespace or specified characters from `string`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to trim.
     * @param {string} [chars=whitespace] The characters to trim.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {string} Returns the trimmed string.
     * @example
     *
     * _.trim('  abc  ');
     * // => 'abc'
     *
     * _.trim('-_-abc-_-', '_-');
     * // => 'abc'
     *
     * _.map(['  foo  ', '  bar  '], _.trim);
     * // => ['foo', 'bar']
     */
    function trim(string, chars, guard) {
      var value = string;
      string = baseToString(string);
      if (!string) {
        return string;
      }
      if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
        return string.slice(trimmedLeftIndex(string), trimmedRightIndex(string) + 1);
      }
      chars = (chars + '');
      return string.slice(charsLeftIndex(string, chars), charsRightIndex(string, chars) + 1);
    }

    /**
     * Removes leading whitespace or specified characters from `string`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to trim.
     * @param {string} [chars=whitespace] The characters to trim.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {string} Returns the trimmed string.
     * @example
     *
     * _.trimLeft('  abc  ');
     * // => 'abc  '
     *
     * _.trimLeft('-_-abc-_-', '_-');
     * // => 'abc-_-'
     */
    function trimLeft(string, chars, guard) {
      var value = string;
      string = baseToString(string);
      if (!string) {
        return string;
      }
      if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
        return string.slice(trimmedLeftIndex(string));
      }
      return string.slice(charsLeftIndex(string, (chars + '')));
    }

    /**
     * Removes trailing whitespace or specified characters from `string`.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to trim.
     * @param {string} [chars=whitespace] The characters to trim.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {string} Returns the trimmed string.
     * @example
     *
     * _.trimRight('  abc  ');
     * // => '  abc'
     *
     * _.trimRight('-_-abc-_-', '_-');
     * // => '-_-abc'
     */
    function trimRight(string, chars, guard) {
      var value = string;
      string = baseToString(string);
      if (!string) {
        return string;
      }
      if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
        return string.slice(0, trimmedRightIndex(string) + 1);
      }
      return string.slice(0, charsRightIndex(string, (chars + '')) + 1);
    }

    /**
     * Truncates `string` if it's longer than the given maximum string length.
     * The last characters of the truncated string are replaced with the omission
     * string which defaults to "...".
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to truncate.
     * @param {Object|number} [options] The options object or maximum string length.
     * @param {number} [options.length=30] The maximum string length.
     * @param {string} [options.omission='...'] The string to indicate text is omitted.
     * @param {RegExp|string} [options.separator] The separator pattern to truncate to.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {string} Returns the truncated string.
     * @example
     *
     * _.trunc('hi-diddly-ho there, neighborino');
     * // => 'hi-diddly-ho there, neighbo...'
     *
     * _.trunc('hi-diddly-ho there, neighborino', 24);
     * // => 'hi-diddly-ho there, n...'
     *
     * _.trunc('hi-diddly-ho there, neighborino', {
     *   'length': 24,
     *   'separator': ' '
     * });
     * // => 'hi-diddly-ho there,...'
     *
     * _.trunc('hi-diddly-ho there, neighborino', {
     *   'length': 24,
     *   'separator': /,? +/
     * });
     * // => 'hi-diddly-ho there...'
     *
     * _.trunc('hi-diddly-ho there, neighborino', {
     *   'omission': ' [...]'
     * });
     * // => 'hi-diddly-ho there, neig [...]'
     */
    function trunc(string, options, guard) {
      if (guard && isIterateeCall(string, options, guard)) {
        options = undefined;
      }
      var length = DEFAULT_TRUNC_LENGTH,
          omission = DEFAULT_TRUNC_OMISSION;

      if (options != null) {
        if (isObject(options)) {
          var separator = 'separator' in options ? options.separator : separator;
          length = 'length' in options ? (+options.length || 0) : length;
          omission = 'omission' in options ? baseToString(options.omission) : omission;
        } else {
          length = +options || 0;
        }
      }
      string = baseToString(string);
      if (length >= string.length) {
        return string;
      }
      var end = length - omission.length;
      if (end < 1) {
        return omission;
      }
      var result = string.slice(0, end);
      if (separator == null) {
        return result + omission;
      }
      if (isRegExp(separator)) {
        if (string.slice(end).search(separator)) {
          var match,
              newEnd,
              substring = string.slice(0, end);

          if (!separator.global) {
            separator = RegExp(separator.source, (reFlags.exec(separator) || '') + 'g');
          }
          separator.lastIndex = 0;
          while ((match = separator.exec(substring))) {
            newEnd = match.index;
          }
          result = result.slice(0, newEnd == null ? end : newEnd);
        }
      } else if (string.indexOf(separator, end) != end) {
        var index = result.lastIndexOf(separator);
        if (index > -1) {
          result = result.slice(0, index);
        }
      }
      return result + omission;
    }

    /**
     * The inverse of `_.escape`; this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`, and `&#96;` in `string` to their
     * corresponding characters.
     *
     * **Note:** No other HTML entities are unescaped. To unescape additional HTML
     * entities use a third-party library like [_he_](https://mths.be/he).
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('fred, barney, &amp; pebbles');
     * // => 'fred, barney, & pebbles'
     */
    function unescape(string) {
      string = baseToString(string);
      return (string && reHasEscapedHtml.test(string))
        ? string.replace(reEscapedHtml, unescapeHtmlChar)
        : string;
    }

    /**
     * Splits `string` into an array of its words.
     *
     * @static
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to inspect.
     * @param {RegExp|string} [pattern] The pattern to match words.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Array} Returns the words of `string`.
     * @example
     *
     * _.words('fred, barney, & pebbles');
     * // => ['fred', 'barney', 'pebbles']
     *
     * _.words('fred, barney, & pebbles', /[^, ]+/g);
     * // => ['fred', 'barney', '&', 'pebbles']
     */
    function words(string, pattern, guard) {
      if (guard && isIterateeCall(string, pattern, guard)) {
        pattern = undefined;
      }
      string = baseToString(string);
      return string.match(pattern || reWords) || [];
    }

    /*------------------------------------------------------------------------*/

    /**
     * Attempts to invoke `func`, returning either the result or the caught error
     * object. Any additional arguments are provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {Function} func The function to attempt.
     * @returns {*} Returns the `func` result or error object.
     * @example
     *
     * // avoid throwing errors for invalid selectors
     * var elements = _.attempt(function(selector) {
     *   return document.querySelectorAll(selector);
     * }, '>_>');
     *
     * if (_.isError(elements)) {
     *   elements = [];
     * }
     */
    var attempt = restParam(function(func, args) {
      try {
        return func.apply(undefined, args);
      } catch(e) {
        return isError(e) ? e : new Error(e);
      }
    });

    /**
     * Creates a function that invokes `func` with the `this` binding of `thisArg`
     * and arguments of the created function. If `func` is a property name the
     * created callback returns the property value for a given element. If `func`
     * is an object the created callback returns `true` for elements that contain
     * the equivalent object properties, otherwise it returns `false`.
     *
     * @static
     * @memberOf _
     * @alias iteratee
     * @category Utility
     * @param {*} [func=_.identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
     * @returns {Function} Returns the callback.
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36 },
     *   { 'user': 'fred',   'age': 40 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.callback = _.wrap(_.callback, function(callback, func, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(func);
     *   if (!match) {
     *     return callback(func, thisArg);
     *   }
     *   return function(object) {
     *     return match[2] == 'gt'
     *       ? object[match[1]] > match[3]
     *       : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(users, 'age__gt36');
     * // => [{ 'user': 'fred', 'age': 40 }]
     */
    function callback(func, thisArg, guard) {
      if (guard && isIterateeCall(func, thisArg, guard)) {
        thisArg = undefined;
      }
      return isObjectLike(func)
        ? matches(func)
        : baseCallback(func, thisArg);
    }

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var object = { 'user': 'fred' };
     * var getter = _.constant(object);
     *
     * getter() === object;
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * This method returns the first argument provided to it.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'user': 'fred' };
     *
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Creates a function that performs a deep comparison between a given object
     * and `source`, returning `true` if the given object has equivalent property
     * values, else `false`.
     *
     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
     * numbers, `Object` objects, regexes, and strings. Objects are compared by
     * their own, not inherited, enumerable properties. For comparing a single
     * own or inherited property value see `_.matchesProperty`.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {Object} source The object of property values to match.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': true },
     *   { 'user': 'fred',   'age': 40, 'active': false }
     * ];
     *
     * _.filter(users, _.matches({ 'age': 40, 'active': false }));
     * // => [{ 'user': 'fred', 'age': 40, 'active': false }]
     */
    function matches(source) {
      return baseMatches(baseClone(source, true));
    }

    /**
     * Creates a function that compares the property value of `path` on a given
     * object to `value`.
     *
     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
     * numbers, `Object` objects, regexes, and strings. Objects are compared by
     * their own, not inherited, enumerable properties.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {Array|string} path The path of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var users = [
     *   { 'user': 'barney' },
     *   { 'user': 'fred' }
     * ];
     *
     * _.find(users, _.matchesProperty('user', 'fred'));
     * // => { 'user': 'fred' }
     */
    function matchesProperty(path, srcValue) {
      return baseMatchesProperty(path, baseClone(srcValue, true));
    }

    /**
     * Creates a function that invokes the method at `path` on a given object.
     * Any additional arguments are provided to the invoked method.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {Array|string} path The path of the method to invoke.
     * @param {...*} [args] The arguments to invoke the method with.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var objects = [
     *   { 'a': { 'b': { 'c': _.constant(2) } } },
     *   { 'a': { 'b': { 'c': _.constant(1) } } }
     * ];
     *
     * _.map(objects, _.method('a.b.c'));
     * // => [2, 1]
     *
     * _.invoke(_.sortBy(objects, _.method(['a', 'b', 'c'])), 'a.b.c');
     * // => [1, 2]
     */
    var method = restParam(function(path, args) {
      return function(object) {
        return invokePath(object, path, args);
      };
    });

    /**
     * The opposite of `_.method`; this method creates a function that invokes
     * the method at a given path on `object`. Any additional arguments are
     * provided to the invoked method.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {Object} object The object to query.
     * @param {...*} [args] The arguments to invoke the method with.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var array = _.times(3, _.constant),
     *     object = { 'a': array, 'b': array, 'c': array };
     *
     * _.map(['a[2]', 'c[0]'], _.methodOf(object));
     * // => [2, 0]
     *
     * _.map([['a', '2'], ['c', '0']], _.methodOf(object));
     * // => [2, 0]
     */
    var methodOf = restParam(function(object, args) {
      return function(path) {
        return invokePath(object, path, args);
      };
    });

    /**
     * Adds all own enumerable function properties of a source object to the
     * destination object. If `object` is a function then methods are added to
     * its prototype as well.
     *
     * **Note:** Use `_.runInContext` to create a pristine `lodash` function to
     * avoid conflicts caused by modifying the original.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {Function|Object} [object=lodash] The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.chain=true] Specify whether the functions added
     *  are chainable.
     * @returns {Function|Object} Returns `object`.
     * @example
     *
     * function vowels(string) {
     *   return _.filter(string, function(v) {
     *     return /[aeiou]/i.test(v);
     *   });
     * }
     *
     * _.mixin({ 'vowels': vowels });
     * _.vowels('fred');
     * // => ['e']
     *
     * _('fred').vowels().value();
     * // => ['e']
     *
     * _.mixin({ 'vowels': vowels }, { 'chain': false });
     * _('fred').vowels();
     * // => ['e']
     */
    function mixin(object, source, options) {
      if (options == null) {
        var isObj = isObject(source),
            props = isObj ? keys(source) : undefined,
            methodNames = (props && props.length) ? baseFunctions(source, props) : undefined;

        if (!(methodNames ? methodNames.length : isObj)) {
          methodNames = false;
          options = source;
          source = object;
          object = this;
        }
      }
      if (!methodNames) {
        methodNames = baseFunctions(source, keys(source));
      }
      var chain = true,
          index = -1,
          isFunc = isFunction(object),
          length = methodNames.length;

      if (options === false) {
        chain = false;
      } else if (isObject(options) && 'chain' in options) {
        chain = options.chain;
      }
      while (++index < length) {
        var methodName = methodNames[index],
            func = source[methodName];

        object[methodName] = func;
        if (isFunc) {
          object.prototype[methodName] = (function(func) {
            return function() {
              var chainAll = this.__chain__;
              if (chain || chainAll) {
                var result = object(this.__wrapped__),
                    actions = result.__actions__ = arrayCopy(this.__actions__);

                actions.push({ 'func': func, 'args': arguments, 'thisArg': object });
                result.__chain__ = chainAll;
                return result;
              }
              return func.apply(object, arrayPush([this.value()], arguments));
            };
          }(func));
        }
      }
      return object;
    }

    /**
     * Reverts the `_` variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      root._ = oldDash;
      return this;
    }

    /**
     * A no-operation function that returns `undefined` regardless of the
     * arguments it receives.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @example
     *
     * var object = { 'user': 'fred' };
     *
     * _.noop(object) === undefined;
     * // => true
     */
    function noop() {
      // No operation performed.
    }

    /**
     * Creates a function that returns the property value at `path` on a
     * given object.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var objects = [
     *   { 'a': { 'b': { 'c': 2 } } },
     *   { 'a': { 'b': { 'c': 1 } } }
     * ];
     *
     * _.map(objects, _.property('a.b.c'));
     * // => [2, 1]
     *
     * _.pluck(_.sortBy(objects, _.property(['a', 'b', 'c'])), 'a.b.c');
     * // => [1, 2]
     */
    function property(path) {
      return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
    }

    /**
     * The opposite of `_.property`; this method creates a function that returns
     * the property value at a given path on `object`.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {Object} object The object to query.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var array = [0, 1, 2],
     *     object = { 'a': array, 'b': array, 'c': array };
     *
     * _.map(['a[2]', 'c[0]'], _.propertyOf(object));
     * // => [2, 0]
     *
     * _.map([['a', '2'], ['c', '0']], _.propertyOf(object));
     * // => [2, 0]
     */
    function propertyOf(object) {
      return function(path) {
        return baseGet(object, toPath(path), path + '');
      };
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to, but not including, `end`. If `end` is not specified it is
     * set to `start` with `start` then set to `0`. If `end` is less than `start`
     * a zero-length range is created unless a negative `step` is specified.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns the new array of numbers.
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    function range(start, end, step) {
      if (step && isIterateeCall(start, end, step)) {
        end = step = undefined;
      }
      start = +start || 0;
      step = step == null ? 1 : (+step || 0);

      if (end == null) {
        end = start;
        start = 0;
      } else {
        end = +end || 0;
      }
      // Use `Array(length)` so engines like Chakra and V8 avoid slower modes.
      // See https://youtu.be/XAqIpGU8ZZk#t=17m25s for more details.
      var index = -1,
          length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Invokes the iteratee function `n` times, returning an array of the results
     * of each invocation. The `iteratee` is bound to `thisArg` and invoked with
     * one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {Array} Returns the array of results.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6, false));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) {
     *   mage.castSpell(n);
     * });
     * // => invokes `mage.castSpell(n)` three times with `n` of `0`, `1`, and `2`
     *
     * _.times(3, function(n) {
     *   this.cast(n);
     * }, mage);
     * // => also invokes `mage.castSpell(n)` three times
     */
    function times(n, iteratee, thisArg) {
      n = nativeFloor(n);

      // Exit early to avoid a JSC JIT bug in Safari 8
      // where `Array(0)` is treated as `Array(1)`.
      if (n < 1 || !nativeIsFinite(n)) {
        return [];
      }
      var index = -1,
          result = Array(nativeMin(n, MAX_ARRAY_LENGTH));

      iteratee = bindCallback(iteratee, thisArg, 1);
      while (++index < n) {
        if (index < MAX_ARRAY_LENGTH) {
          result[index] = iteratee(index);
        } else {
          iteratee(index);
        }
      }
      return result;
    }

    /**
     * Generates a unique ID. If `prefix` is provided the ID is appended to it.
     *
     * @static
     * @memberOf _
     * @category Utility
     * @param {string} [prefix] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return baseToString(prefix) + id;
    }

    /*------------------------------------------------------------------------*/

    /**
     * Adds two numbers.
     *
     * @static
     * @memberOf _
     * @category Math
     * @param {number} augend The first number to add.
     * @param {number} addend The second number to add.
     * @returns {number} Returns the sum.
     * @example
     *
     * _.add(6, 4);
     * // => 10
     */
    function add(augend, addend) {
      return (+augend || 0) + (+addend || 0);
    }

    /**
     * Calculates `n` rounded up to `precision`.
     *
     * @static
     * @memberOf _
     * @category Math
     * @param {number} n The number to round up.
     * @param {number} [precision=0] The precision to round up to.
     * @returns {number} Returns the rounded up number.
     * @example
     *
     * _.ceil(4.006);
     * // => 5
     *
     * _.ceil(6.004, 2);
     * // => 6.01
     *
     * _.ceil(6040, -2);
     * // => 6100
     */
    var ceil = createRound('ceil');

    /**
     * Calculates `n` rounded down to `precision`.
     *
     * @static
     * @memberOf _
     * @category Math
     * @param {number} n The number to round down.
     * @param {number} [precision=0] The precision to round down to.
     * @returns {number} Returns the rounded down number.
     * @example
     *
     * _.floor(4.006);
     * // => 4
     *
     * _.floor(0.046, 2);
     * // => 0.04
     *
     * _.floor(4060, -2);
     * // => 4000
     */
    var floor = createRound('floor');

    /**
     * Gets the maximum value of `collection`. If `collection` is empty or falsey
     * `-Infinity` is returned. If an iteratee function is provided it is invoked
     * for each value in `collection` to generate the criterion by which the value
     * is ranked. The `iteratee` is bound to `thisArg` and invoked with three
     * arguments: (value, index, collection).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Math
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [iteratee] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * _.max([]);
     * // => -Infinity
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36 },
     *   { 'user': 'fred',   'age': 40 }
     * ];
     *
     * _.max(users, function(chr) {
     *   return chr.age;
     * });
     * // => { 'user': 'fred', 'age': 40 }
     *
     * // using the `_.property` callback shorthand
     * _.max(users, 'age');
     * // => { 'user': 'fred', 'age': 40 }
     */
    var max = createExtremum(gt, NEGATIVE_INFINITY);

    /**
     * Gets the minimum value of `collection`. If `collection` is empty or falsey
     * `Infinity` is returned. If an iteratee function is provided it is invoked
     * for each value in `collection` to generate the criterion by which the value
     * is ranked. The `iteratee` is bound to `thisArg` and invoked with three
     * arguments: (value, index, collection).
     *
     * If a property name is provided for `iteratee` the created `_.property`
     * style callback returns the property value of the given element.
     *
     * If a value is also provided for `thisArg` the created `_.matchesProperty`
     * style callback returns `true` for elements that have a matching property
     * value, else `false`.
     *
     * If an object is provided for `iteratee` the created `_.matches` style
     * callback returns `true` for elements that have the properties of the given
     * object, else `false`.
     *
     * @static
     * @memberOf _
     * @category Math
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [iteratee] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * _.min([]);
     * // => Infinity
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36 },
     *   { 'user': 'fred',   'age': 40 }
     * ];
     *
     * _.min(users, function(chr) {
     *   return chr.age;
     * });
     * // => { 'user': 'barney', 'age': 36 }
     *
     * // using the `_.property` callback shorthand
     * _.min(users, 'age');
     * // => { 'user': 'barney', 'age': 36 }
     */
    var min = createExtremum(lt, POSITIVE_INFINITY);

    /**
     * Calculates `n` rounded to `precision`.
     *
     * @static
     * @memberOf _
     * @category Math
     * @param {number} n The number to round.
     * @param {number} [precision=0] The precision to round to.
     * @returns {number} Returns the rounded number.
     * @example
     *
     * _.round(4.006);
     * // => 4
     *
     * _.round(4.006, 2);
     * // => 4.01
     *
     * _.round(4060, -2);
     * // => 4100
     */
    var round = createRound('round');

    /**
     * Gets the sum of the values in `collection`.
     *
     * @static
     * @memberOf _
     * @category Math
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [iteratee] The function invoked per iteration.
     * @param {*} [thisArg] The `this` binding of `iteratee`.
     * @returns {number} Returns the sum.
     * @example
     *
     * _.sum([4, 6]);
     * // => 10
     *
     * _.sum({ 'a': 4, 'b': 6 });
     * // => 10
     *
     * var objects = [
     *   { 'n': 4 },
     *   { 'n': 6 }
     * ];
     *
     * _.sum(objects, function(object) {
     *   return object.n;
     * });
     * // => 10
     *
     * // using the `_.property` callback shorthand
     * _.sum(objects, 'n');
     * // => 10
     */
    function sum(collection, iteratee, thisArg) {
      if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
        iteratee = undefined;
      }
      iteratee = getCallback(iteratee, thisArg, 3);
      return iteratee.length == 1
        ? arraySum(isArray(collection) ? collection : toIterable(collection), iteratee)
        : baseSum(collection, iteratee);
    }

    /*------------------------------------------------------------------------*/

    // Ensure wrappers are instances of `baseLodash`.
    lodash.prototype = baseLodash.prototype;

    LodashWrapper.prototype = baseCreate(baseLodash.prototype);
    LodashWrapper.prototype.constructor = LodashWrapper;

    LazyWrapper.prototype = baseCreate(baseLodash.prototype);
    LazyWrapper.prototype.constructor = LazyWrapper;

    // Add functions to the `Map` cache.
    MapCache.prototype['delete'] = mapDelete;
    MapCache.prototype.get = mapGet;
    MapCache.prototype.has = mapHas;
    MapCache.prototype.set = mapSet;

    // Add functions to the `Set` cache.
    SetCache.prototype.push = cachePush;

    // Assign cache to `_.memoize`.
    memoize.Cache = MapCache;

    // Add functions that return wrapped values when chaining.
    lodash.after = after;
    lodash.ary = ary;
    lodash.assign = assign;
    lodash.at = at;
    lodash.before = before;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.callback = callback;
    lodash.chain = chain;
    lodash.chunk = chunk;
    lodash.compact = compact;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.curry = curry;
    lodash.curryRight = curryRight;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defaultsDeep = defaultsDeep;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.drop = drop;
    lodash.dropRight = dropRight;
    lodash.dropRightWhile = dropRightWhile;
    lodash.dropWhile = dropWhile;
    lodash.fill = fill;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.flattenDeep = flattenDeep;
    lodash.flow = flow;
    lodash.flowRight = flowRight;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.indexBy = indexBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.keysIn = keysIn;
    lodash.map = map;
    lodash.mapKeys = mapKeys;
    lodash.mapValues = mapValues;
    lodash.matches = matches;
    lodash.matchesProperty = matchesProperty;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.method = method;
    lodash.methodOf = methodOf;
    lodash.mixin = mixin;
    lodash.modArgs = modArgs;
    lodash.negate = negate;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.partition = partition;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.property = property;
    lodash.propertyOf = propertyOf;
    lodash.pull = pull;
    lodash.pullAt = pullAt;
    lodash.range = range;
    lodash.rearg = rearg;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.restParam = restParam;
    lodash.set = set;
    lodash.shuffle = shuffle;
    lodash.slice = slice;
    lodash.sortBy = sortBy;
    lodash.sortByAll = sortByAll;
    lodash.sortByOrder = sortByOrder;
    lodash.spread = spread;
    lodash.take = take;
    lodash.takeRight = takeRight;
    lodash.takeRightWhile = takeRightWhile;
    lodash.takeWhile = takeWhile;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.thru = thru;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.toPlainObject = toPlainObject;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.unzip = unzip;
    lodash.unzipWith = unzipWith;
    lodash.values = values;
    lodash.valuesIn = valuesIn;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.zip = zip;
    lodash.zipObject = zipObject;
    lodash.zipWith = zipWith;

    // Add aliases.
    lodash.backflow = flowRight;
    lodash.collect = map;
    lodash.compose = flowRight;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.extend = assign;
    lodash.iteratee = callback;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;

    // Add functions to `lodash.prototype`.
    mixin(lodash, lodash);

    /*------------------------------------------------------------------------*/

    // Add functions that return unwrapped values when chaining.
    lodash.add = add;
    lodash.attempt = attempt;
    lodash.camelCase = camelCase;
    lodash.capitalize = capitalize;
    lodash.ceil = ceil;
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.deburr = deburr;
    lodash.endsWith = endsWith;
    lodash.escape = escape;
    lodash.escapeRegExp = escapeRegExp;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.findWhere = findWhere;
    lodash.first = first;
    lodash.floor = floor;
    lodash.get = get;
    lodash.gt = gt;
    lodash.gte = gte;
    lodash.has = has;
    lodash.identity = identity;
    lodash.includes = includes;
    lodash.indexOf = indexOf;
    lodash.inRange = inRange;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isError = isError;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isMatch = isMatch;
    lodash.isNaN = isNaN;
    lodash.isNative = isNative;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isTypedArray = isTypedArray;
    lodash.isUndefined = isUndefined;
    lodash.kebabCase = kebabCase;
    lodash.last = last;
    lodash.lastIndexOf = lastIndexOf;
    lodash.lt = lt;
    lodash.lte = lte;
    lodash.max = max;
    lodash.min = min;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.pad = pad;
    lodash.padLeft = padLeft;
    lodash.padRight = padRight;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.repeat = repeat;
    lodash.result = result;
    lodash.round = round;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.snakeCase = snakeCase;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.sortedLastIndex = sortedLastIndex;
    lodash.startCase = startCase;
    lodash.startsWith = startsWith;
    lodash.sum = sum;
    lodash.template = template;
    lodash.trim = trim;
    lodash.trimLeft = trimLeft;
    lodash.trimRight = trimRight;
    lodash.trunc = trunc;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;
    lodash.words = words;

    // Add aliases.
    lodash.all = every;
    lodash.any = some;
    lodash.contains = includes;
    lodash.eq = isEqual;
    lodash.detect = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.head = first;
    lodash.include = includes;
    lodash.inject = reduce;

    mixin(lodash, (function() {
      var source = {};
      baseForOwn(lodash, function(func, methodName) {
        if (!lodash.prototype[methodName]) {
          source[methodName] = func;
        }
      });
      return source;
    }()), false);

    /*------------------------------------------------------------------------*/

    // Add functions capable of returning wrapped and unwrapped values when chaining.
    lodash.sample = sample;

    lodash.prototype.sample = function(n) {
      if (!this.__chain__ && n == null) {
        return sample(this.value());
      }
      return this.thru(function(value) {
        return sample(value, n);
      });
    };

    /*------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type string
     */
    lodash.VERSION = VERSION;

    // Assign default placeholders.
    arrayEach(['bind', 'bindKey', 'curry', 'curryRight', 'partial', 'partialRight'], function(methodName) {
      lodash[methodName].placeholder = lodash;
    });

    // Add `LazyWrapper` methods for `_.drop` and `_.take` variants.
    arrayEach(['drop', 'take'], function(methodName, index) {
      LazyWrapper.prototype[methodName] = function(n) {
        var filtered = this.__filtered__;
        if (filtered && !index) {
          return new LazyWrapper(this);
        }
        n = n == null ? 1 : nativeMax(nativeFloor(n) || 0, 0);

        var result = this.clone();
        if (filtered) {
          result.__takeCount__ = nativeMin(result.__takeCount__, n);
        } else {
          result.__views__.push({ 'size': n, 'type': methodName + (result.__dir__ < 0 ? 'Right' : '') });
        }
        return result;
      };

      LazyWrapper.prototype[methodName + 'Right'] = function(n) {
        return this.reverse()[methodName](n).reverse();
      };
    });

    // Add `LazyWrapper` methods that accept an `iteratee` value.
    arrayEach(['filter', 'map', 'takeWhile'], function(methodName, index) {
      var type = index + 1,
          isFilter = type != LAZY_MAP_FLAG;

      LazyWrapper.prototype[methodName] = function(iteratee, thisArg) {
        var result = this.clone();
        result.__iteratees__.push({ 'iteratee': getCallback(iteratee, thisArg, 1), 'type': type });
        result.__filtered__ = result.__filtered__ || isFilter;
        return result;
      };
    });

    // Add `LazyWrapper` methods for `_.first` and `_.last`.
    arrayEach(['first', 'last'], function(methodName, index) {
      var takeName = 'take' + (index ? 'Right' : '');

      LazyWrapper.prototype[methodName] = function() {
        return this[takeName](1).value()[0];
      };
    });

    // Add `LazyWrapper` methods for `_.initial` and `_.rest`.
    arrayEach(['initial', 'rest'], function(methodName, index) {
      var dropName = 'drop' + (index ? '' : 'Right');

      LazyWrapper.prototype[methodName] = function() {
        return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
      };
    });

    // Add `LazyWrapper` methods for `_.pluck` and `_.where`.
    arrayEach(['pluck', 'where'], function(methodName, index) {
      var operationName = index ? 'filter' : 'map',
          createCallback = index ? baseMatches : property;

      LazyWrapper.prototype[methodName] = function(value) {
        return this[operationName](createCallback(value));
      };
    });

    LazyWrapper.prototype.compact = function() {
      return this.filter(identity);
    };

    LazyWrapper.prototype.reject = function(predicate, thisArg) {
      predicate = getCallback(predicate, thisArg, 1);
      return this.filter(function(value) {
        return !predicate(value);
      });
    };

    LazyWrapper.prototype.slice = function(start, end) {
      start = start == null ? 0 : (+start || 0);

      var result = this;
      if (result.__filtered__ && (start > 0 || end < 0)) {
        return new LazyWrapper(result);
      }
      if (start < 0) {
        result = result.takeRight(-start);
      } else if (start) {
        result = result.drop(start);
      }
      if (end !== undefined) {
        end = (+end || 0);
        result = end < 0 ? result.dropRight(-end) : result.take(end - start);
      }
      return result;
    };

    LazyWrapper.prototype.takeRightWhile = function(predicate, thisArg) {
      return this.reverse().takeWhile(predicate, thisArg).reverse();
    };

    LazyWrapper.prototype.toArray = function() {
      return this.take(POSITIVE_INFINITY);
    };

    // Add `LazyWrapper` methods to `lodash.prototype`.
    baseForOwn(LazyWrapper.prototype, function(func, methodName) {
      var checkIteratee = /^(?:filter|map|reject)|While$/.test(methodName),
          retUnwrapped = /^(?:first|last)$/.test(methodName),
          lodashFunc = lodash[retUnwrapped ? ('take' + (methodName == 'last' ? 'Right' : '')) : methodName];

      if (!lodashFunc) {
        return;
      }
      lodash.prototype[methodName] = function() {
        var args = retUnwrapped ? [1] : arguments,
            chainAll = this.__chain__,
            value = this.__wrapped__,
            isHybrid = !!this.__actions__.length,
            isLazy = value instanceof LazyWrapper,
            iteratee = args[0],
            useLazy = isLazy || isArray(value);

        if (useLazy && checkIteratee && typeof iteratee == 'function' && iteratee.length != 1) {
          // Avoid lazy use if the iteratee has a "length" value other than `1`.
          isLazy = useLazy = false;
        }
        var interceptor = function(value) {
          return (retUnwrapped && chainAll)
            ? lodashFunc(value, 1)[0]
            : lodashFunc.apply(undefined, arrayPush([value], args));
        };

        var action = { 'func': thru, 'args': [interceptor], 'thisArg': undefined },
            onlyLazy = isLazy && !isHybrid;

        if (retUnwrapped && !chainAll) {
          if (onlyLazy) {
            value = value.clone();
            value.__actions__.push(action);
            return func.call(value);
          }
          return lodashFunc.call(undefined, this.value())[0];
        }
        if (!retUnwrapped && useLazy) {
          value = onlyLazy ? value : new LazyWrapper(this);
          var result = func.apply(value, args);
          result.__actions__.push(action);
          return new LodashWrapper(result, chainAll);
        }
        return this.thru(interceptor);
      };
    });

    // Add `Array` and `String` methods to `lodash.prototype`.
    arrayEach(['join', 'pop', 'push', 'replace', 'shift', 'sort', 'splice', 'split', 'unshift'], function(methodName) {
      var func = (/^(?:replace|split)$/.test(methodName) ? stringProto : arrayProto)[methodName],
          chainName = /^(?:push|sort|unshift)$/.test(methodName) ? 'tap' : 'thru',
          retUnwrapped = /^(?:join|pop|replace|shift)$/.test(methodName);

      lodash.prototype[methodName] = function() {
        var args = arguments;
        if (retUnwrapped && !this.__chain__) {
          return func.apply(this.value(), args);
        }
        return this[chainName](function(value) {
          return func.apply(value, args);
        });
      };
    });

    // Map minified function names to their real names.
    baseForOwn(LazyWrapper.prototype, function(func, methodName) {
      var lodashFunc = lodash[methodName];
      if (lodashFunc) {
        var key = lodashFunc.name,
            names = realNames[key] || (realNames[key] = []);

        names.push({ 'name': methodName, 'func': lodashFunc });
      }
    });

    realNames[createHybridWrapper(undefined, BIND_KEY_FLAG).name] = [{ 'name': 'wrapper', 'func': undefined }];

    // Add functions to the lazy wrapper.
    LazyWrapper.prototype.clone = lazyClone;
    LazyWrapper.prototype.reverse = lazyReverse;
    LazyWrapper.prototype.value = lazyValue;

    // Add chaining functions to the `lodash` wrapper.
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.commit = wrapperCommit;
    lodash.prototype.concat = wrapperConcat;
    lodash.prototype.plant = wrapperPlant;
    lodash.prototype.reverse = wrapperReverse;
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.run = lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;

    // Add function aliases to the `lodash` wrapper.
    lodash.prototype.collect = lodash.prototype.map;
    lodash.prototype.head = lodash.prototype.first;
    lodash.prototype.select = lodash.prototype.filter;
    lodash.prototype.tail = lodash.prototype.rest;

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // Export lodash.
  var _ = runInContext();

  // Some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose lodash to the global object when an AMD loader is present to avoid
    // errors in cases where lodash is loaded by a script tag and not intended
    // as an AMD module. See http://requirejs.org/docs/errors.html#mismatch for
    // more details.
    root._ = _;

    // Define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module.
    define(function() {
      return _;
    });
  }
  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
  else if (freeExports && freeModule) {
    // Export for Node.js or RingoJS.
    if (moduleExports) {
      (freeModule.exports = _)._ = _;
    }
    // Export for Rhino with CommonJS support.
    else {
      freeExports._ = _;
    }
  }
  else {
    // Export for a browser or Rhino.
    root._ = _;
  }
}.call(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){

},{}],6:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

function typedArraySupport () {
  function Bar () {}
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    arr.constructor = Bar
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Bar && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    this.length = 0
    this.parent = undefined
  }

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
} else {
  // pre-set for values that may exist in the future
  Buffer.prototype.length = undefined
  Buffer.prototype.parent = undefined
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":7,"ieee754":8,"isarray":9}],7:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],8:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],9:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],10:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],11:[function(require,module,exports){
/**
 * Determine if an object is Buffer
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install is-buffer`
 */

module.exports = function (obj) {
  return !!(obj != null &&
    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
      (obj.constructor &&
      typeof obj.constructor.isBuffer === 'function' &&
      obj.constructor.isBuffer(obj))
    ))
}

},{}],12:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],13:[function(require,module,exports){
(function (Buffer){
var Writable = require('readable-stream').Writable
var inherits = require('inherits')

if (typeof Uint8Array === 'undefined') {
  var U8 = require('typedarray').Uint8Array
} else {
  var U8 = Uint8Array
}

function ConcatStream(opts, cb) {
  if (!(this instanceof ConcatStream)) return new ConcatStream(opts, cb)

  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (!opts) opts = {}

  var encoding = opts.encoding
  var shouldInferEncoding = false

  if (!encoding) {
    shouldInferEncoding = true
  } else {
    encoding =  String(encoding).toLowerCase()
    if (encoding === 'u8' || encoding === 'uint8') {
      encoding = 'uint8array'
    }
  }

  Writable.call(this, { objectMode: true })

  this.encoding = encoding
  this.shouldInferEncoding = shouldInferEncoding

  if (cb) this.on('finish', function () { cb(this.getBody()) })
  this.body = []
}

module.exports = ConcatStream
inherits(ConcatStream, Writable)

ConcatStream.prototype._write = function(chunk, enc, next) {
  this.body.push(chunk)
  next()
}

ConcatStream.prototype.inferEncoding = function (buff) {
  var firstBuffer = buff === undefined ? this.body[0] : buff;
  if (Buffer.isBuffer(firstBuffer)) return 'buffer'
  if (typeof Uint8Array !== 'undefined' && firstBuffer instanceof Uint8Array) return 'uint8array'
  if (Array.isArray(firstBuffer)) return 'array'
  if (typeof firstBuffer === 'string') return 'string'
  if (Object.prototype.toString.call(firstBuffer) === "[object Object]") return 'object'
  return 'buffer'
}

ConcatStream.prototype.getBody = function () {
  if (!this.encoding && this.body.length === 0) return []
  if (this.shouldInferEncoding) this.encoding = this.inferEncoding()
  if (this.encoding === 'array') return arrayConcat(this.body)
  if (this.encoding === 'string') return stringConcat(this.body)
  if (this.encoding === 'buffer') return bufferConcat(this.body)
  if (this.encoding === 'uint8array') return u8Concat(this.body)
  return this.body
}

var isArray = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]'
}

function isArrayish (arr) {
  return /Array\]$/.test(Object.prototype.toString.call(arr))
}

function stringConcat (parts) {
  var strings = []
  var needsToString = false
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i]
    if (typeof p === 'string') {
      strings.push(p)
    } else if (Buffer.isBuffer(p)) {
      strings.push(p)
    } else {
      strings.push(Buffer(p))
    }
  }
  if (Buffer.isBuffer(parts[0])) {
    strings = Buffer.concat(strings)
    strings = strings.toString('utf8')
  } else {
    strings = strings.join('')
  }
  return strings
}

function bufferConcat (parts) {
  var bufs = []
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i]
    if (Buffer.isBuffer(p)) {
      bufs.push(p)
    } else if (typeof p === 'string' || isArrayish(p)
    || (p && typeof p.subarray === 'function')) {
      bufs.push(Buffer(p))
    } else bufs.push(Buffer(String(p)))
  }
  return Buffer.concat(bufs)
}

function arrayConcat (parts) {
  var res = []
  for (var i = 0; i < parts.length; i++) {
    res.push.apply(res, parts[i])
  }
  return res
}

function u8Concat (parts) {
  var len = 0
  for (var i = 0; i < parts.length; i++) {
    if (typeof parts[i] === 'string') {
      parts[i] = Buffer(parts[i])
    }
    len += parts[i].length
  }
  var u8 = new U8(len)
  for (var i = 0, offset = 0; i < parts.length; i++) {
    var part = parts[i]
    for (var j = 0; j < part.length; j++) {
      u8[offset++] = part[j]
    }
  }
  return u8
}

}).call(this,require("buffer").Buffer)
},{"buffer":6,"inherits":14,"readable-stream":25,"typedarray":26}],14:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],15:[function(require,module,exports){
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}
/*</replacement>*/


module.exports = Duplex;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/



/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method])
    Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex))
    return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false)
    this.readable = false;

  if (options && options.writable === false)
    this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false)
    this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended)
    return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  processNextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

},{"./_stream_readable":17,"./_stream_writable":19,"core-util-is":20,"inherits":14,"process-nextick-args":22}],16:[function(require,module,exports){
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough))
    return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function(chunk, encoding, cb) {
  cb(null, chunk);
};

},{"./_stream_transform":18,"core-util-is":20,"inherits":14}],17:[function(require,module,exports){
(function (process){
'use strict';

module.exports = Readable;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/


/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/


/*<replacement>*/
var Buffer = require('buffer').Buffer;
/*</replacement>*/

Readable.ReadableState = ReadableState;

var EE = require('events');

/*<replacement>*/
var EElistenerCount = function(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/



/*<replacement>*/
var Stream;
(function (){try{
  Stream = require('st' + 'ream');
}catch(_){}finally{
  if (!Stream)
    Stream = require('events').EventEmitter;
}}())
/*</replacement>*/

var Buffer = require('buffer').Buffer;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/



/*<replacement>*/
var debugUtil = require('util');
var debug;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var StringDecoder;

util.inherits(Readable, Stream);

var Duplex;
function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex)
    this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.buffer = [];
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder)
      StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

var Duplex;
function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable))
    return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options && typeof options.read === 'function')
    this._read = options.read;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function(chunk, encoding) {
  var state = this._readableState;

  if (!state.objectMode && typeof chunk === 'string') {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = new Buffer(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function(chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

Readable.prototype.isPaused = function() {
  return this._readableState.flowing === false;
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var e = new Error('stream.unshift() after end event');
      stream.emit('error', e);
    } else {
      if (state.decoder && !addToFront && !encoding)
        chunk = state.decoder.write(chunk);

      if (!addToFront)
        state.reading = false;

      // if we want the data now, just emit it.
      if (state.flowing && state.length === 0 && !state.sync) {
        stream.emit('data', chunk);
        stream.read(0);
      } else {
        // update the buffer info.
        state.length += state.objectMode ? 1 : chunk.length;
        if (addToFront)
          state.buffer.unshift(chunk);
        else
          state.buffer.push(chunk);

        if (state.needReadable)
          emitReadable(stream);
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}


// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended &&
         (state.needReadable ||
          state.length < state.highWaterMark ||
          state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function(enc) {
  if (!StringDecoder)
    StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

function howMuchToRead(n, state) {
  if (state.length === 0 && state.ended)
    return 0;

  if (state.objectMode)
    return n === 0 ? 0 : 1;

  if (n === null || isNaN(n)) {
    // only flow one buffer at a time
    if (state.flowing && state.buffer.length)
      return state.buffer[0].length;
    else
      return state.length;
  }

  if (n <= 0)
    return 0;

  // If we're asking for more than the target buffer level,
  // then raise the water mark.  Bump up to the next highest
  // power of 2, to prevent increasing it excessively in tiny
  // amounts.
  if (n > state.highWaterMark)
    state.highWaterMark = computeNewHighWaterMark(n);

  // don't have that much.  return null, unless we've ended.
  if (n > state.length) {
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    } else {
      return state.length;
    }
  }

  return n;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function(n) {
  debug('read', n);
  var state = this._readableState;
  var nOrig = n;

  if (typeof n !== 'number' || n > 0)
    state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 &&
      state.needReadable &&
      (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended)
      endReadable(this);
    else
      emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0)
      endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  }

  if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0)
      state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
  }

  // If _read pushed data synchronously, then `reading` will be false,
  // and we need to re-evaluate how much data we can return to the user.
  if (doRead && !state.reading)
    n = howMuchToRead(nOrig, state);

  var ret;
  if (n > 0)
    ret = fromList(n, state);
  else
    ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  }

  state.length -= n;

  // If we have nothing in the buffer, then we want to know
  // as soon as we *do* get something into the buffer.
  if (state.length === 0 && !state.ended)
    state.needReadable = true;

  // If we tried to read() past the EOF, then emit end on the next tick.
  if (nOrig !== n && state.ended && state.length === 0)
    endReadable(this);

  if (ret !== null)
    this.emit('data', ret);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!(Buffer.isBuffer(chunk)) &&
      typeof chunk !== 'string' &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}


function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync)
      processNextTick(emitReadable_, stream);
    else
      emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}


// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    processNextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended &&
         state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;
    else
      len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function(n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function(dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
              dest !== process.stdout &&
              dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted)
    processNextTick(endFn);
  else
    src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    debug('onunpipe');
    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain &&
        (!dest._writableState || dest._writableState.needDrain))
      ondrain();
  }

  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    if (false === ret) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      if (state.pipesCount === 1 &&
          state.pipes[0] === dest &&
          src.listenerCount('data') === 1 &&
          !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0)
      dest.emit('error', er);
  }
  // This is a brutally ugly hack to make sure that our error handler
  // is attached before any userland ones.  NEVER DO THIS.
  if (!dest._events || !dest._events.error)
    dest.on('error', onerror);
  else if (isArray(dest._events.error))
    dest._events.error.unshift(onerror);
  else
    dest._events.error = [onerror, dest._events.error];


  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain)
      state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}


Readable.prototype.unpipe = function(dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0)
    return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes)
      return this;

    if (!dest)
      dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest)
      dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++)
      dests[i].emit('unpipe', this);
    return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1)
    return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1)
    state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function(ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  // If listening to data, and it has not explicitly been paused,
  // then call resume to start the flow of data on the next tick.
  if (ev === 'data' && false !== this._readableState.flowing) {
    this.resume();
  }

  if (ev === 'readable' && this.readable) {
    var state = this._readableState;
    if (!state.readableListening) {
      state.readableListening = true;
      state.emittedReadable = false;
      state.needReadable = true;
      if (!state.reading) {
        processNextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function() {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    processNextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading)
    stream.read(0);
}

Readable.prototype.pause = function() {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  if (state.flowing) {
    do {
      var chunk = stream.read();
    } while (null !== chunk && state.flowing);
  }
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function(stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function() {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length)
        self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function(chunk) {
    debug('wrapped data');
    if (state.decoder)
      chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined))
      return;
    else if (!state.objectMode && (!chunk || !chunk.length))
      return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function(method) { return function() {
        return stream[method].apply(stream, arguments);
      }; }(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function(ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function(n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};


// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
function fromList(n, state) {
  var list = state.buffer;
  var length = state.length;
  var stringMode = !!state.decoder;
  var objectMode = !!state.objectMode;
  var ret;

  // nothing in the list, definitely empty.
  if (list.length === 0)
    return null;

  if (length === 0)
    ret = null;
  else if (objectMode)
    ret = list.shift();
  else if (!n || n >= length) {
    // read it all, truncate the array.
    if (stringMode)
      ret = list.join('');
    else if (list.length === 1)
      ret = list[0];
    else
      ret = Buffer.concat(list, length);
    list.length = 0;
  } else {
    // read just some of it.
    if (n < list[0].length) {
      // just take a part of the first list item.
      // slice is the same for buffers and strings.
      var buf = list[0];
      ret = buf.slice(0, n);
      list[0] = buf.slice(n);
    } else if (n === list[0].length) {
      // first list is a perfect match
      ret = list.shift();
    } else {
      // complex case.
      // we have enough to cover it, but it spans past the first buffer.
      if (stringMode)
        ret = '';
      else
        ret = new Buffer(n);

      var c = 0;
      for (var i = 0, l = list.length; i < l && c < n; i++) {
        var buf = list[0];
        var cpy = Math.min(n - c, buf.length);

        if (stringMode)
          ret += buf.slice(0, cpy);
        else
          buf.copy(ret, c, 0, cpy);

        if (cpy < buf.length)
          list[0] = buf.slice(cpy);
        else
          list.shift();

        c += cpy;
      }
    }
  }

  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0)
    throw new Error('endReadable called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    processNextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf (xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

}).call(this,require('_process'))
},{"./_stream_duplex":15,"_process":12,"buffer":6,"core-util-is":20,"events":10,"inherits":14,"isarray":21,"process-nextick-args":22,"string_decoder/":23,"util":5}],18:[function(require,module,exports){
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);


function TransformState(stream) {
  this.afterTransform = function(er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb)
    return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined)
    stream.push(data);

  if (cb)
    cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}


function Transform(options) {
  if (!(this instanceof Transform))
    return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function')
      this._transform = options.transform;

    if (typeof options.flush === 'function')
      this._flush = options.flush;
  }

  this.once('prefinish', function() {
    if (typeof this._flush === 'function')
      this._flush(function(er) {
        done(stream, er);
      });
    else
      done(stream);
  });
}

Transform.prototype.push = function(chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function(chunk, encoding, cb) {
  throw new Error('not implemented');
};

Transform.prototype._write = function(chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform ||
        rs.needReadable ||
        rs.length < rs.highWaterMark)
      this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function(n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};


function done(stream, er) {
  if (er)
    return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length)
    throw new Error('calling transform done when ws.length != 0');

  if (ts.transforming)
    throw new Error('calling transform done when still transforming');

  return stream.push(null);
}

},{"./_stream_duplex":15,"core-util-is":20,"inherits":14}],19:[function(require,module,exports){
// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

module.exports = Writable;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/


/*<replacement>*/
var Buffer = require('buffer').Buffer;
/*</replacement>*/

Writable.WritableState = WritableState;


/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/


/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/



/*<replacement>*/
var Stream;
(function (){try{
  Stream = require('st' + 'ream');
}catch(_){}finally{
  if (!Stream)
    Stream = require('events').EventEmitter;
}}())
/*</replacement>*/

var Buffer = require('buffer').Buffer;

util.inherits(Writable, Stream);

function nop() {}

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

var Duplex;
function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex)
    this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function(er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;
}

WritableState.prototype.getBuffer = function writableStateGetBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function (){try {
Object.defineProperty(WritableState.prototype, 'buffer', {
  get: internalUtil.deprecate(function() {
    return this.getBuffer();
  }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' +
     'instead.')
});
}catch(_){}}());


var Duplex;
function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Duplex))
    return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function')
      this._write = options.write;

    if (typeof options.writev === 'function')
      this._writev = options.writev;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function() {
  this.emit('error', new Error('Cannot pipe. Not readable.'));
};


function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  processNextTick(cb, er);
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;

  if (!(Buffer.isBuffer(chunk)) &&
      typeof chunk !== 'string' &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode) {
    var er = new TypeError('Invalid non-string/buffer chunk');
    stream.emit('error', er);
    processNextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function(chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (Buffer.isBuffer(chunk))
    encoding = 'buffer';
  else if (!encoding)
    encoding = state.defaultEncoding;

  if (typeof cb !== 'function')
    cb = nop;

  if (state.ended)
    writeAfterEnd(this, cb);
  else if (validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function() {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function() {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing &&
        !state.corked &&
        !state.finished &&
        !state.bufferProcessing &&
        state.bufferedRequest)
      clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string')
    encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64',
'ucs2', 'ucs-2','utf16le', 'utf-16le', 'raw']
.indexOf((encoding + '').toLowerCase()) > -1))
    throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode &&
      state.decodeStrings !== false &&
      typeof chunk === 'string') {
    chunk = new Buffer(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);

  if (Buffer.isBuffer(chunk))
    encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret)
    state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev)
    stream._writev(chunk, state.onwrite);
  else
    stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync)
    processNextTick(cb, er);
  else
    cb(er);

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er)
    onwriteError(stream, state, sync, er, cb);
  else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished &&
        !state.corked &&
        !state.bufferProcessing &&
        state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      processNextTick(afterWrite, stream, state, finished, cb);
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished)
    onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}


// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var buffer = [];
    var cbs = [];
    while (entry) {
      cbs.push(entry.callback);
      buffer.push(entry);
      entry = entry.next;
    }

    // count the one we are adding, as well.
    // TODO(isaacs) clean this up
    state.pendingcb++;
    state.lastBufferedRequest = null;
    doWrite(stream, state, true, state.length, buffer, '', function(err) {
      for (var i = 0; i < cbs.length; i++) {
        state.pendingcb--;
        cbs[i](err);
      }
    });

    // Clear buffer
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null)
      state.lastBufferedRequest = null;
  }
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function(chunk, encoding, cb) {
  cb(new Error('not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function(chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined)
    this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished)
    endWritable(this, state, cb);
};


function needFinish(state) {
  return (state.ending &&
          state.length === 0 &&
          state.bufferedRequest === null &&
          !state.finished &&
          !state.writing);
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else {
      prefinish(stream, state);
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished)
      processNextTick(cb);
    else
      stream.once('finish', cb);
  }
  state.ended = true;
}

},{"./_stream_duplex":15,"buffer":6,"core-util-is":20,"events":10,"inherits":14,"process-nextick-args":22,"util-deprecate":24}],20:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../../../../../browserify/node_modules/insert-module-globals/node_modules/is-buffer/index.js")})
},{"../../../../../../browserify/node_modules/insert-module-globals/node_modules/is-buffer/index.js":11}],21:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],22:[function(require,module,exports){
(function (process){
'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = nextTick;
} else {
  module.exports = process.nextTick;
}

function nextTick(fn) {
  var args = new Array(arguments.length - 1);
  var i = 0;
  while (i < args.length) {
    args[i++] = arguments[i];
  }
  process.nextTick(function afterTick() {
    fn.apply(null, args);
  });
}

}).call(this,require('_process'))
},{"_process":12}],23:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = require('buffer').Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
};


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}

},{"buffer":6}],24:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],25:[function(require,module,exports){
var Stream = (function (){
  try {
    return require('st' + 'ream'); // hack to fix a circular dependency issue when used with browserify
  } catch(_){}
}());
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = Stream || exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":15,"./lib/_stream_passthrough.js":16,"./lib/_stream_readable.js":17,"./lib/_stream_transform.js":18,"./lib/_stream_writable.js":19}],26:[function(require,module,exports){
var undefined = (void 0); // Paranoia

// Beyond this value, index getters/setters (i.e. array[0], array[1]) are so slow to
// create, and consume so much memory, that the browser appears frozen.
var MAX_ARRAY_LENGTH = 1e5;

// Approximations of internal ECMAScript conversion functions
var ECMAScript = (function() {
  // Stash a copy in case other scripts modify these
  var opts = Object.prototype.toString,
      ophop = Object.prototype.hasOwnProperty;

  return {
    // Class returns internal [[Class]] property, used to avoid cross-frame instanceof issues:
    Class: function(v) { return opts.call(v).replace(/^\[object *|\]$/g, ''); },
    HasProperty: function(o, p) { return p in o; },
    HasOwnProperty: function(o, p) { return ophop.call(o, p); },
    IsCallable: function(o) { return typeof o === 'function'; },
    ToInt32: function(v) { return v >> 0; },
    ToUint32: function(v) { return v >>> 0; }
  };
}());

// Snapshot intrinsics
var LN2 = Math.LN2,
    abs = Math.abs,
    floor = Math.floor,
    log = Math.log,
    min = Math.min,
    pow = Math.pow,
    round = Math.round;

// ES5: lock down object properties
function configureProperties(obj) {
  if (getOwnPropNames && defineProp) {
    var props = getOwnPropNames(obj), i;
    for (i = 0; i < props.length; i += 1) {
      defineProp(obj, props[i], {
        value: obj[props[i]],
        writable: false,
        enumerable: false,
        configurable: false
      });
    }
  }
}

// emulate ES5 getter/setter API using legacy APIs
// http://blogs.msdn.com/b/ie/archive/2010/09/07/transitioning-existing-code-to-the-es5-getter-setter-apis.aspx
// (second clause tests for Object.defineProperty() in IE<9 that only supports extending DOM prototypes, but
// note that IE<9 does not support __defineGetter__ or __defineSetter__ so it just renders the method harmless)
var defineProp
if (Object.defineProperty && (function() {
      try {
        Object.defineProperty({}, 'x', {});
        return true;
      } catch (e) {
        return false;
      }
    })()) {
  defineProp = Object.defineProperty;
} else {
  defineProp = function(o, p, desc) {
    if (!o === Object(o)) throw new TypeError("Object.defineProperty called on non-object");
    if (ECMAScript.HasProperty(desc, 'get') && Object.prototype.__defineGetter__) { Object.prototype.__defineGetter__.call(o, p, desc.get); }
    if (ECMAScript.HasProperty(desc, 'set') && Object.prototype.__defineSetter__) { Object.prototype.__defineSetter__.call(o, p, desc.set); }
    if (ECMAScript.HasProperty(desc, 'value')) { o[p] = desc.value; }
    return o;
  };
}

var getOwnPropNames = Object.getOwnPropertyNames || function (o) {
  if (o !== Object(o)) throw new TypeError("Object.getOwnPropertyNames called on non-object");
  var props = [], p;
  for (p in o) {
    if (ECMAScript.HasOwnProperty(o, p)) {
      props.push(p);
    }
  }
  return props;
};

// ES5: Make obj[index] an alias for obj._getter(index)/obj._setter(index, value)
// for index in 0 ... obj.length
function makeArrayAccessors(obj) {
  if (!defineProp) { return; }

  if (obj.length > MAX_ARRAY_LENGTH) throw new RangeError("Array too large for polyfill");

  function makeArrayAccessor(index) {
    defineProp(obj, index, {
      'get': function() { return obj._getter(index); },
      'set': function(v) { obj._setter(index, v); },
      enumerable: true,
      configurable: false
    });
  }

  var i;
  for (i = 0; i < obj.length; i += 1) {
    makeArrayAccessor(i);
  }
}

// Internal conversion functions:
//    pack<Type>()   - take a number (interpreted as Type), output a byte array
//    unpack<Type>() - take a byte array, output a Type-like number

function as_signed(value, bits) { var s = 32 - bits; return (value << s) >> s; }
function as_unsigned(value, bits) { var s = 32 - bits; return (value << s) >>> s; }

function packI8(n) { return [n & 0xff]; }
function unpackI8(bytes) { return as_signed(bytes[0], 8); }

function packU8(n) { return [n & 0xff]; }
function unpackU8(bytes) { return as_unsigned(bytes[0], 8); }

function packU8Clamped(n) { n = round(Number(n)); return [n < 0 ? 0 : n > 0xff ? 0xff : n & 0xff]; }

function packI16(n) { return [(n >> 8) & 0xff, n & 0xff]; }
function unpackI16(bytes) { return as_signed(bytes[0] << 8 | bytes[1], 16); }

function packU16(n) { return [(n >> 8) & 0xff, n & 0xff]; }
function unpackU16(bytes) { return as_unsigned(bytes[0] << 8 | bytes[1], 16); }

function packI32(n) { return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]; }
function unpackI32(bytes) { return as_signed(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32); }

function packU32(n) { return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]; }
function unpackU32(bytes) { return as_unsigned(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32); }

function packIEEE754(v, ebits, fbits) {

  var bias = (1 << (ebits - 1)) - 1,
      s, e, f, ln,
      i, bits, str, bytes;

  function roundToEven(n) {
    var w = floor(n), f = n - w;
    if (f < 0.5)
      return w;
    if (f > 0.5)
      return w + 1;
    return w % 2 ? w + 1 : w;
  }

  // Compute sign, exponent, fraction
  if (v !== v) {
    // NaN
    // http://dev.w3.org/2006/webapi/WebIDL/#es-type-mapping
    e = (1 << ebits) - 1; f = pow(2, fbits - 1); s = 0;
  } else if (v === Infinity || v === -Infinity) {
    e = (1 << ebits) - 1; f = 0; s = (v < 0) ? 1 : 0;
  } else if (v === 0) {
    e = 0; f = 0; s = (1 / v === -Infinity) ? 1 : 0;
  } else {
    s = v < 0;
    v = abs(v);

    if (v >= pow(2, 1 - bias)) {
      e = min(floor(log(v) / LN2), 1023);
      f = roundToEven(v / pow(2, e) * pow(2, fbits));
      if (f / pow(2, fbits) >= 2) {
        e = e + 1;
        f = 1;
      }
      if (e > bias) {
        // Overflow
        e = (1 << ebits) - 1;
        f = 0;
      } else {
        // Normalized
        e = e + bias;
        f = f - pow(2, fbits);
      }
    } else {
      // Denormalized
      e = 0;
      f = roundToEven(v / pow(2, 1 - bias - fbits));
    }
  }

  // Pack sign, exponent, fraction
  bits = [];
  for (i = fbits; i; i -= 1) { bits.push(f % 2 ? 1 : 0); f = floor(f / 2); }
  for (i = ebits; i; i -= 1) { bits.push(e % 2 ? 1 : 0); e = floor(e / 2); }
  bits.push(s ? 1 : 0);
  bits.reverse();
  str = bits.join('');

  // Bits to bytes
  bytes = [];
  while (str.length) {
    bytes.push(parseInt(str.substring(0, 8), 2));
    str = str.substring(8);
  }
  return bytes;
}

function unpackIEEE754(bytes, ebits, fbits) {

  // Bytes to bits
  var bits = [], i, j, b, str,
      bias, s, e, f;

  for (i = bytes.length; i; i -= 1) {
    b = bytes[i - 1];
    for (j = 8; j; j -= 1) {
      bits.push(b % 2 ? 1 : 0); b = b >> 1;
    }
  }
  bits.reverse();
  str = bits.join('');

  // Unpack sign, exponent, fraction
  bias = (1 << (ebits - 1)) - 1;
  s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
  e = parseInt(str.substring(1, 1 + ebits), 2);
  f = parseInt(str.substring(1 + ebits), 2);

  // Produce number
  if (e === (1 << ebits) - 1) {
    return f !== 0 ? NaN : s * Infinity;
  } else if (e > 0) {
    // Normalized
    return s * pow(2, e - bias) * (1 + f / pow(2, fbits));
  } else if (f !== 0) {
    // Denormalized
    return s * pow(2, -(bias - 1)) * (f / pow(2, fbits));
  } else {
    return s < 0 ? -0 : 0;
  }
}

function unpackF64(b) { return unpackIEEE754(b, 11, 52); }
function packF64(v) { return packIEEE754(v, 11, 52); }
function unpackF32(b) { return unpackIEEE754(b, 8, 23); }
function packF32(v) { return packIEEE754(v, 8, 23); }


//
// 3 The ArrayBuffer Type
//

(function() {

  /** @constructor */
  var ArrayBuffer = function ArrayBuffer(length) {
    length = ECMAScript.ToInt32(length);
    if (length < 0) throw new RangeError('ArrayBuffer size is not a small enough positive integer');

    this.byteLength = length;
    this._bytes = [];
    this._bytes.length = length;

    var i;
    for (i = 0; i < this.byteLength; i += 1) {
      this._bytes[i] = 0;
    }

    configureProperties(this);
  };

  exports.ArrayBuffer = exports.ArrayBuffer || ArrayBuffer;

  //
  // 4 The ArrayBufferView Type
  //

  // NOTE: this constructor is not exported
  /** @constructor */
  var ArrayBufferView = function ArrayBufferView() {
    //this.buffer = null;
    //this.byteOffset = 0;
    //this.byteLength = 0;
  };

  //
  // 5 The Typed Array View Types
  //

  function makeConstructor(bytesPerElement, pack, unpack) {
    // Each TypedArray type requires a distinct constructor instance with
    // identical logic, which this produces.

    var ctor;
    ctor = function(buffer, byteOffset, length) {
      var array, sequence, i, s;

      if (!arguments.length || typeof arguments[0] === 'number') {
        // Constructor(unsigned long length)
        this.length = ECMAScript.ToInt32(arguments[0]);
        if (length < 0) throw new RangeError('ArrayBufferView size is not a small enough positive integer');

        this.byteLength = this.length * this.BYTES_PER_ELEMENT;
        this.buffer = new ArrayBuffer(this.byteLength);
        this.byteOffset = 0;
      } else if (typeof arguments[0] === 'object' && arguments[0].constructor === ctor) {
        // Constructor(TypedArray array)
        array = arguments[0];

        this.length = array.length;
        this.byteLength = this.length * this.BYTES_PER_ELEMENT;
        this.buffer = new ArrayBuffer(this.byteLength);
        this.byteOffset = 0;

        for (i = 0; i < this.length; i += 1) {
          this._setter(i, array._getter(i));
        }
      } else if (typeof arguments[0] === 'object' &&
                 !(arguments[0] instanceof ArrayBuffer || ECMAScript.Class(arguments[0]) === 'ArrayBuffer')) {
        // Constructor(sequence<type> array)
        sequence = arguments[0];

        this.length = ECMAScript.ToUint32(sequence.length);
        this.byteLength = this.length * this.BYTES_PER_ELEMENT;
        this.buffer = new ArrayBuffer(this.byteLength);
        this.byteOffset = 0;

        for (i = 0; i < this.length; i += 1) {
          s = sequence[i];
          this._setter(i, Number(s));
        }
      } else if (typeof arguments[0] === 'object' &&
                 (arguments[0] instanceof ArrayBuffer || ECMAScript.Class(arguments[0]) === 'ArrayBuffer')) {
        // Constructor(ArrayBuffer buffer,
        //             optional unsigned long byteOffset, optional unsigned long length)
        this.buffer = buffer;

        this.byteOffset = ECMAScript.ToUint32(byteOffset);
        if (this.byteOffset > this.buffer.byteLength) {
          throw new RangeError("byteOffset out of range");
        }

        if (this.byteOffset % this.BYTES_PER_ELEMENT) {
          // The given byteOffset must be a multiple of the element
          // size of the specific type, otherwise an exception is raised.
          throw new RangeError("ArrayBuffer length minus the byteOffset is not a multiple of the element size.");
        }

        if (arguments.length < 3) {
          this.byteLength = this.buffer.byteLength - this.byteOffset;

          if (this.byteLength % this.BYTES_PER_ELEMENT) {
            throw new RangeError("length of buffer minus byteOffset not a multiple of the element size");
          }
          this.length = this.byteLength / this.BYTES_PER_ELEMENT;
        } else {
          this.length = ECMAScript.ToUint32(length);
          this.byteLength = this.length * this.BYTES_PER_ELEMENT;
        }

        if ((this.byteOffset + this.byteLength) > this.buffer.byteLength) {
          throw new RangeError("byteOffset and length reference an area beyond the end of the buffer");
        }
      } else {
        throw new TypeError("Unexpected argument type(s)");
      }

      this.constructor = ctor;

      configureProperties(this);
      makeArrayAccessors(this);
    };

    ctor.prototype = new ArrayBufferView();
    ctor.prototype.BYTES_PER_ELEMENT = bytesPerElement;
    ctor.prototype._pack = pack;
    ctor.prototype._unpack = unpack;
    ctor.BYTES_PER_ELEMENT = bytesPerElement;

    // getter type (unsigned long index);
    ctor.prototype._getter = function(index) {
      if (arguments.length < 1) throw new SyntaxError("Not enough arguments");

      index = ECMAScript.ToUint32(index);
      if (index >= this.length) {
        return undefined;
      }

      var bytes = [], i, o;
      for (i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT;
           i < this.BYTES_PER_ELEMENT;
           i += 1, o += 1) {
        bytes.push(this.buffer._bytes[o]);
      }
      return this._unpack(bytes);
    };

    // NONSTANDARD: convenience alias for getter: type get(unsigned long index);
    ctor.prototype.get = ctor.prototype._getter;

    // setter void (unsigned long index, type value);
    ctor.prototype._setter = function(index, value) {
      if (arguments.length < 2) throw new SyntaxError("Not enough arguments");

      index = ECMAScript.ToUint32(index);
      if (index >= this.length) {
        return undefined;
      }

      var bytes = this._pack(value), i, o;
      for (i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT;
           i < this.BYTES_PER_ELEMENT;
           i += 1, o += 1) {
        this.buffer._bytes[o] = bytes[i];
      }
    };

    // void set(TypedArray array, optional unsigned long offset);
    // void set(sequence<type> array, optional unsigned long offset);
    ctor.prototype.set = function(index, value) {
      if (arguments.length < 1) throw new SyntaxError("Not enough arguments");
      var array, sequence, offset, len,
          i, s, d,
          byteOffset, byteLength, tmp;

      if (typeof arguments[0] === 'object' && arguments[0].constructor === this.constructor) {
        // void set(TypedArray array, optional unsigned long offset);
        array = arguments[0];
        offset = ECMAScript.ToUint32(arguments[1]);

        if (offset + array.length > this.length) {
          throw new RangeError("Offset plus length of array is out of range");
        }

        byteOffset = this.byteOffset + offset * this.BYTES_PER_ELEMENT;
        byteLength = array.length * this.BYTES_PER_ELEMENT;

        if (array.buffer === this.buffer) {
          tmp = [];
          for (i = 0, s = array.byteOffset; i < byteLength; i += 1, s += 1) {
            tmp[i] = array.buffer._bytes[s];
          }
          for (i = 0, d = byteOffset; i < byteLength; i += 1, d += 1) {
            this.buffer._bytes[d] = tmp[i];
          }
        } else {
          for (i = 0, s = array.byteOffset, d = byteOffset;
               i < byteLength; i += 1, s += 1, d += 1) {
            this.buffer._bytes[d] = array.buffer._bytes[s];
          }
        }
      } else if (typeof arguments[0] === 'object' && typeof arguments[0].length !== 'undefined') {
        // void set(sequence<type> array, optional unsigned long offset);
        sequence = arguments[0];
        len = ECMAScript.ToUint32(sequence.length);
        offset = ECMAScript.ToUint32(arguments[1]);

        if (offset + len > this.length) {
          throw new RangeError("Offset plus length of array is out of range");
        }

        for (i = 0; i < len; i += 1) {
          s = sequence[i];
          this._setter(offset + i, Number(s));
        }
      } else {
        throw new TypeError("Unexpected argument type(s)");
      }
    };

    // TypedArray subarray(long begin, optional long end);
    ctor.prototype.subarray = function(start, end) {
      function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }

      start = ECMAScript.ToInt32(start);
      end = ECMAScript.ToInt32(end);

      if (arguments.length < 1) { start = 0; }
      if (arguments.length < 2) { end = this.length; }

      if (start < 0) { start = this.length + start; }
      if (end < 0) { end = this.length + end; }

      start = clamp(start, 0, this.length);
      end = clamp(end, 0, this.length);

      var len = end - start;
      if (len < 0) {
        len = 0;
      }

      return new this.constructor(
        this.buffer, this.byteOffset + start * this.BYTES_PER_ELEMENT, len);
    };

    return ctor;
  }

  var Int8Array = makeConstructor(1, packI8, unpackI8);
  var Uint8Array = makeConstructor(1, packU8, unpackU8);
  var Uint8ClampedArray = makeConstructor(1, packU8Clamped, unpackU8);
  var Int16Array = makeConstructor(2, packI16, unpackI16);
  var Uint16Array = makeConstructor(2, packU16, unpackU16);
  var Int32Array = makeConstructor(4, packI32, unpackI32);
  var Uint32Array = makeConstructor(4, packU32, unpackU32);
  var Float32Array = makeConstructor(4, packF32, unpackF32);
  var Float64Array = makeConstructor(8, packF64, unpackF64);

  exports.Int8Array = exports.Int8Array || Int8Array;
  exports.Uint8Array = exports.Uint8Array || Uint8Array;
  exports.Uint8ClampedArray = exports.Uint8ClampedArray || Uint8ClampedArray;
  exports.Int16Array = exports.Int16Array || Int16Array;
  exports.Uint16Array = exports.Uint16Array || Uint16Array;
  exports.Int32Array = exports.Int32Array || Int32Array;
  exports.Uint32Array = exports.Uint32Array || Uint32Array;
  exports.Float32Array = exports.Float32Array || Float32Array;
  exports.Float64Array = exports.Float64Array || Float64Array;
}());

//
// 6 The DataView View Type
//

(function() {
  function r(array, index) {
    return ECMAScript.IsCallable(array.get) ? array.get(index) : array[index];
  }

  var IS_BIG_ENDIAN = (function() {
    var u16array = new(exports.Uint16Array)([0x1234]),
        u8array = new(exports.Uint8Array)(u16array.buffer);
    return r(u8array, 0) === 0x12;
  }());

  // Constructor(ArrayBuffer buffer,
  //             optional unsigned long byteOffset,
  //             optional unsigned long byteLength)
  /** @constructor */
  var DataView = function DataView(buffer, byteOffset, byteLength) {
    if (arguments.length === 0) {
      buffer = new exports.ArrayBuffer(0);
    } else if (!(buffer instanceof exports.ArrayBuffer || ECMAScript.Class(buffer) === 'ArrayBuffer')) {
      throw new TypeError("TypeError");
    }

    this.buffer = buffer || new exports.ArrayBuffer(0);

    this.byteOffset = ECMAScript.ToUint32(byteOffset);
    if (this.byteOffset > this.buffer.byteLength) {
      throw new RangeError("byteOffset out of range");
    }

    if (arguments.length < 3) {
      this.byteLength = this.buffer.byteLength - this.byteOffset;
    } else {
      this.byteLength = ECMAScript.ToUint32(byteLength);
    }

    if ((this.byteOffset + this.byteLength) > this.buffer.byteLength) {
      throw new RangeError("byteOffset and length reference an area beyond the end of the buffer");
    }

    configureProperties(this);
  };

  function makeGetter(arrayType) {
    return function(byteOffset, littleEndian) {

      byteOffset = ECMAScript.ToUint32(byteOffset);

      if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) {
        throw new RangeError("Array index out of range");
      }
      byteOffset += this.byteOffset;

      var uint8Array = new exports.Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT),
          bytes = [], i;
      for (i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) {
        bytes.push(r(uint8Array, i));
      }

      if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) {
        bytes.reverse();
      }

      return r(new arrayType(new exports.Uint8Array(bytes).buffer), 0);
    };
  }

  DataView.prototype.getUint8 = makeGetter(exports.Uint8Array);
  DataView.prototype.getInt8 = makeGetter(exports.Int8Array);
  DataView.prototype.getUint16 = makeGetter(exports.Uint16Array);
  DataView.prototype.getInt16 = makeGetter(exports.Int16Array);
  DataView.prototype.getUint32 = makeGetter(exports.Uint32Array);
  DataView.prototype.getInt32 = makeGetter(exports.Int32Array);
  DataView.prototype.getFloat32 = makeGetter(exports.Float32Array);
  DataView.prototype.getFloat64 = makeGetter(exports.Float64Array);

  function makeSetter(arrayType) {
    return function(byteOffset, value, littleEndian) {

      byteOffset = ECMAScript.ToUint32(byteOffset);
      if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) {
        throw new RangeError("Array index out of range");
      }

      // Get bytes
      var typeArray = new arrayType([value]),
          byteArray = new exports.Uint8Array(typeArray.buffer),
          bytes = [], i, byteView;

      for (i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) {
        bytes.push(r(byteArray, i));
      }

      // Flip if necessary
      if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) {
        bytes.reverse();
      }

      // Write them
      byteView = new exports.Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT);
      byteView.set(bytes);
    };
  }

  DataView.prototype.setUint8 = makeSetter(exports.Uint8Array);
  DataView.prototype.setInt8 = makeSetter(exports.Int8Array);
  DataView.prototype.setUint16 = makeSetter(exports.Uint16Array);
  DataView.prototype.setInt16 = makeSetter(exports.Int16Array);
  DataView.prototype.setUint32 = makeSetter(exports.Uint32Array);
  DataView.prototype.setInt32 = makeSetter(exports.Int32Array);
  DataView.prototype.setFloat32 = makeSetter(exports.Float32Array);
  DataView.prototype.setFloat64 = makeSetter(exports.Float64Array);

  exports.DataView = exports.DataView || DataView;

}());

},{}],27:[function(require,module,exports){
(function (global){
(function(e){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=e()}else if(typeof define==="function"&&define.amd){define([],e)}else{var t;if(typeof window!=="undefined"){t=window}else if(typeof global!=="undefined"){t=global}else if(typeof self!=="undefined"){t=self}else{t=this}t.ipfsAPI=e()}})(function(){var e,t,r;return function n(e,t,r){function i(s,o){if(!t[s]){if(!e[s]){var u=typeof require=="function"&&require;if(!o&&u)return u(s,!0);if(a)return a(s,!0);var f=new Error("Cannot find module '"+s+"'");throw f.code="MODULE_NOT_FOUND",f}var l=t[s]={exports:{}};e[s][0].call(l.exports,function(t){var r=e[s][1][t];return i(r?r:t)},l,l.exports,n,e,t,r)}return t[s].exports}var a=typeof require=="function"&&require;for(var s=0;s<r.length;s++)i(r[s]);return i}({1:[function(e,t,r){},{}],2:[function(e,t,r){var n=e("util/");var i=Array.prototype.slice;var a=Object.prototype.hasOwnProperty;var s=t.exports=c;s.AssertionError=function b(e){this.name="AssertionError";this.actual=e.actual;this.expected=e.expected;this.operator=e.operator;if(e.message){this.message=e.message;this.generatedMessage=false}else{this.message=f(this);this.generatedMessage=true}var t=e.stackStartFunction||l;if(Error.captureStackTrace){Error.captureStackTrace(this,t)}else{var r=new Error;if(r.stack){var n=r.stack;var i=t.name;var a=n.indexOf("\n"+i);if(a>=0){var s=n.indexOf("\n",a+1);n=n.substring(s+1)}this.stack=n}}};n.inherits(s.AssertionError,Error);function o(e,t){if(n.isUndefined(t)){return""+t}if(n.isNumber(t)&&!isFinite(t)){return t.toString()}if(n.isFunction(t)||n.isRegExp(t)){return t.toString()}return t}function u(e,t){if(n.isString(e)){return e.length<t?e:e.slice(0,t)}else{return e}}function f(e){return u(JSON.stringify(e.actual,o),128)+" "+e.operator+" "+u(JSON.stringify(e.expected,o),128)}function l(e,t,r,n,i){throw new s.AssertionError({message:r,actual:e,expected:t,operator:n,stackStartFunction:i})}s.fail=l;function c(e,t){if(!e)l(e,true,t,"==",s.ok)}s.ok=c;s.equal=function y(e,t,r){if(e!=t)l(e,t,r,"==",s.equal)};s.notEqual=function _(e,t,r){if(e==t){l(e,t,r,"!=",s.notEqual)}};s.deepEqual=function w(e,t,r){if(!h(e,t)){l(e,t,r,"deepEqual",s.deepEqual)}};function h(e,t){if(e===t){return true}else if(n.isBuffer(e)&&n.isBuffer(t)){if(e.length!=t.length)return false;for(var r=0;r<e.length;r++){if(e[r]!==t[r])return false}return true}else if(n.isDate(e)&&n.isDate(t)){return e.getTime()===t.getTime()}else if(n.isRegExp(e)&&n.isRegExp(t)){return e.source===t.source&&e.global===t.global&&e.multiline===t.multiline&&e.lastIndex===t.lastIndex&&e.ignoreCase===t.ignoreCase}else if(!n.isObject(e)&&!n.isObject(t)){return e==t}else{return d(e,t)}}function p(e){return Object.prototype.toString.call(e)=="[object Arguments]"}function d(e,t){if(n.isNullOrUndefined(e)||n.isNullOrUndefined(t))return false;if(e.prototype!==t.prototype)return false;if(n.isPrimitive(e)||n.isPrimitive(t)){return e===t}var r=p(e),a=p(t);if(r&&!a||!r&&a)return false;if(r){e=i.call(e);t=i.call(t);return h(e,t)}var s=m(e),o=m(t),u,f;if(s.length!=o.length)return false;s.sort();o.sort();for(f=s.length-1;f>=0;f--){if(s[f]!=o[f])return false}for(f=s.length-1;f>=0;f--){u=s[f];if(!h(e[u],t[u]))return false}return true}s.notDeepEqual=function E(e,t,r){if(h(e,t)){l(e,t,r,"notDeepEqual",s.notDeepEqual)}};s.strictEqual=function S(e,t,r){if(e!==t){l(e,t,r,"===",s.strictEqual)}};s.notStrictEqual=function x(e,t,r){if(e===t){l(e,t,r,"!==",s.notStrictEqual)}};function g(e,t){if(!e||!t){return false}if(Object.prototype.toString.call(t)=="[object RegExp]"){return t.test(e)}else if(e instanceof t){return true}else if(t.call({},e)===true){return true}return false}function v(e,t,r,i){var a;if(n.isString(r)){i=r;r=null}try{t()}catch(s){a=s}i=(r&&r.name?" ("+r.name+").":".")+(i?" "+i:".");if(e&&!a){l(a,r,"Missing expected exception"+i)}if(!e&&g(a,r)){l(a,r,"Got unwanted exception"+i)}if(e&&a&&r&&!g(a,r)||!e&&a){throw a}}s.throws=function(e,t,r){v.apply(this,[true].concat(i.call(arguments)))};s.doesNotThrow=function(e,t){v.apply(this,[false].concat(i.call(arguments)))};s.ifError=function(e){if(e){throw e}};var m=Object.keys||function(e){var t=[];for(var r in e){if(a.call(e,r))t.push(r)}return t}},{"util/":46}],3:[function(e,t,r){arguments[4][1][0].apply(r,arguments)},{dup:1}],4:[function(e,t,r){var n=e("base64-js");var i=e("ieee754");var a=e("is-array");r.Buffer=u;r.SlowBuffer=_;r.INSPECT_MAX_BYTES=50;u.poolSize=8192;var s={};u.TYPED_ARRAY_SUPPORT=function(){function e(){}try{var t=new Uint8Array(1);t.foo=function(){return 42};t.constructor=e;return t.foo()===42&&t.constructor===e&&typeof t.subarray==="function"&&t.subarray(1,1).byteLength===0}catch(r){return false}}();function o(){return u.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function u(e){if(!(this instanceof u)){if(arguments.length>1)return new u(e,arguments[1]);return new u(e)}this.length=0;this.parent=undefined;if(typeof e==="number"){return f(this,e)}if(typeof e==="string"){return l(this,e,arguments.length>1?arguments[1]:"utf8")}return c(this,e)}function f(e,t){e=b(e,t<0?0:y(t)|0);if(!u.TYPED_ARRAY_SUPPORT){for(var r=0;r<t;r++){e[r]=0}}return e}function l(e,t,r){if(typeof r!=="string"||r==="")r="utf8";var n=w(t,r)|0;e=b(e,n);e.write(t,r);return e}function c(e,t){if(u.isBuffer(t))return h(e,t);if(a(t))return p(e,t);if(t==null){throw new TypeError("must start with number, buffer, array or string")}if(typeof ArrayBuffer!=="undefined"){if(t.buffer instanceof ArrayBuffer){return d(e,t)}if(t instanceof ArrayBuffer){return g(e,t)}}if(t.length)return v(e,t);return m(e,t)}function h(e,t){var r=y(t.length)|0;e=b(e,r);t.copy(e,0,0,r);return e}function p(e,t){var r=y(t.length)|0;e=b(e,r);for(var n=0;n<r;n+=1){e[n]=t[n]&255}return e}function d(e,t){var r=y(t.length)|0;e=b(e,r);for(var n=0;n<r;n+=1){e[n]=t[n]&255}return e}function g(e,t){if(u.TYPED_ARRAY_SUPPORT){t.byteLength;e=u._augment(new Uint8Array(t))}else{e=d(e,new Uint8Array(t))}return e}function v(e,t){var r=y(t.length)|0;e=b(e,r);for(var n=0;n<r;n+=1){e[n]=t[n]&255}return e}function m(e,t){var r;var n=0;if(t.type==="Buffer"&&a(t.data)){r=t.data;n=y(r.length)|0}e=b(e,n);for(var i=0;i<n;i+=1){e[i]=r[i]&255}return e}function b(e,t){if(u.TYPED_ARRAY_SUPPORT){e=u._augment(new Uint8Array(t))}else{e.length=t;e._isBuffer=true}var r=t!==0&&t<=u.poolSize>>>1;if(r)e.parent=s;return e}function y(e){if(e>=o()){throw new RangeError("Attempt to allocate Buffer larger than maximum "+"size: 0x"+o().toString(16)+" bytes")}return e|0}function _(e,t){if(!(this instanceof _))return new _(e,t);var r=new u(e,t);delete r.parent;return r}u.isBuffer=function Z(e){return!!(e!=null&&e._isBuffer)};u.compare=function ee(e,t){if(!u.isBuffer(e)||!u.isBuffer(t)){throw new TypeError("Arguments must be Buffers")}if(e===t)return 0;var r=e.length;var n=t.length;var i=0;var a=Math.min(r,n);while(i<a){if(e[i]!==t[i])break;++i}if(i!==a){r=e[i];n=t[i]}if(r<n)return-1;if(n<r)return 1;return 0};u.isEncoding=function te(e){switch(String(e).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"raw":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return true;default:return false}};u.concat=function re(e,t){if(!a(e))throw new TypeError("list argument must be an Array of Buffers.");if(e.length===0){return new u(0)}var r;if(t===undefined){t=0;for(r=0;r<e.length;r++){t+=e[r].length}}var n=new u(t);var i=0;for(r=0;r<e.length;r++){var s=e[r];s.copy(n,i);i+=s.length}return n};function w(e,t){if(typeof e!=="string")e=""+e;var r=e.length;if(r===0)return 0;var n=false;for(;;){switch(t){case"ascii":case"binary":case"raw":case"raws":return r;case"utf8":case"utf-8":return z(e).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return r*2;case"hex":return r>>>1;case"base64":return Q(e).length;default:if(n)return z(e).length;t=(""+t).toLowerCase();n=true}}}u.byteLength=w;u.prototype.length=undefined;u.prototype.parent=undefined;function E(e,t,r){var n=false;t=t|0;r=r===undefined||r===Infinity?this.length:r|0;if(!e)e="utf8";if(t<0)t=0;if(r>this.length)r=this.length;if(r<=t)return"";while(true){switch(e){case"hex":return M(this,t,r);case"utf8":case"utf-8":return L(this,t,r);case"ascii":return T(this,t,r);case"binary":return I(this,t,r);case"base64":return R(this,t,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return C(this,t,r);default:if(n)throw new TypeError("Unknown encoding: "+e);e=(e+"").toLowerCase();n=true}}}u.prototype.toString=function ne(){var e=this.length|0;if(e===0)return"";if(arguments.length===0)return L(this,0,e);return E.apply(this,arguments)};u.prototype.equals=function ie(e){if(!u.isBuffer(e))throw new TypeError("Argument must be a Buffer");if(this===e)return true;return u.compare(this,e)===0};u.prototype.inspect=function ae(){var e="";var t=r.INSPECT_MAX_BYTES;if(this.length>0){e=this.toString("hex",0,t).match(/.{2}/g).join(" ");if(this.length>t)e+=" ... "}return"<Buffer "+e+">"};u.prototype.compare=function se(e){if(!u.isBuffer(e))throw new TypeError("Argument must be a Buffer");if(this===e)return 0;return u.compare(this,e)};u.prototype.indexOf=function oe(e,t){if(t>2147483647)t=2147483647;else if(t<-2147483648)t=-2147483648;t>>=0;if(this.length===0)return-1;if(t>=this.length)return-1;if(t<0)t=Math.max(this.length+t,0);if(typeof e==="string"){if(e.length===0)return-1;return String.prototype.indexOf.call(this,e,t)}if(u.isBuffer(e)){return r(this,e,t)}if(typeof e==="number"){if(u.TYPED_ARRAY_SUPPORT&&Uint8Array.prototype.indexOf==="function"){return Uint8Array.prototype.indexOf.call(this,e,t)}return r(this,[e],t)}function r(e,t,r){var n=-1;for(var i=0;r+i<e.length;i++){if(e[r+i]===t[n===-1?0:i-n]){if(n===-1)n=i;if(i-n+1===t.length)return r+n}else{n=-1}}return-1}throw new TypeError("val must be string, number or Buffer")};u.prototype.get=function ue(e){console.log(".get() is deprecated. Access using array indexes instead.");return this.readUInt8(e)};u.prototype.set=function fe(e,t){console.log(".set() is deprecated. Access using array indexes instead.");return this.writeUInt8(e,t)};function S(e,t,r,n){r=Number(r)||0;var i=e.length-r;if(!n){n=i}else{n=Number(n);if(n>i){n=i}}var a=t.length;if(a%2!==0)throw new Error("Invalid hex string");if(n>a/2){n=a/2}for(var s=0;s<n;s++){var o=parseInt(t.substr(s*2,2),16);if(isNaN(o))throw new Error("Invalid hex string");e[r+s]=o}return s}function x(e,t,r,n){return V(z(t,e.length-r),e,r,n)}function O(e,t,r,n){return V(K(t),e,r,n)}function j(e,t,r,n){return O(e,t,r,n)}function k(e,t,r,n){return V(Q(t),e,r,n)}function A(e,t,r,n){return V(X(t,e.length-r),e,r,n)}u.prototype.write=function le(e,t,r,n){if(t===undefined){n="utf8";r=this.length;t=0}else if(r===undefined&&typeof t==="string"){n=t;r=this.length;t=0}else if(isFinite(t)){t=t|0;if(isFinite(r)){r=r|0;if(n===undefined)n="utf8"}else{n=r;r=undefined}}else{var i=n;n=t;t=r|0;r=i}var a=this.length-t;if(r===undefined||r>a)r=a;if(e.length>0&&(r<0||t<0)||t>this.length){throw new RangeError("attempt to write outside buffer bounds")}if(!n)n="utf8";var s=false;for(;;){switch(n){case"hex":return S(this,e,t,r);case"utf8":case"utf-8":return x(this,e,t,r);case"ascii":return O(this,e,t,r);case"binary":return j(this,e,t,r);case"base64":return k(this,e,t,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return A(this,e,t,r);default:if(s)throw new TypeError("Unknown encoding: "+n);n=(""+n).toLowerCase();s=true}}};u.prototype.toJSON=function ce(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function R(e,t,r){if(t===0&&r===e.length){return n.fromByteArray(e)}else{return n.fromByteArray(e.slice(t,r))}}function L(e,t,r){var n="";var i="";r=Math.min(e.length,r);for(var a=t;a<r;a++){if(e[a]<=127){n+=J(i)+String.fromCharCode(e[a]);i=""}else{i+="%"+e[a].toString(16)}}return n+J(i)}function T(e,t,r){var n="";r=Math.min(e.length,r);for(var i=t;i<r;i++){n+=String.fromCharCode(e[i]&127)}return n}function I(e,t,r){var n="";r=Math.min(e.length,r);for(var i=t;i<r;i++){n+=String.fromCharCode(e[i])}return n}function M(e,t,r){var n=e.length;if(!t||t<0)t=0;if(!r||r<0||r>n)r=n;var i="";for(var a=t;a<r;a++){i+=$(e[a])}return i}function C(e,t,r){var n=e.slice(t,r);var i="";for(var a=0;a<n.length;a+=2){i+=String.fromCharCode(n[a]+n[a+1]*256)}return i}u.prototype.slice=function he(e,t){var r=this.length;e=~~e;t=t===undefined?r:~~t;if(e<0){e+=r;if(e<0)e=0}else if(e>r){e=r}if(t<0){t+=r;if(t<0)t=0}else if(t>r){t=r}if(t<e)t=e;var n;if(u.TYPED_ARRAY_SUPPORT){n=u._augment(this.subarray(e,t))}else{var i=t-e;n=new u(i,undefined);for(var a=0;a<i;a++){n[a]=this[a+e]}}if(n.length)n.parent=this.parent||this;return n};function P(e,t,r){if(e%1!==0||e<0)throw new RangeError("offset is not uint");if(e+t>r)throw new RangeError("Trying to access beyond buffer length")}u.prototype.readUIntLE=function pe(e,t,r){e=e|0;t=t|0;if(!r)P(e,t,this.length);var n=this[e];var i=1;var a=0;while(++a<t&&(i*=256)){n+=this[e+a]*i}return n};u.prototype.readUIntBE=function de(e,t,r){e=e|0;t=t|0;if(!r){P(e,t,this.length)}var n=this[e+--t];var i=1;while(t>0&&(i*=256)){n+=this[e+--t]*i}return n};u.prototype.readUInt8=function ge(e,t){if(!t)P(e,1,this.length);return this[e]};u.prototype.readUInt16LE=function ve(e,t){if(!t)P(e,2,this.length);return this[e]|this[e+1]<<8};u.prototype.readUInt16BE=function me(e,t){if(!t)P(e,2,this.length);return this[e]<<8|this[e+1]};u.prototype.readUInt32LE=function be(e,t){if(!t)P(e,4,this.length);return(this[e]|this[e+1]<<8|this[e+2]<<16)+this[e+3]*16777216};u.prototype.readUInt32BE=function ye(e,t){if(!t)P(e,4,this.length);return this[e]*16777216+(this[e+1]<<16|this[e+2]<<8|this[e+3])};u.prototype.readIntLE=function _e(e,t,r){e=e|0;t=t|0;if(!r)P(e,t,this.length);var n=this[e];var i=1;var a=0;while(++a<t&&(i*=256)){n+=this[e+a]*i}i*=128;if(n>=i)n-=Math.pow(2,8*t);return n};u.prototype.readIntBE=function we(e,t,r){e=e|0;t=t|0;if(!r)P(e,t,this.length);var n=t;var i=1;var a=this[e+--n];while(n>0&&(i*=256)){a+=this[e+--n]*i}i*=128;if(a>=i)a-=Math.pow(2,8*t);return a};u.prototype.readInt8=function Ee(e,t){if(!t)P(e,1,this.length);if(!(this[e]&128))return this[e];return(255-this[e]+1)*-1};u.prototype.readInt16LE=function Se(e,t){if(!t)P(e,2,this.length);var r=this[e]|this[e+1]<<8;return r&32768?r|4294901760:r};u.prototype.readInt16BE=function xe(e,t){if(!t)P(e,2,this.length);var r=this[e+1]|this[e]<<8;return r&32768?r|4294901760:r};u.prototype.readInt32LE=function Oe(e,t){if(!t)P(e,4,this.length);return this[e]|this[e+1]<<8|this[e+2]<<16|this[e+3]<<24};u.prototype.readInt32BE=function je(e,t){if(!t)P(e,4,this.length);return this[e]<<24|this[e+1]<<16|this[e+2]<<8|this[e+3]};u.prototype.readFloatLE=function ke(e,t){if(!t)P(e,4,this.length);return i.read(this,e,true,23,4)};u.prototype.readFloatBE=function Ae(e,t){if(!t)P(e,4,this.length);return i.read(this,e,false,23,4)};u.prototype.readDoubleLE=function Re(e,t){if(!t)P(e,8,this.length);return i.read(this,e,true,52,8)};u.prototype.readDoubleBE=function Le(e,t){if(!t)P(e,8,this.length);return i.read(this,e,false,52,8)};function N(e,t,r,n,i,a){if(!u.isBuffer(e))throw new TypeError("buffer must be a Buffer instance");if(t>i||t<a)throw new RangeError("value is out of bounds");if(r+n>e.length)throw new RangeError("index out of range")}u.prototype.writeUIntLE=function Te(e,t,r,n){e=+e;t=t|0;r=r|0;if(!n)N(this,e,t,r,Math.pow(2,8*r),0);var i=1;var a=0;this[t]=e&255;while(++a<r&&(i*=256)){this[t+a]=e/i&255}return t+r};u.prototype.writeUIntBE=function Ie(e,t,r,n){e=+e;t=t|0;r=r|0;if(!n)N(this,e,t,r,Math.pow(2,8*r),0);var i=r-1;var a=1;this[t+i]=e&255;while(--i>=0&&(a*=256)){this[t+i]=e/a&255}return t+r};u.prototype.writeUInt8=function Me(e,t,r){e=+e;t=t|0;if(!r)N(this,e,t,1,255,0);if(!u.TYPED_ARRAY_SUPPORT)e=Math.floor(e);this[t]=e;return t+1};function D(e,t,r,n){if(t<0)t=65535+t+1;for(var i=0,a=Math.min(e.length-r,2);i<a;i++){e[r+i]=(t&255<<8*(n?i:1-i))>>>(n?i:1-i)*8}}u.prototype.writeUInt16LE=function Ce(e,t,r){e=+e;t=t|0;if(!r)N(this,e,t,2,65535,0);if(u.TYPED_ARRAY_SUPPORT){this[t]=e;this[t+1]=e>>>8}else{D(this,e,t,true)}return t+2};u.prototype.writeUInt16BE=function Pe(e,t,r){e=+e;t=t|0;if(!r)N(this,e,t,2,65535,0);if(u.TYPED_ARRAY_SUPPORT){this[t]=e>>>8;this[t+1]=e}else{D(this,e,t,false)}return t+2};function B(e,t,r,n){if(t<0)t=4294967295+t+1;for(var i=0,a=Math.min(e.length-r,4);i<a;i++){e[r+i]=t>>>(n?i:3-i)*8&255}}u.prototype.writeUInt32LE=function Ne(e,t,r){e=+e;t=t|0;if(!r)N(this,e,t,4,4294967295,0);if(u.TYPED_ARRAY_SUPPORT){this[t+3]=e>>>24;this[t+2]=e>>>16;this[t+1]=e>>>8;this[t]=e}else{B(this,e,t,true)}return t+4};u.prototype.writeUInt32BE=function De(e,t,r){e=+e;t=t|0;if(!r)N(this,e,t,4,4294967295,0);if(u.TYPED_ARRAY_SUPPORT){this[t]=e>>>24;this[t+1]=e>>>16;this[t+2]=e>>>8;this[t+3]=e}else{B(this,e,t,false)}return t+4};u.prototype.writeIntLE=function Be(e,t,r,n){e=+e;t=t|0;if(!n){var i=Math.pow(2,8*r-1);N(this,e,t,r,i-1,-i)}var a=0;var s=1;var o=e<0?1:0;this[t]=e&255;while(++a<r&&(s*=256)){this[t+a]=(e/s>>0)-o&255}return t+r};u.prototype.writeIntBE=function Ue(e,t,r,n){e=+e;t=t|0;if(!n){var i=Math.pow(2,8*r-1);N(this,e,t,r,i-1,-i)}var a=r-1;var s=1;var o=e<0?1:0;this[t+a]=e&255;while(--a>=0&&(s*=256)){this[t+a]=(e/s>>0)-o&255}return t+r};u.prototype.writeInt8=function Fe(e,t,r){e=+e;t=t|0;if(!r)N(this,e,t,1,127,-128);if(!u.TYPED_ARRAY_SUPPORT)e=Math.floor(e);if(e<0)e=255+e+1;this[t]=e;return t+1};u.prototype.writeInt16LE=function qe(e,t,r){e=+e;t=t|0;if(!r)N(this,e,t,2,32767,-32768);if(u.TYPED_ARRAY_SUPPORT){this[t]=e;this[t+1]=e>>>8}else{D(this,e,t,true)}return t+2};u.prototype.writeInt16BE=function Ge(e,t,r){e=+e;t=t|0;if(!r)N(this,e,t,2,32767,-32768);if(u.TYPED_ARRAY_SUPPORT){this[t]=e>>>8;this[t+1]=e}else{D(this,e,t,false)}return t+2};u.prototype.writeInt32LE=function We(e,t,r){e=+e;t=t|0;if(!r)N(this,e,t,4,2147483647,-2147483648);if(u.TYPED_ARRAY_SUPPORT){this[t]=e;this[t+1]=e>>>8;this[t+2]=e>>>16;this[t+3]=e>>>24}else{B(this,e,t,true)}return t+4};u.prototype.writeInt32BE=function He(e,t,r){e=+e;t=t|0;if(!r)N(this,e,t,4,2147483647,-2147483648);if(e<0)e=4294967295+e+1;if(u.TYPED_ARRAY_SUPPORT){this[t]=e>>>24;this[t+1]=e>>>16;this[t+2]=e>>>8;this[t+3]=e}else{B(this,e,t,false)}return t+4};function U(e,t,r,n,i,a){if(t>i||t<a)throw new RangeError("value is out of bounds");if(r+n>e.length)throw new RangeError("index out of range");if(r<0)throw new RangeError("index out of range")}function F(e,t,r,n,a){if(!a){U(e,t,r,4,3.4028234663852886e38,-3.4028234663852886e38)}i.write(e,t,r,n,23,4);return r+4}u.prototype.writeFloatLE=function Ye(e,t,r){return F(this,e,t,true,r)};u.prototype.writeFloatBE=function $e(e,t,r){return F(this,e,t,false,r)};function q(e,t,r,n,a){if(!a){U(e,t,r,8,1.7976931348623157e308,-1.7976931348623157e308)}i.write(e,t,r,n,52,8);return r+8}u.prototype.writeDoubleLE=function ze(e,t,r){return q(this,e,t,true,r)};u.prototype.writeDoubleBE=function Ke(e,t,r){return q(this,e,t,false,r)};u.prototype.copy=function Xe(e,t,r,n){if(!r)r=0;if(!n&&n!==0)n=this.length;if(t>=e.length)t=e.length;if(!t)t=0;if(n>0&&n<r)n=r;if(n===r)return 0;if(e.length===0||this.length===0)return 0;if(t<0){throw new RangeError("targetStart out of bounds")}if(r<0||r>=this.length)throw new RangeError("sourceStart out of bounds");if(n<0)throw new RangeError("sourceEnd out of bounds");if(n>this.length)n=this.length;if(e.length-t<n-r){n=e.length-t+r}var i=n-r;var a;if(this===e&&r<t&&t<n){for(a=i-1;a>=0;a--){e[a+t]=this[a+r]}}else if(i<1e3||!u.TYPED_ARRAY_SUPPORT){for(a=0;a<i;a++){e[a+t]=this[a+r]}}else{e._set(this.subarray(r,r+i),t)}return i};u.prototype.fill=function Qe(e,t,r){if(!e)e=0;if(!t)t=0;if(!r)r=this.length;if(r<t)throw new RangeError("end < start");if(r===t)return;if(this.length===0)return;if(t<0||t>=this.length)throw new RangeError("start out of bounds");if(r<0||r>this.length)throw new RangeError("end out of bounds");var n;if(typeof e==="number"){for(n=t;n<r;n++){this[n]=e}}else{var i=z(e.toString());var a=i.length;for(n=t;n<r;n++){this[n]=i[n%a]}}return this};u.prototype.toArrayBuffer=function Ve(){if(typeof Uint8Array!=="undefined"){if(u.TYPED_ARRAY_SUPPORT){return new u(this).buffer}else{var e=new Uint8Array(this.length);for(var t=0,r=e.length;t<r;t+=1){e[t]=this[t]}return e.buffer}}else{throw new TypeError("Buffer.toArrayBuffer not supported in this browser")}};var G=u.prototype;u._augment=function Je(e){e.constructor=u;e._isBuffer=true;e._set=e.set;e.get=G.get;e.set=G.set;e.write=G.write;e.toString=G.toString;e.toLocaleString=G.toString;e.toJSON=G.toJSON;e.equals=G.equals;e.compare=G.compare;e.indexOf=G.indexOf;e.copy=G.copy;e.slice=G.slice;e.readUIntLE=G.readUIntLE;e.readUIntBE=G.readUIntBE;e.readUInt8=G.readUInt8;e.readUInt16LE=G.readUInt16LE;e.readUInt16BE=G.readUInt16BE;e.readUInt32LE=G.readUInt32LE;e.readUInt32BE=G.readUInt32BE;e.readIntLE=G.readIntLE;e.readIntBE=G.readIntBE;e.readInt8=G.readInt8;e.readInt16LE=G.readInt16LE;e.readInt16BE=G.readInt16BE;e.readInt32LE=G.readInt32LE;e.readInt32BE=G.readInt32BE;e.readFloatLE=G.readFloatLE;e.readFloatBE=G.readFloatBE;e.readDoubleLE=G.readDoubleLE;e.readDoubleBE=G.readDoubleBE;e.writeUInt8=G.writeUInt8;e.writeUIntLE=G.writeUIntLE;e.writeUIntBE=G.writeUIntBE;e.writeUInt16LE=G.writeUInt16LE;e.writeUInt16BE=G.writeUInt16BE;e.writeUInt32LE=G.writeUInt32LE;e.writeUInt32BE=G.writeUInt32BE;e.writeIntLE=G.writeIntLE;e.writeIntBE=G.writeIntBE;e.writeInt8=G.writeInt8;e.writeInt16LE=G.writeInt16LE;e.writeInt16BE=G.writeInt16BE;e.writeInt32LE=G.writeInt32LE;e.writeInt32BE=G.writeInt32BE;e.writeFloatLE=G.writeFloatLE;e.writeFloatBE=G.writeFloatBE;e.writeDoubleLE=G.writeDoubleLE;e.writeDoubleBE=G.writeDoubleBE;e.fill=G.fill;e.inspect=G.inspect;e.toArrayBuffer=G.toArrayBuffer;return e};var W=/[^+\/0-9A-Za-z-_]/g;function H(e){e=Y(e).replace(W,"");if(e.length<2)return"";while(e.length%4!==0){e=e+"="}return e}function Y(e){if(e.trim)return e.trim();return e.replace(/^\s+|\s+$/g,"")}function $(e){if(e<16)return"0"+e.toString(16);return e.toString(16)}function z(e,t){t=t||Infinity;var r;var n=e.length;var i=null;var a=[];var s=0;for(;s<n;s++){r=e.charCodeAt(s);if(r>55295&&r<57344){if(i){if(r<56320){if((t-=3)>-1)a.push(239,191,189);i=r;continue}else{r=i-55296<<10|r-56320|65536;i=null}}else{if(r>56319){if((t-=3)>-1)a.push(239,191,189);continue}else if(s+1===n){if((t-=3)>-1)a.push(239,191,189);continue}else{i=r;continue}}}else if(i){if((t-=3)>-1)a.push(239,191,189);i=null}if(r<128){if((t-=1)<0)break;a.push(r)}else if(r<2048){if((t-=2)<0)break;a.push(r>>6|192,r&63|128)}else if(r<65536){if((t-=3)<0)break;a.push(r>>12|224,r>>6&63|128,r&63|128)}else if(r<2097152){if((t-=4)<0)break;a.push(r>>18|240,r>>12&63|128,r>>6&63|128,r&63|128)}else{throw new Error("Invalid code point")}}return a}function K(e){var t=[];for(var r=0;r<e.length;r++){t.push(e.charCodeAt(r)&255)}return t}function X(e,t){var r,n,i;var a=[];for(var s=0;s<e.length;s++){if((t-=2)<0)break;r=e.charCodeAt(s);n=r>>8;i=r%256;a.push(i);a.push(n)}return a}function Q(e){return n.toByteArray(H(e))}function V(e,t,r,n){for(var i=0;i<n;i++){if(i+r>=t.length||i>=e.length)break;t[i+r]=e[i]}return i}function J(e){try{return decodeURIComponent(e)}catch(t){return String.fromCharCode(65533)}}},{"base64-js":5,ieee754:6,"is-array":7}],5:[function(e,t,r){var n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";(function(e){"use strict";var t=typeof Uint8Array!=="undefined"?Uint8Array:Array;var r="+".charCodeAt(0);var i="/".charCodeAt(0);var a="0".charCodeAt(0);var s="a".charCodeAt(0);var o="A".charCodeAt(0);var u="-".charCodeAt(0);var f="_".charCodeAt(0);function l(e){var t=e.charCodeAt(0);if(t===r||t===u)return 62;if(t===i||t===f)return 63;if(t<a)return-1;if(t<a+10)return t-a+26+26;if(t<o+26)return t-o;if(t<s+26)return t-s+26}function c(e){var r,n,i,a,s,o;if(e.length%4>0){throw new Error("Invalid string. Length must be a multiple of 4")}var u=e.length;s="="===e.charAt(u-2)?2:"="===e.charAt(u-1)?1:0;o=new t(e.length*3/4-s);i=s>0?e.length-4:e.length;var f=0;function c(e){o[f++]=e}for(r=0,n=0;r<i;r+=4,n+=3){a=l(e.charAt(r))<<18|l(e.charAt(r+1))<<12|l(e.charAt(r+2))<<6|l(e.charAt(r+3));c((a&16711680)>>16);c((a&65280)>>8);c(a&255)}if(s===2){a=l(e.charAt(r))<<2|l(e.charAt(r+1))>>4;c(a&255)}else if(s===1){a=l(e.charAt(r))<<10|l(e.charAt(r+1))<<4|l(e.charAt(r+2))>>2;c(a>>8&255);c(a&255)}return o}function h(e){var t,r=e.length%3,i="",a,s;function o(e){return n.charAt(e)}function u(e){return o(e>>18&63)+o(e>>12&63)+o(e>>6&63)+o(e&63)}for(t=0,s=e.length-r;t<s;t+=3){a=(e[t]<<16)+(e[t+1]<<8)+e[t+2];i+=u(a)}switch(r){case 1:a=e[e.length-1];i+=o(a>>2);i+=o(a<<4&63);i+="==";break;case 2:a=(e[e.length-2]<<8)+e[e.length-1];i+=o(a>>10);i+=o(a>>4&63);i+=o(a<<2&63);i+="=";break}return i}e.toByteArray=c;e.fromByteArray=h})(typeof r==="undefined"?this.base64js={}:r)},{}],6:[function(e,t,r){r.read=function(e,t,r,n,i){var a,s;var o=i*8-n-1;var u=(1<<o)-1;var f=u>>1;var l=-7;var c=r?i-1:0;var h=r?-1:1;var p=e[t+c];c+=h;a=p&(1<<-l)-1;p>>=-l;l+=o;for(;l>0;a=a*256+e[t+c],c+=h,l-=8){}s=a&(1<<-l)-1;a>>=-l;l+=n;for(;l>0;s=s*256+e[t+c],c+=h,l-=8){}if(a===0){a=1-f}else if(a===u){return s?NaN:(p?-1:1)*Infinity}else{s=s+Math.pow(2,n);a=a-f}return(p?-1:1)*s*Math.pow(2,a-n)};r.write=function(e,t,r,n,i,a){var s,o,u;var f=a*8-i-1;var l=(1<<f)-1;var c=l>>1;var h=i===23?Math.pow(2,-24)-Math.pow(2,-77):0;var p=n?0:a-1;var d=n?1:-1;var g=t<0||t===0&&1/t<0?1:0;t=Math.abs(t);if(isNaN(t)||t===Infinity){o=isNaN(t)?1:0;s=l}else{s=Math.floor(Math.log(t)/Math.LN2);if(t*(u=Math.pow(2,-s))<1){s--;u*=2}if(s+c>=1){t+=h/u}else{t+=h*Math.pow(2,1-c)}if(t*u>=2){s++;u/=2}if(s+c>=l){o=0;s=l}else if(s+c>=1){o=(t*u-1)*Math.pow(2,i);s=s+c}else{o=t*Math.pow(2,c-1)*Math.pow(2,i);s=0}}for(;i>=8;e[r+p]=o&255,p+=d,o/=256,i-=8){}s=s<<i|o;f+=i;for(;f>0;e[r+p]=s&255,p+=d,s/=256,f-=8){}e[r+p-d]|=g*128}},{}],7:[function(e,t,r){var n=Array.isArray;var i=Object.prototype.toString;t.exports=n||function(e){return!!e&&"[object Array]"==i.call(e)}},{}],8:[function(e,t,r){t.exports={O_RDONLY:0,O_WRONLY:1,O_RDWR:2,S_IFMT:61440,S_IFREG:32768,S_IFDIR:16384,S_IFCHR:8192,S_IFBLK:24576,S_IFIFO:4096,S_IFLNK:40960,S_IFSOCK:49152,O_CREAT:512,O_EXCL:2048,O_NOCTTY:131072,O_TRUNC:1024,O_APPEND:8,O_DIRECTORY:1048576,O_NOFOLLOW:256,O_SYNC:128,O_SYMLINK:2097152,S_IRWXU:448,S_IRUSR:256,S_IWUSR:128,S_IXUSR:64,S_IRWXG:56,S_IRGRP:32,S_IWGRP:16,S_IXGRP:8,S_IRWXO:7,S_IROTH:4,S_IWOTH:2,S_IXOTH:1,E2BIG:7,EACCES:13,EADDRINUSE:48,EADDRNOTAVAIL:49,EAFNOSUPPORT:47,EAGAIN:35,EALREADY:37,EBADF:9,EBADMSG:94,EBUSY:16,ECANCELED:89,ECHILD:10,ECONNABORTED:53,ECONNREFUSED:61,ECONNRESET:54,EDEADLK:11,EDESTADDRREQ:39,EDOM:33,EDQUOT:69,EEXIST:17,EFAULT:14,EFBIG:27,EHOSTUNREACH:65,EIDRM:90,EILSEQ:92,EINPROGRESS:36,EINTR:4,EINVAL:22,EIO:5,EISCONN:56,EISDIR:21,ELOOP:62,EMFILE:24,EMLINK:31,EMSGSIZE:40,EMULTIHOP:95,ENAMETOOLONG:63,ENETDOWN:50,ENETRESET:52,ENETUNREACH:51,ENFILE:23,ENOBUFS:55,ENODATA:96,ENODEV:19,ENOENT:2,ENOEXEC:8,ENOLCK:77,ENOLINK:97,ENOMEM:12,ENOMSG:91,ENOPROTOOPT:42,ENOSPC:28,ENOSR:98,ENOSTR:99,ENOSYS:78,ENOTCONN:57,ENOTDIR:20,ENOTEMPTY:66,ENOTSOCK:38,ENOTSUP:45,ENOTTY:25,ENXIO:6,EOPNOTSUPP:102,EOVERFLOW:84,EPERM:1,EPIPE:32,EPROTO:100,EPROTONOSUPPORT:43,EPROTOTYPE:41,ERANGE:34,EROFS:30,ESPIPE:29,ESRCH:3,ESTALE:70,ETIME:101,ETIMEDOUT:60,ETXTBSY:26,EWOULDBLOCK:35,EXDEV:18,SIGHUP:1,SIGINT:2,SIGQUIT:3,SIGILL:4,SIGTRAP:5,SIGABRT:6,SIGIOT:6,SIGBUS:10,SIGFPE:8,SIGKILL:9,SIGUSR1:30,SIGSEGV:11,SIGUSR2:31,SIGPIPE:13,SIGALRM:14,SIGTERM:15,SIGCHLD:20,SIGCONT:19,SIGSTOP:17,SIGTSTP:18,SIGTTIN:21,SIGTTOU:22,SIGURG:16,SIGXCPU:24,SIGXFSZ:25,SIGVTALRM:26,SIGPROF:27,SIGWINCH:28,SIGIO:23,SIGSYS:12,SSL_OP_ALL:2147486719,SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION:262144,SSL_OP_CIPHER_SERVER_PREFERENCE:4194304,SSL_OP_CISCO_ANYCONNECT:32768,SSL_OP_COOKIE_EXCHANGE:8192,SSL_OP_CRYPTOPRO_TLSEXT_BUG:2147483648,SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS:2048,SSL_OP_EPHEMERAL_RSA:2097152,SSL_OP_LEGACY_SERVER_CONNECT:4,SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER:32,SSL_OP_MICROSOFT_SESS_ID_BUG:1,SSL_OP_MSIE_SSLV2_RSA_PADDING:64,SSL_OP_NETSCAPE_CA_DN_BUG:536870912,SSL_OP_NETSCAPE_CHALLENGE_BUG:2,SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG:1073741824,SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG:8,SSL_OP_NO_COMPRESSION:131072,SSL_OP_NO_QUERY_MTU:4096,SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION:65536,SSL_OP_NO_SSLv2:16777216,SSL_OP_NO_SSLv3:33554432,SSL_OP_NO_TICKET:16384,SSL_OP_NO_TLSv1:67108864,SSL_OP_NO_TLSv1_1:268435456,SSL_OP_NO_TLSv1_2:134217728,SSL_OP_PKCS1_CHECK_1:0,SSL_OP_PKCS1_CHECK_2:0,SSL_OP_SINGLE_DH_USE:1048576,SSL_OP_SINGLE_ECDH_USE:524288,SSL_OP_SSLEAY_080_CLIENT_DH_BUG:128,SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG:16,SSL_OP_TLS_BLOCK_PADDING_BUG:512,SSL_OP_TLS_D5_BUG:256,SSL_OP_TLS_ROLLBACK_BUG:8388608,NPN_ENABLED:1}},{}],9:[function(e,t,r){function n(){this._events=this._events||{};this._maxListeners=this._maxListeners||undefined}t.exports=n;n.EventEmitter=n;n.prototype._events=undefined;n.prototype._maxListeners=undefined;n.defaultMaxListeners=10;n.prototype.setMaxListeners=function(e){if(!a(e)||e<0||isNaN(e))throw TypeError("n must be a positive number");this._maxListeners=e;return this};n.prototype.emit=function(e){var t,r,n,a,u,f;if(!this._events)this._events={};if(e==="error"){if(!this._events.error||s(this._events.error)&&!this._events.error.length){t=arguments[1];if(t instanceof Error){throw t}throw TypeError('Uncaught, unspecified "error" event.')}}r=this._events[e];if(o(r))return false;if(i(r)){switch(arguments.length){case 1:r.call(this);break;case 2:r.call(this,arguments[1]);break;case 3:r.call(this,arguments[1],arguments[2]);break;default:n=arguments.length;a=new Array(n-1);for(u=1;u<n;u++)a[u-1]=arguments[u];r.apply(this,a)}}else if(s(r)){n=arguments.length;a=new Array(n-1);for(u=1;u<n;u++)a[u-1]=arguments[u];f=r.slice();n=f.length;for(u=0;u<n;u++)f[u].apply(this,a)}return true};n.prototype.addListener=function(e,t){var r;if(!i(t))throw TypeError("listener must be a function");if(!this._events)this._events={};if(this._events.newListener)this.emit("newListener",e,i(t.listener)?t.listener:t);if(!this._events[e])this._events[e]=t;else if(s(this._events[e]))this._events[e].push(t);else this._events[e]=[this._events[e],t];if(s(this._events[e])&&!this._events[e].warned){var r;if(!o(this._maxListeners)){r=this._maxListeners}else{r=n.defaultMaxListeners}if(r&&r>0&&this._events[e].length>r){this._events[e].warned=true;console.error("(node) warning: possible EventEmitter memory "+"leak detected. %d listeners added. "+"Use emitter.setMaxListeners() to increase limit.",this._events[e].length);if(typeof console.trace==="function"){console.trace()}}}return this};n.prototype.on=n.prototype.addListener;n.prototype.once=function(e,t){if(!i(t))throw TypeError("listener must be a function");var r=false;function n(){this.removeListener(e,n);if(!r){r=true;t.apply(this,arguments)}}n.listener=t;this.on(e,n);return this};n.prototype.removeListener=function(e,t){var r,n,a,o;if(!i(t))throw TypeError("listener must be a function");if(!this._events||!this._events[e])return this;r=this._events[e];a=r.length;n=-1;if(r===t||i(r.listener)&&r.listener===t){delete this._events[e];if(this._events.removeListener)this.emit("removeListener",e,t)}else if(s(r)){for(o=a;o-->0;){if(r[o]===t||r[o].listener&&r[o].listener===t){n=o;break}}if(n<0)return this;if(r.length===1){r.length=0;delete this._events[e]}else{r.splice(n,1)}if(this._events.removeListener)this.emit("removeListener",e,t)}return this};n.prototype.removeAllListeners=function(e){var t,r;if(!this._events)return this;if(!this._events.removeListener){if(arguments.length===0)this._events={};else if(this._events[e])delete this._events[e];return this}if(arguments.length===0){for(t in this._events){if(t==="removeListener")continue;this.removeAllListeners(t)}this.removeAllListeners("removeListener");this._events={};return this}r=this._events[e];if(i(r)){this.removeListener(e,r)}else{while(r.length)this.removeListener(e,r[r.length-1])}delete this._events[e];return this};n.prototype.listeners=function(e){var t;if(!this._events||!this._events[e])t=[];else if(i(this._events[e]))t=[this._events[e]];else t=this._events[e].slice();return t};n.listenerCount=function(e,t){var r;if(!e._events||!e._events[t])r=0;else if(i(e._events[t]))r=1;else r=e._events[t].length;
return r};function i(e){return typeof e==="function"}function a(e){return typeof e==="number"}function s(e){return typeof e==="object"&&e!==null}function o(e){return e===void 0}},{}],10:[function(e,t,r){if(typeof Object.create==="function"){t.exports=function n(e,t){e.super_=t;e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:false,writable:true,configurable:true}})}}else{t.exports=function i(e,t){e.super_=t;var r=function(){};r.prototype=t.prototype;e.prototype=new r;e.prototype.constructor=e}}},{}],11:[function(e,t,r){t.exports=Array.isArray||function(e){return Object.prototype.toString.call(e)=="[object Array]"}},{}],12:[function(e,t,r){r.endianness=function(){return"LE"};r.hostname=function(){if(typeof location!=="undefined"){return location.hostname}else return""};r.loadavg=function(){return[]};r.uptime=function(){return 0};r.freemem=function(){return Number.MAX_VALUE};r.totalmem=function(){return Number.MAX_VALUE};r.cpus=function(){return[]};r.type=function(){return"Browser"};r.release=function(){if(typeof navigator!=="undefined"){return navigator.appVersion}return""};r.networkInterfaces=r.getNetworkInterfaces=function(){return{}};r.arch=function(){return"javascript"};r.platform=function(){return"browser"};r.tmpdir=r.tmpDir=function(){return"/tmp"};r.EOL="\n"},{}],13:[function(e,t,r){(function(e){function t(e,t){var r=0;for(var n=e.length-1;n>=0;n--){var i=e[n];if(i==="."){e.splice(n,1)}else if(i===".."){e.splice(n,1);r++}else if(r){e.splice(n,1);r--}}if(t){for(;r--;r){e.unshift("..")}}return e}var n=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;var i=function(e){return n.exec(e).slice(1)};r.resolve=function(){var r="",n=false;for(var i=arguments.length-1;i>=-1&&!n;i--){var s=i>=0?arguments[i]:e.cwd();if(typeof s!=="string"){throw new TypeError("Arguments to path.resolve must be strings")}else if(!s){continue}r=s+"/"+r;n=s.charAt(0)==="/"}r=t(a(r.split("/"),function(e){return!!e}),!n).join("/");return(n?"/":"")+r||"."};r.normalize=function(e){var n=r.isAbsolute(e),i=s(e,-1)==="/";e=t(a(e.split("/"),function(e){return!!e}),!n).join("/");if(!e&&!n){e="."}if(e&&i){e+="/"}return(n?"/":"")+e};r.isAbsolute=function(e){return e.charAt(0)==="/"};r.join=function(){var e=Array.prototype.slice.call(arguments,0);return r.normalize(a(e,function(e,t){if(typeof e!=="string"){throw new TypeError("Arguments to path.join must be strings")}return e}).join("/"))};r.relative=function(e,t){e=r.resolve(e).substr(1);t=r.resolve(t).substr(1);function n(e){var t=0;for(;t<e.length;t++){if(e[t]!=="")break}var r=e.length-1;for(;r>=0;r--){if(e[r]!=="")break}if(t>r)return[];return e.slice(t,r-t+1)}var i=n(e.split("/"));var a=n(t.split("/"));var s=Math.min(i.length,a.length);var o=s;for(var u=0;u<s;u++){if(i[u]!==a[u]){o=u;break}}var f=[];for(var u=o;u<i.length;u++){f.push("..")}f=f.concat(a.slice(o));return f.join("/")};r.sep="/";r.delimiter=":";r.dirname=function(e){var t=i(e),r=t[0],n=t[1];if(!r&&!n){return"."}if(n){n=n.substr(0,n.length-1)}return r+n};r.basename=function(e,t){var r=i(e)[2];if(t&&r.substr(-1*t.length)===t){r=r.substr(0,r.length-t.length)}return r};r.extname=function(e){return i(e)[3]};function a(e,t){if(e.filter)return e.filter(t);var r=[];for(var n=0;n<e.length;n++){if(t(e[n],n,e))r.push(e[n])}return r}var s="ab".substr(-1)==="b"?function(e,t,r){return e.substr(t,r)}:function(e,t,r){if(t<0)t=e.length+t;return e.substr(t,r)}}).call(this,e("_process"))},{_process:14}],14:[function(e,t,r){var n=t.exports={};var i=[];var a=false;var s;var o=-1;function u(){a=false;if(s.length){i=s.concat(i)}else{o=-1}if(i.length){f()}}function f(){if(a){return}var e=setTimeout(u);a=true;var t=i.length;while(t){s=i;i=[];while(++o<t){s[o].run()}o=-1;t=i.length}s=null;a=false;clearTimeout(e)}n.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1){for(var r=1;r<arguments.length;r++){t[r-1]=arguments[r]}}i.push(new l(e,t));if(i.length===1&&!a){setTimeout(f,0)}};function l(e,t){this.fun=e;this.array=t}l.prototype.run=function(){this.fun.apply(null,this.array)};n.title="browser";n.browser=true;n.env={};n.argv=[];n.version="";n.versions={};function c(){}n.on=c;n.addListener=c;n.once=c;n.off=c;n.removeListener=c;n.removeAllListeners=c;n.emit=c;n.binding=function(e){throw new Error("process.binding is not supported")};n.cwd=function(){return"/"};n.chdir=function(e){throw new Error("process.chdir is not supported")};n.umask=function(){return 0}},{}],15:[function(t,r,n){(function(t){(function(i){var a=typeof n=="object"&&n&&!n.nodeType&&n;var s=typeof r=="object"&&r&&!r.nodeType&&r;var o=typeof t=="object"&&t;if(o.global===o||o.window===o||o.self===o){i=o}var u,f=2147483647,l=36,c=1,h=26,p=38,d=700,g=72,v=128,m="-",b=/^xn--/,y=/[^\x20-\x7E]/,_=/[\x2E\u3002\uFF0E\uFF61]/g,w={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},E=l-c,S=Math.floor,x=String.fromCharCode,O;function j(e){throw RangeError(w[e])}function k(e,t){var r=e.length;var n=[];while(r--){n[r]=t(e[r])}return n}function A(e,t){var r=e.split("@");var n="";if(r.length>1){n=r[0]+"@";e=r[1]}e=e.replace(_,".");var i=e.split(".");var a=k(i,t).join(".");return n+a}function R(e){var t=[],r=0,n=e.length,i,a;while(r<n){i=e.charCodeAt(r++);if(i>=55296&&i<=56319&&r<n){a=e.charCodeAt(r++);if((a&64512)==56320){t.push(((i&1023)<<10)+(a&1023)+65536)}else{t.push(i);r--}}else{t.push(i)}}return t}function L(e){return k(e,function(e){var t="";if(e>65535){e-=65536;t+=x(e>>>10&1023|55296);e=56320|e&1023}t+=x(e);return t}).join("")}function T(e){if(e-48<10){return e-22}if(e-65<26){return e-65}if(e-97<26){return e-97}return l}function I(e,t){return e+22+75*(e<26)-((t!=0)<<5)}function M(e,t,r){var n=0;e=r?S(e/d):e>>1;e+=S(e/t);for(;e>E*h>>1;n+=l){e=S(e/E)}return S(n+(E+1)*e/(e+p))}function C(e){var t=[],r=e.length,n,i=0,a=v,s=g,o,u,p,d,b,y,_,w,E;o=e.lastIndexOf(m);if(o<0){o=0}for(u=0;u<o;++u){if(e.charCodeAt(u)>=128){j("not-basic")}t.push(e.charCodeAt(u))}for(p=o>0?o+1:0;p<r;){for(d=i,b=1,y=l;;y+=l){if(p>=r){j("invalid-input")}_=T(e.charCodeAt(p++));if(_>=l||_>S((f-i)/b)){j("overflow")}i+=_*b;w=y<=s?c:y>=s+h?h:y-s;if(_<w){break}E=l-w;if(b>S(f/E)){j("overflow")}b*=E}n=t.length+1;s=M(i-d,n,d==0);if(S(i/n)>f-a){j("overflow")}a+=S(i/n);i%=n;t.splice(i++,0,a)}return L(t)}function P(e){var t,r,n,i,a,s,o,u,p,d,b,y=[],_,w,E,O;e=R(e);_=e.length;t=v;r=0;a=g;for(s=0;s<_;++s){b=e[s];if(b<128){y.push(x(b))}}n=i=y.length;if(i){y.push(m)}while(n<_){for(o=f,s=0;s<_;++s){b=e[s];if(b>=t&&b<o){o=b}}w=n+1;if(o-t>S((f-r)/w)){j("overflow")}r+=(o-t)*w;t=o;for(s=0;s<_;++s){b=e[s];if(b<t&&++r>f){j("overflow")}if(b==t){for(u=r,p=l;;p+=l){d=p<=a?c:p>=a+h?h:p-a;if(u<d){break}O=u-d;E=l-d;y.push(x(I(d+O%E,0)));u=S(O/E)}y.push(x(I(u,0)));a=M(r,w,n==i);r=0;++n}}++r;++t}return y.join("")}function N(e){return A(e,function(e){return b.test(e)?C(e.slice(4).toLowerCase()):e})}function D(e){return A(e,function(e){return y.test(e)?"xn--"+P(e):e})}u={version:"1.3.2",ucs2:{decode:R,encode:L},decode:C,encode:P,toASCII:D,toUnicode:N};if(typeof e=="function"&&typeof e.amd=="object"&&e.amd){e("punycode",function(){return u})}else if(a&&s){if(r.exports==a){s.exports=u}else{for(O in u){u.hasOwnProperty(O)&&(a[O]=u[O])}}}else{i.punycode=u}})(this)}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}],16:[function(e,t,r){"use strict";function n(e,t){return Object.prototype.hasOwnProperty.call(e,t)}t.exports=function(e,t,r,a){t=t||"&";r=r||"=";var s={};if(typeof e!=="string"||e.length===0){return s}var o=/\+/g;e=e.split(t);var u=1e3;if(a&&typeof a.maxKeys==="number"){u=a.maxKeys}var f=e.length;if(u>0&&f>u){f=u}for(var l=0;l<f;++l){var c=e[l].replace(o,"%20"),h=c.indexOf(r),p,d,g,v;if(h>=0){p=c.substr(0,h);d=c.substr(h+1)}else{p=c;d=""}g=decodeURIComponent(p);v=decodeURIComponent(d);if(!n(s,g)){s[g]=v}else if(i(s[g])){s[g].push(v)}else{s[g]=[s[g],v]}}return s};var i=Array.isArray||function(e){return Object.prototype.toString.call(e)==="[object Array]"}},{}],17:[function(e,t,r){"use strict";var n=function(e){switch(typeof e){case"string":return e;case"boolean":return e?"true":"false";case"number":return isFinite(e)?e:"";default:return""}};t.exports=function(e,t,r,o){t=t||"&";r=r||"=";if(e===null){e=undefined}if(typeof e==="object"){return a(s(e),function(s){var o=encodeURIComponent(n(s))+r;if(i(e[s])){return a(e[s],function(e){return o+encodeURIComponent(n(e))}).join(t)}else{return o+encodeURIComponent(n(e[s]))}}).join(t)}if(!o)return"";return encodeURIComponent(n(o))+r+encodeURIComponent(n(e))};var i=Array.isArray||function(e){return Object.prototype.toString.call(e)==="[object Array]"};function a(e,t){if(e.map)return e.map(t);var r=[];for(var n=0;n<e.length;n++){r.push(t(e[n],n))}return r}var s=Object.keys||function(e){var t=[];for(var r in e){if(Object.prototype.hasOwnProperty.call(e,r))t.push(r)}return t}},{}],18:[function(e,t,r){"use strict";r.decode=r.parse=e("./decode");r.encode=r.stringify=e("./encode")},{"./decode":16,"./encode":17}],19:[function(e,t,r){t.exports=e("./lib/_stream_duplex.js")},{"./lib/_stream_duplex.js":20}],20:[function(e,t,r){"use strict";var n=Object.keys||function(e){var t=[];for(var r in e)t.push(r);return t};t.exports=c;var i=e("process-nextick-args");var a=e("core-util-is");a.inherits=e("inherits");var s=e("./_stream_readable");var o=e("./_stream_writable");a.inherits(c,s);var u=n(o.prototype);for(var f=0;f<u.length;f++){var l=u[f];if(!c.prototype[l])c.prototype[l]=o.prototype[l]}function c(e){if(!(this instanceof c))return new c(e);s.call(this,e);o.call(this,e);if(e&&e.readable===false)this.readable=false;if(e&&e.writable===false)this.writable=false;this.allowHalfOpen=true;if(e&&e.allowHalfOpen===false)this.allowHalfOpen=false;this.once("end",h)}function h(){if(this.allowHalfOpen||this._writableState.ended)return;i(p,this)}function p(e){e.end()}function d(e,t){for(var r=0,n=e.length;r<n;r++){t(e[r],r)}}},{"./_stream_readable":22,"./_stream_writable":24,"core-util-is":25,inherits:10,"process-nextick-args":26}],21:[function(e,t,r){"use strict";t.exports=a;var n=e("./_stream_transform");var i=e("core-util-is");i.inherits=e("inherits");i.inherits(a,n);function a(e){if(!(this instanceof a))return new a(e);n.call(this,e)}a.prototype._transform=function(e,t,r){r(null,e)}},{"./_stream_transform":23,"core-util-is":25,inherits:10}],22:[function(e,t,r){(function(r){"use strict";t.exports=h;var n=e("process-nextick-args");var i=e("isarray");var a=e("buffer").Buffer;h.ReadableState=c;var s=e("events").EventEmitter;if(!s.listenerCount)s.listenerCount=function(e,t){return e.listeners(t).length};var o;(function(){try{o=e("st"+"ream")}catch(t){}finally{if(!o)o=e("events").EventEmitter}})();var a=e("buffer").Buffer;var u=e("core-util-is");u.inherits=e("inherits");var f=e("util");if(f&&f.debuglog){f=f.debuglog("stream")}else{f=function(){}}var l;u.inherits(h,o);function c(t,r){var n=e("./_stream_duplex");t=t||{};this.objectMode=!!t.objectMode;if(r instanceof n)this.objectMode=this.objectMode||!!t.readableObjectMode;var i=t.highWaterMark;var a=this.objectMode?16:16*1024;this.highWaterMark=i||i===0?i:a;this.highWaterMark=~~this.highWaterMark;this.buffer=[];this.length=0;this.pipes=null;this.pipesCount=0;this.flowing=null;this.ended=false;this.endEmitted=false;this.reading=false;this.sync=true;this.needReadable=false;this.emittedReadable=false;this.readableListening=false;this.defaultEncoding=t.defaultEncoding||"utf8";this.ranOut=false;this.awaitDrain=0;this.readingMore=false;this.decoder=null;this.encoding=null;if(t.encoding){if(!l)l=e("string_decoder/").StringDecoder;this.decoder=new l(t.encoding);this.encoding=t.encoding}}function h(t){var r=e("./_stream_duplex");if(!(this instanceof h))return new h(t);this._readableState=new c(t,this);this.readable=true;if(t&&typeof t.read==="function")this._read=t.read;o.call(this)}h.prototype.push=function(e,t){var r=this._readableState;if(!r.objectMode&&typeof e==="string"){t=t||r.defaultEncoding;if(t!==r.encoding){e=new a(e,t);t=""}}return p(this,r,e,t,false)};h.prototype.unshift=function(e){var t=this._readableState;return p(this,t,e,"",true)};h.prototype.isPaused=function(){return this._readableState.flowing===false};function p(e,t,r,n,i){var a=b(t,r);if(a){e.emit("error",a)}else if(r===null){t.reading=false;y(e,t)}else if(t.objectMode||r&&r.length>0){if(t.ended&&!i){var s=new Error("stream.push() after EOF");e.emit("error",s)}else if(t.endEmitted&&i){var s=new Error("stream.unshift() after end event");e.emit("error",s)}else{if(t.decoder&&!i&&!n)r=t.decoder.write(r);if(!i)t.reading=false;if(t.flowing&&t.length===0&&!t.sync){e.emit("data",r);e.read(0)}else{t.length+=t.objectMode?1:r.length;if(i)t.buffer.unshift(r);else t.buffer.push(r);if(t.needReadable)_(e)}E(e,t)}}else if(!i){t.reading=false}return d(t)}function d(e){return!e.ended&&(e.needReadable||e.length<e.highWaterMark||e.length===0)}h.prototype.setEncoding=function(t){if(!l)l=e("string_decoder/").StringDecoder;this._readableState.decoder=new l(t);this._readableState.encoding=t;return this};var g=8388608;function v(e){if(e>=g){e=g}else{e--;for(var t=1;t<32;t<<=1)e|=e>>t;e++}return e}function m(e,t){if(t.length===0&&t.ended)return 0;if(t.objectMode)return e===0?0:1;if(e===null||isNaN(e)){if(t.flowing&&t.buffer.length)return t.buffer[0].length;else return t.length}if(e<=0)return 0;if(e>t.highWaterMark)t.highWaterMark=v(e);if(e>t.length){if(!t.ended){t.needReadable=true;return 0}else{return t.length}}return e}h.prototype.read=function(e){f("read",e);var t=this._readableState;var r=e;if(typeof e!=="number"||e>0)t.emittedReadable=false;if(e===0&&t.needReadable&&(t.length>=t.highWaterMark||t.ended)){f("read: emitReadable",t.length,t.ended);if(t.length===0&&t.ended)L(this);else _(this);return null}e=m(e,t);if(e===0&&t.ended){if(t.length===0)L(this);return null}var n=t.needReadable;f("need readable",n);if(t.length===0||t.length-e<t.highWaterMark){n=true;f("length less than watermark",n)}if(t.ended||t.reading){n=false;f("reading or ended",n)}if(n){f("do read");t.reading=true;t.sync=true;if(t.length===0)t.needReadable=true;this._read(t.highWaterMark);t.sync=false}if(n&&!t.reading)e=m(r,t);var i;if(e>0)i=R(e,t);else i=null;if(i===null){t.needReadable=true;e=0}t.length-=e;if(t.length===0&&!t.ended)t.needReadable=true;if(r!==e&&t.ended&&t.length===0)L(this);if(i!==null)this.emit("data",i);return i};function b(e,t){var r=null;if(!a.isBuffer(t)&&typeof t!=="string"&&t!==null&&t!==undefined&&!e.objectMode){r=new TypeError("Invalid non-string/buffer chunk")}return r}function y(e,t){if(t.ended)return;if(t.decoder){var r=t.decoder.end();if(r&&r.length){t.buffer.push(r);t.length+=t.objectMode?1:r.length}}t.ended=true;_(e)}function _(e){var t=e._readableState;t.needReadable=false;if(!t.emittedReadable){f("emitReadable",t.flowing);t.emittedReadable=true;if(t.sync)n(w,e);else w(e)}}function w(e){f("emit readable");e.emit("readable");A(e)}function E(e,t){if(!t.readingMore){t.readingMore=true;n(S,e,t)}}function S(e,t){var r=t.length;while(!t.reading&&!t.flowing&&!t.ended&&t.length<t.highWaterMark){f("maybeReadMore read 0");e.read(0);if(r===t.length)break;else r=t.length}t.readingMore=false}h.prototype._read=function(e){this.emit("error",new Error("not implemented"))};h.prototype.pipe=function(e,t){var a=this;var o=this._readableState;switch(o.pipesCount){case 0:o.pipes=e;break;case 1:o.pipes=[o.pipes,e];break;default:o.pipes.push(e);break}o.pipesCount+=1;f("pipe count=%d opts=%j",o.pipesCount,t);var u=(!t||t.end!==false)&&e!==r.stdout&&e!==r.stderr;var l=u?h:d;if(o.endEmitted)n(l);else a.once("end",l);e.on("unpipe",c);function c(e){f("onunpipe");if(e===a){d()}}function h(){f("onend");e.end()}var p=x(a);e.on("drain",p);function d(){f("cleanup");e.removeListener("close",m);e.removeListener("finish",b);e.removeListener("drain",p);e.removeListener("error",v);e.removeListener("unpipe",c);a.removeListener("end",h);a.removeListener("end",d);a.removeListener("data",g);if(o.awaitDrain&&(!e._writableState||e._writableState.needDrain))p()}a.on("data",g);function g(t){f("ondata");var r=e.write(t);if(false===r){f("false write response, pause",a._readableState.awaitDrain);a._readableState.awaitDrain++;a.pause()}}function v(t){f("onerror",t);y();e.removeListener("error",v);if(s.listenerCount(e,"error")===0)e.emit("error",t)}if(!e._events||!e._events.error)e.on("error",v);else if(i(e._events.error))e._events.error.unshift(v);else e._events.error=[v,e._events.error];function m(){e.removeListener("finish",b);y()}e.once("close",m);function b(){f("onfinish");e.removeListener("close",m);y()}e.once("finish",b);function y(){f("unpipe");a.unpipe(e)}e.emit("pipe",a);if(!o.flowing){f("pipe resume");a.resume()}return e};function x(e){return function(){var t=e._readableState;f("pipeOnDrain",t.awaitDrain);if(t.awaitDrain)t.awaitDrain--;if(t.awaitDrain===0&&s.listenerCount(e,"data")){t.flowing=true;A(e)}}}h.prototype.unpipe=function(e){var t=this._readableState;if(t.pipesCount===0)return this;if(t.pipesCount===1){if(e&&e!==t.pipes)return this;if(!e)e=t.pipes;t.pipes=null;t.pipesCount=0;t.flowing=false;if(e)e.emit("unpipe",this);return this}if(!e){var r=t.pipes;var n=t.pipesCount;t.pipes=null;t.pipesCount=0;t.flowing=false;for(var i=0;i<n;i++)r[i].emit("unpipe",this);return this}var i=M(t.pipes,e);if(i===-1)return this;t.pipes.splice(i,1);t.pipesCount-=1;if(t.pipesCount===1)t.pipes=t.pipes[0];e.emit("unpipe",this);return this};h.prototype.on=function(e,t){var r=o.prototype.on.call(this,e,t);if(e==="data"&&false!==this._readableState.flowing){this.resume()}if(e==="readable"&&this.readable){var i=this._readableState;if(!i.readableListening){i.readableListening=true;i.emittedReadable=false;i.needReadable=true;if(!i.reading){n(O,this)}else if(i.length){_(this,i)}}}return r};h.prototype.addListener=h.prototype.on;function O(e){f("readable nexttick read 0");e.read(0)}h.prototype.resume=function(){var e=this._readableState;if(!e.flowing){f("resume");e.flowing=true;j(this,e)}return this};function j(e,t){if(!t.resumeScheduled){t.resumeScheduled=true;n(k,e,t)}}function k(e,t){if(!t.reading){f("resume read 0");e.read(0)}t.resumeScheduled=false;e.emit("resume");A(e);if(t.flowing&&!t.reading)e.read(0)}h.prototype.pause=function(){f("call pause flowing=%j",this._readableState.flowing);if(false!==this._readableState.flowing){f("pause");this._readableState.flowing=false;this.emit("pause")}return this};function A(e){var t=e._readableState;f("flow",t.flowing);if(t.flowing){do{var r=e.read()}while(null!==r&&t.flowing)}}h.prototype.wrap=function(e){var t=this._readableState;var r=false;var n=this;e.on("end",function(){f("wrapped end");if(t.decoder&&!t.ended){var e=t.decoder.end();if(e&&e.length)n.push(e)}n.push(null)});e.on("data",function(i){f("wrapped data");if(t.decoder)i=t.decoder.write(i);if(t.objectMode&&(i===null||i===undefined))return;else if(!t.objectMode&&(!i||!i.length))return;var a=n.push(i);if(!a){r=true;e.pause()}});for(var i in e){if(this[i]===undefined&&typeof e[i]==="function"){this[i]=function(t){return function(){return e[t].apply(e,arguments)}}(i)}}var a=["error","close","destroy","pause","resume"];I(a,function(t){e.on(t,n.emit.bind(n,t))});n._read=function(t){f("wrapped _read",t);if(r){r=false;e.resume()}};return n};h._fromList=R;function R(e,t){var r=t.buffer;var n=t.length;var i=!!t.decoder;var s=!!t.objectMode;var o;if(r.length===0)return null;if(n===0)o=null;else if(s)o=r.shift();else if(!e||e>=n){if(i)o=r.join("");else o=a.concat(r,n);r.length=0}else{if(e<r[0].length){var u=r[0];o=u.slice(0,e);r[0]=u.slice(e)}else if(e===r[0].length){o=r.shift()}else{if(i)o="";else o=new a(e);var f=0;for(var l=0,c=r.length;l<c&&f<e;l++){var u=r[0];var h=Math.min(e-f,u.length);if(i)o+=u.slice(0,h);else u.copy(o,f,0,h);if(h<u.length)r[0]=u.slice(h);else r.shift();f+=h}}}return o}function L(e){var t=e._readableState;if(t.length>0)throw new Error("endReadable called on non-empty stream");if(!t.endEmitted){t.ended=true;n(T,t,e)}}function T(e,t){if(!e.endEmitted&&e.length===0){e.endEmitted=true;t.readable=false;t.emit("end")}}function I(e,t){for(var r=0,n=e.length;r<n;r++){t(e[r],r)}}function M(e,t){for(var r=0,n=e.length;r<n;r++){if(e[r]===t)return r}return-1}}).call(this,e("_process"))},{"./_stream_duplex":20,_process:14,buffer:4,"core-util-is":25,events:9,inherits:10,isarray:11,"process-nextick-args":26,"string_decoder/":42,util:3}],23:[function(e,t,r){"use strict";t.exports=o;var n=e("./_stream_duplex");var i=e("core-util-is");i.inherits=e("inherits");i.inherits(o,n);function a(e){this.afterTransform=function(t,r){return s(e,t,r)};this.needTransform=false;this.transforming=false;this.writecb=null;this.writechunk=null}function s(e,t,r){var n=e._transformState;n.transforming=false;var i=n.writecb;if(!i)return e.emit("error",new Error("no writecb in Transform class"));n.writechunk=null;n.writecb=null;if(r!==null&&r!==undefined)e.push(r);if(i)i(t);var a=e._readableState;a.reading=false;if(a.needReadable||a.length<a.highWaterMark){e._read(a.highWaterMark)}}function o(e){if(!(this instanceof o))return new o(e);n.call(this,e);this._transformState=new a(this);var t=this;this._readableState.needReadable=true;this._readableState.sync=false;if(e){if(typeof e.transform==="function")this._transform=e.transform;if(typeof e.flush==="function")this._flush=e.flush}this.once("prefinish",function(){if(typeof this._flush==="function")this._flush(function(e){u(t,e)});else u(t)})}o.prototype.push=function(e,t){this._transformState.needTransform=false;return n.prototype.push.call(this,e,t)};o.prototype._transform=function(e,t,r){throw new Error("not implemented")};o.prototype._write=function(e,t,r){var n=this._transformState;n.writecb=r;n.writechunk=e;n.writeencoding=t;if(!n.transforming){var i=this._readableState;if(n.needTransform||i.needReadable||i.length<i.highWaterMark)this._read(i.highWaterMark)}};o.prototype._read=function(e){var t=this._transformState;if(t.writechunk!==null&&t.writecb&&!t.transforming){t.transforming=true;this._transform(t.writechunk,t.writeencoding,t.afterTransform)}else{t.needTransform=true}};function u(e,t){if(t)return e.emit("error",t);var r=e._writableState;var n=e._transformState;if(r.length)throw new Error("calling transform done when ws.length != 0");if(n.transforming)throw new Error("calling transform done when still transforming");return e.push(null)}},{"./_stream_duplex":20,"core-util-is":25,inherits:10}],24:[function(e,t,r){"use strict";t.exports=l;var n=e("process-nextick-args");var i=e("buffer").Buffer;l.WritableState=f;var a=e("core-util-is");a.inherits=e("inherits");var s;(function(){try{s=e("st"+"ream")}catch(t){}finally{if(!s)s=e("events").EventEmitter}})();var i=e("buffer").Buffer;a.inherits(l,s);function o(){}function u(e,t,r){this.chunk=e;this.encoding=t;this.callback=r;this.next=null}function f(t,r){var n=e("./_stream_duplex");t=t||{};this.objectMode=!!t.objectMode;if(r instanceof n)this.objectMode=this.objectMode||!!t.writableObjectMode;var i=t.highWaterMark;var a=this.objectMode?16:16*1024;this.highWaterMark=i||i===0?i:a;this.highWaterMark=~~this.highWaterMark;this.needDrain=false;this.ending=false;this.ended=false;this.finished=false;var s=t.decodeStrings===false;this.decodeStrings=!s;this.defaultEncoding=t.defaultEncoding||"utf8";this.length=0;this.writing=false;this.corked=0;this.sync=true;this.bufferProcessing=false;this.onwrite=function(e){b(r,e)};this.writecb=null;this.writelen=0;this.bufferedRequest=null;this.lastBufferedRequest=null;this.pendingcb=0;this.prefinished=false;this.errorEmitted=false}f.prototype.getBuffer=function j(){var e=this.bufferedRequest;var t=[];while(e){t.push(e);e=e.next}return t};(function(){try{Object.defineProperty(f.prototype,"buffer",{get:e("util-deprecate")(function(){return this.getBuffer()},"_writableState.buffer is deprecated. Use "+"_writableState.getBuffer() instead.")})}catch(t){}})();function l(t){var r=e("./_stream_duplex");if(!(this instanceof l)&&!(this instanceof r))return new l(t);this._writableState=new f(t,this);this.writable=true;if(t){if(typeof t.write==="function")this._write=t.write;if(typeof t.writev==="function")this._writev=t.writev}s.call(this)}l.prototype.pipe=function(){this.emit("error",new Error("Cannot pipe. Not readable."))};function c(e,t){var r=new Error("write after end");e.emit("error",r);n(t,r)}function h(e,t,r,a){var s=true;if(!i.isBuffer(r)&&typeof r!=="string"&&r!==null&&r!==undefined&&!t.objectMode){var o=new TypeError("Invalid non-string/buffer chunk");e.emit("error",o);n(a,o);s=false}return s}l.prototype.write=function(e,t,r){var n=this._writableState;var a=false;if(typeof t==="function"){r=t;t=null}if(i.isBuffer(e))t="buffer";else if(!t)t=n.defaultEncoding;if(typeof r!=="function")r=o;if(n.ended)c(this,r);else if(h(this,n,e,r)){n.pendingcb++;a=d(this,n,e,t,r)}return a};l.prototype.cork=function(){var e=this._writableState;e.corked++};l.prototype.uncork=function(){var e=this._writableState;if(e.corked){e.corked--;if(!e.writing&&!e.corked&&!e.finished&&!e.bufferProcessing&&e.bufferedRequest)w(this,e)}};l.prototype.setDefaultEncoding=function k(e){if(typeof e==="string")e=e.toLowerCase();if(!(["hex","utf8","utf-8","ascii","binary","base64","ucs2","ucs-2","utf16le","utf-16le","raw"].indexOf((e+"").toLowerCase())>-1))throw new TypeError("Unknown encoding: "+e);this._writableState.defaultEncoding=e};function p(e,t,r){if(!e.objectMode&&e.decodeStrings!==false&&typeof t==="string"){t=new i(t,r)}return t}function d(e,t,r,n,a){r=p(t,r,n);if(i.isBuffer(r))n="buffer";var s=t.objectMode?1:r.length;t.length+=s;var o=t.length<t.highWaterMark;if(!o)t.needDrain=true;if(t.writing||t.corked){var f=t.lastBufferedRequest;t.lastBufferedRequest=new u(r,n,a);if(f){f.next=t.lastBufferedRequest}else{t.bufferedRequest=t.lastBufferedRequest}}else{g(e,t,false,s,r,n,a)}return o}function g(e,t,r,n,i,a,s){t.writelen=n;t.writecb=s;t.writing=true;t.sync=true;if(r)e._writev(i,t.onwrite);else e._write(i,a,t.onwrite);t.sync=false}function v(e,t,r,i,a){--t.pendingcb;if(r)n(a,i);else a(i);e._writableState.errorEmitted=true;e.emit("error",i)}function m(e){e.writing=false;e.writecb=null;e.length-=e.writelen;e.writelen=0}function b(e,t){var r=e._writableState;var i=r.sync;var a=r.writecb;m(r);if(t)v(e,r,i,t,a);else{var s=E(r);if(!s&&!r.corked&&!r.bufferProcessing&&r.bufferedRequest){w(e,r)}if(i){n(y,e,r,s,a)}else{y(e,r,s,a)}}}function y(e,t,r,n){if(!r)_(e,t);t.pendingcb--;n();x(e,t)}function _(e,t){if(t.length===0&&t.needDrain){t.needDrain=false;e.emit("drain")}}function w(e,t){t.bufferProcessing=true;var r=t.bufferedRequest;if(e._writev&&r&&r.next){var n=[];var i=[];while(r){i.push(r.callback);n.push(r);r=r.next}t.pendingcb++;t.lastBufferedRequest=null;g(e,t,true,t.length,n,"",function(e){for(var r=0;r<i.length;r++){t.pendingcb--;i[r](e)}})}else{while(r){var a=r.chunk;var s=r.encoding;var o=r.callback;var u=t.objectMode?1:a.length;g(e,t,false,u,a,s,o);r=r.next;if(t.writing){break}}if(r===null)t.lastBufferedRequest=null}t.bufferedRequest=r;t.bufferProcessing=false}l.prototype._write=function(e,t,r){r(new Error("not implemented"))};l.prototype._writev=null;l.prototype.end=function(e,t,r){var n=this._writableState;if(typeof e==="function"){r=e;e=null;t=null}else if(typeof t==="function"){r=t;t=null}if(e!==null&&e!==undefined)this.write(e,t);if(n.corked){n.corked=1;this.uncork()}if(!n.ending&&!n.finished)O(this,n,r)};function E(e){return e.ending&&e.length===0&&e.bufferedRequest===null&&!e.finished&&!e.writing}function S(e,t){if(!t.prefinished){t.prefinished=true;e.emit("prefinish")}}function x(e,t){var r=E(t);if(r){if(t.pendingcb===0){S(e,t);t.finished=true;e.emit("finish")}else{S(e,t)}}return r}function O(e,t,r){t.ending=true;x(e,t);if(r){if(t.finished)n(r);else e.once("finish",r)}t.ended=true}},{"./_stream_duplex":20,buffer:4,"core-util-is":25,events:9,inherits:10,"process-nextick-args":26,"util-deprecate":27}],25:[function(e,t,r){(function(e){function t(e){return Array.isArray(e)}r.isArray=t;function n(e){return typeof e==="boolean"}r.isBoolean=n;function i(e){return e===null}r.isNull=i;function a(e){return e==null}r.isNullOrUndefined=a;function s(e){return typeof e==="number"}r.isNumber=s;function o(e){return typeof e==="string"}r.isString=o;function u(e){return typeof e==="symbol"}r.isSymbol=u;function f(e){return e===void 0}r.isUndefined=f;function l(e){return c(e)&&m(e)==="[object RegExp]"}r.isRegExp=l;function c(e){return typeof e==="object"&&e!==null}r.isObject=c;function h(e){return c(e)&&m(e)==="[object Date]"}r.isDate=h;function p(e){return c(e)&&(m(e)==="[object Error]"||e instanceof Error)}r.isError=p;function d(e){return typeof e==="function"}r.isFunction=d;function g(e){return e===null||typeof e==="boolean"||typeof e==="number"||typeof e==="string"||typeof e==="symbol"||typeof e==="undefined"}r.isPrimitive=g;function v(t){return e.isBuffer(t)}r.isBuffer=v;function m(e){return Object.prototype.toString.call(e)}}).call(this,e("buffer").Buffer)},{buffer:4}],26:[function(e,t,r){(function(e){"use strict";t.exports=r;function r(t){var r=new Array(arguments.length-1);var n=0;while(n<arguments.length){r[n++]=arguments[n]}e.nextTick(function i(){t.apply(null,r)})}}).call(this,e("_process"))},{_process:14}],27:[function(e,t,r){(function(e){t.exports=r;function r(e,t){if(n("noDeprecation")){return e}var r=false;function i(){if(!r){if(n("throwDeprecation")){throw new Error(t)}else if(n("traceDeprecation")){console.trace(t)}else{console.warn(t)}r=true}return e.apply(this,arguments)}return i}function n(t){if(!e.localStorage)return false;var r=e.localStorage[t];if(null==r)return false;return String(r).toLowerCase()==="true"}}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}],28:[function(e,t,r){t.exports=e("./lib/_stream_passthrough.js")},{"./lib/_stream_passthrough.js":21}],29:[function(e,t,r){var n=function(){try{return e("st"+"ream")}catch(t){}}();r=t.exports=e("./lib/_stream_readable.js");r.Stream=n||r;r.Readable=r;r.Writable=e("./lib/_stream_writable.js");r.Duplex=e("./lib/_stream_duplex.js");r.Transform=e("./lib/_stream_transform.js");r.PassThrough=e("./lib/_stream_passthrough.js")},{"./lib/_stream_duplex.js":20,"./lib/_stream_passthrough.js":21,"./lib/_stream_readable.js":22,"./lib/_stream_transform.js":23,"./lib/_stream_writable.js":24}],30:[function(e,t,r){t.exports=e("./lib/_stream_transform.js")},{"./lib/_stream_transform.js":23}],31:[function(e,t,r){t.exports=e("./lib/_stream_writable.js")},{"./lib/_stream_writable.js":24}],32:[function(e,t,r){t.exports=a;var n=e("events").EventEmitter;var i=e("inherits");i(a,n);a.Readable=e("readable-stream/readable.js");a.Writable=e("readable-stream/writable.js");a.Duplex=e("readable-stream/duplex.js");a.Transform=e("readable-stream/transform.js");a.PassThrough=e("readable-stream/passthrough.js");a.Stream=a;function a(){n.call(this)}a.prototype.pipe=function(e,t){var r=this;function i(t){if(e.writable){if(false===e.write(t)&&r.pause){r.pause()}}}r.on("data",i);function a(){if(r.readable&&r.resume){r.resume()}}e.on("drain",a);if(!e._isStdio&&(!t||t.end!==false)){r.on("end",o);r.on("close",u)}var s=false;function o(){if(s)return;s=true;e.end()}function u(){if(s)return;s=true;if(typeof e.destroy==="function")e.destroy()}function f(e){l();if(n.listenerCount(this,"error")===0){throw e}}r.on("error",f);e.on("error",f);function l(){r.removeListener("data",i);e.removeListener("drain",a);r.removeListener("end",o);r.removeListener("close",u);r.removeListener("error",f);e.removeListener("error",f);r.removeListener("end",l);r.removeListener("close",l);e.removeListener("close",l)}r.on("end",l);r.on("close",l);e.on("close",l);e.emit("pipe",r);return e}},{events:9,inherits:10,"readable-stream/duplex.js":19,"readable-stream/passthrough.js":28,"readable-stream/readable.js":29,"readable-stream/transform.js":30,"readable-stream/writable.js":31}],33:[function(e,t,r){var n=e("./lib/request");var i=e("xtend");
var a=e("builtin-status-codes");var s=e("url");var o=r;o.request=function(e,t){if(typeof e==="string")e=s.parse(e);else e=i(e);var r=e.host?e.host.split(":")[0]:null;var a=e.host?parseInt(e.host.split(":")[1],10):null;e.method=e.method||"GET";e.headers=e.headers||{};e.path=e.path||"/";e.protocol=e.protocol||window.location.protocol;var o=e.hostname||r?e.protocol==="https:"?443:80:window.location.port;e.hostname=e.hostname||r||window.location.hostname;e.port=e.port||a||o;var u=new n(e);if(t)u.on("response",t);return u};o.get=function u(e,t){var r=o.request(e,t);r.end();return r};o.Agent=function(){};o.Agent.defaultMaxSockets=4;o.STATUS_CODES=a;o.METHODS=["CHECKOUT","CONNECT","COPY","DELETE","GET","HEAD","LOCK","M-SEARCH","MERGE","MKACTIVITY","MKCOL","MOVE","NOTIFY","OPTIONS","PATCH","POST","PROPFIND","PROPPATCH","PURGE","PUT","REPORT","SEARCH","SUBSCRIBE","TRACE","UNLOCK","UNSUBSCRIBE"]},{"./lib/request":35,"builtin-status-codes":37,url:44,xtend:47}],34:[function(e,t,r){r.fetch=u(window.fetch)&&u(window.ReadableByteStream);r.blobConstructor=false;try{new Blob([new ArrayBuffer(1)]);r.blobConstructor=true}catch(n){}var i=new window.XMLHttpRequest;i.open("GET","/");function a(e){try{i.responseType=e;return i.responseType===e}catch(t){}return false}var s=u(window.ArrayBuffer);var o=s&&u(window.ArrayBuffer.prototype.slice);r.arraybuffer=s&&a("arraybuffer");r.msstream=o&&a("ms-stream");r.mozchunkedarraybuffer=s&&a("moz-chunked-arraybuffer");r.overrideMimeType=u(i.overrideMimeType);r.vbArray=u(window.VBArray);function u(e){return typeof e==="function"}i=null},{}],35:[function(e,t,r){(function(r,n){var i=e("./capability");var a=e("foreach");var s=e("indexof");var o=e("inherits");var u=e("object-keys");var f=e("./response");var l=e("stream");var c=f.IncomingMessage;var h=f.readyStates;function p(e){if(i.fetch){return"fetch"}else if(i.mozchunkedarraybuffer){return"moz-chunked-arraybuffer"}else if(i.msstream){return"ms-stream"}else if(i.arraybuffer&&e){return"arraybuffer"}else if(i.vbArray&&e){return"text:vbarray"}else{return"text"}}var d=t.exports=function(e){var t=this;l.Writable.call(t);t._opts=e;t._url=e.protocol+"//"+e.hostname+":"+e.port+e.path;t._body=[];t._headers={};if(e.auth)t.setHeader("Authorization","Basic "+new n(e.auth).toString("base64"));a(u(e.headers),function(r){t.setHeader(r,e.headers[r])});var r;if(e.mode==="prefer-streaming"){r=false}else if(e.mode==="prefer-fast"){r=true}else if(!e.mode||e.mode==="default"){r=!i.overrideMimeType}else{throw new Error("Invalid value for opts.mode")}t._mode=p(r);t.on("finish",function(){t._onFinish()})};o(d,l.Writable);d.prototype.setHeader=function(e,t){var r=this;var n=e.toLowerCase();if(s(v,n)!==-1)return;r._headers[n]={name:e,value:t}};d.prototype.getHeader=function(e){var t=this;return t._headers[e.toLowerCase()].value};d.prototype.removeHeader=function(e){var t=this;delete t._headers[e.toLowerCase()]};d.prototype._onFinish=function(){var e=this;if(e._destroyed)return;var t=e._opts;var s=e._headers;var o;if(t.method==="POST"||t.method==="PUT"){if(i.blobConstructor){o=new window.Blob(e._body.map(function(e){return e.toArrayBuffer()}),{type:(s["content-type"]||{}).value||""})}else{o=n.concat(e._body).toString()}}if(e._mode==="fetch"){var f=u(s).map(function(e){return[s[e].name,s[e].value]});window.fetch(e._url,{method:e._opts.method,headers:f,body:o,mode:"cors",credentials:t.withCredentials?"include":"same-origin"}).then(function(t){e._fetchResponse=t;e._connect()}).then(undefined,function(t){e.emit("error",t)})}else{var l=e._xhr=new window.XMLHttpRequest;try{l.open(e._opts.method,e._url,true)}catch(c){r.nextTick(function(){e.emit("error",c)});return}if("responseType"in l)l.responseType=e._mode.split(":")[0];if("withCredentials"in l)l.withCredentials=!!t.withCredentials;if(e._mode==="text"&&"overrideMimeType"in l)l.overrideMimeType("text/plain; charset=x-user-defined");a(u(s),function(e){l.setRequestHeader(s[e].name,s[e].value)});e._response=null;l.onreadystatechange=function(){switch(l.readyState){case h.LOADING:case h.DONE:e._onXHRProgress();break}};if(e._mode==="moz-chunked-arraybuffer"){l.onprogress=function(){e._onXHRProgress()}}l.onerror=function(){if(e._destroyed)return;e.emit("error",new Error("XHR error"))};try{l.send(o)}catch(c){r.nextTick(function(){e.emit("error",c)});return}}};function g(e){try{return e.status!==null}catch(t){return false}}d.prototype._onXHRProgress=function(){var e=this;if(!g(e._xhr)||e._destroyed)return;if(!e._response)e._connect();e._response._onXHRProgress()};d.prototype._connect=function(){var e=this;if(e._destroyed)return;e._response=new c(e._xhr,e._fetchResponse,e._mode);e.emit("response",e._response)};d.prototype._write=function(e,t,r){var n=this;n._body.push(e);r()};d.prototype.abort=d.prototype.destroy=function(){var e=this;e._destroyed=true;if(e._response)e._response._destroyed=true;if(e._xhr)e._xhr.abort()};d.prototype.end=function(e,t,r){var n=this;if(typeof e==="function"){r=e;e=undefined}l.Writable.prototype.end.call(n,e,t,r)};d.prototype.flushHeaders=function(){};d.prototype.setTimeout=function(){};d.prototype.setNoDelay=function(){};d.prototype.setSocketKeepAlive=function(){};var v=["accept-charset","accept-encoding","access-control-request-headers","access-control-request-method","connection","content-length","cookie","cookie2","date","dnt","expect","host","keep-alive","origin","referer","te","trailer","transfer-encoding","upgrade","user-agent","via"]}).call(this,e("_process"),e("buffer").Buffer)},{"./capability":34,"./response":36,_process:14,buffer:4,foreach:38,indexof:39,inherits:10,"object-keys":40,stream:32}],36:[function(e,t,r){(function(t,n){var i=e("./capability");var a=e("foreach");var s=e("inherits");var o=e("stream");var u=r.readyStates={UNSENT:0,OPENED:1,HEADERS_RECEIVED:2,LOADING:3,DONE:4};var f=r.IncomingMessage=function(e,r,s){var u=this;o.Readable.call(u);u._mode=s;u.headers={};u.rawHeaders=[];u.trailers={};u.rawTrailers=[];u.on("end",function(){t.nextTick(function(){u.emit("close")})});if(s==="fetch"){u._fetchResponse=r;u.statusCode=r.status;u.statusMessage=r.statusText;for(var f,l,c=r.headers[Symbol.iterator]();f=(l=c.next()).value,!l.done;){u.headers[f[0].toLowerCase()]=f[1];u.rawHeaders.push(f[0],f[1])}var h=r.body.getReader();function p(){h.read().then(function(e){if(u._destroyed)return;if(e.done){u.push(null);return}u.push(new n(e.value));p()})}p()}else{u._xhr=e;u._pos=0;u.statusCode=e.status;u.statusMessage=e.statusText;var d=e.getAllResponseHeaders().split(/\r?\n/);a(d,function(e){var t=e.match(/^([^:]+):\s*(.*)/);if(t){var r=t[1].toLowerCase();if(u.headers[r]!==undefined)u.headers[r]+=", "+t[2];else u.headers[r]=t[2];u.rawHeaders.push(t[1],t[2])}});u._charset="x-user-defined";if(!i.overrideMimeType){var g=u.rawHeaders["mime-type"];if(g){var v=g.match(/;\s*charset=([^;])(;|$)/);if(v){u._charset=v[1].toLowerCase()}}if(!u._charset)u._charset="utf-8"}}};s(f,o.Readable);f.prototype._read=function(){};f.prototype._onXHRProgress=function(){var e=this;var t=e._xhr;var r=null;switch(e._mode){case"text:vbarray":if(t.readyState!==u.DONE)break;try{r=new window.VBArray(t.responseBody).toArray()}catch(i){}if(r!==null){e.push(new n(r));break}case"text":try{r=t.responseText}catch(i){e._mode="text:vbarray";break}if(r.length>e._pos){var a=r.substr(e._pos);if(e._charset==="x-user-defined"){var s=new n(a.length);for(var o=0;o<a.length;o++)s[o]=a.charCodeAt(o)&255;e.push(s)}else{e.push(a,e._charset)}e._pos=r.length}break;case"arraybuffer":if(t.readyState!==u.DONE)break;r=t.response;e.push(new n(new Uint8Array(r)));break;case"moz-chunked-arraybuffer":r=t.response;if(t.readyState!==u.LOADING||!r)break;e.push(new n(new Uint8Array(r)));break;case"ms-stream":r=t.response;if(t.readyState!==u.LOADING)break;var f=new window.MSStreamReader;f.onprogress=function(){if(f.result.byteLength>e._pos){e.push(new n(new Uint8Array(f.result.slice(e._pos))));e._pos=f.result.byteLength}};f.onload=function(){e.push(null)};f.readAsArrayBuffer(r);break}if(e._xhr.readyState===u.DONE&&e._mode!=="ms-stream"){e.push(null)}}}).call(this,e("_process"),e("buffer").Buffer)},{"./capability":34,_process:14,buffer:4,foreach:38,inherits:10,stream:32}],37:[function(e,t,r){t.exports={100:"Continue",101:"Switching Protocols",102:"Processing",200:"OK",201:"Created",202:"Accepted",203:"Non-Authoritative Information",204:"No Content",205:"Reset Content",206:"Partial Content",207:"Multi-Status",300:"Multiple Choices",301:"Moved Permanently",302:"Moved Temporarily",303:"See Other",304:"Not Modified",305:"Use Proxy",307:"Temporary Redirect",308:"Permanent Redirect",400:"Bad Request",401:"Unauthorized",402:"Payment Required",403:"Forbidden",404:"Not Found",405:"Method Not Allowed",406:"Not Acceptable",407:"Proxy Authentication Required",408:"Request Time-out",409:"Conflict",410:"Gone",411:"Length Required",412:"Precondition Failed",413:"Request Entity Too Large",414:"Request-URI Too Large",415:"Unsupported Media Type",416:"Requested Range Not Satisfiable",417:"Expectation Failed",418:"I'm a teapot",422:"Unprocessable Entity",423:"Locked",424:"Failed Dependency",425:"Unordered Collection",426:"Upgrade Required",428:"Precondition Required",429:"Too Many Requests",431:"Request Header Fields Too Large",500:"Internal Server Error",501:"Not Implemented",502:"Bad Gateway",503:"Service Unavailable",504:"Gateway Time-out",505:"HTTP Version Not Supported",506:"Variant Also Negotiates",507:"Insufficient Storage",509:"Bandwidth Limit Exceeded",510:"Not Extended",511:"Network Authentication Required"}},{}],38:[function(e,t,r){var n=Object.prototype.hasOwnProperty;var i=Object.prototype.toString;t.exports=function a(e,t,r){if(i.call(t)!=="[object Function]"){throw new TypeError("iterator must be a function")}var a=e.length;if(a===+a){for(var s=0;s<a;s++){t.call(r,e[s],s,e)}}else{for(var o in e){if(n.call(e,o)){t.call(r,e[o],o,e)}}}}},{}],39:[function(e,t,r){var n=[].indexOf;t.exports=function(e,t){if(n)return e.indexOf(t);for(var r=0;r<e.length;++r){if(e[r]===t)return r}return-1}},{}],40:[function(e,t,r){"use strict";var n=Object.prototype.hasOwnProperty;var i=Object.prototype.toString;var a=Array.prototype.slice;var s=e("./isArguments");var o=!{toString:null}.propertyIsEnumerable("toString");var u=function(){}.propertyIsEnumerable("prototype");var f=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"];var l=function c(e){var t=e!==null&&typeof e==="object";var r=i.call(e)==="[object Function]";var a=s(e);var l=t&&i.call(e)==="[object String]";var c=[];if(!t&&!r&&!a){throw new TypeError("Object.keys called on a non-object")}var h=u&&r;if(l&&e.length>0&&!n.call(e,0)){for(var p=0;p<e.length;++p){c.push(String(p))}}if(a&&e.length>0){for(var d=0;d<e.length;++d){c.push(String(d))}}else{for(var g in e){if(!(h&&g==="prototype")&&n.call(e,g)){c.push(String(g))}}}if(o){var v=e.constructor;var m=v&&v.prototype===e;for(var b=0;b<f.length;++b){if(!(m&&f[b]==="constructor")&&n.call(e,f[b])){c.push(f[b])}}}return c};l.shim=function h(){if(!Object.keys){Object.keys=l}else{var e=function(){return(Object.keys(arguments)||"").length===2}(1,2);if(!e){var t=Object.keys;Object.keys=function r(e){if(s(e)){return t(a.call(e))}else{return t(e)}}}}return Object.keys||l};t.exports=l},{"./isArguments":41}],41:[function(e,t,r){"use strict";var n=Object.prototype.toString;t.exports=function i(e){var t=n.call(e);var r=t==="[object Arguments]";if(!r){r=t!=="[object Array]"&&e!==null&&typeof e==="object"&&typeof e.length==="number"&&e.length>=0&&n.call(e.callee)==="[object Function]"}return r}},{}],42:[function(e,t,r){var n=e("buffer").Buffer;var i=n.isEncoding||function(e){switch(e&&e.toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":case"raw":return true;default:return false}};function a(e){if(e&&!i(e)){throw new Error("Unknown encoding: "+e)}}var s=r.StringDecoder=function(e){this.encoding=(e||"utf8").toLowerCase().replace(/[-_]/,"");a(e);switch(this.encoding){case"utf8":this.surrogateSize=3;break;case"ucs2":case"utf16le":this.surrogateSize=2;this.detectIncompleteChar=u;break;case"base64":this.surrogateSize=3;this.detectIncompleteChar=f;break;default:this.write=o;return}this.charBuffer=new n(6);this.charReceived=0;this.charLength=0};s.prototype.write=function(e){var t="";while(this.charLength){var r=e.length>=this.charLength-this.charReceived?this.charLength-this.charReceived:e.length;e.copy(this.charBuffer,this.charReceived,0,r);this.charReceived+=r;if(this.charReceived<this.charLength){return""}e=e.slice(r,e.length);t=this.charBuffer.slice(0,this.charLength).toString(this.encoding);var n=t.charCodeAt(t.length-1);if(n>=55296&&n<=56319){this.charLength+=this.surrogateSize;t="";continue}this.charReceived=this.charLength=0;if(e.length===0){return t}break}this.detectIncompleteChar(e);var i=e.length;if(this.charLength){e.copy(this.charBuffer,0,e.length-this.charReceived,i);i-=this.charReceived}t+=e.toString(this.encoding,0,i);var i=t.length-1;var n=t.charCodeAt(i);if(n>=55296&&n<=56319){var a=this.surrogateSize;this.charLength+=a;this.charReceived+=a;this.charBuffer.copy(this.charBuffer,a,0,a);e.copy(this.charBuffer,0,0,a);return t.substring(0,i)}return t};s.prototype.detectIncompleteChar=function(e){var t=e.length>=3?3:e.length;for(;t>0;t--){var r=e[e.length-t];if(t==1&&r>>5==6){this.charLength=2;break}if(t<=2&&r>>4==14){this.charLength=3;break}if(t<=3&&r>>3==30){this.charLength=4;break}}this.charReceived=t};s.prototype.end=function(e){var t="";if(e&&e.length)t=this.write(e);if(this.charReceived){var r=this.charReceived;var n=this.charBuffer;var i=this.encoding;t+=n.slice(0,r).toString(i)}return t};function o(e){return e.toString(this.encoding)}function u(e){this.charReceived=e.length%2;this.charLength=this.charReceived?2:0}function f(e){this.charReceived=e.length%3;this.charLength=this.charReceived?3:0}},{buffer:4}],43:[function(e,t,r){var n=e("process/browser.js").nextTick;var i=Function.prototype.apply;var a=Array.prototype.slice;var s={};var o=0;r.setTimeout=function(){return new u(i.call(setTimeout,window,arguments),clearTimeout)};r.setInterval=function(){return new u(i.call(setInterval,window,arguments),clearInterval)};r.clearTimeout=r.clearInterval=function(e){e.close()};function u(e,t){this._id=e;this._clearFn=t}u.prototype.unref=u.prototype.ref=function(){};u.prototype.close=function(){this._clearFn.call(window,this._id)};r.enroll=function(e,t){clearTimeout(e._idleTimeoutId);e._idleTimeout=t};r.unenroll=function(e){clearTimeout(e._idleTimeoutId);e._idleTimeout=-1};r._unrefActive=r.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;if(t>=0){e._idleTimeoutId=setTimeout(function r(){if(e._onTimeout)e._onTimeout()},t)}};r.setImmediate=typeof setImmediate==="function"?setImmediate:function(e){var t=o++;var i=arguments.length<2?false:a.call(arguments,1);s[t]=true;n(function u(){if(s[t]){if(i){e.apply(null,i)}else{e.call(null)}r.clearImmediate(t)}});return t};r.clearImmediate=typeof clearImmediate==="function"?clearImmediate:function(e){delete s[e]}},{"process/browser.js":14}],44:[function(e,t,r){var n=e("punycode");r.parse=y;r.resolve=w;r.resolveObject=E;r.format=_;r.Url=i;function i(){this.protocol=null;this.slashes=null;this.auth=null;this.host=null;this.port=null;this.hostname=null;this.hash=null;this.search=null;this.query=null;this.pathname=null;this.path=null;this.href=null}var a=/^([a-z0-9.+-]+:)/i,s=/:[0-9]*$/,o=["<",">",'"',"`"," ","\r","\n","	"],u=["{","}","|","\\","^","`"].concat(o),f=["'"].concat(u),l=["%","/","?",";","#"].concat(f),c=["/","?","#"],h=255,p=/^[a-z0-9A-Z_-]{0,63}$/,d=/^([a-z0-9A-Z_-]{0,63})(.*)$/,g={javascript:true,"javascript:":true},v={javascript:true,"javascript:":true},m={http:true,https:true,ftp:true,gopher:true,file:true,"http:":true,"https:":true,"ftp:":true,"gopher:":true,"file:":true},b=e("querystring");function y(e,t,r){if(e&&x(e)&&e instanceof i)return e;var n=new i;n.parse(e,t,r);return n}i.prototype.parse=function(e,t,r){if(!S(e)){throw new TypeError("Parameter 'url' must be a string, not "+typeof e)}var i=e;i=i.trim();var s=a.exec(i);if(s){s=s[0];var o=s.toLowerCase();this.protocol=o;i=i.substr(s.length)}if(r||s||i.match(/^\/\/[^@\/]+@[^@\/]+/)){var u=i.substr(0,2)==="//";if(u&&!(s&&v[s])){i=i.substr(2);this.slashes=true}}if(!v[s]&&(u||s&&!m[s])){var y=-1;for(var _=0;_<c.length;_++){var w=i.indexOf(c[_]);if(w!==-1&&(y===-1||w<y))y=w}var E,x;if(y===-1){x=i.lastIndexOf("@")}else{x=i.lastIndexOf("@",y)}if(x!==-1){E=i.slice(0,x);i=i.slice(x+1);this.auth=decodeURIComponent(E)}y=-1;for(var _=0;_<l.length;_++){var w=i.indexOf(l[_]);if(w!==-1&&(y===-1||w<y))y=w}if(y===-1)y=i.length;this.host=i.slice(0,y);i=i.slice(y);this.parseHost();this.hostname=this.hostname||"";var O=this.hostname[0]==="["&&this.hostname[this.hostname.length-1]==="]";if(!O){var j=this.hostname.split(/\./);for(var _=0,k=j.length;_<k;_++){var A=j[_];if(!A)continue;if(!A.match(p)){var R="";for(var L=0,T=A.length;L<T;L++){if(A.charCodeAt(L)>127){R+="x"}else{R+=A[L]}}if(!R.match(p)){var I=j.slice(0,_);var M=j.slice(_+1);var C=A.match(d);if(C){I.push(C[1]);M.unshift(C[2])}if(M.length){i="/"+M.join(".")+i}this.hostname=I.join(".");break}}}}if(this.hostname.length>h){this.hostname=""}else{this.hostname=this.hostname.toLowerCase()}if(!O){var P=this.hostname.split(".");var N=[];for(var _=0;_<P.length;++_){var D=P[_];N.push(D.match(/[^A-Za-z0-9_-]/)?"xn--"+n.encode(D):D)}this.hostname=N.join(".")}var B=this.port?":"+this.port:"";var U=this.hostname||"";this.host=U+B;this.href+=this.host;if(O){this.hostname=this.hostname.substr(1,this.hostname.length-2);if(i[0]!=="/"){i="/"+i}}}if(!g[o]){for(var _=0,k=f.length;_<k;_++){var F=f[_];var q=encodeURIComponent(F);if(q===F){q=escape(F)}i=i.split(F).join(q)}}var G=i.indexOf("#");if(G!==-1){this.hash=i.substr(G);i=i.slice(0,G)}var W=i.indexOf("?");if(W!==-1){this.search=i.substr(W);this.query=i.substr(W+1);if(t){this.query=b.parse(this.query)}i=i.slice(0,W)}else if(t){this.search="";this.query={}}if(i)this.pathname=i;if(m[o]&&this.hostname&&!this.pathname){this.pathname="/"}if(this.pathname||this.search){var B=this.pathname||"";var D=this.search||"";this.path=B+D}this.href=this.format();return this};function _(e){if(S(e))e=y(e);if(!(e instanceof i))return i.prototype.format.call(e);return e.format()}i.prototype.format=function(){var e=this.auth||"";if(e){e=encodeURIComponent(e);e=e.replace(/%3A/i,":");e+="@"}var t=this.protocol||"",r=this.pathname||"",n=this.hash||"",i=false,a="";if(this.host){i=e+this.host}else if(this.hostname){i=e+(this.hostname.indexOf(":")===-1?this.hostname:"["+this.hostname+"]");if(this.port){i+=":"+this.port}}if(this.query&&x(this.query)&&Object.keys(this.query).length){a=b.stringify(this.query)}var s=this.search||a&&"?"+a||"";if(t&&t.substr(-1)!==":")t+=":";if(this.slashes||(!t||m[t])&&i!==false){i="//"+(i||"");if(r&&r.charAt(0)!=="/")r="/"+r}else if(!i){i=""}if(n&&n.charAt(0)!=="#")n="#"+n;if(s&&s.charAt(0)!=="?")s="?"+s;r=r.replace(/[?#]/g,function(e){return encodeURIComponent(e)});s=s.replace("#","%23");return t+i+r+s+n};function w(e,t){return y(e,false,true).resolve(t)}i.prototype.resolve=function(e){return this.resolveObject(y(e,false,true)).format()};function E(e,t){if(!e)return t;return y(e,false,true).resolveObject(t)}i.prototype.resolveObject=function(e){if(S(e)){var t=new i;t.parse(e,false,true);e=t}var r=new i;Object.keys(this).forEach(function(e){r[e]=this[e]},this);r.hash=e.hash;if(e.href===""){r.href=r.format();return r}if(e.slashes&&!e.protocol){Object.keys(e).forEach(function(t){if(t!=="protocol")r[t]=e[t]});if(m[r.protocol]&&r.hostname&&!r.pathname){r.path=r.pathname="/"}r.href=r.format();return r}if(e.protocol&&e.protocol!==r.protocol){if(!m[e.protocol]){Object.keys(e).forEach(function(t){r[t]=e[t]});r.href=r.format();return r}r.protocol=e.protocol;if(!e.host&&!v[e.protocol]){var n=(e.pathname||"").split("/");while(n.length&&!(e.host=n.shift()));if(!e.host)e.host="";if(!e.hostname)e.hostname="";if(n[0]!=="")n.unshift("");if(n.length<2)n.unshift("");r.pathname=n.join("/")}else{r.pathname=e.pathname}r.search=e.search;r.query=e.query;r.host=e.host||"";r.auth=e.auth;r.hostname=e.hostname||e.host;r.port=e.port;if(r.pathname||r.search){var a=r.pathname||"";var s=r.search||"";r.path=a+s}r.slashes=r.slashes||e.slashes;r.href=r.format();return r}var o=r.pathname&&r.pathname.charAt(0)==="/",u=e.host||e.pathname&&e.pathname.charAt(0)==="/",f=u||o||r.host&&e.pathname,l=f,c=r.pathname&&r.pathname.split("/")||[],n=e.pathname&&e.pathname.split("/")||[],h=r.protocol&&!m[r.protocol];if(h){r.hostname="";r.port=null;if(r.host){if(c[0]==="")c[0]=r.host;else c.unshift(r.host)}r.host="";if(e.protocol){e.hostname=null;e.port=null;if(e.host){if(n[0]==="")n[0]=e.host;else n.unshift(e.host)}e.host=null}f=f&&(n[0]===""||c[0]==="")}if(u){r.host=e.host||e.host===""?e.host:r.host;r.hostname=e.hostname||e.hostname===""?e.hostname:r.hostname;r.search=e.search;r.query=e.query;c=n}else if(n.length){if(!c)c=[];c.pop();c=c.concat(n);r.search=e.search;r.query=e.query}else if(!j(e.search)){if(h){r.hostname=r.host=c.shift();var p=r.host&&r.host.indexOf("@")>0?r.host.split("@"):false;if(p){r.auth=p.shift();r.host=r.hostname=p.shift()}}r.search=e.search;r.query=e.query;if(!O(r.pathname)||!O(r.search)){r.path=(r.pathname?r.pathname:"")+(r.search?r.search:"")}r.href=r.format();return r}if(!c.length){r.pathname=null;if(r.search){r.path="/"+r.search}else{r.path=null}r.href=r.format();return r}var d=c.slice(-1)[0];var g=(r.host||e.host)&&(d==="."||d==="..")||d==="";var b=0;for(var y=c.length;y>=0;y--){d=c[y];if(d=="."){c.splice(y,1)}else if(d===".."){c.splice(y,1);b++}else if(b){c.splice(y,1);b--}}if(!f&&!l){for(;b--;b){c.unshift("..")}}if(f&&c[0]!==""&&(!c[0]||c[0].charAt(0)!=="/")){c.unshift("")}if(g&&c.join("/").substr(-1)!=="/"){c.push("")}var _=c[0]===""||c[0]&&c[0].charAt(0)==="/";if(h){r.hostname=r.host=_?"":c.length?c.shift():"";var p=r.host&&r.host.indexOf("@")>0?r.host.split("@"):false;if(p){r.auth=p.shift();r.host=r.hostname=p.shift()}}f=f||r.host&&c.length;if(f&&!_){c.unshift("")}if(!c.length){r.pathname=null;r.path=null}else{r.pathname=c.join("/")}if(!O(r.pathname)||!O(r.search)){r.path=(r.pathname?r.pathname:"")+(r.search?r.search:"")}r.auth=e.auth||r.auth;r.slashes=r.slashes||e.slashes;r.href=r.format();return r};i.prototype.parseHost=function(){var e=this.host;var t=s.exec(e);if(t){t=t[0];if(t!==":"){this.port=t.substr(1)}e=e.substr(0,e.length-t.length)}if(e)this.hostname=e};function S(e){return typeof e==="string"}function x(e){return typeof e==="object"&&e!==null}function O(e){return e===null}function j(e){return e==null}},{punycode:15,querystring:18}],45:[function(e,t,r){t.exports=function n(e){return e&&typeof e==="object"&&typeof e.copy==="function"&&typeof e.fill==="function"&&typeof e.readUInt8==="function"}},{}],46:[function(e,t,r){(function(t,n){var i=/%[sdj%]/g;r.format=function(e){if(!E(e)){var t=[];for(var r=0;r<arguments.length;r++){t.push(o(arguments[r]))}return t.join(" ")}var r=1;var n=arguments;var a=n.length;var s=String(e).replace(i,function(e){if(e==="%%")return"%";if(r>=a)return e;switch(e){case"%s":return String(n[r++]);case"%d":return Number(n[r++]);case"%j":try{return JSON.stringify(n[r++])}catch(t){return"[Circular]"}default:return e}});for(var u=n[r];r<a;u=n[++r]){if(y(u)||!j(u)){s+=" "+u}else{s+=" "+o(u)}}return s};r.deprecate=function(e,i){if(x(n.process)){return function(){return r.deprecate(e,i).apply(this,arguments)}}if(t.noDeprecation===true){return e}var a=false;function s(){if(!a){if(t.throwDeprecation){throw new Error(i)}else if(t.traceDeprecation){console.trace(i)}else{console.error(i)}a=true}return e.apply(this,arguments)}return s};var a={};var s;r.debuglog=function(e){if(x(s))s=t.env.NODE_DEBUG||"";e=e.toUpperCase();if(!a[e]){if(new RegExp("\\b"+e+"\\b","i").test(s)){var n=t.pid;a[e]=function(){var t=r.format.apply(r,arguments);console.error("%s %d: %s",e,n,t)}}else{a[e]=function(){}}}return a[e]};function o(e,t){var n={seen:[],stylize:f};if(arguments.length>=3)n.depth=arguments[2];if(arguments.length>=4)n.colors=arguments[3];if(b(t)){n.showHidden=t}else if(t){r._extend(n,t)}if(x(n.showHidden))n.showHidden=false;if(x(n.depth))n.depth=2;if(x(n.colors))n.colors=false;if(x(n.customInspect))n.customInspect=true;if(n.colors)n.stylize=u;return c(n,e,n.depth)}r.inspect=o;o.colors={bold:[1,22],italic:[3,23],underline:[4,24],inverse:[7,27],white:[37,39],grey:[90,39],black:[30,39],blue:[34,39],cyan:[36,39],green:[32,39],magenta:[35,39],red:[31,39],yellow:[33,39]};o.styles={special:"cyan",number:"yellow","boolean":"yellow",undefined:"grey","null":"bold",string:"green",date:"magenta",regexp:"red"};function u(e,t){var r=o.styles[t];if(r){return"["+o.colors[r][0]+"m"+e+"["+o.colors[r][1]+"m"}else{return e}}function f(e,t){return e}function l(e){var t={};e.forEach(function(e,r){t[e]=true});return t}function c(e,t,n){if(e.customInspect&&t&&R(t.inspect)&&t.inspect!==r.inspect&&!(t.constructor&&t.constructor.prototype===t)){var i=t.inspect(n,e);if(!E(i)){i=c(e,i,n)}return i}var a=h(e,t);if(a){return a}var s=Object.keys(t);var o=l(s);if(e.showHidden){s=Object.getOwnPropertyNames(t)}if(A(t)&&(s.indexOf("message")>=0||s.indexOf("description")>=0)){return p(t)}if(s.length===0){if(R(t)){var u=t.name?": "+t.name:"";return e.stylize("[Function"+u+"]","special")}if(O(t)){return e.stylize(RegExp.prototype.toString.call(t),"regexp")}if(k(t)){return e.stylize(Date.prototype.toString.call(t),"date")}if(A(t)){return p(t)}}var f="",b=false,y=["{","}"];if(m(t)){b=true;y=["[","]"]}if(R(t)){var _=t.name?": "+t.name:"";f=" [Function"+_+"]"}if(O(t)){f=" "+RegExp.prototype.toString.call(t)}if(k(t)){f=" "+Date.prototype.toUTCString.call(t)}if(A(t)){f=" "+p(t)}if(s.length===0&&(!b||t.length==0)){return y[0]+f+y[1]}if(n<0){if(O(t)){return e.stylize(RegExp.prototype.toString.call(t),"regexp")}else{return e.stylize("[Object]","special")}}e.seen.push(t);var w;if(b){w=d(e,t,n,o,s)}else{w=s.map(function(r){return g(e,t,n,o,r,b)})}e.seen.pop();return v(w,f,y)}function h(e,t){if(x(t))return e.stylize("undefined","undefined");if(E(t)){var r="'"+JSON.stringify(t).replace(/^"|"$/g,"").replace(/'/g,"\\'").replace(/\\"/g,'"')+"'";return e.stylize(r,"string")}if(w(t))return e.stylize(""+t,"number");if(b(t))return e.stylize(""+t,"boolean");if(y(t))return e.stylize("null","null")}function p(e){return"["+Error.prototype.toString.call(e)+"]"}function d(e,t,r,n,i){var a=[];for(var s=0,o=t.length;s<o;++s){if(P(t,String(s))){a.push(g(e,t,r,n,String(s),true))}else{a.push("")}}i.forEach(function(i){if(!i.match(/^\d+$/)){a.push(g(e,t,r,n,i,true))}});return a}function g(e,t,r,n,i,a){var s,o,u;u=Object.getOwnPropertyDescriptor(t,i)||{value:t[i]};if(u.get){if(u.set){o=e.stylize("[Getter/Setter]","special")}else{o=e.stylize("[Getter]","special")}}else{if(u.set){o=e.stylize("[Setter]","special")}}if(!P(n,i)){s="["+i+"]"}if(!o){if(e.seen.indexOf(u.value)<0){if(y(r)){o=c(e,u.value,null)}else{o=c(e,u.value,r-1)}if(o.indexOf("\n")>-1){if(a){o=o.split("\n").map(function(e){return"  "+e}).join("\n").substr(2)}else{o="\n"+o.split("\n").map(function(e){return"   "+e}).join("\n")}}}else{o=e.stylize("[Circular]","special")}}if(x(s)){if(a&&i.match(/^\d+$/)){return o}s=JSON.stringify(""+i);if(s.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)){s=s.substr(1,s.length-2);s=e.stylize(s,"name")}else{s=s.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'");s=e.stylize(s,"string")}}return s+": "+o}function v(e,t,r){var n=0;var i=e.reduce(function(e,t){n++;if(t.indexOf("\n")>=0)n++;return e+t.replace(/\u001b\[\d\d?m/g,"").length+1},0);if(i>60){return r[0]+(t===""?"":t+"\n ")+" "+e.join(",\n  ")+" "+r[1]}return r[0]+t+" "+e.join(", ")+" "+r[1]}function m(e){return Array.isArray(e)}r.isArray=m;function b(e){return typeof e==="boolean"}r.isBoolean=b;function y(e){return e===null}r.isNull=y;function _(e){return e==null}r.isNullOrUndefined=_;function w(e){return typeof e==="number"}r.isNumber=w;function E(e){return typeof e==="string"}r.isString=E;function S(e){return typeof e==="symbol"}r.isSymbol=S;function x(e){return e===void 0}r.isUndefined=x;function O(e){return j(e)&&T(e)==="[object RegExp]"}r.isRegExp=O;function j(e){return typeof e==="object"&&e!==null}r.isObject=j;function k(e){return j(e)&&T(e)==="[object Date]"}r.isDate=k;function A(e){return j(e)&&(T(e)==="[object Error]"||e instanceof Error)}r.isError=A;function R(e){return typeof e==="function"}r.isFunction=R;function L(e){return e===null||typeof e==="boolean"||typeof e==="number"||typeof e==="string"||typeof e==="symbol"||typeof e==="undefined"}r.isPrimitive=L;r.isBuffer=e("./support/isBuffer");function T(e){return Object.prototype.toString.call(e)}function I(e){return e<10?"0"+e.toString(10):e.toString(10)}var M=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function C(){var e=new Date;var t=[I(e.getHours()),I(e.getMinutes()),I(e.getSeconds())].join(":");return[e.getDate(),M[e.getMonth()],t].join(" ")}r.log=function(){console.log("%s - %s",C(),r.format.apply(r,arguments))};r.inherits=e("inherits");r._extend=function(e,t){if(!t||!j(t))return e;var r=Object.keys(t);var n=r.length;while(n--){e[r[n]]=t[r[n]]}return e};function P(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}).call(this,e("_process"),typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"./support/isBuffer":45,_process:14,inherits:10}],47:[function(e,t,r){t.exports=n;function n(){var e={};for(var t=0;t<arguments.length;t++){var r=arguments[t];for(var n in r){if(r.hasOwnProperty(n)){e[n]=r[n]}}}return e}},{}],48:[function(e,t,r){"use strict";var n=e("readable-stream/passthrough");t.exports=function(){var e=[];var t=new n({objectMode:true});t.setMaxListeners(0);t.add=r;t.isEmpty=i;t.on("unpipe",a);Array.prototype.slice.call(arguments).forEach(r);return t;function r(n){if(Array.isArray(n)){n.forEach(r);return this}e.push(n);n.once("end",a.bind(null,n));n.pipe(t,{end:false});return this}function i(){return e.length==0}function a(r){e=e.filter(function(e){return e!==r});if(!e.length&&t.readable){t.end()}}}},{"readable-stream/passthrough":60}],49:[function(e,t,r){arguments[4][20][0].apply(r,arguments)},{"./_stream_readable":51,"./_stream_writable":53,"core-util-is":54,dup:20,inherits:55,"process-nextick-args":57}],50:[function(e,t,r){arguments[4][21][0].apply(r,arguments)},{"./_stream_transform":52,"core-util-is":54,dup:21,inherits:55}],51:[function(e,t,r){arguments[4][22][0].apply(r,arguments)},{"./_stream_duplex":49,_process:14,buffer:4,"core-util-is":54,dup:22,events:9,inherits:55,isarray:56,"process-nextick-args":57,"string_decoder/":58,util:3}],52:[function(e,t,r){arguments[4][23][0].apply(r,arguments)},{"./_stream_duplex":49,"core-util-is":54,dup:23,inherits:55}],53:[function(e,t,r){arguments[4][24][0].apply(r,arguments)},{"./_stream_duplex":49,buffer:4,"core-util-is":54,dup:24,events:9,inherits:55,"process-nextick-args":57,"util-deprecate":59}],54:[function(e,t,r){arguments[4][25][0].apply(r,arguments)},{buffer:4,dup:25}],55:[function(e,t,r){arguments[4][10][0].apply(r,arguments)},{dup:10}],56:[function(e,t,r){arguments[4][11][0].apply(r,arguments)},{dup:11}],57:[function(e,t,r){arguments[4][26][0].apply(r,arguments)},{_process:14,dup:26}],58:[function(e,t,r){arguments[4][42][0].apply(r,arguments)},{buffer:4,dup:42}],59:[function(e,t,r){arguments[4][27][0].apply(r,arguments)},{dup:27}],60:[function(e,t,r){arguments[4][28][0].apply(r,arguments)},{"./lib/_stream_passthrough.js":50,dup:28}],61:[function(e,t,r){(function(r){var n=e("lodash.map");var i=e("lodash.filter");var a=console.log;var s=e("./convert");var o=e("./protocols");var u=t.exports={stringToStringTuples:f,stringTuplesToString:l,tuplesToStringTuples:h,stringTuplesToTuples:c,bufferToTuples:d,tuplesToBuffer:p,bufferToString:g,stringToBuffer:v,fromString:m,fromBuffer:b,validateBuffer:y,isValidBuffer:_,cleanPath:w,ParseError:E,protoFromTuple:S};
function f(e){var t=[];var r=e.split("/").slice(1);if(r.length==1&&r[0]=="")return[];for(var n=0;n<r.length;n++){var i=r[n];var a=o(i);if(a.size==0)return[i];n++;if(n>=r.length)throw E("invalid address: "+e);t.push([i,r[n]])}return t}function l(e){var t=[];n(e,function(e){var r=S(e);t.push(r.name);if(e.length>1)t.push(e[1])});return"/"+t.join("/")}function c(e){return n(e,function(e){var t=S(e);if(e.length>1)return[t.code,s.toBuffer(t.code,e[1])];return[t.code]})}function h(e){return n(e,function(e){var t=S(e);if(e.length>1)return[t.code,s.toString(t.code,e[1])];return[t.code]})}function p(e){return b(r.concat(n(e,function(e){var t=S(e);var n=new r([t.code]);if(e.length>1)n=r.concat([n,e[1]]);return n})))}function d(e){var t=[];for(var r=0;r<e.length;){var n=e[r];var i=o(n);if(!i)throw E("Invalid protocol code: "+n);var a=i.size/8;var n=0+e[r];var s=e.slice(r+1,r+1+a);r+=1+a;if(r>e.length)throw E("Invalid address buffer: "+e.toString("hex"));t.push([n,s])}return t}function g(e){var t=d(e);var r=h(t);return l(r)}function v(e){e=w(e);var t=f(e);var r=c(t);return p(r)}function m(e){return v(e)}function b(e){var t=y(e);if(t)throw t;return new r(e)}function y(e){d(e)}function _(e){try{y(e);return true}catch(t){return false}}function w(e){return"/"+i(e.trim().split("/")).join("/")}function E(e){return new Error("Error parsing address: "+e)}function S(e){var t=o(e[0]);if(e.length>1&&t.size==0)throw E("tuple has address but protocol size is 0");return t}}).call(this,e("buffer").Buffer)},{"./convert":62,"./protocols":195,buffer:4,"lodash.filter":66,"lodash.map":130}],62:[function(e,t,r){(function(r){var n=e("ip");var i=e("./protocols");t.exports=a;function a(e,t){if(t instanceof r)return a.toString(e,t);else return a.toBuffer(e,t)}a.toString=function u(e,t){e=i(e);switch(e.code){case 4:case 41:return n.toString(t);case 6:case 17:case 33:case 132:return o(t)}return t.toString("hex")};a.toBuffer=function f(e,t){e=i(e);switch(e.code){case 4:case 41:return n.toBuffer(t);case 6:case 17:case 33:case 132:return s(parseInt(t,10))}return new r(t,"hex")};function s(e){var t=new r(2);t.writeUInt16BE(e,0);return t}function o(e){return e.readUInt16BE(0)}}).call(this,e("buffer").Buffer)},{"./protocols":195,buffer:4,ip:65}],63:[function(e,t,r){(function(r){var n=e("lodash.map");var i=e("xtend");var a=e("./codec");var s=e("buffer-equal");var o=e("./protocols");var u=new Error("Sorry, Not Implemented Yet.");t.exports=f;function f(e){if(!(this instanceof f))return new f(e);if(!e)e="";if(e instanceof r)this.buffer=a.fromBuffer(e);else if(typeof e=="string"||e instanceof String)this.buffer=a.fromString(e);else if(e.buffer&&e.protos&&e.protoCodes)this.buffer=a.fromBuffer(e.buffer);else throw new Error("addr must be a string, Buffer, or Multiaddr")}f.prototype.toString=function l(){return a.bufferToString(this.buffer)};f.prototype.toOptions=function c(){var e={};var t=this.toString().split("/");e.family=t[1]==="ip4"?"ipv4":"ipv6";e.host=t[2];e.port=t[4];return e};f.prototype.inspect=function h(){return"<Mutliaddr "+this.buffer.toString("hex")+" - "+a.bufferToString(this.buffer)+">"};f.prototype.protos=function p(){return n(this.protoCodes(),function(e){return i(o(e))})};f.prototype.protos=function d(){return n(this.protoCodes(),function(e){return i(o(e))})};f.prototype.protoCodes=function g(){var e=[];for(var t=0;t<this.buffer.length;t++){var r=0+this.buffer[t];var n=o(r).size/8;t+=n;e.push(r)}return e};f.prototype.protoNames=function v(){return n(this.protos(),function(e){return e.name})};f.prototype.tuples=function m(){return a.bufferToTuples(this.buffer)};f.prototype.stringTuples=function b(){var e=a.bufferToTuples(this.buffer);return a.tuplesToStringTuples(e)};f.prototype.encapsulate=function y(e){e=f(e);return f(this.toString()+e.toString())};f.prototype.decapsulate=function _(e){e=e.toString();var t=this.toString();var r=t.lastIndexOf(e);if(r<0)throw new Error("Address "+this+" does not contain subaddress: "+e);return f(t.slice(0,r))};f.prototype.equals=function w(e){return s(this.buffer,e.buffer)};f.prototype.nodeAddress=function E(){if(!this.isThinWaistAddress())throw new Error('Multiaddr must be "thin waist" address for nodeAddress.');var e=this.protoCodes();var t=this.toString().split("/").slice(1);return{family:e[0]==41?"IPv6":"IPv4",address:t[1],port:t[3]}};f.fromNodeAddress=function S(e,t){if(!e)throw new Error("requires node address object");if(!t)throw new Error("requires transport protocol");var r=e.family=="IPv6"?"ip6":"ip4";return f("/"+[r,e.address,t,e.port].join("/"))};f.prototype.isThinWaistAddress=function x(e){var t=(e||this).protos();if(t.length!=2)return false;if(t[0].code!=4&&t[0].code!=41)return false;if(t[1].code!=6&&t[1].code!=17)return false;return true};f.prototype.fromStupidString=function O(e){throw u};f.protocols=o}).call(this,e("buffer").Buffer)},{"./codec":61,"./protocols":195,buffer:4,"buffer-equal":64,"lodash.map":130,xtend:194}],64:[function(e,t,r){var n=e("buffer").Buffer;t.exports=function(e,t){if(!n.isBuffer(e))return undefined;if(!n.isBuffer(t))return undefined;if(typeof e.equals==="function")return e.equals(t);if(e.length!==t.length)return false;for(var r=0;r<e.length;r++){if(e[r]!==t[r])return false}return true}},{buffer:4}],65:[function(e,t,r){var n=r,i=e("buffer").Buffer,a=e("os");n.toBuffer=function o(e,t,r){r=~~r;var n;if(/^(\d{1,3}\.){3,3}\d{1,3}$/.test(e)){n=t||new i(r+4);e.split(/\./g).map(function(e){n[r++]=parseInt(e,10)&255})}else if(/^[a-f0-9:]+$/.test(e)){var a=e.split(/::/g,2),s=(a[0]||"").split(/:/g,8),o=(a[1]||"").split(/:/g,8);if(o.length===0){while(s.length<8)s.push("0000")}else if(s.length===0){while(o.length<8)o.unshift("0000")}else{while(s.length+o.length<8)s.push("0000")}n=t||new i(r+16);s.concat(o).map(function(e){e=parseInt(e,16);n[r++]=e>>8&255;n[r++]=e&255})}else{throw Error("Invalid ip address: "+e)}return n};n.toString=function u(e,t,r){t=~~t;r=r||e.length-t;var n=[];if(r===4){for(var i=0;i<r;i++){n.push(e[t+i])}n=n.join(".")}else if(r===16){for(var i=0;i<r;i+=2){n.push(e.readUInt16BE(t+i).toString(16))}n=n.join(":");n=n.replace(/(^|:)0(:0)*:0(:|$)/,"$1::$3");n=n.replace(/:{3,4}/,"::")}return n};n.fromPrefixLen=function f(e,t){if(e>32){t="ipv6"}else{t=s(t)}var r=4;if(t==="ipv6"){r=16}var a=new i(r);for(var o=0,u=a.length;o<u;++o){var f=8;if(e<8){f=e}e-=f;a[o]=~(255>>f)}return n.toString(a)};n.mask=function l(e,l){e=n.toBuffer(e);l=n.toBuffer(l);var t=new i(Math.max(e.length,l.length));if(e.length===l.length){for(var r=0;r<e.length;r++){t[r]=e[r]&l[r]}}else if(l.length===4){for(var r=0;r<l.length;r++){t[r]=e[e.length-4+r]&l[r]}}else{for(var r=0;r<t.length-6;r++){t[r]=0}t[10]=255;t[11]=255;for(var r=0;r<e.length;r++){t[r+12]=e[r]&l[r+12]}}return n.toString(t)};n.cidr=function c(e){var t=e.split("/");if(t.length!=2)throw new Error("invalid CIDR subnet: "+r);var r=t[0];var i=n.fromPrefixLen(parseInt(t[1],10));return n.mask(r,i)};n.subnet=function h(e,t){var r=n.toLong(n.mask(e,t));var i=n.toBuffer(t);var a=0;for(var s=0;s<i.length;s++){if(i[s]==255){a+=8}else{var o=i[s]&255;while(o){o=o<<1&255;a++}}}var u=Math.pow(2,32-a);return{networkAddress:n.fromLong(r),firstAddress:u<=2?n.fromLong(r):n.fromLong(r+1),lastAddress:u<=2?n.fromLong(r+u-1):n.fromLong(r+u-2),broadcastAddress:n.fromLong(r+u-1),subnetMask:t,subnetMaskLength:a,numHosts:u<=2?u:u-2,length:u}};n.cidrSubnet=function p(e){var t=e.split("/");if(t.length!==2)throw new Error("invalid CIDR subnet: "+r);var r=t[0];var i=n.fromPrefixLen(parseInt(t[1],10));return n.subnet(r,i)};n.not=function d(e){var t=n.toBuffer(e);for(var r=0;r<t.length;r++){t[r]=255^t[r]}return n.toString(t)};n.or=function g(e,t){e=n.toBuffer(e);t=n.toBuffer(t);if(e.length==t.length){for(var r=0;r<e.length;++r){e[r]|=t[r]}return n.toString(e)}else{var i=e;var a=t;if(t.length>e.length){i=t;a=e}var s=i.length-a.length;for(var r=s;r<i.length;++r){i[r]|=a[r-s]}return n.toString(i)}};n.isEqual=function v(e,t){e=n.toBuffer(e);t=n.toBuffer(t);if(e.length===t.length){for(var r=0;r<e.length;r++){if(e[r]!==t[r])return false}return true}if(t.length===4){var i=t;t=e;e=i}for(var r=0;r<10;r++){if(t[r]!==0)return false}var a=t.readUInt16BE(10);if(a!==0&&a!==65535)return false;for(var r=0;r<4;r++){if(e[r]!==t[r+12])return false}return true};n.isPrivate=function m(e){return e.match(/^10\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})/)!=null||e.match(/^192\.168\.([0-9]{1,3})\.([0-9]{1,3})/)!=null||e.match(/^172\.(1[6-9]|2\d|30|31)\.([0-9]{1,3})\.([0-9]{1,3})/)!=null||e.match(/^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})/)!=null||e.match(/^169\.254\.([0-9]{1,3})\.([0-9]{1,3})/)!=null||e.match(/^fc00:/)!=null||e.match(/^fe80:/)!=null||e.match(/^::1$/)!=null||e.match(/^::$/)!=null};n.isPublic=function b(e){return!n.isPrivate(e)};n.isLoopback=function y(e){return/^127\.0\.0\.1$/.test(e)||/^fe80::1$/.test(e)||/^::1$/.test(e)||/^::$/.test(e)};n.loopback=function _(e){e=s(e);if(e!=="ipv4"&&e!=="ipv6"){throw new Error("family must be ipv4 or ipv6")}return e==="ipv4"?"127.0.0.1":"fe80::1"};n.address=function w(e,t){var r=a.networkInterfaces(),i;t=s(t);if(e&&!~["public","private"].indexOf(e)){return r[e].filter(function(e){e.family=e.family.toLowerCase();return e.family===t})[0].address}var i=Object.keys(r).map(function(i){var a=r[i].filter(function(r){r.family=r.family.toLowerCase();if(r.family!==t||n.isLoopback(r.address)){return false}else if(!e){return true}return e==="public"?!n.isPrivate(r.address):n.isPrivate(r.address)});return a.length?a[0].address:undefined}).filter(Boolean);return!i.length?n.loopback(t):i[0]};n.toLong=function E(e){var t=0;e.split(".").forEach(function(e){t<<=8;t+=parseInt(e)});return t>>>0};n.fromLong=function S(e){return(e>>>24)+"."+(e>>16&255)+"."+(e>>8&255)+"."+(e&255)};function s(e){return e?e.toLowerCase():"ipv4"}},{buffer:4,os:12}],66:[function(e,t,r){var n=e("lodash.createcallback"),i=e("lodash.forown");function a(e,t,r){var a=[];t=n(t,r,3);var s=-1,o=e?e.length:0;if(typeof o=="number"){while(++s<o){var u=e[s];if(t(u,s,e)){a.push(u)}}}else{i(e,function(e,r,n){if(t(e,r,n)){a.push(e)}})}return a}t.exports=a},{"lodash.createcallback":67,"lodash.forown":103}],67:[function(e,t,r){var n=e("lodash._basecreatecallback"),i=e("lodash._baseisequal"),a=e("lodash.isobject"),s=e("lodash.keys"),o=e("lodash.property");function u(e,t,r){var u=typeof e;if(e==null||u=="function"){return n(e,t,r)}if(u!="object"){return o(e)}var f=s(e),l=f[0],c=e[l];if(f.length==1&&c===c&&!a(c)){return function(e){var t=e[l];return c===t&&(c!==0||1/c==1/t)}}return function(t){var r=f.length,n=false;while(r--){if(!(n=i(t[f[r]],e[f[r]],null,true))){break}}return n}}t.exports=u},{"lodash._basecreatecallback":68,"lodash._baseisequal":87,"lodash.isobject":96,"lodash.keys":98,"lodash.property":102}],68:[function(e,t,r){var n=e("lodash.bind"),i=e("lodash.identity"),a=e("lodash._setbinddata"),s=e("lodash.support");var o=/^\s*function[ \n\r\t]+\w/;var u=/\bthis\b/;var f=Function.prototype.toString;function l(e,t,r){if(typeof e!="function"){return i}if(typeof t=="undefined"||!("prototype"in e)){return e}var l=e.__bindData__;if(typeof l=="undefined"){if(s.funcNames){l=!e.name}l=l||!s.funcDecomp;if(!l){var c=f.call(e);if(!s.funcNames){l=!o.test(c)}if(!l){l=u.test(c);a(e,l)}}}if(l===false||l!==true&&l[1]&1){return e}switch(r){case 1:return function(r){return e.call(t,r)};case 2:return function(r,n){return e.call(t,r,n)};case 3:return function(r,n,i){return e.call(t,r,n,i)};case 4:return function(r,n,i,a){return e.call(t,r,n,i,a)}}return n(e,t)}t.exports=l},{"lodash._setbinddata":69,"lodash.bind":72,"lodash.identity":84,"lodash.support":85}],69:[function(e,t,r){var n=e("lodash._isnative"),i=e("lodash.noop");var a={configurable:false,enumerable:false,value:null,writable:false};var s=function(){try{var e={},t=n(t=Object.defineProperty)&&t,r=t(e,e,e)&&t}catch(i){}return r}();var o=!s?i:function(e,t){a.value=t;s(e,"__bindData__",a)};t.exports=o},{"lodash._isnative":70,"lodash.noop":71}],70:[function(e,t,r){var n=Object.prototype;var i=n.toString;var a=RegExp("^"+String(i).replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/toString| for [^\]]+/g,".*?")+"$");function s(e){return typeof e=="function"&&a.test(e)}t.exports=s},{}],71:[function(e,t,r){function n(){}t.exports=n},{}],72:[function(e,t,r){var n=e("lodash._createwrapper"),i=e("lodash._slice");function a(e,t){return arguments.length>2?n(e,17,i(arguments,2),null,t):n(e,1,null,null,t)}t.exports=a},{"lodash._createwrapper":73,"lodash._slice":83}],73:[function(e,t,r){var n=e("lodash._basebind"),i=e("lodash._basecreatewrapper"),a=e("lodash.isfunction"),s=e("lodash._slice");var o=[];var u=o.push,f=o.unshift;function l(e,t,r,o,c,h){var p=t&1,d=t&2,g=t&4,v=t&8,m=t&16,b=t&32;if(!d&&!a(e)){throw new TypeError}if(m&&!r.length){t&=~16;m=r=false}if(b&&!o.length){t&=~32;b=o=false}var y=e&&e.__bindData__;if(y&&y!==true){y=s(y);if(y[2]){y[2]=s(y[2])}if(y[3]){y[3]=s(y[3])}if(p&&!(y[1]&1)){y[4]=c}if(!p&&y[1]&1){t|=8}if(g&&!(y[1]&4)){y[5]=h}if(m){u.apply(y[2]||(y[2]=[]),r)}if(b){f.apply(y[3]||(y[3]=[]),o)}y[1]|=t;return l.apply(null,y)}var _=t==1||t===17?n:i;return _([e,t,r,o,c,h])}t.exports=l},{"lodash._basebind":74,"lodash._basecreatewrapper":78,"lodash._slice":83,"lodash.isfunction":82}],74:[function(e,t,r){var n=e("lodash._basecreate"),i=e("lodash.isobject"),a=e("lodash._setbinddata"),s=e("lodash._slice");var o=[];var u=o.push;function f(e){var t=e[0],r=e[2],o=e[4];function f(){if(r){var e=s(r);u.apply(e,arguments)}if(this instanceof f){var a=n(t.prototype),l=t.apply(a,e||arguments);return i(l)?l:a}return t.apply(o,e||arguments)}a(f,e);return f}t.exports=f},{"lodash._basecreate":75,"lodash._setbinddata":69,"lodash._slice":83,"lodash.isobject":96}],75:[function(e,t,r){(function(r){var n=e("lodash._isnative"),i=e("lodash.isobject"),a=e("lodash.noop");var s=n(s=Object.create)&&s;function o(e,t){return i(e)?s(e):{}}if(!s){o=function(){function e(){}return function(t){if(i(t)){e.prototype=t;var n=new e;e.prototype=null}return n||r.Object()}}()}t.exports=o}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"lodash._isnative":76,"lodash.isobject":96,"lodash.noop":77}],76:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],77:[function(e,t,r){arguments[4][71][0].apply(r,arguments)},{dup:71}],78:[function(e,t,r){var n=e("lodash._basecreate"),i=e("lodash.isobject"),a=e("lodash._setbinddata"),s=e("lodash._slice");var o=[];var u=o.push;function f(e){var t=e[0],r=e[1],o=e[2],l=e[3],c=e[4],h=e[5];var p=r&1,d=r&2,g=r&4,v=r&8,m=t;function b(){var e=p?c:this;if(o){var a=s(o);u.apply(a,arguments)}if(l||g){a||(a=s(arguments));if(l){u.apply(a,l)}if(g&&a.length<h){r|=16&~32;return f([t,v?r:r&~3,a,null,c,h])}}a||(a=arguments);if(d){t=e[m]}if(this instanceof b){e=n(t.prototype);var y=t.apply(e,a);return i(y)?y:e}return t.apply(e,a)}a(b,e);return b}t.exports=f},{"lodash._basecreate":79,"lodash._setbinddata":69,"lodash._slice":83,"lodash.isobject":96}],79:[function(e,t,r){arguments[4][75][0].apply(r,arguments)},{dup:75,"lodash._isnative":80,"lodash.isobject":96,"lodash.noop":81}],80:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],81:[function(e,t,r){arguments[4][71][0].apply(r,arguments)},{dup:71}],82:[function(e,t,r){function n(e){return typeof e=="function"}t.exports=n},{}],83:[function(e,t,r){function n(e,t,r){t||(t=0);if(typeof r=="undefined"){r=e?e.length:0}var n=-1,i=r-t||0,a=Array(i<0?0:i);while(++n<i){a[n]=e[t+n]}return a}t.exports=n},{}],84:[function(e,t,r){function n(e){return e}t.exports=n},{}],85:[function(e,t,r){(function(r){var n=e("lodash._isnative");var i=/\bthis\b/;var a={};a.funcDecomp=!n(r.WinRTError)&&i.test(function(){return this});a.funcNames=typeof Function.name=="string";t.exports=a}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"lodash._isnative":86}],86:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],87:[function(e,t,r){var n=e("lodash.forin"),i=e("lodash._getarray"),a=e("lodash.isfunction"),s=e("lodash._objecttypes"),o=e("lodash._releasearray");var u="[object Arguments]",f="[object Array]",l="[object Boolean]",c="[object Date]",h="[object Number]",p="[object Object]",d="[object RegExp]",g="[object String]";var v=Object.prototype;var m=v.toString;var b=v.hasOwnProperty;function y(e,t,r,v,_,w){if(r){var E=r(e,t);if(typeof E!="undefined"){return!!E}}if(e===t){return e!==0||1/e==1/t}var S=typeof e,x=typeof t;if(e===e&&!(e&&s[S])&&!(t&&s[x])){return false}if(e==null||t==null){return e===t}var O=m.call(e),j=m.call(t);if(O==u){O=p}if(j==u){j=p}if(O!=j){return false}switch(O){case l:case c:return+e==+t;case h:return e!=+e?t!=+t:e==0?1/e==1/t:e==+t;case d:case g:return e==String(t)}var k=O==f;if(!k){var A=b.call(e,"__wrapped__"),R=b.call(t,"__wrapped__");if(A||R){return y(A?e.__wrapped__:e,R?t.__wrapped__:t,r,v,_,w)}if(O!=p){return false}var L=e.constructor,T=t.constructor;if(L!=T&&!(a(L)&&L instanceof L&&a(T)&&T instanceof T)&&("constructor"in e&&"constructor"in t)){return false}}var I=!_;_||(_=i());w||(w=i());var M=_.length;while(M--){if(_[M]==e){return w[M]==t}}var C=0;E=true;_.push(e);w.push(t);if(k){M=e.length;C=t.length;E=C==M;if(E||v){while(C--){var P=M,N=t[C];if(v){while(P--){if(E=y(e[P],N,r,v,_,w)){break}}}else if(!(E=y(e[C],N,r,v,_,w))){break}}}}else{n(t,function(t,n,i){if(b.call(i,n)){C++;return E=b.call(e,n)&&y(e[n],t,r,v,_,w)}});if(E&&!v){n(e,function(e,t,r){if(b.call(r,t)){return E=--C>-1}})}}_.pop();w.pop();if(I){o(_);o(w)}return E}t.exports=y},{"lodash._getarray":88,"lodash._objecttypes":90,"lodash._releasearray":91,"lodash.forin":94,"lodash.isfunction":95}],88:[function(e,t,r){var n=e("lodash._arraypool");function i(){return n.pop()||[]}t.exports=i},{"lodash._arraypool":89}],89:[function(e,t,r){var n=[];t.exports=n},{}],90:[function(e,t,r){var n={"boolean":false,"function":true,object:true,number:false,string:false,undefined:false};t.exports=n},{}],91:[function(e,t,r){var n=e("lodash._arraypool"),i=e("lodash._maxpoolsize");function a(e){e.length=0;if(n.length<i){n.push(e)}}t.exports=a},{"lodash._arraypool":92,"lodash._maxpoolsize":93}],92:[function(e,t,r){arguments[4][89][0].apply(r,arguments)},{dup:89}],93:[function(e,t,r){var n=40;t.exports=n},{}],94:[function(e,t,r){var n=e("lodash._basecreatecallback"),i=e("lodash._objecttypes");var a=function(e,t,r){var a,s=e,o=s;if(!s)return o;if(!i[typeof s])return o;t=t&&typeof r=="undefined"?t:n(t,r,3);for(a in s){if(t(s[a],a,e)===false)return o}return o};t.exports=a},{"lodash._basecreatecallback":68,"lodash._objecttypes":90}],95:[function(e,t,r){arguments[4][82][0].apply(r,arguments)},{dup:82}],96:[function(e,t,r){var n=e("lodash._objecttypes");function i(e){return!!(e&&n[typeof e])}t.exports=i},{"lodash._objecttypes":97}],97:[function(e,t,r){arguments[4][90][0].apply(r,arguments)},{dup:90}],98:[function(e,t,r){var n=e("lodash._isnative"),i=e("lodash.isobject"),a=e("lodash._shimkeys");var s=n(s=Object.keys)&&s;var o=!s?a:function(e){if(!i(e)){return[]}return s(e)};t.exports=o},{"lodash._isnative":99,"lodash._shimkeys":100,"lodash.isobject":96}],99:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],100:[function(e,t,r){var n=e("lodash._objecttypes");var i=Object.prototype;var a=i.hasOwnProperty;var s=function(e){var t,r=e,i=[];if(!r)return i;if(!n[typeof e])return i;for(t in r){if(a.call(r,t)){i.push(t)}}return i};t.exports=s},{"lodash._objecttypes":101}],101:[function(e,t,r){arguments[4][90][0].apply(r,arguments)},{dup:90}],102:[function(e,t,r){function n(e){return function(t){return t[e]}}t.exports=n},{}],103:[function(e,t,r){var n=e("lodash._basecreatecallback"),i=e("lodash.keys"),a=e("lodash._objecttypes");var s=function(e,t,r){var s,o=e,u=o;if(!o)return u;if(!a[typeof o])return u;t=t&&typeof r=="undefined"?t:n(t,r,3);var f=-1,l=a[typeof o]&&i(o),c=l?l.length:0;while(++f<c){s=l[f];if(t(o[s],s,e)===false)return u}return u};t.exports=s},{"lodash._basecreatecallback":104,"lodash._objecttypes":125,"lodash.keys":126}],104:[function(e,t,r){arguments[4][68][0].apply(r,arguments)},{dup:68,"lodash._setbinddata":105,"lodash.bind":108,"lodash.identity":122,"lodash.support":123}],105:[function(e,t,r){arguments[4][69][0].apply(r,arguments)},{dup:69,"lodash._isnative":106,"lodash.noop":107}],106:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],107:[function(e,t,r){arguments[4][71][0].apply(r,arguments)},{dup:71}],108:[function(e,t,r){arguments[4][72][0].apply(r,arguments)},{dup:72,"lodash._createwrapper":109,"lodash._slice":121}],109:[function(e,t,r){arguments[4][73][0].apply(r,arguments)},{dup:73,"lodash._basebind":110,"lodash._basecreatewrapper":115,"lodash._slice":121,"lodash.isfunction":120}],110:[function(e,t,r){arguments[4][74][0].apply(r,arguments)},{dup:74,"lodash._basecreate":111,"lodash._setbinddata":105,"lodash._slice":121,"lodash.isobject":114}],111:[function(e,t,r){arguments[4][75][0].apply(r,arguments)},{dup:75,"lodash._isnative":112,"lodash.isobject":114,"lodash.noop":113}],112:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],113:[function(e,t,r){arguments[4][71][0].apply(r,arguments)},{dup:71}],114:[function(e,t,r){arguments[4][96][0].apply(r,arguments)},{dup:96,"lodash._objecttypes":125}],115:[function(e,t,r){arguments[4][78][0].apply(r,arguments)},{dup:78,"lodash._basecreate":116,"lodash._setbinddata":105,"lodash._slice":121,"lodash.isobject":119}],116:[function(e,t,r){arguments[4][75][0].apply(r,arguments)},{dup:75,"lodash._isnative":117,"lodash.isobject":119,"lodash.noop":118}],117:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],118:[function(e,t,r){arguments[4][71][0].apply(r,arguments)},{dup:71}],119:[function(e,t,r){arguments[4][96][0].apply(r,arguments)},{dup:96,"lodash._objecttypes":125}],120:[function(e,t,r){arguments[4][82][0].apply(r,arguments)},{dup:82}],121:[function(e,t,r){arguments[4][83][0].apply(r,arguments)},{dup:83}],122:[function(e,t,r){arguments[4][84][0].apply(r,arguments)},{dup:84}],123:[function(e,t,r){arguments[4][85][0].apply(r,arguments)},{dup:85,"lodash._isnative":124}],124:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],125:[function(e,t,r){arguments[4][90][0].apply(r,arguments)},{dup:90}],126:[function(e,t,r){arguments[4][98][0].apply(r,arguments)},{dup:98,"lodash._isnative":127,"lodash._shimkeys":128,"lodash.isobject":129}],127:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],128:[function(e,t,r){arguments[4][100][0].apply(r,arguments)},{dup:100,"lodash._objecttypes":125}],129:[function(e,t,r){arguments[4][96][0].apply(r,arguments)},{dup:96,"lodash._objecttypes":125}],130:[function(e,t,r){var n=e("lodash.createcallback"),i=e("lodash.forown");function a(e,t,r){var a=-1,s=e?e.length:0;t=n(t,r,3);if(typeof s=="number"){var o=Array(s);while(++a<s){o[a]=t(e[a],a,e)}}else{o=[];i(e,function(e,r,n){o[++a]=t(e,r,n)})}return o}t.exports=a},{"lodash.createcallback":131,"lodash.forown":167}],131:[function(e,t,r){arguments[4][67][0].apply(r,arguments)},{dup:67,"lodash._basecreatecallback":132,"lodash._baseisequal":151,"lodash.isobject":160,"lodash.keys":162,"lodash.property":166}],132:[function(e,t,r){arguments[4][68][0].apply(r,arguments)},{dup:68,"lodash._setbinddata":133,"lodash.bind":136,"lodash.identity":148,"lodash.support":149}],133:[function(e,t,r){arguments[4][69][0].apply(r,arguments)},{dup:69,"lodash._isnative":134,"lodash.noop":135}],134:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],135:[function(e,t,r){arguments[4][71][0].apply(r,arguments)},{dup:71}],136:[function(e,t,r){arguments[4][72][0].apply(r,arguments)},{dup:72,"lodash._createwrapper":137,"lodash._slice":147}],137:[function(e,t,r){arguments[4][73][0].apply(r,arguments)},{dup:73,"lodash._basebind":138,"lodash._basecreatewrapper":142,"lodash._slice":147,"lodash.isfunction":146}],138:[function(e,t,r){arguments[4][74][0].apply(r,arguments)},{dup:74,"lodash._basecreate":139,"lodash._setbinddata":133,"lodash._slice":147,"lodash.isobject":160}],139:[function(e,t,r){arguments[4][75][0].apply(r,arguments)},{dup:75,"lodash._isnative":140,"lodash.isobject":160,"lodash.noop":141}],140:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],141:[function(e,t,r){arguments[4][71][0].apply(r,arguments)},{dup:71}],142:[function(e,t,r){arguments[4][78][0].apply(r,arguments)},{dup:78,"lodash._basecreate":143,"lodash._setbinddata":133,"lodash._slice":147,"lodash.isobject":160}],143:[function(e,t,r){arguments[4][75][0].apply(r,arguments)},{dup:75,"lodash._isnative":144,"lodash.isobject":160,"lodash.noop":145}],144:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],145:[function(e,t,r){arguments[4][71][0].apply(r,arguments)},{dup:71}],146:[function(e,t,r){arguments[4][82][0].apply(r,arguments)},{dup:82}],147:[function(e,t,r){arguments[4][83][0].apply(r,arguments)},{dup:83}],148:[function(e,t,r){arguments[4][84][0].apply(r,arguments)},{dup:84}],149:[function(e,t,r){arguments[4][85][0].apply(r,arguments)},{dup:85,"lodash._isnative":150}],150:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],151:[function(e,t,r){arguments[4][87][0].apply(r,arguments)},{dup:87,"lodash._getarray":152,"lodash._objecttypes":154,"lodash._releasearray":155,"lodash.forin":158,"lodash.isfunction":159}],152:[function(e,t,r){arguments[4][88][0].apply(r,arguments)},{dup:88,"lodash._arraypool":153}],153:[function(e,t,r){arguments[4][89][0].apply(r,arguments)},{dup:89}],154:[function(e,t,r){arguments[4][90][0].apply(r,arguments)},{dup:90}],155:[function(e,t,r){arguments[4][91][0].apply(r,arguments)},{dup:91,"lodash._arraypool":156,"lodash._maxpoolsize":157}],156:[function(e,t,r){arguments[4][89][0].apply(r,arguments)},{dup:89}],157:[function(e,t,r){arguments[4][93][0].apply(r,arguments)},{dup:93}],158:[function(e,t,r){arguments[4][94][0].apply(r,arguments)},{dup:94,"lodash._basecreatecallback":132,"lodash._objecttypes":154}],159:[function(e,t,r){arguments[4][82][0].apply(r,arguments)},{dup:82}],160:[function(e,t,r){arguments[4][96][0].apply(r,arguments)},{dup:96,"lodash._objecttypes":161}],161:[function(e,t,r){arguments[4][90][0].apply(r,arguments)},{dup:90}],162:[function(e,t,r){arguments[4][98][0].apply(r,arguments)},{dup:98,"lodash._isnative":163,"lodash._shimkeys":164,"lodash.isobject":160}],163:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],164:[function(e,t,r){arguments[4][100][0].apply(r,arguments)},{dup:100,"lodash._objecttypes":165}],165:[function(e,t,r){arguments[4][90][0].apply(r,arguments)},{dup:90}],166:[function(e,t,r){arguments[4][102][0].apply(r,arguments)},{dup:102}],167:[function(e,t,r){arguments[4][103][0].apply(r,arguments)},{dup:103,"lodash._basecreatecallback":168,"lodash._objecttypes":189,"lodash.keys":190}],168:[function(e,t,r){arguments[4][68][0].apply(r,arguments)},{dup:68,"lodash._setbinddata":169,"lodash.bind":172,"lodash.identity":186,"lodash.support":187}],169:[function(e,t,r){arguments[4][69][0].apply(r,arguments)},{dup:69,"lodash._isnative":170,"lodash.noop":171}],170:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],171:[function(e,t,r){arguments[4][71][0].apply(r,arguments)},{dup:71}],172:[function(e,t,r){arguments[4][72][0].apply(r,arguments)},{dup:72,"lodash._createwrapper":173,"lodash._slice":185}],173:[function(e,t,r){arguments[4][73][0].apply(r,arguments)},{dup:73,"lodash._basebind":174,"lodash._basecreatewrapper":179,"lodash._slice":185,"lodash.isfunction":184}],174:[function(e,t,r){arguments[4][74][0].apply(r,arguments)},{dup:74,"lodash._basecreate":175,"lodash._setbinddata":169,"lodash._slice":185,"lodash.isobject":178}],175:[function(e,t,r){arguments[4][75][0].apply(r,arguments)},{dup:75,"lodash._isnative":176,"lodash.isobject":178,"lodash.noop":177}],176:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],177:[function(e,t,r){arguments[4][71][0].apply(r,arguments)},{dup:71}],178:[function(e,t,r){arguments[4][96][0].apply(r,arguments)},{dup:96,"lodash._objecttypes":189}],179:[function(e,t,r){arguments[4][78][0].apply(r,arguments)},{dup:78,"lodash._basecreate":180,"lodash._setbinddata":169,"lodash._slice":185,"lodash.isobject":183}],180:[function(e,t,r){arguments[4][75][0].apply(r,arguments)},{dup:75,"lodash._isnative":181,"lodash.isobject":183,"lodash.noop":182}],181:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],182:[function(e,t,r){arguments[4][71][0].apply(r,arguments)},{dup:71}],183:[function(e,t,r){arguments[4][96][0].apply(r,arguments)},{dup:96,"lodash._objecttypes":189}],184:[function(e,t,r){arguments[4][82][0].apply(r,arguments)},{dup:82}],185:[function(e,t,r){arguments[4][83][0].apply(r,arguments)},{dup:83}],186:[function(e,t,r){arguments[4][84][0].apply(r,arguments)},{dup:84}],187:[function(e,t,r){arguments[4][85][0].apply(r,arguments)},{dup:85,"lodash._isnative":188}],188:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],189:[function(e,t,r){arguments[4][90][0].apply(r,arguments)},{dup:90}],190:[function(e,t,r){arguments[4][98][0].apply(r,arguments)},{dup:98,"lodash._isnative":191,"lodash._shimkeys":192,"lodash.isobject":193}],191:[function(e,t,r){arguments[4][70][0].apply(r,arguments)},{dup:70}],192:[function(e,t,r){arguments[4][100][0].apply(r,arguments)},{dup:100,"lodash._objecttypes":189}],193:[function(e,t,r){arguments[4][96][0].apply(r,arguments)},{dup:96,"lodash._objecttypes":189}],194:[function(e,t,r){arguments[4][47][0].apply(r,arguments)},{dup:47}],195:[function(e,t,r){var n=e("lodash.map");t.exports=i;function i(e){if(typeof e=="number"){if(i.codes[e])return i.codes[e];throw new Error("no protocol with code: "+e)}else if(typeof e=="string"||e instanceof String){if(i.names[e])return i.names[e];throw new Error("no protocol with name: "+e)}throw new Error("invalid protocol id type: "+e)}i.table=[[4,32,"ip4"],[6,16,"tcp"],[17,16,"udp"],[33,16,"dccp"],[41,128,"ip6"],[132,16,"sctp"]];i.names={};i.codes={};n(i.table,function(e){var t=a.apply(this,e);i.codes[t.code]=t;i.names[t.name]=t});i.object=a;function a(e,t,r){return{code:e,size:t,name:r}}},{"lodash.map":130}],196:[function(e,t,r){var n=e("sandwich-stream").SandwichStream;var i=e("stream");var a=e("inherits");var s="\r\n";t.exports=o;function o(e){if(!this instanceof o){return new o(e)}this.boundary=e||Math.random().toString(36).slice(2);n.call(this,{head:"--"+this.boundary+s,tail:s+"--"+this.boundary+"--",separator:s+"--"+this.boundary+s});this._add=this.add;this.add=this.addPart}a(o,n);o.prototype.addPart=function(e){e=e||{};var t=new i.PassThrough;if(e.headers){for(var r in e.headers){var n=e.headers[r];t.write(r+": "+n+s)}}t.write(s);if(e.body instanceof i.Stream){e.body.pipe(t)}else{t.end(e.body)}this._add(t)}},{inherits:197,"sandwich-stream":198,stream:32}],197:[function(e,t,r){arguments[4][10][0].apply(r,arguments)},{dup:10}],198:[function(e,t,r){var n=e("stream").Readable;var i=e("stream").PassThrough;function a(e){n.call(this,e);e=e||{};this._streamsActive=false;this._streamsAdded=false;this._streams=[];this._currentStream=undefined;this._errorsEmitted=false;if(e.head){this._head=e.head}if(e.tail){this._tail=e.tail}if(e.separator){this._separator=e.separator}}a.prototype=Object.create(n.prototype,{constructor:a});a.prototype._read=function(){if(!this._streamsActive){this._streamsActive=true;this._pushHead();this._streamNextStream()}};a.prototype.add=function(e){if(!this._streamsActive){this._streamsAdded=true;this._streams.push(e);e.on("error",this._substreamOnError.bind(this))}else{throw new Error("SandwichStream error adding new stream while streaming")}};a.prototype._substreamOnError=function(e){this._errorsEmitted=true;this.emit("error",e)};a.prototype._pushHead=function(){if(this._head){this.push(this._head)}};a.prototype._streamNextStream=function(){if(this._nextStream()){this._bindCurrentStreamEvents()}else{this._pushTail();this.push(null)}};a.prototype._nextStream=function(){this._currentStream=this._streams.shift();return this._currentStream!==undefined};a.prototype._bindCurrentStreamEvents=function(){
this._currentStream.on("readable",this._currentStreamOnReadable.bind(this));this._currentStream.on("end",this._currentStreamOnEnd.bind(this))};a.prototype._currentStreamOnReadable=function(){this.push(this._currentStream.read()||"")};a.prototype._currentStreamOnEnd=function(){this._pushSeparator();this._streamNextStream()};a.prototype._pushSeparator=function(){if(this._streams.length>0&&this._separator){this.push(this._separator)}};a.prototype._pushTail=function(){if(this._tail){this.push(this._tail)}};function s(e){var t=new a(e);return t}s.SandwichStream=a;t.exports=s},{stream:32}],199:[function(e,t,r){"use strict";t.exports={src:e("./lib/src"),dest:e("./lib/dest"),symlink:e("./lib/symlink"),watch:e("glob-watcher")}},{"./lib/dest":200,"./lib/src":211,"./lib/symlink":213,"glob-watcher":270}],200:[function(e,t,r){"use strict";var n=e("through2");var i=e("../prepareWrite");var a=e("./writeContents");function s(e,t){if(!t){t={}}function r(r,n,s){i(e,r,t,function(e,t){if(e){return s(e)}a(t,r,s)})}return n.obj(r)}t.exports=s},{"../prepareWrite":206,"./writeContents":201,through2:310}],201:[function(e,t,r){"use strict";var n=e("./writeDir");var i=e("./writeStream");var a=e("./writeBuffer");function s(e,t,r){if(t.isDirectory()){return n(e,t,o)}if(t.isStream()){return i(e,t,o)}if(t.isBuffer()){return a(e,t,o)}if(t.isNull()){return s()}function s(e){r(e,t)}function o(r){if(u(r)){return s(r)}if(!t.stat||typeof t.stat.mode!=="number"){return s()}fs.stat(e,function(r,n){if(r){return s(r)}var i=n.mode&parseInt("0777",8);var a=t.stat.mode&parseInt("0777",8);if(i===a){return s()}fs.chmod(e,a,s)})}function u(e){if(!e){return false}else if(e.code==="EEXIST"&&t.flag==="wx"){return false}return true}}t.exports=s},{"./writeBuffer":202,"./writeDir":203,"./writeStream":204}],202:[function(e,t,r){"use strict";function n(e,t,r){var n={mode:t.stat.mode,flag:t.flag};fs.writeFile(e,t.contents,n,r)}t.exports=n},{}],203:[function(e,t,r){"use strict";var n=e("mkdirp");function i(e,t,r){n(e,t.stat.mode,r)}t.exports=i},{mkdirp:294}],204:[function(e,t,r){"use strict";var n=e("../../src/getContents/streamFile");function i(e,t,r){var i={mode:t.stat.mode,flag:t.flag};var a=fs.createWriteStream(e,i);t.contents.once("error",o);a.once("error",o);a.once("finish",s);t.contents.pipe(a);function s(){n(t,{},o)}function o(e){t.contents.removeListener("error",r);a.removeListener("error",r);a.removeListener("finish",s);r(e)}}t.exports=i},{"../../src/getContents/streamFile":210}],205:[function(e,t,r){"use strict";var n=e("through2-filter");t.exports=function(e){var t=typeof e==="number"||e instanceof Number||e instanceof Date;if(!t){throw new Error("expected since option to be a date or a number")}return n.obj(function(t){return t.stat&&t.stat.mtime>e})}},{"through2-filter":296}],206:[function(e,t,r){(function(r){"use strict";var n=e("object-assign");var i=e("path");var a=e("mkdirp");function s(e,t){if(typeof e!=="string"&&typeof e!=="function"){return null}return typeof e==="string"?e:e(t)}function o(e,t,o,u){var f=n({cwd:r.cwd(),mode:t.stat?t.stat.mode:null,dirMode:null,overwrite:true},o);f.flag=f.overwrite?"w":"wx";var l=i.resolve(f.cwd);var c=s(e,t);if(!c){throw new Error("Invalid output folder")}var h=f.base?s(f.base,t):i.resolve(l,c);if(!h){throw new Error("Invalid base option")}var p=i.resolve(h,t.relative);var d=i.dirname(p);t.stat=t.stat||new fs.Stats;t.stat.mode=f.mode;t.flag=f.flag;t.cwd=l;t.base=h;t.path=p;a(d,f.dirMode,function(e){if(e){return u(e)}u(null,p)})}t.exports=o}).call(this,e("_process"))},{_process:14,mkdirp:294,"object-assign":295,path:13}],207:[function(e,t,r){"use strict";function n(e,t,r){fs.readFile(e.path,function(t,n){if(t){return r(t)}e.contents=n;r(null,e)})}t.exports=n},{}],208:[function(e,t,r){"use strict";var n=e("through2");var i=e("./readDir");var a=e("./bufferFile");var s=e("./streamFile");function o(e){return n.obj(function(t,r,n){if(t.isDirectory()){return i(t,e,n)}if(e.buffer!==false){return a(t,e,n)}return s(t,e,n)})}t.exports=o},{"./bufferFile":207,"./readDir":209,"./streamFile":210,through2:310}],209:[function(e,t,r){"use strict";function n(e,t,r){r(null,e)}t.exports=n},{}],210:[function(e,t,r){"use strict";function n(e,t,r){e.contents=fs.createReadStream(e.path);r(null,e)}t.exports=n},{}],211:[function(e,t,r){"use strict";var n=e("object-assign");var i=e("through2");var a=e("glob-stream");var s=e("vinyl");var o=e("duplexify");var u=e("merge-stream");var f=e("../filterSince");var l=e("is-valid-glob");var c=e("./getContents");var h=e("./resolveSymlinks");function p(e,t,r){r(null,new s(e))}function d(e,t){var r=n({read:true,buffer:true,sourcemaps:false,passthrough:false},t);var s;if(!l(e)){throw new Error("Invalid glob argument: "+e)}var d=a.create(e,r);var g=d.pipe(h()).pipe(i.obj(p));if(r.since!=null){g=g.pipe(f(r.since))}if(r.read!==false){g=g.pipe(c(r))}if(r.passthrough===true){s=i.obj();g=o.obj(s,u(g,s))}d.on("error",g.emit.bind(g,"error"));return g}t.exports=d},{"../filterSince":205,"./getContents":208,"./resolveSymlinks":212,duplexify:214,"glob-stream":230,"is-valid-glob":281,"merge-stream":282,"object-assign":295,through2:310,vinyl:332}],212:[function(e,t,r){"use strict";var n=e("through2");var i=e("path");function a(){return n.obj(s)}function s(e,t,r){fs.lstat(e.path,function(n,a){if(n){return r(n)}e.stat=a;if(!a.isSymbolicLink()){return r(null,e)}fs.realpath(e.path,function(n,a){if(n){return r(n)}e.base=i.dirname(a);e.path=a;s(e,t,r)})})}t.exports=a},{path:13,through2:310}],213:[function(e,t,r){"use strict";var n=e("through2");var i=e("../prepareWrite");function a(e,t){function r(r,n,a){var s=r.path;var o=r.isDirectory()?"dir":"file";i(e,r,t,function(e,t){if(e){return a(e)}fs.symlink(s,t,o,function(e){if(e&&e.code!=="EEXIST"){return a(e)}a(null,r)})})}var a=n.obj(r);a.resume();return a}t.exports=a},{"../prepareWrite":206,through2:310}],214:[function(e,t,r){(function(r,n){var i=e("readable-stream");var a=e("end-of-stream");var s=e("util");var o=new n([0]);var u=function(e,t){if(e._corked)e.once("uncork",t);else t()};var f=function(e,t){return function(r){if(r)e.destroy(r.message==="premature close"?null:r);else if(t&&!e._ended)e.end()}};var l=function(e,t){if(!e)return t();if(e._writableState&&e._writableState.finished)return t();if(e._writableState)return e.end(t);e.end();t()};var c=function(e){return new i.Readable({objectMode:true,highWaterMark:16}).wrap(e)};var h=function(e,t,r){if(!(this instanceof h))return new h(e,t,r);i.Duplex.call(this,r);this._writable=null;this._readable=null;this._readable2=null;this._forwardDestroy=!r||r.destroy!==false;this._forwardEnd=!r||r.end!==false;this._corked=1;this._ondrain=null;this._drained=false;this._forwarding=false;this._unwrite=null;this._unread=null;this._ended=false;this.destroyed=false;if(e)this.setWritable(e);if(t)this.setReadable(t)};s.inherits(h,i.Duplex);h.obj=function(e,t,r){if(!r)r={};r.objectMode=true;r.highWaterMark=16;return new h(e,t,r)};h.prototype.cork=function(){if(++this._corked===1)this.emit("cork")};h.prototype.uncork=function(){if(this._corked&&--this._corked===0)this.emit("uncork")};h.prototype.setWritable=function(e){if(this._unwrite)this._unwrite();if(this.destroyed){if(e&&e.destroy)e.destroy();return}if(e===null||e===false){this.end();return}var t=this;var n=a(e,{writable:true,readable:false},f(this,this._forwardEnd));var i=function(){var e=t._ondrain;t._ondrain=null;if(e)e()};var s=function(){t._writable.removeListener("drain",i);n()};if(this._unwrite)r.nextTick(i);this._writable=e;this._writable.on("drain",i);this._unwrite=s;this.uncork()};h.prototype.setReadable=function(e){if(this._unread)this._unread();if(this.destroyed){if(e&&e.destroy)e.destroy();return}if(e===null||e===false){this.push(null);this.resume();return}var t=this;var r=a(e,{writable:false,readable:true},f(this));var n=function(){t._forward()};var i=function(){t.push(null)};var s=function(){t._readable2.removeListener("readable",n);t._readable2.removeListener("end",i);r()};this._drained=true;this._readable=e;this._readable2=e._readableState?e:c(e);this._readable2.on("readable",n);this._readable2.on("end",i);this._unread=s;this._forward()};h.prototype._read=function(){this._drained=true;this._forward()};h.prototype._forward=function(){if(this._forwarding||!this._readable2||!this._drained)return;this._forwarding=true;var e;var t=this._readable2._readableState;while((e=this._readable2.read(t.buffer.length?t.buffer[0].length:t.length))!==null){this._drained=this.push(e)}this._forwarding=false};h.prototype.destroy=function(e){if(this.destroyed)return;this.destroyed=true;var t=this;r.nextTick(function(){t._destroy(e)})};h.prototype._destroy=function(e){if(e){var t=this._ondrain;this._ondrain=null;if(t)t(e);else this.emit("error",e)}if(this._forwardDestroy){if(this._readable&&this._readable.destroy)this._readable.destroy();if(this._writable&&this._writable.destroy)this._writable.destroy()}this.emit("close")};h.prototype._write=function(e,t,r){if(this.destroyed)return r();if(this._corked)return u(this,this._write.bind(this,e,t,r));if(e===o)return this._finish(r);if(!this._writable)return r();if(this._writable.write(e)===false)this._ondrain=r;else r()};h.prototype._finish=function(e){var t=this;this.emit("preend");u(this,function(){l(t._forwardEnd&&t._writable,function(){if(t._writableState.prefinished===false)t._writableState.prefinished=true;t.emit("prefinish");u(t,e)})})};h.prototype.end=function(e,t,r){if(typeof e==="function")return this.end(null,null,e);if(typeof t==="function")return this.end(e,null,t);this._ended=true;if(e)this.write(e);if(!this._writableState.ending)this.write(o);return i.Writable.prototype.end.call(this,r)};t.exports=h}).call(this,e("_process"),e("buffer").Buffer)},{_process:14,buffer:4,"end-of-stream":215,"readable-stream":229,util:46}],215:[function(e,t,r){var n=e("once");var i=function(){};var a=function(e){return e.setHeader&&typeof e.abort==="function"};var s=function(e,t,r){if(typeof t==="function")return s(e,null,t);if(!t)t={};r=n(r||i);var o=e._writableState;var u=e._readableState;var f=t.readable||t.readable!==false&&e.readable;var l=t.writable||t.writable!==false&&e.writable;var c=function(){if(!e.writable)h()};var h=function(){l=false;if(!f)r()};var p=function(){f=false;if(!l)r()};var d=function(){if(f&&!(u&&u.ended))return r(new Error("premature close"));if(l&&!(o&&o.ended))return r(new Error("premature close"))};var g=function(){e.req.on("finish",h)};if(a(e)){e.on("complete",h);e.on("abort",d);if(e.req)g();else e.on("request",g)}else if(l&&!o){e.on("end",c);e.on("close",c)}e.on("end",p);e.on("finish",h);if(t.error!==false)e.on("error",r);e.on("close",d);return function(){e.removeListener("complete",h);e.removeListener("abort",d);e.removeListener("request",g);if(e.req)e.req.removeListener("finish",h);e.removeListener("end",c);e.removeListener("close",c);e.removeListener("finish",h);e.removeListener("end",p);e.removeListener("error",r);e.removeListener("close",d)}};t.exports=s},{once:217}],216:[function(e,t,r){t.exports=n;function n(e,t){if(e&&t)return n(e)(t);if(typeof e!=="function")throw new TypeError("need wrapper function");Object.keys(e).forEach(function(t){r[t]=e[t]});return r;function r(){var t=new Array(arguments.length);for(var r=0;r<t.length;r++){t[r]=arguments[r]}var n=e.apply(this,t);var i=t[t.length-1];if(typeof n==="function"&&n!==i){Object.keys(i).forEach(function(e){n[e]=i[e]})}return n}}},{}],217:[function(e,t,r){var n=e("wrappy");t.exports=n(i);i.proto=i(function(){Object.defineProperty(Function.prototype,"once",{value:function(){return i(this)},configurable:true})});function i(e){var t=function(){if(t.called)return t.value;t.called=true;return t.value=e.apply(this,arguments)};t.called=false;return t}},{wrappy:216}],218:[function(e,t,r){arguments[4][20][0].apply(r,arguments)},{"./_stream_readable":220,"./_stream_writable":222,"core-util-is":223,dup:20,inherits:224,"process-nextick-args":226}],219:[function(e,t,r){arguments[4][21][0].apply(r,arguments)},{"./_stream_transform":221,"core-util-is":223,dup:21,inherits:224}],220:[function(e,t,r){arguments[4][22][0].apply(r,arguments)},{"./_stream_duplex":218,_process:14,buffer:4,"core-util-is":223,dup:22,events:9,inherits:224,isarray:225,"process-nextick-args":226,"string_decoder/":227,util:3}],221:[function(e,t,r){arguments[4][23][0].apply(r,arguments)},{"./_stream_duplex":218,"core-util-is":223,dup:23,inherits:224}],222:[function(e,t,r){arguments[4][24][0].apply(r,arguments)},{"./_stream_duplex":218,buffer:4,"core-util-is":223,dup:24,events:9,inherits:224,"process-nextick-args":226,"util-deprecate":228}],223:[function(e,t,r){arguments[4][25][0].apply(r,arguments)},{buffer:4,dup:25}],224:[function(e,t,r){arguments[4][10][0].apply(r,arguments)},{dup:10}],225:[function(e,t,r){arguments[4][11][0].apply(r,arguments)},{dup:11}],226:[function(e,t,r){arguments[4][26][0].apply(r,arguments)},{_process:14,dup:26}],227:[function(e,t,r){arguments[4][42][0].apply(r,arguments)},{buffer:4,dup:42}],228:[function(e,t,r){arguments[4][27][0].apply(r,arguments)},{dup:27}],229:[function(e,t,r){arguments[4][29][0].apply(r,arguments)},{"./lib/_stream_duplex.js":218,"./lib/_stream_passthrough.js":219,"./lib/_stream_readable.js":220,"./lib/_stream_transform.js":221,"./lib/_stream_writable.js":222,dup:29}],230:[function(e,t,r){(function(r){"use strict";var n=e("through2");var i=e("ordered-read-streams");var a=e("unique-stream");var s=e("glob");var o=e("minimatch").Minimatch;var u=e("glob2base");var f=e("path");var l={createStream:function(e,t,r){e=p(r.cwd,e);var i=new s.Glob(e,r);var a=r.base||u(i);var o=n.obj(t.length?h:undefined);var l=false;i.on("error",o.emit.bind(o,"error"));i.on("end",function(){if(r.allowEmpty!==true&&!l&&v(i)){o.emit("error",new Error("File not found with singular glob"))}o.end()});i.on("match",function(e){l=true;o.write({cwd:r.cwd,base:a,path:f.resolve(r.cwd,e)})});return o;function h(e,r,n){var i=c.bind(null,e);if(t.every(i)){n(null,e)}else{n()}}},create:function(e,t){if(!t)t={};if(typeof t.cwd!=="string")t.cwd=r.cwd();if(typeof t.dot!=="boolean")t.dot=false;if(typeof t.silent!=="boolean")t.silent=true;if(typeof t.nonull!=="boolean")t.nonull=false;if(typeof t.cwdbase!=="boolean")t.cwdbase=false;if(t.cwdbase)t.base=t.cwd;if(!Array.isArray(e))e=[e];var n=[];var s=[];e.forEach(function(e,r){if(typeof e!=="string"&&!(e instanceof RegExp)){throw new Error("Invalid glob at index "+r)}var i=h(e)?s:n;if(i===s&&typeof e==="string"){e=new o(p(t.cwd,e),t)}i.push({index:r,glob:e})});if(n.length===0)throw new Error("Missing positive glob");if(n.length===1)return m(n[0]);var u=n.map(m);var f=new i(u);var c=a("path");var v=f.pipe(c);f.on("error",function(e){v.emit("error",e)});return v;function m(e){var r=s.filter(d(e.index)).map(g);return l.createStream(e.glob,r,t)}}};function c(e,t){if(t instanceof o)return t.match(e.path);if(t instanceof RegExp)return t.test(e.path)}function h(e){if(typeof e==="string")return e[0]==="!";if(e instanceof RegExp)return true}function p(e,t){var r="";if(t[0]==="!"){r=t[0];t=t.slice(1)}return r+f.resolve(e,t)}function d(e){return function(t){return t.index>e}}function g(e){return e.glob}function v(e){var t=e.minimatch.set;if(t.length!==1){return false}return t[0].every(function r(e){return typeof e==="string"})}t.exports=l}).call(this,e("_process"))},{_process:14,glob:232,glob2base:240,minimatch:242,"ordered-read-streams":246,path:13,through2:268,"unique-stream":269}],231:[function(e,t,r){(function(t){r.alphasort=f;r.alphasorti=u;r.setopts=h;r.ownProp=n;r.makeAbs=v;r.finish=d;r.mark=g;r.isIgnored=m;r.childrenIgnored=b;function n(e,t){return Object.prototype.hasOwnProperty.call(e,t)}var i=e("path");var a=e("minimatch");var s=e("path-is-absolute");var o=a.Minimatch;function u(e,t){return e.toLowerCase().localeCompare(t.toLowerCase())}function f(e,t){return e.localeCompare(t)}function l(e,t){e.ignore=t.ignore||[];if(!Array.isArray(e.ignore))e.ignore=[e.ignore];if(e.ignore.length){e.ignore=e.ignore.map(c)}}function c(e){var t=null;if(e.slice(-3)==="/**"){var r=e.replace(/(\/\*\*)+$/,"");t=new o(r)}return{matcher:new o(e),gmatcher:t}}function h(e,r,a){if(!a)a={};if(a.matchBase&&-1===r.indexOf("/")){if(a.noglobstar){throw new Error("base matching requires globstar")}r="**/"+r}e.silent=!!a.silent;e.pattern=r;e.strict=a.strict!==false;e.realpath=!!a.realpath;e.realpathCache=a.realpathCache||Object.create(null);e.follow=!!a.follow;e.dot=!!a.dot;e.mark=!!a.mark;e.nodir=!!a.nodir;if(e.nodir)e.mark=true;e.sync=!!a.sync;e.nounique=!!a.nounique;e.nonull=!!a.nonull;e.nosort=!!a.nosort;e.nocase=!!a.nocase;e.stat=!!a.stat;e.noprocess=!!a.noprocess;e.maxLength=a.maxLength||Infinity;e.cache=a.cache||Object.create(null);e.statCache=a.statCache||Object.create(null);e.symlinks=a.symlinks||Object.create(null);l(e,a);e.changedCwd=false;var s=t.cwd();if(!n(a,"cwd"))e.cwd=s;else{e.cwd=a.cwd;e.changedCwd=i.resolve(a.cwd)!==s}e.root=a.root||i.resolve(e.cwd,"/");e.root=i.resolve(e.root);if(t.platform==="win32")e.root=e.root.replace(/\\/g,"/");e.nomount=!!a.nomount;a.nonegate=a.nonegate===false?false:true;a.nocomment=a.nocomment===false?false:true;p(a);e.minimatch=new o(r,a);e.options=e.minimatch.options}r.deprecationWarned;function p(e){if(!e.nonegate||!e.nocomment){if(t.noDeprecation!==true&&!r.deprecationWarned){var n="glob WARNING: comments and negation will be disabled in v6";if(t.throwDeprecation)throw new Error(n);else if(t.traceDeprecation)console.trace(n);else console.error(n);r.deprecationWarned=true}}}function d(e){var t=e.nounique;var r=t?[]:Object.create(null);for(var n=0,i=e.matches.length;n<i;n++){var a=e.matches[n];if(!a||Object.keys(a).length===0){if(e.nonull){var s=e.minimatch.globSet[n];if(t)r.push(s);else r[s]=true}}else{var o=Object.keys(a);if(t)r.push.apply(r,o);else o.forEach(function(e){r[e]=true})}}if(!t)r=Object.keys(r);if(!e.nosort)r=r.sort(e.nocase?u:f);if(e.mark){for(var n=0;n<r.length;n++){r[n]=e._mark(r[n])}if(e.nodir){r=r.filter(function(e){return!/\/$/.test(e)})}}if(e.ignore.length)r=r.filter(function(t){return!m(e,t)});e.found=r}function g(e,t){var r=v(e,t);var n=e.cache[r];var i=t;if(n){var a=n==="DIR"||Array.isArray(n);var s=t.slice(-1)==="/";if(a&&!s)i+="/";else if(!a&&s)i=i.slice(0,-1);if(i!==t){var o=v(e,i);e.statCache[o]=e.statCache[r];e.cache[o]=e.cache[r]}}return i}function v(e,t){var r=t;if(t.charAt(0)==="/"){r=i.join(e.root,t)}else if(s(t)||t===""){r=t}else if(e.changedCwd){r=i.resolve(e.cwd,t)}else{r=i.resolve(t)}return r}function m(e,t){if(!e.ignore.length)return false;return e.ignore.some(function(e){return e.matcher.match(t)||!!(e.gmatcher&&e.gmatcher.match(t))})}function b(e,t){if(!e.ignore.length)return false;return e.ignore.some(function(e){return!!(e.gmatcher&&e.gmatcher.match(t))})}}).call(this,e("_process"))},{_process:14,minimatch:242,path:13,"path-is-absolute":238}],232:[function(e,t,r){(function(r){t.exports=E;var n=e("fs");var i=e("minimatch");var a=i.Minimatch;var s=e("inherits");var o=e("events").EventEmitter;var u=e("path");var f=e("assert");var l=e("path-is-absolute");var c=e("./sync.js");var h=e("./common.js");var p=h.alphasort;var d=h.alphasorti;var g=h.setopts;var v=h.ownProp;var m=e("inflight");var b=e("util");var y=h.childrenIgnored;var _=h.isIgnored;var w=e("once");function E(e,t,r){if(typeof t==="function")r=t,t={};if(!t)t={};if(t.sync){if(r)throw new TypeError("callback provided to sync glob");return c(e,t)}return new x(e,t,r)}E.sync=c;var S=E.GlobSync=c.GlobSync;E.glob=E;E.hasMagic=function(e,t){var r=b._extend({},t);r.noprocess=true;var n=new x(e,r);var i=n.minimatch.set;if(i.length>1)return true;for(var a=0;a<i[0].length;a++){if(typeof i[0][a]!=="string")return true}return false};E.Glob=x;s(x,o);function x(e,t,r){if(typeof t==="function"){r=t;t=null}if(t&&t.sync){if(r)throw new TypeError("callback provided to sync glob");return new S(e,t)}if(!(this instanceof x))return new x(e,t,r);g(this,e,t);this._didRealPath=false;var n=this.minimatch.set.length;this.matches=new Array(n);if(typeof r==="function"){r=w(r);this.on("error",r);this.on("end",function(e){r(null,e)})}var i=this;var n=this.minimatch.set.length;this._processing=0;this.matches=new Array(n);this._emitQueue=[];this._processQueue=[];this.paused=false;if(this.noprocess)return this;if(n===0)return s();for(var a=0;a<n;a++){this._process(this.minimatch.set[a],a,false,s)}function s(){--i._processing;if(i._processing<=0)i._finish()}}x.prototype._finish=function(){f(this instanceof x);if(this.aborted)return;if(this.realpath&&!this._didRealpath)return this._realpath();h.finish(this);this.emit("end",this.found)};x.prototype._realpath=function(){if(this._didRealpath)return;this._didRealpath=true;var e=this.matches.length;if(e===0)return this._finish();var t=this;for(var r=0;r<this.matches.length;r++)this._realpathSet(r,n);function n(){if(--e===0)t._finish()}};x.prototype._realpathSet=function(e,t){var r=this.matches[e];if(!r)return t();var i=Object.keys(r);var a=this;var s=i.length;if(s===0)return t();var o=this.matches[e]=Object.create(null);i.forEach(function(r,i){r=a._makeAbs(r);n.realpath(r,a.realpathCache,function(n,i){if(!n)o[i]=true;else if(n.syscall==="stat")o[r]=true;else a.emit("error",n);if(--s===0){a.matches[e]=o;t()}})})};x.prototype._mark=function(e){return h.mark(this,e)};x.prototype._makeAbs=function(e){return h.makeAbs(this,e)};x.prototype.abort=function(){this.aborted=true;this.emit("abort")};x.prototype.pause=function(){if(!this.paused){this.paused=true;this.emit("pause")}};x.prototype.resume=function(){if(this.paused){this.emit("resume");this.paused=false;if(this._emitQueue.length){var e=this._emitQueue.slice(0);this._emitQueue.length=0;for(var t=0;t<e.length;t++){var r=e[t];this._emitMatch(r[0],r[1])}}if(this._processQueue.length){var n=this._processQueue.slice(0);this._processQueue.length=0;for(var t=0;t<n.length;t++){var i=n[t];this._processing--;this._process(i[0],i[1],i[2],i[3])}}}};x.prototype._process=function(e,t,r,n){f(this instanceof x);f(typeof n==="function");if(this.aborted)return;this._processing++;if(this.paused){this._processQueue.push([e,t,r,n]);return}var a=0;while(typeof e[a]==="string"){a++}var s;switch(a){case e.length:this._processSimple(e.join("/"),t,n);return;case 0:s=null;break;default:s=e.slice(0,a).join("/");break}var o=e.slice(a);var u;if(s===null)u=".";else if(l(s)||l(e.join("/"))){if(!s||!l(s))s="/"+s;u=s}else u=s;var c=this._makeAbs(u);if(y(this,u))return n();var h=o[0]===i.GLOBSTAR;if(h)this._processGlobStar(s,u,c,o,t,r,n);else this._processReaddir(s,u,c,o,t,r,n)};x.prototype._processReaddir=function(e,t,r,n,i,a,s){var o=this;this._readdir(r,a,function(u,f){return o._processReaddir2(e,t,r,n,i,a,f,s)})};x.prototype._processReaddir2=function(e,t,r,n,i,a,s,o){if(!s)return o();var f=n[0];var l=!!this.minimatch.negate;var c=f._glob;var h=this.dot||c.charAt(0)===".";var p=[];for(var d=0;d<s.length;d++){var g=s[d];if(g.charAt(0)!=="."||h){var v;if(l&&!e){v=!g.match(f)}else{v=g.match(f)}if(v)p.push(g)}}var m=p.length;if(m===0)return o();if(n.length===1&&!this.mark&&!this.stat){if(!this.matches[i])this.matches[i]=Object.create(null);for(var d=0;d<m;d++){var g=p[d];if(e){if(e!=="/")g=e+"/"+g;else g=e+g}if(g.charAt(0)==="/"&&!this.nomount){g=u.join(this.root,g)}this._emitMatch(i,g)}return o()}n.shift();for(var d=0;d<m;d++){var g=p[d];var b;if(e){if(e!=="/")g=e+"/"+g;else g=e+g}this._process([g].concat(n),i,a,o)}o()};x.prototype._emitMatch=function(e,t){if(this.aborted)return;if(this.matches[e][t])return;if(_(this,t))return;if(this.paused){this._emitQueue.push([e,t]);return}var r=this._makeAbs(t);if(this.nodir){var n=this.cache[r];if(n==="DIR"||Array.isArray(n))return}if(this.mark)t=this._mark(t);this.matches[e][t]=true;var i=this.statCache[r];if(i)this.emit("stat",t,i);this.emit("match",t)};x.prototype._readdirInGlobStar=function(e,t){if(this.aborted)return;if(this.follow)return this._readdir(e,false,t);var r="lstat\x00"+e;var i=this;var a=m(r,s);if(a)n.lstat(e,a);function s(r,n){if(r)return t();var a=n.isSymbolicLink();i.symlinks[e]=a;if(!a&&!n.isDirectory()){i.cache[e]="FILE";t()}else i._readdir(e,false,t)}};x.prototype._readdir=function(e,t,r){if(this.aborted)return;r=m("readdir\x00"+e+"\x00"+t,r);if(!r)return;if(t&&!v(this.symlinks,e))return this._readdirInGlobStar(e,r);if(v(this.cache,e)){var i=this.cache[e];if(!i||i==="FILE")return r();if(Array.isArray(i))return r(null,i)}var a=this;n.readdir(e,O(this,e,r))};function O(e,t,r){return function(n,i){if(n)e._readdirError(t,n,r);else e._readdirEntries(t,i,r)}}x.prototype._readdirEntries=function(e,t,r){if(this.aborted)return;if(!this.mark&&!this.stat){for(var n=0;n<t.length;n++){var i=t[n];if(e==="/")i=e+i;else i=e+"/"+i;this.cache[i]=true}}this.cache[e]=t;return r(null,t)};x.prototype._readdirError=function(e,t,r){if(this.aborted)return;switch(t.code){case"ENOTSUP":case"ENOTDIR":this.cache[this._makeAbs(e)]="FILE";break;case"ENOENT":case"ELOOP":case"ENAMETOOLONG":case"UNKNOWN":this.cache[this._makeAbs(e)]=false;break;default:this.cache[this._makeAbs(e)]=false;if(this.strict){this.emit("error",t);this.abort()}if(!this.silent)console.error("glob error",t);break}return r()};x.prototype._processGlobStar=function(e,t,r,n,i,a,s){var o=this;this._readdir(r,a,function(u,f){o._processGlobStar2(e,t,r,n,i,a,f,s)})};x.prototype._processGlobStar2=function(e,t,r,n,i,a,s,o){if(!s)return o();var u=n.slice(1);var f=e?[e]:[];var l=f.concat(u);this._process(l,i,false,o);var c=this.symlinks[r];var h=s.length;if(c&&a)return o();for(var p=0;p<h;p++){var d=s[p];if(d.charAt(0)==="."&&!this.dot)continue;var g=f.concat(s[p],u);this._process(g,i,true,o);var v=f.concat(s[p],n);this._process(v,i,true,o)}o()};x.prototype._processSimple=function(e,t,r){var n=this;this._stat(e,function(i,a){n._processSimple2(e,t,i,a,r)})};x.prototype._processSimple2=function(e,t,n,i,a){if(!this.matches[t])this.matches[t]=Object.create(null);if(!i)return a();if(e&&l(e)&&!this.nomount){var s=/[\/\\]$/.test(e);if(e.charAt(0)==="/"){e=u.join(this.root,e)}else{e=u.resolve(this.root,e);if(s)e+="/"}}if(r.platform==="win32")e=e.replace(/\\/g,"/");this._emitMatch(t,e);a()};x.prototype._stat=function(e,t){var r=this._makeAbs(e);var i=e.slice(-1)==="/";if(e.length>this.maxLength)return t();if(!this.stat&&v(this.cache,r)){var a=this.cache[r];if(Array.isArray(a))a="DIR";if(!i||a==="DIR")return t(null,a);if(i&&a==="FILE")return t()}var s;var o=this.statCache[r];if(o!==undefined){if(o===false)return t(null,o);else{var u=o.isDirectory()?"DIR":"FILE";if(i&&u==="FILE")return t();else return t(null,u,o)}}var f=this;var l=m("stat\x00"+r,c);if(l)n.lstat(r,l);function c(i,a){if(a&&a.isSymbolicLink()){return n.stat(r,function(n,i){if(n)f._stat2(e,r,null,a,t);else f._stat2(e,r,n,i,t)})}else{f._stat2(e,r,i,a,t)}}};x.prototype._stat2=function(e,t,r,n,i){if(r){this.statCache[t]=false;return i()}var a=e.slice(-1)==="/";this.statCache[t]=n;if(t.slice(-1)==="/"&&!n.isDirectory())return i(null,false,n);var s=n.isDirectory()?"DIR":"FILE";this.cache[t]=this.cache[t]||s;if(a&&s!=="DIR")return i();return i(null,s,n)}}).call(this,e("_process"))},{"./common.js":231,"./sync.js":239,_process:14,assert:2,events:9,fs:1,inflight:233,inherits:235,minimatch:242,once:237,path:13,"path-is-absolute":238,util:46}],233:[function(e,t,r){(function(r){var n=e("wrappy");var i=Object.create(null);var a=e("once");t.exports=n(s);function s(e,t){if(i[e]){i[e].push(t);return null}else{i[e]=[t];return o(e)}}function o(e){return a(function t(){var n=i[e];var a=n.length;var s=u(arguments);for(var o=0;o<a;o++){n[o].apply(null,s)}if(n.length>a){n.splice(0,a);r.nextTick(function(){t.apply(null,s)})}else{delete i[e]}})}function u(e){var t=e.length;var r=[];for(var n=0;n<t;n++)r[n]=e[n];return r}}).call(this,e("_process"))},{_process:14,once:237,wrappy:234}],234:[function(e,t,r){arguments[4][216][0].apply(r,arguments)},{dup:216}],235:[function(e,t,r){arguments[4][10][0].apply(r,arguments)},{dup:10}],236:[function(e,t,r){arguments[4][216][0].apply(r,arguments)},{dup:216}],237:[function(e,t,r){arguments[4][217][0].apply(r,arguments)},{dup:217,wrappy:236}],238:[function(e,t,r){(function(e){"use strict";function r(e){return e.charAt(0)==="/"}function n(e){var t=/^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;var r=t.exec(e);var n=r[1]||"";var i=!!n&&n.charAt(1)!==":";return!!r[2]||i}t.exports=e.platform==="win32"?n:r;t.exports.posix=r;t.exports.win32=n}).call(this,e("_process"))},{_process:14}],239:[function(e,t,r){(function(r){t.exports=m;m.GlobSync=b;var n=e("fs");var i=e("minimatch");var a=i.Minimatch;var s=e("./glob.js").Glob;var o=e("util");var u=e("path");var f=e("assert");var l=e("path-is-absolute");var c=e("./common.js");var h=c.alphasort;var p=c.alphasorti;var d=c.setopts;var g=c.ownProp;var v=c.childrenIgnored;function m(e,t){if(typeof t==="function"||arguments.length===3)throw new TypeError("callback provided to sync glob\n"+"See: https://github.com/isaacs/node-glob/issues/167");return new b(e,t).found}function b(e,t){if(!e)throw new Error("must provide pattern");if(typeof t==="function"||arguments.length===3)throw new TypeError("callback provided to sync glob\n"+"See: https://github.com/isaacs/node-glob/issues/167");if(!(this instanceof b))return new b(e,t);d(this,e,t);if(this.noprocess)return this;var r=this.minimatch.set.length;this.matches=new Array(r);for(var n=0;n<r;n++){this._process(this.minimatch.set[n],n,false)}this._finish()}b.prototype._finish=function(){f(this instanceof b);if(this.realpath){var e=this;this.matches.forEach(function(t,r){var i=e.matches[r]=Object.create(null);for(var a in t){try{a=e._makeAbs(a);var s=n.realpathSync(a,e.realpathCache);i[s]=true}catch(o){if(o.syscall==="stat")i[e._makeAbs(a)]=true;else throw o}}})}c.finish(this)};b.prototype._process=function(e,t,r){f(this instanceof b);var n=0;while(typeof e[n]==="string"){n++}var a;switch(n){case e.length:this._processSimple(e.join("/"),t);return;case 0:a=null;break;default:a=e.slice(0,n).join("/");break}var s=e.slice(n);var o;if(a===null)o=".";else if(l(a)||l(e.join("/"))){if(!a||!l(a))a="/"+a;o=a}else o=a;var u=this._makeAbs(o);if(v(this,o))return;var c=s[0]===i.GLOBSTAR;if(c)this._processGlobStar(a,o,u,s,t,r);else this._processReaddir(a,o,u,s,t,r)};b.prototype._processReaddir=function(e,t,r,n,i,a){var s=this._readdir(r,a);if(!s)return;var o=n[0];var f=!!this.minimatch.negate;var l=o._glob;var c=this.dot||l.charAt(0)===".";var h=[];for(var p=0;p<s.length;p++){var d=s[p];if(d.charAt(0)!=="."||c){var g;if(f&&!e){g=!d.match(o)}else{g=d.match(o)}if(g)h.push(d)}}var v=h.length;if(v===0)return;if(n.length===1&&!this.mark&&!this.stat){if(!this.matches[i])this.matches[i]=Object.create(null);for(var p=0;p<v;p++){var d=h[p];if(e){if(e.slice(-1)!=="/")d=e+"/"+d;else d=e+d}if(d.charAt(0)==="/"&&!this.nomount){d=u.join(this.root,d)}this.matches[i][d]=true}return}n.shift();for(var p=0;p<v;p++){var d=h[p];var m;if(e)m=[e,d];else m=[d];this._process(m.concat(n),i,a)}};b.prototype._emitMatch=function(e,t){var r=this._makeAbs(t);if(this.mark)t=this._mark(t);if(this.matches[e][t])return;if(this.nodir){var n=this.cache[this._makeAbs(t)];if(n==="DIR"||Array.isArray(n))return}this.matches[e][t]=true;if(this.stat)this._stat(t)};b.prototype._readdirInGlobStar=function(e){if(this.follow)return this._readdir(e,false);var t;var r;var i;try{r=n.lstatSync(e)}catch(a){return null}var s=r.isSymbolicLink();this.symlinks[e]=s;if(!s&&!r.isDirectory())this.cache[e]="FILE";else t=this._readdir(e,false);return t};b.prototype._readdir=function(e,t){var r;if(t&&!g(this.symlinks,e))return this._readdirInGlobStar(e);if(g(this.cache,e)){var i=this.cache[e];if(!i||i==="FILE")return null;if(Array.isArray(i))return i}try{return this._readdirEntries(e,n.readdirSync(e))}catch(a){this._readdirError(e,a);return null}};b.prototype._readdirEntries=function(e,t){if(!this.mark&&!this.stat){for(var r=0;r<t.length;r++){var n=t[r];if(e==="/")n=e+n;else n=e+"/"+n;this.cache[n]=true}}this.cache[e]=t;return t};b.prototype._readdirError=function(e,t){switch(t.code){case"ENOTSUP":case"ENOTDIR":this.cache[this._makeAbs(e)]="FILE";
break;case"ENOENT":case"ELOOP":case"ENAMETOOLONG":case"UNKNOWN":this.cache[this._makeAbs(e)]=false;break;default:this.cache[this._makeAbs(e)]=false;if(this.strict)throw t;if(!this.silent)console.error("glob error",t);break}};b.prototype._processGlobStar=function(e,t,r,n,i,a){var s=this._readdir(r,a);if(!s)return;var o=n.slice(1);var u=e?[e]:[];var f=u.concat(o);this._process(f,i,false);var l=s.length;var c=this.symlinks[r];if(c&&a)return;for(var h=0;h<l;h++){var p=s[h];if(p.charAt(0)==="."&&!this.dot)continue;var d=u.concat(s[h],o);this._process(d,i,true);var g=u.concat(s[h],n);this._process(g,i,true)}};b.prototype._processSimple=function(e,t){var n=this._stat(e);if(!this.matches[t])this.matches[t]=Object.create(null);if(!n)return;if(e&&l(e)&&!this.nomount){var i=/[\/\\]$/.test(e);if(e.charAt(0)==="/"){e=u.join(this.root,e)}else{e=u.resolve(this.root,e);if(i)e+="/"}}if(r.platform==="win32")e=e.replace(/\\/g,"/");this.matches[t][e]=true};b.prototype._stat=function(e){var t=this._makeAbs(e);var r=e.slice(-1)==="/";if(e.length>this.maxLength)return false;if(!this.stat&&g(this.cache,t)){var i=this.cache[t];if(Array.isArray(i))i="DIR";if(!r||i==="DIR")return i;if(r&&i==="FILE")return false}var a;var s=this.statCache[t];if(!s){var o;try{o=n.lstatSync(t)}catch(u){return false}if(o.isSymbolicLink()){try{s=n.statSync(t)}catch(u){s=o}}else{s=o}}this.statCache[t]=s;var i=s.isDirectory()?"DIR":"FILE";this.cache[t]=this.cache[t]||i;if(r&&i!=="DIR")return false;return i};b.prototype._mark=function(e){return c.mark(this,e)};b.prototype._makeAbs=function(e){return c.makeAbs(this,e)}}).call(this,e("_process"))},{"./common.js":231,"./glob.js":232,_process:14,assert:2,fs:1,minimatch:242,path:13,"path-is-absolute":238,util:46}],240:[function(e,t,r){"use strict";var n=e("path");var i=e("find-index");var a=function(e){var t=[];var r=true;for(var n=0;n<e.length;n++){if(typeof e[n]!=="string"){r=false;break}t.push(e[n])}if(r){t.pop()}return t};var s=function(e){var t=e[0];var r=e.slice(1);var n=i(t,function(e,t){if(typeof e!=="string"){return true}var n=r.every(function(r){return e===r[t]});return!n});return t.slice(0,n)};var o=function(e){if(e.length<=1){return a(e[0])}return s(e)};t.exports=function(e){var t=e.minimatch.set;var r=o(t);var i=n.normalize(r.join(n.sep))+n.sep;return i}},{"find-index":241,path:13}],241:[function(e,t,r){function n(e,t,r){var n=e.length;var i;if(n===0)return-1;if(typeof t!=="function"){throw new TypeError(t+" must be a function")}if(r){for(i=0;i<n;i++){if(t.call(r,e[i],i,e)){return i}}}else{for(i=0;i<n;i++){if(t(e[i],i,e)){return i}}}return-1}t.exports=n},{}],242:[function(e,t,r){t.exports=v;v.Minimatch=m;var n={sep:"/"};try{n=e("path")}catch(i){}var a=v.GLOBSTAR=m.GLOBSTAR={};var s=e("brace-expansion");var o="[^/]";var u=o+"*?";var f="(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";var l="(?:(?!(?:\\/|^)\\.).)*?";var c=h("().*{}+?[]^$\\!");function h(e){return e.split("").reduce(function(e,t){e[t]=true;return e},{})}var p=/\/+/;v.filter=d;function d(e,t){t=t||{};return function(r,n,i){return v(r,e,t)}}function g(e,t){e=e||{};t=t||{};var r={};Object.keys(t).forEach(function(e){r[e]=t[e]});Object.keys(e).forEach(function(t){r[t]=e[t]});return r}v.defaults=function(e){if(!e||!Object.keys(e).length)return v;var t=v;var r=function n(r,i,a){return t.minimatch(r,i,g(e,a))};r.Minimatch=function i(r,n){return new t.Minimatch(r,g(e,n))};return r};m.defaults=function(e){if(!e||!Object.keys(e).length)return m;return v.defaults(e).Minimatch};function v(e,t,r){if(typeof t!=="string"){throw new TypeError("glob pattern string required")}if(!r)r={};if(!r.nocomment&&t.charAt(0)==="#"){return false}if(t.trim()==="")return e==="";return new m(t,r).match(e)}function m(e,t){if(!(this instanceof m)){return new m(e,t)}if(typeof e!=="string"){throw new TypeError("glob pattern string required")}if(!t)t={};e=e.trim();if(n.sep!=="/"){e=e.split(n.sep).join("/")}this.options=t;this.set=[];this.pattern=e;this.regexp=null;this.negate=false;this.comment=false;this.empty=false;this.make()}m.prototype.debug=function(){};m.prototype.make=b;function b(){if(this._made)return;var e=this.pattern;var t=this.options;if(!t.nocomment&&e.charAt(0)==="#"){this.comment=true;return}if(!e){this.empty=true;return}this.parseNegate();var r=this.globSet=this.braceExpand();if(t.debug)this.debug=console.error;this.debug(this.pattern,r);r=this.globParts=r.map(function(e){return e.split(p)});this.debug(this.pattern,r);r=r.map(function(e,t,r){return e.map(this.parse,this)},this);this.debug(this.pattern,r);r=r.filter(function(e){return e.indexOf(false)===-1});this.debug(this.pattern,r);this.set=r}m.prototype.parseNegate=y;function y(){var e=this.pattern;var t=false;var r=this.options;var n=0;if(r.nonegate)return;for(var i=0,a=e.length;i<a&&e.charAt(i)==="!";i++){t=!t;n++}if(n)this.pattern=e.substr(n);this.negate=t}v.braceExpand=function(e,t){return _(e,t)};m.prototype.braceExpand=_;function _(e,t){if(!t){if(this instanceof m){t=this.options}else{t={}}}e=typeof e==="undefined"?this.pattern:e;if(typeof e==="undefined"){throw new Error("undefined pattern")}if(t.nobrace||!e.match(/\{.*\}/)){return[e]}return s(e)}m.prototype.parse=E;var w={};function E(e,t){var r=this.options;if(!r.noglobstar&&e==="**")return a;if(e==="")return"";var n="";var i=!!r.nocase;var s=false;var f=[];var l=[];var h;var p;var d=false;var g=-1;var v=-1;var m=e.charAt(0)==="."?"":r.dot?"(?!(?:^|\\/)\\.{1,2}(?:$|\\/))":"(?!\\.)";var b=this;function y(){if(p){switch(p){case"*":n+=u;i=true;break;case"?":n+=o;i=true;break;default:n+="\\"+p;break}b.debug("clearStateChar %j %j",p,n);p=false}}for(var _=0,E=e.length,S;_<E&&(S=e.charAt(_));_++){this.debug("%s	%s %s %j",e,_,n,S);if(s&&c[S]){n+="\\"+S;s=false;continue}switch(S){case"/":return false;case"\\":y();s=true;continue;case"?":case"*":case"+":case"@":case"!":this.debug("%s	%s %s %j <-- stateChar",e,_,n,S);if(d){this.debug("  in class");if(S==="!"&&_===v+1)S="^";n+=S;continue}b.debug("call clearStateChar %j",p);y();p=S;if(r.noext)y();continue;case"(":if(d){n+="(";continue}if(!p){n+="\\(";continue}h=p;f.push({type:h,start:_-1,reStart:n.length});n+=p==="!"?"(?:(?!(?:":"(?:";this.debug("plType %j %j",p,n);p=false;continue;case")":if(d||!f.length){n+="\\)";continue}y();i=true;n+=")";var x=f.pop();h=x.type;switch(h){case"!":l.push(x);n+=")[^/]*?)";x.reEnd=n.length;break;case"?":case"+":case"*":n+=h;break;case"@":break}continue;case"|":if(d||!f.length||s){n+="\\|";s=false;continue}y();n+="|";continue;case"[":y();if(d){n+="\\"+S;continue}d=true;v=_;g=n.length;n+=S;continue;case"]":if(_===v+1||!d){n+="\\"+S;s=false;continue}if(d){var j=e.substring(v+1,_);try{RegExp("["+j+"]")}catch(k){var A=this.parse(j,w);n=n.substr(0,g)+"\\["+A[0]+"\\]";i=i||A[1];d=false;continue}}i=true;d=false;n+=S;continue;default:y();if(s){s=false}else if(c[S]&&!(S==="^"&&d)){n+="\\"}n+=S}}if(d){j=e.substr(v+1);A=this.parse(j,w);n=n.substr(0,g)+"\\["+A[0];i=i||A[1]}for(x=f.pop();x;x=f.pop()){var R=n.slice(x.reStart+3);R=R.replace(/((?:\\{2})*)(\\?)\|/g,function(e,t,r){if(!r){r="\\"}return t+t+r+"|"});this.debug("tail=%j\n   %s",R,R);var L=x.type==="*"?u:x.type==="?"?o:"\\"+x.type;i=true;n=n.slice(0,x.reStart)+L+"\\("+R}y();if(s){n+="\\\\"}var T=false;switch(n.charAt(0)){case".":case"[":case"(":T=true}for(var I=l.length-1;I>-1;I--){var M=l[I];var C=n.slice(0,M.reStart);var P=n.slice(M.reStart,M.reEnd-8);var N=n.slice(M.reEnd-8,M.reEnd);var D=n.slice(M.reEnd);N+=D;var B=C.split("(").length-1;var U=D;for(_=0;_<B;_++){U=U.replace(/\)[+*?]?/,"")}D=U;var F="";if(D===""&&t!==w){F="$"}var q=C+P+D+F+N;n=q}if(n!==""&&i){n="(?=.)"+n}if(T){n=m+n}if(t===w){return[n,i]}if(!i){return O(e)}var G=r.nocase?"i":"";var W=new RegExp("^"+n+"$",G);W._glob=e;W._src=n;return W}v.makeRe=function(e,t){return new m(e,t||{}).makeRe()};m.prototype.makeRe=S;function S(){if(this.regexp||this.regexp===false)return this.regexp;var e=this.set;if(!e.length){this.regexp=false;return this.regexp}var t=this.options;var r=t.noglobstar?u:t.dot?f:l;var n=t.nocase?"i":"";var i=e.map(function(e){return e.map(function(e){return e===a?r:typeof e==="string"?j(e):e._src}).join("\\/")}).join("|");i="^(?:"+i+")$";if(this.negate)i="^(?!"+i+").*$";try{this.regexp=new RegExp(i,n)}catch(s){this.regexp=false}return this.regexp}v.match=function(e,t,r){r=r||{};var n=new m(t,r);e=e.filter(function(e){return n.match(e)});if(n.options.nonull&&!e.length){e.push(t)}return e};m.prototype.match=x;function x(e,t){this.debug("match",e,this.pattern);if(this.comment)return false;if(this.empty)return e==="";if(e==="/"&&t)return true;var r=this.options;if(n.sep!=="/"){e=e.split(n.sep).join("/")}e=e.split(p);this.debug(this.pattern,"split",e);var i=this.set;this.debug(this.pattern,"set",i);var a;var s;for(s=e.length-1;s>=0;s--){a=e[s];if(a)break}for(s=0;s<i.length;s++){var o=i[s];var u=e;if(r.matchBase&&o.length===1){u=[a]}var f=this.matchOne(u,o,t);if(f){if(r.flipNegate)return true;return!this.negate}}if(r.flipNegate)return false;return this.negate}m.prototype.matchOne=function(e,t,r){var n=this.options;this.debug("matchOne",{"this":this,file:e,pattern:t});this.debug("matchOne",e.length,t.length);for(var i=0,s=0,o=e.length,u=t.length;i<o&&s<u;i++,s++){this.debug("matchOne loop");var f=t[s];var l=e[i];this.debug(t,f,l);if(f===false)return false;if(f===a){this.debug("GLOBSTAR",[t,f,l]);var c=i;var h=s+1;if(h===u){this.debug("** at the end");for(;i<o;i++){if(e[i]==="."||e[i]===".."||!n.dot&&e[i].charAt(0)===".")return false}return true}while(c<o){var p=e[c];this.debug("\nglobstar while",e,c,t,h,p);if(this.matchOne(e.slice(c),t.slice(h),r)){this.debug("globstar found match!",c,o,p);return true}else{if(p==="."||p===".."||!n.dot&&p.charAt(0)==="."){this.debug("dot detected!",e,c,t,h);break}this.debug("globstar swallow a segment, and continue");c++}}if(r){this.debug("\n>>> no match, partial?",e,c,t,h);if(c===o)return true}return false}var d;if(typeof f==="string"){if(n.nocase){d=l.toLowerCase()===f.toLowerCase()}else{d=l===f}this.debug("string match",f,l,d)}else{d=l.match(f);this.debug("pattern match",f,l,d)}if(!d)return false}if(i===o&&s===u){return true}else if(i===o){return r}else if(s===u){var g=i===o-1&&e[i]==="";return g}throw new Error("wtf?")};function O(e){return e.replace(/\\(.)/g,"$1")}function j(e){return e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")}},{"brace-expansion":243,path:13}],243:[function(e,t,r){var n=e("concat-map");var i=e("balanced-match");t.exports=d;var a="\x00SLASH"+Math.random()+"\x00";var s="\x00OPEN"+Math.random()+"\x00";var o="\x00CLOSE"+Math.random()+"\x00";var u="\x00COMMA"+Math.random()+"\x00";var f="\x00PERIOD"+Math.random()+"\x00";function l(e){return parseInt(e,10)==e?parseInt(e,10):e.charCodeAt(0)}function c(e){return e.split("\\\\").join(a).split("\\{").join(s).split("\\}").join(o).split("\\,").join(u).split("\\.").join(f)}function h(e){return e.split(a).join("\\").split(s).join("{").split(o).join("}").split(u).join(",").split(f).join(".")}function p(e){if(!e)return[""];var t=[];var r=i("{","}",e);if(!r)return e.split(",");var n=r.pre;var a=r.body;var s=r.post;var o=n.split(",");o[o.length-1]+="{"+a+"}";var u=p(s);if(s.length){o[o.length-1]+=u.shift();o.push.apply(o,u)}t.push.apply(t,o);return t}function d(e){if(!e)return[];return _(c(e),true).map(h)}function g(e){return e}function v(e){return"{"+e+"}"}function m(e){return/^-?0\d/.test(e)}function b(e,t){return e<=t}function y(e,t){return e>=t}function _(e,t){var r=[];var a=i("{","}",e);if(!a||/\$$/.test(a.pre))return[e];var s=/^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(a.body);var u=/^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(a.body);var f=s||u;var c=/^(.*,)+(.+)?$/.test(a.body);if(!f&&!c){if(a.post.match(/,.*}/)){e=a.pre+"{"+a.body+o+a.post;return _(e)}return[e]}var h;if(f){h=a.body.split(/\.\./)}else{h=p(a.body);if(h.length===1){h=_(h[0],false).map(v);if(h.length===1){var d=a.post.length?_(a.post,false):[""];return d.map(function(e){return a.pre+h[0]+e})}}}var g=a.pre;var d=a.post.length?_(a.post,false):[""];var w;if(f){var E=l(h[0]);var S=l(h[1]);var x=Math.max(h[0].length,h[1].length);var O=h.length==3?Math.abs(l(h[2])):1;var j=b;var k=S<E;if(k){O*=-1;j=y}var A=h.some(m);w=[];for(var R=E;j(R,S);R+=O){var L;if(u){L=String.fromCharCode(R);if(L==="\\")L=""}else{L=String(R);if(A){var T=x-L.length;if(T>0){var I=new Array(T+1).join("0");if(R<0)L="-"+I+L.slice(1);else L=I+L}}}w.push(L)}}else{w=n(h,function(e){return _(e,false)})}for(var M=0;M<w.length;M++){for(var C=0;C<d.length;C++){var P=g+w[M]+d[C];if(!t||f||P)r.push(P)}}return r}},{"balanced-match":244,"concat-map":245}],244:[function(e,t,r){t.exports=n;function n(e,t,r){var i=0;var a={};var s=false;for(var o=0;o<r.length;o++){if(e==r.substr(o,e.length)){if(!("start"in a))a.start=o;i++}else if(t==r.substr(o,t.length)&&"start"in a){s=true;i--;if(!i){a.end=o;a.pre=r.substr(0,a.start);a.body=a.end-a.start>1?r.substring(a.start+e.length,a.end):"";a.post=r.slice(a.end+t.length);return a}}}if(i&&s){var u=a.start+e.length;a=n(e,t,r.substr(u));if(a){a.start+=u;a.end+=u;a.pre=r.slice(0,u)+a.pre}return a}}},{}],245:[function(e,t,r){t.exports=function(e,t){var r=[];for(var i=0;i<e.length;i++){var a=t(e[i],i);if(n(a))r.push.apply(r,a);else r.push(a)}return r};var n=Array.isArray||function(e){return Object.prototype.toString.call(e)==="[object Array]"}},{}],246:[function(e,t,r){var n=e("readable-stream").Readable;var i=e("isstream").isReadable;var a=e("util");function s(e,t){if(!i(t))throw new Error("All input streams must be readable");var r=this;t._buffer=[];t.on("readable",function(){var n=t.read();if(n===null)return;if(this===e[0])r.push(n);else this._buffer.push(n)});t.on("end",function(){for(var t=e[0];t&&t._readableState.ended;t=e[0]){while(t._buffer.length)r.push(t._buffer.shift());e.shift()}if(!e.length)r.push(null)});t.on("error",this.emit.bind(this,"error"));e.push(t)}function o(e,t){if(!(this instanceof o)){return new o(e,t)}e=e||[];t=t||{};t.objectMode=true;n.call(this,t);if(!Array.isArray(e))e=[e];if(!e.length)return this.push(null);var r=s.bind(this,[]);e.forEach(function(e){if(Array.isArray(e))e.forEach(r);else r(e)})}a.inherits(o,n);o.prototype._read=function(){};t.exports=o},{isstream:247,"readable-stream":257,util:46}],247:[function(e,t,r){var n=e("stream");function i(e){return e instanceof n.Stream}function a(e){return i(e)&&typeof e._read=="function"&&typeof e._readableState=="object"}function s(e){return i(e)&&typeof e._write=="function"&&typeof e._writableState=="object"}function o(e){return a(e)&&s(e)}t.exports=i;t.exports.isReadable=a;t.exports.isWritable=s;t.exports.isDuplex=o},{stream:32}],248:[function(e,t,r){(function(r){t.exports=o;var n=Object.keys||function(e){var t=[];for(var r in e)t.push(r);return t};var i=e("core-util-is");i.inherits=e("inherits");var a=e("./_stream_readable");var s=e("./_stream_writable");i.inherits(o,a);f(n(s.prototype),function(e){if(!o.prototype[e])o.prototype[e]=s.prototype[e]});function o(e){if(!(this instanceof o))return new o(e);a.call(this,e);s.call(this,e);if(e&&e.readable===false)this.readable=false;if(e&&e.writable===false)this.writable=false;this.allowHalfOpen=true;if(e&&e.allowHalfOpen===false)this.allowHalfOpen=false;this.once("end",u)}function u(){if(this.allowHalfOpen||this._writableState.ended)return;r.nextTick(this.end.bind(this))}function f(e,t){for(var r=0,n=e.length;r<n;r++){t(e[r],r)}}}).call(this,e("_process"))},{"./_stream_readable":250,"./_stream_writable":252,_process:14,"core-util-is":253,inherits:254}],249:[function(e,t,r){t.exports=a;var n=e("./_stream_transform");var i=e("core-util-is");i.inherits=e("inherits");i.inherits(a,n);function a(e){if(!(this instanceof a))return new a(e);n.call(this,e)}a.prototype._transform=function(e,t,r){r(null,e)}},{"./_stream_transform":251,"core-util-is":253,inherits:254}],250:[function(e,t,r){(function(r){t.exports=c;var n=e("isarray");var i=e("buffer").Buffer;c.ReadableState=l;var a=e("events").EventEmitter;if(!a.listenerCount)a.listenerCount=function(e,t){return e.listeners(t).length};var s=e("stream");var o=e("core-util-is");o.inherits=e("inherits");var u;var f=e("util");if(f&&f.debuglog){f=f.debuglog("stream")}else{f=function(){}}o.inherits(c,s);function l(t,r){var n=e("./_stream_duplex");t=t||{};var i=t.highWaterMark;var a=t.objectMode?16:16*1024;this.highWaterMark=i||i===0?i:a;this.highWaterMark=~~this.highWaterMark;this.buffer=[];this.length=0;this.pipes=null;this.pipesCount=0;this.flowing=null;this.ended=false;this.endEmitted=false;this.reading=false;this.sync=true;this.needReadable=false;this.emittedReadable=false;this.readableListening=false;this.objectMode=!!t.objectMode;if(r instanceof n)this.objectMode=this.objectMode||!!t.readableObjectMode;this.defaultEncoding=t.defaultEncoding||"utf8";this.ranOut=false;this.awaitDrain=0;this.readingMore=false;this.decoder=null;this.encoding=null;if(t.encoding){if(!u)u=e("string_decoder/").StringDecoder;this.decoder=new u(t.encoding);this.encoding=t.encoding}}function c(t){var r=e("./_stream_duplex");if(!(this instanceof c))return new c(t);this._readableState=new l(t,this);this.readable=true;s.call(this)}c.prototype.push=function(e,t){var r=this._readableState;if(o.isString(e)&&!r.objectMode){t=t||r.defaultEncoding;if(t!==r.encoding){e=new i(e,t);t=""}}return h(this,r,e,t,false)};c.prototype.unshift=function(e){var t=this._readableState;return h(this,t,e,"",true)};function h(e,t,r,n,i){var a=m(t,r);if(a){e.emit("error",a)}else if(o.isNullOrUndefined(r)){t.reading=false;if(!t.ended)b(e,t)}else if(t.objectMode||r&&r.length>0){if(t.ended&&!i){var s=new Error("stream.push() after EOF");e.emit("error",s)}else if(t.endEmitted&&i){var s=new Error("stream.unshift() after end event");e.emit("error",s)}else{if(t.decoder&&!i&&!n)r=t.decoder.write(r);if(!i)t.reading=false;if(t.flowing&&t.length===0&&!t.sync){e.emit("data",r);e.read(0)}else{t.length+=t.objectMode?1:r.length;if(i)t.buffer.unshift(r);else t.buffer.push(r);if(t.needReadable)y(e)}w(e,t)}}else if(!i){t.reading=false}return p(t)}function p(e){return!e.ended&&(e.needReadable||e.length<e.highWaterMark||e.length===0)}c.prototype.setEncoding=function(t){if(!u)u=e("string_decoder/").StringDecoder;this._readableState.decoder=new u(t);this._readableState.encoding=t;return this};var d=8388608;function g(e){if(e>=d){e=d}else{e--;for(var t=1;t<32;t<<=1)e|=e>>t;e++}return e}function v(e,t){if(t.length===0&&t.ended)return 0;if(t.objectMode)return e===0?0:1;if(isNaN(e)||o.isNull(e)){if(t.flowing&&t.buffer.length)return t.buffer[0].length;else return t.length}if(e<=0)return 0;if(e>t.highWaterMark)t.highWaterMark=g(e);if(e>t.length){if(!t.ended){t.needReadable=true;return 0}else return t.length}return e}c.prototype.read=function(e){f("read",e);var t=this._readableState;var r=e;if(!o.isNumber(e)||e>0)t.emittedReadable=false;if(e===0&&t.needReadable&&(t.length>=t.highWaterMark||t.ended)){f("read: emitReadable",t.length,t.ended);if(t.length===0&&t.ended)A(this);else y(this);return null}e=v(e,t);if(e===0&&t.ended){if(t.length===0)A(this);return null}var n=t.needReadable;f("need readable",n);if(t.length===0||t.length-e<t.highWaterMark){n=true;f("length less than watermark",n)}if(t.ended||t.reading){n=false;f("reading or ended",n)}if(n){f("do read");t.reading=true;t.sync=true;if(t.length===0)t.needReadable=true;this._read(t.highWaterMark);t.sync=false}if(n&&!t.reading)e=v(r,t);var i;if(e>0)i=k(e,t);else i=null;if(o.isNull(i)){t.needReadable=true;e=0}t.length-=e;if(t.length===0&&!t.ended)t.needReadable=true;if(r!==e&&t.ended&&t.length===0)A(this);if(!o.isNull(i))this.emit("data",i);return i};function m(e,t){var r=null;if(!o.isBuffer(t)&&!o.isString(t)&&!o.isNullOrUndefined(t)&&!e.objectMode){r=new TypeError("Invalid non-string/buffer chunk")}return r}function b(e,t){if(t.decoder&&!t.ended){var r=t.decoder.end();if(r&&r.length){t.buffer.push(r);t.length+=t.objectMode?1:r.length}}t.ended=true;y(e)}function y(e){var t=e._readableState;t.needReadable=false;if(!t.emittedReadable){f("emitReadable",t.flowing);t.emittedReadable=true;if(t.sync)r.nextTick(function(){_(e)});else _(e)}}function _(e){f("emit readable");e.emit("readable");j(e)}function w(e,t){if(!t.readingMore){t.readingMore=true;r.nextTick(function(){E(e,t)})}}function E(e,t){var r=t.length;while(!t.reading&&!t.flowing&&!t.ended&&t.length<t.highWaterMark){f("maybeReadMore read 0");e.read(0);if(r===t.length)break;else r=t.length}t.readingMore=false}c.prototype._read=function(e){this.emit("error",new Error("not implemented"))};c.prototype.pipe=function(e,t){var i=this;var s=this._readableState;switch(s.pipesCount){case 0:s.pipes=e;break;case 1:s.pipes=[s.pipes,e];break;default:s.pipes.push(e);break}s.pipesCount+=1;f("pipe count=%d opts=%j",s.pipesCount,t);var o=(!t||t.end!==false)&&e!==r.stdout&&e!==r.stderr;var u=o?c:p;if(s.endEmitted)r.nextTick(u);else i.once("end",u);e.on("unpipe",l);function l(e){f("onunpipe");if(e===i){p()}}function c(){f("onend");e.end()}var h=S(i);e.on("drain",h);function p(){f("cleanup");e.removeListener("close",v);e.removeListener("finish",m);e.removeListener("drain",h);e.removeListener("error",g);e.removeListener("unpipe",l);i.removeListener("end",c);i.removeListener("end",p);i.removeListener("data",d);if(s.awaitDrain&&(!e._writableState||e._writableState.needDrain))h()}i.on("data",d);function d(t){f("ondata");var r=e.write(t);if(false===r){f("false write response, pause",i._readableState.awaitDrain);i._readableState.awaitDrain++;i.pause()}}function g(t){f("onerror",t);b();e.removeListener("error",g);if(a.listenerCount(e,"error")===0)e.emit("error",t)}if(!e._events||!e._events.error)e.on("error",g);else if(n(e._events.error))e._events.error.unshift(g);else e._events.error=[g,e._events.error];function v(){e.removeListener("finish",m);b()}e.once("close",v);function m(){f("onfinish");e.removeListener("close",v);b()}e.once("finish",m);function b(){f("unpipe");i.unpipe(e)}e.emit("pipe",i);if(!s.flowing){f("pipe resume");i.resume()}return e};function S(e){return function(){var t=e._readableState;f("pipeOnDrain",t.awaitDrain);if(t.awaitDrain)t.awaitDrain--;if(t.awaitDrain===0&&a.listenerCount(e,"data")){t.flowing=true;j(e)}}}c.prototype.unpipe=function(e){var t=this._readableState;if(t.pipesCount===0)return this;if(t.pipesCount===1){if(e&&e!==t.pipes)return this;if(!e)e=t.pipes;t.pipes=null;t.pipesCount=0;t.flowing=false;if(e)e.emit("unpipe",this);return this}if(!e){var r=t.pipes;var n=t.pipesCount;t.pipes=null;t.pipesCount=0;t.flowing=false;for(var i=0;i<n;i++)r[i].emit("unpipe",this);return this}var i=L(t.pipes,e);if(i===-1)return this;t.pipes.splice(i,1);t.pipesCount-=1;if(t.pipesCount===1)t.pipes=t.pipes[0];e.emit("unpipe",this);return this};c.prototype.on=function(e,t){var n=s.prototype.on.call(this,e,t);if(e==="data"&&false!==this._readableState.flowing){this.resume()}if(e==="readable"&&this.readable){var i=this._readableState;if(!i.readableListening){i.readableListening=true;i.emittedReadable=false;i.needReadable=true;if(!i.reading){var a=this;r.nextTick(function(){f("readable nexttick read 0");a.read(0)})}else if(i.length){y(this,i)}}}return n};c.prototype.addListener=c.prototype.on;c.prototype.resume=function(){var e=this._readableState;if(!e.flowing){f("resume");e.flowing=true;if(!e.reading){f("resume read 0");this.read(0)}x(this,e)}return this};function x(e,t){if(!t.resumeScheduled){t.resumeScheduled=true;r.nextTick(function(){O(e,t)})}}function O(e,t){t.resumeScheduled=false;e.emit("resume");j(e);if(t.flowing&&!t.reading)e.read(0)}c.prototype.pause=function(){f("call pause flowing=%j",this._readableState.flowing);if(false!==this._readableState.flowing){f("pause");this._readableState.flowing=false;this.emit("pause")}return this};function j(e){var t=e._readableState;f("flow",t.flowing);if(t.flowing){do{var r=e.read()}while(null!==r&&t.flowing)}}c.prototype.wrap=function(e){var t=this._readableState;var r=false;var n=this;e.on("end",function(){f("wrapped end");if(t.decoder&&!t.ended){var e=t.decoder.end();if(e&&e.length)n.push(e)}n.push(null)});e.on("data",function(i){f("wrapped data");if(t.decoder)i=t.decoder.write(i);if(!i||!t.objectMode&&!i.length)return;var a=n.push(i);if(!a){r=true;e.pause()}});for(var i in e){if(o.isFunction(e[i])&&o.isUndefined(this[i])){this[i]=function(t){return function(){return e[t].apply(e,arguments)}}(i)}}var a=["error","close","destroy","pause","resume"];R(a,function(t){e.on(t,n.emit.bind(n,t))});n._read=function(t){f("wrapped _read",t);if(r){r=false;e.resume()}};return n};c._fromList=k;function k(e,t){var r=t.buffer;var n=t.length;var a=!!t.decoder;var s=!!t.objectMode;var o;if(r.length===0)return null;if(n===0)o=null;else if(s)o=r.shift();else if(!e||e>=n){if(a)o=r.join("");else o=i.concat(r,n);r.length=0}else{if(e<r[0].length){var u=r[0];o=u.slice(0,e);r[0]=u.slice(e)}else if(e===r[0].length){o=r.shift()}else{if(a)o="";else o=new i(e);var f=0;for(var l=0,c=r.length;l<c&&f<e;l++){var u=r[0];var h=Math.min(e-f,u.length);if(a)o+=u.slice(0,h);else u.copy(o,f,0,h);if(h<u.length)r[0]=u.slice(h);else r.shift();f+=h}}}return o}function A(e){var t=e._readableState;if(t.length>0)throw new Error("endReadable called on non-empty stream");if(!t.endEmitted){t.ended=true;r.nextTick(function(){if(!t.endEmitted&&t.length===0){t.endEmitted=true;e.readable=false;e.emit("end")}})}}function R(e,t){for(var r=0,n=e.length;r<n;r++){t(e[r],r)}}function L(e,t){for(var r=0,n=e.length;r<n;r++){if(e[r]===t)return r}return-1}}).call(this,e("_process"))},{"./_stream_duplex":248,_process:14,buffer:4,"core-util-is":253,events:9,inherits:254,isarray:255,stream:32,"string_decoder/":256,util:3}],251:[function(e,t,r){t.exports=o;var n=e("./_stream_duplex");var i=e("core-util-is");i.inherits=e("inherits");i.inherits(o,n);function a(e,t){this.afterTransform=function(e,r){return s(t,e,r)};this.needTransform=false;this.transforming=false;this.writecb=null;this.writechunk=null}function s(e,t,r){var n=e._transformState;n.transforming=false;var a=n.writecb;if(!a)return e.emit("error",new Error("no writecb in Transform class"));n.writechunk=null;n.writecb=null;if(!i.isNullOrUndefined(r))e.push(r);if(a)a(t);var s=e._readableState;s.reading=false;if(s.needReadable||s.length<s.highWaterMark){e._read(s.highWaterMark)}}function o(e){if(!(this instanceof o))return new o(e);n.call(this,e);this._transformState=new a(e,this);var t=this;this._readableState.needReadable=true;this._readableState.sync=false;this.once("prefinish",function(){if(i.isFunction(this._flush))this._flush(function(e){u(t,e)});else u(t)})}o.prototype.push=function(e,t){this._transformState.needTransform=false;return n.prototype.push.call(this,e,t)};o.prototype._transform=function(e,t,r){throw new Error("not implemented")};o.prototype._write=function(e,t,r){var n=this._transformState;n.writecb=r;n.writechunk=e;n.writeencoding=t;if(!n.transforming){var i=this._readableState;if(n.needTransform||i.needReadable||i.length<i.highWaterMark)this._read(i.highWaterMark)}};o.prototype._read=function(e){var t=this._transformState;if(!i.isNull(t.writechunk)&&t.writecb&&!t.transforming){t.transforming=true;this._transform(t.writechunk,t.writeencoding,t.afterTransform)}else{t.needTransform=true}};function u(e,t){if(t)return e.emit("error",t);var r=e._writableState;var n=e._transformState;if(r.length)throw new Error("calling transform done when ws.length != 0");if(n.transforming)throw new Error("calling transform done when still transforming");return e.push(null)}},{"./_stream_duplex":248,"core-util-is":253,inherits:254}],252:[function(e,t,r){(function(r){t.exports=u;var n=e("buffer").Buffer;u.WritableState=o;var i=e("core-util-is");i.inherits=e("inherits");var a=e("stream");i.inherits(u,a);function s(e,t,r){this.chunk=e;this.encoding=t;this.callback=r}function o(t,r){var n=e("./_stream_duplex");t=t||{};var i=t.highWaterMark;var a=t.objectMode?16:16*1024;this.highWaterMark=i||i===0?i:a;this.objectMode=!!t.objectMode;if(r instanceof n)this.objectMode=this.objectMode||!!t.writableObjectMode;this.highWaterMark=~~this.highWaterMark;this.needDrain=false;this.ending=false;this.ended=false;this.finished=false;var s=t.decodeStrings===false;this.decodeStrings=!s;this.defaultEncoding=t.defaultEncoding||"utf8";this.length=0;this.writing=false;this.corked=0;this.sync=true;this.bufferProcessing=false;this.onwrite=function(e){v(r,e)};this.writecb=null;this.writelen=0;this.buffer=[];this.pendingcb=0;this.prefinished=false;this.errorEmitted=false}function u(t){var r=e("./_stream_duplex");if(!(this instanceof u)&&!(this instanceof r))return new u(t);this._writableState=new o(t,this);this.writable=true;a.call(this)}u.prototype.pipe=function(){this.emit("error",new Error("Cannot pipe. Not readable."))};function f(e,t,n){var i=new Error("write after end");e.emit("error",i);r.nextTick(function(){n(i)})}function l(e,t,n,a){var s=true;if(!i.isBuffer(n)&&!i.isString(n)&&!i.isNullOrUndefined(n)&&!t.objectMode){var o=new TypeError("Invalid non-string/buffer chunk");e.emit("error",o);r.nextTick(function(){a(o)});s=false}return s}u.prototype.write=function(e,t,r){var n=this._writableState;var a=false;if(i.isFunction(t)){r=t;t=null}if(i.isBuffer(e))t="buffer";else if(!t)t=n.defaultEncoding;if(!i.isFunction(r))r=function(){};if(n.ended)f(this,n,r);else if(l(this,n,e,r)){n.pendingcb++;a=h(this,n,e,t,r)}return a};u.prototype.cork=function(){var e=this._writableState;e.corked++};u.prototype.uncork=function(){var e=this._writableState;if(e.corked){e.corked--;if(!e.writing&&!e.corked&&!e.finished&&!e.bufferProcessing&&e.buffer.length)y(this,e)}};function c(e,t,r){if(!e.objectMode&&e.decodeStrings!==false&&i.isString(t)){t=new n(t,r)}return t}function h(e,t,r,n,a){r=c(t,r,n);if(i.isBuffer(r))n="buffer";var o=t.objectMode?1:r.length;t.length+=o;var u=t.length<t.highWaterMark;if(!u)t.needDrain=true;if(t.writing||t.corked)t.buffer.push(new s(r,n,a));else p(e,t,false,o,r,n,a);return u}function p(e,t,r,n,i,a,s){t.writelen=n;t.writecb=s;t.writing=true;t.sync=true;if(r)e._writev(i,t.onwrite);else e._write(i,a,t.onwrite);t.sync=false}function d(e,t,n,i,a){if(n)r.nextTick(function(){t.pendingcb--;a(i)});else{t.pendingcb--;a(i)}e._writableState.errorEmitted=true;e.emit("error",i)}function g(e){e.writing=false;e.writecb=null;e.length-=e.writelen;e.writelen=0}function v(e,t){var n=e._writableState;var i=n.sync;var a=n.writecb;g(n);if(t)d(e,n,i,t,a);else{var s=_(e,n);if(!s&&!n.corked&&!n.bufferProcessing&&n.buffer.length){y(e,n)}if(i){r.nextTick(function(){m(e,n,s,a)})}else{m(e,n,s,a)}}}function m(e,t,r,n){if(!r)b(e,t);t.pendingcb--;n();E(e,t)}function b(e,t){if(t.length===0&&t.needDrain){t.needDrain=false;e.emit("drain")}}function y(e,t){t.bufferProcessing=true;if(e._writev&&t.buffer.length>1){var r=[];for(var n=0;n<t.buffer.length;n++)r.push(t.buffer[n].callback);t.pendingcb++;p(e,t,true,t.length,t.buffer,"",function(e){for(var n=0;n<r.length;n++){t.pendingcb--;r[n](e)}});t.buffer=[]}else{for(var n=0;n<t.buffer.length;n++){var i=t.buffer[n];var a=i.chunk;var s=i.encoding;var o=i.callback;var u=t.objectMode?1:a.length;p(e,t,false,u,a,s,o);if(t.writing){n++;break}}if(n<t.buffer.length)t.buffer=t.buffer.slice(n);else t.buffer.length=0}t.bufferProcessing=false}u.prototype._write=function(e,t,r){r(new Error("not implemented"))};u.prototype._writev=null;u.prototype.end=function(e,t,r){var n=this._writableState;if(i.isFunction(e)){r=e;e=null;t=null}else if(i.isFunction(t)){r=t;t=null}if(!i.isNullOrUndefined(e))this.write(e,t);if(n.corked){n.corked=1;this.uncork()}if(!n.ending&&!n.finished)S(this,n,r)};function _(e,t){return t.ending&&t.length===0&&!t.finished&&!t.writing}function w(e,t){if(!t.prefinished){t.prefinished=true;e.emit("prefinish")}}function E(e,t){var r=_(e,t);if(r){if(t.pendingcb===0){w(e,t);t.finished=true;e.emit("finish")}else w(e,t)}return r}function S(e,t,n){t.ending=true;E(e,t);if(n){if(t.finished)r.nextTick(n);else e.once("finish",n)}t.ended=true}}).call(this,e("_process"))},{"./_stream_duplex":248,_process:14,buffer:4,"core-util-is":253,inherits:254,stream:32}],253:[function(e,t,r){arguments[4][25][0].apply(r,arguments)},{buffer:4,dup:25}],254:[function(e,t,r){
arguments[4][10][0].apply(r,arguments)},{dup:10}],255:[function(e,t,r){arguments[4][11][0].apply(r,arguments)},{dup:11}],256:[function(e,t,r){arguments[4][42][0].apply(r,arguments)},{buffer:4,dup:42}],257:[function(e,t,r){r=t.exports=e("./lib/_stream_readable.js");r.Stream=e("stream");r.Readable=r;r.Writable=e("./lib/_stream_writable.js");r.Duplex=e("./lib/_stream_duplex.js");r.Transform=e("./lib/_stream_transform.js");r.PassThrough=e("./lib/_stream_passthrough.js")},{"./lib/_stream_duplex.js":248,"./lib/_stream_passthrough.js":249,"./lib/_stream_readable.js":250,"./lib/_stream_transform.js":251,"./lib/_stream_writable.js":252,stream:32}],258:[function(e,t,r){arguments[4][248][0].apply(r,arguments)},{"./_stream_readable":259,"./_stream_writable":261,_process:14,"core-util-is":262,dup:248,inherits:263}],259:[function(e,t,r){(function(r){t.exports=l;var n=e("isarray");var i=e("buffer").Buffer;l.ReadableState=f;var a=e("events").EventEmitter;if(!a.listenerCount)a.listenerCount=function(e,t){return e.listeners(t).length};var s=e("stream");var o=e("core-util-is");o.inherits=e("inherits");var u;o.inherits(l,s);function f(t,r){t=t||{};var n=t.highWaterMark;this.highWaterMark=n||n===0?n:16*1024;this.highWaterMark=~~this.highWaterMark;this.buffer=[];this.length=0;this.pipes=null;this.pipesCount=0;this.flowing=false;this.ended=false;this.endEmitted=false;this.reading=false;this.calledRead=false;this.sync=true;this.needReadable=false;this.emittedReadable=false;this.readableListening=false;this.objectMode=!!t.objectMode;this.defaultEncoding=t.defaultEncoding||"utf8";this.ranOut=false;this.awaitDrain=0;this.readingMore=false;this.decoder=null;this.encoding=null;if(t.encoding){if(!u)u=e("string_decoder/").StringDecoder;this.decoder=new u(t.encoding);this.encoding=t.encoding}}function l(e){if(!(this instanceof l))return new l(e);this._readableState=new f(e,this);this.readable=true;s.call(this)}l.prototype.push=function(e,t){var r=this._readableState;if(typeof e==="string"&&!r.objectMode){t=t||r.defaultEncoding;if(t!==r.encoding){e=new i(e,t);t=""}}return c(this,r,e,t,false)};l.prototype.unshift=function(e){var t=this._readableState;return c(this,t,e,"",true)};function c(e,t,r,n,i){var a=v(t,r);if(a){e.emit("error",a)}else if(r===null||r===undefined){t.reading=false;if(!t.ended)m(e,t)}else if(t.objectMode||r&&r.length>0){if(t.ended&&!i){var s=new Error("stream.push() after EOF");e.emit("error",s)}else if(t.endEmitted&&i){var s=new Error("stream.unshift() after end event");e.emit("error",s)}else{if(t.decoder&&!i&&!n)r=t.decoder.write(r);t.length+=t.objectMode?1:r.length;if(i){t.buffer.unshift(r)}else{t.reading=false;t.buffer.push(r)}if(t.needReadable)b(e);_(e,t)}}else if(!i){t.reading=false}return h(t)}function h(e){return!e.ended&&(e.needReadable||e.length<e.highWaterMark||e.length===0)}l.prototype.setEncoding=function(t){if(!u)u=e("string_decoder/").StringDecoder;this._readableState.decoder=new u(t);this._readableState.encoding=t};var p=8388608;function d(e){if(e>=p){e=p}else{e--;for(var t=1;t<32;t<<=1)e|=e>>t;e++}return e}function g(e,t){if(t.length===0&&t.ended)return 0;if(t.objectMode)return e===0?0:1;if(e===null||isNaN(e)){if(t.flowing&&t.buffer.length)return t.buffer[0].length;else return t.length}if(e<=0)return 0;if(e>t.highWaterMark)t.highWaterMark=d(e);if(e>t.length){if(!t.ended){t.needReadable=true;return 0}else return t.length}return e}l.prototype.read=function(e){var t=this._readableState;t.calledRead=true;var r=e;var n;if(typeof e!=="number"||e>0)t.emittedReadable=false;if(e===0&&t.needReadable&&(t.length>=t.highWaterMark||t.ended)){b(this);return null}e=g(e,t);if(e===0&&t.ended){n=null;if(t.length>0&&t.decoder){n=j(e,t);t.length-=n.length}if(t.length===0)k(this);return n}var i=t.needReadable;if(t.length-e<=t.highWaterMark)i=true;if(t.ended||t.reading)i=false;if(i){t.reading=true;t.sync=true;if(t.length===0)t.needReadable=true;this._read(t.highWaterMark);t.sync=false}if(i&&!t.reading)e=g(r,t);if(e>0)n=j(e,t);else n=null;if(n===null){t.needReadable=true;e=0}t.length-=e;if(t.length===0&&!t.ended)t.needReadable=true;if(t.ended&&!t.endEmitted&&t.length===0)k(this);return n};function v(e,t){var r=null;if(!i.isBuffer(t)&&"string"!==typeof t&&t!==null&&t!==undefined&&!e.objectMode){r=new TypeError("Invalid non-string/buffer chunk")}return r}function m(e,t){if(t.decoder&&!t.ended){var r=t.decoder.end();if(r&&r.length){t.buffer.push(r);t.length+=t.objectMode?1:r.length}}t.ended=true;if(t.length>0)b(e);else k(e)}function b(e){var t=e._readableState;t.needReadable=false;if(t.emittedReadable)return;t.emittedReadable=true;if(t.sync)r.nextTick(function(){y(e)});else y(e)}function y(e){e.emit("readable")}function _(e,t){if(!t.readingMore){t.readingMore=true;r.nextTick(function(){w(e,t)})}}function w(e,t){var r=t.length;while(!t.reading&&!t.flowing&&!t.ended&&t.length<t.highWaterMark){e.read(0);if(r===t.length)break;else r=t.length}t.readingMore=false}l.prototype._read=function(e){this.emit("error",new Error("not implemented"))};l.prototype.pipe=function(e,t){var i=this;var s=this._readableState;switch(s.pipesCount){case 0:s.pipes=e;break;case 1:s.pipes=[s.pipes,e];break;default:s.pipes.push(e);break}s.pipesCount+=1;var o=(!t||t.end!==false)&&e!==r.stdout&&e!==r.stderr;var u=o?l:h;if(s.endEmitted)r.nextTick(u);else i.once("end",u);e.on("unpipe",f);function f(e){if(e!==i)return;h()}function l(){e.end()}var c=E(i);e.on("drain",c);function h(){e.removeListener("close",d);e.removeListener("finish",g);e.removeListener("drain",c);e.removeListener("error",p);e.removeListener("unpipe",f);i.removeListener("end",l);i.removeListener("end",h);if(!e._writableState||e._writableState.needDrain)c()}function p(t){v();e.removeListener("error",p);if(a.listenerCount(e,"error")===0)e.emit("error",t)}if(!e._events||!e._events.error)e.on("error",p);else if(n(e._events.error))e._events.error.unshift(p);else e._events.error=[p,e._events.error];function d(){e.removeListener("finish",g);v()}e.once("close",d);function g(){e.removeListener("close",d);v()}e.once("finish",g);function v(){i.unpipe(e)}e.emit("pipe",i);if(!s.flowing){this.on("readable",x);s.flowing=true;r.nextTick(function(){S(i)})}return e};function E(e){return function(){var t=this;var r=e._readableState;r.awaitDrain--;if(r.awaitDrain===0)S(e)}}function S(e){var t=e._readableState;var r;t.awaitDrain=0;function n(e,n,i){var a=e.write(r);if(false===a){t.awaitDrain++}}while(t.pipesCount&&null!==(r=e.read())){if(t.pipesCount===1)n(t.pipes,0,null);else A(t.pipes,n);e.emit("data",r);if(t.awaitDrain>0)return}if(t.pipesCount===0){t.flowing=false;if(a.listenerCount(e,"data")>0)O(e);return}t.ranOut=true}function x(){if(this._readableState.ranOut){this._readableState.ranOut=false;S(this)}}l.prototype.unpipe=function(e){var t=this._readableState;if(t.pipesCount===0)return this;if(t.pipesCount===1){if(e&&e!==t.pipes)return this;if(!e)e=t.pipes;t.pipes=null;t.pipesCount=0;this.removeListener("readable",x);t.flowing=false;if(e)e.emit("unpipe",this);return this}if(!e){var r=t.pipes;var n=t.pipesCount;t.pipes=null;t.pipesCount=0;this.removeListener("readable",x);t.flowing=false;for(var i=0;i<n;i++)r[i].emit("unpipe",this);return this}var i=R(t.pipes,e);if(i===-1)return this;t.pipes.splice(i,1);t.pipesCount-=1;if(t.pipesCount===1)t.pipes=t.pipes[0];e.emit("unpipe",this);return this};l.prototype.on=function(e,t){var r=s.prototype.on.call(this,e,t);if(e==="data"&&!this._readableState.flowing)O(this);if(e==="readable"&&this.readable){var n=this._readableState;if(!n.readableListening){n.readableListening=true;n.emittedReadable=false;n.needReadable=true;if(!n.reading){this.read(0)}else if(n.length){b(this,n)}}}return r};l.prototype.addListener=l.prototype.on;l.prototype.resume=function(){O(this);this.read(0);this.emit("resume")};l.prototype.pause=function(){O(this,true);this.emit("pause")};function O(e,t){var n=e._readableState;if(n.flowing){throw new Error("Cannot switch to old mode now.")}var i=t||false;var a=false;e.readable=true;e.pipe=s.prototype.pipe;e.on=e.addListener=s.prototype.on;e.on("readable",function(){a=true;var t;while(!i&&null!==(t=e.read()))e.emit("data",t);if(t===null){a=false;e._readableState.needReadable=true}});e.pause=function(){i=true;this.emit("pause")};e.resume=function(){i=false;if(a)r.nextTick(function(){e.emit("readable")});else this.read(0);this.emit("resume")};e.emit("readable")}l.prototype.wrap=function(e){var t=this._readableState;var r=false;var n=this;e.on("end",function(){if(t.decoder&&!t.ended){var e=t.decoder.end();if(e&&e.length)n.push(e)}n.push(null)});e.on("data",function(i){if(t.decoder)i=t.decoder.write(i);if(t.objectMode&&(i===null||i===undefined))return;else if(!t.objectMode&&(!i||!i.length))return;var a=n.push(i);if(!a){r=true;e.pause()}});for(var i in e){if(typeof e[i]==="function"&&typeof this[i]==="undefined"){this[i]=function(t){return function(){return e[t].apply(e,arguments)}}(i)}}var a=["error","close","destroy","pause","resume"];A(a,function(t){e.on(t,n.emit.bind(n,t))});n._read=function(t){if(r){r=false;e.resume()}};return n};l._fromList=j;function j(e,t){var r=t.buffer;var n=t.length;var a=!!t.decoder;var s=!!t.objectMode;var o;if(r.length===0)return null;if(n===0)o=null;else if(s)o=r.shift();else if(!e||e>=n){if(a)o=r.join("");else o=i.concat(r,n);r.length=0}else{if(e<r[0].length){var u=r[0];o=u.slice(0,e);r[0]=u.slice(e)}else if(e===r[0].length){o=r.shift()}else{if(a)o="";else o=new i(e);var f=0;for(var l=0,c=r.length;l<c&&f<e;l++){var u=r[0];var h=Math.min(e-f,u.length);if(a)o+=u.slice(0,h);else u.copy(o,f,0,h);if(h<u.length)r[0]=u.slice(h);else r.shift();f+=h}}}return o}function k(e){var t=e._readableState;if(t.length>0)throw new Error("endReadable called on non-empty stream");if(!t.endEmitted&&t.calledRead){t.ended=true;r.nextTick(function(){if(!t.endEmitted&&t.length===0){t.endEmitted=true;e.readable=false;e.emit("end")}})}}function A(e,t){for(var r=0,n=e.length;r<n;r++){t(e[r],r)}}function R(e,t){for(var r=0,n=e.length;r<n;r++){if(e[r]===t)return r}return-1}}).call(this,e("_process"))},{_process:14,buffer:4,"core-util-is":262,events:9,inherits:263,isarray:264,stream:32,"string_decoder/":265}],260:[function(e,t,r){t.exports=o;var n=e("./_stream_duplex");var i=e("core-util-is");i.inherits=e("inherits");i.inherits(o,n);function a(e,t){this.afterTransform=function(e,r){return s(t,e,r)};this.needTransform=false;this.transforming=false;this.writecb=null;this.writechunk=null}function s(e,t,r){var n=e._transformState;n.transforming=false;var i=n.writecb;if(!i)return e.emit("error",new Error("no writecb in Transform class"));n.writechunk=null;n.writecb=null;if(r!==null&&r!==undefined)e.push(r);if(i)i(t);var a=e._readableState;a.reading=false;if(a.needReadable||a.length<a.highWaterMark){e._read(a.highWaterMark)}}function o(e){if(!(this instanceof o))return new o(e);n.call(this,e);var t=this._transformState=new a(e,this);var r=this;this._readableState.needReadable=true;this._readableState.sync=false;this.once("finish",function(){if("function"===typeof this._flush)this._flush(function(e){u(r,e)});else u(r)})}o.prototype.push=function(e,t){this._transformState.needTransform=false;return n.prototype.push.call(this,e,t)};o.prototype._transform=function(e,t,r){throw new Error("not implemented")};o.prototype._write=function(e,t,r){var n=this._transformState;n.writecb=r;n.writechunk=e;n.writeencoding=t;if(!n.transforming){var i=this._readableState;if(n.needTransform||i.needReadable||i.length<i.highWaterMark)this._read(i.highWaterMark)}};o.prototype._read=function(e){var t=this._transformState;if(t.writechunk!==null&&t.writecb&&!t.transforming){t.transforming=true;this._transform(t.writechunk,t.writeencoding,t.afterTransform)}else{t.needTransform=true}};function u(e,t){if(t)return e.emit("error",t);var r=e._writableState;var n=e._readableState;var i=e._transformState;if(r.length)throw new Error("calling transform done when ws.length != 0");if(i.transforming)throw new Error("calling transform done when still transforming");return e.push(null)}},{"./_stream_duplex":258,"core-util-is":262,inherits:263}],261:[function(e,t,r){(function(r){t.exports=u;var n=e("buffer").Buffer;u.WritableState=o;var i=e("core-util-is");i.inherits=e("inherits");var a=e("stream");i.inherits(u,a);function s(e,t,r){this.chunk=e;this.encoding=t;this.callback=r}function o(e,t){e=e||{};var r=e.highWaterMark;this.highWaterMark=r||r===0?r:16*1024;this.objectMode=!!e.objectMode;this.highWaterMark=~~this.highWaterMark;this.needDrain=false;this.ending=false;this.ended=false;this.finished=false;var n=e.decodeStrings===false;this.decodeStrings=!n;this.defaultEncoding=e.defaultEncoding||"utf8";this.length=0;this.writing=false;this.sync=true;this.bufferProcessing=false;this.onwrite=function(e){v(t,e)};this.writecb=null;this.writelen=0;this.buffer=[];this.errorEmitted=false}function u(t){var r=e("./_stream_duplex");if(!(this instanceof u)&&!(this instanceof r))return new u(t);this._writableState=new o(t,this);this.writable=true;a.call(this)}u.prototype.pipe=function(){this.emit("error",new Error("Cannot pipe. Not readable."))};function f(e,t,n){var i=new Error("write after end");e.emit("error",i);r.nextTick(function(){n(i)})}function l(e,t,i,a){var s=true;if(!n.isBuffer(i)&&"string"!==typeof i&&i!==null&&i!==undefined&&!t.objectMode){var o=new TypeError("Invalid non-string/buffer chunk");e.emit("error",o);r.nextTick(function(){a(o)});s=false}return s}u.prototype.write=function(e,t,r){var i=this._writableState;var a=false;if(typeof t==="function"){r=t;t=null}if(n.isBuffer(e))t="buffer";else if(!t)t=i.defaultEncoding;if(typeof r!=="function")r=function(){};if(i.ended)f(this,i,r);else if(l(this,i,e,r))a=h(this,i,e,t,r);return a};function c(e,t,r){if(!e.objectMode&&e.decodeStrings!==false&&typeof t==="string"){t=new n(t,r)}return t}function h(e,t,r,i,a){r=c(t,r,i);if(n.isBuffer(r))i="buffer";var o=t.objectMode?1:r.length;t.length+=o;var u=t.length<t.highWaterMark;if(!u)t.needDrain=true;if(t.writing)t.buffer.push(new s(r,i,a));else p(e,t,o,r,i,a);return u}function p(e,t,r,n,i,a){t.writelen=r;t.writecb=a;t.writing=true;t.sync=true;e._write(n,i,t.onwrite);t.sync=false}function d(e,t,n,i,a){if(n)r.nextTick(function(){a(i)});else a(i);e._writableState.errorEmitted=true;e.emit("error",i)}function g(e){e.writing=false;e.writecb=null;e.length-=e.writelen;e.writelen=0}function v(e,t){var n=e._writableState;var i=n.sync;var a=n.writecb;g(n);if(t)d(e,n,i,t,a);else{var s=_(e,n);if(!s&&!n.bufferProcessing&&n.buffer.length)y(e,n);if(i){r.nextTick(function(){m(e,n,s,a)})}else{m(e,n,s,a)}}}function m(e,t,r,n){if(!r)b(e,t);n();if(r)w(e,t)}function b(e,t){if(t.length===0&&t.needDrain){t.needDrain=false;e.emit("drain")}}function y(e,t){t.bufferProcessing=true;for(var r=0;r<t.buffer.length;r++){var n=t.buffer[r];var i=n.chunk;var a=n.encoding;var s=n.callback;var o=t.objectMode?1:i.length;p(e,t,o,i,a,s);if(t.writing){r++;break}}t.bufferProcessing=false;if(r<t.buffer.length)t.buffer=t.buffer.slice(r);else t.buffer.length=0}u.prototype._write=function(e,t,r){r(new Error("not implemented"))};u.prototype.end=function(e,t,r){var n=this._writableState;if(typeof e==="function"){r=e;e=null;t=null}else if(typeof t==="function"){r=t;t=null}if(typeof e!=="undefined"&&e!==null)this.write(e,t);if(!n.ending&&!n.finished)E(this,n,r)};function _(e,t){return t.ending&&t.length===0&&!t.finished&&!t.writing}function w(e,t){var r=_(e,t);if(r){t.finished=true;e.emit("finish")}return r}function E(e,t,n){t.ending=true;w(e,t);if(n){if(t.finished)r.nextTick(n);else e.once("finish",n)}t.ended=true}}).call(this,e("_process"))},{"./_stream_duplex":258,_process:14,buffer:4,"core-util-is":262,inherits:263,stream:32}],262:[function(e,t,r){arguments[4][25][0].apply(r,arguments)},{buffer:4,dup:25}],263:[function(e,t,r){arguments[4][10][0].apply(r,arguments)},{dup:10}],264:[function(e,t,r){arguments[4][11][0].apply(r,arguments)},{dup:11}],265:[function(e,t,r){arguments[4][42][0].apply(r,arguments)},{buffer:4,dup:42}],266:[function(e,t,r){arguments[4][30][0].apply(r,arguments)},{"./lib/_stream_transform.js":260,dup:30}],267:[function(e,t,r){arguments[4][47][0].apply(r,arguments)},{dup:47}],268:[function(e,t,r){(function(r){var n=e("readable-stream/transform"),i=e("util").inherits,a=e("xtend");function s(e){n.call(this,e);this._destroyed=false}i(s,n);s.prototype.destroy=function(e){if(this._destroyed)return;this._destroyed=true;var t=this;r.nextTick(function(){if(e)t.emit("error",e);t.emit("close")})};function o(e,t,r){r(null,e)}function u(e){return function(t,r,n){if(typeof t=="function"){n=r;r=t;t={}}if(typeof r!="function")r=o;if(typeof n!="function")n=null;return e(t,r,n)}}t.exports=u(function(e,t,r){var n=new s(e);n._transform=t;if(r)n._flush=r;return n});t.exports.ctor=u(function(e,t,r){function n(t){if(!(this instanceof n))return new n(t);this.options=a(e,t);s.call(this,this.options)}i(n,s);n.prototype._transform=t;if(r)n.prototype._flush=r;return n});t.exports.obj=u(function(e,t,r){var n=new s(a({objectMode:true,highWaterMark:16},e));n._transform=t;if(r)n._flush=r;return n})}).call(this,e("_process"))},{_process:14,"readable-stream/transform":266,util:46,xtend:267}],269:[function(e,t,r){(function(r){"use strict";var n=e("through2-filter").obj;var i;if(typeof r.Set==="function"){i=r.Set}else{i=function(){this.keys=[];this.has=function(e){return this.keys.indexOf(e)!==-1},this.add=function(e){this.keys.push(e)}}}function a(e){return function(t){return t[e]}}t.exports=s;function s(e,t){t=t||new i;var r=JSON.stringify;if(typeof e==="string"){r=a(e)}else if(typeof e==="function"){r=e}return n(function(e){var n=r(e);if(t.has(n)){return false}t.add(n);return true})}}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"through2-filter":296}],270:[function(e,t,r){var n=e("gaze");var i=e("events").EventEmitter;function a(e,t){return function(r,n){if(r)e.emit("error",r);n.on("all",function(r,n,i){var a={type:r,path:n};if(i)a.old=i;e.emit("change",a);if(t)t()})}}t.exports=function(e,t,r){var s=new i;if(typeof t==="function"){r=t;t={}}var o=n(e,t,a(s,r));o.on("end",s.emit.bind(s,"end"));o.on("error",s.emit.bind(s,"error"));o.on("ready",s.emit.bind(s,"ready"));o.on("nomatch",s.emit.bind(s,"nomatch"));s.end=function(){return o.close()};s.add=function(e,t){return o.add(e,a(s,t))};s.remove=function(e){return o.remove(e)};s._watcher=o;return s}},{events:9,gaze:271}],271:[function(e,t,r){(function(r){"use strict";var n=e("util");var i=e("events").EventEmitter;var a=e("fs");var s=e("path");var o=e("globule");var u=e("./helper");var f=e("timers").setImmediate;if(typeof f!=="function"){f=r.nextTick}var l=10;function c(e,t,n){var a=this;i.call(a);if(typeof t==="function"){n=t;t={}}t=t||{};t.mark=true;t.interval=t.interval||100;t.debounceDelay=t.debounceDelay||500;t.cwd=t.cwd||r.cwd();this.options=t;n=n||function(){};this._watched=Object.create(null);this._watchers=Object.create(null);this._pollers=Object.create(null);this._patterns=[];this._cached=Object.create(null);if(this.options.maxListeners){this.setMaxListeners(this.options.maxListeners);c.super_.prototype.setMaxListeners(this.options.maxListeners);delete this.options.maxListeners}if(e){this.add(e,n)}this._keepalive=setInterval(function(){},200);return this}n.inherits(c,i);t.exports=function h(e,t,r){return new c(e,t,r)};t.exports.Gaze=c;c.prototype.emit=function(){var e=this;var t=arguments;var r=t[0];var n=t[1];var i;if(r.slice(-2)!=="ed"){c.super_.prototype.emit.apply(e,t);return this}if(r==="added"){Object.keys(this._cached).forEach(function(n){if(e._cached[n].indexOf("deleted")!==-1){t[0]=r="renamed";[].push.call(t,n);delete e._cached[n];return false}})}var f=this._cached[n]||[];if(f.indexOf(r)===-1){u.objectPush(e._cached,n,r);clearTimeout(i);i=setTimeout(function(){delete e._cached[n]},this.options.debounceDelay);c.super_.prototype.emit.apply(e,t);c.super_.prototype.emit.apply(e,["all",r].concat([].slice.call(t,1)))}if(r==="added"){if(u.isDir(n)){a.readdirSync(n).map(function(e){return s.join(n,e)}).filter(function(t){return o.isMatch(e._patterns,t,e.options)}).forEach(function(t){e.emit("added",t)})}}return this};c.prototype.close=function(e){var t=this;e=e===false?false:true;Object.keys(t._watchers).forEach(function(e){t._watchers[e].close()});t._watchers=Object.create(null);Object.keys(this._watched).forEach(function(e){t._unpollDir(e)});if(e){t._watched=Object.create(null);setTimeout(function(){t.emit("end");t.removeAllListeners();clearInterval(t._keepalive)},l+100)}return t};c.prototype.add=function(e,t){if(typeof e==="string"){e=[e]}this._patterns=u.unique.apply(null,[this._patterns,e]);e=o.find(this._patterns,this.options);this._addToWatched(e);this.close(false);this._initWatched(t)};c.prototype._internalAdd=function(e,t){var r=[];if(u.isDir(e)){r=[u.markDir(e)].concat(o.find(this._patterns,this.options))}else{if(o.isMatch(this._patterns,e,this.options)){r=[e]}}if(r.length>0){this._addToWatched(r);this.close(false);this._initWatched(t)}};c.prototype.remove=function(e){var t=this;if(this._watched[e]){this._unpollDir(e);delete this._watched[e]}else{Object.keys(this._watched).forEach(function(r){var n=t._watched[r].indexOf(e);if(n!==-1){t._unpollFile(e);t._watched[r].splice(n,1);return false}})}if(this._watchers[e]){this._watchers[e].close()}return this};c.prototype.watched=function(){return this._watched};c.prototype.relative=function(e,t){var n=this;var i=Object.create(null);var a,o,f;var l=this.options.cwd||r.cwd();if(e===""){e="."}e=u.markDir(e);t=t||false;Object.keys(this._watched).forEach(function(e){a=s.relative(l,e)+s.sep;if(a===s.sep){a="."}f=t?u.unixifyPathSep(a):a;i[f]=n._watched[e].map(function(e){o=s.relative(s.join(l,a)||"",e||"");if(u.isDir(e)){o=u.markDir(o)}if(t){o=u.unixifyPathSep(o)}return o})});if(e&&t){e=u.unixifyPathSep(e)}return e?i[e]||[]:i};c.prototype._addToWatched=function(e){for(var t=0;t<e.length;t++){var r=e[t];var n=s.resolve(this.options.cwd,r);var i=u.isDir(r)?n:s.dirname(n);i=u.markDir(i);if(u.isDir(r)&&!(n in this._watched)){u.objectPush(this._watched,n,[])}if(r.slice(-1)==="/"){n+=s.sep}u.objectPush(this._watched,s.dirname(n)+s.sep,n);var o=a.readdirSync(i);for(var f=0;f<o.length;f++){var l=s.join(i,o[f]);if(a.statSync(l).isDirectory()){u.objectPush(this._watched,i,l+s.sep)}}}return this};c.prototype._watchDir=function(e,t){var r=this;var n;try{this._watchers[e]=a.watch(e,function(i){clearTimeout(n);n=setTimeout(function(){if(e in r._watchers&&a.existsSync(e)){t(null,e)}},l+100)})}catch(i){return this._handleError(i)}return this};c.prototype._unpollFile=function(e){if(this._pollers[e]){a.unwatchFile(e,this._pollers[e]);delete this._pollers[e]}return this};c.prototype._unpollDir=function(e){this._unpollFile(e);for(var t=0;t<this._watched[e].length;t++){this._unpollFile(this._watched[e][t])}};c.prototype._pollFile=function(e,t){var r={persistent:true,interval:this.options.interval};if(!this._pollers[e]){this._pollers[e]=function(r,n){t(null,e)};try{a.watchFile(e,r,this._pollers[e])}catch(n){return this._handleError(n)}}return this};c.prototype._initWatched=function(e){var t=this;var n=this.options.cwd||r.cwd();var i=Object.keys(t._watched);if(i.length<1){f(function(){t.emit("ready",t);if(e){e.call(t,null,t)}t.emit("nomatch")});return}u.forEachSeries(i,function(e,r){e=e||"";var i=t._watched[e];t._watchDir(e,function(r,i){var o=n===e?".":s.relative(n,e);o=o||"";a.readdir(i,function(r,n){if(r){return t.emit("error",r)}if(!n){return}try{n=n.map(function(t){if(a.existsSync(s.join(e,t))&&a.statSync(s.join(e,t)).isDirectory()){return t+s.sep}else{return t}})}catch(r){}var i=t.relative(o);i.filter(function(e){return n.indexOf(e)<0}).forEach(function(r){if(!u.isDir(r)){var n=s.join(e,r);t.remove(n);t.emit("deleted",n)}});n.filter(function(e){return i.indexOf(e)<0}).forEach(function(r){var n=s.join(o,r);t._internalAdd(n,function(){t.emit("added",s.join(e,r))})})})});i.forEach(function(e){if(u.isDir(e)){return}t._pollFile(e,function(e,r){if(a.existsSync(r)){t.emit("changed",r)}})});r()},function(){setTimeout(function(){t.emit("ready",t);if(e){e.call(t,null,t)}},l+100)})};c.prototype._handleError=function(e){if(e.code==="EMFILE"){return this.emit("error",new Error("EMFILE: Too many opened files."))}return this.emit("error",e)}}).call(this,e("_process"))},{"./helper":272,_process:14,events:9,fs:1,globule:273,path:13,timers:43,util:46}],272:[function(e,t,r){(function(r){"use strict";var n=e("path");var i=t.exports={};i.isDir=function a(e){if(typeof e!=="string"){return false}return e.slice(-n.sep.length)===n.sep};i.objectPush=function s(e,t,r){if(e[t]==null){e[t]=[]}if(Array.isArray(r)){e[t]=e[t].concat(r)}else if(r){e[t].push(r)}return e[t]=i.unique(e[t])};i.markDir=function o(e){if(typeof e==="string"&&e.slice(-n.sep.length)!==n.sep&&e!=="."){e+=n.sep}return e};i.unixifyPathSep=function u(e){return r.platform==="win32"?String(e).replace(/\\/g,"/"):e};i.unique=function f(){var e=Array.prototype.concat.apply(Array.prototype,arguments);var t=[];for(var r=0;r<e.length;r++){if(t.indexOf(e[r])===-1){t.push(e[r])}}return t};i.forEachSeries=function l(e,t,r){if(!e.length){return r()}var n=0;var i=function(){t(e[n],function(t){if(t){r(t);r=function(){}}else{n+=1;if(n===e.length){r(null)}else{i()}}})};i()}}).call(this,e("_process"))},{_process:14,path:13}],273:[function(e,t,r){"use strict";var n=e("fs");var i=e("path");var a=e("lodash");var s=e("glob");var o=e("minimatch");var u=r;function f(e,t){return a.flatten(e).reduce(function(e,r){if(r.indexOf("!")===0){r=r.slice(1);return a.difference(e,t(r))}else{return a.union(e,t(r))}},[])}u.match=function(e,t,r){if(e==null||t==null){return[]}if(!a.isArray(e)){e=[e]}if(!a.isArray(t)){t=[t]}if(e.length===0||t.length===0){return[]}return f(e,function(e){return o.match(t,e,r||{})})};u.isMatch=function(){return u.match.apply(null,arguments).length>0};u.find=function(){var e=a.toArray(arguments);var t=a.isPlainObject(e[e.length-1])?e.pop():{};var r=a.isArray(e[0])?e[0]:e;if(r.length===0){return[]}var o=t.srcBase||t.cwd;var u=a.extend({},t);if(o){u.cwd=o}var l=f(r,function(e){return s.sync(e,u)});if(o&&t.prefixBase){l=l.map(function(e){return i.join(o,e)})}if(t.filter){l=l.filter(function(e){if(o&&!t.prefixBase){e=i.join(o,e)}try{if(a.isFunction(t.filter)){return t.filter(e,t)}else{return n.statSync(e)[t.filter]()}}catch(r){return false}})}return l};var l=/[\/\\]/g;var c={first:/(\.[^\/]*)?$/,last:/(\.[^\/\.]*)?$/};function h(e,t){if(t.flatten){e=i.basename(e)}if(t.ext){e=e.replace(c[t.extDot],t.ext)}if(t.destBase){e=i.join(t.destBase,e)}return e}u.mapping=function(e,t){if(e==null){return[]}t=a.defaults({},t,{extDot:"first",rename:h});var r=[];var n={};e.forEach(function(e){var a=t.rename(e,t);if(t.srcBase){e=i.join(t.srcBase,e)}a=a.replace(l,"/");e=e.replace(l,"/");if(n[a]){n[a].src.push(e)}else{r.push({src:[e],dest:a});n[a]=r[r.length-1]}});return r};u.findMapping=function(e,t){return u.mapping(u.find(e,t),t)}},{fs:1,glob:274,lodash:277,minimatch:278,path:13}],274:[function(e,t,r){(function(r){t.exports=c;var n=e("graceful-fs"),i=e("minimatch"),a=i.Minimatch,s=e("inherits"),o=e("events").EventEmitter,u=e("path"),f={},l=e("assert").ok;function c(e,t,r){if(typeof t==="function")r=t,t={};if(!t)t={};if(typeof t==="number"){h();return}var n=new d(e,t,r);return n.sync?n.found:n}c.fnmatch=h;function h(){throw new Error("glob's interface has changed. Please see the docs.")}c.sync=p;function p(e,t){if(typeof t==="number"){h();return}t=t||{};t.sync=true;return c(e,t)}c.Glob=d;s(d,o);function d(e,t,n){if(!(this instanceof d)){return new d(e,t,n)}if(typeof n==="function"){this.on("error",n);this.on("end",function(e){n(null,e)})}t=t||{};this.EOF={};this._emitQueue=[];this.maxDepth=t.maxDepth||1e3;this.maxLength=t.maxLength||Infinity;this.statCache=t.statCache||{};this.changedCwd=false;var i=r.cwd();if(!t.hasOwnProperty("cwd"))this.cwd=i;else{this.cwd=t.cwd;this.changedCwd=u.resolve(t.cwd)!==i}this.root=t.root||u.resolve(this.cwd,"/");this.root=u.resolve(this.root);if(r.platform==="win32")this.root=this.root.replace(/\\/g,"/");this.nomount=!!t.nomount;if(!e){throw new Error("must provide pattern")}if(t.matchBase&&-1===e.indexOf("/")){if(t.noglobstar){throw new Error("base matching requires globstar")}e="**/"+e}this.strict=t.strict!==false;this.dot=!!t.dot;this.mark=!!t.mark;this.sync=!!t.sync;this.nounique=!!t.nounique;this.nonull=!!t.nonull;this.nosort=!!t.nosort;this.nocase=!!t.nocase;this.stat=!!t.stat;this.debug=!!t.debug||!!t.globDebug;if(this.debug)this.log=console.error;this.silent=!!t.silent;var s=this.minimatch=new a(e,t);this.options=s.options;e=this.pattern=s.pattern;this.error=null;this.aborted=false;o.call(this);var f=this.minimatch.set.length;this.matches=new Array(f);this.minimatch.set.forEach(l.bind(this));function l(e,t,r){this._process(e,0,t,function(e){if(e)this.emit("error",e);if(--f<=0)this._finish()})}}d.prototype.log=function(){};d.prototype._finish=function(){l(this instanceof d);var e=this.nounique,t=e?[]:{};for(var r=0,n=this.matches.length;r<n;r++){var i=this.matches[r];this.log("matches[%d] =",r,i);if(!i){if(this.nonull){var a=this.minimatch.globSet[r];if(e)t.push(a);else t[a]=true}}else{var s=Object.keys(i);if(e)t.push.apply(t,s);else s.forEach(function(e){t[e]=true})}}if(!e)t=Object.keys(t);if(!this.nosort){t=t.sort(this.nocase?g:v)}if(this.mark){t=t.map(function(e){var t=this.statCache[e];if(!t)return e;var r=Array.isArray(t)||t===2;if(r&&e.slice(-1)!=="/"){return e+"/"}if(!r&&e.slice(-1)==="/"){return e.replace(/\/+$/,"")}return e},this)}this.log("emitting end",t);this.EOF=this.found=t;this.emitMatch(this.EOF)};function g(e,t){e=e.toLowerCase();t=t.toLowerCase();return v(e,t)}function v(e,t){return e>t?1:e<t?-1:0}d.prototype.abort=function(){this.aborted=true;this.emit("abort")};d.prototype.pause=function(){if(this.paused)return;if(this.sync)this.emit("error",new Error("Can't pause/resume sync glob"));this.paused=true;this.emit("pause")};d.prototype.resume=function(){if(!this.paused)return;if(this.sync)this.emit("error",new Error("Can't pause/resume sync glob"));this.paused=false;this.emit("resume");this._processEmitQueue()};d.prototype.emitMatch=function(e){this._emitQueue.push(e);this._processEmitQueue()};d.prototype._processEmitQueue=function(e){while(!this._processingEmitQueue&&!this.paused){this._processingEmitQueue=true;var e=this._emitQueue.shift();if(!e){this._processingEmitQueue=false;break}this.log("emit!",e===this.EOF?"end":"match");this.emit(e===this.EOF?"end":"match",e);this._processingEmitQueue=false}};d.prototype._process=function(e,t,n,a){l(this instanceof d);var s=function h(e,t){l(this instanceof d);if(this.paused){if(!this._processQueue){this._processQueue=[];this.once("resume",function(){var e=this._processQueue;this._processQueue=null;e.forEach(function(e){e()})})}this._processQueue.push(a.bind(this,e,t))}else{a.call(this,e,t)}}.bind(this);if(this.aborted)return s();if(t>this.maxDepth)return s();var o=0;while(typeof e[o]==="string"){o++}var f;switch(o){case e.length:f=e.join("/");this._stat(f,function(e,t){if(e){if(f&&m(f)&&!this.nomount){if(f.charAt(0)==="/"){f=u.join(this.root,f)}else{f=u.resolve(this.root,f)}}if(r.platform==="win32")f=f.replace(/\\/g,"/");this.matches[n]=this.matches[n]||{};this.matches[n][f]=true;this.emitMatch(f)}return s()});return;case 0:f=null;break;default:f=e.slice(0,o);f=f.join("/");break}var c;if(f===null)c=".";else if(m(f)||m(e.join("/"))){if(!f||!m(f)){f=u.join("/",f)}c=f=u.resolve(f);this.log("absolute: ",f,this.root,e,c)}else{c=f}this.log("readdir(%j)",c,this.cwd,this.root);return this._readdir(c,function(a,l){if(a){return s()}if(e[o]===i.GLOBSTAR){var c=[e.slice(0,o).concat(e.slice(o+1))];l.forEach(function(t){if(t.charAt(0)==="."&&!this.dot)return;c.push(e.slice(0,o).concat(t).concat(e.slice(o+1)));c.push(e.slice(0,o).concat(t).concat(e.slice(o)))},this);var h=c.length,p=null;c.forEach(function(e){this._process(e,t+1,n,function(e){if(p)return;if(e)return s(p=e);if(--h<=0)return s()})},this);return}var d=e[o];
if(typeof d==="string"){var g=l.indexOf(d)!==-1;l=g?l[d]:[]}else{var v=e[o]._glob,m=this.dot||v.charAt(0)===".";l=l.filter(function(t){return(t.charAt(0)!=="."||m)&&(typeof e[o]==="string"&&t===e[o]||t.match(e[o]))})}if(o===e.length-1&&!this.mark&&!this.stat){l.forEach(function(e){if(f){if(f!=="/")e=f+"/"+e;else e=f+e}if(e.charAt(0)==="/"&&!this.nomount){e=u.join(this.root,e)}if(r.platform==="win32")e=e.replace(/\\/g,"/");this.matches[n]=this.matches[n]||{};this.matches[n][e]=true;this.emitMatch(e)},this);return s.call(this)}var h=l.length,p=null;if(h===0)return s();l.forEach(function(r){var i=e.slice(0,o).concat(r).concat(e.slice(o+1));this._process(i,t+1,n,function(e){if(p)return;if(e)return s(p=e);if(--h===0)return s.call(this)})},this)})};d.prototype._stat=function(e,t){l(this instanceof d);var i=e;if(e.charAt(0)==="/"){i=u.join(this.root,e)}else if(this.changedCwd){i=u.resolve(this.cwd,e)}this.log("stat",[this.cwd,e,"=",i]);if(e.length>this.maxLength){var a=new Error("Path name too long");a.code="ENAMETOOLONG";a.path=e;return this._afterStat(e,i,t,a)}if(this.statCache.hasOwnProperty(e)){var s=this.statCache[e],o=s&&(Array.isArray(s)||s===2);if(this.sync)return t.call(this,!!s,o);return r.nextTick(t.bind(this,!!s,o))}if(this.sync){var a,f;try{f=n.statSync(i)}catch(c){a=c}this._afterStat(e,i,t,a,f)}else{n.stat(i,this._afterStat.bind(this,e,i,t))}};d.prototype._afterStat=function(e,t,r,n,i){var a;l(this instanceof d);if(t.slice(-1)==="/"&&i&&!i.isDirectory()){this.log("should be ENOTDIR, fake it");n=new Error("ENOTDIR, not a directory '"+t+"'");n.path=t;n.code="ENOTDIR";i=null}if(n||!i){a=false}else{a=i.isDirectory()?2:1}this.statCache[e]=this.statCache[e]||a;r.call(this,!!a,a===2)};d.prototype._readdir=function(e,t){l(this instanceof d);var i=e;if(e.charAt(0)==="/"){i=u.join(this.root,e)}else if(m(e)){i=e}else if(this.changedCwd){i=u.resolve(this.cwd,e)}this.log("readdir",[this.cwd,e,i]);if(e.length>this.maxLength){var a=new Error("Path name too long");a.code="ENAMETOOLONG";a.path=e;return this._afterReaddir(e,i,t,a)}if(this.statCache.hasOwnProperty(e)){var s=this.statCache[e];if(Array.isArray(s)){if(this.sync)return t.call(this,null,s);return r.nextTick(t.bind(this,null,s))}if(!s||s===1){var o=s?"ENOTDIR":"ENOENT",a=new Error((s?"Not a directory":"Not found")+": "+e);a.path=e;a.code=o;this.log(e,a);if(this.sync)return t.call(this,a);return r.nextTick(t.bind(this,a))}}if(this.sync){var a,f;try{f=n.readdirSync(i)}catch(c){a=c}return this._afterReaddir(e,i,t,a,f)}n.readdir(i,this._afterReaddir.bind(this,e,i,t))};d.prototype._afterReaddir=function(e,t,r,n,i){l(this instanceof d);if(i&&!n){this.statCache[e]=i;if(!this.mark&&!this.stat){i.forEach(function(t){if(e==="/")t=e+t;else t=e+"/"+t;this.statCache[t]=true},this)}return r.call(this,n,i)}if(n)switch(n.code){case"ENOTDIR":this.statCache[e]=1;return r.call(this,n);case"ENOENT":case"ELOOP":case"ENAMETOOLONG":case"UNKNOWN":this.statCache[e]=false;return r.call(this,n);default:this.statCache[e]=false;if(this.strict)this.emit("error",n);if(!this.silent)console.error("glob error",n);return r.call(this,n)}};var m=r.platform==="win32"?b:y;function b(e){if(y(e))return true;var t=/^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/,r=t.exec(e),n=r[1]||"",i=n&&n.charAt(1)!==":",a=!!r[2]||i;return a}function y(e){return e.charAt(0)==="/"||e===""}}).call(this,e("_process"))},{_process:14,assert:2,events:9,"graceful-fs":275,inherits:276,minimatch:278,path:13}],275:[function(e,t,r){(function(n){var i=r=t.exports={};i._originalFs=e("fs");Object.getOwnPropertyNames(i._originalFs).forEach(function(e){var t=Object.getOwnPropertyDescriptor(i._originalFs,e);Object.defineProperty(i,e,t)});var a=[],s=e("constants");i._curOpen=0;i.MIN_MAX_OPEN=64;i.MAX_OPEN=1024;function o(e,t,r,n){this.path=e;this.flags=t;this.mode=r;this.cb=n}function u(){}i.open=f;function f(e,t,r,n){if(typeof r==="function")n=r,r=null;if(typeof n!=="function")n=u;if(i._curOpen>=i.MAX_OPEN){a.push(new o(e,t,r,n));setTimeout(h);return}l(e,t,r,function(a,s){if(a&&a.code==="EMFILE"&&i._curOpen>i.MIN_MAX_OPEN){i.MAX_OPEN=i._curOpen-1;return i.open(e,t,r,n)}n(a,s)})}function l(e,t,r,n){n=n||u;i._curOpen++;i._originalFs.open.call(i,e,t,r,function(e,t){if(e)c();n(e,t)})}i.openSync=function(e,t,r){var n;n=i._originalFs.openSync.call(i,e,t,r);i._curOpen++;return n};function c(){i._curOpen--;h()}function h(){while(i._curOpen<i.MAX_OPEN){var e=a.shift();if(!e)return;switch(e.constructor.name){case"OpenReq":l(e.path,e.flags||"r",e.mode||511,e.cb);break;case"ReaddirReq":d(e.path,e.cb);break;case"ReadFileReq":m(e.path,e.options,e.cb);break;case"WriteFileReq":_(e.path,e.data,e.options,e.cb);break;default:throw new Error("Unknown req type: "+e.constructor.name)}}}i.close=function(e,t){t=t||u;i._originalFs.close.call(i,e,function(e){c();t(e)})};i.closeSync=function(e){try{return i._originalFs.closeSync.call(i,e)}finally{c()}};i.readdir=p;function p(e,t){if(i._curOpen>=i.MAX_OPEN){a.push(new g(e,t));setTimeout(h);return}d(e,function(r,n){if(r&&r.code==="EMFILE"&&i._curOpen>i.MIN_MAX_OPEN){i.MAX_OPEN=i._curOpen-1;return i.readdir(e,t)}t(r,n)})}function d(e,t){t=t||u;i._curOpen++;i._originalFs.readdir.call(i,e,function(e,r){c();t(e,r)})}function g(e,t){this.path=e;this.cb=t}i.readFile=v;function v(e,t,r){if(typeof t==="function")r=t,t=null;if(typeof r!=="function")r=u;if(i._curOpen>=i.MAX_OPEN){a.push(new b(e,t,r));setTimeout(h);return}m(e,t,function(n,a){if(n&&n.code==="EMFILE"&&i._curOpen>i.MIN_MAX_OPEN){i.MAX_OPEN=i._curOpen-1;return i.readFile(e,t,r)}r(n,a)})}function m(e,t,r){r=r||u;i._curOpen++;i._originalFs.readFile.call(i,e,t,function(e,t){c();r(e,t)})}function b(e,t,r){this.path=e;this.options=t;this.cb=r}i.writeFile=y;function y(e,t,r,n){if(typeof r==="function")n=r,r=null;if(typeof n!=="function")n=u;if(i._curOpen>=i.MAX_OPEN){a.push(new w(e,t,r,n));setTimeout(h);return}_(e,t,r,function(a){if(a&&a.code==="EMFILE"&&i._curOpen>i.MIN_MAX_OPEN){i.MAX_OPEN=i._curOpen-1;return i.writeFile(e,t,r,n)}n(a)})}function _(e,t,r,n){n=n||u;i._curOpen++;i._originalFs.writeFile.call(i,e,t,r,function(e){c();n(e)})}function w(e,t,r,n){this.path=e;this.data=t;this.options=r;this.cb=n}var s=e("constants");if(s.hasOwnProperty("O_SYMLINK")&&n.version.match(/^v0\.6\.[0-2]|^v0\.5\./)){i.lchmod=function(e,t,r){r=r||u;i.open(e,s.O_WRONLY|s.O_SYMLINK,t,function(e,n){if(e){r(e);return}i.fchmod(n,t,function(e){i.close(n,function(t){r(e||t)})})})};i.lchmodSync=function(e,t){var r=i.openSync(e,s.O_WRONLY|s.O_SYMLINK,t);var n,a;try{var o=i.fchmodSync(r,t)}catch(u){n=u}try{i.closeSync(r)}catch(u){a=u}if(n||a)throw n||a;return o}}if(!i.lutimes){if(s.hasOwnProperty("O_SYMLINK")){i.lutimes=function(e,t,r,n){i.open(e,s.O_SYMLINK,function(e,a){n=n||u;if(e)return n(e);i.futimes(a,t,r,function(e){i.close(a,function(t){return n(e||t)})})})};i.lutimesSync=function(e,t,r){var n=i.openSync(e,s.O_SYMLINK),a,o,u;try{var u=i.futimesSync(n,t,r)}catch(f){a=f}try{i.closeSync(n)}catch(f){o=f}if(a||o)throw a||o;return u}}else if(i.utimensat&&s.hasOwnProperty("AT_SYMLINK_NOFOLLOW")){i.lutimes=function(e,t,r,n){i.utimensat(e,t,r,s.AT_SYMLINK_NOFOLLOW,n)};i.lutimesSync=function(e,t,r){return i.utimensatSync(e,t,r,s.AT_SYMLINK_NOFOLLOW)}}else{i.lutimes=function(e,t,r,i){n.nextTick(i)};i.lutimesSync=function(){}}}i.chown=E(i.chown);i.fchown=E(i.fchown);i.lchown=E(i.lchown);i.chownSync=S(i.chownSync);i.fchownSync=S(i.fchownSync);i.lchownSync=S(i.lchownSync);function E(e){if(!e)return e;return function(t,r,n,a){return e.call(i,t,r,n,function(e,t){if(x(e))e=null;a(e,t)})}}function S(e){if(!e)return e;return function(t,r,n){try{return e.call(i,t,r,n)}catch(a){if(!x(a))throw a}}}function x(e){if(!e||(!n.getuid||n.getuid()!==0)&&(e.code==="EINVAL"||e.code==="EPERM"))return true}if(!i.lchmod){i.lchmod=function(e,t,r){n.nextTick(r)};i.lchmodSync=function(){}}if(!i.lchown){i.lchown=function(e,t,r,i){n.nextTick(i)};i.lchownSync=function(){}}if(n.platform==="win32"){var O=i.rename;i.rename=function A(e,t,r){var n=Date.now();O(e,t,function i(a){if(a&&(a.code==="EACCES"||a.code==="EPERM")&&Date.now()-n<1e3){return O(e,t,i)}r(a)})}}var j=i.read;i.read=function(e,t,r,n,a,s){var o;if(s&&typeof s==="function"){var u=0;o=function(f,l,c){if(f&&f.code==="EAGAIN"&&u<10){u++;return j.call(i,e,t,r,n,a,o)}s.apply(this,arguments)}}return j.call(i,e,t,r,n,a,o)};var k=i.readSync;i.readSync=function(e,t,r,n,a){var s=0;while(true){try{return k.call(i,e,t,r,n,a)}catch(o){if(o.code==="EAGAIN"&&s<10){s++;continue}throw o}}}}).call(this,e("_process"))},{_process:14,constants:8,fs:1}],276:[function(e,t,r){arguments[4][10][0].apply(r,arguments)},{dup:10}],277:[function(t,r,n){(function(t){(function(i,a){var s=typeof n=="object"&&n;var o=typeof r=="object"&&r&&r.exports==s&&r;var u=typeof t=="object"&&t;if(u.global===u){i=u}var f=[],l={};var c=0;var h=l;var p=30;var d=i._;var g=/&(?:amp|lt|gt|quot|#39);/g;var v=/\b__p \+= '';/g,m=/\b(__p \+=) '' \+/g,b=/(__e\(.*?\)|\b__t\)) \+\n'';/g;var y=/\w*$/;var _=RegExp("^"+(l.valueOf+"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/valueOf|for [^\]]+/g,".+?")+"$");var w=/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;var E=/<%=([\s\S]+?)%>/g;var S=/($^)/;var x=/[&<>"']/g;var O=/['\n\r\t\u2028\u2029\\]/g;var j=0;var k=Math.ceil,A=f.concat,R=Math.floor,L=_.test(L=Object.getPrototypeOf)&&L,T=l.hasOwnProperty,I=f.push,M=l.toString;var C=_.test(C=we.bind)&&C,P=_.test(P=Array.isArray)&&P,N=i.isFinite,D=i.isNaN,B=_.test(B=Object.keys)&&B,U=Math.max,F=Math.min,q=Math.random;var G="[object Arguments]",W="[object Array]",H="[object Boolean]",Y="[object Date]",$="[object Function]",z="[object Number]",K="[object Object]",X="[object RegExp]",Q="[object String]";var V=!!i.attachEvent,J=C&&!/\n|true/.test(C+V);var Z=C&&!J;var ee=B&&(V||J);var te={};te[$]=false;te[G]=te[W]=te[H]=te[Y]=te[z]=te[K]=te[X]=te[Q]=true;var re={};re[W]=Array;re[H]=Boolean;re[Y]=Date;re[K]=Object;re[z]=Number;re[X]=RegExp;re[Q]=String;var ne={"boolean":false,"function":true,object:true,number:false,string:false,undefined:false};var ie={"\\":"\\","'":"'","\n":"n","\r":"r","	":"t","\u2028":"u2028","\u2029":"u2029"};function ae(e){if(e&&typeof e=="object"&&e.__wrapped__){return e}if(!(this instanceof ae)){return new ae(e)}this.__wrapped__=e}ae.templateSettings={escape:/<%-([\s\S]+?)%>/g,evaluate:/<%([\s\S]+?)%>/g,interpolate:E,variable:"",imports:{_:ae}};var se=function(e){var t="var index, iterable = "+e.firstArg+", result = iterable;\nif (!iterable) return result;\n"+e.top+";\n";if(e.arrays){t+="var length = iterable.length; index = -1;\nif ("+e.arrays+") {\n  while (++index < length) {\n    "+e.loop+"\n  }\n}\nelse {  "}if(e.isKeysFast&&e.useHas){t+="\n  var ownIndex = -1,\n      ownProps = objectTypes[typeof iterable] ? nativeKeys(iterable) : [],\n      length = ownProps.length;\n\n  while (++ownIndex < length) {\n    index = ownProps[ownIndex];\n    "+e.loop+"\n  }  "}else{t+="\n  for (index in iterable) {";if(e.useHas){t+="\n    if (";if(e.useHas){t+="hasOwnProperty.call(iterable, index)"}t+=") {    "}t+=e.loop+";    ";if(e.useHas){t+="\n    }"}t+="\n  }  "}if(e.arrays){t+="\n}"}t+=e.bottom+";\nreturn result";return t};var oe={args:"object, source, guard",top:"var args = arguments,\n"+"    argsIndex = 0,\n"+"    argsLength = typeof guard == 'number' ? 2 : args.length;\n"+"while (++argsIndex < argsLength) {\n"+"  iterable = args[argsIndex];\n"+"  if (iterable && objectTypes[typeof iterable]) {",loop:"if (typeof result[index] == 'undefined') result[index] = iterable[index]",bottom:"  }\n}"};var ue={args:"collection, callback, thisArg",top:"callback = callback && typeof thisArg == 'undefined' ? callback : createCallback(callback, thisArg)",arrays:"typeof length == 'number'",loop:"if (callback(iterable[index], index, collection) === false) return result"};var fe={top:"if (!objectTypes[typeof iterable]) return result;\n"+ue.top,arrays:false};function le(e,t,r){t||(t=0);var n=e.length,i=n-t>=(r||p);if(i){var a={},s=t-1;while(++s<n){var o=e[s]+"";(T.call(a,o)?a[o]:a[o]=[]).push(e[s])}}return function(r){if(i){var n=r+"";return T.call(a,n)&&Tt(a[n],r)>-1}return Tt(e,r,t)>-1}}function ce(e){return e.charCodeAt(0)}function he(e,t){var r=e.index,n=t.index;e=e.criteria;t=t.criteria;if(e!==t){if(e>t||typeof e=="undefined"){return 1}if(e<t||typeof t=="undefined"){return-1}}return r<n?-1:1}function pe(e,t,r,n){var i=Ye(e),a=!r,s=t;if(a){r=t}if(!i){t=e}function o(){var u=arguments,f=a?this:t;if(!i){e=t[s]}if(r.length){u=u.length?(u=we(u),n?u.concat(r):r.concat(u)):r}if(this instanceof o){_e.prototype=e.prototype;f=new _e;_e.prototype=null;var l=e.apply(f,u);return $e(l)?l:f}return e.apply(f,u)}return o}function de(e,t,r){if(e==null){return ar}var n=typeof e;if(n!="function"){if(n!="object"){return function(t){return t[e]}}var i=ke(e);return function(t){var r=i.length,n=false;while(r--){if(!(n=We(t[i[r]],e[i[r]],h))){break}}return n}}if(typeof t!="undefined"){if(r===1){return function(r){return e.call(t,r)}}if(r===2){return function(r,n){return e.call(t,r,n)}}if(r===4){return function(r,n,i,a){return e.call(t,r,n,i,a)}}return function(r,n,i){return e.call(t,r,n,i)}}return e}function ge(){var e={isKeysFast:ee,arrays:"isArray(iterable)",bottom:"",loop:"",top:"",useHas:true};for(var t,r=0;t=arguments[r];r++){for(var n in t){e[n]=t[n]}}var i=e.args;e.firstArg=/^[^,]+/.exec(i)[0];var a=Function("createCallback, hasOwnProperty, isArguments, isArray, isString, "+"objectTypes, nativeKeys","return function("+i+") {\n"+se(e)+"\n}");return a(de,T,Se,je,Je,ne,B)}var ve=ge(ue);function me(e){return"\\"+ie[e]}function be(e){return Le[e]}function ye(e){return typeof e.toString!="function"&&typeof(e+"")=="string"}function _e(){}function we(e,t,r){t||(t=0);if(typeof r=="undefined"){r=e?e.length:0}var n=-1,i=r-t||0,a=Array(i<0?0:i);while(++n<i){a[n]=e[t+n]}return a}function Ee(e){return Te[e]}function Se(e){return M.call(e)==G}var xe=ge(ue,fe,{useHas:false});var Oe=ge(ue,fe);var je=P||function(e){return e instanceof Array||M.call(e)==W};var ke=!B?Re:function(e){if(!$e(e)){return[]}return B(e)};function Ae(e){var t=false;if(!(e&&typeof e=="object")||Se(e)){return t}var r=e.constructor;if(!Ye(r)||r instanceof r){xe(e,function(e,r){t=r});return t===false||T.call(e,t)}return t}function Re(e){var t=[];Oe(e,function(e,r){t.push(r)});return t}var Le={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};var Te=Be(Le);var Ie=ge(oe,{top:oe.top.replace(";",";\n"+"if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {\n"+"  var callback = createCallback(args[--argsLength - 1], args[argsLength--], 2);\n"+"} else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {\n"+"  callback = args[--argsLength];\n"+"}"),loop:"result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]"});function Me(e,t,r,n,i,s){var o=e;if(typeof t=="function"){n=r;r=t;t=false}if(typeof r=="function"){r=typeof n=="undefined"?r:de(r,n,1);o=r(o);var u=typeof o!="undefined";if(!u){o=e}}var f=$e(o);if(f){var l=M.call(o);if(!te[l]){return o}var c=je(o)}if(!f||!t){return f&&!u?c?we(o):Ie({},o):o}var h=re[l];switch(l){case H:case Y:return u?o:new h(+o);case z:case Q:return u?o:new h(o);case X:return u?o:h(o.source,y.exec(o))}i||(i=[]);s||(s=[]);var p=i.length;while(p--){if(i[p]==e){return s[p]}}if(!u){o=c?h(o.length):{};if(c){if(T.call(e,"index")){o.index=e.index}if(T.call(e,"input")){o.input=e.input}}}i.push(e);s.push(o);(c?ct:Oe)(u?o:e,function(e,n){o[n]=Me(e,t,r,a,i,s)});return o}function Ce(e,t,r){return Me(e,true,t,r)}var Pe=ge(oe);function Ne(e){var t=[];xe(e,function(e,r){if(Ye(e)){t.push(r)}});return t.sort()}function De(e,t){return e?T.call(e,t):false}function Be(e){var t=-1,r=ke(e),n=r.length,i={};while(++t<n){var a=r[t];i[e[a]]=a}return i}function Ue(e){return e===true||e===false||M.call(e)==H}function Fe(e){return e instanceof Date||M.call(e)==Y}function qe(e){return e?e.nodeType===1:false}function Ge(e){var t=true;if(!e){return t}var r=M.call(e),n=e.length;if(r==W||r==Q||r==G||r==K&&typeof n=="number"&&Ye(e.splice)){return!n}Oe(e,function(){return t=false});return t}function We(e,t,r,n,i,a){var s=r===h;if(r&&!s){r=typeof n=="undefined"?r:de(r,n,2);var o=r(e,t);if(typeof o!="undefined"){return!!o}}if(e===t){return e!==0||1/e==1/t}var u=typeof e,f=typeof t;if(e===e&&(!e||u!="function"&&u!="object")&&(!t||f!="function"&&f!="object")){return false}if(e==null||t==null){return e===t}var l=M.call(e),c=M.call(t);if(l==G){l=K}if(c==G){c=K}if(l!=c){return false}switch(l){case H:case Y:return+e==+t;case z:return e!=+e?t!=+t:e==0?1/e==1/t:e==+t;case X:case Q:return e==t+""}var p=l==W;if(!p){if(e.__wrapped__||t.__wrapped__){return We(e.__wrapped__||e,t.__wrapped__||t,r,n,i,a)}if(l!=K){return false}var d=e.constructor,g=t.constructor;if(d!=g&&!(Ye(d)&&d instanceof d&&Ye(g)&&g instanceof g)){return false}}i||(i=[]);a||(a=[]);var v=i.length;while(v--){if(i[v]==e){return a[v]==t}}var m=0;o=true;i.push(e);a.push(t);if(p){v=e.length;m=t.length;o=m==e.length;if(!o&&!s){return o}while(m--){var b=v,y=t[m];if(s){while(b--){if(o=We(e[b],y,r,n,i,a)){break}}}else if(!(o=We(e[m],y,r,n,i,a))){break}}return o}xe(t,function(t,s,u){if(T.call(u,s)){m++;return o=T.call(e,s)&&We(e[s],t,r,n,i,a)}});if(o&&!s){xe(e,function(e,t,r){if(T.call(r,t)){return o=--m>-1}})}return o}function He(e){return N(e)&&!D(parseFloat(e))}function Ye(e){return typeof e=="function"}if(Ye(/x/)){Ye=function(e){return e instanceof Function||M.call(e)==$}}function $e(e){return e?ne[typeof e]:false}function ze(e){return Xe(e)&&e!=+e}function Ke(e){return e===null}function Xe(e){return typeof e=="number"||M.call(e)==z}var Qe=!L?Ae:function(e){if(!(e&&typeof e=="object")){return false}var t=e.valueOf,r=typeof t=="function"&&(r=L(t))&&L(r);return r?e==r||L(e)==r&&!Se(e):Ae(e)};function Ve(e){return e instanceof RegExp||M.call(e)==X}function Je(e){return typeof e=="string"||M.call(e)==Q}function Ze(e){return typeof e=="undefined"}function et(e,t,r){var n=arguments,i=0,a=2;if(!$e(e)){return e}if(r===h){var s=n[3],o=n[4],u=n[5]}else{o=[];u=[];if(typeof r!="number"){a=n.length}if(a>3&&typeof n[a-2]=="function"){s=de(n[--a-1],n[a--],2)}else if(a>2&&typeof n[a-1]=="function"){s=n[--a]}}while(++i<a){(je(n[i])?ct:Oe)(n[i],function(t,r){var n,i,a=t,f=e[r];if(t&&((i=je(t))||Qe(t))){var l=o.length;while(l--){if(n=o[l]==t){f=u[l];break}}if(!n){f=i?je(f)?f:[]:Qe(f)?f:{};if(s){a=s(f,t);if(typeof a!="undefined"){f=a}}o.push(t);u.push(f);if(!s){f=et(f,t,h,s,o,u)}}}else{if(s){a=s(f,t);if(typeof a=="undefined"){a=t}}if(typeof a!="undefined"){f=a}}e[r]=f})}return e}function tt(e,t,r){var n=typeof t=="function",i={};if(n){t=de(t,r)}else{var a=A.apply(f,arguments)}xe(e,function(e,r,s){if(n?!t(e,r,s):Tt(a,r,1)<0){i[r]=e}});return i}function rt(e){var t=-1,r=ke(e),n=r.length,i=Array(n);while(++t<n){var a=r[t];i[t]=[a,e[a]]}return i}function nt(e,t,r){var n={};if(typeof t!="function"){var i=0,a=A.apply(f,arguments),s=$e(e)?a.length:0;while(++i<s){var o=a[i];if(o in e){n[o]=e[o]}}}else{t=de(t,r);xe(e,function(e,r,i){if(t(e,r,i)){n[r]=e}})}return n}function it(e){var t=-1,r=ke(e),n=r.length,i=Array(n);while(++t<n){i[t]=e[r[t]]}return i}function at(e){var t=-1,r=A.apply(f,we(arguments,1)),n=r.length,i=Array(n);while(++t<n){i[t]=e[r[t]]}return i}function st(e,t,r){var n=-1,i=e?e.length:0,a=false;r=(r<0?U(0,i+r):r)||0;if(typeof i=="number"){a=(Je(e)?e.indexOf(t,r):Tt(e,t,r))>-1}else{ve(e,function(e){if(++n>=r){return!(a=e===t)}})}return a}function ot(e,t,r){var n={};t=de(t,r);ct(e,function(e,r,i){r=t(e,r,i)+"";T.call(n,r)?n[r]++:n[r]=1});return n}function ut(e,t,r){var n=true;t=de(t,r);if(je(e)){var i=-1,a=e.length;while(++i<a){if(!(n=!!t(e[i],i,e))){break}}}else{ve(e,function(e,r,i){return n=!!t(e,r,i)})}return n}function ft(e,t,r){var n=[];t=de(t,r);if(je(e)){var i=-1,a=e.length;while(++i<a){var s=e[i];if(t(s,i,e)){n.push(s)}}}else{ve(e,function(e,r,i){if(t(e,r,i)){n.push(e)}})}return n}function lt(e,t,r){var n;t=de(t,r);ct(e,function(e,r,i){if(t(e,r,i)){n=e;return false}});return n}function ct(e,t,r){if(t&&typeof r=="undefined"&&je(e)){var n=-1,i=e.length;while(++n<i){if(t(e[n],n,e)===false){break}}}else{ve(e,t,r)}return e}function ht(e,t,r){var n={};t=de(t,r);ct(e,function(e,r,i){r=t(e,r,i)+"";(T.call(n,r)?n[r]:n[r]=[]).push(e)});return n}function pt(e,t){var r=we(arguments,2),n=-1,i=typeof t=="function",a=e?e.length:0,s=Array(typeof a=="number"?a:0);ct(e,function(e){s[++n]=(i?t:e[t]).apply(e,r)});return s}function dt(e,t,r){var n=-1,i=e?e.length:0,a=Array(typeof i=="number"?i:0);t=de(t,r);if(je(e)){while(++n<i){a[n]=t(e[n],n,e)}}else{ve(e,function(e,r,i){a[++n]=t(e,r,i)})}return a}function gt(e,t,r){var n=-Infinity,i=n;if(!t&&je(e)){var a=-1,s=e.length;while(++a<s){var o=e[a];if(o>i){i=o}}}else{t=!t&&Je(e)?ce:de(t,r);ve(e,function(e,r,a){var s=t(e,r,a);if(s>n){n=s;i=e}})}return i}function vt(e,t,r){var n=Infinity,i=n;if(!t&&je(e)){var a=-1,s=e.length;while(++a<s){var o=e[a];if(o<i){i=o}}}else{t=!t&&Je(e)?ce:de(t,r);ve(e,function(e,r,a){var s=t(e,r,a);if(s<n){n=s;i=e}})}return i}var mt=dt;function bt(e,t,r,n){var i=arguments.length<3;t=de(t,n,4);if(je(e)){var a=-1,s=e.length;if(i){r=e[++a]}while(++a<s){r=t(r,e[a],a,e)}}else{ve(e,function(e,n,a){r=i?(i=false,e):t(r,e,n,a)})}return r}function yt(e,t,r,n){var i=e,a=e?e.length:0,s=arguments.length<3;if(typeof a!="number"){var o=ke(e);a=o.length}t=de(t,n,4);ct(e,function(e,n,u){n=o?o[--a]:--a;r=s?(s=false,i[n]):t(r,i[n],n,u)});return r}function _t(e,t,r){t=de(t,r);return ft(e,function(e,r,n){return!t(e,r,n)})}function wt(e){var t=-1,r=e?e.length:0,n=Array(typeof r=="number"?r:0);ct(e,function(e){var r=R(q()*(++t+1));n[t]=n[r];n[r]=e});return n}function Et(e){var t=e?e.length:0;return typeof t=="number"?t:ke(e).length}function St(e,t,r){var n;t=de(t,r);if(je(e)){var i=-1,a=e.length;while(++i<a){if(n=t(e[i],i,e)){break}}}else{ve(e,function(e,r,i){return!(n=t(e,r,i))})}return!!n}function xt(e,t,r){var n=-1,i=e?e.length:0,a=Array(typeof i=="number"?i:0);t=de(t,r);ct(e,function(e,r,i){a[++n]={criteria:t(e,r,i),index:n,value:e}});i=a.length;a.sort(he);while(i--){a[i]=a[i].value}return a}function Ot(e){if(e&&typeof e.length=="number"){return we(e)}return it(e)}var jt=ft;function kt(e){var t=-1,r=e?e.length:0,n=[];while(++t<r){var i=e[t];if(i){n.push(i)}}return n}function At(e){var t=-1,r=e?e.length:0,n=A.apply(f,arguments),i=le(n,r),a=[];while(++t<r){var s=e[t];if(!i(s)){a.push(s)}}return a}function Rt(e,t,r){if(e){var n=0,i=e.length;if(typeof t!="number"&&t!=null){var a=-1;t=de(t,r);while(++a<i&&t(e[a],a,e)){n++}}else{n=t;if(n==null||r){return e[0]}}return we(e,0,F(U(0,n),i))}}function Lt(e,t){var r=-1,n=e?e.length:0,i=[];while(++r<n){var a=e[r];if(je(a)){I.apply(i,t?a:Lt(a))}else{i.push(a)}}return i}function Tt(e,t,r){var n=-1,i=e?e.length:0;if(typeof r=="number"){n=(r<0?U(0,i+r):r||0)-1}else if(r){n=Ut(e,t);return e[n]===t?n:-1}while(++n<i){if(e[n]===t){return n}}return-1}function It(e,t,r){if(!e){return[]}var n=0,i=e.length;if(typeof t!="number"&&t!=null){var a=i;t=de(t,r);while(a--&&t(e[a],a,e)){n++}}else{n=t==null||r?1:t||n}return we(e,0,F(U(0,i-n),i))}function Mt(e){var t=arguments,r=t.length,n={0:{}},i=-1,a=e?e.length:0,s=a>=100,o=[],u=o;e:while(++i<a){var f=e[i];if(s){var l=f+"";var c=T.call(n[0],l)?!(u=n[0][l]):u=n[0][l]=[]}if(c||Tt(u,f)<0){if(s){u.push(f)}var h=r;while(--h){if(!(n[h]||(n[h]=le(t[h],0,100)))(f)){continue e}}o.push(f)}}return o}function Ct(e,t,r){if(e){var n=0,i=e.length;if(typeof t!="number"&&t!=null){var a=i;t=de(t,r);while(a--&&t(e[a],a,e)){n++}}else{n=t;if(n==null||r){return e[i-1]}}return we(e,U(0,i-n))}}function Pt(e,t,r){var n=e?e.length:0;if(typeof r=="number"){n=(r<0?U(0,n+r):F(r,n-1))+1}while(n--){if(e[n]===t){return n}}return-1}function Nt(e,t){var r=-1,n=e?e.length:0,i={};while(++r<n){var a=e[r];if(t){i[a]=t[r]}else{i[a[0]]=a[1]}}return i}function Dt(e,t,r){e=+e||0;r=+r||1;if(t==null){t=e;e=0}var n=-1,i=U(0,k((t-e)/r)),a=Array(i);while(++n<i){a[n]=e;e+=r}return a}function Bt(e,t,r){if(typeof t!="number"&&t!=null){var n=0,i=-1,a=e?e.length:0;t=de(t,r);while(++i<a&&t(e[i],i,e)){n++}}else{n=t==null||r?1:U(0,t)}return we(e,n)}function Ut(e,t,r,n){var i=0,a=e?e.length:i;r=r?de(r,n,1):ar;t=r(t);while(i<a){var s=i+a>>>1;r(e[s])<t?i=s+1:a=s}return i}function Ft(){return qt(A.apply(f,arguments))}function qt(e,t,r,n){var i=-1,a=e?e.length:0,s=[],o=s;if(typeof t=="function"){n=r;r=t;t=false}var u=!t&&a>=75;if(u){var f={}}if(r){o=[];r=de(r,n)}while(++i<a){var l=e[i],c=r?r(l,i,e):l;if(u){var h=c+"";var p=T.call(f,h)?!(o=f[h]):o=f[h]=[]}if(t?!i||o[o.length-1]!==c:p||Tt(o,c)<0){if(r||u){o.push(c)}s.push(l)}}return s}function Gt(e){var t=-1,r=e?e.length:0,n=le(arguments,1),i=[];while(++t<r){var a=e[t];if(!n(a)){i.push(a)}}return i}function Wt(e){var t=-1,r=e?gt(mt(arguments,"length")):0,n=Array(r);while(++t<r){n[t]=mt(arguments,t)}return n}function Ht(e,t){if(e<1){return t()}return function(){if(--e<1){return t.apply(this,arguments)}}}function Yt(e,t){return Z||C&&arguments.length>2?C.call.apply(C,arguments):pe(e,t,we(arguments,2))}function $t(e){var t=A.apply(f,arguments),r=t.length>1?0:(t=Ne(e),-1),n=t.length;while(++r<n){var i=t[r];e[i]=Yt(e[i],e)}return e}function zt(e,t){return pe(e,t,we(arguments,2))}function Kt(){var e=arguments;return function(){var t=arguments,r=e.length;while(r--){t=[e[r].apply(this,t)]}return t[0]}}function Xt(e,t,r){var n,i,a,s;function o(){s=null;if(!r){i=e.apply(a,n)}}return function(){var u=r&&!s;n=arguments;a=this;clearTimeout(s);s=setTimeout(o,t);if(u){i=e.apply(a,n)}return i}}function Qt(e,t){var r=we(arguments,2);return setTimeout(function(){e.apply(a,r)},t)}function Vt(e){var t=we(arguments,1);return setTimeout(function(){e.apply(a,t)},1)}if(J&&o&&typeof setImmediate=="function"){Vt=Yt(setImmediate,i)}function Jt(e,t){var r={};return function(){var n=(t?t.apply(this,arguments):arguments[0])+"";return T.call(r,n)?r[n]:r[n]=e.apply(this,arguments)}}function Zt(e){var t,r;return function(){if(t){return r}t=true;r=e.apply(this,arguments);e=null;return r}}function er(e){return pe(e,we(arguments,1))}function tr(e){return pe(e,we(arguments,1),null,h)}function rr(e,t){var r,n,i,a,s=0;function o(){s=new Date;a=null;n=e.apply(i,r)}return function(){var u=new Date,f=t-(u-s);r=arguments;i=this;if(f<=0){clearTimeout(a);a=null;s=u;n=e.apply(i,r)}else if(!a){a=setTimeout(o,f)}return n}}function nr(e,t){return function(){var r=[e];I.apply(r,arguments);return t.apply(this,r)}}function ir(e){return e==null?"":(e+"").replace(x,be)}function ar(e){return e}function sr(e){ct(Ne(e),function(t){var r=ae[t]=e[t];ae.prototype[t]=function(){var e=[this.__wrapped__];I.apply(e,arguments);return new ae(r.apply(ae,e))}})}function or(){i._=d;return this}function ur(e,t){if(e==null&&t==null){t=1}e=+e||0;if(t==null){t=e;e=0}return e+R(q()*((+t||0)-e+1))}function fr(e,t){var r=e?e[t]:a;return Ye(r)?e[t]():r}function lr(e,t,r){var n=ae.templateSettings;e||(e="");r=Pe({},r,n);var i=Pe({},r.imports,n.imports),s=ke(i),o=it(i);var u,f=0,l=r.interpolate||S,c="__p += '";var h=RegExp((r.escape||S).source+"|"+l.source+"|"+(l===E?w:S).source+"|"+(r.evaluate||S).source+"|$","g");e.replace(h,function(t,r,n,i,a,s){n||(n=i);c+=e.slice(f,s).replace(O,me);if(r){c+="' +\n__e("+r+") +\n'"}if(a){u=true;c+="';\n"+a+";\n__p += '"}if(n){c+="' +\n((__t = ("+n+")) == null ? '' : __t) +\n'"}f=s+t.length;return t});c+="';\n";var p=r.variable,d=p;if(!d){p="obj";c="with ("+p+") {\n"+c+"\n}\n"}c=(u?c.replace(v,""):c).replace(m,"$1").replace(b,"$1;");c="function("+p+") {\n"+(d?"":p+" || ("+p+" = {});\n")+"var __t, __p = '', __e = _.escape"+(u?", __j = Array.prototype.join;\n"+"function print() { __p += __j.call(arguments, '') }\n":";\n")+c+"return __p\n}";var g="\n/*\n//@ sourceURL="+(r.sourceURL||"/lodash/template/source["+j++ +"]")+"\n*/";try{var y=Function(s,"return "+c+g).apply(a,o)}catch(_){_.source=c;throw _}if(t){return y(t)}y.source=c;return y}function cr(e,t,r){e=+e||0;var n=-1,i=Array(e);while(++n<e){i[n]=t.call(r,n)}return i}function hr(e){return e==null?"":(e+"").replace(g,Ee)}function pr(e){var t=++c;return(e==null?"":e+"")+t}function dr(e,t){t(e);return e}function gr(){return this.__wrapped__+""}function vr(){return this.__wrapped__}ae.after=Ht;ae.assign=Ie;ae.at=at;ae.bind=Yt;ae.bindAll=$t;ae.bindKey=zt;ae.compact=kt;ae.compose=Kt;ae.countBy=ot;ae.debounce=Xt;ae.defaults=Pe;ae.defer=Vt;ae.delay=Qt;ae.difference=At;ae.filter=ft;ae.flatten=Lt;ae.forEach=ct;ae.forIn=xe;ae.forOwn=Oe;ae.functions=Ne;ae.groupBy=ht;ae.initial=It;ae.intersection=Mt;ae.invert=Be;ae.invoke=pt;ae.keys=ke;ae.map=dt;ae.max=gt;ae.memoize=Jt;ae.merge=et;ae.min=vt;ae.object=Nt;ae.omit=tt;ae.once=Zt;ae.pairs=rt;ae.partial=er;ae.partialRight=tr;ae.pick=nt;ae.pluck=mt;ae.range=Dt;ae.reject=_t;ae.rest=Bt;ae.shuffle=wt;ae.sortBy=xt;ae.tap=dr;ae.throttle=rr;ae.times=cr;ae.toArray=Ot;ae.union=Ft;ae.uniq=qt;ae.values=it;ae.where=jt;ae.without=Gt;ae.wrap=nr;ae.zip=Wt;ae.collect=dt;ae.drop=Bt;ae.each=ct;ae.extend=Ie;ae.methods=Ne;ae.select=ft;ae.tail=Bt;ae.unique=qt;sr(ae);ae.clone=Me;ae.cloneDeep=Ce;ae.contains=st;ae.escape=ir;ae.every=ut;ae.find=lt;ae.has=De;ae.identity=ar;ae.indexOf=Tt;ae.isArguments=Se;ae.isArray=je;ae.isBoolean=Ue;ae.isDate=Fe;ae.isElement=qe;ae.isEmpty=Ge;ae.isEqual=We;ae.isFinite=He;ae.isFunction=Ye;ae.isNaN=ze;ae.isNull=Ke;ae.isNumber=Xe;ae.isObject=$e;ae.isPlainObject=Qe;ae.isRegExp=Ve;ae.isString=Je;ae.isUndefined=Ze;ae.lastIndexOf=Pt;ae.mixin=sr;ae.noConflict=or;ae.random=ur;ae.reduce=bt;ae.reduceRight=yt;ae.result=fr;ae.size=Et;ae.some=St;ae.sortedIndex=Ut;ae.template=lr;ae.unescape=hr;ae.uniqueId=pr;ae.all=ut;ae.any=St;ae.detect=lt;ae.foldl=bt;ae.foldr=yt;ae.include=st;ae.inject=bt;Oe(ae,function(e,t){if(!ae.prototype[t]){ae.prototype[t]=function(){var t=[this.__wrapped__];I.apply(t,arguments);return e.apply(ae,t)}}});ae.first=Rt;ae.last=Ct;ae.take=Rt;ae.head=Rt;Oe(ae,function(e,t){if(!ae.prototype[t]){ae.prototype[t]=function(t,r){var n=e(this.__wrapped__,t,r);return t==null||r&&typeof t!="function"?n:new ae(n)}}});ae.VERSION="1.0.2";ae.prototype.toString=gr;ae.prototype.value=vr;ae.prototype.valueOf=vr;ve(["join","pop","shift"],function(e){var t=f[e];ae.prototype[e]=function(){return t.apply(this.__wrapped__,arguments)}});ve(["push","reverse","sort","unshift"],function(e){var t=f[e];ae.prototype[e]=function(){t.apply(this.__wrapped__,arguments);return this}});ve(["concat","slice","splice"],function(e){var t=f[e];ae.prototype[e]=function(){return new ae(t.apply(this.__wrapped__,arguments))}});if(typeof e=="function"&&typeof e.amd=="object"&&e.amd){i._=ae;e(function(){return ae})}else if(s){if(o){(o.exports=ae)._=ae}else{s._=ae}}else{i._=ae}})(this)}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}],278:[function(e,t,r){(function(r){(function(e,t,r,n){if(r)r.exports=b;else t.minimatch=b;if(!e){e=function(e){switch(e){case"sigmund":return function t(e){return JSON.stringify(e)};case"path":return{basename:function(e){e=e.split(/[\/\\]/);var t=e.pop();if(!t)t=e.pop();return t}};case"lru-cache":return function r(){var e={};var t=0;this.set=function(r,n){t++;if(t>=100)e={};e[r]=n};this.get=function(t){return e[t]}}}}}b.Minimatch=y;var i=e("lru-cache"),a=b.cache=new i({max:100}),s=b.GLOBSTAR=y.GLOBSTAR={},o=e("sigmund");var u=e("path"),f="[^/]",l=f+"*?",c="(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?",h="(?:(?!(?:\\/|^)\\.).)*?",p=d("().*{}+?[]^$\\!");function d(e){return e.split("").reduce(function(e,t){e[t]=true;return e},{})}var g=/\/+/;b.filter=v;function v(e,t){t=t||{};return function(r,n,i){return b(r,e,t)}}function m(e,t){e=e||{};t=t||{};var r={};Object.keys(t).forEach(function(e){r[e]=t[e]});Object.keys(e).forEach(function(t){r[t]=e[t]});return r}b.defaults=function(e){if(!e||!Object.keys(e).length)return b;var t=b;var r=function n(r,i,a){return t.minimatch(r,i,m(e,a))};r.Minimatch=function i(r,n){return new t.Minimatch(r,m(e,n))};return r};y.defaults=function(e){if(!e||!Object.keys(e).length)return y;return b.defaults(e).Minimatch};function b(e,t,r){if(typeof t!=="string"){
throw new TypeError("glob pattern string required")}if(!r)r={};if(!r.nocomment&&t.charAt(0)==="#"){return false}if(t.trim()==="")return e==="";return new y(t,r).match(e)}function y(e,t){if(!(this instanceof y)){return new y(e,t,a)}if(typeof e!=="string"){throw new TypeError("glob pattern string required")}if(!t)t={};e=e.trim();if(n==="win32"){e=e.split("\\").join("/")}var r=e+"\n"+o(t);var i=b.cache.get(r);if(i)return i;b.cache.set(r,this);this.options=t;this.set=[];this.pattern=e;this.regexp=null;this.negate=false;this.comment=false;this.empty=false;this.make()}y.prototype.debug=function(){};y.prototype.make=_;function _(){if(this._made)return;var e=this.pattern;var t=this.options;if(!t.nocomment&&e.charAt(0)==="#"){this.comment=true;return}if(!e){this.empty=true;return}this.parseNegate();var r=this.globSet=this.braceExpand();if(t.debug)this.debug=console.error;this.debug(this.pattern,r);r=this.globParts=r.map(function(e){return e.split(g)});this.debug(this.pattern,r);r=r.map(function(e,t,r){return e.map(this.parse,this)},this);this.debug(this.pattern,r);r=r.filter(function(e){return-1===e.indexOf(false)});this.debug(this.pattern,r);this.set=r}y.prototype.parseNegate=w;function w(){var e=this.pattern,t=false,r=this.options,n=0;if(r.nonegate)return;for(var i=0,a=e.length;i<a&&e.charAt(i)==="!";i++){t=!t;n++}if(n)this.pattern=e.substr(n);this.negate=t}b.braceExpand=function(e,t){return new y(e,t).braceExpand()};y.prototype.braceExpand=E;function E(e,t){t=t||this.options;e=typeof e==="undefined"?this.pattern:e;if(typeof e==="undefined"){throw new Error("undefined pattern")}if(t.nobrace||!e.match(/\{.*\}/)){return[e]}var r=false;if(e.charAt(0)!=="{"){this.debug(e);var n=null;for(var i=0,a=e.length;i<a;i++){var s=e.charAt(i);this.debug(i,s);if(s==="\\"){r=!r}else if(s==="{"&&!r){n=e.substr(0,i);break}}if(n===null){this.debug("no sets");return[e]}var o=E.call(this,e.substr(i),t);return o.map(function(e){return n+e})}var u=e.match(/^\{(-?[0-9]+)\.\.(-?[0-9]+)\}/);if(u){this.debug("numset",u[1],u[2]);var f=E.call(this,e.substr(u[0].length),t),l=+u[1],c=+u[2],h=l>c?-1:1,p=[];for(var i=l;i!=c+h;i+=h){for(var d=0,g=f.length;d<g;d++){p.push(i+f[d])}}return p}var i=1,v=1,p=[],m="",b=false,r=false;function y(){p.push(m);m=""}this.debug("Entering for");e:for(i=1,a=e.length;i<a;i++){var s=e.charAt(i);this.debug("",i,s);if(r){r=false;m+="\\"+s}else{switch(s){case"\\":r=true;continue;case"{":v++;m+="{";continue;case"}":v--;if(v===0){y();i++;break e}else{m+=s;continue}case",":if(v===1){y()}else{m+=s}continue;default:m+=s;continue}}}if(v!==0){this.debug("didn't close",e);return E.call(this,"\\"+e,t)}this.debug("set",p);this.debug("suffix",e.substr(i));var f=E.call(this,e.substr(i),t);var _=p.length===1;this.debug("set pre-expanded",p);p=p.map(function(e){return E.call(this,e,t)},this);this.debug("set expanded",p);p=p.reduce(function(e,t){return e.concat(t)});if(_){p=p.map(function(e){return"{"+e+"}"})}var w=[];for(var i=0,a=p.length;i<a;i++){for(var d=0,g=f.length;d<g;d++){w.push(p[i]+f[d])}}return w}y.prototype.parse=x;var S={};function x(e,t){var r=this.options;if(!r.noglobstar&&e==="**")return s;if(e==="")return"";var n="",i=!!r.nocase,a=false,o=[],u,c,h=false,d=-1,g=-1,v=e.charAt(0)==="."?"":r.dot?"(?!(?:^|\\/)\\.{1,2}(?:$|\\/))":"(?!\\.)",m=this;function b(){if(c){switch(c){case"*":n+=l;i=true;break;case"?":n+=f;i=true;break;default:n+="\\"+c;break}m.debug("clearStateChar %j %j",c,n);c=false}}for(var y=0,_=e.length,w;y<_&&(w=e.charAt(y));y++){this.debug("%s	%s %s %j",e,y,n,w);if(a&&p[w]){n+="\\"+w;a=false;continue}e:switch(w){case"/":return false;case"\\":b();a=true;continue;case"?":case"*":case"+":case"@":case"!":this.debug("%s	%s %s %j <-- stateChar",e,y,n,w);if(h){this.debug("  in class");if(w==="!"&&y===g+1)w="^";n+=w;continue}m.debug("call clearStateChar %j",c);b();c=w;if(r.noext)b();continue;case"(":if(h){n+="(";continue}if(!c){n+="\\(";continue}u=c;o.push({type:u,start:y-1,reStart:n.length});n+=c==="!"?"(?:(?!":"(?:";this.debug("plType %j %j",c,n);c=false;continue;case")":if(h||!o.length){n+="\\)";continue}b();i=true;n+=")";u=o.pop().type;switch(u){case"!":n+="[^/]*?)";break;case"?":case"+":case"*":n+=u;case"@":break}continue;case"|":if(h||!o.length||a){n+="\\|";a=false;continue}b();n+="|";continue;case"[":b();if(h){n+="\\"+w;continue}h=true;g=y;d=n.length;n+=w;continue;case"]":if(y===g+1||!h){n+="\\"+w;a=false;continue}i=true;h=false;n+=w;continue;default:b();if(a){a=false}else if(p[w]&&!(w==="^"&&h)){n+="\\"}n+=w}}if(h){var E=e.substr(g+1),x=this.parse(E,S);n=n.substr(0,d)+"\\["+x[0];i=i||x[1]}var O;while(O=o.pop()){var j=n.slice(O.reStart+3);j=j.replace(/((?:\\{2})*)(\\?)\|/g,function(e,t,r){if(!r){r="\\"}return t+t+r+"|"});this.debug("tail=%j\n   %s",j,j);var A=O.type==="*"?l:O.type==="?"?f:"\\"+O.type;i=true;n=n.slice(0,O.reStart)+A+"\\("+j}b();if(a){n+="\\\\"}var R=false;switch(n.charAt(0)){case".":case"[":case"(":R=true}if(n!==""&&i)n="(?=.)"+n;if(R)n=v+n;if(t===S){return[n,i]}if(!i){return k(e)}var L=r.nocase?"i":"",T=new RegExp("^"+n+"$",L);T._glob=e;T._src=n;return T}b.makeRe=function(e,t){return new y(e,t||{}).makeRe()};y.prototype.makeRe=O;function O(){if(this.regexp||this.regexp===false)return this.regexp;var e=this.set;if(!e.length)return this.regexp=false;var t=this.options;var r=t.noglobstar?l:t.dot?c:h,n=t.nocase?"i":"";var i=e.map(function(e){return e.map(function(e){return e===s?r:typeof e==="string"?A(e):e._src}).join("\\/")}).join("|");i="^(?:"+i+")$";if(this.negate)i="^(?!"+i+").*$";try{return this.regexp=new RegExp(i,n)}catch(a){return this.regexp=false}}b.match=function(e,t,r){var n=new y(t,r);e=e.filter(function(e){return n.match(e)});if(r.nonull&&!e.length){e.push(t)}return e};y.prototype.match=j;function j(e,t){this.debug("match",e,this.pattern);if(this.comment)return false;if(this.empty)return e==="";if(e==="/"&&t)return true;var r=this.options;if(n==="win32"){e=e.split("\\").join("/")}e=e.split(g);this.debug(this.pattern,"split",e);var i=this.set;this.debug(this.pattern,"set",i);var a=u.basename(e.join("/")).split("/");for(var s=0,o=i.length;s<o;s++){var f=i[s],l=e;if(r.matchBase&&f.length===1){l=a}var c=this.matchOne(l,f,t);if(c){if(r.flipNegate)return true;return!this.negate}}if(r.flipNegate)return false;return this.negate}y.prototype.matchOne=function(e,t,r){var n=this.options;this.debug("matchOne",{"this":this,file:e,pattern:t});this.debug("matchOne",e.length,t.length);for(var i=0,a=0,o=e.length,u=t.length;i<o&&a<u;i++,a++){this.debug("matchOne loop");var f=t[a],l=e[i];this.debug(t,f,l);if(f===false)return false;if(f===s){this.debug("GLOBSTAR",[t,f,l]);var c=i,h=a+1;if(h===u){this.debug("** at the end");for(;i<o;i++){if(e[i]==="."||e[i]===".."||!n.dot&&e[i].charAt(0)===".")return false}return true}e:while(c<o){var p=e[c];this.debug("\nglobstar while",e,c,t,h,p);if(this.matchOne(e.slice(c),t.slice(h),r)){this.debug("globstar found match!",c,o,p);return true}else{if(p==="."||p===".."||!n.dot&&p.charAt(0)==="."){this.debug("dot detected!",e,c,t,h);break e}this.debug("globstar swallow a segment, and continue");c++}}if(r){this.debug("\n>>> no match, partial?",e,c,t,h);if(c===o)return true}return false}var d;if(typeof f==="string"){if(n.nocase){d=l.toLowerCase()===f.toLowerCase()}else{d=l===f}this.debug("string match",f,l,d)}else{d=l.match(f);this.debug("pattern match",f,l,d)}if(!d)return false}if(i===o&&a===u){return true}else if(i===o){return r}else if(a===u){var g=i===o-1&&e[i]==="";return g}throw new Error("wtf?")};function k(e){return e.replace(/\\(.)/g,"$1")}function A(e){return e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")}})(typeof e==="function"?e:null,this,typeof t==="object"?t:null,typeof r==="object"?r.platform:"win32")}).call(this,e("_process"))},{_process:14,"lru-cache":279,path:13,sigmund:280}],279:[function(e,t,r){(function(){if(typeof t==="object"&&t.exports){t.exports=n}else{this.LRUCache=n}function e(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function r(){return 1}function n(e){if(!(this instanceof n))return new n(e);if(typeof e==="number")e={max:e};if(!e)e={};this._max=e.max;if(!this._max||!(typeof this._max==="number")||this._max<=0)this._max=Infinity;this._lengthCalculator=e.length||r;if(typeof this._lengthCalculator!=="function")this._lengthCalculator=r;this._allowStale=e.stale||false;this._maxAge=e.maxAge||null;this._dispose=e.dispose;this.reset()}Object.defineProperty(n.prototype,"max",{set:function(e){if(!e||!(typeof e==="number")||e<=0)e=Infinity;this._max=e;if(this._length>this._max)o(this)},get:function(){return this._max},enumerable:true});Object.defineProperty(n.prototype,"lengthCalculator",{set:function(e){if(typeof e!=="function"){this._lengthCalculator=r;this._length=this._itemCount;for(var t in this._cache){this._cache[t].length=1}}else{this._lengthCalculator=e;this._length=0;for(var t in this._cache){this._cache[t].length=this._lengthCalculator(this._cache[t].value);this._length+=this._cache[t].length}}if(this._length>this._max)o(this)},get:function(){return this._lengthCalculator},enumerable:true});Object.defineProperty(n.prototype,"length",{get:function(){return this._length},enumerable:true});Object.defineProperty(n.prototype,"itemCount",{get:function(){return this._itemCount},enumerable:true});n.prototype.forEach=function(e,t){t=t||this;var r=0;var n=this._itemCount;for(var i=this._mru-1;i>=0&&r<n;i--)if(this._lruList[i]){r++;var s=this._lruList[i];if(a(this,s)){f(this,s);if(!this._allowStale)s=undefined}if(s){e.call(t,s.value,s.key,this)}}};n.prototype.keys=function(){var e=new Array(this._itemCount);var t=0;for(var r=this._mru-1;r>=0&&t<this._itemCount;r--)if(this._lruList[r]){var n=this._lruList[r];e[t++]=n.key}return e};n.prototype.values=function(){var e=new Array(this._itemCount);var t=0;for(var r=this._mru-1;r>=0&&t<this._itemCount;r--)if(this._lruList[r]){var n=this._lruList[r];e[t++]=n.value}return e};n.prototype.reset=function(){if(this._dispose&&this._cache){for(var e in this._cache){this._dispose(e,this._cache[e].value)}}this._cache=Object.create(null);this._lruList=Object.create(null);this._mru=0;this._lru=0;this._length=0;this._itemCount=0};n.prototype.dump=function(){return this._cache};n.prototype.dumpLru=function(){return this._lruList};n.prototype.set=function(t,r,n){n=n||this._maxAge;var i=n?Date.now():0;if(e(this._cache,t)){if(this._dispose)this._dispose(t,this._cache[t].value);this._cache[t].now=i;this._cache[t].maxAge=n;this._cache[t].value=r;this.get(t);return true}var a=this._lengthCalculator(r);var s=new l(t,r,this._mru++,a,i,n);if(s.length>this._max){if(this._dispose)this._dispose(t,r);return false}this._length+=s.length;this._lruList[s.lu]=this._cache[t]=s;this._itemCount++;if(this._length>this._max)o(this);return true};n.prototype.has=function(t){if(!e(this._cache,t))return false;var r=this._cache[t];if(a(this,r)){return false}return true};n.prototype.get=function(e){return i(this,e,true)};n.prototype.peek=function(e){return i(this,e,false)};n.prototype.pop=function(){var e=this._lruList[this._lru];f(this,e);return e||null};n.prototype.del=function(e){f(this,this._cache[e])};function i(e,t,r){var n=e._cache[t];if(n){if(a(e,n)){f(e,n);if(!e._allowStale)n=undefined}else{if(r)s(e,n)}if(n)n=n.value}return n}function a(e,t){if(!t||!t.maxAge&&!e._maxAge)return false;var r=false;var n=Date.now()-t.now;if(t.maxAge){r=n>t.maxAge}else{r=e._maxAge&&n>e._maxAge}return r}function s(e,t){u(e,t);t.lu=e._mru++;e._lruList[t.lu]=t}function o(e){while(e._lru<e._mru&&e._length>e._max)f(e,e._lruList[e._lru])}function u(e,t){delete e._lruList[t.lu];while(e._lru<e._mru&&!e._lruList[e._lru])e._lru++}function f(e,t){if(t){if(e._dispose)e._dispose(t.key,t.value);e._length-=t.length;e._itemCount--;delete e._cache[t.key];u(e,t)}}function l(e,t,r,n,i,a){this.key=e;this.value=t;this.lu=r;this.length=n;this.now=i;if(a)this.maxAge=a}})()},{}],280:[function(e,t,r){t.exports=n;function n(e,t){t=t||10;var r=[];var n="";var i=RegExp;function a(e,s){if(s>t)return;if(typeof e==="function"||typeof e==="undefined"){return}if(typeof e!=="object"||!e||e instanceof i){n+=e;return}if(r.indexOf(e)!==-1||s===t)return;r.push(e);n+="{";Object.keys(e).forEach(function(t,r,i){if(t.charAt(0)==="_")return;var o=typeof e[t];if(o==="function"||o==="undefined")return;n+=t;a(e[t],s+1)})}a(e,0);return n}},{}],281:[function(e,t,r){"use strict";t.exports=function i(e){if(typeof e==="string"&&e.length>0){return true}if(Array.isArray(e)){return e.length!==0&&n(e)}return false};function n(e){var t=e.length;while(t--){if(typeof e[t]!=="string"||e[t].length<=0){return false}}return true}},{}],282:[function(e,t,r){"use strict";var n=e("through2");t.exports=function(){var e=[];var t=n.obj();t.setMaxListeners(0);t.add=r;t.isEmpty=i;t.on("unpipe",a);Array.prototype.slice.call(arguments).forEach(r);return t;function r(n){if(Array.isArray(n)){n.forEach(r);return this}e.push(n);n.once("end",a.bind(null,n));n.pipe(t,{end:false});return this}function i(){return e.length==0}function a(r){e=e.filter(function(e){return e!==r});if(!e.length&&t.readable){t.end()}}}},{through2:293}],283:[function(e,t,r){arguments[4][248][0].apply(r,arguments)},{"./_stream_readable":284,"./_stream_writable":286,_process:14,"core-util-is":287,dup:248,inherits:288}],284:[function(e,t,r){arguments[4][259][0].apply(r,arguments)},{_process:14,buffer:4,"core-util-is":287,dup:259,events:9,inherits:288,isarray:289,stream:32,"string_decoder/":290}],285:[function(e,t,r){arguments[4][260][0].apply(r,arguments)},{"./_stream_duplex":283,"core-util-is":287,dup:260,inherits:288}],286:[function(e,t,r){arguments[4][261][0].apply(r,arguments)},{"./_stream_duplex":283,_process:14,buffer:4,"core-util-is":287,dup:261,inherits:288,stream:32}],287:[function(e,t,r){arguments[4][25][0].apply(r,arguments)},{buffer:4,dup:25}],288:[function(e,t,r){arguments[4][10][0].apply(r,arguments)},{dup:10}],289:[function(e,t,r){arguments[4][11][0].apply(r,arguments)},{dup:11}],290:[function(e,t,r){arguments[4][42][0].apply(r,arguments)},{buffer:4,dup:42}],291:[function(e,t,r){arguments[4][30][0].apply(r,arguments)},{"./lib/_stream_transform.js":285,dup:30}],292:[function(e,t,r){arguments[4][47][0].apply(r,arguments)},{dup:47}],293:[function(e,t,r){arguments[4][268][0].apply(r,arguments)},{_process:14,dup:268,"readable-stream/transform":291,util:46,xtend:292}],294:[function(e,t,r){(function(r){var n=e("path");var i=e("fs");var a=parseInt("0777",8);t.exports=s.mkdirp=s.mkdirP=s;function s(e,t,o,u){if(typeof t==="function"){o=t;t={}}else if(!t||typeof t!=="object"){t={mode:t}}var f=t.mode;var l=t.fs||i;if(f===undefined){f=a&~r.umask()}if(!u)u=null;var c=o||function(){};e=n.resolve(e);l.mkdir(e,f,function(r){if(!r){u=u||e;return c(null,u)}switch(r.code){case"ENOENT":s(n.dirname(e),t,function(r,n){if(r)c(r,n);else s(e,t,c,n)});break;default:l.stat(e,function(e,t){if(e||!t.isDirectory())c(r,u);else c(null,u)});break}})}s.sync=function o(e,t,s){if(!t||typeof t!=="object"){t={mode:t}}var u=t.mode;var f=t.fs||i;if(u===undefined){u=a&~r.umask()}if(!s)s=null;e=n.resolve(e);try{f.mkdirSync(e,u);s=s||e}catch(l){switch(l.code){case"ENOENT":s=o(n.dirname(e),t,s);o(e,t,s);break;default:var c;try{c=f.statSync(e)}catch(h){throw l}if(!c.isDirectory())throw l;break}}return s}}).call(this,e("_process"))},{_process:14,fs:1,path:13}],295:[function(e,t,r){"use strict";var n=Object.prototype.propertyIsEnumerable;function i(e){if(e==null){throw new TypeError("Object.assign cannot be called with null or undefined")}return Object(e)}function a(e){var t=Object.getOwnPropertyNames(e);if(Object.getOwnPropertySymbols){t=t.concat(Object.getOwnPropertySymbols(e))}return t.filter(function(t){return n.call(e,t)})}t.exports=Object.assign||function(e,t){var r;var n;var s=i(e);for(var o=1;o<arguments.length;o++){r=arguments[o];n=a(Object(r));for(var u=0;u<n.length;u++){s[n[u]]=r[n[u]]}}return s}},{}],296:[function(e,t,r){"use strict";t.exports=o;t.exports.ctor=a;t.exports.objCtor=s;t.exports.obj=u;var n=e("through2");var i=e("xtend");function a(e,t){if(typeof e=="function"){t=e;e={}}var r=n.ctor(e,function(e,r,n){if(this.options.wantStrings)e=e.toString();if(t.call(this,e,this._index++))this.push(e);return n()});r.prototype._index=0;return r}function s(e,t){if(typeof e==="function"){t=e;e={}}e=i({objectMode:true,highWaterMark:16},e);return a(e,t)}function o(e,t){return a(e,t)()}function u(e,t){if(typeof e==="function"){t=e;e={}}e=i({objectMode:true,highWaterMark:16},e);return o(e,t)}},{through2:310,xtend:297}],297:[function(e,t,r){arguments[4][47][0].apply(r,arguments)},{dup:47}],298:[function(e,t,r){arguments[4][20][0].apply(r,arguments)},{"./_stream_readable":299,"./_stream_writable":301,"core-util-is":302,dup:20,inherits:303,"process-nextick-args":305}],299:[function(e,t,r){arguments[4][22][0].apply(r,arguments)},{"./_stream_duplex":298,_process:14,buffer:4,"core-util-is":302,dup:22,events:9,inherits:303,isarray:304,"process-nextick-args":305,"string_decoder/":306,util:3}],300:[function(e,t,r){arguments[4][23][0].apply(r,arguments)},{"./_stream_duplex":298,"core-util-is":302,dup:23,inherits:303}],301:[function(e,t,r){arguments[4][24][0].apply(r,arguments)},{"./_stream_duplex":298,buffer:4,"core-util-is":302,dup:24,events:9,inherits:303,"process-nextick-args":305,"util-deprecate":307}],302:[function(e,t,r){arguments[4][25][0].apply(r,arguments)},{buffer:4,dup:25}],303:[function(e,t,r){arguments[4][10][0].apply(r,arguments)},{dup:10}],304:[function(e,t,r){arguments[4][11][0].apply(r,arguments)},{dup:11}],305:[function(e,t,r){arguments[4][26][0].apply(r,arguments)},{_process:14,dup:26}],306:[function(e,t,r){arguments[4][42][0].apply(r,arguments)},{buffer:4,dup:42}],307:[function(e,t,r){arguments[4][27][0].apply(r,arguments)},{dup:27}],308:[function(e,t,r){arguments[4][30][0].apply(r,arguments)},{"./lib/_stream_transform.js":300,dup:30}],309:[function(e,t,r){arguments[4][47][0].apply(r,arguments)},{dup:47}],310:[function(e,t,r){arguments[4][268][0].apply(r,arguments)},{_process:14,dup:268,"readable-stream/transform":308,util:46,xtend:309}],311:[function(e,t,r){var n=e("path");t.exports=i;function i(e,t){var r={paths:[],named:{},unnamed:[]};function i(e){if(!r.named[e]){r.named[e]={children:[]}}return r.named[e]}e.on("data",function(a){if(t===null){e.on("data",function(){});return}if(a.path){var s=i(a.path);s.file=a;var o=i(n.dirname(a.path));if(s!==o)o.children.push(s);r.paths.push(a.path)}else{r.unnamed.push({file:a,children:[]})}});e.on("error",function(e){t&&t(e);t=null});e.on("end",function(){t&&t(null,r);t=null})}},{path:13}],312:[function(e,t,r){var n=t.exports={};n.randomString=i;n.cleanPath=a;function i(){return Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)}function a(e,t){if(!e)return"";if(!t)return e;if(t[t.length-1]!="/"){t+="/"}e=e.replace(t,"");e=e.replace(/[\/]+/g,"/");return e}},{}],313:[function(e,t,r){var n=e("./mp2v_flat");var i=e("./mp2v_tree");var a=t.exports=i;a.flat=n;a.tree=i},{"./mp2v_flat":314,"./mp2v_tree":315}],314:[function(e,t,r){var n=e("multipart-stream");var i=e("duplexify");var a=e("stream");var s=e("./common");c=s.randomString;t.exports=o;function o(e){e=e||{};e.boundary=e.boundary||c();var t=new a.Writable({objectMode:true});var r=new a.PassThrough({objectMode:true});var s=new n(e.boundary);t._write=function(e,t,r){u(s,e,r)};t.on("finish",function(){s.pipe(r)});var o=i.obj(t,r);o.boundary=e.boundary;return o}function u(e,t,r){var n=t.contents;if(n===null)n=f();e.addPart({body:t.contents,headers:l(t)});r(null)}function f(){var e=new a.PassThrough({objectMode:true});e.write(null);return e}function l(e){var t=s.cleanPath(e.path,e.base);var r={};r["Content-Disposition"]='file; filename="'+t+'"';if(e.isDirectory()){r["Content-Type"]="text/directory"}else{r["Content-Type"]="application/octet-stream"}return r}function c(){return Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)}},{"./common":312,duplexify:316,"multipart-stream":196,stream:32}],315:[function(e,t,r){var n=e("multipart-stream");var i=e("duplexify");var a=e("stream");var s=e("path");var o=e("./collect");var u=e("./common");randomString=u.randomString;t.exports=f;function f(e){e=e||{};e.boundary=e.boundary||randomString();var t=new a.PassThrough({objectMode:true});var r=new a.PassThrough({objectMode:true});var n=i.obj(r,t);n.boundary=e.boundary;o(r,function(r,i){if(r){t.emit("error",r);return}try{var a=l(e.boundary,i);n.multipartHdr="Content-Type: multipart/mixed; boundary="+a.boundary;if(e.writeHeader){t.write(n.multipartHdr+"\r\n");t.write("\r\n")}a.pipe(t)}catch(s){t.emit("error",s)}});return n}function l(e,t){var r=[];t.paths.sort();for(var i=0;i<t.paths.length;i++){var a=t.paths[i];var s=h(t,a);if(!s)continue;r.push({body:s,headers:g(t.named[a])})}for(var i=0;i<t.unnamed.length;i++){var o=t.unnamed[i];var s=p(t,o);if(!s)continue;r.push({body:s,headers:g(o)})}if(r.length==0){var s=c("--"+e+"--\r\n");s.boundary=e;return s}var u=new n(e);for(var i=0;i<r.length;i++){u.addPart(r[i])}return u}function c(e){var t=new a.PassThrough;t.end(e);return t}function h(e,t){var r=e.named[t];if(!r){throw new Error("no object for path. lib error.")}if(!r.file){return}if(r.done)return null;r.done=true;return p(e,r)}function p(e,t){if(t.file.isDirectory()){return d(e,t)}if(t.children.length>0){throw new Error("non-directory has children. lib error")}return t.file.contents}function d(e,t){t.boundary=randomString();if(!t.children||t.children.length<1){return c("--"+t.boundary+"--\r\n")}var r=new n(t.boundary);for(var i=0;i<t.children.length;i++){var a=t.children[i];if(!a.file){throw new Error("child has no file. lib error")}var s=h(e,a.file.path);r.addPart({body:s,headers:g(a)})}return r}function g(e){var t=u.cleanPath(e.file.path,e.file.base);var r={};r["Content-Disposition"]='file; filename="'+t+'"';if(e.file.isDirectory()){r["Content-Type"]="multipart/mixed; boundary="+e.boundary}else{r["Content-Type"]="application/octet-stream"}return r}},{"./collect":311,"./common":312,duplexify:316,"multipart-stream":196,path:13,stream:32}],316:[function(e,t,r){arguments[4][214][0].apply(r,arguments)},{_process:14,buffer:4,dup:214,"end-of-stream":317,"readable-stream":331,util:46}],317:[function(e,t,r){arguments[4][215][0].apply(r,arguments)},{dup:215,once:319}],318:[function(e,t,r){arguments[4][216][0].apply(r,arguments)},{dup:216}],319:[function(e,t,r){arguments[4][217][0].apply(r,arguments)},{dup:217,wrappy:318}],320:[function(e,t,r){arguments[4][20][0].apply(r,arguments)},{"./_stream_readable":322,"./_stream_writable":324,"core-util-is":325,dup:20,inherits:326,"process-nextick-args":328}],321:[function(e,t,r){arguments[4][21][0].apply(r,arguments)},{"./_stream_transform":323,"core-util-is":325,dup:21,inherits:326}],322:[function(e,t,r){arguments[4][22][0].apply(r,arguments)},{"./_stream_duplex":320,_process:14,buffer:4,"core-util-is":325,dup:22,events:9,inherits:326,isarray:327,"process-nextick-args":328,"string_decoder/":329,util:3}],323:[function(e,t,r){arguments[4][23][0].apply(r,arguments)},{"./_stream_duplex":320,"core-util-is":325,dup:23,inherits:326}],324:[function(e,t,r){arguments[4][24][0].apply(r,arguments)},{"./_stream_duplex":320,buffer:4,"core-util-is":325,dup:24,events:9,inherits:326,"process-nextick-args":328,"util-deprecate":330}],325:[function(e,t,r){arguments[4][25][0].apply(r,arguments)},{buffer:4,dup:25}],326:[function(e,t,r){arguments[4][10][0].apply(r,arguments)},{dup:10}],327:[function(e,t,r){arguments[4][11][0].apply(r,arguments)},{dup:11}],328:[function(e,t,r){arguments[4][26][0].apply(r,arguments)},{_process:14,dup:26}],329:[function(e,t,r){arguments[4][42][0].apply(r,arguments)},{buffer:4,dup:42}],330:[function(e,t,r){arguments[4][27][0].apply(r,arguments)},{dup:27}],331:[function(e,t,r){arguments[4][29][0].apply(r,arguments)},{"./lib/_stream_duplex.js":320,"./lib/_stream_passthrough.js":321,"./lib/_stream_readable.js":322,"./lib/_stream_transform.js":323,"./lib/_stream_writable.js":324,dup:29}],332:[function(e,t,r){(function(r){var n=e("path");var i=e("clone");var a=e("clone-stats");var s=e("./lib/cloneBuffer");var o=e("./lib/isBuffer");var u=e("./lib/isStream");var f=e("./lib/isNull");var l=e("./lib/inspectStream");var c=e("stream");var h=e("replace-ext");function p(e){if(!e)e={};var t=e.path?[e.path]:e.history;this.history=t||[];this.cwd=e.cwd||r.cwd();this.base=e.base||this.cwd;this.stat=e.stat||null;this.contents=e.contents||null}p.prototype.isBuffer=function(){return o(this.contents)};p.prototype.isStream=function(){return u(this.contents)};p.prototype.isNull=function(){return f(this.contents)};p.prototype.isDirectory=function(){return this.isNull()&&this.stat&&this.stat.isDirectory()};p.prototype.clone=function(e){if(typeof e==="boolean"){e={deep:e,contents:true}}else if(!e){e={deep:true,contents:true}}else{e.deep=e.deep===true;e.contents=e.contents!==false}var t;if(this.isStream()){t=this.contents.pipe(new c.PassThrough);this.contents=this.contents.pipe(new c.PassThrough)}else if(this.isBuffer()){t=e.contents?s(this.contents):this.contents}var r=new p({cwd:this.cwd,base:this.base,stat:this.stat?a(this.stat):null,history:this.history.slice(),contents:t});Object.keys(this).forEach(function(t){if(t==="_contents"||t==="stat"||t==="history"||t==="path"||t==="base"||t==="cwd"){return}r[t]=e.deep?i(this[t],true):this[t]},this);return r};p.prototype.pipe=function(e,t){if(!t)t={};if(typeof t.end==="undefined")t.end=true;if(this.isStream()){return this.contents.pipe(e,t)}if(this.isBuffer()){if(t.end){e.end(this.contents)}else{e.write(this.contents)}return e}if(t.end)e.end();return e};p.prototype.inspect=function(){var e=[];var t=this.base&&this.path?this.relative:this.path;if(t){e.push('"'+t+'"')}if(this.isBuffer()){e.push(this.contents.inspect())}if(this.isStream()){e.push(l(this.contents))}return"<File "+e.join(" ")+">"};Object.defineProperty(p.prototype,"contents",{get:function(){return this._contents},set:function(e){if(!o(e)&&!u(e)&&!f(e)){throw new Error("File.contents can only be a Buffer, a Stream, or null.")}this._contents=e}});Object.defineProperty(p.prototype,"relative",{get:function(){if(!this.base)throw new Error("No base specified! Can not get relative.");if(!this.path)throw new Error("No path specified! Can not get relative.");return n.relative(this.base,this.path)},set:function(){throw new Error("File.relative is generated from the base and path attributes. Do not modify it.")}});Object.defineProperty(p.prototype,"dirname",{get:function(){if(!this.path)throw new Error("No path specified! Can not get dirname.");return n.dirname(this.path)},set:function(e){if(!this.path)throw new Error("No path specified! Can not set dirname.");this.path=n.join(e,n.basename(this.path))}});Object.defineProperty(p.prototype,"basename",{get:function(){if(!this.path)throw new Error("No path specified! Can not get basename.");return n.basename(this.path)},set:function(e){if(!this.path)throw new Error("No path specified! Can not set basename.");this.path=n.join(n.dirname(this.path),e)}});Object.defineProperty(p.prototype,"extname",{get:function(){if(!this.path)throw new Error("No path specified! Can not get extname.");return n.extname(this.path)},set:function(e){if(!this.path)throw new Error("No path specified! Can not set extname.");this.path=h(this.path,e)}});Object.defineProperty(p.prototype,"path",{get:function(){return this.history[this.history.length-1]},set:function(e){if(typeof e!=="string")throw new Error("path should be string");if(e&&e!==this.path){this.history.push(e)}}});t.exports=p}).call(this,e("_process"))},{"./lib/cloneBuffer":333,"./lib/inspectStream":334,"./lib/isBuffer":335,"./lib/isNull":336,"./lib/isStream":337,_process:14,clone:339,"clone-stats":338,path:13,"replace-ext":340,stream:32}],333:[function(e,t,r){var n=e("buffer").Buffer;t.exports=function(e){var t=new n(e.length);e.copy(t);return t}},{buffer:4}],334:[function(e,t,r){var n=e("./isStream");t.exports=function(e){if(!n(e))return;var t=e.constructor.name;if(t==="Stream")t="";return"<"+t+"Stream>"}},{"./isStream":337}],335:[function(e,t,r){t.exports=e("buffer").Buffer.isBuffer},{buffer:4}],336:[function(e,t,r){t.exports=function(e){return e===null}},{}],337:[function(e,t,r){var n=e("stream").Stream;t.exports=function(e){return!!e&&e instanceof n}},{stream:32}],338:[function(e,t,r){var n=e("fs").Stats;t.exports=i;function i(e){var t=new n;Object.keys(e).forEach(function(r){t[r]=e[r]});return t}},{fs:1}],339:[function(e,t,r){(function(e){var r=function(){"use strict";function t(r,n,i,a){var o;if(typeof n==="object"){i=n.depth;a=n.prototype;o=n.filter;n=n.circular}var u=[];var f=[];var l=typeof e!="undefined";if(typeof n=="undefined")n=true;if(typeof i=="undefined")i=Infinity;function c(r,i){if(r===null)return null;if(i==0)return r;var o;var h;if(typeof r!="object"){return r}if(t.__isArray(r)){o=[]}else if(t.__isRegExp(r)){o=new RegExp(r.source,s(r));if(r.lastIndex)o.lastIndex=r.lastIndex}else if(t.__isDate(r)){o=new Date(r.getTime())}else if(l&&e.isBuffer(r)){o=new e(r.length);r.copy(o);return o}else{if(typeof a=="undefined"){h=Object.getPrototypeOf(r);o=Object.create(h)}else{o=Object.create(a);h=a}}if(n){var p=u.indexOf(r);if(p!=-1){return f[p]}u.push(r);f.push(o)}for(var d in r){var g;if(h){g=Object.getOwnPropertyDescriptor(h,d)}if(g&&g.set==null){continue}o[d]=c(r[d],i-1)}return o}return c(r,i)}t.clonePrototype=function o(e){if(e===null)return null;var t=function(){};t.prototype=e;return new t};function r(e){return Object.prototype.toString.call(e)}t.__objToStr=r;function n(e){return typeof e==="object"&&r(e)==="[object Date]"}t.__isDate=n;function i(e){return typeof e==="object"&&r(e)==="[object Array]"}t.__isArray=i;function a(e){return typeof e==="object"&&r(e)==="[object RegExp]"}t.__isRegExp=a;function s(e){var t="";if(e.global)t+="g";if(e.ignoreCase)t+="i";if(e.multiline)t+="m";return t}t.__getRegExpFlags=s;return t}();if(typeof t==="object"&&t.exports){t.exports=r}}).call(this,e("buffer").Buffer)},{buffer:4}],340:[function(e,t,r){var n=e("path");t.exports=function(e,t){if(typeof e!=="string")return e;if(e.length===0)return e;var r=n.basename(e,n.extname(e))+t;return n.join(n.dirname(e),r)}},{path:13}],341:[function(e,t,r){t.exports={name:"ipfs-api",version:"2.3.2",description:"A client library for the IPFS API",main:"src/index.js",dependencies:{brfs:"^1.4.0","merge-stream":"^1.0.0",multiaddr:"^1.0.0","multipart-stream":"^2.0.0",vinyl:"^0.5.1","vinyl-fs-browser":"^0.1.0","vinyl-multipart-stream":"^1.2.5"},browserify:{transform:["brfs"]},repository:{type:"git",url:"https://github.com/ipfs/node-ipfs-api"},devDependencies:{browserify:"^11.0.0","ipfsd-ctl":"^0.3.3",mocha:"^2.2.5","pre-commit":"^1.0.6",standard:"^3.3.2","uglify-js":"^2.4.24"},scripts:{test:"./node_modules/.bin/mocha",lint:"./node_modules/.bin/standard --format",build:"./node_modules/.bin/browserify -t brfs -s ipfsAPI -e ./src/index.js | tee dist/ipfsapi.js | ./node_modules/.bin/uglifyjs -m > dist/ipfsapi.min.js"},"pre-commit":["lint"],keywords:["ipfs"],author:"Matt Bell <mappum@gmail.com>",contributors:["Travis Person <travis.person@gmail.com>","Jeromy Jonson <why@ipfs.io>"],license:"MIT",bugs:{url:"https://github.com/ipfs/node-ipfs-api/issues"},homepage:"https://github.com/ipfs/node-ipfs-api"}},{}],342:[function(e,t,r){var n=e("../package.json");r=t.exports={"api-path":"/api/v0/","user-agent":"/node-"+n.name+"/"+n.version+"/",host:"localhost",port:"5001"}},{"../package.json":341}],343:[function(e,t,r){(function(n){var i=e("vinyl");var a=e("vinyl-fs-browser");var s=e("vinyl-multipart-stream");var o=e("stream");var u=e("merge-stream");r=t.exports=f;function f(e,t){if(!e)return null;if(!Array.isArray(e))e=[e];var r=new u;var n=new o.PassThrough({objectMode:true});r.add(n);for(var i=0;i<e.length;i++){var f=e[i];if(typeof f==="string"){r.add(a.src(f,{buffer:false}));if(t.r||t.recursive){r.add(a.src(f+"/**/*",{buffer:false}))}}else{n.push(l(f));
}}n.end();return r.pipe(s())}function l(e){if(e instanceof i){return e}var t={cwd:"/",base:"/",path:""};if(e.contents&&e.path){t.path=e.path;t.cwd=e.cwd||t.cwd;t.base=e.base||t.base;t.contents=e.contents}else{t.contents=e}t.contents=c(t.contents);return new i(t)}function c(e){if(n.isBuffer(e))return e;if(typeof e==="string")return e;if(e instanceof o.Stream)return e;if(typeof e.pipe==="function"){var t=new o.PassThrough;return e.pipe(t)}throw new Error("vinyl will not accept: "+e)}}).call(this,e("buffer").Buffer)},{buffer:4,"merge-stream":48,stream:32,vinyl:332,"vinyl-fs-browser":199,"vinyl-multipart-stream":313}],344:[function(e,t,r){(function(n){var i=e("multiaddr");var a=e("./config");var s=e("./request-api");r=t.exports=o;function o(e,t){var r=this;if(!(r instanceof o)){return new o(e,t)}try{var u=i(e).nodeAddress();a.host=u.address;a.port=u.port}catch(f){a.host=e;a.port=t||a.port}if(!a.host&&window&&window.location){var l=window.location.host.split(":");a.host=l[0];a.port=l[1]}function c(e){return function(t,r){if(typeof t==="function"){r=t;t={}}return s(e,null,t,null,r)}}function h(e){return function(t,r,n){if(typeof r==="function"){n=r;r={}}return s(e,t,r,null,n)}}r.send=s;r.add=function(e,t,r){if(typeof t==="function"&&r===undefined){r=t;t={}}return s("add",null,t,e,r)};r.cat=h("cat");r.ls=h("ls");r.config={get:h("config"),set:function(e,t,r,n){if(typeof r==="function"){n=r;r={}}return s("config",[e,t],r,null,n)},show:function(e){return s("config/show",null,null,null,true,e)},replace:function(e,t){return s("config/replace",null,null,e,t)}};r.update={apply:c("update"),check:c("update/check"),log:c("update/log")};r.version=c("version");r.commands=c("commands");r.mount=function(e,t,r){if(typeof e==="function"){r=e;e=null}else if(typeof t==="function"){r=t;t=null}var n={};if(e)n.f=e;if(t)n.n=t;return s("mount",null,n,null,r)};r.diag={net:c("diag/net")};r.block={get:h("block/get"),put:function(e,t){if(Array.isArray(e)){return t(null,new Error("block.put() only accepts 1 file"))}return s("block/put",null,null,e,t)}};r.object={get:h("object/get"),put:function(e,t,r){if(typeof t==="function"){return r(null,new Error("Must specify an object encoding ('json' or 'protobuf')"))}return s("object/put",t,null,e,r)},data:h("object/data"),stat:h("object/stat"),links:h("object/links")};r.swarm={peers:c("swarm/peers"),connect:h("swarm/peers")};r.ping=function(e,t){return s("ping",e,{n:1},null,function(e,r){if(e)return t(e,null);t(null,r[1])})};r.id=function(e,t){if(typeof e==="function"){t=e;e=null}return s("id",e,null,null,t)};r.pin={add:function(e,t,r){if(typeof t==="function"){r=t;t=null}s("pin/add",e,t,null,r)},remove:function(e,t,r){if(typeof t==="function"){r=t;t=null}s("pin/rm",e,t,null,r)},list:function(e,t){if(typeof e==="function"){t=e;e=null}var r=null;if(e)r={type:e};return s("pin/ls",null,r,null,t)}};r.gateway={enable:c("gateway/enable"),disable:c("gateway/disable")};r.log={tail:function(e){return s("log/tail",null,{enc:"text"},null,true,e)}};r.name={publish:h("name/publish"),resolve:h("name/resolve")};r.Buffer=n;r.refs=h("refs");r.refs.local=c("refs/local");r.dht={findprovs:h("dht/findprovs"),get:function(e,t,r){if(typeof t==="function"&&!r){r=t;t=null}return s("dht/get",e,t,null,function(e,t){if(e)return r(e);if(!t)return r(new Error("empty response"));if(t.length===0)return r(new Error("no value returned for key"));if(t[0].Type===5){r(null,t[0].Extra)}else{r(t)}})},put:function(e,t,r,n){if(typeof r==="function"&&!n){n=r;r=null}return s("dht/put",[e,t],r,null,n)}}}}).call(this,e("buffer").Buffer)},{"./config":342,"./request-api":345,buffer:4,multiaddr:63}],345:[function(e,t,r){var n=e("http");var i=e("querystring");var a=e("./get-files-stream");var s=e("./config");r=t.exports=o;function o(e,t,r,o,u,f){var l,c,h;h="application/json";if(Array.isArray(e))e=e.join("/");r=r||{};if(t&&!Array.isArray(t))t=[t];if(t)r.arg=t;r["stream-channels"]=true;l=i.stringify(r);if(o){c=a(o,r);if(!c.boundary){throw new Error("no boundary in multipart stream")}h="multipart/form-data; boundary="+c.boundary}if(typeof u==="function"){f=u;u=false}var p={method:o?"POST":"GET",host:s.host,port:s.port,path:s["api-path"]+e+"?"+l,headers:{"User-Agent":s["user-agent"],"Content-Type":h},withCredentials:false};var d=n.request(p,function(e){var t="";var r=[];var n=!!e.headers&&!!e.headers["x-stream-output"];var i=!!e.headers&&!!e.headers["x-chunked-output"];if(n&&!u)return f(null,e);if(i&&u)return f(null,e);e.on("data",function(e){if(!i){t+=e;return t}try{var n=JSON.parse(e.toString());r.push(n)}catch(a){i=false;t+=e}});e.on("end",function(){var n;if(!i){try{n=JSON.parse(t);t=n}catch(a){}}else{t=r}if(e.statusCode>=400||!e.statusCode){if(!t)t=new Error;return f(t,null)}return f(null,t)});e.on("error",function(e){return f(e,null)})});d.on("error",function(e){return f(e,null)});if(c){c.pipe(d)}else{d.end()}return d}},{"./config":342,"./get-files-stream":343,http:33,querystring:18}]},{},[344])(344)});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});