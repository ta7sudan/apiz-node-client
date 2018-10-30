/* global DEBUG */
'use strict';
const got = require('got');
const { Readable } = require('stream');

const MIME = {
	json: 'application/json',
	form: 'application/x-www-form-urlencoded'
};

function request({ url, method, type, data, options = {}, beforeRequest, afterResponse }) {
	let hooks = {};
	if (data instanceof Buffer || data instanceof Readable) {
		options.body = data;
		if (MIME[type]) {
			options.headers = {
				'Content-Type': MIME[type]
			};
		}
	} else if (data) {
		options.body = data;
		if (type === 'json') {
			options.json = true;
		} else if (type === 'form') {
			options.form = true;
		}
	}

	if (Array.isArray(beforeRequest)) {
		hooks.beforeRequest = beforeRequest;
	}
	if (Array.isArray(afterResponse)) {
		hooks.afterResponse = afterResponse;
	}
	options.hooks = hooks;
	options.method = method;
	return got(url, options);
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
