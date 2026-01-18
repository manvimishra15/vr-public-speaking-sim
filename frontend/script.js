/*
  BACKEND TEAM:
  Replace localStorage check with
  JWT / session validation later
*/

const BACKEND_URL = "http://127.0.0.1:8000";
const userEmail = localStorage.getItem("userEmail") || "anonymous";


// Redirect to login if not logged in
if (!localStorage.getItem("isLoggedIn")) {
  window.location.href = "login.html";
}

function toggleTheme() {
  document.body.classList.toggle("light");
}

function openAuth() {
  document.getElementById("authModal").style.display = "flex";
}

window.onclick = function (e) {
  const modal = document.getElementById("authModal");
  if (e.target === modal) {
    modal.style.display = "none";
  }
};

function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "login.html";
}

const featuresSection = document.getElementById("features");

window.addEventListener("scroll", () => {
  const rect = featuresSection.getBoundingClientRect();
  if (rect.top < window.innerHeight / 1.3) {
    featuresSection.classList.add("active");
  }
});

const cards = document.querySelectorAll(".card");

function revealCards() {
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      card.classList.add("reveal");
    }
  });
}

window.addEventListener("scroll", revealCards);
window.addEventListener("load", revealCards);

function toggleAI() {
  const chat = document.querySelector(".ai-chat");
  chat.style.display = chat.style.display === "flex" ? "none" : "flex";
}

function startTherapy(scene) {
  localStorage.setItem("selectedPhobia", scene);
  window.location.href = "therapy.html";
}

// Demo stress animation
let stress = 30;
setInterval(() => {
  stress = Math.floor(Math.random() * 100);
  document.getElementById("stressFill").style.width = stress + "%";
}, 3000);

function toggleProfile() {
  const menu = document.querySelector(".profile-menu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// Difficulty per scene
const difficultyMap = {};
function selectDifficulty(scene, level) {
  difficultyMap[scene] = level;
  alert(`${scene} difficulty set to ${level}`);
}

// Exposure levels
const exposureLevels = {};
function selectExposure(element, scene, level) {
  const siblings = element.parentElement.querySelectorAll("span");
  siblings.forEach(span => span.classList.remove("active"));
  element.classList.add("active");
  exposureLevels[scene] = level;
  console.log(`${scene} exposure set to ${level}`);
}

function goToProfile() {
  window.location.href = "profile.html";
}

function goBack() {
  window.location.href = "index.html";
}

/* =========================
   AI CHAT FUNCTIONALITY
   ========================= */

const aiChat = document.getElementById("aiChat");
const aiBody = document.getElementById("aiBody");
const aiInput = document.getElementById("aiInput");

function appendMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `ai-msg ${sender}`;
  msg.innerText = text;
  aiBody.appendChild(msg);
  aiBody.scrollTop = aiBody.scrollHeight;
}

// Gentle speech output
function speak(text) {
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.85;
  utter.pitch = 1.1;
  speechSynthesis.speak(utter);
}

function getEmotionalReply(text) {
  const t = text.toLowerCase();

  if (t.includes("stop") || t.includes("wait")) return "Okay. I’m listening.";
  if (t.includes("nervous") || t.includes("scared")) return "It’s okay. Slow breath.";
  if (t.includes("panic")) return "You’re safe. I’m here.";
  if (t.includes("happy") || t.includes("excited")) return "Gosh—so happy for you!";
  if (t.includes("sad") || t.includes("lonely")) return "I hear you.";
  return "I’m with you.";
}

async function sendMessage() {
  const message = aiInput.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  aiInput.value = "";

  try {
    const reply = await chatBot(message);   // Calls your Ultravox bot
    appendMessage(reply.response, "bot");   // Shows bot reply in chat
    speak(reply.response);                  // Speaks the bot reply
} catch (err) {
    console.error("Error contacting bot:", err);
    appendMessage("Oops! Something went wrong.", "bot");
}
}

function handleEnter(e) {
  if (e.key === "Enter") sendMessage();
}

/* =========================
   VOICE INPUT (MIC)
   ========================= */

let recognition;
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    aiInput.value = event.results[0][0].transcript;
    sendMessage();
  };

  recognition.onerror = () => {
    alert("Microphone error. Please allow mic access.");
  };
}

function startListening() {
  if (recognition) recognition.start();
}

document.addEventListener("DOMContentLoaded", () => {
  const fab = document.getElementById("aiFab");
  const chat = document.getElementById("aiChat");

  if (!fab || !chat) return;

  fab.addEventListener("click", () => {
    chat.style.display = chat.style.display === "flex" ? "none" : "flex";
  });
});

/* =========================
   ROCKET CURSOR
   ========================= */

const rocket = document.getElementById("rocket-cursor");

let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 2;
let currentX = targetX;
let currentY = targetY;

document.addEventListener("mousemove", (e) => {
  targetX = e.clientX;
  targetY = e.clientY;
});

function smoothFollow() {
  currentX += (targetX - currentX) * 0.12;
  currentY += (targetY - currentY) * 0.12;

  rocket.style.left = currentX + "px";
  rocket.style.top = currentY + "px";

  requestAnimationFrame(smoothFollow);
}

smoothFollow();

async function chatBot(message) {
  const res = await fetch(`${BACKEND_URL}/bot/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  return await res.json();
}


async function startUltravoxCall() {
  try {
    console.log("✅ Start Ultravox clicked");

    const res = await fetch(`${BACKEND_URL}/ultravox/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstMessage: "Hello I feel anxious" })
    });

    const text = await res.text();
    console.log("✅ Status:", res.status);
    console.log("✅ Raw:", text);

    if (!res.ok) throw new Error(text);

    const data = JSON.parse(text);

    if (data.joinUrl) window.open(data.joinUrl, "_blank");
    else alert("Call created ✅ but joinUrl missing. Check console.");

  } catch (err) {
    console.error("❌ Ultravox fetch failed:", err);
    alert("❌ Backend not reachable. Run uvicorn + check /docs");
  }
}
