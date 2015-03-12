var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Wreck = require('wreck');
var querystring = require('querystring');
var identify = 'test-' + Date.now();
var EtcdConfig = require('../');

lab.experiment('etcd-config', function() {

    lab.beforeEach(function (done) {
        // set test keys
        var key = 'applications/' + identify + '/test';
        var path = '/v2/keys/' + key;
        var options = {
            payload: 'value=foo',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        Wreck.put('http://127.0.0.1:4001' + path, options, function (err, res, payload) {
            if (err || res.statusCode !== 201) {
                return done(new Error('error writing to etcd'));
            }
            return done();
        });
    });

    lab.beforeEach(function (done) {
        // set test keys
        var key = 'applications/' + identify + '/json';
        var path = '/v2/keys/' + key;
        var options = {
            payload: 'value=' + JSON.stringify(['foo', 'bar']),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        Wreck.put('http://127.0.0.1:4001' + path, options, function (err, res, payload) {
            if (err || res.statusCode !== 201) {
                return done(new Error('error writing to etcd'));
            }
            return done();
        });
    });

    lab.beforeEach(function (done) {
        // set test keys
        var key = 'applications/' + identify + '/mest/test';
        var path = '/v2/keys/' + key;
        var options = {
            payload: 'value=moo',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        Wreck.put('http://127.0.0.1:4001' + path, options, function (err, res, payload) {
            if (err || res.statusCode !== 201) {
                return done(new Error('error writing to etcd'));
            }
            return done();
        });
    });

    lab.test('initializes', function (done) {
        var options = {
            connectionString: 'http://127.0.0.1:4001/'
        };
        var testConfig = new EtcdConfig(options);
        Code.expect(testConfig).to.exist();
        done();
    });

    lab.test('returns a valid config', function (done) {
        var options = {
            connectionString: 'http://127.0.0.1:4001/'
        };
        var testConfig = new EtcdConfig(options);
        testConfig.identify(identify);
        testConfig.load(function (err, config) {
            Code.expect(err).to.not.exist();
            Code.expect(config).to.exist();
            Code.expect(config.test).to.equal('foo');
            Code.expect(config.mest.test).to.equal('moo');
            done();
        });
    });

    lab.test('parses JSON values', function (done) {
        var options = {
            connectionString: 'http://127.0.0.1:4001/',
            jsonKeys: true
        };
        var testConfig = new EtcdConfig(options);
        testConfig.identify(identify);
        testConfig.load(function (err, config) {
            Code.expect(err).to.not.exist();
            Code.expect(config).to.exist();
            Code.expect(config.json).to.be.an.instanceOf(Array);
            done();
        });
    });

    lab.test('emits changed events', function (done) {
        var options = {
            connectionString: 'http://127.0.0.1:4001/',
            jsonKeys: true
        };
        var testConfig = new EtcdConfig(options);
        testConfig.identify(identify);
        testConfig.load(function (err, config) {
            Code.expect(err).to.not.exist();
            Code.expect(config).to.exist();
            Code.expect(config.test).to.equal('foo');

            testConfig.once('changed', function (item) {
                Code.expect(item).to.exist();
                Code.expect(item.key).to.equal('test');
                Code.expect(item.value).to.equal('choochoo');
                done();
            });

            var key = 'applications/' + identify + '/test';
            var path = '/v2/keys/' + key;
            var options = {
                payload: 'value=choochoo',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            Wreck.put('http://127.0.0.1:4001' + path, options, function (err, res, payload) {
                if (err || res.statusCode !== 200) {
                    return done(new Error('error writing to etcd'));
                }
            });
        });
    });

    lab.afterEach(function (done) {
        var key = 'applications/' + identify;
        var path = '/v2/keys/' + key + '?recursive=true&dir=false';
        Wreck.delete('http://127.0.0.1:4001' + path, null, function (err, res, payload) {
            if (err || res.statusCode !== 200) {
                return done(new Error('error deleting key in etcd'));
            }
            return done();
        });
    });
});