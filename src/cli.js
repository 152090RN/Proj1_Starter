"use strict";

const readline = require("readline");
const { Keychain } = require("./password-manager");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let keychain;

async function initializeKeychain() {
    rl.question("Enter a master password to initialize the keychain: ", async (password) => {
        keychain = await Keychain.init(password);
        console.log("Keychain initialized.");
        prompt();
    });
}

function prompt() {
    rl.question(
        "Choose an action (add, get, remove, dump, exit): ",
        async (command) => {
            switch (command.trim().toLowerCase()) {
                case "add":
                    rl.question("Enter domain: ", (domain) => {
                        rl.question("Enter password: ", async (password) => {
                            await keychain.set(domain, password);
                            console.log(`Password for ${domain} added.`);
                            prompt();
                        });
                    });
                    break;
                case "get":
                    rl.question("Enter domain to retrieve password: ", async (domain) => {
                        const password = await keychain.get(domain);
                        console.log(password ? `Password: ${password}` : "No password found.");
                        prompt();
                    });
                    break;
                case "remove":
                    rl.question("Enter domain to remove: ", async (domain) => {
                        const removed = await keychain.remove(domain);
                        console.log(removed ? `${domain} removed.` : "No entry found.");
                        prompt();
                    });
                    break;
                case "dump":
                    const [serialized, checksum] = await keychain.dump();
                    console.log("Serialized keychain:", serialized);
                    console.log("Checksum:", checksum);
                    prompt();
                    break;
                case "exit":
                    console.log("Exiting...");
                    rl.close();
                    break;
                default:
                    console.log("Invalid command.");
                    prompt();
            }
        }
    );
}

// Initialize keychain on startup
initializeKeychain();
