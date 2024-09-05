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

# Production Deployment

In production, this should be run in this way:
    - Containerized deployment using Docker Compose
    - Internal network for containers to communicate
    - NGINX container in front of this app
    - uWSGI on the app container
    - SSL on NGINX, not on the app
    - App not directly accessible from anywhere but NGINX


# General Notes

## Tag Colours

Tags have a string such as 'color1' which refers to a real colour. There are 41 usable colours ('color18' is not usable for unknown reasons).


| Colour String | Colour         | Web Colour |
| ------------- | -------------- | ---------- |
| color1        | Red            | #CD383F    |
| color2        | Green          | #72A392    |
| color3        | Blue           | #6BA2B9    |
| color4        | Yellow         | #EBD722    |
| color5        | Copper         | #C27D2A    |
| color6        | Orange         | #F6851F    |
| color7        | Purple         | #7D3953    |
| color8        | Grey           | #5B6F7B    |
| color9        | Light Green    | #C9D6A6    |
| color10       | Cyan           | #8AD3DF    |
| color11       | Light Grey     | #EDEEEE    |
| color12       | Blue Grey      | #80A1B6    |
| color13       | Lime           | #A7C439    |
| color14       | Black          | #000000    |
| color15       | Gold           | #FFC425    |
| color16       | Brown          | #918A75    |
| color17       | Olive          | #97A822    |
| color18       | INVALID        |            |
| color19       | Maroon         | #C32148    |
| color20       | Red-Orange     | #FF681F    |
| color21       | Yellow-Orange  | #FFAE42    |
| color22       | Forest Green   | #5FA777    |
| color23       | Turquoise Blue | #6CDAE7    |
| color24       | Azure Blue     | #4997D0    |
| color25       | Cerulean Blue  | #339ACC    |
| color26       | Midnight Blue  | #00468C    |
| color27       | Medium Blue    | #4570E6    |
| color28       | Cobalt Blue    | #8C90C8    |
| color29       | Violet Blue    | #766EC8    |
| color30       | Blue Violet    | #6456B7    |
| color31       | Medium Violet  | #8F47B3    |
| color32       | Medium Rose    | #D96CBE    |
| color33       | Lavender       | #BF8FCC    |
| color34       | Orchid         | #E29CD2    |
| color35       | Thistle        | #EBB0D7    |
| color36       | Peach          | #FFCBA4    |
| color37       | Salmon         | #FF91A4    |
| color38       | Magenta        | #F653A6    |
| color39       | Red Violet     | #BB3385    |
| color40       | Mahogany       | #CA3435    |
| color41       | Burnt Sienna   | #AB6744    |
| color42       | Chestnut       | #B94E48    |
