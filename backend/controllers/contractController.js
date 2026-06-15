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

const updateContract = async (req, res) => {
  try {
    const { job_cd } = req.params;
    const {
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
      `UPDATE contracts SET
        contractor_name=$1,
        contractor_address=$2,
        contractor_phone=$3,
        work_area=$4,
        party_cd=$5,
        dept_cd=$6,
        job_desc=$7,
        job_start_dt=$8,
        job_end_dt=$9
      WHERE job_cd=$10
      RETURNING *`,
      [
        contractor_name,
        contractor_address,
        contractor_phone,
        work_area,
        party_cd,
        dept_cd,
        job_desc,
        job_start_dt,
        job_end_dt,
        job_cd,
      ]
    );

    res.json({ message: "Contract updated", contract: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating contract" });
  }
};

const deleteContract = async (req, res) => {
  try {
    const { job_cd } = req.params;

    await pool.query("DELETE FROM contracts WHERE job_cd=$1", [job_cd]);

    res.json({ message: "Contract deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting contract" });
  }
};

module.exports = {
  addContract,
  getContracts,
  updateContract,
  deleteContract,
};