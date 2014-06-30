/*global EventEmmitter*/
(function () {
  'use strict';
  /**
   * Local Storage Wrapper constructor.
   *
   * @param {object} config
   *   The configuration object. An object having:
   *     - prefix: the prefix used to namespace the key values under the current
   *       object instance.
   *     - notify: an object containing a list of events to trigger: 'setItem',
   *       'removeItem', 'getItem' and 'listItems'.
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

    // Notification capabilities only if the library is present.
    this.events = null;
    if (typeof EventEmitter !== 'undefined') {
      this.events = new EventEmitter();
    }

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
   *
   * @param {string} key
   *   The key for the data to set.
   * @param {*} value
   *   The value to set. It will be JSON encoded to store it as a string in the
   *   browser's localStorage.
   */
  LocalStorageWrapper.prototype.set = function (key, value) {
    localStorage.setItem(this.prefix + key, value = JSON.stringify(value));
    if (this.notify.setItem) {
      this.trigger('local-storage-set', {
        prefix: this.prefix,
        key: key,
        value: value
      });
    }
  };

  /**
   * Remove a value to the local storage.
   *
   * @param {string} key
   *   The key identifying the data to remove.
   */
  LocalStorageWrapper.prototype.remove = function (key) {
    localStorage.removeItem(this.prefix + key);
    if (this.notify.removeItem) {
      this.trigger('local-storage-remove', {
        prefix: this.prefix,
        key: key
      });
    }
  };

  /**
   * Get a value to the local storage.
   *
   * @param {string} key
   *   The key of the data to get.
   *
   * @return {*|null}
   *   The value stored using this.get. The value will be JSON decoded to return
   *   the parsed value.
   */
  LocalStorageWrapper.prototype.get = function (key) {
    var item = localStorage.getItem(this.prefix + key);
    item = JSON.parse(item);
    if (this.notify.getItem) {
      this.trigger('local-storage-get', {
        prefix: this.prefix,
        key: key
      });
    }
    return item;
  };

  /**
   * Get a list of all the keys stored by the instance.
   *
   * @return {Array}
   *   An array of all the localStorage objects stored under the prefix of the
   *   current LocalStorageWrapper object instance.
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
      this.trigger('local-storage-list', {
        prefix: this.prefix
      });
    }
    return keys;
  };

  /**
   * Clear the local storage for the current prefix.
   */
  LocalStorageWrapper.prototype.clear = function () {
    var keys = this.list();
    for (var index = 0; index < keys.length; index++) {
      this.remove(keys[index]);
    }
  };

  /**
   * Trigger the event using the external library.
   *
   * @param {string} eventName
   *   The name of the event to emit.
   * @param {*} context
   *   The context variable to submit along with the event.
   */
  LocalStorageWrapper.prototype.trigger = function (eventName, context) {
    if (this.events) {
      if (typeof context !== 'undefined') {
        this.events.emit(eventName);
      }
      else {
        this.events.emit(eventName, [context]);
      }
    }
  };

  /** @var {LocalStorageWrapper} Return a global in the executing context */
  this.LocalStorageWrapper = LocalStorageWrapper;
}.call(this));
