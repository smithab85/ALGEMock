
//---------------- IMPORTS ----------------//

const express = require("express");
const bodyParser = require('body-parser');
const https = require('https');
const { MongoClient, ServerApiVersion } = require('mongodb');

//---------------- CONSTANTS ----------------//

const PORT = 3000
const THRESHOLD = 95    //non-inclusive
const WEATHER_API_KEY = "816e97fdecd8428ab65201454230102"

const uri = "mongodb+srv://root:root@cluster0.hpqj1xl.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const data = client.db("weather").collection("data");

//---------------- GLOBALS ----------------//

const app = express();
const webpageDir = `${__dirname}`;

let belowThresholdRNGCount = 0;
let rngCount = 0;

//---------------- INIT ----------------//

app.use(express.static(webpageDir));
app.use(bodyParser.json());

//---------------- FUNCTIONS ----------------//

/*
Example locations:
    Lake Geneva: 53147
 */
const getWeatherAPI_URL = (loc) => {
    return `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${loc}&aqi=no`;
}

const getValueFromUrl = (url, cb) => {
    https.get(url, (resp) => {
        let data = ''
        let value = ''
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => {
            const retData = JSON.parse(data)
            cb(null, retData);
        });
    }).on('error', (err) => {
        cb(err);
    });
}

const getWeatherData = (loc, cb) => {
    const url = getWeatherAPI_URL(loc);
    getValueFromUrl(url, (err, jsonData) => {
        if (err) return console.error(err);
        let windKPH = undefined, tempCelsius = undefined, error = undefined;
        if (jsonData && jsonData.current) {
            tempCelsius = jsonData.current.temp_c;
            windKPH = jsonData.current.wind_kph;
        }
        cb({temp_c: tempCelsius, wind_kph: windKPH, err: error});
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

