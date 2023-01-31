
const myHeading = document.querySelector("h1");
myHeading.textContent = "Hello world!";

const connProbPara = document.querySelector("#connId");

let myButton = document.querySelector("button");
myButton.onclick = () => {
    setProb();
};

const sendRandomNumber = (num) => {
    const host = window.location.host;

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
        const percent = (json * 100).toFixed(1);
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
    console.log("Sending:", numToSend.toFixed(1));
    sendRandomNumber(numToSend);
}, 500);
