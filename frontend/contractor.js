const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));
const API_BASE = "http://localhost:5000/api";
let contracts = [];
const contractForm = document.getElementById("contractForm");
const contractTableBody = document.getElementById("contractTableBody");
const workerJobCd = document.getElementById("workerJobCd");

const musterJobCd = document.getElementById("musterJobCd");
const musterMonth = document.getElementById("musterMonth");
const loadMusterWorkersBtn = document.getElementById("loadMusterWorkersBtn");
const musterTableBody = document.getElementById("musterTableBody");
const saveMusterBtn = document.getElementById("saveMusterBtn");

let selectedMusterWorkers = [];

if (!token || !user) {
  window.location.href = "index.html";
}

if (user.role !== "contractor_representative") {
  alert("Access denied. Contractor dashboard only.");
  window.location.href = "index.html";
}

const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");
const pageTitle = document.getElementById("pageTitle");
const welcomeText = document.getElementById("welcomeText");
const userPill = document.getElementById("userPill");

welcomeText.textContent = `Welcome, ${user.name}`;
userPill.textContent = user.employee_id || "Contractor";

document.getElementById("profileName").textContent = user.name || "-";
document.getElementById("profileEmail").textContent = user.email || "-";
document.getElementById("profileMobile").textContent = user.mobile || "-";
document.getElementById("profileEmployeeId").textContent = user.employee_id || "-";
document.getElementById("profileRole").textContent = user.role || "-";

function showSection(sectionId) {
  sections.forEach((section) => section.classList.remove("active"));
  navButtons.forEach((btn) => btn.classList.remove("active"));

  document.getElementById(sectionId).classList.add("active");

  const activeBtn = document.querySelector(`[data-section="${sectionId}"]`);
  if (activeBtn) activeBtn.classList.add("active");

  pageTitle.textContent = activeBtn ? activeBtn.textContent : "Dashboard";
}

async function fetchWorkers() {
  try {
    const response = await fetch(`${API_BASE}/workers`);
    const data = await response.json();

    workers = data;

    renderWorkers();
    renderAttendance();
  } catch (err) {
    console.error("Error loading workers:", err);
  }
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    showSection(btn.dataset.section);
  });
});

document.querySelectorAll(".quick-actions button").forEach((btn) => {
  btn.addEventListener("click", () => {
    showSection(btn.dataset.section);
  });
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  window.location.href = "index.html";
});

let workers = [];

const workerForm = document.getElementById("workerForm");
const workerTableBody = document.getElementById("workerTableBody");
const attendanceTableBody = document.getElementById("attendanceTableBody");

workerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const worker = {
      job_cd: document.getElementById("workerJobCd").value,
      adhar_id: Date.now().toString(),
      worker_name: document.getElementById("workerName").value.trim(),
      dob: "2000-01-01",
      worker_desig: "Worker",
      worker_skill: document.getElementById("workerSkill").value,
      worker_gender: "Male",
    };

    const response = await fetch(`${API_BASE}/workers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(worker),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    workerForm.reset();

    fetchWorkers();

    alert("Worker added successfully");
  } catch (err) {
    console.error(err);
    alert("Error adding worker");
  }
});

function renderWorkers() {
  if (workers.length === 0) {
    workerTableBody.innerHTML = `<tr><td colspan="5">No workers added yet.</td></tr>`;
    return;
  }

  workerTableBody.innerHTML = workers
    .map(
      (worker) => `
      <tr>
        <td>${worker.worker_name}</td>
        <td>${worker.adhar_id}</td>
        <td>${worker.worker_skill}</td>
        <td>${worker.worker_desig}</td>
        <td>Active</td>
      </tr>
    `
    )
    .join("");
}

function renderAttendance() {
  if (workers.length === 0) {
    attendanceTableBody.innerHTML = `<tr><td colspan="3">Add or import workers first.</td></tr>`;
    return;
  }

  attendanceTableBody.innerHTML = workers
    .map(
      (worker) => `
      <tr>
        <td>${worker.worker_name}</td>
        <td>${worker.worker_skill}</td>
        <td>
          <select>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </td>
      </tr>
    `
    )
    .join("");
} 

async function fetchContracts() {
  try {
    const response = await fetch(`${API_BASE}/contracts`);
    const data = await response.json();

    contracts = data;
    renderContracts();
    renderContractOptions();
  } catch (err) {
    console.error("Error loading contracts:", err);
  }
}

function renderContracts() {
  if (contracts.length === 0) {
    contractTableBody.innerHTML = `<tr><td colspan="5">No contracts added yet.</td></tr>`;
    return;
  }

  contractTableBody.innerHTML = contracts
    .map(
      (contract) => `
      <tr>
        <td>${contract.job_cd}</td>
        <td>${contract.contractor_name || "-"}</td>
        <td>${contract.work_area || "-"}</td>
        <td>${contract.dept_cd || "-"}</td>
        <td>${contract.job_start_dt || "-"} to ${contract.job_end_dt || "-"}</td>
      </tr>
    `
    )
    .join("");
}

function renderContracts() {
  if (contracts.length === 0) {
    contractTableBody.innerHTML = `<tr><td colspan="5">No contracts added yet.</td></tr>`;
    return;
  }

  contractTableBody.innerHTML = contracts
    .map(
      (contract) => `
      <tr>
        <td>${contract.job_cd}</td>
        <td>${contract.contractor_name || "-"}</td>
        <td>${contract.work_area || "-"}</td>
        <td>${contract.dept_cd || "-"}</td>
        <td>${contract.job_start_dt || "-"} to ${contract.job_end_dt || "-"}</td>
      </tr>
    `
    )
    .join("");
}

function renderContractOptions() {
  workerJobCd.innerHTML = `<option value="">Select contract</option>`;
  musterJobCd.innerHTML = `<option value="">Select contract</option>`;

  contracts.forEach((contract) => {
    const option = `
      <option value="${contract.job_cd}">
        ${contract.job_cd} - ${contract.contractor_name || "Contract"}
      </option>
    `;

    workerJobCd.innerHTML += option;
    musterJobCd.innerHTML += option;
  });
}

loadMusterWorkersBtn.addEventListener("click", () => {
  const selectedJob = musterJobCd.value;

  if (!selectedJob) {
    alert("Please select a contract.");
    return;
  }

  selectedMusterWorkers = workers.filter(
    (worker) => worker.job_cd === selectedJob
  );

  renderMusterTable();
});

function renderMusterTable() {
  if (selectedMusterWorkers.length === 0) {
    musterTableBody.innerHTML = `
      <tr>
        <td colspan="7">No workers found for selected contract.</td>
      </tr>
    `;
    return;
  }

  musterTableBody.innerHTML = selectedMusterWorkers
    .map(
      (worker) => `
      <tr data-adhar="${worker.adhar_id}">
        <td>${worker.worker_name}</td>
        <td>${worker.worker_skill}</td>
        <td><input type="number" class="muster-present" min="0" value="0" /></td>
        <td><input type="number" class="muster-absent" min="0" value="0" /></td>
        <td><input type="number" class="muster-weekly-off" min="0" value="0" /></td>
        <td><input type="number" class="muster-holidays" min="0" value="0" /></td>
        <td><input type="number" class="muster-leaves" min="0" value="0" /></td>
      </tr>
    `
    )
    .join("");
}

saveMusterBtn.addEventListener("click", async () => {
  if (!musterJobCd.value || !musterMonth.value) {
    alert("Please select contract and month.");
    return;
  }

  if (selectedMusterWorkers.length === 0) {
    alert("Load workers first.");
    return;
  }

  try {
    const rows = musterTableBody.querySelectorAll("tr");

    for (const row of rows) {
      const adharId = row.dataset.adhar;
      const worker = selectedMusterWorkers.find(
        (w) => w.adhar_id === adharId
      );

      const muster = {
        adhar_id: worker.adhar_id,
        job_cd: worker.job_cd,
        worker_name: worker.worker_name,
        worker_skill: worker.worker_skill,
        present: Number(row.querySelector(".muster-present").value),
        absent: Number(row.querySelector(".muster-absent").value),
        weekly_off: Number(row.querySelector(".muster-weekly-off").value),
        holidays: Number(row.querySelector(".muster-holidays").value),
        leaves: Number(row.querySelector(".muster-leaves").value),
        muster_month: musterMonth.value,
      };

      const response = await fetch(`${API_BASE}/muster`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(muster),
      });

      if (!response.ok) {
        throw new Error("Error saving muster");
      }
    }

    alert("Monthly muster saved successfully");
  } catch (err) {
    console.error(err);
    alert("Error saving monthly muster");
  }
});

contractForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const contract = {
    job_cd: document.getElementById("jobCd").value.trim(),
    contractor_name: document.getElementById("contractorName").value.trim(),
    contractor_address: document.getElementById("contractorAddress").value.trim(),
    contractor_phone: document.getElementById("contractorPhone").value.trim(),
    work_area: document.getElementById("workArea").value.trim(),
    party_cd: document.getElementById("partyCd").value.trim(),
    dept_cd: document.getElementById("deptCd").value.trim(),
    job_desc: document.getElementById("jobDesc").value.trim(),
    job_start_dt: document.getElementById("jobStartDt").value || null,
    job_end_dt: document.getElementById("jobEndDt").value || null,
  };

  try {
    const response = await fetch(`${API_BASE}/contracts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contract),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    contractForm.reset();
    fetchContracts();
    alert("Contract added successfully");
  } catch (err) {
    console.error(err);
    alert("Error adding contract");
  }
});
fetchContracts();
fetchWorkers();