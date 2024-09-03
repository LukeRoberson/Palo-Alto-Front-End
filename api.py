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
from requests.exceptions import ConnectionError
from urllib3.exceptions import MaxRetryError, NewConnectionError
from types import TracebackType
from typing import Optional, Type, Union

from colorama import Fore, Style
import xml.etree.ElementTree as ET

from typing import Tuple


class DeviceApi:
    '''
    Class to access the Palo Alto's device API

    This class is instantiated per location, such as 'vsys' or 'panorama'
        If there is more than one location (eg, multiple vsys), then
        instantiate a new class for each location

    Methods:
        __init__: Initialise the class
        __enter__: Enter method for context manager
        __exit__: Exit method for context manager
        _rest_request: Send a REST request to the device
        _xml_request: Send an XML request to the device
        get_config: Get the running configuration of the device
        get_device: Get the device basics
        get_ha: Get high availability details
        get_tags: Get the tags from the device
        get_addresses: Get address object from the device
        get_address_groups: Get address group objects from the device
        get_application_groups: Get application group objects from the device
        get_services: Get services objects from the device
        get_service_groups: Get service group objects from the device
        get_nat_policies: Get NAT policies from the device
        get_security_policies: Get security policies from the device
        get_qos_policies: Get QoS policies from the device
        get_gp_sessions: Get active Global Protect sessions
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
        self.xml_headers = {
            "Authorization": f'Basic {self.xml_key}',
        }

        # REST details
        self.rest_base_url = f'https://{self.hostname}/restapi/{version}'
        self.rest_headers = {
            "X-PAN-KEY": self.rest_key,
        }
        self.params = {
            "location": location,
            "vsys": vsys,
            "output-format": "json",
        }

    def __enter__(
        self,
    ) -> 'DeviceApi':
        '''
        Enter method for context manager

        Returns:
            DeviceApi: The instance of the class
        '''

        return self

    def __exit__(
        self,
        exc_type: Optional[Type[BaseException]],
        exc_value: Optional[BaseException],
        traceback: Optional[TracebackType],
    ) -> Optional[bool]:
        '''
        Exit method for context manager

        Args:
            exc_type : Exception
                The type of exception raised
            exc_value : Exception
                The value of the exception raised
            traceback : Exception
                The traceback of the exception raised
        '''

        # handle errors that were raised
        if exc_type:
            print(
                f"Exception of type {exc_type.__name__} occurred: {exc_value}",
                exc_info=(exc_type, exc_value, traceback)
            )

    def _rest_request(
        self,
        url: str,
    ) -> dict | int:
        '''
        Send a REST request to the device
        Handles checking the response

        Args:
            url (str): The URL to send the request to
                Example: "/Objects/Tags"

        Returns:
            dict: The response body
            int: The response code if an error occurred
        '''

        # Send the request
        response = requests.get(
            f"{self.rest_base_url}{url}",
            headers=self.rest_headers,
            params=self.params,
        )

        # Check the response code for errors
        if response.status_code != 200:
            print(
                Fore.RED,
                response.status_code,
                Style.RESET_ALL
            )

            return response.status_code

        # Return the body of the response
        return response.json()['result']['entry']

    def _xml_request(self, url: str) -> Union[str, int]:
        '''
        Send an XML request to the device and handle the response.

        Args:
            url (str): The URL to send the request to.

        Returns:
            str: The response body if successful.
            int: The response code if an error occurred.
        '''
        full_url = f"{self.xml_base_url}{url}"
        try:
            response = requests.get(full_url, headers=self.xml_headers)
        except (ConnectionError, MaxRetryError, NewConnectionError) as e:
            print(
                Fore.RED,
                "DNS resolution or connection issue\n",
                Fore.YELLOW,
                e,
                Style.RESET_ALL
            )
            return 500
        except Exception as e:
            print(
                Fore.RED,
                f"General error connecting to device: {e}",
                Style.RESET_ALL
            )
            return 500

        if response.status_code != 200:
            root = ET.fromstring(response.text)
            msg_tag = root.find(".//msg")
            print(Fore.RED, msg_tag.text, Style.RESET_ALL)
            return response.status_code

        return response.text

    def get_config(self) -> Union[str, int]:
        '''
        Get the running configuration of the device using the XML API.

        Returns:
            str: The configuration in XML format as a string.
            int: The response code if an error occurred.
        '''
        return self._xml_request("/?type=config&action=show&xpath=/")

    def get_device(self) -> Union[Tuple[str, str, str], int]:
        '''
        Get the device basics using the XML API.

        Returns:
            Tuple[str, str, str]:
                The model, serial number, and software version of the device.
            int: The response code if an error occurred.
        '''
        response = self._xml_request(
            "/?type=op&cmd=<show><system><info></info></system></show>"
        )
        if isinstance(response, int):
            return response

        root = ET.fromstring(response)
        model = root.find(".//model").text
        serial = root.find(".//serial").text
        version = root.find(".//sw-version").text

        return model, serial, version

    def get_ha(self) -> Union[bool, Tuple[bool, str, str, str], int]:
        '''
        Get high availability details using the XML API.

        Returns:
            bool:
                Whether the device is enabled (False if HA is disabled).
            Tuple[bool, str, str, str]:
                Whether the device is enabled, local state,
                    peer state, and peer serial number.
            int:
                The response code if an error occurred.
        '''
        response = self._xml_request(
            "/?type=op&cmd=<show>"
            "<high-availability>"
            "<state></state>"
            "</high-availability>"
            "</show>"
        )
        if isinstance(response, int):
            return response

        root = ET.fromstring(response)
        enabled = root.find(".//enabled").text == 'yes'
        if not enabled:
            return False

        local_state = root.find(".//state").text
        peer_state = root.find(".//peer-info/state").text
        peer_serial = root.find(".//peer-info/serial-num").text

        return enabled, local_state, peer_state, peer_serial

    def get_gp_sessions(self) -> Union[list, int]:
        '''
        Get active Global Protect sessions using the XML API.

        Returns:
            list of dicts: The active sessions.
            int: The response code if an error occurred.
        '''
        response = self._xml_request(
            "/?type=op&cmd=<show>"
            "<global-protect-gateway>"
            "<current-user/>"
            "</global-protect-gateway>"
            "</show>"
        )
        if isinstance(response, int):
            return response

        root = ET.fromstring(response)
        results = root.find(".//result")

        session_list = []
        for gp_session in results:
            session = {
                'username': gp_session.find(".//username").text,
                'primary-username': gp_session.find(
                    ".//primary-username"
                ).text,
                'source-region': gp_session.find(".//source-region").text,
                'computer': gp_session.find(".//computer").text,
                'client': gp_session.find(".//client").text,
                'vpn-type': gp_session.find(".//vpn-type").text,
                'host-id': gp_session.find(".//host-id").text,
                'app-version': gp_session.find(".//app-version").text,
                'virtual-ip': gp_session.find(".//virtual-ip").text,
                'public-ip': gp_session.find(".//public-ip").text,
                'tunnel-type': gp_session.find(".//tunnel-type").text,
                'login-time': gp_session.find(".//login-time").text,
            }
            session_list.append(session)

        return session_list

    def get_vpn_tunnels(self) -> Union[list, int]:
        '''
        Get VPN tunnels using the XML API.

        Returns:
            list of dicts: The active sessions.
            int: The response code if an error occurred.
        '''
        response = self._xml_request(
            "/?type=op&cmd=<show>"
            "<vpn>"
            "<flow>"
            "</flow>"
            "</vpn>"
            "</show>"
        )
        if isinstance(response, int):
            return response

        root = ET.fromstring(response)
        results = root.find(".//result/IPSec")

        tunnel_list = []
        for vpn in results:
            tunnel = {
                'id': vpn.find(".//id").text,
                'name': vpn.find(".//name").text,
                'inner-if': vpn.find(".//inner-if").text,
                'outer-if': vpn.find(".//outer-if").text,
                'gwid': vpn.find(".//gwid").text,
                'ipsec-mode': vpn.find(".//ipsec-mode").text,
                'localip': vpn.find(".//localip").text,
                'peerip': vpn.find(".//peerip").text,
                'state': vpn.find(".//state").text,
                'monitor': vpn.find(".//mon").text,
                'owner': vpn.find(".//owner").text,
            }
            tunnel_list.append(tunnel)

        return tunnel_list

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

        tags = self._rest_request("/Objects/Tags")
        return tags

    def get_addresses(
        self
    ) -> list:
        '''
        Get address object from the device
            REST API, /Objects/Addresses

        Returns:
            list: The addresses
                @name (str): The name of the address
                @location (str): The location of the address
                @vsys (str): The vsys of the address
                ip-netmask (str): The IP address and netmask
                description (str): The description of the address
                tag (str): The tag of the address
        '''

        addresses = self._rest_request("/Objects/Addresses")
        return addresses

    def get_address_groups(
        self
    ) -> list:
        '''
        Get address group objects from the device
            REST API, /Objects/AddressGroups

        Returns:
            list: The address groups
                @name (str): The name of the address
                @location (str): The location of the address
                @vsys (str): The vsys of the address
                static (dict): The static members of the group
                    member (list): The members of the group
                tag (dict): The tag of the group
                    member (list): The tags of the group
                description (str): The description of the group
        '''

        address_groups = self._rest_request("/Objects/AddressGroups")
        return address_groups

    def get_application_groups(
        self
    ) -> list:
        '''
        Get application group objects from the device
            REST API, /Objects/ApplicationGroups

        Returns:
            list: The application groups
                @name (str): The name of the address
                @location (str): The location of the address
                @vsys (str): The vsys of the address
                members (dict): The members of the group
                    member (list): The members of the group
        '''

        application_groups = self._rest_request("/Objects/ApplicationGroups")
        return application_groups

    def get_services(
        self
    ) -> list:
        '''
        Get services objects from the device
            REST API, /Objects/Services

        Returns:
            list: The services
                @name (str): The name of the address
                @location (str): The location of the address
                @vsys (str): The vsys of the address
                protocol (dict): The protocol of the service
                    protocol (dict): The protocol of the service (eg, tcp)
                        port (int): The port number
                        override (str): The override of the service (yes or no)
                tag (dict): The tag of the service
                    member (list): The tags of the service
                description (str): The description of the service
        '''

        services = self._rest_request("/Objects/Services")
        return services

    def get_service_groups(
        self
    ) -> list:
        '''
        Get service group objects from the device
            REST API, /Objects/ServiceGroups

        Returns:
            list: The service groups
                @name (str): The name of the address
                @location (str): The location of the address
                @vsys (str): The vsys of the address
                members (dict): The members of the group
                    member (list): The members of the group
                tag (dict): The tag of the group
                    member (list): The tags of the group
        '''

        service_groups = self._rest_request("/Objects/ServiceGroups")
        return service_groups

    def get_nat_policies(
        self
    ) -> list:
        '''
        Get NAT policies from the device
            REST API, /Policies/NATRules

        Returns (fields are not guaranteed to be present):
            list: The NAT rules
                @name (str): The name of the address
                @uuid (str): The UUID of the address
                @location (str): The location of the address
                @vsys (str): The vsys of the address
                source-translation (dict): The source translation of the NAT
                    static-ip (dict): The static IP of the NAT
                        bi-directional (str): The bi-directional of the NAT
                            (yes or no)
                        translated-address (str): The translated address
                    dynamic-ip-and-port (dict): The dynamic IP and port
                        translated-address (str): The translated address
                destination-translation (dict): The destination translation
                    translated-address (str): The translated address of the NAT
                to (dict): The 'to' of the NAT
                    member (list): The members of the NAT
                from (dict): The 'from' of the NAT
                    member (list): The members of the NAT
                source (dict): The source of the NAT
                    member (list): The members of the NAT
                destination (dict): The destination of the NAT
                    member (list): The members of the NAT (may be 'any')
                service (str): The service of the NAT
                tag (dict): The tag of the NAT
                    member (list): The tags of the NAT
                group-tag (str): The group tag of the NAT
                description (str): The description of the NAT
                disabled (str): The disabled of the NAT
                    'yes' if disabled, not present if enabled
        '''

        nat_rules = self._rest_request("/Policies/NATRules")

        return nat_rules

    def get_security_policies(
        self
    ) -> list:
        '''
        Get security policies from the device
            REST API, /Policies/SecurityRules

        Returns:
            list: The security rules
                @name (str): The name of the address
                @uuid (str): The UUID of the address
                @location (str): The location of the address
                @vsys (str): The vsys of the address
                to (dict): The 'to' of the security rule
                    member (list): The members of the security rule
                from (dict): The 'from' of the security rule
                    member (list): The members of the security rule
                source (dict): The source of the security rule
                    member (list): The members of the security rule
                destination (dict): The destination of the security rule
                    member (list): The members of the security rule
                source-user (dict): The source user of the security rule
                    member (list): The members of the security rule
                category (dict): The category of the security rule
                    member (list): The members of the security rule
                application (dict): The application of the security rule
                    member (list): The members of the security rule
                service (dict): The service of the security rule
                    member (list): The members of the security rule
                source-hip (dict): The source HIP of the security rule
                    member (list): The members of the security rule
                destination-hip (dict): The destination HIP of the rule
                    member (list): The members of the security rule
                tag (dict): The tag of the security rule
                    member (list): The tags of the security rule
                action (str): The action of the security rule
                rule-type (str): The rule type of the security rule
                description (str): The description of the security rule
                group-tag (str): The group tag of the security rule
                log-setting (str): The log setting of the security rule
                disabled (str): The disabled of the security rule (yes or no)
                log-start (str): The log start of the security rule (yes or no)
                log-end (str): The log end of the security rule (yes or no)
        '''

        security_rules = self._rest_request("/Policies/SecurityRules")
        return security_rules

    def get_qos_policies(
        self
    ) -> list:
        '''
        Get QoS policies from the device
            REST API, /Policies/QoSRules

        Returns:
            list: The QoS rules
                @name (str): The name of the address
                @uuid (str): The UUID of the address
                @location (str): The location of the address
                @vsys (str): The vsys of the address
                from (dict): The 'from' of the QoS rule
                    member (list): The members of the QoS rule
                to (dict): The 'to' of the QoS rule
                    member (list): The members of the QoS rule
                source (dict): The source of the QoS rule
                    member (list): The members of the QoS rule
                destination (dict): The destination of the QoS rule
                    member (list): The members of the QoS rule (may be 'any')
                source-user (dict): The source user of the QoS rule
                    member (list): The members of the QoS rule
                category (dict): The category of the QoS rule
                    member (list): The members of the QoS rule
                service (dict): The service of the QoS rule
                    member (list): The members of the QoS rule
                application (dict): The application of the QoS rule
                    member (list): The members of the QoS rule
                action (str): The action of the QoS rule
                    class (str): The class of the QoS rule
                dscp-tos (dict): The DSCP TOS of the QoS rule
                    codepoints (dict): The codepoints of the QoS rule
                        entry (list): The entries of the QoS rule
                            @name (str): The name of the address
                            name (dict): The name of the address
                                codepoint (str): The codepoint of the address
                description (str): The description of the address
                source-hip (dict): The source HIP of the QoS rule
                    member (list): The members of the QoS rule
                destination-hip (dict): The destination HIP of the QoS rule
                    member (list): The members of the QoS rule
                tag (dict): The tag of the QoS rule
                    member (list): The tags of the QoS rule
                group-tag (str): The group tag of the QoS rule
        '''

        qos_rules = self._rest_request("/Policies/QoSRules")
        return qos_rules


if __name__ == '__main__':
    print("This contains the classes to access the Palo Alto API")
    print("please run the api-test.py file to test the API")
