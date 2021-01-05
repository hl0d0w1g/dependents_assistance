#!/bin/bash
echo 'Installing node server'
npm install
npm audit fix

echo 'Installing sensors contoller'
bash sensors/install.sh

echo 'Starting system operation'
bash start.sh