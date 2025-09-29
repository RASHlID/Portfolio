const STORAGE_KEY = "fitness.workouts.v1";
let workouts = [];

const form = document.getElementById("workoutForm");
const workoutList = document.getElementById("workoutList");

const totalWorkoutsEl = document.getElementById("totalWorkouts");
const totalDurationEl = document.getElementById("totalDuration");
const avgDurationEl   = document.getElementById("avgDuration");


function loadWorkouts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    workouts = raw ? JSON.parse(raw) : [];
  } catch {
    workouts = [];
  }
}
function saveWorkouts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}


function renderWorkouts() {
  workoutList.innerHTML = "";
  workouts.forEach(w => {
    const li = document.createElement("li");
    li.className = `workout-item ${typeClass(w.type)}`;
    li.innerHTML = `
      <strong>${escapeHTML(w.type)}</strong> — ${Number(w.duration)} min
      ${w.notes ? `<br><em>${escapeHTML(w.notes)}</em>` : ""}
    `;
    workoutList.appendChild(li);
  });
}


function updateStats() {
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum, w) => sum + Number(w.duration || 0), 0);
  const avgDuration = totalWorkouts ? Math.round(totalDuration / totalWorkouts) : 0;

  totalWorkoutsEl.querySelector(".stat-value").textContent = totalWorkouts;
  totalDurationEl.querySelector(".stat-value").textContent = `${totalDuration} min`;
  avgDurationEl.querySelector(".stat-value").textContent = `${avgDuration} min`;
}


function typeClass(type) {
  const t = (type || "").toLowerCase();
  if (t === "cardio") return "type-cardio";
  if (t === "strength") return "type-strength";
  if (t === "hiit") return "type-hiit";
  if (t === "yoga") return "type-yoga";
  return "";
}
function escapeHTML(str) {
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}


form.addEventListener("submit", (e) => {
  e.preventDefault();
  const type = document.getElementById("type").value.trim();
  const duration = document.getElementById("duration").value;
  const notes = document.getElementById("notes").value.trim();

  if (!type || !duration) return;

  workouts.push({
    type,
    duration: Number(duration),
    notes
  });

  saveWorkouts();
  renderWorkouts();
  updateStats();
  form.reset();
});


loadWorkouts();
renderWorkouts();
updateStats();
