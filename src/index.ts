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

export type APIzClientContentType = keyof typeof MIME | string;

export type APIzClientResponseType = 'json';

export type APIzClientMeta = any;

export type APIzRawRequestOptions = OptionsOfBufferResponseBody | OptionsOfJSONResponseBody | OptionsOfTextResponseBody | OptionsOfUnknownResponseBody;

export type APIzClientInstance = APIzClient<APIzRawRequestOptions, APIzClientContentType, APIzClientResponseType, APIzClientMeta, HTTPMethodLowerCase>;

export interface APIzClientConstructorOptions {
	beforeRequest?: Array<BeforeReqHook<NormalizedOptions>>;
	afterResponse?: Array<AfterResponseHook>;
	error?: (err?: Error, options?: ClientRequestOptions<APIzRawRequestOptions, APIzClientContentType, APIzClientResponseType, APIzClientMeta>, request?: (o: ClientRequestOptions<APIzRawRequestOptions, APIzClientContentType, APIzClientResponseType, APIzClientMeta>) => Promise<any>) => any;
	retry?: number | RequiredRetryOptions;
}

type BeforeReqHook<Options> = (options: Options, reqID: number) => any;

interface APIzClientConstructorOptionsWithMethod extends APIzClientConstructorOptions {
	method: HTTPMethodUpperCase;
}

type Callable = (...args: Array<any>) => any;

interface RequestOptions extends  ClientRequestOptions<APIzRawRequestOptions, APIzClientContentType, APIzClientResponseType, APIzClientMeta> {
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
): APIzClientRequest<APIzRawRequestOptions, APIzClientContentType, APIzClientResponseType, APIzClientMeta> {
	const request = async function (reqOptions: RequestOptions): Promise<any> {
		const {
			url,
			options,
			body,
			headers,
			contentType,
			responseType,
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
				headers,
				retry
			};

			if (typeof body === 'object' && body != null) {
				for (const [k, v] of Object.entries<any>(body)) {
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
			} else if ((body instanceof Buffer || body instanceof Readable) && (contentType === 'form' || contentType === 'json')) {
				$options.headers ? $options.headers['Content-Type'] = MIME[contentType] : $options.headers = {
					'Content-Type': MIME[contentType]
				};
				$options.body = body;
			} else if (contentType === 'json') {
				if (typeof body === 'string') {
					$options.headers ? $options.headers['Content-Type'] = MIME[contentType] : $options.headers = {
						'Content-Type': MIME[contentType]
					};
					$options.body = body;
				} else {
					$options.json = body
				}
			} else if (contentType === 'form') {
				if (typeof body === 'string') {
					$options.headers ? $options.headers['Content-Type'] = MIME[contentType] : $options.headers = {
						'Content-Type': MIME[contentType]
					};
					$options.body = body;
				} else {
					$options.form = body
				}
			} else {
				$options.body = body;
			}
			$options.responseType = responseType;

			if (Array.isArray(beforeRequest)) {
				hooks.beforeRequest = beforeRequest.map((hook: BeforeReqHook<NormalizedOptions>): BeforeRequestHook => hookOptions => hook(hookOptions, reqID));
			}
			if (Array.isArray(afterResponse)) {
				hooks.afterResponse = afterResponse;
			}

			$options.hooks = hooks;
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
