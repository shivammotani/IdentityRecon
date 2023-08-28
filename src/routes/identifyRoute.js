const express = require("express");
const router = express.Router();
const { logicController } = require("../controllers/identifyController");

router.post("/", logicController);

router.get("/", (req, res) => {
  res.json({
    message: "Kindly make only post request to this end-point.",
  });
});

module.exports = router;
