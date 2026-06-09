const pool = require("../db");

const addWorker = async (req, res) => {
  try {
    const {
      job_cd,
      adhar_id,
      worker_name,
      dob,
      worker_desig,
      worker_skill,
      worker_gender,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO workers
      (job_cd, adhar_id, worker_name, dob, worker_desig, worker_skill, worker_gender)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [
        job_cd,
        adhar_id,
        worker_name,
        dob,
        worker_desig,
        worker_skill,
        worker_gender,
      ]
    );

    res.status(201).json({
      message: "Worker added successfully",
      worker: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding worker" });
  }
};

const getWorkers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM workers
       ORDER BY id DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching workers" });
  }
};

module.exports = {
  addWorker,
  getWorkers,
};