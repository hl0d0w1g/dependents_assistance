#!./venv/bin/python
# -*- coding: utf-8 -*-

import time
import datetime
import sys
import datetime
import pyrebase
import RPi.GPIO as GPIO
import Adafruit_DHT
import numpy as np
from sklearn.ensemble import IsolationForest

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

# Update time of the sensors in seconds
updateTime = 60*30


class Sensor:
    # Represents a sensor connected to the RPi
    category = ''
    name = ''
    units = ''
    pin = 0
    available = False
    sensor = ''
    lastMeasure = 0
    interrupt = None
    mlModel = None
    outlierMeasure = False

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

    def setSensorInterrupt(self):
        self.interrupt = GPIO.add_event_detect(
            self.pin, GPIO.RISING, callback=self.event_callback)

    def setSensorMeasure(self, hour, measure):
        newData = np.array([[hour, measure]])
        self.outlierMeasure = True if (
            self.mlModel.predict(newData)[0] == -1) else False
        self.lastMeasure = measure

    def setMlModel(self, model):
        self.mlModel = model

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

    def isOutlierMeasure(self):
        return self.outlierMeasure

    def event_callback(self, channel):
        updateSensorMeasure(self)


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

        elif (sensor.getSensorCategory() in ('presence', 'fire')):
            sensor.setSensor(GPIO.setup(sensor.getSensorPin(), GPIO.IN))
            sensor.setSensorInterrupt()


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


def calcSensorsAverage(sensor):
    # Calc the average of the sensors with the same units
    measuresSum = 0
    sensorsNumber = 0
    for s in sensors:
        if s.category == sensor.category:
            measuresSum += s.lastMeasure
            sensorsNumber += 1
    return measuresSum / sensorsNumber


def updateDataBase(sensor):
    # Updates the database with the sensors data
    if (checkIfSensorIsAvailable(sensor)):
        # Push the sensor measure in the database
        db.child('sensors/data/historyMeasurement/' + sensor.getSensorCategory() + '/' + sensor.getSensorName()).push(
            {'measure': sensor.getSensorMeasure(), 'outlier': sensor.isOutlierMeasure(), 'units': sensor.getSensorUnits(), 'time': getCurrentTimestamp()})
        # Set the last measured value
        db.child('sensors/data/lastMeasurement/' + sensor.getSensorCategory() + '/' + sensor.getSensorName()).set(
            {'measure': sensor.getSensorMeasure(), 'outlier': sensor.isOutlierMeasure(), 'units': sensor.getSensorUnits(), 'time': getCurrentTimestamp()})
        # Set the average measured value
        if (sensor.getSensorCategory() in ('temperature', 'humidity')):
            db.child('sensors/data/lastMeasurement/' + sensor.getSensorCategory() + '/average').set(
                {'measure': calcSensorsAverage(sensor), 'units': sensor.getSensorUnits(), 'time': getCurrentTimestamp()})


def updateSensorMeasure(sensor):
    # Updates the sensor measure
    if (sensor.getSensorCategory() in ('temperature')):
        _, measure = Adafruit_DHT.read_retry(
            sensor.getSensor(), sensor.getSensorPin())
        sensor.setSensorMeasure(getCurrentTime().hour, measure)

    elif (sensor.getSensorCategory() in ('humidity')):
        measure, _ = Adafruit_DHT.read_retry(
            sensor.getSensor(), sensor.getSensorPin())
        sensor.setSensorMeasure(getCurrentTime().hour, measure)

    elif (sensor.getSensorCategory() in ('fire', 'presence')):
        sensor.setSensorMeasure(getCurrentTime().hour,
                                GPIO.input(sensor.getSensorPin()))

    updateDataBase(sensor)


def getCurrentTime():
    # Returns the current time
    return datetime.datetime.today()


def getCurrentTimestamp():
    # Get the current timestamp
    return datetime.datetime.fromtimestamp(
        time.time()).strftime('%Y-%m-%d %H:%M:%S')


def getLastSensorMeasures(sensor):
    # Download the last sensor measures
    before24Hour = getCurrentTime() - datetime.timedelta(days=1)
    data = []
    sensorHistoryMeasurement = db
    .child('sensors/data/historyMeasurement/' + sensor.getSensorCategory() + '/' + sensor.getSensorName())
    .order_by_child('time')
    .start_at(before24Hour)
    .get()
    .val()
    for key, value in sensorHistoryMeasurement.items():
        measure = value.measure
        time = datetime.strptime(value.time, '%Y-%m-%d %H:%M:%S').hour
        newData = [[time, measure]]
        #newData = np.array([[time, measure]])
        #data = np.append(data, newData)
        data.append(newData)

    data = np.array(data)
    print(data)
    return data


setUpSensors()
print("The sensor controller of the Dependents Assistant app is working")
while True:
    try:
        # Update ml model training once a day
        if getCurrentTime().hour == 2:
            for sensor in sensors:
                if not (sensor.getSensorCategory() in ('fire')):
                    trainData = getLastSensorMeasures(sensor)
                    mlModel = IsolationForest(
                        behaviour='new', contamination='auto')
                    mlModel.fit(trainData)
                    sensor.setMlModel(mlModel)

        # Checks all sensors
        for sensor in sensors:
            updateSensorMeasure(sensor)

        time.sleep(updateTime)

    except KeyboardInterrupt:
        print("The sensor controller of the Dependents Assistant app is stopping")
        GPIO.cleanup()
        sys.exit()
