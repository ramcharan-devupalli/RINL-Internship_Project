const express = require("express");
const router = express.Router();

const {
  addMuster,
  getMuster,
} = require("../controllers/musterController");

router.post("/", addMuster);
router.get("/", getMuster);

module.exports = router;