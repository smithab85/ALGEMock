
//---------------- IMPORTS ----------------//

const express = require("express");
const bodyParser = require('body-parser');
const https = require('https');
const { MongoClient, ServerApiVersion } = require('mongodb');

//---------------- CONSTANTS ----------------//

const PORT = 3000
const THRESHOLD = 95    //non-inclusive
const WEATHER_API_KEY = "816e97fdecd8428ab65201454230102"
const URI = "mongodb+srv://root:root@cluster0.hpqj1xl.mongodb.net/?retryWrites=true&w=majority";

//---------------- GLOBALS ----------------//

const app = express();
const webpageDir = `${__dirname}`;

const client = new MongoClient(URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const data = client.db("weather").collection("data");

let belowThresholdRNGCount = 0;
let rngCount = 0;

//---------------- INIT ----------------//

app.use(express.static(webpageDir));
app.use(bodyParser.json());

//---------------- FUNCTIONS ----------------//

/**
 * Example locations:
 *     Lake Geneva: 53147
 *
 * @param loc A location to get data from. Can be a city name, zip code, or latitude/longitude
 * @return {`https://api.weatherapi.com/v1/current.json?key=816e97fdecd8428ab65201454230102&q=${string}&aqi=no`}
 */
const getWeatherAPI_URL = (loc) => {
    return `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${loc}&aqi=no`;
}

/**
 * Using HTTPS, get data from a provided URL and perform an action
 * on said data with a callback function
 * @param url URL to get data from
 * @param cb Callback function. First parameter is an error, second parameter is returned JSON data
 */
const getJSONDataFromUrl = (url, cb) => {
    https.get(url, (resp) => {
        let data = ''
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => {
            const retData = JSON.parse(data)
            cb(null, retData);
        });
    }).on('error', (err) => {
        cb(err);
    });
}

/**
 * Retrieves weather data from the WeatherAPI website and performs an action
 * on said data with a callback function.
 * @param loc Location. Can be a ZIP, city name, or lat/long pair (in degrees)
 * @param cb Callback function to perform data on. First parameter is an object like this
 *  {
 *      err: an error object from the HTTPS request. if this exists, other fields may be null
 *      temp_c: <temperature number in celsius>
 *      wind_kph: <air speed number>
 *  }
 */
const getWeatherData = (loc, cb) => {
    const url = getWeatherAPI_URL(loc);
    getJSONDataFromUrl(url, (err, jsonData) => {
        if (err) return console.error(err);
        let windKPH = undefined, tempCelsius = undefined, error = undefined;
        if (jsonData && jsonData.current) {
            tempCelsius = jsonData.current.temp_c;
            windKPH = jsonData.current.wind_kph;
        }
        cb({temp_c: tempCelsius, wind_kph: windKPH, err: error});   //TODO: Add RNG?
    });
}

const computeConnectionPercentage = (sentRNG) => {
    rngCount++;
    if (!isNaN(sentRNG) && sentRNG <= THRESHOLD) {
        belowThresholdRNGCount++;
    }
    return (belowThresholdRNGCount / rngCount);
}

//---------------- ENDPOINTS ----------------//

app.get("/", (request, response) => {
    response.sendFile(__dirname + "/index.html");
});

app.post("/connProb", (request, response) => {
    let sentRNG = undefined;
    if (request && request.body && !isNaN(request.body.rng)) {
        sentRNG = request.body.rng;
    }
    response.status(200).json(computeConnectionPercentage(sentRNG));
})

app.post("/location", async (request, response) => {
    let sentLoc = undefined;
    if (request && request.body && request.body.loc) {
        sentLoc = request.body.loc;
    }

    getWeatherData(sentLoc, retObj => {
        let code = 200;
        if (retObj.err) {
            code = 500;
        }
        response.status(code).json(retObj);
    });
});

const listener = app.listen(PORT, () => {
    console.log("Your app is listening on port " + PORT);
});

setTimeout(async () => {
    getWeatherData(53147, async (retObj) => {
        console.log(retObj);
        await data.insertOne(retObj);
    });
}, 1000);

