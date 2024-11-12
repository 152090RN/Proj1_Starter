// src/dump.js

console.log("Script started");

const fs = require('fs').promises;
const { getAllEntries } = require('./crypto/kvs');
const { createChecksum } = require('./crypto/checksum');

/**
 * Dumps the keychain data to a JSON file.
 * @param {string} filepath - The path to the output file.
 */
async function dumpKeychain(filepath) {
    try {
        console.log("Retrieving all entries from the key-value store...");

        const entries = await getAllEntries(); // Retrieve all entries from the KVS
        console.log("Entries retrieved:", entries);

        const dataString = JSON.stringify(entries);
        const checksum = createChecksum(dataString);
        console.log("Checksum created:", checksum);

        const dumpData = {
            checksum,
            data: entries
        };

        console.log("Writing dump data to file:", filepath);
        await fs.writeFile(filepath, JSON.stringify(dumpData, null, 2), 'utf8');
        console.log("Data successfully written to", filepath);

    } catch (error) {
        console.error("An error occurred while dumping keychain data:", error);
    }
}

// Call the function with a sample file path to test
dumpKeychain("keychain_dump.json");

module.exports = {
    dumpKeychain
};
