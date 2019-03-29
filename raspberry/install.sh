#!/bin/bash
echo 'Installing node server'
npm install

echo 'Installing sensors contoller'
./sensors/install.sh

echo 'Starting system operation'
./start.sh