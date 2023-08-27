const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  res.json({
    message: "This is a test",
  });
});

router.get("/", (req, res) => {
  res.json({
    message: "Kindly make only post request to this end-point.",
  });
});

module.exports = router;
