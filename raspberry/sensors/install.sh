#!/bin/bash
echo 'Creating python virtual environment'
# Create the virtual envionment
python3 -m venv venv
# Activate the virtual environment
source venv/bin/activate
# Install the python requirements
echo 'Installing python requirements'
pip install -r requirements.txt
# Exit virtual environment
deactivate
# Install the software that allow to add libraries
sudo apt-get install build-essential python-dev
# Install libraries
mkdir libraries
cd libraries
git clone https://github.com/adafruit/Adafruit_Python_DHT.git
cd ..