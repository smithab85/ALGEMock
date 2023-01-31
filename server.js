
//---------------- IMPORTS ----------------//

const express = require("express");
const bodyParser = require('body-parser');

//---------------- CONSTANTS ----------------//

const PORT = 3000
const THRESHOLD = 90    //non-inclusive,

//---------------- GLOBALS ----------------//

const app = express();
const webpageDir = `${__dirname}`;
const connectionPercentTable = [];

//---------------- INIT ----------------//

app.use(express.static(webpageDir));
app.use(bodyParser.json());

//---------------- FUNCTIONS ----------------//

const computeConnectionPercentage = (sentRNG) => {
    if (sentRNG !== undefined) {
        connectionPercentTable.push(sentRNG);
    }

    let belowThresholdNumCount = 0;

    connectionPercentTable.forEach((num) => {
        if (num <= THRESHOLD) {
            belowThresholdNumCount++;
        }
    })

    return (belowThresholdNumCount / connectionPercentTable.length);
}

//---------------- ENDPOINTS ----------------//

app.get("/", (request, response) => {
    response.sendFile(__dirname + "/index.html");
});

app.post("/connProb", (request, response) => {
    const sentRNG = request?.body?.rng;
    response.status(200).json(computeConnectionPercentage(sentRNG));
})

const listener = app.listen(PORT, () => {
    console.log("Your app is listening on port " + PORT);
});
