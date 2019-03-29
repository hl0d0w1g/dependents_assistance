#!/bin/bash
# Start node server
npm run start &
# Start python sensors controller
cd sensors
bash start.sh &

wait