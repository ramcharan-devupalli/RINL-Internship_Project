const pool = require("../db");

const getWorkerDashboard = async (req, res) => {
  try {
    const { adhar_id } = req.params;
    const { month } = req.query;

    const selectedMonth = month || "2026-06";

    const workerResult = await pool.query(
      `SELECT *
       FROM workers
       WHERE adhar_id = $1`,
      [adhar_id]
    );

    if (workerResult.rows.length === 0) {
      return res.status(404).json({
        message: "Worker not found",
      });
    }

    const worker = workerResult.rows[0];

    const musterResult = await pool.query(
      `SELECT *
       FROM monthly_muster
       WHERE adhar_id = $1
       AND muster_month = $2`,
      [adhar_id, selectedMonth]
    );

    const muster = musterResult.rows[0] || {
      present: 0,
      absent: 0,
      weekly_off: 0,
      holidays: 0,
      leaves: 0,
    };

    const wageResult = await pool.query(
      `SELECT daily_wage
       FROM wage_rates
       WHERE worker_skill = $1`,
      [worker.worker_skill]
    );

    const dailyWage = Number(wageResult.rows[0]?.daily_wage || 0);
    const grossWage = Number(muster.present || 0) * dailyWage;
    const pfAmount = grossWage * 0.05;
    const insuranceAmount = grossWage * 0.02;
    const netWage = grossWage - pfAmount - insuranceAmount;

    res.json({
      name: worker.worker_name,
      loginId: worker.adhar_id,
      workerId: worker.id,
      jobCode: worker.job_cd,
      dob: worker.dob,
      skill: worker.worker_skill,
      shiftHours: 8,

      presentDays: muster.present,
      absentDays: muster.absent,
      weeklyOff: muster.weekly_off,
      holidays: muster.holidays,

      wagePerDay: dailyWage,
      grossWage,
      pfAmount,
      insuranceAmount,
      netWage,

      leaveStatus: "Not Applied",
      leaveApprovalStatus: "Pending",
      appliedTo: "Supervisor",
      notification: "No notifications",

      leaveUsed: muster.leaves || 0,
      leavePendingCount: 0,
      leaveBalance: 12,

      attendanceTrend: [
        { label: "Week 1", value: Math.min(muster.present, 6) },
        { label: "Week 2", value: Math.min(Math.max(muster.present - 6, 0), 6) },
        { label: "Week 3", value: Math.min(Math.max(muster.present - 12, 0), 6) },
        { label: "Week 4", value: Math.min(Math.max(muster.present - 18, 0), 6) },
      ],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error loading worker dashboard",
    });
  }
};

module.exports = {
  getWorkerDashboard,
};