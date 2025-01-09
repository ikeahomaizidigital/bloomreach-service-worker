!(function () {
  "use strict";
  /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */ const t =
    "xnpe_force_track";
  const e = "SDK",
    n = new (class {
      constructor(t, e) {
        (this.console = t), (this.logPrefix = e);
      }
      getMessagePrefix() {
        const t = new Date().toUTCString();
        return `${this.logPrefix} [${t}]`;
      }
      error(...t) {
        this.print("error", t);
      }
      log(...t) {
        this.print("log", t);
      }
      warn(...t) {
        this.print("warn", t);
      }
      debug(...t) {
        this.print("debug", t);
      }
      print(t, e) {
        this.isConsoleSupported(t) &&
          0 !== e.length &&
          ("string" == typeof e[0]
            ? (e[0] = `${this.getMessagePrefix()} ${e[0]}`)
            : e.unshift(this.getMessagePrefix()),
          this.console[t](...e));
      }
      isConsoleSupported(t) {
        return void 0 !== this.console && "function" == typeof this.console[t];
      }
    })(console, "SDK");
  function i(t, e, n = !1) {
    return (
      (i = this),
      (r = function* () {
        if (!n && !e.has_tracking_consent) return;
        let i = "campaign",
          o = {};
        if (e) {
          if (null === e.event_type) return;
          e.event_type && (i = e.event_type),
            e.event_properties && (o = e.event_properties);
        }
        (o.status = t), n && (o.tracking_forced = !0);
        const r = {
          commands: [
            {
              name: "crm/events",
              data: {
                customer_ids: e.customer_ids,
                company_id: e.project_id,
                type: i,
                age: 0.1,
                properties: o,
                timestamp: Date.now() / 1e3,
              },
            },
          ],
        };
        return fetch(e.tracking_endpoint + "/bulk", {
          method: "post",
          headers: { "Content-type": "text/plain;charset=UTF-8" },
          mode: "no-cors",
          body: JSON.stringify(r),
        });
      }),
      new ((o = void 0) || (o = Promise))(function (t, e) {
        function n(t) {
          try {
            a(r.next(t));
          } catch (t) {
            e(t);
          }
        }
        function s(t) {
          try {
            a(r.throw(t));
          } catch (t) {
            e(t);
          }
        }
        function a(e) {
          e.done
            ? t(e.value)
            : new o(function (t) {
                t(e.value);
              }).then(n, s);
        }
        a((r = r.apply(i, [])).next());
      })
    );
    var i, o, r;
  }
  self.addEventListener("push", function (t) {
    var e;
    if (!t.data) return;
    const n = t.data.json();
    (n.data = null !== (e = n.data) && void 0 !== e ? e : {}),
      n.message && (n.body = n.message),
      n.url && (n.data.url = n.url),
      n.event_type && ((n.data.event_type = n.event_type), delete n.event_type),
      n.event_properties &&
        ((n.data.event_properties = n.event_properties),
        delete n.event_properties);
    const o = n.consent_category_tracking;
    o &&
      (n.data.event_properties || (n.data.event_properties = {}),
      (n.data.event_properties.consent_category_tracking = o)),
      (n.data.customer_ids = n.customer_ids),
      (n.data.project_id = n.project_id),
      (n.data.tracking_endpoint = n.tracking_endpoint),
      (n.data.has_tracking_consent = !1 !== n.has_tracking_consent),
      t.waitUntil(
        Promise.all([
          self.registration.showNotification(n.title, n),
          i("delivered", n.data),
        ])
      );
  }),
    self.addEventListener("notificationclick", function (e) {
      var o;
      e.notification.close();
      let r = "";
      e.action
        ? (r = e.action)
        : (null === (o = e.notification.data) || void 0 === o
            ? void 0
            : o.url) && (r = e.notification.data.url);
      let s = Promise.resolve(),
        a = !1;
      r &&
        ((s = clients.openWindow(r)),
        (a = (function (e, n) {
          var i;
          "string" != typeof e &&
            n.debug(`Unable to parse query parameters from "${e}"`);
          const o = e.split("?");
          if (o.length < 2) return !1;
          try {
            const e =
              null === (i = new URLSearchParams(o[1]).get(t)) || void 0 === i
                ? void 0
                : i.toLowerCase();
            return "true" === e || "1" === e || "" === e;
          } catch (e) {
            return (
              n.debug(`Unable to get the ${t} query parameter from "${o[1]}"`),
              !1
            );
          }
        })(r, n))),
        e.waitUntil(Promise.all([s, i("clicked", e.notification.data, a)]));
    }),
    self.addEventListener("notificationclose", function (t) {
      t.waitUntil(i("closed", t.notification.data));
    }),
    self.addEventListener("fetch", function (t) {
      if (
        "GET" !== (n = t.request).method ||
        !/\/script\/[a-zA-Z0-9\-]+\/[a-zA-Z0-9\-]+\/modifications(\.min)?\.js/.test(
          n.url
        )
      )
        return;
      var n;
      const i = new Promise(function (n, i) {
        const o = t.request.url,
          r = o.indexOf("?");
        if (r > 1) {
          const s = (function (t) {
            const e = t.find((t) => t.startsWith("timeout"));
            if (e) {
              const [t, n] = e.split("=");
              if (n) {
                const t = n.replace("ms", "");
                if (!!t.match(/\d+/)) {
                  return parseInt(t, 10);
                }
              }
            }
            return null;
          })(o.slice(r + 1).split("&"));
          if (s) {
            const o = setTimeout(
              (function (t, n) {
                return function () {
                  const i = new Response(
                    `console.warn('[${e}] Synchronous modifications script timed out after ${n}ms, using async modifications.')`,
                    { status: 200, statusText: "OK" }
                  );
                  return t(i);
                };
              })(n, s),
              s
            );
            fetch(t.request).then(
              function (t) {
                clearTimeout(o), n(t);
              },
              function (t) {
                clearTimeout(o), i(t);
              }
            );
          } else
            fetch(t.request).then(
              (t) => n(t),
              (t) => i(t)
            );
        } else
          fetch(t.request).then(
            (t) => n(t),
            (t) => i(t)
          );
      });
      return t.respondWith(i);
    });
})();
//# sourceMappingURL=service-worker.min.js.map
