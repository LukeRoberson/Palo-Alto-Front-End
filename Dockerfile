# Use the official Python image from the Docker Hub
# Cannot use 'slim' and 'alpine' images as they do not have the necessary libraries for uWSGI
FROM python:3.12
LABEL maintainer="Luke Robertson <lrobertson@lakemac.nsw.gov.au>"

# Create non-root user with no password
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Change ownership of the application code to the non-root user
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# uWSGI configuration
CMD ["uwsgi", \
    "--ini", "uwsgi.ini"]
