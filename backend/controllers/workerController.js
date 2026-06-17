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

const updateWorker = async (req, res) => {
  try {
    const { id } = req.params;

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
      `UPDATE workers SET
        job_cd = $1,
        adhar_id = $2,
        worker_name = $3,
        dob = $4,
        worker_desig = $5,
        worker_skill = $6,
        worker_gender = $7
      WHERE id = $8
      RETURNING *`,
      [
        job_cd,
        adhar_id,
        worker_name,
        dob,
        worker_desig,
        worker_skill,
        worker_gender,
        id,
      ]
    );

    res.json({
      message: "Worker updated successfully",
      worker: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating worker" });
  }
};

const deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM workers WHERE id = $1", [id]);

    res.json({ message: "Worker deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting worker" });
  }
};

module.exports = {
  addWorker,
  getWorkers,
  updateWorker,
  deleteWorker,
};