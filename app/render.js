// app/renderer.js
const { ipcRenderer } = require("electron");

// Initialize Keychain - you may call this only once
async function initializeKeychain() {
    // Assuming keychain is already initialized on startup in main.js
    alert("Keychain initialized.");
}

// Add Password
function addPassword() {
    const domain = document.getElementById("add-domain").value;
    const password = document.getElementById("add-password").value;
    ipcRenderer.send("add-password", { domain, password });
}

// Get Password
function getPassword() {
    const domain = document.getElementById("get-domain").value;
    ipcRenderer.send("get-password", { domain });
}

// Remove Password
function removePassword() {
    const domain = document.getElementById("remove-domain").value;
    ipcRenderer.send("remove-password", { domain });
}

// Dump Keychain
function dumpKeychain() {
    ipcRenderer.send("dump-keychain");
}

// Listen for responses from main process
ipcRenderer.on("password-response", (event, message) => {
    alert(message);
});

ipcRenderer.on("dump-response", (event, { serialized, checksum }) => {
    document.getElementById("dump-result").innerText = `Serialized keychain:\n${serialized}\nChecksum:\n${checksum}`;
});
