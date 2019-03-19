/* global DEBUG */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const got = require("got");
const stream_1 = require("stream");
var MIME;
(function (MIME) {
    MIME["json"] = "application/json";
    MIME["form"] = "application/x-www-form-urlencoded";
})(MIME || (MIME = {}));
function request({ url, method, type, data, retry = 0, options = {}, beforeRequest, afterResponse }) {
    const hooks = {};
    if (data instanceof Buffer || data instanceof stream_1.Readable) {
        options.body = data;
        if (MIME[type]) {
            options.headers = {
                'Content-Type': MIME[type]
            };
        }
    }
    else if (data) {
        options.body = data;
        if (type === 'json') {
            options.json = true;
        }
        else if (type === 'form') {
            options.form = true;
        }
    }
    if (Array.isArray(beforeRequest)) {
        hooks.beforeRequest = beforeRequest;
    }
    if (Array.isArray(afterResponse)) {
        hooks.afterResponse = afterResponse;
    }
    // 有类型安全问题...
    options.hooks = hooks;
    options.method = method;
    options.retry = retry;
    return got(url, options);
}
/**
 * { beforeRequest, afterResponse, retry }
 */
function default_1(opts = {}) {
    return Object.assign({}, ['get', 'head'].reduce((prev, cur) => (prev[cur] = ({ name, meta, url, options }) => request(Object.assign({}, opts, { url, method: cur.toUpperCase(), options })), prev), {}), ['post', 'put', 'patch', 'delete', 'options'].reduce((prev, cur) => (prev[cur] = ({ name, meta, url, body, options, type }) => request(Object.assign({}, opts, { url,
        type,
        options, method: cur.toUpperCase(), data: body })), prev), {}));
}
exports.default = default_1;
;
//# sourceMappingURL=index.js.map