const express = require('express');
const routes = express.Router();

const sendTextInput = require('./assistant').sendTextInput;
const sendAudioInput = require('./assistant').sendAudioInput;


routes.post('/assistant', function (req, res) {
  let command = req.body.command;
  let broadcast = req.body.broadcast;
  const user = req.body.user;
  const converse = req.body.converse;

  //if no command passed, return 400
  if (!command) return res.status(400).json({ success: false, error: "No command given" })

  // if broadcast is true, pass as broadcast command
  if (broadcast) command = `broadcast ${command}`;

  sendTextInput(command, user, converse)
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(400).json(err);
    })
})

routes.post('/t', (req, res) => {
  sendAudioInput();
})

module.exports = routes;
