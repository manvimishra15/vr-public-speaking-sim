import os
import time
import speech_recognition as sr
import pyttsx3
from dotenv import load_dotenv
from openai import OpenAI

# ================================
# LOAD API KEY
# ================================
load_dotenv()
client = OpenAI(api_key=os.getenv("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"))


# ================================
# VOICE OUTPUT (TEXT → SPEECH)
# ================================
def speak(text):
    print("🤖 Aura:", text)
    engine = pyttsx3.init("sapi5")
    voices = engine.getProperty("voices")
    engine.setProperty("voice", voices[1].id)  # female voice
    engine.setProperty("rate", 135)
    engine.setProperty("volume", 1.0)
    engine.say(text)
    engine.runAndWait()
    engine.stop()
    time.sleep(0.3)

# ================================
# VOICE INPUT (SPEECH → TEXT)
# ================================
recognizer = sr.Recognizer()
mic = sr.Microphone()

def listen():
    with mic as source:
        recognizer.adjust_for_ambient_noise(source, duration=0.6)
        print("🎤 Listening...")
        audio = recognizer.listen(source, phrase_time_limit=10)
    try:
        return recognizer.recognize_google(audio)
    except:
        return None

# ================================
# EMOTIONAL SYSTEM PROMPT
# ================================
SYSTEM_PROMPT = """
You are an emotionally intelligent AI companion named Aura.

You speak gently, warmly, and confidently.
You comfort, hype up, reassure, and calm the user.
You validate feelings before advice.
You sound human, caring, and present.

Rules:
- Nervous/anxious → slow down, breathe together
- Angry → validate anger, ground gently
- Scared → reassure safety and presence
- Happy → hype them up warmly
- Sad/lonely → comfort deeply
- Address the user as Kritika sometimes
- Keep replies short, soothing, and human
"""

conversation = [
    {"role": "system", "content": SYSTEM_PROMPT}
]

# ================================
# START BOT
# ================================
speak("Hey Kritika. I’m here with you. You can talk to me anytime.")

while True:
    user_text = listen()

    if user_text is None:
        speak("I’m still here. Take your time.")
        continue

    print("🧍 You:", user_text)

    if user_text.lower() in ["exit", "quit", "stop"]:
        speak("I’m really glad you talked to me. I’m always here for you.")
        break

    conversation.append({"role": "user", "content": user_text})

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=conversation,
        temperature=0.7
    )

    reply = response.choices[0].message.content
    conversation.append({"role": "assistant", "content": reply})

    speak(reply)