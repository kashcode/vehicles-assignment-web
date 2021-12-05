/**
 * Cache
 */
export default class Cache {
  /**
   * Save value in cache with TTL (time to live) expirity
   * 
   * @param {string} key - Key for stored value
   * @param {any} value - Value to cache
   * @param {number} ttl - TTL in milliseconds
   */
  set(key, value, ttl) {
    const now = new Date();

    const item = {
      value: value,
      expiry: now.getTime() + ttl,
    };

    localStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * Get value from cache
   * 
   * @param {string} key - Key for stored value
   * @returns 
   */
  get(key) {
    const itemStr = localStorage.getItem(key);

    if (!itemStr) {
      return null;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  }
}
