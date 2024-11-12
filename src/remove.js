// src/remove.js

console.log("Starting script")

const { remove } = require('./crypto/kvs');
const { hmacDomain } = require('./crypto/hashing');
const { getMasterKey } = require('./init');

/**
 * Removes the password entry for a given domain.
 * @param {string} domain - The domain name.
 */
function removeEntry(domain) {
    try {
        if (typeof domain !== 'string') {
            throw new Error('Domain must be a string.');
        }

        console.log(`Removing entry for domain: ${domain}`);

        const domainHMAC = hmacDomain(domain, getMasterKey());
        console.log('Generated HMAC for domain:', domainHMAC);

        remove(domainHMAC);
        console.log(`Entry for domain HMAC: ${domainHMAC} removed successfully.`);
    } catch (error) {
        console.error('Error in removeEntry:', error);
        throw error;
    }
}

module.exports = {
    removeEntry
};

