import "/error/node:fs?from=em-fceux";
;
import "/error/node:crypto?from=em-fceux";
;
import "/error/node:node:fs?from=em-fceux";
;
import "/error/node:node:crypto?from=em-fceux";
;
var __filename = "/tmp/cdn/_7Mfj2rMEWSeLYzrL53L2/node_modules/em-fceux/dist";
var __dirname = "/tmp/cdn/_7Mfj2rMEWSeLYzrL53L2/node_modules/em-fceux/dist";
var global$1 = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};
var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
var inited = false;
function init() {
  inited = true;
  var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }
  revLookup["-".charCodeAt(0)] = 62;
  revLookup["_".charCodeAt(0)] = 63;
}
function toByteArray(b64) {
  if (!inited) {
    init();
  }
  var i, j, l, tmp, placeHolders, arr;
  var len = b64.length;
  if (len % 4 > 0) {
    throw new Error("Invalid string. Length must be a multiple of 4");
  }
  placeHolders = b64[len - 2] === "=" ? 2 : b64[len - 1] === "=" ? 1 : 0;
  arr = new Arr(len * 3 / 4 - placeHolders);
  l = placeHolders > 0 ? len - 4 : len;
  var L = 0;
  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr[L++] = tmp >> 16 & 255;
    arr[L++] = tmp >> 8 & 255;
    arr[L++] = tmp & 255;
  }
  if (placeHolders === 2) {
    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr[L++] = tmp & 255;
  } else if (placeHolders === 1) {
    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr[L++] = tmp >> 8 & 255;
    arr[L++] = tmp & 255;
  }
  return arr;
}
function tripletToBase64(num) {
  return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
}
function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
    output.push(tripletToBase64(tmp));
  }
  return output.join("");
}
function fromByteArray(uint8) {
  if (!inited) {
    init();
  }
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3;
  var output = "";
  var parts = [];
  var maxChunkLength = 16383;
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
  }
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    output += lookup[tmp >> 2];
    output += lookup[tmp << 4 & 63];
    output += "==";
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    output += lookup[tmp >> 10];
    output += lookup[tmp >> 4 & 63];
    output += lookup[tmp << 2 & 63];
    output += "=";
  }
  parts.push(output);
  return parts.join("");
}
function read(buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];
  i += d;
  e = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
  }
  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
  }
  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
}
function write(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  value = Math.abs(value);
  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }
    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }
  for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
  }
  e = e << mLen | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
  }
  buffer[offset + i - d] |= s * 128;
}
var toString = {}.toString;
var isArray = Array.isArray || function(arr) {
  return toString.call(arr) == "[object Array]";
};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
var INSPECT_MAX_BYTES = 50;
Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== void 0 ? global$1.TYPED_ARRAY_SUPPORT : true;
function kMaxLength() {
  return Buffer.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
}
function createBuffer(that, length) {
  if (kMaxLength() < length) {
    throw new RangeError("Invalid typed array length");
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    that = new Uint8Array(length);
    that.__proto__ = Buffer.prototype;
  } else {
    if (that === null) {
      that = new Buffer(length);
    }
    that.length = length;
  }
  return that;
}
function Buffer(arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length);
  }
  if (typeof arg === "number") {
    if (typeof encodingOrOffset === "string") {
      throw new Error("If encoding is specified then the first argument must be a string");
    }
    return allocUnsafe(this, arg);
  }
  return from(this, arg, encodingOrOffset, length);
}
Buffer.poolSize = 8192;
Buffer._augment = function(arr) {
  arr.__proto__ = Buffer.prototype;
  return arr;
};
function from(that, value, encodingOrOffset, length) {
  if (typeof value === "number") {
    throw new TypeError('"value" argument must not be a number');
  }
  if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length);
  }
  if (typeof value === "string") {
    return fromString(that, value, encodingOrOffset);
  }
  return fromObject(that, value);
}
Buffer.from = function(value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length);
};
if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype;
  Buffer.__proto__ = Uint8Array;
}
function assertSize(size) {
  if (typeof size !== "number") {
    throw new TypeError('"size" argument must be a number');
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative');
  }
}
function alloc(that, size, fill2, encoding) {
  assertSize(size);
  if (size <= 0) {
    return createBuffer(that, size);
  }
  if (fill2 !== void 0) {
    return typeof encoding === "string" ? createBuffer(that, size).fill(fill2, encoding) : createBuffer(that, size).fill(fill2);
  }
  return createBuffer(that, size);
}
Buffer.alloc = function(size, fill2, encoding) {
  return alloc(null, size, fill2, encoding);
};
function allocUnsafe(that, size) {
  assertSize(size);
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0;
    }
  }
  return that;
}
Buffer.allocUnsafe = function(size) {
  return allocUnsafe(null, size);
};
Buffer.allocUnsafeSlow = function(size) {
  return allocUnsafe(null, size);
};
function fromString(that, string, encoding) {
  if (typeof encoding !== "string" || encoding === "") {
    encoding = "utf8";
  }
  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding');
  }
  var length = byteLength(string, encoding) | 0;
  that = createBuffer(that, length);
  var actual = that.write(string, encoding);
  if (actual !== length) {
    that = that.slice(0, actual);
  }
  return that;
}
function fromArrayLike(that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  that = createBuffer(that, length);
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that;
}
function fromArrayBuffer(that, array, byteOffset, length) {
  array.byteLength;
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError("'offset' is out of bounds");
  }
  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError("'length' is out of bounds");
  }
  if (byteOffset === void 0 && length === void 0) {
    array = new Uint8Array(array);
  } else if (length === void 0) {
    array = new Uint8Array(array, byteOffset);
  } else {
    array = new Uint8Array(array, byteOffset, length);
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    that = array;
    that.__proto__ = Buffer.prototype;
  } else {
    that = fromArrayLike(that, array);
  }
  return that;
}
function fromObject(that, obj) {
  if (internalIsBuffer(obj)) {
    var len = checked(obj.length) | 0;
    that = createBuffer(that, len);
    if (that.length === 0) {
      return that;
    }
    obj.copy(that, 0, 0, len);
    return that;
  }
  if (obj) {
    if (typeof ArrayBuffer !== "undefined" && obj.buffer instanceof ArrayBuffer || "length" in obj) {
      if (typeof obj.length !== "number" || isnan(obj.length)) {
        return createBuffer(that, 0);
      }
      return fromArrayLike(that, obj);
    }
    if (obj.type === "Buffer" && isArray(obj.data)) {
      return fromArrayLike(that, obj.data);
    }
  }
  throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
}
function checked(length) {
  if (length >= kMaxLength()) {
    throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength().toString(16) + " bytes");
  }
  return length | 0;
}
Buffer.isBuffer = isBuffer;
function internalIsBuffer(b) {
  return !!(b != null && b._isBuffer);
}
Buffer.compare = function compare(a, b) {
  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
    throw new TypeError("Arguments must be Buffers");
  }
  if (a === b)
    return 0;
  var x = a.length;
  var y = b.length;
  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }
  if (x < y)
    return -1;
  if (y < x)
    return 1;
  return 0;
};
Buffer.isEncoding = function isEncoding(encoding) {
  switch (String(encoding).toLowerCase()) {
    case "hex":
    case "utf8":
    case "utf-8":
    case "ascii":
    case "latin1":
    case "binary":
    case "base64":
    case "ucs2":
    case "ucs-2":
    case "utf16le":
    case "utf-16le":
      return true;
    default:
      return false;
  }
};
Buffer.concat = function concat(list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers');
  }
  if (list.length === 0) {
    return Buffer.alloc(0);
  }
  var i;
  if (length === void 0) {
    length = 0;
    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }
  var buffer = Buffer.allocUnsafe(length);
  var pos = 0;
  for (i = 0; i < list.length; ++i) {
    var buf = list[i];
    if (!internalIsBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    }
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};
function byteLength(string, encoding) {
  if (internalIsBuffer(string)) {
    return string.length;
  }
  if (typeof ArrayBuffer !== "undefined" && typeof ArrayBuffer.isView === "function" && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength;
  }
  if (typeof string !== "string") {
    string = "" + string;
  }
  var len = string.length;
  if (len === 0)
    return 0;
  var loweredCase = false;
  for (; ; ) {
    switch (encoding) {
      case "ascii":
      case "latin1":
      case "binary":
        return len;
      case "utf8":
      case "utf-8":
      case void 0:
        return utf8ToBytes(string).length;
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return len * 2;
      case "hex":
        return len >>> 1;
      case "base64":
        return base64ToBytes(string).length;
      default:
        if (loweredCase)
          return utf8ToBytes(string).length;
        encoding = ("" + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer.byteLength = byteLength;
function slowToString(encoding, start, end) {
  var loweredCase = false;
  if (start === void 0 || start < 0) {
    start = 0;
  }
  if (start > this.length) {
    return "";
  }
  if (end === void 0 || end > this.length) {
    end = this.length;
  }
  if (end <= 0) {
    return "";
  }
  end >>>= 0;
  start >>>= 0;
  if (end <= start) {
    return "";
  }
  if (!encoding)
    encoding = "utf8";
  while (true) {
    switch (encoding) {
      case "hex":
        return hexSlice(this, start, end);
      case "utf8":
      case "utf-8":
        return utf8Slice(this, start, end);
      case "ascii":
        return asciiSlice(this, start, end);
      case "latin1":
      case "binary":
        return latin1Slice(this, start, end);
      case "base64":
        return base64Slice(this, start, end);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return utf16leSlice(this, start, end);
      default:
        if (loweredCase)
          throw new TypeError("Unknown encoding: " + encoding);
        encoding = (encoding + "").toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer.prototype._isBuffer = true;
function swap(b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}
Buffer.prototype.swap16 = function swap16() {
  var len = this.length;
  if (len % 2 !== 0) {
    throw new RangeError("Buffer size must be a multiple of 16-bits");
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }
  return this;
};
Buffer.prototype.swap32 = function swap32() {
  var len = this.length;
  if (len % 4 !== 0) {
    throw new RangeError("Buffer size must be a multiple of 32-bits");
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }
  return this;
};
Buffer.prototype.swap64 = function swap64() {
  var len = this.length;
  if (len % 8 !== 0) {
    throw new RangeError("Buffer size must be a multiple of 64-bits");
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }
  return this;
};
Buffer.prototype.toString = function toString2() {
  var length = this.length | 0;
  if (length === 0)
    return "";
  if (arguments.length === 0)
    return utf8Slice(this, 0, length);
  return slowToString.apply(this, arguments);
};
Buffer.prototype.equals = function equals(b) {
  if (!internalIsBuffer(b))
    throw new TypeError("Argument must be a Buffer");
  if (this === b)
    return true;
  return Buffer.compare(this, b) === 0;
};
Buffer.prototype.inspect = function inspect() {
  var str = "";
  var max = INSPECT_MAX_BYTES;
  if (this.length > 0) {
    str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
    if (this.length > max)
      str += " ... ";
  }
  return "<Buffer " + str + ">";
};
Buffer.prototype.compare = function compare2(target, start, end, thisStart, thisEnd) {
  if (!internalIsBuffer(target)) {
    throw new TypeError("Argument must be a Buffer");
  }
  if (start === void 0) {
    start = 0;
  }
  if (end === void 0) {
    end = target ? target.length : 0;
  }
  if (thisStart === void 0) {
    thisStart = 0;
  }
  if (thisEnd === void 0) {
    thisEnd = this.length;
  }
  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError("out of range index");
  }
  if (thisStart >= thisEnd && start >= end) {
    return 0;
  }
  if (thisStart >= thisEnd) {
    return -1;
  }
  if (start >= end) {
    return 1;
  }
  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;
  if (this === target)
    return 0;
  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);
  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);
  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break;
    }
  }
  if (x < y)
    return -1;
  if (y < x)
    return 1;
  return 0;
};
function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
  if (buffer.length === 0)
    return -1;
  if (typeof byteOffset === "string") {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 2147483647) {
    byteOffset = 2147483647;
  } else if (byteOffset < -2147483648) {
    byteOffset = -2147483648;
  }
  byteOffset = +byteOffset;
  if (isNaN(byteOffset)) {
    byteOffset = dir ? 0 : buffer.length - 1;
  }
  if (byteOffset < 0)
    byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir)
      return -1;
    else
      byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir)
      byteOffset = 0;
    else
      return -1;
  }
  if (typeof val === "string") {
    val = Buffer.from(val, encoding);
  }
  if (internalIsBuffer(val)) {
    if (val.length === 0) {
      return -1;
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
  } else if (typeof val === "number") {
    val = val & 255;
    if (Buffer.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === "function") {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
  }
  throw new TypeError("val must be string, number or Buffer");
}
function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;
  if (encoding !== void 0) {
    encoding = String(encoding).toLowerCase();
    if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
      if (arr.length < 2 || val.length < 2) {
        return -1;
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }
  function read2(buf, i2) {
    if (indexSize === 1) {
      return buf[i2];
    } else {
      return buf.readUInt16BE(i2 * indexSize);
    }
  }
  var i;
  if (dir) {
    var foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read2(arr, i) === read2(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1)
          foundIndex = i;
        if (i - foundIndex + 1 === valLength)
          return foundIndex * indexSize;
      } else {
        if (foundIndex !== -1)
          i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength)
      byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      var found = true;
      for (var j = 0; j < valLength; j++) {
        if (read2(arr, i + j) !== read2(val, j)) {
          found = false;
          break;
        }
      }
      if (found)
        return i;
    }
  }
  return -1;
}
Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1;
};
Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};
Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};
function hexWrite(buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }
  var strLen = string.length;
  if (strLen % 2 !== 0)
    throw new TypeError("Invalid hex string");
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed))
      return i;
    buf[offset + i] = parsed;
  }
  return i;
}
function utf8Write(buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}
function asciiWrite(buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length);
}
function latin1Write(buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length);
}
function base64Write(buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length);
}
function ucs2Write(buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
}
Buffer.prototype.write = function write2(string, offset, length, encoding) {
  if (offset === void 0) {
    encoding = "utf8";
    length = this.length;
    offset = 0;
  } else if (length === void 0 && typeof offset === "string") {
    encoding = offset;
    length = this.length;
    offset = 0;
  } else if (isFinite(offset)) {
    offset = offset | 0;
    if (isFinite(length)) {
      length = length | 0;
      if (encoding === void 0)
        encoding = "utf8";
    } else {
      encoding = length;
      length = void 0;
    }
  } else {
    throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
  }
  var remaining = this.length - offset;
  if (length === void 0 || length > remaining)
    length = remaining;
  if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
    throw new RangeError("Attempt to write outside buffer bounds");
  }
  if (!encoding)
    encoding = "utf8";
  var loweredCase = false;
  for (; ; ) {
    switch (encoding) {
      case "hex":
        return hexWrite(this, string, offset, length);
      case "utf8":
      case "utf-8":
        return utf8Write(this, string, offset, length);
      case "ascii":
        return asciiWrite(this, string, offset, length);
      case "latin1":
      case "binary":
        return latin1Write(this, string, offset, length);
      case "base64":
        return base64Write(this, string, offset, length);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return ucs2Write(this, string, offset, length);
      default:
        if (loweredCase)
          throw new TypeError("Unknown encoding: " + encoding);
        encoding = ("" + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};
Buffer.prototype.toJSON = function toJSON() {
  return {
    type: "Buffer",
    data: Array.prototype.slice.call(this._arr || this, 0)
  };
};
function base64Slice(buf, start, end) {
  if (start === 0 && end === buf.length) {
    return fromByteArray(buf);
  } else {
    return fromByteArray(buf.slice(start, end));
  }
}
function utf8Slice(buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];
  var i = start;
  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;
      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 128) {
            codePoint = firstByte;
          }
          break;
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 192) === 128) {
            tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
            if (tempCodePoint > 127) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
            tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
            if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
            tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
            if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
              codePoint = tempCodePoint;
            }
          }
      }
    }
    if (codePoint === null) {
      codePoint = 65533;
      bytesPerSequence = 1;
    } else if (codePoint > 65535) {
      codePoint -= 65536;
      res.push(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    res.push(codePoint);
    i += bytesPerSequence;
  }
  return decodeCodePointsArray(res);
}
var MAX_ARGUMENTS_LENGTH = 4096;
function decodeCodePointsArray(codePoints) {
  var len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints);
  }
  var res = "";
  var i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
  }
  return res;
}
function asciiSlice(buf, start, end) {
  var ret = "";
  end = Math.min(buf.length, end);
  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 127);
  }
  return ret;
}
function latin1Slice(buf, start, end) {
  var ret = "";
  end = Math.min(buf.length, end);
  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret;
}
function hexSlice(buf, start, end) {
  var len = buf.length;
  if (!start || start < 0)
    start = 0;
  if (!end || end < 0 || end > len)
    end = len;
  var out = "";
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }
  return out;
}
function utf16leSlice(buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = "";
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res;
}
Buffer.prototype.slice = function slice(start, end) {
  var len = this.length;
  start = ~~start;
  end = end === void 0 ? len : ~~end;
  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0;
  } else if (start > len) {
    start = len;
  }
  if (end < 0) {
    end += len;
    if (end < 0)
      end = 0;
  } else if (end > len) {
    end = len;
  }
  if (end < start)
    end = start;
  var newBuf;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer.prototype;
  } else {
    var sliceLen = end - start;
    newBuf = new Buffer(sliceLen, void 0);
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start];
    }
  }
  return newBuf;
};
function checkOffset(offset, ext, length) {
  if (offset % 1 !== 0 || offset < 0)
    throw new RangeError("offset is not uint");
  if (offset + ext > length)
    throw new RangeError("Trying to access beyond buffer length");
}
Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
  offset = offset | 0;
  byteLength2 = byteLength2 | 0;
  if (!noAssert)
    checkOffset(offset, byteLength2, this.length);
  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength2 && (mul *= 256)) {
    val += this[offset + i] * mul;
  }
  return val;
};
Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
  offset = offset | 0;
  byteLength2 = byteLength2 | 0;
  if (!noAssert) {
    checkOffset(offset, byteLength2, this.length);
  }
  var val = this[offset + --byteLength2];
  var mul = 1;
  while (byteLength2 > 0 && (mul *= 256)) {
    val += this[offset + --byteLength2] * mul;
  }
  return val;
};
Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length);
  return this[offset];
};
Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length);
  return this[offset] | this[offset + 1] << 8;
};
Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length);
  return this[offset] << 8 | this[offset + 1];
};
Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length);
  return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
};
Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length);
  return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
};
Buffer.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
  offset = offset | 0;
  byteLength2 = byteLength2 | 0;
  if (!noAssert)
    checkOffset(offset, byteLength2, this.length);
  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength2 && (mul *= 256)) {
    val += this[offset + i] * mul;
  }
  mul *= 128;
  if (val >= mul)
    val -= Math.pow(2, 8 * byteLength2);
  return val;
};
Buffer.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
  offset = offset | 0;
  byteLength2 = byteLength2 | 0;
  if (!noAssert)
    checkOffset(offset, byteLength2, this.length);
  var i = byteLength2;
  var mul = 1;
  var val = this[offset + --i];
  while (i > 0 && (mul *= 256)) {
    val += this[offset + --i] * mul;
  }
  mul *= 128;
  if (val >= mul)
    val -= Math.pow(2, 8 * byteLength2);
  return val;
};
Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length);
  if (!(this[offset] & 128))
    return this[offset];
  return (255 - this[offset] + 1) * -1;
};
Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length);
  var val = this[offset] | this[offset + 1] << 8;
  return val & 32768 ? val | 4294901760 : val;
};
Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | this[offset] << 8;
  return val & 32768 ? val | 4294901760 : val;
};
Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length);
  return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
};
Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length);
  return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
};
Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length);
  return read(this, offset, true, 23, 4);
};
Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length);
  return read(this, offset, false, 23, 4);
};
Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length);
  return read(this, offset, true, 52, 8);
};
Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length);
  return read(this, offset, false, 52, 8);
};
function checkInt(buf, value, offset, ext, max, min) {
  if (!internalIsBuffer(buf))
    throw new TypeError('"buffer" argument must be a Buffer instance');
  if (value > max || value < min)
    throw new RangeError('"value" argument is out of bounds');
  if (offset + ext > buf.length)
    throw new RangeError("Index out of range");
}
Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength2 = byteLength2 | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
    checkInt(this, value, offset, byteLength2, maxBytes, 0);
  }
  var mul = 1;
  var i = 0;
  this[offset] = value & 255;
  while (++i < byteLength2 && (mul *= 256)) {
    this[offset + i] = value / mul & 255;
  }
  return offset + byteLength2;
};
Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength2 = byteLength2 | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
    checkInt(this, value, offset, byteLength2, maxBytes, 0);
  }
  var i = byteLength2 - 1;
  var mul = 1;
  this[offset + i] = value & 255;
  while (--i >= 0 && (mul *= 256)) {
    this[offset + i] = value / mul & 255;
  }
  return offset + byteLength2;
};
Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 1, 255, 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT)
    value = Math.floor(value);
  this[offset] = value & 255;
  return offset + 1;
};
function objectWriteUInt16(buf, value, offset, littleEndian) {
  if (value < 0)
    value = 65535 + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8;
  }
}
Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 2, 65535, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2;
};
Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 2, 65535, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 8;
    this[offset + 1] = value & 255;
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2;
};
function objectWriteUInt32(buf, value, offset, littleEndian) {
  if (value < 0)
    value = 4294967295 + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 255;
  }
}
Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 4, 4294967295, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 255;
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4;
};
Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 4, 4294967295, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 255;
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4;
};
Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength2 - 1);
    checkInt(this, value, offset, byteLength2, limit - 1, -limit);
  }
  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 255;
  while (++i < byteLength2 && (mul *= 256)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = (value / mul >> 0) - sub & 255;
  }
  return offset + byteLength2;
};
Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength2 - 1);
    checkInt(this, value, offset, byteLength2, limit - 1, -limit);
  }
  var i = byteLength2 - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 255;
  while (--i >= 0 && (mul *= 256)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = (value / mul >> 0) - sub & 255;
  }
  return offset + byteLength2;
};
Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 1, 127, -128);
  if (!Buffer.TYPED_ARRAY_SUPPORT)
    value = Math.floor(value);
  if (value < 0)
    value = 255 + value + 1;
  this[offset] = value & 255;
  return offset + 1;
};
Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 2, 32767, -32768);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2;
};
Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 2, 32767, -32768);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 8;
    this[offset + 1] = value & 255;
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2;
};
Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 4, 2147483647, -2147483648);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4;
};
Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert)
    checkInt(this, value, offset, 4, 2147483647, -2147483648);
  if (value < 0)
    value = 4294967295 + value + 1;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 255;
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4;
};
function checkIEEE754(buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length)
    throw new RangeError("Index out of range");
  if (offset < 0)
    throw new RangeError("Index out of range");
}
function writeFloat(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4);
  }
  write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4;
}
Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert);
};
Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert);
};
function writeDouble(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8);
  }
  write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8;
}
Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert);
};
Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert);
};
Buffer.prototype.copy = function copy(target, targetStart, start, end) {
  if (!start)
    start = 0;
  if (!end && end !== 0)
    end = this.length;
  if (targetStart >= target.length)
    targetStart = target.length;
  if (!targetStart)
    targetStart = 0;
  if (end > 0 && end < start)
    end = start;
  if (end === start)
    return 0;
  if (target.length === 0 || this.length === 0)
    return 0;
  if (targetStart < 0) {
    throw new RangeError("targetStart out of bounds");
  }
  if (start < 0 || start >= this.length)
    throw new RangeError("sourceStart out of bounds");
  if (end < 0)
    throw new RangeError("sourceEnd out of bounds");
  if (end > this.length)
    end = this.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }
  var len = end - start;
  var i;
  if (this === target && start < targetStart && targetStart < end) {
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start];
    }
  } else if (len < 1e3 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
  }
  return len;
};
Buffer.prototype.fill = function fill(val, start, end, encoding) {
  if (typeof val === "string") {
    if (typeof start === "string") {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === "string") {
      encoding = end;
      end = this.length;
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0);
      if (code < 256) {
        val = code;
      }
    }
    if (encoding !== void 0 && typeof encoding !== "string") {
      throw new TypeError("encoding must be a string");
    }
    if (typeof encoding === "string" && !Buffer.isEncoding(encoding)) {
      throw new TypeError("Unknown encoding: " + encoding);
    }
  } else if (typeof val === "number") {
    val = val & 255;
  }
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError("Out of range index");
  }
  if (end <= start) {
    return this;
  }
  start = start >>> 0;
  end = end === void 0 ? this.length : end >>> 0;
  if (!val)
    val = 0;
  var i;
  if (typeof val === "number") {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = internalIsBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString());
    var len = bytes.length;
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }
  return this;
};
var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
function base64clean(str) {
  str = stringtrim(str).replace(INVALID_BASE64_RE, "");
  if (str.length < 2)
    return "";
  while (str.length % 4 !== 0) {
    str = str + "=";
  }
  return str;
}
function stringtrim(str) {
  if (str.trim)
    return str.trim();
  return str.replace(/^\s+|\s+$/g, "");
}
function toHex(n) {
  if (n < 16)
    return "0" + n.toString(16);
  return n.toString(16);
}
function utf8ToBytes(string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];
  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);
    if (codePoint > 55295 && codePoint < 57344) {
      if (!leadSurrogate) {
        if (codePoint > 56319) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          continue;
        } else if (i + 1 === length) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          continue;
        }
        leadSurrogate = codePoint;
        continue;
      }
      if (codePoint < 56320) {
        if ((units -= 3) > -1)
          bytes.push(239, 191, 189);
        leadSurrogate = codePoint;
        continue;
      }
      codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
    } else if (leadSurrogate) {
      if ((units -= 3) > -1)
        bytes.push(239, 191, 189);
    }
    leadSurrogate = null;
    if (codePoint < 128) {
      if ((units -= 1) < 0)
        break;
      bytes.push(codePoint);
    } else if (codePoint < 2048) {
      if ((units -= 2) < 0)
        break;
      bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
    } else if (codePoint < 65536) {
      if ((units -= 3) < 0)
        break;
      bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
    } else if (codePoint < 1114112) {
      if ((units -= 4) < 0)
        break;
      bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
    } else {
      throw new Error("Invalid code point");
    }
  }
  return bytes;
}
function asciiToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    byteArray.push(str.charCodeAt(i) & 255);
  }
  return byteArray;
}
function utf16leToBytes(str, units) {
  var c, hi, lo;
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0)
      break;
    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }
  return byteArray;
}
function base64ToBytes(str) {
  return toByteArray(base64clean(str));
}
function blitBuffer(src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if (i + offset >= dst.length || i >= src.length)
      break;
    dst[i + offset] = src[i];
  }
  return i;
}
function isnan(val) {
  return val !== val;
}
function isBuffer(obj) {
  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj));
}
function isFastBuffer(obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
}
function isSlowBuffer(obj) {
  return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isFastBuffer(obj.slice(0, 0));
}
function defaultSetTimout() {
  throw new Error("setTimeout has not been defined");
}
function defaultClearTimeout() {
  throw new Error("clearTimeout has not been defined");
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
var globalContext;
if (typeof window !== "undefined") {
  globalContext = window;
} else if (typeof self !== "undefined") {
  globalContext = self;
} else {
  globalContext = {};
}
if (typeof globalContext.setTimeout === "function") {
  cachedSetTimeout = setTimeout;
}
if (typeof globalContext.clearTimeout === "function") {
  cachedClearTimeout = clearTimeout;
}
function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    return setTimeout(fun, 0);
  }
  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }
  try {
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e2) {
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}
function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    return clearTimeout(marker);
  }
  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }
  try {
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      return cachedClearTimeout.call(null, marker);
    } catch (e2) {
      return cachedClearTimeout.call(this, marker);
    }
  }
}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;
function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }
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
  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;
  while (len) {
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
  runClearTimeout(timeout);
}
function nextTick(fun) {
  var args = new Array(arguments.length - 1);
  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }
  queue.push(new Item(fun, args));
  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}
function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}
Item.prototype.run = function() {
  this.fun.apply(null, this.array);
};
var title = "browser";
var platform = "browser";
var browser = true;
var argv = [];
var version = "";
var versions = {};
var release = {};
var config = {};
function noop() {
}
var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit = noop;
function binding(name) {
  throw new Error("process.binding is not supported");
}
function cwd() {
  return "/";
}
function chdir(dir) {
  throw new Error("process.chdir is not supported");
}
function umask() {
  return 0;
}
var performance$1 = globalContext.performance || {};
var performanceNow = performance$1.now || performance$1.mozNow || performance$1.msNow || performance$1.oNow || performance$1.webkitNow || function() {
  return new Date().getTime();
};
function hrtime(previousTimestamp) {
  var clocktime = performanceNow.call(performance$1) * 1e-3;
  var seconds = Math.floor(clocktime);
  var nanoseconds = Math.floor(clocktime % 1 * 1e9);
  if (previousTimestamp) {
    seconds = seconds - previousTimestamp[0];
    nanoseconds = nanoseconds - previousTimestamp[1];
    if (nanoseconds < 0) {
      seconds--;
      nanoseconds += 1e9;
    }
  }
  return [seconds, nanoseconds];
}
var startTime = new Date();
function uptime() {
  var currentTime = new Date();
  var dif = currentTime - startTime;
  return dif / 1e3;
}
var process = {
  nextTick,
  title,
  browser,
  env: {NODE_ENV: "production"},
  argv,
  version,
  versions,
  on,
  addListener,
  once,
  off,
  removeListener,
  removeAllListeners,
  emit,
  binding,
  cwd,
  chdir,
  umask,
  hrtime,
  platform,
  release,
  config,
  uptime
};
function createCommonjsModule(fn, basedir, module) {
  return module = {
    path: basedir,
    exports: {},
    require: function(path2, base) {
      return commonjsRequire(path2, base === void 0 || base === null ? module.path : base);
    }
  }, fn(module, module.exports), module.exports;
}
function commonjsRequire() {
  throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
function normalizeArray(parts, allowAboveRoot) {
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === ".") {
      parts.splice(i, 1);
    } else if (last === "..") {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift("..");
    }
  }
  return parts;
}
var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};
function resolve() {
  var resolvedPath = "", resolvedAbsolute = false;
  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path2 = i >= 0 ? arguments[i] : "/";
    if (typeof path2 !== "string") {
      throw new TypeError("Arguments to path.resolve must be strings");
    } else if (!path2) {
      continue;
    }
    resolvedPath = path2 + "/" + resolvedPath;
    resolvedAbsolute = path2.charAt(0) === "/";
  }
  resolvedPath = normalizeArray(filter(resolvedPath.split("/"), function(p) {
    return !!p;
  }), !resolvedAbsolute).join("/");
  return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
}
function normalize(path2) {
  var isPathAbsolute = isAbsolute(path2), trailingSlash = substr(path2, -1) === "/";
  path2 = normalizeArray(filter(path2.split("/"), function(p) {
    return !!p;
  }), !isPathAbsolute).join("/");
  if (!path2 && !isPathAbsolute) {
    path2 = ".";
  }
  if (path2 && trailingSlash) {
    path2 += "/";
  }
  return (isPathAbsolute ? "/" : "") + path2;
}
function isAbsolute(path2) {
  return path2.charAt(0) === "/";
}
function join() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return normalize(filter(paths, function(p, index) {
    if (typeof p !== "string") {
      throw new TypeError("Arguments to path.join must be strings");
    }
    return p;
  }).join("/"));
}
function relative(from2, to) {
  from2 = resolve(from2).substr(1);
  to = resolve(to).substr(1);
  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== "")
        break;
    }
    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== "")
        break;
    }
    if (start > end)
      return [];
    return arr.slice(start, end - start + 1);
  }
  var fromParts = trim(from2.split("/"));
  var toParts = trim(to.split("/"));
  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }
  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push("..");
  }
  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join("/");
}
var sep = "/";
var delimiter = ":";
function dirname(path2) {
  var result = splitPath(path2), root = result[0], dir = result[1];
  if (!root && !dir) {
    return ".";
  }
  if (dir) {
    dir = dir.substr(0, dir.length - 1);
  }
  return root + dir;
}
function basename(path2, ext) {
  var f = splitPath(path2)[2];
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
}
function extname(path2) {
  return splitPath(path2)[3];
}
var path = {
  extname,
  basename,
  dirname,
  sep,
  delimiter,
  relative,
  join,
  isAbsolute,
  normalize,
  resolve
};
function filter(xs, f) {
  if (xs.filter)
    return xs.filter(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (f(xs[i], i, xs))
      res.push(xs[i]);
  }
  return res;
}
var substr = "ab".substr(-1) === "b" ? function(str, start, len) {
  return str.substr(start, len);
} : function(str, start, len) {
  if (start < 0)
    start = str.length + start;
  return str.substr(start, len);
};
var path$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  resolve,
  normalize,
  isAbsolute,
  join,
  relative,
  sep,
  delimiter,
  dirname,
  basename,
  extname,
  default: path
});
var fceux = createCommonjsModule(function(module, exports) {
  var FCEUX2 = (() => {
    var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
    _scriptDir = _scriptDir || __filename;
    return function(FCEUX3) {
      FCEUX3 = FCEUX3 || {};
      var Module = typeof FCEUX3 != "undefined" ? FCEUX3 : {};
      var readyPromiseResolve, readyPromiseReject;
      Module["ready"] = new Promise(function(resolve2, reject) {
        readyPromiseResolve = resolve2;
        readyPromiseReject = reject;
      });
      if (!Module.expectedDataFileDownloads) {
        Module.expectedDataFileDownloads = 0;
      }
      Module.expectedDataFileDownloads++;
      (function() {
        if (Module["ENVIRONMENT_IS_PTHREAD"])
          return;
        var loadPackage = function(metadata) {
          function runWithFS() {
            Module["FS_createPath"]("/", "data", true, true);
            var start32 = Module["___emscripten_embedded_file_data"] >> 2;
            do {
              var name_addr = HEAPU32[start32++];
              var len = HEAPU32[start32++];
              var content = HEAPU32[start32++];
              var name = UTF8ToString(name_addr);
              Module["FS_createDataFile"](name, null, HEAP8.subarray(content, content + len), true, true, true);
            } while (HEAPU32[start32]);
          }
          if (Module["calledRun"]) {
            runWithFS();
          } else {
            if (!Module["preRun"])
              Module["preRun"] = [];
            Module["preRun"].push(runWithFS);
          }
        };
        loadPackage();
      })();
      var moduleOverrides = Object.assign({}, Module);
      var thisProgram = "./this.program";
      var quit_ = (status, toThrow) => {
        throw toThrow;
      };
      var ENVIRONMENT_IS_WEB = typeof window == "object";
      var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
      var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
      var scriptDirectory = "";
      function locateFile(path2) {
        if (Module["locateFile"]) {
          return Module["locateFile"](path2, scriptDirectory);
        }
        return scriptDirectory + path2;
      }
      var read_, readAsync, readBinary;
      function logExceptionOnExit(e) {
        if (e instanceof ExitStatus)
          return;
        let toLog = e;
        err("exiting due to exception: " + toLog);
      }
      var fs;
      var nodePath;
      var requireNodeFS;
      if (ENVIRONMENT_IS_NODE) {
        if (ENVIRONMENT_IS_WORKER) {
          scriptDirectory = path$1.dirname(scriptDirectory) + "/";
        } else {
          scriptDirectory = __dirname + "/";
        }
        requireNodeFS = () => {
          if (!nodePath) {
            fs = require$$1;
            nodePath = path$1;
          }
        };
        read_ = function shell_read(filename, binary) {
          requireNodeFS();
          filename = nodePath["normalize"](filename);
          return fs.readFileSync(filename, binary ? void 0 : "utf8");
        };
        readBinary = (filename) => {
          var ret = read_(filename, true);
          if (!ret.buffer) {
            ret = new Uint8Array(ret);
          }
          return ret;
        };
        readAsync = (filename, onload, onerror) => {
          requireNodeFS();
          filename = nodePath["normalize"](filename);
          fs.readFile(filename, function(err2, data) {
            if (err2)
              onerror(err2);
            else
              onload(data.buffer);
          });
        };
        if (process["argv"].length > 1) {
          thisProgram = process["argv"][1].replace(/\\/g, "/");
        }
        process["argv"].slice(2);
        process["on"]("uncaughtException", function(ex) {
          if (!(ex instanceof ExitStatus)) {
            throw ex;
          }
        });
        process["on"]("unhandledRejection", function(reason) {
          throw reason;
        });
        quit_ = (status, toThrow) => {
          if (keepRuntimeAlive()) {
            process["exitCode"] = status;
            throw toThrow;
          }
          logExceptionOnExit(toThrow);
          process["exit"](status);
        };
        Module["inspect"] = function() {
          return "[Emscripten Module object]";
        };
      } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
        if (ENVIRONMENT_IS_WORKER) {
          scriptDirectory = self.location.href;
        } else if (typeof document != "undefined" && document.currentScript) {
          scriptDirectory = document.currentScript.src;
        }
        if (_scriptDir) {
          scriptDirectory = _scriptDir;
        }
        if (scriptDirectory.indexOf("blob:") !== 0) {
          scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
        } else {
          scriptDirectory = "";
        }
        {
          read_ = (url) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.send(null);
            return xhr.responseText;
          };
          if (ENVIRONMENT_IS_WORKER) {
            readBinary = (url) => {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, false);
              xhr.responseType = "arraybuffer";
              xhr.send(null);
              return new Uint8Array(xhr.response);
            };
          }
          readAsync = (url, onload, onerror) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = () => {
              if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                onload(xhr.response);
                return;
              }
              onerror();
            };
            xhr.onerror = onerror;
            xhr.send(null);
          };
        }
      } else
        ;
      var out = Module["print"] || console.log.bind(console);
      var err = Module["printErr"] || console.warn.bind(console);
      Object.assign(Module, moduleOverrides);
      moduleOverrides = null;
      if (Module["arguments"])
        Module["arguments"];
      if (Module["thisProgram"])
        thisProgram = Module["thisProgram"];
      if (Module["quit"])
        quit_ = Module["quit"];
      var wasmBinary;
      if (Module["wasmBinary"])
        wasmBinary = Module["wasmBinary"];
      var noExitRuntime = Module["noExitRuntime"] || true;
      if (typeof WebAssembly != "object") {
        abort("no native wasm support detected");
      }
      var wasmMemory;
      var ABORT = false;
      function assert(condition, text) {
        if (!condition) {
          abort(text);
        }
      }
      var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : void 0;
      function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
        var endIdx = idx + maxBytesToRead;
        var endPtr = idx;
        while (heapOrArray[endPtr] && !(endPtr >= endIdx))
          ++endPtr;
        if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
          return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
        } else {
          var str = "";
          while (idx < endPtr) {
            var u0 = heapOrArray[idx++];
            if (!(u0 & 128)) {
              str += String.fromCharCode(u0);
              continue;
            }
            var u1 = heapOrArray[idx++] & 63;
            if ((u0 & 224) == 192) {
              str += String.fromCharCode((u0 & 31) << 6 | u1);
              continue;
            }
            var u2 = heapOrArray[idx++] & 63;
            if ((u0 & 240) == 224) {
              u0 = (u0 & 15) << 12 | u1 << 6 | u2;
            } else {
              u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
            }
            if (u0 < 65536) {
              str += String.fromCharCode(u0);
            } else {
              var ch = u0 - 65536;
              str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
            }
          }
        }
        return str;
      }
      function UTF8ToString(ptr, maxBytesToRead) {
        return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
      }
      function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
        if (!(maxBytesToWrite > 0))
          return 0;
        var startIdx = outIdx;
        var endIdx = outIdx + maxBytesToWrite - 1;
        for (var i2 = 0; i2 < str.length; ++i2) {
          var u = str.charCodeAt(i2);
          if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i2);
            u = 65536 + ((u & 1023) << 10) | u1 & 1023;
          }
          if (u <= 127) {
            if (outIdx >= endIdx)
              break;
            heap[outIdx++] = u;
          } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx)
              break;
            heap[outIdx++] = 192 | u >> 6;
            heap[outIdx++] = 128 | u & 63;
          } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx)
              break;
            heap[outIdx++] = 224 | u >> 12;
            heap[outIdx++] = 128 | u >> 6 & 63;
            heap[outIdx++] = 128 | u & 63;
          } else {
            if (outIdx + 3 >= endIdx)
              break;
            heap[outIdx++] = 240 | u >> 18;
            heap[outIdx++] = 128 | u >> 12 & 63;
            heap[outIdx++] = 128 | u >> 6 & 63;
            heap[outIdx++] = 128 | u & 63;
          }
        }
        heap[outIdx] = 0;
        return outIdx - startIdx;
      }
      function stringToUTF8(str, outPtr, maxBytesToWrite) {
        return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
      }
      function lengthBytesUTF8(str) {
        var len = 0;
        for (var i2 = 0; i2 < str.length; ++i2) {
          var u = str.charCodeAt(i2);
          if (u >= 55296 && u <= 57343)
            u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i2) & 1023;
          if (u <= 127)
            ++len;
          else if (u <= 2047)
            len += 2;
          else if (u <= 65535)
            len += 3;
          else
            len += 4;
        }
        return len;
      }
      var UTF16Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf-16le") : void 0;
      function UTF16ToString(ptr, maxBytesToRead) {
        var endPtr = ptr;
        var idx = endPtr >> 1;
        var maxIdx = idx + maxBytesToRead / 2;
        while (!(idx >= maxIdx) && HEAPU16[idx])
          ++idx;
        endPtr = idx << 1;
        if (endPtr - ptr > 32 && UTF16Decoder) {
          return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
        } else {
          var str = "";
          for (var i2 = 0; !(i2 >= maxBytesToRead / 2); ++i2) {
            var codeUnit = HEAP16[ptr + i2 * 2 >> 1];
            if (codeUnit == 0)
              break;
            str += String.fromCharCode(codeUnit);
          }
          return str;
        }
      }
      function stringToUTF16(str, outPtr, maxBytesToWrite) {
        if (maxBytesToWrite === void 0) {
          maxBytesToWrite = 2147483647;
        }
        if (maxBytesToWrite < 2)
          return 0;
        maxBytesToWrite -= 2;
        var startPtr = outPtr;
        var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
        for (var i2 = 0; i2 < numCharsToWrite; ++i2) {
          var codeUnit = str.charCodeAt(i2);
          HEAP16[outPtr >> 1] = codeUnit;
          outPtr += 2;
        }
        HEAP16[outPtr >> 1] = 0;
        return outPtr - startPtr;
      }
      function lengthBytesUTF16(str) {
        return str.length * 2;
      }
      function UTF32ToString(ptr, maxBytesToRead) {
        var i2 = 0;
        var str = "";
        while (!(i2 >= maxBytesToRead / 4)) {
          var utf32 = HEAP32[ptr + i2 * 4 >> 2];
          if (utf32 == 0)
            break;
          ++i2;
          if (utf32 >= 65536) {
            var ch = utf32 - 65536;
            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
          } else {
            str += String.fromCharCode(utf32);
          }
        }
        return str;
      }
      function stringToUTF32(str, outPtr, maxBytesToWrite) {
        if (maxBytesToWrite === void 0) {
          maxBytesToWrite = 2147483647;
        }
        if (maxBytesToWrite < 4)
          return 0;
        var startPtr = outPtr;
        var endPtr = startPtr + maxBytesToWrite - 4;
        for (var i2 = 0; i2 < str.length; ++i2) {
          var codeUnit = str.charCodeAt(i2);
          if (codeUnit >= 55296 && codeUnit <= 57343) {
            var trailSurrogate = str.charCodeAt(++i2);
            codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
          }
          HEAP32[outPtr >> 2] = codeUnit;
          outPtr += 4;
          if (outPtr + 4 > endPtr)
            break;
        }
        HEAP32[outPtr >> 2] = 0;
        return outPtr - startPtr;
      }
      function lengthBytesUTF32(str) {
        var len = 0;
        for (var i2 = 0; i2 < str.length; ++i2) {
          var codeUnit = str.charCodeAt(i2);
          if (codeUnit >= 55296 && codeUnit <= 57343)
            ++i2;
          len += 4;
        }
        return len;
      }
      function writeArrayToMemory(array, buffer2) {
        HEAP8.set(array, buffer2);
      }
      function writeAsciiToMemory(str, buffer2, dontAddNull) {
        for (var i2 = 0; i2 < str.length; ++i2) {
          HEAP8[buffer2++ >> 0] = str.charCodeAt(i2);
        }
        if (!dontAddNull)
          HEAP8[buffer2 >> 0] = 0;
      }
      var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
      function updateGlobalBufferAndViews(buf) {
        buffer = buf;
        Module["HEAP8"] = HEAP8 = new Int8Array(buf);
        Module["HEAP16"] = HEAP16 = new Int16Array(buf);
        Module["HEAP32"] = HEAP32 = new Int32Array(buf);
        Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
        Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
        Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
        Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
        Module["HEAPF64"] = HEAPF64 = new Float64Array(buf);
      }
      var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 16777216;
      var wasmTable;
      var __ATPRERUN__ = [];
      var __ATINIT__ = [];
      var __ATPOSTRUN__ = [];
      function keepRuntimeAlive() {
        return noExitRuntime;
      }
      function preRun() {
        if (Module["preRun"]) {
          if (typeof Module["preRun"] == "function")
            Module["preRun"] = [Module["preRun"]];
          while (Module["preRun"].length) {
            addOnPreRun(Module["preRun"].shift());
          }
        }
        callRuntimeCallbacks(__ATPRERUN__);
      }
      function initRuntime() {
        if (!Module["noFSInit"] && !FS.init.initialized)
          FS.init();
        FS.ignorePermissions = false;
        TTY.init();
        callRuntimeCallbacks(__ATINIT__);
      }
      function postRun() {
        if (Module["postRun"]) {
          if (typeof Module["postRun"] == "function")
            Module["postRun"] = [Module["postRun"]];
          while (Module["postRun"].length) {
            addOnPostRun(Module["postRun"].shift());
          }
        }
        callRuntimeCallbacks(__ATPOSTRUN__);
      }
      function addOnPreRun(cb) {
        __ATPRERUN__.unshift(cb);
      }
      function addOnInit(cb) {
        __ATINIT__.unshift(cb);
      }
      function addOnPostRun(cb) {
        __ATPOSTRUN__.unshift(cb);
      }
      var runDependencies = 0;
      var dependenciesFulfilled = null;
      function getUniqueRunDependency(id) {
        return id;
      }
      function addRunDependency(id) {
        runDependencies++;
        if (Module["monitorRunDependencies"]) {
          Module["monitorRunDependencies"](runDependencies);
        }
      }
      function removeRunDependency(id) {
        runDependencies--;
        if (Module["monitorRunDependencies"]) {
          Module["monitorRunDependencies"](runDependencies);
        }
        if (runDependencies == 0) {
          if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback();
          }
        }
      }
      function abort(what) {
        {
          if (Module["onAbort"]) {
            Module["onAbort"](what);
          }
        }
        what = "Aborted(" + what + ")";
        err(what);
        ABORT = true;
        what += ". Build with -sASSERTIONS for more info.";
        var e = new WebAssembly.RuntimeError(what);
        readyPromiseReject(e);
        throw e;
      }
      var dataURIPrefix = "data:application/octet-stream;base64,";
      function isDataURI(filename) {
        return filename.startsWith(dataURIPrefix);
      }
      function isFileURI(filename) {
        return filename.startsWith("file://");
      }
      var wasmBinaryFile;
      wasmBinaryFile = "fceux.wasm";
      if (!isDataURI(wasmBinaryFile)) {
        wasmBinaryFile = locateFile(wasmBinaryFile);
      }
      function getBinary(file) {
        try {
          if (file == wasmBinaryFile && wasmBinary) {
            return new Uint8Array(wasmBinary);
          }
          if (readBinary) {
            return readBinary(file);
          } else {
            throw "both async and sync fetching of the wasm failed";
          }
        } catch (err2) {
          abort(err2);
        }
      }
      function getBinaryPromise() {
        if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
          if (typeof fetch == "function" && !isFileURI(wasmBinaryFile)) {
            return fetch(wasmBinaryFile, {credentials: "same-origin"}).then(function(response) {
              if (!response["ok"]) {
                throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
              }
              return response["arrayBuffer"]();
            }).catch(function() {
              return getBinary(wasmBinaryFile);
            });
          } else {
            if (readAsync) {
              return new Promise(function(resolve2, reject) {
                readAsync(wasmBinaryFile, function(response) {
                  resolve2(new Uint8Array(response));
                }, reject);
              });
            }
          }
        }
        return Promise.resolve().then(function() {
          return getBinary(wasmBinaryFile);
        });
      }
      function createWasm() {
        var info = {a: asmLibraryArg};
        function receiveInstance(instance, module2) {
          var exports3 = instance.exports;
          Module["asm"] = exports3;
          wasmMemory = Module["asm"]["Ja"];
          updateGlobalBufferAndViews(wasmMemory.buffer);
          wasmTable = Module["asm"]["Ra"];
          addOnInit(Module["asm"]["Ka"]);
          removeRunDependency();
        }
        addRunDependency();
        function receiveInstantiationResult(result) {
          receiveInstance(result["instance"]);
        }
        function instantiateArrayBuffer(receiver) {
          return getBinaryPromise().then(function(binary) {
            return WebAssembly.instantiate(binary, info);
          }).then(function(instance) {
            return instance;
          }).then(receiver, function(reason) {
            err("failed to asynchronously prepare wasm: " + reason);
            abort(reason);
          });
        }
        function instantiateAsync() {
          if (!wasmBinary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(wasmBinaryFile) && !isFileURI(wasmBinaryFile) && typeof fetch == "function") {
            return fetch(wasmBinaryFile, {credentials: "same-origin"}).then(function(response) {
              var result = WebAssembly.instantiateStreaming(response, info);
              return result.then(receiveInstantiationResult, function(reason) {
                err("wasm streaming compile failed: " + reason);
                err("falling back to ArrayBuffer instantiation");
                return instantiateArrayBuffer(receiveInstantiationResult);
              });
            });
          } else {
            return instantiateArrayBuffer(receiveInstantiationResult);
          }
        }
        if (Module["instantiateWasm"]) {
          try {
            var exports2 = Module["instantiateWasm"](info, receiveInstance);
            return exports2;
          } catch (e) {
            err("Module.instantiateWasm callback failed with error: " + e);
            return false;
          }
        }
        instantiateAsync().catch(readyPromiseReject);
        return {};
      }
      var tempDouble;
      var tempI64;
      var ASM_CONSTS = {138912: () => {
        return !Module.hasOwnProperty("_audioContext");
      }, 138964: ($0, $1, $2) => {
        const s_buffer = $0;
        const s_buffer_read = $1;
        let available = $2;
        const channelData = Module.currentOutputBuffer.getChannelData(0);
        let m = 8192 - s_buffer_read;
        if (m > available) {
          m = available;
        }
        let samples = 2048 - available + 1;
        available = available - m;
        if (m > 0) {
          const j = s_buffer + s_buffer_read;
          channelData.set(HEAPF32.subarray(j, j + m));
        }
        if (available > 0) {
          channelData.set(HEAPF32.subarray(s_buffer, s_buffer + available), m);
        }
        m += available - 1;
        while (--samples) {
          channelData[++m] = 0;
        }
      }, 139485: () => {
        const channelData = Module.currentOutputBuffer.getChannelData(0);
        for (let i2 = 2048 - 1; i2 >= 0; --i2) {
          channelData[i2] = 0;
        }
      }, 139615: ($0) => {
        const context = Module._audioContext;
        const source = context.createBufferSource();
        const processor = context.createScriptProcessor($0, 0, 1);
        Module.scriptProcessorNode = processor;
        source.connect(processor);
        processor.onaudioprocess = function(ev) {
          Module.currentOutputBuffer = ev.outputBuffer;
          Module._audioBufferCallback();
        };
        processor.connect(context.destination);
        return context.sampleRate;
      }, 140017: () => {
        for (let key in Module._defaultConfig) {
          Module.setConfig(key, Module._defaultConfig[key]);
        }
        if (typeof AudioContext !== "undefined") {
          Module._audioContext = new AudioContext();
        } else if (typeof webkitAudioContext !== "undefined") {
          Module._audioContext = new webkitAudioContext();
        }
        if (Module._audioContext) {
          Module._audioContext.resume();
          return true;
        } else {
          console.error("Web Audio API unavailable.");
          return false;
        }
      }, 140450: () => {
        const dir = "/tmp/sav";
        FS.mkdir(dir);
        FS.mount(MEMFS, {}, dir);
      }, 140519: () => {
        Module.deleteSaveFiles();
      }, 140549: ($0, $1) => {
        const name = UTF8ToString($0);
        if (Module.eventListeners.hasOwnProperty(name)) {
          const filename = UTF8ToString($1).split("/").pop() || "";
          Module.eventListeners[name](filename);
        }
      }, 140733: () => {
        return Module.ctx.canvas.parentElement.clientWidth;
      }, 140789: () => {
        return Module.ctx.canvas.parentElement.clientHeight;
      }, 140846: () => {
        return window.devicePixelRatio;
      }, 140882: ($0, $1, $2) => {
        const canvas = Module.ctx.canvas;
        canvas.width = canvas.widthNative = $0 * $2;
        canvas.height = canvas.heightNative = $1 * $2;
        canvas.style.setProperty("width", $0 + "px", "important");
        canvas.style.setProperty("height", $1 + "px", "important");
      }};
      function callRuntimeCallbacks(callbacks) {
        while (callbacks.length > 0) {
          var callback = callbacks.shift();
          if (typeof callback == "function") {
            callback(Module);
            continue;
          }
          var func = callback.func;
          if (typeof func == "number") {
            if (callback.arg === void 0) {
              getWasmTableEntry(func)();
            } else {
              getWasmTableEntry(func)(callback.arg);
            }
          } else {
            func(callback.arg === void 0 ? null : callback.arg);
          }
        }
      }
      function getWasmTableEntry(funcPtr) {
        return wasmTable.get(funcPtr);
      }
      function setErrNo(value) {
        HEAP32[___errno_location() >> 2] = value;
        return value;
      }
      var PATH = {isAbs: (path2) => path2.charAt(0) === "/", splitPath: (filename) => {
        var splitPathRe2 = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe2.exec(filename).slice(1);
      }, normalizeArray: (parts, allowAboveRoot) => {
        var up = 0;
        for (var i2 = parts.length - 1; i2 >= 0; i2--) {
          var last = parts[i2];
          if (last === ".") {
            parts.splice(i2, 1);
          } else if (last === "..") {
            parts.splice(i2, 1);
            up++;
          } else if (up) {
            parts.splice(i2, 1);
            up--;
          }
        }
        if (allowAboveRoot) {
          for (; up; up--) {
            parts.unshift("..");
          }
        }
        return parts;
      }, normalize: (path2) => {
        var isAbsolute2 = PATH.isAbs(path2), trailingSlash = path2.substr(-1) === "/";
        path2 = PATH.normalizeArray(path2.split("/").filter((p) => !!p), !isAbsolute2).join("/");
        if (!path2 && !isAbsolute2) {
          path2 = ".";
        }
        if (path2 && trailingSlash) {
          path2 += "/";
        }
        return (isAbsolute2 ? "/" : "") + path2;
      }, dirname: (path2) => {
        var result = PATH.splitPath(path2), root = result[0], dir = result[1];
        if (!root && !dir) {
          return ".";
        }
        if (dir) {
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      }, basename: (path2) => {
        if (path2 === "/")
          return "/";
        path2 = PATH.normalize(path2);
        path2 = path2.replace(/\/$/, "");
        var lastSlash = path2.lastIndexOf("/");
        if (lastSlash === -1)
          return path2;
        return path2.substr(lastSlash + 1);
      }, join: function() {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join("/"));
      }, join2: (l, r) => {
        return PATH.normalize(l + "/" + r);
      }};
      function getRandomDevice() {
        if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
          var randomBuffer = new Uint8Array(1);
          return function() {
            crypto.getRandomValues(randomBuffer);
            return randomBuffer[0];
          };
        } else if (ENVIRONMENT_IS_NODE) {
          try {
            var crypto_module = require$$2;
            return function() {
              return crypto_module["randomBytes"](1)[0];
            };
          } catch (e) {
          }
        }
        return function() {
          abort("randomDevice");
        };
      }
      var PATH_FS = {resolve: function() {
        var resolvedPath = "", resolvedAbsolute = false;
        for (var i2 = arguments.length - 1; i2 >= -1 && !resolvedAbsolute; i2--) {
          var path2 = i2 >= 0 ? arguments[i2] : FS.cwd();
          if (typeof path2 != "string") {
            throw new TypeError("Arguments to path.resolve must be strings");
          } else if (!path2) {
            return "";
          }
          resolvedPath = path2 + "/" + resolvedPath;
          resolvedAbsolute = PATH.isAbs(path2);
        }
        resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter((p) => !!p), !resolvedAbsolute).join("/");
        return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
      }, relative: (from2, to) => {
        from2 = PATH_FS.resolve(from2).substr(1);
        to = PATH_FS.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== "")
              break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== "")
              break;
          }
          if (start > end)
            return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from2.split("/"));
        var toParts = trim(to.split("/"));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i2 = 0; i2 < length; i2++) {
          if (fromParts[i2] !== toParts[i2]) {
            samePartsLength = i2;
            break;
          }
        }
        var outputParts = [];
        for (var i2 = samePartsLength; i2 < fromParts.length; i2++) {
          outputParts.push("..");
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join("/");
      }};
      var TTY = {ttys: [], init: function() {
      }, shutdown: function() {
      }, register: function(dev, ops) {
        TTY.ttys[dev] = {input: [], output: [], ops};
        FS.registerDevice(dev, TTY.stream_ops);
      }, stream_ops: {open: function(stream) {
        var tty = TTY.ttys[stream.node.rdev];
        if (!tty) {
          throw new FS.ErrnoError(43);
        }
        stream.tty = tty;
        stream.seekable = false;
      }, close: function(stream) {
        stream.tty.ops.flush(stream.tty);
      }, flush: function(stream) {
        stream.tty.ops.flush(stream.tty);
      }, read: function(stream, buffer2, offset, length, pos) {
        if (!stream.tty || !stream.tty.ops.get_char) {
          throw new FS.ErrnoError(60);
        }
        var bytesRead = 0;
        for (var i2 = 0; i2 < length; i2++) {
          var result;
          try {
            result = stream.tty.ops.get_char(stream.tty);
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (result === void 0 && bytesRead === 0) {
            throw new FS.ErrnoError(6);
          }
          if (result === null || result === void 0)
            break;
          bytesRead++;
          buffer2[offset + i2] = result;
        }
        if (bytesRead) {
          stream.node.timestamp = Date.now();
        }
        return bytesRead;
      }, write: function(stream, buffer2, offset, length, pos) {
        if (!stream.tty || !stream.tty.ops.put_char) {
          throw new FS.ErrnoError(60);
        }
        try {
          for (var i2 = 0; i2 < length; i2++) {
            stream.tty.ops.put_char(stream.tty, buffer2[offset + i2]);
          }
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
        if (length) {
          stream.node.timestamp = Date.now();
        }
        return i2;
      }}, default_tty_ops: {get_char: function(tty) {
        if (!tty.input.length) {
          var result = null;
          if (ENVIRONMENT_IS_NODE) {
            var BUFSIZE = 256;
            var buf = Buffer.alloc(BUFSIZE);
            var bytesRead = 0;
            try {
              bytesRead = fs.readSync(process.stdin.fd, buf, 0, BUFSIZE, -1);
            } catch (e) {
              if (e.toString().includes("EOF"))
                bytesRead = 0;
              else
                throw e;
            }
            if (bytesRead > 0) {
              result = buf.slice(0, bytesRead).toString("utf-8");
            } else {
              result = null;
            }
          } else if (typeof window != "undefined" && typeof window.prompt == "function") {
            result = window.prompt("Input: ");
            if (result !== null) {
              result += "\n";
            }
          } else if (typeof readline == "function") {
            result = readline();
            if (result !== null) {
              result += "\n";
            }
          }
          if (!result) {
            return null;
          }
          tty.input = intArrayFromString(result, true);
        }
        return tty.input.shift();
      }, put_char: function(tty, val) {
        if (val === null || val === 10) {
          out(UTF8ArrayToString(tty.output, 0));
          tty.output = [];
        } else {
          if (val != 0)
            tty.output.push(val);
        }
      }, flush: function(tty) {
        if (tty.output && tty.output.length > 0) {
          out(UTF8ArrayToString(tty.output, 0));
          tty.output = [];
        }
      }}, default_tty1_ops: {put_char: function(tty, val) {
        if (val === null || val === 10) {
          err(UTF8ArrayToString(tty.output, 0));
          tty.output = [];
        } else {
          if (val != 0)
            tty.output.push(val);
        }
      }, flush: function(tty) {
        if (tty.output && tty.output.length > 0) {
          err(UTF8ArrayToString(tty.output, 0));
          tty.output = [];
        }
      }}};
      function mmapAlloc(size) {
        abort();
      }
      var MEMFS = {ops_table: null, mount: function(mount) {
        return MEMFS.createNode(null, "/", 16384 | 511, 0);
      }, createNode: function(parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          throw new FS.ErrnoError(63);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {dir: {node: {getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, lookup: MEMFS.node_ops.lookup, mknod: MEMFS.node_ops.mknod, rename: MEMFS.node_ops.rename, unlink: MEMFS.node_ops.unlink, rmdir: MEMFS.node_ops.rmdir, readdir: MEMFS.node_ops.readdir, symlink: MEMFS.node_ops.symlink}, stream: {llseek: MEMFS.stream_ops.llseek}}, file: {node: {getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr}, stream: {llseek: MEMFS.stream_ops.llseek, read: MEMFS.stream_ops.read, write: MEMFS.stream_ops.write, allocate: MEMFS.stream_ops.allocate, mmap: MEMFS.stream_ops.mmap, msync: MEMFS.stream_ops.msync}}, link: {node: {getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, readlink: MEMFS.node_ops.readlink}, stream: {}}, chrdev: {node: {getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr}, stream: FS.chrdev_stream_ops}};
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0;
          node.contents = null;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        if (parent) {
          parent.contents[name] = node;
          parent.timestamp = node.timestamp;
        }
        return node;
      }, getFileDataAsTypedArray: function(node) {
        if (!node.contents)
          return new Uint8Array(0);
        if (node.contents.subarray)
          return node.contents.subarray(0, node.usedBytes);
        return new Uint8Array(node.contents);
      }, expandFileStorage: function(node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity)
          return;
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
        if (prevCapacity != 0)
          newCapacity = Math.max(newCapacity, 256);
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity);
        if (node.usedBytes > 0)
          node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
      }, resizeFileStorage: function(node, newSize) {
        if (node.usedBytes == newSize)
          return;
        if (newSize == 0) {
          node.contents = null;
          node.usedBytes = 0;
        } else {
          var oldContents = node.contents;
          node.contents = new Uint8Array(newSize);
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
          }
          node.usedBytes = newSize;
        }
      }, node_ops: {getattr: function(node) {
        var attr = {};
        attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
        attr.ino = node.id;
        attr.mode = node.mode;
        attr.nlink = 1;
        attr.uid = 0;
        attr.gid = 0;
        attr.rdev = node.rdev;
        if (FS.isDir(node.mode)) {
          attr.size = 4096;
        } else if (FS.isFile(node.mode)) {
          attr.size = node.usedBytes;
        } else if (FS.isLink(node.mode)) {
          attr.size = node.link.length;
        } else {
          attr.size = 0;
        }
        attr.atime = new Date(node.timestamp);
        attr.mtime = new Date(node.timestamp);
        attr.ctime = new Date(node.timestamp);
        attr.blksize = 4096;
        attr.blocks = Math.ceil(attr.size / attr.blksize);
        return attr;
      }, setattr: function(node, attr) {
        if (attr.mode !== void 0) {
          node.mode = attr.mode;
        }
        if (attr.timestamp !== void 0) {
          node.timestamp = attr.timestamp;
        }
        if (attr.size !== void 0) {
          MEMFS.resizeFileStorage(node, attr.size);
        }
      }, lookup: function(parent, name) {
        throw FS.genericErrors[44];
      }, mknod: function(parent, name, mode, dev) {
        return MEMFS.createNode(parent, name, mode, dev);
      }, rename: function(old_node, new_dir, new_name) {
        if (FS.isDir(old_node.mode)) {
          var new_node;
          try {
            new_node = FS.lookupNode(new_dir, new_name);
          } catch (e) {
          }
          if (new_node) {
            for (var i2 in new_node.contents) {
              throw new FS.ErrnoError(55);
            }
          }
        }
        delete old_node.parent.contents[old_node.name];
        old_node.parent.timestamp = Date.now();
        old_node.name = new_name;
        new_dir.contents[new_name] = old_node;
        new_dir.timestamp = old_node.parent.timestamp;
        old_node.parent = new_dir;
      }, unlink: function(parent, name) {
        delete parent.contents[name];
        parent.timestamp = Date.now();
      }, rmdir: function(parent, name) {
        var node = FS.lookupNode(parent, name);
        for (var i2 in node.contents) {
          throw new FS.ErrnoError(55);
        }
        delete parent.contents[name];
        parent.timestamp = Date.now();
      }, readdir: function(node) {
        var entries = [".", ".."];
        for (var key in node.contents) {
          if (!node.contents.hasOwnProperty(key)) {
            continue;
          }
          entries.push(key);
        }
        return entries;
      }, symlink: function(parent, newname, oldpath) {
        var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
        node.link = oldpath;
        return node;
      }, readlink: function(node) {
        if (!FS.isLink(node.mode)) {
          throw new FS.ErrnoError(28);
        }
        return node.link;
      }}, stream_ops: {read: function(stream, buffer2, offset, length, position) {
        var contents = stream.node.contents;
        if (position >= stream.node.usedBytes)
          return 0;
        var size = Math.min(stream.node.usedBytes - position, length);
        if (size > 8 && contents.subarray) {
          buffer2.set(contents.subarray(position, position + size), offset);
        } else {
          for (var i2 = 0; i2 < size; i2++)
            buffer2[offset + i2] = contents[position + i2];
        }
        return size;
      }, write: function(stream, buffer2, offset, length, position, canOwn) {
        if (!length)
          return 0;
        var node = stream.node;
        node.timestamp = Date.now();
        if (buffer2.subarray && (!node.contents || node.contents.subarray)) {
          if (canOwn) {
            node.contents = buffer2.subarray(offset, offset + length);
            node.usedBytes = length;
            return length;
          } else if (node.usedBytes === 0 && position === 0) {
            node.contents = buffer2.slice(offset, offset + length);
            node.usedBytes = length;
            return length;
          } else if (position + length <= node.usedBytes) {
            node.contents.set(buffer2.subarray(offset, offset + length), position);
            return length;
          }
        }
        MEMFS.expandFileStorage(node, position + length);
        if (node.contents.subarray && buffer2.subarray) {
          node.contents.set(buffer2.subarray(offset, offset + length), position);
        } else {
          for (var i2 = 0; i2 < length; i2++) {
            node.contents[position + i2] = buffer2[offset + i2];
          }
        }
        node.usedBytes = Math.max(node.usedBytes, position + length);
        return length;
      }, llseek: function(stream, offset, whence) {
        var position = offset;
        if (whence === 1) {
          position += stream.position;
        } else if (whence === 2) {
          if (FS.isFile(stream.node.mode)) {
            position += stream.node.usedBytes;
          }
        }
        if (position < 0) {
          throw new FS.ErrnoError(28);
        }
        return position;
      }, allocate: function(stream, offset, length) {
        MEMFS.expandFileStorage(stream.node, offset + length);
        stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
      }, mmap: function(stream, length, position, prot, flags) {
        if (!FS.isFile(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        var ptr;
        var allocated;
        var contents = stream.node.contents;
        if (!(flags & 2) && contents.buffer === buffer) {
          allocated = false;
          ptr = contents.byteOffset;
        } else {
          if (position > 0 || position + length < contents.length) {
            if (contents.subarray) {
              contents = contents.subarray(position, position + length);
            } else {
              contents = Array.prototype.slice.call(contents, position, position + length);
            }
          }
          allocated = true;
          ptr = mmapAlloc();
          if (!ptr) {
            throw new FS.ErrnoError(48);
          }
          HEAP8.set(contents, ptr);
        }
        return {ptr, allocated};
      }, msync: function(stream, buffer2, offset, length, mmapFlags) {
        if (!FS.isFile(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (mmapFlags & 2) {
          return 0;
        }
        var bytesWritten = MEMFS.stream_ops.write(stream, buffer2, 0, length, offset, false);
        return 0;
      }}};
      function asyncLoad(url, onload, onerror, noRunDep) {
        var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
        readAsync(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (dep)
            removeRunDependency();
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (dep)
          addRunDependency();
      }
      var FS = {root: null, mounts: [], devices: {}, streams: [], nextInode: 1, nameTable: null, currentPath: "/", initialized: false, ignorePermissions: true, ErrnoError: null, genericErrors: {}, filesystems: null, syncFSRequests: 0, lookupPath: (path2, opts = {}) => {
        path2 = PATH_FS.resolve(FS.cwd(), path2);
        if (!path2)
          return {path: "", node: null};
        var defaults = {follow_mount: true, recurse_count: 0};
        opts = Object.assign(defaults, opts);
        if (opts.recurse_count > 8) {
          throw new FS.ErrnoError(32);
        }
        var parts = PATH.normalizeArray(path2.split("/").filter((p) => !!p), false);
        var current = FS.root;
        var current_path = "/";
        for (var i2 = 0; i2 < parts.length; i2++) {
          var islast = i2 === parts.length - 1;
          if (islast && opts.parent) {
            break;
          }
          current = FS.lookupNode(current, parts[i2]);
          current_path = PATH.join2(current_path, parts[i2]);
          if (FS.isMountpoint(current)) {
            if (!islast || islast && opts.follow_mount) {
              current = current.mounted.root;
            }
          }
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
              var lookup2 = FS.lookupPath(current_path, {recurse_count: opts.recurse_count + 1});
              current = lookup2.node;
              if (count++ > 40) {
                throw new FS.ErrnoError(32);
              }
            }
          }
        }
        return {path: current_path, node: current};
      }, getPath: (node) => {
        var path2;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path2)
              return mount;
            return mount[mount.length - 1] !== "/" ? mount + "/" + path2 : mount + path2;
          }
          path2 = path2 ? node.name + "/" + path2 : node.name;
          node = node.parent;
        }
      }, hashName: (parentid, name) => {
        var hash = 0;
        for (var i2 = 0; i2 < name.length; i2++) {
          hash = (hash << 5) - hash + name.charCodeAt(i2) | 0;
        }
        return (parentid + hash >>> 0) % FS.nameTable.length;
      }, hashAddNode: (node) => {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      }, hashRemoveNode: (node) => {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      }, lookupNode: (parent, name) => {
        var errCode = FS.mayLookup(parent);
        if (errCode) {
          throw new FS.ErrnoError(errCode, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        return FS.lookup(parent, name);
      }, createNode: (parent, name, mode, rdev) => {
        var node = new FS.FSNode(parent, name, mode, rdev);
        FS.hashAddNode(node);
        return node;
      }, destroyNode: (node) => {
        FS.hashRemoveNode(node);
      }, isRoot: (node) => {
        return node === node.parent;
      }, isMountpoint: (node) => {
        return !!node.mounted;
      }, isFile: (mode) => {
        return (mode & 61440) === 32768;
      }, isDir: (mode) => {
        return (mode & 61440) === 16384;
      }, isLink: (mode) => {
        return (mode & 61440) === 40960;
      }, isChrdev: (mode) => {
        return (mode & 61440) === 8192;
      }, isBlkdev: (mode) => {
        return (mode & 61440) === 24576;
      }, isFIFO: (mode) => {
        return (mode & 61440) === 4096;
      }, isSocket: (mode) => {
        return (mode & 49152) === 49152;
      }, flagModes: {r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090}, modeStringToFlags: (str) => {
        var flags = FS.flagModes[str];
        if (typeof flags == "undefined") {
          throw new Error("Unknown file open mode: " + str);
        }
        return flags;
      }, flagsToPermissionString: (flag) => {
        var perms = ["r", "w", "rw"][flag & 3];
        if (flag & 512) {
          perms += "w";
        }
        return perms;
      }, nodePermissions: (node, perms) => {
        if (FS.ignorePermissions) {
          return 0;
        }
        if (perms.includes("r") && !(node.mode & 292)) {
          return 2;
        } else if (perms.includes("w") && !(node.mode & 146)) {
          return 2;
        } else if (perms.includes("x") && !(node.mode & 73)) {
          return 2;
        }
        return 0;
      }, mayLookup: (dir) => {
        var errCode = FS.nodePermissions(dir, "x");
        if (errCode)
          return errCode;
        if (!dir.node_ops.lookup)
          return 2;
        return 0;
      }, mayCreate: (dir, name) => {
        try {
          var node = FS.lookupNode(dir, name);
          return 20;
        } catch (e) {
        }
        return FS.nodePermissions(dir, "wx");
      }, mayDelete: (dir, name, isdir) => {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var errCode = FS.nodePermissions(dir, "wx");
        if (errCode) {
          return errCode;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return 54;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return 10;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return 31;
          }
        }
        return 0;
      }, mayOpen: (node, flags) => {
        if (!node) {
          return 44;
        }
        if (FS.isLink(node.mode)) {
          return 32;
        } else if (FS.isDir(node.mode)) {
          if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
            return 31;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      }, MAX_OPEN_FDS: 4096, nextfd: (fd_start = 0, fd_end = FS.MAX_OPEN_FDS) => {
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(33);
      }, getStream: (fd) => FS.streams[fd], createStream: (stream, fd_start, fd_end) => {
        if (!FS.FSStream) {
          FS.FSStream = function() {
            this.shared = {};
          };
          FS.FSStream.prototype = {object: {get: function() {
            return this.node;
          }, set: function(val) {
            this.node = val;
          }}, isRead: {get: function() {
            return (this.flags & 2097155) !== 1;
          }}, isWrite: {get: function() {
            return (this.flags & 2097155) !== 0;
          }}, isAppend: {get: function() {
            return this.flags & 1024;
          }}, flags: {get: function() {
            return this.shared.flags;
          }, set: function(val) {
            this.shared.flags = val;
          }}, position: {get function() {
            return this.shared.position;
          }, set: function(val) {
            this.shared.position = val;
          }}};
        }
        stream = Object.assign(new FS.FSStream(), stream);
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      }, closeStream: (fd) => {
        FS.streams[fd] = null;
      }, chrdev_stream_ops: {open: (stream) => {
        var device = FS.getDevice(stream.node.rdev);
        stream.stream_ops = device.stream_ops;
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
      }, llseek: () => {
        throw new FS.ErrnoError(70);
      }}, major: (dev) => dev >> 8, minor: (dev) => dev & 255, makedev: (ma, mi) => ma << 8 | mi, registerDevice: (dev, ops) => {
        FS.devices[dev] = {stream_ops: ops};
      }, getDevice: (dev) => FS.devices[dev], getMounts: (mount) => {
        var mounts = [];
        var check = [mount];
        while (check.length) {
          var m = check.pop();
          mounts.push(m);
          check.push.apply(check, m.mounts);
        }
        return mounts;
      }, syncfs: (populate, callback) => {
        if (typeof populate == "function") {
          callback = populate;
          populate = false;
        }
        FS.syncFSRequests++;
        if (FS.syncFSRequests > 1) {
          err("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work");
        }
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
        function doCallback(errCode) {
          FS.syncFSRequests--;
          return callback(errCode);
        }
        function done(errCode) {
          if (errCode) {
            if (!done.errored) {
              done.errored = true;
              return doCallback(errCode);
            }
            return;
          }
          if (++completed >= mounts.length) {
            doCallback(null);
          }
        }
        mounts.forEach((mount) => {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      }, mount: (type, opts, mountpoint) => {
        var root = mountpoint === "/";
        var pseudo = !mountpoint;
        var node;
        if (root && FS.root) {
          throw new FS.ErrnoError(10);
        } else if (!root && !pseudo) {
          var lookup2 = FS.lookupPath(mountpoint, {follow_mount: false});
          mountpoint = lookup2.path;
          node = lookup2.node;
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
          }
        }
        var mount = {type, opts, mountpoint, mounts: []};
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          node.mounted = mount;
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
        return mountRoot;
      }, unmount: (mountpoint) => {
        var lookup2 = FS.lookupPath(mountpoint, {follow_mount: false});
        if (!FS.isMountpoint(lookup2.node)) {
          throw new FS.ErrnoError(28);
        }
        var node = lookup2.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
        Object.keys(FS.nameTable).forEach((hash) => {
          var current = FS.nameTable[hash];
          while (current) {
            var next = current.name_next;
            if (mounts.includes(current.mount)) {
              FS.destroyNode(current);
            }
            current = next;
          }
        });
        node.mounted = null;
        var idx = node.mount.mounts.indexOf(mount);
        node.mount.mounts.splice(idx, 1);
      }, lookup: (parent, name) => {
        return parent.node_ops.lookup(parent, name);
      }, mknod: (path2, mode, dev) => {
        var lookup2 = FS.lookupPath(path2, {parent: true});
        var parent = lookup2.node;
        var name = PATH.basename(path2);
        if (!name || name === "." || name === "..") {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.mayCreate(parent, name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      }, create: (path2, mode) => {
        mode = mode !== void 0 ? mode : 438;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path2, mode, 0);
      }, mkdir: (path2, mode) => {
        mode = mode !== void 0 ? mode : 511;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path2, mode, 0);
      }, mkdirTree: (path2, mode) => {
        var dirs = path2.split("/");
        var d = "";
        for (var i2 = 0; i2 < dirs.length; ++i2) {
          if (!dirs[i2])
            continue;
          d += "/" + dirs[i2];
          try {
            FS.mkdir(d, mode);
          } catch (e) {
            if (e.errno != 20)
              throw e;
          }
        }
      }, mkdev: (path2, mode, dev) => {
        if (typeof dev == "undefined") {
          dev = mode;
          mode = 438;
        }
        mode |= 8192;
        return FS.mknod(path2, mode, dev);
      }, symlink: (oldpath, newpath) => {
        if (!PATH_FS.resolve(oldpath)) {
          throw new FS.ErrnoError(44);
        }
        var lookup2 = FS.lookupPath(newpath, {parent: true});
        var parent = lookup2.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var newname = PATH.basename(newpath);
        var errCode = FS.mayCreate(parent, newname);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      }, rename: (old_path, new_path) => {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        var lookup2, old_dir, new_dir;
        lookup2 = FS.lookupPath(old_path, {parent: true});
        old_dir = lookup2.node;
        lookup2 = FS.lookupPath(new_path, {parent: true});
        new_dir = lookup2.node;
        if (!old_dir || !new_dir)
          throw new FS.ErrnoError(44);
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(75);
        }
        var old_node = FS.lookupNode(old_dir, old_name);
        var relative2 = PATH_FS.relative(old_path, new_dirname);
        if (relative2.charAt(0) !== ".") {
          throw new FS.ErrnoError(28);
        }
        relative2 = PATH_FS.relative(new_path, old_dirname);
        if (relative2.charAt(0) !== ".") {
          throw new FS.ErrnoError(55);
        }
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
        }
        if (old_node === new_node) {
          return;
        }
        var isdir = FS.isDir(old_node.mode);
        var errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
          throw new FS.ErrnoError(10);
        }
        if (new_dir !== old_dir) {
          errCode = FS.nodePermissions(old_dir, "w");
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        FS.hashRemoveNode(old_node);
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          FS.hashAddNode(old_node);
        }
      }, rmdir: (path2) => {
        var lookup2 = FS.lookupPath(path2, {parent: true});
        var parent = lookup2.node;
        var name = PATH.basename(path2);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, true);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      }, readdir: (path2) => {
        var lookup2 = FS.lookupPath(path2, {follow: true});
        var node = lookup2.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(54);
        }
        return node.node_ops.readdir(node);
      }, unlink: (path2) => {
        var lookup2 = FS.lookupPath(path2, {parent: true});
        var parent = lookup2.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var name = PATH.basename(path2);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      }, readlink: (path2) => {
        var lookup2 = FS.lookupPath(path2);
        var link = lookup2.node;
        if (!link) {
          throw new FS.ErrnoError(44);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(28);
        }
        return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
      }, stat: (path2, dontFollow) => {
        var lookup2 = FS.lookupPath(path2, {follow: !dontFollow});
        var node = lookup2.node;
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(63);
        }
        return node.node_ops.getattr(node);
      }, lstat: (path2) => {
        return FS.stat(path2, true);
      }, chmod: (path2, mode, dontFollow) => {
        var node;
        if (typeof path2 == "string") {
          var lookup2 = FS.lookupPath(path2, {follow: !dontFollow});
          node = lookup2.node;
        } else {
          node = path2;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {mode: mode & 4095 | node.mode & ~4095, timestamp: Date.now()});
      }, lchmod: (path2, mode) => {
        FS.chmod(path2, mode, true);
      }, fchmod: (fd, mode) => {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        FS.chmod(stream.node, mode);
      }, chown: (path2, uid, gid, dontFollow) => {
        var node;
        if (typeof path2 == "string") {
          var lookup2 = FS.lookupPath(path2, {follow: !dontFollow});
          node = lookup2.node;
        } else {
          node = path2;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {timestamp: Date.now()});
      }, lchown: (path2, uid, gid) => {
        FS.chown(path2, uid, gid, true);
      }, fchown: (fd, uid, gid) => {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        FS.chown(stream.node, uid, gid);
      }, truncate: (path2, len) => {
        if (len < 0) {
          throw new FS.ErrnoError(28);
        }
        var node;
        if (typeof path2 == "string") {
          var lookup2 = FS.lookupPath(path2, {follow: true});
          node = lookup2.node;
        } else {
          node = path2;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.nodePermissions(node, "w");
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        node.node_ops.setattr(node, {size: len, timestamp: Date.now()});
      }, ftruncate: (fd, len) => {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(28);
        }
        FS.truncate(stream.node, len);
      }, utime: (path2, atime, mtime) => {
        var lookup2 = FS.lookupPath(path2, {follow: true});
        var node = lookup2.node;
        node.node_ops.setattr(node, {timestamp: Math.max(atime, mtime)});
      }, open: (path2, flags, mode) => {
        if (path2 === "") {
          throw new FS.ErrnoError(44);
        }
        flags = typeof flags == "string" ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode == "undefined" ? 438 : mode;
        if (flags & 64) {
          mode = mode & 4095 | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path2 == "object") {
          node = path2;
        } else {
          path2 = PATH.normalize(path2);
          try {
            var lookup2 = FS.lookupPath(path2, {follow: !(flags & 131072)});
            node = lookup2.node;
          } catch (e) {
          }
        }
        var created = false;
        if (flags & 64) {
          if (node) {
            if (flags & 128) {
              throw new FS.ErrnoError(20);
            }
          } else {
            node = FS.mknod(path2, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        if (flags & 65536 && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
        if (!created) {
          var errCode = FS.mayOpen(node, flags);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        if (flags & 512 && !created) {
          FS.truncate(node, 0);
        }
        flags &= ~(128 | 512 | 131072);
        var stream = FS.createStream({node, path: FS.getPath(node), flags, seekable: true, position: 0, stream_ops: node.stream_ops, ungotten: [], error: false});
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module["logReadFiles"] && !(flags & 1)) {
          if (!FS.readFiles)
            FS.readFiles = {};
          if (!(path2 in FS.readFiles)) {
            FS.readFiles[path2] = 1;
          }
        }
        return stream;
      }, close: (stream) => {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (stream.getdents)
          stream.getdents = null;
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
        stream.fd = null;
      }, isClosed: (stream) => {
        return stream.fd === null;
      }, llseek: (stream, offset, whence) => {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(70);
        }
        if (whence != 0 && whence != 1 && whence != 2) {
          throw new FS.ErrnoError(28);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
      }, read: (stream, buffer2, offset, length, position) => {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(28);
        }
        var seeking = typeof position != "undefined";
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer2, offset, length, position);
        if (!seeking)
          stream.position += bytesRead;
        return bytesRead;
      }, write: (stream, buffer2, offset, length, position, canOwn) => {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(28);
        }
        if (stream.seekable && stream.flags & 1024) {
          FS.llseek(stream, 0, 2);
        }
        var seeking = typeof position != "undefined";
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer2, offset, length, position, canOwn);
        if (!seeking)
          stream.position += bytesWritten;
        return bytesWritten;
      }, allocate: (stream, offset, length) => {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(28);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(138);
        }
        stream.stream_ops.allocate(stream, offset, length);
      }, mmap: (stream, length, position, prot, flags) => {
        if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
          throw new FS.ErrnoError(2);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(2);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(43);
        }
        return stream.stream_ops.mmap(stream, length, position, prot, flags);
      }, msync: (stream, buffer2, offset, length, mmapFlags) => {
        if (!stream || !stream.stream_ops.msync) {
          return 0;
        }
        return stream.stream_ops.msync(stream, buffer2, offset, length, mmapFlags);
      }, munmap: (stream) => 0, ioctl: (stream, cmd, arg) => {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(59);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      }, readFile: (path2, opts = {}) => {
        opts.flags = opts.flags || 0;
        opts.encoding = opts.encoding || "binary";
        if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path2, opts.flags);
        var stat = FS.stat(path2);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === "utf8") {
          ret = UTF8ArrayToString(buf, 0);
        } else if (opts.encoding === "binary") {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      }, writeFile: (path2, data, opts = {}) => {
        opts.flags = opts.flags || 577;
        var stream = FS.open(path2, opts.flags, opts.mode);
        if (typeof data == "string") {
          var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
          var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
          FS.write(stream, buf, 0, actualNumBytes, void 0, opts.canOwn);
        } else if (ArrayBuffer.isView(data)) {
          FS.write(stream, data, 0, data.byteLength, void 0, opts.canOwn);
        } else {
          throw new Error("Unsupported data type");
        }
        FS.close(stream);
      }, cwd: () => FS.currentPath, chdir: (path2) => {
        var lookup2 = FS.lookupPath(path2, {follow: true});
        if (lookup2.node === null) {
          throw new FS.ErrnoError(44);
        }
        if (!FS.isDir(lookup2.node.mode)) {
          throw new FS.ErrnoError(54);
        }
        var errCode = FS.nodePermissions(lookup2.node, "x");
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        FS.currentPath = lookup2.path;
      }, createDefaultDirectories: () => {
        FS.mkdir("/tmp");
        FS.mkdir("/home");
        FS.mkdir("/home/web_user");
      }, createDefaultDevices: () => {
        FS.mkdir("/dev");
        FS.registerDevice(FS.makedev(1, 3), {read: () => 0, write: (stream, buffer2, offset, length, pos) => length});
        FS.mkdev("/dev/null", FS.makedev(1, 3));
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev("/dev/tty", FS.makedev(5, 0));
        FS.mkdev("/dev/tty1", FS.makedev(6, 0));
        var random_device = getRandomDevice();
        FS.createDevice("/dev", "random", random_device);
        FS.createDevice("/dev", "urandom", random_device);
        FS.mkdir("/dev/shm");
        FS.mkdir("/dev/shm/tmp");
      }, createSpecialDirectories: () => {
        FS.mkdir("/proc");
        var proc_self = FS.mkdir("/proc/self");
        FS.mkdir("/proc/self/fd");
        FS.mount({mount: () => {
          var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
          node.node_ops = {lookup: (parent, name) => {
            var fd = +name;
            var stream = FS.getStream(fd);
            if (!stream)
              throw new FS.ErrnoError(8);
            var ret = {parent: null, mount: {mountpoint: "fake"}, node_ops: {readlink: () => stream.path}};
            ret.parent = ret;
            return ret;
          }};
          return node;
        }}, {}, "/proc/self/fd");
      }, createStandardStreams: () => {
        if (Module["stdin"]) {
          FS.createDevice("/dev", "stdin", Module["stdin"]);
        } else {
          FS.symlink("/dev/tty", "/dev/stdin");
        }
        if (Module["stdout"]) {
          FS.createDevice("/dev", "stdout", null, Module["stdout"]);
        } else {
          FS.symlink("/dev/tty", "/dev/stdout");
        }
        if (Module["stderr"]) {
          FS.createDevice("/dev", "stderr", null, Module["stderr"]);
        } else {
          FS.symlink("/dev/tty1", "/dev/stderr");
        }
        var stdin = FS.open("/dev/stdin", 0);
        var stdout = FS.open("/dev/stdout", 1);
        var stderr = FS.open("/dev/stderr", 1);
      }, ensureErrnoError: () => {
        if (FS.ErrnoError)
          return;
        FS.ErrnoError = function ErrnoError(errno, node) {
          this.node = node;
          this.setErrno = function(errno2) {
            this.errno = errno2;
          };
          this.setErrno(errno);
          this.message = "FS error";
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        [44].forEach((code) => {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = "<generic error, no stack>";
        });
      }, staticInit: () => {
        FS.ensureErrnoError();
        FS.nameTable = new Array(4096);
        FS.mount(MEMFS, {}, "/");
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
        FS.filesystems = {MEMFS};
      }, init: (input, output, error) => {
        FS.init.initialized = true;
        FS.ensureErrnoError();
        Module["stdin"] = input || Module["stdin"];
        Module["stdout"] = output || Module["stdout"];
        Module["stderr"] = error || Module["stderr"];
        FS.createStandardStreams();
      }, quit: () => {
        FS.init.initialized = false;
        for (var i2 = 0; i2 < FS.streams.length; i2++) {
          var stream = FS.streams[i2];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      }, getMode: (canRead, canWrite) => {
        var mode = 0;
        if (canRead)
          mode |= 292 | 73;
        if (canWrite)
          mode |= 146;
        return mode;
      }, findObject: (path2, dontResolveLastLink) => {
        var ret = FS.analyzePath(path2, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          return null;
        }
      }, analyzePath: (path2, dontResolveLastLink) => {
        try {
          var lookup2 = FS.lookupPath(path2, {follow: !dontResolveLastLink});
          path2 = lookup2.path;
        } catch (e) {
        }
        var ret = {isRoot: false, exists: false, error: 0, name: null, path: null, object: null, parentExists: false, parentPath: null, parentObject: null};
        try {
          var lookup2 = FS.lookupPath(path2, {parent: true});
          ret.parentExists = true;
          ret.parentPath = lookup2.path;
          ret.parentObject = lookup2.node;
          ret.name = PATH.basename(path2);
          lookup2 = FS.lookupPath(path2, {follow: !dontResolveLastLink});
          ret.exists = true;
          ret.path = lookup2.path;
          ret.object = lookup2.node;
          ret.name = lookup2.node.name;
          ret.isRoot = lookup2.path === "/";
        } catch (e) {
          ret.error = e.errno;
        }
        return ret;
      }, createPath: (parent, path2, canRead, canWrite) => {
        parent = typeof parent == "string" ? parent : FS.getPath(parent);
        var parts = path2.split("/").reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part)
            continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
          }
          parent = current;
        }
        return current;
      }, createFile: (parent, name, properties, canRead, canWrite) => {
        var path2 = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path2, mode);
      }, createDataFile: (parent, name, data, canRead, canWrite, canOwn) => {
        var path2 = name;
        if (parent) {
          parent = typeof parent == "string" ? parent : FS.getPath(parent);
          path2 = name ? PATH.join2(parent, name) : parent;
        }
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path2, mode);
        if (data) {
          if (typeof data == "string") {
            var arr = new Array(data.length);
            for (var i2 = 0, len = data.length; i2 < len; ++i2)
              arr[i2] = data.charCodeAt(i2);
            data = arr;
          }
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 577);
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      }, createDevice: (parent, name, input, output) => {
        var path2 = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major)
          FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        FS.registerDevice(dev, {open: (stream) => {
          stream.seekable = false;
        }, close: (stream) => {
          if (output && output.buffer && output.buffer.length) {
            output(10);
          }
        }, read: (stream, buffer2, offset, length, pos) => {
          var bytesRead = 0;
          for (var i2 = 0; i2 < length; i2++) {
            var result;
            try {
              result = input();
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
            if (result === void 0 && bytesRead === 0) {
              throw new FS.ErrnoError(6);
            }
            if (result === null || result === void 0)
              break;
            bytesRead++;
            buffer2[offset + i2] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        }, write: (stream, buffer2, offset, length, pos) => {
          for (var i2 = 0; i2 < length; i2++) {
            try {
              output(buffer2[offset + i2]);
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i2;
        }});
        return FS.mkdev(path2, mode, dev);
      }, forceLoadFile: (obj) => {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents)
          return true;
        if (typeof XMLHttpRequest != "undefined") {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (read_) {
          try {
            obj.contents = intArrayFromString(read_(obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        } else {
          throw new Error("Cannot load without read() or XMLHttpRequest.");
        }
      }, createLazyFile: (parent, name, url, canRead, canWrite) => {
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = [];
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length - 1 || idx < 0) {
            return void 0;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = idx / this.chunkSize | 0;
          return this.getter(chunkNum)[chunkOffset];
        };
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        };
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
          var xhr = new XMLHttpRequest();
          xhr.open("HEAD", url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304))
            throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
          var chunkSize = 1024 * 1024;
          if (!hasByteServing)
            chunkSize = datalength;
          var doXHR = (from2, to) => {
            if (from2 > to)
              throw new Error("invalid range (" + from2 + ", " + to + ") or no bytes requested!");
            if (to > datalength - 1)
              throw new Error("only " + datalength + " bytes available! programmer error!");
            var xhr2 = new XMLHttpRequest();
            xhr2.open("GET", url, false);
            if (datalength !== chunkSize)
              xhr2.setRequestHeader("Range", "bytes=" + from2 + "-" + to);
            xhr2.responseType = "arraybuffer";
            if (xhr2.overrideMimeType) {
              xhr2.overrideMimeType("text/plain; charset=x-user-defined");
            }
            xhr2.send(null);
            if (!(xhr2.status >= 200 && xhr2.status < 300 || xhr2.status === 304))
              throw new Error("Couldn't load " + url + ". Status: " + xhr2.status);
            if (xhr2.response !== void 0) {
              return new Uint8Array(xhr2.response || []);
            } else {
              return intArrayFromString(xhr2.responseText || "", true);
            }
          };
          var lazyArray2 = this;
          lazyArray2.setDataGetter((chunkNum) => {
            var start = chunkNum * chunkSize;
            var end = (chunkNum + 1) * chunkSize - 1;
            end = Math.min(end, datalength - 1);
            if (typeof lazyArray2.chunks[chunkNum] == "undefined") {
              lazyArray2.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof lazyArray2.chunks[chunkNum] == "undefined")
              throw new Error("doXHR failed!");
            return lazyArray2.chunks[chunkNum];
          });
          if (usesGzip || !datalength) {
            chunkSize = datalength = 1;
            datalength = this.getter(0).length;
            chunkSize = datalength;
            out("LazyFiles on gzip forces download of the whole file when length is accessed");
          }
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        };
        if (typeof XMLHttpRequest != "undefined") {
          if (!ENVIRONMENT_IS_WORKER)
            throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
          var lazyArray = new LazyUint8Array();
          Object.defineProperties(lazyArray, {length: {get: function() {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._length;
          }}, chunkSize: {get: function() {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._chunkSize;
          }}});
          var properties = {isDevice: false, contents: lazyArray};
        } else {
          var properties = {isDevice: false, url};
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        Object.defineProperties(node, {usedBytes: {get: function() {
          return this.contents.length;
        }}});
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach((key) => {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            FS.forceLoadFile(node);
            return fn.apply(null, arguments);
          };
        });
        stream_ops.read = (stream, buffer2, offset, length, position) => {
          FS.forceLoadFile(node);
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          if (contents.slice) {
            for (var i2 = 0; i2 < size; i2++) {
              buffer2[offset + i2] = contents[position + i2];
            }
          } else {
            for (var i2 = 0; i2 < size; i2++) {
              buffer2[offset + i2] = contents.get(position + i2);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      }, createPreloadedFile: (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
        var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray2) {
            if (preFinish)
              preFinish();
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray2, canRead, canWrite, canOwn);
            }
            if (onload)
              onload();
            removeRunDependency();
          }
          if (Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
            if (onerror)
              onerror();
            removeRunDependency();
          })) {
            return;
          }
          finish(byteArray);
        }
        addRunDependency();
        if (typeof url == "string") {
          asyncLoad(url, (byteArray) => processData(byteArray), onerror);
        } else {
          processData(url);
        }
      }, indexedDB: () => {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      }, DB_NAME: () => {
        return "EM_FS_" + window.location.pathname;
      }, DB_VERSION: 20, DB_STORE_NAME: "FILE_DATA", saveFilesToDB: (paths, onload, onerror) => {
        onload = onload || (() => {
        });
        onerror = onerror || (() => {
        });
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = () => {
          out("creating db");
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = () => {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0)
              onload();
            else
              onerror();
          }
          paths.forEach((path2) => {
            var putRequest = files.put(FS.analyzePath(path2).object.contents, path2);
            putRequest.onsuccess = () => {
              ok++;
              if (ok + fail == total)
                finish();
            };
            putRequest.onerror = () => {
              fail++;
              if (ok + fail == total)
                finish();
            };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }, loadFilesFromDB: (paths, onload, onerror) => {
        onload = onload || (() => {
        });
        onerror = onerror || (() => {
        });
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror;
        openRequest.onsuccess = () => {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], "readonly");
          } catch (e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0)
              onload();
            else
              onerror();
          }
          paths.forEach((path2) => {
            var getRequest = files.get(path2);
            getRequest.onsuccess = () => {
              if (FS.analyzePath(path2).exists) {
                FS.unlink(path2);
              }
              FS.createDataFile(PATH.dirname(path2), PATH.basename(path2), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total)
                finish();
            };
            getRequest.onerror = () => {
              fail++;
              if (ok + fail == total)
                finish();
            };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
      var SYSCALLS = {DEFAULT_POLLMASK: 5, calculateAt: function(dirfd, path2, allowEmpty) {
        if (PATH.isAbs(path2)) {
          return path2;
        }
        var dir;
        if (dirfd === -100) {
          dir = FS.cwd();
        } else {
          var dirstream = FS.getStream(dirfd);
          if (!dirstream)
            throw new FS.ErrnoError(8);
          dir = dirstream.path;
        }
        if (path2.length == 0) {
          if (!allowEmpty) {
            throw new FS.ErrnoError(44);
          }
          return dir;
        }
        return PATH.join2(dir, path2);
      }, doStat: function(func, path2, buf) {
        try {
          var stat = func(path2);
        } catch (e) {
          if (e && e.node && PATH.normalize(path2) !== PATH.normalize(FS.getPath(e.node))) {
            return -54;
          }
          throw e;
        }
        HEAP32[buf >> 2] = stat.dev;
        HEAP32[buf + 4 >> 2] = 0;
        HEAP32[buf + 8 >> 2] = stat.ino;
        HEAP32[buf + 12 >> 2] = stat.mode;
        HEAP32[buf + 16 >> 2] = stat.nlink;
        HEAP32[buf + 20 >> 2] = stat.uid;
        HEAP32[buf + 24 >> 2] = stat.gid;
        HEAP32[buf + 28 >> 2] = stat.rdev;
        HEAP32[buf + 32 >> 2] = 0;
        tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
        HEAP32[buf + 48 >> 2] = 4096;
        HEAP32[buf + 52 >> 2] = stat.blocks;
        HEAP32[buf + 56 >> 2] = stat.atime.getTime() / 1e3 | 0;
        HEAP32[buf + 60 >> 2] = 0;
        HEAP32[buf + 64 >> 2] = stat.mtime.getTime() / 1e3 | 0;
        HEAP32[buf + 68 >> 2] = 0;
        HEAP32[buf + 72 >> 2] = stat.ctime.getTime() / 1e3 | 0;
        HEAP32[buf + 76 >> 2] = 0;
        tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 80 >> 2] = tempI64[0], HEAP32[buf + 84 >> 2] = tempI64[1];
        return 0;
      }, doMsync: function(addr, stream, len, flags, offset) {
        var buffer2 = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer2, offset, len, flags);
      }, varargs: void 0, get: function() {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
        return ret;
      }, getStr: function(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      }, getStreamFromFD: function(fd) {
        var stream = FS.getStream(fd);
        if (!stream)
          throw new FS.ErrnoError(8);
        return stream;
      }};
      function ___syscall_fcntl64(fd, cmd, varargs) {
        SYSCALLS.varargs = varargs;
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          switch (cmd) {
            case 0: {
              var arg = SYSCALLS.get();
              if (arg < 0) {
                return -28;
              }
              var newStream;
              newStream = FS.createStream(stream, arg);
              return newStream.fd;
            }
            case 1:
            case 2:
              return 0;
            case 3:
              return stream.flags;
            case 4: {
              var arg = SYSCALLS.get();
              stream.flags |= arg;
              return 0;
            }
            case 5: {
              var arg = SYSCALLS.get();
              var offset = 0;
              HEAP16[arg + offset >> 1] = 2;
              return 0;
            }
            case 6:
            case 7:
              return 0;
            case 16:
            case 8:
              return -28;
            case 9:
              setErrNo(28);
              return -1;
            default: {
              return -28;
            }
          }
        } catch (e) {
          if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError))
            throw e;
          return -e.errno;
        }
      }
      function convertI32PairToI53Checked(lo, hi) {
        return hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
      }
      function ___syscall_ftruncate64(fd, length_low, length_high) {
        try {
          var length = convertI32PairToI53Checked(length_low, length_high);
          if (isNaN(length))
            return -61;
          FS.ftruncate(fd, length);
          return 0;
        } catch (e) {
          if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError))
            throw e;
          return -e.errno;
        }
      }
      function ___syscall_ioctl(fd, op, varargs) {
        SYSCALLS.varargs = varargs;
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          switch (op) {
            case 21509:
            case 21505: {
              if (!stream.tty)
                return -59;
              return 0;
            }
            case 21510:
            case 21511:
            case 21512:
            case 21506:
            case 21507:
            case 21508: {
              if (!stream.tty)
                return -59;
              return 0;
            }
            case 21519: {
              if (!stream.tty)
                return -59;
              var argp = SYSCALLS.get();
              HEAP32[argp >> 2] = 0;
              return 0;
            }
            case 21520: {
              if (!stream.tty)
                return -59;
              return -28;
            }
            case 21531: {
              var argp = SYSCALLS.get();
              return FS.ioctl(stream, op, argp);
            }
            case 21523: {
              if (!stream.tty)
                return -59;
              return 0;
            }
            case 21524: {
              if (!stream.tty)
                return -59;
              return 0;
            }
            default:
              abort("bad ioctl syscall " + op);
          }
        } catch (e) {
          if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError))
            throw e;
          return -e.errno;
        }
      }
      function ___syscall_mkdirat(dirfd, path2, mode) {
        try {
          path2 = SYSCALLS.getStr(path2);
          path2 = SYSCALLS.calculateAt(dirfd, path2);
          path2 = PATH.normalize(path2);
          if (path2[path2.length - 1] === "/")
            path2 = path2.substr(0, path2.length - 1);
          FS.mkdir(path2, mode, 0);
          return 0;
        } catch (e) {
          if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError))
            throw e;
          return -e.errno;
        }
      }
      function ___syscall_openat(dirfd, path2, flags, varargs) {
        SYSCALLS.varargs = varargs;
        try {
          path2 = SYSCALLS.getStr(path2);
          path2 = SYSCALLS.calculateAt(dirfd, path2);
          var mode = varargs ? SYSCALLS.get() : 0;
          return FS.open(path2, flags, mode).fd;
        } catch (e) {
          if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError))
            throw e;
          return -e.errno;
        }
      }
      function ___syscall_stat64(path2, buf) {
        try {
          path2 = SYSCALLS.getStr(path2);
          return SYSCALLS.doStat(FS.stat, path2, buf);
        } catch (e) {
          if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError))
            throw e;
          return -e.errno;
        }
      }
      function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {
      }
      function getShiftFromSize(size) {
        switch (size) {
          case 1:
            return 0;
          case 2:
            return 1;
          case 4:
            return 2;
          case 8:
            return 3;
          default:
            throw new TypeError("Unknown type size: " + size);
        }
      }
      function embind_init_charCodes() {
        var codes = new Array(256);
        for (var i2 = 0; i2 < 256; ++i2) {
          codes[i2] = String.fromCharCode(i2);
        }
        embind_charCodes = codes;
      }
      var embind_charCodes = void 0;
      function readLatin1String(ptr) {
        var ret = "";
        var c = ptr;
        while (HEAPU8[c]) {
          ret += embind_charCodes[HEAPU8[c++]];
        }
        return ret;
      }
      var awaitingDependencies = {};
      var registeredTypes = {};
      var typeDependencies = {};
      var char_0 = 48;
      var char_9 = 57;
      function makeLegalFunctionName(name) {
        if (name === void 0) {
          return "_unknown";
        }
        name = name.replace(/[^a-zA-Z0-9_]/g, "$");
        var f = name.charCodeAt(0);
        if (f >= char_0 && f <= char_9) {
          return "_" + name;
        }
        return name;
      }
      function createNamedFunction(name, body) {
        name = makeLegalFunctionName(name);
        return new Function("body", "return function " + name + '() {\n    "use strict";    return body.apply(this, arguments);\n};\n')(body);
      }
      function extendError(baseErrorType, errorName) {
        var errorClass = createNamedFunction(errorName, function(message) {
          this.name = errorName;
          this.message = message;
          var stack = new Error(message).stack;
          if (stack !== void 0) {
            this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
          }
        });
        errorClass.prototype = Object.create(baseErrorType.prototype);
        errorClass.prototype.constructor = errorClass;
        errorClass.prototype.toString = function() {
          if (this.message === void 0) {
            return this.name;
          } else {
            return this.name + ": " + this.message;
          }
        };
        return errorClass;
      }
      var BindingError = void 0;
      function throwBindingError(message) {
        throw new BindingError(message);
      }
      var InternalError = void 0;
      function throwInternalError(message) {
        throw new InternalError(message);
      }
      function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
        myTypes.forEach(function(type) {
          typeDependencies[type] = dependentTypes;
        });
        function onComplete(typeConverters2) {
          var myTypeConverters = getTypeConverters(typeConverters2);
          if (myTypeConverters.length !== myTypes.length) {
            throwInternalError("Mismatched type converter count");
          }
          for (var i2 = 0; i2 < myTypes.length; ++i2) {
            registerType(myTypes[i2], myTypeConverters[i2]);
          }
        }
        var typeConverters = new Array(dependentTypes.length);
        var unregisteredTypes = [];
        var registered = 0;
        dependentTypes.forEach((dt, i2) => {
          if (registeredTypes.hasOwnProperty(dt)) {
            typeConverters[i2] = registeredTypes[dt];
          } else {
            unregisteredTypes.push(dt);
            if (!awaitingDependencies.hasOwnProperty(dt)) {
              awaitingDependencies[dt] = [];
            }
            awaitingDependencies[dt].push(() => {
              typeConverters[i2] = registeredTypes[dt];
              ++registered;
              if (registered === unregisteredTypes.length) {
                onComplete(typeConverters);
              }
            });
          }
        });
        if (unregisteredTypes.length === 0) {
          onComplete(typeConverters);
        }
      }
      function registerType(rawType, registeredInstance, options = {}) {
        if (!("argPackAdvance" in registeredInstance)) {
          throw new TypeError("registerType registeredInstance requires argPackAdvance");
        }
        var name = registeredInstance.name;
        if (!rawType) {
          throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
        }
        if (registeredTypes.hasOwnProperty(rawType)) {
          if (options.ignoreDuplicateRegistrations) {
            return;
          } else {
            throwBindingError("Cannot register type '" + name + "' twice");
          }
        }
        registeredTypes[rawType] = registeredInstance;
        delete typeDependencies[rawType];
        if (awaitingDependencies.hasOwnProperty(rawType)) {
          var callbacks = awaitingDependencies[rawType];
          delete awaitingDependencies[rawType];
          callbacks.forEach((cb) => cb());
        }
      }
      function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
        var shift = getShiftFromSize(size);
        name = readLatin1String(name);
        registerType(rawType, {name, fromWireType: function(wt) {
          return !!wt;
        }, toWireType: function(destructors, o) {
          return o ? trueValue : falseValue;
        }, argPackAdvance: 8, readValueFromPointer: function(pointer) {
          var heap;
          if (size === 1) {
            heap = HEAP8;
          } else if (size === 2) {
            heap = HEAP16;
          } else if (size === 4) {
            heap = HEAP32;
          } else {
            throw new TypeError("Unknown boolean type size: " + name);
          }
          return this["fromWireType"](heap[pointer >> shift]);
        }, destructorFunction: null});
      }
      var emval_free_list = [];
      var emval_handle_array = [{}, {value: void 0}, {value: null}, {value: true}, {value: false}];
      function __emval_decref(handle) {
        if (handle > 4 && --emval_handle_array[handle].refcount === 0) {
          emval_handle_array[handle] = void 0;
          emval_free_list.push(handle);
        }
      }
      function count_emval_handles() {
        var count = 0;
        for (var i2 = 5; i2 < emval_handle_array.length; ++i2) {
          if (emval_handle_array[i2] !== void 0) {
            ++count;
          }
        }
        return count;
      }
      function get_first_emval() {
        for (var i2 = 5; i2 < emval_handle_array.length; ++i2) {
          if (emval_handle_array[i2] !== void 0) {
            return emval_handle_array[i2];
          }
        }
        return null;
      }
      function init_emval() {
        Module["count_emval_handles"] = count_emval_handles;
        Module["get_first_emval"] = get_first_emval;
      }
      var Emval = {toValue: (handle) => {
        if (!handle) {
          throwBindingError("Cannot use deleted val. handle = " + handle);
        }
        return emval_handle_array[handle].value;
      }, toHandle: (value) => {
        switch (value) {
          case void 0:
            return 1;
          case null:
            return 2;
          case true:
            return 3;
          case false:
            return 4;
          default: {
            var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
            emval_handle_array[handle] = {refcount: 1, value};
            return handle;
          }
        }
      }};
      function simpleReadValueFromPointer(pointer) {
        return this["fromWireType"](HEAPU32[pointer >> 2]);
      }
      function __embind_register_emval(rawType, name) {
        name = readLatin1String(name);
        registerType(rawType, {name, fromWireType: function(handle) {
          var rv = Emval.toValue(handle);
          __emval_decref(handle);
          return rv;
        }, toWireType: function(destructors, value) {
          return Emval.toHandle(value);
        }, argPackAdvance: 8, readValueFromPointer: simpleReadValueFromPointer, destructorFunction: null});
      }
      function floatReadValueFromPointer(name, shift) {
        switch (shift) {
          case 2:
            return function(pointer) {
              return this["fromWireType"](HEAPF32[pointer >> 2]);
            };
          case 3:
            return function(pointer) {
              return this["fromWireType"](HEAPF64[pointer >> 3]);
            };
          default:
            throw new TypeError("Unknown float type: " + name);
        }
      }
      function __embind_register_float(rawType, name, size) {
        var shift = getShiftFromSize(size);
        name = readLatin1String(name);
        registerType(rawType, {name, fromWireType: function(value) {
          return value;
        }, toWireType: function(destructors, value) {
          return value;
        }, argPackAdvance: 8, readValueFromPointer: floatReadValueFromPointer(name, shift), destructorFunction: null});
      }
      function new_(constructor, argumentList) {
        if (!(constructor instanceof Function)) {
          throw new TypeError("new_ called with constructor type " + typeof constructor + " which is not a function");
        }
        var dummy = createNamedFunction(constructor.name || "unknownFunctionName", function() {
        });
        dummy.prototype = constructor.prototype;
        var obj = new dummy();
        var r = constructor.apply(obj, argumentList);
        return r instanceof Object ? r : obj;
      }
      function runDestructors(destructors) {
        while (destructors.length) {
          var ptr = destructors.pop();
          var del = destructors.pop();
          del(ptr);
        }
      }
      function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
        var argCount = argTypes.length;
        if (argCount < 2) {
          throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
        }
        var isClassMethodFunc = argTypes[1] !== null && classType !== null;
        var needsDestructorStack = false;
        for (var i2 = 1; i2 < argTypes.length; ++i2) {
          if (argTypes[i2] !== null && argTypes[i2].destructorFunction === void 0) {
            needsDestructorStack = true;
            break;
          }
        }
        var returns = argTypes[0].name !== "void";
        var argsList = "";
        var argsListWired = "";
        for (var i2 = 0; i2 < argCount - 2; ++i2) {
          argsList += (i2 !== 0 ? ", " : "") + "arg" + i2;
          argsListWired += (i2 !== 0 ? ", " : "") + "arg" + i2 + "Wired";
        }
        var invokerFnBody = "return function " + makeLegalFunctionName(humanName) + "(" + argsList + ") {\nif (arguments.length !== " + (argCount - 2) + ") {\nthrowBindingError('function " + humanName + " called with ' + arguments.length + ' arguments, expected " + (argCount - 2) + " args!');\n}\n";
        if (needsDestructorStack) {
          invokerFnBody += "var destructors = [];\n";
        }
        var dtorStack = needsDestructorStack ? "destructors" : "null";
        var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
        var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
        if (isClassMethodFunc) {
          invokerFnBody += "var thisWired = classParam.toWireType(" + dtorStack + ", this);\n";
        }
        for (var i2 = 0; i2 < argCount - 2; ++i2) {
          invokerFnBody += "var arg" + i2 + "Wired = argType" + i2 + ".toWireType(" + dtorStack + ", arg" + i2 + "); // " + argTypes[i2 + 2].name + "\n";
          args1.push("argType" + i2);
          args2.push(argTypes[i2 + 2]);
        }
        if (isClassMethodFunc) {
          argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
        }
        invokerFnBody += (returns ? "var rv = " : "") + "invoker(fn" + (argsListWired.length > 0 ? ", " : "") + argsListWired + ");\n";
        if (needsDestructorStack) {
          invokerFnBody += "runDestructors(destructors);\n";
        } else {
          for (var i2 = isClassMethodFunc ? 1 : 2; i2 < argTypes.length; ++i2) {
            var paramName = i2 === 1 ? "thisWired" : "arg" + (i2 - 2) + "Wired";
            if (argTypes[i2].destructorFunction !== null) {
              invokerFnBody += paramName + "_dtor(" + paramName + "); // " + argTypes[i2].name + "\n";
              args1.push(paramName + "_dtor");
              args2.push(argTypes[i2].destructorFunction);
            }
          }
        }
        if (returns) {
          invokerFnBody += "var ret = retType.fromWireType(rv);\nreturn ret;\n";
        }
        invokerFnBody += "}\n";
        args1.push(invokerFnBody);
        var invokerFunction = new_(Function, args1).apply(null, args2);
        return invokerFunction;
      }
      function ensureOverloadTable(proto, methodName, humanName) {
        if (proto[methodName].overloadTable === void 0) {
          var prevFunc = proto[methodName];
          proto[methodName] = function() {
            if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
              throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
            }
            return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
          };
          proto[methodName].overloadTable = [];
          proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
        }
      }
      function exposePublicSymbol(name, value, numArguments) {
        if (Module.hasOwnProperty(name)) {
          if (numArguments === void 0 || Module[name].overloadTable !== void 0 && Module[name].overloadTable[numArguments] !== void 0) {
            throwBindingError("Cannot register public name '" + name + "' twice");
          }
          ensureOverloadTable(Module, name, name);
          if (Module.hasOwnProperty(numArguments)) {
            throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
          }
          Module[name].overloadTable[numArguments] = value;
        } else {
          Module[name] = value;
          if (numArguments !== void 0) {
            Module[name].numArguments = numArguments;
          }
        }
      }
      function heap32VectorToArray(count, firstElement) {
        var array = [];
        for (var i2 = 0; i2 < count; i2++) {
          array.push(HEAP32[(firstElement >> 2) + i2]);
        }
        return array;
      }
      function replacePublicSymbol(name, value, numArguments) {
        if (!Module.hasOwnProperty(name)) {
          throwInternalError("Replacing nonexistant public symbol");
        }
        if (Module[name].overloadTable !== void 0 && numArguments !== void 0) {
          Module[name].overloadTable[numArguments] = value;
        } else {
          Module[name] = value;
          Module[name].argCount = numArguments;
        }
      }
      function dynCallLegacy(sig, ptr, args) {
        var f = Module["dynCall_" + sig];
        return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
      }
      function dynCall(sig, ptr, args) {
        if (sig.includes("j")) {
          return dynCallLegacy(sig, ptr, args);
        }
        return getWasmTableEntry(ptr).apply(null, args);
      }
      function getDynCaller(sig, ptr) {
        var argCache = [];
        return function() {
          argCache.length = 0;
          Object.assign(argCache, arguments);
          return dynCall(sig, ptr, argCache);
        };
      }
      function embind__requireFunction(signature, rawFunction) {
        signature = readLatin1String(signature);
        function makeDynCaller() {
          if (signature.includes("j")) {
            return getDynCaller(signature, rawFunction);
          }
          return getWasmTableEntry(rawFunction);
        }
        var fp = makeDynCaller();
        if (typeof fp != "function") {
          throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction);
        }
        return fp;
      }
      var UnboundTypeError = void 0;
      function getTypeName(type) {
        var ptr = ___getTypeName(type);
        var rv = readLatin1String(ptr);
        _free(ptr);
        return rv;
      }
      function throwUnboundTypeError(message, types) {
        var unboundTypes = [];
        var seen = {};
        function visit(type) {
          if (seen[type]) {
            return;
          }
          if (registeredTypes[type]) {
            return;
          }
          if (typeDependencies[type]) {
            typeDependencies[type].forEach(visit);
            return;
          }
          unboundTypes.push(type);
          seen[type] = true;
        }
        types.forEach(visit);
        throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "]));
      }
      function __embind_register_function(name, argCount, rawArgTypesAddr, signature, rawInvoker, fn) {
        var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
        name = readLatin1String(name);
        rawInvoker = embind__requireFunction(signature, rawInvoker);
        exposePublicSymbol(name, function() {
          throwUnboundTypeError("Cannot call " + name + " due to unbound types", argTypes);
        }, argCount - 1);
        whenDependentTypesAreResolved([], argTypes, function(argTypes2) {
          var invokerArgsArray = [argTypes2[0], null].concat(argTypes2.slice(1));
          replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn), argCount - 1);
          return [];
        });
      }
      function integerReadValueFromPointer(name, shift, signed) {
        switch (shift) {
          case 0:
            return signed ? function readS8FromPointer(pointer) {
              return HEAP8[pointer];
            } : function readU8FromPointer(pointer) {
              return HEAPU8[pointer];
            };
          case 1:
            return signed ? function readS16FromPointer(pointer) {
              return HEAP16[pointer >> 1];
            } : function readU16FromPointer(pointer) {
              return HEAPU16[pointer >> 1];
            };
          case 2:
            return signed ? function readS32FromPointer(pointer) {
              return HEAP32[pointer >> 2];
            } : function readU32FromPointer(pointer) {
              return HEAPU32[pointer >> 2];
            };
          default:
            throw new TypeError("Unknown integer type: " + name);
        }
      }
      function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
        name = readLatin1String(name);
        var shift = getShiftFromSize(size);
        var fromWireType = (value) => value;
        if (minRange === 0) {
          var bitshift = 32 - 8 * size;
          fromWireType = (value) => value << bitshift >>> bitshift;
        }
        var isUnsignedType = name.includes("unsigned");
        var checkAssertions = (value, toTypeName) => {
        };
        var toWireType;
        if (isUnsignedType) {
          toWireType = function(destructors, value) {
            checkAssertions(value, this.name);
            return value >>> 0;
          };
        } else {
          toWireType = function(destructors, value) {
            checkAssertions(value, this.name);
            return value;
          };
        }
        registerType(primitiveType, {name, fromWireType, toWireType, argPackAdvance: 8, readValueFromPointer: integerReadValueFromPointer(name, shift, minRange !== 0), destructorFunction: null});
      }
      function __embind_register_memory_view(rawType, dataTypeIndex, name) {
        var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
        var TA = typeMapping[dataTypeIndex];
        function decodeMemoryView(handle) {
          handle = handle >> 2;
          var heap = HEAPU32;
          var size = heap[handle];
          var data = heap[handle + 1];
          return new TA(buffer, data, size);
        }
        name = readLatin1String(name);
        registerType(rawType, {name, fromWireType: decodeMemoryView, argPackAdvance: 8, readValueFromPointer: decodeMemoryView}, {ignoreDuplicateRegistrations: true});
      }
      function __embind_register_std_string(rawType, name) {
        name = readLatin1String(name);
        var stdStringIsUTF8 = name === "std::string";
        registerType(rawType, {name, fromWireType: function(value) {
          var length = HEAPU32[value >> 2];
          var str;
          if (stdStringIsUTF8) {
            var decodeStartPtr = value + 4;
            for (var i2 = 0; i2 <= length; ++i2) {
              var currentBytePtr = value + 4 + i2;
              if (i2 == length || HEAPU8[currentBytePtr] == 0) {
                var maxRead = currentBytePtr - decodeStartPtr;
                var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                if (str === void 0) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + 1;
              }
            }
          } else {
            var a = new Array(length);
            for (var i2 = 0; i2 < length; ++i2) {
              a[i2] = String.fromCharCode(HEAPU8[value + 4 + i2]);
            }
            str = a.join("");
          }
          _free(value);
          return str;
        }, toWireType: function(destructors, value) {
          if (value instanceof ArrayBuffer) {
            value = new Uint8Array(value);
          }
          var getLength;
          var valueIsOfTypeString = typeof value == "string";
          if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
            throwBindingError("Cannot pass non-string to std::string");
          }
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            getLength = () => lengthBytesUTF8(value);
          } else {
            getLength = () => value.length;
          }
          var length = getLength();
          var ptr = _malloc(4 + length + 1);
          HEAPU32[ptr >> 2] = length;
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            stringToUTF8(value, ptr + 4, length + 1);
          } else {
            if (valueIsOfTypeString) {
              for (var i2 = 0; i2 < length; ++i2) {
                var charCode = value.charCodeAt(i2);
                if (charCode > 255) {
                  _free(ptr);
                  throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
                }
                HEAPU8[ptr + 4 + i2] = charCode;
              }
            } else {
              for (var i2 = 0; i2 < length; ++i2) {
                HEAPU8[ptr + 4 + i2] = value[i2];
              }
            }
          }
          if (destructors !== null) {
            destructors.push(_free, ptr);
          }
          return ptr;
        }, argPackAdvance: 8, readValueFromPointer: simpleReadValueFromPointer, destructorFunction: function(ptr) {
          _free(ptr);
        }});
      }
      function __embind_register_std_wstring(rawType, charSize, name) {
        name = readLatin1String(name);
        var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
        if (charSize === 2) {
          decodeString = UTF16ToString;
          encodeString = stringToUTF16;
          lengthBytesUTF = lengthBytesUTF16;
          getHeap = () => HEAPU16;
          shift = 1;
        } else if (charSize === 4) {
          decodeString = UTF32ToString;
          encodeString = stringToUTF32;
          lengthBytesUTF = lengthBytesUTF32;
          getHeap = () => HEAPU32;
          shift = 2;
        }
        registerType(rawType, {name, fromWireType: function(value) {
          var length = HEAPU32[value >> 2];
          var HEAP = getHeap();
          var str;
          var decodeStartPtr = value + 4;
          for (var i2 = 0; i2 <= length; ++i2) {
            var currentBytePtr = value + 4 + i2 * charSize;
            if (i2 == length || HEAP[currentBytePtr >> shift] == 0) {
              var maxReadBytes = currentBytePtr - decodeStartPtr;
              var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
              if (str === void 0) {
                str = stringSegment;
              } else {
                str += String.fromCharCode(0);
                str += stringSegment;
              }
              decodeStartPtr = currentBytePtr + charSize;
            }
          }
          _free(value);
          return str;
        }, toWireType: function(destructors, value) {
          if (!(typeof value == "string")) {
            throwBindingError("Cannot pass non-string to C++ string type " + name);
          }
          var length = lengthBytesUTF(value);
          var ptr = _malloc(4 + length + charSize);
          HEAPU32[ptr >> 2] = length >> shift;
          encodeString(value, ptr + 4, length + charSize);
          if (destructors !== null) {
            destructors.push(_free, ptr);
          }
          return ptr;
        }, argPackAdvance: 8, readValueFromPointer: simpleReadValueFromPointer, destructorFunction: function(ptr) {
          _free(ptr);
        }});
      }
      function __embind_register_void(rawType, name) {
        name = readLatin1String(name);
        registerType(rawType, {isVoid: true, name, argPackAdvance: 0, fromWireType: function() {
          return void 0;
        }, toWireType: function(destructors, o) {
          return void 0;
        }});
      }
      function __emscripten_date_now() {
        return Date.now();
      }
      function requireRegisteredType(rawType, humanName) {
        var impl = registeredTypes[rawType];
        if (impl === void 0) {
          throwBindingError(humanName + " has unknown type " + getTypeName(rawType));
        }
        return impl;
      }
      function __emval_as(handle, returnType, destructorsRef) {
        handle = Emval.toValue(handle);
        returnType = requireRegisteredType(returnType, "emval::as");
        var destructors = [];
        var rd = Emval.toHandle(destructors);
        HEAP32[destructorsRef >> 2] = rd;
        return returnType["toWireType"](destructors, handle);
      }
      function __emval_run_destructors(handle) {
        var destructors = Emval.toValue(handle);
        runDestructors(destructors);
        __emval_decref(handle);
      }
      function _abort() {
        abort("");
      }
      var readAsmConstArgsArray = [];
      function readAsmConstArgs(sigPtr, buf) {
        readAsmConstArgsArray.length = 0;
        var ch;
        buf >>= 2;
        while (ch = HEAPU8[sigPtr++]) {
          buf += ch != 105 & buf;
          readAsmConstArgsArray.push(ch == 105 ? HEAP32[buf] : HEAPF64[buf++ >> 1]);
          ++buf;
        }
        return readAsmConstArgsArray;
      }
      function _emscripten_asm_const_int(code, sigPtr, argbuf) {
        var args = readAsmConstArgs(sigPtr, argbuf);
        return ASM_CONSTS[code].apply(null, args);
      }
      function _emscripten_asm_const_double(a0, a1, a2) {
        return _emscripten_asm_const_int(a0, a1, a2);
      }
      var _emscripten_get_now;
      if (ENVIRONMENT_IS_NODE) {
        _emscripten_get_now = () => {
          var t = process["hrtime"]();
          return t[0] * 1e3 + t[1] / 1e6;
        };
      } else
        _emscripten_get_now = () => performance.now();
      function _emscripten_memcpy_big(dest, src, num) {
        HEAPU8.copyWithin(dest, src, src + num);
      }
      function _emscripten_random() {
        return Math.random();
      }
      function abortOnCannotGrowMemory(requestedSize) {
        abort("OOM");
      }
      function _emscripten_resize_heap(requestedSize) {
        var oldSize = HEAPU8.length;
        abortOnCannotGrowMemory();
      }
      var GL = {counter: 1, buffers: [], programs: [], framebuffers: [], renderbuffers: [], textures: [], shaders: [], vaos: [], contexts: [], offscreenCanvases: {}, queries: [], stringCache: {}, unpackAlignment: 4, recordError: function recordError(errorCode) {
      }, getNewId: function(table) {
        var ret = GL.counter++;
        for (var i2 = table.length; i2 < ret; i2++) {
          table[i2] = null;
        }
        return ret;
      }, getSource: function(shader, count, string, length) {
        var source = "";
        for (var i2 = 0; i2 < count; ++i2) {
          var len = length ? HEAP32[length + i2 * 4 >> 2] : -1;
          source += UTF8ToString(HEAP32[string + i2 * 4 >> 2], len < 0 ? void 0 : len);
        }
        return source;
      }, createContext: function(canvas, webGLContextAttributes) {
        if (!canvas.getContextSafariWebGL2Fixed) {
          canvas.getContextSafariWebGL2Fixed = canvas.getContext;
          function fixedGetContext(ver, attrs) {
            var gl = canvas.getContextSafariWebGL2Fixed(ver, attrs);
            return ver == "webgl" == gl instanceof WebGLRenderingContext ? gl : null;
          }
          canvas.getContext = fixedGetContext;
        }
        var ctx = canvas.getContext("webgl", webGLContextAttributes);
        if (!ctx)
          return 0;
        var handle = GL.registerContext(ctx, webGLContextAttributes);
        return handle;
      }, registerContext: function(ctx, webGLContextAttributes) {
        var handle = GL.getNewId(GL.contexts);
        var context = {handle, attributes: webGLContextAttributes, version: webGLContextAttributes.majorVersion, GLctx: ctx};
        if (ctx.canvas)
          ctx.canvas.GLctxObject = context;
        GL.contexts[handle] = context;
        return handle;
      }, makeContextCurrent: function(contextHandle) {
        GL.currentContext = GL.contexts[contextHandle];
        Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx;
        return !(contextHandle && !GLctx);
      }, getContext: function(contextHandle) {
        return GL.contexts[contextHandle];
      }, deleteContext: function(contextHandle) {
        if (GL.currentContext === GL.contexts[contextHandle])
          GL.currentContext = null;
        if (typeof JSEvents == "object")
          JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
        if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas)
          GL.contexts[contextHandle].GLctx.canvas.GLctxObject = void 0;
        GL.contexts[contextHandle] = null;
      }};
      var JSEvents = {inEventHandler: 0, removeAllEventListeners: function() {
        for (var i2 = JSEvents.eventHandlers.length - 1; i2 >= 0; --i2) {
          JSEvents._removeHandler(i2);
        }
        JSEvents.eventHandlers = [];
        JSEvents.deferredCalls = [];
      }, registerRemoveEventListeners: function() {
        if (!JSEvents.removeEventListenersRegistered) {
          JSEvents.removeEventListenersRegistered = true;
        }
      }, deferredCalls: [], deferCall: function(targetFunction, precedence, argsList) {
        function arraysHaveEqualContent(arrA, arrB) {
          if (arrA.length != arrB.length)
            return false;
          for (var i3 in arrA) {
            if (arrA[i3] != arrB[i3])
              return false;
          }
          return true;
        }
        for (var i2 in JSEvents.deferredCalls) {
          var call = JSEvents.deferredCalls[i2];
          if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
            return;
          }
        }
        JSEvents.deferredCalls.push({targetFunction, precedence, argsList});
        JSEvents.deferredCalls.sort(function(x, y) {
          return x.precedence < y.precedence;
        });
      }, removeDeferredCalls: function(targetFunction) {
        for (var i2 = 0; i2 < JSEvents.deferredCalls.length; ++i2) {
          if (JSEvents.deferredCalls[i2].targetFunction == targetFunction) {
            JSEvents.deferredCalls.splice(i2, 1);
            --i2;
          }
        }
      }, canPerformEventHandlerRequests: function() {
        return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls;
      }, runDeferredCalls: function() {
        if (!JSEvents.canPerformEventHandlerRequests()) {
          return;
        }
        for (var i2 = 0; i2 < JSEvents.deferredCalls.length; ++i2) {
          var call = JSEvents.deferredCalls[i2];
          JSEvents.deferredCalls.splice(i2, 1);
          --i2;
          call.targetFunction.apply(null, call.argsList);
        }
      }, eventHandlers: [], removeAllHandlersOnTarget: function(target, eventTypeString) {
        for (var i2 = 0; i2 < JSEvents.eventHandlers.length; ++i2) {
          if (JSEvents.eventHandlers[i2].target == target && (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i2].eventTypeString)) {
            JSEvents._removeHandler(i2--);
          }
        }
      }, _removeHandler: function(i2) {
        var h = JSEvents.eventHandlers[i2];
        h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
        JSEvents.eventHandlers.splice(i2, 1);
      }, registerOrRemoveHandler: function(eventHandler) {
        var jsEventHandler = function jsEventHandler2(event) {
          ++JSEvents.inEventHandler;
          JSEvents.currentEventHandler = eventHandler;
          JSEvents.runDeferredCalls();
          eventHandler.handlerFunc(event);
          JSEvents.runDeferredCalls();
          --JSEvents.inEventHandler;
        };
        if (eventHandler.callbackfunc) {
          eventHandler.eventListenerFunc = jsEventHandler;
          eventHandler.target.addEventListener(eventHandler.eventTypeString, jsEventHandler, eventHandler.useCapture);
          JSEvents.eventHandlers.push(eventHandler);
          JSEvents.registerRemoveEventListeners();
        } else {
          for (var i2 = 0; i2 < JSEvents.eventHandlers.length; ++i2) {
            if (JSEvents.eventHandlers[i2].target == eventHandler.target && JSEvents.eventHandlers[i2].eventTypeString == eventHandler.eventTypeString) {
              JSEvents._removeHandler(i2--);
            }
          }
        }
      }, getNodeNameForTarget: function(target) {
        if (!target)
          return "";
        if (target == window)
          return "#window";
        if (target == screen)
          return "#screen";
        return target && target.nodeName ? target.nodeName : "";
      }, fullscreenEnabled: function() {
        return document.fullscreenEnabled || document.webkitFullscreenEnabled;
      }};
      var __emscripten_webgl_power_preferences = ["default", "low-power", "high-performance"];
      function maybeCStringToJsString(cString) {
        return cString > 2 ? UTF8ToString(cString) : cString;
      }
      var specialHTMLTargets = [0, typeof document != "undefined" ? document : 0, typeof window != "undefined" ? window : 0];
      function findEventTarget(target) {
        target = maybeCStringToJsString(target);
        var domElement = specialHTMLTargets[target] || (typeof document != "undefined" ? document.querySelector(target) : void 0);
        return domElement;
      }
      function findCanvasEventTarget(target) {
        return findEventTarget(target);
      }
      function _emscripten_webgl_do_create_context(target, attributes) {
        var a = attributes >> 2;
        var powerPreference = HEAP32[a + (24 >> 2)];
        var contextAttributes = {alpha: !!HEAP32[a + (0 >> 2)], depth: !!HEAP32[a + (4 >> 2)], stencil: !!HEAP32[a + (8 >> 2)], antialias: !!HEAP32[a + (12 >> 2)], premultipliedAlpha: !!HEAP32[a + (16 >> 2)], preserveDrawingBuffer: !!HEAP32[a + (20 >> 2)], powerPreference: __emscripten_webgl_power_preferences[powerPreference], failIfMajorPerformanceCaveat: !!HEAP32[a + (28 >> 2)], majorVersion: HEAP32[a + (32 >> 2)], minorVersion: HEAP32[a + (36 >> 2)], enableExtensionsByDefault: HEAP32[a + (40 >> 2)], explicitSwapControl: HEAP32[a + (44 >> 2)], proxyContextToMainThread: HEAP32[a + (48 >> 2)], renderViaOffscreenBackBuffer: HEAP32[a + (52 >> 2)]};
        var canvas = findCanvasEventTarget(target);
        if (!canvas) {
          return 0;
        }
        if (contextAttributes.explicitSwapControl) {
          return 0;
        }
        var contextHandle = GL.createContext(canvas, contextAttributes);
        return contextHandle;
      }
      function _emscripten_webgl_create_context(a0, a1) {
        return _emscripten_webgl_do_create_context(a0, a1);
      }
      function _emscripten_webgl_init_context_attributes(attributes) {
        var a = attributes >> 2;
        for (var i2 = 0; i2 < 56 >> 2; ++i2) {
          HEAP32[a + i2] = 0;
        }
        HEAP32[a + (0 >> 2)] = HEAP32[a + (4 >> 2)] = HEAP32[a + (12 >> 2)] = HEAP32[a + (16 >> 2)] = HEAP32[a + (32 >> 2)] = HEAP32[a + (40 >> 2)] = 1;
      }
      function _emscripten_webgl_make_context_current(contextHandle) {
        var success = GL.makeContextCurrent(contextHandle);
        return success ? 0 : -5;
      }
      var ENV = {};
      function getExecutableName() {
        return thisProgram || "./this.program";
      }
      function getEnvStrings() {
        if (!getEnvStrings.strings) {
          var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
          var env = {USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: lang, _: getExecutableName()};
          for (var x in ENV) {
            if (ENV[x] === void 0)
              delete env[x];
            else
              env[x] = ENV[x];
          }
          var strings = [];
          for (var x in env) {
            strings.push(x + "=" + env[x]);
          }
          getEnvStrings.strings = strings;
        }
        return getEnvStrings.strings;
      }
      function _environ_get(__environ, environ_buf) {
        var bufSize = 0;
        getEnvStrings().forEach(function(string, i2) {
          var ptr = environ_buf + bufSize;
          HEAPU32[__environ + i2 * 4 >> 2] = ptr;
          writeAsciiToMemory(string, ptr);
          bufSize += string.length + 1;
        });
        return 0;
      }
      function _environ_sizes_get(penviron_count, penviron_buf_size) {
        var strings = getEnvStrings();
        HEAPU32[penviron_count >> 2] = strings.length;
        var bufSize = 0;
        strings.forEach(function(string) {
          bufSize += string.length + 1;
        });
        HEAPU32[penviron_buf_size >> 2] = bufSize;
        return 0;
      }
      function _exit(status) {
        exit(status);
      }
      function _fd_close(fd) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          FS.close(stream);
          return 0;
        } catch (e) {
          if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError))
            throw e;
          return e.errno;
        }
      }
      function doReadv(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i2 = 0; i2 < iovcnt; i2++) {
          var ptr = HEAPU32[iov >> 2];
          var len = HEAPU32[iov + 4 >> 2];
          iov += 8;
          var curr = FS.read(stream, HEAP8, ptr, len, offset);
          if (curr < 0)
            return -1;
          ret += curr;
          if (curr < len)
            break;
        }
        return ret;
      }
      function _fd_read(fd, iov, iovcnt, pnum) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var num = doReadv(stream, iov, iovcnt);
          HEAP32[pnum >> 2] = num;
          return 0;
        } catch (e) {
          if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError))
            throw e;
          return e.errno;
        }
      }
      function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
        try {
          var offset = convertI32PairToI53Checked(offset_low, offset_high);
          if (isNaN(offset))
            return 61;
          var stream = SYSCALLS.getStreamFromFD(fd);
          FS.llseek(stream, offset, whence);
          tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
          if (stream.getdents && offset === 0 && whence === 0)
            stream.getdents = null;
          return 0;
        } catch (e) {
          if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError))
            throw e;
          return e.errno;
        }
      }
      function doWritev(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i2 = 0; i2 < iovcnt; i2++) {
          var ptr = HEAPU32[iov >> 2];
          var len = HEAPU32[iov + 4 >> 2];
          iov += 8;
          var curr = FS.write(stream, HEAP8, ptr, len, offset);
          if (curr < 0)
            return -1;
          ret += curr;
        }
        return ret;
      }
      function _fd_write(fd, iov, iovcnt, pnum) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var num = doWritev(stream, iov, iovcnt);
          HEAPU32[pnum >> 2] = num;
          return 0;
        } catch (e) {
          if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError))
            throw e;
          return e.errno;
        }
      }
      function _glActiveTexture(x0) {
        GLctx["activeTexture"](x0);
      }
      function _glAttachShader(program, shader) {
        GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
      }
      function _glBindAttribLocation(program, index, name) {
        GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name));
      }
      function _glBindBuffer(target, buffer2) {
        GLctx.bindBuffer(target, GL.buffers[buffer2]);
      }
      function _glBindFramebuffer(target, framebuffer) {
        GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer]);
      }
      function _glBindTexture(target, texture) {
        GLctx.bindTexture(target, GL.textures[texture]);
      }
      function _glBlendColor(x0, x1, x2, x3) {
        GLctx["blendColor"](x0, x1, x2, x3);
      }
      function _glBlendFunc(x0, x1) {
        GLctx["blendFunc"](x0, x1);
      }
      function _glBufferData(target, size, data, usage) {
        GLctx.bufferData(target, data ? HEAPU8.subarray(data, data + size) : size, usage);
      }
      function _glClearColor(x0, x1, x2, x3) {
        GLctx["clearColor"](x0, x1, x2, x3);
      }
      function _glColorMask(red, green, blue, alpha) {
        GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
      }
      function _glCompileShader(shader) {
        GLctx.compileShader(GL.shaders[shader]);
      }
      function _glCreateProgram() {
        var id = GL.getNewId(GL.programs);
        var program = GLctx.createProgram();
        program.name = id;
        program.maxUniformLength = program.maxAttributeLength = program.maxUniformBlockNameLength = 0;
        program.uniformIdCounter = 1;
        GL.programs[id] = program;
        return id;
      }
      function _glCreateShader(shaderType) {
        var id = GL.getNewId(GL.shaders);
        GL.shaders[id] = GLctx.createShader(shaderType);
        return id;
      }
      function _glDeleteShader(id) {
        if (!id)
          return;
        var shader = GL.shaders[id];
        if (!shader) {
          GL.recordError(1281);
          return;
        }
        GLctx.deleteShader(shader);
        GL.shaders[id] = null;
      }
      function _glDepthMask(flag) {
        GLctx.depthMask(!!flag);
      }
      function _glDetachShader(program, shader) {
        GLctx.detachShader(GL.programs[program], GL.shaders[shader]);
      }
      function _glDisable(x0) {
        GLctx["disable"](x0);
      }
      function _glDisableVertexAttribArray(index) {
        GLctx.disableVertexAttribArray(index);
      }
      function _glDrawArrays(mode, first, count) {
        GLctx.drawArrays(mode, first, count);
      }
      function _glDrawElements(mode, count, type, indices) {
        GLctx.drawElements(mode, count, type, indices);
      }
      function _glEnable(x0) {
        GLctx["enable"](x0);
      }
      function _glEnableVertexAttribArray(index) {
        GLctx.enableVertexAttribArray(index);
      }
      function _glFramebufferTexture2D(target, attachment, textarget, texture, level) {
        GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level);
      }
      function __glGenObject(n, buffers, createFunction, objectTable) {
        for (var i2 = 0; i2 < n; i2++) {
          var buffer2 = GLctx[createFunction]();
          var id = buffer2 && GL.getNewId(objectTable);
          if (buffer2) {
            buffer2.name = id;
            objectTable[id] = buffer2;
          } else {
            GL.recordError(1282);
          }
          HEAP32[buffers + i2 * 4 >> 2] = id;
        }
      }
      function _glGenBuffers(n, buffers) {
        __glGenObject(n, buffers, "createBuffer", GL.buffers);
      }
      function _glGenFramebuffers(n, ids) {
        __glGenObject(n, ids, "createFramebuffer", GL.framebuffers);
      }
      function _glGenTextures(n, textures) {
        __glGenObject(n, textures, "createTexture", GL.textures);
      }
      function writeI53ToI64(ptr, num) {
        HEAPU32[ptr >> 2] = num;
        HEAPU32[ptr + 4 >> 2] = (num - HEAPU32[ptr >> 2]) / 4294967296;
      }
      function emscriptenWebGLGet(name_, p, type) {
        if (!p) {
          GL.recordError(1281);
          return;
        }
        var ret = void 0;
        switch (name_) {
          case 36346:
            ret = 1;
            break;
          case 36344:
            return;
          case 36345:
            ret = 0;
            break;
          case 34466:
            var formats = GLctx.getParameter(34467);
            ret = formats ? formats.length : 0;
            break;
        }
        if (ret === void 0) {
          var result = GLctx.getParameter(name_);
          switch (typeof result) {
            case "number":
              ret = result;
              break;
            case "boolean":
              ret = result ? 1 : 0;
              break;
            case "string":
              GL.recordError(1280);
              return;
            case "object":
              if (result === null) {
                switch (name_) {
                  case 34964:
                  case 35725:
                  case 34965:
                  case 36006:
                  case 36007:
                  case 32873:
                  case 34229:
                  case 34068: {
                    ret = 0;
                    break;
                  }
                  default: {
                    GL.recordError(1280);
                    return;
                  }
                }
              } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
                for (var i2 = 0; i2 < result.length; ++i2) {
                  switch (type) {
                    case 0:
                      HEAP32[p + i2 * 4 >> 2] = result[i2];
                      break;
                    case 2:
                      HEAPF32[p + i2 * 4 >> 2] = result[i2];
                      break;
                    case 4:
                      HEAP8[p + i2 >> 0] = result[i2] ? 1 : 0;
                      break;
                  }
                }
                return;
              } else {
                ret = result.name | 0;
              }
              break;
          }
        }
        switch (type) {
          case 1:
            writeI53ToI64(p, ret);
            break;
          case 0:
            HEAP32[p >> 2] = ret;
            break;
          case 2:
            HEAPF32[p >> 2] = ret;
            break;
          case 4:
            HEAP8[p >> 0] = ret ? 1 : 0;
            break;
        }
      }
      function _glGetIntegerv(name_, p) {
        emscriptenWebGLGet(name_, p, 0);
      }
      function _glGetShaderInfoLog(shader, maxLength, length, infoLog) {
        var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
        var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
        if (length)
          HEAP32[length >> 2] = numBytesWrittenExclNull;
      }
      function _glGetShaderiv(shader, pname, p) {
        if (!p) {
          GL.recordError(1281);
          return;
        }
        if (pname == 35716) {
          var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
          var logLength = log ? log.length + 1 : 0;
          HEAP32[p >> 2] = logLength;
        } else if (pname == 35720) {
          var source = GLctx.getShaderSource(GL.shaders[shader]);
          var sourceLength = source ? source.length + 1 : 0;
          HEAP32[p >> 2] = sourceLength;
        } else {
          HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname);
        }
      }
      function jstoi_q(str) {
        return parseInt(str);
      }
      function webglGetLeftBracePos(name) {
        return name.slice(-1) == "]" && name.lastIndexOf("[");
      }
      function webglPrepareUniformLocationsBeforeFirstUse(program) {
        var uniformLocsById = program.uniformLocsById, uniformSizeAndIdsByName = program.uniformSizeAndIdsByName, i2, j;
        if (!uniformLocsById) {
          program.uniformLocsById = uniformLocsById = {};
          program.uniformArrayNamesById = {};
          for (i2 = 0; i2 < GLctx.getProgramParameter(program, 35718); ++i2) {
            var u = GLctx.getActiveUniform(program, i2);
            var nm = u.name;
            var sz = u.size;
            var lb = webglGetLeftBracePos(nm);
            var arrayName = lb > 0 ? nm.slice(0, lb) : nm;
            var id = program.uniformIdCounter;
            program.uniformIdCounter += sz;
            uniformSizeAndIdsByName[arrayName] = [sz, id];
            for (j = 0; j < sz; ++j) {
              uniformLocsById[id] = j;
              program.uniformArrayNamesById[id++] = arrayName;
            }
          }
        }
      }
      function _glGetUniformLocation(program, name) {
        name = UTF8ToString(name);
        if (program = GL.programs[program]) {
          webglPrepareUniformLocationsBeforeFirstUse(program);
          var uniformLocsById = program.uniformLocsById;
          var arrayIndex = 0;
          var uniformBaseName = name;
          var leftBrace = webglGetLeftBracePos(name);
          if (leftBrace > 0) {
            arrayIndex = jstoi_q(name.slice(leftBrace + 1)) >>> 0;
            uniformBaseName = name.slice(0, leftBrace);
          }
          var sizeAndId = program.uniformSizeAndIdsByName[uniformBaseName];
          if (sizeAndId && arrayIndex < sizeAndId[0]) {
            arrayIndex += sizeAndId[1];
            if (uniformLocsById[arrayIndex] = uniformLocsById[arrayIndex] || GLctx.getUniformLocation(program, name)) {
              return arrayIndex;
            }
          }
        }
        return -1;
      }
      function _glLinkProgram(program) {
        program = GL.programs[program];
        GLctx.linkProgram(program);
        program.uniformLocsById = 0;
        program.uniformSizeAndIdsByName = {};
      }
      function _glShaderSource(shader, count, string, length) {
        var source = GL.getSource(shader, count, string, length);
        GLctx.shaderSource(GL.shaders[shader], source);
      }
      function _glStencilMask(x0) {
        GLctx["stencilMask"](x0);
      }
      function computeUnpackAlignedImageSize(width, height, sizePerPixel, alignment) {
        function roundedToNextMultipleOf(x, y) {
          return x + y - 1 & -y;
        }
        var plainRowSize = width * sizePerPixel;
        var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
        return height * alignedRowSize;
      }
      function __colorChannelsInGlTextureFormat(format) {
        var colorChannels = {5: 3, 6: 4, 8: 2, 29502: 3, 29504: 4};
        return colorChannels[format - 6402] || 1;
      }
      function heapObjectForWebGLType(type) {
        type -= 5120;
        if (type == 1)
          return HEAPU8;
        if (type == 4)
          return HEAP32;
        if (type == 6)
          return HEAPF32;
        if (type == 5 || type == 28922)
          return HEAPU32;
        return HEAPU16;
      }
      function heapAccessShiftForWebGLHeap(heap) {
        return 31 - Math.clz32(heap.BYTES_PER_ELEMENT);
      }
      function emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) {
        var heap = heapObjectForWebGLType(type);
        var shift = heapAccessShiftForWebGLHeap(heap);
        var byteSize = 1 << shift;
        var sizePerPixel = __colorChannelsInGlTextureFormat(format) * byteSize;
        var bytes = computeUnpackAlignedImageSize(width, height, sizePerPixel, GL.unpackAlignment);
        return heap.subarray(pixels >> shift, pixels + bytes >> shift);
      }
      function _glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
        GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels) : null);
      }
      function _glTexParameteri(x0, x1, x2) {
        GLctx["texParameteri"](x0, x1, x2);
      }
      function _glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
        var pixelData = null;
        if (pixels)
          pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels);
        GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
      }
      function webglGetUniformLocation(location) {
        var p = GLctx.currentProgram;
        var webglLoc = p.uniformLocsById[location];
        if (typeof webglLoc == "number") {
          p.uniformLocsById[location] = webglLoc = GLctx.getUniformLocation(p, p.uniformArrayNamesById[location] + (webglLoc > 0 ? "[" + webglLoc + "]" : ""));
        }
        return webglLoc;
      }
      function _glUniform1f(location, v0) {
        GLctx.uniform1f(webglGetUniformLocation(location), v0);
      }
      var miniTempWebGLFloatBuffers = [];
      function _glUniform1fv(location, count, value) {
        if (count <= 288) {
          var view = miniTempWebGLFloatBuffers[count - 1];
          for (var i2 = 0; i2 < count; ++i2) {
            view[i2] = HEAPF32[value + 4 * i2 >> 2];
          }
        } else {
          var view = HEAPF32.subarray(value >> 2, value + count * 4 >> 2);
        }
        GLctx.uniform1fv(webglGetUniformLocation(location), view);
      }
      function _glUniform1i(location, v0) {
        GLctx.uniform1i(webglGetUniformLocation(location), v0);
      }
      function _glUniform2f(location, v0, v1) {
        GLctx.uniform2f(webglGetUniformLocation(location), v0, v1);
      }
      function _glUniform2fv(location, count, value) {
        if (count <= 144) {
          var view = miniTempWebGLFloatBuffers[2 * count - 1];
          for (var i2 = 0; i2 < 2 * count; i2 += 2) {
            view[i2] = HEAPF32[value + 4 * i2 >> 2];
            view[i2 + 1] = HEAPF32[value + (4 * i2 + 4) >> 2];
          }
        } else {
          var view = HEAPF32.subarray(value >> 2, value + count * 8 >> 2);
        }
        GLctx.uniform2fv(webglGetUniformLocation(location), view);
      }
      function _glUniform3f(location, v0, v1, v2) {
        GLctx.uniform3f(webglGetUniformLocation(location), v0, v1, v2);
      }
      function _glUniform3fv(location, count, value) {
        if (count <= 96) {
          var view = miniTempWebGLFloatBuffers[3 * count - 1];
          for (var i2 = 0; i2 < 3 * count; i2 += 3) {
            view[i2] = HEAPF32[value + 4 * i2 >> 2];
            view[i2 + 1] = HEAPF32[value + (4 * i2 + 4) >> 2];
            view[i2 + 2] = HEAPF32[value + (4 * i2 + 8) >> 2];
          }
        } else {
          var view = HEAPF32.subarray(value >> 2, value + count * 12 >> 2);
        }
        GLctx.uniform3fv(webglGetUniformLocation(location), view);
      }
      function _glUniform4f(location, v0, v1, v2, v3) {
        GLctx.uniform4f(webglGetUniformLocation(location), v0, v1, v2, v3);
      }
      function _glUniform4fv(location, count, value) {
        if (count <= 72) {
          var view = miniTempWebGLFloatBuffers[4 * count - 1];
          var heap = HEAPF32;
          value >>= 2;
          for (var i2 = 0; i2 < 4 * count; i2 += 4) {
            var dst = value + i2;
            view[i2] = heap[dst];
            view[i2 + 1] = heap[dst + 1];
            view[i2 + 2] = heap[dst + 2];
            view[i2 + 3] = heap[dst + 3];
          }
        } else {
          var view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2);
        }
        GLctx.uniform4fv(webglGetUniformLocation(location), view);
      }
      function _glUniformMatrix4fv(location, count, transpose, value) {
        if (count <= 18) {
          var view = miniTempWebGLFloatBuffers[16 * count - 1];
          var heap = HEAPF32;
          value >>= 2;
          for (var i2 = 0; i2 < 16 * count; i2 += 16) {
            var dst = value + i2;
            view[i2] = heap[dst];
            view[i2 + 1] = heap[dst + 1];
            view[i2 + 2] = heap[dst + 2];
            view[i2 + 3] = heap[dst + 3];
            view[i2 + 4] = heap[dst + 4];
            view[i2 + 5] = heap[dst + 5];
            view[i2 + 6] = heap[dst + 6];
            view[i2 + 7] = heap[dst + 7];
            view[i2 + 8] = heap[dst + 8];
            view[i2 + 9] = heap[dst + 9];
            view[i2 + 10] = heap[dst + 10];
            view[i2 + 11] = heap[dst + 11];
            view[i2 + 12] = heap[dst + 12];
            view[i2 + 13] = heap[dst + 13];
            view[i2 + 14] = heap[dst + 14];
            view[i2 + 15] = heap[dst + 15];
          }
        } else {
          var view = HEAPF32.subarray(value >> 2, value + count * 64 >> 2);
        }
        GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, view);
      }
      function _glUseProgram(program) {
        program = GL.programs[program];
        GLctx.useProgram(program);
        GLctx.currentProgram = program;
      }
      function _glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
        GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
      }
      function _glViewport(x0, x1, x2, x3) {
        GLctx["viewport"](x0, x1, x2, x3);
      }
      function _setTempRet0(val) {
      }
      function __isLeapYear(year) {
        return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      }
      function __arraySum(array, index) {
        var sum = 0;
        for (var i2 = 0; i2 <= index; sum += array[i2++]) {
        }
        return sum;
      }
      var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      function __addDays(date, days) {
        var newDate = new Date(date.getTime());
        while (days > 0) {
          var leap = __isLeapYear(newDate.getFullYear());
          var currentMonth = newDate.getMonth();
          var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
          if (days > daysInCurrentMonth - newDate.getDate()) {
            days -= daysInCurrentMonth - newDate.getDate() + 1;
            newDate.setDate(1);
            if (currentMonth < 11) {
              newDate.setMonth(currentMonth + 1);
            } else {
              newDate.setMonth(0);
              newDate.setFullYear(newDate.getFullYear() + 1);
            }
          } else {
            newDate.setDate(newDate.getDate() + days);
            return newDate;
          }
        }
        return newDate;
      }
      function _strftime(s, maxsize, format, tm) {
        var tm_zone = HEAP32[tm + 40 >> 2];
        var date = {tm_sec: HEAP32[tm >> 2], tm_min: HEAP32[tm + 4 >> 2], tm_hour: HEAP32[tm + 8 >> 2], tm_mday: HEAP32[tm + 12 >> 2], tm_mon: HEAP32[tm + 16 >> 2], tm_year: HEAP32[tm + 20 >> 2], tm_wday: HEAP32[tm + 24 >> 2], tm_yday: HEAP32[tm + 28 >> 2], tm_isdst: HEAP32[tm + 32 >> 2], tm_gmtoff: HEAP32[tm + 36 >> 2], tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""};
        var pattern = UTF8ToString(format);
        var EXPANSION_RULES_1 = {"%c": "%a %b %d %H:%M:%S %Y", "%D": "%m/%d/%y", "%F": "%Y-%m-%d", "%h": "%b", "%r": "%I:%M:%S %p", "%R": "%H:%M", "%T": "%H:%M:%S", "%x": "%m/%d/%y", "%X": "%H:%M:%S", "%Ec": "%c", "%EC": "%C", "%Ex": "%m/%d/%y", "%EX": "%H:%M:%S", "%Ey": "%y", "%EY": "%Y", "%Od": "%d", "%Oe": "%e", "%OH": "%H", "%OI": "%I", "%Om": "%m", "%OM": "%M", "%OS": "%S", "%Ou": "%u", "%OU": "%U", "%OV": "%V", "%Ow": "%w", "%OW": "%W", "%Oy": "%y"};
        for (var rule in EXPANSION_RULES_1) {
          pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
        }
        var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        function leadingSomething(value, digits, character) {
          var str = typeof value == "number" ? value.toString() : value || "";
          while (str.length < digits) {
            str = character[0] + str;
          }
          return str;
        }
        function leadingNulls(value, digits) {
          return leadingSomething(value, digits, "0");
        }
        function compareByDay(date1, date2) {
          function sgn(value) {
            return value < 0 ? -1 : value > 0 ? 1 : 0;
          }
          var compare3;
          if ((compare3 = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
            if ((compare3 = sgn(date1.getMonth() - date2.getMonth())) === 0) {
              compare3 = sgn(date1.getDate() - date2.getDate());
            }
          }
          return compare3;
        }
        function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0:
              return new Date(janFourth.getFullYear() - 1, 11, 29);
            case 1:
              return janFourth;
            case 2:
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3:
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4:
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5:
              return new Date(janFourth.getFullYear() - 1, 11, 31);
            case 6:
              return new Date(janFourth.getFullYear() - 1, 11, 30);
          }
        }
        function getWeekBasedYear(date2) {
          var thisDate = __addDays(new Date(date2.tm_year + 1900, 0, 1), date2.tm_yday);
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear() + 1;
            } else {
              return thisDate.getFullYear();
            }
          } else {
            return thisDate.getFullYear() - 1;
          }
        }
        var EXPANSION_RULES_2 = {"%a": function(date2) {
          return WEEKDAYS[date2.tm_wday].substring(0, 3);
        }, "%A": function(date2) {
          return WEEKDAYS[date2.tm_wday];
        }, "%b": function(date2) {
          return MONTHS[date2.tm_mon].substring(0, 3);
        }, "%B": function(date2) {
          return MONTHS[date2.tm_mon];
        }, "%C": function(date2) {
          var year = date2.tm_year + 1900;
          return leadingNulls(year / 100 | 0, 2);
        }, "%d": function(date2) {
          return leadingNulls(date2.tm_mday, 2);
        }, "%e": function(date2) {
          return leadingSomething(date2.tm_mday, 2, " ");
        }, "%g": function(date2) {
          return getWeekBasedYear(date2).toString().substring(2);
        }, "%G": function(date2) {
          return getWeekBasedYear(date2);
        }, "%H": function(date2) {
          return leadingNulls(date2.tm_hour, 2);
        }, "%I": function(date2) {
          var twelveHour = date2.tm_hour;
          if (twelveHour == 0)
            twelveHour = 12;
          else if (twelveHour > 12)
            twelveHour -= 12;
          return leadingNulls(twelveHour, 2);
        }, "%j": function(date2) {
          return leadingNulls(date2.tm_mday + __arraySum(__isLeapYear(date2.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date2.tm_mon - 1), 3);
        }, "%m": function(date2) {
          return leadingNulls(date2.tm_mon + 1, 2);
        }, "%M": function(date2) {
          return leadingNulls(date2.tm_min, 2);
        }, "%n": function() {
          return "\n";
        }, "%p": function(date2) {
          if (date2.tm_hour >= 0 && date2.tm_hour < 12) {
            return "AM";
          } else {
            return "PM";
          }
        }, "%S": function(date2) {
          return leadingNulls(date2.tm_sec, 2);
        }, "%t": function() {
          return "	";
        }, "%u": function(date2) {
          return date2.tm_wday || 7;
        }, "%U": function(date2) {
          var days = date2.tm_yday + 7 - date2.tm_wday;
          return leadingNulls(Math.floor(days / 7), 2);
        }, "%V": function(date2) {
          var val = Math.floor((date2.tm_yday + 7 - (date2.tm_wday + 6) % 7) / 7);
          if ((date2.tm_wday + 371 - date2.tm_yday - 2) % 7 <= 2) {
            val++;
          }
          if (!val) {
            val = 52;
            var dec31 = (date2.tm_wday + 7 - date2.tm_yday - 1) % 7;
            if (dec31 == 4 || dec31 == 5 && __isLeapYear(date2.tm_year % 400 - 1)) {
              val++;
            }
          } else if (val == 53) {
            var jan1 = (date2.tm_wday + 371 - date2.tm_yday) % 7;
            if (jan1 != 4 && (jan1 != 3 || !__isLeapYear(date2.tm_year)))
              val = 1;
          }
          return leadingNulls(val, 2);
        }, "%w": function(date2) {
          return date2.tm_wday;
        }, "%W": function(date2) {
          var days = date2.tm_yday + 7 - (date2.tm_wday + 6) % 7;
          return leadingNulls(Math.floor(days / 7), 2);
        }, "%y": function(date2) {
          return (date2.tm_year + 1900).toString().substring(2);
        }, "%Y": function(date2) {
          return date2.tm_year + 1900;
        }, "%z": function(date2) {
          var off2 = date2.tm_gmtoff;
          var ahead = off2 >= 0;
          off2 = Math.abs(off2) / 60;
          off2 = off2 / 60 * 100 + off2 % 60;
          return (ahead ? "+" : "-") + String("0000" + off2).slice(-4);
        }, "%Z": function(date2) {
          return date2.tm_zone;
        }, "%%": function() {
          return "%";
        }};
        pattern = pattern.replace(/%%/g, "\0\0");
        for (var rule in EXPANSION_RULES_2) {
          if (pattern.includes(rule)) {
            pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
          }
        }
        pattern = pattern.replace(/\0\0/g, "%");
        var bytes = intArrayFromString(pattern, false);
        if (bytes.length > maxsize) {
          return 0;
        }
        writeArrayToMemory(bytes, s);
        return bytes.length - 1;
      }
      function _strftime_l(s, maxsize, format, tm) {
        return _strftime(s, maxsize, format, tm);
      }
      var FSNode = function(parent, name, mode, rdev) {
        if (!parent) {
          parent = this;
        }
        this.parent = parent;
        this.mount = parent.mount;
        this.mounted = null;
        this.id = FS.nextInode++;
        this.name = name;
        this.mode = mode;
        this.node_ops = {};
        this.stream_ops = {};
        this.rdev = rdev;
      };
      var readMode = 292 | 73;
      var writeMode = 146;
      Object.defineProperties(FSNode.prototype, {read: {get: function() {
        return (this.mode & readMode) === readMode;
      }, set: function(val) {
        val ? this.mode |= readMode : this.mode &= ~readMode;
      }}, write: {get: function() {
        return (this.mode & writeMode) === writeMode;
      }, set: function(val) {
        val ? this.mode |= writeMode : this.mode &= ~writeMode;
      }}, isFolder: {get: function() {
        return FS.isDir(this.mode);
      }}, isDevice: {get: function() {
        return FS.isChrdev(this.mode);
      }}});
      FS.FSNode = FSNode;
      FS.staticInit();
      Module["FS_createPath"] = FS.createPath;
      Module["FS_createDataFile"] = FS.createDataFile;
      Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
      Module["FS_unlink"] = FS.unlink;
      Module["FS_createLazyFile"] = FS.createLazyFile;
      Module["FS_createDevice"] = FS.createDevice;
      embind_init_charCodes();
      BindingError = Module["BindingError"] = extendError(Error, "BindingError");
      InternalError = Module["InternalError"] = extendError(Error, "InternalError");
      init_emval();
      UnboundTypeError = Module["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
      var GLctx;
      var miniTempWebGLFloatBuffersStorage = new Float32Array(288);
      for (var i = 0; i < 288; ++i) {
        miniTempWebGLFloatBuffers[i] = miniTempWebGLFloatBuffersStorage.subarray(0, i + 1);
      }
      function intArrayFromString(stringy, dontAddNull, length) {
        var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
        var u8array = new Array(len);
        var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
        if (dontAddNull)
          u8array.length = numBytesWritten;
        return u8array;
      }
      var asmLibraryArg = {w: ___syscall_fcntl64, L: ___syscall_ftruncate64, Y: ___syscall_ioctl, Q: ___syscall_mkdirat, U: ___syscall_openat, P: ___syscall_stat64, M: __embind_register_bigint, $: __embind_register_bool, _: __embind_register_emval, x: __embind_register_float, j: __embind_register_function, i: __embind_register_integer, d: __embind_register_memory_view, y: __embind_register_std_string, t: __embind_register_std_wstring, aa: __embind_register_void, V: __emscripten_date_now, C: __emval_as, Z: __emval_decref, ma: __emval_run_destructors, H: _abort, ba: _emscripten_asm_const_double, g: _emscripten_asm_const_int, Aa: _emscripten_get_now, T: _emscripten_memcpy_big, p: _emscripten_random, s: _emscripten_resize_heap, Ca: _emscripten_webgl_create_context, Da: _emscripten_webgl_init_context_attributes, Ba: _emscripten_webgl_make_context_current, R: _environ_get, S: _environ_sizes_get, I: _exit, v: _fd_close, X: _fd_read, K: _fd_seek, W: _fd_write, b: _glActiveTexture, z: _glAttachShader, da: _glBindAttribLocation, u: _glBindBuffer, h: _glBindFramebuffer, e: _glBindTexture, Ia: _glBlendColor, ya: _glBlendFunc, sa: _glBufferData, Ha: _glClearColor, Ga: _glColorMask, ga: _glCompileShader, ea: _glCreateProgram, ia: _glCreateShader, B: _glDeleteShader, Fa: _glDepthMask, D: _glDetachShader, r: _glDisable, la: _glDisableVertexAttribArray, ja: _glDrawArrays, ka: _glDrawElements, za: _glEnable, G: _glEnableVertexAttribArray, oa: _glFramebufferTexture2D, ta: _glGenBuffers, pa: _glGenFramebuffers, ra: _glGenTextures, J: _glGetIntegerv, fa: _glGetShaderInfoLog, A: _glGetShaderiv, a: _glGetUniformLocation, ca: _glLinkProgram, ha: _glShaderSource, Ea: _glStencilMask, qa: _glTexImage2D, o: _glTexParameteri, q: _glTexSubImage2D, m: _glUniform1f, xa: _glUniform1fv, f: _glUniform1i, l: _glUniform2f, wa: _glUniform2fv, F: _glUniform3f, n: _glUniform3fv, va: _glUniform4f, ua: _glUniform4fv, E: _glUniformMatrix4fv, c: _glUseProgram, na: _glVertexAttribPointer, k: _glViewport, N: _setTempRet0, O: _strftime_l};
      var asm = createWasm();
      var ___wasm_call_ctors = Module["___wasm_call_ctors"] = function() {
        return (___wasm_call_ctors = Module["___wasm_call_ctors"] = Module["asm"]["Ka"]).apply(null, arguments);
      };
      var _free = Module["_free"] = function() {
        return (_free = Module["_free"] = Module["asm"]["La"]).apply(null, arguments);
      };
      var _malloc = Module["_malloc"] = function() {
        return (_malloc = Module["_malloc"] = Module["asm"]["Ma"]).apply(null, arguments);
      };
      var ___errno_location = Module["___errno_location"] = function() {
        return (___errno_location = Module["___errno_location"] = Module["asm"]["Na"]).apply(null, arguments);
      };
      var _audioBufferCallback = Module["_audioBufferCallback"] = function() {
        return (_audioBufferCallback = Module["_audioBufferCallback"] = Module["asm"]["Oa"]).apply(null, arguments);
      };
      var ___getTypeName = Module["___getTypeName"] = function() {
        return (___getTypeName = Module["___getTypeName"] = Module["asm"]["Pa"]).apply(null, arguments);
      };
      var ___embind_register_native_and_builtin_types = Module["___embind_register_native_and_builtin_types"] = function() {
        return (___embind_register_native_and_builtin_types = Module["___embind_register_native_and_builtin_types"] = Module["asm"]["Qa"]).apply(null, arguments);
      };
      var dynCall_jiji = Module["dynCall_jiji"] = function() {
        return (dynCall_jiji = Module["dynCall_jiji"] = Module["asm"]["Sa"]).apply(null, arguments);
      };
      var dynCall_viijii = Module["dynCall_viijii"] = function() {
        return (dynCall_viijii = Module["dynCall_viijii"] = Module["asm"]["Ta"]).apply(null, arguments);
      };
      var dynCall_iiiiij = Module["dynCall_iiiiij"] = function() {
        return (dynCall_iiiiij = Module["dynCall_iiiiij"] = Module["asm"]["Ua"]).apply(null, arguments);
      };
      var dynCall_iiiiijj = Module["dynCall_iiiiijj"] = function() {
        return (dynCall_iiiiijj = Module["dynCall_iiiiijj"] = Module["asm"]["Va"]).apply(null, arguments);
      };
      var dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = function() {
        return (dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = Module["asm"]["Wa"]).apply(null, arguments);
      };
      var ___emscripten_embedded_file_data = Module["___emscripten_embedded_file_data"] = 17816;
      Module["addRunDependency"] = addRunDependency;
      Module["removeRunDependency"] = removeRunDependency;
      Module["FS_createPath"] = FS.createPath;
      Module["FS_createDataFile"] = FS.createDataFile;
      Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
      Module["FS_createLazyFile"] = FS.createLazyFile;
      Module["FS_createDevice"] = FS.createDevice;
      Module["FS_unlink"] = FS.unlink;
      var calledRun;
      function ExitStatus(status) {
        this.name = "ExitStatus";
        this.message = "Program terminated with exit(" + status + ")";
        this.status = status;
      }
      dependenciesFulfilled = function runCaller() {
        if (!calledRun)
          run();
        if (!calledRun)
          dependenciesFulfilled = runCaller;
      };
      function run(args) {
        if (runDependencies > 0) {
          return;
        }
        preRun();
        if (runDependencies > 0) {
          return;
        }
        function doRun() {
          if (calledRun)
            return;
          calledRun = true;
          Module["calledRun"] = true;
          if (ABORT)
            return;
          initRuntime();
          readyPromiseResolve(Module);
          if (Module["onRuntimeInitialized"])
            Module["onRuntimeInitialized"]();
          postRun();
        }
        if (Module["setStatus"]) {
          Module["setStatus"]("Running...");
          setTimeout(function() {
            setTimeout(function() {
              Module["setStatus"]("");
            }, 1);
            doRun();
          }, 1);
        } else {
          doRun();
        }
      }
      Module["run"] = run;
      function exit(status, implicit) {
        procExit(status);
      }
      function procExit(code) {
        if (!keepRuntimeAlive()) {
          if (Module["onExit"])
            Module["onExit"](code);
          ABORT = true;
        }
        quit_(code, new ExitStatus(code));
      }
      if (Module["preInit"]) {
        if (typeof Module["preInit"] == "function")
          Module["preInit"] = [Module["preInit"]];
        while (Module["preInit"].length > 0) {
          Module["preInit"].pop()();
        }
      }
      run();
      (function() {
        Module._defaultConfig = {"video-system": "auto", "video-ntsc": false, "video-tv": false, "video-brightness": 0, "video-color": 0, "video-contrast": 0, "video-gamma": 0, "video-sharpness": 0.2, "video-noise": 0.3, "video-convergence": 0.4, "video-scanlines": 0.1, "video-glow": 0.2, "system-port-2": "zapper"};
        Module.loadGame = function(uint8Array, filename) {
          const path2 = "/tmp/" + (filename || "rom");
          FS.writeFile(path2, uint8Array);
          Module._startGame(path2);
        };
        Module.downloadGame = function(url, init2, filename) {
          filename = filename || url.split("/").pop();
          fetch(url, init2).then((response) => {
            if (response.ok) {
              response.arrayBuffer().then((buffer2) => {
                Module.loadGame(new Uint8Array(buffer2), filename);
              });
            } else {
              throw Error;
            }
          });
        };
        Module.eventListeners = {};
        Module.addEventListener = function(name, listener) {
          Module.eventListeners[name] = listener;
        };
        Module.removeEventListener = function(listener) {
          for (let k in Module.eventListeners) {
            if (Module.eventListeners[k] == listener) {
              delete Module.eventListeners[k];
            }
          }
        };
        Module.exportSaveFiles = function() {
          Module._saveGameSave();
          const dir = "/tmp/sav/";
          const result = {};
          for (let name of FS.readdir(dir)) {
            if (FS.isFile(FS.stat(dir + name).mode)) {
              result[name] = FS.readFile(dir + name);
            }
          }
          return result;
        };
        Module.importSaveFiles = function(states) {
          Module.deleteSaveFiles();
          const dir = "/tmp/sav/";
          for (let name in states) {
            FS.writeFile(dir + name, states[name]);
          }
          Module._loadGameSave();
        };
        Module.deleteSaveFiles = function() {
          const dir = "/tmp/sav";
          FS.unmount(dir);
          FS.mount(MEMFS, {}, dir);
        };
      })();
      return FCEUX3.ready;
    };
  })();
  module.exports = FCEUX2;
});
var FCEUX = fceux.FCEUX;
export default fceux;
export {FCEUX, fceux as __moduleExports};
