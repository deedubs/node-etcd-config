node-etcd-config
================

Returns a configuration object from etcd

## Usage

```
// initiate EtcdConfig
var appConfig = new EtcdConfig({connectionString: 'http://127.0.0.1:4001/', jsonKeys: true });
appConfig.identify('my-app');
appConfig.load(function _loadPluginConfig (err, config) {
    console.log('config loaded: %j', config);
});
```

## Options
passed as an object to constructor
* connectionString: url of etcd http api (required)
* jsonKeys: set to `true` if configuration values saved as JSON in etcd. Defaults to false (optional)

## Methods
* identify(applicatioName): identifies where to find the etcd keys for config using tree pattern /applications/{applicationName}
* load(callback): callback called when config parsed from etcd. callback signature is `function(err, config)`

## Events
* 'changed': fired on changes to etcd keys, returning a `changed` object
