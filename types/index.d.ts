/// <reference types="node" />
import { BeforeRequestHook, AfterResponseHook, GotBodyOptions, GotJSONOptions, GotFormOptions, RetryOptions } from 'got';
import { Readable } from 'stream';
import { APIzClient, HTTPMethodLowerCase } from 'apiz-ng';
declare enum MIME {
    json = "application/json",
    form = "application/x-www-form-urlencoded"
}
export interface APIzClientOptions {
    beforeRequest?: Array<BeforeRequestHook<GotBodyOptions<string | null>>>;
    afterResponse?: Array<AfterResponseHook<GotBodyOptions<string | null>, string | Buffer | Readable>>;
    retry?: number | RetryOptions;
}
export declare type APIzClientType = keyof typeof MIME;
export declare type APIzClientMeta = any;
export declare type APIzClientInstance = APIzClient<APIzRequestOptions, APIzClientType, APIzClientMeta, HTTPMethodLowerCase>;
export declare type APIzRequestOptions = GotJSONOptions & GotBodyOptions<string> & GotBodyOptions<null> & GotFormOptions<string> & GotFormOptions<null>;
/**
 * { beforeRequest, afterResponse, retry }
 */
export default function (opts?: APIzClientOptions): APIzClientInstance;
export {};
//# sourceMappingURL=index.d.ts.map