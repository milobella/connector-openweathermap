const {chain}  = require('stream-chain');

const {parser} = require('stream-json');
const {pick}   = require('stream-json/filters/Pick');
const {streamArray} = require('stream-json/streamers/StreamArray');
const StreamValues = require('stream-json/streamers/StreamValues');
const {ForecastTransform, WeatherMapper} = require('./tool/mapper');
const minimist = require('minimist');
const fs   = require('fs');
const express = require('express');
const request = require('request');
const streamify = require('streamify');
const {stringer} = require('stream-json/Stringer');

var args = minimist(process.argv.slice(2), {
  int: 'port',
  string: 'apikey',
  alias: { p: 'port', k: 'apikey'},
  default: { port: 5555 },
})
const app = express();
const w_mapper = new WeatherMapper();

app.get('/forecast', function (req, res) {
  const pipeline = request.get('http://api.openweathermap.org/data/2.5/forecast?q=' + req.query.q + ',FR&units=metric&appid='+ args['apikey'] +'&lang=fr')
    .pipe(parser())
    .pipe(pick({filter: 'list'}))
    .pipe(streamArray())
    .pipe(new ForecastTransform(w_mapper, req.query.q));
  pipeline.on('data', progress => res.write(progress));
  pipeline.on("end", () => res.end());
})

app.get('/weather', function (req, res) {
  const pipeline = request.get('http://api.openweathermap.org/data/2.5/weather?q=' + req.query.q + ',FR&units=metric&appid='+ args['apikey'] +'&lang=fr')
    .pipe(StreamValues.withParser())
  pipeline.on('data', progress => res.write(w_mapper.to_target(progress.value)));
  pipeline.on("end", () => res.end());
})

app.listen(args['port'], function () {
  console.log('OpenWeatherMap tool listening on port ' + args['port'] + ' !')
})
