'''
The main file for starting the web application and setting up the routes.
Routes are loaded from classes in webroutes.py
'''

from flask import (
    Flask,
    request,
    redirect,
    session,
    url_for,
)

from webroutes import (
    IndexView,
    DevicesView,
    ObjectsView,
    PoliciesView,
    GlobalProtectView,
    SettingsView,
    SaveAzureView,
    SaveSqlView,
    SaveWebView,
    TestSqlView,
    AddSiteView,
    AddDeviceView,
    DeleteSiteView,
    DeleteDeviceView,
    UpdateSiteView,
    UpdateDeviceView,
    DownloadConfigView,
    DeviceListView,
    SiteListView,
    RefreshDevSiteView,
    GetTagsView,
)

from flask_azure_oauth import FlaskAzureOauth
import requests
from requests.exceptions import HTTPError
import colorama
from settings import AppSettings
from device import SiteManager, DeviceManager


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


# Index/Info Page
app.add_url_rule(
    '/',
    view_func=IndexView.as_view('index')
)

# Device management page
app.add_url_rule(
    '/devices',
    view_func=DevicesView.as_view('devices'),
    defaults={'device_manager': device_manager, 'site_manager': site_manager}
)

# Objects page
app.add_url_rule(
    '/objects', view_func=ObjectsView.as_view('objects')
)

# Policies page
app.add_url_rule(
    '/policies',
    view_func=PoliciesView.as_view('policies')
)

# Global Protect page
app.add_url_rule(
    '/globalprotect',
    view_func=GlobalProtectView.as_view('globalprotect')
)

# Settings page
app.add_url_rule(
    '/settings',
    view_func=SettingsView.as_view('settings'),
    defaults={'config': config}
)

# Save Azure settings
app.add_url_rule(
    '/save_azure',
    view_func=SaveAzureView.as_view('save_azure'),
    defaults={'config': config}
)

# Save SQL settings
app.add_url_rule(
    '/save_sql',
    view_func=SaveSqlView.as_view('save_sql'),
    defaults={'config': config}
)

# Save Web settings
app.add_url_rule(
    '/save_web',
    view_func=SaveWebView.as_view('save_web'),
    defaults={'config': config}
)

# Test SQL connection
app.add_url_rule(
    '/test_sql',
    view_func=TestSqlView.as_view('test_sql'),
    defaults={'config': config}
)

# Add a new site
app.add_url_rule(
    '/add_site',
    view_func=AddSiteView.as_view('add_site'),
    defaults={'site_manager': site_manager}
)

# Add a new device
app.add_url_rule(
    '/add_device',
    view_func=AddDeviceView.as_view('add_device'),
    defaults={'device_manager': device_manager}
)

# Delete a site
app.add_url_rule(
    '/delete_site',
    view_func=DeleteSiteView.as_view('delete_site'),
    defaults={'site_manager': site_manager}
)

# Delete a device
app.add_url_rule(
    '/delete_device',
    view_func=DeleteDeviceView.as_view('delete_device'),
    defaults={'device_manager': device_manager}
)

# Update a site
app.add_url_rule(
    '/update_site',
    view_func=UpdateSiteView.as_view('update_site'),
    defaults={'site_manager': site_manager}
)

# Update a device
app.add_url_rule(
    '/update_device',
    view_func=UpdateDeviceView.as_view('update_device'),
    defaults={'device_manager': device_manager}
)

# Download the device configuration
app.add_url_rule(
    '/download_config',
    view_func=DownloadConfigView.as_view('download_config'),
    defaults={'config': config},
)

# Get the list of devices
app.add_url_rule(
    '/device_list',
    view_func=DeviceListView.as_view('device_list'),
    defaults={'device_manager': device_manager}
)

# Get the list of sites
app.add_url_rule(
    '/site_list',
    view_func=SiteListView.as_view('site_list'),
    defaults={'site_manager': site_manager}
)

# Refresh the devices and sites
app.add_url_rule(
    '/refresh_dev_site',
    view_func=RefreshDevSiteView.as_view('refresh_dev_site'),
    defaults={'site_manager': site_manager, 'device_manager': device_manager}
)

# Get the tags from the device
app.add_url_rule(
    '/get_tags',
    view_func=GetTagsView.as_view('get_tags'),
    defaults={'config': config}
)


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
    site_manager.get_sites()
    device_manager.get_devices()

    app.run(
        debug=config.web_debug,
        ssl_context=(
            'certificates/cert.pem',
            'certificates/key.pem',
        )
    )
