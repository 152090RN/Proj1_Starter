// src/lib.js

"use strict";
console.log("Script started");

const crypto = require("crypto");

/**
 * Converts a plaintext string into a buffer for use in SubtleCrypto functions.
 */
function stringToBuffer(str) {
    console.log("Converting string to buffer");
    return Buffer.from(str, 'utf-8');
}

/**
 * Converts a buffer back into a string.
 */
function bufferToString(buf) {
    console.log("Converting buffer to string");
    return Buffer.from(buf).toString('utf-8');
}

/**
 * Converts a buffer to a Base64 string for easy serialization.
 */
function encodeBuffer(buf) {
    console.log("Encoding buffer to Base64");
    return buf.toString("base64");
}

/**
 * Converts a Base64 string back into a buffer.
 */
function decodeBuffer(base64) {
    console.log("Decoding Base64 to buffer");
    return Buffer.from(base64, "base64");
}

/**
 * Generates a buffer of random bytes.
 */
function getRandomBytes(len) {
    console.log(`Generating ${len} random bytes`);
    return crypto.randomBytes(len);
}

/**
 * Encrypts a buffer using AES-GCM with a given key and returns an object containing the encrypted data, IV, and auth tag.
 */
function encryptBuffer(buffer, key) {
    try {
        console.log("Encrypting buffer with AES-GCM");
        const iv = crypto.randomBytes(12); // AES-GCM standard IV size
        const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
        const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
        const authTag = cipher.getAuthTag();

        return {
            iv: iv.toString("base64"),
            encryptedData: encrypted.toString("base64"),
            authTag: authTag.toString("base64")
        };
    } catch (error) {
        console.error("Encryption error:", error.message);
        throw new Error("Failed to encrypt buffer");
    }
}

/**
 * Decrypts an encrypted buffer using AES-GCM with a given key, IV, and auth tag.
 */
function decryptBuffer(encryptedData, key, iv, authTag) {
    try {
        console.log("Decrypting buffer with AES-GCM");
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"));
        decipher.setAuthTag(Buffer.from(authTag, "base64"));
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedData, "base64")),
            decipher.final()
        ]);
        return decrypted;
    } catch (error) {
        console.error("Decryption error:", error.message);
        throw new Error("Failed to decrypt buffer");
    }
}

/**
 * Generates a random 256-bit (32-byte) encryption key for AES-256 encryption.
 */
function generateEncryptionKey() {
    console.log("Generating a 256-bit encryption key");
    return crypto.randomBytes(32);
}

module.exports = {
    stringToBuffer,
    bufferToString,
    encodeBuffer,
    decodeBuffer,
    getRandomBytes,
    encryptBuffer,
    decryptBuffer,
    generateEncryptionKey
};
