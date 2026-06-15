const express = require("express");
const router = express.Router();

const {
  addContract,
  getContracts,
  updateContract,
  deleteContract,
} = require("../controllers/contractController");

router.post("/", addContract);
router.get("/", getContracts);
router.put("/:job_cd", updateContract);
router.delete("/:job_cd", deleteContract);

module.exports = router;