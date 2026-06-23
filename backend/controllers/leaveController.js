const pool = require("../db");

const applyLeave = async (req, res) => {
  try {
    const { worker_adhar_id, from_date, to_date, reason, supervisor_id } = req.body;

    if (!worker_adhar_id || !from_date || !to_date || !reason) {
      return res.status(400).json({ message: "All leave fields are required" });
    }

    const result = await pool.query(
      `INSERT INTO leave_requests
       (worker_adhar_id, supervisor_id, from_date, to_date, reason)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [worker_adhar_id, supervisor_id || null, from_date, to_date, reason]
    );

    res.status(201).json({
      message: "Leave request submitted successfully",
      leave: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting leave request" });
  }
};

const getLeaveRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        l.*,
        w.worker_name,
        w.worker_skill,
        w.job_cd
       FROM leave_requests l
       JOIN workers w ON l.worker_adhar_id = w.adhar_id
       ORDER BY l.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading leave requests" });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const result = await pool.query(
      `UPDATE leave_requests
       SET status = $1, remarks = $2
       WHERE id = $3
       RETURNING *`,
      [status, remarks || null, id]
    );

    res.json({
      message: "Leave status updated",
      leave: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating leave status" });
  }
};

module.exports = {
  applyLeave,
  getLeaveRequests,
  updateLeaveStatus,
};