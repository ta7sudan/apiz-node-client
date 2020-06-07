/* global DEBUG */
// tslint:disable-next-line
import got, { OptionsOfBufferResponseBody, OptionsOfJSONResponseBody, OptionsOfTextResponseBody, OptionsOfUnknownResponseBody, BeforeRequestHook, AfterResponseHook, RequiredRetryOptions, Hooks } from 'got';
import { Readable } from 'stream';
// tslint:disable-next-line
import { APIzClient, HTTPMethodLowerCase, ClientRequestOptions, APIzClientRequest, HTTPMethodUpperCase } from 'apiz-ng';
import { NormalizedOptions } from 'got/dist/source/core';

// tslint:disable-next-line
enum MIME {
	json = 'application/json',
	form = 'application/x-www-form-urlencoded'
}

let uniqueID = Date.now();

function getUniqueID(): number {
	return ++uniqueID;
}

export type APIzClientType = keyof typeof MIME | string;

export type APIzClientMeta = any;

export type APIzRawRequestOptions = OptionsOfBufferResponseBody | OptionsOfJSONResponseBody | OptionsOfTextResponseBody | OptionsOfUnknownResponseBody;

export type APIzClientInstance = APIzClient<APIzRawRequestOptions, APIzClientType, APIzClientMeta, HTTPMethodLowerCase>;

export interface APIzClientConstructorOptions {
	beforeRequest?: Array<BeforeReqHook<NormalizedOptions>>;
	afterResponse?: Array<AfterResponseHook>;
	error?: (err?: Error, options?: ClientRequestOptions<APIzRawRequestOptions, APIzClientType, APIzClientMeta>, request?: (o: ClientRequestOptions<APIzRawRequestOptions, APIzClientType, APIzClientMeta>) => Promise<any>) => any;
	retry?: number | RequiredRetryOptions;
}

type BeforeReqHook<Options> = (options: Options, reqID: number) => any;

interface APIzClientConstructorOptionsWithMethod extends APIzClientConstructorOptions {
	method: HTTPMethodUpperCase;
}

type Callable = (...args: Array<any>) => any;

interface RequestOptions extends  ClientRequestOptions<APIzRawRequestOptions, APIzClientType, APIzClientMeta> {
	id?: number;
}

const isFn = (f: any): f is Callable => typeof f === 'function';



function createRequest({
		method,
		beforeRequest,
		afterResponse,
		error,
		retry = 0
	}: APIzClientConstructorOptionsWithMethod
): APIzClientRequest<APIzRawRequestOptions, APIzClientType, APIzClientMeta> {
	const request = async function (reqOptions: RequestOptions): Promise<any> {
		const {
			url,
			options,
			body,
			headers,
			type,
			handleError = true
		} = reqOptions;
		const hooks = {} as (Required<Hooks>);
		const reqID = reqOptions.id || getUniqueID();
		reqOptions.id = reqID;
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
				hooks.beforeRequest = beforeRequest.map((hook: BeforeReqHook<NormalizedOptions>): BeforeRequestHook => hookOptions => hook(hookOptions, reqID));
			}
			if (Array.isArray(afterResponse)) {
				hooks.afterResponse = afterResponse;
			}

			$options.hooks = hooks;

			if (type && type !== 'json' && type !== 'form') {
				$options.headers ? $options.headers['Content-Type'] = type : $options.headers = {
					'Content-Type': type
				};
			} else if ((body instanceof Buffer || body instanceof Readable) && (type === 'form' || type === 'json')) {
				$options.headers ? $options.headers['Content-Type'] = MIME[type] : $options.headers = {
					'Content-Type': MIME[type]
				};
			} else if (type === 'json') {
				$options.json = true as any;
			} else if (type === 'form') {
				$options.form = true as any;
			}
			$options.responseType = 'json';
		}
		const p = got(url, $options);
		if (isFn(error) && handleError) {
			// 穿透
			try {
				const result = await p;
				return result;
			} catch ($err) {
				// const req: any = (opts: GotJSONOptions) => got(url, opts);
				(request as any).id = reqID;
				const rst = await error($err, reqOptions, request);
				if (rst === false || rst === undefined) {
					throw $err;
				} else {
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
