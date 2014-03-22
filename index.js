var url = require('url');
var querystring = require('querystring');

var Etcd = require('./client');

function EtcdConfig(connectionString) {

    var urlParts = url.parse(connectionString);
    var query = querystring.parse(urlParts.query);

    query.json = true;

    urlParts.search = querystring.stringify(query);

    this.client = new Etcd(url.format(urlParts));
}

EtcdConfig.prototype.identify = function (id) {

    this.id = id;
};

EtcdConfig.prototype.load = function (path, callback) {

    if (typeof path === 'function') {

        callback = path;

        path = '';
    }

    path = '/' + path;

    this.client.get('/applications/' + this.id + path, {recursive: true}, function (err, res) {

        callback(null, res);
    });
};

module.exports = EtcdConfig;
