// test/set.test.js
const { expect } = require('chai'); // Correct import
const { setEntry } = require('../src/set'); // Correct import path
const { getEntry } = require('../src/get'); // Correct import path
const { clear } = require('../src/crypto/kvs'); // Correct import path
const { hmacDomain } = require('../src/crypto/hashing'); // Correct import
const { getMasterKey } = require('../src/init'); // Correct import
const crypto = require('crypto');
const { unpadPassword } = require('../src/crypto/padding');
const { get } = require('../src/crypto/kvs');


describe("Set Module", () => {
    before(() => {
        // Clear KVS before tests
        clear();
    });

    after(() => {
        // Clean up after tests
        clear();
    });

    it("should set an entry with encrypted password", () => {
        setEntry('example.com', 'password123');
        const hmac = hmacDomain('example.com', getMasterKey());
        const storedEntry = get(hmac);
    
        expect(storedEntry).to.be.an('object').that.has.all.keys('iv', 'authTag', 'ciphertext');
    });
    it("should pad the password to fixed length", () => {
        setEntry('test.com', 'pass');
        const hmac = hmacDomain('test.com', getMasterKey());
        const storedEntry = get(hmac);
    
        // Verify that all necessary fields are present
        expect(storedEntry).to.have.property('iv').that.is.a('string');
        expect(storedEntry).to.have.property('authTag').that.is.a('string');
        expect(storedEntry).to.have.property('ciphertext').that.is.a('string');
    
        // Proceed with decryption
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            getMasterKey(),
            Buffer.from(storedEntry.iv, 'hex')
        );
        decipher.setAuthTag(Buffer.from(storedEntry.authTag, 'hex'));
        let decrypted = decipher.update(storedEntry.ciphertext, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        const originalPassword = unpadPassword(decrypted);
    
        expect(originalPassword).to.equal('pass');
        expect(decrypted).to.have.lengthOf(32); // Padded length
    });
    
});
