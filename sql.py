"""
Creates and reads entries in an SQL database
"""

import pyodbc
from typing import Union
from colorama import init, Fore, Style
import datetime


# Colourama initialisation
init(autoreset=True)


class Sql():
    '''
    Connect to an SQL server/database to read and write

    Methods:
        add()
            Adds an entry to the database
        read_last()
            Reads the last entry in a database
        read_since()
            Reads all entries since a particular time
    '''

    def __init__(
        self,
        server: str,
        database: str,
        debug: bool = False
    ) -> None:
        '''
        Class constructor

        Set up variables for the SQL server and database
        '''

        self.server = server
        self.db = database
        self.debug = debug

    def add(
        self,
        table: str,
        fields: dict
    ) -> bool:
        '''
        Add an entry to the database

        Args:
            table : str
                The database table to write to
            fields : dict
                A dictionary that includes named fields and values to write

        Raises:
            Exception
                If there were errors writing to the database

        Returns:
            True : boolean
                If the write was successful
            False : boolean
                If the write failed
        '''

        # We need columns and values
        #   Both are strings, a comma separates each entry
        # Create empty strings for columns and corresponding values
        columns = ''
        values = ''

        # Populate the columns and values (comma after each entry)
        for field in fields:
            columns += field + ', '
            values += str(fields[field]) + ', '

        # Clean up the trailing comma, to make this valid
        columns = columns.strip(", ")
        values = values.strip(", ")

        # Build the SQL command as a string
        sql_string = f'INSERT INTO {table} ('
        sql_string += columns
        sql_string += ')'

        sql_string += '\nVALUES '
        sql_string += f'({values});'

        # Optionally, we can debug this to the terminal
        if self.debug:
            print(
                Fore.MAGENTA,
                f"DEBUG (sql.py): {sql_string}",
                Style.RESET_ALL
            )

        # Connect to db, run the SQL command, commit the transaction
        try:
            with pyodbc.connect(
                    'Driver={SQL Server};'
                    'Server=%s;'
                    'Database=%s;'
                    'Trusted_Connection=yes;'
                    % (self.server, self.db)) as self.conn:

                # The cursor is a pointer to an area in the database
                self.cursor = self.conn.cursor()

                # Try to execute the SQL command (add rows)
                try:
                    self.cursor.execute(sql_string)
                except Exception as err:
                    print(
                        Fore.RED,
                        f"SQL execution error: {err}",
                        Style.RESET_ALL
                    )

                    return False

                # Commit the transaction
                try:
                    self.conn.commit()
                except Exception as err:
                    print(
                        Fore.RED,
                        f"SQL commit error: {err}",
                        Style.RESET_ALL
                    )

                    return False

        # If the SQL server connection failed
        except Exception as err:
            print(
                Fore.RED,
                f"Error {err} connecting to the SQL database",
                Style.RESET_ALL
            )

            return False

        # If all was good, return True
        return True

    def read_last(
        self,
        table: str,
    ) -> Union[str, bool]:
        '''
        Read the last entry in a table

        Args:
            table : str
                The database table to write to

        Raises:
            Exception
                If there were errors connecting to the server
            Exception
                If there were errors reading

        Returns:
            entry : str
                The entry retrieved from the SQL server
            False : boolean
                If the read failed
        '''

        # Connect to the SQL database
        try:
            with pyodbc.connect(
                    'Driver={SQL Server};'
                    'Server=%s;'
                    'Database=%s;'
                    'Trusted_Connection=yes;'
                    % (self.server, self.db)) as self.conn:
                self.cursor = self.conn.cursor()

                # Send the SQL command to the server and execute
                try:
                    self.cursor.execute(
                        f"SELECT TOP 1 * \
                        FROM [NetworkAssistant_Alerts].[dbo].[{table}] \
                        ORDER BY id DESC"
                    )
                    for row in self.cursor:
                        entry = row

                # If there was a problem reading
                except Exception as err:
                    print(
                        Fore.RED,
                        f"SQL read error: {err}",
                        Style.RESET_ALL,
                    )

                    return False

        # If there was a problem connecting to the server
        except Exception as err:
            print(
                Fore.RED,
                f"Error {err} connecting to the SQL database",
                Style.RESET_ALL,
            )

            return False

        # If it all worked, return the entry
        return entry

    # Read entries between date/times
    def read_since(
        self,
        table: str,
        start_date: datetime,
        start_time: datetime,
        end_date: datetime,
        end_time: datetime,
    ) -> Union[list, bool]:
        '''
        Read entries between particular date/times

        Args:
            table : str
                The database table to write to
            start_date : datetime
                The starting date
            start_time : datetime
                The starting time
            end_date : datetime
                The ending date
            end_time : datetime
                The ending time

        Raises:
            Exception
                If there were errors connecting to the server
            Exception
                If there were errors reading

        Returns:
            entry : list
                A list of entries retrieved from the SQL server
            False : boolean
                If the read failed
        '''

        # A list of entries
        entry = []

        # Connect to db
        try:
            with pyodbc.connect(
                    'Driver={SQL Server};'
                    'Server=%s;'
                    'Database=%s;'
                    'Trusted_Connection=yes;'
                    % (self.server, self.db)) as self.conn:
                self.cursor = self.conn.cursor()

                # Send the SQL command
                try:
                    self.cursor.execute(
                        f"SELECT * \
                        FROM [NetworkAssistant_Alerts].[dbo].[{table}] \
                        WHERE \
                        (logdate = '{start_date}' \
                            AND logtime between '{start_time}' \
                            AND '23:59:59') OR \
                        (logdate = '{end_date}' \
                            AND logtime between '00:00:00' \
                            AND '{end_time}') OR \
                        (logdate between '{start_date}' AND '{end_date}') AND \
                        (message NOT LIKE '' AND message NOT LIKE '0')"
                    )

                    # Add the results to the list to return
                    for row in self.cursor:
                        entry.append(row)

                # If there was a problem reading
                except Exception as err:
                    print(
                        Fore.RED,
                        f"SQL read error: {err}",
                        Style.RESET_ALL
                    )

                    return False

        # If there was a problem connecting to the DB
        except Exception as err:
            print(
                Fore.RED,
                f"Error {err} connecting to the SQL database",
                Style.RESET_ALL
            )

            return False

        # If all worked, return the entries
        return entry
