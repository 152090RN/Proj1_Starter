// test/load.test.js

const { expect } = require('chai');
const fs = require('fs').promises;
const path = require('path');
const { loadKeychain } = require('../src/load');
const { dumpKeychain } = require('../src/dump');
const { setEntry } = require('../src/set');
const { clear, getAllEntries } = require('../src/crypto/kvs');
const { getEntry } = require('../src/get');

describe("Load Module", () => {
    const filepath = path.resolve(__dirname, 'test_dump.json');

    before(async () => {
        // Clear KVS and set up initial entries
        clear();
        setEntry('example.com', 'password123');
        setEntry('test.com', 'password456');

        // Dump the keychain to a file
        await dumpKeychain(filepath);
        console.log(`Dump file created at ${filepath}`);

        // Verify the file exists
        try {
            await fs.access(filepath);
            console.log('Dump file verified to exist');
        } catch (err) {
            console.error('Dump file does not exist:', err);
            throw err; // Rethrow to fail the setup if dump fails
        }
    });

    it("should load the keychain from a JSON file and verify checksum", async () => {
        // Clear the KVS to simulate loading fresh data
        clear();

        // Load the keychain from the file
        await loadKeychain(filepath);

        // Verify that the entries are correctly loaded
        const password1 = getEntry('example.com');
        const password2 = getEntry('test.com');

        expect(password1).to.equal('password123');
        expect(password2).to.equal('password456');
    });

    after(async () => {
        // Clean up test file and key-value store
        try {
            await fs.unlink(filepath);
            console.log(`Dump file ${filepath} deleted`);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                console.error('Error deleting dump file:', err);
                throw err;
            }
            // If file doesn't exist, no action needed
        }
        clear();
    });
});
