const express = require("express");
const multer = require("multer");

const {
  importContracts,
  importWorkers,
  importMuster,
} = require("../controllers/importController");


const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/contracts", upload.single("file"), importContracts);
router.post(
  "/workers",
  upload.single("file"),
  importWorkers
);
router.post("/muster", upload.single("file"), importMuster);

module.exports = router;