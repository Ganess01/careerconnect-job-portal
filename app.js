const jobsList = document.getElementById("jobsList");
const emptyState = document.getElementById("emptyState");
const totalJobsEl = document.getElementById("totalJobs");
const savedCountEl = document.getElementById("savedCount");

const searchInput = document.getElementById("searchInput");
const locationFilter = document.getElementById("locationFilter");
const typeFilter = document.getElementById("typeFilter");

const clearBtn = document.getElementById("clearBtn");
const showSavedBtn = document.getElementById("showSavedBtn");
const addDemoBtn = document.getElementById("addDemoBtn");

// Modal
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const applyForm = document.getElementById("applyForm");
const formMsg = document.getElementById("formMsg");

let showSavedOnly = false;

const JOBS_KEY = "jobhunter_jobs";
const SAVED_KEY = "jobhunter_saved";

const defaultJobs = [
  { id: 1, title: "MERN Stack Intern", company: "Intelyhood", location: "Indore", type: "Internship", salary: "₹8k-15k", posted: "Today" },
  { id: 2, title: "Frontend Developer", company: "StartupX", location: "Remote", type: "Internship", salary: "₹10k", posted: "1 day ago" },
  { id: 3, title: "JavaScript Developer", company: "TechWave", location: "Bhopal", type: "Full-time", salary: "₹3-5 LPA", posted: "2 days ago" },
];

function loadJobs() {
  const saved = localStorage.getItem(JOBS_KEY);
  if (!saved) {
    localStorage.setItem(JOBS_KEY, JSON.stringify(defaultJobs));
    return defaultJobs;
  }
  return JSON.parse(saved);
}

function saveJobs(jobs) {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

function loadSaved() {
  return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
}

function saveSaved(ids) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
}

function updateCounts(allJobs, savedIds) {
  totalJobsEl.textContent = allJobs.length;
  savedCountEl.textContent = savedIds.length;
}

function matchesFilters(job) {
  const q = searchInput.value.trim().toLowerCase();
  const loc = locationFilter.value;
  const type = typeFilter.value;

  const textMatch =
    job.title.toLowerCase().includes(q) ||
    job.company.toLowerCase().includes(q);

  const locMatch = loc === "all" ? true : job.location === loc;
  const typeMatch = type === "all" ? true : job.type === type;

  const savedOnlyMatch = !showSavedOnly ? true : loadSaved().includes(job.id);

  return (q ? textMatch : true) && locMatch && typeMatch && savedOnlyMatch;
}

function render() {
  const jobs = loadJobs();
  const savedIds = loadSaved();
  updateCounts(jobs, savedIds);

  jobsList.innerHTML = "";

  const filtered = jobs.filter(matchesFilters);

  if (filtered.length === 0) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  filtered.forEach((job) => {
    const isSaved = savedIds.includes(job.id);

    const card = document.createElement("div");
    card.className = "job";
    card.innerHTML = `
      <div class="job-top">
        <div>
          <h3>${job.title}</h3>
          <div class="meta">
            <span class="badge">${job.company}</span>
            <span class="badge">${job.location}</span>
            <span class="badge">${job.type}</span>
            <span class="badge">${job.salary}</span>
            <span class="badge">${job.posted}</span>
          </div>
        </div>
        <button class="icon-btn" title="Save job" data-save="${job.id}">
          ${isSaved ? "❤️" : "🤍"}
        </button>
      </div>

      <div class="actions">
        <button class="btn small outline" data-details="${job.id}">Details</button>
        <button class="btn small" data-apply="${job.id}">Apply</button>
        <button class="btn small secondary" data-delete="${job.id}">Delete</button>
      </div>
    `;

    jobsList.appendChild(card);
  });
}

function addDemoJobs() {
  saveJobs(defaultJobs);
  render();
}

function toggleSave(id) {
  const saved = loadSaved();
  const idx = saved.indexOf(id);
  if (idx === -1) saved.push(id);
  else saved.splice(idx, 1);
  saveSaved(saved);
  render();
}

function deleteJob(id) {
  const jobs = loadJobs().filter(j => j.id !== id);
  saveJobs(jobs);

  // also remove from saved
  const saved = loadSaved().filter(x => x !== id);
  saveSaved(saved);

  render();
}

function openModal(job) {
  modalTitle.textContent = `Apply: ${job.title} @ ${job.company}`;
  formMsg.textContent = "";
  applyForm.reset();
  modal.classList.remove("hidden");
  modal.dataset.jobId = String(job.id);
}

function closeModalFn() {
  modal.classList.add("hidden");
  delete modal.dataset.jobId;
}

function showDetails(job) {
  alert(
    `${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nType: ${job.type}\nSalary: ${job.salary}\nPosted: ${job.posted}\n\nTip: Add more details in a new page later.`
  );
}

// Events
[searchInput, locationFilter, typeFilter].forEach(el =>
  el.addEventListener("input", render)
);

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  locationFilter.value = "all";
  typeFilter.value = "all";
  showSavedOnly = false;
  showSavedBtn.textContent = "Show Saved";
  render();
});

showSavedBtn.addEventListener("click", () => {
  showSavedOnly = !showSavedOnly;
  showSavedBtn.textContent = showSavedOnly ? "Showing Saved" : "Show Saved";
  render();
});

addDemoBtn.addEventListener("click", addDemoJobs);

jobsList.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const saveId = btn.dataset.save;
  const applyId = btn.dataset.apply;
  const detailsId = btn.dataset.details;
  const deleteId = btn.dataset.delete;

  if (saveId) return toggleSave(Number(saveId));
  if (deleteId) return deleteJob(Number(deleteId));

  const jobs = loadJobs();
  if (applyId) {
    const job = jobs.find(j => j.id === Number(applyId));
    if (job) openModal(job);
  }
  if (detailsId) {
    const job = jobs.find(j => j.id === Number(detailsId));
    if (job) showDetails(job);
  }
});

closeModal.addEventListener("click", closeModalFn);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModalFn();
});

applyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const jobId = Number(modal.dataset.jobId);

  // simple validation
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const message = document.getElementById("message").value.trim();

  if (phone.length < 10) {
    formMsg.textContent = "❌ Please enter a valid phone number.";
    return;
  }

  // Save application history
  const historyKey = "jobhunter_applications";
  const history = JSON.parse(localStorage.getItem(historyKey) || "[]");
  history.push({ jobId, name, email, phone, message, time: new Date().toISOString() });
  localStorage.setItem(historyKey, JSON.stringify(history));

  formMsg.textContent = "✅ Application submitted (saved locally).";
  setTimeout(closeModalFn, 900);
});

// Init
render();