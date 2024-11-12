# Project README: Secure Password Manager

### Project Overview

This project implements a secure password manager using JavaScript, designed to protect user passwords and prevent various attacks. The application relies on cryptographic principles and uses established libraries, notably SubtleCrypto, for secure encryption and hashing. The password manager stores each password securely with domain names, ensuring confidentiality, integrity, and security against adversaries.

### Implementation Details

The password manager's core features include:
- **Authenticated Encryption:** AES-GCM encrypts each password, ensuring confidentiality and integrity.
- **Domain Name Security:** Instead of storing domain names in plain text, HMAC is used on each domain to prevent information leakage.
- **Key Derivation:** PBKDF2 is used to derive a secure master key from a user-provided password, with a unique salt to thwart dictionary attacks.
- **Rollback and Swap Attack Prevention:** The manager computes a SHA-256 hash of the entire password database to detect tampering.

To do this,I have implementsed both a command line (CLI) and a graphical user interface (GUI)
so that one can create a secure passward manager using both.

### API Functions Implemented

1. **init(password):** Initializes a new password manager, setting up necessary cryptographic keys.
2. **load(password, representation, trustedDataCheck):** Loads the password database from a serialized string and verifies integrity using SHA-256.
3. **set(domain, password):** Adds or updates a password entry for a given domain, encrypted and stored securely.
4. **get(domain):** Retrieves the password associated with a given domain, if it exists.
5. **remove(domain):** Removes the password entry for a given domain.
6. **dump():** Serializes the password database and generates a SHA-256 hash to store in a trusted location.


### Short-Answer Questions

1. **Preventing Password Length Leakage:**  
   To prevent an adversary from learning about password lengths, each password entry is padded to a consistent maximum length before encryption. This way, no information is exposed based on ciphertext length alone.

2. **Preventing Swap Attacks:**  
   To prevent swap attacks, we include an integrity check (SHA-256 hash) that’s stored in trusted storage. When loading the password manager, we validate that the hash matches the current data, ensuring entries haven’t been swapped. Additionally, each entry contains unique HMAC values linked to specific domains, so any unauthorized changes would result in tampering detection.

3. **Necessity of a Trusted Location for SHA-256 Hash:**  
   Yes, having a trusted location is necessary to defend against rollback attacks effectively. Without it, an adversary could replace the entire data with a previous version, bypassing in-memory integrity checks. A trusted hash stored securely off-device allows us to detect rollback attacks reliably.

4. **Using a Randomized MAC for Domain Lookups:**  
   If using a randomized MAC, domain lookups would involve storing each randomized MAC for each domain and searching through them to find a match. This approach would slow lookups compared to HMAC, as HMAC's determinism allows direct access via a known computed value.

5. **Reducing Information Leakage About Record Count:**  
   One way to reduce record count leakage is to store records in “buckets” and reveal only the approximate size of these buckets. By grouping entries and only leaking bucket size, we limit the exact count of records, as it would be indistinguishable within a certain range.

6. **Multi-User Support without Security Compromise:**  
   For multi-user access, we can assign specific encryption keys for each user for shared entries. Each user would have a unique key derived from their credentials, allowing shared access only to specific entries. Access control ensures users cannot view each other’s unrelated passwords, maintaining security for all stored data.

