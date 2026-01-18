/*

let botInterrupted = false;
let maxStress=0;
let currentDifficulty = localStorage.getItem("selectedDifficulty");

// ================================
// LOAD CONTEXT
// ================================
const phobia = localStorage.getItem("selectedPhobia");
const difficulty = localStorage.getItem("selectedDifficulty");
const email = localStorage.getItem("userEmail");

document.getElementById("practiceTitle").textContent =
  `Non-VR Therapy – ${phobia} (${difficulty})`;

// ================================
// SHOW CORRECT PRACTICE
// ================================
if (phobia === "Public Speaking") {
  document.getElementById("cameraPractice").style.display = "block";
} else if (phobia === "Darkness") {
  document.getElementById("darknessPractice").style.display = "block";
} else if (phobia === "Heights") {
  document.getElementById("heightsPractice").style.display = "block";
} else if (phobia === "Crowds") {
  document.getElementById("crowdsPractice").style.display = "block";
}

// ================================
// CAMERA + MIC PRACTICE
// ================================
const video = document.getElementById("camera");
const stressFill = document.getElementById("stressFill");
const silenceText = document.getElementById("silenceText");
const anxietyLabel = document.getElementById("anxietyLabel");

let sessionActive = false;
let silenceSeconds = 0;
let silenceTimer = null;

// audio
let audioContext, analyser, micSource;

// ---------------- START CAMERA ----------------
async function startCamera() {
  try {
    // CAMERA
    const camStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });
    video.srcObject = camStream;

    // MIC
    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    micSource = audioContext.createMediaStreamSource(micStream);
    micSource.connect(analyser);
    analyser.fftSize = 256;

    // BACKEND START
    await fetch("http://127.0.0.1:8000/practice/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        phobia,
        difficulty
      })
    });

    sessionActive = true;
    silenceSeconds = 0;
    startSilenceTracking();

  } catch (err) {
    alert("Camera or microphone permission denied");
  }
}

// ---------------- SILENCE TRACKING ----------------
function startSilenceTracking() {
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  silenceTimer = setInterval(() => {
    analyser.getByteFrequencyData(dataArray);

    const volume =
      dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;

    if (volume > 12) {
      silenceSeconds = 0; // 🗣 user spoke
    } else {
      silenceSeconds++;  // 🤫 silence
    }

    updateUI();

    //new code

    function checkBotIntervention(stressScore) {
  if (stressScore > 20 && !botInterrupted) {
    botInterrupted = true;

    // 🔊 BOT MESSAGE
    addBotMessage(
      "I notice your stress is increasing. Are you feeling okay, or should we slow things down?"
    );

    // 🔽 AUTO LEVEL DOWN
    downgradeDifficulty();
  }
}

    
    sendStressToBackend();

  }, 1000);
}

// ---------------- UI UPDATE ----------------
function updateUI() {
  silenceText.innerText = `Silence: ${silenceSeconds}s`;

  const stressPercent = Math.min(100, 20 + silenceSeconds * 3);
  stressFill.style.width = `${stressPercent}%`;

  if (silenceSeconds >= 20) {
    anxietyLabel.innerText = "ANXIETY: HIGH";
    anxietyLabel.style.color = "#ff3b3b";
  } else if (silenceSeconds >= 10) {
    anxietyLabel.innerText = "ANXIETY: MEDIUM";
    anxietyLabel.style.color = "#ffa500";
  } else {
    anxietyLabel.innerText = "ANXIETY: LOW";
    anxietyLabel.style.color = "#2ecc71";
  }
}

// ---------------- BACKEND UPDATE ----------------
async function sendStressToBackend() {
  if (!sessionActive) return;

  let stressScore;

  if (silenceSeconds < 5) stressScore = 20;
  else if (silenceSeconds < 10) stressScore = 35;
  else if (silenceSeconds < 15) stressScore = 55;
  else if (silenceSeconds < 20) stressScore = 75;
  else stressScore = 90;

   if (stressScore > maxStress) {
    maxStress = stressScore;
  }

  console.log("SENDING STRESS:", stressScore);

  // 🔥 THIS IS THE KEY
  handleHighStress(stressScore);

  await fetch("http://127.0.0.1:8000/practice/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      stress: stressScore
    })
  });
}


// ================================
// END SESSION
// ================================
async function endSession() {
  if (!sessionActive) return;

  sessionActive = false;
  clearInterval(silenceTimer);

  const res = await fetch("http://127.0.0.1:8000/practice/end", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  console.log("END SESSION:", data);

  document.getElementById("sessionResult").style.display = "block";
  document.getElementById("avgStress").innerText =
    `Average Stress: ${data.summary.avg_stress}`;
  document.getElementById("maxStress").innerText =
    `Max Stress: ${data.summary.max_stress}`;
  document.getElementById("duration").innerText =
    `Duration: ${data.summary.duration} seconds`;

  if (video.srcObject) {
    video.srcObject.getTracks().forEach(t => t.stop());
  }
}

// ================================
// OTHER PRACTICES
// ================================
function startBreathing() {
  alert("Guided breathing started");
}
function startGrounding() {
  alert("Grounding exercise started");
}
function startImaginal() {
  alert("Imaginal exposure started");
}



// new code

function addBotMessage(text) {
  const aiBody = document.getElementById("aiBody");
  if (!aiBody) return;

  const div = document.createElement("div");
  div.className = "ai-msg bot";
  div.innerText = text;
  aiBody.appendChild(div);
  aiBody.scrollTop = aiBody.scrollHeight;
}


function downgradeDifficulty() {
  if (currentDifficulty === "High") {
    currentDifficulty = "Medium";
  } else if (currentDifficulty === "Medium") {
    currentDifficulty = "Low";
  }

  localStorage.setItem("selectedDifficulty", currentDifficulty);

  addBotMessage(
    `I've reduced the difficulty to ${currentDifficulty}. Take a deep breath.`
  );
}



function handleHighStress(stressScore) {
  if (stressScore >= 75 && !botInterrupted) {
    botInterrupted = true;

    addBotMessage(
      "I notice you're getting stressed. Everything okay? We can slow things down."
    );

    reduceDifficulty();
  }
}


function reduceDifficulty() {
  if (currentDifficulty === "High") {
    currentDifficulty = "Medium";
  } else if (currentDifficulty === "Medium") {
    currentDifficulty = "Low";
  }

  localStorage.setItem("selectedDifficulty", currentDifficulty);

  addBotMessage(
    `I've reduced the difficulty to ${currentDifficulty}. Take a deep breath.`
  );
}


function addBotMessage(text) {
  const aiBody = document.getElementById("aiBody");
  if (!aiBody) return;

  const div = document.createElement("div");
  div.className = "ai-msg bot";
  div.innerText = text;
  aiBody.appendChild(div);
  aiBody.scrollTop = aiBody.scrollHeight;
} 


// new code

function handleStressIntervention() {
  if (maxStress >= 25 && !botInterrupted) {
    botInterrupted = true;

    // 🤖 BOT SPEAKS WITHOUT USER
    triggerAIBot(
      "The user seems stressed. Kindly reassure and ask if difficulty should be reduced."
    );

    downgradeDifficulty();
  }
}



async function triggerAIBot(context) {
  const res = await fetch("http://127.0.0.1:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: context
    })
  });

  const data = await res.json();
  speakBot(data.reply);
}



function speakBot(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 0.85;
  msg.pitch = 1;
  msg.volume = 1;

  speechSynthesis.speak(msg);
}

*/