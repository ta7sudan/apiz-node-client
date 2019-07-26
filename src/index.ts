/* global DEBUG */
import got = require('got');
// tslint:disable-next-line
import { BeforeRequestHook, AfterResponseHook, GotBodyOptions, GotJSONOptions, GotFormOptions, RetryOptions, Hooks } from 'got';
import { Readable } from 'stream';
// tslint:disable-next-line
import { APIzClient, HTTPMethodLowerCase, ClientRequestOptions, APIzClientRequest, HTTPMethodUpperCase } from 'apiz-ng';

export type APIzClientType = 'json' | 'form' | string;

export type APIzClientMeta = any;

export type APIzRawRequestOptions = GotJSONOptions | GotBodyOptions<string> | GotBodyOptions<null> | GotFormOptions<string> | GotFormOptions<null>;

export type APIzClientInstance = APIzClient<APIzRawRequestOptions, APIzClientType, APIzClientMeta, HTTPMethodLowerCase>;

export interface APIzClientConstructorOptions {
	beforeRequest?: Array<BeforeRequestHook<GotBodyOptions<string | null>>>;
	afterResponse?: Array<AfterResponseHook<GotBodyOptions<string | null>, string | Buffer | Readable>>;
	error?: (err: Error) => void,
	retry?: number | RetryOptions;
}

interface APIzClientConstructorOptionsWithMethod extends APIzClientConstructorOptions {
	method: HTTPMethodUpperCase;
}

type Callable = (...args: Array<any>) => any;

const isFn = (f: any): f is Callable => typeof f === 'function';



function createRequest({
		method,
		beforeRequest,
		afterResponse,
		error,
		retry = 0
	}: APIzClientConstructorOptionsWithMethod
): APIzClientRequest<APIzRawRequestOptions, APIzClientType, APIzClientMeta> {
	return function request({
		url,
		options,
		body,
		headers,
		type,
		handleError = true
	}: ClientRequestOptions<APIzRawRequestOptions, APIzClientType, APIzClientMeta>): Promise<any> {
		const hooks = {} as (Hooks<GotBodyOptions<string | null>, string | Buffer | Readable> | Hooks<GotJSONOptions, object> | Hooks<GotFormOptions<string | null>, Record<string, any>>);
		let $options: APIzRawRequestOptions | undefined;
		if (options) {
			$options = {
				...options,
				method
			};
		} else {
			$options = {
				method,
				body,
				headers,
				retry
			};

			if (Array.isArray(beforeRequest)) {
				hooks.beforeRequest = beforeRequest  ;
			}
			if (Array.isArray(afterResponse)) {
				hooks.afterResponse = afterResponse;
			}

			($options as any).hooks = hooks;

			if (type === 'json') {
				($options as GotJSONOptions).json = true;
			} else if (type === 'form') {
				($options as GotFormOptions<string | null>).form = true;
			} else if (type) {
				$options.headers ? $options.headers['Content-Type'] = type : $options.headers = {
					'Content-Type': type
				};
			}
		}
		const p = got(url, $options as GotJSONOptions);
		if (isFn(error) && handleError) {
			p.catch(e => error(e));
		}
		return p;
	};
}


/**
 * { beforeSend, afterResponse, retry }
 */
export default function (opts: APIzClientConstructorOptions = {}): APIzClientInstance {
	return (['get', 'head', 'post', 'put', 'patch', 'delete', 'options'] as Array<HTTPMethodLowerCase>)
		.reduce(
			(prev: APIzClientInstance, cur: HTTPMethodLowerCase) => (prev[cur] = createRequest({
				...opts,
				method: cur.toUpperCase() as HTTPMethodUpperCase
			}), prev),
			{} as APIzClientInstance
		);
}
