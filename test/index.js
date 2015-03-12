var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var http = require('http');
var querystring = require('querystring');
var identify = 'test-' + Date.now();

lab.experiment('etcd-config', function() {

    lab.before(function (done) {
        // set test keys
        http.get('http://localhost:4001/version', function (res) {
            if (res.statusCode !== 200) {
                return done(new Error('error connecting to etcd'));
            }
            return done();
        })
    });

    lab.before(function (done) {
        // set test keys
        var key = 'applications/' + identify + '/test';
        var postData = querystring.stringify({
          value: 'foo'
        });
        var options = {
            hostname: 'localhost',
            port: 4001,
            path: '/v2/keys/' + key,
            method: 'PUT'
        };
        var req = http.request(options, function (res) {
            if (res.statusCode !== 201) {
                return done(new Error('error writing to etcd'));
            }
            return done();
        });
        req.write(postData);
        req.end();
    });

    lab.before(function (done) {
        // set test keys
        var key = 'applications/' + identify + '/json';
        var postData = querystring.stringify({
          value: JSON.stringify(['foo', 'bar'])
        });
        var options = {
            hostname: 'localhost',
            port: 4001,
            path: '/v2/keys/' + key,
            method: 'PUT'
        };
        var req = http.request(options, function (res) {
            if (res.statusCode !== 201) {
                return done(new Error('error writing to etcd'));
            }
            return done();
        });
        req.write(postData);
        req.end();
    });

    lab.before(function (done) {
        // set test keys
        var key = 'applications/' + identify + '/mest/test';
        var postData = querystring.stringify({
          value: 'moo'
        });
        var options = {
            hostname: 'localhost',
            port: 4001,
            path: '/v2/keys/' + key,
            method: 'PUT'
        };
        var req = http.request(options, function (res) {
            if (res.statusCode !== 201) {
                return done(new Error('error writing to etcd'));
            }
            return done();
        });
        req.write(postData);
        req.end();
    });

    lab.after(function (done) {
        var key = 'applications/' + identify;
        var options = {
            hostname: 'localhost',
            port: 4001,
            path: '/v2/keys/' + key + '?recursive=true',
            method: 'DELETE'
        };
        var req = http.request(options, function (res) {
            if (res.statusCode !== 200) {
                return done(new Error('error deleting key in etcd'));
            }
            return done();
        });
        req.end();
    });
});