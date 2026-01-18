const email = localStorage.getItem("userEmail");
console.log("PROFILE EMAIL:", email);


// HARD STOP if no login
if (!email) {
  alert("Please login first");
  window.location.href = "login.html";
}

// ----------------------------
// LOAD PROFILE
// ----------------------------
async function loadProfile() {
  document.getElementById("userEmail").innerText = email;
  document.getElementById("userName").innerText = email.split("@")[0];

  let sessions = [];

  try {
    const res = await fetch(
      `http://127.0.0.1:8000/profile/sessions?email=${email}`
    );
    sessions = await res.json();
  } catch (e) {
    console.error("Failed to load sessions");
  }

  updateProgress(sessions);
  updateRecentSessions(sessions);
  updateAchievements(sessions);
}

// ----------------------------
// THERAPY PROGRESS
// ----------------------------
function updateProgress(sessions) {
  const count = sessions.length;
  document.getElementById("sessionCount").innerText =
    `Completed Sessions: ${count}`;

  if (count === 0) {
    document.getElementById("avgStress").innerText =
      "Average Stress: —";
    return;
  }

  const avg =
    sessions.reduce((sum, s) => sum + Number(s.avg_stress), 0) / count;

  document.getElementById("avgStress").innerText =
    `Average Stress: ${avg.toFixed(1)}`;
}

// ----------------------------
// RECENT SESSIONS
// ----------------------------
function updateRecentSessions(sessions) {
  const list = document.getElementById("sessionList");
  list.innerHTML = "";

  if (sessions.length === 0) {
    const li = document.createElement("li");
    li.innerText = "No previous sessions. Start your first therapy!";
    list.appendChild(li);
    return;
  }

  sessions.forEach(s => {
    const li = document.createElement("li");
    li.innerText =
      `${s.phobia} (${s.difficulty}) • Avg Stress: ${s.avg_stress}`;
    list.appendChild(li);
  });
}

// ----------------------------
// ACHIEVEMENTS LOGIC
// ----------------------------
function updateAchievements(sessions) {
  const box = document.getElementById("achievementList");
  box.innerHTML = "";

  if (sessions.length === 0) {
    box.innerHTML =
      "<p>No achievements yet. Complete your first session!</p>";
    return;
  }

  // First session
  const first = document.createElement("p");
  first.innerText = "🏅 First Session Completed";
  box.appendChild(first);

  // Consistency
  if (sessions.length >= 3) {
    const streak = document.createElement("p");
    streak.innerText = "🔥 Consistency Streak";
    box.appendChild(streak);
  }

  // Master badge
  if (sessions.length >= 7) {
    const master = document.createElement("p");
    master.innerText = "💎 Therapy Explorer";
    box.appendChild(master);
  }
}

// ----------------------------
function goBack() {
  window.location.href = "index.html";
}

loadProfile();
