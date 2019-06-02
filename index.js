const {chain}  = require('stream-chain');

const {parser} = require('stream-json');
const {pick}   = require('stream-json/filters/Pick');
const {streamArray} = require('stream-json/streamers/StreamArray');
const {OpenWeatherMapTransform} = require('./tool/mapper');
const minimist = require('minimist');
const fs   = require('fs');
const express = require('express');

var args = minimist(process.argv.slice(2), {
  int: 'port',
  alias: { p: 'port' },
  default: { port: 5555 },
})
const app = express();

app.get('/', function (req, res) {
  const pipeline = chain([
    fs.createReadStream('sample.json'),
    parser(),
    pick({filter: 'list'}),
    streamArray(),
    new OpenWeatherMapTransform(),
  ]);
  pipeline.on('data', (progress) => res.write(progress));
  pipeline.on("end", () => res.end());
})

app.listen(args['port'], function () {
  console.log('Example app listening on port ' + args['port'] + ' !')
})

