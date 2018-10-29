/* global DEBUG */
'use strict';
const { Readable } = require('stream');
const got = require('got');

const MIME = {
	json: 'application/json',
	form: 'application/x-www-form-urlencoded'
};

function request({ url, method, type, options, beforeRequest, afterResponse }) {
	let body, opts, hooks = {};
	if (options instanceof Buffer || options instanceof Readable || typeof options === 'string') {
		body = options;
		opts = {
			body,
			headers: {
				'Content-Type': MIME[type]
			}
		};
	} else if (Object.prototype.toString.call(options) === '[object Object]') {
		opts = options;
	} else {
		throw new TypeError('Options for got must be an object.');
	}
	
	if (Array.isArray(beforeRequest)) {
		hooks.beforeRequest = beforeRequest;
	}
	if (Array.isArray(afterResponse)) {
		hooks.afterResponse = afterResponse;
	}
	opts.hooks = hooks;
	return got[method](url, opts);
}

/**
 * { beforeRequest, afterResponse }
 */
module.exports = function (opts = {}) {
	return {
		...['get', 'head'].reduce((prev, cur) =>
			(prev[cur] = (url, options) => request({
				url,
				method: cur,
				options,
				...opts
			}), prev), {}),
		...['post', 'put', 'patch', 'delete', 'options'].reduce((prev, cur) =>
			(prev[cur] = (url, bodyOrOptions, type) => request({
				url,
				type,
				method: cur,
				options: bodyOrOptions,
				...opts
			}), prev), {})
	};
};
