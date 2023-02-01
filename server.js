
//---------------- IMPORTS ----------------//

const express = require("express");
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');

//---------------- CONSTANTS ----------------//

const PORT = 3000
const THRESHOLD = 95    //non-inclusive,

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
