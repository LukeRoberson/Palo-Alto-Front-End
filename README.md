# Palo Alto Management

A web front end to simplify some aspects of Palo Alto firewall management

## Requirements

- Python 3.10 or later
- Modules are contained in requirements.txt
- Note, uwsgi is needed in production, and only installs in Linux

## Containers

To build a container:

```
docker build -t <username>/<repository>:<tag> .
```

eg:

```
docker build -t username/private:paloalto .
```

To run the container:

```
docker run -p 5000:5000 -e api_master_pw=<PASSWORD> paloalto-frontend
```

To push the container to docker hub:

1. Generate a token
2. Login with 'docker login --username <USER>'
3. Enter token as the password
4. 'docker push <USERNAME>/<repository>:<tag>'


# Configuration

## General Configuration

Configuration is stored in config.yaml.

This contains areas for Azure authentication, SQL connections, and general web settings.

This is also available on the settings page. However, these need to be set first in order to reach the settings page

## Certificates

HTTPS is required due to the callback during authentication. This means that HTTPS is mandatory on the entire platform (which it should be anyway right?)

This can be enabled on a reverse proxy, such as NGINX. If there is no reverse proxy available, SSL can be enabled on the app directly. To do this, place two files in the **certificates** directory:

- cert.pem
- key.pem

These are base64 encoded private and public keys.

Additionally, set the 'ssl' setting in settings.yaml to 'true'.

## Password Encryption

When a password for a device is saved to the database, it needs to be encrypted. This makes use of a master password, which is stored in the local machine's environment variables.

To set this up, create an environment variable called **api_master_pw**, and add a very strong password as the value.

This is protected by the local operating system, so is secure.

# Known Issues

- Switching between light and dark mode sometimes needs a refresh to apply correctly
- The navbar does not stay 'shrunk' when changing pages
