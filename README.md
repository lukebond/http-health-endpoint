# http-health-endpoint

HTTP server as a module that will return configurable health info on request.

Usage:
```
var HttpHealthEndpoint = require('http-health-endpoint');

function healthCheckFn(cb) {
  process.nextTick(cb.bind(null, null, {
    ok: true,
    things: 'are good',
    no: 'problems to report'
  }));
}
var health = new HttpHealthCheck({ port: 10060 }, healthCheckFn);
health.createServer();
```

Any requests to `localhost:10060` will return either a 200 or 503 depending on what `healthCheckFn()` returns.

```
$ curl -i locahost:10060
HTTP/1.1 200 OK
Content-Type: application/json
Date: Wed, 24 Sep 2014 17:01:01 GMT
Connection: keep-alive
Transfer-Encoding: chunked

{"ok":true,"things":"are good","no":"problems to report"}
```

If the health check function returns an object containing `ok: false` then it will result in a status code of 503.

The default options are as follows:
```
{
  port: 10060,
  path: '/',
  okField: 'ok',
  okValue: true
};
```
...override them by passing them to the first argument of the constructor.

Check out the tests for detailed usage.

## Licence
MIT
