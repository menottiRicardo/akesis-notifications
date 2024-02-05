const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cron = require('node-cron');

require('dotenv').config();
const whatsapp = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox'],
  },
});

const app = express();

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));

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
  }
});

// routes
app.get('/health', (req, res) => {
  return res.send('ok');
});
app.post('/send-whatsapp', async (req, res) => {
  if (process.env.CRON_API_KEY !== req.headers.authorization) {
    console.log('unauthorized');
    return res.send('invalid request');
  }

  const message = req.body.message;
  let phoneNumber = req.body.phoneNumber;

  if (!phoneNumber || !message) {
    console.log('not message nor number', phoneNumber, message);
    res.send('invalid request');
    return;
  }

  if (phoneNumber.includes('+')) {
    console.log('phone includes', phoneNumber);
    phoneNumber = phoneNumber.split('+')[1];
  }

  const numberDetails = await whatsapp.getNumberId(phoneNumber);

  if (!numberDetails) {
    console.log('no details');
    return res.send('invalid request');
  }
  try {
    console.log('sending message to>>>', numberDetails._serialized, message);
    whatsapp.sendMessage(numberDetails._serialized, message);
  } catch (error) {
    res.send('hola');
  }
  res.send('Done');
});

// cron jobs

const whatsappReminderJob = cron.schedule('*/5 * * * *', async () => {
  const url = process.env.CRON_WHATSAPP_URL;
  await fetch(url, {
    method: 'POST',
    headers: {
      authorization: process.env.CRON_API_KEY,
    },
  });
});

const smsReminderJob = cron.schedule('*/5 * * * *', async () => {
  const url = process.env.CRON_SMS_URL;
  await fetch(url, {
    method: 'POST',
    headers: {
      authorization: process.env.CRON_API_KEY,
    },
  });
});

const emailReminderJob = cron.schedule('*/5 * * * *', async () => {
  const url = process.env.CRON_EMAIL_URL;
  await fetch(url, {
    method: 'POST',
    headers: {
      authorization: process.env.CRON_API_KEY,
    },
  });
});


const webhooksReminderJob = cron.schedule('*/5 * * * *', async () => {
  const url = process.env.CRON_WEBHOOK_URL;
  await fetch(url, {
    method: 'POST',
    headers: {
      authorization: process.env.CRON_API_KEY,
    },
  });
});

// init
const port = 3000;

whatsapp.initialize();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
