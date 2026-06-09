const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

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

const workers = [];

const workerForm = document.getElementById("workerForm");
const workerTableBody = document.getElementById("workerTableBody");
const attendanceTableBody = document.getElementById("attendanceTableBody");

workerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const worker = {
    name: document.getElementById("workerName").value.trim(),
    mobile: document.getElementById("workerMobile").value.trim(),
    skill: document.getElementById("workerSkill").value,
    dailyWage: document.getElementById("dailyWage").value,
    aadhaarLast4: document.getElementById("aadhaarLast4").value.trim(),
    status: "Active",
  };

  workers.push(worker);
  workerForm.reset();
  renderWorkers();
  renderAttendance();
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
        <td>${worker.name}</td>
        <td>${worker.mobile}</td>
        <td>${worker.skill}</td>
        <td>₹${worker.dailyWage}</td>
        <td>${worker.status}</td>
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
        <td>${worker.name}</td>
        <td>${worker.skill}</td>
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