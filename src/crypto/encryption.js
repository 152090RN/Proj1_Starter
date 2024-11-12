// src/crypto/encryption.js

const crypto = require('crypto');
const { getMasterKey } = require('../init');

/**
 * Encrypts the given data using AES-256-GCM.
 * @param {Buffer|string} data - The data to encrypt.
 * @returns {Object} - An object containing the IV, authTag, and ciphertext.
 */
function encryptData(data) {
    const key = getMasterKey();
    const iv = crypto.randomBytes(12); // 96-bit IV for AES-GCM

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let ciphertext = cipher.update(data, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return {
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        ciphertext
    };
}

/**
 * Decrypts the given encrypted data using AES-256-GCM.
 * @param {Object} encryptedData - The encrypted data object.
 * @returns {string} - The decrypted data.
 */
function decryptData(encryptedData) {
    const { iv, authTag, ciphertext } = encryptedData;
    const key = getMasterKey();

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

module.exports = {
    encryptData,
    decryptData
};
