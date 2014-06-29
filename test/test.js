/*global QUnit*/
(function () {
  'use strict';
  QUnit.module('Local Storage Cache');
  QUnit.test('Test cache storage', function(assert) {
    assert.ok(LocalStorageWrapper, 'LocalStorageWrapper global object exists.' );
    assert.ok(LocalStorageCache, 'LocalStorageCache global object exists.' );

    var prefix = 'testingSuite';
    // Test localStorage cache.
    var wrapper = new LocalStorageWrapper({
      prefix: prefix
    });

    var object = {
      key: 'value'
    };

    var index, list, items = 10;
    for (index = 0; index < items; index++) {
      wrapper.set('test_' + index, object);
    }
    list = wrapper.list();
    assert.ok(list.length === items, 'Retrieved list of objects.');

    assert.ok(localStorage.getItem(prefix + '.test_0'), 'Namespace prefixed set correctly.');

    // Test localStorage cache.
    var storage = new LocalStorageCache({
      prefix: 'testingSuite'
    });

    storage.set('test', object);
    assert.deepEqual(object, storage.get('test'), 'Retrieved stored object.' );

    // Fake the expiration timestamp.
    storage.storage.set('test__expiration', new Date().getTime() - 1);
    assert.ok(storage.get('test') === null, 'Expired stored object.');

    // Test removal.
    storage.set('test', object);
    storage.remove('test');
    assert.ok(storage.get('test') === null, 'Removed object.');
  });
}());
