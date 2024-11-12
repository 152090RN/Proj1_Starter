// src/load.js

console.log("Starting script")

const fs = require('fs').promises;
const { set } = require('./crypto/kvs');
const { createChecksum } = require('./crypto/checksum');
const { getMasterKey } = require('./init');
const { hmacDomain } = require('./crypto/hashing');

async function loadKeychain(filepath) {
    try {
        console.log(`Loading keychain from: ${filepath}`);

        // Read the file and parse the JSON
        const data = await fs.readFile(filepath, 'utf8');
        console.log('File read successfully.');

        const { checksum, data: entries } = JSON.parse(data);
        console.log('Keychain data parsed successfully.');

        // Verify checksum
        const dataString = JSON.stringify(entries);
        const calculatedChecksum = createChecksum(dataString);
        console.log('Calculated checksum:', calculatedChecksum);

        if (checksum !== calculatedChecksum) {
            throw new Error('Checksum verification failed');
        }
        console.log('Checksum verification successful.');

        // Load entries into KVS
        for (const domainHMAC in entries) {
            const entry = entries[domainHMAC];
            console.log(`Setting entry for domain HMAC: ${domainHMAC}`);
            set(domainHMAC, entry);
        }
        console.log('Keychain entries loaded into KVS successfully.');
    } catch (error) {
        console.error('Error in loadKeychain:', error);
        throw error;
    }
}

module.exports = {
    loadKeychain
};
