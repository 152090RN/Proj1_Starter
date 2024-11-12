// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");
const { Keychain } = require("./src/password-manager");

let mainWindow;
let keychain;

/**
 * Creates the main application window.
 */
async function createWindow() {
    try {
        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                preload: path.join(__dirname, "app/renderer.js"),
                contextIsolation: true,  // Enable for security
                enableRemoteModule: false,  // Avoid if possible
                nodeIntegration: false,  // Disable Node.js integration in renderer
                sandbox: true  // Enable sandboxing for additional security
            }
        });

        await mainWindow.loadFile(path.join(__dirname, "app/index.html"));

        // Initialize the keychain with a hardcoded password for simplicity
        keychain = await Keychain.init("master-password");
    } catch (error) {
        console.error("Error creating window:", error);
    }
}

/**
 * Sets up Inter-Process Communication (IPC) listeners.
 */
function setupIpcListeners() {
    // Listener for adding a password
    ipcMain.on("add-password", async (event, { domain, password }) => {
        try {
            await keychain.set(domain, password);
            event.reply("password-response", `Password for ${domain} added successfully.`);
        } catch (error) {
            console.error("Error adding password:", error);
            event.reply("password-response", `Failed to add password for ${domain}.`);
        }
    });

    // Listener for getting a password
    ipcMain.on("get-password", async (event, { domain }) => {
        try {
            const password = await keychain.get(domain);
            event.reply("password-response", password ? `Password: ${password}` : "No password found.");
        } catch (error) {
            console.error("Error getting password:", error);
            event.reply("password-response", "Error retrieving password.");
        }
    });

    // Listener for removing a password
    ipcMain.on("remove-password", async (event, { domain }) => {
        try {
            const removed = await keychain.remove(domain);
            event.reply("password-response", removed ? `${domain} removed.` : "No entry found.");
        } catch (error) {
            console.error("Error removing password:", error);
            event.reply("password-response", "Error removing password.");
        }
    });

    // Listener for dumping the keychain
    ipcMain.on("dump-keychain", async (event) => {
        try {
            const [serialized, checksum] = await keychain.dump();
            event.reply("dump-response", { serialized, checksum });
        } catch (error) {
            console.error("Error dumping keychain:", error);
            event.reply("dump-response", "Error dumping keychain.");
        }
    });
}

// App Event Handlers
app.whenReady().then(() => {
    createWindow();
    setupIpcListeners();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

module.exports = {
    createWindow,
    setupIpcListeners
};
