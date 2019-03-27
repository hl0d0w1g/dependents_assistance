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
    "storageBucket": "dependentsassistant.appspot.com"
}

# Initialize the firebase app
firebase = pyrebase.initialize_app(firebaseConfig)

# # Get a reference to the auth service
# auth = firebase.auth()

# # Log the user in
# user = auth.sign_in_with_email_and_password(email, password)

# Set a reference to the database
db = firebase.database()

# Use the datasheet GPIO number
GPIO.setmode(GPIO.BCM)


def getSensorPin(name):
    # Returns the RPi pin where the sensor is connected from the database
    pin = db.child('sensors/' + name + '/state/RPiPin').get().val()
    return pin


def checkIfSensorIsAvailable(name, data):
    # Check if the sensor is available
    if data is None:
        db.child('sensors/' + name + '/state/available').set(False)
        return False
    else:
        db.child('sensors/' + name + '/state/available').set(True)
        return True


def getFlameSensorReading():
    # Return the reading of the flame sensor
    if GPIO.input(ky026Pin):
        return True
    else:
        return False


def getGasSensorReading():
    # Return the reading of the gas sensor
    return GPIO.input(mq135Pin)


# Configure the DHT11 temperature and humidity sensor
dht11Pin = getSensorPin('temperature')
dht11Sensor = Adafruit_DHT.DHT11


# Configure the flame sensor
ky026Pin = getSensorPin('flame')
GPIO.setup(ky026Pin, GPIO.IN, GPIO.PUD_UP)

# Configure the gas sensor
mq135Pin = 27
GPIO.setup(mq135Pin, GPIO.IN)

# Update time of the sensors in seconds
updateTime = 60


print("The sensor controller of the Dependents Assistant app is working")
while True:
    # Get the current timestamp
    currentTimestamp = datetime.datetime.fromtimestamp(
        time.time()).strftime('%Y-%m-%d %H:%M:%S')

    # Get the temperature and the humidity from the DHT11 sensor
    humidity, temperature = Adafruit_DHT.read_retry(dht11Sensor, dht11Pin)

    # Get flame detection from the sensor
    flame = getFlameSensorReading()

    # Get gas detection from the sensor
    gas = getGasSensorReading()

    if (checkIfSensorIsAvailable('temperature', temperature)):
        # Set the temperature in the database
        db.child('sensors').child('temperature').child('data').push(
            {'measure': temperature, 'units': '°C', 'time': currentTimestamp})

    if (checkIfSensorIsAvailable('humidity', humidity)):
        # Set the humidity in the database
        db.child('sensors').child('humidity').child('data').push(
            {'measure': humidity, 'units': 'RH', 'time': currentTimestamp})

    if (checkIfSensorIsAvailable('flame', flame)):
        # Set the flame detection in the database
        db.child('sensors').child('flame').child('data').push(
            {'measure': flame, 'time': currentTimestamp})

    # # Set the gas detection in the database
    # db.child('sensors').child('gas').child('data').push(
    #     {'measure': gas, 'units': 'PPM', 'time': currentTimestamp})

    time.sleep(updateTime)
