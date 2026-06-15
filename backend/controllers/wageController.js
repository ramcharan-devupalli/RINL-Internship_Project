const pool = require("../db");

const getWageSheet = async (req, res) => {
  try {
    const { job_cd, muster_month } = req.query;

    if (!job_cd || !muster_month) {
      return res.status(400).json({
        message: "job_cd and muster_month are required",
      });
    }

    const result = await pool.query(
      `
      SELECT 
        m.worker_name,
        m.adhar_id,
        m.worker_skill,
        m.present,
        m.absent,
        m.weekly_off,
        m.holidays,
        m.leaves,
        w.daily_wage,
        (m.present * w.daily_wage) AS total_wage
      FROM monthly_muster m
      JOIN wage_rates w
        ON m.worker_skill = w.worker_skill
      WHERE m.job_cd = $1
        AND m.muster_month = $2
      ORDER BY m.worker_name
      `,
      [job_cd, muster_month]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating wage sheet" });
  }
};

module.exports = { getWageSheet };