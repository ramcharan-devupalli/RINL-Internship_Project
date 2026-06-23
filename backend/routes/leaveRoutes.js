const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getLeaveRequests,
  updateLeaveStatus,
} = require("../controllers/leaveController");

router.post("/", applyLeave);
router.get("/", getLeaveRequests);
router.patch("/:id/status", updateLeaveStatus);

module.exports = router;