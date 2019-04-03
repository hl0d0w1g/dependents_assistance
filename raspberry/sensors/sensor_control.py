#!./venv/bin/python
# -*- coding: utf-8 -*-

import time
import datetime
import pyrebase
import RPi.GPIO as GPIO
import Adafruit_DHT

# Set the configuration of the firebase realtime database
firebaseConfig = {
    "apiKey": "AIzaSyB8jcGwrAajBJR9pyBNqZ3y7xweeyAdZA8",
    "authDomain": "dependentsassistant.firebaseapp.com",
    "databaseURL": "https://dependentsassistant.firebaseio.com",
    "storageBucket": "dependentsassistant.appspot.com",
    "serviceAccount": "./credentials/serviceAccountCredentials.json"
}
# Initialize the firebase app
firebase = pyrebase.initialize_app(firebaseConfig)
# Set a reference to the database
db = firebase.database()

# Use the datasheet GPIO number
GPIO.setmode(GPIO.BCM)

# Storages the sensors info
sensors = []


class Sensor:
    # Represents a sensor connected to the RPi
    category = ''
    name = ''
    units = ''
    pin = 0
    available = False
    sensor = ''
    lastMeasure = 0

    def __init__(self, category, name, units, pin):
        self.category = category
        self.name = name
        self.units = units
        self.pin = pin
        self.available = True

    def setSensorAvailability(self, available):
        self.available = available

    def setSensor(self, sensor):
        self.sensor = sensor

    def setSensorMeasure(self, measure):
        self.lastMeasure = measure

    def getSensorCategory(self):
        return self.category

    def getSensorName(self):
        return self.name

    def getSensorUnits(self):
        return self.units

    def getSensorPin(self):
        return self.pin

    def getSensorAvailability(self):
        return self.available

    def getSensor(self):
        return self.sensor

    def getSensorMeasure(self):
        return self.lastMeasure


def setUpSensors():
    # Set up and configure the sensors from the db
    sensorsConfigurations = db.child('sensors/config').get().val()
    for sensorCategory in sensorsConfigurations:
        for sensor in sensorsConfigurations[sensorCategory]:
            sensor = sensorsConfigurations[sensorCategory][sensor]
            sensors.append(Sensor(sensorCategory,
                                  sensor['name'],
                                  sensor['units'],
                                  sensor['RPiPin']))
    for sensor in sensors:
        if (sensor.getSensorCategory() in ('temperature', 'humidity')):
            sensor.setSensor(Adafruit_DHT.DHT11)


def updateSensorMeasure(sensor):
    # Updates the sensor measure
    if (sensor.getSensorCategory() in ('temperature')):
        _, measure = Adafruit_DHT.read_retry(
            sensor.getSensor(), sensor.getSensorPin())

    elif (sensor.getSensorCategory() in ('humidity')):
        measure, _ = Adafruit_DHT.read_retry(
            sensor.getSensor(), sensor.getSensorPin())

    sensor.setSensorMeasure(measure)


def checkIfSensorIsAvailable(sensor):
    # Check if the sensor is available
    if sensor.getSensorMeasure() is None:
        sensor.setSensorAvailability(False)
        db.child('sensors/config/' + sensor.getSensorCategory() + '/' +
                 sensor.getSensorName() + '/available').set(False)
        return False

    else:
        sensor.setSensorAvailability(True)
        db.child('sensors/config/' + sensor.getSensorCategory() + '/' +
                 sensor.getSensorName() + '/available').set(True)
        return True


# Update time of the sensors in seconds
updateTime = 60

setUpSensors()
print("The sensor controller of the Dependents Assistant app is working")
while True:
    # Get the current timestamp
    currentTimestamp = datetime.datetime.fromtimestamp(
        time.time()).strftime('%Y-%m-%d %H:%M:%S')

    # Checks all sensors
    for sensor in sensors:
        updateSensorMeasure(sensor)
        if (checkIfSensorIsAvailable(sensor)):
            # Push the sensor measure in the database
            db.child('sensors/data/historyMeasurement/' + sensor.getSensorCategory() + '/' + sensor.getSensorName()).push(
                {'measure': sensor.getSensorMeasure(), 'units': sensor.getSensorUnits(), 'time': currentTimestamp})
            # Set the last measured value
            db.child('sensors/data/lastMeasurement/' + sensor.getSensorCategory() + '/' + sensor.getSensorName()).set(
                {'measure': sensor.getSensorMeasure(), 'units': sensor.getSensorUnits(), 'time': currentTimestamp})

    time.sleep(updateTime)
