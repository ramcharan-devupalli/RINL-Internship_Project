const xlsx = require("xlsx");
const pool = require("../db");

const cleanId = (value) => {
  if (!value) return "";
  return String(value).trim().replace(/\.0$/, "");
};

const formatExcelDate = (value) => {
  if (value === undefined || value === null || value === "") return null;

  if (typeof value === "string") {
    const cleaned = value.trim();

    if (
      cleaned === "" ||
      cleaned === "-" ||
      cleaned.toLowerCase() === "na" ||
      cleaned.toLowerCase() === "null" ||
      cleaned.includes("...")
    ) {
      return null;
    }

    const parsed = new Date(cleaned);
    if (isNaN(parsed.getTime())) return null;

    return parsed.toISOString().split("T")[0];
  }

  if (typeof value === "number") {
    const date = xlsx.SSF.parse_date_code(value);
    if (!date) return null;

    return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
  }

  return null;
};

const importContracts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = xlsx.utils.sheet_to_json(sheet);

    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
      const job_cd = row.JOB_CD || row.job_cd;
      const contractor_name = row.CONTRACTOR_NAME || row.contractor_name;
      const contractor_address = row.CONTRACTOR_ADDRESS || row.contractor_address;
      const contractor_phone = row.CONTRACTOR_PHN || row.CONTRACTOR_PHONE || row.contractor_phone;
      const work_area = row.WORK_AREA || row.work_area;
      const party_cd = row.PARTY_CD || row.party_cd;
      const dept_cd = row.DEPT_CD || row.dept_cd;
      const job_desc = row.JOB_DESC || row.job_desc;
      const job_start_dt = formatExcelDate(row.JOB_START_DT || row.job_start_dt);
const job_end_dt = formatExcelDate(row.JOB_END_DT || row.job_end_dt);

      if (!job_cd) {
        skipped++;
        continue;
      }

      await pool.query(
        `INSERT INTO contracts
        (job_cd, contractor_name, contractor_address, contractor_phone, work_area, party_cd, dept_cd, job_desc, job_start_dt, job_end_dt)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (job_cd)
        DO UPDATE SET
          contractor_name = EXCLUDED.contractor_name,
          contractor_address = EXCLUDED.contractor_address,
          contractor_phone = EXCLUDED.contractor_phone,
          work_area = EXCLUDED.work_area,
          party_cd = EXCLUDED.party_cd,
          dept_cd = EXCLUDED.dept_cd,
          job_desc = EXCLUDED.job_desc,
          job_start_dt = EXCLUDED.job_start_dt,
          job_end_dt = EXCLUDED.job_end_dt`,
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

      inserted++;
    }

    res.json({
      message: "Contract Excel imported successfully",
      inserted,
      skipped,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error importing contract Excel" });
  }
};

const importWorkers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const workbook = xlsx.readFile(
      req.file.path
    );

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const rows =
      xlsx.utils.sheet_to_json(sheet);

    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
      const job_cd =
        row.JOB_CD || row.job_cd;

      const adhar_id = cleanId(row.ADHAR_ID || row.adhar_id);

      const worker_name =
        row.WORKER_NAME ||
        row.worker_name;

      const worker_desig =
        row.WORKER_DESIG ||
        row.worker_desig;

      const worker_skill =
        row.WORKER_SKILL ||
        row.worker_skill;

      const worker_gender =
        row.WORKER_GENDER ||
        row.worker_gender;

      const dob = formatExcelDate(
        row.DOB || row.dob
      );

      if (
        !job_cd ||
        !adhar_id
      ) {
        skipped++;
        continue;
      }
      const contractCheck = await pool.query(
    "SELECT 1 FROM contracts WHERE job_cd = $1",
    [job_cd]
    );

    if (contractCheck.rows.length === 0) {
    skipped++;
    continue;
    }

      await pool.query(
        `
        INSERT INTO workers
        (
          job_cd,
          adhar_id,
          worker_name,
          dob,
          worker_desig,
          worker_skill,
          worker_gender
        )
        VALUES
        (
          $1,$2,$3,$4,$5,$6,$7
        )
        ON CONFLICT (adhar_id)
        DO UPDATE SET
          job_cd = EXCLUDED.job_cd,
          worker_name = EXCLUDED.worker_name,
          dob = EXCLUDED.dob,
          worker_desig = EXCLUDED.worker_desig,
          worker_skill = EXCLUDED.worker_skill,
          worker_gender = EXCLUDED.worker_gender
        `,
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

      inserted++;
    }

    res.json({
      message:
        "Worker Excel imported successfully",
      inserted,
      skipped,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message:
        "Error importing worker Excel",
    });
  }
};

const importMuster = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const { month } = req.body;

    if (!month) {
      return res.status(400).json({
        message: "Month is required",
      });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
      const adhar_id = cleanId(row.ADHAR_ID || row.adhar_id);
      const worker_name = row.WORKER_NAME || row.worker_name;
      const worker_skill = row.WORKER_SKILL || row.worker_skill;

      const present = Number(row.PRESENT || row.present || 0);
      const absent = Number(row.ABSENT || row.absent || 0);
      const weekly_off = Number(row.WEEKLY_OFF || row.weekly_off || 0);
      const holidays = Number(row.HOLIDAYS || row.holidays || 0);
      const leaves = Number(row.LEAVES || row.leaves || 0);

      if (!adhar_id) {
        skipped++;
        continue;
      }

      const workerCheck = await pool.query(
        "SELECT job_cd, worker_name, worker_skill FROM workers WHERE adhar_id = $1",
        [adhar_id]
      );

      if (workerCheck.rows.length === 0) {
        skipped++;
        continue;
      }

      const worker = workerCheck.rows[0];

      await pool.query(
        `
        INSERT INTO monthly_muster
        (
          adhar_id,
          job_cd,
          worker_name,
          worker_skill,
          present,
          absent,
          weekly_off,
          holidays,
          leaves,
          muster_month
        )
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (adhar_id, muster_month)
        DO UPDATE SET
          job_cd = EXCLUDED.job_cd,
          worker_name = EXCLUDED.worker_name,
          worker_skill = EXCLUDED.worker_skill,
          present = EXCLUDED.present,
          absent = EXCLUDED.absent,
          weekly_off = EXCLUDED.weekly_off,
          holidays = EXCLUDED.holidays,
          leaves = EXCLUDED.leaves
        `,
        [
          adhar_id,
          worker.job_cd,
          worker_name || worker.worker_name,
          worker_skill || worker.worker_skill,
          present,
          absent,
          weekly_off,
          holidays,
          leaves,
          month,
        ]
      );

      inserted++;
    }

    res.json({
      message: "Muster Excel imported successfully",
      inserted,
      skipped,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error importing muster Excel",
    });
  }
};

module.exports = {
  importContracts,
  importWorkers,
  importMuster,
};