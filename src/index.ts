/* global DEBUG */
import got = require('got');
// tslint:disable-next-line
import { BeforeRequestHook, AfterResponseHook, GotBodyOptions, GotJSONOptions, GotFormOptions, RetryOptions, Hooks } from 'got';
import { Readable } from 'stream';
// tslint:disable-next-line
import { APIzClient, HTTPMethodLowerCase, ClientRequestOptions, APIzClientRequest, HTTPMethodUpperCase } from 'apiz-ng';

enum MIME {
	json = 'application/json',
	form = 'application/x-www-form-urlencoded'
}

export type APIzClientType = keyof typeof MIME | string;

export type APIzClientMeta = any;

export type APIzRawRequestOptions = GotJSONOptions | GotBodyOptions<string> | GotBodyOptions<null> | GotFormOptions<string> | GotFormOptions<null>;

export type APIzClientInstance = APIzClient<APIzRawRequestOptions, APIzClientType, APIzClientMeta, HTTPMethodLowerCase>;

export interface APIzClientConstructorOptions {
	beforeRequest?: Array<BeforeRequestHook<GotBodyOptions<string | null>>>;
	afterResponse?: Array<AfterResponseHook<GotBodyOptions<string | null>, string | Buffer | Readable>>;
	error?: (err: Error) => any,
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

			if (type && type !== 'json' && type !== 'form') {
				$options.headers ? $options.headers['Content-Type'] = type : $options.headers = {
					'Content-Type': type
				};
			} else if ((body instanceof Buffer || body instanceof Readable) && (type === 'form' || type === 'json')) {
				$options.headers ? $options.headers['Content-Type'] = MIME[type] : $options.headers = {
					'Content-Type': MIME[type]
				};
			} else if (type === 'json') {
				($options as GotJSONOptions).json = true;
			} else if (type === 'form') {
				($options as unknown as GotFormOptions<string | null>).form = true;
			}
		}
		const p = got(url, $options as GotJSONOptions);
		if (isFn(error) && handleError) {
			// 穿透
			let $err: any = null;
			p.catch((err: Error): any => {
				$err = err;
				return error(err);
			})
				.then((result: any): any => {
					if (result === false || result === undefined) {
						return Promise.reject($err);
					} else {
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
