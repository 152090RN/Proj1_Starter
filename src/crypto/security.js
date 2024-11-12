// src/crypto/security.js

const crypto = require('crypto');

/**
 * Generates a dummy HMAC to obscure the actual number of records.
 * @param {Buffer} key - The cryptographic key for HMAC.
 * @returns {string} - A dummy HMAC.
 */
function generateDummyHMAC(key) {
    const dummyData = crypto.randomBytes(32).toString('hex');
    return crypto.createHmac('sha256', key).update(dummyData).digest('hex');
}

module.exports = { generateDummyHMAC };
