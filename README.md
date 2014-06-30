[![Build Status](https://travis-ci.org/mateu-aguilo-bosch/LocalStorageCache.svg?branch=master)](https://travis-ci.org/mateu-aguilo-bosch/LocalStorageCache)
LocalStorageCache
=================

**Minimal** Javascript wrapper around HTML5 localStorage with auto expiration
capabilities.

## Installation
You can install this by:
  - Cloning this repo and using the `local-storage-expirable.min.js` in the
    `dist` folder.
  - Doing `bower install LocalStorageCache`. Then run `grunt` (see the
    _Minification and Testing_ section).

## Minification and Testing
You can minify the source files by running `grunt` while in the library folder.
If you don't have the dependencies, run `npm install` first. The result files
will be stored in the `dist` folder.

You can test the library by running `npm test`. This will check for JSHint
notices and it will run the QUnit tests in a PhantomJS browser.

## Usage

```js
var storage = new LocalStorageCache(options);

// Set a variable.
storage.set('key', {
  foo: 'bar'
});

// Get a variable.
storage.get('key');
```

### Options
#### LocalStorageWrapper
You can pass several options to the LocalStorageWrapper constructor. An object
having:
  - prefix: the prefix used to namespace the key values under the current
  - object instance.
  - notify: an object containing a list of events to trigger: 'setItem',
    'removeItem', 'getItem' and 'listItems'.

```js
var storage, config = {
  prefix: 'root.namespace1',
  notify: {
    setItem: true,
    getItem: false,
    removeItem: true,
    listItems: false,
  }
};

// Create the object instance.
storage = new LocalStorageWrapper(config);
```

#### LocalStorageCache
You can pass several options to the LocalStorageCache constructor. The
configuration object containing all the keys for the LocalStorageWrapper object
instantiation and the following extra keys:

  - expiration: An object containing:

    * expire: {bool} TRUE to expire objects, FALSE to keep them.
    * interval: {int} Number of seconds during which the object is valid.

```js
var expirableStorage, config = {
  prefix: 'root.expirable.namespace2',
  notify: {
    setItem: true,
    getItem: false,
    removeItem: true,
    listItems: false,
  },
  expiration: {
    expire: true,
    // 5 minutes.
    interval: 300
  }
};

// Create the object instance.
expirableStorage = new LocalStorageCache(config);

// You can access the LocalStorageWrapper instance.
console.debug(expirableStorage.storage);
```

### Dependencies
None. You don't need anything else to work with the LocalStorageCache or
LocalStorageWrapper libraries.

If you install the [EventEmitter](https://github.com/Wolfy87/EventEmitter)
library you will get notifications for free. These events are triggered when an
operation is made. Just use to subscribe to the following events:

  * `local-storage-set`. Will get as a context: the storage prefix, the key and the value to set.
  * `local-storage-get`. Will get as a context: the storage prefix and the key.
  * `local-storage-remove`. Will get as a context: the storage prefix and the key.
  * `local-storage-list`. Will get as a context: the storage prefix.

Example:

```js
var events = new EventEmitter();
events.on('local-storage-set', function (context) {
  console.debug('LocalStorageWrapper: variable set');
  console.debug(context);
});

// …

storage.set('my-foo-key', 'Hello World.');
```
