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

// Sensor class
class Sensor {
    constructor(name, category, available, rpiPin, units, upperLimit, lowerLimit) {
        this.name = name;
        this.category = category;
        this.available = available;
        this.rpiPin = rpiPin;
        this.units = units;
        this.upperLimit = upperLimit;
        this.lowerLimit = lowerLimit;
    }
}

var sensors = { temperature: [], humidity: [], presence: [], fire: [] };

// Gets the notifications email
database.ref('user/notificationsEmail').on('value', function (snapshot) {
    const notificationsEmail = snapshot.val();
    document.getElementById('inputNotificationsEmail').value = notificationsEmail;

});

// Get the data on a measure that has changed
database.ref('sensors/data/lastMeasurement').on('child_changed', function (snapshot) {
    const sensorCategory = snapshot.key;
    const sensorName = Object.keys(snapshot.val())[0];
    const sensorData = snapshot.val()[sensorName];
    document.getElementById(sensorCategory + sensorName + 'Measure').innerText = sensorData.measure + sensorData.units;
});

// Inits the sensors storage variable and display 
function init() {
    for (const sensorCategory in sensors) {
        for (i = 0; i < sensors[sensorCategory].length; i++) {
            const sensor = sensors[sensorCategory][i];
            document.getElementById(sensor.category + sensor.name).remove();
        }
    }
    sensors = { temperature: [], humidity: [], presence: [], fire: [] };
}

// Gets from the database the info of each sensor
function getSensorsInfo() {
    database.ref('sensors/config').on('value', function (snapshot) {
        init();
        sensorsConfig = snapshot.val();
        if (sensorsConfig.temperature) {
            hideNoSensorMessage('temperature');
            for (const temperatureSensorName in sensorsConfig.temperature) {
                const newSensor = sensorsConfig.temperature[temperatureSensorName];
                sensors.temperature.push(new Sensor(
                    newSensor.name,
                    'temperature',
                    newSensor.available,
                    newSensor.RPiPin,
                    newSensor.units,
                    newSensor.upperLimit,
                    newSensor.lowerLimit));
            }
        }
        if (sensorsConfig.humidity) {
            hideNoSensorMessage('humidity');
            for (const humiditySensorName in sensorsConfig.humidity) {
                const newSensor = sensorsConfig.humidity[humiditySensorName];
                sensors.humidity.push(new Sensor(
                    newSensor.name,
                    'humidity',
                    newSensor.available,
                    newSensor.RPiPin,
                    newSensor.units,
                    newSensor.upperLimit,
                    newSensor.lowerLimit));
            }
        }
        if (sensorsConfig.presence) {
            hideNoSensorMessage('presence');
            for (const presenceSensorName in sensorsConfig.presence) {
                const newSensor = sensorsConfig.presence[presenceSensorName];
                sensors.presence.push(new Sensor(
                    newSensor.name,
                    'presence',
                    newSensor.available,
                    newSensor.RPiPin,
                    newSensor.units,
                    newSensor.upperLimit,
                    newSensor.lowerLimit));
            }
        }
        if (sensorsConfig.fire) {
            hideNoSensorMessage('fire');
            for (const fireSensorName in sensorsConfig.fire) {
                const newSensor = sensorsConfig.fire[fireSensorName];
                sensors.fire.push(new Sensor(
                    newSensor.name,
                    'fire',
                    newSensor.available,
                    newSensor.RPiPin,
                    newSensor.units,
                    newSensor.upperLimit,
                    newSensor.lowerLimit));
            }
        }
        renderSensors();
    });
}

// Shows the no sensor message
function showNoSensorMessage(sensorCategory) {
    document.getElementById(sensorCategory + 'NoSensorsMessage').style.display = 'flex';
}

// Hides the no sensor message
function hideNoSensorMessage(sensorCategory) {
    document.getElementById(sensorCategory + 'NoSensorsMessage').style.display = 'none';
}

// // Disables the RPI busy pins in the dropdown menu
// function disableBusyRPiPins() {
//     for (i = 2; i < 28; i++) {
//         document.getElementById('rpiPinOption' + i).disabled = false;
//     }
//     for (const sensorCategory in sensors) {
//         for (i = 0; i < sensors[sensorCategory].length; i++) {
//             document.getElementById('rpiPinOption' + sensors[sensorCategory][i].rpiPin).disabled = true;
//         }
//     }
// }

// Renders all the sensors to the display
function renderSensors() {
    for (const sensorCategory in sensors) {
        for (i = 0; i < sensors[sensorCategory].length; i++) {
            rendersSensorDisplay(sensors[sensorCategory][i]);
        }
    }
    getLastSensorsMeasurements();
}

// Gets the last sensors measurements
function getLastSensorsMeasurements() {
    database.ref('sensors/data/lastMeasurement').once('value', function (snapshot) {
        const sensorsData = snapshot.val();
        for (const sensorCategory in sensorsData) {
            for (const sensorName in sensorsData[sensorCategory]) {
                const sensorData = sensorsData[sensorCategory][sensorName];
                document.getElementById(sensorCategory + sensorName + 'Measure').innerText = sensorData.measure + sensorData.units;
            }
        }
    });
}

// Generates the element to display the sensor info
function rendersSensorDisplay(sensor) {
    const row = document.createElement('DIV');
    row.setAttribute('id', sensor.category + sensor.name);
    row.classList.add('row', 'align-items-center', 'py-2');

    const sensorNameCol = document.createElement('DIV');
    sensorNameCol.classList.add('col');
    row.appendChild(sensorNameCol);

    const sensorNameTag = document.createElement('H4');
    sensorNameTag.classList.add('m-0');
    sensorNameTag.innerText = sensor.name;
    sensorNameCol.appendChild(sensorNameTag);

    const sensorMeasureCol = document.createElement('DIV');
    sensorMeasureCol.classList.add('col', 'text-muted');
    row.appendChild(sensorMeasureCol);

    const sensorMeasureTag = document.createElement('H5');
    sensorMeasureTag.setAttribute('id', sensor.category + sensor.name + 'Measure');
    sensorMeasureTag.classList.add('m-0');
    sensorMeasureTag.innerText = 'not found';
    sensorMeasureCol.appendChild(sensorMeasureTag);

    const editButtonCol = document.createElement('DIV');
    editButtonCol.classList.add('col-auto', 'pr-0');
    row.appendChild(editButtonCol);

    // const buttonEdit = document.createElement('BUTTON');
    // buttonEdit.classList.add('btn', 'btn-link', 'btn-lg');
    // editButtonCol.appendChild(buttonEdit);

    // const editIcon = document.createElement('I');
    // editIcon.classList.add('fas', 'fa-edit');
    // buttonEdit.addEventListener('click', function () { editSensor(sensor) });
    // buttonEdit.appendChild(editIcon);

    const deleteButtonCol = document.createElement('DIV');
    deleteButtonCol.classList.add('col-auto', 'pl-0');
    row.appendChild(deleteButtonCol);

    const buttonDelete = document.createElement('BUTTON');
    buttonDelete.classList.add('btn', 'btn-link', 'btn-lg');
    deleteButtonCol.appendChild(buttonDelete);

    const deleteIcon = document.createElement('I');
    deleteIcon.classList.add('fas', 'fa-trash-alt');
    buttonDelete.addEventListener('click', function () { deleteSensor(sensor) });
    buttonDelete.appendChild(deleteIcon);

    document.getElementById(sensor.category + 'SensorsList').appendChild(row);
}

// Set the units of each sensor
function setUnits(sensor) {
    switch (sensor.category) {
        case 'temperature':
            return sensor.units;

        case 'humidity':
            return setHumidityUnits(sensor.units);

        case 'presence':
            return '';

        case 'fire':
            return '';

        default:
            return '';
    }

}

// Set a representation of the humidity units
function setHumidityUnits(units) {
    switch (units) {
        case 'AH':
            return 'g/m3';

        case 'SH':
            return 'g/kg';

        case 'RH':
            return '%';

        default:
            return '';
    }
}

// Adds a new sensor to the database
function viewAddSensorForm() {
    document.getElementById('addSensorButton').style.display = 'none';
    document.getElementById('addNewSensorForm').style.display = 'flex';
}

// Cancel the new sensor addition
function cancelAddNewSensor() {
    document.getElementById('addNewSensorForm').style.display = 'none';
    document.getElementById('addSensorButton').style.display = 'flex';
}

// Saves the notifications email set by the user
function saveNotificationsEmail() {
    const newNotificationsEmail = document.getElementById('inputNotificationsEmail').value;
    database.ref('user/notificationsEmail').set(newNotificationsEmail);
}

// Set a new sensor on the db
function addNewSensor() {
    const sensorName = document.getElementById('inputSensorLocation').value;
    const sensorCategory = document.getElementById('inputSensorType').value;
    const sensorLowerLimit = document.getElementById('inputSensorLowerLimit').value;
    const sensorUpperLimit = document.getElementById('inputSensorUpperLimit').value;
    const sensorRPiPin = document.getElementById('inputSensorRPiPin').value;
    const sensorUnits = setNewSensorUnits(sensorCategory);
    database.ref('sensors/config/' + sensorCategory + '/' + sensorName).set({
        name: sensorName,
        RPiPin: parseInt(sensorRPiPin),
        available: false,
        units: sensorUnits,
        lowerLimit: parseInt(sensorLowerLimit),
        upperLimit: parseInt(sensorUpperLimit)
    }, function () {
        document.getElementById('addNewSensorForm').style.display = 'none';
        document.getElementById('addSensorButton').style.display = 'flex';
    });
}

// Edits the properties of the specified sensor
function editSensor(sensor) {

}

// Deletes one sensor on the database
function deleteSensor(sensor) {
    database.ref('sensors/config/' + sensor.category + '/' + sensor.name).remove(function () {
        const index = sensors[sensor.category].indexOf(sensor);
        if (index > -1) {
            sensors[sensor.category].splice(index, 1);
        }

        document.getElementById(sensor.category + sensor.name).remove();

        if (!sensors[sensor.category].length) {
            showNoSensorMessage(sensor.category);
        }
    });
}

// Sets the default units for the new sensors
function setNewSensorUnits(sensorCategory) {
    switch (sensorCategory) {
        case 'temperature':
            return 'ºC';

        case 'humidity':
            return 'RH';

        case 'presence':
            return '';

        case 'fire':
            return '';

        default:
            break;
    }
}