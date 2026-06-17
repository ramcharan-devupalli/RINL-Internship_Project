const express = require("express");
const router = express.Router();

const {
  addWorker,
  getWorkers,
  updateWorker,
  deleteWorker,
} = require("../controllers/workerController");

router.post("/", addWorker);
router.get("/", getWorkers);
router.put("/:id", updateWorker);
router.delete("/:id", deleteWorker);

module.exports = router;