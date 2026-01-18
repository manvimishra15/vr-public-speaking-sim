console.log("login.js LOADED");

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://127.0.0.1:8000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(async (res) => {
    const data = await res.json();

    if (res.ok && data.success) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      window.location.href = "index.html";
    } else {
      alert(data.message || data.detail || "Login failed");
    }
  })
  .catch(() => alert("Backend not reachable"));
}

function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://127.0.0.1:8000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(async (res) => {
    const data = await res.json();

    if (res.ok && data.success) {
      alert("Registration successful. Please login.");
    } else {
      alert(data.message || data.detail || "Registration failed");
    }
  })
  .catch(() => alert("Backend not reachable"));
}
