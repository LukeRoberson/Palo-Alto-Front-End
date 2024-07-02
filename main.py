from flask import (
    Flask,
    request,
    redirect,
    session,
    url_for,
    render_template,
    jsonify,
)

import platform
from importlib.metadata import version
from flask_azure_oauth import FlaskAzureOauth
import requests
from requests.exceptions import HTTPError
import colorama
from settings import AppSettings


# Create a Flask web app
app = Flask(__name__)

# Load the configuration from the config.yaml file
config = AppSettings()

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
    return render_template('devices.html')


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


# Redirect unauthenticated requests to Azure AD sign-in page
@app.errorhandler(401)
def custom_401(error):
    azure_ad_sign_in_url = f"https://login.microsoftonline.com/{config.azure_tenant}/oauth2/v2.0/authorize?client_id={config.azure_app}&response_type=code&redirect_uri={config.redirect_uri}&response_mode=query&scope=openid%20profile%20email"
    return redirect(azure_ad_sign_in_url)


@app.route('/callback')
def callback():
    # Extract the authorization code from the request
    code = request.args.get('code')

    # Prepare the data for the token request
    token_url = f"https://login.microsoftonline.com/{config.azure_tenant}/oauth2/v2.0/token"
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
