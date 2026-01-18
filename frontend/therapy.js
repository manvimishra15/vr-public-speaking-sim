const phobia = localStorage.getItem("selectedPhobia");
document.getElementById("phobiaTitle").textContent =
  `Therapy Options for ${phobia}`;

function startVR() {
  alert("Launching VR therapy...");
  // Backend team will start VR session here
}



function startPractice(type) {
  const modal = document.getElementById("practiceModal");
  const title = document.getElementById("practiceTitle");
  const text = document.getElementById("practiceText");
  const visual = document.getElementById("practiceVisual");

  visual.innerHTML = "";
  modal.style.display = "flex";

  if (type === "breathing") {
    title.innerText = "🫁 Box Breathing";
    text.innerText =
      "Inhale for 4 seconds → Hold → Exhale → Hold. Repeat calmly.";
    breathingAnimation(visual);
  }

  if (type === "visual") {
    title.innerText = "📱 Visual Narrowing";
    text.innerText =
      "Focus on the shrinking frame. You are safe and in control.";
    narrowingAnimation(visual);
  }

  if (type === "visualize") {
    title.innerText = "🧠 Safe Space Visualization";
    text.innerText =
      "Close your eyes. Imagine a small space that feels safe and calm.";
  }

  if (type === "timer") {
    title.innerText = "⏱️ Timer Enclosure";
    startTimer(visual);
    text.innerText =
      "Stay in place until the timer ends. You can stop anytime.";
  }

  if (type === "ground") {
    title.innerText = "✋ Grounding Touch";
    text.innerText =
      "Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.";
  }
}

function closePractice() {
  document.getElementById("practiceModal").style.display = "none";
}
function breathingAnimation(container) {
  const circle = document.createElement("div");
  circle.style.width = "80px";
  circle.style.height = "80px";
  circle.style.borderRadius = "50%";
  circle.style.background = "#00e5ff";
  circle.style.margin = "20px auto";
  circle.style.animation = "breathe 4s infinite";
  container.appendChild(circle);
}

function narrowingAnimation(container) {
  const box = document.createElement("div");
  box.style.width = "100%";
  box.style.height = "120px";
  box.style.border = "2px solid white";
  box.style.animation = "narrow 6s infinite";
  container.appendChild(box);
}

function startTimer(container) {
  let time = 30;
  const timer = document.createElement("h2");
  timer.innerText = time;
  container.appendChild(timer);

  const interval = setInterval(() => {
    time--;
    timer.innerText = time;
    if (time === 0) clearInterval(interval);
  }, 1000);
}
// ===============================
// PHOBIA → NON-VR THERAPIES MAP
// ===============================

const nonVrTherapies = {
  Heights: [
    { icon: "🫁", title: "Box Breathing", text: "Inhale 4s, hold 4s, exhale 4s." },
    { icon: "👀", title: "Horizon Focus", text: "Focus on stable objects at eye level." },
    { icon: "🧠", title: "Cognitive Reframing", text: "Repeat: I am safe, this will pass." },
    { icon: "✋", title: "Grounding Touch", text: "Press your feet firmly into the ground." },
    { icon: "⏱️", title: "Timed Visualization", text: "Visualize heights for short intervals." }
  ],

  "Public Speaking": [
    { icon: "📸", title: "Mirror Practice", text: "Speak while watching yourself." },
    { icon: "🎙️", title: "Voice Modulation", text: "Practice slow, steady speaking." },
    { icon: "🧠", title: "Speech Structuring", text: "Organize thoughts into bullet points." },
    { icon: "⏱️", title: "Timed Speaking", text: "Speak for 1–2 minutes continuously." },
    { icon: "✋", title: "Posture Reset", text: "Relax shoulders, slow breathing." }
  ],

  Darkness: [
    { icon: "🔦", title: "Light Fade", text: "Gradually reduce screen brightness." },
    { icon: "🧠", title: "Safe Place Visualization", text: "Imagine a safe, calm space." },
    { icon: "🎧", title: "Sound Anchoring", text: "Focus on calming audio." },
    { icon: "🫁", title: "Breathing in Darkness", text: "Slow breathing with eyes closed." },
    { icon: "⏱️", title: "Dark Timer", text: "Sit calmly in darkness for short time." }
  ],

  Claustrophobia: [
    { icon: "🫁", title: "Box Breathing", text: "Control breath to calm the body." },
    { icon: "📱", title: "Visual Narrowing", text: "Reduce visual field gradually." },
    { icon: "🧠", title: "Safe Space Visualization", text: "Imagine an open, safe place." },
    { icon: "⏱️", title: "Timer Enclosure", text: "Stay briefly, then expand space." },
    { icon: "✋", title: "Grounding Touch", text: "Touch a solid surface nearby." }
  ],

  Crowds: [
    { icon: "🧠", title: "Thought Labeling", text: "Name the anxiety without judgment." },
    { icon: "🎧", title: "Audio Exposure", text: "Listen to crowd sounds calmly." },
    { icon: "🫁", title: "Paced Breathing", text: "Slow breathing rhythm." },
    { icon: "✋", title: "Sensory Anchor", text: "Focus on one physical sensation." },
    { icon: "⏱️", title: "Timed Visualization", text: "Imagine crowds briefly." }
  ]
};

// ===============================
// INIT
// ===============================

const selectedPhobia = localStorage.getItem("selectedPhobia") || "Claustrophobia";

document.getElementById("phobiaTitle").innerText =
  `Therapy Options for ${selectedPhobia}`;

document.getElementById("nonVrTitle").innerText =
  `Non-VR ${selectedPhobia} Therapy`;

// ===============================
// SHOW NON-VR
// ===============================

function showNonVR() {
  document.getElementById("nonVrSection").classList.remove("hidden");
  renderNonVrTherapies();
}

// ===============================
// RENDER THERAPIES
// ===============================

function renderNonVrTherapies() {
  const grid = document.getElementById("therapyGrid");
  grid.innerHTML = "";

  nonVrTherapies[selectedPhobia].forEach((therapy) => {
    const card = document.createElement("div");
    card.className = "non-vr-card";
    card.innerHTML = `${therapy.icon}<br>${therapy.title}`;
    card.onclick = () => openPractice(therapy);
    grid.appendChild(card);
  });
}

// ===============================
// PRACTICE MODAL
// ===============================

function openPractice(therapy) {
  document.querySelectorAll(".non-vr-card").forEach(c => c.classList.remove("active"));
  event.currentTarget.classList.add("active");

  document.getElementById("practiceTitle").innerText = therapy.title;
  document.getElementById("practiceText").innerText = therapy.text;

  document.getElementById("practiceModal").classList.remove("hidden");
}

function closePractice() {
  document.getElementById("practiceModal").classList.add("hidden");
}
function startVR() {
  // VR integration will be connected later (Unity / WebXR)
  console.log("VR Therapy selected");

  // Keep this redirect ready for later
  // window.location.href = "vr.html";
}

function startNonVR() {
  // store selected fear
  localStorage.setItem("therapyType", "non-vr");

  window.location.href = "non-vr.html";
}
const fear = localStorage.getItem("selectedPhobia");