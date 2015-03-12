node-etcd-config
================

Returns a configuration object from etcd

## Usage

```
// initiate EtcdConfig
var appConfig = new EtcdConfig({connectionString: 'http://127.0.0.1:4001/', jsonKeys: true });

// identify application
appConfig.identify('my-app');

// load the configuration
appConfig.load(function (err, config) {
    console.log('config loaded: %j', config);

    appConfig.on('changed', function (item) {
        console.log('key % changed', item.key);
    });
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

## Testing
To run the tests, an instance of etcd must be available at `http://127.0.0.1:4001`