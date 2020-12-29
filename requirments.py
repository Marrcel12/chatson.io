requriments=[
"cryptography==3.3.1",
"Flask==1.1.2",
"psycopg2==2.8.5",
"Jinja2==2.11.2",
"Werkzeug==1.0.1",
]

import subprocess
import sys

def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])
for requriment in requriments:
    install(requriment)