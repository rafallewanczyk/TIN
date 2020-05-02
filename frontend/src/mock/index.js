// ts
const express = require('express');
const bodyParser = require('body-parser');
const faker = require('faker');
const morgan = require('morgan');
const cors = require('cors');

let devices = [
  {
    name: 'Regulator 1',
    regulatorId: '14',
    id: '11',
    status: 'ACTIVE',
    type: 'TEMPERATURE',
    data: 12.12,
    targetData: 13.12,
  },
  {
    name: 'Regulator 2',
    regulatorId: '14',
    id: '12',
    status: 'INACTIVE',
    type: 'LIGHT',
    data: true,
    targetData: true,
  },
  {
    name: 'Regulator 3',
    regulatorId: '14',
    id: '13',
    status: 'INVALID',
    type: 'LIGHT',
    data: true,
    targetData: true,
  },
  {
    name: 'Regulator 4',
    regulatorId: '14',
    id: '14',
    status: 'CONNECTING',
    type: 'LIGHT',
    data: false,
    targetData: true,
  },
];

let regulators = [
  {
    name: 'Regulator 1',
    id: '14',
    status: 'ACTIVE',
    type: 'LIGHT',
  },
  {
    name: 'Regulator Regulator',
    id: '15',
    status: 'INACTIVE',
    type: 'TEMPERATURE',
  },
  {
    name: 'Regulator Regulator Regulator',
    id: '16',
    status: 'INVALID',
    type: 'LIGHT',
  },
  {
    name: '1 Regulator Regulator',
    id: '17',
    status: 'CONNECTING',
    type: 'LIGHT',
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
  return type === 'TEMPERATURE'
    ? faker.random.number({ min: 0, max: 30, precision: 4 })
    : faker.random.boolean();
}

app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(cors());

const timeoutDelay = 1500;

app.get('/devices', delayMiddleware(timeoutDelay), (req, res) => {
  const response = devices.map((device) => ({
    ...device,
    status: randomStatus(),
  }));

  return res.send(response);
});
app.post('/devices', delayMiddleware(timeoutDelay), (req, res) => {
  const { name, regulatorId } = req.body;
  const type = faker.random.arrayElement(['TEMPERATURE', 'LIGHT']);
  devices = [
    ...devices,
    {
      name,
      regulatorId,
      id: faker.random.number(10000),
      status: randomStatus(),
      type,
      data: randomData(type),
      targetData: randomData(type),
    },
  ];

  res.status(201).send();
});
app.put('/devices/:id', delayMiddleware(timeoutDelay), (req, res) => res.status(200).send());
app.delete('/devices/:id', delayMiddleware(timeoutDelay), (req, res) => {
  devices = devices.filter((device) => device.id !== req.params.id);

  res.status(204).send();
});

app.get('/regulators', delayMiddleware(timeoutDelay), (req, res) => {
  const response = regulators.map((device) => ({
    ...device,
    status: randomStatus(),
  }));

  res.send(response);
});
app.post('/regulators', delayMiddleware(timeoutDelay), (req, res) => {
  const { name, type } = req.body;
  regulators = [
    ...regulators,
    {
      name,
      id: faker.random.number(10000),
      status: randomStatus(),
      type,
    },
  ];

  res.status(201).send();
});
app.put('/regulators/:id', delayMiddleware(timeoutDelay), (req, res) => {
  regulators = regulators.map((device) => ({
    ...device,
    name: req.body.name,
    type: req.body.type,
  }));

  res.status(200).send();
});
app.delete('/regulators/:id', delayMiddleware(timeoutDelay), (req, res) => {
  regulators = regulators.filter((device) => device.id !== req.params.id);

  res.status(204).send();
});

app.post('/devices/setTargetData', delayMiddleware(timeoutDelay), (req, res) => {
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
