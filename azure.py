'''
Functions to interact with Azure services
Specifically, to authenticate with Azure AD and retrieve the access token
'''

from settings import config
import msal
from flask import Blueprint, redirect, request, session, url_for
import uuid
from functools import wraps
from colorama import Fore, Style

azure_bp = Blueprint('azure', __name__)

# Configure Azure AD details
CLIENT_ID = None
CLIENT_SECRET = None
TENANT_ID = None
AUTHORITY = None
REDIRECT_PATH = None
SCOPE = None
msal_app = None

# Admins group
ADMIN_GROUP = 'Network Admins'

if config.config_exists and config.config_valid:
    CLIENT_ID = config.azure_app
    CLIENT_SECRET = config.azure_secret
    TENANT_ID = config.azure_tenant
    AUTHORITY = f'https://login.microsoftonline.com/{TENANT_ID}'
    REDIRECT_PATH = config.redirect_uri
    SCOPE = ['User.Read']

    # Initialize MSAL
    msal_app = msal.ConfidentialClientApplication(
        CLIENT_ID, authority=AUTHORITY,
        client_credential=CLIENT_SECRET)

elif config.config_exists is False:
    print(
        Fore.YELLOW,
        "No config - Cannot read Azure settings",
        Style.RESET_ALL
    )

else:
    print(
        Fore.RED,
        "Config file is invalid - Cannot read Azure settings",
        Style.RESET_ALL
    )


# Decorator to protect routes with Azure AD login
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if config.web_debug is True:
            return f(*args, **kwargs)
        if 'user' not in session:
            return redirect(url_for('azure.login', next=request.url))
        if 'groups' not in session or ADMIN_GROUP not in session['groups']:
            return redirect(url_for('web.unauthorized'))
        return f(*args, **kwargs)
    return decorated_function


# Redirection to Azure login page
@azure_bp.route('/login')
def login():
    # Generate the full authorization URL
    session['state'] = str(uuid.uuid4())
    auth_url = msal_app.get_authorization_request_url(
        SCOPE,
        state=session['state'],
        redirect_uri=url_for('azure.authorized', _external=True)
    )
    return redirect(auth_url)


# Callback URL for Azure login response
@azure_bp.route(REDIRECT_PATH)
def authorized():
    # Check for an error in the response
    if 'error' in request.args:
        return (
            f"Error: {request.args['error']} - "
            f"{request.args.get('error_description')}"
        )

    # Collect the code from the response
    code = request.args.get('code')
    print(f"Callback Code: {code}")

    # The callback contains a code
    if code:
        # Get the auth token
        result = msal_app.acquire_token_by_authorization_code(
            code,
            scopes=SCOPE,
            redirect_uri=url_for('azure.authorized', _external=True)
        )

        # Get the access token
        if 'access_token' in result:
            session['user'] = result.get('id_token_claims')
            session['groups'] = result.get('id_token_claims').get('groups', [])
            return redirect(url_for('web.index'))

        # Return an error if the access token is not found
        return (
            f"Error: {result.get('error')} - "
            f"{result.get('error_description')}"
        )

    # If no code is provided, return an error
    return "No code provided"
