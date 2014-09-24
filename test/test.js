var HttpHealthCheck = require('../index');
var request = require('request');
var test = require('tape');

test('Gets a response with Content-Type of application/json, code 200 and the expected contents', function (t) {
  t.plan(7);

  function healthCheckFn(cb) {
    process.nextTick(cb.bind(null, null, {
      ok: true,
      things: 'are good',
      no: 'problems to report'
    }));
  }

  var health = new HttpHealthCheck({ port: 10060 }, healthCheckFn);
  health.createServer(function () {
    setTimeout(function () {
      request('http://localhost:10060', function (err, res, body) {
        t.error(err);
        t.equal(res.statusCode, 200, 'Response status code should be 200');
        t.equal(res.headers['content-type'], 'application/json');
        t.equal(typeof body, 'string');
        body = JSON.parse(body);
        t.ok(body.ok, 'Body contains \'ok\'');
        t.ok(body.things, 'Body contains expected values');
        t.ok(body.no, 'Body contains expected values');
        health.close();
      });
    }, 500);
  });
});

test('Gets a response with status code 503 when healthCheckFn contains ok=false', function (t) {
  t.plan(5);

  function healthCheckFn(cb) {
    process.nextTick(cb.bind(null, null, {
      ok: false
    }));
  }

  var health = new HttpHealthCheck({ port: 10060 }, healthCheckFn);
  health.createServer(function () {
    setTimeout(function () {
      request('http://localhost:10060', function (err, res, body) {
        t.error(err);
        t.equal(res.headers['content-type'], 'application/json');
        t.equal(typeof body, 'string');
        body = JSON.parse(body);
        t.notOk(body.ok, 'Body \'ok\' value is false');
        t.equal(res.statusCode, 503, 'Response status code should be 503');
        health.close();
      });
    }, 500);
  });
});
