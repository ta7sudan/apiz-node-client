/// <reference types="node" />
import { AfterResponseHook, GotBodyOptions, GotJSONOptions, GotFormOptions, RetryOptions } from 'got';
import { Readable } from 'stream';
import { APIzClient, HTTPMethodLowerCase, ClientRequestOptions } from 'apiz-ng';
declare enum MIME {
    json = "application/json",
    form = "application/x-www-form-urlencoded"
}
export declare type APIzClientType = keyof typeof MIME | string;
export declare type APIzClientMeta = any;
export declare type APIzRawRequestOptions = GotJSONOptions | GotBodyOptions<string> | GotBodyOptions<null> | GotFormOptions<string> | GotFormOptions<null>;
export declare type APIzClientInstance = APIzClient<APIzRawRequestOptions, APIzClientType, APIzClientMeta, HTTPMethodLowerCase>;
export interface APIzClientConstructorOptions {
    beforeRequest?: Array<BeforeReqHook<GotBodyOptions<string | null>>>;
    afterResponse?: Array<AfterResponseHook<GotBodyOptions<string | null>, string | Buffer | Readable>>;
    error?: (err?: Error, options?: ClientRequestOptions<APIzRawRequestOptions, APIzClientType, APIzClientMeta>, request?: (o: ClientRequestOptions<APIzRawRequestOptions, APIzClientType, APIzClientMeta>) => Promise<any>) => any;
    retry?: number | RetryOptions;
}
declare type BeforeReqHook<Options> = (options: Options, reqID: number) => any;
/**
 * { beforeSend, afterResponse, retry }
 */
export default function (opts?: APIzClientConstructorOptions): APIzClientInstance;
export {};
//# sourceMappingURL=index.d.ts.map