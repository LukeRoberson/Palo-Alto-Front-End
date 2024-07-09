'''
Classes to access Palo Alto firewalls through the API

There are two APIs; The XML-based API and REST-based API
    The XML-based API is used to interact directly with the configuration
    The REST-based API is used for CRUD operations

These two APIs use different token types

Browse API calls with:
    https://hostname/api
    https://hostname/restapi-doc

The REST API needs to include the PANOS version number in the URL
    Note, this needs to be in the format 'vX.x', such as 'v11.0'

The REST API also needs to include a 'location' parameter
    vsys, device, shared, or panorama

Authentication:
    The XML API uses basic authentication, where 'username:password' is
        base64 encoded, and sent in the 'Authorization' header
        (prefixed with 'Basic')

    The REST API uses a token, which is sent in the 'X-PAN-KEY' header
'''


import requests
from colorama import Fore, Style
import xml.etree.ElementTree as ET
from typing import Tuple


class DeviceApi:
    '''
    Class to access the Palo Alto's device API

    This class is instantiated per location, such as 'vsys' or 'panorama'
        If there is more than one location (eg, multiple vsys), then
        instantiate a new class for each location
    '''

    def __init__(
        self,
        hostname: str,
        rest_key: str = '',
        xml_key: str = '',
        version: str = 'v11.0',
        location: str = 'vsys',
        vsys: str = 'vsys1',
    ) -> None:
        '''
        Initialise the class

        This means getting details for both API types

        Args:
            hostname (str): The hostname of the device
            rest_key (str): The REST API key
            xml_key (str): The XML API key
            version (str): The PANOS version number (REST)
            location (str): The location of the device (REST)
            vsys (str): The vsys to connect to (REST)
        '''

        # Device details
        self.hostname = hostname
        self.rest_key = rest_key
        self.xml_key = xml_key

        # XML details
        self.xml_base_url = f'https://{self.hostname}/api'

        # REST details
        self.rest_base_url = f'https://{self.hostname}/restapi/{version}'
        self.location = location
        self.vsys = vsys

    def get_config(
        self
    ) -> str:
        '''
        Get the running configuration of the device
        This uses the XML API

        Returns:
            str: The configuration
                XML format, but returned as a string
        '''

        # Build the request
        url = f"{self.xml_base_url}/?type=config&action=show&xpath=/"
        headers = {
            "Authorization": f'Basic {self.xml_key}',
        }

        # Send the request
        response = requests.get(
            url,
            headers=headers
        )

        # Check the response code for errors
        if response.status_code != 200:
            root = ET.fromstring(response.text)
            msg_tag = root.find(".//msg")

            print(
                Fore.RED,
                msg_tag.text,
                Style.RESET_ALL
            )

            return response.status_code

        # Return the configuration (in XML) as a string
        return response.text

    def get_device(
        self,
    ) -> Tuple[str, str, str, str] | int:
        '''
        Get the device basics
            Serial number, model, PANOS version
        This uses the XML API

        Returns:
            Tuple:
                str: The model of the device
                str: The serial number of the device
                str: The software version
            int: The response code if an error occurred
        '''

        # Build the request
        url = (
            f"{self.xml_base_url}/?type=op"
            "&cmd=<show><system><info></info></system></show>"
        )
        headers = {
            "Authorization": f'Basic {self.xml_key}',
        }

        # Send the request
        response = requests.get(
            url,
            headers=headers
        )

        # Check the response code for errors
        if response.status_code != 200:
            root = ET.fromstring(response.text)
            msg_tag = root.find(".//msg")

            print(
                Fore.RED,
                msg_tag.text,
                Style.RESET_ALL
            )

            return response.status_code

        # Extract the model and serial number
        root = ET.fromstring(response.text)
        serial = root.find(".//serial")
        model = root.find(".//model")
        version = root.find(".//sw-version")

        # Return as a tuple
        return model.text, serial.text, version.text

    def get_ha(
        self,
    ) -> bool | Tuple[bool, str, str, str] | int:
        '''
        Get high availability details
        This uses the XML API

        Returns:
            bool: Whether the device is enabled
                Returns False if HA is disabled
            Tuple:
                bool: Whether the device is enabled
                str: The local state of the device
                str: The peer state of the device
                str: The peer serial number
            int: The response code if an error occurred
        '''

        # Build the request
        url = (
            f"{self.xml_base_url}/?type=op"
            "&cmd=<show><high-availability><state>"
            "</state></high-availability></show>"
        )
        headers = {
            "Authorization": f'Basic {self.xml_key}',
        }

        # Send the request
        response = requests.get(
            url,
            headers=headers
        )

        # Check the response code for errors
        if response.status_code != 200:
            root = ET.fromstring(response.text)
            msg_tag = root.find(".//msg")

            print(
                Fore.RED,
                msg_tag.text,
                Style.RESET_ALL
            )

            return response.status_code

        # Extract the HA state
        root = ET.fromstring(response.text)
        enabled = root.find(".//enabled")

        # Check if HA is enabled
        if enabled.text == 'yes':
            enabled = True
        else:
            enabled = False
            return enabled

        # Extract the peer IP and state
        local_state = root.find(".//state")
        peer_state = root.find(".//peer-info/state")
        peer_serial = root.find(".//peer-info/serial-num")

        # Return as a tuple
        return enabled, local_state.text, peer_state.text, peer_serial.text

    def get_tags(
        self
    ) -> list:
        '''
        Get the tags from the device
            REST API, /Objects/Tags

        Returns:
            list: The tags
                @name (str): The name of the tag
                @location (str): The location of the tag
                @vsys (str): The vsys of the tag
                comments (str): The comments of the tag
                color (str): The color ID of the tag
        '''

        # Build the request
        url = f"{self.rest_base_url}/Objects/Tags"

        headers = {
            "X-PAN-KEY": self.rest_key,
        }

        params = {
            "location": self.location,
            "vsys": self.vsys,
            "output-format": "json",
        }

        # Send the request
        response = requests.get(
            url,
            headers=headers,
            params=params
        )

        # Check the response code for errors
        if response.status_code != 200:
            print(
                Fore.RED,
                response.status_code,
                Style.RESET_ALL
            )

            return response.status_code

        # Return the tags as a list
        tags = response.json()
        return tags['result']['entry']


if __name__ == '__main__':
    print("This contains the classes to access the Palo Alto API")
    print("please run the api-test.py file to test the API")
