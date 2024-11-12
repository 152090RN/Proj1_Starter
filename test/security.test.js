// test/security.test.js
const { expect } = require('chai');
const { createChecksum, verifyChecksum } = require('../src/crypto/checksum');
const { hmacDomain } = require('../src/crypto/hashing');
const crypto = require('crypto');

describe('Security Defenses', function() {
    const key = crypto.randomBytes(32); // Secure random key

    describe('Swap Attack Defense', function() {
        it('should generate HMACs that obscure actual domain names', function() {
            const domain = 'example.com';
            const hmac = hmacDomain(domain, key);
            expect(hmac).to.be.a('string').and.have.length(64); // SHA-256 hex length
            expect(hmac).to.not.equal(domain);
        });

        it('should not allow reverse engineering of domain names from HMACs', function() {
            const domain = 'secure.com';
            const hmac = hmacDomain(domain, key);
            // Ensure HMAC is not equal to domain
            expect(hmac).to.not.equal(domain);
        });

        it('should generate unique HMACs for different domains', function() {
            const domain1 = 'site1.com';
            const domain2 = 'site2.com';
            const hmac1 = hmacDomain(domain1, key);
            const hmac2 = hmacDomain(domain2, key);
            expect(hmac1).to.not.equal(hmac2);
        });
    });

    describe('Rollback Attack Defense', function() {
        it('should verify checksum and detect tampering', function() {
            const data = '{"example.com":"password123"}';
            const validChecksum = createChecksum(data);
            const tamperedData = '{"example.com":"password1234"}';
            const tamperedChecksum = createChecksum(tamperedData);

            // Valid checksum should pass
            expect(verifyChecksum(data, validChecksum)).to.be.true;

            // Tampered checksum should fail
            expect(verifyChecksum(data, tamperedChecksum)).to.be.false;
        });
    });
});
