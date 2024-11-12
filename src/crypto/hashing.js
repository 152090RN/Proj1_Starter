// src/crypto/hashing.js
const crypto = require('crypto');
const { getMasterKey } = require('../init');

/**
 * Generates an HMAC for a given domain using SHA-256.
 * @param {string} domain - The domain name.
 * @param {Buffer} [key] - Optional HMAC key. If not provided, uses the master key.
 * @returns {string} The HMAC in hexadecimal format.
 */
function hmacDomain(domain, key = getMasterKey()) {
    if (typeof domain !== 'string') {
        throw new Error('Domain must be a string.');
    }

    if (!Buffer.isBuffer(key)) {
        throw new Error('Key must be a Buffer.');
    }

    const hmac = crypto.createHmac('sha256', key);
    hmac.update(domain);
    return hmac.digest('hex');
}

module.exports = {
    hmacDomain
};
