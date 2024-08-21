'''
The main file for starting the web application and setting up the routes.
Routes are loaded from classes in webroutes.py
'''

from flask import Flask
import os

from webroutes import web_bp
from apiroutes import api_bp
from settings import config
from device import site_manager, device_manager
from azure import azure_bp


# Create a Flask web app
app = Flask(__name__)
app.secret_key = os.getenv('api_master_pw')
app.register_blueprint(azure_bp)
app.register_blueprint(web_bp)
app.register_blueprint(api_bp)


if __name__ == '__main__':
    site_manager.get_sites()
    device_manager.get_devices()

    app.run(
        host='0.0.0.0',
        debug=config.web_debug,
        ssl_context=(
            'certificates/cert.pem',
            'certificates/key.pem',
        )
    )
