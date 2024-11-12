// src/get.js
console.log("Starting script")

const crypto = require('crypto');
const { get } = require('./crypto/kvs');
const { hmacDomain } = require('./crypto/hashing');
const { unpadPassword } = require('./crypto/padding');
const { getMasterKey } = require('./init'); // Correctly import getMasterKey

/**
 * Retrieves and decrypts the password for a given domain.
 * @param {string} domain - The domain name.
 * @returns {string} The decrypted password.
 */
function getEntry(domain) {
    if (typeof domain !== 'string') {
        console.error("Invalid domain type");
        throw new Error('Domain must be a string.');
    }

    try {
        console.log("Generating HMAC for the domain");
        const domainHMAC = hmacDomain(domain, getMasterKey());

        console.log("Retrieving encrypted password from KVS");
        const encryptedPassword = get(domainHMAC);
        if (!encryptedPassword) {
            console.error("Domain does not exist in KVS");
            throw new Error('Domain does not exist');
        }

        const { iv, authTag, ciphertext } = encryptedPassword;
        console.log("Decrypting the password");

        const decipher = crypto.createDecipheriv('aes-256-gcm', getMasterKey(), Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        console.log("Unpadding the decrypted password");
        const unpaddedPassword = unpadPassword(decrypted);

        return unpaddedPassword;
    } catch (error) {
        console.error("Error in getEntry:", error.message);
        throw new Error("Failed to retrieve and decrypt the password");
    }
}

module.exports = {
    getEntry
};
