"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* global DEBUG */
const got = require("got");
const stream_1 = require("stream");
var MIME;
(function (MIME) {
    MIME["json"] = "application/json";
    MIME["form"] = "application/x-www-form-urlencoded";
})(MIME || (MIME = {}));
let uniqueID = Date.now();
function getUniqueID() {
    return ++uniqueID;
}
const isFn = (f) => typeof f === 'function';
function createRequest({ method, beforeRequest, afterResponse, error, retry = 0 }) {
    return function request({ url, options, body, headers, type, handleError = true }) {
        const hooks = {};
        const reqID = getUniqueID();
        let $options;
        if (options) {
            $options = {
                ...options,
                method
            };
        }
        else {
            $options = {
                method,
                body,
                headers,
                retry
            };
            if (Array.isArray(beforeRequest)) {
                hooks.beforeRequest = beforeRequest.map(hook => (hookOptions) => hook(hookOptions, reqID));
            }
            if (Array.isArray(afterResponse)) {
                hooks.afterResponse = afterResponse;
            }
            $options.hooks = hooks;
            if (type && type !== 'json' && type !== 'form') {
                $options.headers ? $options.headers['Content-Type'] = type : $options.headers = {
                    'Content-Type': type
                };
            }
            else if ((body instanceof Buffer || body instanceof stream_1.Readable) && (type === 'form' || type === 'json')) {
                $options.headers ? $options.headers['Content-Type'] = MIME[type] : $options.headers = {
                    'Content-Type': MIME[type]
                };
            }
            else if (type === 'json') {
                $options.json = true;
            }
            else if (type === 'form') {
                $options.form = true;
            }
        }
        const p = got(url, $options);
        if (isFn(error) && handleError) {
            // 穿透
            let $err = null;
            p.catch((err) => {
                $err = err;
                const req = (opts) => got(url, opts);
                req.id = reqID;
                return error(err, $options, req);
            })
                .then((result) => {
                if (result === false || result === undefined) {
                    return Promise.reject($err);
                }
                else {
                    return result;
                }
            });
        }
        return p;
    };
}
/**
 * { beforeSend, afterResponse, retry }
 */
function default_1(opts = {}) {
    return ['get', 'head', 'post', 'put', 'patch', 'delete', 'options']
        .reduce((prev, cur) => (prev[cur] = createRequest({
        ...opts,
        method: cur.toUpperCase()
    }), prev), {});
}
exports.default = default_1;
//# sourceMappingURL=index.js.map