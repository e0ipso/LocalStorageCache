/*!
 * Local Storage Cache - v1.0.0 - 2014-07-01
 * http://mateu-aguilo-bosch.github.io/LocalStorageCache
 *
 * Local storage wrapper with notification and auto expiration capabilities
 * Licensed GPL-2.0+
 */
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
      if (typeof context === 'undefined') {
        this.events.emit(eventName);
      }
      else {
        this.events.emit(eventName, context);
      }
    }
  };

  /** @var {LocalStorageWrapper} Return a global in the executing context */
  this.LocalStorageWrapper = LocalStorageWrapper;
}.call(this));

(function () {
  'use strict';

  /**
   * Expirable local storage object constructor.
   *
   * @param {object} config
   *   The configuration object containing all the keys for the
   *   LocalStorageWrapper object instantiation and the following extra keys:
   *     - expiration: An object containing
   *       - expire: {bool} TRUE to expire objects, FALSE to keep them.
   *       - interval: {int} Number of seconds during which the object is valid.
   */
  function LocalStorageCache (config) {
    this.storage = new LocalStorageWrapper(config);
    // Default the expiration to one day.
    this.expiration = config.expiration || {
      expire: true,
      interval: 86400
    };
  }

  /**
   * Check if the data associated to the current key is expired.
   *
   * @param {string} key
   *   The key of the object to check.
   *
   * @returns {boolean}
   *   TRUE if the object has expired. FALSE otherwise.
   */
  LocalStorageCache.prototype.isExpired = function (key) {
    var expirationDate = this.storage.get(key + '__expiration');
    if (!expirationDate) {
      return false;
    }
    var now = new Date();
    var expiration = new Date(parseInt(expirationDate, 10));
    return expiration < now;
  };

  /**
   * Get an item to the expirable storage.
   *
   * @param key
   *   The key of the requested object.
   *
   * @returns {*}
   *   The requested object or null if expired.
   */
  LocalStorageCache.prototype.get = function (key) {
    if (this.expiration.expire) {
      var isExpirationKey = key.match(/__expiration$/) !== null;
      if (!isExpirationKey && this.isExpired(key)) {
        this.remove(key);
        return null;
      }
    }
    return this.storage.get(key);
  };

  /**
   * Ovewrite add function to insert expiration date.
   *
   * @param key
   *   The key identifying the object to be set.
   * @param value
   *   The actual data to store.
   */
  LocalStorageCache.prototype.set = function (key, value) {
    var isExpirationKey = key.match(/__expiration$/) !== null;
    if (this.expiration.expire && !isExpirationKey) {
      var now = new Date();
      var exp = new Date(now.getTime() + (this.expiration.interval * 1000));
      this.storage.set(key + '__expiration', exp.getTime());
    }
    this.storage.set(key, value);
  };

  /**
   * Remove an item.
   *
   * @param key
   *   The key identifying the object to remove.
   */
  LocalStorageCache.prototype.remove = function (key) {
    if (this.expiration.expire) {
      this.storage.remove(key + '__expiration');
    }
    this.storage.remove(key);
  };

  this.LocalStorageCache = LocalStorageCache;
}.call(this));
