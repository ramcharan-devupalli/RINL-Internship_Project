const express = require("express");
const router = express.Router();

const {
  addContract,
  getContracts,
} = require("../controllers/contractController");

router.post("/", addContract);
router.get("/", getContracts);

module.exports = router;