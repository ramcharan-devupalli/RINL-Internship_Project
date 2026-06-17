const API_BASE = "http://localhost:5000/api";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

const expenseMonth =
  document.getElementById("expenseMonth");

const loadExpenseBtn =
  document.getElementById("loadExpenseBtn");

const expenseBody =
  document.getElementById("expenseBody");

const totalExpense =
  document.getElementById("totalExpense");

if (!token || !user) window.location.href = "index.html";
if (user.role !== "hr_admin") {
  alert("Access denied. Admin only.");
  window.location.href = "index.html";
}

const sections = document.querySelectorAll(".section");
const navBtns = document.querySelectorAll(".nav-btn");
const pageTitle = document.getElementById("pageTitle");

let users = [];
let contracts = [];
let workers = [];
let muster = [];

navBtns.forEach(btn => {
  btn.addEventListener("click", () => showSection(btn.dataset.section, btn));
});

document.querySelectorAll(".quick-grid button").forEach(btn => {
  btn.addEventListener("click", () => {
    const nav = document.querySelector(`.nav-btn[data-section="${btn.dataset.section}"]`);
    showSection(btn.dataset.section, nav);
  });
});

loadExpenseBtn.addEventListener(
  "click",
  loadExpenseReport
);

async function loadExpenseReport() {
  const month = expenseMonth.value;

  if (!month) {
    alert("Please select a month.");
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/admin/wage-expenses?month=${month}`
    );

    const data = await response.json();

    renderExpenseTable(
      data.jobs,
      data.total_expense
    );
  } catch (err) {
    console.error(err);
    alert("Error loading expense report");
  }
}

function renderExpenseTable(
  jobs,
  total
) {
  if (!jobs.length) {
    expenseBody.innerHTML = `
      <tr>
        <td colspan="5">
          No data found.
        </td>
      </tr>
    `;

    totalExpense.textContent =
      "₹0";

    return;
  }

  expenseBody.innerHTML = jobs
    .map(
      (job) => `
      <tr>
        <td>${job.job_cd}</td>

        <td>
          ${job.contractor_name}
        </td>

        <td>
          ${job.worker_count}
        </td>

        <td>
          ${job.total_present_days}
        </td>

        <td>
          ₹${Number(
            job.wage_expense
          ).toLocaleString("en-IN")}
        </td>
      </tr>
    `
    )
    .join("");

  totalExpense.textContent =
    `₹${Number(total)
      .toLocaleString("en-IN")}`;
}

function showSection(id, btn) {
  sections.forEach(s => s.classList.remove("active"));
  navBtns.forEach(b => b.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (btn) btn.classList.add("active");
  pageTitle.textContent = btn ? btn.childNodes[0].textContent.trim() : "Admin Dashboard";
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

async function loadStats() {
  const res = await fetch(`${API_BASE}/admin/stats`);
  const data = await res.json();

  document.getElementById("totalUsers").textContent = data.total_users;
  document.getElementById("totalContracts").textContent = data.total_contracts;
  document.getElementById("totalWorkers").textContent = data.total_workers;
  document.getElementById("totalMuster").textContent = data.total_muster;
  document.getElementById("totalWage").textContent = `₹${Number(data.total_wage).toLocaleString("en-IN")}`;
}

async function loadUsers() {
  const res = await fetch(`${API_BASE}/admin/users`);
  users = await res.json();
  renderUsers(users);
}

function renderUsers(list) {
  const body = document.getElementById("usersBody");
  body.innerHTML = list.map(u => `
    <tr>
      <td>${u.employee_id || "-"}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.mobile}</td>
      <td>${u.role}</td>
      <td><span class="badge ${u.status === "active" ? "active-badge" : u.status === "inactive" ? "inactive-badge" : "pending-badge"}">${u.status}</span></td>
      <td>
        <button onclick="changeUserStatus(${u.id}, 'active')">Activate</button>
        <button onclick="changeUserStatus(${u.id}, 'inactive')">Deactivate</button>
      </td>
    </tr>
  `).join("");
}

document.getElementById("roleFilter").addEventListener("change", e => {
  const role = e.target.value;
  renderUsers(role ? users.filter(u => u.role === role) : users);
});

async function changeUserStatus(id, status) {
  await fetch(`${API_BASE}/admin/users/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  loadUsers();
  loadStats();
}

async function loadContracts() {
  const res = await fetch(`${API_BASE}/contracts`);
  contracts = await res.json();

  document.getElementById("contractsBody").innerHTML = contracts.map(c => `
    <tr>
      <td>${c.job_cd}</td>
      <td>${c.contractor_name || "-"}</td>
      <td>${c.contractor_phone || "-"}</td>
      <td>${c.work_area || "-"}</td>
      <td>${c.dept_cd || "-"}</td>
      <td>${formatDate(c.job_start_dt)} to ${formatDate(c.job_end_dt)}</td>
      <td>
        <button onclick="editContract('${c.job_cd}')">Edit</button>
        <button onclick="deleteContract('${c.job_cd}')">Delete</button>
      </td>
    </tr>
  `).join("");
}

async function loadWorkers() {
  const res = await fetch(`${API_BASE}/workers`);
  workers = await res.json();

  document.getElementById("workersBody").innerHTML = workers.map(w => `
    <tr>
      <td>${w.adhar_id}</td>
      <td>${w.worker_name}</td>
      <td>${w.job_cd}</td>
      <td>${w.worker_desig || "-"}</td>
      <td>${w.worker_skill}</td>
      <td>${w.worker_gender || "-"}</td>
      <td>
        <button onclick="editWorker(${w.id})">Edit</button>
        <button onclick="deleteWorker(${w.id})">Delete</button>
      </td>
    </tr>
  `).join("");
}

async function loadMuster() {
  const res = await fetch(`${API_BASE}/muster`);
  muster = await res.json();

  document.getElementById("musterBody").innerHTML = muster.map(m => `
    <tr>
      <td>${m.worker_name}</td>
      <td>${m.job_cd}</td>
      <td>${m.muster_month}</td>
      <td>${m.present}</td>
      <td>${m.absent}</td>
      <td>${m.weekly_off}</td>
      <td>${m.holidays}</td>
      <td>${m.leaves}</td>
    </tr>
  `).join("");
}

async function deleteContract(jobCd) {
  if (!confirm(`Delete contract ${jobCd}?`)) return;

  await fetch(`${API_BASE}/contracts/${jobCd}`, {
    method: "DELETE",
  });

  alert("Contract deleted");
  loadContracts();
  loadStats();
}

async function editContract(jobCd) {
  const contract = contracts.find(c => c.job_cd === jobCd);
  if (!contract) return;

  const contractor_name = prompt("Contractor Name", contract.contractor_name || "");
  if (contractor_name === null) return;

  const work_area = prompt("Work Area", contract.work_area || "");
  if (work_area === null) return;

  const dept_cd = prompt("Department Code", contract.dept_cd || "");
  if (dept_cd === null) return;

  await fetch(`${API_BASE}/contracts/${jobCd}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contractor_name,
      contractor_address: contract.contractor_address,
      contractor_phone: contract.contractor_phone,
      work_area,
      party_cd: contract.party_cd,
      dept_cd,
      job_desc: contract.job_desc,
      job_start_dt: contract.job_start_dt,
      job_end_dt: contract.job_end_dt,
    }),
  });

  alert("Contract updated");
  loadContracts();
}

async function deleteWorker(id) {
  if (!confirm("Delete this worker?")) return;

  await fetch(`${API_BASE}/workers/${id}`, {
    method: "DELETE",
  });

  alert("Worker deleted");
  loadWorkers();
  loadStats();
}

async function editWorker(id) {
  const worker = workers.find(w => w.id === id);
  if (!worker) return;

  const worker_name = prompt("Worker Name", worker.worker_name || "");
  if (worker_name === null) return;

  const worker_desig = prompt("Worker Designation", worker.worker_desig || "");
  if (worker_desig === null) return;

  const worker_skill = prompt("Skill Code: SK / SSK / USK / SUP", worker.worker_skill || "");
  if (worker_skill === null) return;

  await fetch(`${API_BASE}/workers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      job_cd: worker.job_cd,
      adhar_id: worker.adhar_id,
      worker_name,
      dob: worker.dob,
      worker_desig,
      worker_skill,
      worker_gender: worker.worker_gender,
    }),
  });

  alert("Worker updated");
  loadWorkers();
}


async function loadRates() {
  const res = await fetch(`${API_BASE}/admin/wage-rates`);
  const rates = await res.json();

  document.getElementById("ratesBody").innerHTML = rates.map(r => `
    <tr>
      <td>${r.worker_skill}</td>
      <td><input type="number" id="rate-${r.worker_skill}" value="${r.daily_wage}" /></td>
      <td><button onclick="updateRate('${r.worker_skill}')">Update</button></td>
    </tr>
  `).join("");
}

async function updateRate(skill) {
  const value = document.getElementById(`rate-${skill}`).value;

  await fetch(`${API_BASE}/admin/wage-rates/${skill}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ daily_wage: value })
  });

  alert("Wage rate updated");
  loadRates();
  loadStats();
}

async function uploadExcel(fileInputId, endpoint, resultId, extraData = {}) {
  const fileInput = document.getElementById(fileInputId);
  const resultBox = document.getElementById(resultId);

  if (!fileInput.files.length) {
    alert("Please select an Excel file.");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  Object.keys(extraData).forEach((key) => {
    formData.append(key, extraData[key]);
  });

  try {
    resultBox.textContent = "Uploading...";

    const response = await fetch(`${API_BASE}/import/${endpoint}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }

    resultBox.textContent =
      `Success: ${data.inserted} imported, ${data.skipped} skipped`;

    loadStats();
    loadContracts();
    loadWorkers();
    loadMuster();
  } catch (err) {
    console.error(err);
    resultBox.textContent = "Upload failed.";
  }
}

document.getElementById("uploadContractExcel").addEventListener("click", () => {
  uploadExcel("contractExcel", "contracts", "contractUploadResult");
});

document.getElementById("uploadWorkerExcel").addEventListener("click", () => {
  uploadExcel("workerExcel", "workers", "workerUploadResult");
});

document.getElementById("uploadMusterExcel").addEventListener("click", () => {
  const month = document.getElementById("musterImportMonth").value;

  if (!month) {
    alert("Please select month for muster import.");
    return;
  }

  uploadExcel("musterExcel", "muster", "musterUploadResult", {
    month,
  });
});

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN");
}

document.getElementById("profileName").textContent = user.name || "-";
document.getElementById("profileEmail").textContent = user.email || "-";
document.getElementById("profileEmployeeId").textContent = user.employee_id || "-";
document.getElementById("profileRole").textContent = user.role || "-";

loadStats();
loadUsers();
loadContracts();
loadWorkers();
loadMuster();
loadRates();