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

var sensorsDisplay = {}

// Gets from the database the info of each sensor
function getSensorsInfo() {
    database.ref('sensors/config').on('value', function (snapshot) {
        sensorsConfig = snapshot.val();
        if (sensorsConfig.temperature) {
            for (const temperatureSensorName in sensorsConfig.temperature) {
                sensorsConfig.temperature[temperatureSensorName];
            }
            hideNoSensorMessage('Temperature');
        }
        if (sensorsConfig.humidity) {
            hideNoSensorMessage('Humidity');
        }
    });
}

// Adds a new sensor to the database
function addSensor() {

}

// Edits the properties of the specified sensor
function editSensor(sensor) {

}

// Deletes one sensor on the database
function deleteSensor(sensor) {

}

// Shows the no sensor message
function showNoSensorMessage(sensorCategory) {
    document.getElementById('no' + sensorCategory + 'SensorsMessage').style.display = 'flex';
}

// Hides the no sensor message
function hideNoSensorMessage(sensorCategory) {
    document.getElementById('no' + sensorCategory + 'SensorsMessage').style.display = 'none';
}

// Generates the element to display the sensor info
function rendersSensorDisplay() {
    var row = document.createElement('DIV');
    row.classList.add('row', 'align-items-center');

    var sensorNameCol = document.createElement('DIV');
    sensorNameCol.classList.add('col');
    row.appendChild(sensorNameCol);

    var sensorNameTag = document.createElement('H4');
    sensorNameTag.classList.add('m-0');
    sensorNameTag.innerText = 'salon';
    sensorNameCol.appendChild(sensorNameTag);

    var sensorMeasureCol = document.createElement('DIV');
    sensorMeasureCol.classList.add('col', 'text-muted');
    row.appendChild(sensorMeasureCol);

    var sensorMeasureTag = document.createElement('H5');
    sensorMeasureTag.classList.add('m-0');
    sensorMeasureTag.innerText = '0ºC';
    sensorMeasureCol.appendChild(sensorMeasureTag);

    var editButtonCol = document.createElement('DIV');
    editButtonCol.classList.add('col-auto', 'pr-0');
    row.appendChild(editButtonCol);

    var buttonEdit = document.createElement('BUTTON');
    buttonEdit.classList.add('btn', 'btn-link', 'btn-lg');
    editButtonCol.appendChild(buttonEdit);

    var editIcon = document.createElement('I');
    editIcon.classList.add('fas', 'fa-edit');
    buttonEdit.appendChild(editIcon);

    var deleteButtonCol = document.createElement('DIV');
    deleteButtonCol.classList.add('col-auto', 'pl-0');
    row.appendChild(deleteButtonCol);

    var buttonDelete = document.createElement('BUTTON');
    buttonDelete.classList.add('btn', 'btn-link', 'btn-lg');
    deleteButtonCol.appendChild(buttonDelete);

    var deleteIcon = document.createElement('I');
    deleteIcon.classList.add('fas', 'fa-trash-alt');
    buttonDelete.appendChild(deleteIcon);

    document.getElementById('temperatureSensorsList').appendChild(row);
}