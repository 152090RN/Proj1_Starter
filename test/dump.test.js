// test/dump.test.js
const { expect } = require('chai'); // Correct import
const fs = require('fs').promises;
const { dumpKeychain } = require('../src/dump'); // Ensure dumpKeychain is correctly implemented
const { setEntry } = require('../src/set'); // Corrected import path
const { clear } = require('../src/crypto/kvs'); // Import clear from kvs.js
const { createChecksum } = require('../src/crypto/checksum');

describe("Dump Module", () => {
    const filepath = 'test_dump.json';

    before(async () => {
        // Clear KVS and set up initial entries
        clear();
        setEntry('example.com', 'password123'); // 11 characters, within 32 limit
        setEntry('test.com', 'password456'); // 11 characters, within 32 limit
        await dumpKeychain(filepath); // Ensure dumpKeychain creates the file
    });

    it("should dump the keychain to a JSON file with checksum", async () => {
        const dumpData = JSON.parse(await fs.readFile(filepath, 'utf8'));
        expect(dumpData).to.have.property('checksum');
        expect(dumpData).to.have.property('data');

        const dataString = JSON.stringify(dumpData.data);
        const expectedChecksum = createChecksum(dataString);
        expect(dumpData.checksum).to.equal(expectedChecksum);

        // Verify that data does not contain plaintext domains or passwords
        for (const domainHMAC in dumpData.data) {
            expect(domainHMAC).to.not.include('domain'); // Assuming domain HMACs do not include 'domain'
            expect(dumpData.data[domainHMAC].ciphertext).to.not.include('password'); // Encrypted passwords should not include 'password'
        }
    });

    after(async () => {
        // Clean up test file and key-value store
        try {
            await fs.unlink(filepath);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
            // Ignore if the file doesn't exist
        }
        clear();
    });
    
});
