import time

# In-memory session store
sessions = {}


def start_session(email, phobia, difficulty=None):
    """
    Starts a new practice session for a user.
    """
    sessions[email] = {
        "phobia": phobia,
        "difficulty": difficulty or "Medium",
        "stress_samples": [],   # list of (timestamp, stress)
        "start_time": time.time(),
        "last_update": time.time()
    }


def update_stress(email, stress):
    """
    Records a stress value for an active session.
    """
    if email not in sessions:
        return

    now = time.time()
    session = sessions[email]

    session["stress_samples"].append((now, stress))
    session["last_update"] = now


def end_session(email):
    """
    Ends the session and returns computed analytics.
    """
    if email not in sessions:
        return None

    session = sessions.pop(email)

    stresses = [s for _, s in session["stress_samples"]]

    avg_stress = round(sum(stresses) / len(stresses), 2) if stresses else 0
    max_stress = max(stresses) if stresses else 0
    duration = int(time.time() - session["start_time"])

    return {
        "phobia": session["phobia"],
        "difficulty": session["difficulty"],
        "avg_stress": avg_stress,
        "max_stress": max_stress,
        "total_silence": 0,   # intentionally 0 (not inferred backend-side)
        "duration": duration
    }
