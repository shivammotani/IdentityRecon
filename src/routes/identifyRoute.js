const express = require("express");
const router = express.Router();
const { logicController } = require("../controllers/identifyController");

// Handle the POST request on /identify route.
router.post("/", logicController);

// Handle the GET request on /identify route.
router.get("/", (req, res) => {
  res.json({
    message: "Kindly make only post request to this end-point.",
  });
});

module.exports = router;
