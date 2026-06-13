const pool = require("../db");

const addMuster = async (req, res) => {
  try {
    const {
      adhar_id,
      job_cd,
      worker_name,
      worker_skill,
      present,
      absent,
      weekly_off,
      holidays,
      leaves,
      muster_month,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO monthly_muster
      (adhar_id, job_cd, worker_name, worker_skill, present, absent, weekly_off, holidays, leaves, muster_month)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        adhar_id,
        job_cd,
        worker_name,
        worker_skill,
        present,
        absent,
        weekly_off,
        holidays,
        leaves,
        muster_month,
      ]
    );

    res.status(201).json({
      message: "Muster entry added successfully",
      muster: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding muster entry" });
  }
};

const getMuster = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM monthly_muster ORDER BY id DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching muster data" });
  }
};

module.exports = {
  addMuster,
  getMuster,
};