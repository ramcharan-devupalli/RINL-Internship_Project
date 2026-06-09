const express = require("express");
const cors = require("cors");
const contractRoutes = require("./routes/contractRoutes");
const workerRoutes = require("./routes/workerRoutes");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/workers", workerRoutes);

app.get("/", (req, res) => {
  res.send("Worker Portal Backend Running");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});