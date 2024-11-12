// src/crypto/checksum.js
const crypto = require('crypto');

/**
 * Creates a SHA-256 checksum of the given data.
 * @param {string} data - The data to checksum.
 * @returns {string} - The hexadecimal representation of the checksum.
 */
function createChecksum(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Verifies that the checksum matches the data.
 * @param {string} data - The data to verify.
 * @param {string} checksum - The expected checksum.
 * @returns {boolean} - True if the checksum matches, false otherwise.
 */
function verifyChecksum(data, checksum) {
    const calculated = createChecksum(data);
    return calculated === checksum;
}

module.exports = {
    createChecksum,
    verifyChecksum
};
