"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* global DEBUG */
// tslint:disable-next-line
const got_1 = tslib_1.__importDefault(require("got"));
const stream_1 = require("stream");
// tslint:disable-next-line
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
    const request = async function (reqOptions) {
        const { url, options, body, headers, contentType, responseType, handleError = true } = reqOptions;
        const hooks = {};
        const reqID = reqOptions.id || getUniqueID();
        reqOptions.id = reqID;
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
                headers,
                retry
            };
            if (typeof body === 'object' && body != null) {
                for (const [k, v] of Object.entries(body)) {
                    if (v == null) {
                        delete body[k];
                    }
                }
            }
            if (contentType && contentType !== 'json' && contentType !== 'form') {
                $options.headers ? $options.headers['Content-Type'] = contentType : $options.headers = {
                    'Content-Type': contentType
                };
                $options.body = body;
            }
            else if ((body instanceof Buffer || body instanceof stream_1.Readable) && (contentType === 'form' || contentType === 'json')) {
                $options.headers ? $options.headers['Content-Type'] = MIME[contentType] : $options.headers = {
                    'Content-Type': MIME[contentType]
                };
                $options.body = body;
            }
            else if (contentType === 'json') {
                if (typeof body === 'string') {
                    $options.headers ? $options.headers['Content-Type'] = MIME[contentType] : $options.headers = {
                        'Content-Type': MIME[contentType]
                    };
                    $options.body = body;
                }
                else {
                    $options.json = body;
                }
            }
            else if (contentType === 'form') {
                if (typeof body === 'string') {
                    $options.headers ? $options.headers['Content-Type'] = MIME[contentType] : $options.headers = {
                        'Content-Type': MIME[contentType]
                    };
                    $options.body = body;
                }
                else {
                    $options.form = body;
                }
            }
            else {
                $options.body = body;
            }
            $options.responseType = responseType;
            if (Array.isArray(beforeRequest)) {
                hooks.beforeRequest = beforeRequest.map((hook) => hookOptions => hook(hookOptions, reqID));
            }
            if (Array.isArray(afterResponse)) {
                hooks.afterResponse = afterResponse;
            }
            $options.hooks = hooks;
        }
        if (($options.body !== undefined && $options.json !== undefined) ||
            ($options.body !== undefined && $options.form !== undefined) ||
            ($options.form !== undefined && $options.json !== undefined)) {
            console.log(`body, json, form are mutually exclusive, method: ${method}, url: ${url} body: ${body}, json: ${JSON.stringify($options.json)}, form: ${$options.form}`);
            throw new Error(`body, json, form are mutually exclusive, method: ${method}, url: ${url} body: ${body}, json: ${JSON.stringify($options.json)}, form: ${$options.form}`);
        }
        const p = got_1.default(url, $options);
        if (isFn(error) && handleError) {
            // 穿透
            try {
                const result = await p;
                return result;
            }
            catch ($err) {
                // const req: any = (opts: GotJSONOptions) => got(url, opts);
                request.id = reqID;
                const rst = await error($err, reqOptions, request);
                if (rst === false || rst === undefined) {
                    throw $err;
                }
                else {
                    return rst;
                }
            }
        }
        return await p;
    };
    return request;
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