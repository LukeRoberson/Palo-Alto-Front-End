# Overview

While this app can access firewalls with their API's, it also makes its own API available to external calls. Most calls however, are from the web front-end when it needs to collect information or apply actions.

NOTE: This is still in development.

This is implemented in apiroutes.py


# General Settings

The base URL is:
* <DEVICE>:<PORT>/api


# Routes
## Azure
/api/azure

### Save
For saving Azure settings.
* Method: POST
* Parameters: action=save

## SQL
/api/sql

### Save
For saving SQL server and database settings
* Method: POST
* Parameters: action=save

### Test
For testing connectivity to the defined SQL server
* Method: POST
* Parameters: action=test

## Web
/api/web

### Save
For saving web interface setings
* Method: POST
* Parameters: action=save

## Sites
/api/site

### List
To list all sites in the database
* Method: GET
* Parameters: action=list

### Refresh
To refresh the list of sites from the database.
This is used to update the view in the web UI
* Method: GET
* Parameters: action=refresh

### Add a Site
To add a site to the database
* Method: POST
* Parameters: action=add

### Delete a Site
To delete a site from the database
* Method: POST
* Parameters: action=delete

### Update a site
Updates site settings in the database
* Method: POST
* Parameters: action=update

## Devices
/api/device

### List
To list all devices in the database
* Method: GET
* Parameters: action=list

To optionally list a specific device, include its device ID:
* Parameters: id=<DEVICE-ID>

### Refresh
To refresh the list of devices from the database, and update current status (such as HA).
This is used to update the view in the web UI
* Method: GET
* Parameters: action=refresh

### Add a Device
To add a device to the database
* Method: POST
* Parameters: action=add

### Delete a Device
To delete a device from the database
* Method: POST
* Parameters: action=delete

### Update a Device
Updates device settings in the database
* Method: POST
* Parameters: action=update

### Download Device Config
Downloads the running config of the device
* Method: POST
* Parameters: action=download


## Objects
### Tags
Gets a list of tags
* Method: GET
* Parameters: object=tags

Create tags
* Method: POST
* Parameters:
    * object=tags
    * action=create
    * id=<DEVICE_ID>

### Addresses
Gets a list of address objects
* Method: GET
* Parameters: object=addresses

### Address Groups
Gets a list of address group objects
* Method: GET
* Parameters: object=address_groups

### Application Groups
Gets a list of application groups
* Method: GET
* Parameters: object=app_groups

### Services
Gets a list of service objects
* Method: GET
* Parameters: object=services

### Service Groups
Gets a list of service groups
* Method: GET
* Parameters: object=service_groups


## Policies
### NAT
Gets a list of NAT policies
* Method: GET
* Parameters: type=nat

### Security
A list of security policies
* Method: GET
* Parameters: type=security

### QoS
A list of QoS policies
* Method: GET
* Parameters: type=qos


## VPN
### Global Protect
Gets a list of active global protect sessions
* Method: GET
* Parameters: type=gp

### IPSec
Gets configured IPSec tunnels and their status
* Method: GET
* Parameters: type=ipsec
