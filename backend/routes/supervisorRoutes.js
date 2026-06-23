const express = require("express");
const router = express.Router();

const { getSupervisorStats } = require("../controllers/supervisorController");

router.get("/stats", getSupervisorStats);

module.exports = router;