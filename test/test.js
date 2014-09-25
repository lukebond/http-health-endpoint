var HttpHealthCheck = require('../index');
var request = require('request');
var test = require('tape');

test('Defaults are as expected', function (t) {
  var health = new HttpHealthCheck({}, function () {});
  t.equal(health.options.port, 10060, 'Port should default to 10060');
  t.equal(health.options.path, '/', 'Path should default to \'/\'');
  t.equal(health.options.okField, 'ok', 'okField should default to \'ok\'');
  t.equal(health.options.okValue, true, 'okValue should default to true');
  t.end();
});

test('Defaults can be overriden', function (t) {
  var health = new HttpHealthCheck(
    { port: 10061, path: '/_health', okField: 'healthy', okValue: 1 },
    function () {});
  t.equal(health.options.port, 10061, 'Overriding default port works');
  t.equal(health.options.path, '/_health', 'Overriding default path works');
  t.equal(health.options.okField, 'healthy', 'Overriding default okField works');
  t.equal(health.options.okValue, 1, 'Overriding default okValue works');
  t.end();
});

test('Gets a response with Content-Type of application/json, code 200 and the expected contents', function (t) {
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
        t.end();
      });
    }, 500);
  });
});

test('Gets a response with status code 503 when healthCheckFn contains ok=false', function (t) {
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
        t.end();
      });
    }, 500);
  });
});
