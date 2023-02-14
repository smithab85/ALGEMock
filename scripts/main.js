
//----------------------- GLOBALS ------------------------//

let currentLocation = undefined;

//----------------------- UI ELEMENTS ------------------------//

const myHeading = document.querySelector("h1");
const connProbPara = document.querySelector("#connId");
const myButton = document.querySelector("#customProb");
const button100 = document.querySelector("#button100");
const setLocationButton = document.querySelector("#setLocation");
const locDataDisplay = document.getElementById("locData");
const locLastBadData = document.getElementById("locLastBadData");
const badHighTemp = 20;
const badLowTemp = -20;
const badHighSpeed = 60;
const badLowSpeed = 2; //-1 is someone farting


//----------------------- INIT ------------------------//

myHeading.textContent = "Welcome to the Mockup for AL-GE!";

//----------------------- FUNCTIONS ------------------------//

const sendRandomNumber = (num) => {
    const host = window.location.host;

    console.log("Sending:", num);

    fetch("http://localhost:3000/connProb", {
        method: 'POST',
        body: JSON.stringify({
            rng: num
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        }
    }).then((response) => {
        return response.json();
    }).then((json) => {
        const percent = (json * 100).toFixed(3);
        connProbPara.innerHTML = "Connection percentage: " + percent + "%";
        if(percent < 85){
            alert("The connection percentage is out of our valid range! Current Connection percentage: "+percent);
        }
    }).catch(error => console.log('HI'));
}

function setProb() {
    const myProb = prompt("Please enter a number 1-100.");
    if (!myProb) {
        setProb();
    } else {
        localStorage.setItem("prob", myProb);
        myHeading.textContent = `Your Probability (you sent lol), ${myProb}`;

        sendRandomNumber(myProb);
    }
}

const getLocationData = (location, callback) => {
    if (!location) { return; }
    const host = window.location.host;
    fetch(`http://${host}/location`, {
        method: 'POST',
        body: JSON.stringify({loc: location}),
        headers: {'Content-type': 'application/json; charset=UTF-8'}
    }).then((response) => {
        return response.json();
    }).then((json) => {
        callback(json);
    }).catch(error => console.error("Connection Error" + error));
}

const onLocationButtonClick = () => {
    const host = window.location.host;
    const newLoc = prompt("Enter the lake location to retrieve data from (zip code, city name, or lat/long)");
    if (!newLoc) { return }
    console.log("Sending Location:", newLoc);
    getLocationData(newLoc, (jsonData) => {
        console.log(jsonData);
        let badTempFound = false;
        let tempTextData = "Data from " + newLoc + "\ntemperature " + jsonData.temp_c + " celsius, wind speed " + jsonData.wind_kph + " kph";
        let tempTextBad = "";
        if(jsonData.temp_c <= badLowTemp || jsonData.temp_c >= badHighTemp) {
            alert("ALERT! BAD SENSOR DATA! temperature is reported as " + jsonData.temp_c + " celsius which is outside the valid temperature range");
            badTempFound = true;
        }
        if(jsonData.wind_kph <= badLowSpeed || jsonData.wind_kph >= badHighSpeed) {
            alert("ALERT! BAD SENSOR DATA! wind speed is reported as " + jsonData.wind_kph + " kph which is outside the valid wind speed range");
            if(badTempFound) {
                tempTextBad = "Last report of bad data at " + newLoc + " with bad temperature and wind speed readings";
            }
            else {
                tempTextBad = "Last report of bad data at " + newLoc + " with bad wind speed readings";
                tempTextData = "Data from " + newLoc + "\ntemperature " + jsonData.temp_c + " celsius";
            }
        }
        else{
            if(badTempFound) {
                tempTextBad = "Last report of bad data at " + newLoc + " with bad temperature readings";
                tempTextData = "Data from " + newLoc + "\nwind speed " + jsonData.wind_kph + " kph";
            }
            else { //No bad data at all
                tempTextData = "Data from " + newLoc + "\ntemperature " + jsonData.temp_c + " celsius, wind speed " + jsonData.wind_kph + " kph";
            }
        }
        if(tempTextBad.length > 1) {
            locLastBadData.innerHTML = tempTextBad;
        }
            locDataDisplay.innerHTML = tempTextData;
    })
    currentLocation = newLoc;
}

//----------------------- EVENT CONNECTIONS ------------------------//

myButton.onclick = setProb;
button100.onclick = () => {
    sendRandomNumber(100);
}
setLocationButton.onclick = onLocationButtonClick;

//----------------------- LOOP ------------------------//

setInterval(() => {
    const numToSend = Math.floor(Math.random() * 100) + 1;
    sendRandomNumber(numToSend);

    getLocationData(currentLocation, (jsonData) => {
        console.log("lake data:", jsonData);
    })

}, 500);