const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getRolePrefix = (role) => {
  const prefixes = {
    supervisor: "SUP",
    contractor_representative: "CTR",
    skilled_worker: "SKW",
    semi_skilled_worker: "SSW",
    unskilled_worker: "USW",
    hr_admin: "ADM",
  };

  return prefixes[role] || "USR";
};

const generateEmployeeId = async (role) => {
  const prefix = getRolePrefix(role);

  const result = await pool.query(
    "SELECT COUNT(*) FROM users WHERE role = $1 AND employee_id IS NOT NULL",
    [role]
  );

  const count = parseInt(result.rows[0].count) + 1;
  const padded = count.toString().padStart(4, "0");

  return `RINL-${prefix}-${padded}`;
};

const signup = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    if (!name || !email || !mobile || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR mobile = $2",
      [email, mobile]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email or mobile already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users 
       (name, email, mobile, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5)`,
      [name, email, mobile, passwordHash, role]
    );

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      "INSERT INTO otp_verifications (email, otp, expires_at) VALUES ($1, $2, $3)",
      [email, otp, expiresAt]
    );

    await sendEmail(
    email,
  "Worker Portal Email Verification OTP",
  `Your OTP for Worker Portal signup is ${otp}. It is valid for 10 minutes.`
);

console.log("Email OTP sent:", otp);

res.status(201).json({
  message: "Signup successful. OTP sent to email."
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during signup" });
  }
};

const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await pool.query(
      `SELECT * FROM otp_verifications 
       WHERE email = $1 AND otp = $2 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date(result.rows[0].expires_at) < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const userResult = await pool.query(
  "SELECT * FROM users WHERE email = $1",
  [email]
);

const user = userResult.rows[0];

let employeeId = user.employee_id;

if (!employeeId) {
  employeeId = await generateEmployeeId(user.role);

  await pool.query(
    "UPDATE users SET email_verified = TRUE, employee_id = $1 WHERE email = $2",
    [employeeId, email]
  );
} else {
  await pool.query(
    "UPDATE users SET email_verified = TRUE WHERE email = $1",
    [email]
  );
}

res.json({
  message: "Email verified successfully",
  employee_id: employeeId,
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
};

const login = async (req, res) => {
  try {
    const { employee_id, role, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE employee_id = $1 AND role = $2",
      [employee_id, role]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid ID, role, or password" });
    }

    const user = result.rows[0];

    if (!user.email_verified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid ID, role, or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
};

module.exports = {
  signup,
  verifyEmailOtp,
  login
};