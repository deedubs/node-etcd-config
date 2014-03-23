var http = require('http');
var url = require('url');
var querystring = require('querystring');

module.exports = Etcd;

function Etcd(connectionString) {

    var urlParts = url.parse(connectionString || "");
    var query = querystring.parse(urlParts.query);

    this.host = urlParts.host || '127.0.0.1';
    this.port = urlParts.port || 4001;
    this.asJSON = query.json;
}

Etcd.prototype.buildPath = function (key, options) {

    return {
        protocol: 'http',
        hostname: this.host,
        port: this.port,
        pathname: '/v2/keys' + key,
        query: options
    };
};

Etcd.prototype.get = function (key, options, callback) {

    var etcd = this;

    http.get(url.format(this.buildPath(key, options)), function (res) {

        res.setEncoding('utf-8');

        var data = '';

        res.on('data', function (d) {

            data = data + d;
        });

        res.on('end', function () {

            var response = JSON.parse(data);

            if (etcd.asJSON) {

                return callback(null, parseResponse(response));
            }

            callback(null, response);
        });
    }).on('error', callback);
};

Etcd.prototype.watch = function (key, options, callback) {

    options.wait = true;

    this.get(key, options, callback);
};

function parseResponse (response) {
    return responseParsers[response.action](response.node);
}

var responseParsers = {
    set: function (node) {
        return node;
    },
    delete: function (node) {
        return node;
    },
    get: function walkResponse (node) {

        var obj = {};
        var nodes = node.nodes || [node];

        nodes.forEach(function (n) {

            var name = n.key.slice(node.key.length + 1);

            if (n.dir) {
                obj[name] = responseParsers.get(n);
            } else {
                obj[name] = n.value;
            }
        });

        return obj;
    }
};
