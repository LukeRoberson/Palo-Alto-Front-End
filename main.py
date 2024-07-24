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
import msal
import uuid

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
    GetAddressesView,
    GetAddressGroupsView,
    GetApplicationGroupsView,
    GetServicesView,
    GetServiceGroupView,
    GetNatPolicyView,
    GetSecurityPolicyView,
    GetQoSPolicyView,
    GetGPSessionsView,
)

from settings import AppSettings
from device import SiteManager, DeviceManager


# Load the configuration from the config.yaml file
config = AppSettings()

# Create a Flask web app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'devkey'         # NOTE: Update this to something better later

# Configure your Azure AD details
CLIENT_ID = config.azure_app
CLIENT_SECRET = config.azure_secret
TENANT_ID = config.azure_tenant
AUTHORITY = f'https://login.microsoftonline.com/{TENANT_ID}'
REDIRECT_PATH = '/getAToken'
SCOPE = ['User.Read']  # Adjust scopes as needed

# Initialize MSAL
msal_app = msal.ConfidentialClientApplication(
    CLIENT_ID, authority=AUTHORITY,
    client_credential=CLIENT_SECRET)


# Manage the sites and devices
site_manager = SiteManager(config)
device_manager = DeviceManager(config, site_manager)


@app.route('/login')
def login():
    # Generate the full authorization URL
    session['state'] = str(uuid.uuid4())
    auth_url = msal_app.get_authorization_request_url(
        SCOPE, state=session['state'],
        redirect_uri=url_for('authorized', _external=True)
    )
    return redirect(auth_url)


@app.route(REDIRECT_PATH)
def authorized():
    # Validate state
    if request.args.get('state') != session.get('state'):
        return 'State does not match', 400
    if 'error' in request.args:
        return (
            f"Error: {request.args.get('error')} - "
            f"{request.args.get('error_description')}"
        )

    # Get the authorization code from the response
    code = request.args.get('code')
    result = msal_app.acquire_token_by_authorization_code(
        code,
        scopes=SCOPE,  # Specify the same scope used in login
        redirect_uri=url_for('authorized', _external=True))

    if 'access_token' in result:
        # Successful authentication
        session['user'] = result.get('id_token_claims')
        return f"Welcome {session['user'].get('name')}!"
    else:
        return 'Authentication failed.', 401


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

# Get the address objects from the device
app.add_url_rule(
    '/get_address_objects',
    view_func=GetAddressesView.as_view('get_address_objects'),
    defaults={'config': config}
)

# Get the address groups from the device
app.add_url_rule(
    '/get_address_groups',
    view_func=GetAddressGroupsView.as_view('get_address_groups'),
    defaults={'config': config}
)

# Get the application groups from the device
app.add_url_rule(
    '/get_application_groups',
    view_func=GetApplicationGroupsView.as_view('get_application_groups'),
    defaults={'config': config}
)

# Get the service objects from the device
app.add_url_rule(
    '/get_service_objects',
    view_func=GetServicesView.as_view('get_service_objects'),
    defaults={'config': config}
)

# Get the service groups from the device
app.add_url_rule(
    '/get_service_groups',
    view_func=GetServiceGroupView.as_view('get_service_groups'),
    defaults={'config': config}
)

# Get the NAT Policies from the device
app.add_url_rule(
    '/get_nat_policies',
    view_func=GetNatPolicyView.as_view('get_nat_policies'),
    defaults={'config': config}
)

# Get the Security Policies from the device
app.add_url_rule(
    '/get_security_policies',
    view_func=GetSecurityPolicyView.as_view('get_security_policies'),
    defaults={'config': config}
)

# Get the QoS Policies from the device
app.add_url_rule(
    '/get_qos_policies',
    view_func=GetQoSPolicyView.as_view('get_qos_policies'),
    defaults={'config': config}
)

# Get the Global Protect sessions from the device
app.add_url_rule(
    '/get_gp_sessions',
    view_func=GetGPSessionsView.as_view('get_gp_sessions'),
    defaults={'config': config, 'device_manager': device_manager}
)


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
