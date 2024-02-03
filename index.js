const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const whatsapp = new Client({
  authStrategy: new LocalAuth(),
});

const express = require('express');
const app = express();

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));
const port = 3000;

// whatsapp
whatsapp.on('qr', (qr) => {
  qrcode.generate(qr, {
    small: true,
  });
});

whatsapp.on('ready', () => {
  console.log('Client is ready!');
});

whatsapp.on('message', async (message) => {
  if (message.body === '!ping') {
    message.reply('pong');
    console.log(message.from);
  }
});

app.post('/send-whatsapp', async (req, res) => {
  const { phoneNumber, message } = req.body;

  try {
    if (!phoneNumber || !message) {
      res.send('invalid request');
      return;
    }

    whatsapp.sendMessage(phoneNumber, message);
  } catch (error) {
    console.log(error);
    res.send('hola');
  }
  res.send('hola');
});

whatsapp.initialize();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
