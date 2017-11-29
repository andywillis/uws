const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const compression = require('compression');
const loader = require('./lib/loader');
const wrangleData = require('./lib/wrangleData');

const app = express();

app.set('port', (process.env.PORT || 3001));
app.use(compression());

// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../react-ui/build')));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

function getData() {
  loader((data) => {
    wrangleData(data).then(newData => app.dataStore = newData);
    setTimeout(getData, 1000 * 60 * 30);
  });
}

getData();

app.get('/entries', (req, res) => {
  res.json(app.dataStore);
});

app.get('/reload', (req, res) => {
  getData();
  res.send('Data reloaded.');
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
  //  res.sendFile(path.join(`${__dirname}/../build/index.html`));
});

http.createServer(app).listen(app.get('port'));

console.log('Server created on port', app.get('port'));
