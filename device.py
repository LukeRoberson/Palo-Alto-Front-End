'''
Classes to manage sites and devices
Tracks each of these objects, and contains methods to manage them
'''

import uuid
from sql import SqlServer
from settings import AppSettings


class Site:
    '''
    Site class
    Contains the name and id of a site
    This will likely be instantiated multiple times, and stored in a list

    Methods:
        __init__: Constructor for Site class
        __str__: String representation of the site
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
    ) -> None:
        '''
        Constructor for Device class

        Args:
            name (str): Friendly name of the device
            id (uuid): Unique identifier for the site
            hostname (str): Hostname of the device
            site (uuid): Site identifier
            key (str): API key for the device
        '''

        self.name = name
        self.id = id
        self.hostname = hostname
        self.site = site
        self.key = key

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
            table='sites',
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


class DeviceManager():
    '''
    A class to manage all devices
    Stores all devices in a list (from the database)
    Adds and removes devices
    '''

    def __init__(
        self,
        config: AppSettings,
    ) -> None:
        '''
        Constructor for DeviceManager class
        Initializes the devices list

        Args:
            config (AppSettings): Application settings
        '''

        # Sql Server connection
        self.sql_server = config.sql_server
        self.sql_database = config.sql_database

        # List of all sites
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
            table='devices',
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
                )
            )
