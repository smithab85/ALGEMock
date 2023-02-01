
const myHeading = document.querySelector("h1");
myHeading.textContent = "Hello world!";

const connProbPara = document.querySelector("#connId");

let myButton = document.querySelector("#customProb");
myButton.onclick = () => {
    setProb();
};

const button100 = document.querySelector("#button100");
button100.onclick = () => {
    sendRandomNumber(100);
}

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

setInterval(() => {
    const numToSend = Math.floor(Math.random() * 100) + 1;
    sendRandomNumber(numToSend);
}, 500);
