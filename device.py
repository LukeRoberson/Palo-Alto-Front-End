'''
Classes to manage sites and devices
Tracks each of these objects, and contains methods to manage them
'''

import uuid


class Site:
    '''
    Site class
    Contains the name and id of a site
    This will likely be instantiated multiple times, and stored in a list
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
