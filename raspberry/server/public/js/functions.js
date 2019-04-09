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
        this.measure = 0;
    }

    // Adding a method to the constructor
    greet() {
        return `${this.name} says hello.`;
    }
}

var sensors = { temperature: [], humidity: [] };

// Inits the sensors storage variable and display 
function init() {
    for (const sensorCategory in sensors) {
        for (i = 0; i < sensors[sensorCategory].length; i++) {
            const sensor = sensors[sensorCategory][i];
            document.getElementById(sensor.category + sensor.name).remove();
        }
    }
    sensors = { temperature: [], humidity: [] };
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

// Renders all the sensors to the display
function renderSensors() {
    for (const sensorCategory in sensors) {
        for (i = 0; i < sensors[sensorCategory].length; i++) {
            rendersSensorDisplay(sensors[sensorCategory][i]);
        }
    }
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
    sensorMeasureTag.classList.add('m-0');
    sensorMeasureTag.innerText = sensor.measure + setUnits(sensor);
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

// Set a new sensor on the db
function addNewSensor() {
    document.getElementById('addNewSensorForm').style.display = 'none';
    document.getElementById('addSensorButton').style.display = 'flex';
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
