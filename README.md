# Palo Alto Management

A web front end to simplify some aspects of Palo Alto firewall management

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

