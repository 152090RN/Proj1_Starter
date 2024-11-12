// src/crypto/padding.js

/**
 * Pads the password to a fixed length with padding characters (e.g., spaces).
 * @param {string} password - The original password.
 * @param {number} length - The fixed length to pad to.
 * @returns {string} The padded password.
 */
function padPassword(password, length = 32) { // Increased default to 32
    if (password.length > length) {
        throw new Error('Password exceeds maximum length.');
    }
    return password.padEnd(length, ' '); // Pads with spaces
}

/**
 * Removes padding from the password.
 * @param {string} paddedPassword - The padded password.
 * @returns {string} The original password.
 */
function unpadPassword(paddedPassword) {
    return paddedPassword.trimEnd(); // Removes trailing spaces
}

module.exports = {
    padPassword,
    unpadPassword
};
