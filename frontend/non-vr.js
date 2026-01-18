
const BACKEND_URL = "http://127.0.0.1:8000";
const userEmail = localStorage.getItem("userEmail") || "anonymous";



const motivatingPhrases = [
  "You are calm and in control.",
  "Your voice deserves to be heard.",
  "Pause. Breathe. Continue.",
  "It’s okay to take your time.",
  "You are doing better than you think.",
  "Confidence grows with every word.",
  "Mistakes are part of progress.",
  "Your message matters.",
  "Stay present. Stay steady.",
  "You’ve got this. Keep going."
];
// ===============================
// NON-VR PRACTICES PER PHOBIA
// ===============================

const practicesByPhobia = {
  Claustrophobia: [
    { type: "breathing", title: "🫁 Box Breathing", text: "Inhale 4s → Hold → Exhale → Hold" },
    { type: "narrow", title: "📱 Visual Narrowing", text: "Focus on shrinking visual frame" },
    { type: "visualize", title: "🧠 Safe Space Visualization", text: "Imagine a safe open place" },
    { type: "timer", title: "⏱️ Timer Enclosure", text: "Stay briefly, expand gradually" },
    { type: "ground", title: "✋ Grounding Touch", text: "Touch solid objects nearby" }
  ],

  "Public Speaking": [
    { type: "camera", title: "📸 Mirror Practice", text: "Speak while seeing yourself" },
    { type: "voice", title: "🎙️ Voice Control", text: "Slow, steady speaking" },
    { type: "structure", title: "🧠 Speech Structuring", text: "Organize thoughts clearly" },
    { type: "timer", title: "⏱️ Timed Speaking", text: "Speak for 2 minutes" },
    { type: "posture", title: "✋ Posture Reset", text: "Relax shoulders and breathe" }
  ],

  Darkness: [
    { type: "dark", title: "🌑 Darkness Exposure", text: "Sit calmly in dim light" },
    { type: "breathing", title: "🫁 Calm Breathing", text: "Slow breathing with eyes closed" },
    { type: "audio", title: "🎧 Sound Anchoring", text: "Focus on calming sounds" },
    { type: "visualize", title: "🧠 Safe Visualization", text: "Picture a safe space" },
    { 
  type: "pressure", 
  title: "👐 Pressure–Release Grounding", 
  text: "Tense and release muscles to calm your body" 
}
 
  ],

  Heights: [
    { type: "ground", title: "✋ Grounding", text: "Feel feet touching ground" },
    { type: "breathing", title: "🫁 Calm Breathing", text: "Steady breathing" },
    { type: "visualize", title: "🧠 Height Visualization", text: "Imagine height safely" },
    { type: "timer", title: "⏱️ Timed Exposure", text: "Short visualization sessions" },
    { type: "reframe", title: "🧠 Reframing", text: "Replace fear thoughts" }
  ],

  Crowds: [
    { type: "audio", title: "🎧 Crowd Audio", text: "Listen calmly to crowd sounds" },
    { type: "breathing", title: "🫁 Paced Breathing", text: "Slow rhythmic breathing" },
    { type: "label", title: "🧠 Thought Labeling", text: "This is anxiety, not danger" },
    { type: "visualize", title: "🧠 Crowd Visualization", text: "Imagine crowds safely" },
    { type: "timer", title: "⏱️ Timed Exposure", text: "Short controlled exposure" }
  ]
};

// ===============================
// INIT
// ===============================

const phobia = localStorage.getItem("selectedPhobia") || "Claustrophobia";
const grid = document.getElementById("nonVrGrid");

document.getElementById("practiceTitle").innerText =
  `Non-VR Therapy for ${phobia}`;

// ===============================
// RENDER PRACTICES
// ===============================

practicesByPhobia[phobia].forEach(practice => {
  const card = document.createElement("div");
  card.className = "practice-card";
  card.innerHTML = practice.title;
  card.onclick = () => startPractice(practice);
  grid.appendChild(card);
});

// ===============================
// RUN PRACTICE
// ===============================

function startPractice(practice) {
  document.getElementById("practiceArea").classList.remove("hidden");
  document.getElementById("activePracticeTitle").innerText = practice.title;
  document.getElementById("activePracticeText").innerText = practice.text;

  const visual = document.getElementById("practiceVisual");
  visual.innerHTML = "";

  if (practice.type === "breathing") runBreathing(visual);
  if (practice.type === "timer") runTimedSpeaking(visual);

  if (practice.type === "narrow") runNarrowing(visual);
  if (practice.type === "camera") runCamera(visual);
  if (practice.type === "dark") runDarknessExposure(visual);
  if (practice.type === "visualize") runSafeVisualization(visual);
  if (practice.type === "dark") runAdaptiveDarkness(visual);
  if (practice.type === "pressure") runPressureRelease(visual);
  if (practice.type === "audio") {
    visual.innerHTML = `
      <h2 style="font-size:1.8rem; line-height:1.6; text-align:center;">
        🎧 Safe Presence Audio<br>
        <span style="font-size:1.1rem; opacity:0.85;">
          A calming voice is guiding you
        </span>
      </h2>
    `;
    playSafePresenceAudio();
  }
}

// ===============================
// PRACTICE LOGIC
// ===============================

function runBreathing(container) {
  container.innerHTML = "";

  const circle = document.createElement("div");
  circle.className = "breathing-circle";
  circle.style.display = "flex";
  circle.style.alignItems = "center";
  circle.style.justifyContent = "center";
  circle.style.fontSize = "1.2rem";
  circle.style.fontWeight = "600";
  circle.style.color = "#050510";

  const text = document.createElement("span");
  text.innerText = "Inhale";
  circle.appendChild(text);

  container.appendChild(circle);

  const phases = [
    { label: "Inhale", duration: 4000 },
    { label: "Hold", duration: 4000 },
    { label: "Exhale", duration: 4000 },
    { label: "Hold", duration: 4000 }
  ];

  let index = 0;

  function nextPhase() {
    const phase = phases[index];
    text.innerText = phase.label;

    index = (index + 1) % phases.length;
    setTimeout(nextPhase, phase.duration);
  }

  nextPhase();
}


function runTimer(container) {
  let time = 120;
  const t = document.createElement("h2");
  t.innerText = time;
  container.appendChild(t);

  const interval = setInterval(() => {
    time--;
    t.innerText = time;
    if (time === 0) clearInterval(interval);
  }, 1000);
}

function runNarrowing(container) {
  const box = document.createElement("div");
  box.className = "narrow-box";
  container.appendChild(box);
}

async function runCamera(container) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "center";
  wrapper.style.gap = "16px";

  const video = document.createElement("video");
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.style.width = "360px";
  video.style.height = "260px";
  video.style.borderRadius = "20px";
  video.style.background = "black";
  video.style.boxShadow = "0 0 40px rgba(0,229,255,0.6)";
  video.setAttribute("playsinline", true);


  const emotionText = document.createElement("h3");
  emotionText.innerText = "Emotion: Waiting 🟢";

  const silenceText = document.createElement("p");
  silenceText.innerText = "Status: Waiting…";

  const stressBar = document.createElement("div");
  stressBar.className = "stress-bar";

  const stressFill = document.createElement("div");
  stressFill.className = "stress-fill";
  stressBar.appendChild(stressFill);

  const videoBtn = document.createElement("button");
videoBtn.innerText = "Start Video";

const audioBtn = document.createElement("button");
audioBtn.innerText = "Start Audio";

const startBtn = document.createElement("button");
startBtn.innerText = "Start Session";
startBtn.disabled = true; // enabled only after audio starts


  const endBtn = document.createElement("button");
  endBtn.innerText = "End Session";
  endBtn.disabled = true;

  const summary = document.createElement("div");
  summary.className = "session-summary hidden";

wrapper.append(
  video,
  emotionText,
  silenceText,
  stressBar,
  videoBtn,
  audioBtn,
  startBtn,
  endBtn,
  summary
);

  container.appendChild(wrapper);

  let stream;
  let analyser;
  let audioCtx;
  let interval;
  let stressValues = [];
  let silenceCounter = 0;
  let startTime;
  let stress = 30;
  let videoStream = null;
  let audioStream = null;
videoBtn.onclick = async () => {
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = videoStream;
    await video.play();

    silenceText.innerText = "Status: Camera On 📷";
  } catch (e) {
    alert("Camera permission denied");
    console.error(e);
  }
};
audioBtn.onclick = async () => {
  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioCtx = new AudioContext();
    await audioCtx.resume();

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    const mic = audioCtx.createMediaStreamSource(audioStream);
    mic.connect(analyser);

    startBtn.disabled = false;
    silenceText.innerText = "Status: Mic Ready 🎧";
  } catch (e) {
    alert("Microphone permission denied");
    console.error(e);
  }
};


  // ✅ START SESSION (USER GESTURE)
  startBtn.onclick = async () => {
  if (!analyser) {
    alert("Start audio first");
    return;
  }
    await fetch(`${BACKEND_URL}/practice/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: userEmail,
      phobia: phobia,
      mode: "non-vr"
    })
  });

  startBtn.disabled = true;
  endBtn.disabled = false;
  summary.classList.add("hidden");

  stressValues = [];
  stress = 30;
  startTime = Date.now();

  const buffer = new Uint8Array(analyser.fftSize);

  interval = setInterval(() => {
    analyser.getByteTimeDomainData(buffer);

    let peak = 0;
    for (let i = 0; i < buffer.length; i++) {
      const v = Math.abs(buffer[i] - 128);
      if (v > peak) peak = v;
    }

    const speaking = peak > 6;

    if (speaking) {
      silenceText.innerText = "Status: Speaking 🎤";
      emotionText.innerText = "Emotion: Calm 🟢";
      stress = Math.max(5, stress - 6);
    } else {
      silenceText.innerText = "Status: Silent 🤫";
      emotionText.innerText = "Emotion: Stressed 🔴";
      stress = Math.min(100, stress + 8);
    }

    stressValues.push(stress);
    stressFill.style.width = stress + "%";
    fetch(`${BACKEND_URL}/practice/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: userEmail,
      stress: stress
    })
  });
  }, 300);
};
endBtn.onclick = () => {
  
   fetch(`${BACKEND_URL}/practice/end`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: userEmail
  })
});
clearInterval(interval);

  if (videoStream) videoStream.getTracks().forEach(t => t.stop());
  if (audioStream) audioStream.getTracks().forEach(t => t.stop());
  if (audioCtx) audioCtx.close();

  emotionText.innerText = "Emotion: Neutral ⚪";
  silenceText.innerText = "Status: Session Ended";

  const duration = Math.floor((Date.now() - startTime) / 1000);
  const avgStress = Math.floor(
    stressValues.reduce((a, b) => a + b, 0) / stressValues.length
  );
  const maxStress = Math.max(...stressValues);

  summary.innerHTML = `
    <h3>Session Summary</h3>
    <p>Average Stress: <b>${avgStress}%</b></p>
    <p>Max Stress: <b>${maxStress}%</b></p>
    <p>Duration: <b>${duration}s</b></p>
  `;
  summary.classList.remove("hidden");

  startBtn.disabled = true;
  endBtn.disabled = true;
};



function endPractice() {
  document.querySelectorAll("audio").forEach(a => {
  a.pause();
  a.currentTime = 0;
});

  document.getElementById("practiceArea").classList.add("hidden");
  document.getElementById("practiceVisual").innerHTML = "";
   if (safePresenceAudio) {
    safePresenceAudio.pause();
    safePresenceAudio.currentTime = 0;
  }
}
function runTimedSpeaking(container) {
  container.innerHTML = "";

  let time = 120; // 2 minutes
  let phraseIndex = Math.floor(Math.random() * motivatingPhrases.length);

  // BIG TEXT
  const phrase = document.createElement("div");
  phrase.style.fontSize = "2.2rem";
  phrase.style.fontWeight = "600";
  phrase.style.margin = "30px 0";
  phrase.style.textAlign = "center";
  phrase.style.lineHeight = "1.4";
  phrase.innerText = motivatingPhrases[phraseIndex];

  // TIMER
  const timerText = document.createElement("h2");
  timerText.innerText = formatTime(time);

  container.appendChild(phrase);
  container.appendChild(timerText);

  const interval = setInterval(() => {
    time--;
    timerText.innerText = formatTime(time);

    // 🔁 Change phrase every 15 seconds
    if (time % 15 === 0) {
      phraseIndex = Math.floor(Math.random() * motivatingPhrases.length);
      phrase.innerText = motivatingPhrases[phraseIndex];
    }

    if (time <= 0) {
      clearInterval(interval);
      phrase.innerText = "Well done 👏 You completed the session!";
      timerText.innerText = "Done ✅";
    }
  }, 1000);
}
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function runDarknessExposure(container) {
  container.innerHTML = "";

  // Title
  const text = document.createElement("p");
  text.innerText = "Adjust darkness slowly. Stay calm and breathe.";
  text.style.fontSize = "1.2rem";
  text.style.marginBottom = "20px";

  // Overlay for darkness
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "black";
  overlay.style.opacity = "0";
  overlay.style.pointerEvents = "none";
  overlay.style.zIndex = "0";
  overlay.style.transition = "opacity 0.5s ease";
  overlay.id = "darknessOverlay";

  document.body.appendChild(overlay);

  // Slider
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "90";
  slider.value = "0";
  slider.style.width = "300px";

  // Label
  const label = document.createElement("p");
  label.innerText = "Darkness Level: 0%";

  slider.oninput = () => {
    const value = slider.value;
    overlay.style.opacity = value / 100;
    label.innerText = `Darkness Level: ${value}%`;
  };

  // Cleanup button
  const resetBtn = document.createElement("button");
  resetBtn.innerText = "End Darkness Exposure";
  resetBtn.style.marginTop = "20px";

  resetBtn.onclick = () => {
    overlay.remove();
    container.innerHTML = "";
  };

  container.append(text, label, slider, resetBtn);
}

function runSafeVisualization(container) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "center";
  wrapper.style.gap = "16px";

  // Guidance text
  const guide = document.createElement("p");
  guide.innerText =
    "Close your eyes. Imagine a place where you feel safe, open, and calm. Let the sound guide you.";
  guide.style.maxWidth = "360px";
  guide.style.opacity = "0.9";

  // Audio element
  const audio = document.createElement("audio");
  audio.loop = true;

  // Sound options
  const sounds = [
    { name: "🌧 Rain", src: "sounds/calming-rain-257596.mp3" },
    { name: "🌲 Forest", src: "sounds/forest-461593.mp3" },
    { name: "🌊 Ocean", src: "sounds/ocean-waves-376898.mp3" },
    { name: "💨 Wind", src: "sounds/wind-blowing-457954.mp3" },
    { name: "🔥 Fireplace", src: "sounds/fireplace-jim-17820.mp3" },
    { name: "🎵 Soft Music", src: "sounds/violin-music-64019.mp3" }
  ];

  const buttons = document.createElement("div");
  buttons.style.display = "flex";
  buttons.style.flexWrap = "wrap";
  buttons.style.gap = "10px";
  buttons.style.justifyContent = "center";
buttons.style.background = "rgba(255,255,255,0.08)";
buttons.style.padding = "16px";
buttons.style.borderRadius = "20px";
buttons.style.backdropFilter = "blur(12px)";

  sounds.forEach(sound => {
    const btn = document.createElement("button");
    btn.innerText = sound.name;

    btn.onclick = () => {
      audio.src = sound.src;
      audio.play();
    };

    buttons.appendChild(btn);
  });

  // Stop button
  const stopBtn = document.createElement("button");
  stopBtn.innerText = "⏹ Stop Sound";
  stopBtn.onclick = () => audio.pause();

  wrapper.append(guide, buttons, stopBtn);
  container.appendChild(wrapper);
}
async function runAdaptiveDarkness(container) {
  container.innerHTML = "";

  const title = document.createElement("h3");
  title.innerText = "Adaptive Darkness Support Therapy";

  const info = document.createElement("p");
  info.innerText =
    "We will gently increase screen light if panic is detected in darkness.";

  // 🌑 Darkness overlay
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0,0,0,0.4)";
  overlay.style.transition = "background 0.8s ease";
  overlay.style.pointerEvents = "none";

  // 🎥 Hidden camera (only for sensing)
  const video = document.createElement("video");
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.style.display = "none";

  container.append(title, info, video);
  document.body.appendChild(overlay);

  try {
 
  await video.play();

  console.log("Camera started successfully");
} catch (err) {
  console.error("Camera error:", err);
  alert("Camera permission denied or unavailable.");
  return;
}


  // 🎤 AUDIO ANALYSIS (panic detection)
  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;

  const mic = audioCtx.createMediaStreamSource(stream);
  mic.connect(analyser);

  const audioData = new Uint8Array(analyser.fftSize);

  // 📸 CANVAS FOR DARKNESS DETECTION
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  setInterval(() => {
    /* ---------- DARKNESS DETECTION ---------- */
    canvas.width = video.videoWidth || 160;
    canvas.height = video.videoHeight || 120;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let brightness = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      brightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    }
    brightness /= pixels.length / 4;

    const roomDark = brightness < 50; // 🔑 darkness threshold

    /* ---------- PANIC DETECTION ---------- */
    analyser.getByteTimeDomainData(audioData);

    let peak = 0;
    for (let i = 0; i < audioData.length; i++) {
      const v = Math.abs(audioData[i] - 128);
      if (v > peak) peak = v;
    }

    const panicking = peak > 10;

    /* ---------- ADAPTIVE RESPONSE ---------- */
    if (roomDark && panicking) {
  // Panic detected → brighten screen
  overlay.style.background = "rgba(0,0,0,0.15)";
} 
else if (roomDark) {
  // Calm darkness exposure
  overlay.style.background = "rgba(0,0,0,0.45)";
} 
else {
  // Normal lighting
  overlay.style.background = "rgba(0,0,0,0)";
}

  }, 500);

}


function runPressureRelease(container) {
  container.innerHTML = "";

  const text = document.createElement("h2");
  text.style.fontSize = "1.6rem";
  text.style.textAlign = "center";
  text.style.marginTop = "20px";
  text.style.lineHeight = "1.6";

  container.appendChild(text);

  const steps = [
    "Sit comfortably and place your feet on the ground.",
    "Clench your fists tightly for 5 seconds.",
    "Release… notice the relaxation.",
    "Press your feet into the floor for 5 seconds.",
    "Release… feel the ground supporting you.",
    "Tighten your shoulders for 5 seconds.",
    "Release… let them drop naturally.",
    "Take a slow breath in…",
    "And slowly breathe out.",
    "You are safe. Your body is calming down."
  ];

  let index = 0;
  text.innerText = steps[index];

  const interval = setInterval(() => {
    index++;
    if (index >= steps.length) {
      clearInterval(interval);
      text.innerText = "Exercise complete. Stay relaxed for a moment.";
    } else {
      text.innerText = steps[index];
    }
  }, 4000); // 4 seconds per instruction
}
let safeAudioUtterance = null;

function playSafePresenceAudio() {
  const text = `
  You are not alone.
  I am right here with you.

  Take a slow breath in.
  And gently breathe out.

  The darkness is calm.
  It is quiet.
  It is safe.

  Feel the ground beneath you.
  Feel your body supported.

  Nothing is expected from you.
  Just listen.
  Just breathe.

  You are safe.
  You are in control.
  `;

  // Stop any existing speech
  speechSynthesis.cancel();

  safeAudioUtterance = new SpeechSynthesisUtterance(text);
  safeAudioUtterance.rate = 0.85;   // slow & calming
  safeAudioUtterance.pitch = 1;
  safeAudioUtterance.volume = 1;

  // Loop gently
  safeAudioUtterance.onend = () => {
    speechSynthesis.speak(safeAudioUtterance);
  };

  speechSynthesis.speak(safeAudioUtterance);
} // Closing brace for playSafePresenceAudio function
} // Closing brace for the entire script