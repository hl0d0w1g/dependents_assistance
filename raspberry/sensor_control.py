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

# Configure the DHT11 temperature and humidity sensor
dht11Pin = 4
dht11Sensor = Adafruit_DHT.DHT11

# Configure the flame sensor
ky026Pin = 17
GPIO.setup(ky026Pin, GPIO.IN, GPIO.PUD_UP)

# Configure the gas sensor
mq135Pin = 27
GPIO.setup(mq135Pin, GPIO.IN)

# Update time of the sensors in seconds
updateTime = 60


def getFlameSensorReading():
    # Return the reading of the flame sensor
    if GPIO.input(ky026Pin):
        return True
    else:
        return False


def getGasSensorReading():
    # Return the reading of the gas sensor
    return GPIO.input(mq135Pin)


print("Init dependents assistant sensor control")
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

    # Set the temperature in the database
    db.child('sensorData').child('temperature').push(
        {'measure': temperature, 'units': '°C', 'time': currentTimestamp})

    # Set the humidity in the database
    db.child('sensorData').child('humidity').push(
        {'measure': humidity, 'units': 'RH', 'time': currentTimestamp})

    # Set the flame detection in the database
    db.child('sensorData').child('flame').push(
        {'measure': flame, 'time': currentTimestamp})

    # # Set the gas detection in the database
    # db.child('sensorData').child('gas').push(
    #     {'measure': gas, 'units': 'PPM', 'time': currentTimestamp})

    time.sleep(updateTime)
