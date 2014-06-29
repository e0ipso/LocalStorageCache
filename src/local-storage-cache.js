/*global LocalStorageWrapper*/
(function () {
  'use strict';

  /**
   * Expirable local storage.
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
   * @param key
   * @returns {boolean}
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
   * @returns {*}
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
   * @param value
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
   */
  LocalStorageCache.prototype.remove = function (key) {
    if (this.expiration.expire) {
      this.storage.remove(key + '__expiration');
    }
    this.storage.remove(key);
  };

  this.LocalStorageCache = LocalStorageCache;
}.call(this));
