'''
Class to track settings
'''


from yaml import safe_load, safe_dump


class AppSettings():
    '''
    Track all application settings
    Stored in YAML file, so this must be read and updated
    '''

    def __init__(self) -> None:
        '''
        Initialize the settings
        '''

        # Get settings from the yaml file
        self._read_config()

    def _read_config(self) -> None:
        '''
        Read the configuration file (config.yaml)
        '''

        # Read the configuration file
        with open('config.yaml') as f:
            config = safe_load(f)

        # Azure settings
        self.redirect_uri = config['azure']['redirect-uri']
        self.azure_tenant = config['azure']['tenant-id']
        self.azure_app = config['azure']['app-id']
        self.azure_secret = config['azure']['app-secret']

        # SQL settings
        self.sql_server = config['sql']['server']
        self.sql_port = config['sql']['port']
        self.sql_database = config['sql']['database']
        self.sql_auth_type = config['sql']['auth-type']
        self.sql_username = config['sql']['username']
        self.sql_password = config['sql']['password']
        self.sql_salt = config['sql']['salt']

        # Web server settings
        self.web_ip = config['web']['ip']
        self.web_port = config['web']['port']
        self.web_debug = config['web']['debug']

    def write_config(self) -> None:
        '''
        Write the configuration file (config.yaml)
        This is to update settings
        '''

        # Write the configuration file
        config = {
            'azure': {
                'redirect-uri': self.redirect_uri,
                'tenant-id': self.azure_tenant,
                'app-id': self.azure_app,
                'app-secret': self.azure_secret
            },
            'sql': {
                'server': self.sql_server,
                'port': self.sql_port,
                'database': self.sql_database,
                'auth-type': self.sql_auth_type,
                'username': self.sql_username,
                'password': self.sql_password,
                'salt': self.sql_salt
            },
            'web': {
                'ip': self.web_ip,
                'port': self.web_port,
                'debug': self.web_debug
            }
        }

        try:
            with open('config.yaml', 'w') as f:
                safe_dump(config, f)

        except Exception as e:
            print(e)
