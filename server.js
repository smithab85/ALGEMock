
const express = require("express");
const bodyParser = require('body-parser');

const app = express();
const webpageDir = `${__dirname}`;

app.use(express.static(webpageDir));
app.use(bodyParser.json());

const PORT = 3000       //process.env.PORT

app.get("/", (request, response) => {
    response.sendFile(__dirname + "/index.html");
});

app.post("/connProb", (request, response) => {
    console.log("wth i got from client");
    response.status(200).json("meow");
})

const listener = app.listen(PORT, () => {
    console.log("Your app is listening on port " + PORT);
});
