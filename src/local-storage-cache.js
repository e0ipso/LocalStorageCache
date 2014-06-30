/*global LocalStorageWrapper*/
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
