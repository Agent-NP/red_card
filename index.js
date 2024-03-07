const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 3001;
const football_routes = require("./routes/sports/football");
const { live_football } = require("./controllers/sports/live");

const bot_token = "7078829173:AAHmU1tty7RtoE0uQdI0gDGl-Bg-rCMAWF0";
const chat_id = "6524312327";
let root_url = `https://api.telegram.org/bot${bot_token}`;
let matchesWithRedCard = [];

// Server Running code
const sendMessage = async text_message => {
  let deliveryMan = `${root_url}/sendMessage?chat_id=${chat_id}&text=${text_message}`;
  await axios
    .get(deliveryMan)
    .then(() => {
      console.log("Message Sent!");
    })
    .catch(error => {
      console.log(error);
    });
};

// Checking if it's 12:00 am to update yesterday value
async function updateAndBroadcast() {
  const current = await live_football();
  console.log(current);
}

// Call the function immediately to emit initial data
updateAndBroadcast();
// const intervalId = setInterval(updateAndBroadcast, 60000);


// API
const app = express();
app.use(cors());
app.use("/api", football_routes);

// Default route for invalid requests
app.get("*", (req, res) => {
  res.status(401).send("Invalid API call");
});

app.listen(PORT, () => {
  console.log("Server (SOCKET.IO) Listening at PORT:", PORT);
  preloadYesterdayData();
});
