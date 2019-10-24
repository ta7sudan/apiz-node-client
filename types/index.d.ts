/// <reference types="node" />
import { BeforeRequestHook, AfterResponseHook, GotBodyOptions, GotJSONOptions, GotFormOptions, RetryOptions } from 'got';
import { Readable } from 'stream';
import { APIzClient, HTTPMethodLowerCase } from 'apiz-ng';
declare enum MIME {
    json = "application/json",
    form = "application/x-www-form-urlencoded"
}
export declare type APIzClientType = keyof typeof MIME | string;
export declare type APIzClientMeta = any;
export declare type APIzRawRequestOptions = GotJSONOptions | GotBodyOptions<string> | GotBodyOptions<null> | GotFormOptions<string> | GotFormOptions<null>;
export declare type APIzClientInstance = APIzClient<APIzRawRequestOptions, APIzClientType, APIzClientMeta, HTTPMethodLowerCase>;
export interface APIzClientConstructorOptions {
    beforeRequest?: Array<BeforeRequestHook<GotBodyOptions<string | null>>>;
    afterResponse?: Array<AfterResponseHook<GotBodyOptions<string | null>, string | Buffer | Readable>>;
    error?: (err: Error) => any;
    retry?: number | RetryOptions;
}
/**
 * { beforeSend, afterResponse, retry }
 */
export default function (opts?: APIzClientConstructorOptions): APIzClientInstance;
export {};
//# sourceMappingURL=index.d.ts.map