// test/hashing.test.js
const { expect } = require('chai'); // Correct import
const { hmacDomain } = require('../src/crypto/hashing');

describe("Hashing Module", () => {
    describe("hmacDomain", () => {
        it("should generate a consistent HMAC for the same domain", () => {
            const key = Buffer.from('testkey1234567890testkey1234567890', 'utf8'); // 32-byte key
            const domain = 'example.com';
            const hmac1 = hmacDomain(domain, key);
            const hmac2 = hmacDomain(domain, key);
            expect(hmac1).to.equal(hmac2);
        });

        it("should generate different HMACs for different domains", () => {
            const key = Buffer.from('testkey1234567890testkey1234567890', 'utf8'); // 32-byte key
            const domain1 = 'example.com';
            const domain2 = 'test.com';
            const hmac1 = hmacDomain(domain1, key);
            const hmac2 = hmacDomain(domain2, key);
            expect(hmac1).to.not.equal(hmac2);
        });

        it("should produce HMACs of correct length (64 hex characters for SHA-256)", () => {
            const key = Buffer.from('testkey1234567890testkey1234567890', 'utf8'); // 32-byte key
            const domain = 'example.com';
            const hmac = hmacDomain(domain, key);
            expect(hmac).to.be.a('string').with.lengthOf(64);
        });

        it("should throw an error if domain is not a string", () => {
            const key = Buffer.from('testkey1234567890testkey1234567890', 'utf8'); // 32-byte key
            expect(() => hmacDomain(12345, key)).to.throw('Domain must be a string.');
        });

        it("should handle empty string as domain", () => {
            const key = Buffer.from('testkey1234567890testkey1234567890', 'utf8'); // 32-byte key
            const domain = '';
            const hmac = hmacDomain(domain, key);
            expect(hmac).to.be.a('string').with.lengthOf(64);
        });
    });
});
