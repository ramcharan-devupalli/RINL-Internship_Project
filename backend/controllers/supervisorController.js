const pool = require("../db");

const getSupervisorStats = async (req, res) => {
  try {
    const contracts = await pool.query("SELECT COUNT(*) FROM contracts");
    const workers = await pool.query("SELECT COUNT(*) FROM workers");

    const pendingLeaves = await pool.query(
      "SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'"
    );

    const approvedLeaves = await pool.query(
      "SELECT COUNT(*) FROM leave_requests WHERE status = 'approved'"
    );

    const rejectedLeaves = await pool.query(
      "SELECT COUNT(*) FROM leave_requests WHERE status = 'rejected'"
    );

    const muster = await pool.query(`
      SELECT 
        COALESCE(SUM(present), 0) AS present,
        COALESCE(SUM(absent), 0) AS absent
      FROM monthly_muster
    `);

    const wage = await pool.query(`
      SELECT COALESCE(SUM(m.present * w.daily_wage), 0) AS total_wage
      FROM monthly_muster m
      JOIN wage_rates w ON m.worker_skill = w.worker_skill
    `);

    res.json({
      total_contracts: Number(contracts.rows[0].count),
      total_workers: Number(workers.rows[0].count),
      pending_leaves: Number(pendingLeaves.rows[0].count),
      approved_leaves: Number(approvedLeaves.rows[0].count),
      rejected_leaves: Number(rejectedLeaves.rows[0].count),
      present_days: Number(muster.rows[0].present),
      absent_days: Number(muster.rows[0].absent),
      total_wage: Number(wage.rows[0].total_wage),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading supervisor stats" });
  }
};

module.exports = { getSupervisorStats };