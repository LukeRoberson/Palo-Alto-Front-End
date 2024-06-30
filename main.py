import flask
from flask import Flask, request
import platform
from flask import render_template

app = Flask(__name__)


@app.route('/')
def index():
    flask_version = flask.__version__
    ip_address = request.remote_addr
    os_version = platform.platform()

    return render_template(
        'index.html',
        flask_version=flask_version,
        ip_address=ip_address,
        os_version=os_version
    )

if __name__ == '__main__':
    app.run()
