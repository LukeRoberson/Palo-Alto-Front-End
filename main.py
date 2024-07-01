from flask import (
    Flask,
    request,
    redirect,
    session,
    url_for,
    render_template
)

import platform
from importlib.metadata import version
from yaml import safe_load
from flask_azure_oauth import FlaskAzureOauth
import requests
from requests.exceptions import HTTPError
import colorama


# Create a Flask web app
app = Flask(__name__)

# Load the configuration from the config.yaml file
with open('config.yaml') as f:
    config = safe_load(f)

redirect_uri = config['azure']['redirect-uri']
azure_tenant = config['azure']['tenant-id']
azure_app = config['azure']['app-id']
azure_secret = config['azure']['app-secret']

# Set the Azure configuration settings
app.config['AZURE_OAUTH_TENANCY'] = azure_tenant
app.config['AZURE_OAUTH_APPLICATION_ID'] = azure_app
app.config['AZURE_OAUTH_CLIENT_SECRET'] = azure_secret

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


# Redirect unauthenticated requests to Azure AD sign-in page
@app.errorhandler(401)
def custom_401(error):
    azure_ad_sign_in_url = f"https://login.microsoftonline.com/{azure_tenant}/oauth2/v2.0/authorize?client_id={azure_app}&response_type=code&redirect_uri={redirect_uri}&response_mode=query&scope=openid%20profile%20email"
    return redirect(azure_ad_sign_in_url)


@app.route('/callback')
def callback():
    # Extract the authorization code from the request
    code = request.args.get('code')

    # Prepare the data for the token request
    token_url = f"https://login.microsoftonline.com/{azure_tenant}/oauth2/v2.0/token"
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    data = {
        'client_id': azure_app,
        'scope': 'openid profile email',
        'code': code,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code',
        'client_secret': azure_secret,
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
    app.run()
