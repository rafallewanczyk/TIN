// ts
const express = require('express');
const bodyParser = require('body-parser');
const faker = require('faker');
const morgan = require('morgan');
const cors = require('cors');

let devices = [
  {
    name: 'Devices 1',
    regulatorId: 14,
    id: 11,
    status: 'ACTIVE',
    type: 0,
    address: 'localhost',
    port: 8080,
    data: 13.12,
    targetData: 13.12,
  },
  {
    name: 'Devices 2',
    regulatorId: 14,
    id: 12,
    status: 'INACTIVE',
    type: 1,
    address: 'localhost',
    port: 8080,
    data: true,
    targetData: true,
  },
  {
    name: 'Devices 3',
    regulatorId: 14,
    id: 13,
    status: 'INVALID',
    type: 1,
    address: 'localhost',
    port: 8080,
    data: true,
    targetData: true,
  },
  {
    name: 'Devices 4',
    regulatorId: 14,
    id: 14,
    status: 'CONNECTING',
    type: 0,
    address: 'localhost',
    port: 8080,
    data: null,
    targetData: null,
  },
];

let regulators = [
  {
    name: 'Regulator 1',
    id: 14,
    status: 'ACTIVE',
    type: 1,
    address: 'localhost',
    port: 8080,
  },
  {
    name: 'Regulator Regulator',
    id: 15,
    status: 'INACTIVE',
    type: 0,
    address: 'localhost',
    port: 8080,
  },
  {
    name: 'Regulator Regulator Regulator',
    id: 16,
    status: 'INVALID',
    type: 1,
    address: 'localhost',
    port: 8080,
  },
  {
    name: '1 Regulator Regulator',
    id: 17,
    status: 'CONNECTING',
    type: 1,
    address: 'localhost',
    port: 8080,
  },
];

function withDelay(duration, handler) {
  setTimeout(handler, duration);
}

const delayMiddleware = (delay) => (req, res, next) => {
  withDelay(delay, next);
};

const app = express();
const port = 3001;

function randomStatus() {
  return faker.random.arrayElement(['ACTIVE', 'INACTIVE', 'CONNECTING', 'INVALID']);
}

function randomData(type) {
  return type === 0
    ? faker.random.number({ min: 0, max: 30, precision: 4 })
    : faker.random.boolean();
}

app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(cors());

const timeoutDelay = 1500;

// app.use((req, res, next) => res.status(400).send({error: "Service unavailable"}));

app.get('/devices', delayMiddleware(timeoutDelay), (req, res) => {
  const response = devices.map((device) => ({
    ...device,
    id: parseInt(device.id, 10),
    status: randomStatus(),
    data: device.targetData,
  }));

  return res.send(response);
});

app.post('/devices', delayMiddleware(timeoutDelay), (req, res) => {
  const { id, name, regulatorId, address, port } = req.body;
  const type = faker.random.arrayElement([0, 1]);
  devices = [
    ...devices,
    {
      id,
      name,
      regulatorId,
      address,
      port,
      status: randomStatus(),
      type,
      data: randomData(type),
      targetData: randomData(type),
    },
  ];

  res.status(200).send({ error: 'Something went wrong' });
});

app.patch('/devices/:id', delayMiddleware(timeoutDelay), (req, res) => {
  devices = devices.map((device) => (device.id === parseInt(req.params.id, 10) ? {
    ...device,
    name: req.body.name,
    regulatorId: req.body.regulatorId,
    address: req.body.address,
    port: req.body.port,
  } : device));

  return res.status(200).send();
});
app.delete('/devices/:id', delayMiddleware(timeoutDelay), (req, res) => {
  devices = devices.filter((device) => device.id !== parseInt(req.params.id, 10));

  res.status(200).send();
});

app.get('/regulators', delayMiddleware(timeoutDelay), (req, res) => {
  const response = regulators.map((device) => ({
    ...device,
    id: parseInt(device.id, 10),
    status: randomStatus(),
  }));

  res.status(200).send(response);
});
app.post('/regulators', delayMiddleware(timeoutDelay), (req, res) => {
  const { id, name, type, port, address } = req.body;
  regulators = [
    ...regulators,
    {
      id,
      name,
      port,
      address,
      status: randomStatus(),
      type,
    },
  ];

  res.status(201).send();
});
app.patch('/regulators/:id', delayMiddleware(timeoutDelay), (req, res) => {
  regulators = regulators.map((device) => (device.id === parseInt(req.params.id, 10) ? {
    ...device,
    name: req.body.name,
    type: req.body.type,
    address: req.body.address,
    port: req.body.port,
  } : device));

  res.status(200).send();
});
app.delete('/regulators/:id', delayMiddleware(timeoutDelay), (req, res) => {
  regulators = regulators.filter((device) => device.id !== parseInt(req.params.id, 10));

  res.status(204).send();
});

app.post('/devices/light/setTargetData', delayMiddleware(timeoutDelay), (req, res) => {
  devices = devices.map((device) =>
    device.id === req.body.id
      ? {
        ...device,
        targetData: req.body.targetData,
      }
      : device,
  );

  res.status(204).send();
});

app.post('/devices/temperature/setTargetData', delayMiddleware(timeoutDelay), (req, res) => {
  devices = devices.map((device) =>
    device.id === req.body.id
      ? {
        ...device,
        targetData: req.body.targetData,
      }
      : device,
  );

  res.status(204).send();
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
