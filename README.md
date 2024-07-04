# Palo Alto Management

A web front end to simplify some aspects of Palo Alto firewall management

# Requirements

* Python 3.10 or later
* Modules are contained in requirements.txt

# Configuration

## General Configuration
Configuration is stored in config.yaml.

This contains areas for Azure authentication, SQL connections, and general web settings.

This is also available on the settings page. However, these need to be set first in order to reach the settings page

## Certificates
HTTPS is required due to the callback during authentication. This means that HTTPS is mandatory on the entire platform (which it should be anyway right?)

To enable this, place two files in the **certificates** directory:
* cert.pem
* key.pem

These are base64 encoded private and public keys.

## Password Encryption
When a password for a device is saved to the database, it needs to be encrypted. This makes use of a master password, which is stored in the local machine's environment variables.

To set this up, create an environment variable called **api_master_pw**, and add a very strong password as the value.

This is protected by the local operating system, so is secure.

# Known Issues

* Switching between light and dark mode sometimes needs a refresh to apply correctly
* The navbar does not stay 'shrunk' when changing pages
