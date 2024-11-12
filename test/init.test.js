// test/init.test.js
const { expect } = require('chai');
const proxyquire = require('proxyquire');
const crypto = require('crypto');

describe("Initialization Module", () => {
    it("should throw an error if PBKDF2 fails", () => {
        // Mock crypto.pbkdf2Sync to throw an error
        const mockCrypto = {
            ...crypto,
            pbkdf2Sync: () => {
                throw new Error('PBKDF2 failed');
            },
        };

        const { initKeychain } = proxyquire('../src/init', {
            crypto: mockCrypto,
        });

        expect(() => initKeychain('anotherPassword')).to.throw('Failed to initialize keychain');
    });
});
