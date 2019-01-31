import time
import pyrebase
import Adafruit_DHT

#Set the configuration of the firebase realtime database
firebaseConfig = {
  "apiKey": "AIzaSyB8jcGwrAajBJR9pyBNqZ3y7xweeyAdZA8",
  "authDomain": "dependentsassistant.firebaseapp.com",
  "databaseURL": "https://dependentsassistant.firebaseio.com",
  "storageBucket": "dependentsassistant.appspot.com"
}

# Initialize the firebase app
firebase = pyrebase.initialize_app(firebaseConfig)

# Set a reference to the database
db = firebase.database()

# Configure the DHT11 temperature and humidity sensor
dht11Sensor = Adafruit_DHT.DHT11
dht11Pin = 4

while True:
	# Get the temperature and the humidity from the DHT11 sensor
	humidity, temperature = Adafruit_DHT.read_retry(dht11Sensor, dht11Pin)
	
	# Post the temperature 
	db.child('temperature').set(temperature)
	
	time.sleep(5)
