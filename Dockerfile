# Use the official Python image from the Docker Hub
# Cannot use 'slim' and 'alpine' images as they do not have the necessary libraries for uWSGI
FROM python:3.12
LABEL maintainer="Luke Robertson <lrobertson@lakemac.nsw.gov.au>"

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port on which the app will run
EXPOSE 5000

# uWSGI configuration
# CMD ["uwsgi", \
#     "--ini", "uwsgi.ini"]

# Define the command to run the application
CMD ["python", "main.py"]
