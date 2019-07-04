var admin = require('firebase-admin');
var nodemailer = require('nodemailer');

const startConversation = require('./assistant.js');
const sendTextInput = require('./assistant').sendTextInput;

const projectURL = 'https://dependentsassistant.firebaseio.com';
var firebaseAccount = require('./configurations/credentials/firebaseAccountCredentials.json');

var emailAccount = require('./configurations/credentials/emailAccountCredentials.json');

admin.initializeApp({
    credential: admin.credential.cert(firebaseAccount),
    databaseURL: projectURL,
});
var firebaseDB = admin.database();
const broadcast = 'broadcast ';

// Stores all the sensors configurations
let sensorsConfig;

var mailer = nodemailer.createTransport(emailAccount);
let destinationEmail = '';

// Checks notifications email
firebaseDB.ref('user/notificationsEmail').on('value', function (snapshot) {
    destinationEmail = snapshot.val();
});

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
        sendEmail('ALERTA de Temperatura', 'La temperatura en ' + temperatureSensorName + ' es demasiado alta.');
    } else if (temperatureSensorData.measure < sensorsConfig['temperature'][temperatureSensorName].lowerLimit) {
        console.log('ALERT: Low temperature\n');
        sendTextInput(broadcast + 'La temperatura en ' + temperatureSensorName + ' es demasiado baja.');
        sendEmail('ALERTA de Temperatura', 'La temperatura en ' + temperatureSensorName + ' es demasiado baja.');
    } else if (temperatureSensorData.outlier == true) {
        console.log('ALERT: Outlier temperature measure\n');
        sendTextInput(broadcast + 'La temperatura en ' + temperatureSensorName + ' es anomala.');
        sendEmail('ALERTA de Temperatura', 'La temperatura en ' + temperatureSensorName + ' es anomala. Valor: ' + temperatureSensorData.measure);
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
        sendEmail('ALERTA de Humedad', 'La humedad en ' + humiditySensorName + ' es demasiado alta.');
    } else if (humiditySensorData.measure < sensorsConfig['humidity'][humiditySensorName].lowerLimit) {
        console.log('ALERT: Low humidity\n');
        sendTextInput(broadcast + 'La humedad en ' + humiditySensorName + ' es demasiado baja.');
        sendEmail('ALERTA de Humedad', 'La humedad en ' + humiditySensorName + ' es demasiado baja.');
    } else if (humiditySensorData.outlier == true) {
        console.log('ALERT: Outlier humidity measure\n');
        sendTextInput(broadcast + 'La humedad en ' + humiditySensorName + ' es anomala.');
        sendEmail('ALERTA de Humedad', 'La Humedad en ' + humiditySensorName + ' es anomala. Valor: ' + humiditySensorData.measure);
    }
});

// Checks if the fire sensor is not active
firebaseDB.ref('sensors/data/lastMeasurement/fire').on('child_changed', function (snapshot) {
    const fireSensorName = snapshot.key;
    const fireSensorData = snapshot.val();
    // console.log('Fire data: ', fireSensorData, '\n');
    if (fireSensorData.measure === 1) {
        console.log('ALERT: Fire on ' + fireSensorName + '\n');
        sendTextInput(broadcast + 'Se ha detectado fuego en ' + fireSensorName + ', por favor compruebelo.');
        sendEmail('ALERTA de Fuego', 'Se ha detectado fuego en ' + fireSensorName + ', por favor compruebelo.');
    }
});

// Checks is the user needs help
firebaseDB.ref('user/emergency').on('value', function (snapshot) {
    emergency = snapshot.val();
    if (emergency['necessary']) {
        console.log('ALERT: The user notified an emergency \n');
        sendTextInput(broadcast + 'Ya he avisado a tu contacto de emergencia.');
        sendEmail('ALERTA emergencia', 'El usuario a solicitado ayuda por el siguiente motivo: ' + emergency['reason']);
        firebaseDB.ref('user/emergency').set({ 'necessary': false, 'reason': '' });
    }
});

// Sends an email when a alert is triggered
function sendEmail(msgSubject, msgText) {
    const mailOptions = {
        from: emailAccount.auth.user,
        to: destinationEmail,
        subject: msgSubject,
        text: msgText
    };
    mailer.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}