import csv
import os
from datetime import datetime
import os
print("📂 CSV PATH:", os.path.abspath("practice_sessions.csv"))


FILE = "practice_sessions.csv"

if not os.path.exists(FILE):
    with open(FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "email",
            "phobia",
            "difficulty",
            "avg_stress",
            "max_stress",
            "total_silence",
            "duration",
            "timestamp"
        ])

def save_practice_session(
    email,
    phobia,
    difficulty,
    avg_stress,
    max_stress,
    total_silence,
    duration
):


    print("💾 CSV WRITE:", email)
    with open(FILE, "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            email,
            phobia,
            difficulty,
            avg_stress,
            max_stress,
            total_silence,
            duration,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ])

def get_user_sessions(email, limit=5):
    if not os.path.exists(FILE):
        return []

    data = []
    with open(FILE, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["email"] == email:
                data.append(row)

    return data[-limit:]



VR_FILE = "vr_progress.csv"

if not os.path.exists(VR_FILE):
    with open(VR_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["username", "levels_completed"])

def save_vr_progress(username, levels_completed):
    rows = []

    if os.path.exists(VR_FILE):
        with open(VR_FILE, newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row["username"] == username:
                    row["levels_completed"] = levels_completed
                rows.append(row)

    if not any(r["username"] == username for r in rows):
        rows.append({
            "username": username,
            "levels_completed": levels_completed
        })

    with open(VR_FILE, "w", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["username", "levels_completed"]
        )
        writer.writeheader()
        writer.writerows(rows)

def get_vr_progress(username):
    if not os.path.exists(VR_FILE):
        return 0

    with open(VR_FILE, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["username"] == username:
                return int(row["levels_completed"])

    return 0

