// test/get.test.js
const { expect } = require('chai');
const { getEntry } = require('../src/get');
const { setEntry } = require('../src/set');
const { clear } = require('../src/crypto/kvs');

describe("Get Module", () => {
    before(() => {
        // Clear KVS and set up initial entries before tests
        console.log("Setting up test environment...");
        clear();
        setEntry('example.com', 'password123'); // Example entry for testing
    });

    after(() => {
        // Clean up after tests
        console.log("Cleaning up test environment...");
        clear();
    });

    it("should retrieve and decrypt the password for a domain", () => {
        console.log("Testing password retrieval for 'example.com'");
        const password = getEntry('example.com');
        expect(password).to.equal('password123');
    });

    it("should throw an error if the domain does not exist", () => {
        console.log("Testing retrieval for a nonexistent domain");
        expect(() => getEntry('nonexistent.com')).to.throw('Failed to retrieve and decrypt the password');
    });

    it("should handle padded passwords correctly", () => {
        console.log("Testing padding for password");
        const password = getEntry('example.com');
        expect(password).to.equal('password123');
        expect(password).to.have.lengthOf(11);
    });

    it("should throw an error if the domain input type is incorrect", () => {
        console.log("Testing incorrect input type for domain");
        expect(() => getEntry(123)).to.throw('Domain must be a string.');
    });
});
