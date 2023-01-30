
const myHeading = document.querySelector("h1");
myHeading.textContent = "Hello world!";

let myButton = document.querySelector("button");
myButton.onclick = () => {
    setProb();
};

const sendRandomNumber = (num) => {
    const host = window.location.host;

    fetch("https://" + host + "/connProb", {
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
        console.log(json, "YO SENT?!");
    }).catch(error => console.error('Error:', error));
}

function setProb() {
    const myProb = prompt("Please enter a number 1-100.");
    if (!myProb) {
        setProb();
    } else {
        localStorage.setItem("prob", myProb);
        myHeading.textContent = `Your Probability, ${myProb}`;

        sendRandomNumber(myProb);
    }
}
