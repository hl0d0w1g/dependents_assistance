#!/bin/bash
echo 'Installing node server'
npm install
npm audit fix

echo 'Installing sensors contoller'
cd sensors
bash install.sh

echo 'Starting system operation'
bash start.sh