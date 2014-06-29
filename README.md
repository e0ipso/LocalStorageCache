[![Build Status](https://travis-ci.org/mateu-aguilo-bosch/LocalStorageCache.svg?branch=master)](https://travis-ci.org/mateu-aguilo-bosch/LocalStorageCache)

LocalStorageCache
=================

Javascript wrapper around HTML5 localStorage with auto expiration capabilities.

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

### Dependencies

### Options
