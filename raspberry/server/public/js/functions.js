var config = {
    apiKey: "AIzaSyB8jcGwrAajBJR9pyBNqZ3y7xweeyAdZA8",
    authDomain: "dependentsassistant.firebaseapp.com",
    databaseURL: "https://dependentsassistant.firebaseio.com",
    projectId: "dependentsassistant",
    storageBucket: "dependentsassistant.appspot.com",
    messagingSenderId: "922040032118"
};
firebase.initializeApp(config);
database = firebase.database();


// Gets from the database the info of each sensor
function getSensorsInfo() {
    database.ref('sensors/config').on('value', function (snapshot) {
        sensorsConfig = snapshot.val();
        if (sensorsConfig.temperature) {
            for (const temperatureSensorName in sensorsConfig.temperature) {
                sensorsConfig.temperature[temperatureSensorName];
            }
        }
        if (sensorsConfig.humidity) {

        }
    });
}

// Adds a new temperature sensor to the database
function addTemperatureSensor() {
    console.log('new temperature sensor');
}