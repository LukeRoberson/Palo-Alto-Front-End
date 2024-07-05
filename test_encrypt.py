"""
Standalone tool for encrypting device passwords
Uses encryption.py to do the actual work

Modules:
    3rd Party: getpass, base64
    Custom: encryption

Classes:

    None

Functions

    main()
        Main function

Exceptions:

    None

Misc Variables:

    None

Author:
    Luke Robertson - May 2023
"""


import getpass
import base64

import encryption


def main():
    """
    Main function

    Parameters
    ----------
    None

    Raises
    ------
    None

    Returns
    -------
    None
    """

    # Get a password from the user securely
    password = getpass.getpass(prompt='Enter password to encrypt: ')
    print(type(password))
    with encryption.CryptoSecret() as encryptor:
        # Encrypt the password
        encrypted = encryptor.encrypt(password)
        secret = encrypted[0].decode()
        salt = base64.urlsafe_b64encode(encrypted[1]).decode()

    # Print the encrypted secret
    print(f'Encrypted secret: {secret}')
    print(f'Salt: {salt}')


if __name__ == '__main__':
    main()
