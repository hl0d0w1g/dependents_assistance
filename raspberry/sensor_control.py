import pyrebase
import serial
import time

firebaseConfig = {
  "apiKey": "AIzaSyB8jcGwrAajBJR9pyBNqZ3y7xweeyAdZA8",
  "authDomain": "dependentsassistant.firebaseapp.com",
  "databaseURL": "https://dependentsassistant.firebaseio.com",
  "storageBucket": "dependentsassistant.appspot.com"
}

firebase = pyrebase.initialize_app(firebaseConfig)

db = firebase.database()

tv_onp = False
tv_on = False

while True:
	if tv_on != tv_onp:
		tv_onp = tv_on
		print(tv_on)

	tv_on = db.child("tv/on").get().val()
	#print(tv_on)
