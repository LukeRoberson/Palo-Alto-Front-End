'''
Classes to simplify the creation of api routes in Flask.
    These are API routes, not web routes.
    Routes are registered as a blueprint

Success messages are in this JSON format:
    {
        "result": "Success",
        "message": "Some nice message"
    }

Failure messages are in this JSON format:
    {
        "result": "Failure",
        "message": "Some error message"
    }
'''

from flask import (
    Blueprint,
    request,
    jsonify,
    Response,
)

from flask.views import MethodView

import base64
import xml.etree.ElementTree as ET
from datetime import datetime
from colorama import Fore, Style

from device import DeviceManager, SiteManager, device_manager, site_manager
from settings import AppSettings, config
from sql import SqlServer
from encryption import CryptoSecret
from api import DeviceApi

from azure import login_required


# Define a blueprint for the web routes
api_bp = Blueprint('api', __name__)


class SaveAzureView(MethodView):
    '''
    SaveAzure class to save the Azure settings from the settings page.

    Methods:
        post: Post method to save the Azure settings from the settings page.
    '''

    @ login_required
    def post(
        self,
        config: AppSettings
    ) -> jsonify:
        '''
        Post method to save the Azure settings from the settings page.

        Args:
            config (AppSettings): The application settings object.

        Returns:
            jsonify: The result of the save operation.
        '''

        # Attempt saving the settings to the config file
        try:
            config.azure_tenant = request.form['tenant_id']
            config.azure_app = request.form['app_id']
            config.azure_secret = request.form['app_secret']
            config.redirect_uri = request.form['callback_url']
            config.write_config()

            # If it's all good, return a nice message
            return jsonify(
                {
                    "result": "Success",
                    "message": "Settings saved"
                }
            )

        # If it failed, return an error message
        except KeyError as e:
            return jsonify(
                {
                    "result": "Failure",
                    "message": str(e)
                }
            ), 500


class SaveSqlView(MethodView):
    '''
    SaveSql class to save the SQL settings from the settings page.

    Methods:
        post: Post method to save the SQL settings from the settings page.
    '''

    @ login_required
    def post(
        self,
        config: AppSettings,
    ) -> jsonify:
        '''
        Post method to save the SQL settings from the settings page.

        Args:
            config (AppSettings): The application settings object.

        Returns:
            jsonify: The result of the save operation.
            int: The HTTP status code.
                The code is 200 if HTTP was fine,
                    but there was some other error, such as missing values
        '''

        # Handle sql_auth missing
        if 'sql_auth' not in request.form:
            return jsonify(
                {
                    "result": "Failure",
                    "message": "SQL authentication type is missing"
                }
            ), 200

        # Handle empty values
        if (
            request.form['sql_port'] == '' or
            request.form['sql_server'] == '' or
            request.form['sql_database'] == '' or
            request.form['sql_auth'] == ''
        ):
            return jsonify(
                {
                    "result": "Failure",
                    "message": "SQL settings can't be empty"
                }
            ), 200

        # Check SQL auth vs username/password
        if request.form['sql_auth'] == 'SQL':
            if (
                'sql_username' not in request.form or
                'sql_password' not in request.form or
                request.form['sql_username'] == '' or
                request.form['sql_password'] == ''
            ):
                return jsonify(
                    {
                        "result": "Failure",
                        "message": "SQL username/password can't be empty"
                    }
                ), 200

        # Save username/password as variables if available
        if 'sql_username' in request.form:
            sql_username = request.form['sql_username']
        else:
            sql_username = ''

        if 'sql_password' in request.form:
            sql_password = request.form['sql_password']
        else:
            sql_password = ''

        # Check if the password has changed (don't double encrypt)
        if sql_password != config.sql_password and sql_password != '':
            print(
                Fore.CYAN,
                "Updating and encrypting password in config.yaml",
                Style.RESET_ALL
            )

            # Encrypt the password
            with CryptoSecret() as encryptor:
                encrypted = encryptor.encrypt(sql_password)
                sql_password = encrypted[0].decode()
                config.sql_salt = (
                    base64.urlsafe_b64encode(encrypted[1]).decode()
                )

        else:
            print(
                Fore.CYAN,
                "Password hasn't changed, not encrypting or updating",
                Style.RESET_ALL
            )

        # Attempt saving the settings to the config file
        try:
            config.sql_server = request.form['sql_server']
            config.sql_port = request.form['sql_port']
            config.sql_database = request.form['sql_database']
            config.sql_auth_type = request.form['sql_auth']
            config.sql_username = sql_username
            config.sql_password = sql_password
            config.write_config()

            # If it's all good, return a nice message
            return jsonify(
                {
                    "result": "Success",
                    "message": "Settings saved"
                }
            )

        # Return an error message if it failed
        except KeyError as e:
            print(Fore.RED, e, Style.RESET_ALL)
            return jsonify(
                {
                    "result": "Failure",
                    "message": str(e)
                }
            ), 500


class SaveWebView(MethodView):
    '''
    SaveWeb class to save the web settings from the settings page.

    Methods:
        post: Post method to save the web settings from the settings page.
    '''

    @ login_required
    def post(
        self,
        config: AppSettings,
    ) -> jsonify:
        '''
        Post method to save the web settings from the settings page.

        Args:
            config (AppSettings): The application settings object.

        Returns:
            jsonify: The result of the save operation.
        '''

        # Attempt saving the settings to the config file
        try:
            config.web_ip = request.form['web_ip']
            config.web_port = request.form['web_port']

            # Check if the debug setting is on or off
            if request.form['web_debug'] == 'on':
                config.web_debug = True
            else:
                config.web_debug = False

            config.write_config()

            # If it's all good, return a nice message
            return jsonify(
                {
                    "result": "Success",
                    "message": "Settings saved"
                }
            )

        # Return an error message if it failed
        except KeyError as e:
            return jsonify(
                {
                    "result": "Failure",
                    "message": str(e)
                }
            ), 500


class TestSqlView(MethodView):
    '''
    TestSql class to test the SQL settings from the settings page.

    Methods:
        post: Post method to test the SQL settings from the settings page.
    '''

    @ login_required
    def post(
        self,
        config: AppSettings,
    ) -> jsonify:
        '''
        Post method to test the SQL settings from the settings page.
        A simple connection test using the 'sites' databse is performed.

        Args:
            config (AppSettings): The application settings object.

        Returns:
            jsonify: The result of the test operation.
        '''

        # Connect to the SQL server and database
        with SqlServer(
            server=request.form['sql_server'],
            database=request.form['sql_database'],
            table='sites',
            config=config,
        ) as sql:
            result = sql.test_connection()

        # Success message if the connection was successful
        if result:
            return jsonify(
                {
                    "result": "Success",
                    "message": (
                        f"Connected to {config.sql_server}\\"
                        f"{config.sql_database}"
                    )
                }
            )

        # Failure message if the connection failed
        else:
            return jsonify(
                {
                    "result": "Failure",
                    "message": (
                        f"Failed to connect to {config.sql_server}\\"
                        f"{config.sql_database}'s 'sites' table"
                    )
                }
            )


class AddSiteView(MethodView):
    '''
    AddSite class to add a site to the database.

    Methods:
        post: Post method to add a site to the database.
    '''

    @ login_required
    def post(
        self,
        site_manager: SiteManager,
    ) -> jsonify:
        '''
        Post method to add a site to the database.

        Args:
            site_manager (SiteManager): The site manager object.

        Returns:
            jsonify: The result of the add operation.
        '''

        # Get the site name from the form
        site_name = request.form['siteName']

        # Add the site to the database
        new_site = site_manager.add_site(site_name)

        # Return a success message if the site was added
        if new_site is not None:
            return jsonify(
                {
                    "result": "Success",
                    "message": f"Site '{site_name}' added successfully"
                }
            )

        # Return a failure message if the site wasn't added
        else:
            return jsonify(
                {
                    "result": "Failure",
                    "message": f"Site '{site_name}' can't be added"
                }
            ), 500


class AddDeviceView(MethodView):
    '''
    AddDevice class to add a device to the database.

    Methods:
        post: Post method to add a device to the database.
    '''

    @ login_required
    def post(
        self,
        device_manager: DeviceManager,
    ) -> jsonify:
        '''
        Post method to add a device to the database.

        Args:
            device_manager (DeviceManager): The device manager object.

        Returns:
            jsonify: The result of the add operation.
        '''

        # Get the device and the password from the form
        device_name = request.form['deviceName']
        password = request.form['apiPass']

        # Encrypt the password
        print(Fore.CYAN, "Encrypting password", Style.RESET_ALL)
        with CryptoSecret() as encryptor:
            encrypted = encryptor.encrypt(password)
            encrypted_key = encrypted[0].decode()
            salt = base64.urlsafe_b64encode(encrypted[1]).decode()

        # Add the device to the database
        print(Fore.CYAN, "Adding device to DB", Style.RESET_ALL)
        new_device = device_manager.add_device(
            name=device_name,
            hostname=request.form['hostName'],
            site=request.form['siteMember'],
            key=request.form['apiKey'],
            username=request.form['apiUser'],
            password=encrypted_key,
            salt=salt,
        )

        # Refresh the device list after adding a device
        print(Fore.CYAN, "Refreshing device list", Style.RESET_ALL)
        device_manager.get_devices()

        # Return a success message if the device was added
        if new_device:
            return jsonify(
                {
                    "result": "Success",
                    "message": f"Device '{new_device.name}' added successfully"
                }
            )

        # Return a failure message if the device wasn't added
        else:
            return jsonify(
                {
                    "result": "Failure",
                    "message": f"Device '{device_name}' can't be added"
                }
            ), 500


class DeleteSiteView(MethodView):
    '''
    DeleteSite class to delete a site from the database.

    Methods:
        post: Post method to delete a site from the database.
    '''

    @ login_required
    def post(
        self,
        site_manager: SiteManager,
    ) -> jsonify:
        '''
        Post method to delete a site from the database.

        Args:
            site_manager (SiteManager): The site manager object.

        Returns:
            jsonify: The result of the delete operation.
        '''

        # Get the site ID from the JSON request
        site_id = request.json['objectId']

        # Delete the site from the database
        result = site_manager.delete_site(site_id)

        # Return a success message if the site was deleted
        if result:
            return jsonify(
                {
                    "result": "Success",
                    "message": f"Site '{site_id}' deleted"
                }
            )

        # Return a failure message if the site wasn't deleted
        else:
            return jsonify(
                {
                    "result": "Failure",
                    "message": f"Site '{site_id}' can't be deleted"
                }
            ), 500


class DeleteDeviceView(MethodView):
    '''
    DeleteDevice class to delete a device from the database.

    Methods:
        post: Post method to delete a device from the database.
    '''

    @ login_required
    def post(
        self,
        device_manager: DeviceManager,
    ) -> jsonify:
        '''
        Post method to delete a device from the database.

        Args:
            device_manager (DeviceManager): The device manager object.

        Returns:
            jsonify: The result of the delete operation.
        '''

        # Get the device ID from the JSON request
        device_id = request.json['objectId']

        # Delete the device from the database
        result = device_manager.delete_device(device_id)

        # Refresh the device list after deleting a device
        print(Fore.CYAN, "Refreshing device list", Style.RESET_ALL)
        device_manager.get_devices()

        # Return a success message if the device was deleted
        if result:
            print(
                Fore.GREEN,
                f"Device '{device_id}' deleted",
                Style.RESET_ALL
            )
            return jsonify(
                {
                    "result": "Success",
                    "message": f"Device '{device_id}' deleted"
                }
            )

        # Return a failure message if the device wasn't deleted
        else:
            print(
                Fore.RED,
                f"Device '{device_id}' can't be deleted",
                Style.RESET_ALL
            )
            return jsonify(
                {
                    "result": "Failure",
                    "message": f"Device '{device_id}' can't be deleted"
                }
            ), 500


class UpdateSiteView(MethodView):
    '''
    UpdateSite class to update a site in the database.

    Methods:
        post: Post method to update a site in the database.
    '''

    @ login_required
    def post(
        self,
        site_manager: SiteManager,
    ) -> jsonify:
        '''
        Post method to update a site in the database.

        Args:
            site_manager (SiteManager): The site manager object.

        Returns:
            jsonify: The result of the update operation.
        '''

        # Get the site name from the form
        site_name = request.form['siteEditName']

        # Update the site in the database
        updated_site = site_manager.update_site(
            id=request.form['siteEditId'],
            name=site_name
        )

        # Return a success message if the site was updated
        if updated_site:
            return jsonify(
                {
                    "result": "Success",
                    "message": f"Site '{site_name}' updated successfully"
                }
            )

        # Return a failure message if the site wasn't updated
        else:
            print(f"Site '{site_name}' can't be updated")
            return jsonify(
                {
                    "result": "Failure",
                    "message": f"Site '{site_name}' can't be updated"
                }
            ), 500


class UpdateDeviceView(MethodView):
    '''
    UpdateDevice class to update a device in the database.

    Methods:
        post: Post method to update a device in the database.
    '''

    @ login_required
    def post(
        self,
        device_manager: DeviceManager,
    ) -> jsonify:
        '''
        Post method to update a device in the database.

        Args:
            device_manager (DeviceManager): The device manager object.

        Returns:
            jsonify: The result of the update operation.
        '''

        # Get the device name and password from the form
        device_name = request.form['deviceEditName']
        password = request.form['apiPassEdit']

        # Encrypt the password
        with CryptoSecret() as encryptor:
            encrypted = encryptor.encrypt(password)
            encrypted_key = encrypted[0].decode()
            salt = base64.urlsafe_b64encode(encrypted[1]).decode()

        # Update the device in the database
        updated_device = device_manager.update_device(
            id=request.form['deviceEditId'],
            name=device_name,
            hostname=request.form['hostNameEdit'],
            site=request.form['siteMemberEdit'],
            key=request.form['apiKeyEdit'],
            username=request.form['apiUserEdit'],
            password=encrypted_key,
            salt=salt,
        )

        # Return a success message if the device was updated
        if updated_device:
            return jsonify(
                {
                    "result": "Success",
                    "message": f"Device '{device_name}' updated successfully"
                }
            )

        # Return a failure message if the device wasn't updated
        else:
            return jsonify(
                {
                    "result": "Failure",
                    "message": f"Device '{device_name}' can't be updated"
                }
            ), 500


class DownloadConfigView(MethodView):
    '''
    DownloadConfig class to download

    Methods:
        post: Post method to download
    '''

    @ login_required
    def post(
        self,
        config: AppSettings,
    ) -> jsonify:
        '''
        Post method to download the config as an XML file.

        Args:
            config (AppSettings): The application settings object.

        Returns:
            Response: The XML file to download.
        '''

        # Get the device ID from the JSON request
        device_id = request.json['deviceId']
        table = 'devices'

        # Read the device details from the database
        with SqlServer(
            server=config.sql_server,
            database=config.sql_database,
            table=table,
            config=config,
        ) as sql:
            output = sql.read(
                field='id',
                value=device_id,
            )

        # Return a failure message if the database read failed
        if not output:
            return jsonify(
                {
                    "result": "Failure",
                    "message": "Problems reading from the database"
                }
            ), 500

        # Parse the device details
        hostname = output[0][1]
        username = output[0][6]
        password = output[0][7]
        salt = output[0][8]

        # Decrypt the password
        with CryptoSecret() as decryptor:
            # Decrypt the password
            real_pw = decryptor.decrypt(
                secret=password,
                salt=base64.urlsafe_b64decode(salt.encode())
            )
        api_pass = base64.b64encode(f'{username}:{real_pw}'.encode()).decode()

        # Connect to the API
        my_device = DeviceApi(
            hostname=hostname,
            xml_key=api_pass,
        )

        # Get the XML data, and clean it up (the API adds extra XML tags)
        xml_config = my_device.get_config()
        root = ET.fromstring(xml_config)
        result_content = root.find('.//config')
        if result_content is not None:
            cleaned_xml = ET.tostring(
                result_content,
                encoding='unicode',
                method='xml'
            )
        else:
            cleaned_xml = ''

        # Return the cleaned XML as a file download
        filename = f"{hostname}_{datetime.now().strftime('%Y%m%d%H%M%S')}.xml"
        print(f"downloading {filename}")
        response = Response(cleaned_xml, mimetype='text/xml')
        response.headers['Content-Disposition'] = (
            f'attachment; filename="{filename}"'
        )
        response.headers['X-Filename'] = filename
        return response


class DeviceListView(MethodView):
    '''
    DeviceList class to list devices in the database.

    Methods:
        get: Get method to list devices in the database.
    '''

    @ login_required
    def get(
        self,
        device_manager: DeviceManager,
    ) -> jsonify:
        '''
        Get method to list devices in the database.

        Args:
            device_manager (DeviceManager): The device manager object.

        Returns:
            jsonify: The list of devices in the database.
                device_id (str): The device ID.
                device_name (str): The device name.
                ha_state (str): The HA state of the device.
        '''

        # Create a list of device names
        device_list = []
        for device in device_manager.device_list:
            device_info = {
                "device_id": device.id,
                "device_name": device.name,
                "ha_state": device.ha_local_state
            }
            device_list.append(device_info)

        # Return the list of device names as JSON
        return jsonify(device_list)


class SiteListView(MethodView):
    '''
    SiteList class to list sites in the database.

    Methods:
        get: Get method to list sites in the database.
    '''

    @ login_required
    def get(
        self,
        site_manager: SiteManager,
    ) -> jsonify:
        '''
        Get method to list sites in the database.

        Args:
            site_manager (SiteManager): The site manager object.

        Returns:
            jsonify: The list of sites in the database.
        '''

        # Create a list of site names
        site_list = []
        for site in site_manager.site_list:
            site_info = {"site_id": site.id, "site_name": site.name}
            site_list.append(site_info)

        # Return the list of site names as JSON
        return jsonify(site_list)


class RefreshDevSiteView(MethodView):
    '''
    RefreshDevSite class to refresh the device and site lists.

    Methods:
        get: Get method to refresh the device and site lists.
    '''

    @ login_required
    def get(
        self,
        device_manager: DeviceManager,
        site_manager: SiteManager,
    ) -> jsonify:
        '''
        Get method to refresh the device and site lists.

        Args:
            device_manager (DeviceManager): The device manager object.
            site_manager (SiteManager): The site manager object.

        Returns:
            jsonify: The result of the refresh operation.
        '''

        # Refresh the site and device list
        site_manager.get_sites()
        device_manager.get_devices()

        return jsonify(
            {
                "result": "Success",
                "message": "Sites and devices refreshed"
            }
        )


class GetTagsView(MethodView):
    '''
    GetTagsView class to get the tags for a device.

    Methods:
        get: Get method to get the tags for a device.
    '''

    @ login_required
    def get(
        self,
        config: AppSettings,
    ) -> jsonify:
        '''
        Get method to get the tags for a device.

        Args:
            config (AppSettings): The application settings object.

        Returns:
            jsonify: The tags for the device.
        '''

        # Get the tags from the device
        device = request.args.get('id')
        sql_server = config.sql_server
        sql_database = config.sql_database
        table = 'devices'

        # Read the device details from the database
        with SqlServer(
            server=sql_server,
            database=sql_database,
            table=table,
            config=config,
        ) as sql:
            output = sql.read(
                field='id',
                value=device,
            )

        # Return a failure message if the database read failed
        if not output:
            return jsonify(
                {
                    "result": "Failure",
                    "message": "Problems reading from the database"
                }
            ), 500

        # Extract the details from the SQL output
        hostname = output[0][1]
        token = output[0][9]

        # Create the device object
        my_device = DeviceApi(
            hostname=hostname,
            rest_key=token,
            version='v11.0'
        )

        # The tags from the device
        raw_tags = my_device.get_tags()

        # A cleaned up list of tags
        tag_list = []
        for tag in raw_tags:
            entry = {}
            entry["name"] = tag['@name']
            entry["description"] = tag.get(
                'comments',
                'No description available'
            )
            entry["colour"] = tag.get('color', 'no colour')
            tag_list.append(entry)

        # Sort the tags by name
        tag_list.sort(key=lambda x: x['name'])

        # Return the tags as JSON
        return jsonify(tag_list)


class GetAddressesView(MethodView):
    '''
    GetAddressesView class to get address objects for a device.

    Methods:
        get: Get method to get the address objects for a device.
    '''

    @ login_required
    def get(
        self,
        config: AppSettings,
    ) -> jsonify:
        '''
        Get method to get the address objects for a device.

        Args:
            config (AppSettings): The application settings object.

        Returns:
            jsonify: The address objects for the device.
        '''

        # Get the address objects from the device
        device = request.args.get('id')
        sql_server = config.sql_server
        sql_database = config.sql_database
        table = 'devices'

        # Read the device details from the database
        with SqlServer(
            server=sql_server,
            database=sql_database,
            table=table,
            config=config,
        ) as sql:
            output = sql.read(
                field='id',
                value=device,
            )

        # Return a failure message if the database read failed
        if not output:
            return jsonify(
                {
                    "result": "Failure",
                    "message": "Problems reading from the database"
                }
            ), 500

        # Extract the details from the SQL output
        hostname = output[0][1]
        token = output[0][9]

        # Create the device object
        device_api = DeviceApi(
            hostname=hostname,
            rest_key=token,
            version='v11.0'
        )

        # The address objects from the device
        raw_addresses = device_api.get_addresses()

        # A cleaned up list of address objects
        address_list = []
        for address in raw_addresses:
            entry = {}
            entry["name"] = address['@name']

            if 'ip-netmask' in address:
                entry["addr"] = address['ip-netmask']
            elif 'ip-range' in address:
                entry["addr"] = address['ip-range']
            elif 'fqdn' in address:
                entry["addr"] = address['fqdn']
            else:
                entry["addr"] = 'No IP'
                print(
                    Fore.RED,
                    f'No IP for object {entry['name']}',
                    Style.RESET_ALL
                )

            entry["description"] = address.get('description', 'No description')
            entry["tag"] = address.get('tag', 'No tag')
            address_list.append(entry)

        # Sort the addresses by name
        address_list.sort(key=lambda x: x['name'])

        # Return the addresses as JSON
        return jsonify(address_list)


class GetAddressGroupsView(MethodView):
    '''
    GetAddressGroupsView class to get address group objects for a device.

    Methods:
        get: Get method to get the address group objects for a device.
    '''

    @ login_required
    def get(
        self,
        config: AppSettings,
    ) -> jsonify:
        '''
        Get method to get the address group objects for a device.

        Args:
            config (AppSettings): The application settings object.

        Returns:
            jsonify: The address group objects for the device.
        '''

        # Get the address group objects from the device
        device = request.args.get('id')
        sql_server = config.sql_server
        sql_database = config.sql_database
        table = 'devices'

        # Read the device details from the database
        with SqlServer(
            server=sql_server,
            database=sql_database,
            table=table,
            config=config,
        ) as sql:
            output = sql.read(
                field='id',
                value=device,
            )

        # Return a failure message if the database read failed
        if not output:
            return jsonify(
                {
                    "result": "Failure",
                    "message": "Problems reading from the database"
                }
            ), 500

        # Extract the details from the SQL output
        hostname = output[0][1]
        token = output[0][9]

        # Create the device object
        device_api = DeviceApi(
            hostname=hostname,
            rest_key=token,
            version='v11.0'
        )

        # The address groups from the device
        raw_address_groups = device_api.get_address_groups()

        # A cleaned up list of address groups
        address_group_list = []
        for address_group in raw_address_groups:
            entry = {}
            entry["name"] = address_group['@name']
            entry["static"] = address_group.get('static', 'None')
            entry["description"] = address_group.get('description', 'None')
            entry["tag"] = address_group.get('tag', {'member': ['No tags']})
            address_group_list.append(entry)

        # Sort the address groups by name
        address_group_list.sort(key=lambda x: x['name'])

        # Return the address groups as JSON
        return jsonify(address_group_list)


class GetApplicationGroupsView(MethodView):
    '''
    GetApplicationsView class to get application group objects for a device.

    Methods:
        get: Get method to get the application group objects for a device.
    '''

    @ login_required
    def get(
        self,
        config: AppSettings,
    ) -> jsonify:
        '''
        Get method to get the application group objects for a device.

        Args:
            config (AppSettings): The application settings object.

        Returns:
            jsonify: The application group objects for the device.
        '''

        # Get the application group objects from the device
        device = request.args.get('id')
        sql_server = config.sql_server
        sql_database = config.sql_database
        table = 'devices'

        # Read the device details from the database
        with SqlServer(
            server=sql_server,
            database=sql_database,
            table=table,
            config=config,
        ) as sql:
            output = sql.read(
                field='id',
                value=device,
            )

        # Return a failure message if the database read failed
        if not output:
            return jsonify(
                {
                    "result": "Failure",
                    "message": "Problems reading from the database"
                }
            ), 500

        # Extract the details from the SQL output
        hostname = output[0][1]
        token = output[0][9]

        # Create the device object
        device_api = DeviceApi(
            hostname=hostname,
            rest_key=token,
            version='v11.0'
        )

        # The application groups from the device
        raw_application_groups = device_api.get_application_groups()

        # A cleaned up list of application groups
        application_group_list = []
        for application_group in raw_application_groups:
            entry = {}
            entry["name"] = application_group['@name']
            entry["members"] = application_group.get('members', 'No members')
            application_group_list.append(entry)

        # Sort the application groups by name
        application_group_list.sort(key=lambda x: x['name'])

        # Return the application groups as JSON
        return jsonify(application_group_list)


class GetServicesView(MethodView):
    '''
    GetServicesView class to get service objects for a device.

    Methods:
        get: Get method to get the service objects for a device.
    '''

    @ login_required
    def get(
        self,
        config: AppSettings,
    ) -> jsonify:
        '''
        Get method to get the service objects for a device.

        Args:
            config (AppSettings): The application settings object.

        Returns:
            jsonify: The service objects for the device.
        '''

        # Get the service objects from the device
        device = request.args.get('id')
        sql_server = config.sql_server
        sql_database = config.sql_database
        table = 'devices'

        # Read the device details from the database
        with SqlServer(
            server=sql_server,
            database=sql_database,
            table=table,
            config=config,
        ) as sql:
            output = sql.read(
                field='id',
                value=device,
            )

        # Return a failure message if the database read failed
        if not output:
            return jsonify(
                {
                    "result": "Failure",
                    "message": "Problems reading from the database"
                }
            ), 500

        # Extract the details from the SQL output
        hostname = output[0][1]
        token = output[0][9]

        # Create the device object
        device_api = DeviceApi(
            hostname=hostname,
            rest_key=token,
            version='v11.0'
        )

        # The service objects from the device
        raw_services = device_api.get_services()

        # A cleaned up list of service objects
        services_list = []
        for service in raw_services:
            entry = {}
            entry["name"] = service['@name']
            entry["protocol"] = service['protocol']
            entry["description"] = service.get('description', 'No description')
            entry["tag"] = service.get('tag', 'No tag')
            services_list.append(entry)

        # Sort the service objects by name
        services_list.sort(key=lambda x: x['name'])

        # Return the service objects as JSON
        return jsonify(services_list)


class GetServiceGroupView(MethodView):
    '''
    GetServiceGroupView class to get service groups for a device.

    Methods:
        get: Get method to get the service groups for a device.
    '''

    @ login_required
    def get(
        self,
        config: AppSettings,
    ) -> jsonify:
        '''
        Get method to get the service groups for a device.

        Args:
            config (AppSettings): The application settings object.

        Returns:
            jsonify: The service groups for the device.
        '''

        # Get the service groups from the device
        device = request.args.get('id')
        sql_server = config.sql_server
        sql_database = config.sql_database
        table = 'devices'

        # Read the device details from the database
        with SqlServer(
            server=sql_server,
            database=sql_database,
            table=table,
            config=config,
        ) as sql:
            output = sql.read(
                field='id',
                value=device,
            )

        # Return a failure message if the database read failed
        if not output:
            return jsonify(
                {
                    "result": "Failure",
                    "message": "Problems reading from the database"
                }
            ), 500

        # Extract the details from the SQL output
        hostname = output[0][1]
        token = output[0][9]

        # Create the device object
        device_api = DeviceApi(
            hostname=hostname,
            rest_key=token,
            version='v11.0'
        )

        # The service groups from the device
        raw_service_groups = device_api.get_service_groups()

        # A cleaned up list of service groups
        service_groups_list = []
        for service in raw_service_groups:
            entry = {}
            entry["name"] = service['@name']
            entry["members"] = service.get('members', 'No members')
            entry["tag"] = service.get('tag', 'No tags')
            service_groups_list.append(entry)

        # Sort the service groups by name
        service_groups_list.sort(key=lambda x: x['name'])

        # Return the service groups as JSON
        return jsonify(service_groups_list)


class GetNatPolicyView(MethodView):
    '''
    GetNatPolicyView class to get NAT policies for a device.

    Methods:
        get: Get method to get the NAT policies for a device.
    '''

    @ login_required
    def get(
        self,
        config: AppSettings,
    ) -> jsonify:
        '''
        Get method to get the NAT policies for a device.

        Args:
            config (AppSettings): The application settings object.

        Returns:
            jsonify: The NAT policies for the device.
        '''

        # Get the NAT policies from the device
        device = request.args.get('id')
        sql_server = config.sql_server
        sql_database = config.sql_database
        table = 'devices'

        # Read the device details from the database
        with SqlServer(
            server=sql_server,
            database=sql_database,
            table=table,
            config=config,
        ) as sql:
            output = sql.read(
                field='id',
                value=device,
            )

        # Return a failure message if the database read failed
        if not output:
            return jsonify(
                {
                    "result": "Failure",
                    "message": "Problems reading from the database"
                }
            ), 500

        # Extract the details from the SQL output
        hostname = output[0][1]
        token = output[0][9]

        # Create the device object
        device_api = DeviceApi(
            hostname=hostname,
            rest_key=token,
            version='v11.0'
        )

        # The NAT policies from the device
        raw_nat = device_api.get_nat_policies()

        # A cleaned up list of NAT policies
        nat_list = []
        for policy in raw_nat:
            entry = {}
            entry["name"] = policy['@name']
            entry["source_trans"] = policy.get('source-translation', 'None')
            entry["to"] = policy.get('to', 'None')
            entry["from"] = policy.get('from', 'None')
            entry["source"] = policy.get('source', 'None')
            entry["destination"] = policy.get('destination', 'None')
            entry["service"] = policy.get('service', 'None')
            entry["tag"] = policy.get('tag', 'None')
            entry["tag_group"] = policy.get('group-tag', 'None')
            entry["description"] = policy.get('description', 'None')
            nat_list.append(entry)

        # Return the NAT policies as JSON
        return jsonify(nat_list)


class GetSecurityPolicyView(MethodView):
    '''
    GetSecurityPolicyView class to get security policies for a device.

    Methods:
        get: Get method to get the security policies for a device.
    '''

    @ login_required
    def get(
        self,
        config: AppSettings,
    ) -> jsonify:
        '''
        Get method to get the security policies for a device.

        Args:
            config (AppSettings): The application settings object.

        Returns:
            jsonify: The security policies for the device.
        '''

        # Get the security policies from the device
        device = request.args.get('id')
        sql_server = config.sql_server
        sql_database = config.sql_database
        table = 'devices'

        # Read the device details from the database
        with SqlServer(
            server=sql_server,
            database=sql_database,
            table=table,
            config=config,
        ) as sql:
            output = sql.read(
                field='id',
                value=device,
            )

        # Return a failure message if the database read failed
        if not output:
            return jsonify(
                {
                    "result": "Failure",
                    "message": "Problems reading from the database"
                }
            ), 500

        # Extract the details from the SQL output
        hostname = output[0][1]
        token = output[0][9]

        # Create the device object
        device_api = DeviceApi(
            hostname=hostname,
            rest_key=token,
            version='v11.0'
        )

        # The security policies from the device
        raw_security = device_api.get_security_policies()

        # A cleaned up list of security policies
        security_list = []
        for rule in raw_security:
            entry = {}
            entry["name"] = rule['@name']
            entry["to"] = rule.get('to', 'None')
            entry["from"] = rule.get('from', 'None')
            entry["source"] = rule.get('source', 'None')
            entry["destination"] = rule.get('destination', 'None')
            entry["source_user"] = rule.get('source-user', 'None')
            entry["category"] = rule.get('category', 'None')
            entry["application"] = rule.get('application', 'None')
            entry["service"] = rule.get('service', 'None')
            entry["action"] = rule.get('action', 'None')
            entry["type"] = rule.get('rule-tupe', 'None')
            entry["log"] = rule.get('log-setting', 'None')
            entry["log_start"] = rule.get('log-start', 'None')
            entry["log_end"] = rule.get('log-end', 'None')
            entry["disabled"] = rule.get('disabled', 'None')
            entry["tag"] = rule.get('tag', 'None')
            entry["tag_group"] = rule.get('group-tag', 'None')
            entry["description"] = rule.get('description', 'None')
            security_list.append(entry)

        # Return the security policies as JSON
        return jsonify(security_list)


class GetQoSPolicyView(MethodView):
    '''
    GetQoSPolicyView class to get QoS policies for a device.

    Methods:
        get: Get method to get the QoS policies for a device.
    '''

    @ login_required
    def get(
        self,
        config: AppSettings,
    ) -> jsonify:
        '''
        Get method to get the QoS policies for a device.

        Args:
            config (AppSettings): The application settings object.

        Returns:
            jsonify: The QoS policies for the device.
        '''

        # Get the QoS policies from the device
        device = request.args.get('id')
        sql_server = config.sql_server
        sql_database = config.sql_database
        table = 'devices'

        # Read the device details from the database
        with SqlServer(
            server=sql_server,
            database=sql_database,
            table=table,
            config=config,
        ) as sql:
            output = sql.read(
                field='id',
                value=device,
            )

        # Return a failure message if the database read failed
        if not output:
            return jsonify(
                {
                    "result": "Failure",
                    "message": "Problems reading from the database"
                }
            ), 500

        # Extract the details from the SQL output
        hostname = output[0][1]
        token = output[0][9]

        # Create the device object
        device_api = DeviceApi(
            hostname=hostname,
            rest_key=token,
            version='v11.0'
        )

        # The QoS policies from the device
        raw_qos = device_api.get_qos_policies()

        # A cleaned up list of security policies
        security_list = []
        for rule in raw_qos:
            entry = {}
            entry["name"] = rule['@name']
            entry["to"] = rule.get('to', 'None')
            entry["from"] = rule.get('from', 'None')
            entry["source"] = rule.get('source', 'None')
            entry["destination"] = rule.get('destination', 'None')
            entry["source_user"] = rule.get('source-user', 'None')
            entry["category"] = rule.get('category', 'None')
            entry["application"] = rule.get('application', 'None')
            entry["service"] = rule.get('service', 'None')
            entry["action"] = rule.get('action', 'None')
            entry["dscp"] = rule.get('dscp-tos', 'None')
            entry["tag"] = rule.get('tag', 'None')
            entry["tag_group"] = rule.get('group-tag', 'None')
            entry["description"] = rule.get('description', 'None')
            security_list.append(entry)

        # Return the security policies as JSON
        return jsonify(security_list)


class GetGPSessionsView(MethodView):
    '''
    GetGPSessionsView class to get active Global Protect sessions for a device.

    Methods:
        get: Get method to get the Global Protect sessions for a device.
    '''

    @ login_required
    def get(
        self,
        config: AppSettings,
        device_manager: DeviceManager,
    ) -> jsonify:
        '''
        Get method to get the Global Protect sessions for a device.

        Args:
            config (AppSettings): The application settings object.

        Returns:
            jsonify: The Global Protect sessions for the device.
        '''

        # Get the Global Protect sessions from the device
        device_id = request.args.get('id')
        for device in device_manager.device_list:
            if str(device.id) == device_id:
                hostname = device.hostname
                username = device.username
                password = device.decrypted_pw
                break

        api_pass = base64.b64encode(f'{username}:{password}'.encode()).decode()

        # Create the device object
        device_api = DeviceApi(
            hostname=hostname,
            xml_key=api_pass,
        )

        # The Global Protect sessions from the device
        raw_gp_sessions = device_api.get_gp_sessions()

        # A cleaned up list of Global Protect sessions
        session_list = []
        for gp_session in raw_gp_sessions:
            entry = {}
            entry["name"] = gp_session.get('username', 'None')
            entry["username"] = gp_session.get('primary-username', 'None')
            entry["region"] = gp_session.get('source-region', 'None')
            entry["computer"] = gp_session.get('computer', 'None')
            entry["client"] = gp_session.get('client', 'None')
            entry["vpn_type"] = gp_session.get('vpn-type', 'None')
            entry["host"] = gp_session.get('host-id', 'None')
            entry["version"] = gp_session.get('app-version', 'None')
            entry["inside_ip"] = gp_session.get('virtual-ip', 'None')
            entry["outside_ip"] = gp_session.get('public-ip', 'None')
            entry["tunnel_type"] = gp_session.get('tunnel-type', 'None')
            entry["login"] = gp_session.get('login-time', 'None')
            session_list.append(entry)

        # Sort the security policies by name
        session_list.sort(key=lambda x: x['name'])

        # Return the security policies as JSON
        return jsonify(session_list)


# Register views
api_bp.add_url_rule(
    '/save_azure',
    view_func=SaveAzureView.as_view('save_azure'),
    defaults={'config': config}
)

api_bp.add_url_rule(
    '/save_sql',
    view_func=SaveSqlView.as_view('save_sql'),
    defaults={'config': config}
)

api_bp.add_url_rule(
    '/save_web',
    view_func=SaveWebView.as_view('save_web'),
    defaults={'config': config}
)

api_bp.add_url_rule(
    '/test_sql',
    view_func=TestSqlView.as_view('test_sql'),
    defaults={'config': config}
)

api_bp.add_url_rule(
    '/add_site',
    view_func=AddSiteView.as_view('add_site'),
    defaults={'site_manager': site_manager}
)

api_bp.add_url_rule(
    '/add_device',
    view_func=AddDeviceView.as_view('add_device'),
    defaults={'device_manager': device_manager}
)

api_bp.add_url_rule(
    '/delete_site',
    view_func=DeleteSiteView.as_view('delete_site'),
    defaults={'site_manager': site_manager}
)

api_bp.add_url_rule(
    '/delete_device',
    view_func=DeleteDeviceView.as_view('delete_device'),
    defaults={'device_manager': device_manager}
)

api_bp.add_url_rule(
    '/update_site',
    view_func=UpdateSiteView.as_view('update_site'),
    defaults={'site_manager': site_manager}
)

api_bp.add_url_rule(
    '/update_device',
    view_func=UpdateDeviceView.as_view('update_device'),
    defaults={'device_manager': device_manager}
)

api_bp.add_url_rule(
    '/download_config',
    view_func=DownloadConfigView.as_view('download_config'),
    defaults={'config': config}
)

api_bp.add_url_rule(
    '/device_list',
    view_func=DeviceListView.as_view('device_list'),
    defaults={'device_manager': device_manager}
)

api_bp.add_url_rule(
    '/site_list',
    view_func=SiteListView.as_view('site_list'),
    defaults={'site_manager': site_manager}
)

api_bp.add_url_rule(
    '/refresh_dev_site',
    view_func=RefreshDevSiteView.as_view('refresh_dev_site'),
    defaults={'device_manager': device_manager, 'site_manager': site_manager}
)

api_bp.add_url_rule(
    '/get_tags',
    view_func=GetTagsView.as_view('get_tags'),
    defaults={'config': config}
)

api_bp.add_url_rule(
    '/get_address_objects',
    view_func=GetAddressesView.as_view('get_address_objects'),
    defaults={'config': config}
)

api_bp.add_url_rule(
    '/get_address_groups',
    view_func=GetAddressGroupsView.as_view('get_address_groups'),
    defaults={'config': config}
)

api_bp.add_url_rule(
    '/get_application_groups',
    view_func=GetApplicationGroupsView.as_view('get_application_groups'),
    defaults={'config': config}
)

api_bp.add_url_rule(
    '/get_service_objects',
    view_func=GetServicesView.as_view('get_service_objects'),
    defaults={'config': config}
)

api_bp.add_url_rule(
    '/get_service_groups',
    view_func=GetServiceGroupView.as_view('get_service_groups'),
    defaults={'config': config}
)

api_bp.add_url_rule(
    '/get_nat_policies',
    view_func=GetNatPolicyView.as_view('get_nat_policies'),
    defaults={'config': config}
)

api_bp.add_url_rule(
    '/get_security_policies',
    view_func=GetSecurityPolicyView.as_view('get_security_policies'),
    defaults={'config': config}
)

api_bp.add_url_rule(
    '/get_qos_policies',
    view_func=GetQoSPolicyView.as_view('get_qos_policies'),
    defaults={'config': config}
)

api_bp.add_url_rule(
    '/get_gp_sessions',
    view_func=GetGPSessionsView.as_view('get_gp_sessions'),
    defaults={'config': config, 'device_manager': device_manager}
)
