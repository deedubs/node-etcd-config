var util = require('util');
var url = require('url');
var querystring = require('querystring');
var events = require('events');

var Etcd = require('./client');

module.exports = EtcdConfig;

function EtcdConfig(options) {

    var connectionString = options.connectionString;
    this.jsonKeys = options.jsonKeys || false;

    if (!(this instanceof EtcdConfig)) {
      return new EtcdConfig(connectionString, this.jsonKeys);
    }

    events.EventEmitter.call(this);

    var urlParts = url.parse(connectionString);
    var query = querystring.parse(urlParts.query);

    query.json = true;

    urlParts.search = querystring.stringify(query);

    this.client = new Etcd(url.format(urlParts), this.jsonKeys);
}

util.inherits(EtcdConfig, events.EventEmitter);

EtcdConfig.prototype.identify = function (id) {

    this.id = id;
    return this;
};

EtcdConfig.prototype.load = function (path, callback) {

    var etcdConfig = this;

    if (typeof path === 'function') {

        callback = path;

        path = '';
    }

    path = '/' + path;

    var configPath = '/applications/' + etcdConfig.id + path;

    etcdConfig.client.get(configPath, {recursive: true}, function (err, config) {

        if (err) {

            return callback(err);
        }

        (function watchForChanges() {

            etcdConfig.client.watch(configPath, {recursive: true}, function (err, changed) {

                if (err) {
                    return callback(err);
                }

                if (changed) {
                    var key = changed.key.split('/')
                    key.splice(0, 3);
                    var keyPath = key.join('.')

                    var functionBody = 'return config.' + keyPath;

                    var getOldValue = new Function('config', 'keyPath', functionBody);

                    var oldValue = getOldValue(config, keyPath);

                    var eventObj = {};
                    switch (changed.method) {
                        case 'set':
                            eventObj = {
                                key: keyPath,
                                value: changed.value,
                                oldValue: oldValue,
                                method: changed.method
                            };
                            break;
                        case 'delete':
                            eventObj = {
                                key: keyPath,
                                oldValue: oldValue,
                                method: changed.method
                            };
                            break;
                    }
                    etcdConfig.emit('changed', eventObj);
                }
                watchForChanges();
            });
        })();

        callback(null, config);
    });
};
