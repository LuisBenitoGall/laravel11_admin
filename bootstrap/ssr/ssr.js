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
  return t = Object.assign ? Object.assign.bind() : function(t4) {
    for (var e2 = 1; e2 < arguments.length; e2++) {
      var r2 = arguments[e2];
      for (var n2 in r2) ({}).hasOwnProperty.call(r2, n2) && (t4[n2] = r2[n2]);
    }
    return t4;
  }, t.apply(null, arguments);
}
var e = String.prototype.replace, r = /%20/g, n = "RFC3986", o = { default: n, formatters: { RFC1738: function(t4) {
  return e.call(t4, r, "+");
}, RFC3986: function(t4) {
  return String(t4);
} }, RFC1738: "RFC1738" }, i = Object.prototype.hasOwnProperty, u = Array.isArray, a = function() {
  for (var t4 = [], e2 = 0; e2 < 256; ++e2) t4.push("%" + ((e2 < 16 ? "0" : "") + e2.toString(16)).toUpperCase());
  return t4;
}(), s = function(t4, e2) {
  for (var r2 = e2 && e2.plainObjects ? /* @__PURE__ */ Object.create(null) : {}, n2 = 0; n2 < t4.length; ++n2) void 0 !== t4[n2] && (r2[n2] = t4[n2]);
  return r2;
}, f = { arrayToObject: s, assign: function(t4, e2) {
  return Object.keys(e2).reduce(function(t5, r2) {
    return t5[r2] = e2[r2], t5;
  }, t4);
}, combine: function(t4, e2) {
  return [].concat(t4, e2);
}, compact: function(t4) {
  for (var e2 = [{ obj: { o: t4 }, prop: "o" }], r2 = [], n2 = 0; n2 < e2.length; ++n2) for (var o2 = e2[n2], i2 = o2.obj[o2.prop], a2 = Object.keys(i2), s2 = 0; s2 < a2.length; ++s2) {
    var f2 = a2[s2], c2 = i2[f2];
    "object" == typeof c2 && null !== c2 && -1 === r2.indexOf(c2) && (e2.push({ obj: i2, prop: f2 }), r2.push(c2));
  }
  return function(t5) {
    for (; t5.length > 1; ) {
      var e3 = t5.pop(), r3 = e3.obj[e3.prop];
      if (u(r3)) {
        for (var n3 = [], o3 = 0; o3 < r3.length; ++o3) void 0 !== r3[o3] && n3.push(r3[o3]);
        e3.obj[e3.prop] = n3;
      }
    }
  }(e2), t4;
}, decode: function(t4, e2, r2) {
  var n2 = t4.replace(/\+/g, " ");
  if ("iso-8859-1" === r2) return n2.replace(/%[0-9a-f]{2}/gi, unescape);
  try {
    return decodeURIComponent(n2);
  } catch (t5) {
    return n2;
  }
}, encode: function(t4, e2, r2, n2, i2) {
  if (0 === t4.length) return t4;
  var u2 = t4;
  if ("symbol" == typeof t4 ? u2 = Symbol.prototype.toString.call(t4) : "string" != typeof t4 && (u2 = String(t4)), "iso-8859-1" === r2) return escape(u2).replace(/%u[0-9a-f]{4}/gi, function(t5) {
    return "%26%23" + parseInt(t5.slice(2), 16) + "%3B";
  });
  for (var s2 = "", f2 = 0; f2 < u2.length; ++f2) {
    var c2 = u2.charCodeAt(f2);
    45 === c2 || 46 === c2 || 95 === c2 || 126 === c2 || c2 >= 48 && c2 <= 57 || c2 >= 65 && c2 <= 90 || c2 >= 97 && c2 <= 122 || i2 === o.RFC1738 && (40 === c2 || 41 === c2) ? s2 += u2.charAt(f2) : c2 < 128 ? s2 += a[c2] : c2 < 2048 ? s2 += a[192 | c2 >> 6] + a[128 | 63 & c2] : c2 < 55296 || c2 >= 57344 ? s2 += a[224 | c2 >> 12] + a[128 | c2 >> 6 & 63] + a[128 | 63 & c2] : (c2 = 65536 + ((1023 & c2) << 10 | 1023 & u2.charCodeAt(f2 += 1)), s2 += a[240 | c2 >> 18] + a[128 | c2 >> 12 & 63] + a[128 | c2 >> 6 & 63] + a[128 | 63 & c2]);
  }
  return s2;
}, isBuffer: function(t4) {
  return !(!t4 || "object" != typeof t4 || !(t4.constructor && t4.constructor.isBuffer && t4.constructor.isBuffer(t4)));
}, isRegExp: function(t4) {
  return "[object RegExp]" === Object.prototype.toString.call(t4);
}, maybeMap: function(t4, e2) {
  if (u(t4)) {
    for (var r2 = [], n2 = 0; n2 < t4.length; n2 += 1) r2.push(e2(t4[n2]));
    return r2;
  }
  return e2(t4);
}, merge: function t2(e2, r2, n2) {
  if (!r2) return e2;
  if ("object" != typeof r2) {
    if (u(e2)) e2.push(r2);
    else {
      if (!e2 || "object" != typeof e2) return [e2, r2];
      (n2 && (n2.plainObjects || n2.allowPrototypes) || !i.call(Object.prototype, r2)) && (e2[r2] = true);
    }
    return e2;
  }
  if (!e2 || "object" != typeof e2) return [e2].concat(r2);
  var o2 = e2;
  return u(e2) && !u(r2) && (o2 = s(e2, n2)), u(e2) && u(r2) ? (r2.forEach(function(r3, o3) {
    if (i.call(e2, o3)) {
      var u2 = e2[o3];
      u2 && "object" == typeof u2 && r3 && "object" == typeof r3 ? e2[o3] = t2(u2, r3, n2) : e2.push(r3);
    } else e2[o3] = r3;
  }), e2) : Object.keys(r2).reduce(function(e3, o3) {
    var u2 = r2[o3];
    return e3[o3] = i.call(e3, o3) ? t2(e3[o3], u2, n2) : u2, e3;
  }, o2);
} }, c = Object.prototype.hasOwnProperty, l = { brackets: function(t4) {
  return t4 + "[]";
}, comma: "comma", indices: function(t4, e2) {
  return t4 + "[" + e2 + "]";
}, repeat: function(t4) {
  return t4;
} }, p = Array.isArray, h = String.prototype.split, y = Array.prototype.push, d = function(t4, e2) {
  y.apply(t4, p(e2) ? e2 : [e2]);
}, g = Date.prototype.toISOString, b = o.default, v = { addQueryPrefix: false, allowDots: false, charset: "utf-8", charsetSentinel: false, delimiter: "&", encode: true, encoder: f.encode, encodeValuesOnly: false, format: b, formatter: o.formatters[b], indices: false, serializeDate: function(t4) {
  return g.call(t4);
}, skipNulls: false, strictNullHandling: false }, m = function t3(e2, r2, n2, o2, i2, u2, a2, s2, c2, l2, y2, g2, b2, m2) {
  var j2, w2 = e2;
  if ("function" == typeof a2 ? w2 = a2(r2, w2) : w2 instanceof Date ? w2 = l2(w2) : "comma" === n2 && p(w2) && (w2 = f.maybeMap(w2, function(t4) {
    return t4 instanceof Date ? l2(t4) : t4;
  })), null === w2) {
    if (o2) return u2 && !b2 ? u2(r2, v.encoder, m2, "key", y2) : r2;
    w2 = "";
  }
  if ("string" == typeof (j2 = w2) || "number" == typeof j2 || "boolean" == typeof j2 || "symbol" == typeof j2 || "bigint" == typeof j2 || f.isBuffer(w2)) {
    if (u2) {
      var $2 = b2 ? r2 : u2(r2, v.encoder, m2, "key", y2);
      if ("comma" === n2 && b2) {
        for (var O2 = h.call(String(w2), ","), E2 = "", R2 = 0; R2 < O2.length; ++R2) E2 += (0 === R2 ? "" : ",") + g2(u2(O2[R2], v.encoder, m2, "value", y2));
        return [g2($2) + "=" + E2];
      }
      return [g2($2) + "=" + g2(u2(w2, v.encoder, m2, "value", y2))];
    }
    return [g2(r2) + "=" + g2(String(w2))];
  }
  var S2, x2 = [];
  if (void 0 === w2) return x2;
  if ("comma" === n2 && p(w2)) S2 = [{ value: w2.length > 0 ? w2.join(",") || null : void 0 }];
  else if (p(a2)) S2 = a2;
  else {
    var N2 = Object.keys(w2);
    S2 = s2 ? N2.sort(s2) : N2;
  }
  for (var T2 = 0; T2 < S2.length; ++T2) {
    var k = S2[T2], C = "object" == typeof k && void 0 !== k.value ? k.value : w2[k];
    if (!i2 || null !== C) {
      var _ = p(w2) ? "function" == typeof n2 ? n2(r2, k) : r2 : r2 + (c2 ? "." + k : "[" + k + "]");
      d(x2, t3(C, _, n2, o2, i2, u2, a2, s2, c2, l2, y2, g2, b2, m2));
    }
  }
  return x2;
}, j = Object.prototype.hasOwnProperty, w = Array.isArray, $ = { allowDots: false, allowPrototypes: false, arrayLimit: 20, charset: "utf-8", charsetSentinel: false, comma: false, decoder: f.decode, delimiter: "&", depth: 5, ignoreQueryPrefix: false, interpretNumericEntities: false, parameterLimit: 1e3, parseArrays: true, plainObjects: false, strictNullHandling: false }, O = function(t4) {
  return t4.replace(/&#(\d+);/g, function(t5, e2) {
    return String.fromCharCode(parseInt(e2, 10));
  });
}, E = function(t4, e2) {
  return t4 && "string" == typeof t4 && e2.comma && t4.indexOf(",") > -1 ? t4.split(",") : t4;
}, R = function(t4, e2, r2, n2) {
  if (t4) {
    var o2 = r2.allowDots ? t4.replace(/\.([^.[]+)/g, "[$1]") : t4, i2 = /(\[[^[\]]*])/g, u2 = r2.depth > 0 && /(\[[^[\]]*])/.exec(o2), a2 = u2 ? o2.slice(0, u2.index) : o2, s2 = [];
    if (a2) {
      if (!r2.plainObjects && j.call(Object.prototype, a2) && !r2.allowPrototypes) return;
      s2.push(a2);
    }
    for (var f2 = 0; r2.depth > 0 && null !== (u2 = i2.exec(o2)) && f2 < r2.depth; ) {
      if (f2 += 1, !r2.plainObjects && j.call(Object.prototype, u2[1].slice(1, -1)) && !r2.allowPrototypes) return;
      s2.push(u2[1]);
    }
    return u2 && s2.push("[" + o2.slice(u2.index) + "]"), function(t5, e3, r3, n3) {
      for (var o3 = n3 ? e3 : E(e3, r3), i3 = t5.length - 1; i3 >= 0; --i3) {
        var u3, a3 = t5[i3];
        if ("[]" === a3 && r3.parseArrays) u3 = [].concat(o3);
        else {
          u3 = r3.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
          var s3 = "[" === a3.charAt(0) && "]" === a3.charAt(a3.length - 1) ? a3.slice(1, -1) : a3, f3 = parseInt(s3, 10);
          r3.parseArrays || "" !== s3 ? !isNaN(f3) && a3 !== s3 && String(f3) === s3 && f3 >= 0 && r3.parseArrays && f3 <= r3.arrayLimit ? (u3 = [])[f3] = o3 : "__proto__" !== s3 && (u3[s3] = o3) : u3 = { 0: o3 };
        }
        o3 = u3;
      }
      return o3;
    }(s2, e2, r2, n2);
  }
}, S = function(t4, e2) {
  var r2 = /* @__PURE__ */ function(t5) {
    return $;
  }();
  if ("" === t4 || null == t4) return r2.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
  for (var n2 = "string" == typeof t4 ? function(t5, e3) {
    var r3, n3 = {}, o3 = (e3.ignoreQueryPrefix ? t5.replace(/^\?/, "") : t5).split(e3.delimiter, Infinity === e3.parameterLimit ? void 0 : e3.parameterLimit), i3 = -1, u3 = e3.charset;
    if (e3.charsetSentinel) for (r3 = 0; r3 < o3.length; ++r3) 0 === o3[r3].indexOf("utf8=") && ("utf8=%E2%9C%93" === o3[r3] ? u3 = "utf-8" : "utf8=%26%2310003%3B" === o3[r3] && (u3 = "iso-8859-1"), i3 = r3, r3 = o3.length);
    for (r3 = 0; r3 < o3.length; ++r3) if (r3 !== i3) {
      var a3, s3, c2 = o3[r3], l2 = c2.indexOf("]="), p2 = -1 === l2 ? c2.indexOf("=") : l2 + 1;
      -1 === p2 ? (a3 = e3.decoder(c2, $.decoder, u3, "key"), s3 = e3.strictNullHandling ? null : "") : (a3 = e3.decoder(c2.slice(0, p2), $.decoder, u3, "key"), s3 = f.maybeMap(E(c2.slice(p2 + 1), e3), function(t6) {
        return e3.decoder(t6, $.decoder, u3, "value");
      })), s3 && e3.interpretNumericEntities && "iso-8859-1" === u3 && (s3 = O(s3)), c2.indexOf("[]=") > -1 && (s3 = w(s3) ? [s3] : s3), n3[a3] = j.call(n3, a3) ? f.combine(n3[a3], s3) : s3;
    }
    return n3;
  }(t4, r2) : t4, o2 = r2.plainObjects ? /* @__PURE__ */ Object.create(null) : {}, i2 = Object.keys(n2), u2 = 0; u2 < i2.length; ++u2) {
    var a2 = i2[u2], s2 = R(a2, n2[a2], r2, "string" == typeof t4);
    o2 = f.merge(o2, s2, r2);
  }
  return f.compact(o2);
};
class x {
  constructor(t4, e2, r2) {
    var n2, o2;
    this.name = t4, this.definition = e2, this.bindings = null != (n2 = e2.bindings) ? n2 : {}, this.wheres = null != (o2 = e2.wheres) ? o2 : {}, this.config = r2;
  }
  get template() {
    const t4 = `${this.origin}/${this.definition.uri}`.replace(/\/+$/, "");
    return "" === t4 ? "/" : t4;
  }
  get origin() {
    return this.config.absolute ? this.definition.domain ? `${this.config.url.match(/^\w+:\/\//)[0]}${this.definition.domain}${this.config.port ? `:${this.config.port}` : ""}` : this.config.url : "";
  }
  get parameterSegments() {
    var t4, e2;
    return null != (t4 = null == (e2 = this.template.match(/{[^}?]+\??}/g)) ? void 0 : e2.map((t5) => ({ name: t5.replace(/{|\??}/g, ""), required: !/\?}$/.test(t5) }))) ? t4 : [];
  }
  matchesUrl(t4) {
    var e2;
    if (!this.definition.methods.includes("GET")) return false;
    const r2 = this.template.replace(/[.*+$()[\]]/g, "\\$&").replace(/(\/?){([^}?]*)(\??)}/g, (t5, e3, r3, n3) => {
      var o3;
      const i3 = `(?<${r3}>${(null == (o3 = this.wheres[r3]) ? void 0 : o3.replace(/(^\^)|(\$$)/g, "")) || "[^/?]+"})`;
      return n3 ? `(${e3}${i3})?` : `${e3}${i3}`;
    }).replace(/^\w+:\/\//, ""), [n2, o2] = t4.replace(/^\w+:\/\//, "").split("?"), i2 = null != (e2 = new RegExp(`^${r2}/?$`).exec(n2)) ? e2 : new RegExp(`^${r2}/?$`).exec(decodeURI(n2));
    if (i2) {
      for (const t5 in i2.groups) i2.groups[t5] = "string" == typeof i2.groups[t5] ? decodeURIComponent(i2.groups[t5]) : i2.groups[t5];
      return { params: i2.groups, query: S(o2) };
    }
    return false;
  }
  compile(t4) {
    return this.parameterSegments.length ? this.template.replace(/{([^}?]+)(\??)}/g, (e2, r2, n2) => {
      var o2, i2;
      if (!n2 && [null, void 0].includes(t4[r2])) throw new Error(`Ziggy error: '${r2}' parameter is required for route '${this.name}'.`);
      if (this.wheres[r2] && !new RegExp(`^${n2 ? `(${this.wheres[r2]})?` : this.wheres[r2]}$`).test(null != (i2 = t4[r2]) ? i2 : "")) throw new Error(`Ziggy error: '${r2}' parameter '${t4[r2]}' does not match required format '${this.wheres[r2]}' for route '${this.name}'.`);
      return encodeURI(null != (o2 = t4[r2]) ? o2 : "").replace(/%7C/g, "|").replace(/%25/g, "%").replace(/\$/g, "%24");
    }).replace(this.config.absolute ? /(\.[^/]+?)(\/\/)/ : /(^)(\/\/)/, "$1/").replace(/\/+$/, "") : this.template;
  }
}
class N extends String {
  constructor(e2, r2, n2 = true, o2) {
    if (super(), this.t = null != o2 ? o2 : "undefined" != typeof Ziggy ? Ziggy : null == globalThis ? void 0 : globalThis.Ziggy, this.t = t({}, this.t, { absolute: n2 }), e2) {
      if (!this.t.routes[e2]) throw new Error(`Ziggy error: route '${e2}' is not in the route list.`);
      this.i = new x(e2, this.t.routes[e2], this.t), this.u = this.l(r2);
    }
  }
  toString() {
    const e2 = Object.keys(this.u).filter((t4) => !this.i.parameterSegments.some(({ name: e3 }) => e3 === t4)).filter((t4) => "_query" !== t4).reduce((e3, r2) => t({}, e3, { [r2]: this.u[r2] }), {});
    return this.i.compile(this.u) + function(t4, e3) {
      var r2, n2 = t4, i2 = function(t5) {
        if (!t5) return v;
        if (null != t5.encoder && "function" != typeof t5.encoder) throw new TypeError("Encoder has to be a function.");
        var e4 = t5.charset || v.charset;
        if (void 0 !== t5.charset && "utf-8" !== t5.charset && "iso-8859-1" !== t5.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
        var r3 = o.default;
        if (void 0 !== t5.format) {
          if (!c.call(o.formatters, t5.format)) throw new TypeError("Unknown format option provided.");
          r3 = t5.format;
        }
        var n3 = o.formatters[r3], i3 = v.filter;
        return ("function" == typeof t5.filter || p(t5.filter)) && (i3 = t5.filter), { addQueryPrefix: "boolean" == typeof t5.addQueryPrefix ? t5.addQueryPrefix : v.addQueryPrefix, allowDots: void 0 === t5.allowDots ? v.allowDots : !!t5.allowDots, charset: e4, charsetSentinel: "boolean" == typeof t5.charsetSentinel ? t5.charsetSentinel : v.charsetSentinel, delimiter: void 0 === t5.delimiter ? v.delimiter : t5.delimiter, encode: "boolean" == typeof t5.encode ? t5.encode : v.encode, encoder: "function" == typeof t5.encoder ? t5.encoder : v.encoder, encodeValuesOnly: "boolean" == typeof t5.encodeValuesOnly ? t5.encodeValuesOnly : v.encodeValuesOnly, filter: i3, format: r3, formatter: n3, serializeDate: "function" == typeof t5.serializeDate ? t5.serializeDate : v.serializeDate, skipNulls: "boolean" == typeof t5.skipNulls ? t5.skipNulls : v.skipNulls, sort: "function" == typeof t5.sort ? t5.sort : null, strictNullHandling: "boolean" == typeof t5.strictNullHandling ? t5.strictNullHandling : v.strictNullHandling };
      }(e3);
      "function" == typeof i2.filter ? n2 = (0, i2.filter)("", n2) : p(i2.filter) && (r2 = i2.filter);
      var u2 = [];
      if ("object" != typeof n2 || null === n2) return "";
      var a2 = l[e3 && e3.arrayFormat in l ? e3.arrayFormat : e3 && "indices" in e3 ? e3.indices ? "indices" : "repeat" : "indices"];
      r2 || (r2 = Object.keys(n2)), i2.sort && r2.sort(i2.sort);
      for (var s2 = 0; s2 < r2.length; ++s2) {
        var f2 = r2[s2];
        i2.skipNulls && null === n2[f2] || d(u2, m(n2[f2], f2, a2, i2.strictNullHandling, i2.skipNulls, i2.encode ? i2.encoder : null, i2.filter, i2.sort, i2.allowDots, i2.serializeDate, i2.format, i2.formatter, i2.encodeValuesOnly, i2.charset));
      }
      var h2 = u2.join(i2.delimiter), y2 = true === i2.addQueryPrefix ? "?" : "";
      return i2.charsetSentinel && (y2 += "iso-8859-1" === i2.charset ? "utf8=%26%2310003%3B&" : "utf8=%E2%9C%93&"), h2.length > 0 ? y2 + h2 : "";
    }(t({}, e2, this.u._query), { addQueryPrefix: true, arrayFormat: "indices", encodeValuesOnly: true, skipNulls: true, encoder: (t4, e3) => "boolean" == typeof t4 ? Number(t4) : e3(t4) });
  }
  p(e2) {
    e2 ? this.t.absolute && e2.startsWith("/") && (e2 = this.h().host + e2) : e2 = this.v();
    let r2 = {};
    const [n2, o2] = Object.entries(this.t.routes).find(([t4, n3]) => r2 = new x(t4, n3, this.t).matchesUrl(e2)) || [void 0, void 0];
    return t({ name: n2 }, r2, { route: o2 });
  }
  v() {
    const { host: t4, pathname: e2, search: r2 } = this.h();
    return (this.t.absolute ? t4 + e2 : e2.replace(this.t.url.replace(/^\w*:\/\/[^/]+/, ""), "").replace(/^\/+/, "/")) + r2;
  }
  current(e2, r2) {
    const { name: n2, params: o2, query: i2, route: u2 } = this.p();
    if (!e2) return n2;
    const a2 = new RegExp(`^${e2.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`).test(n2);
    if ([null, void 0].includes(r2) || !a2) return a2;
    const s2 = new x(n2, u2, this.t);
    r2 = this.l(r2, s2);
    const f2 = t({}, o2, i2);
    if (Object.values(r2).every((t4) => !t4) && !Object.values(f2).some((t4) => void 0 !== t4)) return true;
    const c2 = (t4, e3) => Object.entries(t4).every(([t5, r3]) => Array.isArray(r3) && Array.isArray(e3[t5]) ? r3.every((r4) => e3[t5].includes(r4)) : "object" == typeof r3 && "object" == typeof e3[t5] && null !== r3 && null !== e3[t5] ? c2(r3, e3[t5]) : e3[t5] == r3);
    return c2(r2, f2);
  }
  h() {
    var t4, e2, r2, n2, o2, i2;
    const { host: u2 = "", pathname: a2 = "", search: s2 = "" } = "undefined" != typeof window ? window.location : {};
    return { host: null != (t4 = null == (e2 = this.t.location) ? void 0 : e2.host) ? t4 : u2, pathname: null != (r2 = null == (n2 = this.t.location) ? void 0 : n2.pathname) ? r2 : a2, search: null != (o2 = null == (i2 = this.t.location) ? void 0 : i2.search) ? o2 : s2 };
  }
  get params() {
    const { params: e2, query: r2 } = this.p();
    return t({}, e2, r2);
  }
  get routeParams() {
    return this.p().params;
  }
  get queryParams() {
    return this.p().query;
  }
  has(t4) {
    return this.t.routes.hasOwnProperty(t4);
  }
  l(e2 = {}, r2 = this.i) {
    null != e2 || (e2 = {}), e2 = ["string", "number"].includes(typeof e2) ? [e2] : e2;
    const n2 = r2.parameterSegments.filter(({ name: t4 }) => !this.t.defaults[t4]);
    return Array.isArray(e2) ? e2 = e2.reduce((e3, r3, o2) => t({}, e3, n2[o2] ? { [n2[o2].name]: r3 } : "object" == typeof r3 ? r3 : { [r3]: "" }), {}) : 1 !== n2.length || e2[n2[0].name] || !e2.hasOwnProperty(Object.values(r2.bindings)[0]) && !e2.hasOwnProperty("id") || (e2 = { [n2[0].name]: e2 }), t({}, this.m(r2), this.j(e2, r2));
  }
  m(e2) {
    return e2.parameterSegments.filter(({ name: t4 }) => this.t.defaults[t4]).reduce((e3, { name: r2 }, n2) => t({}, e3, { [r2]: this.t.defaults[r2] }), {});
  }
  j(e2, { bindings: r2, parameterSegments: n2 }) {
    return Object.entries(e2).reduce((e3, [o2, i2]) => {
      if (!i2 || "object" != typeof i2 || Array.isArray(i2) || !n2.some(({ name: t4 }) => t4 === o2)) return t({}, e3, { [o2]: i2 });
      if (!i2.hasOwnProperty(r2[o2])) {
        if (!i2.hasOwnProperty("id")) throw new Error(`Ziggy error: object passed as '${o2}' parameter is missing route model binding key '${r2[o2]}'.`);
        r2[o2] = "id";
      }
      return t({}, e3, { [o2]: i2[r2[o2]] });
    }, {});
  }
  valueOf() {
    return this.toString();
  }
}
function T(t4, e2, r2, n2) {
  const o2 = new N(t4, e2, r2, n2);
  return t4 ? o2.toString() : o2;
}
const appName = "RFT Admin Systems";
createServer(
  (page) => createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, /* @__PURE__ */ Object.assign({ "./Pages/Admin/Account/Create.jsx": () => import("./assets/Create-BW3FyuFv.js"), "./Pages/Admin/Account/Edit.jsx": () => import("./assets/Edit-1zJk3qUf.js"), "./Pages/Admin/Account/Index.jsx": () => import("./assets/Index-CpxekOhE.js"), "./Pages/Admin/AccountingAccount/Create.jsx": () => import("./assets/Create-CVz4OcGK.js"), "./Pages/Admin/AccountingAccount/Edit.jsx": () => import("./assets/Edit-CemoNvDr.js"), "./Pages/Admin/AccountingAccount/Index.jsx": () => import("./assets/Index-CIBGOl-8.js"), "./Pages/Admin/AccountingAccount/IvaAccounts.jsx": () => import("./assets/IvaAccounts-BYNsue5z.js"), "./Pages/Admin/AccountingAccountType/Create.jsx": () => import("./assets/Create-Byk6u-iQ.js"), "./Pages/Admin/AccountingAccountType/Edit.jsx": () => import("./assets/Edit-DI6Tp8l1.js"), "./Pages/Admin/AccountingAccountType/Index.jsx": () => import("./assets/Index-DMcDrFHQ.js"), "./Pages/Admin/AccountingAccountType/Show.jsx": () => import("./assets/UserContactData-C9Ikp0Xg.js").then((n2) => n2.S), "./Pages/Admin/Bank/Create.jsx": () => import("./assets/Create-BsYe4lD1.js"), "./Pages/Admin/Bank/Edit.jsx": () => import("./assets/Edit-C-79w20K.js"), "./Pages/Admin/Bank/Index.jsx": () => import("./assets/Index-BFqn883y.js"), "./Pages/Admin/BankAccount/Create.jsx": () => import("./assets/Create-BB_J4ee_.js"), "./Pages/Admin/BankAccount/Edit.jsx": () => import("./assets/Edit-D8qdjQrf.js"), "./Pages/Admin/BankAccount/Index.jsx": () => import("./assets/Index-B-GIbH2J.js"), "./Pages/Admin/BusinessArea/Create.jsx": () => import("./assets/Create-DaJcDr1y.js"), "./Pages/Admin/BusinessArea/Edit.jsx": () => import("./assets/Edit-C3LvdBNZ.js"), "./Pages/Admin/BusinessArea/Index.jsx": () => import("./assets/Index-BcLcWZ3C.js"), "./Pages/Admin/Company/Create.jsx": () => import("./assets/Create-DGX3iPFj.js"), "./Pages/Admin/Company/Edit.jsx": () => import("./assets/Edit-CMRgKHi9.js"), "./Pages/Admin/Company/Index.jsx": () => import("./assets/Index-EJfFWEQF.js"), "./Pages/Admin/Company/Partials/CompanyInfoTab.jsx": () => import("./assets/CompanyInfoTab-CuwVsxh6.js"), "./Pages/Admin/Company/Partials/CompanyUsersTab.jsx": () => import("./assets/CompanyUsersTab-BasOkBy1.js"), "./Pages/Admin/Company/Show.jsx": () => import("./assets/UserContactData-C9Ikp0Xg.js").then((n2) => n2.a), "./Pages/Admin/CompanyAccount/Create.jsx": () => import("./assets/Create-DLO1xdD-.js"), "./Pages/Admin/CompanyAccount/Index.jsx": () => import("./assets/Index-CKwmq-DS.js"), "./Pages/Admin/CompanyModule/Index.jsx": () => import("./assets/Index-DCMj17qh.js"), "./Pages/Admin/CompanySetting/Index.jsx": () => import("./assets/UserContactData-C9Ikp0Xg.js").then((n2) => n2.I), "./Pages/Admin/Content/Create.jsx": () => import("./assets/Create-DaJyUcd1.js"), "./Pages/Admin/Content/Edit.jsx": () => import("./assets/Edit-CAm4LmNk.js"), "./Pages/Admin/Content/Index.jsx": () => import("./assets/Index-CMixxhA_.js"), "./Pages/Admin/CostCenter/Create.jsx": () => import("./assets/Create-DadDSqpa.js"), "./Pages/Admin/CostCenter/Edit.jsx": () => import("./assets/Edit-w-oNgTMy.js"), "./Pages/Admin/CostCenter/Index.jsx": () => import("./assets/Index-CwhzmfAi.js"), "./Pages/Admin/Country/Create.jsx": () => import("./assets/Create-rsNkpVDF.js"), "./Pages/Admin/Country/Edit.jsx": () => import("./assets/Edit-BD8SBjG8.js"), "./Pages/Admin/Country/Index.jsx": () => import("./assets/Index-BcstEvvb.js"), "./Pages/Admin/Crm/Index.jsx": () => import("./assets/UserContactData-C9Ikp0Xg.js").then((n2) => n2.b), "./Pages/Admin/CrmAccount/Create.jsx": () => import("./assets/Create-7gPv25Qo.js"), "./Pages/Admin/CrmAccount/Edit.jsx": () => import("./assets/UserContactData-C9Ikp0Xg.js").then((n2) => n2.E), "./Pages/Admin/CrmAccount/Index.jsx": () => import("./assets/Index-BDJ0m4IS.js"), "./Pages/Admin/CrmContact/Index.jsx": () => import("./assets/UserContactData-C9Ikp0Xg.js").then((n2) => n2.c), "./Pages/Admin/Currency/Create.jsx": () => import("./assets/Create-DXWvMJlu.js"), "./Pages/Admin/Currency/Edit.jsx": () => import("./assets/Edit-CtDqczzt.js"), "./Pages/Admin/Currency/Index.jsx": () => import("./assets/Index-Cx-IQXgj.js"), "./Pages/Admin/Customer/Create.jsx": () => import("./assets/Create-BqrnD5ph.js"), "./Pages/Admin/Customer/Edit.jsx": () => import("./assets/Edit-B9dN-_43.js"), "./Pages/Admin/Customer/Index.jsx": () => import("./assets/Index-Ls_wYFFM.js"), "./Pages/Admin/Customer/Show.jsx": () => import("./assets/UserContactData-C9Ikp0Xg.js").then((n2) => n2.d), "./Pages/Admin/Dashboard/Index.jsx": () => import("./assets/Index-COiDhr5v.js"), "./Pages/Admin/Functionality/Edit.jsx": () => import("./assets/Edit-cFYmW9zd.js"), "./Pages/Admin/Invoice/Edit.jsx": () => import("./assets/UserContactData-C9Ikp0Xg.js").then((n2) => n2.e), "./Pages/Admin/Invoice/Index.jsx": () => import("./assets/UserContactData-C9Ikp0Xg.js").then((n2) => n2.f), "./Pages/Admin/IvaType/Create.jsx": () => import("./assets/Create-C6cV7-QI.js"), "./Pages/Admin/IvaType/Edit.jsx": () => import("./assets/Edit-Bb_H_KNT.js"), "./Pages/Admin/IvaType/Index.jsx": () => import("./assets/Index-KxNXPThe.js"), "./Pages/Admin/Marketing/Index.jsx": () => import("./assets/UserContactData-C9Ikp0Xg.js").then((n2) => n2.g), "./Pages/Admin/Module/Create.jsx": () => import("./assets/Create-B3xI4y5e.js"), "./Pages/Admin/Module/Edit.jsx": () => import("./assets/Edit-CePb4G2P.js"), "./Pages/Admin/Module/Index.jsx": () => import("./assets/Index--aMzOn70.js"), "./Pages/Admin/Module/Partials/FunctionalitiesTab.jsx": () => import("./assets/FunctionalitiesTab-BQqFaYAF.js"), "./Pages/Admin/Module/Partials/ModuleTab.jsx": () => import("./assets/ModuleTab-DVxGCaci.js"), "./Pages/Admin/Partials/Header.jsx": () => import("./assets/Header-DmTv-HRw.js"), "./Pages/Admin/Partials/Sidebar.jsx": () => import("./assets/Sidebar-j3CEPiJG.js").then((n2) => n2.a), "./Pages/Admin/Permission/Create.jsx": () => import("./assets/Create-CbjVtupX.js"), "./Pages/Admin/Permission/Index.jsx": () => import("./assets/Index-BRPsFe1g.js"), "./Pages/Admin/Product/Create.jsx": () => import("./assets/Create-VpvjVV6-.js"), "./Pages/Admin/Product/Edit.jsx": () => import("./assets/Edit-Nwkf4urX.js"), "./Pages/Admin/Product/Index.jsx": () => import("./assets/Index-xansn_tX.js"), "./Pages/Admin/Product/Partials/ProductAttributes.jsx": () => import("./assets/ProductAttributes-DfhlX4PD.js"), "./Pages/Admin/Product/Partials/ProductCategories.jsx": () => import("./assets/ProductCategories-DxrUwiyp.js"), "./Pages/Admin/Product/Partials/ProductData.jsx": () => import("./assets/ProductData-D1FiiB9E.js"), "./Pages/Admin/Product/Partials/ProductImages.jsx": () => import("./assets/ProductImages-CfbDEuqR.js"), "./Pages/Admin/Product/Partials/ProductPriceHistory.jsx": () => import("./assets/ProductPriceHistory-DJ1_FbtV.js"), "./Pages/Admin/Product/Partials/ProductPurchases.jsx": () => import("./assets/ProductPurchases-DUz_wQD_.js"), "./Pages/Admin/Product/Partials/ProductSales.jsx": () => import("./assets/ProductSales-BiaYp-Fs.js"), "./Pages/Admin/Product/Partials/ProductSerialization.jsx": () => import("./assets/ProductSerialization-Bq3-l9RQ.js"), "./Pages/Admin/Product/Partials/ProductUnits.jsx": () => import("./assets/ProductUnits-CkO8_a0Q.js"), "./Pages/Admin/ProductPattern/Create.jsx": () => import("./assets/Create-Dali1UVB.js"), "./Pages/Admin/ProductPattern/Edit.jsx": () => import("./assets/Edit-EH0NpfsA.js"), "./Pages/Admin/ProductPattern/Index.jsx": () => import("./assets/Index-esdbmosi.js"), "./Pages/Admin/Provider/Create.jsx": () => import("./assets/UserContactData-C9Ikp0Xg.js").then((n2) => n2.C), "./Pages/Admin/Provider/Edit.jsx": () => import("./assets/UserContactData-C9Ikp0Xg.js").then((n2) => n2.h), "./Pages/Admin/Provider/Index.jsx": () => import("./assets/Index-DxaSDZXL.js"), "./Pages/Admin/Provider/Show.jsx": () => import("./assets/UserContactData-C9Ikp0Xg.js").then((n2) => n2.i), "./Pages/Admin/Province/Create.jsx": () => import("./assets/Create-D0Ay6tCx.js"), "./Pages/Admin/Province/Edit.jsx": () => import("./assets/Edit-DG0fDddj.js"), "./Pages/Admin/Province/Index.jsx": () => import("./assets/Index-C_gIATPX.js"), "./Pages/Admin/Role/Create.jsx": () => import("./assets/Create-NN4wEPaT.js"), "./Pages/Admin/Role/Edit.jsx": () => import("./assets/Edit-DKaM4Wfb.js"), "./Pages/Admin/Role/Index.jsx": () => import("./assets/Index-DvLN17TI.js"), "./Pages/Admin/StockMovement/Create.jsx": () => import("./assets/Create-BHgGdyFn.js"), "./Pages/Admin/StockMovement/Edit.jsx": () => import("./assets/Edit-Bp8WEoHl.js"), "./Pages/Admin/StockMovement/Index.jsx": () => import("./assets/Index-C3DJ3B0F.js"), "./Pages/Admin/Town/Create.jsx": () => import("./assets/Create-LRFLoQMk.js"), "./Pages/Admin/Town/Edit.jsx": () => import("./assets/Edit-De7N5c_B.js"), "./Pages/Admin/Town/Index.jsx": () => import("./assets/Index-CZ8HNe4e.js"), "./Pages/Admin/Unit/Create.jsx": () => import("./assets/Create-PC0FGWo-.js"), "./Pages/Admin/Unit/Edit.jsx": () => import("./assets/Edit-DX5lJ9tV.js"), "./Pages/Admin/Unit/Index.jsx": () => import("./assets/Index-VaXmiiGm.js"), "./Pages/Admin/User/Create.jsx": () => import("./assets/Create-DIzwTHbi.js"), "./Pages/Admin/User/Edit.jsx": () => import("./assets/Edit-cPY1frGG.js"), "./Pages/Admin/User/Index.jsx": () => import("./assets/Index-BuHXHm7Q.js"), "./Pages/Admin/User/Partials/UserCompaniesData.jsx": () => import("./assets/UserContactData-C9Ikp0Xg.js").then((n2) => n2.U), "./Pages/Admin/User/Partials/UserContactData.jsx": () => import("./assets/UserContactData-C9Ikp0Xg.js").then((n2) => n2.j), "./Pages/Admin/User/Partials/UserImages.jsx": () => import("./assets/UserImages-Dc4l52Fx.js"), "./Pages/Admin/User/Partials/UserPassword.jsx": () => import("./assets/UserPassword-a1uG8SKf.js"), "./Pages/Admin/User/Partials/UserPersonalData.jsx": () => import("./assets/UserPersonalData-D6ocbixU.js"), "./Pages/Admin/Workplace/Create.jsx": () => import("./assets/Create-Cabzbjsh.js"), "./Pages/Admin/Workplace/Edit.jsx": () => import("./assets/Edit-B-b-DN1K.js"), "./Pages/Admin/Workplace/Index.jsx": () => import("./assets/Index-BmhV7W5z.js"), "./Pages/Auth/ConfirmPassword.jsx": () => import("./assets/ConfirmPassword-BGmm3Dzp.js"), "./Pages/Auth/ForgotPassword.jsx": () => import("./assets/ForgotPassword-CGAS9Psq.js"), "./Pages/Auth/Login.jsx": () => import("./assets/Login-C-3nm_T7.js"), "./Pages/Auth/Register.jsx": () => import("./assets/Register-CwIDM1MX.js"), "./Pages/Auth/ResetPassword.jsx": () => import("./assets/ResetPassword-hbpAfnMm.js"), "./Pages/Auth/VerifyEmail.jsx": () => import("./assets/VerifyEmail-BEURGJMC.js"), "./Pages/Dashboard.jsx": () => import("./assets/Dashboard-CHMTiPbk.js"), "./Pages/Errors/Forbidden.jsx": () => import("./assets/Forbidden-BFw5aLe6.js"), "./Pages/Frontend/Home.jsx": () => import("./assets/Home-DfhqN21h.js"), "./Pages/Frontend/Partials/Header.jsx": () => import("./assets/Header-CrOe23WK.js"), "./Pages/Profile/Edit.jsx": () => import("./assets/Edit-Cvm7ppos.js"), "./Pages/Profile/Partials/DeleteUserForm.jsx": () => import("./assets/DeleteUserForm-CzbztYOT.js"), "./Pages/Profile/Partials/UpdatePasswordForm.jsx": () => import("./assets/UpdatePasswordForm-rMFLFJYg.js"), "./Pages/Profile/Partials/UpdateProfileInformationForm.jsx": () => import("./assets/UpdateProfileInformationForm-DuzRFeAh.js"), "./Pages/Welcome.jsx": () => import("./assets/Welcome-Drqm0efl.js") })),
    setup: ({ App, props }) => {
      global.route = (name, params, absolute) => T(name, params, absolute, {
        ...page.props.ziggy,
        location: new URL(page.props.ziggy.location)
      });
      return /* @__PURE__ */ jsx(App, { ...props });
    }
  })
);
