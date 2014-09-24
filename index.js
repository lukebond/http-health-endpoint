var http = require('http');

function HttpHealthCheck(options, healthCheckFn) {
  if (!(this instanceof HttpHealthCheck)) {
    return new HttpHealthCheck(options, healthCheckFn);
  }

  this.options = options || {};
  this.healthCheckFn = healthCheckFn;
  this.server = null;
}

HttpHealthCheck.prototype.createServer = function (cb) {
  var self = this;
  this.server = http.createServer(function (req, res) {
    self.healthCheckFn.call(null, function (err, healthResponse) {
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end(err.message);
      } else {
        res.writeHead(
          healthResponse.ok ? 200 : 503,
          {'Content-Type': 'application/json'});
        try {
          res.end(JSON.stringify(healthResponse));
        } catch (err) {
          res.end('Invalid JSON in health check data');
        }
      }
    });
  }).listen(this.options.port, cb);
};

HttpHealthCheck.prototype.close = function (cb) {
  this.server.close(cb);
};

module.exports = HttpHealthCheck;
