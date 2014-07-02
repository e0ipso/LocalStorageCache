/*global QUnit*/
(function () {
  'use strict';
  QUnit.module('Local Storage Cache');
  QUnit.test('Test cache storage', function(assert) {
    assert.ok(LocalStorageWrapper, 'LocalStorageWrapper global object exists.' );
    assert.ok(LocalStorageCache, 'LocalStorageCache global object exists.' );

    var prefix = 'testingSuite', triggered = false, customEventsSupported = false;
    // Test localStorage cache.
    var wrapper = new LocalStorageWrapper({
      prefix: prefix,
      notify: {
        setItem: true,
        getItem: false,
        removeItem: false,
        listItems: false
      }
    });

    var object = {
      key: 'value'
    };

    try {
      new CustomEvent();
      customEventsSupported = true;
    }
    catch (e) {}

    if (customEventsSupported) {
      var listener = function (event) {
        triggered = true;
        assert.ok(event.detail.prefix === 'testingSuite.', 'Correct event prefix context set.');
        assert.ok(event.detail.value === JSON.stringify(object), 'Correct event value context set.');
        // Once is enough.
        window.removeEventListener(event.type, listener);
      };
      window.addEventListener('local-storage-set', listener);
    }

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

    if (customEventsSupported) {
      // Make sure the event was triggered if CustomEvent is supported.
      assert.ok(triggered, 'Event was triggered.');
    }
  });
}());
