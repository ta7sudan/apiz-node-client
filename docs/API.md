## API

apiz-node-client implements the `APIzClient` interface for node, based on [got](https://github.com/sindresorhus/got), so you can use options of got.



## Usage

```javascript
import { APIz } from 'apiz-ng';
import apizClient from 'apiz-browser-client';

const apiMeta = {
    getBook: {
        url: 'http://www.a.com'
    }
};

const apis = new APIz(apiMeta, {
    client: apizClient({
        beforeRequest: [async options => console.log(options)],
        afterResponse: [response => console.log(response.statusCode)]
    })
})
```

`beforeRequest` and  `afterResponse` are [hooks](https://github.com/sindresorhus/got#hooks) of [got](https://github.com/sindresorhus/got).