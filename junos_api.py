'''
Classes to access Junos firewalls through the API

Junos supports two APIs:
    REST API
    NETCONF

This module uses the NETCONF API, with the pyEZ library
    By default, this returns a list of 'facts' about the device

PyEZ usage details:
    https://www.juniper.net/documentation/en_US/day-one-books/DO_PyEZ_Cookbook.pdf

Authentication:
    The Junos device must be configured to allow NETCONF access
        'set system services netconf ssh'

    The pyEZ library uses SSH to connect to the device,
        passing a username and password
    This user must have suitable permissions to access the device
'''


from jnpr.junos import Device
from jnpr.junos.exception import (
    ConnectError,
    ConnectAuthError,
    ConnectTimeoutError,
)
from typing import Union, Tuple
from colorama import Fore, Style


class DeviceApi:
    '''
    Class to access Junos devices through the NETCONF API

    Methods:
        __init__: Initialise the class with the device details
        __enter__: Context manager
        __exit__: Context manager
    '''

    def __init__(
        self,
        hostname: str,
        username: str,
        password: str,
    ) -> None:
        '''
        Initialise the class with the device details

        Args:
            hostname (str): The hostname or IP address of the device
            username (str): The username to connect with
            password (str): The password to connect with
        '''

        # Device details
        self.hostname = hostname
        self.username = username
        self.password = password

        # Connect to the device
        self.device = Device(
            host=self.hostname,
            user=self.username,
            passwd=self.password
        )
        try:
            self.device.open()

        except ConnectAuthError:
            print(
                Fore.RED,
                f"Failed to authenticate to {self.hostname}",
                Style.RESET_ALL
            )

        except ConnectTimeoutError:
            print(
                Fore.RED,
                f"Timeout connecting to {self.hostname}",
                Style.RESET_ALL
            )

        except ConnectError:
            print(
                Fore.RED,
                f"Error connecting to {self.hostname}",
                Style.RESET_ALL
            )

        except Exception as e:
            print(
                Fore.RED,
                f"Generic error connecting to {self.hostname}",
                Style.RESET_ALL
            )
            print(
                Fore.YELLOW,
                e,
                Style.RESET_ALL
            )

    def __enter__(
        self
    ) -> 'DeviceApi':
        '''
        Context manager

        Returns:
            DeviceApi: The current instance
        '''

        return self

    def __exit__(
        self,
        exc_type,
        exc_value,
        traceback
    ) -> None:
        '''
        Context manager

        Args:
            exc_type: Exception type
            exc_value: Exception value
            traceback: Traceback
        '''

        # handle errors that were raised
        if exc_type:
            print(
                f"Exception of type {exc_type.__name__} occurred: {exc_value}",
                exc_info=(exc_type, exc_value, traceback)
            )

    def get_device(
        self
    ) -> Union[Tuple[str, str, str], int]:
        '''
        Get device basics from the device

        Returns:
            Tuple[str, str, str]: The device details
                The model, serial number, and software version of the device.
            int: The response code if an error occurred.
        '''

        # Get basics from the device 'facts'
        model = self.device.facts['model']
        serial = self.device.facts['serialnumber']
        version = self.device.facts['version']

        return model, serial, version

    def get_ha(
        self
    ) -> Union[bool, Tuple[bool, str, str, str], int]:
        '''
        Get high availability details.

        Returns:
            bool:
                Whether the device is enabled (False if HA is disabled).
            Tuple[bool, str, str, str]:
                Whether the device is enabled, local state,
                    peer state, and peer serial number.
            int:
                The response code if an error occurred.
        '''

        enabled = False
        local_state = None
        peer_state = None
        peer_serial = None

        return enabled, local_state, peer_state, peer_serial
