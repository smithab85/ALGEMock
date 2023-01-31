
//---------------- IMPORTS ----------------//

const express = require("express");
const bodyParser = require('body-parser');

//---------------- CONSTANTS ----------------//

const PORT = 3000
const THRESHOLD = 90    //non-inclusive,

//---------------- GLOBALS ----------------//

const app = express();
const webpageDir = `${__dirname}`;

let belowThresholdRNGCount = 0;
let rngCount = 0;

//---------------- INIT ----------------//

app.use(express.static(webpageDir));
app.use(bodyParser.json());

//---------------- FUNCTIONS ----------------//

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
    const sentRNG = request?.body?.rng;
    response.status(200).json(computeConnectionPercentage(sentRNG));
})

const listener = app.listen(PORT, () => {
    console.log("Your app is listening on port " + PORT);
});
