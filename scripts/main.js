
//----------------------- GLOBALS ------------------------//

let currentLocation = undefined;

//----------------------- UI ELEMENTS ------------------------//

const myHeading = document.querySelector("h1");
const connProbPara = document.querySelector("#connId");
const myButton = document.querySelector("#customProb");
const button100 = document.querySelector("#button100");
const setLocationButton = document.querySelector("#setLocation");

//----------------------- INIT ------------------------//

myHeading.textContent = "Hello world!";

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
    }).catch(error => console.error(error));
}

const onLocationButtonClick = () => {
    const newLoc = prompt("Enter the lake location to retrieve data from");
    if (!newLoc) { return }
    console.log("Sending Location:", newLoc);
    getLocationData(newLoc, (jsonData) => {
        console.log(jsonData);
    })
    currentLocation = newLoc;
}

//----------------------- EVENT CONNECTIONS ------------------------//

myButton.onclick = setProb
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
