const myHeading = document.querySelector("h1");
myHeading.textContent = "Hello world!";

let myButton = document.querySelector("button");
myButton.onclick = () => {
    setProb();
};


function setProb() {
    const myProb = prompt("Please enter a number 1-100.");
    if (!myProb) {
        setProb();
    } else {
        localStorage.setItem("prob", myProb);
        myHeading.textContent = `Your Probability, ${myProb}`;
    }
}
