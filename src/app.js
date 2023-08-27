const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config");
const app = express();
const identifyRoute = require("./routes/identifyRoute");
const port = config.PORT || 3000;

app.use(bodyParser.json());

app.use("/identify/", identifyRoute);

app.get("/", (req, res) => {
  res.json({
    message: "Kindly make a post request to /identify route",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
