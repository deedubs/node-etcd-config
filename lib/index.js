var util = require('util');
var url = require('url');
var querystring = require('querystring');
var events = require('events');

var Etcd = require('./client');

module.exports = EtcdConfig;

function EtcdConfig(connectionString) {

    if (!(this instanceof EtcdConfig)) {
      return new EtcdConfig(connectionString);
    }

    events.EventEmitter.call(this);

    var urlParts = url.parse(connectionString);
    var query = querystring.parse(urlParts.query);

    query.json = true;

    urlParts.search = querystring.stringify(query);

    this.client = new Etcd(url.format(urlParts));
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

                var keyPath = changed.key.slice(configPath.length);
                var newValue = changed.value;


                if (typeof newValue === 'string') {
                    newValue = '"' + newValue + '"';
                }

                var functionBody = 'config.' + keyPath.replace(/\//g,'.') + ' =' + newValue;

                if (!newValue) {
                    functionBody = 'delete config.' + keyPath.replace(/\//g,'.');
                }

                new Function('config', functionBody)(config);

                etcdConfig.emit('changed:' + keyPath, changed.value);

                watchForChanges();
            });
        })();


        callback(null, config);
    });
};
