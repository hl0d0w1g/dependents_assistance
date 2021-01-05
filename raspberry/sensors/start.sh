#!/bin/bash
# Copy credentials json into the virtual environment
cp -r credentials/ venv
# Activate the virtual environment
source venv/bin/activate
# Run python file
python3 sensor_control.py