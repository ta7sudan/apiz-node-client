/* global DEBUG */
'use strict';
import got = require('got');
// tslint:disable-next-line
import { BeforeRequestHook, AfterResponseHook, GotBodyOptions, GotJSONOptions, GotFormOptions, RetryOptions, Hooks } from 'got';
import { Readable } from 'stream';
// tslint:disable-next-line
import { APIzClient, HTTPMethodLowerCase, ClientRequestOptions, HTTPMethodUpperCase } from 'apiz-ng';

enum MIME {
	json = 'application/json',
	form = 'application/x-www-form-urlencoded'
}


function request({ url, method, type, data, retry = 0, options = {} as APIzRequestOptions, beforeRequest, afterResponse }: RequestOptions) {
	const hooks = {} as (Hooks<GotBodyOptions<string | null>, string | Buffer | Readable> | Hooks<GotJSONOptions, object> | Hooks<GotFormOptions<string | null>, Record<string, any>>);
	if (data instanceof Buffer || data instanceof Readable) {
		options.body = data;
		if (MIME[type!]) {
			options.headers = {
				'Content-Type': MIME[type!]
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
		hooks.beforeRequest = beforeRequest  ;
	}
	if (Array.isArray(afterResponse)) {
		hooks.afterResponse = afterResponse;
	}
	// 有类型安全问题...
	(options.hooks as any) = hooks;
	options.method = method;
	options.retry = retry;
	return got(url, options);
}

interface RequestOptions extends APIzClientOptions {
	id?: number;
	url: string;
	type?: APIzClientType;
	options?: APIzRequestOptions;
	method: HTTPMethodUpperCase;
	data?: any;
}

export interface APIzClientOptions {
	beforeRequest?: Array<BeforeRequestHook<GotBodyOptions<string | null>>>;
	afterResponse?: Array<AfterResponseHook<GotBodyOptions<string | null>, string | Buffer | Readable>>;
	retry?: number | RetryOptions;
}

export type APIzClientType = keyof typeof MIME;

export type APIzClientMeta = any;

export type APIzClientInstance = APIzClient<APIzRequestOptions, APIzClientType, APIzClientMeta, HTTPMethodLowerCase>;

export type APIzRequestOptions = GotJSONOptions & GotBodyOptions<string> & GotBodyOptions<null> & GotFormOptions<string> & GotFormOptions<null>;

/**
 * { beforeRequest, afterResponse, retry }
 */
export default function (opts: APIzClientOptions = {}): APIzClientInstance {
	return {
		...['get', 'head'].reduce((prev, cur) =>
			(prev[cur as HTTPMethodLowerCase] = ({ name, meta, url, options }: ClientRequestOptions<APIzRequestOptions, APIzClientType, APIzClientMeta>) => request({
				...opts,
				url,
				method: cur.toUpperCase() as HTTPMethodUpperCase,
				options
			}), prev), {} as APIzClient<APIzRequestOptions, APIzClientType, APIzClientMeta, HTTPMethodLowerCase>),
		...['post', 'put', 'patch', 'delete', 'options'].reduce((prev, cur) =>
			(prev[cur as HTTPMethodLowerCase] = ({ name, meta, url, body, options, type }) => request({
				...opts,
				url,
				type,
				options,
				method: cur.toUpperCase() as HTTPMethodUpperCase,
				data: body
			}), prev), {} as APIzClient<APIzRequestOptions, APIzClientType, APIzClientMeta, HTTPMethodLowerCase>)
	};
};
