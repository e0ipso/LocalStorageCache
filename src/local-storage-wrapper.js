/*global EventEmmitter*/
(function () {
  'use strict';
  /**
   * Local Storage Wrapper.
   */
  function LocalStorageWrapper(config) {
    var isLocalStorageSupported = function () {
      try {
        return 'localStorage' in window && window.localStorage !== null;
      } catch (e) {
        return false;
      }
    };
    if (!isLocalStorageSupported()) {
      throw new Error('Local storage not supported');
    }
    this.events = new EventEmitter();

    this.prefix = config.prefix || 'ls';
    // If there is a prefix set in the config lets use that with an appended period for readability
    if (this.prefix.substr(-1) !== '.') {
      this.prefix = !!this.prefix ? this.prefix + '.' : '';
    }
    this.notify = config.notify || {
      setItem: false,
      removeItem: false,
      getItem: false,
      listItems: false
    };
  }

  /**
   * Set a value to the local storage.
   */
  LocalStorageWrapper.prototype.set = function (key, value) {
    localStorage.setItem(this.prefix + key, value = JSON.stringify(value));
    if (this.notify.setItem) {
      this.events.emit('local-storage-set', {
        prefix: this.prefix,
        key: key,
        value: value
      });
    }
  };

  /**
   * Remove a value to the local storage.
   */
  LocalStorageWrapper.prototype.remove = function (key) {
    localStorage.removeItem(this.prefix + key);
    if (this.notify.removeItem) {
      this.events.emit('local-storage-remove', {
        prefix: this.prefix,
        key: key
      });
    }
  };

  /**
   * Get a value to the local storage.
   */
  LocalStorageWrapper.prototype.get = function (key) {
    var item = localStorage.getItem(this.prefix + key);
    item = JSON.parse(item);
    if (this.notify.getItem) {
      this.events.emit('local-storage-get', {
        prefix: this.prefix,
        key: key
      });
    }
    return item;
  };

  /**
   * Get a list of all the keys stored by the instance.
   */
  LocalStorageWrapper.prototype.list = function () {
    var prefixLength = this.prefix.length;
    var keys = [];
    for (var key in localStorage) {
      // Only return keys that are for this app
      if (key.substr(0, prefixLength) === this.prefix) {
        keys.push(key.substr(prefixLength));
      }
    }
    if (this.notify.listItems) {
      this.events.emit('local-storage-list');
    }
    return keys;
  };

  /**
   * Clear the local storage.
   */
  LocalStorageWrapper.prototype.clear = function () {
    var keys = this.list();
    for (var index = 0; index < keys.length; index++) {
      this.remove(keys[index]);
    }
  };

  this.LocalStorageWrapper = LocalStorageWrapper;
}.call(this));
