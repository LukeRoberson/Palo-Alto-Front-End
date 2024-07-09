from flask import (
    Flask,
    request,
    redirect,
    session,
    url_for,
    render_template,
    jsonify,
    Response,
)

import platform
from importlib.metadata import version
from flask_azure_oauth import FlaskAzureOauth
import requests
from requests.exceptions import HTTPError
import colorama
from settings import AppSettings
from sql import SqlServer
from device import SiteManager, DeviceManager
from encryption import CryptoSecret
import base64
from api import DeviceApi
import xml.etree.ElementTree as ET
from datetime import datetime


# Load the configuration from the config.yaml file
config = AppSettings()


# Create a Flask web app
app = Flask(__name__)


def azure_auth() -> FlaskAzureOauth:
    '''
    Set up Azure AD authentication for the Flask app

    Returns:
        FlaskAzureOauth: An instance of the FlaskAzureOauth class
    '''

    # Set the Azure configuration settings
    app.config['AZURE_OAUTH_TENANCY'] = config.azure_tenant
    app.config['AZURE_OAUTH_APPLICATION_ID'] = config.azure_app
    app.config['AZURE_OAUTH_CLIENT_SECRET'] = config.azure_secret

    # Azure authentication
    auth = FlaskAzureOauth()
    try:
        auth.init_app(app)

    except HTTPError as e:
        print(
            colorama.Fore.RED,
            "There is a problem connecting to Azure's authentication URL.",
            colorama.Style.RESET_ALL
        )
        print(e)

    except Exception as e:
        print(
            colorama.Fore.RED,
            "An error occurred while setting up Azure authentication.",
            colorama.Style.RESET_ALL
        )
        print(e)

    return auth


# Authenticate the user with Azure AD
auth = azure_auth()

# Manage the sites and devices
site_manager = SiteManager(config)
device_manager = DeviceManager(config, site_manager)


@app.route('/')
# @auth()
def index():
    flask_version = version("flask")
    ip_address = request.remote_addr
    os_version = platform.platform()

    return render_template(
        'index.html',
        flask_version=flask_version,
        ip_address=ip_address,
        os_version=os_version
    )


@app.route('/devices')
# @auth()
def devices():
    '''
    Gets sites and devices from the database
    Used when populating the devices.html template
    '''

    # Refresh the site and device list
    site_manager.get_sites()
    device_manager.get_devices()

    return render_template(
        'devices.html',
        device_list=device_manager.device_list,
        ha_list=device_manager.ha_pairs,
        site_list=site_manager.site_list,
        device_count=len(device_manager),
        site_count=len(site_manager),
    )


@app.route('/objects')
# @auth()
def objects():
    return render_template('objects.html')


@app.route('/policies')
# @auth()
def policies():
    return render_template('policies.html')


@app.route('/settings')
# @auth()
def settings():
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


# Button Actions
@app.route('/save_azure', methods=['POST'])
def save_azure():
    try:
        config.azure_tenant = request.form['tenant_id']
        config.azure_app = request.form['app_id']
        config.azure_secret = request.form['app_secret']
        config.redirect_uri = request.form['callback_url']
        config.write_config()
        return jsonify(
            {
                "result": "Success",
                "message": "Settings saved"
            }
        )

    except KeyError as e:
        print(
            colorama.Fore.RED,
            f"An error occurred while saving the Azure settings: {e}",
            colorama.Style.RESET_ALL
        )
        return jsonify(
            {
                "result": "Failure",
                "message": str(e)
            }
        ), 500


@app.route('/save_sql', methods=['POST'])
def save_sql():
    try:
        config.sql_server = request.form['sql_server']
        config.sql_port = request.form['sql_port']
        config.sql_database = request.form['sql_database']
        config.sql_auth_type = request.form['sql_auth']
        config.write_config()
        return jsonify(
            {
                "result": "Success",
                "message": "Settings saved"
            }
        )

    except KeyError as e:
        print(
            colorama.Fore.RED,
            f"An error occurred while saving the Azure settings: {e}",
            colorama.Style.RESET_ALL
        )
        return jsonify(
            {
                "result": "Failure",
                "message": str(e)
            }
        ), 500


@app.route('/save_web', methods=['POST'])
def save_web():
    try:
        config.web_ip = request.form['web_ip']
        config.web_port = request.form['web_port']
        if request.form['web_debug'] == 'on':
            config.web_debug = True
        else:
            config.web_debug = False
        config.write_config()
        return jsonify(
            {
                "result": "Success",
                "message": "Settings saved"
            }
        )

    except KeyError as e:
        print(
            colorama.Fore.RED,
            f"An error occurred while saving the Azure settings: {e}",
            colorama.Style.RESET_ALL
        )
        return jsonify(
            {
                "result": "Failure",
                "message": str(e)
            }
        ), 500


@app.route('/test_sql', methods=['POST'])
def test_sql():
    with SqlServer(
        server=request.form['sql_server'],
        database=request.form['sql_database'],
        table='sites',
    ) as sql:
        result = sql.test_connection()
        print(result)
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
        else:
            return jsonify(
                {
                    "result": "Failure",
                    "message": (
                        f"Failed to connect to {config.sql_server}\\"
                        f"{config.sql_database}"
                    )
                }
            )


@app.route('/add_site', methods=['POST'])
def add_site():
    site_name = request.form['siteName']
    new_site = site_manager.add_site(site_name)

    if new_site:
        return jsonify(
            {
                "result": "Success",
                "message": f"Site '{site_name}' added successfully"
            }
        )

    else:
        return jsonify(
            {
                "result": "Failure",
                "message": f"Site '{site_name}' can't be added"
            }
        ), 500


@app.route('/add_device', methods=['POST'])
def add_device():
    device_name = request.form['deviceName']
    password = request.form['apiPass']

    with CryptoSecret() as encryptor:
        encrypted = encryptor.encrypt(password)
        encrypted_key = encrypted[0].decode()
        salt = base64.urlsafe_b64encode(encrypted[1]).decode()

    new_device = device_manager.add_device(
        name=device_name,
        hostname=request.form['hostName'],
        site=request.form['siteMember'],
        key=request.form['apiKey'],
        username=request.form['apiUser'],
        password=encrypted_key,
        salt=salt,
    )

    if new_device:
        return jsonify(
            {
                "result": "Success",
                "message": f"Device '{new_device.name}' added successfully"
            }
        )

    else:
        return jsonify(
            {
                "result": "Failure",
                "message": f"Device '{device_name}' can't be added"
            }
        ), 500


@app.route('/delete_site', methods=['POST'])
def delete_site():
    site_id = request.json['siteId']
    result = site_manager.delete_site(site_id)

    if result:
        return jsonify(
            {
                "result": "Success",
                "message": f"Site '{site_id}' deleted"
            }
        )

    else:
        return jsonify(
            {
                "result": "Failure",
                "message": f"Site '{site_id}' can't be deleted"
            }
        ), 500


@app.route('/delete_device', methods=['POST'])
def delete_device():
    device_id = request.json['deviceId']
    result = device_manager.delete_device(device_id)

    if result:
        return jsonify(
            {
                "result": "Success",
                "message": f"Device '{device_id}' deleted"
            }
        )

    else:
        return jsonify(
            {
                "result": "Failure",
                "message": f"Device '{device_id}' can't be deleted"
            }
        ), 500


@app.route('/update_site', methods=['POST'])
def update_site():
    print(request.form)
    site_name = request.form['siteEditName']
    updated_site = site_manager.update_site(
        id=request.form['siteEditId'],
        name=site_name
    )

    if updated_site:
        return jsonify(
            {
                "result": "Success",
                "message": f"Site '{site_name}' updated successfully"
            }
        )

    else:
        return jsonify(
            {
                "result": "Failure",
                "message": f"Site '{site_name}' can't be updated"
            }
        ), 500


@app.route('/update_device', methods=['POST'])
def update_device():
    device_name = request.form['deviceEditName']
    password = request.form['apiPassEdit']

    with CryptoSecret() as encryptor:
        encrypted = encryptor.encrypt(password)
        encrypted_key = encrypted[0].decode()
        salt = base64.urlsafe_b64encode(encrypted[1]).decode()

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

    if updated_device:
        return jsonify(
            {
                "result": "Success",
                "message": f"Device '{device_name}' updated successfully"
            }
        )

    else:
        return jsonify(
            {
                "result": "Failure",
                "message": f"Device '{device_name}' can't be updated"
            }
        ), 500


@app.route('/download_config', methods=['POST'])
def download_config():
    device_id = request.json['deviceId']
    table = 'devices'
    global config

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


# Redirect unauthenticated requests to Azure AD sign-in page
@app.errorhandler(401)
def custom_401(error):
    base_url = "https://login.microsoftonline.com"
    tenant = f"{config.azure_tenant}/oauth2/v2.0/authorize"
    params = (
        f"client_id={config.azure_app}&response_type=code"
        f"&redirect_uri={config.redirect_uri}&response_mode=query"
        f"&scope=openid%20profile%20email"
    )
    azure_ad_sign_in_url = f"{base_url}/{tenant}?{params}"
    return redirect(azure_ad_sign_in_url)


@app.route('/callback')
def callback():
    # Extract the authorization code from the request
    code = request.args.get('code')

    # Prepare the data for the token request
    token_url = (
        "https://login.microsoftonline.com/"
        f"{config.azure_tenant}/oauth2/v2.0/token"
    )
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    data = {
        'client_id': config.azure_app,
        'scope': 'openid profile email',
        'code': code,
        'redirect_uri': config.redirect_uri,
        'grant_type': 'authorization_code',
        'client_secret': config.azure_secret,
    }

    # Make a POST request to get the access token
    response = requests.post(token_url, headers=headers, data=data)
    response_data = response.json()

    # Extract the access token from the response
    access_token = response_data.get('access_token')

    # Optional: Store the access token in the session or database for later use
    session['access_token'] = access_token

    # Redirect to the homepage or another page after successful sign in
    return redirect(url_for('index'))


if __name__ == '__main__':
    app.run(
        debug=config.web_debug,
        ssl_context=(
            'certificates/cert.pem',
            'certificates/key.pem',
        )
    )
