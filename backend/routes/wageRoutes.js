const express = require("express");
const router = express.Router();

const { getWageSheet } = require("../controllers/wageController");

router.get("/", getWageSheet);

module.exports = router;