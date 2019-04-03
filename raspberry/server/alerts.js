const startConversation = require('./assistant.js');
const sendTextInput = require('./assistant').sendTextInput;

var admin = require('firebase-admin');
var serviceAccount = require('./configurations/credentials/serviceAccountCredentials.json');
const projectURL = 'https://dependentsassistant.firebaseio.com';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: projectURL,
});
var firebaseDB = admin.database();

const broadcast = 'broadcast ';

// Stores all the sensors configurations
let sensorsConfig;

// Checks the sensors configuration
firebaseDB.ref('sensors/config').on('value', function (snapshot) {
    sensorsConfig = snapshot.val();
});

// Checks if the temperature is in the correct range of values on each sensor
firebaseDB.ref('sensors/data/lastMeasurement/temperature').on('child_changed', function (snapshot) {
    const temperatureSensorName = snapshot.key;
    const temperatureSensorData = snapshot.val();
    // console.log('Temperature data: ', temperatureSensorData, '\n');
    if (temperatureSensorData.measure > sensorsConfig['temperature'][temperatureSensorName].upperLimit) {
        console.log('ALERT: High temperature on ' + temperatureSensorName + '\n');
        sendTextInput(broadcast + 'La temperatura en ' + temperatureSensorName + ' es demasiado alta.');
    } else if (temperatureSensorData.measure < sensorsConfig['temperature'][temperatureSensorName].lowerLimit) {
        console.log('ALERT: Low temperature\n');
        sendTextInput(broadcast + 'La temperatura en ' + temperatureSensorName + ' es demasiado baja.');
    }
});

// Checks if the humidity is in the correct range of values on each sensor
firebaseDB.ref('sensors/data/lastMeasurement/humidity').on('child_changed', function (snapshot) {
    const humiditySensorName = snapshot.key;
    const humiditySensorData = snapshot.val();
    // console.log('Humidity data: ', humiditySensorData, '\n');
    if (humiditySensorData.measure > sensorsConfig['humidity'][humiditySensorName].upperLimit) {
        console.log('ALERT: High humidity on ' + humiditySensorName + '\n');
        sendTextInput(broadcast + 'La humedad en ' + humiditySensorName + ' es demasiado alta.');
    } else if (humiditySensorData.measure < sensorsConfig['humidity'][humiditySensorName].lowerLimit) {
        console.log('ALERT: Low humidity\n');
        sendTextInput(broadcast + 'La humedad en ' + humiditySensorName + ' es demasiado baja.');
    }
});