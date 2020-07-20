import { OptionsOfBufferResponseBody, OptionsOfJSONResponseBody, OptionsOfTextResponseBody, OptionsOfUnknownResponseBody, AfterResponseHook, RequiredRetryOptions } from 'got';
import { APIzClient, HTTPMethodLowerCase, ClientRequestOptions } from 'apiz-ng';
import { NormalizedOptions } from 'got/dist/source/core';
declare enum MIME {
    json = "application/json",
    form = "application/x-www-form-urlencoded"
}
export declare type APIzClientContentType = keyof typeof MIME | string;
export declare type APIzClientResponseType = 'json';
export declare type APIzClientMeta = any;
export declare type APIzRawRequestOptions = OptionsOfBufferResponseBody | OptionsOfJSONResponseBody | OptionsOfTextResponseBody | OptionsOfUnknownResponseBody;
export declare type APIzClientInstance = APIzClient<APIzRawRequestOptions, APIzClientContentType, APIzClientResponseType, APIzClientMeta, HTTPMethodLowerCase>;
export interface APIzClientConstructorOptions {
    beforeRequest?: Array<BeforeReqHook<NormalizedOptions>>;
    afterResponse?: Array<AfterResponseHook>;
    error?: (err?: Error, options?: ClientRequestOptions<APIzRawRequestOptions, APIzClientContentType, APIzClientResponseType, APIzClientMeta>, request?: (o: ClientRequestOptions<APIzRawRequestOptions, APIzClientContentType, APIzClientResponseType, APIzClientMeta>) => Promise<any>) => any;
    retry?: number | RequiredRetryOptions;
}
declare type BeforeReqHook<Options> = (options: Options, reqID: number) => any;
/**
 * { beforeSend, afterResponse, retry }
 */
export default function (opts?: APIzClientConstructorOptions): APIzClientInstance;
export {};
//# sourceMappingURL=index.d.ts.map