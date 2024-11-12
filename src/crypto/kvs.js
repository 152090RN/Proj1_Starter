// src/crypto/kvs.js

// In-memory Key-Value Store
const store = {};

/**
 * Sets a key-value pair in the store.
 * @param {string} key - The key (HMAC of the domain).
 * @param {any} value - The value (e.g., encrypted password).
 */
function set(key, value) {
    store[key] = value;
}

/**
 * Retrieves a value by key from the store.
 * @param {string} key - The key to retrieve.
 * @returns {any} The value associated with the key.
 */
function get(key) {
    return store[key];
}

/**
 * Retrieves all key-value pairs from the store.
 * @returns {Object} An object containing all key-value pairs.
 */
function getAllEntries() {
    return { ...store };
}

/**
 * Removes a key-value pair from the store.
 * @param {string} key - The key to remove.
 */
function remove(key) {
    delete store[key];
}

/**
 * Clears the entire store (useful for testing).
 */
function clear() {
    for (const key in store) {
        delete store[key];
    }
}

module.exports = {
    set,
    get,
    getAllEntries,
    remove,
    clear
};
