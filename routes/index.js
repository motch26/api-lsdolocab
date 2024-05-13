var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).json({ title: "LSDolocab", msg: "Welcome to LSDolocab!" });
});

module.exports = router;
