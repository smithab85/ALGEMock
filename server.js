
//---------------- IMPORTS ----------------//

const express = require("express");
const bodyParser = require('body-parser');
const https = require('https');

//---------------- CONSTANTS ----------------//

const PORT = 3000
const THRESHOLD = 95    //non-inclusive
const WEATHER_API_KEY = "816e97fdecd8428ab65201454230102"

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

const getWeatherData = async (loc) => {
    const url = getWeatherAPI_URL(loc);
    let windKPH = undefined, tempCelsius = undefined, error = undefined;

    https.get(url, (resp) => {
        let data = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            const jsonData = JSON.parse(data);
            if (jsonData && jsonData.current) {
                tempCelsius = jsonData.current.temp_c;
                windKPH = jsonData.current.wind_kph;
            }
        });
    }).on("error", (err) => {
        console.warn("Error: " + err.message);
        error = err;
    });

    return {temp_c: tempCelsius, wind_kph: windKPH, err: error};
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

    const retObj = await getWeatherData(sentLoc);

    let code = 200;
    if (retObj.err) {
        code = 500;
    }

    response.status(code).json(retObj);

});

const listener = app.listen(PORT, () => {
    console.log("Your app is listening on port " + PORT);
});

setTimeout(async () => {
    const retObj = await getWeatherData(53147);
    console.log(retObj);
}, 1000);
//
