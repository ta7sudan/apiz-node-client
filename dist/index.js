"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* global DEBUG */
const got = require("got");
const isFn = (f) => typeof f === 'function';
function createRequest({ method, beforeRequest, afterResponse, error, retry = 0 }) {
    return function request({ url, options, body, headers, type, handleError = true }) {
        const hooks = {};
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
                hooks.beforeRequest = beforeRequest;
            }
            if (Array.isArray(afterResponse)) {
                hooks.afterResponse = afterResponse;
            }
            $options.hooks = hooks;
            if (type === 'json') {
                $options.json = true;
            }
            else if (type === 'form') {
                $options.form = true;
            }
            else if (type) {
                $options.headers ? $options.headers['Content-Type'] = type : $options.headers = {
                    'Content-Type': type
                };
            }
        }
        const p = got(url, $options);
        if (isFn(error) && handleError) {
            p.catch(e => error(e));
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