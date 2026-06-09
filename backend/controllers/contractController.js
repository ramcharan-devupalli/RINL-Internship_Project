const pool = require("../db");

const addContract = async (req, res) => {
  try {
    const {
      job_cd,
      contractor_name,
      contractor_address,
      contractor_phone,
      work_area,
      party_cd,
      dept_cd,
      job_desc,
      job_start_dt,
      job_end_dt,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO contracts
      (job_cd, contractor_name, contractor_address, contractor_phone, work_area, party_cd, dept_cd, job_desc, job_start_dt, job_end_dt)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        job_cd,
        contractor_name,
        contractor_address,
        contractor_phone,
        work_area,
        party_cd,
        dept_cd,
        job_desc,
        job_start_dt,
        job_end_dt,
      ]
    );

    res.status(201).json({
      message: "Contract added successfully",
      contract: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding contract" });
  }
};

const getContracts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM contracts ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching contracts" });
  }
};

module.exports = {
  addContract,
  getContracts,
};