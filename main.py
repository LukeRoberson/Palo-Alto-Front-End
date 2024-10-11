"""
Main module for starting the web application and setting up the routes.

This module initializes the Flask application and loads routes from the
    webroutes.py, apiroutes.py, and azure.py modules.
It serves as the entry point for the web application.

Relies on the existance and correct formatting of config.yaml
    If this does not exist or is invalid, the web application will not start.
    This contains enough information to start the web application.
    More data is then read from an SQL database.

Modules:
    webroutes: Contains the route definitions for the web application.
    apiroutes: Contains the route definitions for the API endpoints.
    device: Contains the classes for managing sites and devices.
    azure: Contains the route definitions for Azure AD login.

Usage:
    Run this module to start the web application.

Example:
    $ python main.py
"""


from flask import Flask
import os
from colorama import Fore, Style

from settings import config
from webroutes import web_bp
from apiroutes import api_bp
from device import site_manager, device_manager
from azure import azure_bp
from vpn import vpn_manager


# Create a Flask web app
app = Flask(__name__)
app.secret_key = os.getenv('api_master_pw')

if config.config_exists and config.config_valid:
    app.register_blueprint(azure_bp)
    app.register_blueprint(web_bp)
    app.register_blueprint(api_bp)

elif config.config_exists is False:
    print(
        Fore.YELLOW,
        'No Config - cannot load web routes',
        Style.RESET_ALL
    )

else:
    print(
        Fore.RED,
        'Config file is invalid - cannot load web routes',
        Style.RESET_ALL
    )

# Load sites and devices
if config.config_exists and config.config_valid:
    site_manager.get_sites()
    device_manager.get_devices()
    vpn_manager.load_vpn()
    print("Sites and devices loaded")

    debug = config.web_debug
    host_ip = config.web_ip

# Create a default route for when the config file is missing
else:
    print(
        Fore.YELLOW,
        'Config problems - Cannot load sites and devices',
        Style.RESET_ALL
    )
    debug = True
    host_ip = '0.0.0.0'

    @app.route('/')
    def error():
        return 'Error: Could not load config file'

    @app.errorhandler(404)
    def page_not_found(e):
        return 'Error: Could not load config file', 404

# Start the web server
if config.web_ssl:
    certs = (
        'certificates/cert.pem',
        'certificates/key.pem',
    )
else:
    certs = None


if __name__ == '__main__':
    app.run(
        host=host_ip,
        debug=debug,
        ssl_context=certs,
    )
