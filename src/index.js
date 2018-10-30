/* global DEBUG */
'use strict';
const got = require('got');
const { Readable } = require('stream');

const MIME = {
	json: 'application/json',
	form: 'application/x-www-form-urlencoded'
};

function request({ url, method, type, data, options, beforeRequest, afterResponse }) {
	let opts = {}, hooks = {};
	if (Object.prototype.toString.call(options) === '[object Object]') {
		opts = options;
	} else if (data instanceof Buffer || data instanceof Readable) {
		opts.body = data;
		if (MIME[type]) {
			opts.headers = {
				'Content-Type': MIME[type]
			};
		}
	} else if (data) {
		opts.body = data;
		if (type === 'json') {
			opts.json = true;
		} else if (type === 'form') {
			opts.form = true;
		}
	}

	if (Array.isArray(beforeRequest)) {
		hooks.beforeRequest = beforeRequest;
	}
	if (Array.isArray(afterResponse)) {
		hooks.afterResponse = afterResponse;
	}
	opts.hooks = hooks;
	opts.method = method;
	return got(url, opts);
}

/**
 * { beforeRequest, afterResponse }
 */
module.exports = function (opts = {}) {
	return {
		...['get', 'head'].reduce((prev, cur) =>
			(prev[cur] = (url, options) => request({
				url,
				method: cur.toUpperCase(),
				options,
				...opts
			}), prev), {}),
		...['post', 'put', 'patch', 'delete', 'options'].reduce((prev, cur) =>
			(prev[cur] = (url, bodyOrOptions, type, isOptions) => request({
				url,
				type,
				method: cur.toUpperCase(),
				data: isOptions ? undefined : bodyOrOptions,
				options: isOptions ? bodyOrOptions : undefined,
				...opts
			}), prev), {})
	};
};
