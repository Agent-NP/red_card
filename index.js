const express = require("express");
const cors = require("cors");
const axios = require("axios");
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
  console.log("running!");
  const current = (await live_football()).data;
  if (current != null) {
    for (let i = 0; i < current.length; i++) {
      const match = current[i];
      if (!matchesWithRedCard.includes(match["match link"])) {
        matchesWithRedCard.push(match["match link"]);
        const teams = `${match.home} - ${match.away}`;
        const homeRedCards = parseInt(match["red card"].home);
        const awayRedCards = parseInt(match["red card"].away);
        const matchLink = match["match link"];
        const score = match.currentscore.trim();
        // let decison;
        // let goalDifference;
        // let [homeScore, awayScore] = score.split("-");
        // console.log(homeRedCards);
        // homeScore = parseInt(homeScore);
        // awayScore = parseInt(awayScore);
        // //Execute Decision
        // if (homeRedCards > 0 && awayRedCards == "None") {
        //   goalDifference = homeScore - awayScore;
        //   if (goalDifference === 0) {
        //     decison = `${awayTeam} To Win`;
        //   } else if (goalDifference === 1) {
        //     decison = `${awayTeam} To Draw`;
        //   }
        // } else if (homeRedCards == "None" && awayRedCards > 0) {
        //   goalDifference = awayScore - homeScore;
        //   if (goalDifference === 0) {
        //     decison = `${homeTeam} To Win`;
        //   } else if (goalDifference === 1) {
        //     decison = `${homeTeam} To Draw`;
        //   }
        // } else if(homeRedCards > 0 && awayRedCards > 0){
        //   goalDifference = Math.abs(awayScore - homeScore);
        //   if (goalDifference === 0) {
        //     decison = `${homeTeam} To Win`;
        //   } else if (goalDifference === 1) {
        //     decison = `${homeTeam} To Draw`;
        //   }
        // }
        // if (goalDifference === 0 || goalDifference === 1) {
        //   const message = encodeURIComponent(
        //     `TEAMS: ${teams}\nRED_CARD: HOME [${homeRedCards}], AWAY: [${awayRedCards}]\nSCORES: ${match.currentscore}\nREVIEW: ${matchLink}`
        //   );
        //   sendMessage(message);
        // }
        const message = encodeURIComponent(
          `TEAMS: ${teams}\nRED_CARD: HOME [${homeRedCards}], AWAY: [${awayRedCards}]\nSCORES: ${match.currentscore}\nREVIEW: ${matchLink}`
        );
        sendMessage(message);
      }
    }
  }
}


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
  // Call the function immediately to emit initial data
  updateAndBroadcast();
  
  setInterval(() => updateAndBroadcast(), 30000);
});
