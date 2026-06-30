import { jsx } from "react/jsx-runtime";
import ReactDOMServer from "react-dom/server";
import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
async function resolvePageComponent(path, pages) {
  for (const p2 of Array.isArray(path) ? path : [path]) {
    const page = pages[p2];
    if (typeof page === "undefined") {
      continue;
    }
    return typeof page === "function" ? page() : page;
  }
  throw new Error(`Page not found: ${path}`);
}
function t() {
  return t = Object.assign ? Object.assign.bind() : function(t3) {
    for (var e2 = 1; e2 < arguments.length; e2++) {
      var o2 = arguments[e2];
      for (var n2 in o2) ({}).hasOwnProperty.call(o2, n2) && (t3[n2] = o2[n2]);
    }
    return t3;
  }, t.apply(null, arguments);
}
const e = String.prototype.replace, o = /%20/g, n = { RFC1738: function(t3) {
  return e.call(t3, o, "+");
}, RFC3986: function(t3) {
  return String(t3);
} };
var r = "RFC3986";
const i = Object.prototype.hasOwnProperty, s = Array.isArray, u = (function() {
  const t3 = [];
  for (let e2 = 0; e2 < 256; ++e2) t3.push("%" + ((e2 < 16 ? "0" : "") + e2.toString(16)).toUpperCase());
  return t3;
})(), l = function t2(e2, o2, n2) {
  if (!o2) return e2;
  if ("object" != typeof o2) {
    if (s(e2)) e2.push(o2);
    else {
      if (!e2 || "object" != typeof e2) return [e2, o2];
      (n2 && (n2.plainObjects || n2.allowPrototypes) || !i.call(Object.prototype, o2)) && (e2[o2] = true);
    }
    return e2;
  }
  if (!e2 || "object" != typeof e2) return [e2].concat(o2);
  let r2 = e2;
  return s(e2) && !s(o2) && (r2 = (function(t3, e3) {
    const o3 = e3 && e3.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
    for (let e4 = 0; e4 < t3.length; ++e4) void 0 !== t3[e4] && (o3[e4] = t3[e4]);
    return o3;
  })(e2, n2)), s(e2) && s(o2) ? (o2.forEach(function(o3, r3) {
    if (i.call(e2, r3)) {
      const i2 = e2[r3];
      i2 && "object" == typeof i2 && o3 && "object" == typeof o3 ? e2[r3] = t2(i2, o3, n2) : e2.push(o3);
    } else e2[r3] = o3;
  }), e2) : Object.keys(o2).reduce(function(e3, r3) {
    const s2 = o2[r3];
    return e3[r3] = i.call(e3, r3) ? t2(e3[r3], s2, n2) : s2, e3;
  }, r2);
}, c = 1024, a = function(t3, e2) {
  return [].concat(t3, e2);
}, f = function(t3, e2) {
  if (s(t3)) {
    const o2 = [];
    for (let n2 = 0; n2 < t3.length; n2 += 1) o2.push(e2(t3[n2]));
    return o2;
  }
  return e2(t3);
}, p = Object.prototype.hasOwnProperty, y = { brackets: function(t3) {
  return t3 + "[]";
}, comma: "comma", indices: function(t3, e2) {
  return t3 + "[" + e2 + "]";
}, repeat: function(t3) {
  return t3;
} }, d = Array.isArray, h = Array.prototype.push, b = function(t3, e2) {
  h.apply(t3, d(e2) ? e2 : [e2]);
}, m = Date.prototype.toISOString, g = { addQueryPrefix: false, allowDots: false, allowEmptyArrays: false, arrayFormat: "indices", charset: "utf-8", charsetSentinel: false, delimiter: "&", encode: true, encodeDotInKeys: false, encoder: function(t3, e2, o2, n2, r2) {
  if (0 === t3.length) return t3;
  let i2 = t3;
  if ("symbol" == typeof t3 ? i2 = Symbol.prototype.toString.call(t3) : "string" != typeof t3 && (i2 = String(t3)), "iso-8859-1" === o2) return escape(i2).replace(/%u[0-9a-f]{4}/gi, function(t4) {
    return "%26%23" + parseInt(t4.slice(2), 16) + "%3B";
  });
  let s2 = "";
  for (let t4 = 0; t4 < i2.length; t4 += c) {
    const e3 = i2.length >= c ? i2.slice(t4, t4 + c) : i2, o3 = [];
    for (let t5 = 0; t5 < e3.length; ++t5) {
      let n3 = e3.charCodeAt(t5);
      45 === n3 || 46 === n3 || 95 === n3 || 126 === n3 || n3 >= 48 && n3 <= 57 || n3 >= 65 && n3 <= 90 || n3 >= 97 && n3 <= 122 || "RFC1738" === r2 && (40 === n3 || 41 === n3) ? o3[o3.length] = e3.charAt(t5) : n3 < 128 ? o3[o3.length] = u[n3] : n3 < 2048 ? o3[o3.length] = u[192 | n3 >> 6] + u[128 | 63 & n3] : n3 < 55296 || n3 >= 57344 ? o3[o3.length] = u[224 | n3 >> 12] + u[128 | n3 >> 6 & 63] + u[128 | 63 & n3] : (t5 += 1, n3 = 65536 + ((1023 & n3) << 10 | 1023 & e3.charCodeAt(t5)), o3[o3.length] = u[240 | n3 >> 18] + u[128 | n3 >> 12 & 63] + u[128 | n3 >> 6 & 63] + u[128 | 63 & n3]);
    }
    s2 += o3.join("");
  }
  return s2;
}, encodeValuesOnly: false, format: r, formatter: n[r], indices: false, serializeDate: function(t3) {
  return m.call(t3);
}, skipNulls: false, strictNullHandling: false }, w = {}, v = function(t3, e2, o2, n2, r2, i2, s2, u2, l2, c2, a2, p2, y2, h2, m2, j2, $2, E2) {
  let O2 = t3, T2 = E2, R2 = 0, S2 = false;
  for (; void 0 !== (T2 = T2.get(w)) && !S2; ) {
    const e3 = T2.get(t3);
    if (R2 += 1, void 0 !== e3) {
      if (e3 === R2) throw new RangeError("Cyclic object value");
      S2 = true;
    }
    void 0 === T2.get(w) && (R2 = 0);
  }
  if ("function" == typeof c2 ? O2 = c2(e2, O2) : O2 instanceof Date ? O2 = y2(O2) : "comma" === o2 && d(O2) && (O2 = f(O2, function(t4) {
    return t4 instanceof Date ? y2(t4) : t4;
  })), null === O2) {
    if (i2) return l2 && !j2 ? l2(e2, g.encoder, $2, "key", h2) : e2;
    O2 = "";
  }
  if ("string" == typeof (I2 = O2) || "number" == typeof I2 || "boolean" == typeof I2 || "symbol" == typeof I2 || "bigint" == typeof I2 || (function(t4) {
    return !(!t4 || "object" != typeof t4 || !(t4.constructor && t4.constructor.isBuffer && t4.constructor.isBuffer(t4)));
  })(O2)) return l2 ? [m2(j2 ? e2 : l2(e2, g.encoder, $2, "key", h2)) + "=" + m2(l2(O2, g.encoder, $2, "value", h2))] : [m2(e2) + "=" + m2(String(O2))];
  var I2;
  const A2 = [];
  if (void 0 === O2) return A2;
  let D2;
  if ("comma" === o2 && d(O2)) j2 && l2 && (O2 = f(O2, l2)), D2 = [{ value: O2.length > 0 ? O2.join(",") || null : void 0 }];
  else if (d(c2)) D2 = c2;
  else {
    const t4 = Object.keys(O2);
    D2 = a2 ? t4.sort(a2) : t4;
  }
  const _ = u2 ? e2.replace(/\./g, "%2E") : e2, k = n2 && d(O2) && 1 === O2.length ? _ + "[]" : _;
  if (r2 && d(O2) && 0 === O2.length) return k + "[]";
  for (let e3 = 0; e3 < D2.length; ++e3) {
    const f2 = D2[e3], g2 = "object" == typeof f2 && void 0 !== f2.value ? f2.value : O2[f2];
    if (s2 && null === g2) continue;
    const T3 = p2 && u2 ? f2.replace(/\./g, "%2E") : f2, S3 = d(O2) ? "function" == typeof o2 ? o2(k, T3) : k : k + (p2 ? "." + T3 : "[" + T3 + "]");
    E2.set(t3, R2);
    const I3 = /* @__PURE__ */ new WeakMap();
    I3.set(w, E2), b(A2, v(g2, S3, o2, n2, r2, i2, s2, u2, "comma" === o2 && j2 && d(O2) ? null : l2, c2, a2, p2, y2, h2, m2, j2, $2, I3));
  }
  return A2;
}, j = Object.prototype.hasOwnProperty, $ = Array.isArray, E = { allowDots: false, allowEmptyArrays: false, allowPrototypes: false, allowSparse: false, arrayLimit: 20, charset: "utf-8", charsetSentinel: false, comma: false, decodeDotInKeys: false, decoder: function(t3, e2, o2) {
  const n2 = t3.replace(/\+/g, " ");
  if ("iso-8859-1" === o2) return n2.replace(/%[0-9a-f]{2}/gi, unescape);
  try {
    return decodeURIComponent(n2);
  } catch (t4) {
    return n2;
  }
}, delimiter: "&", depth: 5, duplicates: "combine", ignoreQueryPrefix: false, interpretNumericEntities: false, parameterLimit: 1e3, parseArrays: true, plainObjects: false, strictNullHandling: false }, O = function(t3) {
  return t3.replace(/&#(\d+);/g, function(t4, e2) {
    return String.fromCharCode(parseInt(e2, 10));
  });
}, T = function(t3, e2) {
  return t3 && "string" == typeof t3 && e2.comma && t3.indexOf(",") > -1 ? t3.split(",") : t3;
}, R = function(t3, e2, o2, n2) {
  if (!t3) return;
  const r2 = o2.allowDots ? t3.replace(/\.([^.[]+)/g, "[$1]") : t3, i2 = /(\[[^[\]]*])/g;
  let s2 = o2.depth > 0 && /(\[[^[\]]*])/.exec(r2);
  const u2 = s2 ? r2.slice(0, s2.index) : r2, l2 = [];
  if (u2) {
    if (!o2.plainObjects && j.call(Object.prototype, u2) && !o2.allowPrototypes) return;
    l2.push(u2);
  }
  let c2 = 0;
  for (; o2.depth > 0 && null !== (s2 = i2.exec(r2)) && c2 < o2.depth; ) {
    if (c2 += 1, !o2.plainObjects && j.call(Object.prototype, s2[1].slice(1, -1)) && !o2.allowPrototypes) return;
    l2.push(s2[1]);
  }
  return s2 && l2.push("[" + r2.slice(s2.index) + "]"), (function(t4, e3, o3, n3) {
    let r3 = n3 ? e3 : T(e3, o3);
    for (let e4 = t4.length - 1; e4 >= 0; --e4) {
      let n4;
      const i3 = t4[e4];
      if ("[]" === i3 && o3.parseArrays) n4 = o3.allowEmptyArrays && "" === r3 ? [] : [].concat(r3);
      else {
        n4 = o3.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
        const t5 = "[" === i3.charAt(0) && "]" === i3.charAt(i3.length - 1) ? i3.slice(1, -1) : i3, e5 = o3.decodeDotInKeys ? t5.replace(/%2E/g, ".") : t5, s3 = parseInt(e5, 10);
        o3.parseArrays || "" !== e5 ? !isNaN(s3) && i3 !== e5 && String(s3) === e5 && s3 >= 0 && o3.parseArrays && s3 <= o3.arrayLimit ? (n4 = [], n4[s3] = r3) : "__proto__" !== e5 && (n4[e5] = r3) : n4 = { 0: r3 };
      }
      r3 = n4;
    }
    return r3;
  })(l2, e2, o2, n2);
};
function S(t3, e2) {
  const o2 = /* @__PURE__ */ (function(t4) {
    return E;
  })();
  if ("" === t3 || null == t3) return o2.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
  const n2 = "string" == typeof t3 ? (function(t4, e3) {
    const o3 = { __proto__: null }, n3 = (e3.ignoreQueryPrefix ? t4.replace(/^\?/, "") : t4).split(e3.delimiter, Infinity === e3.parameterLimit ? void 0 : e3.parameterLimit);
    let r3, i3 = -1, s2 = e3.charset;
    if (e3.charsetSentinel) for (r3 = 0; r3 < n3.length; ++r3) 0 === n3[r3].indexOf("utf8=") && ("utf8=%E2%9C%93" === n3[r3] ? s2 = "utf-8" : "utf8=%26%2310003%3B" === n3[r3] && (s2 = "iso-8859-1"), i3 = r3, r3 = n3.length);
    for (r3 = 0; r3 < n3.length; ++r3) {
      if (r3 === i3) continue;
      const t5 = n3[r3], u2 = t5.indexOf("]="), l2 = -1 === u2 ? t5.indexOf("=") : u2 + 1;
      let c2, p2;
      -1 === l2 ? (c2 = e3.decoder(t5, E.decoder, s2, "key"), p2 = e3.strictNullHandling ? null : "") : (c2 = e3.decoder(t5.slice(0, l2), E.decoder, s2, "key"), p2 = f(T(t5.slice(l2 + 1), e3), function(t6) {
        return e3.decoder(t6, E.decoder, s2, "value");
      })), p2 && e3.interpretNumericEntities && "iso-8859-1" === s2 && (p2 = O(p2)), t5.indexOf("[]=") > -1 && (p2 = $(p2) ? [p2] : p2);
      const y2 = j.call(o3, c2);
      y2 && "combine" === e3.duplicates ? o3[c2] = a(o3[c2], p2) : y2 && "last" !== e3.duplicates || (o3[c2] = p2);
    }
    return o3;
  })(t3, o2) : t3;
  let r2 = o2.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
  const i2 = Object.keys(n2);
  for (let e3 = 0; e3 < i2.length; ++e3) {
    const s2 = i2[e3], u2 = R(s2, n2[s2], o2, "string" == typeof t3);
    r2 = l(r2, u2, o2);
  }
  return true === o2.allowSparse ? r2 : (function(t4) {
    const e3 = [{ obj: { o: t4 }, prop: "o" }], o3 = [];
    for (let t5 = 0; t5 < e3.length; ++t5) {
      const n3 = e3[t5], r3 = n3.obj[n3.prop], i3 = Object.keys(r3);
      for (let t6 = 0; t6 < i3.length; ++t6) {
        const n4 = i3[t6], s2 = r3[n4];
        "object" == typeof s2 && null !== s2 && -1 === o3.indexOf(s2) && (e3.push({ obj: r3, prop: n4 }), o3.push(s2));
      }
    }
    return (function(t5) {
      for (; t5.length > 1; ) {
        const e4 = t5.pop(), o4 = e4.obj[e4.prop];
        if (s(o4)) {
          const t6 = [];
          for (let e5 = 0; e5 < o4.length; ++e5) void 0 !== o4[e5] && t6.push(o4[e5]);
          e4.obj[e4.prop] = t6;
        }
      }
    })(e3), t4;
  })(r2);
}
class I {
  constructor(t3, e2, o2) {
    var n2, r2;
    this.name = t3, this.definition = e2, this.bindings = null != (n2 = e2.bindings) ? n2 : {}, this.wheres = null != (r2 = e2.wheres) ? r2 : {}, this.config = o2;
  }
  get template() {
    const t3 = `${this.origin}/${this.definition.uri}`.replace(/\/+$/, "");
    return "" === t3 ? "/" : t3;
  }
  get origin() {
    return this.config.absolute ? this.definition.domain ? `${this.config.url.match(/^\w+:\/\//)[0]}${this.definition.domain}${this.config.port ? `:${this.config.port}` : ""}` : this.config.url : "";
  }
  get parameterSegments() {
    var t3, e2;
    return null != (t3 = null == (e2 = this.template.match(/{[^}?]+\??}/g)) ? void 0 : e2.map((t4) => ({ name: t4.replace(/{|\??}/g, ""), required: !/\?}$/.test(t4) }))) ? t3 : [];
  }
  matchesUrl(t3) {
    var e2;
    if (!this.definition.methods.includes("GET")) return false;
    const o2 = this.template.replace(/[.*+$()[\]]/g, "\\$&").replace(/(\/?){([^}?]*)(\??)}/g, (t4, e3, o3, n3) => {
      var r3;
      const i3 = `(?<${o3}>${(null == (r3 = this.wheres[o3]) ? void 0 : r3.replace(/(^\^)|(\$$)/g, "")) || "[^/?]+"})`;
      return n3 ? `(${e3}${i3})?` : `${e3}${i3}`;
    }).replace(/^\w+:\/\//, ""), [n2, r2] = t3.replace(/^\w+:\/\//, "").split("?"), i2 = null != (e2 = new RegExp(`^${o2}/?$`).exec(n2)) ? e2 : new RegExp(`^${o2}/?$`).exec(decodeURI(n2));
    if (i2) {
      for (const t4 in i2.groups) i2.groups[t4] = "string" == typeof i2.groups[t4] ? decodeURIComponent(i2.groups[t4]) : i2.groups[t4];
      return { params: i2.groups, query: S(r2) };
    }
    return false;
  }
  compile(t3) {
    return this.parameterSegments.length ? this.template.replace(/{([^}?]+)(\??)}/g, (e2, o2, n2) => {
      var r2, i2;
      if (!n2 && [null, void 0].includes(t3[o2])) throw new Error(`Ziggy error: '${o2}' parameter is required for route '${this.name}'.`);
      if (this.wheres[o2] && !new RegExp(`^${n2 ? `(${this.wheres[o2]})?` : this.wheres[o2]}$`).test(null != (i2 = t3[o2]) ? i2 : "")) throw new Error(`Ziggy error: '${o2}' parameter '${t3[o2]}' does not match required format '${this.wheres[o2]}' for route '${this.name}'.`);
      return encodeURI(null != (r2 = t3[o2]) ? r2 : "").replace(/%7C/g, "|").replace(/%25/g, "%").replace(/\$/g, "%24");
    }).replace(this.config.absolute ? /(\.[^/]+?)(\/\/)/ : /(^)(\/\/)/, "$1/").replace(/\/+$/, "") : this.template;
  }
}
class A extends String {
  constructor(e2, o2, n2 = true, r2) {
    if (super(), this.t = null != r2 ? r2 : "undefined" != typeof Ziggy ? Ziggy : null == globalThis ? void 0 : globalThis.Ziggy, !this.t && "undefined" != typeof document && document.getElementById("ziggy-routes-json") && (globalThis.Ziggy = JSON.parse(document.getElementById("ziggy-routes-json").textContent), this.t = globalThis.Ziggy), this.t = t({}, this.t, { absolute: n2 }), e2) {
      if (!this.t.routes[e2]) throw new Error(`Ziggy error: route '${e2}' is not in the route list.`);
      this.i = new I(e2, this.t.routes[e2], this.t), this.u = this.l(o2);
    }
  }
  toString() {
    const e2 = Object.keys(this.u).filter((t3) => !this.i.parameterSegments.some(({ name: e3 }) => e3 === t3)).filter((t3) => "_query" !== t3).reduce((e3, o2) => t({}, e3, { [o2]: this.u[o2] }), {});
    return this.i.compile(this.u) + (function(t3, e3) {
      let o2 = t3;
      const i2 = (function(t4) {
        if (!t4) return g;
        if (void 0 !== t4.allowEmptyArrays && "boolean" != typeof t4.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
        if (void 0 !== t4.encodeDotInKeys && "boolean" != typeof t4.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
        if (null != t4.encoder && "function" != typeof t4.encoder) throw new TypeError("Encoder has to be a function.");
        const e4 = t4.charset || g.charset;
        if (void 0 !== t4.charset && "utf-8" !== t4.charset && "iso-8859-1" !== t4.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
        let o3 = r;
        if (void 0 !== t4.format) {
          if (!p.call(n, t4.format)) throw new TypeError("Unknown format option provided.");
          o3 = t4.format;
        }
        const i3 = n[o3];
        let s3, u3 = g.filter;
        if (("function" == typeof t4.filter || d(t4.filter)) && (u3 = t4.filter), s3 = t4.arrayFormat in y ? t4.arrayFormat : "indices" in t4 ? t4.indices ? "indices" : "repeat" : g.arrayFormat, "commaRoundTrip" in t4 && "boolean" != typeof t4.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
        return { addQueryPrefix: "boolean" == typeof t4.addQueryPrefix ? t4.addQueryPrefix : g.addQueryPrefix, allowDots: void 0 === t4.allowDots ? true === t4.encodeDotInKeys || g.allowDots : !!t4.allowDots, allowEmptyArrays: "boolean" == typeof t4.allowEmptyArrays ? !!t4.allowEmptyArrays : g.allowEmptyArrays, arrayFormat: s3, charset: e4, charsetSentinel: "boolean" == typeof t4.charsetSentinel ? t4.charsetSentinel : g.charsetSentinel, commaRoundTrip: t4.commaRoundTrip, delimiter: void 0 === t4.delimiter ? g.delimiter : t4.delimiter, encode: "boolean" == typeof t4.encode ? t4.encode : g.encode, encodeDotInKeys: "boolean" == typeof t4.encodeDotInKeys ? t4.encodeDotInKeys : g.encodeDotInKeys, encoder: "function" == typeof t4.encoder ? t4.encoder : g.encoder, encodeValuesOnly: "boolean" == typeof t4.encodeValuesOnly ? t4.encodeValuesOnly : g.encodeValuesOnly, filter: u3, format: o3, formatter: i3, serializeDate: "function" == typeof t4.serializeDate ? t4.serializeDate : g.serializeDate, skipNulls: "boolean" == typeof t4.skipNulls ? t4.skipNulls : g.skipNulls, sort: "function" == typeof t4.sort ? t4.sort : null, strictNullHandling: "boolean" == typeof t4.strictNullHandling ? t4.strictNullHandling : g.strictNullHandling };
      })(e3);
      let s2, u2;
      "function" == typeof i2.filter ? (u2 = i2.filter, o2 = u2("", o2)) : d(i2.filter) && (u2 = i2.filter, s2 = u2);
      const l2 = [];
      if ("object" != typeof o2 || null === o2) return "";
      const c2 = y[i2.arrayFormat], a2 = "comma" === c2 && i2.commaRoundTrip;
      s2 || (s2 = Object.keys(o2)), i2.sort && s2.sort(i2.sort);
      const f2 = /* @__PURE__ */ new WeakMap();
      for (let t4 = 0; t4 < s2.length; ++t4) {
        const e4 = s2[t4];
        i2.skipNulls && null === o2[e4] || b(l2, v(o2[e4], e4, c2, a2, i2.allowEmptyArrays, i2.strictNullHandling, i2.skipNulls, i2.encodeDotInKeys, i2.encode ? i2.encoder : null, i2.filter, i2.sort, i2.allowDots, i2.serializeDate, i2.format, i2.formatter, i2.encodeValuesOnly, i2.charset, f2));
      }
      const h2 = l2.join(i2.delimiter);
      let m2 = true === i2.addQueryPrefix ? "?" : "";
      return i2.charsetSentinel && (m2 += "iso-8859-1" === i2.charset ? "utf8=%26%2310003%3B&" : "utf8=%E2%9C%93&"), h2.length > 0 ? m2 + h2 : "";
    })(t({}, e2, this.u._query), { addQueryPrefix: true, arrayFormat: "indices", encodeValuesOnly: true, skipNulls: true, encoder: (t3, e3) => "boolean" == typeof t3 ? Number(t3) : e3(t3) });
  }
  p(e2) {
    e2 ? this.t.absolute && e2.startsWith("/") && (e2 = this.h().host + e2) : e2 = this.m();
    let o2 = {};
    const [n2, r2] = Object.entries(this.t.routes).find(([t3, n3]) => o2 = new I(t3, n3, this.t).matchesUrl(e2)) || [void 0, void 0];
    return t({ name: n2 }, o2, { route: r2 });
  }
  m() {
    const { host: t3, pathname: e2, search: o2 } = this.h();
    return (this.t.absolute ? t3 + e2 : e2.replace(this.t.url.replace(/^\w*:\/\/[^/]+/, ""), "").replace(/^\/+/, "/")) + o2;
  }
  current(e2, o2) {
    const { name: n2, params: r2, query: i2, route: s2 } = this.p();
    if (!e2) return n2;
    const u2 = new RegExp(`^${e2.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`).test(n2);
    if ([null, void 0].includes(o2) || !u2) return u2;
    const l2 = new I(n2, s2, this.t);
    o2 = this.l(o2, l2);
    const c2 = t({}, r2, i2);
    if (Object.values(o2).every((t3) => !t3) && !Object.values(c2).some((t3) => void 0 !== t3)) return true;
    const a2 = (t3, e3) => Object.entries(t3).every(([t4, o3]) => Array.isArray(o3) && Array.isArray(e3[t4]) ? o3.every((o4) => e3[t4].includes(o4) || e3[t4].includes(decodeURIComponent(o4))) : "object" == typeof o3 && "object" == typeof e3[t4] && null !== o3 && null !== e3[t4] ? a2(o3, e3[t4]) : e3[t4] == o3 || e3[t4] == decodeURIComponent(o3));
    return a2(o2, c2);
  }
  h() {
    var t3, e2, o2, n2, r2, i2;
    const { host: s2 = "", pathname: u2 = "", search: l2 = "" } = "undefined" != typeof window ? window.location : {};
    return { host: null != (t3 = null == (e2 = this.t.location) ? void 0 : e2.host) ? t3 : s2, pathname: null != (o2 = null == (n2 = this.t.location) ? void 0 : n2.pathname) ? o2 : u2, search: null != (r2 = null == (i2 = this.t.location) ? void 0 : i2.search) ? r2 : l2 };
  }
  get params() {
    const { params: e2, query: o2 } = this.p();
    return t({}, e2, o2);
  }
  get routeParams() {
    return this.p().params;
  }
  get queryParams() {
    return this.p().query;
  }
  has(t3) {
    return this.t.routes.hasOwnProperty(t3);
  }
  l(e2 = {}, o2 = this.i) {
    null != e2 || (e2 = {}), e2 = ["string", "number"].includes(typeof e2) ? [e2] : e2;
    const n2 = o2.parameterSegments.filter(({ name: t3 }) => !this.t.defaults[t3]);
    return Array.isArray(e2) ? e2 = e2.reduce((e3, o3, r2) => t({}, e3, n2[r2] ? { [n2[r2].name]: o3 } : "object" == typeof o3 ? o3 : { [o3]: "" }), {}) : 1 !== n2.length || e2[n2[0].name] || !e2.hasOwnProperty(Object.values(o2.bindings)[0]) && !e2.hasOwnProperty("id") || (e2 = { [n2[0].name]: e2 }), t({}, this.v(o2), this.j(e2, o2));
  }
  v(e2) {
    return e2.parameterSegments.filter(({ name: t3 }) => this.t.defaults[t3]).reduce((e3, { name: o2 }, n2) => t({}, e3, { [o2]: this.t.defaults[o2] }), {});
  }
  j(e2, { bindings: o2, parameterSegments: n2 }) {
    return Object.entries(e2).reduce((e3, [r2, i2]) => {
      if (!i2 || "object" != typeof i2 || Array.isArray(i2) || !n2.some(({ name: t3 }) => t3 === r2)) return t({}, e3, { [r2]: i2 });
      if (!i2.hasOwnProperty(o2[r2])) {
        if (!i2.hasOwnProperty("id")) throw new Error(`Ziggy error: object passed as '${r2}' parameter is missing route model binding key '${o2[r2]}'.`);
        o2[r2] = "id";
      }
      return t({}, e3, { [r2]: i2[o2[r2]] });
    }, {});
  }
  valueOf() {
    return this.toString();
  }
}
function D(t3, e2, o2, n2) {
  const r2 = new A(t3, e2, o2, n2);
  return t3 ? r2.toString() : r2;
}
const appName = "RFT Admin Systems";
createServer(
  (page) => createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, /* @__PURE__ */ Object.assign({ "./Pages/Admin/Account/Create.jsx": () => import("./assets/Create-DGDtwp2t.js"), "./Pages/Admin/Account/Edit.jsx": () => import("./assets/Edit-BRyy8yxn.js"), "./Pages/Admin/Account/Index.jsx": () => import("./assets/Index-BPqxHanF.js"), "./Pages/Admin/AccountingAccount/Create.jsx": () => import("./assets/Create-B6hHaTsx.js"), "./Pages/Admin/AccountingAccount/Edit.jsx": () => import("./assets/Edit-BJyxdFiD.js"), "./Pages/Admin/AccountingAccount/Index.jsx": () => import("./assets/Index-D9s03o-j.js"), "./Pages/Admin/AccountingAccount/IvaAccounts.jsx": () => import("./assets/IvaAccounts-DUIm6FAr.js"), "./Pages/Admin/AccountingAccountType/Create.jsx": () => import("./assets/Create-B0yjrGA1.js"), "./Pages/Admin/AccountingAccountType/Edit.jsx": () => import("./assets/Edit-MeJP7UOH.js"), "./Pages/Admin/AccountingAccountType/Index.jsx": () => import("./assets/Index-DjX3EEFr.js"), "./Pages/Admin/AccountingAccountType/Show.jsx": () => import("./assets/Show-Dr1F-XTV.js").then((n2) => n2.S), "./Pages/Admin/Bank/Create.jsx": () => import("./assets/Create-B4nAxbuo.js"), "./Pages/Admin/Bank/Edit.jsx": () => import("./assets/Edit-CM6dOyaK.js"), "./Pages/Admin/Bank/Index.jsx": () => import("./assets/Index-C38OLjB2.js"), "./Pages/Admin/BankAccount/Create.jsx": () => import("./assets/Create-CPfZA3KI.js"), "./Pages/Admin/BankAccount/Edit.jsx": () => import("./assets/Edit-BuFDCfL5.js"), "./Pages/Admin/BankAccount/Index.jsx": () => import("./assets/Index-BPrW2Flv.js"), "./Pages/Admin/BusinessArea/Create.jsx": () => import("./assets/Create-C8-bAL84.js"), "./Pages/Admin/BusinessArea/Edit.jsx": () => import("./assets/Edit-CGGOBpiq.js"), "./Pages/Admin/BusinessArea/Index.jsx": () => import("./assets/Index-BI8ox2FC.js"), "./Pages/Admin/Category/Index.jsx": () => import("./assets/Index-DsREkUWF.js"), "./Pages/Admin/Category/Upsert.jsx": () => import("./assets/Upsert-BXEQdlgU.js"), "./Pages/Admin/Company/Comfort.jsx": () => import("./assets/Comfort-YF1Im1gA.js"), "./Pages/Admin/Company/Create.jsx": () => import("./assets/Create-BM92zl_A.js"), "./Pages/Admin/Company/Edit.jsx": () => import("./assets/Edit-BpeNkMIN.js"), "./Pages/Admin/Company/Index.jsx": () => import("./assets/Index-D-NHmkI-.js"), "./Pages/Admin/Company/Partials/CompanyInfoTab.jsx": () => import("./assets/CompanyInfoTab-DPuXbufB.js"), "./Pages/Admin/Company/Partials/CompanyNotes.jsx": () => import("./assets/CompanyNotes-CVsKedof.js"), "./Pages/Admin/Company/Partials/CompanyShowView.jsx": () => import("./assets/CompanyShowView-CP70sb9s.js"), "./Pages/Admin/Company/Partials/CompanyUsersTab.jsx": () => import("./assets/CompanyUsersTab-BHE6uVis.js"), "./Pages/Admin/Company/Partials/CompanyUsersTab_old.jsx": () => import("./assets/CompanyUsersTab_old-DBWcVDkX.js"), "./Pages/Admin/Company/Sectors.jsx": () => import("./assets/Sectors-BOKFYOz3.js"), "./Pages/Admin/Company/Show.jsx": () => import("./assets/Show-Dr1F-XTV.js").then((n2) => n2.a), "./Pages/Admin/CompanyAccount/Create.jsx": () => import("./assets/Create-B-HXcyTW.js"), "./Pages/Admin/CompanyAccount/Index.jsx": () => import("./assets/Index-t3-KVOBJ.js"), "./Pages/Admin/CompanyModule/Index.jsx": () => import("./assets/Index-RwlGIqI3.js"), "./Pages/Admin/CompanySetting/Index.jsx": () => import("./assets/Index-PfF3M5UU.js"), "./Pages/Admin/Content/Create.jsx": () => import("./assets/Create-BtzFUFEF.js"), "./Pages/Admin/Content/Edit.jsx": () => import("./assets/Edit-YEWAn211.js"), "./Pages/Admin/Content/Index.jsx": () => import("./assets/Index-CsrU68zN.js"), "./Pages/Admin/CostCenter/Create.jsx": () => import("./assets/Create-a4pHWW-u.js"), "./Pages/Admin/CostCenter/Edit.jsx": () => import("./assets/Edit-JmAJZWbl.js"), "./Pages/Admin/CostCenter/Index.jsx": () => import("./assets/Index-DiogOo3c.js"), "./Pages/Admin/Country/Create.jsx": () => import("./assets/Create-D3mngE8k.js"), "./Pages/Admin/Country/Edit.jsx": () => import("./assets/Edit-CRsqWBAs.js"), "./Pages/Admin/Country/Index.jsx": () => import("./assets/Index-CXf0ScBj.js"), "./Pages/Admin/Crm/Index.jsx": () => import("./assets/Show-Dr1F-XTV.js").then((n2) => n2.I), "./Pages/Admin/CrmAccount/Create.jsx": () => import("./assets/Create-DKgAQ7lu.js"), "./Pages/Admin/CrmAccount/Index.jsx": () => import("./assets/Index-B4miJXUU.js"), "./Pages/Admin/CrmAccount/Partials/CrmAccountAddressTab.jsx": () => import("./assets/CrmAccountAddressTab-CUiFwONu.js"), "./Pages/Admin/CrmAccount/Partials/CrmAccountShowView.jsx": () => import("./assets/CrmAccountShowView-ChM5a15M.js"), "./Pages/Admin/CrmContact/Import.jsx": () => import("./assets/Import-BKANq8Ph.js"), "./Pages/Admin/CrmContact/Index.jsx": () => import("./assets/Index-C6Rsu0GE.js"), "./Pages/Admin/CrmOpportunity/Create.jsx": () => import("./assets/Create-B7jZPIeG.js"), "./Pages/Admin/CrmOpportunity/Edit.jsx": () => import("./assets/Edit-C_37d-r-.js"), "./Pages/Admin/CrmOpportunity/Index.jsx": () => import("./assets/Index-x2dP3jo1.js"), "./Pages/Admin/CrmOpportunity/Partials/CrmOpportunitiesShowView.jsx": () => import("./assets/CrmOpportunitiesShowView-CkefcoJW.js"), "./Pages/Admin/Currency/Create.jsx": () => import("./assets/Create-B2yMmyUx.js"), "./Pages/Admin/Currency/Edit.jsx": () => import("./assets/Edit-D3THIyjB.js"), "./Pages/Admin/Currency/Index.jsx": () => import("./assets/Index-DmV1DL1G.js"), "./Pages/Admin/Customer/Create.jsx": () => import("./assets/Create-D0RT7y5s.js"), "./Pages/Admin/Customer/Edit.jsx": () => import("./assets/Edit-BmhqzOcu.js"), "./Pages/Admin/Customer/Index.jsx": () => import("./assets/Index-vg6FXNJT.js"), "./Pages/Admin/Customer/Show.jsx": () => import("./assets/Show-Dr1F-XTV.js").then((n2) => n2.b), "./Pages/Admin/Dashboard/Index.jsx": () => import("./assets/Index-vKNucZiU.js"), "./Pages/Admin/Dashboard/Partials/FavoritesGrid.jsx": () => import("./assets/FavoritesGrid-1AK2Mn6S.js"), "./Pages/Admin/DocumentGallery/Index.jsx": () => import("./assets/Index-zpWJuYyf.js"), "./Pages/Admin/Functionality/Edit.jsx": () => import("./assets/Edit-CDi52GOI.js"), "./Pages/Admin/Invoice/Edit.jsx": () => import("./assets/Show-Dr1F-XTV.js").then((n2) => n2.E), "./Pages/Admin/Invoice/Index.jsx": () => import("./assets/Show-Dr1F-XTV.js").then((n2) => n2.c), "./Pages/Admin/IvaType/Create.jsx": () => import("./assets/Create-BP9PDWjV.js"), "./Pages/Admin/IvaType/Edit.jsx": () => import("./assets/Edit-CVoVyZLO.js"), "./Pages/Admin/IvaType/Index.jsx": () => import("./assets/Index-Bo8MtKjU.js"), "./Pages/Admin/Marketing/Index.jsx": () => import("./assets/Show-Dr1F-XTV.js").then((n2) => n2.d), "./Pages/Admin/MarketingCampaign/Create.jsx": () => import("./assets/Create-BiHO8_XR.js"), "./Pages/Admin/MarketingCampaign/Edit.jsx": () => import("./assets/Edit-BcJJr6UR.js"), "./Pages/Admin/MarketingCampaign/Index.jsx": () => import("./assets/Index-D8fxRQc_.js"), "./Pages/Admin/MarketingCampaign/Partials/MarketingCampaignInfoTab.jsx": () => import("./assets/MarketingCampaignInfoTab-L7yKOKcn.js"), "./Pages/Admin/MarketingCampaign/Partials/MarketingCampaignListsTab.jsx": () => import("./assets/MarketingCampaignListsTab-BmqYl075.js"), "./Pages/Admin/MarketingCampaign/Partials/MarketingCampaignShowView.jsx": () => import("./assets/MarketingCampaignShowView-D3zrRo5w.js"), "./Pages/Admin/MarketingList/Create.jsx": () => import("./assets/Create-P5zvokmG.js"), "./Pages/Admin/MarketingList/Edit.jsx": () => import("./assets/Edit-CjGE_0rd.js"), "./Pages/Admin/MarketingList/Index.jsx": () => import("./assets/Index-C68m9gd9.js"), "./Pages/Admin/MarketingList/Partials/MarketingListInfoTab.jsx": () => import("./assets/MarketingListInfoTab-DnS353qq.js"), "./Pages/Admin/MarketingList/Partials/MarketingListMembersTab.jsx": () => import("./assets/MarketingListMembersTab-D1p_Axel.js"), "./Pages/Admin/MarketingList/Partials/MarketingListShowView.jsx": () => import("./assets/MarketingListShowView-DaZo3s4M.js"), "./Pages/Admin/MarketingList/Show.jsx": () => import("./assets/Show-Dr1F-XTV.js").then((n2) => n2.e), "./Pages/Admin/Module/Create.jsx": () => import("./assets/Create-CUVo6V_k.js"), "./Pages/Admin/Module/Edit.jsx": () => import("./assets/Edit-BLSOlxR0.js"), "./Pages/Admin/Module/Index.jsx": () => import("./assets/Index-Cm7S17mZ.js"), "./Pages/Admin/Module/Partials/FunctionalitiesTab.jsx": () => import("./assets/FunctionalitiesTab-QBcxRfu8.js"), "./Pages/Admin/Module/Partials/ModuleTab.jsx": () => import("./assets/ModuleTab-D06Dq7Z1.js"), "./Pages/Admin/Order/Index.jsx": () => import("./assets/Show-Dr1F-XTV.js").then((n2) => n2.f), "./Pages/Admin/Partials/Header.jsx": () => import("./assets/Header-BFeBcT5X.js"), "./Pages/Admin/Partials/Sidebar.jsx": () => import("./assets/Sidebar-DgixJBon.js").then((n2) => n2.a), "./Pages/Admin/Permission/Create.jsx": () => import("./assets/Create-DoMO-beR.js"), "./Pages/Admin/Permission/Index.jsx": () => import("./assets/Index-CcapvFGh.js"), "./Pages/Admin/Product/Create.jsx": () => import("./assets/Create-C4JailDm.js"), "./Pages/Admin/Product/Edit.jsx": () => import("./assets/Edit-D_CTQLS1.js"), "./Pages/Admin/Product/Index.jsx": () => import("./assets/Index-B0aqE3Al.js"), "./Pages/Admin/Product/Partials/ProductAttributes.jsx": () => import("./assets/ProductAttributes-DfhlX4PD.js"), "./Pages/Admin/Product/Partials/ProductCategories.jsx": () => import("./assets/ProductCategories-DxrUwiyp.js"), "./Pages/Admin/Product/Partials/ProductData.jsx": () => import("./assets/ProductData-Ctjr6ZRI.js"), "./Pages/Admin/Product/Partials/ProductImages.jsx": () => import("./assets/ProductImages-CfbDEuqR.js"), "./Pages/Admin/Product/Partials/ProductPriceHistory.jsx": () => import("./assets/ProductPriceHistory-DJ1_FbtV.js"), "./Pages/Admin/Product/Partials/ProductPurchases.jsx": () => import("./assets/ProductPurchases-DUz_wQD_.js"), "./Pages/Admin/Product/Partials/ProductSales.jsx": () => import("./assets/ProductSales-BiaYp-Fs.js"), "./Pages/Admin/Product/Partials/ProductSerialization.jsx": () => import("./assets/ProductSerialization-Bq3-l9RQ.js"), "./Pages/Admin/Product/Partials/ProductShowView.jsx": () => import("./assets/ProductShowView-CVZdA3z-.js"), "./Pages/Admin/Product/Partials/ProductUnits.jsx": () => import("./assets/ProductUnits-CkO8_a0Q.js"), "./Pages/Admin/ProductPattern/Create.jsx": () => import("./assets/Create-C5X-u5a1.js"), "./Pages/Admin/ProductPattern/Edit.jsx": () => import("./assets/Edit-Deebacvi.js"), "./Pages/Admin/ProductPattern/Index.jsx": () => import("./assets/Index-DS3S1d_p.js"), "./Pages/Admin/Provider/Create.jsx": () => import("./assets/Create-BoFD_bRE.js"), "./Pages/Admin/Provider/Edit.jsx": () => import("./assets/Edit-DfKV6491.js"), "./Pages/Admin/Provider/Index.jsx": () => import("./assets/Index-DJtQop-0.js"), "./Pages/Admin/Provider/Show.jsx": () => import("./assets/Show-Dr1F-XTV.js").then((n2) => n2.g), "./Pages/Admin/Province/Create.jsx": () => import("./assets/Create-CnJrUk1C.js"), "./Pages/Admin/Province/Edit.jsx": () => import("./assets/Edit-CScfX8dB.js"), "./Pages/Admin/Province/Index.jsx": () => import("./assets/Index-BPZEHxGh.js"), "./Pages/Admin/Role/Create.jsx": () => import("./assets/Create-CmL6Ht6c.js"), "./Pages/Admin/Role/Edit.jsx": () => import("./assets/Edit-lY_JbdtP.js"), "./Pages/Admin/Role/Index.jsx": () => import("./assets/Index-DahLbWwJ.js"), "./Pages/Admin/Schedule/Index.jsx": () => import("./assets/Index-_-xksU8w.js"), "./Pages/Admin/Schedule/Partials/AuthorizedUsersModal.jsx": () => import("./assets/AuthorizedUsersModal-CfhW5fhj.js"), "./Pages/Admin/Schedule/Partials/EventFormModal.jsx": () => import("./assets/EventFormModal-Dg2KLJOW.js"), "./Pages/Admin/Schedule/Partials/ScheduleFormModal.jsx": () => import("./assets/ScheduleFormModal-9_xHMOXK.js"), "./Pages/Admin/StockMovement/Create.jsx": () => import("./assets/Create-3S8DDbFx.js"), "./Pages/Admin/StockMovement/Edit.jsx": () => import("./assets/Edit-DW2tSGj4.js"), "./Pages/Admin/StockMovement/Index.jsx": () => import("./assets/Index-DREqIp9-.js"), "./Pages/Admin/Town/Create.jsx": () => import("./assets/Create-DXQPmqcy.js"), "./Pages/Admin/Town/Edit.jsx": () => import("./assets/Edit-CMONVTm2.js"), "./Pages/Admin/Town/Index.jsx": () => import("./assets/Index-DnbxARmk.js"), "./Pages/Admin/Unit/Create.jsx": () => import("./assets/Create-BAoGY2Ve.js"), "./Pages/Admin/Unit/Edit.jsx": () => import("./assets/Edit-C4-_y73Q.js"), "./Pages/Admin/Unit/Index.jsx": () => import("./assets/Index-BWBtEaSD.js"), "./Pages/Admin/User/Categories.jsx": () => import("./assets/Categories-DT2Wq54L.js"), "./Pages/Admin/User/Contacts.jsx": () => import("./assets/Contacts-DzoCChi0.js"), "./Pages/Admin/User/Create.jsx": () => import("./assets/Create-CS5IXlHl.js"), "./Pages/Admin/User/Edit.jsx": () => import("./assets/Edit-Cnh5N0oM.js"), "./Pages/Admin/User/Index.jsx": () => import("./assets/Index-BMwTdIDO.js"), "./Pages/Admin/User/Partials/UserCompaniesData.jsx": () => import("./assets/Show-Dr1F-XTV.js").then((n2) => n2.U), "./Pages/Admin/User/Partials/UserContactData.jsx": () => import("./assets/Show-Dr1F-XTV.js").then((n2) => n2.h), "./Pages/Admin/User/Partials/UserImages.jsx": () => import("./assets/UserImages-fTJRUy_n.js"), "./Pages/Admin/User/Partials/UserNotes.jsx": () => import("./assets/UserNotes-C8GLj4Vs.js"), "./Pages/Admin/User/Partials/UserPassword.jsx": () => import("./assets/UserPassword-B_T7uAmO.js"), "./Pages/Admin/User/Partials/UserPersonalData.jsx": () => import("./assets/UserPersonalData-C4EUuraa.js"), "./Pages/Admin/User/Partials/UserShowView.jsx": () => import("./assets/UserShowView-CJCAJiz0.js"), "./Pages/Admin/User/Show.jsx": () => import("./assets/Show-Dr1F-XTV.js").then((n2) => n2.i), "./Pages/Admin/Workplace/Create.jsx": () => import("./assets/Create-mFTKDT29.js"), "./Pages/Admin/Workplace/Edit.jsx": () => import("./assets/Edit-DXPv0btH.js"), "./Pages/Admin/Workplace/Index.jsx": () => import("./assets/Index-DEUNlOJ-.js"), "./Pages/Auth/ConfirmPassword.jsx": () => import("./assets/ConfirmPassword-BGmm3Dzp.js"), "./Pages/Auth/ForgotPassword.jsx": () => import("./assets/ForgotPassword-mSLAlERK.js"), "./Pages/Auth/Login.jsx": () => import("./assets/Login-CDgqdYPw.js"), "./Pages/Auth/LoginVerify.jsx": () => import("./assets/LoginVerify-DWsZGp1u.js"), "./Pages/Auth/Register.jsx": () => import("./assets/Register-CwIDM1MX.js"), "./Pages/Auth/ResetPassword.jsx": () => import("./assets/ResetPassword-hbpAfnMm.js"), "./Pages/Auth/VerifyEmail.jsx": () => import("./assets/VerifyEmail-BEURGJMC.js"), "./Pages/Dashboard.jsx": () => import("./assets/Dashboard-CHMTiPbk.js"), "./Pages/Errors/Forbidden.jsx": () => import("./assets/Forbidden-CzoOgmCP.js"), "./Pages/Frontend/Home.jsx": () => import("./assets/Home-DfhqN21h.js"), "./Pages/Frontend/Partials/Header.jsx": () => import("./assets/Header-CrOe23WK.js"), "./Pages/Profile/Edit.jsx": () => import("./assets/Edit-Q8Q0lvRn.js"), "./Pages/Profile/Partials/DeleteUserForm.jsx": () => import("./assets/DeleteUserForm-CzbztYOT.js"), "./Pages/Profile/Partials/UpdatePasswordForm.jsx": () => import("./assets/UpdatePasswordForm-BDHlzcr9.js"), "./Pages/Profile/Partials/UpdateProfileInformationForm.jsx": () => import("./assets/UpdateProfileInformationForm-noh60mrU.js"), "./Pages/Welcome.jsx": () => import("./assets/Welcome-Drqm0efl.js") })),
    setup: ({ App, props }) => {
      global.route = (name, params, absolute) => D(name, params, absolute, {
        ...page.props.ziggy,
        location: new URL(page.props.ziggy.location)
      });
      return /* @__PURE__ */ jsx(App, { ...props });
    }
  })
);
