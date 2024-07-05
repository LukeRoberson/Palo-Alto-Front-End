'''
Classes to manage sites and devices
Tracks each of these objects, and contains methods to manage them
'''

import uuid
from sql import SqlServer
from settings import AppSettings
from colorama import Fore, Style
import base64


class Site:
    '''
    Site class
    Contains the name and id of a site
    This will likely be instantiated multiple times, and stored in a list

    Methods:
        __init__: Constructor for Site class
        __str__: String representation of the site
        __len__: Returns the number of devices assigned to the site
        device_count: Returns the number of devices assigned to the site
    '''

    def __init__(
        self,
        name: str,
        id: uuid,
    ) -> None:
        '''
        Constructor for Site class
        Gets the name and id of the site

        Args:
            name (str): Name of the site
            id (uuid): Unique identifier for the site
        '''

        self.name = name
        self.id = id

        # Devices assigned to the site
        self.devices = []

    def __str__(
        self
    ) -> str:
        '''
        String representation of the site
        Returns a friendly string of the site

        Returns:
            str: Friendly string of the site
        '''

        return self.name

    def __len__(
        self
    ) -> int:
        '''
        Returns the number of devices assigned to the site

        Returns:
            int: Number of devices assigned to the site
        '''

        return len(self.devices)

    @property
    def device_count(
        self
    ) -> int:
        '''
        Returns the number of devices assigned to the site
        Exposed as a property so it can be accessed directly

        Returns:
            int: Number of devices assigned to the site
        '''

        return self.__len__()


class Device:
    '''
    Device class
    Contains device details
    This will likely be instantiated multiple times, and stored in a list

    Methods:
        __init__: Constructor for Device class
        __str__: String representation of the device
    '''

    def __init__(
        self,
        name: str,
        id: uuid,
        hostname: str,
        site: uuid,
        key: str,
        username: str,
        password: str,
        salt: str,
    ) -> None:
        '''
        Constructor for Device class

        Args:
            name (str): Friendly name of the device
            id (uuid): Unique identifier for the site
            hostname (str): Hostname of the device
            site (uuid): Site identifier
            key (str): REST API key for the device
            username (str): Username for the device (XML API)
            password (str): Encrypted password for the device (XML API)
            salt (str): Salt for the encrypted (XML API)
        '''

        # Device details
        self.name = name
        self.id = id
        self.hostname = hostname
        self.site = site

        # API details
        self.key = key
        self.username = username
        self.password = password
        self.salt = salt

        # Track the site name
        self.site_name = ''

    def __str__(
        self
    ) -> str:
        '''
        String representation of the device
        Returns a friendly string of the device

        Returns:
            str: Friendly string of the device
        '''

        return self.name


class SiteManager():
    '''
    A class to manage all sites
    Stores all sites in a list (from the database)
    Adds and removes sites

    Methods:
        __init__: Constructor for SiteManager class
        __len__: Returns the number of sites
        get_sites: Get all sites from the database
        add_site: Add a new site to the database
        delete_site: Delete a site from the database
        update_site: Update a site in the database
        _new_uuid: Generate a new UUID for a site
    '''

    def __init__(
        self,
        config: AppSettings,
    ) -> None:
        '''
        Constructor for SiteManager class
        Initializes the sites list

        Args:
            config (AppSettings): Application settings
        '''

        # Sql Server connection
        self.sql_server = config.sql_server
        self.sql_database = config.sql_database
        self.table = 'sites'

        # List of all sites
        self.site_list = []

    def __len__(
        self
    ) -> int:
        '''
        Returns the number of sites

        Returns:
            int: Number of sites
        '''

        return len(self.site_list)

    def get_sites(
        self
    ) -> None:
        '''
        Get all sites from the database

        (1) Read all sites from SQL Server
        (2) Create class objects for each site
        (3) Append each object to a list

        Returns:
            list: A list of Site objects
        '''

        # Read all sites from the database
        with SqlServer(
            server=self.sql_server,
            database=self.sql_database,
            table=self.table,
        ) as sql:
            output = sql.read(
                field='',
                value='',
            )

        # Reset site list and add all sites
        self.site_list = []
        for site in output:
            self.site_list.append(
                Site(
                    name=site[1],
                    id=site[0]
                )
            )

    def add_site(
        self,
        name: str,
    ) -> Site:
        '''
        Add a new site to the database
        Assigns a new unique ID to the site
        Checks if the site name already exists

        Args:
            name (str): The name of the site

        Returns:
            Site: A new Site object if successful, otherwise None
        '''

        # Refresh the site list from the database
        self.get_sites()

        # Create a new unique ID for the site
        id = self._new_uuid()

        # Check if the name already exists in the database
        for site in self.site_list:
            # Names must be unique
            if name == site.name:
                print(
                    Fore.RED,
                    f"Site '{name}' already exists in the database.",
                    Style.RESET_ALL
                )
                return None

        # Create a new Site object
        print(
            Fore.GREEN,
            f"Adding site '{name}' with ID '{id}' to the database.",
            Style.RESET_ALL
        )
        new_site = Site(
            name=name,
            id=id
        )

        # Add to the database
        with SqlServer(
            server=self.sql_server,
            database=self.sql_database,
            table=self.table,
        ) as sql:
            result = sql.add(
                fields={
                    'id': new_site.id,
                    'name': new_site.name,
                }
            )

        if result:
            # Refresh the site list
            self.get_sites()
            return new_site

        else:
            return False

    def delete_site(
        self,
        id: uuid,
    ) -> bool:
        '''
        Delete a site from the database

        Args:
            id (uuid): The unique identifier for the site

        Returns:
            bool: True if successful, otherwise False
        '''

        # Refresh the site list from the database
        self.get_sites()

        # Delete the site from the database, based on the ID
        with SqlServer(
            server=self.sql_server,
            database=self.sql_database,
            table=self.table,
        ) as sql:
            result = sql.delete(
                field='id',
                value=id,
            )

        if result:
            # Refresh the site list
            self.get_sites()
            return True

        else:
            return False

    def update_site(
        self,
        id: uuid,
        name: str,
    ) -> bool:
        '''
        Update a site in the database

        Args:
            id (uuid): The unique identifier for the site
            name (str): The new name for the site

        Returns:
            bool: True if successful, otherwise False
        '''

        # Refresh the site list from the database
        self.get_sites()

        # Update the site in the database, based on the ID
        with SqlServer(
            server=self.sql_server,
            database=self.sql_database,
            table=self.table,
        ) as sql:
            result = sql.update(
                field='id',
                value=id,
                body={
                    'name': name,
                }
            )

        if result:
            # Refresh the site list
            self.get_sites()
            return True

        else:
            return False

    def _new_uuid(
        self
    ) -> uuid:
        '''
        Generate a new UUID for a site
        Ensures the UUID is unique in the database

        Returns:
            UUID: A unique site UUID
        '''

        # Loop until a unique ID is found
        collision = True
        while collision:
            id = uuid.uuid4()
            collision = False

            for site in self.site_list:
                # If there is a collision, set the flag and break
                if id == site.id:
                    collision = True
                    break

        return id


class DeviceManager():
    '''
    A class to manage all devices
    Stores all devices in a list (from the database)
    Adds and removes devices

    Methods:
        __init__: Constructor for DeviceManager class
        __len__: Returns the number of devices
        get_devices: Get all devices from the database
        add_device: Add a new device to the database
        delete_device: Delete a device from the database
        update_device: Update a device in the database
        _new_uuid: Generate a new UUID for a device
        _site_assignment: Assign devices to sites
    '''

    def __init__(
        self,
        config: AppSettings,
        site_manager: SiteManager,
    ) -> None:
        '''
        Constructor for DeviceManager class
        Initializes the devices list

        Args:
            config (AppSettings): Application settings
            site_manager (SiteManager): Site manager object
        '''

        # Sql Server connection
        self.sql_server = config.sql_server
        self.sql_database = config.sql_database
        self.table = 'devices'

        # Site manager object
        self.site_manager = site_manager

        # List of all devices
        self.device_list = []

    def __len__(
        self
    ) -> int:
        '''
        Returns the number of devices in the list

        Returns:
            int: Number of devices
        '''

        return len(self.device_list)

    def get_devices(
        self
    ) -> None:
        '''
        Get all Palo Alto devices from the database

        (1) Read all devices from SQL Server
            Filter: Vendor must be 'paloalto'
        (2) Create class objects for each site
        (3) Append each object to a list
        '''

        # Read paloalto devices from the database
        with SqlServer(
            server=self.sql_server,
            database=self.sql_database,
            table=self.table,
        ) as sql:
            output = sql.read(
                field='vendor',
                value='paloalto',
            )

        # Create a list of Device objects
        self.device_list = []
        for device in output:
            self.device_list.append(
                Device(
                    name=device[1].split('.')[0],
                    id=device[0],
                    hostname=device[1],
                    site=device[2],
                    key=device[9],
                    username=device[6],
                    password=device[7],
                    salt=device[8],
                )
            )

        # Assign devices to sites
        self._site_assignment()

    def add_device(
        self,
        name: str,
        hostname: str,
        site: uuid,
        key: str,
        username: str,
        password: str,
        salt: str,
    ) -> Device:
        '''
        Add a new device to the database
        Assigns a new unique ID to the device
        Checks if the device name already exists

        Args:
            name (str): The name of the device
            hostname (str): The hostname of the device
            site (uuid): The site identifier for the device
            key (str): The REST API key for the device
            username (str): The username for the device (XML API)
            password (str): The encrypted password for the device (XML API)
            salt (str): The salt for the password (XML API)

        Returns:
            Device: A new Device object if successful, otherwise None
        '''

        # Confirm the API key is valid
        if key == '' or len(key) < 32:
            print(
                Fore.RED,
                f"API key '{key}' is invalid.",
                Style.RESET_ALL
            )
            return None

        # Check if the site exists
        site_ids = []
        for site_id in self.site_manager.site_list:
            site_ids.append(str(site_id.id))

        if site not in site_ids:
            print(
                Fore.RED,
                f"Site '{site}' does not exist in the database.",
                Style.RESET_ALL
            )
            return None

        # Refresh the device list from the database
        self.get_devices()

        # Create a new unique ID for the device
        id = self._new_uuid()

        # Check if the name already exists in the database
        for device in self.device_list:
            # Names must be unique
            if hostname == device.hostname:
                print(
                    Fore.RED,
                    f"Device '{hostname}' already exists in the database.",
                    Style.RESET_ALL
                )
                return None

        # 'salt' and 'password' are bytes objects
        salt_encoded = base64.b64encode(salt).decode('utf-8')
        password_encoded = base64.b64encode(password).decode('utf-8')

        # Create a new Device object
        print(
            Fore.GREEN,
            f"Adding device '{hostname}' with ID '{id}' to the database.",
            Style.RESET_ALL
        )
        new_device = Device(
            name=hostname.split('.')[0],
            id=id,
            hostname=hostname,
            site=site,
            key=key,
            username=username,
            password=password_encoded,
            salt=salt_encoded,
        )

        # Add to the database
        with SqlServer(
            server=self.sql_server,
            database=self.sql_database,
            table=self.table,
        ) as sql:
            result = sql.add(
                fields={
                    'id': new_device.id,
                    'name': new_device.name,
                    'site': new_device.site,
                    'vendor': 'paloalto',
                    'type': 'firewall',
                    'auth_type': 'token',
                    'username': username,
                    'secret': password,
                    'salt': salt,
                    'token': new_device.key,
                }
            )

        if result:
            # Refresh the device list
            self.get_devices()
            return new_device

        else:
            return False

    def delete_device(
        self,
        id: uuid,
    ) -> bool:
        '''
        Delete a device from the database

        Args:
            id (uuid): The unique identifier for the device

        Returns:
            bool: True if successful, otherwise False
        '''

        # Refresh the device list from the database
        self.get_devices()

        # Delete the device from the database, based on the ID
        with SqlServer(
            server=self.sql_server,
            database=self.sql_database,
            table=self.table,
        ) as sql:
            result = sql.delete(
                field='id',
                value=id,
            )

        if result:
            # Refresh the site list
            self.get_devices()
            return True

        else:
            return False

    def update_device(
        self,
        id: uuid,
        name: str,
        hostname: str,
        site: uuid,
        key: str,
        username: str,
        password: str,
        salt: str,
    ) -> bool:
        '''
        Update a device in the database

        Args:
            id (uuid): The unique identifier for the device
            name (str): The new name for the device
            hostname (str): The new hostname for the device
            site (uuid): The new site for the device
            key (str): The new REST API key for the device
            username (str): The new username for the device (XML API)
            password (str): The new encrypted password for the device (XML API)
            salt (str): The new salt for the password (XML API)

        Returns:
            bool: True if successful, otherwise False
        '''

        # Refresh the device list from the database
        self.get_devices()

        # Read the current password and salt
        for device in self.device_list:
            if device.id == id:
                current_password = device.password
                current_salt = device.salt
                break

        # If the password and salt have not changed, use the current values
        #   This is so we don't try encrypting an already encrypted password
        if (
            password == current_password and
            salt == current_salt
        ):
            password = current_password
            salt = current_salt

        # Update the device in the database, based on the ID
        with SqlServer(
            server=self.sql_server,
            database=self.sql_database,
            table=self.table,
        ) as sql:
            result = sql.update(
                field='id',
                value=id,
                body={
                    'name': hostname,
                    'site': site,
                    'token': key,
                    'username': username,
                    'secret': password,
                    'salt': salt,
                }
            )

        if result:
            # Refresh the device list
            self.get_devices()
            return True

        else:
            return False

    def _new_uuid(
        self
    ) -> uuid:
        '''
        Generate a new UUID for a device
        Ensures the UUID is unique in the database

        Returns:
            UUID: A unique device UUID
        '''

        # Loop until a unique ID is found
        collision = True
        while collision:
            id = uuid.uuid4()
            collision = False

            for device in self.device_list:
                # If there is a collision, set the flag and break
                if id == device.id:
                    collision = True
                    break

        return id

    def _site_assignment(
        self,
    ) -> None:
        '''
        Assign devices to sites

        Go through devices, and match to a site object
        Update the site object with the device ID
        '''

        # Reset the device list per site
        for site in self.site_manager.site_list:
            site.devices = []

        # Loop through devices and sites to find a match
        for device in self.device_list:
            # Reset the site name
            device.site_name = ''

            for site in self.site_manager.site_list:
                if device.site == site.id:
                    # Track the device in the site's list
                    site.devices.append(device.id)

                    # Track the site name in the device
                    device.site_name = site.name
                    break
