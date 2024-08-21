'''
Validation script for when the container is built

Validates that each section exists,
    and that each setting in these sections exist

Checks that the 'debug' setting is set to false
    This is needed to build the container
    That doesn't mean it can't be set to true after the build
'''

import sys
import yaml
from colorama import Fore, Style


CONFIG_FILE = 'config.yaml'


# Read the config file AND STORE SETTINGS
def read_config():
    with open(CONFIG_FILE, 'r') as file:
        return yaml.safe_load(file)


# Check that the web section is present in the config file
def check_web_section(config):
    if 'web' not in config:
        print(
            Fore.RED,
            "The 'web' section is missing from the config file.",
            Style.RESET_ALL
        )
        sys.exit(1)

    # Check that 'debug', 'ip', and 'port' all exist in the web section
    if not all(key in config['web'] for key in ['debug', 'ip', 'port']):
        print(
            Fore.RED,
            "All parameters need to exist in the web section:\n",
            "'debug', 'ip', and 'port'",
            Style.RESET_ALL
        )
        sys.exit(1)


# Check the debug setting in the config file
def check_debug_setting(config):
    # Check that 'debug' is set to false
    debug = config.get('web', {}).get('debug')
    if debug:
        print(
            Fore.RED,
            "The 'debug' setting must be set to false to build a container.",
            Style.RESET_ALL
        )
        sys.exit(1)


# Check the sql section in the config
def check_sql_section(config):
    if 'sql' not in config:
        print(
            Fore.RED,
            "The 'sql' section is missing from the config file.",
            Style.RESET_ALL
        )
        sys.exit(1)

    # Check that sql config parameters all exist in the sql section
    params = [
        'server', 'port', 'database',
        'auth-type', 'username', 'password', 'salt'
    ]
    if not all(key in config['sql'] for key in params):
        print(
            Fore.RED,
            "All parameters need to exist in the SQL section:\n",
            "'server', 'port', 'database',",
            " 'auth-type', 'username', 'password', 'salt'",
            Style.RESET_ALL
        )
        sys.exit(1)


# Check the azure section in the config
def check_azure_section(config):
    if 'azure' not in config:
        print(
            Fore.RED,
            "The 'azure' section is missing from the config file.",
            Style.RESET_ALL
        )
        sys.exit(1)

    # Check that azure config parameters all exist in the azure section
    params = ['app-id', 'app-secret', 'redirect-uri', 'tenant-id']
    if not all(key in config['azure'] for key in params):
        print(
            Fore.RED,
            "All parameters need to exist in the Azure section:\n",
            "'app-id', 'app-secret', 'redirect-uri', 'tenant-id'",
            Style.RESET_ALL
        )
        sys.exit(1)


# Main function to run the checks
def main():
    print(Fore.YELLOW, "Running validation checks...", Style.RESET_ALL)

    # Read the config, error if missing
    try:
        config = read_config()
    except FileNotFoundError:
        print(Fore.RED, "The config.yaml file is missing!", Style.RESET_ALL)
        sys.exit(1)

    # Check the web section in the config file
    check_web_section(config)

    # Check debug setting in config.yaml
    check_debug_setting(config)

    # Check the sql section in the config file
    check_sql_section(config)

    # Check the azure section in the config file
    check_azure_section(config)

    print(Fore.GREEN, "All validation checks passed!", Style.RESET_ALL)


if __name__ == "__main__":
    main()
