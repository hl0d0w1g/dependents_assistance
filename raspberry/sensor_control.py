import pyrebase
import serial
import time

firebaseConfig = {
  "apiKey": "AIzaSyAeAvqEBFqddnmKbVDmTDtjKAdKzGSzZm8",
  "authDomain": "home-automation-42f17.firebaseapp.com",
  "databaseURL": "https://home-automation-42f17.firebaseio.com",
  "storageBucket": "home-automation-42f17.appspot.com"
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
