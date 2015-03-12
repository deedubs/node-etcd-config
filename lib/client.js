var http = require('http');
var url = require('url');
var querystring = require('querystring');

module.exports = Etcd;

function Etcd(connectionString, jsonKeys) {

    var urlParts = url.parse(connectionString || "");
    var query = querystring.parse(urlParts.query);

    this.host = urlParts.hostname || '127.0.0.1';
    this.port = urlParts.port || 4001;
    this.asJSON = query.json;
    this.jsonKeys = jsonKeys;
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

            etcd.configData = null;
            (function _getParser (next) {
                var response;
                if (data) {
                    try {
                        response = JSON.parse(data);
                    }
                    catch (e) {
                        return callback(e);
                    }

                    if (response.errorCode) {
                        return callback(new Error(response));
                    }

                    if (etcd.asJSON) {
                        return next(etcd._parseResponse(response));
                    }
                    return next(response);
                }
                return next(null);
            })(function (config) {
                if (config) {
                    etcd.configData = config;
                }
                callback(null, etcd.configData);
            });
        });
    }).on('error', callback);
};

Etcd.prototype.watch = function (key, options, callback) {

    options.wait = true;

    this.get(key, options, callback);
};

Etcd.prototype._parseResponse = function (response) {

    return responseParsers[response.action].call(this, response.node);
};

var responseParsers = {
    set: function (node) {
        if (this.jsonKeys) {
            try {
                node.value = JSON.parse(node.value);
            }
            catch (e) {
                console.log('WARN: key cannot be parsed as JSON');
            }
        }
        node.method = 'set';
        return node;
    },
    delete: function (node) {
        node.method = 'delete';
        return node;
    },
    get: function walkResponse (node) {
        var self = this;
        var obj = {};
        var nodes = node.nodes || [node];

        nodes.forEach(function (n) {

            var name = n.key.slice(node.key.length + 1);

            if (n.dir) {
                obj[name] = responseParsers.get.call(self, n);
            } else if (self.jsonKeys) {
                try {
                    obj[name] = JSON.parse(n.value);
                }
                catch (e) {
                    obj[name] = n.value;
                }
            } else {
                obj[name] = n.value;
            }
        });

        return obj;
    }
};
