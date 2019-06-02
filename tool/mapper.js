const {Transform} = require('stream');

const weather_map = new Map();

// Group 2xx: Thunderstorm
weather_map.set(200, "thunderstorm with light rain");
weather_map.set(201, "thunderstorm with rain");
weather_map.set(202, "thunderstorm with heavy rain");
weather_map.set(210, "light thunderstorm");
weather_map.set(211, "thunderstorm");
weather_map.set(212, "heavy thunderstorm");
weather_map.set(221, "ragged thunderstorm");
weather_map.set(230, "thunderstorm with light drizzle");
weather_map.set(231, "thunderstorm with drizzle");
weather_map.set(232, "thunderstorm with heavy drizzle");

// Group 3xx: Drizzle
weather_map.set(300, "light intensity drizzle");
weather_map.set(301, "drizzle");
weather_map.set(302, "heavy intensity drizzle");
weather_map.set(310, "light intensity drizzle rain");
weather_map.set(311, "drizzle rain");
weather_map.set(312, "heavy intensity drizzle rain");
weather_map.set(313, "shower rain and drizzle");
weather_map.set(314, "heavy shower rain and drizzle");
weather_map.set(321, "shower drizzle");

// Group 5xx: Rain
weather_map.set(500, "light rain");
weather_map.set(501, "moderate rain");
weather_map.set(502, "heavy intensity rain");
weather_map.set(503, "very heavy rain");
weather_map.set(504, "extreme rain");
weather_map.set(511, "freezing rain");
weather_map.set(520, "light intensity shower rain");
weather_map.set(521, "shower rain");
weather_map.set(522, "heavy intensity shower rain");
weather_map.set(531, "ragged shower rain");

// Group 6xx: Snow
weather_map.set(600, "light snow");
weather_map.set(601, "snow");
weather_map.set(602, "heavy snow");
weather_map.set(611, "sleet");
weather_map.set(612, "light shower sleet");
weather_map.set(613, "shower sleet");
weather_map.set(615, "light rain and snow");
weather_map.set(616, "rain and snow");
weather_map.set(620, "light shower snow");
weather_map.set(621, "shower snow");
weather_map.set(622, "heavy shower snow");

// Group 7xx: Atmosphere
weather_map.set(701, "mist");
weather_map.set(711, "smoke");
weather_map.set(721, "haze");
weather_map.set(731, "sand dust whirls");
weather_map.set(741, "fog");
weather_map.set(751, "sand");
weather_map.set(761, "dust");
weather_map.set(762, "volcanic ash");
weather_map.set(771, "squalls");
weather_map.set(781, "tornado");

// Group 800: Clear
weather_map.set(800, "clear");

// Group 80x: Clouds
weather_map.set(801, "few clouds");
weather_map.set(802, "scattered clouds");
weather_map.set(803, "broken clouds");
weather_map.set(804, "overcast clouds");


class OpenWeatherMapTransform extends Transform {
    constructor(options) {
        super(Object.assign({}, options, {writableObjectMode: true, readableObjectMode: true}));

        this._count = 0;
    }

    _transform(chunk, _, callback) {
      if (this.notFirst) {
        this.push(',');
      } else {
        this.push('{"forecast" : [');
        this.notFirst = true;
      }
      this._count++;
      this.push(JSON.stringify({
        "temperature": chunk.value.main.temp,
        "timestamp": chunk.value.dt,
        "weather": weather_map.get(chunk.value.weather.id) || weather_map.get(800),
      }));
      callback(null);
    }

    _flush(callback) {
      this.push(this.notFirst ? '], "count": ' + this._count + '}' : '{"forecast" : [], "count": 0}');
      callback(null);
    }
}

exports.OpenWeatherMapTransform = OpenWeatherMapTransform;