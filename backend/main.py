from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend requests (important!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace "*" with your frontend URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat(req: Request):
    data = await req.json()
    text = data["message"].lower()

    if "nervous" in text or "scared" in text:
        reply = "It’s okay. I’m here. You’re safe."
    elif "happy" in text:
        reply = "Gosh—I'm sooo happy for you!"
    elif "stop" in text or "wait" in text:
        reply = "Okay. I’m listening."
    else:
        reply = "I hear you."

    return {"reply": reply}