"use strict";

/********* External Imports ********/
const { stringToBuffer, bufferToString, encodeBuffer, decodeBuffer, getRandomBytes } = require("./lib");
const { subtle } = require('crypto').webcrypto;

/********* Constants ********/
const PBKDF2_ITERATIONS = 100000; // Number of iterations for PBKDF2 algorithm
const MAX_PASSWORD_LENGTH = 64;   // Assumed maximum password length

class Keychain {
  /**
   * Initializes the keychain with HMAC and AES-GCM keys.
   */
  constructor(hmacKey, aesKey, kvs = {}, salt = null) {
    this.data = { kvs }; // Public data structure to store passwords
    this.secrets = { hmacKey, aesKey, salt }; // Secret keys and salt
  }

  /** 
   * Creates an empty keychain with a master password.
   */
  static async init(password) {
    const salt = getRandomBytes(16); // Generate a random 16-byte salt
    const keyMaterial = await subtle.importKey(
      "raw",
      stringToBuffer(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    // Derive HMAC key
    const hmacKey = await subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
      keyMaterial,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    // Derive AES-GCM key
    const aesKey = await subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    return new Keychain(hmacKey, aesKey, {}, salt);
  }

  /**
   * Loads a keychain from serialized data and verifies integrity with checksum.
   */
  static async load(password, repr, trustedDataCheck) {
    const parsedData = JSON.parse(repr);
    const { kvs, salt } = parsedData;

    // Compute current checksum and compare to trustedDataCheck
    const currentChecksum = await subtle.digest("SHA-256", stringToBuffer(repr));
    if (trustedDataCheck && encodeBuffer(currentChecksum) !== trustedDataCheck) {
      throw new Error("Data integrity check failed! Potential rollback attack detected.");
    }

    // Re-derive keys using the password and saved salt
    const keyMaterial = await subtle.importKey("raw", stringToBuffer(password), "PBKDF2", false, ["deriveKey"]);
    const hmacKey = await subtle.deriveKey(
      { name: "PBKDF2", salt: decodeBuffer(salt), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
      keyMaterial,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    const aesKey = await subtle.deriveKey(
      { name: "PBKDF2", salt: decodeBuffer(salt), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    return new Keychain(hmacKey, aesKey, kvs, salt);
  }

  /**
   * Serializes the keychain and returns JSON data with SHA-256 checksum.
   */
  async dump() {
    const serialized = JSON.stringify({ kvs: this.data.kvs, salt: encodeBuffer(this.secrets.salt) });
    const hash = await subtle.digest("SHA-256", stringToBuffer(serialized));
    return [serialized, encodeBuffer(hash)];
  }

  /**
   * Sets a password for a given domain.
   */
  async set(name, value) {
    // Pad password to prevent length leakage
    const paddedPassword = value.padEnd(MAX_PASSWORD_LENGTH, "\0");

    // Generate HMAC for the domain name
    const domainHash = await subtle.sign("HMAC", this.secrets.hmacKey, stringToBuffer(name));

    // Encrypt the padded password with AES-GCM
    const iv = getRandomBytes(12); // Generate 12-byte IV
    const encryptedPassword = await subtle.encrypt(
      { name: "AES-GCM", iv },
      this.secrets.aesKey,
      stringToBuffer(paddedPassword)
    );

    // Store encrypted password and IV in KVS
    this.data.kvs[encodeBuffer(domainHash)] = {
      iv: encodeBuffer(iv),
      password: encodeBuffer(encryptedPassword)
    };
  }

  /**
   * Retrieves a password for a given domain.
   */
  async get(name) {
    const domainHash = await subtle.sign("HMAC", this.secrets.hmacKey, stringToBuffer(name));
    const record = this.data.kvs[encodeBuffer(domainHash)];
    if (!record) return null;

    // Decrypt the password using AES-GCM
    const decrypted = await subtle.decrypt(
      { name: "AES-GCM", iv: decodeBuffer(record.iv) },
      this.secrets.aesKey,
      decodeBuffer(record.password)
    );

    // Remove padding from the decrypted password
    return bufferToString(decrypted).replace(/\0+$/, "");
  }

  /**
   * Removes a domain entry from the keychain.
   */
  async remove(name) {
    const domainHash = await subtle.sign("HMAC", this.secrets.hmacKey, stringToBuffer(name));
    return delete this.data.kvs[encodeBuffer(domainHash)];
  }
}

module.exports = { Keychain };
