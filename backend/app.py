from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import csv
import os
from typing import Optional

import cv2
import numpy as np
import threading
import time

from models import LoginInput, PracticeStart, PracticeUpdate, PracticeEnd
from practice_engine import start_session, update_stress, end_session
from storage import save_practice_session, get_user_sessions

# =========================
# APP INIT (ONLY ONCE)
# =========================
app = FastAPI(title="MindScapeXR Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# =========================
# USER STORAGE
# =========================
USERS_FILE = "users.csv"

if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, "w", newline="") as f:
        csv.writer(f).writerow(["email", "password"])

# =========================
# AUTH
# =========================
@app.post("/login")
def login(data: LoginInput):
    with open(USERS_FILE, newline="") as f:
        for row in csv.DictReader(f):
            if row["email"] == data.email and row["password"] == data.password:
                return {"success": True}
    raise HTTPException(401, "Invalid credentials")


@app.post("/register")
def register(data: LoginInput):
    with open(USERS_FILE, newline="") as f:
        for row in csv.DictReader(f):
            if row["email"] == data.email:
                raise HTTPException(400, "User exists")

    with open(USERS_FILE, "a", newline="") as f:
        csv.writer(f).writerow([data.email, data.password])

    return {"success": True}

# =========================
# PRACTICE SESSION
# =========================

@app.post("/practice/start")
def practice_start(data: PracticeStart):
    difficulty = data.difficulty or "Medium"

    print(
        "🟢 START:",
        data.email,
        data.phobia,
        difficulty,
        "| MODE:",
        data.mode
    )

    start_session(data.email, data.phobia, difficulty)
    return {"success": True}


@app.post("/practice/update")
def practice_update(data: PracticeUpdate):
    print("🟡 UPDATE:", data.email, data.stress)
    update_stress(data.email, data.stress)
    return {"success": True}


@app.post("/practice/end")
def practice_end(data: PracticeEnd):
    print("🔴 END:", data.email)
    result = end_session(data.email)

    if not result:
        raise HTTPException(400, "No active session")

    save_practice_session(
        data.email,
        result["phobia"],
        result["difficulty"],
        result["avg_stress"],
        result["max_stress"],
        result["total_silence"],
        result["duration"]
    )

    print("✅ CSV SAVED")
    return {"success": True, "summary": result}


@app.get("/profile/sessions")
def profile_sessions(email: str):
    return get_user_sessions(email)

# =========================
# CHAT (DUMMY – STABLE)
# =========================
class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(req: ChatRequest):
    print("💬 CHAT HIT:", req.message)
    return {
        "reply": "I’m here with you. I noticed your stress is rising. Should I slow things down?"
    }

# =========================
# HEALTH CHECK
# =========================
@app.get("/")
def root():
    return {"status": "backend alive"}


from dotenv import load_dotenv
import os
import requests
from fastapi import HTTPException

from dotenv import load_dotenv
import os
import requests

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")
load_dotenv(ENV_PATH)

ULTRAVOX_AGENT_ID = os.getenv("ULTRAVOX_AGENT_ID")
ULTRAVOX_API_KEY = os.getenv("ULTRAVOX_API_KEY")

@app.post("/bot/chat")
def bot_chat(req: ChatRequest):
    try:
        if not ULTRAVOX_AGENT_ID or not ULTRAVOX_API_KEY:
            raise HTTPException(500, "Ultravox credentials missing (.env not loaded)")

        # TEMP: Just return to confirm backend works
        return {"response": f"✅ Backend ok. You said: {req.message}"}

    except HTTPException as e:
        raise e
    except Exception as e:
        print("❌ BOT ERROR:", str(e))
        raise HTTPException(500, str(e))


from pydantic import BaseModel
import requests
from fastapi import HTTPException

class StartUltravoxCall(BaseModel):
    firstMessage: str = "Hi, I feel anxious. Help me calm down."

@app.post("/ultravox/start")
def ultravox_start(data: StartUltravoxCall):
    if not ULTRAVOX_AGENT_ID or not ULTRAVOX_API_KEY:
        raise HTTPException(500, "Ultravox credentials missing")

    url = f"https://api.ultravox.ai/api/agents/{ULTRAVOX_AGENT_ID}/calls"

    headers = {
        "X-API-Key": ULTRAVOX_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "templateContext": {},
        "initialMessages": [
            {
                "role": "MESSAGE_ROLE_USER",
                "text": data.firstMessage
            }
        ]
    }

    r = requests.post(url, json=payload, headers=headers, timeout=20)

    if r.status_code >= 400:
        raise HTTPException(r.status_code, r.text)

    call_data = r.json()

    # ✅ IMPORTANT: Ultravox uses joinUrl (capital U)
    return {
        "callId": call_data.get("callId"),
        "joinUrl": call_data.get("joinUrl"),
        "raw": call_data
    }
