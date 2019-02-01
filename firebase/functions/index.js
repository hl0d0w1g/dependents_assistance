// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Get a reference to the database service
const database = admin.database();

'use strict';

const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set('Check House Temperature', checkHouseTemperature);
    intentMap.set('Check House Humidity', checkHouseHumidity);
    agent.handleRequest(intentMap);

    // Check the house temperature sensor on the database
    function checkHouseTemperature(agent) {
        return database.ref('sensorData/temperature').once('value', (snapshot) => {
            agent.add('La temperatura es de ' + snapshot.val().measure + ' ' + snapshot.val().units);
        });
    }

    // Check the house humidity sensor on the database
    function checkHouseHumidity(agent) {
        return database.ref('sensorData/humidity').once('value', (snapshot) => {
            agent.add(setHumidityExpresion(snapshot.val().measure, snapshot.val().units));
        });
    }

    // // Uncomment and edit to make your own intent handler
    // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function yourFunctionHandler(agent) {
    //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
    //   agent.add(new Card({
    //       title: `Title: this is a card title`,
    //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
    //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
    //       buttonText: 'This is a button',
    //       buttonUrl: 'https://assistant.google.com/'
    //     })
    //   );
    //   agent.add(new Suggestion(`Quick Reply`));
    //   agent.add(new Suggestion(`Suggestion`));
    //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
    // }

    // // Uncomment and edit to make your own Google Assistant intent handler
    // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function googleAssistantHandler(agent) {
    //   let conv = agent.conv(); // Get Actions on Google library conv instance
    //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
    //   agent.add(conv); // Add Actions on Google library responses to your agent's response
    // }
    // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
    // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

});

// Converts the symbol of the units into the expression of the language
function setHumidityExpresion(measure, units) {
    switch (units) {
        case 'AH':
            return 'La humedad absoluta es de ' + measure + ' gramos por metro cúbico';

        case 'SH':
            return 'La humedad especifica es de ' + measure + ' gramos por kilo';

        case 'RH':
            return 'La humedad relativa es del ' + measure + ' %';

        default:
            return '';
    }
}