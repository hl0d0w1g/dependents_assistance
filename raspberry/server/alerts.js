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

let temperatureSensorAvailable;

// Checks if the temperature sensor is available
firebaseDB.ref('sensors/temperature/state').on('value', function (snapshot) {
    temperatureSensorAvailable = snapshot.val().available;
    console.log('Temperature sensor available: ', temperatureSensorAvailable, '\n');
})

// Checks if the temperature is in the correct range of values
firebaseDB.ref('sensors/temperature/data').orderByKey().limitToLast(1).on('value', function (snapshot) {
    if (temperatureSensorAvailable) {
        let temperatureData = snapshot.val()[Object.keys(snapshot.val())[0]];
        // console.log('Temperature data: ', temperatureData, '\n');
        if (temperatureData.measure > 25) {
            console.log('ALERT: High temperature\n');
            sendTextInput(broadcast + 'La temperatura es demasiado alta.');
        } else if (temperatureData.measure < 10) {
            console.log('ALERT: Low temperature\n');
            sendTextInput(broadcast + 'La temperatura es demasiado baja.');
        }
    }
});