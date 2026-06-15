const pool = require("../db");

const getAdminStats = async (req, res) => {
  try {
    const users = await pool.query("SELECT COUNT(*) FROM users");
    const contracts = await pool.query("SELECT COUNT(*) FROM contracts");
    const workers = await pool.query("SELECT COUNT(*) FROM workers");
    const muster = await pool.query("SELECT COUNT(*) FROM monthly_muster");

    const wage = await pool.query(`
      SELECT COALESCE(SUM(m.present * w.daily_wage), 0) AS total_wage
      FROM monthly_muster m
      JOIN wage_rates w ON m.worker_skill = w.worker_skill
    `);

    res.json({
      total_users: Number(users.rows[0].count),
      total_contracts: Number(contracts.rows[0].count),
      total_workers: Number(workers.rows[0].count),
      total_muster: Number(muster.rows[0].count),
      total_wage: Number(wage.rows[0].total_wage),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading admin stats" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, mobile, role, employee_id, status, email_verified, created_at
      FROM users
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading users" });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      "UPDATE users SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    res.json({
      message: "User status updated",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating user status" });
  }
};

const getWageRates = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM wage_rates ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading wage rates" });
  }
};

const updateWageRate = async (req, res) => {
  try {
    const { skill } = req.params;
    const { daily_wage } = req.body;

    const result = await pool.query(
      "UPDATE wage_rates SET daily_wage = $1 WHERE worker_skill = $2 RETURNING *",
      [daily_wage, skill]
    );

    res.json({
      message: "Wage rate updated",
      wage_rate: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating wage rate" });
  }
};

const getWageExpenses = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        message: "month is required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        c.job_cd,
        c.contractor_name,
        COUNT(DISTINCT m.adhar_id) AS worker_count,
        SUM(m.present) AS total_present_days,
        SUM(m.present * w.daily_wage) AS wage_expense
      FROM monthly_muster m
      JOIN wage_rates w
        ON m.worker_skill = w.worker_skill
      JOIN contracts c
        ON m.job_cd = c.job_cd
      WHERE m.muster_month = $1
      GROUP BY c.job_cd, c.contractor_name
      ORDER BY wage_expense DESC
      `,
      [month]
    );

    const total = result.rows.reduce(
      (sum, row) => sum + Number(row.wage_expense || 0),
      0
    );

    res.json({
      jobs: result.rows,
      total_expense: total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error loading wage expenses",
    });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  getWageRates,
  updateWageRate,
  getWageExpenses,
};
