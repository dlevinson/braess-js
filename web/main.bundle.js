(() => {
  var __create = Object.create;
  var __getProtoOf = Object.getPrototypeOf;
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __toESM = (mod, isNodeMode, target) => {
    target = mod != null ? __create(__getProtoOf(mod)) : {};
    const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
    for (let key of __getOwnPropNames(mod))
      if (!__hasOwnProp.call(to, key))
        __defProp(to, key, {
          get: () => mod[key],
          enumerable: true
        });
    return to;
  };
  var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

  // node_modules/papaparse/papaparse.min.js
  var require_papaparse_min = __commonJS((exports, module) => {
    ((e, t) => {
      typeof define == "function" && define.amd ? define([], t) : typeof module == "object" && typeof exports != "undefined" ? module.exports = t() : e.Papa = t();
    })(exports, function r() {
      var n = typeof self != "undefined" ? self : typeof window != "undefined" ? window : n !== undefined ? n : {};
      var d, s = !n.document && !!n.postMessage, a = n.IS_PAPA_WORKER || false, o = {}, h = 0, v = {};
      function u(e) {
        this._handle = null, this._finished = false, this._completed = false, this._halted = false, this._input = null, this._baseIndex = 0, this._partialLine = "", this._rowCount = 0, this._start = 0, this._nextChunk = null, this.isFirstChunk = true, this._completeResults = { data: [], errors: [], meta: {} }, function(e2) {
          var t = b(e2);
          t.chunkSize = parseInt(t.chunkSize), e2.step || e2.chunk || (t.chunkSize = null);
          this._handle = new i(t), (this._handle.streamer = this)._config = t;
        }.call(this, e), this.parseChunk = function(t, e2) {
          var i2 = parseInt(this._config.skipFirstNLines) || 0;
          if (this.isFirstChunk && 0 < i2) {
            let e3 = this._config.newline;
            e3 || (r2 = this._config.quoteChar || '"', e3 = this._handle.guessLineEndings(t, r2)), t = [...t.split(e3).slice(i2)].join(e3);
          }
          this.isFirstChunk && U(this._config.beforeFirstChunk) && (r2 = this._config.beforeFirstChunk(t)) !== undefined && (t = r2), this.isFirstChunk = false, this._halted = false;
          var i2 = this._partialLine + t, r2 = (this._partialLine = "", this._handle.parse(i2, this._baseIndex, !this._finished));
          if (!this._handle.paused() && !this._handle.aborted()) {
            t = r2.meta.cursor, i2 = (this._finished || (this._partialLine = i2.substring(t - this._baseIndex), this._baseIndex = t), r2 && r2.data && (this._rowCount += r2.data.length), this._finished || this._config.preview && this._rowCount >= this._config.preview);
            if (a)
              n.postMessage({ results: r2, workerId: v.WORKER_ID, finished: i2 });
            else if (U(this._config.chunk) && !e2) {
              if (this._config.chunk(r2, this._handle), this._handle.paused() || this._handle.aborted())
                return void (this._halted = true);
              this._completeResults = r2 = undefined;
            }
            return this._config.step || this._config.chunk || (this._completeResults.data = this._completeResults.data.concat(r2.data), this._completeResults.errors = this._completeResults.errors.concat(r2.errors), this._completeResults.meta = r2.meta), this._completed || !i2 || !U(this._config.complete) || r2 && r2.meta.aborted || (this._config.complete(this._completeResults, this._input), this._completed = true), i2 || r2 && r2.meta.paused || this._nextChunk(), r2;
          }
          this._halted = true;
        }, this._sendError = function(e2) {
          U(this._config.error) ? this._config.error(e2) : a && this._config.error && n.postMessage({ workerId: v.WORKER_ID, error: e2, finished: false });
        };
      }
      function f(e) {
        var r2;
        (e = e || {}).chunkSize || (e.chunkSize = v.RemoteChunkSize), u.call(this, e), this._nextChunk = s ? function() {
          this._readChunk(), this._chunkLoaded();
        } : function() {
          this._readChunk();
        }, this.stream = function(e2) {
          this._input = e2, this._nextChunk();
        }, this._readChunk = function() {
          if (this._finished)
            this._chunkLoaded();
          else {
            if (r2 = new XMLHttpRequest, this._config.withCredentials && (r2.withCredentials = this._config.withCredentials), s || (r2.onload = y(this._chunkLoaded, this), r2.onerror = y(this._chunkError, this)), r2.open(this._config.downloadRequestBody ? "POST" : "GET", this._input, !s), this._config.downloadRequestHeaders) {
              var e2, t = this._config.downloadRequestHeaders;
              for (e2 in t)
                r2.setRequestHeader(e2, t[e2]);
            }
            var i2;
            this._config.chunkSize && (i2 = this._start + this._config.chunkSize - 1, r2.setRequestHeader("Range", "bytes=" + this._start + "-" + i2));
            try {
              r2.send(this._config.downloadRequestBody);
            } catch (e3) {
              this._chunkError(e3.message);
            }
            s && r2.status === 0 && this._chunkError();
          }
        }, this._chunkLoaded = function() {
          r2.readyState === 4 && (r2.status < 200 || 400 <= r2.status ? this._chunkError() : (this._start += this._config.chunkSize || r2.responseText.length, this._finished = !this._config.chunkSize || this._start >= ((e2) => (e2 = e2.getResponseHeader("Content-Range")) !== null ? parseInt(e2.substring(e2.lastIndexOf("/") + 1)) : -1)(r2), this.parseChunk(r2.responseText)));
        }, this._chunkError = function(e2) {
          e2 = r2.statusText || e2;
          this._sendError(new Error(e2));
        };
      }
      function l(e) {
        (e = e || {}).chunkSize || (e.chunkSize = v.LocalChunkSize), u.call(this, e);
        var i2, r2, n2 = typeof FileReader != "undefined";
        this.stream = function(e2) {
          this._input = e2, r2 = e2.slice || e2.webkitSlice || e2.mozSlice, n2 ? ((i2 = new FileReader).onload = y(this._chunkLoaded, this), i2.onerror = y(this._chunkError, this)) : i2 = new FileReaderSync, this._nextChunk();
        }, this._nextChunk = function() {
          this._finished || this._config.preview && !(this._rowCount < this._config.preview) || this._readChunk();
        }, this._readChunk = function() {
          var e2 = this._input, t = (this._config.chunkSize && (t = Math.min(this._start + this._config.chunkSize, this._input.size), e2 = r2.call(e2, this._start, t)), i2.readAsText(e2, this._config.encoding));
          n2 || this._chunkLoaded({ target: { result: t } });
        }, this._chunkLoaded = function(e2) {
          this._start += this._config.chunkSize, this._finished = !this._config.chunkSize || this._start >= this._input.size, this.parseChunk(e2.target.result);
        }, this._chunkError = function() {
          this._sendError(i2.error);
        };
      }
      function c(e) {
        var i2;
        u.call(this, e = e || {}), this.stream = function(e2) {
          return i2 = e2, this._nextChunk();
        }, this._nextChunk = function() {
          var e2, t;
          if (!this._finished)
            return e2 = this._config.chunkSize, i2 = e2 ? (t = i2.substring(0, e2), i2.substring(e2)) : (t = i2, ""), this._finished = !i2, this.parseChunk(t);
        };
      }
      function p(e) {
        u.call(this, e = e || {});
        var t = [], i2 = true, r2 = false;
        this.pause = function() {
          u.prototype.pause.apply(this, arguments), this._input.pause();
        }, this.resume = function() {
          u.prototype.resume.apply(this, arguments), this._input.resume();
        }, this.stream = function(e2) {
          this._input = e2, this._input.on("data", this._streamData), this._input.on("end", this._streamEnd), this._input.on("error", this._streamError);
        }, this._checkIsFinished = function() {
          r2 && t.length === 1 && (this._finished = true);
        }, this._nextChunk = function() {
          this._checkIsFinished(), t.length ? this.parseChunk(t.shift()) : i2 = true;
        }, this._streamData = y(function(e2) {
          try {
            t.push(typeof e2 == "string" ? e2 : e2.toString(this._config.encoding)), i2 && (i2 = false, this._checkIsFinished(), this.parseChunk(t.shift()));
          } catch (e3) {
            this._streamError(e3);
          }
        }, this), this._streamError = y(function(e2) {
          this._streamCleanUp(), this._sendError(e2);
        }, this), this._streamEnd = y(function() {
          this._streamCleanUp(), r2 = true, this._streamData("");
        }, this), this._streamCleanUp = y(function() {
          this._input.removeListener("data", this._streamData), this._input.removeListener("end", this._streamEnd), this._input.removeListener("error", this._streamError);
        }, this);
      }
      function i(m2) {
        var n2, s2, a2, t, o2 = Math.pow(2, 53), h2 = -o2, u2 = /^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/, d2 = /^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/, i2 = this, r2 = 0, f2 = 0, l2 = false, e = false, c2 = [], p2 = { data: [], errors: [], meta: {} };
        function y2(e2) {
          return m2.skipEmptyLines === "greedy" ? e2.join("").trim() === "" : e2.length === 1 && e2[0].length === 0;
        }
        function g2() {
          if (p2 && a2 && (k("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + v.DefaultDelimiter + "'"), a2 = false), m2.skipEmptyLines && (p2.data = p2.data.filter(function(e3) {
            return !y2(e3);
          })), _2()) {
            let t3 = function(e3, t4) {
              U(m2.transformHeader) && (e3 = m2.transformHeader(e3, t4)), c2.push(e3);
            };
            var t2 = t3;
            if (p2)
              if (Array.isArray(p2.data[0])) {
                for (var e2 = 0;_2() && e2 < p2.data.length; e2++)
                  p2.data[e2].forEach(t3);
                p2.data.splice(0, 1);
              } else
                p2.data.forEach(t3);
          }
          function i3(e3, t3) {
            for (var i4 = m2.header ? {} : [], r4 = 0;r4 < e3.length; r4++) {
              var n3 = r4, s3 = e3[r4], s3 = ((e4, t4) => ((e5) => (m2.dynamicTypingFunction && m2.dynamicTyping[e5] === undefined && (m2.dynamicTyping[e5] = m2.dynamicTypingFunction(e5)), (m2.dynamicTyping[e5] || m2.dynamicTyping) === true))(e4) ? t4 === "true" || t4 === "TRUE" || t4 !== "false" && t4 !== "FALSE" && (((e5) => {
                if (u2.test(e5)) {
                  e5 = parseFloat(e5);
                  if (h2 < e5 && e5 < o2)
                    return 1;
                }
              })(t4) ? parseFloat(t4) : d2.test(t4) ? new Date(t4) : t4 === "" ? null : t4) : t4)(n3 = m2.header ? r4 >= c2.length ? "__parsed_extra" : c2[r4] : n3, s3 = m2.transform ? m2.transform(s3, n3) : s3);
              n3 === "__parsed_extra" ? (i4[n3] = i4[n3] || [], i4[n3].push(s3)) : i4[n3] = s3;
            }
            return m2.header && (r4 > c2.length ? k("FieldMismatch", "TooManyFields", "Too many fields: expected " + c2.length + " fields but parsed " + r4, f2 + t3) : r4 < c2.length && k("FieldMismatch", "TooFewFields", "Too few fields: expected " + c2.length + " fields but parsed " + r4, f2 + t3)), i4;
          }
          var r3;
          p2 && (m2.header || m2.dynamicTyping || m2.transform) && (r3 = 1, !p2.data.length || Array.isArray(p2.data[0]) ? (p2.data = p2.data.map(i3), r3 = p2.data.length) : p2.data = i3(p2.data, 0), m2.header && p2.meta && (p2.meta.fields = c2), f2 += r3);
        }
        function _2() {
          return m2.header && c2.length === 0;
        }
        function k(e2, t2, i3, r3) {
          e2 = { type: e2, code: t2, message: i3 };
          r3 !== undefined && (e2.row = r3), p2.errors.push(e2);
        }
        U(m2.step) && (t = m2.step, m2.step = function(e2) {
          p2 = e2, _2() ? g2() : (g2(), p2.data.length !== 0 && (r2 += e2.data.length, m2.preview && r2 > m2.preview ? s2.abort() : (p2.data = p2.data[0], t(p2, i2))));
        }), this.parse = function(e2, t2, i3) {
          var r3 = m2.quoteChar || '"', r3 = (m2.newline || (m2.newline = this.guessLineEndings(e2, r3)), a2 = false, m2.delimiter ? U(m2.delimiter) && (m2.delimiter = m2.delimiter(e2), p2.meta.delimiter = m2.delimiter) : ((r3 = ((e3, t3, i4, r4, n3) => {
            var s3, a3, o3, h3;
            n3 = n3 || [",", "\t", "|", ";", v.RECORD_SEP, v.UNIT_SEP];
            for (var u3 = 0;u3 < n3.length; u3++) {
              for (var d3, f3 = n3[u3], l3 = 0, c3 = 0, p3 = 0, g3 = (o3 = undefined, new E({ comments: r4, delimiter: f3, newline: t3, preview: 10 }).parse(e3)), _3 = 0;_3 < g3.data.length; _3++)
                i4 && y2(g3.data[_3]) ? p3++ : (d3 = g3.data[_3].length, c3 += d3, o3 === undefined ? o3 = d3 : 0 < d3 && (l3 += Math.abs(d3 - o3), o3 = d3));
              0 < g3.data.length && (c3 /= g3.data.length - p3), (a3 === undefined || l3 <= a3) && (h3 === undefined || h3 < c3) && 1.99 < c3 && (a3 = l3, s3 = f3, h3 = c3);
            }
            return { successful: !!(m2.delimiter = s3), bestDelimiter: s3 };
          })(e2, m2.newline, m2.skipEmptyLines, m2.comments, m2.delimitersToGuess)).successful ? m2.delimiter = r3.bestDelimiter : (a2 = true, m2.delimiter = v.DefaultDelimiter), p2.meta.delimiter = m2.delimiter), b(m2));
          return m2.preview && m2.header && r3.preview++, n2 = e2, s2 = new E(r3), p2 = s2.parse(n2, t2, i3), g2(), l2 ? { meta: { paused: true } } : p2 || { meta: { paused: false } };
        }, this.paused = function() {
          return l2;
        }, this.pause = function() {
          l2 = true, s2.abort(), n2 = U(m2.chunk) ? "" : n2.substring(s2.getCharIndex());
        }, this.resume = function() {
          i2.streamer._halted ? (l2 = false, i2.streamer.parseChunk(n2, true)) : setTimeout(i2.resume, 3);
        }, this.aborted = function() {
          return e;
        }, this.abort = function() {
          e = true, s2.abort(), p2.meta.aborted = true, U(m2.complete) && m2.complete(p2), n2 = "";
        }, this.guessLineEndings = function(e2, t2) {
          e2 = e2.substring(0, 1048576);
          var t2 = new RegExp(P(t2) + "([^]*?)" + P(t2), "gm"), i3 = (e2 = e2.replace(t2, "")).split("\r"), t2 = e2.split(`
`), e2 = 1 < t2.length && t2[0].length < i3[0].length;
          if (i3.length === 1 || e2)
            return `
`;
          for (var r3 = 0, n3 = 0;n3 < i3.length; n3++)
            i3[n3][0] === `
` && r3++;
          return r3 >= i3.length / 2 ? `\r
` : "\r";
        };
      }
      function P(e) {
        return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
      function E(C) {
        var S = (C = C || {}).delimiter, O = C.newline, x = C.comments, I = C.step, A = C.preview, T = C.fastMode, D = null, L = false, F = C.quoteChar == null ? '"' : C.quoteChar, j = F;
        if (C.escapeChar !== undefined && (j = C.escapeChar), (typeof S != "string" || -1 < v.BAD_DELIMITERS.indexOf(S)) && (S = ","), x === S)
          throw new Error("Comment character same as delimiter");
        x === true ? x = "#" : (typeof x != "string" || -1 < v.BAD_DELIMITERS.indexOf(x)) && (x = false), O !== `
` && O !== "\r" && O !== `\r
` && (O = `
`);
        var z = 0, M = false;
        this.parse = function(i2, t, r2) {
          if (typeof i2 != "string")
            throw new Error("Input must be a string");
          var n2 = i2.length, e = S.length, s2 = O.length, a2 = x.length, o2 = U(I), h2 = [], u2 = [], d2 = [], f2 = z = 0;
          if (!i2)
            return w();
          if (T || T !== false && i2.indexOf(F) === -1) {
            for (var l2 = i2.split(O), c2 = 0;c2 < l2.length; c2++) {
              if (d2 = l2[c2], z += d2.length, c2 !== l2.length - 1)
                z += O.length;
              else if (r2)
                return w();
              if (!x || d2.substring(0, a2) !== x) {
                if (o2) {
                  if (h2 = [], k(d2.split(S)), R(), M)
                    return w();
                } else
                  k(d2.split(S));
                if (A && A <= c2)
                  return h2 = h2.slice(0, A), w(true);
              }
            }
            return w();
          }
          for (var p2 = i2.indexOf(S, z), g2 = i2.indexOf(O, z), _2 = new RegExp(P(j) + P(F), "g"), m2 = i2.indexOf(F, z);; )
            if (i2[z] === F)
              for (m2 = z, z++;; ) {
                if ((m2 = i2.indexOf(F, m2 + 1)) === -1)
                  return r2 || u2.push({ type: "Quotes", code: "MissingQuotes", message: "Quoted field unterminated", row: h2.length, index: z }), E2();
                if (m2 === n2 - 1)
                  return E2(i2.substring(z, m2).replace(_2, F));
                if (F === j && i2[m2 + 1] === j)
                  m2++;
                else if (F === j || m2 === 0 || i2[m2 - 1] !== j) {
                  p2 !== -1 && p2 < m2 + 1 && (p2 = i2.indexOf(S, m2 + 1));
                  var y2 = v2((g2 = g2 !== -1 && g2 < m2 + 1 ? i2.indexOf(O, m2 + 1) : g2) === -1 ? p2 : Math.min(p2, g2));
                  if (i2.substr(m2 + 1 + y2, e) === S) {
                    d2.push(i2.substring(z, m2).replace(_2, F)), i2[z = m2 + 1 + y2 + e] !== F && (m2 = i2.indexOf(F, z)), p2 = i2.indexOf(S, z), g2 = i2.indexOf(O, z);
                    break;
                  }
                  y2 = v2(g2);
                  if (i2.substring(m2 + 1 + y2, m2 + 1 + y2 + s2) === O) {
                    if (d2.push(i2.substring(z, m2).replace(_2, F)), b2(m2 + 1 + y2 + s2), p2 = i2.indexOf(S, z), m2 = i2.indexOf(F, z), o2 && (R(), M))
                      return w();
                    if (A && h2.length >= A)
                      return w(true);
                    break;
                  }
                  u2.push({ type: "Quotes", code: "InvalidQuotes", message: "Trailing quote on quoted field is malformed", row: h2.length, index: z }), m2++;
                }
              }
            else if (x && d2.length === 0 && i2.substring(z, z + a2) === x) {
              if (g2 === -1)
                return w();
              z = g2 + s2, g2 = i2.indexOf(O, z), p2 = i2.indexOf(S, z);
            } else if (p2 !== -1 && (p2 < g2 || g2 === -1))
              d2.push(i2.substring(z, p2)), z = p2 + e, p2 = i2.indexOf(S, z);
            else {
              if (g2 === -1)
                break;
              if (d2.push(i2.substring(z, g2)), b2(g2 + s2), o2 && (R(), M))
                return w();
              if (A && h2.length >= A)
                return w(true);
            }
          return E2();
          function k(e2) {
            h2.push(e2), f2 = z;
          }
          function v2(e2) {
            var t2 = 0;
            return t2 = e2 !== -1 && (e2 = i2.substring(m2 + 1, e2)) && e2.trim() === "" ? e2.length : t2;
          }
          function E2(e2) {
            return r2 || (e2 === undefined && (e2 = i2.substring(z)), d2.push(e2), z = n2, k(d2), o2 && R()), w();
          }
          function b2(e2) {
            z = e2, k(d2), d2 = [], g2 = i2.indexOf(O, z);
          }
          function w(e2) {
            if (C.header && !t && h2.length && !L) {
              var s3 = h2[0], a3 = Object.create(null), o3 = new Set(s3);
              let n3 = false;
              for (let r3 = 0;r3 < s3.length; r3++) {
                let i3 = s3[r3];
                if (a3[i3 = U(C.transformHeader) ? C.transformHeader(i3, r3) : i3]) {
                  let e3, t2 = a3[i3];
                  for (;e3 = i3 + "_" + t2, t2++, o3.has(e3); )
                    ;
                  o3.add(e3), s3[r3] = e3, a3[i3]++, n3 = true, (D = D === null ? {} : D)[e3] = i3;
                } else
                  a3[i3] = 1, s3[r3] = i3;
                o3.add(i3);
              }
              n3 && console.warn("Duplicate headers found and renamed."), L = true;
            }
            return { data: h2, errors: u2, meta: { delimiter: S, linebreak: O, aborted: M, truncated: !!e2, cursor: f2 + (t || 0), renamedHeaders: D } };
          }
          function R() {
            I(w()), h2 = [], u2 = [];
          }
        }, this.abort = function() {
          M = true;
        }, this.getCharIndex = function() {
          return z;
        };
      }
      function g(e) {
        var t = e.data, i2 = o[t.workerId], r2 = false;
        if (t.error)
          i2.userError(t.error, t.file);
        else if (t.results && t.results.data) {
          var n2 = { abort: function() {
            r2 = true, _(t.workerId, { data: [], errors: [], meta: { aborted: true } });
          }, pause: m, resume: m };
          if (U(i2.userStep)) {
            for (var s2 = 0;s2 < t.results.data.length && (i2.userStep({ data: t.results.data[s2], errors: t.results.errors, meta: t.results.meta }, n2), !r2); s2++)
              ;
            delete t.results;
          } else
            U(i2.userChunk) && (i2.userChunk(t.results, n2, t.file), delete t.results);
        }
        t.finished && !r2 && _(t.workerId, t.results);
      }
      function _(e, t) {
        var i2 = o[e];
        U(i2.userComplete) && i2.userComplete(t), i2.terminate(), delete o[e];
      }
      function m() {
        throw new Error("Not implemented.");
      }
      function b(e) {
        if (typeof e != "object" || e === null)
          return e;
        var t, i2 = Array.isArray(e) ? [] : {};
        for (t in e)
          i2[t] = b(e[t]);
        return i2;
      }
      function y(e, t) {
        return function() {
          e.apply(t, arguments);
        };
      }
      function U(e) {
        return typeof e == "function";
      }
      return v.parse = function(e, t) {
        var i2 = (t = t || {}).dynamicTyping || false;
        U(i2) && (t.dynamicTypingFunction = i2, i2 = {});
        if (t.dynamicTyping = i2, t.transform = !!U(t.transform) && t.transform, !t.worker || !v.WORKERS_SUPPORTED)
          return i2 = null, v.NODE_STREAM_INPUT, typeof e == "string" ? (e = ((e2) => e2.charCodeAt(0) !== 65279 ? e2 : e2.slice(1))(e), i2 = new (t.download ? f : c)(t)) : e.readable === true && U(e.read) && U(e.on) ? i2 = new p(t) : (n.File && e instanceof File || e instanceof Object) && (i2 = new l(t)), i2.stream(e);
        (i2 = (() => {
          var e2;
          return !!v.WORKERS_SUPPORTED && (e2 = (() => {
            var e3 = n.URL || n.webkitURL || null, t2 = r.toString();
            return v.BLOB_URL || (v.BLOB_URL = e3.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ", "(", t2, ")();"], { type: "text/javascript" })));
          })(), (e2 = new n.Worker(e2)).onmessage = g, e2.id = h++, o[e2.id] = e2);
        })()).userStep = t.step, i2.userChunk = t.chunk, i2.userComplete = t.complete, i2.userError = t.error, t.step = U(t.step), t.chunk = U(t.chunk), t.complete = U(t.complete), t.error = U(t.error), delete t.worker, i2.postMessage({ input: e, config: t, workerId: i2.id });
      }, v.unparse = function(e, t) {
        var n2 = false, _2 = true, m2 = ",", y2 = `\r
`, s2 = '"', a2 = s2 + s2, i2 = false, r2 = null, o2 = false, h2 = ((() => {
          if (typeof t == "object") {
            if (typeof t.delimiter != "string" || v.BAD_DELIMITERS.filter(function(e2) {
              return t.delimiter.indexOf(e2) !== -1;
            }).length || (m2 = t.delimiter), typeof t.quotes != "boolean" && typeof t.quotes != "function" && !Array.isArray(t.quotes) || (n2 = t.quotes), typeof t.skipEmptyLines != "boolean" && typeof t.skipEmptyLines != "string" || (i2 = t.skipEmptyLines), typeof t.newline == "string" && (y2 = t.newline), typeof t.quoteChar == "string" && (s2 = t.quoteChar), typeof t.header == "boolean" && (_2 = t.header), Array.isArray(t.columns)) {
              if (t.columns.length === 0)
                throw new Error("Option columns is empty");
              r2 = t.columns;
            }
            t.escapeChar !== undefined && (a2 = t.escapeChar + s2), t.escapeFormulae instanceof RegExp ? o2 = t.escapeFormulae : typeof t.escapeFormulae == "boolean" && t.escapeFormulae && (o2 = /^[=+\-@\t\r].*$/);
          }
        })(), new RegExp(P(s2), "g"));
        typeof e == "string" && (e = JSON.parse(e));
        if (Array.isArray(e)) {
          if (!e.length || Array.isArray(e[0]))
            return u2(null, e, i2);
          if (typeof e[0] == "object")
            return u2(r2 || Object.keys(e[0]), e, i2);
        } else if (typeof e == "object")
          return typeof e.data == "string" && (e.data = JSON.parse(e.data)), Array.isArray(e.data) && (e.fields || (e.fields = e.meta && e.meta.fields || r2), e.fields || (e.fields = Array.isArray(e.data[0]) ? e.fields : typeof e.data[0] == "object" ? Object.keys(e.data[0]) : []), Array.isArray(e.data[0]) || typeof e.data[0] == "object" || (e.data = [e.data])), u2(e.fields || [], e.data || [], i2);
        throw new Error("Unable to serialize unrecognized input");
        function u2(e2, t2, i3) {
          var r3 = "", n3 = (typeof e2 == "string" && (e2 = JSON.parse(e2)), typeof t2 == "string" && (t2 = JSON.parse(t2)), Array.isArray(e2) && 0 < e2.length), s3 = !Array.isArray(t2[0]);
          if (n3 && _2) {
            for (var a3 = 0;a3 < e2.length; a3++)
              0 < a3 && (r3 += m2), r3 += k(e2[a3], a3);
            0 < t2.length && (r3 += y2);
          }
          for (var o3 = 0;o3 < t2.length; o3++) {
            var h3 = (n3 ? e2 : t2[o3]).length, u3 = false, d2 = n3 ? Object.keys(t2[o3]).length === 0 : t2[o3].length === 0;
            if (i3 && !n3 && (u3 = i3 === "greedy" ? t2[o3].join("").trim() === "" : t2[o3].length === 1 && t2[o3][0].length === 0), i3 === "greedy" && n3) {
              for (var f2 = [], l2 = 0;l2 < h3; l2++) {
                var c2 = s3 ? e2[l2] : l2;
                f2.push(t2[o3][c2]);
              }
              u3 = f2.join("").trim() === "";
            }
            if (!u3) {
              for (var p2 = 0;p2 < h3; p2++) {
                0 < p2 && !d2 && (r3 += m2);
                var g2 = n3 && s3 ? e2[p2] : p2;
                r3 += k(t2[o3][g2], p2);
              }
              o3 < t2.length - 1 && (!i3 || 0 < h3 && !d2) && (r3 += y2);
            }
          }
          return r3;
        }
        function k(e2, t2) {
          var i3, r3;
          return e2 == null ? "" : e2.constructor === Date ? JSON.stringify(e2).slice(1, 25) : (r3 = false, o2 && typeof e2 == "string" && o2.test(e2) && (e2 = "'" + e2, r3 = true), i3 = e2.toString().replace(h2, a2), (r3 = r3 || n2 === true || typeof n2 == "function" && n2(e2, t2) || Array.isArray(n2) && n2[t2] || ((e3, t3) => {
            for (var i4 = 0;i4 < t3.length; i4++)
              if (-1 < e3.indexOf(t3[i4]))
                return true;
            return false;
          })(i3, v.BAD_DELIMITERS) || -1 < i3.indexOf(m2) || i3.charAt(0) === " " || i3.charAt(i3.length - 1) === " ") ? s2 + i3 + s2 : i3);
        }
      }, v.RECORD_SEP = String.fromCharCode(30), v.UNIT_SEP = String.fromCharCode(31), v.BYTE_ORDER_MARK = "\uFEFF", v.BAD_DELIMITERS = ["\r", `
`, '"', v.BYTE_ORDER_MARK], v.WORKERS_SUPPORTED = !s && !!n.Worker, v.NODE_STREAM_INPUT = 1, v.LocalChunkSize = 10485760, v.RemoteChunkSize = 5242880, v.DefaultDelimiter = ",", v.Parser = E, v.ParserHandle = i, v.NetworkStreamer = f, v.FileStreamer = l, v.StringStreamer = c, v.ReadableStreamStreamer = p, n.jQuery && ((d = n.jQuery).fn.parse = function(o2) {
        var i2 = o2.config || {}, h2 = [];
        return this.each(function(e2) {
          if (!(d(this).prop("tagName").toUpperCase() === "INPUT" && d(this).attr("type").toLowerCase() === "file" && n.FileReader) || !this.files || this.files.length === 0)
            return true;
          for (var t = 0;t < this.files.length; t++)
            h2.push({ file: this.files[t], inputElem: this, instanceConfig: d.extend({}, i2) });
        }), e(), this;
        function e() {
          if (h2.length === 0)
            U(o2.complete) && o2.complete();
          else {
            var e2, t, i3, r2, n2 = h2[0];
            if (U(o2.before)) {
              var s2 = o2.before(n2.file, n2.inputElem);
              if (typeof s2 == "object") {
                if (s2.action === "abort")
                  return e2 = "AbortError", t = n2.file, i3 = n2.inputElem, r2 = s2.reason, void (U(o2.error) && o2.error({ name: e2 }, t, i3, r2));
                if (s2.action === "skip")
                  return void u2();
                typeof s2.config == "object" && (n2.instanceConfig = d.extend(n2.instanceConfig, s2.config));
              } else if (s2 === "skip")
                return void u2();
            }
            var a2 = n2.instanceConfig.complete;
            n2.instanceConfig.complete = function(e3) {
              U(a2) && a2(e3, n2.file, n2.inputElem), u2();
            }, v.parse(n2.file, n2.instanceConfig);
          }
        }
        function u2() {
          h2.splice(0, 1), e();
        }
      }), a && (n.onmessage = function(e) {
        e = e.data;
        v.WORKER_ID === undefined && e && (v.WORKER_ID = e.workerId);
        typeof e.input == "string" ? n.postMessage({ workerId: v.WORKER_ID, results: v.parse(e.input, e.config), finished: true }) : (n.File && e.input instanceof File || e.input instanceof Object) && (e = v.parse(e.input, e.config)) && n.postMessage({ workerId: v.WORKER_ID, results: e, finished: true });
      }), (f.prototype = Object.create(u.prototype)).constructor = f, (l.prototype = Object.create(u.prototype)).constructor = l, (c.prototype = Object.create(c.prototype)).constructor = c, (p.prototype = Object.create(u.prototype)).constructor = p, v;
    });
  });

  // src/model/gmnsParser.js
  var import_papaparse = __toESM(require_papaparse_min(), 1);

  // src/model/costs.js
  var COST_FUNCTION = {
    AFFINE: "affine",
    BPR: "bpr"
  };
  function normalizeCostFunction(value) {
    const key = String(value ?? "").trim().toLowerCase();
    return key === COST_FUNCTION.BPR ? COST_FUNCTION.BPR : COST_FUNCTION.AFFINE;
  }
  function safeNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  function evaluateAffineCost(link, flow) {
    const a = safeNumber(link.costA, 0);
    const b = safeNumber(link.costB, 0);
    return a + b * Math.max(0, flow);
  }
  function resolveBprFreeFlowTime(link) {
    const overrideT0 = safeNumber(link.costA, NaN);
    if (Number.isFinite(overrideT0) && overrideT0 > 0) {
      return overrideT0;
    }
    const length = Math.max(safeNumber(link.length, 1), 0.000000001);
    const freeSpeed = Math.max(safeNumber(link.freeSpeed, 1), 0.000000001);
    return length / freeSpeed;
  }
  function evaluateBprCost(link, flow) {
    const t0 = Math.max(resolveBprFreeFlowTime(link), 0.000000001);
    const alpha = safeNumber(link.bprAlpha, 0.15);
    const beta = safeNumber(link.bprBeta, 4);
    const capacity = Math.max(safeNumber(link.capacity, 1), 0.000000001);
    return t0 * (1 + alpha * Math.pow(Math.max(0, flow) / capacity, beta));
  }
  function evaluateLinkCost(link, flow) {
    const type = normalizeCostFunction(link.costFunctionType);
    if (type === COST_FUNCTION.BPR) {
      return evaluateBprCost(link, flow);
    }
    return evaluateAffineCost(link, flow);
  }
  function describeCostFunction(link) {
    const type = normalizeCostFunction(link.costFunctionType);
    if (type === COST_FUNCTION.BPR) {
      const t0 = resolveBprFreeFlowTime(link);
      const source = safeNumber(link.costA, 0) > 0 ? "override" : "length/free_speed";
      return `t(x) = ${t0.toFixed(4)} * (1 + ${link.bprAlpha} * (x/${link.capacity})^${link.bprBeta}) [t0 from ${source}]`;
    }
    return `t(x) = ${link.costA} + ${link.costB} x`;
  }

  // src/model/gmnsParser.js
  function parseCsv(text) {
    const parsed = import_papaparse.default.parse(text.trim(), {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false
    });
    if (parsed.errors.length > 0) {
      throw new Error(parsed.errors[0].message);
    }
    return parsed.data;
  }
  function parseNumber(value, fallback = undefined) {
    if (value === undefined || value === null || value === "")
      return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  function parseBoolean(value, fallback = true) {
    if (value === undefined || value === null || value === "")
      return fallback;
    return !["false", "0", "no", "off"].includes(String(value).trim().toLowerCase());
  }
  function parseNodeCsv(text) {
    return parseCsv(text).map((row, index) => ({
      id: parseNumber(row.node_id, index + 1),
      x: parseNumber(row.x_coord, index),
      y: parseNumber(row.y_coord, 0),
      geometryBaseX: parseNumber(row.x_coord, index),
      geometryBaseY: parseNumber(row.y_coord, 0),
      zoneId: parseNumber(row.zone_id, parseNumber(row.node_id, index + 1)),
      nodeType: row.node_type || "intersection",
      label: row.label || `Node ${row.node_id}`
    }));
  }
  function parseLinkCsv(text) {
    return parseCsv(text).map((row, index) => ({
      id: parseNumber(row.link_id, index + 1),
      fromNodeId: parseNumber(row.from_node_id),
      toNodeId: parseNumber(row.to_node_id),
      length: parseNumber(row.length, 1),
      capacity: parseNumber(row.capacity, 10),
      freeSpeed: parseNumber(row.free_speed, 1),
      lanes: parseNumber(row.lanes, 1),
      linkType: row.link_type || "road",
      costFunctionType: String(row.cost_function_type || "").trim().toLowerCase() === COST_FUNCTION.BPR ? COST_FUNCTION.BPR : COST_FUNCTION.AFFINE,
      costA: parseNumber(row.cost_a, 0),
      costB: parseNumber(row.cost_b, 0),
      bprAlpha: parseNumber(row.bpr_alpha, 0.15),
      bprBeta: parseNumber(row.bpr_beta, 4),
      enabled: parseBoolean(row.enabled, true),
      candidateFlag: parseBoolean(row.candidate_flag, false),
      parameterGroup: row.parameter_group || "generic",
      label: row.label || `Link ${row.link_id}`
    }));
  }
  function parseDemandCsv(text) {
    return parseCsv(text).map((row, index) => {
      const originZoneId = parseNumber(row.origin_zone_id ?? row.o_zone_id ?? row.origin);
      const destinationZoneId = parseNumber(row.destination_zone_id ?? row.d_zone_id ?? row.destination);
      const demand = parseNumber(row.demand, 0);
      return {
        key: `${originZoneId}-${destinationZoneId}-${index}`,
        originZoneId,
        destinationZoneId,
        demand
      };
    });
  }
  function parseGmnsBundle({ nodeText, linkText, demandText, name = "GMNS network" }) {
    const nodes = parseNodeCsv(nodeText);
    const nodeById = new Map(nodes.map((node) => [String(node.id), node]));
    const links = parseLinkCsv(linkText).map((link) => {
      const from = nodeById.get(String(link.fromNodeId));
      const to = nodeById.get(String(link.toNodeId));
      const geometryBaseDistance = from && to ? Math.hypot(parseNumber(to.x, 0) - parseNumber(from.x, 0), parseNumber(to.y, 0) - parseNumber(from.y, 0)) : link.length;
      return {
        ...link,
        geometryBaseLength: link.length,
        geometryBaseDistance
      };
    });
    const demandRows = demandText ? parseDemandCsv(demandText) : [];
    if (nodes.length === 0)
      throw new Error("node.csv did not contain any rows.");
    if (links.length === 0)
      throw new Error("link.csv did not contain any rows.");
    if (demandRows.length === 0) {
      throw new Error("demand.csv is required for the current MVP.");
    }
    return {
      name,
      nodes,
      links,
      demandRows
    };
  }

  // src/model/presets.js
  var BRAESS_NODE_CSV = `node_id,x_coord,y_coord,zone_id,node_type,label
1,0,0,1,origin,Origin
2,1,1,,intersection,Upper
3,1,-1,,intersection,Lower
4,2,0,4,destination,Destination
`;
  var BRAESS_LINK_CSV = `link_id,from_node_id,to_node_id,length,capacity,free_speed,lanes,link_type,cost_function_type,cost_a,cost_b,bpr_alpha,bpr_beta,enabled,candidate_flag,parameter_group,label
1,1,2,1,10,1,1,road,affine,0,10,0.15,4,true,false,variable,Origin to Upper
2,1,3,1,10,1,1,road,affine,45,0,0.15,4,true,false,constant,Origin to Lower
3,2,4,1,10,1,1,road,affine,45,0,0.15,4,true,false,constant,Upper to Destination
4,3,4,1,10,1,1,road,affine,0,10,0.15,4,true,false,variable,Lower to Destination
5,2,3,1,10,1,1,road,affine,0,0,0.15,4,false,true,candidate,Upper to Lower
`;
  var BRAESS_DEMAND_CSV = `origin_zone_id,destination_zone_id,demand
1,4,6
`;
  var DEFAULT_INPUTS = {
    costModelMode: "affine",
    demandMode: "fixed",
    fixedDemand: 6,
    variableBaseCost: 0,
    variableCostB: 10,
    constantLinkCost: 45,
    candidateLinkCost: 0,
    candidateLinkB: 0,
    inverseDemandA: 180,
    inverseDemandB: 30,
    bprAlpha: 0.15,
    bprBeta: 4,
    capacityScale: 1,
    maxIterations: 120,
    tolerance: 0.000001,
    maxOuterIterations: 40,
    quantityTolerance: 0.0001,
    costTolerance: 0.0001,
    classificationTolerance: 0.00001
  };
  var DEFAULT_SWEEP = {
    xParameter: "variableCostB",
    yParameter: "fixedDemand",
    xMin: 1,
    xMax: 20,
    xSteps: 40,
    yMin: 2,
    yMax: 10,
    ySteps: 40,
    metric: "paradox"
  };
  var DEFAULT_ELASTIC_MAP = {
    aMin: 90,
    aMax: 270,
    aSteps: 13,
    bMin: 15,
    bMax: 45,
    bSteps: 11,
    zParameter: "variableCostB",
    zMin: 4,
    zMax: 16,
    zSteps: 4
  };
  async function loadBraessPreset() {
    return parseGmnsBundle({
      nodeText: BRAESS_NODE_CSV,
      linkText: BRAESS_LINK_CSV,
      demandText: BRAESS_DEMAND_CSV,
      name: "Canonical Braess network"
    });
  }

  // src/state.js
  function createStore(initialState) {
    let state = initialState;
    const listeners = new Set;
    return {
      get() {
        return state;
      },
      set(nextState) {
        state = nextState;
        listeners.forEach((listener) => listener(state));
      },
      update(updater) {
        this.set(updater(state));
      },
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      }
    };
  }
  function createInitialState() {
    return {
      networkData: null,
      selectedLinkId: "",
      selectedNodeId: "",
      inputs: {
        ...DEFAULT_INPUTS,
        selectedDemandKey: "",
        selectedCandidateLinkId: ""
      },
      sweep: { ...DEFAULT_SWEEP },
      elasticMap: { ...DEFAULT_ELASTIC_MAP },
      viewScenario: "on",
      scenarioResults: {
        off: null,
        on: null
      },
      comparison: null,
      modeComparison: null,
      elasticRegionMap: null,
      sweepResult: null,
      sweepProgress: null,
      sweepRunning: false,
      status: "Loading canonical Braess preset...",
      error: ""
    };
  }

  // src/ui/layout.js
  function renderLayout(root) {
    root.innerHTML = `
    <div class="app">
      <header class="header">
        <div class="header-main">
          <p class="eyebrow">Braess</p>
          <h1>Added links, equilibrium traffic, and demand response</h1>
          <p class="panel-blurb">Click a link to edit its lanes and capacity. Drag nodes to adjust the drawing layout.</p>
        </div>
        <div class="header-right">
          <a class="docs-link" href="model-notes.html" target="_blank" rel="noreferrer">Model Notes</a>
          <img class="usyd-logo" src="./branding/usyd-logo.png" alt="University of Sydney logo" />
        </div>
      </header>

      <div class="app-shell">
      <aside class="panel controls-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Braess Explorer</p>
            <h2>Controls</h2>
            <p class="panel-blurb">Open only the sections you need. The middle link is the Braess candidate.</p>
          </div>
        </div>

        <details class="control-card" open>
          <summary>Network</summary>
          <div class="control-body">
            <div class="button-row compact">
              <button type="button" data-action="load-preset">Load Braess Example</button>
            </div>
            <p class="panel-blurb">This version uses the built-in Braess network and direct map editing instead of CSV upload.</p>
            <div class="fields-grid">
              <label>OD pair
                <select data-field="selectedDemandKey"></select>
              </label>
              <label>Added link
                <select data-field="selectedCandidateLinkId"></select>
              </label>
              <label>Map view
                <select data-field="viewScenario">
                  <option value="off">Without added link</option>
                  <option value="on">With added link</option>
                </select>
              </label>
            </div>
          </div>
        </details>

        <details class="control-card">
          <summary>Network editing</summary>
          <div class="control-body">
            <p class="panel-blurb">Ultimo-style direct edit: click a link on the map, then edit its own structure and link performance function here. For BPR links, t0 is length/free speed unless the t0 override is positive.</p>
            <p class="selection-chip" data-role="edit-selection">Select a link on the map to edit it.</p>
            <div class="selection-details" data-role="selection-details"></div>
            <div class="fields-grid two-col">
              <label>Selected link lanes<input type="number" min="0" max="12" step="1" data-role="edit-link-lanes" /></label>
              <label>Selected link capacity<input type="number" min="0" step="1" data-role="edit-link-capacity" /></label>
              <label>Selected link length<input type="number" min="0" step="0.1" data-role="edit-link-length" /></label>
              <label>Selected link free speed<input type="number" min="0" step="0.1" data-role="edit-link-free-speed" /></label>
              <label>Cost function
                <select data-role="edit-link-function">
                  <option value="affine">Affine</option>
                  <option value="bpr">BPR</option>
                </select>
              </label>
              <label>Affine a / t0 override<input type="number" step="0.1" data-role="edit-link-cost-a" /></label>
              <label>Cost b<input type="number" step="0.1" data-role="edit-link-cost-b" /></label>
              <label>BPR alpha<input type="number" step="0.01" data-role="edit-link-bpr-alpha" /></label>
              <label>BPR beta<input type="number" step="0.1" data-role="edit-link-bpr-beta" /></label>
            </div>
            <div class="button-row compact">
              <button type="button" data-action="apply-link-edit">Apply edit</button>
              <button type="button" data-action="close-link">Set selected link to zero</button>
            </div>
          </div>
        </details>

        <details class="control-card">
          <summary>Demand</summary>
          <div class="control-body">
            <div class="fields-grid two-col">
              <label>Demand mode
                <select data-field="demandMode">
                  <option value="fixed">Fixed demand</option>
                  <option value="elastic">Elastic trips</option>
                </select>
              </label>
              <label>Initial trips<input type="number" step="0.1" data-field="fixedDemand" /></label>
              <label data-role="elastic-demand-control">Inverse-demand intercept A<input type="number" step="0.1" data-field="inverseDemandA" /></label>
              <label data-role="elastic-demand-control">Inverse-demand slope B<input type="number" step="0.1" data-field="inverseDemandB" /></label>
            </div>
            <p class="panel-blurb">The built-in Braess example uses normalized demand units for clarity, so the default value 6 means 6 toy demand packets, not 6 literal vehicles. In fixed-demand mode, Initial trips is the X-axis marker. In elastic mode, click the X or Y axis to move the demand-curve intercepts.</p>
            <div data-role="demand-curve"></div>
          </div>
        </details>

        <details class="control-card">
          <summary>Run model</summary>
          <div class="control-body">
            <div class="fields-grid two-col">
              <label>MSA iterations<input type="number" step="1" data-field="maxIterations" /></label>
              <label>MSA tolerance<input type="number" step="0.000001" data-field="tolerance" /></label>
              <label>Outer iterations<input type="number" step="1" data-field="maxOuterIterations" /></label>
              <label>Quantity tolerance<input type="number" step="0.0001" data-field="quantityTolerance" /></label>
              <label>Cost tolerance<input type="number" step="0.0001" data-field="costTolerance" /></label>
              <label>Flag tolerance<input type="number" step="0.000001" data-field="classificationTolerance" /></label>
            </div>
            <div class="button-row compact">
              <button type="button" data-action="solve-off">Solve without link</button>
              <button type="button" data-action="solve-on">Solve with link</button>
              <button type="button" data-action="compare">Solve both cases</button>
            </div>
          </div>
        </details>

        <details class="control-card">
          <summary>Sweep</summary>
          <div class="control-body">
            <div class="fields-grid two-col">
              <label>X axis<select data-sweep="xParameter"></select></label>
              <label>Y axis<select data-sweep="yParameter"></select></label>
              <label>X min<input type="number" step="0.1" data-sweep="xMin" /></label>
              <label>X max<input type="number" step="0.1" data-sweep="xMax" /></label>
              <label>X steps<input type="number" step="1" data-sweep="xSteps" /></label>
              <label>Y min<input type="number" step="0.1" data-sweep="yMin" /></label>
              <label>Y max<input type="number" step="0.1" data-sweep="yMax" /></label>
              <label>Y steps<input type="number" step="1" data-sweep="ySteps" /></label>
              <label class="full-width">Map value
                <select data-sweep="metric">
                  <option value="paradox">Where the added link makes cost worse</option>
                  <option value="reducedDemand">Where the added link also reduces demand</option>
                  <option value="welfareLoss">Where total welfare falls</option>
                  <option value="deltaCost">Change in equilibrium cost</option>
                  <option value="deltaDemand">Change in equilibrium demand</option>
                  <option value="deltaTravelTime">Change in total travel time</option>
                  <option value="deltaConsumerSurplus">Change in consumer surplus</option>
                  <option value="deltaWelfare">Change in total welfare</option>
                </select>
              </label>
            </div>
            <div class="button-row compact">
              <button type="button" data-action="run-sweep">Run sweep</button>
              <button type="button" data-action="cancel-sweep">Cancel</button>
              <button type="button" data-action="export-csv">Export CSV</button>
              <button type="button" data-action="export-svg">Export SVG</button>
              <button type="button" data-action="export-png">Export PNG</button>
            </div>
          </div>
        </details>
      </aside>

      <main class="main-column">
        <section class="panel network-panel">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Editable Network</p>
              <h2>Map, legend, scale, and link selection</h2>
            </div>
            <div class="status-wrap">
              <div class="status" data-role="status"></div>
              <div class="error" data-role="error"></div>
              <div class="progress" data-role="progress"></div>
            </div>
          </div>
          <p class="network-help">Click a link to edit it in the left panel. Dragging nodes updates the drawing geometry and connected link lengths; changing lanes, capacity, or link costs changes the network used by the solver.</p>
          <div class="network-canvas" data-role="network"></div>
        </section>

        <section class="panel results-panel">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Results</p>
              <h2>Without added link vs with added link</h2>
            </div>
          </div>
          <div data-role="comparison-table"></div>
          <details class="model-details">
            <summary>Model details</summary>
            <div data-role="model-details"></div>
          </details>
        </section>

        <section class="chart-grid">
          <section class="panel">
            <div class="panel-title-row">
              <div>
                <p class="eyebrow">Diagnostics</p>
                <h2>Solver convergence</h2>
              </div>
            </div>
            <div data-role="convergence-chart"></div>
          </section>
          <section class="panel">
            <div class="panel-title-row">
              <div>
                <p class="eyebrow">Sweep slice</p>
                <h2>Mid-slice comparison</h2>
              </div>
            </div>
            <div data-role="slice-chart"></div>
          </section>
        </section>

        <section class="panel heatmap-panel">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Elastic assumptions</p>
              <h2>Rotatable 3D outcome space</h2>
              <p class="panel-blurb">X is inverse-demand intercept A, Y is inverse-demand slope B, and Z is the selected cost-function parameter.</p>
              <p class="panel-blurb run-warning">Drawing this space solves two equilibria for every A-B-Z grid point. Start with fewer steps for quick exploration; large grids can take a moment, especially in Safari.</p>
            </div>
            <button type="button" data-action="run-elastic-map">Draw 3D space</button>
          </div>
          <div class="elastic-space-controls">
            <div class="axis-control-row axis-a">
              <div>
                <strong>A: willingness-to-pay intercept</strong>
                <span>Vertical intercept of C(q) = A - Bq, shown on the X axis.</span>
              </div>
              <label>A low<input type="number" step="1" data-elastic-map="aMin" /></label>
              <label>A high<input type="number" step="1" data-elastic-map="aMax" /></label>
              <label>A steps<input type="number" min="2" max="30" step="1" data-elastic-map="aSteps" /></label>
            </div>
            <div class="axis-control-row axis-b">
              <div>
                <strong>B: demand-curve slope</strong>
                <span>How quickly willingness to pay falls as trips increase, shown on the Y axis.</span>
              </div>
              <label>B low<input type="number" step="0.1" data-elastic-map="bMin" /></label>
              <label>B high<input type="number" step="0.1" data-elastic-map="bMax" /></label>
              <label>B steps<input type="number" min="2" max="30" step="1" data-elastic-map="bSteps" /></label>
            </div>
            <div class="axis-control-row axis-z">
              <div>
                <strong>Z: network or cost parameter</strong>
                <span>The third axis rotates out of the A-B plane.</span>
              </div>
              <label>Z variable
                <select data-elastic-map="zParameter">
                  <option value="variableCostB">Variable-link coefficient b</option>
                  <option value="constantLinkCost">Constant-link cost</option>
                  <option value="candidateLinkCost">Added-link free-flow cost</option>
                  <option value="candidateLinkB">Added-link congestion b</option>
                  <option value="bprAlpha">BPR alpha</option>
                  <option value="capacityScale">Capacity scale</option>
                </select>
              </label>
              <label>Z low<input type="number" step="0.1" data-elastic-map="zMin" /></label>
              <label>Z high<input type="number" step="0.1" data-elastic-map="zMax" /></label>
              <label>Z steps<input type="number" min="1" max="12" step="1" data-elastic-map="zSteps" /></label>
            </div>
          </div>
          <div data-role="elastic-region-map"></div>
        </section>

        <section class="panel heatmap-panel">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Generic sweep</p>
              <h2>Single-parameter heatmap</h2>
              <p class="panel-blurb">This is the flexible two-parameter sweep from the left controls. Use the 3D outcome space above for the Braess/demand-response assumption map.</p>
            </div>
          </div>
          <div data-role="heatmap"></div>
        </section>

        <section class="panel">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Batch rows</p>
              <h2>Sweep row preview</h2>
            </div>
          </div>
          <div data-role="batch-table"></div>
        </section>
      </main>
      </div>
    </div>
  `;
    return {
      status: root.querySelector('[data-role="status"]'),
      error: root.querySelector('[data-role="error"]'),
      progress: root.querySelector('[data-role="progress"]'),
      network: root.querySelector('[data-role="network"]'),
      editSelection: root.querySelector('[data-role="edit-selection"]'),
      selectionDetails: root.querySelector('[data-role="selection-details"]'),
      editLinkLanes: root.querySelector('[data-role="edit-link-lanes"]'),
      editLinkCapacity: root.querySelector('[data-role="edit-link-capacity"]'),
      editLinkLength: root.querySelector('[data-role="edit-link-length"]'),
      editLinkFreeSpeed: root.querySelector('[data-role="edit-link-free-speed"]'),
      editLinkFunction: root.querySelector('[data-role="edit-link-function"]'),
      editLinkCostA: root.querySelector('[data-role="edit-link-cost-a"]'),
      editLinkCostB: root.querySelector('[data-role="edit-link-cost-b"]'),
      editLinkBprAlpha: root.querySelector('[data-role="edit-link-bpr-alpha"]'),
      editLinkBprBeta: root.querySelector('[data-role="edit-link-bpr-beta"]'),
      comparisonTable: root.querySelector('[data-role="comparison-table"]'),
      convergenceChart: root.querySelector('[data-role="convergence-chart"]'),
      demandCurve: root.querySelector('[data-role="demand-curve"]'),
      elasticDemandControls: Array.from(root.querySelectorAll('[data-role="elastic-demand-control"]')),
      elasticRegionMap: root.querySelector('[data-role="elastic-region-map"]'),
      sliceChart: root.querySelector('[data-role="slice-chart"]'),
      heatmap: root.querySelector('[data-role="heatmap"]'),
      batchTable: root.querySelector('[data-role="batch-table"]'),
      modelDetails: root.querySelector('[data-role="model-details"]'),
      actions: Array.from(root.querySelectorAll("[data-action]")),
      controlCards: Array.from(root.querySelectorAll(".control-card")),
      fieldInputs: Array.from(root.querySelectorAll("[data-field]")),
      sweepInputs: Array.from(root.querySelectorAll("[data-sweep]")),
      elasticMapInputs: Array.from(root.querySelectorAll("[data-elastic-map]"))
    };
  }

  // src/ui/controls.js
  function populateSelect(select, options, selectedValue) {
    select.innerHTML = options.map((option) => `<option value="${option.value}" ${String(option.value) === String(selectedValue) ? "selected" : ""}>${option.label}</option>`).join("");
  }
  function writeFormValues(elements, state) {
    elements.fieldInputs.forEach((input) => {
      const key = input.dataset.field;
      const value = key === "viewScenario" ? state.viewScenario : state.inputs[key];
      if (value !== undefined) {
        input.value = String(value);
      }
    });
    elements.sweepInputs.forEach((input) => {
      const key = input.dataset.sweep;
      const value = state.sweep[key];
      if (value !== undefined) {
        input.value = String(value);
      }
    });
    elements.elasticMapInputs.forEach((input) => {
      const key = input.dataset.elasticMap;
      const value = state.elasticMap[key];
      if (value !== undefined) {
        input.value = String(value);
      }
    });
  }
  function readFormValues(elements) {
    const inputs = {};
    elements.fieldInputs.forEach((input) => {
      inputs[input.dataset.field] = input.value;
    });
    const sweep = {};
    elements.sweepInputs.forEach((input) => {
      sweep[input.dataset.sweep] = input.value;
    });
    const elasticMap = {};
    elements.elasticMapInputs.forEach((input) => {
      elasticMap[input.dataset.elasticMap] = input.value;
    });
    return {
      inputs,
      sweep,
      elasticMap
    };
  }
  function bindControls(elements, handlers) {
    elements.actions.forEach((button) => {
      button.addEventListener("click", () => {
        handlers[button.dataset.action]?.();
      });
    });
  }

  // src/ui/tables.js
  function formatValue(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(4) : "—";
  }
  function demandAssumptionText(demandMode, inputs = {}) {
    const initialTrips = formatValue(inputs.fixedDemand);
    if (demandMode === "elastic") {
      return `Case: elastic demand. Initial trips ${initialTrips} is the zero-cost X-intercept of C(q) = A - Bq; the solver chooses the demand where willingness to pay equals equilibrium generalised cost. Positive demand requires A to be above the no-flow OD travel cost.`;
    }
    return `Case: fixed demand. Demand is held at Initial trips ${initialTrips} in both link scenarios; inverse-demand parameters are not used to choose demand.`;
  }
  function renderModeComparison(modeComparison, elasticOffResult, elasticOnResult) {
    if (!modeComparison || !elasticOffResult || !elasticOnResult)
      return "";
    const rows = [
      ["Without added link", modeComparison.offFixed, elasticOffResult],
      ["With added link", modeComparison.onFixed, elasticOnResult]
    ];
    return `
    <div class="subsection-note">
      <strong>Fixed vs elastic demand check.</strong>
      This compares each link scenario against the same network solved with fixed demand equal to the Initial trips intercept.
    </div>
    <table class="metric-table compact">
      <thead>
        <tr><th>Scenario</th><th>Fixed demand</th><th>Elastic demand</th><th>Elastic minus fixed</th><th>Fixed cost</th><th>Elastic cost</th></tr>
      </thead>
      <tbody>
        ${rows.map(([label, fixedResult, elasticResult]) => {
      const deltaDemand = Number(elasticResult.quantity) - Number(fixedResult.quantity);
      return `
              <tr>
                <th>${label}</th>
                <td>${formatValue(fixedResult.quantity)}</td>
                <td>${formatValue(elasticResult.quantity)}</td>
                <td>${formatValue(deltaDemand)}</td>
                <td>${formatValue(fixedResult.equilibriumCost)}</td>
                <td>${formatValue(elasticResult.equilibriumCost)}</td>
              </tr>`;
    }).join("")}
      </tbody>
    </table>
  `;
  }
  function renderElasticDemandWarnings(offResult, onResult) {
    const warnings = [
      offResult.zeroDemandReason ? `Without added link: ${offResult.zeroDemandReason}` : "",
      onResult.zeroDemandReason ? `With added link: ${onResult.zeroDemandReason}` : ""
    ].filter(Boolean);
    if (warnings.length === 0)
      return "";
    return `
    <div class="callout warn demand-warning">
      <strong>Elastic demand is zero in one scenario because the demand curve chokes off before positive trips occur.</strong>
      <span>${warnings.join(" ")}</span>
      <span>Raise the Y-intercept A above the no-flow travel cost, or lower link free-flow costs, to get positive elastic demand.</span>
    </div>
  `;
  }
  function renderComparisonTable(container, offResult, onResult, comparison, demandMode = "fixed", inputs = {}, modeComparison = null) {
    if (!offResult || !onResult || !comparison) {
      container.innerHTML = `<p class="empty-state">Run “Solve both cases” to fill in the comparison table.</p>`;
      return;
    }
    const rows = [
      ["Demand", offResult.quantity, onResult.quantity, comparison.deltaDemand],
      ["Equilibrium cost", offResult.equilibriumCost, onResult.equilibriumCost, comparison.deltaCost],
      [
        "Total travel time",
        offResult.metrics.totalTravelTime,
        onResult.metrics.totalTravelTime,
        comparison.deltaTravelTime
      ],
      [
        "Consumer surplus",
        offResult.metrics.consumerSurplus,
        onResult.metrics.consumerSurplus,
        comparison.deltaConsumerSurplus
      ],
      ["Total welfare", offResult.metrics.totalWelfare, onResult.metrics.totalWelfare, comparison.deltaWelfare],
      ["Braess paradox?", "—", "—", comparison.paradox ? "Yes" : "No"],
      ["Demand falls too?", "—", "—", comparison.reducedDemand ? "Yes" : "No"]
    ];
    container.innerHTML = `
    <p class="scenario-assumption">${demandAssumptionText(demandMode, inputs)}</p>
    ${demandMode === "elastic" ? renderElasticDemandWarnings(offResult, onResult) : ""}
    <table class="metric-table">
      <thead>
        <tr><th>Metric</th><th>Without added link</th><th>With added link</th><th>Change</th></tr>
      </thead>
      <tbody>
        ${rows.map(([label, off, on, delta]) => `
            <tr>
              <th>${label}</th>
              <td>${typeof off === "string" ? off : formatValue(off)}</td>
              <td>${typeof on === "string" ? on : formatValue(on)}</td>
              <td>${typeof delta === "string" ? delta : formatValue(delta)}</td>
            </tr>`).join("")}
      </tbody>
    </table>
    <div class="callout-grid">
      <div class="callout ${comparison.paradox ? "warn" : "good"}">
        <strong>${comparison.paradox ? "Adding the link makes equilibrium cost worse" : "Adding the link does not make equilibrium cost worse"}</strong>
      </div>
      <div class="callout ${comparison.reducedDemand ? "warn" : "neutral"}">
        <strong>${demandMode === "elastic" ? comparison.reducedDemand ? "Link effect under elastic demand: ON has lower demand than OFF" : "Link effect under elastic demand: ON demand is not lower than OFF demand" : "ON-vs-OFF demand reduction is only tested in elastic-demand mode"}</strong>
        <span>${comparison.reducedDemand ? "This is induced demand running in reverse." : ""}</span>
      </div>
    </div>
    ${demandMode === "elastic" ? renderModeComparison(modeComparison, offResult, onResult) : ""}
  `;
  }
  function renderBatchTable(container, sweepResult) {
    if (!sweepResult?.rows?.length) {
      container.innerHTML = `<p class="empty-state">Sweep rows will appear here after a batch run.</p>`;
      return;
    }
    const columns = [
      "x",
      "y",
      "offDemand",
      "onDemand",
      "offCost",
      "onCost",
      "deltaCost",
      "deltaDemand",
      "paradox",
      "reducedDemand",
      "welfareLoss"
    ];
    container.innerHTML = `
    <div class="table-scroll">
      <table class="metric-table compact">
        <thead>
          <tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${sweepResult.rows.slice(0, 16).map((row) => `
                <tr>${columns.map((column) => `<td>${typeof row[column] === "number" ? formatValue(row[column]) : row[column]}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
    <p class="table-note">Showing the first 16 rows of ${sweepResult.rows.length}. Use “Export CSV” for the full sweep grid.</p>
  `;
  }

  // node_modules/d3-array/src/ascending.js
  function ascending(a, b) {
    return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  // node_modules/d3-array/src/descending.js
  function descending(a, b) {
    return a == null || b == null ? NaN : b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
  }

  // node_modules/d3-array/src/bisector.js
  function bisector(f) {
    let compare1, compare2, delta;
    if (f.length !== 2) {
      compare1 = ascending;
      compare2 = (d, x) => ascending(f(d), x);
      delta = (d, x) => f(d) - x;
    } else {
      compare1 = f === ascending || f === descending ? f : zero;
      compare2 = f;
      delta = f;
    }
    function left(a, x, lo = 0, hi = a.length) {
      if (lo < hi) {
        if (compare1(x, x) !== 0)
          return hi;
        do {
          const mid = lo + hi >>> 1;
          if (compare2(a[mid], x) < 0)
            lo = mid + 1;
          else
            hi = mid;
        } while (lo < hi);
      }
      return lo;
    }
    function right(a, x, lo = 0, hi = a.length) {
      if (lo < hi) {
        if (compare1(x, x) !== 0)
          return hi;
        do {
          const mid = lo + hi >>> 1;
          if (compare2(a[mid], x) <= 0)
            lo = mid + 1;
          else
            hi = mid;
        } while (lo < hi);
      }
      return lo;
    }
    function center(a, x, lo = 0, hi = a.length) {
      const i = left(a, x, lo, hi - 1);
      return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
    }
    return { left, center, right };
  }
  function zero() {
    return 0;
  }

  // node_modules/d3-array/src/number.js
  function number(x) {
    return x === null ? NaN : +x;
  }

  // node_modules/d3-array/src/bisect.js
  var ascendingBisect = bisector(ascending);
  var bisectRight = ascendingBisect.right;
  var bisectLeft = ascendingBisect.left;
  var bisectCenter = bisector(number).center;
  var bisect_default = bisectRight;
  // node_modules/d3-array/src/extent.js
  function extent(values, valueof) {
    let min;
    let max;
    if (valueof === undefined) {
      for (const value of values) {
        if (value != null) {
          if (min === undefined) {
            if (value >= value)
              min = max = value;
          } else {
            if (min > value)
              min = value;
            if (max < value)
              max = value;
          }
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null) {
          if (min === undefined) {
            if (value >= value)
              min = max = value;
          } else {
            if (min > value)
              min = value;
            if (max < value)
              max = value;
          }
        }
      }
    }
    return [min, max];
  }
  // node_modules/internmap/src/index.js
  class InternMap extends Map {
    constructor(entries, key = keyof) {
      super();
      Object.defineProperties(this, { _intern: { value: new Map }, _key: { value: key } });
      if (entries != null)
        for (const [key2, value] of entries)
          this.set(key2, value);
    }
    get(key) {
      return super.get(intern_get(this, key));
    }
    has(key) {
      return super.has(intern_get(this, key));
    }
    set(key, value) {
      return super.set(intern_set(this, key), value);
    }
    delete(key) {
      return super.delete(intern_delete(this, key));
    }
  }
  function intern_get({ _intern, _key }, value) {
    const key = _key(value);
    return _intern.has(key) ? _intern.get(key) : value;
  }
  function intern_set({ _intern, _key }, value) {
    const key = _key(value);
    if (_intern.has(key))
      return _intern.get(key);
    _intern.set(key, value);
    return value;
  }
  function intern_delete({ _intern, _key }, value) {
    const key = _key(value);
    if (_intern.has(key)) {
      value = _intern.get(key);
      _intern.delete(key);
    }
    return value;
  }
  function keyof(value) {
    return value !== null && typeof value === "object" ? value.valueOf() : value;
  }

  // node_modules/d3-array/src/identity.js
  function identity(x) {
    return x;
  }

  // node_modules/d3-array/src/group.js
  function group(values, ...keys) {
    return nest(values, identity, identity, keys);
  }
  function nest(values, map, reduce, keys) {
    return function regroup(values2, i) {
      if (i >= keys.length)
        return reduce(values2);
      const groups = new InternMap;
      const keyof2 = keys[i++];
      let index = -1;
      for (const value of values2) {
        const key = keyof2(value, ++index, values2);
        const group2 = groups.get(key);
        if (group2)
          group2.push(value);
        else
          groups.set(key, [value]);
      }
      for (const [key, values3] of groups) {
        groups.set(key, regroup(values3, i));
      }
      return map(groups);
    }(values, 0);
  }
  // node_modules/d3-array/src/ticks.js
  var e10 = Math.sqrt(50);
  var e5 = Math.sqrt(10);
  var e2 = Math.sqrt(2);
  function tickSpec(start, stop, count) {
    const step = (stop - start) / Math.max(0, count), power = Math.floor(Math.log10(step)), error = step / Math.pow(10, power), factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
    let i1, i2, inc;
    if (power < 0) {
      inc = Math.pow(10, -power) / factor;
      i1 = Math.round(start * inc);
      i2 = Math.round(stop * inc);
      if (i1 / inc < start)
        ++i1;
      if (i2 / inc > stop)
        --i2;
      inc = -inc;
    } else {
      inc = Math.pow(10, power) * factor;
      i1 = Math.round(start / inc);
      i2 = Math.round(stop / inc);
      if (i1 * inc < start)
        ++i1;
      if (i2 * inc > stop)
        --i2;
    }
    if (i2 < i1 && 0.5 <= count && count < 2)
      return tickSpec(start, stop, count * 2);
    return [i1, i2, inc];
  }
  function ticks(start, stop, count) {
    stop = +stop, start = +start, count = +count;
    if (!(count > 0))
      return [];
    if (start === stop)
      return [start];
    const reverse = stop < start, [i1, i2, inc] = reverse ? tickSpec(stop, start, count) : tickSpec(start, stop, count);
    if (!(i2 >= i1))
      return [];
    const n = i2 - i1 + 1, ticks2 = new Array(n);
    if (reverse) {
      if (inc < 0)
        for (let i = 0;i < n; ++i)
          ticks2[i] = (i2 - i) / -inc;
      else
        for (let i = 0;i < n; ++i)
          ticks2[i] = (i2 - i) * inc;
    } else {
      if (inc < 0)
        for (let i = 0;i < n; ++i)
          ticks2[i] = (i1 + i) / -inc;
      else
        for (let i = 0;i < n; ++i)
          ticks2[i] = (i1 + i) * inc;
    }
    return ticks2;
  }
  function tickIncrement(start, stop, count) {
    stop = +stop, start = +start, count = +count;
    return tickSpec(start, stop, count)[2];
  }
  function tickStep(start, stop, count) {
    stop = +stop, start = +start, count = +count;
    const reverse = stop < start, inc = reverse ? tickIncrement(stop, start, count) : tickIncrement(start, stop, count);
    return (reverse ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
  }

  // node_modules/d3-array/src/max.js
  function max(values, valueof) {
    let max2;
    if (valueof === undefined) {
      for (const value of values) {
        if (value != null && (max2 < value || max2 === undefined && value >= value)) {
          max2 = value;
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null && (max2 < value || max2 === undefined && value >= value)) {
          max2 = value;
        }
      }
    }
    return max2;
  }

  // node_modules/d3-array/src/min.js
  function min(values, valueof) {
    let min2;
    if (valueof === undefined) {
      for (const value of values) {
        if (value != null && (min2 > value || min2 === undefined && value >= value)) {
          min2 = value;
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null && (min2 > value || min2 === undefined && value >= value)) {
          min2 = value;
        }
      }
    }
    return min2;
  }
  // node_modules/d3-array/src/range.js
  function range(start, stop, step) {
    start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;
    var i = -1, n = Math.max(0, Math.ceil((stop - start) / step)) | 0, range2 = new Array(n);
    while (++i < n) {
      range2[i] = start + i * step;
    }
    return range2;
  }
  // node_modules/d3-axis/src/identity.js
  function identity_default(x) {
    return x;
  }

  // node_modules/d3-axis/src/axis.js
  var top = 1;
  var right = 2;
  var bottom = 3;
  var left = 4;
  var epsilon = 0.000001;
  function translateX(x) {
    return "translate(" + x + ",0)";
  }
  function translateY(y) {
    return "translate(0," + y + ")";
  }
  function number2(scale) {
    return (d) => +scale(d);
  }
  function center(scale, offset) {
    offset = Math.max(0, scale.bandwidth() - offset * 2) / 2;
    if (scale.round())
      offset = Math.round(offset);
    return (d) => +scale(d) + offset;
  }
  function entering() {
    return !this.__axis;
  }
  function axis(orient, scale) {
    var tickArguments = [], tickValues = null, tickFormat = null, tickSizeInner = 6, tickSizeOuter = 6, tickPadding = 3, offset = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5, k = orient === top || orient === left ? -1 : 1, x = orient === left || orient === right ? "x" : "y", transform = orient === top || orient === bottom ? translateX : translateY;
    function axis2(context) {
      var values = tickValues == null ? scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain() : tickValues, format = tickFormat == null ? scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity_default : tickFormat, spacing = Math.max(tickSizeInner, 0) + tickPadding, range2 = scale.range(), range0 = +range2[0] + offset, range1 = +range2[range2.length - 1] + offset, position = (scale.bandwidth ? center : number2)(scale.copy(), offset), selection = context.selection ? context.selection() : context, path = selection.selectAll(".domain").data([null]), tick = selection.selectAll(".tick").data(values, scale).order(), tickExit = tick.exit(), tickEnter = tick.enter().append("g").attr("class", "tick"), line = tick.select("line"), text = tick.select("text");
      path = path.merge(path.enter().insert("path", ".tick").attr("class", "domain").attr("stroke", "currentColor"));
      tick = tick.merge(tickEnter);
      line = line.merge(tickEnter.append("line").attr("stroke", "currentColor").attr(x + "2", k * tickSizeInner));
      text = text.merge(tickEnter.append("text").attr("fill", "currentColor").attr(x, k * spacing).attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));
      if (context !== selection) {
        path = path.transition(context);
        tick = tick.transition(context);
        line = line.transition(context);
        text = text.transition(context);
        tickExit = tickExit.transition(context).attr("opacity", epsilon).attr("transform", function(d) {
          return isFinite(d = position(d)) ? transform(d + offset) : this.getAttribute("transform");
        });
        tickEnter.attr("opacity", epsilon).attr("transform", function(d) {
          var p = this.parentNode.__axis;
          return transform((p && isFinite(p = p(d)) ? p : position(d)) + offset);
        });
      }
      tickExit.remove();
      path.attr("d", orient === left || orient === right ? tickSizeOuter ? "M" + k * tickSizeOuter + "," + range0 + "H" + offset + "V" + range1 + "H" + k * tickSizeOuter : "M" + offset + "," + range0 + "V" + range1 : tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V" + offset + "H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + "," + offset + "H" + range1);
      tick.attr("opacity", 1).attr("transform", function(d) {
        return transform(position(d) + offset);
      });
      line.attr(x + "2", k * tickSizeInner);
      text.attr(x, k * spacing).text(format);
      selection.filter(entering).attr("fill", "none").attr("font-size", 10).attr("font-family", "sans-serif").attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");
      selection.each(function() {
        this.__axis = position;
      });
    }
    axis2.scale = function(_) {
      return arguments.length ? (scale = _, axis2) : scale;
    };
    axis2.ticks = function() {
      return tickArguments = Array.from(arguments), axis2;
    };
    axis2.tickArguments = function(_) {
      return arguments.length ? (tickArguments = _ == null ? [] : Array.from(_), axis2) : tickArguments.slice();
    };
    axis2.tickValues = function(_) {
      return arguments.length ? (tickValues = _ == null ? null : Array.from(_), axis2) : tickValues && tickValues.slice();
    };
    axis2.tickFormat = function(_) {
      return arguments.length ? (tickFormat = _, axis2) : tickFormat;
    };
    axis2.tickSize = function(_) {
      return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis2) : tickSizeInner;
    };
    axis2.tickSizeInner = function(_) {
      return arguments.length ? (tickSizeInner = +_, axis2) : tickSizeInner;
    };
    axis2.tickSizeOuter = function(_) {
      return arguments.length ? (tickSizeOuter = +_, axis2) : tickSizeOuter;
    };
    axis2.tickPadding = function(_) {
      return arguments.length ? (tickPadding = +_, axis2) : tickPadding;
    };
    axis2.offset = function(_) {
      return arguments.length ? (offset = +_, axis2) : offset;
    };
    return axis2;
  }
  function axisBottom(scale) {
    return axis(bottom, scale);
  }
  function axisLeft(scale) {
    return axis(left, scale);
  }
  // node_modules/d3-dispatch/src/dispatch.js
  var noop = { value: () => {} };
  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t;i < n; ++i) {
      if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t))
        throw new Error("illegal type: " + t);
      _[t] = [];
    }
    return new Dispatch(_);
  }
  function Dispatch(_) {
    this._ = _;
  }
  function parseTypenames(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0)
        name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t))
        throw new Error("unknown type: " + t);
      return { type: t, name };
    });
  }
  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function(typename, callback) {
      var _ = this._, T = parseTypenames(typename + "", _), t, i = -1, n = T.length;
      if (arguments.length < 2) {
        while (++i < n)
          if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name)))
            return t;
        return;
      }
      if (callback != null && typeof callback !== "function")
        throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t = (typename = T[i]).type)
          _[t] = set(_[t], typename.name, callback);
        else if (callback == null)
          for (t in _)
            _[t] = set(_[t], typename.name, null);
      }
      return this;
    },
    copy: function() {
      var copy = {}, _ = this._;
      for (var t in _)
        copy[t] = _[t].slice();
      return new Dispatch(copy);
    },
    call: function(type, that) {
      if ((n = arguments.length - 2) > 0)
        for (var args = new Array(n), i = 0, n, t;i < n; ++i)
          args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type))
        throw new Error("unknown type: " + type);
      for (t = this._[type], i = 0, n = t.length;i < n; ++i)
        t[i].value.apply(that, args);
    },
    apply: function(type, that, args) {
      if (!this._.hasOwnProperty(type))
        throw new Error("unknown type: " + type);
      for (var t = this._[type], i = 0, n = t.length;i < n; ++i)
        t[i].value.apply(that, args);
    }
  };
  function get(type, name) {
    for (var i = 0, n = type.length, c;i < n; ++i) {
      if ((c = type[i]).name === name) {
        return c.value;
      }
    }
  }
  function set(type, name, callback) {
    for (var i = 0, n = type.length;i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }
    if (callback != null)
      type.push({ name, value: callback });
    return type;
  }
  var dispatch_default = dispatch;
  // node_modules/d3-selection/src/namespaces.js
  var xhtml = "http://www.w3.org/1999/xhtml";
  var namespaces_default = {
    svg: "http://www.w3.org/2000/svg",
    xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };

  // node_modules/d3-selection/src/namespace.js
  function namespace_default(name) {
    var prefix = name += "", i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns")
      name = name.slice(i + 1);
    return namespaces_default.hasOwnProperty(prefix) ? { space: namespaces_default[prefix], local: name } : name;
  }

  // node_modules/d3-selection/src/creator.js
  function creatorInherit(name) {
    return function() {
      var document2 = this.ownerDocument, uri = this.namespaceURI;
      return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
    };
  }
  function creatorFixed(fullname) {
    return function() {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }
  function creator_default(name) {
    var fullname = namespace_default(name);
    return (fullname.local ? creatorFixed : creatorInherit)(fullname);
  }

  // node_modules/d3-selection/src/selector.js
  function none() {}
  function selector_default(selector) {
    return selector == null ? none : function() {
      return this.querySelector(selector);
    };
  }

  // node_modules/d3-selection/src/selection/select.js
  function select_default(select) {
    if (typeof select !== "function")
      select = selector_default(select);
    for (var groups2 = this._groups, m = groups2.length, subgroups = new Array(m), j = 0;j < m; ++j) {
      for (var group2 = groups2[j], n = group2.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0;i < n; ++i) {
        if ((node = group2[i]) && (subnode = select.call(node, node.__data__, i, group2))) {
          if ("__data__" in node)
            subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }
    return new Selection(subgroups, this._parents);
  }

  // node_modules/d3-selection/src/array.js
  function array(x) {
    return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
  }

  // node_modules/d3-selection/src/selectorAll.js
  function empty() {
    return [];
  }
  function selectorAll_default(selector) {
    return selector == null ? empty : function() {
      return this.querySelectorAll(selector);
    };
  }

  // node_modules/d3-selection/src/selection/selectAll.js
  function arrayAll(select) {
    return function() {
      return array(select.apply(this, arguments));
    };
  }
  function selectAll_default(select) {
    if (typeof select === "function")
      select = arrayAll(select);
    else
      select = selectorAll_default(select);
    for (var groups2 = this._groups, m = groups2.length, subgroups = [], parents = [], j = 0;j < m; ++j) {
      for (var group2 = groups2[j], n = group2.length, node, i = 0;i < n; ++i) {
        if (node = group2[i]) {
          subgroups.push(select.call(node, node.__data__, i, group2));
          parents.push(node);
        }
      }
    }
    return new Selection(subgroups, parents);
  }

  // node_modules/d3-selection/src/matcher.js
  function matcher_default(selector) {
    return function() {
      return this.matches(selector);
    };
  }
  function childMatcher(selector) {
    return function(node) {
      return node.matches(selector);
    };
  }

  // node_modules/d3-selection/src/selection/selectChild.js
  var find = Array.prototype.find;
  function childFind(match) {
    return function() {
      return find.call(this.children, match);
    };
  }
  function childFirst() {
    return this.firstElementChild;
  }
  function selectChild_default(match) {
    return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
  }

  // node_modules/d3-selection/src/selection/selectChildren.js
  var filter = Array.prototype.filter;
  function children() {
    return Array.from(this.children);
  }
  function childrenFilter(match) {
    return function() {
      return filter.call(this.children, match);
    };
  }
  function selectChildren_default(match) {
    return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
  }

  // node_modules/d3-selection/src/selection/filter.js
  function filter_default(match) {
    if (typeof match !== "function")
      match = matcher_default(match);
    for (var groups2 = this._groups, m = groups2.length, subgroups = new Array(m), j = 0;j < m; ++j) {
      for (var group2 = groups2[j], n = group2.length, subgroup = subgroups[j] = [], node, i = 0;i < n; ++i) {
        if ((node = group2[i]) && match.call(node, node.__data__, i, group2)) {
          subgroup.push(node);
        }
      }
    }
    return new Selection(subgroups, this._parents);
  }

  // node_modules/d3-selection/src/selection/sparse.js
  function sparse_default(update) {
    return new Array(update.length);
  }

  // node_modules/d3-selection/src/selection/enter.js
  function enter_default() {
    return new Selection(this._enter || this._groups.map(sparse_default), this._parents);
  }
  function EnterNode(parent, datum) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum;
  }
  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function(child) {
      return this._parent.insertBefore(child, this._next);
    },
    insertBefore: function(child, next) {
      return this._parent.insertBefore(child, next);
    },
    querySelector: function(selector) {
      return this._parent.querySelector(selector);
    },
    querySelectorAll: function(selector) {
      return this._parent.querySelectorAll(selector);
    }
  };

  // node_modules/d3-selection/src/constant.js
  function constant_default(x) {
    return function() {
      return x;
    };
  }

  // node_modules/d3-selection/src/selection/data.js
  function bindIndex(parent, group2, enter, update, exit, data) {
    var i = 0, node, groupLength = group2.length, dataLength = data.length;
    for (;i < dataLength; ++i) {
      if (node = group2[i]) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }
    for (;i < groupLength; ++i) {
      if (node = group2[i]) {
        exit[i] = node;
      }
    }
  }
  function bindKey(parent, group2, enter, update, exit, data, key) {
    var i, node, nodeByKeyValue = new Map, groupLength = group2.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
    for (i = 0;i < groupLength; ++i) {
      if (node = group2[i]) {
        keyValues[i] = keyValue = key.call(node, node.__data__, i, group2) + "";
        if (nodeByKeyValue.has(keyValue)) {
          exit[i] = node;
        } else {
          nodeByKeyValue.set(keyValue, node);
        }
      }
    }
    for (i = 0;i < dataLength; ++i) {
      keyValue = key.call(parent, data[i], i, data) + "";
      if (node = nodeByKeyValue.get(keyValue)) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue.delete(keyValue);
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }
    for (i = 0;i < groupLength; ++i) {
      if ((node = group2[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
        exit[i] = node;
      }
    }
  }
  function datum(node) {
    return node.__data__;
  }
  function data_default(value, key) {
    if (!arguments.length)
      return Array.from(this, datum);
    var bind = key ? bindKey : bindIndex, parents = this._parents, groups2 = this._groups;
    if (typeof value !== "function")
      value = constant_default(value);
    for (var m = groups2.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0;j < m; ++j) {
      var parent = parents[j], group2 = groups2[j], groupLength = group2.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
      bind(parent, group2, enterGroup, updateGroup, exitGroup, data, key);
      for (var i0 = 0, i1 = 0, previous, next;i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1)
            i1 = i0 + 1;
          while (!(next = updateGroup[i1]) && ++i1 < dataLength)
            ;
          previous._next = next || null;
        }
      }
    }
    update = new Selection(update, parents);
    update._enter = enter;
    update._exit = exit;
    return update;
  }
  function arraylike(data) {
    return typeof data === "object" && "length" in data ? data : Array.from(data);
  }

  // node_modules/d3-selection/src/selection/exit.js
  function exit_default() {
    return new Selection(this._exit || this._groups.map(sparse_default), this._parents);
  }

  // node_modules/d3-selection/src/selection/join.js
  function join_default(onenter, onupdate, onexit) {
    var enter = this.enter(), update = this, exit = this.exit();
    if (typeof onenter === "function") {
      enter = onenter(enter);
      if (enter)
        enter = enter.selection();
    } else {
      enter = enter.append(onenter + "");
    }
    if (onupdate != null) {
      update = onupdate(update);
      if (update)
        update = update.selection();
    }
    if (onexit == null)
      exit.remove();
    else
      onexit(exit);
    return enter && update ? enter.merge(update).order() : update;
  }

  // node_modules/d3-selection/src/selection/merge.js
  function merge_default(context) {
    var selection = context.selection ? context.selection() : context;
    for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0;j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0;i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }
    for (;j < m0; ++j) {
      merges[j] = groups0[j];
    }
    return new Selection(merges, this._parents);
  }

  // node_modules/d3-selection/src/selection/order.js
  function order_default() {
    for (var groups2 = this._groups, j = -1, m = groups2.length;++j < m; ) {
      for (var group2 = groups2[j], i = group2.length - 1, next = group2[i], node;--i >= 0; ) {
        if (node = group2[i]) {
          if (next && node.compareDocumentPosition(next) ^ 4)
            next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }
    return this;
  }

  // node_modules/d3-selection/src/selection/sort.js
  function sort_default(compare) {
    if (!compare)
      compare = ascending2;
    function compareNode(a, b) {
      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }
    for (var groups2 = this._groups, m = groups2.length, sortgroups = new Array(m), j = 0;j < m; ++j) {
      for (var group2 = groups2[j], n = group2.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0;i < n; ++i) {
        if (node = group2[i]) {
          sortgroup[i] = node;
        }
      }
      sortgroup.sort(compareNode);
    }
    return new Selection(sortgroups, this._parents).order();
  }
  function ascending2(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  // node_modules/d3-selection/src/selection/call.js
  function call_default() {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  // node_modules/d3-selection/src/selection/nodes.js
  function nodes_default() {
    return Array.from(this);
  }

  // node_modules/d3-selection/src/selection/node.js
  function node_default() {
    for (var groups2 = this._groups, j = 0, m = groups2.length;j < m; ++j) {
      for (var group2 = groups2[j], i = 0, n = group2.length;i < n; ++i) {
        var node = group2[i];
        if (node)
          return node;
      }
    }
    return null;
  }

  // node_modules/d3-selection/src/selection/size.js
  function size_default() {
    let size = 0;
    for (const node of this)
      ++size;
    return size;
  }

  // node_modules/d3-selection/src/selection/empty.js
  function empty_default() {
    return !this.node();
  }

  // node_modules/d3-selection/src/selection/each.js
  function each_default(callback) {
    for (var groups2 = this._groups, j = 0, m = groups2.length;j < m; ++j) {
      for (var group2 = groups2[j], i = 0, n = group2.length, node;i < n; ++i) {
        if (node = group2[i])
          callback.call(node, node.__data__, i, group2);
      }
    }
    return this;
  }

  // node_modules/d3-selection/src/selection/attr.js
  function attrRemove(name) {
    return function() {
      this.removeAttribute(name);
    };
  }
  function attrRemoveNS(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }
  function attrConstant(name, value) {
    return function() {
      this.setAttribute(name, value);
    };
  }
  function attrConstantNS(fullname, value) {
    return function() {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }
  function attrFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null)
        this.removeAttribute(name);
      else
        this.setAttribute(name, v);
    };
  }
  function attrFunctionNS(fullname, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null)
        this.removeAttributeNS(fullname.space, fullname.local);
      else
        this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }
  function attr_default(name, value) {
    var fullname = namespace_default(name);
    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
    }
    return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
  }

  // node_modules/d3-selection/src/window.js
  function window_default(node) {
    return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
  }

  // node_modules/d3-selection/src/selection/style.js
  function styleRemove(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }
  function styleConstant(name, value, priority) {
    return function() {
      this.style.setProperty(name, value, priority);
    };
  }
  function styleFunction(name, value, priority) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null)
        this.style.removeProperty(name);
      else
        this.style.setProperty(name, v, priority);
    };
  }
  function style_default(name, value, priority) {
    return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
  }
  function styleValue(node, name) {
    return node.style.getPropertyValue(name) || window_default(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  // node_modules/d3-selection/src/selection/property.js
  function propertyRemove(name) {
    return function() {
      delete this[name];
    };
  }
  function propertyConstant(name, value) {
    return function() {
      this[name] = value;
    };
  }
  function propertyFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null)
        delete this[name];
      else
        this[name] = v;
    };
  }
  function property_default(name, value) {
    return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
  }

  // node_modules/d3-selection/src/selection/classed.js
  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }
  function classList(node) {
    return node.classList || new ClassList(node);
  }
  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }
  ClassList.prototype = {
    add: function(name) {
      var i = this._names.indexOf(name);
      if (i < 0) {
        this._names.push(name);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function(name) {
      var i = this._names.indexOf(name);
      if (i >= 0) {
        this._names.splice(i, 1);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function(name) {
      return this._names.indexOf(name) >= 0;
    }
  };
  function classedAdd(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n)
      list.add(names[i]);
  }
  function classedRemove(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n)
      list.remove(names[i]);
  }
  function classedTrue(names) {
    return function() {
      classedAdd(this, names);
    };
  }
  function classedFalse(names) {
    return function() {
      classedRemove(this, names);
    };
  }
  function classedFunction(names, value) {
    return function() {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }
  function classed_default(name, value) {
    var names = classArray(name + "");
    if (arguments.length < 2) {
      var list = classList(this.node()), i = -1, n = names.length;
      while (++i < n)
        if (!list.contains(names[i]))
          return false;
      return true;
    }
    return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
  }

  // node_modules/d3-selection/src/selection/text.js
  function textRemove() {
    this.textContent = "";
  }
  function textConstant(value) {
    return function() {
      this.textContent = value;
    };
  }
  function textFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }
  function text_default(value) {
    return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
  }

  // node_modules/d3-selection/src/selection/html.js
  function htmlRemove() {
    this.innerHTML = "";
  }
  function htmlConstant(value) {
    return function() {
      this.innerHTML = value;
    };
  }
  function htmlFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }
  function html_default(value) {
    return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
  }

  // node_modules/d3-selection/src/selection/raise.js
  function raise() {
    if (this.nextSibling)
      this.parentNode.appendChild(this);
  }
  function raise_default() {
    return this.each(raise);
  }

  // node_modules/d3-selection/src/selection/lower.js
  function lower() {
    if (this.previousSibling)
      this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }
  function lower_default() {
    return this.each(lower);
  }

  // node_modules/d3-selection/src/selection/append.js
  function append_default(name) {
    var create = typeof name === "function" ? name : creator_default(name);
    return this.select(function() {
      return this.appendChild(create.apply(this, arguments));
    });
  }

  // node_modules/d3-selection/src/selection/insert.js
  function constantNull() {
    return null;
  }
  function insert_default(name, before) {
    var create = typeof name === "function" ? name : creator_default(name), select = before == null ? constantNull : typeof before === "function" ? before : selector_default(before);
    return this.select(function() {
      return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  // node_modules/d3-selection/src/selection/remove.js
  function remove() {
    var parent = this.parentNode;
    if (parent)
      parent.removeChild(this);
  }
  function remove_default() {
    return this.each(remove);
  }

  // node_modules/d3-selection/src/selection/clone.js
  function selection_cloneShallow() {
    var clone = this.cloneNode(false), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }
  function selection_cloneDeep() {
    var clone = this.cloneNode(true), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }
  function clone_default(deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  // node_modules/d3-selection/src/selection/datum.js
  function datum_default(value) {
    return arguments.length ? this.property("__data__", value) : this.node().__data__;
  }

  // node_modules/d3-selection/src/selection/on.js
  function contextListener(listener) {
    return function(event) {
      listener.call(this, event, this.__data__);
    };
  }
  function parseTypenames2(typenames) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0)
        name = t.slice(i + 1), t = t.slice(0, i);
      return { type: t, name };
    });
  }
  function onRemove(typename) {
    return function() {
      var on = this.__on;
      if (!on)
        return;
      for (var j = 0, i = -1, m = on.length, o;j < m; ++j) {
        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
        } else {
          on[++i] = o;
        }
      }
      if (++i)
        on.length = i;
      else
        delete this.__on;
    };
  }
  function onAdd(typename, value, options) {
    return function() {
      var on = this.__on, o, listener = contextListener(value);
      if (on)
        for (var j = 0, m = on.length;j < m; ++j) {
          if ((o = on[j]).type === typename.type && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.options);
            this.addEventListener(o.type, o.listener = listener, o.options = options);
            o.value = value;
            return;
          }
        }
      this.addEventListener(typename.type, listener, options);
      o = { type: typename.type, name: typename.name, value, listener, options };
      if (!on)
        this.__on = [o];
      else
        on.push(o);
    };
  }
  function on_default(typename, value, options) {
    var typenames = parseTypenames2(typename + ""), i, n = typenames.length, t;
    if (arguments.length < 2) {
      var on = this.node().__on;
      if (on)
        for (var j = 0, m = on.length, o;j < m; ++j) {
          for (i = 0, o = on[j];i < n; ++i) {
            if ((t = typenames[i]).type === o.type && t.name === o.name) {
              return o.value;
            }
          }
        }
      return;
    }
    on = value ? onAdd : onRemove;
    for (i = 0;i < n; ++i)
      this.each(on(typenames[i], value, options));
    return this;
  }

  // node_modules/d3-selection/src/selection/dispatch.js
  function dispatchEvent(node, type, params) {
    var window2 = window_default(node), event = window2.CustomEvent;
    if (typeof event === "function") {
      event = new event(type, params);
    } else {
      event = window2.document.createEvent("Event");
      if (params)
        event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
      else
        event.initEvent(type, false, false);
    }
    node.dispatchEvent(event);
  }
  function dispatchConstant(type, params) {
    return function() {
      return dispatchEvent(this, type, params);
    };
  }
  function dispatchFunction(type, params) {
    return function() {
      return dispatchEvent(this, type, params.apply(this, arguments));
    };
  }
  function dispatch_default2(type, params) {
    return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
  }

  // node_modules/d3-selection/src/selection/iterator.js
  function* iterator_default() {
    for (var groups2 = this._groups, j = 0, m = groups2.length;j < m; ++j) {
      for (var group2 = groups2[j], i = 0, n = group2.length, node;i < n; ++i) {
        if (node = group2[i])
          yield node;
      }
    }
  }

  // node_modules/d3-selection/src/selection/index.js
  var root = [null];
  function Selection(groups2, parents) {
    this._groups = groups2;
    this._parents = parents;
  }
  function selection() {
    return new Selection([[document.documentElement]], root);
  }
  function selection_selection() {
    return this;
  }
  Selection.prototype = selection.prototype = {
    constructor: Selection,
    select: select_default,
    selectAll: selectAll_default,
    selectChild: selectChild_default,
    selectChildren: selectChildren_default,
    filter: filter_default,
    data: data_default,
    enter: enter_default,
    exit: exit_default,
    join: join_default,
    merge: merge_default,
    selection: selection_selection,
    order: order_default,
    sort: sort_default,
    call: call_default,
    nodes: nodes_default,
    node: node_default,
    size: size_default,
    empty: empty_default,
    each: each_default,
    attr: attr_default,
    style: style_default,
    property: property_default,
    classed: classed_default,
    text: text_default,
    html: html_default,
    raise: raise_default,
    lower: lower_default,
    append: append_default,
    insert: insert_default,
    remove: remove_default,
    clone: clone_default,
    datum: datum_default,
    on: on_default,
    dispatch: dispatch_default2,
    [Symbol.iterator]: iterator_default
  };
  var selection_default = selection;

  // node_modules/d3-selection/src/select.js
  function select_default2(selector) {
    return typeof selector === "string" ? new Selection([[document.querySelector(selector)]], [document.documentElement]) : new Selection([[selector]], root);
  }
  // node_modules/d3-selection/src/sourceEvent.js
  function sourceEvent_default(event) {
    let sourceEvent;
    while (sourceEvent = event.sourceEvent)
      event = sourceEvent;
    return event;
  }

  // node_modules/d3-selection/src/pointer.js
  function pointer_default(event, node) {
    event = sourceEvent_default(event);
    if (node === undefined)
      node = event.currentTarget;
    if (node) {
      var svg = node.ownerSVGElement || node;
      if (svg.createSVGPoint) {
        var point = svg.createSVGPoint();
        point.x = event.clientX, point.y = event.clientY;
        point = point.matrixTransform(node.getScreenCTM().inverse());
        return [point.x, point.y];
      }
      if (node.getBoundingClientRect) {
        var rect = node.getBoundingClientRect();
        return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
      }
    }
    return [event.pageX, event.pageY];
  }
  // node_modules/d3-drag/src/noevent.js
  var nonpassive = { passive: false };
  var nonpassivecapture = { capture: true, passive: false };
  function nopropagation(event) {
    event.stopImmediatePropagation();
  }
  function noevent_default(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  // node_modules/d3-drag/src/nodrag.js
  function nodrag_default(view) {
    var root2 = view.document.documentElement, selection2 = select_default2(view).on("dragstart.drag", noevent_default, nonpassivecapture);
    if ("onselectstart" in root2) {
      selection2.on("selectstart.drag", noevent_default, nonpassivecapture);
    } else {
      root2.__noselect = root2.style.MozUserSelect;
      root2.style.MozUserSelect = "none";
    }
  }
  function yesdrag(view, noclick) {
    var root2 = view.document.documentElement, selection2 = select_default2(view).on("dragstart.drag", null);
    if (noclick) {
      selection2.on("click.drag", noevent_default, nonpassivecapture);
      setTimeout(function() {
        selection2.on("click.drag", null);
      }, 0);
    }
    if ("onselectstart" in root2) {
      selection2.on("selectstart.drag", null);
    } else {
      root2.style.MozUserSelect = root2.__noselect;
      delete root2.__noselect;
    }
  }

  // node_modules/d3-drag/src/constant.js
  var constant_default2 = (x) => () => x;

  // node_modules/d3-drag/src/event.js
  function DragEvent(type, {
    sourceEvent,
    subject,
    target,
    identifier,
    active,
    x,
    y,
    dx,
    dy,
    dispatch: dispatch2
  }) {
    Object.defineProperties(this, {
      type: { value: type, enumerable: true, configurable: true },
      sourceEvent: { value: sourceEvent, enumerable: true, configurable: true },
      subject: { value: subject, enumerable: true, configurable: true },
      target: { value: target, enumerable: true, configurable: true },
      identifier: { value: identifier, enumerable: true, configurable: true },
      active: { value: active, enumerable: true, configurable: true },
      x: { value: x, enumerable: true, configurable: true },
      y: { value: y, enumerable: true, configurable: true },
      dx: { value: dx, enumerable: true, configurable: true },
      dy: { value: dy, enumerable: true, configurable: true },
      _: { value: dispatch2 }
    });
  }
  DragEvent.prototype.on = function() {
    var value = this._.on.apply(this._, arguments);
    return value === this._ ? this : value;
  };

  // node_modules/d3-drag/src/drag.js
  function defaultFilter(event) {
    return !event.ctrlKey && !event.button;
  }
  function defaultContainer() {
    return this.parentNode;
  }
  function defaultSubject(event, d) {
    return d == null ? { x: event.x, y: event.y } : d;
  }
  function defaultTouchable() {
    return navigator.maxTouchPoints || "ontouchstart" in this;
  }
  function drag_default() {
    var filter2 = defaultFilter, container = defaultContainer, subject = defaultSubject, touchable = defaultTouchable, gestures = {}, listeners = dispatch_default("start", "drag", "end"), active = 0, mousedownx, mousedowny, mousemoving, touchending, clickDistance2 = 0;
    function drag(selection2) {
      selection2.on("mousedown.drag", mousedowned).filter(touchable).on("touchstart.drag", touchstarted).on("touchmove.drag", touchmoved, nonpassive).on("touchend.drag touchcancel.drag", touchended).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
    }
    function mousedowned(event, d) {
      if (touchending || !filter2.call(this, event, d))
        return;
      var gesture = beforestart(this, container.call(this, event, d), event, d, "mouse");
      if (!gesture)
        return;
      select_default2(event.view).on("mousemove.drag", mousemoved, nonpassivecapture).on("mouseup.drag", mouseupped, nonpassivecapture);
      nodrag_default(event.view);
      nopropagation(event);
      mousemoving = false;
      mousedownx = event.clientX;
      mousedowny = event.clientY;
      gesture("start", event);
    }
    function mousemoved(event) {
      noevent_default(event);
      if (!mousemoving) {
        var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
        mousemoving = dx * dx + dy * dy > clickDistance2;
      }
      gestures.mouse("drag", event);
    }
    function mouseupped(event) {
      select_default2(event.view).on("mousemove.drag mouseup.drag", null);
      yesdrag(event.view, mousemoving);
      noevent_default(event);
      gestures.mouse("end", event);
    }
    function touchstarted(event, d) {
      if (!filter2.call(this, event, d))
        return;
      var touches = event.changedTouches, c = container.call(this, event, d), n = touches.length, i, gesture;
      for (i = 0;i < n; ++i) {
        if (gesture = beforestart(this, c, event, d, touches[i].identifier, touches[i])) {
          nopropagation(event);
          gesture("start", event, touches[i]);
        }
      }
    }
    function touchmoved(event) {
      var touches = event.changedTouches, n = touches.length, i, gesture;
      for (i = 0;i < n; ++i) {
        if (gesture = gestures[touches[i].identifier]) {
          noevent_default(event);
          gesture("drag", event, touches[i]);
        }
      }
    }
    function touchended(event) {
      var touches = event.changedTouches, n = touches.length, i, gesture;
      if (touchending)
        clearTimeout(touchending);
      touchending = setTimeout(function() {
        touchending = null;
      }, 500);
      for (i = 0;i < n; ++i) {
        if (gesture = gestures[touches[i].identifier]) {
          nopropagation(event);
          gesture("end", event, touches[i]);
        }
      }
    }
    function beforestart(that, container2, event, d, identifier, touch) {
      var dispatch2 = listeners.copy(), p = pointer_default(touch || event, container2), dx, dy, s;
      if ((s = subject.call(that, new DragEvent("beforestart", {
        sourceEvent: event,
        target: drag,
        identifier,
        active,
        x: p[0],
        y: p[1],
        dx: 0,
        dy: 0,
        dispatch: dispatch2
      }), d)) == null)
        return;
      dx = s.x - p[0] || 0;
      dy = s.y - p[1] || 0;
      return function gesture(type, event2, touch2) {
        var p0 = p, n;
        switch (type) {
          case "start":
            gestures[identifier] = gesture, n = active++;
            break;
          case "end":
            delete gestures[identifier], --active;
          case "drag":
            p = pointer_default(touch2 || event2, container2), n = active;
            break;
        }
        dispatch2.call(type, that, new DragEvent(type, {
          sourceEvent: event2,
          subject: s,
          target: drag,
          identifier,
          active: n,
          x: p[0] + dx,
          y: p[1] + dy,
          dx: p[0] - p0[0],
          dy: p[1] - p0[1],
          dispatch: dispatch2
        }), d);
      };
    }
    drag.filter = function(_) {
      return arguments.length ? (filter2 = typeof _ === "function" ? _ : constant_default2(!!_), drag) : filter2;
    };
    drag.container = function(_) {
      return arguments.length ? (container = typeof _ === "function" ? _ : constant_default2(_), drag) : container;
    };
    drag.subject = function(_) {
      return arguments.length ? (subject = typeof _ === "function" ? _ : constant_default2(_), drag) : subject;
    };
    drag.touchable = function(_) {
      return arguments.length ? (touchable = typeof _ === "function" ? _ : constant_default2(!!_), drag) : touchable;
    };
    drag.on = function() {
      var value = listeners.on.apply(listeners, arguments);
      return value === listeners ? drag : value;
    };
    drag.clickDistance = function(_) {
      return arguments.length ? (clickDistance2 = (_ = +_) * _, drag) : Math.sqrt(clickDistance2);
    };
    return drag;
  }
  // node_modules/d3-color/src/define.js
  function define_default(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }
  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition)
      prototype[key] = definition[key];
    return prototype;
  }

  // node_modules/d3-color/src/color.js
  function Color() {}
  var darker = 0.7;
  var brighter = 1 / darker;
  var reI = "\\s*([+-]?\\d+)\\s*";
  var reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*";
  var reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
  var reHex = /^#([0-9a-f]{3,8})$/;
  var reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`);
  var reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`);
  var reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`);
  var reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`);
  var reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`);
  var reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
  var named = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  };
  define_default(Color, color, {
    copy(channels) {
      return Object.assign(new this.constructor, this, channels);
    },
    displayable() {
      return this.rgb().displayable();
    },
    hex: color_formatHex,
    formatHex: color_formatHex,
    formatHex8: color_formatHex8,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });
  function color_formatHex() {
    return this.rgb().formatHex();
  }
  function color_formatHex8() {
    return this.rgb().formatHex8();
  }
  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }
  function color_formatRgb() {
    return this.rgb().formatRgb();
  }
  function color(format) {
    var m, l;
    format = (format + "").trim().toLowerCase();
    return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
  }
  function rgbn(n) {
    return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
  }
  function rgba(r, g, b, a) {
    if (a <= 0)
      r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }
  function rgbConvert(o) {
    if (!(o instanceof Color))
      o = color(o);
    if (!o)
      return new Rgb;
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }
  function rgb(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }
  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }
  define_default(Rgb, rgb, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb() {
      return this;
    },
    clamp() {
      return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
    },
    displayable() {
      return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: rgb_formatHex,
    formatHex: rgb_formatHex,
    formatHex8: rgb_formatHex8,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));
  function rgb_formatHex() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
  }
  function rgb_formatHex8() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
  }
  function rgb_formatRgb() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
  }
  function clampa(opacity) {
    return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
  }
  function clampi(value) {
    return Math.max(0, Math.min(255, Math.round(value) || 0));
  }
  function hex(value) {
    value = clampi(value);
    return (value < 16 ? "0" : "") + value.toString(16);
  }
  function hsla(h, s, l, a) {
    if (a <= 0)
      h = s = l = NaN;
    else if (l <= 0 || l >= 1)
      h = s = NaN;
    else if (s <= 0)
      h = NaN;
    return new Hsl(h, s, l, a);
  }
  function hslConvert(o) {
    if (o instanceof Hsl)
      return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color))
      o = color(o);
    if (!o)
      return new Hsl;
    if (o instanceof Hsl)
      return o;
    o = o.rgb();
    var r = o.r / 255, g = o.g / 255, b = o.b / 255, min2 = Math.min(r, g, b), max2 = Math.max(r, g, b), h = NaN, s = max2 - min2, l = (max2 + min2) / 2;
    if (s) {
      if (r === max2)
        h = (g - b) / s + (g < b) * 6;
      else if (g === max2)
        h = (b - r) / s + 2;
      else
        h = (r - g) / s + 4;
      s /= l < 0.5 ? max2 + min2 : 2 - max2 - min2;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }
  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }
  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }
  define_default(Hsl, hsl, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb() {
      var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
      return new Rgb(hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2), hsl2rgb(h, m1, m2), hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2), this.opacity);
    },
    clamp() {
      return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
    },
    displayable() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
    },
    formatHsl() {
      const a = clampa(this.opacity);
      return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
    }
  }));
  function clamph(value) {
    value = (value || 0) % 360;
    return value < 0 ? value + 360 : value;
  }
  function clampt(value) {
    return Math.max(0, Math.min(1, value || 0));
  }
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
  }
  // node_modules/d3-color/src/math.js
  var radians = Math.PI / 180;
  var degrees = 180 / Math.PI;

  // node_modules/d3-color/src/lab.js
  var K = 18;
  var Xn = 0.96422;
  var Yn = 1;
  var Zn = 0.82521;
  var t0 = 4 / 29;
  var t1 = 6 / 29;
  var t2 = 3 * t1 * t1;
  var t3 = t1 * t1 * t1;
  function labConvert(o) {
    if (o instanceof Lab)
      return new Lab(o.l, o.a, o.b, o.opacity);
    if (o instanceof Hcl)
      return hcl2lab(o);
    if (!(o instanceof Rgb))
      o = rgbConvert(o);
    var r = rgb2lrgb(o.r), g = rgb2lrgb(o.g), b = rgb2lrgb(o.b), y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn), x, z;
    if (r === g && g === b)
      x = z = y;
    else {
      x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
      z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
    }
    return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
  }
  function lab(l, a, b, opacity) {
    return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
  }
  function Lab(l, a, b, opacity) {
    this.l = +l;
    this.a = +a;
    this.b = +b;
    this.opacity = +opacity;
  }
  define_default(Lab, lab, extend(Color, {
    brighter(k) {
      return new Lab(this.l + K * (k == null ? 1 : k), this.a, this.b, this.opacity);
    },
    darker(k) {
      return new Lab(this.l - K * (k == null ? 1 : k), this.a, this.b, this.opacity);
    },
    rgb() {
      var y = (this.l + 16) / 116, x = isNaN(this.a) ? y : y + this.a / 500, z = isNaN(this.b) ? y : y - this.b / 200;
      x = Xn * lab2xyz(x);
      y = Yn * lab2xyz(y);
      z = Zn * lab2xyz(z);
      return new Rgb(lrgb2rgb(3.1338561 * x - 1.6168667 * y - 0.4906146 * z), lrgb2rgb(-0.9787684 * x + 1.9161415 * y + 0.033454 * z), lrgb2rgb(0.0719453 * x - 0.2289914 * y + 1.4052427 * z), this.opacity);
    }
  }));
  function xyz2lab(t) {
    return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
  }
  function lab2xyz(t) {
    return t > t1 ? t * t * t : t2 * (t - t0);
  }
  function lrgb2rgb(x) {
    return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
  }
  function rgb2lrgb(x) {
    return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  }
  function hclConvert(o) {
    if (o instanceof Hcl)
      return new Hcl(o.h, o.c, o.l, o.opacity);
    if (!(o instanceof Lab))
      o = labConvert(o);
    if (o.a === 0 && o.b === 0)
      return new Hcl(NaN, 0 < o.l && o.l < 100 ? 0 : NaN, o.l, o.opacity);
    var h = Math.atan2(o.b, o.a) * degrees;
    return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
  }
  function hcl(h, c, l, opacity) {
    return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
  }
  function Hcl(h, c, l, opacity) {
    this.h = +h;
    this.c = +c;
    this.l = +l;
    this.opacity = +opacity;
  }
  function hcl2lab(o) {
    if (isNaN(o.h))
      return new Lab(o.l, 0, 0, o.opacity);
    var h = o.h * radians;
    return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
  }
  define_default(Hcl, hcl, extend(Color, {
    brighter(k) {
      return new Hcl(this.h, this.c, this.l + K * (k == null ? 1 : k), this.opacity);
    },
    darker(k) {
      return new Hcl(this.h, this.c, this.l - K * (k == null ? 1 : k), this.opacity);
    },
    rgb() {
      return hcl2lab(this).rgb();
    }
  }));
  // node_modules/d3-interpolate/src/basis.js
  function basis(t12, v0, v1, v2, v3) {
    var t22 = t12 * t12, t32 = t22 * t12;
    return ((1 - 3 * t12 + 3 * t22 - t32) * v0 + (4 - 6 * t22 + 3 * t32) * v1 + (1 + 3 * t12 + 3 * t22 - 3 * t32) * v2 + t32 * v3) / 6;
  }
  function basis_default(values) {
    var n = values.length - 1;
    return function(t) {
      var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
      return basis((t - i / n) * n, v0, v1, v2, v3);
    };
  }

  // node_modules/d3-interpolate/src/basisClosed.js
  function basisClosed_default(values) {
    var n = values.length;
    return function(t) {
      var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n), v0 = values[(i + n - 1) % n], v1 = values[i % n], v2 = values[(i + 1) % n], v3 = values[(i + 2) % n];
      return basis((t - i / n) * n, v0, v1, v2, v3);
    };
  }

  // node_modules/d3-interpolate/src/constant.js
  var constant_default3 = (x) => () => x;

  // node_modules/d3-interpolate/src/color.js
  function linear(a, d) {
    return function(t) {
      return a + t * d;
    };
  }
  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
      return Math.pow(a + t * b, y);
    };
  }
  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y) : constant_default3(isNaN(a) ? b : a);
    };
  }
  function nogamma(a, b) {
    var d = b - a;
    return d ? linear(a, d) : constant_default3(isNaN(a) ? b : a);
  }

  // node_modules/d3-interpolate/src/rgb.js
  var rgb_default = function rgbGamma(y) {
    var color2 = gamma(y);
    function rgb2(start, end) {
      var r = color2((start = rgb(start)).r, (end = rgb(end)).r), g = color2(start.g, end.g), b = color2(start.b, end.b), opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.r = r(t);
        start.g = g(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }
    rgb2.gamma = rgbGamma;
    return rgb2;
  }(1);
  function rgbSpline(spline) {
    return function(colors) {
      var n = colors.length, r = new Array(n), g = new Array(n), b = new Array(n), i, color2;
      for (i = 0;i < n; ++i) {
        color2 = rgb(colors[i]);
        r[i] = color2.r || 0;
        g[i] = color2.g || 0;
        b[i] = color2.b || 0;
      }
      r = spline(r);
      g = spline(g);
      b = spline(b);
      color2.opacity = 1;
      return function(t) {
        color2.r = r(t);
        color2.g = g(t);
        color2.b = b(t);
        return color2 + "";
      };
    };
  }
  var rgbBasis = rgbSpline(basis_default);
  var rgbBasisClosed = rgbSpline(basisClosed_default);

  // node_modules/d3-interpolate/src/numberArray.js
  function numberArray_default(a, b) {
    if (!b)
      b = [];
    var n = a ? Math.min(b.length, a.length) : 0, c = b.slice(), i;
    return function(t) {
      for (i = 0;i < n; ++i)
        c[i] = a[i] * (1 - t) + b[i] * t;
      return c;
    };
  }
  function isNumberArray(x) {
    return ArrayBuffer.isView(x) && !(x instanceof DataView);
  }

  // node_modules/d3-interpolate/src/array.js
  function genericArray(a, b) {
    var nb = b ? b.length : 0, na = a ? Math.min(nb, a.length) : 0, x = new Array(na), c = new Array(nb), i;
    for (i = 0;i < na; ++i)
      x[i] = value_default(a[i], b[i]);
    for (;i < nb; ++i)
      c[i] = b[i];
    return function(t) {
      for (i = 0;i < na; ++i)
        c[i] = x[i](t);
      return c;
    };
  }

  // node_modules/d3-interpolate/src/date.js
  function date_default(a, b) {
    var d = new Date;
    return a = +a, b = +b, function(t) {
      return d.setTime(a * (1 - t) + b * t), d;
    };
  }

  // node_modules/d3-interpolate/src/number.js
  function number_default(a, b) {
    return a = +a, b = +b, function(t) {
      return a * (1 - t) + b * t;
    };
  }

  // node_modules/d3-interpolate/src/object.js
  function object_default(a, b) {
    var i = {}, c = {}, k;
    if (a === null || typeof a !== "object")
      a = {};
    if (b === null || typeof b !== "object")
      b = {};
    for (k in b) {
      if (k in a) {
        i[k] = value_default(a[k], b[k]);
      } else {
        c[k] = b[k];
      }
    }
    return function(t) {
      for (k in i)
        c[k] = i[k](t);
      return c;
    };
  }

  // node_modules/d3-interpolate/src/string.js
  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
  var reB = new RegExp(reA.source, "g");
  function zero2(b) {
    return function() {
      return b;
    };
  }
  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }
  function string_default(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
    a = a + "", b = b + "";
    while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) {
        bs = b.slice(bi, bs);
        if (s[i])
          s[i] += bs;
        else
          s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) {
        if (s[i])
          s[i] += bm;
        else
          s[++i] = bm;
      } else {
        s[++i] = null;
        q.push({ i, x: number_default(am, bm) });
      }
      bi = reB.lastIndex;
    }
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i])
        s[i] += bs;
      else
        s[++i] = bs;
    }
    return s.length < 2 ? q[0] ? one(q[0].x) : zero2(b) : (b = q.length, function(t) {
      for (var i2 = 0, o;i2 < b; ++i2)
        s[(o = q[i2]).i] = o.x(t);
      return s.join("");
    });
  }

  // node_modules/d3-interpolate/src/value.js
  function value_default(a, b) {
    var t = typeof b, c;
    return b == null || t === "boolean" ? constant_default3(b) : (t === "number" ? number_default : t === "string" ? (c = color(b)) ? (b = c, rgb_default) : string_default : b instanceof color ? rgb_default : b instanceof Date ? date_default : isNumberArray(b) ? numberArray_default : Array.isArray(b) ? genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object_default : number_default)(a, b);
  }
  // node_modules/d3-interpolate/src/round.js
  function round_default(a, b) {
    return a = +a, b = +b, function(t) {
      return Math.round(a * (1 - t) + b * t);
    };
  }
  // node_modules/d3-interpolate/src/transform/decompose.js
  var degrees2 = 180 / Math.PI;
  var identity2 = {
    translateX: 0,
    translateY: 0,
    rotate: 0,
    skewX: 0,
    scaleX: 1,
    scaleY: 1
  };
  function decompose_default(a, b, c, d, e, f) {
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b))
      a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d)
      c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d))
      c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c)
      a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
      translateX: e,
      translateY: f,
      rotate: Math.atan2(b, a) * degrees2,
      skewX: Math.atan(skewX) * degrees2,
      scaleX,
      scaleY
    };
  }

  // node_modules/d3-interpolate/src/transform/parse.js
  var svgNode;
  function parseCss(value) {
    const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
    return m.isIdentity ? identity2 : decompose_default(m.a, m.b, m.c, m.d, m.e, m.f);
  }
  function parseSvg(value) {
    if (value == null)
      return identity2;
    if (!svgNode)
      svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svgNode.setAttribute("transform", value);
    if (!(value = svgNode.transform.baseVal.consolidate()))
      return identity2;
    value = value.matrix;
    return decompose_default(value.a, value.b, value.c, value.d, value.e, value.f);
  }

  // node_modules/d3-interpolate/src/transform/index.js
  function interpolateTransform(parse, pxComma, pxParen, degParen) {
    function pop(s) {
      return s.length ? s.pop() + " " : "";
    }
    function translate(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push("translate(", null, pxComma, null, pxParen);
        q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
      } else if (xb || yb) {
        s.push("translate(" + xb + pxComma + yb + pxParen);
      }
    }
    function rotate(a, b, s, q) {
      if (a !== b) {
        if (a - b > 180)
          b += 360;
        else if (b - a > 180)
          a += 360;
        q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: number_default(a, b) });
      } else if (b) {
        s.push(pop(s) + "rotate(" + b + degParen);
      }
    }
    function skewX(a, b, s, q) {
      if (a !== b) {
        q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: number_default(a, b) });
      } else if (b) {
        s.push(pop(s) + "skewX(" + b + degParen);
      }
    }
    function scale(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push(pop(s) + "scale(", null, ",", null, ")");
        q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
      } else if (xb !== 1 || yb !== 1) {
        s.push(pop(s) + "scale(" + xb + "," + yb + ")");
      }
    }
    return function(a, b) {
      var s = [], q = [];
      a = parse(a), b = parse(b);
      translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
      rotate(a.rotate, b.rotate, s, q);
      skewX(a.skewX, b.skewX, s, q);
      scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
      a = b = null;
      return function(t) {
        var i = -1, n = q.length, o;
        while (++i < n)
          s[(o = q[i]).i] = o.x(t);
        return s.join("");
      };
    };
  }
  var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
  var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");
  // node_modules/d3-interpolate/src/lab.js
  function lab2(start, end) {
    var l = nogamma((start = lab(start)).l, (end = lab(end)).l), a = nogamma(start.a, end.a), b = nogamma(start.b, end.b), opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.l = l(t);
      start.a = a(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }
  // node_modules/d3-timer/src/timer.js
  var frame = 0;
  var timeout = 0;
  var interval = 0;
  var pokeDelay = 1000;
  var taskHead;
  var taskTail;
  var clockLast = 0;
  var clockNow = 0;
  var clockSkew = 0;
  var clock = typeof performance === "object" && performance.now ? performance : Date;
  var setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
    setTimeout(f, 17);
  };
  function now() {
    return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
  }
  function clearNow() {
    clockNow = 0;
  }
  function Timer() {
    this._call = this._time = this._next = null;
  }
  Timer.prototype = timer.prototype = {
    constructor: Timer,
    restart: function(callback, delay, time) {
      if (typeof callback !== "function")
        throw new TypeError("callback is not a function");
      time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
      if (!this._next && taskTail !== this) {
        if (taskTail)
          taskTail._next = this;
        else
          taskHead = this;
        taskTail = this;
      }
      this._call = callback;
      this._time = time;
      sleep();
    },
    stop: function() {
      if (this._call) {
        this._call = null;
        this._time = Infinity;
        sleep();
      }
    }
  };
  function timer(callback, delay, time) {
    var t = new Timer;
    t.restart(callback, delay, time);
    return t;
  }
  function timerFlush() {
    now();
    ++frame;
    var t = taskHead, e;
    while (t) {
      if ((e = clockNow - t._time) >= 0)
        t._call.call(undefined, e);
      t = t._next;
    }
    --frame;
  }
  function wake() {
    clockNow = (clockLast = clock.now()) + clockSkew;
    frame = timeout = 0;
    try {
      timerFlush();
    } finally {
      frame = 0;
      nap();
      clockNow = 0;
    }
  }
  function poke() {
    var now2 = clock.now(), delay = now2 - clockLast;
    if (delay > pokeDelay)
      clockSkew -= delay, clockLast = now2;
  }
  function nap() {
    var t02, t12 = taskHead, t22, time = Infinity;
    while (t12) {
      if (t12._call) {
        if (time > t12._time)
          time = t12._time;
        t02 = t12, t12 = t12._next;
      } else {
        t22 = t12._next, t12._next = null;
        t12 = t02 ? t02._next = t22 : taskHead = t22;
      }
    }
    taskTail = t02;
    sleep(time);
  }
  function sleep(time) {
    if (frame)
      return;
    if (timeout)
      timeout = clearTimeout(timeout);
    var delay = time - clockNow;
    if (delay > 24) {
      if (time < Infinity)
        timeout = setTimeout(wake, time - clock.now() - clockSkew);
      if (interval)
        interval = clearInterval(interval);
    } else {
      if (!interval)
        clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
      frame = 1, setFrame(wake);
    }
  }
  // node_modules/d3-timer/src/timeout.js
  function timeout_default(callback, delay, time) {
    var t = new Timer;
    delay = delay == null ? 0 : +delay;
    t.restart((elapsed) => {
      t.stop();
      callback(elapsed + delay);
    }, delay, time);
    return t;
  }
  // node_modules/d3-transition/src/transition/schedule.js
  var emptyOn = dispatch_default("start", "end", "cancel", "interrupt");
  var emptyTween = [];
  var CREATED = 0;
  var SCHEDULED = 1;
  var STARTING = 2;
  var STARTED = 3;
  var RUNNING = 4;
  var ENDING = 5;
  var ENDED = 6;
  function schedule_default(node, name, id, index2, group2, timing) {
    var schedules = node.__transition;
    if (!schedules)
      node.__transition = {};
    else if (id in schedules)
      return;
    create(node, id, {
      name,
      index: index2,
      group: group2,
      on: emptyOn,
      tween: emptyTween,
      time: timing.time,
      delay: timing.delay,
      duration: timing.duration,
      ease: timing.ease,
      timer: null,
      state: CREATED
    });
  }
  function init(node, id) {
    var schedule = get2(node, id);
    if (schedule.state > CREATED)
      throw new Error("too late; already scheduled");
    return schedule;
  }
  function set2(node, id) {
    var schedule = get2(node, id);
    if (schedule.state > STARTED)
      throw new Error("too late; already running");
    return schedule;
  }
  function get2(node, id) {
    var schedule = node.__transition;
    if (!schedule || !(schedule = schedule[id]))
      throw new Error("transition not found");
    return schedule;
  }
  function create(node, id, self2) {
    var schedules = node.__transition, tween;
    schedules[id] = self2;
    self2.timer = timer(schedule, 0, self2.time);
    function schedule(elapsed) {
      self2.state = SCHEDULED;
      self2.timer.restart(start, self2.delay, self2.time);
      if (self2.delay <= elapsed)
        start(elapsed - self2.delay);
    }
    function start(elapsed) {
      var i, j, n, o;
      if (self2.state !== SCHEDULED)
        return stop();
      for (i in schedules) {
        o = schedules[i];
        if (o.name !== self2.name)
          continue;
        if (o.state === STARTED)
          return timeout_default(start);
        if (o.state === RUNNING) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("interrupt", node, node.__data__, o.index, o.group);
          delete schedules[i];
        } else if (+i < id) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("cancel", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }
      }
      timeout_default(function() {
        if (self2.state === STARTED) {
          self2.state = RUNNING;
          self2.timer.restart(tick, self2.delay, self2.time);
          tick(elapsed);
        }
      });
      self2.state = STARTING;
      self2.on.call("start", node, node.__data__, self2.index, self2.group);
      if (self2.state !== STARTING)
        return;
      self2.state = STARTED;
      tween = new Array(n = self2.tween.length);
      for (i = 0, j = -1;i < n; ++i) {
        if (o = self2.tween[i].value.call(node, node.__data__, self2.index, self2.group)) {
          tween[++j] = o;
        }
      }
      tween.length = j + 1;
    }
    function tick(elapsed) {
      var t = elapsed < self2.duration ? self2.ease.call(null, elapsed / self2.duration) : (self2.timer.restart(stop), self2.state = ENDING, 1), i = -1, n = tween.length;
      while (++i < n) {
        tween[i].call(node, t);
      }
      if (self2.state === ENDING) {
        self2.on.call("end", node, node.__data__, self2.index, self2.group);
        stop();
      }
    }
    function stop() {
      self2.state = ENDED;
      self2.timer.stop();
      delete schedules[id];
      for (var i in schedules)
        return;
      delete node.__transition;
    }
  }

  // node_modules/d3-transition/src/interrupt.js
  function interrupt_default(node, name) {
    var schedules = node.__transition, schedule, active, empty2 = true, i;
    if (!schedules)
      return;
    name = name == null ? null : name + "";
    for (i in schedules) {
      if ((schedule = schedules[i]).name !== name) {
        empty2 = false;
        continue;
      }
      active = schedule.state > STARTING && schedule.state < ENDING;
      schedule.state = ENDED;
      schedule.timer.stop();
      schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
      delete schedules[i];
    }
    if (empty2)
      delete node.__transition;
  }

  // node_modules/d3-transition/src/selection/interrupt.js
  function interrupt_default2(name) {
    return this.each(function() {
      interrupt_default(this, name);
    });
  }

  // node_modules/d3-transition/src/transition/tween.js
  function tweenRemove(id, name) {
    var tween0, tween1;
    return function() {
      var schedule = set2(this, id), tween = schedule.tween;
      if (tween !== tween0) {
        tween1 = tween0 = tween;
        for (var i = 0, n = tween1.length;i < n; ++i) {
          if (tween1[i].name === name) {
            tween1 = tween1.slice();
            tween1.splice(i, 1);
            break;
          }
        }
      }
      schedule.tween = tween1;
    };
  }
  function tweenFunction(id, name, value) {
    var tween0, tween1;
    if (typeof value !== "function")
      throw new Error;
    return function() {
      var schedule = set2(this, id), tween = schedule.tween;
      if (tween !== tween0) {
        tween1 = (tween0 = tween).slice();
        for (var t = { name, value }, i = 0, n = tween1.length;i < n; ++i) {
          if (tween1[i].name === name) {
            tween1[i] = t;
            break;
          }
        }
        if (i === n)
          tween1.push(t);
      }
      schedule.tween = tween1;
    };
  }
  function tween_default(name, value) {
    var id = this._id;
    name += "";
    if (arguments.length < 2) {
      var tween = get2(this.node(), id).tween;
      for (var i = 0, n = tween.length, t;i < n; ++i) {
        if ((t = tween[i]).name === name) {
          return t.value;
        }
      }
      return null;
    }
    return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
  }
  function tweenValue(transition, name, value) {
    var id = transition._id;
    transition.each(function() {
      var schedule = set2(this, id);
      (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
    });
    return function(node) {
      return get2(node, id).value[name];
    };
  }

  // node_modules/d3-transition/src/transition/interpolate.js
  function interpolate_default(a, b) {
    var c;
    return (typeof b === "number" ? number_default : b instanceof color ? rgb_default : (c = color(b)) ? (b = c, rgb_default) : string_default)(a, b);
  }

  // node_modules/d3-transition/src/transition/attr.js
  function attrRemove2(name) {
    return function() {
      this.removeAttribute(name);
    };
  }
  function attrRemoveNS2(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }
  function attrConstant2(name, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = this.getAttribute(name);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function attrConstantNS2(fullname, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = this.getAttributeNS(fullname.space, fullname.local);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function attrFunction2(name, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null)
        return void this.removeAttribute(name);
      string0 = this.getAttribute(name);
      string1 = value1 + "";
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function attrFunctionNS2(fullname, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null)
        return void this.removeAttributeNS(fullname.space, fullname.local);
      string0 = this.getAttributeNS(fullname.space, fullname.local);
      string1 = value1 + "";
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function attr_default2(name, value) {
    var fullname = namespace_default(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate_default;
    return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS2 : attrFunction2)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS2 : attrRemove2)(fullname) : (fullname.local ? attrConstantNS2 : attrConstant2)(fullname, i, value));
  }

  // node_modules/d3-transition/src/transition/attrTween.js
  function attrInterpolate(name, i) {
    return function(t) {
      this.setAttribute(name, i.call(this, t));
    };
  }
  function attrInterpolateNS(fullname, i) {
    return function(t) {
      this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
    };
  }
  function attrTweenNS(fullname, value) {
    var t02, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0)
        t02 = (i0 = i) && attrInterpolateNS(fullname, i);
      return t02;
    }
    tween._value = value;
    return tween;
  }
  function attrTween(name, value) {
    var t02, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0)
        t02 = (i0 = i) && attrInterpolate(name, i);
      return t02;
    }
    tween._value = value;
    return tween;
  }
  function attrTween_default(name, value) {
    var key = "attr." + name;
    if (arguments.length < 2)
      return (key = this.tween(key)) && key._value;
    if (value == null)
      return this.tween(key, null);
    if (typeof value !== "function")
      throw new Error;
    var fullname = namespace_default(name);
    return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
  }

  // node_modules/d3-transition/src/transition/delay.js
  function delayFunction(id, value) {
    return function() {
      init(this, id).delay = +value.apply(this, arguments);
    };
  }
  function delayConstant(id, value) {
    return value = +value, function() {
      init(this, id).delay = value;
    };
  }
  function delay_default(value) {
    var id = this._id;
    return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id, value)) : get2(this.node(), id).delay;
  }

  // node_modules/d3-transition/src/transition/duration.js
  function durationFunction(id, value) {
    return function() {
      set2(this, id).duration = +value.apply(this, arguments);
    };
  }
  function durationConstant(id, value) {
    return value = +value, function() {
      set2(this, id).duration = value;
    };
  }
  function duration_default(value) {
    var id = this._id;
    return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id, value)) : get2(this.node(), id).duration;
  }

  // node_modules/d3-transition/src/transition/ease.js
  function easeConstant(id, value) {
    if (typeof value !== "function")
      throw new Error;
    return function() {
      set2(this, id).ease = value;
    };
  }
  function ease_default(value) {
    var id = this._id;
    return arguments.length ? this.each(easeConstant(id, value)) : get2(this.node(), id).ease;
  }

  // node_modules/d3-transition/src/transition/easeVarying.js
  function easeVarying(id, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (typeof v !== "function")
        throw new Error;
      set2(this, id).ease = v;
    };
  }
  function easeVarying_default(value) {
    if (typeof value !== "function")
      throw new Error;
    return this.each(easeVarying(this._id, value));
  }

  // node_modules/d3-transition/src/transition/filter.js
  function filter_default2(match) {
    if (typeof match !== "function")
      match = matcher_default(match);
    for (var groups2 = this._groups, m = groups2.length, subgroups = new Array(m), j = 0;j < m; ++j) {
      for (var group2 = groups2[j], n = group2.length, subgroup = subgroups[j] = [], node, i = 0;i < n; ++i) {
        if ((node = group2[i]) && match.call(node, node.__data__, i, group2)) {
          subgroup.push(node);
        }
      }
    }
    return new Transition(subgroups, this._parents, this._name, this._id);
  }

  // node_modules/d3-transition/src/transition/merge.js
  function merge_default2(transition) {
    if (transition._id !== this._id)
      throw new Error;
    for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0;j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0;i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }
    for (;j < m0; ++j) {
      merges[j] = groups0[j];
    }
    return new Transition(merges, this._parents, this._name, this._id);
  }

  // node_modules/d3-transition/src/transition/on.js
  function start(name) {
    return (name + "").trim().split(/^|\s+/).every(function(t) {
      var i = t.indexOf(".");
      if (i >= 0)
        t = t.slice(0, i);
      return !t || t === "start";
    });
  }
  function onFunction(id, name, listener) {
    var on0, on1, sit = start(name) ? init : set2;
    return function() {
      var schedule = sit(this, id), on = schedule.on;
      if (on !== on0)
        (on1 = (on0 = on).copy()).on(name, listener);
      schedule.on = on1;
    };
  }
  function on_default2(name, listener) {
    var id = this._id;
    return arguments.length < 2 ? get2(this.node(), id).on.on(name) : this.each(onFunction(id, name, listener));
  }

  // node_modules/d3-transition/src/transition/remove.js
  function removeFunction(id) {
    return function() {
      var parent = this.parentNode;
      for (var i in this.__transition)
        if (+i !== id)
          return;
      if (parent)
        parent.removeChild(this);
    };
  }
  function remove_default2() {
    return this.on("end.remove", removeFunction(this._id));
  }

  // node_modules/d3-transition/src/transition/select.js
  function select_default3(select) {
    var name = this._name, id = this._id;
    if (typeof select !== "function")
      select = selector_default(select);
    for (var groups2 = this._groups, m = groups2.length, subgroups = new Array(m), j = 0;j < m; ++j) {
      for (var group2 = groups2[j], n = group2.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0;i < n; ++i) {
        if ((node = group2[i]) && (subnode = select.call(node, node.__data__, i, group2))) {
          if ("__data__" in node)
            subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
          schedule_default(subgroup[i], name, id, i, subgroup, get2(node, id));
        }
      }
    }
    return new Transition(subgroups, this._parents, name, id);
  }

  // node_modules/d3-transition/src/transition/selectAll.js
  function selectAll_default2(select) {
    var name = this._name, id = this._id;
    if (typeof select !== "function")
      select = selectorAll_default(select);
    for (var groups2 = this._groups, m = groups2.length, subgroups = [], parents = [], j = 0;j < m; ++j) {
      for (var group2 = groups2[j], n = group2.length, node, i = 0;i < n; ++i) {
        if (node = group2[i]) {
          for (var children2 = select.call(node, node.__data__, i, group2), child, inherit = get2(node, id), k = 0, l = children2.length;k < l; ++k) {
            if (child = children2[k]) {
              schedule_default(child, name, id, k, children2, inherit);
            }
          }
          subgroups.push(children2);
          parents.push(node);
        }
      }
    }
    return new Transition(subgroups, parents, name, id);
  }

  // node_modules/d3-transition/src/transition/selection.js
  var Selection2 = selection_default.prototype.constructor;
  function selection_default2() {
    return new Selection2(this._groups, this._parents);
  }

  // node_modules/d3-transition/src/transition/style.js
  function styleNull(name, interpolate) {
    var string00, string10, interpolate0;
    return function() {
      var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate(string00 = string0, string10 = string1);
    };
  }
  function styleRemove2(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }
  function styleConstant2(name, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = styleValue(this, name);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function styleFunction2(name, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
      if (value1 == null)
        string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function styleMaybeRemove(id, name) {
    var on0, on1, listener0, key = "style." + name, event = "end." + key, remove2;
    return function() {
      var schedule = set2(this, id), on = schedule.on, listener = schedule.value[key] == null ? remove2 || (remove2 = styleRemove2(name)) : undefined;
      if (on !== on0 || listener0 !== listener)
        (on1 = (on0 = on).copy()).on(event, listener0 = listener);
      schedule.on = on1;
    };
  }
  function style_default2(name, value, priority) {
    var i = (name += "") === "transform" ? interpolateTransformCss : interpolate_default;
    return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove2(name)) : typeof value === "function" ? this.styleTween(name, styleFunction2(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant2(name, i, value), priority).on("end.style." + name, null);
  }

  // node_modules/d3-transition/src/transition/styleTween.js
  function styleInterpolate(name, i, priority) {
    return function(t) {
      this.style.setProperty(name, i.call(this, t), priority);
    };
  }
  function styleTween(name, value, priority) {
    var t, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0)
        t = (i0 = i) && styleInterpolate(name, i, priority);
      return t;
    }
    tween._value = value;
    return tween;
  }
  function styleTween_default(name, value, priority) {
    var key = "style." + (name += "");
    if (arguments.length < 2)
      return (key = this.tween(key)) && key._value;
    if (value == null)
      return this.tween(key, null);
    if (typeof value !== "function")
      throw new Error;
    return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
  }

  // node_modules/d3-transition/src/transition/text.js
  function textConstant2(value) {
    return function() {
      this.textContent = value;
    };
  }
  function textFunction2(value) {
    return function() {
      var value1 = value(this);
      this.textContent = value1 == null ? "" : value1;
    };
  }
  function text_default2(value) {
    return this.tween("text", typeof value === "function" ? textFunction2(tweenValue(this, "text", value)) : textConstant2(value == null ? "" : value + ""));
  }

  // node_modules/d3-transition/src/transition/textTween.js
  function textInterpolate(i) {
    return function(t) {
      this.textContent = i.call(this, t);
    };
  }
  function textTween(value) {
    var t02, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0)
        t02 = (i0 = i) && textInterpolate(i);
      return t02;
    }
    tween._value = value;
    return tween;
  }
  function textTween_default(value) {
    var key = "text";
    if (arguments.length < 1)
      return (key = this.tween(key)) && key._value;
    if (value == null)
      return this.tween(key, null);
    if (typeof value !== "function")
      throw new Error;
    return this.tween(key, textTween(value));
  }

  // node_modules/d3-transition/src/transition/transition.js
  function transition_default() {
    var name = this._name, id0 = this._id, id1 = newId();
    for (var groups2 = this._groups, m = groups2.length, j = 0;j < m; ++j) {
      for (var group2 = groups2[j], n = group2.length, node, i = 0;i < n; ++i) {
        if (node = group2[i]) {
          var inherit = get2(node, id0);
          schedule_default(node, name, id1, i, group2, {
            time: inherit.time + inherit.delay + inherit.duration,
            delay: 0,
            duration: inherit.duration,
            ease: inherit.ease
          });
        }
      }
    }
    return new Transition(groups2, this._parents, name, id1);
  }

  // node_modules/d3-transition/src/transition/end.js
  function end_default() {
    var on0, on1, that = this, id = that._id, size = that.size();
    return new Promise(function(resolve, reject) {
      var cancel = { value: reject }, end = { value: function() {
        if (--size === 0)
          resolve();
      } };
      that.each(function() {
        var schedule = set2(this, id), on = schedule.on;
        if (on !== on0) {
          on1 = (on0 = on).copy();
          on1._.cancel.push(cancel);
          on1._.interrupt.push(cancel);
          on1._.end.push(end);
        }
        schedule.on = on1;
      });
      if (size === 0)
        resolve();
    });
  }

  // node_modules/d3-transition/src/transition/index.js
  var id = 0;
  function Transition(groups2, parents, name, id2) {
    this._groups = groups2;
    this._parents = parents;
    this._name = name;
    this._id = id2;
  }
  function transition(name) {
    return selection_default().transition(name);
  }
  function newId() {
    return ++id;
  }
  var selection_prototype = selection_default.prototype;
  Transition.prototype = transition.prototype = {
    constructor: Transition,
    select: select_default3,
    selectAll: selectAll_default2,
    selectChild: selection_prototype.selectChild,
    selectChildren: selection_prototype.selectChildren,
    filter: filter_default2,
    merge: merge_default2,
    selection: selection_default2,
    transition: transition_default,
    call: selection_prototype.call,
    nodes: selection_prototype.nodes,
    node: selection_prototype.node,
    size: selection_prototype.size,
    empty: selection_prototype.empty,
    each: selection_prototype.each,
    on: on_default2,
    attr: attr_default2,
    attrTween: attrTween_default,
    style: style_default2,
    styleTween: styleTween_default,
    text: text_default2,
    textTween: textTween_default,
    remove: remove_default2,
    tween: tween_default,
    delay: delay_default,
    duration: duration_default,
    ease: ease_default,
    easeVarying: easeVarying_default,
    end: end_default,
    [Symbol.iterator]: selection_prototype[Symbol.iterator]
  };

  // node_modules/d3-ease/src/cubic.js
  function cubicInOut(t) {
    return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
  }
  // node_modules/d3-transition/src/selection/transition.js
  var defaultTiming = {
    time: null,
    delay: 0,
    duration: 250,
    ease: cubicInOut
  };
  function inherit(node, id2) {
    var timing;
    while (!(timing = node.__transition) || !(timing = timing[id2])) {
      if (!(node = node.parentNode)) {
        throw new Error(`transition ${id2} not found`);
      }
    }
    return timing;
  }
  function transition_default2(name) {
    var id2, timing;
    if (name instanceof Transition) {
      id2 = name._id, name = name._name;
    } else {
      id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
    }
    for (var groups2 = this._groups, m = groups2.length, j = 0;j < m; ++j) {
      for (var group2 = groups2[j], n = group2.length, node, i = 0;i < n; ++i) {
        if (node = group2[i]) {
          schedule_default(node, name, id2, i, group2, timing || inherit(node, id2));
        }
      }
    }
    return new Transition(groups2, this._parents, name, id2);
  }

  // node_modules/d3-transition/src/selection/index.js
  selection_default.prototype.interrupt = interrupt_default2;
  selection_default.prototype.transition = transition_default2;

  // node_modules/d3-brush/src/brush.js
  function number1(e) {
    return [+e[0], +e[1]];
  }
  function number22(e) {
    return [number1(e[0]), number1(e[1])];
  }
  var X = {
    name: "x",
    handles: ["w", "e"].map(type),
    input: function(x, e) {
      return x == null ? null : [[+x[0], e[0][1]], [+x[1], e[1][1]]];
    },
    output: function(xy) {
      return xy && [xy[0][0], xy[1][0]];
    }
  };
  var Y = {
    name: "y",
    handles: ["n", "s"].map(type),
    input: function(y, e) {
      return y == null ? null : [[e[0][0], +y[0]], [e[1][0], +y[1]]];
    },
    output: function(xy) {
      return xy && [xy[0][1], xy[1][1]];
    }
  };
  var XY = {
    name: "xy",
    handles: ["n", "w", "e", "s", "nw", "ne", "sw", "se"].map(type),
    input: function(xy) {
      return xy == null ? null : number22(xy);
    },
    output: function(xy) {
      return xy;
    }
  };
  function type(t) {
    return { type: t };
  }
  // node_modules/d3-path/src/path.js
  var pi = Math.PI;
  var tau = 2 * pi;
  var epsilon2 = 0.000001;
  var tauEpsilon = tau - epsilon2;
  function append(strings) {
    this._ += strings[0];
    for (let i = 1, n = strings.length;i < n; ++i) {
      this._ += arguments[i] + strings[i];
    }
  }
  function appendRound(digits) {
    let d = Math.floor(digits);
    if (!(d >= 0))
      throw new Error(`invalid digits: ${digits}`);
    if (d > 15)
      return append;
    const k = 10 ** d;
    return function(strings) {
      this._ += strings[0];
      for (let i = 1, n = strings.length;i < n; ++i) {
        this._ += Math.round(arguments[i] * k) / k + strings[i];
      }
    };
  }

  class Path {
    constructor(digits) {
      this._x0 = this._y0 = this._x1 = this._y1 = null;
      this._ = "";
      this._append = digits == null ? append : appendRound(digits);
    }
    moveTo(x, y) {
      this._append`M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}`;
    }
    closePath() {
      if (this._x1 !== null) {
        this._x1 = this._x0, this._y1 = this._y0;
        this._append`Z`;
      }
    }
    lineTo(x, y) {
      this._append`L${this._x1 = +x},${this._y1 = +y}`;
    }
    quadraticCurveTo(x1, y1, x, y) {
      this._append`Q${+x1},${+y1},${this._x1 = +x},${this._y1 = +y}`;
    }
    bezierCurveTo(x1, y1, x2, y2, x, y) {
      this._append`C${+x1},${+y1},${+x2},${+y2},${this._x1 = +x},${this._y1 = +y}`;
    }
    arcTo(x1, y1, x2, y2, r) {
      x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
      if (r < 0)
        throw new Error(`negative radius: ${r}`);
      let x0 = this._x1, y0 = this._y1, x21 = x2 - x1, y21 = y2 - y1, x01 = x0 - x1, y01 = y0 - y1, l01_2 = x01 * x01 + y01 * y01;
      if (this._x1 === null) {
        this._append`M${this._x1 = x1},${this._y1 = y1}`;
      } else if (!(l01_2 > epsilon2))
        ;
      else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon2) || !r) {
        this._append`L${this._x1 = x1},${this._y1 = y1}`;
      } else {
        let x20 = x2 - x0, y20 = y2 - y0, l21_2 = x21 * x21 + y21 * y21, l20_2 = x20 * x20 + y20 * y20, l21 = Math.sqrt(l21_2), l01 = Math.sqrt(l01_2), l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2), t01 = l / l01, t21 = l / l21;
        if (Math.abs(t01 - 1) > epsilon2) {
          this._append`L${x1 + t01 * x01},${y1 + t01 * y01}`;
        }
        this._append`A${r},${r},0,0,${+(y01 * x20 > x01 * y20)},${this._x1 = x1 + t21 * x21},${this._y1 = y1 + t21 * y21}`;
      }
    }
    arc(x, y, r, a0, a1, ccw) {
      x = +x, y = +y, r = +r, ccw = !!ccw;
      if (r < 0)
        throw new Error(`negative radius: ${r}`);
      let dx = r * Math.cos(a0), dy = r * Math.sin(a0), x0 = x + dx, y0 = y + dy, cw = 1 ^ ccw, da = ccw ? a0 - a1 : a1 - a0;
      if (this._x1 === null) {
        this._append`M${x0},${y0}`;
      } else if (Math.abs(this._x1 - x0) > epsilon2 || Math.abs(this._y1 - y0) > epsilon2) {
        this._append`L${x0},${y0}`;
      }
      if (!r)
        return;
      if (da < 0)
        da = da % tau + tau;
      if (da > tauEpsilon) {
        this._append`A${r},${r},0,1,${cw},${x - dx},${y - dy}A${r},${r},0,1,${cw},${this._x1 = x0},${this._y1 = y0}`;
      } else if (da > epsilon2) {
        this._append`A${r},${r},0,${+(da >= pi)},${cw},${this._x1 = x + r * Math.cos(a1)},${this._y1 = y + r * Math.sin(a1)}`;
      }
    }
    rect(x, y, w, h) {
      this._append`M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}h${w = +w}v${+h}h${-w}Z`;
    }
    toString() {
      return this._;
    }
  }
  function path() {
    return new Path;
  }
  path.prototype = Path.prototype;
  // node_modules/d3-format/src/formatDecimal.js
  function formatDecimal_default(x) {
    return Math.abs(x = Math.round(x)) >= 1000000000000000000000 ? x.toLocaleString("en").replace(/,/g, "") : x.toString(10);
  }
  function formatDecimalParts(x, p) {
    if (!isFinite(x) || x === 0)
      return null;
    var i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e"), coefficient = x.slice(0, i);
    return [
      coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
      +x.slice(i + 1)
    ];
  }

  // node_modules/d3-format/src/exponent.js
  function exponent_default(x) {
    return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
  }

  // node_modules/d3-format/src/formatGroup.js
  function formatGroup_default(grouping, thousands) {
    return function(value, width) {
      var i = value.length, t = [], j = 0, g = grouping[0], length = 0;
      while (i > 0 && g > 0) {
        if (length + g + 1 > width)
          g = Math.max(1, width - length);
        t.push(value.substring(i -= g, i + g));
        if ((length += g + 1) > width)
          break;
        g = grouping[j = (j + 1) % grouping.length];
      }
      return t.reverse().join(thousands);
    };
  }

  // node_modules/d3-format/src/formatNumerals.js
  function formatNumerals_default(numerals) {
    return function(value) {
      return value.replace(/[0-9]/g, function(i) {
        return numerals[+i];
      });
    };
  }

  // node_modules/d3-format/src/formatSpecifier.js
  var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
  function formatSpecifier(specifier) {
    if (!(match = re.exec(specifier)))
      throw new Error("invalid format: " + specifier);
    var match;
    return new FormatSpecifier({
      fill: match[1],
      align: match[2],
      sign: match[3],
      symbol: match[4],
      zero: match[5],
      width: match[6],
      comma: match[7],
      precision: match[8] && match[8].slice(1),
      trim: match[9],
      type: match[10]
    });
  }
  formatSpecifier.prototype = FormatSpecifier.prototype;
  function FormatSpecifier(specifier) {
    this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
    this.align = specifier.align === undefined ? ">" : specifier.align + "";
    this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
    this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
    this.zero = !!specifier.zero;
    this.width = specifier.width === undefined ? undefined : +specifier.width;
    this.comma = !!specifier.comma;
    this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
    this.trim = !!specifier.trim;
    this.type = specifier.type === undefined ? "" : specifier.type + "";
  }
  FormatSpecifier.prototype.toString = function() {
    return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === undefined ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
  };

  // node_modules/d3-format/src/formatTrim.js
  function formatTrim_default(s) {
    out:
      for (var n = s.length, i = 1, i0 = -1, i1;i < n; ++i) {
        switch (s[i]) {
          case ".":
            i0 = i1 = i;
            break;
          case "0":
            if (i0 === 0)
              i0 = i;
            i1 = i;
            break;
          default:
            if (!+s[i])
              break out;
            if (i0 > 0)
              i0 = 0;
            break;
        }
      }
    return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
  }

  // node_modules/d3-format/src/formatPrefixAuto.js
  var prefixExponent;
  function formatPrefixAuto_default(x, p) {
    var d = formatDecimalParts(x, p);
    if (!d)
      return prefixExponent = undefined, x.toPrecision(p);
    var coefficient = d[0], exponent = d[1], i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1, n = coefficient.length;
    return i === n ? coefficient : i > n ? coefficient + new Array(i - n + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0];
  }

  // node_modules/d3-format/src/formatRounded.js
  function formatRounded_default(x, p) {
    var d = formatDecimalParts(x, p);
    if (!d)
      return x + "";
    var coefficient = d[0], exponent = d[1];
    return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1) : coefficient + new Array(exponent - coefficient.length + 2).join("0");
  }

  // node_modules/d3-format/src/formatTypes.js
  var formatTypes_default = {
    "%": (x, p) => (x * 100).toFixed(p),
    b: (x) => Math.round(x).toString(2),
    c: (x) => x + "",
    d: formatDecimal_default,
    e: (x, p) => x.toExponential(p),
    f: (x, p) => x.toFixed(p),
    g: (x, p) => x.toPrecision(p),
    o: (x) => Math.round(x).toString(8),
    p: (x, p) => formatRounded_default(x * 100, p),
    r: formatRounded_default,
    s: formatPrefixAuto_default,
    X: (x) => Math.round(x).toString(16).toUpperCase(),
    x: (x) => Math.round(x).toString(16)
  };

  // node_modules/d3-format/src/identity.js
  function identity_default2(x) {
    return x;
  }

  // node_modules/d3-format/src/locale.js
  var map = Array.prototype.map;
  var prefixes = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
  function locale_default(locale) {
    var group2 = locale.grouping === undefined || locale.thousands === undefined ? identity_default2 : formatGroup_default(map.call(locale.grouping, Number), locale.thousands + ""), currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "", currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "", decimal = locale.decimal === undefined ? "." : locale.decimal + "", numerals = locale.numerals === undefined ? identity_default2 : formatNumerals_default(map.call(locale.numerals, String)), percent = locale.percent === undefined ? "%" : locale.percent + "", minus = locale.minus === undefined ? "−" : locale.minus + "", nan = locale.nan === undefined ? "NaN" : locale.nan + "";
    function newFormat(specifier, options) {
      specifier = formatSpecifier(specifier);
      var { fill, align, sign, symbol, zero: zero3, width, comma, precision, trim, type: type2 } = specifier;
      if (type2 === "n")
        comma = true, type2 = "g";
      else if (!formatTypes_default[type2])
        precision === undefined && (precision = 12), trim = true, type2 = "g";
      if (zero3 || fill === "0" && align === "=")
        zero3 = true, fill = "0", align = "=";
      var prefix = (options && options.prefix !== undefined ? options.prefix : "") + (symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type2) ? "0" + type2.toLowerCase() : ""), suffix = (symbol === "$" ? currencySuffix : /[%p]/.test(type2) ? percent : "") + (options && options.suffix !== undefined ? options.suffix : "");
      var formatType = formatTypes_default[type2], maybeSuffix = /[defgprs%]/.test(type2);
      precision = precision === undefined ? 6 : /[gprs]/.test(type2) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
      function format(value) {
        var valuePrefix = prefix, valueSuffix = suffix, i, n, c;
        if (type2 === "c") {
          valueSuffix = formatType(value) + valueSuffix;
          value = "";
        } else {
          value = +value;
          var valueNegative = value < 0 || 1 / value < 0;
          value = isNaN(value) ? nan : formatType(Math.abs(value), precision);
          if (trim)
            value = formatTrim_default(value);
          if (valueNegative && +value === 0 && sign !== "+")
            valueNegative = false;
          valuePrefix = (valueNegative ? sign === "(" ? sign : minus : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
          valueSuffix = (type2 === "s" && !isNaN(value) && prefixExponent !== undefined ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");
          if (maybeSuffix) {
            i = -1, n = value.length;
            while (++i < n) {
              if (c = value.charCodeAt(i), 48 > c || c > 57) {
                valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                value = value.slice(0, i);
                break;
              }
            }
          }
        }
        if (comma && !zero3)
          value = group2(value, Infinity);
        var length = valuePrefix.length + value.length + valueSuffix.length, padding = length < width ? new Array(width - length + 1).join(fill) : "";
        if (comma && zero3)
          value = group2(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";
        switch (align) {
          case "<":
            value = valuePrefix + value + valueSuffix + padding;
            break;
          case "=":
            value = valuePrefix + padding + value + valueSuffix;
            break;
          case "^":
            value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
            break;
          default:
            value = padding + valuePrefix + value + valueSuffix;
            break;
        }
        return numerals(value);
      }
      format.toString = function() {
        return specifier + "";
      };
      return format;
    }
    function formatPrefix(specifier, value) {
      var e = Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3, k = Math.pow(10, -e), f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier), { suffix: prefixes[8 + e / 3] });
      return function(value2) {
        return f(k * value2);
      };
    }
    return {
      format: newFormat,
      formatPrefix
    };
  }

  // node_modules/d3-format/src/defaultLocale.js
  var locale;
  var format;
  var formatPrefix;
  defaultLocale({
    thousands: ",",
    grouping: [3],
    currency: ["$", ""]
  });
  function defaultLocale(definition) {
    locale = locale_default(definition);
    format = locale.format;
    formatPrefix = locale.formatPrefix;
    return locale;
  }
  // node_modules/d3-format/src/precisionFixed.js
  function precisionFixed_default(step) {
    return Math.max(0, -exponent_default(Math.abs(step)));
  }
  // node_modules/d3-format/src/precisionPrefix.js
  function precisionPrefix_default(step, value) {
    return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3 - exponent_default(Math.abs(step)));
  }
  // node_modules/d3-format/src/precisionRound.js
  function precisionRound_default(step, max2) {
    step = Math.abs(step), max2 = Math.abs(max2) - step;
    return Math.max(0, exponent_default(max2) - exponent_default(step)) + 1;
  }
  // node_modules/d3-polygon/src/cross.js
  function cross_default(a, b, c) {
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  }

  // node_modules/d3-polygon/src/hull.js
  function lexicographicOrder(a, b) {
    return a[0] - b[0] || a[1] - b[1];
  }
  function computeUpperHullIndexes(points) {
    const n = points.length, indexes2 = [0, 1];
    let size = 2, i;
    for (i = 2;i < n; ++i) {
      while (size > 1 && cross_default(points[indexes2[size - 2]], points[indexes2[size - 1]], points[i]) <= 0)
        --size;
      indexes2[size++] = i;
    }
    return indexes2.slice(0, size);
  }
  function hull_default(points) {
    if ((n = points.length) < 3)
      return null;
    var i, n, sortedPoints = new Array(n), flippedPoints = new Array(n);
    for (i = 0;i < n; ++i)
      sortedPoints[i] = [+points[i][0], +points[i][1], i];
    sortedPoints.sort(lexicographicOrder);
    for (i = 0;i < n; ++i)
      flippedPoints[i] = [sortedPoints[i][0], -sortedPoints[i][1]];
    var upperIndexes = computeUpperHullIndexes(sortedPoints), lowerIndexes = computeUpperHullIndexes(flippedPoints);
    var skipLeft = lowerIndexes[0] === upperIndexes[0], skipRight = lowerIndexes[lowerIndexes.length - 1] === upperIndexes[upperIndexes.length - 1], hull = [];
    for (i = upperIndexes.length - 1;i >= 0; --i)
      hull.push(points[sortedPoints[upperIndexes[i]][2]]);
    for (i = +skipLeft;i < lowerIndexes.length - skipRight; ++i)
      hull.push(points[sortedPoints[lowerIndexes[i]][2]]);
    return hull;
  }
  // node_modules/d3-scale/src/init.js
  function initRange(domain, range2) {
    switch (arguments.length) {
      case 0:
        break;
      case 1:
        this.range(domain);
        break;
      default:
        this.range(range2).domain(domain);
        break;
    }
    return this;
  }
  function initInterpolator(domain, interpolator) {
    switch (arguments.length) {
      case 0:
        break;
      case 1: {
        if (typeof domain === "function")
          this.interpolator(domain);
        else
          this.range(domain);
        break;
      }
      default: {
        this.domain(domain);
        if (typeof interpolator === "function")
          this.interpolator(interpolator);
        else
          this.range(interpolator);
        break;
      }
    }
    return this;
  }

  // node_modules/d3-scale/src/ordinal.js
  var implicit = Symbol("implicit");
  function ordinal() {
    var index2 = new InternMap, domain = [], range2 = [], unknown = implicit;
    function scale(d) {
      let i = index2.get(d);
      if (i === undefined) {
        if (unknown !== implicit)
          return unknown;
        index2.set(d, i = domain.push(d) - 1);
      }
      return range2[i % range2.length];
    }
    scale.domain = function(_) {
      if (!arguments.length)
        return domain.slice();
      domain = [], index2 = new InternMap;
      for (const value of _) {
        if (index2.has(value))
          continue;
        index2.set(value, domain.push(value) - 1);
      }
      return scale;
    };
    scale.range = function(_) {
      return arguments.length ? (range2 = Array.from(_), scale) : range2.slice();
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    scale.copy = function() {
      return ordinal(domain, range2).unknown(unknown);
    };
    initRange.apply(scale, arguments);
    return scale;
  }

  // node_modules/d3-scale/src/constant.js
  function constants(x) {
    return function() {
      return x;
    };
  }

  // node_modules/d3-scale/src/number.js
  function number3(x) {
    return +x;
  }

  // node_modules/d3-scale/src/continuous.js
  var unit = [0, 1];
  function identity3(x) {
    return x;
  }
  function normalize(a, b) {
    return (b -= a = +a) ? function(x) {
      return (x - a) / b;
    } : constants(isNaN(b) ? NaN : 0.5);
  }
  function clamper(a, b) {
    var t;
    if (a > b)
      t = a, a = b, b = t;
    return function(x) {
      return Math.max(a, Math.min(b, x));
    };
  }
  function bimap(domain, range2, interpolate) {
    var d0 = domain[0], d1 = domain[1], r0 = range2[0], r1 = range2[1];
    if (d1 < d0)
      d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
    else
      d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
    return function(x) {
      return r0(d0(x));
    };
  }
  function polymap(domain, range2, interpolate) {
    var j = Math.min(domain.length, range2.length) - 1, d = new Array(j), r = new Array(j), i = -1;
    if (domain[j] < domain[0]) {
      domain = domain.slice().reverse();
      range2 = range2.slice().reverse();
    }
    while (++i < j) {
      d[i] = normalize(domain[i], domain[i + 1]);
      r[i] = interpolate(range2[i], range2[i + 1]);
    }
    return function(x) {
      var i2 = bisect_default(domain, x, 1, j) - 1;
      return r[i2](d[i2](x));
    };
  }
  function copy(source, target) {
    return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
  }
  function transformer() {
    var domain = unit, range2 = unit, interpolate = value_default, transform, untransform, unknown, clamp = identity3, piecewise, output, input;
    function rescale() {
      var n = Math.min(domain.length, range2.length);
      if (clamp !== identity3)
        clamp = clamper(domain[0], domain[n - 1]);
      piecewise = n > 2 ? polymap : bimap;
      output = input = null;
      return scale;
    }
    function scale(x) {
      return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range2, interpolate)))(transform(clamp(x)));
    }
    scale.invert = function(y) {
      return clamp(untransform((input || (input = piecewise(range2, domain.map(transform), number_default)))(y)));
    };
    scale.domain = function(_) {
      return arguments.length ? (domain = Array.from(_, number3), rescale()) : domain.slice();
    };
    scale.range = function(_) {
      return arguments.length ? (range2 = Array.from(_), rescale()) : range2.slice();
    };
    scale.rangeRound = function(_) {
      return range2 = Array.from(_), interpolate = round_default, rescale();
    };
    scale.clamp = function(_) {
      return arguments.length ? (clamp = _ ? true : identity3, rescale()) : clamp !== identity3;
    };
    scale.interpolate = function(_) {
      return arguments.length ? (interpolate = _, rescale()) : interpolate;
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    return function(t, u) {
      transform = t, untransform = u;
      return rescale();
    };
  }
  function continuous() {
    return transformer()(identity3, identity3);
  }

  // node_modules/d3-scale/src/tickFormat.js
  function tickFormat(start2, stop, count, specifier) {
    var step = tickStep(start2, stop, count), precision;
    specifier = formatSpecifier(specifier == null ? ",f" : specifier);
    switch (specifier.type) {
      case "s": {
        var value = Math.max(Math.abs(start2), Math.abs(stop));
        if (specifier.precision == null && !isNaN(precision = precisionPrefix_default(step, value)))
          specifier.precision = precision;
        return formatPrefix(specifier, value);
      }
      case "":
      case "e":
      case "g":
      case "p":
      case "r": {
        if (specifier.precision == null && !isNaN(precision = precisionRound_default(step, Math.max(Math.abs(start2), Math.abs(stop)))))
          specifier.precision = precision - (specifier.type === "e");
        break;
      }
      case "f":
      case "%": {
        if (specifier.precision == null && !isNaN(precision = precisionFixed_default(step)))
          specifier.precision = precision - (specifier.type === "%") * 2;
        break;
      }
    }
    return format(specifier);
  }

  // node_modules/d3-scale/src/linear.js
  function linearish(scale) {
    var domain = scale.domain;
    scale.ticks = function(count) {
      var d = domain();
      return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };
    scale.tickFormat = function(count, specifier) {
      var d = domain();
      return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
    };
    scale.nice = function(count) {
      if (count == null)
        count = 10;
      var d = domain();
      var i0 = 0;
      var i1 = d.length - 1;
      var start2 = d[i0];
      var stop = d[i1];
      var prestep;
      var step;
      var maxIter = 10;
      if (stop < start2) {
        step = start2, start2 = stop, stop = step;
        step = i0, i0 = i1, i1 = step;
      }
      while (maxIter-- > 0) {
        step = tickIncrement(start2, stop, count);
        if (step === prestep) {
          d[i0] = start2;
          d[i1] = stop;
          return domain(d);
        } else if (step > 0) {
          start2 = Math.floor(start2 / step) * step;
          stop = Math.ceil(stop / step) * step;
        } else if (step < 0) {
          start2 = Math.ceil(start2 * step) / step;
          stop = Math.floor(stop * step) / step;
        } else {
          break;
        }
        prestep = step;
      }
      return scale;
    };
    return scale;
  }
  function linear2() {
    var scale = continuous();
    scale.copy = function() {
      return copy(scale, linear2());
    };
    initRange.apply(scale, arguments);
    return linearish(scale);
  }
  // node_modules/d3-scale/src/nice.js
  function nice(domain, interval2) {
    domain = domain.slice();
    var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], t;
    if (x1 < x0) {
      t = i0, i0 = i1, i1 = t;
      t = x0, x0 = x1, x1 = t;
    }
    domain[i0] = interval2.floor(x0);
    domain[i1] = interval2.ceil(x1);
    return domain;
  }

  // node_modules/d3-scale/src/log.js
  function transformLog(x) {
    return Math.log(x);
  }
  function transformExp(x) {
    return Math.exp(x);
  }
  function transformLogn(x) {
    return -Math.log(-x);
  }
  function transformExpn(x) {
    return -Math.exp(-x);
  }
  function pow10(x) {
    return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
  }
  function powp(base) {
    return base === 10 ? pow10 : base === Math.E ? Math.exp : (x) => Math.pow(base, x);
  }
  function logp(base) {
    return base === Math.E ? Math.log : base === 10 && Math.log10 || base === 2 && Math.log2 || (base = Math.log(base), (x) => Math.log(x) / base);
  }
  function reflect(f) {
    return (x, k) => -f(-x, k);
  }
  function loggish(transform) {
    const scale = transform(transformLog, transformExp);
    const domain = scale.domain;
    let base = 10;
    let logs;
    let pows;
    function rescale() {
      logs = logp(base), pows = powp(base);
      if (domain()[0] < 0) {
        logs = reflect(logs), pows = reflect(pows);
        transform(transformLogn, transformExpn);
      } else {
        transform(transformLog, transformExp);
      }
      return scale;
    }
    scale.base = function(_) {
      return arguments.length ? (base = +_, rescale()) : base;
    };
    scale.domain = function(_) {
      return arguments.length ? (domain(_), rescale()) : domain();
    };
    scale.ticks = (count) => {
      const d = domain();
      let u = d[0];
      let v = d[d.length - 1];
      const r = v < u;
      if (r)
        [u, v] = [v, u];
      let i = logs(u);
      let j = logs(v);
      let k;
      let t;
      const n = count == null ? 10 : +count;
      let z = [];
      if (!(base % 1) && j - i < n) {
        i = Math.floor(i), j = Math.ceil(j);
        if (u > 0)
          for (;i <= j; ++i) {
            for (k = 1;k < base; ++k) {
              t = i < 0 ? k / pows(-i) : k * pows(i);
              if (t < u)
                continue;
              if (t > v)
                break;
              z.push(t);
            }
          }
        else
          for (;i <= j; ++i) {
            for (k = base - 1;k >= 1; --k) {
              t = i > 0 ? k / pows(-i) : k * pows(i);
              if (t < u)
                continue;
              if (t > v)
                break;
              z.push(t);
            }
          }
        if (z.length * 2 < n)
          z = ticks(u, v, n);
      } else {
        z = ticks(i, j, Math.min(j - i, n)).map(pows);
      }
      return r ? z.reverse() : z;
    };
    scale.tickFormat = (count, specifier) => {
      if (count == null)
        count = 10;
      if (specifier == null)
        specifier = base === 10 ? "s" : ",";
      if (typeof specifier !== "function") {
        if (!(base % 1) && (specifier = formatSpecifier(specifier)).precision == null)
          specifier.trim = true;
        specifier = format(specifier);
      }
      if (count === Infinity)
        return specifier;
      const k = Math.max(1, base * count / scale.ticks().length);
      return (d) => {
        let i = d / pows(Math.round(logs(d)));
        if (i * base < base - 0.5)
          i *= base;
        return i <= k ? specifier(d) : "";
      };
    };
    scale.nice = () => {
      return domain(nice(domain(), {
        floor: (x) => pows(Math.floor(logs(x))),
        ceil: (x) => pows(Math.ceil(logs(x)))
      }));
    };
    return scale;
  }
  function log() {
    const scale = loggish(transformer()).domain([1, 10]);
    scale.copy = () => copy(scale, log()).base(scale.base());
    initRange.apply(scale, arguments);
    return scale;
  }
  // node_modules/d3-scale/src/sequential.js
  function transformer2() {
    var x0 = 0, x1 = 1, t02, t12, k10, transform, interpolator = identity3, clamp = false, unknown;
    function scale(x) {
      return x == null || isNaN(x = +x) ? unknown : interpolator(k10 === 0 ? 0.5 : (x = (transform(x) - t02) * k10, clamp ? Math.max(0, Math.min(1, x)) : x));
    }
    scale.domain = function(_) {
      return arguments.length ? ([x0, x1] = _, t02 = transform(x0 = +x0), t12 = transform(x1 = +x1), k10 = t02 === t12 ? 0 : 1 / (t12 - t02), scale) : [x0, x1];
    };
    scale.clamp = function(_) {
      return arguments.length ? (clamp = !!_, scale) : clamp;
    };
    scale.interpolator = function(_) {
      return arguments.length ? (interpolator = _, scale) : interpolator;
    };
    function range2(interpolate) {
      return function(_) {
        var r0, r1;
        return arguments.length ? ([r0, r1] = _, interpolator = interpolate(r0, r1), scale) : [interpolator(0), interpolator(1)];
      };
    }
    scale.range = range2(value_default);
    scale.rangeRound = range2(round_default);
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    return function(t) {
      transform = t, t02 = t(x0), t12 = t(x1), k10 = t02 === t12 ? 0 : 1 / (t12 - t02);
      return scale;
    };
  }
  function copy2(source, target) {
    return target.domain(source.domain()).interpolator(source.interpolator()).clamp(source.clamp()).unknown(source.unknown());
  }
  function sequential() {
    var scale = linearish(transformer2()(identity3));
    scale.copy = function() {
      return copy2(scale, sequential());
    };
    return initInterpolator.apply(scale, arguments);
  }
  // node_modules/d3-scale-chromatic/src/colors.js
  function colors_default(specifier) {
    var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
    while (i < n)
      colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
    return colors;
  }

  // node_modules/d3-scale-chromatic/src/ramp.js
  var ramp_default = (scheme) => rgbBasis(scheme[scheme.length - 1]);

  // node_modules/d3-scale-chromatic/src/diverging/RdBu.js
  var scheme = new Array(3).concat("ef8a62f7f7f767a9cf", "ca0020f4a58292c5de0571b0", "ca0020f4a582f7f7f792c5de0571b0", "b2182bef8a62fddbc7d1e5f067a9cf2166ac", "b2182bef8a62fddbc7f7f7f7d1e5f067a9cf2166ac", "b2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac", "b2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac", "67001fb2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac053061", "67001fb2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac053061").map(colors_default);
  var RdBu_default = ramp_default(scheme);
  // node_modules/d3-shape/src/constant.js
  function constant_default5(x) {
    return function constant() {
      return x;
    };
  }

  // node_modules/d3-shape/src/path.js
  function withPath(shape) {
    let digits = 3;
    shape.digits = function(_) {
      if (!arguments.length)
        return digits;
      if (_ == null) {
        digits = null;
      } else {
        const d = Math.floor(_);
        if (!(d >= 0))
          throw new RangeError(`invalid digits: ${_}`);
        digits = d;
      }
      return shape;
    };
    return () => new Path(digits);
  }

  // node_modules/d3-shape/src/array.js
  var slice = Array.prototype.slice;
  function array_default(x) {
    return typeof x === "object" && "length" in x ? x : Array.from(x);
  }

  // node_modules/d3-shape/src/curve/linear.js
  function Linear(context) {
    this._context = context;
  }
  Linear.prototype = {
    areaStart: function() {
      this._line = 0;
    },
    areaEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._point = 0;
    },
    lineEnd: function() {
      if (this._line || this._line !== 0 && this._point === 1)
        this._context.closePath();
      this._line = 1 - this._line;
    },
    point: function(x, y) {
      x = +x, y = +y;
      switch (this._point) {
        case 0:
          this._point = 1;
          this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);
          break;
        case 1:
          this._point = 2;
        default:
          this._context.lineTo(x, y);
          break;
      }
    }
  };
  function linear_default(context) {
    return new Linear(context);
  }

  // node_modules/d3-shape/src/point.js
  function x(p) {
    return p[0];
  }
  function y(p) {
    return p[1];
  }

  // node_modules/d3-shape/src/line.js
  function line_default(x2, y2) {
    var defined = constant_default5(true), context = null, curve = linear_default, output = null, path2 = withPath(line);
    x2 = typeof x2 === "function" ? x2 : x2 === undefined ? x : constant_default5(x2);
    y2 = typeof y2 === "function" ? y2 : y2 === undefined ? y : constant_default5(y2);
    function line(data) {
      var i, n = (data = array_default(data)).length, d, defined0 = false, buffer;
      if (context == null)
        output = curve(buffer = path2());
      for (i = 0;i <= n; ++i) {
        if (!(i < n && defined(d = data[i], i, data)) === defined0) {
          if (defined0 = !defined0)
            output.lineStart();
          else
            output.lineEnd();
        }
        if (defined0)
          output.point(+x2(d, i, data), +y2(d, i, data));
      }
      if (buffer)
        return output = null, buffer + "" || null;
    }
    line.x = function(_) {
      return arguments.length ? (x2 = typeof _ === "function" ? _ : constant_default5(+_), line) : x2;
    };
    line.y = function(_) {
      return arguments.length ? (y2 = typeof _ === "function" ? _ : constant_default5(+_), line) : y2;
    };
    line.defined = function(_) {
      return arguments.length ? (defined = typeof _ === "function" ? _ : constant_default5(!!_), line) : defined;
    };
    line.curve = function(_) {
      return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
    };
    line.context = function(_) {
      return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
    };
    return line;
  }
  // node_modules/d3-zoom/src/transform.js
  function Transform(k, x2, y2) {
    this.k = k;
    this.x = x2;
    this.y = y2;
  }
  Transform.prototype = {
    constructor: Transform,
    scale: function(k) {
      return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
    },
    translate: function(x2, y2) {
      return x2 === 0 & y2 === 0 ? this : new Transform(this.k, this.x + this.k * x2, this.y + this.k * y2);
    },
    apply: function(point) {
      return [point[0] * this.k + this.x, point[1] * this.k + this.y];
    },
    applyX: function(x2) {
      return x2 * this.k + this.x;
    },
    applyY: function(y2) {
      return y2 * this.k + this.y;
    },
    invert: function(location) {
      return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
    },
    invertX: function(x2) {
      return (x2 - this.x) / this.k;
    },
    invertY: function(y2) {
      return (y2 - this.y) / this.k;
    },
    rescaleX: function(x2) {
      return x2.copy().domain(x2.range().map(this.invertX, this).map(x2.invert, x2));
    },
    rescaleY: function(y2) {
      return y2.copy().domain(y2.range().map(this.invertY, this).map(y2.invert, y2));
    },
    toString: function() {
      return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
    }
  };
  var identity4 = new Transform(1, 0, 0);
  transform.prototype = Transform.prototype;
  function transform(node) {
    while (!node.__zoom)
      if (!(node = node.parentNode))
        return identity4;
    return node.__zoom;
  }
  // src/model/network.js
  function normalizeBoolean(value, fallback = true) {
    if (typeof value === "boolean")
      return value;
    const key = String(value ?? "").trim().toLowerCase();
    if (!key)
      return fallback;
    return !["false", "0", "no", "off"].includes(key);
  }
  function resolveNodeIdByZone(nodes, zoneId) {
    const match = nodes.find((node) => String(node.zoneId ?? node.id) === String(zoneId));
    return match?.id ?? null;
  }
  function listDemandPairs(networkData) {
    return networkData.demandRows.map((row) => ({
      ...row,
      label: `${row.originZoneId} -> ${row.destinationZoneId} (${row.demand})`
    }));
  }
  function listCandidateLinks(networkData) {
    return networkData.links.filter((link) => link.candidateFlag);
  }
  function cloneNetworkData(networkData) {
    return {
      ...networkData,
      nodes: networkData.nodes.map((node) => ({ ...node })),
      links: networkData.links.map((link) => ({ ...link })),
      demandRows: networkData.demandRows.map((row) => ({ ...row }))
    };
  }
  function computeLinkGeometryLength(link, nodeById) {
    const from = nodeById.get(String(link.fromNodeId));
    const to = nodeById.get(String(link.toNodeId));
    if (!from || !to)
      return safeNumber(link.length, 0);
    const dx = safeNumber(to.x, 0) - safeNumber(from.x, 0);
    const dy = safeNumber(to.y, 0) - safeNumber(from.y, 0);
    const currentDistance = Math.hypot(dx, dy);
    const baseDistance = safeNumber(link.geometryBaseDistance, currentDistance);
    const baseLength = safeNumber(link.geometryBaseLength, link.length);
    if (baseDistance <= 0.000000001)
      return baseLength;
    return baseLength * (currentDistance / baseDistance);
  }
  function buildScenarioNetwork(networkData, options = {}) {
    const demandRow = networkData.demandRows.find((row) => row.key === options.selectedDemandKey) ?? networkData.demandRows[0];
    const candidateLinkId = Number(options.selectedCandidateLinkId) || null;
    const scenarioMode = options.scenarioMode === "on" ? "on" : "off";
    const capacityScale = Math.max(Number(options.capacityScale ?? 1), 0.000000001);
    const nodes = networkData.nodes.map((node) => ({ ...node }));
    const links = networkData.links.map((baseLink) => {
      const link = { ...baseLink };
      const isCandidate = candidateLinkId ? link.id === candidateLinkId : Boolean(link.candidateFlag);
      const structuralActive = Math.max(0, Number(link.lanes) || 0) > 0 && Math.max(0, Number(link.capacity) || 0) > 0;
      link.enabled = isCandidate ? scenarioMode === "on" && structuralActive : normalizeBoolean(link.enabled, true) && structuralActive;
      link.capacity = Math.max(safeNumber(link.capacity, 1) * capacityScale, 0.000000001);
      return link;
    });
    const originId = resolveNodeIdByZone(nodes, demandRow.originZoneId);
    const destinationId = resolveNodeIdByZone(nodes, demandRow.destinationZoneId);
    if (!originId || !destinationId) {
      throw new Error("Could not map the selected demand row onto node zone_ids or node_ids.");
    }
    return {
      name: networkData.name,
      nodes,
      links,
      originId,
      destinationId,
      demandRow,
      scenarioMode,
      candidateLinkId
    };
  }
  function adjacencyFromLinks(links) {
    const adjacency = new Map;
    for (const link of links) {
      if (!link.enabled)
        continue;
      if (!adjacency.has(link.fromNodeId))
        adjacency.set(link.fromNodeId, []);
      adjacency.get(link.fromNodeId).push(link);
    }
    return adjacency;
  }

  // src/ui/networkView.js
  function flowForLink(result, linkId) {
    return result?.linkFlows?.get(linkId) ?? 0;
  }
  function costForLink(result, linkId) {
    return result?.linkCosts?.get(linkId) ?? 0;
  }
  function paddedExtent(values) {
    const [min2, max2] = extent(values);
    if (!Number.isFinite(min2) || !Number.isFinite(max2))
      return [0, 1];
    if (min2 === max2)
      return [min2 - 1, max2 + 1];
    const padding = (max2 - min2) * 0.12;
    return [min2 - padding, max2 + padding];
  }
  function scaleBarUnits(span) {
    const target = Math.max(span / 4, 1);
    const exponent = 10 ** Math.floor(Math.log10(target));
    const fraction = target / exponent;
    const niceFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
    return niceFraction * exponent;
  }
  function equalAspectScales(nodes, width, height, margin) {
    const xExtent = paddedExtent(nodes.flatMap((node) => [node.x, node.geometryBaseX ?? node.x]));
    const yExtent = paddedExtent(nodes.flatMap((node) => [node.y, node.geometryBaseY ?? node.y]));
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const xSpan = Math.max(xExtent[1] - xExtent[0], 0.000000001);
    const ySpan = Math.max(yExtent[1] - yExtent[0], 0.000000001);
    const unitsPerPixel = Math.max(xSpan / plotWidth, ySpan / plotHeight);
    const xCenter = (xExtent[0] + xExtent[1]) / 2;
    const yCenter = (yExtent[0] + yExtent[1]) / 2;
    const xHalfSpan = plotWidth * unitsPerPixel / 2;
    const yHalfSpan = plotHeight * unitsPerPixel / 2;
    return {
      xScale: linear2().domain([xCenter - xHalfSpan, xCenter + xHalfSpan]).range([margin.left, width - margin.right]),
      yScale: linear2().domain([yCenter - yHalfSpan, yCenter + yHalfSpan]).range([height - margin.bottom, margin.top])
    };
  }
  function linkPath(link, nodeById, xScale, yScale) {
    const from = nodeById.get(String(link.fromNodeId));
    const to = nodeById.get(String(link.toNodeId));
    if (!from || !to)
      return "";
    const x1 = xScale(from.x);
    const y1 = yScale(from.y);
    const x2 = xScale(to.x);
    const y2 = yScale(to.y);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const curve = link.candidateFlag ? 0.02 : 0.1;
    const mx = x1 + dx * 0.5 - dy * curve;
    const my = y1 + dy * 0.5 + dx * curve;
    return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  }
  function linkTooltipLines(link, scenarioResult) {
    const flow = flowForLink(scenarioResult, link.id);
    const cost = costForLink(scenarioResult, link.id);
    return [
      link.label,
      `${link.fromNodeId} -> ${link.toNodeId}`,
      `lanes ${Number(link.lanes) || 0}, capacity ${Number(link.capacity) || 0}`,
      `length ${Number(link.length) || 0}, free speed ${Number(link.freeSpeed) || 0}`,
      `flow ${format(".2f")(flow)}, cost ${format(".2f")(cost)}`,
      describeCostFunction(link)
    ];
  }
  function nodeTooltipLines(node) {
    return [
      node.label,
      `node_id ${node.id}, zone_id ${node.zoneId ?? "—"}`,
      `x ${format(".2f")(node.x)}, y ${format(".2f")(node.y)}`
    ];
  }
  function tooltipSize(lines) {
    const maxChars = lines.reduce((max2, line) => Math.max(max2, String(line).length), 0);
    return {
      width: Math.max(150, Math.min(280, maxChars * 6.5 + 22)),
      height: lines.length * 16 + 18
    };
  }
  function clampTooltipPosition(x2, y2, width, height, bounds) {
    return {
      x: Math.max(bounds.left, Math.min(bounds.right - width, x2)),
      y: Math.max(bounds.top, Math.min(bounds.bottom - height, y2))
    };
  }
  function renderNetworkView(container, networkData, scenarioResult, {
    scenarioMode = "off",
    selectedCandidateLinkId,
    selectedLinkId,
    selectedNodeId,
    onNodePositionChange,
    onNodeGeometryPreview,
    onLinkSelect,
    onNodeSelect
  } = {}) {
    container.innerHTML = "";
    if (!networkData) {
      container.innerHTML = `<p class="empty-state">Load the Braess example or upload GMNS files to draw the network.</p>`;
      return;
    }
    const width = container.clientWidth || 760;
    const height = 430;
    const margin = { top: 28, right: 28, bottom: 42, left: 28 };
    const nodes = networkData.nodes.map((node) => ({ ...node }));
    const links = networkData.links.map((link) => ({ ...link }));
    const nodeById = new Map(nodes.map((node) => [String(node.id), node]));
    function refreshIncidentLinkLengths(nodeId) {
      links.forEach((link) => {
        if (String(link.fromNodeId) === String(nodeId) || String(link.toNodeId) === String(nodeId)) {
          link.length = computeLinkGeometryLength(link, nodeById);
        }
      });
    }
    const { xScale, yScale } = equalAspectScales(nodes, width, height, margin);
    const svg = select_default2(container).append("svg").attr("class", "chart-svg").attr("viewBox", `0 0 ${width} ${height}`);
    const defs = svg.append("defs");
    defs.append("marker").attr("id", "network-arrow").attr("viewBox", "0 0 10 10").attr("refX", 8).attr("refY", 5).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto-start-reverse").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", "#325f7e");
    const flows = links.map((link) => flowForLink(scenarioResult, link.id));
    const costs = links.map((link) => costForLink(scenarioResult, link.id));
    const maxFlow = max(flows) || 1;
    const maxCost = max(costs) || 1;
    const widthScale = linear2().domain([0, maxFlow]).range([2.5, 14]);
    const colorScale = linear2().domain([0, maxCost]).range(["#d9e9f4", "#24506e"]).interpolate(lab2);
    const legendGradient = defs.append("linearGradient").attr("id", "travel-time-gradient").attr("x1", "0%").attr("x2", "100%").attr("y1", "0%").attr("y2", "0%");
    legendGradient.append("stop").attr("offset", "0%").attr("stop-color", "#d9e9f4");
    legendGradient.append("stop").attr("offset", "100%").attr("stop-color", "#24506e");
    svg.append("text").attr("x", margin.left).attr("y", 18).attr("class", "legend-title").text(scenarioMode === "on" ? "Map shows the case with the added link" : "Map shows the case without the added link");
    const linkLayer = svg.append("g");
    const labelLayer = svg.append("g");
    const nodeLayer = svg.append("g");
    const tooltipLayer = svg.append("g");
    const linkSelection = linkLayer.selectAll("path").data(links).join("path").attr("fill", "none").attr("stroke-linecap", "round").attr("marker-end", "url(#network-arrow)");
    const nodeSelection = nodeLayer.selectAll("g").data(nodes).join("g").attr("class", "map-node");
    linkSelection.append("title").text((link) => {
      const flow = flowForLink(scenarioResult, link.id);
      const cost = costForLink(scenarioResult, link.id);
      return `${link.label}
lanes: ${Number(link.lanes) || 0}
capacity: ${Number(link.capacity) || 0}
length: ${Number(link.length) || 0}
free speed: ${Number(link.freeSpeed) || 0}
flow: ${format(".2f")(flow)}
cost: ${format(".2f")(cost)}
${describeCostFunction(link)}`;
    });
    nodeSelection.append("circle").attr("r", 11).attr("fill", "#16324f");
    nodeSelection.append("text").attr("text-anchor", "middle").attr("dy", -18).attr("fill", "#16324f").attr("font-size", 12).attr("font-weight", 600).text((node) => node.label);
    nodeSelection.append("title").text((node) => `${node.label}
node_id: ${node.id}
zone_id: ${node.zoneId ?? "—"}
x: ${format(".2f")(node.x)}
y: ${format(".2f")(node.y)}`);
    labelLayer.append("text").attr("x", margin.left).attr("y", height - 18).attr("class", "legend-label").text("Click a link to edit it. Drag nodes to move the drawing.");
    function updateGeometry() {
      linkSelection.select("title").text((link) => {
        const flow = flowForLink(scenarioResult, link.id);
        const cost = costForLink(scenarioResult, link.id);
        return `${link.label}
lanes: ${Number(link.lanes) || 0}
capacity: ${Number(link.capacity) || 0}
length: ${Number(link.length) || 0}
free speed: ${Number(link.freeSpeed) || 0}
flow: ${format(".2f")(flow)}
cost: ${format(".2f")(cost)}
${describeCostFunction(link)}`;
      });
      linkSelection.attr("d", (link) => linkPath(link, nodeById, xScale, yScale)).attr("stroke", (link) => {
        const isSelectedLink = String(link.id) === String(selectedLinkId);
        const isSelectedCandidate = String(link.id) === String(selectedCandidateLinkId);
        if (isSelectedLink)
          return link.candidateFlag && isSelectedCandidate ? "#a53d2d" : "#16324f";
        if (link.candidateFlag && isSelectedCandidate)
          return "#a53d2d";
        return colorScale(costForLink(scenarioResult, link.id));
      }).attr("stroke-width", (link) => widthScale(flowForLink(scenarioResult, link.id)) + (String(link.id) === String(selectedLinkId) ? 1.5 : 0)).attr("stroke-dasharray", (link) => {
        const structurallyClosed = (Number(link.lanes) || 0) <= 0 || (Number(link.capacity) || 0) <= 0;
        return link.candidateFlag && (scenarioMode === "off" || structurallyClosed) ? "8 6" : null;
      }).attr("opacity", (link) => {
        const structurallyClosed = (Number(link.lanes) || 0) <= 0 || (Number(link.capacity) || 0) <= 0;
        return link.candidateFlag && (scenarioMode === "off" || structurallyClosed) ? 0.72 : 1;
      });
      nodeSelection.attr("transform", (node) => `translate(${xScale(node.x)}, ${yScale(node.y)})`).select("circle").attr("fill", (node) => String(node.id) === String(selectedNodeId) ? "#a53d2d" : "#16324f");
      tooltipLayer.selectAll("*").remove();
      const bounds = {
        left: margin.left,
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom
      };
      const selectedLink = links.find((link) => String(link.id) === String(selectedLinkId));
      const selectedNode = nodes.find((node) => String(node.id) === String(selectedNodeId));
      if (selectedLink) {
        const from = nodeById.get(String(selectedLink.fromNodeId));
        const to = nodeById.get(String(selectedLink.toNodeId));
        if (from && to) {
          const rawX = (xScale(from.x) + xScale(to.x)) / 2 + 12;
          const rawY = (yScale(from.y) + yScale(to.y)) / 2 - 18;
          const lines = linkTooltipLines(selectedLink, scenarioResult);
          const size = tooltipSize(lines);
          const pos = clampTooltipPosition(rawX, rawY, size.width, size.height, bounds);
          const box = tooltipLayer.append("g").attr("transform", `translate(${pos.x}, ${pos.y})`);
          box.append("rect").attr("class", "selection-tooltip-box").attr("width", size.width).attr("height", size.height).attr("rx", 12);
          const text = box.append("text").attr("class", "selection-tooltip-text").attr("x", 10).attr("y", 16);
          lines.forEach((line, index2) => {
            text.append("tspan").attr("x", 10).attr("dy", index2 === 0 ? 0 : 16).text(line);
          });
        }
      } else if (selectedNode) {
        const rawX = xScale(selectedNode.x) + 14;
        const rawY = yScale(selectedNode.y) - 22;
        const lines = nodeTooltipLines(selectedNode);
        const size = tooltipSize(lines);
        const pos = clampTooltipPosition(rawX, rawY, size.width, size.height, bounds);
        const box = tooltipLayer.append("g").attr("transform", `translate(${pos.x}, ${pos.y})`);
        box.append("rect").attr("class", "selection-tooltip-box").attr("width", size.width).attr("height", size.height).attr("rx", 12);
        const text = box.append("text").attr("class", "selection-tooltip-text").attr("x", 10).attr("y", 16);
        lines.forEach((line, index2) => {
          text.append("tspan").attr("x", 10).attr("dy", index2 === 0 ? 0 : 16).text(line);
        });
      }
    }
    linkSelection.style("cursor", "pointer").on("click", (_, link) => {
      onLinkSelect?.(link.id);
    });
    nodeSelection.style("cursor", "pointer").on("click", (_, node) => {
      onNodeSelect?.(node.id);
    });
    nodeSelection.call(drag_default().on("drag", (event, node) => {
      node.x = xScale.invert(event.x);
      node.y = yScale.invert(event.y);
      refreshIncidentLinkLengths(node.id);
      onNodeGeometryPreview?.(node.id, {
        node: { ...node },
        links: links.filter((link) => String(link.fromNodeId) === String(node.id) || String(link.toNodeId) === String(node.id)).map((link) => ({ ...link }))
      });
      updateGeometry();
    }).on("end", (_, node) => {
      onNodePositionChange?.(node.id, { x: node.x, y: node.y });
    }));
    updateGeometry();
    const legend = svg.append("g").attr("transform", `translate(${width - 236}, 24)`);
    legend.append("rect").attr("width", 188).attr("height", 142).attr("rx", 14).attr("fill", "rgba(255,255,255,0.92)").attr("stroke", "#d8e1ea");
    legend.append("text").attr("x", 14).attr("y", 22).attr("class", "legend-title").text("Legend");
    legend.append("text").attr("x", 14).attr("y", 42).attr("class", "legend-label").text("Link travel time");
    legend.append("rect").attr("x", 14).attr("y", 50).attr("width", 110).attr("height", 10).attr("rx", 5).attr("fill", "url(#travel-time-gradient)");
    legend.append("text").attr("x", 14).attr("y", 74).attr("class", "legend-label").text(`low ${format(".2f")(0)}  to  high ${format(".2f")(maxCost)}`);
    const flowLevels = [0, maxFlow / 2, maxFlow].map((value) => Number.isFinite(value) ? value : 0);
    legend.append("text").attr("x", 14).attr("y", 92).attr("class", "legend-label").text("Link width = flow");
    flowLevels.forEach((value, index2) => {
      const y2 = 100 + index2 * 16;
      legend.append("line").attr("x1", 16).attr("x2", 78).attr("y1", y2).attr("y2", y2).attr("stroke", "#325f7e").attr("stroke-width", Math.max(widthScale(value), 1.5)).attr("stroke-linecap", "round");
      legend.append("text").attr("x", 88).attr("y", y2 + 4).attr("class", "legend-label").text(format(".2f")(value));
    });
    legend.append("text").attr("x", 14).attr("y", 152).attr("class", "legend-label").text("Dashed line = closed or off");
    const xDomain = xScale.domain();
    const units = scaleBarUnits(xDomain[1] - xDomain[0]);
    const pixels = units / (xDomain[1] - xDomain[0]) * (width - margin.left - margin.right);
    const scaleX = margin.left;
    const scaleY = height - margin.bottom + 8;
    svg.append("line").attr("x1", scaleX).attr("x2", scaleX + pixels).attr("y1", scaleY).attr("y2", scaleY).attr("stroke", "#16324f").attr("stroke-width", 3);
    svg.append("line").attr("x1", scaleX).attr("x2", scaleX).attr("y1", scaleY - 6).attr("y2", scaleY + 6).attr("stroke", "#16324f").attr("stroke-width", 2);
    svg.append("line").attr("x1", scaleX + pixels).attr("x2", scaleX + pixels).attr("y1", scaleY - 6).attr("y2", scaleY + 6).attr("stroke", "#16324f").attr("stroke-width", 2);
    svg.append("text").attr("x", scaleX).attr("y", scaleY - 10).attr("class", "legend-label").text(`${format(".3~g")(units)} coordinate units`);
  }

  // src/ui/charts.js
  function createSvg(container, emptyMessage) {
    container.innerHTML = "";
    if (!container.clientWidth) {
      container.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
      return null;
    }
    return select_default2(container).append("svg").attr("class", "chart-svg").attr("viewBox", `0 0 ${container.clientWidth} 260`);
  }
  function renderConvergenceChart(container, result) {
    if (!result?.convergence?.length) {
      container.innerHTML = `<p class="empty-state">Solver iterations will appear here after a run.</p>`;
      return;
    }
    const svg = createSvg(container, "");
    if (!svg)
      return;
    const width = container.clientWidth;
    const height = 260;
    const margin = { top: 20, right: 20, bottom: 34, left: 52 };
    const x2 = linear2().domain([1, result.convergence.length]).range([margin.left, width - margin.right]);
    const y2 = log().domain([Math.max(min(result.convergence, (row) => row.gap), 0.00000001), Math.max(max(result.convergence, (row) => row.gap), 0.000001)]).range([height - margin.bottom, margin.top]);
    const line = line_default().x((row) => x2(row.iteration)).y((row) => y2(Math.max(row.gap, 0.00000001)));
    svg.append("path").datum(result.convergence).attr("fill", "none").attr("stroke", "#a53d2d").attr("stroke-width", 2.5).attr("d", line);
    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(axisBottom(x2).ticks(6).tickFormat(format("d")));
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(axisLeft(y2).ticks(5, ".1e"));
  }
  function renderSliceChart(container, sweepResult) {
    if (!sweepResult?.rows?.length) {
      container.innerHTML = `<p class="empty-state">Run a sweep to extract a one-dimensional slice.</p>`;
      return;
    }
    const yValues = [...new Set(sweepResult.rows.map((row) => row.y))].sort((a, b) => a - b);
    const targetY = yValues[Math.floor(yValues.length / 2)];
    const rows = sweepResult.rows.filter((row) => row.y === targetY).sort((a, b) => a.x - b.x);
    const svg = createSvg(container, "");
    if (!svg)
      return;
    const width = container.clientWidth;
    const height = 260;
    const margin = { top: 20, right: 20, bottom: 34, left: 52 };
    const x2 = linear2().domain(extent(rows, (row) => row.x)).range([margin.left, width - margin.right]);
    const y2 = linear2().domain([
      min(rows, (row) => Math.min(row.offCost, row.onCost)),
      max(rows, (row) => Math.max(row.offCost, row.onCost))
    ]).nice().range([height - margin.bottom, margin.top]);
    const line = (key) => line_default().x((row) => x2(row.x)).y((row) => y2(row[key]));
    svg.append("path").datum(rows).attr("fill", "none").attr("stroke", "#2f6f90").attr("stroke-width", 2.5).attr("d", line("offCost"));
    svg.append("path").datum(rows).attr("fill", "none").attr("stroke", "#a53d2d").attr("stroke-width", 2.5).attr("d", line("onCost"));
    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(axisBottom(x2).ticks(6));
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(axisLeft(y2).ticks(6));
  }
  function renderDemandCurveChart(container, inputs, onCurveChange) {
    container.innerHTML = "";
    if (!container.clientWidth) {
      container.innerHTML = `<p class="empty-state">Demand curve controls will appear here.</p>`;
      return;
    }
    const A = Math.max(0.000001, Number(inputs.inverseDemandA) || 0.000001);
    const fixedTrips = Math.max(0.000001, Number(inputs.fixedDemand) || 0.000001);
    const isFixedDemand = inputs.demandMode === "fixed";
    const xIntercept = fixedTrips;
    const xMax = Math.max(xIntercept * 1.2, 10);
    const yMax = Math.max(A * 1.15, 10);
    const width = container.clientWidth;
    const height = 260;
    const margin = { top: 20, right: 20, bottom: 40, left: 52 };
    const svg = select_default2(container).append("svg").attr("class", "chart-svg").attr("viewBox", `0 0 ${width} ${height}`);
    const x2 = linear2().domain([0, xMax]).range([margin.left, width - margin.right]);
    const y2 = linear2().domain([0, yMax]).range([height - margin.bottom, margin.top]);
    const line = line_default().x((point) => x2(point.x)).y((point) => y2(point.y));
    const updateYAxisIntercept = (pixelY) => {
      if (isFixedDemand) {
        return;
      }
      const nextA = Math.max(0.000001, y2.invert(Math.max(margin.top, Math.min(height - margin.bottom, pixelY))));
      onCurveChange?.({
        inverseDemandA: nextA,
        inverseDemandB: nextA / xIntercept
      });
    };
    const updateXAxisIntercept = (pixelX) => {
      const nextQ = Math.max(0.000001, x2.invert(Math.max(margin.left, Math.min(width - margin.right, pixelX))));
      if (isFixedDemand) {
        onCurveChange?.({
          fixedDemand: nextQ
        });
        return;
      }
      onCurveChange?.({
        inverseDemandA: A,
        inverseDemandB: A / nextQ,
        fixedDemand: nextQ
      });
    };
    if (isFixedDemand) {
      svg.append("line").attr("x1", x2(fixedTrips)).attr("x2", x2(fixedTrips)).attr("y1", margin.top).attr("y2", height - margin.bottom).attr("stroke", "#2f6f90").attr("stroke-width", 3);
    } else {
      svg.append("path").datum([
        { x: 0, y: A },
        { x: xIntercept, y: 0 }
      ]).attr("fill", "none").attr("stroke", "#2f6f90").attr("stroke-width", 3).attr("d", line);
    }
    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(axisBottom(x2).ticks(6));
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(axisLeft(y2).ticks(6));
    svg.append("rect").attr("x", margin.left - 14).attr("y", height - margin.bottom - 14).attr("width", width - margin.left - margin.right + 28).attr("height", 28).attr("fill", "transparent").style("cursor", "ew-resize").on("click", (event) => {
      const [pixelX] = pointer_default(event, svg.node());
      updateXAxisIntercept(pixelX);
    });
    svg.append("rect").attr("x", margin.left - 14).attr("y", margin.top - 14).attr("width", 28).attr("height", height - margin.top - margin.bottom + 28).attr("fill", "transparent").style("cursor", isFixedDemand ? "default" : "ns-resize").on("click", (event) => {
      const [, pixelY] = pointer_default(event, svg.node());
      updateYAxisIntercept(pixelY);
    });
    svg.append("text").attr("x", width / 2).attr("y", height - 8).attr("text-anchor", "middle").attr("class", "legend-label").text("Trips");
    svg.append("text").attr("transform", `translate(16,${height / 2}) rotate(-90)`).attr("text-anchor", "middle").attr("class", "legend-label").text("Generalised cost");
    const yHandleX = x2(0);
    const yHandleY = y2(A);
    const xHandleX = x2(xIntercept);
    const xHandleY = y2(0);
    svg.append("line").attr("x1", xHandleX).attr("x2", xHandleX).attr("y1", margin.top).attr("y2", xHandleY).attr("stroke", "rgba(27, 127, 107, 0.2)").attr("stroke-width", 2).attr("stroke-dasharray", "5 5");
    const xHandleHit = svg.append("circle").attr("cx", xHandleX).attr("cy", xHandleY).attr("r", 18).attr("fill", "transparent").attr("class", "drag-handle-hit").style("cursor", "ew-resize");
    const xHandle = svg.append("circle").attr("cx", xHandleX).attr("cy", xHandleY).attr("r", 9).attr("fill", "#1b7f6b").attr("stroke", "#ffffff").attr("stroke-width", 2).style("cursor", "ew-resize");
    if (!isFixedDemand) {
      const yHandleHit = svg.append("circle").attr("cx", yHandleX).attr("cy", yHandleY).attr("r", 18).attr("fill", "transparent").attr("class", "drag-handle-hit").style("cursor", "ns-resize");
      const yHandle = svg.append("circle").attr("cx", yHandleX).attr("cy", yHandleY).attr("r", 9).attr("fill", "#a53d2d").attr("stroke", "#ffffff").attr("stroke-width", 2).style("cursor", "ns-resize");
      const yDrag = drag_default().on("drag", (event) => {
        updateYAxisIntercept(event.y);
      });
      yHandle.call(yDrag);
      yHandleHit.call(yDrag);
      svg.append("text").attr("x", x2(0) + 10).attr("y", y2(A) - 10).attr("class", "legend-label").text(`Y intercept ${format(".2f")(A)}`);
    }
    svg.append("text").attr("x", xHandleX - 10).attr("y", y2(0) - 10).attr("text-anchor", "end").attr("class", "legend-label").text(`Initial trips ${format(".2f")(xIntercept)}`);
    const xDrag = drag_default().on("drag", (event) => {
      updateXAxisIntercept(event.x);
    });
    xHandle.call(xDrag);
    xHandleHit.call(xDrag);
  }

  // src/model/demand.js
  var DEMAND_MODE = {
    FIXED: "fixed",
    ELASTIC: "elastic"
  };
  function inverseDemandCost({ A, B }, quantity) {
    return Number(A) - Number(B) * Math.max(0, quantity);
  }
  function inverseDemandMaxQuantity({ A, B }) {
    const intercept = Number(A);
    const slope = Number(B);
    if (!Number.isFinite(intercept) || !Number.isFinite(slope) || slope <= 0) {
      return 0;
    }
    return Math.max(0, intercept / slope);
  }
  function consumerSurplusInverseDemand({ A, B }, quantity, generalizedCost) {
    const q = Math.max(0, Number(quantity));
    const intercept = Number(A);
    const slope = Math.max(0, Number(B));
    const totalWillingnessToPay = intercept * q - 0.5 * slope * q * q;
    return totalWillingnessToPay - Number(generalizedCost) * q;
  }

  // src/model/welfare.js
  function totalSystemTravelTime(linkFlows, linkCosts) {
    let total = 0;
    for (const [linkId, flow] of linkFlows.entries()) {
      total += Number(flow) * Number(linkCosts.get(linkId) ?? 0);
    }
    return total;
  }
  function computeScenarioWelfare({
    demandMode,
    quantity,
    equilibriumCost,
    inverseDemand,
    linkFlows,
    linkCosts
  }) {
    const totalTravelTime = totalSystemTravelTime(linkFlows, linkCosts);
    const consumerSurplus = demandMode === "elastic" ? consumerSurplusInverseDemand(inverseDemand, quantity, equilibriumCost) : 0;
    return {
      totalTravelTime,
      averageTravelTime: quantity > 0 ? totalTravelTime / quantity : equilibriumCost,
      consumerSurplus,
      totalWelfare: consumerSurplus - totalTravelTime
    };
  }

  // src/model/equilibrium.js
  function sum(values) {
    return values.reduce((total, value) => total + value, 0);
  }
  function buildPathId(path2) {
    return path2.links.map((link) => link.id).join(">");
  }
  function enumerateSimplePaths(network, maxDepth = network.nodes.length + 1) {
    const adjacency = adjacencyFromLinks(network.links);
    const paths = [];
    function visit(nodeId, visited2, pathLinks) {
      if (pathLinks.length > maxDepth)
        return;
      if (nodeId === network.destinationId) {
        paths.push({
          id: buildPathId({ links: pathLinks }),
          links: [...pathLinks]
        });
        return;
      }
      const outgoing = adjacency.get(nodeId) ?? [];
      for (const link of outgoing) {
        if (visited2.has(link.toNodeId))
          continue;
        visited2.add(link.toNodeId);
        pathLinks.push(link);
        visit(link.toNodeId, visited2, pathLinks);
        pathLinks.pop();
        visited2.delete(link.toNodeId);
      }
    }
    const visited = new Set([network.originId]);
    visit(network.originId, visited, []);
    return paths;
  }
  function zeroLinkFlowMap(links) {
    return new Map(links.filter((link) => link.enabled).map((link) => [link.id, 0]));
  }
  function linkCostsFromFlows(links, linkFlows) {
    const costs = new Map;
    for (const link of links) {
      if (!link.enabled)
        continue;
      costs.set(link.id, evaluateLinkCost(link, linkFlows.get(link.id) ?? 0));
    }
    return costs;
  }
  function pathCost(path2, linkCosts) {
    return sum(path2.links.map((link) => linkCosts.get(link.id) ?? 0));
  }
  function linkFlowsFromPathFlows(paths, pathFlows) {
    const flows = new Map;
    paths.forEach((path2, index2) => {
      const pathFlow = pathFlows[index2] ?? 0;
      for (const link of path2.links) {
        flows.set(link.id, (flows.get(link.id) ?? 0) + pathFlow);
      }
    });
    return flows;
  }
  function shortestPathIndex(paths, linkCosts) {
    let bestIndex = 0;
    let bestCost = Infinity;
    paths.forEach((path2, index2) => {
      const cost = pathCost(path2, linkCosts);
      if (cost < bestCost - 0.000000000001) {
        bestCost = cost;
        bestIndex = index2;
      }
    });
    return bestIndex;
  }
  function relativeGap(paths, pathFlows, linkCosts, shortestCost, demand) {
    if (demand <= 0 || shortestCost <= 0)
      return 0;
    let excess = 0;
    paths.forEach((path2, index2) => {
      const flow = pathFlows[index2] ?? 0;
      if (flow <= 0)
        return;
      const cost = pathCost(path2, linkCosts);
      excess += flow * Math.max(0, cost - shortestCost);
    });
    return excess / Math.max(demand * shortestCost, 0.000000001);
  }
  function solveZeroDemand(network, demandMode, inverseDemand) {
    const paths = enumerateSimplePaths(network);
    const linkFlows = zeroLinkFlowMap(network.links);
    const linkCosts = linkCostsFromFlows(network.links, linkFlows);
    const equilibriumCost = paths.length > 0 ? Math.min(...paths.map((path2) => pathCost(path2, linkCosts))) : 0;
    const metrics = computeScenarioWelfare({
      demandMode,
      quantity: 0,
      equilibriumCost,
      inverseDemand,
      linkFlows,
      linkCosts
    });
    return {
      quantity: 0,
      equilibriumCost,
      shortestPathCost: equilibriumCost,
      paths,
      pathFlows: paths.map(() => 0),
      linkFlows,
      linkCosts,
      convergence: [],
      metrics
    };
  }
  function solveFixedDemandEquilibrium(network, options = {}) {
    const demand = Math.max(0, Number(options.demand ?? 0));
    const maxIterations = Math.max(1, Number(options.maxIterations ?? 120));
    const tolerance = Math.max(0.0000000001, Number(options.tolerance ?? 0.000001));
    if (demand <= 0) {
      return solveZeroDemand(network, DEMAND_MODE.FIXED, options.inverseDemand);
    }
    const paths = enumerateSimplePaths(network);
    if (paths.length === 0) {
      throw new Error("No enabled origin-destination path exists in the current network.");
    }
    let pathFlows = paths.map(() => 0);
    const convergence = [];
    for (let iteration = 1;iteration <= maxIterations; iteration += 1) {
      const linkFlows = linkFlowsFromPathFlows(paths, pathFlows);
      const linkCosts = linkCostsFromFlows(network.links, linkFlows);
      const bestIndex = shortestPathIndex(paths, linkCosts);
      const shortestCost = pathCost(paths[bestIndex], linkCosts);
      const aonFlows = paths.map((_, index2) => index2 === bestIndex ? demand : 0);
      const stepSize = iteration === 1 ? 1 : 1 / iteration;
      pathFlows = pathFlows.map((value, index2) => value + stepSize * (aonFlows[index2] - value));
      const updatedLinkFlows = linkFlowsFromPathFlows(paths, pathFlows);
      const updatedLinkCosts = linkCostsFromFlows(network.links, updatedLinkFlows);
      const updatedShortestCost = pathCost(paths[shortestPathIndex(paths, updatedLinkCosts)], updatedLinkCosts);
      const gap = relativeGap(paths, pathFlows, updatedLinkCosts, updatedShortestCost, demand);
      convergence.push({
        iteration,
        stepSize,
        shortestCost: updatedShortestCost,
        gap
      });
      if (iteration >= 5 && gap <= tolerance) {
        break;
      }
    }
    const finalLinkFlows = linkFlowsFromPathFlows(paths, pathFlows);
    const finalLinkCosts = linkCostsFromFlows(network.links, finalLinkFlows);
    const pathCosts = paths.map((path2) => pathCost(path2, finalLinkCosts));
    const weightedCost = demand > 0 ? sum(pathCosts.map((cost, index2) => cost * pathFlows[index2])) / demand : 0;
    const shortestPathCost = Math.min(...pathCosts);
    const metrics = computeScenarioWelfare({
      demandMode: DEMAND_MODE.FIXED,
      quantity: demand,
      equilibriumCost: weightedCost,
      inverseDemand: options.inverseDemand,
      linkFlows: finalLinkFlows,
      linkCosts: finalLinkCosts
    });
    return {
      quantity: demand,
      equilibriumCost: weightedCost,
      shortestPathCost,
      paths,
      pathFlows,
      linkFlows: finalLinkFlows,
      linkCosts: finalLinkCosts,
      convergence,
      metrics
    };
  }
  function solveElasticDemandEquilibrium(network, options = {}) {
    const inverseDemand = {
      A: Number(options.inverseDemand?.A ?? 0),
      B: Number(options.inverseDemand?.B ?? 0)
    };
    const maxOuterIterations = Math.max(1, Number(options.maxOuterIterations ?? 40));
    const quantityTolerance = Math.max(0.00000001, Number(options.quantityTolerance ?? 0.0001));
    const costTolerance = Math.max(0.00000001, Number(options.costTolerance ?? 0.0001));
    const qMax = Math.max(Number(options.maxDemand ?? inverseDemandMaxQuantity(inverseDemand)), 0);
    if (qMax <= 0) {
      return {
        ...solveZeroDemand(network, DEMAND_MODE.ELASTIC, inverseDemand),
        zeroDemandReason: "Inverse-demand slope/intercept imply no positive maximum demand."
      };
    }
    const evaluate = (quantity) => {
      const result = solveFixedDemandEquilibrium(network, {
        demand: quantity,
        maxIterations: options.maxIterations,
        tolerance: options.tolerance,
        inverseDemand
      });
      const willingnessToPay = inverseDemandCost(inverseDemand, quantity);
      return {
        quantity,
        result,
        generalizedCost: result.shortestPathCost,
        diff: result.shortestPathCost - willingnessToPay,
        willingnessToPay
      };
    };
    const zeroCost = solveZeroDemand(network, DEMAND_MODE.ELASTIC, inverseDemand);
    if (zeroCost.equilibriumCost >= inverseDemand.A) {
      return {
        ...zeroCost,
        zeroDemandReason: `No-flow OD cost ${zeroCost.equilibriumCost.toFixed(4)} is at or above inverse-demand intercept A ${inverseDemand.A.toFixed(4)}.`
      };
    }
    let lower2 = evaluate(0);
    let upper = evaluate(qMax);
    let best = Math.abs(lower2.diff) <= Math.abs(upper.diff) ? lower2 : upper;
    for (let iteration = 0;iteration < maxOuterIterations; iteration += 1) {
      const midQuantity = 0.5 * (lower2.quantity + upper.quantity);
      const current = evaluate(midQuantity);
      current.iteration = iteration + 1;
      best = Math.abs(current.diff) < Math.abs(best.diff) ? current : best;
      if (Math.abs(current.diff) <= costTolerance || Math.abs(upper.quantity - lower2.quantity) <= quantityTolerance) {
        best = current;
        break;
      }
      if (current.diff > 0) {
        upper = current;
      } else {
        lower2 = current;
      }
    }
    const metrics = computeScenarioWelfare({
      demandMode: DEMAND_MODE.ELASTIC,
      quantity: best.quantity,
      equilibriumCost: best.result.equilibriumCost,
      inverseDemand,
      linkFlows: best.result.linkFlows,
      linkCosts: best.result.linkCosts
    });
    return {
      ...best.result,
      quantity: best.quantity,
      inverseDemand,
      outerTrace: [lower2, upper, best].filter(Boolean),
      metrics
    };
  }

  // src/model/paradox.js
  function compareScenarios(offResult, onResult, tolerance = 0.000001) {
    const deltaCost = Number(onResult.equilibriumCost) - Number(offResult.equilibriumCost);
    const deltaDemand = Number(onResult.quantity) - Number(offResult.quantity);
    const deltaTravelTime = Number(onResult.metrics.totalTravelTime) - Number(offResult.metrics.totalTravelTime);
    const deltaConsumerSurplus = Number(onResult.metrics.consumerSurplus) - Number(offResult.metrics.consumerSurplus);
    const deltaWelfare = Number(onResult.metrics.totalWelfare) - Number(offResult.metrics.totalWelfare);
    return {
      deltaCost,
      deltaDemand,
      deltaTravelTime,
      deltaConsumerSurplus,
      deltaWelfare,
      paradox: deltaCost > tolerance,
      reducedDemand: deltaCost > tolerance && deltaDemand < -tolerance,
      welfareLoss: deltaWelfare < -tolerance,
      consumerSurplusLoss: deltaConsumerSurplus < -tolerance
    };
  }

  // src/model/sweep.js
  var SWEEP_PARAMETERS = [
    { key: "fixedDemand", label: "Fixed demand q" },
    { key: "inverseDemandA", label: "Inverse demand A" },
    { key: "inverseDemandB", label: "Inverse demand B" },
    { key: "variableCostB", label: "Variable-link coefficient b" },
    { key: "constantLinkCost", label: "Constant-link cost" },
    { key: "candidateLinkCost", label: "Candidate-link cost" },
    { key: "bprAlpha", label: "BPR alpha" },
    { key: "bprBeta", label: "BPR beta" },
    { key: "capacityScale", label: "Capacity scale" }
  ];
  function gridValues(min2, max2, steps) {
    const count = Math.max(1, Number(steps));
    if (count === 1)
      return [Number(min2)];
    const start2 = Number(min2);
    const stop = Number(max2);
    const delta = (stop - start2) / (count - 1);
    return Array.from({ length: count }, (_, index2) => start2 + delta * index2);
  }
  function applySweepValue(inputs, key, value) {
    return {
      ...inputs,
      [key]: value
    };
  }
  function applyGroupedLinkParameters(networkData, inputs) {
    const trial = cloneNetworkData(networkData);
    const variableModel = inputs.costModelMode === COST_FUNCTION.BPR ? COST_FUNCTION.BPR : COST_FUNCTION.AFFINE;
    trial.links = trial.links.map((link) => {
      const next = { ...link };
      if (next.parameterGroup === "variable") {
        next.costFunctionType = variableModel;
        if (variableModel === COST_FUNCTION.AFFINE) {
          next.costA = Number(inputs.variableBaseCost);
          next.costB = Number(inputs.variableCostB);
        } else {
          next.costA = Number(inputs.variableBaseCost);
          next.bprAlpha = Number(inputs.bprAlpha);
          next.bprBeta = Number(inputs.bprBeta);
        }
      }
      if (next.parameterGroup === "constant") {
        next.costFunctionType = COST_FUNCTION.AFFINE;
        next.costA = Number(inputs.constantLinkCost);
        next.costB = 0;
      }
      if (next.parameterGroup === "candidate") {
        if (next.costFunctionType === COST_FUNCTION.BPR) {
          next.bprAlpha = Number(inputs.bprAlpha);
          next.bprBeta = Number(inputs.bprBeta);
        } else {
          next.costA = Number(inputs.candidateLinkCost);
          next.costB = Number(inputs.candidateLinkB ?? next.costB ?? 0);
        }
      }
      return next;
    });
    return trial;
  }
  function solveScenario(networkData, inputs, scenarioMode) {
    const preparedNetwork = applyGroupedLinkParameters(networkData, inputs);
    const network = buildScenarioNetwork(preparedNetwork, {
      ...inputs,
      scenarioMode
    });
    if (inputs.demandMode === DEMAND_MODE.ELASTIC) {
      return solveElasticDemandEquilibrium(network, {
        inverseDemand: {
          A: Number(inputs.inverseDemandA),
          B: Number(inputs.inverseDemandB)
        },
        maxIterations: Number(inputs.maxIterations),
        tolerance: Number(inputs.tolerance),
        maxOuterIterations: Number(inputs.maxOuterIterations),
        quantityTolerance: Number(inputs.quantityTolerance),
        costTolerance: Number(inputs.costTolerance)
      });
    }
    return solveFixedDemandEquilibrium(network, {
      demand: Number(inputs.fixedDemand),
      maxIterations: Number(inputs.maxIterations),
      tolerance: Number(inputs.tolerance),
      inverseDemand: {
        A: Number(inputs.inverseDemandA),
        B: Number(inputs.inverseDemandB)
      }
    });
  }
  async function runParameterSweep({ networkData, inputs, sweepConfig, onProgress, isCancelled }) {
    const xValues = gridValues(sweepConfig.xMin, sweepConfig.xMax, sweepConfig.xSteps);
    const yValues = gridValues(sweepConfig.yMin, sweepConfig.yMax, sweepConfig.ySteps);
    const cells = [];
    const rows = [];
    const total = xValues.length * yValues.length;
    let completed = 0;
    for (const y2 of yValues) {
      for (const x2 of xValues) {
        if (isCancelled?.()) {
          throw new Error("Sweep cancelled.");
        }
        let trialInputs = applySweepValue(inputs, sweepConfig.xParameter, x2);
        trialInputs = applySweepValue(trialInputs, sweepConfig.yParameter, y2);
        const offResult = solveScenario(networkData, trialInputs, "off");
        const onResult = solveScenario(networkData, trialInputs, "on");
        const comparison = compareScenarios(offResult, onResult, Number(inputs.classificationTolerance));
        const row = {
          x: x2,
          y: y2,
          xParameter: sweepConfig.xParameter,
          yParameter: sweepConfig.yParameter,
          offDemand: offResult.quantity,
          onDemand: onResult.quantity,
          offCost: offResult.equilibriumCost,
          onCost: onResult.equilibriumCost,
          deltaCost: comparison.deltaCost,
          deltaDemand: comparison.deltaDemand,
          deltaTravelTime: comparison.deltaTravelTime,
          deltaConsumerSurplus: comparison.deltaConsumerSurplus,
          deltaWelfare: comparison.deltaWelfare,
          paradox: comparison.paradox ? 1 : 0,
          reducedDemand: comparison.reducedDemand ? 1 : 0,
          welfareLoss: comparison.welfareLoss ? 1 : 0
        };
        rows.push(row);
        cells.push({
          x: x2,
          y: y2,
          value: sweepConfig.metric === "paradox" ? row.paradox : sweepConfig.metric === "reducedDemand" ? row.reducedDemand : sweepConfig.metric === "welfareLoss" ? row.welfareLoss : row[sweepConfig.metric]
        });
        completed += 1;
        onProgress?.({
          completed,
          total,
          fraction: completed / total
        });
        await Promise.resolve();
      }
    }
    return {
      xValues,
      yValues,
      cells,
      rows
    };
  }

  // src/ui/heatmap.js
  var BINARY_METRICS = new Set(["paradox", "reducedDemand", "welfareLoss"]);
  var METRIC_LABELS = new Map([
    ["paradox", "Added link makes cost worse"],
    ["reducedDemand", "Added link also reduces demand"],
    ["welfareLoss", "Total welfare falls"],
    ["deltaCost", "Change in equilibrium cost"],
    ["deltaDemand", "Change in demand"],
    ["deltaTravelTime", "Change in total travel time"],
    ["deltaConsumerSurplus", "Change in consumer surplus"],
    ["deltaWelfare", "Change in total welfare"]
  ]);
  function parameterLabel(key) {
    return SWEEP_PARAMETERS.find((entry) => entry.key === key)?.label ?? key;
  }
  function metricLabel(key) {
    return METRIC_LABELS.get(key) ?? key;
  }
  function metricPalette(metric, valueExtent) {
    if (BINARY_METRICS.has(metric)) {
      return ordinal().domain([0, 1]).range(["#e8edf2", "#d1495b"]);
    }
    return sequential(RdBu_default).domain([valueExtent[1], valueExtent[0]]);
  }
  function numericStep(values) {
    const sorted = Array.from(new Set(values.map(Number))).sort((a, b) => a - b);
    if (sorted.length < 2)
      return 1;
    return min(sorted.slice(1).map((value, index2) => Math.abs(value - sorted[index2]))) || 1;
  }
  function tickFormatter(values) {
    const [min2, max2] = extent(values.map(Number));
    const span = Math.abs(max2 - min2);
    if (span >= 20)
      return format(".0f");
    if (span >= 2)
      return format(".1f");
    if (span >= 0.2)
      return format(".2f");
    return format(".3f");
  }
  function renderLegend(svg, { fill, metric, valueExtent, width, height, margin }) {
    const legend = svg.append("g").attr("class", "heatmap-legend");
    const legendX = width - margin.right - 210;
    const legendY = 18;
    legend.append("text").attr("x", legendX).attr("y", legendY - 5).attr("class", "legend-title").text(metricLabel(metric));
    if (BINARY_METRICS.has(metric)) {
      const entries = [
        { value: 1, label: "Yes" },
        { value: 0, label: "No" }
      ];
      const item = legend.selectAll("g.binary-legend-item").data(entries).join("g").attr("class", "binary-legend-item").attr("transform", (_, index2) => `translate(${legendX + index2 * 82},${legendY + 8})`);
      item.append("rect").attr("width", 18).attr("height", 12).attr("rx", 3).attr("fill", (entry) => fill(entry.value));
      item.append("text").attr("x", 24).attr("y", 10).attr("class", "legend-label").text((entry) => entry.label);
      return;
    }
    const gradientId = `heatmap-gradient-${metric}`;
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient").attr("id", gradientId).attr("x1", "0%").attr("x2", "100%").attr("y1", "0%").attr("y2", "0%");
    range(0, 1.0001, 0.1).forEach((offset) => {
      const value = valueExtent[0] + offset * (valueExtent[1] - valueExtent[0]);
      gradient.append("stop").attr("offset", `${offset * 100}%`).attr("stop-color", fill(value));
    });
    legend.append("rect").attr("x", legendX).attr("y", legendY + 8).attr("width", 180).attr("height", 12).attr("rx", 3).attr("fill", `url(#${gradientId})`);
    const format2 = tickFormatter(valueExtent);
    legend.append("text").attr("x", legendX).attr("y", legendY + 36).attr("class", "legend-label").attr("text-anchor", "start").text(format2(valueExtent[0]));
    legend.append("text").attr("x", legendX + 180).attr("y", legendY + 36).attr("class", "legend-label").attr("text-anchor", "end").text(format2(valueExtent[1]));
  }
  function renderHeatmap(container, sweepResult, sweepConfig) {
    container.innerHTML = "";
    if (!sweepResult?.cells?.length) {
      container.innerHTML = `<p class="empty-state">The parameter heatmap will appear here after a sweep.</p>`;
      return;
    }
    const width = container.clientWidth || 720;
    const height = 400;
    const margin = { top: 62, right: 28, bottom: 70, left: 76 };
    const svg = select_default2(container).append("svg").attr("class", "chart-svg heatmap-svg").attr("viewBox", `0 0 ${width} ${height}`);
    const xValues = sweepResult.xValues;
    const yValues = sweepResult.yValues;
    const xExtent = extent(xValues, Number);
    const yExtent = extent(yValues, Number);
    const xStep = numericStep(xValues);
    const yStep = numericStep(yValues);
    const xDomain = xValues.length === 1 ? [xExtent[0] - 1, xExtent[0] + 1] : [xExtent[0] - xStep / 2, xExtent[1] + xStep / 2];
    const yDomain = yValues.length === 1 ? [yExtent[0] - 1, yExtent[0] + 1] : [yExtent[0] - yStep / 2, yExtent[1] + yStep / 2];
    const x2 = linear2().domain(xDomain).nice(6).range([margin.left, width - margin.right]);
    const y2 = linear2().domain(yDomain).nice(6).range([height - margin.bottom, margin.top]);
    const valueExtent = extent(sweepResult.cells, (cell) => Number(cell.value));
    const fill = metricPalette(sweepConfig.metric, valueExtent);
    const xCellWidth = Math.abs(x2(xExtent[0] + xStep) - x2(xExtent[0])) * 0.96;
    const yCellHeight = Math.abs(y2(yExtent[0] + yStep) - y2(yExtent[0])) * 0.96;
    const xTickFormat = tickFormatter(xValues);
    const yTickFormat = tickFormatter(yValues);
    svg.append("g").selectAll("rect").data(sweepResult.cells).join("rect").attr("x", (cell) => x2(Number(cell.x)) - xCellWidth / 2).attr("y", (cell) => y2(Number(cell.y)) - yCellHeight / 2).attr("width", xCellWidth).attr("height", yCellHeight).attr("fill", (cell) => fill(Number(cell.value)));
    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(axisBottom(x2).ticks(7).tickFormat(xTickFormat));
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(axisLeft(y2).ticks(7).tickFormat(yTickFormat));
    svg.append("text").attr("class", "axis-title").attr("x", (margin.left + width - margin.right) / 2).attr("y", height - 22).attr("text-anchor", "middle").text(parameterLabel(sweepConfig.xParameter));
    svg.append("text").attr("class", "axis-title").attr("transform", `translate(22,${(margin.top + height - margin.bottom) / 2}) rotate(-90)`).attr("text-anchor", "middle").text(parameterLabel(sweepConfig.yParameter));
    renderLegend(svg, {
      fill,
      metric: sweepConfig.metric,
      valueExtent,
      width,
      height,
      margin
    });
  }

  // src/ui/elasticRegionMap.js
  var CLASS_COLORS = new Map([
    ["BP_RD", "#5b1136"],
    ["BP_NRD", "#ef553b"],
    ["BP_ID", "#f4a261"],
    ["NBP_RD", "#2a9d8f"],
    ["NBP_NRD", "#d7dee8"],
    ["NBP_ID", "#457b9d"]
  ]);
  var AXIS_STYLES = {
    A: { color: "#2f6f95" },
    B: { color: "#9a5b1f" },
    Z: { color: "#6b5aa6" }
  };
  var DEFAULT_ROTATION = {
    x: 0.54,
    y: -0.72
  };
  var ZERO_COUNT_HIDDEN_CLASSES = new Set(["BP_ID", "NBP_RD"]);
  function classCounts(result) {
    const counts = new Map(result.classes.map((entry) => [entry.key, 0]));
    result.rows?.forEach((row) => {
      counts.set(row.classKey, (counts.get(row.classKey) ?? 0) + 1);
    });
    return counts;
  }
  function extent2(values) {
    const min2 = min(values);
    const max2 = max(values);
    return min2 === max2 ? [min2 - 1, max2 + 1] : [min2, max2];
  }
  function normalized(value, [min2, max2]) {
    return (Number(value) - min2) / Math.max(max2 - min2, 0.000000001) * 2 - 1;
  }
  function tickFormat2(values) {
    const [min2, max2] = extent2(values);
    const span = Math.abs(max2 - min2);
    if (span >= 20)
      return format(".0f");
    if (span >= 2)
      return format(".1f");
    return format(".2f");
  }
  function renderLegend2(container, result) {
    const counts = classCounts(result);
    const visibleClasses = result.classes.filter((entry) => (counts.get(entry.key) ?? 0) > 0 || !ZERO_COUNT_HIDDEN_CLASSES.has(entry.key));
    const legend = document.createElement("div");
    legend.className = "elastic-map-legend";
    legend.innerHTML = visibleClasses.map((entry) => `
        <span class="elastic-map-key">
          <span class="elastic-map-swatch" style="background:${CLASS_COLORS.get(entry.key) ?? "#ffffff"}"></span>
          ${entry.label} (${counts.get(entry.key) ?? 0})
        </span>`).join("");
    container.appendChild(legend);
  }
  function renderOutcomeSpace(container, result) {
    const toolbar = document.createElement("div");
    toolbar.className = "outcome-space-toolbar";
    toolbar.innerHTML = `
    <span>Drag the graph to rotate. The shaded regions summarize the colored outcome clouds.</span>
    <button type="button">Reset graph view</button>
  `;
    container.appendChild(toolbar);
    const width = container.clientWidth || 860;
    const height = 560;
    const svg = select_default2(container).append("svg").attr("class", "chart-svg outcome-space-svg").attr("viewBox", `0 0 ${width} ${height}`);
    const aExtent = extent2(result.points.map((point) => point.inverseDemandA));
    const bExtent = extent2(result.points.map((point) => point.inverseDemandB));
    const zExtent = extent2(result.points.map((point) => point.zValue));
    const scale = Math.min(width, height) * 0.25;
    const center2 = { x: width * 0.48, y: height * 0.52 };
    let rotationY = DEFAULT_ROTATION.y;
    let rotationX = DEFAULT_ROTATION.x;
    let animationFrame = 0;
    const volumeLayer = svg.append("g");
    const frame2 = svg.append("g");
    const ticksLayer = svg.append("g");
    const pointsLayer = svg.append("g");
    const labelLayer = svg.append("g");
    const cubeVertices = [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1]
    ];
    const cubeEdges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7]
    ];
    const axisEdges = [
      { axis: "A", points: [[-1, -1, -1], [1, -1, -1]] },
      { axis: "B", points: [[-1, -1, -1], [-1, 1, -1]] },
      { axis: "Z", points: [[-1, -1, -1], [-1, -1, 1]] }
    ];
    const aTicks = ticks(aExtent[0], aExtent[1], 5);
    const bTicks = ticks(bExtent[0], bExtent[1], 5);
    const zTicks = ticks(zExtent[0], zExtent[1], 5);
    const tickRows = [
      ...aTicks.map((value) => ({
        axis: "A",
        value,
        line: [
          [normalized(value, aExtent), -1, -1],
          [normalized(value, aExtent), -1.06, -1]
        ],
        label: [normalized(value, aExtent), -1.18, -1],
        format: tickFormat2(aTicks)
      })),
      ...bTicks.map((value) => ({
        axis: "B",
        value,
        line: [
          [-1, normalized(value, bExtent), -1],
          [-1.06, normalized(value, bExtent), -1]
        ],
        label: [-1.2, normalized(value, bExtent), -1],
        format: tickFormat2(bTicks)
      })),
      ...zTicks.map((value) => ({
        axis: "Z",
        value,
        line: [
          [-1, -1, normalized(value, zExtent)],
          [-1.06, -1, normalized(value, zExtent)]
        ],
        label: [-1.2, -1, normalized(value, zExtent)],
        format: tickFormat2(zTicks)
      }))
    ];
    const axisLabels = [
      { axis: "A", text: "A: inverse-demand intercept", vector: [1.58, -1.1, -1] },
      { axis: "B", text: "B: demand slope", vector: [-1.12, 1.58, -1] },
      { axis: "Z", text: `Z: ${result.zParameterLabel}`, vector: [-1.12, -1.08, 1.58] }
    ];
    const pointsByClass = group(result.points, (point) => point.classKey);
    const visibleVolumeClasses = result.classes.filter((entry) => (pointsByClass.get(entry.key)?.length ?? 0) >= 3);
    function project([x2, y2, z]) {
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const x1 = x2 * cosY + z * sinY;
      const z1 = -x2 * sinY + z * cosY;
      const y1 = y2 * cosX - z1 * sinX;
      const z2 = y2 * sinX + z1 * cosX;
      return {
        x: center2.x + x1 * scale,
        y: center2.y - y1 * scale,
        depth: z2
      };
    }
    function pointVector(point) {
      return [
        normalized(point.inverseDemandA, aExtent),
        normalized(point.inverseDemandB, bExtent),
        normalized(point.zValue, zExtent)
      ];
    }
    const frameLines = frame2.selectAll("line.frame-edge").data(cubeEdges).join("line").attr("class", "frame-edge").attr("stroke", "rgba(22, 50, 79, 0.16)").attr("stroke-width", 1.1);
    const axisLines = frame2.selectAll("line.axis-edge").data(axisEdges).join("line").attr("class", "axis-edge").attr("stroke", (entry) => AXIS_STYLES[entry.axis].color).attr("stroke-width", 2.2);
    const tickLines = ticksLayer.selectAll("line").data(tickRows).join("line").attr("stroke", (entry) => AXIS_STYLES[entry.axis].color).attr("stroke-width", 0.9).attr("opacity", 0.75);
    const tickLabels = ticksLayer.selectAll("text").data(tickRows).join("text").attr("class", "axis-tick-label").attr("text-anchor", "middle").attr("fill", (entry) => AXIS_STYLES[entry.axis].color).text((entry) => entry.format(entry.value));
    const volumePaths = volumeLayer.selectAll("path").data(visibleVolumeClasses).join("path").attr("fill", (entry) => CLASS_COLORS.get(entry.key) ?? "#ffffff").attr("stroke", (entry) => CLASS_COLORS.get(entry.key) ?? "#ffffff").attr("stroke-width", 1.2).attr("opacity", 0.3);
    const pointEntries = result.points.map((point) => ({ point, vector: pointVector(point) }));
    const pointCircles = pointsLayer.selectAll("circle").data(pointEntries).join("circle").attr("fill", (entry) => CLASS_COLORS.get(entry.point.classKey) ?? "#ffffff").attr("stroke", "rgba(255,255,255,0.62)").attr("stroke-width", 0.35).attr("opacity", 0.48);
    pointCircles.append("title").text((entry) => `A ${format("~g")(entry.point.inverseDemandA)}
B ${format("~g")(entry.point.inverseDemandB)}
${entry.point.zParameterLabel} ${format("~g")(entry.point.zValue)}
${entry.point.classKey}
OFF q ${entry.point.offDemand.toFixed(3)}, ON q ${entry.point.onDemand.toFixed(3)}
OFF cost ${entry.point.offCost.toFixed(3)}, ON cost ${entry.point.onCost.toFixed(3)}`);
    const axisNameLabels = labelLayer.selectAll("text").data(axisLabels).join("text").attr("class", "axis-name-label").attr("text-anchor", "middle").attr("fill", (entry) => AXIS_STYLES[entry.axis].color).text((entry) => entry.text);
    function updateScene() {
      animationFrame = 0;
      frameLines.attr("x1", ([from]) => project(cubeVertices[from]).x).attr("y1", ([from]) => project(cubeVertices[from]).y).attr("x2", ([, to]) => project(cubeVertices[to]).x).attr("y2", ([, to]) => project(cubeVertices[to]).y);
      axisLines.attr("x1", (entry) => project(entry.points[0]).x).attr("y1", (entry) => project(entry.points[0]).y).attr("x2", (entry) => project(entry.points[1]).x).attr("y2", (entry) => project(entry.points[1]).y);
      tickLines.attr("x1", (entry) => project(entry.line[0]).x).attr("y1", (entry) => project(entry.line[0]).y).attr("x2", (entry) => project(entry.line[1]).x).attr("y2", (entry) => project(entry.line[1]).y);
      tickLabels.attr("x", (entry) => project(entry.label).x).attr("y", (entry) => project(entry.label).y);
      volumePaths.attr("d", (entry) => {
        const projected = (pointsByClass.get(entry.key) ?? []).map((point) => {
          const point2d = project(pointVector(point));
          return [point2d.x, point2d.y];
        });
        const hull = hull_default(projected);
        return hull ? `M${hull.map((point) => point.join(",")).join("L")}Z` : "";
      });
      pointCircles.attr("cx", (entry) => project(entry.vector).x).attr("cy", (entry) => project(entry.vector).y).attr("r", (entry) => 1.15 + (project(entry.vector).depth + 1) * 0.22);
      axisNameLabels.attr("x", (entry) => project(entry.vector).x).attr("y", (entry) => project(entry.vector).y);
    }
    function requestSceneUpdate() {
      if (animationFrame)
        return;
      animationFrame = window.requestAnimationFrame(updateScene);
    }
    svg.call(drag_default().on("drag", (event) => {
      rotationY += event.dx * 0.008;
      rotationX += event.dy * 0.008;
      requestSceneUpdate();
    })).style("cursor", "grab");
    toolbar.querySelector("button").addEventListener("click", () => {
      rotationY = DEFAULT_ROTATION.y;
      rotationX = DEFAULT_ROTATION.x;
      requestSceneUpdate();
    });
    svg.append("text").attr("x", 18).attr("y", 24).attr("class", "legend-title").text("Drag to rotate outcome space");
    svg.append("text").attr("x", 18).attr("y", 44).attr("class", "legend-label").text("Each point is one A, B, and cost-parameter assumption.");
    updateScene();
  }
  function renderElasticRegionMap(container, result) {
    container.innerHTML = "";
    if (!result) {
      container.innerHTML = `<p class="empty-state">Set the A, B, and third-axis ranges, then click “Draw 3D space.”</p>`;
      return;
    }
    if (result.mode !== "outcomeSpace" || !result.points?.length) {
      container.innerHTML = `<p class="empty-state">Set the A, B, and third-axis ranges, then click “Draw 3D space.”</p>`;
      return;
    }
    renderOutcomeSpace(container, result);
    renderLegend2(container, result);
    container.insertAdjacentHTML("beforeend", `<p class="map-note">With one downward-sloping inverse-demand curve, BP/increased-demand and No BP/reduced-demand are logically inconsistent, so zero-count versions are hidden from the legend. Shaded regions are projected envelopes of the point cloud, not a separate continuous solver.</p>`);
  }

  // src/model/elasticRegions.js
  var ELASTIC_REGION_CLASSES = [
    { key: "BP_RD", label: "BP / reduced demand", paradox: true, demandTrend: "RD", feasible: true },
    { key: "BP_NRD", label: "BP / no demand change", paradox: true, demandTrend: "NRD", feasible: false },
    { key: "BP_ID", label: "BP / increased demand", paradox: true, demandTrend: "ID", feasible: false },
    { key: "NBP_RD", label: "No BP / reduced demand", paradox: false, demandTrend: "RD", feasible: false },
    { key: "NBP_NRD", label: "No BP / no demand change", paradox: false, demandTrend: "NRD", feasible: true },
    { key: "NBP_ID", label: "No BP / increased demand", paradox: false, demandTrend: "ID", feasible: true }
  ];
  var ELASTIC_SLICE_PARAMETERS = [
    { key: "variableCostB", label: "Variable-link coefficient b", min: 4, max: 16 },
    { key: "constantLinkCost", label: "Constant-link cost", min: 20, max: 70 },
    { key: "candidateLinkCost", label: "Added-link free-flow cost", min: 0, max: 30 },
    { key: "candidateLinkB", label: "Added-link congestion b", min: 0, max: 8 },
    { key: "bprAlpha", label: "BPR alpha", min: 0.05, max: 0.6 },
    { key: "capacityScale", label: "Capacity scale", min: 0.5, max: 2 }
  ];
  function gridValues2(min2, max2, steps) {
    const count = Math.max(1, Math.round(Number(steps)));
    if (count === 1)
      return [Number(min2)];
    const start2 = Number(min2);
    const stop = Number(max2);
    const delta = (stop - start2) / (count - 1);
    return Array.from({ length: count }, (_, index2) => start2 + delta * index2);
  }
  function classifyDemandTrend(deltaDemand, tolerance) {
    if (deltaDemand < -tolerance)
      return "RD";
    if (deltaDemand > tolerance)
      return "ID";
    return "NRD";
  }
  function classKey(paradox, demandTrend) {
    return `${paradox ? "BP" : "NBP"}_${demandTrend}`;
  }
  function ceilToStep(value, step) {
    return Math.ceil(Number(value) / step) * step;
  }
  function defaultElasticRegionConfig(inputs = {}) {
    const intercept = Math.max(20, Number(inputs.inverseDemandA) || 90);
    const slope = Math.max(0.5, Number(inputs.inverseDemandB) || 15);
    const aMin = 0;
    const aMax = ceilToStep(Math.max(140, intercept * 1.5), 5);
    const bMin = 0.5;
    const bMax = ceilToStep(Math.max(20, slope * 1.5), 0.5);
    return {
      aMin,
      aMax,
      aSteps: 13,
      bMin,
      bMax,
      bSteps: 11
    };
  }
  function defaultElasticOutcomeSpaceConfig(inputs = {}) {
    const parameter = ELASTIC_SLICE_PARAMETERS[0];
    return {
      ...defaultElasticRegionConfig(inputs),
      zParameter: parameter.key,
      zMin: parameter.min,
      zMax: parameter.max,
      zSteps: 4
    };
  }
  function sliceParameterLabel(key) {
    return ELASTIC_SLICE_PARAMETERS.find((entry) => entry.key === key)?.label ?? key;
  }
  async function runElasticOutcomeSpace({
    networkData,
    inputs,
    config = {},
    onProgress,
    isCancelled
  }) {
    const resolvedConfig = {
      ...defaultElasticOutcomeSpaceConfig(inputs),
      ...config
    };
    const aValues = gridValues2(resolvedConfig.aMin, resolvedConfig.aMax, resolvedConfig.aSteps);
    const bValues = gridValues2(resolvedConfig.bMin, resolvedConfig.bMax, resolvedConfig.bSteps);
    const zValues = gridValues2(resolvedConfig.zMin, resolvedConfig.zMax, resolvedConfig.zSteps);
    const points = [];
    const rows = [];
    const total = aValues.length * bValues.length * zValues.length;
    let completed = 0;
    for (const zValue of zValues) {
      for (const aIntercept of aValues) {
        for (const inverseDemandB of bValues) {
          if (isCancelled?.()) {
            throw new Error("Elastic outcome space cancelled.");
          }
          const trialInputs = applySweepValue({
            ...inputs,
            demandMode: "elastic",
            fixedDemand: aIntercept / Math.max(inverseDemandB, 0.000000001),
            inverseDemandA: aIntercept,
            inverseDemandB
          }, resolvedConfig.zParameter, zValue);
          const preparedNetwork = applyGroupedLinkParameters(networkData, trialInputs);
          const offNetwork = buildScenarioNetwork(preparedNetwork, { ...trialInputs, scenarioMode: "off" });
          const onNetwork = buildScenarioNetwork(preparedNetwork, { ...trialInputs, scenarioMode: "on" });
          const solveOptions = {
            inverseDemand: {
              A: aIntercept,
              B: inverseDemandB
            },
            maxIterations: Number(inputs.maxIterations),
            tolerance: Number(inputs.tolerance),
            maxOuterIterations: Number(inputs.maxOuterIterations),
            quantityTolerance: Number(inputs.quantityTolerance),
            costTolerance: Number(inputs.costTolerance)
          };
          const offResult = solveElasticDemandEquilibrium(offNetwork, solveOptions);
          const onResult = solveElasticDemandEquilibrium(onNetwork, solveOptions);
          const comparison = compareScenarios(offResult, onResult, Number(inputs.classificationTolerance));
          const demandTrend = classifyDemandTrend(comparison.deltaDemand, Number(inputs.classificationTolerance));
          const key = classKey(comparison.paradox, demandTrend);
          const point = {
            inverseDemandA: aIntercept,
            inverseDemandB,
            zParameter: resolvedConfig.zParameter,
            zParameterLabel: sliceParameterLabel(resolvedConfig.zParameter),
            zValue,
            initialTrips: aIntercept / Math.max(inverseDemandB, 0.000000001),
            offDemand: offResult.quantity,
            onDemand: onResult.quantity,
            offCost: offResult.equilibriumCost,
            onCost: onResult.equilibriumCost,
            deltaCost: comparison.deltaCost,
            deltaDemand: comparison.deltaDemand,
            paradox: comparison.paradox ? 1 : 0,
            demandTrend,
            classKey: key
          };
          points.push(point);
          rows.push(point);
          completed += 1;
          onProgress?.({
            completed,
            total,
            fraction: completed / total
          });
          await Promise.resolve();
        }
      }
    }
    return {
      mode: "outcomeSpace",
      config: resolvedConfig,
      aValues,
      bValues,
      zValues,
      zParameterLabel: sliceParameterLabel(resolvedConfig.zParameter),
      points,
      rows,
      classes: ELASTIC_REGION_CLASSES
    };
  }

  // src/app.js
  function normalizeInputs(rawInputs) {
    const numeric = (key, fallback = DEFAULT_INPUTS[key]) => {
      const parsed = Number(rawInputs[key]);
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    return {
      ...DEFAULT_INPUTS,
      ...rawInputs,
      fixedDemand: numeric("fixedDemand"),
      variableBaseCost: numeric("variableBaseCost"),
      variableCostB: numeric("variableCostB"),
      constantLinkCost: numeric("constantLinkCost"),
      candidateLinkCost: numeric("candidateLinkCost"),
      candidateLinkB: numeric("candidateLinkB", 0),
      inverseDemandA: numeric("inverseDemandA"),
      inverseDemandB: numeric("inverseDemandB"),
      bprAlpha: numeric("bprAlpha"),
      bprBeta: numeric("bprBeta"),
      capacityScale: numeric("capacityScale"),
      maxIterations: numeric("maxIterations"),
      tolerance: numeric("tolerance"),
      maxOuterIterations: numeric("maxOuterIterations"),
      quantityTolerance: numeric("quantityTolerance"),
      costTolerance: numeric("costTolerance"),
      classificationTolerance: numeric("classificationTolerance")
    };
  }
  function syncElasticDemandInputs(inputs, changedKey = "") {
    if (inputs.demandMode !== DEMAND_MODE.ELASTIC) {
      return inputs;
    }
    const safePositive = (value, fallback) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    };
    const inverseDemandA = safePositive(inputs.inverseDemandA, DEFAULT_INPUTS.inverseDemandA);
    const fixedDemand = safePositive(inputs.fixedDemand, DEFAULT_INPUTS.fixedDemand);
    const inverseDemandB = safePositive(inputs.inverseDemandB, inverseDemandA / fixedDemand);
    if (changedKey === "inverseDemandB") {
      return {
        ...inputs,
        inverseDemandA,
        inverseDemandB,
        fixedDemand: inverseDemandA / inverseDemandB
      };
    }
    return {
      ...inputs,
      inverseDemandA,
      fixedDemand,
      inverseDemandB: inverseDemandA / fixedDemand
    };
  }
  function normalizeSweep(rawSweep) {
    return {
      ...DEFAULT_SWEEP,
      ...rawSweep,
      xMin: Number(rawSweep.xMin),
      xMax: Number(rawSweep.xMax),
      xSteps: Number(rawSweep.xSteps),
      yMin: Number(rawSweep.yMin),
      yMax: Number(rawSweep.yMax),
      ySteps: Number(rawSweep.ySteps)
    };
  }
  function normalizeElasticMap(rawElasticMap) {
    const numeric = (key, fallback = DEFAULT_ELASTIC_MAP[key]) => {
      const parsed = Number(rawElasticMap[key]);
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    return {
      ...DEFAULT_ELASTIC_MAP,
      ...rawElasticMap,
      aMin: numeric("aMin"),
      aMax: numeric("aMax"),
      aSteps: Math.max(2, Math.min(30, Math.round(numeric("aSteps")))),
      bMin: numeric("bMin"),
      bMax: numeric("bMax"),
      bSteps: Math.max(2, Math.min(30, Math.round(numeric("bSteps")))),
      zMin: numeric("zMin"),
      zMax: numeric("zMax"),
      zSteps: Math.max(1, Math.min(12, Math.round(numeric("zSteps"))))
    };
  }
  function scenarioSummary(state, scenarioMode) {
    const result = state.scenarioResults[scenarioMode];
    return result ?? null;
  }
  function getSelectedLink(state) {
    if (!state.networkData)
      return null;
    return state.networkData.links.find((link) => String(link.id) === String(state.selectedLinkId)) ?? listCandidateLinks(state.networkData)[0] ?? state.networkData.links[0] ?? null;
  }
  function getSelectedNode(state) {
    if (!state.networkData)
      return null;
    return state.networkData.nodes.find((node) => String(node.id) === String(state.selectedNodeId)) ?? null;
  }
  function selectionDetailHtml(selectedLink, selectedNode) {
    if (selectedLink) {
      return [
        `from ${selectedLink.fromNodeId} to ${selectedLink.toNodeId}`,
        `lanes ${Number(selectedLink.lanes) || 0}, capacity ${Number(selectedLink.capacity) || 0}`,
        `length ${Number(selectedLink.length) || 0}, free speed ${Number(selectedLink.freeSpeed) || 0}`,
        `cost: ${describeCostFunction(selectedLink)}`
      ].map((line) => `<div>${line}</div>`).join("");
    }
    if (selectedNode) {
      return [
        `zone ${selectedNode.zoneId ?? "—"}, type ${selectedNode.nodeType ?? "intersection"}`,
        `x ${Number(selectedNode.x).toFixed(2)}, y ${Number(selectedNode.y).toFixed(2)}`
      ].map((line) => `<div>${line}</div>`).join("");
    }
    return `<div>Select a node or link to inspect its properties.</div>`;
  }
  function solveScenario2(networkData, inputs, scenarioMode) {
    const network = buildScenarioNetwork(networkData, {
      ...inputs,
      scenarioMode
    });
    if (inputs.demandMode === DEMAND_MODE.ELASTIC) {
      return solveElasticDemandEquilibrium(network, {
        inverseDemand: {
          A: inputs.inverseDemandA,
          B: inputs.inverseDemandB
        },
        maxIterations: inputs.maxIterations,
        tolerance: inputs.tolerance,
        maxOuterIterations: inputs.maxOuterIterations,
        quantityTolerance: inputs.quantityTolerance,
        costTolerance: inputs.costTolerance
      });
    }
    return solveFixedDemandEquilibrium(network, {
      demand: inputs.fixedDemand,
      maxIterations: inputs.maxIterations,
      tolerance: inputs.tolerance,
      inverseDemand: {
        A: inputs.inverseDemandA,
        B: inputs.inverseDemandB
      }
    });
  }
  function solveFixedReferenceScenario(networkData, inputs, scenarioMode) {
    const network = buildScenarioNetwork(networkData, {
      ...inputs,
      scenarioMode
    });
    return solveFixedDemandEquilibrium(network, {
      demand: inputs.fixedDemand,
      maxIterations: inputs.maxIterations,
      tolerance: inputs.tolerance,
      inverseDemand: {
        A: inputs.inverseDemandA,
        B: inputs.inverseDemandB
      }
    });
  }
  function exportCsv(filename, rows) {
    const header = Object.keys(rows[0] ?? {});
    const body = rows.map((row) => header.map((key) => row[key]).join(",")).join(`
`);
    const blob = new Blob([`${header.join(",")}
${body}
`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
  function exportSvg(filename, svgElement) {
    if (!svgElement)
      return;
    const blob = new Blob([svgElement.outerHTML], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
  function exportSvgAsPng(filename, svgElement) {
    if (!svgElement)
      return;
    const data = new XMLSerializer().serializeToString(svgElement);
    const image = new Image;
    const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const viewBox = svgElement.viewBox.baseVal;
      canvas.width = viewBox.width || 1200;
      canvas.height = viewBox.height || 600;
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        const pngUrl = URL.createObjectURL(pngBlob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(pngUrl);
      });
    };
    image.src = url;
  }
  function buildModelDetails(state) {
    const inputs = state.inputs;
    return `
    <p>This app solves a one-origin, one-destination static user-equilibrium problem with Method of Successive Averages. In fixed-trip mode it keeps demand constant. In elastic-trip mode it wraps the same solver in an outer search until route cost matches the inverse-demand curve C(q) = A - Bq.</p>
    <p>The built-in preset uses normalized demand units for a research toy. A default value of 6 means 6 equal demand packets, not 6 literal vehicles. The demand-curve chart makes that scaling visible through its X and Y intercepts.</p>
    <p>Affine links use t(x) = a + bx. BPR links use t(x) = t0 * (1 + alpha * (x / capacity)^beta), with t0 taken from the positive t0 override when present, otherwise from GMNS length / free speed.</p>
    <p>The Braess test is simple: the added link counts as harmful only if equilibrium cost with the link is higher than equilibrium cost without it by more than ${inputs.classificationTolerance}. The reduced-demand test asks whether that higher-cost case also carries fewer trips.</p>
    <p>Current settings: MSA tolerance ${inputs.tolerance}, MSA iterations ${inputs.maxIterations}, outer iterations ${inputs.maxOuterIterations}, quantity tolerance ${inputs.quantityTolerance}, cost tolerance ${inputs.costTolerance}. These are numerical results, not closed-form exact solutions.</p>
  `;
  }
  function syncSelections(elements, state) {
    const demandOptions = state.networkData ? listDemandPairs(state.networkData).map((row) => ({ value: row.key, label: row.label })) : [{ value: "", label: "Load a network first" }];
    populateSelect(elements.fieldInputs.find((input) => input.dataset.field === "selectedDemandKey"), demandOptions, state.inputs.selectedDemandKey || demandOptions[0]?.value);
    const candidateOptions = state.networkData ? listCandidateLinks(state.networkData).map((link) => ({ value: link.id, label: `${link.id}: ${link.label}` })) : [{ value: "", label: "Load a network first" }];
    populateSelect(elements.fieldInputs.find((input) => input.dataset.field === "selectedCandidateLinkId"), candidateOptions, state.inputs.selectedCandidateLinkId || candidateOptions[0]?.value);
    const parameterOptions = SWEEP_PARAMETERS.map((option) => ({ value: option.key, label: option.label }));
    populateSelect(elements.sweepInputs.find((input) => input.dataset.sweep === "xParameter"), parameterOptions, state.sweep.xParameter);
    populateSelect(elements.sweepInputs.find((input) => input.dataset.sweep === "yParameter"), parameterOptions, state.sweep.yParameter);
  }
  function installControlAccordion(elements) {
    elements.controlCards.forEach((card) => {
      card.addEventListener("toggle", () => {
        if (!card.open)
          return;
        elements.controlCards.forEach((other) => {
          if (other !== card) {
            other.open = false;
          }
        });
      });
    });
  }
  function createApp(root2) {
    const elements = renderLayout(root2);
    installControlAccordion(elements);
    const store = createStore(createInitialState());
    const sweepController = { cancelled: false };
    function render() {
      const state = store.get();
      const selectedLink = getSelectedLink(state);
      const selectedNode = getSelectedNode(state);
      writeFormValues(elements, state);
      syncSelections(elements, state);
      const isElasticDemand = state.inputs.demandMode === DEMAND_MODE.ELASTIC;
      elements.elasticDemandControls.forEach((control) => {
        control.hidden = !isElasticDemand;
        control.querySelectorAll("input, select").forEach((input) => {
          input.disabled = !isElasticDemand;
        });
      });
      elements.status.textContent = state.status;
      elements.error.textContent = state.error;
      elements.progress.textContent = state.sweepProgress ? `Sweep progress: ${(100 * state.sweepProgress.fraction).toFixed(1)}%` : "";
      elements.editSelection.textContent = selectedLink ? `Selected link ${selectedLink.id}: ${selectedLink.label}` : selectedNode ? `Selected node ${selectedNode.id}: ${selectedNode.label}` : "Select a link or node on the map.";
      elements.selectionDetails.innerHTML = selectionDetailHtml(selectedLink, selectedNode);
      elements.editLinkLanes.value = selectedLink ? String(Math.max(0, Number(selectedLink.lanes) || 0)) : "";
      elements.editLinkCapacity.value = selectedLink ? String(Math.max(0, Number(selectedLink.capacity) || 0)) : "";
      elements.editLinkLength.value = selectedLink ? String(Math.max(0, Number(selectedLink.length) || 0)) : "";
      elements.editLinkFreeSpeed.value = selectedLink ? String(Math.max(0, Number(selectedLink.freeSpeed) || 0)) : "";
      elements.editLinkFunction.value = selectedLink ? String(selectedLink.costFunctionType || "affine") : "affine";
      elements.editLinkCostA.value = selectedLink ? String(Number(selectedLink.costA) || 0) : "";
      elements.editLinkCostB.value = selectedLink ? String(Number(selectedLink.costB) || 0) : "";
      elements.editLinkBprAlpha.value = selectedLink ? String(Number(selectedLink.bprAlpha) || 0.15) : "";
      elements.editLinkBprBeta.value = selectedLink ? String(Number(selectedLink.bprBeta) || 4) : "";
      elements.editLinkLanes.disabled = !selectedLink;
      elements.editLinkCapacity.disabled = !selectedLink;
      elements.editLinkLength.disabled = !selectedLink;
      elements.editLinkFreeSpeed.disabled = !selectedLink;
      elements.editLinkFunction.disabled = !selectedLink;
      elements.editLinkCostA.disabled = !selectedLink;
      elements.editLinkCostB.disabled = !selectedLink;
      elements.editLinkBprAlpha.disabled = !selectedLink;
      elements.editLinkBprBeta.disabled = !selectedLink;
      renderComparisonTable(elements.comparisonTable, state.scenarioResults.off, state.scenarioResults.on, state.comparison, state.inputs.demandMode, state.inputs, state.modeComparison);
      renderConvergenceChart(elements.convergenceChart, scenarioSummary(state, state.viewScenario));
      renderDemandCurveChart(elements.demandCurve, state.inputs, handleDemandCurveChange);
      renderSliceChart(elements.sliceChart, state.sweepResult);
      renderHeatmap(elements.heatmap, state.sweepResult, state.sweep);
      renderElasticRegionMap(elements.elasticRegionMap, state.elasticRegionMap);
      renderBatchTable(elements.batchTable, state.sweepResult);
      renderNetworkView(elements.network, state.networkData, scenarioSummary(state, state.viewScenario), {
        scenarioMode: state.viewScenario,
        selectedCandidateLinkId: state.inputs.selectedCandidateLinkId,
        selectedLinkId: state.selectedLinkId,
        selectedNodeId: state.selectedNodeId,
        onNodePositionChange: handleNodePositionChange,
        onNodeGeometryPreview: handleNodeGeometryPreview,
        onLinkSelect: handleLinkSelect,
        onNodeSelect: handleNodeSelect
      });
      elements.modelDetails.innerHTML = buildModelDetails(state);
    }
    function captureForms() {
      const { inputs: rawInputs, sweep: rawSweep, elasticMap: rawElasticMap } = readFormValues(elements);
      return {
        inputs: normalizeInputs(rawInputs),
        sweep: normalizeSweep(rawSweep),
        elasticMap: normalizeElasticMap(rawElasticMap)
      };
    }
    function updateFormsIntoState(sourceInput = null) {
      const { inputs, sweep, elasticMap } = captureForms();
      const changedField = sourceInput?.dataset.field ?? "";
      const changedElasticMap = sourceInput?.dataset.elasticMap ?? "";
      const syncedInputs = syncElasticDemandInputs(inputs, changedField);
      const modelInputChanged = Boolean(changedField && changedField !== "viewScenario");
      store.update((state) => ({
        ...state,
        inputs: {
          ...state.inputs,
          ...syncedInputs,
          selectedDemandKey: syncedInputs.selectedDemandKey,
          selectedCandidateLinkId: syncedInputs.selectedCandidateLinkId
        },
        sweep,
        elasticMap,
        viewScenario: syncedInputs.viewScenario || state.viewScenario,
        ...modelInputChanged || changedElasticMap ? {
          scenarioResults: { off: null, on: null },
          comparison: null,
          modeComparison: null,
          elasticRegionMap: null
        } : {}
      }));
    }
    function handleNodePositionChange(nodeId, position) {
      store.update((state) => {
        if (!state.networkData)
          return state;
        const networkData = cloneNetworkData(state.networkData);
        networkData.nodes = networkData.nodes.map((node) => String(node.id) === String(nodeId) ? { ...node, x: position.x, y: position.y } : node);
        const nodeById = new Map(networkData.nodes.map((node) => [String(node.id), node]));
        networkData.links = networkData.links.map((link) => String(link.fromNodeId) === String(nodeId) || String(link.toNodeId) === String(nodeId) ? { ...link, length: computeLinkGeometryLength(link, nodeById) } : link);
        return {
          ...state,
          networkData,
          scenarioResults: { off: null, on: null },
          comparison: null,
          modeComparison: null,
          elasticRegionMap: null,
          status: "Moved node and updated connected link lengths. Re-run the model to refresh results."
        };
      });
    }
    function handleNodeGeometryPreview(nodeId, preview) {
      const state = store.get();
      const selectedPreviewLink = preview.links?.find((link) => String(link.id) === String(state.selectedLinkId)) ?? null;
      const selectedPreviewNode = preview.node;
      if (selectedPreviewLink) {
        elements.selectionDetails.innerHTML = selectionDetailHtml(selectedPreviewLink, null);
        elements.editLinkLength.value = String(Math.max(0, Number(selectedPreviewLink.length) || 0));
      } else if (selectedPreviewNode) {
        elements.editSelection.textContent = `Selected node ${selectedPreviewNode.id}: ${selectedPreviewNode.label}`;
        elements.selectionDetails.innerHTML = selectionDetailHtml(null, selectedPreviewNode);
      }
    }
    function handleLinkSelect(linkId) {
      store.update((state) => ({
        ...state,
        selectedLinkId: String(linkId),
        selectedNodeId: "",
        status: `Selected link ${linkId} for editing.`,
        error: ""
      }));
    }
    function handleNodeSelect(nodeId) {
      store.update((state) => ({
        ...state,
        selectedNodeId: String(nodeId),
        selectedLinkId: "",
        status: `Selected node ${nodeId} for inspection.`,
        error: ""
      }));
    }
    function handleDemandCurveChange(nextValues) {
      store.update((state) => ({
        ...state,
        inputs: {
          ...state.inputs,
          inverseDemandA: nextValues.inverseDemandA ?? state.inputs.inverseDemandA,
          inverseDemandB: nextValues.inverseDemandB ?? state.inputs.inverseDemandB,
          fixedDemand: nextValues.fixedDemand ?? state.inputs.fixedDemand
        },
        scenarioResults: { off: null, on: null },
        comparison: null,
        modeComparison: null,
        elasticRegionMap: null,
        status: nextValues.fixedDemand !== undefined ? `Initial trips updated to ${nextValues.fixedDemand.toFixed(2)}.` : `Demand curve updated: A ${nextValues.inverseDemandA.toFixed(2)}, B ${nextValues.inverseDemandB.toFixed(4)}.`,
        error: ""
      }));
    }
    function installNetwork(networkData, status) {
      const demandKey = networkData.demandRows[0]?.key ?? "";
      const candidateLinkId = listCandidateLinks(networkData)[0]?.id ?? "";
      const selectedLinkId = String(candidateLinkId || networkData.links[0]?.id || "");
      store.update((state) => ({
        ...state,
        networkData,
        selectedLinkId,
        selectedNodeId: "",
        inputs: {
          ...state.inputs,
          selectedDemandKey: demandKey,
          selectedCandidateLinkId: String(candidateLinkId)
        },
        scenarioResults: { off: null, on: null },
        comparison: null,
        modeComparison: null,
        elasticRegionMap: null,
        sweepResult: null,
        status,
        error: ""
      }));
    }
    function handleApplyLinkEdit() {
      const state = store.get();
      const selectedLink = getSelectedLink(state);
      if (!state.networkData || !selectedLink)
        return;
      const lanes = Math.max(0, Math.round(Number(elements.editLinkLanes.value)));
      const capacity = Math.max(0, Number(elements.editLinkCapacity.value));
      const length = Math.max(0, Number(elements.editLinkLength.value));
      const freeSpeed = Math.max(0, Number(elements.editLinkFreeSpeed.value));
      const costA = Number(elements.editLinkCostA.value);
      const costB = Number(elements.editLinkCostB.value);
      const bprAlpha = Number(elements.editLinkBprAlpha.value);
      const bprBeta = Number(elements.editLinkBprBeta.value);
      const costFunctionType = elements.editLinkFunction.value === "bpr" ? "bpr" : "affine";
      if (!Number.isFinite(lanes) || !Number.isFinite(capacity) || !Number.isFinite(length) || !Number.isFinite(freeSpeed) || !Number.isFinite(costA) || !Number.isFinite(costB) || !Number.isFinite(bprAlpha) || !Number.isFinite(bprBeta)) {
        store.update((current) => ({
          ...current,
          error: "Enter valid lanes, capacity, length, free speed, and link performance values before applying the edit."
        }));
        return;
      }
      const networkData = cloneNetworkData(state.networkData);
      const nodeById = new Map(networkData.nodes.map((node) => [String(node.id), node]));
      networkData.links = networkData.links.map((link) => String(link.id) === String(selectedLink.id) ? (() => {
        const from = nodeById.get(String(link.fromNodeId));
        const to = nodeById.get(String(link.toNodeId));
        const currentGeometryDistance = from && to ? Math.hypot(Number(to.x) - Number(from.x), Number(to.y) - Number(from.y)) : Number(link.geometryBaseDistance) || 1;
        return {
          ...link,
          lanes,
          capacity,
          length,
          freeSpeed,
          enabled: lanes > 0 && capacity > 0,
          costFunctionType,
          costA,
          costB,
          bprAlpha,
          bprBeta,
          geometryBaseLength: length,
          geometryBaseDistance: currentGeometryDistance
        };
      })() : link);
      store.update((current) => ({
        ...current,
        networkData,
        scenarioResults: { off: null, on: null },
        comparison: null,
        modeComparison: null,
        elasticRegionMap: null,
        status: `Updated link ${selectedLink.id}: lanes ${lanes}, capacity ${capacity}, length ${length}, free speed ${freeSpeed}, ${costFunctionType} LPF.`,
        error: ""
      }));
    }
    function handleCloseSelectedLink() {
      const state = store.get();
      const selectedLink = getSelectedLink(state);
      if (!state.networkData || !selectedLink)
        return;
      const networkData = cloneNetworkData(state.networkData);
      networkData.links = networkData.links.map((link) => String(link.id) === String(selectedLink.id) ? {
        ...link,
        lanes: 0,
        capacity: 0,
        enabled: false
      } : link);
      store.update((current) => ({
        ...current,
        networkData,
        scenarioResults: { off: null, on: null },
        comparison: null,
        modeComparison: null,
        elasticRegionMap: null,
        status: `Link ${selectedLink.id} is now closed with zero lanes and zero capacity.`,
        error: ""
      }));
    }
    async function handleLoadPreset() {
      store.update((state) => ({ ...state, status: "Loading the Braess example...", error: "" }));
      try {
        const networkData = await loadBraessPreset();
        installNetwork(networkData, "Braess example loaded.");
      } catch (error) {
        store.update((state) => ({ ...state, error: error.message, status: "Could not load the Braess example." }));
      }
    }
    function handleSolveScenario(scenarioMode) {
      updateFormsIntoState();
      const state = store.get();
      if (!state.networkData)
        return;
      try {
        const result = solveScenario2(state.networkData, state.inputs, scenarioMode);
        store.update((current) => ({
          ...current,
          scenarioResults: {
            ...current.scenarioResults,
            [scenarioMode]: result
          },
          modeComparison: null,
          viewScenario: scenarioMode,
          status: result.zeroDemandReason ? `Solved ${scenarioMode === "off" ? "without" : "with"} the added link, but elastic demand is zero: ${result.zeroDemandReason}` : scenarioMode === "off" ? "Solved the case without the added link." : "Solved the case with the added link.",
          error: ""
        }));
      } catch (error) {
        store.update((current) => ({ ...current, error: error.message, status: "The solve step failed." }));
      }
    }
    function handleCompare() {
      updateFormsIntoState();
      const state = store.get();
      if (!state.networkData)
        return;
      try {
        const off = solveScenario2(state.networkData, state.inputs, "off");
        const on = solveScenario2(state.networkData, state.inputs, "on");
        const comparison = compareScenarios(off, on, state.inputs.classificationTolerance);
        const modeComparison = state.inputs.demandMode === DEMAND_MODE.ELASTIC ? {
          offFixed: solveFixedReferenceScenario(state.networkData, state.inputs, "off"),
          onFixed: solveFixedReferenceScenario(state.networkData, state.inputs, "on")
        } : null;
        store.update((current) => ({
          ...current,
          scenarioResults: { off, on },
          comparison,
          modeComparison,
          status: off.zeroDemandReason || on.zeroDemandReason ? "Both cases solved, but elastic demand is zero in at least one scenario because the demand curve intercept is too low." : comparison.paradox ? "Both cases solved. Adding the link makes equilibrium cost worse." : "Both cases solved. Adding the link does not make equilibrium cost worse.",
          error: ""
        }));
      } catch (error) {
        store.update((current) => ({ ...current, error: error.message, status: "The comparison step failed." }));
      }
    }
    async function handleRunSweep() {
      updateFormsIntoState();
      const state = store.get();
      if (!state.networkData)
        return;
      sweepController.cancelled = false;
      store.update((current) => ({
        ...current,
        sweepRunning: true,
        sweepProgress: { fraction: 0, completed: 0, total: 1 },
        status: "Running the parameter sweep...",
        error: ""
      }));
      try {
        const result = await runParameterSweep({
          networkData: state.networkData,
          inputs: state.inputs,
          sweepConfig: state.sweep,
          onProgress(progress) {
            store.update((current) => ({
              ...current,
              sweepProgress: progress
            }));
          },
          isCancelled() {
            return sweepController.cancelled;
          }
        });
        store.update((current) => ({
          ...current,
          sweepResult: result,
          sweepRunning: false,
          sweepProgress: null,
          status: `Sweep finished with ${result.rows.length} grid cells.`
        }));
      } catch (error) {
        const cancelled = sweepController.cancelled;
        store.update((current) => ({
          ...current,
          sweepRunning: false,
          sweepProgress: null,
          status: cancelled ? "Sweep cancelled." : "The sweep failed.",
          error: cancelled ? "" : error.message
        }));
      }
    }
    async function handleRunElasticMap() {
      updateFormsIntoState();
      const state = store.get();
      if (!state.networkData)
        return;
      const gridPoints = state.elasticMap.aSteps * state.elasticMap.bSteps * state.elasticMap.zSteps;
      sweepController.cancelled = false;
      store.update((current) => ({
        ...current,
        sweepRunning: true,
        sweepProgress: { fraction: 0, completed: 0, total: 1 },
        status: `Drawing ${gridPoints} A-B-Z points, with OFF and ON equilibrium solves at each point. This can take a moment.`,
        error: ""
      }));
      try {
        const result = await runElasticOutcomeSpace({
          networkData: state.networkData,
          inputs: state.inputs,
          config: state.elasticMap,
          onProgress(progress) {
            store.update((current) => ({
              ...current,
              sweepProgress: progress
            }));
          },
          isCancelled() {
            return sweepController.cancelled;
          }
        });
        store.update((current) => ({
          ...current,
          elasticRegionMap: result,
          sweepRunning: false,
          sweepProgress: null,
          status: `Elastic-demand outcome space finished with ${result.rows.length} assumption points.`
        }));
      } catch (error) {
        const cancelled = sweepController.cancelled;
        store.update((current) => ({
          ...current,
          sweepRunning: false,
          sweepProgress: null,
          status: cancelled ? "Elastic-demand map cancelled." : "The elastic-demand map failed.",
          error: cancelled ? "" : error.message
        }));
      }
    }
    function handleCancelSweep() {
      sweepController.cancelled = true;
      store.update((state) => ({
        ...state,
        status: "Cancelling the sweep..."
      }));
    }
    bindControls(elements, {
      "load-preset": handleLoadPreset,
      "apply-link-edit": handleApplyLinkEdit,
      "close-link": handleCloseSelectedLink,
      "solve-off": () => handleSolveScenario("off"),
      "solve-on": () => handleSolveScenario("on"),
      compare: handleCompare,
      "run-sweep": handleRunSweep,
      "run-elastic-map": handleRunElasticMap,
      "cancel-sweep": handleCancelSweep,
      "export-csv": () => {
        const { sweepResult } = store.get();
        if (sweepResult?.rows?.length) {
          exportCsv("braess-sweep-results.csv", sweepResult.rows);
        }
      },
      "export-svg": () => {
        exportSvg("braess-heatmap.svg", elements.heatmap.querySelector("svg"));
      },
      "export-png": () => {
        exportSvgAsPng("braess-heatmap.png", elements.heatmap.querySelector("svg"));
      }
    });
    [...elements.fieldInputs, ...elements.sweepInputs, ...elements.elasticMapInputs].forEach((input) => {
      input.addEventListener("input", () => {
        updateFormsIntoState(input);
      });
      input.addEventListener("change", () => {
        updateFormsIntoState(input);
      });
    });
    store.subscribe(render);
    render();
    handleLoadPreset();
  }

  // src/main.js
  createApp(document.getElementById("app"));
})();
