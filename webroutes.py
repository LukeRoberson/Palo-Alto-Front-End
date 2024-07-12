'''
Classes to simplify the creation of web routes in Flask.
These are called with app.add_url_rule() in the main app.py file.

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

from flask import render_template, request, jsonify, Response
from flask.views import MethodView

import platform
from importlib.metadata import version
import base64
import xml.etree.ElementTree as ET
from datetime import datetime
from colorama import Fore, Style

from device import DeviceManager, SiteManager
from settings import AppSettings
from sql import SqlServer
from encryption import CryptoSecret
from api import DeviceApi


class IndexView(MethodView):
    '''
    IndexView class to display the index page of the web application.

    Methods:
        get: Get method to render the index page of the web application.
    '''

    def get(
        self
    ) -> render_template:
        '''
        Get method to render the index page of the web application.

        Returns:
            render_template: The rendered index page of the web application.
        '''

        # Collect the values we need
        flask_version = version("flask")
        ip_address = request.remote_addr
        os_version = platform.platform()

        # Render the index page
        return render_template(
            'index.html',
            flask_version=flask_version,
            ip_address=ip_address,
            os_version=os_version
        )


class DevicesView(MethodView):
    '''
    DevicesView class to display the devices page of the web application.

    Methods:
        get: Get method to render the devices page of the web application.
    '''

    def get(
        self,
        device_manager: DeviceManager,
        site_manager: SiteManager,
    ) -> render_template:
        '''
        Get method to render the devices page of the web application.

        Args:
            device_manager (DeviceManager): The device manager object.
            site_manager (SiteManager): The site manager object.

        Returns:
            render_template: The rendered devices page of the web application.
        '''

        return render_template(
            'devices.html',
            device_list=device_manager.device_list,
            ha_list=device_manager.ha_pairs,
            site_list=site_manager.site_list,
            device_count=len(device_manager),
            site_count=len(site_manager),
        )


class ObjectsView(MethodView):
    '''
    ObjectsView class to display the objects page of the web application.

    Methods:
        get: Get method to render the objects page of the web application.
    '''

    def get(
        self
    ) -> render_template:
        '''
        Get method to render the objects page of the web application.

        Returns:
            render_template: The rendered objects page of the web application.
        '''

        return render_template('objects.html')


class PoliciesView(MethodView):
    '''
    PoliciesView class to display the policies page of the web application.

    Methods:
        get: Get method to render the policies page of the web application.
    '''

    def get(
        self
    ) -> render_template:
        '''
        Get method to render the policies page of the web application.

        Returns:
            render_template: The rendered policies page of the web application.
        '''

        return render_template('policies.html')


class GlobalProtectView(MethodView):
    '''
    GlobalProtectView class to display the Global Protect
        page of the web application.

    Methods:
        get: Get method to render the policies page of the web application.
    '''

    def get(
        self
    ) -> render_template:
        '''
        Get method to render the global protect page of the web application.

        Returns:
            render_template: The rendered policies page of the web application.
        '''

        return render_template('gp.html')


class SettingsView(MethodView):
    '''
    SettingsView class to display the settings page of the web application.

    Methods:
        get: Get method to render the settings page of the web application.
    '''

    def get(
        self,
        config: AppSettings,
    ) -> render_template:
        '''
        Get method to render the settings page of the web application.

        Args:
            config (AppSettings): The application settings object.

        Returns:
            render_template: The rendered settings page of the web application.
        '''

        return render_template(
            'settings.html',
            tenant_id=config.azure_tenant,
            app_id=config.azure_app,
            app_secret=config.azure_secret,
            callback_url=config.redirect_uri,
            sql_server=config.sql_server,
            sql_port=config.sql_port,
            sql_database=config.sql_database,
            sql_auth=config.sql_auth_type,
            web_ip=config.web_ip,
            web_port=config.web_port,
            web_debug=config.web_debug
        )


class SaveAzureView(MethodView):
    '''
    SaveAzure class to save the Azure settings from the settings page.

    Methods:
        post: Post method to save the Azure settings from the settings page.
    '''

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
        '''

        # Attempt saving the settings to the config file
        try:
            config.sql_server = request.form['sql_server']
            config.sql_port = request.form['sql_port']
            config.sql_database = request.form['sql_database']
            config.sql_auth_type = request.form['sql_auth']
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


class SaveWebView(MethodView):
    '''
    SaveWeb class to save the web settings from the settings page.

    Methods:
        post: Post method to save the web settings from the settings page.
    '''

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
        '''

        # Create a list of device names
        device_list = []
        for device in device_manager.device_list:
            device_info = {"device_id": device.id, "device_name": device.name}
            device_list.append(device_info)

        # Return the list of device names as JSON
        return jsonify(device_list)


class RefreshDevSiteView(MethodView):
    '''
    RefreshDevSite class to refresh the device and site lists.

    Methods:
        get: Get method to refresh the device and site lists.
    '''

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
    GetTags class to get the tags for a device.

    Methods:
        get: Get method to get the tags for a device.
    '''

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
