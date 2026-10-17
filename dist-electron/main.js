"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const electron = require("electron");
const path = require("node:path");
const classicLevel = require("classic-level");
const require$$0$1 = require("node:crypto");
const ethers = require("ethers");
const fs = require("node:fs/promises");
const web3_js = require("@solana/web3.js");
var src = {};
var sha256$3 = {};
var sha2 = {};
var _md = {};
var utils$1 = {};
var cryptoNode = {};
Object.defineProperty(cryptoNode, "__esModule", { value: true });
cryptoNode.crypto = void 0;
const nc = require$$0$1;
cryptoNode.crypto = nc && typeof nc === "object" && "webcrypto" in nc ? nc.webcrypto : nc && typeof nc === "object" && "randomBytes" in nc ? nc : void 0;
(function(exports) {
  /*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.wrapXOFConstructorWithOpts = exports.wrapConstructorWithOpts = exports.wrapConstructor = exports.Hash = exports.nextTick = exports.swap32IfBE = exports.byteSwapIfBE = exports.swap8IfBE = exports.isLE = void 0;
  exports.isBytes = isBytes2;
  exports.anumber = anumber2;
  exports.abytes = abytes2;
  exports.ahash = ahash2;
  exports.aexists = aexists2;
  exports.aoutput = aoutput2;
  exports.u8 = u8;
  exports.u32 = u32;
  exports.clean = clean2;
  exports.createView = createView2;
  exports.rotr = rotr2;
  exports.rotl = rotl2;
  exports.byteSwap = byteSwap;
  exports.byteSwap32 = byteSwap32;
  exports.bytesToHex = bytesToHex2;
  exports.hexToBytes = hexToBytes2;
  exports.asyncLoop = asyncLoop;
  exports.utf8ToBytes = utf8ToBytes;
  exports.bytesToUtf8 = bytesToUtf8;
  exports.toBytes = toBytes;
  exports.kdfInputToBytes = kdfInputToBytes;
  exports.concatBytes = concatBytes2;
  exports.checkOpts = checkOpts2;
  exports.createHasher = createHasher2;
  exports.createOptHasher = createOptHasher;
  exports.createXOFer = createXOFer;
  exports.randomBytes = randomBytes2;
  const crypto_1 = cryptoNode;
  function isBytes2(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
  }
  function anumber2(n) {
    if (!Number.isSafeInteger(n) || n < 0)
      throw new Error("positive integer expected, got " + n);
  }
  function abytes2(b, ...lengths) {
    if (!isBytes2(b))
      throw new Error("Uint8Array expected");
    if (lengths.length > 0 && !lengths.includes(b.length))
      throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
  }
  function ahash2(h) {
    if (typeof h !== "function" || typeof h.create !== "function")
      throw new Error("Hash should be wrapped by utils.createHasher");
    anumber2(h.outputLen);
    anumber2(h.blockLen);
  }
  function aexists2(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished)
      throw new Error("Hash#digest() has already been called");
  }
  function aoutput2(out, instance) {
    abytes2(out);
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error("digestInto() expects output buffer of length at least " + min);
    }
  }
  function u8(arr) {
    return new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  function u32(arr) {
    return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
  }
  function clean2(...arrays) {
    for (let i = 0; i < arrays.length; i++) {
      arrays[i].fill(0);
    }
  }
  function createView2(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  function rotr2(word, shift) {
    return word << 32 - shift | word >>> shift;
  }
  function rotl2(word, shift) {
    return word << shift | word >>> 32 - shift >>> 0;
  }
  exports.isLE = (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
  function byteSwap(word) {
    return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
  }
  exports.swap8IfBE = exports.isLE ? (n) => n : (n) => byteSwap(n);
  exports.byteSwapIfBE = exports.swap8IfBE;
  function byteSwap32(arr) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = byteSwap(arr[i]);
    }
    return arr;
  }
  exports.swap32IfBE = exports.isLE ? (u) => u : byteSwap32;
  const hasHexBuiltin2 = /* @__PURE__ */ (() => (
    // @ts-ignore
    typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
  ))();
  const hexes2 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
  function bytesToHex2(bytes) {
    abytes2(bytes);
    if (hasHexBuiltin2)
      return bytes.toHex();
    let hex2 = "";
    for (let i = 0; i < bytes.length; i++) {
      hex2 += hexes2[bytes[i]];
    }
    return hex2;
  }
  const asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
  function asciiToBase162(ch) {
    if (ch >= asciis._0 && ch <= asciis._9)
      return ch - asciis._0;
    if (ch >= asciis.A && ch <= asciis.F)
      return ch - (asciis.A - 10);
    if (ch >= asciis.a && ch <= asciis.f)
      return ch - (asciis.a - 10);
    return;
  }
  function hexToBytes2(hex2) {
    if (typeof hex2 !== "string")
      throw new Error("hex string expected, got " + typeof hex2);
    if (hasHexBuiltin2)
      return Uint8Array.fromHex(hex2);
    const hl = hex2.length;
    const al = hl / 2;
    if (hl % 2)
      throw new Error("hex string expected, got unpadded hex of length " + hl);
    const array2 = new Uint8Array(al);
    for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
      const n1 = asciiToBase162(hex2.charCodeAt(hi));
      const n2 = asciiToBase162(hex2.charCodeAt(hi + 1));
      if (n1 === void 0 || n2 === void 0) {
        const char = hex2[hi] + hex2[hi + 1];
        throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
      }
      array2[ai] = n1 * 16 + n2;
    }
    return array2;
  }
  const nextTick = async () => {
  };
  exports.nextTick = nextTick;
  async function asyncLoop(iters, tick, cb) {
    let ts = Date.now();
    for (let i = 0; i < iters; i++) {
      cb(i);
      const diff = Date.now() - ts;
      if (diff >= 0 && diff < tick)
        continue;
      await (0, exports.nextTick)();
      ts += diff;
    }
  }
  function utf8ToBytes(str) {
    if (typeof str !== "string")
      throw new Error("string expected");
    return new Uint8Array(new TextEncoder().encode(str));
  }
  function bytesToUtf8(bytes) {
    return new TextDecoder().decode(bytes);
  }
  function toBytes(data) {
    if (typeof data === "string")
      data = utf8ToBytes(data);
    abytes2(data);
    return data;
  }
  function kdfInputToBytes(data) {
    if (typeof data === "string")
      data = utf8ToBytes(data);
    abytes2(data);
    return data;
  }
  function concatBytes2(...arrays) {
    let sum = 0;
    for (let i = 0; i < arrays.length; i++) {
      const a = arrays[i];
      abytes2(a);
      sum += a.length;
    }
    const res = new Uint8Array(sum);
    for (let i = 0, pad = 0; i < arrays.length; i++) {
      const a = arrays[i];
      res.set(a, pad);
      pad += a.length;
    }
    return res;
  }
  function checkOpts2(defaults, opts) {
    if (opts !== void 0 && {}.toString.call(opts) !== "[object Object]")
      throw new Error("options should be object or undefined");
    const merged = Object.assign(defaults, opts);
    return merged;
  }
  class Hash {
  }
  exports.Hash = Hash;
  function createHasher2(hashCons) {
    const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashCons();
    return hashC;
  }
  function createOptHasher(hashCons) {
    const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
    const tmp = hashCons({});
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (opts) => hashCons(opts);
    return hashC;
  }
  function createXOFer(hashCons) {
    const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
    const tmp = hashCons({});
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (opts) => hashCons(opts);
    return hashC;
  }
  exports.wrapConstructor = createHasher2;
  exports.wrapConstructorWithOpts = createOptHasher;
  exports.wrapXOFConstructorWithOpts = createXOFer;
  function randomBytes2(bytesLength = 32) {
    if (crypto_1.crypto && typeof crypto_1.crypto.getRandomValues === "function") {
      return crypto_1.crypto.getRandomValues(new Uint8Array(bytesLength));
    }
    if (crypto_1.crypto && typeof crypto_1.crypto.randomBytes === "function") {
      return Uint8Array.from(crypto_1.crypto.randomBytes(bytesLength));
    }
    throw new Error("crypto.getRandomValues must be defined");
  }
})(utils$1);
Object.defineProperty(_md, "__esModule", { value: true });
_md.SHA512_IV = _md.SHA384_IV = _md.SHA224_IV = _md.SHA256_IV = _md.HashMD = void 0;
_md.setBigUint64 = setBigUint64;
_md.Chi = Chi$2;
_md.Maj = Maj$2;
const utils_ts_1$2 = utils$1;
function setBigUint64(view2, byteOffset, value, isLE) {
  if (typeof view2.setBigUint64 === "function")
    return view2.setBigUint64(byteOffset, value, isLE);
  const _32n2 = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n2 & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE ? 4 : 0;
  const l = isLE ? 0 : 4;
  view2.setUint32(byteOffset + h, wh, isLE);
  view2.setUint32(byteOffset + l, wl, isLE);
}
function Chi$2(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj$2(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
let HashMD$2 = class HashMD extends utils_ts_1$2.Hash {
  constructor(blockLen, outputLen, padOffset, isLE) {
    super();
    this.finished = false;
    this.length = 0;
    this.pos = 0;
    this.destroyed = false;
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = (0, utils_ts_1$2.createView)(this.buffer);
  }
  update(data) {
    (0, utils_ts_1$2.aexists)(this);
    data = (0, utils_ts_1$2.toBytes)(data);
    (0, utils_ts_1$2.abytes)(data);
    const { view: view2, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = (0, utils_ts_1$2.createView)(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view2, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    (0, utils_ts_1$2.aexists)(this);
    (0, utils_ts_1$2.aoutput)(out, this);
    this.finished = true;
    const { buffer, view: view2, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    (0, utils_ts_1$2.clean)(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view2, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++)
      buffer[i] = 0;
    setBigUint64(view2, blockLen - 8, BigInt(this.length * 8), isLE);
    this.process(view2, 0);
    const oview = (0, utils_ts_1$2.createView)(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor());
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
_md.HashMD = HashMD$2;
_md.SHA256_IV = Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
_md.SHA224_IV = Uint32Array.from([
  3238371032,
  914150663,
  812702999,
  4144912697,
  4290775857,
  1750603025,
  1694076839,
  3204075428
]);
_md.SHA384_IV = Uint32Array.from([
  3418070365,
  3238371032,
  1654270250,
  914150663,
  2438529370,
  812702999,
  355462360,
  4144912697,
  1731405415,
  4290775857,
  2394180231,
  1750603025,
  3675008525,
  1694076839,
  1203062813,
  3204075428
]);
_md.SHA512_IV = Uint32Array.from([
  1779033703,
  4089235720,
  3144134277,
  2227873595,
  1013904242,
  4271175723,
  2773480762,
  1595750129,
  1359893119,
  2917565137,
  2600822924,
  725511199,
  528734635,
  4215389547,
  1541459225,
  327033209
]);
var _u64 = {};
Object.defineProperty(_u64, "__esModule", { value: true });
_u64.toBig = _u64.shrSL = _u64.shrSH = _u64.rotrSL = _u64.rotrSH = _u64.rotrBL = _u64.rotrBH = _u64.rotr32L = _u64.rotr32H = _u64.rotlSL = _u64.rotlSH = _u64.rotlBL = _u64.rotlBH = _u64.add5L = _u64.add5H = _u64.add4L = _u64.add4H = _u64.add3L = _u64.add3H = void 0;
_u64.add = add$1;
_u64.fromBig = fromBig$1;
_u64.split = split$1;
const U32_MASK64$1 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
const _32n$1 = /* @__PURE__ */ BigInt(32);
function fromBig$1(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64$1), l: Number(n >> _32n$1 & U32_MASK64$1) };
  return { h: Number(n >> _32n$1 & U32_MASK64$1) | 0, l: Number(n & U32_MASK64$1) | 0 };
}
function split$1(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h, l } = fromBig$1(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
const toBig = (h, l) => BigInt(h >>> 0) << _32n$1 | BigInt(l >>> 0);
_u64.toBig = toBig;
const shrSH$1 = (h, _l, s) => h >>> s;
_u64.shrSH = shrSH$1;
const shrSL$1 = (h, l, s) => h << 32 - s | l >>> s;
_u64.shrSL = shrSL$1;
const rotrSH$1 = (h, l, s) => h >>> s | l << 32 - s;
_u64.rotrSH = rotrSH$1;
const rotrSL$1 = (h, l, s) => h << 32 - s | l >>> s;
_u64.rotrSL = rotrSL$1;
const rotrBH$1 = (h, l, s) => h << 64 - s | l >>> s - 32;
_u64.rotrBH = rotrBH$1;
const rotrBL$1 = (h, l, s) => h >>> s - 32 | l << 64 - s;
_u64.rotrBL = rotrBL$1;
const rotr32H = (_h, l) => l;
_u64.rotr32H = rotr32H;
const rotr32L = (h, _l) => h;
_u64.rotr32L = rotr32L;
const rotlSH = (h, l, s) => h << s | l >>> 32 - s;
_u64.rotlSH = rotlSH;
const rotlSL = (h, l, s) => l << s | h >>> 32 - s;
_u64.rotlSL = rotlSL;
const rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
_u64.rotlBH = rotlBH;
const rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
_u64.rotlBL = rotlBL;
function add$1(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0);
  return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
}
const add3L$1 = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
_u64.add3L = add3L$1;
const add3H$1 = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
_u64.add3H = add3H$1;
const add4L$1 = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
_u64.add4L = add4L$1;
const add4H$1 = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
_u64.add4H = add4H$1;
const add5L$1 = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
_u64.add5L = add5L$1;
const add5H$1 = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
_u64.add5H = add5H$1;
const u64$1 = {
  fromBig: fromBig$1,
  split: split$1,
  toBig,
  shrSH: shrSH$1,
  shrSL: shrSL$1,
  rotrSH: rotrSH$1,
  rotrSL: rotrSL$1,
  rotrBH: rotrBH$1,
  rotrBL: rotrBL$1,
  rotr32H,
  rotr32L,
  rotlSH,
  rotlSL,
  rotlBH,
  rotlBL,
  add: add$1,
  add3L: add3L$1,
  add3H: add3H$1,
  add4L: add4L$1,
  add4H: add4H$1,
  add5H: add5H$1,
  add5L: add5L$1
};
_u64.default = u64$1;
Object.defineProperty(sha2, "__esModule", { value: true });
sha2.sha512_224 = sha2.sha512_256 = sha2.sha384 = sha2.sha512 = sha2.sha224 = sha2.sha256 = sha2.SHA512_256 = sha2.SHA512_224 = sha2.SHA384 = sha2.SHA512 = sha2.SHA224 = sha2.SHA256 = void 0;
const _md_ts_1 = _md;
const u64 = _u64;
const utils_ts_1$1 = utils$1;
const SHA256_K$2 = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
const SHA256_W$2 = /* @__PURE__ */ new Uint32Array(64);
class SHA256 extends _md_ts_1.HashMD {
  constructor(outputLen = 32) {
    super(64, outputLen, 8, false);
    this.A = _md_ts_1.SHA256_IV[0] | 0;
    this.B = _md_ts_1.SHA256_IV[1] | 0;
    this.C = _md_ts_1.SHA256_IV[2] | 0;
    this.D = _md_ts_1.SHA256_IV[3] | 0;
    this.E = _md_ts_1.SHA256_IV[4] | 0;
    this.F = _md_ts_1.SHA256_IV[5] | 0;
    this.G = _md_ts_1.SHA256_IV[6] | 0;
    this.H = _md_ts_1.SHA256_IV[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view2, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W$2[i] = view2.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W$2[i - 15];
      const W2 = SHA256_W$2[i - 2];
      const s0 = (0, utils_ts_1$1.rotr)(W15, 7) ^ (0, utils_ts_1$1.rotr)(W15, 18) ^ W15 >>> 3;
      const s1 = (0, utils_ts_1$1.rotr)(W2, 17) ^ (0, utils_ts_1$1.rotr)(W2, 19) ^ W2 >>> 10;
      SHA256_W$2[i] = s1 + SHA256_W$2[i - 7] + s0 + SHA256_W$2[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = (0, utils_ts_1$1.rotr)(E, 6) ^ (0, utils_ts_1$1.rotr)(E, 11) ^ (0, utils_ts_1$1.rotr)(E, 25);
      const T1 = H + sigma1 + (0, _md_ts_1.Chi)(E, F, G) + SHA256_K$2[i] + SHA256_W$2[i] | 0;
      const sigma0 = (0, utils_ts_1$1.rotr)(A, 2) ^ (0, utils_ts_1$1.rotr)(A, 13) ^ (0, utils_ts_1$1.rotr)(A, 22);
      const T2 = sigma0 + (0, _md_ts_1.Maj)(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    (0, utils_ts_1$1.clean)(SHA256_W$2);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    (0, utils_ts_1$1.clean)(this.buffer);
  }
}
sha2.SHA256 = SHA256;
class SHA224 extends SHA256 {
  constructor() {
    super(28);
    this.A = _md_ts_1.SHA224_IV[0] | 0;
    this.B = _md_ts_1.SHA224_IV[1] | 0;
    this.C = _md_ts_1.SHA224_IV[2] | 0;
    this.D = _md_ts_1.SHA224_IV[3] | 0;
    this.E = _md_ts_1.SHA224_IV[4] | 0;
    this.F = _md_ts_1.SHA224_IV[5] | 0;
    this.G = _md_ts_1.SHA224_IV[6] | 0;
    this.H = _md_ts_1.SHA224_IV[7] | 0;
  }
}
sha2.SHA224 = SHA224;
const K512$1 = /* @__PURE__ */ (() => u64.split([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((n) => BigInt(n))))();
const SHA512_Kh$1 = /* @__PURE__ */ (() => K512$1[0])();
const SHA512_Kl$1 = /* @__PURE__ */ (() => K512$1[1])();
const SHA512_W_H$1 = /* @__PURE__ */ new Uint32Array(80);
const SHA512_W_L$1 = /* @__PURE__ */ new Uint32Array(80);
class SHA512 extends _md_ts_1.HashMD {
  constructor(outputLen = 64) {
    super(128, outputLen, 16, false);
    this.Ah = _md_ts_1.SHA512_IV[0] | 0;
    this.Al = _md_ts_1.SHA512_IV[1] | 0;
    this.Bh = _md_ts_1.SHA512_IV[2] | 0;
    this.Bl = _md_ts_1.SHA512_IV[3] | 0;
    this.Ch = _md_ts_1.SHA512_IV[4] | 0;
    this.Cl = _md_ts_1.SHA512_IV[5] | 0;
    this.Dh = _md_ts_1.SHA512_IV[6] | 0;
    this.Dl = _md_ts_1.SHA512_IV[7] | 0;
    this.Eh = _md_ts_1.SHA512_IV[8] | 0;
    this.El = _md_ts_1.SHA512_IV[9] | 0;
    this.Fh = _md_ts_1.SHA512_IV[10] | 0;
    this.Fl = _md_ts_1.SHA512_IV[11] | 0;
    this.Gh = _md_ts_1.SHA512_IV[12] | 0;
    this.Gl = _md_ts_1.SHA512_IV[13] | 0;
    this.Hh = _md_ts_1.SHA512_IV[14] | 0;
    this.Hl = _md_ts_1.SHA512_IV[15] | 0;
  }
  // prettier-ignore
  get() {
    const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
  }
  // prettier-ignore
  set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
    this.Ah = Ah | 0;
    this.Al = Al | 0;
    this.Bh = Bh | 0;
    this.Bl = Bl | 0;
    this.Ch = Ch | 0;
    this.Cl = Cl | 0;
    this.Dh = Dh | 0;
    this.Dl = Dl | 0;
    this.Eh = Eh | 0;
    this.El = El | 0;
    this.Fh = Fh | 0;
    this.Fl = Fl | 0;
    this.Gh = Gh | 0;
    this.Gl = Gl | 0;
    this.Hh = Hh | 0;
    this.Hl = Hl | 0;
  }
  process(view2, offset) {
    for (let i = 0; i < 16; i++, offset += 4) {
      SHA512_W_H$1[i] = view2.getUint32(offset);
      SHA512_W_L$1[i] = view2.getUint32(offset += 4);
    }
    for (let i = 16; i < 80; i++) {
      const W15h = SHA512_W_H$1[i - 15] | 0;
      const W15l = SHA512_W_L$1[i - 15] | 0;
      const s0h = u64.rotrSH(W15h, W15l, 1) ^ u64.rotrSH(W15h, W15l, 8) ^ u64.shrSH(W15h, W15l, 7);
      const s0l = u64.rotrSL(W15h, W15l, 1) ^ u64.rotrSL(W15h, W15l, 8) ^ u64.shrSL(W15h, W15l, 7);
      const W2h = SHA512_W_H$1[i - 2] | 0;
      const W2l = SHA512_W_L$1[i - 2] | 0;
      const s1h = u64.rotrSH(W2h, W2l, 19) ^ u64.rotrBH(W2h, W2l, 61) ^ u64.shrSH(W2h, W2l, 6);
      const s1l = u64.rotrSL(W2h, W2l, 19) ^ u64.rotrBL(W2h, W2l, 61) ^ u64.shrSL(W2h, W2l, 6);
      const SUMl = u64.add4L(s0l, s1l, SHA512_W_L$1[i - 7], SHA512_W_L$1[i - 16]);
      const SUMh = u64.add4H(SUMl, s0h, s1h, SHA512_W_H$1[i - 7], SHA512_W_H$1[i - 16]);
      SHA512_W_H$1[i] = SUMh | 0;
      SHA512_W_L$1[i] = SUMl | 0;
    }
    let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    for (let i = 0; i < 80; i++) {
      const sigma1h = u64.rotrSH(Eh, El, 14) ^ u64.rotrSH(Eh, El, 18) ^ u64.rotrBH(Eh, El, 41);
      const sigma1l = u64.rotrSL(Eh, El, 14) ^ u64.rotrSL(Eh, El, 18) ^ u64.rotrBL(Eh, El, 41);
      const CHIh = Eh & Fh ^ ~Eh & Gh;
      const CHIl = El & Fl ^ ~El & Gl;
      const T1ll = u64.add5L(Hl, sigma1l, CHIl, SHA512_Kl$1[i], SHA512_W_L$1[i]);
      const T1h = u64.add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh$1[i], SHA512_W_H$1[i]);
      const T1l = T1ll | 0;
      const sigma0h = u64.rotrSH(Ah, Al, 28) ^ u64.rotrBH(Ah, Al, 34) ^ u64.rotrBH(Ah, Al, 39);
      const sigma0l = u64.rotrSL(Ah, Al, 28) ^ u64.rotrBL(Ah, Al, 34) ^ u64.rotrBL(Ah, Al, 39);
      const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
      const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
      Hh = Gh | 0;
      Hl = Gl | 0;
      Gh = Fh | 0;
      Gl = Fl | 0;
      Fh = Eh | 0;
      Fl = El | 0;
      ({ h: Eh, l: El } = u64.add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
      Dh = Ch | 0;
      Dl = Cl | 0;
      Ch = Bh | 0;
      Cl = Bl | 0;
      Bh = Ah | 0;
      Bl = Al | 0;
      const All = u64.add3L(T1l, sigma0l, MAJl);
      Ah = u64.add3H(All, T1h, sigma0h, MAJh);
      Al = All | 0;
    }
    ({ h: Ah, l: Al } = u64.add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
    ({ h: Bh, l: Bl } = u64.add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
    ({ h: Ch, l: Cl } = u64.add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
    ({ h: Dh, l: Dl } = u64.add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
    ({ h: Eh, l: El } = u64.add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
    ({ h: Fh, l: Fl } = u64.add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
    ({ h: Gh, l: Gl } = u64.add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
    ({ h: Hh, l: Hl } = u64.add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
    this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
  }
  roundClean() {
    (0, utils_ts_1$1.clean)(SHA512_W_H$1, SHA512_W_L$1);
  }
  destroy() {
    (0, utils_ts_1$1.clean)(this.buffer);
    this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
sha2.SHA512 = SHA512;
class SHA384 extends SHA512 {
  constructor() {
    super(48);
    this.Ah = _md_ts_1.SHA384_IV[0] | 0;
    this.Al = _md_ts_1.SHA384_IV[1] | 0;
    this.Bh = _md_ts_1.SHA384_IV[2] | 0;
    this.Bl = _md_ts_1.SHA384_IV[3] | 0;
    this.Ch = _md_ts_1.SHA384_IV[4] | 0;
    this.Cl = _md_ts_1.SHA384_IV[5] | 0;
    this.Dh = _md_ts_1.SHA384_IV[6] | 0;
    this.Dl = _md_ts_1.SHA384_IV[7] | 0;
    this.Eh = _md_ts_1.SHA384_IV[8] | 0;
    this.El = _md_ts_1.SHA384_IV[9] | 0;
    this.Fh = _md_ts_1.SHA384_IV[10] | 0;
    this.Fl = _md_ts_1.SHA384_IV[11] | 0;
    this.Gh = _md_ts_1.SHA384_IV[12] | 0;
    this.Gl = _md_ts_1.SHA384_IV[13] | 0;
    this.Hh = _md_ts_1.SHA384_IV[14] | 0;
    this.Hl = _md_ts_1.SHA384_IV[15] | 0;
  }
}
sha2.SHA384 = SHA384;
const T224_IV = /* @__PURE__ */ Uint32Array.from([
  2352822216,
  424955298,
  1944164710,
  2312950998,
  502970286,
  855612546,
  1738396948,
  1479516111,
  258812777,
  2077511080,
  2011393907,
  79989058,
  1067287976,
  1780299464,
  286451373,
  2446758561
]);
const T256_IV = /* @__PURE__ */ Uint32Array.from([
  573645204,
  4230739756,
  2673172387,
  3360449730,
  596883563,
  1867755857,
  2520282905,
  1497426621,
  2519219938,
  2827943907,
  3193839141,
  1401305490,
  721525244,
  746961066,
  246885852,
  2177182882
]);
class SHA512_224 extends SHA512 {
  constructor() {
    super(28);
    this.Ah = T224_IV[0] | 0;
    this.Al = T224_IV[1] | 0;
    this.Bh = T224_IV[2] | 0;
    this.Bl = T224_IV[3] | 0;
    this.Ch = T224_IV[4] | 0;
    this.Cl = T224_IV[5] | 0;
    this.Dh = T224_IV[6] | 0;
    this.Dl = T224_IV[7] | 0;
    this.Eh = T224_IV[8] | 0;
    this.El = T224_IV[9] | 0;
    this.Fh = T224_IV[10] | 0;
    this.Fl = T224_IV[11] | 0;
    this.Gh = T224_IV[12] | 0;
    this.Gl = T224_IV[13] | 0;
    this.Hh = T224_IV[14] | 0;
    this.Hl = T224_IV[15] | 0;
  }
}
sha2.SHA512_224 = SHA512_224;
class SHA512_256 extends SHA512 {
  constructor() {
    super(32);
    this.Ah = T256_IV[0] | 0;
    this.Al = T256_IV[1] | 0;
    this.Bh = T256_IV[2] | 0;
    this.Bl = T256_IV[3] | 0;
    this.Ch = T256_IV[4] | 0;
    this.Cl = T256_IV[5] | 0;
    this.Dh = T256_IV[6] | 0;
    this.Dl = T256_IV[7] | 0;
    this.Eh = T256_IV[8] | 0;
    this.El = T256_IV[9] | 0;
    this.Fh = T256_IV[10] | 0;
    this.Fl = T256_IV[11] | 0;
    this.Gh = T256_IV[12] | 0;
    this.Gl = T256_IV[13] | 0;
    this.Hh = T256_IV[14] | 0;
    this.Hl = T256_IV[15] | 0;
  }
}
sha2.SHA512_256 = SHA512_256;
sha2.sha256 = (0, utils_ts_1$1.createHasher)(() => new SHA256());
sha2.sha224 = (0, utils_ts_1$1.createHasher)(() => new SHA224());
sha2.sha512 = (0, utils_ts_1$1.createHasher)(() => new SHA512());
sha2.sha384 = (0, utils_ts_1$1.createHasher)(() => new SHA384());
sha2.sha512_256 = (0, utils_ts_1$1.createHasher)(() => new SHA512_256());
sha2.sha512_224 = (0, utils_ts_1$1.createHasher)(() => new SHA512_224());
Object.defineProperty(sha256$3, "__esModule", { value: true });
sha256$3.sha224 = sha256$3.SHA224 = sha256$3.sha256 = sha256$3.SHA256 = void 0;
const sha2_ts_1$1 = sha2;
sha256$3.SHA256 = sha2_ts_1$1.SHA256;
sha256$3.sha256 = sha2_ts_1$1.sha256;
sha256$3.SHA224 = sha2_ts_1$1.SHA224;
sha256$3.sha224 = sha2_ts_1$1.sha224;
var sha512$1 = {};
Object.defineProperty(sha512$1, "__esModule", { value: true });
sha512$1.sha512_256 = sha512$1.SHA512_256 = sha512$1.sha512_224 = sha512$1.SHA512_224 = sha512$1.sha384 = sha512$1.SHA384 = sha512$1.sha512 = sha512$1.SHA512 = void 0;
const sha2_ts_1 = sha2;
sha512$1.SHA512 = sha2_ts_1.SHA512;
sha512$1.sha512 = sha2_ts_1.sha512;
sha512$1.SHA384 = sha2_ts_1.SHA384;
sha512$1.sha384 = sha2_ts_1.sha384;
sha512$1.SHA512_224 = sha2_ts_1.SHA512_224;
sha512$1.sha512_224 = sha2_ts_1.sha512_224;
sha512$1.SHA512_256 = sha2_ts_1.SHA512_256;
sha512$1.sha512_256 = sha2_ts_1.sha512_256;
var pbkdf2$1 = {};
var hmac$2 = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.hmac = exports.HMAC = void 0;
  const utils_ts_12 = utils$1;
  class HMAC extends utils_ts_12.Hash {
    constructor(hash, _key) {
      super();
      this.finished = false;
      this.destroyed = false;
      (0, utils_ts_12.ahash)(hash);
      const key = (0, utils_ts_12.toBytes)(_key);
      this.iHash = hash.create();
      if (typeof this.iHash.update !== "function")
        throw new Error("Expected instance of class which extends utils.Hash");
      this.blockLen = this.iHash.blockLen;
      this.outputLen = this.iHash.outputLen;
      const blockLen = this.blockLen;
      const pad = new Uint8Array(blockLen);
      pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
      for (let i = 0; i < pad.length; i++)
        pad[i] ^= 54;
      this.iHash.update(pad);
      this.oHash = hash.create();
      for (let i = 0; i < pad.length; i++)
        pad[i] ^= 54 ^ 92;
      this.oHash.update(pad);
      (0, utils_ts_12.clean)(pad);
    }
    update(buf) {
      (0, utils_ts_12.aexists)(this);
      this.iHash.update(buf);
      return this;
    }
    digestInto(out) {
      (0, utils_ts_12.aexists)(this);
      (0, utils_ts_12.abytes)(out, this.outputLen);
      this.finished = true;
      this.iHash.digestInto(out);
      this.oHash.update(out);
      this.oHash.digestInto(out);
      this.destroy();
    }
    digest() {
      const out = new Uint8Array(this.oHash.outputLen);
      this.digestInto(out);
      return out;
    }
    _cloneInto(to) {
      to || (to = Object.create(Object.getPrototypeOf(this), {}));
      const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
      to = to;
      to.finished = finished;
      to.destroyed = destroyed;
      to.blockLen = blockLen;
      to.outputLen = outputLen;
      to.oHash = oHash._cloneInto(to.oHash);
      to.iHash = iHash._cloneInto(to.iHash);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
    destroy() {
      this.destroyed = true;
      this.oHash.destroy();
      this.iHash.destroy();
    }
  }
  exports.HMAC = HMAC;
  const hmac2 = (hash, key, message) => new HMAC(hash, key).update(message).digest();
  exports.hmac = hmac2;
  exports.hmac.create = (hash, key) => new HMAC(hash, key);
})(hmac$2);
Object.defineProperty(pbkdf2$1, "__esModule", { value: true });
pbkdf2$1.pbkdf2 = pbkdf2;
pbkdf2$1.pbkdf2Async = pbkdf2Async;
const hmac_ts_1 = hmac$2;
const utils_ts_1 = utils$1;
function pbkdf2Init(hash, _password, _salt, _opts) {
  (0, utils_ts_1.ahash)(hash);
  const opts = (0, utils_ts_1.checkOpts)({ dkLen: 32, asyncTick: 10 }, _opts);
  const { c, dkLen, asyncTick } = opts;
  (0, utils_ts_1.anumber)(c);
  (0, utils_ts_1.anumber)(dkLen);
  (0, utils_ts_1.anumber)(asyncTick);
  if (c < 1)
    throw new Error("iterations (c) should be >= 1");
  const password = (0, utils_ts_1.kdfInputToBytes)(_password);
  const salt2 = (0, utils_ts_1.kdfInputToBytes)(_salt);
  const DK = new Uint8Array(dkLen);
  const PRF = hmac_ts_1.hmac.create(hash, password);
  const PRFSalt = PRF._cloneInto().update(salt2);
  return { c, dkLen, asyncTick, DK, PRF, PRFSalt };
}
function pbkdf2Output(PRF, PRFSalt, DK, prfW, u) {
  PRF.destroy();
  PRFSalt.destroy();
  if (prfW)
    prfW.destroy();
  (0, utils_ts_1.clean)(u);
  return DK;
}
function pbkdf2(hash, password, salt2, opts) {
  const { c, dkLen, DK, PRF, PRFSalt } = pbkdf2Init(hash, password, salt2, opts);
  let prfW;
  const arr = new Uint8Array(4);
  const view2 = (0, utils_ts_1.createView)(arr);
  const u = new Uint8Array(PRF.outputLen);
  for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
    const Ti = DK.subarray(pos, pos + PRF.outputLen);
    view2.setInt32(0, ti, false);
    (prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
    Ti.set(u.subarray(0, Ti.length));
    for (let ui = 1; ui < c; ui++) {
      PRF._cloneInto(prfW).update(u).digestInto(u);
      for (let i = 0; i < Ti.length; i++)
        Ti[i] ^= u[i];
    }
  }
  return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
}
async function pbkdf2Async(hash, password, salt2, opts) {
  const { c, dkLen, asyncTick, DK, PRF, PRFSalt } = pbkdf2Init(hash, password, salt2, opts);
  let prfW;
  const arr = new Uint8Array(4);
  const view2 = (0, utils_ts_1.createView)(arr);
  const u = new Uint8Array(PRF.outputLen);
  for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
    const Ti = DK.subarray(pos, pos + PRF.outputLen);
    view2.setInt32(0, ti, false);
    (prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
    Ti.set(u.subarray(0, Ti.length));
    await (0, utils_ts_1.asyncLoop)(c - 1, asyncTick, () => {
      PRF._cloneInto(prfW).update(u).digestInto(u);
      for (let i = 0; i < Ti.length; i++)
        Ti[i] ^= u[i];
    });
  }
  return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
}
var _wordlists = {};
const require$$0 = [
  "abdikace",
  "abeceda",
  "adresa",
  "agrese",
  "akce",
  "aktovka",
  "alej",
  "alkohol",
  "amputace",
  "ananas",
  "andulka",
  "anekdota",
  "anketa",
  "antika",
  "anulovat",
  "archa",
  "arogance",
  "asfalt",
  "asistent",
  "aspirace",
  "astma",
  "astronom",
  "atlas",
  "atletika",
  "atol",
  "autobus",
  "azyl",
  "babka",
  "bachor",
  "bacil",
  "baculka",
  "badatel",
  "bageta",
  "bagr",
  "bahno",
  "bakterie",
  "balada",
  "baletka",
  "balkon",
  "balonek",
  "balvan",
  "balza",
  "bambus",
  "bankomat",
  "barbar",
  "baret",
  "barman",
  "baroko",
  "barva",
  "baterka",
  "batoh",
  "bavlna",
  "bazalka",
  "bazilika",
  "bazuka",
  "bedna",
  "beran",
  "beseda",
  "bestie",
  "beton",
  "bezinka",
  "bezmoc",
  "beztak",
  "bicykl",
  "bidlo",
  "biftek",
  "bikiny",
  "bilance",
  "biograf",
  "biolog",
  "bitva",
  "bizon",
  "blahobyt",
  "blatouch",
  "blecha",
  "bledule",
  "blesk",
  "blikat",
  "blizna",
  "blokovat",
  "bloudit",
  "blud",
  "bobek",
  "bobr",
  "bodlina",
  "bodnout",
  "bohatost",
  "bojkot",
  "bojovat",
  "bokorys",
  "bolest",
  "borec",
  "borovice",
  "bota",
  "boubel",
  "bouchat",
  "bouda",
  "boule",
  "bourat",
  "boxer",
  "bradavka",
  "brambora",
  "branka",
  "bratr",
  "brepta",
  "briketa",
  "brko",
  "brloh",
  "bronz",
  "broskev",
  "brunetka",
  "brusinka",
  "brzda",
  "brzy",
  "bublina",
  "bubnovat",
  "buchta",
  "buditel",
  "budka",
  "budova",
  "bufet",
  "bujarost",
  "bukvice",
  "buldok",
  "bulva",
  "bunda",
  "bunkr",
  "burza",
  "butik",
  "buvol",
  "buzola",
  "bydlet",
  "bylina",
  "bytovka",
  "bzukot",
  "capart",
  "carevna",
  "cedr",
  "cedule",
  "cejch",
  "cejn",
  "cela",
  "celer",
  "celkem",
  "celnice",
  "cenina",
  "cennost",
  "cenovka",
  "centrum",
  "cenzor",
  "cestopis",
  "cetka",
  "chalupa",
  "chapadlo",
  "charita",
  "chata",
  "chechtat",
  "chemie",
  "chichot",
  "chirurg",
  "chlad",
  "chleba",
  "chlubit",
  "chmel",
  "chmura",
  "chobot",
  "chochol",
  "chodba",
  "cholera",
  "chomout",
  "chopit",
  "choroba",
  "chov",
  "chrapot",
  "chrlit",
  "chrt",
  "chrup",
  "chtivost",
  "chudina",
  "chutnat",
  "chvat",
  "chvilka",
  "chvost",
  "chyba",
  "chystat",
  "chytit",
  "cibule",
  "cigareta",
  "cihelna",
  "cihla",
  "cinkot",
  "cirkus",
  "cisterna",
  "citace",
  "citrus",
  "cizinec",
  "cizost",
  "clona",
  "cokoliv",
  "couvat",
  "ctitel",
  "ctnost",
  "cudnost",
  "cuketa",
  "cukr",
  "cupot",
  "cvaknout",
  "cval",
  "cvik",
  "cvrkot",
  "cyklista",
  "daleko",
  "dareba",
  "datel",
  "datum",
  "dcera",
  "debata",
  "dechovka",
  "decibel",
  "deficit",
  "deflace",
  "dekl",
  "dekret",
  "demokrat",
  "deprese",
  "derby",
  "deska",
  "detektiv",
  "dikobraz",
  "diktovat",
  "dioda",
  "diplom",
  "disk",
  "displej",
  "divadlo",
  "divoch",
  "dlaha",
  "dlouho",
  "dluhopis",
  "dnes",
  "dobro",
  "dobytek",
  "docent",
  "dochutit",
  "dodnes",
  "dohled",
  "dohoda",
  "dohra",
  "dojem",
  "dojnice",
  "doklad",
  "dokola",
  "doktor",
  "dokument",
  "dolar",
  "doleva",
  "dolina",
  "doma",
  "dominant",
  "domluvit",
  "domov",
  "donutit",
  "dopad",
  "dopis",
  "doplnit",
  "doposud",
  "doprovod",
  "dopustit",
  "dorazit",
  "dorost",
  "dort",
  "dosah",
  "doslov",
  "dostatek",
  "dosud",
  "dosyta",
  "dotaz",
  "dotek",
  "dotknout",
  "doufat",
  "doutnat",
  "dovozce",
  "dozadu",
  "doznat",
  "dozorce",
  "drahota",
  "drak",
  "dramatik",
  "dravec",
  "draze",
  "drdol",
  "drobnost",
  "drogerie",
  "drozd",
  "drsnost",
  "drtit",
  "drzost",
  "duben",
  "duchovno",
  "dudek",
  "duha",
  "duhovka",
  "dusit",
  "dusno",
  "dutost",
  "dvojice",
  "dvorec",
  "dynamit",
  "ekolog",
  "ekonomie",
  "elektron",
  "elipsa",
  "email",
  "emise",
  "emoce",
  "empatie",
  "epizoda",
  "epocha",
  "epopej",
  "epos",
  "esej",
  "esence",
  "eskorta",
  "eskymo",
  "etiketa",
  "euforie",
  "evoluce",
  "exekuce",
  "exkurze",
  "expedice",
  "exploze",
  "export",
  "extrakt",
  "facka",
  "fajfka",
  "fakulta",
  "fanatik",
  "fantazie",
  "farmacie",
  "favorit",
  "fazole",
  "federace",
  "fejeton",
  "fenka",
  "fialka",
  "figurant",
  "filozof",
  "filtr",
  "finance",
  "finta",
  "fixace",
  "fjord",
  "flanel",
  "flirt",
  "flotila",
  "fond",
  "fosfor",
  "fotbal",
  "fotka",
  "foton",
  "frakce",
  "freska",
  "fronta",
  "fukar",
  "funkce",
  "fyzika",
  "galeje",
  "garant",
  "genetika",
  "geolog",
  "gilotina",
  "glazura",
  "glejt",
  "golem",
  "golfista",
  "gotika",
  "graf",
  "gramofon",
  "granule",
  "grep",
  "gril",
  "grog",
  "groteska",
  "guma",
  "hadice",
  "hadr",
  "hala",
  "halenka",
  "hanba",
  "hanopis",
  "harfa",
  "harpuna",
  "havran",
  "hebkost",
  "hejkal",
  "hejno",
  "hejtman",
  "hektar",
  "helma",
  "hematom",
  "herec",
  "herna",
  "heslo",
  "hezky",
  "historik",
  "hladovka",
  "hlasivky",
  "hlava",
  "hledat",
  "hlen",
  "hlodavec",
  "hloh",
  "hloupost",
  "hltat",
  "hlubina",
  "hluchota",
  "hmat",
  "hmota",
  "hmyz",
  "hnis",
  "hnojivo",
  "hnout",
  "hoblina",
  "hoboj",
  "hoch",
  "hodiny",
  "hodlat",
  "hodnota",
  "hodovat",
  "hojnost",
  "hokej",
  "holinka",
  "holka",
  "holub",
  "homole",
  "honitba",
  "honorace",
  "horal",
  "horda",
  "horizont",
  "horko",
  "horlivec",
  "hormon",
  "hornina",
  "horoskop",
  "horstvo",
  "hospoda",
  "hostina",
  "hotovost",
  "houba",
  "houf",
  "houpat",
  "houska",
  "hovor",
  "hradba",
  "hranice",
  "hravost",
  "hrazda",
  "hrbolek",
  "hrdina",
  "hrdlo",
  "hrdost",
  "hrnek",
  "hrobka",
  "hromada",
  "hrot",
  "hrouda",
  "hrozen",
  "hrstka",
  "hrubost",
  "hryzat",
  "hubenost",
  "hubnout",
  "hudba",
  "hukot",
  "humr",
  "husita",
  "hustota",
  "hvozd",
  "hybnost",
  "hydrant",
  "hygiena",
  "hymna",
  "hysterik",
  "idylka",
  "ihned",
  "ikona",
  "iluze",
  "imunita",
  "infekce",
  "inflace",
  "inkaso",
  "inovace",
  "inspekce",
  "internet",
  "invalida",
  "investor",
  "inzerce",
  "ironie",
  "jablko",
  "jachta",
  "jahoda",
  "jakmile",
  "jakost",
  "jalovec",
  "jantar",
  "jarmark",
  "jaro",
  "jasan",
  "jasno",
  "jatka",
  "javor",
  "jazyk",
  "jedinec",
  "jedle",
  "jednatel",
  "jehlan",
  "jekot",
  "jelen",
  "jelito",
  "jemnost",
  "jenom",
  "jepice",
  "jeseter",
  "jevit",
  "jezdec",
  "jezero",
  "jinak",
  "jindy",
  "jinoch",
  "jiskra",
  "jistota",
  "jitrnice",
  "jizva",
  "jmenovat",
  "jogurt",
  "jurta",
  "kabaret",
  "kabel",
  "kabinet",
  "kachna",
  "kadet",
  "kadidlo",
  "kahan",
  "kajak",
  "kajuta",
  "kakao",
  "kaktus",
  "kalamita",
  "kalhoty",
  "kalibr",
  "kalnost",
  "kamera",
  "kamkoliv",
  "kamna",
  "kanibal",
  "kanoe",
  "kantor",
  "kapalina",
  "kapela",
  "kapitola",
  "kapka",
  "kaple",
  "kapota",
  "kapr",
  "kapusta",
  "kapybara",
  "karamel",
  "karotka",
  "karton",
  "kasa",
  "katalog",
  "katedra",
  "kauce",
  "kauza",
  "kavalec",
  "kazajka",
  "kazeta",
  "kazivost",
  "kdekoliv",
  "kdesi",
  "kedluben",
  "kemp",
  "keramika",
  "kino",
  "klacek",
  "kladivo",
  "klam",
  "klapot",
  "klasika",
  "klaun",
  "klec",
  "klenba",
  "klepat",
  "klesnout",
  "klid",
  "klima",
  "klisna",
  "klobouk",
  "klokan",
  "klopa",
  "kloub",
  "klubovna",
  "klusat",
  "kluzkost",
  "kmen",
  "kmitat",
  "kmotr",
  "kniha",
  "knot",
  "koalice",
  "koberec",
  "kobka",
  "kobliha",
  "kobyla",
  "kocour",
  "kohout",
  "kojenec",
  "kokos",
  "koktejl",
  "kolaps",
  "koleda",
  "kolize",
  "kolo",
  "komando",
  "kometa",
  "komik",
  "komnata",
  "komora",
  "kompas",
  "komunita",
  "konat",
  "koncept",
  "kondice",
  "konec",
  "konfese",
  "kongres",
  "konina",
  "konkurs",
  "kontakt",
  "konzerva",
  "kopanec",
  "kopie",
  "kopnout",
  "koprovka",
  "korbel",
  "korektor",
  "kormidlo",
  "koroptev",
  "korpus",
  "koruna",
  "koryto",
  "korzet",
  "kosatec",
  "kostka",
  "kotel",
  "kotleta",
  "kotoul",
  "koukat",
  "koupelna",
  "kousek",
  "kouzlo",
  "kovboj",
  "koza",
  "kozoroh",
  "krabice",
  "krach",
  "krajina",
  "kralovat",
  "krasopis",
  "kravata",
  "kredit",
  "krejcar",
  "kresba",
  "kreveta",
  "kriket",
  "kritik",
  "krize",
  "krkavec",
  "krmelec",
  "krmivo",
  "krocan",
  "krok",
  "kronika",
  "kropit",
  "kroupa",
  "krovka",
  "krtek",
  "kruhadlo",
  "krupice",
  "krutost",
  "krvinka",
  "krychle",
  "krypta",
  "krystal",
  "kryt",
  "kudlanka",
  "kufr",
  "kujnost",
  "kukla",
  "kulajda",
  "kulich",
  "kulka",
  "kulomet",
  "kultura",
  "kuna",
  "kupodivu",
  "kurt",
  "kurzor",
  "kutil",
  "kvalita",
  "kvasinka",
  "kvestor",
  "kynolog",
  "kyselina",
  "kytara",
  "kytice",
  "kytka",
  "kytovec",
  "kyvadlo",
  "labrador",
  "lachtan",
  "ladnost",
  "laik",
  "lakomec",
  "lamela",
  "lampa",
  "lanovka",
  "lasice",
  "laso",
  "lastura",
  "latinka",
  "lavina",
  "lebka",
  "leckdy",
  "leden",
  "lednice",
  "ledovka",
  "ledvina",
  "legenda",
  "legie",
  "legrace",
  "lehce",
  "lehkost",
  "lehnout",
  "lektvar",
  "lenochod",
  "lentilka",
  "lepenka",
  "lepidlo",
  "letadlo",
  "letec",
  "letmo",
  "letokruh",
  "levhart",
  "levitace",
  "levobok",
  "libra",
  "lichotka",
  "lidojed",
  "lidskost",
  "lihovina",
  "lijavec",
  "lilek",
  "limetka",
  "linie",
  "linka",
  "linoleum",
  "listopad",
  "litina",
  "litovat",
  "lobista",
  "lodivod",
  "logika",
  "logoped",
  "lokalita",
  "loket",
  "lomcovat",
  "lopata",
  "lopuch",
  "lord",
  "losos",
  "lotr",
  "loudal",
  "louh",
  "louka",
  "louskat",
  "lovec",
  "lstivost",
  "lucerna",
  "lucifer",
  "lump",
  "lusk",
  "lustrace",
  "lvice",
  "lyra",
  "lyrika",
  "lysina",
  "madam",
  "madlo",
  "magistr",
  "mahagon",
  "majetek",
  "majitel",
  "majorita",
  "makak",
  "makovice",
  "makrela",
  "malba",
  "malina",
  "malovat",
  "malvice",
  "maminka",
  "mandle",
  "manko",
  "marnost",
  "masakr",
  "maskot",
  "masopust",
  "matice",
  "matrika",
  "maturita",
  "mazanec",
  "mazivo",
  "mazlit",
  "mazurka",
  "mdloba",
  "mechanik",
  "meditace",
  "medovina",
  "melasa",
  "meloun",
  "mentolka",
  "metla",
  "metoda",
  "metr",
  "mezera",
  "migrace",
  "mihnout",
  "mihule",
  "mikina",
  "mikrofon",
  "milenec",
  "milimetr",
  "milost",
  "mimika",
  "mincovna",
  "minibar",
  "minomet",
  "minulost",
  "miska",
  "mistr",
  "mixovat",
  "mladost",
  "mlha",
  "mlhovina",
  "mlok",
  "mlsat",
  "mluvit",
  "mnich",
  "mnohem",
  "mobil",
  "mocnost",
  "modelka",
  "modlitba",
  "mohyla",
  "mokro",
  "molekula",
  "momentka",
  "monarcha",
  "monokl",
  "monstrum",
  "montovat",
  "monzun",
  "mosaz",
  "moskyt",
  "most",
  "motivace",
  "motorka",
  "motyka",
  "moucha",
  "moudrost",
  "mozaika",
  "mozek",
  "mozol",
  "mramor",
  "mravenec",
  "mrkev",
  "mrtvola",
  "mrzet",
  "mrzutost",
  "mstitel",
  "mudrc",
  "muflon",
  "mulat",
  "mumie",
  "munice",
  "muset",
  "mutace",
  "muzeum",
  "muzikant",
  "myslivec",
  "mzda",
  "nabourat",
  "nachytat",
  "nadace",
  "nadbytek",
  "nadhoz",
  "nadobro",
  "nadpis",
  "nahlas",
  "nahnat",
  "nahodile",
  "nahradit",
  "naivita",
  "najednou",
  "najisto",
  "najmout",
  "naklonit",
  "nakonec",
  "nakrmit",
  "nalevo",
  "namazat",
  "namluvit",
  "nanometr",
  "naoko",
  "naopak",
  "naostro",
  "napadat",
  "napevno",
  "naplnit",
  "napnout",
  "naposled",
  "naprosto",
  "narodit",
  "naruby",
  "narychlo",
  "nasadit",
  "nasekat",
  "naslepo",
  "nastat",
  "natolik",
  "navenek",
  "navrch",
  "navzdory",
  "nazvat",
  "nebe",
  "nechat",
  "necky",
  "nedaleko",
  "nedbat",
  "neduh",
  "negace",
  "nehet",
  "nehoda",
  "nejen",
  "nejprve",
  "neklid",
  "nelibost",
  "nemilost",
  "nemoc",
  "neochota",
  "neonka",
  "nepokoj",
  "nerost",
  "nerv",
  "nesmysl",
  "nesoulad",
  "netvor",
  "neuron",
  "nevina",
  "nezvykle",
  "nicota",
  "nijak",
  "nikam",
  "nikdy",
  "nikl",
  "nikterak",
  "nitro",
  "nocleh",
  "nohavice",
  "nominace",
  "nora",
  "norek",
  "nositel",
  "nosnost",
  "nouze",
  "noviny",
  "novota",
  "nozdra",
  "nuda",
  "nudle",
  "nuget",
  "nutit",
  "nutnost",
  "nutrie",
  "nymfa",
  "obal",
  "obarvit",
  "obava",
  "obdiv",
  "obec",
  "obehnat",
  "obejmout",
  "obezita",
  "obhajoba",
  "obilnice",
  "objasnit",
  "objekt",
  "obklopit",
  "oblast",
  "oblek",
  "obliba",
  "obloha",
  "obluda",
  "obnos",
  "obohatit",
  "obojek",
  "obout",
  "obrazec",
  "obrna",
  "obruba",
  "obrys",
  "obsah",
  "obsluha",
  "obstarat",
  "obuv",
  "obvaz",
  "obvinit",
  "obvod",
  "obvykle",
  "obyvatel",
  "obzor",
  "ocas",
  "ocel",
  "ocenit",
  "ochladit",
  "ochota",
  "ochrana",
  "ocitnout",
  "odboj",
  "odbyt",
  "odchod",
  "odcizit",
  "odebrat",
  "odeslat",
  "odevzdat",
  "odezva",
  "odhadce",
  "odhodit",
  "odjet",
  "odjinud",
  "odkaz",
  "odkoupit",
  "odliv",
  "odluka",
  "odmlka",
  "odolnost",
  "odpad",
  "odpis",
  "odplout",
  "odpor",
  "odpustit",
  "odpykat",
  "odrazka",
  "odsoudit",
  "odstup",
  "odsun",
  "odtok",
  "odtud",
  "odvaha",
  "odveta",
  "odvolat",
  "odvracet",
  "odznak",
  "ofina",
  "ofsajd",
  "ohlas",
  "ohnisko",
  "ohrada",
  "ohrozit",
  "ohryzek",
  "okap",
  "okenice",
  "oklika",
  "okno",
  "okouzlit",
  "okovy",
  "okrasa",
  "okres",
  "okrsek",
  "okruh",
  "okupant",
  "okurka",
  "okusit",
  "olejnina",
  "olizovat",
  "omak",
  "omeleta",
  "omezit",
  "omladina",
  "omlouvat",
  "omluva",
  "omyl",
  "onehdy",
  "opakovat",
  "opasek",
  "operace",
  "opice",
  "opilost",
  "opisovat",
  "opora",
  "opozice",
  "opravdu",
  "oproti",
  "orbital",
  "orchestr",
  "orgie",
  "orlice",
  "orloj",
  "ortel",
  "osada",
  "oschnout",
  "osika",
  "osivo",
  "oslava",
  "oslepit",
  "oslnit",
  "oslovit",
  "osnova",
  "osoba",
  "osolit",
  "ospalec",
  "osten",
  "ostraha",
  "ostuda",
  "ostych",
  "osvojit",
  "oteplit",
  "otisk",
  "otop",
  "otrhat",
  "otrlost",
  "otrok",
  "otruby",
  "otvor",
  "ovanout",
  "ovar",
  "oves",
  "ovlivnit",
  "ovoce",
  "oxid",
  "ozdoba",
  "pachatel",
  "pacient",
  "padouch",
  "pahorek",
  "pakt",
  "palanda",
  "palec",
  "palivo",
  "paluba",
  "pamflet",
  "pamlsek",
  "panenka",
  "panika",
  "panna",
  "panovat",
  "panstvo",
  "pantofle",
  "paprika",
  "parketa",
  "parodie",
  "parta",
  "paruka",
  "paryba",
  "paseka",
  "pasivita",
  "pastelka",
  "patent",
  "patrona",
  "pavouk",
  "pazneht",
  "pazourek",
  "pecka",
  "pedagog",
  "pejsek",
  "peklo",
  "peloton",
  "penalta",
  "pendrek",
  "penze",
  "periskop",
  "pero",
  "pestrost",
  "petarda",
  "petice",
  "petrolej",
  "pevnina",
  "pexeso",
  "pianista",
  "piha",
  "pijavice",
  "pikle",
  "piknik",
  "pilina",
  "pilnost",
  "pilulka",
  "pinzeta",
  "pipeta",
  "pisatel",
  "pistole",
  "pitevna",
  "pivnice",
  "pivovar",
  "placenta",
  "plakat",
  "plamen",
  "planeta",
  "plastika",
  "platit",
  "plavidlo",
  "plaz",
  "plech",
  "plemeno",
  "plenta",
  "ples",
  "pletivo",
  "plevel",
  "plivat",
  "plnit",
  "plno",
  "plocha",
  "plodina",
  "plomba",
  "plout",
  "pluk",
  "plyn",
  "pobavit",
  "pobyt",
  "pochod",
  "pocit",
  "poctivec",
  "podat",
  "podcenit",
  "podepsat",
  "podhled",
  "podivit",
  "podklad",
  "podmanit",
  "podnik",
  "podoba",
  "podpora",
  "podraz",
  "podstata",
  "podvod",
  "podzim",
  "poezie",
  "pohanka",
  "pohnutka",
  "pohovor",
  "pohroma",
  "pohyb",
  "pointa",
  "pojistka",
  "pojmout",
  "pokazit",
  "pokles",
  "pokoj",
  "pokrok",
  "pokuta",
  "pokyn",
  "poledne",
  "polibek",
  "polknout",
  "poloha",
  "polynom",
  "pomalu",
  "pominout",
  "pomlka",
  "pomoc",
  "pomsta",
  "pomyslet",
  "ponechat",
  "ponorka",
  "ponurost",
  "popadat",
  "popel",
  "popisek",
  "poplach",
  "poprosit",
  "popsat",
  "popud",
  "poradce",
  "porce",
  "porod",
  "porucha",
  "poryv",
  "posadit",
  "posed",
  "posila",
  "poskok",
  "poslanec",
  "posoudit",
  "pospolu",
  "postava",
  "posudek",
  "posyp",
  "potah",
  "potkan",
  "potlesk",
  "potomek",
  "potrava",
  "potupa",
  "potvora",
  "poukaz",
  "pouto",
  "pouzdro",
  "povaha",
  "povidla",
  "povlak",
  "povoz",
  "povrch",
  "povstat",
  "povyk",
  "povzdech",
  "pozdrav",
  "pozemek",
  "poznatek",
  "pozor",
  "pozvat",
  "pracovat",
  "prahory",
  "praktika",
  "prales",
  "praotec",
  "praporek",
  "prase",
  "pravda",
  "princip",
  "prkno",
  "probudit",
  "procento",
  "prodej",
  "profese",
  "prohra",
  "projekt",
  "prolomit",
  "promile",
  "pronikat",
  "propad",
  "prorok",
  "prosba",
  "proton",
  "proutek",
  "provaz",
  "prskavka",
  "prsten",
  "prudkost",
  "prut",
  "prvek",
  "prvohory",
  "psanec",
  "psovod",
  "pstruh",
  "ptactvo",
  "puberta",
  "puch",
  "pudl",
  "pukavec",
  "puklina",
  "pukrle",
  "pult",
  "pumpa",
  "punc",
  "pupen",
  "pusa",
  "pusinka",
  "pustina",
  "putovat",
  "putyka",
  "pyramida",
  "pysk",
  "pytel",
  "racek",
  "rachot",
  "radiace",
  "radnice",
  "radon",
  "raft",
  "ragby",
  "raketa",
  "rakovina",
  "rameno",
  "rampouch",
  "rande",
  "rarach",
  "rarita",
  "rasovna",
  "rastr",
  "ratolest",
  "razance",
  "razidlo",
  "reagovat",
  "reakce",
  "recept",
  "redaktor",
  "referent",
  "reflex",
  "rejnok",
  "reklama",
  "rekord",
  "rekrut",
  "rektor",
  "reputace",
  "revize",
  "revma",
  "revolver",
  "rezerva",
  "riskovat",
  "riziko",
  "robotika",
  "rodokmen",
  "rohovka",
  "rokle",
  "rokoko",
  "romaneto",
  "ropovod",
  "ropucha",
  "rorejs",
  "rosol",
  "rostlina",
  "rotmistr",
  "rotoped",
  "rotunda",
  "roubenka",
  "roucho",
  "roup",
  "roura",
  "rovina",
  "rovnice",
  "rozbor",
  "rozchod",
  "rozdat",
  "rozeznat",
  "rozhodce",
  "rozinka",
  "rozjezd",
  "rozkaz",
  "rozloha",
  "rozmar",
  "rozpad",
  "rozruch",
  "rozsah",
  "roztok",
  "rozum",
  "rozvod",
  "rubrika",
  "ruchadlo",
  "rukavice",
  "rukopis",
  "ryba",
  "rybolov",
  "rychlost",
  "rydlo",
  "rypadlo",
  "rytina",
  "ryzost",
  "sadista",
  "sahat",
  "sako",
  "samec",
  "samizdat",
  "samota",
  "sanitka",
  "sardinka",
  "sasanka",
  "satelit",
  "sazba",
  "sazenice",
  "sbor",
  "schovat",
  "sebranka",
  "secese",
  "sedadlo",
  "sediment",
  "sedlo",
  "sehnat",
  "sejmout",
  "sekera",
  "sekta",
  "sekunda",
  "sekvoje",
  "semeno",
  "seno",
  "servis",
  "sesadit",
  "seshora",
  "seskok",
  "seslat",
  "sestra",
  "sesuv",
  "sesypat",
  "setba",
  "setina",
  "setkat",
  "setnout",
  "setrvat",
  "sever",
  "seznam",
  "shoda",
  "shrnout",
  "sifon",
  "silnice",
  "sirka",
  "sirotek",
  "sirup",
  "situace",
  "skafandr",
  "skalisko",
  "skanzen",
  "skaut",
  "skeptik",
  "skica",
  "skladba",
  "sklenice",
  "sklo",
  "skluz",
  "skoba",
  "skokan",
  "skoro",
  "skripta",
  "skrz",
  "skupina",
  "skvost",
  "skvrna",
  "slabika",
  "sladidlo",
  "slanina",
  "slast",
  "slavnost",
  "sledovat",
  "slepec",
  "sleva",
  "slezina",
  "slib",
  "slina",
  "sliznice",
  "slon",
  "sloupek",
  "slovo",
  "sluch",
  "sluha",
  "slunce",
  "slupka",
  "slza",
  "smaragd",
  "smetana",
  "smilstvo",
  "smlouva",
  "smog",
  "smrad",
  "smrk",
  "smrtka",
  "smutek",
  "smysl",
  "snad",
  "snaha",
  "snob",
  "sobota",
  "socha",
  "sodovka",
  "sokol",
  "sopka",
  "sotva",
  "souboj",
  "soucit",
  "soudce",
  "souhlas",
  "soulad",
  "soumrak",
  "souprava",
  "soused",
  "soutok",
  "souviset",
  "spalovna",
  "spasitel",
  "spis",
  "splav",
  "spodek",
  "spojenec",
  "spolu",
  "sponzor",
  "spornost",
  "spousta",
  "sprcha",
  "spustit",
  "sranda",
  "sraz",
  "srdce",
  "srna",
  "srnec",
  "srovnat",
  "srpen",
  "srst",
  "srub",
  "stanice",
  "starosta",
  "statika",
  "stavba",
  "stehno",
  "stezka",
  "stodola",
  "stolek",
  "stopa",
  "storno",
  "stoupat",
  "strach",
  "stres",
  "strhnout",
  "strom",
  "struna",
  "studna",
  "stupnice",
  "stvol",
  "styk",
  "subjekt",
  "subtropy",
  "suchar",
  "sudost",
  "sukno",
  "sundat",
  "sunout",
  "surikata",
  "surovina",
  "svah",
  "svalstvo",
  "svetr",
  "svatba",
  "svazek",
  "svisle",
  "svitek",
  "svoboda",
  "svodidlo",
  "svorka",
  "svrab",
  "sykavka",
  "sykot",
  "synek",
  "synovec",
  "sypat",
  "sypkost",
  "syrovost",
  "sysel",
  "sytost",
  "tabletka",
  "tabule",
  "tahoun",
  "tajemno",
  "tajfun",
  "tajga",
  "tajit",
  "tajnost",
  "taktika",
  "tamhle",
  "tampon",
  "tancovat",
  "tanec",
  "tanker",
  "tapeta",
  "tavenina",
  "tazatel",
  "technika",
  "tehdy",
  "tekutina",
  "telefon",
  "temnota",
  "tendence",
  "tenista",
  "tenor",
  "teplota",
  "tepna",
  "teprve",
  "terapie",
  "termoska",
  "textil",
  "ticho",
  "tiskopis",
  "titulek",
  "tkadlec",
  "tkanina",
  "tlapka",
  "tleskat",
  "tlukot",
  "tlupa",
  "tmel",
  "toaleta",
  "topinka",
  "topol",
  "torzo",
  "touha",
  "toulec",
  "tradice",
  "traktor",
  "tramp",
  "trasa",
  "traverza",
  "trefit",
  "trest",
  "trezor",
  "trhavina",
  "trhlina",
  "trochu",
  "trojice",
  "troska",
  "trouba",
  "trpce",
  "trpitel",
  "trpkost",
  "trubec",
  "truchlit",
  "truhlice",
  "trus",
  "trvat",
  "tudy",
  "tuhnout",
  "tuhost",
  "tundra",
  "turista",
  "turnaj",
  "tuzemsko",
  "tvaroh",
  "tvorba",
  "tvrdost",
  "tvrz",
  "tygr",
  "tykev",
  "ubohost",
  "uboze",
  "ubrat",
  "ubrousek",
  "ubrus",
  "ubytovna",
  "ucho",
  "uctivost",
  "udivit",
  "uhradit",
  "ujednat",
  "ujistit",
  "ujmout",
  "ukazatel",
  "uklidnit",
  "uklonit",
  "ukotvit",
  "ukrojit",
  "ulice",
  "ulita",
  "ulovit",
  "umyvadlo",
  "unavit",
  "uniforma",
  "uniknout",
  "upadnout",
  "uplatnit",
  "uplynout",
  "upoutat",
  "upravit",
  "uran",
  "urazit",
  "usednout",
  "usilovat",
  "usmrtit",
  "usnadnit",
  "usnout",
  "usoudit",
  "ustlat",
  "ustrnout",
  "utahovat",
  "utkat",
  "utlumit",
  "utonout",
  "utopenec",
  "utrousit",
  "uvalit",
  "uvolnit",
  "uvozovka",
  "uzdravit",
  "uzel",
  "uzenina",
  "uzlina",
  "uznat",
  "vagon",
  "valcha",
  "valoun",
  "vana",
  "vandal",
  "vanilka",
  "varan",
  "varhany",
  "varovat",
  "vcelku",
  "vchod",
  "vdova",
  "vedro",
  "vegetace",
  "vejce",
  "velbloud",
  "veletrh",
  "velitel",
  "velmoc",
  "velryba",
  "venkov",
  "veranda",
  "verze",
  "veselka",
  "veskrze",
  "vesnice",
  "vespodu",
  "vesta",
  "veterina",
  "veverka",
  "vibrace",
  "vichr",
  "videohra",
  "vidina",
  "vidle",
  "vila",
  "vinice",
  "viset",
  "vitalita",
  "vize",
  "vizitka",
  "vjezd",
  "vklad",
  "vkus",
  "vlajka",
  "vlak",
  "vlasec",
  "vlevo",
  "vlhkost",
  "vliv",
  "vlnovka",
  "vloupat",
  "vnucovat",
  "vnuk",
  "voda",
  "vodivost",
  "vodoznak",
  "vodstvo",
  "vojensky",
  "vojna",
  "vojsko",
  "volant",
  "volba",
  "volit",
  "volno",
  "voskovka",
  "vozidlo",
  "vozovna",
  "vpravo",
  "vrabec",
  "vracet",
  "vrah",
  "vrata",
  "vrba",
  "vrcholek",
  "vrhat",
  "vrstva",
  "vrtule",
  "vsadit",
  "vstoupit",
  "vstup",
  "vtip",
  "vybavit",
  "vybrat",
  "vychovat",
  "vydat",
  "vydra",
  "vyfotit",
  "vyhledat",
  "vyhnout",
  "vyhodit",
  "vyhradit",
  "vyhubit",
  "vyjasnit",
  "vyjet",
  "vyjmout",
  "vyklopit",
  "vykonat",
  "vylekat",
  "vymazat",
  "vymezit",
  "vymizet",
  "vymyslet",
  "vynechat",
  "vynikat",
  "vynutit",
  "vypadat",
  "vyplatit",
  "vypravit",
  "vypustit",
  "vyrazit",
  "vyrovnat",
  "vyrvat",
  "vyslovit",
  "vysoko",
  "vystavit",
  "vysunout",
  "vysypat",
  "vytasit",
  "vytesat",
  "vytratit",
  "vyvinout",
  "vyvolat",
  "vyvrhel",
  "vyzdobit",
  "vyznat",
  "vzadu",
  "vzbudit",
  "vzchopit",
  "vzdor",
  "vzduch",
  "vzdychat",
  "vzestup",
  "vzhledem",
  "vzkaz",
  "vzlykat",
  "vznik",
  "vzorek",
  "vzpoura",
  "vztah",
  "vztek",
  "xylofon",
  "zabrat",
  "zabydlet",
  "zachovat",
  "zadarmo",
  "zadusit",
  "zafoukat",
  "zahltit",
  "zahodit",
  "zahrada",
  "zahynout",
  "zajatec",
  "zajet",
  "zajistit",
  "zaklepat",
  "zakoupit",
  "zalepit",
  "zamezit",
  "zamotat",
  "zamyslet",
  "zanechat",
  "zanikat",
  "zaplatit",
  "zapojit",
  "zapsat",
  "zarazit",
  "zastavit",
  "zasunout",
  "zatajit",
  "zatemnit",
  "zatknout",
  "zaujmout",
  "zavalit",
  "zavelet",
  "zavinit",
  "zavolat",
  "zavrtat",
  "zazvonit",
  "zbavit",
  "zbrusu",
  "zbudovat",
  "zbytek",
  "zdaleka",
  "zdarma",
  "zdatnost",
  "zdivo",
  "zdobit",
  "zdroj",
  "zdvih",
  "zdymadlo",
  "zelenina",
  "zeman",
  "zemina",
  "zeptat",
  "zezadu",
  "zezdola",
  "zhatit",
  "zhltnout",
  "zhluboka",
  "zhotovit",
  "zhruba",
  "zima",
  "zimnice",
  "zjemnit",
  "zklamat",
  "zkoumat",
  "zkratka",
  "zkumavka",
  "zlato",
  "zlehka",
  "zloba",
  "zlom",
  "zlost",
  "zlozvyk",
  "zmapovat",
  "zmar",
  "zmatek",
  "zmije",
  "zmizet",
  "zmocnit",
  "zmodrat",
  "zmrzlina",
  "zmutovat",
  "znak",
  "znalost",
  "znamenat",
  "znovu",
  "zobrazit",
  "zotavit",
  "zoubek",
  "zoufale",
  "zplodit",
  "zpomalit",
  "zprava",
  "zprostit",
  "zprudka",
  "zprvu",
  "zrada",
  "zranit",
  "zrcadlo",
  "zrnitost",
  "zrno",
  "zrovna",
  "zrychlit",
  "zrzavost",
  "zticha",
  "ztratit",
  "zubovina",
  "zubr",
  "zvednout",
  "zvenku",
  "zvesela",
  "zvon",
  "zvrat",
  "zvukovod",
  "zvyk"
];
const require$$1 = [
  "的",
  "一",
  "是",
  "在",
  "不",
  "了",
  "有",
  "和",
  "人",
  "这",
  "中",
  "大",
  "为",
  "上",
  "个",
  "国",
  "我",
  "以",
  "要",
  "他",
  "时",
  "来",
  "用",
  "们",
  "生",
  "到",
  "作",
  "地",
  "于",
  "出",
  "就",
  "分",
  "对",
  "成",
  "会",
  "可",
  "主",
  "发",
  "年",
  "动",
  "同",
  "工",
  "也",
  "能",
  "下",
  "过",
  "子",
  "说",
  "产",
  "种",
  "面",
  "而",
  "方",
  "后",
  "多",
  "定",
  "行",
  "学",
  "法",
  "所",
  "民",
  "得",
  "经",
  "十",
  "三",
  "之",
  "进",
  "着",
  "等",
  "部",
  "度",
  "家",
  "电",
  "力",
  "里",
  "如",
  "水",
  "化",
  "高",
  "自",
  "二",
  "理",
  "起",
  "小",
  "物",
  "现",
  "实",
  "加",
  "量",
  "都",
  "两",
  "体",
  "制",
  "机",
  "当",
  "使",
  "点",
  "从",
  "业",
  "本",
  "去",
  "把",
  "性",
  "好",
  "应",
  "开",
  "它",
  "合",
  "还",
  "因",
  "由",
  "其",
  "些",
  "然",
  "前",
  "外",
  "天",
  "政",
  "四",
  "日",
  "那",
  "社",
  "义",
  "事",
  "平",
  "形",
  "相",
  "全",
  "表",
  "间",
  "样",
  "与",
  "关",
  "各",
  "重",
  "新",
  "线",
  "内",
  "数",
  "正",
  "心",
  "反",
  "你",
  "明",
  "看",
  "原",
  "又",
  "么",
  "利",
  "比",
  "或",
  "但",
  "质",
  "气",
  "第",
  "向",
  "道",
  "命",
  "此",
  "变",
  "条",
  "只",
  "没",
  "结",
  "解",
  "问",
  "意",
  "建",
  "月",
  "公",
  "无",
  "系",
  "军",
  "很",
  "情",
  "者",
  "最",
  "立",
  "代",
  "想",
  "已",
  "通",
  "并",
  "提",
  "直",
  "题",
  "党",
  "程",
  "展",
  "五",
  "果",
  "料",
  "象",
  "员",
  "革",
  "位",
  "入",
  "常",
  "文",
  "总",
  "次",
  "品",
  "式",
  "活",
  "设",
  "及",
  "管",
  "特",
  "件",
  "长",
  "求",
  "老",
  "头",
  "基",
  "资",
  "边",
  "流",
  "路",
  "级",
  "少",
  "图",
  "山",
  "统",
  "接",
  "知",
  "较",
  "将",
  "组",
  "见",
  "计",
  "别",
  "她",
  "手",
  "角",
  "期",
  "根",
  "论",
  "运",
  "农",
  "指",
  "几",
  "九",
  "区",
  "强",
  "放",
  "决",
  "西",
  "被",
  "干",
  "做",
  "必",
  "战",
  "先",
  "回",
  "则",
  "任",
  "取",
  "据",
  "处",
  "队",
  "南",
  "给",
  "色",
  "光",
  "门",
  "即",
  "保",
  "治",
  "北",
  "造",
  "百",
  "规",
  "热",
  "领",
  "七",
  "海",
  "口",
  "东",
  "导",
  "器",
  "压",
  "志",
  "世",
  "金",
  "增",
  "争",
  "济",
  "阶",
  "油",
  "思",
  "术",
  "极",
  "交",
  "受",
  "联",
  "什",
  "认",
  "六",
  "共",
  "权",
  "收",
  "证",
  "改",
  "清",
  "美",
  "再",
  "采",
  "转",
  "更",
  "单",
  "风",
  "切",
  "打",
  "白",
  "教",
  "速",
  "花",
  "带",
  "安",
  "场",
  "身",
  "车",
  "例",
  "真",
  "务",
  "具",
  "万",
  "每",
  "目",
  "至",
  "达",
  "走",
  "积",
  "示",
  "议",
  "声",
  "报",
  "斗",
  "完",
  "类",
  "八",
  "离",
  "华",
  "名",
  "确",
  "才",
  "科",
  "张",
  "信",
  "马",
  "节",
  "话",
  "米",
  "整",
  "空",
  "元",
  "况",
  "今",
  "集",
  "温",
  "传",
  "土",
  "许",
  "步",
  "群",
  "广",
  "石",
  "记",
  "需",
  "段",
  "研",
  "界",
  "拉",
  "林",
  "律",
  "叫",
  "且",
  "究",
  "观",
  "越",
  "织",
  "装",
  "影",
  "算",
  "低",
  "持",
  "音",
  "众",
  "书",
  "布",
  "复",
  "容",
  "儿",
  "须",
  "际",
  "商",
  "非",
  "验",
  "连",
  "断",
  "深",
  "难",
  "近",
  "矿",
  "千",
  "周",
  "委",
  "素",
  "技",
  "备",
  "半",
  "办",
  "青",
  "省",
  "列",
  "习",
  "响",
  "约",
  "支",
  "般",
  "史",
  "感",
  "劳",
  "便",
  "团",
  "往",
  "酸",
  "历",
  "市",
  "克",
  "何",
  "除",
  "消",
  "构",
  "府",
  "称",
  "太",
  "准",
  "精",
  "值",
  "号",
  "率",
  "族",
  "维",
  "划",
  "选",
  "标",
  "写",
  "存",
  "候",
  "毛",
  "亲",
  "快",
  "效",
  "斯",
  "院",
  "查",
  "江",
  "型",
  "眼",
  "王",
  "按",
  "格",
  "养",
  "易",
  "置",
  "派",
  "层",
  "片",
  "始",
  "却",
  "专",
  "状",
  "育",
  "厂",
  "京",
  "识",
  "适",
  "属",
  "圆",
  "包",
  "火",
  "住",
  "调",
  "满",
  "县",
  "局",
  "照",
  "参",
  "红",
  "细",
  "引",
  "听",
  "该",
  "铁",
  "价",
  "严",
  "首",
  "底",
  "液",
  "官",
  "德",
  "随",
  "病",
  "苏",
  "失",
  "尔",
  "死",
  "讲",
  "配",
  "女",
  "黄",
  "推",
  "显",
  "谈",
  "罪",
  "神",
  "艺",
  "呢",
  "席",
  "含",
  "企",
  "望",
  "密",
  "批",
  "营",
  "项",
  "防",
  "举",
  "球",
  "英",
  "氧",
  "势",
  "告",
  "李",
  "台",
  "落",
  "木",
  "帮",
  "轮",
  "破",
  "亚",
  "师",
  "围",
  "注",
  "远",
  "字",
  "材",
  "排",
  "供",
  "河",
  "态",
  "封",
  "另",
  "施",
  "减",
  "树",
  "溶",
  "怎",
  "止",
  "案",
  "言",
  "士",
  "均",
  "武",
  "固",
  "叶",
  "鱼",
  "波",
  "视",
  "仅",
  "费",
  "紧",
  "爱",
  "左",
  "章",
  "早",
  "朝",
  "害",
  "续",
  "轻",
  "服",
  "试",
  "食",
  "充",
  "兵",
  "源",
  "判",
  "护",
  "司",
  "足",
  "某",
  "练",
  "差",
  "致",
  "板",
  "田",
  "降",
  "黑",
  "犯",
  "负",
  "击",
  "范",
  "继",
  "兴",
  "似",
  "余",
  "坚",
  "曲",
  "输",
  "修",
  "故",
  "城",
  "夫",
  "够",
  "送",
  "笔",
  "船",
  "占",
  "右",
  "财",
  "吃",
  "富",
  "春",
  "职",
  "觉",
  "汉",
  "画",
  "功",
  "巴",
  "跟",
  "虽",
  "杂",
  "飞",
  "检",
  "吸",
  "助",
  "升",
  "阳",
  "互",
  "初",
  "创",
  "抗",
  "考",
  "投",
  "坏",
  "策",
  "古",
  "径",
  "换",
  "未",
  "跑",
  "留",
  "钢",
  "曾",
  "端",
  "责",
  "站",
  "简",
  "述",
  "钱",
  "副",
  "尽",
  "帝",
  "射",
  "草",
  "冲",
  "承",
  "独",
  "令",
  "限",
  "阿",
  "宣",
  "环",
  "双",
  "请",
  "超",
  "微",
  "让",
  "控",
  "州",
  "良",
  "轴",
  "找",
  "否",
  "纪",
  "益",
  "依",
  "优",
  "顶",
  "础",
  "载",
  "倒",
  "房",
  "突",
  "坐",
  "粉",
  "敌",
  "略",
  "客",
  "袁",
  "冷",
  "胜",
  "绝",
  "析",
  "块",
  "剂",
  "测",
  "丝",
  "协",
  "诉",
  "念",
  "陈",
  "仍",
  "罗",
  "盐",
  "友",
  "洋",
  "错",
  "苦",
  "夜",
  "刑",
  "移",
  "频",
  "逐",
  "靠",
  "混",
  "母",
  "短",
  "皮",
  "终",
  "聚",
  "汽",
  "村",
  "云",
  "哪",
  "既",
  "距",
  "卫",
  "停",
  "烈",
  "央",
  "察",
  "烧",
  "迅",
  "境",
  "若",
  "印",
  "洲",
  "刻",
  "括",
  "激",
  "孔",
  "搞",
  "甚",
  "室",
  "待",
  "核",
  "校",
  "散",
  "侵",
  "吧",
  "甲",
  "游",
  "久",
  "菜",
  "味",
  "旧",
  "模",
  "湖",
  "货",
  "损",
  "预",
  "阻",
  "毫",
  "普",
  "稳",
  "乙",
  "妈",
  "植",
  "息",
  "扩",
  "银",
  "语",
  "挥",
  "酒",
  "守",
  "拿",
  "序",
  "纸",
  "医",
  "缺",
  "雨",
  "吗",
  "针",
  "刘",
  "啊",
  "急",
  "唱",
  "误",
  "训",
  "愿",
  "审",
  "附",
  "获",
  "茶",
  "鲜",
  "粮",
  "斤",
  "孩",
  "脱",
  "硫",
  "肥",
  "善",
  "龙",
  "演",
  "父",
  "渐",
  "血",
  "欢",
  "械",
  "掌",
  "歌",
  "沙",
  "刚",
  "攻",
  "谓",
  "盾",
  "讨",
  "晚",
  "粒",
  "乱",
  "燃",
  "矛",
  "乎",
  "杀",
  "药",
  "宁",
  "鲁",
  "贵",
  "钟",
  "煤",
  "读",
  "班",
  "伯",
  "香",
  "介",
  "迫",
  "句",
  "丰",
  "培",
  "握",
  "兰",
  "担",
  "弦",
  "蛋",
  "沉",
  "假",
  "穿",
  "执",
  "答",
  "乐",
  "谁",
  "顺",
  "烟",
  "缩",
  "征",
  "脸",
  "喜",
  "松",
  "脚",
  "困",
  "异",
  "免",
  "背",
  "星",
  "福",
  "买",
  "染",
  "井",
  "概",
  "慢",
  "怕",
  "磁",
  "倍",
  "祖",
  "皇",
  "促",
  "静",
  "补",
  "评",
  "翻",
  "肉",
  "践",
  "尼",
  "衣",
  "宽",
  "扬",
  "棉",
  "希",
  "伤",
  "操",
  "垂",
  "秋",
  "宜",
  "氢",
  "套",
  "督",
  "振",
  "架",
  "亮",
  "末",
  "宪",
  "庆",
  "编",
  "牛",
  "触",
  "映",
  "雷",
  "销",
  "诗",
  "座",
  "居",
  "抓",
  "裂",
  "胞",
  "呼",
  "娘",
  "景",
  "威",
  "绿",
  "晶",
  "厚",
  "盟",
  "衡",
  "鸡",
  "孙",
  "延",
  "危",
  "胶",
  "屋",
  "乡",
  "临",
  "陆",
  "顾",
  "掉",
  "呀",
  "灯",
  "岁",
  "措",
  "束",
  "耐",
  "剧",
  "玉",
  "赵",
  "跳",
  "哥",
  "季",
  "课",
  "凯",
  "胡",
  "额",
  "款",
  "绍",
  "卷",
  "齐",
  "伟",
  "蒸",
  "殖",
  "永",
  "宗",
  "苗",
  "川",
  "炉",
  "岩",
  "弱",
  "零",
  "杨",
  "奏",
  "沿",
  "露",
  "杆",
  "探",
  "滑",
  "镇",
  "饭",
  "浓",
  "航",
  "怀",
  "赶",
  "库",
  "夺",
  "伊",
  "灵",
  "税",
  "途",
  "灭",
  "赛",
  "归",
  "召",
  "鼓",
  "播",
  "盘",
  "裁",
  "险",
  "康",
  "唯",
  "录",
  "菌",
  "纯",
  "借",
  "糖",
  "盖",
  "横",
  "符",
  "私",
  "努",
  "堂",
  "域",
  "枪",
  "润",
  "幅",
  "哈",
  "竟",
  "熟",
  "虫",
  "泽",
  "脑",
  "壤",
  "碳",
  "欧",
  "遍",
  "侧",
  "寨",
  "敢",
  "彻",
  "虑",
  "斜",
  "薄",
  "庭",
  "纳",
  "弹",
  "饲",
  "伸",
  "折",
  "麦",
  "湿",
  "暗",
  "荷",
  "瓦",
  "塞",
  "床",
  "筑",
  "恶",
  "户",
  "访",
  "塔",
  "奇",
  "透",
  "梁",
  "刀",
  "旋",
  "迹",
  "卡",
  "氯",
  "遇",
  "份",
  "毒",
  "泥",
  "退",
  "洗",
  "摆",
  "灰",
  "彩",
  "卖",
  "耗",
  "夏",
  "择",
  "忙",
  "铜",
  "献",
  "硬",
  "予",
  "繁",
  "圈",
  "雪",
  "函",
  "亦",
  "抽",
  "篇",
  "阵",
  "阴",
  "丁",
  "尺",
  "追",
  "堆",
  "雄",
  "迎",
  "泛",
  "爸",
  "楼",
  "避",
  "谋",
  "吨",
  "野",
  "猪",
  "旗",
  "累",
  "偏",
  "典",
  "馆",
  "索",
  "秦",
  "脂",
  "潮",
  "爷",
  "豆",
  "忽",
  "托",
  "惊",
  "塑",
  "遗",
  "愈",
  "朱",
  "替",
  "纤",
  "粗",
  "倾",
  "尚",
  "痛",
  "楚",
  "谢",
  "奋",
  "购",
  "磨",
  "君",
  "池",
  "旁",
  "碎",
  "骨",
  "监",
  "捕",
  "弟",
  "暴",
  "割",
  "贯",
  "殊",
  "释",
  "词",
  "亡",
  "壁",
  "顿",
  "宝",
  "午",
  "尘",
  "闻",
  "揭",
  "炮",
  "残",
  "冬",
  "桥",
  "妇",
  "警",
  "综",
  "招",
  "吴",
  "付",
  "浮",
  "遭",
  "徐",
  "您",
  "摇",
  "谷",
  "赞",
  "箱",
  "隔",
  "订",
  "男",
  "吹",
  "园",
  "纷",
  "唐",
  "败",
  "宋",
  "玻",
  "巨",
  "耕",
  "坦",
  "荣",
  "闭",
  "湾",
  "键",
  "凡",
  "驻",
  "锅",
  "救",
  "恩",
  "剥",
  "凝",
  "碱",
  "齿",
  "截",
  "炼",
  "麻",
  "纺",
  "禁",
  "废",
  "盛",
  "版",
  "缓",
  "净",
  "睛",
  "昌",
  "婚",
  "涉",
  "筒",
  "嘴",
  "插",
  "岸",
  "朗",
  "庄",
  "街",
  "藏",
  "姑",
  "贸",
  "腐",
  "奴",
  "啦",
  "惯",
  "乘",
  "伙",
  "恢",
  "匀",
  "纱",
  "扎",
  "辩",
  "耳",
  "彪",
  "臣",
  "亿",
  "璃",
  "抵",
  "脉",
  "秀",
  "萨",
  "俄",
  "网",
  "舞",
  "店",
  "喷",
  "纵",
  "寸",
  "汗",
  "挂",
  "洪",
  "贺",
  "闪",
  "柬",
  "爆",
  "烯",
  "津",
  "稻",
  "墙",
  "软",
  "勇",
  "像",
  "滚",
  "厘",
  "蒙",
  "芳",
  "肯",
  "坡",
  "柱",
  "荡",
  "腿",
  "仪",
  "旅",
  "尾",
  "轧",
  "冰",
  "贡",
  "登",
  "黎",
  "削",
  "钻",
  "勒",
  "逃",
  "障",
  "氨",
  "郭",
  "峰",
  "币",
  "港",
  "伏",
  "轨",
  "亩",
  "毕",
  "擦",
  "莫",
  "刺",
  "浪",
  "秘",
  "援",
  "株",
  "健",
  "售",
  "股",
  "岛",
  "甘",
  "泡",
  "睡",
  "童",
  "铸",
  "汤",
  "阀",
  "休",
  "汇",
  "舍",
  "牧",
  "绕",
  "炸",
  "哲",
  "磷",
  "绩",
  "朋",
  "淡",
  "尖",
  "启",
  "陷",
  "柴",
  "呈",
  "徒",
  "颜",
  "泪",
  "稍",
  "忘",
  "泵",
  "蓝",
  "拖",
  "洞",
  "授",
  "镜",
  "辛",
  "壮",
  "锋",
  "贫",
  "虚",
  "弯",
  "摩",
  "泰",
  "幼",
  "廷",
  "尊",
  "窗",
  "纲",
  "弄",
  "隶",
  "疑",
  "氏",
  "宫",
  "姐",
  "震",
  "瑞",
  "怪",
  "尤",
  "琴",
  "循",
  "描",
  "膜",
  "违",
  "夹",
  "腰",
  "缘",
  "珠",
  "穷",
  "森",
  "枝",
  "竹",
  "沟",
  "催",
  "绳",
  "忆",
  "邦",
  "剩",
  "幸",
  "浆",
  "栏",
  "拥",
  "牙",
  "贮",
  "礼",
  "滤",
  "钠",
  "纹",
  "罢",
  "拍",
  "咱",
  "喊",
  "袖",
  "埃",
  "勤",
  "罚",
  "焦",
  "潜",
  "伍",
  "墨",
  "欲",
  "缝",
  "姓",
  "刊",
  "饱",
  "仿",
  "奖",
  "铝",
  "鬼",
  "丽",
  "跨",
  "默",
  "挖",
  "链",
  "扫",
  "喝",
  "袋",
  "炭",
  "污",
  "幕",
  "诸",
  "弧",
  "励",
  "梅",
  "奶",
  "洁",
  "灾",
  "舟",
  "鉴",
  "苯",
  "讼",
  "抱",
  "毁",
  "懂",
  "寒",
  "智",
  "埔",
  "寄",
  "届",
  "跃",
  "渡",
  "挑",
  "丹",
  "艰",
  "贝",
  "碰",
  "拔",
  "爹",
  "戴",
  "码",
  "梦",
  "芽",
  "熔",
  "赤",
  "渔",
  "哭",
  "敬",
  "颗",
  "奔",
  "铅",
  "仲",
  "虎",
  "稀",
  "妹",
  "乏",
  "珍",
  "申",
  "桌",
  "遵",
  "允",
  "隆",
  "螺",
  "仓",
  "魏",
  "锐",
  "晓",
  "氮",
  "兼",
  "隐",
  "碍",
  "赫",
  "拨",
  "忠",
  "肃",
  "缸",
  "牵",
  "抢",
  "博",
  "巧",
  "壳",
  "兄",
  "杜",
  "讯",
  "诚",
  "碧",
  "祥",
  "柯",
  "页",
  "巡",
  "矩",
  "悲",
  "灌",
  "龄",
  "伦",
  "票",
  "寻",
  "桂",
  "铺",
  "圣",
  "恐",
  "恰",
  "郑",
  "趣",
  "抬",
  "荒",
  "腾",
  "贴",
  "柔",
  "滴",
  "猛",
  "阔",
  "辆",
  "妻",
  "填",
  "撤",
  "储",
  "签",
  "闹",
  "扰",
  "紫",
  "砂",
  "递",
  "戏",
  "吊",
  "陶",
  "伐",
  "喂",
  "疗",
  "瓶",
  "婆",
  "抚",
  "臂",
  "摸",
  "忍",
  "虾",
  "蜡",
  "邻",
  "胸",
  "巩",
  "挤",
  "偶",
  "弃",
  "槽",
  "劲",
  "乳",
  "邓",
  "吉",
  "仁",
  "烂",
  "砖",
  "租",
  "乌",
  "舰",
  "伴",
  "瓜",
  "浅",
  "丙",
  "暂",
  "燥",
  "橡",
  "柳",
  "迷",
  "暖",
  "牌",
  "秧",
  "胆",
  "详",
  "簧",
  "踏",
  "瓷",
  "谱",
  "呆",
  "宾",
  "糊",
  "洛",
  "辉",
  "愤",
  "竞",
  "隙",
  "怒",
  "粘",
  "乃",
  "绪",
  "肩",
  "籍",
  "敏",
  "涂",
  "熙",
  "皆",
  "侦",
  "悬",
  "掘",
  "享",
  "纠",
  "醒",
  "狂",
  "锁",
  "淀",
  "恨",
  "牲",
  "霸",
  "爬",
  "赏",
  "逆",
  "玩",
  "陵",
  "祝",
  "秒",
  "浙",
  "貌",
  "役",
  "彼",
  "悉",
  "鸭",
  "趋",
  "凤",
  "晨",
  "畜",
  "辈",
  "秩",
  "卵",
  "署",
  "梯",
  "炎",
  "滩",
  "棋",
  "驱",
  "筛",
  "峡",
  "冒",
  "啥",
  "寿",
  "译",
  "浸",
  "泉",
  "帽",
  "迟",
  "硅",
  "疆",
  "贷",
  "漏",
  "稿",
  "冠",
  "嫩",
  "胁",
  "芯",
  "牢",
  "叛",
  "蚀",
  "奥",
  "鸣",
  "岭",
  "羊",
  "凭",
  "串",
  "塘",
  "绘",
  "酵",
  "融",
  "盆",
  "锡",
  "庙",
  "筹",
  "冻",
  "辅",
  "摄",
  "袭",
  "筋",
  "拒",
  "僚",
  "旱",
  "钾",
  "鸟",
  "漆",
  "沈",
  "眉",
  "疏",
  "添",
  "棒",
  "穗",
  "硝",
  "韩",
  "逼",
  "扭",
  "侨",
  "凉",
  "挺",
  "碗",
  "栽",
  "炒",
  "杯",
  "患",
  "馏",
  "劝",
  "豪",
  "辽",
  "勃",
  "鸿",
  "旦",
  "吏",
  "拜",
  "狗",
  "埋",
  "辊",
  "掩",
  "饮",
  "搬",
  "骂",
  "辞",
  "勾",
  "扣",
  "估",
  "蒋",
  "绒",
  "雾",
  "丈",
  "朵",
  "姆",
  "拟",
  "宇",
  "辑",
  "陕",
  "雕",
  "偿",
  "蓄",
  "崇",
  "剪",
  "倡",
  "厅",
  "咬",
  "驶",
  "薯",
  "刷",
  "斥",
  "番",
  "赋",
  "奉",
  "佛",
  "浇",
  "漫",
  "曼",
  "扇",
  "钙",
  "桃",
  "扶",
  "仔",
  "返",
  "俗",
  "亏",
  "腔",
  "鞋",
  "棱",
  "覆",
  "框",
  "悄",
  "叔",
  "撞",
  "骗",
  "勘",
  "旺",
  "沸",
  "孤",
  "吐",
  "孟",
  "渠",
  "屈",
  "疾",
  "妙",
  "惜",
  "仰",
  "狠",
  "胀",
  "谐",
  "抛",
  "霉",
  "桑",
  "岗",
  "嘛",
  "衰",
  "盗",
  "渗",
  "脏",
  "赖",
  "涌",
  "甜",
  "曹",
  "阅",
  "肌",
  "哩",
  "厉",
  "烃",
  "纬",
  "毅",
  "昨",
  "伪",
  "症",
  "煮",
  "叹",
  "钉",
  "搭",
  "茎",
  "笼",
  "酷",
  "偷",
  "弓",
  "锥",
  "恒",
  "杰",
  "坑",
  "鼻",
  "翼",
  "纶",
  "叙",
  "狱",
  "逮",
  "罐",
  "络",
  "棚",
  "抑",
  "膨",
  "蔬",
  "寺",
  "骤",
  "穆",
  "冶",
  "枯",
  "册",
  "尸",
  "凸",
  "绅",
  "坯",
  "牺",
  "焰",
  "轰",
  "欣",
  "晋",
  "瘦",
  "御",
  "锭",
  "锦",
  "丧",
  "旬",
  "锻",
  "垄",
  "搜",
  "扑",
  "邀",
  "亭",
  "酯",
  "迈",
  "舒",
  "脆",
  "酶",
  "闲",
  "忧",
  "酚",
  "顽",
  "羽",
  "涨",
  "卸",
  "仗",
  "陪",
  "辟",
  "惩",
  "杭",
  "姚",
  "肚",
  "捉",
  "飘",
  "漂",
  "昆",
  "欺",
  "吾",
  "郎",
  "烷",
  "汁",
  "呵",
  "饰",
  "萧",
  "雅",
  "邮",
  "迁",
  "燕",
  "撒",
  "姻",
  "赴",
  "宴",
  "烦",
  "债",
  "帐",
  "斑",
  "铃",
  "旨",
  "醇",
  "董",
  "饼",
  "雏",
  "姿",
  "拌",
  "傅",
  "腹",
  "妥",
  "揉",
  "贤",
  "拆",
  "歪",
  "葡",
  "胺",
  "丢",
  "浩",
  "徽",
  "昂",
  "垫",
  "挡",
  "览",
  "贪",
  "慰",
  "缴",
  "汪",
  "慌",
  "冯",
  "诺",
  "姜",
  "谊",
  "凶",
  "劣",
  "诬",
  "耀",
  "昏",
  "躺",
  "盈",
  "骑",
  "乔",
  "溪",
  "丛",
  "卢",
  "抹",
  "闷",
  "咨",
  "刮",
  "驾",
  "缆",
  "悟",
  "摘",
  "铒",
  "掷",
  "颇",
  "幻",
  "柄",
  "惠",
  "惨",
  "佳",
  "仇",
  "腊",
  "窝",
  "涤",
  "剑",
  "瞧",
  "堡",
  "泼",
  "葱",
  "罩",
  "霍",
  "捞",
  "胎",
  "苍",
  "滨",
  "俩",
  "捅",
  "湘",
  "砍",
  "霞",
  "邵",
  "萄",
  "疯",
  "淮",
  "遂",
  "熊",
  "粪",
  "烘",
  "宿",
  "档",
  "戈",
  "驳",
  "嫂",
  "裕",
  "徙",
  "箭",
  "捐",
  "肠",
  "撑",
  "晒",
  "辨",
  "殿",
  "莲",
  "摊",
  "搅",
  "酱",
  "屏",
  "疫",
  "哀",
  "蔡",
  "堵",
  "沫",
  "皱",
  "畅",
  "叠",
  "阁",
  "莱",
  "敲",
  "辖",
  "钩",
  "痕",
  "坝",
  "巷",
  "饿",
  "祸",
  "丘",
  "玄",
  "溜",
  "曰",
  "逻",
  "彭",
  "尝",
  "卿",
  "妨",
  "艇",
  "吞",
  "韦",
  "怨",
  "矮",
  "歇"
];
const require$$2 = [
  "的",
  "一",
  "是",
  "在",
  "不",
  "了",
  "有",
  "和",
  "人",
  "這",
  "中",
  "大",
  "為",
  "上",
  "個",
  "國",
  "我",
  "以",
  "要",
  "他",
  "時",
  "來",
  "用",
  "們",
  "生",
  "到",
  "作",
  "地",
  "於",
  "出",
  "就",
  "分",
  "對",
  "成",
  "會",
  "可",
  "主",
  "發",
  "年",
  "動",
  "同",
  "工",
  "也",
  "能",
  "下",
  "過",
  "子",
  "說",
  "產",
  "種",
  "面",
  "而",
  "方",
  "後",
  "多",
  "定",
  "行",
  "學",
  "法",
  "所",
  "民",
  "得",
  "經",
  "十",
  "三",
  "之",
  "進",
  "著",
  "等",
  "部",
  "度",
  "家",
  "電",
  "力",
  "裡",
  "如",
  "水",
  "化",
  "高",
  "自",
  "二",
  "理",
  "起",
  "小",
  "物",
  "現",
  "實",
  "加",
  "量",
  "都",
  "兩",
  "體",
  "制",
  "機",
  "當",
  "使",
  "點",
  "從",
  "業",
  "本",
  "去",
  "把",
  "性",
  "好",
  "應",
  "開",
  "它",
  "合",
  "還",
  "因",
  "由",
  "其",
  "些",
  "然",
  "前",
  "外",
  "天",
  "政",
  "四",
  "日",
  "那",
  "社",
  "義",
  "事",
  "平",
  "形",
  "相",
  "全",
  "表",
  "間",
  "樣",
  "與",
  "關",
  "各",
  "重",
  "新",
  "線",
  "內",
  "數",
  "正",
  "心",
  "反",
  "你",
  "明",
  "看",
  "原",
  "又",
  "麼",
  "利",
  "比",
  "或",
  "但",
  "質",
  "氣",
  "第",
  "向",
  "道",
  "命",
  "此",
  "變",
  "條",
  "只",
  "沒",
  "結",
  "解",
  "問",
  "意",
  "建",
  "月",
  "公",
  "無",
  "系",
  "軍",
  "很",
  "情",
  "者",
  "最",
  "立",
  "代",
  "想",
  "已",
  "通",
  "並",
  "提",
  "直",
  "題",
  "黨",
  "程",
  "展",
  "五",
  "果",
  "料",
  "象",
  "員",
  "革",
  "位",
  "入",
  "常",
  "文",
  "總",
  "次",
  "品",
  "式",
  "活",
  "設",
  "及",
  "管",
  "特",
  "件",
  "長",
  "求",
  "老",
  "頭",
  "基",
  "資",
  "邊",
  "流",
  "路",
  "級",
  "少",
  "圖",
  "山",
  "統",
  "接",
  "知",
  "較",
  "將",
  "組",
  "見",
  "計",
  "別",
  "她",
  "手",
  "角",
  "期",
  "根",
  "論",
  "運",
  "農",
  "指",
  "幾",
  "九",
  "區",
  "強",
  "放",
  "決",
  "西",
  "被",
  "幹",
  "做",
  "必",
  "戰",
  "先",
  "回",
  "則",
  "任",
  "取",
  "據",
  "處",
  "隊",
  "南",
  "給",
  "色",
  "光",
  "門",
  "即",
  "保",
  "治",
  "北",
  "造",
  "百",
  "規",
  "熱",
  "領",
  "七",
  "海",
  "口",
  "東",
  "導",
  "器",
  "壓",
  "志",
  "世",
  "金",
  "增",
  "爭",
  "濟",
  "階",
  "油",
  "思",
  "術",
  "極",
  "交",
  "受",
  "聯",
  "什",
  "認",
  "六",
  "共",
  "權",
  "收",
  "證",
  "改",
  "清",
  "美",
  "再",
  "採",
  "轉",
  "更",
  "單",
  "風",
  "切",
  "打",
  "白",
  "教",
  "速",
  "花",
  "帶",
  "安",
  "場",
  "身",
  "車",
  "例",
  "真",
  "務",
  "具",
  "萬",
  "每",
  "目",
  "至",
  "達",
  "走",
  "積",
  "示",
  "議",
  "聲",
  "報",
  "鬥",
  "完",
  "類",
  "八",
  "離",
  "華",
  "名",
  "確",
  "才",
  "科",
  "張",
  "信",
  "馬",
  "節",
  "話",
  "米",
  "整",
  "空",
  "元",
  "況",
  "今",
  "集",
  "溫",
  "傳",
  "土",
  "許",
  "步",
  "群",
  "廣",
  "石",
  "記",
  "需",
  "段",
  "研",
  "界",
  "拉",
  "林",
  "律",
  "叫",
  "且",
  "究",
  "觀",
  "越",
  "織",
  "裝",
  "影",
  "算",
  "低",
  "持",
  "音",
  "眾",
  "書",
  "布",
  "复",
  "容",
  "兒",
  "須",
  "際",
  "商",
  "非",
  "驗",
  "連",
  "斷",
  "深",
  "難",
  "近",
  "礦",
  "千",
  "週",
  "委",
  "素",
  "技",
  "備",
  "半",
  "辦",
  "青",
  "省",
  "列",
  "習",
  "響",
  "約",
  "支",
  "般",
  "史",
  "感",
  "勞",
  "便",
  "團",
  "往",
  "酸",
  "歷",
  "市",
  "克",
  "何",
  "除",
  "消",
  "構",
  "府",
  "稱",
  "太",
  "準",
  "精",
  "值",
  "號",
  "率",
  "族",
  "維",
  "劃",
  "選",
  "標",
  "寫",
  "存",
  "候",
  "毛",
  "親",
  "快",
  "效",
  "斯",
  "院",
  "查",
  "江",
  "型",
  "眼",
  "王",
  "按",
  "格",
  "養",
  "易",
  "置",
  "派",
  "層",
  "片",
  "始",
  "卻",
  "專",
  "狀",
  "育",
  "廠",
  "京",
  "識",
  "適",
  "屬",
  "圓",
  "包",
  "火",
  "住",
  "調",
  "滿",
  "縣",
  "局",
  "照",
  "參",
  "紅",
  "細",
  "引",
  "聽",
  "該",
  "鐵",
  "價",
  "嚴",
  "首",
  "底",
  "液",
  "官",
  "德",
  "隨",
  "病",
  "蘇",
  "失",
  "爾",
  "死",
  "講",
  "配",
  "女",
  "黃",
  "推",
  "顯",
  "談",
  "罪",
  "神",
  "藝",
  "呢",
  "席",
  "含",
  "企",
  "望",
  "密",
  "批",
  "營",
  "項",
  "防",
  "舉",
  "球",
  "英",
  "氧",
  "勢",
  "告",
  "李",
  "台",
  "落",
  "木",
  "幫",
  "輪",
  "破",
  "亞",
  "師",
  "圍",
  "注",
  "遠",
  "字",
  "材",
  "排",
  "供",
  "河",
  "態",
  "封",
  "另",
  "施",
  "減",
  "樹",
  "溶",
  "怎",
  "止",
  "案",
  "言",
  "士",
  "均",
  "武",
  "固",
  "葉",
  "魚",
  "波",
  "視",
  "僅",
  "費",
  "緊",
  "愛",
  "左",
  "章",
  "早",
  "朝",
  "害",
  "續",
  "輕",
  "服",
  "試",
  "食",
  "充",
  "兵",
  "源",
  "判",
  "護",
  "司",
  "足",
  "某",
  "練",
  "差",
  "致",
  "板",
  "田",
  "降",
  "黑",
  "犯",
  "負",
  "擊",
  "范",
  "繼",
  "興",
  "似",
  "餘",
  "堅",
  "曲",
  "輸",
  "修",
  "故",
  "城",
  "夫",
  "夠",
  "送",
  "筆",
  "船",
  "佔",
  "右",
  "財",
  "吃",
  "富",
  "春",
  "職",
  "覺",
  "漢",
  "畫",
  "功",
  "巴",
  "跟",
  "雖",
  "雜",
  "飛",
  "檢",
  "吸",
  "助",
  "昇",
  "陽",
  "互",
  "初",
  "創",
  "抗",
  "考",
  "投",
  "壞",
  "策",
  "古",
  "徑",
  "換",
  "未",
  "跑",
  "留",
  "鋼",
  "曾",
  "端",
  "責",
  "站",
  "簡",
  "述",
  "錢",
  "副",
  "盡",
  "帝",
  "射",
  "草",
  "衝",
  "承",
  "獨",
  "令",
  "限",
  "阿",
  "宣",
  "環",
  "雙",
  "請",
  "超",
  "微",
  "讓",
  "控",
  "州",
  "良",
  "軸",
  "找",
  "否",
  "紀",
  "益",
  "依",
  "優",
  "頂",
  "礎",
  "載",
  "倒",
  "房",
  "突",
  "坐",
  "粉",
  "敵",
  "略",
  "客",
  "袁",
  "冷",
  "勝",
  "絕",
  "析",
  "塊",
  "劑",
  "測",
  "絲",
  "協",
  "訴",
  "念",
  "陳",
  "仍",
  "羅",
  "鹽",
  "友",
  "洋",
  "錯",
  "苦",
  "夜",
  "刑",
  "移",
  "頻",
  "逐",
  "靠",
  "混",
  "母",
  "短",
  "皮",
  "終",
  "聚",
  "汽",
  "村",
  "雲",
  "哪",
  "既",
  "距",
  "衛",
  "停",
  "烈",
  "央",
  "察",
  "燒",
  "迅",
  "境",
  "若",
  "印",
  "洲",
  "刻",
  "括",
  "激",
  "孔",
  "搞",
  "甚",
  "室",
  "待",
  "核",
  "校",
  "散",
  "侵",
  "吧",
  "甲",
  "遊",
  "久",
  "菜",
  "味",
  "舊",
  "模",
  "湖",
  "貨",
  "損",
  "預",
  "阻",
  "毫",
  "普",
  "穩",
  "乙",
  "媽",
  "植",
  "息",
  "擴",
  "銀",
  "語",
  "揮",
  "酒",
  "守",
  "拿",
  "序",
  "紙",
  "醫",
  "缺",
  "雨",
  "嗎",
  "針",
  "劉",
  "啊",
  "急",
  "唱",
  "誤",
  "訓",
  "願",
  "審",
  "附",
  "獲",
  "茶",
  "鮮",
  "糧",
  "斤",
  "孩",
  "脫",
  "硫",
  "肥",
  "善",
  "龍",
  "演",
  "父",
  "漸",
  "血",
  "歡",
  "械",
  "掌",
  "歌",
  "沙",
  "剛",
  "攻",
  "謂",
  "盾",
  "討",
  "晚",
  "粒",
  "亂",
  "燃",
  "矛",
  "乎",
  "殺",
  "藥",
  "寧",
  "魯",
  "貴",
  "鐘",
  "煤",
  "讀",
  "班",
  "伯",
  "香",
  "介",
  "迫",
  "句",
  "豐",
  "培",
  "握",
  "蘭",
  "擔",
  "弦",
  "蛋",
  "沉",
  "假",
  "穿",
  "執",
  "答",
  "樂",
  "誰",
  "順",
  "煙",
  "縮",
  "徵",
  "臉",
  "喜",
  "松",
  "腳",
  "困",
  "異",
  "免",
  "背",
  "星",
  "福",
  "買",
  "染",
  "井",
  "概",
  "慢",
  "怕",
  "磁",
  "倍",
  "祖",
  "皇",
  "促",
  "靜",
  "補",
  "評",
  "翻",
  "肉",
  "踐",
  "尼",
  "衣",
  "寬",
  "揚",
  "棉",
  "希",
  "傷",
  "操",
  "垂",
  "秋",
  "宜",
  "氫",
  "套",
  "督",
  "振",
  "架",
  "亮",
  "末",
  "憲",
  "慶",
  "編",
  "牛",
  "觸",
  "映",
  "雷",
  "銷",
  "詩",
  "座",
  "居",
  "抓",
  "裂",
  "胞",
  "呼",
  "娘",
  "景",
  "威",
  "綠",
  "晶",
  "厚",
  "盟",
  "衡",
  "雞",
  "孫",
  "延",
  "危",
  "膠",
  "屋",
  "鄉",
  "臨",
  "陸",
  "顧",
  "掉",
  "呀",
  "燈",
  "歲",
  "措",
  "束",
  "耐",
  "劇",
  "玉",
  "趙",
  "跳",
  "哥",
  "季",
  "課",
  "凱",
  "胡",
  "額",
  "款",
  "紹",
  "卷",
  "齊",
  "偉",
  "蒸",
  "殖",
  "永",
  "宗",
  "苗",
  "川",
  "爐",
  "岩",
  "弱",
  "零",
  "楊",
  "奏",
  "沿",
  "露",
  "桿",
  "探",
  "滑",
  "鎮",
  "飯",
  "濃",
  "航",
  "懷",
  "趕",
  "庫",
  "奪",
  "伊",
  "靈",
  "稅",
  "途",
  "滅",
  "賽",
  "歸",
  "召",
  "鼓",
  "播",
  "盤",
  "裁",
  "險",
  "康",
  "唯",
  "錄",
  "菌",
  "純",
  "借",
  "糖",
  "蓋",
  "橫",
  "符",
  "私",
  "努",
  "堂",
  "域",
  "槍",
  "潤",
  "幅",
  "哈",
  "竟",
  "熟",
  "蟲",
  "澤",
  "腦",
  "壤",
  "碳",
  "歐",
  "遍",
  "側",
  "寨",
  "敢",
  "徹",
  "慮",
  "斜",
  "薄",
  "庭",
  "納",
  "彈",
  "飼",
  "伸",
  "折",
  "麥",
  "濕",
  "暗",
  "荷",
  "瓦",
  "塞",
  "床",
  "築",
  "惡",
  "戶",
  "訪",
  "塔",
  "奇",
  "透",
  "梁",
  "刀",
  "旋",
  "跡",
  "卡",
  "氯",
  "遇",
  "份",
  "毒",
  "泥",
  "退",
  "洗",
  "擺",
  "灰",
  "彩",
  "賣",
  "耗",
  "夏",
  "擇",
  "忙",
  "銅",
  "獻",
  "硬",
  "予",
  "繁",
  "圈",
  "雪",
  "函",
  "亦",
  "抽",
  "篇",
  "陣",
  "陰",
  "丁",
  "尺",
  "追",
  "堆",
  "雄",
  "迎",
  "泛",
  "爸",
  "樓",
  "避",
  "謀",
  "噸",
  "野",
  "豬",
  "旗",
  "累",
  "偏",
  "典",
  "館",
  "索",
  "秦",
  "脂",
  "潮",
  "爺",
  "豆",
  "忽",
  "托",
  "驚",
  "塑",
  "遺",
  "愈",
  "朱",
  "替",
  "纖",
  "粗",
  "傾",
  "尚",
  "痛",
  "楚",
  "謝",
  "奮",
  "購",
  "磨",
  "君",
  "池",
  "旁",
  "碎",
  "骨",
  "監",
  "捕",
  "弟",
  "暴",
  "割",
  "貫",
  "殊",
  "釋",
  "詞",
  "亡",
  "壁",
  "頓",
  "寶",
  "午",
  "塵",
  "聞",
  "揭",
  "炮",
  "殘",
  "冬",
  "橋",
  "婦",
  "警",
  "綜",
  "招",
  "吳",
  "付",
  "浮",
  "遭",
  "徐",
  "您",
  "搖",
  "谷",
  "贊",
  "箱",
  "隔",
  "訂",
  "男",
  "吹",
  "園",
  "紛",
  "唐",
  "敗",
  "宋",
  "玻",
  "巨",
  "耕",
  "坦",
  "榮",
  "閉",
  "灣",
  "鍵",
  "凡",
  "駐",
  "鍋",
  "救",
  "恩",
  "剝",
  "凝",
  "鹼",
  "齒",
  "截",
  "煉",
  "麻",
  "紡",
  "禁",
  "廢",
  "盛",
  "版",
  "緩",
  "淨",
  "睛",
  "昌",
  "婚",
  "涉",
  "筒",
  "嘴",
  "插",
  "岸",
  "朗",
  "莊",
  "街",
  "藏",
  "姑",
  "貿",
  "腐",
  "奴",
  "啦",
  "慣",
  "乘",
  "夥",
  "恢",
  "勻",
  "紗",
  "扎",
  "辯",
  "耳",
  "彪",
  "臣",
  "億",
  "璃",
  "抵",
  "脈",
  "秀",
  "薩",
  "俄",
  "網",
  "舞",
  "店",
  "噴",
  "縱",
  "寸",
  "汗",
  "掛",
  "洪",
  "賀",
  "閃",
  "柬",
  "爆",
  "烯",
  "津",
  "稻",
  "牆",
  "軟",
  "勇",
  "像",
  "滾",
  "厘",
  "蒙",
  "芳",
  "肯",
  "坡",
  "柱",
  "盪",
  "腿",
  "儀",
  "旅",
  "尾",
  "軋",
  "冰",
  "貢",
  "登",
  "黎",
  "削",
  "鑽",
  "勒",
  "逃",
  "障",
  "氨",
  "郭",
  "峰",
  "幣",
  "港",
  "伏",
  "軌",
  "畝",
  "畢",
  "擦",
  "莫",
  "刺",
  "浪",
  "秘",
  "援",
  "株",
  "健",
  "售",
  "股",
  "島",
  "甘",
  "泡",
  "睡",
  "童",
  "鑄",
  "湯",
  "閥",
  "休",
  "匯",
  "舍",
  "牧",
  "繞",
  "炸",
  "哲",
  "磷",
  "績",
  "朋",
  "淡",
  "尖",
  "啟",
  "陷",
  "柴",
  "呈",
  "徒",
  "顏",
  "淚",
  "稍",
  "忘",
  "泵",
  "藍",
  "拖",
  "洞",
  "授",
  "鏡",
  "辛",
  "壯",
  "鋒",
  "貧",
  "虛",
  "彎",
  "摩",
  "泰",
  "幼",
  "廷",
  "尊",
  "窗",
  "綱",
  "弄",
  "隸",
  "疑",
  "氏",
  "宮",
  "姐",
  "震",
  "瑞",
  "怪",
  "尤",
  "琴",
  "循",
  "描",
  "膜",
  "違",
  "夾",
  "腰",
  "緣",
  "珠",
  "窮",
  "森",
  "枝",
  "竹",
  "溝",
  "催",
  "繩",
  "憶",
  "邦",
  "剩",
  "幸",
  "漿",
  "欄",
  "擁",
  "牙",
  "貯",
  "禮",
  "濾",
  "鈉",
  "紋",
  "罷",
  "拍",
  "咱",
  "喊",
  "袖",
  "埃",
  "勤",
  "罰",
  "焦",
  "潛",
  "伍",
  "墨",
  "欲",
  "縫",
  "姓",
  "刊",
  "飽",
  "仿",
  "獎",
  "鋁",
  "鬼",
  "麗",
  "跨",
  "默",
  "挖",
  "鏈",
  "掃",
  "喝",
  "袋",
  "炭",
  "污",
  "幕",
  "諸",
  "弧",
  "勵",
  "梅",
  "奶",
  "潔",
  "災",
  "舟",
  "鑑",
  "苯",
  "訟",
  "抱",
  "毀",
  "懂",
  "寒",
  "智",
  "埔",
  "寄",
  "屆",
  "躍",
  "渡",
  "挑",
  "丹",
  "艱",
  "貝",
  "碰",
  "拔",
  "爹",
  "戴",
  "碼",
  "夢",
  "芽",
  "熔",
  "赤",
  "漁",
  "哭",
  "敬",
  "顆",
  "奔",
  "鉛",
  "仲",
  "虎",
  "稀",
  "妹",
  "乏",
  "珍",
  "申",
  "桌",
  "遵",
  "允",
  "隆",
  "螺",
  "倉",
  "魏",
  "銳",
  "曉",
  "氮",
  "兼",
  "隱",
  "礙",
  "赫",
  "撥",
  "忠",
  "肅",
  "缸",
  "牽",
  "搶",
  "博",
  "巧",
  "殼",
  "兄",
  "杜",
  "訊",
  "誠",
  "碧",
  "祥",
  "柯",
  "頁",
  "巡",
  "矩",
  "悲",
  "灌",
  "齡",
  "倫",
  "票",
  "尋",
  "桂",
  "鋪",
  "聖",
  "恐",
  "恰",
  "鄭",
  "趣",
  "抬",
  "荒",
  "騰",
  "貼",
  "柔",
  "滴",
  "猛",
  "闊",
  "輛",
  "妻",
  "填",
  "撤",
  "儲",
  "簽",
  "鬧",
  "擾",
  "紫",
  "砂",
  "遞",
  "戲",
  "吊",
  "陶",
  "伐",
  "餵",
  "療",
  "瓶",
  "婆",
  "撫",
  "臂",
  "摸",
  "忍",
  "蝦",
  "蠟",
  "鄰",
  "胸",
  "鞏",
  "擠",
  "偶",
  "棄",
  "槽",
  "勁",
  "乳",
  "鄧",
  "吉",
  "仁",
  "爛",
  "磚",
  "租",
  "烏",
  "艦",
  "伴",
  "瓜",
  "淺",
  "丙",
  "暫",
  "燥",
  "橡",
  "柳",
  "迷",
  "暖",
  "牌",
  "秧",
  "膽",
  "詳",
  "簧",
  "踏",
  "瓷",
  "譜",
  "呆",
  "賓",
  "糊",
  "洛",
  "輝",
  "憤",
  "競",
  "隙",
  "怒",
  "粘",
  "乃",
  "緒",
  "肩",
  "籍",
  "敏",
  "塗",
  "熙",
  "皆",
  "偵",
  "懸",
  "掘",
  "享",
  "糾",
  "醒",
  "狂",
  "鎖",
  "淀",
  "恨",
  "牲",
  "霸",
  "爬",
  "賞",
  "逆",
  "玩",
  "陵",
  "祝",
  "秒",
  "浙",
  "貌",
  "役",
  "彼",
  "悉",
  "鴨",
  "趨",
  "鳳",
  "晨",
  "畜",
  "輩",
  "秩",
  "卵",
  "署",
  "梯",
  "炎",
  "灘",
  "棋",
  "驅",
  "篩",
  "峽",
  "冒",
  "啥",
  "壽",
  "譯",
  "浸",
  "泉",
  "帽",
  "遲",
  "矽",
  "疆",
  "貸",
  "漏",
  "稿",
  "冠",
  "嫩",
  "脅",
  "芯",
  "牢",
  "叛",
  "蝕",
  "奧",
  "鳴",
  "嶺",
  "羊",
  "憑",
  "串",
  "塘",
  "繪",
  "酵",
  "融",
  "盆",
  "錫",
  "廟",
  "籌",
  "凍",
  "輔",
  "攝",
  "襲",
  "筋",
  "拒",
  "僚",
  "旱",
  "鉀",
  "鳥",
  "漆",
  "沈",
  "眉",
  "疏",
  "添",
  "棒",
  "穗",
  "硝",
  "韓",
  "逼",
  "扭",
  "僑",
  "涼",
  "挺",
  "碗",
  "栽",
  "炒",
  "杯",
  "患",
  "餾",
  "勸",
  "豪",
  "遼",
  "勃",
  "鴻",
  "旦",
  "吏",
  "拜",
  "狗",
  "埋",
  "輥",
  "掩",
  "飲",
  "搬",
  "罵",
  "辭",
  "勾",
  "扣",
  "估",
  "蔣",
  "絨",
  "霧",
  "丈",
  "朵",
  "姆",
  "擬",
  "宇",
  "輯",
  "陝",
  "雕",
  "償",
  "蓄",
  "崇",
  "剪",
  "倡",
  "廳",
  "咬",
  "駛",
  "薯",
  "刷",
  "斥",
  "番",
  "賦",
  "奉",
  "佛",
  "澆",
  "漫",
  "曼",
  "扇",
  "鈣",
  "桃",
  "扶",
  "仔",
  "返",
  "俗",
  "虧",
  "腔",
  "鞋",
  "棱",
  "覆",
  "框",
  "悄",
  "叔",
  "撞",
  "騙",
  "勘",
  "旺",
  "沸",
  "孤",
  "吐",
  "孟",
  "渠",
  "屈",
  "疾",
  "妙",
  "惜",
  "仰",
  "狠",
  "脹",
  "諧",
  "拋",
  "黴",
  "桑",
  "崗",
  "嘛",
  "衰",
  "盜",
  "滲",
  "臟",
  "賴",
  "湧",
  "甜",
  "曹",
  "閱",
  "肌",
  "哩",
  "厲",
  "烴",
  "緯",
  "毅",
  "昨",
  "偽",
  "症",
  "煮",
  "嘆",
  "釘",
  "搭",
  "莖",
  "籠",
  "酷",
  "偷",
  "弓",
  "錐",
  "恆",
  "傑",
  "坑",
  "鼻",
  "翼",
  "綸",
  "敘",
  "獄",
  "逮",
  "罐",
  "絡",
  "棚",
  "抑",
  "膨",
  "蔬",
  "寺",
  "驟",
  "穆",
  "冶",
  "枯",
  "冊",
  "屍",
  "凸",
  "紳",
  "坯",
  "犧",
  "焰",
  "轟",
  "欣",
  "晉",
  "瘦",
  "禦",
  "錠",
  "錦",
  "喪",
  "旬",
  "鍛",
  "壟",
  "搜",
  "撲",
  "邀",
  "亭",
  "酯",
  "邁",
  "舒",
  "脆",
  "酶",
  "閒",
  "憂",
  "酚",
  "頑",
  "羽",
  "漲",
  "卸",
  "仗",
  "陪",
  "闢",
  "懲",
  "杭",
  "姚",
  "肚",
  "捉",
  "飄",
  "漂",
  "昆",
  "欺",
  "吾",
  "郎",
  "烷",
  "汁",
  "呵",
  "飾",
  "蕭",
  "雅",
  "郵",
  "遷",
  "燕",
  "撒",
  "姻",
  "赴",
  "宴",
  "煩",
  "債",
  "帳",
  "斑",
  "鈴",
  "旨",
  "醇",
  "董",
  "餅",
  "雛",
  "姿",
  "拌",
  "傅",
  "腹",
  "妥",
  "揉",
  "賢",
  "拆",
  "歪",
  "葡",
  "胺",
  "丟",
  "浩",
  "徽",
  "昂",
  "墊",
  "擋",
  "覽",
  "貪",
  "慰",
  "繳",
  "汪",
  "慌",
  "馮",
  "諾",
  "姜",
  "誼",
  "兇",
  "劣",
  "誣",
  "耀",
  "昏",
  "躺",
  "盈",
  "騎",
  "喬",
  "溪",
  "叢",
  "盧",
  "抹",
  "悶",
  "諮",
  "刮",
  "駕",
  "纜",
  "悟",
  "摘",
  "鉺",
  "擲",
  "頗",
  "幻",
  "柄",
  "惠",
  "慘",
  "佳",
  "仇",
  "臘",
  "窩",
  "滌",
  "劍",
  "瞧",
  "堡",
  "潑",
  "蔥",
  "罩",
  "霍",
  "撈",
  "胎",
  "蒼",
  "濱",
  "倆",
  "捅",
  "湘",
  "砍",
  "霞",
  "邵",
  "萄",
  "瘋",
  "淮",
  "遂",
  "熊",
  "糞",
  "烘",
  "宿",
  "檔",
  "戈",
  "駁",
  "嫂",
  "裕",
  "徙",
  "箭",
  "捐",
  "腸",
  "撐",
  "曬",
  "辨",
  "殿",
  "蓮",
  "攤",
  "攪",
  "醬",
  "屏",
  "疫",
  "哀",
  "蔡",
  "堵",
  "沫",
  "皺",
  "暢",
  "疊",
  "閣",
  "萊",
  "敲",
  "轄",
  "鉤",
  "痕",
  "壩",
  "巷",
  "餓",
  "禍",
  "丘",
  "玄",
  "溜",
  "曰",
  "邏",
  "彭",
  "嘗",
  "卿",
  "妨",
  "艇",
  "吞",
  "韋",
  "怨",
  "矮",
  "歇"
];
const require$$3 = [
  "가격",
  "가끔",
  "가난",
  "가능",
  "가득",
  "가르침",
  "가뭄",
  "가방",
  "가상",
  "가슴",
  "가운데",
  "가을",
  "가이드",
  "가입",
  "가장",
  "가정",
  "가족",
  "가죽",
  "각오",
  "각자",
  "간격",
  "간부",
  "간섭",
  "간장",
  "간접",
  "간판",
  "갈등",
  "갈비",
  "갈색",
  "갈증",
  "감각",
  "감기",
  "감소",
  "감수성",
  "감자",
  "감정",
  "갑자기",
  "강남",
  "강당",
  "강도",
  "강력히",
  "강변",
  "강북",
  "강사",
  "강수량",
  "강아지",
  "강원도",
  "강의",
  "강제",
  "강조",
  "같이",
  "개구리",
  "개나리",
  "개방",
  "개별",
  "개선",
  "개성",
  "개인",
  "객관적",
  "거실",
  "거액",
  "거울",
  "거짓",
  "거품",
  "걱정",
  "건강",
  "건물",
  "건설",
  "건조",
  "건축",
  "걸음",
  "검사",
  "검토",
  "게시판",
  "게임",
  "겨울",
  "견해",
  "결과",
  "결국",
  "결론",
  "결석",
  "결승",
  "결심",
  "결정",
  "결혼",
  "경계",
  "경고",
  "경기",
  "경력",
  "경복궁",
  "경비",
  "경상도",
  "경영",
  "경우",
  "경쟁",
  "경제",
  "경주",
  "경찰",
  "경치",
  "경향",
  "경험",
  "계곡",
  "계단",
  "계란",
  "계산",
  "계속",
  "계약",
  "계절",
  "계층",
  "계획",
  "고객",
  "고구려",
  "고궁",
  "고급",
  "고등학생",
  "고무신",
  "고민",
  "고양이",
  "고장",
  "고전",
  "고집",
  "고춧가루",
  "고통",
  "고향",
  "곡식",
  "골목",
  "골짜기",
  "골프",
  "공간",
  "공개",
  "공격",
  "공군",
  "공급",
  "공기",
  "공동",
  "공무원",
  "공부",
  "공사",
  "공식",
  "공업",
  "공연",
  "공원",
  "공장",
  "공짜",
  "공책",
  "공통",
  "공포",
  "공항",
  "공휴일",
  "과목",
  "과일",
  "과장",
  "과정",
  "과학",
  "관객",
  "관계",
  "관광",
  "관념",
  "관람",
  "관련",
  "관리",
  "관습",
  "관심",
  "관점",
  "관찰",
  "광경",
  "광고",
  "광장",
  "광주",
  "괴로움",
  "굉장히",
  "교과서",
  "교문",
  "교복",
  "교실",
  "교양",
  "교육",
  "교장",
  "교직",
  "교통",
  "교환",
  "교훈",
  "구경",
  "구름",
  "구멍",
  "구별",
  "구분",
  "구석",
  "구성",
  "구속",
  "구역",
  "구입",
  "구청",
  "구체적",
  "국가",
  "국기",
  "국내",
  "국립",
  "국물",
  "국민",
  "국수",
  "국어",
  "국왕",
  "국적",
  "국제",
  "국회",
  "군대",
  "군사",
  "군인",
  "궁극적",
  "권리",
  "권위",
  "권투",
  "귀국",
  "귀신",
  "규정",
  "규칙",
  "균형",
  "그날",
  "그냥",
  "그늘",
  "그러나",
  "그룹",
  "그릇",
  "그림",
  "그제서야",
  "그토록",
  "극복",
  "극히",
  "근거",
  "근교",
  "근래",
  "근로",
  "근무",
  "근본",
  "근원",
  "근육",
  "근처",
  "글씨",
  "글자",
  "금강산",
  "금고",
  "금년",
  "금메달",
  "금액",
  "금연",
  "금요일",
  "금지",
  "긍정적",
  "기간",
  "기관",
  "기념",
  "기능",
  "기독교",
  "기둥",
  "기록",
  "기름",
  "기법",
  "기본",
  "기분",
  "기쁨",
  "기숙사",
  "기술",
  "기억",
  "기업",
  "기온",
  "기운",
  "기원",
  "기적",
  "기준",
  "기침",
  "기혼",
  "기획",
  "긴급",
  "긴장",
  "길이",
  "김밥",
  "김치",
  "김포공항",
  "깍두기",
  "깜빡",
  "깨달음",
  "깨소금",
  "껍질",
  "꼭대기",
  "꽃잎",
  "나들이",
  "나란히",
  "나머지",
  "나물",
  "나침반",
  "나흘",
  "낙엽",
  "난방",
  "날개",
  "날씨",
  "날짜",
  "남녀",
  "남대문",
  "남매",
  "남산",
  "남자",
  "남편",
  "남학생",
  "낭비",
  "낱말",
  "내년",
  "내용",
  "내일",
  "냄비",
  "냄새",
  "냇물",
  "냉동",
  "냉면",
  "냉방",
  "냉장고",
  "넥타이",
  "넷째",
  "노동",
  "노란색",
  "노력",
  "노인",
  "녹음",
  "녹차",
  "녹화",
  "논리",
  "논문",
  "논쟁",
  "놀이",
  "농구",
  "농담",
  "농민",
  "농부",
  "농업",
  "농장",
  "농촌",
  "높이",
  "눈동자",
  "눈물",
  "눈썹",
  "뉴욕",
  "느낌",
  "늑대",
  "능동적",
  "능력",
  "다방",
  "다양성",
  "다음",
  "다이어트",
  "다행",
  "단계",
  "단골",
  "단독",
  "단맛",
  "단순",
  "단어",
  "단위",
  "단점",
  "단체",
  "단추",
  "단편",
  "단풍",
  "달걀",
  "달러",
  "달력",
  "달리",
  "닭고기",
  "담당",
  "담배",
  "담요",
  "담임",
  "답변",
  "답장",
  "당근",
  "당분간",
  "당연히",
  "당장",
  "대규모",
  "대낮",
  "대단히",
  "대답",
  "대도시",
  "대략",
  "대량",
  "대륙",
  "대문",
  "대부분",
  "대신",
  "대응",
  "대장",
  "대전",
  "대접",
  "대중",
  "대책",
  "대출",
  "대충",
  "대통령",
  "대학",
  "대한민국",
  "대합실",
  "대형",
  "덩어리",
  "데이트",
  "도대체",
  "도덕",
  "도둑",
  "도망",
  "도서관",
  "도심",
  "도움",
  "도입",
  "도자기",
  "도저히",
  "도전",
  "도중",
  "도착",
  "독감",
  "독립",
  "독서",
  "독일",
  "독창적",
  "동화책",
  "뒷모습",
  "뒷산",
  "딸아이",
  "마누라",
  "마늘",
  "마당",
  "마라톤",
  "마련",
  "마무리",
  "마사지",
  "마약",
  "마요네즈",
  "마을",
  "마음",
  "마이크",
  "마중",
  "마지막",
  "마찬가지",
  "마찰",
  "마흔",
  "막걸리",
  "막내",
  "막상",
  "만남",
  "만두",
  "만세",
  "만약",
  "만일",
  "만점",
  "만족",
  "만화",
  "많이",
  "말기",
  "말씀",
  "말투",
  "맘대로",
  "망원경",
  "매년",
  "매달",
  "매력",
  "매번",
  "매스컴",
  "매일",
  "매장",
  "맥주",
  "먹이",
  "먼저",
  "먼지",
  "멀리",
  "메일",
  "며느리",
  "며칠",
  "면담",
  "멸치",
  "명단",
  "명령",
  "명예",
  "명의",
  "명절",
  "명칭",
  "명함",
  "모금",
  "모니터",
  "모델",
  "모든",
  "모범",
  "모습",
  "모양",
  "모임",
  "모조리",
  "모집",
  "모퉁이",
  "목걸이",
  "목록",
  "목사",
  "목소리",
  "목숨",
  "목적",
  "목표",
  "몰래",
  "몸매",
  "몸무게",
  "몸살",
  "몸속",
  "몸짓",
  "몸통",
  "몹시",
  "무관심",
  "무궁화",
  "무더위",
  "무덤",
  "무릎",
  "무슨",
  "무엇",
  "무역",
  "무용",
  "무조건",
  "무지개",
  "무척",
  "문구",
  "문득",
  "문법",
  "문서",
  "문제",
  "문학",
  "문화",
  "물가",
  "물건",
  "물결",
  "물고기",
  "물론",
  "물리학",
  "물음",
  "물질",
  "물체",
  "미국",
  "미디어",
  "미사일",
  "미술",
  "미역",
  "미용실",
  "미움",
  "미인",
  "미팅",
  "미혼",
  "민간",
  "민족",
  "민주",
  "믿음",
  "밀가루",
  "밀리미터",
  "밑바닥",
  "바가지",
  "바구니",
  "바나나",
  "바늘",
  "바닥",
  "바닷가",
  "바람",
  "바이러스",
  "바탕",
  "박물관",
  "박사",
  "박수",
  "반대",
  "반드시",
  "반말",
  "반발",
  "반성",
  "반응",
  "반장",
  "반죽",
  "반지",
  "반찬",
  "받침",
  "발가락",
  "발걸음",
  "발견",
  "발달",
  "발레",
  "발목",
  "발바닥",
  "발생",
  "발음",
  "발자국",
  "발전",
  "발톱",
  "발표",
  "밤하늘",
  "밥그릇",
  "밥맛",
  "밥상",
  "밥솥",
  "방금",
  "방면",
  "방문",
  "방바닥",
  "방법",
  "방송",
  "방식",
  "방안",
  "방울",
  "방지",
  "방학",
  "방해",
  "방향",
  "배경",
  "배꼽",
  "배달",
  "배드민턴",
  "백두산",
  "백색",
  "백성",
  "백인",
  "백제",
  "백화점",
  "버릇",
  "버섯",
  "버튼",
  "번개",
  "번역",
  "번지",
  "번호",
  "벌금",
  "벌레",
  "벌써",
  "범위",
  "범인",
  "범죄",
  "법률",
  "법원",
  "법적",
  "법칙",
  "베이징",
  "벨트",
  "변경",
  "변동",
  "변명",
  "변신",
  "변호사",
  "변화",
  "별도",
  "별명",
  "별일",
  "병실",
  "병아리",
  "병원",
  "보관",
  "보너스",
  "보라색",
  "보람",
  "보름",
  "보상",
  "보안",
  "보자기",
  "보장",
  "보전",
  "보존",
  "보통",
  "보편적",
  "보험",
  "복도",
  "복사",
  "복숭아",
  "복습",
  "볶음",
  "본격적",
  "본래",
  "본부",
  "본사",
  "본성",
  "본인",
  "본질",
  "볼펜",
  "봉사",
  "봉지",
  "봉투",
  "부근",
  "부끄러움",
  "부담",
  "부동산",
  "부문",
  "부분",
  "부산",
  "부상",
  "부엌",
  "부인",
  "부작용",
  "부장",
  "부정",
  "부족",
  "부지런히",
  "부친",
  "부탁",
  "부품",
  "부회장",
  "북부",
  "북한",
  "분노",
  "분량",
  "분리",
  "분명",
  "분석",
  "분야",
  "분위기",
  "분필",
  "분홍색",
  "불고기",
  "불과",
  "불교",
  "불꽃",
  "불만",
  "불법",
  "불빛",
  "불안",
  "불이익",
  "불행",
  "브랜드",
  "비극",
  "비난",
  "비닐",
  "비둘기",
  "비디오",
  "비로소",
  "비만",
  "비명",
  "비밀",
  "비바람",
  "비빔밥",
  "비상",
  "비용",
  "비율",
  "비중",
  "비타민",
  "비판",
  "빌딩",
  "빗물",
  "빗방울",
  "빗줄기",
  "빛깔",
  "빨간색",
  "빨래",
  "빨리",
  "사건",
  "사계절",
  "사나이",
  "사냥",
  "사람",
  "사랑",
  "사립",
  "사모님",
  "사물",
  "사방",
  "사상",
  "사생활",
  "사설",
  "사슴",
  "사실",
  "사업",
  "사용",
  "사월",
  "사장",
  "사전",
  "사진",
  "사촌",
  "사춘기",
  "사탕",
  "사투리",
  "사흘",
  "산길",
  "산부인과",
  "산업",
  "산책",
  "살림",
  "살인",
  "살짝",
  "삼계탕",
  "삼국",
  "삼십",
  "삼월",
  "삼촌",
  "상관",
  "상금",
  "상대",
  "상류",
  "상반기",
  "상상",
  "상식",
  "상업",
  "상인",
  "상자",
  "상점",
  "상처",
  "상추",
  "상태",
  "상표",
  "상품",
  "상황",
  "새벽",
  "색깔",
  "색연필",
  "생각",
  "생명",
  "생물",
  "생방송",
  "생산",
  "생선",
  "생신",
  "생일",
  "생활",
  "서랍",
  "서른",
  "서명",
  "서민",
  "서비스",
  "서양",
  "서울",
  "서적",
  "서점",
  "서쪽",
  "서클",
  "석사",
  "석유",
  "선거",
  "선물",
  "선배",
  "선생",
  "선수",
  "선원",
  "선장",
  "선전",
  "선택",
  "선풍기",
  "설거지",
  "설날",
  "설렁탕",
  "설명",
  "설문",
  "설사",
  "설악산",
  "설치",
  "설탕",
  "섭씨",
  "성공",
  "성당",
  "성명",
  "성별",
  "성인",
  "성장",
  "성적",
  "성질",
  "성함",
  "세금",
  "세미나",
  "세상",
  "세월",
  "세종대왕",
  "세탁",
  "센터",
  "센티미터",
  "셋째",
  "소규모",
  "소극적",
  "소금",
  "소나기",
  "소년",
  "소득",
  "소망",
  "소문",
  "소설",
  "소속",
  "소아과",
  "소용",
  "소원",
  "소음",
  "소중히",
  "소지품",
  "소질",
  "소풍",
  "소형",
  "속담",
  "속도",
  "속옷",
  "손가락",
  "손길",
  "손녀",
  "손님",
  "손등",
  "손목",
  "손뼉",
  "손실",
  "손질",
  "손톱",
  "손해",
  "솔직히",
  "솜씨",
  "송아지",
  "송이",
  "송편",
  "쇠고기",
  "쇼핑",
  "수건",
  "수년",
  "수단",
  "수돗물",
  "수동적",
  "수면",
  "수명",
  "수박",
  "수상",
  "수석",
  "수술",
  "수시로",
  "수업",
  "수염",
  "수영",
  "수입",
  "수준",
  "수집",
  "수출",
  "수컷",
  "수필",
  "수학",
  "수험생",
  "수화기",
  "숙녀",
  "숙소",
  "숙제",
  "순간",
  "순서",
  "순수",
  "순식간",
  "순위",
  "숟가락",
  "술병",
  "술집",
  "숫자",
  "스님",
  "스물",
  "스스로",
  "스승",
  "스웨터",
  "스위치",
  "스케이트",
  "스튜디오",
  "스트레스",
  "스포츠",
  "슬쩍",
  "슬픔",
  "습관",
  "습기",
  "승객",
  "승리",
  "승부",
  "승용차",
  "승진",
  "시각",
  "시간",
  "시골",
  "시금치",
  "시나리오",
  "시댁",
  "시리즈",
  "시멘트",
  "시민",
  "시부모",
  "시선",
  "시설",
  "시스템",
  "시아버지",
  "시어머니",
  "시월",
  "시인",
  "시일",
  "시작",
  "시장",
  "시절",
  "시점",
  "시중",
  "시즌",
  "시집",
  "시청",
  "시합",
  "시험",
  "식구",
  "식기",
  "식당",
  "식량",
  "식료품",
  "식물",
  "식빵",
  "식사",
  "식생활",
  "식초",
  "식탁",
  "식품",
  "신고",
  "신규",
  "신념",
  "신문",
  "신발",
  "신비",
  "신사",
  "신세",
  "신용",
  "신제품",
  "신청",
  "신체",
  "신화",
  "실감",
  "실내",
  "실력",
  "실례",
  "실망",
  "실수",
  "실습",
  "실시",
  "실장",
  "실정",
  "실질적",
  "실천",
  "실체",
  "실컷",
  "실태",
  "실패",
  "실험",
  "실현",
  "심리",
  "심부름",
  "심사",
  "심장",
  "심정",
  "심판",
  "쌍둥이",
  "씨름",
  "씨앗",
  "아가씨",
  "아나운서",
  "아드님",
  "아들",
  "아쉬움",
  "아스팔트",
  "아시아",
  "아울러",
  "아저씨",
  "아줌마",
  "아직",
  "아침",
  "아파트",
  "아프리카",
  "아픔",
  "아홉",
  "아흔",
  "악기",
  "악몽",
  "악수",
  "안개",
  "안경",
  "안과",
  "안내",
  "안녕",
  "안동",
  "안방",
  "안부",
  "안주",
  "알루미늄",
  "알코올",
  "암시",
  "암컷",
  "압력",
  "앞날",
  "앞문",
  "애인",
  "애정",
  "액수",
  "앨범",
  "야간",
  "야단",
  "야옹",
  "약간",
  "약국",
  "약속",
  "약수",
  "약점",
  "약품",
  "약혼녀",
  "양념",
  "양력",
  "양말",
  "양배추",
  "양주",
  "양파",
  "어둠",
  "어려움",
  "어른",
  "어젯밤",
  "어쨌든",
  "어쩌다가",
  "어쩐지",
  "언니",
  "언덕",
  "언론",
  "언어",
  "얼굴",
  "얼른",
  "얼음",
  "얼핏",
  "엄마",
  "업무",
  "업종",
  "업체",
  "엉덩이",
  "엉망",
  "엉터리",
  "엊그제",
  "에너지",
  "에어컨",
  "엔진",
  "여건",
  "여고생",
  "여관",
  "여군",
  "여권",
  "여대생",
  "여덟",
  "여동생",
  "여든",
  "여론",
  "여름",
  "여섯",
  "여성",
  "여왕",
  "여인",
  "여전히",
  "여직원",
  "여학생",
  "여행",
  "역사",
  "역시",
  "역할",
  "연결",
  "연구",
  "연극",
  "연기",
  "연락",
  "연설",
  "연세",
  "연속",
  "연습",
  "연애",
  "연예인",
  "연인",
  "연장",
  "연주",
  "연출",
  "연필",
  "연합",
  "연휴",
  "열기",
  "열매",
  "열쇠",
  "열심히",
  "열정",
  "열차",
  "열흘",
  "염려",
  "엽서",
  "영국",
  "영남",
  "영상",
  "영양",
  "영역",
  "영웅",
  "영원히",
  "영하",
  "영향",
  "영혼",
  "영화",
  "옆구리",
  "옆방",
  "옆집",
  "예감",
  "예금",
  "예방",
  "예산",
  "예상",
  "예선",
  "예술",
  "예습",
  "예식장",
  "예약",
  "예전",
  "예절",
  "예정",
  "예컨대",
  "옛날",
  "오늘",
  "오락",
  "오랫동안",
  "오렌지",
  "오로지",
  "오른발",
  "오븐",
  "오십",
  "오염",
  "오월",
  "오전",
  "오직",
  "오징어",
  "오페라",
  "오피스텔",
  "오히려",
  "옥상",
  "옥수수",
  "온갖",
  "온라인",
  "온몸",
  "온종일",
  "온통",
  "올가을",
  "올림픽",
  "올해",
  "옷차림",
  "와이셔츠",
  "와인",
  "완성",
  "완전",
  "왕비",
  "왕자",
  "왜냐하면",
  "왠지",
  "외갓집",
  "외국",
  "외로움",
  "외삼촌",
  "외출",
  "외침",
  "외할머니",
  "왼발",
  "왼손",
  "왼쪽",
  "요금",
  "요일",
  "요즘",
  "요청",
  "용기",
  "용서",
  "용어",
  "우산",
  "우선",
  "우승",
  "우연히",
  "우정",
  "우체국",
  "우편",
  "운동",
  "운명",
  "운반",
  "운전",
  "운행",
  "울산",
  "울음",
  "움직임",
  "웃어른",
  "웃음",
  "워낙",
  "원고",
  "원래",
  "원서",
  "원숭이",
  "원인",
  "원장",
  "원피스",
  "월급",
  "월드컵",
  "월세",
  "월요일",
  "웨이터",
  "위반",
  "위법",
  "위성",
  "위원",
  "위험",
  "위협",
  "윗사람",
  "유난히",
  "유럽",
  "유명",
  "유물",
  "유산",
  "유적",
  "유치원",
  "유학",
  "유행",
  "유형",
  "육군",
  "육상",
  "육십",
  "육체",
  "은행",
  "음력",
  "음료",
  "음반",
  "음성",
  "음식",
  "음악",
  "음주",
  "의견",
  "의논",
  "의문",
  "의복",
  "의식",
  "의심",
  "의외로",
  "의욕",
  "의원",
  "의학",
  "이것",
  "이곳",
  "이념",
  "이놈",
  "이달",
  "이대로",
  "이동",
  "이렇게",
  "이력서",
  "이론적",
  "이름",
  "이민",
  "이발소",
  "이별",
  "이불",
  "이빨",
  "이상",
  "이성",
  "이슬",
  "이야기",
  "이용",
  "이웃",
  "이월",
  "이윽고",
  "이익",
  "이전",
  "이중",
  "이튿날",
  "이틀",
  "이혼",
  "인간",
  "인격",
  "인공",
  "인구",
  "인근",
  "인기",
  "인도",
  "인류",
  "인물",
  "인생",
  "인쇄",
  "인연",
  "인원",
  "인재",
  "인종",
  "인천",
  "인체",
  "인터넷",
  "인하",
  "인형",
  "일곱",
  "일기",
  "일단",
  "일대",
  "일등",
  "일반",
  "일본",
  "일부",
  "일상",
  "일생",
  "일손",
  "일요일",
  "일월",
  "일정",
  "일종",
  "일주일",
  "일찍",
  "일체",
  "일치",
  "일행",
  "일회용",
  "임금",
  "임무",
  "입대",
  "입력",
  "입맛",
  "입사",
  "입술",
  "입시",
  "입원",
  "입장",
  "입학",
  "자가용",
  "자격",
  "자극",
  "자동",
  "자랑",
  "자부심",
  "자식",
  "자신",
  "자연",
  "자원",
  "자율",
  "자전거",
  "자정",
  "자존심",
  "자판",
  "작가",
  "작년",
  "작성",
  "작업",
  "작용",
  "작은딸",
  "작품",
  "잔디",
  "잔뜩",
  "잔치",
  "잘못",
  "잠깐",
  "잠수함",
  "잠시",
  "잠옷",
  "잠자리",
  "잡지",
  "장관",
  "장군",
  "장기간",
  "장래",
  "장례",
  "장르",
  "장마",
  "장면",
  "장모",
  "장미",
  "장비",
  "장사",
  "장소",
  "장식",
  "장애인",
  "장인",
  "장점",
  "장차",
  "장학금",
  "재능",
  "재빨리",
  "재산",
  "재생",
  "재작년",
  "재정",
  "재채기",
  "재판",
  "재학",
  "재활용",
  "저것",
  "저고리",
  "저곳",
  "저녁",
  "저런",
  "저렇게",
  "저번",
  "저울",
  "저절로",
  "저축",
  "적극",
  "적당히",
  "적성",
  "적용",
  "적응",
  "전개",
  "전공",
  "전기",
  "전달",
  "전라도",
  "전망",
  "전문",
  "전반",
  "전부",
  "전세",
  "전시",
  "전용",
  "전자",
  "전쟁",
  "전주",
  "전철",
  "전체",
  "전통",
  "전혀",
  "전후",
  "절대",
  "절망",
  "절반",
  "절약",
  "절차",
  "점검",
  "점수",
  "점심",
  "점원",
  "점점",
  "점차",
  "접근",
  "접시",
  "접촉",
  "젓가락",
  "정거장",
  "정도",
  "정류장",
  "정리",
  "정말",
  "정면",
  "정문",
  "정반대",
  "정보",
  "정부",
  "정비",
  "정상",
  "정성",
  "정오",
  "정원",
  "정장",
  "정지",
  "정치",
  "정확히",
  "제공",
  "제과점",
  "제대로",
  "제목",
  "제발",
  "제법",
  "제삿날",
  "제안",
  "제일",
  "제작",
  "제주도",
  "제출",
  "제품",
  "제한",
  "조각",
  "조건",
  "조금",
  "조깅",
  "조명",
  "조미료",
  "조상",
  "조선",
  "조용히",
  "조절",
  "조정",
  "조직",
  "존댓말",
  "존재",
  "졸업",
  "졸음",
  "종교",
  "종로",
  "종류",
  "종소리",
  "종업원",
  "종종",
  "종합",
  "좌석",
  "죄인",
  "주관적",
  "주름",
  "주말",
  "주머니",
  "주먹",
  "주문",
  "주민",
  "주방",
  "주변",
  "주식",
  "주인",
  "주일",
  "주장",
  "주전자",
  "주택",
  "준비",
  "줄거리",
  "줄기",
  "줄무늬",
  "중간",
  "중계방송",
  "중국",
  "중년",
  "중단",
  "중독",
  "중반",
  "중부",
  "중세",
  "중소기업",
  "중순",
  "중앙",
  "중요",
  "중학교",
  "즉석",
  "즉시",
  "즐거움",
  "증가",
  "증거",
  "증권",
  "증상",
  "증세",
  "지각",
  "지갑",
  "지경",
  "지극히",
  "지금",
  "지급",
  "지능",
  "지름길",
  "지리산",
  "지방",
  "지붕",
  "지식",
  "지역",
  "지우개",
  "지원",
  "지적",
  "지점",
  "지진",
  "지출",
  "직선",
  "직업",
  "직원",
  "직장",
  "진급",
  "진동",
  "진로",
  "진료",
  "진리",
  "진짜",
  "진찰",
  "진출",
  "진통",
  "진행",
  "질문",
  "질병",
  "질서",
  "짐작",
  "집단",
  "집안",
  "집중",
  "짜증",
  "찌꺼기",
  "차남",
  "차라리",
  "차량",
  "차림",
  "차별",
  "차선",
  "차츰",
  "착각",
  "찬물",
  "찬성",
  "참가",
  "참기름",
  "참새",
  "참석",
  "참여",
  "참외",
  "참조",
  "찻잔",
  "창가",
  "창고",
  "창구",
  "창문",
  "창밖",
  "창작",
  "창조",
  "채널",
  "채점",
  "책가방",
  "책방",
  "책상",
  "책임",
  "챔피언",
  "처벌",
  "처음",
  "천국",
  "천둥",
  "천장",
  "천재",
  "천천히",
  "철도",
  "철저히",
  "철학",
  "첫날",
  "첫째",
  "청년",
  "청바지",
  "청소",
  "청춘",
  "체계",
  "체력",
  "체온",
  "체육",
  "체중",
  "체험",
  "초등학생",
  "초반",
  "초밥",
  "초상화",
  "초순",
  "초여름",
  "초원",
  "초저녁",
  "초점",
  "초청",
  "초콜릿",
  "촛불",
  "총각",
  "총리",
  "총장",
  "촬영",
  "최근",
  "최상",
  "최선",
  "최신",
  "최악",
  "최종",
  "추석",
  "추억",
  "추진",
  "추천",
  "추측",
  "축구",
  "축소",
  "축제",
  "축하",
  "출근",
  "출발",
  "출산",
  "출신",
  "출연",
  "출입",
  "출장",
  "출판",
  "충격",
  "충고",
  "충돌",
  "충분히",
  "충청도",
  "취업",
  "취직",
  "취향",
  "치약",
  "친구",
  "친척",
  "칠십",
  "칠월",
  "칠판",
  "침대",
  "침묵",
  "침실",
  "칫솔",
  "칭찬",
  "카메라",
  "카운터",
  "칼국수",
  "캐릭터",
  "캠퍼스",
  "캠페인",
  "커튼",
  "컨디션",
  "컬러",
  "컴퓨터",
  "코끼리",
  "코미디",
  "콘서트",
  "콜라",
  "콤플렉스",
  "콩나물",
  "쾌감",
  "쿠데타",
  "크림",
  "큰길",
  "큰딸",
  "큰소리",
  "큰아들",
  "큰어머니",
  "큰일",
  "큰절",
  "클래식",
  "클럽",
  "킬로",
  "타입",
  "타자기",
  "탁구",
  "탁자",
  "탄생",
  "태권도",
  "태양",
  "태풍",
  "택시",
  "탤런트",
  "터널",
  "터미널",
  "테니스",
  "테스트",
  "테이블",
  "텔레비전",
  "토론",
  "토마토",
  "토요일",
  "통계",
  "통과",
  "통로",
  "통신",
  "통역",
  "통일",
  "통장",
  "통제",
  "통증",
  "통합",
  "통화",
  "퇴근",
  "퇴원",
  "퇴직금",
  "튀김",
  "트럭",
  "특급",
  "특별",
  "특성",
  "특수",
  "특징",
  "특히",
  "튼튼히",
  "티셔츠",
  "파란색",
  "파일",
  "파출소",
  "판결",
  "판단",
  "판매",
  "판사",
  "팔십",
  "팔월",
  "팝송",
  "패션",
  "팩스",
  "팩시밀리",
  "팬티",
  "퍼센트",
  "페인트",
  "편견",
  "편의",
  "편지",
  "편히",
  "평가",
  "평균",
  "평생",
  "평소",
  "평양",
  "평일",
  "평화",
  "포스터",
  "포인트",
  "포장",
  "포함",
  "표면",
  "표정",
  "표준",
  "표현",
  "품목",
  "품질",
  "풍경",
  "풍속",
  "풍습",
  "프랑스",
  "프린터",
  "플라스틱",
  "피곤",
  "피망",
  "피아노",
  "필름",
  "필수",
  "필요",
  "필자",
  "필통",
  "핑계",
  "하느님",
  "하늘",
  "하드웨어",
  "하룻밤",
  "하반기",
  "하숙집",
  "하순",
  "하여튼",
  "하지만",
  "하천",
  "하품",
  "하필",
  "학과",
  "학교",
  "학급",
  "학기",
  "학년",
  "학력",
  "학번",
  "학부모",
  "학비",
  "학생",
  "학술",
  "학습",
  "학용품",
  "학원",
  "학위",
  "학자",
  "학점",
  "한계",
  "한글",
  "한꺼번에",
  "한낮",
  "한눈",
  "한동안",
  "한때",
  "한라산",
  "한마디",
  "한문",
  "한번",
  "한복",
  "한식",
  "한여름",
  "한쪽",
  "할머니",
  "할아버지",
  "할인",
  "함께",
  "함부로",
  "합격",
  "합리적",
  "항공",
  "항구",
  "항상",
  "항의",
  "해결",
  "해군",
  "해답",
  "해당",
  "해물",
  "해석",
  "해설",
  "해수욕장",
  "해안",
  "핵심",
  "핸드백",
  "햄버거",
  "햇볕",
  "햇살",
  "행동",
  "행복",
  "행사",
  "행운",
  "행위",
  "향기",
  "향상",
  "향수",
  "허락",
  "허용",
  "헬기",
  "현관",
  "현금",
  "현대",
  "현상",
  "현실",
  "현장",
  "현재",
  "현지",
  "혈액",
  "협력",
  "형부",
  "형사",
  "형수",
  "형식",
  "형제",
  "형태",
  "형편",
  "혜택",
  "호기심",
  "호남",
  "호랑이",
  "호박",
  "호텔",
  "호흡",
  "혹시",
  "홀로",
  "홈페이지",
  "홍보",
  "홍수",
  "홍차",
  "화면",
  "화분",
  "화살",
  "화요일",
  "화장",
  "화학",
  "확보",
  "확인",
  "확장",
  "확정",
  "환갑",
  "환경",
  "환영",
  "환율",
  "환자",
  "활기",
  "활동",
  "활발히",
  "활용",
  "활짝",
  "회견",
  "회관",
  "회복",
  "회색",
  "회원",
  "회장",
  "회전",
  "횟수",
  "횡단보도",
  "효율적",
  "후반",
  "후춧가루",
  "훈련",
  "훨씬",
  "휴식",
  "휴일",
  "흉내",
  "흐름",
  "흑백",
  "흑인",
  "흔적",
  "흔히",
  "흥미",
  "흥분",
  "희곡",
  "희망",
  "희생",
  "흰색",
  "힘껏"
];
const require$$4 = [
  "abaisser",
  "abandon",
  "abdiquer",
  "abeille",
  "abolir",
  "aborder",
  "aboutir",
  "aboyer",
  "abrasif",
  "abreuver",
  "abriter",
  "abroger",
  "abrupt",
  "absence",
  "absolu",
  "absurde",
  "abusif",
  "abyssal",
  "académie",
  "acajou",
  "acarien",
  "accabler",
  "accepter",
  "acclamer",
  "accolade",
  "accroche",
  "accuser",
  "acerbe",
  "achat",
  "acheter",
  "aciduler",
  "acier",
  "acompte",
  "acquérir",
  "acronyme",
  "acteur",
  "actif",
  "actuel",
  "adepte",
  "adéquat",
  "adhésif",
  "adjectif",
  "adjuger",
  "admettre",
  "admirer",
  "adopter",
  "adorer",
  "adoucir",
  "adresse",
  "adroit",
  "adulte",
  "adverbe",
  "aérer",
  "aéronef",
  "affaire",
  "affecter",
  "affiche",
  "affreux",
  "affubler",
  "agacer",
  "agencer",
  "agile",
  "agiter",
  "agrafer",
  "agréable",
  "agrume",
  "aider",
  "aiguille",
  "ailier",
  "aimable",
  "aisance",
  "ajouter",
  "ajuster",
  "alarmer",
  "alchimie",
  "alerte",
  "algèbre",
  "algue",
  "aliéner",
  "aliment",
  "alléger",
  "alliage",
  "allouer",
  "allumer",
  "alourdir",
  "alpaga",
  "altesse",
  "alvéole",
  "amateur",
  "ambigu",
  "ambre",
  "aménager",
  "amertume",
  "amidon",
  "amiral",
  "amorcer",
  "amour",
  "amovible",
  "amphibie",
  "ampleur",
  "amusant",
  "analyse",
  "anaphore",
  "anarchie",
  "anatomie",
  "ancien",
  "anéantir",
  "angle",
  "angoisse",
  "anguleux",
  "animal",
  "annexer",
  "annonce",
  "annuel",
  "anodin",
  "anomalie",
  "anonyme",
  "anormal",
  "antenne",
  "antidote",
  "anxieux",
  "apaiser",
  "apéritif",
  "aplanir",
  "apologie",
  "appareil",
  "appeler",
  "apporter",
  "appuyer",
  "aquarium",
  "aqueduc",
  "arbitre",
  "arbuste",
  "ardeur",
  "ardoise",
  "argent",
  "arlequin",
  "armature",
  "armement",
  "armoire",
  "armure",
  "arpenter",
  "arracher",
  "arriver",
  "arroser",
  "arsenic",
  "artériel",
  "article",
  "aspect",
  "asphalte",
  "aspirer",
  "assaut",
  "asservir",
  "assiette",
  "associer",
  "assurer",
  "asticot",
  "astre",
  "astuce",
  "atelier",
  "atome",
  "atrium",
  "atroce",
  "attaque",
  "attentif",
  "attirer",
  "attraper",
  "aubaine",
  "auberge",
  "audace",
  "audible",
  "augurer",
  "aurore",
  "automne",
  "autruche",
  "avaler",
  "avancer",
  "avarice",
  "avenir",
  "averse",
  "aveugle",
  "aviateur",
  "avide",
  "avion",
  "aviser",
  "avoine",
  "avouer",
  "avril",
  "axial",
  "axiome",
  "badge",
  "bafouer",
  "bagage",
  "baguette",
  "baignade",
  "balancer",
  "balcon",
  "baleine",
  "balisage",
  "bambin",
  "bancaire",
  "bandage",
  "banlieue",
  "bannière",
  "banquier",
  "barbier",
  "baril",
  "baron",
  "barque",
  "barrage",
  "bassin",
  "bastion",
  "bataille",
  "bateau",
  "batterie",
  "baudrier",
  "bavarder",
  "belette",
  "bélier",
  "belote",
  "bénéfice",
  "berceau",
  "berger",
  "berline",
  "bermuda",
  "besace",
  "besogne",
  "bétail",
  "beurre",
  "biberon",
  "bicycle",
  "bidule",
  "bijou",
  "bilan",
  "bilingue",
  "billard",
  "binaire",
  "biologie",
  "biopsie",
  "biotype",
  "biscuit",
  "bison",
  "bistouri",
  "bitume",
  "bizarre",
  "blafard",
  "blague",
  "blanchir",
  "blessant",
  "blinder",
  "blond",
  "bloquer",
  "blouson",
  "bobard",
  "bobine",
  "boire",
  "boiser",
  "bolide",
  "bonbon",
  "bondir",
  "bonheur",
  "bonifier",
  "bonus",
  "bordure",
  "borne",
  "botte",
  "boucle",
  "boueux",
  "bougie",
  "boulon",
  "bouquin",
  "bourse",
  "boussole",
  "boutique",
  "boxeur",
  "branche",
  "brasier",
  "brave",
  "brebis",
  "brèche",
  "breuvage",
  "bricoler",
  "brigade",
  "brillant",
  "brioche",
  "brique",
  "brochure",
  "broder",
  "bronzer",
  "brousse",
  "broyeur",
  "brume",
  "brusque",
  "brutal",
  "bruyant",
  "buffle",
  "buisson",
  "bulletin",
  "bureau",
  "burin",
  "bustier",
  "butiner",
  "butoir",
  "buvable",
  "buvette",
  "cabanon",
  "cabine",
  "cachette",
  "cadeau",
  "cadre",
  "caféine",
  "caillou",
  "caisson",
  "calculer",
  "calepin",
  "calibre",
  "calmer",
  "calomnie",
  "calvaire",
  "camarade",
  "caméra",
  "camion",
  "campagne",
  "canal",
  "caneton",
  "canon",
  "cantine",
  "canular",
  "capable",
  "caporal",
  "caprice",
  "capsule",
  "capter",
  "capuche",
  "carabine",
  "carbone",
  "caresser",
  "caribou",
  "carnage",
  "carotte",
  "carreau",
  "carton",
  "cascade",
  "casier",
  "casque",
  "cassure",
  "causer",
  "caution",
  "cavalier",
  "caverne",
  "caviar",
  "cédille",
  "ceinture",
  "céleste",
  "cellule",
  "cendrier",
  "censurer",
  "central",
  "cercle",
  "cérébral",
  "cerise",
  "cerner",
  "cerveau",
  "cesser",
  "chagrin",
  "chaise",
  "chaleur",
  "chambre",
  "chance",
  "chapitre",
  "charbon",
  "chasseur",
  "chaton",
  "chausson",
  "chavirer",
  "chemise",
  "chenille",
  "chéquier",
  "chercher",
  "cheval",
  "chien",
  "chiffre",
  "chignon",
  "chimère",
  "chiot",
  "chlorure",
  "chocolat",
  "choisir",
  "chose",
  "chouette",
  "chrome",
  "chute",
  "cigare",
  "cigogne",
  "cimenter",
  "cinéma",
  "cintrer",
  "circuler",
  "cirer",
  "cirque",
  "citerne",
  "citoyen",
  "citron",
  "civil",
  "clairon",
  "clameur",
  "claquer",
  "classe",
  "clavier",
  "client",
  "cligner",
  "climat",
  "clivage",
  "cloche",
  "clonage",
  "cloporte",
  "cobalt",
  "cobra",
  "cocasse",
  "cocotier",
  "coder",
  "codifier",
  "coffre",
  "cogner",
  "cohésion",
  "coiffer",
  "coincer",
  "colère",
  "colibri",
  "colline",
  "colmater",
  "colonel",
  "combat",
  "comédie",
  "commande",
  "compact",
  "concert",
  "conduire",
  "confier",
  "congeler",
  "connoter",
  "consonne",
  "contact",
  "convexe",
  "copain",
  "copie",
  "corail",
  "corbeau",
  "cordage",
  "corniche",
  "corpus",
  "correct",
  "cortège",
  "cosmique",
  "costume",
  "coton",
  "coude",
  "coupure",
  "courage",
  "couteau",
  "couvrir",
  "coyote",
  "crabe",
  "crainte",
  "cravate",
  "crayon",
  "créature",
  "créditer",
  "crémeux",
  "creuser",
  "crevette",
  "cribler",
  "crier",
  "cristal",
  "critère",
  "croire",
  "croquer",
  "crotale",
  "crucial",
  "cruel",
  "crypter",
  "cubique",
  "cueillir",
  "cuillère",
  "cuisine",
  "cuivre",
  "culminer",
  "cultiver",
  "cumuler",
  "cupide",
  "curatif",
  "curseur",
  "cyanure",
  "cycle",
  "cylindre",
  "cynique",
  "daigner",
  "damier",
  "danger",
  "danseur",
  "dauphin",
  "débattre",
  "débiter",
  "déborder",
  "débrider",
  "débutant",
  "décaler",
  "décembre",
  "déchirer",
  "décider",
  "déclarer",
  "décorer",
  "décrire",
  "décupler",
  "dédale",
  "déductif",
  "déesse",
  "défensif",
  "défiler",
  "défrayer",
  "dégager",
  "dégivrer",
  "déglutir",
  "dégrafer",
  "déjeuner",
  "délice",
  "déloger",
  "demander",
  "demeurer",
  "démolir",
  "dénicher",
  "dénouer",
  "dentelle",
  "dénuder",
  "départ",
  "dépenser",
  "déphaser",
  "déplacer",
  "déposer",
  "déranger",
  "dérober",
  "désastre",
  "descente",
  "désert",
  "désigner",
  "désobéir",
  "dessiner",
  "destrier",
  "détacher",
  "détester",
  "détourer",
  "détresse",
  "devancer",
  "devenir",
  "deviner",
  "devoir",
  "diable",
  "dialogue",
  "diamant",
  "dicter",
  "différer",
  "digérer",
  "digital",
  "digne",
  "diluer",
  "dimanche",
  "diminuer",
  "dioxyde",
  "directif",
  "diriger",
  "discuter",
  "disposer",
  "dissiper",
  "distance",
  "divertir",
  "diviser",
  "docile",
  "docteur",
  "dogme",
  "doigt",
  "domaine",
  "domicile",
  "dompter",
  "donateur",
  "donjon",
  "donner",
  "dopamine",
  "dortoir",
  "dorure",
  "dosage",
  "doseur",
  "dossier",
  "dotation",
  "douanier",
  "double",
  "douceur",
  "douter",
  "doyen",
  "dragon",
  "draper",
  "dresser",
  "dribbler",
  "droiture",
  "duperie",
  "duplexe",
  "durable",
  "durcir",
  "dynastie",
  "éblouir",
  "écarter",
  "écharpe",
  "échelle",
  "éclairer",
  "éclipse",
  "éclore",
  "écluse",
  "école",
  "économie",
  "écorce",
  "écouter",
  "écraser",
  "écrémer",
  "écrivain",
  "écrou",
  "écume",
  "écureuil",
  "édifier",
  "éduquer",
  "effacer",
  "effectif",
  "effigie",
  "effort",
  "effrayer",
  "effusion",
  "égaliser",
  "égarer",
  "éjecter",
  "élaborer",
  "élargir",
  "électron",
  "élégant",
  "éléphant",
  "élève",
  "éligible",
  "élitisme",
  "éloge",
  "élucider",
  "éluder",
  "emballer",
  "embellir",
  "embryon",
  "émeraude",
  "émission",
  "emmener",
  "émotion",
  "émouvoir",
  "empereur",
  "employer",
  "emporter",
  "emprise",
  "émulsion",
  "encadrer",
  "enchère",
  "enclave",
  "encoche",
  "endiguer",
  "endosser",
  "endroit",
  "enduire",
  "énergie",
  "enfance",
  "enfermer",
  "enfouir",
  "engager",
  "engin",
  "englober",
  "énigme",
  "enjamber",
  "enjeu",
  "enlever",
  "ennemi",
  "ennuyeux",
  "enrichir",
  "enrobage",
  "enseigne",
  "entasser",
  "entendre",
  "entier",
  "entourer",
  "entraver",
  "énumérer",
  "envahir",
  "enviable",
  "envoyer",
  "enzyme",
  "éolien",
  "épaissir",
  "épargne",
  "épatant",
  "épaule",
  "épicerie",
  "épidémie",
  "épier",
  "épilogue",
  "épine",
  "épisode",
  "épitaphe",
  "époque",
  "épreuve",
  "éprouver",
  "épuisant",
  "équerre",
  "équipe",
  "ériger",
  "érosion",
  "erreur",
  "éruption",
  "escalier",
  "espadon",
  "espèce",
  "espiègle",
  "espoir",
  "esprit",
  "esquiver",
  "essayer",
  "essence",
  "essieu",
  "essorer",
  "estime",
  "estomac",
  "estrade",
  "étagère",
  "étaler",
  "étanche",
  "étatique",
  "éteindre",
  "étendoir",
  "éternel",
  "éthanol",
  "éthique",
  "ethnie",
  "étirer",
  "étoffer",
  "étoile",
  "étonnant",
  "étourdir",
  "étrange",
  "étroit",
  "étude",
  "euphorie",
  "évaluer",
  "évasion",
  "éventail",
  "évidence",
  "éviter",
  "évolutif",
  "évoquer",
  "exact",
  "exagérer",
  "exaucer",
  "exceller",
  "excitant",
  "exclusif",
  "excuse",
  "exécuter",
  "exemple",
  "exercer",
  "exhaler",
  "exhorter",
  "exigence",
  "exiler",
  "exister",
  "exotique",
  "expédier",
  "explorer",
  "exposer",
  "exprimer",
  "exquis",
  "extensif",
  "extraire",
  "exulter",
  "fable",
  "fabuleux",
  "facette",
  "facile",
  "facture",
  "faiblir",
  "falaise",
  "fameux",
  "famille",
  "farceur",
  "farfelu",
  "farine",
  "farouche",
  "fasciner",
  "fatal",
  "fatigue",
  "faucon",
  "fautif",
  "faveur",
  "favori",
  "fébrile",
  "féconder",
  "fédérer",
  "félin",
  "femme",
  "fémur",
  "fendoir",
  "féodal",
  "fermer",
  "féroce",
  "ferveur",
  "festival",
  "feuille",
  "feutre",
  "février",
  "fiasco",
  "ficeler",
  "fictif",
  "fidèle",
  "figure",
  "filature",
  "filetage",
  "filière",
  "filleul",
  "filmer",
  "filou",
  "filtrer",
  "financer",
  "finir",
  "fiole",
  "firme",
  "fissure",
  "fixer",
  "flairer",
  "flamme",
  "flasque",
  "flatteur",
  "fléau",
  "flèche",
  "fleur",
  "flexion",
  "flocon",
  "flore",
  "fluctuer",
  "fluide",
  "fluvial",
  "folie",
  "fonderie",
  "fongible",
  "fontaine",
  "forcer",
  "forgeron",
  "formuler",
  "fortune",
  "fossile",
  "foudre",
  "fougère",
  "fouiller",
  "foulure",
  "fourmi",
  "fragile",
  "fraise",
  "franchir",
  "frapper",
  "frayeur",
  "frégate",
  "freiner",
  "frelon",
  "frémir",
  "frénésie",
  "frère",
  "friable",
  "friction",
  "frisson",
  "frivole",
  "froid",
  "fromage",
  "frontal",
  "frotter",
  "fruit",
  "fugitif",
  "fuite",
  "fureur",
  "furieux",
  "furtif",
  "fusion",
  "futur",
  "gagner",
  "galaxie",
  "galerie",
  "gambader",
  "garantir",
  "gardien",
  "garnir",
  "garrigue",
  "gazelle",
  "gazon",
  "géant",
  "gélatine",
  "gélule",
  "gendarme",
  "général",
  "génie",
  "genou",
  "gentil",
  "géologie",
  "géomètre",
  "géranium",
  "germe",
  "gestuel",
  "geyser",
  "gibier",
  "gicler",
  "girafe",
  "givre",
  "glace",
  "glaive",
  "glisser",
  "globe",
  "gloire",
  "glorieux",
  "golfeur",
  "gomme",
  "gonfler",
  "gorge",
  "gorille",
  "goudron",
  "gouffre",
  "goulot",
  "goupille",
  "gourmand",
  "goutte",
  "graduel",
  "graffiti",
  "graine",
  "grand",
  "grappin",
  "gratuit",
  "gravir",
  "grenat",
  "griffure",
  "griller",
  "grimper",
  "grogner",
  "gronder",
  "grotte",
  "groupe",
  "gruger",
  "grutier",
  "gruyère",
  "guépard",
  "guerrier",
  "guide",
  "guimauve",
  "guitare",
  "gustatif",
  "gymnaste",
  "gyrostat",
  "habitude",
  "hachoir",
  "halte",
  "hameau",
  "hangar",
  "hanneton",
  "haricot",
  "harmonie",
  "harpon",
  "hasard",
  "hélium",
  "hématome",
  "herbe",
  "hérisson",
  "hermine",
  "héron",
  "hésiter",
  "heureux",
  "hiberner",
  "hibou",
  "hilarant",
  "histoire",
  "hiver",
  "homard",
  "hommage",
  "homogène",
  "honneur",
  "honorer",
  "honteux",
  "horde",
  "horizon",
  "horloge",
  "hormone",
  "horrible",
  "houleux",
  "housse",
  "hublot",
  "huileux",
  "humain",
  "humble",
  "humide",
  "humour",
  "hurler",
  "hydromel",
  "hygiène",
  "hymne",
  "hypnose",
  "idylle",
  "ignorer",
  "iguane",
  "illicite",
  "illusion",
  "image",
  "imbiber",
  "imiter",
  "immense",
  "immobile",
  "immuable",
  "impact",
  "impérial",
  "implorer",
  "imposer",
  "imprimer",
  "imputer",
  "incarner",
  "incendie",
  "incident",
  "incliner",
  "incolore",
  "indexer",
  "indice",
  "inductif",
  "inédit",
  "ineptie",
  "inexact",
  "infini",
  "infliger",
  "informer",
  "infusion",
  "ingérer",
  "inhaler",
  "inhiber",
  "injecter",
  "injure",
  "innocent",
  "inoculer",
  "inonder",
  "inscrire",
  "insecte",
  "insigne",
  "insolite",
  "inspirer",
  "instinct",
  "insulter",
  "intact",
  "intense",
  "intime",
  "intrigue",
  "intuitif",
  "inutile",
  "invasion",
  "inventer",
  "inviter",
  "invoquer",
  "ironique",
  "irradier",
  "irréel",
  "irriter",
  "isoler",
  "ivoire",
  "ivresse",
  "jaguar",
  "jaillir",
  "jambe",
  "janvier",
  "jardin",
  "jauger",
  "jaune",
  "javelot",
  "jetable",
  "jeton",
  "jeudi",
  "jeunesse",
  "joindre",
  "joncher",
  "jongler",
  "joueur",
  "jouissif",
  "journal",
  "jovial",
  "joyau",
  "joyeux",
  "jubiler",
  "jugement",
  "junior",
  "jupon",
  "juriste",
  "justice",
  "juteux",
  "juvénile",
  "kayak",
  "kimono",
  "kiosque",
  "label",
  "labial",
  "labourer",
  "lacérer",
  "lactose",
  "lagune",
  "laine",
  "laisser",
  "laitier",
  "lambeau",
  "lamelle",
  "lampe",
  "lanceur",
  "langage",
  "lanterne",
  "lapin",
  "largeur",
  "larme",
  "laurier",
  "lavabo",
  "lavoir",
  "lecture",
  "légal",
  "léger",
  "légume",
  "lessive",
  "lettre",
  "levier",
  "lexique",
  "lézard",
  "liasse",
  "libérer",
  "libre",
  "licence",
  "licorne",
  "liège",
  "lièvre",
  "ligature",
  "ligoter",
  "ligue",
  "limer",
  "limite",
  "limonade",
  "limpide",
  "linéaire",
  "lingot",
  "lionceau",
  "liquide",
  "lisière",
  "lister",
  "lithium",
  "litige",
  "littoral",
  "livreur",
  "logique",
  "lointain",
  "loisir",
  "lombric",
  "loterie",
  "louer",
  "lourd",
  "loutre",
  "louve",
  "loyal",
  "lubie",
  "lucide",
  "lucratif",
  "lueur",
  "lugubre",
  "luisant",
  "lumière",
  "lunaire",
  "lundi",
  "luron",
  "lutter",
  "luxueux",
  "machine",
  "magasin",
  "magenta",
  "magique",
  "maigre",
  "maillon",
  "maintien",
  "mairie",
  "maison",
  "majorer",
  "malaxer",
  "maléfice",
  "malheur",
  "malice",
  "mallette",
  "mammouth",
  "mandater",
  "maniable",
  "manquant",
  "manteau",
  "manuel",
  "marathon",
  "marbre",
  "marchand",
  "mardi",
  "maritime",
  "marqueur",
  "marron",
  "marteler",
  "mascotte",
  "massif",
  "matériel",
  "matière",
  "matraque",
  "maudire",
  "maussade",
  "mauve",
  "maximal",
  "méchant",
  "méconnu",
  "médaille",
  "médecin",
  "méditer",
  "méduse",
  "meilleur",
  "mélange",
  "mélodie",
  "membre",
  "mémoire",
  "menacer",
  "mener",
  "menhir",
  "mensonge",
  "mentor",
  "mercredi",
  "mérite",
  "merle",
  "messager",
  "mesure",
  "métal",
  "météore",
  "méthode",
  "métier",
  "meuble",
  "miauler",
  "microbe",
  "miette",
  "mignon",
  "migrer",
  "milieu",
  "million",
  "mimique",
  "mince",
  "minéral",
  "minimal",
  "minorer",
  "minute",
  "miracle",
  "miroiter",
  "missile",
  "mixte",
  "mobile",
  "moderne",
  "moelleux",
  "mondial",
  "moniteur",
  "monnaie",
  "monotone",
  "monstre",
  "montagne",
  "monument",
  "moqueur",
  "morceau",
  "morsure",
  "mortier",
  "moteur",
  "motif",
  "mouche",
  "moufle",
  "moulin",
  "mousson",
  "mouton",
  "mouvant",
  "multiple",
  "munition",
  "muraille",
  "murène",
  "murmure",
  "muscle",
  "muséum",
  "musicien",
  "mutation",
  "muter",
  "mutuel",
  "myriade",
  "myrtille",
  "mystère",
  "mythique",
  "nageur",
  "nappe",
  "narquois",
  "narrer",
  "natation",
  "nation",
  "nature",
  "naufrage",
  "nautique",
  "navire",
  "nébuleux",
  "nectar",
  "néfaste",
  "négation",
  "négliger",
  "négocier",
  "neige",
  "nerveux",
  "nettoyer",
  "neurone",
  "neutron",
  "neveu",
  "niche",
  "nickel",
  "nitrate",
  "niveau",
  "noble",
  "nocif",
  "nocturne",
  "noirceur",
  "noisette",
  "nomade",
  "nombreux",
  "nommer",
  "normatif",
  "notable",
  "notifier",
  "notoire",
  "nourrir",
  "nouveau",
  "novateur",
  "novembre",
  "novice",
  "nuage",
  "nuancer",
  "nuire",
  "nuisible",
  "numéro",
  "nuptial",
  "nuque",
  "nutritif",
  "obéir",
  "objectif",
  "obliger",
  "obscur",
  "observer",
  "obstacle",
  "obtenir",
  "obturer",
  "occasion",
  "occuper",
  "océan",
  "octobre",
  "octroyer",
  "octupler",
  "oculaire",
  "odeur",
  "odorant",
  "offenser",
  "officier",
  "offrir",
  "ogive",
  "oiseau",
  "oisillon",
  "olfactif",
  "olivier",
  "ombrage",
  "omettre",
  "onctueux",
  "onduler",
  "onéreux",
  "onirique",
  "opale",
  "opaque",
  "opérer",
  "opinion",
  "opportun",
  "opprimer",
  "opter",
  "optique",
  "orageux",
  "orange",
  "orbite",
  "ordonner",
  "oreille",
  "organe",
  "orgueil",
  "orifice",
  "ornement",
  "orque",
  "ortie",
  "osciller",
  "osmose",
  "ossature",
  "otarie",
  "ouragan",
  "ourson",
  "outil",
  "outrager",
  "ouvrage",
  "ovation",
  "oxyde",
  "oxygène",
  "ozone",
  "paisible",
  "palace",
  "palmarès",
  "palourde",
  "palper",
  "panache",
  "panda",
  "pangolin",
  "paniquer",
  "panneau",
  "panorama",
  "pantalon",
  "papaye",
  "papier",
  "papoter",
  "papyrus",
  "paradoxe",
  "parcelle",
  "paresse",
  "parfumer",
  "parler",
  "parole",
  "parrain",
  "parsemer",
  "partager",
  "parure",
  "parvenir",
  "passion",
  "pastèque",
  "paternel",
  "patience",
  "patron",
  "pavillon",
  "pavoiser",
  "payer",
  "paysage",
  "peigne",
  "peintre",
  "pelage",
  "pélican",
  "pelle",
  "pelouse",
  "peluche",
  "pendule",
  "pénétrer",
  "pénible",
  "pensif",
  "pénurie",
  "pépite",
  "péplum",
  "perdrix",
  "perforer",
  "période",
  "permuter",
  "perplexe",
  "persil",
  "perte",
  "peser",
  "pétale",
  "petit",
  "pétrir",
  "peuple",
  "pharaon",
  "phobie",
  "phoque",
  "photon",
  "phrase",
  "physique",
  "piano",
  "pictural",
  "pièce",
  "pierre",
  "pieuvre",
  "pilote",
  "pinceau",
  "pipette",
  "piquer",
  "pirogue",
  "piscine",
  "piston",
  "pivoter",
  "pixel",
  "pizza",
  "placard",
  "plafond",
  "plaisir",
  "planer",
  "plaque",
  "plastron",
  "plateau",
  "pleurer",
  "plexus",
  "pliage",
  "plomb",
  "plonger",
  "pluie",
  "plumage",
  "pochette",
  "poésie",
  "poète",
  "pointe",
  "poirier",
  "poisson",
  "poivre",
  "polaire",
  "policier",
  "pollen",
  "polygone",
  "pommade",
  "pompier",
  "ponctuel",
  "pondérer",
  "poney",
  "portique",
  "position",
  "posséder",
  "posture",
  "potager",
  "poteau",
  "potion",
  "pouce",
  "poulain",
  "poumon",
  "pourpre",
  "poussin",
  "pouvoir",
  "prairie",
  "pratique",
  "précieux",
  "prédire",
  "préfixe",
  "prélude",
  "prénom",
  "présence",
  "prétexte",
  "prévoir",
  "primitif",
  "prince",
  "prison",
  "priver",
  "problème",
  "procéder",
  "prodige",
  "profond",
  "progrès",
  "proie",
  "projeter",
  "prologue",
  "promener",
  "propre",
  "prospère",
  "protéger",
  "prouesse",
  "proverbe",
  "prudence",
  "pruneau",
  "psychose",
  "public",
  "puceron",
  "puiser",
  "pulpe",
  "pulsar",
  "punaise",
  "punitif",
  "pupitre",
  "purifier",
  "puzzle",
  "pyramide",
  "quasar",
  "querelle",
  "question",
  "quiétude",
  "quitter",
  "quotient",
  "racine",
  "raconter",
  "radieux",
  "ragondin",
  "raideur",
  "raisin",
  "ralentir",
  "rallonge",
  "ramasser",
  "rapide",
  "rasage",
  "ratisser",
  "ravager",
  "ravin",
  "rayonner",
  "réactif",
  "réagir",
  "réaliser",
  "réanimer",
  "recevoir",
  "réciter",
  "réclamer",
  "récolter",
  "recruter",
  "reculer",
  "recycler",
  "rédiger",
  "redouter",
  "refaire",
  "réflexe",
  "réformer",
  "refrain",
  "refuge",
  "régalien",
  "région",
  "réglage",
  "régulier",
  "réitérer",
  "rejeter",
  "rejouer",
  "relatif",
  "relever",
  "relief",
  "remarque",
  "remède",
  "remise",
  "remonter",
  "remplir",
  "remuer",
  "renard",
  "renfort",
  "renifler",
  "renoncer",
  "rentrer",
  "renvoi",
  "replier",
  "reporter",
  "reprise",
  "reptile",
  "requin",
  "réserve",
  "résineux",
  "résoudre",
  "respect",
  "rester",
  "résultat",
  "rétablir",
  "retenir",
  "réticule",
  "retomber",
  "retracer",
  "réunion",
  "réussir",
  "revanche",
  "revivre",
  "révolte",
  "révulsif",
  "richesse",
  "rideau",
  "rieur",
  "rigide",
  "rigoler",
  "rincer",
  "riposter",
  "risible",
  "risque",
  "rituel",
  "rival",
  "rivière",
  "rocheux",
  "romance",
  "rompre",
  "ronce",
  "rondin",
  "roseau",
  "rosier",
  "rotatif",
  "rotor",
  "rotule",
  "rouge",
  "rouille",
  "rouleau",
  "routine",
  "royaume",
  "ruban",
  "rubis",
  "ruche",
  "ruelle",
  "rugueux",
  "ruiner",
  "ruisseau",
  "ruser",
  "rustique",
  "rythme",
  "sabler",
  "saboter",
  "sabre",
  "sacoche",
  "safari",
  "sagesse",
  "saisir",
  "salade",
  "salive",
  "salon",
  "saluer",
  "samedi",
  "sanction",
  "sanglier",
  "sarcasme",
  "sardine",
  "saturer",
  "saugrenu",
  "saumon",
  "sauter",
  "sauvage",
  "savant",
  "savonner",
  "scalpel",
  "scandale",
  "scélérat",
  "scénario",
  "sceptre",
  "schéma",
  "science",
  "scinder",
  "score",
  "scrutin",
  "sculpter",
  "séance",
  "sécable",
  "sécher",
  "secouer",
  "sécréter",
  "sédatif",
  "séduire",
  "seigneur",
  "séjour",
  "sélectif",
  "semaine",
  "sembler",
  "semence",
  "séminal",
  "sénateur",
  "sensible",
  "sentence",
  "séparer",
  "séquence",
  "serein",
  "sergent",
  "sérieux",
  "serrure",
  "sérum",
  "service",
  "sésame",
  "sévir",
  "sevrage",
  "sextuple",
  "sidéral",
  "siècle",
  "siéger",
  "siffler",
  "sigle",
  "signal",
  "silence",
  "silicium",
  "simple",
  "sincère",
  "sinistre",
  "siphon",
  "sirop",
  "sismique",
  "situer",
  "skier",
  "social",
  "socle",
  "sodium",
  "soigneux",
  "soldat",
  "soleil",
  "solitude",
  "soluble",
  "sombre",
  "sommeil",
  "somnoler",
  "sonde",
  "songeur",
  "sonnette",
  "sonore",
  "sorcier",
  "sortir",
  "sosie",
  "sottise",
  "soucieux",
  "soudure",
  "souffle",
  "soulever",
  "soupape",
  "source",
  "soutirer",
  "souvenir",
  "spacieux",
  "spatial",
  "spécial",
  "sphère",
  "spiral",
  "stable",
  "station",
  "sternum",
  "stimulus",
  "stipuler",
  "strict",
  "studieux",
  "stupeur",
  "styliste",
  "sublime",
  "substrat",
  "subtil",
  "subvenir",
  "succès",
  "sucre",
  "suffixe",
  "suggérer",
  "suiveur",
  "sulfate",
  "superbe",
  "supplier",
  "surface",
  "suricate",
  "surmener",
  "surprise",
  "sursaut",
  "survie",
  "suspect",
  "syllabe",
  "symbole",
  "symétrie",
  "synapse",
  "syntaxe",
  "système",
  "tabac",
  "tablier",
  "tactile",
  "tailler",
  "talent",
  "talisman",
  "talonner",
  "tambour",
  "tamiser",
  "tangible",
  "tapis",
  "taquiner",
  "tarder",
  "tarif",
  "tartine",
  "tasse",
  "tatami",
  "tatouage",
  "taupe",
  "taureau",
  "taxer",
  "témoin",
  "temporel",
  "tenaille",
  "tendre",
  "teneur",
  "tenir",
  "tension",
  "terminer",
  "terne",
  "terrible",
  "tétine",
  "texte",
  "thème",
  "théorie",
  "thérapie",
  "thorax",
  "tibia",
  "tiède",
  "timide",
  "tirelire",
  "tiroir",
  "tissu",
  "titane",
  "titre",
  "tituber",
  "toboggan",
  "tolérant",
  "tomate",
  "tonique",
  "tonneau",
  "toponyme",
  "torche",
  "tordre",
  "tornade",
  "torpille",
  "torrent",
  "torse",
  "tortue",
  "totem",
  "toucher",
  "tournage",
  "tousser",
  "toxine",
  "traction",
  "trafic",
  "tragique",
  "trahir",
  "train",
  "trancher",
  "travail",
  "trèfle",
  "tremper",
  "trésor",
  "treuil",
  "triage",
  "tribunal",
  "tricoter",
  "trilogie",
  "triomphe",
  "tripler",
  "triturer",
  "trivial",
  "trombone",
  "tronc",
  "tropical",
  "troupeau",
  "tuile",
  "tulipe",
  "tumulte",
  "tunnel",
  "turbine",
  "tuteur",
  "tutoyer",
  "tuyau",
  "tympan",
  "typhon",
  "typique",
  "tyran",
  "ubuesque",
  "ultime",
  "ultrason",
  "unanime",
  "unifier",
  "union",
  "unique",
  "unitaire",
  "univers",
  "uranium",
  "urbain",
  "urticant",
  "usage",
  "usine",
  "usuel",
  "usure",
  "utile",
  "utopie",
  "vacarme",
  "vaccin",
  "vagabond",
  "vague",
  "vaillant",
  "vaincre",
  "vaisseau",
  "valable",
  "valise",
  "vallon",
  "valve",
  "vampire",
  "vanille",
  "vapeur",
  "varier",
  "vaseux",
  "vassal",
  "vaste",
  "vecteur",
  "vedette",
  "végétal",
  "véhicule",
  "veinard",
  "véloce",
  "vendredi",
  "vénérer",
  "venger",
  "venimeux",
  "ventouse",
  "verdure",
  "vérin",
  "vernir",
  "verrou",
  "verser",
  "vertu",
  "veston",
  "vétéran",
  "vétuste",
  "vexant",
  "vexer",
  "viaduc",
  "viande",
  "victoire",
  "vidange",
  "vidéo",
  "vignette",
  "vigueur",
  "vilain",
  "village",
  "vinaigre",
  "violon",
  "vipère",
  "virement",
  "virtuose",
  "virus",
  "visage",
  "viseur",
  "vision",
  "visqueux",
  "visuel",
  "vital",
  "vitesse",
  "viticole",
  "vitrine",
  "vivace",
  "vivipare",
  "vocation",
  "voguer",
  "voile",
  "voisin",
  "voiture",
  "volaille",
  "volcan",
  "voltiger",
  "volume",
  "vorace",
  "vortex",
  "voter",
  "vouloir",
  "voyage",
  "voyelle",
  "wagon",
  "xénon",
  "yacht",
  "zèbre",
  "zénith",
  "zeste",
  "zoologie"
];
const require$$5 = [
  "abaco",
  "abbaglio",
  "abbinato",
  "abete",
  "abisso",
  "abolire",
  "abrasivo",
  "abrogato",
  "accadere",
  "accenno",
  "accusato",
  "acetone",
  "achille",
  "acido",
  "acqua",
  "acre",
  "acrilico",
  "acrobata",
  "acuto",
  "adagio",
  "addebito",
  "addome",
  "adeguato",
  "aderire",
  "adipe",
  "adottare",
  "adulare",
  "affabile",
  "affetto",
  "affisso",
  "affranto",
  "aforisma",
  "afoso",
  "africano",
  "agave",
  "agente",
  "agevole",
  "aggancio",
  "agire",
  "agitare",
  "agonismo",
  "agricolo",
  "agrumeto",
  "aguzzo",
  "alabarda",
  "alato",
  "albatro",
  "alberato",
  "albo",
  "albume",
  "alce",
  "alcolico",
  "alettone",
  "alfa",
  "algebra",
  "aliante",
  "alibi",
  "alimento",
  "allagato",
  "allegro",
  "allievo",
  "allodola",
  "allusivo",
  "almeno",
  "alogeno",
  "alpaca",
  "alpestre",
  "altalena",
  "alterno",
  "alticcio",
  "altrove",
  "alunno",
  "alveolo",
  "alzare",
  "amalgama",
  "amanita",
  "amarena",
  "ambito",
  "ambrato",
  "ameba",
  "america",
  "ametista",
  "amico",
  "ammasso",
  "ammenda",
  "ammirare",
  "ammonito",
  "amore",
  "ampio",
  "ampliare",
  "amuleto",
  "anacardo",
  "anagrafe",
  "analista",
  "anarchia",
  "anatra",
  "anca",
  "ancella",
  "ancora",
  "andare",
  "andrea",
  "anello",
  "angelo",
  "angolare",
  "angusto",
  "anima",
  "annegare",
  "annidato",
  "anno",
  "annuncio",
  "anonimo",
  "anticipo",
  "anzi",
  "apatico",
  "apertura",
  "apode",
  "apparire",
  "appetito",
  "appoggio",
  "approdo",
  "appunto",
  "aprile",
  "arabica",
  "arachide",
  "aragosta",
  "araldica",
  "arancio",
  "aratura",
  "arazzo",
  "arbitro",
  "archivio",
  "ardito",
  "arenile",
  "argento",
  "argine",
  "arguto",
  "aria",
  "armonia",
  "arnese",
  "arredato",
  "arringa",
  "arrosto",
  "arsenico",
  "arso",
  "artefice",
  "arzillo",
  "asciutto",
  "ascolto",
  "asepsi",
  "asettico",
  "asfalto",
  "asino",
  "asola",
  "aspirato",
  "aspro",
  "assaggio",
  "asse",
  "assoluto",
  "assurdo",
  "asta",
  "astenuto",
  "astice",
  "astratto",
  "atavico",
  "ateismo",
  "atomico",
  "atono",
  "attesa",
  "attivare",
  "attorno",
  "attrito",
  "attuale",
  "ausilio",
  "austria",
  "autista",
  "autonomo",
  "autunno",
  "avanzato",
  "avere",
  "avvenire",
  "avviso",
  "avvolgere",
  "azione",
  "azoto",
  "azzimo",
  "azzurro",
  "babele",
  "baccano",
  "bacino",
  "baco",
  "badessa",
  "badilata",
  "bagnato",
  "baita",
  "balcone",
  "baldo",
  "balena",
  "ballata",
  "balzano",
  "bambino",
  "bandire",
  "baraonda",
  "barbaro",
  "barca",
  "baritono",
  "barlume",
  "barocco",
  "basilico",
  "basso",
  "batosta",
  "battuto",
  "baule",
  "bava",
  "bavosa",
  "becco",
  "beffa",
  "belgio",
  "belva",
  "benda",
  "benevole",
  "benigno",
  "benzina",
  "bere",
  "berlina",
  "beta",
  "bibita",
  "bici",
  "bidone",
  "bifido",
  "biga",
  "bilancia",
  "bimbo",
  "binocolo",
  "biologo",
  "bipede",
  "bipolare",
  "birbante",
  "birra",
  "biscotto",
  "bisesto",
  "bisnonno",
  "bisonte",
  "bisturi",
  "bizzarro",
  "blando",
  "blatta",
  "bollito",
  "bonifico",
  "bordo",
  "bosco",
  "botanico",
  "bottino",
  "bozzolo",
  "braccio",
  "bradipo",
  "brama",
  "branca",
  "bravura",
  "bretella",
  "brevetto",
  "brezza",
  "briglia",
  "brillante",
  "brindare",
  "broccolo",
  "brodo",
  "bronzina",
  "brullo",
  "bruno",
  "bubbone",
  "buca",
  "budino",
  "buffone",
  "buio",
  "bulbo",
  "buono",
  "burlone",
  "burrasca",
  "bussola",
  "busta",
  "cadetto",
  "caduco",
  "calamaro",
  "calcolo",
  "calesse",
  "calibro",
  "calmo",
  "caloria",
  "cambusa",
  "camerata",
  "camicia",
  "cammino",
  "camola",
  "campale",
  "canapa",
  "candela",
  "cane",
  "canino",
  "canotto",
  "cantina",
  "capace",
  "capello",
  "capitolo",
  "capogiro",
  "cappero",
  "capra",
  "capsula",
  "carapace",
  "carcassa",
  "cardo",
  "carisma",
  "carovana",
  "carretto",
  "cartolina",
  "casaccio",
  "cascata",
  "caserma",
  "caso",
  "cassone",
  "castello",
  "casuale",
  "catasta",
  "catena",
  "catrame",
  "cauto",
  "cavillo",
  "cedibile",
  "cedrata",
  "cefalo",
  "celebre",
  "cellulare",
  "cena",
  "cenone",
  "centesimo",
  "ceramica",
  "cercare",
  "certo",
  "cerume",
  "cervello",
  "cesoia",
  "cespo",
  "ceto",
  "chela",
  "chiaro",
  "chicca",
  "chiedere",
  "chimera",
  "china",
  "chirurgo",
  "chitarra",
  "ciao",
  "ciclismo",
  "cifrare",
  "cigno",
  "cilindro",
  "ciottolo",
  "circa",
  "cirrosi",
  "citrico",
  "cittadino",
  "ciuffo",
  "civetta",
  "civile",
  "classico",
  "clinica",
  "cloro",
  "cocco",
  "codardo",
  "codice",
  "coerente",
  "cognome",
  "collare",
  "colmato",
  "colore",
  "colposo",
  "coltivato",
  "colza",
  "coma",
  "cometa",
  "commando",
  "comodo",
  "computer",
  "comune",
  "conciso",
  "condurre",
  "conferma",
  "congelare",
  "coniuge",
  "connesso",
  "conoscere",
  "consumo",
  "continuo",
  "convegno",
  "coperto",
  "copione",
  "coppia",
  "copricapo",
  "corazza",
  "cordata",
  "coricato",
  "cornice",
  "corolla",
  "corpo",
  "corredo",
  "corsia",
  "cortese",
  "cosmico",
  "costante",
  "cottura",
  "covato",
  "cratere",
  "cravatta",
  "creato",
  "credere",
  "cremoso",
  "crescita",
  "creta",
  "criceto",
  "crinale",
  "crisi",
  "critico",
  "croce",
  "cronaca",
  "crostata",
  "cruciale",
  "crusca",
  "cucire",
  "cuculo",
  "cugino",
  "cullato",
  "cupola",
  "curatore",
  "cursore",
  "curvo",
  "cuscino",
  "custode",
  "dado",
  "daino",
  "dalmata",
  "damerino",
  "daniela",
  "dannoso",
  "danzare",
  "datato",
  "davanti",
  "davvero",
  "debutto",
  "decennio",
  "deciso",
  "declino",
  "decollo",
  "decreto",
  "dedicato",
  "definito",
  "deforme",
  "degno",
  "delegare",
  "delfino",
  "delirio",
  "delta",
  "demenza",
  "denotato",
  "dentro",
  "deposito",
  "derapata",
  "derivare",
  "deroga",
  "descritto",
  "deserto",
  "desiderio",
  "desumere",
  "detersivo",
  "devoto",
  "diametro",
  "dicembre",
  "diedro",
  "difeso",
  "diffuso",
  "digerire",
  "digitale",
  "diluvio",
  "dinamico",
  "dinnanzi",
  "dipinto",
  "diploma",
  "dipolo",
  "diradare",
  "dire",
  "dirotto",
  "dirupo",
  "disagio",
  "discreto",
  "disfare",
  "disgelo",
  "disposto",
  "distanza",
  "disumano",
  "dito",
  "divano",
  "divelto",
  "dividere",
  "divorato",
  "doblone",
  "docente",
  "doganale",
  "dogma",
  "dolce",
  "domato",
  "domenica",
  "dominare",
  "dondolo",
  "dono",
  "dormire",
  "dote",
  "dottore",
  "dovuto",
  "dozzina",
  "drago",
  "druido",
  "dubbio",
  "dubitare",
  "ducale",
  "duna",
  "duomo",
  "duplice",
  "duraturo",
  "ebano",
  "eccesso",
  "ecco",
  "eclissi",
  "economia",
  "edera",
  "edicola",
  "edile",
  "editoria",
  "educare",
  "egemonia",
  "egli",
  "egoismo",
  "egregio",
  "elaborato",
  "elargire",
  "elegante",
  "elencato",
  "eletto",
  "elevare",
  "elfico",
  "elica",
  "elmo",
  "elsa",
  "eluso",
  "emanato",
  "emblema",
  "emesso",
  "emiro",
  "emotivo",
  "emozione",
  "empirico",
  "emulo",
  "endemico",
  "enduro",
  "energia",
  "enfasi",
  "enoteca",
  "entrare",
  "enzima",
  "epatite",
  "epilogo",
  "episodio",
  "epocale",
  "eppure",
  "equatore",
  "erario",
  "erba",
  "erboso",
  "erede",
  "eremita",
  "erigere",
  "ermetico",
  "eroe",
  "erosivo",
  "errante",
  "esagono",
  "esame",
  "esanime",
  "esaudire",
  "esca",
  "esempio",
  "esercito",
  "esibito",
  "esigente",
  "esistere",
  "esito",
  "esofago",
  "esortato",
  "esoso",
  "espanso",
  "espresso",
  "essenza",
  "esso",
  "esteso",
  "estimare",
  "estonia",
  "estroso",
  "esultare",
  "etilico",
  "etnico",
  "etrusco",
  "etto",
  "euclideo",
  "europa",
  "evaso",
  "evidenza",
  "evitato",
  "evoluto",
  "evviva",
  "fabbrica",
  "faccenda",
  "fachiro",
  "falco",
  "famiglia",
  "fanale",
  "fanfara",
  "fango",
  "fantasma",
  "fare",
  "farfalla",
  "farinoso",
  "farmaco",
  "fascia",
  "fastoso",
  "fasullo",
  "faticare",
  "fato",
  "favoloso",
  "febbre",
  "fecola",
  "fede",
  "fegato",
  "felpa",
  "feltro",
  "femmina",
  "fendere",
  "fenomeno",
  "fermento",
  "ferro",
  "fertile",
  "fessura",
  "festivo",
  "fetta",
  "feudo",
  "fiaba",
  "fiducia",
  "fifa",
  "figurato",
  "filo",
  "finanza",
  "finestra",
  "finire",
  "fiore",
  "fiscale",
  "fisico",
  "fiume",
  "flacone",
  "flamenco",
  "flebo",
  "flemma",
  "florido",
  "fluente",
  "fluoro",
  "fobico",
  "focaccia",
  "focoso",
  "foderato",
  "foglio",
  "folata",
  "folclore",
  "folgore",
  "fondente",
  "fonetico",
  "fonia",
  "fontana",
  "forbito",
  "forchetta",
  "foresta",
  "formica",
  "fornaio",
  "foro",
  "fortezza",
  "forzare",
  "fosfato",
  "fosso",
  "fracasso",
  "frana",
  "frassino",
  "fratello",
  "freccetta",
  "frenata",
  "fresco",
  "frigo",
  "frollino",
  "fronde",
  "frugale",
  "frutta",
  "fucilata",
  "fucsia",
  "fuggente",
  "fulmine",
  "fulvo",
  "fumante",
  "fumetto",
  "fumoso",
  "fune",
  "funzione",
  "fuoco",
  "furbo",
  "furgone",
  "furore",
  "fuso",
  "futile",
  "gabbiano",
  "gaffe",
  "galateo",
  "gallina",
  "galoppo",
  "gambero",
  "gamma",
  "garanzia",
  "garbo",
  "garofano",
  "garzone",
  "gasdotto",
  "gasolio",
  "gastrico",
  "gatto",
  "gaudio",
  "gazebo",
  "gazzella",
  "geco",
  "gelatina",
  "gelso",
  "gemello",
  "gemmato",
  "gene",
  "genitore",
  "gennaio",
  "genotipo",
  "gergo",
  "ghepardo",
  "ghiaccio",
  "ghisa",
  "giallo",
  "gilda",
  "ginepro",
  "giocare",
  "gioiello",
  "giorno",
  "giove",
  "girato",
  "girone",
  "gittata",
  "giudizio",
  "giurato",
  "giusto",
  "globulo",
  "glutine",
  "gnomo",
  "gobba",
  "golf",
  "gomito",
  "gommone",
  "gonfio",
  "gonna",
  "governo",
  "gracile",
  "grado",
  "grafico",
  "grammo",
  "grande",
  "grattare",
  "gravoso",
  "grazia",
  "greca",
  "gregge",
  "grifone",
  "grigio",
  "grinza",
  "grotta",
  "gruppo",
  "guadagno",
  "guaio",
  "guanto",
  "guardare",
  "gufo",
  "guidare",
  "ibernato",
  "icona",
  "identico",
  "idillio",
  "idolo",
  "idra",
  "idrico",
  "idrogeno",
  "igiene",
  "ignaro",
  "ignorato",
  "ilare",
  "illeso",
  "illogico",
  "illudere",
  "imballo",
  "imbevuto",
  "imbocco",
  "imbuto",
  "immane",
  "immerso",
  "immolato",
  "impacco",
  "impeto",
  "impiego",
  "importo",
  "impronta",
  "inalare",
  "inarcare",
  "inattivo",
  "incanto",
  "incendio",
  "inchino",
  "incisivo",
  "incluso",
  "incontro",
  "incrocio",
  "incubo",
  "indagine",
  "india",
  "indole",
  "inedito",
  "infatti",
  "infilare",
  "inflitto",
  "ingaggio",
  "ingegno",
  "inglese",
  "ingordo",
  "ingrosso",
  "innesco",
  "inodore",
  "inoltrare",
  "inondato",
  "insano",
  "insetto",
  "insieme",
  "insonnia",
  "insulina",
  "intasato",
  "intero",
  "intonaco",
  "intuito",
  "inumidire",
  "invalido",
  "invece",
  "invito",
  "iperbole",
  "ipnotico",
  "ipotesi",
  "ippica",
  "iride",
  "irlanda",
  "ironico",
  "irrigato",
  "irrorare",
  "isolato",
  "isotopo",
  "isterico",
  "istituto",
  "istrice",
  "italia",
  "iterare",
  "labbro",
  "labirinto",
  "lacca",
  "lacerato",
  "lacrima",
  "lacuna",
  "laddove",
  "lago",
  "lampo",
  "lancetta",
  "lanterna",
  "lardoso",
  "larga",
  "laringe",
  "lastra",
  "latenza",
  "latino",
  "lattuga",
  "lavagna",
  "lavoro",
  "legale",
  "leggero",
  "lembo",
  "lentezza",
  "lenza",
  "leone",
  "lepre",
  "lesivo",
  "lessato",
  "lesto",
  "letterale",
  "leva",
  "levigato",
  "libero",
  "lido",
  "lievito",
  "lilla",
  "limatura",
  "limitare",
  "limpido",
  "lineare",
  "lingua",
  "liquido",
  "lira",
  "lirica",
  "lisca",
  "lite",
  "litigio",
  "livrea",
  "locanda",
  "lode",
  "logica",
  "lombare",
  "londra",
  "longevo",
  "loquace",
  "lorenzo",
  "loto",
  "lotteria",
  "luce",
  "lucidato",
  "lumaca",
  "luminoso",
  "lungo",
  "lupo",
  "luppolo",
  "lusinga",
  "lusso",
  "lutto",
  "macabro",
  "macchina",
  "macero",
  "macinato",
  "madama",
  "magico",
  "maglia",
  "magnete",
  "magro",
  "maiolica",
  "malafede",
  "malgrado",
  "malinteso",
  "malsano",
  "malto",
  "malumore",
  "mana",
  "mancia",
  "mandorla",
  "mangiare",
  "manifesto",
  "mannaro",
  "manovra",
  "mansarda",
  "mantide",
  "manubrio",
  "mappa",
  "maratona",
  "marcire",
  "maretta",
  "marmo",
  "marsupio",
  "maschera",
  "massaia",
  "mastino",
  "materasso",
  "matricola",
  "mattone",
  "maturo",
  "mazurca",
  "meandro",
  "meccanico",
  "mecenate",
  "medesimo",
  "meditare",
  "mega",
  "melassa",
  "melis",
  "melodia",
  "meninge",
  "meno",
  "mensola",
  "mercurio",
  "merenda",
  "merlo",
  "meschino",
  "mese",
  "messere",
  "mestolo",
  "metallo",
  "metodo",
  "mettere",
  "miagolare",
  "mica",
  "micelio",
  "michele",
  "microbo",
  "midollo",
  "miele",
  "migliore",
  "milano",
  "milite",
  "mimosa",
  "minerale",
  "mini",
  "minore",
  "mirino",
  "mirtillo",
  "miscela",
  "missiva",
  "misto",
  "misurare",
  "mitezza",
  "mitigare",
  "mitra",
  "mittente",
  "mnemonico",
  "modello",
  "modifica",
  "modulo",
  "mogano",
  "mogio",
  "mole",
  "molosso",
  "monastero",
  "monco",
  "mondina",
  "monetario",
  "monile",
  "monotono",
  "monsone",
  "montato",
  "monviso",
  "mora",
  "mordere",
  "morsicato",
  "mostro",
  "motivato",
  "motosega",
  "motto",
  "movenza",
  "movimento",
  "mozzo",
  "mucca",
  "mucosa",
  "muffa",
  "mughetto",
  "mugnaio",
  "mulatto",
  "mulinello",
  "multiplo",
  "mummia",
  "munto",
  "muovere",
  "murale",
  "musa",
  "muscolo",
  "musica",
  "mutevole",
  "muto",
  "nababbo",
  "nafta",
  "nanometro",
  "narciso",
  "narice",
  "narrato",
  "nascere",
  "nastrare",
  "naturale",
  "nautica",
  "naviglio",
  "nebulosa",
  "necrosi",
  "negativo",
  "negozio",
  "nemmeno",
  "neofita",
  "neretto",
  "nervo",
  "nessuno",
  "nettuno",
  "neutrale",
  "neve",
  "nevrotico",
  "nicchia",
  "ninfa",
  "nitido",
  "nobile",
  "nocivo",
  "nodo",
  "nome",
  "nomina",
  "nordico",
  "normale",
  "norvegese",
  "nostrano",
  "notare",
  "notizia",
  "notturno",
  "novella",
  "nucleo",
  "nulla",
  "numero",
  "nuovo",
  "nutrire",
  "nuvola",
  "nuziale",
  "oasi",
  "obbedire",
  "obbligo",
  "obelisco",
  "oblio",
  "obolo",
  "obsoleto",
  "occasione",
  "occhio",
  "occidente",
  "occorrere",
  "occultare",
  "ocra",
  "oculato",
  "odierno",
  "odorare",
  "offerta",
  "offrire",
  "offuscato",
  "oggetto",
  "oggi",
  "ognuno",
  "olandese",
  "olfatto",
  "oliato",
  "oliva",
  "ologramma",
  "oltre",
  "omaggio",
  "ombelico",
  "ombra",
  "omega",
  "omissione",
  "ondoso",
  "onere",
  "onice",
  "onnivoro",
  "onorevole",
  "onta",
  "operato",
  "opinione",
  "opposto",
  "oracolo",
  "orafo",
  "ordine",
  "orecchino",
  "orefice",
  "orfano",
  "organico",
  "origine",
  "orizzonte",
  "orma",
  "ormeggio",
  "ornativo",
  "orologio",
  "orrendo",
  "orribile",
  "ortensia",
  "ortica",
  "orzata",
  "orzo",
  "osare",
  "oscurare",
  "osmosi",
  "ospedale",
  "ospite",
  "ossa",
  "ossidare",
  "ostacolo",
  "oste",
  "otite",
  "otre",
  "ottagono",
  "ottimo",
  "ottobre",
  "ovale",
  "ovest",
  "ovino",
  "oviparo",
  "ovocito",
  "ovunque",
  "ovviare",
  "ozio",
  "pacchetto",
  "pace",
  "pacifico",
  "padella",
  "padrone",
  "paese",
  "paga",
  "pagina",
  "palazzina",
  "palesare",
  "pallido",
  "palo",
  "palude",
  "pandoro",
  "pannello",
  "paolo",
  "paonazzo",
  "paprica",
  "parabola",
  "parcella",
  "parere",
  "pargolo",
  "pari",
  "parlato",
  "parola",
  "partire",
  "parvenza",
  "parziale",
  "passivo",
  "pasticca",
  "patacca",
  "patologia",
  "pattume",
  "pavone",
  "peccato",
  "pedalare",
  "pedonale",
  "peggio",
  "peloso",
  "penare",
  "pendice",
  "penisola",
  "pennuto",
  "penombra",
  "pensare",
  "pentola",
  "pepe",
  "pepita",
  "perbene",
  "percorso",
  "perdonato",
  "perforare",
  "pergamena",
  "periodo",
  "permesso",
  "perno",
  "perplesso",
  "persuaso",
  "pertugio",
  "pervaso",
  "pesatore",
  "pesista",
  "peso",
  "pestifero",
  "petalo",
  "pettine",
  "petulante",
  "pezzo",
  "piacere",
  "pianta",
  "piattino",
  "piccino",
  "picozza",
  "piega",
  "pietra",
  "piffero",
  "pigiama",
  "pigolio",
  "pigro",
  "pila",
  "pilifero",
  "pillola",
  "pilota",
  "pimpante",
  "pineta",
  "pinna",
  "pinolo",
  "pioggia",
  "piombo",
  "piramide",
  "piretico",
  "pirite",
  "pirolisi",
  "pitone",
  "pizzico",
  "placebo",
  "planare",
  "plasma",
  "platano",
  "plenario",
  "pochezza",
  "poderoso",
  "podismo",
  "poesia",
  "poggiare",
  "polenta",
  "poligono",
  "pollice",
  "polmonite",
  "polpetta",
  "polso",
  "poltrona",
  "polvere",
  "pomice",
  "pomodoro",
  "ponte",
  "popoloso",
  "porfido",
  "poroso",
  "porpora",
  "porre",
  "portata",
  "posa",
  "positivo",
  "possesso",
  "postulato",
  "potassio",
  "potere",
  "pranzo",
  "prassi",
  "pratica",
  "precluso",
  "predica",
  "prefisso",
  "pregiato",
  "prelievo",
  "premere",
  "prenotare",
  "preparato",
  "presenza",
  "pretesto",
  "prevalso",
  "prima",
  "principe",
  "privato",
  "problema",
  "procura",
  "produrre",
  "profumo",
  "progetto",
  "prolunga",
  "promessa",
  "pronome",
  "proposta",
  "proroga",
  "proteso",
  "prova",
  "prudente",
  "prugna",
  "prurito",
  "psiche",
  "pubblico",
  "pudica",
  "pugilato",
  "pugno",
  "pulce",
  "pulito",
  "pulsante",
  "puntare",
  "pupazzo",
  "pupilla",
  "puro",
  "quadro",
  "qualcosa",
  "quasi",
  "querela",
  "quota",
  "raccolto",
  "raddoppio",
  "radicale",
  "radunato",
  "raffica",
  "ragazzo",
  "ragione",
  "ragno",
  "ramarro",
  "ramingo",
  "ramo",
  "randagio",
  "rantolare",
  "rapato",
  "rapina",
  "rappreso",
  "rasatura",
  "raschiato",
  "rasente",
  "rassegna",
  "rastrello",
  "rata",
  "ravveduto",
  "reale",
  "recepire",
  "recinto",
  "recluta",
  "recondito",
  "recupero",
  "reddito",
  "redimere",
  "regalato",
  "registro",
  "regola",
  "regresso",
  "relazione",
  "remare",
  "remoto",
  "renna",
  "replica",
  "reprimere",
  "reputare",
  "resa",
  "residente",
  "responso",
  "restauro",
  "rete",
  "retina",
  "retorica",
  "rettifica",
  "revocato",
  "riassunto",
  "ribadire",
  "ribelle",
  "ribrezzo",
  "ricarica",
  "ricco",
  "ricevere",
  "riciclato",
  "ricordo",
  "ricreduto",
  "ridicolo",
  "ridurre",
  "rifasare",
  "riflesso",
  "riforma",
  "rifugio",
  "rigare",
  "rigettato",
  "righello",
  "rilassato",
  "rilevato",
  "rimanere",
  "rimbalzo",
  "rimedio",
  "rimorchio",
  "rinascita",
  "rincaro",
  "rinforzo",
  "rinnovo",
  "rinomato",
  "rinsavito",
  "rintocco",
  "rinuncia",
  "rinvenire",
  "riparato",
  "ripetuto",
  "ripieno",
  "riportare",
  "ripresa",
  "ripulire",
  "risata",
  "rischio",
  "riserva",
  "risibile",
  "riso",
  "rispetto",
  "ristoro",
  "risultato",
  "risvolto",
  "ritardo",
  "ritegno",
  "ritmico",
  "ritrovo",
  "riunione",
  "riva",
  "riverso",
  "rivincita",
  "rivolto",
  "rizoma",
  "roba",
  "robotico",
  "robusto",
  "roccia",
  "roco",
  "rodaggio",
  "rodere",
  "roditore",
  "rogito",
  "rollio",
  "romantico",
  "rompere",
  "ronzio",
  "rosolare",
  "rospo",
  "rotante",
  "rotondo",
  "rotula",
  "rovescio",
  "rubizzo",
  "rubrica",
  "ruga",
  "rullino",
  "rumine",
  "rumoroso",
  "ruolo",
  "rupe",
  "russare",
  "rustico",
  "sabato",
  "sabbiare",
  "sabotato",
  "sagoma",
  "salasso",
  "saldatura",
  "salgemma",
  "salivare",
  "salmone",
  "salone",
  "saltare",
  "saluto",
  "salvo",
  "sapere",
  "sapido",
  "saporito",
  "saraceno",
  "sarcasmo",
  "sarto",
  "sassoso",
  "satellite",
  "satira",
  "satollo",
  "saturno",
  "savana",
  "savio",
  "saziato",
  "sbadiglio",
  "sbalzo",
  "sbancato",
  "sbarra",
  "sbattere",
  "sbavare",
  "sbendare",
  "sbirciare",
  "sbloccato",
  "sbocciato",
  "sbrinare",
  "sbruffone",
  "sbuffare",
  "scabroso",
  "scadenza",
  "scala",
  "scambiare",
  "scandalo",
  "scapola",
  "scarso",
  "scatenare",
  "scavato",
  "scelto",
  "scenico",
  "scettro",
  "scheda",
  "schiena",
  "sciarpa",
  "scienza",
  "scindere",
  "scippo",
  "sciroppo",
  "scivolo",
  "sclerare",
  "scodella",
  "scolpito",
  "scomparto",
  "sconforto",
  "scoprire",
  "scorta",
  "scossone",
  "scozzese",
  "scriba",
  "scrollare",
  "scrutinio",
  "scuderia",
  "scultore",
  "scuola",
  "scuro",
  "scusare",
  "sdebitare",
  "sdoganare",
  "seccatura",
  "secondo",
  "sedano",
  "seggiola",
  "segnalato",
  "segregato",
  "seguito",
  "selciato",
  "selettivo",
  "sella",
  "selvaggio",
  "semaforo",
  "sembrare",
  "seme",
  "seminato",
  "sempre",
  "senso",
  "sentire",
  "sepolto",
  "sequenza",
  "serata",
  "serbato",
  "sereno",
  "serio",
  "serpente",
  "serraglio",
  "servire",
  "sestina",
  "setola",
  "settimana",
  "sfacelo",
  "sfaldare",
  "sfamato",
  "sfarzoso",
  "sfaticato",
  "sfera",
  "sfida",
  "sfilato",
  "sfinge",
  "sfocato",
  "sfoderare",
  "sfogo",
  "sfoltire",
  "sforzato",
  "sfratto",
  "sfruttato",
  "sfuggito",
  "sfumare",
  "sfuso",
  "sgabello",
  "sgarbato",
  "sgonfiare",
  "sgorbio",
  "sgrassato",
  "sguardo",
  "sibilo",
  "siccome",
  "sierra",
  "sigla",
  "signore",
  "silenzio",
  "sillaba",
  "simbolo",
  "simpatico",
  "simulato",
  "sinfonia",
  "singolo",
  "sinistro",
  "sino",
  "sintesi",
  "sinusoide",
  "sipario",
  "sisma",
  "sistole",
  "situato",
  "slitta",
  "slogatura",
  "sloveno",
  "smarrito",
  "smemorato",
  "smentito",
  "smeraldo",
  "smilzo",
  "smontare",
  "smottato",
  "smussato",
  "snellire",
  "snervato",
  "snodo",
  "sobbalzo",
  "sobrio",
  "soccorso",
  "sociale",
  "sodale",
  "soffitto",
  "sogno",
  "soldato",
  "solenne",
  "solido",
  "sollazzo",
  "solo",
  "solubile",
  "solvente",
  "somatico",
  "somma",
  "sonda",
  "sonetto",
  "sonnifero",
  "sopire",
  "soppeso",
  "sopra",
  "sorgere",
  "sorpasso",
  "sorriso",
  "sorso",
  "sorteggio",
  "sorvolato",
  "sospiro",
  "sosta",
  "sottile",
  "spada",
  "spalla",
  "spargere",
  "spatola",
  "spavento",
  "spazzola",
  "specie",
  "spedire",
  "spegnere",
  "spelatura",
  "speranza",
  "spessore",
  "spettrale",
  "spezzato",
  "spia",
  "spigoloso",
  "spillato",
  "spinoso",
  "spirale",
  "splendido",
  "sportivo",
  "sposo",
  "spranga",
  "sprecare",
  "spronato",
  "spruzzo",
  "spuntino",
  "squillo",
  "sradicare",
  "srotolato",
  "stabile",
  "stacco",
  "staffa",
  "stagnare",
  "stampato",
  "stantio",
  "starnuto",
  "stasera",
  "statuto",
  "stelo",
  "steppa",
  "sterzo",
  "stiletto",
  "stima",
  "stirpe",
  "stivale",
  "stizzoso",
  "stonato",
  "storico",
  "strappo",
  "stregato",
  "stridulo",
  "strozzare",
  "strutto",
  "stuccare",
  "stufo",
  "stupendo",
  "subentro",
  "succoso",
  "sudore",
  "suggerito",
  "sugo",
  "sultano",
  "suonare",
  "superbo",
  "supporto",
  "surgelato",
  "surrogato",
  "sussurro",
  "sutura",
  "svagare",
  "svedese",
  "sveglio",
  "svelare",
  "svenuto",
  "svezia",
  "sviluppo",
  "svista",
  "svizzera",
  "svolta",
  "svuotare",
  "tabacco",
  "tabulato",
  "tacciare",
  "taciturno",
  "tale",
  "talismano",
  "tampone",
  "tannino",
  "tara",
  "tardivo",
  "targato",
  "tariffa",
  "tarpare",
  "tartaruga",
  "tasto",
  "tattico",
  "taverna",
  "tavolata",
  "tazza",
  "teca",
  "tecnico",
  "telefono",
  "temerario",
  "tempo",
  "temuto",
  "tendone",
  "tenero",
  "tensione",
  "tentacolo",
  "teorema",
  "terme",
  "terrazzo",
  "terzetto",
  "tesi",
  "tesserato",
  "testato",
  "tetro",
  "tettoia",
  "tifare",
  "tigella",
  "timbro",
  "tinto",
  "tipico",
  "tipografo",
  "tiraggio",
  "tiro",
  "titanio",
  "titolo",
  "titubante",
  "tizio",
  "tizzone",
  "toccare",
  "tollerare",
  "tolto",
  "tombola",
  "tomo",
  "tonfo",
  "tonsilla",
  "topazio",
  "topologia",
  "toppa",
  "torba",
  "tornare",
  "torrone",
  "tortora",
  "toscano",
  "tossire",
  "tostatura",
  "totano",
  "trabocco",
  "trachea",
  "trafila",
  "tragedia",
  "tralcio",
  "tramonto",
  "transito",
  "trapano",
  "trarre",
  "trasloco",
  "trattato",
  "trave",
  "treccia",
  "tremolio",
  "trespolo",
  "tributo",
  "tricheco",
  "trifoglio",
  "trillo",
  "trincea",
  "trio",
  "tristezza",
  "triturato",
  "trivella",
  "tromba",
  "trono",
  "troppo",
  "trottola",
  "trovare",
  "truccato",
  "tubatura",
  "tuffato",
  "tulipano",
  "tumulto",
  "tunisia",
  "turbare",
  "turchino",
  "tuta",
  "tutela",
  "ubicato",
  "uccello",
  "uccisore",
  "udire",
  "uditivo",
  "uffa",
  "ufficio",
  "uguale",
  "ulisse",
  "ultimato",
  "umano",
  "umile",
  "umorismo",
  "uncinetto",
  "ungere",
  "ungherese",
  "unicorno",
  "unificato",
  "unisono",
  "unitario",
  "unte",
  "uovo",
  "upupa",
  "uragano",
  "urgenza",
  "urlo",
  "usanza",
  "usato",
  "uscito",
  "usignolo",
  "usuraio",
  "utensile",
  "utilizzo",
  "utopia",
  "vacante",
  "vaccinato",
  "vagabondo",
  "vagliato",
  "valanga",
  "valgo",
  "valico",
  "valletta",
  "valoroso",
  "valutare",
  "valvola",
  "vampata",
  "vangare",
  "vanitoso",
  "vano",
  "vantaggio",
  "vanvera",
  "vapore",
  "varano",
  "varcato",
  "variante",
  "vasca",
  "vedetta",
  "vedova",
  "veduto",
  "vegetale",
  "veicolo",
  "velcro",
  "velina",
  "velluto",
  "veloce",
  "venato",
  "vendemmia",
  "vento",
  "verace",
  "verbale",
  "vergogna",
  "verifica",
  "vero",
  "verruca",
  "verticale",
  "vescica",
  "vessillo",
  "vestale",
  "veterano",
  "vetrina",
  "vetusto",
  "viandante",
  "vibrante",
  "vicenda",
  "vichingo",
  "vicinanza",
  "vidimare",
  "vigilia",
  "vigneto",
  "vigore",
  "vile",
  "villano",
  "vimini",
  "vincitore",
  "viola",
  "vipera",
  "virgola",
  "virologo",
  "virulento",
  "viscoso",
  "visione",
  "vispo",
  "vissuto",
  "visura",
  "vita",
  "vitello",
  "vittima",
  "vivanda",
  "vivido",
  "viziare",
  "voce",
  "voga",
  "volatile",
  "volere",
  "volpe",
  "voragine",
  "vulcano",
  "zampogna",
  "zanna",
  "zappato",
  "zattera",
  "zavorra",
  "zefiro",
  "zelante",
  "zelo",
  "zenzero",
  "zerbino",
  "zibetto",
  "zinco",
  "zircone",
  "zitto",
  "zolla",
  "zotico",
  "zucchero",
  "zufolo",
  "zulu",
  "zuppa"
];
const require$$6 = [
  "ábaco",
  "abdomen",
  "abeja",
  "abierto",
  "abogado",
  "abono",
  "aborto",
  "abrazo",
  "abrir",
  "abuelo",
  "abuso",
  "acabar",
  "academia",
  "acceso",
  "acción",
  "aceite",
  "acelga",
  "acento",
  "aceptar",
  "ácido",
  "aclarar",
  "acné",
  "acoger",
  "acoso",
  "activo",
  "acto",
  "actriz",
  "actuar",
  "acudir",
  "acuerdo",
  "acusar",
  "adicto",
  "admitir",
  "adoptar",
  "adorno",
  "aduana",
  "adulto",
  "aéreo",
  "afectar",
  "afición",
  "afinar",
  "afirmar",
  "ágil",
  "agitar",
  "agonía",
  "agosto",
  "agotar",
  "agregar",
  "agrio",
  "agua",
  "agudo",
  "águila",
  "aguja",
  "ahogo",
  "ahorro",
  "aire",
  "aislar",
  "ajedrez",
  "ajeno",
  "ajuste",
  "alacrán",
  "alambre",
  "alarma",
  "alba",
  "álbum",
  "alcalde",
  "aldea",
  "alegre",
  "alejar",
  "alerta",
  "aleta",
  "alfiler",
  "alga",
  "algodón",
  "aliado",
  "aliento",
  "alivio",
  "alma",
  "almeja",
  "almíbar",
  "altar",
  "alteza",
  "altivo",
  "alto",
  "altura",
  "alumno",
  "alzar",
  "amable",
  "amante",
  "amapola",
  "amargo",
  "amasar",
  "ámbar",
  "ámbito",
  "ameno",
  "amigo",
  "amistad",
  "amor",
  "amparo",
  "amplio",
  "ancho",
  "anciano",
  "ancla",
  "andar",
  "andén",
  "anemia",
  "ángulo",
  "anillo",
  "ánimo",
  "anís",
  "anotar",
  "antena",
  "antiguo",
  "antojo",
  "anual",
  "anular",
  "anuncio",
  "añadir",
  "añejo",
  "año",
  "apagar",
  "aparato",
  "apetito",
  "apio",
  "aplicar",
  "apodo",
  "aporte",
  "apoyo",
  "aprender",
  "aprobar",
  "apuesta",
  "apuro",
  "arado",
  "araña",
  "arar",
  "árbitro",
  "árbol",
  "arbusto",
  "archivo",
  "arco",
  "arder",
  "ardilla",
  "arduo",
  "área",
  "árido",
  "aries",
  "armonía",
  "arnés",
  "aroma",
  "arpa",
  "arpón",
  "arreglo",
  "arroz",
  "arruga",
  "arte",
  "artista",
  "asa",
  "asado",
  "asalto",
  "ascenso",
  "asegurar",
  "aseo",
  "asesor",
  "asiento",
  "asilo",
  "asistir",
  "asno",
  "asombro",
  "áspero",
  "astilla",
  "astro",
  "astuto",
  "asumir",
  "asunto",
  "atajo",
  "ataque",
  "atar",
  "atento",
  "ateo",
  "ático",
  "atleta",
  "átomo",
  "atraer",
  "atroz",
  "atún",
  "audaz",
  "audio",
  "auge",
  "aula",
  "aumento",
  "ausente",
  "autor",
  "aval",
  "avance",
  "avaro",
  "ave",
  "avellana",
  "avena",
  "avestruz",
  "avión",
  "aviso",
  "ayer",
  "ayuda",
  "ayuno",
  "azafrán",
  "azar",
  "azote",
  "azúcar",
  "azufre",
  "azul",
  "baba",
  "babor",
  "bache",
  "bahía",
  "baile",
  "bajar",
  "balanza",
  "balcón",
  "balde",
  "bambú",
  "banco",
  "banda",
  "baño",
  "barba",
  "barco",
  "barniz",
  "barro",
  "báscula",
  "bastón",
  "basura",
  "batalla",
  "batería",
  "batir",
  "batuta",
  "baúl",
  "bazar",
  "bebé",
  "bebida",
  "bello",
  "besar",
  "beso",
  "bestia",
  "bicho",
  "bien",
  "bingo",
  "blanco",
  "bloque",
  "blusa",
  "boa",
  "bobina",
  "bobo",
  "boca",
  "bocina",
  "boda",
  "bodega",
  "boina",
  "bola",
  "bolero",
  "bolsa",
  "bomba",
  "bondad",
  "bonito",
  "bono",
  "bonsái",
  "borde",
  "borrar",
  "bosque",
  "bote",
  "botín",
  "bóveda",
  "bozal",
  "bravo",
  "brazo",
  "brecha",
  "breve",
  "brillo",
  "brinco",
  "brisa",
  "broca",
  "broma",
  "bronce",
  "brote",
  "bruja",
  "brusco",
  "bruto",
  "buceo",
  "bucle",
  "bueno",
  "buey",
  "bufanda",
  "bufón",
  "búho",
  "buitre",
  "bulto",
  "burbuja",
  "burla",
  "burro",
  "buscar",
  "butaca",
  "buzón",
  "caballo",
  "cabeza",
  "cabina",
  "cabra",
  "cacao",
  "cadáver",
  "cadena",
  "caer",
  "café",
  "caída",
  "caimán",
  "caja",
  "cajón",
  "cal",
  "calamar",
  "calcio",
  "caldo",
  "calidad",
  "calle",
  "calma",
  "calor",
  "calvo",
  "cama",
  "cambio",
  "camello",
  "camino",
  "campo",
  "cáncer",
  "candil",
  "canela",
  "canguro",
  "canica",
  "canto",
  "caña",
  "cañón",
  "caoba",
  "caos",
  "capaz",
  "capitán",
  "capote",
  "captar",
  "capucha",
  "cara",
  "carbón",
  "cárcel",
  "careta",
  "carga",
  "cariño",
  "carne",
  "carpeta",
  "carro",
  "carta",
  "casa",
  "casco",
  "casero",
  "caspa",
  "castor",
  "catorce",
  "catre",
  "caudal",
  "causa",
  "cazo",
  "cebolla",
  "ceder",
  "cedro",
  "celda",
  "célebre",
  "celoso",
  "célula",
  "cemento",
  "ceniza",
  "centro",
  "cerca",
  "cerdo",
  "cereza",
  "cero",
  "cerrar",
  "certeza",
  "césped",
  "cetro",
  "chacal",
  "chaleco",
  "champú",
  "chancla",
  "chapa",
  "charla",
  "chico",
  "chiste",
  "chivo",
  "choque",
  "choza",
  "chuleta",
  "chupar",
  "ciclón",
  "ciego",
  "cielo",
  "cien",
  "cierto",
  "cifra",
  "cigarro",
  "cima",
  "cinco",
  "cine",
  "cinta",
  "ciprés",
  "circo",
  "ciruela",
  "cisne",
  "cita",
  "ciudad",
  "clamor",
  "clan",
  "claro",
  "clase",
  "clave",
  "cliente",
  "clima",
  "clínica",
  "cobre",
  "cocción",
  "cochino",
  "cocina",
  "coco",
  "código",
  "codo",
  "cofre",
  "coger",
  "cohete",
  "cojín",
  "cojo",
  "cola",
  "colcha",
  "colegio",
  "colgar",
  "colina",
  "collar",
  "colmo",
  "columna",
  "combate",
  "comer",
  "comida",
  "cómodo",
  "compra",
  "conde",
  "conejo",
  "conga",
  "conocer",
  "consejo",
  "contar",
  "copa",
  "copia",
  "corazón",
  "corbata",
  "corcho",
  "cordón",
  "corona",
  "correr",
  "coser",
  "cosmos",
  "costa",
  "cráneo",
  "cráter",
  "crear",
  "crecer",
  "creído",
  "crema",
  "cría",
  "crimen",
  "cripta",
  "crisis",
  "cromo",
  "crónica",
  "croqueta",
  "crudo",
  "cruz",
  "cuadro",
  "cuarto",
  "cuatro",
  "cubo",
  "cubrir",
  "cuchara",
  "cuello",
  "cuento",
  "cuerda",
  "cuesta",
  "cueva",
  "cuidar",
  "culebra",
  "culpa",
  "culto",
  "cumbre",
  "cumplir",
  "cuna",
  "cuneta",
  "cuota",
  "cupón",
  "cúpula",
  "curar",
  "curioso",
  "curso",
  "curva",
  "cutis",
  "dama",
  "danza",
  "dar",
  "dardo",
  "dátil",
  "deber",
  "débil",
  "década",
  "decir",
  "dedo",
  "defensa",
  "definir",
  "dejar",
  "delfín",
  "delgado",
  "delito",
  "demora",
  "denso",
  "dental",
  "deporte",
  "derecho",
  "derrota",
  "desayuno",
  "deseo",
  "desfile",
  "desnudo",
  "destino",
  "desvío",
  "detalle",
  "detener",
  "deuda",
  "día",
  "diablo",
  "diadema",
  "diamante",
  "diana",
  "diario",
  "dibujo",
  "dictar",
  "diente",
  "dieta",
  "diez",
  "difícil",
  "digno",
  "dilema",
  "diluir",
  "dinero",
  "directo",
  "dirigir",
  "disco",
  "diseño",
  "disfraz",
  "diva",
  "divino",
  "doble",
  "doce",
  "dolor",
  "domingo",
  "don",
  "donar",
  "dorado",
  "dormir",
  "dorso",
  "dos",
  "dosis",
  "dragón",
  "droga",
  "ducha",
  "duda",
  "duelo",
  "dueño",
  "dulce",
  "dúo",
  "duque",
  "durar",
  "dureza",
  "duro",
  "ébano",
  "ebrio",
  "echar",
  "eco",
  "ecuador",
  "edad",
  "edición",
  "edificio",
  "editor",
  "educar",
  "efecto",
  "eficaz",
  "eje",
  "ejemplo",
  "elefante",
  "elegir",
  "elemento",
  "elevar",
  "elipse",
  "élite",
  "elixir",
  "elogio",
  "eludir",
  "embudo",
  "emitir",
  "emoción",
  "empate",
  "empeño",
  "empleo",
  "empresa",
  "enano",
  "encargo",
  "enchufe",
  "encía",
  "enemigo",
  "enero",
  "enfado",
  "enfermo",
  "engaño",
  "enigma",
  "enlace",
  "enorme",
  "enredo",
  "ensayo",
  "enseñar",
  "entero",
  "entrar",
  "envase",
  "envío",
  "época",
  "equipo",
  "erizo",
  "escala",
  "escena",
  "escolar",
  "escribir",
  "escudo",
  "esencia",
  "esfera",
  "esfuerzo",
  "espada",
  "espejo",
  "espía",
  "esposa",
  "espuma",
  "esquí",
  "estar",
  "este",
  "estilo",
  "estufa",
  "etapa",
  "eterno",
  "ética",
  "etnia",
  "evadir",
  "evaluar",
  "evento",
  "evitar",
  "exacto",
  "examen",
  "exceso",
  "excusa",
  "exento",
  "exigir",
  "exilio",
  "existir",
  "éxito",
  "experto",
  "explicar",
  "exponer",
  "extremo",
  "fábrica",
  "fábula",
  "fachada",
  "fácil",
  "factor",
  "faena",
  "faja",
  "falda",
  "fallo",
  "falso",
  "faltar",
  "fama",
  "familia",
  "famoso",
  "faraón",
  "farmacia",
  "farol",
  "farsa",
  "fase",
  "fatiga",
  "fauna",
  "favor",
  "fax",
  "febrero",
  "fecha",
  "feliz",
  "feo",
  "feria",
  "feroz",
  "fértil",
  "fervor",
  "festín",
  "fiable",
  "fianza",
  "fiar",
  "fibra",
  "ficción",
  "ficha",
  "fideo",
  "fiebre",
  "fiel",
  "fiera",
  "fiesta",
  "figura",
  "fijar",
  "fijo",
  "fila",
  "filete",
  "filial",
  "filtro",
  "fin",
  "finca",
  "fingir",
  "finito",
  "firma",
  "flaco",
  "flauta",
  "flecha",
  "flor",
  "flota",
  "fluir",
  "flujo",
  "flúor",
  "fobia",
  "foca",
  "fogata",
  "fogón",
  "folio",
  "folleto",
  "fondo",
  "forma",
  "forro",
  "fortuna",
  "forzar",
  "fosa",
  "foto",
  "fracaso",
  "frágil",
  "franja",
  "frase",
  "fraude",
  "freír",
  "freno",
  "fresa",
  "frío",
  "frito",
  "fruta",
  "fuego",
  "fuente",
  "fuerza",
  "fuga",
  "fumar",
  "función",
  "funda",
  "furgón",
  "furia",
  "fusil",
  "fútbol",
  "futuro",
  "gacela",
  "gafas",
  "gaita",
  "gajo",
  "gala",
  "galería",
  "gallo",
  "gamba",
  "ganar",
  "gancho",
  "ganga",
  "ganso",
  "garaje",
  "garza",
  "gasolina",
  "gastar",
  "gato",
  "gavilán",
  "gemelo",
  "gemir",
  "gen",
  "género",
  "genio",
  "gente",
  "geranio",
  "gerente",
  "germen",
  "gesto",
  "gigante",
  "gimnasio",
  "girar",
  "giro",
  "glaciar",
  "globo",
  "gloria",
  "gol",
  "golfo",
  "goloso",
  "golpe",
  "goma",
  "gordo",
  "gorila",
  "gorra",
  "gota",
  "goteo",
  "gozar",
  "grada",
  "gráfico",
  "grano",
  "grasa",
  "gratis",
  "grave",
  "grieta",
  "grillo",
  "gripe",
  "gris",
  "grito",
  "grosor",
  "grúa",
  "grueso",
  "grumo",
  "grupo",
  "guante",
  "guapo",
  "guardia",
  "guerra",
  "guía",
  "guiño",
  "guion",
  "guiso",
  "guitarra",
  "gusano",
  "gustar",
  "haber",
  "hábil",
  "hablar",
  "hacer",
  "hacha",
  "hada",
  "hallar",
  "hamaca",
  "harina",
  "haz",
  "hazaña",
  "hebilla",
  "hebra",
  "hecho",
  "helado",
  "helio",
  "hembra",
  "herir",
  "hermano",
  "héroe",
  "hervir",
  "hielo",
  "hierro",
  "hígado",
  "higiene",
  "hijo",
  "himno",
  "historia",
  "hocico",
  "hogar",
  "hoguera",
  "hoja",
  "hombre",
  "hongo",
  "honor",
  "honra",
  "hora",
  "hormiga",
  "horno",
  "hostil",
  "hoyo",
  "hueco",
  "huelga",
  "huerta",
  "hueso",
  "huevo",
  "huida",
  "huir",
  "humano",
  "húmedo",
  "humilde",
  "humo",
  "hundir",
  "huracán",
  "hurto",
  "icono",
  "ideal",
  "idioma",
  "ídolo",
  "iglesia",
  "iglú",
  "igual",
  "ilegal",
  "ilusión",
  "imagen",
  "imán",
  "imitar",
  "impar",
  "imperio",
  "imponer",
  "impulso",
  "incapaz",
  "índice",
  "inerte",
  "infiel",
  "informe",
  "ingenio",
  "inicio",
  "inmenso",
  "inmune",
  "innato",
  "insecto",
  "instante",
  "interés",
  "íntimo",
  "intuir",
  "inútil",
  "invierno",
  "ira",
  "iris",
  "ironía",
  "isla",
  "islote",
  "jabalí",
  "jabón",
  "jamón",
  "jarabe",
  "jardín",
  "jarra",
  "jaula",
  "jazmín",
  "jefe",
  "jeringa",
  "jinete",
  "jornada",
  "joroba",
  "joven",
  "joya",
  "juerga",
  "jueves",
  "juez",
  "jugador",
  "jugo",
  "juguete",
  "juicio",
  "junco",
  "jungla",
  "junio",
  "juntar",
  "júpiter",
  "jurar",
  "justo",
  "juvenil",
  "juzgar",
  "kilo",
  "koala",
  "labio",
  "lacio",
  "lacra",
  "lado",
  "ladrón",
  "lagarto",
  "lágrima",
  "laguna",
  "laico",
  "lamer",
  "lámina",
  "lámpara",
  "lana",
  "lancha",
  "langosta",
  "lanza",
  "lápiz",
  "largo",
  "larva",
  "lástima",
  "lata",
  "látex",
  "latir",
  "laurel",
  "lavar",
  "lazo",
  "leal",
  "lección",
  "leche",
  "lector",
  "leer",
  "legión",
  "legumbre",
  "lejano",
  "lengua",
  "lento",
  "leña",
  "león",
  "leopardo",
  "lesión",
  "letal",
  "letra",
  "leve",
  "leyenda",
  "libertad",
  "libro",
  "licor",
  "líder",
  "lidiar",
  "lienzo",
  "liga",
  "ligero",
  "lima",
  "límite",
  "limón",
  "limpio",
  "lince",
  "lindo",
  "línea",
  "lingote",
  "lino",
  "linterna",
  "líquido",
  "liso",
  "lista",
  "litera",
  "litio",
  "litro",
  "llaga",
  "llama",
  "llanto",
  "llave",
  "llegar",
  "llenar",
  "llevar",
  "llorar",
  "llover",
  "lluvia",
  "lobo",
  "loción",
  "loco",
  "locura",
  "lógica",
  "logro",
  "lombriz",
  "lomo",
  "lonja",
  "lote",
  "lucha",
  "lucir",
  "lugar",
  "lujo",
  "luna",
  "lunes",
  "lupa",
  "lustro",
  "luto",
  "luz",
  "maceta",
  "macho",
  "madera",
  "madre",
  "maduro",
  "maestro",
  "mafia",
  "magia",
  "mago",
  "maíz",
  "maldad",
  "maleta",
  "malla",
  "malo",
  "mamá",
  "mambo",
  "mamut",
  "manco",
  "mando",
  "manejar",
  "manga",
  "maniquí",
  "manjar",
  "mano",
  "manso",
  "manta",
  "mañana",
  "mapa",
  "máquina",
  "mar",
  "marco",
  "marea",
  "marfil",
  "margen",
  "marido",
  "mármol",
  "marrón",
  "martes",
  "marzo",
  "masa",
  "máscara",
  "masivo",
  "matar",
  "materia",
  "matiz",
  "matriz",
  "máximo",
  "mayor",
  "mazorca",
  "mecha",
  "medalla",
  "medio",
  "médula",
  "mejilla",
  "mejor",
  "melena",
  "melón",
  "memoria",
  "menor",
  "mensaje",
  "mente",
  "menú",
  "mercado",
  "merengue",
  "mérito",
  "mes",
  "mesón",
  "meta",
  "meter",
  "método",
  "metro",
  "mezcla",
  "miedo",
  "miel",
  "miembro",
  "miga",
  "mil",
  "milagro",
  "militar",
  "millón",
  "mimo",
  "mina",
  "minero",
  "mínimo",
  "minuto",
  "miope",
  "mirar",
  "misa",
  "miseria",
  "misil",
  "mismo",
  "mitad",
  "mito",
  "mochila",
  "moción",
  "moda",
  "modelo",
  "moho",
  "mojar",
  "molde",
  "moler",
  "molino",
  "momento",
  "momia",
  "monarca",
  "moneda",
  "monja",
  "monto",
  "moño",
  "morada",
  "morder",
  "moreno",
  "morir",
  "morro",
  "morsa",
  "mortal",
  "mosca",
  "mostrar",
  "motivo",
  "mover",
  "móvil",
  "mozo",
  "mucho",
  "mudar",
  "mueble",
  "muela",
  "muerte",
  "muestra",
  "mugre",
  "mujer",
  "mula",
  "muleta",
  "multa",
  "mundo",
  "muñeca",
  "mural",
  "muro",
  "músculo",
  "museo",
  "musgo",
  "música",
  "muslo",
  "nácar",
  "nación",
  "nadar",
  "naipe",
  "naranja",
  "nariz",
  "narrar",
  "nasal",
  "natal",
  "nativo",
  "natural",
  "náusea",
  "naval",
  "nave",
  "navidad",
  "necio",
  "néctar",
  "negar",
  "negocio",
  "negro",
  "neón",
  "nervio",
  "neto",
  "neutro",
  "nevar",
  "nevera",
  "nicho",
  "nido",
  "niebla",
  "nieto",
  "niñez",
  "niño",
  "nítido",
  "nivel",
  "nobleza",
  "noche",
  "nómina",
  "noria",
  "norma",
  "norte",
  "nota",
  "noticia",
  "novato",
  "novela",
  "novio",
  "nube",
  "nuca",
  "núcleo",
  "nudillo",
  "nudo",
  "nuera",
  "nueve",
  "nuez",
  "nulo",
  "número",
  "nutria",
  "oasis",
  "obeso",
  "obispo",
  "objeto",
  "obra",
  "obrero",
  "observar",
  "obtener",
  "obvio",
  "oca",
  "ocaso",
  "océano",
  "ochenta",
  "ocho",
  "ocio",
  "ocre",
  "octavo",
  "octubre",
  "oculto",
  "ocupar",
  "ocurrir",
  "odiar",
  "odio",
  "odisea",
  "oeste",
  "ofensa",
  "oferta",
  "oficio",
  "ofrecer",
  "ogro",
  "oído",
  "oír",
  "ojo",
  "ola",
  "oleada",
  "olfato",
  "olivo",
  "olla",
  "olmo",
  "olor",
  "olvido",
  "ombligo",
  "onda",
  "onza",
  "opaco",
  "opción",
  "ópera",
  "opinar",
  "oponer",
  "optar",
  "óptica",
  "opuesto",
  "oración",
  "orador",
  "oral",
  "órbita",
  "orca",
  "orden",
  "oreja",
  "órgano",
  "orgía",
  "orgullo",
  "oriente",
  "origen",
  "orilla",
  "oro",
  "orquesta",
  "oruga",
  "osadía",
  "oscuro",
  "osezno",
  "oso",
  "ostra",
  "otoño",
  "otro",
  "oveja",
  "óvulo",
  "óxido",
  "oxígeno",
  "oyente",
  "ozono",
  "pacto",
  "padre",
  "paella",
  "página",
  "pago",
  "país",
  "pájaro",
  "palabra",
  "palco",
  "paleta",
  "pálido",
  "palma",
  "paloma",
  "palpar",
  "pan",
  "panal",
  "pánico",
  "pantera",
  "pañuelo",
  "papá",
  "papel",
  "papilla",
  "paquete",
  "parar",
  "parcela",
  "pared",
  "parir",
  "paro",
  "párpado",
  "parque",
  "párrafo",
  "parte",
  "pasar",
  "paseo",
  "pasión",
  "paso",
  "pasta",
  "pata",
  "patio",
  "patria",
  "pausa",
  "pauta",
  "pavo",
  "payaso",
  "peatón",
  "pecado",
  "pecera",
  "pecho",
  "pedal",
  "pedir",
  "pegar",
  "peine",
  "pelar",
  "peldaño",
  "pelea",
  "peligro",
  "pellejo",
  "pelo",
  "peluca",
  "pena",
  "pensar",
  "peñón",
  "peón",
  "peor",
  "pepino",
  "pequeño",
  "pera",
  "percha",
  "perder",
  "pereza",
  "perfil",
  "perico",
  "perla",
  "permiso",
  "perro",
  "persona",
  "pesa",
  "pesca",
  "pésimo",
  "pestaña",
  "pétalo",
  "petróleo",
  "pez",
  "pezuña",
  "picar",
  "pichón",
  "pie",
  "piedra",
  "pierna",
  "pieza",
  "pijama",
  "pilar",
  "piloto",
  "pimienta",
  "pino",
  "pintor",
  "pinza",
  "piña",
  "piojo",
  "pipa",
  "pirata",
  "pisar",
  "piscina",
  "piso",
  "pista",
  "pitón",
  "pizca",
  "placa",
  "plan",
  "plata",
  "playa",
  "plaza",
  "pleito",
  "pleno",
  "plomo",
  "pluma",
  "plural",
  "pobre",
  "poco",
  "poder",
  "podio",
  "poema",
  "poesía",
  "poeta",
  "polen",
  "policía",
  "pollo",
  "polvo",
  "pomada",
  "pomelo",
  "pomo",
  "pompa",
  "poner",
  "porción",
  "portal",
  "posada",
  "poseer",
  "posible",
  "poste",
  "potencia",
  "potro",
  "pozo",
  "prado",
  "precoz",
  "pregunta",
  "premio",
  "prensa",
  "preso",
  "previo",
  "primo",
  "príncipe",
  "prisión",
  "privar",
  "proa",
  "probar",
  "proceso",
  "producto",
  "proeza",
  "profesor",
  "programa",
  "prole",
  "promesa",
  "pronto",
  "propio",
  "próximo",
  "prueba",
  "público",
  "puchero",
  "pudor",
  "pueblo",
  "puerta",
  "puesto",
  "pulga",
  "pulir",
  "pulmón",
  "pulpo",
  "pulso",
  "puma",
  "punto",
  "puñal",
  "puño",
  "pupa",
  "pupila",
  "puré",
  "quedar",
  "queja",
  "quemar",
  "querer",
  "queso",
  "quieto",
  "química",
  "quince",
  "quitar",
  "rábano",
  "rabia",
  "rabo",
  "ración",
  "radical",
  "raíz",
  "rama",
  "rampa",
  "rancho",
  "rango",
  "rapaz",
  "rápido",
  "rapto",
  "rasgo",
  "raspa",
  "rato",
  "rayo",
  "raza",
  "razón",
  "reacción",
  "realidad",
  "rebaño",
  "rebote",
  "recaer",
  "receta",
  "rechazo",
  "recoger",
  "recreo",
  "recto",
  "recurso",
  "red",
  "redondo",
  "reducir",
  "reflejo",
  "reforma",
  "refrán",
  "refugio",
  "regalo",
  "regir",
  "regla",
  "regreso",
  "rehén",
  "reino",
  "reír",
  "reja",
  "relato",
  "relevo",
  "relieve",
  "relleno",
  "reloj",
  "remar",
  "remedio",
  "remo",
  "rencor",
  "rendir",
  "renta",
  "reparto",
  "repetir",
  "reposo",
  "reptil",
  "res",
  "rescate",
  "resina",
  "respeto",
  "resto",
  "resumen",
  "retiro",
  "retorno",
  "retrato",
  "reunir",
  "revés",
  "revista",
  "rey",
  "rezar",
  "rico",
  "riego",
  "rienda",
  "riesgo",
  "rifa",
  "rígido",
  "rigor",
  "rincón",
  "riñón",
  "río",
  "riqueza",
  "risa",
  "ritmo",
  "rito",
  "rizo",
  "roble",
  "roce",
  "rociar",
  "rodar",
  "rodeo",
  "rodilla",
  "roer",
  "rojizo",
  "rojo",
  "romero",
  "romper",
  "ron",
  "ronco",
  "ronda",
  "ropa",
  "ropero",
  "rosa",
  "rosca",
  "rostro",
  "rotar",
  "rubí",
  "rubor",
  "rudo",
  "rueda",
  "rugir",
  "ruido",
  "ruina",
  "ruleta",
  "rulo",
  "rumbo",
  "rumor",
  "ruptura",
  "ruta",
  "rutina",
  "sábado",
  "saber",
  "sabio",
  "sable",
  "sacar",
  "sagaz",
  "sagrado",
  "sala",
  "saldo",
  "salero",
  "salir",
  "salmón",
  "salón",
  "salsa",
  "salto",
  "salud",
  "salvar",
  "samba",
  "sanción",
  "sandía",
  "sanear",
  "sangre",
  "sanidad",
  "sano",
  "santo",
  "sapo",
  "saque",
  "sardina",
  "sartén",
  "sastre",
  "satán",
  "sauna",
  "saxofón",
  "sección",
  "seco",
  "secreto",
  "secta",
  "sed",
  "seguir",
  "seis",
  "sello",
  "selva",
  "semana",
  "semilla",
  "senda",
  "sensor",
  "señal",
  "señor",
  "separar",
  "sepia",
  "sequía",
  "ser",
  "serie",
  "sermón",
  "servir",
  "sesenta",
  "sesión",
  "seta",
  "setenta",
  "severo",
  "sexo",
  "sexto",
  "sidra",
  "siesta",
  "siete",
  "siglo",
  "signo",
  "sílaba",
  "silbar",
  "silencio",
  "silla",
  "símbolo",
  "simio",
  "sirena",
  "sistema",
  "sitio",
  "situar",
  "sobre",
  "socio",
  "sodio",
  "sol",
  "solapa",
  "soldado",
  "soledad",
  "sólido",
  "soltar",
  "solución",
  "sombra",
  "sondeo",
  "sonido",
  "sonoro",
  "sonrisa",
  "sopa",
  "soplar",
  "soporte",
  "sordo",
  "sorpresa",
  "sorteo",
  "sostén",
  "sótano",
  "suave",
  "subir",
  "suceso",
  "sudor",
  "suegra",
  "suelo",
  "sueño",
  "suerte",
  "sufrir",
  "sujeto",
  "sultán",
  "sumar",
  "superar",
  "suplir",
  "suponer",
  "supremo",
  "sur",
  "surco",
  "sureño",
  "surgir",
  "susto",
  "sutil",
  "tabaco",
  "tabique",
  "tabla",
  "tabú",
  "taco",
  "tacto",
  "tajo",
  "talar",
  "talco",
  "talento",
  "talla",
  "talón",
  "tamaño",
  "tambor",
  "tango",
  "tanque",
  "tapa",
  "tapete",
  "tapia",
  "tapón",
  "taquilla",
  "tarde",
  "tarea",
  "tarifa",
  "tarjeta",
  "tarot",
  "tarro",
  "tarta",
  "tatuaje",
  "tauro",
  "taza",
  "tazón",
  "teatro",
  "techo",
  "tecla",
  "técnica",
  "tejado",
  "tejer",
  "tejido",
  "tela",
  "teléfono",
  "tema",
  "temor",
  "templo",
  "tenaz",
  "tender",
  "tener",
  "tenis",
  "tenso",
  "teoría",
  "terapia",
  "terco",
  "término",
  "ternura",
  "terror",
  "tesis",
  "tesoro",
  "testigo",
  "tetera",
  "texto",
  "tez",
  "tibio",
  "tiburón",
  "tiempo",
  "tienda",
  "tierra",
  "tieso",
  "tigre",
  "tijera",
  "tilde",
  "timbre",
  "tímido",
  "timo",
  "tinta",
  "tío",
  "típico",
  "tipo",
  "tira",
  "tirón",
  "titán",
  "títere",
  "título",
  "tiza",
  "toalla",
  "tobillo",
  "tocar",
  "tocino",
  "todo",
  "toga",
  "toldo",
  "tomar",
  "tono",
  "tonto",
  "topar",
  "tope",
  "toque",
  "tórax",
  "torero",
  "tormenta",
  "torneo",
  "toro",
  "torpedo",
  "torre",
  "torso",
  "tortuga",
  "tos",
  "tosco",
  "toser",
  "tóxico",
  "trabajo",
  "tractor",
  "traer",
  "tráfico",
  "trago",
  "traje",
  "tramo",
  "trance",
  "trato",
  "trauma",
  "trazar",
  "trébol",
  "tregua",
  "treinta",
  "tren",
  "trepar",
  "tres",
  "tribu",
  "trigo",
  "tripa",
  "triste",
  "triunfo",
  "trofeo",
  "trompa",
  "tronco",
  "tropa",
  "trote",
  "trozo",
  "truco",
  "trueno",
  "trufa",
  "tubería",
  "tubo",
  "tuerto",
  "tumba",
  "tumor",
  "túnel",
  "túnica",
  "turbina",
  "turismo",
  "turno",
  "tutor",
  "ubicar",
  "úlcera",
  "umbral",
  "unidad",
  "unir",
  "universo",
  "uno",
  "untar",
  "uña",
  "urbano",
  "urbe",
  "urgente",
  "urna",
  "usar",
  "usuario",
  "útil",
  "utopía",
  "uva",
  "vaca",
  "vacío",
  "vacuna",
  "vagar",
  "vago",
  "vaina",
  "vajilla",
  "vale",
  "válido",
  "valle",
  "valor",
  "válvula",
  "vampiro",
  "vara",
  "variar",
  "varón",
  "vaso",
  "vecino",
  "vector",
  "vehículo",
  "veinte",
  "vejez",
  "vela",
  "velero",
  "veloz",
  "vena",
  "vencer",
  "venda",
  "veneno",
  "vengar",
  "venir",
  "venta",
  "venus",
  "ver",
  "verano",
  "verbo",
  "verde",
  "vereda",
  "verja",
  "verso",
  "verter",
  "vía",
  "viaje",
  "vibrar",
  "vicio",
  "víctima",
  "vida",
  "vídeo",
  "vidrio",
  "viejo",
  "viernes",
  "vigor",
  "vil",
  "villa",
  "vinagre",
  "vino",
  "viñedo",
  "violín",
  "viral",
  "virgo",
  "virtud",
  "visor",
  "víspera",
  "vista",
  "vitamina",
  "viudo",
  "vivaz",
  "vivero",
  "vivir",
  "vivo",
  "volcán",
  "volumen",
  "volver",
  "voraz",
  "votar",
  "voto",
  "voz",
  "vuelo",
  "vulgar",
  "yacer",
  "yate",
  "yegua",
  "yema",
  "yerno",
  "yeso",
  "yodo",
  "yoga",
  "yogur",
  "zafiro",
  "zanja",
  "zapato",
  "zarza",
  "zona",
  "zorro",
  "zumo",
  "zurdo"
];
const require$$7 = [
  "あいこくしん",
  "あいさつ",
  "あいだ",
  "あおぞら",
  "あかちゃん",
  "あきる",
  "あけがた",
  "あける",
  "あこがれる",
  "あさい",
  "あさひ",
  "あしあと",
  "あじわう",
  "あずかる",
  "あずき",
  "あそぶ",
  "あたえる",
  "あたためる",
  "あたりまえ",
  "あたる",
  "あつい",
  "あつかう",
  "あっしゅく",
  "あつまり",
  "あつめる",
  "あてな",
  "あてはまる",
  "あひる",
  "あぶら",
  "あぶる",
  "あふれる",
  "あまい",
  "あまど",
  "あまやかす",
  "あまり",
  "あみもの",
  "あめりか",
  "あやまる",
  "あゆむ",
  "あらいぐま",
  "あらし",
  "あらすじ",
  "あらためる",
  "あらゆる",
  "あらわす",
  "ありがとう",
  "あわせる",
  "あわてる",
  "あんい",
  "あんがい",
  "あんこ",
  "あんぜん",
  "あんてい",
  "あんない",
  "あんまり",
  "いいだす",
  "いおん",
  "いがい",
  "いがく",
  "いきおい",
  "いきなり",
  "いきもの",
  "いきる",
  "いくじ",
  "いくぶん",
  "いけばな",
  "いけん",
  "いこう",
  "いこく",
  "いこつ",
  "いさましい",
  "いさん",
  "いしき",
  "いじゅう",
  "いじょう",
  "いじわる",
  "いずみ",
  "いずれ",
  "いせい",
  "いせえび",
  "いせかい",
  "いせき",
  "いぜん",
  "いそうろう",
  "いそがしい",
  "いだい",
  "いだく",
  "いたずら",
  "いたみ",
  "いたりあ",
  "いちおう",
  "いちじ",
  "いちど",
  "いちば",
  "いちぶ",
  "いちりゅう",
  "いつか",
  "いっしゅん",
  "いっせい",
  "いっそう",
  "いったん",
  "いっち",
  "いってい",
  "いっぽう",
  "いてざ",
  "いてん",
  "いどう",
  "いとこ",
  "いない",
  "いなか",
  "いねむり",
  "いのち",
  "いのる",
  "いはつ",
  "いばる",
  "いはん",
  "いびき",
  "いひん",
  "いふく",
  "いへん",
  "いほう",
  "いみん",
  "いもうと",
  "いもたれ",
  "いもり",
  "いやがる",
  "いやす",
  "いよかん",
  "いよく",
  "いらい",
  "いらすと",
  "いりぐち",
  "いりょう",
  "いれい",
  "いれもの",
  "いれる",
  "いろえんぴつ",
  "いわい",
  "いわう",
  "いわかん",
  "いわば",
  "いわゆる",
  "いんげんまめ",
  "いんさつ",
  "いんしょう",
  "いんよう",
  "うえき",
  "うえる",
  "うおざ",
  "うがい",
  "うかぶ",
  "うかべる",
  "うきわ",
  "うくらいな",
  "うくれれ",
  "うけたまわる",
  "うけつけ",
  "うけとる",
  "うけもつ",
  "うける",
  "うごかす",
  "うごく",
  "うこん",
  "うさぎ",
  "うしなう",
  "うしろがみ",
  "うすい",
  "うすぎ",
  "うすぐらい",
  "うすめる",
  "うせつ",
  "うちあわせ",
  "うちがわ",
  "うちき",
  "うちゅう",
  "うっかり",
  "うつくしい",
  "うったえる",
  "うつる",
  "うどん",
  "うなぎ",
  "うなじ",
  "うなずく",
  "うなる",
  "うねる",
  "うのう",
  "うぶげ",
  "うぶごえ",
  "うまれる",
  "うめる",
  "うもう",
  "うやまう",
  "うよく",
  "うらがえす",
  "うらぐち",
  "うらない",
  "うりあげ",
  "うりきれ",
  "うるさい",
  "うれしい",
  "うれゆき",
  "うれる",
  "うろこ",
  "うわき",
  "うわさ",
  "うんこう",
  "うんちん",
  "うんてん",
  "うんどう",
  "えいえん",
  "えいが",
  "えいきょう",
  "えいご",
  "えいせい",
  "えいぶん",
  "えいよう",
  "えいわ",
  "えおり",
  "えがお",
  "えがく",
  "えきたい",
  "えくせる",
  "えしゃく",
  "えすて",
  "えつらん",
  "えのぐ",
  "えほうまき",
  "えほん",
  "えまき",
  "えもじ",
  "えもの",
  "えらい",
  "えらぶ",
  "えりあ",
  "えんえん",
  "えんかい",
  "えんぎ",
  "えんげき",
  "えんしゅう",
  "えんぜつ",
  "えんそく",
  "えんちょう",
  "えんとつ",
  "おいかける",
  "おいこす",
  "おいしい",
  "おいつく",
  "おうえん",
  "おうさま",
  "おうじ",
  "おうせつ",
  "おうたい",
  "おうふく",
  "おうべい",
  "おうよう",
  "おえる",
  "おおい",
  "おおう",
  "おおどおり",
  "おおや",
  "おおよそ",
  "おかえり",
  "おかず",
  "おがむ",
  "おかわり",
  "おぎなう",
  "おきる",
  "おくさま",
  "おくじょう",
  "おくりがな",
  "おくる",
  "おくれる",
  "おこす",
  "おこなう",
  "おこる",
  "おさえる",
  "おさない",
  "おさめる",
  "おしいれ",
  "おしえる",
  "おじぎ",
  "おじさん",
  "おしゃれ",
  "おそらく",
  "おそわる",
  "おたがい",
  "おたく",
  "おだやか",
  "おちつく",
  "おっと",
  "おつり",
  "おでかけ",
  "おとしもの",
  "おとなしい",
  "おどり",
  "おどろかす",
  "おばさん",
  "おまいり",
  "おめでとう",
  "おもいで",
  "おもう",
  "おもたい",
  "おもちゃ",
  "おやつ",
  "おやゆび",
  "およぼす",
  "おらんだ",
  "おろす",
  "おんがく",
  "おんけい",
  "おんしゃ",
  "おんせん",
  "おんだん",
  "おんちゅう",
  "おんどけい",
  "かあつ",
  "かいが",
  "がいき",
  "がいけん",
  "がいこう",
  "かいさつ",
  "かいしゃ",
  "かいすいよく",
  "かいぜん",
  "かいぞうど",
  "かいつう",
  "かいてん",
  "かいとう",
  "かいふく",
  "がいへき",
  "かいほう",
  "かいよう",
  "がいらい",
  "かいわ",
  "かえる",
  "かおり",
  "かかえる",
  "かがく",
  "かがし",
  "かがみ",
  "かくご",
  "かくとく",
  "かざる",
  "がぞう",
  "かたい",
  "かたち",
  "がちょう",
  "がっきゅう",
  "がっこう",
  "がっさん",
  "がっしょう",
  "かなざわし",
  "かのう",
  "がはく",
  "かぶか",
  "かほう",
  "かほご",
  "かまう",
  "かまぼこ",
  "かめれおん",
  "かゆい",
  "かようび",
  "からい",
  "かるい",
  "かろう",
  "かわく",
  "かわら",
  "がんか",
  "かんけい",
  "かんこう",
  "かんしゃ",
  "かんそう",
  "かんたん",
  "かんち",
  "がんばる",
  "きあい",
  "きあつ",
  "きいろ",
  "ぎいん",
  "きうい",
  "きうん",
  "きえる",
  "きおう",
  "きおく",
  "きおち",
  "きおん",
  "きかい",
  "きかく",
  "きかんしゃ",
  "ききて",
  "きくばり",
  "きくらげ",
  "きけんせい",
  "きこう",
  "きこえる",
  "きこく",
  "きさい",
  "きさく",
  "きさま",
  "きさらぎ",
  "ぎじかがく",
  "ぎしき",
  "ぎじたいけん",
  "ぎじにってい",
  "ぎじゅつしゃ",
  "きすう",
  "きせい",
  "きせき",
  "きせつ",
  "きそう",
  "きぞく",
  "きぞん",
  "きたえる",
  "きちょう",
  "きつえん",
  "ぎっちり",
  "きつつき",
  "きつね",
  "きてい",
  "きどう",
  "きどく",
  "きない",
  "きなが",
  "きなこ",
  "きぬごし",
  "きねん",
  "きのう",
  "きのした",
  "きはく",
  "きびしい",
  "きひん",
  "きふく",
  "きぶん",
  "きぼう",
  "きほん",
  "きまる",
  "きみつ",
  "きむずかしい",
  "きめる",
  "きもだめし",
  "きもち",
  "きもの",
  "きゃく",
  "きやく",
  "ぎゅうにく",
  "きよう",
  "きょうりゅう",
  "きらい",
  "きらく",
  "きりん",
  "きれい",
  "きれつ",
  "きろく",
  "ぎろん",
  "きわめる",
  "ぎんいろ",
  "きんかくじ",
  "きんじょ",
  "きんようび",
  "ぐあい",
  "くいず",
  "くうかん",
  "くうき",
  "くうぐん",
  "くうこう",
  "ぐうせい",
  "くうそう",
  "ぐうたら",
  "くうふく",
  "くうぼ",
  "くかん",
  "くきょう",
  "くげん",
  "ぐこう",
  "くさい",
  "くさき",
  "くさばな",
  "くさる",
  "くしゃみ",
  "くしょう",
  "くすのき",
  "くすりゆび",
  "くせげ",
  "くせん",
  "ぐたいてき",
  "くださる",
  "くたびれる",
  "くちこみ",
  "くちさき",
  "くつした",
  "ぐっすり",
  "くつろぐ",
  "くとうてん",
  "くどく",
  "くなん",
  "くねくね",
  "くのう",
  "くふう",
  "くみあわせ",
  "くみたてる",
  "くめる",
  "くやくしょ",
  "くらす",
  "くらべる",
  "くるま",
  "くれる",
  "くろう",
  "くわしい",
  "ぐんかん",
  "ぐんしょく",
  "ぐんたい",
  "ぐんて",
  "けあな",
  "けいかく",
  "けいけん",
  "けいこ",
  "けいさつ",
  "げいじゅつ",
  "けいたい",
  "げいのうじん",
  "けいれき",
  "けいろ",
  "けおとす",
  "けおりもの",
  "げきか",
  "げきげん",
  "げきだん",
  "げきちん",
  "げきとつ",
  "げきは",
  "げきやく",
  "げこう",
  "げこくじょう",
  "げざい",
  "けさき",
  "げざん",
  "けしき",
  "けしごむ",
  "けしょう",
  "げすと",
  "けたば",
  "けちゃっぷ",
  "けちらす",
  "けつあつ",
  "けつい",
  "けつえき",
  "けっこん",
  "けつじょ",
  "けっせき",
  "けってい",
  "けつまつ",
  "げつようび",
  "げつれい",
  "けつろん",
  "げどく",
  "けとばす",
  "けとる",
  "けなげ",
  "けなす",
  "けなみ",
  "けぬき",
  "げねつ",
  "けねん",
  "けはい",
  "げひん",
  "けぶかい",
  "げぼく",
  "けまり",
  "けみかる",
  "けむし",
  "けむり",
  "けもの",
  "けらい",
  "けろけろ",
  "けわしい",
  "けんい",
  "けんえつ",
  "けんお",
  "けんか",
  "げんき",
  "けんげん",
  "けんこう",
  "けんさく",
  "けんしゅう",
  "けんすう",
  "げんそう",
  "けんちく",
  "けんてい",
  "けんとう",
  "けんない",
  "けんにん",
  "げんぶつ",
  "けんま",
  "けんみん",
  "けんめい",
  "けんらん",
  "けんり",
  "こあくま",
  "こいぬ",
  "こいびと",
  "ごうい",
  "こうえん",
  "こうおん",
  "こうかん",
  "ごうきゅう",
  "ごうけい",
  "こうこう",
  "こうさい",
  "こうじ",
  "こうすい",
  "ごうせい",
  "こうそく",
  "こうたい",
  "こうちゃ",
  "こうつう",
  "こうてい",
  "こうどう",
  "こうない",
  "こうはい",
  "ごうほう",
  "ごうまん",
  "こうもく",
  "こうりつ",
  "こえる",
  "こおり",
  "ごかい",
  "ごがつ",
  "ごかん",
  "こくご",
  "こくさい",
  "こくとう",
  "こくない",
  "こくはく",
  "こぐま",
  "こけい",
  "こける",
  "ここのか",
  "こころ",
  "こさめ",
  "こしつ",
  "こすう",
  "こせい",
  "こせき",
  "こぜん",
  "こそだて",
  "こたい",
  "こたえる",
  "こたつ",
  "こちょう",
  "こっか",
  "こつこつ",
  "こつばん",
  "こつぶ",
  "こてい",
  "こてん",
  "ことがら",
  "ことし",
  "ことば",
  "ことり",
  "こなごな",
  "こねこね",
  "このまま",
  "このみ",
  "このよ",
  "ごはん",
  "こひつじ",
  "こふう",
  "こふん",
  "こぼれる",
  "ごまあぶら",
  "こまかい",
  "ごますり",
  "こまつな",
  "こまる",
  "こむぎこ",
  "こもじ",
  "こもち",
  "こもの",
  "こもん",
  "こやく",
  "こやま",
  "こゆう",
  "こゆび",
  "こよい",
  "こよう",
  "こりる",
  "これくしょん",
  "ころっけ",
  "こわもて",
  "こわれる",
  "こんいん",
  "こんかい",
  "こんき",
  "こんしゅう",
  "こんすい",
  "こんだて",
  "こんとん",
  "こんなん",
  "こんびに",
  "こんぽん",
  "こんまけ",
  "こんや",
  "こんれい",
  "こんわく",
  "ざいえき",
  "さいかい",
  "さいきん",
  "ざいげん",
  "ざいこ",
  "さいしょ",
  "さいせい",
  "ざいたく",
  "ざいちゅう",
  "さいてき",
  "ざいりょう",
  "さうな",
  "さかいし",
  "さがす",
  "さかな",
  "さかみち",
  "さがる",
  "さぎょう",
  "さくし",
  "さくひん",
  "さくら",
  "さこく",
  "さこつ",
  "さずかる",
  "ざせき",
  "さたん",
  "さつえい",
  "ざつおん",
  "ざっか",
  "ざつがく",
  "さっきょく",
  "ざっし",
  "さつじん",
  "ざっそう",
  "さつたば",
  "さつまいも",
  "さてい",
  "さといも",
  "さとう",
  "さとおや",
  "さとし",
  "さとる",
  "さのう",
  "さばく",
  "さびしい",
  "さべつ",
  "さほう",
  "さほど",
  "さます",
  "さみしい",
  "さみだれ",
  "さむけ",
  "さめる",
  "さやえんどう",
  "さゆう",
  "さよう",
  "さよく",
  "さらだ",
  "ざるそば",
  "さわやか",
  "さわる",
  "さんいん",
  "さんか",
  "さんきゃく",
  "さんこう",
  "さんさい",
  "ざんしょ",
  "さんすう",
  "さんせい",
  "さんそ",
  "さんち",
  "さんま",
  "さんみ",
  "さんらん",
  "しあい",
  "しあげ",
  "しあさって",
  "しあわせ",
  "しいく",
  "しいん",
  "しうち",
  "しえい",
  "しおけ",
  "しかい",
  "しかく",
  "じかん",
  "しごと",
  "しすう",
  "じだい",
  "したうけ",
  "したぎ",
  "したて",
  "したみ",
  "しちょう",
  "しちりん",
  "しっかり",
  "しつじ",
  "しつもん",
  "してい",
  "してき",
  "してつ",
  "じてん",
  "じどう",
  "しなぎれ",
  "しなもの",
  "しなん",
  "しねま",
  "しねん",
  "しのぐ",
  "しのぶ",
  "しはい",
  "しばかり",
  "しはつ",
  "しはらい",
  "しはん",
  "しひょう",
  "しふく",
  "じぶん",
  "しへい",
  "しほう",
  "しほん",
  "しまう",
  "しまる",
  "しみん",
  "しむける",
  "じむしょ",
  "しめい",
  "しめる",
  "しもん",
  "しゃいん",
  "しゃうん",
  "しゃおん",
  "じゃがいも",
  "しやくしょ",
  "しゃくほう",
  "しゃけん",
  "しゃこ",
  "しゃざい",
  "しゃしん",
  "しゃせん",
  "しゃそう",
  "しゃたい",
  "しゃちょう",
  "しゃっきん",
  "じゃま",
  "しゃりん",
  "しゃれい",
  "じゆう",
  "じゅうしょ",
  "しゅくはく",
  "じゅしん",
  "しゅっせき",
  "しゅみ",
  "しゅらば",
  "じゅんばん",
  "しょうかい",
  "しょくたく",
  "しょっけん",
  "しょどう",
  "しょもつ",
  "しらせる",
  "しらべる",
  "しんか",
  "しんこう",
  "じんじゃ",
  "しんせいじ",
  "しんちく",
  "しんりん",
  "すあげ",
  "すあし",
  "すあな",
  "ずあん",
  "すいえい",
  "すいか",
  "すいとう",
  "ずいぶん",
  "すいようび",
  "すうがく",
  "すうじつ",
  "すうせん",
  "すおどり",
  "すきま",
  "すくう",
  "すくない",
  "すける",
  "すごい",
  "すこし",
  "ずさん",
  "すずしい",
  "すすむ",
  "すすめる",
  "すっかり",
  "ずっしり",
  "ずっと",
  "すてき",
  "すてる",
  "すねる",
  "すのこ",
  "すはだ",
  "すばらしい",
  "ずひょう",
  "ずぶぬれ",
  "すぶり",
  "すふれ",
  "すべて",
  "すべる",
  "ずほう",
  "すぼん",
  "すまい",
  "すめし",
  "すもう",
  "すやき",
  "すらすら",
  "するめ",
  "すれちがう",
  "すろっと",
  "すわる",
  "すんぜん",
  "すんぽう",
  "せあぶら",
  "せいかつ",
  "せいげん",
  "せいじ",
  "せいよう",
  "せおう",
  "せかいかん",
  "せきにん",
  "せきむ",
  "せきゆ",
  "せきらんうん",
  "せけん",
  "せこう",
  "せすじ",
  "せたい",
  "せたけ",
  "せっかく",
  "せっきゃく",
  "ぜっく",
  "せっけん",
  "せっこつ",
  "せっさたくま",
  "せつぞく",
  "せつだん",
  "せつでん",
  "せっぱん",
  "せつび",
  "せつぶん",
  "せつめい",
  "せつりつ",
  "せなか",
  "せのび",
  "せはば",
  "せびろ",
  "せぼね",
  "せまい",
  "せまる",
  "せめる",
  "せもたれ",
  "せりふ",
  "ぜんあく",
  "せんい",
  "せんえい",
  "せんか",
  "せんきょ",
  "せんく",
  "せんげん",
  "ぜんご",
  "せんさい",
  "せんしゅ",
  "せんすい",
  "せんせい",
  "せんぞ",
  "せんたく",
  "せんちょう",
  "せんてい",
  "せんとう",
  "せんぬき",
  "せんねん",
  "せんぱい",
  "ぜんぶ",
  "ぜんぽう",
  "せんむ",
  "せんめんじょ",
  "せんもん",
  "せんやく",
  "せんゆう",
  "せんよう",
  "ぜんら",
  "ぜんりゃく",
  "せんれい",
  "せんろ",
  "そあく",
  "そいとげる",
  "そいね",
  "そうがんきょう",
  "そうき",
  "そうご",
  "そうしん",
  "そうだん",
  "そうなん",
  "そうび",
  "そうめん",
  "そうり",
  "そえもの",
  "そえん",
  "そがい",
  "そげき",
  "そこう",
  "そこそこ",
  "そざい",
  "そしな",
  "そせい",
  "そせん",
  "そそぐ",
  "そだてる",
  "そつう",
  "そつえん",
  "そっかん",
  "そつぎょう",
  "そっけつ",
  "そっこう",
  "そっせん",
  "そっと",
  "そとがわ",
  "そとづら",
  "そなえる",
  "そなた",
  "そふぼ",
  "そぼく",
  "そぼろ",
  "そまつ",
  "そまる",
  "そむく",
  "そむりえ",
  "そめる",
  "そもそも",
  "そよかぜ",
  "そらまめ",
  "そろう",
  "そんかい",
  "そんけい",
  "そんざい",
  "そんしつ",
  "そんぞく",
  "そんちょう",
  "ぞんび",
  "ぞんぶん",
  "そんみん",
  "たあい",
  "たいいん",
  "たいうん",
  "たいえき",
  "たいおう",
  "だいがく",
  "たいき",
  "たいぐう",
  "たいけん",
  "たいこ",
  "たいざい",
  "だいじょうぶ",
  "だいすき",
  "たいせつ",
  "たいそう",
  "だいたい",
  "たいちょう",
  "たいてい",
  "だいどころ",
  "たいない",
  "たいねつ",
  "たいのう",
  "たいはん",
  "だいひょう",
  "たいふう",
  "たいへん",
  "たいほ",
  "たいまつばな",
  "たいみんぐ",
  "たいむ",
  "たいめん",
  "たいやき",
  "たいよう",
  "たいら",
  "たいりょく",
  "たいる",
  "たいわん",
  "たうえ",
  "たえる",
  "たおす",
  "たおる",
  "たおれる",
  "たかい",
  "たかね",
  "たきび",
  "たくさん",
  "たこく",
  "たこやき",
  "たさい",
  "たしざん",
  "だじゃれ",
  "たすける",
  "たずさわる",
  "たそがれ",
  "たたかう",
  "たたく",
  "ただしい",
  "たたみ",
  "たちばな",
  "だっかい",
  "だっきゃく",
  "だっこ",
  "だっしゅつ",
  "だったい",
  "たてる",
  "たとえる",
  "たなばた",
  "たにん",
  "たぬき",
  "たのしみ",
  "たはつ",
  "たぶん",
  "たべる",
  "たぼう",
  "たまご",
  "たまる",
  "だむる",
  "ためいき",
  "ためす",
  "ためる",
  "たもつ",
  "たやすい",
  "たよる",
  "たらす",
  "たりきほんがん",
  "たりょう",
  "たりる",
  "たると",
  "たれる",
  "たれんと",
  "たろっと",
  "たわむれる",
  "だんあつ",
  "たんい",
  "たんおん",
  "たんか",
  "たんき",
  "たんけん",
  "たんご",
  "たんさん",
  "たんじょうび",
  "だんせい",
  "たんそく",
  "たんたい",
  "だんち",
  "たんてい",
  "たんとう",
  "だんな",
  "たんにん",
  "だんねつ",
  "たんのう",
  "たんぴん",
  "だんぼう",
  "たんまつ",
  "たんめい",
  "だんれつ",
  "だんろ",
  "だんわ",
  "ちあい",
  "ちあん",
  "ちいき",
  "ちいさい",
  "ちえん",
  "ちかい",
  "ちから",
  "ちきゅう",
  "ちきん",
  "ちけいず",
  "ちけん",
  "ちこく",
  "ちさい",
  "ちしき",
  "ちしりょう",
  "ちせい",
  "ちそう",
  "ちたい",
  "ちたん",
  "ちちおや",
  "ちつじょ",
  "ちてき",
  "ちてん",
  "ちぬき",
  "ちぬり",
  "ちのう",
  "ちひょう",
  "ちへいせん",
  "ちほう",
  "ちまた",
  "ちみつ",
  "ちみどろ",
  "ちめいど",
  "ちゃんこなべ",
  "ちゅうい",
  "ちゆりょく",
  "ちょうし",
  "ちょさくけん",
  "ちらし",
  "ちらみ",
  "ちりがみ",
  "ちりょう",
  "ちるど",
  "ちわわ",
  "ちんたい",
  "ちんもく",
  "ついか",
  "ついたち",
  "つうか",
  "つうじょう",
  "つうはん",
  "つうわ",
  "つかう",
  "つかれる",
  "つくね",
  "つくる",
  "つけね",
  "つける",
  "つごう",
  "つたえる",
  "つづく",
  "つつじ",
  "つつむ",
  "つとめる",
  "つながる",
  "つなみ",
  "つねづね",
  "つのる",
  "つぶす",
  "つまらない",
  "つまる",
  "つみき",
  "つめたい",
  "つもり",
  "つもる",
  "つよい",
  "つるぼ",
  "つるみく",
  "つわもの",
  "つわり",
  "てあし",
  "てあて",
  "てあみ",
  "ていおん",
  "ていか",
  "ていき",
  "ていけい",
  "ていこく",
  "ていさつ",
  "ていし",
  "ていせい",
  "ていたい",
  "ていど",
  "ていねい",
  "ていひょう",
  "ていへん",
  "ていぼう",
  "てうち",
  "ておくれ",
  "てきとう",
  "てくび",
  "でこぼこ",
  "てさぎょう",
  "てさげ",
  "てすり",
  "てそう",
  "てちがい",
  "てちょう",
  "てつがく",
  "てつづき",
  "でっぱ",
  "てつぼう",
  "てつや",
  "でぬかえ",
  "てぬき",
  "てぬぐい",
  "てのひら",
  "てはい",
  "てぶくろ",
  "てふだ",
  "てほどき",
  "てほん",
  "てまえ",
  "てまきずし",
  "てみじか",
  "てみやげ",
  "てらす",
  "てれび",
  "てわけ",
  "てわたし",
  "でんあつ",
  "てんいん",
  "てんかい",
  "てんき",
  "てんぐ",
  "てんけん",
  "てんごく",
  "てんさい",
  "てんし",
  "てんすう",
  "でんち",
  "てんてき",
  "てんとう",
  "てんない",
  "てんぷら",
  "てんぼうだい",
  "てんめつ",
  "てんらんかい",
  "でんりょく",
  "でんわ",
  "どあい",
  "といれ",
  "どうかん",
  "とうきゅう",
  "どうぐ",
  "とうし",
  "とうむぎ",
  "とおい",
  "とおか",
  "とおく",
  "とおす",
  "とおる",
  "とかい",
  "とかす",
  "ときおり",
  "ときどき",
  "とくい",
  "とくしゅう",
  "とくてん",
  "とくに",
  "とくべつ",
  "とけい",
  "とける",
  "とこや",
  "とさか",
  "としょかん",
  "とそう",
  "とたん",
  "とちゅう",
  "とっきゅう",
  "とっくん",
  "とつぜん",
  "とつにゅう",
  "とどける",
  "ととのえる",
  "とない",
  "となえる",
  "となり",
  "とのさま",
  "とばす",
  "どぶがわ",
  "とほう",
  "とまる",
  "とめる",
  "ともだち",
  "ともる",
  "どようび",
  "とらえる",
  "とんかつ",
  "どんぶり",
  "ないかく",
  "ないこう",
  "ないしょ",
  "ないす",
  "ないせん",
  "ないそう",
  "なおす",
  "ながい",
  "なくす",
  "なげる",
  "なこうど",
  "なさけ",
  "なたでここ",
  "なっとう",
  "なつやすみ",
  "ななおし",
  "なにごと",
  "なにもの",
  "なにわ",
  "なのか",
  "なふだ",
  "なまいき",
  "なまえ",
  "なまみ",
  "なみだ",
  "なめらか",
  "なめる",
  "なやむ",
  "ならう",
  "ならび",
  "ならぶ",
  "なれる",
  "なわとび",
  "なわばり",
  "にあう",
  "にいがた",
  "にうけ",
  "におい",
  "にかい",
  "にがて",
  "にきび",
  "にくしみ",
  "にくまん",
  "にげる",
  "にさんかたんそ",
  "にしき",
  "にせもの",
  "にちじょう",
  "にちようび",
  "にっか",
  "にっき",
  "にっけい",
  "にっこう",
  "にっさん",
  "にっしょく",
  "にっすう",
  "にっせき",
  "にってい",
  "になう",
  "にほん",
  "にまめ",
  "にもつ",
  "にやり",
  "にゅういん",
  "にりんしゃ",
  "にわとり",
  "にんい",
  "にんか",
  "にんき",
  "にんげん",
  "にんしき",
  "にんずう",
  "にんそう",
  "にんたい",
  "にんち",
  "にんてい",
  "にんにく",
  "にんぷ",
  "にんまり",
  "にんむ",
  "にんめい",
  "にんよう",
  "ぬいくぎ",
  "ぬかす",
  "ぬぐいとる",
  "ぬぐう",
  "ぬくもり",
  "ぬすむ",
  "ぬまえび",
  "ぬめり",
  "ぬらす",
  "ぬんちゃく",
  "ねあげ",
  "ねいき",
  "ねいる",
  "ねいろ",
  "ねぐせ",
  "ねくたい",
  "ねくら",
  "ねこぜ",
  "ねこむ",
  "ねさげ",
  "ねすごす",
  "ねそべる",
  "ねだん",
  "ねつい",
  "ねっしん",
  "ねつぞう",
  "ねったいぎょ",
  "ねぶそく",
  "ねふだ",
  "ねぼう",
  "ねほりはほり",
  "ねまき",
  "ねまわし",
  "ねみみ",
  "ねむい",
  "ねむたい",
  "ねもと",
  "ねらう",
  "ねわざ",
  "ねんいり",
  "ねんおし",
  "ねんかん",
  "ねんきん",
  "ねんぐ",
  "ねんざ",
  "ねんし",
  "ねんちゃく",
  "ねんど",
  "ねんぴ",
  "ねんぶつ",
  "ねんまつ",
  "ねんりょう",
  "ねんれい",
  "のいず",
  "のおづま",
  "のがす",
  "のきなみ",
  "のこぎり",
  "のこす",
  "のこる",
  "のせる",
  "のぞく",
  "のぞむ",
  "のたまう",
  "のちほど",
  "のっく",
  "のばす",
  "のはら",
  "のべる",
  "のぼる",
  "のみもの",
  "のやま",
  "のらいぬ",
  "のらねこ",
  "のりもの",
  "のりゆき",
  "のれん",
  "のんき",
  "ばあい",
  "はあく",
  "ばあさん",
  "ばいか",
  "ばいく",
  "はいけん",
  "はいご",
  "はいしん",
  "はいすい",
  "はいせん",
  "はいそう",
  "はいち",
  "ばいばい",
  "はいれつ",
  "はえる",
  "はおる",
  "はかい",
  "ばかり",
  "はかる",
  "はくしゅ",
  "はけん",
  "はこぶ",
  "はさみ",
  "はさん",
  "はしご",
  "ばしょ",
  "はしる",
  "はせる",
  "ぱそこん",
  "はそん",
  "はたん",
  "はちみつ",
  "はつおん",
  "はっかく",
  "はづき",
  "はっきり",
  "はっくつ",
  "はっけん",
  "はっこう",
  "はっさん",
  "はっしん",
  "はったつ",
  "はっちゅう",
  "はってん",
  "はっぴょう",
  "はっぽう",
  "はなす",
  "はなび",
  "はにかむ",
  "はぶらし",
  "はみがき",
  "はむかう",
  "はめつ",
  "はやい",
  "はやし",
  "はらう",
  "はろうぃん",
  "はわい",
  "はんい",
  "はんえい",
  "はんおん",
  "はんかく",
  "はんきょう",
  "ばんぐみ",
  "はんこ",
  "はんしゃ",
  "はんすう",
  "はんだん",
  "ぱんち",
  "ぱんつ",
  "はんてい",
  "はんとし",
  "はんのう",
  "はんぱ",
  "はんぶん",
  "はんぺん",
  "はんぼうき",
  "はんめい",
  "はんらん",
  "はんろん",
  "ひいき",
  "ひうん",
  "ひえる",
  "ひかく",
  "ひかり",
  "ひかる",
  "ひかん",
  "ひくい",
  "ひけつ",
  "ひこうき",
  "ひこく",
  "ひさい",
  "ひさしぶり",
  "ひさん",
  "びじゅつかん",
  "ひしょ",
  "ひそか",
  "ひそむ",
  "ひたむき",
  "ひだり",
  "ひたる",
  "ひつぎ",
  "ひっこし",
  "ひっし",
  "ひつじゅひん",
  "ひっす",
  "ひつぜん",
  "ぴったり",
  "ぴっちり",
  "ひつよう",
  "ひてい",
  "ひとごみ",
  "ひなまつり",
  "ひなん",
  "ひねる",
  "ひはん",
  "ひびく",
  "ひひょう",
  "ひほう",
  "ひまわり",
  "ひまん",
  "ひみつ",
  "ひめい",
  "ひめじし",
  "ひやけ",
  "ひやす",
  "ひよう",
  "びょうき",
  "ひらがな",
  "ひらく",
  "ひりつ",
  "ひりょう",
  "ひるま",
  "ひるやすみ",
  "ひれい",
  "ひろい",
  "ひろう",
  "ひろき",
  "ひろゆき",
  "ひんかく",
  "ひんけつ",
  "ひんこん",
  "ひんしゅ",
  "ひんそう",
  "ぴんち",
  "ひんぱん",
  "びんぼう",
  "ふあん",
  "ふいうち",
  "ふうけい",
  "ふうせん",
  "ぷうたろう",
  "ふうとう",
  "ふうふ",
  "ふえる",
  "ふおん",
  "ふかい",
  "ふきん",
  "ふくざつ",
  "ふくぶくろ",
  "ふこう",
  "ふさい",
  "ふしぎ",
  "ふじみ",
  "ふすま",
  "ふせい",
  "ふせぐ",
  "ふそく",
  "ぶたにく",
  "ふたん",
  "ふちょう",
  "ふつう",
  "ふつか",
  "ふっかつ",
  "ふっき",
  "ふっこく",
  "ぶどう",
  "ふとる",
  "ふとん",
  "ふのう",
  "ふはい",
  "ふひょう",
  "ふへん",
  "ふまん",
  "ふみん",
  "ふめつ",
  "ふめん",
  "ふよう",
  "ふりこ",
  "ふりる",
  "ふるい",
  "ふんいき",
  "ぶんがく",
  "ぶんぐ",
  "ふんしつ",
  "ぶんせき",
  "ふんそう",
  "ぶんぽう",
  "へいあん",
  "へいおん",
  "へいがい",
  "へいき",
  "へいげん",
  "へいこう",
  "へいさ",
  "へいしゃ",
  "へいせつ",
  "へいそ",
  "へいたく",
  "へいてん",
  "へいねつ",
  "へいわ",
  "へきが",
  "へこむ",
  "べにいろ",
  "べにしょうが",
  "へらす",
  "へんかん",
  "べんきょう",
  "べんごし",
  "へんさい",
  "へんたい",
  "べんり",
  "ほあん",
  "ほいく",
  "ぼうぎょ",
  "ほうこく",
  "ほうそう",
  "ほうほう",
  "ほうもん",
  "ほうりつ",
  "ほえる",
  "ほおん",
  "ほかん",
  "ほきょう",
  "ぼきん",
  "ほくろ",
  "ほけつ",
  "ほけん",
  "ほこう",
  "ほこる",
  "ほしい",
  "ほしつ",
  "ほしゅ",
  "ほしょう",
  "ほせい",
  "ほそい",
  "ほそく",
  "ほたて",
  "ほたる",
  "ぽちぶくろ",
  "ほっきょく",
  "ほっさ",
  "ほったん",
  "ほとんど",
  "ほめる",
  "ほんい",
  "ほんき",
  "ほんけ",
  "ほんしつ",
  "ほんやく",
  "まいにち",
  "まかい",
  "まかせる",
  "まがる",
  "まける",
  "まこと",
  "まさつ",
  "まじめ",
  "ますく",
  "まぜる",
  "まつり",
  "まとめ",
  "まなぶ",
  "まぬけ",
  "まねく",
  "まほう",
  "まもる",
  "まゆげ",
  "まよう",
  "まろやか",
  "まわす",
  "まわり",
  "まわる",
  "まんが",
  "まんきつ",
  "まんぞく",
  "まんなか",
  "みいら",
  "みうち",
  "みえる",
  "みがく",
  "みかた",
  "みかん",
  "みけん",
  "みこん",
  "みじかい",
  "みすい",
  "みすえる",
  "みせる",
  "みっか",
  "みつかる",
  "みつける",
  "みてい",
  "みとめる",
  "みなと",
  "みなみかさい",
  "みねらる",
  "みのう",
  "みのがす",
  "みほん",
  "みもと",
  "みやげ",
  "みらい",
  "みりょく",
  "みわく",
  "みんか",
  "みんぞく",
  "むいか",
  "むえき",
  "むえん",
  "むかい",
  "むかう",
  "むかえ",
  "むかし",
  "むぎちゃ",
  "むける",
  "むげん",
  "むさぼる",
  "むしあつい",
  "むしば",
  "むじゅん",
  "むしろ",
  "むすう",
  "むすこ",
  "むすぶ",
  "むすめ",
  "むせる",
  "むせん",
  "むちゅう",
  "むなしい",
  "むのう",
  "むやみ",
  "むよう",
  "むらさき",
  "むりょう",
  "むろん",
  "めいあん",
  "めいうん",
  "めいえん",
  "めいかく",
  "めいきょく",
  "めいさい",
  "めいし",
  "めいそう",
  "めいぶつ",
  "めいれい",
  "めいわく",
  "めぐまれる",
  "めざす",
  "めした",
  "めずらしい",
  "めだつ",
  "めまい",
  "めやす",
  "めんきょ",
  "めんせき",
  "めんどう",
  "もうしあげる",
  "もうどうけん",
  "もえる",
  "もくし",
  "もくてき",
  "もくようび",
  "もちろん",
  "もどる",
  "もらう",
  "もんく",
  "もんだい",
  "やおや",
  "やける",
  "やさい",
  "やさしい",
  "やすい",
  "やすたろう",
  "やすみ",
  "やせる",
  "やそう",
  "やたい",
  "やちん",
  "やっと",
  "やっぱり",
  "やぶる",
  "やめる",
  "ややこしい",
  "やよい",
  "やわらかい",
  "ゆうき",
  "ゆうびんきょく",
  "ゆうべ",
  "ゆうめい",
  "ゆけつ",
  "ゆしゅつ",
  "ゆせん",
  "ゆそう",
  "ゆたか",
  "ゆちゃく",
  "ゆでる",
  "ゆにゅう",
  "ゆびわ",
  "ゆらい",
  "ゆれる",
  "ようい",
  "ようか",
  "ようきゅう",
  "ようじ",
  "ようす",
  "ようちえん",
  "よかぜ",
  "よかん",
  "よきん",
  "よくせい",
  "よくぼう",
  "よけい",
  "よごれる",
  "よさん",
  "よしゅう",
  "よそう",
  "よそく",
  "よっか",
  "よてい",
  "よどがわく",
  "よねつ",
  "よやく",
  "よゆう",
  "よろこぶ",
  "よろしい",
  "らいう",
  "らくがき",
  "らくご",
  "らくさつ",
  "らくだ",
  "らしんばん",
  "らせん",
  "らぞく",
  "らたい",
  "らっか",
  "られつ",
  "りえき",
  "りかい",
  "りきさく",
  "りきせつ",
  "りくぐん",
  "りくつ",
  "りけん",
  "りこう",
  "りせい",
  "りそう",
  "りそく",
  "りてん",
  "りねん",
  "りゆう",
  "りゅうがく",
  "りよう",
  "りょうり",
  "りょかん",
  "りょくちゃ",
  "りょこう",
  "りりく",
  "りれき",
  "りろん",
  "りんご",
  "るいけい",
  "るいさい",
  "るいじ",
  "るいせき",
  "るすばん",
  "るりがわら",
  "れいかん",
  "れいぎ",
  "れいせい",
  "れいぞうこ",
  "れいとう",
  "れいぼう",
  "れきし",
  "れきだい",
  "れんあい",
  "れんけい",
  "れんこん",
  "れんさい",
  "れんしゅう",
  "れんぞく",
  "れんらく",
  "ろうか",
  "ろうご",
  "ろうじん",
  "ろうそく",
  "ろくが",
  "ろこつ",
  "ろじうら",
  "ろしゅつ",
  "ろせん",
  "ろてん",
  "ろめん",
  "ろれつ",
  "ろんぎ",
  "ろんぱ",
  "ろんぶん",
  "ろんり",
  "わかす",
  "わかめ",
  "わかやま",
  "わかれる",
  "わしつ",
  "わじまし",
  "わすれもの",
  "わらう",
  "われる"
];
const require$$8 = [
  "abacate",
  "abaixo",
  "abalar",
  "abater",
  "abduzir",
  "abelha",
  "aberto",
  "abismo",
  "abotoar",
  "abranger",
  "abreviar",
  "abrigar",
  "abrupto",
  "absinto",
  "absoluto",
  "absurdo",
  "abutre",
  "acabado",
  "acalmar",
  "acampar",
  "acanhar",
  "acaso",
  "aceitar",
  "acelerar",
  "acenar",
  "acervo",
  "acessar",
  "acetona",
  "achatar",
  "acidez",
  "acima",
  "acionado",
  "acirrar",
  "aclamar",
  "aclive",
  "acolhida",
  "acomodar",
  "acoplar",
  "acordar",
  "acumular",
  "acusador",
  "adaptar",
  "adega",
  "adentro",
  "adepto",
  "adequar",
  "aderente",
  "adesivo",
  "adeus",
  "adiante",
  "aditivo",
  "adjetivo",
  "adjunto",
  "admirar",
  "adorar",
  "adquirir",
  "adubo",
  "adverso",
  "advogado",
  "aeronave",
  "afastar",
  "aferir",
  "afetivo",
  "afinador",
  "afivelar",
  "aflito",
  "afluente",
  "afrontar",
  "agachar",
  "agarrar",
  "agasalho",
  "agenciar",
  "agilizar",
  "agiota",
  "agitado",
  "agora",
  "agradar",
  "agreste",
  "agrupar",
  "aguardar",
  "agulha",
  "ajoelhar",
  "ajudar",
  "ajustar",
  "alameda",
  "alarme",
  "alastrar",
  "alavanca",
  "albergue",
  "albino",
  "alcatra",
  "aldeia",
  "alecrim",
  "alegria",
  "alertar",
  "alface",
  "alfinete",
  "algum",
  "alheio",
  "aliar",
  "alicate",
  "alienar",
  "alinhar",
  "aliviar",
  "almofada",
  "alocar",
  "alpiste",
  "alterar",
  "altitude",
  "alucinar",
  "alugar",
  "aluno",
  "alusivo",
  "alvo",
  "amaciar",
  "amador",
  "amarelo",
  "amassar",
  "ambas",
  "ambiente",
  "ameixa",
  "amenizar",
  "amido",
  "amistoso",
  "amizade",
  "amolador",
  "amontoar",
  "amoroso",
  "amostra",
  "amparar",
  "ampliar",
  "ampola",
  "anagrama",
  "analisar",
  "anarquia",
  "anatomia",
  "andaime",
  "anel",
  "anexo",
  "angular",
  "animar",
  "anjo",
  "anomalia",
  "anotado",
  "ansioso",
  "anterior",
  "anuidade",
  "anunciar",
  "anzol",
  "apagador",
  "apalpar",
  "apanhado",
  "apego",
  "apelido",
  "apertada",
  "apesar",
  "apetite",
  "apito",
  "aplauso",
  "aplicada",
  "apoio",
  "apontar",
  "aposta",
  "aprendiz",
  "aprovar",
  "aquecer",
  "arame",
  "aranha",
  "arara",
  "arcada",
  "ardente",
  "areia",
  "arejar",
  "arenito",
  "aresta",
  "argiloso",
  "argola",
  "arma",
  "arquivo",
  "arraial",
  "arrebate",
  "arriscar",
  "arroba",
  "arrumar",
  "arsenal",
  "arterial",
  "artigo",
  "arvoredo",
  "asfaltar",
  "asilado",
  "aspirar",
  "assador",
  "assinar",
  "assoalho",
  "assunto",
  "astral",
  "atacado",
  "atadura",
  "atalho",
  "atarefar",
  "atear",
  "atender",
  "aterro",
  "ateu",
  "atingir",
  "atirador",
  "ativo",
  "atoleiro",
  "atracar",
  "atrevido",
  "atriz",
  "atual",
  "atum",
  "auditor",
  "aumentar",
  "aura",
  "aurora",
  "autismo",
  "autoria",
  "autuar",
  "avaliar",
  "avante",
  "avaria",
  "avental",
  "avesso",
  "aviador",
  "avisar",
  "avulso",
  "axila",
  "azarar",
  "azedo",
  "azeite",
  "azulejo",
  "babar",
  "babosa",
  "bacalhau",
  "bacharel",
  "bacia",
  "bagagem",
  "baiano",
  "bailar",
  "baioneta",
  "bairro",
  "baixista",
  "bajular",
  "baleia",
  "baliza",
  "balsa",
  "banal",
  "bandeira",
  "banho",
  "banir",
  "banquete",
  "barato",
  "barbado",
  "baronesa",
  "barraca",
  "barulho",
  "baseado",
  "bastante",
  "batata",
  "batedor",
  "batida",
  "batom",
  "batucar",
  "baunilha",
  "beber",
  "beijo",
  "beirada",
  "beisebol",
  "beldade",
  "beleza",
  "belga",
  "beliscar",
  "bendito",
  "bengala",
  "benzer",
  "berimbau",
  "berlinda",
  "berro",
  "besouro",
  "bexiga",
  "bezerro",
  "bico",
  "bicudo",
  "bienal",
  "bifocal",
  "bifurcar",
  "bigorna",
  "bilhete",
  "bimestre",
  "bimotor",
  "biologia",
  "biombo",
  "biosfera",
  "bipolar",
  "birrento",
  "biscoito",
  "bisneto",
  "bispo",
  "bissexto",
  "bitola",
  "bizarro",
  "blindado",
  "bloco",
  "bloquear",
  "boato",
  "bobagem",
  "bocado",
  "bocejo",
  "bochecha",
  "boicotar",
  "bolada",
  "boletim",
  "bolha",
  "bolo",
  "bombeiro",
  "bonde",
  "boneco",
  "bonita",
  "borbulha",
  "borda",
  "boreal",
  "borracha",
  "bovino",
  "boxeador",
  "branco",
  "brasa",
  "braveza",
  "breu",
  "briga",
  "brilho",
  "brincar",
  "broa",
  "brochura",
  "bronzear",
  "broto",
  "bruxo",
  "bucha",
  "budismo",
  "bufar",
  "bule",
  "buraco",
  "busca",
  "busto",
  "buzina",
  "cabana",
  "cabelo",
  "cabide",
  "cabo",
  "cabrito",
  "cacau",
  "cacetada",
  "cachorro",
  "cacique",
  "cadastro",
  "cadeado",
  "cafezal",
  "caiaque",
  "caipira",
  "caixote",
  "cajado",
  "caju",
  "calafrio",
  "calcular",
  "caldeira",
  "calibrar",
  "calmante",
  "calota",
  "camada",
  "cambista",
  "camisa",
  "camomila",
  "campanha",
  "camuflar",
  "canavial",
  "cancelar",
  "caneta",
  "canguru",
  "canhoto",
  "canivete",
  "canoa",
  "cansado",
  "cantar",
  "canudo",
  "capacho",
  "capela",
  "capinar",
  "capotar",
  "capricho",
  "captador",
  "capuz",
  "caracol",
  "carbono",
  "cardeal",
  "careca",
  "carimbar",
  "carneiro",
  "carpete",
  "carreira",
  "cartaz",
  "carvalho",
  "casaco",
  "casca",
  "casebre",
  "castelo",
  "casulo",
  "catarata",
  "cativar",
  "caule",
  "causador",
  "cautelar",
  "cavalo",
  "caverna",
  "cebola",
  "cedilha",
  "cegonha",
  "celebrar",
  "celular",
  "cenoura",
  "censo",
  "centeio",
  "cercar",
  "cerrado",
  "certeiro",
  "cerveja",
  "cetim",
  "cevada",
  "chacota",
  "chaleira",
  "chamado",
  "chapada",
  "charme",
  "chatice",
  "chave",
  "chefe",
  "chegada",
  "cheiro",
  "cheque",
  "chicote",
  "chifre",
  "chinelo",
  "chocalho",
  "chover",
  "chumbo",
  "chutar",
  "chuva",
  "cicatriz",
  "ciclone",
  "cidade",
  "cidreira",
  "ciente",
  "cigana",
  "cimento",
  "cinto",
  "cinza",
  "ciranda",
  "circuito",
  "cirurgia",
  "citar",
  "clareza",
  "clero",
  "clicar",
  "clone",
  "clube",
  "coado",
  "coagir",
  "cobaia",
  "cobertor",
  "cobrar",
  "cocada",
  "coelho",
  "coentro",
  "coeso",
  "cogumelo",
  "coibir",
  "coifa",
  "coiote",
  "colar",
  "coleira",
  "colher",
  "colidir",
  "colmeia",
  "colono",
  "coluna",
  "comando",
  "combinar",
  "comentar",
  "comitiva",
  "comover",
  "complexo",
  "comum",
  "concha",
  "condor",
  "conectar",
  "confuso",
  "congelar",
  "conhecer",
  "conjugar",
  "consumir",
  "contrato",
  "convite",
  "cooperar",
  "copeiro",
  "copiador",
  "copo",
  "coquetel",
  "coragem",
  "cordial",
  "corneta",
  "coronha",
  "corporal",
  "correio",
  "cortejo",
  "coruja",
  "corvo",
  "cosseno",
  "costela",
  "cotonete",
  "couro",
  "couve",
  "covil",
  "cozinha",
  "cratera",
  "cravo",
  "creche",
  "credor",
  "creme",
  "crer",
  "crespo",
  "criada",
  "criminal",
  "crioulo",
  "crise",
  "criticar",
  "crosta",
  "crua",
  "cruzeiro",
  "cubano",
  "cueca",
  "cuidado",
  "cujo",
  "culatra",
  "culminar",
  "culpar",
  "cultura",
  "cumprir",
  "cunhado",
  "cupido",
  "curativo",
  "curral",
  "cursar",
  "curto",
  "cuspir",
  "custear",
  "cutelo",
  "damasco",
  "datar",
  "debater",
  "debitar",
  "deboche",
  "debulhar",
  "decalque",
  "decimal",
  "declive",
  "decote",
  "decretar",
  "dedal",
  "dedicado",
  "deduzir",
  "defesa",
  "defumar",
  "degelo",
  "degrau",
  "degustar",
  "deitado",
  "deixar",
  "delator",
  "delegado",
  "delinear",
  "delonga",
  "demanda",
  "demitir",
  "demolido",
  "dentista",
  "depenado",
  "depilar",
  "depois",
  "depressa",
  "depurar",
  "deriva",
  "derramar",
  "desafio",
  "desbotar",
  "descanso",
  "desenho",
  "desfiado",
  "desgaste",
  "desigual",
  "deslize",
  "desmamar",
  "desova",
  "despesa",
  "destaque",
  "desviar",
  "detalhar",
  "detentor",
  "detonar",
  "detrito",
  "deusa",
  "dever",
  "devido",
  "devotado",
  "dezena",
  "diagrama",
  "dialeto",
  "didata",
  "difuso",
  "digitar",
  "dilatado",
  "diluente",
  "diminuir",
  "dinastia",
  "dinheiro",
  "diocese",
  "direto",
  "discreta",
  "disfarce",
  "disparo",
  "disquete",
  "dissipar",
  "distante",
  "ditador",
  "diurno",
  "diverso",
  "divisor",
  "divulgar",
  "dizer",
  "dobrador",
  "dolorido",
  "domador",
  "dominado",
  "donativo",
  "donzela",
  "dormente",
  "dorsal",
  "dosagem",
  "dourado",
  "doutor",
  "drenagem",
  "drible",
  "drogaria",
  "duelar",
  "duende",
  "dueto",
  "duplo",
  "duquesa",
  "durante",
  "duvidoso",
  "eclodir",
  "ecoar",
  "ecologia",
  "edificar",
  "edital",
  "educado",
  "efeito",
  "efetivar",
  "ejetar",
  "elaborar",
  "eleger",
  "eleitor",
  "elenco",
  "elevador",
  "eliminar",
  "elogiar",
  "embargo",
  "embolado",
  "embrulho",
  "embutido",
  "emenda",
  "emergir",
  "emissor",
  "empatia",
  "empenho",
  "empinado",
  "empolgar",
  "emprego",
  "empurrar",
  "emulador",
  "encaixe",
  "encenado",
  "enchente",
  "encontro",
  "endeusar",
  "endossar",
  "enfaixar",
  "enfeite",
  "enfim",
  "engajado",
  "engenho",
  "englobar",
  "engomado",
  "engraxar",
  "enguia",
  "enjoar",
  "enlatar",
  "enquanto",
  "enraizar",
  "enrolado",
  "enrugar",
  "ensaio",
  "enseada",
  "ensino",
  "ensopado",
  "entanto",
  "enteado",
  "entidade",
  "entortar",
  "entrada",
  "entulho",
  "envergar",
  "enviado",
  "envolver",
  "enxame",
  "enxerto",
  "enxofre",
  "enxuto",
  "epiderme",
  "equipar",
  "ereto",
  "erguido",
  "errata",
  "erva",
  "ervilha",
  "esbanjar",
  "esbelto",
  "escama",
  "escola",
  "escrita",
  "escuta",
  "esfinge",
  "esfolar",
  "esfregar",
  "esfumado",
  "esgrima",
  "esmalte",
  "espanto",
  "espelho",
  "espiga",
  "esponja",
  "espreita",
  "espumar",
  "esquerda",
  "estaca",
  "esteira",
  "esticar",
  "estofado",
  "estrela",
  "estudo",
  "esvaziar",
  "etanol",
  "etiqueta",
  "euforia",
  "europeu",
  "evacuar",
  "evaporar",
  "evasivo",
  "eventual",
  "evidente",
  "evoluir",
  "exagero",
  "exalar",
  "examinar",
  "exato",
  "exausto",
  "excesso",
  "excitar",
  "exclamar",
  "executar",
  "exemplo",
  "exibir",
  "exigente",
  "exonerar",
  "expandir",
  "expelir",
  "expirar",
  "explanar",
  "exposto",
  "expresso",
  "expulsar",
  "externo",
  "extinto",
  "extrato",
  "fabricar",
  "fabuloso",
  "faceta",
  "facial",
  "fada",
  "fadiga",
  "faixa",
  "falar",
  "falta",
  "familiar",
  "fandango",
  "fanfarra",
  "fantoche",
  "fardado",
  "farelo",
  "farinha",
  "farofa",
  "farpa",
  "fartura",
  "fatia",
  "fator",
  "favorita",
  "faxina",
  "fazenda",
  "fechado",
  "feijoada",
  "feirante",
  "felino",
  "feminino",
  "fenda",
  "feno",
  "fera",
  "feriado",
  "ferrugem",
  "ferver",
  "festejar",
  "fetal",
  "feudal",
  "fiapo",
  "fibrose",
  "ficar",
  "ficheiro",
  "figurado",
  "fileira",
  "filho",
  "filme",
  "filtrar",
  "firmeza",
  "fisgada",
  "fissura",
  "fita",
  "fivela",
  "fixador",
  "fixo",
  "flacidez",
  "flamingo",
  "flanela",
  "flechada",
  "flora",
  "flutuar",
  "fluxo",
  "focal",
  "focinho",
  "fofocar",
  "fogo",
  "foguete",
  "foice",
  "folgado",
  "folheto",
  "forjar",
  "formiga",
  "forno",
  "forte",
  "fosco",
  "fossa",
  "fragata",
  "fralda",
  "frango",
  "frasco",
  "fraterno",
  "freira",
  "frente",
  "fretar",
  "frieza",
  "friso",
  "fritura",
  "fronha",
  "frustrar",
  "fruteira",
  "fugir",
  "fulano",
  "fuligem",
  "fundar",
  "fungo",
  "funil",
  "furador",
  "furioso",
  "futebol",
  "gabarito",
  "gabinete",
  "gado",
  "gaiato",
  "gaiola",
  "gaivota",
  "galega",
  "galho",
  "galinha",
  "galocha",
  "ganhar",
  "garagem",
  "garfo",
  "gargalo",
  "garimpo",
  "garoupa",
  "garrafa",
  "gasoduto",
  "gasto",
  "gata",
  "gatilho",
  "gaveta",
  "gazela",
  "gelado",
  "geleia",
  "gelo",
  "gemada",
  "gemer",
  "gemido",
  "generoso",
  "gengiva",
  "genial",
  "genoma",
  "genro",
  "geologia",
  "gerador",
  "germinar",
  "gesso",
  "gestor",
  "ginasta",
  "gincana",
  "gingado",
  "girafa",
  "girino",
  "glacial",
  "glicose",
  "global",
  "glorioso",
  "goela",
  "goiaba",
  "golfe",
  "golpear",
  "gordura",
  "gorjeta",
  "gorro",
  "gostoso",
  "goteira",
  "governar",
  "gracejo",
  "gradual",
  "grafite",
  "gralha",
  "grampo",
  "granada",
  "gratuito",
  "graveto",
  "graxa",
  "grego",
  "grelhar",
  "greve",
  "grilo",
  "grisalho",
  "gritaria",
  "grosso",
  "grotesco",
  "grudado",
  "grunhido",
  "gruta",
  "guache",
  "guarani",
  "guaxinim",
  "guerrear",
  "guiar",
  "guincho",
  "guisado",
  "gula",
  "guloso",
  "guru",
  "habitar",
  "harmonia",
  "haste",
  "haver",
  "hectare",
  "herdar",
  "heresia",
  "hesitar",
  "hiato",
  "hibernar",
  "hidratar",
  "hiena",
  "hino",
  "hipismo",
  "hipnose",
  "hipoteca",
  "hoje",
  "holofote",
  "homem",
  "honesto",
  "honrado",
  "hormonal",
  "hospedar",
  "humorado",
  "iate",
  "ideia",
  "idoso",
  "ignorado",
  "igreja",
  "iguana",
  "ileso",
  "ilha",
  "iludido",
  "iluminar",
  "ilustrar",
  "imagem",
  "imediato",
  "imenso",
  "imersivo",
  "iminente",
  "imitador",
  "imortal",
  "impacto",
  "impedir",
  "implante",
  "impor",
  "imprensa",
  "impune",
  "imunizar",
  "inalador",
  "inapto",
  "inativo",
  "incenso",
  "inchar",
  "incidir",
  "incluir",
  "incolor",
  "indeciso",
  "indireto",
  "indutor",
  "ineficaz",
  "inerente",
  "infantil",
  "infestar",
  "infinito",
  "inflamar",
  "informal",
  "infrator",
  "ingerir",
  "inibido",
  "inicial",
  "inimigo",
  "injetar",
  "inocente",
  "inodoro",
  "inovador",
  "inox",
  "inquieto",
  "inscrito",
  "inseto",
  "insistir",
  "inspetor",
  "instalar",
  "insulto",
  "intacto",
  "integral",
  "intimar",
  "intocado",
  "intriga",
  "invasor",
  "inverno",
  "invicto",
  "invocar",
  "iogurte",
  "iraniano",
  "ironizar",
  "irreal",
  "irritado",
  "isca",
  "isento",
  "isolado",
  "isqueiro",
  "italiano",
  "janeiro",
  "jangada",
  "janta",
  "jararaca",
  "jardim",
  "jarro",
  "jasmim",
  "jato",
  "javali",
  "jazida",
  "jejum",
  "joaninha",
  "joelhada",
  "jogador",
  "joia",
  "jornal",
  "jorrar",
  "jovem",
  "juba",
  "judeu",
  "judoca",
  "juiz",
  "julgador",
  "julho",
  "jurado",
  "jurista",
  "juro",
  "justa",
  "labareda",
  "laboral",
  "lacre",
  "lactante",
  "ladrilho",
  "lagarta",
  "lagoa",
  "laje",
  "lamber",
  "lamentar",
  "laminar",
  "lampejo",
  "lanche",
  "lapidar",
  "lapso",
  "laranja",
  "lareira",
  "largura",
  "lasanha",
  "lastro",
  "lateral",
  "latido",
  "lavanda",
  "lavoura",
  "lavrador",
  "laxante",
  "lazer",
  "lealdade",
  "lebre",
  "legado",
  "legendar",
  "legista",
  "leigo",
  "leiloar",
  "leitura",
  "lembrete",
  "leme",
  "lenhador",
  "lentilha",
  "leoa",
  "lesma",
  "leste",
  "letivo",
  "letreiro",
  "levar",
  "leveza",
  "levitar",
  "liberal",
  "libido",
  "liderar",
  "ligar",
  "ligeiro",
  "limitar",
  "limoeiro",
  "limpador",
  "linda",
  "linear",
  "linhagem",
  "liquidez",
  "listagem",
  "lisura",
  "litoral",
  "livro",
  "lixa",
  "lixeira",
  "locador",
  "locutor",
  "lojista",
  "lombo",
  "lona",
  "longe",
  "lontra",
  "lorde",
  "lotado",
  "loteria",
  "loucura",
  "lousa",
  "louvar",
  "luar",
  "lucidez",
  "lucro",
  "luneta",
  "lustre",
  "lutador",
  "luva",
  "macaco",
  "macete",
  "machado",
  "macio",
  "madeira",
  "madrinha",
  "magnata",
  "magreza",
  "maior",
  "mais",
  "malandro",
  "malha",
  "malote",
  "maluco",
  "mamilo",
  "mamoeiro",
  "mamute",
  "manada",
  "mancha",
  "mandato",
  "manequim",
  "manhoso",
  "manivela",
  "manobrar",
  "mansa",
  "manter",
  "manusear",
  "mapeado",
  "maquinar",
  "marcador",
  "maresia",
  "marfim",
  "margem",
  "marinho",
  "marmita",
  "maroto",
  "marquise",
  "marreco",
  "martelo",
  "marujo",
  "mascote",
  "masmorra",
  "massagem",
  "mastigar",
  "matagal",
  "materno",
  "matinal",
  "matutar",
  "maxilar",
  "medalha",
  "medida",
  "medusa",
  "megafone",
  "meiga",
  "melancia",
  "melhor",
  "membro",
  "memorial",
  "menino",
  "menos",
  "mensagem",
  "mental",
  "merecer",
  "mergulho",
  "mesada",
  "mesclar",
  "mesmo",
  "mesquita",
  "mestre",
  "metade",
  "meteoro",
  "metragem",
  "mexer",
  "mexicano",
  "micro",
  "migalha",
  "migrar",
  "milagre",
  "milenar",
  "milhar",
  "mimado",
  "minerar",
  "minhoca",
  "ministro",
  "minoria",
  "miolo",
  "mirante",
  "mirtilo",
  "misturar",
  "mocidade",
  "moderno",
  "modular",
  "moeda",
  "moer",
  "moinho",
  "moita",
  "moldura",
  "moleza",
  "molho",
  "molinete",
  "molusco",
  "montanha",
  "moqueca",
  "morango",
  "morcego",
  "mordomo",
  "morena",
  "mosaico",
  "mosquete",
  "mostarda",
  "motel",
  "motim",
  "moto",
  "motriz",
  "muda",
  "muito",
  "mulata",
  "mulher",
  "multar",
  "mundial",
  "munido",
  "muralha",
  "murcho",
  "muscular",
  "museu",
  "musical",
  "nacional",
  "nadador",
  "naja",
  "namoro",
  "narina",
  "narrado",
  "nascer",
  "nativa",
  "natureza",
  "navalha",
  "navegar",
  "navio",
  "neblina",
  "nebuloso",
  "negativa",
  "negociar",
  "negrito",
  "nervoso",
  "neta",
  "neural",
  "nevasca",
  "nevoeiro",
  "ninar",
  "ninho",
  "nitidez",
  "nivelar",
  "nobreza",
  "noite",
  "noiva",
  "nomear",
  "nominal",
  "nordeste",
  "nortear",
  "notar",
  "noticiar",
  "noturno",
  "novelo",
  "novilho",
  "novo",
  "nublado",
  "nudez",
  "numeral",
  "nupcial",
  "nutrir",
  "nuvem",
  "obcecado",
  "obedecer",
  "objetivo",
  "obrigado",
  "obscuro",
  "obstetra",
  "obter",
  "obturar",
  "ocidente",
  "ocioso",
  "ocorrer",
  "oculista",
  "ocupado",
  "ofegante",
  "ofensiva",
  "oferenda",
  "oficina",
  "ofuscado",
  "ogiva",
  "olaria",
  "oleoso",
  "olhar",
  "oliveira",
  "ombro",
  "omelete",
  "omisso",
  "omitir",
  "ondulado",
  "oneroso",
  "ontem",
  "opcional",
  "operador",
  "oponente",
  "oportuno",
  "oposto",
  "orar",
  "orbitar",
  "ordem",
  "ordinal",
  "orfanato",
  "orgasmo",
  "orgulho",
  "oriental",
  "origem",
  "oriundo",
  "orla",
  "ortodoxo",
  "orvalho",
  "oscilar",
  "ossada",
  "osso",
  "ostentar",
  "otimismo",
  "ousadia",
  "outono",
  "outubro",
  "ouvido",
  "ovelha",
  "ovular",
  "oxidar",
  "oxigenar",
  "pacato",
  "paciente",
  "pacote",
  "pactuar",
  "padaria",
  "padrinho",
  "pagar",
  "pagode",
  "painel",
  "pairar",
  "paisagem",
  "palavra",
  "palestra",
  "palheta",
  "palito",
  "palmada",
  "palpitar",
  "pancada",
  "panela",
  "panfleto",
  "panqueca",
  "pantanal",
  "papagaio",
  "papelada",
  "papiro",
  "parafina",
  "parcial",
  "pardal",
  "parede",
  "partida",
  "pasmo",
  "passado",
  "pastel",
  "patamar",
  "patente",
  "patinar",
  "patrono",
  "paulada",
  "pausar",
  "peculiar",
  "pedalar",
  "pedestre",
  "pediatra",
  "pedra",
  "pegada",
  "peitoral",
  "peixe",
  "pele",
  "pelicano",
  "penca",
  "pendurar",
  "peneira",
  "penhasco",
  "pensador",
  "pente",
  "perceber",
  "perfeito",
  "pergunta",
  "perito",
  "permitir",
  "perna",
  "perplexo",
  "persiana",
  "pertence",
  "peruca",
  "pescado",
  "pesquisa",
  "pessoa",
  "petiscar",
  "piada",
  "picado",
  "piedade",
  "pigmento",
  "pilastra",
  "pilhado",
  "pilotar",
  "pimenta",
  "pincel",
  "pinguim",
  "pinha",
  "pinote",
  "pintar",
  "pioneiro",
  "pipoca",
  "piquete",
  "piranha",
  "pires",
  "pirueta",
  "piscar",
  "pistola",
  "pitanga",
  "pivete",
  "planta",
  "plaqueta",
  "platina",
  "plebeu",
  "plumagem",
  "pluvial",
  "pneu",
  "poda",
  "poeira",
  "poetisa",
  "polegada",
  "policiar",
  "poluente",
  "polvilho",
  "pomar",
  "pomba",
  "ponderar",
  "pontaria",
  "populoso",
  "porta",
  "possuir",
  "postal",
  "pote",
  "poupar",
  "pouso",
  "povoar",
  "praia",
  "prancha",
  "prato",
  "praxe",
  "prece",
  "predador",
  "prefeito",
  "premiar",
  "prensar",
  "preparar",
  "presilha",
  "pretexto",
  "prevenir",
  "prezar",
  "primata",
  "princesa",
  "prisma",
  "privado",
  "processo",
  "produto",
  "profeta",
  "proibido",
  "projeto",
  "prometer",
  "propagar",
  "prosa",
  "protetor",
  "provador",
  "publicar",
  "pudim",
  "pular",
  "pulmonar",
  "pulseira",
  "punhal",
  "punir",
  "pupilo",
  "pureza",
  "puxador",
  "quadra",
  "quantia",
  "quarto",
  "quase",
  "quebrar",
  "queda",
  "queijo",
  "quente",
  "querido",
  "quimono",
  "quina",
  "quiosque",
  "rabanada",
  "rabisco",
  "rachar",
  "racionar",
  "radial",
  "raiar",
  "rainha",
  "raio",
  "raiva",
  "rajada",
  "ralado",
  "ramal",
  "ranger",
  "ranhura",
  "rapadura",
  "rapel",
  "rapidez",
  "raposa",
  "raquete",
  "raridade",
  "rasante",
  "rascunho",
  "rasgar",
  "raspador",
  "rasteira",
  "rasurar",
  "ratazana",
  "ratoeira",
  "realeza",
  "reanimar",
  "reaver",
  "rebaixar",
  "rebelde",
  "rebolar",
  "recado",
  "recente",
  "recheio",
  "recibo",
  "recordar",
  "recrutar",
  "recuar",
  "rede",
  "redimir",
  "redonda",
  "reduzida",
  "reenvio",
  "refinar",
  "refletir",
  "refogar",
  "refresco",
  "refugiar",
  "regalia",
  "regime",
  "regra",
  "reinado",
  "reitor",
  "rejeitar",
  "relativo",
  "remador",
  "remendo",
  "remorso",
  "renovado",
  "reparo",
  "repelir",
  "repleto",
  "repolho",
  "represa",
  "repudiar",
  "requerer",
  "resenha",
  "resfriar",
  "resgatar",
  "residir",
  "resolver",
  "respeito",
  "ressaca",
  "restante",
  "resumir",
  "retalho",
  "reter",
  "retirar",
  "retomada",
  "retratar",
  "revelar",
  "revisor",
  "revolta",
  "riacho",
  "rica",
  "rigidez",
  "rigoroso",
  "rimar",
  "ringue",
  "risada",
  "risco",
  "risonho",
  "robalo",
  "rochedo",
  "rodada",
  "rodeio",
  "rodovia",
  "roedor",
  "roleta",
  "romano",
  "roncar",
  "rosado",
  "roseira",
  "rosto",
  "rota",
  "roteiro",
  "rotina",
  "rotular",
  "rouco",
  "roupa",
  "roxo",
  "rubro",
  "rugido",
  "rugoso",
  "ruivo",
  "rumo",
  "rupestre",
  "russo",
  "sabor",
  "saciar",
  "sacola",
  "sacudir",
  "sadio",
  "safira",
  "saga",
  "sagrada",
  "saibro",
  "salada",
  "saleiro",
  "salgado",
  "saliva",
  "salpicar",
  "salsicha",
  "saltar",
  "salvador",
  "sambar",
  "samurai",
  "sanar",
  "sanfona",
  "sangue",
  "sanidade",
  "sapato",
  "sarda",
  "sargento",
  "sarjeta",
  "saturar",
  "saudade",
  "saxofone",
  "sazonal",
  "secar",
  "secular",
  "seda",
  "sedento",
  "sediado",
  "sedoso",
  "sedutor",
  "segmento",
  "segredo",
  "segundo",
  "seiva",
  "seleto",
  "selvagem",
  "semanal",
  "semente",
  "senador",
  "senhor",
  "sensual",
  "sentado",
  "separado",
  "sereia",
  "seringa",
  "serra",
  "servo",
  "setembro",
  "setor",
  "sigilo",
  "silhueta",
  "silicone",
  "simetria",
  "simpatia",
  "simular",
  "sinal",
  "sincero",
  "singular",
  "sinopse",
  "sintonia",
  "sirene",
  "siri",
  "situado",
  "soberano",
  "sobra",
  "socorro",
  "sogro",
  "soja",
  "solda",
  "soletrar",
  "solteiro",
  "sombrio",
  "sonata",
  "sondar",
  "sonegar",
  "sonhador",
  "sono",
  "soprano",
  "soquete",
  "sorrir",
  "sorteio",
  "sossego",
  "sotaque",
  "soterrar",
  "sovado",
  "sozinho",
  "suavizar",
  "subida",
  "submerso",
  "subsolo",
  "subtrair",
  "sucata",
  "sucesso",
  "suco",
  "sudeste",
  "sufixo",
  "sugador",
  "sugerir",
  "sujeito",
  "sulfato",
  "sumir",
  "suor",
  "superior",
  "suplicar",
  "suposto",
  "suprimir",
  "surdina",
  "surfista",
  "surpresa",
  "surreal",
  "surtir",
  "suspiro",
  "sustento",
  "tabela",
  "tablete",
  "tabuada",
  "tacho",
  "tagarela",
  "talher",
  "talo",
  "talvez",
  "tamanho",
  "tamborim",
  "tampa",
  "tangente",
  "tanto",
  "tapar",
  "tapioca",
  "tardio",
  "tarefa",
  "tarja",
  "tarraxa",
  "tatuagem",
  "taurino",
  "taxativo",
  "taxista",
  "teatral",
  "tecer",
  "tecido",
  "teclado",
  "tedioso",
  "teia",
  "teimar",
  "telefone",
  "telhado",
  "tempero",
  "tenente",
  "tensor",
  "tentar",
  "termal",
  "terno",
  "terreno",
  "tese",
  "tesoura",
  "testado",
  "teto",
  "textura",
  "texugo",
  "tiara",
  "tigela",
  "tijolo",
  "timbrar",
  "timidez",
  "tingido",
  "tinteiro",
  "tiragem",
  "titular",
  "toalha",
  "tocha",
  "tolerar",
  "tolice",
  "tomada",
  "tomilho",
  "tonel",
  "tontura",
  "topete",
  "tora",
  "torcido",
  "torneio",
  "torque",
  "torrada",
  "torto",
  "tostar",
  "touca",
  "toupeira",
  "toxina",
  "trabalho",
  "tracejar",
  "tradutor",
  "trafegar",
  "trajeto",
  "trama",
  "trancar",
  "trapo",
  "traseiro",
  "tratador",
  "travar",
  "treino",
  "tremer",
  "trepidar",
  "trevo",
  "triagem",
  "tribo",
  "triciclo",
  "tridente",
  "trilogia",
  "trindade",
  "triplo",
  "triturar",
  "triunfal",
  "trocar",
  "trombeta",
  "trova",
  "trunfo",
  "truque",
  "tubular",
  "tucano",
  "tudo",
  "tulipa",
  "tupi",
  "turbo",
  "turma",
  "turquesa",
  "tutelar",
  "tutorial",
  "uivar",
  "umbigo",
  "unha",
  "unidade",
  "uniforme",
  "urologia",
  "urso",
  "urtiga",
  "urubu",
  "usado",
  "usina",
  "usufruir",
  "vacina",
  "vadiar",
  "vagaroso",
  "vaidoso",
  "vala",
  "valente",
  "validade",
  "valores",
  "vantagem",
  "vaqueiro",
  "varanda",
  "vareta",
  "varrer",
  "vascular",
  "vasilha",
  "vassoura",
  "vazar",
  "vazio",
  "veado",
  "vedar",
  "vegetar",
  "veicular",
  "veleiro",
  "velhice",
  "veludo",
  "vencedor",
  "vendaval",
  "venerar",
  "ventre",
  "verbal",
  "verdade",
  "vereador",
  "vergonha",
  "vermelho",
  "verniz",
  "versar",
  "vertente",
  "vespa",
  "vestido",
  "vetorial",
  "viaduto",
  "viagem",
  "viajar",
  "viatura",
  "vibrador",
  "videira",
  "vidraria",
  "viela",
  "viga",
  "vigente",
  "vigiar",
  "vigorar",
  "vilarejo",
  "vinco",
  "vinheta",
  "vinil",
  "violeta",
  "virada",
  "virtude",
  "visitar",
  "visto",
  "vitral",
  "viveiro",
  "vizinho",
  "voador",
  "voar",
  "vogal",
  "volante",
  "voleibol",
  "voltagem",
  "volumoso",
  "vontade",
  "vulto",
  "vuvuzela",
  "xadrez",
  "xarope",
  "xeque",
  "xeretar",
  "xerife",
  "xingar",
  "zangado",
  "zarpar",
  "zebu",
  "zelador",
  "zombar",
  "zoologia",
  "zumbido"
];
const require$$9 = [
  "abandon",
  "ability",
  "able",
  "about",
  "above",
  "absent",
  "absorb",
  "abstract",
  "absurd",
  "abuse",
  "access",
  "accident",
  "account",
  "accuse",
  "achieve",
  "acid",
  "acoustic",
  "acquire",
  "across",
  "act",
  "action",
  "actor",
  "actress",
  "actual",
  "adapt",
  "add",
  "addict",
  "address",
  "adjust",
  "admit",
  "adult",
  "advance",
  "advice",
  "aerobic",
  "affair",
  "afford",
  "afraid",
  "again",
  "age",
  "agent",
  "agree",
  "ahead",
  "aim",
  "air",
  "airport",
  "aisle",
  "alarm",
  "album",
  "alcohol",
  "alert",
  "alien",
  "all",
  "alley",
  "allow",
  "almost",
  "alone",
  "alpha",
  "already",
  "also",
  "alter",
  "always",
  "amateur",
  "amazing",
  "among",
  "amount",
  "amused",
  "analyst",
  "anchor",
  "ancient",
  "anger",
  "angle",
  "angry",
  "animal",
  "ankle",
  "announce",
  "annual",
  "another",
  "answer",
  "antenna",
  "antique",
  "anxiety",
  "any",
  "apart",
  "apology",
  "appear",
  "apple",
  "approve",
  "april",
  "arch",
  "arctic",
  "area",
  "arena",
  "argue",
  "arm",
  "armed",
  "armor",
  "army",
  "around",
  "arrange",
  "arrest",
  "arrive",
  "arrow",
  "art",
  "artefact",
  "artist",
  "artwork",
  "ask",
  "aspect",
  "assault",
  "asset",
  "assist",
  "assume",
  "asthma",
  "athlete",
  "atom",
  "attack",
  "attend",
  "attitude",
  "attract",
  "auction",
  "audit",
  "august",
  "aunt",
  "author",
  "auto",
  "autumn",
  "average",
  "avocado",
  "avoid",
  "awake",
  "aware",
  "away",
  "awesome",
  "awful",
  "awkward",
  "axis",
  "baby",
  "bachelor",
  "bacon",
  "badge",
  "bag",
  "balance",
  "balcony",
  "ball",
  "bamboo",
  "banana",
  "banner",
  "bar",
  "barely",
  "bargain",
  "barrel",
  "base",
  "basic",
  "basket",
  "battle",
  "beach",
  "bean",
  "beauty",
  "because",
  "become",
  "beef",
  "before",
  "begin",
  "behave",
  "behind",
  "believe",
  "below",
  "belt",
  "bench",
  "benefit",
  "best",
  "betray",
  "better",
  "between",
  "beyond",
  "bicycle",
  "bid",
  "bike",
  "bind",
  "biology",
  "bird",
  "birth",
  "bitter",
  "black",
  "blade",
  "blame",
  "blanket",
  "blast",
  "bleak",
  "bless",
  "blind",
  "blood",
  "blossom",
  "blouse",
  "blue",
  "blur",
  "blush",
  "board",
  "boat",
  "body",
  "boil",
  "bomb",
  "bone",
  "bonus",
  "book",
  "boost",
  "border",
  "boring",
  "borrow",
  "boss",
  "bottom",
  "bounce",
  "box",
  "boy",
  "bracket",
  "brain",
  "brand",
  "brass",
  "brave",
  "bread",
  "breeze",
  "brick",
  "bridge",
  "brief",
  "bright",
  "bring",
  "brisk",
  "broccoli",
  "broken",
  "bronze",
  "broom",
  "brother",
  "brown",
  "brush",
  "bubble",
  "buddy",
  "budget",
  "buffalo",
  "build",
  "bulb",
  "bulk",
  "bullet",
  "bundle",
  "bunker",
  "burden",
  "burger",
  "burst",
  "bus",
  "business",
  "busy",
  "butter",
  "buyer",
  "buzz",
  "cabbage",
  "cabin",
  "cable",
  "cactus",
  "cage",
  "cake",
  "call",
  "calm",
  "camera",
  "camp",
  "can",
  "canal",
  "cancel",
  "candy",
  "cannon",
  "canoe",
  "canvas",
  "canyon",
  "capable",
  "capital",
  "captain",
  "car",
  "carbon",
  "card",
  "cargo",
  "carpet",
  "carry",
  "cart",
  "case",
  "cash",
  "casino",
  "castle",
  "casual",
  "cat",
  "catalog",
  "catch",
  "category",
  "cattle",
  "caught",
  "cause",
  "caution",
  "cave",
  "ceiling",
  "celery",
  "cement",
  "census",
  "century",
  "cereal",
  "certain",
  "chair",
  "chalk",
  "champion",
  "change",
  "chaos",
  "chapter",
  "charge",
  "chase",
  "chat",
  "cheap",
  "check",
  "cheese",
  "chef",
  "cherry",
  "chest",
  "chicken",
  "chief",
  "child",
  "chimney",
  "choice",
  "choose",
  "chronic",
  "chuckle",
  "chunk",
  "churn",
  "cigar",
  "cinnamon",
  "circle",
  "citizen",
  "city",
  "civil",
  "claim",
  "clap",
  "clarify",
  "claw",
  "clay",
  "clean",
  "clerk",
  "clever",
  "click",
  "client",
  "cliff",
  "climb",
  "clinic",
  "clip",
  "clock",
  "clog",
  "close",
  "cloth",
  "cloud",
  "clown",
  "club",
  "clump",
  "cluster",
  "clutch",
  "coach",
  "coast",
  "coconut",
  "code",
  "coffee",
  "coil",
  "coin",
  "collect",
  "color",
  "column",
  "combine",
  "come",
  "comfort",
  "comic",
  "common",
  "company",
  "concert",
  "conduct",
  "confirm",
  "congress",
  "connect",
  "consider",
  "control",
  "convince",
  "cook",
  "cool",
  "copper",
  "copy",
  "coral",
  "core",
  "corn",
  "correct",
  "cost",
  "cotton",
  "couch",
  "country",
  "couple",
  "course",
  "cousin",
  "cover",
  "coyote",
  "crack",
  "cradle",
  "craft",
  "cram",
  "crane",
  "crash",
  "crater",
  "crawl",
  "crazy",
  "cream",
  "credit",
  "creek",
  "crew",
  "cricket",
  "crime",
  "crisp",
  "critic",
  "crop",
  "cross",
  "crouch",
  "crowd",
  "crucial",
  "cruel",
  "cruise",
  "crumble",
  "crunch",
  "crush",
  "cry",
  "crystal",
  "cube",
  "culture",
  "cup",
  "cupboard",
  "curious",
  "current",
  "curtain",
  "curve",
  "cushion",
  "custom",
  "cute",
  "cycle",
  "dad",
  "damage",
  "damp",
  "dance",
  "danger",
  "daring",
  "dash",
  "daughter",
  "dawn",
  "day",
  "deal",
  "debate",
  "debris",
  "decade",
  "december",
  "decide",
  "decline",
  "decorate",
  "decrease",
  "deer",
  "defense",
  "define",
  "defy",
  "degree",
  "delay",
  "deliver",
  "demand",
  "demise",
  "denial",
  "dentist",
  "deny",
  "depart",
  "depend",
  "deposit",
  "depth",
  "deputy",
  "derive",
  "describe",
  "desert",
  "design",
  "desk",
  "despair",
  "destroy",
  "detail",
  "detect",
  "develop",
  "device",
  "devote",
  "diagram",
  "dial",
  "diamond",
  "diary",
  "dice",
  "diesel",
  "diet",
  "differ",
  "digital",
  "dignity",
  "dilemma",
  "dinner",
  "dinosaur",
  "direct",
  "dirt",
  "disagree",
  "discover",
  "disease",
  "dish",
  "dismiss",
  "disorder",
  "display",
  "distance",
  "divert",
  "divide",
  "divorce",
  "dizzy",
  "doctor",
  "document",
  "dog",
  "doll",
  "dolphin",
  "domain",
  "donate",
  "donkey",
  "donor",
  "door",
  "dose",
  "double",
  "dove",
  "draft",
  "dragon",
  "drama",
  "drastic",
  "draw",
  "dream",
  "dress",
  "drift",
  "drill",
  "drink",
  "drip",
  "drive",
  "drop",
  "drum",
  "dry",
  "duck",
  "dumb",
  "dune",
  "during",
  "dust",
  "dutch",
  "duty",
  "dwarf",
  "dynamic",
  "eager",
  "eagle",
  "early",
  "earn",
  "earth",
  "easily",
  "east",
  "easy",
  "echo",
  "ecology",
  "economy",
  "edge",
  "edit",
  "educate",
  "effort",
  "egg",
  "eight",
  "either",
  "elbow",
  "elder",
  "electric",
  "elegant",
  "element",
  "elephant",
  "elevator",
  "elite",
  "else",
  "embark",
  "embody",
  "embrace",
  "emerge",
  "emotion",
  "employ",
  "empower",
  "empty",
  "enable",
  "enact",
  "end",
  "endless",
  "endorse",
  "enemy",
  "energy",
  "enforce",
  "engage",
  "engine",
  "enhance",
  "enjoy",
  "enlist",
  "enough",
  "enrich",
  "enroll",
  "ensure",
  "enter",
  "entire",
  "entry",
  "envelope",
  "episode",
  "equal",
  "equip",
  "era",
  "erase",
  "erode",
  "erosion",
  "error",
  "erupt",
  "escape",
  "essay",
  "essence",
  "estate",
  "eternal",
  "ethics",
  "evidence",
  "evil",
  "evoke",
  "evolve",
  "exact",
  "example",
  "excess",
  "exchange",
  "excite",
  "exclude",
  "excuse",
  "execute",
  "exercise",
  "exhaust",
  "exhibit",
  "exile",
  "exist",
  "exit",
  "exotic",
  "expand",
  "expect",
  "expire",
  "explain",
  "expose",
  "express",
  "extend",
  "extra",
  "eye",
  "eyebrow",
  "fabric",
  "face",
  "faculty",
  "fade",
  "faint",
  "faith",
  "fall",
  "false",
  "fame",
  "family",
  "famous",
  "fan",
  "fancy",
  "fantasy",
  "farm",
  "fashion",
  "fat",
  "fatal",
  "father",
  "fatigue",
  "fault",
  "favorite",
  "feature",
  "february",
  "federal",
  "fee",
  "feed",
  "feel",
  "female",
  "fence",
  "festival",
  "fetch",
  "fever",
  "few",
  "fiber",
  "fiction",
  "field",
  "figure",
  "file",
  "film",
  "filter",
  "final",
  "find",
  "fine",
  "finger",
  "finish",
  "fire",
  "firm",
  "first",
  "fiscal",
  "fish",
  "fit",
  "fitness",
  "fix",
  "flag",
  "flame",
  "flash",
  "flat",
  "flavor",
  "flee",
  "flight",
  "flip",
  "float",
  "flock",
  "floor",
  "flower",
  "fluid",
  "flush",
  "fly",
  "foam",
  "focus",
  "fog",
  "foil",
  "fold",
  "follow",
  "food",
  "foot",
  "force",
  "forest",
  "forget",
  "fork",
  "fortune",
  "forum",
  "forward",
  "fossil",
  "foster",
  "found",
  "fox",
  "fragile",
  "frame",
  "frequent",
  "fresh",
  "friend",
  "fringe",
  "frog",
  "front",
  "frost",
  "frown",
  "frozen",
  "fruit",
  "fuel",
  "fun",
  "funny",
  "furnace",
  "fury",
  "future",
  "gadget",
  "gain",
  "galaxy",
  "gallery",
  "game",
  "gap",
  "garage",
  "garbage",
  "garden",
  "garlic",
  "garment",
  "gas",
  "gasp",
  "gate",
  "gather",
  "gauge",
  "gaze",
  "general",
  "genius",
  "genre",
  "gentle",
  "genuine",
  "gesture",
  "ghost",
  "giant",
  "gift",
  "giggle",
  "ginger",
  "giraffe",
  "girl",
  "give",
  "glad",
  "glance",
  "glare",
  "glass",
  "glide",
  "glimpse",
  "globe",
  "gloom",
  "glory",
  "glove",
  "glow",
  "glue",
  "goat",
  "goddess",
  "gold",
  "good",
  "goose",
  "gorilla",
  "gospel",
  "gossip",
  "govern",
  "gown",
  "grab",
  "grace",
  "grain",
  "grant",
  "grape",
  "grass",
  "gravity",
  "great",
  "green",
  "grid",
  "grief",
  "grit",
  "grocery",
  "group",
  "grow",
  "grunt",
  "guard",
  "guess",
  "guide",
  "guilt",
  "guitar",
  "gun",
  "gym",
  "habit",
  "hair",
  "half",
  "hammer",
  "hamster",
  "hand",
  "happy",
  "harbor",
  "hard",
  "harsh",
  "harvest",
  "hat",
  "have",
  "hawk",
  "hazard",
  "head",
  "health",
  "heart",
  "heavy",
  "hedgehog",
  "height",
  "hello",
  "helmet",
  "help",
  "hen",
  "hero",
  "hidden",
  "high",
  "hill",
  "hint",
  "hip",
  "hire",
  "history",
  "hobby",
  "hockey",
  "hold",
  "hole",
  "holiday",
  "hollow",
  "home",
  "honey",
  "hood",
  "hope",
  "horn",
  "horror",
  "horse",
  "hospital",
  "host",
  "hotel",
  "hour",
  "hover",
  "hub",
  "huge",
  "human",
  "humble",
  "humor",
  "hundred",
  "hungry",
  "hunt",
  "hurdle",
  "hurry",
  "hurt",
  "husband",
  "hybrid",
  "ice",
  "icon",
  "idea",
  "identify",
  "idle",
  "ignore",
  "ill",
  "illegal",
  "illness",
  "image",
  "imitate",
  "immense",
  "immune",
  "impact",
  "impose",
  "improve",
  "impulse",
  "inch",
  "include",
  "income",
  "increase",
  "index",
  "indicate",
  "indoor",
  "industry",
  "infant",
  "inflict",
  "inform",
  "inhale",
  "inherit",
  "initial",
  "inject",
  "injury",
  "inmate",
  "inner",
  "innocent",
  "input",
  "inquiry",
  "insane",
  "insect",
  "inside",
  "inspire",
  "install",
  "intact",
  "interest",
  "into",
  "invest",
  "invite",
  "involve",
  "iron",
  "island",
  "isolate",
  "issue",
  "item",
  "ivory",
  "jacket",
  "jaguar",
  "jar",
  "jazz",
  "jealous",
  "jeans",
  "jelly",
  "jewel",
  "job",
  "join",
  "joke",
  "journey",
  "joy",
  "judge",
  "juice",
  "jump",
  "jungle",
  "junior",
  "junk",
  "just",
  "kangaroo",
  "keen",
  "keep",
  "ketchup",
  "key",
  "kick",
  "kid",
  "kidney",
  "kind",
  "kingdom",
  "kiss",
  "kit",
  "kitchen",
  "kite",
  "kitten",
  "kiwi",
  "knee",
  "knife",
  "knock",
  "know",
  "lab",
  "label",
  "labor",
  "ladder",
  "lady",
  "lake",
  "lamp",
  "language",
  "laptop",
  "large",
  "later",
  "latin",
  "laugh",
  "laundry",
  "lava",
  "law",
  "lawn",
  "lawsuit",
  "layer",
  "lazy",
  "leader",
  "leaf",
  "learn",
  "leave",
  "lecture",
  "left",
  "leg",
  "legal",
  "legend",
  "leisure",
  "lemon",
  "lend",
  "length",
  "lens",
  "leopard",
  "lesson",
  "letter",
  "level",
  "liar",
  "liberty",
  "library",
  "license",
  "life",
  "lift",
  "light",
  "like",
  "limb",
  "limit",
  "link",
  "lion",
  "liquid",
  "list",
  "little",
  "live",
  "lizard",
  "load",
  "loan",
  "lobster",
  "local",
  "lock",
  "logic",
  "lonely",
  "long",
  "loop",
  "lottery",
  "loud",
  "lounge",
  "love",
  "loyal",
  "lucky",
  "luggage",
  "lumber",
  "lunar",
  "lunch",
  "luxury",
  "lyrics",
  "machine",
  "mad",
  "magic",
  "magnet",
  "maid",
  "mail",
  "main",
  "major",
  "make",
  "mammal",
  "man",
  "manage",
  "mandate",
  "mango",
  "mansion",
  "manual",
  "maple",
  "marble",
  "march",
  "margin",
  "marine",
  "market",
  "marriage",
  "mask",
  "mass",
  "master",
  "match",
  "material",
  "math",
  "matrix",
  "matter",
  "maximum",
  "maze",
  "meadow",
  "mean",
  "measure",
  "meat",
  "mechanic",
  "medal",
  "media",
  "melody",
  "melt",
  "member",
  "memory",
  "mention",
  "menu",
  "mercy",
  "merge",
  "merit",
  "merry",
  "mesh",
  "message",
  "metal",
  "method",
  "middle",
  "midnight",
  "milk",
  "million",
  "mimic",
  "mind",
  "minimum",
  "minor",
  "minute",
  "miracle",
  "mirror",
  "misery",
  "miss",
  "mistake",
  "mix",
  "mixed",
  "mixture",
  "mobile",
  "model",
  "modify",
  "mom",
  "moment",
  "monitor",
  "monkey",
  "monster",
  "month",
  "moon",
  "moral",
  "more",
  "morning",
  "mosquito",
  "mother",
  "motion",
  "motor",
  "mountain",
  "mouse",
  "move",
  "movie",
  "much",
  "muffin",
  "mule",
  "multiply",
  "muscle",
  "museum",
  "mushroom",
  "music",
  "must",
  "mutual",
  "myself",
  "mystery",
  "myth",
  "naive",
  "name",
  "napkin",
  "narrow",
  "nasty",
  "nation",
  "nature",
  "near",
  "neck",
  "need",
  "negative",
  "neglect",
  "neither",
  "nephew",
  "nerve",
  "nest",
  "net",
  "network",
  "neutral",
  "never",
  "news",
  "next",
  "nice",
  "night",
  "noble",
  "noise",
  "nominee",
  "noodle",
  "normal",
  "north",
  "nose",
  "notable",
  "note",
  "nothing",
  "notice",
  "novel",
  "now",
  "nuclear",
  "number",
  "nurse",
  "nut",
  "oak",
  "obey",
  "object",
  "oblige",
  "obscure",
  "observe",
  "obtain",
  "obvious",
  "occur",
  "ocean",
  "october",
  "odor",
  "off",
  "offer",
  "office",
  "often",
  "oil",
  "okay",
  "old",
  "olive",
  "olympic",
  "omit",
  "once",
  "one",
  "onion",
  "online",
  "only",
  "open",
  "opera",
  "opinion",
  "oppose",
  "option",
  "orange",
  "orbit",
  "orchard",
  "order",
  "ordinary",
  "organ",
  "orient",
  "original",
  "orphan",
  "ostrich",
  "other",
  "outdoor",
  "outer",
  "output",
  "outside",
  "oval",
  "oven",
  "over",
  "own",
  "owner",
  "oxygen",
  "oyster",
  "ozone",
  "pact",
  "paddle",
  "page",
  "pair",
  "palace",
  "palm",
  "panda",
  "panel",
  "panic",
  "panther",
  "paper",
  "parade",
  "parent",
  "park",
  "parrot",
  "party",
  "pass",
  "patch",
  "path",
  "patient",
  "patrol",
  "pattern",
  "pause",
  "pave",
  "payment",
  "peace",
  "peanut",
  "pear",
  "peasant",
  "pelican",
  "pen",
  "penalty",
  "pencil",
  "people",
  "pepper",
  "perfect",
  "permit",
  "person",
  "pet",
  "phone",
  "photo",
  "phrase",
  "physical",
  "piano",
  "picnic",
  "picture",
  "piece",
  "pig",
  "pigeon",
  "pill",
  "pilot",
  "pink",
  "pioneer",
  "pipe",
  "pistol",
  "pitch",
  "pizza",
  "place",
  "planet",
  "plastic",
  "plate",
  "play",
  "please",
  "pledge",
  "pluck",
  "plug",
  "plunge",
  "poem",
  "poet",
  "point",
  "polar",
  "pole",
  "police",
  "pond",
  "pony",
  "pool",
  "popular",
  "portion",
  "position",
  "possible",
  "post",
  "potato",
  "pottery",
  "poverty",
  "powder",
  "power",
  "practice",
  "praise",
  "predict",
  "prefer",
  "prepare",
  "present",
  "pretty",
  "prevent",
  "price",
  "pride",
  "primary",
  "print",
  "priority",
  "prison",
  "private",
  "prize",
  "problem",
  "process",
  "produce",
  "profit",
  "program",
  "project",
  "promote",
  "proof",
  "property",
  "prosper",
  "protect",
  "proud",
  "provide",
  "public",
  "pudding",
  "pull",
  "pulp",
  "pulse",
  "pumpkin",
  "punch",
  "pupil",
  "puppy",
  "purchase",
  "purity",
  "purpose",
  "purse",
  "push",
  "put",
  "puzzle",
  "pyramid",
  "quality",
  "quantum",
  "quarter",
  "question",
  "quick",
  "quit",
  "quiz",
  "quote",
  "rabbit",
  "raccoon",
  "race",
  "rack",
  "radar",
  "radio",
  "rail",
  "rain",
  "raise",
  "rally",
  "ramp",
  "ranch",
  "random",
  "range",
  "rapid",
  "rare",
  "rate",
  "rather",
  "raven",
  "raw",
  "razor",
  "ready",
  "real",
  "reason",
  "rebel",
  "rebuild",
  "recall",
  "receive",
  "recipe",
  "record",
  "recycle",
  "reduce",
  "reflect",
  "reform",
  "refuse",
  "region",
  "regret",
  "regular",
  "reject",
  "relax",
  "release",
  "relief",
  "rely",
  "remain",
  "remember",
  "remind",
  "remove",
  "render",
  "renew",
  "rent",
  "reopen",
  "repair",
  "repeat",
  "replace",
  "report",
  "require",
  "rescue",
  "resemble",
  "resist",
  "resource",
  "response",
  "result",
  "retire",
  "retreat",
  "return",
  "reunion",
  "reveal",
  "review",
  "reward",
  "rhythm",
  "rib",
  "ribbon",
  "rice",
  "rich",
  "ride",
  "ridge",
  "rifle",
  "right",
  "rigid",
  "ring",
  "riot",
  "ripple",
  "risk",
  "ritual",
  "rival",
  "river",
  "road",
  "roast",
  "robot",
  "robust",
  "rocket",
  "romance",
  "roof",
  "rookie",
  "room",
  "rose",
  "rotate",
  "rough",
  "round",
  "route",
  "royal",
  "rubber",
  "rude",
  "rug",
  "rule",
  "run",
  "runway",
  "rural",
  "sad",
  "saddle",
  "sadness",
  "safe",
  "sail",
  "salad",
  "salmon",
  "salon",
  "salt",
  "salute",
  "same",
  "sample",
  "sand",
  "satisfy",
  "satoshi",
  "sauce",
  "sausage",
  "save",
  "say",
  "scale",
  "scan",
  "scare",
  "scatter",
  "scene",
  "scheme",
  "school",
  "science",
  "scissors",
  "scorpion",
  "scout",
  "scrap",
  "screen",
  "script",
  "scrub",
  "sea",
  "search",
  "season",
  "seat",
  "second",
  "secret",
  "section",
  "security",
  "seed",
  "seek",
  "segment",
  "select",
  "sell",
  "seminar",
  "senior",
  "sense",
  "sentence",
  "series",
  "service",
  "session",
  "settle",
  "setup",
  "seven",
  "shadow",
  "shaft",
  "shallow",
  "share",
  "shed",
  "shell",
  "sheriff",
  "shield",
  "shift",
  "shine",
  "ship",
  "shiver",
  "shock",
  "shoe",
  "shoot",
  "shop",
  "short",
  "shoulder",
  "shove",
  "shrimp",
  "shrug",
  "shuffle",
  "shy",
  "sibling",
  "sick",
  "side",
  "siege",
  "sight",
  "sign",
  "silent",
  "silk",
  "silly",
  "silver",
  "similar",
  "simple",
  "since",
  "sing",
  "siren",
  "sister",
  "situate",
  "six",
  "size",
  "skate",
  "sketch",
  "ski",
  "skill",
  "skin",
  "skirt",
  "skull",
  "slab",
  "slam",
  "sleep",
  "slender",
  "slice",
  "slide",
  "slight",
  "slim",
  "slogan",
  "slot",
  "slow",
  "slush",
  "small",
  "smart",
  "smile",
  "smoke",
  "smooth",
  "snack",
  "snake",
  "snap",
  "sniff",
  "snow",
  "soap",
  "soccer",
  "social",
  "sock",
  "soda",
  "soft",
  "solar",
  "soldier",
  "solid",
  "solution",
  "solve",
  "someone",
  "song",
  "soon",
  "sorry",
  "sort",
  "soul",
  "sound",
  "soup",
  "source",
  "south",
  "space",
  "spare",
  "spatial",
  "spawn",
  "speak",
  "special",
  "speed",
  "spell",
  "spend",
  "sphere",
  "spice",
  "spider",
  "spike",
  "spin",
  "spirit",
  "split",
  "spoil",
  "sponsor",
  "spoon",
  "sport",
  "spot",
  "spray",
  "spread",
  "spring",
  "spy",
  "square",
  "squeeze",
  "squirrel",
  "stable",
  "stadium",
  "staff",
  "stage",
  "stairs",
  "stamp",
  "stand",
  "start",
  "state",
  "stay",
  "steak",
  "steel",
  "stem",
  "step",
  "stereo",
  "stick",
  "still",
  "sting",
  "stock",
  "stomach",
  "stone",
  "stool",
  "story",
  "stove",
  "strategy",
  "street",
  "strike",
  "strong",
  "struggle",
  "student",
  "stuff",
  "stumble",
  "style",
  "subject",
  "submit",
  "subway",
  "success",
  "such",
  "sudden",
  "suffer",
  "sugar",
  "suggest",
  "suit",
  "summer",
  "sun",
  "sunny",
  "sunset",
  "super",
  "supply",
  "supreme",
  "sure",
  "surface",
  "surge",
  "surprise",
  "surround",
  "survey",
  "suspect",
  "sustain",
  "swallow",
  "swamp",
  "swap",
  "swarm",
  "swear",
  "sweet",
  "swift",
  "swim",
  "swing",
  "switch",
  "sword",
  "symbol",
  "symptom",
  "syrup",
  "system",
  "table",
  "tackle",
  "tag",
  "tail",
  "talent",
  "talk",
  "tank",
  "tape",
  "target",
  "task",
  "taste",
  "tattoo",
  "taxi",
  "teach",
  "team",
  "tell",
  "ten",
  "tenant",
  "tennis",
  "tent",
  "term",
  "test",
  "text",
  "thank",
  "that",
  "theme",
  "then",
  "theory",
  "there",
  "they",
  "thing",
  "this",
  "thought",
  "three",
  "thrive",
  "throw",
  "thumb",
  "thunder",
  "ticket",
  "tide",
  "tiger",
  "tilt",
  "timber",
  "time",
  "tiny",
  "tip",
  "tired",
  "tissue",
  "title",
  "toast",
  "tobacco",
  "today",
  "toddler",
  "toe",
  "together",
  "toilet",
  "token",
  "tomato",
  "tomorrow",
  "tone",
  "tongue",
  "tonight",
  "tool",
  "tooth",
  "top",
  "topic",
  "topple",
  "torch",
  "tornado",
  "tortoise",
  "toss",
  "total",
  "tourist",
  "toward",
  "tower",
  "town",
  "toy",
  "track",
  "trade",
  "traffic",
  "tragic",
  "train",
  "transfer",
  "trap",
  "trash",
  "travel",
  "tray",
  "treat",
  "tree",
  "trend",
  "trial",
  "tribe",
  "trick",
  "trigger",
  "trim",
  "trip",
  "trophy",
  "trouble",
  "truck",
  "true",
  "truly",
  "trumpet",
  "trust",
  "truth",
  "try",
  "tube",
  "tuition",
  "tumble",
  "tuna",
  "tunnel",
  "turkey",
  "turn",
  "turtle",
  "twelve",
  "twenty",
  "twice",
  "twin",
  "twist",
  "two",
  "type",
  "typical",
  "ugly",
  "umbrella",
  "unable",
  "unaware",
  "uncle",
  "uncover",
  "under",
  "undo",
  "unfair",
  "unfold",
  "unhappy",
  "uniform",
  "unique",
  "unit",
  "universe",
  "unknown",
  "unlock",
  "until",
  "unusual",
  "unveil",
  "update",
  "upgrade",
  "uphold",
  "upon",
  "upper",
  "upset",
  "urban",
  "urge",
  "usage",
  "use",
  "used",
  "useful",
  "useless",
  "usual",
  "utility",
  "vacant",
  "vacuum",
  "vague",
  "valid",
  "valley",
  "valve",
  "van",
  "vanish",
  "vapor",
  "various",
  "vast",
  "vault",
  "vehicle",
  "velvet",
  "vendor",
  "venture",
  "venue",
  "verb",
  "verify",
  "version",
  "very",
  "vessel",
  "veteran",
  "viable",
  "vibrant",
  "vicious",
  "victory",
  "video",
  "view",
  "village",
  "vintage",
  "violin",
  "virtual",
  "virus",
  "visa",
  "visit",
  "visual",
  "vital",
  "vivid",
  "vocal",
  "voice",
  "void",
  "volcano",
  "volume",
  "vote",
  "voyage",
  "wage",
  "wagon",
  "wait",
  "walk",
  "wall",
  "walnut",
  "want",
  "warfare",
  "warm",
  "warrior",
  "wash",
  "wasp",
  "waste",
  "water",
  "wave",
  "way",
  "wealth",
  "weapon",
  "wear",
  "weasel",
  "weather",
  "web",
  "wedding",
  "weekend",
  "weird",
  "welcome",
  "west",
  "wet",
  "whale",
  "what",
  "wheat",
  "wheel",
  "when",
  "where",
  "whip",
  "whisper",
  "wide",
  "width",
  "wife",
  "wild",
  "will",
  "win",
  "window",
  "wine",
  "wing",
  "wink",
  "winner",
  "winter",
  "wire",
  "wisdom",
  "wise",
  "wish",
  "witness",
  "wolf",
  "woman",
  "wonder",
  "wood",
  "wool",
  "word",
  "work",
  "world",
  "worry",
  "worth",
  "wrap",
  "wreck",
  "wrestle",
  "wrist",
  "write",
  "wrong",
  "yard",
  "year",
  "yellow",
  "you",
  "young",
  "youth",
  "zebra",
  "zero",
  "zone",
  "zoo"
];
Object.defineProperty(_wordlists, "__esModule", { value: true });
const wordlists = {};
_wordlists.wordlists = wordlists;
let _default;
var _default_1 = _wordlists._default = _default;
try {
  _default_1 = _wordlists._default = _default = require$$0;
  wordlists.czech = _default;
} catch (err) {
}
try {
  _default_1 = _wordlists._default = _default = require$$1;
  wordlists.chinese_simplified = _default;
} catch (err) {
}
try {
  _default_1 = _wordlists._default = _default = require$$2;
  wordlists.chinese_traditional = _default;
} catch (err) {
}
try {
  _default_1 = _wordlists._default = _default = require$$3;
  wordlists.korean = _default;
} catch (err) {
}
try {
  _default_1 = _wordlists._default = _default = require$$4;
  wordlists.french = _default;
} catch (err) {
}
try {
  _default_1 = _wordlists._default = _default = require$$5;
  wordlists.italian = _default;
} catch (err) {
}
try {
  _default_1 = _wordlists._default = _default = require$$6;
  wordlists.spanish = _default;
} catch (err) {
}
try {
  _default_1 = _wordlists._default = _default = require$$7;
  wordlists.japanese = _default;
  wordlists.JA = _default;
} catch (err) {
}
try {
  _default_1 = _wordlists._default = _default = require$$8;
  wordlists.portuguese = _default;
} catch (err) {
}
try {
  _default_1 = _wordlists._default = _default = require$$9;
  wordlists.english = _default;
  wordlists.EN = _default;
} catch (err) {
}
Object.defineProperty(src, "__esModule", { value: true });
const sha256_1 = sha256$3;
const sha512_1 = sha512$1;
const pbkdf2_1 = pbkdf2$1;
const utils_1 = utils$1;
const _wordlists_1 = _wordlists;
let DEFAULT_WORDLIST = _wordlists_1._default;
const INVALID_MNEMONIC = "Invalid mnemonic";
const INVALID_ENTROPY = "Invalid entropy";
const INVALID_CHECKSUM = "Invalid mnemonic checksum";
const WORDLIST_REQUIRED = "A wordlist is required but a default could not be found.\nPlease pass a 2048 word array explicitly.";
function normalize$1(str) {
  return (str || "").normalize("NFKD");
}
function lpad(str, padString, length) {
  while (str.length < length) {
    str = padString + str;
  }
  return str;
}
function binaryToByte(bin) {
  return parseInt(bin, 2);
}
function bytesToBinary(bytes) {
  return bytes.map((x) => lpad(x.toString(2), "0", 8)).join("");
}
function deriveChecksumBits(entropyBuffer) {
  const ENT = entropyBuffer.length * 8;
  const CS = ENT / 32;
  const hash = sha256_1.sha256(Uint8Array.from(entropyBuffer));
  return bytesToBinary(Array.from(hash)).slice(0, CS);
}
function salt(password) {
  return "mnemonic" + (password || "");
}
function mnemonicToSeedSync(mnemonic, password) {
  const mnemonicBuffer = Uint8Array.from(Buffer.from(normalize$1(mnemonic), "utf8"));
  const saltBuffer = Uint8Array.from(Buffer.from(salt(normalize$1(password)), "utf8"));
  const res = pbkdf2_1.pbkdf2(sha512_1.sha512, mnemonicBuffer, saltBuffer, {
    c: 2048,
    dkLen: 64
  });
  return Buffer.from(res);
}
var mnemonicToSeedSync_1 = src.mnemonicToSeedSync = mnemonicToSeedSync;
function mnemonicToSeed(mnemonic, password) {
  const mnemonicBuffer = Uint8Array.from(Buffer.from(normalize$1(mnemonic), "utf8"));
  const saltBuffer = Uint8Array.from(Buffer.from(salt(normalize$1(password)), "utf8"));
  return pbkdf2_1.pbkdf2Async(sha512_1.sha512, mnemonicBuffer, saltBuffer, {
    c: 2048,
    dkLen: 64
  }).then((res) => Buffer.from(res));
}
src.mnemonicToSeed = mnemonicToSeed;
function mnemonicToEntropy(mnemonic, wordlist) {
  wordlist = wordlist || DEFAULT_WORDLIST;
  if (!wordlist) {
    throw new Error(WORDLIST_REQUIRED);
  }
  const words = normalize$1(mnemonic).split(" ");
  if (words.length % 3 !== 0) {
    throw new Error(INVALID_MNEMONIC);
  }
  const bits = words.map((word) => {
    const index = wordlist.indexOf(word);
    if (index === -1) {
      throw new Error(INVALID_MNEMONIC);
    }
    return lpad(index.toString(2), "0", 11);
  }).join("");
  const dividerIndex = Math.floor(bits.length / 33) * 32;
  const entropyBits = bits.slice(0, dividerIndex);
  const checksumBits = bits.slice(dividerIndex);
  const entropyBytes = entropyBits.match(/(.{1,8})/g).map(binaryToByte);
  if (entropyBytes.length < 16) {
    throw new Error(INVALID_ENTROPY);
  }
  if (entropyBytes.length > 32) {
    throw new Error(INVALID_ENTROPY);
  }
  if (entropyBytes.length % 4 !== 0) {
    throw new Error(INVALID_ENTROPY);
  }
  const entropy = Buffer.from(entropyBytes);
  const newChecksum = deriveChecksumBits(entropy);
  if (newChecksum !== checksumBits) {
    throw new Error(INVALID_CHECKSUM);
  }
  return entropy.toString("hex");
}
src.mnemonicToEntropy = mnemonicToEntropy;
function entropyToMnemonic(entropy, wordlist) {
  if (!Buffer.isBuffer(entropy)) {
    if (entropy.length % 2 !== 0 || /[^0-9a-fA-F]/.test(entropy)) {
      throw new TypeError(INVALID_ENTROPY);
    }
    entropy = Buffer.from(entropy, "hex");
  }
  wordlist = wordlist || DEFAULT_WORDLIST;
  if (!wordlist) {
    throw new Error(WORDLIST_REQUIRED);
  }
  if (entropy.length < 16) {
    throw new TypeError(INVALID_ENTROPY);
  }
  if (entropy.length > 32) {
    throw new TypeError(INVALID_ENTROPY);
  }
  if (entropy.length % 4 !== 0) {
    throw new TypeError(INVALID_ENTROPY);
  }
  const entropyBits = bytesToBinary(Array.from(entropy));
  const checksumBits = deriveChecksumBits(entropy);
  const bits = entropyBits + checksumBits;
  const chunks = bits.match(/(.{1,11})/g);
  const words = chunks.map((binary) => {
    const index = binaryToByte(binary);
    return wordlist[index];
  });
  return wordlist[0] === "あいこくしん" ? words.join("　") : words.join(" ");
}
src.entropyToMnemonic = entropyToMnemonic;
function generateMnemonic$1(strength, rng, wordlist) {
  strength = strength || 128;
  if (strength % 32 !== 0) {
    throw new TypeError(INVALID_ENTROPY);
  }
  rng = rng || ((size) => Buffer.from(utils_1.randomBytes(size)));
  return entropyToMnemonic(rng(strength / 8), wordlist);
}
var generateMnemonic_1 = src.generateMnemonic = generateMnemonic$1;
function validateMnemonic(mnemonic, wordlist) {
  try {
    mnemonicToEntropy(mnemonic, wordlist);
  } catch (e) {
    return false;
  }
  return true;
}
var validateMnemonic_1 = src.validateMnemonic = validateMnemonic;
function setDefaultWordlist(language) {
  const result = Object.prototype.hasOwnProperty.call(_wordlists_1.wordlists, language) ? _wordlists_1.wordlists[language] : void 0;
  if (result) {
    DEFAULT_WORDLIST = result;
  } else {
    throw new Error('Could not find wordlist for language "' + language + '"');
  }
}
src.setDefaultWordlist = setDefaultWordlist;
function getDefaultWordlist() {
  if (!DEFAULT_WORDLIST) {
    throw new Error("No Default Wordlist set");
  }
  return Object.keys(_wordlists_1.wordlists).filter((lang) => {
    if (lang === "JA" || lang === "EN") {
      return false;
    }
    return _wordlists_1.wordlists[lang].every((word, index) => word === DEFAULT_WORDLIST[index]);
  })[0];
}
src.getDefaultWordlist = getDefaultWordlist;
var _wordlists_2 = _wordlists;
src.wordlists = _wordlists_2.wordlists;
const DEFAULT_NETWORK = "testnet";
const NETWORK_FILE = "network.json";
let currentNetwork = DEFAULT_NETWORK;
function isNetworkType(value) {
  return value === "mainnet" || value === "testnet";
}
function getNetwork() {
  return currentNetwork;
}
function networkFilePath() {
  return path.join(electron.app.getPath("userData"), NETWORK_FILE);
}
async function loadNetwork() {
  try {
    const raw = await fs.readFile(networkFilePath(), "utf8");
    const parsed = JSON.parse(raw);
    currentNetwork = isNetworkType(parsed.network) ? parsed.network : DEFAULT_NETWORK;
  } catch {
    currentNetwork = DEFAULT_NETWORK;
  }
  return currentNetwork;
}
async function setNetwork(network) {
  if (!isNetworkType(network)) {
    throw new Error(`不支持的网络环境：${String(network)}`);
  }
  currentNetwork = network;
  try {
    await fs.writeFile(networkFilePath(), JSON.stringify({ network }), "utf8");
  } catch (err) {
    console.error("[network] 持久化网络环境失败:", err);
  }
  return currentNetwork;
}
const DEFAULT_LOCALE = "zh";
const zh = {
  // —— 通用 ——
  "common.cancel": "取消",
  "common.close": "关闭",
  "common.back": "上一步",
  "common.next": "下一步",
  "common.continue": "继续",
  "common.settings": "设置",
  "common.send": "发送",
  "common.password": "密码",
  "common.confirmPassword": "确认密码",
  "common.passwordPlaceholder": "请输入密码",
  "common.confirmPasswordPlaceholder": "请再次输入密码",
  "common.selectAccount": "选择账户",
  "common.account": "账户",
  "common.asset": "资产",
  "common.balance": "余额",
  "common.priceUsd": "价格（USD）",
  "common.valueUsd": "估值（USD）",
  "common.action": "操作",
  "common.noData": "暂无资产",
  // —— 顶栏 ——
  "header.notLoggedIn": "未登录",
  // —— 左侧菜单 ——
  "menu.overview": "总览",
  // —— 网络环境 ——
  "network.env": "网络环境",
  "network.mainnet": "主网",
  "network.testnet": "测试网",
  "network.mainnetDesc": "Ethereum / Avalanche / Bitcoin / Solana",
  "network.testnetDesc": "Sepolia / Fuji / Bitcoin Testnet / Devnet",
  "network.currentMainnet": "当前为主网",
  "network.mainnetWarning": "所有转账使用真实资金，且不可撤销。",
  "network.switchTitle": "切换到主网？",
  "network.switchContent": "主网使用真实资金，交易一旦广播不可撤销。请确认已核对地址与网络。",
  "network.confirmSwitch": "确认切换",
  "network.switched": "已切换到{label}",
  "network.switchFailed": "切换网络失败",
  // —— 语言 ——
  "locale.language": "语言",
  "locale.zh": "中文",
  "locale.en": "English",
  "locale.switched": "已切换为{label}",
  // —— 设置 ——
  "settings.title": "设置",
  "settings.backup": "备份",
  "settings.about": "关于",
  "settings.notImplemented": "{name} 功能暂未实现",
  // —— 备份 ——
  "backup.title": "备份助记词",
  "backup.confirm": "确认备份",
  "backup.enterPasswordTitle": "请输入该账户的密码",
  "backup.enterPasswordDesc": "密码用于解密数据库中保存的助记词密文，验证通过后会显示明文助记词。",
  "backup.noBackable": "暂无可备份的账户，请先创建账户。",
  "backup.noSecret": "（无备份数据）",
  "backup.saveTitle": "请您保存好助记词",
  "backup.saveDesc": "以下是解密后的明文助记词，请勿截图或通过网络发送；关闭弹窗后不会保留。",
  // —— 解锁 ——
  "unlock.title": "解锁钱包",
  "unlock.action": "解锁",
  "unlock.enterPasswordTitle": "请输入该账户的密码",
  "unlock.enterPasswordDesc": "密码用于解密本机保存的助记词，验证通过后会派生 ETH 账户并展示在界面上。",
  "unlock.success": "解锁成功，ETH 账户：{address}",
  // —— 启动流程 ——
  "startup.welcome": "欢迎使用 HCoinWallet",
  "startup.noMnemonic": "本机尚未检测到助记词，请选择一种方式开始：",
  "startup.createNew": "创建新的助记词",
  "startup.importExisting": "导入已有助记词",
  "startup.slogan": "安全 · 自托管 · 助记词只保存在本机",
  "startup.status.checking": "正在检查本地钱包数据…",
  "startup.status.choose": "未检测到助记词，请选择创建或导入",
  "startup.status.create": "正在创建新的助记词钱包…",
  "startup.status.import": "正在导入已有助记词…",
  "startup.status.unlock": "已检测到助记词，请输入密码解锁",
  "startup.status.ready": "",
  // —— 创建钱包 ——
  "create.title": "创建钱包 · {step}",
  "create.stepMnemonic": "生成助记词",
  "create.stepVerify": "校验助记词",
  "create.stepPassword": "设置密码",
  "create.welcomeDesc": "本机尚未创建助记词，请先完成下方步骤创建钱包。助记词将加密保存在本机数据库中。",
  "create.saveTitle": "请您保存好助记词",
  "create.saveDesc": "助记词是恢复该账户的唯一凭证。请按顺序抄写并离线保管，切勿截图或通过网络发送；一旦丢失将无法找回。",
  "create.emptyMnemonic": "暂无助记词，请稍候或重新打开弹窗。",
  "create.verifyTitle": "请回填对应序号的助记词",
  "create.verifyDesc": "为确保您已备份助记词，请按顺序输入下列序号对应的单词。",
  "create.wordIndex": "第 {index} 个助记词",
  "create.wordPlaceholder": "请输入对应单词",
  "create.wordWrong": "单词不正确，请核对后重试",
  "create.setPasswordTitle": "请设置账户密码",
  "create.setPasswordDesc": "密码用于加密保存助记词，至少 8 位，需包含数字、字母与特殊字符，且至少包含 1 个大写字母和 1 个特殊字符。",
  "create.confirm": "确认创建",
  "create.success": "账户创建成功，ETH 账户：{address}",
  // —— 导入钱包 ——
  "import.titlePhrase": "导入助记词 · 输入助记词",
  "import.titlePassword": "导入助记词 · 设置密码",
  "import.enterPhraseTitle": "请输入您的助记词",
  "import.enterPhraseDesc": "按原有顺序输入 12 个英文助记词，用空格分隔，也可直接整段粘贴。助记词仅在本机加密保存。",
  "import.mnemonic": "助记词",
  "import.phrasePlaceholder": "例如：apple banana cat ...（共 12 个单词）",
  "import.wordCount": "已输入 {current} / {total} 个",
  "import.countError": "助记词数量应为 {total} 个，请检查后重试。",
  "import.setPasswordDesc": "密码用于加密保存导入的助记词，至少 8 位，需包含数字、字母与特殊字符，且至少包含 1 个大写字母和 1 个特殊字符。",
  "import.confirm": "确认导入",
  "import.success": "导入成功，ETH 账户：{address}",
  // —— 密码规则 ——
  "password.minLength": "至少 8 位",
  "password.needDigit": "至少包含一个数字",
  "password.needLetter": "至少包含一个字母",
  "password.needUpper": "至少包含一个大写字母",
  "password.needSpecial": "至少包含一个特殊字符",
  "password.valid": "密码符合要求",
  "password.mismatch": "两次输入的密码不一致",
  // —— 总览 ——
  "overview.chain": "链",
  "overview.totalTitle": "资产总额（USD）",
  "overview.priceSource": "价格来源：CoinGecko · 更新于 {time}",
  "overview.priceFallback": "价格来源：CoinGecko · 暂用兜底价格",
  // —— 单链内容区 ——
  "content.accountTitle": "{symbol} 账户",
  "content.lockedHint": "钱包未解锁，请先解锁后查看 {symbol} 账户信息。",
  "content.addressLabel": "{symbol} 地址",
  "content.network": "网络",
  "content.derivationPath": "派生路径",
  "content.walletAccount": "钱包账户",
  "content.subtotal": "小计（USD）",
  // —— 发送 ——
  "send.title": "发送",
  "send.confirm": "确认发送",
  "send.submitted": "交易已提交",
  "send.broadcast": "交易已广播到 {chain} {network}，等待打包确认。",
  "send.viewExplorer": "在区块浏览器中查看",
  "send.from": "发送方（From）",
  "send.to": "接收地址",
  "send.amount": "数量",
  "send.available": "可用：{amount} {asset}",
  "send.amountPlaceholder": "请输入发送的 {asset} 数量",
  "send.mainnetAlertTitle": "{symbol} 为主网，使用真实资金",
  "send.mainnetAlertDesc": "交易一旦广播不可撤销，请务必核对接收地址与数量。",
  // —— 右侧广告位 ——
  "right.ad": "广告",
  "right.sponsor": "AD · 赞助商位置",
  "right.ad1Title": "HCoin 理财",
  "right.ad1Desc": "稳健收益，年化 8%",
  "right.ad2Title": "邀请好友",
  "right.ad2Desc": "双方各得 10 HCoin",
  "right.ad3Title": "安全中心",
  "right.ad3Desc": "开启二次验证",
  // —— 关于（主进程分区数据） ——
  "about.name": "钱包名称",
  "about.network": "网络环境",
  "about.version": "客户端版本",
  "about.storage": "数据存储",
  "about.totalAccounts": "共 {count} 个账户",
  // —— 渲染进程错误提示 ——
  "err.envBackup": "当前环境不支持备份（未检测到 Electron 接口）",
  "err.envUnlock": "当前环境不支持解锁（未检测到 Electron 接口）",
  "err.envSend": "当前环境不支持发送（未检测到 Electron 接口）",
  "err.envCreate": "当前环境不支持创建账户（未检测到 Electron 接口）",
  "err.envImport": "当前环境不支持导入（未检测到 Electron 接口）",
  "err.selectBackupAccount": "请选择要备份的账户",
  "err.selectUnlockAccount": "请选择要解锁的账户",
  "err.enterPassword": "请输入密码",
  "err.backupFailed": "备份失败",
  "err.loadAccountsFailed": "读取账户列表失败",
  "err.unlockFailed": "解锁失败",
  "err.startupCheckFailed": "启动检测失败",
  "err.sendFailed": "发送失败",
  "err.unlockFirst": "请先解锁钱包",
  "err.createFailed": "创建账户失败",
  "err.importFailed": "导入失败",
  "err.mnemonicGenerateFailed": "助记词生成失败",
  "err.passwordInvalid": "密码不符合要求",
  "err.checkPhraseAndPassword": "请检查助记词与密码",
  "err.mnemonicInvalidInput": "助记词不合法，请检查单词拼写与顺序",
  "err.mnemonicCheckFailed": "助记词校验失败",
  "err.wordCountMismatch": "请输入 {total} 个助记词，当前 {current} 个",
  // —— 主进程错误提示 ——
  "err.dbNotReady": "数据库尚未就绪，请稍后重试",
  "err.invalidMnemonic": "助记词不合法",
  "err.deriveMnemonicInvalid": "助记词不合法，无法派生 ETH 账户",
  "err.passwordRequired": "密码不能为空",
  "err.accountExists": "该账户已存在",
  "err.accountNotFound": "账户不存在",
  "err.noSecret": "该账户没有可用于备份的加密助记词",
  "err.wrongPassword": "密码错误，无法解密助记词",
  "err.chainNotSupported": "不支持的链：{key}",
  "err.notEvmChain": "链 {name} 不是 EVM 链",
  "err.tokenNotSupported": "链 {name} 不支持代币：{symbol}",
  "err.assetNotSupported": "链 {name} 不支持资产：{asset}",
  "err.btcDeriveFailed": "BTC 账户派生失败",
  "err.btcAddressFailed": "BTC 地址生成失败",
  "err.btcAddressInvalid": "无效的 BTC 收款地址",
  "err.btcApiFailed": "BTC API 请求失败：{status} {statusText}",
  "err.broadcastFailed": "广播失败：{status} {detail}",
  "err.amountFormat": "发送数量格式不正确",
  "err.amountPositive": "请输入有效的发送数量",
  "err.enterRecipient": "请输入接收地址",
  "err.noUtxo": "可用余额为 0，无法发送",
  "err.insufficient": "余额不足以支付发送数量与手续费",
  "err.solAddressInvalid": "无效的 Solana 收款地址",
  "err.walletLocked": "钱包未解锁，无法发送",
  "err.accountMismatch": "当前解锁账户与发送账户不一致"
};
const en = {
  // —— 通用 ——
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.back": "Back",
  "common.next": "Next",
  "common.continue": "Continue",
  "common.settings": "Settings",
  "common.send": "Send",
  "common.password": "Password",
  "common.confirmPassword": "Confirm password",
  "common.passwordPlaceholder": "Enter password",
  "common.confirmPasswordPlaceholder": "Re-enter password",
  "common.selectAccount": "Select account",
  "common.account": "Account",
  "common.asset": "Asset",
  "common.balance": "Balance",
  "common.priceUsd": "Price (USD)",
  "common.valueUsd": "Value (USD)",
  "common.action": "Action",
  "common.noData": "No assets",
  // —— 顶栏 ——
  "header.notLoggedIn": "Not signed in",
  // —— 左侧菜单 ——
  "menu.overview": "Overview",
  // —— 网络环境 ——
  "network.env": "Network",
  "network.mainnet": "Mainnet",
  "network.testnet": "Testnet",
  "network.mainnetDesc": "Ethereum / Avalanche / Bitcoin / Solana",
  "network.testnetDesc": "Sepolia / Fuji / Bitcoin Testnet / Devnet",
  "network.currentMainnet": "Currently on mainnet",
  "network.mainnetWarning": "All transfers use real funds and cannot be reversed.",
  "network.switchTitle": "Switch to mainnet?",
  "network.switchContent": "Mainnet uses real funds and transactions cannot be reversed once broadcast. Please double-check the address and network.",
  "network.confirmSwitch": "Confirm",
  "network.switched": "Switched to {label}",
  "network.switchFailed": "Failed to switch network",
  // —— 语言 ——
  "locale.language": "Language",
  "locale.zh": "中文",
  "locale.en": "English",
  "locale.switched": "Language switched to {label}",
  // —— 设置 ——
  "settings.title": "Settings",
  "settings.backup": "Backup",
  "settings.about": "About",
  "settings.notImplemented": "{name} is not available yet",
  // —— 备份 ——
  "backup.title": "Back up recovery phrase",
  "backup.confirm": "Confirm",
  "backup.enterPasswordTitle": "Enter the password for this account",
  "backup.enterPasswordDesc": "The password decrypts the recovery phrase stored locally. The phrase will be shown once it checks out.",
  "backup.noBackable": "No account available for backup. Please create one first.",
  "backup.noSecret": "(no backup data)",
  "backup.saveTitle": "Keep your recovery phrase safe",
  "backup.saveDesc": "This is the decrypted recovery phrase. Do not screenshot it or send it online; it is cleared when this dialog closes.",
  // —— 解锁 ——
  "unlock.title": "Unlock wallet",
  "unlock.action": "Unlock",
  "unlock.enterPasswordTitle": "Enter the password for this account",
  "unlock.enterPasswordDesc": "The password decrypts the locally stored recovery phrase, after which the ETH account is derived and shown.",
  "unlock.success": "Unlocked. ETH account: {address}",
  // —— 启动流程 ——
  "startup.welcome": "Welcome to HCoinWallet",
  "startup.noMnemonic": "No recovery phrase found on this device. Choose how to start:",
  "startup.createNew": "Create a new recovery phrase",
  "startup.importExisting": "Import an existing recovery phrase",
  "startup.slogan": "Secure · Self-custody · Seed phrase stays on this device",
  "startup.status.checking": "Checking local wallet data…",
  "startup.status.choose": "No recovery phrase found, please create or import one",
  "startup.status.create": "Creating a new wallet…",
  "startup.status.import": "Importing your recovery phrase…",
  "startup.status.unlock": "Recovery phrase found, please enter your password",
  "startup.status.ready": "",
  // —— 创建钱包 ——
  "create.title": "Create wallet · {step}",
  "create.stepMnemonic": "Generate phrase",
  "create.stepVerify": "Verify phrase",
  "create.stepPassword": "Set password",
  "create.welcomeDesc": "No recovery phrase exists on this device yet. Finish the steps below to create a wallet; the phrase is encrypted and stored locally.",
  "create.saveTitle": "Keep your recovery phrase safe",
  "create.saveDesc": "The phrase is the only way to recover this account. Write it down in order and store it offline. Never screenshot it or send it online — once lost, it cannot be recovered.",
  "create.emptyMnemonic": "No phrase yet, please wait or reopen this dialog.",
  "create.verifyTitle": "Enter the words for the numbered slots",
  "create.verifyDesc": "To confirm your backup, enter the words matching the numbers below.",
  "create.wordIndex": "Word #{index}",
  "create.wordPlaceholder": "Enter the word",
  "create.wordWrong": "Incorrect word, please check and retry",
  "create.setPasswordTitle": "Set an account password",
  "create.setPasswordDesc": "The password encrypts the recovery phrase. It must be at least 8 characters and include digits, letters, at least one uppercase letter and one special character.",
  "create.confirm": "Create",
  "create.success": "Account created. ETH account: {address}",
  // —— 导入钱包 ——
  "import.titlePhrase": "Import phrase · Enter phrase",
  "import.titlePassword": "Import phrase · Set password",
  "import.enterPhraseTitle": "Enter your recovery phrase",
  "import.enterPhraseDesc": "Enter the 12 English words in the original order, separated by spaces, or paste the whole phrase. It is only encrypted and stored on this device.",
  "import.mnemonic": "Recovery phrase",
  "import.phrasePlaceholder": "e.g. apple banana cat ... (12 words)",
  "import.wordCount": "{current} / {total} entered",
  "import.countError": "The phrase must contain {total} words. Please check and retry.",
  "import.setPasswordDesc": "The password encrypts the imported recovery phrase. It must be at least 8 characters and include digits, letters, at least one uppercase letter and one special character.",
  "import.confirm": "Import",
  "import.success": "Imported. ETH account: {address}",
  // —— 密码规则 ——
  "password.minLength": "At least 8 characters",
  "password.needDigit": "Must contain a digit",
  "password.needLetter": "Must contain a letter",
  "password.needUpper": "Must contain an uppercase letter",
  "password.needSpecial": "Must contain a special character",
  "password.valid": "Password meets the requirements",
  "password.mismatch": "Passwords do not match",
  // —— 总览 ——
  "overview.chain": "Chain",
  "overview.totalTitle": "Total value (USD)",
  "overview.priceSource": "Prices from CoinGecko · updated at {time}",
  "overview.priceFallback": "Prices from CoinGecko · fallback prices",
  // —— 单链内容区 ——
  "content.accountTitle": "{symbol} account",
  "content.lockedHint": "Wallet is locked. Unlock it to view the {symbol} account.",
  "content.addressLabel": "{symbol} address",
  "content.network": "Network",
  "content.derivationPath": "Derivation path",
  "content.walletAccount": "Wallet account",
  "content.subtotal": "Subtotal (USD)",
  // —— 发送 ——
  "send.title": "Send",
  "send.confirm": "Confirm",
  "send.submitted": "Transaction submitted",
  "send.broadcast": "Broadcast to {chain} {network}, waiting for confirmation.",
  "send.viewExplorer": "View on block explorer",
  "send.from": "From",
  "send.to": "Recipient address",
  "send.amount": "Amount",
  "send.available": "Available: {amount} {asset}",
  "send.amountPlaceholder": "Enter the {asset} amount to send",
  "send.mainnetAlertTitle": "{symbol} is on mainnet and uses real funds",
  "send.mainnetAlertDesc": "Transactions cannot be reversed once broadcast. Please verify the recipient address and amount.",
  // —— 右侧广告位 ——
  "right.ad": "Ad",
  "right.sponsor": "AD · Sponsored",
  "right.ad1Title": "HCoin Earn",
  "right.ad1Desc": "Steady returns, 8% APY",
  "right.ad2Title": "Refer friends",
  "right.ad2Desc": "Both get 10 HCoin",
  "right.ad3Title": "Security center",
  "right.ad3Desc": "Enable two-factor authentication",
  // —— 关于（主进程分区数据） ——
  "about.name": "Wallet name",
  "about.network": "Network",
  "about.version": "Client version",
  "about.storage": "Storage",
  "about.totalAccounts": "{count} accounts",
  // —— 渲染进程错误提示 ——
  "err.envBackup": "Backup is unavailable (no Electron interface detected)",
  "err.envUnlock": "Unlock is unavailable (no Electron interface detected)",
  "err.envSend": "Sending is unavailable (no Electron interface detected)",
  "err.envCreate": "Account creation is unavailable (no Electron interface detected)",
  "err.envImport": "Import is unavailable (no Electron interface detected)",
  "err.selectBackupAccount": "Select the account to back up",
  "err.selectUnlockAccount": "Select the account to unlock",
  "err.enterPassword": "Enter your password",
  "err.backupFailed": "Backup failed",
  "err.loadAccountsFailed": "Failed to load the account list",
  "err.unlockFailed": "Unlock failed",
  "err.startupCheckFailed": "Startup check failed",
  "err.sendFailed": "Transaction failed",
  "err.unlockFirst": "Please unlock the wallet first",
  "err.createFailed": "Failed to create the account",
  "err.importFailed": "Import failed",
  "err.mnemonicGenerateFailed": "Failed to generate the recovery phrase",
  "err.passwordInvalid": "Password does not meet the requirements",
  "err.checkPhraseAndPassword": "Please check the recovery phrase and password",
  "err.mnemonicInvalidInput": "Invalid recovery phrase, please check the words and their order",
  "err.mnemonicCheckFailed": "Failed to validate the recovery phrase",
  "err.wordCountMismatch": "Enter {total} words, currently {current}",
  // —— 主进程错误提示 ——
  "err.dbNotReady": "Database is not ready, please try again later",
  "err.invalidMnemonic": "Invalid recovery phrase",
  "err.deriveMnemonicInvalid": "Invalid recovery phrase, cannot derive the ETH account",
  "err.passwordRequired": "Password is required",
  "err.accountExists": "This account already exists",
  "err.accountNotFound": "Account not found",
  "err.noSecret": "This account has no encrypted recovery phrase to back up",
  "err.wrongPassword": "Wrong password, cannot decrypt the recovery phrase",
  "err.chainNotSupported": "Unsupported chain: {key}",
  "err.notEvmChain": "{name} is not an EVM chain",
  "err.tokenNotSupported": "{name} does not support token: {symbol}",
  "err.assetNotSupported": "{name} does not support asset: {asset}",
  "err.btcDeriveFailed": "Failed to derive the BTC account",
  "err.btcAddressFailed": "Failed to generate the BTC address",
  "err.btcAddressInvalid": "Invalid BTC recipient address",
  "err.btcApiFailed": "BTC API request failed: {status} {statusText}",
  "err.broadcastFailed": "Broadcast failed: {status} {detail}",
  "err.amountFormat": "Invalid amount format",
  "err.amountPositive": "Enter a valid amount",
  "err.enterRecipient": "Enter the recipient address",
  "err.noUtxo": "Available balance is 0, nothing to send",
  "err.insufficient": "Insufficient balance for the amount and fee",
  "err.solAddressInvalid": "Invalid Solana recipient address",
  "err.walletLocked": "Wallet is locked, cannot send",
  "err.accountMismatch": "The unlocked account does not match the sender"
};
const MESSAGES = { zh, en };
function format(template, params) {
  if (!params) return template;
  return template.replace(
    /\{(\w+)\}/g,
    (match2, name) => Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match2
  );
}
function translate(locale, key, params) {
  const dict2 = MESSAGES[locale] ?? MESSAGES.zh;
  return format(dict2[key] ?? MESSAGES.zh[key], params);
}
function isLocale(value) {
  return value === "zh" || value === "en";
}
const LOCALE_FILE = "locale.json";
let currentLocale = DEFAULT_LOCALE;
function getLocale() {
  return currentLocale;
}
function localeFilePath() {
  return path.join(electron.app.getPath("userData"), LOCALE_FILE);
}
async function loadLocale() {
  try {
    const raw = await fs.readFile(localeFilePath(), "utf8");
    const parsed = JSON.parse(raw);
    currentLocale = isLocale(parsed.locale) ? parsed.locale : DEFAULT_LOCALE;
  } catch {
    currentLocale = DEFAULT_LOCALE;
  }
  return currentLocale;
}
async function setLocale(locale) {
  if (!isLocale(locale)) {
    throw new Error(`不支持的语言：${String(locale)}`);
  }
  currentLocale = locale;
  try {
    await fs.writeFile(localeFilePath(), JSON.stringify({ locale }), "utf8");
  } catch (err) {
    console.error("[locale] 持久化语言失败:", err);
  }
  return currentLocale;
}
function t(key, params) {
  return translate(currentLocale, key, params);
}
const ETH_DERIVE_PATH = "m/44'/60'/0'/0/0";
const CHAIN_DEFS = [
  {
    key: "eth",
    kind: "evm",
    nativeSymbol: "ETH",
    networks: {
      mainnet: {
        name: "Ethereum",
        rpcUrl: process.env.ETH_MAINNET_RPC_URL ?? "https://ethereum-rpc.publicnode.com",
        explorerTxUrl: "https://etherscan.io/tx/",
        tokens: [
          { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
          { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 }
        ]
      },
      testnet: {
        name: "Sepolia",
        rpcUrl: process.env.ETH_TESTNET_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com",
        explorerTxUrl: "https://sepolia.etherscan.io/tx/",
        tokens: [
          { symbol: "USDT", address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0", decimals: 6 },
          { symbol: "USDC", address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", decimals: 6 }
        ]
      }
    }
  },
  {
    key: "avax",
    kind: "evm",
    nativeSymbol: "AVAX",
    networks: {
      mainnet: {
        name: "Avalanche",
        rpcUrl: process.env.AVAX_MAINNET_RPC_URL ?? "https://avalanche-c-chain-rpc.publicnode.com",
        explorerTxUrl: "https://snowtrace.io/tx/",
        tokens: [
          { symbol: "USDT", address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", decimals: 6 },
          { symbol: "USDC", address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6 }
        ]
      },
      testnet: {
        name: "Fuji",
        rpcUrl: process.env.AVAX_TESTNET_RPC_URL ?? "https://api.avax-test.network/ext/bc/C/rpc",
        explorerTxUrl: "https://testnet.snowtrace.io/tx/",
        tokens: [
          { symbol: "USDT", address: "0xAb231A5744C8E6c45481754928cCfFFFD4aa0732", decimals: 6 },
          { symbol: "USDC", address: "0x5425890298aed601595a70AB815c96711a31Bc65", decimals: 6 }
        ]
      }
    }
  },
  {
    key: "btc",
    kind: "bitcoin",
    nativeSymbol: "BTC",
    networks: {
      mainnet: { name: "Bitcoin", explorerTxUrl: "https://mempool.space/tx/", tokens: [] },
      testnet: {
        name: "Bitcoin Testnet",
        explorerTxUrl: "https://mempool.space/testnet/tx/",
        tokens: []
      }
    }
  },
  {
    key: "sol",
    kind: "solana",
    nativeSymbol: "SOL",
    networks: {
      mainnet: { name: "Solana", explorerTxUrl: "https://explorer.solana.com/tx/", tokens: [] },
      testnet: {
        name: "Solana Devnet",
        explorerTxUrl: "https://explorer.solana.com/tx/",
        explorerTxSuffix: "?cluster=devnet",
        tokens: []
      }
    }
  }
];
function buildChainConfig(def2, network) {
  const base = {
    key: def2.key,
    nativeSymbol: def2.nativeSymbol,
    name: def2.networks[network].name,
    explorerTxUrl: def2.networks[network].explorerTxUrl,
    explorerTxSuffix: def2.networks[network].explorerTxSuffix
  };
  switch (def2.kind) {
    case "evm": {
      const net = def2.networks[network];
      return { ...base, kind: "evm", rpcUrl: net.rpcUrl, tokens: net.tokens };
    }
    case "bitcoin":
      return { ...base, kind: "bitcoin", tokens: [] };
    case "solana":
      return { ...base, kind: "solana", tokens: [] };
  }
}
function getSupportedChains(network = getNetwork()) {
  return CHAIN_DEFS.map((def2) => buildChainConfig(def2, network));
}
function getChain(chainKey, network = getNetwork()) {
  const chain2 = getSupportedChains(network).find((c) => c.key === chainKey);
  if (!chain2) throw new Error(t("err.chainNotSupported", { key: chainKey }));
  return chain2;
}
function getEvmChain(chainKey, network = getNetwork()) {
  const chain2 = getChain(chainKey, network);
  if (chain2.kind !== "evm") throw new Error(t("err.notEvmChain", { name: chain2.name }));
  return chain2;
}
function getToken(chain2, symbol) {
  const token = chain2.tokens.find((t2) => t2.symbol === symbol);
  if (!token) throw new Error(t("err.tokenNotSupported", { name: chain2.name, symbol }));
  return token;
}
const providers = /* @__PURE__ */ new Map();
function getProvider(chain2, network = getNetwork()) {
  const cacheKey = `${network}:${chain2.key}`;
  let provider = providers.get(cacheKey);
  if (!provider) {
    provider = new ethers.JsonRpcProvider(chain2.rpcUrl, void 0, { staticNetwork: true });
    providers.set(cacheKey, provider);
  }
  return provider;
}
function resetChainProviders() {
  for (const provider of providers.values()) {
    provider.destroy();
  }
  providers.clear();
}
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];
function deriveWallet(mnemonic) {
  const phrase = mnemonic.trim().toLowerCase();
  if (!ethers.Mnemonic.isValidMnemonic(phrase)) {
    throw new Error(t("err.deriveMnemonicInvalid"));
  }
  return ethers.HDNodeWallet.fromPhrase(phrase, void 0, ETH_DERIVE_PATH);
}
function deriveEthAccount(mnemonic) {
  const wallet = deriveWallet(mnemonic);
  return {
    address: wallet.address,
    publicKey: wallet.publicKey,
    path: ETH_DERIVE_PATH,
    privateKey: wallet.privateKey
  };
}
async function fetchNativeBalance(chainKey, address) {
  const chain2 = getEvmChain(chainKey);
  const wei = await getProvider(chain2).getBalance(address);
  return Number(ethers.formatEther(wei));
}
async function fetchChainTokenBalance(chainKey, owner, symbol) {
  const chain2 = getEvmChain(chainKey);
  const token = getToken(chain2, symbol);
  const contract = new ethers.Contract(token.address, ERC20_ABI, getProvider(chain2));
  const raw = await contract.balanceOf(owner);
  return Number(ethers.formatUnits(raw, token.decimals));
}
async function sendNative(chainKey, wallet, to, amount) {
  const chain2 = getEvmChain(chainKey);
  const signer = wallet.connect(getProvider(chain2));
  const tx = await signer.sendTransaction({
    to: ethers.getAddress(to),
    value: ethers.parseEther(amount)
  });
  return tx.hash;
}
async function sendChainToken(chainKey, wallet, symbol, to, amount) {
  const chain2 = getEvmChain(chainKey);
  const token = getToken(chain2, symbol);
  const signer = wallet.connect(getProvider(chain2));
  const contract = new ethers.Contract(token.address, ERC20_ABI, signer);
  const tx = await contract.transfer(ethers.getAddress(to), ethers.parseUnits(amount, token.decimals));
  return tx.hash;
}
const U32_MASK64 = /* @__PURE__ */ (() => BigInt(2 ** 32 - 1))();
const _32n = /* @__PURE__ */ BigInt(32);
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
const fromNumH$1 = (n) => n / 2 ** 32 | 0;
const fromNumL$1 = (n) => n >>> 0;
function setU64FromNum$1(view2, byteOffset, n, isLE) {
  const h = fromNumH$1(n);
  const l = fromNumL$1(n);
  view2.setUint32(byteOffset, isLE ? l : h, isLE);
  view2.setUint32(byteOffset + 4, isLE ? h : l, isLE);
}
const shrSH = (h, _l, s) => h >>> s;
const shrSL = (h, l, s) => h << 32 - s | l >>> s;
const rotrSH = (h, l, s) => h >>> s | l << 32 - s;
const rotrSL = (h, l, s) => h << 32 - s | l >>> s;
const rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
const rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
function add(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0);
  return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
}
const add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
const add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
const add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
const add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
const add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
const add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
function isBytes$6(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
const atitle$3 = (title) => title ? `"${title}" ` : "";
function anumber$4(n, title = "") {
  if (typeof n !== "number")
    throw new TypeError(atitle$3(title) + "expected number, got " + typeof n);
  if (!Number.isSafeInteger(n) || n < 0)
    throw new RangeError(atitle$3(title) + "expected integer >= 0, got " + n);
  return n;
}
function abytes$4(value, length, title = "") {
  if (isBytes$6(value) && (length === void 0 || value.length === length))
    return value;
  if (length !== void 0)
    anumber$4(length, "length");
  const bytes = isBytes$6(value);
  const ofLen = length !== void 0 ? ` of length ${length}` : "";
  const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
  const message = atitle$3(title) + "expected Uint8Array" + ofLen + ", got " + got;
  if (!bytes)
    throw new TypeError(message);
  throw new RangeError(message);
}
function ahash$1(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new TypeError("expected hash wrapped by utils.createHasher");
  anumber$4(h.outputLen);
  anumber$4(h.blockLen);
  if (h.outputLen < 1 || h.blockLen < 1)
    throw new Error("hash blockLen / outputLen must be >= 1");
}
const aobject$3 = (value, label) => {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError((label === "object" ? "" : `"${label}" `) + "expected object, got type=" + typeof value);
};
const aopts$1 = (value, label) => {
  aobject$3(value, label);
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null)
    throw new TypeError(`"${label}" expected plain object`);
  if (Object.hasOwn(value, "__proto__"))
    throw new TypeError(`"${label}.__proto__" is not allowed`);
};
function aexists$1(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("hash was destroyed");
  if (checkFinished && instance.finished)
    throw new Error("digest() was already called");
}
function aoutput$1(out, instance) {
  abytes$4(out, void 0, "output");
  const min = instance.outputLen;
  if (!(out.length >= min)) {
    throw new RangeError('"output" expected length >= ' + min);
  }
}
function clean$1(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView$2(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr$1(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function rotl$1(word, shift) {
  return word << shift | word >>> 32 - shift >>> 0;
}
const hasHexBuiltin$2 = /* @__PURE__ */ (() => (
  // @ts-ignore
  typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
))();
const hexes$1 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToHex$3(bytes) {
  abytes$4(bytes);
  if (hasHexBuiltin$2)
    return bytes.toHex();
  let hex2 = "";
  for (let i = 0; i < bytes.length; i++) {
    hex2 += hexes$1[bytes[i]];
  }
  return hex2;
}
function asciiToBase16$1(ch) {
  return ch >= 48 && ch <= 57 ? ch - 48 : ch >= 65 && ch <= 70 ? ch - (65 - 10) : ch >= 97 && ch <= 102 ? ch - (97 - 10) : void 0;
}
function hexToBytes$3(hex2) {
  if (typeof hex2 !== "string")
    throw new TypeError("hex string expected, got " + typeof hex2);
  if (hasHexBuiltin$2) {
    try {
      return Uint8Array.fromHex(hex2);
    } catch (error) {
      if (error instanceof SyntaxError)
        throw new RangeError(error.message);
      throw error;
    }
  }
  const hl = hex2.length;
  const al = hl / 2;
  if (hl % 2)
    throw new RangeError("hex string expected, got unpadded hex of length " + hl);
  const array2 = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16$1(hex2.charCodeAt(hi));
    const n2 = asciiToBase16$1(hex2.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex2[hi] + hex2[hi + 1];
      throw new RangeError('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array2[ai] = n1 * 16 + n2;
  }
  return array2;
}
function concatBytes$5(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes$4(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad);
    pad += a.length;
  }
  return res;
}
function checkOpts$1(defaults, opts, title = "opts") {
  aopts$1(defaults, "defaults");
  if (opts !== void 0)
    aopts$1(opts, title);
  const merged = Object.assign(/* @__PURE__ */ Object.create(null), defaults, opts);
  return merged;
}
function createHasher$1(hashCons, info = {}) {
  if (typeof hashCons !== "function")
    throw new TypeError('"hashCons" expected function, got type=' + typeof hashCons);
  info = checkOpts$1({}, info, "info");
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.canXOF = tmp.canXOF;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
function randomBytes$3(bytesLength = 32) {
  anumber$4(bytesLength, "bytesLength");
  const cr = typeof globalThis === "object" ? globalThis.crypto : null;
  if (typeof (cr == null ? void 0 : cr.getRandomValues) !== "function")
    throw new Error("crypto.getRandomValues must be defined");
  if (bytesLength > 65536)
    throw new RangeError(`"bytesLength" expected <= 65536, got ${bytesLength}`);
  return cr.getRandomValues(new Uint8Array(bytesLength));
}
const oidNist$1 = (suffix) => ({
  // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
  // Larger suffix values would need base-128 OID encoding and a different length byte.
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
});
function Chi$1(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj$1(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
let HashMD$1 = class HashMD2 {
  constructor(blockLen, outputLen, padOffset, isLE) {
    __publicField(this, "blockLen");
    __publicField(this, "outputLen");
    __publicField(this, "canXOF", false);
    __publicField(this, "padOffset");
    __publicField(this, "isLE");
    // For partial updates less than block size
    __publicField(this, "buffer");
    __publicField(this, "view");
    __publicField(this, "finished", false);
    __publicField(this, "length", 0);
    __publicField(this, "pos", 0);
    __publicField(this, "destroyed", false);
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView$2(this.buffer);
  }
  update(data) {
    aexists$1(this);
    abytes$4(data);
    const { view: view2, buffer, blockLen } = this;
    const len = data.length;
    let processed = false;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView$2(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        processed = true;
        continue;
      }
      buffer.set(pos === 0 && take === len ? data : data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view2, 0);
        this.pos = 0;
        processed = true;
      }
    }
    this.length += data.length;
    if (processed)
      this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists$1(this);
    aoutput$1(out, this);
    this.finished = true;
    const { buffer, view: view2, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    buffer.fill(0, pos);
    if (this.padOffset > blockLen - pos) {
      this.process(view2, 0);
      buffer.fill(0);
    }
    setU64FromNum$1(view2, blockLen - 8, this.length * 8, isLE);
    this.process(view2, 0);
    this.roundClean();
    const oview = out === buffer ? view2 : createView$2(out);
    const len = this.outputLen;
    const outLen = len / 4;
    const state = this.get();
    if (len % 4 || outLen > state.length)
      throw new Error("invalid outputLen");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneIntoMeta(to) {
    const { buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (pos)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
const SHA256_IV$1 = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
const SHA512_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  4089235720,
  3144134277,
  2227873595,
  1013904242,
  4271175723,
  2773480762,
  1595750129,
  1359893119,
  2917565137,
  2600822924,
  725511199,
  528734635,
  4215389547,
  1541459225,
  327033209
]);
const SHA256_K$1 = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
const SHA256_W$1 = /* @__PURE__ */ new Uint32Array(64);
let SHA2_32B$1 = class SHA2_32B extends HashMD$1 {
  constructor(outputLen, IV) {
    super(64, outputLen, 8, false);
    // We cannot use array here since array allows indexing by variable
    // which means optimizer/compiler cannot use registers.
    // Numeric initializers matter: starting the fields as `undefined` changes
    // V8's field representation and makes sha256 3x slower (measured).
    __publicField(this, "A", 0);
    __publicField(this, "B", 0);
    __publicField(this, "C", 0);
    __publicField(this, "D", 0);
    __publicField(this, "E", 0);
    __publicField(this, "F", 0);
    __publicField(this, "G", 0);
    __publicField(this, "H", 0);
    this.A = IV[0] | 0;
    this.B = IV[1] | 0;
    this.C = IV[2] | 0;
    this.D = IV[3] | 0;
    this.E = IV[4] | 0;
    this.F = IV[5] | 0;
    this.G = IV[6] | 0;
    this.H = IV[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  _cloneInto(to) {
    (to || (to = new this.constructor())).set(...this.get());
    return this._cloneIntoMeta(to);
  }
  process(view2, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W$1[i] = view2.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W$1[i - 15];
      const W2 = SHA256_W$1[i - 2];
      const s0 = rotr$1(W15, 7) ^ rotr$1(W15, 18) ^ W15 >>> 3;
      const s1 = rotr$1(W2, 17) ^ rotr$1(W2, 19) ^ W2 >>> 10;
      SHA256_W$1[i] = s1 + SHA256_W$1[i - 7] + s0 + SHA256_W$1[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr$1(E, 6) ^ rotr$1(E, 11) ^ rotr$1(E, 25);
      const T1 = H + sigma1 + Chi$1(E, F, G) + SHA256_K$1[i] + SHA256_W$1[i] | 0;
      const sigma0 = rotr$1(A, 2) ^ rotr$1(A, 13) ^ rotr$1(A, 22);
      const T2 = sigma0 + Maj$1(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean$1(SHA256_W$1);
  }
  destroy() {
    this.destroyed = true;
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean$1(this.buffer);
  }
};
let _SHA256$1 = class _SHA256 extends SHA2_32B$1 {
  constructor() {
    super(32, SHA256_IV$1);
  }
};
const K512 = /* @__PURE__ */ (() => split([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((n) => BigInt(n))))();
const SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
const SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
const SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
const SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
class SHA2_64B extends HashMD$1 {
  constructor(outputLen, IV) {
    super(128, outputLen, 16, false);
    // We cannot use array here since array allows indexing by variable
    // which means optimizer/compiler cannot use registers.
    // h -- high 32 bits, l -- low 32 bits
    // Numeric initializers matter: starting the fields as `undefined` changes
    // V8's field representation and slows hashing down (measured on sha256).
    __publicField(this, "Ah", 0);
    __publicField(this, "Al", 0);
    __publicField(this, "Bh", 0);
    __publicField(this, "Bl", 0);
    __publicField(this, "Ch", 0);
    __publicField(this, "Cl", 0);
    __publicField(this, "Dh", 0);
    __publicField(this, "Dl", 0);
    __publicField(this, "Eh", 0);
    __publicField(this, "El", 0);
    __publicField(this, "Fh", 0);
    __publicField(this, "Fl", 0);
    __publicField(this, "Gh", 0);
    __publicField(this, "Gl", 0);
    __publicField(this, "Hh", 0);
    __publicField(this, "Hl", 0);
    this.Ah = IV[0] | 0;
    this.Al = IV[1] | 0;
    this.Bh = IV[2] | 0;
    this.Bl = IV[3] | 0;
    this.Ch = IV[4] | 0;
    this.Cl = IV[5] | 0;
    this.Dh = IV[6] | 0;
    this.Dl = IV[7] | 0;
    this.Eh = IV[8] | 0;
    this.El = IV[9] | 0;
    this.Fh = IV[10] | 0;
    this.Fl = IV[11] | 0;
    this.Gh = IV[12] | 0;
    this.Gl = IV[13] | 0;
    this.Hh = IV[14] | 0;
    this.Hl = IV[15] | 0;
  }
  // prettier-ignore
  get() {
    const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
  }
  // prettier-ignore
  set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
    this.Ah = Ah | 0;
    this.Al = Al | 0;
    this.Bh = Bh | 0;
    this.Bl = Bl | 0;
    this.Ch = Ch | 0;
    this.Cl = Cl | 0;
    this.Dh = Dh | 0;
    this.Dl = Dl | 0;
    this.Eh = Eh | 0;
    this.El = El | 0;
    this.Fh = Fh | 0;
    this.Fl = Fl | 0;
    this.Gh = Gh | 0;
    this.Gl = Gl | 0;
    this.Hh = Hh | 0;
    this.Hl = Hl | 0;
  }
  _cloneInto(to) {
    (to || (to = new this.constructor())).set(...this.get());
    return this._cloneIntoMeta(to);
  }
  process(view2, offset) {
    for (let i = 0; i < 16; i++, offset += 4) {
      SHA512_W_H[i] = view2.getUint32(offset);
      SHA512_W_L[i] = view2.getUint32(offset += 4);
    }
    for (let i = 16; i < 80; i++) {
      const W15h = SHA512_W_H[i - 15] | 0;
      const W15l = SHA512_W_L[i - 15] | 0;
      const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
      const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
      const W2h = SHA512_W_H[i - 2] | 0;
      const W2l = SHA512_W_L[i - 2] | 0;
      const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
      const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
      const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
      const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
      SHA512_W_H[i] = SUMh | 0;
      SHA512_W_L[i] = SUMl | 0;
    }
    let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    for (let i = 0; i < 80; i++) {
      const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
      const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
      const CHIh = Eh & Fh ^ ~Eh & Gh;
      const CHIl = El & Fl ^ ~El & Gl;
      const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
      const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
      const T1l = T1ll | 0;
      const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
      const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
      const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
      const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
      Hh = Gh | 0;
      Hl = Gl | 0;
      Gh = Fh | 0;
      Gl = Fl | 0;
      Fh = Eh | 0;
      Fl = El | 0;
      ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
      Dh = Ch | 0;
      Dl = Cl | 0;
      Ch = Bh | 0;
      Cl = Bl | 0;
      Bh = Ah | 0;
      Bl = Al | 0;
      const All = add3L(T1l, sigma0l, MAJl);
      Ah = add3H(All, T1h, sigma0h, MAJh);
      Al = All | 0;
    }
    ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
    ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
    ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
    ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
    ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
    ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
    ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
    ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
    this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
  }
  roundClean() {
    clean$1(SHA512_W_H, SHA512_W_L);
  }
  destroy() {
    this.destroyed = true;
    clean$1(this.buffer);
    this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
class _SHA512 extends SHA2_64B {
  constructor() {
    super(64, SHA512_IV);
  }
}
const sha256$2 = /* @__PURE__ */ createHasher$1(
  () => new _SHA256$1(),
  /* @__PURE__ */ oidNist$1(1)
);
const sha512 = /* @__PURE__ */ createHasher$1(
  () => new _SHA512(),
  /* @__PURE__ */ oidNist$1(3)
);
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function aarray$2(item, title, inner = () => {
}) {
  if (!Array.isArray(item))
    throw new TypeError(`"${title}" expected array, got type=${typeof item}`);
  for (let i = 0; i < item.length; i++)
    inner(item[i], `${title}[${i}]`);
  return item;
}
const abytes$3 = (value, length, title) => abytes$4(value, length, title);
const anumber$3 = anumber$4;
function astring$2(value, title = "") {
  if (typeof value !== "string") {
    const prefix2 = title && `"${title}" `;
    throw new TypeError(prefix2 + "expected string, got type=" + typeof value);
  }
  return value;
}
function aobject$2(value, title = "object") {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError(title === "object" ? "expected valid options object" : `"${title}" expected object, got type=${typeof value}`);
  return value;
}
function afunction$1(value, title) {
  if (typeof value !== "function")
    throw new TypeError(`"${title}" is invalid: expected function, got ${typeof value}`);
  return value;
}
const bytesToHex$2 = bytesToHex$3;
const concatBytes$4 = (...arrays) => concatBytes$5(...arrays);
const hexToBytes$2 = (hex2) => hexToBytes$3(hex2);
const isBytes$5 = isBytes$6;
const randomBytes$2 = (bytesLength) => randomBytes$3(bytesLength);
const _0n$f = /* @__PURE__ */ BigInt(0);
const _1n$b = /* @__PURE__ */ BigInt(1);
const atitle$2 = (title) => title ? `"${title}" ` : "";
function abool$1(value, title = "") {
  if (typeof value !== "boolean")
    throw new TypeError(atitle$2(title) + "expected boolean, got type=" + typeof value);
  return value;
}
function abignumber$1(n) {
  if (typeof n === "bigint") {
    if (!isPosBig$1(n))
      throw new RangeError("positive bigint expected, got " + n);
  } else
    anumber$3(n);
  return n;
}
function asafenumber$1(value, title = "") {
  if (typeof value !== "number") {
    const prefix2 = title && `"${title}" `;
    throw new TypeError(prefix2 + "expected number, got type=" + typeof value);
  }
  if (!Number.isSafeInteger(value)) {
    const prefix2 = title && `"${title}" `;
    throw new RangeError(prefix2 + "expected safe integer, got " + value);
  }
}
function numberToHexUnpadded$1(num2) {
  const hex2 = abignumber$1(num2).toString(16);
  return hex2.length & 1 ? "0" + hex2 : hex2;
}
function hexToNumber$1(hex2) {
  if (typeof hex2 !== "string")
    throw new TypeError("hex string expected, got " + typeof hex2);
  return hex2 === "" ? _0n$f : BigInt("0x" + hex2);
}
function bytesToNumberBE$1(bytes) {
  return hexToNumber$1(bytesToHex$3(bytes));
}
function bytesToNumberLE$1(bytes) {
  return hexToNumber$1(bytesToHex$3(copyBytes$1(abytes$4(bytes)).reverse()));
}
function numberToBytesBE$1(n, len) {
  anumber$4(len);
  if (len === 0)
    throw new Error("zero output length is invalid");
  n = abignumber$1(n);
  const expectedLen = len * 2;
  const hex2 = n.toString(16);
  if (hex2.length > expectedLen)
    throw new RangeError("number is too large");
  return hexToBytes$3(hex2.padStart(expectedLen, "0"));
}
function numberToBytesLE$1(n, len) {
  return numberToBytesBE$1(n, len).reverse();
}
function copyBytes$1(bytes) {
  return Uint8Array.from(abytes$3(bytes));
}
function isPosBig$1(n) {
  return typeof n === "bigint" && _0n$f <= n;
}
function inRange$1(n, min, max) {
  return isPosBig$1(n) && isPosBig$1(min) && isPosBig$1(max) && min <= n && n < max;
}
function aInRange$1(title, n, min, max) {
  if (!inRange$1(n, min, max))
    throw new RangeError("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen$1(n) {
  if (n < _0n$f)
    throw new Error("expected non-negative bigint, got " + n);
  return n === _0n$f ? 0 : n.toString(2).length;
}
const bitMask$1 = (n) => {
  asafenumber$1(n, "n");
  return (_1n$b << BigInt(n)) - _1n$b;
};
function createHmacDrbg$1(hashLen, qByteLen, hmacFn) {
  anumber$4(hashLen, "hashLen");
  anumber$4(qByteLen, "qByteLen");
  if (typeof hmacFn !== "function")
    throw new TypeError("hmacFn must be a function");
  const u8n = (len) => new Uint8Array(len);
  const NULL2 = Uint8Array.of();
  const byte0 = Uint8Array.of(0);
  const byte1 = Uint8Array.of(1);
  const _maxDrbgIters = 1e3;
  let v = u8n(hashLen);
  let k = u8n(hashLen);
  let i = 0;
  const reset = () => {
    v.fill(1);
    k.fill(0);
    i = 0;
  };
  const h = (...msgs) => hmacFn(k, concatBytes$4(v, ...msgs));
  const reseed = (seed = NULL2) => {
    k = h(byte0, seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(byte1, seed);
    v = h();
  };
  const gen = () => {
    if (i++ >= _maxDrbgIters)
      throw new Error("drbg: tried max amount of iterations");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes$4(...out);
  };
  const genUntil = (seed, pred) => {
    reset();
    reseed(seed);
    let res = void 0;
    while ((res = pred(gen())) === void 0)
      reseed();
    reset();
    return res;
  };
  return genUntil;
}
function validateObject$2(object, fields = {}, optFields = {}, title = "object") {
  aobject$2(object, title);
  aobject$2(fields, "fields");
  aobject$2(optFields, "optFields");
  function checkField(fieldName, expectedType, isOpt) {
    const label = title === "object" ? `param "${String(fieldName)}"` : `"${title}.${String(fieldName)}"`;
    const val = object[fieldName];
    if (!Object.hasOwn(object, fieldName) && (isOpt ? val !== void 0 : expectedType !== "function")) {
      throw new TypeError(`${label} is invalid: expected own property`);
    }
    if (isOpt && val === void 0)
      return;
    const current = typeof val;
    if (current !== expectedType || val === null)
      throw new TypeError(`${label} is invalid: expected ${expectedType}, got ${current}`);
  }
  const iter = (f, isOpt) => Object.entries(f).forEach(([k, v]) => checkField(k, v, isOpt));
  iter(fields, false);
  iter(optFields, true);
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n$e = /* @__PURE__ */ BigInt(0), _1n$a = /* @__PURE__ */ BigInt(1), _2n$8 = /* @__PURE__ */ BigInt(2);
const _3n$3 = /* @__PURE__ */ BigInt(3), _4n$5 = /* @__PURE__ */ BigInt(4), _5n$1 = /* @__PURE__ */ BigInt(5);
const _7n$1 = /* @__PURE__ */ BigInt(7), _8n$3 = /* @__PURE__ */ BigInt(8), _9n$1 = /* @__PURE__ */ BigInt(9);
const _15n$1 = /* @__PURE__ */ BigInt(15), _16n$1 = /* @__PURE__ */ BigInt(16);
const POW_WINDOWED_MIN$1 = /* @__PURE__ */ BigInt("0x10000000000000000");
function mod$1(a, b) {
  if (b <= _0n$e)
    throw new Error("mod: expected positive modulus, got " + b);
  const result = a % b;
  return result >= _0n$e ? result : b + result;
}
function pow$1(num2, power, modulo) {
  if (modulo <= _1n$a)
    throw new Error("pow: expected modulus > 1, got " + modulo);
  if (typeof power !== "bigint")
    throw new TypeError("invalid exponent: expected bigint, got " + typeof power);
  if (power < _0n$e)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n$e)
    return _1n$a;
  if (power === _1n$a)
    return num2;
  let d = num2 % modulo;
  if (d < _0n$e)
    d += modulo;
  if (power < POW_WINDOWED_MIN$1) {
    let p2 = _1n$a;
    while (power > _0n$e) {
      if (power & _1n$a)
        p2 = p2 * d % modulo;
      d = d * d % modulo;
      power >>= _1n$a;
    }
    return p2;
  }
  const digits = [];
  while (power > _0n$e) {
    digits.push(Number(power & _15n$1));
    power >>= _4n$5;
  }
  const table = new Array(16);
  table[0] = _1n$a;
  table[1] = d;
  for (let i = 2; i < 16; i++)
    table[i] = table[i - 1] * d % modulo;
  let p = table[digits[digits.length - 1]];
  for (let w = digits.length - 2; w >= 0; w--) {
    p = p * p % modulo;
    p = p * p % modulo;
    p = p * p % modulo;
    p = p * p % modulo;
    const digit = digits[w];
    if (digit !== 0)
      p = p * table[digit] % modulo;
  }
  return p;
}
function pow2$1(x, power, modulo) {
  if (modulo <= _1n$a)
    throw new Error("pow2: expected modulus > 1, got " + modulo);
  if (power < _0n$e)
    throw new Error("pow2: expected non-negative exponent, got " + power);
  let res = x;
  while (power-- > _0n$e) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert$1(number, modulo) {
  if (number === _0n$e)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _1n$a)
    throw new Error("invert: expected modulus > 1, got " + modulo);
  let a = mod$1(number, modulo);
  let b = modulo;
  let x = _0n$e, u = _1n$a;
  while (a !== _0n$e) {
    const q = b / a;
    const r = b - a * q;
    const m = x - u * q;
    b = a, a = r, x = u, u = m;
  }
  const gcd = b;
  if (gcd !== _1n$a)
    throw new Error("invert: does not exist");
  return mod$1(x, modulo);
}
function invertCt$1(a, prime) {
  if (prime <= _1n$a)
    throw new Error("invertCt: expected prime modulus > 1, got " + prime);
  const an = mod$1(a, prime);
  if (an === _0n$e)
    throw new Error("invertCt: expected non-zero number");
  const inverse = pow$1(an, prime - _2n$8, prime);
  if (mod$1(an * inverse, prime) !== _1n$a)
    throw new Error("invertCt: does not exist");
  return inverse;
}
function assertIsSquare$1(Fp, root, n) {
  const F = Fp;
  if (!F.eql(F.sqr(root), n))
    throw new Error("Cannot find square root");
}
function aoddModulus$1(order, fnName) {
  if ((order & _1n$a) === _0n$e)
    throw new Error(fnName + ": expected odd modulus, got " + order);
}
function sqrt3mod4$1(Fp, n) {
  const F = Fp;
  const p1div4 = (F.ORDER + _1n$a) / _4n$5;
  const root = F.pow(n, p1div4);
  assertIsSquare$1(F, root, n);
  return root;
}
function sqrt5mod8$1(Fp, n) {
  const F = Fp;
  const p5div8 = (F.ORDER - _5n$1) / _8n$3;
  const n2 = F.mul(n, _2n$8);
  const v = F.pow(n2, p5div8);
  const nv = F.mul(n, v);
  const i = F.mul(F.mul(nv, _2n$8), v);
  const root = F.mul(nv, F.sub(i, F.ONE));
  assertIsSquare$1(F, root, n);
  return root;
}
function sqrt9mod16$1(P) {
  const Fp_ = Field$1(P);
  const tn = tonelliShanks$1(P);
  const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
  const c2 = tn(Fp_, c1);
  const c3 = tn(Fp_, Fp_.neg(c1));
  const c4 = (P + _7n$1) / _16n$1;
  return (Fp, n) => {
    const F = Fp;
    let tv1 = F.pow(n, c4);
    let tv2 = F.mul(tv1, c1);
    const tv3 = F.mul(tv1, c2);
    const tv4 = F.mul(tv1, c3);
    const e1 = F.eql(F.sqr(tv2), n);
    const e2 = F.eql(F.sqr(tv3), n);
    tv1 = F.cmov(tv1, tv2, e1);
    tv2 = F.cmov(tv4, tv3, e2);
    const e3 = F.eql(F.sqr(tv2), n);
    const root = F.cmov(tv1, tv2, e3);
    assertIsSquare$1(F, root, n);
    return root;
  };
}
function tonelliShanks$1(P) {
  if (P < _3n$3)
    throw new Error("sqrt is not defined for small field");
  aoddModulus$1(P, "tonelliShanks");
  let Q = P - _1n$a;
  let S = 0;
  while (Q % _2n$8 === _0n$e) {
    Q /= _2n$8;
    S++;
  }
  let Z = _2n$8;
  const _Fp = Field$1(P);
  while (FpLegendre$1(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4$1;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n$a) / _2n$8;
  return function tonelliSlow(Fp, n) {
    const F = Fp;
    if (F.is0(n))
      return n;
    if (FpLegendre$1(F, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = F.mul(F.ONE, cc);
    let t2 = F.pow(n, Q);
    let R = F.pow(n, Q1div2);
    while (!F.eql(t2, F.ONE)) {
      if (F.is0(t2))
        throw new Error("Cannot find square root: probably non-prime P");
      let i = 1;
      let t_tmp = F.sqr(t2);
      while (!F.eql(t_tmp, F.ONE)) {
        i++;
        t_tmp = F.sqr(t_tmp);
        if (i === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n$a << BigInt(M - i - 1);
      const b = F.pow(c, exponent);
      M = i;
      c = F.sqr(b);
      t2 = F.mul(t2, c);
      R = F.mul(R, b);
    }
    return R;
  };
}
function FpSqrt$1(P) {
  aoddModulus$1(P, "Fp.sqrt");
  if (P % _4n$5 === _3n$3)
    return sqrt3mod4$1;
  if (P % _8n$3 === _5n$1)
    return sqrt5mod8$1;
  if (P % _16n$1 === _9n$1)
    return sqrt9mod16$1(P);
  return tonelliShanks$1(P);
}
const FIELD_FIELDS$1 = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function validateField$1(field) {
  aobject$2(field, "field");
  if (typeof field.ORDER !== "bigint")
    throw new TypeError('param "ORDER" is invalid: expected bigint, got ' + typeof field.ORDER);
  asafenumber$1(field.BYTES, "BYTES");
  asafenumber$1(field.BITS, "BITS");
  for (const name of FIELD_FIELDS$1)
    afunction$1(field[name], "field." + name);
  if (field.BYTES < 1 || field.BITS < 1)
    throw new Error("invalid field: expected BYTES/BITS > 0");
  if (field.ORDER <= _1n$a)
    throw new Error("invalid field: expected ORDER > 1, got " + field.ORDER);
  return field;
}
function FpInvertBatch$1(Fp, nums, passZero = false) {
  validateField$1(Fp);
  aarray$2(nums, "nums");
  abool$1(passZero, "passZero");
  const F = Fp;
  const inverted = new Array(nums.length).fill(passZero ? F.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num2, i) => {
    if (F.is0(num2))
      return acc;
    inverted[i] = acc;
    return F.mul(acc, num2);
  }, F.ONE);
  const invertedAcc = F.inv(multipliedAcc);
  nums.reduceRight((acc, num2, i) => {
    if (F.is0(num2))
      return acc;
    inverted[i] = F.mul(acc, inverted[i]);
    return F.mul(acc, num2);
  }, invertedAcc);
  return inverted;
}
function FpLegendre$1(Fp, n) {
  validateField$1(Fp);
  const F = Fp;
  aoddModulus$1(F.ORDER, "FpLegendre");
  const p1mod2 = (F.ORDER - _1n$a) / _2n$8;
  const powered = F.pow(n, p1mod2);
  const yes = F.eql(powered, F.ONE);
  const zero = F.eql(powered, F.ZERO);
  const no = F.eql(powered, F.neg(F.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength$1(n, nBitLength) {
  if (nBitLength !== void 0)
    anumber$3(nBitLength);
  if (n <= _0n$e)
    throw new Error("invalid n length: expected positive n, got " + n);
  if (nBitLength !== void 0 && nBitLength < 1)
    throw new Error("invalid n length: expected positive bit length, got " + nBitLength);
  const bits = bitLen$1(n);
  if (nBitLength !== void 0 && nBitLength < bits)
    throw new Error(`invalid n length: expected nBitLength (${nBitLength}) >= bitLen(n) (${bits})`);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : bits;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
const FIELD_SQRT$1 = /* @__PURE__ */ new WeakMap();
let _Field$1 = class _Field {
  constructor(ORDER, opts = {}) {
    __publicField(this, "ORDER");
    __publicField(this, "BITS");
    __publicField(this, "BYTES");
    __publicField(this, "isLE");
    __publicField(this, "ZERO", _0n$e);
    __publicField(this, "ONE", _1n$a);
    __publicField(this, "_lengths");
    __publicField(this, "_mod");
    if (ORDER <= _1n$a)
      throw new Error("invalid field: expected ORDER > 1, got " + ORDER);
    let _nbitLength = void 0;
    this.isLE = false;
    if (opts != null && typeof opts === "object") {
      if (typeof opts.BITS === "number")
        _nbitLength = opts.BITS;
      if (typeof opts.sqrt === "function")
        Object.defineProperty(this, "sqrt", { value: opts.sqrt, enumerable: true });
      if (typeof opts.isLE === "boolean")
        this.isLE = opts.isLE;
      if (opts.allowedLengths)
        this._lengths = Object.freeze(opts.allowedLengths.slice());
      if (typeof opts.modFromBytes === "boolean")
        this._mod = opts.modFromBytes;
    }
    const { nBitLength, nByteLength } = nLength$1(ORDER, _nbitLength);
    if (nByteLength > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = ORDER;
    this.BITS = nBitLength;
    this.BYTES = nByteLength;
    Object.freeze(this);
  }
  create(num2) {
    return mod$1(num2, this.ORDER);
  }
  isValid(num2) {
    if (typeof num2 !== "bigint")
      throw new TypeError("invalid field element: expected bigint, got " + typeof num2);
    return _0n$e <= num2 && num2 < this.ORDER;
  }
  is0(num2) {
    return num2 === _0n$e;
  }
  // is valid and invertible
  isValidNot0(num2) {
    return !this.is0(num2) && this.isValid(num2);
  }
  isOdd(num2) {
    return (num2 & _1n$a) === _1n$a;
  }
  neg(num2) {
    return mod$1(-num2, this.ORDER);
  }
  eql(lhs, rhs) {
    return lhs === rhs;
  }
  sqr(num2) {
    return mod$1(num2 * num2, this.ORDER);
  }
  add(lhs, rhs) {
    return mod$1(lhs + rhs, this.ORDER);
  }
  sub(lhs, rhs) {
    return mod$1(lhs - rhs, this.ORDER);
  }
  mul(lhs, rhs) {
    return mod$1(lhs * rhs, this.ORDER);
  }
  pow(num2, power) {
    return pow$1(num2, power, this.ORDER);
  }
  div(lhs, rhs) {
    return mod$1(lhs * invert$1(rhs, this.ORDER), this.ORDER);
  }
  // Same as above, but doesn't normalize
  sqrN(num2) {
    return num2 * num2;
  }
  addN(lhs, rhs) {
    return lhs + rhs;
  }
  subN(lhs, rhs) {
    return lhs - rhs;
  }
  mulN(lhs, rhs) {
    return lhs * rhs;
  }
  inv(num2) {
    return invert$1(num2, this.ORDER);
  }
  sqrt(num2) {
    let sqrt = FIELD_SQRT$1.get(this);
    if (!sqrt)
      FIELD_SQRT$1.set(this, sqrt = FpSqrt$1(this.ORDER));
    return sqrt(this, num2);
  }
  toBytes(num2) {
    return this.isLE ? numberToBytesLE$1(num2, this.BYTES) : numberToBytesBE$1(num2, this.BYTES);
  }
  fromBytes(bytes, skipValidation = false) {
    abytes$3(bytes);
    const { _lengths: allowedLengths, BYTES, isLE, ORDER, _mod: modFromBytes } = this;
    if (allowedLengths) {
      if (bytes.length < 1 || !allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
        throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
      }
      const padded = new Uint8Array(BYTES);
      padded.set(bytes, isLE ? 0 : padded.length - bytes.length);
      bytes = padded;
    }
    if (bytes.length !== BYTES)
      throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
    let scalar = isLE ? bytesToNumberLE$1(bytes) : bytesToNumberBE$1(bytes);
    if (modFromBytes)
      scalar = mod$1(scalar, ORDER);
    if (!skipValidation) {
      if (!this.isValid(scalar))
        throw new Error("invalid field element: outside of range 0..ORDER");
    }
    return scalar;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(lst) {
    return FpInvertBatch$1(this, lst, true);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(a, b, condition) {
    abool$1(condition, "condition");
    return condition ? b : a;
  }
};
function Field$1(ORDER, opts = {}) {
  Object.freeze(_Field$1.prototype);
  return new _Field$1(ORDER, opts);
}
function getFieldBytesLength$1(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  if (fieldOrder <= _1n$a)
    throw new Error("field order must be greater than 1");
  const bitLength = bitLen$1(fieldOrder - _1n$a);
  return Math.ceil(bitLength / 8);
}
function getMinHashLength$1(fieldOrder) {
  const length = getFieldBytesLength$1(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField$1(key, fieldOrder, isLE = false) {
  abytes$3(key);
  const len = key.length;
  const fieldLen = getFieldBytesLength$1(fieldOrder);
  const minLen = Math.max(getMinHashLength$1(fieldOrder), 16);
  if (len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num2 = isLE ? bytesToNumberLE$1(key) : bytesToNumberBE$1(key);
  const reduced = mod$1(num2, fieldOrder - _1n$a) + _1n$a;
  return isLE ? numberToBytesLE$1(reduced, fieldLen) : numberToBytesBE$1(reduced, fieldLen);
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n$d = /* @__PURE__ */ BigInt(0);
const _1n$9 = /* @__PURE__ */ BigInt(1);
const _4n$4 = /* @__PURE__ */ BigInt(4);
const BLIND_BYTES$1 = 16;
const BLIND_BITS$1 = 128;
const FW_WINDOW$1 = 5;
const TABLE_BYTES_MAX$1 = /* @__PURE__ */ (() => 2 ** 31)();
function validatePointCons$1(Point2) {
  const pc = Point2;
  if (typeof pc !== "function")
    throw new TypeError('"Point" expected constructor, got type=' + typeof Point2);
  afunction$1(pc.fromAffine, "Point.fromAffine");
  afunction$1(pc.fromBytes, "Point.fromBytes");
  afunction$1(pc.fromHex, "Point.fromHex");
  aobject$2(pc.BASE, "Point.BASE");
  aobject$2(pc.ZERO, "Point.ZERO");
  validateField$1(pc.Fp);
  validateField$1(pc.Fn);
}
function normalizeZ$1(c, points) {
  validatePointCons$1(c);
  validateMSMPoints$1(points, c);
  const invertedZs = FpInvertBatch$1(c.Fp, points.map((p) => p.Z));
  return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
}
function validateW$1(W, bits, min = 1) {
  if (!Number.isSafeInteger(W) || W < min || W > bits)
    throw new Error("invalid window size, expected [" + min + ".." + bits + "], got W=" + W);
}
function validateTableBytes$1(numPoints, fpBytes) {
  const bytes = numPoints * (4 * fpBytes + 128);
  if (bytes > TABLE_BYTES_MAX$1)
    throw new Error("invalid window size: table would need ~" + Math.ceil(bytes / 2 ** 20) + " MiB, max " + TABLE_BYTES_MAX$1 / 2 ** 20 + " MiB");
}
function probeRandomBytes$1(randomBytes2, length) {
  if (randomBytes2 === void 0)
    return void 0;
  afunction$1(randomBytes2, "randomBytes");
  try {
    const probe = randomBytes2(length);
    if (!isBytes$5(probe) || probe.length !== length)
      return void 0;
  } catch {
    return void 0;
  }
  return randomBytes2;
}
function validateMSMPoints$1(points, c) {
  aarray$2(points, "points");
  points.forEach((p, i) => {
    if (!(p instanceof c))
      throw new Error("invalid point at index " + i);
  });
}
function validateMSMScalars$1(scalars, field, maxScalar) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s, i) => {
    const ok = maxScalar === void 0 ? field.isValid(s) : isPosBig$1(s) && s < maxScalar;
    if (!ok)
      throw new Error("invalid scalar at index " + i);
  });
}
const pointWindowSizes$1 = /* @__PURE__ */ new WeakMap();
function getWindowSize$1(P) {
  return pointWindowSizes$1.get(P) || 1;
}
function oddMultiples$1(p, size) {
  const dbl = p.double();
  const t2 = [p];
  for (let j = 1; j < size; j++)
    t2.push(t2[j - 1].add(dbl));
  return t2;
}
function wnafDigits$1(n, W) {
  const size = 2 ** W;
  const half = size / 2;
  const mask = BigInt(size - 1);
  const d = [];
  while (n > _0n$d) {
    let w = 0;
    if (n & _1n$9) {
      w = Number(n & mask);
      if (w >= half)
        w -= size;
      n -= BigInt(w);
    }
    d.push(w);
    n >>= _1n$9;
  }
  return d;
}
function signedWindowDigits$1(n, W, windows) {
  const size = 2 ** W;
  const half = size / 2;
  const mask = BigInt(size - 1);
  const shiftBy = BigInt(W);
  const d = [];
  for (let w = 0; w < windows; w++) {
    let v = Number(n & mask);
    n >>= shiftBy;
    if (v > half) {
      v -= size;
      n += _1n$9;
    }
    d.push(v);
  }
  if (n !== _0n$d)
    throw new Error("invalid wnaf");
  return d;
}
function wnafWalk$1(zero, tables, digits) {
  let max = 0;
  for (const d of digits)
    max = Math.max(max, d.length);
  let acc = zero;
  for (let bit = max - 1; bit >= 0; bit--) {
    if (bit !== max - 1)
      acc = acc.double();
    for (let i = 0; i < digits.length; i++) {
      const w = digits[i][bit];
      if (w) {
        const item = tables[i][Math.abs(w) - 1 >> 1];
        acc = acc.add(w < 0 ? item.negate() : item);
      }
    }
  }
  return acc;
}
let ScalarMultiplier$1 = class ScalarMultiplier {
  // Parametrized with a given Point class (not individual point)
  constructor(Point2, randomBytes2) {
    __publicField(this, "Point");
    __publicField(this, "BASE");
    __publicField(this, "ZERO");
    __publicField(this, "randomBytes");
    __publicField(this, "wnafPrecomputes", /* @__PURE__ */ new WeakMap());
    __publicField(this, "baseCanBeBlinded");
    __publicField(this, "bits");
    validatePointCons$1(Point2);
    this.randomBytes = probeRandomBytes$1(randomBytes2, BLIND_BYTES$1);
    this.Point = Point2;
    this.BASE = Point2.BASE;
    this.ZERO = Point2.ZERO;
    this.bits = Point2.Fn.BITS;
  }
  /**
   * Creates a signed fixed-window wNAF precomputation table: for every window w, the
   * multiples `[1..2^(W−1)]⋅2^(w⋅W)⋅P`, flattened. All doublings are baked into the table,
   * so cached multiplication is additions-only. `windows = ceil(bits/W) + 1`: the extra
   * window absorbs the final carry of signed-digit recoding.
   * For a 256-bit curve and W=6, the table is 44⋅32 = 1408 points.
   * @param point - Point instance
   * @param W - window size
   * @param bits - scalar bitlength the table must cover
   */
  buildWnafTable(point, W, bits) {
    const windows = Math.ceil(bits / W) + 1;
    const half = 2 ** (W - 1);
    const comp = [];
    let base = point;
    for (let w = 0; w < windows; w++) {
      let acc = base;
      for (let i = 0; i < half; i++) {
        comp.push(acc);
        acc = acc.add(base);
      }
      base = comp[comp.length - 1].double();
    }
    return { W, bits, windows, comp };
  }
  /**
   * Implements ec multiplication using precomputed signed fixed-window wNAF tables.
   * Constant-time: fixed window count with one table addition per window — zero digits feed
   * the fake accumulator — and no doublings; the lookup scans the whole window slice.
   * Scalar bounds are validated by the public entry points ({@link ScalarMultiplier.mulCT},
   * {@link ScalarMultiplier.mulCTBlinded}, {@link ScalarMultiplier.mulUnsafe});
   * signedWindowDigits throws if `n` exceeds the table.
   * @returns real and fake (for const-time) points
   */
  wnafCachedCT(precomputes, n) {
    const { W, windows, comp } = precomputes;
    const half = 2 ** (W - 1);
    const digits = signedWindowDigits$1(n, W, windows);
    let p = this.ZERO;
    let f = this.BASE;
    for (let w = 0; w < windows; w++) {
      const digit = digits[w];
      const start = w * half;
      const idx = Math.abs(digit) - 1;
      let sel = comp[start];
      for (let i = 1; i < half; i++)
        sel = i === idx ? comp[start + i] : sel;
      const neg = sel.negate();
      if (digit === 0)
        f = f.add(comp[start]);
      else
        p = p.add(digit < 0 ? neg : sel);
    }
    return { p, f };
  }
  // Cache key is point identity plus (W, bits); at most two entries exist per point (public-width
  // `Fn.BITS` and blinded `Fn.BITS + BLIND_BITS`). Callers must not reuse the same point with
  // incompatible `transform(...)` layouts and expect a separate cache entry.
  getWnafPrecomputes(W, point, bits, transform) {
    let entries = this.wnafPrecomputes.get(point);
    let comp = entries == null ? void 0 : entries.find((entry) => entry.W === W && entry.bits === bits);
    if (!comp) {
      comp = this.buildWnafTable(point, W, bits);
      if (typeof transform === "function")
        comp = { ...comp, comp: transform(comp.comp) };
      if (!entries) {
        entries = [];
        this.wnafPrecomputes.set(point, entries);
      }
      entries.push(comp);
    }
    return comp;
  }
  assertPoint(point) {
    if (!(point instanceof this.Point))
      throw new TypeError('"point" expected Point instance, got type=' + typeof point);
  }
  // Shared prologue of the constant-time entry points. Rejects scalar 0: in key/signature-style
  // callers a zero scalar means broken upstream plumbing, and concrete Points already reject it.
  // Uses inRange instead of Fn.isValidNot0: validateField() only certifies the arithmetic subset.
  validateMulInput(point, scalar) {
    this.assertPoint(point);
    if (!inRange$1(scalar, _1n$9, this.Point.Fn.ORDER))
      throw new Error("invalid scalar");
  }
  // Constant-time dispatch shared by mulCT / mulCTBlinded. Un-precomputed points (W===1, e.g.
  // ECDH peer keys) skip building a throwaway cached table in favor of a small fixed-window
  // multiply. `n` must be < 2^bits.
  runCT(point, n, bits, transform) {
    const W = getWindowSize$1(point);
    if (W === 1)
      return this.fixedWindowCT(point, n, bits);
    return this.wnafCachedCT(this.getWnafPrecomputes(W, point, bits, transform), n);
  }
  mulCT(point, scalar, transform) {
    this.validateMulInput(point, scalar);
    return this.runCT(point, scalar, this.bits, transform);
  }
  mulCTBlinded(point, scalar, transform) {
    this.validateMulInput(point, scalar);
    if (this.randomBytes === void 0)
      throw new Error("randomBytes is required for scalar blinding");
    const bits = this.Point.Fn.BITS + BLIND_BITS$1;
    const blind = this.randomBytes(BLIND_BYTES$1);
    if (!isBytes$5(blind) || blind.length !== BLIND_BYTES$1)
      throw new Error("randomBytes returned invalid byte array");
    blind[0] = blind[0] & 63 | 128;
    const n = scalar + bytesToNumberBE$1(blind) * this.Point.Fn.ORDER;
    return this.runCT(point, n, bits, transform);
  }
  /**
   * Constant-time multiplication `n*point` for an un-precomputed point, via a small fixed window.
   * A cached wNAF table only pays off when reused; a flat 2^FW_WINDOW table (`size-1` adds) is
   * far cheaper to build for a single use. The point-operation sequence is independent of `n`:
   * build the table, then per window exactly FW_WINDOW doublings, a data-oblivious scan over
   * every table entry, and one addition (adds the identity when the window digit is 0 — never
   * skipped).
   *
   * `n` must be `< 2^bits`. Assumes complete addition (adding the identity costs the same as any
   * add), which holds for the Weierstrass/Edwards point types used here. The table is left in
   * projective form (no normalizeZ): normalizing this small a table costs more than the
   * mixed-add savings it would buy for a single multiply.
   * @returns real point `p`; `f` duplicates it only to match {@link wnafCachedCT}'s return shape
   * (this path needs no fake accumulator — its op-count is already scalar-independent).
   */
  fixedWindowCT(point, n, bits) {
    const W = FW_WINDOW$1;
    const size = 1 << W;
    const mask = bitMask$1(W);
    const table = new Array(size);
    table[0] = this.ZERO;
    for (let i = 1; i < size; i++)
      table[i] = table[i - 1].add(point);
    const windows = Math.ceil(bits / W);
    let acc = this.ZERO;
    for (let window = windows - 1; window >= 0; window--) {
      if (window !== windows - 1)
        for (let d = 0; d < W; d++)
          acc = acc.double();
      const digit = Number(n >> BigInt(window * W) & mask);
      let sel = table[0];
      for (let i = 1; i < size; i++)
        sel = i === digit ? table[i] : sel;
      acc = acc.add(sel);
    }
    return { p: acc, f: acc };
  }
  shouldBlind(point, cofactor) {
    if (this.randomBytes === void 0)
      return false;
    if (cofactor === _1n$9)
      return true;
    if (point !== this.BASE)
      return false;
    if (this.baseCanBeBlinded === void 0)
      this.baseCanBeBlinded = this.mulUnsafe(this.BASE, this.Point.Fn.ORDER).is0();
    return this.baseCanBeBlinded;
  }
  mulSecret(point, scalar, cofactor, transform) {
    return this.shouldBlind(point, cofactor) ? this.mulCTBlinded(point, scalar, transform) : this.mulCT(point, scalar, transform);
  }
  mulUnsafe(point, scalar, transform) {
    this.assertPoint(point);
    if (!isPosBig$1(scalar))
      throw new Error("invalid scalar");
    const W = getWindowSize$1(point);
    if (W === 1 || scalar >= this.Point.Fn.ORDER)
      return mulAddUnsafe$1(this.Point, [point], [scalar], true);
    const precomputes = this.getWnafPrecomputes(W, point, this.bits, transform);
    return this.wnafCachedCT(precomputes, scalar).p;
  }
  // Remembers the window size used for precomputed wNAF multiplication of the given point
  // and drops any previously built tables. Usually only the base point is precomputed.
  // W=1 resets the point to the un-precomputed (table-less) paths.
  // W is additionally capped so tables stay under ~2 GiB ({@link TABLE_BYTES_MAX}).
  setWindowSize(point, W) {
    this.assertPoint(point);
    validateW$1(W, this.bits);
    const windows = Math.ceil((this.bits + BLIND_BITS$1) / W) + 1;
    validateTableBytes$1(windows * 2 ** (W - 1), this.Point.Fp.BYTES);
    pointWindowSizes$1.set(point, W);
    this.wnafPrecomputes.delete(point);
  }
  // True when a window size is set: tables themselves are built lazily on first multiply.
  hasWindowSize(point) {
    return getWindowSize$1(point) !== 1;
  }
};
function mulAddUnsafe$1(c, points, scalars, allowOversized = false) {
  validatePointCons$1(c);
  validateMSMPoints$1(points, c);
  abool$1(allowOversized, "allowOversized");
  validateMSMScalars$1(scalars, c.Fn, allowOversized ? c.Fn.ORDER ** _4n$4 : void 0);
  if (points.length !== scalars.length)
    throw new Error("arrays of points and scalars must have equal length");
  const tables = points.map((p) => oddMultiples$1(p, 4));
  const digits = scalars.map((n) => wnafDigits$1(n, 4));
  return wnafWalk$1(c.ZERO, tables, digits);
}
function createField$1(order, field, isLE) {
  if (field) {
    if (field.ORDER !== order)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    validateField$1(field);
    return field;
  } else {
    return Field$1(order, { isLE });
  }
}
function createCurveFields$1(type, CURVE, curveOpts = {}, FpFnLE) {
  if (FpFnLE === void 0)
    FpFnLE = type === "edwards";
  if (!CURVE || typeof CURVE !== "object")
    throw new Error(`expected valid ${type} CURVE object`);
  validateObject$2(curveOpts);
  for (const p of ["p", "n", "h"]) {
    const val = CURVE[p];
    if (!(isPosBig$1(val) && val !== _0n$d))
      throw new Error(`CURVE.${p} must be positive bigint`);
  }
  const Fp = createField$1(CURVE.p, curveOpts.Fp, FpFnLE);
  const Fn2 = createField$1(CURVE.n, curveOpts.Fn, FpFnLE);
  const _b = "b";
  const params = ["Gx", "Gy", "a", _b];
  for (const p of params) {
    if (!Fp.isValid(CURVE[p]))
      throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
  }
  CURVE = Object.freeze(Object.assign({}, CURVE));
  return { CURVE, Fp, Fn: Fn2 };
}
function createKeygen$1(randomSecretKey, getPublicKey) {
  return function keygen(seed) {
    const secretKey = randomSecretKey(seed);
    return { secretKey, publicKey: getPublicKey(secretKey) };
  };
}
let _HMAC$1 = class _HMAC {
  constructor(hash, key) {
    __publicField(this, "oHash");
    __publicField(this, "iHash");
    __publicField(this, "blockLen");
    __publicField(this, "outputLen");
    __publicField(this, "canXOF", false);
    __publicField(this, "finished", false);
    __publicField(this, "destroyed", false);
    ahash$1(hash);
    abytes$4(key, void 0, "key");
    this.iHash = hash.create();
    if (typeof this.iHash.update !== "function")
      throw new Error("expected Hash instance");
    this.blockLen = this.iHash.blockLen;
    this.outputLen = this.iHash.outputLen;
    const blockLen = this.blockLen;
    const pad = new Uint8Array(blockLen);
    pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54;
    this.iHash.update(pad);
    this.oHash = hash.create();
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54 ^ 92;
    this.oHash.update(pad);
    clean$1(pad);
  }
  update(buf) {
    aexists$1(this);
    this.iHash.update(buf);
    return this;
  }
  digestInto(out) {
    aexists$1(this);
    aoutput$1(out, this);
    this.finished = true;
    const buf = out.subarray(0, this.outputLen);
    this.iHash.digestInto(buf);
    this.oHash.update(buf);
    this.oHash.digestInto(buf);
    this.destroy();
  }
  digest() {
    const out = new Uint8Array(this.oHash.outputLen);
    this.digestInto(out);
    return out;
  }
  _cloneInto(to) {
    to || (to = Object.create(Object.getPrototypeOf(this), {}));
    const { oHash, iHash, finished, destroyed, blockLen, outputLen, canXOF } = this;
    to = to;
    to.finished = finished;
    to.destroyed = destroyed;
    to.blockLen = blockLen;
    to.outputLen = outputLen;
    to.canXOF = canXOF;
    to.oHash = oHash._cloneInto(to.oHash);
    to.iHash = iHash._cloneInto(to.iHash);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = true;
    this.oHash.destroy();
    this.iHash.destroy();
  }
};
const hmac$1 = /* @__PURE__ */ (() => {
  const hmac_ = (hash, key, message) => new _HMAC$1(hash, key).update(message).digest();
  hmac_.create = (hash, key) => new _HMAC$1(hash, key);
  return hmac_;
})();
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n$c = /* @__PURE__ */ BigInt(0);
let DERErr$1 = class DERErr extends Error {
  constructor(m = "") {
    super(m);
  }
};
const _DER$1 = {
  // asn.1 DER encoding utils
  Err: DERErr$1,
  // Basic building block is TLV (Tag-Length-Value)
  _tlv: {
    encode: (tag, data) => {
      const { Err: E } = _DER$1;
      asafenumber$1(tag, "tag");
      if (tag < 0 || tag > 255)
        throw new E("tlv.encode: wrong tag");
      astring$2(data, "data");
      if (data.length & 1)
        throw new E("tlv.encode: unpadded data");
      const dataLen = data.length / 2;
      const len = numberToHexUnpadded$1(dataLen);
      if (len.length / 2 & 128)
        throw new E("tlv.encode: long form length too big");
      const lenLen = dataLen > 127 ? numberToHexUnpadded$1(len.length / 2 | 128) : "";
      const t2 = numberToHexUnpadded$1(tag);
      return t2 + lenLen + len + data;
    },
    // v - value, l - left bytes (unparsed)
    decode(tag, data) {
      const { Err: E } = _DER$1;
      data = abytes$3(data, void 0, "DER data");
      let pos = 0;
      if (tag < 0 || tag > 255)
        throw new E("tlv.decode: wrong tag");
      if (data.length < 2 || data[pos++] !== tag)
        throw new E("tlv.decode: wrong tlv");
      const first = data[pos++];
      const isLong = !!(first & 128);
      let length = 0;
      if (!isLong)
        length = first;
      else {
        const lenLen = first & 127;
        if (!lenLen)
          throw new E("tlv.decode(long): indefinite length not supported");
        if (lenLen > 4)
          throw new E("tlv.decode(long): byte length is too big");
        const lengthBytes = data.subarray(pos, pos + lenLen);
        if (lengthBytes.length !== lenLen)
          throw new E("tlv.decode: length bytes not complete");
        if (lengthBytes[0] === 0)
          throw new E("tlv.decode(long): zero leftmost byte");
        for (const b of lengthBytes)
          length = length << 8 | b;
        pos += lenLen;
        if (length < 128)
          throw new E("tlv.decode(long): not minimal encoding");
      }
      const v = data.subarray(pos, pos + length);
      if (v.length !== length)
        throw new E("tlv.decode: wrong value length");
      return { v, l: data.subarray(pos + length) };
    }
  },
  // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
  // since we always use positive integers here. It must always be empty:
  // - add zero byte if exists
  // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
  _int: {
    encode(num2) {
      const { Err: E } = _DER$1;
      abignumber$1(num2);
      if (num2 < _0n$c)
        throw new E("integer: negative integers are not allowed");
      let hex2 = numberToHexUnpadded$1(num2);
      if (Number.parseInt(hex2[0], 16) & 8)
        hex2 = "00" + hex2;
      if (hex2.length & 1)
        throw new E("unexpected DER parsing assertion: unpadded hex");
      return hex2;
    },
    decode(data) {
      const { Err: E } = _DER$1;
      if (data.length < 1)
        throw new E("invalid signature integer: empty");
      if (data[0] & 128)
        throw new E("invalid signature integer: negative");
      if (data.length > 1 && data[0] === 0 && !(data[1] & 128))
        throw new E("invalid signature integer: unnecessary leading zero");
      return bytesToNumberBE$1(data);
    }
  },
  toSig(bytes, maxScalarBytes) {
    const { Err: E, _int: int, _tlv: tlv } = _DER$1;
    if (maxScalarBytes !== void 0) {
      asafenumber$1(maxScalarBytes, "maxScalarBytes");
      if (maxScalarBytes < 1)
        throw new E("invalid signature: maxScalarBytes must be positive");
    }
    const data = abytes$3(bytes, void 0, "signature");
    const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
    if (seqLeftBytes.length)
      throw new E("invalid signature: left bytes after parsing");
    const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
    const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
    if (sLeftBytes.length)
      throw new E("invalid signature: left bytes after parsing");
    if (maxScalarBytes !== void 0 && (rBytes.length > maxScalarBytes || sBytes.length > maxScalarBytes))
      throw new E("invalid signature: integer too large");
    return { r: int.decode(rBytes), s: int.decode(sBytes) };
  },
  hexFromSig(sig) {
    const { _tlv: tlv, _int: int } = _DER$1;
    validateObject$2(sig, { r: "bigint", s: "bigint" }, {}, "sig");
    const rs = tlv.encode(2, int.encode(sig.r));
    const ss = tlv.encode(2, int.encode(sig.s));
    const seq = rs + ss;
    return tlv.encode(48, seq);
  }
};
const DER$1 = /* @__PURE__ */ (() => {
  Object.freeze(_DER$1._tlv);
  Object.freeze(_DER$1._int);
  return Object.freeze(_DER$1);
})();
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const divNearest$1 = (num2, den) => (num2 + (num2 >= 0 ? den : -den) / _2n$7) / den;
function _splitEndoScalar$1(k, basis, n) {
  aInRange$1("scalar", k, _0n$b, n);
  const [[a1, b1], [a2, b2]] = basis;
  const c1 = divNearest$1(b2 * k, n);
  const c2 = divNearest$1(-b1 * k, n);
  let k1 = k - c1 * a1 - c2 * a2;
  let k2 = -c1 * b1 - c2 * b2;
  const k1neg = k1 < _0n$b;
  const k2neg = k2 < _0n$b;
  if (k1neg)
    k1 = -k1;
  if (k2neg)
    k2 = -k2;
  const MAX_NUM = bitMask$1(Math.ceil(bitLen$1(n) / 2)) + _1n$8;
  if (k1 < _0n$b || k1 >= MAX_NUM || k2 < _0n$b || k2 >= MAX_NUM) {
    throw new Error("splitScalar (endomorphism): failed for k");
  }
  return { k1neg, k1, k2neg, k2 };
}
function validateSigFormat$1(format2) {
  if (!["compact", "recovered", "der"].includes(format2))
    throw new Error('Signature format must be "compact", "recovered", or "der"');
  return format2;
}
function validateSigOpts$1(opts, def2) {
  validateObject$2(opts);
  const optsn = {};
  for (let optName of Object.keys(def2)) {
    optsn[optName] = opts[optName] === void 0 ? def2[optName] : opts[optName];
  }
  abool$1(optsn.lowS, "lowS");
  abool$1(optsn.prehash, "prehash");
  if (optsn.format !== void 0)
    validateSigFormat$1(optsn.format);
  return optsn;
}
const _0n$b = /* @__PURE__ */ BigInt(0), _1n$8 = /* @__PURE__ */ BigInt(1), _2n$7 = /* @__PURE__ */ BigInt(2), _3n$2 = /* @__PURE__ */ BigInt(3), _4n$3 = /* @__PURE__ */ BigInt(4);
function weierstrass$1(params, extraOpts = {}) {
  const validated = createCurveFields$1("weierstrass", params, extraOpts);
  const Fp = validated.Fp;
  const Fn2 = validated.Fn;
  let CURVE = validated.CURVE;
  const { h: cofactor, n: CURVE_ORDER2 } = CURVE;
  validateObject$2(extraOpts, {}, {
    allowInfinityPoint: "boolean",
    clearCofactor: "function",
    isTorsionFree: "function",
    fromBytes: "function",
    toBytes: "function",
    endo: "object",
    randomBytes: "function"
  });
  const { endo: endoOpts, allowInfinityPoint, clearCofactor, isTorsionFree, fromBytes, toBytes } = extraOpts;
  const randomBytes2 = extraOpts.randomBytes === void 0 ? randomBytes$2 : extraOpts.randomBytes;
  if (endoOpts) {
    if (!Fp.is0(CURVE.a) || typeof endoOpts.beta !== "bigint" || !Array.isArray(endoOpts.basises)) {
      throw new Error('invalid endo: expected "beta": bigint and "basises": array');
    }
  }
  const endo = endoOpts ? {
    beta: endoOpts.beta,
    basises: endoOpts.basises.map((basis) => [...basis])
  } : void 0;
  const lengths = getWLengths$1(Fp, Fn2);
  function assertCompressionIsSupported() {
    if (!Fp.isOdd)
      throw new Error("compression is not supported: Field does not have .isOdd()");
  }
  function pointToBytes2(_c, point, isCompressed) {
    if (point.is0()) {
      if (!allowInfinityPoint)
        throw new Error("bad point: ZERO");
      return Uint8Array.of(0);
    }
    const { x, y } = point.toAffine();
    const bx = Fp.toBytes(x);
    abool$1(isCompressed, "isCompressed");
    if (isCompressed) {
      assertCompressionIsSupported();
      const hasEvenY = !Fp.isOdd(y);
      return concatBytes$4(pprefix$1(hasEvenY), bx);
    } else {
      return concatBytes$4(Uint8Array.of(4), bx, Fp.toBytes(y));
    }
  }
  function pointFromBytes(bytes) {
    abytes$3(bytes, void 0, "Point");
    const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
    const length = bytes.length;
    const head = bytes[0];
    const tail = bytes.subarray(1);
    if (allowInfinityPoint && length === 1 && head === 0)
      return { x: Fp.ZERO, y: Fp.ZERO };
    if (length === comp && (head === 2 || head === 3)) {
      const x = Fp.fromBytes(tail);
      if (!Fp.isValid(x))
        throw new Error("bad point: is not on curve, wrong x");
      const y2 = weierstrassEquation(x);
      let y;
      try {
        y = Fp.sqrt(y2);
      } catch (sqrtError) {
        const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
        throw new Error("bad point: is not on curve, sqrt error" + err);
      }
      assertCompressionIsSupported();
      const evenY = Fp.isOdd(y);
      const evenH = (head & 1) === 1;
      if (evenH !== evenY)
        y = Fp.neg(y);
      return { x, y };
    } else if (length === uncomp && head === 4) {
      const L = Fp.BYTES;
      const x = Fp.fromBytes(tail.subarray(0, L));
      const y = Fp.fromBytes(tail.subarray(L, L * 2));
      if (!isValidXY(x, y))
        throw new Error("bad point: is not on curve");
      return { x, y };
    } else {
      throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
    }
  }
  const encodePoint = toBytes === void 0 ? pointToBytes2 : toBytes;
  const decodePoint = fromBytes === void 0 ? pointFromBytes : fromBytes;
  const b3 = Fp.mul(CURVE.b, _3n$2);
  const mulA = Fp.is0(CURVE.a) ? (_) => Fp.ZERO : (x) => Fp.mul(CURVE.a, x);
  function weierstrassEquation(x) {
    const x2 = Fp.sqr(x);
    const x3 = Fp.mul(x2, x);
    return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b);
  }
  function isValidXY(x, y) {
    const left = Fp.sqr(y);
    const right = weierstrassEquation(x);
    return Fp.eql(left, right);
  }
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n$2), _4n$3);
  const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
  if (Fp.is0(Fp.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function acoord(title, n, banZero = false) {
    if (!Fp.isValid(n) || banZero && Fp.is0(n))
      throw new Error(`bad point coordinate ${title}`);
    return typeof n === "object" && n !== null ? Fp.create(n) : n;
  }
  function aprjpoint(other) {
    if (!(other instanceof Point2))
      throw new Error("Weierstrass Point expected");
  }
  function splitEndoScalarN(k) {
    if (!endo || !endo.basises)
      throw new Error("no endo");
    return _splitEndoScalar$1(k, endo.basises, Fn2.ORDER);
  }
  function pushWnafPair(points, scalars, p, k) {
    if (!Fn2.isValid(k))
      throw new RangeError("invalid scalar: out of range");
    if (endo) {
      const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(k);
      const psi = new Point2(Fp.mul(p.X, endo.beta), p.Y, p.Z);
      points.push(k1neg ? p.negate() : p, k2neg ? psi.negate() : psi);
      scalars.push(k1, k2);
    } else {
      points.push(p);
      scalars.push(k);
    }
  }
  const validityCache = /* @__PURE__ */ new WeakSet();
  const _Point = class _Point {
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    constructor(X, Y, Z) {
      __publicField(this, "X");
      __publicField(this, "Y");
      __publicField(this, "Z");
      this.X = acoord("x", X);
      this.Y = acoord("y", Y, true);
      this.Z = acoord("z", Z);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof _Point)
        throw new Error("projective point not allowed");
      if (Fp.is0(x) && Fp.is0(y))
        return _Point.ZERO;
      return new _Point(x, y, Fp.ONE);
    }
    static fromBytes(bytes) {
      const P = _Point.fromAffine(decodePoint(abytes$3(bytes, void 0, "point")));
      P.assertValidity();
      return P;
    }
    static fromHex(hex2) {
      return _Point.fromBytes(hexToBytes$2(hex2));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     * @param isLazy - true will defer table computation until the first multiplication
     */
    precompute(windowSize = 6, isLazy = true) {
      wnaf.setWindowSize(this, windowSize);
      if (!isLazy)
        this.multiply(_3n$2);
      return this;
    }
    // TODO: return `this`
    /** A point on curve is valid if it conforms to equation. */
    assertValidity() {
      const p = this;
      if (p.is0()) {
        if (allowInfinityPoint && Fp.is0(p.X) && Fp.eql(p.Y, Fp.ONE) && Fp.is0(p.Z))
          return;
        throw new Error("bad point: ZERO");
      }
      if (validityCache.has(p))
        return;
      const { x, y } = p.toAffine();
      if (!Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("bad point: x or y not field elements");
      if (!isValidXY(x, y))
        throw new Error("bad point: equation left != right");
      if (!p.isTorsionFree())
        throw new Error("bad point: not in prime-order subgroup");
      validityCache.add(p);
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (!Fp.isOdd)
        throw new Error("Field doesn't support isOdd");
      return !Fp.isOdd(y);
    }
    /** Compare one point to another. */
    equals(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
    negate() {
      return new _Point(this.X, Fp.neg(this.Y), this.Z);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { X: X1, Y: Y1, Z: Z1 } = this;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = mulA(Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = mulA(t2);
      t3 = Fp.sub(t0, t2);
      t3 = mulA(t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new _Point(X3, Y3, Z3);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = mulA(t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = mulA(t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = mulA(t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new _Point(X3, Y3, Z3);
    }
    subtract(other) {
      aprjpoint(other);
      return this.add(other.negate());
    }
    is0() {
      return this.equals(_Point.ZERO);
    }
    /**
     * Constant time multiplication.
     * Uses precomputed tables (signed fixed-window wNAF) when available.
     * Uses scalar blinding and avoids endomorphism splitting in the secret-scalar path.
     * @param scalar - by which the point would be multiplied
     * @returns New point
     */
    multiply(scalar) {
      if (!Fn2.isValidNot0(scalar))
        throw new RangeError("invalid scalar: out of range");
      const { p, f } = wnaf.mulSecret(this, scalar, cofactor, normalize2);
      return normalize2([p, f])[0];
    }
    /**
     * Non-constant-time multiplication. Uses width-4 wNAF with GLV endomorphism splitting
     * when available (two half-width scalars sharing one halved doubling chain).
     * It's faster, but should only be used when you don't care about
     * an exposed secret key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(scalar) {
      const p = this;
      const sc = scalar;
      if (!Fn2.isValid(sc))
        throw new RangeError("invalid scalar: out of range");
      if (sc === _0n$b || p.is0())
        return _Point.ZERO;
      if (sc === _1n$8)
        return p;
      if (wnaf.hasWindowSize(this))
        return wnaf.mulUnsafe(p, sc, normalize2);
      const points = [];
      const scalars = [];
      pushWnafPair(points, scalars, p, sc);
      return mulAddUnsafe$1(_Point, points, scalars);
    }
    /**
     * Non-constant-time double-scalar multiplication `a⋅this + b⋅other` (Strauss–Shamir).
     * Both walks share one doubling chain via {@link mulAddUnsafe}, and GLV endomorphism
     * (when available) halves the chain again by splitting each scalar into two half-width
     * parts. Used by ECDSA verification and public-key recovery for `R = u1⋅G + u2⋅P`.
     * Only for public scalars.
     */
    mulAddUnsafe(a, other, b) {
      aprjpoint(other);
      const points = [];
      const scalars = [];
      pushWnafPair(points, scalars, this, a);
      pushWnafPair(points, scalars, other, b);
      return mulAddUnsafe$1(_Point, points, scalars);
    }
    /**
     * Converts Projective point to affine (x, y) coordinates.
     * (X, Y, Z) ∋ (x=X/Z, y=Y/Z).
     * @param invertedZ - Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
     */
    toAffine(invertedZ) {
      const p = this;
      let iz = invertedZ;
      if (iz != null && !Fp.isValid(iz))
        throw new RangeError('"invertedZ" expected valid field element');
      const { X, Y, Z } = p;
      if (Fp.eql(Z, Fp.ONE))
        return { x: X, y: Y };
      const is0 = p.is0();
      if (iz == null)
        iz = is0 ? Fp.ONE : Fp.inv(Z);
      const x = Fp.mul(X, iz);
      const y = Fp.mul(Y, iz);
      const zz = Fp.mul(Z, iz);
      if (is0)
        return { x: Fp.ZERO, y: Fp.ZERO };
      if (!Fp.eql(zz, Fp.ONE))
        throw new Error("invZ was invalid");
      return { x, y };
    }
    /**
     * Checks whether Point is free of torsion elements (is in prime subgroup).
     * Always torsion-free for cofactor=1 curves.
     */
    isTorsionFree() {
      if (cofactor === _1n$8)
        return true;
      if (isTorsionFree)
        return isTorsionFree(_Point, this);
      return wnaf.mulUnsafe(this, CURVE_ORDER2).is0();
    }
    clearCofactor() {
      if (cofactor === _1n$8)
        return this;
      if (clearCofactor)
        return clearCofactor(_Point, this);
      return this.multiplyUnsafe(cofactor);
    }
    isSmallOrder() {
      if (cofactor === _1n$8)
        return this.is0();
      return this.clearCofactor().is0();
    }
    toBytes(isCompressed = true) {
      abool$1(isCompressed, "isCompressed");
      this.assertValidity();
      return encodePoint(_Point, this, isCompressed);
    }
    toHex(isCompressed = true) {
      return bytesToHex$2(this.toBytes(isCompressed));
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  };
  __publicField(_Point, "BASE", new _Point(CURVE.Gx, CURVE.Gy, Fp.ONE));
  __publicField(_Point, "ZERO", new _Point(Fp.ZERO, Fp.ONE, Fp.ZERO));
  __publicField(_Point, "Fp", Fp);
  __publicField(_Point, "Fn", Fn2);
  let Point2 = _Point;
  const normalize2 = (points) => normalizeZ$1(Point2, points);
  const wnaf = new ScalarMultiplier$1(Point2, randomBytes2);
  if (wnaf.bits >= 6)
    Point2.BASE.precompute(6);
  Object.freeze(Point2.prototype);
  Object.freeze(Point2);
  return Point2;
}
function pprefix$1(hasEvenY) {
  return Uint8Array.of(hasEvenY ? 2 : 3);
}
function getWLengths$1(Fp, Fn2) {
  return {
    secretKey: Fn2.BYTES,
    publicKey: 1 + Fp.BYTES,
    publicKeyUncompressed: 1 + 2 * Fp.BYTES,
    publicKeyHasPrefix: true,
    // Raw compact `(r || s)` signature width; DER and recovered signatures use
    // different lengths outside this helper.
    signature: 2 * Fn2.BYTES
  };
}
function ecdh$1(Point2, ecdhOpts = {}) {
  validatePointCons$1(Point2);
  const { Fn: Fn2 } = Point2;
  const randomBytes_ = ecdhOpts.randomBytes === void 0 ? randomBytes$2 : ecdhOpts.randomBytes;
  const lengths = Object.assign(getWLengths$1(Point2.Fp, Fn2), {
    seed: Math.max(getMinHashLength$1(Fn2.ORDER), 16)
  });
  function isValidSecretKey(secretKey) {
    try {
      const num2 = Fn2.fromBytes(secretKey);
      return Fn2.isValidNot0(num2);
    } catch (error) {
      return false;
    }
  }
  function isValidPublicKey(publicKey, isCompressed) {
    const { publicKey: comp, publicKeyUncompressed } = lengths;
    try {
      const l = publicKey.length;
      if (isCompressed === true && l !== comp)
        return false;
      if (isCompressed === false && l !== publicKeyUncompressed)
        return false;
      return !Point2.fromBytes(publicKey).is0();
    } catch (error) {
      return false;
    }
  }
  function randomSecretKey(seed) {
    seed = seed === void 0 ? randomBytes_(lengths.seed) : seed;
    return mapHashToField$1(abytes$3(seed, lengths.seed, "seed"), Fn2.ORDER);
  }
  function getPublicKey(secretKey, isCompressed = true) {
    return Point2.BASE.multiply(Fn2.fromBytes(secretKey)).toBytes(isCompressed);
  }
  function isProbPub(item) {
    const { secretKey, publicKey, publicKeyUncompressed } = lengths;
    const allowedLengths = Fn2._lengths;
    if (!isBytes$5(item))
      return void 0;
    const l = abytes$3(item, void 0, "key").length;
    const isPub = l === publicKey || l === publicKeyUncompressed;
    const isSec = l === secretKey || !!(allowedLengths == null ? void 0 : allowedLengths.includes(l));
    if (isPub && isSec)
      return void 0;
    return isPub;
  }
  function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
    if (isProbPub(secretKeyA) === true)
      throw new Error("first arg must be private key");
    if (isProbPub(publicKeyB) === false)
      throw new Error("second arg must be public key");
    const s = Fn2.fromBytes(secretKeyA);
    const b = Point2.fromBytes(publicKeyB);
    if (b.is0())
      throw new Error("invalid public key: point at infinity");
    return b.multiply(s).toBytes(isCompressed);
  }
  const utils2 = {
    isValidSecretKey,
    isValidPublicKey,
    randomSecretKey
  };
  const keygen = createKeygen$1(randomSecretKey, getPublicKey);
  Object.freeze(utils2);
  Object.freeze(lengths);
  return Object.freeze({ getPublicKey, getSharedSecret, keygen, Point: Point2, utils: utils2, lengths });
}
function ecdsa$1(Point2, hash, ecdsaOpts = {}) {
  validatePointCons$1(Point2);
  const hash_ = hash;
  ahash$1(hash_);
  validateObject$2(ecdsaOpts, {}, {
    hmac: "function",
    lowS: "boolean",
    randomBytes: "function",
    bits2int: "function",
    bits2int_modN: "function"
  });
  const opts = Object.assign({}, ecdsaOpts);
  const randomBytes2 = opts.randomBytes === void 0 ? randomBytes$2 : opts.randomBytes;
  const hmac2 = opts.hmac === void 0 ? (key, msg) => hmac$1(hash_, key, msg) : opts.hmac;
  const { Fp, Fn: Fn2 } = Point2;
  const { ORDER: CURVE_ORDER2, BITS: fnBits } = Fn2;
  const blindLength = getMinHashLength$1(CURVE_ORDER2);
  const csprng = probeRandomBytes$1(randomBytes2, blindLength);
  const { keygen, getPublicKey, getSharedSecret, utils: utils2, lengths } = ecdh$1(Point2, opts);
  const defaultSigOpts = {
    prehash: true,
    lowS: typeof opts.lowS === "boolean" ? opts.lowS : true,
    format: "compact",
    extraEntropy: false
  };
  const hasLargeRecoveryLifts = CURVE_ORDER2 * _2n$7 + _1n$8 < Fp.ORDER;
  function isBiggerThanHalfOrder(number) {
    const HALF = CURVE_ORDER2 >> _1n$8;
    return number > HALF;
  }
  function validateRS(title, num2) {
    if (!Fn2.isValidNot0(num2))
      throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
    return num2;
  }
  function assertFieldSignIsSupported() {
    if (!Fp.isOdd)
      throw new Error("Field doesn't support isOdd");
  }
  function getRecoveryBit(x, y, r) {
    assertFieldSignIsSupported();
    return (x === r ? 0 : 2) | Number(Fp.isOdd(y));
  }
  function assertRecoverableCurve() {
    if (hasLargeRecoveryLifts)
      throw new Error('"recovered" sig type is not supported for cofactor >2 curves');
  }
  function validateSigLength(bytes, format2) {
    validateSigFormat$1(format2);
    const size = lengths.signature;
    const sizer = format2 === "compact" ? size : format2 === "recovered" ? size + 1 : void 0;
    return abytes$3(bytes, sizer);
  }
  class Signature {
    constructor(r, s, recovery) {
      __publicField(this, "r");
      __publicField(this, "s");
      __publicField(this, "recovery");
      this.r = validateRS("r", r);
      this.s = validateRS("s", s);
      if (recovery != null) {
        assertRecoverableCurve();
        if (![0, 1, 2, 3].includes(recovery))
          throw new Error("invalid recovery id");
        this.recovery = recovery;
      }
      Object.freeze(this);
    }
    static fromBytes(bytes, format2 = defaultSigOpts.format) {
      validateSigLength(bytes, format2);
      let recid;
      if (format2 === "der") {
        if (bytes.length > 2 * Fn2.BYTES + 16)
          throw new DER$1.Err("invalid signature: DER signature too long");
        const { r: r2, s: s2 } = DER$1.toSig(abytes$3(bytes), Fn2.BYTES + 1);
        return new Signature(r2, s2);
      }
      if (format2 === "recovered") {
        recid = bytes[0];
        format2 = "compact";
        bytes = bytes.subarray(1);
      }
      const L = lengths.signature / 2;
      const r = bytes.subarray(0, L);
      const s = bytes.subarray(L, L * 2);
      return new Signature(Fn2.fromBytes(r), Fn2.fromBytes(s), recid);
    }
    static fromHex(hex2, format2) {
      return this.fromBytes(hexToBytes$2(hex2), format2);
    }
    assertRecovery() {
      const { recovery } = this;
      if (recovery == null)
        throw new Error("invalid recovery id: must be present");
      return recovery;
    }
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    // Unlike the top-level helper below, this method expects a digest that has
    // already been hashed to the curve's message representative.
    recoverPublicKey(messageHash) {
      const { r, s } = this;
      const recovery = this.assertRecovery();
      const radj = recovery === 2 || recovery === 3 ? r + CURVE_ORDER2 : r;
      if (!Fp.isValid(radj))
        throw new Error("invalid recovery id: sig.r+curve.n != R.x");
      const x = Fp.toBytes(radj);
      const R = Point2.fromBytes(concatBytes$4(pprefix$1((recovery & 1) === 0), x));
      const ir = Fn2.inv(radj);
      const h = bits2int_modN(abytes$3(messageHash, void 0, "msgHash"));
      const u1 = Fn2.create(-h * ir);
      const u2 = Fn2.create(s * ir);
      const Q = Point2.BASE.mulAddUnsafe(u1, R, u2);
      if (Q.is0())
        throw new Error("invalid recovery: point at infinify");
      Q.assertValidity();
      return Q;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    toBytes(format2 = defaultSigOpts.format) {
      validateSigFormat$1(format2);
      if (format2 === "der")
        return hexToBytes$2(DER$1.hexFromSig(this));
      const { r, s } = this;
      const rb = Fn2.toBytes(r);
      const sb = Fn2.toBytes(s);
      if (format2 === "recovered") {
        assertRecoverableCurve();
        return concatBytes$4(Uint8Array.of(this.assertRecovery()), rb, sb);
      }
      return concatBytes$4(rb, sb);
    }
    toHex(format2) {
      return bytesToHex$2(this.toBytes(format2));
    }
  }
  Object.freeze(Signature.prototype);
  Object.freeze(Signature);
  const bits2int = opts.bits2int === void 0 ? function bits2int_def(bytes) {
    if (bytes.length > 8192)
      throw new Error("input is too large");
    const num2 = bytesToNumberBE$1(bytes);
    const delta = bytes.length * 8 - fnBits;
    return delta > 0 ? num2 >> BigInt(delta) : num2;
  } : opts.bits2int;
  const bits2int_modN = opts.bits2int_modN === void 0 ? function bits2int_modN_def(bytes) {
    return Fn2.create(bits2int(bytes));
  } : opts.bits2int_modN;
  const ORDER_MASK = bitMask$1(fnBits);
  function int2octets(num2) {
    aInRange$1("num < 2^" + fnBits, num2, _0n$b, ORDER_MASK);
    return Fn2.toBytes(num2);
  }
  function validateMsgAndHash(message, prehash) {
    abytes$3(message, void 0, "message");
    return prehash ? abytes$3(hash_(message), void 0, "prehashed message") : message;
  }
  function prepSig(message, secretKey, opts2) {
    const { lowS, prehash, extraEntropy } = validateSigOpts$1(opts2, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    const h1int = bits2int_modN(message);
    const d = Fn2.fromBytes(secretKey);
    if (!Fn2.isValidNot0(d))
      throw new Error("invalid private key");
    const seedArgs = [int2octets(d), int2octets(h1int)];
    if (extraEntropy != null && extraEntropy !== false) {
      const e = extraEntropy === true ? randomBytes2(lengths.secretKey) : extraEntropy;
      seedArgs.push(abytes$3(e, void 0, "extraEntropy"));
    }
    const seed = concatBytes$4(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!Fn2.isValidNot0(k))
        return;
      const q = Point2.BASE.multiply(k).toAffine();
      const r = Fn2.create(q.x);
      if (r === _0n$b)
        return;
      let s;
      if (csprng !== void 0) {
        const b = bytesToNumberBE$1(mapHashToField$1(csprng(blindLength), CURVE_ORDER2));
        const ibk = Fn2.inv(Fn2.mul(b, k));
        const bm = Fn2.mul(b, m);
        const bd = Fn2.mul(b, d);
        s = Fn2.create(ibk * Fn2.create(bm + bd * r));
      } else {
        const ik = invertCt$1(k, CURVE_ORDER2);
        s = Fn2.create(ik * Fn2.create(m + r * d));
      }
      if (s === _0n$b)
        return;
      let recovery = getRecoveryBit(q.x, q.y, r);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = Fn2.neg(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, hasLargeRecoveryLifts ? void 0 : recovery);
    }
    return { seed, k2sig };
  }
  function sign(message, secretKey, opts2 = {}) {
    const { seed, k2sig } = prepSig(message, secretKey, opts2);
    const drbg = createHmacDrbg$1(hash_.outputLen, Fn2.BYTES, hmac2);
    const sig = drbg(seed, k2sig);
    return sig.toBytes(opts2.format);
  }
  function verify(signature, message, publicKey, opts2 = {}) {
    const { lowS, prehash, format: format2 } = validateSigOpts$1(opts2, defaultSigOpts);
    publicKey = abytes$3(publicKey, void 0, "publicKey");
    message = validateMsgAndHash(message, prehash);
    if (!isBytes$5(signature)) {
      const end = signature instanceof Signature ? ", use sig.toBytes()" : "";
      throw new Error("verify expects Uint8Array signature" + end);
    }
    validateSigLength(signature, format2);
    try {
      const sig = Signature.fromBytes(signature, format2);
      const P = Point2.fromBytes(publicKey);
      if (P.is0())
        return false;
      if (lowS && sig.hasHighS())
        return false;
      const { r, s } = sig;
      const h = bits2int_modN(message);
      const is = Fn2.inv(s);
      const u1 = Fn2.create(h * is);
      const u2 = Fn2.create(r * is);
      const R = Point2.BASE.mulAddUnsafe(u1, P, u2);
      if (R.is0())
        return false;
      const q = R.toAffine();
      const v = Fn2.create(q.x);
      if (v !== r)
        return false;
      if (format2 === "recovered" && sig.recovery !== getRecoveryBit(q.x, q.y, r))
        return false;
      return true;
    } catch (e) {
      return false;
    }
  }
  function recoverPublicKey(signature, message, opts2 = {}) {
    const { prehash } = validateSigOpts$1(opts2, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    return Signature.fromBytes(signature, "recovered").recoverPublicKey(message).toBytes();
  }
  return Object.freeze({
    keygen,
    getPublicKey,
    getSharedSecret,
    utils: utils2,
    lengths,
    Point: Point2,
    sign,
    verify,
    recoverPublicKey,
    Signature,
    hash: hash_
  });
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const secp256k1_CURVE$1 = {
  p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
  n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
  h: BigInt(1),
  a: BigInt(0),
  b: BigInt(7),
  Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
  Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
};
const secp256k1_ENDO$1 = {
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
  basises: [
    [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
    [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
  ]
};
const _2n$6 = /* @__PURE__ */ BigInt(2);
function sqrtMod$1(y) {
  const P = secp256k1_CURVE$1.p;
  const _3n2 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b2 = y * y * y % P;
  const b3 = b2 * b2 * y % P;
  const b6 = pow2$1(b3, _3n2, P) * b3 % P;
  const b9 = pow2$1(b6, _3n2, P) * b3 % P;
  const b11 = pow2$1(b9, _2n$6, P) * b2 % P;
  const b22 = pow2$1(b11, _11n, P) * b11 % P;
  const b44 = pow2$1(b22, _22n, P) * b22 % P;
  const b88 = pow2$1(b44, _44n, P) * b44 % P;
  const b176 = pow2$1(b88, _88n, P) * b88 % P;
  const b220 = pow2$1(b176, _44n, P) * b44 % P;
  const b223 = pow2$1(b220, _3n2, P) * b3 % P;
  const t1 = pow2$1(b223, _23n, P) * b22 % P;
  const t2 = pow2$1(t1, _6n, P) * b2 % P;
  const root = pow2$1(t2, _2n$6, P);
  if (!Fpk1$1.eql(Fpk1$1.sqr(root), y))
    throw new Error("Cannot find square root");
  return root;
}
const Fpk1$1 = /* @__PURE__ */ Field$1(secp256k1_CURVE$1.p, { sqrt: sqrtMod$1 });
const Pointk1$1 = /* @__PURE__ */ weierstrass$1(secp256k1_CURVE$1, {
  Fp: Fpk1$1,
  endo: secp256k1_ENDO$1
});
const secp256k1$1 = /* @__PURE__ */ ecdsa$1(Pointk1$1, sha256$2);
const Rho160$1 = /* @__PURE__ */ Uint8Array.from([
  7,
  4,
  13,
  1,
  10,
  6,
  15,
  3,
  12,
  0,
  9,
  5,
  2,
  14,
  11,
  8
]);
const Id160$1 = /* @__PURE__ */ (() => Uint8Array.from(new Array(16).fill(0).map((_, i) => i)))();
const Pi160$1 = /* @__PURE__ */ (() => Id160$1.map((i) => (9 * i + 5) % 16))();
const idxLR$1 = /* @__PURE__ */ (() => {
  const L = [Id160$1];
  const R = [Pi160$1];
  const res = [L, R];
  for (let i = 0; i < 4; i++)
    for (let j of res)
      j.push(j[i].map((k) => Rho160$1[k]));
  return res;
})();
const idxL$1 = /* @__PURE__ */ (() => idxLR$1[0])();
const idxR$1 = /* @__PURE__ */ (() => idxLR$1[1])();
const shifts160$1 = /* @__PURE__ */ [
  [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8],
  [12, 13, 11, 15, 6, 9, 9, 7, 12, 15, 11, 13, 7, 8, 7, 7],
  [13, 15, 14, 11, 7, 7, 6, 8, 13, 14, 13, 12, 5, 5, 6, 9],
  [14, 11, 12, 14, 8, 6, 5, 5, 15, 12, 15, 14, 9, 9, 8, 6],
  [15, 12, 13, 13, 9, 5, 8, 6, 14, 11, 12, 11, 8, 6, 5, 5]
].map((i) => Uint8Array.from(i));
const shiftsL160$1 = /* @__PURE__ */ idxL$1.map((idx, i) => idx.map((j) => shifts160$1[i][j]));
const shiftsR160$1 = /* @__PURE__ */ idxR$1.map((idx, i) => idx.map((j) => shifts160$1[i][j]));
const Kl160$1 = /* @__PURE__ */ Uint32Array.from([
  0,
  1518500249,
  1859775393,
  2400959708,
  2840853838
]);
const Kr160$1 = /* @__PURE__ */ Uint32Array.from([
  1352829926,
  1548603684,
  1836072691,
  2053994217,
  0
]);
function ripemd_f$1(group, x, y, z) {
  if (group === 0)
    return x ^ y ^ z;
  if (group === 1)
    return x & y | ~x & z;
  if (group === 2)
    return (x | ~y) ^ z;
  if (group === 3)
    return x & z | y & ~z;
  return x ^ (y | ~z);
}
const BUF_160$1 = /* @__PURE__ */ new Uint32Array(16);
let _RIPEMD160$1 = class _RIPEMD160 extends HashMD$1 {
  constructor() {
    super(64, 20, 8, true);
    __publicField(this, "h0", 1732584193 | 0);
    __publicField(this, "h1", 4023233417 | 0);
    __publicField(this, "h2", 2562383102 | 0);
    __publicField(this, "h3", 271733878 | 0);
    __publicField(this, "h4", 3285377520 | 0);
  }
  get() {
    const { h0, h1, h2, h3, h4 } = this;
    return [h0, h1, h2, h3, h4];
  }
  set(h0, h1, h2, h3, h4) {
    this.h0 = h0 | 0;
    this.h1 = h1 | 0;
    this.h2 = h2 | 0;
    this.h3 = h3 | 0;
    this.h4 = h4 | 0;
  }
  _cloneInto(to) {
    (to || (to = new this.constructor())).set(...this.get());
    return this._cloneIntoMeta(to);
  }
  process(view2, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      BUF_160$1[i] = view2.getUint32(offset, true);
    let al = this.h0 | 0, ar = al, bl = this.h1 | 0, br = bl, cl = this.h2 | 0, cr = cl, dl = this.h3 | 0, dr = dl, el = this.h4 | 0, er = el;
    for (let group = 0; group < 5; group++) {
      const rGroup = 4 - group;
      const hbl = Kl160$1[group], hbr = Kr160$1[group];
      const rl = idxL$1[group], rr = idxR$1[group];
      const sl = shiftsL160$1[group], sr = shiftsR160$1[group];
      for (let i = 0; i < 16; i++) {
        const tl = rotl$1(al + ripemd_f$1(group, bl, cl, dl) + BUF_160$1[rl[i]] + hbl, sl[i]) + el | 0;
        al = el, el = dl, dl = rotl$1(cl, 10) | 0, cl = bl, bl = tl;
      }
      for (let i = 0; i < 16; i++) {
        const tr = rotl$1(ar + ripemd_f$1(rGroup, br, cr, dr) + BUF_160$1[rr[i]] + hbr, sr[i]) + er | 0;
        ar = er, er = dr, dr = rotl$1(cr, 10) | 0, cr = br, br = tr;
      }
    }
    this.set(this.h1 + cl + dr | 0, this.h2 + dl + er | 0, this.h3 + el + ar | 0, this.h4 + al + br | 0, this.h0 + bl + cr | 0);
  }
  roundClean() {
    clean$1(BUF_160$1);
  }
  destroy() {
    this.destroyed = true;
    clean$1(this.buffer);
    this.set(0, 0, 0, 0, 0);
  }
};
const ripemd160$1 = /* @__PURE__ */ createHasher$1(() => new _RIPEMD160$1());
/*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const freeze = (fn) => Object.freeze(fn());
function isBytes$4(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
function abytes$2(b) {
  if (!isBytes$4(b))
    throw new TypeError("Uint8Array expected");
}
function isArrayOf(isString, arr) {
  if (!Array.isArray(arr))
    return false;
  if (arr.length === 0)
    return true;
  {
    return arr.every((item) => Number.isSafeInteger(item));
  }
}
function afn(input) {
  if (typeof input !== "function")
    throw new TypeError("function expected");
  return true;
}
function astr(label, input) {
  if (typeof input !== "string")
    throw new TypeError(`${label}: string expected`);
  return true;
}
function anumber$2(n, title = "number") {
  if (typeof n !== "number")
    throw new TypeError(`${title}: expected number, got ${typeof n}`);
  if (!Number.isSafeInteger(n))
    throw new RangeError(`${title}: expected safe integer, got ${n}`);
}
function anumArr(label, input) {
  if (!isArrayOf(false, input))
    throw new TypeError(`${label}: array of numbers expected`);
}
function chain(...args) {
  const id = (a) => a;
  const wrap2 = (a, b) => (c) => a(b(c));
  const encode = args.map((x) => x.encode).reduceRight(wrap2, id);
  const decode = args.map((x) => x.decode).reduce(wrap2, id);
  return { encode, decode };
}
function normalize(fn) {
  afn(fn);
  return { encode: (from) => from, decode: (to) => fn(to) };
}
const powers = /* @__PURE__ */ (() => {
  let res = [];
  for (let i = 0; i < 40; i++)
    res.push(2 ** i);
  return res;
})();
function u8ToNumArr(u8, len = u8.length) {
  const res = new Array(len);
  for (let i = 0; i < len; i++)
    res[i] = u8[i];
  return res;
}
const asciiDecoder = /* @__PURE__ */ (() => {
  try {
    const decoder = new TextDecoder();
    return decoder.decode(Uint8Array.of(65, 48, 43, 127)) === "A0+" ? decoder : void 0;
  } catch (e) {
    return void 0;
  }
})();
const B2S_CHUNK = 8192;
function charcodesToString(codes) {
  const len = codes.length;
  if (asciiDecoder !== void 0 && len >= 12)
    return asciiDecoder.decode(codes);
  if (len <= B2S_CHUNK)
    return String.fromCharCode.apply(null, codes);
  let res = "";
  for (let i = 0; i < len; i += B2S_CHUNK)
    res += String.fromCharCode.apply(null, codes.subarray(i, i + B2S_CHUNK));
  return res;
}
function radix2(bits) {
  anumber$2(bits);
  if (bits <= 0 || bits > 8)
    throw new RangeError("radix2: bits should be in (0..8]");
  const mask = powers[bits] - 1;
  return {
    encode: (bytes) => {
      abytes$2(bytes);
      const len = bytes.length;
      const res = new Uint8Array(Math.ceil(len * 8 / bits));
      let carry = 0;
      let pos = 0;
      let j = 0;
      for (let i = 0; i < len; ) {
        if (i + 2 < len) {
          carry = carry << 24 | bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
          pos += 24;
          i += 3;
        } else {
          carry = (carry << 8 | bytes[i]) & 65535;
          pos += 8;
          i++;
        }
        for (; ; ) {
          pos -= bits;
          res[j++] = carry >> pos & mask;
          if (pos < bits)
            break;
        }
      }
      if (pos > 0)
        res[j] = carry << bits - pos & mask;
      return res;
    },
    decode: (digits) => {
      const len = digits.length;
      const res = new Uint8Array(Math.floor(len * bits / 8));
      let carry = 0;
      let pos = 0;
      let j = 0;
      for (let i = 0; i < len; i++) {
        carry = (carry << bits | digits[i]) & 65535;
        pos += bits;
        for (; pos >= 8; pos -= 8)
          res[j++] = carry >> pos - 8 & 255;
      }
      carry = carry << 8 - pos & 255;
      if (pos >= bits)
        throw new Error("Excess padding");
      if (carry > 0)
        throw new Error(`Non-zero padding: ${carry}`);
      return res;
    }
  };
}
function alphabet(letters, aliases) {
  const len = letters.length;
  if (len > 128)
    throw new Error("alphabet: max 128 letters");
  const encTable = new Uint8Array(len);
  const decTable = new Int8Array(128).fill(-1);
  for (let i = 0; i < len; i++) {
    const code = letters.charCodeAt(i);
    if (letters.codePointAt(i) !== code || code > 127)
      throw new Error("alphabet: single-char ASCII letters only");
    encTable[i] = code;
    decTable[code] = i;
  }
  if (aliases !== void 0) {
    for (const alias of Object.keys(aliases)) {
      const code = alias.charCodeAt(0);
      const target = decTable[aliases[alias].charCodeAt(0)];
      if (alias.length !== 1 || code > 127 || target === void 0 || target === -1)
        throw new Error(`alphabet: invalid alias ${alias}`);
      decTable[code] = target;
    }
  }
  return {
    encode: (digits) => {
      const codes = new Uint8Array(digits.length);
      for (let i = 0; i < digits.length; i++) {
        const d = digits[i];
        const code = encTable[d];
        if (code === void 0)
          throw new Error(`alphabet.encode: invalid digit ${d}`);
        codes[i] = code;
      }
      return charcodesToString(codes);
    },
    decode: (input) => {
      astr("decode", input);
      const slen = input.length;
      const digits = new Uint8Array(slen);
      for (let i = 0; i < slen; i++) {
        const code = input.charCodeAt(i);
        const digit = code < 128 ? decTable[code] : -1;
        if (digit === -1)
          throw new Error(`Unknown letter "${input[i]}". Allowed: ${letters}`);
        digits[i] = digit;
      }
      return digits;
    }
  };
}
function unsafeWrapper(fn) {
  afn(fn);
  return function(...args) {
    try {
      return fn.apply(null, args);
    } catch (e) {
    }
  };
}
function checksum(len, fn) {
  anumber$2(len);
  if (len <= 0)
    throw new RangeError(`checksum length must be positive: ${len}`);
  afn(fn);
  const _fn = fn;
  return {
    encode(data) {
      abytes$2(data);
      const sum = _fn(data).slice(0, len);
      const res = new Uint8Array(data.length + len);
      res.set(data);
      res.set(sum, data.length);
      return res;
    },
    decode(data) {
      abytes$2(data);
      const payload = data.slice(0, -len);
      const oldChecksum = data.slice(-len);
      const newChecksum = _fn(payload).slice(0, len);
      for (let i = 0; i < len; i++)
        if (newChecksum[i] !== oldChecksum[i])
          throw new Error("Invalid checksum");
      return payload;
    }
  };
}
const B58_GROUP = 656356768;
const RADIX_BASE_N_MAX_LENGTH = 65536;
const BASE_N_MAX_BYTES = 2048;
const BASE_N_MAX_CHARS = 4096;
const radixBaseN = (BASE, GROUP) => ({
  encode: (bytes) => {
    abytes$2(bytes);
    const blen = bytes.length;
    if (blen === 0)
      return new Uint8Array(0);
    if (blen >= RADIX_BASE_N_MAX_LENGTH)
      throw new Error("invalid length");
    let zeros = 0;
    while (zeros < blen - 1 && bytes[zeros] === 0)
      zeros++;
    const nlimbs = Math.ceil(blen / 2);
    const limbs = new Uint16Array(nlimbs);
    const odd = blen & 1;
    if (odd)
      limbs[0] = bytes[0];
    for (let i = odd, j2 = odd; i < blen; i += 2, j2++)
      limbs[j2] = bytes[i] << 8 | bytes[i + 1];
    const groups = [];
    let pos = 0;
    while (pos < nlimbs) {
      let carry = 0;
      for (let i = pos; i < nlimbs; i++) {
        const cur = carry * 65536 + limbs[i];
        const q = Math.floor(cur / GROUP);
        carry = cur - q * GROUP;
        limbs[i] = q;
        if (q === 0 && i === pos)
          pos++;
      }
      groups.push(carry);
    }
    const top = groups.length - 1;
    let sig = top * 5;
    for (let v = groups[top]; ; v = Math.floor(v / BASE)) {
      sig++;
      if (v < BASE)
        break;
    }
    const res = new Uint8Array(zeros + sig);
    let j = res.length - 1;
    for (let g = 0; g < top; g++) {
      let v = groups[g];
      for (let k = 0; k < 5; k++) {
        res[j--] = v % BASE;
        v = Math.floor(v / BASE);
      }
    }
    for (let v = groups[top]; j >= zeros; v = Math.floor(v / BASE))
      res[j--] = v % BASE;
    return res;
  },
  decode: (digits) => {
    abytes$2(digits);
    const dlen = digits.length;
    if (dlen === 0)
      return new Uint8Array(0);
    if (dlen >= RADIX_BASE_N_MAX_LENGTH)
      throw new Error("invalid length");
    let zeros = 0;
    while (zeros < dlen - 1 && digits[zeros] === 0)
      zeros++;
    const limbs = new Uint16Array(Math.ceil(dlen * 6 / 16) + 1);
    let used = 0;
    let i = 0;
    let group = dlen % 5 || 5;
    while (i < dlen) {
      let gval = 0;
      let factor = 1;
      for (const end = i + group; i < end; i++) {
        const d = digits[i];
        if (d >= BASE)
          throw new Error(`invalid integer: ${d}`);
        gval = gval * BASE + d;
        factor *= BASE;
      }
      group = 5;
      let carry = gval;
      for (let k = 0; k < used; k++) {
        const cur = limbs[k] * factor + carry;
        carry = Math.floor(cur / 65536);
        limbs[k] = cur - carry * 65536;
      }
      for (; carry > 0; carry = Math.floor(carry / 65536))
        limbs[used++] = carry % 65536;
    }
    const valueBytes = used === 0 ? 1 : used * 2 - (limbs[used - 1] < 256 ? 1 : 0);
    const res = new Uint8Array(zeros + valueBytes);
    let j = res.length - 1;
    for (let k = 0; k < used; k++) {
      const limb = limbs[k];
      res[j--] = limb & 255;
      if (j >= zeros)
        res[j--] = limb >> 8;
    }
    return res;
  }
});
const genBaseN = (radix, abc) => {
  const letters = alphabet(abc);
  return {
    encode(bytes) {
      abytes$2(bytes);
      if (bytes.length > BASE_N_MAX_BYTES)
        throw new Error("invalid length");
      return letters.encode(radix.encode(bytes));
    },
    decode(str) {
      astr("baseN.decode", str);
      if (str.length > BASE_N_MAX_CHARS)
        throw new Error("invalid length");
      return radix.decode(letters.decode(str));
    }
  };
};
const radix58 = /* @__PURE__ */ radixBaseN(58, B58_GROUP);
const genBase58 = (abc) => genBaseN(radix58, abc);
const base58 = /* @__PURE__ */ freeze(() => genBase58("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"));
const createBase58check = (sha2562) => {
  afn(sha2562);
  const _sha256 = sha2562;
  return chain(checksum(4, (data) => _sha256(_sha256(data))), base58);
};
const BECH_ALPHABET = /* @__PURE__ */ alphabet("qpzry9x8gf2tvdw0s3jn54khce6mua7l");
const BECH_UPPERCASE_PRINTABLE = /^[\x21-\x60\x7b-\x7e]+$/;
function assertBech32Printable(label, value) {
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    if (c < 33 || c > 126)
      throw new Error(`${label}: printable ASCII expected`);
  }
}
function wordsToU8(words) {
  const len = words.length;
  const res = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    const w = words[i];
    if (w < 0 || w >= 32)
      throw new Error(`alphabet.encode: invalid digit ${w}`);
    res[i] = w;
  }
  return res;
}
const POLYMOD_GENERATORS = [996825010, 642813549, 513874426, 1027748829, 705979059];
function bech32Polymod(pre) {
  const b = pre >> 25;
  let chk = (pre & 33554431) << 5;
  for (let i = 0; i < POLYMOD_GENERATORS.length; i++) {
    if ((b >> i & 1) === 1)
      chk ^= POLYMOD_GENERATORS[i];
  }
  return chk;
}
function bechChecksum(prefix2, words, encodingConst = 1) {
  const len = prefix2.length;
  let chk = 1;
  for (let i = 0; i < len; i++) {
    const c = prefix2.charCodeAt(i);
    if (c < 33 || c > 126)
      throw new Error(`Invalid prefix (${prefix2})`);
    chk = bech32Polymod(chk) ^ c >> 5;
  }
  chk = bech32Polymod(chk);
  for (let i = 0; i < len; i++)
    chk = bech32Polymod(chk) ^ prefix2.charCodeAt(i) & 31;
  for (let v of words)
    chk = bech32Polymod(chk) ^ v;
  for (let i = 0; i < 6; i++)
    chk = bech32Polymod(chk);
  chk ^= encodingConst;
  const sum = new Uint8Array(6);
  for (let i = 0; i < 6; i++)
    sum[i] = chk >>> 5 * (5 - i) & 31;
  return BECH_ALPHABET.encode(sum);
}
function genBech32(encoding) {
  const ENCODING_CONST = encoding === "bech32" ? 1 : 734539939;
  const _words = radix2(5);
  const toWords = (from) => {
    abytes$2(from);
    const len = from.length;
    const res = new Array(Math.ceil(len * 8 / 5));
    let carry = 0;
    let pos = 0;
    let j = 0;
    for (let i = 0; i < len; i++) {
      carry = carry << 8 | from[i];
      pos += 8;
      for (; pos >= 5; pos -= 5)
        res[j++] = carry >> pos - 5 & 31;
    }
    if (pos > 0)
      res[j] = carry << 5 - pos & 31;
    return res;
  };
  const fromWords = (to) => {
    anumArr("radix2.decode", to);
    const len = to.length;
    const digits = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      const w = to[i];
      if (w < 0 || w >= 32)
        throw new Error(`convertRadix2: invalid word=${w}`);
      digits[i] = w;
    }
    return _words.decode(digits);
  };
  const fromWordsUnsafe = unsafeWrapper(fromWords);
  function encode(prefix2, words, limit = 90) {
    astr("bech32.encode prefix", prefix2);
    if (limit !== false)
      anumber$2(limit, "limit");
    if (isBytes$4(words))
      words = u8ToNumArr(words);
    anumArr("bech32.encode", words);
    const plen = prefix2.length;
    if (plen === 0)
      throw new TypeError(`Invalid prefix length ${plen}`);
    const actualLength = plen + 7 + words.length;
    if (limit !== false && actualLength > limit)
      throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
    assertBech32Printable("bech32.encode prefix", prefix2);
    const lowered = prefix2.toLowerCase();
    const sum = bechChecksum(lowered, words, ENCODING_CONST);
    return `${lowered}1${BECH_ALPHABET.encode(wordsToU8(words))}${sum}`;
  }
  function decode(str, limit = 90) {
    astr("bech32.decode input", str);
    if (limit !== false)
      anumber$2(limit, "limit");
    const slen = str.length;
    if (slen < 8 || limit !== false && slen > limit)
      throw new TypeError(`invalid string length ${slen}, expected (8..${limit})`);
    const lowered = str.toLowerCase();
    if (str !== lowered) {
      if (!BECH_UPPERCASE_PRINTABLE.test(str)) {
        assertBech32Printable("bech32.decode input", str);
        throw new Error(`mixed-case string not allowed`);
      }
    }
    const sepIndex = lowered.lastIndexOf("1");
    if (sepIndex === 0 || sepIndex === -1)
      throw new Error(`invalid separator "1"`);
    const prefix2 = lowered.slice(0, sepIndex);
    const data = lowered.slice(sepIndex + 1);
    if (data.length < 6)
      throw new Error("invalid data length");
    const digits = BECH_ALPHABET.decode(data);
    const words = u8ToNumArr(digits, digits.length - 6);
    const sum = bechChecksum(prefix2, words, ENCODING_CONST);
    if (!data.endsWith(sum))
      throw new Error(`Invalid checksum in ${str}`);
    return { prefix: prefix2, words };
  }
  const decodeUnsafe = unsafeWrapper(decode);
  function decodeToBytes(str, limit = 90) {
    const { prefix: prefix2, words } = decode(str, limit);
    return {
      prefix: prefix2,
      words,
      bytes: fromWords(words)
    };
  }
  function encodeFromBytes(prefix2, bytes) {
    return encode(prefix2, toWords(bytes));
  }
  return {
    encode,
    decode,
    encodeFromBytes,
    decodeToBytes,
    decodeUnsafe,
    fromWords,
    fromWordsUnsafe,
    toWords
  };
}
const bech32 = /* @__PURE__ */ freeze(() => genBech32("bech32"));
const bech32m = /* @__PURE__ */ freeze(() => genBech32("bech32m"));
const _isWellFormedShim = (str) => {
  try {
    return encodeURI(str) !== null;
  } catch {
    return false;
  }
};
const _isWellFormed = /* @__PURE__ */ (() => (
  // Pick the native check once so utf8.decode doesn't re-probe String.prototype on every call.
  typeof "".isWellFormed === "function" ? (str) => str.isWellFormed() : _isWellFormedShim
))();
const utf8err = (i) => new TypeError(`invalid utf8 at byte ${i}`);
const utf8Fallback = /* @__PURE__ */ freeze(() => ({
  encode(data) {
    abytes$2(data);
    let res = "";
    for (let i = 0; i < data.length; ) {
      const a = data[i++];
      if (a < 128) {
        res += String.fromCharCode(a);
        continue;
      }
      if (a < 194 || i >= data.length)
        throw utf8err(i - 1);
      const b = data[i++];
      if ((b & 192) !== 128)
        throw utf8err(i - 1);
      let cp = (a & 31) << 6 | b & 63;
      if (a >= 224) {
        if (i >= data.length)
          throw utf8err(i - 1);
        const c = data[i++];
        if ((c & 192) !== 128 || a === 224 && b < 160 || a === 237 && b >= 160)
          throw utf8err(i - 1);
        cp = (a & 15) << 12 | (b & 63) << 6 | c & 63;
        if (a >= 240) {
          if (i >= data.length)
            throw utf8err(i - 1);
          const d = data[i++];
          if (a > 244 || (d & 192) !== 128 || a === 240 && b < 144 || a === 244 && b >= 144)
            throw utf8err(i - 1);
          cp = (a & 7) << 18 | (b & 63) << 12 | (c & 63) << 6 | d & 63;
        }
      }
      if (cp < 65536)
        res += String.fromCharCode(cp);
      else {
        cp -= 65536;
        res += String.fromCharCode((cp >> 10) + 55296, (cp & 1023) + 56320);
      }
    }
    return res;
  },
  decode(str) {
    astr("utf8", str);
    if (!_isWellFormed(str))
      throw new TypeError("utf8 expected well-formed string");
    const res = new Uint8Array(str.length * 3);
    let pos = 0;
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);
      if (c < 128) {
        res[pos++] = c;
        continue;
      }
      if (c >= 55296 && c <= 57343) {
        const d = str.charCodeAt(++i);
        c = 65536 + (c - 55296 << 10) + d - 56320;
      }
      if (c >= 65536) {
        res[pos++] = c >> 18 | 240;
        res[pos++] = c >> 12 & 63 | 128;
      } else if (c >= 2048)
        res[pos++] = c >> 12 | 224;
      else
        res[pos++] = c >> 6 | 192;
      if (c >= 2048)
        res[pos++] = c >> 6 & 63 | 128;
      res[pos++] = c & 63 | 128;
    }
    return res.subarray(0, pos);
  }
}));
const utf8 = /* @__PURE__ */ freeze(() => {
  let _utf8Encoder;
  let _utf8Decoder;
  const utf8Builtin = {
    // ignoreBOM preserves an explicit leading U+FEFF;
    // fatal rejects invalid UTF-8 bytes instead of replacing them.
    encode(data) {
      abytes$2(data);
      return (_utf8Decoder || (_utf8Decoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true }))).decode(data);
    },
    decode(str) {
      astr("utf8", str);
      if (!_isWellFormed(str))
        throw new TypeError("utf8 expected well-formed string");
      return (_utf8Encoder || (_utf8Encoder = new TextEncoder())).encode(str);
    }
  };
  return {
    // Select each direction once at module init, since
    // TextEncoder and TextDecoder can exist independently.
    encode: typeof TextDecoder === "function" ? utf8Builtin.encode : utf8Fallback.encode,
    decode: typeof TextEncoder === "function" ? utf8Builtin.decode : utf8Fallback.decode
  };
});
const hexFallback = /* @__PURE__ */ freeze(() => chain(
  radix2(4),
  // Case-insensitive decode via table aliases instead of a toLowerCase pass.
  alphabet("0123456789abcdef", { A: "a", B: "b", C: "c", D: "d", E: "e", F: "f" }),
  normalize((s) => {
    astr("hex", s);
    if (s.length % 2 !== 0)
      throw new TypeError(`hex.decode: odd-length string (${s.length})`);
    return s;
  })
));
const hasHexBuiltin$1 = /* @__PURE__ */ (() => (
  // Require both directions before enabling the native hex path so encode/decode stay symmetric.
  typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
))();
const hexBuiltin = {
  // Keep local type guards so the native path preserves library-level input errors.
  // Native toHex emits lowercase hex, matching the fallback alphabet and Node's hex strings.
  encode(data) {
    abytes$2(data);
    return data.toHex();
  },
  // Native fromHex accepts either hex case and rejects odd-length / non-hex syntax.
  decode(s) {
    astr("hex", s);
    return Uint8Array.fromHex(s);
  }
};
const hex = /* @__PURE__ */ freeze(() => hasHexBuiltin$1 ? hexBuiltin : hexFallback);
/*! scure-bip32 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */
const Point$1 = /* @__PURE__ */ (() => secp256k1$1.Point)();
const Fn$1 = /* @__PURE__ */ (() => Point$1.Fn)();
const base58check$1 = /* @__PURE__ */ createBase58check(sha256$2);
const MASTER_SECRET = /* @__PURE__ */ (() => {
  return Uint8Array.from("Bitcoin seed".split(""), (char) => char.charCodeAt(0));
})();
const BITCOIN_VERSIONS = { private: 76066276, public: 76067358 };
const HARDENED_OFFSET = 2147483648;
const MAX_DEPTH = 255;
const hash160$1 = (data) => ripemd160$1(sha256$2(data));
const fromU32 = (data) => createView$2(data).getUint32(0, false);
const toU32 = (n, title = "number") => {
  if (typeof n !== "number")
    throw new TypeError(`"${title}" expected number, got type=${typeof n}`);
  if (!Number.isSafeInteger(n) || n < 0 || n > 2 ** 32 - 1)
    throw new RangeError(`"${title}" expected integer in range 0..2**32-1, got ${n}`);
  const buf = new Uint8Array(4);
  createView$2(buf).setUint32(0, n, false);
  return buf;
};
const validateVersions = (versions, title = "versions") => {
  if (!(typeof versions === "object" && versions !== null))
    throw new Error("versions must be an object");
  toU32(versions.private, `${title}.private`);
  toU32(versions.public, `${title}.public`);
  return versions;
};
class HDKey {
  constructor(opt) {
    __publicField(this, "versions");
    __publicField(this, "depth", 0);
    __publicField(this, "index", 0);
    __publicField(this, "parentFingerprint", 0);
    __publicField(this, "_chainCode", null);
    __publicField(this, "_privateKey");
    __publicField(this, "_publicKey");
    __publicField(this, "_pubHash");
    if (!opt || typeof opt !== "object") {
      throw new Error("HDKey.constructor must not be called directly");
    }
    const depth = opt.depth ?? 0;
    const index = opt.index ?? 0;
    const parentFingerprint = opt.parentFingerprint ?? 0;
    if (!Number.isSafeInteger(depth) || depth < 0 || depth > MAX_DEPTH) {
      throw new RangeError("HDKey: depth must be an integer in range 0..255");
    }
    toU32(index, "index");
    toU32(parentFingerprint, "parentFingerprint");
    if (depth === 0 && (index !== 0 || parentFingerprint !== 0)) {
      throw new Error("HDKey: zero depth with non-zero index/parent fingerprint");
    }
    this.versions = opt.versions ? validateVersions(opt.versions) : BITCOIN_VERSIONS;
    this.depth = depth;
    if (opt.chainCode)
      abytes$4(opt.chainCode, 32);
    this._chainCode = opt.chainCode ? Uint8Array.from(opt.chainCode) : null;
    this.index = index;
    this.parentFingerprint = parentFingerprint;
    if (opt.publicKey && opt.privateKey) {
      throw new Error("HDKey: publicKey and privateKey at same time.");
    }
    if (opt.privateKey) {
      if (!secp256k1$1.utils.isValidSecretKey(opt.privateKey))
        throw new Error("Invalid private key");
      this._privateKey = Uint8Array.from(opt.privateKey);
      this._publicKey = secp256k1$1.getPublicKey(this._privateKey, true);
    } else if (opt.publicKey) {
      this._publicKey = Point$1.fromBytes(opt.publicKey).toBytes(true);
    } else {
      throw new Error("HDKey: no public or private key provided");
    }
    this._pubHash = hash160$1(this._publicKey);
  }
  get fingerprint() {
    if (!this._pubHash) {
      throw new Error("No publicKey set!");
    }
    return fromU32(this._pubHash);
  }
  get identifier() {
    return this._pubHash ? Uint8Array.from(this._pubHash) : void 0;
  }
  get pubKeyHash() {
    return this._pubHash ? Uint8Array.from(this._pubHash) : void 0;
  }
  get privateKey() {
    return this._privateKey ? Uint8Array.from(this._privateKey) : null;
  }
  get publicKey() {
    return this._publicKey ? Uint8Array.from(this._publicKey) : null;
  }
  get chainCode() {
    return this._chainCode ? Uint8Array.from(this._chainCode) : null;
  }
  get privateExtendedKey() {
    const priv = this._privateKey;
    if (!priv) {
      throw new Error("No private key");
    }
    return base58check$1.encode(this.serialize(this.versions.private, concatBytes$5(Uint8Array.of(0), priv)));
  }
  get publicExtendedKey() {
    if (!this._publicKey) {
      throw new Error("No public key");
    }
    return base58check$1.encode(this.serialize(this.versions.public, this._publicKey));
  }
  static fromMasterSeed(seed, versions = BITCOIN_VERSIONS) {
    abytes$4(seed);
    versions = validateVersions(versions);
    if (8 * seed.length < 128 || 8 * seed.length > 512) {
      throw new RangeError("HDKey: seed length must be between 128 and 512 bits; 256 bits is advised, got " + seed.length);
    }
    const I = hmac$1(sha512, MASTER_SECRET, seed);
    const privateKey = I.slice(0, 32);
    const chainCode = I.slice(32);
    return new HDKey({ versions, chainCode, privateKey });
  }
  static fromExtendedKey(base58key, versions = BITCOIN_VERSIONS) {
    versions = validateVersions(versions);
    const keyBuffer = base58check$1.decode(base58key);
    if (keyBuffer.length !== 78) {
      throw new Error(`HDKey: invalid extended key length: expected 78 bytes, got ${keyBuffer.length}`);
    }
    const keyView = createView$2(keyBuffer);
    const version = keyView.getUint32(0, false);
    const opt = {
      versions,
      depth: keyBuffer[4],
      parentFingerprint: keyView.getUint32(5, false),
      index: keyView.getUint32(9, false),
      chainCode: keyBuffer.slice(13, 45)
    };
    const key = keyBuffer.slice(45);
    const isPriv = key[0] === 0;
    if (version !== versions[isPriv ? "private" : "public"]) {
      throw new Error("Version mismatch");
    }
    if (isPriv) {
      return new HDKey({ ...opt, privateKey: key.slice(1) });
    } else {
      return new HDKey({ ...opt, publicKey: key });
    }
  }
  static fromJSON(json) {
    return HDKey.fromExtendedKey("xpriv" in json ? json.xpriv : json.xpub);
  }
  derive(path2) {
    if (!/^[mM]'?/.test(path2)) {
      throw new Error('Path must start with "m" or "M"');
    }
    if (/^[mM]'?$/.test(path2)) {
      return this;
    }
    const parts = path2.replace(/^[mM]'?\//, "").split("/");
    if (parts.length > MAX_DEPTH - this.depth) {
      throw new Error("HDKey: path exceeds the serializable depth 255");
    }
    let child = this;
    for (const c of parts) {
      const m = /^(\d+)('?)$/.exec(c);
      const m1 = m && m[1];
      if (!m || m.length !== 3 || typeof m1 !== "string")
        throw new Error("invalid child index: " + c);
      let idx = +m1;
      if (!Number.isSafeInteger(idx) || idx >= HARDENED_OFFSET) {
        throw new Error("Invalid index");
      }
      if (m[2] === "'") {
        idx += HARDENED_OFFSET;
      }
      child = child.deriveChild(idx);
    }
    return child;
  }
  deriveChild(index) {
    return this._deriveChild(index);
  }
  /** Test-only implementation seam. Production callers must use deriveChild(). */
  _deriveChild(index, _I) {
    if (!this._publicKey || !this._chainCode) {
      throw new Error("No publicKey or chainCode set");
    }
    let data = toU32(index, "index");
    if (index >= HARDENED_OFFSET) {
      const priv = this._privateKey;
      if (!priv) {
        throw new Error("Could not derive hardened child key");
      }
      data = concatBytes$5(Uint8Array.of(0), priv, data);
    } else {
      data = concatBytes$5(this._publicKey, data);
    }
    const out = _I || hmac$1(sha512, this._chainCode, data);
    abytes$4(out, 64);
    const childTweak = out.slice(0, 32);
    const chainCode = out.slice(32);
    const opt = {
      versions: this.versions,
      chainCode,
      depth: this.depth + 1,
      parentFingerprint: this.fingerprint,
      index
    };
    if (opt.depth > MAX_DEPTH) {
      throw new Error("HDKey: depth exceeds the serializable value 255");
    }
    const retry = () => {
      const maxIndex = this._privateKey ? 2 ** 32 - 1 : HARDENED_OFFSET - 1;
      if (index >= maxIndex) {
        throw new Error(`HDKey: cannot retry child derivation at index ${index}`);
      }
      return this.deriveChild(index + 1);
    };
    const ctweak = Fn$1.fromBytes(childTweak, true);
    if (!Fn$1.isValid(ctweak))
      return retry();
    if (this._privateKey) {
      const added = Fn$1.create(Fn$1.fromBytes(this._privateKey) + ctweak);
      if (!Fn$1.isValidNot0(added))
        return retry();
      opt.privateKey = Fn$1.toBytes(added);
    } else {
      const point = Point$1.fromBytes(this._publicKey);
      const added = ctweak === 0n ? point : point.add(Point$1.BASE.multiply(ctweak));
      if (added.equals(Point$1.ZERO))
        return retry();
      opt.publicKey = added.toBytes(true);
    }
    return new HDKey(opt);
  }
  sign(hash) {
    if (!this._privateKey) {
      throw new Error("No privateKey set!");
    }
    abytes$4(hash, 32);
    return secp256k1$1.sign(hash, this._privateKey, { prehash: false });
  }
  verify(hash, signature) {
    abytes$4(hash, 32);
    abytes$4(signature, 64);
    if (!this._publicKey) {
      throw new Error("No publicKey set!");
    }
    return secp256k1$1.verify(signature, hash, this._publicKey, { prehash: false });
  }
  wipePrivateData() {
    if (this._privateKey) {
      this._privateKey.fill(0);
      this._privateKey = void 0;
    }
    return this;
  }
  // TODO(v3): Make automatic JSON serialization public-only so JSON.stringify cannot expose xpriv.
  toJSON() {
    return this.toPrivateJSON();
  }
  /**
   * Explicitly exports private key material. Treat the returned value as a secret.
   */
  toPrivateJSON() {
    return {
      xpriv: this.privateExtendedKey,
      xpub: this.publicExtendedKey
    };
  }
  serialize(version, key) {
    if (!this._chainCode) {
      throw new Error("No chainCode set");
    }
    abytes$4(key, 33);
    return concatBytes$5(toU32(version, "version"), new Uint8Array([this.depth]), toU32(this.parentFingerprint, "parentFingerprint"), toU32(this.index, "index"), this._chainCode, key);
  }
}
const fromNumH = (n) => n / 2 ** 32 | 0;
const fromNumL = (n) => n >>> 0;
function setU64FromNum(view2, byteOffset, n, isLE) {
  const h = fromNumH(n);
  const l = fromNumL(n);
  view2.setUint32(byteOffset, isLE ? l : h, isLE);
  view2.setUint32(byteOffset + 4, isLE ? h : l, isLE);
}
function isBytes$3(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
const atitle$1 = (title) => title ? `"${title}" ` : "";
function anumber$1(n, title = "") {
  if (typeof n !== "number")
    throw new TypeError(atitle$1(title) + "expected number, got " + typeof n);
  if (!Number.isSafeInteger(n) || n < 0)
    throw new RangeError(atitle$1(title) + "expected integer >= 0, got " + n);
  return n;
}
function abytes$1(value, length, title = "") {
  if (isBytes$3(value) && (length === void 0 || value.length === length))
    return value;
  if (length !== void 0)
    anumber$1(length, "length");
  const bytes = isBytes$3(value);
  const ofLen = length !== void 0 ? ` of length ${length}` : "";
  const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
  const message = atitle$1(title) + "expected Uint8Array" + ofLen + ", got " + got;
  if (!bytes)
    throw new TypeError(message);
  throw new RangeError(message);
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new TypeError("expected hash wrapped by utils.createHasher");
  anumber$1(h.outputLen);
  anumber$1(h.blockLen);
  if (h.outputLen < 1 || h.blockLen < 1)
    throw new Error("hash blockLen / outputLen must be >= 1");
}
const aobject$1 = (value, label) => {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError((label === "object" ? "" : `"${label}" `) + "expected object, got type=" + typeof value);
};
const aopts = (value, label) => {
  aobject$1(value, label);
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null)
    throw new TypeError(`"${label}" expected plain object`);
  if (Object.hasOwn(value, "__proto__"))
    throw new TypeError(`"${label}.__proto__" is not allowed`);
};
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("hash was destroyed");
  if (checkFinished && instance.finished)
    throw new Error("digest() was already called");
}
function aoutput(out, instance) {
  abytes$1(out, void 0, "output");
  const min = instance.outputLen;
  if (!(out.length >= min)) {
    throw new RangeError('"output" expected length >= ' + min);
  }
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView$1(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function rotl(word, shift) {
  return word << shift | word >>> 32 - shift >>> 0;
}
const hasHexBuiltin = /* @__PURE__ */ (() => (
  // @ts-ignore
  typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
))();
const hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToHex$1(bytes) {
  abytes$1(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex2 = "";
  for (let i = 0; i < bytes.length; i++) {
    hex2 += hexes[bytes[i]];
  }
  return hex2;
}
function asciiToBase16(ch) {
  return ch >= 48 && ch <= 57 ? ch - 48 : ch >= 65 && ch <= 70 ? ch - (65 - 10) : ch >= 97 && ch <= 102 ? ch - (97 - 10) : void 0;
}
function hexToBytes$1(hex2) {
  if (typeof hex2 !== "string")
    throw new TypeError("hex string expected, got " + typeof hex2);
  if (hasHexBuiltin) {
    try {
      return Uint8Array.fromHex(hex2);
    } catch (error) {
      if (error instanceof SyntaxError)
        throw new RangeError(error.message);
      throw error;
    }
  }
  const hl = hex2.length;
  const al = hl / 2;
  if (hl % 2)
    throw new RangeError("hex string expected, got unpadded hex of length " + hl);
  const array2 = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex2.charCodeAt(hi));
    const n2 = asciiToBase16(hex2.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex2[hi] + hex2[hi + 1];
      throw new RangeError('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array2[ai] = n1 * 16 + n2;
  }
  return array2;
}
function concatBytes$3(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes$1(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad);
    pad += a.length;
  }
  return res;
}
function checkOpts(defaults, opts, title = "opts") {
  aopts(defaults, "defaults");
  if (opts !== void 0)
    aopts(opts, title);
  const merged = Object.assign(/* @__PURE__ */ Object.create(null), defaults, opts);
  return merged;
}
function createHasher(hashCons, info = {}) {
  if (typeof hashCons !== "function")
    throw new TypeError('"hashCons" expected function, got type=' + typeof hashCons);
  info = checkOpts({}, info, "info");
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.canXOF = tmp.canXOF;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
function randomBytes$1(bytesLength = 32) {
  anumber$1(bytesLength, "bytesLength");
  const cr = typeof globalThis === "object" ? globalThis.crypto : null;
  if (typeof (cr == null ? void 0 : cr.getRandomValues) !== "function")
    throw new Error("crypto.getRandomValues must be defined");
  if (bytesLength > 65536)
    throw new RangeError(`"bytesLength" expected <= 65536, got ${bytesLength}`);
  return cr.getRandomValues(new Uint8Array(bytesLength));
}
const oidNist = (suffix) => ({
  // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
  // Larger suffix values would need base-128 OID encoding and a different length byte.
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
});
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
class HashMD3 {
  constructor(blockLen, outputLen, padOffset, isLE) {
    __publicField(this, "blockLen");
    __publicField(this, "outputLen");
    __publicField(this, "canXOF", false);
    __publicField(this, "padOffset");
    __publicField(this, "isLE");
    // For partial updates less than block size
    __publicField(this, "buffer");
    __publicField(this, "view");
    __publicField(this, "finished", false);
    __publicField(this, "length", 0);
    __publicField(this, "pos", 0);
    __publicField(this, "destroyed", false);
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView$1(this.buffer);
  }
  update(data) {
    aexists(this);
    abytes$1(data);
    const { view: view2, buffer, blockLen } = this;
    const len = data.length;
    let processed = false;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView$1(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        processed = true;
        continue;
      }
      buffer.set(pos === 0 && take === len ? data : data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view2, 0);
        this.pos = 0;
        processed = true;
      }
    }
    this.length += data.length;
    if (processed)
      this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view: view2, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    buffer.fill(0, pos);
    if (this.padOffset > blockLen - pos) {
      this.process(view2, 0);
      buffer.fill(0);
    }
    setU64FromNum(view2, blockLen - 8, this.length * 8, isLE);
    this.process(view2, 0);
    this.roundClean();
    const oview = out === buffer ? view2 : createView$1(out);
    const len = this.outputLen;
    const outLen = len / 4;
    const state = this.get();
    if (len % 4 || outLen > state.length)
      throw new Error("invalid outputLen");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneIntoMeta(to) {
    const { buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (pos)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
}
const SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
const SHA256_K = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
const SHA256_W = /* @__PURE__ */ new Uint32Array(64);
class SHA2_32B2 extends HashMD3 {
  constructor(outputLen, IV) {
    super(64, outputLen, 8, false);
    // We cannot use array here since array allows indexing by variable
    // which means optimizer/compiler cannot use registers.
    // Numeric initializers matter: starting the fields as `undefined` changes
    // V8's field representation and makes sha256 3x slower (measured).
    __publicField(this, "A", 0);
    __publicField(this, "B", 0);
    __publicField(this, "C", 0);
    __publicField(this, "D", 0);
    __publicField(this, "E", 0);
    __publicField(this, "F", 0);
    __publicField(this, "G", 0);
    __publicField(this, "H", 0);
    this.A = IV[0] | 0;
    this.B = IV[1] | 0;
    this.C = IV[2] | 0;
    this.D = IV[3] | 0;
    this.E = IV[4] | 0;
    this.F = IV[5] | 0;
    this.G = IV[6] | 0;
    this.H = IV[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  _cloneInto(to) {
    (to || (to = new this.constructor())).set(...this.get());
    return this._cloneIntoMeta(to);
  }
  process(view2, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W[i] = view2.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W[i - 15];
      const W2 = SHA256_W[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean(SHA256_W);
  }
  destroy() {
    this.destroyed = true;
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
}
class _SHA2562 extends SHA2_32B2 {
  constructor() {
    super(32, SHA256_IV);
  }
}
const sha256$1 = /* @__PURE__ */ createHasher(
  () => new _SHA2562(),
  /* @__PURE__ */ oidNist(1)
);
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function aarray$1(item, title, inner = () => {
}) {
  if (!Array.isArray(item))
    throw new TypeError(`"${title}" expected array, got type=${typeof item}`);
  for (let i = 0; i < item.length; i++)
    inner(item[i], `${title}[${i}]`);
  return item;
}
const abytes = (value, length, title) => abytes$1(value, length, title);
const anumber = anumber$1;
function astring$1(value, title = "") {
  if (typeof value !== "string") {
    const prefix2 = title && `"${title}" `;
    throw new TypeError(prefix2 + "expected string, got type=" + typeof value);
  }
  return value;
}
function aobject(value, title = "object") {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError(title === "object" ? "expected valid options object" : `"${title}" expected object, got type=${typeof value}`);
  return value;
}
function afunction(value, title) {
  if (typeof value !== "function")
    throw new TypeError(`"${title}" is invalid: expected function, got ${typeof value}`);
  return value;
}
const bytesToHex = bytesToHex$1;
const concatBytes$2 = (...arrays) => concatBytes$3(...arrays);
const hexToBytes = (hex2) => hexToBytes$1(hex2);
const isBytes$2 = isBytes$3;
const randomBytes = (bytesLength) => randomBytes$1(bytesLength);
const _0n$a = /* @__PURE__ */ BigInt(0);
const _1n$7 = /* @__PURE__ */ BigInt(1);
const atitle = (title) => title ? `"${title}" ` : "";
function abool(value, title = "") {
  if (typeof value !== "boolean")
    throw new TypeError(atitle(title) + "expected boolean, got type=" + typeof value);
  return value;
}
function abignumber(n) {
  if (typeof n === "bigint") {
    if (!isPosBig(n))
      throw new RangeError("positive bigint expected, got " + n);
  } else
    anumber(n);
  return n;
}
function asafenumber(value, title = "") {
  if (typeof value !== "number") {
    const prefix2 = title && `"${title}" `;
    throw new TypeError(prefix2 + "expected number, got type=" + typeof value);
  }
  if (!Number.isSafeInteger(value)) {
    const prefix2 = title && `"${title}" `;
    throw new RangeError(prefix2 + "expected safe integer, got " + value);
  }
}
function numberToHexUnpadded(num2) {
  const hex2 = abignumber(num2).toString(16);
  return hex2.length & 1 ? "0" + hex2 : hex2;
}
function hexToNumber(hex2) {
  if (typeof hex2 !== "string")
    throw new TypeError("hex string expected, got " + typeof hex2);
  return hex2 === "" ? _0n$a : BigInt("0x" + hex2);
}
function bytesToNumberBE(bytes) {
  return hexToNumber(bytesToHex$1(bytes));
}
function bytesToNumberLE(bytes) {
  return hexToNumber(bytesToHex$1(copyBytes(abytes$1(bytes)).reverse()));
}
function numberToBytesBE(n, len) {
  anumber$1(len);
  if (len === 0)
    throw new Error("zero output length is invalid");
  n = abignumber(n);
  const expectedLen = len * 2;
  const hex2 = n.toString(16);
  if (hex2.length > expectedLen)
    throw new RangeError("number is too large");
  return hexToBytes$1(hex2.padStart(expectedLen, "0"));
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function copyBytes(bytes) {
  return Uint8Array.from(abytes(bytes));
}
function asciiToBytes(ascii) {
  if (typeof ascii !== "string")
    throw new TypeError("ascii string expected, got " + typeof ascii);
  return Uint8Array.from(ascii, (c, i) => {
    const charCode = c.charCodeAt(0);
    if (c.length !== 1 || charCode > 127) {
      throw new RangeError(`string contains non-ASCII character "${ascii[i]}" with code ${charCode} at position ${i}`);
    }
    return charCode;
  });
}
function isPosBig(n) {
  return typeof n === "bigint" && _0n$a <= n;
}
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new RangeError("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen(n) {
  if (n < _0n$a)
    throw new Error("expected non-negative bigint, got " + n);
  return n === _0n$a ? 0 : n.toString(2).length;
}
const bitMask = (n) => {
  asafenumber(n, "n");
  return (_1n$7 << BigInt(n)) - _1n$7;
};
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
  anumber$1(hashLen, "hashLen");
  anumber$1(qByteLen, "qByteLen");
  if (typeof hmacFn !== "function")
    throw new TypeError("hmacFn must be a function");
  const u8n = (len) => new Uint8Array(len);
  const NULL2 = Uint8Array.of();
  const byte0 = Uint8Array.of(0);
  const byte1 = Uint8Array.of(1);
  const _maxDrbgIters = 1e3;
  let v = u8n(hashLen);
  let k = u8n(hashLen);
  let i = 0;
  const reset = () => {
    v.fill(1);
    k.fill(0);
    i = 0;
  };
  const h = (...msgs) => hmacFn(k, concatBytes$2(v, ...msgs));
  const reseed = (seed = NULL2) => {
    k = h(byte0, seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(byte1, seed);
    v = h();
  };
  const gen = () => {
    if (i++ >= _maxDrbgIters)
      throw new Error("drbg: tried max amount of iterations");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes$2(...out);
  };
  const genUntil = (seed, pred) => {
    reset();
    reseed(seed);
    let res = void 0;
    while ((res = pred(gen())) === void 0)
      reseed();
    reset();
    return res;
  };
  return genUntil;
}
function validateObject$1(object, fields = {}, optFields = {}, title = "object") {
  aobject(object, title);
  aobject(fields, "fields");
  aobject(optFields, "optFields");
  function checkField(fieldName, expectedType, isOpt) {
    const label = title === "object" ? `param "${String(fieldName)}"` : `"${title}.${String(fieldName)}"`;
    const val = object[fieldName];
    if (!Object.hasOwn(object, fieldName) && (isOpt ? val !== void 0 : expectedType !== "function")) {
      throw new TypeError(`${label} is invalid: expected own property`);
    }
    if (isOpt && val === void 0)
      return;
    const current = typeof val;
    if (current !== expectedType || val === null)
      throw new TypeError(`${label} is invalid: expected ${expectedType}, got ${current}`);
  }
  const iter = (f, isOpt) => Object.entries(f).forEach(([k, v]) => checkField(k, v, isOpt));
  iter(fields, false);
  iter(optFields, true);
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n$9 = /* @__PURE__ */ BigInt(0), _1n$6 = /* @__PURE__ */ BigInt(1), _2n$5 = /* @__PURE__ */ BigInt(2);
const _3n$1 = /* @__PURE__ */ BigInt(3), _4n$2 = /* @__PURE__ */ BigInt(4), _5n = /* @__PURE__ */ BigInt(5);
const _7n = /* @__PURE__ */ BigInt(7), _8n$2 = /* @__PURE__ */ BigInt(8), _9n = /* @__PURE__ */ BigInt(9);
const _15n = /* @__PURE__ */ BigInt(15), _16n = /* @__PURE__ */ BigInt(16);
const POW_WINDOWED_MIN = /* @__PURE__ */ BigInt("0x10000000000000000");
function mod(a, b) {
  if (b <= _0n$9)
    throw new Error("mod: expected positive modulus, got " + b);
  const result = a % b;
  return result >= _0n$9 ? result : b + result;
}
function pow(num2, power, modulo) {
  if (modulo <= _1n$6)
    throw new Error("pow: expected modulus > 1, got " + modulo);
  if (typeof power !== "bigint")
    throw new TypeError("invalid exponent: expected bigint, got " + typeof power);
  if (power < _0n$9)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n$9)
    return _1n$6;
  if (power === _1n$6)
    return num2;
  let d = num2 % modulo;
  if (d < _0n$9)
    d += modulo;
  if (power < POW_WINDOWED_MIN) {
    let p2 = _1n$6;
    while (power > _0n$9) {
      if (power & _1n$6)
        p2 = p2 * d % modulo;
      d = d * d % modulo;
      power >>= _1n$6;
    }
    return p2;
  }
  const digits = [];
  while (power > _0n$9) {
    digits.push(Number(power & _15n));
    power >>= _4n$2;
  }
  const table = new Array(16);
  table[0] = _1n$6;
  table[1] = d;
  for (let i = 2; i < 16; i++)
    table[i] = table[i - 1] * d % modulo;
  let p = table[digits[digits.length - 1]];
  for (let w = digits.length - 2; w >= 0; w--) {
    p = p * p % modulo;
    p = p * p % modulo;
    p = p * p % modulo;
    p = p * p % modulo;
    const digit = digits[w];
    if (digit !== 0)
      p = p * table[digit] % modulo;
  }
  return p;
}
function pow2(x, power, modulo) {
  if (modulo <= _1n$6)
    throw new Error("pow2: expected modulus > 1, got " + modulo);
  if (power < _0n$9)
    throw new Error("pow2: expected non-negative exponent, got " + power);
  let res = x;
  while (power-- > _0n$9) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert(number, modulo) {
  if (number === _0n$9)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _1n$6)
    throw new Error("invert: expected modulus > 1, got " + modulo);
  let a = mod(number, modulo);
  let b = modulo;
  let x = _0n$9, u = _1n$6;
  while (a !== _0n$9) {
    const q = b / a;
    const r = b - a * q;
    const m = x - u * q;
    b = a, a = r, x = u, u = m;
  }
  const gcd = b;
  if (gcd !== _1n$6)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
function invertCt(a, prime) {
  if (prime <= _1n$6)
    throw new Error("invertCt: expected prime modulus > 1, got " + prime);
  const an = mod(a, prime);
  if (an === _0n$9)
    throw new Error("invertCt: expected non-zero number");
  const inverse = pow(an, prime - _2n$5, prime);
  if (mod(an * inverse, prime) !== _1n$6)
    throw new Error("invertCt: does not exist");
  return inverse;
}
function assertIsSquare(Fp, root, n) {
  const F = Fp;
  if (!F.eql(F.sqr(root), n))
    throw new Error("Cannot find square root");
}
function aoddModulus(order, fnName) {
  if ((order & _1n$6) === _0n$9)
    throw new Error(fnName + ": expected odd modulus, got " + order);
}
function sqrt3mod4(Fp, n) {
  const F = Fp;
  const p1div4 = (F.ORDER + _1n$6) / _4n$2;
  const root = F.pow(n, p1div4);
  assertIsSquare(F, root, n);
  return root;
}
function sqrt5mod8(Fp, n) {
  const F = Fp;
  const p5div8 = (F.ORDER - _5n) / _8n$2;
  const n2 = F.mul(n, _2n$5);
  const v = F.pow(n2, p5div8);
  const nv = F.mul(n, v);
  const i = F.mul(F.mul(nv, _2n$5), v);
  const root = F.mul(nv, F.sub(i, F.ONE));
  assertIsSquare(F, root, n);
  return root;
}
function sqrt9mod16(P) {
  const Fp_ = Field(P);
  const tn = tonelliShanks(P);
  const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
  const c2 = tn(Fp_, c1);
  const c3 = tn(Fp_, Fp_.neg(c1));
  const c4 = (P + _7n) / _16n;
  return (Fp, n) => {
    const F = Fp;
    let tv1 = F.pow(n, c4);
    let tv2 = F.mul(tv1, c1);
    const tv3 = F.mul(tv1, c2);
    const tv4 = F.mul(tv1, c3);
    const e1 = F.eql(F.sqr(tv2), n);
    const e2 = F.eql(F.sqr(tv3), n);
    tv1 = F.cmov(tv1, tv2, e1);
    tv2 = F.cmov(tv4, tv3, e2);
    const e3 = F.eql(F.sqr(tv2), n);
    const root = F.cmov(tv1, tv2, e3);
    assertIsSquare(F, root, n);
    return root;
  };
}
function tonelliShanks(P) {
  if (P < _3n$1)
    throw new Error("sqrt is not defined for small field");
  aoddModulus(P, "tonelliShanks");
  let Q = P - _1n$6;
  let S = 0;
  while (Q % _2n$5 === _0n$9) {
    Q /= _2n$5;
    S++;
  }
  let Z = _2n$5;
  const _Fp = Field(P);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n$6) / _2n$5;
  return function tonelliSlow(Fp, n) {
    const F = Fp;
    if (F.is0(n))
      return n;
    if (FpLegendre(F, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = F.mul(F.ONE, cc);
    let t2 = F.pow(n, Q);
    let R = F.pow(n, Q1div2);
    while (!F.eql(t2, F.ONE)) {
      if (F.is0(t2))
        throw new Error("Cannot find square root: probably non-prime P");
      let i = 1;
      let t_tmp = F.sqr(t2);
      while (!F.eql(t_tmp, F.ONE)) {
        i++;
        t_tmp = F.sqr(t_tmp);
        if (i === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n$6 << BigInt(M - i - 1);
      const b = F.pow(c, exponent);
      M = i;
      c = F.sqr(b);
      t2 = F.mul(t2, c);
      R = F.mul(R, b);
    }
    return R;
  };
}
function FpSqrt(P) {
  aoddModulus(P, "Fp.sqrt");
  if (P % _4n$2 === _3n$1)
    return sqrt3mod4;
  if (P % _8n$2 === _5n)
    return sqrt5mod8;
  if (P % _16n === _9n)
    return sqrt9mod16(P);
  return tonelliShanks(P);
}
const FIELD_FIELDS = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function validateField(field) {
  aobject(field, "field");
  if (typeof field.ORDER !== "bigint")
    throw new TypeError('param "ORDER" is invalid: expected bigint, got ' + typeof field.ORDER);
  asafenumber(field.BYTES, "BYTES");
  asafenumber(field.BITS, "BITS");
  for (const name of FIELD_FIELDS)
    afunction(field[name], "field." + name);
  if (field.BYTES < 1 || field.BITS < 1)
    throw new Error("invalid field: expected BYTES/BITS > 0");
  if (field.ORDER <= _1n$6)
    throw new Error("invalid field: expected ORDER > 1, got " + field.ORDER);
  return field;
}
function FpInvertBatch(Fp, nums, passZero = false) {
  validateField(Fp);
  aarray$1(nums, "nums");
  abool(passZero, "passZero");
  const F = Fp;
  const inverted = new Array(nums.length).fill(passZero ? F.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num2, i) => {
    if (F.is0(num2))
      return acc;
    inverted[i] = acc;
    return F.mul(acc, num2);
  }, F.ONE);
  const invertedAcc = F.inv(multipliedAcc);
  nums.reduceRight((acc, num2, i) => {
    if (F.is0(num2))
      return acc;
    inverted[i] = F.mul(acc, inverted[i]);
    return F.mul(acc, num2);
  }, invertedAcc);
  return inverted;
}
function FpLegendre(Fp, n) {
  validateField(Fp);
  const F = Fp;
  aoddModulus(F.ORDER, "FpLegendre");
  const p1mod2 = (F.ORDER - _1n$6) / _2n$5;
  const powered = F.pow(n, p1mod2);
  const yes = F.eql(powered, F.ONE);
  const zero = F.eql(powered, F.ZERO);
  const no = F.eql(powered, F.neg(F.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength(n, nBitLength) {
  if (nBitLength !== void 0)
    anumber(nBitLength);
  if (n <= _0n$9)
    throw new Error("invalid n length: expected positive n, got " + n);
  if (nBitLength !== void 0 && nBitLength < 1)
    throw new Error("invalid n length: expected positive bit length, got " + nBitLength);
  const bits = bitLen(n);
  if (nBitLength !== void 0 && nBitLength < bits)
    throw new Error(`invalid n length: expected nBitLength (${nBitLength}) >= bitLen(n) (${bits})`);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : bits;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
const FIELD_SQRT = /* @__PURE__ */ new WeakMap();
class _Field2 {
  constructor(ORDER, opts = {}) {
    __publicField(this, "ORDER");
    __publicField(this, "BITS");
    __publicField(this, "BYTES");
    __publicField(this, "isLE");
    __publicField(this, "ZERO", _0n$9);
    __publicField(this, "ONE", _1n$6);
    __publicField(this, "_lengths");
    __publicField(this, "_mod");
    if (ORDER <= _1n$6)
      throw new Error("invalid field: expected ORDER > 1, got " + ORDER);
    let _nbitLength = void 0;
    this.isLE = false;
    if (opts != null && typeof opts === "object") {
      if (typeof opts.BITS === "number")
        _nbitLength = opts.BITS;
      if (typeof opts.sqrt === "function")
        Object.defineProperty(this, "sqrt", { value: opts.sqrt, enumerable: true });
      if (typeof opts.isLE === "boolean")
        this.isLE = opts.isLE;
      if (opts.allowedLengths)
        this._lengths = Object.freeze(opts.allowedLengths.slice());
      if (typeof opts.modFromBytes === "boolean")
        this._mod = opts.modFromBytes;
    }
    const { nBitLength, nByteLength } = nLength(ORDER, _nbitLength);
    if (nByteLength > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = ORDER;
    this.BITS = nBitLength;
    this.BYTES = nByteLength;
    Object.freeze(this);
  }
  create(num2) {
    return mod(num2, this.ORDER);
  }
  isValid(num2) {
    if (typeof num2 !== "bigint")
      throw new TypeError("invalid field element: expected bigint, got " + typeof num2);
    return _0n$9 <= num2 && num2 < this.ORDER;
  }
  is0(num2) {
    return num2 === _0n$9;
  }
  // is valid and invertible
  isValidNot0(num2) {
    return !this.is0(num2) && this.isValid(num2);
  }
  isOdd(num2) {
    return (num2 & _1n$6) === _1n$6;
  }
  neg(num2) {
    return mod(-num2, this.ORDER);
  }
  eql(lhs, rhs) {
    return lhs === rhs;
  }
  sqr(num2) {
    return mod(num2 * num2, this.ORDER);
  }
  add(lhs, rhs) {
    return mod(lhs + rhs, this.ORDER);
  }
  sub(lhs, rhs) {
    return mod(lhs - rhs, this.ORDER);
  }
  mul(lhs, rhs) {
    return mod(lhs * rhs, this.ORDER);
  }
  pow(num2, power) {
    return pow(num2, power, this.ORDER);
  }
  div(lhs, rhs) {
    return mod(lhs * invert(rhs, this.ORDER), this.ORDER);
  }
  // Same as above, but doesn't normalize
  sqrN(num2) {
    return num2 * num2;
  }
  addN(lhs, rhs) {
    return lhs + rhs;
  }
  subN(lhs, rhs) {
    return lhs - rhs;
  }
  mulN(lhs, rhs) {
    return lhs * rhs;
  }
  inv(num2) {
    return invert(num2, this.ORDER);
  }
  sqrt(num2) {
    let sqrt = FIELD_SQRT.get(this);
    if (!sqrt)
      FIELD_SQRT.set(this, sqrt = FpSqrt(this.ORDER));
    return sqrt(this, num2);
  }
  toBytes(num2) {
    return this.isLE ? numberToBytesLE(num2, this.BYTES) : numberToBytesBE(num2, this.BYTES);
  }
  fromBytes(bytes, skipValidation = false) {
    abytes(bytes);
    const { _lengths: allowedLengths, BYTES, isLE, ORDER, _mod: modFromBytes } = this;
    if (allowedLengths) {
      if (bytes.length < 1 || !allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
        throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
      }
      const padded = new Uint8Array(BYTES);
      padded.set(bytes, isLE ? 0 : padded.length - bytes.length);
      bytes = padded;
    }
    if (bytes.length !== BYTES)
      throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
    let scalar = isLE ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
    if (modFromBytes)
      scalar = mod(scalar, ORDER);
    if (!skipValidation) {
      if (!this.isValid(scalar))
        throw new Error("invalid field element: outside of range 0..ORDER");
    }
    return scalar;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(lst) {
    return FpInvertBatch(this, lst, true);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(a, b, condition) {
    abool(condition, "condition");
    return condition ? b : a;
  }
}
function Field(ORDER, opts = {}) {
  Object.freeze(_Field2.prototype);
  return new _Field2(ORDER, opts);
}
function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  if (fieldOrder <= _1n$6)
    throw new Error("field order must be greater than 1");
  const bitLength = bitLen(fieldOrder - _1n$6);
  return Math.ceil(bitLength / 8);
}
function getMinHashLength(fieldOrder) {
  const length = getFieldBytesLength(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField(key, fieldOrder, isLE = false) {
  abytes(key);
  const len = key.length;
  const fieldLen = getFieldBytesLength(fieldOrder);
  const minLen = Math.max(getMinHashLength(fieldOrder), 16);
  if (len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num2 = isLE ? bytesToNumberLE(key) : bytesToNumberBE(key);
  const reduced = mod(num2, fieldOrder - _1n$6) + _1n$6;
  return isLE ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n$8 = /* @__PURE__ */ BigInt(0);
const _1n$5 = /* @__PURE__ */ BigInt(1);
const _4n$1 = /* @__PURE__ */ BigInt(4);
const BLIND_BYTES = 16;
const BLIND_BITS = 128;
const FW_WINDOW = 5;
const TABLE_BYTES_MAX = /* @__PURE__ */ (() => 2 ** 31)();
function validatePointCons(Point2) {
  const pc = Point2;
  if (typeof pc !== "function")
    throw new TypeError('"Point" expected constructor, got type=' + typeof Point2);
  afunction(pc.fromAffine, "Point.fromAffine");
  afunction(pc.fromBytes, "Point.fromBytes");
  afunction(pc.fromHex, "Point.fromHex");
  aobject(pc.BASE, "Point.BASE");
  aobject(pc.ZERO, "Point.ZERO");
  validateField(pc.Fp);
  validateField(pc.Fn);
}
function normalizeZ(c, points) {
  validatePointCons(c);
  validateMSMPoints(points, c);
  const invertedZs = FpInvertBatch(c.Fp, points.map((p) => p.Z));
  return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
}
function validateW(W, bits, min = 1) {
  if (!Number.isSafeInteger(W) || W < min || W > bits)
    throw new Error("invalid window size, expected [" + min + ".." + bits + "], got W=" + W);
}
function validateTableBytes(numPoints, fpBytes) {
  const bytes = numPoints * (4 * fpBytes + 128);
  if (bytes > TABLE_BYTES_MAX)
    throw new Error("invalid window size: table would need ~" + Math.ceil(bytes / 2 ** 20) + " MiB, max " + TABLE_BYTES_MAX / 2 ** 20 + " MiB");
}
function probeRandomBytes(randomBytes2, length) {
  if (randomBytes2 === void 0)
    return void 0;
  afunction(randomBytes2, "randomBytes");
  try {
    const probe = randomBytes2(length);
    if (!isBytes$2(probe) || probe.length !== length)
      return void 0;
  } catch {
    return void 0;
  }
  return randomBytes2;
}
function validateMSMPoints(points, c) {
  aarray$1(points, "points");
  points.forEach((p, i) => {
    if (!(p instanceof c))
      throw new Error("invalid point at index " + i);
  });
}
function validateMSMScalars(scalars, field, maxScalar) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s, i) => {
    const ok = maxScalar === void 0 ? field.isValid(s) : isPosBig(s) && s < maxScalar;
    if (!ok)
      throw new Error("invalid scalar at index " + i);
  });
}
const pointWindowSizes = /* @__PURE__ */ new WeakMap();
function getWindowSize(P) {
  return pointWindowSizes.get(P) || 1;
}
function oddMultiples(p, size) {
  const dbl = p.double();
  const t2 = [p];
  for (let j = 1; j < size; j++)
    t2.push(t2[j - 1].add(dbl));
  return t2;
}
function wnafDigits(n, W) {
  const size = 2 ** W;
  const half = size / 2;
  const mask = BigInt(size - 1);
  const d = [];
  while (n > _0n$8) {
    let w = 0;
    if (n & _1n$5) {
      w = Number(n & mask);
      if (w >= half)
        w -= size;
      n -= BigInt(w);
    }
    d.push(w);
    n >>= _1n$5;
  }
  return d;
}
function signedWindowDigits(n, W, windows) {
  const size = 2 ** W;
  const half = size / 2;
  const mask = BigInt(size - 1);
  const shiftBy = BigInt(W);
  const d = [];
  for (let w = 0; w < windows; w++) {
    let v = Number(n & mask);
    n >>= shiftBy;
    if (v > half) {
      v -= size;
      n += _1n$5;
    }
    d.push(v);
  }
  if (n !== _0n$8)
    throw new Error("invalid wnaf");
  return d;
}
function wnafWalk(zero, tables, digits) {
  let max = 0;
  for (const d of digits)
    max = Math.max(max, d.length);
  let acc = zero;
  for (let bit = max - 1; bit >= 0; bit--) {
    if (bit !== max - 1)
      acc = acc.double();
    for (let i = 0; i < digits.length; i++) {
      const w = digits[i][bit];
      if (w) {
        const item = tables[i][Math.abs(w) - 1 >> 1];
        acc = acc.add(w < 0 ? item.negate() : item);
      }
    }
  }
  return acc;
}
class ScalarMultiplier2 {
  // Parametrized with a given Point class (not individual point)
  constructor(Point2, randomBytes2) {
    __publicField(this, "Point");
    __publicField(this, "BASE");
    __publicField(this, "ZERO");
    __publicField(this, "randomBytes");
    __publicField(this, "wnafPrecomputes", /* @__PURE__ */ new WeakMap());
    __publicField(this, "baseCanBeBlinded");
    __publicField(this, "bits");
    validatePointCons(Point2);
    this.randomBytes = probeRandomBytes(randomBytes2, BLIND_BYTES);
    this.Point = Point2;
    this.BASE = Point2.BASE;
    this.ZERO = Point2.ZERO;
    this.bits = Point2.Fn.BITS;
  }
  /**
   * Creates a signed fixed-window wNAF precomputation table: for every window w, the
   * multiples `[1..2^(W−1)]⋅2^(w⋅W)⋅P`, flattened. All doublings are baked into the table,
   * so cached multiplication is additions-only. `windows = ceil(bits/W) + 1`: the extra
   * window absorbs the final carry of signed-digit recoding.
   * For a 256-bit curve and W=6, the table is 44⋅32 = 1408 points.
   * @param point - Point instance
   * @param W - window size
   * @param bits - scalar bitlength the table must cover
   */
  buildWnafTable(point, W, bits) {
    const windows = Math.ceil(bits / W) + 1;
    const half = 2 ** (W - 1);
    const comp = [];
    let base = point;
    for (let w = 0; w < windows; w++) {
      let acc = base;
      for (let i = 0; i < half; i++) {
        comp.push(acc);
        acc = acc.add(base);
      }
      base = comp[comp.length - 1].double();
    }
    return { W, bits, windows, comp };
  }
  /**
   * Implements ec multiplication using precomputed signed fixed-window wNAF tables.
   * Constant-time: fixed window count with one table addition per window — zero digits feed
   * the fake accumulator — and no doublings; the lookup scans the whole window slice.
   * Scalar bounds are validated by the public entry points ({@link ScalarMultiplier.mulCT},
   * {@link ScalarMultiplier.mulCTBlinded}, {@link ScalarMultiplier.mulUnsafe});
   * signedWindowDigits throws if `n` exceeds the table.
   * @returns real and fake (for const-time) points
   */
  wnafCachedCT(precomputes, n) {
    const { W, windows, comp } = precomputes;
    const half = 2 ** (W - 1);
    const digits = signedWindowDigits(n, W, windows);
    let p = this.ZERO;
    let f = this.BASE;
    for (let w = 0; w < windows; w++) {
      const digit = digits[w];
      const start = w * half;
      const idx = Math.abs(digit) - 1;
      let sel = comp[start];
      for (let i = 1; i < half; i++)
        sel = i === idx ? comp[start + i] : sel;
      const neg = sel.negate();
      if (digit === 0)
        f = f.add(comp[start]);
      else
        p = p.add(digit < 0 ? neg : sel);
    }
    return { p, f };
  }
  // Cache key is point identity plus (W, bits); at most two entries exist per point (public-width
  // `Fn.BITS` and blinded `Fn.BITS + BLIND_BITS`). Callers must not reuse the same point with
  // incompatible `transform(...)` layouts and expect a separate cache entry.
  getWnafPrecomputes(W, point, bits, transform) {
    let entries = this.wnafPrecomputes.get(point);
    let comp = entries == null ? void 0 : entries.find((entry) => entry.W === W && entry.bits === bits);
    if (!comp) {
      comp = this.buildWnafTable(point, W, bits);
      if (typeof transform === "function")
        comp = { ...comp, comp: transform(comp.comp) };
      if (!entries) {
        entries = [];
        this.wnafPrecomputes.set(point, entries);
      }
      entries.push(comp);
    }
    return comp;
  }
  assertPoint(point) {
    if (!(point instanceof this.Point))
      throw new TypeError('"point" expected Point instance, got type=' + typeof point);
  }
  // Shared prologue of the constant-time entry points. Rejects scalar 0: in key/signature-style
  // callers a zero scalar means broken upstream plumbing, and concrete Points already reject it.
  // Uses inRange instead of Fn.isValidNot0: validateField() only certifies the arithmetic subset.
  validateMulInput(point, scalar) {
    this.assertPoint(point);
    if (!inRange(scalar, _1n$5, this.Point.Fn.ORDER))
      throw new Error("invalid scalar");
  }
  // Constant-time dispatch shared by mulCT / mulCTBlinded. Un-precomputed points (W===1, e.g.
  // ECDH peer keys) skip building a throwaway cached table in favor of a small fixed-window
  // multiply. `n` must be < 2^bits.
  runCT(point, n, bits, transform) {
    const W = getWindowSize(point);
    if (W === 1)
      return this.fixedWindowCT(point, n, bits);
    return this.wnafCachedCT(this.getWnafPrecomputes(W, point, bits, transform), n);
  }
  mulCT(point, scalar, transform) {
    this.validateMulInput(point, scalar);
    return this.runCT(point, scalar, this.bits, transform);
  }
  mulCTBlinded(point, scalar, transform) {
    this.validateMulInput(point, scalar);
    if (this.randomBytes === void 0)
      throw new Error("randomBytes is required for scalar blinding");
    const bits = this.Point.Fn.BITS + BLIND_BITS;
    const blind = this.randomBytes(BLIND_BYTES);
    if (!isBytes$2(blind) || blind.length !== BLIND_BYTES)
      throw new Error("randomBytes returned invalid byte array");
    blind[0] = blind[0] & 63 | 128;
    const n = scalar + bytesToNumberBE(blind) * this.Point.Fn.ORDER;
    return this.runCT(point, n, bits, transform);
  }
  /**
   * Constant-time multiplication `n*point` for an un-precomputed point, via a small fixed window.
   * A cached wNAF table only pays off when reused; a flat 2^FW_WINDOW table (`size-1` adds) is
   * far cheaper to build for a single use. The point-operation sequence is independent of `n`:
   * build the table, then per window exactly FW_WINDOW doublings, a data-oblivious scan over
   * every table entry, and one addition (adds the identity when the window digit is 0 — never
   * skipped).
   *
   * `n` must be `< 2^bits`. Assumes complete addition (adding the identity costs the same as any
   * add), which holds for the Weierstrass/Edwards point types used here. The table is left in
   * projective form (no normalizeZ): normalizing this small a table costs more than the
   * mixed-add savings it would buy for a single multiply.
   * @returns real point `p`; `f` duplicates it only to match {@link wnafCachedCT}'s return shape
   * (this path needs no fake accumulator — its op-count is already scalar-independent).
   */
  fixedWindowCT(point, n, bits) {
    const W = FW_WINDOW;
    const size = 1 << W;
    const mask = bitMask(W);
    const table = new Array(size);
    table[0] = this.ZERO;
    for (let i = 1; i < size; i++)
      table[i] = table[i - 1].add(point);
    const windows = Math.ceil(bits / W);
    let acc = this.ZERO;
    for (let window = windows - 1; window >= 0; window--) {
      if (window !== windows - 1)
        for (let d = 0; d < W; d++)
          acc = acc.double();
      const digit = Number(n >> BigInt(window * W) & mask);
      let sel = table[0];
      for (let i = 1; i < size; i++)
        sel = i === digit ? table[i] : sel;
      acc = acc.add(sel);
    }
    return { p: acc, f: acc };
  }
  shouldBlind(point, cofactor) {
    if (this.randomBytes === void 0)
      return false;
    if (cofactor === _1n$5)
      return true;
    if (point !== this.BASE)
      return false;
    if (this.baseCanBeBlinded === void 0)
      this.baseCanBeBlinded = this.mulUnsafe(this.BASE, this.Point.Fn.ORDER).is0();
    return this.baseCanBeBlinded;
  }
  mulSecret(point, scalar, cofactor, transform) {
    return this.shouldBlind(point, cofactor) ? this.mulCTBlinded(point, scalar, transform) : this.mulCT(point, scalar, transform);
  }
  mulUnsafe(point, scalar, transform) {
    this.assertPoint(point);
    if (!isPosBig(scalar))
      throw new Error("invalid scalar");
    const W = getWindowSize(point);
    if (W === 1 || scalar >= this.Point.Fn.ORDER)
      return mulAddUnsafe(this.Point, [point], [scalar], true);
    const precomputes = this.getWnafPrecomputes(W, point, this.bits, transform);
    return this.wnafCachedCT(precomputes, scalar).p;
  }
  // Remembers the window size used for precomputed wNAF multiplication of the given point
  // and drops any previously built tables. Usually only the base point is precomputed.
  // W=1 resets the point to the un-precomputed (table-less) paths.
  // W is additionally capped so tables stay under ~2 GiB ({@link TABLE_BYTES_MAX}).
  setWindowSize(point, W) {
    this.assertPoint(point);
    validateW(W, this.bits);
    const windows = Math.ceil((this.bits + BLIND_BITS) / W) + 1;
    validateTableBytes(windows * 2 ** (W - 1), this.Point.Fp.BYTES);
    pointWindowSizes.set(point, W);
    this.wnafPrecomputes.delete(point);
  }
  // True when a window size is set: tables themselves are built lazily on first multiply.
  hasWindowSize(point) {
    return getWindowSize(point) !== 1;
  }
}
function mulAddUnsafe(c, points, scalars, allowOversized = false) {
  validatePointCons(c);
  validateMSMPoints(points, c);
  abool(allowOversized, "allowOversized");
  validateMSMScalars(scalars, c.Fn, allowOversized ? c.Fn.ORDER ** _4n$1 : void 0);
  if (points.length !== scalars.length)
    throw new Error("arrays of points and scalars must have equal length");
  const tables = points.map((p) => oddMultiples(p, 4));
  const digits = scalars.map((n) => wnafDigits(n, 4));
  return wnafWalk(c.ZERO, tables, digits);
}
function createField(order, field, isLE) {
  if (field) {
    if (field.ORDER !== order)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    validateField(field);
    return field;
  } else {
    return Field(order, { isLE });
  }
}
function createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
  if (FpFnLE === void 0)
    FpFnLE = type === "edwards";
  if (!CURVE || typeof CURVE !== "object")
    throw new Error(`expected valid ${type} CURVE object`);
  validateObject$1(curveOpts);
  for (const p of ["p", "n", "h"]) {
    const val = CURVE[p];
    if (!(isPosBig(val) && val !== _0n$8))
      throw new Error(`CURVE.${p} must be positive bigint`);
  }
  const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
  const Fn2 = createField(CURVE.n, curveOpts.Fn, FpFnLE);
  const _b = "b";
  const params = ["Gx", "Gy", "a", _b];
  for (const p of params) {
    if (!Fp.isValid(CURVE[p]))
      throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
  }
  CURVE = Object.freeze(Object.assign({}, CURVE));
  return { CURVE, Fp, Fn: Fn2 };
}
function createKeygen(randomSecretKey, getPublicKey) {
  return function keygen(seed) {
    const secretKey = randomSecretKey(seed);
    return { secretKey, publicKey: getPublicKey(secretKey) };
  };
}
class _HMAC2 {
  constructor(hash, key) {
    __publicField(this, "oHash");
    __publicField(this, "iHash");
    __publicField(this, "blockLen");
    __publicField(this, "outputLen");
    __publicField(this, "canXOF", false);
    __publicField(this, "finished", false);
    __publicField(this, "destroyed", false);
    ahash(hash);
    abytes$1(key, void 0, "key");
    this.iHash = hash.create();
    if (typeof this.iHash.update !== "function")
      throw new Error("expected Hash instance");
    this.blockLen = this.iHash.blockLen;
    this.outputLen = this.iHash.outputLen;
    const blockLen = this.blockLen;
    const pad = new Uint8Array(blockLen);
    pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54;
    this.iHash.update(pad);
    this.oHash = hash.create();
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54 ^ 92;
    this.oHash.update(pad);
    clean(pad);
  }
  update(buf) {
    aexists(this);
    this.iHash.update(buf);
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const buf = out.subarray(0, this.outputLen);
    this.iHash.digestInto(buf);
    this.oHash.update(buf);
    this.oHash.digestInto(buf);
    this.destroy();
  }
  digest() {
    const out = new Uint8Array(this.oHash.outputLen);
    this.digestInto(out);
    return out;
  }
  _cloneInto(to) {
    to || (to = Object.create(Object.getPrototypeOf(this), {}));
    const { oHash, iHash, finished, destroyed, blockLen, outputLen, canXOF } = this;
    to = to;
    to.finished = finished;
    to.destroyed = destroyed;
    to.blockLen = blockLen;
    to.outputLen = outputLen;
    to.canXOF = canXOF;
    to.oHash = oHash._cloneInto(to.oHash);
    to.iHash = iHash._cloneInto(to.iHash);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = true;
    this.oHash.destroy();
    this.iHash.destroy();
  }
}
const hmac = /* @__PURE__ */ (() => {
  const hmac_ = (hash, key, message) => new _HMAC2(hash, key).update(message).digest();
  hmac_.create = (hash, key) => new _HMAC2(hash, key);
  return hmac_;
})();
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n$7 = /* @__PURE__ */ BigInt(0);
class DERErr2 extends Error {
  constructor(m = "") {
    super(m);
  }
}
const _DER = {
  // asn.1 DER encoding utils
  Err: DERErr2,
  // Basic building block is TLV (Tag-Length-Value)
  _tlv: {
    encode: (tag, data) => {
      const { Err: E } = _DER;
      asafenumber(tag, "tag");
      if (tag < 0 || tag > 255)
        throw new E("tlv.encode: wrong tag");
      astring$1(data, "data");
      if (data.length & 1)
        throw new E("tlv.encode: unpadded data");
      const dataLen = data.length / 2;
      const len = numberToHexUnpadded(dataLen);
      if (len.length / 2 & 128)
        throw new E("tlv.encode: long form length too big");
      const lenLen = dataLen > 127 ? numberToHexUnpadded(len.length / 2 | 128) : "";
      const t2 = numberToHexUnpadded(tag);
      return t2 + lenLen + len + data;
    },
    // v - value, l - left bytes (unparsed)
    decode(tag, data) {
      const { Err: E } = _DER;
      data = abytes(data, void 0, "DER data");
      let pos = 0;
      if (tag < 0 || tag > 255)
        throw new E("tlv.decode: wrong tag");
      if (data.length < 2 || data[pos++] !== tag)
        throw new E("tlv.decode: wrong tlv");
      const first = data[pos++];
      const isLong = !!(first & 128);
      let length = 0;
      if (!isLong)
        length = first;
      else {
        const lenLen = first & 127;
        if (!lenLen)
          throw new E("tlv.decode(long): indefinite length not supported");
        if (lenLen > 4)
          throw new E("tlv.decode(long): byte length is too big");
        const lengthBytes = data.subarray(pos, pos + lenLen);
        if (lengthBytes.length !== lenLen)
          throw new E("tlv.decode: length bytes not complete");
        if (lengthBytes[0] === 0)
          throw new E("tlv.decode(long): zero leftmost byte");
        for (const b of lengthBytes)
          length = length << 8 | b;
        pos += lenLen;
        if (length < 128)
          throw new E("tlv.decode(long): not minimal encoding");
      }
      const v = data.subarray(pos, pos + length);
      if (v.length !== length)
        throw new E("tlv.decode: wrong value length");
      return { v, l: data.subarray(pos + length) };
    }
  },
  // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
  // since we always use positive integers here. It must always be empty:
  // - add zero byte if exists
  // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
  _int: {
    encode(num2) {
      const { Err: E } = _DER;
      abignumber(num2);
      if (num2 < _0n$7)
        throw new E("integer: negative integers are not allowed");
      let hex2 = numberToHexUnpadded(num2);
      if (Number.parseInt(hex2[0], 16) & 8)
        hex2 = "00" + hex2;
      if (hex2.length & 1)
        throw new E("unexpected DER parsing assertion: unpadded hex");
      return hex2;
    },
    decode(data) {
      const { Err: E } = _DER;
      if (data.length < 1)
        throw new E("invalid signature integer: empty");
      if (data[0] & 128)
        throw new E("invalid signature integer: negative");
      if (data.length > 1 && data[0] === 0 && !(data[1] & 128))
        throw new E("invalid signature integer: unnecessary leading zero");
      return bytesToNumberBE(data);
    }
  },
  toSig(bytes, maxScalarBytes) {
    const { Err: E, _int: int, _tlv: tlv } = _DER;
    if (maxScalarBytes !== void 0) {
      asafenumber(maxScalarBytes, "maxScalarBytes");
      if (maxScalarBytes < 1)
        throw new E("invalid signature: maxScalarBytes must be positive");
    }
    const data = abytes(bytes, void 0, "signature");
    const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
    if (seqLeftBytes.length)
      throw new E("invalid signature: left bytes after parsing");
    const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
    const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
    if (sLeftBytes.length)
      throw new E("invalid signature: left bytes after parsing");
    if (maxScalarBytes !== void 0 && (rBytes.length > maxScalarBytes || sBytes.length > maxScalarBytes))
      throw new E("invalid signature: integer too large");
    return { r: int.decode(rBytes), s: int.decode(sBytes) };
  },
  hexFromSig(sig) {
    const { _tlv: tlv, _int: int } = _DER;
    validateObject$1(sig, { r: "bigint", s: "bigint" }, {}, "sig");
    const rs = tlv.encode(2, int.encode(sig.r));
    const ss = tlv.encode(2, int.encode(sig.s));
    const seq = rs + ss;
    return tlv.encode(48, seq);
  }
};
const DER = /* @__PURE__ */ (() => {
  Object.freeze(_DER._tlv);
  Object.freeze(_DER._int);
  return Object.freeze(_DER);
})();
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const divNearest = (num2, den) => (num2 + (num2 >= 0 ? den : -den) / _2n$4) / den;
function _splitEndoScalar(k, basis, n) {
  aInRange("scalar", k, _0n$6, n);
  const [[a1, b1], [a2, b2]] = basis;
  const c1 = divNearest(b2 * k, n);
  const c2 = divNearest(-b1 * k, n);
  let k1 = k - c1 * a1 - c2 * a2;
  let k2 = -c1 * b1 - c2 * b2;
  const k1neg = k1 < _0n$6;
  const k2neg = k2 < _0n$6;
  if (k1neg)
    k1 = -k1;
  if (k2neg)
    k2 = -k2;
  const MAX_NUM = bitMask(Math.ceil(bitLen(n) / 2)) + _1n$4;
  if (k1 < _0n$6 || k1 >= MAX_NUM || k2 < _0n$6 || k2 >= MAX_NUM) {
    throw new Error("splitScalar (endomorphism): failed for k");
  }
  return { k1neg, k1, k2neg, k2 };
}
function validateSigFormat(format2) {
  if (!["compact", "recovered", "der"].includes(format2))
    throw new Error('Signature format must be "compact", "recovered", or "der"');
  return format2;
}
function validateSigOpts(opts, def2) {
  validateObject$1(opts);
  const optsn = {};
  for (let optName of Object.keys(def2)) {
    optsn[optName] = opts[optName] === void 0 ? def2[optName] : opts[optName];
  }
  abool(optsn.lowS, "lowS");
  abool(optsn.prehash, "prehash");
  if (optsn.format !== void 0)
    validateSigFormat(optsn.format);
  return optsn;
}
const _0n$6 = /* @__PURE__ */ BigInt(0), _1n$4 = /* @__PURE__ */ BigInt(1), _2n$4 = /* @__PURE__ */ BigInt(2), _3n = /* @__PURE__ */ BigInt(3), _4n = /* @__PURE__ */ BigInt(4);
function weierstrass(params, extraOpts = {}) {
  const validated = createCurveFields("weierstrass", params, extraOpts);
  const Fp = validated.Fp;
  const Fn2 = validated.Fn;
  let CURVE = validated.CURVE;
  const { h: cofactor, n: CURVE_ORDER2 } = CURVE;
  validateObject$1(extraOpts, {}, {
    allowInfinityPoint: "boolean",
    clearCofactor: "function",
    isTorsionFree: "function",
    fromBytes: "function",
    toBytes: "function",
    endo: "object",
    randomBytes: "function"
  });
  const { endo: endoOpts, allowInfinityPoint, clearCofactor, isTorsionFree, fromBytes, toBytes } = extraOpts;
  const randomBytes$12 = extraOpts.randomBytes === void 0 ? randomBytes : extraOpts.randomBytes;
  if (endoOpts) {
    if (!Fp.is0(CURVE.a) || typeof endoOpts.beta !== "bigint" || !Array.isArray(endoOpts.basises)) {
      throw new Error('invalid endo: expected "beta": bigint and "basises": array');
    }
  }
  const endo = endoOpts ? {
    beta: endoOpts.beta,
    basises: endoOpts.basises.map((basis) => [...basis])
  } : void 0;
  const lengths = getWLengths(Fp, Fn2);
  function assertCompressionIsSupported() {
    if (!Fp.isOdd)
      throw new Error("compression is not supported: Field does not have .isOdd()");
  }
  function pointToBytes2(_c, point, isCompressed) {
    if (point.is0()) {
      if (!allowInfinityPoint)
        throw new Error("bad point: ZERO");
      return Uint8Array.of(0);
    }
    const { x, y } = point.toAffine();
    const bx = Fp.toBytes(x);
    abool(isCompressed, "isCompressed");
    if (isCompressed) {
      assertCompressionIsSupported();
      const hasEvenY = !Fp.isOdd(y);
      return concatBytes$2(pprefix(hasEvenY), bx);
    } else {
      return concatBytes$2(Uint8Array.of(4), bx, Fp.toBytes(y));
    }
  }
  function pointFromBytes(bytes) {
    abytes(bytes, void 0, "Point");
    const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
    const length = bytes.length;
    const head = bytes[0];
    const tail = bytes.subarray(1);
    if (allowInfinityPoint && length === 1 && head === 0)
      return { x: Fp.ZERO, y: Fp.ZERO };
    if (length === comp && (head === 2 || head === 3)) {
      const x = Fp.fromBytes(tail);
      if (!Fp.isValid(x))
        throw new Error("bad point: is not on curve, wrong x");
      const y2 = weierstrassEquation(x);
      let y;
      try {
        y = Fp.sqrt(y2);
      } catch (sqrtError) {
        const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
        throw new Error("bad point: is not on curve, sqrt error" + err);
      }
      assertCompressionIsSupported();
      const evenY = Fp.isOdd(y);
      const evenH = (head & 1) === 1;
      if (evenH !== evenY)
        y = Fp.neg(y);
      return { x, y };
    } else if (length === uncomp && head === 4) {
      const L = Fp.BYTES;
      const x = Fp.fromBytes(tail.subarray(0, L));
      const y = Fp.fromBytes(tail.subarray(L, L * 2));
      if (!isValidXY(x, y))
        throw new Error("bad point: is not on curve");
      return { x, y };
    } else {
      throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
    }
  }
  const encodePoint = toBytes === void 0 ? pointToBytes2 : toBytes;
  const decodePoint = fromBytes === void 0 ? pointFromBytes : fromBytes;
  const b3 = Fp.mul(CURVE.b, _3n);
  const mulA = Fp.is0(CURVE.a) ? (_) => Fp.ZERO : (x) => Fp.mul(CURVE.a, x);
  function weierstrassEquation(x) {
    const x2 = Fp.sqr(x);
    const x3 = Fp.mul(x2, x);
    return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b);
  }
  function isValidXY(x, y) {
    const left = Fp.sqr(y);
    const right = weierstrassEquation(x);
    return Fp.eql(left, right);
  }
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n), _4n);
  const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
  if (Fp.is0(Fp.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function acoord(title, n, banZero = false) {
    if (!Fp.isValid(n) || banZero && Fp.is0(n))
      throw new Error(`bad point coordinate ${title}`);
    return typeof n === "object" && n !== null ? Fp.create(n) : n;
  }
  function aprjpoint(other) {
    if (!(other instanceof Point2))
      throw new Error("Weierstrass Point expected");
  }
  function splitEndoScalarN(k) {
    if (!endo || !endo.basises)
      throw new Error("no endo");
    return _splitEndoScalar(k, endo.basises, Fn2.ORDER);
  }
  function pushWnafPair(points, scalars, p, k) {
    if (!Fn2.isValid(k))
      throw new RangeError("invalid scalar: out of range");
    if (endo) {
      const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(k);
      const psi = new Point2(Fp.mul(p.X, endo.beta), p.Y, p.Z);
      points.push(k1neg ? p.negate() : p, k2neg ? psi.negate() : psi);
      scalars.push(k1, k2);
    } else {
      points.push(p);
      scalars.push(k);
    }
  }
  const validityCache = /* @__PURE__ */ new WeakSet();
  const _Point = class _Point {
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    constructor(X, Y, Z) {
      __publicField(this, "X");
      __publicField(this, "Y");
      __publicField(this, "Z");
      this.X = acoord("x", X);
      this.Y = acoord("y", Y, true);
      this.Z = acoord("z", Z);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof _Point)
        throw new Error("projective point not allowed");
      if (Fp.is0(x) && Fp.is0(y))
        return _Point.ZERO;
      return new _Point(x, y, Fp.ONE);
    }
    static fromBytes(bytes) {
      const P = _Point.fromAffine(decodePoint(abytes(bytes, void 0, "point")));
      P.assertValidity();
      return P;
    }
    static fromHex(hex2) {
      return _Point.fromBytes(hexToBytes(hex2));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     * @param isLazy - true will defer table computation until the first multiplication
     */
    precompute(windowSize = 6, isLazy = true) {
      wnaf.setWindowSize(this, windowSize);
      if (!isLazy)
        this.multiply(_3n);
      return this;
    }
    // TODO: return `this`
    /** A point on curve is valid if it conforms to equation. */
    assertValidity() {
      const p = this;
      if (p.is0()) {
        if (allowInfinityPoint && Fp.is0(p.X) && Fp.eql(p.Y, Fp.ONE) && Fp.is0(p.Z))
          return;
        throw new Error("bad point: ZERO");
      }
      if (validityCache.has(p))
        return;
      const { x, y } = p.toAffine();
      if (!Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("bad point: x or y not field elements");
      if (!isValidXY(x, y))
        throw new Error("bad point: equation left != right");
      if (!p.isTorsionFree())
        throw new Error("bad point: not in prime-order subgroup");
      validityCache.add(p);
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (!Fp.isOdd)
        throw new Error("Field doesn't support isOdd");
      return !Fp.isOdd(y);
    }
    /** Compare one point to another. */
    equals(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
    negate() {
      return new _Point(this.X, Fp.neg(this.Y), this.Z);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { X: X1, Y: Y1, Z: Z1 } = this;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = mulA(Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = mulA(t2);
      t3 = Fp.sub(t0, t2);
      t3 = mulA(t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new _Point(X3, Y3, Z3);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = mulA(t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = mulA(t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = mulA(t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new _Point(X3, Y3, Z3);
    }
    subtract(other) {
      aprjpoint(other);
      return this.add(other.negate());
    }
    is0() {
      return this.equals(_Point.ZERO);
    }
    /**
     * Constant time multiplication.
     * Uses precomputed tables (signed fixed-window wNAF) when available.
     * Uses scalar blinding and avoids endomorphism splitting in the secret-scalar path.
     * @param scalar - by which the point would be multiplied
     * @returns New point
     */
    multiply(scalar) {
      if (!Fn2.isValidNot0(scalar))
        throw new RangeError("invalid scalar: out of range");
      const { p, f } = wnaf.mulSecret(this, scalar, cofactor, normalize2);
      return normalize2([p, f])[0];
    }
    /**
     * Non-constant-time multiplication. Uses width-4 wNAF with GLV endomorphism splitting
     * when available (two half-width scalars sharing one halved doubling chain).
     * It's faster, but should only be used when you don't care about
     * an exposed secret key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(scalar) {
      const p = this;
      const sc = scalar;
      if (!Fn2.isValid(sc))
        throw new RangeError("invalid scalar: out of range");
      if (sc === _0n$6 || p.is0())
        return _Point.ZERO;
      if (sc === _1n$4)
        return p;
      if (wnaf.hasWindowSize(this))
        return wnaf.mulUnsafe(p, sc, normalize2);
      const points = [];
      const scalars = [];
      pushWnafPair(points, scalars, p, sc);
      return mulAddUnsafe(_Point, points, scalars);
    }
    /**
     * Non-constant-time double-scalar multiplication `a⋅this + b⋅other` (Strauss–Shamir).
     * Both walks share one doubling chain via {@link mulAddUnsafe}, and GLV endomorphism
     * (when available) halves the chain again by splitting each scalar into two half-width
     * parts. Used by ECDSA verification and public-key recovery for `R = u1⋅G + u2⋅P`.
     * Only for public scalars.
     */
    mulAddUnsafe(a, other, b) {
      aprjpoint(other);
      const points = [];
      const scalars = [];
      pushWnafPair(points, scalars, this, a);
      pushWnafPair(points, scalars, other, b);
      return mulAddUnsafe(_Point, points, scalars);
    }
    /**
     * Converts Projective point to affine (x, y) coordinates.
     * (X, Y, Z) ∋ (x=X/Z, y=Y/Z).
     * @param invertedZ - Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
     */
    toAffine(invertedZ) {
      const p = this;
      let iz = invertedZ;
      if (iz != null && !Fp.isValid(iz))
        throw new RangeError('"invertedZ" expected valid field element');
      const { X, Y, Z } = p;
      if (Fp.eql(Z, Fp.ONE))
        return { x: X, y: Y };
      const is0 = p.is0();
      if (iz == null)
        iz = is0 ? Fp.ONE : Fp.inv(Z);
      const x = Fp.mul(X, iz);
      const y = Fp.mul(Y, iz);
      const zz = Fp.mul(Z, iz);
      if (is0)
        return { x: Fp.ZERO, y: Fp.ZERO };
      if (!Fp.eql(zz, Fp.ONE))
        throw new Error("invZ was invalid");
      return { x, y };
    }
    /**
     * Checks whether Point is free of torsion elements (is in prime subgroup).
     * Always torsion-free for cofactor=1 curves.
     */
    isTorsionFree() {
      if (cofactor === _1n$4)
        return true;
      if (isTorsionFree)
        return isTorsionFree(_Point, this);
      return wnaf.mulUnsafe(this, CURVE_ORDER2).is0();
    }
    clearCofactor() {
      if (cofactor === _1n$4)
        return this;
      if (clearCofactor)
        return clearCofactor(_Point, this);
      return this.multiplyUnsafe(cofactor);
    }
    isSmallOrder() {
      if (cofactor === _1n$4)
        return this.is0();
      return this.clearCofactor().is0();
    }
    toBytes(isCompressed = true) {
      abool(isCompressed, "isCompressed");
      this.assertValidity();
      return encodePoint(_Point, this, isCompressed);
    }
    toHex(isCompressed = true) {
      return bytesToHex(this.toBytes(isCompressed));
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  };
  __publicField(_Point, "BASE", new _Point(CURVE.Gx, CURVE.Gy, Fp.ONE));
  __publicField(_Point, "ZERO", new _Point(Fp.ZERO, Fp.ONE, Fp.ZERO));
  __publicField(_Point, "Fp", Fp);
  __publicField(_Point, "Fn", Fn2);
  let Point2 = _Point;
  const normalize2 = (points) => normalizeZ(Point2, points);
  const wnaf = new ScalarMultiplier2(Point2, randomBytes$12);
  if (wnaf.bits >= 6)
    Point2.BASE.precompute(6);
  Object.freeze(Point2.prototype);
  Object.freeze(Point2);
  return Point2;
}
function pprefix(hasEvenY) {
  return Uint8Array.of(hasEvenY ? 2 : 3);
}
function getWLengths(Fp, Fn2) {
  return {
    secretKey: Fn2.BYTES,
    publicKey: 1 + Fp.BYTES,
    publicKeyUncompressed: 1 + 2 * Fp.BYTES,
    publicKeyHasPrefix: true,
    // Raw compact `(r || s)` signature width; DER and recovered signatures use
    // different lengths outside this helper.
    signature: 2 * Fn2.BYTES
  };
}
function ecdh(Point2, ecdhOpts = {}) {
  validatePointCons(Point2);
  const { Fn: Fn2 } = Point2;
  const randomBytes_ = ecdhOpts.randomBytes === void 0 ? randomBytes : ecdhOpts.randomBytes;
  const lengths = Object.assign(getWLengths(Point2.Fp, Fn2), {
    seed: Math.max(getMinHashLength(Fn2.ORDER), 16)
  });
  function isValidSecretKey(secretKey) {
    try {
      const num2 = Fn2.fromBytes(secretKey);
      return Fn2.isValidNot0(num2);
    } catch (error) {
      return false;
    }
  }
  function isValidPublicKey(publicKey, isCompressed) {
    const { publicKey: comp, publicKeyUncompressed } = lengths;
    try {
      const l = publicKey.length;
      if (isCompressed === true && l !== comp)
        return false;
      if (isCompressed === false && l !== publicKeyUncompressed)
        return false;
      return !Point2.fromBytes(publicKey).is0();
    } catch (error) {
      return false;
    }
  }
  function randomSecretKey(seed) {
    seed = seed === void 0 ? randomBytes_(lengths.seed) : seed;
    return mapHashToField(abytes(seed, lengths.seed, "seed"), Fn2.ORDER);
  }
  function getPublicKey(secretKey, isCompressed = true) {
    return Point2.BASE.multiply(Fn2.fromBytes(secretKey)).toBytes(isCompressed);
  }
  function isProbPub(item) {
    const { secretKey, publicKey, publicKeyUncompressed } = lengths;
    const allowedLengths = Fn2._lengths;
    if (!isBytes$2(item))
      return void 0;
    const l = abytes(item, void 0, "key").length;
    const isPub = l === publicKey || l === publicKeyUncompressed;
    const isSec = l === secretKey || !!(allowedLengths == null ? void 0 : allowedLengths.includes(l));
    if (isPub && isSec)
      return void 0;
    return isPub;
  }
  function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
    if (isProbPub(secretKeyA) === true)
      throw new Error("first arg must be private key");
    if (isProbPub(publicKeyB) === false)
      throw new Error("second arg must be public key");
    const s = Fn2.fromBytes(secretKeyA);
    const b = Point2.fromBytes(publicKeyB);
    if (b.is0())
      throw new Error("invalid public key: point at infinity");
    return b.multiply(s).toBytes(isCompressed);
  }
  const utils2 = {
    isValidSecretKey,
    isValidPublicKey,
    randomSecretKey
  };
  const keygen = createKeygen(randomSecretKey, getPublicKey);
  Object.freeze(utils2);
  Object.freeze(lengths);
  return Object.freeze({ getPublicKey, getSharedSecret, keygen, Point: Point2, utils: utils2, lengths });
}
function ecdsa(Point2, hash, ecdsaOpts = {}) {
  validatePointCons(Point2);
  const hash_ = hash;
  ahash(hash_);
  validateObject$1(ecdsaOpts, {}, {
    hmac: "function",
    lowS: "boolean",
    randomBytes: "function",
    bits2int: "function",
    bits2int_modN: "function"
  });
  const opts = Object.assign({}, ecdsaOpts);
  const randomBytes$12 = opts.randomBytes === void 0 ? randomBytes : opts.randomBytes;
  const hmac$12 = opts.hmac === void 0 ? (key, msg) => hmac(hash_, key, msg) : opts.hmac;
  const { Fp, Fn: Fn2 } = Point2;
  const { ORDER: CURVE_ORDER2, BITS: fnBits } = Fn2;
  const blindLength = getMinHashLength(CURVE_ORDER2);
  const csprng = probeRandomBytes(randomBytes$12, blindLength);
  const { keygen, getPublicKey, getSharedSecret, utils: utils2, lengths } = ecdh(Point2, opts);
  const defaultSigOpts = {
    prehash: true,
    lowS: typeof opts.lowS === "boolean" ? opts.lowS : true,
    format: "compact",
    extraEntropy: false
  };
  const hasLargeRecoveryLifts = CURVE_ORDER2 * _2n$4 + _1n$4 < Fp.ORDER;
  function isBiggerThanHalfOrder(number) {
    const HALF = CURVE_ORDER2 >> _1n$4;
    return number > HALF;
  }
  function validateRS(title, num2) {
    if (!Fn2.isValidNot0(num2))
      throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
    return num2;
  }
  function assertFieldSignIsSupported() {
    if (!Fp.isOdd)
      throw new Error("Field doesn't support isOdd");
  }
  function getRecoveryBit(x, y, r) {
    assertFieldSignIsSupported();
    return (x === r ? 0 : 2) | Number(Fp.isOdd(y));
  }
  function assertRecoverableCurve() {
    if (hasLargeRecoveryLifts)
      throw new Error('"recovered" sig type is not supported for cofactor >2 curves');
  }
  function validateSigLength(bytes, format2) {
    validateSigFormat(format2);
    const size = lengths.signature;
    const sizer = format2 === "compact" ? size : format2 === "recovered" ? size + 1 : void 0;
    return abytes(bytes, sizer);
  }
  class Signature {
    constructor(r, s, recovery) {
      __publicField(this, "r");
      __publicField(this, "s");
      __publicField(this, "recovery");
      this.r = validateRS("r", r);
      this.s = validateRS("s", s);
      if (recovery != null) {
        assertRecoverableCurve();
        if (![0, 1, 2, 3].includes(recovery))
          throw new Error("invalid recovery id");
        this.recovery = recovery;
      }
      Object.freeze(this);
    }
    static fromBytes(bytes, format2 = defaultSigOpts.format) {
      validateSigLength(bytes, format2);
      let recid;
      if (format2 === "der") {
        if (bytes.length > 2 * Fn2.BYTES + 16)
          throw new DER.Err("invalid signature: DER signature too long");
        const { r: r2, s: s2 } = DER.toSig(abytes(bytes), Fn2.BYTES + 1);
        return new Signature(r2, s2);
      }
      if (format2 === "recovered") {
        recid = bytes[0];
        format2 = "compact";
        bytes = bytes.subarray(1);
      }
      const L = lengths.signature / 2;
      const r = bytes.subarray(0, L);
      const s = bytes.subarray(L, L * 2);
      return new Signature(Fn2.fromBytes(r), Fn2.fromBytes(s), recid);
    }
    static fromHex(hex2, format2) {
      return this.fromBytes(hexToBytes(hex2), format2);
    }
    assertRecovery() {
      const { recovery } = this;
      if (recovery == null)
        throw new Error("invalid recovery id: must be present");
      return recovery;
    }
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    // Unlike the top-level helper below, this method expects a digest that has
    // already been hashed to the curve's message representative.
    recoverPublicKey(messageHash) {
      const { r, s } = this;
      const recovery = this.assertRecovery();
      const radj = recovery === 2 || recovery === 3 ? r + CURVE_ORDER2 : r;
      if (!Fp.isValid(radj))
        throw new Error("invalid recovery id: sig.r+curve.n != R.x");
      const x = Fp.toBytes(radj);
      const R = Point2.fromBytes(concatBytes$2(pprefix((recovery & 1) === 0), x));
      const ir = Fn2.inv(radj);
      const h = bits2int_modN(abytes(messageHash, void 0, "msgHash"));
      const u1 = Fn2.create(-h * ir);
      const u2 = Fn2.create(s * ir);
      const Q = Point2.BASE.mulAddUnsafe(u1, R, u2);
      if (Q.is0())
        throw new Error("invalid recovery: point at infinify");
      Q.assertValidity();
      return Q;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    toBytes(format2 = defaultSigOpts.format) {
      validateSigFormat(format2);
      if (format2 === "der")
        return hexToBytes(DER.hexFromSig(this));
      const { r, s } = this;
      const rb = Fn2.toBytes(r);
      const sb = Fn2.toBytes(s);
      if (format2 === "recovered") {
        assertRecoverableCurve();
        return concatBytes$2(Uint8Array.of(this.assertRecovery()), rb, sb);
      }
      return concatBytes$2(rb, sb);
    }
    toHex(format2) {
      return bytesToHex(this.toBytes(format2));
    }
  }
  Object.freeze(Signature.prototype);
  Object.freeze(Signature);
  const bits2int = opts.bits2int === void 0 ? function bits2int_def(bytes) {
    if (bytes.length > 8192)
      throw new Error("input is too large");
    const num2 = bytesToNumberBE(bytes);
    const delta = bytes.length * 8 - fnBits;
    return delta > 0 ? num2 >> BigInt(delta) : num2;
  } : opts.bits2int;
  const bits2int_modN = opts.bits2int_modN === void 0 ? function bits2int_modN_def(bytes) {
    return Fn2.create(bits2int(bytes));
  } : opts.bits2int_modN;
  const ORDER_MASK = bitMask(fnBits);
  function int2octets(num2) {
    aInRange("num < 2^" + fnBits, num2, _0n$6, ORDER_MASK);
    return Fn2.toBytes(num2);
  }
  function validateMsgAndHash(message, prehash) {
    abytes(message, void 0, "message");
    return prehash ? abytes(hash_(message), void 0, "prehashed message") : message;
  }
  function prepSig(message, secretKey, opts2) {
    const { lowS, prehash, extraEntropy } = validateSigOpts(opts2, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    const h1int = bits2int_modN(message);
    const d = Fn2.fromBytes(secretKey);
    if (!Fn2.isValidNot0(d))
      throw new Error("invalid private key");
    const seedArgs = [int2octets(d), int2octets(h1int)];
    if (extraEntropy != null && extraEntropy !== false) {
      const e = extraEntropy === true ? randomBytes$12(lengths.secretKey) : extraEntropy;
      seedArgs.push(abytes(e, void 0, "extraEntropy"));
    }
    const seed = concatBytes$2(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!Fn2.isValidNot0(k))
        return;
      const q = Point2.BASE.multiply(k).toAffine();
      const r = Fn2.create(q.x);
      if (r === _0n$6)
        return;
      let s;
      if (csprng !== void 0) {
        const b = bytesToNumberBE(mapHashToField(csprng(blindLength), CURVE_ORDER2));
        const ibk = Fn2.inv(Fn2.mul(b, k));
        const bm = Fn2.mul(b, m);
        const bd = Fn2.mul(b, d);
        s = Fn2.create(ibk * Fn2.create(bm + bd * r));
      } else {
        const ik = invertCt(k, CURVE_ORDER2);
        s = Fn2.create(ik * Fn2.create(m + r * d));
      }
      if (s === _0n$6)
        return;
      let recovery = getRecoveryBit(q.x, q.y, r);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = Fn2.neg(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, hasLargeRecoveryLifts ? void 0 : recovery);
    }
    return { seed, k2sig };
  }
  function sign(message, secretKey, opts2 = {}) {
    const { seed, k2sig } = prepSig(message, secretKey, opts2);
    const drbg = createHmacDrbg(hash_.outputLen, Fn2.BYTES, hmac$12);
    const sig = drbg(seed, k2sig);
    return sig.toBytes(opts2.format);
  }
  function verify(signature, message, publicKey, opts2 = {}) {
    const { lowS, prehash, format: format2 } = validateSigOpts(opts2, defaultSigOpts);
    publicKey = abytes(publicKey, void 0, "publicKey");
    message = validateMsgAndHash(message, prehash);
    if (!isBytes$2(signature)) {
      const end = signature instanceof Signature ? ", use sig.toBytes()" : "";
      throw new Error("verify expects Uint8Array signature" + end);
    }
    validateSigLength(signature, format2);
    try {
      const sig = Signature.fromBytes(signature, format2);
      const P = Point2.fromBytes(publicKey);
      if (P.is0())
        return false;
      if (lowS && sig.hasHighS())
        return false;
      const { r, s } = sig;
      const h = bits2int_modN(message);
      const is = Fn2.inv(s);
      const u1 = Fn2.create(h * is);
      const u2 = Fn2.create(r * is);
      const R = Point2.BASE.mulAddUnsafe(u1, P, u2);
      if (R.is0())
        return false;
      const q = R.toAffine();
      const v = Fn2.create(q.x);
      if (v !== r)
        return false;
      if (format2 === "recovered" && sig.recovery !== getRecoveryBit(q.x, q.y, r))
        return false;
      return true;
    } catch (e) {
      return false;
    }
  }
  function recoverPublicKey(signature, message, opts2 = {}) {
    const { prehash } = validateSigOpts(opts2, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    return Signature.fromBytes(signature, "recovered").recoverPublicKey(message).toBytes();
  }
  return Object.freeze({
    keygen,
    getPublicKey,
    getSharedSecret,
    utils: utils2,
    lengths,
    Point: Point2,
    sign,
    verify,
    recoverPublicKey,
    Signature,
    hash: hash_
  });
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const secp256k1_CURVE = {
  p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
  n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
  h: BigInt(1),
  a: BigInt(0),
  b: BigInt(7),
  Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
  Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
};
const secp256k1_ENDO = {
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
  basises: [
    [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
    [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
  ]
};
const _0n$5 = /* @__PURE__ */ BigInt(0);
const _2n$3 = /* @__PURE__ */ BigInt(2);
function sqrtMod(y) {
  const P = secp256k1_CURVE.p;
  const _3n2 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b2 = y * y * y % P;
  const b3 = b2 * b2 * y % P;
  const b6 = pow2(b3, _3n2, P) * b3 % P;
  const b9 = pow2(b6, _3n2, P) * b3 % P;
  const b11 = pow2(b9, _2n$3, P) * b2 % P;
  const b22 = pow2(b11, _11n, P) * b11 % P;
  const b44 = pow2(b22, _22n, P) * b22 % P;
  const b88 = pow2(b44, _44n, P) * b44 % P;
  const b176 = pow2(b88, _88n, P) * b88 % P;
  const b220 = pow2(b176, _44n, P) * b44 % P;
  const b223 = pow2(b220, _3n2, P) * b3 % P;
  const t1 = pow2(b223, _23n, P) * b22 % P;
  const t2 = pow2(t1, _6n, P) * b2 % P;
  const root = pow2(t2, _2n$3, P);
  if (!Fpk1.eql(Fpk1.sqr(root), y))
    throw new Error("Cannot find square root");
  return root;
}
const Fpk1 = /* @__PURE__ */ Field(secp256k1_CURVE.p, { sqrt: sqrtMod });
const Pointk1 = /* @__PURE__ */ weierstrass(secp256k1_CURVE, {
  Fp: Fpk1,
  endo: secp256k1_ENDO
});
const secp256k1 = /* @__PURE__ */ ecdsa(Pointk1, sha256$1);
const TAGGED_HASH_PREFIXES = /* @__PURE__ */ Object.create(null);
function taggedHash(tag, ...messages) {
  let tagP = TAGGED_HASH_PREFIXES[tag];
  if (tagP === void 0) {
    const tagH = sha256$1(asciiToBytes(tag));
    tagP = concatBytes$2(tagH, tagH);
    TAGGED_HASH_PREFIXES[tag] = tagP;
  }
  return sha256$1(concatBytes$2(tagP, ...messages));
}
const pointToBytes = (point) => point.toBytes(true).slice(1);
const affineXToBytes = ({ x }) => Fpk1.toBytes(x);
const hasEven$1 = (y) => !Fpk1.isOdd(y);
function schnorrGetExtPubKey(priv) {
  const { Fn: Fn2, BASE } = Pointk1;
  const d_ = Fn2.fromBytes(abytes(priv, 32, "secretKey"));
  const p = BASE.multiply(d_);
  const affine = p.toAffine();
  const scalar = hasEven$1(affine.y) ? d_ : Fn2.neg(d_);
  return { scalar, bytes: affineXToBytes(affine) };
}
function lift_x(x) {
  const Fp = Fpk1;
  if (!Fp.isValidNot0(x))
    throw new Error("invalid x: Fail if x ≥ p");
  const xx = Fp.sqr(x);
  const c = Fp.add(Fp.mulN(xx, x), BigInt(7));
  let y = Fp.sqrt(c);
  if (!hasEven$1(y))
    y = Fp.neg(y);
  const p = Pointk1.fromAffine({ x, y });
  p.assertValidity();
  return p;
}
const num = bytesToNumberBE;
function challenge(...args) {
  return Pointk1.Fn.create(num(taggedHash("BIP0340/challenge", ...args)));
}
function schnorrGetPublicKey(secretKey) {
  return schnorrGetExtPubKey(secretKey).bytes;
}
function schnorrSign(message, secretKey, auxRand = randomBytes$1(32)) {
  const { Fn: Fn2, BASE } = Pointk1;
  const m = copyBytes(abytes(message, void 0, "message"));
  const { bytes: px, scalar: d } = schnorrGetExtPubKey(secretKey);
  const a = abytes(auxRand, 32, "auxRand");
  const t2 = Fn2.toBytes(d ^ num(taggedHash("BIP0340/aux", a)));
  const rand = taggedHash("BIP0340/nonce", t2, px, m);
  const k_ = Fn2.create(num(rand));
  if (k_ === _0n$5)
    throw new Error("sign failed: k is zero");
  const p = BASE.multiply(k_);
  const affine = p.toAffine();
  const k = hasEven$1(affine.y) ? k_ : Fn2.neg(k_);
  const rx = affineXToBytes(affine);
  const e = challenge(rx, px, m);
  const sig = new Uint8Array(64);
  sig.set(rx, 0);
  sig.set(Fn2.toBytes(Fn2.create(k + e * d)), 32);
  if (!schnorrVerify(sig, m, px))
    throw new Error("sign: Invalid signature produced");
  return sig;
}
function schnorrVerify(signature, message, publicKey) {
  const { Fp, Fn: Fn2, BASE } = Pointk1;
  const sig = abytes(signature, 64, "signature");
  const m = abytes(message, void 0, "message");
  const pub = abytes(publicKey, 32, "publicKey");
  try {
    const P = lift_x(num(pub));
    const rBytes = sig.subarray(0, 32);
    const r = num(rBytes);
    if (!Fp.isValidNot0(r))
      return false;
    const s = num(sig.subarray(32, 64));
    if (!Fn2.isValidNot0(s))
      return false;
    const e = challenge(rBytes, pointToBytes(P), m);
    const R = BASE.mulAddUnsafe(s, P, Fn2.neg(e));
    const { x, y } = R.toAffine();
    if (R.is0() || !hasEven$1(y) || !Fp.eql(x, r))
      return false;
    return true;
  } catch (error) {
    return false;
  }
}
const schnorr = /* @__PURE__ */ (() => {
  const size = 32;
  const seedLength = 48;
  const randomSecretKey = (seed) => {
    seed = seed === void 0 ? randomBytes$1(seedLength) : seed;
    return mapHashToField(abytes(seed, seedLength, "seed"), secp256k1_CURVE.n);
  };
  return Object.freeze({
    keygen: createKeygen(randomSecretKey, schnorrGetPublicKey),
    getPublicKey: schnorrGetPublicKey,
    sign: schnorrSign,
    verify: schnorrVerify,
    Point: Pointk1,
    utils: Object.freeze({
      randomSecretKey,
      taggedHash,
      lift_x,
      pointToBytes
    }),
    lengths: Object.freeze({
      secretKey: size,
      publicKey: size,
      publicKeyHasPrefix: false,
      signature: size * 2,
      seed: seedLength
    })
  });
})();
const Rho160 = /* @__PURE__ */ Uint8Array.from([
  7,
  4,
  13,
  1,
  10,
  6,
  15,
  3,
  12,
  0,
  9,
  5,
  2,
  14,
  11,
  8
]);
const Id160 = /* @__PURE__ */ (() => Uint8Array.from(new Array(16).fill(0).map((_, i) => i)))();
const Pi160 = /* @__PURE__ */ (() => Id160.map((i) => (9 * i + 5) % 16))();
const idxLR = /* @__PURE__ */ (() => {
  const L = [Id160];
  const R = [Pi160];
  const res = [L, R];
  for (let i = 0; i < 4; i++)
    for (let j of res)
      j.push(j[i].map((k) => Rho160[k]));
  return res;
})();
const idxL = /* @__PURE__ */ (() => idxLR[0])();
const idxR = /* @__PURE__ */ (() => idxLR[1])();
const shifts160 = /* @__PURE__ */ [
  [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8],
  [12, 13, 11, 15, 6, 9, 9, 7, 12, 15, 11, 13, 7, 8, 7, 7],
  [13, 15, 14, 11, 7, 7, 6, 8, 13, 14, 13, 12, 5, 5, 6, 9],
  [14, 11, 12, 14, 8, 6, 5, 5, 15, 12, 15, 14, 9, 9, 8, 6],
  [15, 12, 13, 13, 9, 5, 8, 6, 14, 11, 12, 11, 8, 6, 5, 5]
].map((i) => Uint8Array.from(i));
const shiftsL160 = /* @__PURE__ */ idxL.map((idx, i) => idx.map((j) => shifts160[i][j]));
const shiftsR160 = /* @__PURE__ */ idxR.map((idx, i) => idx.map((j) => shifts160[i][j]));
const Kl160 = /* @__PURE__ */ Uint32Array.from([
  0,
  1518500249,
  1859775393,
  2400959708,
  2840853838
]);
const Kr160 = /* @__PURE__ */ Uint32Array.from([
  1352829926,
  1548603684,
  1836072691,
  2053994217,
  0
]);
function ripemd_f(group, x, y, z) {
  if (group === 0)
    return x ^ y ^ z;
  if (group === 1)
    return x & y | ~x & z;
  if (group === 2)
    return (x | ~y) ^ z;
  if (group === 3)
    return x & z | y & ~z;
  return x ^ (y | ~z);
}
const BUF_160 = /* @__PURE__ */ new Uint32Array(16);
class _RIPEMD1602 extends HashMD3 {
  constructor() {
    super(64, 20, 8, true);
    __publicField(this, "h0", 1732584193 | 0);
    __publicField(this, "h1", 4023233417 | 0);
    __publicField(this, "h2", 2562383102 | 0);
    __publicField(this, "h3", 271733878 | 0);
    __publicField(this, "h4", 3285377520 | 0);
  }
  get() {
    const { h0, h1, h2, h3, h4 } = this;
    return [h0, h1, h2, h3, h4];
  }
  set(h0, h1, h2, h3, h4) {
    this.h0 = h0 | 0;
    this.h1 = h1 | 0;
    this.h2 = h2 | 0;
    this.h3 = h3 | 0;
    this.h4 = h4 | 0;
  }
  _cloneInto(to) {
    (to || (to = new this.constructor())).set(...this.get());
    return this._cloneIntoMeta(to);
  }
  process(view2, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      BUF_160[i] = view2.getUint32(offset, true);
    let al = this.h0 | 0, ar = al, bl = this.h1 | 0, br = bl, cl = this.h2 | 0, cr = cl, dl = this.h3 | 0, dr = dl, el = this.h4 | 0, er = el;
    for (let group = 0; group < 5; group++) {
      const rGroup = 4 - group;
      const hbl = Kl160[group], hbr = Kr160[group];
      const rl = idxL[group], rr = idxR[group];
      const sl = shiftsL160[group], sr = shiftsR160[group];
      for (let i = 0; i < 16; i++) {
        const tl = rotl(al + ripemd_f(group, bl, cl, dl) + BUF_160[rl[i]] + hbl, sl[i]) + el | 0;
        al = el, el = dl, dl = rotl(cl, 10) | 0, cl = bl, bl = tl;
      }
      for (let i = 0; i < 16; i++) {
        const tr = rotl(ar + ripemd_f(rGroup, br, cr, dr) + BUF_160[rr[i]] + hbr, sr[i]) + er | 0;
        ar = er, er = dr, dr = rotl(cr, 10) | 0, cr = br, br = tr;
      }
    }
    this.set(this.h1 + cl + dr | 0, this.h2 + dl + er | 0, this.h3 + el + ar | 0, this.h4 + al + br | 0, this.h0 + bl + cr | 0);
  }
  roundClean() {
    clean(BUF_160);
  }
  destroy() {
    this.destroyed = true;
    clean(this.buffer);
    this.set(0, 0, 0, 0, 0);
  }
}
const ripemd160 = /* @__PURE__ */ createHasher(() => new _RIPEMD1602());
const EMPTY = /* @__PURE__ */ Uint8Array.of();
const NULL = /* @__PURE__ */ Uint8Array.of(0);
const restrictedKeys = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
const validateFieldName = (name, label) => {
  if (typeof name !== "string")
    throw new Error(`${label} should be string, got ${typeof name}`);
  if (name.includes(".."))
    throw new TypeError(`${label} ${name} cannot contain path parent ..`);
  if (name.includes("/"))
    throw new TypeError(`${label} ${name} cannot contain path separator /`);
  if (restrictedKeys.has(name))
    throw new Error(`${label} ${name} is reserved`);
};
function equalBytes$1(a, b) {
  if (a.length !== b.length)
    return false;
  for (let i = 0; i < a.length; i++)
    if (a[i] !== b[i])
      return false;
  return true;
}
function createFindBytes(needle) {
  if (needle.length === 1) {
    const byte = needle[0];
    return (data, pos = 0) => {
      const idx = data.indexOf(byte, pos);
      return idx === -1 ? void 0 : idx;
    };
  }
  const back = new Uint32Array(needle.length);
  for (let i = 1, j = 0; i < needle.length; i++) {
    while (j && needle[i] !== needle[j])
      j = back[j - 1];
    if (needle[i] === needle[j])
      back[i] = ++j;
  }
  return (data, pos = 0) => {
    for (let i = pos, j = 0; i < data.length; i++) {
      while (j && data[i] !== needle[j])
        j = back[j - 1];
      if (data[i] !== needle[j])
        continue;
      if (++j === needle.length)
        return i - needle.length + 1;
    }
    return void 0;
  };
}
const findBytes = (needle, data, pos = 0) => createFindBytes(needle)(data, pos);
function equal(a, b) {
  const aBytes = isBytes$1(a);
  const bBytes = isBytes$1(b);
  if (aBytes || bBytes)
    return aBytes && bBytes && equalBytes$1(a, b);
  return a === b;
}
function isBytes$1(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
function concatBytes$1(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    if (!isBytes$1(a))
      throw new Error("Uint8Array expected");
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad);
    pad += a.length;
  }
  return res;
}
const createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
const _0n$4 = /* @__PURE__ */ BigInt(0);
const _1n$3 = /* @__PURE__ */ BigInt(1);
const _2n$2 = /* @__PURE__ */ BigInt(2);
const _8n$1 = /* @__PURE__ */ BigInt(8);
const _10n = /* @__PURE__ */ BigInt(10);
const _255n = /* @__PURE__ */ BigInt(255);
function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}
function isNum(num2) {
  return Number.isSafeInteger(num2);
}
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const utils = /* @__PURE__ */ Object.freeze({
  equalBytes: equalBytes$1,
  isBytes: isBytes$1,
  isCoder,
  checkBounds,
  concatBytes: concatBytes$1,
  createView,
  isPlainObject
});
const lengthCoder = (len) => {
  if (len !== null && typeof len !== "string" && !isCoder(len) && !isBytes$1(len) && !isNum(len)) {
    throw new TypeError(`lengthCoder: expected null | number | Uint8Array | CoderType, got ${len} (${typeof len})`);
  }
  if (typeof len === "number" && len < 0)
    throw new Error(`lengthCoder: wrong length=${len}`);
  if (isBytes$1(len) && !len.length)
    throw new Error("lengthCoder: empty terminator");
  return {
    encodeStream(w, value) {
      if (len === null)
        return;
      if (isCoder(len))
        return len.encodeStream(w, value);
      let byteLen;
      if (typeof len === "number")
        byteLen = len;
      else if (typeof len === "string")
        byteLen = Path.resolve(w.stack, len);
      if (typeof byteLen === "bigint")
        byteLen = Number(byteLen);
      if (!isNum(byteLen) || byteLen < 0 || byteLen !== value)
        throw w.err(`Wrong length: ${byteLen} len=${len} exp=${value} (${typeof value})`);
    },
    decodeStream(r) {
      let byteLen;
      if (isCoder(len))
        byteLen = len.decodeStream(r);
      else if (typeof len === "number")
        byteLen = len;
      else if (typeof len === "string")
        byteLen = Path.resolve(r.stack, len);
      if (typeof byteLen === "bigint")
        byteLen = Number(byteLen);
      else if (typeof byteLen !== "number")
        throw r.err(`Wrong length: ${byteLen}`);
      if (!isNum(byteLen) || byteLen < 0)
        throw r.err(`Wrong length: ${byteLen}`);
      return byteLen;
    }
  };
};
const Bitset = /* @__PURE__ */ Object.freeze({
  BITS: 32,
  FULL_MASK: -1 >>> 0,
  // 1<<32 will overflow
  len: (len) => {
    if (!isNum(len) || len < 0)
      throw new Error(`wrong len=${len}`);
    return Math.ceil(len / 32);
  },
  create: (len) => new Uint32Array(Bitset.len(len)),
  clean: (bs) => bs.fill(0),
  debug: (bs) => Array.from(bs).map((i) => (i >>> 0).toString(2).padStart(32, "0")),
  checkLen: (bs, len) => {
    if (Bitset.len(len) === bs.length)
      return;
    throw new Error(`wrong length=${bs.length}. Expected: ${Bitset.len(len)}`);
  },
  chunkLen: (bsLen, pos, len) => {
    if (!isNum(bsLen) || bsLen < 0)
      throw new Error(`wrong bsLen=${bsLen}`);
    if (!isNum(pos) || pos < 0)
      throw new Error(`wrong pos=${pos}`);
    if (!isNum(len) || len < 0)
      throw new Error(`wrong len=${len}`);
    if (pos > bsLen - len)
      throw new Error(`wrong range=${pos}/${len} of ${bsLen}`);
  },
  set: (bs, chunk, value, allowRewrite = true) => {
    if (!isNum(chunk) || chunk < 0 || chunk >= bs.length)
      return false;
    if (!allowRewrite && (bs[chunk] & value) !== 0)
      return false;
    bs[chunk] |= value;
    return true;
  },
  pos: (pos, i) => ({
    chunk: Math.floor((pos + i) / 32),
    mask: 1 << 32 - (pos + i) % 32 - 1
  }),
  indices: (bs, len, invert2 = false) => {
    Bitset.checkLen(bs, len);
    const { FULL_MASK, BITS } = Bitset;
    const left = BITS - len % BITS;
    const lastMask = left ? FULL_MASK >>> left << left : FULL_MASK;
    const res = [];
    for (let i = 0; i < bs.length; i++) {
      let c = bs[i];
      if (invert2)
        c = ~c;
      if (i === bs.length - 1)
        c &= lastMask;
      if (c === 0)
        continue;
      for (let j = 0; j < BITS; j++) {
        const m = 1 << BITS - j - 1;
        if (c & m)
          res.push(i * BITS + j);
      }
    }
    return res;
  },
  range: (arr) => {
    const res = [];
    let cur;
    for (const i of arr) {
      if (cur === void 0 || i !== cur.pos + cur.length)
        res.push(cur = { pos: i, length: 1 });
      else
        cur.length += 1;
    }
    return res;
  },
  rangeDebug: (bs, len, invert2 = false) => `[${Bitset.range(Bitset.indices(bs, len, invert2)).map((i) => `(${i.pos}/${i.length})`).join(", ")}]`,
  setRange: (bs, bsLen, pos, len, allowRewrite = true) => {
    Bitset.chunkLen(bsLen, pos, len);
    if (len === 0)
      return true;
    const { FULL_MASK, BITS } = Bitset;
    const first = pos % BITS ? Math.floor(pos / BITS) : void 0;
    const lastPos = pos + len;
    const last = lastPos % BITS ? Math.floor(lastPos / BITS) : void 0;
    const canSet = (chunk, value) => chunk >= 0 && chunk < bs.length && (bs[chunk] & value) === 0;
    if (!allowRewrite) {
      if (first !== void 0 && first === last) {
        if (!canSet(first, FULL_MASK >>> BITS - len << BITS - len - pos))
          return false;
      } else {
        if (first !== void 0 && !canSet(first, FULL_MASK >>> pos % BITS))
          return false;
        const start2 = first !== void 0 ? first + 1 : pos / BITS;
        const end2 = last !== void 0 ? last : lastPos / BITS;
        for (let i = start2; i < end2; i++)
          if (!canSet(i, FULL_MASK))
            return false;
        if (last !== void 0 && first !== last) {
          if (!canSet(last, FULL_MASK << BITS - lastPos % BITS))
            return false;
        }
      }
    }
    if (first !== void 0 && first === last)
      return Bitset.set(bs, first, FULL_MASK >>> BITS - len << BITS - len - pos, allowRewrite);
    if (first !== void 0) {
      if (!Bitset.set(bs, first, FULL_MASK >>> pos % BITS, allowRewrite))
        return false;
    }
    const start = first !== void 0 ? first + 1 : pos / BITS;
    const end = last !== void 0 ? last : lastPos / BITS;
    for (let i = start; i < end; i++)
      if (!Bitset.set(bs, i, FULL_MASK, allowRewrite))
        return false;
    if (last !== void 0 && first !== last) {
      if (!Bitset.set(bs, last, FULL_MASK << BITS - lastPos % BITS, allowRewrite))
        return false;
    }
    return true;
  }
});
const Path = /* @__PURE__ */ Object.freeze({
  /**
   * Internal method for handling stack of paths (debug, errors, dynamic fields via path)
   * `.pop()` always happens after the wrapped function.
   * Fields inside the object are tracked via Reader/Writer enterField()/exitField(),
   * which the debugger overrides to observe per-field byte ranges.
   * NOTE: we don't want to do '.pop' on error!
   */
  pushObj: (stack, obj, objFn) => {
    stack.push({ obj });
    objFn();
    stack.pop();
  },
  path: (stack) => {
    const res = [];
    for (const i of stack)
      if (i.field !== void 0)
        res.push(i.field === "" ? '""' : `${i.field}`);
    return res.join("/");
  },
  err: (name, stack, msg) => {
    const text = `${name}(${Path.path(stack)}): ${typeof msg === "string" ? msg : msg.message}`;
    const err = msg instanceof TypeError ? new TypeError(text) : msg instanceof RangeError ? new RangeError(text) : new Error(text);
    if (msg instanceof Error && msg.stack) {
      const from = `${msg.name}: ${msg.message}`;
      const to = `${err.name}: ${err.message}`;
      err.stack = msg.stack.startsWith(from) ? `${to}${msg.stack.slice(from.length)}` : msg.stack;
    }
    return err;
  },
  resolve: (stack, path2) => {
    const parts = path2.split("/");
    const objPath = stack.map((i2) => i2.obj);
    let i = 0;
    for (; i < parts.length; i++) {
      if (parts[i] === "..")
        objPath.pop();
      else
        break;
    }
    let cur = objPath.pop();
    for (; i < parts.length; i++) {
      if (!cur || cur[parts[i]] === void 0)
        return void 0;
      cur = cur[parts[i]];
    }
    return cur;
  }
});
class _Reader {
  constructor(data, opts = {}, stack = [], parent = void 0, parentOffset = 0) {
    __publicField(this, "pos", 0);
    __publicField(this, "data");
    __publicField(this, "opts");
    __publicField(this, "stack");
    __publicField(this, "parent");
    __publicField(this, "parentOffset");
    __publicField(this, "bitBuf", 0);
    __publicField(this, "bitPos", 0);
    __publicField(this, "bs");
    // bitset
    __publicField(this, "view");
    if (!isBytes$1(data))
      throw new TypeError(`Reader: expected Uint8Array, got ${typeof data}`);
    if (!isPlainObject(opts))
      throw new TypeError(`ReaderOpts: expected plain object, got ${opts}`);
    if (opts.allowUnreadBytes !== void 0 && typeof opts.allowUnreadBytes !== "boolean")
      throw new TypeError(`ReaderOpts.allowUnreadBytes: expected boolean, got ${typeof opts.allowUnreadBytes}`);
    if (opts.allowMultipleReads !== void 0 && typeof opts.allowMultipleReads !== "boolean")
      throw new TypeError(`ReaderOpts.allowMultipleReads: expected boolean, got ${typeof opts.allowMultipleReads}`);
    this.data = data;
    this.opts = opts;
    this.stack = stack;
    this.parent = parent;
    this.parentOffset = parentOffset;
    this.view = createView(data);
  }
  /** Internal method for pointers. */
  _enablePointers() {
    if (this.parent)
      return this.parent._enablePointers();
    if (this.bs)
      return;
    this.bs = Bitset.create(this.data.length);
    Bitset.setRange(this.bs, this.data.length, 0, this.pos, this.opts.allowMultipleReads);
  }
  markBytesBS(pos, len) {
    if (this.parent)
      return this.parent.markBytesBS(this.parentOffset + pos, len);
    if (!len)
      return true;
    if (!this.bs)
      return true;
    return Bitset.setRange(this.bs, this.data.length, pos, len, false);
  }
  markBytes(len) {
    const pos = this.pos;
    const res = this.markBytesBS(pos, len);
    if (!this.opts.allowMultipleReads && !res)
      throw this.err(`multiple read pos=${pos} len=${len}`);
    this.pos += len;
    return res;
  }
  pushObj(obj, objFn) {
    return Path.pushObj(this.stack, obj, objFn);
  }
  enterField(field) {
    const last = this.stack[this.stack.length - 1];
    if (last === void 0 || last.field !== void 0)
      throw this.err(`enterField: invalid stack state, field=${field}`);
    last.field = field;
  }
  // Intentionally not called on throw, so Path.err() can report the failing leaf.
  exitField() {
    this.stack[this.stack.length - 1].field = void 0;
  }
  readView(n, fn) {
    if (!isNum(n) || n < 0)
      throw this.err(`readView: wrong length=${n}`);
    if (this.pos + n > this.data.length)
      throw this.err("readView: Unexpected end of buffer");
    const res = fn(this.view, this.pos);
    this.markBytes(n);
    return res;
  }
  // read bytes by absolute offset
  absBytes(n) {
    if (!isNum(n) || n < 0 || n > this.data.length)
      throw new Error("Unexpected end of buffer");
    return this.data.subarray(n);
  }
  finish() {
    if (this.opts.allowUnreadBytes)
      return;
    if (this.bitPos) {
      throw this.err(`${this.bitPos} bits left after unpack: ${hex.encode(this.data.subarray(this.pos))}`);
    }
    if (this.bs && !this.parent) {
      const notRead = Bitset.indices(this.bs, this.data.length, true);
      if (notRead.length) {
        const formatted = Bitset.range(notRead).map(({ pos, length }) => `(${pos}/${length})[${hex.encode(this.data.subarray(pos, pos + length))}]`).join(", ");
        throw this.err(`unread byte ranges: ${formatted} (total=${this.data.length})`);
      } else
        return;
    }
    if (!this.isEnd()) {
      throw this.err(`${this.leftBytes} bytes ${this.bitPos} bits left after unpack: ${hex.encode(this.data.subarray(this.pos))}`);
    }
  }
  // User methods
  err(msg) {
    return Path.err("Reader", this.stack, msg);
  }
  offsetReader(n) {
    if (!isNum(n) || n < 0 || n > this.data.length)
      throw this.err("offsetReader: Unexpected end of buffer");
    return new _Reader(this.absBytes(n), this.opts, this.stack, this, n);
  }
  bytes(n, peek = false) {
    if (this.bitPos)
      throw this.err("readBytes: bitPos not empty");
    if (!isNum(n) || n < 0)
      throw this.err(`readBytes: wrong length=${n}`);
    if (this.pos + n > this.data.length)
      throw this.err("readBytes: Unexpected end of buffer");
    const slice = this.data.subarray(this.pos, this.pos + n);
    if (!peek)
      this.markBytes(n);
    return slice;
  }
  byte(peek = false) {
    if (this.bitPos)
      throw this.err("readByte: bitPos not empty");
    if (this.pos + 1 > this.data.length)
      throw this.err("readByte: Unexpected end of buffer");
    const data = this.data[this.pos];
    if (!peek)
      this.markBytes(1);
    return data;
  }
  get leftBytes() {
    return this.data.length - this.pos;
  }
  get totalBytes() {
    return this.data.length;
  }
  isEnd() {
    return this.pos >= this.data.length && !this.bitPos;
  }
  progress() {
    return this.pos * 8 - this.bitPos;
  }
  // bits are read in BE mode (left to right): (0b1000_0000).readBits(1) == 1
  bits(bits) {
    if (!isNum(bits) || bits < 0)
      throw this.err(`BitReader: wrong length=${bits}`);
    if (bits > 32)
      throw this.err("BitReader: cannot read more than 32 bits in single call");
    let out = 0;
    while (bits) {
      if (!this.bitPos) {
        this.bitBuf = this.byte();
        this.bitPos = 8;
      }
      const take = Math.min(bits, this.bitPos);
      this.bitPos -= take;
      out = out << take | this.bitBuf >> this.bitPos & 2 ** take - 1;
      this.bitBuf &= 2 ** this.bitPos - 1;
      bits -= take;
    }
    return out >>> 0;
  }
  find(needle, pos = this.pos) {
    if (!isBytes$1(needle))
      throw this.err(`find: needle is not bytes! ${needle}`);
    if (this.bitPos)
      throw this.err("find: bitPos not empty");
    if (!needle.length)
      throw this.err(`find: needle is empty`);
    if (!isNum(pos) || pos < 0)
      throw this.err(`find: wrong pos=${pos}`);
    return findBytes(needle, this.data, pos);
  }
}
class _Writer {
  constructor(stack = []) {
    __publicField(this, "pos", 0);
    __publicField(this, "stack");
    // Small writes are carved out of writer-owned chunks; caller-provided bytes() buffers are kept
    // by reference between them. A single realloc'd buffer was measured slower for tiny encodes
    // (basic/encode bench: 395ns -> 560ns), copy-on-grow is what chunking avoids.
    __publicField(this, "buffers", []);
    // Every chunk ever allocated by this writer, so finish(clean) can zeroize them whole.
    __publicField(this, "chunks", []);
    __publicField(this, "chunk");
    __publicField(this, "chunkView");
    // lazy: only writeView() needs it
    __publicField(this, "chunkPos", 0);
    __publicField(this, "run");
    __publicField(this, "nextChunkSize", 0);
    // 0 = size the first chunk to the first write
    __publicField(this, "ptrs", []);
    __publicField(this, "bitBuf", 0);
    __publicField(this, "bitPos", 0);
    __publicField(this, "finished", false);
    this.stack = stack;
  }
  // Reserves `len` contiguous writer-owned bytes and returns their offset inside `this.chunk`.
  carve(len) {
    if (this.chunk === void 0 || this.chunk.length - this.chunkPos < len) {
      const size = Math.max(len, this.nextChunkSize, 64);
      this.nextChunkSize = Math.min(size * 8, 4096);
      this.chunk = new Uint8Array(size);
      this.chunkView = void 0;
      this.chunkPos = 0;
      this.run = void 0;
      this.chunks.push(this.chunk);
    }
    const pos = this.chunkPos;
    if (this.run === void 0) {
      this.run = { chunk: this.chunk, start: pos, end: pos + len };
      this.buffers.push(this.run);
    } else
      this.run.end += len;
    this.chunkPos = pos + len;
    this.pos += len;
    return pos;
  }
  pushObj(obj, objFn) {
    return Path.pushObj(this.stack, obj, objFn);
  }
  enterField(field) {
    const last = this.stack[this.stack.length - 1];
    if (last === void 0 || last.field !== void 0)
      throw this.err(`enterField: invalid stack state, field=${field}`);
    last.field = field;
  }
  // Intentionally not called on throw, so Path.err() can report the failing leaf.
  exitField() {
    this.stack[this.stack.length - 1].field = void 0;
  }
  writeView(len, fn) {
    if (this.finished)
      throw this.err("buffer: finished");
    if (!isNum(len) || len < 0 || len > 8)
      throw new Error(`wrong writeView length=${len}`);
    if (this.bitPos)
      throw this.err("writeBytes: ends with non-empty bit buffer");
    const pos = this.carve(len);
    if (this.chunkView === void 0)
      this.chunkView = createView(this.chunk);
    fn(this.chunkView, pos);
  }
  // User methods
  err(msg) {
    return Path.err("Writer", this.stack, msg);
  }
  bytes(b) {
    if (this.finished)
      throw this.err("buffer: finished");
    if (this.bitPos)
      throw this.err("writeBytes: ends with non-empty bit buffer");
    if (!isBytes$1(b))
      throw this.err(`writeBytes: expected Uint8Array, got ${typeof b}`);
    this.buffers.push(b);
    this.run = void 0;
    this.pos += b.length;
  }
  byte(b) {
    if (this.finished)
      throw this.err("buffer: finished");
    if (this.bitPos)
      throw this.err("writeByte: ends with non-empty bit buffer");
    if (!isNum(b) || b < 0 || b > 255)
      throw this.err(`writeByte: wrong value=${b}`);
    const pos = this.carve(1);
    this.chunk[pos] = b;
  }
  finish(clean2 = true) {
    if (this.finished)
      throw this.err("buffer: finished");
    if (this.bitPos)
      throw this.err("buffer: ends with non-empty bit buffer");
    const buffers = this.buffers;
    let sum = 0;
    for (let i = 0; i < buffers.length; i++) {
      const b = buffers[i];
      sum += isBytes$1(b) ? b.length : b.end - b.start;
    }
    for (let i = 0; i < this.ptrs.length; i++)
      sum += this.ptrs[i].buffer.length;
    const buf = new Uint8Array(sum);
    let pad = 0;
    for (let i = 0; i < buffers.length; i++) {
      const b = buffers[i];
      if (isBytes$1(b)) {
        buf.set(b, pad);
        pad += b.length;
      } else {
        buf.set(b.chunk.subarray(b.start, b.end), pad);
        pad += b.end - b.start;
      }
    }
    for (let i = 0; i < this.ptrs.length; i++) {
      buf.set(this.ptrs[i].buffer, pad);
      pad += this.ptrs[i].buffer.length;
    }
    for (let pos = this.pos, i = 0; i < this.ptrs.length; i++) {
      const ptr = this.ptrs[i];
      buf.set(ptr.ptr.encode(pos), ptr.pos);
      pos += ptr.buffer.length;
    }
    if (clean2) {
      for (const c of this.chunks)
        c.fill(0);
      this.chunks = [];
      this.chunk = void 0;
      this.chunkView = void 0;
      this.chunkPos = 0;
      this.run = void 0;
      this.buffers = [];
      for (const p of this.ptrs)
        p.buffer.fill(0);
      this.ptrs = [];
      this.finished = true;
      this.bitBuf = 0;
    }
    return buf;
  }
  bits(value, bits) {
    if (this.finished)
      throw this.err("buffer: finished");
    if (!isNum(bits) || bits < 0)
      throw this.err(`writeBits: wrong length=${bits}`);
    if (bits > 32)
      throw this.err("writeBits: cannot write more than 32 bits in single call");
    if (!isNum(value) || value < 0)
      throw this.err(`writeBits: wrong value=${value}`);
    if (value >= 2 ** bits)
      throw this.err(`writeBits: value (${value}) >= 2**bits (${bits})`);
    while (bits) {
      const take = Math.min(bits, 8 - this.bitPos);
      this.bitBuf = this.bitBuf << take | value >> bits - take;
      this.bitPos += take;
      bits -= take;
      value &= 2 ** bits - 1;
      if (this.bitPos === 8) {
        this.bitPos = 0;
        const pos = this.carve(1);
        this.chunk[pos] = this.bitBuf;
      }
    }
  }
}
const swapEndianness = (b) => Uint8Array.from(b).reverse();
function checkMinimalBigintBytes(value, le, signed, err) {
  if (!value.length)
    return;
  const b = le ? swapEndianness(value) : value;
  const fail = () => {
    throw err("bigint: non-minimal encoding");
  };
  if (!signed) {
    if (b[0] === 0)
      fail();
    return;
  }
  if (b[0] === 0 && (b.length === 1 || (b[1] & 128) === 0))
    fail();
  if (b.length > 1 && b[0] === 255 && (b[1] & 128) !== 0)
    fail();
}
function checkBounds(value, bits, signed) {
  if (signed) {
    if (bits <= _0n$4)
      throw new Error(`checkBounds: signed bits must be positive, got ${bits}`);
    const signBit = _2n$2 ** (bits - _1n$3);
    if (value < -signBit || value >= signBit)
      throw new Error(`value out of signed bounds. Expected ${-signBit} <= ${value} < ${signBit}`);
  } else {
    const max = _2n$2 ** bits;
    if (_0n$4 > value || value >= max)
      throw new Error(`value out of unsigned bounds. Expected 0 <= ${value} < ${max}`);
  }
}
function _wrap(inner) {
  const _inner = inner;
  return {
    // NOTE: we cannot export validate here, since it is likely mistake.
    // Raw inner throws propagate unchanged; path-aware errors must use w.err/r.err or validate().
    encodeStream: _inner.encodeStream,
    decodeStream: _inner.decodeStream,
    size: _inner.size,
    encode: (value) => {
      const w = new _Writer();
      _inner.encodeStream(w, value);
      return w.finish();
    },
    decode: (data, opts = {}) => {
      if (!isBytes$1(data))
        throw new TypeError(`decode: expected Uint8Array, got ${typeof data}`);
      const r = new _Reader(data, opts);
      const res = _inner.decodeStream(r);
      r.finish();
      return res;
    }
  };
}
function validate(inner, fn) {
  if (!isCoder(inner))
    throw new TypeError(`validate: invalid inner value ${inner}`);
  if (typeof fn !== "function")
    throw new TypeError("validate: fn should be function");
  return _wrap({
    size: inner.size,
    encodeStream: (w, value) => {
      let res;
      try {
        res = fn(value);
      } catch (e) {
        throw w.err(e);
      }
      inner.encodeStream(w, res);
    },
    decodeStream: (r) => {
      const res = inner.decodeStream(r);
      try {
        return fn(res);
      } catch (e) {
        throw r.err(e);
      }
    }
  });
}
const wrap = (inner) => {
  const _inner = inner;
  if (!isPlainObject(_inner))
    throw new TypeError(`wrap: invalid inner value ${_inner}`);
  if (typeof _inner.encodeStream !== "function")
    throw new TypeError("wrap: encodeStream should be function");
  if (typeof _inner.decodeStream !== "function")
    throw new TypeError("wrap: decodeStream should be function");
  if (_inner.size !== void 0 && (!isNum(_inner.size) || _inner.size < 0))
    throw new TypeError(`wrap: invalid size ${_inner.size}`);
  if (_inner.validate !== void 0 && typeof _inner.validate !== "function")
    throw new TypeError("wrap: validate should be function");
  const res = _wrap(_inner);
  return _inner.validate !== void 0 ? validate(res, _inner.validate) : res;
};
const isBaseCoder = (elm) => isPlainObject(elm) && typeof elm.decode === "function" && typeof elm.encode === "function";
function isCoder(elm) {
  return isPlainObject(elm) && isBaseCoder(elm) && typeof elm.encodeStream === "function" && typeof elm.decodeStream === "function" && (elm.size === void 0 || isNum(elm.size) && elm.size >= 0);
}
function dict() {
  return {
    encode: (from) => {
      if (!Array.isArray(from))
        throw new Error("array expected");
      const to = {};
      const seen = /* @__PURE__ */ new Set();
      for (const item of from) {
        if (!Array.isArray(item) || item.length !== 2)
          throw new Error(`array of two elements expected`);
        const name = item[0];
        const value = item[1];
        validateFieldName(name, "dict: key");
        if (seen.has(name))
          throw new Error(`key(${name}) appears twice in struct`);
        seen.add(name);
        to[name] = value;
      }
      return to;
    },
    decode: (to) => {
      if (!isPlainObject(to))
        throw new Error(`expected plain object, got ${to}`);
      for (const name in to)
        validateFieldName(name, "dict: key");
      return Object.entries(to);
    }
  };
}
const numberBigint = /* @__PURE__ */ Object.freeze({
  encode: (from) => {
    if (typeof from !== "bigint")
      throw new Error(`expected bigint, got ${typeof from}`);
    if (from > BigInt(Number.MAX_SAFE_INTEGER))
      throw new Error(`element bigger than MAX_SAFE_INTEGER=${from}`);
    if (from < BigInt(Number.MIN_SAFE_INTEGER))
      throw new Error(`element smaller than MIN_SAFE_INTEGER=${from}`);
    return Number(from);
  },
  decode: (to) => {
    if (!isNum(to))
      throw new Error("element is not a safe integer");
    return BigInt(to);
  }
});
function tsEnum(e) {
  if (!isPlainObject(e))
    throw new Error("plain object expected");
  return {
    encode: (from) => {
      if (!isNum(from) || !(from in e))
        throw new Error(`wrong value ${from}`);
      return e[from];
    },
    decode: (to) => {
      if (typeof to !== "string")
        throw new Error(`wrong value ${typeof to}`);
      const value = e[to];
      if (!hasOwn(e, to) || !isNum(value))
        throw new Error(`wrong value ${to}`);
      return value;
    }
  };
}
function decimal(precision, round = false) {
  if (!isNum(precision) || precision < 0)
    throw new Error(`decimal/precision: wrong value ${precision}`);
  if (typeof round !== "boolean")
    throw new Error(`decimal/round: expected boolean, got ${typeof round}`);
  const decimalMask = _10n ** BigInt(precision);
  return {
    encode: (from) => {
      if (typeof from !== "bigint")
        throw new Error(`expected bigint, got ${typeof from}`);
      let s = (from < _0n$4 ? -from : from).toString(10);
      let sep = s.length - precision;
      if (sep < 0) {
        s = s.padStart(s.length - sep, "0");
        sep = 0;
      }
      let i = s.length - 1;
      for (; i >= sep && s[i] === "0"; i--)
        ;
      let int = s.slice(0, sep);
      let frac = s.slice(sep, i + 1);
      if (!int)
        int = "0";
      if (from < _0n$4)
        int = "-" + int;
      if (!frac)
        return int;
      return `${int}.${frac}`;
    },
    decode: (to) => {
      if (typeof to !== "string")
        throw new Error(`expected string, got ${typeof to}`);
      let neg = false;
      if (to.startsWith("-")) {
        neg = true;
        to = to.slice(1);
      }
      if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(to))
        throw new Error(`wrong string value=${to}`);
      let sep = to.indexOf(".");
      sep = sep === -1 ? to.length : sep;
      const intS = to.slice(0, sep);
      const fracS = to.slice(sep + 1).replace(/0+$/, "");
      const int = BigInt(intS) * decimalMask;
      if (!round && fracS.length > precision) {
        throw new Error(`fractional part cannot be represented with this precision (num=${to}, prec=${precision})`);
      }
      const fracLen = Math.min(fracS.length, precision);
      const frac = BigInt(fracS.slice(0, fracLen)) * _10n ** BigInt(precision - fracLen);
      const value = int + frac;
      if (neg && value === _0n$4)
        throw new Error(`negative zero is not allowed`);
      return neg ? -value : value;
    }
  };
}
function match(lst) {
  if (!Array.isArray(lst))
    throw new Error(`expected array, got ${typeof lst}`);
  for (const i of lst)
    if (!isBaseCoder(i))
      throw new Error(`wrong base coder ${i}`);
  return {
    encode: (from) => {
      for (const c of lst) {
        let elm;
        try {
          elm = c.encode(from);
        } catch {
          continue;
        }
        if (elm !== void 0)
          return elm;
      }
      throw new Error(`match/encode: cannot find match in ${from}`);
    },
    decode: (to) => {
      for (const c of lst) {
        let elm;
        try {
          elm = c.decode(to);
        } catch {
          continue;
        }
        if (elm !== void 0)
          return elm;
      }
      throw new Error(`match/decode: cannot find match in ${to}`);
    }
  };
}
const reverse = (coder) => {
  if (!isBaseCoder(coder))
    throw new Error("BaseCoder expected");
  return { encode: (to) => coder.decode(to), decode: (from) => coder.encode(from) };
};
const coders = /* @__PURE__ */ Object.freeze({ dict, numberBigint, tsEnum, decimal, match, reverse });
const bigint = (size, le = false, signed = false, sized = true, minimal = false) => {
  if (!isNum(size) || size <= 0)
    throw new Error(`bigint/size: wrong value ${size}`);
  if (typeof le !== "boolean")
    throw new Error(`bigint/le: expected boolean, got ${typeof le}`);
  if (typeof signed !== "boolean")
    throw new Error(`bigint/signed: expected boolean, got ${typeof signed}`);
  if (typeof sized !== "boolean")
    throw new Error(`bigint/sized: expected boolean, got ${typeof sized}`);
  if (typeof minimal !== "boolean")
    throw new Error(`bigint/minimal: expected boolean, got ${typeof minimal}`);
  const bLen = BigInt(size);
  const signBit = _2n$2 ** (_8n$1 * bLen - _1n$3);
  return wrap({
    size: sized ? size : void 0,
    encodeStream: (w, value) => {
      const zero = value === _0n$4;
      if (signed && value < 0)
        value = value | signBit;
      let res = new Uint8Array(size);
      for (let i = size - 1; i >= 0; i--) {
        res[i] = Number(value & _255n);
        value >>= _8n$1;
      }
      if (!sized) {
        let pos = 0;
        if (signed) {
          for (; pos < res.length - 1; pos++) {
            const next = res[pos + 1];
            if (res[pos] === 0 && (next & 128) === 0)
              continue;
            if (res[pos] === 255 && (next & 128) !== 0)
              continue;
            break;
          }
          res = zero ? res.subarray(res.length) : res.subarray(pos);
        } else {
          for (; pos < res.length; pos++)
            if (res[pos] !== 0)
              break;
          res = res.subarray(pos);
        }
      }
      w.bytes(le ? res.reverse() : res);
    },
    decodeStream: (r) => {
      const value = r.bytes(sized ? size : Math.min(size, r.leftBytes));
      if (!sized && minimal)
        checkMinimalBigintBytes(value, le, signed, (msg) => r.err(msg));
      let res = _0n$4;
      if (le)
        for (let i = value.length - 1; i >= 0; i--)
          res = res << _8n$1 | BigInt(value[i]);
      else
        for (let i = 0; i < value.length; i++)
          res = res << _8n$1 | BigInt(value[i]);
      const sBit = sized || !value.length ? signBit : _2n$2 ** (_8n$1 * BigInt(value.length) - _1n$3);
      if (signed && res & sBit)
        res = (res ^ sBit) - sBit;
      return res;
    },
    validate: (value) => {
      if (typeof value !== "bigint")
        throw new Error(`bigint: invalid value: ${value}`);
      checkBounds(value, _8n$1 * bLen, !!signed);
      return value;
    }
  });
};
const U256LE = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ bigint(32, true)
);
const U64LE = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ bigint(8, true)
);
const I64LE = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ bigint(8, true, true)
);
const view = (len, opts) => wrap({
  size: len,
  encodeStream: (w, value) => w.writeView(len, (view2, pos) => opts.write(view2, pos, value)),
  decodeStream: (r) => r.readView(len, opts.read),
  validate: (value) => {
    if (typeof value !== "number")
      throw new TypeError(`viewCoder: expected number, got ${typeof value}`);
    if (opts.validate)
      opts.validate(value);
    return value;
  }
});
const intView = (len, signed, opts) => {
  const bits = len * 8;
  const signBit = 2 ** (bits - 1);
  const validateSigned = (value) => {
    if (!isNum(value))
      throw new TypeError(`sintView: value is not safe integer: ${value}`);
    if (value < -signBit || value >= signBit) {
      throw new RangeError(`sintView: value out of bounds. Expected ${-signBit} <= ${value} < ${signBit}`);
    }
  };
  const maxVal = 2 ** bits;
  const validateUnsigned = (value) => {
    if (!isNum(value))
      throw new TypeError(`uintView: value is not safe integer: ${value}`);
    if (0 > value || value >= maxVal) {
      throw new RangeError(`uintView: value out of bounds. Expected 0 <= ${value} < ${maxVal}`);
    }
  };
  return view(len, {
    write: opts.write,
    read: opts.read,
    validate: signed ? validateSigned : validateUnsigned
  });
};
const U32LE = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ intView(4, false, {
    read: (view2, pos) => view2.getUint32(pos, true),
    write: (view2, pos, value) => view2.setUint32(pos, value, true)
  })
);
const U32BE = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ intView(4, false, {
    read: (view2, pos) => view2.getUint32(pos, false),
    write: (view2, pos, value) => view2.setUint32(pos, value, false)
  })
);
const I32LE = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ intView(4, true, {
    read: (view2, pos) => view2.getInt32(pos, true),
    write: (view2, pos, value) => view2.setInt32(pos, value, true)
  })
);
const U16LE = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ intView(2, false, {
    read: (view2, pos) => view2.getUint16(pos, true),
    write: (view2, pos, value) => view2.setUint16(pos, value, true)
  })
);
const U8 = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ intView(1, false, {
    read: (view2, pos) => view2.getUint8(pos),
    write: (view2, pos, value) => view2.setUint8(pos, value)
  })
);
const createBytes = (len, le = false) => {
  if (typeof le !== "boolean")
    throw new TypeError(`bytes/le: expected boolean, got ${typeof le}`);
  const _length = lengthCoder(len);
  const _isb = isBytes$1(len);
  const terminator = _isb ? Uint8Array.from(len) : void 0;
  const findTerminator = terminator && terminator.length ? createFindBytes(terminator) : void 0;
  return wrap({
    size: typeof len === "number" ? len : void 0,
    encodeStream: (w, value) => {
      if (!_isb)
        _length.encodeStream(w, value.length);
      w.bytes(le ? swapEndianness(value) : value);
      if (terminator)
        w.bytes(terminator);
    },
    decodeStream: (r) => {
      let bytes;
      if (terminator) {
        const tPos = r.find(terminator);
        if (tPos === void 0)
          throw r.err(`bytes: cannot find terminator`);
        bytes = r.bytes(tPos - r.pos);
        r.bytes(terminator.length);
      } else {
        bytes = r.bytes(len === null ? r.leftBytes : _length.decodeStream(r));
      }
      return le ? swapEndianness(bytes) : bytes;
    },
    validate: (value) => {
      if (!isBytes$1(value))
        throw new TypeError(`bytes: invalid value ${value}`);
      if (findTerminator) {
        const data = le ? swapEndianness(value) : value;
        if (findTerminator(data) !== void 0)
          throw new Error("bytes: value contains terminator");
      }
      return value;
    }
  });
};
function prefix(len, inner) {
  if (!isCoder(inner))
    throw new TypeError(`prefix: invalid inner value ${inner}`);
  return apply(createBytes(len), reverse(inner));
}
const string = (len, le = false) => validate(apply(createBytes(len, le), utf8), (value) => {
  if (typeof value !== "string")
    throw new Error(`expected string, got ${typeof value}`);
  return value;
});
function apply(inner, base) {
  if (!isCoder(inner))
    throw new TypeError(`apply: invalid inner value ${inner}`);
  if (!isBaseCoder(base))
    throw new TypeError(`apply: invalid base value ${base}`);
  return wrap({
    size: inner.size,
    encodeStream: (w, value) => {
      let innerValue;
      try {
        innerValue = base.decode(value);
      } catch (e) {
        throw w.err("" + e);
      }
      return inner.encodeStream(w, innerValue);
    },
    decodeStream: (r) => {
      const innerValue = inner.decodeStream(r);
      try {
        return base.encode(innerValue);
      } catch (e) {
        throw r.err("" + e);
      }
    }
  });
}
const flag = (flagValue, xor = false) => {
  if (!isBytes$1(flagValue))
    throw new TypeError(`flag/flagValue: expected Uint8Array, got ${typeof flagValue}`);
  if (flagValue.length === 0)
    throw new Error("flag/flagValue: empty marker");
  if (typeof xor !== "boolean")
    throw new TypeError(`flag/xor: expected boolean, got ${typeof xor}`);
  const marker = Uint8Array.from(flagValue);
  return wrap({
    // Marker flags encode one state as empty, so encoded length depends on the boolean value.
    size: void 0,
    encodeStream: (w, value) => {
      if (!!value !== xor)
        w.bytes(marker);
    },
    decodeStream: (r) => {
      let hasFlag = r.leftBytes >= marker.length;
      if (hasFlag) {
        hasFlag = equalBytes$1(r.bytes(marker.length, true), marker);
        if (hasFlag)
          r.bytes(marker.length);
      }
      return hasFlag !== xor;
    },
    validate: (value) => {
      if (value !== void 0 && typeof value !== "boolean")
        throw new Error(`flag: expected boolean value or undefined, got ${typeof value}`);
      return value;
    }
  });
};
function flagged(path2, inner, def2) {
  if (!isCoder(inner))
    throw new TypeError(`flagged: invalid inner value ${inner}`);
  return wrap({
    encodeStream: (w, value) => {
      {
        if (Path.resolve(w.stack, path2))
          inner.encodeStream(w, value);
      }
    },
    decodeStream: (r) => {
      let hasFlag = false;
      hasFlag = !!Path.resolve(r.stack, path2);
      if (hasFlag)
        return inner.decodeStream(r);
      return;
    }
  });
}
function magic(inner, constant, check = true) {
  if (!isCoder(inner))
    throw new TypeError(`magic: invalid inner value ${inner}`);
  if (typeof check !== "boolean")
    throw new TypeError(`magic: expected boolean, got ${typeof check}`);
  return wrap({
    size: inner.size,
    encodeStream: (w, _value) => inner.encodeStream(w, constant),
    decodeStream: (r) => {
      const value = inner.decodeStream(r);
      const valueObj = value !== null && typeof value === "object" && !isBytes$1(value);
      const canCompare = !valueObj || true;
      if (check && canCompare && !equal(value, constant)) {
        throw r.err(`magic: invalid value: ${value} !== ${constant}`);
      }
      return;
    },
    validate: (value) => {
      if (value !== void 0)
        throw new Error(`magic: wrong value=${typeof value}`);
      return value;
    }
  });
}
function sizeof(fields) {
  let size = 0;
  for (const f of fields) {
    if (f.size === void 0)
      return;
    if (!isNum(f.size))
      throw new Error(`sizeof: wrong element size=${f.size}`);
    size += f.size;
  }
  return size;
}
function struct(fields) {
  if (!isPlainObject(fields))
    throw new TypeError(`struct: expected plain object, got ${fields}`);
  const coders2 = [];
  for (const name in fields) {
    validateFieldName(name, "struct: field");
    if (!isCoder(fields[name]))
      throw new TypeError(`struct: field ${name} is not CoderType`);
    coders2.push(fields[name]);
  }
  return wrap({
    size: sizeof(coders2),
    encodeStream: (w, value) => {
      const _w = w;
      _w.pushObj(value, () => {
        for (const name in fields) {
          _w.enterField(name);
          fields[name].encodeStream(w, value[name]);
          _w.exitField();
        }
      });
    },
    decodeStream: (r) => {
      const res = {};
      const _r = r;
      _r.pushObj(res, () => {
        for (const name in fields) {
          _r.enterField(name);
          res[name] = fields[name].decodeStream(r);
          _r.exitField();
        }
      });
      return res;
    },
    validate: (value) => {
      if (typeof value !== "object" || value === null)
        throw new Error(`struct: invalid value ${value}`);
      return value;
    }
  });
}
function array(len, inner) {
  if (!isCoder(inner))
    throw new TypeError(`array: invalid inner value ${inner}`);
  const terminator = isBytes$1(len) ? Uint8Array.from(len) : void 0;
  const _length = lengthCoder(typeof len === "string" ? `../${len}` : terminator || len);
  if (len === null && inner.size === 0)
    throw new Error("array: null length cannot use zero-size inner");
  if ((isCoder(len) || typeof len === "string") && inner.size === 0)
    throw new Error("array: dynamic length cannot use zero-size inner");
  return wrap({
    // `size: 0` is a valid fixed-size hint and must compose through arrays/tuples/structs.
    size: typeof len === "number" && inner.size !== void 0 ? len * inner.size : void 0,
    encodeStream: (w, value) => {
      const _w = w;
      _w.pushObj(value, () => {
        if (!terminator)
          _length.encodeStream(w, value.length);
        for (let i = 0; i < value.length; i++) {
          _w.enterField(i);
          const elm = value[i];
          const startPos = _w.pos;
          inner.encodeStream(w, elm);
          if (terminator && terminator.length <= _w.pos - startPos) {
            const data = _w.finish(false).subarray(startPos, _w.pos);
            if (equalBytes$1(data.subarray(0, terminator.length), terminator))
              throw _w.err(`array: inner element encoding same as separator. elm=${elm} data=${data}`);
          }
          _w.exitField();
        }
      });
      if (terminator)
        w.bytes(terminator);
    },
    decodeStream: (r) => {
      const res = [];
      const _r = r;
      _r.pushObj(res, () => {
        if (len === null) {
          for (let i = 0; !r.isEnd(); i++) {
            _r.enterField(i);
            const progress = _r.progress();
            res.push(inner.decodeStream(r));
            if (_r.progress() === progress)
              throw r.err("array: inner decoder did not consume input");
            _r.exitField();
            if (inner.size && r.leftBytes < inner.size)
              break;
          }
        } else if (terminator) {
          for (let i = 0; ; i++) {
            if (equalBytes$1(r.bytes(terminator.length, true), terminator)) {
              r.bytes(terminator.length);
              break;
            }
            _r.enterField(i);
            const progress = _r.progress();
            res.push(inner.decodeStream(r));
            if (_r.progress() === progress)
              throw r.err("array: inner decoder did not consume input");
            _r.exitField();
          }
        } else {
          _r.enterField("arrayLen");
          const length = _length.decodeStream(r);
          _r.exitField();
          if (inner.size && length * inner.size > r.leftBytes)
            throw r.err(`array: length=${length} elements of size=${inner.size} exceed ${r.leftBytes} bytes left`);
          for (let i = 0; i < length; i++) {
            _r.enterField(i);
            res.push(inner.decodeStream(r));
            _r.exitField();
          }
        }
      });
      return res;
    },
    validate: (value) => {
      if (!Array.isArray(value))
        throw new Error(`array: invalid value ${value}`);
      return value;
    }
  });
}
function abigint(n, title = "value") {
  if (typeof n !== "bigint")
    throw new TypeError(`"${title}" expected bigint, got type=${typeof n}`);
  if (n < _0n$3)
    throw new RangeError(`"${title}" expected non-negative bigint, got ${n}`);
  return n;
}
function aarray(item, title, inner = () => {
}) {
  if (!Array.isArray(item))
    throw new TypeError(`"${title}" expected array, got type=${typeof item}`);
  for (let i = 0; i < item.length; i++)
    inner(item[i], `${title}[${i}]`);
  return item;
}
function astring(value, title = "") {
  if (typeof value !== "string") {
    const prefix2 = title && `"${title}" `;
    throw new TypeError(prefix2 + "expected string, got type=" + typeof value);
  }
  return value;
}
function validateObject(object, fields = {}, optFields = {}, _title = "object") {
  return validateObject$1(object, fields, optFields);
}
const Point = /* @__PURE__ */ (() => secp256k1.Point)();
const Fn = /* @__PURE__ */ (() => Point.Fn)();
const CURVE_ORDER = /* @__PURE__ */ (() => Point.Fn.ORDER)();
const _0n$3 = /* @__PURE__ */ BigInt(0), _2n$1 = /* @__PURE__ */ BigInt(2);
const hasEven = (y) => y % _2n$1 === _0n$3;
const isBytes = /* @__PURE__ */ (() => utils.isBytes)();
const concatBytes = /* @__PURE__ */ (() => utils.concatBytes)();
const equalBytes = /* @__PURE__ */ (() => utils.equalBytes)();
const sha256 = /* @__PURE__ */ (() => sha256$1)();
const hash160 = (msg) => ripemd160(sha256(msg));
const sha256x2 = (...msgs) => sha256(sha256(concatBytes(...msgs)));
const pubSchnorr = (priv) => schnorr.getPublicKey(priv);
const pubECDSA = (privateKey, isCompressed) => secp256k1.getPublicKey(privateKey, isCompressed);
const LOW_R_BOUND = /* @__PURE__ */ (() => CURVE_ORDER / _2n$1)();
const hasLowR = (sig) => sig.r < LOW_R_BOUND;
function signECDSA(hash, privateKey, lowR = false) {
  abytes(hash, 32, "hash");
  let sig = secp256k1.Signature.fromBytes(secp256k1.sign(hash, privateKey, { prehash: false }));
  if (lowR && !hasLowR(sig)) {
    const extraEntropy = new Uint8Array(32);
    let counter = 0;
    while (!hasLowR(sig)) {
      extraEntropy.set(U32LE.encode(counter++));
      sig = secp256k1.Signature.fromBytes(secp256k1.sign(hash, privateKey, { prehash: false, extraEntropy }));
      if (counter > 4294967295)
        throw new Error("lowR counter overflow: report the error");
    }
  }
  return sig.toBytes("der");
}
const signSchnorr = (message, secretKey, auxRand) => schnorr.sign(message, secretKey, auxRand);
const tagSchnorr = (tag, ...messages) => schnorr.utils.taggedHash(tag, ...messages);
const PubT = /* @__PURE__ */ (() => Object.freeze({
  ecdsa: 0,
  schnorr: 1
}))();
function validatePubkey(pub, type) {
  const len = pub.length;
  if (type === PubT.ecdsa) {
    if (len === 32)
      throw new RangeError("Expected non-Schnorr key");
    Point.fromBytes(pub);
    return pub;
  } else if (type === PubT.schnorr) {
    if (len !== 32)
      throw new RangeError("Expected 32-byte Schnorr key");
    schnorr.utils.lift_x(bytesToNumberBE(pub));
    return pub;
  } else {
    throw new TypeError("Unknown key type");
  }
}
function tapTweak(a, b) {
  const u = schnorr.utils;
  const t2 = u.taggedHash("TapTweak", a, b);
  const tn = bytesToNumberBE(t2);
  if (tn >= CURVE_ORDER)
    throw new Error("tweak higher than curve order");
  return tn;
}
function taprootTweakPrivKey(privKey, merkleRoot = Uint8Array.of()) {
  const u = schnorr.utils;
  abytes(privKey, 32, "privKey");
  const seckey0 = bytesToNumberBE(privKey);
  const P = Point.BASE.multiply(seckey0);
  const seckey = hasEven(P.y) ? seckey0 : Fn.neg(seckey0);
  const xP = u.pointToBytes(P);
  const t2 = tapTweak(xP, merkleRoot);
  return numberToBytesBE(Fn.add(seckey, t2), 32);
}
function taprootTweakPubkey(pubKey, h) {
  const u = schnorr.utils;
  abytes(pubKey, 32, "pubKey");
  const t2 = tapTweak(pubKey, h);
  const P = u.lift_x(bytesToNumberBE(pubKey));
  const Q = P.add(Point.BASE.multiply(t2));
  const parity = hasEven(Q.y) ? 0 : 1;
  return [u.pointToBytes(Q), parity];
}
const NETWORK = /* @__PURE__ */ Object.freeze({
  bech32: "bc",
  pubKeyHash: 0,
  scriptHash: 5,
  wif: 128
});
const TEST_NETWORK = /* @__PURE__ */ Object.freeze({
  bech32: "tb",
  pubKeyHash: 111,
  scriptHash: 196,
  wif: 239
});
function compareBytes(a, b) {
  if (!isBytes(a) || !isBytes(b))
    throw new TypeError(`cmp: wrong type a=${typeof a} b=${typeof b}`);
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++)
    if (a[i] != b[i])
      return Math.sign(a[i] - b[i]);
  return Math.sign(a.length - b.length);
}
function reverseObject(obj) {
  const res = /* @__PURE__ */ Object.create(null);
  for (const k in obj) {
    if (res[obj[k]] !== void 0)
      throw new Error("duplicate key");
    res[obj[k]] = k;
  }
  return res;
}
const _0n$2 = /* @__PURE__ */ BigInt(0), _1n$2 = /* @__PURE__ */ BigInt(1), _2n = /* @__PURE__ */ BigInt(2), _8n = /* @__PURE__ */ BigInt(8);
const U8_MAX = /* @__PURE__ */ BigInt(255);
const COMPACT_DIRECT_MAX = /* @__PURE__ */ BigInt(252);
const OP = /* @__PURE__ */ Object.freeze({
  OP_0: 0,
  PUSHDATA1: 76,
  PUSHDATA2: 77,
  PUSHDATA4: 78,
  "1NEGATE": 79,
  RESERVED: 80,
  OP_1: 81,
  OP_2: 82,
  OP_3: 83,
  OP_4: 84,
  OP_5: 85,
  OP_6: 86,
  OP_7: 87,
  OP_8: 88,
  OP_9: 89,
  OP_10: 90,
  OP_11: 91,
  OP_12: 92,
  OP_13: 93,
  OP_14: 94,
  OP_15: 95,
  OP_16: 96,
  // Control
  NOP: 97,
  VER: 98,
  IF: 99,
  NOTIF: 100,
  VERIF: 101,
  VERNOTIF: 102,
  ELSE: 103,
  ENDIF: 104,
  VERIFY: 105,
  RETURN: 106,
  // Stack
  TOALTSTACK: 107,
  FROMALTSTACK: 108,
  "2DROP": 109,
  "2DUP": 110,
  "3DUP": 111,
  "2OVER": 112,
  "2ROT": 113,
  "2SWAP": 114,
  IFDUP: 115,
  DEPTH: 116,
  DROP: 117,
  DUP: 118,
  NIP: 119,
  OVER: 120,
  PICK: 121,
  ROLL: 122,
  ROT: 123,
  SWAP: 124,
  TUCK: 125,
  // Splice
  CAT: 126,
  SUBSTR: 127,
  LEFT: 128,
  RIGHT: 129,
  SIZE: 130,
  // Boolean logic
  INVERT: 131,
  AND: 132,
  OR: 133,
  XOR: 134,
  EQUAL: 135,
  EQUALVERIFY: 136,
  RESERVED1: 137,
  RESERVED2: 138,
  // Numbers
  "1ADD": 139,
  "1SUB": 140,
  "2MUL": 141,
  "2DIV": 142,
  NEGATE: 143,
  ABS: 144,
  NOT: 145,
  "0NOTEQUAL": 146,
  ADD: 147,
  SUB: 148,
  MUL: 149,
  DIV: 150,
  MOD: 151,
  LSHIFT: 152,
  RSHIFT: 153,
  BOOLAND: 154,
  BOOLOR: 155,
  NUMEQUAL: 156,
  NUMEQUALVERIFY: 157,
  NUMNOTEQUAL: 158,
  LESSTHAN: 159,
  GREATERTHAN: 160,
  LESSTHANOREQUAL: 161,
  GREATERTHANOREQUAL: 162,
  MIN: 163,
  MAX: 164,
  WITHIN: 165,
  // Crypto
  RIPEMD160: 166,
  SHA1: 167,
  SHA256: 168,
  HASH160: 169,
  HASH256: 170,
  CODESEPARATOR: 171,
  CHECKSIG: 172,
  CHECKSIGVERIFY: 173,
  CHECKMULTISIG: 174,
  CHECKMULTISIGVERIFY: 175,
  // Expansion
  NOP1: 176,
  CHECKLOCKTIMEVERIFY: 177,
  CHECKSEQUENCEVERIFY: 178,
  NOP4: 179,
  NOP5: 180,
  NOP6: 181,
  NOP7: 182,
  NOP8: 183,
  NOP9: 184,
  NOP10: 185,
  // BIP 342
  CHECKSIGADD: 186,
  // Invalid
  INVALID: 255
});
const OPNames = /* @__PURE__ */ (() => Object.freeze(reverseObject(OP)))();
function ScriptNum(bytesLimit = 6, forceMinimal = false) {
  return wrap({
    encodeStream: (w, value) => {
      if (value === _0n$2)
        return;
      const neg = value < 0;
      const val = BigInt(value);
      const nums = [];
      for (let abs = neg ? -val : val; abs; abs >>= _8n)
        nums.push(Number(abs & U8_MAX));
      if (nums[nums.length - 1] >= 128)
        nums.push(neg ? 128 : 0);
      else if (neg)
        nums[nums.length - 1] |= 128;
      w.bytes(new Uint8Array(nums));
    },
    decodeStream: (r) => {
      const len = r.leftBytes;
      if (len > bytesLimit)
        throw new Error(`ScriptNum: number (${len}) bigger than limit=${bytesLimit}`);
      if (len === 0)
        return _0n$2;
      const data = r.bytes(len);
      if (forceMinimal) {
        if ((data[len - 1] & 127) === 0) {
          if (len <= 1 || (data[len - 2] & 128) === 0)
            throw new Error("Non-minimally encoded ScriptNum");
        }
      }
      let res = _0n$2;
      for (let i = 0; i < len; ++i)
        res |= BigInt(data[i]) << _8n * BigInt(i);
      if (data[len - 1] >= 128) {
        res &= _2n ** BigInt(len * 8) - _1n$2 >> _1n$2;
        res = -res;
      }
      return res;
    }
  });
}
function OpToNum(op, bytesLimit = 4, forceMinimal = true) {
  if (typeof op === "number")
    return op;
  if (isBytes(op)) {
    try {
      const val = ScriptNum(bytesLimit, forceMinimal).decode(op);
      if (val > Number.MAX_SAFE_INTEGER || val < -Number.MAX_SAFE_INTEGER)
        return;
      return Number(val);
    } catch (e) {
      return;
    }
  }
  return;
}
const scriptPushLen = (op, read) => {
  if (!(OP.OP_0 < op && op <= OP.PUSHDATA4))
    return;
  if (op < OP.PUSHDATA1)
    return op;
  if (op === OP.PUSHDATA1)
    return read(1);
  if (op === OP.PUSHDATA2)
    return read(2);
  if (op === OP.PUSHDATA4)
    return read(4);
  throw new Error("Should be not possible");
};
const Script = /* @__PURE__ */ (() => Object.freeze(wrap({
  encodeStream: (w, value) => {
    aarray(value, "value");
    for (let o of value) {
      if (typeof o === "string") {
        const op = OP[o];
        if (typeof op !== "number")
          throw new Error(`Unknown opcode=${o}`);
        w.byte(op);
        continue;
      } else if (typeof o === "number") {
        if (o === 0) {
          w.byte(0);
          continue;
        } else if (o === -1) {
          w.byte(OP["1NEGATE"]);
          continue;
        } else if (1 <= o && o <= 16) {
          w.byte(OP.OP_1 - 1 + o);
          continue;
        }
      }
      if (typeof o === "number")
        o = ScriptNum().encode(BigInt(o));
      abytes(o, void 0, "value");
      const len = o.length;
      if (len < OP.PUSHDATA1)
        w.byte(len);
      else if (len <= 255) {
        w.byte(OP.PUSHDATA1);
        w.byte(len);
      } else if (len <= 65535) {
        w.byte(OP.PUSHDATA2);
        w.bytes(U16LE.encode(len));
      } else {
        w.byte(OP.PUSHDATA4);
        w.bytes(U32LE.encode(len));
      }
      w.bytes(o);
    }
  },
  decodeStream: (r) => {
    const out = [];
    while (!r.isEnd()) {
      const cur = r.byte();
      const len = scriptPushLen(cur, (bytes) => {
        if (bytes === 1)
          return U8.decodeStream(r);
        if (bytes === 2)
          return U16LE.decodeStream(r);
        return U32LE.decodeStream(r);
      });
      if (len !== void 0) {
        out.push(r.bytes(len));
      } else if (cur === 0) {
        out.push(0);
      } else if (OP.OP_1 <= cur && cur <= OP.OP_16) {
        out.push(cur - (OP.OP_1 - 1));
      } else {
        const op = OPNames[cur];
        if (op === void 0)
          throw new Error(`Unknown opcode=${cur.toString(16)}`);
        out.push(op);
      }
    }
    return out;
  }
})))();
const CompactSize = /* @__PURE__ */ (() => {
  const limits = {
    253: [253, 2, BigInt(253), BigInt(65535)],
    254: [254, 4, BigInt(65536), BigInt(4294967295)],
    255: [255, 8, BigInt(4294967296), BigInt("0xffffffffffffffff")]
  };
  const limitsList = Object.values(limits);
  return Object.freeze(wrap({
    encodeStream: (w, value) => {
      if (typeof value === "number")
        value = BigInt(value);
      if (_0n$2 <= value && value <= COMPACT_DIRECT_MAX)
        return w.byte(Number(value));
      for (const [flag2, bytes, start, stop] of limitsList) {
        if (start > value || value > stop)
          continue;
        w.byte(flag2);
        for (let i = 0; i < bytes; i++)
          w.byte(Number(value >> _8n * BigInt(i) & U8_MAX));
        return;
      }
      throw w.err(`VarInt too big: ${value}`);
    },
    decodeStream: (r) => {
      const b0 = r.byte();
      if (b0 <= 252)
        return BigInt(b0);
      const [_, bytes, start] = limits[b0];
      let num2 = _0n$2;
      for (let i = 0; i < bytes; i++)
        num2 |= BigInt(r.byte()) << _8n * BigInt(i);
      if (num2 < start)
        throw r.err(`Wrong CompactSize(${8 * bytes})`);
      return num2;
    }
  }));
})();
const CompactSizeLen = /* @__PURE__ */ (() => Object.freeze(apply(CompactSize, coders.numberBigint)))();
const _VarBytes = /* @__PURE__ */ (() => Object.freeze(createBytes(CompactSize)))();
const VarBytes = _VarBytes;
const _RawWitness = /* @__PURE__ */ (() => Object.freeze(array(CompactSizeLen, _VarBytes)))();
const RawWitness = _RawWitness;
const BTCArray = (t2) => array(CompactSize, t2);
const RawInput = /* @__PURE__ */ (() => Object.freeze(struct({
  txid: createBytes(32, true),
  // hash(prev_tx),
  index: U32LE,
  // output number of previous tx
  finalScriptSig: _VarBytes,
  // btc merges input and output script, executes it. If ok = tx passes
  sequence: U32LE
  // ?
})))();
const RawOutput = /* @__PURE__ */ (() => Object.freeze(struct({ amount: U64LE, script: _VarBytes })))();
const _RawTx = /* @__PURE__ */ (() => struct({
  version: I32LE,
  segwitFlag: flag(new Uint8Array([0, 1])),
  inputs: BTCArray(RawInput),
  outputs: BTCArray(RawOutput),
  // BIP144 does not encode a witness-count field; one RawWitness entry is
  // implied for each txin and follows the same order as inputs.
  witnesses: flagged("segwitFlag", array("inputs/length", _RawWitness)),
  // < 500000000	Block number at which this transaction is unlocked
  // >= 500000000	UNIX timestamp at which this transaction is unlocked
  // Handled as part of PSBTv2
  lockTime: U32LE
}))();
function validateRawTx(tx) {
  if (tx.segwitFlag && tx.witnesses && tx.witnesses.every((w) => !w.length))
    throw new Error("Segwit flag with only empty witness fields");
  return tx;
}
const RawTx = /* @__PURE__ */ (() => Object.freeze(validate(_RawTx, validateRawTx)))();
const RawOldTx = /* @__PURE__ */ (() => Object.freeze(struct({
  version: I32LE,
  inputs: BTCArray(RawInput),
  outputs: BTCArray(RawOutput),
  lockTime: U32LE
})))();
const unknowns = (mode, name) => {
  if (mode === true)
    return "ignore";
  if (mode === false)
    return "strip";
  if (mode === "ignore" || mode === "strip" || mode === "strict")
    return mode;
  throw new Error(`PSBT: invalid ${name} policy=${mode}`);
};
const _0n$1 = /* @__PURE__ */ BigInt(0), _1n$1 = /* @__PURE__ */ BigInt(1);
const PubKeyECDSA = /* @__PURE__ */ (() => validate(createBytes(null), (pub) => validatePubkey(pub, PubT.ecdsa)))();
const PubKeyECDSACompressed = /* @__PURE__ */ (() => validate(createBytes(33), (pub) => validatePubkey(pub, PubT.ecdsa)))();
const PubKeySchnorr = /* @__PURE__ */ (() => validate(createBytes(32), (pub) => validatePubkey(pub, PubT.schnorr)))();
const SignatureSchnorr = /* @__PURE__ */ (() => validate(createBytes(null), (sig) => {
  if (sig.length !== 64 && sig.length !== 65)
    throw new Error("Schnorr signature should be 64 or 65 bytes long");
  return sig;
}))();
const RawWitnessWire = RawWitness;
const BIP32Der = /* @__PURE__ */ (() => struct({
  fingerprint: U32BE,
  path: array(null, U32LE)
}))();
const TaprootBIP32Der = /* @__PURE__ */ (() => struct({
  hashes: array(CompactSizeLen, createBytes(32)),
  der: BIP32Der
}))();
const GlobalXPUB = /* @__PURE__ */ (() => validate(struct({
  version: U32BE,
  depth: U8,
  parentFingerprint: U32BE,
  childNumber: U32BE,
  chainCode: createBytes(32),
  // BIP32 serialization stores the public key as the final 33-byte `ser_P(K)` field and says
  // importing an extended public key must verify that point data corresponds to the curve.
  publicKey: PubKeyECDSACompressed
}), (xpub) => {
  if (xpub.depth === 0 && xpub.parentFingerprint !== 0)
    throw new Error("GlobalXPUB: depth=0 requires parentFingerprint=0");
  if (xpub.depth === 0 && xpub.childNumber !== 0)
    throw new Error("GlobalXPUB: depth=0 requires childNumber=0");
  return xpub;
}))();
const tapScriptSigKey = /* @__PURE__ */ (() => struct({ pubKey: PubKeySchnorr, leafHash: createBytes(32) }))();
const _TaprootControlBlock = /* @__PURE__ */ (() => struct({
  version: U8,
  // With parity :(
  internalKey: createBytes(32),
  merklePath: array(null, createBytes(32))
}))();
const TaprootControlBlock = /* @__PURE__ */ (() => Object.freeze(validate(_TaprootControlBlock, (cb) => {
  if (cb.merklePath.length > 128)
    throw new Error("TaprootControlBlock: merklePath should be of length 0..128 (inclusive)");
  return cb;
})))();
const tapTree = /* @__PURE__ */ (() => validate(array(null, struct({
  depth: U8,
  version: U8,
  script: VarBytes
})), (tree) => {
  if (tree.length < 1)
    throw new Error("tapTree: expected at least one tuple");
  let path2 = Array(tree[0].depth).fill(0);
  let maxDepth = tree[0].depth;
  for (let i = 1; i < tree.length; i++) {
    const { depth } = tree[i];
    if (depth > maxDepth)
      maxDepth = depth;
    let j = path2.length - 1;
    while (j >= 0 && path2[j] === 1)
      j--;
    if (j < 0)
      throw new Error("tapTree: tuples must be in DFS order");
    const next = path2.slice(0, j);
    next.push(1);
    if (depth < next.length)
      throw new Error("tapTree: tuples must be in DFS order");
    while (next.length < depth)
      next.push(0);
    path2 = next;
  }
  let leaves = _0n$1;
  for (let i = 0; i < tree.length; i++)
    leaves += _1n$1 << BigInt(maxDepth - tree[i].depth);
  if (leaves !== _1n$1 << BigInt(maxDepth))
    throw new Error("tapTree: tuples must describe a complete binary tree");
  return tree;
}))();
const BytesInf = /* @__PURE__ */ createBytes(null);
const ProprietaryKey = /* @__PURE__ */ (() => {
  const suffix = struct({
    identifier: createBytes(CompactSizeLen),
    subtype: CompactSizeLen,
    data: BytesInf
  });
  return validate(BytesInf, (key) => {
    try {
      suffix.decode(key);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Proprietary key: expected BIP174 identifier and subtype, got ${message}`);
    }
    return key;
  });
})();
const Bytes20 = /* @__PURE__ */ createBytes(20);
const Bytes32 = /* @__PURE__ */ createBytes(32);
const Bytes64 = /* @__PURE__ */ createBytes(64);
const Bytes66 = /* @__PURE__ */ createBytes(66);
const MuSig2Participants = /* @__PURE__ */ (() => array(null, PubKeyECDSACompressed))();
const MuSig2Key = /* @__PURE__ */ (() => apply(BytesInf, {
  decode: (key) => {
    const _key = key;
    return concatBytes$3(PubKeyECDSACompressed.encode(_key.participantPubkey), PubKeyECDSACompressed.encode(_key.aggregatePubkey), _key.leafHash === void 0 ? EMPTY : Bytes32.encode(_key.leafHash));
  },
  encode: (raw) => {
    const _raw = raw;
    if (_raw.length !== 66 && _raw.length !== 98)
      throw new Error(`MuSig2 key: expected 66 or 98 bytes, got ${_raw.length}`);
    const key = {
      participantPubkey: PubKeyECDSACompressed.decode(_raw.subarray(0, 33)),
      aggregatePubkey: PubKeyECDSACompressed.decode(_raw.subarray(33, 66))
    };
    if (_raw.length === 98)
      key.leafHash = Bytes32.decode(_raw.subarray(66));
    return key;
  }
}))();
const SilentPaymentInfo = /* @__PURE__ */ (() => struct({ scanKey: PubKeyECDSACompressed, spendKey: PubKeyECDSACompressed }))();
const DNSSECProof = /* @__PURE__ */ (() => struct({ name: createBytes(U8), proof: BytesInf }))();
const PSBTInfo = (type, kc, vc, reqInc, allowInc, silentIgnore) => /* @__PURE__ */ Object.freeze([
  type,
  kc && typeof kc === "object" ? Object.freeze(kc) : kc,
  vc && typeof vc === "object" ? Object.freeze(vc) : vc,
  Object.freeze([...reqInc]),
  Object.freeze([...allowInc]),
  silentIgnore
]);
const PSBTGlobal = /* @__PURE__ */ (() => Object.freeze({
  unsignedTx: PSBTInfo(0, false, RawOldTx, [0], [0], false),
  // BIP174 also requires the serialized xpub depth to match the number of path elements in the
  // paired derivation value, so callers still need that cross-field check above this raw table.
  xpub: PSBTInfo(1, GlobalXPUB, BIP32Der, [], [0, 2], false),
  txVersion: PSBTInfo(2, false, U32LE, [2], [2], false),
  fallbackLocktime: PSBTInfo(3, false, U32LE, [], [2], false),
  inputCount: PSBTInfo(4, false, CompactSizeLen, [2], [2], false),
  outputCount: PSBTInfo(5, false, CompactSizeLen, [2], [2], false),
  // TODO: bitfield
  txModifiable: PSBTInfo(6, false, U8, [], [2], false),
  // These assigned extension fields must not fall through the unknown-field policy.
  spEcdhShare: PSBTInfo(7, PubKeyECDSACompressed, PubKeyECDSACompressed, [], [2], false),
  spDleq: PSBTInfo(8, PubKeyECDSACompressed, Bytes64, [], [2], false),
  genericSignedMessage: PSBTInfo(9, false, BytesInf, [], [0, 2], false),
  version: PSBTInfo(251, false, U32LE, [], [0, 2], false),
  proprietary: PSBTInfo(252, ProprietaryKey, BytesInf, [], [0, 2], false)
}))();
const PSBTInput = /* @__PURE__ */ (() => Object.freeze({
  nonWitnessUtxo: PSBTInfo(0, false, RawTx, [], [0, 2], false),
  witnessUtxo: PSBTInfo(1, false, RawOutput, [], [0, 2], false),
  partialSig: PSBTInfo(2, PubKeyECDSA, BytesInf, [], [0, 2], false),
  sighashType: PSBTInfo(3, false, U32LE, [], [0, 2], false),
  redeemScript: PSBTInfo(4, false, BytesInf, [], [0, 2], false),
  witnessScript: PSBTInfo(5, false, BytesInf, [], [0, 2], false),
  bip32Derivation: PSBTInfo(6, PubKeyECDSA, BIP32Der, [], [0, 2], false),
  finalScriptSig: PSBTInfo(7, false, BytesInf, [], [0, 2], false),
  finalScriptWitness: PSBTInfo(8, false, RawWitnessWire, [], [0, 2], false),
  porCommitment: PSBTInfo(9, false, BytesInf, [], [0, 2], false),
  ripemd160: PSBTInfo(10, Bytes20, BytesInf, [], [0, 2], false),
  sha256: PSBTInfo(11, Bytes32, BytesInf, [], [0, 2], false),
  hash160: PSBTInfo(12, Bytes20, BytesInf, [], [0, 2], false),
  hash256: PSBTInfo(13, Bytes32, BytesInf, [], [0, 2], false),
  // BIP174/BIP370 serialize PREVIOUS_TXID in standard byte order, while the rest of this repo
  // historically keeps TransactionInput.txid in display-order bytes matching `Transaction.id`.
  // Reverse at this PSBTv2 boundary so internal txid semantics stay aligned with the raw-tx path.
  txid: PSBTInfo(14, false, createBytes(32, true), [2], [2], true),
  index: PSBTInfo(15, false, U32LE, [2], [2], true),
  sequence: PSBTInfo(16, false, U32LE, [], [2], true),
  requiredTimeLocktime: PSBTInfo(17, false, U32LE, [], [2], false),
  requiredHeightLocktime: PSBTInfo(18, false, U32LE, [], [2], false),
  tapKeySig: PSBTInfo(19, false, SignatureSchnorr, [], [0, 2], false),
  tapScriptSig: PSBTInfo(20, tapScriptSigKey, SignatureSchnorr, [], [0, 2], false),
  tapLeafScript: PSBTInfo(21, TaprootControlBlock, BytesInf, [], [0, 2], false),
  // BIP371 key data here is a 32-byte x-only pubkey, so reuse the shared Schnorr pubkey coder
  // instead of accepting arbitrary 32-byte blobs that only fail much later in taproot flows.
  tapBip32Derivation: PSBTInfo(22, PubKeySchnorr, TaprootBIP32Der, [], [0, 2], false),
  tapInternalKey: PSBTInfo(23, false, PubKeySchnorr, [], [0, 2], false),
  tapMerkleRoot: PSBTInfo(24, false, Bytes32, [], [0, 2], false),
  p2cKeyTweak: PSBTInfo(25, PubKeyECDSACompressed, Bytes32, [], [0, 2], false),
  musig2ParticipantPubkeys: PSBTInfo(26, PubKeyECDSACompressed, MuSig2Participants, [], [0, 2], false),
  musig2PubNonce: PSBTInfo(27, MuSig2Key, Bytes66, [], [0, 2], false),
  musig2PartialSig: PSBTInfo(28, MuSig2Key, Bytes32, [], [0, 2], false),
  spEcdhShare: PSBTInfo(29, PubKeyECDSACompressed, PubKeyECDSACompressed, [], [2], false),
  spDleq: PSBTInfo(30, PubKeyECDSACompressed, Bytes64, [], [2], false),
  spSpendBip32Derivation: PSBTInfo(31, PubKeyECDSACompressed, BIP32Der, [], [2], false),
  spTweak: PSBTInfo(32, false, Bytes32, [], [2], false),
  proprietary: PSBTInfo(252, ProprietaryKey, BytesInf, [], [0, 2], false)
}))();
const PSBTInputFinalKeys = /* @__PURE__ */ Object.freeze([
  // PSBTv2 extractors rebuild the final transaction from per-input fields, so
  // finalized inputs still need txid/index, any non-default sequence, and locktime requirements
  // even though BIP174's generic cleanup is stricter.
  "txid",
  "sequence",
  "index",
  "witnessUtxo",
  "nonWitnessUtxo",
  "requiredTimeLocktime",
  "requiredHeightLocktime",
  "finalScriptSig",
  "finalScriptWitness",
  "unknown"
]);
const PSBTInputSignatureKeys = /* @__PURE__ */ Object.freeze([
  "partialSig",
  "finalScriptSig",
  "finalScriptWitness",
  "tapKeySig",
  "tapScriptSig"
]);
const PSBTOutput = /* @__PURE__ */ (() => Object.freeze({
  redeemScript: PSBTInfo(0, false, BytesInf, [], [0, 2], false),
  witnessScript: PSBTInfo(1, false, BytesInf, [], [0, 2], false),
  bip32Derivation: PSBTInfo(2, PubKeyECDSA, BIP32Der, [], [0, 2], false),
  // BIP174/BIP370 serialize PSBT_OUT_AMOUNT as a signed int64 on the wire; semantic output
  // validity still rejects negative transaction amounts in `PSBTOutputCoder` below.
  amount: PSBTInfo(3, false, I64LE, [2], [2], true),
  script: PSBTInfo(4, false, BytesInf, [2], [2], true),
  tapInternalKey: PSBTInfo(5, false, PubKeySchnorr, [], [0, 2], false),
  // BIP371 expects a non-empty DFS-ordered list of tapleaf tuples here so wallets can
  // reconstruct the same Taproot tree, not just an arbitrary list of serialized leaves.
  tapTree: PSBTInfo(6, false, tapTree, [], [0, 2], false),
  tapBip32Derivation: PSBTInfo(7, PubKeySchnorr, TaprootBIP32Der, [], [0, 2], false),
  musig2ParticipantPubkeys: PSBTInfo(8, PubKeyECDSACompressed, MuSig2Participants, [], [0, 2], false),
  spV0Info: PSBTInfo(9, false, SilentPaymentInfo, [], [2], false),
  spV0Label: PSBTInfo(10, false, U32LE, [], [2], false),
  dnssecProof: PSBTInfo(53, false, DNSSECProof, [], [0, 2], false),
  proprietary: PSBTInfo(252, ProprietaryKey, BytesInf, [], [0, 2], false)
}))();
const PSBTOutputUnsignedKeys = /* @__PURE__ */ Object.freeze([]);
const PSBTKeyPair = /* @__PURE__ */ (() => array(NULL, struct({
  //  <key> := <keylen> <keytype> <keydata> WHERE keylen = len(keytype)+len(keydata)
  key: prefix(CompactSizeLen, struct({ type: CompactSizeLen, key: createBytes(null) })),
  //  <value> := <valuelen> <valuedata>
  value: createBytes(CompactSizeLen)
})))();
function PSBTKeyInfo(info) {
  const [type, kc, vc, reqInc, allowInc, silentIgnore] = info;
  return { type, kc, vc, reqInc, allowInc, silentIgnore };
}
const PSBTUnknownKey = /* @__PURE__ */ (() => (
  // Raw unknown/proprietary field key: compact-size keytype plus opaque keydata for pass-through.
  struct({ type: CompactSizeLen, key: createBytes(null) })
))();
function PSBTKeyMap(psbtEnum) {
  const byType = {};
  for (const k in psbtEnum) {
    const [num2, kc, vc] = psbtEnum[k];
    byType[num2] = [k, kc, vc];
  }
  return wrap({
    encodeStream: (w, value) => {
      const _value = value;
      let out = [];
      const seen = {};
      const add2 = (key, value2) => {
        const _value2 = value2;
        const kStr = hex.encode(PSBTUnknownKey.encode(key));
        if (seen[kStr])
          throw new Error(`PSBT: duplicate key=${kStr}`);
        seen[kStr] = true;
        out.push({ key, value: _value2 });
      };
      for (const name in psbtEnum) {
        const val = _value[name];
        if (val === void 0)
          continue;
        const [type, kc, vc] = psbtEnum[name];
        if (!kc) {
          add2({ type, key: EMPTY }, vc.encode(val));
        } else {
          const kv = val.map(([k, v]) => [
            kc.encode(k),
            vc.encode(v)
          ]);
          kv.sort((a, b) => compareBytes(a[0], b[0]));
          for (const [key, value2] of kv)
            add2({ key, type }, value2);
        }
      }
      if (_value.unknown) {
        _value.unknown.sort((a, b) => compareBytes(a[0].key, b[0].key));
        for (const [k, v] of _value.unknown)
          add2(k, v);
      }
      PSBTKeyPair.encodeStream(w, out);
    },
    decodeStream: (r) => {
      const raw = PSBTKeyPair.decodeStream(r);
      const out = {};
      const noKey = {};
      const seen = {};
      for (const elm of raw) {
        const kStr = hex.encode(PSBTUnknownKey.encode(elm.key));
        if (seen[kStr])
          throw new Error(`PSBT: duplicate key=${kStr}`);
        seen[kStr] = true;
        let name = "unknown";
        let key = elm.key.key;
        let value = elm.value;
        if (byType[elm.key.type]) {
          const [_name, kc, vc] = byType[elm.key.type];
          name = _name;
          if (!kc && key.length) {
            throw new Error(`PSBT: Non-empty key for ${name} (key=${hex.encode(key)} value=${hex.encode(value)}`);
          }
          key = kc ? kc.decode(key) : void 0;
          value = vc.decode(value);
          if (!kc) {
            if (out[name])
              throw new Error(`PSBT: Same keys: ${name} (key=${key} value=${value})`);
            out[name] = value;
            noKey[name] = true;
            continue;
          }
        } else {
          key = { type: elm.key.type, key: elm.key.key };
        }
        if (noKey[name])
          throw new Error(`PSBT: Key type with empty key and no key=${name} val=${value}`);
        if (!out[name])
          out[name] = [];
        out[name].push([key, value]);
      }
      return out;
    }
  });
}
const PSBTInputCoder = /* @__PURE__ */ (() => Object.freeze(validate(PSBTKeyMap(PSBTInput), (i) => {
  if (i.finalScriptWitness && !i.finalScriptWitness.length)
    throw new Error("validateInput: empty finalScriptWitness");
  if (i.partialSig && !i.partialSig.length)
    throw new Error("Empty partialSig");
  if (i.partialSig)
    for (const [k] of i.partialSig)
      validatePubkey(k, PubT.ecdsa);
  if (i.bip32Derivation)
    for (const [k] of i.bip32Derivation)
      validatePubkey(k, PubT.ecdsa);
  if (i.requiredTimeLocktime !== void 0 && i.requiredTimeLocktime < 5e8)
    throw new Error(`validateInput: wrong timeLocktime=${i.requiredTimeLocktime}`);
  if (i.requiredHeightLocktime !== void 0 && (i.requiredHeightLocktime <= 0 || i.requiredHeightLocktime >= 5e8))
    throw new Error(`validateInput: wrong heighLocktime=${i.requiredHeightLocktime}`);
  if (i.tapLeafScript) {
    for (const [k, v] of i.tapLeafScript) {
      if ((k.version & 254) !== v[v.length - 1])
        throw new Error("validateInput: tapLeafScript version mimatch");
      if (v[v.length - 1] & 1)
        throw new Error("validateInput: tapLeafScript version has parity bit!");
    }
  }
  return i;
})))();
const PSBTOutputCoder = /* @__PURE__ */ (() => Object.freeze(validate(PSBTKeyMap(PSBTOutput), (o) => {
  if (o.amount !== void 0 && o.amount < _0n$1)
    throw new Error(`validateOutput: wrong amount=${o.amount}`);
  if (o.bip32Derivation)
    for (const [k] of o.bip32Derivation)
      validatePubkey(k, PubT.ecdsa);
  return o;
})))();
const PSBTGlobalCoder = /* @__PURE__ */ (() => validate(PSBTKeyMap(PSBTGlobal), (g) => {
  const version = g.version || 0;
  if (version === 0) {
    if (!g.unsignedTx)
      throw new Error("PSBTv0: missing unsignedTx");
    for (const inp of g.unsignedTx.inputs)
      if (inp.finalScriptSig && inp.finalScriptSig.length)
        throw new Error("PSBTv0: input scriptSig found in unsignedTx");
  }
  for (const [xpub, der] of g.xpub || []) {
    if (xpub.depth !== der.path.length)
      throw new Error(`PSBT_GLOBAL_XPUB: xpub depth=${xpub.depth} must match derivation path length=${der.path.length}`);
  }
  return g;
}))();
const _RawPSBTV0 = /* @__PURE__ */ (() => Object.freeze(struct({
  magic: magic(string(new Uint8Array([255])), "psbt"),
  global: PSBTGlobalCoder,
  // Raw v0 framing follows the unsigned transaction for input-map count; the stricter
  // one-map-per-input/output reconciliation happens in `RawPSBTV0` / `validatePSBT`.
  inputs: array("global/unsignedTx/inputs/length", PSBTInputCoder),
  outputs: array(null, PSBTOutputCoder)
})))();
const _RawPSBTV2 = /* @__PURE__ */ (() => Object.freeze(struct({
  magic: magic(string(new Uint8Array([255])), "psbt"),
  global: PSBTGlobalCoder,
  // Raw v2 framing takes map counts from the global PSBTv2 count fields; deeper version
  // and per-field validation still happens in `RawPSBTV2` / `validatePSBT`.
  inputs: array("global/inputCount", PSBTInputCoder),
  outputs: array("global/outputCount", PSBTOutputCoder)
})))();
function validatePSBTFields(version, info, lst) {
  const _lst = lst;
  for (const k in _lst) {
    if (k === "unknown")
      continue;
    if (!info[k])
      continue;
    const { allowInc } = PSBTKeyInfo(info[k]);
    if (!allowInc.includes(version))
      throw new Error(`PSBTv${version}: field ${k} is not allowed`);
  }
  for (const k in info) {
    const { reqInc } = PSBTKeyInfo(info[k]);
    if (reqInc.includes(version) && _lst[k] === void 0)
      throw new Error(`PSBTv${version}: missing required field ${k}`);
  }
}
function cleanPSBTFields(version, info, lst) {
  anumber$1(version, "version");
  validateObject(info, {}, {}, "info");
  validateObject(lst, {}, {}, "lst");
  const _lst = lst;
  const out = {};
  for (const _k in _lst) {
    const k = _k;
    if (k !== "unknown") {
      if (!info[k])
        continue;
      const { allowInc, silentIgnore } = PSBTKeyInfo(info[k]);
      if (!allowInc.includes(version)) {
        if (silentIgnore)
          continue;
        throw new Error(`Failed to serialize in PSBTv${version}: ${k} but versions allows inclusion=${allowInc}`);
      }
    }
    out[k] = _lst[k];
  }
  return out;
}
function validatePSBT(tx) {
  const version = tx && tx.global && tx.global.version || 0;
  validatePSBTFields(version, PSBTGlobal, tx.global);
  for (const i of tx.inputs)
    validatePSBTFields(version, PSBTInput, i);
  for (const o of tx.outputs)
    validatePSBTFields(version, PSBTOutput, o);
  const inputCount = !version ? tx.global.unsignedTx.inputs.length : tx.global.inputCount;
  if (tx.inputs.length !== inputCount)
    throw new Error(`Wrong number of input maps=${tx.inputs.length}, expected=${inputCount}`);
  const outputCount = !version ? tx.global.unsignedTx.outputs.length : tx.global.outputCount;
  if (tx.outputs.length < outputCount)
    throw new Error("Not outputs inputs");
  const hasBip174InputMap = version === 0 && inputCount === 0 && Object.keys(tx.outputs[0] || {}).length === 0 && (outputCount > 0 && tx.outputs.length === outputCount + 1 || outputCount === 0 && tx.outputs.length === 2 && Object.keys(tx.outputs[1]).length === 0);
  if (hasBip174InputMap)
    return tx;
  const outputsLeft = tx.outputs.slice(outputCount);
  if (outputsLeft.length > 1 || outputsLeft.length && (version !== 0 || Object.keys(outputsLeft[0]).length))
    throw new Error(`Unexpected outputs left in tx=${outputsLeft}`);
  return tx;
}
function mergeKeyMap(psbtEnum, val, cur, allowedFields, unknown = "strip", proprietary = "strip") {
  var _a, _b;
  validateObject(psbtEnum, {}, {}, "psbtEnum");
  validateObject(val, {}, {}, "val");
  if (cur !== void 0)
    validateObject(cur, {}, {}, "cur");
  if (allowedFields !== void 0)
    aarray(allowedFields, "allowedFields");
  const _val = val;
  const _cur = cur;
  const _allowedFields = allowedFields;
  const unknownMode = unknowns(unknown, "unknown");
  const proprietaryMode = unknowns(proprietary, "proprietary");
  for (const [name, mode] of [
    ["unknown", unknownMode],
    ["proprietary", proprietaryMode]
  ]) {
    if (mode !== "strict")
      continue;
    if (((_a = _val[name]) == null ? void 0 : _a.length) || ((_b = _cur == null ? void 0 : _cur[name]) == null ? void 0 : _b.length))
      throw new Error(`PSBT: ${name} PSBT field is not allowed in strict mode`);
  }
  const res = { ..._cur, ..._val };
  for (const k in psbtEnum) {
    const key = k;
    if (k === "proprietary" && proprietaryMode !== "ignore")
      continue;
    const [_, kC, vC] = psbtEnum[key];
    const cannotChange = _allowedFields && !_allowedFields.includes(k);
    if (_val[k] === void 0 && k in _val) {
      if (cannotChange)
        throw new Error(`Cannot remove signed field=${k}`);
      delete res[k];
    } else if (kC) {
      const oldKV = _cur && _cur[k] ? _cur[k] : [];
      let newKV = _val[key];
      if (newKV) {
        if (!Array.isArray(newKV))
          throw new Error(`keyMap(${k}): KV pairs should be [k, v][]`);
        newKV = newKV.map((val2) => {
          if (val2.length !== 2)
            throw new Error(`keyMap(${k}): KV pairs should be [k, v][]`);
          return [
            typeof val2[0] === "string" ? kC.decode(hex.decode(val2[0])) : val2[0],
            typeof val2[1] === "string" ? vC.decode(hex.decode(val2[1])) : val2[1]
          ];
        });
        const map = {};
        const add2 = (kStr, k2, v) => {
          if (map[kStr] === void 0) {
            map[kStr] = [k2, v];
            return;
          }
          const oldVal = hex.encode(vC.encode(map[kStr][1]));
          const newVal = hex.encode(vC.encode(v));
          if (oldVal !== newVal)
            throw new Error(`keyMap(${key}): same key=${kStr} oldVal=${oldVal} newVal=${newVal}`);
        };
        for (const [k2, v] of oldKV) {
          const kStr = hex.encode(kC.encode(k2));
          add2(kStr, k2, v);
        }
        for (const [k2, v] of newKV) {
          const kStr = hex.encode(kC.encode(k2));
          if (v === void 0) {
            if (cannotChange)
              throw new Error(`Cannot remove signed field=${key}/${k2}`);
            delete map[kStr];
          } else {
            if (cannotChange && map[kStr] === void 0)
              throw new Error(`Cannot add signed field=${key}/${kStr}`);
            add2(kStr, k2, v);
          }
        }
        res[key] = Object.values(map);
      }
    } else {
      if (typeof res[k] === "string")
        res[k] = vC.decode(hex.decode(res[k]));
      if (cannotChange && k in _val) {
        if (!_cur || _cur[k] === void 0)
          throw new Error(`Cannot add signed field=${k}`);
        let current = _cur[k];
        if (typeof current === "string")
          current = vC.decode(hex.decode(current));
        if (!equalBytes(vC.encode(res[k]), vC.encode(current)))
          throw new Error(`Cannot change signed field=${k}`);
      }
    }
  }
  if (unknownMode === "ignore" && _val.unknown) {
    const map = {};
    for (const [k, v] of (_cur == null ? void 0 : _cur.unknown) || [])
      map[hex.encode(PSBTUnknownKey.encode(k))] = [k, v];
    for (const [k, v] of _val.unknown) {
      const kStr = hex.encode(PSBTUnknownKey.encode(k));
      if (map[kStr] === void 0) {
        map[kStr] = [k, v];
        continue;
      }
      const oldVal = hex.encode(BytesInf.encode(map[kStr][1]));
      const newVal = hex.encode(BytesInf.encode(v));
      if (oldVal !== newVal)
        throw new Error(`keyMap(unknown): same key=${kStr} oldVal=${oldVal} newVal=${newVal}`);
    }
    res.unknown = Object.values(map);
  }
  for (const k in res) {
    if (!psbtEnum[k]) {
      if (unknownMode === "ignore" && k === "unknown")
        continue;
      delete res[k];
    }
  }
  if (unknownMode !== "ignore")
    delete res.unknown;
  if (proprietaryMode !== "ignore")
    delete res.proprietary;
  return res;
}
function combineKeyMap(psbtEnum, current, other, unknown = "strip", proprietary = "strip") {
  validateObject(psbtEnum, {}, {}, "psbtEnum");
  validateObject(current, {}, {}, "current");
  validateObject(other, {}, {}, "other");
  const _current = current;
  const _other = other;
  for (const k in psbtEnum) {
    const key = k;
    const [_, keyCoder, valueCoder] = psbtEnum[key];
    if (keyCoder || _current[key] === void 0 || _other[key] === void 0)
      continue;
    let a = _current[key];
    let b = _other[key];
    if (typeof a === "string")
      a = valueCoder.decode(hex.decode(a));
    if (typeof b === "string")
      b = valueCoder.decode(hex.decode(b));
    if (!equalBytes(valueCoder.encode(a), valueCoder.encode(b)))
      throw new Error(`Cannot combine conflicting field=${k}`);
  }
  return mergeKeyMap(psbtEnum, _other, _current, void 0, unknown, proprietary);
}
const RawPSBTV0 = /* @__PURE__ */ (() => Object.freeze(validate(_RawPSBTV0, validatePSBT)))();
const RawPSBTV2 = /* @__PURE__ */ (() => Object.freeze(validate(_RawPSBTV2, validatePSBT)))();
const P2A_PROGRAM = /* @__PURE__ */ Uint8Array.from([78, 115]);
const OutP2A = {
  encode(from) {
    if (from.length !== 2 || from[0] !== 1 || !isBytes(from[1]) || !equalBytes(from[1], P2A_PROGRAM))
      return;
    return { type: "p2a", script: Script.encode(from) };
  },
  decode: (to) => {
    if (to.type !== "p2a")
      return;
    return [1, Uint8Array.from(P2A_PROGRAM)];
  }
};
function isValidPubkey(pub, type) {
  try {
    validatePubkey(pub, type);
    return true;
  } catch (e) {
    return false;
  }
}
const OutPK = {
  encode(from) {
    if (from.length !== 2 || !isBytes(from[0]) || !isValidPubkey(from[0], PubT.ecdsa) || from[1] !== "CHECKSIG")
      return;
    return { type: "pk", pubkey: from[0] };
  },
  decode: (to) => {
    if (to.type !== "pk")
      return;
    return [to.pubkey, "CHECKSIG"];
  }
};
const OutPKH = {
  encode(from) {
    if (from.length !== 5 || from[0] !== "DUP" || from[1] !== "HASH160" || !isBytes(from[2]))
      return;
    if (from[2].length !== 20)
      return;
    if (from[3] !== "EQUALVERIFY" || from[4] !== "CHECKSIG")
      return;
    return { type: "pkh", hash: from[2] };
  },
  // OutScript validates `pkh.hash` before this branch emits the canonical
  // `DUP HASH160 <hash> EQUALVERIFY CHECKSIG` script.
  decode: (to) => to.type === "pkh" ? ["DUP", "HASH160", to.hash, "EQUALVERIFY", "CHECKSIG"] : void 0
};
const OutSH = {
  encode(from) {
    if (from.length !== 3 || from[0] !== "HASH160" || !isBytes(from[1]) || from[2] !== "EQUAL")
      return;
    if (from[1].length !== 20)
      return;
    return { type: "sh", hash: from[1] };
  },
  // OutScript validates `sh.hash` before this branch emits the canonical
  // `HASH160 <hash> EQUAL` script.
  decode: (to) => to.type === "sh" ? ["HASH160", to.hash, "EQUAL"] : void 0
};
const OutWSH = {
  encode(from) {
    if (from.length !== 2 || from[0] !== 0 || !isBytes(from[1]))
      return;
    if (from[1].length !== 32)
      return;
    return { type: "wsh", hash: from[1] };
  },
  // OutScript validates `wsh.hash` before this branch emits the canonical
  // version-0 32-byte witness program.
  decode: (to) => to.type === "wsh" ? [0, to.hash] : void 0
};
const OutWPKH = {
  encode(from) {
    if (from.length !== 2 || from[0] !== 0 || !isBytes(from[1]))
      return;
    if (from[1].length !== 20)
      return;
    return { type: "wpkh", hash: from[1] };
  },
  // OutScript validates `wpkh.hash` before this branch emits the canonical
  // version-0 20-byte witness program.
  decode: (to) => to.type === "wpkh" ? [0, to.hash] : void 0
};
const OutMS = {
  encode(from) {
    const last = from.length - 1;
    if (from[last] !== "CHECKMULTISIG")
      return;
    const m = from[0];
    const n = from[last - 1];
    if (typeof m !== "number" || typeof n !== "number")
      return;
    const pubkeys = from.slice(1, -2);
    if (n !== pubkeys.length)
      return;
    for (const pub of pubkeys)
      if (!isBytes(pub) || !isValidPubkey(pub, PubT.ecdsa))
        return;
    if (!Number.isSafeInteger(m) || m < 1 || m > n)
      return;
    return { type: "ms", m, pubkeys };
  },
  // checkmultisig(n, ..pubkeys, m)
  decode: (to) => (
    // OutScript validates multisig pubkeys and `0 < m <= n <= 16`.
    // This branch only emits the canonical `m <pubkeys...> n CHECKMULTISIG`
    // script.
    to.type === "ms" ? [to.m, ...to.pubkeys, to.pubkeys.length, "CHECKMULTISIG"] : void 0
  )
};
const OutTR = {
  encode(from) {
    if (from.length !== 2 || from[0] !== 1 || !isBytes(from[1]) || from[1].length !== 32)
      return;
    if (!isValidPubkey(from[1], PubT.schnorr))
      return;
    return { type: "tr", pubkey: from[1] };
  },
  // OutScript validates `tr.pubkey` before this branch emits the canonical
  // version-1 32-byte witness program.
  decode: (to) => to.type === "tr" ? [1, to.pubkey] : void 0
};
const OutTRNS = {
  encode(from) {
    const last = from.length - 1;
    if (from[last] !== "CHECKSIG")
      return;
    const pubkeys = [];
    for (let i = 0; i < last; i++) {
      const elm = from[i];
      if (i & 1) {
        if (elm !== "CHECKSIGVERIFY" || i === last - 1)
          return;
        continue;
      }
      if (!isBytes(elm) || !isValidPubkey(elm, PubT.schnorr))
        return;
      pubkeys.push(elm);
    }
    if (!pubkeys.length || pubkeys.length > 999)
      return;
    return { type: "tr_ns", pubkeys };
  },
  decode: (to) => {
    if (to.type !== "tr_ns")
      return;
    const out = [];
    for (let i = 0; i < to.pubkeys.length - 1; i++)
      out.push(to.pubkeys[i], "CHECKSIGVERIFY");
    out.push(to.pubkeys[to.pubkeys.length - 1], "CHECKSIG");
    return out;
  }
};
const OutTRMS = {
  encode(from) {
    const last = from.length - 1;
    if (from[last] !== "NUMEQUAL" || from[1] !== "CHECKSIG")
      return;
    const pubkeys = [];
    const m = OpToNum(from[last - 1]);
    if (typeof m !== "number")
      return;
    for (let i = 0; i < last - 1; i++) {
      const elm = from[i];
      if (i & 1) {
        if (elm !== (i === 1 ? "CHECKSIG" : "CHECKSIGADD"))
          return;
        continue;
      }
      if (!isBytes(elm) || !isValidPubkey(elm, PubT.schnorr))
        return;
      pubkeys.push(elm);
    }
    if (!Number.isSafeInteger(m) || m < 1 || m > pubkeys.length || pubkeys.length > 999)
      return;
    return { type: "tr_ms", pubkeys, m };
  },
  decode: (to) => {
    if (to.type !== "tr_ms")
      return;
    const out = [to.pubkeys[0], "CHECKSIG"];
    for (let i = 1; i < to.pubkeys.length; i++)
      out.push(to.pubkeys[i], "CHECKSIGADD");
    out.push(to.m, "NUMEQUAL");
    return out;
  }
};
const OutUnknown = {
  encode(from) {
    return { type: "unknown", script: Script.encode(from) };
  },
  decode: (to) => (
    // This reparses `unknown.script` through the semantic Script codec, so raw
    // bytes must still be syntactically parseable and may canonicalize on re-encode.
    to.type === "unknown" ? Script.decode(to.script) : void 0
  )
};
const OutScripts = /* @__PURE__ */ (() => [
  // Order is semantic: specific structured coders run first and the catch-all
  // unknown fallback must stay last.
  OutP2A,
  OutPK,
  OutPKH,
  OutSH,
  OutWSH,
  OutWPKH,
  OutMS,
  OutTR,
  OutTRNS,
  OutTRMS,
  OutUnknown
])();
const _OutScript = /* @__PURE__ */ (() => apply(Script, coders.match(OutScripts)))();
const OutScript = /* @__PURE__ */ (() => Object.freeze(validate(_OutScript, (i) => {
  if (i.type === "pk" && !isValidPubkey(i.pubkey, PubT.ecdsa))
    throw new Error("OutScript/pk: wrong key");
  if ((i.type === "pkh" || i.type === "sh" || i.type === "wpkh") && (!isBytes(i.hash) || i.hash.length !== 20))
    throw new Error(`OutScript/${i.type}: wrong hash`);
  if (i.type === "wsh" && (!isBytes(i.hash) || i.hash.length !== 32))
    throw new Error(`OutScript/wsh: wrong hash`);
  if (i.type === "tr" && (!isBytes(i.pubkey) || !isValidPubkey(i.pubkey, PubT.schnorr)))
    throw new Error("OutScript/tr: wrong taproot public key");
  if (i.type === "ms" || i.type === "tr_ns" || i.type === "tr_ms") {
    if (!Array.isArray(i.pubkeys))
      throw new Error("OutScript/multisig: wrong pubkeys array");
  }
  if (i.type === "ms") {
    const n = i.pubkeys.length;
    for (const p of i.pubkeys)
      if (!isValidPubkey(p, PubT.ecdsa))
        throw new Error("OutScript/multisig: wrong pubkey");
    anumber$1(i.m, "m");
    if (i.m <= 0 || n > 16 || i.m > n)
      throw new Error("OutScript/multisig: invalid params");
  }
  if (i.type === "tr_ns" || i.type === "tr_ms") {
    const n = i.pubkeys.length;
    if (n > 999)
      throw new Error(`OutScript/${i.type}: invalid params`);
    for (const p of i.pubkeys)
      if (!isValidPubkey(p, PubT.schnorr))
        throw new Error(`OutScript/${i.type}: wrong pubkey`);
  }
  if (i.type === "tr_ms") {
    const n = i.pubkeys.length;
    anumber$1(i.m, "m");
    if (i.m <= 0 || i.m > n)
      throw new Error("OutScript/tr_ms: invalid params");
  }
  return i;
})))();
const _WitnessOutScript = /* @__PURE__ */ (() => Object.freeze(wrap({
  encodeStream: (w, value) => OutScript.encodeStream(w, value),
  decodeStream: (r) => {
    const raw = r.bytes(r.leftBytes);
    const out = OutScript.decode(raw);
    if (out && (out.type === "p2a" || out.type === "wpkh" || out.type === "wsh" || out.type === "tr") && !equalBytes(raw, OutScript.encode(out)))
      throw new Error("OutScript: non-canonical witness program");
    return out;
  }
})))();
function checkWSH(s, witnessScript) {
  if (!equalBytes(s.hash, sha256(witnessScript)))
    throw new Error("checkScript: wsh wrong witnessScript hash");
  const w = OutScript.decode(witnessScript);
  if (w.type === "tr" || w.type === "tr_ns" || w.type === "tr_ms")
    throw new Error(`checkScript: P2${w.type} cannot be wrapped in P2SH`);
  if (w.type === "wpkh" || w.type === "wsh" || w.type === "sh")
    throw new Error(`checkScript: P2${w.type} cannot be wrapped in P2WSH`);
}
function checkScript(script, redeemScript, witnessScript) {
  let hasWsh = false;
  let r = void 0;
  if (script) {
    const s = _WitnessOutScript.decode(script);
    if (s.type === "tr_ns" || s.type === "tr_ms" || s.type === "ms" || s.type == "pk")
      throw new Error(`checkScript: non-wrapped ${s.type}`);
    if (redeemScript) {
      if (s.type !== "sh")
        throw new Error("checkScript: redeemScript without P2SH");
      if (!equalBytes(s.hash, hash160(redeemScript)))
        throw new Error("checkScript: sh wrong redeemScript hash");
      r = _WitnessOutScript.decode(redeemScript);
      if ((r == null ? void 0 : r.type) === "tr" || (r == null ? void 0 : r.type) === "tr_ns" || (r == null ? void 0 : r.type) === "tr_ms")
        throw new Error(`checkScript: P2${r.type} cannot be wrapped in P2SH`);
      if ((r == null ? void 0 : r.type) === "sh")
        throw new Error("checkScript: P2SH cannot be wrapped in P2SH");
    }
    if (s.type === "wsh") {
      hasWsh = true;
      if (witnessScript)
        checkWSH(s, witnessScript);
    }
  }
  if (redeemScript) {
    if (r === void 0)
      r = _WitnessOutScript.decode(redeemScript);
    if ((r == null ? void 0 : r.type) === "wsh") {
      hasWsh = true;
      if (witnessScript)
        checkWSH(r, witnessScript);
    }
  }
  if (witnessScript && !hasWsh)
    throw new Error("checkScript: witnessScript without P2WSH");
}
const p2wpkh = (publicKey, network = NETWORK) => {
  if (!isValidPubkey(publicKey, PubT.ecdsa))
    throw new Error("P2WPKH: invalid publicKey");
  if (publicKey.length === 65)
    throw new Error("P2WPKH: uncompressed public key");
  const hash = hash160(publicKey);
  return {
    type: "wpkh",
    script: OutScript.encode({ type: "wpkh", hash }),
    address: Address(network).encode({ type: "wpkh", hash }),
    hash
  };
};
const TAP_LEAF_VERSION = 192;
const tapLeafVersion = (version) => {
  if (version === void 0)
    return TAP_LEAF_VERSION;
  anumber$1(version, "leafVersion");
  if (version > 254 || version === 80 || !!(version & 1))
    throw new Error(`P2TR: invalid leafVersion=${version}`);
  return version;
};
const tapLeafHash = (script, version = TAP_LEAF_VERSION) => tagSchnorr("TapLeaf", new Uint8Array([tapLeafVersion(version)]), VarBytes.encode(script));
const base58check = /* @__PURE__ */ createBase58check(sha256);
function validateWitness(version, data) {
  if (data.length < 2 || data.length > 40)
    throw new Error("Witness: invalid length");
  if (version > 16)
    throw new Error("Witness: invalid version");
  if (version === 0 && !(data.length === 20 || data.length === 32))
    throw new Error("Witness: invalid length for version");
}
function programToWitness(version, data, network = NETWORK) {
  validateWitness(version, data);
  const coder = version === 0 ? bech32 : bech32m;
  return coder.encode(network.bech32, [version].concat(coder.toWords(data)));
}
function formatKey(hashed, prefix2) {
  return base58check.encode(concatBytes(Uint8Array.from(prefix2), hashed));
}
function Address(network = NETWORK) {
  validateObject(network, {}, {}, "network");
  return {
    encode(from) {
      validateObject(from, {}, {}, "from");
      const { type } = from;
      astring(type, "from.type");
      if (type === "wpkh")
        return programToWitness(0, from.hash, network);
      else if (type === "wsh")
        return programToWitness(0, from.hash, network);
      else if (type === "tr")
        return programToWitness(1, from.pubkey, network);
      else if (type === "p2a")
        return programToWitness(1, P2A_PROGRAM, network);
      else if (type === "pkh")
        return formatKey(from.hash, [network.pubKeyHash]);
      else if (type === "sh")
        return formatKey(from.hash, [network.scriptHash]);
      throw new Error(`Unknown address type=${type}`);
    },
    decode(address) {
      astring(address, "address");
      if (address.length < 14 || address.length > 74)
        throw new Error("Invalid address length");
      if (network.bech32 && address.toLowerCase().startsWith(`${network.bech32}1`)) {
        let res;
        try {
          res = bech32.decode(address);
          if (res.words[0] !== 0)
            throw new Error(`bech32: wrong version=${res.words[0]}`);
        } catch (_) {
          res = bech32m.decode(address);
          if (res.words[0] === 0)
            throw new Error(`bech32m: wrong version=${res.words[0]}`);
        }
        if (res.prefix !== network.bech32)
          throw new Error(`wrong bech32 prefix=${res.prefix}`);
        const [version, ...program] = res.words;
        const data2 = bech32.fromWords(program);
        validateWitness(version, data2);
        if (version === 0 && data2.length === 32)
          return { type: "wsh", hash: data2 };
        else if (version === 0 && data2.length === 20)
          return { type: "wpkh", hash: data2 };
        else if (version === 1 && data2.length === 32)
          return { type: "tr", pubkey: data2 };
        else if (version === 1 && equalBytes(data2, P2A_PROGRAM))
          return { type: "p2a", script: Script.encode([1, data2]) };
        else
          throw new Error("Unknown witness program");
      }
      const data = base58check.decode(address);
      if (data.length !== 21)
        throw new Error("Invalid base58 address");
      if (data[0] === network.pubKeyHash) {
        return { type: "pkh", hash: data.slice(1) };
      } else if (data[0] === network.scriptHash) {
        return {
          type: "sh",
          hash: data.slice(1)
        };
      }
      throw new Error(`Invalid address prefix=${data[0]}`);
    }
  };
}
const _0n = /* @__PURE__ */ BigInt(0), _1n = /* @__PURE__ */ BigInt(1);
const U64_MAX = /* @__PURE__ */ BigInt("0xffffffffffffffff");
const EMPTY32 = /* @__PURE__ */ new Uint8Array(32);
const EMPTY_OUTPUT = {
  amount: U64_MAX,
  script: EMPTY
};
const toVsize = (weight) => Math.ceil(weight / 4);
const stripCodeSeparator = (script) => {
  let start = 0;
  const out = [];
  for (let i = 0; i < script.length; ) {
    const pos = i;
    const op = script[i++];
    if (op === OP.CODESEPARATOR) {
      if (start < pos)
        out.push(script.subarray(start, pos));
      start = i;
      continue;
    }
    const len = scriptPushLen(op, (bytes) => {
      if (i + bytes > script.length)
        throw new Error("Unexpected end of script");
      let len2 = 0;
      for (let j = 0; j < bytes; j++)
        len2 |= script[i + j] << 8 * j;
      i += bytes;
      return len2;
    });
    if (len === void 0)
      continue;
    i += len;
    if (i > script.length)
      throw new Error("Unexpected end of script");
  }
  if (start === 0)
    return script;
  if (start < script.length)
    out.push(script.subarray(start));
  return out.length ? concatBytes(...out) : EMPTY;
};
const DEFAULT_VERSION = 2;
const DEFAULT_LOCKTIME = 0;
const DEFAULT_SEQUENCE = 4294967295;
const def = (value, def2) => value === void 0 ? def2 : value;
function cloneDeep(obj) {
  if (Array.isArray(obj))
    return obj.map((i) => cloneDeep(i));
  else if (isBytes(obj))
    return Uint8Array.from(obj);
  else if (["number", "bigint", "boolean", "string", "undefined"].includes(typeof obj))
    return obj;
  else if (obj === null)
    return obj;
  else if (typeof obj === "object") {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, cloneDeep(v)]));
  }
  throw new Error(`cloneDeep: unknown type=${typeof obj}`);
}
const SignatureHash = /* @__PURE__ */ (() => Object.freeze({
  DEFAULT: 0,
  ALL: 1,
  NONE: 2,
  SINGLE: 3,
  ANYONECANPAY: 128
}))();
const SigHash = /* @__PURE__ */ (() => Object.freeze({
  DEFAULT: SignatureHash.DEFAULT,
  ALL: SignatureHash.ALL,
  NONE: SignatureHash.NONE,
  SINGLE: SignatureHash.SINGLE,
  // BIP341 only permits 0x00, 0x01, 0x02, 0x03, 0x81, 0x82, and 0x83 for taproot, so
  // the mechanical `DEFAULT | ANYONECANPAY` combination (0x80) is invalid and not exported.
  // DEFAULT_ANYONECANPAY: SignatureHash.DEFAULT | SignatureHash.ANYONECANPAY,
  ALL_ANYONECANPAY: SignatureHash.ALL | SignatureHash.ANYONECANPAY,
  NONE_ANYONECANPAY: SignatureHash.NONE | SignatureHash.ANYONECANPAY,
  SINGLE_ANYONECANPAY: SignatureHash.SINGLE | SignatureHash.ANYONECANPAY
}))();
const SigHashNames = /* @__PURE__ */ (() => Object.freeze(reverseObject(SigHash)))();
function getTaprootKeys(privKey, pubKey, internalKey, merkleRoot = EMPTY) {
  if (equalBytes(internalKey, pubKey)) {
    privKey = taprootTweakPrivKey(privKey, merkleRoot);
    pubKey = pubSchnorr(privKey);
  }
  return { privKey, pubKey };
}
function outputBeforeSign(i) {
  if (i.script === void 0 || i.amount === void 0)
    throw new Error("Transaction/output: script and amount required");
  return { script: i.script, amount: i.amount };
}
function inputBeforeSign(i) {
  validateObject(i, {}, {}, "i");
  if (i.txid === void 0 || i.index === void 0)
    throw new Error("Transaction/input: txid and index required");
  const res = {
    txid: i.txid,
    index: i.index,
    sequence: def(i.sequence, DEFAULT_SEQUENCE),
    finalScriptSig: def(i.finalScriptSig, EMPTY)
  };
  RawInput.encode(res);
  return res;
}
const cleanExtensions = (map, unknownMode, proprietaryMode, rejectStrip = false) => {
  const out = { ...map };
  for (const [name, mode] of [
    ["unknown", unknownMode],
    ["proprietary", proprietaryMode]
  ]) {
    const value = out[name];
    if (value !== void 0)
      aarray(value, `${name} PSBT field`);
    const rows = value;
    if (!(rows == null ? void 0 : rows.length)) {
      delete out[name];
      continue;
    }
    if (mode === "strict")
      throw new Error(`PSBT: ${name} PSBT field is not allowed in strict mode`);
    if (mode === "strip") {
      if (rejectStrip)
        throw new Error(`PSBT: ${name} PSBT field cannot be supplied when policy is strip`);
      delete out[name];
    }
  }
  return out;
};
const cleanTxModifiable = (value, mode) => {
  if (value === void 0 || !(value & -8))
    return value;
  if (mode === "strict")
    throw new Error("PSBT: unknown txModifiable bits in strict mode");
  return mode === "strip" ? value & 7 : value;
};
function cleanFinalInput(i, unknownMode = "strip", proprietaryMode = "strip") {
  var _a;
  const _i = i;
  const extensions = cleanExtensions(_i, unknownMode, proprietaryMode);
  if (extensions.unknown)
    _i.unknown = extensions.unknown;
  else
    delete _i.unknown;
  if (extensions.proprietary)
    _i.proprietary = extensions.proprietary;
  else
    delete _i.proprietary;
  for (const _k in _i) {
    const k = _k;
    if (proprietaryMode === "ignore" && k === "proprietary" && ((_a = _i.proprietary) == null ? void 0 : _a.length))
      continue;
    if (!PSBTInputFinalKeys.includes(k))
      delete _i[k];
  }
}
const TxHashIdx = /* @__PURE__ */ (() => struct({ txid: createBytes(32, true), index: U32LE }))();
function validateSigHash(s) {
  if (typeof s !== "number" || typeof SigHashNames[s] !== "string")
    throw new Error(`Invalid SigHash=${s}`);
  return s;
}
function unpackSighash(hashType) {
  const masked = hashType & 31;
  return {
    isAny: !!(hashType & SignatureHash.ANYONECANPAY),
    isNone: masked === SignatureHash.NONE,
    isSingle: masked === SignatureHash.SINGLE
  };
}
const sighashScope = (sighash) => ({
  sigInputs: sighash & SignatureHash.ANYONECANPAY,
  sigOutputs: sighash === SignatureHash.DEFAULT ? SignatureHash.ALL : sighash & 3
});
const normalizeUnknowns = (name, mode, legacy, fallback = "strip") => {
  const alias = legacy === void 0 ? void 0 : legacy ? "ignore" : "strip";
  if (mode !== void 0 && mode !== "ignore" && mode !== "strip" && mode !== "strict")
    throw new Error(`Transaction options wrong value: ${name}=${mode}`);
  if (mode !== void 0 && alias !== void 0 && mode !== alias)
    throw new Error(`Transaction options: conflicting ${name} options`);
  return mode || alias || fallback;
};
function validateOpts(opts) {
  if (opts !== void 0)
    validateObject(opts, {}, {}, "opts");
  const _opts = {
    ...opts,
    // Defaults
    version: def(opts.version, DEFAULT_VERSION),
    lockTime: def(opts.lockTime, 0),
    PSBTVersion: def(opts.PSBTVersion, 0)
  };
  if (typeof _opts.allowUnknowInput !== "undefined")
    _opts.allowUnknownInputs = _opts.allowUnknowInput;
  if (typeof _opts.allowUnknowOutput !== "undefined")
    _opts.allowUnknownOutputs = _opts.allowUnknowOutput;
  if (_opts.allowMissingTxModifiable === void 0)
    _opts.allowMissingTxModifiable = true;
  if (typeof _opts.lockTime !== "number")
    throw new Error("Transaction lock time should be number");
  U32LE.encode(_opts.lockTime);
  if (_opts.PSBTVersion !== 0 && _opts.PSBTVersion !== 2)
    throw new Error(`Unknown PSBT version ${_opts.PSBTVersion}`);
  for (const k of [
    "allowUnknownVersion",
    "allowUnknownOutputs",
    "allowUnknownInputs",
    "disableScriptCheck",
    "bip174jsCompat",
    "allowLegacyWitnessUtxo",
    "strictPrevoutValidation",
    "lowR",
    "allowUnknown",
    "allowMissingTxModifiable"
  ]) {
    const v = _opts[k];
    if (v === void 0)
      continue;
    if (typeof v !== "boolean")
      throw new Error(`Transation options wrong type: ${k}=${v} (${typeof v})`);
  }
  _opts.unknown = normalizeUnknowns("unknown", _opts.unknown, _opts.allowUnknown);
  _opts.proprietary = normalizeUnknowns("proprietary", _opts.proprietary, void 0, _opts.unknown);
  if (_opts.allowUnknownVersion ? typeof _opts.version !== "number" : ![-1, 0, 1, 2, 3].includes(_opts.version))
    throw new Error(`Unknown version: ${_opts.version}`);
  I32LE.encode(_opts.version);
  if (_opts.customScripts !== void 0) {
    const cs = _opts.customScripts;
    if (!Array.isArray(cs)) {
      throw new Error(`wrong custom scripts type (expected array): customScripts=${cs} (${typeof cs})`);
    }
    for (const s of cs) {
      if (typeof s.encode !== "function" || typeof s.decode !== "function")
        throw new Error(`wrong script=${s} (${typeof s})`);
      if (s.finalizeTaproot !== void 0 && typeof s.finalizeTaproot !== "function")
        throw new Error(`wrong script=${s} (${typeof s})`);
    }
  }
  return Object.freeze(_opts);
}
function checkTaprootInputCommitments(input, prevScript) {
  var _a, _b;
  const output = _WitnessOutScript.decode(prevScript);
  const hasTaprootCommitments = input.tapInternalKey !== void 0 || input.tapMerkleRoot !== void 0 || // Repeated keyed fields only exist on the PSBT wire when at least one entry is encoded.
  !!((_a = input.tapLeafScript) == null ? void 0 : _a.length);
  if (output.type !== "tr") {
    if (hasTaprootCommitments)
      throw new Error("validateInput: Taproot metadata without P2TR previous output");
    return;
  }
  const checkOutputKey = (internalKey, merkleRoot, parity) => {
    const [outputKey, outputParity] = taprootTweakPubkey(internalKey, merkleRoot);
    if (!equalBytes(outputKey, output.pubkey))
      throw new Error("validateInput: Taproot commitment does not match previous output");
    if (parity !== void 0 && outputParity !== parity)
      throw new Error("validateInput: Taproot control-block parity does not match previous output");
  };
  if (input.tapLeafScript) {
    for (const [controlBlock, scriptWithVersion] of input.tapLeafScript) {
      const leafVersion = scriptWithVersion[scriptWithVersion.length - 1];
      const script = scriptWithVersion.subarray(0, -1);
      let merkleRoot = tapLeafHash(script, leafVersion);
      for (const sibling of controlBlock.merklePath) {
        merkleRoot = compareBytes(sibling, merkleRoot) === -1 ? tagSchnorr("TapBranch", sibling, merkleRoot) : tagSchnorr("TapBranch", merkleRoot, sibling);
      }
      checkOutputKey(controlBlock.internalKey, merkleRoot, controlBlock.version & 1);
      if (input.tapInternalKey && !equalBytes(input.tapInternalKey, controlBlock.internalKey))
        throw new Error("validateInput: tapInternalKey does not match Taproot control block");
      if (input.tapMerkleRoot && !equalBytes(input.tapMerkleRoot, merkleRoot))
        throw new Error("validateInput: tapMerkleRoot does not match Taproot control block");
    }
  }
  if (input.tapInternalKey && (input.tapMerkleRoot || !((_b = input.tapLeafScript) == null ? void 0 : _b.length)))
    checkOutputKey(input.tapInternalKey, input.tapMerkleRoot || EMPTY);
}
const LOCKTIME_THRESHOLD = 5e8;
function validateRequiredLocktimes(input) {
  const height = input.requiredHeightLocktime;
  if (height !== void 0) {
    anumber$1(height, "requiredHeightLocktime");
    if (height === 0 || height >= LOCKTIME_THRESHOLD)
      throw new RangeError(`requiredHeightLocktime must be between 1 and ${LOCKTIME_THRESHOLD - 1}, got ${height}`);
  }
  const time = input.requiredTimeLocktime;
  if (time !== void 0) {
    anumber$1(time, "requiredTimeLocktime");
    if (time < LOCKTIME_THRESHOLD || time > 4294967295)
      throw new RangeError(`requiredTimeLocktime must be between ${LOCKTIME_THRESHOLD} and 4294967295, got ${time}`);
  }
}
function resolvePSBTLocktime(inputs, fallback = DEFAULT_LOCKTIME) {
  let height = DEFAULT_LOCKTIME;
  let time = DEFAULT_LOCKTIME;
  let hasRequirements = false;
  let heightSupported = true;
  let timeSupported = true;
  for (const input of inputs) {
    validateRequiredLocktimes(input);
    const hasHeight = input.requiredHeightLocktime !== void 0;
    const hasTime = input.requiredTimeLocktime !== void 0;
    if (!hasHeight && !hasTime)
      continue;
    hasRequirements = true;
    if (hasHeight)
      height = Math.max(height, input.requiredHeightLocktime);
    else
      heightSupported = false;
    if (hasTime)
      time = Math.max(time, input.requiredTimeLocktime);
    else
      timeSupported = false;
  }
  if (!hasRequirements)
    return fallback;
  if (heightSupported)
    return height;
  if (timeSupported)
    return time;
  throw new Error("PSBTv2: incompatible height-based and time-based locktime requirements");
}
function validateInput(i, disableScriptCheck = false) {
  validateObject(i, {}, {}, "i");
  const _i = i;
  validateRequiredLocktimes(_i);
  let prevOut;
  if (_i.nonWitnessUtxo && _i.index !== void 0) {
    const last = _i.nonWitnessUtxo.outputs.length - 1;
    if (_i.index > last)
      throw new Error(`validateInput: index(${_i.index}) not in nonWitnessUtxo`);
    prevOut = _i.nonWitnessUtxo.outputs[_i.index];
    if (_i.witnessUtxo && (!equalBytes(_i.witnessUtxo.script, prevOut.script) || _i.witnessUtxo.amount !== prevOut.amount))
      throw new Error("validateInput: witnessUtxo different from nonWitnessUtxo");
    if (_i.txid) {
      const outputs = _i.nonWitnessUtxo.outputs;
      if (outputs.length - 1 < _i.index)
        throw new Error("nonWitnessUtxo: incorect output index");
      const tx = Transaction.fromRaw(RawTx.encode(_i.nonWitnessUtxo), {
        allowUnknownOutputs: true,
        disableScriptCheck: true,
        allowUnknownInputs: true,
        // Consensus does not restrict nVersion; a previous tx with a non-standard
        // version is still spendable and its txid must still be verifiable.
        allowUnknownVersion: true
      });
      const txid = hex.encode(_i.txid);
      if (tx.id !== txid)
        throw new Error(`nonWitnessUtxo: wrong txid, exp=${txid} got=${tx.id}`);
    }
  } else if (_i.witnessUtxo)
    prevOut = _i.witnessUtxo;
  if (prevOut && !disableScriptCheck) {
    checkScript(prevOut.script, _i.redeemScript, _i.witnessScript);
    checkTaprootInputCommitments(_i, prevOut.script);
  }
  return _i;
}
const inputSignatures = (input) => {
  const _input = input;
  const res = [];
  const add2 = (signature, taproot, scriptPath = false) => {
    const sig = signature;
    if (!sig.length)
      return;
    const sighash = taproot && sig.length === 64 ? SignatureHash.DEFAULT : sig[sig.length - 1];
    res.push({ sighash, taproot, scriptPath });
  };
  for (const [, signature] of _input.partialSig || [])
    add2(signature, false);
  if (_input.tapKeySig)
    add2(_input.tapKeySig, true);
  for (const [, signature] of _input.tapScriptSig || [])
    add2(signature, true, true);
  return res;
};
const inputSignedKeys = {
  // sighashType is signer policy rather than a digest byte, but changing it after one signature
  // exists would make later signers interpret the same input under a different policy.
  self: ["txid", "index", "sequence", "nonWitnessUtxo", "witnessUtxo", "sighashType"],
  ecdsa: ["redeemScript", "witnessScript"],
  tapscript: ["tapLeafScript"],
  cross: ["txid", "index"],
  prevout: ["nonWitnessUtxo", "witnessUtxo"]
};
function getPrevOut(input) {
  validateObject(input, {}, {}, "input");
  const _input = input;
  if (_input.nonWitnessUtxo) {
    if (_input.index === void 0)
      throw new Error("Unknown input index");
    if (!Number.isSafeInteger(_input.index) || _input.index < 0 || _input.index >= _input.nonWitnessUtxo.outputs.length)
      throw new Error(`Wrong input index=${_input.index}`);
    return _input.nonWitnessUtxo.outputs[_input.index];
  } else if ("witnessUtxo" in _input) {
    const prev = _input.witnessUtxo;
    validateObject(prev, {}, {}, "input.witnessUtxo");
    abigint(prev.amount, "input.witnessUtxo.amount");
    if (!isBytes(prev.script))
      throw new TypeError('"input.witnessUtxo.script" expected Uint8Array, got type=' + typeof prev.script);
    return prev;
  } else
    throw new Error("Cannot find previous output info");
}
function normalizeInput(i, cur, allowedFields, disableScriptCheck = false, unknown = "strip", proprietary = "strip") {
  validateObject(i, {}, {}, "i");
  if (cur !== void 0)
    validateObject(cur, {}, {}, "cur");
  if (allowedFields !== void 0)
    aarray(allowedFields, "allowedFields");
  const _i = i;
  const _cur = cur;
  const _allowedFields = allowedFields;
  let { nonWitnessUtxo, txid } = _i;
  if (typeof nonWitnessUtxo === "string")
    nonWitnessUtxo = hex.decode(nonWitnessUtxo);
  if (isBytes(nonWitnessUtxo))
    nonWitnessUtxo = RawTx.decode(nonWitnessUtxo);
  if (!("nonWitnessUtxo" in _i) && nonWitnessUtxo === void 0)
    nonWitnessUtxo = _cur == null ? void 0 : _cur.nonWitnessUtxo;
  if (typeof txid === "string")
    txid = hex.decode(txid);
  if (txid === void 0)
    txid = _cur == null ? void 0 : _cur.txid;
  let res = { ..._cur, ..._i, nonWitnessUtxo, txid };
  if (!("nonWitnessUtxo" in _i) && res.nonWitnessUtxo === void 0)
    delete res.nonWitnessUtxo;
  if (res.sequence === void 0)
    res.sequence = DEFAULT_SEQUENCE;
  if (res.tapMerkleRoot === null)
    delete res.tapMerkleRoot;
  res = mergeKeyMap(PSBTInput, res, _cur, _allowedFields, unknown, proprietary);
  if (Array.isArray(res.tapLeafScript) && !res.tapLeafScript.length)
    delete res.tapLeafScript;
  validateRequiredLocktimes(res);
  PSBTInputCoder.encode(res);
  return validateInput(res, disableScriptCheck);
}
function getInputType(input, allowLegacyWitnessUtxo = false) {
  const _input = input;
  let txType = "legacy";
  let defaultSighash = SignatureHash.ALL;
  const prevOut = getPrevOut(_input);
  const first = _WitnessOutScript.decode(prevOut.script);
  let type = first.type;
  let cur = first;
  const stack = [first];
  let lastScript = prevOut.script;
  if (first.type === "tr") {
    defaultSighash = SignatureHash.DEFAULT;
    return {
      txType: "taproot",
      type: "tr",
      last: first,
      lastScript: prevOut.script,
      defaultSighash,
      sighash: _input.sighashType || defaultSighash
    };
  } else {
    if (first.type === "wpkh" || first.type === "wsh")
      txType = "segwit";
    if (first.type === "sh") {
      if (!_input.redeemScript)
        throw new Error("inputType: sh without redeemScript");
      let child = _WitnessOutScript.decode(_input.redeemScript);
      if (child.type === "wpkh" || child.type === "wsh")
        txType = "segwit";
      stack.push(child);
      cur = child;
      lastScript = _input.redeemScript;
      type += `-${child.type}`;
    }
    if (cur.type === "wsh") {
      if (!_input.witnessScript)
        throw new Error("inputType: wsh without witnessScript");
      let child = OutScript.decode(_input.witnessScript);
      if (child.type === "wsh")
        txType = "segwit";
      stack.push(child);
      cur = child;
      lastScript = _input.witnessScript;
      type += `-${child.type}`;
    }
    const last = stack[stack.length - 1];
    if (last.type === "sh" || last.type === "wsh")
      throw new Error("inputType: sh/wsh cannot be terminal type");
    const res = {
      type,
      txType,
      last,
      lastScript,
      defaultSighash,
      sighash: _input.sighashType || defaultSighash
    };
    if (txType === "legacy" && !allowLegacyWitnessUtxo && !_input.nonWitnessUtxo) {
      throw new Error(`Transaction/sign: legacy input without nonWitnessUtxo, can result in attack that forces paying higher fees. Pass allowLegacyWitnessUtxo=true, if you sure`);
    }
    return res;
  }
}
class Transaction {
  constructor(opts = {}) {
    __publicField(this, "global", {});
    __publicField(this, "inputs", []);
    // use getInput()
    __publicField(this, "outputs", []);
    // use getOutput()
    __publicField(this, "opts");
    const _opts = this.opts = validateOpts(opts);
    this.global.fallbackLocktime = _opts.lockTime;
    this.global.txVersion = _opts.version;
    if (_opts.PSBTVersion === 2)
      this.global.txModifiable = 3;
  }
  isPSBTv2() {
    return (this.global.version ?? this.opts.PSBTVersion) === 2;
  }
  requireTxModifiable(bit, kind) {
    if (!this.isPSBTv2())
      return;
    if (!(this.txModifiablePolicy() & bit))
      throw new Error(`PSBTv2: ${kind} are not modifiable`);
  }
  txModifiablePolicy(allowMissing = this.opts.allowMissingTxModifiable, unknownMode = this.opts.unknown) {
    if (!this.isPSBTv2())
      return 3;
    if (this.global.txModifiable !== void 0)
      return cleanTxModifiable(this.global.txModifiable, unknownMode);
    return allowMissing ? 3 : 0;
  }
  modifiable(allowMissing = this.opts.allowMissingTxModifiable, unknownMode = this.opts.unknown) {
    let flags = this.txModifiablePolicy(allowMissing, unknownMode);
    let hasOpaqueFinal = false;
    let hasSingle = false;
    for (let idx = 0; idx < this.inputs.length; idx++) {
      const signatures = inputSignatures(this.inputs[idx]);
      if (!signatures.length && this.inputStatus(idx) === "finalized")
        hasOpaqueFinal = true;
      for (const { sighash } of signatures) {
        const { isAny, isNone, isSingle } = unpackSighash(sighash);
        if (!isAny)
          flags &= -2;
        if (!isNone)
          flags &= -3;
        if (isSingle)
          hasSingle = true;
      }
    }
    if (hasSingle)
      flags |= 4;
    if (hasOpaqueFinal && this.global.txModifiable === void 0)
      flags &= -4;
    return flags;
  }
  get txModifiable() {
    return this.modifiable();
  }
  // Import
  static fromRaw(raw, opts = {}) {
    const parsed = RawTx.decode(raw);
    const tx = new Transaction({ ...opts, version: parsed.version, lockTime: parsed.lockTime });
    for (const o of parsed.outputs)
      tx.addOutput(o);
    tx.outputs = parsed.outputs;
    tx.inputs = parsed.inputs;
    if (parsed.witnesses) {
      for (let i = 0; i < parsed.witnesses.length; i++)
        tx.inputs[i].finalScriptWitness = parsed.witnesses[i];
    }
    return tx;
  }
  // PSBT
  static fromPSBT(psbt_, opts = {}) {
    let parsed;
    try {
      parsed = RawPSBTV0.decode(psbt_);
    } catch (e0) {
      try {
        parsed = RawPSBTV2.decode(psbt_);
      } catch (e2) {
        throw e0;
      }
    }
    const PSBTVersion = parsed.global.version || 0;
    if (PSBTVersion !== 0 && PSBTVersion !== 2)
      throw new Error(`Wrong PSBT version=${PSBTVersion}`);
    const unsigned = parsed.global.unsignedTx;
    const version = PSBTVersion === 0 ? unsigned == null ? void 0 : unsigned.version : parsed.global.txVersion;
    const lockTime = PSBTVersion === 0 ? unsigned == null ? void 0 : unsigned.lockTime : parsed.global.fallbackLocktime;
    const tx = new Transaction({ ...opts, version, lockTime, PSBTVersion });
    const inputCount = PSBTVersion === 0 ? unsigned == null ? void 0 : unsigned.inputs.length : parsed.global.inputCount;
    tx.inputs = parsed.inputs.slice(0, inputCount).map((i, j) => {
      var _a, _b;
      const input = {
        ...(_a = parsed.global.unsignedTx) == null ? void 0 : _a.inputs[j],
        ...i
      };
      if (!((_b = i.finalScriptSig) == null ? void 0 : _b.length))
        delete input.finalScriptSig;
      return validateInput(input, tx.opts.disableScriptCheck);
    });
    const outputCount = PSBTVersion === 0 ? unsigned == null ? void 0 : unsigned.outputs.length : parsed.global.outputCount;
    const hasBip174InputMap = PSBTVersion === 0 && inputCount === 0 && Object.keys(parsed.outputs[0] || {}).length === 0 && (outputCount > 0 && parsed.outputs.length === outputCount + 1 || outputCount === 0 && parsed.outputs.length === 2 && Object.keys(parsed.outputs[1]).length === 0);
    const outputStart = hasBip174InputMap ? 1 : 0;
    tx.outputs = parsed.outputs.slice(outputStart, outputStart + outputCount).map((i, j) => {
      var _a;
      return {
        ...i,
        ...(_a = parsed.global.unsignedTx) == null ? void 0 : _a.outputs[j]
      };
    });
    const unknownMode = tx.opts.unknown;
    const proprietaryMode = tx.opts.proprietary;
    tx.global = cleanExtensions({ ...parsed.global, txVersion: version }, unknownMode, proprietaryMode);
    tx.inputs = tx.inputs.map((input) => cleanExtensions(input, unknownMode, proprietaryMode));
    tx.outputs = tx.outputs.map((output) => cleanExtensions(output, unknownMode, proprietaryMode));
    if (tx.global.txModifiable !== void 0)
      tx.global.txModifiable = cleanTxModifiable(tx.global.txModifiable, unknownMode);
    resolvePSBTLocktime(tx.inputs, tx.global.fallbackLocktime ?? DEFAULT_LOCKTIME);
    if (PSBTVersion === 0)
      tx.global.fallbackLocktime = def(lockTime, DEFAULT_LOCKTIME);
    return tx;
  }
  // Prefer `global.version` when present so cross-version combiners can serialize at the highest
  // required PSBT version without mutating the frozen transaction options object.
  toPSBT(PSBTVersion = this.global.version || this.opts.PSBTVersion) {
    if (PSBTVersion !== void 0)
      anumber$1(PSBTVersion, "PSBTVersion");
    if (PSBTVersion !== 0 && PSBTVersion !== 2)
      throw new Error(`Wrong PSBT version=${PSBTVersion}`);
    const inputs = this.inputs.map((i) => cleanExtensions(
      // For PSBTv0 the prevout txid/index live in global.unsignedTx rather than the input map, so
      // validate the full transaction input before version filtering drops those fields.
      cleanPSBTFields(PSBTVersion, PSBTInput, validateInput(i, this.opts.disableScriptCheck)),
      this.opts.unknown,
      this.opts.proprietary
    ));
    for (const inp of inputs) {
      if (inp.partialSig && !inp.partialSig.length)
        delete inp.partialSig;
      if (inp.finalScriptSig && !inp.finalScriptSig.length)
        delete inp.finalScriptSig;
      if (inp.finalScriptWitness && !inp.finalScriptWitness.length)
        delete inp.finalScriptWitness;
    }
    const outputs = this.outputs.map((i) => cleanExtensions(cleanPSBTFields(PSBTVersion, PSBTOutput, i), this.opts.unknown, this.opts.proprietary));
    const global = cleanExtensions({ ...this.global }, this.opts.unknown, this.opts.proprietary);
    if (global.txModifiable !== void 0)
      global.txModifiable = cleanTxModifiable(global.txModifiable, this.opts.unknown);
    if (PSBTVersion === 0) {
      global.unsignedTx = RawOldTx.decode(RawOldTx.encode({
        version: this.version,
        lockTime: this.lockTime,
        inputs: this.inputs.map((i) => inputBeforeSign(i)).map((i) => ({
          ...i,
          finalScriptSig: EMPTY
        })),
        outputs: this.outputs.map((o) => outputBeforeSign(o))
      }));
      delete global.fallbackLocktime;
      delete global.txVersion;
      delete global.inputCount;
      delete global.outputCount;
      delete global.version;
      delete global.txModifiable;
    } else {
      delete global.unsignedTx;
      global.version = PSBTVersion;
      global.txVersion = this.version;
      global.inputCount = this.inputs.length;
      global.outputCount = this.outputs.length;
      if (!this.isPSBTv2() || global.txModifiable === void 0 && this.opts.allowMissingTxModifiable)
        global.txModifiable = this.txModifiable;
    }
    if (this.opts.bip174jsCompat && PSBTVersion === 0 && !outputs.length)
      outputs.push({});
    const raw = { global, inputs, outputs };
    return PSBTVersion === 0 ? RawPSBTV0.encode(raw) : RawPSBTV2.encode(raw);
  }
  // BIP370 lockTime (https://github.com/bitcoin/bips/blob/master/bip-0370.mediawiki#determining-lock-time)
  get lockTime() {
    return resolvePSBTLocktime(this.inputs, this.global.fallbackLocktime ?? DEFAULT_LOCKTIME);
  }
  get version() {
    if (this.global.txVersion === void 0)
      throw new Error("No global.txVersion");
    return this.global.txVersion;
  }
  inputStatus(idx) {
    this.checkInputIdx(idx);
    const input = this.inputs[idx];
    if (input.finalScriptSig && input.finalScriptSig.length)
      return "finalized";
    if (input.finalScriptWitness && input.finalScriptWitness.length)
      return "finalized";
    if (input.tapKeySig)
      return "signed";
    if (input.tapScriptSig && input.tapScriptSig.length)
      return "signed";
    if (input.partialSig && input.partialSig.length)
      return "signed";
    return "unsigned";
  }
  cleanFinalInput(input) {
    cleanFinalInput(input, this.opts.unknown, this.opts.proprietary);
    if (this.global.txModifiable !== void 0)
      this.global.txModifiable = cleanTxModifiable(this.global.txModifiable, this.opts.unknown);
  }
  // Cannot replace unpackSighash, tests rely on very generic implemenetation with signing inputs outside of range
  // We will lose some vectors -> smaller test coverage of preimages (very important!)
  inputSighash(idx) {
    this.checkInputIdx(idx);
    const inputSighash = this.inputs[idx].sighashType;
    const sighash = inputSighash === void 0 ? SignatureHash.DEFAULT : inputSighash;
    return sighashScope(sighash);
  }
  // Very nice for debug purposes, but slow. If there is too much inputs/outputs to add, will be quadratic.
  // Some cache will be nice, but there chance to have bugs with cache invalidation
  signatures() {
    const res = [];
    for (let idx = 0; idx < this.inputs.length; idx++) {
      const actual = inputSignatures(this.inputs[idx]);
      for (const signature of actual)
        res.push({ idx, ...signature });
      if (actual.length || this.inputStatus(idx) !== "finalized")
        continue;
      let taproot = true;
      try {
        taproot = _WitnessOutScript.decode(getPrevOut(this.inputs[idx]).script).type === "tr";
      } catch {
      }
      const declared = this.inputs[idx].sighashType;
      const sighash = declared === void 0 ? SignatureHash.DEFAULT : declared;
      res.push({ idx, sighash, taproot, scriptPath: taproot });
    }
    return res;
  }
  signedInputKeys(idx, signatures = this.signatures()) {
    const res = /* @__PURE__ */ new Set();
    const add2 = (keys) => {
      for (const key of keys)
        res.add(key);
    };
    for (const signature of signatures) {
      const { isAny, isNone, isSingle } = unpackSighash(signature.sighash);
      if (signature.idx === idx) {
        add2(inputSignedKeys.self);
        if (signature.taproot) {
          if (signature.scriptPath)
            add2(inputSignedKeys.tapscript);
        } else
          add2(inputSignedKeys.ecdsa);
      } else if (!isAny) {
        add2(inputSignedKeys.cross);
        if (signature.taproot || !isNone && !isSingle)
          res.add("sequence");
        if (signature.taproot)
          add2(inputSignedKeys.prevout);
      }
    }
    return [...res];
  }
  signStatus(signatures = this.signatures()) {
    let addInput = true, addOutput = true;
    let inputs = [], outputs = [];
    for (const { idx, sighash } of signatures) {
      const { sigInputs, sigOutputs } = sighashScope(sighash);
      if (sigInputs === SignatureHash.ANYONECANPAY) {
        if (!inputs.includes(idx))
          inputs.push(idx);
      } else
        addInput = false;
      if (sigOutputs === SignatureHash.ALL)
        addOutput = false;
      else if (sigOutputs === SignatureHash.SINGLE) {
        if (!outputs.includes(idx))
          outputs.push(idx);
      } else if (sigOutputs === SignatureHash.NONE) ;
      else
        throw new Error(`Wrong signature hash output type: ${sigOutputs}`);
    }
    return { addInput, addOutput, inputs, outputs };
  }
  get isFinal() {
    for (let idx = 0; idx < this.inputs.length; idx++)
      if (this.inputStatus(idx) !== "finalized")
        return false;
    return true;
  }
  // Info utils
  get hasWitnesses() {
    for (const i of this.inputs)
      if (i.finalScriptWitness && i.finalScriptWitness.length)
        return true;
    return false;
  }
  // https://en.bitcoin.it/wiki/Weight_units
  get weight() {
    if (!this.isFinal)
      throw new Error("Transaction is not finalized");
    const varLen = (dataLen) => CompactSizeLen.encode(dataLen).length + dataLen;
    const hasWitnesses = this.hasWitnesses;
    let out = 32;
    const outputs = this.outputs.map(outputBeforeSign);
    out += 4 * CompactSizeLen.encode(this.outputs.length).length;
    for (const o of outputs)
      out += 32 + 4 * varLen(o.script.length);
    if (hasWitnesses)
      out += 2;
    out += 4 * CompactSizeLen.encode(this.inputs.length).length;
    for (const i of this.inputs) {
      out += 160 + 4 * varLen((i.finalScriptSig || EMPTY).length);
      if (hasWitnesses) {
        const witness = i.finalScriptWitness || [];
        out += CompactSizeLen.encode(witness.length).length;
        for (const w of witness)
          out += varLen(w.length);
      }
    }
    return out;
  }
  get vsize() {
    return toVsize(this.weight);
  }
  toBytes(withScriptSig = false, withWitness = false) {
    return RawTx.encode({
      version: this.version,
      lockTime: this.lockTime,
      inputs: this.inputs.map(inputBeforeSign).map((i) => ({
        ...i,
        finalScriptSig: withScriptSig && i.finalScriptSig || EMPTY
      })),
      outputs: this.outputs.map(outputBeforeSign),
      witnesses: this.inputs.map((i) => i.finalScriptWitness || []),
      segwitFlag: withWitness && this.hasWitnesses
    });
  }
  get unsignedTx() {
    return this.toBytes(false, false);
  }
  get hex() {
    return hex.encode(this.toBytes(true, this.hasWitnesses));
  }
  get hash() {
    return hex.encode(sha256x2(this.toBytes(true)));
  }
  get id() {
    return hex.encode(sha256x2(this.toBytes(true)).reverse());
  }
  // Input stuff
  checkInputIdx(idx) {
    anumber$1(idx, "idx");
    if (idx >= this.inputs.length)
      throw new Error(`Wrong input index=${idx}`);
  }
  validatePrevoutsForSigning() {
    if (!this.opts.strictPrevoutValidation)
      return;
    for (let i = 0; i < this.inputs.length; i++) {
      const input = this.inputs[i];
      if (!input.nonWitnessUtxo) {
        throw new Error(`Transaction/sign: strictPrevoutValidation requires nonWitnessUtxo for input=${i}`);
      }
      if (input.txid === void 0 || input.index === void 0) {
        throw new Error(`Transaction/sign: strictPrevoutValidation requires an outpoint for input=${i}`);
      }
      validateInput(input, this.opts.disableScriptCheck);
    }
  }
  getInput(idx) {
    this.checkInputIdx(idx);
    return cloneDeep(this.inputs[idx]);
  }
  get inputsLength() {
    return this.inputs.length;
  }
  // Modification
  addInput(input, _ignoreSignStatus = false) {
    validateObject(input, {}, {}, "input");
    cleanExtensions(input, this.opts.unknown, this.opts.proprietary, true);
    this.requireTxModifiable(1, "inputs");
    const signatures = _ignoreSignStatus ? void 0 : this.signatures();
    const status = signatures && this.signStatus(signatures);
    if (status && !status.addInput)
      throw new Error("Tx has signed inputs, cannot add new one");
    const normalized = cloneDeep(normalizeInput(input, void 0, void 0, this.opts.disableScriptCheck, this.opts.unknown, this.opts.proprietary));
    const nextLockTime = resolvePSBTLocktime([...this.inputs, normalized], this.global.fallbackLocktime ?? DEFAULT_LOCKTIME);
    if ((signatures == null ? void 0 : signatures.length) && nextLockTime !== this.lockTime)
      throw new Error("Tx has signed inputs, cannot change lockTime");
    this.inputs.push(normalized);
    return this.inputs.length - 1;
  }
  updateInput(idx, input, _ignoreSignStatus = false) {
    this.checkInputIdx(idx);
    cleanExtensions(input, this.opts.unknown, this.opts.proprietary, true);
    let allowedFields;
    const signatures = _ignoreSignStatus ? void 0 : this.signatures();
    if (signatures == null ? void 0 : signatures.length) {
      if (this.inputStatus(idx) === "finalized") {
        allowedFields = PSBTInputSignatureKeys.filter((key) => this.inputs[idx][key] !== void 0);
      } else {
        const signed = new Set(this.signedInputKeys(idx, signatures));
        if (signed.size)
          allowedFields = Object.keys(PSBTInput).filter((key) => !signed.has(key));
      }
    }
    const normalized = cloneDeep(normalizeInput(input, this.inputs[idx], allowedFields, this.opts.disableScriptCheck, this.opts.unknown, this.opts.proprietary));
    const inputs = this.inputs.slice();
    inputs[idx] = normalized;
    const nextLockTime = resolvePSBTLocktime(inputs, this.global.fallbackLocktime ?? DEFAULT_LOCKTIME);
    if ((signatures == null ? void 0 : signatures.length) && nextLockTime !== this.lockTime)
      throw new Error("Tx has signed inputs, cannot change lockTime");
    const current = this.inputs[idx];
    const transactionChanged = current.index !== normalized.index || def(current.sequence, DEFAULT_SEQUENCE) !== def(normalized.sequence, DEFAULT_SEQUENCE) || (current.txid === void 0 ? normalized.txid !== void 0 : normalized.txid === void 0 || !equalBytes(current.txid, normalized.txid)) || nextLockTime !== this.lockTime;
    if (transactionChanged)
      this.requireTxModifiable(1, "inputs");
    this.inputs[idx] = normalized;
  }
  // Output stuff
  checkOutputIdx(idx) {
    anumber$1(idx, "idx");
    if (idx >= this.outputs.length)
      throw new Error(`Wrong output index=${idx}`);
  }
  getOutput(idx) {
    this.checkOutputIdx(idx);
    return cloneDeep(this.outputs[idx]);
  }
  getOutputAddress(idx, network = NETWORK) {
    const out = this.getOutput(idx);
    if (!out.script)
      return;
    return Address(network).encode(_WitnessOutScript.decode(out.script));
  }
  get outputsLength() {
    return this.outputs.length;
  }
  normalizeOutput(o, cur, allowedFields) {
    validateObject(o, {}, {}, "o");
    let { amount, script } = o;
    if (amount === void 0)
      amount = cur == null ? void 0 : cur.amount;
    amount = abigint(amount, "o.amount");
    if (typeof script === "string")
      script = hex.decode(script);
    if (script === void 0)
      script = cur == null ? void 0 : cur.script;
    let res = { ...cur, ...o, amount, script };
    if (res.amount === void 0)
      delete res.amount;
    res = mergeKeyMap(PSBTOutput, res, cur, allowedFields, this.opts.unknown, this.opts.proprietary);
    PSBTOutputCoder.encode(res);
    if (res.script && !this.opts.allowUnknownOutputs && _WitnessOutScript.decode(res.script).type === "unknown") {
      throw new Error("Transaction/output: unknown output script type, there is a chance that input is unspendable. Pass allowUnknownOutputs=true, if you sure");
    }
    if (!this.opts.disableScriptCheck)
      checkScript(res.script, res.redeemScript, res.witnessScript);
    return res;
  }
  addOutput(o, _ignoreSignStatus = false) {
    cleanExtensions(o, this.opts.unknown, this.opts.proprietary, true);
    this.requireTxModifiable(2, "outputs");
    const status = _ignoreSignStatus ? void 0 : this.signStatus();
    if (status && (!status.addOutput || status.outputs.includes(this.outputs.length)))
      throw new Error("Tx has signed outputs, cannot add new one");
    this.outputs.push(cloneDeep(this.normalizeOutput(o)));
    return this.outputs.length - 1;
  }
  updateOutput(idx, output, _ignoreSignStatus = false) {
    this.checkOutputIdx(idx);
    cleanExtensions(output, this.opts.unknown, this.opts.proprietary, true);
    let allowedFields = void 0;
    if (!_ignoreSignStatus) {
      const status = this.signStatus();
      if (!status.addOutput || status.outputs.includes(idx))
        allowedFields = PSBTOutputUnsignedKeys;
    }
    const current = this.outputs[idx];
    const normalized = cloneDeep(this.normalizeOutput(output, current, allowedFields));
    const transactionChanged = current.amount !== normalized.amount || (current.script === void 0 ? normalized.script !== void 0 : normalized.script === void 0 || !equalBytes(current.script, normalized.script));
    if (transactionChanged)
      this.requireTxModifiable(2, "outputs");
    this.outputs[idx] = normalized;
  }
  addOutputAddress(address, amount, network = NETWORK) {
    return this.addOutput({
      // Address.decode() only returns recognized descriptors here, but its wrapped output type
      // still carries `undefined` for coder parity, so narrow before feeding OutScript.encode().
      script: OutScript.encode(Address(network).decode(address)),
      amount
    });
  }
  // Utils
  get fee() {
    let res = _0n;
    for (const i of this.inputs) {
      const prevOut = getPrevOut(i);
      if (!prevOut)
        throw new Error("Empty input amount");
      res += prevOut.amount;
    }
    const outputs = this.outputs.map(outputBeforeSign);
    for (const o of outputs)
      res -= o.amount;
    return res;
  }
  // Signing
  // Based on https://github.com/bitcoin/bitcoin/blob/5871b5b5ab57a0caf9b7514eb162c491c83281d5/test/functional/test_framework/script.py#L624
  // There is optimization opportunity to re-use hashes for multiple inputs for witness v0/v1,
  // but we are trying to be less complicated for audit purpose for now.
  preimageLegacy(idx, prevOutScript, hashType) {
    const { isAny, isNone, isSingle } = unpackSighash(hashType);
    if (idx < 0 || !Number.isSafeInteger(idx))
      throw new Error(`Invalid input idx=${idx}`);
    if (isSingle && idx >= this.outputs.length || idx >= this.inputs.length)
      return U256LE.encode(_1n);
    prevOutScript = stripCodeSeparator(prevOutScript);
    let inputs = this.inputs.map(inputBeforeSign).map((input, inputIdx) => ({
      ...input,
      finalScriptSig: inputIdx === idx ? prevOutScript : EMPTY
    }));
    if (isAny)
      inputs = [inputs[idx]];
    else if (isNone || isSingle) {
      inputs = inputs.map((input, inputIdx) => ({
        ...input,
        sequence: inputIdx === idx ? input.sequence : 0
      }));
    }
    let outputs = this.outputs.map(outputBeforeSign);
    if (isNone)
      outputs = [];
    else if (isSingle) {
      outputs = outputs.slice(0, idx).fill(EMPTY_OUTPUT).concat([outputs[idx]]);
    }
    const tmpTx = RawTx.encode({
      lockTime: this.lockTime,
      version: this.version,
      segwitFlag: false,
      inputs,
      outputs
    });
    return sha256x2(tmpTx, I32LE.encode(hashType));
  }
  preimageWitnessV0(idx, prevOutScript, hashType, amount) {
    anumber$1(idx, "idx");
    if (idx >= this.inputs.length)
      throw new Error(`Invalid input idx=${idx}`);
    const { isAny, isNone, isSingle } = unpackSighash(hashType);
    let inputHash = EMPTY32;
    let sequenceHash = EMPTY32;
    let outputHash = EMPTY32;
    const inputs = this.inputs.map(inputBeforeSign);
    const outputs = this.outputs.map(outputBeforeSign);
    if (!isAny)
      inputHash = sha256x2(...inputs.map(TxHashIdx.encode));
    if (!isAny && !isSingle && !isNone)
      sequenceHash = sha256x2(...inputs.map((i) => U32LE.encode(i.sequence)));
    if (!isSingle && !isNone) {
      outputHash = sha256x2(...outputs.map(RawOutput.encode));
    } else if (isSingle && idx < outputs.length)
      outputHash = sha256x2(RawOutput.encode(outputs[idx]));
    const input = inputs[idx];
    return sha256x2(I32LE.encode(this.version), inputHash, sequenceHash, createBytes(32, true).encode(input.txid), U32LE.encode(input.index), VarBytes.encode(prevOutScript), U64LE.encode(amount), U32LE.encode(input.sequence), outputHash, U32LE.encode(this.lockTime), U32LE.encode(hashType));
  }
  preimageWitnessV1(idx, prevOutScript, hashType, amount, codeSeparator = -1, leafScript, leafVer = 192, annex) {
    anumber$1(idx, "idx");
    if (idx >= this.inputs.length)
      throw new Error(`Invalid input idx=${idx}`);
    aarray(amount, "amount");
    aarray(prevOutScript, "prevOutScript");
    if (this.inputs.length !== amount.length)
      throw new Error(`Invalid amounts array=${amount}`);
    if (this.inputs.length !== prevOutScript.length)
      throw new Error(`Invalid prevOutScript array=${prevOutScript}`);
    const out = [
      U8.encode(0),
      U8.encode(hashType),
      // U8 sigHash
      I32LE.encode(this.version),
      U32LE.encode(this.lockTime)
    ];
    const outType = hashType === SignatureHash.DEFAULT ? SignatureHash.ALL : hashType & 3;
    const inType = hashType & SignatureHash.ANYONECANPAY;
    const inputs = this.inputs.map(inputBeforeSign);
    const outputs = this.outputs.map(outputBeforeSign);
    if (outType === SignatureHash.SINGLE && idx >= outputs.length) {
      throw new Error(`Input with sighash SINGLE, but there is no output with corresponding index=${idx}`);
    }
    if (inType !== SignatureHash.ANYONECANPAY) {
      out.push(...[
        inputs.map(TxHashIdx.encode),
        amount.map(U64LE.encode),
        prevOutScript.map(VarBytes.encode),
        inputs.map((i) => U32LE.encode(i.sequence))
      ].map((i) => sha256(concatBytes(...i))));
    }
    if (outType === SignatureHash.ALL) {
      out.push(sha256(concatBytes(...outputs.map(RawOutput.encode))));
    }
    const spendType = (annex ? 1 : 0) | (leafScript ? 2 : 0);
    out.push(new Uint8Array([spendType]));
    if (inType === SignatureHash.ANYONECANPAY) {
      const inp = inputs[idx];
      out.push(TxHashIdx.encode(inp), U64LE.encode(amount[idx]), VarBytes.encode(prevOutScript[idx]), U32LE.encode(inp.sequence));
    } else
      out.push(U32LE.encode(idx));
    if (spendType & 1)
      out.push(sha256(VarBytes.encode(annex || EMPTY)));
    if (outType === SignatureHash.SINGLE)
      out.push(sha256(RawOutput.encode(outputs[idx])));
    if (leafScript)
      out.push(tapLeafHash(leafScript, leafVer), U8.encode(0), I32LE.encode(codeSeparator));
    return tagSchnorr("TapSighash", ...out);
  }
  // Signer can be privateKey OR instance of bip32 HD stuff
  signIdx(privateKey, idx, allowedSighash, _auxRand) {
    var _a, _b;
    if (!isBytes(privateKey)) {
      if (!privateKey || typeof privateKey !== "object" || typeof privateKey.deriveChild !== "function")
        throw new TypeError('"privateKey" expected Uint8Array or HDKey, got type=' + typeof privateKey);
    }
    this.checkInputIdx(idx);
    this.validatePrevoutsForSigning();
    const input = validateInput(this.inputs[idx], this.opts.disableScriptCheck);
    const inputType = getInputType(input, this.opts.allowLegacyWitnessUtxo);
    const canSign = (privateKey2) => {
      if (inputType.txType === "taproot") {
        const pubKey2 = pubSchnorr(privateKey2);
        if (input.tapInternalKey && equalBytes(pubKey2, input.tapInternalKey))
          return true;
        if (!input.tapLeafScript)
          return false;
        for (const [_, leaf] of input.tapLeafScript) {
          for (const op of Script.decode(leaf.subarray(0, -1))) {
            if (isBytes(op) && equalBytes(op, pubKey2))
              return true;
          }
        }
        return false;
      }
      const pubKey = pubECDSA(privateKey2);
      const pubKeyHash = hash160(pubKey);
      for (const op of Script.decode(inputType.lastScript)) {
        if (isBytes(op) && (equalBytes(op, pubKey) || equalBytes(op, pubKeyHash)))
          return true;
      }
      return false;
    };
    if (!isBytes(privateKey)) {
      const root = privateKey;
      const deriveSigners = (label, rows, pubKey) => {
        if (!rows || !rows.length)
          throw new Error(`${label}: empty`);
        const signers2 = rows.filter((row) => row.fingerprint == root.fingerprint).map((row) => {
          let s = root;
          for (const i of row.path)
            s = s.deriveChild(i);
          if (!equalBytes(pubKey(s), row.pubKey))
            throw new Error(`${label}: wrong pubKey`);
          if (!s.privateKey)
            throw new Error(`${label}: no privateKey`);
          return s;
        });
        if (!signers2.length)
          throw new Error(`${label}: no items with fingerprint=${root.fingerprint}`);
        return signers2;
      };
      const signers = inputType.txType === "taproot" ? (
        // BIP371 PSBT_IN_TAP_BIP32_DERIVATION stores x-only pubkeys plus `der`, so taproot HD
        // signing must derive against that map instead of legacy bip32Derivation.
        deriveSigners("tapBip32Derivation", (_a = input.tapBip32Derivation) == null ? void 0 : _a.map(([pubKey, { der }]) => ({
          pubKey,
          fingerprint: der.fingerprint,
          path: der.path
        })), (s) => s.publicKey.slice(1))
      ) : deriveSigners("bip32Derivation", (_b = input.bip32Derivation) == null ? void 0 : _b.map(([pubKey, der]) => ({
        pubKey,
        fingerprint: der.fingerprint,
        path: der.path
      })), (s) => s.publicKey);
      let signed = false;
      for (const s of signers) {
        if (!canSign(s.privateKey))
          continue;
        if (this.signIdx(s.privateKey, idx, allowedSighash, _auxRand))
          signed = true;
      }
      if (signed)
        return true;
      if (inputType.txType === "taproot")
        throw new Error("No taproot scripts signed");
      throw new Error(`Input script doesn't have pubKey: ${inputType.lastScript}`);
    }
    if (!allowedSighash)
      allowedSighash = [inputType.defaultSighash];
    else
      allowedSighash.forEach(validateSigHash);
    const sighash = inputType.sighash;
    if (!allowedSighash.includes(sighash)) {
      throw new Error(`Input with not allowed sigHash=${sighash}. Allowed: ${allowedSighash.join(", ")}`);
    }
    const { sigOutputs } = this.inputSighash(idx);
    if (sigOutputs === SignatureHash.SINGLE && idx >= this.outputs.length) {
      throw new Error(`Input with sighash SINGLE, but there is no output with corresponding index=${idx}`);
    }
    const prevOut = getPrevOut(input);
    if (inputType.txType === "taproot") {
      const prevOuts = this.inputs.map(getPrevOut);
      const prevOutScript = prevOuts.map((i) => i.script);
      const amount = prevOuts.map((i) => i.amount);
      let signed = false;
      let schnorrPub = pubSchnorr(privateKey);
      let merkleRoot = input.tapMerkleRoot || EMPTY;
      if (input.tapInternalKey) {
        const { pubKey, privKey } = getTaprootKeys(privateKey, schnorrPub, input.tapInternalKey, merkleRoot);
        const [taprootPubKey] = taprootTweakPubkey(input.tapInternalKey, merkleRoot);
        if (equalBytes(taprootPubKey, pubKey)) {
          const hash = this.preimageWitnessV1(idx, prevOutScript, sighash, amount);
          const sig = concatBytes(signSchnorr(hash, privKey, _auxRand), sighash !== SignatureHash.DEFAULT ? new Uint8Array([sighash]) : EMPTY);
          this.updateInput(idx, { tapKeySig: sig }, true);
          signed = true;
        }
      }
      if (input.tapLeafScript) {
        input.tapScriptSig = input.tapScriptSig || [];
        for (const [_, _script] of input.tapLeafScript) {
          const script = _script.subarray(0, -1);
          const scriptDecoded = Script.decode(script);
          const ver = _script[_script.length - 1];
          const hash = tapLeafHash(script, ver);
          const pos = scriptDecoded.findIndex((i) => isBytes(i) && equalBytes(i, schnorrPub));
          if (pos === -1)
            continue;
          const msg = this.preimageWitnessV1(idx, prevOutScript, sighash, amount, void 0, script, ver);
          const sig = concatBytes(signSchnorr(msg, privateKey, _auxRand), sighash !== SignatureHash.DEFAULT ? new Uint8Array([sighash]) : EMPTY);
          this.updateInput(idx, { tapScriptSig: [[{ pubKey: schnorrPub, leafHash: hash }, sig]] }, true);
          signed = true;
        }
      }
      if (!signed)
        throw new Error("No taproot scripts signed");
      return true;
    } else {
      const pubKey = pubECDSA(privateKey);
      let hasPubkey = false;
      const pubKeyHash = hash160(pubKey);
      for (const i of Script.decode(inputType.lastScript)) {
        if (isBytes(i) && (equalBytes(i, pubKey) || equalBytes(i, pubKeyHash)))
          hasPubkey = true;
      }
      if (!hasPubkey)
        throw new Error(`Input script doesn't have pubKey: ${inputType.lastScript}`);
      let hash;
      if (inputType.txType === "legacy") {
        hash = this.preimageLegacy(idx, inputType.lastScript, sighash);
      } else if (inputType.txType === "segwit") {
        let script = inputType.lastScript;
        if (inputType.last.type === "wpkh")
          script = OutScript.encode({ type: "pkh", hash: inputType.last.hash });
        hash = this.preimageWitnessV0(idx, script, sighash, prevOut.amount);
      } else
        throw new Error(`Transaction/sign: unknown tx type: ${inputType.txType}`);
      const sig = signECDSA(hash, privateKey, this.opts.lowR);
      this.updateInput(idx, {
        partialSig: [[pubKey, concatBytes(sig, new Uint8Array([sighash]))]]
      }, true);
    }
    return true;
  }
  // This is bad API. Will work if user creates and signs tx, but if
  // there is some complex workflow with exchanging PSBT and signing them,
  // then it is better to validate which output user signs. How could a better API look like?
  // Example: user adds input, sends to another party, then signs received input (mixer etc),
  // another user can add different input for same key and user will sign it.
  // Even worse: another user can add bip32 derivation, and spend money from different address.
  // Better api: signIdx
  sign(privateKey, allowedSighash, _auxRand) {
    this.validatePrevoutsForSigning();
    let num2 = 0;
    for (let i = 0; i < this.inputs.length; i++) {
      try {
        if (this.signIdx(privateKey, i, allowedSighash, _auxRand))
          num2++;
      } catch (e) {
      }
    }
    if (!num2)
      throw new Error("No inputs signed");
    return num2;
  }
  finalizeIdx(idx) {
    this.checkInputIdx(idx);
    if (this.fee < _0n)
      throw new Error("Outputs spends more than inputs amount");
    const input = this.inputs[idx];
    cleanExtensions(input, this.opts.unknown, this.opts.proprietary);
    cleanTxModifiable(this.global.txModifiable, this.opts.unknown);
    const inputType = getInputType(input, this.opts.allowLegacyWitnessUtxo);
    if (inputType.txType === "taproot") {
      if (input.tapKeySig)
        input.finalScriptWitness = [input.tapKeySig];
      else if (input.tapLeafScript && input.tapScriptSig) {
        const leafs = input.tapLeafScript.slice().sort((a, b) => TaprootControlBlock.encode(a[0]).length - TaprootControlBlock.encode(b[0]).length);
        let smallest;
        let smallestSize = Number.POSITIVE_INFINITY;
        let unsupported = false;
        for (const [cb, _script] of leafs) {
          const script = _script.slice(0, -1);
          const ver = _script[_script.length - 1];
          const outScript = OutScript.decode(script);
          const hash = tapLeafHash(script, ver);
          const scriptSig = input.tapScriptSig.filter((i) => equalBytes(i[0].leafHash, hash));
          let signatures = [];
          let witness2;
          if (outScript.type === "tr_ms") {
            const m = outScript.m;
            const pubkeys = outScript.pubkeys;
            let added = 0;
            for (const pub of pubkeys) {
              const sigIdx = scriptSig.findIndex((i) => equalBytes(i[0].pubKey, pub));
              if (added === m || sigIdx === -1) {
                signatures.push(EMPTY);
                continue;
              }
              signatures.push(scriptSig[sigIdx][1]);
              added++;
            }
            if (added !== m)
              continue;
          } else if (outScript.type === "tr_ns") {
            for (const pub of outScript.pubkeys) {
              const sigIdx = scriptSig.findIndex((i) => equalBytes(i[0].pubKey, pub));
              if (sigIdx === -1)
                continue;
              signatures.push(scriptSig[sigIdx][1]);
            }
            if (signatures.length !== outScript.pubkeys.length)
              continue;
          } else if (outScript.type === "unknown" && this.opts.allowUnknownInputs) {
            const scriptDecoded = Script.decode(script);
            signatures = scriptSig.map(([{ pubKey }, signature]) => {
              const pos = scriptDecoded.findIndex((i) => isBytes(i) && equalBytes(i, pubKey));
              if (pos === -1)
                throw new Error("finalize/taproot: cannot find position of pubkey in script");
              return { signature, pos };
            }).sort((a, b) => a.pos - b.pos).map((i) => i.signature);
            if (!signatures.length)
              continue;
          } else {
            const custom = this.opts.customScripts;
            let recognized = false;
            if (custom) {
              for (const c of custom) {
                if (!c.finalizeTaproot)
                  continue;
                const scriptDecoded = Script.decode(script);
                const csEncoded = c.encode(scriptDecoded);
                if (csEncoded === void 0)
                  continue;
                recognized = true;
                const finalized = c.finalizeTaproot(script, csEncoded, scriptSig);
                if (!finalized)
                  continue;
                witness2 = finalized.concat(TaprootControlBlock.encode(cb));
                break;
              }
            }
            if (!witness2 && !recognized && scriptSig.length)
              unsupported = true;
            if (!witness2)
              continue;
          }
          witness2 || (witness2 = signatures.reverse().concat([script, TaprootControlBlock.encode(cb)]));
          const size = RawWitness.encode(witness2).length;
          if (size >= smallestSize)
            continue;
          smallest = witness2;
          smallestSize = size;
        }
        if (!smallest && unsupported)
          throw new Error("Finalize: Unknown tapLeafScript");
        if (!smallest)
          throw new Error("finalize/taproot: empty witness");
        input.finalScriptWitness = smallest;
      } else
        throw new Error("finalize/taproot: unknown input");
      delete input.finalScriptSig;
      this.cleanFinalInput(input);
      return;
    }
    if (!input.partialSig || !input.partialSig.length)
      throw new Error("Not enough partial sign");
    let inputScript = EMPTY;
    let witness = [];
    if (inputType.last.type === "ms") {
      const m = inputType.last.m;
      const pubkeys = inputType.last.pubkeys;
      let signatures = [];
      for (const pub of pubkeys) {
        const sign = input.partialSig.find((s) => equalBytes(pub, s[0]));
        if (!sign)
          continue;
        signatures.push(sign[1]);
      }
      signatures = signatures.slice(0, m);
      if (signatures.length !== m) {
        throw new Error(`Multisig: wrong signatures count, m=${m} n=${pubkeys.length} signatures=${signatures.length}`);
      }
      inputScript = Script.encode([0, ...signatures]);
    } else if (inputType.last.type === "pk") {
      inputScript = Script.encode([input.partialSig[0][1]]);
    } else if (inputType.last.type === "pkh") {
      inputScript = Script.encode([input.partialSig[0][1], input.partialSig[0][0]]);
    } else if (inputType.last.type === "wpkh") {
      inputScript = EMPTY;
      witness = [input.partialSig[0][1], input.partialSig[0][0]];
    } else if (inputType.last.type === "unknown" && !this.opts.allowUnknownInputs)
      throw new Error("Unknown inputs not allowed");
    let finalScriptSig, finalScriptWitness;
    if (inputType.type.includes("wsh-")) {
      if (inputScript.length && inputType.lastScript.length) {
        witness = Script.decode(inputScript).map((i) => {
          if (i === 0)
            return EMPTY;
          if (isBytes(i))
            return i;
          throw new Error(`Wrong witness op=${i}`);
        });
      }
      witness = witness.concat(inputType.lastScript);
    }
    if (inputType.txType === "segwit")
      finalScriptWitness = witness;
    if (inputType.type.startsWith("sh-wsh-")) {
      finalScriptSig = Script.encode([Script.encode([0, sha256(inputType.lastScript)])]);
    } else if (inputType.type.startsWith("sh-")) {
      finalScriptSig = Script.encode([...Script.decode(inputScript), inputType.lastScript]);
    } else if (inputType.type.startsWith("wsh-")) ;
    else if (inputType.txType !== "segwit")
      finalScriptSig = inputScript;
    if (!finalScriptSig && !finalScriptWitness)
      throw new Error("Unknown error finalizing input");
    if (finalScriptSig)
      input.finalScriptSig = finalScriptSig;
    if (finalScriptWitness)
      input.finalScriptWitness = finalScriptWitness;
    this.cleanFinalInput(input);
  }
  finalize() {
    for (let i = 0; i < this.inputs.length; i++)
      this.finalizeIdx(i);
  }
  extract() {
    if (!this.isFinal)
      throw new Error("Transaction has unfinalized inputs");
    if (!this.outputs.length)
      throw new Error("Transaction has no outputs");
    if (this.fee < _0n)
      throw new Error("Outputs spends more than inputs amount");
    return this.toBytes(true, true);
  }
  combine(other) {
    if (!(other instanceof Transaction))
      throw new TypeError('"other" expected Transaction, got type=' + typeof other);
    const opts = this.opts;
    const PSBTVersion = Math.max(this.opts.PSBTVersion || 0, other.opts.PSBTVersion || 0);
    if (this.opts.version !== other.opts.version)
      throw new Error(`Transaction/combine: different version this=${this.opts.version} other=${other.opts.version}`);
    const thisV2 = this.isPSBTv2();
    const otherV2 = other.isPSBTv2();
    if (!thisV2 || !otherV2) {
      const thisLockTime = this.lockTime;
      const otherLockTime = other.lockTime;
      if (thisLockTime !== otherLockTime)
        throw new Error(`Transaction/combine: different lockTime this=${thisLockTime} other=${otherLockTime}`);
    }
    for (const k of ["inputs", "outputs"]) {
      if (this[k].length !== other[k].length) {
        throw new Error(`Transaction/combine: different ${k} length this=${this[k].length} other=${other[k].length}`);
      }
    }
    const unsignedTx = this.unsignedTx;
    if (!equalBytes(unsignedTx, other.unsignedTx))
      throw new Error(`Transaction/combine: different unsigned tx`);
    let txModifiable;
    if (thisV2 && otherV2) {
      const policy = (tx) => {
        if (tx.global.txModifiable !== void 0)
          return cleanTxModifiable(tx.global.txModifiable, opts.unknown);
        return opts.allowMissingTxModifiable ? tx.modifiable(true, opts.unknown) : 0;
      };
      const a = policy(this);
      const b = policy(other);
      if ((a & -8) !== (b & -8))
        throw new Error("Transaction/combine: conflicting unknown txModifiable flags");
      txModifiable = a & -8 | a & b & 3 | (a | b) & 4;
      if (txModifiable === 0 && this.global.txModifiable === void 0 && other.global.txModifiable === void 0 && !opts.allowMissingTxModifiable)
        txModifiable = void 0;
    } else if (thisV2)
      txModifiable = this.modifiable(opts.allowMissingTxModifiable, opts.unknown);
    else if (otherV2)
      txModifiable = other.modifiable(opts.allowMissingTxModifiable, opts.unknown);
    const thisGlobal = { ...this.global };
    const otherGlobal = { ...other.global };
    if (thisV2 !== otherV2) {
      if (!thisV2)
        delete thisGlobal.fallbackLocktime;
      if (!otherV2)
        delete otherGlobal.fallbackLocktime;
      if (!thisV2)
        delete thisGlobal.version;
      if (!otherV2)
        delete otherGlobal.version;
    }
    const fallbackLocktime = thisGlobal.fallbackLocktime !== void 0 ? thisGlobal.fallbackLocktime : otherGlobal.fallbackLocktime;
    delete thisGlobal.txModifiable;
    delete otherGlobal.txModifiable;
    delete thisGlobal.fallbackLocktime;
    delete otherGlobal.fallbackLocktime;
    const global = combineKeyMap(PSBTGlobal, thisGlobal, otherGlobal, opts.unknown, opts.proprietary);
    if (fallbackLocktime !== void 0)
      global.fallbackLocktime = fallbackLocktime;
    if (PSBTVersion)
      global.version = PSBTVersion;
    if (txModifiable === void 0)
      delete global.txModifiable;
    else
      global.txModifiable = txModifiable;
    let hasOpaqueFinalizedV0 = false;
    const inputs = this.inputs.map((current, i) => {
      var _a, _b;
      const currentFinal = this.inputStatus(i) === "finalized";
      const otherFinal = other.inputStatus(i) === "finalized";
      if (!thisV2 && currentFinal || !otherV2 && otherFinal)
        hasOpaqueFinalizedV0 = true;
      if (currentFinal && otherFinal) {
        for (const k of ["finalScriptSig", "finalScriptWitness"]) {
          const currentHas = !!((_a = this.inputs[i][k]) == null ? void 0 : _a.length);
          const otherHas = !!((_b = other.inputs[i][k]) == null ? void 0 : _b.length);
          if (currentHas !== otherHas)
            throw new Error(`Transaction/combine: different finalized field=${k} input=${i}`);
        }
      }
      const combined = combineKeyMap(PSBTInput, current, other.inputs[i], opts.unknown, opts.proprietary);
      if (currentFinal || otherFinal)
        cleanFinalInput(combined, opts.unknown, opts.proprietary);
      return cloneDeep(normalizeInput(combined, void 0, void 0, opts.disableScriptCheck, opts.unknown, opts.proprietary));
    });
    if (hasOpaqueFinalizedV0 && global.txModifiable !== void 0)
      global.txModifiable &= -4;
    const candidate = new Transaction({ ...opts, PSBTVersion });
    const outputs = this.outputs.map((current, i) => {
      const combined = combineKeyMap(PSBTOutput, current, other.outputs[i], opts.unknown, opts.proprietary);
      return cloneDeep(candidate.normalizeOutput(combined));
    });
    candidate.global = global;
    candidate.inputs = inputs;
    candidate.outputs = outputs;
    if ((!thisV2 || !otherV2) && candidate.isPSBTv2())
      candidate.global.txModifiable = candidate.txModifiable;
    if (!equalBytes(candidate.unsignedTx, unsignedTx))
      throw new Error("Transaction/combine: combined unsigned tx differs");
    this.global = candidate.global;
    this.inputs = candidate.inputs;
    this.outputs = candidate.outputs;
    return this;
  }
  clone() {
    return Transaction.fromPSBT(this.toPSBT(), this.opts);
  }
}
const BTC_MAINNET_DERIVE_PATH = "m/84'/0'/0'/0/0";
const BTC_TESTNET_DERIVE_PATH = "m/84'/1'/0'/0/0";
const BTC_MAINNET_API_BASE = process.env.BTC_API_BASE_URL ?? "https://mempool.space/api";
const BTC_TESTNET_API_BASE = process.env.BTC_TESTNET_API_BASE_URL ?? "https://mempool.space/testnet/api";
const BTC_MAINNET_CONFIG = {
  name: "Bitcoin",
  path: BTC_MAINNET_DERIVE_PATH,
  network: NETWORK,
  apiBase: BTC_MAINNET_API_BASE,
  explorerTxUrl: "https://mempool.space/tx/"
};
const BTC_TESTNET_CONFIG = {
  name: "Bitcoin Testnet",
  path: BTC_TESTNET_DERIVE_PATH,
  network: TEST_NETWORK,
  apiBase: BTC_TESTNET_API_BASE,
  explorerTxUrl: "https://mempool.space/testnet/tx/"
};
function getBtcNetworkConfig(network = getNetwork()) {
  return network === "mainnet" ? BTC_MAINNET_CONFIG : BTC_TESTNET_CONFIG;
}
const DUST_LIMIT = 546n;
const SATS_PER_BTC = 100000000n;
function deriveBtcAccount(mnemonic, network = getNetwork()) {
  const config = getBtcNetworkConfig(network);
  const seed = mnemonicToSeedSync_1(mnemonic.trim().toLowerCase());
  const child = HDKey.fromMasterSeed(seed).derive(config.path);
  if (!child.publicKey || !child.privateKey) {
    throw new Error(t("err.btcDeriveFailed"));
  }
  const payment = p2wpkh(child.publicKey, config.network);
  if (!payment.address) {
    throw new Error(t("err.btcAddressFailed"));
  }
  return {
    address: payment.address,
    path: config.path,
    network,
    publicKey: child.publicKey,
    privateKey: child.privateKey
  };
}
function isValidBtcAddress(address, network = getNetwork()) {
  try {
    Address(getBtcNetworkConfig(network).network).decode(address);
    return true;
  } catch {
    return false;
  }
}
function btcToSats(amount) {
  const trimmed = amount.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(t("err.amountFormat"));
  }
  const [intPart, fracPart = ""] = trimmed.split(".");
  const frac = `${fracPart}00000000`.slice(0, 8);
  return BigInt(intPart) * SATS_PER_BTC + BigInt(frac);
}
function satsToBtc(sats) {
  return Number(sats) / Number(SATS_PER_BTC);
}
async function apiGet(apiBase, path2) {
  const res = await fetch(`${apiBase}${path2}`);
  if (!res.ok) {
    throw new Error(t("err.btcApiFailed", { status: res.status, statusText: res.statusText }));
  }
  return await res.json();
}
async function fetchBtcBalance(address, network = getNetwork()) {
  const { apiBase } = getBtcNetworkConfig(network);
  const stats = await apiGet(apiBase, `/address/${address}`);
  const chain2 = stats.chain_stats.funded_txo_sum - stats.chain_stats.spent_txo_sum;
  const mempool = stats.mempool_stats.funded_txo_sum - stats.mempool_stats.spent_txo_sum;
  return satsToBtc(BigInt(chain2 + mempool));
}
async function fetchFeeRate(apiBase) {
  const fees = await apiGet(apiBase, "/v1/fees/recommended");
  return Math.max(1, fees.halfHourFee || fees.fastestFee || 1);
}
async function sendBtc(account, to, amount, network = account.network) {
  const config = getBtcNetworkConfig(network);
  const toAddress = to.trim();
  if (!isValidBtcAddress(toAddress, network)) {
    throw new Error(t("err.btcAddressInvalid"));
  }
  const sendSats = btcToSats(amount);
  if (sendSats <= 0n) {
    throw new Error(t("err.amountPositive"));
  }
  const payment = p2wpkh(account.publicKey, config.network);
  const feeRate = await fetchFeeRate(config.apiBase);
  const rawUtxos = await apiGet(config.apiBase, `/address/${account.address}/utxo`);
  if (rawUtxos.length === 0) {
    throw new Error(t("err.noUtxo"));
  }
  const utxos = rawUtxos.map((u) => ({ txid: u.txid, index: u.vout, value: BigInt(u.value) })).sort((a, b) => b.value > a.value ? 1 : b.value < a.value ? -1 : 0);
  const estimateVsize = (inCount, outCount) => 10 + inCount * 68 + outCount * 31;
  const selected = [];
  let total = 0n;
  for (const utxo of utxos) {
    selected.push(utxo);
    total += utxo.value;
    const feeWithChange = BigInt(Math.ceil(estimateVsize(selected.length, 2) * feeRate));
    if (total >= sendSats + feeWithChange) break;
  }
  const fee = BigInt(Math.ceil(estimateVsize(selected.length, 2) * feeRate));
  if (total < sendSats + fee) {
    throw new Error(t("err.insufficient"));
  }
  const change = total - sendSats - fee;
  const tx = new Transaction();
  for (const utxo of selected) {
    tx.addInput({
      txid: utxo.txid,
      index: utxo.index,
      witnessUtxo: { script: payment.script, amount: utxo.value }
    });
  }
  tx.addOutputAddress(toAddress, sendSats, config.network);
  if (change > DUST_LIMIT) {
    tx.addOutputAddress(account.address, change, config.network);
  }
  tx.sign(account.privateKey);
  tx.finalize();
  const res = await fetch(`${config.apiBase}/tx`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: tx.hex
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(t("err.broadcastFailed", { status: res.status, detail }).trim());
  }
  const txid = (await res.text()).trim();
  return txid || tx.id;
}
const SOL_DERIVE_PATH = "m/44'/501'/0'/0'";
const SOL_MAINNET_CONFIG = {
  name: "Solana",
  rpcUrl: process.env.SOL_RPC_URL ?? "https://solana-rpc.publicnode.com",
  explorerTxUrl: "https://explorer.solana.com/tx/"
};
const SOL_TESTNET_CONFIG = {
  name: "Solana Devnet",
  rpcUrl: process.env.SOL_DEVNET_RPC_URL ?? "https://api.devnet.solana.com",
  explorerTxUrl: "https://explorer.solana.com/tx/",
  explorerTxSuffix: "?cluster=devnet"
};
function getSolNetworkConfig(network = getNetwork()) {
  return network === "mainnet" ? SOL_MAINNET_CONFIG : SOL_TESTNET_CONFIG;
}
const LAMPORTS_PER_SOL_BI = 1000000000n;
const HARDENED = 2147483648;
function slip10Ed25519(seed, indices) {
  const I = require$$0$1.createHmac("sha512", Buffer.from("ed25519 seed")).update(seed).digest();
  let key = I.subarray(0, 32);
  let chainCode = I.subarray(32, 64);
  for (const index of indices) {
    const data = Buffer.concat([
      Buffer.from([0]),
      key,
      Buffer.from([
        index >>> 24 & 255,
        index >>> 16 & 255,
        index >>> 8 & 255,
        index & 255
      ])
    ]);
    const h = require$$0$1.createHmac("sha512", chainCode).update(data).digest();
    key = h.subarray(0, 32);
    chainCode = h.subarray(32, 64);
  }
  return Uint8Array.from(key);
}
function parsePath(path2) {
  return path2.replace(/^m\/?/, "").split("/").filter(Boolean).map((segment) => {
    const hardened = segment.endsWith("'");
    const index = Number(hardened ? segment.slice(0, -1) : segment);
    if (!Number.isInteger(index) || index < 0) {
      throw new Error(`非法的派生路径片段：${segment}`);
    }
    return hardened ? index + HARDENED : index;
  });
}
function deriveSolAccount(mnemonic) {
  const seed = mnemonicToSeedSync_1(mnemonic.trim().toLowerCase());
  const secretKey = slip10Ed25519(seed, parsePath(SOL_DERIVE_PATH));
  const keypair = web3_js.Keypair.fromSeed(secretKey);
  return {
    address: keypair.publicKey.toBase58(),
    path: SOL_DERIVE_PATH,
    secretKey
  };
}
function isValidSolAddress(address) {
  const trimmed = address.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  try {
    return new web3_js.PublicKey(trimmed).toBase58() === trimmed;
  } catch {
    return false;
  }
}
function solToLamports(amount) {
  const trimmed = amount.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(t("err.amountFormat"));
  }
  const [intPart, fracPart = ""] = trimmed.split(".");
  const frac = `${fracPart}000000000`.slice(0, 9);
  const lamports = BigInt(intPart) * LAMPORTS_PER_SOL_BI + BigInt(frac);
  if (lamports <= 0n) {
    throw new Error(t("err.amountPositive"));
  }
  return Number(lamports);
}
const connections = /* @__PURE__ */ new Map();
function getConnection(network = getNetwork()) {
  let connection = connections.get(network);
  if (!connection) {
    connection = new web3_js.Connection(getSolNetworkConfig(network).rpcUrl, "confirmed");
    connections.set(network, connection);
  }
  return connection;
}
function resetSolConnections() {
  connections.clear();
}
async function fetchSolBalance(address, network = getNetwork()) {
  const lamports = await getConnection(network).getBalance(new web3_js.PublicKey(address));
  return lamports / web3_js.LAMPORTS_PER_SOL;
}
async function sendSol(secretKey, to, amount, network = getNetwork()) {
  const toAddress = to.trim();
  if (!isValidSolAddress(toAddress)) {
    throw new Error(t("err.solAddressInvalid"));
  }
  const lamports = solToLamports(amount);
  const connectionInstance = getConnection(network);
  const keypair = web3_js.Keypair.fromSeed(secretKey);
  const fromPubkey = keypair.publicKey;
  const balance = await connectionInstance.getBalance(fromPubkey);
  if (balance < lamports) {
    throw new Error(t("err.insufficient"));
  }
  const { blockhash } = await connectionInstance.getLatestBlockhash("confirmed");
  const tx = new web3_js.Transaction().add(
    web3_js.SystemProgram.transfer({
      fromPubkey,
      toPubkey: new web3_js.PublicKey(toAddress),
      lamports
    })
  );
  tx.recentBlockhash = blockhash;
  tx.feePayer = fromPubkey;
  tx.sign(keypair);
  const signature = await connectionInstance.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
    maxRetries: 3
  });
  return signature;
}
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LENGTH = 32;
function resolveBtcAddress(account, network = getNetwork()) {
  if (network === "testnet") return account.btcTestnetAddress ?? account.btcAddress;
  return account.btcAddress;
}
let db;
const accountKey = (address) => `account:${address}`;
async function initDatabase() {
  const dbPath = path.join(electron.app.getPath("userData"), "hcoin-wallet-leveldb");
  db = new classicLevel.ClassicLevel(dbPath, {
    valueEncoding: "json",
    keyEncoding: "utf8"
  });
  try {
    await db.open();
  } catch (err) {
    const cause = err == null ? void 0 : err.cause;
    console.error("[db] 打开 LevelDB 失败:", err);
    if (cause) console.error("[db] 底层原因:", cause);
    throw err;
  }
  const legacyDemoAddress = "HC0xDEMO0001";
  if (await db.has(accountKey(legacyDemoAddress))) {
    await db.del(accountKey(legacyDemoAddress));
  }
  await migrateLegacyAddresses();
  await migrateLegacyChainBalances();
}
async function migrateLegacyChainBalances() {
  const pending = [];
  for await (const [key, account] of db.iterator()) {
    if (!key.startsWith("account:")) continue;
    if (account.chainBalances) continue;
    if (account.ethBalance === void 0 && account.tokenBalances === void 0) continue;
    pending.push({ key, account });
  }
  for (const { key, account } of pending) {
    const { ethBalance, tokenBalances, chainBalances, ...rest } = account;
    await db.put(key, {
      ...rest,
      chainBalances: chainBalances ?? {
        eth: { native: ethBalance ?? 0, tokens: tokenBalances ?? {} }
      }
    });
  }
  if (pending.length > 0) {
    console.log(`[db] 已迁移 ${pending.length} 个账户到多链余额结构`);
  }
}
async function migrateLegacyAddresses() {
  const legacy = [];
  for await (const [key, account] of db.iterator()) {
    if (key.startsWith("account:HC")) {
      legacy.push({ key, account });
    }
  }
  for (const { key, account } of legacy) {
    const nextAddress = account.address.startsWith("HC") ? account.address.slice(2) : account.address;
    await db.put(accountKey(nextAddress), { ...account, address: nextAddress });
    await db.del(key);
  }
  if (legacy.length > 0) {
    console.log(`[db] 已迁移 ${legacy.length} 个历史账户地址格式（去除 HC 前缀）`);
  }
}
function generateMnemonic() {
  return generateMnemonic_1(128);
}
function isValidMnemonic(mnemonic) {
  return validateMnemonic_1(mnemonic);
}
function deriveAddress(mnemonic) {
  return `0x${require$$0$1.createHash("sha256").update(mnemonic).digest("hex").slice(0, 8).toUpperCase()}`;
}
function encryptMnemonic(mnemonic, password) {
  const salt2 = require$$0$1.randomBytes(16);
  const key = require$$0$1.scryptSync(password, salt2, KEY_LENGTH, SCRYPT_PARAMS);
  const iv = require$$0$1.randomBytes(12);
  const cipher = require$$0$1.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(mnemonic, "utf8"), cipher.final()]);
  return {
    version: 1,
    algorithm: "aes-256-gcm",
    kdf: "scrypt",
    salt: salt2.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
    scrypt: SCRYPT_PARAMS
  };
}
async function createAccount(mnemonic, password) {
  if (!db || db.status !== "open") {
    throw new Error(t("err.dbNotReady"));
  }
  if (!isValidMnemonic(mnemonic)) {
    throw new Error(t("err.invalidMnemonic"));
  }
  if (!password) {
    throw new Error(t("err.passwordRequired"));
  }
  const address = deriveAddress(mnemonic);
  if (await db.has(accountKey(address))) {
    throw new Error(t("err.accountExists"));
  }
  const secret = encryptMnemonic(mnemonic, password);
  const eth = deriveEthAccount(mnemonic);
  const btcMainnet = deriveBtcAccount(mnemonic, "mainnet");
  const btcTestnet = deriveBtcAccount(mnemonic, "testnet");
  const sol = deriveSolAccount(mnemonic);
  await db.put(accountKey(address), {
    address,
    balance: 0,
    createdAt: Date.now(),
    chainBalances: {},
    secret,
    ethAddress: eth.address,
    ethPath: eth.path,
    btcAddress: btcMainnet.address,
    btcPath: btcMainnet.path,
    btcTestnetAddress: btcTestnet.address,
    btcTestnetPath: btcTestnet.path,
    solAddress: sol.address,
    solPath: sol.path
  });
  return {
    address,
    ethAddress: eth.address,
    btcAddress: getNetwork() === "mainnet" ? btcMainnet.address : btcTestnet.address,
    solAddress: sol.address
  };
}
async function listAccounts() {
  if (!db || db.status !== "open") {
    throw new Error(t("err.dbNotReady"));
  }
  const accounts = [];
  for await (const [key, account] of db.iterator()) {
    if (!key.startsWith("account:")) continue;
    accounts.push({
      address: account.address,
      createdAt: account.createdAt,
      hasSecret: Boolean(account.secret),
      ethAddress: account.ethAddress,
      btcAddress: account.btcAddress,
      btcTestnetAddress: account.btcTestnetAddress,
      solAddress: account.solAddress
    });
  }
  return accounts.sort((a, b) => a.createdAt - b.createdAt);
}
async function hasMnemonic() {
  if (!db || db.status !== "open") {
    throw new Error(t("err.dbNotReady"));
  }
  let first = null;
  for await (const [key, account] of db.iterator()) {
    if (!key.startsWith("account:")) continue;
    if (!account.secret) continue;
    if (!first || account.createdAt < first.createdAt) {
      first = { address: account.address, createdAt: account.createdAt };
    }
  }
  return { exists: Boolean(first), address: (first == null ? void 0 : first.address) ?? null };
}
async function unlockAccountWithSigner(address, password) {
  if (!db || db.status !== "open") {
    throw new Error(t("err.dbNotReady"));
  }
  if (!address) {
    throw new Error(t("err.selectUnlockAccount"));
  }
  const mnemonic = await decryptMnemonic(address, password);
  const account = await db.get(accountKey(address)).catch(() => null);
  if (!account) {
    throw new Error(t("err.accountNotFound"));
  }
  let updated = account;
  let ethAddress = account.ethAddress;
  if (!ethAddress) {
    const eth = deriveEthAccount(mnemonic);
    ethAddress = eth.address;
    updated = { ...updated, ethAddress, ethPath: eth.path };
  }
  let btcAddress = account.btcAddress;
  if (!btcAddress) {
    const btc = deriveBtcAccount(mnemonic, "mainnet");
    btcAddress = btc.address;
    updated = { ...updated, btcAddress, btcPath: btc.path };
  }
  let btcTestnetAddress = account.btcTestnetAddress;
  if (!btcTestnetAddress) {
    const btc = deriveBtcAccount(mnemonic, "testnet");
    btcTestnetAddress = btc.address;
    updated = { ...updated, btcTestnetAddress, btcTestnetPath: btc.path };
  }
  let solAddress = account.solAddress;
  if (!solAddress) {
    const sol = deriveSolAccount(mnemonic);
    solAddress = sol.address;
    updated = { ...updated, solAddress, solPath: sol.path };
  }
  if (updated !== account) {
    await db.put(accountKey(address), updated);
  }
  const currentBtcAddress = getNetwork() === "mainnet" ? btcAddress : btcTestnetAddress ?? btcAddress;
  return { result: { address, ethAddress, btcAddress: currentBtcAddress, solAddress }, mnemonic };
}
async function decryptMnemonic(address, password) {
  if (!db || db.status !== "open") {
    throw new Error(t("err.dbNotReady"));
  }
  if (!password) {
    throw new Error(t("err.passwordRequired"));
  }
  const account = await db.get(accountKey(address)).catch(() => null);
  if (!account) {
    throw new Error(t("err.accountNotFound"));
  }
  if (!account.secret) {
    throw new Error(t("err.noSecret"));
  }
  const { salt: salt2, iv, tag, ciphertext, scrypt: params } = account.secret;
  try {
    const key = require$$0$1.scryptSync(password, Buffer.from(salt2, "base64"), KEY_LENGTH, params);
    const decipher = require$$0$1.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertext, "base64")),
      decipher.final()
    ]).toString("utf8");
  } catch {
    throw new Error(t("err.wrongPassword"));
  }
}
async function queryBalance(address) {
  if (!db || db.status !== "open") {
    console.warn("[db] queryBalance 调用时数据库尚未就绪");
    return 0;
  }
  try {
    const account = await db.get(accountKey(address));
    return (account == null ? void 0 : account.balance) ?? 0;
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "LEVEL_NOT_FOUND") {
      return 0;
    }
    throw err;
  }
}
async function queryChainBalances(address) {
  if (!db || db.status !== "open") {
    console.warn("[db] queryChainBalances 调用时数据库尚未就绪");
    return {};
  }
  const account = await db.get(accountKey(address)).catch(() => null);
  return (account == null ? void 0 : account.chainBalances) ?? {};
}
async function setChainNativeBalance(address, chainKey, native) {
  if (!db || db.status !== "open") {
    console.warn("[db] setChainNativeBalance 调用时数据库尚未就绪");
    return;
  }
  const account = await db.get(accountKey(address)).catch(() => null);
  if (!account) return;
  const chainBalances = account.chainBalances ?? {};
  await db.put(accountKey(address), {
    ...account,
    chainBalances: {
      ...chainBalances,
      [chainKey]: { ...chainBalances[chainKey], native }
    }
  });
}
async function setChainTokenBalances(address, chainKey, balances) {
  if (!db || db.status !== "open") {
    console.warn("[db] setChainTokenBalances 调用时数据库尚未就绪");
    return;
  }
  const account = await db.get(accountKey(address)).catch(() => null);
  if (!account) return;
  const chainBalances = account.chainBalances ?? {};
  const chain2 = chainBalances[chainKey] ?? {};
  await db.put(accountKey(address), {
    ...account,
    chainBalances: {
      ...chainBalances,
      [chainKey]: { ...chain2, tokens: { ...chain2.tokens ?? {}, ...balances } }
    }
  });
}
async function closeDatabase() {
  if (db && db.status === "open") {
    await db.close();
  }
}
async function querySectionData(section) {
  if (!db || db.status !== "open") {
    console.warn("[db] querySectionData 调用时数据库尚未就绪");
    return [];
  }
  switch (section) {
    case "dashboard": {
      const rows = [];
      let total = 0;
      let count = 0;
      for await (const [key, account] of db.iterator()) {
        if (!key.startsWith("account:")) continue;
        total += account.balance;
        count += 1;
        rows.push({
          key,
          address: account.address,
          balance: account.balance.toFixed(2),
          createdAt: new Date(account.createdAt).toLocaleString()
        });
      }
      rows.push({
        key: "__summary__",
        address: t("about.totalAccounts", { count }),
        balance: total.toFixed(2),
        createdAt: "—"
      });
      return rows;
    }
    case "accounts": {
      const rows = [];
      for await (const [key, account] of db.iterator()) {
        if (!key.startsWith("account:")) continue;
        rows.push({
          key,
          address: account.address,
          balance: account.balance.toFixed(2),
          createdAt: new Date(account.createdAt).toLocaleString()
        });
      }
      return rows;
    }
    case "balance": {
      const rows = [];
      for await (const [key, account] of db.iterator()) {
        if (!key.startsWith("account:")) continue;
        rows.push({
          key,
          address: account.address,
          balance: account.balance.toFixed(2)
        });
      }
      return rows;
    }
    case "about": {
      const mainnet = getNetwork() === "mainnet";
      return [
        { key: "name", item: t("about.name"), value: "HCoinWallet" },
        {
          key: "net",
          item: t("about.network"),
          value: mainnet ? `${t("network.mainnet")} (${t("network.mainnetDesc")})` : `${t("network.testnet")} (${t("network.testnetDesc")})`
        },
        { key: "ver", item: t("about.version"), value: "v0.0.1" },
        { key: "db", item: t("about.storage"), value: "LevelDB (classic-level)" }
      ];
    }
    default:
      return [];
  }
}
const POLL_INTERVAL_MS = 15e3;
let timer = null;
let polling = false;
async function pollEthBalancesOnce() {
  if (polling) return;
  polling = true;
  try {
    const accounts = await listAccounts();
    const chains = getSupportedChains();
    await Promise.all(
      accounts.map(async (account) => {
        await Promise.all(
          chains.map(async (chain2) => {
            if (chain2.kind === "bitcoin") {
              const address2 = resolveBtcAddress(account);
              if (!address2) return;
              try {
                const balance = await fetchBtcBalance(address2);
                await setChainNativeBalance(account.address, chain2.key, balance);
              } catch (err) {
                console.error(
                  `[balance] 查询/写入 ${address2} ${chain2.nativeSymbol} 余额失败:`,
                  err
                );
              }
              return;
            }
            if (chain2.kind === "solana") {
              const address2 = account.solAddress;
              if (!address2) return;
              try {
                const balance = await fetchSolBalance(address2);
                await setChainNativeBalance(account.address, chain2.key, balance);
              } catch (err) {
                console.error(
                  `[balance] 查询/写入 ${address2} ${chain2.nativeSymbol} 余额失败:`,
                  err
                );
              }
              return;
            }
            const address = account.ethAddress;
            if (!address) return;
            const results = await Promise.allSettled([
              fetchNativeBalance(chain2.key, address),
              ...chain2.tokens.map(
                (token) => fetchChainTokenBalance(chain2.key, address, token.symbol)
              )
            ]);
            const [nativeResult, ...tokenResults] = results;
            if (nativeResult.status === "fulfilled") {
              await setChainNativeBalance(
                account.address,
                chain2.key,
                nativeResult.value
              ).catch(
                (err) => console.error(
                  `[balance] 写入 ${account.address} ${chain2.nativeSymbol} 余额失败:`,
                  err
                )
              );
            } else {
              console.error(
                `[balance] 查询 ${address} ${chain2.nativeSymbol} 余额失败:`,
                nativeResult.reason
              );
            }
            const tokenBalances = {};
            tokenResults.forEach((result, index) => {
              const token = chain2.tokens[index];
              if (result.status === "fulfilled") {
                tokenBalances[token.symbol] = result.value;
              } else {
                console.error(
                  `[balance] 查询 ${address} ${chain2.name}/${token.symbol} 余额失败:`,
                  result.reason
                );
              }
            });
            if (Object.keys(tokenBalances).length > 0) {
              await setChainTokenBalances(account.address, chain2.key, tokenBalances).catch(
                (err) => console.error(
                  `[balance] 写入 ${account.address} ${chain2.name} 代币余额失败:`,
                  err
                )
              );
            }
          })
        );
      })
    );
  } catch (err) {
    console.error("[balance] 轮询余额失败:", err);
  } finally {
    polling = false;
  }
}
function startEthBalancePolling() {
  if (timer) return;
  const network = getNetwork();
  const summary = getSupportedChains(network).map((c) => `${c.nativeSymbol}/${c.tokens.map((t2) => t2.symbol).join("/")}（${c.name}）`).join("、");
  console.log(`[balance] 启动余额轮询（${network === "mainnet" ? "主网" : "测试网"}）：${summary}`);
  void pollEthBalancesOnce();
  timer = setInterval(() => {
    void pollEthBalancesOnce();
  }, POLL_INTERVAL_MS);
}
function stopEthBalancePolling() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
let activeWallet = null;
function setActiveWallet(address, wallet, btc, sol) {
  activeWallet = { address, wallet, btc, sol };
}
function getActiveWallet() {
  return activeWallet;
}
function getActiveBtcAccount() {
  return activeWallet ? activeWallet.btc[getNetwork()] : null;
}
function clearActiveWallet() {
  activeWallet = null;
}
let mainWindow = null;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      // 安全：隔离上下文
      nodeIntegration: false
      // 安全：禁用渲染进程 Node
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
electron.app.whenReady().then(async () => {
  try {
    await initDatabase();
  } catch (err) {
    console.error("[main] 数据库初始化失败，应用将以只读/无数据方式继续运行:", err);
  }
  await loadLocale();
  const network = await loadNetwork();
  console.log(`[main] 当前网络环境：${network === "mainnet" ? "主网" : "测试网"}`);
  createWindow();
  startEthBalancePolling();
  electron.ipcMain.handle("wallet:getLocale", () => {
    return getLocale();
  });
  electron.ipcMain.handle("wallet:setLocale", async (_event, next) => {
    return setLocale(next);
  });
  electron.ipcMain.handle("wallet:getNetwork", () => {
    return getNetwork();
  });
  electron.ipcMain.handle("wallet:setNetwork", async (_event, next) => {
    const applied = await setNetwork(next);
    resetChainProviders();
    resetSolConnections();
    void pollEthBalancesOnce();
    const active = getActiveWallet();
    if (!active) return { network: applied, account: null };
    const btc = getActiveBtcAccount();
    const account = {
      address: active.address,
      ethAddress: active.wallet.address,
      btcAddress: (btc == null ? void 0 : btc.address) ?? "",
      solAddress: active.sol.address
    };
    return { network: applied, account };
  });
  electron.ipcMain.handle("wallet:getBalance", (_event, address) => {
    return queryBalance(address);
  });
  electron.ipcMain.handle("wallet:getChainBalances", (_event, address) => {
    return queryChainBalances(address);
  });
  electron.ipcMain.handle("wallet:getSectionData", (_event, section) => {
    return querySectionData(section);
  });
  electron.ipcMain.handle("wallet:generateMnemonic", () => {
    return generateMnemonic();
  });
  electron.ipcMain.handle("wallet:validateMnemonic", (_event, mnemonic) => {
    return isValidMnemonic(mnemonic);
  });
  electron.ipcMain.handle("wallet:createAccount", async (_event, mnemonic, password) => {
    const result = await createAccount(mnemonic, password);
    setActiveWallet(
      result.address,
      deriveWallet(mnemonic),
      { mainnet: deriveBtcAccount(mnemonic, "mainnet"), testnet: deriveBtcAccount(mnemonic, "testnet") },
      deriveSolAccount(mnemonic)
    );
    void pollEthBalancesOnce();
    return result;
  });
  electron.ipcMain.handle("wallet:listAccounts", () => {
    return listAccounts();
  });
  electron.ipcMain.handle("wallet:backupMnemonic", (_event, address, password) => {
    return decryptMnemonic(address, password);
  });
  electron.ipcMain.handle("wallet:hasMnemonic", () => {
    return hasMnemonic();
  });
  electron.ipcMain.handle("wallet:unlockWallet", async (_event, address, password) => {
    const { result, mnemonic } = await unlockAccountWithSigner(address, password);
    setActiveWallet(
      result.address,
      deriveWallet(mnemonic),
      { mainnet: deriveBtcAccount(mnemonic, "mainnet"), testnet: deriveBtcAccount(mnemonic, "testnet") },
      deriveSolAccount(mnemonic)
    );
    return result;
  });
  electron.ipcMain.handle("wallet:send", async (_event, params) => {
    const { address, chain: chainKey, asset, to, amount } = params ?? {};
    const active = getActiveWallet();
    if (!active) throw new Error(t("err.walletLocked"));
    if (active.address !== address) throw new Error(t("err.accountMismatch"));
    if (!(to == null ? void 0 : to.trim())) throw new Error(t("err.enterRecipient"));
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) throw new Error(t("err.amountPositive"));
    const chain2 = getChain(chainKey);
    let txHash;
    if (chain2.kind === "bitcoin") {
      if (asset !== chain2.nativeSymbol) {
        throw new Error(t("err.assetNotSupported", { name: chain2.name, asset }));
      }
      const btc = getActiveBtcAccount();
      if (!btc) throw new Error(t("err.walletLocked"));
      txHash = await sendBtc(btc, to.trim(), String(amount).trim());
    } else if (chain2.kind === "solana") {
      if (asset !== chain2.nativeSymbol) {
        throw new Error(t("err.assetNotSupported", { name: chain2.name, asset }));
      }
      txHash = await sendSol(active.sol.secretKey, to.trim(), String(amount).trim());
    } else {
      txHash = asset === chain2.nativeSymbol ? await sendNative(chainKey, active.wallet, to.trim(), String(amount).trim()) : await sendChainToken(chainKey, active.wallet, asset, to.trim(), String(amount).trim());
    }
    void pollEthBalancesOnce();
    return txHash;
  });
});
electron.app.on("window-all-closed", () => {
  electron.app.quit();
});
let isQuitting = false;
electron.app.on("before-quit", (event) => {
  if (isQuitting) return;
  event.preventDefault();
  isQuitting = true;
  stopEthBalancePolling();
  clearActiveWallet();
  closeDatabase().catch((err) => console.error("[main] 关闭数据库失败:", err)).finally(() => electron.app.quit());
});
