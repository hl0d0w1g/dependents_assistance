import time
import datetime
import pyrebase
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

# Configure the DHT11 temperature and humidity sensor
dht11Sensor = Adafruit_DHT.DHT11
dht11Pin = 4

while True:
    # Get the current timestamp
    currentTimestamp = datetime.datetime.fromtimestamp(
        time.time()).strftime('%Y-%m-%d %H:%M:%S')

    # Get the temperature and the humidity from the DHT11 sensor
    humidity, temperature = Adafruit_DHT.read_retry(dht11Sensor, dht11Pin)

    # Set the temperature in the database
    db.child('sensorData').child('temperature').set(
        {'measure': temperature, 'units': '°C', 'time': currentTimestamp})

    # Set the humidity in the database
    db.child('sensorData').child('humidity').set(
        {'measure': humidity, 'units': 'RH', 'time': currentTimestamp})

    time.sleep(60)
