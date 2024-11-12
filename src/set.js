// src/set.js

console.log("Starting script")

const crypto = require('crypto');
const { set } = require('./crypto/kvs');
const { hmacDomain } = require('./crypto/hashing');
const { padPassword } = require('./crypto/padding');
const { getMasterKey } = require('./init');

/**
 * Sets an entry with an encrypted password.
 * @param {string} domain - The domain name.
 * @param {string} password - The plaintext password.
 */
function setEntry(domain, password) {
    try {
        if (typeof domain !== 'string' || typeof password !== 'string') {
            throw new Error('Domain and password must be strings.');
        }

        console.log(`Setting entry for domain: ${domain}`);
        console.log(`Password length: ${password.length}`);

        // Generate HMAC for the domain using the master key
        const domainHMAC = hmacDomain(domain, getMasterKey());
        console.log('Generated HMAC for domain:', domainHMAC);

        // Pad the password to a fixed length (e.g., 32 characters)
        const paddedPassword = padPassword(password, 32); // Ensure padPassword accepts length as second argument
        console.log('Padded password:', paddedPassword);

        // Encrypt the padded password using AES-GCM
        const iv = crypto.randomBytes(12); // 96-bit IV for AES-GCM
        console.log('Generated IV for encryption:', iv.toString('hex'));

        const cipher = crypto.createCipheriv('aes-256-gcm', getMasterKey(), iv);
        let encrypted = cipher.update(paddedPassword, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        console.log('Generated encrypted password:', encrypted);
        console.log('Generated auth tag:', authTag);

        // Store the encrypted password along with IV and authTag
        const encryptedPassword = {
            iv: iv.toString('hex'),
            authTag,
            ciphertext: encrypted
        };

        // Set the entry in the Key-Value Store
        set(domainHMAC, encryptedPassword);
        console.log('Entry set successfully in KVS.');
    } catch (error) {
        console.error('Error in setEntry:', error);
        throw error;
    }
}

module.exports = {
    setEntry
};
