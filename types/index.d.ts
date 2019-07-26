/// <reference types="node" />
import { BeforeRequestHook, AfterResponseHook, GotBodyOptions, GotJSONOptions, GotFormOptions, RetryOptions } from 'got';
import { Readable } from 'stream';
import { APIzClient, HTTPMethodLowerCase } from 'apiz-ng';
export declare type APIzClientType = 'json' | 'form' | string;
export declare type APIzClientMeta = any;
export declare type APIzRawRequestOptions = GotJSONOptions | GotBodyOptions<string> | GotBodyOptions<null> | GotFormOptions<string> | GotFormOptions<null>;
export declare type APIzClientInstance = APIzClient<APIzRawRequestOptions, APIzClientType, APIzClientMeta, HTTPMethodLowerCase>;
export interface APIzClientConstructorOptions {
    beforeRequest?: Array<BeforeRequestHook<GotBodyOptions<string | null>>>;
    afterResponse?: Array<AfterResponseHook<GotBodyOptions<string | null>, string | Buffer | Readable>>;
    error?: (err: Error) => void;
    retry?: number | RetryOptions;
}
/**
 * { beforeSend, afterResponse, retry }
 */
export default function (opts?: APIzClientConstructorOptions): APIzClientInstance;
//# sourceMappingURL=index.d.ts.map